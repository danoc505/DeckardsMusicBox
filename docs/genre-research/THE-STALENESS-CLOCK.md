# The staleness clock, and the drift that pays it

*What this settles: the rule of three and the two-loop rule are the same rule,
this program keeps it for the RECORD and breaks it for every PART, and the
thing that would keep it — continuous movement rather than more events — does
not exist in the program at all.*

`THE-ALTERATIONS.md` is the catalogue of ways to restate something without
rewriting it. `BUILDING-THE-ALTERATIONS.md` is the plan for building them.
This is the rule that says WHEN one has to fire, and it is the piece both of
those assume and neither states.

---

## 1. The two rules are one rule, and the sources say so

Both source documents are on `main`, as transcripts, and they are the origin of
the two laws this program already enforces.

**`006 (rule of 3)`** — how many times an idea may be stated:

> "If I say something to you once then it's an idea that you've heard one time.
> If I say it a second time it's reinforcing that idea. But if I say it a third
> time ... in most cases this is where our brain will actually begin to tune it
> out."

> "Repeating something beyond three times is generally speaking over using that
> idea, and actually using it more than two times is overusing it."

**`005 (loops)`** — when the arrangement must move:

> "The rule is that the arrangement has to change every two loops of the chords,
> because our ears naturally expect songs to change every two loops of the main
> instruments, which is usually the chords."

> "The only way to change an arrangement is to add an instrument, or add
> expression to an existing instrument, or remove an instrument, or reduce
> expression of an existing instrument."

`arrange.ts` already says these are the same rule under two names, and it is
right. Two statements, then something moves.

### Two things the sources say that the program does not do

**One.** The two-loop source never says ONE thing changes. In its own worked
example the producer adds the drums at the first boundary, and at the second
adds hi-hats **and** a bigger clap **and** a bass **and** a counter-melody —
four moves in a single two-loop window. The restriction is this program's:

> "What moves at each boundary is one of the two things the rule names: an
> instrument out, or an instrument's expression down. Never both, and never
> everyone at once."
> — `arrange.ts`

**And that comment is now stale, which is a defect by this project's own
rules.** The pool it describes contains `part-back`, `all-back`, `let-out`,
`speak-up`, `full-time` and every treatment — adds, not just removals. The
comment says two ways; the code offers four. Fix the comment when this work
lands.

**Two.** The rule of three counts statements of AN IDEA. This program counts
turns of the loop for the whole record, and then moves one thing — so a part
that is not the thing that moved keeps stating its idea, uncounted.

---

## 2. Where the program actually stands

Measured on ten records — five seeds drawn at random (**14348, 46691, 15876,
11479, 21174**), both genres. Nothing here was chosen to make a point; a seed
you chose is a seed that worked.

### The record keeps the rule. Every part breaks it.

Longest run of identical turns per part — same notes, same manner, same desk,
not held back — counted in each part's own unit of repetition. Two hundred
seeds a genre, and the tool is in the repository:

    node tools/stale.ts lofi,dungeonsynth 1 200

| of that part's runs, three or more turns unchanged | lofi | dungeon synth |
|---|---|---|
| keys | **43%** | **36%** |
| bass | **42%** | **42%** |
| drone | 1% | **20%** |
| lead | 8% | 2% |
| drums (unit: the bar) | 0% | 6% |
| longest observed | 8 turns | **16 turns** |

The first draft of this document said 25–32%. That number came from a script
that counted every part in the loop's unit, drums included, and is not in the
repository; the one above is. The fault is worse than first stated.

The worst case, verified by hand: **dungeon synth seed 83, section 3, bars
48–80.** The loop is 2 bars, the section is 32 bars — sixteen turns. The bass
plays the same two notes all sixteen times. The section has **eight span
boundaries** and the arrangement is busy at every one of them; every single one
spends its change on somebody else. The bass is never hushed, never treated,
never varied, for thirty-two bars.

### Nothing ever moves twice at once

Across the ten random records, **56 span boundaries**:

| | count |
|---|---|
| boundaries where exactly one thing moved | **56** |
| boundaries where more than one moved | **0** |
| boundaries where nothing moved | **0** |

And across two hundred seeds a genre: **2,768 of 2,768.** Not a tendency; a
rule the code enforces.

### The desk is nearly idle

Entries in the record's own desk timeline — every moment it moves a treatment:

| seed | 14348 | 46691 | 15876 | 11479 | 21174 |
|---|---|---|---|---|---|
| lofi | **0** | 1 | 1 | 6 | 2 |
| dungeon synth | 1 | 7 | 4 | 2 | 3 |

**A 52-bar lofi record whose desk never moves once.** A 112-bar dungeon synth
record with two entries. Over two hundred seeds: lofi moves its desk once every
**23 bars** and **43 records of 200 never move it**; dungeon synth once every 22
bars, 7 of 200 never. The one mechanism that could keep a static loop alive is
doing almost nothing, in the genres built around it.

### And when it moves, it is a step

Median bar-to-bar brightness jump, measured off the rendered audio at 22050 Hz,
on a bar the desk changed against every other bar:

| record | on a change | elsewhere |
|---|---|---|
| lofi 21174 | **526 Hz** | 36 Hz |
| dungeon synth 46691 | **432 Hz** | 98 Hz |
| dungeon synth 14348 | **428 Hz** | 44 Hz |
| lofi 15876 | **241 Hz** | 60 Hz |
| lofi 46691 | 15 Hz | 37 Hz |

A treatment is a four- to fifteen-fold discontinuity in one sample. That is not
an accident, it is the design — `render.ts` hard-switches:

> `reachDesk()` sets `this.treatment` and calls `retune()`, which recomputes the
> whole desk. There is no interpolation between two timeline entries anywhere in
> the renderer.

The last row is the honest exception: `wear` is tape and vinyl, so brightness is
the wrong probe for it. Not every treatment is a big step.

### The bar-level rule of three already exists, for one part

The kit's phrase letters, read off the events in a section where the drums
actually play:

```
lofi          AAAB  AAAB  AAAB  AAAB  AAAB      5/5
dungeon synth ABAC  AAAB  AAAB  AAAB  AABC      3/5
```

`A` is the figure, `B` changes one thing about it. Eight of ten records state
the figure three times and answer on the fourth — the default pool is
`["A","A","A","D"]` at 5 and `["A","A","A","B"]` at 3, so this is the program's
dominant behaviour, not an accident of these seeds.

**This is the rule of three at the bar level, already built, already sourced,
and given to nothing but the drums.** MK2 called it by that name:

> "lofi's `flourishBar: 3` states a figure three times and answers on the
> fourth — the rule of three at the BAR level."
> — `docs/genre-research/minimal.md` on `main`

---

## 3. What is missing

### 3.1 A clock that counts per part

The rule of three is about an idea being stated. Every part already declares
what its own unit of repetition is, and `perform.ts` reads it:

```ts
const unit = role === "drums" ? mbar : mbar % loop;
```

The drums repeat by the bar; everything pitched repeats by the turn of the
loop. So the rule reads, in the program's own terms:

> **No part may state its own unit of repetition three times without something
> about that part changing.**

For the kit that is every three bars, which is what the phrase letters already
do. For a two-bar bass loop it is six bars. Same rule, landing on each part's
own grain instead of across it.

At two statements a part is **owed** a change; at three the record **must** pay.
Several parts may be paid at one boundary — the source's own example pays four.

### 3.2 Drift: a treatment that ramps instead of stepping

A clock that demands a change every three statements, paid only in events, on
five parts, is the light show the catalogue warns about:

> "The pool must not simply be drawn from. Sixty-five moves fired at random is
> not an arrangement, it is a light show."
> — `THE-ALTERATIONS.md`

The way this music actually holds a static loop alive is not more events. It is
continuous movement, and the sources for it are already in this repository, in
`NOTES-FROM-THE-USER.md` on `main`:

> "Techno's hypnotic quality comes from automation and modulation rather than
> constant arrangement changes, with filter sweeps, delay throws, and reverb
> sends replacing chord changes and new melodic ideas. **This is how a four-bar
> loop stays interesting for eight minutes.**" — attackmagazine, dub techno

> "Open a low-pass filter by a few percent **each time the loop repeats**, so
> over 32 bars the sound brightens gradually." — musicradar

> "The foundational pattern repeats, but small changes are introduced over time
> — a hi-hat removed every other bar, a filter that opens slightly … the
> repetition creates the groove while the variation sustains interest."
> — izotope

Note the musicradar phrasing: the change is keyed to **the repetition, not the
clock**. That is the same grain §3.1 arrives at independently.

**MKIII has the primitives and not the gesture.** `sweepHz`/`sweepDepth`,
`tape.wowHz`/`wowCents`, `flange.rateHz`, `ensemble.rateHz` are all read every
sample — but every one is a free-running LFO at a fixed rate, which is texture,
not movement. Your own MK2 note diagnoses exactly this:

> "LFO lengths are odd numbers (22, 26, 27, 30, 34 bars). For free-running
> texture that is correct and deliberate; but nothing is *aligned* to 8/16/32
> except the gestures, so there is no 'this move happens every 16 bars' pulse."

So drift is one thing, precisely: **a treatment that interpolates from where the
desk is to where the treatment wants it, across its span, instead of switching
at one sample.** The timeline exists. The targets exist. The renderer already
walks the timeline. What is absent is the ramp between two entries.

A ramping treatment satisfies the clock **continuously**. If the pole is walking
down across 32 bars, that part cannot be stale — not because something happened,
but because nothing is the same bar twice. Events and drift become two ways to
pay one debt, and a long section stops needing many events.

---

## 4. The build, in order

Each step is measured alone, and **the measurement comes first** — the numbers
in §2 were produced by a throwaway script and are not reproducible from this
repository until step 0 lands.

### Step 0 — the measurement, before any behaviour changes

**DONE.** Two tools, split the way the repository already splits them:

- **`tools/stale.ts`** reads the composed record, as `tools/treatments.ts`
  does, because staleness is made of the desk, a part held back and the kit
  in half time — none of which the MIDI file carries. Per part: runs of
  identical turns in the part's own unit, median, p90, max and where it
  happened, share at 3+. Per record: desk-timeline density, and at how many
  boundaries one thing moved, more than one, or none.
- **`tools/measure.ts --sweep <genre> a b --parts`** reads the file, as the
  rest of that tool does: a part's share, its longest absence, whether it
  plays at the end, and whether the most-present part changes between halves.
  That is `HANDOFF.md` item 2, word for word, closed.

And the record's own text and picture now say what the arrangement did.
`src/dump.ts` writes `recast`, `swell` and `manner:<name>` on `#section`, and
`#span` carries `half`, `hush:<part>` and `desk:<treatment>[@part]` where it
carried only `thin`; `tools/FORMAT.md` documents both. `tools/roll.mjs` draws
a held-back part at half weight, half time as a dash, a per-part treatment as
a box, the desk's name under the strip, and a swelling section as a ribbon
that rises. Before this, the dump printed four identical `.` spans for a peak
in which the kit dropped to half time, the lead was hushed and the desk moved
— the file said the section repeated at exactly the moments it changed.

**What said it worked:** `node tools/stale.ts lofi,dungeonsynth --seeds
14348,46691,15876,11479,21174` reproduces every number in §2 — 10 and 17 desk
entries, 56 boundaries all moving one thing, bass 8 turns on lofi 46691 — and
`1 200` gives the table above. `npm run check` clean; `perform.test.ts`, which
counts `#section` lines, passes.

### Step 1 — drift, because it is the payment the clock will need

One field on a treatment saying it ramps, and an interpolation in `render.ts`
between two desk entries. Each genre states its own rate with its own source; a
genre that states none does not drift.

- It must stay a **pure function of absolute time**, or it breaks the existing
  test that a record is byte-identical rendered in 577-sample and 4096-sample
  blocks.
- **`treat.test.ts` will under-report a ramped move.** It measures a treatment
  by rendering it held against an empty desk; a ramp only reaches full value at
  the end of its span, so its measured dB falls and a sound move could drop
  under the floor and be deleted as dead. The floor has to know a ramp from a
  step before any ramped treatment is judged by it.

**What says it worked:** on a record with a ramped treatment, the per-bar
brightness inside its span moves monotonically instead of in one jump — the same
measurement as §2, run inside a span rather than at its edge. And the block-size
test still passes.

### Step 2 — the clock

A per-part counter in the part's own unit. At two statements the part is owed;
at three the boundary must pay it, from the pool, and drift counts as payment
for as long as it is moving. More than one part may be paid at once — remove the
`arrange.ts` restriction the source does not support, and fix the stale comment.

**What says it worked:** runs of 3+ identical turns fall from 25–32%; the
16-turn case in dungeon synth seed 83 is gone; **and every section-level number
is unchanged** — who opens, thinnest, fullest, energy spread — which is the bar
every previous change on this branch had to clear. `stuck` stays 0.

### Step 3 — partial variation, only if the cheap moves run out

When a part has been hushed, treated, re-mannered and drifted and is still on
its fourth identical statement, the only answer left is the notes. That is the
rule-of-three source's own second option:

> "Start the concept the same the third time, but instead go somewhere different
> — maybe halfway through that idea."

Which is `HANDOFF.md` item 7 and Phase 5.1, already queued. **Stop if materials
heard exactly once rises above the 21% it stands at.**

---

## 5. What could make this wrong

**The anticipation problem, and it is in your own notes:**

> "Once listeners begin to anticipate something strange might happen, there
> won't be anything left to surprise them."

A guaranteed change on a fixed count is anticipatable. The guard is that the
*deadline* is fixed while *which* move pays it stays drawn — which is what the
pool already does. If records start sounding metronomic in their changes, this
is the reason and the fix is to make the deadline a ceiling rather than a
schedule: pay it at or before three, not exactly at three.

**Three bars as a global grid was considered and is not what this specifies.**
A fixed three-bar change clock against a two- or four-bar loop is a hypermetric
cross-rhythm, and sustained triple hypermetre is rare and stylistically marked
(Rodgers, MTO 17.1, 2011: *"extended passages of triple hypermeter are
relatively rare; three-bar hypermeasures are not uncommon, but they normally
occur in isolation, not in succession"*). It is also refused by lofi's own
already-cited source (Adams, MTO 26.2: hip-hop loops are *"one, two, or four
measures; exceptions to this are extremely rare"*). Counting in each part's own
unit of repetition gets the same guarantee without cutting across the music.

**Drift may not be audible at the rates a genre would state.** Nothing here has
been heard. `TALLY.md` §0 still outranks every line of this document.

**The repetition law is the thing most at risk.** Huron and Ollen put literal
repetition at about 94% of passages; `perform.test.ts` holds the groove to it to
the microsecond, comparing step, pitch, articulation and played instant. Gain
and the desk are outside that comparison — which is precisely why the
alterations catalogue can pay a staleness debt without breaking it. **Any move
this clock reaches for that touches step, pitch or articulation must still wait
for a section boundary.** That constraint does not relax because the clock is
now stricter.

---

## Sources

Read for this document:

- `006 (rule of 3)` — transcript, on `main`. The rule of three, and its two
  answers on the third statement.
- `005 (loops)` — transcript, on `main`. The two-loop rule, its four ways, and
  the worked example that moves four things at one boundary.
- `docs/genre-research/NOTES-FROM-THE-USER.md`, on `main` — attackmagazine (dub
  techno), musicradar, izotope, and the anticipation warning.
- `docs/genre-research/minimal.md`, on `main` — "the rule of three at the BAR
  level", and the genre that exists to refuse it.
- Stephen Rodgers, "Thinking (and Singing) in Threes: Triple Hypermeter and the
  Songs of Fanny Hensel", *Music Theory Online* 17.1 (2011).
- Nicole Biamonte, "Formal Functions of Metric Dissonance in Rock Music",
  *Music Theory Online* 20.2 (2014). Metric dissonance is initiating, linking or
  cadential, and *"usually of short duration"* — a deviation from a norm, not a
  norm.

Already in the program, and load-bearing here:

- Kyle Adams, "Parameters of Phrase in Hip-Hop", *MTO* 26.2 — cited at
  `src/genre/lofi.ts`.
- Huron and Ollen, via Margulis, *On Repeat* — cited at `src/stage/perform.ts`.

**Not read, and therefore not relied on:** William Rothstein, *Phrase Rhythm in
Tonal Music* (1989), whose "tyranny of the four-measure phrase" is the obvious
frame for §2 and which reached this document only through a search summary. If
that idea is wanted in the program, read the book first.
