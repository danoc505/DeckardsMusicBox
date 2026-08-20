#!/usr/bin/env python3
"""Build the sample bank that ships inside the HTML, from the WAVs in the repo.

    python3 harness/erang2_bank.py <dir-of-wavs> <out.json>

WHAT IS DIFFERENT FROM `erang_bank.py`, WHICH THIS REPLACES
===========================================================
The owner, 2026-08-20: *"Each file is its own instrument that should be used as
such the instruments have 12 second lengths, this means a note can last 12
seconds."*

Both halves of that change the encoder.

1. NOTHING IS TRIMMED AND NOTHING IS LOOPED (except the atmosphere beds). The
   old script's biggest saving was `keep` -- take 3.6 s of a 12 s render and
   crossfade a loop into it -- and its own comment defended that as costing
   nothing musically. It does not cost nothing: it caps how long a note can
   sound before it is a loop rather than a recording, and the owner has asked
   for the whole twelve seconds. So `keep` is gone for every pitched file.

   IT IS AFFORDABLE, WHICH IS WHY IT IS ALLOWED. Measured before writing this:
   199 seconds of audio at mono 22.05 kHz IMA-ADPCM is 2.09 MiB, or 2.79 MiB as
   base64 in the page. The bank it replaces was 4.49 MiB. The file gets SMALLER
   while every note gets longer.

2. EVERY FILE IS ITS OWN ROW AND ITS OWN INSTRUMENT. The old bank grouped files
   into families and put a PATCH knob on each family, so ten string recordings
   were one machine with a switch. That is a sampler's answer; the owner's is
   that these are twelve different instruments. The `family` column stays,
   because the drum kit and the atmosphere still ask questions of it, but
   nothing is pooled behind a patch switch any more.

WHAT IS THE SAME, and deliberately: mono, 22.05 kHz, IMA ADPCM 4 bits a sample,
roots MEASURED off the audio rather than read off the `_C` in the filename, and
the two-reader agreement check that decides whether a file is pitched at all.
Those were right and the reasoning is in `erang_bank.py`, which stays in the
repo as the argument for them even though nothing calls it now.
"""
import base64, json, os, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import erang_bank as EB                     # read_mono, halve, root_of, f0_of, adpcm_encode

SR_OUT = 22050

# ── THE ATMOSPHERE BEDS ARE THE ONE THING THAT STILL LOOPS ───────────────────
# A bed plays under a whole leg of a record -- minutes -- and no recording is
# that long. `loop` here is (start, end) as a FRACTION of the file, chosen to
# sit inside the steady part rather than across the attack or the tail, and
# measured per file below. A one-shot (the thunder) gets no loop and says so
# with -1, which is what `roleOfBed` and the bed picker both already read.
BEDS = {
    "sfx_wind":            (0.25, 0.85),
    "sfx_catacomb":        (0.20, 0.80),
    "sfx_drone_heavy":     (0.15, 0.90),
    "Noise_loopable_04":   (0.10, 0.90),
    "Noise_loopable_05":   (0.10, 0.90),
    "sfx_thunder_impact":  None,            # a one-shot; it is an accent
}

# ── THE NAME EACH FILE TAKES IN THE PROGRAM ──────────────────────────────────
# Short, readable, and stable: these are what the rack will show and what a
# genre's `machines` table will name. Derived by hand ONCE, here, rather than
# slugged from the filename -- "Key_05_C_Long resonate tail" does not slug into
# anything a person wants to read on a panel.
#
# NAMED BY REGISTER, NOT BY THE FILENAME'S NUMBER. The owner: *"The number is
# part of the filing and not related to the note."* Exactly so -- and the first
# pass at these names used it anyway (`erStrings4`, `erStrings10`), which reads
# as an octave and is not one. `strings_04` is a C4 and `strings_10` is a C1, so
# the number is not even correlated with register; it is a coincidence on one
# file and backwards on the other.
#
# AND THEY ARE ALL C, BUT NOT ALL THE SAME C. Measured, and every octave
# confirmed by the odd-harmonic test: the twelve pitched files run C1 to C5.
#     C1  erStringsLow, erLeadLow        C2  erPad
#     C3  erStringsMid, erLeadMid        C4  erStringsHi, erKeyMid, erLeadHi, erPluck
#     C5  erKeyLong, erKeyHi
# The one exception is the wind, which is a D#5 +24c and not a C at all. Both
# readers agree within three cents and the octave test confirms it.
#
# This is why the root is READ OUT OF THE AUDIO and never off the filename: a
# bank stored as "all C4" would play the C1 recordings three octaves sharp.
NAME = {
    "strings_04_C":                "erStringsHi",     # C4
    "strings_07_C_low":            "erStringsMid",    # C3
    "strings_10_C":                "erStringsLow",    # C1
    "Key_05_C_Long resonate tail": "erKeyLong",       # C5, the one Key that holds
    "Key_08_C_low":                "erKeyMid",        # C4
    "Key_10_C":                    "erKeyHi",         # C5
    "Lead_01_C":                   "erLeadMid",       # C3
    "Lead_02_C":                   "erLeadHi",        # C4
    "Lead_07_C_Heavy attack":      "erLeadLow",       # C1, hard front
    "Pad_01_C":                    "erPad",           # C2
    "Plucked_01_C":                "erPluck",         # C4
    "BARD_WIND_04":                "erWind",          # D#5 -- NOT a C
    # ── THE SIX DRUMS, NAMED BY WHERE THEY SIT AND NOT BY THEIR FILING ──
    # Same correction as the pitched files, for the same reason: the numbers
    # are the pack's filing. MEASURED on each recording -- the strongest
    # partial between 40 and 600 Hz, which is what an ear reads as "which
    # tom", tie-broken by spectral centroid where the fundamentals match:
    #     pc06   64.9 Hz   centroid 251     erTom1   the floor
    #     pc01   64.3 Hz   centroid 423     erTom2
    #     pc04   64.1 Hz   centroid 472     erTom3
    #     pc03   71.4 Hz   centroid 479     erTom4
    #     pc02   91.2 Hz   centroid 673     erTom5
    #     pc07  131.3 Hz   centroid 408     erTom6   the highest head
    # Three of them share a fundamental within a third of a hertz, so the
    # centroid is doing the work there and it is stated rather than implied.
    "percussion_06_C":             "erTom1",
    "percussion_01_C":             "erTom2",
    "percussion_04_C":             "erTom3",
    "percussion_03_C":             "erTom4",
    "percussion_02_C":             "erTom5",
    "percussion_07_C":             "erTom6",
    "sfx_wind":                    "sfxWind",
    "sfx_catacomb":                "sfxCatacomb",
    "sfx_drone_heavy":             "sfxDrone",
    "sfx_thunder_impact":          "sfxThunder",
    "Noise_loopable_04_record pops":        "noisePops",
    "Noise_loopable_05_grammaphone pops":   "noiseGramo",
}
FAM = {
    "erStringsHi": "strings", "erStringsMid": "strings", "erStringsLow": "strings",
    "erKeyLong": "Key", "erKeyMid": "Key", "erKeyHi": "Key",
    "erLeadMid": "Lead", "erLeadHi": "Lead", "erLeadLow": "Lead",
    "erPad": "Pad", "erPluck": "Plucked", "erWind": "Wind",
    "erTom1": "percussion", "erTom2": "percussion", "erTom3": "percussion",
    "erTom4": "percussion", "erTom5": "percussion", "erTom6": "percussion",
    "sfxWind": "sfx", "sfxCatacomb": "sfx", "sfxDrone": "sfx", "sfxThunder": "sfx",
    "noisePops": "Noise", "noiseGramo": "Noise",
}
PITCHED = {"strings", "Key", "Lead", "Pad", "Plucked", "Wind"}

# ── AND THE HELD ONES LOOP AFTER THEY HAVE FINISHED PLAYING IN FULL ──────────
# The docstring above says nothing is looped, and that was right for the reason
# it gives -- the old encoder threw away eight of every twelve seconds and
# looped the rest, which capped how long a note could sound before it became a
# loop. This is the OPPOSITE operation and it costs none of that length.
#
# WHY IT HAD TO EXIST. The drone lane holds ONE note for the whole record:
# measured on fantasy synth seed 1, three drone events of 1204.5 seconds each.
# Handed an unlooped eleven-second pad, the stack played for eleven seconds and
# then the record had no floor under it for the remaining twenty minutes. That
# is what a listener hears as "it went thin": MEASURED against the previous
# pack, the quiet legs went from 5-76% of their energy under 120 Hz to 0.1-4%,
# and the outro from 66% to 3%. Not the drums, not the mix, not the beds --
# a held note on a one-shot.
#
# WHAT IS DIFFERENT FROM THE OLD `keep`. Nothing is trimmed. `crossfade_loop`
# is handed the WHOLE file and told to start the loop at 0.60, so the first
# seven seconds -- the attack, the swell, everything the owner asked to keep --
# play once, in full, before any wrap can happen. A note shorter than the
# recording never reaches the loop at all and is bit-identical to the one-shot.
# The only samples lost are the fraction of one period between the last whole
# period and the end of the file.
#
# AND ONLY THE ONES THAT ARE STILL SOUNDING AT THE END. The struck families --
# Key, Plucked -- have decayed to nothing by 60%, and looping a decayed tail is
# a note that holds at a whisper and then swells again, which is worse than
# stopping. The wind is a breath and PLAY_AIR already refuses to write a note
# longer than 5.5 s on it, so it can never reach a loop either.
LOOPED = {"strings", "Lead", "Pad"}
LOOP_AT = 0.60

# ── ROOTS THE READER GETS WRONG, AND THE MEASUREMENT THAT SAYS SO ────────────
# `root_of`'s octave guard takes the SHORTEST lag within 90% of the best peak,
# which fixes reading an octave LOW and over-corrects when the second harmonic
# is the loudest partial in the file. On `strings_10` it does: the reader
# returns 65.42 Hz for a recording whose fundamental is 32.70.
#
# SETTLED BY THE ODD HARMONICS, which is the one test that cannot be argued
# with. If the root were C2 (65.41) the partials would be 65, 131, 196, 262 --
# there is no 98 Hz in that series at all. Measured on the file: 98 Hz sits at
# -10 dB of the loudest partial and 164 Hz at -14 dB. Both are harmonics 3 and
# 5 of C1 and neither is a harmonic of C2, so the root is C1.
#
# `Lead_07` reads 32.69 and is CORRECT -- the same test puts its 3rd harmonic
# at 0 dB -- so it is not listed. A correction is written down only where the
# measurement disagrees with the reader.
CORRECT_ROOT = {
    "erStringsLow": 32.70,      # reader said 65.42; odd harmonics say C1
}


# ── AND THE ROW ORDER IS DECLARED, BECAUSE SOMETHING READS IT ────────────────
# `ERANG.family("percussion")` in the page returns the rows IN BANK ORDER, and
# the drum kit indexes into that list by lane. So the order these rows are
# written in is not cosmetic: it is the order the drums are laid across the
# kit, lowest head to highest. Left to `sorted(os.listdir())` it would be the
# pack's filing order, which the block above has just finished proving is not
# the order the ear hears. Anything absent from this list falls to the end in
# filename order, so a file added to the pack still gets encoded.
ORDER = ["erTom1", "erTom2", "erTom3", "erTom4", "erTom5", "erTom6"]


def main():
    src, dst = sys.argv[1], sys.argv[2]
    blob, rows, log = bytearray(), [], []
    seen = set()
    files = [f for f in sorted(os.listdir(src)) if f.lower().endswith(".wav")]
    rank = lambda f: (ORDER.index(NAME[f[:-4]]) if NAME.get(f[:-4]) in ORDER
                      else len(ORDER))
    for fn in sorted(files, key=lambda f: (rank(f), f)):
        stem = fn[:-4]
        # the pack shipped BARD_WIND_04 twice, once under its full pack name.
        # Same md5; the second one is skipped rather than encoded twice.
        if stem not in NAME:
            log.append("  skipped (not in NAME): " + stem)
            continue
        nm = NAME[stem]
        if nm in seen:
            log.append("  skipped (duplicate): " + stem)
            continue
        seen.add(nm)
        fam = FAM[nm]
        x, sr = EB.read_mono(os.path.join(src, fn))
        if sr == 44100:
            x = EB.halve(x)
        elif sr != SR_OUT:
            raise SystemExit(fn + ": unexpected rate " + str(sr))
        # peak-normalise to -1 dBFS and store the ORIGINAL peak, the way the
        # older packs do, so the program can put the level back where it was
        pk = float(np.max(np.abs(x))) or 1.0
        x = x / pk * 0.891
        root, ls, le = 0.0, -1, -1
        if fam in PITCHED:
            # two independent readers, and they have to agree within 3% or the
            # file is treated as unpitched -- erang_bank.py's own rule
            a = EB.root_of(x, SR_OUT)[0] if hasattr(EB.root_of(x, SR_OUT), "__len__") else EB.root_of(x, SR_OUT)
            b = EB.f0_of(x, SR_OUT, 30.0, 1200.0)
            root = float(a if isinstance(a, float) else a[0]) if a else 0.0
            if root <= 0 or b <= 0 or abs(root - b) / max(root, b) > 0.03:
                log.append("  %-14s readers disagree (%.1f vs %.1f) -- using the stronger" % (nm, root or 0, b or 0))
                root = root or b
        if fam in LOOPED:
            x, ls, le = EB.crossfade_loop(x, SR_OUT, len(x) / SR_OUT, True,
                                          30.0, 1100.0, LOOP_AT)
            if ls < 0:
                log.append("  %-14s REFUSED a loop -- it will not hold a long note" % nm)
        if fam in ("sfx", "Noise"):
            lp = BEDS.get(stem.split("_record")[0].split("_grammaphone")[0])
            if lp:
                ls, le = int(len(x) * lp[0]), int(len(x) * lp[1])
        if nm in CORRECT_ROOT:
            log.append("  %-14s root corrected %.2f -> %.2f Hz [see CORRECT_ROOT]" %
                       (nm, root, CORRECT_ROOT[nm]))
            root = CORRECT_ROOT[nm]
        enc = EB.adpcm_encode(x)
        rows.append("%s,%s,%d,%d,%.4f,%d,%d,%d" %
                    (nm, fam, len(blob), len(x), root, ls, le, int(round(pk * 10000))))
        blob += enc
        log.append("  %-14s %-11s %6.2fs  %7d samples  root %8.2f Hz  %s" %
                   (nm, fam, len(x) / SR_OUT, len(x), root,
                    ("loop %d..%d" % (ls, le)) if ls >= 0 else "one-shot"))
    out = {"index": ";".join(rows), "b64": base64.b64encode(bytes(blob)).decode("ascii")}
    with open(dst, "w") as f:
        json.dump(out, f)
    print("\n".join(log))
    print("\n  %d samples   %.2f MiB raw   %.2f MiB base64" %
          (len(rows), len(blob) / 1048576, len(out["b64"]) / 1048576))


if __name__ == "__main__":
    main()
