import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';

// Alleen ter plaatse gegenereerde testsleutels en verzonnen bedrijfsnamen. Er gaat in deze
// tests niets naar de KvK: de fetch is afgevangen. Dezelfde opzet als beheer-auth.test.mjs.
const URL_API = 'https://bouwman.tools/kvk-zoeker.html/api/zoeken';
const ISSUER = 'https://bouwman-tools.cloudflareaccess.com';
const AUD = '120d05bf7e566c86eb3a02bf7f9067a569d5dad64c27c15fe26d577dcaf547a3';
const ANDERE_AUD = '657d4271cbbc633b07596f57968f3eb586fe7c4e5d6d51e3b58dcef545e1f646';
const realFetch = globalThis.fetch;
let worker, privateKey, verkeerdeSleutel, jwk, jwksKapot = false;
let calls;

before(async () => {
  ({ privateKey, publicKey: jwk } = await generateKeyPair('RS256'));
  jwk = { ...await exportJWK(jwk), kid: 'synthetic', alg: 'RS256', use: 'sig' };
  ({ privateKey: verkeerdeSleutel } = await generateKeyPair('RS256'));
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href === ISSUER + '/cdn-cgi/access/certs') {
      calls.jwks++;
      if (jwksKapot) throw new Error('synthetische netwerkfout');
      return Response.json({ keys: [jwk] });
    }
    if (href.startsWith('https://api.kvk.nl/')) {
      calls.kvk.push(href);
      return Response.json({ resultaten: [{ kvkNummer: '00000000', naam: 'Verzonnen Holding',
        type: 'rechtspersoon', adres: { binnenlandsAdres: { plaats: 'Nergensdam' } } }] });
    }
    if (href.startsWith('https://ntfy.sh/')) { calls.ntfy.push(href); return Response.json({}); }
    throw new Error('Onverwachte externe aanroep: ' + href);
  };
  worker = (await import('../kvk-worker.js')).default;
});
after(() => { globalThis.fetch = realFetch; });

async function token(overrides = {}, { key, header = {} } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER, aud: [AUD], sub: 'synthetic-subject', type: 'app', exp: now + 300, ...overrides };
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];
  return new SignJWT(payload).setProtectedHeader({ alg: 'RS256', kid: 'synthetic', ...header }).sign(key || privateKey);
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function ongetekendToken() {
  const now = Math.floor(Date.now() / 1000);
  return b64url({ alg: 'none', typ: 'JWT' }) + '.'
    + b64url({ iss: ISSUER, aud: [AUD], sub: 'synthetic-subject', type: 'app', exp: now + 300 }) + '.';
}

function fixture() {
  calls = { reads: [], writes: [], kvk: [], ntfy: [], jwks: 0 };
  return {
    env: {
      KVK_API_KEY: 'synthetic-not-a-credential',
      KV: {
        async get(key) { calls.reads.push(key); return null; },
        async put(key, value) { calls.writes.push([key, value]); },
      },
    },
  };
}

async function run({ jwt, method = 'POST', origin = 'https://bouwman.tools',
  body = JSON.stringify({ handelsnaam: 'Verzonnen Holding' }), url = URL_API } = {}) {
  const { env } = fixture();
  const headers = { 'Content-Type': 'application/json' };
  if (jwt !== undefined) headers['Cf-Access-Jwt-Assertion'] = jwt;
  if (origin !== undefined) headers.Origin = origin;
  const response = await worker.fetch(new Request(url, { method, headers, body: method === 'POST' ? body : undefined }), env);
  return response;
}

/** Niets naar buiten, niets in de teller: de poort moet vóór al het werk dichtvallen. */
function geenWerkGedaan() {
  assert.deepEqual(calls.kvk, [], 'er is een KvK-aanroep gedaan');
  assert.deepEqual(calls.writes, [], 'de dagteller is verhoogd');
  assert.deepEqual(calls.ntfy, [], 'er is een melding verstuurd');
}

test('zonder Access-token: 401, en de sleutel is niet gebruikt', async () => {
  const response = await run({ jwt: undefined });
  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.login, true, 'de pagina moet hieraan zien dat opnieuw inloggen nodig is');
  assert.match(data.error, /Access/);
  assert.doesNotMatch(JSON.stringify(data), /synthetic-not-a-credential/);
  geenWerkGedaan();
});

test('met een geldig token gaat de aanvraag door naar de KvK', async () => {
  const response = await run({ jwt: await token() });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.resultaten.length, 1);
  assert.equal(data.resultaten[0].kvkNummer, '00000000');
  assert.equal(calls.kvk.length >= 1, true, 'de KvK is niet bevraagd');
  assert.equal(calls.writes.length, 1, 'de dagteller is niet bijgewerkt');
});

test('een geldig token met een lege aanvraag komt door de poort en strandt op de invoer', async () => {
  // Bewijst dat de 401 hierboven over de identiteit gaat en niet over de body.
  const response = await run({ jwt: await token(), body: JSON.stringify({}) });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /rsin of handelsnaam/);
  geenWerkGedaan();
});

test('elk gebrek aan het token valt dicht', async () => {
  const gevallen = [
    ['andere ondertekenaar', await token({}, { key: verkeerdeSleutel })],
    ['andere app (aud van het portaal)', await token({ aud: [ANDERE_AUD] })],
    ['verlopen', await token({ exp: Math.floor(Date.now() / 1000) - 1 })],
    ['geen appsessie maar iets anders', await token({ type: 'org' })],
    ['zonder subject', await token({ sub: undefined })],
    ['andere uitgever', await token({ iss: 'https://elders.cloudflareaccess.com' })],
    ['geen JWT maar losse tekst', 'niet-een-token'],
    ['leeg', ''],
    // `alg: none` kan niet met jose worden ondertekend, dus met de hand in elkaar gezet:
    // een header zonder ondertekening en een lege signatuur. Precies de klassieke poging.
    ['alg none, zonder ondertekening', ongetekendToken()],
  ];
  for (const [naam, jwt] of gevallen) {
    const response = await run({ jwt });
    assert.equal(response.status, 401, naam + ' werd toegelaten');
    assert.equal((await response.json()).login, true, naam);
    geenWerkGedaan();
  }
});

test('een onbereikbare sleutelbron laat de poort dicht en niet open', async () => {
  // Met een onbekende `kid` moet jose de sleutelbron opnieuw ophalen; de bekende sleutel
  // zit namelijk in de cache van createRemoteJWKSet en zou de storing verbergen. Dit is
  // dus tegelijk de proef op een token dat naar een sleutel wijst die niet bestaat.
  jwksKapot = true;
  try {
    const response = await run({ jwt: await token({}, { header: { kid: 'onbekend' } }) });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).login, true);
    geenWerkGedaan();
  } finally {
    jwksKapot = false;
  }
});

test('de preflight blijft zonder token werken, want die draagt geen identiteit', async () => {
  const response = await run({ jwt: undefined, method: 'OPTIONS' });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://bouwman.tools');
  geenWerkGedaan();
});

test('een andere methode dan POST komt niet verder dan 405', async () => {
  const response = await run({ jwt: await token(), method: 'GET' });
  assert.equal(response.status, 405);
  geenWerkGedaan();
});

test('de CORS-poort blijft naast Access staan en kaatst geen vreemde origin terug', async () => {
  const eigen = await run({ jwt: await token() });
  assert.equal(eigen.headers.get('Access-Control-Allow-Origin'), 'https://bouwman.tools');
  const vreemd = await run({ jwt: await token(), origin: 'https://kwaadwillend.invalid' });
  assert.equal(vreemd.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(vreemd.headers.get('Vary'), 'Origin');
});

test('het token wordt niet in het antwoord herhaald', async () => {
  const jwt = await token();
  const response = await run({ jwt: jwt.slice(0, -3) + 'aaa' });
  const tekst = await response.text();
  assert.equal(response.status, 401);
  assert.doesNotMatch(tekst, /eyJ/, 'er staat een JWT-fragment in het antwoord');
});
