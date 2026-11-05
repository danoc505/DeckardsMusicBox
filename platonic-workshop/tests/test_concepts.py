"""Tests for milestone 10: the concept index across the dialogues.

    python3 -m unittest discover -s tests -v

The file tests read what is committed (sources/concepts/, texts/ancient/,
texts/commentary/*/scholia-hermann.json). The library tests build all 36 works
into a temporary folder (a few minutes) and are skipped if tools/fetch_sources.py
has not been run.
"""
import json
import re
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import ancient  # noqa: E402
import build_db  # noqa: E402
import concepts  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()
ASKED = ["Good", "Beautiful", "Truth", "Being", "Becoming", "Forms", "Intellect", "Reason", "Soul", "Demiurge", "One and the Many",
         "Participation", "Emanation", "Return", "Knowledge", "Opinion", "Ignorance", "Virtue", "Justice", "Evil as privation",
         "Image and original", "Ascent", "intelligible world", "sensible world", "Recollection"]


def evidence_of(c):
    """Every quotation a concept offers, with where it is from."""
    out = [dict(e, part="definitions") for e in c["definitions"]] + [dict(e, part="later") for e in c["later"]]
    for p in c["passages"]:
        out.append({"source": "plato", "work": p["work"], "ref": p["start"], "quote": p["quote"], "part": "passages"})
        out += [dict(e, part="read_by") for e in p.get("read_by", [])]
    for r in c["related"]:
        out += [dict(e, part="related") for e in r["evidence"]]
    return out


class Files(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = concepts.load()
        cls.docs = {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in ancient.OUT.glob("*.json")}

    def test_the_twenty_five_concepts_asked_for(self):
        labels = [c["label"] for c in self.d["concepts"]]
        self.assertEqual(len(labels), 25)
        for a in ASKED:
            self.assertTrue(any(a.lower() in l.lower() for l in labels), a)

    def test_every_record_is_complete(self):
        ids = {c["id"] for c in self.d["concepts"]} | {r["concept"] for k in ("definitions", "taylor_terms") for r in concepts.load_defined()[k]}
        for c in self.d["concepts"]:
            for k in ("id", "label", "greek", "layer", "note", "terms", "keywords", "definitions", "passages", "later", "related"):
                self.assertIn(k, c, f"{c['id']}: {k}")
            self.assertIn(c["layer"], concepts.LAYERS)
            self.assertTrue(c["passages"], c["id"])
            for p in c["passages"]:
                self.assertTrue(p["why"] and p["quote"], c["id"])
            for r in c["related"]:
                self.assertIn(r["concept"], ids)
                self.assertNotEqual(r["concept"], c["id"])
                self.assertTrue(r["evidence"], f"{c['id']} -> {r['concept']}: a relation needs words to rest on")
            for e in evidence_of(c):
                self.assertTrue(e["quote"].strip(), c["id"])
                if e["part"] in ("definitions", "later"):
                    self.assertTrue(e.get("says"), c["id"])

    def test_later_doctrines_say_who_reads_plato_so(self):
        # A doctrine Plato does not name: its passages are later readings, and each says whose.
        for c in self.d["concepts"]:
            if c["layer"] == "later":
                self.assertTrue(c["later"], c["id"])
                self.assertTrue(any(p.get("read_by") for p in c["passages"]) or c["id"] == "return", c["id"])

    def test_every_quotation_from_an_ancient_text_or_taylor_is_there(self):
        terms = [s["text"] for s in json.loads(concepts.TERMS.read_text(encoding="utf-8"))["segments"] if s.get("part") == "text"]
        missing = []
        for c in self.d["concepts"]:
            for e in evidence_of(c):
                if e["source"] in self.docs:
                    doc = self.docs[e["source"]]
                    if doc["lang"] == "grc":
                        doc = dict(doc, sections=[dict(s, text=s["text"].replace("ϑ", "θ")) for s in doc["sections"]])
                    if not ancient.find(doc, e["quote"]):
                        missing.append((c["id"], e["source"], e["quote"]))
                elif e["source"] == "taylor-terms":
                    if not any(concepts.eng(e["quote"]) in concepts.eng(t) for t in terms):
                        missing.append((c["id"], e["source"], e["quote"]))
                else:
                    self.assertIn(e["source"], ("plato", "note"))
        self.assertEqual(missing, [])

    def test_every_relation_has_a_category_and_all_seven_are_used(self):
        cats = self.d["categories"]
        prompt = ["shared concept", "philosophical analogy", "different formulation", "historical interpretation",
                  "apparent contradiction", "metaphysical distinction", "allegorical parallel"]
        self.assertEqual(list(cats)[:7], prompt)
        used = {r["category"] for c in self.d["concepts"] for r in c["related"]}
        self.assertTrue(set(prompt) <= used, set(prompt) - used)
        self.assertTrue(used <= set(cats))

    def test_the_words_compared_across_translators(self):
        cw = self.d["compared_words"]
        self.assertEqual(cw["named_in_prompt"], ["λόγος", "νόος", "ψυχή", "ἀγαθός", "εἶδος", "ἀρετή"])
        self.assertGreater(len(cw["more"]), 20)

    def test_the_terms_the_sources_define(self):
        x = concepts.load_defined()
        self.assertGreater(len(x["definitions"]), 170)
        self.assertGreater(len(x["taylor_terms"]), 60)
        segs = {s["id"] for s in json.loads(concepts.TERMS.read_text(encoding="utf-8"))["segments"]}
        for r in x["taylor_terms"]:
            self.assertIn(r["segment"], segs)
        pages = {s["n"]: s["text"] for s in self.docs["definitions-burges"]["sections"]}
        greek = " ".join(s["text"] for s in self.docs["definitions-hermann"]["sections"]).replace("ϑ", "θ")
        for r in x["definitions"]:
            self.assertIn(r["english"], pages[str(r["page"])])
            if r["greek"]:
                self.assertIn(r["greek"], greek)

    def test_later_platonists_are_quoted_from_their_books(self):
        x = concepts.load_defined()
        texts = {k: [concepts.eng(concepts.book_text(f)) for f in b["files"]] for k, b in x["books"].items()}
        self.assertEqual(set(texts), {"plotinus-taylor-1817", "proclus-theology-taylor-1816", "iamblichus-taylor-1821"})
        for r in x["later"]:
            self.assertTrue(any(concepts.eng(r["quote"]) in t for t in texts[r["source"]]), r["quote"])

    def test_keywords_are_not_the_links(self):
        # Keywords only find notes on a concept's own passages; they never link passages to one another.
        for c in self.d["concepts"]:
            self.assertEqual(set(c["keywords"]) - {"en", "grc"}, set(), c["id"])

    def test_new_ancient_texts(self):
        al = self.docs["alcinous-burges"]
        self.assertEqual([s["n"] for s in al["sections"]], [str(n) for n in range(1, 35)])
        self.assertIn("eternal pattern of things existing according to Nature", ancient.find(al, "eternal pattern of things")["text"])
        dh = self.docs["definitions-hermann"]
        self.assertEqual([s["n"] for s in dh["sections"]], [str(n) for n in range(70, 81)])
        self.assertEqual(dh["lang"], "grc")
        db = self.docs["definitions-burges"]
        self.assertEqual([s["n"] for s in db["sections"]], [str(n) for n in range(123, 145)])

    def test_scholia_files(self):
        files = sorted((ROOT / "texts" / "commentary").glob("*/scholia-hermann.json"))
        self.assertGreaterEqual(len(files), 30)
        total, ids = 0, set()
        for f in files:
            d = json.loads(f.read_text(encoding="utf-8"))
            self.assertEqual(d["schema"], "platonic-workshop/commentary-v1")
            self.assertEqual(d["lang"], "grc")
            self.assertEqual(d["place_by"], "printed")
            for n in d["notes"]:
                self.assertNotIn(n["id"], ids)
                ids.add(n["id"])
                self.assertTrue(n["text"].strip(), n["id"])
                if n.get("page_steph"):
                    self.assertRegex(n["page_steph"], r"^\d{1,3}[a-e]?$")
                total += 1
        self.assertGreater(total, 1400)


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

    def get(self, path):
        with urllib.request.urlopen(self.base + path) as r:
            return json.loads(r.read())

    def q(self, sql, *a):
        return self.db.execute(sql, a).fetchall()

    def test_every_quotation_found(self):
        stats = json.loads(self.q("SELECT value FROM build WHERE key = 'concept_stats'")[0][0])
        self.assertEqual(stats["not found"], [])
        self.assertEqual(stats["terms not tagged"], [])
        self.assertEqual(stats["quotations"], stats["quotations found"])
        self.assertGreater(stats["quotations"], 200)
        self.assertEqual(self.q("SELECT count(*) FROM evidence WHERE owner LIKE 'concept:%' AND found IS NOT 1")[0][0], 0)

    def test_note_evidence_points_at_its_note(self):
        rows = self.q("SELECT e.quote, n.body, n.commentator FROM evidence e JOIN note n ON n.id = e.note_id WHERE e.owner LIKE 'concept:%' AND e.source_text = 'note'")
        self.assertGreater(len(rows), 5)
        for quote, body, who in rows:
            self.assertIn(concepts.eng(quote), concepts.eng(body), who)

    def test_named_notes_are_on_the_passage_and_use_the_word(self):
        rows = self.q("SELECT cn.word, n.body, n.start_ref, p.start_ref, p.end_ref, p.work_id, n.work_id FROM concept_named cn "
                      "JOIN note n ON n.id = cn.note_id JOIN concept_passage p ON p.concept_id = cn.concept_id AND p.n = cn.n")
        self.assertGreater(len(rows), 30)
        for word, body, ref, a, b, pw, nw in rows:
            self.assertEqual(pw, nw)
            self.assertTrue(word in body or word in concepts.grc(body), (word, ref))

    def test_the_index_holds_every_defined_term(self):
        n = self.q("SELECT count(*) FROM concept")[0][0]
        self.assertGreater(n, 180)
        self.assertEqual(self.q("SELECT layer FROM concept WHERE id = 'courage'")[0][0], "academy")
        self.assertEqual(self.q("SELECT layer FROM concept WHERE id = 'monad'")[0][0], "later")
        # A concept of concepts.json keeps its layer and gains the Definitions' entry.
        self.assertTrue(self.q("SELECT 1 FROM concept_cite c JOIN evidence e ON e.owner = c.owner WHERE c.concept_id = 'justice' AND e.source_text = 'definitions-burges'"))
        self.assertEqual(self.q("SELECT count(*) FROM concept_relation WHERE category NOT IN (SELECT name FROM concept_category)")[0][0], 0)

    def test_renderings(self):
        r = self.get("/api/renderings/" + urllib.parse.quote("ψυχή") + "?work=tlg004&limit=3")
        self.assertEqual(len(r["places"]), 3)
        self.assertIsNotNone(r["next"])
        p = r["places"][0]
        self.assertTrue(p["greek"] and p["forms"])
        self.assertTrue(any(f in p["greek"] for f in p["forms"]))
        self.assertGreaterEqual(len({e["edition_id"] for e in p["english"]}), 2)
        self.assertEqual([c["id"] for c in r["concepts"]], ["soul"])

    def test_api(self):
        idx = self.get("/api/concepts")
        self.assertGreater(len(idx["concepts"]), 180)
        self.assertEqual([w["lemma"] for w in idx["words"][:6]], ["λόγος", "νόος", "ψυχή", "ἀγαθός", "εἶδος", "ἀρετή"])
        good = self.get("/api/concept/the-good")
        self.assertEqual(good["layer"], "plato-later")
        self.assertTrue(any(p["work_id"] == "tlg030" and p["start_ref"] == "509b" for p in good["passages"]))
        self.assertTrue(all(e["found"] == 1 for p in good["passages"] for e in p["evidence"]))
        self.assertTrue(good["terms"][0]["by_work"])
        em = self.get("/api/concept/emanation")
        self.assertEqual(em["terms"], [])
        self.assertTrue(all(p["read_by"] for p in em["passages"]))
        self.assertTrue(any(e["note_id"] for p in em["passages"] for e in p["read_by_evidence"]))
        with self.assertRaises(urllib.error.HTTPError):
            self.get("/api/concept/no-such-thing")
        w = self.get("/api/work/tlg031")
        self.assertTrue(any(c["id"] == "demiurge" and c["start_ref"] == "28c" for c in w["concepts"]))

    def test_word_shows_its_concepts(self):
        tid = self.q("SELECT t.id FROM token t JOIN tag g ON g.token_id = t.id JOIN edition e ON e.id = t.edition_id "
                     "WHERE g.lemma = 'ἀνάμνησις' AND e.work_id = 'tlg024' LIMIT 1")[0][0]
        t = self.get(f"/api/token/{tid}")
        self.assertEqual([c["id"] for c in t["concepts"]], ["recollection"])


if __name__ == "__main__":
    unittest.main()
