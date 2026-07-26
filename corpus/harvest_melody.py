#!/usr/bin/env python3
"""Harvest NOTE-LEVEL statistics per SECTION FUNCTION from the Hooktheory dataset.

    https://github.com/chrisdonahue/sheetsage   (CC BY-NC-SA 3.0, annotations only)
    Hooktheory_Raw.json.gz -- 26,178 human-transcribed song excerpts

Why this exists, and why it is different from harvest_structure.py:

  harvest_structure.py measured the Harmonix Set, which annotates WHERE sections
  begin and what they are called. That fixed every question about TIME -- how long
  an intro runs, when the first chorus lands, how often a bridge appears.

  It could not answer a single question about NOTES, because it has none. So every
  claim the engine makes about what a chorus IS -- as opposed to where it sits --
  was still a guess. This dataset has the notes AND the label: melody as scale
  degrees with octaves, chords as roman numerals, key, meter, and `json_api.section`
  reading "Chorus", "Verse", "Pre-Chorus", "Bridge", "Intro", "Outro".

  That means the difference between a verse and a chorus can be MEASURED instead of
  asserted: register, density, range, repetition, how much of the melody sits on
  chord tones, where phrases start, how fast the harmony moves.

    python3 corpus/harvest_melody.py [n]
"""
import collections
import gzip
import json
import os
import statistics as st
import sys

RAW = os.path.join(os.path.dirname(__file__), ".hooktheory", "raw.json.gz")

# scale degree token -> semitones above the tonic, in the annotated scale.
# Hooktheory writes degrees as "1".."7" with optional accidental; the major-scale
# semitone map plus the accidental is exact for both major and minor tabs because
# the tab already spells the borrowed degrees (b3, b7 ...) explicitly.
MAJ = {1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11}


def semis(sd):
    if not sd:
        return None
    acc = 0
    while sd and sd[0] in "#b":
        acc += 1 if sd[0] == "#" else -1
        sd = sd[1:]
    try:
        return MAJ[int(sd)] + acc
    except (ValueError, KeyError):
        return None


FUNCS = {
    "Chorus": "chorus", "Verse": "verse", "Intro": "intro",
    "Pre-Chorus": "prechorus", "Bridge": "bridge", "Outro": "outro",
}


def pitch(nt):
    s = semis(nt.get("sd"))
    return None if s is None else s + 12 * (nt.get("octave") or 0)


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    data = json.load(gzip.open(RAW))

    per = collections.defaultdict(lambda: collections.defaultdict(list))
    intervals = collections.Counter()
    leap_resolved = [0, 0]
    onset_in_bar = collections.Counter()
    paired = {}
    n_used = 0

    for _, a in data.items():
        api, js = a.get("json_api") or {}, a.get("json") or {}
        fn = FUNCS.get((api.get("section") or "").strip())
        if not fn:
            continue
        meters = js.get("meters") or [{}]
        bpb = meters[0].get("numBeats") or 4
        if bpb != 4:
            continue
        notes = [n for n in (js.get("notes") or []) if not n.get("isRest")]
        notes = [n for n in notes
                 if pitch(n) is not None
                 and isinstance(n.get("beat"), (int, float))
                 and isinstance(n.get("duration"), (int, float))]
        notes.sort(key=lambda n: n["beat"])
        if len(notes) < 6:
            continue
        chords = [c for c in (js.get("chords") or [])
                  if not c.get("isRest") and isinstance(c.get("beat"), (int, float))]
        beats = max(n["beat"] + n["duration"] for n in notes) - 1
        bars = max(1.0, beats / bpb)
        n_used += 1
        P = [pitch(n) for n in notes]

        per[fn]["register"].append(st.mean(P))
        per[fn]["range"].append(max(P) - min(P))
        per[fn]["density"].append(len(notes) / bars)
        per[fn]["distinct_pc"].append(len({p % 12 for p in P}))
        # how much of the melody is literal repetition: bar signatures that recur
        sig = collections.defaultdict(list)
        for n in notes:
            b = int((n["beat"] - 1) // bpb)
            sig[b].append((round((n["beat"] - 1) % bpb, 2), pitch(n) - P[0]))
        keys = ["|".join(map(str, sorted(v))) for v in sig.values()]
        if keys:
            per[fn]["repeat"].append(1 - len(set(keys)) / len(keys))
        # NOT measured here: whether a phrase picks up before the downbeat. Every
        # Hooktheory clip is cut at its section start, so the first note is at beat 1
        # by construction -- the number came out 1.00 for all six functions, which is
        # an artifact of how the corpus was made, not a fact about music.
        # note values: how long is the average note, in beats
        per[fn]["notelen"].append(st.mean(n["duration"] for n in notes))
        # harmonic rhythm: bars per chord
        if chords:
            per[fn]["chordbars"].append(bars / len(chords))
            per[fn]["distinct_chords"].append(len({(c.get("root"), c.get("type")) for c in chords}))
        # the last note: where a phrase lands
        per[fn]["ends_on_tonic"].append(1.0 if P[-1] % 12 == 0 else 0.0)

        # HOW MUCH OF THE TUNE SITS ON THE CHORD. The engine snaps every strong beat to
        # a chord tone as if that were a law; this measures what songs actually do.
        if chords:
            cs = sorted(chords, key=lambda c: c["beat"])
            def chord_at(bt):
                cur = None
                for c in cs:
                    if c["beat"] <= bt: cur = c
                    else: break
                return cur
            hit = tot_n = hit_s = tot_s = 0
            for n in notes:
                c = chord_at(n["beat"])
                if not c or c.get("root") is None: continue
                # roman root 1..7 -> semitones; triad = root, third, fifth of the scale
                r = MAJ.get(c["root"])
                if r is None: continue
                deg = c["root"]
                tri = {MAJ[((deg - 1 + k) % 7) + 1] for k in (0, 2, 4)}
                on = (pitch(n) % 12) in tri
                tot_n += 1; hit += 1 if on else 0
                if (n["beat"] - 1) % bpb == 0:
                    tot_s += 1; hit_s += 1 if on else 0
            if tot_n: per[fn]["chordtone"].append(hit / tot_n)
            if tot_s: per[fn]["chordtone_strong"].append(hit_s / tot_s)

        song = (api.get("artist"), api.get("song"))
        paired.setdefault(song, {}).setdefault(fn, []).append(
            (st.mean(P), len(notes) / bars, per[fn]["repeat"][-1] if per[fn]["repeat"] else None,
             max(P) - min(P)))

        for i in range(1, len(P)):
            iv = P[i] - P[i - 1]
            intervals[max(-12, min(12, iv))] += 1
            if abs(iv) >= 3 and i + 1 < len(P):
                nxt = P[i + 1] - P[i]
                leap_resolved[1] += 1
                if 0 < abs(nxt) <= 2 and (nxt > 0) != (iv > 0):
                    leap_resolved[0] += 1
        for n in notes:
            onset_in_bar[round(((n["beat"] - 1) % bpb) * 4) / 4] += 1
        if limit and n_used >= limit:
            break

    print(f"Hooktheory: {n_used} labelled sections used (of {len(data)})\n")
    order = ["intro", "verse", "prechorus", "chorus", "bridge", "outro"]
    rows = [
        ("median register (semitones above tonic)", "register", 1),
        ("melodic range (semitones)", "range", 1),
        ("notes per bar", "density", 2),
        ("distinct pitch classes", "distinct_pc", 1),
        ("mean note length (beats)", "notelen", 2),
        ("share of bars that are literal repeats", "repeat", 2),
        ("ends on the tonic (share)", "ends_on_tonic", 2),
        ("melody note is a chord tone (share)", "chordtone", 2),
        ("...on the downbeat of a bar", "chordtone_strong", 2),
        ("bars per chord", "chordbars", 2),
        ("distinct chords in the section", "distinct_chords", 1),
    ]
    w = max(len(r[0]) for r in rows)
    print(" " * w + "  " + "".join(f"{f:>11}" for f in order))
    print(" " * w + "  " + "".join(f"{len(per[f]['register']):>11}" for f in order) + "   (n)")
    for label, key, dp in rows:
        cells = []
        for f in order:
            v = per[f].get(key) or []
            cells.append(f"{st.median(v):>11.{dp}f}" if v else f"{'-':>11}")
        print(f"{label:<{w}}  " + "".join(cells))

    # ── VERSE vs CHORUS, WITHIN THE SAME SONG ────────────────────────────────
    # Comparing medians across the whole corpus buries the difference in song-to-song
    # variance: one artist's verse sits higher than another's chorus, and that noise is
    # far larger than the effect. Pairing the two sections of the SAME song removes it.
    dr = dd = drep = drng = 0; np_ = 0
    for song, fns in paired.items():
        if "verse" not in fns or "chorus" not in fns: continue
        v = fns["verse"][0]; c = fns["chorus"][0]
        np_ += 1
        dr += c[0] - v[0]; dd += c[1] - v[1]; drng += c[3] - v[3]
        if v[2] is not None and c[2] is not None: drep += c[2] - v[2]
    if np_:
        print(f"\nVERSE -> CHORUS, measured within the SAME song ({np_} songs):")
        print(f"  register       {dr/np_:+.2f} semitones")
        print(f"  notes per bar  {dd/np_:+.2f}")
        print(f"  melodic range  {drng/np_:+.2f} semitones")
        print(f"  bar repetition {100*drep/np_:+.1f} percentage points")

    tot = sum(intervals.values())
    step = sum(c for iv, c in intervals.items() if 1 <= abs(iv) <= 2)
    same = intervals.get(0, 0)
    leap = tot - step - same
    print(f"\nMELODIC MOTION over {tot} intervals:")
    print(f"  repeated note {100*same/tot:5.1f}%   stepwise {100*step/tot:5.1f}%   leap {100*leap/tot:5.1f}%")
    print(f"  a leap is followed by a step BACK: {100*leap_resolved[0]/max(1,leap_resolved[1]):.1f}%")
    up = sum(c for iv, c in intervals.items() if iv > 0)
    print(f"  direction: {100*up/max(1,tot-same):.1f}% of moves are upward")
    print("  interval histogram (semitones):",
          {k: intervals[k] for k in sorted(intervals) if abs(k) <= 7})

    tot_o = sum(onset_in_bar.values())
    print("\nWHERE NOTES START, within the bar (share of all onsets):")
    for b in sorted(onset_in_bar):
        if onset_in_bar[b] / tot_o >= 0.01:
            print(f"   beat {b+1:<5} {100*onset_in_bar[b]/tot_o:5.1f}%")


if __name__ == "__main__":
    main()
