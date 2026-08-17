# THE CLOCK — tempo as a function of position, `2026-08-17`

*The owner, on what V2 is: "The train ride is the conductor, it is what sets the
pace, it is what tells the orchestra where it is."*

Setting the pace was the one thing the program could not do. This sheet is the
first step of the V2 build: the engine capability everything else sits on.

---

## 1. WHAT IT WAS

**One number for a whole record.** `chart.tempo` was drawn at stage 1 and true
from the first bar to the last. Every place that turned a bar into a second
multiplied by it:

```
tSec: (bar * STEPS + n.step + micro) * spb
```

**Nineteen hand-written copies of that multiplication in the performance stage
alone**, and more in the motion plan, the MIDI export, the piano roll and four
separate transport readouts. So "the tempo may change here" was not a sentence
anyone could add without finding all of them — which is the same defect shape
this file keeps catching elsewhere, a fact with no owner and several copies.

---

## 2. WHAT IT IS

**`makeClock(chart, form)` — the one place a bar becomes a second.**

| | |
|---|---|
| `at(bar, steps)` | seconds at a position; `steps` may be fractional (micro-timing) or outside the bar (an ending reaching past the last one) |
| `barAt(sec)` | the inverse — for the playhead, the roll, a section lookup |
| `stepAt(sec)` | the same in steps, because that is the unit stage 6 counts in |
| `stepSec(bar)` | how long a step lasts **there**, which is what a duration wants |
| `barSec(bar)` | and a bar |
| `tempoAt(bar)` | the bpm there, for the readout and the .mid's conductor track |

### 2a. THE CONSTANT CASE TAKES THE CLOSED FORM, AND THAT IS NOT AN OPTIMISATION

Accumulating N equal bar lengths and multiplying by N give **different doubles**.
A clock that always accumulated would have moved every note in every record by
a few microseconds — ten genres' worth of snapshot, changed by a refactor that
was supposed to change nothing.

With no map declared the clock returns `(bar * STEPS + steps) * spb`, character
for character what the code it replaces computed. The prefix sum exists only for
a record that varies, where it is also the numerically stable way to do it.

**This was measured, not assumed.** `probe_tempo` was run against a build whose
clock accumulated, and it **diverged from the shipped arithmetic by bar 6**.

---

## 3. WHAT A GENRE DECLARES

```js
form.tempoArc: {
  by:   { <section function>: [multiplier at its first bar, at its last] },
  ease: "cos" (default) | "lin",
}
```

A function the table does not name holds 1.0 for its whole span, so a genre
naming one section leaves every other bar exactly where it was. **No genre
declares one today**, which is why every record in the file is bit-identical
after this change.

### 3a. MULTIPLIERS, NOT BPM — AND THE RECORD DOES NOT GET LONGER

The map is normalised so the mean seconds per bar is the one the drawn tempo
gives. **An arc redistributes time; it does not add any.**

That is not a convenience. `chart.wantBars` is computed at stage 1, before form
exists and therefore before any arc does. A map that changed the total would
make the length dial miss by whatever the arc averaged, and nothing downstream
could tell. Normalised, "four minutes" is still four minutes and the arc can be
as steep as the genre likes.

It also makes the declared numbers relative by construction, which is the honest
way to write them: **a stop is 0.6 of cruise, whatever cruise turned out to be on
this seed.**

The scale factor is the mean *reciprocal* of the multipliers, because a
multiplier is a rate and the time it costs is its reciprocal.

---

## 4. WHAT WAS ROUTED THROUGH IT

- **Stage 5** — every note's `tSec` and `durSec`; the four micro-timing amounts,
  which are declared in seconds and become a fraction of *this bar's* step; the
  section edges; the drone cut; the ribbon gesture; the doubling window; the
  legato bar cap, twice; the trip planner's whole itinerary
- **Stage 6** — `motionAt`'s step lookup and the hand modulators', so a
  sample-and-hold cannot slip off the music; the drone rack's bar index
- **The .mid** — a tick is a *musical position*, so it is `barAt(sec) × beats ×
  PPQ` rather than seconds read back through one tempo, and the conductor track
  carries a tempo meta at every bar the map changes. Verified byte-identical
  across 40 exports before and after.
- **The MIDI clock out** — tick *n* is the time of beat *n*/24, asked of the
  clock. Still `t0 + f(n)` rather than accumulated, so it cannot drift.
- **The piano roll and the held ghost** — bar lines, note widths, section
  markers and the playhead
- **Four transport readouts** that each had their own copy of "which bar is it"
  — now one `songBar(t)`

### 4a. TWO PRE-EXISTING COPIES FOUND ON THE WAY

Both harmless today and both were the start of a drift:

- the drawn-doubling window kept **its own** seconds-per-step and its own copy
  said `/ 4` — the "four sixteenths to a beat" the metre work removed everywhere
  else. Every genre is 4/4 today, so the two agreed.
- the motion plan's gesture windows used a **literal 16** for steps per bar.

---

## 5. WHAT IS NOT ROUTED, AND WHY

- **`plan.spb`** survives as the record's *mean* step, and a few places still
  take it: the echo's tempo-synced division (set once for the song), the drone
  voice's free-running LFO periods, and a half-step slack tolerance at a join.
  None of them place or measure anything.
- **`chart.wantBars`** is still computed from the flat tempo, which is correct
  precisely because the map is normalised (§3a).

---

## 6. THE GUARD

`harness/probe_tempo.js`, in the battery. **No genre declares an arc, so the
probe declares one itself** — on whichever section function the genre uses most,
so it names no genre and no section and keeps working when a table is rewritten.
It writes to the live `GENRE` table and puts it back.

Five claims: **inert** (with none declared, every bar boundary bit-identical),
**varies**, **ramps rather than steps**, **length unchanged**, and **the bars
themselves take the time the map says** — then the arc is removed and every note
must be back on the same double.

**Watched failing against four deliberately broken builds**, each caught by the
claim meant for it:

| broken | caught by | how badly |
|---|---|---|
| normalisation removed | LENGTH | the record grew by up to **79 s** |
| the ease turned into a step | RAMPS | 0 ramped, 4 stepped |
| the clock made blind to the map | NOTES MOVE | no bar changed length |
| the clock accumulating bar lengths | INERT | **differs by bar 6** |

The last one is the reason §2a is written the way it is.

---

## 7. AND IT IS VISIBLE IN THE PRINTOUT

`harness/mk2_notes.js` — the V2 acceptance test — prints **THE PACE**: the bpm
range and a bar-by-bar trace of the whole record, plus each section's tempo at
its first and last bar. A record at one tempo says so in one line rather than
drawing a flat graph.

---

## 8. WHAT THIS DOES NOT DO

It makes a varying tempo **possible**. It does not make one **happen**: the arc
that matters — accelerating out of a station, cruising, braking into the next —
is a fact about **legs**, and legs do not exist yet. That is the next step, and
when it lands the tempo arc becomes a leg's property rather than a section
function's.
