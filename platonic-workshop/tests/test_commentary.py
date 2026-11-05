"""Tests for milestone 7: the commentaries on the Timaeus.

    python3 -m unittest discover -s tests -v

The reading tests check the committed texts/commentary/timaeus/ files and
the rules that made them. The library tests build the Timaeus into a
temporary folder and are skipped if tools/fetch_sources.py has not been run.
"""
import json
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import commentary  # noqa: E402
import commentary_db  # noqa: E402
import serve  # noqa: E402

TEXTS = ROOT / "texts" / "commentary" / "timaeus"
RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()


def doc(name):
    return json.loads((TEXTS / f"{name}.json").read_text(encoding="utf-8"))


class Reading(unittest.TestCase):
    def test_every_commentary_is_read(self):
        ids = sorted(p.stem for p in TEXTS.glob("*.json"))
        self.assertEqual(ids, ["archerhind1888", "archerhind1888-intro", "jowett1892-intro", "proclus1820",
                               "scholia-hermann", "taylor1804-addnotes", "taylor1804-intro"])
        for i in ids:
            d = doc(i)
            self.assertEqual(d["schema"], "platonic-workshop/commentary-v1")
            self.assertTrue(d["anchoring"] and d["proof_status"] and d["printed"])
            keys = [n["id"] for n in d["notes"]]
            self.assertEqual(len(keys), len(set(keys)), i)
            for n in d["notes"]:
                self.assertTrue(n["text"].strip() or n["kind"] == "introduction", n["id"])
                self.assertIn("raw", n)    # the OCR as received is kept beside every note

    def test_archer_hind_notes_start_with_greek_lemmata(self):
        d = doc("archerhind1888")
        self.assertGreater(len(d["notes"]), 800)
        first = d["notes"][0]
        self.assertEqual(first["lemma"], "εἷς δύο τρεῖς")
        self.assertEqual(first["printed_line"], 1)
        self.assertTrue(first["text"].startswith("This very simple opening"))
        last = d["notes"][-1]
        self.assertIn("μονογενὴς", last["lemma"])

    def test_note_head_rule(self):
        m = commentary.NOTE_HEAD.match("4. εἰς γυναικὸς φύσιν] Here, it must be confessed")
        self.assertEqual((m.group(1), m.group(2), m.group(3)[:4]), ("4", "εἰς γυναικὸς φύσιν", "Here"))
        self.assertGreater(commentary.greek_share("εἰς γυναικὸς φύσιν"), 0.9)

    def test_proclus_lemmata_are_in_order(self):
        d = doc("proclus1820")
        notes = [n for n in d["notes"] if n["kind"] == "note"]
        self.assertGreater(len(notes), 200)
        self.assertEqual(d["notes"][0]["kind"], "introduction")      # the preface, on the scope of the dialogue
        self.assertIn("physiology", d["notes"][0]["text"][:200])
        self.assertEqual([n["book"] for n in notes][0], "I")
        self.assertEqual([n["book"] for n in notes][-1], "V")
        segs = [s["id"] for s in json.loads(commentary.TAYLOR_1804_TIMAEUS.read_text(encoding="utf-8"))["segments"]]
        places = [(segs.index(n["found_in_taylor"]["segment"]), n["found_in_taylor"]["word"]) for n in notes]
        self.assertEqual(places, sorted(places))

    def test_taylor_additional_notes(self):
        d = doc("taylor1804-addnotes")
        notes = [n for n in d["notes"] if n["kind"] == "note"]
        self.assertEqual([n["printed_ref"] for n in notes], ["p. 473", "p. 474", "p. 474", "p. 485", "p. 490", "p. 499", "p. 499"])
        for f in [n for n in d["notes"] if n["kind"] == "footnote"]:
            self.assertTrue(f["on"].startswith("taylor1804-addnotes."))

    def test_finding_a_quotation_in_taylor(self):
        t = commentary.TaylorText()
        hit = t.find("Tim. Entirely so, Socrates. And we shall endeavour to the utmost of our ability, to leave nothing")
        self.assertIsNotNone(hit)
        self.assertGreater(hit[2], 0.8)
        self.assertIsNone(t.find("The quick brown fox jumps over the lazy dog every morning", 0.3))

    def test_longest_chain(self):
        self.assertEqual(commentary.longest_chain([(0, 5), (1, 50), (2, 7), (3, 9)]), {0, 2, 3})


class Rules(unittest.TestCase):
    def test_greek_normalising(self):
        n = commentary_db.GreekText.norm
        self.assertEqual(n("ξυγγενῆ"), n("συγγενῆ"))
        self.assertEqual(n("ϑύο"), n("δύο"))
        self.assertEqual(n("ἀγαθὸς"), "αγαθοσ")

    def test_body_html_marks_greek(self):
        h = commentary_db.body_html("cf. Laws 902 B ἅμα καὶ θεοσεβέστατον.\n\nNext <para>.")
        self.assertIn('<span lang="grc">ἅμα καὶ θεοσεβέστατον</span>', h)
        self.assertIn("<p>Next &lt;para&gt;.</p>", h)


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(["tlg031"], db_path=cls.db_path)
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

    def test_every_note_is_placed_and_says_how(self):
        self.assertEqual(self.q("SELECT count(*) FROM note WHERE commentary_id IS NOT NULL AND (anchor_method IS NULL OR anchor_detail IS NULL)"),
                         [(0,)])
        n = {r[0]: r[1] for r in self.q("SELECT commentary_id, count(*) FROM note WHERE commentary_id IS NOT NULL GROUP BY 1")}
        for c in commentary_db.load("tlg031"):
            self.assertEqual(n[c["id"]], len(c["notes"]), c["id"])

    def test_archer_hind_on_the_greek_words(self):
        (start, ws, end_ref, we, method, computed), = self.q(
            "SELECT start_ref, word_start, word_end_ref, word_end, word_method, computed FROM note WHERE note_key = 'archerhind1888.0001'")
        self.assertEqual((start, ws, end_ref, we, computed), ("17a", 1, "17a", 3, 0))
        words = self.q("SELECT t.form FROM token t JOIN edition e ON e.id = t.edition_id WHERE e.id = 'tlg031.perseus-grc2' "
                       "AND t.section_ref = '17a' AND t.seq BETWEEN 1 AND 3 ORDER BY t.seq")
        self.assertEqual([w[0] for w in words], ["εἷς", "δύο", "τρεῖς"])
        on_words, total = self.q("SELECT sum(word_start IS NOT NULL), count(*) FROM note WHERE commentary_id = 'archerhind1888'")[0]
        self.assertGreater(on_words / total, 0.85)
        # A place found word for word is not computed; anything else is.
        self.assertEqual(self.q("SELECT count(*) FROM note WHERE commentary_id = 'archerhind1888' AND computed = 0 "
                                "AND (word_method IS NULL OR word_method NOT LIKE '%word for word%')"), [(0,)])

    def test_archer_hind_in_order(self):
        seq = {r: i for i, (r,) in enumerate(self.q("SELECT ref FROM section WHERE work_id = 'tlg031' ORDER BY seq"))}
        refs = [r for (r,) in self.q("SELECT start_ref FROM note WHERE commentary_id = 'archerhind1888' AND computed = 0 ORDER BY seq")]
        backwards = sum(1 for a, b in zip(refs, refs[1:]) if seq[b] < seq[a] - 1)
        self.assertLessEqual(backwards, 3)

    def test_translation_quotes_are_computed(self):
        self.assertEqual(self.q("SELECT DISTINCT computed FROM note WHERE commentary_id = 'proclus1820' AND kind = 'note'"), [(1,)])
        (s,), = self.q("SELECT start_ref FROM note WHERE note_key = 'proclus1820.001'")
        self.assertEqual(s, "17a")

    def test_introductions_are_on_the_whole_dialogue(self):
        self.assertEqual(self.q("SELECT DISTINCT start_ref, end_ref FROM note WHERE commentary_id = 'jowett1892-intro'"), [("17a", "92c")])

    def test_page_api_and_proofreading(self):
        p = self.lib.page("tlg031", 29)
        self.assertTrue(p["commentary"])
        self.assertTrue(all(n["kind"] != "introduction" for n in p["commentary"]))
        self.assertFalse(any(n["commentator"].startswith("Archer") for n in p["notes"]))    # kept apart from the translators' footnotes
        long_ = [n for n in p["commentary"] if n.get("long")]
        self.assertTrue(long_)
        full = self.lib.note(long_[0]["id"])
        self.assertGreater(len(full["body_html"]), len(long_[0]["body_html"]))
        key = p["commentary"][0]["note_key"]
        req = urllib.request.Request(self.base + "/api/proof", method="POST", headers={"Content-Type": "application/json"},
                                     data=json.dumps({"note_key": key, "status": "checked", "corrected": "Fixed text."}).encode())
        with urllib.request.urlopen(req) as r:
            out = json.loads(r.read())
        self.assertEqual((out["status"], out["corrected"], out["changed"]), ("checked", "Fixed text.", False))
        p = self.lib.page("tlg031", 29)
        self.assertEqual([n["proof"]["corrected"] for n in p["commentary"] if n["note_key"] == key], ["Fixed text."])
        # The library's text is untouched.
        self.assertNotEqual(self.q("SELECT body FROM note WHERE note_key = ?", key)[0][0], "Fixed text.")
        bad = urllib.request.Request(self.base + "/api/proof", method="POST", headers={"Content-Type": "application/json"},
                                     data=json.dumps({"note_key": key, "status": "fine"}).encode())
        with self.assertRaises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(bad)
        self.assertEqual(e.exception.code, 400)
        self.assertIn("proofreading", self.lib.mine.export_json())


if __name__ == "__main__":
    unittest.main()
