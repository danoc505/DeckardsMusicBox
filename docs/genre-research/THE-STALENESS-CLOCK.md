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

**DONE.** `arrangement.drift`, 0..1: how much of its span a treatment takes to
arrive. 0 is the program as it was — a switch on the bar line. lofi states 0.5
(izotope: "a filter that opens slightly … the repetition creates the groove
while the variation sustains interest"; half the span [chosen inside that]);
dungeon synth states 1 (musicradar: "open a low-pass filter by a few percent
each time the loop repeats"; note.com/soundwitches: "deepen the shadows of the
sound through changes in reverb and filters"). Each `DeskChange` carries
`overSec`, and `render.ts` walks the desk from wherever it stands to where the
treatment puts it, in steps of 1024 samples at absolute positions — so a record
made in blocks of 577 takes exactly the steps one made in blocks of 4096 does,
and the existing byte-identity test holds with both genres drifting.

**Only the continuous knobs walk** — levels, pans, sends, returns, the pole,
the tape's top, the medium's mix, the world's width and depth; a frequency
walks in octaves. A knob that changes what a unit IS — a room's seconds, an
echo's beats, the kit, the medium's kind, the tape's wow — steps at the walk's
start, because the renderer rebuilds that unit when it changes and a rebuild
is a click. And `Pole` gained `set()`: a cutoff moved keeps the filter's state,
where a new `Pole` started from silence — hundreds of clicks on a walk.

**The worry about `treat.test.ts` was wrong, and is withdrawn.** That test
measures a treatment's DESTINATION held statically against an empty desk; it
never reads the timeline, so a ramp does not reach it. A walk to a desk that
does nothing is still nothing, and the floor judges exactly that.

**What said it worked:** `render.test.ts`, "a desk that drifts walks the
filter down across the span, and lands where a step would have" — one `darken`
placed by hand at bar 8 with eight bars to arrive, against the same as a step:
the walk's brightness is still most of the way up at bar 8, the first half of
the span is brighter than the second, and past the span both are on the same
desk; and the walk is byte-identical at block 577. Cost, measured: 1.04–1.06×
the render time.

### Step 2 — the clock

**DONE, in two pieces, and the second was found by the roll.**

A per-part counter of turns unchanged, per section. It enters the score as a
fourth factor, `due = 1 + the turns unchanged of every part the move touches,
summed`: a move is worth the staleness it clears, so the longest-stale part's
moves rank first and nobody's move ranks less than it did. A whole-desk
treatment touches every part under it, a per-part one its part, a density
move the part it moves; **drift pays**, because a walking desk is a change to
everyone it walks under. The SUM and not the largest, measured: scored by the
largest alone the desk was worth one hush, and dungeon synth's bass sat at
41%; summed, a whole-desk walk is the natural answer when the whole band is
owed — "automation and modulation rather than constant arrangement changes" —
and it went to 28%. Then, after the score has chosen, **every heard part that went the
whole of the last span unchanged is paid on top** — hush or speak-up, a part
out where the floor and the peak allow, the kit's expression, a treatment
aimed at it where the span's desk is still the record's own. The one-thing
restriction is gone and `arrange.ts`'s header no longer states it.

**Paid at TWO, in span arithmetic.** The clock counts in spans of two turns,
so the counts are 0, 2, 4: a part at two has stated its figure twice, and the
next span is the third hearing. Paying "at three" — at the next even count,
four — was tried and measured: every part went a third and a fourth turn, and
the number this was built to move went back to where it started (dungeon
synth bass 40%, keys 41%).

**And three rules on what may be paid on top, each from a measurement.** At
most ONE part held back per boundary: without that, the first boundary of a
peak held four of five parts back at once — everyone quieter, which is the
arc's job, and then nothing to hold still against. Where the desk moved, only
a gain — and the rule runs both ways: a boundary that moved who plays takes no
desk move on top of it. A section that changes colour and loses a player in
the same bar has nothing held still, and `arrange.test.ts` holds a treatment
to never taking a part away; the full suite caught the one-way version of this
rule letting a per-part treatment land on a part-out. And a section that
builds into the climax is not paid in expression
down, which is the run-up cancelled by its own arrangement (`perform.test.ts`
caught that one). A payment the score gave zero is still taken — a part let
back up scores nothing while the ledger is taking, and it is the only way a
held-back part is ever anything else.

**Hush is a set now, not a slot.** `Span.hush: ReadonlySet<Role>` — "one or
many at once" — because with three foundation parts owed at once and one slot,
two went unpaid every time.

**What said it worked** (`node tools/stale.ts lofi,dungeonsynth 1 200`):

| of that part's runs, 3+ turns unchanged | before | after |
|---|---|---|
| dungeon synth bass | 42%, longest **16** | **28%**, longest 6 |
| dungeon synth keys | 36%, longest 16 | **29%**, longest 6 |
| dungeon synth drone | 20% | **6%** |
| lofi bass | 42%, longest 8 | **32%**, longest 6 |
| lofi keys | 43%, longest 8 | **24%**, longest 6 |
| the desk moves once every | 22–23 bars | **14–15 bars** |
| records that never move the desk, lofi / dungeon synth | 43 / 7 of 200 | **29 / 2** |
| boundaries moving more than one thing | 0% | 15–18% |

And the section-level story held: who opens, how long alone, when everyone is
in — identical over forty seeds in both genres (`measure.ts --sweep --map`).
One derived number moved, and it is recorded: the opener heard exposed again
with room round it, lofi 52.1% → 47.1%, because a paid part-out sometimes takes
a neighbour of the opener where before nothing did; dungeon synth 96.3%,
unchanged. `stuck` stays 0. 292 tests, one of which — "a treatment changes the
sound and never who is playing" — had its rationale rewritten because the
rationale was the one-thing rule; its assertion stands.

Dungeon synth 46691's thirty-two bar instrumental, which was the same picture
eight times: `88: hush keys + drench aimed at the drone · 96: darken · 104:
back to the record's own desk`. The notes are the same notes — that is the
repetition law, kept — and the strip now says what moved over them.

### Step 3 — partial variation, only if the cheap moves run out

**MEASURED, AND NOT BUILT — the condition is met and the mechanism cannot
reach it.** `arrangement.unpaid` counts every time a part the rule of three
said was owed had nothing composable left to pay it with: **432 times across
lofi's 1,097 boundaries and 779 across dungeon synth's 1,671.** The cheap moves
do run out, at something like two boundaries in five.

But the debt is a SPAN-level debt, and notes cannot pay inside a section:
`perform.ts` addresses the hand by the figure so a figure played again is
played the same way — Huron and Ollen's 94% — and 76% of lofi's repetition
pairs straddle a span boundary. Partial variation is a section-level move by
construction: it makes the NEXT hearing of an idea start the same and diverge
halfway (the source's second option), and it is still `HANDOFF.md` item 7 and
Phase 5.1 on its own merits. It is not this clock's payment. What is left
unpaid here is the price of the repetition law, and that price is now a number
rather than a feeling.

What COULD pay a span without touching a note, and is not built: channel C — a
different voice on the same written line, per span. That is Phase 4, and this
measurement is its case.

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
