"""Dictionaries: Middle Liddell and LSJ entries, and LSJ's own lists of
abbreviations.

Everything shown comes from the dictionaries as Perseus encoded them. The
only things this module adds are markup (Greek letters for Beta Code, links
for citations) and, around each abbreviation, the expansion LSJ itself gives
in its front matter. Nothing is paraphrased, shortened or generated.

    entries(paths, tag, wanted)   -> the entries whose headword key is wanted
    abbreviations(front_xml)      -> LSJ's List I (authors and works) and List V (general)
    render(entry, lexicon, abbr)  -> safe HTML, abbreviations marked with their expansion
"""
import html
import re
import xml.etree.ElementTree as ET

import greek

GREEK_LANG = "greek"


# ---------------------------------------------------------------- keys


def entry_key(key):
    """A lexicon key ('dhmiourgo/s', 'a)/n1', '*)aqhna=') -> the key used for
    matching: homonym digits and vowel-length marks dropped."""
    return greek.headword_key(key or "")


def unaccented_key(key):
    """Accents dropped; breathings, iota subscript and diaeresis kept."""
    return re.sub(r"[/\\=]", "", entry_key(key)).lower()


def accentless_key(key):
    """Letters only: no breathings, accents, iota subscript, diaeresis or capital mark."""
    return re.sub(r"[()/\\=+|*'\-]", "", entry_key(key)).lower()


def lemma_keys(lemma):
    """Beta Code keys for a lemma as GLAUx or Morpheus writes it, most exact first.
    A capital is tried as written and lower-cased (LSJ keys proper names with *)."""
    beta = entry_key(greek.to_betacode(greek.nfc(lemma)))
    low = re.sub(r"\*([()/\\=+|]*)([a-z])", r"\2\1", beta)
    return [k for i, k in enumerate([beta, low]) if k and k not in [beta, low][:i]]


# ---------------------------------------------------------------- reading the files


def entries(paths, tag, wanted=None):
    """Yield (key, element) for each entry in the files, in order. With
    `wanted`, only entries whose matching key or accentless key is in it."""
    for p in paths:
        for _, el in ET.iterparse(p):
            if el.tag != tag:
                continue
            k = el.get("key") or ""
            if wanted is None or entry_key(k) in wanted or accentless_key(k) in wanted:
                yield k, el
            else:
                el.clear()


def headword(key):
    """The headword in Greek letters, from the entry's key (homonym digits dropped)."""
    return greek.from_betacode(key)


# ---------------------------------------------------------------- LSJ abbreviation lists


def _text(el):
    """Item text, Greek in Greek letters, with the printed line-end hyphenation joined up."""
    def walk(e):
        g = e.get("lang") == GREEK_LANG
        out = [greek.from_betacode(e.text) if g and e.text else (e.text or "")]
        for c in e:
            out.append(walk(c))
            out.append(c.tail or "")
        return "".join(out)
    s = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", walk(el))
    return " ".join(s.split())


def abbreviations(front):
    """LSJ's front matter (<front> element) -> {
        'authors': {abbr: {'name', 'epithet', 'date', 'works': {abbr: title}}},
        'general': {abbr: expansion},
        'unparsed': [items that did not have the expected shape]}

    List I items look like '<hi>Plato</hi> Philosophus [Pl.] <date>v/iv B.C.</date> Ed. ...'
    followed by work items '<title>Ti. = Timaeus</title>'. List V items look like
    'acc. = accusative' or 'Adv., Advbs. = Adverb, Adverbs'."""
    out = {"authors": {}, "general": {}, "derived": {}, "publications": {}, "unabbreviated": {}, "unparsed": []}
    lists = {d.get("n"): d for d in front.iter("div1")}
    author = None
    for item in lists["1"].iter("item"):
        bold = item.find("hi")
        text = _text(item)
        if bold is not None and bold.get("rend") == "bold":
            name = _text(bold)
            m = re.match(re.escape(name) + r"\s*([^\[]*?)\s*\[([^\]]+)\]", text)
            date = item.find("date")
            if not m:
                # Cited without an abbreviation of its own (Novum Testamentum): its works
                # are still listed under it, and are cited by title alone.
                author = {"name": name, "epithet": "", "date": "", "works": {}}
                out["unabbreviated"][name] = author
                continue
            abbr = m.group(2).strip()
            author = {"name": name, "epithet": m.group(1).strip(), "date": _text(date) if date is not None else "", "works": {}}
            # One abbreviation can name two authors (Ach.Tat.): keep the first, note the second.
            if abbr in out["authors"]:
                out["authors"][abbr].setdefault("also", []).append(f"{name} {author['epithet']}".strip())
                author = out["authors"][abbr]
            else:
                out["authors"][abbr] = author
            continue
        if author is None:
            continue
        m = re.match(r"(.+?)\s+=\s+(.+)$", text)
        if not m:
            if item.find("title") is not None and len(text) < 40:
                author["works"].setdefault(text.rstrip(",. "), text.rstrip(",. "))  # 'Ion': printed in full
            continue
        for k, v in _pairs(m.group(1), m.group(2)):
            author["works"].setdefault(k, v)
    for item in lists["5"].iter("item"):
        text = _text(item)
        m = re.match(r"(.+?)\s+=\s+(.+)$", text)
        if not m:
            out["unparsed"].append(text)
            continue
        keys, value = m.group(1), m.group(2)
        # 'c. gen. pers., etc. = cum genitivo personae, etc.': the 'etc.' belongs to both sides.
        if re.search(r",?\s*etc\.$", keys) and keys.strip() != "etc.":
            keys = re.sub(r",?\s*etc\.$", "", keys)
            value = re.sub(r",?\s*etc\.?(?=$|,)", "", value, count=1)
        for k, v in _pairs(keys.replace(" or ", ", "), value):
            _add(out["general"], k, v)
        # Each word of a phrase whose words line up one for one ('c. gen. pers.' =
        # 'cum genitivo personae') also explains that word on its own ('c.' = 'cum').
        kw, vw = keys.split(), value.rstrip(",").split()
        if len(kw) > 1 and len(kw) == len(vw) and all(w.endswith(".") for w in kw):
            for k, v in zip(kw, vw):
                if k not in out["general"]:
                    out["derived"][k] = f"{v} (from LSJ's '{keys} = {value}')"
    # Lists II-IV: inscriptions, papyri and periodicals, 'IG = Inscriptiones Graecae, ...'.
    for n, name in (("2", "II"), ("3", "III"), ("4", "IV")):
        for item in lists[n].iter("item"):
            m = re.match(r"(.+?)\s+=\s+(.+)$", _text(item))
            if m and len(m.group(1)) < 40:
                for k in re.split(r",\s+", m.group(1)):
                    out["publications"].setdefault(k.strip(), (name, m.group(2).rstrip(",. ")))
    for k, v in out["derived"].items():
        out["general"].setdefault(k, v.split(" (from ")[0])
    return out


def _add(d, k, v):
    """One abbreviation with two meanings in the list ('Epic. = Epicus', 'Epic. = Epidaurus')
    keeps both, in the printed order."""
    if k in d and v not in d[k]:
        d[k] = f"{d[k]}; or {v}"
    else:
        d.setdefault(k, v)


def _pairs(keys, value):
    """'Adv., Advbs.' + 'Adverb, Adverbs' -> two pairs; 'Hp.Ma., Mi.' + 'Hippias Major, Minor'
    -> ('Hp.Ma.', 'Hippias Major'), ('Hp.Mi.', 'Hippias Minor'); otherwise one pair per key,
    each with the whole value. A trailing ', v. I' (see List I) is kept as printed."""
    value = value.rstrip(", ")
    ks = [k.strip() for k in re.split(r",\s+", keys.strip()) if k.strip()]
    vs = [v.strip() for v in re.split(r",\s+", value)]
    if len(ks) > 1 and len(vs) == len(ks):
        out = list(zip(ks, vs))
        # 'Hp.Ma., Mi.': the second abbreviation continues the first.
        if "." in ks[0][:-1] and not re.search(r"\.", ks[1][:-1]):
            stem = ks[0][: ks[0][:-1].rfind(".") + 1]
            words = vs[0].split()
            out = [(ks[0], vs[0]), (stem + ks[1], " ".join(words[:-1] + [vs[1]]))]
        return out
    return [(k, value) for k in ks]


# ---------------------------------------------------------------- rendering

# Elements whose text is an abbreviation looked up in the general list as a whole.
_GRAM_TAGS = {"gram", "pos", "tns", "mood", "number", "lbl", "abbr", "per"}
# Free-text abbreviations: a word ending in a full stop, optionally followed by
# one or two more ('c. gen.', 'dub. sens.', 'v. l. in'). Single capitals ('A.')
# are left alone in running text: they are authors only inside <author>.
_FREE = re.compile(r"(?<![\w.])((?:[A-Za-z][A-Za-z]*\.)(?:\s?[a-z][a-z]*\.){0,2})")
_URN = re.compile(r"urn:cts:greekLit:(tlg\d{4})\.(tlg\d{3})(?:\.[\w-]+)?:([\w.]+)")


class Renderer:
    """TEI entry -> HTML. One instance per lexicon; `abbr` is the parsed LSJ lists."""

    def __init__(self, lexicon_id, abbr):
        self.lexicon = lexicon_id
        self.authors = abbr["authors"]
        self.general = abbr["general"]
        self.publications = abbr.get("publications", {})
        # Works cited by title alone (Ev.Matt.): found under whichever entry of List I
        # lists them, if exactly one does.
        index = {}
        for a in list(abbr["authors"].values()) + list(abbr.get("unabbreviated", {}).values()):
            for w, title in a["works"].items():
                index.setdefault(w, set()).add((a["name"], title))
        self.works_alone = {w: next(iter(v)) for w, v in index.items() if len(v) == 1}
        self.stats = {"abbr_expanded": 0, "abbr_unknown": 0}

    # -- abbreviations

    def _ab(self, shown, expansion, kind, detail=""):
        """An abbreviation as printed, carrying LSJ's expansion (data-x) and, for an
        author, the epithet and date List I gives (data-d)."""
        self.stats["abbr_expanded"] += 1
        if "; or " in expansion:
            kind += " amb"  # two meanings in the list: shown on hover, never swapped in
        full = expansion + (f" ({detail})" if detail else "")
        d = f' data-d="{html.escape(detail, quote=True)}"' if detail else ""
        return (f'<abbr class="ab {kind}" data-x="{html.escape(expansion, quote=True)}"{d} '
                f'title="{html.escape(full, quote=True)}">{html.escape(shown)}</abbr>')

    def general_lookup(self, s):
        s = s.strip()
        for cand in (s, s.replace(" ", ""), s[:1].lower() + s[1:]):
            if cand in self.general:
                return self.general[cand]
        return None

    def free_text(self, s):
        """Escape running text, marking the abbreviations LSJ's general list explains.
        At each candidate the longest run of words the list explains is taken ('c. gen.
        pers.' before 'c.'), and the search goes on straight after it, so 'c. gen.' gives
        'cum' and 'genitive' when only the single words are listed."""
        out, pos = [], 0
        m = _FREE.search(s, pos)
        while m:
            words = list(re.finditer(r"[A-Za-z]+\.", m.group(1)))
            taken = 0
            for n in range(len(words), 0, -1):
                cand = m.group(1)[: words[n - 1].end()]
                if re.fullmatch(r"[A-Z]\.", cand):
                    continue
                exp = self.general_lookup(cand)
                if exp:
                    out.append(html.escape(s[pos:m.start()]))
                    out.append(self._ab(cand, exp, "gen"))
                    pos = m.start() + len(cand)
                    taken = len(cand)
                    break
            # Nothing explained here: step past the first word and look again.
            nxt = m.start() + (taken or words[0].end())
            m = _FREE.search(s, nxt)
        out.append(html.escape(s[pos:]))
        return "".join(out)

    # -- elements

    def render(self, el):
        self.cur_author = None   # author abbreviation in force, for titles without one
        self.author_by_tlg = {}  # tlg author id -> abbreviation seen with it in this entry
        body = re.sub(r"\s+", " ", self._children(el)).strip()
        # The TEI's line breaks leave a space before printed commas and semicolons ('7.31 ,').
        return re.sub(r" (?=[,;)])", "", body)

    def _children(self, el, greek_ctx=False):
        parts = [self._txt(el.text, greek_ctx)]
        for c in el:
            parts.append(self._el(c, greek_ctx))
            parts.append(self._txt(c.tail, greek_ctx))
        return "".join(parts)

    def _txt(self, s, greek_ctx):
        if not s:
            return ""
        if greek_ctx:
            return html.escape(greek.from_betacode(s))
        return self.free_text(s)

    def _el(self, e, greek_ctx):
        tag = e.tag
        is_greek = e.get("lang") == GREEK_LANG
        if tag == "pb":
            return ""
        if tag == "orth":
            inner = self._children(e, True)
            return f'<b class="hw" lang="grc">{inner}</b>'
        if tag in ("foreign", "quote", "gen", "itype", "pron", "etym", "ref", "note") and is_greek:
            inner = self._children(e, True)
            if tag == "ref":
                target = greek.from_betacode("".join(e.itertext()).strip())
                return f'<a class="xref" lang="grc" data-lemma="{html.escape(target, quote=True)}">{inner}</a>'
            return f'<span lang="grc">{inner}</span>'
        if tag == "foreign":
            return f"<i>{self._children(e)}</i>"
        if tag == "sense":
            n = e.get("n") or ""
            level = e.get("level") or "0"
            label = f'<b class="sn">{html.escape(n)}.</b> ' if n and n != "0" else ""
            return f'<div class="sense l{html.escape(level)}">{label}{self._children(e)}</div>'
        if tag == "tr":
            return f'<em class="tr">{self._children(e, greek_ctx)}</em>'
        if tag == "trans":
            return self._children(e, greek_ctx)
        if tag == "bibl":
            return self._bibl(e)
        if tag == "author":
            return self._author(e)
        if tag == "usg":
            return self._usg(e)
        if tag in _GRAM_TAGS:
            t = "".join(e.itertext()).strip()
            exp = self.general_lookup(t) if t else None
            if exp and t not in ("=",):
                lead = (e.text or "")[: len(e.text or "") - len((e.text or "").lstrip())]
                return lead + self._ab(t, exp, "gen")
            return self._children(e, greek_ctx)
        if tag == "date":
            return f'<span class="date">{self._children(e)}</span>'
        if tag == "hi":
            return f"<i>{self._children(e, greek_ctx)}</i>"
        return self._children(e, greek_ctx or is_greek)

    def _author(self, e, tlg=None):
        t = "".join(e.itertext()).strip()
        if t in ("Id.", "id."):
            self.stats["abbr_expanded"] += 1
            return self._ab(t, "Idem (the same author)", "au")
        a = self.authors.get(t)
        self.cur_author = t
        if tlg:
            self.author_by_tlg[tlg] = t
        if not a:
            self.stats["abbr_unknown"] += 1
            return html.escape(t)
        detail = ", ".join(x for x in (a["epithet"], a["date"]) if x)
        return self._ab(t, a["name"], "au", detail)

    def _bibl(self, e):
        urn = e.get("n") or ""
        m = _URN.match(urn)
        tlg_author, tlg_work, ref = (m.group(1), m.group(2), m.group(3)) if m else (None, None, None)
        parts = [html.escape(e.text or "")]
        has_author = e.find("author") is not None
        if not has_author and tlg_author and tlg_author in self.author_by_tlg:
            self.cur_author = self.author_by_tlg[tlg_author]
        for c in e:
            if c.tag == "author":
                parts.append(self._author(c, tlg_author))
            elif c.tag == "title":
                parts.append(self._title(c))
            elif c.tag == "biblScope":
                parts.append(html.escape("".join(c.itertext())))
            else:
                parts.append(self._el(c, False))
            parts.append(html.escape(c.tail or ""))
        inner = "".join(parts)
        if tlg_author == "tlg0059" and tlg_work:
            steph = ref.lower() if ref and re.fullmatch(r"\d{1,3}[a-e]?", ref.lower()) else ""
            return (f'<span class="bibl plato" data-work="{tlg_work}" data-ref="{html.escape(steph)}" '
                    f'title="{html.escape(urn, quote=True)}">{inner}</span>')
        return f'<span class="bibl" title="{html.escape(urn, quote=True)}">{inner}</span>' if urn else f'<span class="bibl">{inner}</span>'

    def _title(self, c):
        t = "".join(c.itertext()).strip()
        a = self.authors.get(self.cur_author or "")
        work = a["works"].get(t) if a else None
        if work is None:
            # Works cited without an author are in List I under their own name.
            own = self.authors.get(t)
            if own:
                return self._ab(t, own["name"], "ti")
            if t in self.works_alone:
                name, title = self.works_alone[t]
                return f"<i>{self._ab(t, f'{title} ({name})', 'ti')}</i>"
            if t in self.publications:
                lst, full = self.publications[t]
                short, _, rest = full.partition(",")
                return self._ab(t, short.strip(), "ti pub", f"{rest.strip()}; LSJ List {lst}" if rest.strip() else f"LSJ List {lst}")
            exp = self.general_lookup(t)
            if exp:
                return self._ab(t, exp, "ti")
            self.stats["abbr_unknown"] += 1
            return f"<i>{html.escape(t)}</i>"
        return f"<i>{self._ab(t, work, 'ti')}</i>"

    def _usg(self, e):
        """Middle Liddell's author labels. Perseus writes 'id.' (the same author) as
        'id=Plat.'. The labels are Middle Liddell's own (Plat., Xen.), so an expansion
        is given only where LSJ's List I has the same abbreviation."""
        t = "".join(e.itertext()).strip()
        if t.startswith("id="):
            return self._ab("id.", f"idem, the same author ({t[3:]})", "au")
        a = self.authors.get(t)
        if a:
            return self._ab(t, a["name"], "au")
        return f'<span class="au-ml">{html.escape(t)}</span>'

