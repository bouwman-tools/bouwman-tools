#!/usr/bin/env python3
"""Controleert of portal.html, beheer.html en access-beheer-worker.js overeenkomen
met tools.json, de enige bron van waarheid voor de toolportefeuille.

Faalt met exitcode 1 zodra er drift is. Draait lokaal en in CI.

    python tools/check_tools.py
"""
from __future__ import annotations

import json
import os
import re
import sys

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Bestanden van het portaal zelf; die horen niet in tools.json.
INFRA = {"portal.html", "beheer.html", "index.html", "bouwman-tools-snippet.html"}


def lees(naam: str) -> str:
    with open(os.path.join(WORTEL, naam), encoding="utf-8", errors="ignore") as fh:
        return fh.read()


def sleutel(tool: dict) -> str:
    """De verwijzing waarmee een tool in portal/beheer voorkomt."""
    return tool.get("bestand") or tool.get("url") or ""


def main() -> int:
    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        bron = json.load(fh)

    tools = bron["tools"]
    vervallen = {v["bestand"] for v in bron.get("vervallen", [])}

    portal = lees("portal.html")
    beheer = lees("beheer.html")
    worker = lees("access-beheer-worker.js")

    portal_refs = set(re.findall(r"file:\s*'([^']+)'", portal)) | set(
        re.findall(r"url:\s*'([^']+)'", portal)
    )
    beheer_refs = set(re.findall(r"file:\s*'([^']+)'", beheer)) | set(
        re.findall(r"url:\s*'([^']+)'", beheer)
    )
    app_ids = dict(
        re.findall(r"'([A-Za-z0-9_.\-]+\.html)':\s*'([0-9a-f\-]{36})'", worker)
    )
    html_in_repo = {f for f in os.listdir(WORTEL) if f.endswith(".html")}

    fouten: list[str] = []
    waarschuwingen: list[str] = []

    ids = [t["id"] for t in tools]
    if len(ids) != len(set(ids)):
        fouten.append("tools.json bevat dubbele id's.")

    for tool in tools:
        ref = sleutel(tool)
        naam = tool["naam"]
        if not ref:
            fouten.append(f"{naam}: geen bestand en geen url.")
            continue

        # 1. Bestaat het bestand echt?
        if not tool.get("extern") and ref not in html_in_repo:
            fouten.append(f"{naam}: {ref} staat in tools.json maar bestaat niet in de repo.")

        # 2. Menuzichtbaarheid
        if tool.get("in_portal") and ref not in portal_refs:
            fouten.append(f"{naam}: in_portal is true maar {ref} staat niet in portal.html.")
        if not tool.get("in_portal") and ref in portal_refs:
            fouten.append(f"{naam}: in_portal is false maar {ref} staat wel in portal.html.")
        if tool.get("in_beheer") and ref not in beheer_refs:
            fouten.append(f"{naam}: in_beheer is true maar {ref} staat niet in beheer.html.")

        # 3. Afscherming
        app_id = tool.get("access_app_id")
        if app_id and app_ids.get(ref) != app_id:
            fouten.append(
                f"{naam}: access_app_id in tools.json komt niet overeen met APP_IDS in de worker."
            )
        if not app_id and not tool.get("extern"):
            waarschuwingen.append(
                f"{naam} ({ref}) heeft geen Access-app: het bestand is voor iedereen "
                "met de URL bereikbaar en rechten toekennen in beheer.html heeft geen effect."
            )

    # 4. Verwijzingen die nergens meer op slaan
    bekend = {sleutel(t) for t in tools}
    for ref in sorted(portal_refs - bekend):
        fouten.append(f"portal.html verwijst naar {ref}, dat niet in tools.json staat.")
    for ref in sorted(beheer_refs - bekend):
        fouten.append(f"beheer.html verwijst naar {ref}, dat niet in tools.json staat.")
    for ref in sorted(set(app_ids) - bekend - INFRA):
        fouten.append(
            f"APP_IDS bevat {ref}, dat niet in tools.json staat"
            + (" (staat wel onder 'vervallen')." if ref in vervallen else ".")
        )

    # 5. Gepubliceerd maar nergens vastgelegd
    gepubliceerd = html_in_repo - INFRA
    for ref in sorted(gepubliceerd - bekend):
        fouten.append(
            f"{ref} staat gepubliceerd in de repo maar niet in tools.json. "
            "Neem hem op, of haal de kopieerstap uit de sync-workflow van de bronrepo."
        )

    print(f"tools.json: {len(tools)} tools, bijgewerkt {bron.get('bijgewerkt', '?')}")
    print(f"portal {len(portal_refs)} · beheer {len(beheer_refs)} · APP_IDS {len(app_ids)} "
          f"· HTML in repo {len(gepubliceerd)}")
    print()

    if waarschuwingen:
        print(f"NIET AFGESCHERMD ({len(waarschuwingen)}):")
        for w in waarschuwingen:
            print(f"  - {w}")
        print()

    if fouten:
        print(f"DRIFT ({len(fouten)}):")
        for f in fouten:
            print(f"  - {f}")
        print()
        print("Herstel de afwijking of werk tools.json bij. tools.json is leidend.")
        return 1

    print("Geen drift: portal, beheer en worker komen overeen met tools.json.")
    return 0


def schrijf_tools_md() -> None:
    """Genereert TOOLS.md uit tools.json, zodat dat overzicht geen aparte bron is."""
    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        bron = json.load(fh)

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

    per_categorie: dict[str, list] = {}
    for tool in bron["tools"]:
        per_categorie.setdefault(tool["categorie"], []).append(tool)

    for categorie in sorted(per_categorie):
        regels += [f"## {categorie}", "", "| | Tool | Locatie | Bronrepo | Afgeschermd |", "|---|---|---|---|---|"]
        for tool in sorted(per_categorie[categorie], key=lambda t: t["naam"]):
            doel = tool.get("url") or ("/" + tool["bestand"])
            schild = "ja" if tool.get("access_app_id") else ("n.v.t." if tool.get("extern") else "**nee**")
            status = ICOON.get(tool["status"], "") + " " + tool["status"]
            regels.append(f"| {status} | {tool['naam']} | `{doel}` | {tool['repo']} | {schild} |")
        regels.append("")

    onbeschermd = [t for t in bron["tools"] if not t.get("access_app_id") and not t.get("extern")]
    if onbeschermd:
        regels += [
            "## Let op: niet afgeschermd",
            "",
            "Deze tools hebben geen Cloudflare Access-app. Ze zijn voor iedereen met de URL",
            "bereikbaar, en rechten toekennen in `beheer.html` heeft er geen effect op.",
            "",
        ]
        regels += [f"- {t['naam']} (`{t['bestand']}`)" for t in onbeschermd] + [""]

    if bron.get("vervallen"):
        regels += ["## Vervallen", "", "| Bestand | Reden |", "|---|---|"]
        regels += [f"| `{v['bestand']}` | {v['reden']} |" for v in bron["vervallen"]] + [""]

    with open(os.path.join(WORTEL, "TOOLS.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(regels))
    print("TOOLS.md gegenereerd uit tools.json")


if __name__ == "__main__":
    if "--schrijf-tools-md" in sys.argv:
        schrijf_tools_md()
        sys.exit(0)
    sys.exit(main())
