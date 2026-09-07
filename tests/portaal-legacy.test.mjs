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

test('legacy is definitief dicht voor elke methode, inclusief preflight', async t => {
  for (const method of ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'HEAD']) {
    const { response, calls } = await run(t, {}, method);
    assert.equal(response.status, 410);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.deepEqual(calls.reads, []);
  }
});

test('achtergebleven actieve/verlopen/toekomstige of ongeldige venstervars openen niets', async t => {
  for (const vars of [
    window,
    { LEGACY_PERMISSIONS_FROM: iso(NOW), LEGACY_PERMISSIONS_UNTIL: iso(NOW + 1) },
    { LEGACY_PERMISSIONS_FROM: iso(NOW + 1), LEGACY_PERMISSIONS_UNTIL: iso(NOW + 1000) },
    { LEGACY_PERMISSIONS_FROM: iso(NOW - 1000), LEGACY_PERMISSIONS_UNTIL: iso(NOW) },
    { LEGACY_PERMISSIONS_FROM: iso(NOW), LEGACY_PERMISSIONS_UNTIL: iso(NOW + 30 * 60 * 1000) },
    { LEGACY_PERMISSIONS_FROM: iso(NOW), LEGACY_PERMISSIONS_UNTIL: iso(NOW + 31 * 60 * 1000) },
    { LEGACY_PERMISSIONS_FROM: window.LEGACY_PERMISSIONS_FROM },
    { LEGACY_PERMISSIONS_UNTIL: window.LEGACY_PERMISSIONS_UNTIL },
    ...[undefined, null, true, 123, '', 'invalid', '2030-01-01', '2030-02-30T12:00:00.000Z',
      '2030-01-01T12:00:00Z', '2030-01-01T12:00:00.000+00:00'].flatMap(value => [
      { ...window, LEGACY_PERMISSIONS_FROM: value }, { ...window, LEGACY_PERMISSIONS_UNTIL: value },
    ]),
  ]) {
    for (const method of ['POST', 'OPTIONS']) {
      const { response, calls } = await run(t, vars, method);
      assert.equal(response.status, 410);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
      assert.deepEqual(calls.reads, []);
    }
  }
});

test('legacy blijft dicht bij andere host, Origin en adres in query', async t => {
  const wrongOrigin = await run(t, window, 'POST', 'https://bouwman.tools.attacker.invalid');
  assert.equal(wrongOrigin.response.status, 410);
  assert.deepEqual(wrongOrigin.calls.reads, []);
  const wrongHost = await run(t, window, 'POST', ORIGIN, ORIGIN + '/permissions');
  assert.equal(wrongHost.response.status, 410);
  assert.deepEqual(wrongHost.calls.reads, []);
  const query = await run(t, window, 'POST', ORIGIN, URL + '?email=other@example.invalid');
  assert.equal(query.response.status, 410);
  assert.deepEqual(Object.keys(await query.response.json()), ['error']);
  assert.deepEqual(query.calls.reads, []);
});
