"""Tests for milestone 27, sessions 3 and 4: Proclus on the First Alcibiades (the prologue, and his notes on the wording of the
dialogue's opening words), proofread from the page images
(tools/proofread.py, sources/neoplatonists/proofread/) and put into the Workshop's modern English, checked against
Taylor's Introduction and notes to the dialogue (tools/modern_neo.py), and shown in the reader (reader/neo.js, #neo-modern/).

    python3 -m unittest tests.test_proclus_alcibiades -v

The file tests always run; the server and browser tests need data/workshop.sqlite (python3 tools/build_db.py),
the browser test Node and Playwright too. Each is skipped without what it needs.
"""
import json
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import build_db  # noqa: E402
import modern  # noqa: E402
import modern_neo  # noqa: E402
import mywork  # noqa: E402
import neoplatonists  # noqa: E402
import proofread  # noqa: E402

MOD = ROOT / "sources" / "translations" / "modern"
TID = "proclus-alcibiades"

# Where Proclus quotes or recalls Plato, as the notes say: (paragraph, Plato's work, sections, words of the note,
# words of Proclus' proofread Greek, words of Burnet's Greek), Greek without accents.
PLATO = [
    ("Pr.1.p2", "tlg031", ["30a"], "Timaeus (30a)", "τω αριστω δραν αλλο τι πλην το καλλιστον", "τω αριστω δραν αλλο πλην το καλλιστον"),
    ("Pr.3.p2", "tlg004", ["85b"], "Phaedo (85b)", "των κυκνων ομοδουλοσ", "ομοδουλοσ τε ειναι των κυκνων"),
    ("Pr.4.p1", "tlg012", ["229e", "230a"], "Phaedrus (229e-230a)", "εμαυτον αγνοουντα", "αγνοουντα"),
    ("Pr.2.p2", "tlg024", ["98a"], "Meno (98a)", "τοισ τησ αιτιασ λογισμοισ", "αιτιασ λογισμω"),
    ("Pr.5.p3", "tlg004", ["99b"], "Phaedo (99b)", "ων ουκ ανευ", "ανευ ου"),
    ("103a.1.p1", "tlg013", ["103a"], "Alcibiades I, 103a", "ω παι κλεινιου, οιμαι σε θαυμαζειν", "ω παι κλεινιου, οιμαι σε θαυμαζειν"),
    ("103a.6.p2", "tlg012", ["253a"], "Phaedrus (253a)", "επαντλουντεσ", "επαντλουντεσ"),
    ("103a.7.p3", "tlg012", ["246e"], "Phaedrus (246d-e)", "αισχρω δε και κακω και τοισ εναντιοισ φθινει τε και διολλυται",
     "αισχρω δε και κακω και τοισ εναντιοισ φθινει τε και διολλυται"),
    ("103a.3.p2", "tlg031", ["29b"], "29b-c", "ων υπαρχουσιν εξηγηται", "ωνπερ εισιν εξηγηται"),
    ("103a.2.p1", "tlg013", ["133c"], "Alcibiades I 133c", "το θειον απαν", "παν το θειον"),
    ("103a.8.p2", "tlg011", ["202d"], "Symposium (202d-e)", "δαιμονα μεγαν", "δαιμων μεγασ"),
    ("103a.10.p2", "tlg012", ["265c"], "Phaedrus (265c)", "των καλων παιδων εφορου", "καλων παιδων εφορον"),
    ("103a.11.p2", "tlg008", ["273d", "273e"], "Statesman (273d-e)", "τησ ανομοιοτητοσ ποντον", "τησ ανομοιοτητοσ απειρον οντα ποντον"),
    ("103a.12.p3", "tlg013", ["131c"], "131c-d", "τησ ωρασ", "επειδη ληγει ανθουν"),
    ("103a.12.p4", "tlg011", ["183e"], "Symposium (183e)", "μονιμω πραγματι", "ουδε μονιμου ερων πραγματοσ"),
    ("103a.13.p2", "tlg013", ["131e"], "131c-e", "μονοσ εραστησ αλκιβιαδου", "αλλʼ η εισ μονοσ"),
    ("103a.13.p2", "tlg007", ["254a", "254b"], "Sophist (254a-b)", "ομματα καρτερειν", "ομματα καρτερειν προσ το θειον αφορωντα αδυνατα"),
    ("103a.16.p1", "tlg004", ["107d"], "Phaedo (107d)", "ωσπερ ζωντα ειληχει", "οσπερ ζωντα ειληχει"),
    ("103a.16.p2", "tlg002", ["31d"], "Apology (31d)", "φωνησ εδοκει τινοσ", "φωνη τισ γιγνομενη"),
    ("103a.17.p1", "tlg006", ["155d"], "Theaetetus (155d)", "την ιριν θαυμαντοσ", "την ιριν θαυμαντοσ εκγονον"),
    ("103a.18.p1", "tlg030", ["588c"], "Republic's image of the appetites (588c-e)", "πολυκεφαλω θηριω", "θηριου ποικιλου και πολυκεφαλου"),
    ("103a.18.p2", "tlg031", ["42c"], "Timaeus (42c)", "τον πολυν οχλον, τον εκ τησ γενεσεωσ υστερον προσφυντα", "τον πολυν οχλον και υστερον προσφυντα"),
    ("103a.21.p3", "tlg012", ["244d"], "Phaedrus' (244d)", "η μεν εστι σωφροσυνησ κρειττων", "μανιαν σωφροσυνησ την εκ θεου"),
    ("103a.24.p1", "tlg031", ["30d"], "(30d)", "το των νοητων εστι καλλιστον", "τω γαρ των νοουμενων καλλιστω"),
    ("103a.26.p1", "tlg013", ["103a"], "Alcibiades I, 103a", "οχλου εγενοντο σοι διαλεγομενοι, εγω δε τοσουτων ετων ουδε προσειπον", "οχλου εγενοντο σοι διαλεγομενοι, εγω δε τοσουτων ετων ουδε προσειπον"),
    ("103a.27.p1", "tlg012", ["244a"], "Phaedrus (244a)", "θεια δοσει διδομενησ", "θεια μεντοι δοσει διδομενησ"),
    ("103a.27.p1", "tlg004", ["65d"], "Phaedo (65d)", "υγιειασ, ισχυοσ", "υγιειασ, ισχυοσ"),
    ("103a.29.p1", "tlg031", ["42c", "42d"], "42c-d", "υστερον προσφυντα εκ πυροσ", "υστερον προσφυντα εκ πυροσ"),
    ("103a.29.p1", "tlg011", ["197d"], "Symposium (197d)", "αλλοτριοτητοσ κενοι, και οικειοτητοσ πληροι", "αλλοτριοτητοσ μεν κενοι, οικειοτητοσ δε πληροι"),
    ("103a.31.p3", "tlg011", ["212b"], "212b", "αμεινω γαρ, φησιν, ερωτοσ συνεργον", "συνεργον αμεινω ερωτοσ ουκ αν τισ ραδιωσ λαβοι"),
    ("103a.33.p1", "tlg011", ["202e", "203a"], "202e-203a", "δια μεσων των δαιμονων", "πασα εστιν η ομιλια και η διαλεκτοσ θεοισ προσ ανθρωπουσ"),
    ("103a.33.p2", "tlg011", ["202d"], "202d", "ερωσ δαιμων εστι μεγασ", "δαιμων μεγασ, ω σωκρατεσ"),
    ("103a.30.p2", "tlg034", ["640c", "640d"], "640c-d", "αρχοντα αυτοισ εφιστησι", "νηφοντα τε και σοφον αρχοντα μεθυοντων"),
    ("103a.22.p1", "tlg013", ["131e"], "131e", "μονον εραστην εαυτον", "αλκιβιαδη τω κλεινιου εραστησ ουτʼ εστιν αλλʼ η εισ μονοσ"),
    ("103a.19.p2", "tlg031", ["30b"], "Timaeus (30b)", "νου μεν γαρ και σωματοσ η ψυχη", "νουν μεν εν ψυχη, ψυχην δʼ εν σωματι"),
    ("103b.3.p2", "tlg030", ["619b", "619c"], "619b-c", "απ’ ουρανου", "των εκ του ουρανου ηκοντων"),
    ("104a.3.p1", "tlg034", ["717d"], "717d", "κουφων γαρ και πτηνων λογων βαρυτατη ζημια", "κουφων και πτηνων λογων βαρυτατη ζημια"),
    ("104a.7.p2", "tlg006", ["175a"], "175a", "πεντε και εικοσι", "επι πεντε και εικοσι καταλογω προγονων"),
    ("104a.7.p1", "tlg031", ["92c"], "92c", "μεγιστον των αισθητων θεων και καλλιστον", "μεγιστοσ και αριστοσ καλλιστοσ"),
    ("104c.4.p1", "tlg013", ["104c", "104d"], "104c-d", "μικρον με εφθησ", "σμικρον με εφθησ"),
    ("104c.5.p4", "tlg034", ["709b"], "709b", "τυχη γαρ, φησι, και καιροσ τα ανθρωπινα διακυβερνωσι συμπαντα", "τυχη και καιροσ, τανθρωπινα διακυβερνωσι συμπαντα"),
    ("104c.6.p1", "tlg031", ["30a"], "30a", "βουληθεισ γαρ, φησιν, ο θεοσ αγαθα παντα ειναι κατα δυναμιν", "βουληθεισ γαρ ο θεοσ αγαθα μεν παντα"),
    ("104d.1.p2", "tlg030", ["510b"], "510b", "ανυποθετου", "ανυποθετον"),
    ("104e.2.p2", "tlg031", ["48a"], "Timaeus 48a", "τω νω πειθων την αναγκην", "πειθειν αυτην"),
    ("104e.3.p1", "tlg012", ["249e"], "Phaedrus 249e", "φυσει τε θεαται τα οντα", "φυσει τεθεαται τα οντα"),
    ("104e.3.p2", "tlg012", ["246e"], "Phaedrus 246e-247a", "του μεγαλου διοσ", "μεγασ ηγεμων εν ουρανω ζευσ"),
]


def load():
    return json.loads((MOD / f"{TID}.json").read_text(encoding="utf-8"))


class Proofreading(unittest.TestCase):
    def test_the_pages_in_order(self):
        pages = proofread.parse(TID)
        self.assertEqual(len(pages), 199)
        self.assertEqual(pages[0]["label"], "II p. 2")
        self.assertEqual(pages[-1]["label"], "II p. 297")
        nums = [int(p["label"].rsplit(" ", 1)[1]) for p in pages]
        # Cousin prints two pages of Greek, then two of his Latin: the Greek runs on from page to page (p. 47 and 48
        # are Latin, and the first lemma starts p. 49). Proclus on love runs on from p. 78, on Socrates as a good daemon and the only lover to p. 137, the more secret account of love to p. 145, the crowd and Socrates' silence to p. 162, and the daemonic opposition to p. 182. Pp. 187-188, 191-192 and 195 are still Latin; from p. 196 Cousin prints his Latin at the foot of the Greek, so the Greek runs on from page to page: the daemons, Socrates' daemon and the young man's pride to p. 269, the right moment to p. 281, Socrates' slow beginning to p. 289, and the nature worth loving to p. 297.
        self.assertEqual(nums, [2] + [n for k in range(5, 46, 4) for n in (k, k + 1)] + [n for k in range(49, 182, 4) for n in (k, k + 1)]
                         + [185, 186, 189, 190, 193, 194] + list(range(196, 298)))
        # Three pages are blank leaves in this scan, and are proofread from the other scan of the same volume.
        supplied = {p["label"]: p["supplied"] for p in pages if p.get("supplied")}
        self.assertEqual(sorted(supplied), ["II p. 158", "II p. 81", "II p. 94"])
        for url in supplied.values():
            self.assertTrue(url.startswith("https://archive.org/details/procliphilosophi00proc/page/n"), url)
        self.assertEqual(len({p["unit"] for p in pages}), len(pages))

    def test_the_rules_of_the_transcription(self):
        text = "\n".join(ln for p in proofread.parse(TID) for ln in p["lines"])
        # The ligatures are written out, ϑ is θ, and nothing is left in Latin letters.
        for bad in ("ϑ", "ȣ", "ϗ", "ς ", "ςι"):
            self.assertNotIn(bad, text.replace("ς ", "") if bad == "ς " else text)
        self.assertNotRegex(text, r"[A-Za-z]")
        self.assertIn("ΓΝΩΘΙ ΣΕΑΥΤΟΝ", text)

    def test_the_greek_reads_on_across_the_pages(self):
        g = proofread.joined(TID)
        self.assertTrue(g.startswith("ΠΡΟΚΛΟΥ ΔΙΑΔΟΧΟΥ ΕΙΣ ΤΟΝ ΠΛΑΤΩΝΟΣ ΠΡΩΤΟΝ ΑΛΚΙΒΙΑΔΗΝ. Τῶν Πλατωνικῶν διαλόγων"))
        self.assertIn("τάχα ἂν τῆς τοῦ Πλάτωνος τυγχάνοιμεν διανοίας. Ὦ παῖ Κλεινίου, οἶμαί σε θαυμάζειν", g)
        self.assertIn("περὶ ἔρωτος ὅσα προσήκει τοῖς παροῦσι λόγοις, θεωρήσωμεν. Ὥσπερ τοίνυν ἄλλων θεῶν", g)
        self.assertIn("ἀδύνατα φησὶν ὁ Ἐλεάτης ξένος. Ταῦτα μὲν οὖν περὶ τούτων", g)
        self.assertIn("ποτὲ μὲν ἑαυτὸν δαίμονα προσαγορεύων, ποτὲ δὲ θεόν. Ἀλλὰ τούτου μὲν", g)
        self.assertIn("καὶ ποῖον τέλος ἐστὶ τῆς κατ’ ἀρετὴν ἐνεργείας. Τούτου δὲ τὸ αἴτιον γέγονεν οὐκ ἀνθρώπινον", g)
        self.assertIn("περὶ τὴν ἐρωτικὴν σπουδῇ.", g)
        self.assertIn("τὸ ὅλον δαιμόνιον ἡμῖν γνωσθήσησται φησὶν ὁ Σωκράτης. «Νῦν δὲ ἐπειδὴ οὐκ ἐναντιοῦται", g)
        self.assertTrue(g.endswith("τῶν ἐκ τῆς ἐρωτικῆς ἐπιπνοίας ἀγαθῶν."), g[-80:])
        # The supplied pages join the scan's pages on both sides: ἐπαγ-|γέλλεται is not split, nor p. 93 to p. 94.
        self.assertIn("ὁ δὲ αὐτάρκης ἐστὶ, καὶ δυνάμεως πλήρης", g)
        self.assertIn("ὁμοιούμενος τῷ ἐραστῷ, γίνεται δή που καὶ αὐτὸς ἄστατος", g)
        # Words broken across two pages are joined: πρω-|τίστης (pp. 2 and 5), τελειό-|τητα (pp. 6 and 9).
        for w in ("πρωτίστης", "τελειότητα τὴν αὐτὴν", "πρόγραμμα, μὴ χωρεῖν", "διαρθρώσεως, ἀλλὰ",
                  "ἐλλειπόντων εἰς", "μεταστήσεσθαι", "ἀπέληξε τοῦ ἔρωτος", "εἴδωλα τυγχάνοντα", "προσρήσεως· τῆς δὲ", "χαρακτηρίζεται"):
            self.assertIn(w, g)
        self.assertNotIn("(*)", g)

    def test_the_corrections_are_written_and_kept_apart(self):
        d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
        mine = [c for c in d["corrections"] if c.get("proofread")]
        self.assertGreater(len(mine), 400)
        units = {p["unit"] for p in proofread.parse(TID)}
        for c in mine:
            self.assertEqual(c["text"], TID)
            self.assertIn(c["unit"], units, "a proofread correction holds for its page only")
            self.assertTrue("Proofread from the page image" in c["why"] or
                            (c["why"].startswith("Supplied") and c["ocr"] == "" and "procliphilosophi00proc" in c["why"]), c["why"])
            self.assertNotEqual(c["ocr"], c["read"])
        # The common misreadings of the whole text stay as they were.
        self.assertTrue(any(c["text"] == TID and c["ocr"] == "χαὶ" and not c.get("unit") for c in d["corrections"]))

    def test_each_page_reads_as_proofread_with_its_corrections(self):
        if not all((neoplatonists.OCR_COPY / f"{s}.json.gz").exists() for s, _, _ in next(t for t in neoplatonists.TEXTS if t["id"] == TID)["ranges"]):
            self.skipTest("no OCR copy")
        corrs, problems = proofread.build(TID)
        self.assertEqual(problems, [])
        d = json.loads(neoplatonists.CORRECTIONS.read_text(encoding="utf-8"))
        self.assertEqual([c for c in d["corrections"] if c.get("proofread")], corrs, "run python3 tools/proofread.py")
        t = next(x for x in neoplatonists.TEXTS if x["id"] == TID)
        units = {u["n"]: u for u in neoplatonists.read_ocr(t)[0]}
        for p in proofread.parse(TID):
            u = units[p["unit"]]
            here = [c for c in d["corrections"] if c["text"] == TID and c.get("unit") in (None, u["n"])]
            # The page's own corrections first, as the build applies them in the file's order: the line corrections
            # come after the word ones, so check the line corrections on the OCR as received.
            got, _ = neoplatonists.apply_corrections(u["text"], [c for c in here if c.get("proofread")])
            self.assertEqual(got.split("\n")[:len(p["lines"])], p["lines"], p["label"])

    def test_the_alignment_joins_stray_lines(self):
        ocr = ["ΒΞ ΤΠ wo", "τῶν ἀλόγων εἰδῶν", "/ ». M B / Ne", "καὶ οἰόμεθα", "(*) A. deest"]
        page = ["τῶν ἀλόγων εἰδῶν", "καὶ οἰόμεθα"]
        gs = proofread.groups(ocr, page)
        self.assertEqual(gs, [([0, 1, 2], [0]), ([3], [1])])   # the note at the foot is left alone


class ModernEnglish(unittest.TestCase):
    def test_labelled_as_the_workshops_own_machine_assisted_from_the_proofread_greek(self):
        d = load()
        self.assertEqual((d["by"], d["machine_assisted"], d["made_from"], d["kind"]), ("Workshop modern version", True, "greek", "proofread"))
        self.assertIn("not yet checked by a scholar", d["label"])
        self.assertIn("proofread from the page images", d["label"])
        self.assertEqual(d["greek_text"], TID)

    def test_the_prologue_and_the_first_lemma_in_order(self):
        d = load()
        self.assertEqual([t["id"] for t in d["treatises"]], ["Prologue", "103a", "103a-love", "103a-first", "103a-secret", "103a-crowd", "103a-daemon",
                                                         "103a-daemons", "103a-socrates", "103a-power", "103a-hope", "103b", "104a", "104a-gifts",
                                                         "104c", "104c-moment", "104d", "104e-worthy"])
        self.assertEqual([c["id"] for c in d["chapters"]], [f"Pr.{n}" for n in range(1, 11)] + [f"103a.{n}" for n in range(1, 52)]
                         + ["103b.1", "103b.2", "103b.3"] + [f"104a.{n}" for n in range(1, 9)] + [f"104c.{n}" for n in range(1, 7)]
                         + ["104d.1", "104d.2"] + [f"104e.{n}" for n in range(1, 5)])
        self.assertEqual({c["treatise"] for c in d["chapters"] if c["id"] in ("103a.8", "103a.13")}, {"103a-love"})
        for c in d["treatises"] + d["chapters"]:
            self.assertGreater(len(c["summary"].split()), 15, c["id"])
        # The paragraphs hold all the proofread Greek, in order, after the title.
        g = proofread.joined(TID)
        joined = " ".join(p["greek"] for p in d["paragraphs"])
        self.assertEqual(g, "ΠΡΟΚΛΟΥ ΔΙΑΔΟΧΟΥ ΕΙΣ ΤΟΝ ΠΛΑΤΩΝΟΣ ΠΡΩΤΟΝ ΑΛΚΙΒΙΑΔΗΝ. " + joined)
        for p in d["paragraphs"]:
            self.assertTrue(p["modern"].strip() and p["pages"], p["seg"])

    def test_no_problems_and_the_json_is_up_to_date(self):
        d, problems = modern_neo.build(TID)
        self.assertEqual(problems, [])
        self.assertEqual(load(), json.loads(json.dumps(d, ensure_ascii=False)), "run python3 tools/modern_neo.py")

    def test_flags_quote_taylors_introduction_and_notes(self):
        tay = {k: t for k, (_, t) in modern_neo.taylor_alcibiades().items()}
        d = load()
        chs = {c["id"]: c for c in d["chapters"]}
        n = 0
        for p in d["paragraphs"]:
            for f in p.get("flags", []):
                n += 1
                here = " ".join(tay[x["n"]] for x in chs[p["chapter"]]["taylor"])
                self.assertIn(modern_neo.norm(f["taylor"]), here, p["seg"])
        self.assertGreaterEqual(n, 28)
        # Taylor's paragraphs 2 to 6 and 8 are drawn from the prologue; 7 (Socrates' love) from his notes on the first
        # words, and so is his first Additional Note (on the preface, 103a). His long footnote on 103a quotes Proclus on
        # the daemons (n006), and two more footnotes draw on his notes on the young man's gifts (n009, n011).
        used = {x["n"] for c in d["chapters"] for x in c["taylor"]}
        self.assertEqual(used, {2, 3, 4, 5, 6, 7, 8, "add001", "n006", "n009", "n011"})
        labels = {x["n"]: x["label"] for c in d["chapters"] for x in c["taylor"]}
        self.assertEqual((labels[7], labels["add001"]), ("Introduction, paragraph 7", "Additional note on 103a"))

    def test_it_follows_the_greek_where_taylor_differs(self):
        p = {x["seg"]: x for x in load()["paragraphs"]}
        self.assertIn("ἁγιωτέρας", p["Pr.1.p2"]["greek"])
        self.assertIn("older and holier", p["Pr.1.p2"]["modern"])
        self.assertNotIn("unity", p["Pr.1.p2"]["modern"])
        self.assertNotIn("ineffable", p["Pr.1.p2"]["modern"])
        self.assertIn("παρά τισιν", p["Pr.6.p2"]["greek"])
        self.assertIn("what some call", p["Pr.6.p2"]["modern"])
        self.assertNotIn("rhetorician", p["Pr.6.p2"]["modern"])
        # Iamblichus' three parts.
        self.assertIn("These, then, are the three parts of this dialogue.", p["Pr.9.p2"]["modern"])
        text = " ".join(x["modern"] for x in p.values()).lower()
        for old in ("energ", "essence", "subsist", "physiolog", "felicity"):
            self.assertNotIn(old, text)

    def test_the_first_lemma_follows_the_greek(self):
        p = {x["seg"]: x for x in load()["paragraphs"]}
        # The lemma is a paragraph of its own: Plato's words, translated, with a note naming the place.
        self.assertTrue(p["103a.1.p1"]["greek"].startswith("Ὦ παῖ Κλεινίου"))
        self.assertTrue(p["103a.1.p1"]["greek"].endswith("ἀπαλλάττομαι·"))
        self.assertTrue(any("103a" in n for n in p["103a.1.p1"]["notes"]))
        # "I think" marks the changing thing known, not doubtful knowledge.
        self.assertIn('used "I think"', p["103a.3.p3"]["modern"])
        self.assertIn("εὔτρεπτον", p["103a.3.p3"]["greek"])
        # The misprint Cousin prints is said so, and read as the sense needs.
        self.assertIn("φιλοσοφροσύνης", p["103a.5.p3"]["greek"])
        self.assertIn("kindliness", p["103a.5.p3"]["modern"])
        self.assertTrue(any("misprint" in n or "not a Greek word" in n for n in p["103a.5.p3"]["notes"]))
        # The three sciences, love first, as in Taylor's paragraph 7.
        self.assertIn("dialectic, midwifery and the science of love", p["103a.7.p2"]["modern"])
        self.assertIn("ἐρωτικῆς", p["103a.7.p2"]["greek"])

    def test_the_account_of_love_follows_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        # Taylor draws nothing from these pages: no Taylor paragraphs named, and so no flags.
        for c in d["chapters"][17:45]:
            self.assertEqual(c["taylor"], [], c["id"])
        self.assertFalse([f for x in p.values() if x["chapter"] in {c["id"] for c in d["chapters"][17:45]} for f in x.get("flags", [])])
        # Love, the great daemon, is the middle between beauty and those it leads up.
        self.assertIn("δαίμονα μέγαν", p["103a.8.p2"]["greek"])
        self.assertIn("great daemon", p["103a.8.p2"]["modern"])
        # A page supplied from the other scan is named in the paragraph's pages like any other.
        self.assertIn("II p. 94", [x["label"] for x in p["103a.12.p2"]["pages"]])
        # The five marks of the two lovers, each a paragraph of its own.
        for seg, start in (("103a.12.p3", "Δεύτερον τοίνυν"), ("103a.12.p4", "Τὸ τρίτον τοίνυν"),
                           ("103a.12.p5", "Τέταρτον στοιχεῖον"), ("103a.12.p6", "Πέμπτον")):
            self.assertTrue(p[seg]["greek"].startswith(start), seg)
        # Where Cousin prints a reading the manuscripts do not have, the note says so.
        self.assertTrue(any("κεχάρισται" in n for n in p["103a.12.p5"]["notes"]))

    def test_socrates_as_a_good_daemon_follows_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        self.assertIn("Δαίμονος ἀγαθοῦ", p["103a.16.p1"]["greek"])
        self.assertIn("good daemon", p["103a.16.p1"]["modern"])
        # The Oracle's verse is kept, and said to be from the Chaldean Oracles, without a number we have not checked.
        self.assertIn("Οὐ γὰρ χρὴ κείνους σε βλέπειν", p["103a.15.p2"]["greek"])
        self.assertTrue(any("Chaldean Oracles" in n for n in p["103a.15.p2"]["notes"]))
        # A word Cousin prints that is not Greek is said so, and the English does not pretend to read it.
        self.assertIn("ἀγητηρίων", p["103a.16.p2"]["greek"])
        self.assertTrue(any("ἀγητηρίων" in n and "not a reading" in n for n in p["103a.16.p2"]["notes"]))
        # Where Cousin's text goes against both his manuscripts and the sense, the note says so and why.
        self.assertIn("κατὰ ταυτὰ", p["103a.21.p3"]["greek"])
        self.assertTrue(any("κατὰ ταύτας" in n for n in p["103a.21.p3"]["notes"]))

    def test_the_more_secret_account_follows_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        self.assertEqual({c["treatise"] for c in d["chapters"] if c["id"].startswith(("103a.23", "103a.24", "103a.25"))}, {"103a-secret"})
        self.assertTrue(all(not c["taylor"] for c in d["chapters"][32:35]))
        # The triad of faith, truth and love, and the oracle named without a number we have not checked.
        self.assertIn("πίστις καὶ ἀλήθεια καὶ ἔρως", p["103a.24.p1"]["greek"])
        self.assertIn("faith, truth and love", p["103a.24.p1"]["modern"])
        self.assertTrue(any("Chaldean Oracles" in n for n in p["103a.24.p1"]["notes"]))
        # Cousin's two words τοῖς δὲ are kept in the Greek and the note says how the English reads them.
        self.assertIn("τοῖς δὲ, φησὶ τὸ λόγιον", p["103a.24.p2"]["greek"])
        self.assertTrue(any("τοῖσδε" in n for n in p["103a.24.p2"]["notes"]))
        self.assertIn("πεπληθισμένως", p["103a.24.p2"]["greek"])
        # The divine lover and the vulgar one, in one paragraph, as Proclus sets them.
        self.assertIn("θεῖος ἐραστὴς", p["103a.25.p1"]["greek"])
        self.assertTrue(p["103a.25.p1"]["greek"].endswith("τῷ σκότει τῆς ὕλης."))

    def test_the_crowd_and_socrates_silence_follow_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        self.assertEqual({c["treatise"] for c in d["chapters"] if c["id"] in ("103a.26", "103a.30")}, {"103a-crowd"})
        self.assertTrue(all(not c["taylor"] for c in d["chapters"][35:45]))
        # The lemma is its own paragraph, as the dialogue's first words were.
        self.assertEqual(p["103a.26.p1"]["greek"], "Καὶ ὅτι οἱ μὲν ἄλλοι δι’ ὄχλου ἐγένοντό σοι διαλεγόμενοι, ἐγὼ δὲ τοσούτων ἐτῶν οὐδὲ προσεῖπον.")
        # Cousin's τῶν ὅλων is kept in the Greek; the English reads the dialogue's τῶν ἄλλων, and says so.
        self.assertIn("τῶν ὅλων πεπαυμένων", p["103a.26.p3"]["greek"])
        self.assertTrue(any("τῶν ἄλλων" in n for n in p["103a.26.p3"]["notes"]))
        # The page the scan lost is supplied from the other scan, and the paragraph names it.
        self.assertIn("II p. 158", [x["label"] for x in p["103a.29.p1"]["pages"]])
        self.assertIn("Ὁ μὲν οὖν πολὺς ἐραστὴς τοιοῦτος.", p["103a.29.p1"]["greek"])
        self.assertIn("silence", p["103a.28.p1"]["modern"])

    def test_the_daemonic_opposition_follows_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        self.assertEqual({c["treatise"] for c in d["chapters"] if c["id"].startswith(("103a.31", "103a.35"))}, {"103a-daemon"})
        # The lemma is its own paragraph, and the note gives Plato's own form of the word Cousin prints.
        self.assertEqual(p["103a.31.p1"]["greek"], "Τούτου δὲ τὸ αἴτιον γέγονεν οὐκ ἀνθρώπινον, ἀλλά τι δαιμόνιον ἐναντίωμα· οὗ σὺ τὴν δύναμιν καὶ ὕστερον πεύσῃ.")
        self.assertTrue(any("ἀνθρώπειον" in n for n in p["103a.31.p1"]["notes"]))
        # Love is a great daemon, with three ranks; the Orphic verses are cited where Cousin cites them.
        self.assertIn("δαίμων ἐστὶ μέγας", p["103a.33.p2"]["greek"])
        self.assertIn("great daemon", p["103a.33.p2"]["modern"])
        self.assertTrue(p["103a.34.p2"]["greek"].endswith("εἷς δαίμων γένετο μέγας ἀρχὸς ἁπάντων."))
        self.assertTrue(any("Hermann" in n for n in p["103a.34.p2"]["notes"]))
        self.assertTrue(p["103a.35.p1"]["greek"].endswith("περὶ τὴν ἐρωτικὴν σπουδῇ."))

    def test_the_daemons_and_the_next_lemmas_follow_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        chs = {c["id"]: c for c in d["chapters"]}
        self.assertEqual((chs["103a.43"]["treatise"], chs["104c.4"]["treatise"], chs["104e.1"]["treatise"]), ("103a-socrates", "104c-moment", "104d"))
        # Each new lemma is its own paragraph, with a note that names the place in the dialogue.
        for seg, start, place in (("103b.1.p1", "Σχεδὸν οὖν κατανενόηκα", "103b"), ("104c.4.p1", "«Καὶ ἴσως γε", "104c-d"),
                                  ("104d.1.p1", "«Ἀκούσῃ μὲν ἄρα μου", "104d-e"), ("104e.1.p1", "«Χαλεπὸν μὲν οὖν", "104e")):
            self.assertTrue(p[seg]["greek"].lstrip("«").startswith(start.lstrip("«")), seg)
            self.assertTrue(any("next words" in n and place in n for n in p[seg]["notes"]), seg)
        # The right moment: the Pythagoreans' name for the first cause, and the Laws on chance and the right moment.
        self.assertIn("Πυθαγόρειοι καιρὸν ἀπεκάλουν", p["104c.4.p3"]["greek"])
        self.assertIn('"the right moment"', p["104c.4.p3"]["modern"])
        # Cousin's misprints are kept in the Greek and named in the notes.
        self.assertIn("ἀντέρωντος", p["104c.6.p3"]["greek"])
        self.assertTrue(any("ἀντέρωτος" in n for n in p["104c.6.p3"]["notes"]))
        self.assertIn("Enneads I.3.6", " ".join(p["104e.1.p3"]["notes"]))
        self.assertTrue(p["104e.1.p3"]["greek"].endswith("καὶ αἴτιον αὐτῶν προϋπάρχον."))

    def test_the_nature_worth_loving_follows_the_greek(self):
        d = load()
        p = {x["seg"]: x for x in d["paragraphs"]}
        chs = {c["id"]: c for c in d["chapters"]}
        self.assertEqual({chs[f"104e.{n}"]["treatise"] for n in (2, 3, 4)}, {"104e-worthy"})
        self.assertTrue(all(not chs[f"104e.{n}"]["taylor"] for n in (2, 3, 4)))
        # The lemma is its own paragraph, with Cousin's guillemet, and the note names its place in the dialogue.
        self.assertTrue(p["104e.2.p1"]["greek"].startswith("«Ἐγὼ γὰρ, ὦ Ἀλκιβιάδη"))
        self.assertTrue(any("next words" in n and "104e-105a" in n for n in p["104e.2.p1"]["notes"]))
        # Ambition, the last tunic; the oracle named without a fragment number; Cousin's misprints kept and noted.
        self.assertIn("ἔσχατον χιτῶνα", p["104e.4.p3"]["greek"])
        self.assertIn("last tunic", p["104e.4.p3"]["modern"])
        self.assertTrue(any("Chaldean Oracles" in n for n in p["104e.4.p3"]["notes"]))
        self.assertIn("λόγος καθαρὸς", p["104e.4.p3"]["greek"])
        self.assertTrue(any("λόγοι" in n for n in p["104e.4.p3"]["notes"]))
        self.assertIn("ἐκφάσεις", p["104e.4.p4"]["greek"])
        self.assertTrue(any("ἐμφάσεις" in n for n in p["104e.4.p4"]["notes"]))
        self.assertIn("II p. 297", [x["label"] for x in p["104e.4.p4"]["pages"]])
        for x in d["paragraphs"]:
            if x["seg"].startswith(("104e.2", "104e.3", "104e.4")):
                self.assertNotRegex(x["modern"], r"(?i)essence|energy|subsist|felicity", x["seg"])

    def test_sentences_can_be_marked(self):
        with tempfile.TemporaryDirectory() as tmp:
            lib = sqlite3.connect(":memory:")
            lib.execute("CREATE TABLE work (id TEXT, urn TEXT, title TEXT)")
            mine = mywork.MyWork(Path(tmp) / "user.sqlite", lib)
            p = load()["paragraphs"][0]
            s = modern.sentences(p["modern"])[1]
            r = mine.add_modern_mark({"text": TID, "para": p["seg"], "sentence": s, "kind": "seems wrong"})
            self.assertEqual(r["marks"][0]["para"], "Pr.1.p1")

    def test_small_enough_for_the_website(self):
        self.assertLess((MOD / f"{TID}.json").stat().st_size, 2_000_000)


def has_library():
    return build_db.DB_PATH.exists()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class PlatosPlaces(unittest.TestCase):
    def test_the_notes_name_the_places_proclus_recalls(self):
        db = sqlite3.connect(build_db.DB_PATH)
        paras = {p["seg"]: p for p in load()["paragraphs"]}
        for seg, work, refs, note, mine, plato in PLATO:
            self.assertIn(mine, modern_neo.fold(paras[seg]["greek"]), seg)
            text = " ".join(r[0] for r in db.execute(
                f"SELECT text FROM chunk WHERE work_id = ? AND edition_id LIKE '%grc%' AND section_ref IN ({','.join('?' * len(refs))})", (work, *refs)))
            self.assertIn(plato, modern_neo.fold(text), f"{seg}: {work} {refs}")
            self.assertTrue(any(note in n for n in paras[seg].get("notes", [])), f"{seg}: a note names {note}")
        db.close()


@unittest.skipUnless(has_library(), "run python3 tools/build_db.py first")
class Server(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import serve
        cls.tmp = tempfile.TemporaryDirectory()
        lib = serve.Library(user_path=Path(cls.tmp.name) / "user.sqlite")
        cls.httpd = serve.make_server(port=0, library=lib)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.tmp.cleanup()

    def get(self, path):
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}/api/{path}") as r:
            return json.loads(r.read())

    def test_the_modern_english_with_its_pages(self):
        d = self.get(f"modern-neo/{TID}")
        self.assertEqual(d["marks"], [])
        self.assertEqual(d["greek_info"]["editor"], "Victor Cousin")
        pg = d["paragraphs"][0]["pages"][0]
        self.assertEqual((pg["label"], pg["part"]), ("II p. 2", 0))
        self.assertTrue(pg["scan"].startswith("https://archive.org/details/"))
        with self.assertRaises(urllib.error.HTTPError):
            self.get("modern-neo/plotinus")      # Plotinus is read beside Taylor's chapters, not here

    def test_the_shelf_and_the_scan_link_to_it(self):
        t = next(t for t in self.get("neo")["texts"] if t["id"] == TID)
        self.assertEqual((t["modern"]["text"], t["modern"]["pages"]), (TID, 199))
        part = self.get(f"neo/{TID}/0")
        u = next(u for u in part["units"] if u["label"] == "II p. 2")
        self.assertEqual(u["modern_section"], {"text": TID, "id": "Pr.1"})
        self.assertIn("Τῶν Πλατωνικῶν διαλόγων", u["corrected"])
        self.assertTrue(any(c["unit_n"] == u["n"] and c["applied"] == 1 for c in part["corrections"]))


@unittest.skipUnless(has_library() and shutil.which("node"), "needs the library and Node")
class Browser(unittest.TestCase):
    def test_in_a_real_browser(self):
        try:
            subprocess.run(["node", "-e", "require('playwright')"], check=True, capture_output=True, timeout=60)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            self.skipTest("Playwright is not installed")
        import serve
        with tempfile.TemporaryDirectory() as tmp:
            lib = serve.Library(user_path=Path(tmp) / "user.sqlite")
            httpd = serve.make_server(port=0, library=lib)
            threading.Thread(target=httpd.serve_forever, daemon=True).start()
            try:
                r = subprocess.run(["node", str(ROOT / "tests" / "proclus_alcibiades_browser.js"), str(httpd.server_address[1])],
                                   capture_output=True, text=True, timeout=600)
            finally:
                httpd.shutdown()
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
