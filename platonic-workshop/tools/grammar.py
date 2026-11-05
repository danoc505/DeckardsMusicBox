"""Plain-English grammar notes for a tagged word.

Two printed sources, quoted as written:

  Smyth, A Greek Grammar for Colleges (1920), Perseus text 1999.04.0007.
      For each grammatical category of a parse (aorist, genitive, middle ...)
      the section of Smyth listed in sources/grammar/smyth-sections.json is
      shown: the rule as Smyth states it, and the whole section on request.
  The Ancient Greek Dependency Treebank guidelines (AGDT 2.0), which GLAUx
      follows for its sentence roles (SBJ, OBJ, ATR ...): the label's name and
      the guidelines' own definition.

The only words that are not quoted are the category names ('aorist',
'genitive'), which are the decoded tag itself. Which Smyth section goes
with which category is a choice recorded, with its reason, in the JSON file.
"""
import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

import greek

ROOT = Path(__file__).resolve().parent.parent
SECTION_MAP = ROOT / "sources" / "grammar" / "smyth-sections.json"
SMYTH_URL = "http://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0007:smythp={n}"

_INLINE_GREEK = {"foreign", "quote", "orth"}
_BLOCK = {"p", "list", "item", "table", "row", "div1", "div2", "div3", "div4", "div5", "div6", "cit"}


def section_map():
    return json.loads(SECTION_MAP.read_text(encoding="utf-8"))


# ---------------------------------------------------------------- Smyth


def smyth_sections(path, wanted):
    """{n: {'n', 'heading', 'rule_html', 'full_html', 'text'}} for the sections asked
    for (strings like '1923'). A section runs from its <milestone unit="smythp">
    to the next one; its rule is the text before the first lettered note ('a.')."""
    wanted = set(wanted)
    root = ET.parse(path).getroot()
    out = {}
    state = {"cur": None, "head": "", "buf": None}

    def emit(s):
        if state["buf"] is not None:
            state["buf"].append(s)

    def walk(el):
        for child in el:
            tag = child.tag
            if tag == "milestone" and child.get("unit") == "smythp":
                n = (child.get("n") or "").strip()
                state["cur"] = n
                if n in wanted:
                    state["buf"] = []
                    out[n] = {"n": n, "heading": state["head"], "parts": state["buf"]}
                else:
                    state["buf"] = None
            elif tag == "head":
                state["head"] = " ".join(_inline(child).split())
                state["head"] = re.sub(r"<[^>]+>", "", state["head"])
            elif tag in _BLOCK:
                if tag in ("p", "item"):
                    emit("\n\n")
                emit(html.escape(child.text or "") if tag not in ("table", "row") else "")
                walk(child)
                if tag == "cell":
                    emit(" ")
            elif tag == "cell":
                emit(_inline(child) + " ")
            elif tag == "pb":
                pass
            else:
                emit(_inline(child))
            emit(html.escape(child.tail or "") if child.tail else "")

    walk(root.find(".//body"))
    for n, sec in out.items():
        full = "".join(sec.pop("parts"))
        full = re.sub(r"[ \t\r\n]*\n\n[ \t\r\n]*", "\n\n", full)
        full = re.sub(r"[ \t\r]+", " ", full).strip()
        paras = [p.strip() for p in full.split("\n\n") if p.strip()]
        # The rule: everything before the first lettered note ('<b>a.</b>').
        joined = "\n\n".join(paras)
        cut = re.search(r"<b>a\.</b>", joined)
        rule = joined[: cut.start()].strip() if cut else joined
        sec["rule_html"] = "".join(f"<p>{p}</p>" for p in rule.split("\n\n") if p.strip())
        sec["full_html"] = "".join(f"<p>{p}</p>" for p in paras)
        sec["text"] = re.sub(r"<[^>]+>", "", joined)
        sec["url"] = SMYTH_URL.format(n=n)
    return out


def _inline(el):
    """An inline element and its children as small, safe HTML."""
    tag = el.tag
    g = el.get("lang") == "greek"
    inner = (html.escape(greek.from_betacode(el.text)) if g and el.text else html.escape(el.text or ""))
    for c in el:
        if c.tag == "pb":
            inner += html.escape(c.tail or "")
            continue
        inner += _inline(c)
        tail = c.tail or ""
        inner += html.escape(greek.from_betacode(tail) if g else tail)
    if tag in _INLINE_GREEK and g:
        return f'<span lang="grc">{inner}</span>'
    if tag == "emph" and el.get("rend") == "bold":
        return f"<b>{inner}</b>"
    if tag in ("emph", "gloss", "term", "title"):
        return f"<i>{inner}</i>"
    if tag == "ref" and (el.get("target") or "").startswith("s"):
        n = el.get("target")[1:]
        return f'<a class="smyth" href="{SMYTH_URL.format(n=html.escape(n))}" target="_blank" rel="noopener">{inner}</a>'
    return inner


# ---------------------------------------------------------------- treebank labels


def agdt_labels(path):
    """{code: {'code', 'name', 'definition'}} from the AGDT 2.0 guidelines (Markdown
    with HTML), section 3: 'The PRED ("predicate") function is reserved for ...'.
    The links to example trees ('(tree1)') are dropped; nothing else is changed."""
    t = Path(path).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"<h4>3\.\d+\s+([^<]+)</h4>\s*(.*?)(?=<h[234]>)", t, re.S):
        codes = m.group(1).strip()
        body = re.sub(r"<[^>]+>", "", m.group(2))
        body = html.unescape(body)
        body = re.sub(r"\s*\((?:tree\d(?:,[^)]*)?\s*)+\)", "", body)
        body = re.sub(r"\(\s*(tree\d\s*)+\)", "", body)
        body = " ".join(body.split())
        name = re.search(r'\("([^"]+)"', body)
        for code in re.split(r"/", codes):
            code = code.strip()
            if code == "Suffixes":
                continue
            out[code] = {"code": code, "name": name.group(1) if name else "", "definition": body}
    # The suffixes: _CO (coordinated) and _AP (apposition) are explained under COORD and Suffixes.
    suf = re.search(r"<h4>3\.\d+\s+Suffixes</h4>\s*(.*?)(?=<h[234]>)", t, re.S)
    if suf:
        body = " ".join(html.unescape(re.sub(r"<[^>]+>", "", suf.group(1))).split())
        out["_suffixes"] = {"code": "_CO, _AP", "name": "suffixes", "definition": body}
    co = re.search(r"Every coordinated constituent takes the suffix _CO[^.]*\.", t)
    if co:
        out["_CO"] = {"code": "_CO", "name": "coordinated", "definition": " ".join(re.sub(r"<[^>]+>", "", co.group(0)).split())}
    return out
