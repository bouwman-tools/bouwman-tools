# Wettelijke verwijzingen in het openbare register

De publicatie voegt optionele wettelijke verwijzingen toe aan `tools.json` en het
gegenereerde `TOOLS.md`. Een verwijzing bevat regeling, artikelidentificatie met
versie en een officiële HTTPS-vindplaats. Het schema en de generator beperken de
toegestane bronhosts; Markdown en HTML in nieuwe labels worden als tekst weergegeven.

De eerste vulling betreft vier eerder gecontroleerde onderwerpidentificaties bij
Berekeningen: Uitvoeringsbesluit inkomstenbelasting 2001, artikelen 17a, 17b, 18 en
19, versie 1 januari 2026. Het register bewaart de officiële artikel-URL's. Deze
verwijzingen vormen geen volledige bronnenlijst en geen nieuwe fiscale beoordeling.
Bij artikel 17b is alleen het artikel genoemd: de eerdere beoordelingen bevestigen
niet dezelfde volzintelling. De verdere wettelijke delegatieketen en overige bronnen
vragen een afzonderlijke broncontrole voordat zij worden toegevoegd.

De bestaande beschrijvingen zijn op twee punten gecorrigeerd: Berekeningen behandelt
zeventien onderwerpen, inclusief revisierente bij lijfrenteafkoop; BTW Teruggaaf EU
toont voorwaarden per EU-land en stelt geen berekend teruggaafverzoek op. Statussen,
accorderingen, jaarwaarden, uitgangen en toegang blijven ongewijzigd. Er zijn geen
rekenregels of fiscale waarden veranderd.

Modeldetails en interne bewijsindexen blijven buiten deze publicatie. De generator
leest alleen het openbare register en geen andere repositories. De wijziging is op
de actuele publieke basis opgebouwd; lokale interne wijzigingen worden niet gemerged.

## Controles

- Synthetische tests voor schema, officiële URL's, veilige weergave, weigeren vóór
  overschrijven en reproduceerbare generatie: `python -B -m unittest discover -s tools -p "test_*.py"`.
- Register- en driftcontrole: `python tools/check_tools.py`.
- Generatie: `python tools/check_tools.py --schrijf-tools-md`; `TOOLS.md` is geen
  handmatig bijgehouden tweede register.
- De bestaande CI voert de tests uit na installatie van `jsonschema` en controleert
  daarna opnieuw de gegenereerde tekst.

De inhoudelijk verantwoordelijke beoordeelt of de beperkte bronidentificaties passend
zijn. De wijziging legt geen accordering vast en verklaart de bronversies niet blijvend actueel.

## Aanvulling 8 september: identificatie jaarwaarden Gebruikelijk loon

Het register noemde de vervallen constante `MINIMA`. De bron en publieke HTML
bevatten identiek `NORMBEDRAGEN`, `TOPTARIEF_BOX1` en `TOPTARIEFGRENS`; het register
noemt nu die drie bestaande tabellen. Alleen de metadata-identificatie is gecontroleerd,
niet opnieuw de fiscale inhoud. Controledatum, accordering en status zijn behouden.

## Aanvulling 8 september: Rekeningcourant + Dividend

Het register noemt nu de bestaande jaartabel `TAX_CONFIG`. Bron en publieke HTML
zijn identiek. Het onderhoudsritme wordt `belastingplan`, zoals het expliciete
onderhoudsvoorstel in de bronvrijgavenotitie van 6 september beschrijft. Dit sluit
aan op het daar vastgelegde onderhoud aan de jaarconfiguratie zodra de nieuwe
bijstellingsregeling bekend is. Dit is geen nieuwe fiscale waardentoets; de
controledatum blijft leeg en de bestaande publicatiestatus en accordering blijven staan.

## Aanvulling 8 september: bestaande Excel-uitgangen

Prijsafspraken importeert Excel maar biedt geen XLSX-uitvoer; het onjuiste Excel-vinkje
is verwijderd. De bron en gepubliceerde HTML zijn bytegelijk. Auditfile Analyzer heeft
wel een download via `pagina_export` en `build_excel_export`; dat vinkje is aangezet.
Een onafhankelijke proef met uitsluitend verzonnen auditfiles leverde een heropenbaar
werkboek met 40 werkbladen en numerieke mutatiecellen. De exportcode is gecontroleerd
in de actuele bron; de draaiende externe Streamlit-revisie is niet vastgesteld.

Dossierstuk en dossierbestand blijven bij beide tools op nee. Het memorandum van
Auditfile Analyzer bevat nog geen volledige actuele invoersnapshot en de lokale
serveropslag is geen dossierdownload met opnieuw openen door de gebruiker. Status,
accordering, fiscale controledatums en toegang veranderen niet.

## Aanvulling 8 september: bereik Bewaarplicht Checker

De kaartbeschrijving omvat nu ook personeel en accountantsdossiers, zoals de bron
en gepubliceerde HTML die al behandelen. De vorige beschrijving beperkte de tool
ten onrechte tot artikel 52 AWR. Bron 21638cc en publieke kopie hebben dezelfde HTML.
Dit is uitsluitend een beschrijvingscorrectie, geen controle van de bewaartermijnen.
Jaargebonden tekstblokken en hun onderhoudsregistratie vragen nog afzonderlijke
beoordeling. Status, controledatums, accordering en rechten blijven gelijk.
