# Openstaande punten bouwman-tools

Per punt de status, de eigenaar en de vindplaats. Een punt verdwijnt alleen met datum
en reden; gesloten punten blijven staan.

## 1. Access-controle liep vast boven 42 apps

- **Status:** open tot de nacontrole na de uitrol (zie onder) is gedaan.
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
- **Nog te doen:** na de uitrol een synchronisatie in beheer laten lopen en vastleggen
  hoeveel tools na de halve opslagen sinds 30-09-2026 afweken (alleen aantallen).
