"""Tests for milestone 13: the reading order, Start here, Taylor's glossary and his prefatory texts.

    python3 -m unittest discover -s tests -v

The file tests read what is committed. The server tests need data/workshop.sqlite
(python3 tools/build_db.py) and are skipped without it.
"""
import json
import sys
import threading
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import ancient  # noqa: E402
import build_db  # noqa: E402
import serve  # noqa: E402

ORDER = json.loads((ROOT / "sources" / "structure" / "reading-order.json").read_text(encoding="utf-8"))


def evidence(o):
    evs = list(o.get("frame", []))
    for g in o.get("groups", []):
        evs += g.get("evidence", [])
        for s in g.get("steps", []):
            evs += s["evidence"]
    return evs


class Files(unittest.TestCase):
    def test_every_ancient_quotation_is_in_its_text(self):
        missing = []
        for o in ORDER["orders"]:
            for e in evidence(o):
                if e.get("modern"):
                    continue
                if not ancient.find(ancient.load(e["source"]), e["quote"], e.get("at")):
                    missing.append((o["id"], e["quote"]))
        self.assertEqual(missing, [])

    def test_greek_is_translated_and_modern_is_labelled(self):
        for o in ORDER["orders"]:
            for e in evidence(o):
                if e.get("modern"):
                    self.assertTrue(e.get("url") and e.get("who") and e.get("cited"), e)
                elif ancient.load(e["source"])["lang"] == "grc":
                    self.assertTrue(e.get("english"), f"Greek without English: {e['quote']}")

    def test_the_default_is_the_iamblichean_curriculum(self):
        self.assertEqual(ORDER["default"], "iamblichus")
        o = next(x for x in ORDER["orders"] if x["id"] == "iamblichus")
        twelve = [s["work"] for g in o["groups"][:2] for s in g["steps"]]
        # Alcibiades I, Gorgias, Phaedo, Cratylus, Theaetetus, Sophist, Statesman, Phaedrus, Symposium, Philebus; Timaeus, Parmenides.
        self.assertEqual(twelve, ["tlg013", "tlg023", "tlg004", "tlg005", "tlg006", "tlg007", "tlg008",
                                  "tlg012", "tlg011", "tlg010", "tlg031", "tlg009"])
        for s in o["groups"][0]["steps"]:
            if s["work"] in ("tlg007", "tlg008"):
                self.assertTrue(s.get("modern_placement"))
                self.assertTrue(any(e.get("modern") for e in s["evidence"]))

    def test_each_order_lists_a_work_once(self):
        for o in ORDER["orders"]:
            ws = [s["work"] for g in o.get("groups", []) for s in g.get("steps", [])]
            self.assertEqual(len(ws), len(set(ws)), o["id"])

    def test_glossary_entries(self):
        d = json.loads((serve.TAYLOR_VOL1 / "platonic-terms.json").read_text(encoding="utf-8"))
        g = serve.glossary(d)
        heads = [e["head"] for e in g]
        self.assertGreaterEqual(len(g), 60)
        for h in ("Demiurgus", "Dianoia", "Hyparxis", "Monad", "Intellect", "Logos", "Epithymetic Part of the Soul"):
            self.assertIn(h, heads)
        self.assertTrue(all(len(h) < 60 for h in heads), [h for h in heads if len(h) >= 60])
        self.assertEqual(next(e for e in g if e["head"] == "Logos")["see"], "Reason")
        self.assertTrue(next(e for e in g if e["head"] == "Truth")["more"])
        for e in g:
            if e["source"]:
                self.assertTrue(e["source_title"], e["head"])


@unittest.skipUnless(build_db.DB_PATH.exists(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import tempfile
        cls.tmp = tempfile.TemporaryDirectory()
        lib = serve.Library(build_db.DB_PATH, Path(cls.tmp.name) / "user.sqlite")
        cls.httpd = serve.make_server(0, library=lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}") as r:
            return r.read()

    def test_reading_order(self):
        d = json.loads(self.get("/api/reading-order"))
        self.assertEqual(d["default"], "iamblichus")
        self.assertEqual(d["works"]["tlg013"]["slug"], "alcibiades-1")

    def test_taylor_texts(self):
        for tid in serve.TAYLOR_TEXTS:
            d = json.loads(self.get(f"/api/taylor/{tid}"))
            self.assertTrue(d["segments"] and d["about"])
        self.assertIn("glossary", json.loads(self.get("/api/taylor/platonic-terms")))
        with self.assertRaises(urllib.error.HTTPError):
            self.get("/api/taylor/republic")

    def test_reader_loads_the_guide(self):
        page = self.get("/").decode("utf-8")
        self.assertLess(page.index('src="guide.js"'), page.index('src="shell.js"'))
        js = self.get("/guide.js").decode("utf-8")
        for f in ("showStart", "showGlossary", "showTaylorText", "workGroups"):
            self.assertIn(f"function {f}", js)


if __name__ == "__main__":
    unittest.main()
