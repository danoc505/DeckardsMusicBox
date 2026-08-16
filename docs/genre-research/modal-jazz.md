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
| a pedal under it | `bassStyle: "drone"`, plus the train as the `drone` role |
| the scale moves, rarely | `keyShift: { chance: 0.65, by: [[0,6],[2,2],[5,1]], change: 0.8 }` |

**The genre does not need modal jazz's harmony. It already has it.** What it
does not have is what modal jazz's players did about §1's monotony. That
reframes the owner's question from *"should we incorporate modal jazz"* to
*"we are already there, and we have the disease Miles named — which of their
remedies applies."*

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
