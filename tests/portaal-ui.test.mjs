import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// De echte portalcode, met uitsluitend synthetisch register/toegang en een kleine
// DOM/fetch-adapter. Geen browser-, login- of live-Cloudflareclaim.
const html = readFileSync(new URL('../portal.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const init = script.lastIndexOf('    render();');
assert.ok(init > 0, 'echte initialisatie aanwezig');
const EMAIL = 'synthetic@example.invalid';
const registry = { categorievolgorde: ['Synthetisch'], tools: [
  { naam: 'Synthetic A', bestand: 'synthetic-a.html', categorie: 'Synthetisch', in_portal: true, beschrijving: 'Test A' },
  { naam: 'Synthetic B', bestand: 'synthetic-b.html', categorie: 'Synthetisch', in_portal: true, beschrijving: 'Test B' },
] };

function page(accessResponse, registerResponse = () => Response.json(registry)) {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) {
      let text = '', markup = '';
      nodes.set(id, {
        get textContent() { return text; }, set textContent(value) { text = String(value); markup = ''; },
        get innerHTML() { return markup; }, set innerHTML(value) { markup = String(value); text = ''; },
      });
    }
    return nodes.get(id);
  };
  const calls = [];
  const context = vm.createContext({ document: { getElementById: node }, console: { error() {} },
    fetch: async (url, options) => {
      calls.push([url, options]);
      if (url === 'tools.json') return registerResponse();
      assert.equal(url, '/portal.html/api/permissions', 'geen legacy/identity-endpoint');
      return accessResponse();
    },
  });
  vm.runInContext(script.slice(0, init), context);
  return { context, node, calls };
}

test('portaal toont alleen toegestane kaarten en eigen geverifieerde email', async () => {
  const { context, node, calls } = page(() => Response.json({ email: EMAIL, access: ['synthetic-a.html'] }));
  await context.render();
  assert.equal(node('user-email').textContent, EMAIL);
  assert.match(node('main-content').innerHTML, /Synthetic A/);
  assert.doesNotMatch(node('main-content').innerHTML, /Synthetic B|admin-panel/);
  assert.equal(calls.length, 2);
  const request = calls.find(([url]) => url === '/portal.html/api/permissions');
  assert.equal(request[1].method, 'GET');
  assert.equal(request[1].credentials, 'same-origin');
  assert.equal(request[1].redirect, 'error');
  assert.equal(request[1].cache, 'no-store');
  assert.equal(request[1].body, undefined);
});

test('geldige lege rechten zijn te onderscheiden van laadfouten', async () => {
  const { context, node } = page(() => Response.json({ email: EMAIL, access: [] }));
  await context.render();
  assert.equal(node('user-email').textContent, EMAIL);
  assert.match(node('main-content').innerHTML, /nog geen toegang tot tools/);
  assert.doesNotMatch(node('main-content').innerHTML, /tool-card|admin-panel/);
});

test('uitsluitend exact all toont alle kaarten en de bestaande beheerlinks', async () => {
  const { context, node } = page(() => Response.json({ email: EMAIL, access: 'all' }));
  await context.render();
  assert.match(node('main-content').innerHTML, /Synthetic A/);
  assert.match(node('main-content').innerHTML, /Synthetic B/);
  assert.match(node('main-content').innerHTML, /admin-panel/);
});

const failures = {
  '401': () => Response.json({ error: 'untrusted server details' }, { status: 401 }),
  '403 HTML': () => new Response('<html>private identity</html>', { status: 403 }),
  '503': () => Response.json({ error: 'untrusted server details' }, { status: 503 }),
  '200 login HTML': () => new Response('<html>private identity</html>', { headers: { 'Content-Type': 'text/html' } }),
  netwerkfout: () => { throw new Error('untrusted server details'); },
  parsefout: () => new Response('{', { headers: { 'Content-Type': 'application/json' } }),
  'access ontbreekt': () => Response.json({ email: EMAIL }),
  'email ontbreekt': () => Response.json({ access: 'all' }),
  'email is leeg': () => Response.json({ email: '', access: 'all' }),
  'email heeft verkeerd type': () => Response.json({ email: [EMAIL], access: 'all' }),
  'email is ongeldig': () => Response.json({ email: 'constructor', access: 'all' }),
  'error envelop': () => Response.json({ email: EMAIL, access: 'all', error: 'untrusted server details' }),
  'null antwoord': () => Response.json(null),
  'array antwoord': () => Response.json([]),
  ...Object.fromEntries([null, false, 0, {}, ['synthetic-a.html', 123], 'synthetic-a.html', 'ALL', '']
    .map((access, i) => [`ongeldige access ${i}`, () => Response.json({ email: EMAIL, access })])),
};
for (const [name, response] of Object.entries(failures)) {
  test(`${name}: zichtbare fout, geen kaarten/admin en geen stil leeg rechtenantwoord`, async () => {
    const { context, node } = page(response);
    node('main-content').innerHTML = '<a class="tool-card">Oude kaart</a>';
    node('user-email').textContent = 'old@example.invalid';
    await context.render();
    assert.equal(node('main-content').innerHTML, '');
    assert.ok(node('main-content').textContent.length > 0);
    assert.doesNotMatch(node('main-content').textContent, /nog geen toegang tot tools|private identity|untrusted|<html>/);
    assert.equal(node('user-email').textContent, '');
  });
}

test('registerfout blijft expliciet en toont geen kaarten, ook met geldige all-toegang', async () => {
  const { context, node } = page(() => Response.json({ email: EMAIL, access: 'all' }),
    () => new Response('untrusted registry details', { status: 503 }));
  await context.render();
  assert.match(node('main-content').innerHTML, /toollijst kon niet worden geladen/);
  assert.doesNotMatch(node('main-content').innerHTML, /tool-card|admin-panel|untrusted/);
  assert.equal(node('user-email').textContent, '');
});

test('canSee faalt gesloten bij ontbrekende of ongeldige access', () => {
  const { context } = page(() => Response.json({ email: EMAIL, access: [] }));
  for (const access of [undefined, null, false, 0, {}, 'synthetic-a.html', 'ALL', '']) {
    assert.equal(context.canSee('synthetic-a.html', access), false);
  }
  assert.equal(context.canSee('synthetic-a.html', ['synthetic-a.html']), true);
  assert.equal(context.canSee('synthetic-b.html', ['synthetic-a.html']), false);
});
