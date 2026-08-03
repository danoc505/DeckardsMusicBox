#!/usr/bin/env python3
"""
analyze_synthwave.py — the synthwave harmonic corpus, analysed the same way as the
jazz set (corpus/ingest_jazz.py): reduce the genre to its characteristic CHORD
PROGRESSIONS in scale-degree form, weighted by how characteristic each one is.

Why this is analysis, not invention: dark synthwave (Perturbator / "darksynth")
has a small, well-documented harmonic vocabulary. We encode that vocabulary —
minor, triadic, loop-driven, built on the stepwise bVI–bVII motion and the
"Dreamy Dystopia" i–III–VI–VII — as scale degrees. Nothing here is a melody or a
recording; chord progressions are not copyrightable (see docs/LICENSING.md), and
degrees are key-relative so a progression drops into any key we generate.

Scale degrees (natural minor / aeolian): 0=i  1=ii°  2=bIII  3=iv  4=v  5=bVI  6=bVII
Qualities use the engine's QUALITY names (min, maj, m9, maj9, sus2, …).

The engine embeds this as globalThis.SYNTHWAVE_CORPUS (in the shipped HTML) and the
synthwave genre draws from it via drawSynthwaveProgression(), exactly as the jazz
genres draw from JAZZ_CORPUS via drawJazzProgression().

Run `python3 corpus/analyze_synthwave.py` to print the corpus as JSON.

Sources (harmonic analysis of the genre):
  - eMastered, "7 Common Synthwave Chord Progressions"
      https://emastered.com/blog/synthwave-chord-progressions
  - Unison, "5 Synthwave Chord Progressions"
      https://unison.audio/synthwave-chord-progressions/
  - Riley Guerin, "Genre Analysis: The wonderful world of Synthwave"
      https://rileyguerin.wordpress.com/2018/04/11/genre-analysis-the-wonderful-world-of-synthwave/
"""
import json

# (weight, [(degree, quality), ...], note)  — weight = how characteristic (occurrence-like)
PROGRESSIONS = [
    (100, [(0,"min"),(5,"maj"),(6,"maj")],                 "i–VI–VII — the anthem"),
    ( 80, [(0,"min"),(6,"maj"),(5,"maj")],                 "i–VII–VI"),
    ( 90, [(0,"min"),(5,"maj"),(6,"maj"),(0,"min")],       "i–VI–VII–i"),
    ( 85, [(0,"m9"),(2,"maj"),(5,"maj"),(6,"maj")],        "i–III–VI–VII  'Dreamy Dystopia'"),
    ( 60, [(0,"min"),(5,"maj"),(2,"maj"),(6,"maj")],       "i–VI–III–VII"),
    ( 55, [(0,"min"),(6,"maj"),(5,"maj"),(6,"maj")],       "i–VII–VI–VII vamp"),
    ( 50, [(0,"min"),(3,"min"),(5,"maj"),(6,"maj")],       "i–iv–VI–VII"),
    ( 45, [(0,"min"),(3,"min"),(6,"maj"),(2,"maj")],       "i–iv–VII–III"),
    ( 48, [(0,"min"),(5,"maj"),(3,"min"),(6,"maj")],       "i–VI–iv–VII"),
    ( 40, [(0,"min"),(4,"min"),(5,"maj"),(3,"min")],       "i–v–VI–iv"),
    ( 60, [(5,"maj"),(6,"maj"),(0,"min")],                 "VI–VII–i — rise into the drop"),
    ( 44, [(0,"min"),(6,"maj"),(2,"maj"),(5,"maj")],       "i–VII–III–VI"),
    ( 50, [(0,"min"),(6,"maj"),(5,"maj"),(4,"min")],       "i–VII–VI–v — descending darksynth"),
    ( 38, [(0,"min"),(5,"maj"),(6,"maj"),(4,"min")],       "i–VI–VII–v"),
    ( 36, [(0,"sus2"),(5,"maj"),(3,"min"),(6,"maj")],      "isus2–VI–iv–VII"),
    ( 42, [(0,"min"),(2,"maj"),(6,"maj"),(5,"maj")],       "i–III–VII–VI"),
    ( 30, [(0,"min"),(3,"min"),(4,"min"),(0,"min")],       "i–iv–v–i — minor plagal loop"),
    ( 35, [(0,"m9"),(5,"maj9"),(2,"maj"),(6,"maj")],       "lush add9 pad variant"),
]

def corpus():
    return {
        "source": "dark-synthwave harmonic analysis (chord progressions only, no melodies)",
        "progressions": [
            {"m": "minor", "n": n, "c": [{"d": d, "q": q} for (d, q) in chords]}
            for (n, chords, _note) in PROGRESSIONS
        ],
    }

if __name__ == "__main__":
    print(json.dumps(corpus(), indent=2))
    print("\n# %d progressions, total weight %d"
          % (len(PROGRESSIONS), sum(n for n, _, _ in PROGRESSIONS)))
