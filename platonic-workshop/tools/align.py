#!/usr/bin/env python3
"""Line up an English translation that prints no Stephanus numbers with one
that does, so that every paragraph of it can be placed at a Stephanus section.

No AI and no statistics beyond counting: the method is the one a reader uses
with two translations open side by side.

1. Both texts are cut into short units (sentences and clauses, at . ? ! ; :).
   The reference text (the Loeb English, which Perseus marks with Stephanus
   sections) knows the section of every character.
2. Anchors. A word that is rare in both translations of the same dialogue
   (a name, a number, an unusual noun: Thrasymachus, Gyges, the cave) and
   occurs in a unit of each, at about the same distance into the dialogue,
   pairs those two units. Words are compared by their first six letters, so
   Glauco and Glaucon, justice and just, agree; the old names of the gods
   (Jupiter, Minerva) are read as the Greek ones (Zeus, Athena), and a few
   old spellings (shew) as modern ones.
3. Of all candidate pairs, the heaviest chain that runs forward in both
   texts at once is kept (rarer shared words weigh more). Printed numbers in
   the translation (a Stephanus page in the margin) join the chain as fixed
   anchors.
4. Between two anchors, a character of the translation is placed in
   proportion to the characters of the reference between the same anchors.
   Before the first anchor and after the last, one character is taken to
   stand for one character (scaled by the two texts' lengths), so a text
   with missing pages is not stretched to fit.

The result is a position in the reference for every character of the
translation, hence a section. tools/align.py --check measures how often it is
right against translations whose printed numbers are known (see
reports/alignment.md); the reader labels every placement made this way as
computed, with those figures.
"""
import bisect
import math
import re
from collections import Counter, defaultdict

UNIT_END = re.compile(r"(?<=[.?!;:])[\"'’”)\]]*\s+")
WORD = re.compile(r"[A-Za-zÀ-ÿ]+")
STEM = 6

STOP = set("""a about above after again against all also am an and any are as at be because been before being below
between both but by can could did do does doing down during each either else ever every few for from further had has
have having he her here hers herself him himself his how i if in into is it its itself just let may me might more most
must my myself neither no nor not now o of off on once only or other ought our ours ourselves out over own same say
said says shall she should so some such than that the their theirs them themselves then there these they this those
thou thee thy through to too under until up upon us very was we were what when where which while who whom whose why
will with would ye yes you your yours yourself yourselves one two well then therefore indeed certainly true replied
socrates think thing things man men way like make made many much great good also yet still even""".split())

# The Latin names Taylor (1804) and his contemporaries give the gods, read as
# the Greek names the Loeb translators use; and a few old spellings.
EQUIV = {
    "jupiter": "zeus", "jove": "zeus", "juno": "hera", "minerva": "athena", "athene": "athena", "pallas": "athena",
    "vulcan": "hephaestus", "mercury": "hermes", "venus": "aphrodite", "neptune": "poseidon", "bacchus": "dionysus",
    "diana": "artemis", "ceres": "demeter", "saturn": "cronus", "kronos": "cronus", "mars": "ares", "vesta": "hestia",
    "latona": "leto", "proserpine": "persephone", "ulysses": "odysseus", "hercules": "heracles", "aesculapius": "asclepius",
    "esculapius": "asclepius", "shew": "show", "shewn": "shown", "shewing": "showing", "shews": "shows",
}


def stem(word):
    w = word.lower()
    w = EQUIV.get(w, w)
    return w[:STEM]


def units(text, base=0):
    """[(start, end)] of the sentences and clauses of text, offsets + base."""
    out, pos = [], 0
    for m in UNIT_END.finditer(text):
        if m.start() > pos:
            out.append((base + pos, base + m.start()))
        pos = m.end()
    if pos < len(text):
        out.append((base + pos, base + len(text)))
    return out


def content_stems(text):
    return {stem(w) for w in WORD.findall(text) if len(w) > 2 and w.lower() not in STOP}


class Stream:
    """A text as one string, cut into units, with the stems of each unit."""

    def __init__(self, pieces):
        # pieces: [(text, label)] in reading order; label is any value (a section ref) or None
        self.text_parts, self.starts, self.labels = [], [], []
        pos = 0
        for text, label in pieces:
            self.starts.append(pos)
            self.labels.append(label)
            self.text_parts.append(text)
            pos += len(text) + 1
        self.length = pos
        self.text = "\n".join(self.text_parts)
        self.units = []
        for s, t in zip(self.starts, self.text_parts):
            self.units.extend(units(t, s))
        self.stems = [content_stems(self.text[a:b]) for a, b in self.units]
        self.mid = [(a + b) / 2 for a, b in self.units]

    def label_at(self, pos):
        i = bisect.bisect_right(self.starts, pos) - 1
        return self.labels[max(i, 0)]


def candidates(t, r, band=0.12, max_df=3, predict=None, near=None):
    """Pairs (i, j, weight): unit i of the translation and unit j of the
    reference share words rare in both, at about the same place: within
    `band` of the same fraction of the text, or, on a second pass, within
    `near` characters of where the first pass put unit i (`predict`)."""
    df_t, df_r = Counter(), Counter()
    for s in t.stems:
        df_t.update(s)
    for s in r.stems:
        df_r.update(s)
    where = defaultdict(list)
    for j, s in enumerate(r.stems):
        for w in s:
            if df_r[w] <= max_df:
                where[w].append(j)
    pairs = defaultdict(float)
    for i, s in enumerate(t.stems):
        pi = t.mid[i] / t.length
        for w in s:
            if df_t[w] > max_df or w not in where:
                continue
            weight = math.log(1 + len(r.units) / df_r[w]) / max(df_t[w], 1)
            if predict is not None:
                y = predict(t.mid[i])
            for j in where[w]:
                if predict is not None:
                    if abs(r.mid[j] - y) <= near:
                        pairs[(i, j)] += weight
                elif abs(r.mid[j] / r.length - pi) <= band:
                    pairs[(i, j)] += weight
    return [(i, j, w) for (i, j), w in pairs.items()]


def best_chain(pairs, n_ref):
    """The heaviest chain of pairs increasing strictly in both i and j
    (weighted longest increasing subsequence, with a Fenwick tree for max)."""
    pairs = sorted(pairs, key=lambda p: (p[0], -p[1]))
    tree = [(0.0, -1)] * (n_ref + 1)

    def query(j):  # best chain ending at a reference unit < j
        best = (0.0, -1)
        while j > 0:
            if tree[j][0] > best[0]:
                best = tree[j]
            j -= j & -j
        return best

    def update(j, val):
        j += 1
        while j <= n_ref:
            if val[0] > tree[j][0]:
                tree[j] = val
            j += j & -j

    score, back = [], []
    # Pairs with the same i must not chain onto each other: process an i's pairs
    # against the tree as it was before that i, then add them.
    k = 0
    while k < len(pairs):
        i = pairs[k][0]
        group = []
        while k < len(pairs) and pairs[k][0] == i:
            group.append(k)
            k += 1
        results = []
        for g in group:
            _, j, w = pairs[g]
            prev = query(j)
            results.append((g, prev[0] + w, prev[1]))
        for g, s, b in results:
            while len(score) <= g:
                score.append(0.0)
                back.append(-1)
            score[g], back[g] = s, b
            update(pairs[g][1], (s, g))
    if not score:
        return []
    g = max(range(len(score)), key=score.__getitem__)
    chain = []
    while g != -1:
        chain.append(pairs[g])
        g = back[g]
    return chain[::-1]


def _interpolator(anchors, r_length, ratio):
    xs = [a[0] for a in anchors]

    def to_ref(x):
        if not anchors:
            return x * ratio
        k = bisect.bisect_right(xs, x)
        if k == 0:
            return max(0.0, anchors[0][1] - (anchors[0][0] - x) * ratio)
        if k == len(anchors):
            return min(r_length - 1.0, anchors[-1][1] + (x - anchors[-1][0]) * ratio)
        (x0, y0), (x1, y1) = anchors[k - 1], anchors[k]
        return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return to_ref


def _chain_anchors(t, r, pairs, pts):
    if pts:
        # Printed anchors are certain: drop word anchors that contradict them.
        fx = [p[0] for p in pts]

        def ok(i, j):
            x, y = t.mid[i], r.mid[j]
            k = bisect.bisect_right(fx, x)
            lo = pts[k - 1][1] if k > 0 else -1
            hi = pts[k][1] if k < len(pts) else float("inf")
            return lo <= y <= hi
        pairs = [p for p in pairs if ok(p[0], p[1])]
    chain = best_chain(pairs, len(r.units))
    anchors = sorted(set([(t.mid[i], r.mid[j]) for i, j, _ in chain] + [tuple(p) for p in pts]))
    clean = []
    for x, y in anchors:
        if clean and (y <= clean[-1][1] or x <= clean[-1][0]):
            continue
        clean.append((x, y))
    return clean


# Second pass: words up to this common, within this many characters of where
# the first pass put them.
PASS2_DF, PASS2_NEAR = 12, 400


def align(t_pieces, r_pieces, fixed=(), passes=2):
    """Place every character of the translation in the reference.

    t_pieces: [(text, None)] the translation's paragraphs.
    r_pieces: [(text, section_ref)] the reference, in order.
    fixed: [(t_pos, r_pos)] anchors known from printed numbers.
    Returns (mapper, info): mapper(t_pos) -> section_ref; info has the anchors."""
    t, r = Stream(t_pieces), Stream(r_pieces)
    pts = sorted(fixed)
    ratio = r.length / max(t.length, 1)
    anchors = _chain_anchors(t, r, candidates(t, r), pts)
    to_ref = _interpolator(anchors, r.length, ratio)
    if passes > 1:
        pairs = candidates(t, r, max_df=PASS2_DF, predict=to_ref, near=PASS2_NEAR)
        anchors = _chain_anchors(t, r, pairs, pts)
        to_ref = _interpolator(anchors, r.length, ratio)

    def mapper(x):
        return r.label_at(to_ref(x))

    info = {"anchors": len(anchors), "units": len(t.units), "ref_units": len(r.units), "fixed": len(pts),
            "t_starts": t.starts, "r_starts": r.starts, "to_ref": to_ref, "t": t, "r": r}
    return mapper, info


def place_paragraphs(t_pieces, r_pieces, fixed=()):
    """For each paragraph of the translation: (first section, last section),
    from the positions of its first and last characters."""
    mapper, info = align(t_pieces, r_pieces, fixed)
    out = []
    for start, (text, _) in zip(info["t_starts"], t_pieces):
        a = start + min(len(text) - 1, 20) if text else start
        b = start + max(len(text) - 20, 0)
        out.append((mapper(a), mapper(b)))
    return out, info, mapper
