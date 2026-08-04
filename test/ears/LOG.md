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

### 2026-08-04 · EIGHT BUILDS IN A DAY, NONE HEARD — start here, on `2026-08-04j`

**Start from `04j` and not from `04b`.** Every earlier build of the eight is
inside it, so one sitting settles all of them. The published artifact IS this
build (`node harness/mk2_stamp.js check` is green). Open it, type the seed in
the box, pick the genre, press **new song**, press **play**.

**Two of the eight are the loud ones. Judge these first.**

---

**1. lofi, seed 1 — WHAT IS PLAYING THE TUNE.** The single biggest change to
this genre in weeks. Until today lofi's melody came out of `V.lead`: three
oscillators, a triangle, a square and a sawtooth an octave up, through one
filter with a vibrato fixed at 5.1 Hz. It is now a **Rhodes or a Wurlitzer** —
seed 1 draws the Wurlitzer for the tune and the Rhodes for the chords.

Three sources name this genre's lead and not one of them names a synth. The
question is not whether that is correct — it is whether it SOUNDS right here,
and specifically:

- **Does the tune still cut through the comp?** They are now the same family of
  instrument, in overlapping registers. It was measured arriving 2 dB quiet and
  trimmed back up by 1.25×; that number is arithmetic, not taste.
- **Rhodes or Wurlitzer for the tune?** The draw is 6/4 in the Rhodes' favour.
  Seed 1 is the Wurlitzer, **seed 2 is the Rhodes** — play both.
- **Should the tune be a DIFFERENT instrument from the comp?** One source says a
  lead should sit "without competing with the chords". Right now they can be the
  same one. Seed 3 draws Rhodes for both.

**2. lofi, seed 1 again — THE TUNE NOW STOPS.** A phrase is two bars; its second
bar may no longer put a note in its back half, and the hook lost a note a bar.
Measured: silent time 38.3% → 41.0%, rests of a beat or longer 39.2% → 47.9%.

- **Is it enough silence, or too much?** No source gives a length for the rest.
  This is the definition of an `[EAR]` number.
- **Does the hook still sound like a hook** at 3.25 notes a bar instead of 4.06?

---

**The other six, in one pass each.** All measured, all unheard:

- **`04c` the record surface** — the crackle went up 15.7 dB and got its own
  channel. **lofi, any seed, listen to the intro before the drums.** Too much?
- **`04c` the kick duck** — 2.4 dB on the bass, chords and crackle, 4 ms on,
  65 ms off. Sourced as "barely audible". **Is it?**
- **`04d` chord quality** — lofi draws an explicit major/minor/dominant quality
  75% of the time now, from 1170 jazz tunes. **This is the biggest musical
  change of the six and it is one number, `qualities: 0.75`.** Does the harmony
  sound like this genre or like a jazz exercise?
- **`04e` the bass** — it leaves the root: bars holding one pitch 61% → 42%,
  step motion 28.8% → 38.6%. **Does it still sit under everything, or does it
  wander?**
- **`04f` the chromatic approach note** — the bass now walks into the next chord
  by a semitone rather than a scale step. **Colour, or a wrong note?**
- **`04g` jungle's chords** — sevenths and ninths where there were triads.
  **jungle, seed 1.** Its own July research asked for this and the table never
  received it. Does it still sound like jungle?

---

**And one thing to LOOK at rather than listen to.** THE ROLL, at the top of the
page: the song's own notes on a phosphor grid. Click a part in the legend to see
it on its own. It is the fastest way to check whether a complaint is about the
sound or about the notes — and it drew a finding on its first day, that the comp
plays a different 38 of its 41 written notes on each pass through a material.


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

---

# THE LISTENING PASS FOR `2026-08-04g` — six builds, none of them heard

*Written 2026-08-04. `BACKLOG.md` §0 says nothing should be built on top of
this stack until it has been played, and then six builds were shipped in one
day on top of it. This is the brief for hearing them. Everything below was
measured; **none of it was listened to**, and measurement has never once proved
that something sounds good on this project.*

**Two genres changed. Nothing else moved — the other five are byte-identical.**

## LOFI — five separate changes, and they stack

Load lofi and press play. **Seed 1** shows every one of them.

| what to listen for | where it is | what changed |
|---|---|---|
| **the record surface** — a fizzy hiss under everything, loudest in the intro and the quiet parts | all the time | it was 79 dB under the music, which is inaudible. It is now about 61 dB under, where a real record sits. **If it is too loud this is the first thing to say** — it is one number. |
| **the kick pushing everything aside** | every kick | the bass, the chords and the record noise now dip about 2.5 dB when the kick lands and come back in 80 ms. It should be felt rather than heard. **If you can HEAR it pumping, it is too much.** |
| **the second keyboard drifting in pitch** | the long held chords | the tape drift used to reach only one keyboard. Now both, plus a faster wobble on top. |
| **richer chords, and some that step outside the key** | the chord part | about half of lofi's chords now take their kind from 1170 real jazz tunes — dominant sevenths, minor sevenths, major sevenths. Seed 1's second chord is now an F#7 where it was an F#m7. **This is the biggest musical change of the day.** |
| **the bass moving inside the bar** | under everything | it used to state the root and sit there for 61% of bars. Now it walks — the third, the fifth, a passing step, and a semitone slide into the next chord. |

**The one question I most want an answer to:** the chords. 0.75 is how much
appetite lofi has for the jazz table, and it is a single number. Too jazzy, or
not enough?

## JUNGLE — one change

Load jungle, **seed 1**. Its chords were three identical minor triads and one
change. They are now a i–iv vamp with sevenths in it. The genre could not play
a jazz-inflected chord before today and its own research had asked for one
since July.

## WHAT I AM NOT ASKING

Nothing about whether the numbers are right — they are measured and they are in
the research sheets. The only thing worth your time is whether it SOUNDS like
the genre. If something is wrong, "too loud", "too busy", "too jazzy" is a
complete and useful answer; I can find the number.

---
