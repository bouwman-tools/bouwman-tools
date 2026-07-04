# UC_bouwman-tools (UC00) — Rekenmodellen & Toolportaal

| | |
|---|---|
| **Use case** | UC00 |
| **Naam** | Rekenmodellen & Toolportaal |
| **Eigenaar** | Sylvain Bouwman |
| **Domein** | Fiscaal / Advies / Interne tooling |
| **Status** | Actief in uitbouw |
| **Versie** | v3 — juni 2026 |

## Doel

Interne rekenmodellen bouwen als alternatief voor generieke Wolters Kluwer Excel-tools. De tools draaien in de browser, zijn gekoppeld aan klantdata uit AFAS, en worden gefaseerd uitgebouwd. De `bouwman-tools`-repo is het centrale portaal van waaruit alle tools worden ontsloten via [bouwman.tools](https://bouwman.tools).

## Betrokkenen

| Rol | Toelichting |
|---|---|
| Eigenaar | Sylvain Bouwman (Join Administraties Leusden) |
| Gebruikers | Accountants en belastingadviseurs bij Join Administraties en DK Accountants |
| Vakgroep | Input over gewenste toolset en prioritering |

## Trigger

Medewerker moet een financiële berekening of simulatie uitvoeren voor een klant.

## As-is situatie

Wolters Kluwer Excel-tools worden gebruikt voor standaardberekeningen (loonheffing, IB, VPB, DGA-salaris). Klantdata wordt handmatig ingevuld — geen koppeling met AFAS of CRM. De tools zijn generiek en missen kantoor-specifieke logica. Naast Kluwer gebruikt de vakgroep ook modellen van de RB, bijvoorbeeld voor geruisloze inbreng in de BV.

## To-be situatie

1. Medewerker opent de tool in de browser — geen Excel of licentie nodig
2. Basisdata (klantnaam, relevante velden) wordt ingeladen vanuit AFAS als startpunt
3. AI-laag controleert de invoer en signaleert ontbrekende gegevens of afwijkingen
4. Output genereert een concept-toelichting of adviesnotitie voor de klant
5. Resultaat wordt opgeslagen in het digitale dossier in AFAS
6. Gefaseerde uitbouw: starten met meest gebruikte tools; Kluwer blijft fallback totdat eigen toolset volledig is

## Gerealiseerde tools (onderdeel van UC00)

Elke tool heeft een eigen repo met eigen UC. Deze UC00 is het overkoepelende kader.

| Repo | Tool | Status |
|---|---|---|
| `auto-van-de-zaak` | Auto van de zaak — bijtelling, BTW-correctie, IB vs. DGA | Live |
| `Youngtimer-tool` | Youngtimerregeling 2027 — berekening en toelichting | Live |
| `Eindheffing-tool` | Eindheffing niet-elektrische auto's 2027 | Live |
| `auto-fiscaal-2027` | Gecombineerde tool Eindheffing + Youngtimer 2027 | Live |
| `BV-Ja_Nee` | BV ja/nee — vergelijking belastingdruk, break-even, adviesnota | Live |
| `Rekeningcourant-met-dividend` | RC-schuld DGA — optimale aflossingsroute | Live |
| `betalingskenmerk-tool` | Belastingtools — betalingskenmerk, IB-berekening | Live |
| `kenteken-tool` | Kenteken-tool — bestelauto heffingscheck 2027 | Live |

## Waarom zelf bouwen

- Koppelbaar aan eigen klantdata uit AFAS — minder handmatig invoeren
- Output direct opslaan in digitaal dossier via AFAS UpdateConnector
- Kantoor-specifieke logica verwerken, niet afhankelijk van Kluwer-releases
- Geen abonnementskosten, geen vendor lock-in
- Altijd actueel: één update geldt direct voor iedereen
- Werkt op elk apparaat via de browser, geen Excel-licentie nodig
- Professionele uitstraling in klantgesprekken, in eigen huisstijl

## Open punten

- Input vakgroep: welke Kluwer/RB-tools worden het meest gebruikt en moeten als eerste worden gebouwd?
- AFAS-koppeling: GetConnector voor inladen basisdata, UpdateConnector voor opslaan output — afstemmen met Egency/Growteq
- Onderhoud: wie is verantwoordelijk voor het actueel houden van tarieven per tool?

## Waarde

| | |
|---|---|
| **Tijdwinst** | Minder handmatig invoeren per berekening; direct beschikbaar zonder bestanden te distribueren |
| **Kwaliteit** | Minder invoerfouten, consistentere uitkomsten kantoorbreed; automatische adviesnota bespaart schrijftijd |
| **Positionering** | Onafhankelijkheid van leveranciers; professionele uitstraling in klantgesprekken |
