# Omzetting van de actiedocumenten naar OPENSTAAND.md

Gemaakt op 04-10-2026 22:21 CEST bij de omzetting van `OPENSTAAND.md` naar het formaat per punt.
Per punt in de actiedocumenten staat hier waar het in `OPENSTAAND.md` is gebleven. Een
regelnummer verwijst naar de stand van de documenten op de dag van de omzetting.
Telling: 57 oorspronkelijke punten, 5 bij een bestaand punt, 42 bij een nieuw punt (2 en hoger), 10 zonder punt met reden.

Gelezen en zonder punt bevonden: `README.md` (geen open punten of beperkingen), `AGENTS.md` (op
regel 403 na, zie hierboven), `tools.json` en `tools.schema.json` (register, geen actiedocument).

| Document | Regel | Punt in het document | Punt in OPENSTAAND.md |
|---|---|---|---|
| `OPENSTAAND.md` | 6 | punt 1: Access-controle boven 42 apps (bestaand punt) | 1 |
| `update-bram.md` | 123 | Word-sjablonen bestuursbesluit en AVA-notulen nog opnemen | 18 |
| `update-bram.md` | 124 | BV Ja/Nee en Gebruikelijk loon laten beoordelen | 19 |
| `update-bram.md` | 125 | Herstructurering: eerste opzet, verder ontwikkelen | 20 |
| `UC_bouwman-tools (UC00).md` | 68 | input vakgroep: welke tools als eerste | 21 |
| `UC_bouwman-tools (UC00).md` | 69 | AFAS-koppeling afstemmen met Egency en Growteq | 22 |
| `UC_bouwman-tools (UC00).md` | 70 | wie houdt de tarieven per tool actueel | 23 |
| `AGENTS.md` | 403 | CF_API_TOKEN mist leesrecht op Workers Scripts | 12 |
| `vrijgave-access-beheer-synchronisatie-2026-09-08.md` | 9 | oude checkout uitgerold, deploy alleen met eigen config | geen punt, met reden: Verslag van een herstelde fout. De regel om uitsluitend met wrangler.access-beheer.jsonc te deployen staat al in AGENTS.md (de valstrik met wrangler.toml); er is geen open eind. |
| `vrijgave-access-beheer-synchronisatie-2026-09-08.md` | 11 | budget krimpt met het aantal apps (oorzaak van punt 1) | 1 |
| `vrijgave-access-beheer-synchronisatie-2026-09-08.md` | 13 | onbekende policyvorm wordt gemeld en niet overschreven | geen punt, met reden: Ontwerpkeuze: de worker weigert te schrijven in plaats van te raden. Zo staat het ook in punt 1 en in de notitie van 01-10-2026. |
| `vrijgave-access-beheer-synchronisatie-2026-09-08.md` | 15 | productie-eindcontrole na uitrol vastleggen | 1 |
| `vrijgave-beheer-voortgang-2026-09-08.md` | 16 | beoordelen: is duidelijk dat het werk nog loopt | 5 |
| `vrijgave-beheerstatus-2026-09-08.md` | 49 | exception in de scheduled-handler blijft bestaan | 2 |
| `vrijgave-beheerstatus-2026-09-08.md` | 71 | meetnotitie: ontbrekende npm ci | geen punt, met reden: Puur verslag van een meetvalkuil (kijk naar het aantal tests en niet alleen naar pass of fail), zonder open eind. |
| `vrijgave-beheerstatus-2026-09-08.md` | 80 | geen echte browsercontrole en geen ingelogde beheersessie | 3 |
| `vrijgave-beheerstatus-2026-09-08.md` | 81 | bewijs dat de dagelijkse controle weer doorkomt | 2 |
| `vrijgave-bouwman-tools-2026-10-01.md` | 13 | na uitrol klikken op Bestaande rechten synchroniseren | 1 |
| `vrijgave-bouwman-tools-2026-10-01.md` | 15 | meer dan zes apps zonder policy in de lijst | 8 |
| `vrijgave-bouwman-tools-2026-10-01.md` | 17 | productie-eindcontrole apart vastleggen in OPENSTAAND.md | 1 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 13 | artikel 17b: volzintelling niet bevestigd | 13 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 14 | verdere delegatieketen en overige bronnen vragen broncontrole | 13 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 36 | eigenaar beoordeelt de beperkte bronidentificaties | 14 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 44 | Gebruikelijk loon: alleen metadata-identificatie gecontroleerd | geen punt, met reden: Afbakening van wat die ene wijziging deed (alleen de naam van drie bestaande tabellen in het register). De jaarwaardencontrole van die tool staat in tools.json (jaarwaarden_gecontroleerd) en in de jaarwisselingstaak; er is hier geen eigen open eind. |
| `vrijgave-register-grondslagen-2026-09-07.md` | 53 | Rekeningcourant + Dividend: controledatum blijft leeg | 24 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 57 | Prijsafspraken biedt geen XLSX-uitvoer, vinkje verwijderd | geen punt, met reden: Correctie van een onjuist vinkje in het register; de tool had nooit een XLSX-uitvoer en dat is vastgelegd. Het ontbreken van een dossierbestand staat in punt 17. |
| `vrijgave-register-grondslagen-2026-09-07.md` | 62 | draaiende externe Streamlit-revisie Auditfile Analyzer niet vastgesteld | 16 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 64 | dossierstuk en dossierbestand blijven op nee | 17 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 65 | memorandum Auditfile Analyzer zonder volledige invoersnapshot | 17 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 74 | Bewaarplicht: alleen beschrijvingscorrectie, termijnen niet gecontroleerd | 15 |
| `vrijgave-register-grondslagen-2026-09-07.md` | 75 | Bewaarplicht: jaargebonden tekstblokken en onderhoudsregistratie | 15 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 3 | statusverklaring: lokale kandidaat, geen bewijs van deployment | geen punt, met reden: Statusverklaring van 07-09-2026. Daarna is de worker uitgerold (vrijgave-portaal-authenticatie-2026-09-07.md r.89 tot en met r.98 en punt 1 in dit document); de open vraag over de ingelogde proef staat in de punten 3 en 4. |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 48 | echte keten testen met beheerder en niet-beheerder | 3 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 64 | geen echte-browsertests | 3 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 99 | afzonderlijke toegangsproef blijft nodig | 3 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 105 | buitencontrole is geen volledige routeinventarisatie | 7 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 126 | adrescontrole is minimale syntaxiscontrole | geen punt, met reden: Ontwerpkeuze: de worker controleert de vorm van een adres en niet of de mailbox bestaat. Er is geen open eind. |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 141 | geen live browser- of toegangstest | 3 |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 152 | aantal kwetsbare oude Worker-versies niet vastgesteld | geen punt, met reden: Het aantal oude versies is achteraf niet meer te meten en doet niet ter zake: previews zijn uitgezet. Wat openstaat is de eindcontrole van die instelling, punt 6. |
| `vrijgave-beheer-authenticatie-2026-09-07.md` | 156 | metadata-eindcontrole van preview_urls | 6 |
| `vrijgave-portaal-authenticatie-2026-09-07.md` | 3 | live-login met een echte gebruiker nog niet getest | 4 |
| `vrijgave-portaal-authenticatie-2026-09-07.md` | 97 | legacyhandler verwijderd, overgangsvenster gesloten | geen punt, met reden: Verslag van een afgesloten overgang: de finale Worker is op 07-09-2026 uitgerold en de legacyhandler bestaat niet meer. Er is geen open eind. |
| `vrijgave-portaal-authenticatie-2026-09-07.md` | 107 | echte ingelogde portaal- en beheerproef blijft open | 3, 4 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 74 | sluiting onder de buitencontrole gezet | 25 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 83 | uitrol met wrangler en token met routerecht | 26 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 105 | verificatie 1: ingelogde POST geeft JSON | 9 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 117 | Cookie Path, specifiekere Access-app en dashboardroute nakijken | 9 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 131 | kennisgroepen-agent: route kg-api zonder Access | 11 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 140 | eigen JWT-controle in de worker, wacht op uitrol | 9 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 158 | npm install bij uitrol en een ingelogde zoekopdracht daarna | 9 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 164 | Access op de worker zelf naast de zoneroute | 10 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 169 | sluiting niet regressie-getest (inmiddels gedaan) | 25 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 175 | uitrol gedaan en twee keer hersteld | 26 |
| `vrijgave-kvk-proxy-afscherming-2026-09-09.md` | 188 | les: geen `;` achter een git-commando bij uitrol | geen punt, met reden: Les uit een herstelde fout (de uitrol van 10-09-2026 is hersteld, zie punt 26). De les over `;` en `if ($?)` staat al in de globale instructies; er is geen open eind. |
| `TOOLS.md` | 296 | Access-app d0924bf1 (betalingskenmerk) kan worden opgeruimd | 27 |
| `TOOLS.md` | 297 | Access-app 85322344 (WKR intern) kan worden opgeruimd | 27 |
| `TOOLS.md` | 298 | Access-app b98bbe15 (WKR extern) kan worden opgeruimd | 27 |
