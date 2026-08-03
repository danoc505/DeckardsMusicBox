#!/usr/bin/env python3
"""Turn a WAV into something a single self-contained HTML file can carry.

    python3 harness/make_sample.py <in.wav> --name kick [--rate 22050]
                                  [--trim-db -60] [--max-sec 1.2]

This program is ONE file with no external requests, so every sample has to be
base64'd into it -- that is how the mda ePiano bank is carried. Raw 48 kHz
24-bit is far more than a drum needs and would cost four times what it should,
so this trims the silence, downsamples, converts to 16-bit mono and prints the
payload plus the numbers that justify it.

WHY 16-BIT AND ~22 kHz IS NOT A COMPROMISE HERE. A drum sample is played once
per hit at full level into a saturator and a room; the noise floor of 16-bit is
96 dB down and nothing in this program's signal chain is that quiet. 22.05 kHz
gives an 11 kHz ceiling, which is above the top partial of a kick or a snare
body -- for cymbals it is NOT enough and they should be converted at 32 kHz or
higher, which the --rate flag is for.

Nothing from the sample library is committed to this repo. This tool reads a
file wherever it lives and prints a payload; only the payload lands in the HTML.
"""
import argparse, base64, os, struct, sys, wave


def read_wav(path):
    """returns (frames as list of float, samplerate). Handles 8/16/24/32-bit,
    WAV or AIFF.

    AIFF matters because the best freely-licensed acoustic sources are shipped
    that way -- the University of Iowa MIS library, recorded note by note in an
    anechoic chamber and free without restrictions since 1997, is all .aif. A
    tool that only reads WAV would have made those unreachable for no reason
    beyond the container.

    AIFF is big-endian where WAV is little, so the frames are byte-swapped into
    the same shape before anything downstream sees them; every caller below is
    unchanged."""
    if os.path.splitext(path)[1].lower() in (".aif", ".aiff", ".aifc"):
        import aifc
        w = aifc.open(path, "rb")
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = bytearray(w.readframes(n))
        w.close()
        for i in range(0, len(raw) - sw + 1, sw):      # big-endian -> little
            raw[i:i + sw] = raw[i:i + sw][::-1]
        raw = bytes(raw)
        return _frames(raw, ch, sw), sr
    w = wave.open(path, "rb")
    ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
    raw = w.readframes(n)
    w.close()
    return _frames(raw, ch, sw), sr


def _frames(raw, ch, sw):
    out = []
    step = sw * ch
    for i in range(0, len(raw) - step + 1, step):
        acc = 0.0
        for c in range(ch):                       # mix channels to mono
            b = raw[i + c * sw: i + c * sw + sw]
            if sw == 1:
                v = (b[0] - 128) / 128.0
            elif sw == 2:
                v = struct.unpack("<h", b)[0] / 32768.0
            elif sw == 3:
                v = struct.unpack("<i", b + (b"\xff" if b[2] & 0x80 else b"\x00"))[0] / 8388608.0
            elif sw == 4:
                v = struct.unpack("<i", b)[0] / 2147483648.0
            else:
                raise SystemExit("unsupported sample width: %d bytes" % sw)
            acc += v
        out.append(acc / ch)
    return out


def trim(sig, sr, floor_db, max_sec):
    """drop leading silence and the inaudible tail, then cap the length"""
    thr = 10 ** (floor_db / 20.0)
    start = 0
    while start < len(sig) and abs(sig[start]) < thr:
        start += 1
    end = len(sig)
    while end > start and abs(sig[end - 1]) < thr:
        end -= 1
    sig = sig[start:end]
    cap = int(max_sec * sr)
    if len(sig) > cap:
        sig = sig[:cap]
        # a hard cut clicks; fade the last 5 ms
        fade = min(int(0.005 * sr), len(sig))
        for i in range(fade):
            sig[len(sig) - fade + i] *= 1.0 - i / float(fade)
    return sig


def resample(sig, sr_in, sr_out):
    """linear interpolation. Adequate downsampling a percussive one-shot; it is
    NOT a mastering-grade resampler and is not pretending to be."""
    if sr_in == sr_out:
        return sig
    ratio = sr_in / float(sr_out)
    n = int(len(sig) / ratio)
    out = []
    for i in range(n):
        x = i * ratio
        j = int(x)
        f = x - j
        a = sig[j] if j < len(sig) else 0.0
        b = sig[j + 1] if j + 1 < len(sig) else a
        out.append(a + (b - a) * f)
    return out


def detect_root(sig, sr):
    """The sample's own pitch, so playbackRate can transpose it.

    A pitched sampler is useless without this: playbackRate is a RATIO, and a
    ratio needs to know what it is a ratio to. Guessing C is how a sax ends up a
    tritone out and gets blamed on the composer.

    Autocorrelation over the sustain rather than the attack -- the first tens of
    milliseconds of a brass or reed sample are noise and formant transients and
    do not have the note in them yet. Searched over MIDI 33..84, which spans
    every instrument here; returns the MIDI note and a 0..1 confidence so a
    detection nobody should trust announces itself instead of shipping quietly.
    """
    n = len(sig)
    if n < sr // 8:
        return None, 0.0
    a = int(0.15 * n)                      # skip the attack
    b = min(n, a + int(0.35 * sr))         # ~350 ms of sustain
    w = sig[a:b]
    if len(w) < 512:
        return None, 0.0
    mean = sum(w) / len(w)
    w = [x - mean for x in w]
    energy = sum(x * x for x in w)
    if energy <= 1e-9:
        return None, 0.0
    best, best_r = None, 0.0
    for midi in range(33, 85):
        f = 440.0 * (2 ** ((midi - 69) / 12.0))
        lag = int(round(sr / f))
        if lag < 2 or lag >= len(w):
            continue
        num = 0.0
        for i in range(len(w) - lag):
            num += w[i] * w[i + lag]
        den = 0.0
        for i in range(len(w) - lag):
            den += w[i] * w[i]
        r = num / den if den > 1e-9 else 0.0
        if r > best_r:
            best_r, best = r, midi
    return best, max(0.0, min(1.0, best_r))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav")
    ap.add_argument("--name", required=True)
    ap.add_argument("--rate", type=int, default=22050)
    ap.add_argument("--trim-db", type=float, default=-60.0)
    ap.add_argument("--max-sec", type=float, default=1.2)
    ap.add_argument("--peak", type=float, default=0.97, help="normalise to this")
    ap.add_argument("--pitched", action="store_true", help="detect and report the root note")
    a = ap.parse_args()

    sig, sr = read_wav(a.wav)
    raw_sec = len(sig) / float(sr)
    sig = trim(sig, sr, a.trim_db, a.max_sec)
    sig = resample(sig, sr, a.rate)

    pk = max((abs(x) for x in sig), default=0.0)
    if pk > 0:
        g = a.peak / pk
        sig = [x * g for x in sig]

    pcm = bytearray()
    for x in sig:
        v = int(max(-1.0, min(1.0, x)) * 32767)
        pcm += struct.pack("<h", v)
    b64 = base64.b64encode(bytes(pcm)).decode("ascii")

    sys.stderr.write(
        "%s: %.2fs @%dHz in -> %.2fs @%dHz mono 16-bit out\n"
        "   %d samples, %d KB raw, %d KB base64 (normalised from peak %.3f)\n"
        % (a.name, raw_sec, sr, len(sig) / float(a.rate), a.rate,
           len(sig), len(pcm) // 1024, len(b64) // 1024, pk))
    # NORMALISE FOR BIT DEPTH, THEN HAND BACK THE ORIGINAL PEAK. Each sample is
    # lifted to full scale so 16 bits are actually used -- the ride's overhead
    # mic peaks at 0.045, and storing that as-is would throw away four and a half
    # bits and put quantisation noise on the one voice already complained about.
    # But normalising each drum INDEPENDENTLY also destroys the kit's balance: it
    # makes the hat as loud as the kick, which is not what anybody recorded. So
    # `pk` travels with the payload and the voice scales by it, and the mic
    # balance the drummer and the engineer set is preserved.
    if a.pitched:
        root, conf = detect_root(sig, a.rate)
        sys.stderr.write("   root: MIDI %s  confidence %.2f%s\n"
                         % (root, conf, "   <-- LOW, check by ear" if conf < 0.5 else ""))
        print('  %s: { rate: %d, pk: %.4f, root: %s, d: "%s" },'
              % (a.name, a.rate, pk, root if root else "null", b64))
    else:
        print('  %s: { rate: %d, pk: %.4f, d: "%s" },'
              % (a.name, a.rate, pk, b64))


if __name__ == "__main__":
    main()
