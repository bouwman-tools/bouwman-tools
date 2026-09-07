# Portaalrechten via de aangemelde identiteit

Lokale kandidaat; deze notitie is geen bewijs van deployment of werkende live-login.
De wijziging raakt geen fiscale waarden, Access-policies of opgeslagen rechten.

`portal.html` vraagt zijn identiteit en rechten samen op via
`GET /portal.html/api/permissions`. De Worker verifieert de Access-handtekening met
de bestaande vaste team-JWKS, RS256 en issuer, maar met de afzonderlijke portaal-AUD
`657d4271cbbc633b07596f57968f3eb586fe7c4e5d6d51e3b58dcef545e1f646`.
De beheer-AUD blijft alleen voor beheer gelden. De portaalmetadata is op 7 september
tweemaal gecontroleerd: self-hosted app `4f132e0b-6557-4726-8371-111024d21f39`, pad
`bouwman.tools/portal.html`, sessieduur 24 uur en geen specifiekere Access-app onder
dat pad. Er zijn daarbij geen rechten, gebruikers of credentials opgevraagd.

De identiteit komt uitsluitend uit de geverifieerde `email`-claim. Body, query en
losse identiteitsheaders zijn geen alternatief. Ontbrekende/ongeldige claims geven
401/403 vóór KV. Een geldige onbekende gebruiker krijgt `access: []`; bestaande
sleutels worden exact gebruikt, zonder hoofdletterconversie of opslagwijziging.
Alleen een eigen sleutel en een waarde `"all"` of een stringarray tellen als rechten.
Onbereikbare, ontbrekende of ongeldige opslag geeft een algemene 503. Deze route
schrijft niets en roept de Cloudflare-beheer-API niet aan.

Alle persoonlijke antwoorden zijn `private, no-store`, zonder CORS-toestemming.
De pagina gebruikt same-origin cookies, weigert redirects en valideert het volledige
antwoord. Een laad-/loginfout toont geen kaarten; een geslaagd leeg antwoord meldt
afzonderlijk dat er nog geen tools zijn toegewezen. De bestaande beheerfuncties en
geplande controle blijven behouden.

## Twee expliciete uitrolstappen

Deze eerste commit bevat een tijdelijk compatibiliteitsvenster voor de oude
`POST /permissions` op workers.dev. Zonder beide publieke deployvariabelen
`LEGACY_PERMISSIONS_FROM` en `LEGACY_PERMISSIONS_UNTIL` blijft dat endpoint dicht
(410, geen KV-read). Beide tijden moeten exacte UTC-ISO-tijden met milliseconden zijn;
het venster is maximaal 30 minuten, inclusief start en exclusief einde. Ongeldige,
ontbrekende of verlopen configuratie faalt gesloten, ook voor preflight.
Er zijn bewust geen echte uitroltijden vooraf in broncode of config ingevuld.

1. Kies beide tijden pas bij de daadwerkelijke uitrol van deze overgangscommit en
   leg het gekozen venster en de uitgerolde commit vast. Gebruik de expliciete
   `wrangler.access-beheer.jsonc`, behoud bestaande bindings/secrets en beide routes.
   De waarden kunnen als publieke `--var`-opties mee; kies de start bij de uitrol en
   het einde hoogstens 30 minuten later. Dit is geen nieuw secret.
2. Publiceer `portal.html` uit dezelfde commit. Wacht op geslaagde CI en Pages en
   controleer dat de gepubliceerde pagina uitsluitend de nieuwe route aanroept.
   Controleer de nieuwe edge-/Access-/Workerketen binnen de daarvoor gegeven
   toestemming. Een anonieme afwijzing bewijst niet dat een geldige login werkt.
3. Rol daarna de afzonderlijke definitieve sluitingscommit uit. Die verwijdert
   legacycode en vensterinterpretatie volledig; ook achtergebleven variabelen kunnen
   de oude route dan niet heropenen. Controleer dat oude POST en OPTIONS geen rechten
   meer teruggeven en werk de repository bij tot de definitieve versie.

Tijdens het expliciete venster blijft de oude bodygebaseerde route beschikbaar voor
de oude pagina; de exacte Origin-controle daarop is geen authenticatiebewijs.
Dit is bewust uitsluitend overgangsgedrag. Als CI of finalisatie faalt, sluit de
route toch op de vaste eindtijd. Verleng niet stil en zet geen onbeperkte oude Worker
terug; een oude pagina kan dan tijdelijk geen tools laden totdat de publicatie klopt.
De routeconfig gebruikt het kindpad zodat de bestaande Access-app en een eventuele
Cookie Path `/portal.html` passen. Bevestig bij uitrol dat de gemeten app en route-
dekking nog gelden. Bestaande proxied DNS en beheerrouting worden niet gewijzigd.

## Onderbouwing en lokale controles

- [Access-paderfenis](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/#policy-inheritance)
- [Gevalideerde emailclaim in het applicatietoken](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/)
- [JWT-verificatie in een Worker](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Worker-routes vóór de bestaande origin](https://developers.cloudflare.com/workers/configuration/routing/routes/)

`npm ci --ignore-scripts --no-audit --no-fund` en `npm test` slagen lokaal; de
overgangsversie heeft 96 geslaagde tests. Ze gebruiken echte JWT-cryptografie met ter plaatse gegenereerde
RSA-sleutels, synthetische identiteiten en vervangende KV/netwerkfuncties. De tests
dekken beide audiences, identiteitsmanipulatie, opslagfouten, legacy-default-deny en
de grenzen van het tijdelijke venster. De echte portal- en beheerfuncties worden
uitgevoerd met een kleine DOM/fetch-adapter. Dit is geen echte-browserproef.
De definitieve commit vervangt de venstertests door bewijs dat ook oude venstervars
niets meer openen. De bestaande synthetische beheertests blijven deel van `npm test`.

`python tools/check_tools.py` meldt geen drift en `git diff --check` slaagt.
De overgangsversie bundelt lokaal met Wrangler 4.129.1, `deploy --dry-run` en deze
expliciete config: 54,55 KiB, gzip 15,54 KiB. Er is niets geüpload. Geen live KV,
credentials of aangemelde browsers gebruikt voor deze controles. De bestaande
Node-waarschuwing over moduledetectie blijft ongewijzigd; de bundel is een ES-module.
