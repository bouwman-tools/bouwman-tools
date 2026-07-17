# Tools — bouwman.tools

Centraal overzicht van alle tools in AI_kopgroep en hun status op bouwman.tools.
Dit bestand wordt bijgehouden door Claude en weerspiegelt altijd de actuele stand van zaken.

**Laatste update:** 17 jul 2026 — Bewaarplicht Checker toegevoegd; Auditfile, DBA, WWFT live als Streamlit-links

---

## 🟢 Live op bouwman.tools

Alle tools hieronder zijn zichtbaar in het portaal via bouwman.tools/portal.html.

### BV & DGA

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| BV Ja/Nee | `/bv_janee_DK.html` | bouwman-tools/BV-Ja_Nee | 19 jun 2026 | 14 jul 2026 |
| Sjablonen DGA | `/join-bv-documenten.html` | bouwman-tools/Sjablonen-DGA | 19 jun 2026 | 14 jul 2026 |
| Rekeningcourant + Dividend | `/rc-schuld-dga.html` | bouwman-tools/Rekeningcourant-met-dividend | 19 jun 2026 | 15 jul 2026 |
| Herstructurering | `/herstructurering-assistent-v3.html` | bouwman-tools/Herstructurering | 23 jun 2026 | 14 jul 2026 |
| Gebruikelijk loon | `/gebruikelijk-loon.html` | bouwman-tools/gebruikelijk-loon | 16 jul 2026 | 16 jul 2026 |
| Dividend & Uitkeringstoets | `/dividend-uitkeringstoets.html` | bouwman-tools/dividend-uitkeringstoets | 16 jul 2026 | 16 jul 2026 |

### Auto & Mobiliteit

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Auto Fiscaal 2027 | `/auto-fiscaal-2027.html` | bouwman-tools/auto-fiscaal-2027 | 27 jun 2026 | 14 jul 2026 |
| Auto van de Zaak | `/join-auto-rekenmodel.html` | bouwman-tools/auto-van-de-zaak | 19 jun 2026 | 14 jul 2026 |

### Loonheffing & WKR

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| WKR Agent (intern) | `/join-wkr-agent-intern.html` | bouwman-tools/WKR_agent | 22 jun 2026 | 14 jul 2026 |
| WKR Agent (extern) | `/join-wkr-agent-extern.html` | bouwman-tools/WKR_agent (zelfde) | 22 jun 2026 | 14 jul 2026 |
| Werkgeversverklaring NHG | `/nhg-werkgeversverklaring-wizard.html` | bouwman-tools/Werkgeversverklaring | 19 jun 2026 | 14 jul 2026 |

### Accountancy & Jaarrekening

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| XAF Raw Export | `xaf.bouwman.tools` | bouwman-tools/xaf-export-tool | 28 jun 2026 | 14 jul 2026 |
| Auditfile App | `auditfile-app.streamlit.app` | bouwman-tools/Auditfile_app | 17 jun 2026 | 17 jul 2026 |

### BTW & Omzetbelasting

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| BTW Teruggaaf EU | `/btw-teruggaaf-eu.html` | bouwman-tools/btw-teruggaaf-eu | 13 jul 2026 | 16 jul 2026 |

### Belastingdienst

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Kennisgroepen-zoeker | `/kennisgroepen-zoeker.html` | bouwman-tools/kennisgroepen-zoeker | 22 jun 2026 | 16 jul 2026 |

### Administratie & Archief

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| Bewaarplicht Checker | `/bewaarplicht.html` | bouwman-tools/bewaarplicht-checker | 17 jul 2026 | 17 jul 2026 |

### Arbeidsrecht & Compliance

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| DBA Risicoscan | `dba-risicoscan.streamlit.app` | bouwman-tools/DBA-helper | 3 jul 2026 | 17 jul 2026 |
| WWFT Check | `wwft-check.streamlit.app` | bouwman-tools/WWFT-check | 1 jul 2026 | 17 jul 2026 |

### Overig

| Tool | URL | Repo | Start | Laatste aanpassing |
|---|---|---|---|---|
| KvK Nummers Zoeken | `/kvk-zoeker.html` | bouwman-tools/kvk-zoeker | 13 jul 2026 | 16 jul 2026 |

---

## 🟡 In AI_kopgroep — nog niet op bouwman.tools

| Tool | Repo | Start | Laatste aanpassing | Advies |
|---|---|---|---|---|
| Anonimiseren | bouwman-tools/Anonimiseren | 18 jun 2026 | 14 jul 2026 | 🟡 Publiceren met "nog in test" label — hosting beslissen (Flask) |

---

## 🔧 Aandachtspunten

| # | Punt | Actie |
|---|---|---|
| 1 | Dividend & Uitkeringstoets mist Word-sjablonen | Sjablonen uit map opnemen in de tool |
| 2 | BV Ja/Nee en Gebruikelijk loon | Laten beoordelen door fiscalisten |
| 3 | XAF Raw Export heeft geen sync workflow | Werkt via eigen subdomein, geen actie nodig |
| 4 | Anonimiseren | Hosting beslissen — Flask app, niet direct op bouwman.tools |

---

## Een tool toevoegen aan bouwman.tools

1. Voeg de tool toe aan het `TOOLS`-array in `portal.html`
2. Voeg de sync workflow toe aan de tool-repo (zie README.md)
3. Stel de `BOUWMAN_TOOLS_PAT` secret in voor de tool-repo
4. Update dit bestand (TOOLS.md)

## Een tool verwijderen uit bouwman.tools

1. Verwijder de regel in het `TOOLS`-array in `portal.html` — tool verdwijnt uit het portaal
2. (Optioneel) Verwijder het HTML-bestand uit de bouwman-tools repo — URL wordt onbereikbaar
3. De eigen map en repo in AI_kopgroep blijven onaangetast
