import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('vervolgrondes gebruiken dezelfde bronhash en stoppen na volledige controle', async () => {
  let rounds = 0;
  const { context } = page((url, options) => {
    assert.ok(url.endsWith('/admin/sync'));
    assert.equal(JSON.parse(options.body).bronHash, 'synthetic-hash');
    rounds++;
    return Response.json({ ok: rounds === 3, voortzetten: rounds < 3, bronHash: 'synthetic-hash' });
  });
  const result = await context.voltooiSynchronisatie({ voortzetten: true, bronHash: 'synthetic-hash' });
  assert.equal(rounds, 3);
  assert.equal(result.ok, true);
});

test('geen oneindige vervolgrondes als de server blijft doorsturen', async () => {
  const { context, requests } = page(() => Response.json({ ok: false, voortzetten: true, bronHash: 'synthetic-hash' }));
  await assert.rejects(context.voltooiSynchronisatie({ voortzetten: true, bronHash: 'synthetic-hash' }), /open stappen/);
  assert.equal(requests.length, 12);
});

// Voer de echte paginafuncties uit; alleen DOM, fetch en tijd worden vervangen.
// Geen browser-/Cloudflare-integratieclaim: die volgt pas bij de expliciete uitrol.
const html = readFileSync(new URL('../beheer.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function page(fetchImpl) {
  const nodes = new Map();
  const element = () => ({ value: '', checked: false, disabled: false, style: {},
    textContent: '', innerHTML: '', classList: { add() {}, remove() {} }, scrollIntoView() {},
    children: [], append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; } });
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, element());
    return nodes.get(id);
  };
  const requests = [];
  const context = vm.createContext({
    document: { getElementById: node, querySelector: node, createElement: element,
      querySelectorAll: () => [{ value: 'synthetic-tool.html' }] },
    fetch: async (...args) => { requests.push(args); return fetchImpl(...args); },
    console, setTimeout() {}, confirm: () => true, btoa: s => Buffer.from(s).toString('base64'),
  });
  vm.runInContext(script.slice(0, script.indexOf('  // Init.')), context);
  node('email-input').value = 'synthetic@example.invalid';
  return { context, node, requests };
}
const failures = {
  '401 JSON': () => Response.json({ error: 'unauthorized' }, { status: 401 }),
  '403 HTML': () => new Response('<html>Access login</html>', { status: 403, headers: { 'Content-Type': 'text/html' } }),
  '200 login HTML': () => new Response('<html>Access login</html>', { headers: { 'Content-Type': 'text/html' } }),
  netwerkfout: () => { throw new Error('synthetische netwerkfout'); },
  'JSON parsefout': () => new Response('{', { headers: { 'Content-Type': 'application/json' } }),
  'geen mutationbevestiging': () => Response.json({}),
};
for (const [name, response] of Object.entries(failures)) {
  test(`opslaan bij ${name}: invoer behouden, knop hersteld, fout en geen succes`, async () => {
    const { context, node, requests } = page(response);
    await context.saveUser();
    assert.equal(node('email-input').value, 'synthetic@example.invalid');
    assert.equal(node('.btn-save').disabled, false);
    assert.equal(node('.btn-save').textContent, 'Opslaan');
    assert.ok(node('toast').textContent.length > 0);
    assert.doesNotMatch(node('toast').textContent, /opgeslagen|<html>/);
    assert.equal(requests.length, 1);
    assert.equal(requests[0][0], '/beheer.html/api/admin/upsert');
    assert.equal(requests[0][1].credentials, 'same-origin');
    assert.equal(requests[0][1].redirect, 'error');
    assert.equal(requests[0][1].cache, 'no-store');
  });
}
test('bevestigde opslag ververst overzicht, reset formulier en meldt succes', async () => {
  const { context, node, requests } = page(async (url) => url.endsWith('/upsert')
    ? Response.json({ ok: true }) : Response.json({}));
  await context.saveUser();
  assert.equal(node('email-input').value, '');
  assert.equal(node('.btn-save').disabled, false);
  assert.match(node('toast').textContent, /opgeslagen/i);
  // Derde verzoek is de statusbalk, die na een geslaagde opslag opnieuw wordt geladen:
  // zonder dat bleef daar de stand van vóór deze opslag staan.
  assert.equal(requests.length, 3);
  assert.match(String(requests[2][0]), /\/admin\/status$/);
});
test('refreshfout na bevestigde opslag behoudt invoer en geeft geen algemene succesmelding', async () => {
  const { context, node } = page(async url => url.endsWith('/upsert')
    ? Response.json({ ok: true }) : Response.json({}, { status: 503 }));
  await context.saveUser();
  assert.equal(node('email-input').value, 'synthetic@example.invalid');
  assert.equal(node('.btn-save').disabled, false);
  assert.match(node('toast').textContent, /503/);
  assert.doesNotMatch(node('toast').textContent, /opgeslagen/);
});
test('verwijderen en bewerken vangen verlopen sessie af zonder succes of formulierwijziging', async () => {
  const { context, node, requests } = page(() => Response.json({}, { status: 401 }));
  await context.deleteUser('synthetic@example.invalid');
  assert.doesNotMatch(node('toast').textContent, /verwijderd/);
  await context.editUser('other@example.invalid');
  assert.equal(node('email-input').value, 'synthetic@example.invalid');
  assert.equal(node('email-input').disabled, false);
  assert.equal(requests.length, 2);
});
test('fout bij gebruikerslijst komt door en statusfout blijft zichtbaar', async () => {
  const { context, node } = page(() => Response.json({}, { status: 401 }));
  await assert.rejects(context.loadUsers(), /401/);
  await context.laadStatus();
  assert.equal(node('statusbalk').hidden, false);
  assert.match(node('statusbalk').textContent, /401/);
});

test('gebruikersmap met error/prototype/quotes blijft zichtbaar en via echte knop verwijderbaar', async () => {
  for (const email of ['error', '__proto__', 'constructor', ' ', '', "synthetic'<b>"]) {
    const permissions = { [email]: [] };
    const { context, node, requests } = page((url, options) => {
      if (url.endsWith('/delete')) {
        assert.equal(JSON.parse(options.body).email, email);
        delete permissions[email];
        return Response.json({ ok: true });
      }
      return Response.json(permissions);
    });
    await context.loadUsers();
    const row = node('users-list').children[0];
    assert.equal(row.children[0].textContent, email);
    assert.equal(row.children[0].innerHTML, '');
    assert.equal(row.children[3].textContent, 'Verwijderen');
    await row.children[3].onclick();
    assert.match(node('toast').textContent, /verwijderd/);
    assert.equal(requests.length, 4);
    assert.equal(Object.hasOwn(permissions, email), false);
  }
});
test('POST-foutenvelop blijft een fout en geldige map met error is geen envelop', async () => {
  const { context } = page(() => Response.json({ error: [], ok: true }));
  const users = await context.api('/admin/users');
  assert.equal(Object.hasOwn(users, 'error'), true);
  await assert.rejects(context.api('/admin/upsert', 'POST', {}), /niet bevestigd/);
});
