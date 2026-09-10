import importlib.util
import io
from http.client import BadStatusLine
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

spec = importlib.util.spec_from_file_location("admin_routes", Path(__file__).resolve().parents[1] / "tools/check_admin_routes.py")
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)
LOGIN = "https://bouwman-tools.cloudflareaccess.com/cdn-cgi/access/login/bouwman.tools"
LEGACY = "https://access-beheer.s-bouwman.workers.dev/permissions"
PORTAAL = "https://bouwman.tools/portal.html/api/permissions"
KVK_PAD = "https://bouwman.tools/kvk-zoeker.html/api/zoeken"
KVK_LEGACY = "https://kvk-proxy.s-bouwman.workers.dev"


class Response:
    def __init__(self, code, location=None):
        self.code = code
        self.headers = {"Location": location}
        self.closed = False

    def read(self, *args):
        raise AssertionError("Responsebody mag nooit gelezen worden")

    def close(self):
        self.closed = True


class Opener:
    def __init__(self, result):
        self.result = result
        self.requests = []
        self.responses = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        result = self.result(request)
        self.responses.append(result)
        if isinstance(result, Exception):
            raise result
        return result


def goede_weigering(request):
    if request.full_url == LEGACY:
        return Response(410)
    # Zonder afsluitende schuine streep: het kvk-adres is de worker zelf, dus
    # `https://kvk-proxy.s-bouwman.workers.dev` zonder pad erachter.
    if ".workers.dev" in request.full_url:
        return Response(404)
    return Response(302, LOGIN + "?token=synthetic-private-query")


class AdminRoutesTest(unittest.TestCase):
    def test_twaalf_admin_en_tien_portaalproeven_zonder_auth_of_body_lezen(self):
        opener = Opener(goede_weigering)
        output = io.StringIO()
        self.assertEqual(check.controleer(opener, output), 0)
        self.assertEqual(len(opener.requests), 22)
        self.assertIn("22 buitenproeven (12 admin, 10 portaal), 0 afwijkingen.", output.getvalue())
        self.assertTrue(all(r.closed for r in opener.responses))
        self.assertNotIn("synthetic-private-query", output.getvalue())
        self.assertNotIn("?", output.getvalue())
        for request, timeout in opener.requests:
            self.assertEqual(timeout, 15)
            self.assertNotIn("users", request.full_url)
            self.assertIsNone(request.get_header("Authorization"))
            self.assertIsNone(request.get_header("Cookie"))
            self.assertIsNone(request.get_header("Cf-access-jwt-assertion"))
            if request.method == "POST":
                self.assertEqual(request.data, b"{}")
                self.assertEqual(request.get_header("Content-type"), "application/json")
            else:
                self.assertIn(request.method, ("GET", "OPTIONS"))
                if request.method == "GET":
                    self.assertTrue(request.full_url.endswith("/status") or request.full_url == PORTAAL)
                else:
                    self.assertEqual(request.full_url, LEGACY)
                self.assertIsNone(request.data)
        self.assertEqual(sum(r.get_header("Origin") is None for r, _ in opener.requests), 11)
        self.assertEqual(sum(r.get_header("Origin") == "https://bouwman.tools" for r, _ in opener.requests), 11)
        # Expliciete regressie: alle oorspronkelijke twaalf verzoeken blijven bestaan.
        admin = [(r.full_url, r.method, r.get_header("Origin")) for r, _ in opener.requests if "/admin/" in r.full_url]
        self.assertCountEqual(admin, [
            (basis + "/" + route, method, origin)
            for basis in ("https://access-beheer.s-bouwman.workers.dev/admin", "https://bouwman.tools/beheer.html/api/admin")
            for route, method in (("status", "GET"), ("upsert", "POST"), ("delete", "POST"))
            for origin in (None, "https://bouwman.tools")
        ])
        portaal = [(r.full_url, r.method, r.get_header("Origin")) for r, _ in opener.requests if "/admin/" not in r.full_url]
        self.assertCountEqual(portaal, [
            (url, method, origin)
            for url, method in ((LEGACY, "POST"), (LEGACY, "OPTIONS"), (PORTAAL, "GET"),
                                (KVK_PAD, "POST"), (KVK_LEGACY, "POST"))
            for origin in (None, "https://bouwman.tools")
        ])

    def test_ieder_portaalverzoek_met_succes_of_serverfout_maakt_controle_rood(self):
        # KVK_LEGACY hoort hier ook in: een antwoord in plaats van een 404 betekent dat
        # workers.dev voor kvk-proxy weer open staat, en dat is de wachter waar het om gaat.
        for url, method in ((LEGACY, "POST"), (LEGACY, "OPTIONS"), (PORTAAL, "GET"),
                            (KVK_PAD, "POST"), (KVK_LEGACY, "POST")):
            for status in (200, 204, 400, 500, 502, 503):
                with self.subTest(url=url, method=method, status=status):
                    opener = Opener(lambda r: Response(status) if r.full_url == url and r.method == method else goede_weigering(r))
                    output = io.StringIO()
                    self.assertEqual(check.controleer(opener, output), 1)
                    self.assertEqual(len(opener.requests), 22)
                    self.assertIn("2 afwijkingen.", output.getvalue())
                    self.assertTrue(all(r.closed for r in opener.responses))

    def test_410_alleen_voor_gesloten_legacy_nieuwe_portaalroute_moet_auth_weigeren(self):
        self.assertTrue(check.toegestane_weigering(410, None, False, True))
        self.assertFalse(check.toegestane_weigering(410, None, False))
        self.assertFalse(check.toegestane_weigering(410, None, True))
        for status in (404, 410):
            output = io.StringIO()
            opener = Opener(lambda r: Response(status) if r.full_url == PORTAAL else goede_weigering(r))
            self.assertEqual(check.controleer(opener, output), 1)
            self.assertIn("2 afwijkingen.", output.getvalue())

    def test_portaalredirect_moet_exacte_accesslogin_zijn_en_legacy_mag_niet_redirecten(self):
        for url, method, location in (
                (PORTAAL, "GET", "https://attacker.invalid/login?private=synthetic-private-query"),
                (PORTAAL, "GET", LOGIN + "/extra"),
                (PORTAAL, "GET", None),
                (LEGACY, "POST", LOGIN),
                (LEGACY, "OPTIONS", LOGIN)):
            with self.subTest(url=url, method=method, location=location):
                output = io.StringIO()
                opener = Opener(lambda r: Response(302, location) if r.full_url == url and r.method == method else goede_weigering(r))
                self.assertEqual(check.controleer(opener, output), 1)
                self.assertIn("2 afwijkingen.", output.getvalue())
                self.assertNotIn("synthetic-private-query", output.getvalue())
                self.assertNotIn("attacker.invalid", output.getvalue())

    def test_400_is_rood_evenals_succes_serverfout_en_nieuwe_404(self):
        for status in (200, 204, 400, 404, 500, 502, 503):
            with self.subTest(status=status):
                output = io.StringIO()
                self.assertEqual(check.controleer(Opener(lambda r: Response(status)), output), 1)
                self.assertIn("FOUT", output.getvalue())

    def test_auth_weigeringen_voor_beide_ingangen(self):
        for status in (401, 403):
            self.assertEqual(check.controleer(Opener(lambda r: Response(status)), io.StringIO()), 0)
        self.assertTrue(check.toegestane_weigering(404, None, False))
        self.assertFalse(check.toegestane_weigering(302, LOGIN, False))

    def test_redirect_exacte_host_scheme_en_loginpad(self):
        self.assertTrue(check.is_access_login(LOGIN + "?redirect_url=%2Fbeheer.html"))
        for location in (None, "", "/login", LOGIN.replace("https:", "http:"),
                         LOGIN.replace(".com/", ".com.attacker.invalid/"),
                         LOGIN.replace("https://", "https://user@"),
                         LOGIN.replace(".com/", ".com:443/"),
                         LOGIN + "/extra", LOGIN + "#fragment", " " + LOGIN,
                         LOGIN.replace("/cdn-cgi/access/login/", "/other/"),
                         LOGIN.replace("https://", "https://attacker.invalid/?next=https://"),
                         LOGIN.replace("bouwman.tools", "other.invalid"),
                         LOGIN.replace(".com/", ".com\n/")):
            with self.subTest(location=location):
                self.assertFalse(check.toegestane_weigering(302, location, True))
        for status in (301, 303, 307, 308):
            self.assertFalse(check.toegestane_weigering(status, LOGIN, True))

    def test_dns_netwerk_tls_fouten_rood_zonder_details(self):
        for error in (URLError("synthetic-private-query"), OSError("synthetic-private-query"), ValueError("synthetic-private-query"), BadStatusLine("synthetic-private-query")):
            output = io.StringIO()
            self.assertEqual(check.controleer(Opener(lambda r: error), output), 1)
            self.assertNotIn("synthetic-private-query", output.getvalue())
            self.assertIn("22 afwijkingen", output.getvalue())

    def test_http_error_wordt_gesloten_zonder_body(self):
        body = Response(0)
        error = HTTPError("https://synthetic.invalid", 403, "niet loggen", {}, body)
        opener = Opener(lambda r: error)
        self.assertEqual(check.meet(opener, "https://synthetic.invalid", "POST", None), (403, None))
        self.assertTrue(body.closed)

    def test_redirect_handler_volgt_niets(self):
        handler = check.GeenRedirect()
        for code in (301, 302, 303, 307, 308):
            self.assertIsNone(handler.redirect_request(None, None, code, None, None, LOGIN))
        opener = Opener(lambda r: Response(403))
        with patch.object(check, "build_opener", return_value=opener) as build:
            self.assertEqual(check.controleer(output=io.StringIO()), 0)
            self.assertIsInstance(build.call_args.args[0], check.GeenRedirect)


if __name__ == "__main__":
    unittest.main()
