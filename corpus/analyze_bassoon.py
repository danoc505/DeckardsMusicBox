#!/usr/bin/env python3
"""THE BASSOON ANALYZER — the VSCO-2 CE sustains in, one member out.

    python3 corpus/analyze_bassoon.py <dir-of-wavs> [--out corpus/brass/bsnwt.js]

Source: VSCO-2 Community Edition, Woodwinds/Bassoon/sus (github.com/sgossner/
VSCO-2-CE, CC0-1.0, the same pinned commit 4403009 the brass came from).
Two recorded velocity layers across the working compass; per analyze_brass's
own rule a two-layer member maps to pp/ff and derives mf as the per-pitch
mean, marked derived.

WHY THIS MEMBER EXISTS: the bass-section pairing. Rimsky-Korsakov: the double
bassoon doubles "an octave lower, the bass of the group to which it belongs"
-- so when the recorded contrabassoon carries a bass line, the octave ABOVE
wants a real bassoon giving the line its front edge ("adds strength and
clarity when doubling", timbreandorchestration.org). This table is that
partner, measured. The SYNTHESISED bassoon instrument keeps its rack and its
ridden controls untouched. [docs/genre-research/the-bass-section.md]

The octave rule is analyze_brass.py's, verbatim: the filename fixes the pitch
class, the member's octave convention is voted by measurement (two passes),
every file is held to it, >60-cent misfits are dropped. Subharmonic
suppression as in analyze_brass: prefer the highest candidate within 7% of
the best score.
"""
import argparse, math, os, re, sys
from collections import defaultdict

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from analyze_brass import f0_near, analyze, attack_time, centroid

CLASS = {"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
SPAN = (30, 74)   # plausible sounding span for a bassoon, wide; the gate judges

NAME = re.compile(r"^PSBassoon_([A-G]#?)(\d)_v(\d)_\d+\.wav$", re.I)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--out", default=None)
    ap.add_argument("--nh", type=int, default=24)
    args = ap.parse_args()

    report = []

    def measure(path, klass, force_m=None):
        x, sr = sf.read(path)
        if x.ndim > 1: x = x.mean(axis=1)
        x = np.asarray(x, dtype=float)
        s0 = int(sr * 0.6); s1 = min(len(x) - int(sr * 0.3), s0 + int(sr * 1.5))
        if s1 - s0 < sr * 0.4:
            s0, s1 = int(len(x) * 0.25), int(len(x) * 0.75)
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
        amps, rms, noise = analyze(seg, sr, best_f0, args.nh)
        return best_m, {"h": amps, "rms": rms, "noise": noise,
                        "atk": attack_time(x, sr)}

    files = [fn for fn in sorted(os.listdir(args.dir)) if NAME.match(fn)]
    if not files:
        sys.exit("no PSBassoon_*.wav files found in " + args.dir)

    # pass 1: free octave vote
    first = {}
    for fn in files:
        m = NAME.match(fn)
        klass = CLASS[m.group(1).upper()]
        named = 12 * (int(m.group(2)) + 1) + klass
        layer = int(m.group(3))
        mm, e = measure(os.path.join(args.dir, fn), klass)
        if mm is None:
            report.append(f"  DROPPED {fn}: {e}"); continue
        first[fn] = (mm, e, named, layer)
    votes = defaultdict(int)
    for mm, e, named, layer in first.values(): votes[mm - named] += 1
    mode = max(votes, key=lambda k: votes[k])
    report.append(f"octave offset votes (named->measured): {dict(sorted(votes.items()))} -> mode {mode:+d}")

    # pass 2: hold every file to the member's own convention
    acc = defaultdict(lambda: defaultdict(list))   # v -> midi -> entries
    for fn, (mm, e, named, layer) in first.items():
        klass = named % 12
        if mm - named != mode:
            m2, e2 = measure(os.path.join(args.dir, fn), klass, force_m=named + mode)
            if m2 is None:
                report.append(f"  DROPPED {fn}: offset {mm-named:+d} vs mode {mode:+d}, "
                              f"and at the mode octave: {e2}")
                continue
            report.append(f"  RE-HELD {fn}: free pick was {mm-named:+d}, passes at {mode:+d}")
            mm, e = m2, e2
        acc[layer][mm].append(e)

    # layers by measured loudness -> pp/ff (+ derived mf), analyze_brass's rule
    layers = sorted(acc.keys())
    cover = {v: len(acc[v]) for v in layers}
    full = max(cover.values())
    thin = [v for v in layers if cover[v] < 0.5 * full]
    for v in thin:
        report.append(f"layer v{v} dropped -- {cover[v]} notes vs {full}")
    layers = [v for v in layers if v not in thin]
    meanrms = {v: float(np.mean([e["rms"] for notes in acc[v].values() for e in notes]))
               for v in layers}
    by_loud = sorted(layers, key=lambda v: meanrms[v])
    if len(by_loud) >= 3:
        dynmap = {by_loud[0]: "pp", by_loud[len(by_loud)//2]: "mf", by_loud[-1]: "ff"}
    elif len(by_loud) == 2:
        dynmap = {by_loud[0]: "pp", by_loud[1]: "ff"}
    else:
        dynmap = {by_loud[0]: "mf"}
    m_out = {}
    for v, dyn in dynmap.items():
        d_out = {}
        for midi, entries in sorted(acc[v].items()):
            h = np.mean([e["h"] for e in entries], axis=0)
            pk = float(np.max(h)) or 1.0
            d_out[midi] = {
                "h": [round(float(x / pk), 4) for x in h],
                "rms": round(float(np.mean([e["rms"] for e in entries])), 5),
                "noise": round(float(np.mean([e["noise"] for e in entries])), 4),
                "atk": round(float(np.mean([e["atk"] for e in entries])), 3),
            }
        m_out[dyn] = d_out
    if "mf" not in m_out and "pp" in m_out and "ff" in m_out:
        mf = {}
        for p in sorted(set(m_out["pp"]) & set(m_out["ff"])):
            a, b = m_out["pp"][p], m_out["ff"][p]
            h = [(x + y) / 2 for x, y in zip(a["h"], b["h"])]
            pk = max(h) or 1
            mf[p] = {"h": [round(x / pk, 4) for x in h],
                     "rms": round(math.sqrt(a["rms"] * b["rms"]), 5),
                     "noise": round((a["noise"] + b["noise"]) / 2, 4),
                     "atk": round((a["atk"] + b["atk"]) / 2, 3)}
        m_out["mf"] = mf

    report.append(f"layers v{by_loud} rms {['%.4f' % meanrms[v] for v in by_loud]}"
                  f" -> {[dynmap[v] for v in by_loud]}")
    for dyn in ("pp", "mf", "ff"):
        d = m_out.get(dyn, {})
        if not d: continue
        derived = " (derived)" if dyn == "mf" and "mf" not in dynmap.values() else ""
        cents_ = [centroid(e["h"]) for e in d.values()]
        report.append(f"  {dyn}{derived}: {len(d)} notes MIDI {min(d)}..{max(d)}"
                      f" · centroid {np.mean(cents_):.2f}"
                      f" · noise {np.mean([e['noise'] for e in d.values()]):.3f}"
                      f" · atk {np.mean([e['atk'] for e in d.values()]):.3f}s"
                      f" · rms {np.mean([e['rms'] for e in d.values()]):.4f}")
    print("\n".join(report))

    if "pp" in m_out and "ff" in m_out:
        cp = np.mean([centroid(e["h"]) for e in m_out["pp"].values()])
        cf = np.mean([centroid(e["h"]) for e in m_out["ff"].values()])
        flag = "" if cf > cp else "   <-- FF NOT BRIGHTER, check"
        print(f"check bassoon: centroid pp {cp:.2f} -> ff {cf:.2f}{flag}")

    if args.out:
        os.makedirs(os.path.dirname(args.out), exist_ok=True)
        js = ["/* derived by corpus/analyze_bassoon.py from VSCO-2 Community",
              "   Edition (github.com/sgossner/VSCO-2-CE, CC0-1.0, commit 4403009),",
              "   Woodwinds/Bassoon/sus: the RECORDED bassoon, per MEASURED concert",
              "   MIDI pitch. Two velocity layers -> pp/ff, mf the per-pitch mean,",
              "   derived. Splice into BRASS_WT beside the contrabassoon: this is",
              "   the bass section's octave-above partner, not a new rack.",
              "   [docs/genre-research/the-bass-section.md] */",
              " bassoon: {"]
        for dyn in ("pp", "mf", "ff"):
            d = m_out.get(dyn, {})
            js.append(f"  {dyn}: {{")
            for midi in sorted(d):
                e = d[midi]
                js.append(f"    {midi}: {{ h: {e['h']}, rms: {e['rms']}, "
                          f"noise: {e['noise']}, atk: {e['atk']} }},")
            js.append("  },")
        js.append(" },")
        with open(args.out, "w") as f:
            f.write("\n".join(js) + "\n")
        print(f"wrote {args.out}")

if __name__ == "__main__":
    main()
