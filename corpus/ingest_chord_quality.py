#!/usr/bin/env python3
"""
What KIND of chord sits on each step of the scale, measured from real jazz
changes, and injected into MK2 as CHORD_QUALITY.

    python3 corpus/ingest_chord_quality.py --dry     # measure only, write nothing
    python3 corpus/ingest_chord_quality.py           # measure and inject

Source: the Jazz Harmony Treebank's `treebank.json` (Digital and Cognitive
Musicology Lab, EPFL + McGill; ISMIR 2020). 1170 tunes carry a key and chords;
150 of those also carry the expert hierarchical analysis the paper is about.
Chord PROGRESSIONS are not copyrightable, so this is clean to use, and we store
our own derived counts rather than the source file.

WHY THIS EXISTS RATHER THAN corpus/ingest_jazz.py
=================================================
That script feeds MK1 and it has three bugs which compound. All three are fixed
here, and each was found by reading its output back against the source:

  (a) IT READS FLAT KEYS A SEMITONE SHARP. This dataset writes a flat in the
      KEY field as "-", so E flat major is "E-". Its parser only accepts "#"
      and "b", so it takes "E-" as plain E. 436 of 1170 tunes are in a flat key
      written that way -- over a third of the corpus, every chord in them filed
      under the wrong step. Note the asymmetry that hides it: CHORD symbols in
      the same dataset use "b" for a flat and "-" for minor, so the chords
      parse correctly while the key does not.

  (b) IT CANNOT SEE A HALF-DIMINISHED CHORD. The dataset writes it "%", as in
      "A%7". Its parser tests for three other spellings, so every one of them
      falls through to the bottom and is recorded as a DOMINANT SEVENTH -- a
      different chord with the opposite job. In minor keys the half-diminished
      chord on the second step is the commonest chord there after the tonic and
      the fifth.

  (c) IT FOLDS CHROMATIC CHORDS ONTO THE NEAREST STEP OF THE SCALE. Its degree
      function walks the scale and takes whichever step is closest, so a chord
      built outside the key is not recorded as outside the key -- it is
      recorded as a diatonic chord that never happened, inflating that step
      with chords that contradict it.

Measured effect of the three together: the old table reports the tonic as a
plain three-note major chord 47% of the time; re-derived it is a major seventh
49% of the time. It reports 69.8% of chords as having four notes or more; the
real figure is 90.3%.

WHAT IS STORED
==============
CHORD_QUALITY[mode][semitones above the tonic] = { n: how many chords, q: [[quality, percent], ...] }

Chromatic, NOT scale-step, which is the whole point of fixing (c): a chord
built a flattened fifth above the tonic is stored there and not folded onto the
fourth. MK2 reads the diatonic rows today; the chromatic rows are there for
when it can ask for a borrowed chord.

Research: docs/genre-research/chord-quality.md
"""
import json, os, re, sys, tempfile, urllib.request
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
HTMLP = os.path.join(ROOT, "Deckards Orchestrator MK2.html")
CACHE = os.path.join(tempfile.gettempdir(), "jazz_treebank.json")
URL = "https://raw.githubusercontent.com/DCMLab/JazzHarmonyTreebank/master/treebank.json"

PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
MAJ = [0, 2, 4, 5, 7, 9, 11]
MIN = [0, 2, 3, 5, 7, 8, 10]
CHROM = ["I", "bII", "II", "bIII", "III", "IV", "bV", "V", "bVI", "VI", "bVII", "VII"]

# a row is only worth reading if it has enough chords behind it
MIN_ROW = 120
# and a quality is only worth storing if it is more than a rounding artefact
MIN_SHARE = 6


def chord_root(sym):
    """CHORD symbols: 'b' is a flat, '-' after the root means minor."""
    sym = str(sym)
    if not sym or sym[0].upper() not in PC:
        return None, ""
    pc = PC[sym[0].upper()]
    i = 1
    while i < len(sym) and sym[i] in "#b":
        pc += 1 if sym[i] == "#" else -1
        i += 1
    return pc % 12, sym[i:]


def key_root(k):
    """KEY field: '-' is a FLAT here, and lowercase means minor. Bug (a)."""
    mode = "minor" if k[:1].islower() else "major"
    pc = PC[k[0].upper()]
    i = 1
    while i < len(k) and k[i] in "#b-":
        pc += 1 if k[i] == "#" else -1
        i += 1
    return pc % 12, mode


def quality(rest):
    """The kind of chord. '%' is half-diminished in this dataset -- bug (b)."""
    r = rest.lower()
    if "%" in rest or "ø" in rest or "h" in r or "m7b5" in r:
        return "m7b5"
    if r.startswith("o") or "dim" in r or "°" in rest:
        return "dim7"
    if "sus" in r:
        return "sus4"
    if "^" in rest or "maj" in r or "ma7" in r:
        return "maj7" if ("7" in r or "9" in r or "^" in rest) else "maj"
    if r.startswith("m") or r.startswith("-"):
        return "min7" if any(x in r for x in ("7", "9", "11", "13", "6")) else "min"
    if any(x in r for x in ("7", "9", "13", "11", "alt", "+", "aug")):
        return "dom7"
    return "maj"


def measure(tb):
    tab = {"major": defaultdict(Counter), "minor": defaultdict(Counter)}
    tunes = flatkeys = chords = 0
    for t in tb:
        k = t.get("key") or ""
        if not k or k[0].upper() not in PC:
            continue
        tonic, mode = key_root(k)
        tunes += 1
        if "-" in k:
            flatkeys += 1
        prev = None
        for sym in t.get("chords", []):
            pc, rest = chord_root(sym)
            if pc is None:
                continue
            rel, q = (pc - tonic) % 12, quality(rest)
            if (rel, q) == prev:            # collapse an immediate repeat
                continue
            prev = (rel, q)
            tab[mode][rel][q] += 1
            chords += 1
    return tab, tunes, flatkeys, chords


def build(tab):
    out = {}
    for mode in ("major", "minor"):
        rows = {}
        for rel in sorted(tab[mode]):
            c = tab[mode][rel]
            n = sum(c.values())
            if n < MIN_ROW:
                continue
            keep = [(q, round(100 * v / n)) for q, v in c.most_common()
                    if 100 * v / n >= MIN_SHARE]
            if not keep:
                continue
            tot = sum(w for _, w in keep)          # renormalise what survived
            keep = [[q, round(100 * w / tot)] for q, w in keep]
            keep = [[q, w] for q, w in keep if w > 0]
            rows[rel] = {"n": n, "q": keep}
        out[mode] = rows
    return out


def literal(table):
    """One line per row so a diff of this file is readable."""
    lines = ["const CHORD_QUALITY = Object.freeze({"]
    for mode in ("major", "minor"):
        lines.append("  %s: Object.freeze({" % mode)
        for rel in sorted(table[mode]):
            r = table[mode][rel]
            qs = ", ".join('["%s",%d]' % (q, w) for q, w in r["q"])
            lines.append('    %2d: { n: %5d, q: [%s] },%s'
                         % (rel, r["n"], qs, "".ljust(max(0, 2)) + " // " + CHROM[rel]))
        lines.append("  }),")
    lines.append("});")
    return "\n".join(lines)


def main():
    dry = "--dry" in sys.argv
    if os.path.exists(CACHE):
        tb = json.load(open(CACHE))
    else:
        print("fetching", URL)
        urllib.request.urlretrieve(URL, CACHE)
        tb = json.load(open(CACHE))
    trees = sum(1 for t in tb if t.get("trees") or t.get("open_constituent_tree"))
    tab, tunes, flatkeys, chords = measure(tb)
    print("  tunes with a key and chords: %d   (with the expert tree analysis: %d)"
          % (tunes, trees))
    print("  tunes in a key written with '-' as a flat, which the old ingest read"
          " a semitone sharp: %d" % flatkeys)
    print("  chords counted, immediate repeats collapsed: %d" % chords)
    allq = Counter()
    for mode in tab:
        for rel in tab[mode]:
            allq.update(tab[mode][rel])
    tot = sum(allq.values())
    four = sum(v for q, v in allq.items() if q not in ("maj", "min", "sus4"))
    print("  four notes or more: %.1f%%    plain three-note: %.1f%%"
          % (100 * four / tot, 100 * (tot - four) / tot))
    table = build(tab)
    for mode in ("major", "minor"):
        print("\n  %s keys, the rows worth reading:" % mode)
        for rel in sorted(table[mode]):
            r = table[mode][rel]
            print("    %-5s %6d chords   %s" % (CHROM[rel], r["n"],
                  ", ".join("%s %d%%" % (q, w) for q, w in r["q"])))
    lit = literal(table)
    if dry:
        print("\n--dry: nothing written\n")
        print(lit)
        return
    html = open(HTMLP, encoding="utf-8").read()
    pat = re.compile(r"^const CHORD_QUALITY = Object\.freeze\(\{.*?^\}\);$",
                     re.S | re.M)
    if not pat.search(html):
        print("\nCHORD_QUALITY is not in the HTML yet -- add the marker first:")
        print("  const CHORD_QUALITY = Object.freeze({\n  });")
        sys.exit(1)
    open(HTMLP, "w", encoding="utf-8").write(pat.sub(lambda m: lit, html, count=1))
    print("\n  injected into", os.path.basename(HTMLP))


if __name__ == "__main__":
    main()
