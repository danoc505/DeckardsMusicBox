# HANDOFF — BOXCAR SYNTH, ITS OWN PROGRAM

```
BRANCH   claude/code-review-6jd9cz
REPO     github.com/danoc505/DeckardsMusicBox
FILE     Boxcar Synth.html          <- THIS IS THE PROJECT
GENRE    boxcarsynth                <- the only genre in it
```

**Do not work on `Deckards Orchestrator MK2.html`.** That is the six-genre
program this was copied from. It still exists, it still has boxcar synth V1 in
it, and it is the published artifact — but nothing in it is being developed.
Every change goes in `Boxcar Synth.html`.

**The filename has a space in it.** Quote it in every command:

```sh
node harness/mk2_notes.js --seeds 12 --genre boxcarsynth --file "Boxcar Synth.html"
```

Most of the harness defaults to the MK2 file, so a probe run without `--file`
is measuring the wrong program. Pass the path.

---

## 1. WHAT THIS IS

A generative record: a string band riding a freight train across country,
where **the journey is what organises the music**.

> *"The train ride is the conductor, it is what sets the pace, it is what tells
> the orchestra where it is, the orchestra waxes and wanes with the ride, the 20
> min song is broken into 4 pieces dissected by the train stops."* — the owner

Not a song about a train. A train with a band on it.

---

## 2. WHY THERE IS A SECOND FILE AT ALL

The owner, after weeks of small careful changes that did not fix the music:

> *"I dont understand how in the hell code is so lock tight that we are unable
> to do anything we want? It feels like your not really trying and your skipping
> around with duct tape and plaster."*

**The answer was that it was not the code.** Six genres shared one engine, so
every change had to be proved not to move the other five — a 300-seed snapshot,
checked on every edit. That rule was self-imposed, and it is what turned a
rewrite into a series of additions declared around the outside of the problem.

So: copy the program, delete everything that is not boxcar synth, and rebuild
the foundation. There is no other genre here to protect.

**Read that paragraph before proposing a "safe, contained" change.** Containment
is not a virtue in this file. It was the disease.

---

## 3. THE DESIGN, AS THE OWNER SPECIFIED IT

| | |
|---|---|
| **the record** | a journey of **legs**, divided by **stops** |
| **how many legs** | the record's LENGTH, not a draw — 5 min = 1 leg, 20 = 4, 40 = 8 |
| **the leg** | its own lead instrument, terrain, character; sections inside it |
| **the pace** | accelerate out of a station, cruise, brake into the next. ~60–85 bpm |
| **the stop** | **solo X → the dance (X,Y) → solo Y → the train pulls out** |
| **the theme** | one tune, re-orchestrated per leg, **growing**; last leg rhymes with first |
| **the band** | as many players as the terrain allows; thins to ONE at the handover |
| **judged by** | `harness/mk2_notes.js` — the printout, twelve seeds, SFX named |

---

## 4. WHAT IS BUILT AND VERIFIED

### The clock — tempo as a function of position
`makeClock(chart, form)` is the one place a bar becomes a second: `at`, `barAt`,
`stepAt`, `stepSec`, `barSec`, `tempoAt`. It replaced **nineteen hand-written
copies** of `(bar * STEPS + step) * spb` in the performance stage alone.

A constant record takes the closed form, and that is **not** an optimisation:
a clock that accumulated bar lengths diverged from the shipped arithmetic by
**bar 6**. Measured against a deliberately broken build.

### The deletions — this is most of what has been done
| | |
|---|---|
| lofi, synthwave, vgm, dungeon synth | 4,397 lines |
| boxcar synth V1 | ~1,600 lines |
| **the grammar walk** | **652 lines** |
| **my own pre-sheet work** (see §5) | 45,364 chars |

The walk was the limit. Laws of succession, a plan of phases, a bisection
search over section lengths, a drawn energy arc — all for building a song, and
nothing here builds one.

---

## 5. WHERE IT IS NOW

`GENRE.boxcarsynth` is authored from the sheets and 20/20 seeds compose. The
form follows the trip: `planTrip` lays the ride out in SECONDS — stations,
terrain, weather fronts, the clock — and `makeRide` fits sections to it, so
every section carries what is under the train at that point. §4a's twelve-step
stop script runs at every town. The `hobo` rig has six pitched seats and puts a
kettle drum, a taiko and a war drum on the tom lanes.

**Measured, 12 records:** mean 3.5 instruments a section, **5.0 at cruise**,
2.3 at a stop, **1.7 at a solo**. The SHAPE is right and is what V1 never had.
The SIZE is not: eight seats are declared and five sound.

### The mix — measured for the first time, and then fixed

`harness/probe_mix.js` renders **three 20-second windows** (cruise · the middle
of a stop · the bar the train pulls out), chosen by asking the form where they
are rather than by guessing a timestamp. Seconds of compute, not minutes — the
owner's constraint, answered.

**It was measuring a record that does not exist.** It rendered with
`song.chart.space`, and there is no such field: `composeSong` returns seed,
genre, root, mode, tempo, table, picks, tape, atmos, clock and no `space`. So
every reading it had ever produced went through `space === undefined` — no
room, no echo, no tape, no medium, no legato. It goes through `soundOf` now,
the door the play button and the WAV export use. **Third instance of that class
in this file** (the tape that drew a running deck over dry audio; the medium
read off a channel `setSpace` never receives).

**And it is A-weighted now** — IEC 61672, built from the standard's own
pole/zero definition and self-checked against the published curve before it
measures anything. That is not cosmetic: the two chairs it called buried were
the bass and the counter, and a part in the bottom octave can carry a mix's
energy while being inaudible. The check binds below 4 kHz and reports above it,
because the probe renders at 22050 and plain bilinear drifts near Nyquist —
stated rather than hidden.

What it found, and what moved (A-weighted, against the band at cruise):

| | was | want | is now |
|---|---|---|---|
| the countryside at cruise | −37.6 | −25 | −26.0 |
| the departure signals | −21.3 | −11 | −12.9 |
| the washtub bass | −27.0 | ~−13 | −14.9 |
| the diddley | −27.3 | ~−13 | −18.3 |

**Seed 1 is at 0 mix faults.** Every level in the table above was measured
across three records rather than one, and every correction is deliberately
short of the full shortfall — §4d-ii records an overshoot that buried the
train's own signals at "not quiet, absent", and this session repeated it once
before catching it.

**`roleGain` could not reach the bass or the counter.** `gain` is
`min(1.25, vel × accent × arc × roleGain)`, so `bass: 3.2` and `counter: 3.0`
were pinned at the clamp — the two largest numbers in that table were doing
nothing, and raising them would have kept doing nothing (task #30, arriving as
an audible fault). Both are trimmed at the VOICE now, and **seed 3 proves that
is the right place**: that record's bass chair is the contrabassoon at −9.3 dB,
perfectly fine, while the same chair on seeds 1–2 is the washtub at −27.0. One
number on the role would have lifted a correct instrument to rescue a different
one sitting in the same seat.

### The hurdy-gurdy plays like a wheel

> *"The hurdy gury is playing a single note then stopping? Thats not a hurdy
> gurdy is it?"*

No. `PLAY_FAMILY` reasons about the gurdy and stops one step short: it is not
BOWED because "the wheel is a bow that never reverses", which is true and about
the wrong thing — the fault is that every note **re-attacks from silence**. The
genre declares `legato` on the three chairs its sustaining instruments hold.

**A note print cannot check this and nearly reported the fix as a failure.**
`legato` does not rewrite the event; stage 5 attaches `holdSec` and `tied`
beside it and stage 6 decides. A gurdy note prints 0.82 s before and after,
forever. `harness/probe_wheel.js` asks the right question: it counts SUPPRESSED
ONSETS (`soundState().legatoTied`) and A/Bs the rendered audio against the same
window with the declaration removed. 11 of 12 lead notes arrive with no attack,
against 0 without it, and the audio differs by 1.35 dB.

**Known, small, written down rather than patched:** `keys2` is untied because it
reaches the tie pass as CHORDS (measured by instrumenting that pass — 15 pairs,
all chords) and is spread into an arpeggio afterwards (#149).

### On a moving train, things go past

> *"a train that is moving has birds in passing not a the same bird making the
> same call that might happen when the train is parked"*

The passing envelope was **built and being applied** — playback rate 1.04 →
0.96, a stereo crossing, the top opening 900 Hz → 6.5 k → 900. It sounded like
none of that because the emission handed it `durSec: g.sec` and **a segment is
30–90 seconds long**. The defect was the duration, not the envelope.

A segment the train runs through is now a sequence of passes: 3–5.5 s each (60 m
of approach-and-recede at the 11–20 m/s the 39-foot-rail tempo band implies),
spaced by the terrain's own talkativeness — **woods every 8.0 s, farm every
13.0 s**, measured. A standing train still gets one long bed, which is the other
half of the sentence.

That needed a new field: segments carried `speaks` as a BOOLEAN — the coin, not
the odds — so reading it would have given every terrain the same gap. The
planner now carries `talk` beside `speaks`.

### A chair holds two players

> *"the diddly and contrabasson should both be playing, this is ORCHASTRAL!"*

The doubling engine was complete and argued — Berlioz's unison-before-octave,
Rimsky-Korsakov's spacing law barring the tenor from octaves, the inferior
dynamic level, partners drawn only from instruments whose declared range
contains the line — and its own comment admitted *"not drawn anywhere
automatically"*. This genre now declares the vocabulary in `form.double`.

Over 12 records, chairs carrying two instruments:

```
bass: contrabassoon + washtub  x2      <- the pairing he named
bass: contrabassoon + wurly    x2      7 of 12 records have a two-player bass
bass: contrabassoon + horns    x2
counter: diddley + horns       x2
counter: diddley + fiddle      x1
```

### Every sound is on a fader — checked, not read

`harness/probe_sfxdesk.js`. For every role the record contains: render it alone,
then render it with its own strip muted through `MK2.setMixer`. **0 faults, 13
roles**, including `engine`, `pass`, `station`, `scene` and `weather` — and
pulling one fader moves no other part (±0.00 dB).

So *"the SFX is not connected on the mixer"* is **not true of this build**. The
strips exist and work; what was wrong is that they were inaudible, which was the
levels. **#117 remains open for what it actually asks** — RACKS, front panels
with knobs like the drone rack has. That is not the same thing as a fader.

**And the guard that should have said so was green for three wrong reasons.**
`probe_faders_down.js` hardcoded the six-genre file, composed `synthwave` (a
deleted genre), and took the first 12 seconds flat — on a record that opens in a
rail yard with the train standing and no drums. It rendered silence and reported
that pulling the faders down made it silent. All three are fixed.

---

## 6. THE FAULT THIS REWRITE EXISTS FOR — HALF FIXED, HALF PINNED

### Fixed: the material never developed across the record

`demand === "vary"` read `sec.fn === "verse" ? "Avar" : "Bvar"` — two SECTION
NAMES standing in for two materials. This genre has no "verse", so every repeat
took the else branch and a `roll` whose material was **A** came back as a
variation **of something else**, and then stayed that one for fifteen minutes.

```
before   leg 0  roll=A     open=A     high=B     brake=A
         leg 1  roll=Bvar  open=Bvar  high=Bvar  brake=Bvar
         leg 2  roll=Bvar  open=Bvar  brake=Bvar
         leg 3  roll=Bvar  open=Bvar  arrive=B

after    leg 0  A, A, B, Avar, A
         leg 1  Avar, Avar, Bvar, Avarlift, Avarlift
         leg 2  Avarlift x3                   <- furthest from home
         leg 3  Avar, Avar, Bvar, Avar, B     <- home key for the arrival
```

Two questions, separated, each answered by the fact that decides it: **how often
have we heard this** → the variant (occurrence); **how far from home are we** →
the key (the leg). They compose, and the last leg drops the lift so the arrival
is in the key the record opened in. That is the brief's *"the last leg rhymes
with the first"*, and it is a return rather than a repeat because the band is at
its fullest by then.

Bars by material, seed 1: Avar 26% · Avarlift 23% · C 19% · A 16% · Bvar 9% · B 7%.

### Still open: the 8-bar theme is a 2-bar cell tiled four times

```
material A, 8 bars, 12 notes, 4 distinct pitches
  1 |*---...*--......|  D#5 C#5
  2 |*---............|  G#4
  3 |*---...*--......|  D#5 C#5      <- bar 1 again
  4 |*---............|  G#4
  ...
  8 |*---............|  F#4          <- the only bar that differs
```

**And it is not following its own harmony.** The progression is
`[0,0,10,10,0,0,5,0]`, so the chord CHANGES at bar 3 — and the melody plays the
identical `D#5 C#5` over it. `materialBars: 8` buys eight bars of grid and two
bars of music.

That is inside the theme builder (stage 3, the `BARS` / `CH(set, b)` loop), not
in the form, and it is **task #147** with the fix in two parts: the melody must
read the chord under THIS bar, and the builder needs a pitch-variety floor
across `materialBars`. Judge it by note print — "4 distinct pitches" is a shrug,
the tiling above is a verdict.

---

## 7. WHERE WE ARE GOING, IN ORDER

1. **The materials.** Music composed per leg rather than one cell replayed. A
   theme that is re-orchestrated per leg and **grows** across the record; the
   last leg plays it whole and rhymes with the first. This is §6.
2. **The seats.** `keys2` writes 48 events against `keys`' 2,711 and is silent
   in every mix window — a declared chair that does not play. Eight seats are
   declared and five sound (#145).
3. **The SFX on the mixer**, with faders like every other part (#117). The
   owner cannot reach the channels that exist.
4. **The train's ground** — per section, not per loop (#144). The drone is
   silent in any section missing an 8-bar loop boundary.
5. **The tie runs before the spread**, so a pad can never be tied (found this
   build, small).
6. **The harness.** It still tests five genres against a snapshot that no
   longer means anything. Rebuild it to test one genre properly.
7. **The visualiser** — a live pixel-art side-scroller above the piano roll:
   the train in profile, the band aboard with the players who are sounding
   animated, parallax landscape, day/night from the record's own clock, weather
   from its own draw. A station sprite must arrive within a beat of the brake
   sample.
8. **The album of three** — 60 minutes as three 20-minute songs that are one
   long ride.

---

## 7a. THE SHEETS ARE THE SOURCE. READ THEM.

`docs/genre-research/boxcar-synth.md` — all 1,161 lines — is what this genre
is. §4 the conductor's language · §4a the stop is a script (twelve numbered
steps) · §4b the route · §4c the trip planner · §4d the levels · §5 dark to
light · §6 the scene material · §7 the hobo band · §8 the era's decay · §8c the
night (researched, not built) · §9 the plan of record and the six corrections ·
§10 what is still open.

Then `modal-jazz.md` (the parent, and §4's staleness measurements),
`playing-the-hobo-band.md`, `the-bow.md`, `the-washboard.md`,
`washtub-bass.md`, `banjo-and-harmonica-notation.md`, both audit sheets,
`score-craft.md` §7–§8.

**A table written from the section headings was deleted for being one.** The
sheets specify the stop, the route and the planner in detail; anything built
without reading them is a re-invention of something better.

## 8. HOW TO WORK ON THIS

- **`node harness/mk2_notes.js --seeds 12 --genre boxcarsynth`** is the test
  that decides it. It prints the journey, the pace, the form with instruments
  per section, the tune bar by bar, every instrument that sounds, and the SFX
  named. A person reads it and says whether it is music.
- **Watch every guard fail before trusting it.** `probe_tempo` and
  `probe_journey` were each run against 4 and 8 deliberately broken builds. One
  break that *passed* proved a `legBars` the code computed and never read —
  dead code, deleted. A green probe nobody has seen go red proves nothing; this
  repo once shipped a silent instrument with a green battery behind it.
- **Measure, do not reason.** Every number in this document came from running
  something. The two worst mistakes in this project's history were both a
  measurement that was never taken.
- **Research every time, with named sources.** Mark unsourced choices
  `[CHOSEN]`. The tempo band is derived from 39-foot jointed rail; the washtub's
  decay is `[CHOSEN]` and says so.

### Sheets to write from
`boxcar-synth.md` (founding), `playing-the-hobo-band.md`, `the-journey.md`,
`the-clock.md`, `the-bow.md`, `the-washboard.md`, `washtub-bass.md`,
`banjo-and-harmonica-notation.md`, `development.md`, `score-craft.md` §7–§8.

### The A/B record
`docs/genre-research/v2/BEFORE-boxcarsynth-v1.txt` — twelve seeds of V1,
printed. The build that made it is published at
`https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`.
That artifact is the **six-genre** program, not this file. Nothing from
`Boxcar Synth.html` has been published, and nothing should be until it makes a
sound.
