# bouwman.tools

Portaal en deployment-repo voor alle interne tools van Bouwman.

## Architectuur

```
bouwman-tools (deze repo)          → gehost op bouwman.tools
├── portal.html                    ← portaalpagina
├── auto-fiscaal-2027.html
├── betalingskenmerk.html
├── bv_janee_DK.html
├── herstructurering-assistent-v3.html
├── Join-jaarrekening-review.html
├── join-auto-rekenmodel.html
├── join-bv-documenten.html
├── join-prijsafspraken.html
├── join-wkr-agent-extern.html
├── join-wkr-agent-intern.html
├── kennisgroepen-zoeker.html
├── nhg-werkgeversverklaring-wizard.html
└── rc-schuld-dga.html

xaf-export-tool (aparte repo)      → gehost op xaf.bouwman.tools
└── index.html
```

Elke tool heeft een **eigen GitHub-repo** (privé). Bij elke push naar die repo
kopieert een GitHub Action het HTML-bestand automatisch naar deze repo.
Zo staat de tool binnen een minuut live op bouwman.tools.

De XAF-export is de uitzondering: die heeft een eigen subdomein omdat de tool
oorspronkelijk in deze repo zat en later is gesplitst.

## Actieve tool-repos en hun sync

| GitHub-repo | Branch | HTML in bouwman-tools |
|---|---|---|
| auto-fiscaal-2027 | master | auto-fiscaal-2027.html |
| auto-van-de-zaak | master | join-auto-rekenmodel.html |
| BV-Ja_Nee | master | bv_janee_DK.html |
| Herstructurering | master | herstructurering-assistent-v3.html |
| Jaarrekening-review | master | Join-jaarrekening-review.html |
| Facturatie | master | join-prijsafspraken.html |
| kennisgroepen-zoeker | master | kennisgroepen-zoeker.html |
| Rekeningcourant-met-dividend | master | rc-schuld-dga.html |
| Sjablonen-DGA | master | join-bv-documenten.html |
| Werkgeversverklaring | master | nhg-werkgeversverklaring-wizard.html |
| WKR_agent | main | join-wkr-agent-intern.html + join-wkr-agent-extern.html |
| betalingskenmerk-tool | master | betalingskenmerk.html |
| xaf-export-tool | master | — (eigen subdomein xaf.bouwman.tools) |

## Een nieuwe tool toevoegen

1. **Maak een nieuwe (privé) repo aan** op GitHub voor de tool
2. Zet het HTML-bestand erin en push
3. **Voeg de sync-workflow toe** (zie kopje *Sync instellen*)
4. **Voeg de tool toe aan `portal.html`** in deze repo:
   - Voeg een item toe aan het `TOOLS`-array met `file`, `icon`, `name`, `desc` en `tags`
   - Voeg het e-mailadres + bestandsnaam toe aan het `TOEGANG`-object
5. Push portal.html — de tool is live op `bouwman.tools/mijn-tool.html`

## Sync instellen voor een nieuwe repo

### Stap 1 — Secret toevoegen aan de tool-repo
```
gh secret set BOUWMAN_TOOLS_PAT --body "<token>" --repo Sylvainbouwman/<repo-naam>
```
De token (`bouwman-tools-sync`) staat in GitHub → Settings → Developer settings →
Personal access tokens. Rechten: Contents read+write op bouwman-tools.

### Stap 2 — Workflow aanmaken in de tool-repo
Maak `.github/workflows/sync-to-bouwman-tools.yml` aan:

```yaml
name: Sync naar bouwman-tools

on:
  push:
    branches: [master]   # of main, afhankelijk van de repo

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Kopieer naar bouwman-tools
        run: |
          git clone https://x-access-token:${{ secrets.BOUWMAN_TOOLS_PAT }}@github.com/Sylvainbouwman/bouwman-tools.git _bouwman
          cp mijn-tool.html _bouwman/mijn-tool.html
          cd _bouwman
          git config user.email "s.bouwman@joinadministraties.nl"
          git config user.name "Sylvainbouwman"
          git add mijn-tool.html
          git diff --staged --quiet || git commit -m "Sync mijn-tool.html vanuit <repo-naam>"
          git pull origin master --rebase
          git push
```

## Gebruikersbeheer

Toegang werkt op twee lagen:

### 1. Cloudflare Access — wie kan inloggen
- Ga naar **one.dash.cloudflare.com** → Zero Trust → Access → Applications
- Klik op de juiste application → Edit → Policies
- Voeg het e-mailadres toe onder *Include*
- De gebruiker ontvangt bij het eerste bezoek een OTP per mail

### 2. Portal — welke tools zijn zichtbaar
Bovenaan het script in `portal.html` staat het `TOEGANG`-object:

```javascript
const TOEGANG = {
  's.bouwman@joinadministraties.nl': 'all',
  'collega@kantoor.nl': ['auto-fiscaal-2027.html', 'betalingskenmerk.html'],
};
```

- `'all'` → alle tools zichtbaar
- Array van bestandsnamen → alleen die tools zichtbaar
- Onbekend e-mailadres → ziet alle tools (voeg toe aan TOEGANG om te beperken)

Het beheer-paneel onderin de portal (alleen zichtbaar voor `'all'`-accounts)
bevat dezelfde instructies als snel-naslagwerk.

## Hosting

| Domein | Repo | Via |
|---|---|---|
| bouwman.tools | bouwman-tools | GitHub Pages + Cloudflare (proxied) |
| xaf.bouwman.tools | xaf-export-tool | GitHub Pages + Cloudflare (proxied) |

DNS en toegangsbeveiliging lopen via **Cloudflare** (proxied + Access).
Nieuwe subdomeinen voor tools zijn niet nodig — alle tools draaien op bouwman.tools.
