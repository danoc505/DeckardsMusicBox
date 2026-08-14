#!/usr/bin/env python3
"""THE BRASS ANALYZER — a recorded quartet in, compact spectra out.

    python3 corpus/analyze_brass.py <dir-holding-Brass/> [--out corpus/brass/brasswt.js]

Sibling of analyze_sax.py, for the VSCO-2 Community Edition brass
(github.com/sgossner/VSCO-2-CE, CC0-1.0, pinned commit in the fetch script).
Per note it extracts the same four facts the sax engine runs on:

    - the first 24 harmonic amplitudes over a stable sustain window
    - the note's RMS level (so the dynamic layers keep their real relation)
    - the noise residual share
    - the 10->90% attack time

for seven members: horn, trumpet, trombone, tuba, and the three RECORDED
mutes (hornMute, trumpetStraight, trumpetHarmon) — a mute here is a
measured spectrum set, never a filter guess [brass-arranging.md §5].

THE OCTAVE IS NEVER TRUSTED. Sample libraries disagree about which octave
number middle C gets, and the Weresax was named a full octave below its
sound. So the filename fixes only the PITCH CLASS; the octave is chosen by
autocorrelation against every plausible octave of that class, and a note
whose best candidate is still >60 cents off is REPORTED AND DROPPED. The
per-member octave offset (measured minus named) is reported so the naming
convention becomes a checked fact instead of an assumption.

Dynamic layers: VSCO's v1/v2/v3. Which end is loud is MEASURED (mean RMS
per layer), not assumed. Three layers map to pp/mf/ff directly; two map to
pp/ff with mf the per-pitch mean, marked derived — the Weresax precedent.

The downloaded audio never leaves the scratchpad and is never committed
[repo rule]; only this script and the derived table land anywhere.
"""
import argparse, math, os, re, sys
from collections import defaultdict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "harness"))
from make_sample import read_wav

import numpy as np

# member -> (subdir under Brass/, articulation token, plausible sounding span)
# Spans are the sheet's §1 ranges widened a fourth each way so the gate judges
# pitch, not my range expectations. [brass-arranging.md §1]
MEMBERS = {
    "horn":            ("F Horn/sus",              "sus",           (36, 82)),
    "hornMute":        ("F Horn/mute",             "mute",          (36, 82)),
    "trumpet":         ("Trumpet/sus",             "sus",           (47, 87)),
    "trumpetStraight": ("Trumpet/straightM-sus",   "straightM-sus", (47, 87)),
    "trumpetHarmon":   ("Trumpet/harmonM-sus",     "harmonM-sus",   (47, 87)),
    "trombone":        ("Tenor Trombone/sus",      "sus",           (33, 75)),
    "tuba":            ("Tuba/sus",                "sus",           (24, 70)),
}

CLASS = {"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}

def parse_name(fn, art):
    """<prefix>_<art>_<PITCH>_v<layer>_<suffix>.wav -> (class, named_midi, layer)"""
    m = re.search(r"_" + re.escape(art) + r"_([A-G]#?)(\d)_v(\d)_", fn)
    if not m: return None
    return CLASS[m.group(1)], CLASS[m.group(1)] + 12 * (int(m.group(2)) + 1), int(m.group(3))

def f0_near(seg, sr, midi):
    """narrow autocorrelation around one candidate pitch; returns (f0, score)"""
    f = 440.0 * 2 ** ((midi - 69) / 12.0)
    lag0 = sr / f
    lo, hi = int(lag0 * 0.94), int(lag0 * 1.06)
    if lo < 2 or hi >= len(seg) // 2: return None, -1.0
    e = float(np.dot(seg, seg)) or 1e-12
    best_l, best = lo, -1.0
    for l in range(lo, hi + 1):
        r = float(np.dot(seg[:-l], seg[l:])) / e
        if r > best: best, best_l = r, l
    return sr / best_l, best

def analyze(seg, sr, f0, nh=24):
    n = len(seg)
    w = np.hanning(n)
    x = seg * w
    t = np.arange(n) / sr
    amps = []
    for h in range(1, nh + 1):
        fh = f0 * h
        if fh > sr * 0.45:
            amps.append(0.0); continue
        c = np.dot(x, np.cos(2 * np.pi * fh * t))
        s = np.dot(x, np.sin(2 * np.pi * fh * t))
        amps.append(2 * math.hypot(c, s) / np.sum(w))
    amps = np.array(amps)
    rms = float(np.sqrt(np.mean(seg ** 2)))
    harm_rms = float(np.sqrt(np.sum(amps ** 2) / 2))
    noise = max(0.0, 1.0 - min(1.0, harm_rms / max(1e-9, rms)))
    peak = float(np.max(amps)) or 1.0
    return amps / peak, rms, noise

def attack_time(sig, sr):
    env = np.abs(sig)
    win = int(sr * 0.010)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    p = np.max(env)
    i10 = int(np.argmax(env > 0.1 * p))
    i90 = int(np.argmax(env > 0.9 * p))
    return max(0.0, (i90 - i10) / sr)

def centroid(h):
    h = np.array(h); f = np.arange(1, len(h) + 1)
    return float(np.sum(h * f) / max(1e-9, np.sum(h)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="directory that contains Brass/")
    ap.add_argument("--out", default=None)
    ap.add_argument("--nh", type=int, default=24)
    args = ap.parse_args()

    table = {}        # member -> layer(v) -> midi -> [entries to average over rr]
    offsets = defaultdict(lambda: defaultdict(int))   # member -> (measured-named) -> count
    report = []
    # TWO PASSES. The first measures every file freely and votes on the member's
    # naming convention (the offset between named and sounding octave). The
    # second holds every file to that convention: a note that cannot pass the
    # 60-cent gate at the member's own offset is dropped, never re-homed to a
    # different octave -- one harmonic-locked file out of 29 was landing a lone
    # +24 entry in the horn table, which is a poisoned pitch, not a datum.
    for member, (sub, art, (plo, phi)) in MEMBERS.items():
        d = os.path.join(args.root, "Brass", sub)
        if not os.path.isdir(d):
            report.append(f"{member}: MISSING DIR {d}"); continue
        def measure(fn, force_m=None):
            """returns (best_m, entry) or (None, reason). force_m pins the
            octave; free mode votes among every octave of the named class."""
            p = parse_name(fn, art)
            if not p: return None, "unparsed"
            klass, named, layer = p
            sig, sr = read_wav(os.path.join(d, fn))
            sig = np.array(sig)
            # sustain window: past the attack, before the tail
            s0 = int(sr * 0.6); s1 = min(len(sig) - int(sr * 0.3), s0 + int(sr * 1.5))
            if s1 - s0 < sr * 0.4:
                s0, s1 = int(len(sig) * 0.25), int(len(sig) * 0.75)
            seg = sig[s0:s1]
            cands = ([force_m] if force_m else
                     [m for m in range(plo, phi + 1) if m % 12 == klass])
            scored = []
            for mm in cands:
                f0, r = f0_near(seg, sr, mm)
                if r > 0: scored.append((mm, f0, r))
            if not scored: return None, "no candidate"
            # SUBHARMONIC SUPPRESSION. Any periodic signal also correlates at
            # twice its period, so the octave BELOW the true pitch scores almost
            # as high -- and on the mutes, whose fundamentals are deliberately
            # starved, it can score higher. Preferring the highest candidate
            # within 7% of the best score picks the true octave; picking the raw
            # max was measured to split the straight mute 9-vs-7 between two
            # octaves, which is how the bug announced itself.
            best_r = max(r for _, _, r in scored)
            best_m, best_f0, _ = max((s for s in scored if s[2] >= 0.93 * best_r),
                                     key=lambda s: s[0])
            f_expect = 440.0 * 2 ** ((best_m - 69) / 12.0)
            cents = 1200 * math.log2(best_f0 / f_expect)
            if abs(cents) > 60: return None, f"best {best_m} is {cents:+.0f} cents off"
            amps, rms, noise = analyze(seg, sr, best_f0, args.nh)
            return best_m, {"h": amps, "rms": rms, "noise": noise,
                            "atk": attack_time(sig, sr), "named": named, "layer": layer}

        files = [fn for fn in sorted(os.listdir(d)) if fn.lower().endswith(".wav")]
        first = {}
        for fn in files:
            m, e = measure(fn)
            if m is None:
                report.append(f"  DROPPED {member} {fn}: {e}"); continue
            first[fn] = (m, e)
        if not first:
            table[member] = {}; continue
        votes = defaultdict(int)
        for m, e in first.values(): votes[m - e["named"]] += 1
        mode = max(votes, key=lambda k: votes[k])
        acc = defaultdict(lambda: defaultdict(list))   # v -> midi -> entries
        for fn, (m, e) in first.items():
            off = m - e["named"]
            if off != mode:
                m2, e2 = measure(fn, force_m=e["named"] + mode)
                if m2 is None:
                    report.append(f"  DROPPED {member} {fn}: offset {off} vs mode "
                                  f"{mode}, and at the mode octave: {e2}")
                    continue
                report.append(f"  RE-HELD {member} {fn}: free pick was {off:+d}, "
                              f"passes at the member's {mode:+d}")
                m, e = m2, e2
            acc[e["layer"]][m].append(e)
            offsets[member][m - e["named"]] += 1
        table[member] = acc

    # ── average round robins, order the layers by measured loudness ──
    out = {}
    for member, acc in table.items():
        if not acc: continue
        layers = sorted(acc.keys())
        # A LAYER MUST COVER THE INSTRUMENT TO BE A DYNAMIC. The horn carries a
        # fourth v-set of two notes (swell-like, 2.1 s attacks); letting it win
        # the ff slot gave the whole member a two-note top layer darker than its
        # pp. A layer under half the best coverage is dropped and reported.
        cover = {v: len(acc[v]) for v in layers}
        full = max(cover.values())
        thin = [v for v in layers if cover[v] < 0.5 * full]
        for v in thin:
            report.append(f"{member}: layer v{v} dropped -- {cover[v]} notes vs {full}")
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
                names = {e["named"] for e in entries}
                if len(names) > 1:
                    report.append(f"  COLLISION {member} v{v} midi {midi}: "
                                  f"named pitches {sorted(names)} averaged together")
                h = np.mean([e["h"] for e in entries], axis=0)
                pk = float(np.max(h)) or 1.0
                d_out[midi] = {
                    "h": [round(float(x / pk), 4) for x in h],
                    "rms": round(float(np.mean([e["rms"] for e in entries])), 5),
                    "noise": round(float(np.mean([e["noise"] for e in entries])), 4),
                    "atk": round(float(np.mean([e["atk"] for e in entries])), 3),
                }
            m_out[dyn] = d_out
        # two recorded layers -> derive the middle, marked in the header
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
        out[member] = m_out
        offs = dict(sorted(offsets[member].items(), key=lambda kv: -kv[1]))
        report.append(f"{member}: layers v{by_loud} rms {['%.4f' % meanrms[v] for v in by_loud]}"
                      f" -> {[dynmap.get(v, 'unused') for v in by_loud]} · octave offset(name->measured) {offs}")
        for dyn in ("pp", "mf", "ff"):
            d = m_out.get(dyn, {})
            if not d: continue
            derived = " (derived)" if dyn == "mf" and "mf" not in {dynmap[v] for v in dynmap} else ""
            cents_ = [centroid(e["h"]) for e in d.values()]
            span = (min(d), max(d)) if d else (0, 0)
            report.append(f"  {dyn}{derived}: {len(d)} notes MIDI {span[0]}..{span[1]}"
                          f" · centroid {np.mean(cents_):.2f}"
                          f" · noise {np.mean([e['noise'] for e in d.values()]):.3f}"
                          f" · atk {np.mean([e['atk'] for e in d.values()]):.3f}s"
                          f" · rms {np.mean([e['rms'] for e in d.values()]):.4f}")

    print("\n".join(report))

    # the sheet's sanity checks: ff brighter than pp; straight mute tilted up
    for member, m_out in out.items():
        if "pp" in m_out and "ff" in m_out:
            cp = np.mean([centroid(e["h"]) for e in m_out["pp"].values()])
            cf = np.mean([centroid(e["h"]) for e in m_out["ff"].values()])
            flag = "" if cf > cp else "   <-- FF NOT BRIGHTER, check"
            print(f"check {member}: centroid pp {cp:.2f} -> ff {cf:.2f}{flag}")

    if args.out:
        os.makedirs(os.path.dirname(args.out), exist_ok=True)
        js = ["/* derived by corpus/analyze_brass.py from VSCO-2 Community Edition",
              "   (github.com/sgossner/VSCO-2-CE, CC0-1.0, commit 4403009), recorded",
              "   by Sam Gossner & Simon Dalzell. Members: horn, trumpet, trombone,",
              "   tuba, and the RECORDED mutes hornMute / trumpetStraight /",
              "   trumpetHarmon. Format: per dynamic, per MEASURED concert MIDI pitch:",
              "   h: 24 harmonic amps (peak-normalised), rms, residual share, attack s.",
              "   The octave was never trusted: the filename fixed the pitch class and",
              "   autocorrelation chose the octave; >60-cent misfits were dropped.",
              "   Layers whose loudness order was measured map to pp/mf/ff; a member",
              "   with two recorded layers gets mf as the per-pitch mean, derived.",
              "   Same caveat as SAX_WT on `noise`: an upper bound on breathiness.",
              "   [measured] */",
              "const BRASS_WT = {"]
        for member in ("horn", "trumpet", "trombone", "tuba",
                       "hornMute", "trumpetStraight", "trumpetHarmon"):
            if member not in out: continue
            js.append(f" {member}: {{")
            for dyn in ("pp", "mf", "ff"):
                d = out[member].get(dyn, {})
                if not d: continue
                js.append(f"  {dyn}: {{")
                for p in sorted(d):
                    e = d[p]
                    js.append(f"    {p}: {{ h: {e['h']}, rms: {e['rms']}, "
                              f"noise: {e['noise']}, atk: {e['atk']} }},")
                js.append("  },")
            js.append(" },")
        js.append("};")
        with open(args.out, "w") as f:
            f.write("\n".join(js) + "\n")
        print(f"wrote {args.out} ({os.path.getsize(args.out)} bytes)")

if __name__ == "__main__":
    main()
