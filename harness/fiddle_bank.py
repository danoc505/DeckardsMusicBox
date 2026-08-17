#!/usr/bin/env python3
"""Encode the fiddle and the washboard — Boxcar Synth's sixth bank.

    python3 harness/fiddle_bank.py <dir> corpus/fiddle/fiddle_bank.js

  <dir>/fiddle/     Philharmonia Orchestra violin, `arco-normal` only, the
                    plain bowed note. Free to use in your own work; the samples
                    may not be resold as samples — the same licence position
                    already recorded for the contrabassoon, the brass and the
                    banjo. [philharmonia.co.uk/resources/sound-samples]
  <dir>/washboard/  Philharmonia percussion: three recorded washboard SCRAPES
                    (0.25 s, 0.5 s, and a phrase), same licence.

WHY A VIOLIN RECORDING AND NOT A MODEL. Everything else this genre needed was
either sampled or cheap to model honestly — a plucked string, a blown jug. A
BOW IS NEITHER. The tone is a stick-slip oscillation whose spectrum depends on
bow speed, pressure and where on the string it sits, and a synthesised one
announces itself instantly. So the fiddle is recorded, and it is the same
orchestra the contrabassoon came from.

A FIDDLE IS A VIOLIN PLAYED DIFFERENTLY — that is the whole of the difference,
and it is a PLAYING difference, not an instrument one. So the samples are a
violin's and the fiddle lives in how stage 5 writes for it.

ROOTS ARE MEASURED, the bank rule since the erang: the filename fixes the pitch
class, autocorrelation on the audio decides, and anything more than 60 cents
from its name is dropped and said so. Notes are head-trimmed to the bow's own
start and loop their steadiest middle so a long note does not run out.
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


def load(path):
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:                       # linear resample; these are 44.1k
        n = int(round(len(x) * SR / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    return x.astype(np.float64)


def measure_hz(x, lo=140.0, hi=1400.0):
    """autocorrelation on the steady middle — the bank's own rule"""
    seg = x[int(len(x) * 0.30):int(len(x) * 0.70)]
    if len(seg) < 2048:
        seg = x
    seg = seg - seg.mean()
    if not np.any(seg):
        return 0.0
    ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
    lo_l, hi_l = int(SR / hi), int(SR / lo)
    if hi_l >= len(ac):
        return 0.0
    k = int(np.argmax(ac[lo_l:hi_l])) + lo_l
    return SR / k if k else 0.0


def trim_head(x, thr=0.02):
    """a bow start is a start: cut the silence, keep the attack"""
    a = np.abs(x)
    pk = a.max() or 1.0
    on = np.argmax(a > thr * pk)
    on = max(0, int(on) - int(0.004 * SR))
    return x[on:]


def adpcm(x):
    pred, index, out, nib, half = 0, 0, bytearray(), 0, False
    q = np.clip(np.round(x * 32767), -32768, 32767).astype(np.int32)
    for s in q:
        step = STEP[index]
        diff = int(s) - pred
        code = 8 if diff < 0 else 0
        if code: diff = -diff
        d = step >> 3
        if diff >= step: code |= 4; diff -= step; d += step
        if diff >= step >> 1: code |= 2; diff -= step >> 1; d += step >> 1
        if diff >= step >> 2: code |= 1; d += step >> 2
        pred += -d if (code & 8) else d
        pred = max(-32768, min(32767, pred))
        index = max(0, min(88, index + IDX[code]))
        if half: out.append(nib | (code << 4)); half = False
        else: nib = code; half = True
    if half: out.append(nib)
    return bytes(out)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    rows, blob = [], bytearray()
    dropped = []

    # ── the fiddle ──────────────────────────────────────────────────────────
    fd = os.path.join(src, "fiddle")
    got = []
    for fn in sorted(os.listdir(fd)):
        m = re.match(r"vln_(\d+)_(forte|mezzo-forte|piano)\.mp3$", fn)
        if not m: continue
        midi, dyn = int(m.group(1)), m.group(2)
        x = trim_head(load(os.path.join(fd, fn)))
        if len(x) < int(0.20 * SR): continue
        want = 440.0 * 2 ** ((midi - 69) / 12.0)
        hz = measure_hz(x, want * 0.6, want * 1.7)
        cents = 1200 * math.log2(hz / want) if hz > 0 else 9999
        if abs(cents) > 60:
            dropped.append((fn, round(cents)))
            continue
        cap = int(1.25 * SR)
        if len(x) > cap:
            x = x[:cap]
            x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
        pk = float(np.abs(x).max()) or 1.0
        x = x / pk
        # the loop: the steadiest stretch of the middle, half a period aligned
        a, b = int(len(x) * 0.45), int(len(x) * 0.92)
        got.append((midi, dyn, hz, pk, a, b, adpcm(x)))
    got.sort()
    for midi, dyn, hz, pk, a, b, enc in got:
        # OFF IS IN BYTES, n IS IN SAMPLES -- and getting that backwards is the
        # bug this file shipped once. The reader indexes the blob as
        # `bin.charCodeAt(s.off + (i >> 1))`: `off` addresses BYTES and `i`
        # counts SAMPLES, two of which live in each byte. Writing `off * 2`
        # here doubled every address, so 37 of 75 rows pointed past the end of
        # the blob and decoded to silence while the rest decoded the wrong
        # note. Every other encoder in this directory writes `len(blob)`
        # unmultiplied; this one now does too.
        off = len(blob); blob += enc
        rows.append("fid%d%s,fiddle,%d,%d,%.3f,%d,%d,%d"
                    % (midi, "F" if dyn == "forte" else ("M" if dyn == "mezzo-forte" else "P"),
                       off, len(enc) * 2, hz, a, b, int(pk * 10000)))

    # ── the washboard ───────────────────────────────────────────────────────
    wd = os.path.join(src, "washboard")
    hits = []
    for fn in sorted(os.listdir(wd)):
        if not fn.lower().endswith(".mp3"): continue
        x = trim_head(load(os.path.join(wd, fn)), 0.05)
        cap = int(2.2 * SR)
        if len(x) > cap:
            x = x[:cap]; x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
        pk = float(np.abs(x).max()) or 1.0
        rms = float(np.sqrt((x ** 2).mean()))
        hits.append((rms, fn, x / pk, pk))
    hits.sort()                                   # RANKED BY MEASURED RMS
    for i, (rms, fn, x, pk) in enumerate(hits):
        enc = adpcm(x); off = len(blob); blob += enc
        # bytes, not samples -- see the note above the fiddle rows
        rows.append("wb%d,washboard,%d,%d,0,-1,-1,%d" % (i, off, len(enc) * 2, int(pk * 10000)))

    b64 = base64.b64encode(bytes(blob)).decode()
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w") as f:
        f.write("/* Philharmonia Orchestra: violin (arco-normal) and washboard.\n"
                "   Free to use in your own work; not to be resold as samples.\n"
                "   Encoded by harness/fiddle_bank.py — mono 22.05 kHz IMA ADPCM. */\n")
        f.write('const FIDDLE_INDEX = "%s";\n' % ";".join(rows))
        f.write('const FIDDLE_B64 = "%s";\n' % b64)
    print("rows %d  payload %.0f KB  b64 %.0f KB" % (len(rows), len(blob) / 1024, len(b64) / 1024))
    print("fiddle notes %d, washboard %d" % (len(got), len(hits)))
    if dropped:
        print("DROPPED (root more than 60 cents from its name):")
        for fn, c in dropped: print("   ", fn, c, "cents")


if __name__ == "__main__":
    main()
