# Status update tools — voor Bram
**Datum:** 16 juli 2026

---

## Context

Er zijn twee omgevingen waar tools live staan:

| Omgeving | URL | Stack | Toegang |
|---|---|---|---|
| **bouwman.tools** | bouwman.tools/portal.html | Vanilla HTML in de browser | Beveiligd via Cloudflare (e-mail login) |
| **Streamlit app** | belastingtooljoindk.streamlit.app | Python / Streamlit | Open |

Elke tool heeft een eigen privé GitHub-repo. Voor bouwman.tools: bij elke push kopieert een GitHub Action het HTML-bestand automatisch naar de centrale `bouwman-tools` repo → live binnen ~1 minuut.

---

## 🟢 Live op bouwman.tools — OK

| Tool | URL | Opmerking |
|---|---|---|
| Auto Fiscaal 2027 | bouwman.tools/auto-fiscaal-2027.html | |
| Auto van de Zaak | bouwman.tools/join-auto-rekenmodel.html | |
| BV Ja/Nee | bouwman.tools/bv_janee_DK.html | Laten beoordelen door fiscalisten |
| Gebruikelijk loon | bouwman.tools/gebruikelijk-loon.html | Laten beoordelen door fiscalisten |
| Rekeningcourant + Dividend | bouwman.tools/rc-schuld-dga.html | |
| Sjablonen DGA | bouwman.tools/join-bv-documenten.html | |
| Kennisgroepen-zoeker | bouwman.tools/kennisgroepen-zoeker.html | |
| WKR Agent (intern + extern) | bouwman.tools/join-wkr-agent-intern.html | |
| Werkgeversverklaring NHG | bouwman.tools/nhg-werkgeversverklaring-wizard.html | |
| KvK Nummers Zoeken | bouwman.tools/kvk-zoeker.html | Specifiek voor Payroll |
| XAF Raw Export | xaf.bouwman.tools | Eigen subdomein |

---

## 🔧 Live op bouwman.tools — moet nog ontwikkeld worden

| Tool | URL | Wat moet er nog? |
|---|---|---|
| Dividend & Uitkeringstoets | bouwman.tools/dividend-uitkeringstoets.html | In de map staan Word-sjablonen voor bestuursbesluit en AVA-notulen — deze moeten nog in de tool worden opgenomen |
| Herstructurering | bouwman.tools/herstructurering-assistent-v3.html | Eerste opzet / basis — moet verder ontwikkeld worden |

---

## 🟡 Nog niet live op bouwman.tools — klaar voor publicatie (nog te testen)

Deze tools bestaan al maar zijn nog niet gepubliceerd. Ze mogen op bouwman.tools komen, maar moeten eerst getest worden.

| Tool | GitHub | Opmerking |
|---|---|---|
| Anonimiseren | github.com/Sylvainbouwman/Anonimiseren | Publiceren met vermelding "nog in test" |
| Auditfile App | github.com/Sylvainbouwman/Auditfile_app | Publiceren met vermelding "nog in test" — op termijn moet XAF Raw Export hierin opgaan |
| BTW Teruggaaf EU | github.com/Sylvainbouwman/btw-teruggaaf-eu | Publiceren met vermelding "nog in test" |
| WWFT Check | github.com/Sylvainbouwman/wwft-check | Publiceren met vermelding "nog in test" |

---

## ❓ Open vraag — DBA Helper / Risicoscan

De DBA Helper staat lokaal klaar (`github.com/Sylvainbouwman/dba-risicoscan`) maar het is nog niet duidelijk waar en hoe deze live moet komen. Het is een Python/Streamlit app — gaat die naar de Streamlit omgeving of wordt het omgebouwd naar HTML voor bouwman.tools?

---

## 🔵 Live op Streamlit — belastingtooljoindk.streamlit.app

Zes tools in één multi-page Streamlit app, allemaal in dezelfde repo (`github.com/Sylvainbouwman/betalingskenmerk-tool`):

| Tool | Wat doet het? |
|---|---|
| Betalingskenmerk | BD-betalingskenmerken parsen naar klant / type / periode |
| VIES BTW-controle | BTW-nummers van EU-bedrijven verifiëren via VIES |
| KvK / SBI opzoeken | KvK-nummers en SBI-codes opzoeken |
| Belastingrente IB | Belastingrente berekenen voor inkomstenbelasting |
| Belastingrente VpB | Belastingrente berekenen voor vennootschapsbelasting |
| Auto BTW privé | BTW-correctie berekenen bij privégebruik auto van de zaak |

---

## 🗑️ Uit bouwman.tools te halen

| Tool | Reden |
|---|---|
| Facturatie / Prijsafspraken | Niet meer gewenst in het portaal |
| Jaarrekening Review | Niet meer gewenst in het portaal |

---

## 📋 Samenvatting actiepunten

| # | Actie | Prioriteit |
|---|---|---|
| 1 | Facturatie en Jaarrekening Review uit portal.html halen | Nu |
| 2 | Anonimiseren, Auditfile App, BTW Teruggaaf EU, WWFT Check toevoegen aan portal (met "beta"-label) | Binnenkort |
| 3 | Word-sjablonen bestuursbesluit + AVA-notulen opnemen in Dividend & Uitkeringstoets tool | Binnenkort |
| 4 | Beslissen: DBA Helper via Streamlit of ombouwen naar HTML? | Binnenkort |
| 5 | BV Ja/Nee en Gebruikelijk loon laten beoordelen door fiscalisten | Binnenkort |
| 6 | Herstructurering verder ontwikkelen | Later |
| 7 | Auditfile App uitbouwen zodat XAF Raw Export hierin opgaat | Later |
