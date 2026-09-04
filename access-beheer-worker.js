// Cloudflare Worker — gebruikersbeheer bouwman.tools
// KV binding: PERMISSIONS
// Secrets: ADMIN_TOKEN, CF_API_TOKEN
// Route: bouwman.tools/api/*

const CF_ACCOUNT_ID = '9f2508dc476f0183404720277152eb16';

// Sleutels in de KV-opslag met de uitkomst van de laatste synchronisatie en van
// de laatste controle. beheer.html leest die en meldt het als er iets mis is.
// Zonder deze twee kon het bijwerken van de toegang volledig mislukken terwijl
// het beheerscherm succes meldde; zie AGENTS.md.
const STATUS_SYNC = 'sync-status';
const STATUS_CONTROLE = 'controle-status';

// Waar de controle het register leest. Dezelfde URL die portal.html en beheer.html
// gebruiken: tools.json staat onafgeschermd op GitHub Pages. Deze worker heeft geen
// route op bouwman.tools, dus dit verzoek komt niet bij zichzelf terug.
const REGISTER_URL = 'https://bouwman.tools/tools.json';

const APP_IDS = {
  'portal.html':                         '4f132e0b-6557-4726-8371-111024d21f39',
  'Join-jaarrekening-review.html':       '8a515a1c-6b83-4d4c-9c1d-b42a7a9b61a8',
  'auto-fiscaal-2027.html':              'a504237d-750a-476b-95e8-2396a872e6fa',
  'join-auto-rekenmodel.html':           '484f3fb2-f173-44df-9d69-6f6aefbccdac',
  'bv_janee_DK.html':                    '6bf2694f-c9db-4255-84ad-547e830908f9',
  'join-bv-documenten.html':             '221ef623-dadc-4421-be69-efe6ee3c774f',
  'rc-schuld-dga.html':                  '287f71cc-2a57-473c-a23a-a9b79eb908f7',
  'herstructurering-assistent-v3.html':  '7f21b48f-27eb-4609-b6c7-ea860acdd85b',
  'nhg-werkgeversverklaring-wizard.html':'e3163f39-b8bc-4e78-9bdd-6215a2f3903e',
  'kennisgroepen-zoeker.html':           '64df23ef-f0d3-4fbb-8663-fdd8d087b58d',
  'gebruikelijk-loon.html':              '05eb7bb9-f91e-4dbf-b579-b177d5fe4b1a',
  'dividend-uitkeringstoets.html':       '248f5a7a-2020-4ecc-8ee5-72a27d187dcd',
  'join-wkr-agent.html':                 '001e74ec-11a4-46ff-80d3-0fe63fe16540',
  'werkkostenregeling.html':             '4870a8b9-9dca-4801-9b28-f2137a328c22',
  'btw-teruggaaf-eu.html':               '7ad10838-83b8-4a33-b835-c44a7e220ca7',
  'bua.html':                            '98ea57d3-283f-49bf-86ce-44b91d3e0157',
  'bewaarplicht.html':                   'bcfa2467-4927-4a2f-8b4d-52742455ac3f',
  'kvk-zoeker.html':                     'ecff168d-1414-4714-9081-1e41a1bee156',
  'join-prijsafspraken.html':            '58eeec00-dc06-4b2f-ae46-08855ad22a8f',
  'earningsstripping.html':              'a1b924eb-7479-4917-bdff-be5a0152713b',
  'xaf_export.html':                     '4c8d9861-2a87-4deb-8f9a-43727cede8f5',
  'berekeningen.html':                   'c028c0a1-4ee7-457d-ac69-624194c6b3c4',
  'transitievergoeding.html':            '8e9681f8-73dd-482e-a4f8-e7b20d29e4d1',
  'dcf-rekentool.html':                  '0056eab8-2ed6-4fc0-a0d8-6f675b0aa310',
  'rc-rente.html':                       'd8b2c28a-a1a3-46ec-94c0-55047e210f77',
  'dividend-scenarios.html':             'e5d48bf8-16d3-408e-8de6-1eae46fdfd29',
  'belastinglatentie.html':              '751d9e97-65b6-4564-8083-9ce37cfc035b',
  'vastgoedrendement.html':              '73dde839-43d7-44d7-82ec-3a15486203b4',
  'herziening-btw.html':                 '556659b5-e5c2-454f-9c3e-699f9f21ddfa',
  'modellen-naar-tools.html':            '91e5043d-b47c-44cd-a1be-5a26bbcd2fe5',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(request) });
    }

    // Publiek: rechten ophalen voor één gebruiker (gebruikt door portal.html)
    if (path === '/permissions' && request.method === 'POST') {
      const { email } = await request.json();
      const permissions = await getPermissions(env);
      const access = email ? (permissions[email] ?? []) : [];
      return ok({ access }, request);
    }

    // Admin-endpoints — alleen bereikbaar via bouwman.tools (CF Access beschermt beheer.html)
    const origin = request.headers.get('Origin') || '';
    if (!origin.includes('bouwman.tools') && !origin.includes('workers.dev')) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (path === '/admin/users' && request.method === 'GET') {
      return ok(await getPermissions(env), request);
    }

    // Uitkomst van de laatste synchronisatie en van de laatste controle.
    if (path === '/admin/status' && request.method === 'GET') {
      return ok({
        synchronisatie: JSON.parse(await env.PERMISSIONS.get(STATUS_SYNC) || 'null'),
        controle: JSON.parse(await env.PERMISSIONS.get(STATUS_CONTROLE) || 'null'),
      }, request);
    }

    // Draait de workercontrole meteen, zonder op de dagelijkse controle te wachten.
    // Leest alleen: het account wordt niet gewijzigd en de status in de opslag ook niet.
    // Nodig om na een deploy te kunnen vaststellen dat de controle werkelijk werkt,
    // in plaats van dat tot de volgende ochtend aan te nemen.
    if (path === '/admin/workers' && request.method === 'GET') {
      return ok(await controleerWorkers(env), request);
    }

    if (path === '/admin/upsert' && request.method === 'POST') {
      const { email, tools } = await request.json();
      if (!email) return ok({ error: 'email verplicht' }, request, 400);
      const permissions = await getPermissions(env);
      permissions[email] = tools;
      await env.PERMISSIONS.put('data', JSON.stringify(permissions));
      ctx.waitUntil(syncCFAccess(permissions, env));
      return ok({ ok: true }, request);
    }

    if (path === '/admin/delete' && request.method === 'POST') {
      const { email } = await request.json();
      if (!email) return ok({ error: 'email verplicht' }, request, 400);
      const permissions = await getPermissions(env);
      delete permissions[email];
      await env.PERMISSIONS.put('data', JSON.stringify(permissions));
      ctx.waitUntil(syncCFAccess(permissions, env));
      return ok({ ok: true }, request);
    }

    return new Response('Not found', { status: 404 });
  },

  // Dagelijkse controle en herstel. Deze kijkt naar het account en niet naar de
  // repository, en vindt daarom ook een verlopen token of een worker die
  // achterloopt. check_tools.py in de repo kan dat per definitie niet zien.
  //
  // Vindt hij een afwijking, dan schrijft hij de policies opnieuw en meet daarna
  // wat er nog overblijft. Tot 04-09-2026 meldde hij alleen; een afwijking bleef
  // dan staan tot iemand in beheer.html een gebruiker opsloeg.
  //
  // Sinds 04-09-2026 kijkt hij daarnaast of de Workers waar tools van afhangen op het
  // account staan. Die dag bleek kvk-proxy er niet te zijn, terwijl kvk-zoeker.html op
  // live stond en gewoon in het portaal hing. De policies klopten, dus de controle van
  // toen zag niets.
  //
  // Nagemeten in het audit log van het account: hij is op 15-07-2026 om 07:39 CEST
  // verwijderd, na twee weken draaien, en was daarna 51 dagen weg. Hier stond eerst dat
  // hij nooit was uitgerold; dat kwam uit een auditlog-query zonder paginering. Zie
  // AGENTS.md. Deze controle vangt overigens beide gevallen: een Worker die wegvalt en
  // een tool die live gaat zonder dat zijn Worker ooit is uitgerold.
  async scheduled(event, env, ctx) {
    const tijdstip = new Date().toISOString();

    if (!env.CF_API_TOKEN) {
      const reden = 'CF_API_TOKEN ontbreekt op de worker';
      console.error('controle: ' + reden);
      await schrijfStatus(env, STATUS_CONTROLE, {
        tijdstip, gecontroleerd: 0, overgeslagen: 0,
        afwijkingen: [{ tool: '*', reden }],
        workers: { reden },
      });
      return;
    }

    const permissions = await getPermissions(env);
    let uit = await controleerPolicies(permissions, env);
    let hersteld = 0;

    // Een afwijking die vanzelf te herstellen is, hoort niet te blijven staan tot
    // iemand toevallig een gebruiker opslaat in beheer.html. Juist bij een nieuwe tool
    // loopt de policy achter terwijl de rechten hier al kloppen: wie 'all' heeft, heeft
    // recht op die tool, maar Cloudflare weet dat pas na een synchronisatie. Zo bleef
    // xaf_export.html op 02-09-2026 onbereikbaar voor wie er wel recht op had.
    //
    // De opslag is de bron: syncCFAccess schrijft de policy uit de rechten hier, en
    // slaat een tool over waar niemand recht op heeft. Een lege of onbereikbare opslag
    // sluit dus niemand buiten; er wordt dan niets geschreven.
    if (uit.afwijkingen.length) {
      console.error(`controle: ${uit.afwijkingen.length} afwijking(en) gevonden: ` +
        uit.afwijkingen.map(a => `${a.tool} (${a.reden})`).join('; '));

      await syncCFAccess(permissions, env);

      // Opnieuw meten in plaats van aannemen dat het herstel is gelukt: wat overblijft
      // is een echt probleem en hoort in beheer.html te blijven staan.
      const na = await controleerPolicies(permissions, env);
      hersteld = uit.afwijkingen.length - na.afwijkingen.length;
      uit = na;

      console.log(`controle: ${hersteld} afwijking(en) hersteld, ` +
        `${uit.afwijkingen.length} over`);
    } else {
      console.log(`controle: ${uit.gecontroleerd} tools in orde, ` +
        `${uit.overgeslagen} overgeslagen`);
    }

    // Bestaan de Workers waar tools van afhangen nog? Bewust alleen melden: een
    // verdwenen Worker terugzetten vraagt vaak ook een secret opnieuw, en dat kan
    // deze worker niet. Automatisch herstel zou hier een lege huls neerzetten die
    // er wel is maar niets doet, en dat is erger dan een melding.
    const workers = await controleerWorkers(env);
    if (workers.reden) {
      console.error('workercontrole overgeslagen: ' + workers.reden);
    } else if (workers.ontbreekt.length) {
      console.error('workercontrole: ontbreekt op het account: ' +
        workers.ontbreekt.map(w => `${w.naam} (voor ${w.waarvoor})`).join('; '));
    } else {
      console.log(`workercontrole: ${workers.verwacht} uit het register aanwezig, ` +
        `${workers.aanwezig} op het account` +
        (workers.ongebruikt.length
          ? `, waar geen tool naar verwijst: ${workers.ongebruikt.join(', ')}`
          : ''));
    }

    await schrijfStatus(env, STATUS_CONTROLE, { tijdstip, ...uit, hersteld, workers });
  }
};

async function schrijfStatus(env, sleutel, status) {
  try {
    await env.PERMISSIONS.put(sleutel, JSON.stringify(status));
  } catch (e) {
    console.error(`status ${sleutel} wegschrijven mislukt: ${e && e.message ? e.message : String(e)}`);
  }
}

// Welke adressen horen volgens de opslag toegang te hebben tot dit bestand.
function rechthebbenden(permissions, file) {
  if (file === 'portal.html') return Object.keys(permissions);
  return Object.entries(permissions)
    .filter(([, t]) => t === 'all' || (Array.isArray(t) && t.includes(file)))
    .map(([e]) => e);
}

// Vergelijkt per Access-app de toegelaten adressen met de rechten in de opslag.
// Bewaart geen adressen in de uitkomst, alleen aantallen en de naam van de tool:
// die uitkomst is voor een melding, niet voor een ledenlijst.
async function controleerPolicies(permissions, env) {
  const afwijkingen = [];
  let gecontroleerd = 0, overgeslagen = 0;

  for (const [file, appId] of Object.entries(APP_IDS)) {
    const verwacht = rechthebbenden(permissions, file);

    // De synchronisatie laat een policy bewust ongemoeid als niemand recht
    // heeft op die tool, want een lege lijst wordt door de API geweigerd.
    // De controle moet dat overslaan, anders klaagt zij daar eeuwig over.
    if (verwacht.length === 0) { overgeslagen++; continue; }

    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${appId}/policies`,
        { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
      );
      if (!res.ok) {
        afwijkingen.push({ tool: file, reden: `policies ophalen gaf HTTP ${res.status}` });
        continue;
      }
      const data = await res.json();
      const policy = data.result?.[0];
      if (!policy) {
        afwijkingen.push({ tool: file, reden: 'de Access-app heeft geen policy' });
        continue;
      }

      const aanwezig = (policy.include || []).map(r => r?.email?.email).filter(Boolean);
      const ontbreekt = verwacht.filter(e => !aanwezig.includes(e)).length;
      const teveel = aanwezig.filter(e => !verwacht.includes(e)).length;
      gecontroleerd++;

      if (ontbreekt || teveel) {
        afwijkingen.push({
          tool: file,
          reden: `${ontbreekt} ontbreekt in de policy, ${teveel} staat er te veel in`,
          verwacht: verwacht.length,
          aanwezig: aanwezig.length,
        });
      }
    } catch (e) {
      afwijkingen.push({
        tool: file,
        reden: `onverwachte fout: ${e && e.message ? e.message : String(e)}`,
      });
    }
  }

  return { gecontroleerd, overgeslagen, afwijkingen };
}

// Welke Workers hoort het account te hebben, en waarvoor. tools.json is de bron:
// per tool staat er in 'workers' van welke Worker hij afhangt, en 'portaalworkers'
// noemt de Workers die bij geen enkele tool horen maar wel nodig zijn. Een tweede
// lijst hier zou hetzelfde probleem geven als de toollijsten die het register
// vervangen heeft: zij loopt stil uit de pas.
function verwachteWorkers(register) {
  const uit = new Map();
  const noteer = (naam, waarvoor) => {
    if (typeof naam !== 'string' || !naam) return;
    uit.set(naam, uit.has(naam) ? `${uit.get(naam)}, ${waarvoor}` : waarvoor);
  };
  for (const w of register.portaalworkers || []) noteer(w.naam, 'het portaal zelf');
  for (const tool of register.tools || []) {
    for (const naam of tool.workers || []) noteer(naam, tool.naam || tool.id || '?');
  }
  return uit;
}

// Legt de Workers uit het register naast de scriptlijst van het account.
//
// Het bewijs is of de naam in die lijst voorkomt, niet of een adres antwoordt: een
// Worker met een uitgezette workers.dev-route geeft daar ook 404, en zo geven
// kennisgroepen-agent en modellen-roadmap een 404 terwijl ze draaien op een route
// op bouwman.tools.
//
// Lukt het ophalen niet, dan komt er een reden terug en geen lege lijst. Een mislukt
// verzoek mag nooit als 'alles is weg' worden gelezen: dat zou elke ochtend vals alarm
// geven zodra het token verloopt.
async function controleerWorkers(env) {
  if (!env.CF_API_TOKEN) return { reden: 'CF_API_TOKEN ontbreekt op de worker' };

  let verwacht;
  try {
    const res = await fetch(REGISTER_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { reden: `tools.json ophalen gaf HTTP ${res.status}` };
    verwacht = verwachteWorkers(await res.json());
  } catch (e) {
    return { reden: `tools.json ophalen mislukt: ${e && e.message ? e.message : String(e)}` };
  }

  let aanwezig;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts`,
      { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
    );
    if (!res.ok) {
      return {
        reden: `scriptlijst ophalen gaf HTTP ${res.status}; heeft CF_API_TOKEN ` +
          'leesrecht op Workers Scripts?',
      };
    }
    // Dit endpoint geeft de scripts van het account in een keer terug; er stonden er
    // vijf op 04-09-2026. Groeit dat ooit tot een lijst die wordt afgekapt, dan meldt
    // deze controle een Worker ten onrechte als ontbrekend en is paginering nodig.
    const data = await res.json();
    aanwezig = (data.result || []).map(s => s && s.id).filter(Boolean);
  } catch (e) {
    return { reden: `scriptlijst ophalen mislukt: ${e && e.message ? e.message : String(e)}` };
  }

  const ontbreekt = [...verwacht]
    .filter(([naam]) => !aanwezig.includes(naam))
    .map(([naam, waarvoor]) => ({ naam, waarvoor }));

  // Geen fout, wel iets om te zien: een Worker die er staat terwijl geen enkele tool
  // ernaar verwijst is ofwel een wees, ofwel een tool die zijn afhankelijkheid niet
  // in het register heeft staan. In dat tweede geval is de controle blind voor hem.
  const ongebruikt = aanwezig.filter(naam => !verwacht.has(naam)).sort();

  return { verwacht: verwacht.size, aanwezig: aanwezig.length, ontbreekt, ongebruikt };
}

async function getPermissions(env) {
  return JSON.parse(await env.PERMISSIONS.get('data') || '{}');
}

function cors(request) {
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || 'https://bouwman.tools',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  };
}

function ok(data, request, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(request), 'Content-Type': 'application/json' },
  });
}

// Let op: deze functie wordt met ctx.waitUntil losgelaten, dus het opslaan in
// beheer.html wacht er niet op en meldt altijd succes. De console.error-regels
// hieronder zijn de enige manier om te zien of het bijwerken van de policies
// werkelijk lukt. Meelezen kan met: npx wrangler tail --name access-beheer
async function syncCFAccess(permissions, env) {
  let gelukt = 0, overgeslagen = 0, mislukt = 0;
  const fouten = [];
  if (!env.CF_API_TOKEN) {
    console.error('syncCFAccess: CF_API_TOKEN ontbreekt op de worker; elke aanroep zal falen');
    fouten.push({ tool: '*', reden: 'CF_API_TOKEN ontbreekt op de worker' });
  }

  for (const [file, appId] of Object.entries(APP_IDS)) {
    let emails;
    if (file === 'portal.html') {
      // Iedereen met enige toegang kan de portal zien
      emails = Object.keys(permissions);
    } else {
      emails = Object.entries(permissions)
        .filter(([, t]) => t === 'all' || (Array.isArray(t) && t.includes(file)))
        .map(([e]) => e);
    }

    if (emails.length === 0) { overgeslagen++; continue; }

    const pRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${appId}/policies`,
      { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
    );
    if (!pRes.ok) {
      console.error(`syncCFAccess ${file}: policies ophalen gaf HTTP ${pRes.status}`);
      fouten.push({ tool: file, reden: `policies ophalen gaf HTTP ${pRes.status}` });
    }
    const pData = await pRes.json();
    const policy = pData.result?.[0];
    if (!policy) {
      mislukt++;
      console.error(`syncCFAccess ${file}: geen policy gevonden om bij te werken; ` +
        `antwoord: ${JSON.stringify(pData).slice(0, 300)}`);
      fouten.push({ tool: file, reden: 'geen policy gevonden om bij te werken' });
      continue;
    }

    const put = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${appId}/policies/${policy.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...policy,
          include: emails.map(e => ({ email: { email: e } })),
        }),
      }
    );
    if (!put.ok) {
      mislukt++;
      const tekst = (await put.text()).slice(0, 300);
      console.error(`syncCFAccess ${file}: policy bijwerken gaf HTTP ${put.status}: ${tekst}`);
      fouten.push({ tool: file, reden: `policy bijwerken gaf HTTP ${put.status}` });
    } else {
      gelukt++;
      console.log(`syncCFAccess ${file}: policy bijgewerkt met ${emails.length} adres(sen)`);
    }
  }

  console.log(`syncCFAccess klaar: ${gelukt} bijgewerkt, ${overgeslagen} overgeslagen ` +
    `(niemand heeft recht), ${mislukt} mislukt`);

  // Bewaren zodat beheer.html kan melden of het bijwerken werkelijk lukte.
  await schrijfStatus(env, STATUS_SYNC, {
    tijdstip: new Date().toISOString(),
    gelukt, overgeslagen, mislukt, fouten,
  });
}
