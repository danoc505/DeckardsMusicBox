"""Tests for the Workshop website (the iPad): tools/build_site.py and web/.

    python3 -m unittest discover -s tests -v

The piece and page tests always run. The bridge test answers requests with
web/bridge.py over data/workshop.sqlite, and is skipped until build_db.py has run.
"""
import gzip
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import build_site  # noqa: E402


def load_bridge():
    spec = importlib.util.spec_from_file_location("bridge", ROOT / "web" / "bridge.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class TheBuildReadsTheServeModule(unittest.TestCase):
    def test_serve_is_the_module_not_a_function(self):
        # build() reads Taylor's Aristotle texts from the serve module; a local function named serve hid it once,
        # and the website's build failed on GitHub (AttributeError: 'function' object has no attribute ...).
        import types
        self.assertIsInstance(build_site.serve, types.ModuleType)
        self.assertTrue(build_site.serve.TAYLOR_TEXTS_AR)


class TheSiteCarriesTheModernEnglish(unittest.TestCase):
    def test_every_modern_text_goes_to_the_website_whatever_its_size(self):
        # The Metaphysics and the Enneads passed the 2 MB cut for files.json and opened as "Not found" on the iPad.
        sent = set(build_site.server_json())
        modern = sorted(build_site.serve.MODERN.glob("*.json"))
        self.assertTrue(modern)
        for p in modern:
            self.assertIn(p, sent, p.name)
        for tid in build_site.serve.MODERN_NEO:
            f = build_site.serve.MODERN / f"{tid}.json"
            if f.exists():
                self.assertIn(f, sent, tid)


class Pieces(unittest.TestCase):
    def test_pieces_put_back_together_are_the_database(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            db = tmp / "x.sqlite"
            data = bytes(range(256)) * 9000          # not a whole number of pieces
            db.write_bytes(data)
            info = build_site.pieces(db, tmp / "site")
            self.assertEqual(info["size"], len(data))
            parts = sorted((tmp / "site" / info["base"]).iterdir())
            self.assertEqual(len(parts), -(-len(data) // info["chunk"]))
            self.assertEqual(b"".join(gzip.decompress(p.read_bytes()) for p in parts), data)

    def test_the_reader_page_still_has_the_place_for_the_website_lines(self):
        page = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        self.assertIn('<link rel="stylesheet" href="reader.css">', page)


@unittest.skipUnless(build_db.DB_PATH.exists(), "run tools/build_db.py first")
class Bridge(unittest.TestCase):
    def test_answers_as_the_laptop_server_does(self):
        bridge = load_bridge()
        with tempfile.TemporaryDirectory() as tmp:
            bridge.setup(tools=str(ROOT / "tools"), db=str(build_db.DB_PATH), user=str(Path(tmp) / "user.sqlite"))
            status, head, body = bridge.handle("GET", "/api/works", "{}", "")
            self.assertEqual(status, 200)
            self.assertIn("application/json", json.loads(head)["Content-Type"])
            self.assertTrue(any(w["id"] == "tlg031" for w in json.loads(body)))
            status, _, _ = bridge.handle("GET", "/api/lookup/λόγος", "{}", "")
            self.assertEqual(status, 200)
            # A write is refused politely without a body, as on the laptop, and an export downloads.
            status, _, body = bridge.handle("POST", "/api/mine", json.dumps({"Content-Type": "application/json"}), "{}")
            self.assertEqual(status, 400)
            status, head, _ = bridge.handle("GET", "/api/export/my-plato.md", "{}", "")
            self.assertEqual(status, 200)
            self.assertIn("my-plato.md", json.loads(head)["Content-Disposition"])


if __name__ == "__main__":
    unittest.main()
