#!/usr/bin/env python3
"""Controleert of portal.html, beheer.html en access-beheer-worker.js overeenkomen
met tools.json, de enige bron van waarheid voor de toolportefeuille, en bewaakt de
actualiteit van de jaargebonden waarden en de inhoudelijke beoordeling per tool.

portal.html en beheer.html houden sinds 04-09-2026 geen eigen toollijst meer bij:
zij bouwen hun kaarten en aanvinkvakjes op uit tools.json. Deze controle kijkt bij
die twee daarom niet meer of elke tool erin voorkomt, maar of het mechanisme er nog
staat en of het register alles bevat wat de paginas nodig hebben. APP_IDS in de
worker is wel nog een eigen lijst en wordt regel voor regel vergeleken.

Van welke Cloudflare Worker een tool afhangt staat sinds 04-09-2026 ook in het
register, in 'workers' per tool en in 'portaalworkers' voor de workers van het
portaal zelf. Of die Workers werkelijk op het account staan kan deze controle niet
zien: dat is het account en niet de repository. Dat doet de dagelijkse controle in
access-beheer-worker.js. Hier wordt alleen getoetst dat het register die
afhankelijkheid vastlegt en dat de worker haar daaruit haalt.

Faalt met exitcode 1 zodra er drift is of jaarwaarden meer dan een jaar niet zijn
gecontroleerd. Een ontbrekende eigenaar of achterstallige beoordeling blokkeert
bewust niet: die worden gemeld, de tool blijft live. Draait lokaal en in CI
(bij elke push en maandelijks op schema).

    python tools/check_tools.py
"""
from __future__ import annotations

import datetime
import html
import json
import os
import re
import subprocess
import sys
from urllib.parse import quote, urlsplit

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Bestanden van het portaal zelf; die horen niet in tools.json.
INFRA = {"portal.html", "beheer.html", "index.html", "bouwman-tools-snippet.html"}

# Dezelfde expliciete hosts als definitions/grondslag in tools.schema.json.
OFFICIELE_BRONHOSTS = {
    "wetten.overheid.nl", "officielebekendmakingen.nl", "zoek.officielebekendmakingen.nl",
    "belastingdienst.nl", "www.belastingdienst.nl", "kennisgroepen.belastingdienst.nl",
    "uitspraken.rechtspraak.nl", "eur-lex.europa.eu", "curia.europa.eu",
}


def markdown_tekst(tekst: str) -> str:
    """Eén regel tekst; steeds na een vaste prefix gebruiken, nooit als losse regel."""
    tekst = html.escape(" ".join(str(tekst).split()), quote=False)
    return re.sub(r"([\\`*_{}\[\]()!|])", r"\\\1", tekst)


def grondslag_link(grondslag: dict) -> str:
    """Maak alleen links naar expliciete officiële HTTPS-hosts; geen bronaanvraag."""
    url = grondslag["url"]
    delen = urlsplit(url)
    if (delen.scheme != "https" or delen.netloc not in OFFICIELE_BRONHOSTS or
            re.search(r"[\s\x00-\x1f\x7f<>]", url)):
        raise ValueError("Een grondslag moet naar een toegestane officiële HTTPS-bron verwijzen.")
    label = markdown_tekst(f"{grondslag['regeling']}, {grondslag['artikel']}")
    return f"[{label}]({quote(url, safe=':/?&=#%+,-._~')})"


def grondslag_regels(tool: dict) -> list[str]:
    grondslagen = tool.get("grondslagen", [])
    if not grondslagen:
        return []
    return [f"### Wettelijke verwijzingen: {markdown_tekst(tool['naam'])}", ""] + [
        f"- {grondslag_link(grondslag)}" for grondslag in grondslagen
    ] + [""]


def lees(naam: str) -> str:
    with open(os.path.join(WORTEL, naam), encoding="utf-8", errors="ignore") as fh:
        return fh.read()


def sleutel(tool: dict) -> str:
    """De verwijzing waarmee een tool in portal/beheer voorkomt."""
    return tool.get("bestand") or tool.get("url") or ""


def jaarwaarden_status(tool: dict, vandaag: datetime.date) -> tuple[str, str]:
    """Beoordeelt de actualiteit van de jaargebonden waarden van een tool.

    De jaarcyclus volgt het Belastingplan: definitieve waarden voor jaar X
    verschijnen tussen Prinsjesdag en het Staatsblad in het najaar van X-1.
    Een controle op of na 1 september van het voorgaande jaar telt daarom als
    actueel voor het lopende jaar.

    Retourneert (soort, tekst) met soort:
      'nvt'        — tool heeft geen jaargebonden waarden;
      'ok'         — gecontroleerd voor het lopende jaar;
      'ontbreekt'  — wel jaarwaarden, geen controledatum (waarschuwing);
      'verouderd'  — niet gecontroleerd voor het lopende jaar (waarschuwing);
      'verlopen'   — meer dan een jaar niet gecontroleerd (fout);
      'ongeldig'   — onbruikbare datum (fout).
    """
    if not tool.get("jaarwaarden"):
        return "nvt", "n.v.t."
    ruw = tool.get("jaarwaarden_gecontroleerd")
    if not ruw:
        return "ontbreekt", "controledatum ontbreekt"
    try:
        datum = datetime.date.fromisoformat(str(ruw))
    except ValueError:
        return "ongeldig", f"onbruikbare datum {ruw!r} (verwacht JJJJ-MM-DD)"
    if datum < vandaag - datetime.timedelta(days=365):
        return "verlopen", f"laatst gecontroleerd {datum}, meer dan een jaar geleden"
    if datum < datetime.date(vandaag.year - 1, 9, 1):
        return "verouderd", f"laatst gecontroleerd {datum}, nog niet voor {vandaag.year}"
    return "ok", str(datum)


def beoordeling_status(tool: dict, vandaag: datetime.date) -> tuple[str, str]:
    """Beoordeelt of de inhoudelijke accordering door de eigenaar nog staat.

    De eigenaar accordeert dat de tool vakinhoudelijk juist is. Het ritme staat per
    tool in tools.json: 'belastingplan' volgt dezelfde cyclus als de jaarwaarden,
    'jaarlijks' is een gewone jaartermijn en 'geen' vraagt alleen om beoordeling
    bij een wijziging.

    Retourneert (soort, tekst) met soort:
      'nvt'          — de tool vraagt geen fiscaal oordeel, of ritme 'geen';
      'ok'           — geaccordeerd binnen het ritme;
      'onbeoordeeld' — nog nooit geaccordeerd;
      'verlopen'     — accordering valt buiten het ritme;
      'ongeldig'     — onbruikbare datum of onbekend ritme (fout).
    """
    ritme = tool.get("beoordelingsritme", "jaarlijks")
    if ritme not in ("belastingplan", "jaarlijks", "geen"):
        return "ongeldig", f"onbekend beoordelingsritme {ritme!r}"
    # Twee vragen die op één veld lagen: heeft deze tool een fiscaal oordeel nodig, en hoe
    # vaak moet zij worden onderhouden. Wie de ruis uit de kolom wilde halen door het ritme
    # op 'geen' te zetten, zette daarmee ook het onderhoud uit; een KvK-zoeker hoeft niet te
    # worden afgetekend maar zijn koppeling moet wel jaarlijks worden nagekeken. Sinds
    # 10-09-2026 zegt fiscaal_oordeel het eerste. Het ritme telt nog mee zolang er tools zijn
    # die het veld niet dragen; die uitzondering kan weg zodra alles is ingedeeld.
    if not tool.get("fiscaal_oordeel", True):
        return "nvt", "n.v.t."
    if ritme == "geen":
        return "nvt", "n.v.t."
    ruw = tool.get("laatst_beoordeeld")
    if not ruw:
        return "onbeoordeeld", "nog niet inhoudelijk geaccordeerd"
    try:
        datum = datetime.date.fromisoformat(str(ruw))
    except ValueError:
        return "ongeldig", f"onbruikbare datum {ruw!r} (verwacht JJJJ-MM-DD)"
    if ritme == "belastingplan":
        # Zelfde ijkpunt als de jaarwaarden: geaccordeerd op of na 1 september van
        # het voorgaande jaar telt voor het lopende jaar.
        actueel = datum >= datetime.date(vandaag.year - 1, 9, 1)
    else:
        actueel = datum >= vandaag - datetime.timedelta(days=365)
    if not actueel:
        return "verlopen", f"laatst geaccordeerd {datum}, buiten het ritme {ritme}"
    return "ok", str(datum)


def leest_register(pagina: str, naam: str, vlag: str) -> list[str]:
    """Controleert dat een pagina de toollijst uit tools.json haalt.

    Sinds portal.html en beheer.html hun eigen lijst niet meer bijhouden, is dit de
    controle die in de plaats komt van het vergelijken van die lijst met het register:
    haalt de pagina het register op, filtert zij op de juiste vlag, en staat er geen
    tweede lijst met bestandsnamen in die stil kan gaan afwijken?
    """
    meldingen = []
    if "fetch('tools.json'" not in pagina:
        meldingen.append(
            f"{naam} haalt tools.json niet op; de toollijst hoort uit het register te komen."
        )
    if f"t.{vlag} === true" not in pagina:
        meldingen.append(f"{naam} filtert niet op {vlag} uit tools.json.")
    # Een teruggekeerde eigen lijst valt op aan losse .html-bestandsnamen in
    # aanhalingstekens. Verwijzingen naar de infrastructuurpaginas zelf horen erbij.
    eigen = {
        f for f in re.findall(r"['\"]([A-Za-z0-9_.\-]+\.html)['\"]", pagina)
        if f not in INFRA
    }
    if eigen:
        meldingen.append(
            f"{naam} noemt zelf weer bestandsnamen ({', '.join(sorted(eigen))}); "
            "de lijst hoort alleen in tools.json te staan."
        )
    return meldingen


def kijkt_naar_workers(worker: str) -> list[str]:
    """Controleert dat de worker de workercontrole uit het register voedt.

    Dezelfde gedachte als leest_register: niet de uitkomst toetsen, want die hangt
    van het account af, maar het mechanisme. Een tweede lijst met workernamen in de
    worker zou stil uit de pas gaan lopen, precies zoals de vier toollijsten deden.
    """
    meldingen = []
    if "tools.json" not in worker:
        meldingen.append(
            "access-beheer-worker.js haalt tools.json niet op; de workercontrole hoort "
            "haar lijst uit het register te halen."
        )
    if "workers/scripts" not in worker:
        meldingen.append(
            "access-beheer-worker.js vergelijkt niet met de scriptlijst van het account; "
            "een verdwenen Worker blijft dan onopgemerkt."
        )
    for veld in ("portaalworkers", "tool.workers"):
        if veld not in worker:
            meldingen.append(
                f"access-beheer-worker.js gebruikt {veld!r} uit tools.json niet; dan mist "
                "de workercontrole een deel van wat er op het account hoort te staan."
            )
    return meldingen


def valideer_schema(bron: dict) -> list[str]:
    """Valideert tools.json tegen tools.schema.json als jsonschema beschikbaar is."""
    pad = os.path.join(WORTEL, "tools.schema.json")
    if not os.path.exists(pad):
        return [f"tools.json verwijst naar {os.path.basename(pad)}, dat niet bestaat."]
    try:
        import jsonschema
    except ImportError:
        return []
    with open(pad, encoding="utf-8") as fh:
        schema = json.load(fh)
    validator = jsonschema.Draft7Validator(schema)
    return [
        "tools.json: " + "/".join(str(p) for p in f.absolute_path) + f": {f.message}"
        for f in sorted(validator.iter_errors(bron), key=lambda f: list(f.absolute_path))
    ]


def stempel_status() -> tuple[str, str] | None:
    """Kijkt of het veld bijgewerkt in tools.json nog klopt met de laatste wijziging.

    Het veld wordt met de hand gezet en werd daarom vergeten: op 11-09-2026 stond het op
    2026-09-09 terwijl er die dag en de dag ervoor inhoudelijk was gewijzigd, twee keer
    door een andere schrijver. De pagina en TOOLS.md tonen dat veld, dus een achterlopende
    stempel zegt de lezer dat hij naar oudere gegevens kijkt dan er staan.

    Vergelijkt met de auteurdatum van de laatste commit die tools.json raakt. Buiten een
    werkkopie, of zonder git, valt er niets te vergelijken en zwijgt deze controle.

    Retourneert None als er niets te melden is, anders (veldwaarde, commitdatum).
    """
    try:
        uit = subprocess.run(
            ["git", "log", "-1", "--format=%ad", "--date=short", "--", "tools.json"],
            cwd=WORTEL, capture_output=True, text=True, timeout=10,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    laatste = uit.stdout.strip()
    if uit.returncode != 0 or not laatste:
        return None
    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        veld = json.load(fh).get("bijgewerkt") or ""
    try:
        if datetime.date.fromisoformat(veld) >= datetime.date.fromisoformat(laatste):
            return None
    except ValueError:
        return veld or "(leeg)", laatste
    return veld, laatste


def main() -> int:
    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        bron = json.load(fh)

    tools = bron["tools"]
    volgorde = bron.get("categorievolgorde", [])
    vervallen = {v["bestand"] for v in bron.get("vervallen", [])}

    portal = lees("portal.html")
    beheer = lees("beheer.html")
    worker = lees("access-beheer-worker.js")

    app_ids = dict(
        re.findall(r"'([A-Za-z0-9_.\-]+\.html)':\s*'([0-9a-f\-]{36})'", worker)
    )
    html_in_repo = {f for f in os.listdir(WORTEL) if f.endswith(".html")}

    fouten: list[str] = []
    waarschuwingen: list[str] = []
    jaarwaarden_meldingen: list[str] = []
    eigenaar_meldingen: list[str] = []
    onbeoordeeld: list[str] = []
    beoordeling_meldingen: list[str] = []
    # Welke Worker hangt onder welke tool. Alleen om te tonen: of hij op het account
    # staat kan deze controle niet zien.
    workers: dict[str, list[str]] = {}
    vandaag = datetime.date.today()

    for pw in bron.get("portaalworkers", []):
        workers.setdefault(pw["naam"], []).append("het portaal zelf")

    fouten += valideer_schema(bron)

    ids = [t["id"] for t in tools]
    if len(ids) != len(set(ids)):
        fouten.append("tools.json bevat dubbele id's.")

    for tool in tools:
        ref = sleutel(tool)
        naam = tool["naam"]
        if not ref:
            fouten.append(f"{naam}: geen bestand en geen url.")
            continue

        # Een tool met status 'concept' is nog niet gepubliceerd: het bestand staat
        # alleen in de bronrepo. Zo staat werk in uitvoering toch in tools.json,
        # zonder dat de controle daarop struikelt. 'bestand' blijft verplicht en
        # noemt de beoogde bestandsnaam.
        concept = tool["status"] == "concept"

        # bestand_in_repo false betekent: de pagina staat wel op bouwman.tools, maar
        # een eigen Worker serveert haar en het bestand hoort hier bewust niet te
        # staan, omdat de git-historie van deze repo publiek is.
        in_repo = tool.get("bestand_in_repo", True)

        # 1. Bestaat het bestand echt?
        if not tool.get("extern") and not concept and in_repo and ref not in html_in_repo:
            fouten.append(f"{naam}: {ref} staat in tools.json maar bestaat niet in de repo.")
        if not in_repo and ref in html_in_repo:
            fouten.append(
                f"{naam}: bestand_in_repo is false maar {ref} staat hier wel. Haal het weg "
                "of zet bestand_in_repo op true; de git-historie van deze repo is publiek."
            )
        if concept and ref in html_in_repo:
            fouten.append(
                f"{naam}: status is concept maar {ref} staat gepubliceerd in de repo. "
                "Zet de status op beta of live."
            )

        # 2. Menuzichtbaarheid
        if concept and (tool.get("in_portal") or tool.get("in_beheer")):
            fouten.append(
                f"{naam}: status is concept, dus in_portal en in_beheer horen false te zijn."
            )
        # portal.html en beheer.html bouwen hun lijst uit het register op, dus een tool
        # met in_portal of in_beheer true komt daar vanzelf in. Wat de controle hier nog
        # moet doen is toetsen of het register alles bevat wat het portaal nodig heeft
        # om een kaart te kunnen tekenen.
        if tool.get("in_portal"):
            if not tool.get("icon"):
                fouten.append(
                    f"{naam}: in_portal is true maar er is geen icon; portal.html tekent "
                    "de kaart daaruit."
                )
            if tool["categorie"] not in volgorde:
                fouten.append(
                    f"{naam}: categorie {tool['categorie']!r} staat niet in "
                    "categorievolgorde, dus die kop komt achteraan in portaal en beheer."
                )
        for tag in tool.get("tags", []):
            if tag["label"].lower() in ("beta", "bèta"):
                fouten.append(
                    f"{naam}: de beta-tag hoort niet in tags; portal.html leidt die af uit "
                    "status, anders staat de status op twee plekken."
                )

        # 3. Afscherming
        app_id = tool.get("access_app_id")
        if app_id and app_ids.get(ref) != app_id:
            fouten.append(
                f"{naam}: access_app_id in tools.json komt niet overeen met APP_IDS in de worker."
            )
        if not app_id and not tool.get("extern") and not concept:
            waarschuwingen.append(
                f"{naam} ({ref}) heeft geen Access-app: het bestand is voor iedereen "
                "met de URL bereikbaar en rechten toekennen in beheer.html heeft geen effect."
            )

        # 3b. Van welke Worker hangt de tool af?
        # Een adres in de pagina is het enige wat hier te zien is; het bewijs of de
        # Worker bestaat ligt op het account. Staat er wel een workers.dev-adres in de
        # pagina maar niets in het register, dan is de dagelijkse controle blind voor
        # die Worker. Zo stond kvk-zoeker op 04-09-2026 stuk in het portaal.
        for naam_worker in tool.get("workers", []):
            workers.setdefault(naam_worker, []).append(naam)
        if not tool.get("extern") and not concept and in_repo and ref in html_in_repo:
            if ".workers.dev" in lees(ref) and not tool.get("workers"):
                fouten.append(
                    f"{naam}: {ref} roept een workers.dev-adres aan maar heeft geen "
                    "'workers' in tools.json; de dagelijkse controle merkt het dan niet "
                    "als die Worker van het account verdwijnt."
                )

        # 4. Actualiteit van de jaargebonden waarden
        soort, tekst = jaarwaarden_status(tool, vandaag)
        if soort in ("verlopen", "ongeldig"):
            fouten.append(
                f"{naam}: jaarwaarden ({', '.join(tool['jaarwaarden'])}): {tekst}. "
                "Verifieer de waarden in de bronrepo en werk jaarwaarden_gecontroleerd bij."
            )
        elif soort in ("verouderd", "ontbreekt"):
            jaarwaarden_meldingen.append(f"{naam}: {tekst}.")

        # 5. Eigenaarschap en inhoudelijke beoordeling.
        # Bewust niet blokkerend: een tool zonder eigenaar of met een verlopen
        # accordering blijft live, de achterstand wordt zichtbaar gemeld.
        eigenaar = (tool.get("eigenaar") or "").strip()
        if not eigenaar or eigenaar.lower() == "tbd":
            eigenaar_meldingen.append(naam)
        soort, tekst = beoordeling_status(tool, vandaag)
        if soort == "ongeldig":
            fouten.append(f"{naam}: beoordeling: {tekst}.")
        elif soort == "onbeoordeeld":
            onbeoordeeld.append(naam)
        elif soort == "verlopen":
            beoordeling_meldingen.append(
                f"{naam} ({eigenaar or 'geen eigenaar'}): {tekst}."
            )

    # 6. Verwijzingen die nergens meer op slaan
    bekend = {sleutel(t) for t in tools}
    for ref in sorted(set(app_ids) - bekend - INFRA):
        fouten.append(
            f"APP_IDS bevat {ref}, dat niet in tools.json staat"
            + (" (staat wel onder 'vervallen')." if ref in vervallen else ".")
        )

    # 7. Gepubliceerd maar nergens vastgelegd
    gepubliceerd = html_in_repo - INFRA
    for ref in sorted(gepubliceerd - bekend):
        fouten.append(
            f"{ref} staat gepubliceerd in de repo maar niet in tools.json. "
            "Neem hem op, of haal de kopieerstap uit de sync-workflow van de bronrepo."
        )

    # 8. Halen portaal en beheer hun lijst nog uit het register?
    fouten += leest_register(portal, "portal.html", "in_portal")
    fouten += leest_register(beheer, "beheer.html", "in_beheer")
    fouten += kijkt_naar_workers(worker)
    for naam, pagina in (("portal.html", portal), ("beheer.html", beheer)):
        if "categorievolgorde" not in pagina:
            fouten.append(
                f"{naam} gebruikt categorievolgorde uit tools.json niet; dan houdt de "
                "pagina weer een eigen volgorde bij."
            )

    print(f"tools.json: {len(tools)} tools, bijgewerkt {bron.get('bijgewerkt', '?')}")
    print(f"in_portal {sum(1 for t in tools if t.get('in_portal'))} "
          f"· APP_IDS {len(app_ids)} · HTML in repo {len(gepubliceerd)}")
    print()

    if workers:
        print(f"WORKERS IN HET REGISTER ({len(workers)}):")
        for naam_worker, waarvoor in sorted(workers.items()):
            print(f"  - {naam_worker}: {', '.join(sorted(waarvoor))}")
        print("  Of ze werkelijk op het account staan controleert de dagelijkse "
              "controle in de worker; dat is het account en niet deze repo.")
        print()

    if waarschuwingen:
        print(f"NIET AFGESCHERMD ({len(waarschuwingen)}):")
        for w in waarschuwingen:
            print(f"  - {w}")
        print()

    if jaarwaarden_meldingen:
        print(f"JAARWAARDEN NIET ACTUEEL ({len(jaarwaarden_meldingen)}):")
        for m in jaarwaarden_meldingen:
            print(f"  - {m}")
            # In GitHub Actions ook als annotatie op de run, zodat de melding
            # zichtbaar is zonder de log te openen.
            if os.environ.get("GITHUB_ACTIONS"):
                print(f"::warning::Jaarwaarden: {m}")
        print()

    if eigenaar_meldingen:
        print(f"GEEN EIGENAAR VASTGELEGD ({len(eigenaar_meldingen)}):")
        print("  " + ", ".join(sorted(eigenaar_meldingen)))
        print("  Leg 'eigenaar' vast in tools.json; zonder eigenaar komt de "
              "vrijgavenotitie nergens terecht.")
        print()

    if onbeoordeeld:
        print(f"NOG NOOIT INHOUDELIJK GEACCORDEERD ({len(onbeoordeeld)}):")
        print("  " + ", ".join(sorted(onbeoordeeld)))
        print()

    if beoordeling_meldingen:
        print(f"ACCORDERING VERLOPEN ({len(beoordeling_meldingen)}):")
        for m in sorted(beoordeling_meldingen):
            print(f"  - {m}")
            if os.environ.get("GITHUB_ACTIONS"):
                print(f"::warning::Beoordeling: {m}")
        print()

    stempel = stempel_status()
    if stempel:
        veld, laatste = stempel
        print("STEMPEL LOOPT ACHTER:")
        print(f"  - tools.json zegt bijgewerkt {veld}, maar is voor het laatst gewijzigd op {laatste}.")
        print("    Zet het veld bijgewerkt gelijk aan de datum van je wijziging.")
        if os.environ.get("GITHUB_ACTIONS"):
            print(f"::warning::Stempel: tools.json zegt bijgewerkt {veld}, laatste wijziging {laatste}")
        print()

    if fouten:
        print(f"DRIFT ({len(fouten)}):")
        for f in fouten:
            print(f"  - {f}")
        print()
        print("Herstel de afwijking of werk tools.json bij. tools.json is leidend.")
        return 1

    print("Geen drift: portaal, beheer en worker komen overeen met tools.json.")
    return 0


def render_tools_md(bron: dict) -> str:
    """Render uitsluitend registergegevens; geen andere repositories of netwerk nodig."""
    ICOON = {"live": "🟢", "beta": "🟡", "verborgen": "⚪", "concept": "🔵"}
    regels = [
        "# Tools — bouwman.tools",
        "",
        "> **Gegenereerd uit `tools.json`. Bewerk dit bestand niet met de hand.**",
        "> Werk `tools.json` bij en draai `python tools/check_tools.py --schrijf-tools-md`.",
        "",
        f"Bijgewerkt: {bron.get('bijgewerkt', '?')}",
        "",
    ]
    if any(tool.get("grondslagen") for tool in bron["tools"]):
        regels += [
            "Wettelijke verwijzingen zijn vastgelegde identificaties bij de vermelde versies.",
            "Dit is geen volledige bronnenlijst, actuele broncontrole of inhoudelijke accordering.",
            "Ontbrekende verwijzingen zeggen niets over de wettelijke basis van een tool.",
            "",
        ]

    per_categorie: dict[str, list] = {}
    for tool in bron["tools"]:
        per_categorie.setdefault(tool["categorie"], []).append(tool)

    for categorie in sorted(per_categorie):
        in_categorie = sorted(per_categorie[categorie], key=lambda t: t["naam"])
        regels += [
            f"## {categorie}",
            "",
            "| | Tool | Locatie | Bronrepo | Afgeschermd | Jaarwaarden gecontroleerd "
            "| Eigenaar | Ritme | Geaccordeerd |",
            "|---|---|---|---|---|---|---|---|---|",
        ]
        for tool in in_categorie:
            concept = tool["status"] == "concept"
            doel = "nog niet gepubliceerd" if concept else (
                tool.get("url") or ("/" + tool["bestand"]))
            if concept or tool.get("extern"):
                schild = "n.v.t."
            else:
                schild = "ja" if tool.get("access_app_id") else "**nee**"
            status = ICOON.get(tool["status"], "") + " " + tool["status"]
            # Bewust alleen de kale datum (geen actualiteitsoordeel): dat oordeel
            # hangt van de dag af en zou dit gegenereerde bestand laten verouderen
            # zonder dat tools.json wijzigt. Het oordeel geeft check_tools.py zelf.
            if not tool.get("jaarwaarden"):
                jw = "n.v.t."
            else:
                jw = tool.get("jaarwaarden_gecontroleerd") or "**ontbreekt**"
            eigenaar = tool.get("eigenaar") or ""
            eigenaar = "**tbd**" if eigenaar.lower() in ("", "tbd") else eigenaar
            ritme = tool.get("beoordelingsritme", "jaarlijks")
            oordeel_nodig = tool.get("fiscaal_oordeel", True)
            akkoord = tool.get("laatst_beoordeeld") or (
                "n.v.t." if not oordeel_nodig or ritme == "geen" else "**nooit**"
            )
            regels.append(
                f"| {status} | {tool['naam']} | {'' if concept else '`'}{doel}"
                f"{'' if concept else '`'} | {tool['repo']} | {schild} "
                f"| {jw} | {eigenaar} | {ritme} | {akkoord} |"
            )
        # De beschrijving staat als aparte regel onder de tabel en niet als tiende
        # kolom: die tabel is al breed genoeg om onleesbaar te worden.
        beschrijvingen = [
            f"- **{tool['naam']}**: {tool['beschrijving']}"
            for tool in in_categorie
            if tool.get("beschrijving")
        ]
        if beschrijvingen:
            regels += [""] + beschrijvingen
        regels.append("")
        for tool in in_categorie:
            regels += grondslag_regels(tool)

    onbeschermd = [
        t for t in bron["tools"]
        if not t.get("access_app_id") and not t.get("extern") and t["status"] != "concept"
    ]
    if onbeschermd:
        regels += [
            "## Let op: niet afgeschermd",
            "",
            "Deze tools hebben geen Cloudflare Access-app. Ze zijn voor iedereen met de URL",
            "bereikbaar, en rechten toekennen in `beheer.html` heeft er geen effect op.",
            "",
        ]
        regels += [f"- {t['naam']} (`{t['bestand']}`)" for t in onbeschermd] + [""]

    workers: dict[str, list[str]] = {}
    for pw in bron.get("portaalworkers", []):
        workers.setdefault(pw["naam"], []).append("het portaal zelf")
    for tool in bron["tools"]:
        for naam_worker in tool.get("workers", []):
            workers.setdefault(naam_worker, []).append(tool["naam"])
    if workers:
        regels += [
            "## Workers",
            "",
            "Welke Cloudflare Worker onder welke tool hangt. Of een Worker werkelijk op het",
            "account staat is hier niet te zien: dat controleert de dagelijkse controle in",
            "`access-beheer-worker.js` en dat meldt `beheer.html`. Een 404 op een",
            "workers.dev-adres bewijst niets, want een Worker op een eigen route antwoordt",
            "daar ook met 404.",
            "",
            "| Worker | Nodig voor |",
            "|---|---|",
        ]
        regels += [
            f"| `{naam_worker}` | {', '.join(sorted(waarvoor))} |"
            for naam_worker, waarvoor in sorted(workers.items())
        ] + [""]

    if bron.get("vervallen"):
        regels += ["## Vervallen", "", "| Bestand | Reden |", "|---|---|"]
        regels += [f"| `{v['bestand']}` | {v['reden']} |" for v in bron["vervallen"]] + [""]

    return "\n".join(regels)


def schrijf_tools_md() -> None:
    """Valideer vóór schrijven; de uitvoer blijft lokaal en in CI reproduceerbaar."""
    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        bron = json.load(fh)
    fouten = valideer_schema(bron)
    if fouten:
        raise ValueError("\n".join(fouten))
    tekst = render_tools_md(bron)
    with open(os.path.join(WORTEL, "TOOLS.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(tekst)
    print("TOOLS.md gegenereerd uit tools.json")


if __name__ == "__main__":
    if "--schrijf-tools-md" in sys.argv:
        schrijf_tools_md()
        sys.exit(0)
    sys.exit(main())
