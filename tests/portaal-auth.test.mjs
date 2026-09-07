import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

// Alle identiteiten, rechten en sleutels zijn synthetisch. Geen live netwerk.
const ORIGIN = 'https://bouwman.tools';
const URL = ORIGIN + '/portal.html/api/permissions';
const ISSUER = 'https://bouwman-tools.cloudflareaccess.com';
const PORTAL_AUD = '657d4271cbbc633b07596f57968f3eb586fe7c4e5d6d51e3b58dcef545e1f646';
const ADMIN_AUD = 'af8ac2b405ebe46b6574d003ef84f2c25c9e737d961c6871216727ad2d7790c8';
const EMAIL = 'synthetic@example.invalid';
const INITIAL = { [EMAIL]: ['synthetic-a.html'], 'other@example.invalid': 'all' };
const realFetch = globalThis.fetch;
let worker, privateKey, wrongKey, jwk, calls, failJwks = false;
before(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  jwk = { ...await exportJWK(pair.publicKey), kid: 'synthetic-portal', alg: 'RS256', use: 'sig' };
  ({ privateKey: wrongKey } = await generateKeyPair('RS256'));
  globalThis.fetch = async url => {
    const href = String(url);
    if (href === ISSUER + '/cdn-cgi/access/certs') {
      calls.jwks++;
      if (failJwks) throw new Error('synthetic JWKS failure');
      return Response.json({ keys: [jwk] });
    }
    calls.external.push(href);
    if (href === ORIGIN + '/tools.json') return Response.json({ tools: [], portaalworkers: [] });
    if (href.endsWith('/workers/scripts')) return Response.json({ result: [] });
    throw new Error('Unexpected synthetic external request');
  };
  worker = (await import('../access-beheer-worker.js')).default;
});
after(() => { globalThis.fetch = realFetch; });

async function token(overrides = {}, { key = privateKey, header = {} } = {}) {
  const payload = { iss: ISSUER, aud: [PORTAL_AUD], sub: 'synthetic-sub', type: 'app',
    email: EMAIL, exp: Math.floor(Date.now() / 1000) + 300, ...overrides };
  for (const name of Object.keys(payload)) if (payload[name] === undefined) delete payload[name];
  return new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid: 'synthetic-portal', ...header }).sign(key);
}
function fixture({ raw = JSON.stringify(INITIAL), failKv = false } = {}) {
  calls = { reads: [], writes: [], external: [], scheduled: [], jwks: 0 };
  return {
    env: { CF_API_TOKEN: 'synthetic-not-a-credential', PERMISSIONS: {
      async get(key) { calls.reads.push(key); if (failKv) throw new Error('synthetic private diagnostic'); return raw; },
      async put(key, value) { calls.writes.push([key, value]); },
    } },
    ctx: { waitUntil(promise) { calls.scheduled.push(promise); } },
  };
}
async function run({ jwt, url = URL, method = 'GET', headers = {}, body, raw, failKv, handler = worker } = {}) {
  const { env, ctx } = fixture({ raw, failKv });
  if (jwt !== undefined) headers['Cf-Access-Jwt-Assertion'] = jwt;
  const response = await handler.fetch(new Request(url, { method, headers, body }), env, ctx);
  await Promise.all(calls.scheduled);
  return response;
}
function readOnly(reads = []) {
  assert.deepEqual(calls.reads, reads);
  assert.deepEqual(calls.writes, []);
  assert.deepEqual(calls.external, []);
  assert.deepEqual(calls.scheduled, []);
}

test('echt portaal-JWT geeft uitsluitend eigen email en rechten zonder CORS/cache/writes', async () => {
  const response = await run({ jwt: await token() });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { email: EMAIL, access: INITIAL[EMAIL] });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  readOnly(['data']);
});

test('een andere aangemelde synthetische gebruiker krijgt uitsluitend zijn eigen all-recht', async () => {
  const response = await run({ jwt: await token({ email: 'other@example.invalid' }) });
  assert.deepEqual(await response.json(), { email: 'other@example.invalid', access: 'all' });
  readOnly(['data']);
});

const invalid = {
  ontbrekend: () => undefined,
  malformed: () => 'not.a.jwt',
  unsigned: () => 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.',
  'verkeerde handtekening': () => token({}, { key: wrongKey }),
  'beheer-AUD': () => token({ aud: [ADMIN_AUD] }),
  'verkeerde issuer': () => token({ iss: 'https://attacker.invalid' }),
  verlopen: () => token({ exp: 1 }),
  'exp ontbreekt': () => token({ exp: undefined }),
  'exp verkeerd type': () => token({ exp: '9999999999' }),
  'sub ontbreekt': () => token({ sub: undefined }),
  'sub leeg': () => token({ sub: '' }),
  'verkeerd type': () => token({ type: 'org' }),
  'toekomstige nbf': () => token({ nbf: Math.floor(Date.now() / 1000) + 600 }),
  'onbekende kid/jku': () => token({}, { header: { kid: 'unknown', jku: 'https://attacker.invalid' } }),
  HS256: () => new SignJWT({}).setProtectedHeader({ alg: 'HS256' })
    .sign(new TextEncoder().encode('synthetic-not-a-secret')),
};
for (const [name, makeToken] of Object.entries(invalid)) {
  test(`portaal ${name}: weigering vóór KV/CF, ook met body-identiteitsheaders`, async () => {
    const response = await run({ jwt: await makeToken(), headers: { Origin: ORIGIN,
      'Cf-Access-Authenticated-User-Email': EMAIL, 'X-Email': EMAIL } });
    assert.equal(response.status, 401);
    readOnly();
  });
}

test('ontbrekende of ongeldige emailclaim weigert vóór KV; geen identiteitsfallback', async () => {
  for (const email of [undefined, null, '', ' ', [], {}, 123, 'constructor', '__proto__',
    'no-at', 'a@@example.invalid', ' a@example.invalid', 'a@example.invalid\n', 'a\0@example.invalid']) {
    const response = await run({ jwt: await token({ email }), url: URL + '?email=' + EMAIL,
      headers: { 'Cf-Access-Authenticated-User-Email': EMAIL } });
    assert.equal(response.status, 403, JSON.stringify(email));
    readOnly();
  }
});

test('body/query/header-adres kan de geverifieerde identiteit niet vervangen', async () => {
  const jwt = await token();
  const get = await run({ jwt, url: URL + '?email=other@example.invalid',
    headers: { 'Cf-Access-Authenticated-User-Email': 'other@example.invalid' } });
  assert.deepEqual(await get.json(), { email: EMAIL, access: INITIAL[EMAIL] });
  readOnly(['data']);
  const post = await run({ jwt, method: 'POST', body: JSON.stringify({ email: 'other@example.invalid' }) });
  assert.equal(post.status, 405);
  readOnly();
});

test('onbekende of anders gespelde gebruiker krijgt lege rechten zonder normalisatie', async () => {
  for (const email of ['unknown@example.invalid', 'Synthetic@example.invalid']) {
    const response = await run({ jwt: await token({ email }) });
    assert.deepEqual(await response.json(), { email, access: [] });
    readOnly(['data']);
  }
});

test('uitsluitend eigen objectsleutels zijn rechten', async () => {
  const email = 'inherited@example.invalid';
  Object.defineProperty(Object.prototype, email, { value: 'all', configurable: true });
  try {
    const response = await run({ jwt: await token({ email }), raw: '{}' });
    assert.deepEqual(await response.json(), { email, access: [] });
    readOnly(['data']);
  } finally { delete Object.prototype[email]; }
});

test('KV-fout, ontbrekende/ongeldige opslag en ongeldige eigenrechten geven veilige 503', async () => {
  const jwt = await token();
  for (const raw of [null, '', '{', 'null', '[]', '123', '"all"',
    ...[null, false, 123, {}, ['a', 1], 'a.html'].map(access => JSON.stringify({ [EMAIL]: access }))]) {
    const response = await run({ jwt, raw });
    assert.equal(response.status, 503);
    assert.deepEqual(Object.keys(await response.json()), ['error']);
    readOnly(['data']);
  }
  const response = await run({ jwt, failKv: true });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /synthetic|diagnostic/);
  readOnly(['data']);
});

test('JWKS-fout geeft geen KV-toegang, zonder onbeveiligde fallback', async () => {
  const isolatedWorker = (await import('../access-beheer-worker.js?portal-jwks-failure')).default;
  failJwks = true;
  try {
    const response = await run({ jwt: await token(), handler: isolatedWorker });
    assert.equal(response.status, 401);
    assert.equal(calls.jwks, 1);
    readOnly();
  } finally { failJwks = false; }
});

test('portaal-AUD opent geen van de vijf adminroutes', async () => {
  const jwt = await token();
  for (const [name, method] of [['users', 'GET'], ['status', 'GET'], ['workers', 'GET'], ['upsert', 'POST'], ['delete', 'POST']]) {
    const response = await run({ jwt, url: ORIGIN + '/beheer.html/api/admin/' + name, method,
      headers: { Origin: ORIGIN, 'Content-Type': 'application/json' }, body: method === 'POST' ? '{}' : undefined });
    assert.equal(response.status, 401);
    readOnly();
  }
});

test('direct workers.dev, HTTP, misleidende host of ander portaalpad dispatcht niet', async () => {
  const jwt = await token();
  for (const url of [
    'https://access-beheer.s-bouwman.workers.dev/portal.html/api/permissions',
    'http://bouwman.tools/portal.html/api/permissions',
    'https://bouwman.tools.attacker.invalid/portal.html/api/permissions',
    ORIGIN + '/portal.html/api/permissions/extra', ORIGIN + '/portal.html/api/permissionsevil',
    ORIGIN + '/portal.html/api/unknown',
  ]) {
    assert.equal((await run({ jwt, url })).status, 404);
    readOnly();
  }
  const response = await run({ method: 'OPTIONS', headers: { Origin: 'https://attacker.invalid' } });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  readOnly();
});

test('scheduled blijft server-side controleren zonder portaal-JWT of rechtenmutatie', async () => {
  const { env, ctx } = fixture({ raw: '{}' });
  await worker.scheduled({}, env, ctx);
  assert.deepEqual(calls.reads, ['data']);
  assert.deepEqual(calls.writes.map(([key]) => key), ['controle-status']);
  assert.equal(calls.external.length, 2);
  assert.equal(calls.jwks, 0);
});
