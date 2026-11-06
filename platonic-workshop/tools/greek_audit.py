"""Milestone 15: every piece of Greek the reader shows, and the English beside it.

    python3 tools/greek_audit.py            # writes reports/greek_audit.md and .json

Walks what the reader is sent (the same Library methods tools/serve.py answers
with, view by view), finds every run of Greek in it, and files each run under
its view and field ("ancient/prolegomena-hermann sections[].text"). Each field
is then looked up in sources/translations/coverage.json, which says how the
reader gives English for it and on what source: a translation printed beside
it, a Workshop translation, the dictionary on tap, or nothing yet. The report
counts the runs and words per field and lists every field with no English.

Nothing is guessed: a field missing from coverage.json is reported as such,
and tests/test_greek_english.py fails on it.
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

import serve  # noqa: E402

COVERAGE = ROOT / "sources" / "translations" / "coverage.json"
REPORT_MD = ROOT / "reports" / "greek_audit.md"
REPORT_JSON = ROOT / "reports" / "greek_audit.json"

# A run of Greek: Greek words with only spaces, punctuation or digits between them.
_W = r"[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿̀-ͯʼ’᾽᾿']*"
RUN = re.compile(_W + r"(?:[\s,.;:·()\[\]«»“”\"'‘’\-–—0-9]+" + _W + r")*")
WORD = re.compile(_W)
# Fields that carry markup or ids rather than text the reader shows.
SKIP_KEYS = {"raw", "html_raw", "urn", "id", "slug", "file", "source_id", "note_key", "beta_key", "lemma_beta",
             "key", "match_key", "unaccented_key", "plain_key", "plain", "postag", "morph_key", "source_form"}


def runs(text):
    """[(run, words)] for each run of Greek in a string; markup tags are skipped."""
    text = re.sub(r"<[^>]*>", " ", text)
    out = []
    for m in RUN.finditer(text):
        n = len(WORD.findall(m.group(0)))
        if n:
            out.append((m.group(0), n))
    return out


def walk(obj, path, emit):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in SKIP_KEYS:
                continue
            walk(v, f"{path}.{k}" if path else k, emit)
    elif isinstance(obj, list):
        for v in obj:
            walk(v, path + "[]", emit)
    elif isinstance(obj, str):
        for r, n in runs(obj):
            emit(path, r, n)


def views(lib):
    """(view, json) for everything the reader can be sent, view by view."""
    yield "works", lib.works()
    yield "reading-order", lib.reading_order()
    yield "people", lib.people()
    yield "corpus", lib.corpus()
    yield "concepts", lib.concepts()
    for c in lib.concepts()["concepts"] if isinstance(lib.concepts(), dict) else lib.concepts():
        yield "concept", lib.concept(c["id"])
    yield "dossiers", lib.dossiers()
    ds = lib.dossiers()
    for d in (ds["dossiers"] if isinstance(ds, dict) else ds):
        yield "dossier", lib.dossier(d["id"])
    yield "reconcile", lib.reconciliations()
    rs = lib.reconciliations()
    for t in (rs["tensions"] if isinstance(rs, dict) else rs):
        yield "reconciliation", lib.reconciliation(t["id"])
    yield "methods", lib.methods()
    yield "commentaries", lib.all_commentaries()
    for t in serve.TAYLOR_TEXTS:
        yield f"taylor/{t}", lib.taylor(t)
    for (tid,) in lib.db.execute("SELECT id FROM ancient_text ORDER BY id"):
        yield f"ancient/{tid}", lib.ancient(tid)
    for w in lib.works():
        if not w["imported"]:
            continue
        yield "whole", lib.whole(w["id"])
        yield "work", lib.work(w["id"])
        for c in lib.commentaries(w["id"]):
            after = 0
            while True:
                part = lib.commentary(c["id"], after=after, limit=500)
                kind = "scholia" if c["source_id"] == "hermann-appendix" else "commentary"
                yield kind, part
                if not part["more"]:
                    break
                after = max(n["seq"] for n in part["notes"]) if part["notes"] and "seq" in part["notes"][0] else after + 500
        for (p,) in lib.db.execute("SELECT DISTINCT page FROM section WHERE work_id = ? ORDER BY page", (w["id"],)):
            yield "page", lib.page(w["id"], p)


def audit(lib):
    fields = defaultdict(lambda: {"runs": 0, "words": 0, "longest": 0, "example": ""})
    for view, obj in views(lib):
        if obj is None:
            continue

        def emit(path, r, n, view=view):
            f = fields[f"{view} {path}"]
            f["runs"] += 1
            f["words"] += n
            if n > f["longest"]:
                f["longest"], f["example"] = n, r[:120]
        walk(obj, "", emit)
    return dict(sorted(fields.items()))


def static_runs():
    """Greek written into the reader's own files (labels, help, examples)."""
    out = []
    for p in sorted((ROOT / "reader").glob("*.*")):
        if p.suffix not in (".js", ".html"):
            continue
        for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if line.lstrip().startswith("//"):
                continue
            for r, n in runs(line):
                if "Ͱ" in r or "῿" in r:   # a character range in a pattern, not text
                    continue
                out.append({"file": f"reader/{p.name}", "line": i, "greek": r, "words": n})
    return out


def load_coverage():
    return json.loads(COVERAGE.read_text(encoding="utf-8"))


def coverage_for(cov, field):
    """The coverage entry for 'view path': exact, else the longest matching prefix ending in '*'."""
    if field in cov["fields"]:
        return cov["fields"][field]
    best = None
    for k, v in cov["fields"].items():
        if k.endswith("*") and field.startswith(k[:-1]) and (best is None or len(k) > len(best[0])):
            best = (k, v)
    return best[1] if best else None


def main():
    lib = serve.Library()
    fields = audit(lib)
    cov = load_coverage()
    rows, missing, pending = [], [], []
    for f, s in fields.items():
        c = coverage_for(cov, f)
        how = c["how"] if c else None
        rows.append({"field": f, **s, "english": how, "note": (c or {}).get("note", "")})
        if not c:
            missing.append(f)
        elif how == "pending":
            pending.append(f)
    stat = static_runs()
    words = sum(r["words"] for r in rows)
    by = defaultdict(int)
    for r in rows:
        by[r["english"] or "not in coverage.json"] += r["words"]
    REPORT_JSON.write_text(json.dumps({"fields": rows, "static": stat, "words_by_coverage": by}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    labels = cov["kinds"]
    md = ["# Greek in the reader, and its English (milestone 15)", "",
          "Written by `python3 tools/greek_audit.py`. Every run of Greek the reader is sent, view by view and field by",
          "field, and how English is given for it (`sources/translations/coverage.json`).", "",
          f"{words:,} Greek words in {sum(r['runs'] for r in rows):,} runs, in {len(rows)} fields.", "",
          "| English | Greek words |", "|---|---:|"]
    md += [f"| {labels.get(k, k)} | {v:,} |" for k, v in sorted(by.items(), key=lambda kv: -kv[1])]
    md += ["", "## Field by field", "", "| View and field | Runs | Words | Longest run | English |", "|---|---:|---:|---:|---|"]
    for r in rows:
        md.append(f"| `{r['field']}` | {r['runs']:,} | {r['words']:,} | {r['longest']} | {labels.get(r['english'], '**none**') if r['english'] else '**not in coverage.json**'} |")
    md += ["", "## Not yet translated", ""]
    md += [f"- `{f}`: {coverage_for(cov, f).get('note', '')}" for f in pending] or ["Nothing."]
    md += ["", "## Greek written into the reader's own files", "",
           "Each is checked by `tests/test_greek_english.py` to have English beside it in the same line.", ""]
    md += [f"- `{s['file']}:{s['line']}` {s['greek']}" for s in stat] or ["None."]
    md += ["", "## Missing from coverage.json", ""] + ([f"- `{f}`" for f in missing] or ["Nothing."])
    REPORT_MD.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"{words:,} Greek words in {len(rows)} fields; {len(missing)} fields not in coverage.json; {len(pending)} pending")
    for f in missing:
        print("  missing:", f, fields[f]["example"][:60])


if __name__ == "__main__":
    main()
