# Tools — bouwman.tools

> **Gegenereerd uit `tools.json`. Bewerk dit bestand niet met de hand.**
> Werk `tools.json` bij en draai `python tools/check_tools.py --schrijf-tools-md`.

Bijgewerkt: 2026-09-03

## Accountancy & Jaarrekening

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | Auditfile App | `https://auditfile-app.streamlit.app/` | Sylvainbouwman/Auditfile_app | n.v.t. | n.v.t. | **tbd** | jaarlijks | **nooit** |
| ⚪ verborgen | Jaarrekening review | `/Join-jaarrekening-review.html` | bouwman-tools/Jaarrekening-review | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟢 live | XAF Raw Export | `/xaf_export.html` | Sylvainbouwman/xaf-export-tool | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Auditfile App**: Analyseert XAF-auditfiles en exporteert gestructureerde overzichten per grootboekrekening of kostensoort
- **Jaarrekening review**: Toetst een jaarrekening aan de kantoorstandaard voordat die naar de klant gaat
- **XAF Raw Export**: Verwerkt XAF-auditfiles (3.2 en 4.0) naar Excel of CSV, volledig in de browser, ook bij bestanden van 700 MB en groter

## Administratie & Archief

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Bewaarplicht Checker | `/bewaarplicht.html` | bouwman-tools/bewaarplicht-checker | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Bewaarplicht Checker**: Berekent de wettelijke bewaartermijn (art. 52 AWR) per documenttype, inclusief de einddatum

## Arbeidsrecht & Compliance

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | DBA Risicoscan | `https://dba-risicoscan.streamlit.app/` | Sylvainbouwman/dba-risicoscan | n.v.t. | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **DBA Risicoscan**: Beoordeelt de arbeidsrelatie indicatief aan de negen gezichtspunten uit het Deliveroo/Uber-arrest

## Auto & Mobiliteit

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Auto Fiscaal 2027 | `/auto-fiscaal-2027.html` | bouwman-tools/auto-fiscaal-2027 | ja | 2026-08-31 | **tbd** | belastingplan | **nooit** |
| 🟢 live | Auto van de Zaak | `/join-auto-rekenmodel.html` | bouwman-tools/auto-van-de-zaak | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Auto Fiscaal 2027**: Brengt de grote autowijzigingen per 1 januari 2027 samen: eindheffing, youngtimer-bijtelling en RDW-kentekenlookup
- **Auto van de Zaak**: Rekent door of een auto op de zaak of privé fiscaal gunstiger uitpakt

## BTW & Omzetbelasting

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | BTW Teruggaaf EU | `/btw-teruggaaf-eu.html` | bouwman-tools/btw-teruggaaf-eu | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟡 beta | BUA en kantineregeling | `/bua.html` | bouwman-tools/BUA | ja | 2026-09-02 | **tbd** | belastingplan | **nooit** |

- **BTW Teruggaaf EU**: Berekent en onderbouwt een BTW-teruggaafverzoek voor kosten gemaakt in EU-landen
- **BUA en kantineregeling**: Berekent de uitsluiting van btw-aftrek voor personeelsvoorzieningen, de kantine en relatiegeschenken, met de drempel per begunstigde

## BV & DGA

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | BV Ja/Nee | `/bv_janee_DK.html` | bouwman-tools/BV-Ja_Nee | ja | 2026-08-28 | **tbd** | belastingplan | **nooit** |
| 🟢 live | Dividend & Uitkeringstoets | `/dividend-uitkeringstoets.html` | bouwman-tools/dividend-uitkeringstoets | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟡 beta | Earningsstripping | `/earningsstripping.html` | bouwman-tools/earningsstripping | ja | 2026-08-29 | **tbd** | belastingplan | **nooit** |
| 🟡 beta | Gebruikelijk loon | `/gebruikelijk-loon.html` | bouwman-tools/gebruikelijk-loon | ja | 2026-08-28 | **tbd** | belastingplan | **nooit** |
| 🟢 live | Herstructurering | `/herstructurering-assistent-v3.html` | bouwman-tools/Herstructurering | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟢 live | Rekeningcourant + Dividend | `/rc-schuld-dga.html` | bouwman-tools/Rekeningcourant-met-dividend | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟢 live | Sjablonen DGA | `/join-bv-documenten.html` | bouwman-tools/Sjablonen-DGA | ja | 2026-08-28 | **tbd** | belastingplan | **nooit** |

- **BV Ja/Nee**: Rekent door of een klant belastingtechnisch beter af is met een BV dan als eenmanszaak
- **Dividend & Uitkeringstoets**: Doorloopt de balanstoets en liquiditeitstoets (art. 2:216 BW) en genereert direct AVA-notulen en bestuursbesluit
- **Earningsstripping**: Rekent de renteaftrekbeperking van art. 15b Wet Vpb door: aftrekruimte, niet-aftrekbaar saldo aan renten en voortwenteling (boekjaren 2019–2026)
- **Gebruikelijk loon**: Toetst het DGA-loon aan de wettelijke norm: vergelijkingsloon, hoogste werknemer en afroommethode
- **Herstructurering**: Rekent herstructureringstrajecten stap voor stap door en adviseert met AI
- **Rekeningcourant + Dividend**: Berekent de optimale aflossingsroute van een rekening-courantschuld van een DGA
- **Sjablonen DGA**: Genereert de juridische documenten voor de inrichting van een holdingstructuur voor een DGA

## Belastingdienst

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | Belastingtool JoinDK | `https://belastingtooljoindk.streamlit.app/` | Sylvainbouwman/belastingtooljoindk | n.v.t. | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟢 live | Kennisgroepen-zoeker | `/kennisgroepen-zoeker.html` | bouwman-tools/kennisgroepen-zoeker | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Belastingtool JoinDK**: Bundelt zes tools in één app: betalingskenmerk decoderen, belastingrente IB en VpB, BTW-correctie en bijtelling auto, VIES en KvK/SBI
- **Kennisgroepen-zoeker**: Zoekt en analyseert kennisgroepstandpunten van de Belastingdienst met AI

## Kantoor

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| ⚪ verborgen | Prijsafspraken | `/join-prijsafspraken.html` | bouwman-tools/Facturatie | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Prijsafspraken**: Toont per klant de geldende tariefafspraken, werkstatus en factuurhistorie uit een Excel-export

## Loonheffing & WKR

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | WKR Agent | `/join-wkr-agent.html` | bouwman-tools/WKR_agent | ja | 2026-08-31 | **tbd** | belastingplan | **nooit** |
| 🟢 live | Werkgeversverklaring NHG | `/nhg-werkgeversverklaring-wizard.html` | bouwman-tools/Werkgeversverklaring | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |
| 🟡 beta | Werkkostenregeling | `/werkkostenregeling.html` | bouwman-tools/werkkostenregeling | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | **nooit** |

- **WKR Agent**: AI-assistent voor vragen over de werkkostenregeling
- **Werkgeversverklaring NHG**: Vult een NHG-werkgeversverklaring stap voor stap in via een wizard
- **Werkkostenregeling**: Berekent de vrije ruimte en de eindheffing per inhoudingsplichtige (2024–2026), met de normbedragen van het jaar als naslag

## Overig

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | Berekeningen | `/berekeningen.html` | bouwman-tools/berekeningen | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | **nooit** |
| 🟢 live | KvK Nummers Zoeken | `/kvk-zoeker.html` | bouwman-tools/kvk-zoeker | ja | n.v.t. | **tbd** | jaarlijks | **nooit** |

- **Berekeningen**: Rekent zestien onderwerpen door: annuïteiten, contante en toekomstige waarde, rendement, waardering box 3, boeterente en doorverkoop overdrachtsbelasting
- **KvK Nummers Zoeken**: Vult KvK-nummers automatisch aan in een ingelezen Excel-bestand, voor Payroll

## Vervallen

| Bestand | Reden |
|---|---|
| `https://wwft-check.streamlit.app/` | Op 01-09-2026 uit de portefeuille gehaald. De tool draait nu in de kantooromgeving; de Streamlit-app is verwijderd en de bronrepo Sylvainbouwman/wwft-check is gearchiveerd. Er was geen Access-app (externe link). |
| `betalingskenmerk.html` | Repository hernoemd naar belastingtooljoindk; het bestand bestaat niet meer. De Access-app d0924bf1-e6c1-4098-8573-ac651b860b51 kan worden opgeruimd. |
| `join-wkr-agent-intern.html` | Op 18-08-2026 vervangen door join-wkr-agent.html. Access-app 85322344-25d4-41cd-9b08-9c79da74bb28 kan worden opgeruimd. |
| `join-wkr-agent-extern.html` | Op 18-08-2026 vervangen door join-wkr-agent.html. Access-app b98bbe15-1440-4ca4-8af1-cc12517e098f kan worden opgeruimd. |
