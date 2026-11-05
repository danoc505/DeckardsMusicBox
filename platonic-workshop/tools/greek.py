"""Greek text helpers: Unicode normalisation, tokenising and Beta Code.

All rules here are explicit and deterministic. Nothing is guessed.
"""
import re
import unicodedata

# Combining marks used in polytonic Greek, mapped to Beta Code.
_MARKS = {
    "̓": ")",  # psili (smooth breathing)
    "̔": "(",  # dasia (rough breathing)
    "́": "/",  # acute (oxia / tonos)
    "̀": "\\",  # grave
    "͂": "=",  # perispomeni (circumflex)
    "ͅ": "|",  # ypogegrammeni (iota subscript)
    "̈": "+",  # diaeresis
    "̄": "_",  # macron
    "̆": "^",  # breve
}
_LETTERS = {
    "α": "a", "β": "b", "γ": "g", "δ": "d", "ε": "e", "ζ": "z", "η": "h",
    "θ": "q", "ι": "i", "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "c",
    "ο": "o", "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "u",
    "φ": "f", "χ": "x", "ψ": "y", "ω": "w", "ϝ": "v", "ϲ": "s",
}
# Apostrophes used for elision in the various sources.
APOSTROPHES = "ʼ’᾽᾿'"
_GREEK_CHAR = re.compile(r"[Ͱ-Ͽἀ-῿]")
# A Greek word: Greek letters and combining marks, optionally ending in an elision mark.
WORD = re.compile(r"[Ͱ-Ͽἀ-῿̀-ͯ]+[" + APOSTROPHES + r"]?")


def nfc(text):
    return unicodedata.normalize("NFC", text)


def is_greek(token):
    return bool(_GREEK_CHAR.search(token))


def tokenize(text):
    """Greek word tokens in reading order, NFC-normalised."""
    return [nfc(m.group(0)) for m in WORD.finditer(nfc(text))]


def strip_accents(text):
    """Lower-case, accentless, breathingless form, for accent-insensitive search."""
    out = []
    for ch in unicodedata.normalize("NFD", text.lower()):
        if unicodedata.combining(ch):
            continue
        out.append("σ" if ch == "ς" else ch)
    return "".join(out)


def to_betacode(word):
    """Unicode Greek -> lower-case Beta Code as used by Morpheus and the Perseus lexica.

    ἀγαθός -> a)gaqo/s ; Ἀθηναῖος -> *)aqhnai=os ; ψυχῇ -> yuxh=|
    """
    res = []
    letters = []  # list of [is_capital, letter, marks]
    for ch in unicodedata.normalize("NFD", word):
        if ch in _MARKS and letters:
            letters[-1][2].append(_MARKS[ch])
        elif ch.lower() in _LETTERS:
            letters.append([ch != ch.lower(), _LETTERS[ch.lower()], []])
        elif ch in APOSTROPHES:
            letters.append([False, "'", []])
        elif unicodedata.combining(ch):
            continue
        else:
            letters.append([False, ch, []])
    for cap, letter, marks in letters:
        # Beta Code order: breathing, diaeresis, accent, then iota subscript.
        order = {")": 0, "(": 0, "+": 1, "/": 2, "\\": 2, "=": 2, "_": 3, "^": 3, "|": 4}
        marks = sorted(marks, key=lambda m: order[m])
        if cap:
            # Capitals put breathing and accent before the letter: *)a
            pre = "".join(m for m in marks if m != "|")
            res.append("*" + pre + letter + ("|" if "|" in marks else ""))
        else:
            res.append(letter + "".join(marks))
    return "".join(res)


def lookup_keys(word):
    """Beta Code keys to try, most exact first, for a word as it appears in running text.

    Running text writes a final acute as grave and adds a second accent before
    enclitics; dictionary and Morpheus keys use the citation accent.
    """
    beta = to_betacode(nfc(word))
    keys = [beta, beta.replace("\\", "/")]
    # Enclitic-induced second accent: keep only the first accent.
    first = re.sub(r"^([^/=]*[/=][^/=]*?)/", r"\1", keys[-1])
    keys.append(first)
    low = re.sub(r"\*([()/\\=+|]*)([a-z])", r"\2\1", keys[-1])
    keys.append(low)
    seen, uniq = set(), []
    for k in keys:
        if k not in seen:
            seen.add(k)
            uniq.append(k)
    return uniq


def headword_key(betacode_key):
    """Normalise a lexicon or Morpheus headword key for matching: drop homonym
    digits and vowel-length marks."""
    return re.sub(r"[0-9_^]", "", betacode_key)


_BETA_LETTERS = {v: k for k, v in _LETTERS.items() if k not in "ςϲ"}
_BETA_MARKS = {v: k for k, v in _MARKS.items()}


def from_betacode(beta):
    """Lower- or mixed-case Beta Code -> Unicode Greek (NFC). Vowel-length marks
    (_ and ^) and homonym digits are dropped.

    a)gaqo/s -> ἀγαθός ; *)aqhnai=os -> Ἀθηναῖος ; yuxh=| -> ψυχῇ
    """
    beta = re.sub(r"[0-9_^]", "", beta)
    out = []
    i = 0
    while i < len(beta):
        ch = beta[i]
        if ch == "*":
            # Capital: marks come before the letter.
            j = i + 1
            pre = ""
            while j < len(beta) and beta[j] in _BETA_MARKS:
                pre += beta[j]
                j += 1
            if j < len(beta) and beta[j].lower() in _BETA_LETTERS:
                out.append(_BETA_LETTERS[beta[j].lower()].upper())
                out.extend(_BETA_MARKS[m] for m in sorted(pre, key=_mark_order))
                i = j + 1
                continue
            i += 1
            continue
        low = ch.lower()
        if low in _BETA_LETTERS:
            out.append(_BETA_LETTERS[low])
        elif ch in _BETA_MARKS:
            out.append(_BETA_MARKS[ch])
        elif ch == "'":
            out.append("ʼ")
        else:
            out.append(ch)
        i += 1
    text = "".join(out)
    # Final sigma at the end of a word.
    text = re.sub(r"σ(?=$|[^\wͰ-Ͽἀ-῿̀-ͯ])", "ς", text)
    return nfc(text)


def _mark_order(m):
    return {")": 0, "(": 0, "+": 1, "/": 2, "\\": 2, "=": 2, "|": 4}.get(m, 3)


# The 9-position morphological tag of the Ancient Greek Dependency Treebank,
# which GLAUx uses: part of speech, person, number, tense, mood, voice,
# gender, case, degree. '-' means not applicable.
_POSTAG = [
    ("part of speech", {"n": "noun", "v": "verb", "a": "adjective", "d": "adverb", "l": "article",
                        "g": "particle", "c": "conjunction", "r": "preposition", "p": "pronoun",
                        "m": "numeral", "i": "interjection", "e": "exclamation", "u": "punctuation",
                        "x": "irregular", "z": "other"}),
    ("person", {"1": "1st person", "2": "2nd person", "3": "3rd person"}),
    ("number", {"s": "singular", "p": "plural", "d": "dual"}),
    ("tense", {"p": "present", "i": "imperfect", "r": "perfect", "l": "pluperfect", "t": "future perfect",
               "f": "future", "a": "aorist"}),
    ("mood", {"i": "indicative", "s": "subjunctive", "o": "optative", "n": "infinitive", "m": "imperative",
              "p": "participle"}),
    ("voice", {"a": "active", "p": "passive", "m": "middle", "e": "middle or passive"}),
    ("gender", {"m": "masculine", "f": "feminine", "n": "neuter", "c": "common"}),
    ("case", {"n": "nominative", "g": "genitive", "d": "dative", "a": "accusative", "v": "vocative",
              "l": "locative"}),
    ("degree", {"p": "positive", "c": "comparative", "s": "superlative"}),
]


def decode_postag(tag):
    """'n-s---fn-' -> [('part of speech', 'noun'), ('number', 'singular'), ...].
    Unknown codes are returned as the raw letter so nothing is silently lost."""
    out = []
    for (name, codes), ch in zip(_POSTAG, (tag or "").ljust(9, "-")):
        if ch != "-":
            out.append((name, codes.get(ch, ch)))
    return out
