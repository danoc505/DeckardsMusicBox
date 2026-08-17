# MODAL JAZZ — and whether boxcar synth should take any of it

*Researched 2026-08-16. The owner: "I need you to do web research on modal
jazz. We are trying to decide if we should incorporate the ideas of modal jazz
into our boxcar genre. We need to have key change mode change chord progression
change or something. **The songs can feel stale.**"*

> **THE BRANCH IS `claude/code-review-6jd9cz`.** Everything below was measured
> against the program on that branch at build `2026-08-16a`.
>
> **NOTHING HERE HAS BEEN JUDGED BY EAR** — same standing caveat as
> `boxcar-synth.md`. The numbers say what the machine does. They do not say
> what it sounds like, and the owner is the only one who can.

---

## 0. THIS QUESTION HAS BEEN ASKED HERE BEFORE, AND HALF-ANSWERED

`static-harmony-and-evolution.md` opens with it, verbatim:

> *"What can we learn from **modal jazz** in regard to the evolution of a
> song?"* — the owner

That sheet listed **five gaps**. Item 1 was "the mode never changes inside a
song", which became `key-shift.md` and shipped, built from two Miles Davis
tunes. Items 2–5 became `call-and-response.md`, a phase-relationship gap that
is still open, `bass-roles.md`, and a counterpoint list.

And in `breaking-the-rule.md` the owner ranked modal jazz as the **largest**
thing in the file still unbuilt:

> *"Jazz breaks the rules, **modal jazz is its own thing because it didnt
> fallow the rules**."* — classified there as `modal jazz | functional harmony
> as a system | THE SYSTEM`, fifth of five to build, "**no research yet, and
> it is the largest**."

**This sheet is that research.** It is written to answer a decision, not to
authorise a build.

---

## 1. WHAT MODAL JAZZ ACTUALLY IS — the mechanism, not the vibe

Modal jazz "makes use of musical modes, often **modulating among them**...
instead of relying on one tonal center used across the piece" [Wikipedia].
The move came from Miles Davis's own complaint that jazz was becoming
**"thick with chords"**, which was "stifling melodic improvising"
[Milestones sources].

The mechanism is one trade, made deliberately:

| bebop / functional harmony | modal jazz |
|---|---|
| several chords a bar | **one mode held eight bars or more** |
| motion comes from the cadence — the ii–V–I pulling home | motion comes from **the mode changing**, and from everything that is not harmony |
| the scale is chosen to fit the chord | the chord is a **colour on the scale** |

> "Modal jazz sustains a single chord or mode for extended periods — often
> eight measures or more, creating a significantly slower harmonic rhythm."

**And its founder said the failure mode out loud.** This is the single most
useful sentence in the whole search, because it is the owner's complaint
in the composer's own mouth:

> **"[Modal jazz] would get monotonous if you'd sit there a long time."**
> — Miles Davis

So modal jazz is not a cure for staleness that you bolt on. It is a genre that
**has the same disease boxcar synth has**, and the devices below are the
things its players did about it. That is the right way to read this sheet.

---

## 2. THE FOUR DEVICES, SOURCED

### 2a. THE MODE CHANGE ITSELF — "So What" and "Milestones"

Already researched in `key-shift.md` and already built. Restated here only so
the sheet is readable on its own:

| | tonic moves | mode | notes the two scales SHARE |
|---|---|---|---|
| **Milestones** (1958) | +2 (G→A) | Dorian → Aeolian | **6 of 7** — nearly invisible |
| **So What** (1959) | +1 (D→E♭) | Dorian → Dorian | **2 of 7** — a jolt |

"So What" is 32 bars AABA: **16 bars of D Dorian, 8 of E♭ Dorian, 8 of D
Dorian.** "Impressions" is the same tune's changes. Both **come back**;
neither leaves and stays gone.

**The B section is 8 bars of 32 — 25% of the form — and it is played on every
chorus of a ten-minute performance.** That number matters below.

### 2b. FLAMENCO SKETCHES — A ROUTE OF MODES, WITH NO BAR COUNT

This is the device this repo has never looked at, and it is the one that fits
boxcar synth's architecture exactly.

> "**a series of five scales, each to be played as long as the soloist wishes
> until he has completed the series**" — Bill Evans, original liner notes

The five, in order: **C Ionian · A♭ Mixolydian · B♭ Ionian · D Phrygian ·
G Dorian.** No predetermined number of measures on any scale; each soloist
"calls" the change to the band when he is ready.

Two things to read off that:

1. **The form is a SEQUENCE OF MODES, not a chord chart.** The piece's
   identity is the itinerary. That is a different object from AABA.
2. **Its lengths are free.** Players in practice settle into fours and eights,
   but nothing in the composition says so. The scales are laid end to end and
   the performance is played *against* them.

### 2c. NAIMA — THE PEDAL, WITH THE HARMONY MOVING ABOVE IT

Coltrane, 1959. "**an exercise in extended pedal-point**", and explicitly
described as influenced by the *Kind of Blue* sessions.

> "chord colour changes over the same bass note — the A parts over an **E♭
> pedal**... a series of major-seventh chords over a sustained pedal tone,
> with the upper harmony shifting above it"

Named in the sources as "Coltrane's brilliant solution to one of the major
dichotomies of modern jazz — **how can you create a piece of music that is
interesting harmonically but does not tie the hands of improvisers with
complex changes.**"

**That is the exact dichotomy boxcar synth is in**, phrased by somebody who
solved it in 1959: the ground must not move, and the record must not be one
chord.

The repo already has half of it. `dungeon-synth-arrangement.md` names the two
shapes it lacks — "an **inverted pedal** is a pedal in a voice other than the
bass; a **double pedal** is two held notes, commonly a fifth apart" — and
`bass-roles.md` carries the corrected definitions ("an ostinato developing on
top of a pedal").

### 2d. THE CHARACTERISTIC NOTE — a mode change nobody hears did not happen

A mode is identified by **one degree**, and if that degree does not sound, the
change is theoretical:

| mode | the note that makes it that mode |
|---|---|
| **dorian** | the **natural 6** — "the characteristic note of Dorian... which distinguishes it from Aeolian"; and dorian "**has no avoid notes**" |
| **phrygian** | the **♭2** — "sounds Spanish" |
| **lydian** | the **♯4** — "this is what distinguishes it from the major scale" |
| **mixolydian** | the **♭7** — the folk dominant that pulls nowhere |

This is the quality gate on every device above. `key-shift.md`'s own
Milestones row — dorian→aeolian, **6 of 7 notes shared** — is *one note* of
difference, and that note is the characteristic 6. If the writing never lands
on it, a Milestones-class shift is inaudible by construction.

### 2e. AND WHAT WE ARE NOT TAKING — quartal voicings

The "So What chord" is three stacked perfect fourths plus a major third, and
when the tune moves to E♭ Dorian "**the pianist plays the exact same voicing
shape a half-step higher**" — planing a shape rather than re-voicing a chord.
"Maiden Voyage" is the same family: sus4 chords, no thirds, deliberate
ambiguity.

**Excluded on the owner's instruction (2026-08-16): structure only, not
voicing.** Recorded here so the omission is a decision and not an oversight,
and because the repo argues both sides and will otherwise re-litigate it:

- **Against** — `raw/overworld-and-materials.md`: "Get the open-country colour
  from the MELODY generator (favour leaps of P4 and P5 in the tune) rather
  than from stacking fourths in the chord. Cheap and **it avoids the muddy
  'quartal pad' cliché**."
- **For** — `raw/ds-research-2026-08-06.json`: "Quartal harmony is described as
  sounding open and ambiguous specifically because it is built on 4ths not
  3rds, and **simultaneous 4ths were heard as consonant in the Middle Ages** —
  a theory justification for the genre's third-avoidance." Open fifths and
  organum are the *parent* genre's identifying sound [dungeon-synth.md §4].
- **And it is absent everywhere**: `bladerunner.md` #6 — "**NO SUS / ADD9 /
  OPEN-FIFTH / QUARTAL VOICINGS AT ALL.** chordTones produces triads and
  sevenths, full stop... the machinery is simply absent for every genre."

So it is a real option with real support, it would be a new machine rather
than a table entry, and it is deferred rather than refused.

---

## 3. BOXCAR SYNTH IS ALREADY A MODAL RECORD — which changes the question

Before deciding what to import, here is what the genre already is, read off
its own table (`Deckards Orchestrator MK2.html:28880`):

| modal jazz's premise | boxcar synth today |
|---|---|
| modes, not keys | `modes: [["dorian", 5], ["minor", 3], ["mixolydian", 2]]` |
| no functional cadence | folk shuttles only — i–IV, i–♭VII; no V–I anywhere |
| slow harmonic rhythm | **two bars a chord** |
| a pedal under it | ⚠ **NO LONGER TRUE — see §3a** |
| the scale moves, rarely | `keyShift: { chance: 0.65, by: [[0,6],[2,2],[5,1]], change: 0.8 }` |

**The genre does not need modal jazz's harmony. It already has it.** What it
does not have is what modal jazz's players did about §1's monotony. That
reframes the owner's question from *"should we incorporate modal jazz"* to
*"we are already there, and we have the disease Miles named — which of their
remedies applies."*

### 3a. ⚠ THE PEDAL ROW WAS TRUE WHEN IT WAS WRITTEN AND IS FALSE NOW

That row read *"`bassStyle: "drone"`, plus the train as the `drone` role"*, and
**both halves have since stopped being pedals** — separately, each for a good
reason, neither noticing what the pair of them was holding up:

- **`bassStyle: "pulse"`.** The washtub sheet is right that this instrument is
  *"a propulsive root-note bass line ... a percussive, thumping rhythm"*
  [washtub-bass.md §1; corpus:grokipedia], and a sustained washtub measured 38 dB
  under the lead. Correct change. It also means the bass no longer holds
  anything: **mean note 1.45–2.99 s, longest 6.1 s** over 8 records.
- **`drone: { unpitched: true }`.** The train's written note *"only nudges its
  playback rate, because a train is in no key"* — also correct, and also the end
  of the pedal. Measured, seed 1: the drone is **18 events, 50.2 s each, ONE
  distinct pitch for the whole record** — a textbook pedal by every structural
  test, rendered as a locomotive, so nothing about it is heard as a pitch.

**MEASURED, 8 records.** What survives is real and is not a pedal:

```
   the tonic pitch class is sounding somewhere    75.1% of the record
      of which: keys 71.9%   drone 74.4% (unpitched)   bass 28.7%   ostinato 29.6%
   time on the tonic CHORD in the verse            52%
   distinct chords in a whole 20-minute record      6.9
   the lift returns to the home key                 7/7 records that draw one
```

So the *home* is intact — the harmony is modal, the ground is 6.9 chords in
twenty minutes, and the lift comes back the way "So What" comes back. What is
gone is the **held note underneath it**. The tonic is present because the comp
keeps voicing it, not because anything is standing on it.

**And the voice that would move above a pedal is empty.** `keys2` — the second
pad, the Naima part — writes **0 events in 7 of 12 records**, 48 events a record
on average. §7 item 3 is the one recommendation of the four that was never
built, and in the meantime both of the things it needed have been removed or
have gone silent. That is the honest reading of "boxcar synth is already a modal
record": it is modal in its harmony and it no longer has the ground.

---

## 4. THE STALENESS, MEASURED

Three measurements, all read-only, all reproducible.

### 4a. ⚠ THE FIRST READING OF THIS WAS WRONG, AND THE PROBE WAS THE REASON

**Written first, and retracted below.** `node harness/probe_static.js
boxcarsynth 24` reported:

```
  HOW MANY DIFFERENT BARS  123.8 distinct pictures in 178 bars
  LONGEST UNCHANGING RUN   1.0 bars  ·  commonest bar is 2% of the record
```

and this sheet concluded from it: *"124 distinct bar-pictures in 178 bars, and
no bar ever repeats twice running. Whatever is stale, it is not the texture."*

**Then the owner, who had listened, said the loop keeps returning — and he is
right.** `probe_static`'s "picture" is
`cast + material + loopBar + cycle%2 + degree`, and **`cast` is the set of
roles sounding in the bar**. On a record whose parts thin, rest and drop by
design, the cast changes nearly every bar, so a four-bar cell played
forty-four times reports as a hundred and twenty-four different bars. It was
measuring **instrumentation churn** and this sheet read it as musical variety.

The repo's own rule, `harness/README.md`: *"When a measurement surprises you,
suspect the measurement first."* It surprised me, I believed it over the ear,
and the ear was right. `harness/probe_repetition.js` is the replacement; it
never looks at the cast.

### 4a-ii. WHAT ACTUALLY COMES BACK — `probe_repetition.js`, 24 seeds

```
  THE CELL     4.0 bars long, in a 177.7-bar record  =  44.4 TIMES ROUND
```

**A four-bar cell, forty-four times.** That is the ceiling on everything, and
no amount of dropout moves it.

Per part, hashed on note content alone — pitch and onset step, gain and
duration excluded — against dungeon synth beside it:

| role | boxcar: distinct bars | **each heard** | dungeon synth | **each heard** |
|---|---|---|---|---|
| ostinato | 23.5 of 158 sounding | **×6.7** | 33.6 of 132 | ×3.9 |
| keys | 22.8 of 172 | **×7.5** | 24.9 of 104 | ×4.2 |
| lead | 29.6 of 138 | ×4.7 | 25.6 of 93 | ×3.6 |
| **keys2** | **1.7** of 41 | **×24.4** | 4.8 of 71 | ×14.6 |
| bass | 14.7 of 98 | ×6.6 | 12.5 of 95 | ×7.5 |
| counter | 2.0 of 8 | ×4.1 | 2.6 of 7 | ×2.8 |

**On every part but the bass, boxcar synth repeats itself more than the genre
it is a subgenre of** — the banjo roll 72% more, the first keyboard 79% more.

**And `keys2` is the single worst number in the genre: 1.7 distinct bars,
played twenty-four times each.** The second keyboard — the choir pad, the
thing holding the harmony under everything — is one bar of music for eleven
minutes.

The ~23 distinct ostinato bars are not 23 ideas. They are **five materials
(A, Avar, B, Bvar, C) × a four-bar cell**, plus the lift's copies. So what the
ear is given is five four-bar loops, each played four times inside its own
section, in sections that themselves recur. That is exactly "the same loop
keeps returning", and it was audible long before it was measurable.

### 4a-iii. AND IT DOES NOT BUILD — the arc is declared and not played

Same probe, seed 1, the declared `section.energy` against what was performed:

| | boxcar synth | dungeon synth |
|---|---|---|
| notes/bar across the body sections | **12.6 – 14.8** | 8.8 – 14.8 |
| range | **2.2** | **6.0** |
| roles sounding, first body section → last | 7 → 6 | **4 → 7** |
| an intro ramp | often no intro section at all | 0.8 → 2.5 → 11.4 → 14.5 notes/bar |

Boxcar's declared energy moves 0.33–0.72 across the record and **the
performance does not follow it**: every section except the bridge and the outro
plays between 12.6 and 14.8 notes a bar. The one thing that does move is the
mean note level, creeping 0.383 → 0.517 monotonically over eleven minutes —
which is precisely the shape `how-a-drone-evolves.md` §6b measured nobody
hearing.

**The record declares an arc and plays a flat one.** That is the owner's third
complaint, and it is a different defect from the first two.

### 4b. AND THE HARMONY IS TWO CHORDS

`node harness/mk2_roll.js <seed> --genre boxcarsynth --song`, seeds 1–12:

| seed | key | THE WHOLE RECORD'S CHORDS | bars | lift fires |
|---|---|---|---|---|
| 1 | C# dorian | C#m · F# | 152 | yes |
| 2 | D dorian | Dm · G | 176 | yes |
| 3 | C dorian | Cm · F | 176 | yes |
| 4 | A# minor | A#m · G# | 168 | **no** |
| 5 | F# minor | F#m · D · E | 160 | yes |
| 6 | G mixolydian | G · F | 184 | yes |
| 7 | F dorian | Fm · A# | 192 | yes |
| 8 | A mixolydian | A · G | 160 | **no** |
| 9 | F# dorian | F#m · B | 176 | yes |
| 10 | F dorian | Fm · A# | 168 | **no** |
| 11 | E dorian | Em · A | 176 | **no** |
| 12 | B mixolydian | B · A | 192 | **no** |

**Eleven of twelve records contain exactly TWO distinct chords.** One contains
three. The mean record is 173 bars — about eleven minutes.

Seed 4 in full: `A#m A#m G# G#`, for 168 bars, with the bass holding A#1 as a
whole-note pedal in every bar of every one of them.

That is not "modal". "So What" is two modes in 32 bars and moves every chorus.
This is **one mode and one neighbour chord for eleven minutes**, which is the
thing modal jazz's players were working against, not the thing they made.

### 4c. THE TOWN — THE PAYOFF — HAS NO CHANGES OF ITS OWN

The single number in this sheet:

| `CHORUS HAS ITS OWN CHANGES` | |
|---|---|
| **boxcar synth** | **0 / 24 records** |
| **dungeon synth** — boxcar's own parent | **24 / 24 records** |

**Boxcar synth is harmonically flatter than the genre it is a subgenre of.**

The cause is one absent table. `chorusProgressions` is declared by exactly two
genres in the program (`:24969`, `:27391`) and boxcar synth is not one of
them, so `:31450` falls through:

```js
  const chorusChords = G.chorusProgressions ? mkChords(chorusDegrees) : chords;
```

And in this genre the chorus **is the town** — `material: { chorus: "B" }`, the
payoff section, the one that does not carry the `drone` role, the one the trip
planner puts a platform at. So the arrival, the thing the whole journey is
for, lands on **the identical two chords as the countryside the train just
crossed**.

### 4d. AND THE PROGRAM ALREADY DIAGNOSED THIS, FOR THE OTHER GENRE

The comment introducing `chorusProgressions` (`:31429`) is the owner's 2026-08-16
complaint, written down some builds earlier about dungeon synth:

> *"Read off the roll, and it is the answer to **'it's too static for far too
> long'**: B KEPT A'S BASS, A'S DRUMS AND A'S CHORDS — verbatim, the roll
> prints IDENTICAL three times — so the only thing that ever changed between a
> verse and a chorus was the TUNE. In a genre where the tune is the quietest
> part and the chords hold whole bars, **that is a ten-minute record with one
> four-bar loop in it.**"*

Dungeon synth got that fix. **Boxcar synth was founded afterwards and never
declared the table.** This is the same class of defect as `boxcar-synth.md`
§10 item 2 — not a level this time but a *capability*: something correct
elsewhere that the newest genre silently does without.

### 4e. AND A STATED INVARIANT IS FALSE FOR THIS GENRE

`:37092`, choosing which sections play the lifted (key-changed) copy:

> *"B, Bvar and the bridge are left exactly as they were, so a record whose
> middle is a chorus simply does not move, **which is honest — the departure
> it already has is the chorus's own changes.**"*

That justification is **true for dungeon synth and false for boxcar synth.**
Boxcar's chorus has no changes of its own, so a boxcar record whose middle
third lands on a town gets neither the lift nor a chorus departure. It gets
nothing. Five of the twelve seeds above show no lift.

This is a correctness finding, not a taste call. It is the same shape as the
§4d level bugs: a claim that was true when written, made false by something
underneath it moving.

### 4f. THE ONE HARMONIC EVENT FIRES ON THE WRONG CLOCK

`keyShift`'s lifted copy plays in sections whose midpoint falls in a
**structural** window (`:36787`):

```js
    return mid >= 0.40 * TOTAL && mid < 0.67 * TOTAL;
```

`TOTAL` is a bar count. Meanwhile the genre's own brief says the key change
**is the clock**:

> *"a change in key and tone to show the change of time from dark to light"*
> — the owner's design brief, `boxcar-synth.md` §5

And the trip planner already owns a real clock — `TRIP.hour0`, `TRIP.hours`,
`DAWN`, `DUSK` (`:37905-37910`), on a seconds timeline. **The two never
meet.** The record's dawn and the record's key change are unrelated events
that happen to occur in the same song. §5 of the founding sheet is, in the
strict sense, not built — the machinery exists, and it is aimed at the bar
count instead of at the sun.

### 4f-ii. AND THE CLOCK COULD NOT CARRY IT ANYWAY — measured

Rewiring the lift to the clock is not enough, because **the clock as declared
does not put the sun anywhere useful.** The trip draws
`startHour: [4.5, 2.5]`, `hours: [5, 6]`, `dawn: 6`, `dusk: 20.5` — so a
record departs between **04:30 and 07:00** and runs **5 to 11 hours**,
arriving between 09:30 and 18:00. Over 100,000 draws of that arithmetic:

| | |
|---|---|
| records that cross **dawn** | **59.9%** |
| records that cross **dusk** | **0.0%** |
| records with **no light event at all** | **40.1%** |
| when dawn does happen, its position in the record | **median 0.093**, 90th pct 0.185, max 0.297 |
| dawns landing in the current lift window (0.40–0.67) | **0.0%** |

Three things follow, and they are all facts about the founding brief rather
than about the code:

1. **Two records in five have no sunrise.** They depart after dawn and arrive
   before dusk, so "dark to light" has nothing to attach to.
2. **No record has ever reached dusk.** The latest possible arrival is 18:00
   against a dusk of 20:30, so the brief's "some travel into night" — the
   lonesome half of the bittersweet centre — is **unreachable by
   construction**, and always has been.
3. **When the sun does come up it comes up nine percent in**, before the
   record has established anything for it to change.

So Phase 2 is two jobs, not one: aim the lift at the clock, **and give the
clock a sunrise worth aiming at.** The cleanest way round is to stop drawing
the departure hour and then seeing where dawn falls, and instead **draw where
in the record the light changes and derive the departure hour from it** —
which is the same "plan the trip first, then play the record against it" move
the SFX planner already makes [§4c of the founding sheet], applied one level
up. A record then departs at ~02:45 for a 6-hour run and meets the sunrise in
its middle third, which is what the brief has said since the beginning.

**One cost, stated rather than buried:** a mid-record dawn makes NIGHT a real
half of the record instead of a first tenth, and `boxcar-synth.md` §8c already
records that night currently means only "no birds". It is not silence — `open`
and `river` carry no `day: true`, so wind and water sound at night and only
`farm` and `woods` go quiet — but it is sparse. That raises the value of the
owl and the two cicadas [§8c, task #101] and raises the cost of not having
them.

---

## 5. AND THE PLANNER HAS NO MUSICAL AUTHORITY AT ALL

Asked directly by the owner ("Are we preplanning a route and using it to
create the sfx"). **Yes, and it is real work** — `trip:` at `:29232`, the
planner at `:37864-38038`: stations, terrain legs drawn as a weighted Markov
chain, lengths in **seconds not bars**, a clock that decides whether birds
sing, weather fronts lying across the line.

**But it is a one-way, SFX-only, throwaway plan**, and four independent facts
say so:

1. **Ordering.** It reads `sections` after `startBar`/`endBar`/`fn` are fixed
   (`:37891`) and places stations *at* payoff sections. The form decides the
   platforms; the plan conforms.
2. **RNG isolation.** `const tr = stream(chart.seed, "trip")` (`:37868`) —
   its own substream under Law 3. It structurally cannot move a musical draw.
3. **Scope.** `TRIP` and `ROUTE` are block-scoped consts, gone at `:38168`.
   Neither is attached to `song`. `probe_route.js` has to re-derive the whole
   itinerary from `song.perf.events` because **the plan no longer exists.**
4. **The one dependency runs backwards.** `ev.halt` — the engine coming off
   the regulator into a platform — is set from the *arrangement*
   (`(nxt.active||[]).includes("drone")`), not from `TRIP.stations`.

So the program plans a journey in seconds, uses it to place birds and rivers,
and throws it away without ever telling the band where the train is.

**That is the opening.** §2b's Flamenco Sketches is a route of modes with
free lengths. `TRIP.segs` is already a route of terrain with free lengths, in
seconds, with a clock. They are the same object. One of them is currently only
allowed to make bird noises.

---

## 6. AND THE LANDSCAPE GETS NO FX AT ALL

Asked directly by the owner ("are we using our fx racks to modulate the sfx").
**Essentially no**, and one part of it is a defect rather than a decision.

A terrain bed, the whole voice (`:16229-16237`):

```
  BufferSource → one Gain, static value → channel → master
```

No filter. No panner. No send. No LFO. **No `P()` call anywhere in `V.atmos`
or `V.weather`**, which is what makes it structural: `motionAt` reads through
`P()`, so no genre can automate these sounds even if it declared lanes for
them.

| | a musical part | a world bed |
|---|---|---|
| voice filter, `P()`-driven | yes | none |
| pan / pan-LFO (`stereoOut`) | yes | none |
| reachable by `motionAt` | yes | **no** |
| a rack machine with `controls` | yes | **no entry at all** |
| **reverb send** | `duck → sendRoom → sendMaster["keys\|Room"]`, open at **1.0** | `duck → sendRoom → ∅` |
| **delay send** | `duck → sendEcho → sendMaster["keys\|Echo"]` | `duck → sendEcho → ∅` |

**The dangling sends are the defect.** `scene` and `weather` sit on the
`vinyl` bus (`:3358`), which is blind-plated out of all six FX columns
(`:3266-3272`) with this reason:

> *"the crackle happens at the stylus, after everything — it never met the
> band, so it has no business in the band's effects."*

That reasoning is **correct for surface noise and wrong for a river.** The
plates were ruled for stylus crackle; `scene` and `weather` were added to the
same bus on 2026-08-15 and silently inherited a decision nobody made about
them. The send gain nodes are built, are fed by `duck`, and connect to
nothing, because `g.sendMaster["vinyl|Room"]` is never created.

Birds, rivers, thunder, station crowds and grade-crossing whistles are
recordings of **places**, and a place is what reverb is for.

**Two more, for the record:**

- **"The passing" is nine hardcoded literals** (`:16182-16211`) — `1.04`,
  `0.96`, `900`, `6500`, `-0.85`, `0.85`, `0.35`, `0.28`, `0.72`. Not
  parameters, not controls, not knobs. Every river crossing in every record
  does precisely the same thing. (Distinct from task #95, which is about the
  envelope finding the peak; this is about it being unreachable at all.)
- **The train is the sole exception, and it proves the rule.** `trainbox` gets
  six motion lanes and reaches the reverb — *because it was moved off the
  world bus and re-declared as an instrument* [§3a of the founding sheet].
  **The train has effects; the landscape it is passing through does not.**

---

## 7. THE RECOMMENDATION

**Take modal jazz's structure. Do not take its sound.** [owner's instruction,
2026-08-16: structure only.] Boxcar synth is already modal (§3); what it is
missing is the anti-monotony craft, and every device below is one this genre
can hold without sounding like jazz for a bar.

Ranked by value over cost. **None of this is built. All weights below are
[CHOSEN] and nothing has been heard.**

### 1 — THE TOWN GETS ITS OWN CHANGES  ·  smallest change, largest effect

Declare `chorusProgressions` on `boxcarsynth`. The mechanism exists, ships,
and is measured at 24/24 on the parent genre; this is a table entry, not a
machine. It closes §4c, and it retires the false invariant at §4e by making
its premise true.

The departure should be a **modal** one, not a functional one — the town is
somewhere you arrive, so the ♭VI or the IV held long, never a V–I. Boxcar's
`bridgeProgressions` are the right shape to copy from.

**Cost:** one table. **Blast radius:** nil — "the draw runs either way [Law 3],
on its own named substream", so no other genre moves a note.

### 2 — THE LINE PLANS THE MODES  ·  Flamenco Sketches, and the genre's own §5

Give `TRIP` musical authority for exactly one thing: **the mode and the moment
it changes**. The planner already knows the hour; let the dark→light lift fire
**at the trip's dawn** instead of at 0.40 of the bar count (§4f). A record that
departs at 04:30 and runs into the morning brightens **when the sun comes up
on its own clock**, which is what the owner's brief asked for and what the
program does not currently do.

This is the Flamenco Sketches move fitted to the existing architecture: the
itinerary is laid out first and the record is played against it, exactly as
§4c of the founding sheet already argues for the SFX.

**Cost:** real. `TRIP` must be computed *before* the materials rather than
after, or the clock must be derived early and handed to both. §5's ordering
proof is also the list of what has to change. **This is the one item here that
is a design change and not an addition**, and it should be planned on its own
before anybody writes it.

### 3 — THE PEDAL WITH SOMETHING MOVING ABOVE IT  ·  Naima

Boxcar has the pedal twice over — the bass drone and the train — and nothing
moving above it. The named missing shapes are already written down in
`dungeon-synth-arrangement.md`: the **inverted pedal** and the **double
pedal**. §2c is the argument that this is the device that buys harmonic
interest at zero cost to the ground, which is the exact constraint a genre
whose ground is a locomotive is under.

**Cost:** moderate — this is a bass/keys writing change, not a table entry.

### 4 — AND WHATEVER MOVES, LAND ON THE NOTE THAT PROVES IT  ·  §2d

A dorian→major lift that never sounds a natural 3, or a mixolydian section
that never sounds its ♭7, has changed nothing an ear can hear. Given
`keyShift`'s `by: [[0, 6], ...]` — **weight 6 on a ZERO-semitone shift** — the
boxcar lift is usually *mode-only*, same tonic. That is `key-shift.md`'s
Milestones row taken to its limit: the most invisible setting the dial has.
It is the right choice for this genre and it makes §2d **mandatory rather than
nice**, because the characteristic note is then the *only* evidence the change
happened.

**Cost:** small, and it should be measured rather than asserted —
`probe_theory.js` reads notes against chords already.

### WHAT NOT TO DO

- **Do not add chords.** Miles went modal because jazz was "thick with chords".
  Going from two chords to six would fix the boredom by breaking the genre;
  every sheet in this folder from `dungeon-synth.md` to `how-a-drone-evolves.md`
  says the ground must not move.
- **Do not solve it with a slow filter sweep.** `how-a-drone-evolves.md` §6b
  measured this: listeners missed a **three-semitone** pitch change in
  continuous speech nearly 50% of the time. "**Music that must be heard to
  evolve evolves in steps.**" A mode change is a step. A sweep is not.
- **Do not touch the texture engine.** §4a says it is working.

---

## 7a. WHAT PHASE 1 BUILT — the town leaves home

Shipped: `chorusProgressions` on `GENRE.boxcarsynth`, four rows a mode across
dorian, minor, mixolydian and major.

**The shapes are not dungeon synth's.** That table's rows come home inside
themselves (`[5,5,0,0]` is bVI-then-i). These mostly do not, because the owner
put the return at the section boundary rather than inside the section:

> *"the road is the tonic; the town is where the harmony departs from it, and
> **pulling out of the station is the return**."* — the owner, 2026-08-16

Which is also what the source does. "So What"'s B section is eight bars of
E♭ dorian that never touches D, and the return **is** the A section arriving.
The chorus here is 8 bars against a 4-bar cell, so a row is heard twice and
then the verse comes home.

Three rules the rows obey, and the third was a defect caught in the first
draft:

1. **A third from home, not a step** — III and VI keep two of the tonic's
   three notes [the common-tone arithmetic at the head of `progressions`].
2. **No V–I anywhere.** The plagal IV does the arriving; mixolydian's v stays
   minor. A town is somewhere you arrive, not something that resolves.
3. **Every row contains a degree the road cannot reach.** `progressions`
   touches only {0,3,5} in dorian, {0,5,6} in minor, {0,3,6} in mixolydian,
   {0,3,4} in major. The first draft's dorian row `[3,3,0,0]` is therefore
   **the road's own two chords rotated**, and seed 1 duly printed a road of
   `C#m C#m C#m F#` against a town of `F# F# C#m C#m` — a new section on paper
   and the same harmony to an ear. Both offending rows were rebuilt on III
   and vi. **Checked over 60 seeds: 0 towns add no new chord, 0 towns have no
   changes, 0 towns sit wholly inside the bridge's set.**

### And it moved much more than the chorus

Because `:31440` gives a declaring genre's chorus **its own bass and figure**
as well as its chords — "new chords under the old root would be the harmony
moving while nothing else does, which is half a change" — one table entry
reduced repetition across the whole record. `probe_repetition.js`, 24 seeds:

| | before | after | dungeon synth |
|---|---|---|---|
| chorus has its own changes | **0/24** | **24/24** | 24/24 |
| distinct chords in the whole record | 4.8 | **6.0** | 4.5 |
| ostinato — distinct bars / each heard | 23.5 / **×6.7** | **36.3 / ×4.4** | 33.6 / ×3.9 |
| keys | 22.8 / ×7.5 | **31.1 / ×5.5** | 24.9 / ×4.2 |
| keys2 | 1.7 / ×24.4 | **2.3 / ×17.4** | 4.8 / ×14.6 |
| the ground, distinct bars | 139.1 | **146.3** | 125.9 |

**The banjo roll went from being heard 6.7 times a bar-idea to 4.4** — a 34%
cut in repetition from a table entry, and it now sits close to the parent
genre's 3.9. That is the cheapest change in this whole sheet and it moved the
most.

**The bass did not move at all** (14.7 distinct, ×6.6, identical). That is
correct rather than broken: `bassStyle: "drone"` pedals the tonic, and a pedal
does not care what is above it. What it means is that the town's departure is
happening **over a held tonic** — III/i and VI/i rather than a moved floor —
which is Naima's device [§2c] arriving by accident. Whether the ground should
move under a town too is now a real question and is not answered here.

**And `keys2` is still the worst number in the genre**: 2.3 distinct bars,
heard seventeen times each. Phase 1 barely touched it. That belongs to
Phase 3.

## 7b. WHAT PHASE 2 BUILT — the lift is the sunrise

Three changes and one guard fix.

**1. The clock moved to the chart, and it is drawn backwards.** `chart.clock`
is computed in `makeChart` on its own `stream(seed, "clock")` substream, and it
draws **where in the record the light changes** first, then derives the
departure hour from it. Both consumers read the one object: the key lift in
stage 4 and the landscape in stage 5. The planner's own two draws are gone —
"a second clock for one more number is how the two get out of step" is the
lesson the medium already taught this file [founding sheet §8b].

**2. The lift window follows it.** `mid >= CLK.at * TOTAL` replaces
`mid >= 0.40 * TOTAL && mid < 0.67 * TOTAL` **for genres that declare a
trip only**. Minimal techno and dungeon synth keep the structural window
exactly.

**AND IT DOES NOT COME BACK — a deliberate break with the sources.**
`key-shift.md` §1 says of "So What" and "Milestones": *"Both come back.
Neither tune leaves and stays gone."* A sunrise does not come back. The record
after the light changes stays changed, because a journey from dark to light
**arrives somewhere else rather than returning home**, and the outro belongs
on the far side of the change. Recorded as a decision, not an oversight.

**3. The direction follows the sun.** Wiring the lift to the clock left one
thing incoherent and the guard printed it: with a quarter of records now
crossing dusk, `probe_journey` still read *"16/17 records moved into a brighter
mode"* — records whose sun was going down were brightening. The lift's mode is
now filtered to brighter-than-current at dawn and darker-than-current at dusk,
ranked by the third and the sixth (the same ranking the probe uses, so the
check and the thing checked agree on the word).

### Measured, 60 seeds

| | before | after |
|---|---|---|
| records with **no light event at all** | **40.1%** | **0** |
| records crossing **dusk** — "some travel into night" | **0.0%** | **25%** |
| where the light change lands | median **0.093**, max 0.297 | median **0.49**, range 0.34–0.61 |
| key lift **built** | 16/24 | 38/60 (63%, declared 65%) |
| key lift actually **played** | — | **38/38** |
| share of the record's bars in the new mode | — | 39% |

And the direction, over 120 seeds: **dawn records that brightened 47/47**;
**dusk records that darkened 16/23**. The seven that did not are records
already in `minor` — the darkest mode boxcar's `bridgeProgressions` contains —
so they hit the documented fallback rather than losing the lift entirely. That
is honest and it is also an open item: the genre has no mode darker than
aeolian to travel into, and phrygian is sourced for the parent [§1 of
`dungeon-synth.md`]. Adding it means adding it to `progressions`,
`bridgeProgressions` and `chorusProgressions` together, so it is not a one-line
change and it is not done.

### Two guards went red, and only one of them was the program

`probe_journey.js` was 11/11 at build `2026-08-16a` and dropped to 9/11 the
moment the clock change re-dealt the terrain. **Both had been passing by luck
rather than by construction**, which is the useful part.

- **A grade-crossing bell landed on a platform.** The signal group spans 6.2 s
  from the first blast to the bell, and it was placed a flat 35% into its
  terrain segment — so on any segment shorter than about 9.5 s the bell fell
  past the end of the leg, and the bell carries `pass: true`, so what it
  produced was **a doppler sweeping past a standing train**. The river six
  lines below already carried this exact guard — *"the crossing FITS INSIDE
  ITS OWN SEGMENT"* — and it had never been applied to the signal. Fixed in
  the program; the draw still happens where it did [Law 7], only the emission
  is suppressed. **0 passes in a town, over 25 records.**
- **The probe named a sample that does two jobs.** It found the departure
  engine with `firstIn(scene, /Depart|Peep/, A - 40, A)` — the first match in a
  forty-second window — but `railPeep` is the departure engine **and** the
  genre's grade-crossing `shortWhistle`. Seed 2 reported "engine 260.19"
  against a call at 280.4: the engine was exactly where the script puts it
  (`A - 1.6`) and the probe had found a crossing thirty seconds earlier. Fixed
  in the **probe** — the engine is now searched from the guard onwards, which
  is where the script actually puts it. `harness/README.md` already names this
  class: *"Anything that LISTS what the program contains will go stale."*

`probe_journey` 11/11, `probe_route` 6/6.

## 7c. WHAT PHASE 3 BUILT — a second cycle on every moving lane

**The notes were deliberately not touched, and that is the argument.**
`dungeon-synth-critique.md` is explicit that this family's best practice
"varies TEXTURE around few notes", and that adding and redistributing notes is
*"precisely the 'simplistic, not simple' failure the critics name"*. The
owner's own rule 5 says the same thing from the other side: "marked by its
movement, not its stale repetition, **but the texture varied is something we
do want**". So the four-bar cell stays four bars and stops **sounding** the
same instead.

`materialBars: 8` was the obvious alternative — the mechanism exists, one genre
already declares it, and a 4-chord progression wraps under an 8-bar material so
the harmonic rhythm would not have changed. It would have halved the 44
repetitions to 22 at a stroke. **Rejected on the repo's own critique**: it is
exactly the "add notes" move that sheet condemns. Recorded here so the owner
can overrule it, because it is the single biggest available lever on the raw
repetition count.

What was built instead is `how-a-drone-evolves.md` §4's **#2 of nine ranked
mechanisms**, and the same sheet's POSTSCRIPT P.1 measured that this genre did
not have it:

> "one LFO of 71 bars is a shape and an ear learns a shape; two free-running
> cycles of 71 and 23 bars sum to a composite that does not come round until
> bar 1633" — and, measured: **"plastikman stacks two LFOs of different
> periods on 35 of 77 lanes; dungeon synth on 0 of 118."**

**Boxcar synth was on zero.** Six lanes now carry a second, faster, co-prime
cycle at a shallower depth — the banjo's pick (the roll is 92% of the record),
the slide's scoop, the train's level and filter window, the choir pad's
ensemble and choir, and the keys' room send. Every period is prime so no pair
can share a factor, and `freePhase` stops them starting together. `motionAt`
sums a lane's moves, so this is a table change and nothing else.

| | before | after | plastikman |
|---|---|---|---|
| lanes with two or more cycles | **0 of 24** | **6 of 24** | 35 of 77 |
| as a share of lanes that cycle at all | **0%** | **46%** | 45% |

**And `keys2` is why this is the right shape of fix.** It measures 2.3 distinct
bars each heard seventeen times, because the choir pad is one chord a bar over
a two-chord record — its *notes* cannot carry variety however the harmony is
written. It is the exact part the texture-not-notes doctrine was written for,
and it now has stacked cycles on both its lanes.

**`probe_repetition` is unchanged by this phase, and that is correct** — it
measures notes, and this phase moves none. What it changes is whether the same
notes arrive sounding the same, which is the thing no probe in this repo
currently measures. That gap is real and is named in §8.

## 7d. WHAT PHASES 4 AND 5 BUILT — the record builds, the town arrives

### Phase 4 — three declarations this table had never made

The arc was declared and not played [§4a-iii]. The cause was not the arc: it
was that `boxcarsynth` declared **none** of `rest`, `longLoop`, `thinTo` or
`follow`. The file already names that exact syndrome, of a genre since deleted:

> "no `follow`, no `rest`, no `longLoop`, no `thinTo` ... so it changed in
> exactly the same way, which is to say **not at all**."

- **`rest`** is the top-ranked mechanism in this repo's own table — "parts
  entering and leaving", five traditions, all primary. **Not `drums` and not
  `drone`**: in this genre those two ARE the arrangement, and resting either
  would be a false arrival rather than variation. What breathes is the colour.
- **`longLoop`** costs nothing — the variant it alternates to is already built
  and already sitting unused on odd cycles. Its own comment is the owner's
  complaint word for word: *"every part read the same four-bar material on
  every cycle, for ten minutes."*

Measured, 24 seeds, across all four phases:

| role | baseline | after P1 | **after P4** | dungeon synth |
|---|---|---|---|---|
| ostinato (the banjo) | 23.5 / ×6.7 | 36.3 / ×4.4 | **37.0 / ×3.9** | 33.6 / ×3.9 |
| keys | 22.8 / ×7.5 | 31.1 / ×5.5 | **31.4 / ×5.1** | 24.9 / ×4.2 |
| keys2 | 1.7 / **×24.4** | 2.3 / ×17.4 | **2.6 / ×12.3** | 4.8 / ×14.6 |
| lead | 29.6 / ×4.7 | 30.6 / ×4.5 | **28.2 / ×4.1** | 25.6 / ×3.6 |

**The banjo roll went from each bar-idea heard 6.7 times to 3.9 — exact parity
with the parent genre** — and `keys2` from ×24.4 to ×12.3, which is now better
than dungeon synth's ×14.6. And the arc:

| | before | after | dungeon synth |
|---|---|---|---|
| notes/bar across the body | 12.6 – 14.8 | **6.9 – 14.6** | 8.8 – 14.8 |
| **range** | **2.2** | **7.7** | 6.0 |
| roles sounding | 7 … 6 | **3 … 7** | 4 … 7 |

### Phase 5 — the world gets a room, and the town is what opens it

The `scene` and `weather` roles sat on the `vinyl` bus, blind-plated out of all
six effect columns on a ruling made entirely about **stylus crackle**. Their
`sendRoom` and `sendEcho` nodes were built, were fed by `duck`, and connected
to nothing. They now have a bus of their own — `world` — with all seven
crossings and **vinyl's six plates left exactly as they were ruled**.

**It is deliberately not opened flat.** Open country at forty miles an hour has
no room in it; a station shed does. So the crossing starts shut and
`motion.matrix.worldRoom` opens it in the town — which is also the one
direction this genre's sends usually lack, since a declared send starts open
and can only travel down. The band closes its own reverb in the same bar
(`keysRoom` and `leadRoom` both duck in the chorus), so **the town is the one
moment in the record where the world is wetter than the band**.

**⚠ AND WHAT REACHES THAT ROOM IS NARROWER THAN I FIRST WROTE.** `roleOfBed`
returns `"scene"` only for beds whose family starts with `scene`, `"weather"`
for wind/rain/thunder/blizzard, and **`"tape"` for everything else** — which
means the rail one-shots that carry the stop script (`railTown`, `railCrowd`,
`railWhistle`, `railDoors`, the conductor's call) are role **tape**, still on
the `vinyl` bus, still plated. So the town's new reverb reaches the
**landscape** — the country-halt birds, the water, the weather — and not the
station itself.

That is a smaller claim than "the platform opens up around you", and it is the
true one. It also maps cleanly onto §4d-ii's distinction, which the file
already makes in levels and does not yet make in routing: the WORLD is the
countryside, the STORY is the train's own sounds, and only the first of them
has a room. **Routing the story sounds is not done and is now §10 item 18.**

Even narrowed, it is the answer to "the town doesn't feel like arriving":
arriving was defined entirely by things *stopping*. Phase 1 gave the town its
own harmony; this gives it a change of space.

**And the battery caught the cost of the new row within one run.** Adding
`world` created SEVEN crossings, and "every knob the conductor can move is one
some genre moves" went red naming `worldSpring`, `worldFlange`, `worldDP4` and
`worldBarber` — four knobs that move nothing, which is the exact defect
`vinyl`'s own plates exist to prevent. A place can be in a room and can be far
enough to arrive late; it cannot be flanged and stay a place. So Spring,
Flange, DP/4 and Pole are blind-plated for the world with that reason, and Mix
and Echo got lanes that earn themselves: the dry country **recedes** in the
town as the room opens (the same gesture from both sides), and the delay opens
on the night run, because the thing that answers a whistle across open country
is a delay — which is this genre's own phrase for its echo, "the distance down
the line."

Verified live, not merely declared — `probe_section_motion boxcarsynth`:
`matrix.worldRoom chorus −49.1 dB **live**`.

**AND THE BLAST RADIUS IS NOT ZERO, WHICH IS WORTH SAYING PROPERLY.**
`MIX_ROLE_BUS` is global, so every genre's `scene` and `weather` events moved
off `vinyl` with boxcar's. Measured over 6 seeds a genre: boxcar emits 41 scene
and 16 weather events, and **dungeon synth and hobbit synth emit one weather
event each** — the rest of the file emits none.

Those two genres therefore changed bus, and the change is **provably silent**
rather than merely believed to be: a bus is `c.createGain()` with
`gain.value = 1` and nothing else, both rows sit in the MIX column at 1.0, and
the new row's sends arrive CLOSED because neither genre names `world` in
`feeds`. A unity gain replaced by a unity gain, with muted sends beside it.
Stated because "no other genre is touched" would have been the easy sentence
and it is not the true one.

## 9. THE AUDIT — what is hooked up, and what is not

Run across the whole genre after the phases, as asked.

### Clean

| probe | result |
|---|---|
| `probe_reachable` | **"every name the config mentions happens"** — no dead config in this table |
| `probe_rack` | boxcar has **no** silent or wrongly-named lanes (acid, hobbitsynth and bladerunner do) |
| `probe_theory` | **6.3% out of key** against dungeon synth's 8.5%; unisons **2.6%** vs 4.9%; chord-under-bass **0.0%** — cleaner than its parent |
| `probe_journey` | **11/11** |
| `probe_route` | **6/6** |
| the MIDI export | 9 tracks, format 1, 960 ppq, tempo 82.0 correct; every part's durations sane — pad 3.6 beats, ostinato 0.5, drums 0.25, bass an 8-beat pedal, drone 64 beats |

### Found and fixed this session

1. **Two section moves were automation of nothing.** `probe_section_motion`
   measured `matrix.leadRoom` in the **intro at −88.2 dB** and `echo.verb` in
   the **bridge at −63.9 dB** — both INERT, because the bus they ride is silent
   in that section. Both entries deleted.
2. **The world's reverb and delay sends terminated in nothing** — §7d above.
3. **A grade-crossing bell could land on a platform** — §7b.
4. **`probe_journey` identified the departure engine by a sample name that does
   two jobs** — §7b.
5. **A KEY CHANGE THAT CHANGED NO NOTE.** Found by reading the exported MIDI
   across the lift boundary, which is the only reason it surfaced at all.
   Boxcar draws `by: [[0, 6], [2, 2], [5, 1]]` — **weight six on a
   zero-semitone move**, because for this genre the device is the parallel
   minor→major, same tonic. Against `change: 0.8` that left
   0.667 × 0.2 = **13% of lifts moving the tonic by nothing and the scale by
   nothing** — a whole lifted copy of the record's material identical to the
   original. Seed 1 read `C# D# E F F# G# A# B` on both sides of its own key
   change. **And no guard could see it**: `probe_journey` asks the
   DECLARATION whether the key changed, not the notes. Fixed by forcing the
   mode to change when the tonic does not; the draw still runs [Law 3] and is
   overridden only in the case where obeying it produces silence. No other
   genre can reach the line — neither minimal techno's `by` nor dungeon
   synth's contains a zero. **After: 84 of 84 lifted copies differ from their
   own unlifted twin, note for note, over 120 seeds.**

   This is §2d — the characteristic note — arriving as a bug rather than as
   advice. A mode change that never sounds the degree that distinguishes the
   mode has not happened, and the same is true one level up: a key change that
   moves neither tonic nor scale has not happened either.

### Found and NOT fixed — recorded rather than quietly carried

1. **`space.feeds: ["keys", "lead"]` is a no-op in every genre in the file.**
   `routeBaseFor`'s Room case opens `keys` and `lead` **by name**, before it
   consults `feeds` at all. Eleven genres carry those two words as inherited
   decoration. Harmless, and it means the declaration lies about what decides
   the routing.
2. **The SPRING column is used by zero of eleven genres** [`probe_wiring`: "0
   <<< NOBODY USES THIS"]. A whole effect unit, built and reachable, that no
   table has ever fed.
3. **`trip.startHour` is now dead for boxcar synth**, superseded by
   `chart.clock`. Kept only as the fallback for a caller with no clock, and
   said so in the comment — but nothing in this genre reads it any more.
4. **The declared peak and the dynamic peak are different sections.**
   `form.energy.chorusPeak: 0.72` is the highest number in the table, but the
   chorus is the town — no drums, no train — and `motion.trainbox.level` puts
   the train's own maximum in the **bridge** (`[0.18, 0.38]`). The table says
   the climax is the last town; the automation says it is the night run. Both
   are defensible and they are not the same claim. The genre comment already
   half-concedes it: "arriving is a relief and not a climax".
5. **`probe_modulation`'s FREE metric is not a usable proxy for the stacked-
   cycle device.** It counts lanes whose autocorrelation never exceeds 0.60,
   and it scores **plastikman — this file's own exemplar of the technique, at
   35 of 77 lanes — at ZERO**. Boxcar reads 1 of 25. So the device is in (6 of
   24 lanes carry two cycles, up from none) and the metric that would confirm
   it *works* is measuring something else. No claim is made on FREE.
6. **THE COUNTER PLAYS TWO NOTES IN A 152-BAR RECORD** — seed 1, track 5 of
   the exported MIDI, and nothing but reading the MIDI would have shown it.
   `probe_rack`'s "composed and never sounding" list cannot catch it because
   the lane does sound; it sounds twice. Measured across 24 seeds it is 5.7
   sounding bars of 177 — about 3% of the record.

   **Phase 4 briefly made it worse and that is worth admitting**: the first
   draft rested the counter at 0.30, taking 30% off a part already measured in
   single figures. A rest is a hole in something continuous, and a hole in
   something absent is nothing. Removed.

   The sparsity itself is older than this build and is NOT fixed here.
   `counter.density` is 0.2, and `call-and-response.md` §5 already made the
   same complaint about the same lane: *"a device that fires in one bar in
   fourteen is a long way from So What, where the answer is half the melody."*
   Which is this sheet's own subject arriving from a third direction — the
   modal jazz answer to a static harmony is that the parts talk to each other,
   and in this genre one of them barely speaks.
7. **`keys2` can vanish from a whole record.** Seed 1's MIDI has eight tracks,
   not nine — the second keyboard never sounds. That may be a legitimate
   arrangement (a part is allowed a night off) or the `rest` weight compounding
   with an already-thin lane. Unmeasured either way, and stated rather than
   assumed benign.
8. **Nothing here has been judged by ear**, which outranks all of it.

## 7e. THE OWNER'S REAL QUESTION, AND THE ANSWER THIS SHEET WAS MISSING

*[owner, 2026-08-16, after every phase above was built and the record still felt
stale: "I think the problem is fundamental to the architecture of the program,
something deep inside is limiting what we can and can not do."* Then, the
question that settles the design: *"How does Modal Jazz solve this issue? How
can Modal Jazz play for 20 mins+ and it's never stale or boring?"]*

He is right, and §8 item 1 below — *"it is possible the answer is 'the harmony
is fine, the arrangement is the problem'"* — was closer than the rest of this
sheet. It is neither. **It is the store.**

### The ceiling, measured

Boxcar synth, 4 seeds a length; distinct bars of note content per role against
bars actually played:

| asked | played | ostinato distinct | keys | lead | ostinato repeat |
|---|---|---|---|---|---|
| 180s | 36 | 20 | 23 | 24 | ×1.8 |
| 360s | 70 | 36 | 35 | 36 | ×1.9 |
| 600s | 124 | 39 | 40 | 43 | ×3.2 |
| 900s | 200 | 38 | 39 | 46 | ×5.3 |
| **1200s** | **270** | **43** | **45** | **53** | **×6.2** |

Playing time grows **7.5×**. Composed content is flat from six minutes — it even
falls, 39 → 38. **A twenty-minute record holds the same written music as a
six-minute one.** Every device in §7a–§7d improves the contents of those forty
bars; not one of them makes more of them.

### Why, in one line

`makePerformance:39096`

```js
const loopBar = (bar - sec.startBar) % materials.bars;
```

**There is no note-generating call anywhere in `makePerformance`.** It reads
frozen arrays and emits events. `makeMaterials` returns a hardcoded literal —
`A, Avar, B, Bvar, C` (+ `Alift`/`Avarlift`) — is called as
`makeMaterials(chart)` and **never receives the record's length**, so it cannot
scale with it even in principle. `makeArrangement`'s own header says *"this
stage never edits a note"*. A 20-minute record is ~650 bars drawn from ~20–40
composed ones: a replay ratio of about **32:1**.

### And modal jazz does not fix that with more material — it has LESS

"So What" is a 32-bar head on two chords. A twenty-minute performance is ~600
bars from 32 composed ones — **a worse ratio than ours.** By the arithmetic that
governs this program, So What should be the most tedious record ever made.

The difference is that those 600 bars are **not a lookup**. Nobody plays the
same bar twice: Miles solos differently every chorus, Evans never repeats a
voicing, Chambers walks a new line every eight bars, Cobb varies every bar. And
§1 of this sheet already carried the proof in the composer's own mouth —

> **"[Modal jazz] would get monotonous if you'd sit there a long time."**

That sentence is not a warning about harmony. It is a description of **exactly
what this program does**: it sits there. Miles named our failure mode and we
quoted him for six sections without noticing he was describing the engine.

So the lesson is the opposite of "compose more blocks":

> **THE MATERIAL IS A CONSTRAINT THAT IS RE-REALISED, NOT AN ARRAY THAT IS
> REPLAYED.**

And this program is already built to do it. `buildOstinato`, `buildBass`,
`buildKeys` and `deriveCounter` all take a `streamName`, so
`buildOstinato("ostinato:c3", …)` yields a different, in-style, fully valid
block on its own substream. **The generators are run once and their output is
looped for twenty minutes.** The arranger even carries an unused indexed-variant
hook already: `if(materials[material + "@" + i]) material += "@" + i;`

### The split that keeps it music

A head that never returns is not a tune, and a rhythm section that never varies
is a drum machine. Modal jazz has both, and so should this:

| role | modal jazz | boxcar | treatment |
|---|---|---|---|
| `lead` | the head | harmonica tune | **replay** — it is the tune, it must return |
| `ostinato` | comping | banjo roll | **re-realise per cycle** |
| `bass` | walking | bass | **re-realise per cycle** |
| `keys` | piano comp | wurly | **re-realise per cycle** |

`makePerformance` already computes the counter this needs, on the line after the
one that causes the problem:

```js
const cycle = Math.floor((bar - sec.startBar) / materials.bars);
```

### What this is NOT

**The dynamics are not flat**, and that is worth stating because the *same*
complaint about drums — *"nothing but the same fucking LOOP!"* — turned out to
be flat accents on music that did not repeat (`:18859`; 118 of 134 bars were
distinct). Measured here: boxcar's ostinato spans **13.8 dB over 248 distinct
gain values**, its lead 4.0 dB, its bass 5.1 dB, against dungeon synth's
ostinato at 2.1 dB. This time the ear and the arithmetic agree, and the notes
really are the same ones.

### 7e-ii. WHAT WAS BUILT — takes, and the ceiling lifts

`materialTakes: { ostinato: 6 }` on boxcar synth. Stage 3 composes **six**
realisations of the banjo roll instead of one — each a full, legal, in-style
8-bar block on its own named substream (`"ostinato:A@3"`), capped by how many
times the material can actually come round. Stage 5 plays take
`floor(bar / materials.bars) % takes.length`.

**The counter it needed was already there.** `makePerformance` computes `cycle`
two lines above the modulo that causes the problem — it was written for the long
loop. Nothing was missing but something for it to point at. (The take index uses
the *absolute* bar, not `cycle`: `cycle` resets at every section boundary, so
with ~16-bar sections it never reaches take 2 and every verse would open on take
0 — a fix that produces a new kind of sameness.)

**The ceiling, after** — same sweep, 4 seeds a length:

| asked | played | ostinato distinct | before | repeat |
|---|---|---|---|---|
| 180s | 36 | **29** | 20 | ×1.2 |
| 360s | 70 | **54** | 36 | ×1.3 |
| 600s | 124 | **86** | 39 | ×1.4 |
| 900s | 200 | **101** | 38 | ×2.0 |
| **1200s** | **270** | **123** | **43** | **×2.2** |

It is no longer flat. The twenty-minute record went from 43 composed bars of
banjo to 123, and from hearing each 6.2 times to 2.2. Per-record:
ostinato 39.2 → **75.6** distinct, ×3.1 → **×1.6**.

**Printed, seed 1** — the same material, four cycles apart:

```
bar  1  verse[A]          C#5 G#5 C#6 C#5 G#5 C#5 C#6 G#5   forward, 2-1-5-2-1-5-2-1
bar 33  instrumental[A]   E5  G#5 E5  G#5 C#6 E5  G#5 C#6   Foggy Mountain, 2-1-2-1-5-2-1-5
```

Before this change bar 33 was byte-identical to bar 1. `C#6` — the fifth string
— is in both, so the drone rides across the takes rather than being redrawn
with them.

**The tune is deliberately NOT in the list.** It is the head; a head that never
returns is not a tune, and modal jazz keeps its head for exactly that reason.
Bass and the wurly comp are the honest next candidates and want a pass that can
widen their reserves properly — every take must be reserved, the way `resA`
already reserves both `keys2A` and `keys2Avar`, or a comp voices onto a seat a
later take is about to want.

### 7e-ii-b. AND THEN THE WHOLE BAND — the owner's follow-up

*[owner: "If the solution was Modal Jazz why isn't the correction genre wide?
Why wouldn't it apply to all instruments in the genre"]*

Fair, and the first pass scoping this to the figure was an implementation-risk
decision dressed up as a musical one. `buildOstinato` takes no `avoid` and no
pinned pattern, so the roll was the one part that could be re-realised without
touching anything else. That is a reason to do the rest carefully, not a reason
to stop.

Now: **`materialTakes: { ostinato: 6, bass: 4, lead: 3, counter: 3 }`**, across
the A family, the chorus (B/Bvar), the bridge (C) and the lifted copies —
because a part is only as un-repetitive as its **thinnest material**, and takes
on the A family alone left the wurly flat whatever the record's length.

Every take is folded into the reserves the first one was in (`placed`, the
keys2 avoid sets, `resA`/`resB`/`resC`), which is the same discipline the file
already applies to `keys2A` and `keys2Avar`. The counter follows its own tune
take-for-take: `deriveCounter` reads the theme's notes, so a counter drawn
against take 0 played over take 2 is a shadow of the wrong line.

The **tune gets fewer takes on purpose** — three against the roll's six. It is
the head; recognition is half of what makes a record a record rather than a
stream, and bar 0 is always take 0, so every record still opens by stating its
tune.

| | 180s | 1200s | played | distinct |
|---|---|---|---|---|
| ostinato | 29 | **128** | ×7.5 | **×4.5** |
| lead | 24 | **60** | ×6.6 | **×2.5** |
| bass | 9 | **24** | ×7.5 | **×2.7** |
| keys | 22 | 45 | ×6.2 | ×2.1 |

### 7e-ii-c. ⚠ AND `keys` COULD NOT USE THEM — a held chord has no second voicing

Declared at `keys: 5`, measured immediately after: **five identical arrays.**

```
A|keys      distinct takes: 1 of 5     ← identical
A|bass      distinct takes: 4 of 4
A|ostinato  distinct takes: 6 of 6
A|lead      distinct takes: 3 of 3
```

This genre's wurly **holds** the progression — `sustain`, one strike at step 0,
duration 16 — and a held chord has no second realisation. The chord is the
chord. Five copies published as five takes is a table shaped like variety
holding a constant, which is the same fault as an accent curve of sixteen ones.

Two consequences, both kept:

1. **`takesOf` now drops identical takes** rather than counting them, so no
   genre can ever publish fake variety. 19 take lists on a 20-minute boxcar
   record, 0 with duplicates.
2. **`keys` is left out of boxcar's declaration**, because a number that cannot
   do anything is dead config and this file does not keep those.

**The real fix for the wurly is not takes — it is that it should COMP.** A comp
has rhythm and inner voices to redraw; a pad has neither. `buildKeys` can
already do both (the bridge pad asks for `sustain`), so this is a genre-table
decision with its own consequences, and it is the honest next question for this
part rather than a take count. The general rule the episode gives:

> **Takes can re-realise a part that PLAYS. They cannot re-realise a part that
> HOLDS.**

### 7e-iii. AND THE CAP IS THE ENGINE'S, NOT THIS GENRE'S

`harness/probe_length.js` measures the slope and is in the battery. Run across
all eleven genres it says plainly that boxcar synth was not special:

| | played over the range | distinct |
|---|---|---|
| **boxcarsynth**.ostinato | ×7.5 | **×4.5** ✓ |
| dungeonsynth.ostinato | ×6.8 | ×1.3 ✗ |
| dungeonsynth.lead | ×6.0 | ×1.4 ✗ |
| dungeonsynth.keys2 | ×7.8 | ×1.1 ✗ |

Every genre in the file is built by the same frozen-material replay. The probe
therefore asserts only on genres that declare `materialTakes` and **prints** the
rest as capped — a battery that is red by design is one people learn to ignore,
and this way the guard extends itself the moment a genre is given takes.

**Why nothing caught this for so long, which is the transferable lesson:** every
other probe in the harness measures ONE record and asks whether it is any good.
All of them are right and all of them were blind here, because a 3-minute boxcar
record at ×1.8 is perfectly healthy. The defect existed only as a *relationship
between records of different lengths*, and nothing was comparing two.

---

## 8. WHAT THIS SHEET DOES NOT SETTLE

1. **No verdict, by ear or otherwise.** Every number here says what the
   program does. Whether an eleven-minute two-chord record is *wrong* is the
   owner's call, and it is possible the answer is "the harmony is fine, the
   arrangement is the problem" — §4a leaves that open.
2. **The quartal question is deferred, not answered** (§2e). The repo has real
   evidence on both sides and it will come back.
3. **Item 2 of §7 is described, not designed.** Moving the trip planner ahead
   of the materials touches ordering, and ordering is where this program's
   worst bugs have lived. It needs its own plan.
4. **The FX findings in §6 are a separate matter from modal jazz** and are
   recorded here only because they were asked in the same breath. The dangling
   `scene`/`weather` sends are the actionable one; they should become a
   backlog item and a guard, not a paragraph in a harmony sheet.
   `probe_deskgraph.js` / `probe_busedge.js` are the natural home for "every
   send gain terminates somewhere".
5. **Nothing here was written to the genre table.** By the owner's instruction
   this pass is research only.

---

## Sources

**Modal jazz, fetched 2026-08-16:**

- [Wikipedia — Modal jazz](https://en.wikipedia.org/wiki/Modal_jazz) — the
  definition and the modulation claim. *Note: the article itself carries a
  banner saying it "is missing information about modulation", and it does not
  cover harmonic rhythm, pedal points, quartal voicings or the Lydian
  Chromatic Concept. Corroborated elsewhere rather than relied on.*
- [Wikipedia — So What](https://en.wikipedia.org/wiki/So_What_(Miles_Davis_composition)) — 16 D dorian / 8 E♭ dorian / 8 D dorian
- [Wikipedia — Milestones](https://en.wikipedia.org/wiki/Milestones_(instrumental_composition)) — the two-mode form, and "thick with chords"
- [Wikipedia — So What chord](https://en.wikipedia.org/wiki/So_What_chord) — three fourths and a third
- [Learn Jazz Standards — What is modal jazz](https://www.learnjazzstandards.com/blog/5-easy-modal-jazz-standards/)
- [Learn Jazz Standards — Stuck on one chord](https://www.learnjazzstandards.com/blog/learning-jazz/jazz-theory/stuck-one-chord-strategies-dramatically-improve-modal-jazz-solos/) — **the Miles "monotonous" quote**, and the asymmetry/melodic strategies
- [New York Jazz Workshop — What is modal jazz](https://newyorkjazzworkshop.com/what-is-modal-jazz/) and [Introduction to modal jazz](https://newyorkjazzworkshop.com/jazz-for-piano/changes/introduction-to-modal-jazz/) — pedal points as "a repetitive anchor"
- [Italian Piano — Flamenco Sketches, modal jazz and open form](https://www.italianpiano.com/monday-notes/flamenco-sketches-modal-jazz-and-open-form/) — the five scales and the open form
- [Kind of Blue and the economy of modal jazz (CORE, PDF)](https://core.ac.uk/download/pdf/20330023.pdf)
- [PianoGroove — Naima tutorial](https://www.pianogroove.com/jazz-piano-lessons/naima-solo-piano-tutorial/) and [New York Jazz Workshop — Naima](https://newyorkjazzworkshop.com/naima/) — the E♭ pedal and the dichotomy quote
- [Wikipedia — Maiden Voyage](https://en.wikipedia.org/wiki/Maiden_Voyage_(composition)) and [Jazzadvice — Maiden Voyage](https://www.jazzadvice.com/jazz-standards/maiden-voyage/) — sus chords, no thirds
- [Jazz Library — 7 modes of the major scale used in jazz](https://jazz-library.com/articles/major-modes/) and [The Music Theory Professor — Modal music theory](https://themusictheoryprofessor.com/modal-music-theory-a-practical-guide-to-dorian-phrygian-lydian-and-more/) — the characteristic notes, and dorian's "no avoid notes"
- [The Jazz Piano Site — Lydian Chromatic Concept](https://www.thejazzpianosite.com/jazz-piano-lessons/modern-jazz-theory/lydian-chromatic-concept/) and [georgerussell.com](https://georgerussell.com/lydian-chromatic-concept) — Russell's vertical/horizontal distinction: the Lydian scale "conveys a state of being", the major scale "a state of becoming". *Read, and NOT built on — it is a theory of improvisation over chords and this program does not improvise.*
- [Jazzadvice — McCoy Tyner and the pentatonic scale](https://www.jazzadvice.com/mccoy-tyner-and-the-pentatonic-scale/) — root-and-fifth left hand as a pedal under fourth voicings

**This repo, cited above:** `static-harmony-and-evolution.md` · `key-shift.md` ·
`breaking-the-rule.md` · `boxcar-synth.md` §3a §4c §5 §10 ·
`dungeon-synth.md` §4 · `dungeon-synth-arrangement.md` ·
`how-a-drone-evolves.md` §6b · `bass-roles.md` · `bladerunner.md` ·
`raw/overworld-and-materials.md` · `raw/ds-research-2026-08-06.json`

**Measured here, 2026-08-16, build `2026-08-16a`:**
`harness/probe_static.js boxcarsynth 24` · `harness/probe_static.js
dungeonsynth 24` · `harness/mk2_roll.js <1..12> --genre boxcarsynth --song`

---

## 10. FRESH RESEARCH `2026-08-17` — WHAT KEEPS A LONG MODAL RECORD ALIVE

*The owner: "We also need to do more research on modal Jazz so we can utilize
it more, it might be the key to having this long songs that tell a story stay
fresh and evolve."*

Fresh search, not a re-reading of §1–§2. The question asked was narrower and
better than the one this sheet asked first: not "what is modal jazz" but **what
does a player DO for fifteen minutes when the harmony has stopped moving.**

### The finding, and it lands on work this repo did today

> "The practical challenge is real: how do you sustain listener interest for 16
> bars over a single scale? **The answer lies in phrasing.** Modal jazz
> soloists learned to build **melodic sentences that breathe, repeat, vary, and
> resolve on their own terms** rather than tracking the harmony."
> [corpus:newyorkjazzworkshop]

And the framing underneath it:

> Traditional jazz requires **"vertical thinking"** — outlining chord changes as
> they occur, measure by measure. Modal jazz demands **"horizontal thinking"** —
> constructing melodic lines within a sustained harmonic environment.
> [corpus:thejazzpianosite]

> "Without harmonic changes to outline, you must generate musical interest
> through **pure melodic invention, rhythmic sophistication, and dynamic
> control**." [corpus:ejazznews]

> Practical strategy: **prioritise asymmetry** — break the monotony by
> introducing surprise and unpredictability. [corpus:learnjazzstandards]

### Why this matters more than it looks

**The sources say the cure for a static harmony is a REPEATING PHRASE, not a
wandering one.** "Breathe, repeat, vary, resolve" is a description of a hook.

That is the exact fault measured and fixed today: boxcar synth's verse had no
repeating cell at all — 0 of 12 materials — while its chorus stated a two-bar
figure four times. The tune wandered for 27 seconds and never said anything
twice. `theme.verseHook` fixed the mechanism; **this sheet is the argument for
why it was the right fix**, and it was arrived at from the opposite direction.

So the two questions the owner has asked across this session — *"do we have a
motif?"* and *"can modal jazz keep a long song fresh?"* — have the same answer.
A modal record does not stay fresh by changing chords. It stays fresh because a
recognisable phrase keeps coming back **differently**.

### WHAT THIS GIVES US THAT IS NOT BUILT

The sources name four levers and this program uses one and a half:

| lever | state |
|---|---|
| melodic development — a phrase that repeats and varies | **half.** `verseHook` restates the phrase. It restates it IDENTICALLY. Nothing varies it. |
| rhythmic sophistication — displacement, asymmetry | **no.** The restatement lands on the same steps every time. |
| dynamic control | partly — the arc moves density, not phrase weight |
| timbre | yes, and it is this genre's strongest suit already |

**The single highest-value next move is that first row.** A hook that returns
note-for-note four times is a loop; the sources are explicit that the return
must VARY. The engine already has `vary()` for materials — what it has no
equivalent of is varying a phrase INSIDE a material: same shape, moved by a
step, or displaced by a beat, or with one note changed.

That is "development", it is §8 of `score-craft.md` from the other side, and it
is what would turn today's hook from a loop into a story.

### Sources

- [What Is Modal Jazz? — New York Jazz Workshop](https://newyorkjazzworkshop.com/what-is-modal-jazz/)
- [Modal Jazz Improvisation & Harmony — The Jazz Piano Site](https://www.thejazzpianosite.com/jazz-piano-lessons/modern-jazz-theory/modal-jazz/)
- [Stuck On One Chord — Learn Jazz Standards](https://www.learnjazzstandards.com/blog/learning-jazz/jazz-theory/stuck-one-chord-strategies-dramatically-improve-modal-jazz-solos/)
- [Modal Jazz: Miles Davis & Scales — eJazzNews](https://ejazznews.com/jazz-education/modal-jazz/)

**What this does NOT settle:** no source found gives a NUMBER — how often a
phrase should return, how far it may move, how long a modal record can hold one
mode before an ear gives up. Those remain [CHOSEN] and should be measured
against the program rather than asserted.
