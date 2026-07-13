/**
 * KvK Worker — Cloudflare Worker (proxy + dagteller)
 * ────────────────────────────────────────────────────
 * Proxiet KvK API-aanroepen (voorkomt CORS) en telt ze dagelijks.
 * Bij het bereiken van de daglimiet volgt een push-melding via ntfy.sh.
 *
 * Ondersteunt twee modi:
 *   POST { rsin, apikey }        → { naam, count, drempel, melding }
 *   POST { handelsnaam, apikey } → { resultaten, count, drempel }
 *
 * KV binding : KV  (namespace: kvk-tracker)
 * Secrets    : KVK_API_KEY, NTFY_TOPIC
 */

const KVK_BASE_V1 = 'https://api.kvk.nl/api/v1/zoeken';
const KVK_BASE_V2 = 'https://api.kvk.nl/api/v2/zoeken';
const DREMPEL  = 500;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(request) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, request);
    }

    let body;
    try { body = await request.json(); } catch {
      return json({ error: 'Ongeldige JSON' }, 400, request);
    }

    const apikey      = (body.apikey      || env.KVK_API_KEY || '').trim();
    const rsin        = (body.rsin        || '').replace(/\D/g, '');
    const handelsnaam = (body.handelsnaam || '').trim();

    if (!apikey) {
      return json({ error: 'Geen KvK API-sleutel meegegeven' }, 400, request);
    }

    // ── Modus bepalen ─────────────────────────────────────────────────────────
    if (rsin.length === 9) {
      // RSIN-opzoeken (bestaand gedrag)
      const kvkRes = await fetch(`${KVK_BASE_V1}?rsin=${rsin}`, {
        headers: { 'apikey': apikey, 'Accept': 'application/json' },
      });

      if (!kvkRes.ok) {
        const foutTekst = await kvkRes.text().catch(() => '');
        return json({ error: `KvK HTTP ${kvkRes.status}`, detail: foutTekst }, 502, request);
      }

      const data = await kvkRes.json();
      const naam = data.resultaten?.[0]?.naam ?? null;
      const count = await incrementTeller(env, rsin);
      await stuurNtfy(env, count);

      return json({ naam, count, drempel: DREMPEL, melding: count >= DREMPEL }, 200, request);

    } else if (handelsnaam) {
      // Naam-zoeken: zoek op originele naam + omgedraaide woordvolgorde (max 4 woorden)
      // Hierdoor worden namen als "Figaro Kapsalon" ook gevonden als KvK "Kapsalon Figaro" heeft.
      try {
        const zoekTermen = [handelsnaam];
        const wn = handelsnaam.split(/\s+/).filter(w => w.length > 1 && !/^(b\.?v\.?|v\.?o\.?f\.?|n\.?v\.?)$/i.test(w));
        if (wn.length >= 2 && wn.length <= 4) {
          const omg = [...wn].reverse().join(' ');
          if (omg.toLowerCase() !== handelsnaam.toLowerCase()) zoekTermen.push(omg);
        }

        const gezien = new Set();
        const resultaten = [];
        for (const term of zoekTermen) {
          try {
            const url = `${KVK_BASE_V2}?naam=${encodeURIComponent(term)}&resultatenPerPagina=25`;
            const r   = await fetch(url, { headers: { 'apikey': apikey, 'Accept': 'application/json' } });
            if (!r.ok) continue;
            const data = await r.json();
            for (const item of (data.resultaten || [])) {
              if (item.type !== 'hoofdvestiging' && item.type !== 'rechtspersoon') continue;
              if (gezien.has(item.kvkNummer)) continue;
              gezien.add(item.kvkNummer);
              resultaten.push({
                kvkNummer: item.kvkNummer,
                naam:      item.naam,
                type:      item.type,
                plaats:    item.adres?.binnenlandsAdres?.plaats ?? item.adres?.buitenlandsAdres?.plaats ?? '',
                straat:    [item.adres?.binnenlandsAdres?.straatnaam, item.adres?.binnenlandsAdres?.huisnummer].filter(Boolean).join(' '),
              });
            }
          } catch { /* skip misslukte zoekterm */ }
        }

        const count = await incrementTeller(env, handelsnaam);
        await stuurNtfy(env, count);
        return json({ resultaten, count, drempel: DREMPEL }, 200, request);
      } catch (e) {
        return json({ error: 'Zoekfout', detail: e.message || '' }, 502, request);
      }

    } else {
      return json({ error: 'Geef rsin of handelsnaam mee' }, 400, request);
    }
  },
};

async function incrementTeller(env, _label) {
  const today  = new Date().toISOString().slice(0, 10);
  const key    = `calls-${today}`;
  const huidig = parseInt(await env.KV.get(key) || '0');
  const count  = huidig + 1;
  await env.KV.put(key, String(count), { expirationTtl: 172800 });
  return count;
}

async function stuurNtfy(env, count) {
  if (count === DREMPEL && env.NTFY_TOPIC) {
    await fetch(`https://ntfy.sh/${env.NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': 'KvK API: daglimiet bereikt',
        'Priority': 'high',
        'Tags': 'warning,money_with_wings',
      },
      body: `${count} KvK-aanroepen vandaag. Controleer de kosten.`,
    }).catch(() => {});
  }
}

function cors(request) {
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(request), 'Content-Type': 'application/json' },
  });
}
