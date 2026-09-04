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
icoon en labels, status, bronrepo, het Cloudflare Access-app-id, welke jaarafhankelijke
waarden erin zitten en wie de inhoudelijk verantwoordelijke is. Voeg je een tool toe of
haal je er een weg, dan begin je daar. `tools.schema.json` beschrijft de toegestane
velden; `check_tools.py` valideert daartegen zodra `jsonschema` beschikbaar is.

- **`portal.html` en `beheer.html` houden sinds 04-09-2026 geen eigen toollijst meer bij.**
  Beide halen `tools.json` op met een `fetch` en filteren op `in_portal` respectievelijk
  `in_beheer`; naam, beschrijving, categorie, `icon` en `tags` komen daaruit, en
  `categorievolgorde` bepaalt in beide de volgorde van de koppen. Een tool krijgt dus een
  kaart zodra het register dat zegt. Daarvoor stond die lijst in de pagina zelf, en op
  04-09-2026 bleek waarom dat misgaat: `herziening-btw` was geregistreerd, afgeschermd en
  gesynct maar had geen kaart, en bestond daardoor niet voor collega's. `APP_IDS` in
  `access-beheer-worker.js` is de enige eigen lijst die nog over is; die vergelijkt
  `check_tools.py` regel voor regel met het register.
- **De bèta-tag staat niet in `tags`**: `portal.html` leidt die af uit `status`, anders
  zou de status op twee plekken in het register staan. De controle faalt op een
  bèta-label in `tags`.
- Faalt het ophalen van `tools.json`, dan tonen beide pagina's een melding en niets
  anders. Een lege pagina zou niet te onderscheiden zijn van "je hebt nergens toegang
  tot", en in `beheer.html` zou opslaan dan de rechten van een gebruiker wissen.
- `beschrijving` is de tekst op de toolkaart in het portaal en is **verplicht**;
  `icon` is verplicht zodra `in_portal` true is. `tools.json` staat onafgeschermd op
  `https://bouwman.tools/tools.json`, en ook op `raw.githubusercontent.com`, want deze
  repo is publiek. Afschermen van de URL helpt daar niet tegen. Zet er dus niets in wat
  niet openbaar mag zijn; wat er nu in staat, staat er bewust (zie beslispunt 24).
- `bestand_in_repo: false` betekent: de pagina staat wel op bouwman.tools, maar een eigen
  Worker serveert haar en het bestand hoort hier bewust niet te staan omdat de
  git-historie publiek is. Zo is `modellen-naar-tools.html` opgenomen. De controle
  verwacht het bestand dan niet in de repo, en faalt juist als het er wel staat.
- `beheer.html` toont geen beschrijvingen: daar staat per tool alleen de naam bij een
  aanvinkvakje. In `TOOLS.md` staan de beschrijvingen als lijst onder de tabel van elke
  categorie, niet als tiende kolom, want dan wordt die tabel onleesbaar.
- `TOOLS.md` wordt **gegenereerd**: `python tools/check_tools.py --schrijf-tools-md`.
  Bewerk dat bestand niet met de hand.
- Een tool met status `concept` is nog niet gepubliceerd: het bestand staat alleen in
  de bronrepo. Zo staat werk in uitvoering toch in `tools.json` en in `TOOLS.md`, zonder
  dat de controle struikelt op een bestand dat hier ontbreekt. `bestand` blijft verplicht
  en noemt de beoogde naam. De controle keert het ook om: staat het bestand hier wel, of
  is `in_portal` of `in_beheer` true, dan faalt hij en moet de status naar `beta` of
  `live`. Een concepttool geeft geen waarschuwing over een ontbrekende Access-app, want
  er is nog niets bereikbaar.
- `python tools/check_tools.py` faalt bij drift, en draait ook in CI
  (`.github/workflows/check-tools.yml`). Een tool die gepubliceerd staat maar niet in
  `tools.json` voorkomt, laat de controle falen. Bij `portal.html` en `beheer.html`
  toetst de controle het mechanisme in plaats van een lijst: halen zij het register op,
  filteren zij op de juiste vlag, gebruiken zij `categorievolgorde`, en staat er geen
  losse bestandsnaam meer in de pagina die stil kan gaan afwijken.
- **`workers` legt vast van welke Cloudflare Worker een tool afhangt** en
  `portaalworkers` doet dat voor het portaal zelf. Daar draait de dagelijkse
  workercontrole op; zie "Een verdwenen Worker merk je niet aan de tool".
- Een tool zonder `access_app_id` is **niet afgeschermd**: het bestand is voor iedereen
  met de URL bereikbaar en rechten toekennen in `beheer.html` heeft er geen effect op.
  De controle rapporteert dat apart. `tools/maak_access_apps.py` maakt de ontbrekende
  apps aan; dat script draait de eigenaar zelf met een eigen `CF_API_TOKEN`.

## Wat hier openbaar mag staan

Deze repository is publiek en dat is geen toeval: het portaal draait op GitHub Pages, en
op GitHub Free publiceert Pages alleen uit een publieke repository. Nagemeten 04-09-2026:
de organisatie `bouwman-tools` staat op Free. De repository privé maken haalt het portaal
dus offline, en een privé Pages-site achter toegangscontrole vraagt zelfs GitHub
Enterprise Cloud.

Een afzonderlijk bestand afschermen is daarom geen oplossing, en op 04-09-2026 ook
mislukt: een eigen Access-app op `tools.json` liet de `fetch` uit `portal.html` stuklopen
en `beheer.html` dicht blijven, en `raw.githubusercontent.com` geeft het bestand toch.
De vraag gaat over de hele repository en niet over een bestand. `tools.json`, `TOOLS.md`,
`AGENTS.md` en `update-bram.md` dragen dezelfde soort interne informatie, en `TOOLS.md`
wordt zelfs uit `tools.json` gegenereerd. Een daarvan dichtzetten verandert niets.

**Besloten 04-09-2026 (beslispunt 24): het register blijft openbaar.** Wat erin staat is de
toestand van de portefeuille, dus eigenaar, status, beoordelingsdatum en welke uitgangen
ontbreken. Dat is dezelfde strekking als wat een gebruiker op de toolkaart al ziet aan het
bèta-label. Wat er niet in hoort, hoort ook nergens anders in deze repository:

- klantnamen, klantwaarden en daarvan afgeleide gegevens;
- secrets, tokens en API-sleutels;
- oordelen over personen of over het werk van anderen;
- wat een vertrouwelijke afspraak of een lopende onderhandeling raakt.

Hoort iets in die categorie, dan gaat het naar `PostbusClaude`, dat buiten alle
repositories staat, of naar een privérepository met een Worker die de pagina op een exacte
route serveert, zoals `modellen-roadmap` doet.

Moet het register later toch worden afgeschermd, dan is de enige route zonder betaald plan:
de presentatievelden hier publiek houden, want portaal, beheer en `check_tools.py` hebben
die nodig, en `eigenaar`, `status_reden`, `laatst_beoordeeld`, `jaarwaarden_gecontroleerd`
en `uitgangen` naar die privérepo verhuizen, met een controle die de id's van beide helften
naast elkaar legt. Het register volledig verhuizen kan niet: dan kan de CI van deze
publieke repo de drift niet meer controleren.

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
- Op 04-09-2026 opnieuw zo gedeployd, om de vier Access-apps van dat moment in `APP_IDS`
  live te krijgen: `transitievergoeding.html`, `dcf-rekentool.html`, `rc-rente.html` en
  `dividend-scenarios.html`. De KV-binding `PERMISSIONS` bleef opnieuw bestaan. Draaiende
  versie daarna: 5aa32000, daarvóór 22899ac8. Let op: `npx wrangler whoami` en `deploy`
  doen er op deze machine ruim een minuut over en geven ondertussen geen uitvoer; dat is
  geen vastloper.
- Later op 04-09-2026 opnieuw gedeployd, versie 6692d0e3, daarvóór 5aa32000. Die deploy
  bracht twee dingen live: de scheduled-handler die afwijkingen nu ook herstelt in plaats
  van alleen te melden, en de app-id van `herziening-btw.html` die kort daarvoor in
  `APP_IDS` was gezet.
- Later op 04-09-2026 nogmaals, voor de laatste twee: `belastinglatentie.html` en
  `vastgoedrendement.html`. Daarmee heeft elke tool in de portefeuille een Access-app en
  is de sectie "niet afgeschermd" uit `TOOLS.md` verdwenen. De KV-binding bleef bestaan.
  Draaiende versie daarna: 2cac12df, daarvóór 5aa32000. Gecontroleerd aan de kant die
  ervan afhangt: beide URL's geven nu een 302 naar de Access-login, en
  `POST /permissions` op de worker antwoordt weer normaal.
- Later op 04-09-2026 nogmaals gedeployd, versie 790d6529, daarvoor acd2601d, voor de
  workercontrole hieronder. De KV-binding bleef bestaan. Gemeten aan de afhankelijke
  kant: portaal, beheer en de vier tools met een Worker geven alle een 302 naar de
  Access-login, `POST /permissions` antwoordt normaal en `GET /admin/status` geeft 200,
  gelijk aan de nulmeting van vlak voor de deploy.
- **Deployen alleen is niet genoeg — maar sinds 04-09-2026 herstelt de controle het zelf.**
  `syncCFAccess` loopt bij een opslag- of verwijderactie op een gebruiker, en daarnaast
  vanuit de dagelijkse controle van 06:00 UTC zodra die een afwijking vindt. Een nieuwe
  tool is dus uiterlijk de volgende ochtend bereikbaar voor wie er recht op heeft; wil je
  het meteen, sla dan een gebruiker op in `beheer.html`. Vóór die wijziging gold: Heb je rechten toegekend vóór de
  deploy, dan staat de Access-policy nog op de oude lijst: sla daarna in `beheer.html`
  één keer een gebruiker op om alle policies te laten herschrijven. Op 03-09-2026 leek
  het toekennen bij Berekeningen te lukken terwijl de policy alleen de eigenaar bevatte,
  precies om deze reden.
- De sync loopt in `ctx.waitUntil` en **slikt fouten**. Is de `CF_API_TOKEN` op de worker
  verlopen, dan mislukt het bijwerken van de policies voor alle tools zonder melding.
  Controleer bij twijfel de policy aan de bron:
  `GET /accounts/<acc>/access/apps/<app_id>/policies` en kijk of de verwachte adressen
  erin staan.
- **Let op de valstrik:** `wrangler.toml` in deze repo beschrijft een andere worker,
  `kvk-proxy` met `main = kvk-worker.js`. `wrangler deploy` zonder `-c` vanuit deze map
  werkt dus `kvk-proxy` bij en `access-beheer` *niet*. Tot 04-09-2026 stond hier dat
  `kvk-proxy` niet op het account bestond; die dag bleek waarom dat was en is hij
  teruggezet, dus zo'n deploy overschrijft nu een draaiende worker in plaats van een
  ongebruikte aan te maken.
- Wijzig je `APP_IDS`, deploy de worker dan bewust (dashboard of een eigen
  wrangler-config met de juiste KV-binding en route) en controleer daarna dat
  `beheer.html` rechten kan toekennen aan de gewijzigde tools.

## Een verdwenen Worker merk je niet aan de tool

Op 04-09-2026 bleek `kvk-zoeker.html` stuk terwijl hij op `live` stond, in het portaal
hing en netjes achter Access zat. De Worker `kvk-proxy` was van het account verdwenen,
met zijn secret erbij. De code stond nog in `kvk-worker.js` en `wrangler.toml` beschreef
hem al, dus `npx wrangler deploy` plus het opnieuw zetten van `KVK_API_KEY` was genoeg.
Waarom hij weg was is niet uit de gegevens te achterhalen.

Het probleem was dat niemand het merkte. `check_tools.py` controleert de repository en
kan het account per definitie niet zien; de dagelijkse controle in de worker keek naar de
Access-policies, en die klopten gewoon. Een tool kan dus volledig in orde lijken terwijl
de Worker eronder weg is.

Sinds 04-09-2026 kijkt de dagelijkse controle daarom ook naar de Workers:

- **Het register is de bron.** Per tool staat in `tools.json` in `workers` van welke
  Worker hij afhangt; `portaalworkers` noemt de Workers die bij geen enkele tool horen
  maar wel nodig zijn, nu alleen `access-beheer`. Zonder die tweede lijst zou juist de
  worker die het toegangsbeheer draagt als ongebruikt worden gemeld. Een eigen lijst in
  de worker zou hetzelfde probleem geven als de vier toollijsten die het register heeft
  vervangen.
- **Het bewijs is de scriptlijst van het account,** `/accounts/<acc>/workers/scripts`,
  niet of een adres antwoordt. Een 404 op workers.dev bewijst niets: `kennisgroepen-agent`
  en `modellen-roadmap` geven daar ook 404 omdat hun workers.dev-route uitstaat en zij op
  een route op `bouwman.tools` draaien.
- **Mislukt het ophalen, dan komt er een reden en geen lege lijst.** Een verlopen token
  mag nooit als "alle Workers zijn weg" worden gelezen. `beheer.html` meldt dan dat de
  controle niet kon kijken, want een controle die stil niets doet is precies wat hier
  misging.
- **Er wordt niet automatisch hersteld.** Een Worker terugzetten vraagt meestal ook het
  secret opnieuw, en dat kan alleen de eigenaar. Een lege huls neerzetten die er wel is
  maar niets doet, is erger dan een melding.
- **Het omgekeerde is geen fout maar wel zichtbaar:** een Worker op het account waar geen
  enkele tool naar verwijst, komt als losse regel in beheer. Dat is ofwel een wees, ofwel
  een tool die zijn afhankelijkheid niet in het register heeft staan, en in dat tweede
  geval is de controle blind voor die Worker.
- **Nu kijken kan ook:** `GET /admin/workers` op de worker draait de controle direct en
  wijzigt niets. Zonder dat zou je na een deploy tot de volgende ochtend moeten aannemen
  dat de controle werkt.

**Openstaand: `CF_API_TOKEN` mist leesrecht op Workers Scripts.** Het token op de worker
is gemaakt voor Cloudflare Access. Gemeten op 04-09-2026 20:35 CEST, meteen na de deploy:
`GET /admin/workers` antwoordt met `scriptlijst ophalen gaf HTTP 403`. De controle draait
dus wel, maar kan nog niet kijken, en `beheer.html` meldt precies dat. Herstel is een
permissie erbij op het bestaande token in het Cloudflare-dashboard, **Account → Workers
Scripts → Read**; de waarde van het secret verandert dan niet en hoeft niet opnieuw te
worden gezet. Wordt er wel een nieuw token gemaakt, dan moet het ook `Access: Apps and
Policies → Edit` houden, anders breekt het toekennen van rechten.

`check_tools.py` toetst hier alleen het mechanisme, net als bij portaal en beheer: haalt
de worker `tools.json` op, vergelijkt hij met de scriptlijst en gebruikt hij beide velden
uit het register. Daarbovenop faalt hij als een tool-HTML een workers.dev-adres aanroept
terwijl `workers` in het register leeg is; dan zou de dagelijkse controle die Worker niet
kennen. Een same-origin route zoals `/kg-api/` is zo niet te zien, dus die afhankelijkheid
blijft handwerk bij het opnemen van een tool.

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
