# Openstaande punten bouwman-tools

Per punt de status, de eigenaar en de vindplaats. Een punt verdwijnt alleen met datum
en reden; gesloten punten blijven staan.

## 1. Access-controle liep vast boven 42 apps

- **Status:** gesloten op 01-10-2026 12:15 CEST. Reden: uitgerold en in productie nagecontroleerd (zie onder).
- **Eigenaar:** Sylvain (bouw en onderhoud).
- **Vindplaats:** `access-beheer-worker.js`, functies `haalAccessApps`,
  `controleerPolicies` en `synchroniseerEnControleer`; tests in
  `tests/beheer-sync.test.mjs`.
- **Wat er was (01-10-2026):** de dagelijkse controle van 01-10-2026 06:00 UTC meldde
  afwijking `*` met "Controle kon niet worden voltooid". `synchroniseerEnControleer`
  rekende `45 - aantal apps` als budget en gooide onder de 3; met 48 apps in `APP_IDS`
  gooide hij dus altijd. Daardoor faalden ook `/admin/sync`, `/admin/upsert` en
  `/admin/delete`. Upsert en delete schrijven de rechten eerst naar KV, dus een opslag
  in `beheer.html` kwam wel in de opslag maar niet op Cloudflare Access. De grens
  bestond om de limiet van 50 subrequests per uitvoering op het gratis Workers-plan.
- **Wat er is veranderd:** de controle haalt alle apps met hun policies in één
  lijstaanroep op (`GET /accounts/{id}/access/apps?per_page=1000`, documentatie:
  https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/methods/list/).
  De kosten van een leesronde hangen daardoor niet meer af van het aantal apps. Herstel
  blijft per ronde begrensd (hoogstens tien apps); `beheer.html` doet de vervolgrondes.
  Levert de lijst voor een app geen bruikbare policy, dan volgt een losse aanroep binnen
  een vaste reserve. Een ronde blijft in het zwaarste geval op 45 subrequests; de tests
  toetsen dat. `scheduled` bewaart bij een eigen, vaste foutmelding nu die reden in
  plaats van alleen "bekijk de workerlogs".
- **Nacontrole (01-10-2026):** worker `access-beheer` uitgerold door Sylvain, versie
  `6eeafbb1-924c-4e7e-b396-bf4ae9d16ef8`, met KV-binding `PERMISSIONS` en cron
  `0 6 * * *` behouden. Daarna in `beheer.html` **Bestaande rechten synchroniseren**:
  eindmelding groen, dus geen afwijkingen meer en geen afwijking `*`. Het aantal tools
  dat door de halve opslagen sinds 30-09-2026 achterliep, is niet vastgelegd. De
  synchronisatie herstelde het in vervolgrondes, en de status bewaart alleen de laatste
  ronde. Vast staat dat er na het herstel niets meer afwijkt.
