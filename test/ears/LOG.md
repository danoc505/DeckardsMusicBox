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

### 2026-08-03 · THE UNHEARD STACK — one sitting, six songs, on build `2026-08-03o`

Everything recent — the new reverb, stereo, the matrix mixer, the stage, the
flanger, the DP/4, the effect-cuts, the barberpole — is measured and none of it
has been listened to. This is the session that changes that. The published
artifact IS this build (stamp checked), so: open it, and for each row below
**type the seed in the box, pick the genre, press "new song", press play.**
Timings are for that exact seed. Verdicts can be one word each; every one of
them decides something concrete.

**1. plastikman, seed 11** — about ten minutes; the first two are enough.
Once a minute, starting at **0:59**, every echo and reverb vanishes for
~15 seconds while the parts keep playing dry, then it all snaps back. This is
the Hawtin desk-mute move and it should feel like a decision, not a glitch.
- *Does the cut land? Is once a minute too often?*
- *Under it all: does the record's space feel alive (the flanger and the
  four-way processor are moving constantly here), or is it soup?*

**2. jungle, seed 1** — six minutes; skip to **3:00** if pressed. At
**3:02–3:24** the drums leave for the breakdown and return. The echo throws
should bounce left–right behind the kit all song (the ping-pong).
- *Does the drop hit, and does the return pay it off?*
- *Heads up: the drums do NOT dissolve into the echo as they leave — that
  move turned out to be automated in a section where the drums are already
  gone (measured this session, see BACKLOG §1). If the drop feels like a
  mute where it should feel like the kit washing away, that is the defect.*

**3. synthwave, seed 1** — four minutes. The picture is supposed to be
narrow in the verses and thrown OPEN at the chorus (**0:42**, and biggest at
**3:31**), with the brass synth seated to the right this seed. The endless
riser (the barberpole) sits under the run into each chorus.
- *Can you hear the picture widen when the chorus hits?*
- *Does the rise into the chorus (0:34–0:42) pull you forward?*

**4. bladerunner, seed 1** — four and a half minutes. The new room: big,
five-second tail that starts a beat late, which should read as a HALL, not an
effect. Chords now bloom in over a full second instead of starting instantly.
The string machine is spread wide; slow pitch-dives and filter-falls ride the
lead.
- *Does it sound like a large dark room, and does the swell feel like the
  score, or like slow attack for its own sake?*

**5. lofi, seed 1** — two minutes. Two keyboards, seated on opposite sides;
the electric piano sways slowly (the real Suitcase auto-pan). Gentle
everywhere by design.
- *Do you hear two players in two places, or one wide blur?*
- *The ending: it currently just stops. The "record recedes as it ends" move
  was found this session to be automated onto a part that never plays in the
  outro (BACKLOG §1) — does the stop bother you? If yes, that fix jumps the
  queue.*

**6. dkc, seed 1 · acid, seed 1** — a quick pair, one question each.
DKC (2:22): the pads shift their colour continuously (the wave-sequencer) —
*texture, or wobble?* Acid (any length): it is the one genre with **no stereo
placement at all** — its machines have no pan and that is currently an
accident of the draws. *Does acid sound boxed-in next to the others, or is
narrow right for it?*

And if one more is in the budget: the FIELD panel's **MONO CHECK** button
flattens the image to what a phone speaker or club rig hears. *Does any of
the above fall apart in mono?*
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
