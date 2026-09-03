/* ---------------------------------------------------------------------------
 * kg-widget.js — Kennisgroepstandpunten-paneel voor andere bouwman.tools-tools
 *
 * Doel: één plek waar de zoeklogica tegen de kennisgroepen-database staat, zodat
 * die niet in elke tool opnieuw wordt gekopieerd en scheefgroeit. Een tool voegt
 * twee regels toe:
 *
 *   <div data-kg-query="gebruikelijk loon dga"></div>
 *   <script src="https://bouwman.tools/kg-widget.js" defer></script>
 *
 * Attributen op de div:
 *   data-kg-query  (verplicht) vaste zoekterm; nooit door de gebruiker ingevoerde gegevens
 *                  LET OP: de RPC combineert alle woorden met EN. Houd de term kort en
 *                  in gewone woorden. "gebruikelijk loon" levert 15 treffers,
 *                  "gebruikelijk loon dga art 12a" levert er nul.
 *   data-kg-titel  (optioneel) kop boven het paneel
 *   data-kg-max    (optioneel) aantal standpunten, standaard 5, maximaal 10
 *   data-kg-auto   (optioneel) "true" haalt direct bij laden op in plaats van na een klik
 *
 * Privacy: zonder data-kg-auto gaat er bij het laden van de pagina niets de deur
 * uit. Pas na een klik wordt de vaste zoekterm verstuurd. Ingevulde gegevens van
 * de gebruiker worden nooit meegestuurd; de widget leest geen invoervelden.
 *
 * Toegang: alleen lezen. De anon-sleutel is publishable en heeft via RLS geen
 * INSERT/UPDATE/DELETE op standpunten (zie supabase_migration_sync_runs.sql).
 *
 * Bron: repo kennisgroepen-zoeker. Wijzig dit bestand daar, niet in bouwman-tools.
 * ------------------------------------------------------------------------- */
(function (global) {
  'use strict';

  var CONFIG = {
    supabaseUrl:  'https://ztwzckdtwvsejyuewcmd.supabase.co',
    supabaseKey:  'sb_publishable_NO49ut-P4rxCoSqfjzfmUA_XU9aQk5m',
    zoekerUrl:    'https://bouwman.tools/kennisgroepen-zoeker.html',
    baseUrl:      'https://kennisgroepen.belastingdienst.nl',
    // Zelfde drempel als de zoeker zelf: filtert near-zero ts_rank_cd-scores weg.
    // Bewust conservatief; afkortingen als DGA en BOR scoren laag in Dutch FTS.
    minRelevantie: 0.005,
    standaardMax:  5,
    hardMax:      10,
    timeoutMs:  15000
  };

  // ─── Pure helpers (getest vanuit test_kg_widget.js) ────────────────────────

  function escHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(url) {
    if (!url) return '';
    try {
      var u = new URL(url);
      if (u.protocol === 'http:' || u.protocol === 'https:') return url;
    } catch (e) { /* geen geldige URL */ }
    return '';
  }

  // Voorkeur voor de opgeslagen url; anders opbouwen uit de slug.
  function standpuntUrl(s, baseUrl) {
    var base = baseUrl || CONFIG.baseUrl;
    var u = safeUrl(s && s.url);
    if (u) return u;
    if (s && s.slug) return base + '/publicaties/' + s.slug + '/';
    return '';
  }

  // Ingetrokken en vervallen standpunten scoren in de FTS gewoon hoog mee. In een
  // paneel van vijf regels naast een berekening is dat gevaarlijk: de lezer ziet
  // een bron die niet meer geldt. De widget laat ze daarom weg; wie de volledige
  // geschiedenis wil, klikt door naar de zoeker.
  function isIngetrokken(s) {
    if (!s) return false;
    var slug = String(s.slug || '');
    if (/^(ingetrokken|vervallen)-/i.test(slug)) return true;
    var titel = String(s.titel || '');
    return /\b(ingetrokken|vervallen)\b/i.test(titel.slice(0, 40));
  }

  // Dedupliceert, gooit ingetrokken en te zwakke matches weg en kapt af op max.
  // De RPC levert al gesorteerd op relevantie DESC; die volgorde blijft staan.
  function filterRelevant(rows, min, max) {
    var drempel = (typeof min === 'number') ? min : CONFIG.minRelevantie;
    var limiet  = (typeof max === 'number') ? max : CONFIG.standaardMax;
    var seen = {}, out = [];
    for (var i = 0; i < (rows || []).length; i++) {
      var r = rows[i];
      if (!r) continue;
      if (isIngetrokken(r)) continue;
      var score = (typeof r.relevantie === 'number') ? r.relevantie : null;
      if (score !== null && score < drempel) continue;
      var key = r.kenmerk || r.slug || r.titel;
      if (!key || seen[key]) continue;
      seen[key] = true;
      out.push(r);
      if (out.length >= limiet) break;
    }
    return out;
  }

  function leesMax(waarde) {
    var n = parseInt(waarde, 10);
    if (!isFinite(n) || n < 1) return CONFIG.standaardMax;
    return Math.min(n, CONFIG.hardMax);
  }

  function formatDatum(d) {
    if (!d) return '';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    try {
      return dt.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dt.toISOString().slice(0, 10);
    }
  }

  // Permalink naar de zoeker: op kenmerk als dat er is, anders op vrije zoekterm.
  function zoekerLink(query, kenmerk, zoekerUrl) {
    var basis = zoekerUrl || CONFIG.zoekerUrl;
    var param = kenmerk ? ('kenmerk=' + encodeURIComponent(kenmerk))
                        : ('q=' + encodeURIComponent(query || ''));
    return basis + '?' + param;
  }

  // ─── Netwerk ───────────────────────────────────────────────────────────────

  function haalStandpunten(query, max) {
    var headers = {
      'apikey': CONFIG.supabaseKey,
      'Authorization': 'Bearer ' + CONFIG.supabaseKey,
      'Content-Type': 'application/json'
    };
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, CONFIG.timeoutMs);
    var opts = {
      method: 'POST',
      headers: headers,
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ query_text: query, max_results: max * 3 })
    };

    return fetch(CONFIG.supabaseUrl + '/rest/v1/rpc/zoek_standpunten_ranked', opts)
      .then(function (r) {
        if (!r.ok) throw new Error('rpc_' + r.status);
        return r.json();
      })
      .then(function (rows) {
        var uit = filterRelevant(rows, CONFIG.minRelevantie, max);
        if (uit.length > 0) return uit;
        return restFallback(query, max, ctrl);
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') throw e;
        return restFallback(query, max, ctrl);
      })
      .then(function (rows) { clearTimeout(timer); return rows; },
            function (e)   { clearTimeout(timer); throw e; });
  }

  // Fallback als de RPC ontbreekt of niets boven de drempel oplevert.
  function restFallback(query, max, ctrl) {
    var sel = 'titel,kenmerk,belastingsoort,datum,url,slug';
    var q = encodeURIComponent(query);
    var url = CONFIG.supabaseUrl + '/rest/v1/standpunten?select=' + sel +
              '&or=(titel.wfts(dutch).' + q + ',inhoud.wfts(dutch).' + q + ')' +
              '&order=datum.desc&limit=' + max;
    return fetch(url, {
      headers: {
        'apikey': CONFIG.supabaseKey,
        'Authorization': 'Bearer ' + CONFIG.supabaseKey
      },
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        if (!r.ok) throw new Error('rest_' + r.status);
        return r.json();
      })
      .then(function (rows) { return filterRelevant(rows, -1, max); });
  }

  // ─── Stijl ─────────────────────────────────────────────────────────────────

  var STYLE_ID = 'kgw-style';
  var CSS = [
    '.kgw{--kgw-navy:#1E2D4E;--kgw-mint:#3DD9A0;--kgw-muted:#6b7a99;--kgw-border:#e0e4ec;',
    'font-family:inherit;background:#fff;border:1px solid var(--kgw-border);border-radius:10px;',
    'padding:18px 20px;margin:20px 0;color:var(--kgw-navy);max-width:100%;}',
    '.kgw-title{font-weight:800;font-size:15px;display:flex;align-items:center;gap:8px;margin:0 0 4px;}',
    '.kgw-title::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--kgw-mint);flex:0 0 auto;}',
    '.kgw-note{font-size:12px;color:var(--kgw-muted);margin:0 0 12px;line-height:1.5;}',
    '.kgw-btn{font-family:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--kgw-navy);',
    'border:0;border-radius:6px;padding:8px 16px;cursor:pointer;}',
    '.kgw-btn:hover{background:#16223c;}',
    '.kgw-btn[disabled]{opacity:.55;cursor:default;}',
    '.kgw-list{list-style:none;margin:12px 0 0;padding:0;}',
    '.kgw-list li{padding:10px 0;border-top:1px solid var(--kgw-border);}',
    '.kgw-list li:first-child{border-top:0;}',
    '.kgw-list a{color:var(--kgw-navy);font-weight:700;font-size:14px;text-decoration:none;line-height:1.4;}',
    '.kgw-list a:hover{text-decoration:underline;}',
    '.kgw-meta{font-size:11px;color:var(--kgw-muted);margin-top:3px;}',
    '.kgw-foot{margin-top:12px;padding-top:10px;border-top:1px solid var(--kgw-border);',
    'font-size:11px;color:var(--kgw-muted);line-height:1.5;}',
    '.kgw-foot a{color:var(--kgw-navy);font-weight:700;}',
    '.kgw-status{font-size:13px;color:var(--kgw-muted);margin-top:10px;line-height:1.5;}'
  ].join('');

  function injectStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var st = doc.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(st);
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  function el(tag, cls, tekst) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (tekst != null) n.textContent = tekst;
    return n;
  }

  function metaRegel(s) {
    var delen = [];
    if (s.kenmerk) delen.push(s.kenmerk);
    if (s.belastingsoort) delen.push(s.belastingsoort);
    var d = formatDatum(s.datum);
    if (d) delen.push(d);
    return delen.join(' · ');
  }

  function renderLijst(host, rows, query) {
    var oud;
    while ((oud = host.querySelector('.kgw-list, .kgw-status, .kgw-foot'))) oud.remove();

    if (!rows.length) {
      host.appendChild(el('div', 'kgw-status',
        'Geen gepubliceerd standpunt over dit onderwerp gevonden. Dat betekent dat de ' +
        'Belastingdienst hier niets over publiceerde, niet dat er geen regel geldt.'));
      return;
    }

    var ul = el('ul', 'kgw-list');
    rows.forEach(function (s) {
      var li = el('li');
      var url = standpuntUrl(s);
      if (url) {
        var a = el('a', null, s.titel || s.kenmerk || 'Standpunt');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
      } else {
        li.appendChild(el('span', null, s.titel || s.kenmerk || 'Standpunt'));
      }
      var m = metaRegel(s);
      if (m) li.appendChild(el('div', 'kgw-meta', m));
      ul.appendChild(li);
    });
    host.appendChild(ul);

    var foot = el('div', 'kgw-foot');
    var link = el('a', null, 'Verder zoeken in de Kennisgroepen Zoeker →');
    link.href = zoekerLink(query, null);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    foot.appendChild(link);
    foot.appendChild(document.createElement('br'));
    foot.appendChild(document.createTextNode(
      'Een kennisgroepstandpunt is de opvatting van de Belastingdienst over de toepassing ' +
      'van de wet. Het bindt de inspecteur, niet de rechter en niet de belastingplichtige. ' +
      'Ingetrokken en vervallen standpunten worden hier weggelaten; de zoeker toont ze wel.'));
    host.appendChild(foot);
  }

  function bouwPaneel(node) {
    var query = (node.getAttribute('data-kg-query') || '').trim();
    if (!query) return;
    var max   = leesMax(node.getAttribute('data-kg-max'));
    var titel = node.getAttribute('data-kg-titel') || 'Kennisgroepstandpunten van de Belastingdienst';
    var auto  = node.getAttribute('data-kg-auto') === 'true';

    injectStyle(node.ownerDocument || document);
    node.classList.add('kgw');
    node.textContent = '';
    node.appendChild(el('div', 'kgw-title', titel));

    var note = el('p', 'kgw-note');
    note.textContent = auto
      ? 'Standpunten over "' + query + '". Uw ingevulde gegevens worden niet verstuurd.'
      : 'Alleen het onderwerp "' + query + '" wordt verstuurd. Uw ingevulde gegevens blijven in deze browser.';
    node.appendChild(note);

    var btn = el('button', 'kgw-btn', 'Standpunten ophalen');
    btn.type = 'button';

    function laden() {
      btn.disabled = true;
      btn.textContent = 'Bezig…';
      haalStandpunten(query, max)
        .then(function (rows) {
          btn.remove();
          renderLijst(node, rows, query);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Opnieuw proberen';
          var st = node.querySelector('.kgw-status');
          if (!st) { st = el('div', 'kgw-status'); node.appendChild(st); }
          st.textContent = 'De standpunten konden niet worden opgehaald.';
        });
    }

    btn.addEventListener('click', laden);
    node.appendChild(btn);
    if (auto) laden();
  }

  function init() {
    var nodes = document.querySelectorAll('[data-kg-query]');
    for (var i = 0; i < nodes.length; i++) {
      // De widget mag de tool waarin hij staat nooit kunnen breken.
      try { bouwPaneel(nodes[i]); } catch (e) { /* stil falen */ }
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    global.KgWidget = { init: init, config: CONFIG };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      escHtml: escHtml, safeUrl: safeUrl, standpuntUrl: standpuntUrl,
      isIngetrokken: isIngetrokken, filterRelevant: filterRelevant,
      leesMax: leesMax, formatDatum: formatDatum,
      zoekerLink: zoekerLink, CONFIG: CONFIG
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
