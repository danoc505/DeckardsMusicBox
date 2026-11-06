"""Tests for milestone 12: the reconciliation worksheet, the one search box, and the frame.

    python3 -m unittest discover -s tests -v

The file tests read what is committed (sources/reconcile/, the reader). The
library tests build all 36 works into a temporary folder (a few minutes) and
are skipped if tools/fetch_sources.py has not been run.
"""
import json
import re
import sqlite3
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import find  # noqa: E402
import mywork  # noqa: E402
import reconcile  # noqa: E402
import serve  # noqa: E402

RAW = ROOT / "data" / "raw"
HAVE_DATA = (RAW / "perseus-greek-plato" / ".fetched.json").exists() and (RAW / "glaux-plato" / ".fetched.json").exists()
PROMPT_METHODS = ["allegorical", "ontological-distinction", "image-and-original", "participation", "privation",
                  "ascent-and-return", "psychological", "symbolic"]
NAV = ["Start here", "Library", "Reader", "Dictionary", "Concordance", "Concepts", "Glossary", "Reconciliations", "My Translations"]


def walk(x):
    if isinstance(x, dict):
        yield x
        for v in x.values():
            yield from walk(v)
    elif isinstance(x, list):
        for v in x:
            yield from walk(v)


class Files(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.methods = reconcile.load("methods.json")["methods"]
        cls.tensions = reconcile.load("tensions.json")["tensions"]
        cls.web = json.loads(reconcile.WEB_CHECKS.read_text(encoding="utf-8"))

    def test_the_methods_the_prompt_names_and_more(self):
        ids = [m["id"] for m in self.methods]
        self.assertEqual(len(ids), len(set(ids)))
        for m in PROMPT_METHODS:
            self.assertIn(m, ids)
        self.assertGreater(len(ids), len(PROMPT_METHODS))
        for m in self.methods:
            self.assertTrue(m["plain"] and m["grounds"], m["id"])
            self.assertEqual(bool(m.get("named_in_prompt")), m["id"] in PROMPT_METHODS, m["id"])

    def test_every_tension_is_complete(self):
        self.assertGreaterEqual(len(self.tensions), 10)
        method_ids = {m["id"] for m in self.methods}
        for t in self.tensions:
            for k in ("id", "title", "category", "question", "nature", "a", "b", "documented", "concepts", "readings"):
                self.assertTrue(t.get(k), f"{t['id']}: {k}")
            for p in [t["a"], t["b"], *t.get("more", [])]:
                self.assertTrue(p["greek"] and p["english"] and p["says"], t["id"])
            for r in t["readings"]:
                self.assertIn(r["method"], method_ids)
                self.assertIn(r["status"], reconcile.STATUSES)
                if r["status"] == "established":
                    self.assertTrue(r["evidence"], f"{t['id']}: an established reading rests on quoted words")
                else:
                    self.assertIn("Workshop", r["by"], f"{t['id']}: a proposal is labelled as the Workshop's")

    def test_no_reading_is_the_only_one(self):
        for t in self.tensions:
            self.assertGreaterEqual(len(t["readings"]), 2, t["id"])

    def test_every_web_quotation_and_author_was_found_on_its_page(self):
        quoted = reconcile.web_links()
        self.assertEqual(set(quoted), set(self.web))
        for url, qs in quoted.items():
            page = self.web[url]
            self.assertEqual(page["status"], 200, url)
            for q in qs:
                self.assertTrue(page["quotes"].get(q), f"{url}: {q[:60]}")
            self.assertTrue(page["authors"] and all(page["authors"].values()), url)

    def test_web_cites_name_their_authors(self):
        for x in walk([self.methods, self.tensions]):
            if x.get("source") == "web":
                self.assertRegex(x["cite"], r"^[A-Z][^,]+, '.+', Stanford Encyclopedia of Philosophy$")

    def test_norm_web(self):
        self.assertEqual(reconcile.norm_web("The _Republic_—and  “Laws”"), reconcile.norm_web("the republic-and \"laws\""))


class FindQueries(unittest.TestCase):
    def test_split_query(self):
        f, w, p = find.split_query('case:gen λόγος "the good" in:Rep cites:Tim 29e mine:')
        self.assertEqual(f, {"case": "gen", "in": "Rep", "cites": "Tim 29e", "mine": ""})
        self.assertEqual(w, ["λόγος"])
        self.assertEqual(p, ["the good"])

    def test_fold(self):
        self.assertEqual(find.fold("Ἐπέκεινα τῆς οὐσίας"), "επεκεινα τησ ουσιασ")

    def test_fts_query(self):
        self.assertEqual(find.fts_query(["Beyond"], ["the Good"]), '"beyond" "the good"')

    def test_snippet_marks_the_word(self):
        s = find.snippet("Lysis: λέγω τοίνυν, τὸ ἀγαθὸν", ["το"])
        self.assertIn("[[τὸ]]", s)
        self.assertNotIn("[[το]]ίνυν", s)


class Reader(unittest.TestCase):
    def test_primary_navigation_and_display_controls(self):
        shell = (ROOT / "reader" / "shell.js").read_text(encoding="utf-8")
        labels = re.findall(r'\["\w+", "([^"]+)", ', shell)
        self.assertEqual(labels[:len(NAV)], NAV)
        html = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        for needle in ('id="theme-btn"', 'data-size="up"', 'data-size="down"', 'data-resize="toc"', 'data-resize="insp"', 'id="find-q"',
                       'src="reconcile.js"', 'src="shell.js"'):
            self.assertIn(needle, html)
        css = (ROOT / "reader" / "reader.css").read_text(encoding="utf-8")
        self.assertIn(':root[data-theme="dark"]', css)
        self.assertIn(':root:not([data-theme="light"])', css)

    def test_every_button_has_a_handler(self):
        """No inert controls: every id'd button in the page is handled somewhere in the JavaScript."""
        html = (ROOT / "reader" / "index.html").read_text(encoding="utf-8")
        js = "".join(p.read_text(encoding="utf-8") for p in (ROOT / "reader").glob("*.js"))
        for bid in re.findall(r'<button[^>]*id="([^"]+)"', html):
            self.assertIn("#" + bid, js, bid)


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

    def send(self, method, path, data):
        req = urllib.request.Request(self.base + path, data=json.dumps(data).encode(), method=method,
                                     headers={"Content-Type": "application/json", "Host": f"127.0.0.1:{self.srv.server_address[1]}"})
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read())

    def find(self, q):
        return self.get("/api/find?q=" + urllib.parse.quote(q))

    def q(self, sql, *a):
        return self.db.execute(sql, a).fetchall()

    # -------------------------------------------------- the records

    def test_every_quotation_found(self):
        stats = json.loads(self.q("SELECT value FROM build WHERE key = 'reconcile_stats'")[0][0])
        self.assertEqual(stats["not found"], [])
        self.assertEqual(stats["not checked"], [])
        self.assertEqual(stats["words not tagged"], [])
        self.assertEqual(stats["quotations"], stats["quotations found"])
        self.assertEqual(self.q("SELECT count(*) FROM evidence WHERE (owner LIKE 'reconcile:%' OR owner LIKE 'method:%') AND found IS NOT 1")[0][0], 0)

    def test_each_passage_has_greek_and_english(self):
        for tid, n, owner in self.q("SELECT tension_id, n, owner FROM reconcile_passage"):
            kinds = {r[0] for r in self.q("SELECT source_text FROM evidence WHERE owner = ?", owner)}
            self.assertEqual(kinds, {"plato", "translation"}, f"{tid} {n}")

    def test_a_record_through_the_api(self):
        t = self.get("/api/reconcile/soul-simple-or-in-parts")
        self.assertEqual([p["work_id"] for p in t["passages"]][:2], ["tlg004", "tlg030"])
        self.assertTrue(t["documented"])
        w = t["passages"][0]["words"][0]
        self.assertEqual(w["lemma"], "μονοειδής")
        lsj = next(d for d in w["dictionary"] if d["lexicon"] == "lsj")
        self.assertIn("78d", lsj["cites_here"])  # LSJ cites the Phaedo passage itself
        self.assertTrue(t["passages"][0]["notes"])
        statuses = {r["status"] for r in t["readings"]}
        self.assertEqual(statuses, {"established", "proposed"})
        retrieved = {m["id"]: m["because"] for m in t["methods"] if m["retrieved"]}
        self.assertIn("ontological-distinction", retrieved)
        self.assertTrue(any("concept" in b for bs in retrieved.values() for b in bs), "a method retrieved from the concepts")

    def test_methods_retrieved_for_a_passage(self):
        a = self.get("/api/applicable/tlg030/509b")
        self.assertIn("good-beyond-being", [t["id"] for t in a["tensions"]])
        self.assertTrue(a["methods"] and all(m["because"] for m in a["methods"]))
        w = self.get("/api/work/tlg030")
        self.assertIn("good-beyond-being", {t["id"] for t in w["tensions"]})

    # -------------------------------------------------- worksheets and your methods

    def test_worksheet_keeps_every_version(self):
        st, s = self.send("POST", "/api/sheets", {"title": "Test reading", "tension_id": "forms-made-by-god",
                                                  "passages": [{"work": "tlg030", "start_ref": "597b", "end_ref": "597d"}],
                                                  "methods": ["symbolic"], "interpretation": "first", "rendering": "a bed in nature"})
        self.assertEqual(st, 201, s)
        st, s2 = self.send("PUT", f"/api/mine/reconciliation/{s['id']}", {**s["sheet"], "title": "Test reading", "tension_id": "forms-made-by-god",
                                                                          "interpretation": "second", "status": "proposal", "base_rev": 1})
        self.assertEqual((st, s2["rev"]), (200, 2))
        st, stale = self.send("PUT", f"/api/mine/reconciliation/{s['id']}", {"title": "Other tab", "base_rev": 1})
        self.assertEqual(st, 409)
        hist = self.get(f"/api/mine/reconciliation/{s['id']}/history")["revisions"]
        self.assertEqual([json.loads(h["body"])["interpretation"] for h in hist], ["first", "second"])
        st, d = self.send("POST", f"/api/mine/reconciliation/{s['id']}/delete", {"base_rev": 2})
        self.assertTrue(d["deleted_at"])
        st, r = self.send("POST", f"/api/mine/reconciliation/{s['id']}/restore", {"base_rev": 3, "rev": 1})
        self.assertEqual((r["deleted_at"], r["sheet"]["interpretation"]), (None, "first"))
        t = self.get("/api/reconcile/forms-made-by-god")
        self.assertIn(s["id"], [x["id"] for x in t["sheets"]])
        md = urllib.request.urlopen(self.base + "/api/export/my-plato.md").read().decode()
        self.assertIn("### Test reading", md)
        self.assertIn("Symbolic interpretation", md)
        js = self.get("/api/export/my-plato.json")
        self.assertEqual(len(next(x for x in js["reconciliations"] if x["id"] == s["id"])["revisions"]), 4)

    def test_worksheet_refuses_what_is_not_there(self):
        for bad in ({"title": ""}, {"title": "x", "tension_id": "nope"}, {"title": "x", "methods": ["nope"]},
                    {"title": "x", "passages": [{"work": "tlg030", "start_ref": "999z"}]}, {"title": "x", "status": "the answer"}):
            st, r = self.send("POST", "/api/sheets", bad)
            self.assertEqual(st, 400, bad)

    def test_your_own_method_needs_a_citation(self):
        st, r = self.send("POST", "/api/my-methods", {"title": "Irony", "plain": "Socrates means the opposite"})
        self.assertEqual(st, 400)
        st, m = self.send("POST", "/api/my-methods", {"title": "Irony", "plain": "Socrates means the opposite",
                                                      "citation": "Quintilian, Institutio Oratoria 9.2.44", "concepts": ["knowledge"]})
        self.assertEqual(st, 201, m)
        st, s = self.send("POST", "/api/sheets", {"title": "With my method", "methods": [m["id_ref"]]})
        self.assertEqual(st, 201, s)
        t = self.get("/api/reconcile/knowledge-and-true-opinion")
        self.assertTrue(any(x["id"] == m["id"] and x["retrieved"] for x in t["my_methods"]))

    # -------------------------------------------------- the one search box

    def assert_why(self, r):
        self.assertTrue(r["groups"])
        for g in r["groups"]:
            for x in g["results"]:
                self.assertTrue(x["why"], x)

    def test_greek_word_by_lemma_with_morphology(self):
        all_ = self.find("lemma:λόγος in:Tim")
        gen = self.find("lemma:λόγος case:gen in:Tim")
        n_all, n_gen = all_["groups"][0]["total"], gen["groups"][0]["total"]
        self.assertTrue(0 < n_gen < n_all)
        n_tagged = self.q("SELECT count(DISTINCT g.token_id) FROM tag g JOIN token t ON t.id = g.token_id JOIN edition e ON e.id = t.edition_id "
                          "WHERE g.lemma = 'λόγος' AND g.postag LIKE '_______g_' AND e.work_id = 'tlg031'")[0][0]
        self.assertEqual(n_gen, n_tagged)
        self.assertIn("genitive", gen["groups"][0]["results"][0]["why"])
        self.assert_why(gen)

    def test_greek_text_and_english_and_notes(self):
        r = self.find("ἐπέκεινα")
        kinds = {g["kind"] for g in r["groups"]}
        self.assertTrue({"word", "greek"} <= kinds, kinds)
        r = self.find('"beyond being"')
        self.assertIn("note", {g["kind"] for g in r["groups"]})
        r = self.find('translator:Jowett "idea of good"')
        eng = next(g for g in r["groups"] if g["kind"] == "english")
        self.assertTrue(all("Jowett" in x["why"] for x in eng["results"]))
        self.assert_why(r)

    def test_passage_and_cross_references(self):
        r = self.find("Rep. 509b")
        kinds = [g["kind"] for g in r["groups"]]
        self.assertEqual(kinds[0], "passage")
        self.assertIn("cites", kinds)
        self.assertNotIn("names", kinds)
        r = self.find("cites:Tim 29e")
        self.assertTrue(all(re.search(r"read as Timaeus 29e? ", x["why"]) for x in r["groups"][0]["results"]))  # the section, or its page

    def test_names_concepts_reconciliation_and_methods(self):
        self.assertIn("names", {g["kind"] for g in self.find("Archer-Hind")["groups"]})
        self.assertIn("concept", {g["kind"] for g in self.find("demiurge")["groups"]})
        r = self.find("method:symbolic")
        tens = next(g for g in r["groups"] if g["kind"] == "tension")
        self.assertTrue(all("Symbolic" in x["why"] for x in tens["results"]))
        self.assertIn("tension", {g["kind"] for g in self.find("Taurus")["groups"]})

    def test_your_work_is_searched(self):
        self.send("POST", "/api/sheets", {"title": "Peculiar zebra reading", "interpretation": "zebra"})
        r = self.find("zebra mine:")
        self.assertEqual([g["kind"] for g in r["groups"]], ["mine"])

    def test_bad_queries_say_why(self):
        for q in ("", "lemma:λόγος mood:xyz", "cites:nowhere", "in:Nothingus soul"):
            with self.assertRaises(urllib.error.HTTPError) as e:
                self.find(q)
            self.assertEqual(e.exception.code, 400)


if __name__ == "__main__":
    unittest.main()
