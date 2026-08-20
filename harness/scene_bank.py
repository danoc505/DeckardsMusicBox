#!/usr/bin/env python3
"""Build the SCENE bank -- the places a record is played in.

    python3 harness/scene_bank.py <dir-of-source-audio> <out.json>

    The owner, 2026-08-20: *"Bullfrogs, crickets, loons, owls these are the
    kinds of samples we want as atmosphere. Thunder, river also."*

WHAT THIS IS FOR, AND WHY IT IS A SECOND BANK
=============================================
The Erang pack's `sfx` shelf holds three environments -- wind, catacomb air and
a heavy drone. They are ROOM TONES: one texture, no events in them. Everything
the owner names here is the other kind of atmosphere, the kind with ANIMALS in
it, and a synthesiser cannot fake a loon. So it is recorded sound, and it is a
separate bank because it has a separate provenance and a separate licence
position, which should never be blurred into the pack's.

SOURCE AND LICENCE
------------------
BBC Sound Effects archive (sound-effects.bbcrewind.co.uk), the Natural History
Unit library and the general effects library. The BBC RemArc licence permits
PERSONAL, EDUCATIONAL AND RESEARCH use and excludes commercial use. This
program is personal and not distributed, so the use fits -- and that is stated
plainly as WEAKER than CC0 rather than waved through, which is the same
position `docs/LICENSING.md` already records for the (now deleted) rail bank
and for the Philharmonia recordings.

What ships is a measured, trimmed, 4-bit ADPCM excerpt at 22.05 kHz mono -- a
few seconds of a recording that runs for minutes. The archive IDs are in TAKE
below so any window can be re-derived, and the recordist and place travel with
each row for the same reason.

Cleaner sources were tried first, per the policy in docs/LICENSING.md
("prefer clean sources: US public domain, CC0 / CC-BY"): Wikimedia Commons
rate-limited this host to 429 on every request, xeno-canto's v3 API now
requires an account key, and archive.org's CC-licensed audio for these terms is
podcasts about frogs rather than recordings of them. The BBC archive is the
source the repo already has a documented position on, so it is the one used.

THE WINDOWS ARE MEASURED, NOT POINTED AT
----------------------------------------
Each recording is minutes long and the thing you want sits at an unknown
offset, so declaring a start second by hand would be a guess wearing a number.
The deleted `rail_bank.py` established the rule and it is restored here:

  * a STEADY sound wants the steadiest stretch, because it is going to loop:
    the window MINIMISES the coefficient of variation of short-frame RMS,
    ignoring any stretch that is mostly silence;
  * a DENSE sound wants as much of the thing itself as possible: the window
    MAXIMISES frame RMS, and a one-shot additionally keeps a second of
    pre-roll so the attack still has its approach.

AND THE RULE ALONE WAS NOT ENOUGH, MEASURED
-------------------------------------------
The first build of this bank ran `steady` over every bed, and on the bullfrog
that is exactly backwards. A chorus of CALLS is intermittent by definition, so
the steadiest twenty-four seconds of the tape is the stretch with the FEWEST
croaks in it. Measured on that window: 4.3% of its energy in the frog's own
band (20-250 Hz) and 41.4% between 3 and 8 kHz, against 60.9% at 20-250 Hz
across the whole recording. The picker had faithfully found the birds.

Two things fix it, and both are declared per take rather than guessed:

  1. `pick` says which kind of sound this is. A river and a field of crickets
     are steady; frogs, a loon, an owl and a thunderclap are dense. It is a
     fact about the animal, so it is written next to the animal.
  2. `band` says where the subject lives, and the scoring is done on the
     signal FILTERED TO THAT BAND. Without it "loudest" is a vote by whatever
     is loudest in the room -- on the tawny owl tape that is a wall of
     bush-crickets at 1-3 kHz, and the owl would never win it.

AND THE DC OFFSET IS REAL, MEASURED
-----------------------------------
`07042032`, the tawny owl, arrives with a DC offset of +0.0249 -- EIGHTY
PERCENT of its measured energy sits in the 0 Hz bin. Encoded as-is that offset
eats ADPCM range and predictor headroom for a signal nobody can hear. Every
file here is de-meaned and high-passed at 25 Hz: nothing in an atmosphere bed
lives below that, and the low end of this program belongs to the drone.
"""
import base64, json, os, sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import erang_bank as EB                     # halve, adpcm_encode

SR_OUT = 22050

# name, family, archive id, seconds kept, loop?, pick, band, what it is
#
# WHICH FAMILY A SOUND IS IN IS WHAT DECIDES WHERE IT CAN PLAY, so the split is
# by PLACE and not by animal: `scene` is the night outdoors, `sceneWater` is
# moving water, and a genre asks for the families its story can stand in. A
# cavern gets the water and not the bullfrogs; a journey overland gets both.
#
# `scene*` is also what `roleOfBed` matches to put these on the WORLD bus --
# the row built for exactly this on 2026-08-16 and left with nothing routing to
# it when boxcar synth was deleted. A river is a place, and a place is the
# thing a reverb is for.
TAKE = [
    # the bullfrog's jug-o-rum is the lowest voice in this bank: measured, 61%
    # of the whole recording sits between 20 and 250 Hz
    ("sceneFrogs",    "scene",      "NHU05079032", 24.0, True,  "dense",  (60, 400),
     "bullfrog chorus, close croaks -- Blackwater Refuge, Maryland, rec. Nigel Tucker"),
    # stridulation, and nothing else: 98% of this tape is above 3 kHz
    ("sceneCrickets", "scene",      "NHU05035029", 20.0, True,  "steady", (2500, 9000),
     "night, many crickets and insects -- Kakamega Forest, Kenya"),
    ("sceneNight",    "scene",      "NHU05068084", 20.0, True,  "steady", (800, 4000),
     "night, tree crickets calling, wind in trees -- Ashleim Pool, Israel"),
    # the wail is a glissando through the first two kilohertz
    ("sceneLoon",     "scene",      "NHU05027098", 30.0, True,  "dense",  (700, 2500),
     "great northern diver, song, others in the distance -- Thingvallavatn, Iceland"),
    # the hoot is an octave and a half UNDER the bush-crickets it is buried in,
    # which is the whole reason `band` exists
    ("sceneOwl",      "scene",      "07042032",    30.0, True,  "dense",  (300, 900),
     "tawny owl, hunting calls, over a chorus of dark bush-crickets"),
    ("sceneRiver",    "sceneWater", "NHU05072102", 20.0, True,  "steady", (200, 6000),
     "fast shallow stream over a rocky bed, mountain meltwater -- Rocky Mts NP, Colorado"),
    ("sceneStream",   "sceneWater", "NHU05061152", 16.0, True,  "steady", (200, 6000),
     "mid-distance fast-flowing river -- Chilkoot River, Alaska"),
    ("sceneThunder",  "scene",      "NHU05072099", 12.0, False, "dense",  (30, 300),
     "distant thunder over mountains -- Rocky Mts NP, Colorado"),
]


def dc_and_rumble(x, sr, hz=25.0):
    """De-mean, then high-pass at `hz` with a 127-tap windowed sinc.

    Subtracting the mean alone is not enough on a field recording: the offset
    drifts, so what is left after de-meaning is a slow wander rather than a
    constant. The filter is linear phase (symmetric FIR) so nothing in the
    audible band is smeared by fixing something below it."""
    x = x - float(x.mean())
    N = 127
    k = np.arange(N) - (N - 1) / 2.0
    fc = hz / sr
    lp = np.sinc(2 * fc * k) * np.hamming(N)
    lp /= lp.sum()
    hp = -lp
    hp[(N - 1) // 2] += 1.0                       # spectral inversion
    return np.convolve(x, hp, mode="same")


def bandpass(x, sr, lo, hi):
    """Windowed-sinc band-pass, used ONLY to score windows -- what is encoded is
    always the full-band audio. Scoring on a filtered copy is what lets the
    picker hear the owl through the crickets."""
    N = 255
    k = np.arange(N) - (N - 1) / 2.0
    def lp(fc):
        h = np.sinc(2 * (fc / sr) * k) * np.hamming(N)
        return h / h.sum()
    h = lp(min(hi, sr * 0.45)) - lp(lo)
    return np.convolve(x, h, mode="same")


def frames_rms(x, sr, flen=0.5):
    n = int(sr * flen)
    m = len(x) // n
    if m < 1:
        return np.array([float(np.sqrt((x ** 2).mean() + 1e-12))]), n
    f = x[:m * n].reshape(m, n)
    return np.sqrt((f * f).mean(axis=1) + 1e-12), n


def pick_window(x, sr, dur, mode, band, preroll):
    """Steady sounds take the evenest stretch, dense ones the fullest.

    The rule is restored from the deleted `harness/rail_bank.py`, where it was
    worked out. Steadiness is a COEFFICIENT of variation rather than a standard
    deviation so it does not simply pick the quietest part of the tape, and
    stretches under a quarter of the file's mean level are refused outright so
    it cannot pick the silence between two events and call it steady.

    SCORED ON THE BAND, encoded in full. `x` here is a copy filtered to where
    the subject lives; the caller slices the unfiltered audio at the offset
    this returns."""
    need = int(sr * dur)
    if len(x) <= need:
        return 0
    rms, n = frames_rms(x, sr)
    w = max(1, need // n)
    if len(rms) <= w:
        return 0
    floor = 0.25 * float(rms.mean())
    best, best_at = None, 0
    for i in range(0, len(rms) - w):
        seg = rms[i:i + w]
        if mode == "steady":
            if float(seg.mean()) < floor:
                continue
            score = float(seg.std() / (seg.mean() + 1e-9))
            better = best is None or score < best
        else:
            score = float(np.sqrt((seg ** 2).mean()))
            better = best is None or score > best
        if better:
            best, best_at = score, i
    at = best_at * n
    if preroll:
        at = max(0, at - int(sr * 1.0))           # keep the approach
    return min(at, len(x) - need)


def loop_points(x, sr):
    """A long loop in the back of the window, crossfaded at the seam.

    NOT the pitched-period trim the instrument bank uses: there is no period in
    a river to respect, and forcing one only shortens the loop for nothing.
    What matters here is that the loop is LONG -- an atmosphere that comes
    round every two seconds is a texture you start counting -- so it starts a
    fifth of the way in and runs to the end."""
    n = len(x)
    ls = int(n * 0.20)
    le = n - 1
    if le - ls < int(0.5 * sr):
        return x, -1, -1
    xf = min(int(0.060 * sr), ls, (le - ls) // 2)
    if xf > 8:
        w = np.linspace(0.0, 1.0, xf)
        head = x[ls - xf:ls]
        tail = x[le - xf:le]
        x = x.copy()
        x[le - xf:le] = tail * (1 - w) + head * w
    return x[:le + 1], ls, le


# ── AND THEY HAVE TO BE THE SAME LOUDNESS, OR THE AIR JUMPS ─────────────────
# Peak-normalising is right for an INSTRUMENT, where the peak is the note. It
# is wrong for a bed. Measured over this bank peak-normalised, the loop-region
# RMS ran from -13.4 dB (tree crickets, continuous) to -30.5 dB (bullfrogs,
# thirteen croaks in twenty-four seconds): SEVENTEEN DECIBELS. These are dealt
# one per movement, so a record would change air and change volume at the same
# moment, and the volume is what a listener would hear.
#
# The Erang pack's own three places span seven decibels, so that is the target
# to sit inside. Beds are matched to -16 dBFS RMS, which is where the river --
# the most ordinary "place" in the bank -- already sits.
#
# TWO GUARDS, both because a bare gain cannot do it:
#   * the boost is capped at +8 dB. A sparse chorus of calls is GENUINELY
#     quieter than a river and dragging it up eighteen decibels would be a
#     claim about the recording that is not true.
#   * whatever is left is soft-limited rather than clipped. `tanh` at the
#     ceiling rounds the few peaks that poke through instead of squaring them
#     off, which on a transient like a croak is the difference between a louder
#     croak and a broken one.
# The one-shot keeps PEAK normalisation, because on a thunderclap the peak IS
# the event and there is no steady state to match.
#
# AND THE MATCH IS MADE FROM A COMMON START. The first version measured the
# boost off the RAW recording, so a quietly-recorded tape spent its whole +8
# just getting back to where a loudly-recorded one began -- the cap bound on
# four of eight files and the spread came out WIDER, at 11.5 dB, than the
# problem it was fixing. Peak-normalise first, then match: the cap then means
# what it says, which is "how much this bed may be compressed".
BED_RMS = 10 ** (-16.0 / 20.0)
LIMIT_BUDGET = 6.0        # dB of soft limiting a bed may be asked to take
CEILING = 0.891           # -1 dBFS


def level_bed(x):
    """Return (samples, applied dB, limiter reduction dB)."""
    pk0 = float(np.max(np.abs(x))) or 1e-9
    x = x / pk0 * CEILING                          # common start
    r = float(np.sqrt((x ** 2).mean()) or 1e-9)
    g = min(BED_RMS / r, 10 ** (LIMIT_BUDGET / 20.0))
    y = x * g
    pk = float(np.max(np.abs(y))) or 1e-9
    red = 0.0
    if pk > CEILING:
        # soft knee: everything under the ceiling passes untouched, the rest is
        # rounded by tanh, so the limiter only exists where it is needed
        knee = CEILING * 0.7
        over = np.abs(y) > knee
        y[over] = np.sign(y[over]) * (knee + (CEILING - knee) *
                                      np.tanh((np.abs(y[over]) - knee) / (CEILING - knee)))
        red = 20 * np.log10(pk / float(np.max(np.abs(y))))
    return y, 20 * np.log10(g), red


def fades(x, sr, ms=40.0):
    n = int(sr * ms / 1000.0)
    if n * 2 >= len(x):
        return x
    x = x.copy()
    w = np.linspace(0.0, 1.0, n)
    x[:n] *= w
    x[-n:] *= w[::-1]
    return x


def main():
    src, dst = sys.argv[1], sys.argv[2]
    blob, rows, log = bytearray(), [], []
    for nm, fam, aid, dur, loop, mode, band, what in TAKE:
        path = None
        for ext in (".mp3", ".wav", ".flac", ".ogg"):
            p = os.path.join(src, aid + ext)
            if os.path.exists(p):
                path = p
                break
        if not path:
            raise SystemExit("missing source for " + nm + " (" + aid + ")")
        x, sr = sf.read(path, dtype="float64")
        if x.ndim > 1:
            x = x.mean(axis=1)
        dc0 = float(x.mean())
        x = dc_and_rumble(x, sr)
        if sr == 44100:
            x = EB.halve(x)
        elif sr == 48000:
            raise SystemExit(nm + ": 48 kHz source, no resampler for it here")
        elif sr != SR_OUT:
            raise SystemExit(nm + ": unexpected rate " + str(sr))
        at = pick_window(bandpass(x, SR_OUT, band[0], band[1]),
                         SR_OUT, dur, mode, band, preroll=not loop)
        x = x[at:at + int(dur * SR_OUT)]
        # the ORIGINAL peak travels in its own column, the way every other bank
        # in this file records it, whatever the normalisation below does
        pk = float(np.max(np.abs(x))) or 1.0
        if loop:
            x, applied, red = level_bed(x)
            x, ls, le = loop_points(x, SR_OUT)
        else:
            x = x / pk * CEILING
            applied, red = 20 * np.log10(CEILING / pk), 0.0
            x, ls, le = fades(x, SR_OUT), -1, -1
        rms = 20 * np.log10(float(np.sqrt((x[max(ls, 0):le if ls >= 0 else len(x)] ** 2).mean())) + 1e-12)
        rows.append("%s,%s,%d,%d,%.4f,%d,%d,%d" %
                    (nm, fam, len(blob), len(x), 0.0, ls, le, int(round(pk * 10000))))
        blob += EB.adpcm_encode(x)
        log.append("  %-14s %-11s %5.1fs  %-6s %5d-%-5d Hz  at %6.1fs  gain %+5.1f dB%s  rms %5.1f dB  %s" %
                   (nm, fam, len(x) / SR_OUT, mode, band[0], band[1], at / SR_OUT,
                    applied, ("  lim -%.1f" % red) if red > 0.05 else "         ",
                    rms, ("loop %d..%d" % (ls, le)) if ls >= 0 else "one-shot"))
        log.append("  %-14s %s [BBC %s]" % ("", what, aid))
    out = {"index": ";".join(rows), "b64": base64.b64encode(bytes(blob)).decode("ascii")}
    with open(dst, "w") as f:
        json.dump(out, f)
    print("\n".join(log))
    print("\n  %d scenes   %.2f MiB raw   %.2f MiB base64" %
          (len(rows), len(blob) / 1048576, len(out["b64"]) / 1048576))


if __name__ == "__main__":
    main()
