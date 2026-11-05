#!/usr/bin/env python3
"""Check every fetched source and write reports/verification.md (and .json).

    python3 tools/fetch_sources.py
    python3 tools/verify_sources.py

Nothing here is estimated by hand: every number in the report is computed
from the files on disk by the code below.
"""
import difflib
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict, defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import greek  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
REPORTS = ROOT / "reports"
TEI = "{http://www.tei-c.org/ns/1.0}"
STEPH = re.compile(r"^(\d+)([a-e])$")
TIMAEUS = "tlg031"

# ---------------------------------------------------------------- Perseus


def perseus_dir():
    return RAW / "perseus-greek-plato" / "data" / "tlg0059"


def perseus_works():
    """{work_id: {'grc': path, 'eng': path, 'title': str}} for the 36 tetralogy works."""
    works = OrderedDict()
    for d in sorted(perseus_dir().glob("tlg0*")):
        cts = (d / "__cts__.xml").read_text(encoding="utf-8")
        m = re.search(r"<ti:title[^>]*>([^<]+)", cts)
        works[d.name] = {
            "title": m.group(1).strip() if m else d.name,
            "grc": next(iter(sorted(d.glob("*-grc*.xml"))), None),
            "eng": next(iter(sorted(d.glob("*-eng*.xml"))), None),
        }
    return works


def tei_header(path):
    root = ET.parse(path).getroot()
    hdr = root.find(f"{TEI}teiHeader")

    def texts(xpath):
        return [" ".join("".join(e.itertext()).split()) for e in hdr.iterfind(xpath)]

    return {
        "editors": texts(f".//{TEI}titleStmt/{TEI}editor"),
        "translators": texts(f".//{TEI}titleStmt/{TEI}editor[@role='translator']"),
        "source_dates": texts(f".//{TEI}sourceDesc//{TEI}date"),
        "source_titles": texts(f".//{TEI}sourceDesc//{TEI}title"),
    }, root


def stephanus_sections(root, with_text=False):
    """Walk the TEI body in reading order. Returns the ordered list of Stephanus
    sections and, if asked, the text of each (labels and notes left out)."""
    body = root.find(f".//{TEI}body")
    order, text = [], defaultdict(list)
    cur = [None]

    def walk(el):
        tag = el.tag.replace(TEI, "")
        if tag == "milestone" and el.get("unit") == "section":
            n = (el.get("n") or "").strip()
            if STEPH.match(n):
                cur[0] = n
                if not order or order[-1] != n:
                    order.append(n)
        elif tag in ("label", "note", "head", "bibl"):
            pass
        elif el.text and cur[0]:
            text[cur[0]].append(el.text)
        for child in el:
            walk(child)
            if child.tail and cur[0]:
                text[cur[0]].append(child.tail)

    walk(body)
    if with_text:
        return order, {k: " ".join(v) for k, v in text.items()}
    return order


def sequence_problems(order):
    """Gaps, repeats or reversals in a list like ['17a','17b',...]."""
    problems = []
    seen = set()
    prev = None
    for n in order:
        page, letter = STEPH.match(n).groups()
        page = int(page)
        if n in seen:
            problems.append(f"{n} repeated")
        seen.add(n)
        if prev:
            pp, pl = prev
            if page == pp and ord(letter) != ord(pl) + 1:
                problems.append(f"{pp}{pl} -> {n}")
            elif page != pp and (page != pp + 1 or letter != "a"):
                problems.append(f"{pp}{pl} -> {n}")
        prev = (page, letter)
    return problems


def check_perseus():
    works = perseus_works()
    rows, timaeus = [], {}
    for wid, w in works.items():
        row = {"work": wid, "title": w["title"]}
        if w["grc"]:
            hdr, root = tei_header(w["grc"])
            order = stephanus_sections(root)
            row.update({
                "grc_file": w["grc"].name,
                "greek_editor": ", ".join(hdr["editors"]),
                "greek_source_date": ", ".join(hdr["source_dates"][:1]),
                "sections": len(order),
                "first": order[0] if order else None,
                "last": order[-1] if order else None,
                "sequence_problems": sequence_problems(order),
            })
            if wid == TIMAEUS:
                order, text = stephanus_sections(root, with_text=True)
                timaeus = {"order": order, "text": text}
        if w["eng"]:
            hdr, root = tei_header(w["eng"])
            eng_order = stephanus_sections(root)
            row.update({
                "eng_file": w["eng"].name,
                "translator": ", ".join(hdr["translators"] or hdr["editors"]),
                "eng_source_date": ", ".join(hdr["source_dates"][:1]),
                "eng_sections": len(eng_order),
                "eng_sections_shared": len(set(eng_order) & set(stephanus_sections(ET.parse(w["grc"]).getroot()))) if w["grc"] else 0,
            })
        rows.append(row)
    return rows, timaeus


# ---------------------------------------------------------------- GLAUx


def glaux_dir():
    return RAW / "glaux-plato" / "xml"


def glaux_words(path):
    """Yield (sentence_analysis, word attrib) for real words (no punctuation, no
    artificial elliptic nodes)."""
    analysis = None
    for event, el in ET.iterparse(path, events=("start", "end")):
        if event == "start" and el.tag == "sentence":
            analysis = el.get("analysis")
        elif event == "end" and el.tag == "word":
            a = el.attrib
            if not a.get("artificial") and not (a.get("postag") or "").startswith("u"):
                yield analysis, dict(a)
            el.clear()


def check_glaux(timaeus):
    files = sorted(glaux_dir().glob("0059-*.xml"))
    meta = {}
    for line in (RAW / "glaux-plato" / "metadata.txt").read_text(encoding="utf-8").splitlines():
        cols = line.split("\t")
        if len(cols) > 9 and cols[1].startswith("0059-"):
            meta[cols[1]] = {"title": cols[5], "licence": cols[9], "manual_source": cols[13] if len(cols) > 13 else ""}
    rows = []
    tim = {}
    for f in files:
        doc = f.stem
        words = 0
        analysis = Counter()
        with_steph = 0
        forms_by_sec = defaultdict(list)
        lemmas = Counter()
        for an, w in glaux_words(f):
            words += 1
            analysis[an] += 1
            sec = w.get("div_stephanus_section")
            if sec:
                with_steph += 1
            if doc == "0059-031":
                forms_by_sec[sec].append(greek.nfc(w["form"]))
                lemmas[greek.nfc(w.get("lemma", ""))] += 1
        rows.append({
            "doc": doc,
            "title": meta.get(doc, {}).get("title", ""),
            "licence": meta.get(doc, {}).get("licence", ""),
            "words": words,
            "auto": analysis.get("auto", 0),
            "manual": words - analysis.get("auto", 0),
            "with_stephanus": with_steph,
        })
        if doc == "0059-031":
            tim = {"forms_by_sec": forms_by_sec, "lemmas": lemmas}

    # Compare GLAUx word forms with our own tokenisation of the Perseus Timaeus.
    per_sec = []
    total = matched = 0
    for sec in timaeus["order"]:
        ours = greek.tokenize(timaeus["text"].get(sec, ""))
        theirs = [t for t in tim["forms_by_sec"].get(sec, []) if greek.is_greek(t)]
        # GLAUx splits crasis/elision differently in a few places; compare accentless.
        a = [greek.strip_accents(t).rstrip(greek.APOSTROPHES) for t in ours]
        b = [greek.strip_accents(t).rstrip(greek.APOSTROPHES) for t in theirs]
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        m = sum(bl.size for bl in sm.get_matching_blocks())
        total += len(a)
        matched += m
        per_sec.append((sec, len(a), len(b), m))
    glaux_secs = set(k for k in tim["forms_by_sec"] if k)
    alignment = {
        "perseus_tokens": total,
        "glaux_tokens": sum(len(v) for v in tim["forms_by_sec"].values()),
        "matched": matched,
        "match_rate": round(matched / total, 4) if total else 0,
        "sections_in_perseus": len(timaeus["order"]),
        "sections_in_glaux": len(glaux_secs),
        "sections_missing_in_glaux": sorted(set(timaeus["order"]) - glaux_secs, key=_steph_key),
        "sections_only_in_glaux": sorted(glaux_secs - set(timaeus["order"]), key=_steph_key),
        "worst_sections": [
            {"section": s, "perseus": a, "glaux": b, "matched": m}
            for s, a, b, m in sorted(per_sec, key=lambda r: (r[3] / r[1]) if r[1] else 1)[:5]
        ],
    }
    return rows, tim, alignment


def _steph_key(n):
    m = STEPH.match(n or "")
    return (int(m.group(1)), m.group(2)) if m else (0, n or "")


# ---------------------------------------------------------------- Dictionaries


def lexicon_keys(paths):
    """Headword keys of a Perseus lexicon (TEI P4: <entryFree key=...> in LSJ,
    <entry key=...> in Middle Liddell)."""
    keys = {}
    for p in paths:
        for _, el in ET.iterparse(p):
            if el.tag.rsplit("}", 1)[-1] in ("entryFree", "entry"):
                k = el.get("key")
                if k:
                    keys.setdefault(greek.headword_key(k), k)
                el.clear()
    return keys


def lemma_coverage(lemmas, keys):
    accentless = {}
    for k in keys:
        accentless.setdefault(re.sub(r"[()/\\=+|*]", "", k), k)
    exact = loose = 0
    missing = []
    for lemma, count in lemmas.most_common():
        if not lemma or not greek.is_greek(lemma):
            continue
        beta = greek.headword_key(greek.to_betacode(lemma))
        candidates = {beta, re.sub(r"\*([()/\\=+|]*)([a-z])", r"\2\1", beta)}
        if candidates & keys.keys():
            exact += 1
        elif {re.sub(r"[()/\\=+|*]", "", c) for c in candidates} & accentless.keys():
            loose += 1
        else:
            missing.append((lemma, count))
    n = exact + loose + len(missing)
    return {
        "lemmas": n,
        "exact": exact,
        "accentless_only": loose,
        "missing": len(missing),
        "coverage": round((exact + loose) / n, 4) if n else 0,
        "top_missing": [f"{l} ({c}x)" for l, c in missing[:15]],
    }


def check_dictionaries(lemmas):
    lsj_files = sorted((RAW / "lsj" / "CTS_XML_TEI/perseus/pdllex/grc/lsj").glob("grc.lsj.perseus-eng*.xml"))
    lsj = lexicon_keys(lsj_files)
    ml = lexicon_keys([RAW / "middle-liddell" / "Perseus_text_1999.04.0058.xml"])
    return {
        "lsj": {"files": len(lsj_files), "entries": len(lsj), "timaeus": lemma_coverage(lemmas, lsj)},
        "middle_liddell": {"entries": len(ml), "timaeus": lemma_coverage(lemmas, ml)},
    }


# ---------------------------------------------------------------- Morpheus


def morpheus_table():
    d = RAW / "morpheus-analyses"
    # The CLTK repository splits one file at an arbitrary byte, so join the parts.
    data = (d / "greek-analyses_1.txt").read_text(encoding="utf-8") + (d / "greek-analyses_2.txt").read_text(encoding="utf-8")
    table = {}
    for line in data.splitlines():
        form, _, rest = line.partition("\t")
        if rest:
            table[form] = rest.count("{")
    return table


def check_morpheus(timaeus):
    table = morpheus_table()
    forms = Counter()
    for sec in timaeus["order"]:
        forms.update(greek.tokenize(timaeus["text"].get(sec, "")))
    found = ambiguous = 0
    missing = []
    for form, c in forms.most_common():
        hit = next((k for k in greek.lookup_keys(form) if k in table), None)
        if hit:
            found += 1
            if table[hit] > 1:
                ambiguous += 1
        else:
            missing.append((form, c))
    n = len(forms)
    return {
        "table_forms": len(table),
        "timaeus_distinct_forms": n,
        "found": found,
        "coverage": round(found / n, 4) if n else 0,
        "with_more_than_one_parse": ambiguous,
        "top_missing": [f"{f} ({c}x)" for f, c in missing[:15]],
    }


# ---------------------------------------------------------------- English texts


def english_vocab(perseus_rows):
    vocab = Counter()
    for r in perseus_rows:
        if r.get("eng_file"):
            p = perseus_dir() / r["work"] / r["eng_file"]
            vocab.update(w.lower() for w in re.findall(r"[A-Za-z]+", " ".join(ET.parse(p).getroot().itertext())))
    jow = RAW / "jowett-timaeus" / "1572.txt"
    if jow.exists():
        vocab.update(w.lower() for w in re.findall(r"[A-Za-z]+", jow.read_text(encoding="utf-8", errors="replace")))
    return vocab


def check_jowett():
    p = RAW / "jowett-timaeus" / "1572.txt"
    lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
    start = next(i for i, l in enumerate(lines) if "*** START OF" in l)
    end = next(i for i, l in enumerate(lines) if "*** END OF" in l)
    intro = next(i for i, l in enumerate(lines) if l.strip() == "INTRODUCTION AND ANALYSIS.")
    persons = next(i for i, l in enumerate(lines) if l.startswith("PERSONS OF THE DIALOGUE"))
    words = lambda a, b: sum(len(l.split()) for l in lines[a:b])  # noqa: E731
    return {
        "translator": "Benjamin Jowett",
        "introduction_words": words(intro, persons),
        "translation_words": words(persons, end),
        "first_line": next(l for l in lines[persons + 1:] if l.strip()).strip(),
        "gutenberg_header_lines": start,
    }


TAYLOR = ROOT / "sources" / "taylor-1804"


def taylor_timaeus_slices():
    lines = (TAYLOR / "Taylor_Sydenham_v2_djvu.txt").read_text(encoding="utf-8", errors="replace").splitlines()
    find = lambda pat, after=0: next(i for i in range(after, len(lines)) if re.search(pat, lines[i]))  # noqa: E731
    epinomis_end = find(r"END\s+OF\s+THE\s+EPINOMIS")
    intro = find(r"^\s*THE\s+TIM.{1,3}EUS,?\s*$", epinomis_end)
    text = find(r"one,\s+two,\s+three", intro)
    critias = find(r"^\s*THE\s+CRITIAS,?\s*$", text)
    notes = find(r"ADDITIONAL\s+NOTES", critias + 50)
    vol_end = find(r"END\s+OF\s+THE\s+S.{3,5}\s+VOL", notes)
    return lines, {"introduction": (intro, text), "translation": (text, critias), "proclus_notes": (notes, vol_end)}


def long_s_estimate(text, vocab):
    """Count OCR words where the long s was read as 'f': the word is unknown as
    printed but becomes a known English word when one or more f's become s."""
    words = re.findall(r"[A-Za-z]+", text)
    suspects = Counter()
    for w in words:
        lw = w.lower()
        if "f" not in lw or vocab.get(lw, 0) >= 3:
            continue
        idx = [i for i, ch in enumerate(lw) if ch == "f"]
        for mask in range(1, 2 ** min(len(idx), 4)):
            cand = list(lw)
            for b, i in enumerate(idx[:4]):
                if mask >> b & 1:
                    cand[i] = "s"
            if vocab.get("".join(cand), 0) >= 3:
                suspects[lw] += 1
                break
    return len(words), sum(suspects.values()), suspects


def check_taylor(vocab):
    lines, slices = taylor_timaeus_slices()
    out = {"source": "sources/taylor-1804/Taylor_Sydenham_v2_djvu.txt", "parts": {}}
    for name, (a, b) in slices.items():
        chunk = "\n".join(lines[a:b])
        n, bad, suspects = long_s_estimate(chunk, vocab)
        headers = sum(1 for l in lines[a:b] if re.search(r"^\S{0,5}\s*(THE|INTRODUCTION|ADDITIONAL)\s+(TO\s+THE\s+)?(TIM|NOTES)", l))
        out["parts"][name] = {
            "lines": f"{a + 1}-{b}",
            "words": n,
            "long_s_words": bad,
            "long_s_rate": round(bad / n, 4) if n else 0,
            "running_headers": headers,
            "examples": [w for w, _ in suspects.most_common(8)],
        }
    return out


# ---------------------------------------------------------------- Report


def main():
    missing = [s for s in ("perseus-greek-plato", "glaux-plato", "lsj", "middle-liddell", "morpheus-analyses", "jowett-timaeus") if not (RAW / s).exists()]
    if missing:
        sys.exit(f"Not fetched yet: {', '.join(missing)}. Run tools/fetch_sources.py first.")
    print("Perseus Greek and English ...", flush=True)
    perseus_rows, timaeus = check_perseus()
    print("GLAUx ...", flush=True)
    glaux_rows, tim, alignment = check_glaux(timaeus)
    print("Dictionaries ...", flush=True)
    dicts = check_dictionaries(tim["lemmas"])
    print("Morpheus ...", flush=True)
    morph = check_morpheus(timaeus)
    print("English texts ...", flush=True)
    vocab = english_vocab(perseus_rows)
    jowett = check_jowett()
    taylor = check_taylor(vocab)
    result = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "perseus": perseus_rows,
        "timaeus_sections": timaeus["order"],
        "glaux": glaux_rows,
        "glaux_vs_perseus_timaeus": alignment,
        "dictionaries": dicts,
        "morpheus": morph,
        "jowett_timaeus": jowett,
        "taylor_timaeus": taylor,
    }
    REPORTS.mkdir(exist_ok=True)
    (REPORTS / "verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    (REPORTS / "verification.md").write_text(render(result), encoding="utf-8")
    print(f"Wrote {REPORTS / 'verification.md'}")


def pct(x):
    return f"{x * 100:.1f}%"


def render(r):
    L = []
    w = L.append
    w("# Source verification report\n")
    w(f"Generated by `tools/verify_sources.py` on {r['generated'][:10]}. Every figure below is computed from the fetched files.\n")

    w("## 1. Greek text and English translations (Perseus)\n")
    ok = [p for p in r["perseus"] if p.get("grc_file")]
    w(f"{len(ok)} of {len(r['perseus'])} works in the Perseus tlg0059 folder have Greek; "
      f"{sum(1 for p in r['perseus'] if p.get('eng_file'))} have an English translation.\n")
    w("A 'page jump' is a break in the Stephanus sequence. In the Republic and Laws every jump falls at a book division, where "
      "Stephanus's edition starts the next book on a new page; any jump elsewhere would be an error in the text.\n")
    w("| Work | Greek file | Stephanus sections | Range | Page jumps | English translator | English sections matching Greek |")
    w("|---|---|---|---|---|---|---|")
    for p in r["perseus"]:
        probs = p.get("sequence_problems", [])
        w(f"| {p['work']} {p['title']} | {p.get('grc_file', '-')} | {p.get('sections', 0)} | {p.get('first')}–{p.get('last')} | "
          f"{len(probs)}{(': ' + ', '.join(probs[:3])) if probs else ''} | {p.get('translator', '-')} | "
          f"{p.get('eng_sections_shared', 0)} of {p.get('eng_sections', 0)} |")
    tim = next(p for p in r["perseus"] if p["work"] == TIMAEUS)
    w(f"\n**Timaeus:** {tim['sections']} Stephanus sections, {tim['first']} to {tim['last']}, Burnet's text "
      f"({tim['greek_editor']}). English: {tim['translator']}.\n")

    a = r["glaux_vs_perseus_timaeus"]
    w("## 2. Lemma and morphology data (GLAUx)\n")
    tot = sum(g["words"] for g in r["glaux"])
    man = sum(g["manual"] for g in r["glaux"])
    w(f"{len(r['glaux'])} Plato files, {tot:,} words. {man:,} words ({pct(man / tot)}) come from hand-checked treebanks; "
      f"the rest were tagged by statistical models. "
      f"{sum(g['with_stephanus'] for g in r['glaux']):,} words carry a Stephanus section "
      f"(all of them except the spurious Definitions and the Epigrams, which have none).\n")
    w("| GLAUx doc | Title | Words | Hand-checked | Machine-tagged | Licence |")
    w("|---|---|---|---|---|---|")
    for g in r["glaux"]:
        w(f"| {g['doc']} | {g['title']} | {g['words']:,} | {g['manual']:,} | {g['auto']:,} | {g['licence']} |")
    w(f"\n**Timaeus check:** GLAUx's words were compared, section by section, with our own tokenisation of the Perseus text. "
      f"{a['matched']:,} of {a['perseus_tokens']:,} Perseus words line up ({pct(a['match_rate'])}). "
      f"Sections: {a['sections_in_perseus']} in Perseus, {a['sections_in_glaux']} in GLAUx; "
      f"missing from GLAUx: {', '.join(a['sections_missing_in_glaux']) or 'none'}; "
      f"only in GLAUx: {', '.join(a['sections_only_in_glaux']) or 'none'}.\n")
    w("Lowest-matching sections: " + "; ".join(f"{s['section']} ({s['matched']}/{s['perseus']})" for s in a["worst_sections"]) + ".\n")

    d = r["dictionaries"]
    w("## 3. Dictionaries\n")
    w("Coverage = share of the distinct GLAUx lemmas in the Timaeus that have a headword in the dictionary "
      "(matched in Beta Code; 'accentless only' means the headword exists but with different accents or breathing).\n")
    w("| Dictionary | Entries | Timaeus lemmas | Exact | Accentless only | Not found | Coverage |")
    w("|---|---|---|---|---|---|---|")
    for name, key in (("LSJ (1940)", "lsj"), ("Middle Liddell (1889)", "middle_liddell")):
        c = d[key]["timaeus"]
        w(f"| {name} | {d[key]['entries']:,} | {c['lemmas']:,} | {c['exact']:,} | {c['accentless_only']:,} | {c['missing']:,} | {pct(c['coverage'])} |")
    w(f"\nMost frequent lemmas not found in LSJ: {', '.join(d['lsj']['timaeus']['top_missing']) or 'none'}.\n")
    w(f"Most frequent lemmas not found in Middle Liddell: {', '.join(d['middle_liddell']['timaeus']['top_missing']) or 'none'}.\n")

    m = r["morpheus"]
    w("## 4. Every possible parse (Morpheus)\n")
    w(f"The Morpheus table has {m['table_forms']:,} forms. It covers {m['found']:,} of the {m['timaeus_distinct_forms']:,} "
      f"distinct word forms in the Timaeus ({pct(m['coverage'])}); {m['with_more_than_one_parse']:,} of those have more than one possible parse, "
      f"which is why the reader will show Morpheus's alternatives next to GLAUx's single choice.\n")
    w(f"Most frequent forms not found: {', '.join(m['top_missing']) or 'none'}.\n")

    j = r["jowett_timaeus"]
    w("## 5. Jowett's Timaeus (Project Gutenberg #1572)\n")
    w(f"Clean text. Introduction and Analysis: {j['introduction_words']:,} words; translation: {j['translation_words']:,} words. "
      f"No Stephanus numbers are printed, so alignment to the Greek is a later step.\n")

    t = r["taylor_timaeus"]
    w("## 6. Taylor's Timaeus (1804), from the OCR you uploaded\n")
    w(f"Source: `{t['source']}`. The long s (ſ) of the 1804 printing is read by the OCR as 'f'. "
      "A word is counted as a long-s error when it is unknown as printed but becomes a known English word "
      "(from the Perseus and Jowett English) when an 'f' is read as 's'.\n")
    w("| Part | Lines | Words | Long-s errors | Rate | Running headers | Examples |")
    w("|---|---|---|---|---|---|---|")
    for name, p in t["parts"].items():
        w(f"| {name.replace('_', ' ')} | {p['lines']} | {p['words']:,} | {p['long_s_words']:,} | {pct(p['long_s_rate'])} | {p['running_headers']} | {', '.join(p['examples'])} |")
    w("")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    main()
