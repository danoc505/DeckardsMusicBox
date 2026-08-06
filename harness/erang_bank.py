#!/usr/bin/env python3
"""Build the Erang sample bank that ships inside the HTML.

    python3 harness/erang_bank.py <dir-of-wavs> <out.json>

WHY THIS EXISTS. The user landed the *Erang - Dungeon Synth Free Samples Pack*
on `main`: 65 WAVs, stereo, 16-bit, 44.1 kHz, 535 seconds, **94 MB**. The
program is ONE self-contained HTML file with no external requests, so a sample
has to live inside it as text. 94 MB does not, and neither does any lossless
reduction of it.

THE CHAIN, and every step is a measured trade rather than a default:

  stereo -> mono      these are single patches recorded wide, not a mix; the
                      program has its own stereo stage and places instruments
                      itself, so a baked-in width would fight it. Halves it.
  44100 -> 22050      2:1 exactly, so it is an FIR low-pass and then every
                      second sample -- no resampling arithmetic and no phase
                      games. MEASURED before choosing: the pack's spectral
                      centroids run 261-6437 Hz, so an 11 kHz ceiling clears
                      the brightest file in the set. Halves it again.
  trim + loop         a 12-second render of one held note is not an
                      instrument, it is a recording of one. The sustained
                      families keep an attack plus a crossfaded loop; the
                      struck families keep their whole decay. This is the
                      biggest single saving and it costs nothing musically.
  16-bit -> IMA ADPCM 4 bits a sample, 4:1, and the decoder is ~20 lines of
                      arithmetic the browser already has. Roughly 12-bit
                      quality with a little noise on transients, in a genre
                      whose own sources ask for "tape-like hiss" and "a worn,
                      archival feel" -- this is the one lossy step and it
                      lands on the right side of the aesthetic.

ROOT PITCH IS MEASURED, NOT ASSUMED. Every pitched file is named `_C`, and the
pack is not consistently tuned to one -- measured, they run from dead-on to 49
cents sharp. Tuning from the FILE NAME would play the whole genre up to a
quartertone sharp against its own bass and drums, which is not character, it is
out of tune with itself. So the root is read out of the audio by
autocorrelation and stored per sample, and the program tunes from it. The wow
and flutter that give this music its drift are applied by the program on top,
where they can be dialled.
"""
import base64, json, math, os, sys, wave
import numpy as np

SR_OUT = 22050

# ── families, and how each is treated ────────────────────────────────────────
# keep      seconds of audio retained
# pitched   whether a root frequency is measured and stored
# start     how far into the file to begin, as a fraction (atmosphere only)
#
# WHETHER A SAMPLE LOOPS IS NOT DECLARED HERE. It is MEASURED, per sample, by
# `sustains()` -- because the pack does not divide that way and a declaration
# would have been wrong in both directions. The `Key` family is genuinely
# MIXED: Key_01 holds, while Key_07 is a 1.5 s struck sound that is at 4% of
# its peak one eighth of the way in and Key_09 is half a second long. Declaring
# "Key loops" gives six of them a loop that wraps a decayed tail back to a loud
# attack -- a click on every held note. Declaring "Key does not" costs the four
# that really do sustain. Derive it, never list it.
FAMILY = {
    "strings":    dict(keep=3.6, pitched=True),
    "Key":        dict(keep=3.6, pitched=True),
    "Pad":        dict(keep=4.2, pitched=True),
    "Lead":       dict(keep=3.6, pitched=True),
    "Plucked":    dict(keep=4.0, pitched=True),
    "percussion": dict(keep=2.6, pitched=False),
    # `start` = how far into the file to begin, as a fraction. It exists for the
    # atmosphere beds: sfx_emptiness swells for 24.5 s of a 27.9 s file, so its
    # first 8 seconds contain no steady state to loop and the decay guard
    # correctly refused one. The BODY of a slow swell is in the middle of it.
    "sfx":        dict(keep=8.0, pitched=False, start=0.38),
    "Noise":      dict(keep=5.0, pitched=False, start=0.15),
}


def family_of(name):
    """`03 percussion_01_C.wav` -> `percussion`. Derived from the name the pack
    ships, never a hand-written list, so a file the pack adds is not silently
    dropped -- it raises instead."""
    stem = name.split(" ", 1)[1] if " " in name else name
    stem = stem.rsplit(".", 1)[0]
    for f in FAMILY:
        if stem.lower().startswith(f.lower()):
            return f
    raise SystemExit("no family for " + name + " -- add it to FAMILY, do not guess")


def read_mono(path):
    w = wave.open(path)
    n, ch, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
    raw = w.readframes(n)
    w.close()
    if sw != 2:
        raise SystemExit(path + ": expected 16-bit, got " + str(sw * 8))
    x = np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def halve(x):
    """44100 -> 22050. Low-pass at ~0.45 of the new rate, then decimate by 2.
    A 63-tap windowed sinc: long enough that the stop-band is genuinely down,
    short enough to cost nothing. Decimating WITHOUT this folds everything
    above 11 kHz back down as alias, which on a bright string patch is not
    subtle."""
    N, fc = 63, 0.225                      # fc in cycles/sample of the INPUT rate
    k = np.arange(N) - (N - 1) / 2.0
    h = np.sinc(2 * fc * k) * np.hamming(N)
    h /= h.sum()
    return np.convolve(x, h, mode="same")[::2]


def trim_head(x, sr):
    """Drop leading silence, but keep 5 ms of run-up so an attack still has
    its front. The pack's renders start clean; this is belt and braces."""
    thr = max(1e-4, 0.02 * np.abs(x).max())
    idx = np.nonzero(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(0.005 * sr)):]


def f0_of(x, sr, lo_hz=30.0, hi_hz=1100.0):
    """Root frequency by autocorrelation, with the octave guard this project
    already learned the hard way on the timpani: take the SHORTEST lag within
    90% of the best peak, not the strongest one. A strongest-peak reader locks
    onto 2/f0 whenever the second harmonic is loud, which on these patches it
    often is, and reports everything an octave low.

    THE SEARCH FLOOR IS 30 Hz AND IT MATTERS. At 25 Hz the reader found a
    sub-harmonic on Pad_03 and returned 26.4 for a patch whose real root is
    near 88 -- not an octave error, a nonsense one, and it would have played
    that pad more than an octave and a half flat. Every pitched file in this
    pack is named `_C` and the pack's real roots measure C1..C5, so the band
    below is the instrument's range and not a generic pitch-tracker's."""
    a = int(len(x) * 0.25)
    seg = x[a:a + min(int(sr * 1.5), len(x) - a)]
    if len(seg) < 2048:
        seg = x
    seg = seg - seg.mean()
    ac = np.correlate(seg, seg, "full")[len(seg) - 1:]
    if ac[0] <= 0:
        return 0.0
    ac = ac / ac[0]
    lo, hi = int(sr / hi_hz), min(int(sr / lo_hz), len(ac) - 1)
    win = ac[lo:hi]
    if len(win) == 0:
        return 0.0
    cand = np.nonzero(win >= 0.9 * win.max())[0]
    return sr / float(lo + cand[0])


def snap_to_C(f):
    """Every pitched file in this pack is named `_C`. That is a strong prior and
    it is used ONLY as a sanity check on the measurement, never as the tuning:
    if the reading lands within 100 cents of some C we keep the READING (the
    pack really is up to 49 cents sharp and the program should play it in tune);
    if it lands further away the reading is not trusted and the nearest C is
    used instead, and the file is reported so a human can look."""
    if f <= 0:
        return 0.0, "dead", 0.0
    c0 = 16.351597831287414
    k = round(12 * math.log2(f / c0) / 12.0)
    nearest = c0 * (2.0 ** k)
    cents = 1200 * math.log2(f / nearest)
    if abs(cents) <= 100:
        return f, "measured", cents
    return nearest, "SNAPPED", cents


def sustains(x, sr, keep):
    """Is this sample still sounding at the end of the window we keep?

    Measured as RMS in eighths across the kept window: a sample sustains if its
    LAST eighth is at least 45% of its loudest. Eighths rather than a short tap
    at the very end, because several of these patches undulate -- strings_01
    runs 0.72 0.59 0.53 0.94 1.00 0.73 0.66 0.61 across its window, which is
    tremolo on a held note, not a decay. An end-tap measurement landed in one
    of those troughs and refused a loop to four patches that plainly sustain.

    45% is the floor because the two populations are nowhere near it: the
    sustaining patches sit at 0.61-0.91 and the struck ones at 0.00-0.06.
    Nothing in this pack lands in between, so the threshold is not a tuning
    knob, it is a gap."""
    n = min(len(x), int(keep * sr))
    if n < int(0.4 * sr):
        return False
    e = np.array([math.sqrt(float((c ** 2).mean())) for c in np.array_split(x[:n], 8)])
    return e.max() > 0 and e[-1] / e.max() >= 0.45


def crossfade_loop(x, sr, keep, pitched):
    """Return (samples, loopStart, loopEnd).

    The loop sits in the back half of what we keep. On a PITCHED sample it is
    trimmed to a whole number of periods so the wrap does not beat against the
    note's own cycle; on atmosphere and noise there is no period to respect and
    forcing one only shortens the loop for nothing. The samples immediately
    BEFORE loopEnd are crossfaded with the samples immediately before
    loopStart, which is what makes the wrap inaudible: at the instant playback
    jumps from loopEnd back to loopStart, the two sides already agree.

    FLOOR, NOT ROUND, on the period count. Rounding UP pushed loopEnd past the
    last sample, the guard below caught it, and the sample silently became a
    one-shot -- which is how six pads and four noise beds came out of the first
    build with no loop at all while the table said they had one. A fallback
    that reports success is the failure this project keeps re-learning."""
    n = min(len(x), int(keep * sr))
    x = x[:n].copy()
    ls = int(n * 0.45)
    le = n - 1
    span = le - ls
    if pitched:
        f0 = f0_of(x, sr)
        period = sr / f0 if f0 > 20 else sr / 110.0
        per = int(span // period)                     # FLOOR: never overshoot the end
        if per >= 1:
            span = int(per * period)
    if span < int(0.05 * sr) or ls + span > n - 1:    # genuinely too short to loop
        return x, -1, -1
    le = ls + span
    xf = min(int(0.030 * sr), ls, span // 2)          # 30 ms crossfade
    if xf > 8:
        w = np.linspace(0.0, 1.0, xf)
        head = x[ls - xf:ls]                          # what comes before the jump target
        tail = x[le - xf:le]                          # what plays just before the wrap
        x[le - xf:le] = tail * (1 - w) + head * w
    return x[:le + 1], ls, le


# ── IMA ADPCM, the standard tables ───────────────────────────────────────────
STEP = [7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,
        80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,
        494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,
        2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,
        8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,
        27086,29794,32767]
IDX = [-1,-1,-1,-1,2,4,6,8,-1,-1,-1,-1,2,4,6,8]


def adpcm_encode(x):
    """4 bits a sample. Returns (bytes, first_predictor, first_index) -- the
    decoder needs the initial state, so it is stored rather than assumed zero;
    a wrong initial predictor is a click on every note."""
    s = np.clip(np.round(x * 32767.0), -32768, 32767).astype(np.int32)
    pred, index, out, nib, hold = 0, 0, bytearray(), 0, 0
    for v in s:
        step = STEP[index]
        diff = int(v) - pred
        code = 0
        if diff < 0:
            code = 8
            diff = -diff
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


def main():
    src, dst = sys.argv[1], sys.argv[2]
    bank, raw_total, enc_total, notes = {}, 0, 0, []
    for fn in sorted(os.listdir(src)):
        if not fn.lower().endswith(".wav"):
            continue
        fam = family_of(fn)
        cfg = FAMILY[fam]
        path = os.path.join(src, fn)
        raw_total += os.path.getsize(path)
        x, sr = read_mono(path)
        if sr != 44100:
            raise SystemExit(fn + ": expected 44100, got " + str(sr))
        x = halve(x)
        st = cfg.get("start", 0.0)
        if st > 0:
            x = x[int(st * len(x)):]
        x = trim_head(x, SR_OUT)
        peak = np.abs(x).max()
        if peak > 0:
            x = x * (0.97 / peak)                    # normalise; the mix decides level
        if sustains(x, SR_OUT, cfg["keep"]):
            x, ls, le = crossfade_loop(x, SR_OUT, cfg["keep"], cfg["pitched"])
        else:
            x, ls, le = x[:int(cfg["keep"] * SR_OUT)], -1, -1
            # a struck sound must end at zero or every hit ends in a click
            fade = min(int(0.020 * SR_OUT), len(x) // 4)
            if fade > 4:
                x[-fade:] *= np.linspace(1.0, 0.0, fade)
        root, how, cents = (0.0, "-", 0.0)
        if cfg["pitched"]:
            root, how, cents = snap_to_C(f0_of(x, SR_OUT, 30.0, 600.0))
            if how == "SNAPPED":
                notes.append("  %-26s reading was %+.0f cents off a C -- snapped" % (fn, cents))
        data = adpcm_encode(x)
        enc_total += len(data)
        key = fn.split(" ", 1)[1].rsplit(".", 1)[0] if " " in fn else fn
        bank[key] = dict(f=fam, n=len(x), r=round(root, 3), ls=ls, le=le,
                         d=base64.b64encode(data).decode("ascii"))
        if cfg["pitched"]:
            notes.append("  %-26s %5.2fs  root %7.2f Hz (%+.0f c)  %s" %
                         (key, len(x) / SR_OUT, root, cents,
                          "loop %d..%d" % (ls, le) if ls >= 0 else "one-shot"))
        else:
            notes.append("  %-26s %5.2fs  unpitched  %s" %
                         (key, len(x) / SR_OUT,
                          "loop %d..%d" % (ls, le) if ls >= 0 else "one-shot"))
    out = dict(sr=SR_OUT, codec="ima-adpcm-4bit-mono", samples=bank)
    with open(dst, "w") as fh:
        json.dump(out, fh, separators=(",", ":"))
    b64 = sum(len(v["d"]) for v in bank.values())
    print("\n".join(notes))
    print("\n%d samples" % len(bank))
    print("  source WAV      %8.2f MB" % (raw_total / 1e6))
    print("  ADPCM           %8.2f MB   (%.1fx smaller)" % (enc_total / 1e6, raw_total / enc_total))
    print("  as base64 text  %8.2f MB   <- what the HTML actually carries" % (b64 / 1e6))


if __name__ == "__main__":
    main()
