// Cloudflare Worker — gebruikersbeheer bouwman.tools
// KV binding: PERMISSIONS
// Secrets: ADMIN_TOKEN, CF_API_TOKEN
// Route: bouwman.tools/api/*

const CF_ACCOUNT_ID = '9f2508dc476f0183404720277152eb16';

const APP_IDS = {
  'portal.html':                         '4f132e0b-6557-4726-8371-111024d21f39',
  'betalingskenmerk.html':               'd0924bf1-e6c1-4098-8573-ac651b860b51',
  'Join-jaarrekening-review.html':       '8a515a1c-6b83-4d4c-9c1d-b42a7a9b61a8',
  'auto-fiscaal-2027.html':              'a504237d-750a-476b-95e8-2396a872e6fa',
  'join-auto-rekenmodel.html':           '484f3fb2-f173-44df-9d69-6f6aefbccdac',
  'bv_janee_DK.html':                    '6bf2694f-c9db-4255-84ad-547e830908f9',
  'join-bv-documenten.html':             '221ef623-dadc-4421-be69-efe6ee3c774f',
  'rc-schuld-dga.html':                  '287f71cc-2a57-473c-a23a-a9b79eb908f7',
  'herstructurering-assistent-v3.html':  '7f21b48f-27eb-4609-b6c7-ea860acdd85b',
  'join-wkr-agent-intern.html':          '85322344-25d4-41cd-9b08-9c79da74bb28',
  'join-wkr-agent-extern.html':          'b98bbe15-1440-4ca4-8af1-cc12517e098f',
  'nhg-werkgeversverklaring-wizard.html':'e3163f39-b8bc-4e78-9bdd-6215a2f3903e',
  'kennisgroepen-zoeker.html':           '64df23ef-f0d3-4fbb-8663-fdd8d087b58d',
  'join-prijsafspraken.html':            '58eeec00-dc06-4b2f-ae46-08855ad22a8f',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '') || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(request) });
    }

    // Publiek: rechten ophalen voor één gebruiker (gebruikt door portal.html)
    if (path === '/permissions' && request.method === 'POST') {
      const { email } = await request.json();
      const permissions = await getPermissions(env);
      const access = email ? (permissions[email] ?? 'all') : 'all';
      return ok({ access }, request);
    }

    // Admin-endpoints — vereisen ADMIN_TOKEN header
    if (request.headers.get('X-Admin-Token') !== env.ADMIN_TOKEN) {
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
      await syncCFAccess(permissions, env);
      return ok({ ok: true }, request);
    }

    if (path === '/admin/delete' && request.method === 'POST') {
      const { email } = await request.json();
      if (!email) return ok({ error: 'email verplicht' }, request, 400);
      const permissions = await getPermissions(env);
      delete permissions[email];
      await env.PERMISSIONS.put('data', JSON.stringify(permissions));
      await syncCFAccess(permissions, env);
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
