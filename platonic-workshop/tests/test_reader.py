"""Tests for milestones 2 and 3: the library database and the reader's API.

    python3 -m unittest discover -s tests -v

The helper tests always run. The database and server tests build the Timaeus
into a temporary folder from the real downloaded sources, and are skipped if
tools/fetch_sources.py has not been run.
"""
import json
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import greek  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = all((RAW / s / ".fetched.json").exists() for s in (
    "perseus-greek-plato", "glaux-plato", "morpheus-analyses", "lsj", "middle-liddell",
    "lsj-abbreviations", "smyth-grammar", "agdt-guidelines"))
NS = 'xmlns="http://www.tei-c.org/ns/1.0"'


class Helpers(unittest.TestCase):
    def test_from_betacode_round_trips(self):
        for word in ["ἀγαθός", "Ἀθηναῖος", "ψυχῇ", "ῥηθέντων", "ΐ", "Ἥλιος", "δημιουργός"]:
            self.assertEqual(greek.from_betacode(greek.to_betacode(word)), word)
        self.assertEqual(greek.from_betacode("yu_xh/"), "ψυχή")  # length marks dropped
        self.assertEqual(greek.from_betacode("ei)=mi1"), "εἶμι")  # homonym digit dropped

    def test_decode_postag(self):
        self.assertEqual(greek.decode_postag("n-s---fn-"),
                         [("part of speech", "noun"), ("number", "singular"), ("gender", "feminine"), ("case", "nominative")])

    def test_morpheus_agrees(self):
        dat_pl_m = greek.decode_postag("p-p---md-")
        self.assertTrue(greek.morpheus_agrees("masc dat pl", dat_pl_m))
        self.assertTrue(greek.morpheus_agrees("masc/neut dat pl (attic)", dat_pl_m))
        self.assertFalse(greek.morpheus_agrees("neut dat pl", dat_pl_m))
        self.assertFalse(greek.morpheus_agrees("adverbial", dat_pl_m))
        mp = greek.decode_postag("v3spie---")
        self.assertTrue(greek.morpheus_agrees("pres ind mp 3rd sg", mp))

    def test_align_handles_split_words(self):
        ours = ["οὐδὲ", "γὰρ", "ἂν", "εἴη"]
        theirs = ["οὐ", "-δὲ", "γὰρ", "ἂν", "εἴη"]
        pairs = build_db.align(ours, theirs)
        self.assertEqual(pairs[0], ([0, 1], "split-word"))
        self.assertEqual(pairs[1], ([2], "same-form"))

    def test_align_leaves_unmatched_words_untagged(self):
        pairs = build_db.align(["αὖ", "πέρι", "λέγω"], ["λέγω"])
        self.assertEqual(set(pairs), {2})

    def test_refs(self):
        self.assertEqual([r for r, _ in build_db._refs("892 A, B, 896 C ff.")], ["892a", "892b", "896c"])
        self.assertEqual([r for r, _ in build_db._refs("676 ff.")], ["676"])

    def test_note_links(self):
        el = ET.fromstring(f'<note {NS}>Cf. 37 A ff., 42 C; <title>Rep</title>. 509 B, D; Eurip.<title>Ion</title>413 ff.; Hom.<title>Il</title>. ii. 547.</note>')
        got = [(w, r) for w, r, _ in build_db.note_links(el, "34a")]
        self.assertEqual(got, [("tlg031", "37a"), ("tlg031", "42c"), ("tlg030", "509b"), ("tlg030", "509d")])

    def test_walker_splits_paragraphs_at_sections_and_places_notes(self):
        xml = f'''<TEI {NS}><text><body><div>
          <p><said who="#Σωκράτης"><milestone unit="section" resp="Stephanus" n="17a"/><label>ΣΩ.</label> εἷς, δύο,
             <milestone unit="section" resp="Stephanus" n="17b"/>τρεῖς<note resp="Loeb">a note</note> καί <del>τὸν</del></said></p>
        </div></body></text></TEI>'''
        w = build_db.Walker(ET.fromstring(xml))
        self.assertEqual(w.order, ["17a", "17b"])
        self.assertEqual([(c["section"], c["para"], c["label"], c["text"]) for c in w.chunks],
                         [("17a", 1, "ΣΩ.", "εἷς, δύο,"), ("17b", 1, None, "τρεῖς καί [τὸν]")])
        n = w.notes[0]
        self.assertEqual((n["section"], n["chunk"]), ("17b", 1))
        self.assertEqual(w.chunks[1]["text"][:n["offset"]], "τρεῖς")


@unittest.skipUnless(HAVE_DATA, "run tools/fetch_sources.py first")
class Library(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.db_path = Path(cls.tmp.name) / "workshop.sqlite"
        cls.user_path = Path(cls.tmp.name) / "user.sqlite"
        stats = build_db.build(["tlg031"], db_path=cls.db_path)
        cls.stats, cls.lookup_stats = stats[0], stats[-1]
        build_db.ensure_user_db(cls.user_path)
        cls.db = sqlite3.connect(cls.db_path)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.tmp.cleanup()

    def q(self, sql, *args):
        return self.db.execute(sql, args).fetchall()

    def test_every_section_has_greek_and_english(self):
        self.assertEqual(self.stats["sections"], 364)
        for lang in ("grc", "eng"):
            n = self.q("SELECT count(DISTINCT section_ref) FROM chunk c JOIN edition e ON e.id = c.edition_id WHERE e.lang = ?", lang)[0][0]
            self.assertEqual(n, 364, lang)

    def test_tokens_cover_the_text_exactly(self):
        for cid, text in self.q("SELECT id, text FROM chunk WHERE edition_id LIKE '%grc%' AND id % 37 = 0"):
            for form, start, end in self.q("SELECT form, start, end FROM token WHERE chunk_id = ?", cid):
                self.assertEqual(greek.nfc(text[start:end]), form)

    def test_nearly_every_word_is_tagged_and_labelled_machine(self):
        self.assertGreater(self.stats["tagged"] / self.stats["tokens"], 0.995)
        self.assertEqual(self.q("SELECT DISTINCT analysis FROM tag"), [("auto",)])

    def test_every_row_names_a_source(self):
        for table in ("edition", "tag", "morph", "division", "note", "link"):
            orphans = self.q(f"SELECT count(*) FROM {table} WHERE source_id NOT IN (SELECT id FROM source)")[0][0]
            self.assertEqual(orphans, 0, table)
        self.assertEqual(self.q("SELECT count(*) FROM source WHERE provenance = ''")[0][0], 0)

    def test_notes_and_links(self):
        self.assertGreaterEqual(self.stats["notes"], 184)
        self.assertEqual(self.q("SELECT count(*) FROM note WHERE proof_status = '' OR anchor_method = ''")[0][0], 0)
        # Bury's note at 17c: "See Rep. 369 E ff., 374 E ff."
        self.assertIn(("tlg030", "369e"), self.q("SELECT to_work, to_ref FROM link WHERE from_ref = '17c'"))

    def test_user_db_is_separate_and_untouched_by_rebuild(self):
        u = sqlite3.connect(self.user_path)
        u.execute("INSERT INTO user_note (work_urn, start_ref, end_ref, body, created_at, updated_at) VALUES (?,?,?,?,?,?)",
                  ("urn:cts:greekLit:tlg0059.tlg031", "29e", "29e", "test", "now", "now"))
        u.commit()
        build_db.ensure_user_db(self.user_path)
        self.assertEqual(u.execute("SELECT body FROM user_note").fetchall(), [("test",)])
        u.close()

    # ---------------------------------------------------------- milestone 3

    def test_dictionary_coverage_of_tagged_lemmas(self):
        for lex, floor in (("lsj", 0.97), ("middle-liddell", 0.88)):
            total, hit = self.q(
                "SELECT count(*), sum(EXISTS(SELECT 1 FROM lemma_entry le WHERE le.lemma = g.lemma AND le.lexicon_id = ?)) "
                "FROM (SELECT DISTINCT lemma FROM tag) g", lex)[0]
            self.assertGreater(hit / total, floor, lex)

    def test_entries_are_the_dictionaries_own(self):
        rows = dict(self.q("SELECT e.lexicon_id, e.key FROM lemma_entry le JOIN lex_entry e ON e.id = le.entry_id WHERE le.lemma = 'ψυχή'"))
        self.assertEqual(rows, {"lsj": "yuxh/", "middle-liddell": "yuxh/"})
        html = self.q("SELECT html FROM lex_entry WHERE lexicon_id = 'lsj' AND key = 'dhmiourgo/s'")[0][0]
        self.assertIn("one who works for the people, skilled workman, handicraftsman", html)
        self.assertEqual(self.q("SELECT count(*) FROM lex_entry WHERE html LIKE '%<script%' OR html LIKE '%TEIform%'")[0][0], 0)

    def test_lsj_abbreviations_from_lsj_itself(self):
        a = dict(self.q("SELECT abbr, expansion FROM abbreviation WHERE list = 'I work' AND author_abbr = 'Pl.'"))
        self.assertEqual(a["Ti."], "Timaeus")
        self.assertEqual(self.q("SELECT expansion FROM abbreviation WHERE list = 'I author' AND abbr = 'Pl.'"), [("Plato",)])
        self.assertEqual(self.q("SELECT expansion FROM abbreviation WHERE list = 'V general' AND abbr = 'metaph.'"),
                         [("metaphorically, metaphorical",)])
        self.assertGreater(self.lookup_stats["lsj"]["abbreviations_marked"], 200000)
        # LSJ cites the Timaeus often enough that its citations must be followable.
        n = self.q("SELECT count(*) FROM lex_entry WHERE lexicon_id = 'lsj' AND html LIKE '%data-work=\"tlg031\" data-ref=\"__%'")[0][0]
        self.assertGreater(n, 500)

    def test_grammar_notes_quote_smyth(self):
        rows = self.q("SELECT section, rule_html, source_id FROM grammar_note WHERE category = 'tense' AND value = 'aorist'")
        self.assertEqual(rows[0][0], "1923")
        self.assertIn("The aorist expresses the mere occurrence of an action in the past", rows[0][1])
        self.assertEqual(rows[0][2], "smyth-grammar")
        self.assertEqual(self.q("SELECT name FROM relation_label WHERE code = 'SBJ'"), [("subject",)])
        # Every relation GLAUx uses in the Timaeus is either defined or explained as GLAUx's own.
        used = {r[0].partition("_")[0] for r in self.q("SELECT DISTINCT relation FROM tag WHERE relation != ''")}
        known = {r[0] for r in self.q("SELECT code FROM relation_label")}
        self.assertLessEqual(used - known, {"UNLINKED", "CO", ""})

    def test_new_rows_name_a_source(self):
        for table in ("lexicon", "abbreviation", "grammar_note", "relation_label"):
            orphans = self.q(f"SELECT count(*) FROM {table} WHERE source_id NOT IN (SELECT id FROM source)")[0][0]
            self.assertEqual(orphans, 0, table)

    def test_api(self):
        lib = serve.Library(self.db_path, self.user_path)
        srv = serve.make_server(port=0, library=lib)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{srv.server_address[1]}"

        def get(path):
            with urllib.request.urlopen(base + path) as r:
                return json.loads(r.read()) if path.startswith("/api") else r.read().decode()
        try:
            w = get("/api/work/tlg031")
            self.assertEqual((w["sections"][0], w["sections"][-1]), ("17a", "92c"))
            p = get("/api/page/tlg031/29")
            self.assertEqual([s["ref"] for s in p["sections"]], ["29a", "29b", "29c", "29d", "29e"])
            self.assertEqual((p["prev"], p["next"]), (28, 30))
            tok = next(t for t in p["tokens"] if t["form"] == "συνέστησεν")
            t = get(f"/api/token/{tok['id']}")
            self.assertEqual(t["tags"][0]["lemma"], "συνίστημι")
            self.assertTrue(any(m["matches_tag"] for m in t["morph"]))
            self.assertTrue(t["address"].endswith(":29e@συνέστησεν[1]"))
            # Milestone 3: the word box's dictionary and grammar.
            b = get(f"/api/token/{next(x for x in p['tokens'] if x['form'] == 'ἐβουλήθη')['id']}")
            self.assertEqual(b["lookup"][0]["lemma"], "βούλομαι")
            self.assertEqual([e["key"] for e in b["lookup"][0]["entries"]["lsj"]], ["bou/lomai"])
            aorist = next(n for n in b["grammar"][0]["notes"] if n["value"] == "aorist")
            self.assertEqual(aorist["smyth"][0]["section"], "1923")
            self.assertEqual(b["grammar"][0]["role"]["label"]["name"], "predicate")
            look = get("/api/lookup/" + urllib.parse.quote("ἔργον"))
            self.assertTrue(look["entries"]["lsj"] and look["entries"]["middle-liddell"])
            self.assertEqual([x["id"] for x in get("/api/lexica")], ["middle-liddell", "lsj"])
            self.assertIn("reader.js", get("/"))
            with self.assertRaises(urllib.error.HTTPError):
                get("/../tools/serve.py")
        finally:
            srv.shutdown()
            srv.server_close()
            lib.db.close()
            lib.user.close()


if __name__ == "__main__":
    unittest.main()
