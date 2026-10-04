# Openstaande punten bouwman-tools

Formaat: per punt

> Dit document is de bron voor de openstaande punten van deze repository. Elk punt heeft een
> status (open of gesloten), een eigenaar (Sylvain of sessie) en een vindplaats. Een
> gesloten punt blijft staan, met datum en reden. Het overzicht in
> `AI_kopgroep/OPEN-PUNTEN.md` leest de regel "Formaat: per punt" hierboven en toont dan
> alleen de open punten met eigenaar Sylvain. Wat een sessie zelf kan doen, staat hier
> wel maar niet in dat overzicht.
>
> De vrijgavenotities, `update-bram.md` en `UC_bouwman-tools (UC00).md` in deze repository
> zijn verslag. Een punt dat daarin nog open staat, hoort hier.
>
> Omgezet naar deze vorm op 04-10-2026 22:21 CEST. De tekst van daarvoor staat in de
> Git-historie (laatste versie in commit 83a84eb). Het ene bestaande punt (1) staat hieronder
> woordelijk met zijn bestaande nummer. Punten 2 t/m 27 zijn bij de omzetting toegevoegd uit
> de actiedocumenten van deze repository (acht vrijgavenotities, `update-bram.md`,
> `UC_bouwman-tools (UC00).md`, de gegenereerde `TOOLS.md` en een openstaand punt in `AGENTS.md`).
> Waar elk punt uit die documenten is gebleven staat in `omzetting-actiedocumenten-2026-10-04.md`.
> Nummers worden nooit hergebruikt.

**Over eigenaarschap.** De POC is van Sylvain en hij beslist alles wat erin zit. Een punt met
eigenaar Sylvain vraagt een besluit, een beoordeling of een handeling die alleen hij kan
doen (inloggen, een token of Access-configuratie, een bericht aan derden). Een punt met
eigenaar sessie kan een sessie zelf oppakken. De punten 7, 8 en 17 zijn bewuste beperkingen
die zijn gemarkeerd als achtergrond en geen actie vragen.

Een aantal punten is aangemerkt als vermoedelijk behandeld (2, 15, 19 en 23). Zij blijven open
omdat het bewijs in een document of in de code ontbreekt; zie de tekst per punt.

## Open

### 2. De dagelijkse controle van de toegangsrechten schrijft weer een uitslag weg
- **Status:** open, vermoedelijk behandeld, bewijs ontbreekt
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-beheerstatus-2026-09-08.md`, r.49 en r.81; `vrijgave-bouwman-tools-2026-10-01.md`, r.3

De notitie van 08-09-2026 meldt dat de dagelijkse controle (cron van 06:00 UTC) sinds 05-09-2026 bij elke ronde een exception gaf en daardoor niets wegschreef. De worker is daarvoor niet gewijzigd: de wijziging maakte het alleen zichtbaar. Of de controle weer doorkomt zou pas blijken uit de eerstvolgende cron.

Vermoeden: de notitie van 01-10-2026 beschrijft een uitslag van de cron van 01-10-2026 06:00 UTC (afwijking `*`), dus de controle schrijft weer iets weg. Dat bewijst niet dat de oorspronkelijke exception verdwenen is. Een dagelijkse uitslag van na het herstel van 01-10-2026 is niet vastgelegd.

**Te sluiten wanneer:** de statusbalk in `beheer.html` een dagelijkse controle van na 01-10-2026 12:15 CEST toont zonder afwijkingen, met het tijdstip erbij genoteerd.

### 3. Ingelogde proef van de beheerketen ontbreekt (beheerder, niet-beheerder, sessieverloop)
- **Status:** open, wacht op een ingelogde proef
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-beheer-authenticatie-2026-09-07.md`, r.48, r.64, r.99 en r.141; `vrijgave-beheerstatus-2026-09-08.md`, r.80; `vrijgave-portaal-authenticatie-2026-09-07.md`, r.107

Het bewijs voor de authenticatie van `beheer.html` is synthetisch (echte JWT-cryptografie met eigen sleutels, DOM- en fetch-stubs) of een anonieme buitenproef. De notities vragen nog om een proef via de echte keten met een toegestane beheerder en een niet-beheerder, inclusief sessieverloop. Voor een schrijfproef is uitsluitend een afgesproken synthetische testgebruiker toegestaan. Een geaccepteerde weigering bewijst niet dat een beheerder kan inloggen.

Deels bewezen: op 01-10-2026 klikte Sylvain in `beheer.html` op **Bestaande rechten synchroniseren** en de melding eindigde groen (zie punt 1), dus de keten werkt voor een beheerder. De weigering van een niet-beheerder en het sessieverloop zijn niet vastgelegd.

**Te sluiten wanneer:** een niet-beheerder aantoonbaar geweigerd is en het sessieverloop is gemeten; anders is vastgelegd dat de buitencontrole en de synthetische tests volstaan.

### 4. Ingelogde proef van `portal.html` met een echte gebruiker ontbreekt
- **Status:** open, wacht op een ingelogde proef
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-portaal-authenticatie-2026-09-07.md`, r.3 en r.107

De portaalnotitie van 07-09-2026 meldt dat de live-login met een echte gebruiker nog niet is getest en dat een echte ingelogde portaalproef open blijft voor de eigenaar. Bewezen zijn de gesloten oude routes en de Access-poort (18 anonieme buitenproeven zonder afwijking), niet dat een gebruiker met rechten precies zijn eigen kaarten ziet.

**Te sluiten wanneer:** een gebruiker met rechten het portaal opent en precies zijn toegewezen kaarten ziet; anders is vastgelegd dat dit niet nodig is.

### 5. Beoordelen: is in beheer duidelijk dat het werk nog loopt
- **Status:** open, wacht op beoordeling van Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-beheer-voortgang-2026-09-08.md`, r.16

Bij opslaan, verwijderen en synchroniseren toont `beheer.html` een bewegende voortgangsbalk met uitleg dat de pagina open moet blijven. De vrijgavenotitie vraagt de eigenaar te beoordelen of tijdens het toewijzen duidelijk is dat het werk nog loopt. De duur van de synchronisatie zelf verandert niet.

**Te sluiten wanneer:** Sylvain de balk heeft beoordeeld, met zijn oordeel erbij.

### 6. `preview_urls` staat uit in de configuratie, de remote instelling is niet gecontroleerd
- **Status:** open, wacht op een metadatacontrole van het account
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-beheer-authenticatie-2026-09-07.md`, r.156; `wrangler.access-beheer.jsonc`, r.37

De deployconfiguratie zet `preview_urls` op `false` (regel 37 van `wrangler.access-beheer.jsonc`). De notitie zegt dat een geslaagde buitencontrole de remote previewinstelling niet bewijst en vraagt daarvoor een afzonderlijke metadata-eindcontrole. Die is niet vastgelegd.

**Te sluiten wanneer:** de previewinstelling van de worker `access-beheer` aan de bron (Cloudflare API of dashboard) is nagelezen en met datum is vastgelegd.

### 7. De buitencontrole is geen volledige inventarisatie van alle routes
- **Status:** open, bewuste beperking, als achtergrond gemarkeerd op 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-beheer-authenticatie-2026-09-07.md`, r.105

`tools/check_admin_routes.py` doet onaangemelde proeven op vaste routes. De notitie zegt zelf dat dit geen volledige inventarisatie is van alle mogelijk bestaande routes. Een route die niet in de lijst staat wordt niet gezien. Dit is een bewuste beperking van de controle en geen fout.

### 8. Meer dan zes apps zonder policy in de lijst blijven ongecontroleerd
- **Status:** open, bewuste beperking, als achtergrond gemarkeerd op 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-bouwman-tools-2026-10-01.md`, r.15

Levert de lijstaanroep voor meer dan zes apps geen policy mee, dan controleert elke ronde dezelfde eerste zes los en blijven de overige als niet gecontroleerd gemeld. Er wordt dan niets geschreven. Met de huidige accountgegevens is dat niet te verwachten. De nacontrole van 01-10-2026 (punt 1) liet het niet zien.

### 9. `kvk-proxy`: eigen JWT-poort en ingelogde zoekproef zijn niet als afgerond vastgelegd
- **Status:** open, uitrol van de JWT-poort en ingelogde proef niet vastgelegd
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-kvk-proxy-afscherming-2026-09-09.md`, r.105, r.117, r.140 en r.158; `kvk-worker.js`, r.15; `tests/kvk-auth.test.mjs`

De notitie beschrijft dat de worker zelf de Access-JWT valideert (`jose`, vaste uitgever, AUD van de app van `kvk-zoeker.html`) en dat dit pas leeft na een uitrol, met daarna één ingelogde zoekopdracht omdat de poort dichtvalt als Access de header niet meestuurt. De code staat op de hoofdbranch (`kvk-worker.js` r.15 importeert `jwtVerify`) en de negen tests staan in `tests/kvk-auth.test.mjs`. Dat de worker met deze poort draait en dat een ingelogde zoekopdracht JSON teruggeeft is nergens vastgelegd: de uitrol van 10-09-2026 (versie `d1a6fce8`, punt 26) is gedaan 'uit de eindstand', zonder dat de notitie zegt dat de JWT-poort erbij zat.

Ook niet vastgelegd: de nakijkpunten vóór stap 3 (Cookie Path Attribute op de Access-app, geen tweede specifiekere Access-app op het kindpad, geen dashboard-only route op `kvk-proxy`).

**Te sluiten wanneer:** `npx wrangler deployments list` een versie met de JWT-poort toont en een ingelogde zoekopdracht in `kvk-zoeker.html` een KvK-nummer oplevert, met de uitslag van de drie nakijkpunten erbij.

### 10. Access op de `kvk-proxy`-worker zelf, naast de zoneroute
- **Status:** open, wacht op besluit van Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-kvk-proxy-afscherming-2026-09-09.md`, r.164

Sinds 14-08-2026 kan Access op de worker zelf worden gezet. Dat dekt workers.dev, routes en previews in één keer, ongeacht de vlaggen in `wrangler.toml`. Het is een echt tweede slot in plaats van CORS. De aanroep uit de pagina blijft dan same-origin en breekt niet. Niet gemeten of beide naast elkaar een bijwerking hebben. De notitie legt dit voor als besluit van Sylvain.

**Te sluiten wanneer:** Sylvain heeft besloten of dit tweede slot erbij komt (en zo ja, een sessie heeft de bijwerking gemeten).

### 11. `kennisgroepen-agent`: route `kg-api` zonder Access en zonder gemeten eigen poort
- **Status:** open, nog niet gemeten
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-kvk-proxy-afscherming-2026-09-09.md`, r.131

De worker `kennisgroepen-agent` heeft de zoneroute `bouwman.tools/kg-api/*` die door geen Access-app wordt gedekt. Of de worker een eigen poort in de code heeft is niet gemeten. Dezelfde vraag als bij `kvk-proxy`.

**Te sluiten wanneer:** gemeten is of `kg-api` zonder login antwoordt en wat de code van die worker zelf controleert, met de uitslag vastgelegd.

### 12. `CF_API_TOKEN` op de worker mist leesrecht op Workers Scripts
- **Status:** open, sinds 04-09-2026 niet als hersteld vastgelegd
- **Eigenaar:** Sylvain
- **Vindplaats:** `AGENTS.md`, r.403

Het token `CF_API_TOKEN` (het Cloudflare-token op de worker `access-beheer`) is gemaakt voor Cloudflare Access. Gemeten op 04-09-2026 20:35 CEST gaf `GET /admin/workers` HTTP 403 op de scriptlijst: de workercontrole draait maar kan niet kijken. `beheer.html` meldt dat. Herstel is een permissie erbij op het bestaande token in het Cloudflare-dashboard: **Account, Workers Scripts, Read**. De waarde van het secret verandert dan niet. Maakt Sylvain een nieuw token, dan moet het ook **Access: Apps and Policies, Edit** houden. Of dit sindsdien is hersteld staat nergens.

**Te sluiten wanneer:** `GET /admin/workers` geen 403 meer geeft, met datum vastgelegd in `AGENTS.md`.

### 13. Berekeningen: verdere delegatieketen en volzintelling van artikel 17b zijn niet gecontroleerd
- **Status:** open, bronnen niet gecontroleerd
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.13 en r.14

Het register noemt voor Berekeningen alleen de artikelen 17a, 17b, 18 en 19 van het Uitvoeringsbesluit inkomstenbelasting 2001 (versie 1 januari 2026). Bij artikel 17b is alleen het artikel genoemd: de eerdere beoordelingen bevestigen niet dezelfde volzintelling. De verdere wettelijke delegatieketen en overige bronnen vragen een afzonderlijke broncontrole voordat zij worden toegevoegd. Er is geen fiscale waarde of conclusie aangenomen.

**Te sluiten wanneer:** een broncontrole (skill `fiscale-bron-verificatie`) de delegatieketen en de volzintelling van artikel 17b met vindplaats heeft vastgelegd.

### 14. Beoordelen: bronidentificaties in het register (Berekeningen)
- **Status:** open, wacht op beoordeling van Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.36

De vrijgavenotitie vraagt de inhoudelijk verantwoordelijke te beoordelen of de beperkte bronidentificaties (regeling, artikel, versie en officiële vindplaats) passend zijn. De wijziging legt geen accordering vast en verklaart de bronversies niet blijvend actueel.

**Te sluiten wanneer:** Sylvain de identificaties heeft beoordeeld, met zijn oordeel erbij.

### 15. Bewaarplicht Checker: jaargebonden tekstblokken en onderhoudsregistratie
- **Status:** open, vermoedelijk behandeld, bewijs ontbreekt
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.74 en r.75

De notitie van 08-09-2026 corrigeerde alleen de kaartbeschrijving (personeel en accountantsdossiers) en controleerde de bewaartermijnen niet. Jaargebonden tekstblokken en hun onderhoudsregistratie vragen volgens de notitie nog een afzonderlijke beoordeling.

Vermoeden: `tools.json` noemt voor `bewaarplicht.html` sindsdien `laatst_beoordeeld` en `jaarwaarden_gecontroleerd` op 2026-09-16 met jaarwaarde `INVESTERINGSDIENST_2026`. Dat zegt niet dat de tekstblokken zijn beoordeeld.

**Te sluiten wanneer:** vastgelegd is welke tekstblokken jaargebonden zijn en dat zij met vindplaats zijn gecontroleerd.

### 16. Auditfile Analyzer: de draaiende externe Streamlit-revisie is niet vastgesteld
- **Status:** open, nog niet gemeten
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.62

De exportcode (`pagina_export`, `build_excel_export`) is gecontroleerd in de actuele bron. Een proef met verzonnen auditfiles gaf een heropenbaar werkboek met 40 werkbladen. Welke revisie er op de externe Streamlit-omgeving draait is niet vastgesteld.

**Te sluiten wanneer:** de draaiende revisie is vergeleken met de gecontroleerde bron.

### 17. Prijsafspraken en Auditfile Analyzer hebben geen dossierstuk en geen dossierbestand
- **Status:** open, bewuste beperking, als achtergrond gemarkeerd op 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.64 en r.65

Dossierstuk en dossierbestand staan bij beide tools op nee. Het memorandum van Auditfile Analyzer bevat nog geen volledige actuele invoersnapshot en de lokale serveropslag is geen dossierdownload met opnieuw openen door de gebruiker. Prijsafspraken importeert Excel maar heeft geen XLSX-uitvoer (het onjuiste vinkje is verwijderd).

### 18. Dividend & Uitkeringstoets: Word-sjablonen voor bestuursbesluit en AVA-notulen
- **Status:** open, stand sinds 18-08-2026 niet nagelopen
- **Eigenaar:** sessie
- **Vindplaats:** `update-bram.md`, r.123

In het overzicht van 18-08-2026 staat als openstaand punt 1: de Word-sjablonen voor bestuursbesluit en AVA-notulen nog opnemen in de tool. Hetzelfde document beschrijft op regel 32 dat de tool direct de bijbehorende AVA-notulen en het bestuursbesluit genereert, dus het punt is mogelijk deels achterhaald. Niet nagelopen in de bronrepository.

**Te sluiten wanneer:** in de bronrepository van de tool is nagelopen wat er nu is en of het punt vervalt, met datum en reden.

### 19. BV Ja/Nee en Gebruikelijk loon laten beoordelen door fiscalisten
- **Status:** open, vermoedelijk behandeld, bewijs ontbreekt
- **Eigenaar:** Sylvain
- **Vindplaats:** `update-bram.md`, r.124

Openstaand punt 2 uit het overzicht van 18-08-2026.

Vermoeden: `tools.json` noemt voor beide tools `laatst_beoordeeld` op 2026-09-21. Dat is de accordering door de eigenaar en zegt niet of ook andere fiscalisten hebben meegekeken.

**Te sluiten wanneer:** Sylvain bevestigt dat de beoordeling is gedaan (of afziet van verdere beoordeling), met datum.

### 20. Herstructurering-assistent: eerste opzet, moet verder ontwikkeld worden
- **Status:** open, wacht op besluit van Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `update-bram.md`, r.125

Openstaand punt 3 uit het overzicht van 18-08-2026. In `tools.json` heeft de tool status `concept` en geen `laatst_beoordeeld`. Wanneer de tool af is bepaalt Sylvain.

**Te sluiten wanneer:** Sylvain heeft besloten of en wanneer de tool verder wordt ontwikkeld.

### 21. Input van de vakgroep: welke Kluwer- of RB-tools eerst
- **Status:** open, wacht op input van Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `UC_bouwman-tools (UC00).md`, r.67

Open punt in het use-case-document: welke Kluwer- of RB-tools worden het meest gebruikt en moeten als eerste worden gebouwd.

**Te sluiten wanneer:** de vakgroep heeft gereageerd of Sylvain het punt heeft laten vervallen.

### 22. AFAS-koppeling afstemmen met Egency en Growteq
- **Status:** open, wacht op afstemming door Sylvain
- **Eigenaar:** Sylvain
- **Vindplaats:** `UC_bouwman-tools (UC00).md`, r.68

Open punt in het use-case-document: een koppeling met AFAS (GetConnector voor het inladen van basisdata en UpdateConnector voor het opslaan van de uitkomst) afstemmen met Egency en Growteq. Een bericht aan die partijen stuurt alleen Sylvain.

**Te sluiten wanneer:** afgestemd is of het punt is laten vervallen.

### 23. Wie is verantwoordelijk voor het actueel houden van de tarieven per tool
- **Status:** open, vermoedelijk behandeld, bewijs ontbreekt
- **Eigenaar:** Sylvain
- **Vindplaats:** `UC_bouwman-tools (UC00).md`, r.69

Open punt in het use-case-document.

Vermoeden: `tools.json` legt per tool `eigenaar`, `beoordelingsritme` en `laatst_beoordeeld` vast en `AGENTS.md` beschrijft het eigenaarschap (afgesproken 01-09-2026). Het use-case-document zelf is niet bijgewerkt.

**Te sluiten wanneer:** Sylvain bevestigt dat het eigenaarschap in `tools.json` het antwoord is; anders noemt het use-case-document het antwoord met datum.

### 27. Drie verweesde Access-apps van vervallen tools opruimen
- **Status:** open, wacht op Sylvain (Access-configuratie)
- **Eigenaar:** Sylvain
- **Vindplaats:** `TOOLS.md`, r.296 tot en met r.298 (gegenereerd uit `tools.json`, r.2265, r.2269 en r.2273)

Bij drie vervallen tools staat dat hun Access-app kan worden opgeruimd: `betalingskenmerk.html` (app `d0924bf1-e6c1-4098-8573-ac651b860b51`), `join-wkr-agent-intern.html` (app `85322344-25d4-41cd-9b08-9c79da74bb28`) en `join-wkr-agent-extern.html` (app `b98bbe15-1440-4ca4-8af1-cc12517e098f`). De Access-configuratie raakt een sessie niet aan. Of de apps al zijn verwijderd is niet vastgelegd. `TOOLS.md` wordt gegenereerd: pas de reden aan in `tools.json`.

**Te sluiten wanneer:** de drie apps in Cloudflare Access zijn verwijderd (of vastgesteld is dat zij al weg zijn) en de reden in `tools.json` is bijgewerkt.

## Gesloten

### 1. Access-controle liep vast boven 42 apps
- **Status:** gesloten op 01-10-2026 12:15 CEST. Reden: uitgerold en in productie nagecontroleerd (zie onder).
- **Eigenaar:** Sylvain
- **Vindplaats:** `access-beheer-worker.js`, functies `haalAccessApps`,
  `controleerPolicies` en `synchroniseerEnControleer`; tests in
  `tests/beheer-sync.test.mjs`.

Bouw en onderhoud: Sylvain (in het oude document stond dit achter de eigenaar).

- **Wat er was (01-10-2026):** de dagelijkse controle van 01-10-2026 06:00 UTC meldde
  afwijking `*` met "Controle kon niet worden voltooid". `synchroniseerEnControleer`
  rekende `45 - aantal apps` als budget en gooide onder de 3; met 48 apps in `APP_IDS`
  gooide hij dus altijd. Daardoor faalden ook `/admin/sync`, `/admin/upsert` en
  `/admin/delete`. Upsert en delete schrijven de rechten eerst naar KV, dus een opslag
  in `beheer.html` kwam wel in de opslag maar niet op Cloudflare Access. De grens
  bestond om de limiet van 50 subrequests per uitvoering op het gratis Workers-plan.
- **Wat er is veranderd:** de controle haalt alle apps met hun policies in één
  lijstaanroep op (`GET /accounts/{id}/access/apps?per_page=1000`, documentatie:
  https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/list/).
  De kosten van een leesronde hangen daardoor niet meer af van het aantal apps. Herstel
  blijft per ronde begrensd (hoogstens tien apps); `beheer.html` doet de vervolgrondes.
  Levert de lijst voor een app geen bruikbare policy, dan volgt een losse aanroep binnen
  een vaste reserve. Een ronde blijft in het zwaarste geval op 45 subrequests; de tests
  toetsen dat. `scheduled` bewaart bij een eigen, vaste foutmelding nu die reden in
  plaats van alleen "bekijk de workerlogs".
- **Nacontrole (01-10-2026):** worker `access-beheer` uitgerold door Sylvain, versie
  `6eeafbb1-924c-4e7e-b396-bf4ae9d16ef8`, met KV-binding `PERMISSIONS` en cron
  `0 6 * * *` behouden. Daarna in `beheer.html` **Bestaande rechten synchroniseren**:
  eindmelding groen, dus geen afwijkingen meer en geen afwijking `*`. Het aantal tools
  dat door de halve opslagen sinds 30-09-2026 achterliep, is niet vastgelegd. De
  synchronisatie herstelde het in vervolgrondes, en de status bewaart alleen de laatste
  ronde. Vast staat dat er na het herstel niets meer afwijkt.

### 24. Rekeningcourant + Dividend: de controledatum van de jaarwaarden bleef leeg
- **Status:** gesloten 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-register-grondslagen-2026-09-07.md`, r.53; `tools.json`, r.151

De notitie van 08-09-2026 liet de controledatum van de jaarconfiguratie `TAX_CONFIG` bewust leeg.

Gesloten 04-10-2026. Bewijs: `tools.json`, r.151, zet voor `rc-schuld-dga.html` `jaarwaarden_gecontroleerd` op 2026-09-08 (en `laatst_beoordeeld` op 2026-09-09). Het onderhoudsritme `belastingplan` uit dezelfde notitie staat in hetzelfde register.

### 25. De sluiting van workers.dev voor `kvk-proxy` is niet regressie-getest
- **Status:** gesloten 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-kvk-proxy-afscherming-2026-09-09.md`, r.74 en r.169; `tools/check_admin_routes.py`, r.31 en r.32

Punt 3 uit de reviewpunten: de sluiting stond nog niet onder de buitencontrole.

Gesloten 04-10-2026. Bewijs: `tools/check_admin_routes.py`, r.31 (kindpad `/kvk-zoeker.html/api/zoeken`) en r.32 (`kvk-proxy.s-bouwman.workers.dev`, de wachter die faalt zodra workers.dev weer opengaat). De notitie zelf noemt de stap als gedaan op 10-09-2026 met 22 buitenproeven zonder afwijking.

### 26. Uitrol van de `kvk-proxy`-zoneroute (stappen 1 tot en met 4)
- **Status:** gesloten 04-10-2026
- **Eigenaar:** sessie
- **Vindplaats:** `vrijgave-kvk-proxy-afscherming-2026-09-09.md`, r.83 en r.175; `wrangler.toml`, r.24 en r.31

De notitie vroeg een mens om de worker uit te rollen met een token met het recht Zone, Workers Routes, Edit.

Gesloten 04-10-2026. Bewijs: de notitie (r.175 en verder) legt vast dat de uitrol op 10-09-2026 is gedaan en daarna is hersteld (versie `d1a6fce8`, workers.dev geeft 404, het kindpad 302 naar de Access-login). In de code: `wrangler.toml` r.24 `workers_dev = false` en r.31 het routepatroon `https://bouwman.tools/kvk-zoeker.html/api/*`. Wat niet gesloten is: de ingelogde proef en de JWT-poort, zie punt 9.
