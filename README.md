# bouwman.tools

Portaal en deployment-repo voor alle interne tools van Bouwman.

## Architectuur

```
bouwman-tools (deze repo)
├── portal.html          ← portaalpagina op bouwman.tools
├── betalingskenmerk.html
├── auto-fiscaal-2027.html
├── bv_janee_DK.html
└── ...                  ← alle tool-HTML-bestanden

xaf-export-tool (aparte repo)
└── index.html           ← gehost op xaf.bouwman.tools (eigen subdomein)
```

Elke tool heeft zijn **eigen ontwikkelrepo** (bijv. `auto-fiscaal-2027`, `betalingskenmerk-tool`). De HTML-bestanden uit die repos worden gesynchroniseerd naar deze repo voor deployment via GitHub Pages op `bouwman.tools`.

De XAF-export is de uitzondering: die heeft een eigen subdomein (`xaf.bouwman.tools`) omdat de tool oorspronkelijk in deze repo zat en later is gesplitst.

## Een nieuwe tool toevoegen

1. **Maak een nieuwe repo aan** voor de tool (bijv. `mijn-tool`)
2. Zet het HTML-bestand erin (bijv. `mijn-tool.html`) en push naar GitHub
3. **Voeg de sync-workflow toe** aan de tool-repo (zie kopje *Sync instellen* hieronder)
4. **Voeg de tool toe aan `portal.html`** in deze repo:
   - Voeg een item toe aan het `TOOLS`-array
   - Voeg het bestand toe aan het `TOEGANG`-object voor de juiste gebruikers
5. Push — de tool is live op `bouwman.tools/mijn-tool.html`

Voor een tool met **eigen subdomein** (zoals XAF):
- Voeg een `CNAME`-bestand toe aan de tool-repo
- Zet GitHub Pages aan op de tool-repo (`gh api repos/Sylvainbouwman/<repo>/pages --method POST --field source[branch]=master --field source[path]=/`)
- Voeg een DNS CNAME-record toe in Cloudflare (DNS only, niet proxied)
- Voeg een Cloudflare Access Application toe voor het subdomein

## Sync instellen (tool-repo → bouwman-tools)

Elke tool-repo heeft een GitHub Action nodig die bij elke push het HTML-bestand automatisch naar deze repo kopieert.

### Eenmalige voorbereiding

1. Maak een **GitHub Personal Access Token (PAT)** aan:
   - Ga naar github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Geef toegang tot de `bouwman-tools` repo met de rechten: **Contents: Read and write**
2. Sla de token op als **secret** in elke tool-repo:
   - Repo → Settings → Secrets and variables → Actions → New repository secret
   - Naam: `BOUWMAN_TOOLS_PAT`

### Workflow-bestand

Maak in de tool-repo het bestand `.github/workflows/sync-to-bouwman-tools.yml` aan:

```yaml
name: Sync naar bouwman-tools

on:
  push:
    branches: [master]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Kopieer HTML naar bouwman-tools
        uses: dmnemec/copy_file_to_another_repo_action@main
        env:
          API_TOKEN_GITHUB: ${{ secrets.BOUWMAN_TOOLS_PAT }}
        with:
          source_file: 'mijn-tool.html'        # ← aanpassen
          destination_repo: 'Sylvainbouwman/bouwman-tools'
          destination_branch: 'master'
          user_email: 's.bouwman@joinadministraties.nl'
          user_name: 'Sylvainbouwman'
          commit_message: 'Sync mijn-tool.html vanuit mijn-tool repo'
```

## Gebruikersbeheer

Toegang werkt op twee lagen:

### 1. Cloudflare Access (wie kan inloggen)
- Ga naar **one.dash.cloudflare.com** → Zero Trust → Access → Applications
- Klik op de juiste application → Edit → Policies
- Voeg het e-mailadres toe onder *Include*
- De gebruiker ontvangt bij het eerste bezoek een OTP per mail

### 2. Portal (welke tools zijn zichtbaar)
Bovenaan het `<script>`-blok in `portal.html` staat het `TOEGANG`-object:

```javascript
const TOEGANG = {
  's.bouwman@joinadministraties.nl': 'all',          // volledige toegang
  'collega@kantoor.nl':              ['auto-fiscaal-2027.html', 'betalingskenmerk.html'],
};
```

- `'all'` → alle tools zichtbaar
- Array → alleen de genoemde bestanden zichtbaar
- Onbekend e-mailadres → ziet alle tools (voeg toe aan TOEGANG om te beperken)

Het beheer-paneel onderin de portal (alleen zichtbaar voor accounts met `'all'`) bevat dezelfde instructies als snel-naslagwerk.

## Hosting

- **bouwman.tools** → GitHub Pages vanuit deze repo (master branch)
- **xaf.bouwman.tools** → GitHub Pages vanuit de `xaf-export-tool` repo
- DNS en toegangsbeveiliging lopen via **Cloudflare** (proxied + Access)
