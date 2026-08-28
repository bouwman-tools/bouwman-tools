// Cloudflare Worker — gebruikersbeheer bouwman.tools
// KV binding: PERMISSIONS
// Secrets: ADMIN_TOKEN, CF_API_TOKEN
// Route: bouwman.tools/api/*

const CF_ACCOUNT_ID = '9f2508dc476f0183404720277152eb16';

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
  'gebruikelijk-loon.html':              '62f3756e-4c80-4a07-b273-dae319c0515e',
  'dividend-uitkeringstoets.html':       '0af36641-be18-415d-a6d8-c938fa8575da',
  'join-wkr-agent.html':                 'f143b890-7309-4d08-9768-a3b23e38f2b6',
  'btw-teruggaaf-eu.html':               'c0002856-50d1-49b9-b900-d5b782fdb766',
  'bewaarplicht.html':                   '51e5b742-ea7a-49ef-830d-4cb99a1a6f3b',
  'kvk-zoeker.html':                     '5efecdef-90f4-4067-8e6d-fe4091b17065',
  'join-prijsafspraken.html':            '58eeec00-dc06-4b2f-ae46-08855ad22a8f',
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
  }
};

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

async function syncCFAccess(permissions, env) {
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

    if (emails.length === 0) continue;

    const pRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${appId}/policies`,
      { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
    );
    const pData = await pRes.json();
    const policy = pData.result?.[0];
    if (!policy) continue;

    await fetch(
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
  }
}
