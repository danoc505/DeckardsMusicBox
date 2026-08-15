#!/usr/bin/env python3
"""Encode the hobo band — Boxcar Synth's instrument payload, the fifth bank.

    python3 harness/band_bank.py <dir> corpus/band/band_bank.js

  <dir>/banjo/  Philharmonia Orchestra banjo notes (philharmonia.co.uk via the
                skratchdot mirror) — free to use in your own work; the samples
                may not be resold as samples. Same licence position as the
                contrabassoon, stated. Two dynamics kept: forte at minor-third
                spacing C3..C6, piano at tritone spacing.
  <dir>/harmC/  VCSL (CC0): Hohner Special 20 diatonic in C — Normal + Vib
  <dir>/harmF/  VCSL (CC0): the F harp filling the zone gaps
  <dir>/anvil/  VCSL (CC0): anvil hits, 3 spots x 3 velocities
  <dir>/brake/  VCSL (CC0): brake drum hammer hits, two drums

ROOTS ARE MEASURED, the bank rule: the filename fixes the pitch class, the
audio decides the octave; >60-cent misfits are dropped and said so. The
harmonica keeps its real attack and LOOPS ITS MIDDLE: the loop window is the
steadiest stretch after the breath settles (measured, per note), seamed with
the gurdy bank's crossfade. Hits are RANKED BY MEASURED RMS, the taiko
lesson — audio outranks the velocity in the name. [docs/genre-research/
boxcar-synth.md §7]
"""
import base64, math, os, re, sys
import numpy as np
import soundfile as sf

SR = 22050

STEP = [7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,
  55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,
  408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,
  2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,
  8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,
  29794,32767]
IDX = [-1,-1,-1,-1,2,4,6,8,-1,-1,-1,-1,2,4,6,8]

def adpcm_encode(x):
    s = np.clip(np.round(x * 32767.0), -32768, 32767).astype(np.int32)
    pred, index, out, nib, hold = 0, 0, bytearray(), 0, 0
    for v in s:
        step = STEP[index]
        diff = int(v) - pred
        code = 0
        if diff < 0: code = 8; diff = -diff
        delta = step >> 3
        if diff >= step: code |= 4; diff -= step; delta += step
        if diff >= (step >> 1): code |= 2; diff -= step >> 1; delta += step >> 1
        if diff >= (step >> 2): code |= 1; delta += step >> 2
        pred = pred - delta if (code & 8) else pred + delta
        pred = max(-32768, min(32767, pred))
        index = max(0, min(88, index + IDX[code]))
        if nib == 0: hold = code; nib = 1
        else: out.append(hold | (code << 4)); nib = 0
    if nib: out.append(hold)
    return bytes(out)

CLASS = {"C":0,"CS":1,"D":2,"DS":3,"E":4,"F":5,"FS":6,"G":7,"GS":8,"A":9,"AS":10,"B":11}

def load(path):
    x, sr = sf.read(path)
    if x.ndim > 1: x = x.mean(axis=1)
    x = np.asarray(x, dtype=float)
    if sr == 44100:
        if len(x) & 1: x = x[:-1]
        x = (x[0::2] + x[1::2]) * 0.5
    elif sr == 48000:
        x = np.interp(np.arange(0, len(x) - 1, sr / SR), np.arange(len(x)), x)
    elif sr != SR:
        x = np.interp(np.arange(0, len(x) - 1, sr / SR), np.arange(len(x)), x)
    return x

def f0_near(x, guess_hz, a_frac=0.25, dur=1.0):
    a = int(a_frac * len(x)); b = min(len(x), a + int(SR * dur))
    w = x[a:b] - np.mean(x[a:b])
    if len(w) < 512 or guess_hz <= 0: return 0.0
    lag0 = SR / guess_hz
    lo, hi = int(lag0 * 0.90), int(lag0 * 1.10)
    if lo < 2 or hi >= len(w) // 2: return 0.0
    e = float(np.dot(w, w)) or 1e-12
    best_l, best = lo, -1
    for l in range(lo, hi + 1):
        r = float(np.dot(w[:-l], w[l:])) / e
        if r > best: best, best_l = r, l
    return SR / best_l

def named_hz(name):
    m = re.match(r"([A-G]s?)(\d)", name, re.I)
    k = m.group(1).upper().replace("S", "S")
    klass = CLASS[k if k in CLASS else k.replace("S","S")]
    midi = 12 * (int(m.group(2)) + 1) + klass
    return midi, 440.0 * 2 ** ((midi - 69) / 12.0)

def onset(x, thresh=0.02):
    pk = np.max(np.abs(x)) or 1.0
    idx = np.argmax(np.abs(x) > thresh * pk)
    return max(0, int(idx) - int(0.01 * SR))

def main():
    src, dst = sys.argv[1], sys.argv[2]
    blob, rows, report = bytearray(), [], []

    def put(name, fam, x, root_hz, ls, le):
        pk = float(np.max(np.abs(x))) or 1.0
        enc = adpcm_encode(x / pk)
        off = len(blob); blob.extend(enc)
        rows.append(f"{name},{fam},{off},{len(x)},{round(root_hz,2)},{ls},{le},{round(pk*10000)}")
        report.append(f"{name:8s} {fam:9s} {len(x)/SR:4.1f}s"
                      + (f"  loop {(le-ls)/SR:.2f}s" if ls >= 0 else "  one-shot")
                      + (f"  root {root_hz:.1f} Hz" if root_hz else "")
                      + f"  pk {pk:.3f}  {len(enc)//1024} KB")

    # ── the banjo: measured one-shot plucks ─────────────────────────────────
    for fn in sorted(os.listdir(os.path.join(src, "banjo"))):
        m = re.match(r"banjo_([A-G]s?\d)_very-long_(forte|piano)_normal\.mp3", fn)
        if not m: continue
        midi, guess = named_hz(m.group(1))
        x = load(os.path.join(src, "banjo", fn))
        at = onset(x)
        x = x[at:at + int(SR * 2.4)]
        # the octave gate: measure near the NAMED pitch; a Philharmonia name
        # has been wrong before (the cbsn analyzer's whole reason to exist)
        f0 = f0_near(x, guess, a_frac=0.05, dur=0.6)
        cents = 1200 * math.log2(f0 / guess) if f0 > 0 else 9999
        if abs(cents) > 60:
            f0b = f0_near(x, guess / 2, a_frac=0.05, dur=0.6)
            cb = 1200 * math.log2(f0b / (guess / 2)) if f0b > 0 else 9999
            if abs(cb) <= 60:
                midi -= 12; f0 = f0b
                report.append(f"  RE-HOMED {fn}: sounds an octave under its name")
            else:
                report.append(f"  DROPPED {fn}: {cents:+.0f} cents off, both octaves"); continue
        fo = int(SR * 0.06)
        x[-fo:] *= np.linspace(1, 0, fo)
        dyn = "f" if m.group(2) == "forte" else "p"
        put(f"bj{dyn}{midi}", "banjo" + ("F" if dyn == "f" else "P"), x, f0, -1, -1)

    # ── the harmonica: real attack, measured mid-loop ───────────────────────
    def harm(sub, prefix):
        for fn in sorted(os.listdir(os.path.join(src, sub))):
            m = re.search(r"_(Normal|Vib)_([A-G]s?\d)\.wav$", fn, re.I)
            if not m: continue
            midi, guess = named_hz(m.group(2))
            x = load(os.path.join(src, sub, fn))
            at = onset(x, 0.05)
            x = x[at:at + int(SR * 3.4)]
            f0 = f0_near(x, guess, a_frac=0.3, dur=0.8)
            cents = 1200 * math.log2(f0 / guess) if f0 > 0 else 9999
            if abs(cents) > 60:
                report.append(f"  DROPPED {fn}: {cents:+.0f} cents off its name"); continue
            # loop the steadiest post-breath stretch: 1.2 s window, sought
            # from 0.8 s in; seam crossfaded into the approach
            n = len(x); w = int(SR * 1.2); frm = int(SR * 0.15)
            best, bat = None, int(SR * 0.8)
            for i in range(int(SR * 0.8), n - w - frm, frm):
                seg = x[i:i+w]
                r = np.sqrt(np.mean(seg*seg) + 1e-12)
                s = np.std([np.sqrt(np.mean(seg[j:j+frm]**2) + 1e-12)
                            for j in range(0, w - frm, frm)]) / r
                if best is None or s < best: best, bat = s, i
            ls, le = bat, min(n - 1, bat + w)
            x = x[:le + 1].copy()
            nfx = min(int(0.05 * SR), ls)
            tf = np.linspace(0.0, 1.0, nfx)
            x[le-nfx:le] = x[le-nfx:le] * (1 - tf) + x[ls-nfx:ls] * tf
            fam = "harmVib" if m.group(1).lower() == "vib" else "harmNorm"
            put(f"{prefix}{'v' if fam=='harmVib' else 'n'}{midi}", fam, x, f0, ls, le)
    harm("harmC", "hc")
    harm("harmF", "hf")

    # ── the yard percussion: hits ranked by what they measure ───────────────
    def hits(sub, fam, keep):
        got = []
        for fn in sorted(os.listdir(os.path.join(src, sub))):
            if not fn.lower().endswith(".wav"): continue
            x = load(os.path.join(src, sub, fn))
            at = onset(x, 0.03)
            x = x[at:at + int(SR * keep)]
            fo = int(SR * 0.05); x[-fo:] *= np.linspace(1, 0, fo)
            got.append((float(np.sqrt(np.mean(x*x))), fn, x))
        got.sort(key=lambda t: t[0])          # quiet -> loud, the audio decides
        for i, (r, fn, x) in enumerate(got):
            put(f"{fam[2:4].lower()}{i}", fam, x, 0, -1, -1)
    hits("anvil", "bxAnvil", 1.6)
    hits("brake", "bxBrake", 1.8)

    b64 = base64.b64encode(bytes(blob)).decode("ascii")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w") as f:
        f.write("/* THE HOBO BAND -- Boxcar Synth's instrument payload: the\n"
                "   Philharmonia banjo (free-to-use, not resellable as samples --\n"
                "   the contrabassoon's licence position) and VCSL's (CC0) Hohner\n"
                "   harmonicas, anvil and brake drum. Encoded by\n"
                "   harness/band_bank.py: roots MEASURED (octave gate 60 cents),\n"
                "   harmonica loops the steadiest post-breath stretch, hits ranked\n"
                "   by measured RMS. Row shape is ERANG_INDEX's + peak column. */\n")
        f.write('const BAND_INDEX = "' + ";".join(rows) + '";\n')
        f.write('const BAND_B64 = "' + b64 + '";\n')
    print("\n".join(report))
    print(f"total: {len(blob)//1024} KB ADPCM, {len(b64)//1024} KB base64 -> {dst}")

if __name__ == "__main__":
    main()
