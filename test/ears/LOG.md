# THE EARS LOG

*Roadmap R3: **no taste decision merges without a dated A/B entry.** The batteries
prove the program does what it says. They cannot tell you whether it sounds good.
Only the user's ears settle that, and this file is where their verdicts live so
nobody — me most of all — can quietly re-decide a settled question later.*

## How to use this

An `[EAR]` mark in the code means "this number is taste, and taste has not ruled
yet." Every one of them should end up here with a date and a verdict. An entry is
one of:

- **SETTLED** — the user listened and chose. The number is now theirs, not mine.
  Changing it later needs a new entry, not an argument.
- **OPEN** — rendered and sent, awaiting a verdict.
- **NOT YET SENT** — the knob exists but no A/B has been made.

What does *not* belong here: anything a measurement can answer. If a number can be
checked, check it and put the number in the code comment instead.

---

## OPEN — sent, awaiting verdict

### 2026-07-27 · the SEGA rig, first listen
`mk2_seed1_band.wav` vs `mk2_seed1_sega.wav` — **the same song, note for note**
(the seam battery proves the two rigs differ only in which voice plays each event),
so every difference you hear is the instruments and nothing else.

Measured before sending, so you know what is not in question: peaks within 0.1 dB
of each other, RMS within 1.0 dB, zero clipped samples on either.

The questions, in the order they matter:
1. **Does the chip rig belong in this program at all**, or is it a novelty?
   It currently draws 3 times in 10. That weight is a guess.
2. **Is the chip too dark, or right?** The DAC drums cap at 5.25 kHz and the PSG
   hats at ~7 kHz — that ceiling is the real hardware, not a bug, and it is why an
   MD snare is a thud with a hiss. But it makes the sega mix ~10 dB darker up top.
3. **`CHIP_VEL_TL` = 0.6** — how much velocity reaches brightness. 0 makes velocity
   pure volume; 1 makes quiet notes fully dark. No principled value exists.
4. **`chipKeys` modulator TL 30.** Raised from the first build's 42, which measured
   as a filtered sine (2 partials). 30 gives 4 partials and a 29.8% 2nd harmonic.
   Right for a lofi comp, or too bright?
5. **The tape bed under the chip rig.** A Mega Drive under vinyl crackle is a 2020s
   aesthetic, not a 1990s one. Keep, or zero it for `rig: sega`?

### 2026-07-27 · the Rhodes, with the phantom filter gone
The previous Rhodes was lowpassed at 800–1900 Hz by a filter **mda ePiano never
applies** — I had ported it from the sibling instrument, mdaPiano. Removing it
returned 16.3 dB at 3.5–5.2 kHz, and the full mix gained 7.6 dB at 600 Hz–1.5 kHz
(that hole was also the comp being stuck in one octave, now fixed).

The question: **is it now right, too bright, or still not smooth?** Your last
verdict on the Rhodes was "nowhere near as smooth as it should sound", and that was
against the FM version this replaced — so this is the first listen to the real one.

---

## NOT YET SENT

| knob | where | the question |
|---|---|---|
| `g.pre` = 0.5 | master chain | Measured: -0.7 dB of soft clip at the median mix, -8.4 dB at p99. Tape character, or too much? 0.35 would put p99 near -5 dB. |
| rig draw 7:3 | `makeChart` | how often a song should come out as a chip song |
| `wet` = 0.16 | master chain | the room |
| dilla depth | `makePerformance` | snare -0.10..-0.25 / kick +0.06..+0.18 sixteenths. Is the limp deep enough? |
| `chart.tape.crackle` | stage 1 | vinyl bed level |
| wurly vs rhodes | `keysChar` 6:4 | the wurly is still FM while the Rhodes is sampled |
| `cs80` | unwired | built and probed, waiting for the genre that wants it |

---

## SETTLED

*(nothing yet — this file is new as of 2026-07-27)*
