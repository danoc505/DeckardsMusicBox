#!/usr/bin/env python3
"""Encode the MidiGurdy's French hurdy-gurdy for the single-file HTML.

    python3 harness/gurdy_bank.py <dir-with-sf2s> corpus/gurdy/gurdy_bank.js

Source: the MidiGurdy project's factory soundfonts
(github.com/midigurdy/mg-initialdata) — a real hurdy-gurdy recorded string by
string. Licence: CC BY-SA 4.0 (the repo's data/sounds/LICENSE); attribution
carried in the emitted comment; share-alike does not trigger for a personal,
non-distributed program. [docs/LICENSING.md]

WHAT IS TAKEN. From french.sf2: the full chromatic melody string (21
semitones, D4..Bb5, each with the soundfont's own loop points), the low and
high drone strings, and the chien's buzz snap. From keynoises.sf2: four of
the key clicks — the mechanical grain a hurdy-gurdy's keybox actually has.
The chien's sustained growl (schnarre_ton) is NOT taken: its usable loop
sits 8 s into a 10.8 s recording and would cost more than the four families
together; recorded here so the omission is a decision, not an oversight.

ROOT PITCH IS MEASURED, NOT ASSUMED — the erang bank's own rule. The
soundfont declares pitch+correction per sample and the corrections run to
-32 cents; autocorrelation reads the audio and the measured Hz is what the
sampler tunes from. Loops survive the 2:1 downsample by even alignment
(a one-sample nudge at 22.05 kHz, inaudible); wind-ups longer than the cap
are head-trimmed with an 8 ms fade so the bow start stays a start.
"""
import base64, math, os, struct, sys
import numpy as np

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

def parse_sf2(path):
    data = open(path, "rb").read()
    def chunks(buf, off, end):
        out = []
        while off < end - 8:
            cid = buf[off:off+4]; size = struct.unpack("<I", buf[off+4:off+8])[0]
            out.append((cid, off+8, size)); off = off + 8 + size + (size & 1)
        return out
    shdr, smpl = [], None
    for cid, body, size in chunks(data, 12, len(data)):
        if cid != b"LIST": continue
        kind = data[body:body+4]
        for c2, b2, s2 in chunks(data, body+4, body+size):
            if kind == b"sdta" and c2 == b"smpl": smpl = (b2, s2)
            if kind == b"pdta" and c2 == b"shdr":
                for i in range(s2 // 46):
                    r = data[b2+i*46 : b2+(i+1)*46]
                    name = r[:20].split(b"\0")[0].decode("latin1")
                    start, end, ls, le, sr = struct.unpack("<IIIII", r[20:40])
                    pitch, corr = struct.unpack("<Bb", r[40:42])
                    if name not in ("EOS",): shdr.append(dict(
                        name=name, start=start, end=end, ls=ls, le=le,
                        sr=sr, pitch=pitch, corr=corr))
    def pcm(s):
        off, _ = smpl
        raw = data[off + s["start"]*2 : off + s["end"]*2]
        return np.frombuffer(raw, dtype="<i2").astype(float) / 32768.0
    return shdr, pcm

def f0_measure(x, sr, guess_hz):
    a = int(0.3 * len(x)); b = min(len(x), a + int(sr * 1.0))
    w = x[a:b] - np.mean(x[a:b])
    if len(w) < 512 or guess_hz <= 0: return 0.0
    lag0 = sr / guess_hz
    lo, hi = int(lag0 * 0.92), int(lag0 * 1.08)
    if lo < 2 or hi >= len(w) // 2: return 0.0
    e = float(np.dot(w, w)) or 1e-12
    best_l, best = lo, -1
    for l in range(lo, hi + 1):
        r = float(np.dot(w[:-l], w[l:])) / e
        if r > best: best, best_l = r, l
    return sr / best_l

def main():
    src, dst = sys.argv[1], sys.argv[2]
    fr_shdr, fr_pcm = parse_sf2(os.path.join(src, "french.sf2"))
    kn_shdr, kn_pcm = parse_sf2(os.path.join(src, "keynoises.sf2"))
    blob, rows, report = bytearray(), [], []

    def put(name, fam, x, sr, ls, le, root_hz, head_cap):
        # 2:1 downsample by mean of pairs (an FIR-ish low-pass then decimate)
        if sr == 44100:
            if len(x) & 1: x = x[:-1]
            x = (x[0::2] + x[1::2]) * 0.5
            ls //= 2; le //= 2
        looped = le > ls > 0
        if looped:
            keep_end = min(len(x), le + 1)
        else:
            keep_end = len(x)
        cut = 0
        if looped and ls > int(head_cap * SR):
            cut = ls - int(head_cap * SR)
            x = x[cut:]; ls -= cut; le -= cut; keep_end -= cut
            fade = int(0.008 * SR)
            x[:fade] *= np.linspace(0, 1, fade)
        x = x[:keep_end]
        pk = float(np.max(np.abs(x))) or 1.0
        enc = adpcm_encode(x / pk)
        off = len(blob); blob.extend(enc)
        rows.append(f"{name},{fam},{off},{len(x)},{round(root_hz, 2)},"
                    f"{ls if looped else -1},{min(le, len(x)-1) if looped else -1},{round(pk*10000)}")
        report.append(f"{name:12s} {fam:10s} {len(x)/SR:5.2f}s"
                      + (f"  loop {(le-ls)/SR:.2f}s" if looped else "  one-shot")
                      + (f"  root {root_hz:.1f} Hz" if root_hz else "")
                      + f"  pk {pk:.3f}  {len(enc)//1024} KB"
                      + (f"  (head -{cut/SR:.2f}s)" if cut else ""))

    for s in fr_shdr:
        x = fr_pcm(s)
        ls, le = s["ls"] - s["start"], s["le"] - s["start"]
        declared = 440.0 * 2 ** ((s["pitch"] - 69) / 12.0) * 2 ** (s["corr"] / 1200.0)
        nm = s["name"]
        if nm.startswith("mel_"):
            root = f0_measure(x, s["sr"], declared)
            cents = 1200 * math.log2(root / declared) if root else 0
            if abs(cents) > 60:
                report.append(f"  DROPPED {nm}: measured {root:.1f} Hz is {cents:+.0f} c off declared")
                continue
            put("gm" + nm[4:6], "gurdyMel", x, s["sr"], ls, le, root, 0.6)
        elif nm in ("low_drone", "high_drone"):
            root = f0_measure(x, s["sr"], declared)
            put("gd" + ("Lo" if nm == "low_drone" else "Hi"), "gurdyDrone",
                x, s["sr"], ls, le, root, 1.0)
        elif nm == "schnarre_buzz":
            put("gChien", "gurdyChien", x, s["sr"], ls, le, 0, 0.6)
        else:
            report.append(f"  skipped {nm} (see header)")
    picked = [k for k in kn_shdr if "-on-" in k["name"]][:2] + \
             [k for k in kn_shdr if "-off-" in k["name"]][:2]
    if len(picked) < 4:
        picked = kn_shdr[:4]
    for i, s in enumerate(picked):
        x = kn_pcm(s)
        put(f"gKey{i}", "gurdyKey", x, s["sr"], -1, -1, 0, 0.6)

    b64 = base64.b64encode(bytes(blob)).decode("ascii")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w") as f:
        f.write("/* A REAL HURDY-GURDY: the MidiGurdy project's French gurdy soundfont\n"
                "   (github.com/midigurdy/mg-initialdata, data/sounds/french.sf2 and\n"
                "   keynoises.sf2), CC BY-SA 4.0 per the repo's sound LICENSE file.\n"
                "   Encoded by harness/gurdy_bank.py: mono 22.05 kHz IMA ADPCM, the\n"
                "   soundfont's own loop points preserved, roots MEASURED from the\n"
                "   audio. Row shape is ERANG_INDEX's plus the peak x10000 column. */\n")
        f.write('const GURDY_INDEX = "' + ";".join(rows) + '";\n')
        f.write('const GURDY_B64 = "' + b64 + '";\n')
    print("\n".join(report))
    print(f"total: {len(blob)//1024} KB ADPCM, {len(b64)//1024} KB base64 -> {dst}")

if __name__ == "__main__":
    main()
