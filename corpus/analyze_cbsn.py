#!/usr/bin/env python3
"""THE CONTRABASSOON ANALYZER — the Philharmonia recordings in, one member out.

    python3 corpus/analyze_cbsn.py <dir-of-mp3s> [--out corpus/brass/cbsnwt.js]

Source: the Philharmonia Orchestra sound samples (philharmonia.co.uk), per
note, four dynamics, fetched via the skratchdot/philharmonia-samples mirror.
Licence: free to use in your own work; the samples themselves may not be
resold — a weaker position than CC0 and carried honestly in the provenance
(this is a personal, non-distributed program, and what ships is MEASUREMENT,
not the recordings). [docs/LICENSING.md]

Emits ONE member block in BRASS_WT's exact format — not because a
contrabassoon is brass (it is the orchestra's deepest double reed) but
because the measured-table format is instrument-agnostic and a second format
would be the same table twice. The octave rule is analyze_brass.py's,
verbatim: the filename fixes the pitch class, the member's octave convention
is voted by measurement, every file is held to it.

Four recorded dynamics, three used: piano -> pp, mezzo-forte -> mf,
fortissimo -> ff. The forte layer is between mf and ff and is reported,
unused — the engine morphs three layers and the endpoints matter most.
"""
import argparse, math, os, re, sys
from collections import defaultdict

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from analyze_brass import f0_near, analyze, attack_time, centroid

CLASS = {"C":0,"Cs":1,"D":2,"Ds":3,"E":4,"F":5,"Fs":6,"G":7,"Gs":8,"A":9,"As":10,"B":11}
DYN = {"piano": "pp", "mezzo-forte": "mf", "fortissimo": "ff"}
SPAN = (20, 60)   # plausible sounding span, wide on purpose; the gate judges pitch

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    report = []
    def measure(path, klass, force_m=None):
        x, sr = sf.read(path)
        if x.ndim > 1: x = x.mean(axis=1)
        x = np.asarray(x, dtype=float)
        s0 = int(sr * 0.25); s1 = min(len(x) - int(sr * 0.1), s0 + int(sr * 1.2))
        if s1 - s0 < sr * 0.35:
            s0, s1 = int(len(x) * 0.2), int(len(x) * 0.8)
        seg = x[s0:s1]
        cands = ([force_m] if force_m else
                 [m for m in range(SPAN[0], SPAN[1] + 1) if m % 12 == klass])
        scored = []
        for mm in cands:
            f0, r = f0_near(seg, sr, mm)
            if r > 0: scored.append((mm, f0, r))
        if not scored: return None, "no candidate"
        best_r = max(r for _, _, r in scored)
        best_m, best_f0, _ = max((s for s in scored if s[2] >= 0.93 * best_r),
                                 key=lambda s: s[0])
        f_expect = 440.0 * 2 ** ((best_m - 69) / 12.0)
        cents = 1200 * math.log2(best_f0 / f_expect)
        if abs(cents) > 60: return None, f"best {best_m} is {cents:+.0f} cents off"
        amps, rms, noise = analyze(seg, sr, best_f0)
        return best_m, {"h": amps, "rms": rms, "noise": noise,
                        "atk": attack_time(x, sr)}

    files = []
    for fn in sorted(os.listdir(args.dir)):
        m = re.match(r"contrabassoon_([A-G]s?)(\d)_\d+_([a-z-]+)_normal\.mp3$", fn)
        if not m: continue
        klass = CLASS[m.group(1)]
        named = klass + 12 * (int(m.group(2)) + 1)
        dyn = DYN.get(m.group(3))
        if dyn is None:
            continue      # the forte layer, deliberately unused
        files.append((fn, klass, named, dyn))

    first = {}
    for fn, klass, named, dyn in files:
        mm, e = measure(os.path.join(args.dir, fn), klass)
        if mm is None:
            report.append(f"  DROPPED {fn}: {e}"); continue
        first[fn] = (mm, named, dyn, e)
    votes = defaultdict(int)
    for mm, named, _, _ in first.values(): votes[mm - named] += 1
    mode = max(votes, key=lambda k: votes[k])
    report.append(f"octave offset votes {dict(votes)} -> mode {mode:+d}")

    table = defaultdict(dict)
    for fn, (mm, named, dyn, e) in first.items():
        if mm - named != mode:
            klass = named % 12
            m2, e2 = measure(os.path.join(args.dir, fn), klass, force_m=named + mode)
            if m2 is None:
                report.append(f"  DROPPED {fn}: offset {mm-named} vs mode {mode}, at mode: {e2}")
                continue
            report.append(f"  RE-HELD {fn}: free pick {mm-named:+d}, passes at {mode:+d}")
            mm, e = m2, e2
        if mm in table[dyn]:
            report.append(f"  COLLISION {dyn} midi {mm} — keeping the first")
            continue
        table[dyn][mm] = {"h": [round(float(v), 4) for v in e["h"]],
                          "rms": round(float(e["rms"]), 5),
                          "noise": round(float(e["noise"]), 4),
                          "atk": round(float(e["atk"]), 3)}

    for dyn in ("pp", "mf", "ff"):
        d = table[dyn]
        cs = [centroid(e["h"]) for e in d.values()]
        report.append(f"{dyn}: {len(d)} notes MIDI {min(d)}..{max(d)}"
                      f" · centroid {np.mean(cs):.2f}"
                      f" · noise {np.mean([e['noise'] for e in d.values()]):.3f}"
                      f" · atk {np.mean([e['atk'] for e in d.values()]):.3f}s"
                      f" · rms {np.mean([e['rms'] for e in d.values()]):.4f}")
    cp = np.mean([centroid(e["h"]) for e in table["pp"].values()])
    cf = np.mean([centroid(e["h"]) for e in table["ff"].values()])
    report.append(f"check: centroid pp {cp:.2f} -> ff {cf:.2f}"
                  + ("" if cf > cp else "   <-- FF NOT BRIGHTER, check"))
    print("\n".join(report))

    if args.out:
        js = ["/* derived by corpus/analyze_cbsn.py from the Philharmonia Orchestra",
              "   sound samples (philharmonia.co.uk, via skratchdot mirror): the",
              "   contrabassoon, per MEASURED concert MIDI pitch, piano/mezzo-forte/",
              "   fortissimo -> pp/mf/ff. Splice into BRASS_WT: the format is",
              "   instrument-agnostic measurement, the instrument is a double reed. */",
              " contrabassoon: {"]
        for dyn in ("pp", "mf", "ff"):
            js.append(f"  {dyn}: {{")
            for p in sorted(table[dyn]):
                e = table[dyn][p]
                js.append(f"    {p}: {{ h: {e['h']}, rms: {e['rms']}, "
                          f"noise: {e['noise']}, atk: {e['atk']} }},")
            js.append("  },")
        js.append(" },")
        with open(args.out, "w") as f:
            f.write("\n".join(js) + "\n")
        print(f"wrote {args.out} ({os.path.getsize(args.out)} bytes)")

if __name__ == "__main__":
    main()
