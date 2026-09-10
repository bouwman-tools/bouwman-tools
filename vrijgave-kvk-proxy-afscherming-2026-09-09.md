# KvK-proxy achter Access, 9 september 2026

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

- `wrangler.toml`: `workers_dev = false`, `preview_urls = false`, `[observability] enabled = true`,
  en een route `https://bouwman.tools/kvk-zoeker.html/api/*` op de zone `bouwman.tools`. Het adres
  is een kindpad van de pagina die Access al beschermt, dus de bescherming erft en de aanroep wordt
  same-origin. **De wildcard eist een segment achter `/api/`**: het kale `/api` valt buiten dit
  patroon, gaat naar de origin van de zone en geeft HTML terug. Zie de correctie hieronder.
- `kvk-worker.js`: alleen commentaar. De CORS-poort blijft staan, maar tegen de aanvaller uit dit
  dreigingsmodel is haar bijdrage nul: zij weert alleen een browser van een ander domein en geen
  `curl`. De bescherming is Access; noem CORS geen tweede slot.

Wat het precedent in deze repository wél en niet bewijst: `portal.html/api/permissions` is uitgerold
en `tools/check_admin_routes.py` toetst in CI dat Access dat kindpad in productie onderschept. Dat
is bewijs. `beheer.html/api/admin/*` staat in `wrangler.access-beheer.jsonc` als voorbereide route
met uitrolvoorwaarden, en de portaalnotitie zegt dat een login met een echte gebruiker daar nog niet
is getest; dat is configuratiebewijs en geen bewezen keten.

**In `kvk-zoeker`, branch `claude/kvk-zoneroute`:**

- `kvk-zoeker.html`: `KVK_WORKER` is `/kvk-zoeker.html/api/zoeken`, relatief aan de wortel. Twee
  correcties na de review van 10-09-2026, commit `f26b79d`. Eerst stond hier
  `https://bouwman.tools/kvk-zoeker.html/api`: dat kale `/api` matcht het routepatroon niet, dus de
  tool zou stuk zijn gegaan voor alle gebruikers zodra `workers_dev` uitgaat. En een absolute URL
  maakt een aanroep niet same-origin; de plek waar de pagina staat doet dat, dus een pad relatief
  aan de wortel is juister en blijft werken als het domein wijzigt. Zo doen `portal.html` en
  `beheer.html` het ook.
- `kvk-zoeker.html`: een verlopen Access-sessie geeft een inlogpagina in HTML. De pagina controleert
  nu het antwoordtype voordat zij parseert, toont "log opnieuw in" in plaats van `fout` per rij, en
  stopt de reeks. Zonder dat blijft de faalmodus bestaan waarmee weg A hierboven werd afgewezen,
  ook same-origin.

De worker zelf hoefde niet te wijzigen: hij kijkt niet naar het pad en accepteert `POST` op elk
adres. De KV-binding en de sleutel zijn ongemoeid.

## Uitrolvolgorde, en die is niet vrij

Elke andere volgorde legt de tool tijdelijk stil.

Elke stap is een uitrol van een branch. Niemand zet met de hand een vlag om en zet die later
terug: dat was de opzet vóór de review van 10-09-2026, en daarmee deed wie de branch gewoon
uitrolde stap 1 en stap 3 in één keer.

1. **Route erbij, oude adres nog open.** Rol `claude/kvk-proxy-zoneroute-stap1` uit. Daar staat
   `workers_dev = true`, dus het nieuwe adres werkt en het oude blijft werken. `preview_urls`
   staat ook daar op `false`, en dat is geen overbodige regel: previews volgen standaard
   `workers_dev`, dus in deze stap is die regel het enige dat previews dicht houdt.
2. **Publiceer de pagina.** Merge `claude/kvk-zoneroute` in `kvk-zoeker` naar `main`; de
   sync-workflow zet `kvk-zoeker.html` in `bouwman-tools`. Doe hierna verificatie 1 en 2.
3. **Sluit het oude adres.** Rol `claude/kvk-proxy-zoneroute` uit; daar staat
   `workers_dev = false`.
4. **Zet de sluiting onder de buitencontrole.** Voeg pas ná stap 3 deze twee regels toe aan
   `PORTAAL_PROEVEN` in `tools/check_admin_routes.py`. Eerder toevoegen laat de CI van deze
   repository falen zolang het oude adres nog open staat, en dat is terecht maar hinderlijk voor
   iedereen die intussen iets anders pusht.

   ```python
   ("bouwman.tools POST /kvk-zoeker.html/api/zoeken", "https://bouwman.tools/kvk-zoeker.html/api/zoeken", "POST", True, False),
   ("workers.dev POST kvk-proxy", "https://kvk-proxy.s-bouwman.workers.dev", "POST", False, False),
   ```

   De tweede is de echte wachter: die faalt zodra workers.dev weer opengaat. De eerste toetst dat
   Access het kindpad onderschept, en let op wat die niet kan zien: een inlogpagina komt er ook
   wanneer de worker helemaal niet wordt bereikt. Voor "de keten werkt" blijft verificatie 1
   hieronder nodig, en die vraagt een ingelogde gebruiker.

Wie stap 3 vóór stap 2 doet, haalt het adres weg dat de live pagina nog gebruikt. De stap-1-branch
mag nooit naar `master` en is geen eindstand.

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

De eerste is het bewijs dat de keten werkt, de tweede dat het gat dicht is. De eerdere versie van
deze notitie vroeg alleen om de tweede, en dat gaf een valse groene vink: een Access-inlogpagina
komt er ook wanneer de worker helemaal niet wordt bereikt, want Access dekt het kindpad ongeacht
wat erachter hangt. Die test bewijst dus Access-dekking en niets over de keten. Dezelfde les staat
al in `vrijgave-beheer-authenticatie-2026-09-07.md`: een anonieme HTTP 403 zonder loginredirect is
geen bewijs dat de nieuwe keten werkt.

1. **Ingelogd, op het exacte adres dat de pagina gebruikt.** `POST` op
   `https://bouwman.tools/kvk-zoeker.html/api/zoeken` met een JSON-body en de Access-cookie moet
   **JSON** teruggeven, geen HTML. Het eenvoudigst door in `kvk-zoeker.html` een bestand met één
   naam te verwerken en te kijken of er een KvK-nummer verschijnt. Krijg je HTML of gaat elke rij
   op `fout`, dan matcht het routepatroon niet en moet je niet doorgaan naar stap 3.
2. **Zonder login, van buiten:** dat adres geeft een Access-inlogpagina en geen JSON. Na stap 3
   geeft `POST https://kvk-proxy.s-bouwman.workers.dev` een **404 van Cloudflare**. Let op de
   formulering: met `workers_dev` uit blijft die naam resolven, het adres verdwijnt niet. Een 404
   is dus het goede antwoord en geen aanwijzing dat er iets mis is.
3. `npx wrangler deployments list` toont de nieuwe versie, en de route staat in het
   Cloudflare-dashboard onder de zone.

**Eén voorwaarde om vóór stap 3 in het dashboard na te kijken.** Staat op de Access-app van
`kvk-zoeker.html` de optie **Cookie Path Attribute** aan, dan is de cookie padgebonden en moet een
gebruiker die op `/kvk-zoeker.html` inlogt opnieuw inloggen voor een ander pad. Volgens de gewone
cookieregels dekt `/kvk-zoeker.html` ook `/kvk-zoeker.html/api/zoeken`, maar dat is een aanname en
niet gemeten; de portaalnotitie noemt dezelfde voorwaarde. Kijk daarom ook of er geen tweede,
specifiekere Access-app op het kindpad staat, want de meest specifieke regel gaat voor, en of er op
`kvk-proxy` nog een route bestaat die alleen in het dashboard is aangemaakt. De documentatie zegt
niet dat `wrangler deploy` routes verwijdert die niet in de configuratie staan.

## Wat dit niet is

De sleutel is niet vervangen en niet gelezen. `observability` staat sinds de review wel aan, dus
misbruik laat vanaf de uitrol een logregel achter.

Voor `kennisgroepen-agent` staat dezelfde vraag nog open: die heeft de zoneroute
`bouwman.tools/kg-api/*` die door geen Access-app wordt gedekt, en of die worker een eigen poort in
de code heeft is niet gemeten.

## Drie punten uit de review die openblijven, met een besluit van Sylvain

Deze wijziging kan zonder, maar ze horen bij het onderwerp en niemand vindt ze terug als ze hier
niet staan.

1. **De worker controleert zelf niets.** De hele bescherming zit in configuratie buiten Git.
   Verdwijnt de Access-app, komt er een Bypass-policy op, of raakt de route kwijt, dan staat de
   sleutel open zonder signaal. Dat dit hier echt gebeurt is bekend: deze worker was 51 dagen weg
   zonder dat iemand het merkte. De huisstandaard bestaat al: `access-beheer` valideert de
   Access-JWT in de worker zelf, `jose` staat in `package.json` en er zijn tests. Access zet
   `Cf-Access-Jwt-Assertion` op elk verzoek dat de worker bereikt.
2. **Access kan sinds 14-08-2026 op de worker zelf.** Dat dekt in één keer workers.dev, routes en
   previews, ongeacht welke vlaggen in `wrangler.toml` staan. De afwijzing van weg A hierboven
   blijft geldig voor een cross-origin aanroep naar workers.dev, maar niet voor weg A *naast* de
   zoneroute: de aanroep uit de pagina blijft dan same-origin en breekt niet. Dat is het echte
   tweede slot, in plaats van CORS. Niet gemeten of beide naast elkaar een bijwerking hebben.
3. **De sluiting is nog niet regressie-getest.** Dat is geen open ontwerpvraag meer: de twee regels
   voor `tools/check_admin_routes.py` staan uitgeschreven als stap 4 van de uitrol. Ze moeten er ná
   stap 3 in, anders faalt de CI van deze repository terecht maar hinderlijk. Blijft dit liggen, dan
   meldt niets het als de route of de Access-app ooit wegvalt, en dat is precies wat er in juli 51
   dagen lang niet werd gemeld.
