# THE MATRIX'S TWO AXES — an LFO on each, with a reset trigger

*Built 2026-08-19, build `2026-08-19f`. The owner's idea, twice: first "why not
add and build into the matrix **at each row a lfo with a reset trigger** so it
can be automated and also reset with a trigger", then the better version —
"we might want lfos on the **x and y**, that way you could have say **the reverb
open up all the way through all its connections**".*

---

## 1. WHAT THE PROGRAM HAD

Every LFO in this file has been **free-running since the first one**. Its phase
was `mv.phase + absoluteStep / period` — absolute song position, bar 0 to the
last bar, never interrupted. `freePhase: true` (326 declarations) does not
change that: it randomises where the cycle *starts* and then lets it run.

That is one of the two ways a modular LFO is used and the file only had one.
The other is **hard sync**. Doepfer's A-145: *"the LFO signal can also be
synchronised, via the reset input"*. Xaoc's Batumi, four channels each with its
own RESET/SYNC jack: *"in RESET mode, an incoming trigger impulse resets the LFO
cycle to zero state (hard sync)"*.

And on the matrix specifically, everything was **per cell and written by hand**.
A genre names `matrix.keysRoom` in its motion table and that one crossing moves.
`matrixDraw` widened *which* cells a record picks and did not change the shape of
the thing. Measured before this build, all four genres, 20 records each:

```
  crossings carrying a movement that spans a whole ROW      0
  crossings carrying a movement that spans a whole COLUMN   0
```

The room has **never once opened as one thing**. `keysRoom` and `leadRoom` were
two unrelated lanes at unrelated phases.

---

## 2. WHAT EACH AXIS SAYS

**A row is a source.** Its cells are where that source goes. One modulator
across the row moves all of its destinations together: the drone gets wetter and
echoes harder *at the same moment*, which reads as the drone moving. Four
unrelated cell lanes read as four knobs being fiddled.

**A column is an effect** — and this is the one that had no way of being written
down. A column modulator swells every source's send into that unit at the same
instant: the whole record walks into the hall and back out. That is an
arrangement gesture.

**Where a row and a column cross, the cell gets both.** Two lanes on one
destination already sum, so nothing new was needed for that — and it is why the
axes are the right grain. Fifteen modulators (eight rows, seven columns) cover
forty-nine crossings, and no two crossings move identically because no two of
them sit at the same intersection.

The hardware agrees about the grain. *"Connect an LFO or an envelope generator to
the CV inputs and use them to modulate the potentiometers responsible for [the
mix]"* [AI018]. The 4ms VCA Matrix puts a CV jack at all sixteen intersections of
a 4×4, so *"each intersection of the matrix (row × column) has its own control"*.
Per **intersection** is the finest grain and nobody has forty-nine LFOs; what
people have is four, and they patch one per line.

---

## 3. WHAT A TRIGGER IS HERE

Not a wire and not a wall clock: **the arrangement**. Three sources, each a fact
the plan already carried, so a reset is deterministic, survives the trip into the
render page, and costs `motionAt` one lookup:

| `reset` | the cycle restarts at |
|---|---|
| `"section"` | the bar this section started on (`plan.secStart`, new) |
| `"phrase"` | the drum sentence's own length (`plan.phrase`) |
| *n* | every *n* bars — a clock divider |

**A genre with no drum sentence resets at the section instead.** Returning 0
there would have been a declared trigger that silently never fires, which is the
defect this file names most often.

**Which trigger each axis takes is a reasoned split, not a coin toss.** A COLUMN
is an arrangement gesture, so it resets at the SECTION — a unit opening is a
thing that happens when the music arrives somewhere. A ROW is a source breathing,
which is groove-scale, so it resets on the PHRASE and turns over with the
eight-bar sentence the kit is written in.

**It stays closed-form.** The reset point is a function of the bar and the phase
is a function of (bar − reset point), so a two-bar excerpt cut out of the middle
of a record still renders the value the live playback holds [Law 10]. That is why
this is a lookup and not a fourth `curve` kind.

---

## 4. THE TWO REFUSALS

**It only moves crossings the genre has already opened.** A shut cell is not a
knob at the bottom of its travel, it is a cable that was never patched, and
opening one would be this program routing a signal the genre never asked for.
"All the way through all its connections" means **all the ones it has**: a genre
widens that by naming more rows in `feeds`, which is where routing is decided.

**The MIX column is excluded on both axes**, for the reason the modulator bank's
own destination list already gives: *"the `*Mix` trims move a bus's LEVEL, and an
LFO on a level is a tremolo on the whole record, which nobody asked for."* A
column modulator on MIX would be that across every row at once — the record
fading in and out.

### And what "open up" can mean, stated honestly

Every open crossing already sits at **1**. That *is* all the way. So the movement
is downward from the open position (the new `off` term on an LFO move — the DC
offset an attenuverter-plus-offset gives you) and the top of its cycle is the
unit at full: it backs off and returns, which is what makes an opening read as an
opening. Sending *more* than the genre's own routing is not a crossing at all —
it is the unit's wet level and its decay, which are separate knobs.

Without `off`, a bipolar wave on a crossing at 1 spends **half its cycle in the
clamp** and reads as a flattened wobble. That is the lesson the `stage` block
learned about depths on crossings, stated as a term instead of as a slide.

---

## 5. WHAT IT MEASURED

20 records a genre, reading the plan:

```
                 records with   crossings   mean travel   rows moved
                 axis movement  moved       per crossing
  lofi           19/20            50          0.212       lead, keys
  dungeonsynth   20/20           110          0.274       keys, lead, drone, bass
  boxcarsynth    20/20            72          0.269       keys, lead, drone
  synthwave       0/20             0            —         — (declares neither)
```

Columns reached: Room and Echo in all three — every column those genres patch.

**Not one note moved.** 24 records across four genres, printed note for note
against the previous build: identical. The axes are stage 6 and write nothing.
Blends: 1 throw of 108, and it throws identically on the previous build.

### Read it — dungeon synth seed 1, the ROOM column

```
  matrix.keysRoom    sin 16bar 0.13 reset:phrase  |  tri 16bar 0.34 reset:section
  matrix.leadRoom                                    tri 16bar 0.34 reset:section
  matrix.droneRoom   sin 67bar -0.10 free         |  tri 16bar 0.34 reset:section
  matrix.bassRoom    sin 84bar 0.15 free  | sin 32bar 0.21 phrase
                                                  |  tri 16bar 0.34 reset:section

  bar   4  <verse   |##########################--------------| 0.657
  bar   8           |##############################----------| 0.761
  bar  12           |########################################| 1.000
  bar  16           |##############################----------| 0.761
  bar  20  <verse   |##########################--------------| 0.657
  bar  28           |########################################| 1.000
  bar  36  <instrumental |#####################--------------| 0.657
```

The same 16-bar triangle, at the same depth, on **all four rows the room is fed
from**, restarting at every section. That is the reverb opening all the way
through all its connections, and it is the picture the file could not previously
draw.

### The jumps, measured rather than assumed

A reset is a discontinuity — that is what hard sync is. So: how big, and where?

```
                 jumps >0.02   median   worst   on a section or phrase line
  lofi              266         0.137   0.218   266 / 266
  dungeonsynth     1552         0.104   0.346   1552 / 1552
  boxcarsynth       931         0.155   0.365    865 / 931
```

Median 0.10–0.16 of a 0..1 send is 1–1.5 dB, and `rideBus` samples the plan every
beat, so a jump is **glided over one beat** rather than stepped. Every one of
them lands on a section or a phrase line except boxcar's 66, and those are not
resets at all: they are a **`ramp` wrapping its own cycle mid-section**, where the
period drawn is shorter than the section it landed in. That is a sawtooth being a
sawtooth, it lands on a bar line, and it is left alone rather than papered over.

---

## 6. WHAT IS NOT BUILT

- **Nobody has heard it.** Dungeon synth's cycles are 16–64 bars, which at 66 bpm
  is one to five minutes; the render battery's excerpts are **9 seconds**. A
  nine-second window cannot show a one-minute cycle. 47 of 47 renders succeeded,
  which proves the path is alive, not that the gesture is audible.
- **Only three genres declare it.** Synthwave has not been researched for this
  and is untouched by construction.
- **The Spring, Flange, DP/4 and Barberpole columns get nothing**, because no
  genre here feeds them. A column modulator on a column nobody patches is a knob
  that moves nothing.
- **A one-shot mode.** An LFO with a reset that holds at the end of its cycle
  instead of wrapping is a function generator (Maths, Function), and it would be
  the right answer to the ramp-wrap above. Named, not built.
- **The trigger cannot be pressed.** It is generated by the arrangement, because
  a live button would break the rule that an offline render is bit-identical to
  live playback.

---

## Sources

- [Doepfer A-145 LFO — Analogue Haven / Doepfer](https://www.analoguehaven.com/doepfer/a-145/) *("the LFO signal can also be synchronised, via the reset input")*
- [Xaoc Devices Batumi](https://xaocdevices.com/main/batumi/) *(RESET/SYNC per channel; "an incoming trigger impulse resets the LFO cycle to zero state (hard sync)")*
- [AI018 Stereo Matrix Mixer — AI Synthesis](https://lame.buanzo.org/eurorack_blog/unlock-endless-possibilities-with-the-ai018-eurorack-stereo-matrix-mixer.html) *("Connect an LFO or an envelope generator to the CV inputs … to modulate the potentiometers")*
- [4ms VCA Matrix manual](https://4mscompany.com/vcam/manual_with_quickstart_1.0.pdf) *(a CV jack at every one of sixteen intersections)*
- [Matrix Mixers & How to Use Them — Perfect Circuit](https://www.perfectcircuit.com/signal/matrix-mixers)
- [The complete guide to matrix mixers — SignalSounds](https://www.signalsounds.com/blog/complete-guide-to-matrix-mixers)
- `docs/genre-research/the-evolving-drone.md` — the slow/shallow modulation the depths are set against
- `docs/genre-research/modulation-and-the-eurorack.md` §4 — why the four memory kinds are curves and this one is not
