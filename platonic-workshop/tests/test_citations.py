"""Tests for milestone 8: the citation web.

    python3 -m unittest discover -s tests -v

The reading tests run the rules on sentences taken from the notes. The library
tests build the Republic and the Timaeus into a temporary folder (about 40
seconds) and are skipped if tools/fetch_sources.py has not been run.
"""
import json
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import citations  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()


def pages(lo, hi, letters="abcde"):
    return [f"{p}{l}" for p in range(lo, hi + 1) for l in letters]


# The Stephanus sections of a few works, as the library has them (Timaeus 92 ends at c).
CORPUS = citations.Corpus.from_sections({
    "tlg030": pages(327, 621), "tlg031": pages(17, 91) + ["92a", "92b", "92c"], "tlg034": pages(624, 969),
    "tlg010": pages(11, 67), "tlg006": pages(142, 210), "tlg004": pages(57, 118), "tlg012": pages(227, 279),
    "tlg035": pages(973, 992),
}, books={"tlg030": [("IV", 419, 445), ("VI", 484, 511)]})


def read(text, work="tlg031"):
    return [(f["to_work"], f["to_ref"], f["certainty"]) for f in citations.read_refs(text, work, CORPUS)]


class Reading(unittest.TestCase):
    def test_title_and_page(self):
        self.assertEqual(read("See Republic 392 D, 398 A, 597 E foll."),
                         [("tlg030", "392d", "certain"), ("tlg030", "398a", "certain"), ("tlg030", "597e", "certain")])
        self.assertEqual(read("in Phaedo 100D he declines"), [("tlg004", "100d", "certain")])
        self.assertEqual(read("Cp. Rep. vi. 509 B."), [("tlg030", "509b", "certain")])
        self.assertEqual(read("Laws 892 A, B"), [("tlg034", "892a", "certain"), ("tlg034", "892b", "certain")])

    def test_ranges_and_line_numbers(self):
        self.assertEqual(read("see Philebus 26 E—28 E. Therefore"), [("tlg010", "26e", "certain"), ("tlg010", "28e", "certain")])
        self.assertEqual(read("Cf. Laws 665 B 7."), [("tlg034", "665b", "certain")])

    def test_bare_reference_is_the_notes_own_dialogue(self):
        self.assertEqual(read("compare 47 A, and"), [("tlg031", "47a", "certain")])
        self.assertEqual(read("Cp. IV. 435 D.", "tlg030"), [("tlg030", "435d", "certain")])
        self.assertEqual(read("see p. 51 D"), [])                       # a page of a book
        self.assertEqual(read("Athenaeus XI 507 D"), [])                # not a page of the Timaeus

    def test_greek_letters_read_by_the_ocr(self):
        self.assertEqual(read("compare Laws 795 Ε τῶν"), [("tlg034", "795e", "certain")])

    def test_archer_hinds_headings_are_not_citations(self):
        self.assertEqual(read("27 C—29 D, c. v. Timaeus, after due invocation"), [])
        self.assertEqual(read("in the Republic. 69 A—7o Ὁ, ¢. xxxi. Now"), [])

    def test_doubts_are_marked(self):
        f = citations.read_refs("cf. Zheaetetus 176 A ἀλλ᾽", "tlg031", CORPUS)
        self.assertEqual([(x["to_work"], x["to_ref"], x["certainty"]) for x in f], [("tlg006", "176a", "uncertain")])
        self.assertIn("Zheaetetus", f[0]["doubt"])
        self.assertEqual(read("Herodotus II 51 D says"), [("tlg031", "51d", "uncertain")])
        self.assertEqual(read("Cf. Timaeus 92 E"), [("tlg031", "92", "uncertain")])     # no section 92e
        self.assertEqual(read("Rep. IV. 509 B"), [("tlg030", "509b", "uncertain")])     # 509 is in book VI

    def test_a_number_after_another_title_may_be_the_notes_own(self):
        f = citations.read_refs("Laws 690 A ff. and 434 B.", "tlg030", CORPUS)
        self.assertEqual([(x["to_work"], x["to_ref"], x["certainty"]) for x in f],
                         [("tlg034", "690a", "certain"), ("tlg030", "434b", "uncertain")])
        self.assertIn("own dialogue", f[1]["doubt"])

    def test_no_such_page_is_kept_unresolved(self):
        self.assertEqual(read("cf. Republic 27 C, where"), [("tlg030", "27c", "unresolved")])

    def test_another_authors_book(self):
        self.assertEqual(read("Proclus in Tim. 3 E preserves them", "tlg030"), [])

    def test_dialogues_named(self):
        f = citations.read_refs("as it is said in the Phaedrus; and the Laws of Solon", "tlg031", CORPUS)
        self.assertEqual([(x["to_work"], x["to_ref"], x["kind"], x["certainty"]) for x in f],
                         [("tlg012", "", "dialogue", "certain"), ("tlg034", "", "dialogue", "uncertain")])
        self.assertEqual(read("as Plato says in the Timaeus"), [])     # the note's own dialogue
        self.assertEqual(read("see the Philebus 26 E"), [("tlg010", "26e", "certain")])  # a page, not just the name

    def test_short_abbreviations_need_a_stop_and_a_letter(self):
        self.assertEqual(read("R. 509 B"), [("tlg030", "509b", "certain")])
        self.assertEqual(read("R 509"), [])

    def test_excerpt(self):
        self.assertEqual(citations.excerpt("Compare Laws 781A and more.", "Laws 781A", 10), "…pare Laws 781A and…")


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        build_db.build(["tlg030", "tlg031"], db_path=cls.db_path)
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

    def test_every_link_names_its_note_and_how_sure_it_is(self):
        self.assertEqual(self.q("SELECT count(*) FROM link WHERE note_id IS NULL")[0][0], 0)
        self.assertEqual({r[0] for r in self.q("SELECT DISTINCT certainty FROM link")} - {"certain", "uncertain", "unresolved"}, set())
        self.assertEqual(self.q("SELECT count(*) FROM link WHERE certainty != 'certain' AND (doubt IS NULL OR doubt = '')")[0][0], 0)

    def test_the_commentaries_are_read(self):
        who = {r[0] for r in self.q("SELECT DISTINCT COALESCE(c.label, n.commentator) FROM link l JOIN note n ON n.id = l.note_id "
                                    "LEFT JOIN commentary c ON c.id = n.commentary_id")}
        for c in ("Archer-Hind (1888)", "Shorey (Loeb, 1935-37)", "Bury (Loeb, 1929)", "Proclus, tr. Taylor (1820)"):
            self.assertIn(c, who)
        # Archer-Hind at Timaeus 18a: "in Republic 451 C—457 B".
        self.assertIn(("tlg030", "451c", "certain"), self.q(
            "SELECT l.to_work, l.to_ref, l.certainty FROM link l JOIN note n ON n.id = l.note_id WHERE n.commentary_id = 'archerhind1888' AND l.from_ref = '18a'"))

    def test_page_shows_what_cites_it(self):
        p = self.get("/api/page/tlg030/451")
        inn = [l for l in p["links_in"] if l["to_ref"] == "451c" and l["from_work"] == "tlg031"]
        self.assertTrue(inn)
        self.assertEqual(inn[0]["commentator"], "Archer-Hind (1888)")
        self.assertIn("451", inn[0]["excerpt"])
        out = self.get("/api/page/tlg031/18")["links_out"]
        self.assertTrue(any(l["to_work"] == "tlg030" and l["to_ref"] == "451c" and l["commentator"] == "Archer-Hind (1888)" for l in out))

    def test_most_discussed(self):
        d = self.get("/api/discussed?limit=20")
        n = [r["citations"] for r in d["rows"]]
        self.assertEqual(n, sorted(n, reverse=True))
        self.assertTrue(all(r["to_ref"] for r in d["rows"]))                  # passages, not dialogues named
        top = d["rows"][0]
        notes = {r["note_id"] for r in self.get(f"/api/cited/{top['to_work']}/{top['to_ref']}") if r["certainty"] == "certain" and r["to_ref"] == top["to_ref"]}
        self.assertEqual(len(notes), top["citations"])
        cross = self.get("/api/discussed?work=tlg030&cross=1&limit=5")["rows"]
        self.assertTrue(cross and all(r["to_work"] == "tlg030" for r in cross))
        by = self.get("/api/discussed?by=" + urllib.request.quote("Archer-Hind (1888)") + "&limit=5")["rows"]
        self.assertTrue(by and all(r["who"] == ["Archer-Hind (1888)"] for r in by))

    def test_dialogue_named_by_others(self):
        w = self.get("/api/work/tlg031")
        self.assertGreater(w["counts"]["cited_from_others"], 0)
        named = self.get("/api/cited/tlg030")
        self.assertTrue(named and all(r["to_ref"] == "" for r in named))


if __name__ == "__main__":
    unittest.main()
