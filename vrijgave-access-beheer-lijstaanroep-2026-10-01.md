# Toegangscontrole weer werkend boven 42 apps

De dagelijkse controle van 01-10-2026 06:00 UTC meldde afwijking `*`: "Controle kon niet worden voltooid". Oorzaak: de controleronde van 08-09-2026 haalde de policies per app op en kromp haar budget met elke app (`45 - aantal apps`). Bij meer dan 42 apps weigerde zij te starten. Met 48 apps in `APP_IDS` faalden daardoor ook `/admin/sync`, `/admin/upsert` en `/admin/delete`. Upsert en delete schrijven de rechten eerst naar KV, dus een opslag in beheer kwam sinds 30-09-2026 wel in de opslag maar niet op Cloudflare Access.

De controle haalt nu alle Access-apps met hun policies in één lijstaanroep op: `GET /accounts/{id}/access/apps?per_page=1000`, hoogstens drie pagina's. De kosten van een leesronde hangen daardoor niet meer af van het aantal apps. Levert de lijst voor een app geen bruikbare policy, dan volgt voor die app de bekende losse aanroep, binnen een vaste reserve van zes per ronde; daarboven meldt de controle de app als niet gecontroleerd en schrijft zij niets. Een app die niet op het account staat, wordt gemeld en niet beschreven.

Het herstel zelf blijft per app: policy ophalen, bij een herbruikbare policy de exclusiviteitscheck, dan de PUT. Een ronde herstelt hoogstens tien apps; `beheer.html` voert de vervolgrondes uit (tot twaalf). De nacontrole leest opnieuw de lijst. Het zwaarste geval blijft op 45 subrequests per ronde, met JWKS en workercontrole meegerekend. Bij een eigen, vaste foutmelding (rechtenopslag ontbreekt of is ongeldig, status niet op te slaan) bewaart `scheduled` die reden in plaats van alleen "bekijk de workerlogs".

Fiscale waarden: geen.

Validatie: `npm test` geeft 147 van 147 geslaagd. Nieuwe synthetische tests met de werkelijke 48 apps: volledige cyclus binnen de limiet en binnen de twaalf vervolgrondes van beheer, een leesronde met precies één lijstaanroep en nul losse aanroepen, een mislukte lijstaanroep (geen writes, reden per tool, geen `*`), een ontbrekende app, ontbrekende policies in de lijst, en het zwaarste geval op hoogstens 45 subrequests. De runtime-mock weigert verzoek 51. Productie-eindcontrole wordt na de uitrol apart vastgelegd in `OPENSTAAND.md`.

Bronnen: lijst van Access-apps met `policies` en `per_page` tot 1000, https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/list/ ; subrequestlimiet, https://developers.cloudflare.com/workers/platform/limits/#subrequests
