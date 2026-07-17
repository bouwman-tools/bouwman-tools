# Status update tools — voor Bram
**Datum:** 17 juli 2026

---

## Wat is er nieuw sinds 16 juli?

### Bewaarplicht Checker — nieuw
Een nieuwe HTML-tool die vandaag live is gegaan op bouwman.tools.

**Wat doet het?**
- **Kennisbank**: overzicht van alle bewaartermijnen per documenttype (facturen, contracten, personeel, onroerend goed, bijzondere regelingen, etc.)
- **Einddatum berekenen**: selecteer een documenttype + vul de relevante datum in → de tool berekent tot wanneer het document bewaard moet worden (bijv. "Bewaren t/m 31 december 2031")
- Inclusief aandachtspunten (AVG, digitaal bewaren, navorderingstermijn) en directe links naar de wettelijke bronnen (AWR art. 52, Belastingdienst)

**URL:** bouwman.tools/bewaarplicht.html

---

### Streamlit-tools nu zichtbaar in het portaal
De Python-tools die al op Streamlit Cloud draaien zijn nu als externe tegels in het portaal opgenomen. Ze openen in een nieuw tabblad. Drie tools zijn toegevoegd:

| Tool | URL | Sectie in portaal |
|---|---|---|
| Auditfile App | auditfile-app.streamlit.app | Accountancy & Jaarrekening |
| DBA Risicoscan | dba-risicoscan.streamlit.app | Arbeidsrecht & Compliance |
| WWFT Check | wwft-check.streamlit.app | Arbeidsrecht & Compliance |

Alle drie hadden al collega's die ze aan het testen waren — ze stonden alleen nog niet in het portaal. Nu wel, met een "Streamlit" label zodat duidelijk is dat het een externe app betreft.

---

## Huidige stand van zaken portaal

### Volledig live (HTML-tools op bouwman.tools)

| Sectie | Tools |
|---|---|
| BV & DGA | BV Ja/Nee, Sjablonen DGA, Rekeningcourant + Dividend, Herstructurering, Gebruikelijk loon, Dividend & Uitkeringstoets |
| Auto & Mobiliteit | Auto Fiscaal 2027, Auto van de Zaak |
| Loonheffing & WKR | WKR Agent (intern + extern), Werkgeversverklaring NHG |
| Accountancy & Jaarrekening | XAF Raw Export, Auditfile App (Streamlit) |
| BTW & Omzetbelasting | BTW Teruggaaf EU |
| Belastingdienst | Kennisgroepen-zoeker |
| Administratie & Archief | Bewaarplicht Checker |
| Arbeidsrecht & Compliance | DBA Risicoscan (Streamlit), WWFT Check (Streamlit) |
| Overig | KvK Nummers Zoeken |

### Nog niet in portaal

| Tool | Reden |
|---|---|
| Anonimiseren | Flask-app — hosting nog niet geregeld |

---

## Openstaande punten (ongewijzigd)

| # | Punt |
|---|---|
| 1 | Dividend & Uitkeringstoets: Word-sjablonen voor bestuursbesluit + AVA-notulen nog opnemen in de tool |
| 2 | BV Ja/Nee en Gebruikelijk loon: laten beoordelen door fiscalisten |
| 3 | Herstructurering: eerste opzet, moet verder ontwikkeld worden |
