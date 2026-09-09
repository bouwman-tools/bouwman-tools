# KvK-proxy achter Access, 10 september 2026

Technische standopname bij beslispunt 25. Geen fiscale of functionele wijziging aan de tool.

## Wat er open lag

De worker `kvk-proxy` bevat de sleutel `KVK_API_KEY` en was bereikbaar op
`kvk-proxy.s-bouwman.workers.dev`. Dat adres ligt buiten de zone `bouwman.tools` en kan door
Cloudflare Access niet worden beschermd. De enige poort was de CORS-controle in `kvk-worker.js`,
die een browser van een ander domein weert maar geen `curl`: die stuurt geen `Origin` mee, en de
worker kent geen authenticatie. De Access-app `KvK Nummers Zoeken` beschermt alleen de pagina
`bouwman.tools/kvk-zoeker.html`, niet het eindpunt dat de sleutel gebruikt.

## Waarom niet de kleine ingreep

Sylvain koos eerst weg A: een Access-app met destinationtype `worker` op deze worker. Dat is
gemeten en het breekt de tool. De pagina haalt de gegevens met een cross-origin `fetch` op; de
Access-cookie van `bouwman.tools` gaat niet mee naar `workers.dev`, en Cloudflare antwoordt dan met
een inlogpagina in HTML. Een `fetch` kan daar niets mee en valt stil, dus de gebruiker ziet "fout"
in plaats van een login. Na die meting koos hij weg B.

## Wat is gewijzigd

**In `bouwman-tools`, branch `claude/kvk-proxy-zoneroute`:**

- `wrangler.toml`: `workers_dev = false`, `preview_urls = false`, en een route
  `https://bouwman.tools/kvk-zoeker.html/api/*` op de zone `bouwman.tools`. Het adres is een
  kindpad van de pagina die Access al beschermt, dus de bescherming erft en de aanroep wordt
  same-origin. Datzelfde patroon gebruikt `access-beheer` al voor `beheer.html/api/admin/*` en
  `portal.html/api/*`.
- `kvk-worker.js`: alleen commentaar. De CORS-poort blijft staan als tweede slot; de tekst zegt nu
  dat Access de bescherming is en CORS niet meer het enige.

**In `kvk-zoeker`, branch `claude/kvk-zoneroute`, commit `5b22311`:**

- `kvk-zoeker.html`: `KVK_WORKER` wijst naar `https://bouwman.tools/kvk-zoeker.html/api`, met de
  reden erbij zodat niemand het terugzet naar een ander domein.

De worker zelf hoefde niet te wijzigen: hij kijkt niet naar het pad en accepteert `POST` op elk
adres. De KV-binding en de sleutel zijn ongemoeid.

## Uitrolvolgorde, en die is niet vrij

Elke andere volgorde legt de tool tijdelijk stil.

1. **Route eerst, `workers_dev` nog aan.** Zet in `wrangler.toml` tijdelijk `workers_dev = true`
   en rol uit. Nu werkt het nieuwe adres én blijft het oude werken.
2. **Publiceer de pagina.** Merge `claude/kvk-zoneroute` in `kvk-zoeker` naar `main`; de
   sync-workflow zet `kvk-zoeker.html` in `bouwman-tools`. Controleer daarna in een ingelogde
   browser dat de zoekopdracht werkt op het nieuwe adres.
3. **Sluit het oude adres.** Zet `workers_dev = false` terug en rol opnieuw uit.

Wie stap 3 vóór stap 2 doet, haalt het adres weg dat de live pagina nog gebruikt.

## Wat een mens moet doen, en met welk recht

De uitrol vraagt `wrangler` met een token dat de zone mag wijzigen; dat is niet in deze sessie
gedaan en de sleutel is niet gelezen. Beide commando's werken vanuit elke map:

```powershell
Set-Location "C:\Users\Sylvain\Documents\AI_kopgroep\bouwman-tools"; npx wrangler deploy
```

Voor de route heeft het token **Zone · Workers Routes · Edit** op `bouwman.tools` nodig, naast het
gewone uitrolrecht op de worker. Ontbreekt dat, dan faalt de deploy op de route en blijft de oude
situatie staan; dat is een veilige mislukking.

## Verificatie na de uitrol

Drie dingen, en het tweede is het bewijs dat het gat dicht is.

1. Ingelogd op `bouwman.tools`: de zoekopdracht in `kvk-zoeker.html` geeft resultaten.
2. Zonder login, van buiten: `POST https://bouwman.tools/kvk-zoeker.html/api` geeft een
   Access-inlogpagina en geen JSON, en `POST https://kvk-proxy.s-bouwman.workers.dev` geeft niets
   meer omdat dat adres niet bestaat.
3. `npx wrangler deployments list` toont de nieuwe versie, en de route staat in het
   Cloudflare-dashboard onder de zone.

## Wat dit niet is

De sleutel is niet vervangen en niet gelezen. `observability` staat voor deze worker nog uit, dus
misbruik zou geen logregel achterlaten; dat is een eigen punt en geen onderdeel van deze wijziging.
Voor `kennisgroepen-agent` staat dezelfde vraag nog open: die heeft de zoneroute
`bouwman.tools/kg-api/*` die door geen Access-app wordt gedekt, en of die worker een eigen poort in
de code heeft is niet gemeten.
