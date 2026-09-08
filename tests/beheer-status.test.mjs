import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Voert de echte laadStatus uit de pagina uit; alleen DOM, fetch en de klok worden
// vervangen. Uitsluitend synthetische statuspayloads: geen echte rechten, tools of
// tokens. Geen browser- of Cloudflare-integratieclaim.
const html = readFileSync(new URL('../beheer.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const NU = Date.parse('2026-09-08T12:00:00Z');

function page(status) {
  const nodes = new Map();
  const element = () => ({ value: '', checked: false, disabled: false, style: {},
    textContent: '', innerHTML: '', className: '', hidden: true,
    classList: { add() {}, remove() {} }, scrollIntoView() {},
    children: [], append(...c) { this.children.push(...c); },
    replaceChildren(...c) { this.children = c; } });
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, element());
    return nodes.get(id);
  };
  // Vaste klok, zodat een ouderdomstoets toetsbaar is zonder op de echte tijd te leunen.
  class VasteDatum extends Date {
    constructor(...a) { super(...(a.length ? a : [NU])); }
    static now() { return NU; }
  }
  const context = vm.createContext({
    document: { getElementById: node, querySelector: node, createElement: element,
      querySelectorAll: () => [] },
    fetch: async () => new Response(JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' } }),
    Date: VasteDatum, console, setTimeout() {}, confirm: () => true,
  });
  vm.runInContext(script.slice(0, script.indexOf('  // Init.')), context);
  return { context, balk: node('statusbalk') };
}

async function toon(status) {
  const { context, balk } = page(status);
  await context.laadStatus();
  return balk;
}

const verseControle = { tijdstip: '2026-09-08T06:00:00Z', gecontroleerd: 35, afwijkingen: [] };
const oudeControle = { tijdstip: '2026-09-04T06:00:39Z', gecontroleerd: 35, afwijkingen: [] };
const fout401 = tool => ({ tool, reden: 'policies ophalen gaf HTTP 401' });

test('verse controle zonder afwijkingen is groen en meldt geen onbekende toestand', async () => {
  const balk = await toon({ controle: verseControle });
  assert.match(balk.className, /goed/);
  assert.doesNotMatch(balk.innerHTML, /onbekend/i);
});

test('oude controle is niet groen en noemt de actuele toestand onbekend', async () => {
  const balk = await toon({ controle: oudeControle });
  assert.match(balk.className, /onbekend/);
  assert.doesNotMatch(balk.className, /goed/);
  assert.match(balk.innerHTML, /actuele toestand is onbekend/i);
  assert.match(balk.innerHTML, /uur oud/);
});

test('een schone maar oude controle geldt niet als actuele zekerheid', async () => {
  const balk = await toon({ controle: oudeControle });
  assert.match(balk.innerHTML, /historie, niet als de stand van nu/i);
});

for (const [naam, tijdstip] of [['ontbrekend tijdstip', undefined], ['onleesbaar tijdstip', 'geen-datum']]) {
  test(`${naam}: toestand onbekend in plaats van een uitslag`, async () => {
    const balk = await toon({ controle: { ...verseControle, tijdstip } });
    assert.match(balk.className, /onbekend/);
    assert.match(balk.innerHTML, /actuele toestand is onbekend/i);
  });
}

test('401 in de synchronisatie wijst naar het token en niet naar opnieuw opslaan', async () => {
  const balk = await toon({
    synchronisatie: { tijdstip: '2026-09-08T08:32:13Z', mislukt: 30, fouten: [fout401('portal.html')] },
    controle: oudeControle,
  });
  assert.match(balk.innerHTML, /token van de worker niet \(HTTP 401\)/);
  assert.doesNotMatch(balk.innerHTML, /sla hieronder een gebruiker op/);
  assert.match(balk.className, /fout/);
});

test('401 laat de oorzaak open in plaats van verlopen te beweren', async () => {
  const balk = await toon({
    synchronisatie: { tijdstip: '2026-09-08T08:32:13Z', mislukt: 1, fouten: [fout401('bua.html')] },
  });
  assert.match(balk.innerHTML, /verlopen, vervangen of ontbrekend/);
});

test('een andere fout dan 401 houdt het advies om opnieuw op te slaan', async () => {
  const balk = await toon({
    synchronisatie: { tijdstip: '2026-09-08T11:00:00Z', mislukt: 1,
      fouten: [{ tool: 'bua.html', reden: 'policy bijwerken gaf HTTP 500' }] },
  });
  assert.match(balk.innerHTML, /sla hieronder een gebruiker op/);
  assert.doesNotMatch(balk.innerHTML, /HTTP 401/);
});

test('403 wordt niet als authenticatiefout gelezen', async () => {
  const balk = await toon({
    synchronisatie: { tijdstip: '2026-09-08T11:00:00Z', mislukt: 1,
      fouten: [{ tool: 'bua.html', reden: 'scriptlijst ophalen gaf HTTP 403' }] },
  });
  assert.doesNotMatch(balk.innerHTML, /token van de worker niet/);
});

test('zes afwijkingen worden alle getoond zonder stille afkapping', async () => {
  const afwijkingen = Array.from({ length: 6 }, (_, i) => ({ tool: `t${i}.html`, reden: '1 ontbreekt' }));
  const balk = await toon({ controle: { ...verseControle, afwijkingen } });
  for (let i = 0; i < 6; i++) assert.match(balk.innerHTML, new RegExp(`t${i}\\.html`));
  assert.doesNotMatch(balk.innerHTML, /niet getoond/);
});

test('bij meer regels dan passen staat het exacte aantal verborgen regels erbij', async () => {
  const afwijkingen = Array.from({ length: 12 }, (_, i) => ({ tool: `t${i}.html`, reden: '1 ontbreekt' }));
  const balk = await toon({ controle: { ...verseControle, afwijkingen } });
  assert.match(balk.innerHTML, /4 verdere regel\(s\) niet getoond/);
});

test('een mislukte statusophaal meldt dat en toont geen verzonnen stand', async () => {
  const { context, balk } = page({});
  context.fetch = async () => { throw new Error('synthetische netwerkfout'); };
  await context.laadStatus();
  assert.match(balk.className, /fout/);
  assert.doesNotMatch(balk.innerHTML, /tools in orde/);
});
