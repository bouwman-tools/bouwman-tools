import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as beheer from '../access-beheer-worker.js';

// Alle rechten, API-antwoorden en credentials hieronder zijn synthetisch.
const realFetch = globalThis.fetch;
const realError = console.error;
const realLog = console.log;
afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
  console.log = realLog;
});

function fixture({ raw = JSON.stringify({ 'synthetic@example.invalid': 'all' }), fail, alwaysFail = false } = {}) {
  const writes = new Map();
  const reads = [];
  const gets = [];
  const puts = [];
  const responses = [];
  const policies = new Map();
  const logs = [];
  let injected = false;
  let fetchCount = 1; // Reserveer ook de JWKS-fetch van een echt beheerverzoek.
  console.error = (...args) => logs.push(args.join(' '));
  console.log = (...args) => logs.push(args.join(' '));
  globalThis.fetch = async (url, options = {}) => {
    if (++fetchCount > 50) throw new Error('Too many subrequests by single Worker invocation');
    const href = String(url);
    if (href === 'https://bouwman.tools/tools.json') {
      return Response.json({ tools: [], portaalworkers: [] });
    }
    if (href.endsWith('/workers/scripts')) return Response.json({ result: [] });
    if (href.endsWith('/policies')) {
      gets.push(href);
      if (fail && (!injected || alwaysFail)) {
        injected = true;
        return fail();
      }
      return Response.json({ success: true, result: [
        policies.get(href) || { id: 'synthetic-policy', include: [] },
      ] });
    }
    if (href.endsWith('/policies/synthetic-policy') && options.method === 'PUT') {
      puts.push(href);
      policies.set(href.slice(0, -'/synthetic-policy'.length), JSON.parse(options.body));
      const response = Response.json({ success: true, result: { id: 'synthetic-policy' } });
      responses.push(response);
      return response;
    }
    throw new Error('Niet-gemockt verzoek: ' + href);
  };
  return {
    env: { CF_API_TOKEN: 'synthetic-not-a-credential', PERMISSIONS: {
      async get(key) { reads.push(key); return key === 'data' ? raw : null; },
      async put(key, value) { writes.set(key, JSON.parse(value)); },
    } },
    writes, reads, gets, puts, responses, logs,
    resetBudget() { fetchCount = 1; },
    get fetchCount() { return fetchCount; },
  };
}

for (const [name, fail] of [
  ['netwerkfout', () => { throw new Error('Synthetische netwerkfout'); }],
  ['ongeldige JSON', () => new Response('<html>synthetic-private-marker</html>')],
  ['HTTP 401', () => new Response('synthetic-private-marker', { status: 401 })],
]) {
  test(`synchronisatie telt ${name} eenmaal, gaat verder en bewaart status`, async () => {
    const f = fixture({ fail });
    const result = await beheer.syncCFAccess({ 'synthetic@example.invalid': 'all' }, f.env,
      ['portal.html', 'Join-jaarrekening-review.html', 'auto-fiscaal-2027.html']);
    const status = f.writes.get('sync-status');
    assert.ok(status, 'Ook bij fouten wordt de syncstatus opgeslagen');
    assert.deepEqual(result, status);
    assert.equal(status.mislukt, 1);
    assert.equal(status.fouten.length, 1);
    assert.equal(status.gelukt, f.puts.length);
    assert.ok(status.gelukt > 1, 'Latere apps worden nog verwerkt');
    assert.equal(status.gelukt + status.mislukt, f.gets.length);
    assert.equal(f.writes.has('data'), false);
    assert.equal(JSON.stringify(status).includes('synthetic-private-marker'), false);
    assert.equal(f.logs.join('\n').includes('synthetic-private-marker'), false);
  });
}

for (const raw of ['{invalid-json', 'null']) {
  test(`scheduled bewaart een foutstatus bij ongeldige rechtenopslag (${raw})`, async () => {
    const f = fixture({ raw });
    await beheer.default.scheduled({}, f.env, { waitUntil() { assert.fail('Geen achtergrondtaak verwacht'); } });
    const status = f.writes.get('controle-status');
    assert.ok(status, 'Een opslagfout mag geen oude controlestatus laten staan');
    assert.ok(status.afwijkingen?.length > 0 || status.reden || status.fout,
      'De controlestatus vermeldt dat controle niet kon worden uitgevoerd');
    assert.equal(f.puts.length, 0, 'Ongeldige opslag mag geen policies overschrijven');
    assert.equal(f.writes.has('data'), false);
  });
}

test('meerdere begrensde rondes herstellen alle 33 apps en eindigen met een volledige leescontrole', async () => {
  const f = fixture();
  let result, hash, rounds = 0;
  const budgets = [];
  do {
    f.resetBudget();
    const before = f.puts.length;
    result = await beheer.synchroniseerEnControleer(f.env, undefined, hash);
    hash = result.bronHash;
    budgets.push(f.fetchCount);
    assert.ok(f.fetchCount <= 48, `Ronde ${rounds + 1} gebruikte ${f.fetchCount} subrequests`);
    assert.ok(f.puts.length - before <= 6);
    if (rounds === 0) {
      assert.equal(f.puts.length, 6);
      assert.equal(result.controle.resterend, 27);
      assert.equal(result.voortzetten, true);
    }
    assert.ok(++rounds <= 10, 'Geen eindeloze vervolgverzoeken');
  } while (result.voortzetten);
  const sync = f.writes.get('sync-status');
  const controle = f.writes.get('controle-status');
  assert.ok(sync);
  assert.ok(controle);
  assert.equal(sync.mislukt, 0);
  assert.equal(result.ok, true);
  assert.equal(f.puts.length, 33);
  assert.equal(sync.gelukt, 0, 'De laatste ronde leest uitsluitend');
  assert.equal(sync.ongewijzigd, 33);
  assert.equal(controle.gecontroleerd, 33);
  assert.equal(controle.resterend, 0);
  assert.equal(budgets.at(-1), 36, '33 policies, 2 workercontroles en 1 gereserveerde JWKS');
  assert.deepEqual(controle.afwijkingen, []);
  assert.deepEqual(controle.workers.ontbreekt, []);
  assert.ok(Number.isFinite(Date.parse(sync.tijdstip)));
  assert.ok(Number.isFinite(Date.parse(controle.tijdstip)));
  assert.ok(f.reads.includes('data'));
  assert.deepEqual([...f.writes.keys()].sort(), ['controle-status', 'sync-status']);
  assert.ok(f.responses.every(response => response.bodyUsed),
    'Alle succesvolle PUT-responsebodies worden geconsumeerd of geannuleerd');
});

test('blijvende netwerkfouten leiden niet tot eindeloze vervolgverzoeken', async () => {
  const f = fixture({ alwaysFail: true, fail() { throw new Error('synthetic-private-marker'); } });
  const result = await beheer.synchroniseerEnControleer(f.env);
  assert.equal(result.ok, false);
  assert.equal(result.voortzetten, false);
  assert.equal(result.controle.afwijkingen.length, 33);
  assert.equal(f.puts.length, 0);
  assert.ok(f.fetchCount <= 48);
  assert.equal(JSON.stringify(result).includes('synthetic-private-marker'), false);
});

test('afwijkende bronhash breekt af voordat policies of opslag worden geschreven', async () => {
  const f = fixture();
  const result = await beheer.synchroniseerEnControleer(f.env, undefined, 'synthetic-stale-hash');
  assert.equal(result.ok, false);
  assert.ok(result.error);
  assert.equal(Boolean(result.voortzetten), false);
  assert.equal(f.puts.length, 0);
  assert.equal(f.gets.length, 0);
  assert.equal(f.writes.size, 0);
});

test('scheduled blijft onder 48 requests en rapporteert resterend herstel bij 33 afwijkingen', async () => {
  const f = fixture();
  await beheer.default.scheduled({}, f.env, { waitUntil() { assert.fail('Geen achtergrondtaak verwacht'); } });
  assert.ok(f.fetchCount <= 48);
  assert.equal(f.puts.length, 6);
  const controle = f.writes.get('controle-status');
  assert.equal(controle.gecontroleerd, 33);
  assert.equal(controle.hersteld, 6);
  assert.equal(controle.resterend, 27);
  assert.equal(controle.afwijkingen.length, 27);
  assert.equal(f.writes.has('data'), false);
});
