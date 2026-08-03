# THE EARS LOG

*Roadmap R3: **no taste decision merges without a dated A/B entry.** The batteries
prove the program does what it says — 37 seam checks on the notes, 501 assertions on
rendered samples. Neither can tell you whether it sounds good. Only the user's ears
settle that, and this file is where their verdicts live so nobody — me most of all —
can quietly re-decide a settled question later.*

## How to use this

An `[EAR]` mark in the code means "this number is taste, and taste has not ruled yet."
Every one should end up here with a date and a verdict:

- **SETTLED** — the user listened and chose. The number is theirs now. Changing it later
  needs a new entry, not an argument.
- **OPEN** — rendered and sent, awaiting a verdict.
- **NOT YET SENT** — the knob exists but no A/B has been made.

What does **not** belong here: anything a measurement can answer. If a number can be
checked, check it and put the number in the code comment instead. Three times now a
"taste question" turned out to be arithmetic — the swing model, the drum fills, the
Rhodes filter — and each time measuring first was worth two minutes and saved a
regression.

---

## OPEN — sent, awaiting verdict

### 2026-07-28 · three genres, as MIDI
`mk2_seed1.mid` (lofi) · `mk2_synth5.mid` (synthwave) · `mk2_dkc.mid` (DKC)

The MIDI is the honest artefact: it carries the notes and the micro-timing and none of
my synth's opinions. Judge the *writing* from these; judge the *sound* from the artifact.

Per genre, the question that matters most:

| genre | the question |
|---|---|
| **lofi** | Is the dilla limp deep enough? Snares land 40 ms early, kicks 7 ms late at 84 bpm. |
| **synthwave** | Is the eighth-note pulse bass right, or too busy at 30.8 notes per 4 bars? |
| **DKC** | Does the ostinato-over-pedal actually read as Wise, or as a loop that forgot to change? |

### 2026-07-28 · the SEGA rig, and DKC on it
`composeSong(seed, "band")` and `composeSong(seed, "sega")` are the **same song, note
for note** — the seam battery proves it across 40 seeds. Every difference you hear is
the instruments.

1. **Is the chip too dark, or right?** The DAC drums cap at 5.25 kHz and the PSG hats
   near 7. That ceiling is the real hardware — it is why an MD snare is a thud with a
   hiss — but it makes the sega mix ~10 dB darker up top.
2. **DKC on the chip**: your call was "close enough", and it draws sega 7 times in 10.
   Right weight, or should it always be the chip?
3. **`CHIP_VEL_TL` = 0.6** — how much velocity reaches brightness. No principled value
   exists; 0 makes velocity pure volume, 1 makes quiet notes fully dark.

### 2026-07-28 · the Rhodes, with the phantom filter gone
The old Rhodes was lowpassed at 800–1900 Hz by a filter **mda ePiano never applies** —
ported from the sibling instrument by mistake. Removing it returned 16.3 dB at
3.5–5.2 kHz. Your last verdict ("nowhere near as smooth as it should sound") was aimed
at the FM version this replaced, so this is the first listen to the real one.

---

## NOT YET SENT

| knob | where | the question |
|---|---|---|
| `g.pre` = 0.5 | master chain | Measured: −0.7 dB of soft clip at the median mix, −8.4 dB at p99. Tape character, or too much? 0.35 puts p99 near −5 dB. |
| `swingUnit` | lofi groove | 2 = eighth shuffle (shipped). 1 = sixteenth swing, which is what an MPC actually does and what hip-hop was made against. One number. |
| dilla depth | lofi groove | snare −0.10..−0.25 / kick +0.06..+0.18 sixteenths |
| rig draw 7:3 | lofi chart | how often a lofi song should come out as a chip song |
| `wet` 0.16 / 0.30 / 0.34 | per genre | lofi's room vs synthwave's plate vs DKC's SNES echo |
| wurly vs rhodes 4:6 | lofi | the wurly is still FM while the Rhodes is sampled |
| DKC hat density | dkc kit | eighths, raised from quarters because the chip kit measured 0.03% above 6 kHz. A stopgap for the tuned-percussion bed we do not model. |
| the ribbon | stage 5 | built, probed, and **no genre uses it yet** — Blade Runner is its first real consumer |
| CS-80 layer mix | `V.cs80` | layer II at 0.5 against layer I; the ring mod at 0.16 |

---

## SETTLED

*(nothing yet — the user has not returned a verdict on any of the above)*
