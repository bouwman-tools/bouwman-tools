#!/usr/bin/env python3
"""Inspecteer of rol terug wat er in Cloudflare Access staat voor bouwman.tools.

Draai dit met je eigen token; het wordt uit CF_API_TOKEN gelezen en nergens
weggeschreven of getoond.

    $env:CF_API_TOKEN = "<jouw token>"
    python tools/access_apps.py --lijst          # toon alle Access-apps
    python tools/access_apps.py --verwijder      # proefdraai van de terugrol
    python tools/access_apps.py --verwijder --uitvoeren
    python tools/access_apps.py --proef          # maak een proefapplicatie aan
    python tools/access_apps.py --proef-weg      # haal die proefapplicatie weer weg

--proef maakt EEN applicatie aan op bouwman.tools/proef-toegang.html. Dat pad
bestaat niet en er hangt geen tool aan; het dient uitsluitend om vast te stellen of
een extra Access-applicatie het ophalen van de identiteit verstoort. Haal hem na de
meting meteen weg met --proef-weg.

--verwijder haalt uitsluitend de zes applicaties weg die op 28-08-2026 zijn
aangemaakt voor tools die daarvoor onbeschermd waren. Dat herstelt de situatie van
die ochtend: die zes tools zijn dan weer zonder login bereikbaar. Andere apps blijft
het script af.
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

# De eigenaar houdt altijd toegang; zelfde policy als bij de zes van 28-08.
EIGENAAR = "s.bouwman@joinadministraties.nl"

# Aangemaakt op 28-08-2026; dit zijn de enige apps die --verwijder aanraakt.
NIEUW_28_08 = {
    "62f3756e-4c80-4a07-b273-dae319c0515e": "gebruikelijk-loon.html",
    "0af36641-be18-415d-a6d8-c938fa8575da": "dividend-uitkeringstoets.html",
    "f143b890-7309-4d08-9768-a3b23e38f2b6": "join-wkr-agent.html",
    "c0002856-50d1-49b9-b900-d5b782fdb766": "btw-teruggaaf-eu.html",
    "51e5b742-ea7a-49ef-830d-4cb99a1a6f3b": "bewaarplicht.html",
    "5efecdef-90f4-4067-8e6d-fe4091b17065": "kvk-zoeker.html",
}


def account_id() -> str:
    with open(os.path.join(WORTEL, "access-beheer-worker.js"), encoding="utf-8") as fh:
        m = re.search(r"CF_ACCOUNT_ID\s*=\s*'([0-9a-f]{32})'", fh.read())
    if not m:
        sys.exit("Kon CF_ACCOUNT_ID niet vinden in access-beheer-worker.js.")
    return m.group(1)


def api(token: str, pad: str, methode: str = "GET", body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{API}{pad}",
        data=data,
        method=methode,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; bouwman-tools-onderhoud)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as fout:
        sys.exit(f"Cloudflare gaf HTTP {fout.code} op {methode} {pad}:\n{fout.read().decode(errors='ignore')[:600]}")


def main() -> int:
    token = os.environ.get("CF_API_TOKEN", "").strip()
    if not token:
        sys.exit('CF_API_TOKEN is niet gezet.\n  PowerShell:  $env:CF_API_TOKEN = "<jouw token>"')
    acc = account_id()
    apps = api(token, f"/accounts/{acc}/access/apps").get("result") or []

    if "--lijst" in sys.argv:
        print(f"{len(apps)} Access-applicatie(s) op dit account:\n")
        print("%-40s %-30s %-16s %s" % ("domein(en) / pad", "naam", "type", "aangemaakt"))
        print("-" * 112)
        for a in sorted(apps, key=lambda x: str(x.get("domain") or "zzz")):
            doms = a.get("self_hosted_domains") or ([a["domain"]] if a.get("domain") else [])
            dom = " , ".join(doms) if doms else "(GEEN DOMEIN)"
            merk = "  <-- 28-08 door Claude" if a.get("id") in NIEUW_28_08 else ""
            print("%-40s %-30s %-16s %s%s" % (dom[:40], str(a.get("name"))[:30], str(a.get("type"))[:16], str(a.get("created_at"))[:10], merk))
        print()
        heel_domein = [a for a in apps if str(a.get("domain") or "").rstrip("/") == "bouwman.tools"]
        print("Apps die het HELE domein bouwman.tools dekken: %d" % len(heel_domein))
        print("(Zonder zo'n app valt /cdn-cgi/access/get-identity buiten elke applicatie,")
        print(" en kan portal.html het e-mailadres van de bezoeker niet ophalen.)")
        return 0

    PROEF_DOMEIN = "bouwman.tools/proef-toegang.html"

    if "--proef" in sys.argv:
        bestaand = [a for a in apps if str(a.get("domain") or "").rstrip("/") == PROEF_DOMEIN]
        if bestaand:
            print("De proefapplicatie bestaat al: %s" % bestaand[0]["id"])
            return 0
        # Exact dezelfde velden als bij de zes van 28-08, anders is het geen
        # geldige reproductie.
        app = api(token, f"/accounts/{acc}/access/apps", "POST", {
            "name": "PROEF - mag weg",
            "domain": PROEF_DOMEIN,
            "type": "self_hosted",
            "session_duration": "720h",
            "app_launcher_visible": False,
        })["result"]
        api(token, f"/accounts/{acc}/access/apps/{app['id']}/policies", "POST", {
            "name": "Eigenaar",
            "decision": "allow",
            "include": [{"email": {"email": EIGENAAR}}],
        })
        print("Proefapplicatie aangemaakt op %s" % PROEF_DOMEIN)
        print("  id: %s" % app["id"])
        print()
        print("Meet nu in je browser, in deze volgorde:")
        print("  1. https://bouwman.tools/cdn-cgi/access/get-identity")
        print("  2. https://bouwman.tools/portal.html   (zie je nog tegels?)")
        print()
        print("Haal hem daarna weg met:  python tools/access_apps.py --proef-weg")
        return 0

    if "--proef-weg" in sys.argv:
        bestaand = [a for a in apps if str(a.get("domain") or "").rstrip("/") == PROEF_DOMEIN]
        if not bestaand:
            print("Geen proefapplicatie gevonden; er is niets te verwijderen.")
            return 0
        for a in bestaand:
            api(token, f"/accounts/{acc}/access/apps/{a['id']}", "DELETE")
            print("Proefapplicatie verwijderd: %s" % a["id"])
        return 0

    if "--verwijder" in sys.argv:
        aanwezig = [a for a in apps if a.get("id") in NIEUW_28_08]
        print("%d van de 6 op 28-08 aangemaakte apps bestaan nog:" % len(aanwezig))
        for a in aanwezig:
            print("  %-38s %s" % (str(a.get("domain"))[:38], a.get("id")))
        if not aanwezig:
            return 0
        if "--uitvoeren" not in sys.argv:
            print("\nPROEFDRAAI - er is niets verwijderd. Draai met --uitvoeren.")
            return 0
        print()
        for a in aanwezig:
            api(token, f"/accounts/{acc}/access/apps/{a['id']}", "DELETE")
            print("  verwijderd: %s" % a.get("domain"))
        print("\nDeze tools zijn nu weer zonder login bereikbaar, zoals vanochtend.")
        print("Vergeet niet de app-id's uit tools.json en APP_IDS te halen en de worker opnieuw te deployen.")
        return 0

    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main())
