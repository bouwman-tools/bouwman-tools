# Herstel synchronisatie toegangsrechten

De beheeractie antwoordde voordat de synchronisatie klaar was. De live tail van 8 september bevestigde dat `waitUntil()` na ongeveer 30 seconden werd afgebroken; er waren toen pas 14 apps bijgewerkt en de nieuwe status was nog niet opgeslagen. De beheeractie wacht nu op synchronisatie en onafhankelijke nacontrole. Vier apps worden tegelijk verwerkt; fouten blijven per app zichtbaar zonder upstream inhoud of adressen te loggen.

De nieuwe knop **Bestaande rechten synchroniseren** gebruikt een beheerroute met dezelfde JWT-, Origin- en JSON-controles. Deze actie verandert de rechtenopslag niet. Upsert en delete synchroniseren exact hun succesvol opgeslagen snapshot, zodat vertraagde KV-replicatie geen oude rechten terugzet.

Synchronisatie en dagelijkse controle bewaren ook een foutuitslag wanneer een externe dienst of rechtenopslag niet bruikbaar is. Succesvolle writes worden daarna opnieuw gelezen en vergeleken. Consolelogs zijn ingeschakeld zonder automatische invocationlogs; previews blijven uitgeschakeld. Bestaande secrets blijven behouden.

Tijdens het onderzoek bleek bovendien een oude checkout te zijn uitgerold. Daardoor ontbraken de actuele beheer-authenticatie en drie planningstools. De gecontroleerde bron is eerst hersteld. Deploy deze worker uitsluitend met de eigen `wrangler.access-beheer.jsonc` vanuit de actuele bron.

Een tweede productie-uitvoering bewees bovendien de limiet van 50 externe subrequests: na 24 writes vielen de resterende verzoeken uit. Daarom leest een ronde alle policies eenmaal, bewaart die uitsluitend in werkgeheugen en herstelt maximaal zes echte afwijkingen met PUT en een nieuwe GET. Inclusief workercontrole en JWKS blijft dit bij de huidige 33 apps onder 49 verzoeken. Het budget krimpt automatisch bij meer apps. De beheerpagina vervolgt bij voortgang automatisch en voert na de laatste wijziging een volledige leesronde uit. Een bronhash voorkomt dat vervolgrondes ongemerkt andere of verouderde bronrechten gebruiken.

De dagelijkse controle blijft op het bestaande tijdstip draaien. Bij meer afwijkingen dan het rondebudget bewaart zij expliciet wat nog openstaat; zij meldt dan geen volledig herstel. De beheeractie kan die vervolgrondes meteen uitvoeren. Een onbekende policyvorm wordt gemeld en niet overschreven.

Validatie: synthetische tests voor authenticatie, netwerkfouten, ongeldige JSON, HTTP 401, ongeldige rechtenopslag, statusopslag en nacontrole. Een runtime-mock weigert verzoek 51 en bewijst dat iedere vervolgronde onder de limiet blijft. Productie-eindcontrole wordt na uitrol afzonderlijk vastgelegd; testresultaten alleen bewijzen geen actuele policy-overeenkomst.

Technische bron voor de gemeten tijdslimiet: https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil

Subrequestlimiet: https://developers.cloudflare.com/workers/platform/limits/#subrequests
