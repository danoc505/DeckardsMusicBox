#!/usr/bin/env python3
"""Harvest REAL song structure from the Harmonix Set and print the statistics the
engine's arrangement needs. Annotations only (no audio) -- 912 Western pop/dance/rock
tracks with functional segments AND downbeats, so section boundaries convert to BARS.

    https://github.com/urinieto/harmonixset   (annotations CC BY-NC-SA 4.0)

Why this exists: the engine's structural corpus (IMPROV_FORMS) came from jazz standards,
where every section is exactly 8 bars and there are no intros, outros or energy arcs. So
every number about WHEN things happen -- how long an intro runs, when the first chorus
lands -- was a guess. This measures them instead.

    python3 corpus/harvest_structure.py [n_tracks]
"""
import csv, os, random, statistics as st, sys, urllib.request
from collections import defaultdict, Counter

RAW = "https://raw.githubusercontent.com/urinieto/harmonixset/main/dataset"
CACHE = os.path.join(os.path.dirname(__file__), ".harmonix")

def get(path):
    os.makedirs(CACHE, exist_ok=True)
    local = os.path.join(CACHE, path.replace("/", "_"))
    if not os.path.exists(local):
        urllib.request.urlretrieve(f"{RAW}/{path}", local)
    return local

def main(n=120):
    rows = list(csv.DictReader(open(get("metadata.csv"))))
    random.seed(7)
    sample = random.sample(rows, min(n, len(rows)))
    introB, firstFrac, firstS, counts = [], [], [], []
    lens, labels, outro, used = defaultdict(list), Counter(), 0, 0
    for r in sample:
        try: segs_path = get(f"segments/{r['File']}.txt")
        except Exception: continue
        segs = []
        for line in open(segs_path):
            p = line.split()
            if len(p) >= 2:
                try: segs.append((float(p[0]), p[1].lower()))
                except ValueError: pass
        if len(segs) < 3: continue
        used += 1
        spb = 4 * (60.0 / float(r["BPM"]))          # seconds per 4/4 bar
        end = segs[-1][0]
        for i, (t, lab) in enumerate(segs[:-1]):
            labels[lab] += 1
            lens[lab].append((segs[i+1][0] - t) / spb)
        counts.append(len(segs) - 1)
        introB.append(segs[1][0] / spb if segs[0][1].startswith("intro") else 0.0)
        ch = [t for t, l in segs if "chorus" in l or "drop" in l]
        if ch:
            firstS.append(ch[0]); firstFrac.append(ch[0] / end)
        if any(("outro" in l or "coda" in l) for _, l in segs): outro += 1

    def line(v): return f"median {st.median(v):6.1f}   mean {st.mean(v):6.1f}   p90 {sorted(v)[int(len(v)*.9)]:6.1f}"
    print(f"HARMONIX SET — {used} tracks\n")
    print("INTRO LENGTH (bars)        ", line(introB))
    print("FIRST CHORUS/DROP (seconds)", line(firstS))
    print("  ...as fraction of song   ", f"median {st.median(firstFrac):.2f}   mean {st.mean(firstFrac):.2f}")
    print("SECTIONS PER SONG          ", line([float(c) for c in counts]))
    print(f"SONGS WITH AN OUTRO         {outro}/{used}  ({100*outro/used:.0f}%)\n")
    print("SECTION LENGTH IN BARS, by function")
    for lab, _ in labels.most_common(12):
        v = lens[lab]
        if len(v) >= 8:
            print(f"   {lab:<13} n={len(v):<5} median {st.median(v):5.1f}   mean {st.mean(v):5.1f}")

if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 120)
