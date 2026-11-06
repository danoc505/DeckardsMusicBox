"""Milestone 15: a short meaning for any Greek word the reader shows.

Burnet's words have the word box. Every other Greek word (in a commentary note,
the scholia, an ancient introduction, Taylor's footnotes, a dictionary entry)
can be tapped too, and gets a small box with:

  - the dictionary form (lemma) of the word: GLAUx's tag where the same form is
    tagged in Plato, and every Morpheus analysis of the form, with Morpheus'
    own short English gloss;
  - the first sense of its entry in Middle Liddell (LSJ where Middle Liddell
    has none), as printed.

Nothing is guessed: a form with no analysis says so, and a meaning is always
the dictionary's words, named. The build (build_forms) copies the Morpheus
analyses of the forms outside Plato into the morph table, so the dictionaries
built after it have entries for their lemmas too.
"""
import html
import json
import re
from pathlib import Path

import greek

ROOT = Path(__file__).resolve().parent.parent
TAYLOR_VOL1 = ROOT / "texts" / "taylor-1804" / "vol1"


# The scans print ϑ and ϕ for θ and φ (Hermann's Teubner type); the dictionaries and Morpheus do not.
_SAME = str.maketrans({"ϑ": "θ", "ϕ": "φ", "ϰ": "κ", "ϱ": "ρ", "ϖ": "π"})


def norm(form):
    return greek.nfc(greek.nfc(form).translate(_SAME))


def plain_key(beta):
    """A Morpheus or Beta Code key with accents, breathings and length marks dropped: for Greek printed without accents."""
    return re.sub(r"[()/\\=+|_^*]", "", beta.lower())


def _forms(text):
    return {greek.nfc(w).rstrip(greek.APOSTROPHES) for w in greek.WORD.findall(text or "") if len(w) > 1}


def collect_forms(db):
    """Every Greek word shown outside Burnet's text: the notes, the ancient texts and Taylor's volume I."""
    forms = set()
    for (body,) in db.execute("SELECT body FROM note WHERE body GLOB '*[Ͱ-Ͽἀ-῿]*'"):
        forms |= _forms(body)
    for (lt,) in db.execute("SELECT lemma_text FROM note WHERE lemma_text IS NOT NULL"):
        forms |= _forms(lt)
    for (text,) in db.execute("SELECT text FROM ancient_section"):
        forms |= _forms(text)
    for p in sorted(TAYLOR_VOL1.glob("*.json")):
        forms |= _forms(p.read_text(encoding="utf-8"))
    return forms


def build_forms(db, morpheus_lines, parse_morpheus, morpheus_table):
    """gloss_form: each form outside Plato, with the Morpheus key it matched; and the
    Morpheus analyses of those keys in morph. Returns statistics."""
    known = {r[0] for r in db.execute("SELECT DISTINCT form FROM token")}
    forms = sorted(f for f in collect_forms(db) if f not in known and greek.is_greek(f))
    keys = {f: greek.lookup_keys(norm(f)) + greek.lookup_keys(norm(f).lower()) for f in forms}
    morph = morpheus_lines({k for ks in keys.values() for k in ks})
    # Greek printed without accents (Taylor's footnotes, some scholia): the Morpheus forms with the same bare letters,
    # used only when the form itself has no accent or breathing to match.
    bare = {f for f in forms if not any(k in morph for k in keys[f]) and not re.search(r"[()/\\=]", greek.to_betacode(norm(f)))}
    if bare:
        want = {plain_key(greek.to_betacode(norm(f))) for f in bare}
        by_plain = {}
        for k in morpheus_table():
            pk = plain_key(k)
            if pk in want and pk not in by_plain:
                by_plain[pk] = k
        morph.update(morpheus_lines(set(by_plain.values())))
        for f in bare:
            k = by_plain.get(plain_key(greek.to_betacode(norm(f))))
            if k:
                keys[f] = keys[f] + [k]
    have = {r[0] for r in db.execute("SELECT DISTINCT beta_key FROM morph")}
    n_hit = n_bare = 0
    for f in forms:
        k = next((k for k in keys[f] if k in morph), None)
        n_hit += k is not None
        n_bare += f in bare and k is not None
        method = None if not k else "letters-only" if f in bare else "same-form"
        db.execute("INSERT OR IGNORE INTO gloss_form VALUES (?, ?, ?)", (f, k, method))
        if k and k not in have:
            have.add(k)
            for n, (lemma, gl, parse) in enumerate(parse_morpheus(morph[k])):
                db.execute("INSERT OR IGNORE INTO morph VALUES (?,?,?,?,?,?,?)",
                           (k, n, lemma, greek.from_betacode(lemma), gl, parse, "morpheus-analyses"))
    return {"forms outside Plato": len(forms), "with a Morpheus analysis": n_hit,
            "of them printed without accents, matched by their letters": n_bare}



# ---------------------------------------------------------------- the reader's lookup

def clean_form(word):
    w = greek.nfc(word or "").strip()
    w = re.sub(r"^[^Ͱ-Ͽἀ-῿]+|[^Ͱ-Ͽἀ-῿̀-ͯ" + greek.APOSTROPHES + r"]+$", "", w)
    return w.rstrip(greek.APOSTROPHES) if len(w) > 1 else w


def first_sense(entry_html, limit=320):
    """The entry as printed up to its second numbered sense, as plain text, cut at `limit`."""
    h = entry_html
    m = re.search(r'<(?:div|span)[^>]*class="[^"]*sense[^"]*"[^>]*>', h)
    if m:
        n2 = [x.start() for x in re.finditer(r'<(?:div|span)[^>]*class="[^"]*sense[^"]*"[^>]*>', h)]
        if len(n2) > 1:
            h = h[:n2[1]]
    text = html.unescape(re.sub(r"<[^>]+>", "", h))
    text = re.sub(r"\s+", " ", text).strip()
    return text if len(text) <= limit else text[:limit].rsplit(" ", 1)[0] + " …"


def translations_in(entry_html, n=6):
    """The English the dictionary prints as its translations of the word (<em class="tr">), first n, in order."""
    out = []
    for m in re.finditer(r'<em class="tr">(.*?)</em>', entry_html, re.S):
        t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", m.group(1)))).strip(" ,;:")
        if t and t not in out:
            out.append(t)
        if len(out) == n:
            break
    return out


def gloss(lib, word):
    """{form, lemmas: [{lemma, by, gloss, parses}], meaning: {lexicon, headword, text, method, lemma}}."""
    printed = clean_form(word)
    out = {"form": printed, "lemmas": [], "meaning": None}
    if not printed or not greek.is_greek(printed):
        return out
    form = norm(printed)
    lemmas = {}

    def add(lemma, by, gl=None, parse=None):
        lemma = greek.nfc(re.sub(r"\d", "", lemma or ""))
        if not lemma or lemma.startswith("-") or not re.fullmatch(r"[Ͱ-Ͽἀ-῿̀-ͯ]+", lemma):
            return
        e = lemmas.setdefault(lemma, {"lemma": lemma, "by": [], "gloss": None, "parses": []})
        if by not in e["by"]:
            e["by"].append(by)
        if gl and gl.strip() and not e["gloss"]:
            e["gloss"] = gl.strip()
        if parse and parse not in e["parses"]:
            e["parses"].append(parse)

    for f in dict.fromkeys([form, form.lower()]):
        for r in lib.rows("SELECT g.lemma, count(*) AS n FROM token t JOIN tag g ON g.token_id = t.id "
                          "WHERE t.form = ? AND g.lemma != '' GROUP BY g.lemma ORDER BY n DESC LIMIT 3", f):
            add(r["lemma"], f"GLAUx (tagged so {r['n']}× in Plato)")
    key = None
    for f in dict.fromkeys([form, form.lower(), printed]):
        r = lib.one("SELECT morph_key, 'same-form' AS method FROM token WHERE form = ? AND morph_key IS NOT NULL LIMIT 1", f) or \
            lib.one("SELECT morph_key, method FROM gloss_form WHERE form = ? AND morph_key IS NOT NULL", f)
        if r:
            key = r["morph_key"]
            out["letters_only"] = r["method"] == "letters-only"
            break
    if not key:
        for k in greek.lookup_keys(form) + greek.lookup_keys(form.lower()):
            if lib.one("SELECT 1 AS x FROM morph WHERE beta_key = ? LIMIT 1", k):
                key = k
                break
    if key:
        for r in lib.rows("SELECT lemma, gloss, parse FROM morph WHERE beta_key = ? ORDER BY n", key):
            add(r["lemma"], "Morpheus", r["gloss"], r["parse"])
    out["lemmas"] = list(lemmas.values())[:4]
    # The meaning: the first lemma with an entry, Middle Liddell before LSJ; else the form itself as a headword.
    for lemma in [e["lemma"] for e in out["lemmas"]] + [form]:
        found = lib.lookup(lemma)["entries"]
        for lex in ("middle-liddell", "lsj"):
            es = found.get(lex) or []
            if es:
                e = es[0]
                label = lib.one("SELECT label FROM lexicon WHERE id = ?", lex)
                out["meaning"] = {"lexicon": label["label"] if label else lex, "lexicon_id": lex, "headword": e["headword"],
                                  "senses": translations_in(e["html"]), "text": first_sense(e["html"]),
                                  "method": e["method"], "lemma": lemma}
                return out
    return out


if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(ROOT / "tools"))
    import serve
    print(json.dumps(gloss(serve.Library(), sys.argv[1]), ensure_ascii=False, indent=1))
