# HANDOFF — BOXCAR SYNTH, ITS OWN PROGRAM

```
BRANCH   claude/code-review-6jd9cz
REPO     github.com/danoc505/DeckardsMusicBox
FILE     Boxcar Synth.html          <- THIS IS THE PROJECT
GENRE    boxcarsynth2               <- the only genre in it
```

**Do not work on `Deckards Orchestrator MK2.html`.** That is the six-genre
program this was copied from. It still exists, it still has boxcar synth V1 in
it, and it is the published artifact — but nothing in it is being developed.
Every change goes in `Boxcar Synth.html`.

**The filename has a space in it.** Quote it in every command:

```sh
node harness/mk2_notes.js --seeds 12 --genre boxcarsynth2 --file "Boxcar Synth.html"
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

### The journey — a second stage 2, and now the only one
`makeJourney(chart)` lays out legs, the stops between them, the handover, and
`ridePos[]` — **where the train is, per bar**, 0 at the platform behind, 1 at
the one ahead, −1 while standing. Everything about pace and seating reads that.

Measured: `5:00 → 1 leg, 10:00 → 2, 20:00 → 4, 40:00 → 8`, within 4% of the
length asked for.

### The genre — `GENRE.boxcarsynth2`, authored not inherited
Not one line of the V1 table was copied and not one line was edited; V1 was
deleted whole. Facts that were measured correctly are **re-declared with their
sources**.

Its section vocabulary: `yard roll open high brake solo dance pullout arrive`.
**These are labels, not a theory change** — `high` is a chorus doing a chorus's
job, `open` is a verse doing a verse's job. Sections, materials, harmony and
energy are unchanged and stay unchanged.

### The deletions
| | |
|---|---|
| lofi, synthwave, vgm, dungeon synth | 4,397 lines |
| boxcar synth V1 | ~1,600 lines |
| **the grammar walk** | **652 lines** |

The walk was the limit. Laws of succession, a plan of phases, a bisection search
over section lengths, a drawn energy arc — all of it for building a song, and
nothing here builds one. `makeForm` now dispatches to the journey or **throws**;
there is no fallback to a shape this file does not have.

**40/40 seeds compose.**

---

## 5. WHAT IS BROKEN RIGHT NOW

All diagnosed. None fixed. **The file is worse before it is better and that is
deliberate — nothing here is hidden.**

1. **No train sounds at all.** The SFX tables — the trip planner, the station
   script, the weather, the atmosphere — lived on V1's table and went with it.
   Re-declare from `boxcar-synth.md` §4, §4a–§4d, not from git.
2. **The engine is silent on the open road** (task #144). The drone material is
   ONE note, `{bar:0, step:0, dur:128}` — written per **material cycle**, so
   whether the train sounds in a section depends on where that section falls
   against an 8-bar loop. Measured: silent in `roll` and `open`, present in
   `high`, `brake`, `pullout`. **The fix is per-SECTION, not more notes.**
3. **The band is 5 at cruise where 8 seats are declared** (task #145). The shape
   is right — 2.3 at a stop, 1.7 at a solo, so it genuinely thins — the size is
   not.
4. **THE MATERIALS ARE UNTOUCHED, AND THEY ARE THE WHOLE POINT.** See §6.

---

## 6. THE FAULT THIS REWRITE EXISTS FOR, STILL UNFIXED

The owner's founding complaint was **stale repetition**. Measured on V1:

| | |
|---|---|
| the cell is 4 bars and comes round | **43.3 times** in a 173-bar record |
| verses perfectly periodic — the same 2 bars, 4× | 38 of 60 |
| the tune | 14 notes, **3.7 distinct pitches** — fewest in the file |
| content | flat from six minutes on: replayed, not re-composed |

**All of that lives in stage 3, the materials. Every hour of this rewrite so far
has gone into stage 2, the form.** The journey reorders the rooms in a house
whose problem is the furniture. Play the current build for twenty minutes and it
is still the same eight bars, forty-three times.

**If you do one thing next, do this one.**

---

## 7. WHERE WE ARE GOING, IN ORDER

1. **The materials.** Music composed per leg rather than one cell replayed. A
   theme that is re-orchestrated per leg and **grows** across the record; the
   last leg plays it whole and rhymes with the first. This is §6.
2. **The train's ground** — per section, not per loop (#144).
3. **The SFX tables** — the journey has to be audible (§5.1).
4. **The seats** — terrain and `ridePos[]` decide who is playing (#145).
5. **Finish the cutting** — the blend (it averages two genres; there is one),
   the unreachable rigs and voices, the sample banks nothing reads.
6. **The harness.** It still tests five genres against a snapshot that no longer
   means anything. Rebuild it to test one genre properly.
7. **The visualiser** — a live pixel-art side-scroller above the piano roll: the
   train in profile, the band aboard with the players who are sounding animated,
   parallax landscape, day/night from the record's own clock, weather from its
   own draw. A station sprite must arrive within a beat of the brake sample.
8. Rename the file's title/UI, publish, stamp.

---

## 7a. READ THE SHEETS FIRST. BEFORE WRITING A LINE.

This is not a suggestion and it is written from a failure.

`GENRE.boxcarsynth2` was authored having read the founding sheet's section
HEADINGS and about a hundred of its 1,161 lines. The owner asked, plainly,
*"have you read the docs on what this genre is?"* — and the honest answer was
no, not properly. It shows: the table declares a stop ceremony without having
read §4a, which is the stop script; a terrain walk without §4b, which is the
route; SFX pools without §4c, which is the trip planner.

**The failure pattern of this whole project is building before understanding.**
Do not repeat it. Read these end to end, then write:

| sheet | what is in it |
|---|---|
| `boxcar-synth.md` | **all 1,161 lines.** §1 the parents · §2 the one law: MOVEMENT · §3 the train is the drummer, and the tempo is its speed · §4 the conductor's language · §4a the stop is a script · §4b the route · §4c the trip planner · §4d and then it all drowned the band · §5 dark to light · §6 the scene material · §7 the hobo band · §8 the era's decay · §8c the night (researched, NOT built) · §10 what is still open |
| `playing-the-hobo-band.md` | who is in the band and how each one is played |
| `the-bow.md` | the fiddle — and §8a, "every check passed while it was broken" |
| `the-washboard.md` | the three real scrapes, and how the take is chosen |
| `washtub-bass.md` | the bass, and the measurement that justified it |
| `banjo-and-harmonica-notation.md` | the roll, the fifth string, the reed |
| `boxcar-audit.md`, `boxcar-audit-2.md` | what an audit missed that an ear caught in a minute |
| `development.md`, `score-craft.md` §7–§8 | how a hook is developed; how a score is orchestrated |

### What is understood so far, so it can be corrected rather than assumed

- a subgenre of dungeon synth out of comfy synth and dinosynth; the imagined
  past is the American railroad, 1880s–1930s
- **the one law is MOVEMENT** — dungeon synth stands still in a place, this
  passes through places. The materials repeat; the landscape around them
  changes. Variation lives in TEXTURE, never in note-churn.
- the train is the drummer and **the tempo is its speed**: 39-foot jointed
  rail, clicks/min = mph x 2.256, and the truck's two axles are a FLAM
- **in town the track rhythm STOPS** — a standing train has no clicks, and the
  drums' silence is structural rather than an effect
- the train's own sounds are genre material, not decoration
- dark to light: the key and tone move to mark the passage of time
- the record is a journey of legs divided by stops, the lead handed over at each

**Everything below §4 of the founding sheet is unread and therefore unverified
in the table as it stands.**

## 8. HOW TO WORK ON THIS

- **`node harness/mk2_notes.js --seeds 12 --genre boxcarsynth2`** is the test
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
