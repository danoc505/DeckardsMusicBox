"""Tests for milestone 15: English for every piece of Greek.

    python3 -m unittest discover -s tests -v

The file tests read what is committed. The server tests need data/workshop.sqlite
(python3 tools/build_db.py) and are skipped without it.
"""
import json
import re
import sys
import threading
import unittest
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import greek_audit  # noqa: E402

TR = ROOT / "sources" / "translations"
WORD = re.compile(r"[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿̀-ͯʼ’᾽᾿']*")


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


class Files(unittest.TestCase):
    def test_prolegomena_every_page_has_english_keyed_to_its_greek(self):
        greek = load(ROOT / "texts" / "ancient" / "prolegomena-hermann.json")
        eng = load(TR / "prolegomena-hermann.json")
        self.assertEqual(eng["by"], "Workshop translation")
        self.assertEqual([s["n"] for s in eng["sections"]], [s["n"] for s in greek["sections"]])
        for g, e in zip(greek["sections"], eng["sections"]):
            self.assertEqual(e["greek_starts"], " ".join(WORD.findall(g["text"])[:5]), g["n"])
            self.assertGreater(len(e["english"].split()), 150, g["n"])
            self.assertIsNone(re.search(r"[Ͱ-Ͽἀ-῿]", e["english"]), f"Greek left in the English of p. {g['n']}")

    def test_prolegomena_english_agrees_with_the_reading_order_quotations(self):
        """Milestone 13 quoted the Workshop's English of chapter 26: the whole translation must say the same."""
        order = load(ROOT / "sources" / "structure" / "reading-order.json")
        bare = lambda t: re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", t)).lower()
        pages = {s["n"]: bare(s["english"]) for s in load(TR / "prolegomena-hermann.json")["sections"]}
        found = []

        def walk(x):
            if isinstance(x, dict):
                if x.get("english") and x.get("source") == "prolegomena-hermann":
                    found.append(x)
                for v in x.values():
                    walk(v)
            elif isinstance(x, list):
                for v in x:
                    walk(v)
        walk(order)
        self.assertTrue(found)
        for e in found:
            first = bare(e["english"]).split(",")[0].split("(")[0].strip()[:40]
            self.assertIn(first, pages[e["at"]], e["english"])

    def test_paired_english_exists_for_every_greek_page(self):
        pairs = load(TR / "paired.json")["texts"]
        for gid, p in pairs.items():
            g = load(ROOT / "texts" / "ancient" / f"{gid}.json")
            e = {s["n"] for s in load(ROOT / "texts" / "ancient" / f"{p['english']}.json")["sections"]}
            self.assertEqual(sorted(p["sections"]), sorted(s["n"] for s in g["sections"]), gid)
            for n, parts in p["sections"].items():
                self.assertTrue(parts and set(parts) <= e, f"{gid} {n}: {parts}")

    def test_every_field_with_greek_is_covered(self):
        cov = greek_audit.load_coverage()
        report = load(ROOT / "reports" / "greek_audit.json")
        self.assertTrue(report["fields"])
        for r in report["fields"]:
            c = greek_audit.coverage_for(cov, r["field"])
            self.assertIsNotNone(c, f"{r['field']} shows Greek and is not in coverage.json")
            self.assertIn(c["how"], cov["kinds"], r["field"])
        # Only the scholia wait for their translation (milestone 21).
        pending = {k for k, v in cov["fields"].items() if v["how"] == "pending"}
        self.assertEqual(pending, {"scholia*"})

    def test_greek_written_in_the_reader_has_english_beside_it(self):
        for s in greek_audit.static_runs():
            line = (ROOT / s["file"]).read_text(encoding="utf-8").splitlines()[s["line"] - 1]
            self.assertRegex(re.sub(r"<[^>]+>", " ", line), r"[A-Za-z]{4,}", f"{s['file']}:{s['line']}")

    def test_reader_loads_the_tap_a_word_box(self):
        page = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        self.assertIn('src="gloss.js"', page)
        self.assertLess(page.index('src="gloss.js"'), page.index('src="shell.js"'))
        js = (ROOT / "reader" / "gloss.js").read_text(encoding="utf-8")
        self.assertIn("api(`gloss/", js)
        self.assertIn("api(`english/", js)
        # Burnet's words keep the word box.
        self.assertIn(".w, [data-t]", js)

    def test_roadmap_plans_the_rest(self):
        road = (ROOT / "ROADMAP.md").read_text(encoding="utf-8")
        self.assertIn("## Milestone 15: English for every piece of Greek (done)", road)
        self.assertIn("## Milestone 21: the Greek scholia in English", road)
        self.assertIn("## Milestone 22: voices inside the narrated dialogues", road)


@unittest.skipUnless(build_db.DB_PATH.exists(), "build the library first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import serve
        cls.lib = serve.Library()
        cls.srv = serve.make_server(port=0, library=cls.lib)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/{urllib.parse.quote(path)}") as r:
            return json.loads(r.read())

    def test_gloss_of_a_word_in_plato(self):
        g = self.get("gloss/ψυχῆς")
        self.assertEqual(g["lemmas"][0]["lemma"], "ψυχή")
        self.assertTrue(any(b.startswith("GLAUx") for b in g["lemmas"][0]["by"]))
        self.assertEqual(g["meaning"]["lexicon_id"], "middle-liddell")
        self.assertIn("life", g["meaning"]["senses"])

    def test_gloss_of_a_word_only_outside_plato(self):
        # νυκτερίδων: in the Prolegomena (p. 196), not in Plato; Morpheus has it.
        g = self.get("gloss/νυκτερίδων")
        self.assertEqual(g["lemmas"][0]["lemma"], "νυκτερίς")
        self.assertIn("Morpheus", g["lemmas"][0]["by"])
        self.assertTrue(g["meaning"])

    def test_gloss_reads_the_scans_theta(self):
        g = self.get("gloss/ἐφίεσϑαι")
        self.assertIn("ἐφίημι", [l["lemma"] for l in g["lemmas"]])

    def test_gloss_says_when_nothing_is_known(self):
        g = self.get("gloss/ξξξξ")
        self.assertEqual(g["lemmas"], [])
        self.assertIsNone(g["meaning"])

    def test_prolegomena_has_its_english(self):
        t = self.get("ancient/prolegomena-hermann")
        self.assertEqual(t["english_about"]["by"], "Workshop translation")
        self.assertTrue(all(s.get("english", {}).get("text") for s in t["sections"]))

    def test_albinus_has_burges_beside_it(self):
        t = self.get("ancient/albinus-hermann")
        self.assertTrue(all(s.get("english", {}).get("parts") for s in t["sections"]))
        self.assertIn("Burges", t["english_about"]["by"])
        self.assertIn("Alcibiades", " ".join(p["text"] for p in t["sections"][2]["english"]["parts"]))

    def test_english_of_a_quoted_section_loeb_first(self):
        d = self.get("english/tlg031/29e")
        self.assertTrue(d["editions"])
        self.assertEqual(d["editions"][0]["source_id"], "perseus-english-plato")
        self.assertIn("good", " ".join(d["editions"][0]["text"]))

    def test_english_of_an_unknown_section_is_empty(self):
        self.assertEqual(self.get("english/tlg031/999z")["editions"], [])


if __name__ == "__main__":
    unittest.main()
