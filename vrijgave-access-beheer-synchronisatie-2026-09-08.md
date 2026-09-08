# Herstel synchronisatie toegangsrechten

De beheeractie antwoordde voordat de synchronisatie klaar was. De live tail van 8 september bevestigde dat `waitUntil()` na ongeveer 30 seconden werd afgebroken; er waren toen pas 14 apps bijgewerkt en de nieuwe status was nog niet opgeslagen. De beheeractie wacht nu op synchronisatie en onafhankelijke nacontrole. Vier apps worden tegelijk verwerkt; fouten blijven per app zichtbaar zonder upstream inhoud of adressen te loggen.

De nieuwe knop **Bestaande rechten synchroniseren** gebruikt een beheerroute met dezelfde JWT-, Origin- en JSON-controles. Deze actie verandert de rechtenopslag niet. Upsert en delete synchroniseren exact hun succesvol opgeslagen snapshot, zodat vertraagde KV-replicatie geen oude rechten terugzet.

Synchronisatie en dagelijkse controle bewaren ook een foutuitslag wanneer een externe dienst of rechtenopslag niet bruikbaar is. Succesvolle writes worden daarna opnieuw gelezen en vergeleken. Consolelogs zijn ingeschakeld zonder automatische invocationlogs; previews blijven uitgeschakeld. Bestaande secrets blijven behouden.

Tijdens het onderzoek bleek bovendien een oude checkout te zijn uitgerold. Daardoor ontbraken de actuele beheer-authenticatie en drie planningstools. De gecontroleerde bron is eerst hersteld. Deploy deze worker uitsluitend met de eigen `wrangler.access-beheer.jsonc` vanuit de actuele bron.

Validatie: synthetische tests voor authenticatie, netwerkfouten, ongeldige JSON, HTTP 401, ongeldige rechtenopslag, statusopslag en nacontrole. Productie-eindcontrole wordt na uitrol afzonderlijk vastgelegd; testresultaten alleen bewijzen geen actuele policy-overeenkomst.

Technische bron voor de gemeten tijdslimiet: https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil
