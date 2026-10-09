# Tools — bouwman.tools

> **Gegenereerd uit `tools.json`. Bewerk dit bestand niet met de hand.**
> Werk `tools.json` bij en draai `python tools/check_tools.py --schrijf-tools-md`.

Bijgewerkt: 2026-10-09

Wettelijke verwijzingen zijn vastgelegde identificaties bij de vermelde versies.
Dit is geen volledige bronnenlijst, actuele broncontrole of inhoudelijke accordering.
Ontbrekende verwijzingen zeggen niets over de wettelijke basis van een tool.

## Accountancy & Jaarrekening

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Auditfile App | `https://auditfile-app.streamlit.app/` | Sylvainbouwman/Auditfile_app | n.v.t. | **ontbreekt** | Sylvain Bouwman | belastingplan | **nooit** |
| 🔵 concept | Horecarapportage uit auditfile | `/horeca-rapportage.html` | Sylvainbouwman/rapportage-horeca | ja | n.v.t. | Sylvain Bouwman | geen | n.v.t. |
| 🔵 concept | Jaarrekening review | `/Join-jaarrekening-review.html` | bouwman-tools/Jaarrekening-review | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |
| 🟢 live | XAF Raw Export | `/xaf_export.html` | Sylvainbouwman/xaf-export-tool | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |

- **Auditfile App**: Analyseert XAF-auditfiles en exporteert gestructureerde overzichten per grootboekrekening of kostensoort
- **Horecarapportage uit auditfile**: Verlies- en winstrekening per kwartaal of cumulatief voor een horecavestiging, met KPI-tegels, een benchmark tegen CBS-sectorcijfers en een kostenverdeling, uit een auditfile (XAF) die alleen in de browser wordt gelezen
- **Jaarrekening review**: Toetst een jaarrekening aan de kantoorstandaard voordat die naar de klant gaat
- **XAF Raw Export**: Verwerkt XAF-auditfiles (3.1, 3.2 en 4.0) naar Excel of CSV met een aansluitcheck en een kolommenbalans, volledig in de browser, ook bij bestanden van 700 MB en groter

## Administratie & Archief

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | BankBridge | `/bankbridge.html` | Sylvainbouwman/BankBridge | ja | n.v.t. | Sylvain Bouwman | geen | n.v.t. |
| 🟢 live | Bewaarplicht Checker | `/bewaarplicht.html` | bouwman-tools/bewaarplicht-checker | ja | 2026-09-16 | Sylvain Bouwman | belastingplan | 2026-09-16 |

- **BankBridge**: Zet bankafschriften lokaal in de browser om naar MT940 en CAMT.053, met validatie voor export.
- **Bewaarplicht Checker**: Toont bewaartermijnen per documenttype voor administratie, personeel en accountantsdossiers en berekent de einddatum met toepasselijke uitzonderingen

## Arbeidsrecht & Compliance

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | DBA Risicoscan | `https://dba-risicoscan.streamlit.app/` | Sylvainbouwman/dba-risicoscan | n.v.t. | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |
| 🟢 live | Transitievergoeding | `/transitievergoeding.html` | bouwman-tools/transitievergoeding | ja | 2026-09-04 | Sylvain Bouwman | belastingplan | 2026-09-20 |
| 🟢 live | Werkgeversverklaring NHG | `/nhg-werkgeversverklaring-wizard.html` | bouwman-tools/Werkgeversverklaring | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |

- **DBA Risicoscan**: Beoordeelt de arbeidsrelatie indicatief aan de negen gezichtspunten uit het Deliveroo/Uber-arrest
- **Transitievergoeding**: Berekent de transitievergoeding van art. 7:673 lid 2 BW voor een arbeidsovereenkomst die op of na 1 januari 2020 eindigt, met een afdrukbaar dossierstuk
- **Werkgeversverklaring NHG**: Vult een NHG-werkgeversverklaring stap voor stap in via een wizard

## Auto & Mobiliteit

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Auto Fiscaal 2027 | `/auto-fiscaal-2027.html` | bouwman-tools/auto-fiscaal-2027 | ja | 2026-08-31 | Sylvain Bouwman | belastingplan | 2026-09-20 |
| 🟢 live | Auto van de Zaak | `/join-auto-rekenmodel.html` | bouwman-tools/auto-van-de-zaak | ja | 2026-09-04 | Sylvain Bouwman | belastingplan | 2026-09-16 |

- **Auto Fiscaal 2027**: Rekent de grote autowijzigingen per 1 januari 2027 door: eindheffing, youngtimer-bijtelling, bijtellingscontrole 2024 tot en met 2028 en RDW-kentekenlookup
- **Auto van de Zaak**: Rekent door of een auto op de zaak of privé fiscaal gunstiger uitpakt

## BTW & Omzetbelasting

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | BTW Teruggaaf EU | `/btw-teruggaaf-eu.html` | bouwman-tools/btw-teruggaaf-eu | ja | n.v.t. | Sylvain Bouwman | jaarlijks | 2026-09-17 |
| 🟢 live | BUA en kantineregeling | `/bua.html` | bouwman-tools/BUA | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | 2026-09-20 |
| 🟢 live | Herziening btw | `/herziening-btw.html` | bouwman-tools/herziening-btw | ja | 2026-09-04 | Sylvain Bouwman | belastingplan | 2026-09-27 |

- **BTW Teruggaaf EU**: Toont per EU-land de voorwaarden voor een btw-teruggaafverzoek, waaronder factuurvereisten, minimumbedragen, talen en indienen via een derde
- **BUA en kantineregeling**: Berekent de uitsluiting van btw-aftrek voor personeelsvoorzieningen, de kantine en relatiegeschenken, met de drempel per begunstigde
- **Herziening btw**: Berekent de herziening van in aftrek gebrachte btw op investeringsgoederen en investeringsdiensten: onroerend over tien boekjaren, roerend en diensten over vijf, met de tienprocentsmarge per boekjaar en de gevolgen van levering binnen de termijn

## BV & DGA

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | BV Ja/Nee | `/bv_janee_DK.html` | bouwman-tools/BV-Ja_Nee | ja | 2026-08-28 | Sylvain Bouwman | belastingplan | 2026-09-21 |
| 🟢 live | Belastinglatentie | `/belastinglatentie.html` | bouwman-tools/belastinglatentie | ja | 2026-09-04 | Sylvain Bouwman | belastingplan | 2026-09-08 |
| 🟢 live | DCF-rekenmodel | `/dcf-rekentool.html` | bouwman-tools/dcf-rekenmodel | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | 2026-09-21 |
| 🟢 live | Dividend & Uitkeringstoets | `/dividend-uitkeringstoets.html` | bouwman-tools/dividend-uitkeringstoets | ja | n.v.t. | Sylvain Bouwman | jaarlijks | 2026-09-20 |
| 🟢 live | Dividendscenario's | `/dividend-scenarios.html` | bouwman-tools/dividend-scenarios | ja | 2026-10-05 | Sylvain Bouwman | belastingplan | 2026-09-20 |
| 🟢 live | Earningsstripping | `/earningsstripping.html` | bouwman-tools/earningsstripping | ja | 2026-08-29 | Sylvain Bouwman | belastingplan | 2026-09-26 |
| 🟢 live | Gebruikelijk loon | `/gebruikelijk-loon.html` | bouwman-tools/gebruikelijk-loon | ja | 2026-09-21 | Sylvain Bouwman | belastingplan | 2026-09-21 |
| 🔵 concept | Herstructurering | `/herstructurering-assistent-v3.html` | bouwman-tools/Herstructurering | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |
| 🔵 concept | Organogram en structuursignalen | `/organogram-structuur.html` | bouwman-tools/organogram-structuur | ja | n.v.t. | Sylvain Bouwman | jaarlijks | **nooit** |
| 🟢 live | Pensioen in eigen beheer en oudedagsverplichting | `/pensioen-odv.html` | bouwman-tools/pensioen-odv | ja | 2026-09-29 | Sylvain Bouwman | belastingplan | 2026-09-29 |
| 🟢 live | Rekeningcourant + Dividend | `/rc-schuld-dga.html` | bouwman-tools/Rekeningcourant-met-dividend | ja | 2026-09-08 | Sylvain Bouwman | belastingplan | 2026-09-09 |
| 🟢 live | Rente rekening-courant | `/rc-rente.html` | bouwman-tools/rc-rente-rekenmodel | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | 2026-09-21 |
| 🟢 live | Sjablonen DGA | `/join-bv-documenten.html` | bouwman-tools/Sjablonen-DGA | ja | 2026-08-28 | Sylvain Bouwman | belastingplan | n.v.t. |
| 🟢 live | Vermogen van box 3 naar de BV | `/vermogen-bv.html` | bouwman-tools/vermogen-bv | ja | 2026-09-29 | Sylvain Bouwman | belastingplan | **nooit** |

- **BV Ja/Nee**: Rekent door of een klant belastingtechnisch beter af is met een BV dan als eenmanszaak
- **Belastinglatentie**: Bepaalt de contante waarde van de belastinglatentie bij een aandelentransactie of doorschuiving: het gemis aan afschrijvingsbasis en de uitgestelde heffing, met het verloop per jaar
- **DCF-rekenmodel**: Waardering via de discounted-cashflowmethode, met onderbouwing van de rendementseis
- **Dividend & Uitkeringstoets**: Doorloopt de balanstoets en liquiditeitstoets (art. 2:216 BW) en genereert direct AVA-notulen en bestuursbesluit
- **Dividendscenario's**: Dividendscenario's voor de dga: scenariovergelijking en spreiding over jaren
- **Earningsstripping**: Rekent de renteaftrekbeperking van art. 15b Wet Vpb door: aftrekruimte, niet-aftrekbaar saldo aan renten en voortwenteling (boekjaren 2019–2026)
- **Gebruikelijk loon**: Toetst het DGA-loon aan de wettelijke norm: vergelijkingsloon, hoogste werknemer en afroommethode
- **Herstructurering**: Loopt herstructureringstrajecten stap voor stap langs en adviseert met AI
- **Organogram en structuursignalen**: Voer een concernstructuur in met personen, rechtspersonen en percentages; de tool tekent het organogram en signaleert mogelijke UBO's, aanmerkelijk belang en een mogelijke fiscale eenheid voor de Vpb en de btw
- **Pensioen in eigen beheer en oudedagsverplichting**: Waardeert een premievrij pensioen in eigen beheer fiscaal op een balansdatum, met ouderdoms- en partnerpensioen en de waarde op de volgende balansdata, en rekent een oudedagsverplichting door: de oprenting in de uitstelfase, de uitkeringsperiode en de termijnen, de oprenting in de uitkeringsfase en de stand per 31 december
- **Rekeningcourant + Dividend**: Berekent de optimale aflossingsroute van een rekening-courantschuld van een DGA
- **Rente rekening-courant**: Berekent de rente op een rekening-courantverhouding
- **Sjablonen DGA**: Genereert de juridische documenten voor de inrichting van een holdingstructuur voor een DGA
- **Vermogen van box 3 naar de BV**: Vergelijkt wat er overblijft van beleggingen of andere bezittingen in box 3, na inbreng in een eigen BV of na overdracht tegen een lening aan de BV (tbs): twintig jaar vooruit met de overgang naar werkelijk rendement, en twee jaar rond de peildatum met de jojo via de BV of de lening

### Wettelijke verwijzingen: Organogram en structuursignalen

- [Uitvoeringsbesluit Wwft 2018, Artikel 3 \(versie 30 april 2026\)](https://wetten.overheid.nl/BWBR0041193/2026-04-30)
- [Wet inkomstenbelasting 2001, Artikel 4.6 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 4.10 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet op de vennootschapsbelasting 1969, Artikel 15 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002672/2026-01-01)
- [Wet op de omzetbelasting 1968, Artikel 7 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002629/2026-01-01)
- [Burgerlijk Wetboek Boek 2, Artikel 24a \(versie 1 juli 2026\)](https://wetten.overheid.nl/BWBR0003045/2026-07-01)

### Wettelijke verwijzingen: Pensioen in eigen beheer en oudedagsverplichting

- [Wet inkomstenbelasting 2001, Artikel 3.29 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet op de loonbelasting 1964, Artikel 38p, lid 2 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0002471/2026-02-21)

### Wettelijke verwijzingen: Vermogen van box 3 naar de BV

- [Wet op de vennootschapsbelasting 1969, Artikel 20 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002672/2026-01-01)
- [Wet op de vennootschapsbelasting 1969, Artikel 22 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002672/2026-01-01)
- [Wet inkomstenbelasting 2001, Artikel 2.10 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 2.12 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 2.13 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 2.14 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.92 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.99b \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 5.2 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 5.25 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)

## Belastingdienst

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Belastingtool JoinDK | `https://belastingtooljoindk.streamlit.app/` | Sylvainbouwman/belastingtooljoindk | n.v.t. | n.v.t. | Sylvain Bouwman | jaarlijks | 2026-09-20 |
| 🟢 live | Kennisgroepen-zoeker | `/kennisgroepen-zoeker.html` | bouwman-tools/kennisgroepen-zoeker | ja | n.v.t. | Sylvain Bouwman | jaarlijks | 2026-10-05 |

- **Belastingtool JoinDK**: Bundelt zes tools in één app: betalingskenmerk decoderen, belastingrente IB en VpB, BTW-correctie en bijtelling auto, VIES en KvK/SBI
- **Kennisgroepen-zoeker**: Zoekt en analyseert kennisgroepstandpunten van de Belastingdienst met AI

## Financiële planning

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | AOW-datum | `/aow-datum.html` | bouwman-tools/aow-datum | ja | 2026-09-18 | Sylvain Bouwman | belastingplan | 2026-09-23 |
| 🟢 live | BOR bij schenken | `/bor-schenken.html` | bouwman-tools/bor-schenken | ja | 2026-09-29 | Sylvain Bouwman | belastingplan | **nooit** |
| 🟢 live | Bruto-netto 2026 | `/bruto-netto-2026.html` | Sylvainbouwman/bruto-netto-2026 | ja | 2026-09-28 | Sylvain Bouwman | belastingplan | **nooit** |
| 🟢 live | Eigen woning | `/eigen-woning.html` | bouwman-tools/eigen-woning | ja | 2026-09-23 | Sylvain Bouwman | belastingplan | 2026-09-24 |
| 🟢 live | Familiebank | `/familiebank.html` | bouwman-tools/familiebank | ja | 2026-09-23 | Sylvain Bouwman | belastingplan | 2026-09-21 |
| 🟢 live | Hypotheek annuïtair | `/hypotheek-annuitair.html` | bouwman-tools/hypotheek-annuitair | ja | 2026-09-06 | Sylvain Bouwman | belastingplan | 2026-09-18 |
| 🟢 live | Hypotheek in BV | `/hypotheek-in-bv.html` | bouwman-tools/hypotheek-in-bv | ja | 2026-09-06 | Sylvain Bouwman | belastingplan | 2026-09-09 |
| 🟢 live | Kantoor in de eigen woning | `/kantoor-in-de-woning.html` | bouwman-tools/kantoor-in-de-woning | ja | 2026-09-28 | Sylvain Bouwman | belastingplan | 2026-09-28 |
| 🟢 live | Overdracht ouderlijke woning | `/ouderlijke-woning.html` | bouwman-tools/ouderlijke-woning | ja | 2026-09-30 | Sylvain Bouwman | belastingplan | **nooit** |
| 🟢 live | Periodiek verrekenbeding | `/verrekenbeding.html` | bouwman-tools/verrekenbeding | ja | n.v.t. | Sylvain Bouwman | jaarlijks | 2026-10-02 |
| 🟢 live | Staken of verkopen van de onderneming | `/staken-onderneming.html` | bouwman-tools/staken-onderneming | ja | 2026-10-01 | Sylvain Bouwman | belastingplan | **nooit** |
| 🟢 live | Tijdplan | `/tijdplan.html` | bouwman-tools/tijdplan | ja | 2026-09-08 | Sylvain Bouwman | belastingplan | 2026-09-27 |
| 🟢 live | WW-uitkering | `/ww-uitkering.html` | bouwman-tools/ww-uitkering | ja | 2026-09-18 | Sylvain Bouwman | belastingplan | 2026-09-21 |

- **AOW-datum**: Leidt uit een geboortedatum de pensioengerechtigde leeftijd en de AOW-datum af: de leeftijd die voor dat geboortejaar is vastgesteld en de dag waarop het ouderdomspensioen ingaat. Rekent alleen met vastgestelde leeftijden en geeft voor latere geboortedata een melding in plaats van een raming
- **BOR bij schenken**: Rekent de schenking van een IB-onderneming of aanmerkelijk-belangaandelen door met de bedrijfsopvolgingsregeling: doorschuiving van de inkomstenbelasting, de latentie in aftrek, de BOR-vrijstelling, de schenkbelasting met conserverende aanslag en uitstel, en wat er gebeurt als een voorwaarde niet is vervuld
- **Bruto-netto 2026**: Bruto-netto berekening voor 2026: box 1/2/3, heffingskortingen, bijdrage Zvw en de posten voor een DGA of IB-ondernemer
- **Eigen woning**: Volgt de eigen woning en de eigenwoningschuld per jaar: marktwaarde en waardeontwikkeling, eigenwoningforfait volgens de staffel met de eigenwoningperiode naar tijdsgelang, tot drie leningen die elk apart worden getoetst, de schuld en de overwaarde, de verdeling over box 1 en box 3, en tot welk jaar de rente aftrekbaar is. Ook de aankoop met de kosten gesplitst naar aftrekbaar en niet aftrekbaar, de verkoop, een verbouwing tot ten hoogste de kosten, de eigenwoningreserve die de leenruimte verlaagt en bij verkoop het vervreemdingssaldo, het overgangsrecht van art. 10bis met de aflossingsstand, en de aflossing uit een kapitaalverzekering, spaarrekening of beleggingsrecht eigen woning met de vrijstelling en het belaste deel
- **Familiebank**: Rekent een annuïtaire lening van een ouder aan een kind voor de eigen woning door: het aflosschema, de toets aan de aflossingseis van artikel 3.119c Wet IB 2001, het belastingeffect van de renteaftrek bij het kind en de jaarlijkse schenking getoetst aan de vrijstelling
- **Hypotheek annuïtair**: Zet vijf hypotheekvormen naast elkaar over 31 jaar en toont per jaar de netto last, met eigenwoningforfait, renteaftrek en schenking
- **Hypotheek in BV**: Zet de bankhypotheek doorlopen, oversluiten naar de eigen BV en aflossen over een jaar naast elkaar, met box 1, box 2 en box 3, de toets op excessief lenen en de kwalificatie als eigenwoningschuld
- **Kantoor in de eigen woning**: Rekent kantoorruimte in de eigen woning door voor de DGA (terbeschikkingstelling, kantoor naar de BV, 100% eigen woning) en de IB-ondernemer (privévermogen, ondernemingsvermogen zelfstandig of niet-zelfstandig, gesplitst, 100% eigen woning)
- **Overdracht ouderlijke woning**: Rekent door of het loont de woning van de ouders nu aan de kinderen over te dragen: tegen een koopschuld, als schenking of met gedeeltelijke kwijtschelding, met box 3, overdrachts-, schenk- en erfbelasting tegenover niets doen
- **Periodiek verrekenbeding**: Rekent een periodiek verrekenbeding in huwelijkse voorwaarden door: per jaar het overgespaarde inkomen en het bedrag dat de een de ander betaalt, een tekort naar verhouding van de vermogens en de achterstallige verrekening over een periode met de vermogensgroei per partner
- **Staken of verkopen van de onderneming**: Vergelijkt de netto opbrengst bij staken of verkopen van een IB-onderneming: afrekenen, afrekenen met stakingslijfrente of geruisloos doorschuiven of omzetten in een BV, met het maximum van de stakingslijfrente uit leeftijd en stakingsdatum
- **Tijdplan**: Zet leeftijden en mutatiemomenten van een gezin op een tijdlijn en rekent uit in welk jaar een leeftijd valt
- **WW-uitkering**: Berekent de duur en de hoogte van een WW-uitkering op de eerste werkloosheidsdag: de opbouw uit fictief en feitelijk arbeidsverleden binnen de wettelijke ondergrens van drie en bovengrens van 24 maanden, en de uitkering per kalendermaand tegen 75 procent over de eerste twee maanden en 70 procent daarna, met het dagloon gemaximeerd op het maximumdagloon

### Wettelijke verwijzingen: BOR bij schenken

- [Successiewet 1956, Artikel 20 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Successiewet 1956, Artikel 24 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Successiewet 1956, Artikel 33 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Successiewet 1956, Artikel 35b \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Successiewet 1956, Artikel 35c \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Successiewet 1956, Artikel 35d \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Wet inkomstenbelasting 2001, Artikel 3.63 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 4.17c \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Invorderingswet 1990, Artikel 25 \(versie 1 juli 2026\)](https://wetten.overheid.nl/BWBR0004770/2026-07-01)

### Wettelijke verwijzingen: Overdracht ouderlijke woning

- [Wet inkomstenbelasting 2001, Artikel 3.112 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-01-01)
- [Wet inkomstenbelasting 2001, Artikel 3.123a \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 5.2 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Successiewet 1956, Artikel 24 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002226/2026-01-01)
- [Wet op belastingen van rechtsverkeer, Artikel 14 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002740/2026-01-01)

### Wettelijke verwijzingen: Periodiek verrekenbeding

- [Burgerlijk Wetboek Boek 1, Artikel 1:84 \(versie 5 juli 2025\)](https://wetten.overheid.nl/BWBR0002656/2025-07-05)
- [Burgerlijk Wetboek Boek 1, Artikel 1:132 \(versie 5 juli 2025\)](https://wetten.overheid.nl/BWBR0002656/2025-07-05)
- [Burgerlijk Wetboek Boek 1, Artikel 1:135 \(versie 5 juli 2025\)](https://wetten.overheid.nl/BWBR0002656/2025-07-05)
- [Burgerlijk Wetboek Boek 1, Artikel 1:137 \(versie 5 juli 2025\)](https://wetten.overheid.nl/BWBR0002656/2025-07-05)
- [Burgerlijk Wetboek Boek 1, Artikel 1:141 \(versie 5 juli 2025\)](https://wetten.overheid.nl/BWBR0002656/2025-07-05)

### Wettelijke verwijzingen: Staken of verkopen van de onderneming

- [Wet inkomstenbelasting 2001, Artikel 2.10 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.63 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.65 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.79 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.79a \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.127 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.129 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 10a.29 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)

## Kantoor

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟡 beta | KantoorGemak | `/kantoorgemak.html` | bouwman-tools/KantoorGemak | ja | 2026-10-08 | Sylvain Bouwman | belastingplan | n.v.t. |
| 🔵 concept | Prijsafspraken | `/join-prijsafspraken.html` | bouwman-tools/Facturatie | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |
| 🔵 concept | Van rekenmodel naar bouwman.tools | `/modellen-naar-tools.html` | bouwman-tools/modellen-roadmap | ja | n.v.t. | Sylvain Bouwman | geen | n.v.t. |

- **KantoorGemak**: Kies een kantoorsjabloon (brieven aan de Belastingdienst, bezwaarschriften, brieven aan de klant), vul alleen de benodigde velden in en download het Word-bestand
- **Prijsafspraken**: Toont per klant de geldende tariefafspraken, werkstatus en factuurhistorie uit een Excel-export
- **Van rekenmodel naar bouwman.tools**: Inventarisatie van de resterende rekenmodellen, de clustering naar bouwopdrachten, de roadmap in golven en de bewijsstatus per tool. Geen rekentool: een overzichtspagina voor intern overleg

## Loonheffing & WKR

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | WKR Agent | `/join-wkr-agent.html` | bouwman-tools/WKR_agent | ja | 2026-08-31 | Sylvain Bouwman | belastingplan | n.v.t. |
| 🟢 live | Werkkostenregeling | `/werkkostenregeling.html` | bouwman-tools/werkkostenregeling | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | 2026-09-16 |

- **WKR Agent**: AI-assistent voor vragen over de werkkostenregeling
- **Werkkostenregeling**: Berekent de vrije ruimte en de eindheffing per inhoudingsplichtige (2024–2026), met de normbedragen van het jaar als naslag

## Overig

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Berekeningen | `/berekeningen.html` | bouwman-tools/berekeningen | ja | 2026-09-02 | Sylvain Bouwman | belastingplan | 2026-09-20 |
| 🟢 live | KvK Nummers Zoeken | `/kvk-zoeker.html` | bouwman-tools/kvk-zoeker | ja | n.v.t. | Sylvain Bouwman | jaarlijks | n.v.t. |

- **Berekeningen**: Rekent achttien onderwerpen door: annuïteiten, contante en toekomstige waarde, rendement, waardering box 3, boeterente, doorverkoop overdrachtsbelasting en revisierente bij afkoop van een lijfrente of een pensioenaanspraak
- **KvK Nummers Zoeken**: Vult KvK-nummers automatisch aan in een ingelezen Excel-bestand, voor Payroll

### Wettelijke verwijzingen: Berekeningen

- [Uitvoeringsbesluit inkomstenbelasting 2001, Artikel 17a, leden 1-6 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0012066/2026-01-01#Hoofdstuk5_Artikel17a)
- [Uitvoeringsbesluit inkomstenbelasting 2001, Artikel 17b \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0012066/2026-01-01#Hoofdstuk5_Artikel17b)
- [Uitvoeringsbesluit inkomstenbelasting 2001, Artikel 18, leden 1-2 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0012066/2026-01-01#Hoofdstuk5_Artikel18)
- [Uitvoeringsbesluit inkomstenbelasting 2001, Artikel 19, leden 1-8 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0012066/2026-01-01#Hoofdstuk5_Artikel19)

## Vastgoed

| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd | Eigenaar | Ritme | Geaccordeerd |
|---|---|---|---|---|---|---|---|---|
| 🟢 live | Fiscale vastgoedtool | `/fiscale-vastgoedtool.html` | bouwman-tools/fiscale-vastgoedtool | ja | 2026-09-29 | Sylvain Bouwman | belastingplan | 2026-09-29 |
| 🟢 live | Kopen of huren bedrijfspand | `/kopen-huren.html` | bouwman-tools/kopen-huren | ja | 2026-09-29 | Sylvain Bouwman | belastingplan | 2026-10-02 |
| 🟢 live | Rendementsstructuur vastgoed | `/vastgoedrendement.html` | bouwman-tools/vastgoedrendement | ja | 2026-09-04 | Sylvain Bouwman | belastingplan | 2026-09-20 |

- **Fiscale vastgoedtool**: Vergelijkt wat een verhuurd pand de DGA na belasting oplevert in box 3, onder de terbeschikkingstellingsregeling en in de eigen BV: bij aankoop, bij een pand in box 3 en bij een pand onder de tbs, per jaar doorgerekend met de latente belasting bij verkoop
- **Kopen of huren bedrijfspand**: Vergelijkt voor een IB-ondernemer kopen en huren van een bedrijfspand over dertig jaar als opgeofferd eigen vermogen na belasting, met het oordeel na 10, 20 en 30 jaar en het jaar vanaf waar kopen blijvend voordeliger is
- **Rendementsstructuur vastgoed**: Rekent het rendement op een vastgoedbelegging door en laat zien wat de financiering met vreemd vermogen met dat rendement doet: direct en indirect rendement, leegstand en de kosten van verkrijging

### Wettelijke verwijzingen: Fiscale vastgoedtool

- [Wet inkomstenbelasting 2001, Artikel 3.92 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.99b \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 5.2 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet op de vennootschapsbelasting 1969, Artikel 22 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002672/2026-01-01)
- [Wet op belastingen van rechtsverkeer 1970, Artikel 14 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002740/2026-01-01)

### Wettelijke verwijzingen: Kopen of huren bedrijfspand

- [Wet inkomstenbelasting 2001, Artikel 2.10 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.30 \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.30a \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet inkomstenbelasting 2001, Artikel 3.79a \(versie 21 februari 2026\)](https://wetten.overheid.nl/BWBR0011353/2026-02-21)
- [Wet op belastingen van rechtsverkeer, Artikel 14 \(versie 1 januari 2026\)](https://wetten.overheid.nl/BWBR0002740/2026-01-01)

## Workers

Welke Cloudflare Worker onder welke tool hangt. Of een Worker werkelijk op het
account staat is hier niet te zien: dat controleert de dagelijkse controle in
`access-beheer-worker.js` en dat meldt `beheer.html`. Een 404 op een
workers.dev-adres bewijst niets, want een Worker op een eigen route antwoordt
daar ook met 404.

| Worker | Nodig voor |
|---|---|
| `access-beheer` | het portaal zelf |
| `horeca-rapportage` | Horecarapportage uit auditfile |
| `kennisgroepen-agent` | Kennisgroepen-zoeker |
| `kvk-proxy` | KvK Nummers Zoeken |
| `modellen-roadmap` | Van rekenmodel naar bouwman.tools |
| `wkr-agent` | WKR Agent |

## Vervallen

| Bestand | Reden |
|---|---|
| `https://wwft-check.streamlit.app/` | Op 01-09-2026 uit de portefeuille gehaald. De tool draait nu in de kantooromgeving; de Streamlit-app is verwijderd en de bronrepo Sylvainbouwman/wwft-check is gearchiveerd. Er was geen Access-app (externe link). |
| `betalingskenmerk.html` | Repository hernoemd naar belastingtooljoindk; het bestand bestaat niet meer. De Access-app d0924bf1-e6c1-4098-8573-ac651b860b51 kan worden opgeruimd. |
| `join-wkr-agent-intern.html` | Op 18-08-2026 vervangen door join-wkr-agent.html. Access-app 85322344-25d4-41cd-9b08-9c79da74bb28 kan worden opgeruimd. |
| `join-wkr-agent-extern.html` | Op 18-08-2026 vervangen door join-wkr-agent.html. Access-app b98bbe15-1440-4ca4-8af1-cc12517e098f kan worden opgeruimd. |
