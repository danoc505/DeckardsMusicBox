"""Tests for milestone 9: each dialogue as a whole, and the corpus as a whole.

    python3 -m unittest discover -s tests -v

The file tests read what is committed (texts/ancient/, texts/structure/,
sources/structure/). The library tests build all 36 works into a temporary
folder (about 80 seconds) and are skipped if tools/fetch_sources.py has not been run.
"""
import json
import re
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import ancient  # noqa: E402
import build_db  # noqa: E402
import serve  # noqa: E402
import structure  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()
STEPH = re.compile(r"^(\d+)([a-e])$")


def steph_key(r):
    m = STEPH.match(r)
    return int(m.group(1)), m.group(2)


class Files(unittest.TestCase):
    def test_every_ancient_quotation_is_in_its_text(self):
        docs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in ancient.OUT.glob("*.json")}
        missing = []
        for name in ("orders.json", "sequences.json", "skopos.json"):
            d = json.loads((structure.CLAIMS / name).read_text(encoding="utf-8"))
            evs = []
            for o in d.get("orders", []):
                evs += o["frame"] + [e for i in o["items"] for e in i["evidence"]]
            for s in d.get("sequences", []):
                evs += s["testimony"]
            evs += d.get("statements", [])
            for e in evs:
                if e["source"] != "plato" and not ancient.find(docs[e["source"]], e["quote"]):
                    missing.append((e["source"], e["quote"]))
        self.assertEqual(missing, [])

    def test_thrasyllus_order_is_the_perseus_order(self):
        d = json.loads((structure.CLAIMS / "orders.json").read_text(encoding="utf-8"))
        thr = next(o for o in d["orders"] if o["id"] == "thrasyllus")
        self.assertEqual([i["work"] for i in thr["items"]], [f"tlg{n:03d}" for n in range(1, 37)])
        for k, i in enumerate(thr["items"]):
            self.assertEqual(i["group"], f"Tetralogy {k // 4 + 1}")
            self.assertTrue(i["evidence"])

    def test_archer_hind_chapters_cover_the_timaeus_in_order(self):
        d = json.loads((structure.TEXTS / "archerhind1888-chapters.json").read_text(encoding="utf-8"))
        ch = d["divisions"]
        self.assertEqual(len(ch), 44)
        self.assertEqual((ch[0]["start"], ch[-1]["end"]), ("17a", "92c"))
        for a, b in zip(ch, ch[1:]):
            # Each begins where the one before ends, or after it; none overlaps the next.
            self.assertLessEqual(steph_key(a["start"]), steph_key(a["end"]))
            self.assertLessEqual(steph_key(a["end"]), steph_key(b["start"]))
            self.assertTrue(b["summary"])

    def test_sidenotes_are_placed_in_order(self):
        d = json.loads((structure.TEXTS / "jowett-sidenotes.json").read_text(encoding="utf-8"))
        rep = d["works"]["tlg030"]["sidenotes"]
        self.assertGreater(len(rep), 700)
        keys = [steph_key(s["ref"]) for s in rep]
        self.assertEqual(keys, sorted(keys))
        self.assertTrue(rep[0]["text"].startswith("Republic I."))

    def test_scope_rule(self):
        self.assertTrue(structure.SCOPE.search("The design of the Hipparchus is to show that all men desire good."))
        self.assertTrue(structure.SCOPE.search("We say, therefore, that its scope is to discourse concerning the principles"))
        self.assertTrue(structure.NOT_SCOPE.search("to abandon the design of pubhfhing his translation"))
        self.assertTrue(structure.NOT_SCOPE.search("Such was my design in this work."))


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(build_db.ALL_WORKS, db_path=cls.db_path)
        cls.db = sqlite3.connect(cls.db_path)
        cls.lib = serve.Library(cls.db_path, Path(cls.tmp.name) / "user.sqlite")
        cls.srv = serve.make_server(port=0, library=cls.lib)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()
        cls.lib.db.close()
        cls.db.close()
        cls.tmp.cleanup()

    def q(self, sql, *args):
        return self.db.execute(sql, args).fetchall()

    def get(self, path):
        with urllib.request.urlopen(self.base + path) as r:
            return json.loads(r.read())

    def test_every_quotation_is_found(self):
        self.assertEqual(self.q("SELECT owner, quote FROM evidence WHERE found IS NOT 1"), [])
        self.assertEqual(self.q("SELECT work_id, quote FROM claim WHERE found IS NOT 1"), [])
        self.assertEqual(self.q("SELECT theme_id, quote FROM theme_passage WHERE found IS NOT 1"), [])

    def test_every_claim_names_its_source(self):
        self.assertEqual(self.q("SELECT count(*) FROM claim WHERE cited_as = '' OR method = '' OR quote = ''")[0][0], 0)
        self.assertEqual(self.q("SELECT count(*) FROM evidence WHERE cited_as = ''")[0][0], 0)
        self.assertEqual(self.q("SELECT count(*) FROM division WHERE kind IN ('chapter', 'sidenote') AND (basis = '' OR printed_at IS NULL)")[0][0], 0)
        # Every item of an order rests on at least one quotation.
        self.assertEqual(self.q("SELECT i.order_id, i.n FROM reading_order_item i WHERE NOT EXISTS "
                                "(SELECT 1 FROM evidence e WHERE e.owner = 'order:' || i.order_id || ':' || i.n)"), [])

    def test_divisions_are_real_places(self):
        bad = self.q("SELECT d.work_id, d.start_ref, d.end_ref FROM division d WHERE kind IN ('chapter', 'sidenote') AND ("
                     "NOT EXISTS (SELECT 1 FROM section s WHERE s.work_id = d.work_id AND s.ref = d.start_ref) OR "
                     "NOT EXISTS (SELECT 1 FROM section s WHERE s.work_id = d.work_id AND s.ref = d.end_ref) OR "
                     "(SELECT seq FROM section s WHERE s.work_id = d.work_id AND s.ref = d.end_ref) < "
                     "(SELECT seq FROM section s WHERE s.work_id = d.work_id AND s.ref = d.start_ref))")
        self.assertEqual(bad, [])
        self.assertEqual(self.q("SELECT count(*) FROM division WHERE kind = 'chapter' AND work_id = 'tlg031'")[0][0], 44)

    def test_whole_api(self):
        w = self.get("/api/whole/tlg031")
        self.assertEqual(len(w["chapters"]), 44)
        self.assertTrue(any(c["kind"] == "skopos" and c["text_id"] == "prolegomena-hermann" for c in w["claims"]))
        self.assertTrue(any(c["kind"] == "persons" for c in w["claims"]))
        self.assertIn("republic-timaeus-critias", [s["id"] for s in w["sequences"]])
        self.assertIn("atlantis", [t["id"] for t in w["themes"]])
        self.assertIn("iamblichus", [o["id"] for o in w["orders"]])
        r = self.get("/api/whole/tlg030")
        self.assertGreater(len(r["sidenotes"]), 700)
        self.assertTrue({"cave", "line", "sun"} <= {t["id"] for t in r["themes"]})

    def test_corpus_api(self):
        c = self.get("/api/corpus")
        self.assertEqual(len(c["works"]), 36)
        self.assertEqual({o["id"] for o in c["orders"]}, {"thrasyllus", "aristophanes", "beginnings", "albinus", "iamblichus", "albinus-classes"})
        self.assertEqual(len(c["themes"]), 22)
        self.assertIn("Socrates", [s["name"] for s in c["speakers"]["tlg031"]])
        self.assertTrue(any(r["from_work"] == "tlg031" and r["to_work"] == "tlg030" for r in c["citations"]))
        self.assertEqual(c["stats"]["not found"], [])
        a = self.get("/api/ancient/dl3-burges?at=56")
        self.assertIn("tetralogy", a["sections"][0]["text"])

    def test_work_api_says_where_you_are(self):
        w = self.get("/api/work/tlg031")
        self.assertEqual(w["chapters"][0]["start_ref"], "17a")
        self.assertIn("atlantis", [t["id"] for t in w["themes"]])


if __name__ == "__main__":
    unittest.main()
