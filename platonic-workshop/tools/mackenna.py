"""Stephen MacKenna's English of Plotinus (1917-1930), read from the Internet Archive's OCR, chapter by chapter.

MacKenna's translation is the older English set beside the Workshop's modern English of the treatises Taylor did not
translate (tools/modern_enneads.py), as Taylor's is beside the fifteen he did (tools/modern_neo.py). MacKenna translated
from Volkmann's text (Teubner, 1883-1884), the edition of the Workshop's Greek, and mostly numbers the chapters as Volkmann
does; where he does not (in I.8 his chapters 1 to 12 hold Volkmann's 1 to 15), the master copy of the modern English names
his chapters for each Greek chapter (@older), and the check finds them.

The OCR is kept as received in sources/<volume>/; this tool reads it by rule, and nothing is rewritten by hand:

  * the running heads ("30  PLOTINUS", "1. 1. 7]  THE ANIMATE AND THE MAN  35") and the page numbers at the foot of a
    first page are taken out, and give the page each chapter begins on;
  * a word broken at the end of a line is joined ("instru- / ment" is "instrument"), but a hyphen before a capital is
    kept, since MacKenna joins his terms with hyphens ("Sense- / Perception" is "Sense-Perception");
  * a paragraph cut by a page break (it ends without a stop) is joined to the next again;
  * a line that is only a chapter number ("2.", "3-", the OCR's "i." for 1) begins a chapter, when it is the next number;
  * where the OCR lost a chapter number (a volume's "lost" list), the number after it begins a chapter, and the lost
    chapter's text stays with the one before;
  * a footnote (a paragraph beginning with "*") is kept apart, with its chapter.

Each volume is added when the milestone that first needs it is done (workshop ROADMAP, "The Enneads in modern English").

    python3 tools/mackenna.py            write texts/plotinus/mackenna-<year>.json
    python3 tools/mackenna.py --check    only check that the files are up to date; exit 1 if not
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
OUT = ROOT / "texts" / "plotinus"
SCHEMA = "platonic-workshop/mackenna-v1"
ROMAN = ["I", "II", "III", "IV", "V", "VI"]
ORD = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH"]

VOLUMES = {
    "mackenna-1917": {
        "source": "mackenna-plotinus-1917",
        "file": "plotinusethicalt01plotuoft_djvu.txt",
        "item": "plotinusethicalt01plotuoft",
        "title": "Plotinus: The Ethical Treatises (the First Ennead)",
        "year": 1917,
        "enneads": [1],
        # where the treatises end: the translator's notes follow the Ninth Tractate
        "end": "BIBLIOGRAPHY  AND  EXPLANATORY  MATTER",
        # Porphyry's Life of Plotinus comes first (Enneads milestone E5): read as the treatise "Life", its 26 chapters
        # numbered as Volkmann numbers them, from its first chapter number (after MacKenna's note on the dates)
        "life": {"heading": r"PORPHYRY:\s+ON\s+THE\s+LIFE\s+OF\s+PLOTINUS\s+AND",
                 "title": "Porphyry: On the Life of Plotinus and the Arrangement of his Work"},
        # the printer's signatures, standing alone on a line, that ran into the paragraphs around them (E34e): "M"
        # (inside I.6.3) and "R"
        "stray": ["M", "R"],
    },
    # vol. II (Enneads milestone E7): MacKenna prints the Third Ennead first, then the Second
    "mackenna-1921": {
        "source": "mackenna-plotinus-1921",
        "file": "plotinuspsychicp00plotuoft_djvu.txt",
        "item": "plotinuspsychicp00plotuoft",
        "title": "Plotinus: Psychic and Physical Treatises, comprising the Second and Third Enneads",
        "year": 1921,
        "enneads": [3, 2],
        # where the treatises end: MacKenna's note on the order of the tractates follows II.9
        "end": "NOTE  ON  THE  ORDER  OF  THE  TRACTATES  OF  THE",
        # Taylor's treatises beside MacKenna (Enneads milestone E34): II.9's chapter 11, whose number the OCR read "n.",
        # and the second and third lines of II.9's title, in small letters, which ran into its first chapter
        # running heads the OCR misread so that they were not taken as heads and stood inside a paragraph (E34c), with
        # their page: III.6.11's (p. 83), III.7.9's (p. 111) and II.9.9's (p. 229)
        "heads": {"Hi.  6.  iaj      THE  IMPASSIVITY  OF  THE  UNEMBODIED  83": 83, "ill.  7.  9]  TIME  AND  ETERNITY  in": 111,
                  'H.9.iol  "AGAINST  THE  GNOSTICS"  229': 229},
        "misread": {"II.9.11": "n."},
        # a stray "V" at the end of II.9.16 (p. 239), which stands only there; and the printer's signatures, standing
        # alone on a line, that ran into the paragraphs around them (E34e): "Q" (inside III.7.11), "2 D" (II.5.5), "2 E"
        # (II.7.1), "2 F", "2 G", "2 H" and "2 I" (II.9.2, 8, 13 and 18), with "2 A" and "2 B"
        "stray": ["V", "Q", "2  A", "2  B", "2  D", "2  E", "2  F", "2  G", "2  H", "2 1"],
        "title_lines": {"the Kosmos Itself to be Evil : [Generally Quoted as": "the Kosmos Itself to be Evil : [Generally Quoted as",
                        '"Against the Gnostics"]': '"Against the Gnostics"]'},
    },
    # vol. III (Enneads milestone E15): the Fourth Ennead
    "mackenna-1924": {
        "source": "mackenna-plotinus-1924",
        "file": "plotinustranslat03burkuoft_djvu.txt",
        "item": "plotinustranslat03burkuoft",
        "title": "Plotinus on the Nature of the Soul, being the Fourth Ennead",
        "year": 1924,
        "enneads": [4],
        # where the treatises end: MacKenna's acknowledgement follows IV.9
        "end": "ACKNOWLEDGEMENT",
        # chapter numbers the OCR lost (a blank line where the scan prints "15."): the next number begins its chapter,
        # and the lost chapter's text stays with the one before it (the modern English names both with @older)
        "lost": ["IV.4.15", "IV.4.17", "IV.4.31", "IV.4.38", "IV.4.41"],
        # Taylor's treatises beside MacKenna (Enneads milestone E34): chapter numbers the OCR misread, in their place
        # (IV.3.31's "3*."; IV.7's last six, printed with Creuzer's numbers after them, "10. (15.)"), and IV.3's chapters
        # whose numbers it lost altogether (no line at all), begun at the paragraph given by its first words. MacKenna's
        # IV.7.8 holds the five sections he prints as "8, A." to "8, E." (Henry and Schwyzer's 8.1 to 8.5), which are all
        # Volkmann's chapter 8; his 9 to 15 are Volkmann's.
        # running heads the OCR misread so that they were not taken as heads and stood inside a paragraph (E34c), with
        # their page: IV.3.3's (p. 11) and IV.5.5's (p. 111)
        "heads": {"IV.  3.  3]  PROBLEMS  OF  THE  SOUL  n": 11, "IV.  5.  6]  PROBLEMS  OF  THE  SOUL  in": 111},
        # the printer's signatures, standing alone on a line, that ran into the paragraphs around them (E34e): "M" (inside
        # IV.4.29), "Q" and "B"
        "stray": ["M", "Q", "B"],
        "misread": {"IV.3.31": "3*.", "IV.7.10": "10. (15.)", "IV.7.11": "ii. (16.)", "IV.7.12": "12. (17.)",
                    "IV.7.13": "13. (18.) .<:•.*:-••", "IV.7.14": "14. (19.)", "IV.7.15": "15. (20.)"},
        "unnumbered": {"IV.3.14": "Thus it comes about that this kosmos", "IV.3.15": "The souls peering forth from the Intellectual",
                       "IV.3.17": "Various considerations explain why the Souls"},
    },
    # vol. IV (Enneads milestone E20): the Fifth Ennead
    "mackenna-1926": {
        "source": "mackenna-plotinus-1926",
        "file": "plotinustranslat04plotuoft_djvu.txt",
        "item": "plotinustranslat04plotuoft",
        "title": "Plotinus: The Divine Mind, being the Treatises of the Fifth Ennead",
        "year": 1926,
        "enneads": [5],
        # where the treatises end: MacKenna's acknowledgements follow V.9
        "end": "ACKNOWLEDGEMENTS",
        # the OCR lost V.8's last number, 13 (two blank lines before "The God fettered"): its text stays with his 12
        "lost": ["V.8.13"],
        # Taylor's treatises beside MacKenna (Enneads milestone E34): V.9.7, whose number the OCR read "....", and V.3.17
        # and V.9.13, whose numbers it lost, begun at the paragraph given by its first words
        # running heads the OCR misread so that they were not taken as heads and stood inside a paragraph (E34c), with
        # their page: V.1.6's (p. 9), V.1.7's (p. 11), V.3.10's (p. 33), V.3.15's (p. 39), V.5.1's
        # (p. 49), V.5.7's (p. 56), V.8.2's (p. 75) and V.9.10's (p. 99)
        "heads": {"V.  i.  7]  THE  THREE  INITIAL  HYPOSTASES  n": 9, "V.  i.  8]  THE  THREE  INITIAL  HYPOSTASES  n": 11,
                  "V.  3.  ii]  THE  KNOWING  HYPOSTASES": 33, "V.  3.  i5]  THE  KNOWING  HYPOSTASES": 39,
                  "V.  5-2]  THE   NATURE   OF   THE   GOOD": 49, ".     56  PLOTINUS": 56,
                  "V.8.2]  ON   THE   INTELLECTUAL   BEAUTY": 75, "V.  9.  n]  THE   INTELLECTUAL-PRINCIPLE": 99},
        # the printer's signatures, standing alone on a line, that ran into the paragraphs around them (E34e): "M" (inside
        # V.8.7) and "N" (inside V.5.6)
        "stray": ["M", "N"],
        "misread": {"V.9.7": "...."},
        "unnumbered": {"V.3.17": "But what can it be which is loftier",
                       "V.9.13": "It remains to decide whether only"},
    },
    # vol. V (Enneads milestone E22): the Sixth Ennead
    "mackenna-1930": {
        "source": "mackenna-plotinus-1930",
        "file": "plotinusononegoo0005step_djvu.txt",
        "item": "plotinusononegoo0005step",
        "title": "Plotinus on the One and Good, being the Treatises of the Sixth Ennead",
        "year": 1930,
        # B. S. Page translated VI.1 to VI.3 and revised the rest (MacKenna's Acknowledgements, at the end of the volume)
        "translator": "Stephen MacKenna and B. S. Page",
        "enneads": [6],
        # where the treatises end: MacKenna's acknowledgements follow VI.9
        "end": "ACKNOWLEDGEMENTS",
        # This OCR (the Internet Archive's own scan) is rougher than the others, and is read with five more rules:
        #   * an odd page's head is any line of capitals ending in a page number, whatever the OCR made of the
        #     reference before it ("VIS ON THE KINDS OF BEING 3", "TI. 6) ON THE KINDS OF BEING z"); a page number it
        #     cannot read, or reads out of order, is the one after the last;
        #   * the numbers at the foot of a first page are not read (the OCR gives "6" for 1), nor are the printer's
        #     signatures ("B", "Cc"): a line of five characters or fewer standing alone is taken out;
        #   * a chapter number the OCR misread begins its chapter when it is the line given here, in its place;
        #   * a chapter number the OCR lost (no line at all) begins its chapter at the paragraph given by its first words;
        #   * a line that is not the translator's (a stray number, a library's stamp) is taken out where it is listed.
        "loose_heads": True,
        "foot_numbers": False,
        "drop_short": 5,
        "misread": {"VI.1.3": "on", "VI.1.7": "a.", "VI.1.9": "Q.", "VI.1.11": "ids", "VI.1.12": "z2.",
                    "VI.1.15": "oy", "VI.1.19": "IQ.", "VI.1.21": "2%:", "VI.1.22": "Bi", "VI.1.23": "28s",
                    "VI.1.24": "243", "VI.1.27": "27;", "VI.1.29": "29. ;", "VI.1.30": "30. .",
                    # VI.2 (milestone E24)
                    "VI.2.5": "of", "VI.2.9": "Q.", "VI.2.10": "Io.", "VI.2.11": "oO", "VI.2.12": "52:",
                    "VI.2.17": "17:", "VI.2.21": "ai.", "VI.2.22": "22;",
                    # VI.3 chapters 1-14 (milestone E25)
                    "VI.3.4": "4. .", "VI.3.7": "ie", "VI.3.9": "Q.", "VI.3.12": "Iz.",
                    # VI.3 chapters 15-28 (milestone E26)
                    "VI.3.17": "<7:", "VI.3.19": "IQ.", "VI.3.21": "2.", "VI.3.22": "223", "VI.3.25": "25. |",
                    # VI.4 (milestone E27)
                    "VI.4.2": "Be", "VI.4.7": "ye", "VI.4.9": "Q.", "VI.4.10": "10. ,", "VI.4.11": "rt.",
                    "VI.4.12": "pier", "VI.4.15": "TS.",
                    # VI.5 (milestone E28)
                    "VI.5.2": "Bi", "VI.5.7": "Fi", "VI.5.9": "Q.", "VI.5.11": "Tai", "VI.5.12": "52",
                    # VI.6 (milestone E29)
                    "VI.6.3": "3,", "VI.6.7": "Ve", "VI.6.9": "Q.", "VI.6.11": "iets", "VI.6.12": "ies", "VI.6.17": "17:",
                    # VI.7 chapters 1-14 (milestone E30)
                    "VI.7.2": "a", "VI.7.7": "We", "VI.7.10": "IO.", "VI.7.11": "ris &", "VI.7.12": "12:",
                    # VI.7 chapters 15-28 (milestone E31)
                    "VI.7.17": "17s", "VI.7.19": "9g.", "VI.7.21": "21s", "VI.7.22": "228", "VI.7.27": "ay.",
                    # VI.7 chapters 29-42 (milestone E32)
                    "VI.7.35": "35:", "VI.7.41": "Al.",
                    # VI.8 (milestone E33)
                    "VI.8.3": "RS", "VI.8.4": "as", "VI.8.7": "5", "VI.8.9": "Q.", "VI.8.10": "I0.", "VI.8.11": "PE",
                    "VI.8.12": "ie.", "VI.8.17": "Ls", "VI.8.21": "ati",
                    # VI.9, beside Taylor's (milestone E34)
                    "VI.9.2": "2", "VI.9.3": "3. ;", "VI.9.7": "aE", "VI.9.9": "Q.", "VI.9.10": "IO.", "VI.9.11": "be"},
        "unnumbered": {"VI.1.2": "But are we really obliged", "VI.1.5": "Speech, time, motion",
                       "VI.2.2": "In asserting that Being is not a unity",
                       "VI.3.3": "How then do we go to work", "VI.3.5": "These are incontrovertible facts",
                       "VI.6.5": "What then is the veritable nature of Number",
                       "VI.7.9": "Admitted, then—it will be said—for the nobler forms of life",
                       "VI.8.2": "A cardinal question is where"},
        # lines that are not Page's text, taken out wherever they stand: VI.2.1's misread number, under its title; a
        # library's stamp on p. 51 (VI.2.9); and the printer's signatures G to K that fell inside VI.2's paragraphs.
        # VI.3 (E25): "Te" under its title, a smudge at the foot of p. 68 ("—<———— eee"), the signatures L, M, N and P,
        # and a ";" between VI.3.4 and 5 (p. 74); each of these lines stands only there in the treatises.
        # VI.3 (E26): "ce)" inside VI.3.21, which stands only there.
        # VI.4 (E27): the signatures Q (inside VI.4.7, p. 113) and R (inside VI.4.13, p. 121), which follow a line of
        # text and so are not taken out as short lines; "“e" before VI.4.11 stands alone and is.
        # VI.5 (E28): the signature T at the end of VI.5.12 (p. 137), after a line of text.
        # VI.6 (E29): "x" inside VI.6.14 (p. 154), after a line of text; "U" (p. 145) and the signature "Xi" (p. 161)
        # stand alone and go as short lines.
        # VI.7 (E30): the signatures "Z" (inside VI.7.6, p. 169) and "2A" (inside VI.7.12, p. 177), each after a line
        # of text.
        # VI.7 (E31): the signatures "2B" (inside VI.7.18, p. 185) and "2C" (inside VI.7.27, p. 193), each after a
        # line of text.
        # VI.7 (E32): the signatures "2D" (inside VI.7.34, p. 201) and "2E" (inside VI.7.40, p. 210), each after a
        # line of text.
        # VI.8 (E33): the signature "2G" (inside VI.8.12, p. 225), after a line of text; "2F" (p. 217) and "2H" (p. 233)
        # stand alone and go as short lines.
        # treatise headings the OCR misread, read as the heading given: VI.7's (E29), without which VI.7's chapters
        # 3 to 6 (pp. 166-169) were taken as VI.6's
        "headings": {"SEVEN:EH, TRACTATE": "SEVENTH TRACTATE"},
        # running heads whose page number the OCR misread so that it is not taken as one, with their page: p. 151's
        # (E29), without which the pages of VI.6.14 to 18 came out one too low; p. 172's "BEOTINUS" (E30), which
        # otherwise stood inside VI.7.8's text and put the pages of VI.7.9 to 14 one too low; p. 188's "188 © PLOTINUS"
        # (E31), which otherwise stood inside VI.7.20's text and put the pages of VI.7.21 on one too low; p. 204's "204 PEOTINGS" (E32),
        # which otherwise stood inside VI.7.35's text and put the pages of VI.7.36 on one too low; p. 229's (E33), whose
        # reference and title the OCR misread, which otherwise stood inside VI.8.14's text and put the pages of VI.8.15 on
        # one too low
        "heads": {"VI. 6. 13] ON NUMBERS t5t": 151, "172 BEOTINUS": 172, "188 © PLOTINUS": 188, "204 PEOTINGS": 204,
                  "VE 8.35) -FREE-WILL ANDUPHEOWILL OF THE ONE 229": 229},
        # lines of a treatise's title that the OCR gave small letters (or that are printed so), read as the title's: the
        # second line of VI.7's (E30), without which it ran into VI.7.1's first paragraph
        "title_lines": {"Upon THE GoopD": "UPON THE GOOD"},
        "stray": ["x.", "WITH UNIVERSIT Y LIBRARY", "WITHDRAWN", "G", "H", "I", "K",
                  "Te", "—<———— eee", "L", "M", "N", "P", ";", "ce)", "Q", "R", "T", "x", "Z", "2A", "2B", "2C", "2D", "2E", "2G"],
    },
}

NUM = r"[0-9ioIlO]{1,3}"     # a page number, as the OCR reads it ("io8", "IOI")
HEAD_EVEN = re.compile(rf"^({NUM})[\s:.,]+PLOT[I1]NUS\*?\s*$")     # vol. IV's OCR reads some "PLOT1NUS"; vol. V's p. 118 "PLOTINUS*"
HEAD_LIFE = re.compile(rf"^PORPHYRY\s+({NUM})\s*$")       # the odd pages of Porphyry's Life
HEAD_ODD = re.compile(rf"^[^\]\s][^\]]{{0,14}}\]\s+([^a-z0-9]+?)\s+({NUM})\s*$")    # the title in capitals, then the page
FOOT_NUM = re.compile(r"^(\d{1,3})\s*$")
CHAPTER = re.compile(r"^([0-9ilI]{1,3}|[1i][o0])\s*[.\-][,.]?\s*$")    # "io." is 10 in the Life
STOPS = tuple('.?!:;"\')—]')


def as_number(s):
    s = s.translate(str.maketrans("ioIlO", "10110"))
    return int(s) if s.isdigit() else None


HEAD_LOOSE = re.compile(r"^(?:\S.{0,15}?\s+)?([A-Z][A-Z'’,:;.()\- ]{8,}?)\s+(\S{1,4})\s*$")   # vol. V's odd heads ("oper", E27)
HEAD_BLURRED = re.compile(r"^(\S{1,4}\s+)?PLOT[I1]NUS\s*$")   # an even page's head whose number the OCR lost ("lib", "|gS", none)


def page_of_head(line):
    m = HEAD_EVEN.match(line)
    if m:
        return as_number(m.group(1))
    if HEAD_BLURRED.match(line):
        return -1           # a running head, its page the one after the last
    m = HEAD_LIFE.match(line)
    if m:
        return as_number(m.group(1))
    m = HEAD_ODD.match(line)
    return as_number(m.group(2)) if m and re.search(r"[A-Z]{3}", m.group(1)) else None


def chapter_number(line):
    m = CHAPTER.match(line.strip())
    if not m:
        return None
    s = re.sub(r"[ilI]", "1", m.group(1)).replace("o", "0")
    return int(s) if s.isdigit() else None


def join_lines(lines):
    """The lines of one paragraph as one line: broken words joined, MacKenna's hyphened terms kept."""
    out = ""
    for ln in lines:
        ln = re.sub(r"\s+", " ", ln).strip()
        if not ln:
            continue
        if out.endswith("-") and not out.endswith("--") and not out.endswith(" -"):
            out = out + ln if ln[:1].isupper() else out[:-1] + ln
        else:
            out = f"{out} {ln}" if out else ln
    return out


def read_volume(vid):
    """{'treatises': [{'id': 'I.1', 'title', 'page', 'chapters': [{'id': 'I.1.1', 'n', 'page', 'paras', 'notes'}]}]}"""
    v = VOLUMES[vid]
    lines = (SRC / v["source"] / v["file"]).read_text(encoding="utf-8").splitlines()
    # The treatises begin at the first "THE <n> ENNEAD" heading followed by "FIRST TRACTATE".
    start = next(i for i, ln in enumerate(lines)
                 if re.fullmatch(r"THE\s+\w+\s+ENNEAD", ln.strip()) and any(
                     re.fullmatch(r"FIRST\s+TRACTATE", x.strip()) for x in lines[i + 1:i + 4]))
    end = next(i for i in range(start, len(lines)) if lines[i].strip() == v["end"].strip() or
               re.sub(r"\s+", " ", lines[i].strip()) == re.sub(r"\s+", " ", v["end"]))
    treatises, ennead = [], None
    page, pending = None, []          # the page now being read; chapters whose first page is not yet known
    cur_ch, para, after_title = None, [], False

    def close_para():
        nonlocal para
        if para and cur_ch is not None:
            t = join_lines(para)
            if t:
                cur_ch["_paras"].append(t)
        para = []

    def new_chapter(n):
        nonlocal cur_ch
        close_para()
        t = treatises[-1]
        cur_ch = {"id": f"{t['id']}.{n}", "n": n, "page": page, "_paras": []}
        if page is None:
            pending.append(cur_ch)
        t["chapters"].append(cur_ch)

    i = start
    if v.get("life"):
        # Porphyry's Life, before the treatises: from its first chapter number to the first Ennead.
        h = next(k for k, ln in enumerate(lines) if re.match(v["life"]["heading"], ln.strip()))
        i = next(k for k in range(h, start) if chapter_number(lines[k]) == 1)
        treatises.append({"id": "Life", "title": v["life"]["title"], "page": None, "chapters": []})
        new_chapter(1)
        i += 1
    while i < end:
        if i == start and treatises:
            # the treatises begin: the Life's pages are not theirs
            close_para()
            page = None
        raw = lines[i]
        s = raw.strip()
        i += 1
        s = v.get("headings", {}).get(s, s)
        m = re.fullmatch(r"THE\s+(\w+)\s+ENNEAD", s)
        if m and m.group(1) in ORD:
            close_para()
            ennead = ORD.index(m.group(1)) + 1
            continue
        m = re.fullmatch(r"(?:THE\s+)?(\w+)\s+TRACTATE", s)    # vol. IV prints "THE NINTH TRACTATE"
        if m and m.group(1) in ORD:
            close_para()
            k = ORD.index(m.group(1)) + 1
            # the title: the next non-empty line
            while i < end and not lines[i].strip():
                i += 1
            title = re.sub(r"\s+", " ", lines[i].strip())
            i += 1
            # a title over two or three lines (vol. IV): more lines in capitals, before the first chapter number
            j = i
            while j < end and j < i + 4:
                x = lines[j].strip()
                known = v.get("title_lines", {}).get(re.sub(r"\s+", " ", x))
                x = known or x
                if x and not known and (chapter_number(x) is not None or re.search(r"[a-z]", x)):
                    break
                if x:
                    title = f"{title} {re.sub(r'\s+', ' ', x)}"
                    i = j + 1
                j += 1
            # its first page is known only from the next running head or page number (vol. II prints no page number
            # under some first pages, and begins some treatises part way down a page)
            page = None
            treatises.append({"id": f"{ROMAN[ennead - 1]}.{k}", "title": title.strip('" '), "page": None, "chapters": []})
            cur_ch = None
            new_chapter(1)
            after_title = True
            continue
        p = v.get("heads", {}).get(s) or page_of_head(s)
        if v.get("loose_heads"):
            m = HEAD_LOOSE.match(s)
            if p is None and m and len(re.findall(r"\b[A-Z]{2,}\b", m.group(1))) >= 3:
                p = as_number(m.group(2)) or -1
            if p is not None and p != -1 and page is not None and p != page + 1:
                p = -1
        if p == -1 or (p is None and HEAD_BLURRED.match(s)):
            if page is None:
                continue
            p = page + 1
        if p is not None:
            page = p
            for c in pending:
                c["page"] = p - 1 if c["page"] is None else c["page"]
            pending.clear()
            continue
        m = FOOT_NUM.match(s) if v.get("foot_numbers", True) else None
        if m and not CHAPTER.match(s):
            n = int(m.group(1))
            if page is None or n == page or n == page + 1:
                for c in pending:
                    c["page"] = n
                for t in treatises:
                    if t["page"] is None:
                        t["page"] = n
                pending.clear()
                page = n + 1
                continue
        if not treatises:
            continue
        t = treatises[-1]
        nxt = f"{t['id']}.{t['chapters'][-1]['n'] + 1}"
        one = re.sub(r"\s+", " ", s)      # vols. II to IV's OCR puts two spaces between words
        if s and (v.get("misread", {}).get(nxt) == one or
                  (not para and nxt in v.get("unnumbered", {}) and one.startswith(v["unnumbered"][nxt]))):
            after_title = False
            new_chapter(t["chapters"][-1]["n"] + 1)
            if nxt in v.get("unnumbered", {}):
                para.append(raw)
            continue
        n = chapter_number(s)
        if n is not None:
            if after_title and n == 1:
                after_title = False
                close_para()
                continue
            last = t["chapters"][-1]["n"]
            if n == last + 1 or (n == last + 2 and f"{t['id']}.{last + 1}" in v.get("lost", ())):
                after_title = False
                new_chapter(n)
                continue
        if not s:
            close_para()
            continue
        if s in v.get("stray", ()):
            continue
        if (v.get("drop_short") and len(s) <= v["drop_short"] and not lines[i - 2].strip()
                and (i >= len(lines) or not lines[i].strip())):
            continue
        after_title = False
        para.append(raw)
    close_para()
    for t in treatises:
        if t["chapters"]:
            t["page"] = t["chapters"][0]["page"]
        for c in t["chapters"]:
            c["paras"], c["notes"] = mend(c.pop("_paras"))
    return {"schema": SCHEMA, "id": vid, "title": v["title"], "translator": v.get("translator", "Stephen MacKenna"), "year": v["year"],
            "source": v["source"], "scan": f"https://archive.org/details/{v['item']}",
            "how": "the Internet Archive's OCR, read by rule (tools/mackenna.py): running heads and page numbers taken out, "
                   "broken words and paragraphs cut by a page break joined; not proofread",
            "treatises": treatises}


def mend(paras):
    """Join a paragraph cut by a page break; keep footnotes apart."""
    out, notes = [], []
    for p in paras:
        if p.startswith("*") or p.startswith("+ "):
            notes.append(p.lstrip("*+ ").strip())
            continue
        if out and not out[-1].endswith(STOPS):
            out[-1] = join_lines([out[-1], p])
        else:
            out.append(p)
    return out, notes


def write(vid):
    d = read_volume(vid)
    OUT.mkdir(parents=True, exist_ok=True)
    return OUT / f"{vid}.json", json.dumps(d, ensure_ascii=False, indent=1) + "\n"


def chapters(vids=None):
    """{'I.1.1': {'text': the chapter on one line, 'paras': [...], 'page': 29, 'volume': 'mackenna-1917'}} from texts/plotinus/."""
    out = {}
    for vid in vids or VOLUMES:
        f = OUT / f"{vid}.json"
        d = json.loads(f.read_text(encoding="utf-8"))
        for t in d["treatises"]:
            for c in t["chapters"]:
                out[c["id"]] = {"text": re.sub(r"\s+", " ", " ".join(c["paras"])).strip(), "paras": c["paras"],
                                "page": c["page"], "volume": vid, "year": d["year"], "treatise_title": t["title"]}
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    bad = 0
    for vid in VOLUMES:
        path, text = write(vid)
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != text:
                print(f"{path.relative_to(ROOT)} is out of date: run python3 tools/mackenna.py")
                bad += 1
            continue
        path.write_text(text, encoding="utf-8")
        d = json.loads(text)
        print(f"{path.relative_to(ROOT)}: " + ", ".join(f"{t['id']} ({len(t['chapters'])} ch., p. {t['page']})" for t in d["treatises"]))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
