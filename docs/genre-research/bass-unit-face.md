# THE BASS UNIT'S ONE FACE — and the five knobs every engine reads

*Written 2026-08-08, on the user's correction: "The master bass is supposed to
be like how the master drum rack works which is the tr1000 no matter the kit
its always the tr. this is not the case with the master bass. If any other kit
is loaded it completely changes ui this is not the idea it is wrong. The kit
should only change knobs if need like the tr1000." And, in the same message:
"The bass unit loads five engines and only one of them responds to the accent,
slide and muffler knobs. The other four have those knobs sitting there doing
nothing on them."*

---

## 1. WHAT WAS WRONG

The engine entries carried `krow`, `deck` and `jacks` OVERRIDES: loading the
sub bass amputated the patch bay and the entire lower deck, leaving five knobs
on a bare chassis. The TR-1000 never does that — its ten strips are its ten
strips whatever kit is in it. The bass box was rebuilding its face per load,
which is a different machine per load wearing one nameplate.

## 2. THE TWO HALVES OF THE FIX — they are one fix

**One face** and **the knobs work everywhere** are the same problem: the old
UI amputated the deck precisely BECAUSE its knobs would have been dead over
the other engines, and this program has a standing rule against dead knobs.
Keeping the face means wiring the knobs.

**The five the box now shares** (`tb303.sharedReads`), read by every engine
through one helper (`bassBox`) so five voices cannot drift on what a knob
means:

| knob | on every engine it means |
|---|---|
| TUNE | the unit's tuning, ±12 semitones |
| ACCENT | how much harder an accented note hits — louder, and brighter through whatever filter the engine has |
| SLIDE TIME | how long a slid note takes to arrive from the note before |
| MUFFLER | the Devil Fish output stage — level-dependent soft clipping with the lows routed around it — extracted verbatim into `mufflerStage` so all five engines end on the SAME circuit |
| VOLUME | the box's output level |

The accent and slide FLAGS were already on every bass note ("every bass
carries them"), composed by stage 3 and ignored by four of five engines. The
grid's ACC and SLD rows now derive back onto every engine, honest on all of
them.

**What stays per-engine**: each engine's own few knobs (the sub's five, the
drone's three, the Reese's five, the chip's one) draw in ONE stable row under
the load switch — "only change knobs if need."

**What stays the acid line's**: its filter, envelopes, sweep circuit and sub
oscillator — sixteen controls that ARE the 303's circuit. Under another
engine they draw DIMMED with a tooltip saying whose circuit they are. That is
the patch sockets' own honesty ("drawn and inert... labelled as such"), and
the reason the no-dead-knob rule is kept rather than broken: a knob that says
it is out of circuit is not lying.

## 3. MEASURED

- **The acid line did not move.** The muffler extraction is a refactor:
  A/B render, acid seed 1, old vs new — **−118.6 dB rms difference, 0 samples
  over −60 dB. INAUDIBLE.**
- **The flags are real music.** Over 6 seeds per genre, the sub-bass engine
  alone carries: plastikman **1001 accented + 331 slid** notes, synthwave
  647 + 270, jungle 720 slid, lofi 160 + 73, dkc 41 accented. Every one of
  those was composed, carried, and ignored until now. Wiring them is an
  AUDIBLE change to those genres' records and is reported as one — the A/B
  numbers are in the build's commit.
- One face verified across all five loads by the UI battery: 13 jacks, 12
  knob-row items, 15 deck items, the grid with its 32 flag buttons —
  identical counts on every load; only the engine row changes.
