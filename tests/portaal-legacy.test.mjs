import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../access-beheer-worker.js';

const ORIGIN = 'https://bouwman.tools';
const URL = 'https://access-beheer.s-bouwman.workers.dev/permissions';
const NOW = Date.parse('2030-01-01T12:00:00.000Z');
const iso = ms => new Date(ms).toISOString();
const window = { LEGACY_PERMISSIONS_FROM: iso(NOW - 1000), LEGACY_PERMISSIONS_UNTIL: iso(NOW + 1000) };

async function run(t, vars = {}, method = 'POST', origin = ORIGIN, url = URL) {
  t.mock.method(Date, 'now', () => NOW);
  const calls = { reads: [], writes: [], external: [] };
  t.mock.method(globalThis, 'fetch', async url => { calls.external.push(String(url)); throw new Error('No external requests allowed'); });
  const env = { ...vars, PERMISSIONS: {
    async get(key) { calls.reads.push(key); return JSON.stringify({ 'synthetic@example.invalid': ['synthetic.html'] }); },
    async put(key) { calls.writes.push(key); },
  } };
  const response = await worker.fetch(new Request(url, { method,
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify({ email: 'synthetic@example.invalid' }) : undefined,
  }), env, {});
  assert.deepEqual(calls.writes, []);
  assert.deepEqual(calls.external, []);
  return { response, calls };
}

test('legacy is standaard dicht, ook preflight; ontbrekende configuratie opent niets', async t => {
  for (const method of ['GET', 'POST', 'OPTIONS']) {
    const { response, calls } = await run(t, {}, method);
    assert.equal(response.status, 410);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    assert.deepEqual(calls.reads, []);
  }
});

test('expliciet actief venster ondersteunt oude pagina met eigen synthetische fixture', async t => {
  const { response, calls } = await run(t, window);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { access: ['synthetic.html'] });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.deepEqual(calls.reads, ['data']);
  const preflight = await run(t, window, 'OPTIONS');
  assert.equal(preflight.response.status, 204);
  assert.equal(preflight.response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.deepEqual(preflight.calls.reads, []);
});

test('start is inclusief, einde exclusief, en 30 minuten is het maximum', async t => {
  for (const [from, until, status] of [
    [NOW, NOW + 1, 200], [NOW + 1, NOW + 1000, 410],
    [NOW - 1000, NOW, 410], [NOW - 1000, NOW - 1, 410],
    [NOW, NOW + 30 * 60 * 1000, 200], [NOW, NOW + 30 * 60 * 1000 + 1, 410],
    [NOW, NOW, 410], [NOW, NOW - 1, 410],
  ]) {
    const { response, calls } = await run(t, { LEGACY_PERMISSIONS_FROM: iso(from), LEGACY_PERMISSIONS_UNTIL: iso(until) });
    assert.equal(response.status, status);
    assert.deepEqual(calls.reads, status === 200 ? ['data'] : []);
  }
});

test('ongeldige of halve tijdconfig faalt gesloten; geen permissieve Date.parse-vormen', async t => {
  for (const vars of [
    { LEGACY_PERMISSIONS_FROM: window.LEGACY_PERMISSIONS_FROM },
    { LEGACY_PERMISSIONS_UNTIL: window.LEGACY_PERMISSIONS_UNTIL },
    ...[undefined, null, true, 123, '', 'invalid', '2030-01-01', '2030-02-30T12:00:00.000Z',
      '2030-01-01T12:00:00Z', '2030-01-01T12:00:00.000+00:00'].flatMap(value => [
      { ...window, LEGACY_PERMISSIONS_FROM: value }, { ...window, LEGACY_PERMISSIONS_UNTIL: value },
    ]),
  ]) {
    const { response, calls } = await run(t, vars);
    assert.equal(response.status, 410);
    assert.deepEqual(calls.reads, []);
  }
});

test('venster heropent geen andere hosts of cross-origin browseraanroepen', async t => {
  const wrongOrigin = await run(t, window, 'POST', 'https://bouwman.tools.attacker.invalid');
  assert.equal(wrongOrigin.response.status, 403);
  assert.deepEqual(wrongOrigin.calls.reads, []);
  const wrongHost = await run(t, window, 'POST', ORIGIN, ORIGIN + '/permissions');
  assert.equal(wrongHost.response.status, 410);
  assert.deepEqual(wrongHost.calls.reads, []);
});
