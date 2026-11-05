"""Tests for the milestone 1 tools.

    python3 -m unittest discover -s tests -v

The Greek helper tests always run. The source tests use the real downloaded
data and are skipped if tools/fetch_sources.py has not been run.
"""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import greek  # noqa: E402
import verify_sources as vs  # noqa: E402

HAVE_DATA = (ROOT / "data" / "raw" / "perseus-greek-plato").exists()


class GreekHelpers(unittest.TestCase):
    def test_betacode(self):
        self.assertEqual(greek.to_betacode("ἀγαθός"), "a)gaqo/s")
        self.assertEqual(greek.to_betacode("ψυχῇ"), "yuxh=|")
        self.assertEqual(greek.to_betacode("Ἀθηναῖος"), "*)aqhnai=os")
        self.assertEqual(greek.to_betacode("ῥηθέντων"), "r(hqe/ntwn")
        self.assertEqual(greek.to_betacode("ΐ"), "i+/")

    def test_lookup_keys_handle_running_text_accents(self):
        self.assertIn("kai/", greek.lookup_keys("καὶ"))  # grave -> acute
        self.assertIn("a)/nqrwpos", greek.lookup_keys("ἄνθρωπός"))  # enclitic accent
        self.assertIn("a)qhnai=os", greek.lookup_keys("Ἀθηναῖος"))  # capital

    def test_tokenize_keeps_elision_and_drops_punctuation(self):
        self.assertEqual(greek.tokenize("ἆρʼ οὖν μέμνησθε ὅσα;"), ["ἆρʼ", "οὖν", "μέμνησθε", "ὅσα"])

    def test_strip_accents(self):
        self.assertEqual(greek.strip_accents("Ψυχῆς"), "ψυχησ")

    def test_stephanus_sequence(self):
        self.assertEqual(vs.sequence_problems(["17a", "17b", "17c", "18a"]), [])
        self.assertEqual(vs.sequence_problems(["17a", "17c"]), ["17a -> 17c"])
        self.assertEqual(vs.sequence_problems(["17e", "19a"]), ["17e -> 19a"])


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class RealSources(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.perseus, cls.timaeus = vs.check_perseus()

    def test_all_36_works_have_greek_and_english(self):
        self.assertEqual(len(self.perseus), 36)
        self.assertTrue(all(p.get("grc_file") and p.get("eng_file") for p in self.perseus))

    def test_timaeus_stephanus_range_is_complete(self):
        order = self.timaeus["order"]
        self.assertEqual((order[0], order[-1]), ("17a", "92c"))
        self.assertEqual(vs.sequence_problems(order), [])

    def test_timaeus_29e_says_he_was_good(self):
        # Ti. 29e: ἀγαθὸς ἦν, ἀγαθῷ δὲ οὐδεὶς περὶ οὐδενὸς οὐδέποτε ἐγγίγνεται φθόνος
        self.assertIn("ἀγαθὸς ἦν", self.timaeus["text"]["29e"])

    def test_only_book_divisions_break_the_sequence(self):
        for p in self.perseus:
            if p["work"] not in ("tlg030", "tlg034"):
                self.assertEqual(p["sequence_problems"], [], p["title"])

    def test_glaux_lines_up_with_perseus(self):
        _, _, alignment = vs.check_glaux(self.timaeus)
        self.assertGreater(alignment["match_rate"], 0.98)
        self.assertEqual(alignment["sections_missing_in_glaux"], [])

    def test_taylor_timaeus_is_found(self):
        lines, slices = vs.taylor_timaeus_slices()
        a, b = slices["translation"]
        self.assertIn("two,", lines[a])
        self.assertGreater(b - a, 3000)


if __name__ == "__main__":
    unittest.main()
