# Update bouwman.tools — voor Bram
**Datum:** 17 juli 2026

---

Hoi Bram,

Hierbij een overzicht van de huidige stand van zaken van bouwman.tools.

---

## Portaal — wat staat er live?

Alle tools zijn bereikbaar via **bouwman.tools/portal.html**.

| Sectie | Tool | URL |
|---|---|---|
| BV & DGA | BV Ja/Nee | bouwman.tools/bv_janee_DK.html |
| BV & DGA | Sjablonen DGA | bouwman.tools/join-bv-documenten.html |
| BV & DGA | Rekeningcourant + Dividend | bouwman.tools/rc-schuld-dga.html |
| BV & DGA | Gebruikelijk loon | bouwman.tools/gebruikelijk-loon.html |
| BV & DGA | Dividend & Uitkeringstoets | bouwman.tools/dividend-uitkeringstoets.html |
| BV & DGA | Herstructurering | bouwman.tools/herstructurering-assistent-v3.html |
| Auto & Mobiliteit | Auto Fiscaal 2027 | bouwman.tools/auto-fiscaal-2027.html |
| Auto & Mobiliteit | Auto van de Zaak | bouwman.tools/join-auto-rekenmodel.html |
| Loonheffing & WKR | WKR Agent (intern + extern) | bouwman.tools/join-wkr-agent-intern.html |
| Loonheffing & WKR | Werkgeversverklaring NHG | bouwman.tools/nhg-werkgeversverklaring-wizard.html |
| Accountancy & Jaarrekening | XAF Raw Export | xaf.bouwman.tools |
| Accountancy & Jaarrekening | Auditfile App | auditfile-app.streamlit.app |
| BTW & Omzetbelasting | BTW Teruggaaf EU | bouwman.tools/btw-teruggaaf-eu.html |
| Belastingdienst | Kennisgroepen-zoeker | bouwman.tools/kennisgroepen-zoeker.html |
| Administratie & Archief | Bewaarplicht Checker | bouwman.tools/bewaarplicht.html |
| Arbeidsrecht & Compliance | DBA Risicoscan | dba-risicoscan.streamlit.app |
| Arbeidsrecht & Compliance | WWFT Check | wwft-check.streamlit.app |
| Overig | KvK Nummers Zoeken | bouwman.tools/kvk-zoeker.html |

De tools met een Streamlit-URL zijn externe apps die in een nieuw tabblad openen — ze staan als tegel in het portaal met een "Streamlit" label.

---

## Nieuw sinds de laatste update

**Bewaarplicht Checker** — vandaag live gegaan. Twee onderdelen:
- Kennisbank met alle bewaartermijnen per documenttype (7 of 10 jaar), inclusief aandachtspunten over AVG, digitaal bewaren en de navorderingstermijn
- Einddatumberekening: documenttype + relevante datum invullen → "bewaren t/m 31 december [jaar]"

**Streamlit-tools in het portaal** — de Python-tools die al draaiden staan nu ook als tegel in het portaal: Auditfile App, DBA Risicoscan en WWFT Check.

---

## Toegang GitHub

Je hebt nu toegang tot alle tool-repo's op GitHub (bouwman-tools org + Sylvainbouwman). Uitzondering: Facturatie, Jaarrekening_review, kledingkast, Prisma en ToDo_tool.

---

## Nog niet in portaal

| Tool | Reden |
|---|---|
| Anonimiseren | Flask-app — hosting nog niet geregeld |

---

## Openstaande punten

| # | Punt |
|---|---|
| 1 | Dividend & Uitkeringstoets: Word-sjablonen voor bestuursbesluit + AVA-notulen nog opnemen in de tool |
| 2 | BV Ja/Nee en Gebruikelijk loon: laten beoordelen door fiscalisten |
| 3 | Herstructurering: eerste opzet, moet verder ontwikkeld worden |

---

Met vriendelijke groet,
Sylvain
