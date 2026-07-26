#!/usr/bin/env python3
"""Harvest what an ACCOMPANIMENT actually does, from POP909.

    https://github.com/music-x-lab/POP909-Dataset   (ISMIR 2020, research use)
    909 pop songs as MIDI with three separate tracks: MELODY (the tune),
    BRIDGE (the sub-melody / answering line), and PIANO (the accompaniment).

Why this exists. Two corpora have already been measured here, and between them they
cover exactly half the band:

    harvest_melody.py  (Hooktheory)   -> the TUNE, per section function
    harvest_drums.py   (Groove MIDI)  -> the KIT, per lane and per sixteenth

Nothing has ever measured the other half -- the CHORDS and the BASS -- and reading
twenty of our own songs is what made that impossible to ignore: our harmony plays
2-5 distinct bar-rhythms across a whole song, with one pattern covering a median 55%
of every bar in it, and our bass 2-5. In seed 4 the chord part is a stab on beat one
followed by twelve empty steps, identically, for ninety-six bars. Whether that is
wrong is not a matter of opinion, and it was never checked.

POP909 is a piano arrangement, so the PIANO track carries both jobs at once: its low
register is doing the bass's work and its upper register the comping. Splitting the
track at each song's own median pitch measures them separately.

    python3 corpus/harvest_accompaniment.py [n_songs]
"""
import collections
import io
import os
import statistics as st
import sys
import urllib.error
import urllib.request

import mido            # pip install mido

CACHE = os.path.join(os.path.dirname(__file__), ".pop909")
RAW = ("https://raw.githubusercontent.com/music-x-lab/POP909-Dataset/master"
       "/POP909/{i:03d}/{i:03d}.mid")
BEAT = ("https://raw.githubusercontent.com/music-x-lab/POP909-Dataset/master"
        "/POP909/{i:03d}/beat_midi.txt")


def fetch(i):
    """One file per song, ~11 KB. Not ours to vendor, so it is cached on first run."""
    path = os.path.join(CACHE, f"{i:03d}.mid")
    if os.path.exists(path):
        return path
    os.makedirs(CACHE, exist_ok=True)
    try:
        urllib.request.urlretrieve(RAW.format(i=i), path)
    except (urllib.error.URLError, urllib.error.HTTPError):
        return None
    return path


def tempo_map(mid):
    """Absolute-tick -> microseconds-per-beat, so ticks can be turned into seconds."""
    out = []
    for tr in mid.tracks:
        t = 0
        for msg in tr:
            t += msg.time
            if msg.type == "set_tempo":
                out.append((t, msg.tempo))
    out.sort()
    return out or [(0, 500000)]


def ticks_to_sec(ticks, tmap, tpb):
    sec = 0.0
    prev_t, prev_tempo = 0, tmap[0][1]
    for at, tempo in tmap:
        if at >= ticks:
            break
        sec += (at - prev_t) / tpb * prev_tempo / 1e6
        prev_t, prev_tempo = at, tempo
    return sec + (ticks - prev_t) / tpb * prev_tempo / 1e6


def onsets(track, tpb, tmap, beats, downbeats):
    """(bar, step-in-bar, pitch) using the dataset's OWN beat grid.

    POP909's MIDI is aligned to the audio, so it is a PERFORMANCE and its notes do not
    sit on tick multiples. Quantising against tick 0 smeared every onset across the bar
    -- the histogram came out flat at ~6% on all sixteen positions, and "distinct bar
    patterns" then counted performance jitter, not playing. The dataset ships
    beat_midi.txt precisely so this can be done properly: each note is placed against
    the nearest annotated beat and the fraction between beats, and bars are counted off
    the annotated downbeats.
    """
    import bisect
    t = 0
    out = []
    for msg in track:
        t += msg.time
        if msg.type == "note_on" and msg.velocity > 0:
            sec = ticks_to_sec(t, tmap, tpb)
            i = bisect.bisect_right(beats, sec) - 1
            if i < 0 or i + 1 >= len(beats):
                continue
            span = beats[i + 1] - beats[i]
            if span <= 0:
                continue
            frac = (sec - beats[i]) / span
            db = bisect.bisect_right(downbeats, i) - 1     # which bar (index into downbeats)
            if db < 0:
                continue
            beat_in_bar = i - downbeats[db]
            if beat_in_bar > 3:
                continue                                   # not 4/4 here; skip the bar
            step = int(round((beat_in_bar + frac) * 4)) % 16
            out.append((db, step, msg.note))
    return out


def beat_grid(i):
    """Annotated beat times (seconds) and the indices of the downbeats."""
    path = os.path.join(CACHE, f"{i:03d}_beat.txt")
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        try:
            urllib.request.urlretrieve(BEAT.format(i=i), path)
        except (urllib.error.URLError, urllib.error.HTTPError):
            return None, None
    beats, downs = [], []
    for line in io.open(path):
        parts = line.split()
        if len(parts) < 3:
            continue
        beats.append(float(parts[0]))
        if float(parts[2]) == 1.0:
            downs.append(len(beats) - 1)
    return (beats, downs) if len(beats) > 16 and len(downs) > 4 else (None, None)


def patterns(notes):
    """Per bar, the set of sixteenth positions that carry an onset."""
    by = collections.defaultdict(set)
    for b, s, _ in notes:
        by[b].add(s)
    return {b: ",".join(str(x) for x in sorted(v)) for b, v in by.items()}


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    stats = collections.defaultdict(list)
    onset_hist = collections.defaultdict(collections.Counter)
    used = 0

    for i in range(1, n + 1):
        path = fetch(i)
        if not path:
            continue
        try:
            mid = mido.MidiFile(path)
        except Exception:
            continue
        beats, downs = beat_grid(i)
        if beats is None:
            continue
        tpb = mid.ticks_per_beat
        tmap = tempo_map(mid)
        by_name = {}
        for tr in mid.tracks:
            nm = (tr.name or "").strip().upper()
            if nm in ("MELODY", "BRIDGE", "PIANO"):
                by_name[nm] = onsets(tr, tpb, tmap, beats, downs)
        if "PIANO" not in by_name or "MELODY" not in by_name:
            continue
        piano = by_name["PIANO"]
        if len(piano) < 80:
            continue
        used += 1

        # split the arrangement at the song's own median pitch: the low half is doing
        # the bass's job, the high half the comping
        mid_p = st.median(p for _, _, p in piano)
        low = [x for x in piano if x[2] <= mid_p]
        high = [x for x in piano if x[2] > mid_p]

        for label, notes in (("bass", low), ("comp", high), ("melody", by_name["MELODY"])):
            if len(notes) < 40:
                continue
            pats = patterns(notes)
            if not pats:
                continue
            c = collections.Counter(pats.values())
            nbars = len(pats)
            stats[label + ":distinct"].append(len(c))
            stats[label + ":top_share"].append(c.most_common(1)[0][1] / nbars)
            stats[label + ":per_bar"].append(len(notes) / nbars)
            stats[label + ":bars"].append(nbars)
            # DOES IT CHANGE ACROSS THE SONG? Compare the commonest pattern of the first
            # third against the last third -- no section labels needed to see movement.
            ks = sorted(pats)
            third = max(1, len(ks) // 3)
            a = collections.Counter(pats[k] for k in ks[:third]).most_common(1)[0][0]
            z = collections.Counter(pats[k] for k in ks[-third:]).most_common(1)[0][0]
            stats[label + ":same_end"].append(1.0 if a == z else 0.0)
            for _, s, _ in notes:
                onset_hist[label][s] += 1

    print(f"POP909: {used} songs\n")
    rows = [
        ("distinct bar-rhythms in a whole song", "distinct", 1),
        ("the commonest one covers", "top_share", 2),
        ("onsets per bar", "per_bar", 2),
        ("first third and last third share a pattern", "same_end", 2),
    ]
    labels = ("melody", "comp", "bass")
    w = max(len(r[0]) for r in rows)
    print(" " * w + "  " + "".join(f"{l:>12}" for l in labels))
    for title, key, dp in rows:
        cells = []
        for l in labels:
            v = stats.get(l + ":" + key) or []
            cells.append(f"{st.median(v):>12.{dp}f}" if v else f"{'-':>12}")
        print(f"{title:<{w}}  " + "".join(cells))
    print(" " * w + "  " + "".join(
        f"{st.median(stats[l + ':bars']):>12.0f}" if stats.get(l + ":bars") else f"{'-':>12}"
        for l in labels) + "   bars measured (median)")

    print("\nWHERE ONSETS FALL, by sixteenth (share of that part's onsets):")
    for l in labels:
        c = onset_hist.get(l)
        if not c:
            continue
        tot = sum(c.values())
        print(f"  {l:<7} " + "".join(f"{100*c[s]/tot:5.1f}" for s in range(16)))


if __name__ == "__main__":
    main()
