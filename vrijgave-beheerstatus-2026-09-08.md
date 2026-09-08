# Beheerstatus: een oude uitslag leest niet langer als de stand van nu

Status: lokale kandidaat voor onafhankelijke review. Geen publicatie, geen deploy, geen
wijziging aan rechten, policies, status of accordering.

## Waarom

Op 8 september toonde `beheer.html` nog de controle van 4 september 08:00:39 als huidige
toestand. Die uitslag was echt, maar vier dagen oud: de dagelijkse cron vuurt wel en gooit
sinds 5 september elke keer een exception, dus er is sindsdien niets weggeschreven.
Daarnaast meldde de laatste synchronisatie 30 mislukte tools met HTTP 401, en de pagina
adviseerde daarbij een gebruiker op te slaan. Bij een 401 helpt dat niet: opslaan schrijft
de rechten en probeert dezelfde geweigerde aanroep opnieuw.

Een pagina die een oude uitslag als de huidige stand toont, en die bij een
authenticatiefout naar de verkeerde handeling wijst, maakt een storing onzichtbaar in
plaats van zichtbaar.

## Wat er verandert, alleen in `beheer.html`

- **Ouderdomstoets.** Een controle ouder dan 36 uur, zonder tijdstip, met een onleesbaar
  tijdstip of met een tijdstip in de toekomst levert "actuele toestand onbekend", met de
  ouderdom in uren erbij. De marge ligt ruim boven het dagelijkse interval, zodat één
  overgeslagen ronde nog geen alarm geeft.
- **Een derde toestand.** Naast groen en rood is er nu `onbekend` (amber). Een schone maar
  oude controle is niet groen: zij zegt niets over nu.
- **Woordkeuze.** "De laatst opgeslagen synchronisatie" en "de laatst opgeslagen controle",
  met de toevoeging dat het de uitslag van die poging is en niet de stand van nu.
- **Volledige lijsten.** Afwijkingen en fouten werden stil afgekapt op vijf. Nu worden er
  acht getoond en staat er bij een langere lijst exact hoeveel regels niet zijn getoond.
- **Twee tegengestelde adviezen, nooit samen.** Bij een 401 in de laatste synchronisatie
  meldt de pagina dat Cloudflare het token van de worker niet accepteert, dat opnieuw
  opslaan dat niet oplost en dat een nieuw token nodig is. De oorzaak blijft daarbij
  uitdrukkelijk open: verlopen, vervangen of ontbrekend. Bij elke andere fout blijft het
  bestaande advies staan om een gebruiker op te slaan, want dat helpt bij een policy die
  achterloopt.

De worker is niet gewijzigd. De onderliggende exception in de scheduled-handler blijft dus
bestaan; deze wijziging maakt hem alleen zichtbaar in plaats van dat een oud resultaat hem
verbergt. Dat is bewust: een workerwijziging vraagt een deploy en raakt het schrijven van
policies, en dat valt buiten deze afgebakende reparatie.

## Testbewijs

`npm test` in deze worktree: **106 tests, nul gefaald**. Dat is de bestaande set van 94 plus
twaalf nieuwe in `tests/beheer-status.test.mjs`, die de echte `laadStatus` uit de pagina
uitvoeren met een vaste klok en uitsluitend synthetische statuspayloads. Gedekt: verse
controle groen; oude controle niet groen en als onbekend gelabeld; een schone maar oude
controle die niet als zekerheid leest; ontbrekend en onleesbaar tijdstip; 401 dat naar het
token wijst en het opslaanadvies onderdrukt; 401 dat de oorzaak openlaat; een niet-401-fout
die het opslaanadvies behoudt; 403 dat niet als authenticatiefout geldt; zes afwijkingen
zonder afkapping; twaalf afwijkingen met de exacte telling van vier verborgen regels; en een
mislukte statusophaal die geen verzonnen stand toont.

`python tools/check_tools.py` geeft exitcode 0 zonder drift en de elf registertests slagen.

Eén meetnotitie voor wie dit naleest: in een verse worktree faalden eerst drie testbestanden.
Dat was geen regressie maar een ontbrekende `npm ci`; zonder `jose` kunnen de worker- en
JWT-tests niet laden. Op een schone master gaven dezelfde bestanden 94 groen.

**Wat hiermee niet is bewezen:** geen echte browsercontrole, geen ingelogde beheersessie,
en geen bewijs dat de dagelijkse controle weer doorkomt. Dat laatste is pas te zien aan de
eerstvolgende cron van 06:00 UTC.
