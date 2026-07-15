# bouwman.tools

Portaal en deployment-repo voor alle interne tools van Bouwman.

## Architectuur

```
bouwman-tools (deze repo)          → gehost op bouwman.tools
├── portal.html                    ← portaalpagina
├── beheer.html                    ← gebruikersbeheer (alleen voor beheerder)
├── access-beheer-worker.js        ← Cloudflare Worker broncode
├── betalingskenmerk.html
├── auto-fiscaal-2027.html
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
| auto-fiscaal-2027 | main | auto-fiscaal-2027.html |
| auto-van-de-zaak | main | join-auto-rekenmodel.html |
| BV-Ja_Nee | main | bv_janee_DK.html |
| Herstructurering | main | herstructurering-assistent-v3.html |
| Jaarrekening-review | master | Join-jaarrekening-review.html |
| Facturatie | main | join-prijsafspraken.html |
| kennisgroepen-zoeker | main | kennisgroepen-zoeker.html |
| Rekeningcourant-met-dividend | main | rc-schuld-dga.html |
| Sjablonen-DGA | main | join-bv-documenten.html |
| Werkgeversverklaring | main | nhg-werkgeversverklaring-wizard.html |
| WKR_agent | main | join-wkr-agent-intern.html + join-wkr-agent-extern.html |
| betalingskenmerk-tool | master | betalingskenmerk.html |
| xaf-export-tool | master | — (eigen subdomein xaf.bouwman.tools) |

## Een nieuwe tool toevoegen

1. **Maak een nieuwe (privé) repo aan** op GitHub voor de tool
2. Zet het HTML-bestand erin en push
3. **Voeg de sync-workflow toe** (zie kopje *Sync instellen*)
4. **Voeg de tool toe aan `portal.html`** — voeg een item toe aan het `TOOLS`-array met `file`, `icon`, `name`, `desc` en `tags`
5. **Voeg de tool toe aan `beheer.html`** — voeg een regel toe aan het `TOOLS`-array bovenaan het script
6. Push — de tool is live op `bouwman.tools/mijn-tool.html`
7. Geef gebruikers toegang via `bouwman.tools/beheer.html`

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
    branches: [main]

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
          git pull origin main --rebase
          git push
```

## Gebruikersbeheer

Toegang wordt volledig beheerd via **`bouwman.tools/beheer.html`** — alleen bereikbaar voor de beheerder.

Hier kun je:
- Gebruikers toevoegen met hun e-mailadres
- Per gebruiker aanvinken welke tools zichtbaar zijn
- Gebruikers bewerken of verwijderen

Na opslaan worden twee systemen automatisch bijgewerkt:
1. **Cloudflare KV** — slaat de rechten op (wordt direct uitgelezen door portal.html)
2. **Cloudflare Access** — regelt wie de pagina's daadwerkelijk kan openen (loopt op de achtergrond)

### Eerste toegang voor een nieuwe gebruiker
Cloudflare Access stuurt geen automatische uitnodigingsmail. Stuur de gebruiker zelf:
> Ga naar **bouwman.tools/portal.html**, vul je e-mailadres in en je ontvangt een eenmalige code. Daarna ben je 30 dagen ingelogd.

### Problemen met toegang
Als een gebruiker "geen machtiging" ziet terwijl hij wel in het systeem staat:
- Laat hem een **incognitovenster** gebruiken en opnieuw inloggen
- Of laat hem cookies wissen voor `bouwman.tools` en `cloudflareaccess.com`

Als de portal **helemaal leeg** is en het e-mailadres rechtsboven ontbreekt:
- CF Access heeft de `CF_Authorization` cookie op HttpOnly gezet — portal.html gebruikt daarvoor nu `/cdn-cgi/access/get-identity` (al gefixed). Uitloggen en opnieuw inloggen is voldoende.

**Let op:** elke machine (lokaal, RDS, etc.) heeft een eigen CF Access sessie van 30 dagen. Bij eerste gebruik op een nieuw apparaat is altijd een eenmalige code nodig.

### Technische opbouw
- **Worker:** `access-beheer.s-bouwman.workers.dev` (broncode: `access-beheer-worker.js`)
- **KV namespace:** PERMISSIONS (Cloudflare account)
- **CF Access apps:** één per tool + één voor beheer.html (alleen s.bouwman)
- **Sessieduur:** 30 dagen voor alle apps

## Hosting

| Domein | Repo | Via |
|---|---|---|
| bouwman.tools | bouwman-tools | GitHub Pages + Cloudflare (proxied) |
| xaf.bouwman.tools | xaf-export-tool | GitHub Pages + Cloudflare (proxied) |

DNS en toegangsbeveiliging lopen via **Cloudflare** (proxied + Access).
Nieuwe subdomeinen voor tools zijn niet nodig — alle tools draaien op bouwman.tools.
