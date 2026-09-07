"""Publieke registergrondslagen, uitsluitend met synthetische testgegevens.

    python -B -m unittest discover -s tools -p "test_*.py"
"""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import jsonschema

import check_tools


def register(**extra):
    tool = {
        "id": "synthetische-tool", "naam": "Synthetische tool",
        "beschrijving": "Verzonnen registerregel voor tests.", "categorie": "Test",
        "status": "concept", "repo": "voorbeeld/synthetische-tool", "bestand": "voorbeeld.html",
        "in_portal": False, "in_beheer": False, "eigenaar": "tbd",
        "beoordelingsritme": "geen", "laatst_beoordeeld": None,
        "jaarwaarden": [], "jaarwaarden_gecontroleerd": None,
        "uitgangen": {"dossierstuk": False, "excel": False, "dossierbestand": False},
    }
    return {"bijgewerkt": "2026-09-07", "categorievolgorde": ["Test"], "tools": [tool | extra]}


def grondslag(**extra):
    return {"regeling": "Synthetische regeling", "artikel": "Testartikel, testversie",
            "url": "https://wetten.overheid.nl/test"} | extra


class SchemaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schema = json.loads((Path(check_tools.WORTEL) / "tools.schema.json").read_text(encoding="utf-8"))
        jsonschema.Draft7Validator.check_schema(schema)
        cls.validator = jsonschema.Draft7Validator(schema)

    def geldig(self, **extra):
        return self.validator.is_valid(register(**extra))

    def test_bestaand_register_zonder_grondslagen_of_met_lege_lijst_blijft_geldig(self):
        self.assertTrue(self.geldig())
        self.assertTrue(self.geldig(grondslagen=[]))
        self.assertTrue(self.geldig(grondslagen=[grondslag()]))

    def test_grondslag_verplicht_identificeerbare_nietlege_velden(self):
        basis = grondslag()
        for veld in basis:
            ontbreekt = basis.copy()
            del ontbreekt[veld]
            self.assertFalse(self.geldig(grondslagen=[ontbreekt]))
            for value in (None, "", " \n\t", 123, [], {}):
                self.assertFalse(self.geldig(grondslagen=[basis | {veld: value}]))

    def test_extra_velden_en_dubbele_grondslagen_worden_geweigerd(self):
        self.assertFalse(self.geldig(grondslagen=[grondslag(onbekend=True)]))
        self.assertFalse(self.geldig(grondslagen=[grondslag(), grondslag()]))
        self.assertFalse(self.geldig(intern_detail="synthetisch"))
        self.assertFalse(self.validator.is_valid(register() | {"intern_detail": "synthetisch"}))

    def test_schema_en_renderer_staan_dezelfde_officiele_hosts_toe(self):
        for host in check_tools.OFFICIELE_BRONHOSTS:
            bron = grondslag(url=f"https://{host}/test")
            self.assertTrue(self.geldig(grondslagen=[bron]), host)
            self.assertIn(f"https://{host}/test", check_tools.grondslag_link(bron))

    def test_schijnbare_of_onveilige_bronurls_worden_geweigerd(self):
        for url in (
            "http://wetten.overheid.nl/test", "javascript:alert(1)",
            "https://wetten.overheid.nl.evil.invalid/test", "https://evil.invalid/wetten.overheid.nl",
            "https://wetten.overheid.nl@evil.invalid/test", "https://gebruiker@wetten.overheid.nl/test",
            "https://wetten.overheid.nl:443/test", "https://WETTEN.OVERHEID.NL/test",
            "https://wetten.overheid.nl\n", "https://wetten.overheid.nl/test path",
            "https://wetten.overheid.nl/<script>", "https://wetten.overheid.nl/test\x00",
            "https://wetten.overheid.nl/test\x7f", "https://wetten.overheid.nl/test\x1f",
        ):
            with self.subTest(url=url):
                bron = grondslag(url=url)
                self.assertFalse(self.geldig(grondslagen=[bron]))
                with self.assertRaises(ValueError):
                    check_tools.grondslag_link(bron)


class RenderTests(unittest.TestCase):
    def test_alleen_vastgelegde_verwijzingen_krijgen_een_sectie_met_beperking(self):
        zonder = check_tools.render_tools_md(register())
        self.assertNotIn("### Wettelijke verwijzingen:", zonder)
        self.assertNotIn("niet vastgelegd", zonder)
        tekst = check_tools.render_tools_md(register(grondslagen=[grondslag()]))
        self.assertIn("### Wettelijke verwijzingen: Synthetische tool", tekst)
        self.assertIn("geen volledige bronnenlijst, actuele broncontrole of inhoudelijke accordering", tekst)
        self.assertIn("[Synthetische regeling, Testartikel, testversie](https://wetten.overheid.nl/test)", tekst)

    def test_metadata_kunnen_geen_markdown_of_html_in_de_verwijzing_injecteren(self):
        tekst = check_tools.render_tools_md(register(grondslagen=[grondslag(
            regeling="Test [regel]\n<script>test</script>", artikel="1 | 2 [klik](javascript:alert(1))",
            url="https://wetten.overheid.nl/test(voorbeeld)?x=1&y=2",
        )]))
        self.assertNotIn("[klik](javascript:", tekst)
        self.assertNotIn("<script>", tekst)
        self.assertIn("\\[regel\\]", tekst)
        self.assertIn("1 \\| 2", tekst)
        self.assertIn("test%28voorbeeld%29?x=1&y=2", tekst)

    def test_tekstbeginsels_en_regeleinden_blijven_na_een_vaste_prefix(self):
        for raw, escaped in (("# kop", "# kop"), ("> tekst", "&gt; tekst"), ("- punt", "- punt")):
            tekst = check_tools.grondslag_link(grondslag(regeling=raw + "\nvervolg"))
            self.assertTrue(tekst.startswith("[" + escaped + " vervolg, "))
            self.assertNotIn("\n", tekst)
        regels = check_tools.grondslag_regels({"naam": "Test\n## extra", "grondslagen": [grondslag()]})
        self.assertEqual(regels[0], "### Wettelijke verwijzingen: Test ## extra")

    def test_ongeldige_metadata_overschrijven_bestaand_overzicht_niet(self):
        with tempfile.TemporaryDirectory() as mapnaam:
            wortel = Path(mapnaam)
            (wortel / "tools.json").write_text(json.dumps(register()), encoding="utf-8")
            (wortel / "TOOLS.md").write_text("Bestaand synthetisch overzicht", encoding="utf-8")
            with patch.object(check_tools, "WORTEL", mapnaam), patch.object(
                    check_tools, "valideer_schema", return_value=["Synthetische schemafout"]):
                with self.assertRaises(ValueError):
                    check_tools.schrijf_tools_md()
            self.assertEqual((wortel / "TOOLS.md").read_text(encoding="utf-8"), "Bestaand synthetisch overzicht")

    def test_renderer_weigert_onveilige_links_ook_als_schema_niet_werd_getoetst(self):
        with tempfile.TemporaryDirectory() as mapnaam:
            wortel = Path(mapnaam)
            bron = register(grondslagen=[grondslag(url="https://attacker.invalid/test")])
            (wortel / "tools.json").write_text(json.dumps(bron), encoding="utf-8")
            (wortel / "TOOLS.md").write_text("Bestaand synthetisch overzicht", encoding="utf-8")
            with patch.object(check_tools, "WORTEL", mapnaam), patch.object(
                    check_tools, "valideer_schema", return_value=[]):
                with self.assertRaises(ValueError):
                    check_tools.schrijf_tools_md()
            self.assertEqual((wortel / "TOOLS.md").read_text(encoding="utf-8"), "Bestaand synthetisch overzicht")

    def test_generatie_is_byte_reproduceerbaar_met_alleen_het_register(self):
        bron = register(grondslagen=[grondslag()])
        verwacht = check_tools.render_tools_md(bron).encode("utf-8")
        with tempfile.TemporaryDirectory() as mapnaam:
            wortel = Path(mapnaam)
            (wortel / "tools.json").write_text(json.dumps(bron), encoding="utf-8")
            with patch.object(check_tools, "WORTEL", mapnaam), patch.object(
                    check_tools, "valideer_schema", return_value=[]):
                check_tools.schrijf_tools_md()
                self.assertEqual((wortel / "TOOLS.md").read_bytes(), verwacht)
                check_tools.schrijf_tools_md()
                self.assertEqual((wortel / "TOOLS.md").read_bytes(), verwacht)
            self.assertEqual(sorted(p.name for p in wortel.iterdir()), ["TOOLS.md", "tools.json"])


if __name__ == "__main__":
    unittest.main()
