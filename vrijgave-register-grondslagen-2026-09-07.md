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
