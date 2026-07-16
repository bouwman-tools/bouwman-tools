# Tools — bouwman.tools

Centraal overzicht van alle tools in AI_kopgroep en hun status op bouwman.tools.
Dit bestand wordt bijgehouden door Claude en weerspiegelt altijd de actuele stand van zaken.

**Laatste update:** 16 jul 2026

---

## 🟢 Live op bouwman.tools

Alle tools hieronder zijn zichtbaar in het portaal via bouwman.tools/portal.html.
Elke tool heeft een eigen GitHub-repo én een sync-workflow die bij elke push automatisch naar bouwman-tools kopieert.

### BV & DGA

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| BV Ja/Nee | `/bv_janee_DK.html` | Sylvainbouwman/BV-Ja_Nee | 19 jun 2026 | 14 jul 2026 |
| Sjablonen DGA | `/join-bv-documenten.html` | Sylvainbouwman/Sjablonen-DGA | 19 jun 2026 | 14 jul 2026 |
| Rekeningcourant + Dividend | `/rc-schuld-dga.html` | Sylvainbouwman/Rekeningcourant-met-dividend | 19 jun 2026 | 15 jul 2026 |
| Herstructurering | `/herstructurering-assistent-v3.html` | Sylvainbouwman/Herstructurering | 23 jun 2026 | 14 jul 2026 |
| Gebruikelijk loon | `/gebruikelijk-loon.html` | bouwman-tools/gebruikelijk-loon | 16 jul 2026 | 16 jul 2026 |
| Dividend & Uitkeringstoets | `/dividend-uitkeringstoets.html` | bouwman-tools/dividend-uitkeringstoets | 16 jul 2026 | 16 jul 2026 |

### Auto & Mobiliteit

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Auto Fiscaal 2027 | `/auto-fiscaal-2027.html` | Sylvainbouwman/auto-fiscaal-2027 | 27 jun 2026 | 14 jul 2026 |
| Auto van de Zaak | `/join-auto-rekenmodel.html` | Sylvainbouwman/auto-van-de-zaak | 19 jun 2026 | 14 jul 2026 |

### Loonheffing & WKR

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| WKR Agent (intern) | `/join-wkr-agent-intern.html` | Sylvainbouwman/WKR_agent | 22 jun 2026 | 14 jul 2026 |
| WKR Agent (extern) | `/join-wkr-agent-extern.html` | Sylvainbouwman/WKR_agent (zelfde) | 22 jun 2026 | 14 jul 2026 |
| Werkgeversverklaring NHG | `/nhg-werkgeversverklaring-wizard.html` | Sylvainbouwman/Werkgeversverklaring | 19 jun 2026 | 14 jul 2026 |

### Accountancy & Jaarrekening

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Jaarrekening Review | `/Join-jaarrekening-review.html` | Sylvainbouwman/Jaarrekening-review | 18 jun 2026 | 14 jul 2026 |
| XAF Raw Export | `xaf.bouwman.tools` | Sylvainbouwman/xaf-export-tool | 28 jun 2026 | 14 jul 2026 |

### Belastingdienst

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Kennisgroepen-zoeker | `/kennisgroepen-zoeker.html` | Sylvainbouwman/kennisgroepen-zoeker | 22 jun 2026 | 16 jul 2026 |

### Overig

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Prijsafspraken | `/join-prijsafspraken.html` | Sylvainbouwman/Facturatie | 19 jun 2026 | 14 jul 2026 |
| KvK Nummers Zoeken | `/kvk-zoeker.html` | Sylvainbouwman/kvk-zoeker | 13 jul 2026 | 16 jul 2026 |

---

## 🟡 In AI_kopgroep — nog niet op bouwman.tools

Tools met een eigen repo maar (nog) niet gepubliceerd in het portaal.

| Tool | Repo | Start | Laatste aanpassing | Advies |
|---|---|---|---|---|
| DBA Helper / Risicoscan | Sylvainbouwman/dba-risicoscan | 3 jul 2026 | 14 jul 2026 | ✅ Publiceer — Wet DBA is actueel |
| WWFT Check | Sylvainbouwman/wwft-check | 1 jul 2026 | 14 jul 2026 | ✅ Publiceer — verplichte compliance |
| BTW Teruggaaf EU | Sylvainbouwman/btw-teruggaaf-eu | 13 jul 2026 | 14 jul 2026 | 🔍 Beoordeel — is de tool af? |
| Anonimiseren | Sylvainbouwman/Anonimiseren | 18 jun 2026 | 14 jul 2026 | 🔍 Beoordeel — wat doet het precies? |
| Kledingkast | Sylvainbouwman/kledingkast | 21 jun 2026 | 14 jul 2026 | ❓ Onduidelijk doel |
| Prisma Dashboard | Sylvainbouwman/prisma-dashboard | 10 jul 2026 | 14 jul 2026 | ❓ Intern of voor klanten? |
| Betalingskenmerk Tool | Sylvainbouwman/betalingskenmerk-tool | 29 jun 2026 | 15 jul 2026 | 🚧 In ontwikkeling |
| AFAS Help Scraper | Sylvainbouwman/Afas-help-scraper | 23 jun 2026 | 14 jul 2026 | 🔒 Intern hulpmiddel |
| ToDo Tool | Sylvainbouwman/todo | 9 jul 2026 | 15 jul 2026 | 🔒 Intern |
| Tool-register | Sylvainbouwman/Tool-register | 4 jul 2026 | 14 jul 2026 | 🔒 Intern |
| Auditfile App | Sylvainbouwman/Auditfile_app | 17 jun 2026 | 14 jul 2026 | 🗄️ Archiveer — ingehaald door XAF |
| Suite | (geen git) | — | — | 🗄️ Archiveer of opruimen |

---

## 🔧 Aandachtspunten

| # | Punt | Actie |
|---|---|---|
| 1 | KvK-zoeker mist `BOUWMAN_TOOLS_PAT` secret | Handmatig instellen — zie instructie in README.md |
| 2 | XAF Raw Export heeft geen sync workflow | Werkt via eigen subdomein, geen actie nodig |
| 3 | Auditfile App en Suite staan ongebruikt | Overweeg te archiveren |

---

## Een tool toevoegen aan bouwman.tools

1. Voeg de tool toe aan het `TOOLS`-array in `portal.html`
2. Voeg de sync workflow toe aan de tool-repo (zie README.md)
3. Stel de `BOUWMAN_TOOLS_PAT` secret in voor de tool-repo
4. Voeg de tool toe aan `beheer.html`
5. Update dit bestand (TOOLS.md)

## Een tool verwijderen uit bouwman.tools

1. Verwijder de regel in het `TOOLS`-array in `portal.html` — tool verdwijnt uit het portaal
2. (Optioneel) Verwijder het HTML-bestand uit de bouwman-tools repo — URL wordt onbereikbaar
3. De eigen map en repo in AI_kopgroep blijven onaangetast
