import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

// Alleen ter plaatse gegenereerde testsleutels en synthetische gebruikers.
const ORIGIN = 'https://bouwman.tools';
const PREFIX = ORIGIN + '/beheer.html/api/admin/';
const ISSUER = 'https://bouwman-tools.cloudflareaccess.com';
const AUD = 'af8ac2b405ebe46b6574d003ef84f2c25c9e737d961c6871216727ad2d7790c8';
const realFetch = globalThis.fetch;
let worker, privateKey, wrongKey, jwk, jwksFailure = false;
let calls;
before(async () => {
  ({ privateKey, publicKey: jwk } = await generateKeyPair('RS256'));
  jwk = { ...await exportJWK(jwk), kid: 'synthetic', alg: 'RS256', use: 'sig' };
  ({ privateKey: wrongKey } = await generateKeyPair('RS256'));
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href === ISSUER + '/cdn-cgi/access/certs') {
      calls.jwks++;
      if (jwksFailure) throw new Error('synthetische netwerkfout');
      return Response.json({ keys: [jwk] });
    }
    calls.external.push(href);
    if (href === ORIGIN + '/tools.json') return Response.json({ tools: [], portaalworkers: [] });
    if (href.endsWith('/workers/scripts')) return Response.json({ result: [] });
    if (href.endsWith('/policies')) return Response.json({ result: [{ id: 'synthetic-policy' }] });
    if (href.endsWith('/policies/synthetic-policy')) return Response.json({ success: true });
    throw new Error('Onverwachte externe actie: ' + href);
  };
  worker = (await import('../access-beheer-worker.js')).default;
});
after(() => { globalThis.fetch = realFetch; });

async function token(overrides = {}, { key, header = {} } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER, aud: [AUD], sub: 'synthetic-subject', type: 'app', exp: now + 300, ...overrides };
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];
  return new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid: 'synthetic', ...header }).sign(key || privateKey);
}
function fixture() {
  calls = { reads: [], writes: [], external: [], jwks: 0, scheduled: [] };
  const data = { 'synthetic@example.invalid': [] };
  return {
    env: { CF_API_TOKEN: 'synthetic-not-a-credential', PERMISSIONS: {
      async get(key) { calls.reads.push(key); return key === 'data' ? JSON.stringify(data) : null; },
      async put(key, value) { calls.writes.push([key, JSON.parse(value)]); },
    } },
    ctx: { waitUntil(promise) { calls.scheduled.push(promise); } },
  };
}
async function run({ jwt, path = 'users', method = 'GET', origin, contentType = 'application/json', body,
  url = PREFIX + path, handler = worker } = {}) {
  const { env, ctx } = fixture();
  const headers = { 'Content-Type': contentType };
  if (jwt !== undefined) headers['Cf-Access-Jwt-Assertion'] = jwt;
  if (origin !== undefined) headers.Origin = origin;
  const response = await handler.fetch(new Request(url, { method, headers, body }), env, ctx);
  await Promise.all(calls.scheduled);
  return response;
}
function noData() {
  assert.deepEqual(calls.reads, []);
  assert.deepEqual(calls.writes, []);
  assert.deepEqual(calls.external, []);
  assert.deepEqual(calls.scheduled, []);
}

test('geldig beheer-JWT leest via de echte fetch-handler, zonder CORS en zonder cache', async () => {
  const response = await run({ jwt: await token() });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { 'synthetic@example.invalid': [] });
  assert.deepEqual(calls.reads, ['data']);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});

const invalid = {
  ontbrekend: () => undefined,
  ongeldig: () => 'not.a.jwt',
  unsigned: () => 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.',
  'verkeerde handtekening': () => token({}, { key: wrongKey }),
  'verkeerde issuer': () => token({ iss: 'https://attacker.invalid' }),
  'portal audience': () => token({ aud: ['synthetic-portal-aud'] }),
  verlopen: () => token({ exp: 1 }),
  'toekomstige nbf': () => token({ nbf: Math.floor(Date.now() / 1000) + 3600 }),
  'exp ontbreekt': () => token({ exp: undefined }),
  'sub ontbreekt': () => token({ sub: undefined }),
  'sub leeg': () => token({ sub: '' }),
  'type ontbreekt': () => token({ type: undefined }),
  'service type': () => token({ type: 'service' }),
  'onbekende kid': () => token({}, { header: { kid: 'unknown', jku: 'https://attacker.invalid/jwks' } }),
  HS256: () => new SignJWT({ iss: ISSUER, aud: AUD, type: 'app', sub: 'x', exp: 9999999999 })
    .setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode('synthetic-key-that-is-not-a-secret')),
};
for (const [name, getToken] of Object.entries(invalid)) {
  test(`${name}: geen beheer-read/write of Cloudflare-actie, ook met vertrouwde Origin`, async () => {
    const jwt = await getToken();
    for (const [path, method] of [['users', 'GET'], ['status', 'GET'], ['workers', 'GET'], ['upsert', 'POST'], ['delete', 'POST']]) {
      const response = await run({ jwt, path, method, origin: ORIGIN,
        body: method === 'POST' ? JSON.stringify({ email: 'synthetic@example.invalid', tools: [] }) : undefined });
      assert.equal(response.status, 401, path);
      noData();
    }
  });
}
test('JWKS-netwerkfout in nieuwe isolate geeft geen toegang', async () => {
  const isolatedWorker = (await import('../access-beheer-worker.js?jwks-failure')).default;
  jwksFailure = true;
  try {
    const response = await run({ jwt: await token(), handler: isolatedWorker });
    assert.equal(response.status, 401);
    assert.equal(calls.jwks, 1);
    noData();
  } finally { jwksFailure = false; }
});
test('misleidende host/paden en oude workers.dev-admin blijven dicht, ook met geldig JWT', async () => {
  const jwt = await token();
  for (const url of [
    'https://access-beheer.s-bouwman.workers.dev/admin/users',
    'https://access-beheer.s-bouwman.workers.dev/beheer.html/api/admin/users',
    'https://bouwman.tools.attacker.invalid/beheer.html/api/admin/users',
    'http://bouwman.tools/beheer.html/api/admin/users',
    ORIGIN + '/admin/users', ORIGIN + '/beheer.html/api/admin/users/extra',
    ORIGIN + '/beheer.html/api/admin/unknown', ORIGIN + '/beheer.html/api/adminish/users',
  ]) {
    assert.equal((await run({ jwt, url })).status, 404, url);
    noData();
  }
});
test('preflight geeft geen data of CORS-toestemming; verkeerde methode dispatcht niet', async () => {
  const response = await run({ method: 'OPTIONS', origin: 'https://attacker.invalid' });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  noData();
  assert.equal((await run({ jwt: await token(), method: 'POST', body: '{}' })).status, 405);
  noData();
});
test('mutaties vereisen exacte Origin en JSON voordat data wordt gelezen', async () => {
  const jwt = await token();
  for (const path of ['upsert', 'delete']) {
    for (const origin of [undefined, 'null', 'https://bouwman.tools.attacker.invalid', 'https://attacker.invalid', ORIGIN + '/']) {
      assert.equal((await run({ jwt, path, method: 'POST', origin, body: '{}' })).status, 403);
      noData();
    }
    assert.equal((await run({ jwt, path, method: 'POST', origin: ORIGIN, contentType: 'text/plain', body: '{}' })).status, 415);
    noData();
    assert.equal((await run({ jwt, path, method: 'POST', origin: ORIGIN, body: '{' })).status, 400);
    noData();
  }
});
test('geldige upsert/delete voeren echte mutatie uit op alleen synthetische KV', async () => {
  const jwt = await token();
  for (const path of ['upsert', 'delete']) {
    const response = await run({ jwt, path, method: 'POST', origin: ORIGIN, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ email: 'new@example.invalid', tools: [] }) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    const saved = calls.writes.find(([key]) => key === 'data')[1];
    assert.equal(Object.hasOwn(saved, 'new@example.invalid'), path === 'upsert');
    assert.equal(calls.scheduled.length, 1);
  }
});
test('geldige status en workercontrole volgen hun handler', async () => {
  const jwt = await token();
  assert.equal((await run({ jwt, path: 'status' })).status, 200);
  assert.deepEqual(calls.reads, ['sync-status', 'controle-status']);
  assert.equal((await run({ jwt, path: 'workers' })).status, 200);
  assert.equal(calls.external.length, 2);
  assert.deepEqual(calls.writes, []);
});
test('publiek /permissions en zijn bestaande preflight blijven werken', async () => {
  const url = 'https://access-beheer.s-bouwman.workers.dev/permissions';
  const preflight = await run({ url, method: 'OPTIONS', origin: ORIGIN });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  noData();
  const response = await run({ url, method: 'POST', origin: ORIGIN, body: JSON.stringify({ email: 'synthetic@example.invalid' }) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { access: [] });
  assert.deepEqual(calls.reads, ['data']);
});
