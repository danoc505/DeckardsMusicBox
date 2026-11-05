"""Tests for milestone 6: the historical translations.

    python3 -m unittest discover -s tests -v

The rule and aligner tests always run. The attribution tests read the files in
sources/ and texts/; the database tests need data/workshop.sqlite built by
tools/build_db.py, and are skipped without it.
"""
import json
import sqlite3
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import align  # noqa: E402
import taylor_ocr  # noqa: E402
import translations  # noqa: E402

DB = ROOT / "data" / "workshop.sqlite"


class OcrRules(unittest.TestCase):
    def test_long_s(self):
        r = taylor_ocr.readings("fhall")
        self.assertIn("shall", r)
        self.assertEqual(r["shall"], ("long s",))
        self.assertIn("first", taylor_ocr.readings("firft"))
        self.assertIn("necessary", taylor_ocr.readings("neceffary"))

    def test_no_long_s_at_word_end(self):
        # 'of' is never 'os'; the long s does not end a word.
        self.assertNotIn("os", taylor_ocr.readings("of"))

    def test_ct_ligature(self):
        self.assertTrue(any(k == ("ct ligature",) for k in taylor_ocr.readings("refpeded").values())
                        or "respected" in taylor_ocr.readings("refpeded"))

    def test_running_head(self):
        self.assertTrue(taylor_ocr.is_head("THE CRITO. 37"))
        self.assertTrue(taylor_ocr.is_head("128 THE PHAEDO."))
        self.assertFalse(taylor_ocr.is_head("EUCLID, TERPSIO,"))
        self.assertFalse(taylor_ocr.is_head("Soc. What do you say, Crito, to this?"))

    def test_catchword(self):
        self.assertTrue(taylor_ocr.is_catchword("VOL. IV. K", "the"))
        self.assertTrue(taylor_ocr.is_catchword("would", "would"))
        self.assertFalse(taylor_ocr.is_catchword("It is so.", "but"))

    def test_speaker(self):
        names = {"socrates", "crito"}
        self.assertEqual(taylor_ocr.speaker_of("Soc. Why are you come?", names), ("Soc", "Why are you come?"))
        self.assertEqual(taylor_ocr.speaker_of("Cri. It is early.", names)[0], "Cri")
        self.assertIsNone(taylor_ocr.speaker_of("Yes. It is so.", names)[0])


class Aligner(unittest.TestCase):
    def test_places_paragraphs_in_order(self):
        names = ["Thrasymachus", "Gyges", "Glaucon", "Adeimantus", "Cephalus", "Polemarchus", "Piraeus", "Bendis",
                 "Lysias", "Euthydemus", "Charmantides", "Cleitophon"]
        ref, tr = [], []
        for k, n in enumerate(names):
            ref.append((f"Here {n} speaks of matters at length, and the others listen to {n} with care.", f"{k + 1}a"))
            tr.append((f"In this place {n} discourses, while the company attends to what {n} says.", None))
        out, info, _ = align.place_paragraphs(tr, ref)
        self.assertEqual([a for a, _ in out], [f"{k + 1}a" for k in range(len(names))])
        self.assertGreater(info["anchors"], 5)

    def test_fixed_anchor_is_kept(self):
        ref = [("one " * 50, "1a"), ("two " * 50, "2a")]
        tr = [("uno " * 30, None), ("dos " * 30, None)]
        mapper, info = align.align(tr, ref, fixed=[(info_start := 0, 0), (len("uno " * 30) + 1, len("one " * 50) + 1)])
        self.assertEqual(mapper(len("uno " * 30) + 5), "2a")

    def test_god_names(self):
        self.assertEqual(align.stem("Jupiter"), align.stem("Zeus"))
        self.assertEqual(align.stem("Minerva"), align.stem("Athena"))


class Attribution(unittest.TestCase):
    """The translators as Taylor names them (General Introduction, vol. I, pp. cv-cvi)."""

    def setUp(self):
        self.dialogues = json.loads((ROOT / "sources/taylor-1804/dialogues.json").read_text(encoding="utf-8"))["dialogues"]

    def test_sydenhams_nine(self):
        syd = {d["work"] for d in self.dialogues if d["translator"] == "Floyer Sydenham"}
        # The First Alcibiades (tlg013) is in vol. I, the other eight here.
        self.assertEqual(syd, {"tlg025", "tlg011", "tlg010", "tlg014", "tlg024", "tlg026", "tlg016", "tlg027"})
        vol1 = json.loads((ROOT / "texts/taylor-1804/vol1/alcibiades-1.json").read_text(encoding="utf-8"))
        self.assertIn("Sydenham", vol1["translator"])

    def test_banquet_speech_of_alcibiades_is_taylors(self):
        d = json.loads((ROOT / "texts/taylor-1804/vol3/symposium.json").read_text(encoding="utf-8"))
        who = [s["translator"] for s in d["segments"] if s["kind"] == "paragraph"]
        self.assertEqual(who[0], "Floyer Sydenham")
        self.assertEqual(who[-1], "Thomas Taylor")
        k = who.index("Thomas Taylor")
        self.assertTrue(all(w == "Thomas Taylor" for w in who[k:]))

    def test_alcibiades_2_in_jowett_is_knights(self):
        eb = json.loads((ROOT / "sources/jowett-gutenberg/ebooks.json").read_text(encoding="utf-8"))
        found = [w for e in eb["ebooks"] for w in e.get("works", []) if isinstance(w, dict) and w.get("work") == "tlg014"]
        self.assertTrue(found)
        self.assertEqual(found[0]["translator"], "Matthew Knight")

    def test_commentators(self):
        self.assertEqual(translations.taylor_commentator({"signed": "Sydenham"}, "Floyer Sydenham"), "Sydenham (1804), note signed S.")
        self.assertEqual(translations.taylor_commentator({}, "Floyer Sydenham"), "Taylor or Sydenham (1804), unsigned note")
        self.assertEqual(translations.taylor_label(["Thomas Taylor", "Floyer Sydenham"]), "Sydenham and Taylor (1804)")


@unittest.skipUnless(DB.exists(), "data/workshop.sqlite not built")
class Library(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(DB)

    def tearDown(self):
        self.db.close()

    def test_every_dialogue_has_taylor(self):
        works = {r[0] for r in self.db.execute("SELECT work_id FROM edition WHERE id LIKE '%.taylor1804'")}
        self.assertEqual(len(works), 36)

    def test_jowett_where_he_translated(self):
        works = {r[0] for r in self.db.execute("SELECT work_id FROM edition WHERE id LIKE '%.jowett'")}
        self.assertEqual(len(works), 28)
        self.assertNotIn("tlg025", works)

    def test_sections_covered(self):
        for ed, low in (("tlg031.taylor1804", 300), ("tlg030.jowett", 1300), ("tlg004.jowett", 290)):
            n = self.db.execute("SELECT count(DISTINCT section_ref) FROM chunk WHERE edition_id=?", (ed,)).fetchone()[0]
            self.assertGreater(n, low, ed)

    def test_methods_and_proofreading_recorded(self):
        for ed, method in (("tlg031.taylor1804", "computed"), ("tlg030.taylor1804", "printed"), ("tlg030.jowett", "printed"),
                           ("tlg004.jowett", "printed page, section computed")):
            row = self.db.execute("SELECT align_method, proof_status FROM edition WHERE id=?", (ed,)).fetchone()
            self.assertEqual(row[0], method, ed)
            self.assertTrue(row[1])

    def test_ocr_kept_beside_cleaned_text(self):
        n = self.db.execute("SELECT count(*) FROM chunk WHERE edition_id='tlg031.taylor1804' AND raw IS NOT NULL").fetchone()[0]
        self.assertGreater(n, 100)

    def test_alignment_check_stored(self):
        v = json.loads(self.db.execute("SELECT value FROM build WHERE key='alignment_check'").fetchone()[0])
        taylor = [r for r in v["rows"] if r["work"] == "tlg030" and "1804" in r["translation"]]
        self.assertGreater(taylor[0]["exact"], 0.8)


if __name__ == "__main__":
    unittest.main()
