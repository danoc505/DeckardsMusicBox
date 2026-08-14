#!/usr/bin/env python3
"""Encode the SCC taiko drums for the single-file HTML.

    python3 harness/taiko_bank.py <floe-taiko-repo>/library/Samples corpus/taiko/taiko_bank.js

Source: SCC Taiko Drums v1.0 by S. Christian Collins (samples largely from
Subaqueous' Free Taiko Drum Rack, plus freesound), fetched from
github.com/floe-audio/Taiko-Drums. Licence: CC BY-SA 4.0 — attribution
carried in the HTML comment this emits; share-alike does not trigger for a
personal, non-distributed program. [docs/LICENSING.md]

THE LAYERS ARE PICKED BY MEASUREMENT, NOT BY FILENAME. The set's names carry
round-robin indices whose velocity meaning lives in an SFZ; rather than trust
two files of naming, each drum group's takes are ranked by measured RMS and
the softest/median/loudest become the voice's dynamic layers — the same
"believe the audio" rule every bank in this project follows.

Same chain as the Erang bank, for the same reasons (its header has the full
argument): mono, 22.05 kHz, per-drum length cap with a 5 ms fade, IMA ADPCM
4:1. A taiko's tail is mostly room; the cap keeps the body.
"""
import base64, os, sys
import numpy as np
import soundfile as sf

SR = 22050

# drum -> (filename prefix, take-count to keep, seconds cap)
# Groups and their measured centres (Hz) from the survey that chose them:
#   Hit 3 473 (the big drum) · Hit 1 680 · taiko1 811 (labelled p/m/f takes)
#   Drum 4 627 · Drum 5 1243 · Drum 6 1767 · Lt Sticks 3255 · Sticks 2544
DRUMS = {
    "tkBig":    ("Taiko Drum Hit 3", 3, 3.0),
    "tkLow":    ("Taiko Drum Hit 1", 2, 2.6),
    "tkMid":    ("taiko1",           3, 2.4),
    "tkTomLo":  ("Taiko Drum 4",     2, 1.8),
    "tkTomMid": ("Taiko Drum 5",     2, 1.8),
    "tkTomHi":  ("Taiko Drum 6",     2, 1.8),
    "tkKa":     ("Taiko Lt Sticks",  3, 0.8),
    "tkStick":  ("Taiko Drum Sticks", 3, 1.0),
}

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
        if diff < 0:
            code = 8; diff = -diff
        delta = step >> 3
        if diff >= step:
            code |= 4; diff -= step; delta += step
        if diff >= (step >> 1):
            code |= 2; diff -= step >> 1; delta += step >> 1
        if diff >= (step >> 2):
            code |= 1; delta += step >> 2
        pred = pred - delta if (code & 8) else pred + delta
        pred = max(-32768, min(32767, pred))
        index = max(0, min(88, index + IDX[code]))
        if nib == 0:
            hold = code; nib = 1
        else:
            out.append(hold | (code << 4)); nib = 0
    if nib:
        out.append(hold)
    return bytes(out)

def load(path, cap):
    x, sr = sf.read(path)
    if x.ndim > 1: x = x.mean(axis=1)
    # resample by linear interpolation to 22050 (drums; see make_sample.py)
    if sr != SR:
        n = int(len(x) * SR / sr)
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    # trim leading silence at -60 dB
    thr = 10 ** (-60 / 20)
    on = np.flatnonzero(np.abs(x) > thr)
    if len(on): x = x[on[0]:]
    cap_n = int(cap * SR)
    if len(x) > cap_n:
        x = x[:cap_n].copy()
        fade = int(0.005 * SR)
        x[-fade:] *= np.linspace(1, 0, fade)
    return x

def main():
    src, dst = sys.argv[1], sys.argv[2]
    files = sorted(os.listdir(src))
    blob = bytearray()
    rows, report = [], []
    for name, (prefix, keep, cap) in DRUMS.items():
        takes = [f for f in files if f.startswith(prefix) and f.endswith(".flac")
                 and not f.startswith(prefix + " ")
                 or (f.startswith(prefix + "-") or f.startswith(prefix + " ") or f == prefix + ".flac")]
        takes = sorted(set(f for f in files if f.endswith(".flac") and
                           (f == prefix + ".flac" or f.startswith(prefix + "-") or
                            (f.startswith(prefix) and f[len(prefix):len(prefix)+1] in ("-", ".")))))
        if not takes:
            report.append(f"{name}: NO FILES for prefix '{prefix}'"); continue
        ranked = []
        for f in takes:
            x = load(os.path.join(src, f), cap)
            ranked.append((float(np.sqrt(np.mean(x ** 2))), f, x))
        ranked.sort()
        if keep == 2:
            chosen = [ranked[0], ranked[-1]]
        elif keep >= 3 and len(ranked) >= 3:
            chosen = [ranked[0], ranked[len(ranked) // 2], ranked[-1]]
        else:
            chosen = ranked[:keep]
        for i, (rms, f, x) in enumerate(chosen):
            pk = float(np.max(np.abs(x))) or 1.0
            enc = adpcm_encode(x / pk)          # normalised for bit depth;
            off = len(blob)                     # pk restores the balance (root
            blob.extend(enc)                    # field carries it, see below)
            # ERANG_INDEX row shape plus one column: name,fam,off,n,root,ls,le,pk
            # root stays 0 (a drum does not transpose with the key) and the
            # recorded peak rides in its OWN eighth column ×10000 — hiding it in
            # root would make every generic consumer of the bank treat a drum
            # as pitched, which is a landmine, not a saving
            rows.append(f"{name}{i},taiko,{off},{len(x)},0,-1,-1,{round(pk * 10000)}")
            report.append(f"{name}{i}: {f}  {len(x)/SR:.2f}s  rms {rms:.3f}  pk {pk:.3f}  {len(enc)//1024} KB")
    b64 = base64.b64encode(bytes(blob)).decode("ascii")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w") as f:
        f.write("/* SCC Taiko Drums v1.0 by S. Christian Collins, CC BY-SA 4.0 —\n"
                "   samples largely by Subaqueous, via github.com/floe-audio/Taiko-Drums.\n"
                "   Encoded by harness/taiko_bank.py: mono 22.05 kHz IMA ADPCM, layers\n"
                "   ranked by measured RMS (softest/median/loudest per drum). The rows\n"
                "   are ERANG_INDEX's shape plus an eighth column: recorded peak x10000. */\n")
        f.write('const TAIKO_INDEX = "' + ";".join(rows) + '";\n')
        f.write('const TAIKO_B64 = "' + b64 + '";\n')
    print("\n".join(report))
    print(f"total: {len(blob)//1024} KB ADPCM, {len(b64)//1024} KB base64 -> {dst}")

if __name__ == "__main__":
    main()
