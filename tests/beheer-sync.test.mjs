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

function fixture({ raw = JSON.stringify({ 'synthetic@example.invalid': 'all' }), fail } = {}) {
  const writes = new Map();
  const reads = [];
  const gets = [];
  const puts = [];
  const responses = [];
  const policies = new Map();
  const logs = [];
  let injected = false;
  console.error = (...args) => logs.push(args.join(' '));
  console.log = (...args) => logs.push(args.join(' '));
  globalThis.fetch = async (url, options = {}) => {
    const href = String(url);
    if (href === 'https://bouwman.tools/tools.json') {
      return Response.json({ tools: [], portaalworkers: [] });
    }
    if (href.endsWith('/workers/scripts')) return Response.json({ result: [] });
    if (href.endsWith('/policies')) {
      gets.push(href);
      if (fail && !injected) {
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
  };
}

for (const [name, fail] of [
  ['netwerkfout', () => { throw new Error('Synthetische netwerkfout'); }],
  ['ongeldige JSON', () => new Response('<html>synthetic-private-marker</html>')],
  ['HTTP 401', () => new Response('synthetic-private-marker', { status: 401 })],
]) {
  test(`synchronisatie telt ${name} eenmaal, gaat verder en bewaart status`, async () => {
    const f = fixture({ fail });
    const result = await beheer.syncCFAccess({ 'synthetic@example.invalid': 'all' }, f.env);
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

test('synchroniseren en nacontroleren bewaart actuele, overeenkomende statussen zonder rechten te wijzigen', async () => {
  const f = fixture();
  await beheer.synchroniseerEnControleer(f.env);
  const sync = f.writes.get('sync-status');
  const controle = f.writes.get('controle-status');
  assert.ok(sync);
  assert.ok(controle);
  assert.equal(sync.mislukt, 0);
  assert.ok(sync.gelukt > 1);
  assert.equal(sync.gelukt, f.puts.length);
  assert.equal(controle.gecontroleerd, sync.gelukt);
  assert.deepEqual(controle.afwijkingen, []);
  assert.deepEqual(controle.workers.ontbreekt, []);
  assert.ok(Number.isFinite(Date.parse(sync.tijdstip)));
  assert.ok(Number.isFinite(Date.parse(controle.tijdstip)));
  assert.ok(f.reads.includes('data'));
  assert.deepEqual([...f.writes.keys()].sort(), ['controle-status', 'sync-status']);
  assert.ok(f.responses.every(response => response.bodyUsed),
    'Alle succesvolle PUT-responsebodies worden geconsumeerd of geannuleerd');
});
