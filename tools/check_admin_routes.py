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

# Bewuste uitzondering, geen live proef met echte e-mailadressen. Dit is geen
# generieke skipregel: de twaalf adminproeven hieronder blijven altijd verplicht.
PUBLIEKE_ROUTES = {
    "POST https://access-beheer.s-bouwman.workers.dev/permissions":
        "Bestaande publieke rechtenfunctie voor portal.html; buiten deze admincontrole.",
}


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


def toegestane_weigering(status, location, nieuwe_ingang):
    if status in (401, 403):
        return True
    if not nieuwe_ingang:
        return status == 404
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
    for naam, basis, nieuw in INGANGEN:
        for route, method in ROUTES:
            for variant, origin in ORIGINS:
                label = f"{naam} {method} /admin/{route} ({variant})"
                try:
                    status, location = meet(opener, f"{basis}/{route}", method, origin)
                    goed = toegestane_weigering(status, location, nieuw)
                    resultaat = f"HTTP {status}"
                except (URLError, OSError, ValueError, HTTPException):
                    goed = False
                    resultaat = "netwerk-, TLS- of protocolfout"
                # Geen exceptiontekst, responsebody of Location/query in uitvoer.
                print(f"{'OK' if goed else 'FOUT'} {label}: {resultaat}", file=output)
                fouten += not goed
    print(f"12 adminproeven, {fouten} afwijkingen.", file=output)
    return 1 if fouten else 0


if __name__ == "__main__":
    sys.exit(controleer())
