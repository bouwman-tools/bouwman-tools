# Beheer-authenticatie — voorbereid op 7 september 2026

Status: lokale kandidaat voor onafhankelijke review. Deze notitie is geen bewijs
van deployment of werkende live-toegang.

De Worker accepteerde beheeracties op basis van een deeltekst in `Origin`, zonder
cryptografisch bewijs van beheertoegang. De vijf beheerendpoints gebruiken nu
uitsluitend `https://bouwman.tools/beheer.html/api/admin/*`. De Worker controleert
de `Cf-Access-Jwt-Assertion` met `jose` 6.2.12, RS256, de vaste issuer
`https://bouwman-tools.cloudflareaccess.com` en de vaste beheer-AUD
`af8ac2b405ebe46b6574d003ef84f2c25c9e737d961c6871216727ad2d7790c8`.
`iss`, `aud`, `exp` en een niet-lege `sub` zijn verplicht, `nbf` wordt gecontroleerd
indien aanwezig en het tokentype moet `app` zijn. Alleen de vaste team-JWKS wordt
opgehaald; validatiefouten en JWKS-fouten geven geen toegang tot beheerdata.
De publieke issuer en AUD zijn configuratie, geen secrets.

Mutaties vereisen bovendien exact `Origin: https://bouwman.tools` en
`Content-Type: application/json`. Beheerantwoorden gebruiken `private, no-store`
en geven geen CORS-toestemming. Preflight bevat geen data. Oude `/admin/*`-paden
en alle beheeroproepen via workers.dev blijven dicht, ook met een geldig token.
De bestaande publieke `/permissions`-functie en de geplande controle blijven
behouden. De beheerpagina gebruikt same-origin credentials, weigert redirects
en toont HTTP-, login-HTML- en netwerkfouten. Een mislukte opslag behoudt de invoer
en herstelt de opslagknop; er verschijnt dan geen succesmelding.

## Onderbouwing en uitrolvoorwaarden

Volgens [Cloudflare Policy inheritance](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/#policy-inheritance)
erft een onderliggend pad de Access-app van het bovenliggende pad zolang geen
specifiekere app bestaat. Daarom blijft de nieuwe API onder `/beheer.html`.
Een ingestelde [Cookie Path](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/)
van die app past ook bij het kindpad. De exacte Worker-route staat in
`wrangler.access-beheer.jsonc`; `/beheer.html` zelf blijft bij de bestaande
Pages-origin. [Worker-routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
vereisen geproxiede DNS en volgen de specifiekste passende route.
De JWT-controle volgt het [Cloudflare Workers-voorbeeld voor tokenvalidatie](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

De coördinatie meldde op 7 september via metadata-only controle: de bestaande
Access-app beschermt `bouwman.tools/beheer.html`, er is geen specifiekere Access-app,
de apex-DNS is geproxied en de twee aanwezige Worker-routes overlappen dit pad niet.
Dit is configuratiebewijs; een anonieme HTTP 403 zonder loginredirect is geen
bewijs dat de volledige nieuwe keten werkt. Er is in deze bouwronde geen live
beheersessie gebruikt en er zijn geen Access-policies, KV of credentials gewijzigd.

Voor daadwerkelijke uitrol: bevestig de genoemde routering opnieuw en controleer
dat de beheerapp nog dezelfde AUD heeft. Rol de Worker met deze expliciete config
uit en publiceer daarna de beheerpagina; zolang de oude pagina nog aanwezig is,
weigert haar oude API-pad veilig. Test daarna de echte edge-/Access-/Worker-keten
met een toegestane beheerder en een niet-beheerder, inclusief sessieverloop.
Gebruik voor een schrijfproef uitsluitend een expliciet afgesproken synthetische
testgebruiker. Die live-controle valt buiten deze lokale voorbereiding.
Een onveilige oude Worker terugzetten herintroduceert de Origin-bypass; bij een
uitrolprobleem blijft de beveiligde weigering de veilige tijdelijke toestand.

## Testbewijs

`npm ci` en `npm test` draaien de permanente synthetische regressies. De 33 tests
roepen de echte Worker-fetch-handler en `jose`-cryptografie aan met ter plaatse
gegenereerde RSA-sleutels. Alleen JWKS-netwerk, KV en Cloudflare-API zijn vervangen.
Ze controleren geldige toegang, alle vijf endpoints met ongeldige tokens, verval,
issuer/AUD/type/sub, toekomstige `nbf`, ontbrekende `exp`, onbekende sleutel,
onbereikbare JWKS, misleidende hosts/paden, CSRF, preflight en `/permissions`.
De paginafuncties draaien met een DOM/fetch-testlader voor foutafhandeling en
succesafhandeling. Dit zijn geen afzonderlijke echte-browsertests.

`python tools/check_tools.py` meldt geen drift; bestaande inhoudelijke
registerwaarschuwingen staan los van deze wijziging. `git diff --check` slaagt.

Wrangler 4.129.1 bundelt de kandidaat succesvol met
`npm exec --yes --package=wrangler@4.129.1 -- wrangler deploy --dry-run --config wrangler.access-beheer.jsonc --outdir .wrangler/beheer-auth-dry-run`:
51,63 KiB, gzip 14,76 KiB. Dit is uitsluitend een lokale bundelcontrole, geen upload.
De tests draaien op Node 24.14.0. `package.json` zet bewust geen globaal
`type: module`: `kg-widget.js` heeft een bestaande CommonJS-export die behouden
moet blijven. De Worker wordt aan zijn ES-module-syntaxis herkend; de bestaande
Python-CI gebruikt geen Node-moduletype. `npm test` is toegevoegd als lokaal
testcommando; de bestaande CI-workflow is in deze afgebakende ronde niet gewijzigd.
De afzonderlijke CommonJS-proef met `require('./kg-widget.js')` slaagt.
Node meldt door de bewuste syntaxdetectie een `MODULE_TYPELESS_PACKAGE_JSON`-
waarschuwing; de 33 tests slagen en de productie-bundel gebruikt Wrangler.

## Permanente buitencontrole — vervolg op 7 september 2026

`python -B tools/check_admin_routes.py` doet twaalf onaangemelde proeven vanuit
een afzonderlijk proces buiten de Worker. Beide ingangen worden getest met en
zonder `Origin: https://bouwman.tools`: het oude workers.dev `/admin`-pad en het
nieuwe `/beheer.html/api/admin`-pad op bouwman.tools. Per variant gebruikt de
controle uitsluitend `GET /admin/status` en POST naar `upsert` en `delete` met
exact `{}`. Er worden geen gebruikerslijsten of responsebody's gelezen, geen
redirects gevolgd en geen cookies, JWT's of andere credentials meegestuurd.
De lege JSON bevat geen e-mailadres en valt ook in de oude handler vóór opslag
uit; een HTTP 400 betekent daarbij juist dat de authenticatiepoort is gepasseerd.

De oude ingang mag alleen 404, 401 of 403 antwoorden. De nieuwe ingang mag 401,
403 of een 302 naar exact de HTTPS-loginhost
`bouwman-tools.cloudflareaccess.com` en het pad
`/cdn-cgi/access/login/bouwman.tools` geven. Querywaarden worden niet gelogd.
Een andere host, een andere redirectstatus, 400, 5xx of een netwerk-/TLS-fout maakt
de controle rood. Een geaccepteerde weigering bewijst op zichzelf niet dat een
toegestane beheerder kan inloggen; daarvoor blijft de afzonderlijke toegangsproef
nodig.

`POST /permissions` op workers.dev is de expliciete publieke uitzondering voor
`portal.html`, vastgelegd in `PUBLIEKE_ROUTES` in het controlescript. Dit pad wordt
hier niet live met e-mailadressen getest. Deze uitzondering schrapt geen enkele
adminproef en maakt de buitencontrole geen volledige inventarisatie van alle
mogelijk bestaande routes.

De bestaande workflow heeft afzonderlijke jobs voor de synthetische tests en de
live buitencontrole. De live job draait alleen op `master` bij push, het bestaande
maandelijkse schema en handmatige dispatch. Pull requests en andere branches
krijgen uitsluitend de mocktests, omdat voorbereidende code nog niet uitgerold
hoeft te zijn. De jobs hangen niet af van de registercontrole. Uitrollen blijft
een afzonderlijke handeling; deze job verandert niets aan Cloudflare.

De zeven stdlib-mocktests draaien met
`python -B -m unittest discover -s tests -p 'test_admin_routes.py' -v` en bewijzen
onder meer dat 400 rood is, redirect-host en loginpad strikt zijn, alle twaalf
verzoeken minimale inhoud hebben, fouten geen details lekken en responsebody's
niet worden gelezen. Worker en beheerpagina zijn voor dit vervolg ongewijzigd.
