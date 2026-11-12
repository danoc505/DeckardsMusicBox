#!/usr/bin/env python3
"""Aristotle milestone A7: Plato and Aristotle together.

Called by build_db.py once Aristotle is built (and, for the links from the commentators, once they are linked):

1. The concordance across Aristotle: ar_lemma_count and ar_form_count, the counts the word search reads for
   corpus='aristotle' (tools/search.py), built as Plato's lemma_count and form_count are, from GLAUx's lemmas
   and the printed forms of Aristotle's Greek.

2. The citation web from Aristotle to Plato (ar_plato): every place in Aristotle that names or cites a dialogue,
   read by rule, nothing guessed:
     named   Aristotle's own Greek names a dialogue ("ἐν τῷ Τιμαίῳ", "ἐν δὲ τῷ Φαίδωνι", "ὁ ἐν τῷ Μένωνι λόγος"),
             linked to the dialogue as a whole; or names Plato ("Πλάτων"), linked to no dialogue;
     note    a translator's note on the column cites a passage of Plato by title and page ("Theaet. 152e"), read
             by the rules of the citation web (tools/citations.py, milestone 8) and checked against Burnet's
             sections, with its certainty; a bare page with no title is not read (it would be Aristotle's own).
   So a column of Aristotle shows the Plato it names or cites, and a section of Plato shows where Aristotle
   discusses it.

    python3 tools/aristotle_plato.py      # the figures, from data/workshop.sqlite as built
"""
import re
import sqlite3
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import citations  # noqa: E402
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "workshop.sqlite"

# The dialogues as Aristotle names them, in the dative after ἐν τῷ (accents and breathings aside), with their Perseus ids.
NAMED = {
    "τιμαιω": "tlg031", "φαιδωνι": "tlg004", "μενωνι": "tlg024", "ιππια": "tlg026", "γοργια": "tlg023", "φαιδρω": "tlg012",
    "συμποσιω": "tlg011", "μενεξενω": "tlg028", "θεαιτητω": "tlg006", "σοφιστη": "tlg007", "πολιτικω": "tlg008",
    "φιληβω": "tlg010", "παρμενιδη": "tlg009", "κρατυλω": "tlg005", "πρωταγορα": "tlg022", "ευθυδημω": "tlg021",
}
NAME_RE = re.compile(r"\bεν (?:δε |γαρ |τε |μεν )?τω (" + "|".join(NAMED) + r")\b")
PLATO_RE = re.compile(r"\bπλατων(?:οσ|ι|α)?\b")
# The Hippias Aristotle names (Metaphysics Δ 29, 1025a6) is the lesser (Hippias Minor, Perseus tlg026); Perseus' ids for
# the dialogues are checked against the work table at build time.


def counts(db):
    """ar_lemma_count and ar_form_count, as build_db.build_search makes Plato's."""
    db.create_function("ar_plain", 1, lambda s: greek.strip_accents(re.sub(r"\d", "", s or "")).rstrip(greek.APOSTROPHES), deterministic=True)
    db.execute("""INSERT INTO ar_lemma_count SELECT g.lemma, ar_plain(g.lemma), e.work_id, count(DISTINCT g.token_id)
                  FROM tag g JOIN token t ON t.id = g.token_id JOIN edition e ON e.id = t.edition_id JOIN work w ON w.id = e.work_id
                  WHERE g.lemma != '' AND w.corpus = 'aristotle' GROUP BY g.lemma, e.work_id""")
    db.execute("""INSERT INTO ar_form_count SELECT t.form, t.plain, e.work_id, count(*)
                  FROM token t JOIN edition e ON e.id = t.edition_id JOIN work w ON w.id = e.work_id
                  WHERE w.corpus = 'aristotle' GROUP BY t.form, e.work_id""")
    return {"lemmas": db.execute("SELECT count(DISTINCT lemma) FROM ar_lemma_count").fetchone()[0],
            "forms": db.execute("SELECT count(DISTINCT form) FROM ar_form_count").fetchone()[0]}


def named_in_greek(db):
    """[(work, column, dialogue or 'plato', words)] where Aristotle's Greek names a dialogue, or Plato."""
    out = []
    for wid, ref, text in db.execute(
            "SELECT c.work_id, c.section_ref, c.text FROM chunk c JOIN edition e ON e.id = c.edition_id JOIN work w ON w.id = c.work_id "
            "WHERE e.lang = 'grc' AND w.corpus = 'aristotle' ORDER BY c.id").fetchall():
        plain = greek.strip_accents(greek.nfc(text))
        if len(plain) != len(text):
            plain = None
        for m in NAME_RE.finditer(greek.strip_accents(greek.nfc(text))):
            out.append((wid, ref, NAMED[m.group(1)], _words(text, plain, m)))
        for m in PLATO_RE.finditer(greek.strip_accents(greek.nfc(text))):
            out.append((wid, ref, "plato", _words(text, plain, m)))
    return out


def _words(text, plain, m):
    """The words matched, as printed where the accentless text keeps the same length, else as matched."""
    return greek.nfc(text)[m.start():m.end()] if plain is not None else m.group(0)


def build(db):
    """Fill ar_lemma_count, ar_form_count and ar_plato. Returns the figures for the build record."""
    stats = {"concordance": counts(db)}
    plato = {r[0] for r in db.execute("SELECT id FROM work WHERE corpus = 'plato'")}
    bad = set(NAMED.values()) - plato
    if bad:
        raise SystemExit(f"aristotle_plato: not Plato's works: {sorted(bad)}")
    rows = []
    for wid, ref, to, words in named_in_greek(db):
        rows.append((wid, ref, to, "", "named", words, None, None, "certain", None))
    corpus = citations.Corpus(db)
    for nid, wid, ref, body, who in db.execute(
            "SELECT n.id, n.work_id, n.start_ref, n.body, n.commentator FROM note n JOIN work w ON w.id = n.work_id "
            "WHERE w.corpus = 'aristotle' ORDER BY n.id").fetchall():
        for f in citations.read_refs(body, None, corpus):
            if f["rule"] == "page in this dialogue" or f["to_work"] not in plato or f["certainty"] == "unresolved":
                continue
            rows.append((wid, ref, f["to_work"], f["to_ref"], "note", f["raw"], nid, who, f["certainty"], f["doubt"]))
    db.executemany("INSERT INTO ar_plato (from_work, from_ref, to_work, to_ref, how, raw, note_id, who, certainty, doubt) "
                   "VALUES (?,?,?,?,?,?,?,?,?,?)", rows)
    c = Counter((r[4], r[8]) for r in rows)
    stats["links"] = {f"{h} ({k})": n for (h, k), n in sorted(c.items())}
    stats["dialogues"] = len({r[2] for r in rows if r[2] != "plato"})
    stats["sections_cited"] = len({(r[2], r[3]) for r in rows if r[3]})
    return stats


def main():
    db = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    for r in db.execute("SELECT from_work, from_ref, to_work, to_ref, how, raw, certainty FROM ar_plato ORDER BY rowid"):
        print(*r, sep="\t")


if __name__ == "__main__":
    main()
