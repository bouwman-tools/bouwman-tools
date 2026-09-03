# bouwman-tools

Verzamel- en publicatierepository voor de tools op bouwman.tools. Aanvullend op de
globale instructies en op de `CLAUDE.md` van `AI_kopgroep`. Neem hier alleen
projectspecifieke informatie op; geen klantnamen, secretwaarden of absolute paden.

## Rol en bron van waarheid

- Deze repo bevat de **publieke** versies van de tools plus de eigen bestanden van het
  portaal (o.a. `portal.html`, `beheer.html`, worker-, publicatie-, documentatie- en
  configuratiebestanden).
- Voor elke tool is de **individuele toolrepo de bron van waarheid**. De hier gepubliceerde
  HTML is een **kopie** die door de sync-workflow wordt geplaatst.

## Vaste regel: nooit rechtstreeks een gesyncte tool-HTML hier bewerken

- Wijzig een tool altijd in zijn **eigen toolrepo**; die publiceert zichzelf via de
  sync-workflow naar deze repo.
- Bewerk in deze repo uitsluitend de **eigen bestanden van de verzamelrepo** (portal,
  beheer, docs, worker, publicatie/config).
- Een directe bewerking van een gesyncte tool-HTML hier wordt bij de eerstvolgende sync
  **teruggedraaid**, omdat de toolrepo de kopie overschrijft. Dit is in aug 2026
  aantoonbaar gebeurd.

## Werk altijd vanuit een bijgewerkte kloon

Begin werk in deze repo altijd met `git status` gevolgd door `git pull --ff-only`:
de remote beweegt door de sync-workflows van de toolrepo's en door andere sessies,
zonder dat een lokale kloon dat vanzelf ziet (`git status` raadpleegt de remote
niet). Commit nooit vanuit een kopie waarvan je de achterstand niet hebt
gecontroleerd; `--ff-only` maakt een scheefgelopen kopie zichtbaar in plaats van
stil te mergen.

## tools.json is de enige bron van de toolportefeuille

`tools.json` legt per tool vast: naam, de korte beschrijving, bestand of URL, categorie,
status, bronrepo, het Cloudflare Access-app-id, welke jaarafhankelijke waarden erin zitten
en wie de inhoudelijk verantwoordelijke is. Voeg je een tool toe of haal je er een weg, dan
begin je daar. `tools.schema.json` beschrijft de toegestane velden; `check_tools.py`
valideert daartegen zodra `jsonschema` beschikbaar is.

- `portal.html`, `beheer.html`, `access-beheer-worker.js` (APP_IDS) en `TOOLS.md` moeten
  daarmee overeenkomen. Houd nergens een tweede lijst bij.
- `beschrijving` is de tekst op de toolkaart in het portaal en is **verplicht**.
  `portal.html` haalt hem sinds 03-09-2026 op met een `fetch('tools.json')` in
  `getBeschrijvingen()`; in de `TOOLS`-lijst daar staat alleen nog wat presentatie is
  (zichtbaarheid, indeling, icoon, tags). Mislukt het ophalen, dan verschijnt de kaart
  zonder beschrijving in plaats van dat het portaal breekt. `tools.json` staat
  onafgeschermd op `https://bouwman.tools/tools.json`; het bestand staat toch al in deze
  publieke repo, maar zet er dus niets in wat niet openbaar mag zijn.
- `beheer.html` toont geen beschrijvingen: daar staat per tool alleen de naam bij een
  aanvinkvakje. In `TOOLS.md` staan de beschrijvingen als lijst onder de tabel van elke
  categorie, niet als tiende kolom, want dan wordt die tabel onleesbaar.
- `TOOLS.md` wordt **gegenereerd**: `python tools/check_tools.py --schrijf-tools-md`.
  Bewerk dat bestand niet met de hand.
- `python tools/check_tools.py` faalt bij drift, en draait ook in CI
  (`.github/workflows/check-tools.yml`). Een tool die gepubliceerd staat maar niet in
  `tools.json` voorkomt, laat de controle falen.
- Een tool zonder `access_app_id` is **niet afgeschermd**: het bestand is voor iedereen
  met de URL bereikbaar en rechten toekennen in `beheer.html` heeft er geen effect op.
  De controle rapporteert dat apart. `tools/maak_access_apps.py` maakt de ontbrekende
  apps aan; dat script draait de eigenaar zelf met een eigen `CF_API_TOKEN`.

## Nieuwe tools gaan direct het portaal in

Vaste afspraak (Sylvain, 29-08-2026): een nieuwe tool gaat meteen als `beta` het
portaal en het beheer in, zodat testgebruikers ermee aan de slag kunnen — niet
wachten op de fiscale beoordeling. Voorwaarde is wel dat de Access-app er eerst
staat (nooit onafgeschermd het portaal in). De bèta-status en `status_reden`
blijven staan tot de beoordeling is afgerond.

## Onderhoud van de jaarwaarden

De tools zijn fiscaal jaargebonden; onderhoud volgt de Belastingplan-cyclus:

- **September (Prinsjesdag):** per tool inventariseren welke voorstellen de
  jaarwaarden raken. Een voorstel is nog geen recht: niets wijzigen, alleen
  open punten vastleggen.
- **December (na het Staatsblad):** per tool het nieuwe jaarblok toevoegen in de
  **bronrepo** — elke waarde geverifieerd met vindplaats (skill
  `fiscale-bron-verificatie`), tests per rekenregel en grens — en syncen vóór
  1 januari. Daarna hier `jaarwaarden_gecontroleerd` bijwerken.
- **Tussentijds:** bevindingen van gebruikers, besluiten of rechtspraak worden een
  issue in de bronrepo en gaan door dezelfde molen: bron erbij, test erbij, nooit
  stil fixen.

De bewaking zit in `check_tools.py`: een controle op of na 1 september van het
voorgaande jaar telt als actueel voor het lopende jaar; ouder geeft een
waarschuwing, meer dan een jaar oud laat de controle falen. De check draait bij
elke push en maandelijks op schema. Een tool met jaarwaarden zonder controledatum
geeft een waarschuwing: leg de datum vast zodra de waarden in de bronrepo zijn
geverifieerd. Het vangnet in de tools zelf blijft leidend: een onbekend boekjaar
geeft een melding en rekent nooit stil door op oude waarden.

## Eigenaarschap en vrijgave

Elke tool heeft één inhoudelijk verantwoordelijke, de eigenaar: die beoordeelt of de
tool vakinhoudelijk klopt en accordeert wijzigingen. Bouw en onderhoud blijven bij
Sylvain. In `tools.json` staat per tool `eigenaar`, `beoordelingsritme`
(`belastingplan`, `jaarlijks` of `geen`) en `laatst_beoordeeld`.

- Bij elke publicatie die het gedrag raakt, krijgt de eigenaar een **vrijgavenotitie**:
  wat is gewijzigd, welke fiscale waarden dat raakt met vindplaats, de uitslag van de
  testset en wat hij concreet moet beoordelen. De notitie staat in de **bronrepo** als
  `vrijgave-<repo-naam>-<JJJJ-MM-DD>.md` en gaat per mail naar de eigenaar. De opzet
  staat in de skill `release-en-sync`, sectie 6.
- `laatst_beoordeeld` werk je pas bij als de eigenaar echt heeft gereageerd. Versturen
  is geen accorderen.
- Ontbrekend eigenaarschap en een verlopen accordering **blokkeren niet**: de tool
  blijft live en `check_tools.py` meldt de achterstand. Afgesproken 01-09-2026; de
  eigenaren zelf waren op dat moment nog niet toegewezen, vandaar `tbd`.
- De periodieke controlerondes staan in de skill `onderhoud-en-jaarwerk`.

## Sync-mechanisme

- Elke toolrepo heeft `.github/workflows/sync-to-bouwman-tools.yml`.
- Trigger: push naar de defaultbranch (sommige repos ook `workflow_dispatch`).
- De job cloont deze repo, kopieert één HTML-bestand en pusht; bij geen wijziging volgt
  geen commit.

## De workers worden niet vanuit deze repo gedeployd

Vastgesteld op 28-08-2026. Er draaien drie workers op het account: `access-beheer`,
`wkr-agent` en `kennisgroepen-agent`. Geen daarvan heeft een deploy-configuratie in deze
repository; ze zijn los geupload.

- `access-beheer-worker.js` hier is een **kopie**, en die kopie loopt in de praktijk voor
  op wat er draait. Op 02-09-2026 bleek de gedeployde versie `xaf_export.html` te missen:
  die was op 29-08-2026 wel in de kopie gezet maar nooit gedeployd, en dat viel niemand op
  omdat `check_tools.py` de repository controleert en niet het account. Rechten toekennen
  aan een tool die live niet in `APP_IDS` staat, doet niets.
- Controleer de werkelijke toestand daarom aan de bron: lees `APP_IDS` uit de draaiende
  worker en leg die naast deze kopie. Een wijziging hier gaat pas live als je de worker
  apart deployt.
- Deployen kan zonder bindings te verliezen via het content-endpoint van de Workers-API
  (`PUT /accounts/<acc>/workers/scripts/access-beheer/content`, multipart met
  `main_module`). Dat vervangt alleen de code; de KV-binding `PERMISSIONS` en de secrets
  `ADMIN_TOKEN` en `CF_API_TOKEN` blijven staan. Zo is het op 02-09-2026 gedaan
  (versie 5da12ce2). Terugrollen doe je door de vorige versie opnieuw te deployen;
  daarvóór draaide 101987dc van 29-08-2026.
- Sinds 03-09-2026 kan het eenvoudiger, met de configuratie die hier inmiddels staat:
  `npx wrangler deploy -c wrangler.access-beheer.jsonc --keep-vars` vanuit deze map. Dat
  is die dag gedaan om `berekeningen.html` in `APP_IDS` live te krijgen; de KV-binding
  `PERMISSIONS` bleef bestaan. Draaiende versie daarna: 22899ac8, daarvóór 5da12ce2.
  Terugrollen kan met `npx wrangler rollback --name access-beheer`.
- **Deployen alleen is niet genoeg.** `syncCFAccess` loopt uitsluitend bij een opslag- of
  verwijderactie op een gebruiker, niet periodiek. Heb je rechten toegekend vóór de
  deploy, dan staat de Access-policy nog op de oude lijst: sla daarna in `beheer.html`
  één keer een gebruiker op om alle policies te laten herschrijven. Op 03-09-2026 leek
  het toekennen bij Berekeningen te lukken terwijl de policy alleen de eigenaar bevatte,
  precies om deze reden.
- De sync loopt in `ctx.waitUntil` en **slikt fouten**. Is de `CF_API_TOKEN` op de worker
  verlopen, dan mislukt het bijwerken van de policies voor alle tools zonder melding.
  Controleer bij twijfel de policy aan de bron:
  `GET /accounts/<acc>/access/apps/<app_id>/policies` en kijk of de verwachte adressen
  erin staan.
- **Let op de valstrik:** `wrangler.toml` in deze repo beschrijft een worker `kvk-proxy`
  met `main = kvk-worker.js`. Die worker bestaat niet op het account. `wrangler deploy`
  vanuit deze map maakt dus een nieuwe, ongebruikte worker aan en werkt `access-beheer`
  *niet* bij.
- Wijzig je `APP_IDS`, deploy de worker dan bewust (dashboard of een eigen
  wrangler-config met de juiste KV-binding en route) en controleer daarna dat
  `beheer.html` rechten kan toekennen aan de gewijzigde tools.

## Secrets — let op: de organisatie staat op GitHub Free

- Op **Free** werken **organisatie-Actions-secrets alleen voor publieke repos**. De private
  toolrepos kunnen een org-secret dus niet gebruiken.
- Daarom heeft **elke toolrepo een eigen repo-secret** `BOUWMAN_TOOLS_PAT`: een
  fine-grained PAT met resource owner `bouwman-tools`, doelrepo `bouwman-tools` en
  permission **Contents: read/write**.
- **Rotatie** = de nieuwe PAT in het repo-secret van elke toolrepo zetten
  (`gh secret set BOUWMAN_TOOLS_PAT -R bouwman-tools/<repo>`). Eén centraal org-secret zou
  een upgrade naar GitHub Team vereisen.
- Bewaak de **vervaldatum** van de PAT: een verlopen PAT laat alle syncs op authenticatie
  falen.

## Auth verifiëren zonder vals-positief

- Een sync-run kan groen zijn zonder echt te authenticeren: deze (publieke) repo clonen mag
  anoniem, en bij "geen wijziging" stopt de job vóór `git push`.
- Toets auth met een run die **echt `git push` bereikt**; `Everything up-to-date` in de log
  betekent geslaagde push-authenticatie.
