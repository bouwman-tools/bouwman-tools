# Beheerstatus: een opgeslagen uitslag leest niet langer als de stand van nu

Status: lokale kandidaat voor onafhankelijke review. Geen publicatie, geen deploy, geen
wijziging aan de worker, rechten, policies, status of accordering.

## Waarom

Drie keer op één dag wees deze pagina de verkeerde kant op.

De controle van 4 september 08:00:39 stond er op 8 september nog als huidige toestand. Die
uitslag was echt, maar vier dagen oud: de dagelijkse cron vuurt wel en gooide sinds
5 september elke keer een exception, dus er is sindsdien niets weggeschreven.

De laatste synchronisatie meldde 30 mislukte tools met HTTP 401, en de pagina adviseerde
daarbij een gebruiker op te slaan. Bij een 401 helpt dat niet: opslaan probeert dezelfde
geweigerde aanroep opnieuw.

En na het opslaan van een gebruiker bleef de balk de stand van vóór die actie tonen, omdat
`laadStatus()` alleen bij het openen van de pagina liep. Wie iets opsloeg en keek of het
gelukt was, zag dus een uitslag van daarvoor. Daar is op 8 september een half uur aan
verloren gegaan met de conclusie dat de synchronisatie faalde, terwijl er alleen niets was
ververst.

## Wat er verandert, alleen in `beheer.html`

- **Ouderdomstoets.** Een controle ouder dan 36 uur, zonder tijdstip, met een onleesbaar
  tijdstip of met een tijdstip in de toekomst levert "actuele toestand onbekend", met de
  ouderdom in uren erbij. De marge ligt ruim boven het dagelijkse interval, zodat één
  overgeslagen ronde nog geen alarm geeft.
- **Een derde toestand.** Naast groen en rood is er nu `onbekend` (amber). Een schone maar
  oude controle is niet groen: zij zegt niets over nu.
- **Na een opslag wordt de balk opnieuw geladen,** met het moment van die opslag erbij.
  Staat er dan nog een synchronisatie van vóór dat moment, dan meldt de pagina dat de
  uitslag van deze opslag nog niet is weggeschreven en dat wat er staat een eerdere poging
  betreft. `syncCFAccess` loopt in `waitUntil` door, dus die situatie is normaal en hoort
  benoemd te worden in plaats van verzwegen.
- **Woordkeuze.** "De laatst opgeslagen synchronisatie" en "de laatst opgeslagen controle",
  met de toevoeging dat het de uitslag van die poging is en niet de stand van nu.
- **Volledige lijsten.** Afwijkingen en fouten werden stil afgekapt op vijf. Nu worden er
  acht getoond en staat er bij een langere lijst exact hoeveel regels niet zijn getoond.
- **Geen actuele conclusie uit een oude meting.** Bij een 401 meldt de pagina dat Cloudflare
  bij díe synchronisatie de authenticatie weigerde, dat pas een nieuwe controle uitwijst of
  het inmiddels is hersteld, en dat een intussen vervangen token niet opnieuw moet worden
  ingevoerd op grond van deze historische melding. Bij elke andere fout staat er dat het de
  uitslag van dat moment is. **Het generieke advies om een gebruiker op te slaan is
  vervallen:** een 500, een 403, een ontbrekende controletijd of een vier dagen oude
  afwijking bewijst niet dat die schrijfactie nodig is.

De worker is niet gewijzigd. De onderliggende exception in de scheduled-handler blijft dus
bestaan; deze wijziging maakt hem zichtbaar in plaats van dat een oud resultaat hem
verbergt. Dat is bewust: een workerwijziging vraagt een deploy en raakt het schrijven van
policies, en dat valt buiten deze afgebakende reparatie.

## Testbewijs

`npm test`: **109 tests, nul gefaald.** Dat is de bestaande set plus vijftien nieuwe in
`tests/beheer-status.test.mjs`, die de echte `laadStatus` uit de pagina uitvoeren met een
vaste klok en uitsluitend synthetische statuspayloads. Gedekt: verse controle groen; oude
controle niet groen en als onbekend gelabeld; een schone maar oude controle die niet als
zekerheid leest; ontbrekend en onleesbaar tijdstip; een oude 401 die in de verleden tijd
blijft en geen nieuw token eist; de waarschuwing tegen opnieuw invoeren op grond van
historie; geen enkele fout die nog het opslaanadvies geeft, getoetst op 500, 403 en 401;
403 dat geen authenticatiefout is; zes afwijkingen zonder afkapping; twaalf afwijkingen met
de exacte telling van vier verborgen regels; een synchronisatie van vóór en van ná de
opslag; en een mislukte statusophaal die geen verzonnen stand toont.

`python tools/check_tools.py` geeft exitcode 0 zonder drift en de elf registertests slagen.

Twee meetnotities voor wie dit naleest:

- In een verse worktree faalden eerst drie testbestanden, `beheer-auth`, `portaal-auth` en
  `portaal-legacy`. Dat was geen regressie maar een ontbrekende `npm ci`; zonder `jose`
  kunnen die bestanden niet laden, en dan lijken drie tests kapot terwijl er 43 niet zijn
  gedraaid. Kijk dus naar het aantal en niet alleen naar pass of fail.
- Eén bestaande assertie in `tests/beheer-ui.test.mjs` legde het aantal verzoeken bij een
  geslaagde opslag vast op twee. Dat is er nu drie, omdat de statusbalk erna opnieuw wordt
  geladen. Die ene regel is aangepast en zegt nu ook welk derde verzoek het is; het gedrag
  dat de test bewaakt is niet veranderd.

**Wat hiermee niet is bewezen:** geen echte browsercontrole, geen ingelogde beheersessie,
en geen bewijs dat de dagelijkse controle weer doorkomt. Dat laatste blijkt pas uit de
eerstvolgende cron van 06:00 UTC.
