# bouwman.tools — overzicht voor Bram
**Datum:** 17 juli 2026

---

Hoi Bram,

Hierbij een overzicht van alles wat er momenteel staat op bouwman.tools. De Excel is bijgevoegd met per repo de status en je GitHub-toegang.

**Hoe werkt het?**
Elke tool heeft een eigen privé GitHub-repo. Bij elke wijziging kopieert een GitHub Action het HTML-bestand automatisch naar de centrale `bouwman-tools` repo, waarna het binnen ~1 minuut live staat op bouwman.tools. De Python-tools (Streamlit) draaien extern en zijn als tegel in het portaal opgenomen — ze openen in een nieuw tabblad.

Alles is bereikbaar via **bouwman.tools/portal.html** (login via je JOIN e-mailadres).

---

## BV & DGA

**BV Ja/Nee** — bouwman.tools/bv_janee_DK.html
Rekent door of een klant belastingtechnisch beter af is als BV of als eenmanszaak. Vergelijkt IB-druk in box 1 met VPB + aanmerkelijkbelangheffing, inclusief gebruikelijk loon en dividend. Geeft een onderbouwde aanbeveling op basis van de ingevoerde cijfers.

**Sjablonen DGA** — bouwman.tools/join-bv-documenten.html
Genereert juridische documenten voor de inrichting van een holdingstructuur: arbeidsovereenkomst DGA, managementovereenkomst, rekening-courantovereenkomst en aandeelhoudersovereenkomst. Vult automatisch in op basis van klantgegevens.

**Rekeningcourant + Dividend** — bouwman.tools/rc-schuld-dga.html
Berekent de optimale aflossingsroute van een rekening-courantschuld voor een DGA, rekening houdend met het excessief lenen-regime (art. 4.14a IB). Vergelijkt scenario's: aflossen via dividend, salaris of een combinatie.

**Gebruikelijk loon** — bouwman.tools/gebruikelijk-loon.html
Toetst het DGA-loon aan de wettelijke norm via drie methoden: vergelijkingsloon, hoogste werknemer en afroommethode. Berekent de meest gunstige norm en signaleert afwijkingen.

**Dividend & Uitkeringstoets** — bouwman.tools/dividend-uitkeringstoets.html
Doorloopt de balanstoets en liquiditeitstoets conform art. 2:216 BW voordat dividend wordt uitgekeerd. Genereert direct de bijbehorende AVA-notulen en het bestuursbesluit.

**Herstructurering** — bouwman.tools/herstructurering-assistent-v3.html
AI-assistent die stap voor stap herstructureringstrajecten begeleidt: aandelenfusie, juridische fusie, splitsing en inbreng. Werkt via de Anthropic API — geen klantdata invoeren.

---

## Auto & Mobiliteit

**Auto Fiscaal 2027** — bouwman.tools/auto-fiscaal-2027.html
Berekent de fiscale bijtelling voor auto's van de zaak op basis van cataloguswaarde, brandstoftype en datum eerste toelating. Houdt rekening met de overgangsregelingen voor elektrische voertuigen en de youngtimervrijstelling.

**Auto van de Zaak** — bouwman.tools/join-auto-rekenmodel.html
Rekent door wat financieel voordeliger is: de auto via de BV of privé. Vergelijkt bijtelling, BTW-correctie, brandstofvergoeding en netto kosten in verschillende scenario's.

---

## Loonheffing & WKR

**WKR Agent (intern)** — bouwman.tools/join-wkr-agent-intern.html
AI-assistent voor interne advisering over de werkkostenregeling. Beantwoordt vragen over vrije ruimte, gerichte vrijstellingen en nihilwaarderingen op basis van actuele regelgeving. Werkt via de Anthropic API.

**WKR Agent (extern)** — bouwman.tools/join-wkr-agent-extern.html
Klantgerichte versie van de WKR Agent — geschikt om te delen met cliënten. Zelfde functionaliteit, aangepaste toon.

**Werkgeversverklaring NHG** — bouwman.tools/nhg-werkgeversverklaring-wizard.html
Wizard die stap voor stap een werkgeversverklaring opstelt conform de NHG-vereisten. Genereert een kant-en-klaar PDF-document op basis van de ingevoerde arbeidsgegevens.

---

## Accountancy & Jaarrekening

**XAF Raw Export** — xaf.bouwman.tools
Verwerkt XAF-auditfiles (grootboekexports) en exporteert gestructureerde overzichten per grootboekrekening, kostensoort of periode. Draait op een eigen subdomein.

**Auditfile App** — auditfile-app.streamlit.app *(Streamlit — extern)*
Uitgebreidere versie van de XAF-tool. Analyseert auditfiles en biedt interactieve overzichten. Op termijn bedoeld om de XAF Raw Export in op te laten gaan.

---

## BTW & Omzetbelasting

**BTW Teruggaaf EU** — bouwman.tools/btw-teruggaaf-eu.html
Begeleidt het proces van BTW-teruggaaf in andere EU-landen via de 13e richtlijnprocedure. Checkt termijnen, vereiste documenten en drempelwaarden per land.

---

## Belastingdienst

**Kennisgroepen-zoeker** — bouwman.tools/kennisgroepen-zoeker.html
Doorzoekt kennisgroepstandpunten van de Belastingdienst via AI. Geeft relevante standpunten terug op basis van een zoekvraag, inclusief bronvermelding. Werkt via de Anthropic API.

---

## Administratie & Archief

**Bewaarplicht Checker** — bouwman.tools/bewaarplicht.html
Twee onderdelen: een kennisbank met alle wettelijke bewaartermijnen per documenttype (7 of 10 jaar, op basis van AWR art. 52), en een rekentool die berekent tot wanneer een specifiek document bewaard moet worden. Inclusief aandachtspunten over AVG, digitaal bewaren en de navorderingstermijn.

---

## Arbeidsrecht & Compliance

**DBA Risicoscan** — dba-risicoscan.streamlit.app *(Streamlit — extern)*
Indicatieve beoordeling van een arbeidsrelatie op basis van de negen gezichtspunten uit het Deliveroo/Uber-arrest. Geeft een risicoklasse en toelichting per gezichtspunt. Werkt via de Anthropic API.

**WWFT Check** — wwft-check.streamlit.app *(Streamlit — extern)*
Ondersteunt het cliëntenonderzoek conform de WWFT: KvK-data opvragen, sanctiescreening en rapportage in PDF. Werkt via de Anthropic API.

---

## Overig

**KvK Nummers Zoeken** — bouwman.tools/kvk-zoeker.html
Laadt een Excel in met klantnamen en vult automatisch de ontbrekende KvK-nummers aan via de KvK-API. Specifiek gebouwd voor het Payroll-team.

---

## Nog niet in het portaal

**Anonimiseren** — lokaal beschikbaar, hosting nog niet geregeld (Flask-app). Anonimiseert documenten door persoonsgegevens te detecteren en te vervangen.

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
