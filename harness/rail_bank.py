#!/usr/bin/env python3
"""Encode the railroad — Boxcar Synth's scene payload, the fourth bank.

    python3 harness/rail_bank.py <dir-with-wavs> corpus/rail/rail_bank.js

Source: the BBC Sound Effects archive (sound-effects.bbcrewind.co.uk), the
"Age of Steam" collection and the natural history library. Licence: the
archive's RemArc/BBC content licence permits personal, educational and
research use; commercial use is excluded. This program is personal and not
distributed, so the use fits — stated honestly as WEAKER than CC0, the same
position the Philharmonia recordings carry. What ships is a measured,
trimmed ADPCM excerpt bank, not the archive. [docs/genre-research/
boxcar-synth.md §6; docs/LICENSING.md]

THE WINDOWS ARE MEASURED, NOT POINTED AT. Each recording is minutes long
and the event sits at an unknown offset, so declaring start seconds by hand
would be a guess wearing a number. Instead:
  - a BED wants the steadiest stretch (it will loop): the window is chosen
    to MINIMISE the variance of short-frame RMS across the file;
  - an EVENT wants the thing itself: the window is chosen to MAXIMISE
    frame RMS, with a fixed pre-roll so the attack is kept.
Loop seams get the gurdy bank's 60 ms crossfade; one-shots get honest
head/tail fades. Rows are ERANG_INDEX's shape (name,fam,off,n,root,ls,le,pk)
with root 0 — nothing here is pitched.
"""
import base64, os, struct, sys
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

# name, fam, archive id, seconds kept, loop?
# Families: rail* is the journey vocabulary, scene* the passing landscape.
# [docs/genre-research/boxcar-synth.md §6 — the chosen recordings, with the
#  archive's own descriptions]
TAKE = [
    ("railRun0",   "railRun",     "07041063",   10.0, True ),  # interior, constant run
    ("railRun1",   "railRun",     "00008117",   10.0, True ),  # interior, second colour
    ("railHiss",   "railSteam",   "07045052",   10.0, True ),  # letting off steam — the standing engine
    ("railTown",   "railStation", "07035168",   12.0, True ),  # station atmosphere, steam era
    ("railArrive", "railArrive",  "07045054",   14.0, False),  # brakes + doors — into town
    ("railBrake",  "railBrake",   "07041052",    8.0, False),  # the short brake screech
    ("railDepart", "railDepart",  "07045057",   16.0, False),  # departs, whistle at the start
    ("railWhistle","railWhistle", "07041116",    8.0, False),  # the whistle itself
    ("railClank",  "railClank",   "07006097",    6.0, False),  # coupling trucks
    ("railBell",   "railBell",    "07071133",   10.0, False),  # crossing bell + train
    ("railPass0",  "railPass",    "07045051",   14.0, False),  # passes without stopping
    ("railPass1",  "railPass",    "07006086",   12.0, False),  # fast goods train passing
    ("sceneRiver", "sceneRiver",  "07044100",   10.0, True ),  # small stream
    ("sceneDawn",  "sceneBirds",  "NHU05008110",12.0, True ),  # dawn chorus
    ("sceneRiverside","sceneBirds","NHU05073129",12.0, True ), # riverside, birds and insects
]

def frames_rms(x, sr, flen=0.5):
    n = int(sr * flen)
    m = len(x) // n
    if m < 1: return np.array([np.sqrt(np.mean(x**2) + 1e-12)]), n
    f = x[:m*n].reshape(m, n)
    return np.sqrt(np.mean(f*f, axis=1) + 1e-12), n

def pick_window(x, sr, dur, loop):
    """MEASURED: beds take the steadiest stretch, events the loudest."""
    need = int(sr * dur)
    if len(x) <= need: return 0
    rms, n = frames_rms(x, sr)
    w = max(1, need // n)
    if len(rms) <= w: return 0
    best, best_at = None, 0
    for i in range(0, len(rms) - w):
        seg = rms[i:i+w]
        if loop:
            score = np.std(seg) / (np.mean(seg) + 1e-9)   # steadiness, level-free
            if np.mean(seg) < 0.25 * np.mean(rms): continue  # not the silence
            better = best is None or score < best
        else:
            score = np.max(seg)
            better = best is None or score > best
        if better: best, best_at = score, i
    at = best_at * n
    if not loop:
        at = max(0, at - int(sr * 1.0))   # keep a second of approach before the event
    return at

def main():
    src, dst = sys.argv[1], sys.argv[2]
    blob, rows, report = bytearray(), [], []
    for name, fam, rid, dur, loop in TAKE:
        path = os.path.join(src, rid + ".wav")
        if not os.path.isfile(path):
            report.append(f"  MISSING {rid} ({name}) -- skipped, and that is a hole")
            continue
        x, sr = sf.read(path)
        if x.ndim > 1: x = x.mean(axis=1)
        x = np.asarray(x, dtype=float)
        if sr == 44100:
            if len(x) & 1: x = x[:-1]
            x = (x[0::2] + x[1::2]) * 0.5
            sr = SR
        elif sr != SR:
            step = sr / SR
            x = np.interp(np.arange(0, len(x) - 1, step), np.arange(len(x)), x)
            sr = SR
        at = pick_window(x, sr, dur, loop)
        seg = x[at:at + int(sr * dur)].copy()
        ls = le = -1
        if loop:
            # the gurdy bank's seam: blend the tail into the head's approach
            nfx = int(0.060 * SR)
            ls, le = nfx, len(seg) - 1
            tf = np.linspace(0.0, 1.0, nfx)
            seg[-nfx:] = seg[-nfx:] * (1 - tf) + seg[:nfx] * tf
            le = len(seg) - 1
        fade_in = int(SR * (0.01 if not loop else 0.02))
        seg[:fade_in] *= np.linspace(0, 1, fade_in)
        if not loop:
            fo = int(SR * 0.05)
            seg[-fo:] *= np.linspace(1, 0, fo)
        pk = float(np.max(np.abs(seg))) or 1.0
        enc = adpcm_encode(seg / pk)
        off = len(blob); blob.extend(enc)
        rows.append(f"{name},{fam},{off},{len(seg)},0,{ls},{le},{round(pk*10000)}")
        report.append(f"{name:14s} {fam:12s} {len(seg)/SR:5.1f}s  from {at/sr:6.1f}s of {rid}"
                      + ("  loop" if loop else "  one-shot") + f"  pk {pk:.3f}  {len(enc)//1024} KB")
    b64 = base64.b64encode(bytes(blob)).decode("ascii")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w") as f:
        f.write("/* THE RAILROAD -- Boxcar Synth's scene payload: measured excerpts\n"
                "   from the BBC Sound Effects archive (sound-effects.bbcrewind.co.uk,\n"
                "   RemArc licence: personal/educational use -- this program is personal\n"
                "   and not distributed; stated as weaker than CC0). Encoded by\n"
                "   harness/rail_bank.py: mono 22.05 kHz IMA ADPCM, windows MEASURED\n"
                "   (beds = steadiest stretch, events = loudest), 60 ms loop seams.\n"
                "   Row shape is ERANG_INDEX's with the peak x10000 column. */\n")
        f.write('const RAIL_INDEX = "' + ";".join(rows) + '";\n')
        f.write('const RAIL_B64 = "' + b64 + '";\n')
    print("\n".join(report))
    print(f"total: {len(blob)//1024} KB ADPCM, {len(b64)//1024} KB base64 -> {dst}")

if __name__ == "__main__":
    main()
