"""De inhoudelijke status mag een werkende publicatie niet blokkeren."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import check_tools
from test_register_grondslagen import register


class PublicatiestatusTests(unittest.TestCase):
    def controle(self, aanwezig=True, html='', **velden):
        bron = register(icon='🔧', in_portal=True, in_beheer=True, **velden)
        schema = Path(check_tools.WORTEL, 'tools.schema.json').read_text(encoding='utf-8')
        with tempfile.TemporaryDirectory() as mapnaam:
            root = Path(mapnaam)
            (root / 'tools.json').write_text(json.dumps(bron), encoding='utf-8')
            (root / 'tools.schema.json').write_text(schema, encoding='utf-8')
            for pagina in ('portal.html', 'beheer.html'):
                (root / pagina).write_text('categorievolgorde', encoding='utf-8')
            (root / 'access-beheer-worker.js').write_text('', encoding='utf-8')
            if aanwezig:
                (root / 'voorbeeld.html').write_text(html, encoding='utf-8')
            output = io.StringIO()
            with patch.object(check_tools, 'WORTEL', mapnaam), patch.object(
                check_tools, 'leest_register', return_value=[]
            ), patch.object(check_tools, 'kijkt_naar_workers', return_value=[]), patch.object(
                check_tools, 'stempel_status', return_value=None
            ), contextlib.redirect_stdout(output):
                code = check_tools.main()
            return code, output.getvalue()

    def test_concept_beta_en_live_mogen_zichtbaar_en_gepubliceerd_zijn(self):
        for status in ('concept', 'beta', 'live'):
            with self.subTest(status=status):
                code, tekst = self.controle(status=status)
                self.assertEqual(code, 0, tekst)

    def test_zichtbaar_concept_zonder_bestand_blijft_een_fout(self):
        code, tekst = self.controle(aanwezig=False)
        self.assertEqual(code, 1)
        self.assertIn('bestaat niet in de repo', tekst)

    def test_concept_verbergt_ontbrekende_afscherming_niet(self):
        code, tekst = self.controle()
        self.assertEqual(code, 0)
        self.assertIn('heeft geen Access-app', tekst)

    def test_concept_verbergt_ontbrekende_workerregistratie_niet(self):
        code, tekst = self.controle(html='https://synthetisch.workers.dev')
        self.assertEqual(code, 1)
        self.assertIn("geen 'workers'", tekst)

    def test_workerpagina_mag_ontbreken_maar_geen_publieke_kopie_hebben(self):
        code, tekst = self.controle(aanwezig=False, bestand_in_repo=False)
        self.assertEqual(code, 0, tekst)
        code, tekst = self.controle(bestand_in_repo=False)
        self.assertEqual(code, 1)
        self.assertIn('bestand_in_repo is false', tekst)

    def test_overzicht_noemt_concept_met_locatie_en_afscherming(self):
        tekst = check_tools.render_tools_md(register(in_portal=True, in_beheer=True))
        self.assertIn('concept', tekst)
        self.assertIn('`/voorbeeld.html`', tekst)
        self.assertNotIn('nog niet gepubliceerd', tekst)
        self.assertIn('niet afgeschermd', tekst)
