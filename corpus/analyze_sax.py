#!/usr/bin/env python3
"""THE SAX ANALYZER — real horns in, compact spectra out.

    python3 corpus/analyze_sax.py corpus/sax/iowa [--out corpus/sax/saxwt.js]

Reads the University of Iowa MIS alto saxophone octave-batch AIFFs
(AltoSax.NoVib.<dyn>.<reg>.aiff — chromatic runs separated by silence),
slices them into notes, VERIFIES each slice's pitch against the pitch its
position claims, and extracts per note:

    - the first 24 harmonic amplitudes over a stable sustain window
    - the note's RMS level (so pp/mf/ff keep their real loudness relation)
    - the noise residual share (the breath IN the tone — subtone lives here)
    - the 10->90% attack time

and emits one compact JS table per dynamic, per pitch, for the phrase
engine's morphing wavetables (docs/genre-research/sax-engine.md). The
downloaded audio never leaves corpus/ and is never committed [repo rule];
only this script and the derived table land anywhere.

Per the project's measurement rules: any slice whose measured f0 is more
than 60 cents from its claimed pitch is REPORTED AND DROPPED, not
silently kept — a mislabeled note poisons the whole register it lands in.
"""
import argparse, math, os, re, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "harness"))
from make_sample import read_wav

import numpy as np

NOTE = {"C":0,"Db":1,"D":2,"Eb":3,"E":4,"F":5,"Gb":6,"G":7,"Ab":8,"A":9,"Bb":10,"B":11}
def midi(name):
    m = re.match(r"([A-G]b?)(\d)", name)
    return NOTE[m.group(1)] + 12 * (int(m.group(2)) + 1)

def span(reg):
    """'Db3B3' -> [49..59] chromatic, inclusive"""
    m = re.match(r"([A-G]b?\d)([A-G]b?\d)", reg)
    return list(range(midi(m.group(1)), midi(m.group(2)) + 1))

def slice_notes(sig, sr, expect):
    """silence-gate slicing; returns list of (start, end) in samples.
    The gate is relative to the file's own loud parts, and a slice under
    0.4 s is line noise, not a note."""
    env = np.abs(sig)
    win = int(sr * 0.030)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    thr = np.max(env) * 0.02
    on = env > thr
    edges = np.flatnonzero(np.diff(on.astype(int)))
    if on[0]: edges = np.r_[0, edges]
    if on[-1]: edges = np.r_[edges, len(on) - 1]
    spans = [(edges[i], edges[i+1]) for i in range(0, len(edges) - 1, 2)]
    spans = [(a, b) for a, b in spans if (b - a) / sr > 0.4]
    return spans

def f0_of(seg, sr, guess_hz):
    """autocorrelation around the expected lag — we KNOW the pitch, we are
    verifying it, so the search is narrow on purpose"""
    lag0 = sr / guess_hz
    lo, hi = int(lag0 * 0.94), int(lag0 * 1.06)
    ac = [np.dot(seg[:-l], seg[l:]) / (len(seg) - l) for l in range(lo, hi + 1)]
    l = lo + int(np.argmax(ac))
    return sr / l

def analyze(seg, sr, f0, nh=24):
    """harmonic magnitudes by Goertzel-style projection over a Hann'd window"""
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

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--out", default=None)
    ap.add_argument("--nh", type=int, default=24)
    args = ap.parse_args()

    table = {}   # dyn -> midi -> dict
    report = []
    for fn in sorted(os.listdir(args.dir)):
        m = re.match(r"AltoSax\.NoVib\.(pp|mf|ff)\.(\w+)\.aiff?$", fn)
        if not m: continue
        dyn, reg = m.group(1), m.group(2)
        pitches = span(reg)
        sig, sr = read_wav(os.path.join(args.dir, fn))
        sig = np.array(sig)
        spans = slice_notes(sig, sr, len(pitches))
        status = "OK" if len(spans) == len(pitches) else "MISMATCH"
        report.append(f"{fn}: {len(spans)} slices for {len(pitches)} pitches [{status}]")
        for (a, b), p in zip(spans, pitches):
            note = sig[a:b]
            f_expect = 440.0 * 2 ** ((p - 69) / 12)
            # sustain window: past the attack, before the tail
            s0 = a + int(sr * 0.5); s1 = min(b - int(sr * 0.2), s0 + int(sr * 1.5))
            if s1 - s0 < sr * 0.4: s0, s1 = a + int((b - a) * 0.25), a + int((b - a) * 0.75)
            seg = sig[s0:s1]
            f0 = f0_of(seg, sr, f_expect)
            cents = 1200 * math.log2(f0 / f_expect)
            if abs(cents) > 60:
                report.append(f"  DROPPED midi {p} ({dyn}): f0 {f0:.1f} Hz is {cents:+.0f} cents off")
                continue
            amps, rms, noise = analyze(seg, sr, f0, args.nh)
            table.setdefault(dyn, {})[p] = {
                "h": [round(float(x), 4) for x in amps],
                "rms": round(rms, 5),
                "noise": round(noise, 4),
                "atk": round(attack_time(sig[a:b], sr), 3),
                "cents": round(cents, 1),
            }

    print("\n".join(report))
    for dyn in ("pp", "mf", "ff"):
        d = table.get(dyn, {})
        if not d: continue
        cent = []
        for p, e in d.items():
            h = np.array(e["h"]); f = np.arange(1, len(h) + 1)
            cent.append(float(np.sum(h * f) / np.sum(h)))
        print(f"{dyn}: {len(d)} notes · mean harmonic centroid {np.mean(cent):.2f} "
              f"(in harmonics) · mean noise share {np.mean([e['noise'] for e in d.values()]):.3f} "
              f"· mean attack {np.mean([e['atk'] for e in d.values()]):.3f} s "
              f"· mean rms {np.mean([e['rms'] for e in d.values()]):.4f}")

    if args.out:
        js = ["/* derived by corpus/analyze_sax.py from University of Iowa MIS",
              "   alto sax NoVib pp/mf/ff — 'freely available... without restrictions'.",
              "   [corpus:uiowa-mis] Format: per dynamic, per MIDI pitch:",
              "   h: 24 harmonic amps (peak-normalised), rms, residual share, attack s.",
              "   HONEST CAVEAT on `noise`: it is the share of the note's energy NOT",
              "   captured by the first 24 harmonics — on low notes that includes real",
              "   upper harmonics, not only breath. Treat it as an upper bound on",
              "   breathiness until the analyzer separates the two. [measured, impure] */",
              "const SAX_WT = {"]
        for dyn in ("pp", "mf", "ff"):
            js.append(f"  {dyn}: {{")
            for p in sorted(table.get(dyn, {})):
                e = table[dyn][p]
                js.append(f"    {p}: {{ h: {e['h']}, rms: {e['rms']}, "
                          f"noise: {e['noise']}, atk: {e['atk']} }},")
            js.append("  },")
        js.append("};")
        with open(args.out, "w") as f:
            f.write("\n".join(js) + "\n")
        print(f"wrote {args.out} ({os.path.getsize(args.out)} bytes)")

if __name__ == "__main__":
    main()
