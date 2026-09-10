"""Onaangemelde buitencontrole; geen redirects, cookies, tokens of responsebody's."""

import sys
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


ACCESS_HOST = "bouwman-tools.cloudflareaccess.com"
ACCESS_LOGIN_PATH = "/cdn-cgi/access/login/bouwman.tools"
INGANGEN = (
    ("workers.dev", "https://access-beheer.s-bouwman.workers.dev/admin", False),
    ("bouwman.tools", "https://bouwman.tools/beheer.html/api/admin", True),
)
ROUTES = (("status", "GET"), ("upsert", "POST"), ("delete", "POST"))
ORIGINS = (("zonder Origin", None), ("met Origin", "https://bouwman.tools"))

# De twaalf bestaande adminverzoeken blijven behouden. Per extra portaalproef:
# label, exacte URL, methode, Access verwacht, permanent gesloten legacyroute.
PORTAAL_PROEVEN = (
    ("workers.dev POST /permissions", "https://access-beheer.s-bouwman.workers.dev/permissions", "POST", False, True),
    ("workers.dev OPTIONS /permissions", "https://access-beheer.s-bouwman.workers.dev/permissions", "OPTIONS", False, True),
    ("bouwman.tools GET /portal.html/api/permissions", "https://bouwman.tools/portal.html/api/permissions", "GET", True, False),
    # kvk-proxy, sinds 10-09-2026 achter Access op een kindpad van de pagina. De tweede
    # regel is de eigenlijke wachter: die faalt zodra workers.dev weer opengaat, en dat is
    # die avond twee keer gebeurd door een uitrol van de verkeerde branch. De eerste toetst
    # dat Access het kindpad onderschept; let op wat zij niet kan zien, want een
    # inlogpagina komt er ook wanneer de worker helemaal niet wordt bereikt. Voor "de keten
    # werkt" is een ingelogde proef nodig, en die staat in de vrijgavenotitie.
    ("bouwman.tools POST /kvk-zoeker.html/api/zoeken", "https://bouwman.tools/kvk-zoeker.html/api/zoeken", "POST", True, False),
    ("workers.dev POST kvk-proxy", "https://kvk-proxy.s-bouwman.workers.dev", "POST", False, False),
)


class GeenRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def is_access_login(location):
    """Alleen de vaste HTTPS Access-login; querywaarden worden nooit gelogd."""
    if not isinstance(location, str) or any(ord(c) <= 32 or ord(c) == 127 for c in location):
        return False
    try:
        url = urlsplit(location)
        return (url.scheme == "https" and url.netloc == ACCESS_HOST
                and url.path == ACCESS_LOGIN_PATH and not url.fragment)
    except ValueError:
        return False


def toegestane_weigering(status, location, nieuwe_ingang, gesloten_legacy=False):
    if status in (401, 403):
        return True
    if not nieuwe_ingang:
        return status == 404 or (gesloten_legacy and status == 410)
    return status == 302 and is_access_login(location)


def meet(opener, url, method, origin):
    headers = {"User-Agent": "bouwman-tools-admin-buitencontrole/1", "Cache-Control": "no-store"}
    if origin is not None:
        headers["Origin"] = origin
    if method == "POST":
        headers["Content-Type"] = "application/json"
    request = Request(url, data=b"{}" if method == "POST" else None, headers=headers, method=method)
    try:
        response = opener.open(request, timeout=15)
    except HTTPError as error:
        # HTTPError is ook een response. Alleen status/Location bekijken en sluiten.
        response = error
    try:
        return response.code, response.headers.get("Location")
    finally:
        response.close()


def controleer(opener=None, output=None):
    opener = opener if opener is not None else build_opener(GeenRedirect())
    output = output if output is not None else sys.stdout
    fouten = 0
    proeven = []
    for naam, basis, nieuw in INGANGEN:
        for route, method in ROUTES:
            proeven.append((f"{naam} {method} /admin/{route}", f"{basis}/{route}", method, nieuw, False))
    aantal_admin = len(proeven) * len(ORIGINS)
    proeven.extend(PORTAAL_PROEVEN)
    for naam, url, method, nieuw, legacy in proeven:
        for variant, origin in ORIGINS:
            label = f"{naam} ({variant})"
            try:
                status, location = meet(opener, url, method, origin)
                goed = toegestane_weigering(status, location, nieuw, legacy)
                resultaat = f"HTTP {status}"
            except (URLError, OSError, ValueError, HTTPException):
                goed = False
                resultaat = "netwerk-, TLS- of protocolfout"
            # Geen exceptiontekst, responsebody of Location/query in uitvoer.
            print(f"{'OK' if goed else 'FOUT'} {label}: {resultaat}", file=output)
            fouten += not goed
    totaal = len(proeven) * len(ORIGINS)
    print(f"{totaal} buitenproeven ({aantal_admin} admin, {totaal - aantal_admin} portaal), {fouten} afwijkingen.", file=output)
    return 1 if fouten else 0


if __name__ == "__main__":
    sys.exit(controleer())
