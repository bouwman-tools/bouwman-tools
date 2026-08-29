#!/usr/bin/env python3
"""Maakt de ontbrekende Cloudflare Access-applicaties aan voor tools die nu
zonder login bereikbaar zijn.

Dit script draai JIJ, met je eigen token. Het token wordt uit de omgevingsvariabele
CF_API_TOKEN gelezen en nergens weggeschreven of getoond.

    # PowerShell
    $env:CF_API_TOKEN = "<jouw token>"
    python tools/maak_access_apps.py              # proefdraai, wijzigt niets
    python tools/maak_access_apps.py --uitvoeren  # maakt de apps daadwerkelijk aan

Het token heeft de permissie "Access: Apps and Policies — Edit" nodig op het
account. Maak er een aan via het Cloudflare-dashboard onder My Profile > API Tokens.

Na afloop print het script per tool het nieuwe app-id. Werk daarmee bij:
  1. access_app_id in tools.json
  2. APP_IDS in access-beheer-worker.js
  3. python tools/check_tools.py --schrijf-tools-md
en deploy de worker opnieuw.

Het script is idempotent: bestaat er al een app voor hetzelfde domeinpad, dan slaat
het die over en toont het het bestaande id.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.cloudflare.com/client/v4"
DOMEIN = "bouwman.tools"

# De eigenaar houdt altijd toegang, zodat een nieuwe app niemand buitensluit.
EIGENAAR = "s.bouwman@joinadministraties.nl"


def account_id() -> str:
    """Leest het account-id uit de worker; het staat daar al en is geen secret."""
    pad = os.path.join(WORTEL, "access-beheer-worker.js")
    with open(pad, encoding="utf-8") as fh:
        m = re.search(r"CF_ACCOUNT_ID\s*=\s*'([0-9a-f]{32})'", fh.read())
    if not m:
        sys.exit("Kon CF_ACCOUNT_ID niet vinden in access-beheer-worker.js.")
    return m.group(1)


def api(token: str, pad: str, methode: str = "GET", body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    verzoek = urllib.request.Request(
        f"{API}{pad}",
        data=data,
        method=methode,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
            return json.loads(antwoord.read())
    except urllib.error.HTTPError as fout:
        tekst = fout.read().decode(errors="ignore")
        # Nooit het token echoën; alleen de foutmelding van Cloudflare.
        sys.exit(f"Cloudflare gaf HTTP {fout.code} op {methode} {pad}:\n{tekst[:800]}")


def api_zacht(token: str, pad: str, methode: str = "GET", body: dict | None = None):
    """Als api(), maar stopt het programma niet bij een fout. Retourneert (ok, data)."""
    data = json.dumps(body).encode() if body is not None else None
    verzoek = urllib.request.Request(
        f"{API}{pad}",
        data=data,
        method=methode,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
            return True, json.loads(antwoord.read())
    except urllib.error.HTTPError as fout:
        return False, fout.read().decode(errors="ignore")[:400]
    except Exception as fout:  # netwerk, timeout
        return False, str(fout)[:400]


def policies_van(token: str, acc: str, app_id: str):
    ok, data = api_zacht(token, f"/accounts/{acc}/access/apps/{app_id}/policies")
    return (data.get("result") or []) if ok and isinstance(data, dict) else []


def zet_policy(token: str, acc: str, app_id: str, naam: str):
    """Zorgt dat de applicatie minstens een allow-policy heeft. Retourneert True/False."""
    if policies_van(token, acc, app_id):
        return True
    ok, _ = api_zacht(token, f"/accounts/{acc}/access/apps/{app_id}/policies", "POST", {
        "name": "Eigenaar",
        "decision": "allow",
        "include": [{"email": {"email": EIGENAAR}}],
    })
    if not ok:
        return False
    return bool(policies_van(token, acc, app_id))


def main() -> int:
    uitvoeren = "--uitvoeren" in sys.argv
    token = os.environ.get("CF_API_TOKEN", "").strip()
    if not token:
        sys.exit(
            "CF_API_TOKEN is niet gezet.\n"
            '  PowerShell:  $env:CF_API_TOKEN = "<jouw token>"'
        )

    acc = account_id()

    with open(os.path.join(WORTEL, "tools.json"), encoding="utf-8") as fh:
        bron = json.load(fh)

    ontbreekt = [
        t for t in bron["tools"]
        if not t.get("access_app_id") and not t.get("extern") and t.get("bestand")
    ]
    if not ontbreekt:
        print("Alle interne tools hebben al een Access-app.")
        return 0

    print(f"{len(ontbreekt)} tool(s) zonder Access-app:")
    for t in ontbreekt:
        print(f"  - {t['naam']:32} {DOMEIN}/{t['bestand']}")
    print()

    bestaand = {}
    for app in api(token, f"/accounts/{acc}/access/apps").get("result", []) or []:
        if app.get("domain"):
            bestaand[app["domain"].rstrip("/")] = app["id"]

    if not uitvoeren:
        print("PROEFDRAAI — er is niets gewijzigd.")
        for t in ontbreekt:
            dom = f"{DOMEIN}/{t['bestand']}"
            staat = f"bestaat al ({bestaand[dom]})" if dom in bestaand else "zou worden aangemaakt"
            print(f"  {t['naam']:32} {staat}")
        print("\nDraai opnieuw met --uitvoeren om ze aan te maken.")
        return 0

    resultaten = []
    mislukt = []
    for t in ontbreekt:
        dom = f"{DOMEIN}/{t['bestand']}"
        if dom in bestaand:
            app_id = bestaand[dom]
            if zet_policy(token, acc, app_id, t["naam"]):
                print(f"  bestond al, policy in orde: {t['naam']:28} {app_id}")
                resultaten.append((t["id"], t["bestand"], app_id))
            else:
                # Applicatie zonder werkende policy sluit IEDEREEN buiten. Liever
                # terug naar de uitgangssituatie dan een tool die niemand bereikt.
                ok, _ = api_zacht(token, f"/accounts/{acc}/access/apps/{app_id}", "DELETE")
                print(f"  PROBLEEM: {t['naam']} had geen policy en die lukt niet.")
                print(f"      applicatie {'verwijderd' if ok else 'NIET verwijderd - doe dit met de hand'}: {app_id}")
                mislukt.append(t["naam"])
            continue

        app = api(token, f"/accounts/{acc}/access/apps", "POST", {
            "name": t["naam"],
            "domain": dom,
            "type": "self_hosted",
            "session_duration": "720h",
            "app_launcher_visible": False,
        })["result"]

        if not zet_policy(token, acc, app["id"], t["naam"]):
            ok, _ = api_zacht(token, f"/accounts/{acc}/access/apps/{app['id']}", "DELETE")
            print(f"  PROBLEEM: policy aanmaken mislukte voor {t['naam']}.")
            print(f"      applicatie {'weer verwijderd' if ok else 'NIET verwijderd - doe dit met de hand'}: {app['id']}")
            print("      De tool blijft daarmee zoals hij was, in plaats van voor iedereen dicht.")
            mislukt.append(t["naam"])
            continue

        # Terugzien wat er werkelijk staat: een aangemaakte policy kan er anders
        # uitzien dan bedoeld, en dat merk je anders pas als iemand erbij kan.
        pols = api(token, f"/accounts/{acc}/access/apps/{app['id']}/policies").get("result") or []
        omschrijving = []
        for pol in pols:
            inc = pol.get("include") or []
            soorten = sorted({list(regel.keys())[0] for regel in inc if isinstance(regel, dict)})
            omschrijving.append("%s/%s: %d regel(s) [%s]" % (
                pol.get("name"), pol.get("decision"), len(inc), ",".join(soorten) or "LEEG"))
        print(f"  aangemaakt: {t['naam']:32} {app['id']}")
        print("      policy: %s" % ("; ".join(omschrijving) or "GEEN POLICY - iedereen wordt geweigerd"))
        resultaten.append((t["id"], t["bestand"], app["id"]))

    print()
    if mislukt:
        print("NIET AFGESCHERMD gebleven (%d): %s" % (len(mislukt), ", ".join(mislukt)))
        print("Die tools zijn nog steeds zonder login bereikbaar; er staat geen half")
        print("werkende applicatie voor. Draai het script gerust opnieuw.")
        print()
    if not resultaten:
        return 1
    print("Zet deze id's in tools.json (access_app_id) en in APP_IDS van de worker:")
    for tool_id, bestand, app_id in resultaten:
        print(f"  '{bestand}': '{app_id}',")
    print()
    print("Daarna: python tools/check_tools.py --schrijf-tools-md, en deploy de worker.")
    print("Rechten voor collega's regel je zoals altijd via beheer.html.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
