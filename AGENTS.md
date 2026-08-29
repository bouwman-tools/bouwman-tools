# bouwman-tools

Verzamel- en publicatierepository voor de tools op bouwman.tools. Aanvullend op de
globale instructies en op de `CLAUDE.md` van `AI_kopgroep`. Neem hier alleen
projectspecifieke informatie op; geen klantnamen, secretwaarden of absolute paden.

## Rol en bron van waarheid

- Deze repo bevat de **publieke** versies van de tools plus de eigen bestanden van het
  portaal (o.a. `portal.html`, `beheer.html`, worker-, publicatie-, documentatie- en
  configuratiebestanden).
- Voor elke tool is de **individuele toolrepo de bron van waarheid**. De hier gepubliceerde
  HTML is een **kopie** die door de sync-workflow wordt geplaatst.

## Vaste regel: nooit rechtstreeks een gesyncte tool-HTML hier bewerken

- Wijzig een tool altijd in zijn **eigen toolrepo**; die publiceert zichzelf via de
  sync-workflow naar deze repo.
- Bewerk in deze repo uitsluitend de **eigen bestanden van de verzamelrepo** (portal,
  beheer, docs, worker, publicatie/config).
- Een directe bewerking van een gesyncte tool-HTML hier wordt bij de eerstvolgende sync
  **teruggedraaid**, omdat de toolrepo de kopie overschrijft. Dit is in aug 2026
  aantoonbaar gebeurd.

## Werk altijd vanuit een bijgewerkte kloon

Begin werk in deze repo altijd met `git status` gevolgd door `git pull --ff-only`:
de remote beweegt door de sync-workflows van de toolrepo's en door andere sessies,
zonder dat een lokale kloon dat vanzelf ziet (`git status` raadpleegt de remote
niet). Commit nooit vanuit een kopie waarvan je de achterstand niet hebt
gecontroleerd; `--ff-only` maakt een scheefgelopen kopie zichtbaar in plaats van
stil te mergen.

## tools.json is de enige bron van de toolportefeuille

`tools.json` legt per tool vast: naam, bestand of URL, categorie, status, bronrepo,
het Cloudflare Access-app-id en welke jaarafhankelijke waarden erin zitten. Voeg je een
tool toe of haal je er een weg, dan begin je daar.

- `portal.html`, `beheer.html`, `access-beheer-worker.js` (APP_IDS) en `TOOLS.md` moeten
  daarmee overeenkomen. Houd nergens een tweede lijst bij.
- `TOOLS.md` wordt **gegenereerd**: `python tools/check_tools.py --schrijf-tools-md`.
  Bewerk dat bestand niet met de hand.
- `python tools/check_tools.py` faalt bij drift, en draait ook in CI
  (`.github/workflows/check-tools.yml`). Een tool die gepubliceerd staat maar niet in
  `tools.json` voorkomt, laat de controle falen.
- Een tool zonder `access_app_id` is **niet afgeschermd**: het bestand is voor iedereen
  met de URL bereikbaar en rechten toekennen in `beheer.html` heeft er geen effect op.
  De controle rapporteert dat apart. `tools/maak_access_apps.py` maakt de ontbrekende
  apps aan; dat script draait de eigenaar zelf met een eigen `CF_API_TOKEN`.

## Sync-mechanisme

- Elke toolrepo heeft `.github/workflows/sync-to-bouwman-tools.yml`.
- Trigger: push naar de defaultbranch (sommige repos ook `workflow_dispatch`).
- De job cloont deze repo, kopieert één HTML-bestand en pusht; bij geen wijziging volgt
  geen commit.

## De workers worden niet vanuit deze repo gedeployd

Vastgesteld op 28-08-2026. Er draaien drie workers op het account: `access-beheer`,
`wkr-agent` en `kennisgroepen-agent`. Geen daarvan heeft een deploy-configuratie in deze
repository; ze zijn los geupload.

- `access-beheer-worker.js` hier is een **kopie**. De gedeployde versie was op 28-08-2026
  byte-identiek aan deze kopie, maar dat is niet geborgd: een wijziging hier gaat pas live
  als je de worker apart deployt.
- **Let op de valstrik:** `wrangler.toml` in deze repo beschrijft een worker `kvk-proxy`
  met `main = kvk-worker.js`. Die worker bestaat niet op het account. `wrangler deploy`
  vanuit deze map maakt dus een nieuwe, ongebruikte worker aan en werkt `access-beheer`
  *niet* bij.
- Wijzig je `APP_IDS`, deploy de worker dan bewust (dashboard of een eigen
  wrangler-config met de juiste KV-binding en route) en controleer daarna dat
  `beheer.html` rechten kan toekennen aan de gewijzigde tools.

## Secrets — let op: de organisatie staat op GitHub Free

- Op **Free** werken **organisatie-Actions-secrets alleen voor publieke repos**. De private
  toolrepos kunnen een org-secret dus niet gebruiken.
- Daarom heeft **elke toolrepo een eigen repo-secret** `BOUWMAN_TOOLS_PAT`: een
  fine-grained PAT met resource owner `bouwman-tools`, doelrepo `bouwman-tools` en
  permission **Contents: read/write**.
- **Rotatie** = de nieuwe PAT in het repo-secret van elke toolrepo zetten
  (`gh secret set BOUWMAN_TOOLS_PAT -R bouwman-tools/<repo>`). Eén centraal org-secret zou
  een upgrade naar GitHub Team vereisen.
- Bewaak de **vervaldatum** van de PAT: een verlopen PAT laat alle syncs op authenticatie
  falen.

## Auth verifiëren zonder vals-positief

- Een sync-run kan groen zijn zonder echt te authenticeren: deze (publieke) repo clonen mag
  anoniem, en bij "geen wijziging" stopt de job vóór `git push`.
- Toets auth met een run die **echt `git push` bereikt**; `Everything up-to-date` in de log
  betekent geslaagde push-authenticatie.
