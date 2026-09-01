# Context voor een chatgesprek over bouwman.tools

> Plak dit blok aan het begin van een gesprek met Claude in de chat (of een andere
> assistent zonder toegang tot de repo). Het beschrijft wat bouwman.tools is, hoe het
> in elkaar zit en welke afspraken gelden, zodat je niet elke keer opnieuw hoeft uit
> te leggen waar het over gaat.
>
> Dit bestand hoort bij de verzamelrepo `bouwman-tools/bouwman-tools` en wordt met de
> hand bijgehouden. Bijgewerkt: 1 september 2026.

---

## In één alinea

bouwman.tools is een verzameling eigen, browsergebaseerde reken- en adviestools voor
een accountants- en belastingadvieskantoor (Join Administraties, Leusden, samen met DK
Accountants). Ze vervangen stap voor stap de generieke Excel-modellen van Wolters Kluwer
en het RB: geen licentie of Excel nodig, kantoor-eigen logica, één update geldt meteen
voor iedereen. Elke tool is één zelfstandig HTML-bestand dat volledig in de browser
draait. Alles staat achter een login op het portaal `bouwman.tools/portal.html`.
Eigenaar en bouwer is Sylvain Bouwman; gebruikers zijn de accountants en
belastingadviseurs van beide kantoren.

## De opzet: één toolrepo per tool, één verzamelrepo

- **Per tool één eigen (privé) GitHub-repo** in de organisatie `bouwman-tools`. Daar
  staat de broncode, de testset en de documentatie van die ene tool. **Dat is de bron
  van waarheid.**
- **Eén publieke verzamelrepo** `bouwman-tools/bouwman-tools`, gehost via GitHub Pages
  op `bouwman.tools`. Daarin staan de *kopieën* van de tool-HTML plus de eigen bestanden
  van het portaal.
- Een GitHub Action in elke toolrepo (`sync-to-bouwman-tools.yml`) kopieert bij elke push
  naar de defaultbranch het HTML-bestand naar de verzamelrepo. Binnen ongeveer een minuut
  staat de wijziging live.

**De belangrijkste regel die daaruit volgt:** een gesyncte tool-HTML wordt *nooit*
rechtstreeks in de verzamelrepo bewerkt. Zo'n bewerking wordt bij de eerstvolgende sync
overschreven. Wijzigingen aan een tool gaan altijd in de eigen toolrepo. In de
verzamelrepo worden alleen de eigen bestanden bewerkt: het portaal, het beheerscherm,
de documentatie, de workerkopie en de configuratie.

## Wat er in de verzamelrepo staat

| Bestand | Wat het is |
|---|---|
| `portal.html` | De portaalpagina met alle tegels; leest de rechten van de ingelogde gebruiker uit |
| `beheer.html` | Gebruikersbeheer, alleen voor de beheerder: wie mag welke tool zien |
| `tools.json` | **De enige bron van de toolportefeuille** (zie hieronder) |
| `tools.schema.json` | Beschrijft welke velden in `tools.json` mogen staan |
| `tools/check_tools.py` | Valideert de portefeuille en genereert `TOOLS.md`; draait ook in CI |
| `TOOLS.md` | Gegenereerd overzicht — niet met de hand bewerken |
| `access-beheer-worker.js` | Kopie van de Cloudflare Worker die rechten verdeelt |
| `AGENTS.md` / `CLAUDE.md` | De werkafspraken voor deze repo |
| `ROADMAP.md`, `UC_bouwman-tools (UC00).md` | Pijplijn en de overkoepelende use case |
| `bouwman-tools-snippet.html` | Huisstijl: kleurenpalet en footervarianten voor de tools |

## `tools.json` is de spil

Per tool ligt daarin vast: naam, bestand of externe URL, categorie, status, bronrepo, het
Cloudflare Access-app-id, welke jaarafhankelijke waarden erin zitten, wanneer die voor
het laatst zijn gecontroleerd, wie de inhoudelijk verantwoordelijke is en met welk
beoordelingsritme. `portal.html`, `beheer.html`, de `APP_IDS` in de worker en `TOOLS.md`
moeten daarmee overeenkomen; er wordt nergens een tweede lijst bijgehouden.
`check_tools.py` faalt bij drift en draait bij elke push en maandelijks op schema.

Statussen: `live` (zichtbaar en bedoeld voor gebruik), `beta` (zichtbaar met bèta-tag,
inhoudelijk nog niet vrijgegeven), `verborgen` (wel bereikbaar via directe link, bewust
niet in een menu) en `concept` (nog niet gepubliceerd).

Vaste afspraak: **een nieuwe tool gaat meteen als `beta` het portaal in**, zodat
testgebruikers ermee aan de slag kunnen — niet wachten op de fiscale beoordeling.
Voorwaarde is wel dat de Access-app er eerst staat: nooit onafgeschermd het portaal in.

## De portefeuille op hoofdlijnen

Op dit moment 21 tools, waarvan 17 als HTML in de verzamelrepo en 4 externe apps
(Streamlit of een eigen subdomein) die als tegel in het portaal staan en in een nieuw
tabblad openen.

- **BV & DGA** — BV Ja/Nee (eenmanszaak versus BV), Sjablonen DGA (holdingdocumenten),
  Rekeningcourant + Dividend (excessief lenen, aflossingsroute), Herstructurering,
  Gebruikelijk loon, Dividend & Uitkeringstoets (art. 2:216 BW, met AVA-notulen),
  Earningsstripping
- **Auto & Mobiliteit** — Auto Fiscaal 2027 (bijtelling, pseudo-eindheffing, youngtimer),
  Auto van de Zaak (zakelijk versus privé)
- **Loonheffing & WKR** — WKR Agent, Werkgeversverklaring NHG
- **BTW** — BTW Teruggaaf EU
- **Belastingdienst** — Kennisgroepen-zoeker, Belastingtool JoinDK
- **Administratie & archief** — Bewaarplicht Checker
- **Accountancy & jaarrekening** — Jaarrekening review (verborgen), XAF Raw Export,
  Auditfile App
- **Arbeidsrecht & compliance** — DBA Risicoscan
- **Kantoor / overig** — Prijsafspraken (verborgen), KvK Nummers Zoeken

Een paar tools (Herstructurering, WKR Agent, Kennisgroepen-zoeker) zijn AI-assistenten
die via de Anthropic API werken; daar hoort de regel bij dat er geen klantdata in gaat.

## Hoe er gewerkt wordt

De repo's staan als lokale kloon op de laptop van Sylvain; daar wordt met **Claude Code**
in VS Code aan gewerkt. Claude Code heeft dus toegang tot de bestanden en kan zelf
wijzigen, committen en pushen — een gewoon chatgesprek kan dat niet en levert alleen
tekst die met de hand overgenomen wordt.

Er is geen buildstap en geen framework: elke tool is één zelfstandig HTML-bestand met de
CSS en JavaScript erin, dat direct in de browser opent. Geen `npm`, geen bundler, geen
dependencies om te installeren. Codevoorstellen horen dus een compleet, op zichzelf
staand blok te zijn dat in dat ene bestand geplakt kan worden — geen imports, geen
buildinstructies, en geen oplossing die een pakket of een server nodig heeft.

Werk in een lokale kloon altijd bijgewerkt: begin met `git status` en `git pull --ff-only`.
De remote beweegt door de sync-workflows van de toolrepo's en door andere sessies zonder
dat een lokale kloon dat vanzelf ziet, en `--ff-only` maakt een scheefgelopen kopie
zichtbaar in plaats van stil te mergen.

## Toegang en beveiliging

- DNS en beveiliging lopen via Cloudflare (proxied + Cloudflare Access). Inloggen gaat
  met het zakelijke e-mailadres en een eenmalige code; de sessie duurt 30 dagen en geldt
  per apparaat.
- Per tool hangt er één Cloudflare Access-app. **Een tool zonder `access_app_id` is niet
  afgeschermd**: het bestand is dan voor iedereen met de URL bereikbaar, en rechten
  toekennen in het beheerscherm heeft er geen effect op. De controle rapporteert dat
  apart.
- De rechten zelf staan in Cloudflare KV en worden uitgelezen door het portaal; de
  Worker `access-beheer` regelt het bijwerken van zowel KV als de Access-apps.
- **De workers worden niet vanuit deze repo gedeployd.** De worker-JS in de repo is een
  kopie; een wijziging daarin gaat pas live als de worker apart wordt gedeployd. Er zit
  bovendien een valstrik: de `wrangler.toml` in de repo beschrijft een worker die niet
  op het account bestaat, dus een `wrangler deploy` vanuit die map werkt de echte worker
  niet bij.

## Secrets, in het kort

De organisatie staat op GitHub Free, en daar werken organisatie-Actions-secrets alleen
voor publieke repos. De toolrepos zijn privé, dus **elke toolrepo heeft een eigen
repo-secret** met een fine-grained PAT die naar de verzamelrepo mag schrijven. Roteren
betekent dus: het secret in elke toolrepo opnieuw zetten. De vervaldatum van die token
is een bewakingspunt — verloopt hij, dan falen alle syncs op authenticatie.

Let daarbij op een vals-positief: een groene sync-run bewijst niet dat de authenticatie
werkt, want de publieke verzamelrepo mag anoniem gecloond worden en bij "geen wijziging"
stopt de job vóór de push. Alleen een run die echt tot een push komt, toetst de auth.

## Het onderhoudsritme: de tools zijn fiscaal jaargebonden

Dit is het hart van het werk. Bijna elke tool rekent met bedragen, tarieven en grenzen
die per belastingjaar veranderen. De cyclus:

- **September (Prinsjesdag)** — per tool inventariseren welke voorstellen de jaarwaarden
  raken. Een voorstel is nog geen recht: er wordt nog niets gewijzigd, alleen worden de
  open punten vastgelegd.
- **December (na publicatie in het Staatsblad)** — per tool het nieuwe jaarblok toevoegen
  in de bronrepo. Elke waarde geverifieerd met vindplaats, met tests per rekenregel en
  per grens, en gesynct vóór 1 januari. Daarna wordt in `tools.json` de controledatum
  bijgewerkt.
- **Tussentijds** — een bevinding van een gebruiker, een besluit of rechtspraak wordt een
  issue in de bronrepo en gaat door dezelfde molen: bron erbij, test erbij, nooit stil
  fixen.

De bewaking zit in `check_tools.py`: een controle op of na 1 september van het voorgaande
jaar telt als actueel voor het lopende jaar, ouder geeft een waarschuwing, meer dan een
jaar oud laat de controle falen. Daarnaast heeft elke tool een vangnet in zichzelf: bij
een onbekend boekjaar volgt een melding en wordt nooit stil doorgerekend op oude waarden.

## Eigenaarschap en vrijgave

Elke tool heeft één inhoudelijk verantwoordelijke die beoordeelt of de tool vakinhoudelijk
klopt; bouw en onderhoud blijven bij Sylvain. Bij elke publicatie die het gedrag raakt,
krijgt die eigenaar een vrijgavenotitie: wat is gewijzigd, welke fiscale waarden dat raakt
met vindplaats, de uitslag van de testset en wat hij concreet moet beoordelen. Versturen
is nog geen accorderen — de datum van accordering gaat pas om als er echt is gereageerd.
Ontbrekend eigenaarschap of een verlopen accordering blokkeert niets: de tool blijft live
en de controle meldt de achterstand. De eigenaren waren per 1 september 2026 nog niet
toegewezen.

## Waar de chat wél en niet bij helpt

Een chatgesprek heeft geen toegang tot de repo's en kan dus niets publiceren. Wat er goed
werkt: meedenken over de fiscale inhoud en de rekenregels, een wettelijke grondslag of
vindplaats naast een uitkomst leggen, teksten voor het portaal of een vrijgavenotitie
schrijven, prompts voor de AI-tools aanscherpen, een testset bedenken, of sparren over
wat er op de roadmap hoort.

Twee dingen om er altijd bij te zeggen:

1. **Een fiscale waarde zonder vindplaats gaat niet in een tool.** Elke bedrag, tarief of
   grens die uit een gesprek komt, moet met de officiële bron worden geverifieerd voordat
   hij in code belandt.
2. **Het resultaat landt altijd in de eigen toolrepo,** nooit rechtstreeks in de
   verzamelrepo — anders wordt het bij de eerstvolgende sync weggeschreven.

En: geen klantnamen, secretwaarden of persoonsgegevens in het gesprek.

---

## Nog aan te vullen (stand 1 september 2026)

Deze tekst is geschreven op basis van uitsluitend de verzamelrepo. Wat er nog in hoort,
maar nog niet is gelezen:

- De skills `fiscale-bron-verificatie`, `release-en-sync` en `onderhoud-en-jaarwerk`,
  plus de `CLAUDE.md` van `AI_kopgroep`. Die staan niet op GitHub onder dit account en
  moeten dus met de hand worden aangeleverd. Daarin zit de werkwijze: hoe een wijziging
  van idee tot vrijgave loopt en hoe een fiscale waarde wordt geverifieerd.
- De inhoud van de 17 toolrepo's zelf — hun use cases, testsets en jaarwaardenblokken.
  Die zijn wel via GitHub bereikbaar; drie representatieve (BV-Ja_Nee, auto-fiscaal-2027,
  WKR_agent) zijn genoeg voor een eerlijk beeld.
- Vijf repo's onder `Sylvainbouwman` zijn niet zichtbaar via de GitHub-koppeling; de
  18 repo's van de organisatie `bouwman-tools` zijn dat wel. Nagaan welke vijf dat zijn
  en of daar iets relevants tussen zit.
