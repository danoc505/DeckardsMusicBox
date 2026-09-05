# Building the alterations: the plan

`genre-research/THE-ALTERATIONS.md` is the catalogue — sixty-five ways to
restate something without rewriting it, in eleven layers, with the sources.
This is the plan for building the rest of them and making every one available
to the arrangement.

It is written to be followed by someone who has not read this conversation.
Each phase says what it delivers, why it sits where it sits, and **what number
says it worked** — because a change with no measurement behind it is an
opinion, and this program's cardinal sin is a knob that does nothing.

---

## 0. Where it actually stands

The catalogue's own tally table says "36 built". That counts `◐` as built in
§4 and §6 but not in §1, so it flatters slightly. The strict count:

| | moves |
|---|---|
| ● machinery exists and the renderer honours it | **34** |
| ◐ partly there | **3** |
| ○ nothing exists | **28** |
| **total** | **65** |

And the number that matters is neither of those: how many can change *during* a
record. **It was fourteen. It is twenty-nine.**

| catalogue rows that move | at the start | now |
|---|---|---|
| §2 density — part-out, part-back, all-back, strip | 4 | 4 |
| §3 the clock — half-time feel | 0 | **1** |
| §4 the hand — 21, 24, 25, 27 | 0 | **4** |
| §7–9 the desk, the room, the machine | 10 | **20** |
| **of 65, and firing** | **14** | **29** |

Do not confuse that with the size of the treatment vocabulary, which is a
different count: `TREATMENTS` went 12 → 23, and one treatment can answer more
than one catalogue row (`wear` is the tape and the vinyl; `widen` is the width
and the depth) while some rows need none of them at all.

**Two more are built and deliberately NOT in that 29**, because counting them
would flatter it. **Row 53, circuit swap**, fires nowhere: it needs the
analogue kit loaded and both genres play the acoustic one, and treatments are
absolute so `rekit` cannot chain into it. **Row 23, accent shift**, moves in
depth but not in position — how hard the metre is leant on varies per hearing,
which step is strong does not.

---

## 1. The one insight this plan turns on

**There is not one way to deliver an alteration. There are four, and they cost
wildly different amounts.** The twelve that exist all use the cheapest one, and
that is the only reason they were cheap.

| channel | where it lands | what it can change | cost |
|---|---|---|---|
| **A · the desk** | `Span.treatment` → `perform.ts` timeline → `render.ts` | anything in `SoundSpec` | built |
| **B · the performance** | `Span` flag read inside `place()` in `perform.ts` | when a note sounds, how hard, how long, which octave | small |
| **C · the voice** | per-span voice assignment, `sound/voices.ts` | which instrument plays a written line | medium |
| **D · the material** | a new axis of `variant`, decided in `arrange.ts` before `material/` runs | the notes themselves | expensive, and dangerous |

Channel B already has a working precedent nobody has generalised: **`span.thin`**.
It is a span-carried flag that `perform.ts` reads at `perform.ts:255` and uses
to drop hat notes. It touches no material and rebuilds nothing.

**But it is a per-SECTION channel, not a per-span one, and this plan said
otherwise.** `perform.ts` addresses the hand by the material and the position
inside it, deliberately, so that a figure played again is played the same way —
Huron and Ollen put literal repetition at about 94% of passages across five
continents and five centuries, and `perform.test.ts` holds the groove to it to
the microsecond. Measured: **76% of lofi's repetition pairs and 44% of dungeon
synth's straddle a span boundary**, so a per-span change to how the groove is
played would break that law on most of what it checks. It is the best-sourced
law in the file and the stated point of the whole arrangement; it is not a test
to be edited.

`thin` is safe only because it drops HATS — the law's comparison covers
`bass`, `keys` and `drone`, and the drums are excluded by name.

The catalogue agrees, in its own wording: §4's moves are "for this **hearing**"
(24), "across the **section**" (25), "per material, not per **return**" (21),
and §5's octave transposition is "of the whole part". A hearing is a section.
So channel B hangs its flag on `Placed`, beside `thin` and `broken`, and a
figure inside a section still repeats exactly.

Channel D is the one to be afraid of. The whole reason this catalogue exists is
that `vary.ts` was the *only* answer to the rule of three, and spending
material on it left 31% of materials heard exactly once. **A plan that answers
half the catalogue with channel D has reinvented the disease.**

### Which layer goes down which channel

| layer | moves | channel | note |
|---|---|---|---|
| §1 orchestration | 7 | **C** (2,3,4,5,7) · D (1) | doubling is a second voice on the same written notes — no new pitches |
| §2 density | 6 | already in the pool · **B** (12,13) | `empty-before` and `fill-into` are seam moves in disguise |
| §3 the clock | 7 | **B**, per section | every note kept, in order — only its instant moves. A half-time SECTION, not a half-time span |
| §4 the hand | 7 | **B**, per section | `articulation.ts` and `feel` per HEARING — which is what the catalogue's own rows say, and the only grain the repetition law allows |
| §5 register | 3 | **B** (28) · **D** (29,30) | octave transposition is arithmetic; voicing is built in `harmony.ts` |
| §6 underneath | 5 | **D** | reharmonise and pedal point change what the parts are built from |
| §7 the room | 5 | **A** | four of five already move; azimuth does not |
| §8 the desk | 11 | **A** | seven or so move; pedal swap, patch, medium, modulation do not |
| §9 the machine | 5 | **A** | none move — no treatment touches `tr1000.ts` |
| §10 answers | 4 | **D** | genuinely new lines, from existing pitches |
| §11 the seam | 5 | **B** (62,63,64) · **D** (61,65) | partial variation is the expensive one the research wants most |

**Roughly 40 of the 53 unbuilt-or-frozen moves are channels A and B.** That is
the shape of the whole job: it is mostly plumbing, not composition.

---

## 2. What has to be solved before anything is added

> "The pool must not simply be drawn from. Sixty-five moves fired at random is
> not an arrangement, it is a light show."
> — `THE-ALTERATIONS.md`, "What must not happen"

This is a hard blocker, not a caveat. The current span score is

```
fit = serve × worth × fresh × afford
```

and it was balanced against a pool of about twenty candidates. Three things
break when the pool reaches sixty-five, and all three are already visible in
the twelve:

**0 · THE SELECTOR CANNOT READ THE RECORD — measured, and this outranks the
three below.** Among treatments, `serve` and `worth` are constant, so `fit`
varies only by `fresh × afford`, and neither term knows anything about *this*
record. Over 300 seeds every record in a genre plays its treatments in the same
order — lofi is always `wear darken drench echoed wear push`, dungeon synth
always `darken drench wear darken far dry` — and records differ only in how far
down the list they get. A genre therefore only ever hears its top four or five
moves, whatever it weights: lofi never fires seven of its twelve in 300 seeds.

This is the treatment-level form of the fault the arrangement stage was rebuilt
to fix, and the same sentence applies — *a rank that cannot change as a
consequence is not a story*. **It is a blocker on Phases 2 to 5**, because
adding fifty-three moves to a selector that plays a fixed playlist produces
sixty-five items on a fixed playlist. The fix is a term that reads what the
record has done, in the same shape as the section walk's `spare`.

**1 · Freshness keys on the wrong thing.** `keyOf` returns `move:role` for
density moves, so a record can play the same *kind* of move seven times
running by rotating which part it happens to — `-lead +lead -bass +bass -keys`.
Every boundary changed something; nothing accumulated. `TALLY.md` §2 records
this as known and deliberately unfixed, because fixing it while treatments
were already winning too much would have made two balance changes
indistinguishable. **That reason expires the moment the pool grows**, and the
fix has to land first so the growth is measured against a sound baseline.

**2 · Nothing prices a LAYER.** `afford` prices a part and `weightOf` prices a
treatment. There is no term saying dungeon synth will move its reverb freely
and must never swap a drum circuit mid-record. With twelve moves, all from two
layers, this did not matter. With eleven layers it is the main thing.

**3 · The pool is rebuilt per boundary and scanned linearly.** Fine at twenty
candidates, and it should be measured before it is assumed fine at several
hundred. Cheap to check, cheap to fix, and a compose that got noticeably
slower would be felt in `npm run roll`, which is the main test.

---

## 3. The phases

Each phase is shippable on its own and leaves the program better than it found
it. **Do not start a phase before the one above it is measured.**

### Phase 0 — the genres say what they already have

*Cost: hours. Value: immediate, and it de-risks everything after.*

Four genre-data faults are known and none needs a line of stage code. The most
recent three sessions each found one; this is the family, cleared at once.

- **lofi states no `treat` weights**, so it inherits an even pool. Measured, it
  brightens 48 times against darkening 54 — a coin flip, not a direction —
  and fires `wear` **once in sixty records** where dungeon synth fires it 48
  times. lofi is the genre made of tape saturation and vinyl dust. The one
  move that *is* this genre almost never happens.
- **`fewest: 3` is inherited by dungeon synth**, so it never ends the way its
  own literature says this music ends (`TALLY.md` §2).
- **`introSec: 12` is inert for dungeon synth** — a knob that does nothing
  (`DUNGEON-SYNTH-ARRANGEMENT.md` §8).
- **The `1/(1+out)` absence ceiling has never been tested on and off**
  (`HANDOFF.md` item 5). If it does nothing, delete it and keep the note.

**What says it worked:** lofi's treatment distribution has a direction — a
top move at least four times its opposite — and `wear` is in its top three.
**Done.** `wear` went from 1 use in 60 seeds to the top move at 360 in 300, and
`brighten`, which the even default had firing 48 times against darken's 54, is
now last where the genre's own move is taking the top off. Doing it is what
exposed items 0 and 1 of Phase 1 above.
The two proposals are the owner's call and are flagged as such.

**PHASE 0 IS DONE.** All four, and two of them turned out to be constraints
rather than the values that were proposed:

| | what it came to |
|---|---|
| lofi states its `treat` weights | `wear` 1 use in 60 seeds → the top move at 360 in 300. Exposed Phase 1's items 0 and 1 |
| the absence ceiling, tested on and off | There is no ceiling. Identical distribution three ways; the claim was false and is corrected in three places. Kept, because it does move abandonment |
| the ending | Not `fewest: 1`. A floor is about a section that carries on, so the last one is not floored by that number at all. Dungeon synth's drone-alone ending 0% → 10%, and "ends carrying what it opened with" unchanged |
| the intro ceiling | Not `introSec: 64` alone. The ceiling was a preference that gave up: 49% and 100% of records broke it while every length but the shortest was dead. Now refused at load, with each genre stating its own. Both genres' dead entries are alive; the ceiling is broken 0% |

The pattern in all four is the same and is worth carrying into every later
phase: **the fault was never in a stage.** It was a genre — or the defaults —
silently running on a number written for other music, and `arrange.ts` and
`form.ts` needed no new rule for any of it. Check what a genre INHERITS before
reaching for a new term.

### Phase 1 — fix the score before growing the pool

*Cost: days. Value: nothing after this is trustworthy without it.*

Three changes, and each is measured alone:

1. **Freshness on the move's KIND as well as its name.** A second term keyed on
   the kind, so `-lead +lead -bass +bass` wears out.
2. **A layer price.** Each genre states which of the eleven layers it will move
   and how readily — the same shape as `treat` weights and `shed`, carried as a
   weight and never as an order. A layer at zero is a layer that genre never
   uses. This is the term that makes "all 65 available" survivable.
3. **Measure the pool build.** Time a compose at twenty candidates, then at a
   simulated three hundred. Fix only if it moved.

**What says it worked:** the same-kind run in dungeonsynth 829055's thirty-two
bar verse is gone; `stuck` stays 0; every section-level number — who opens,
thinnest, fullest, energy spread — is unchanged, the same check the treatments
had to pass.

**PHASE 1 IS DONE, and only one of its four items was built.** The other three
were closed by measuring them, which is the point of measuring them.

| item | what happened |
|---|---|
| **0 · the selector cannot read the record** | **Fixed, with no new term.** A treatment's `Move` carried a hardcoded role of `"drums"`; `worth` reads `standing` and `established` of its role, so a fictional role scored the constant 1. Moves 37, 41 and 43 in the catalogue say *a part* and this program applied them to the whole band — making them what they say gave the role something real to be, and the terms that already read the record started reading it. Distinct treatment sequences **17 → 28** (lofi) and **29 → 89** (dungeon synth), with all 12 of dungeon synth's vocabulary still reached |
| **1 · freshness keys on the wrong thing** | **Deleted — measured at nothing.** The documented example, dungeonsynth 829055's verse, now reads `part-out darken untreat part-back drench wear darken`: 7 boundaries, 6 kinds. Across 200 records, sections with 4+ boundaries average **6.57 distinct kinds in 7.0 boundaries**, top kind 19%, and there is not one run of three. The treatments closed the hole, as `TALLY.md` §2 suspected. A kind term was built, changed no fault, and pushed the desk share the wrong way — so it went, and this is the note |
| **2 · nothing prices a LAYER** | **Moved into Phase 2.** There are two layers in play. A term pricing eleven, built before ten exist, cannot be measured on and off — it would be the knob that does nothing. It belongs where each new layer makes it measurable |
| **3 · the pool is scanned linearly** | **Answered: no fix.** The arrangement is **0.5 ms/record**, 8–13% of a 3.7–6.4 ms pipeline. ~23 candidates now, ~77 at all 65 moves — 3.5×, so ~1.75 ms, against a roll that takes about a second. Optimising it would itself be a knob that does nothing |

**And the tail was measured rather than left open.** Dungeon synth reaches all
twelve of its treatments; lofi reaches five. That is not a dead knob, it is a
short genre meeting its own preference order — the ladder walks as far as a
record has room for:

| lofi at | distinct | treated spans/record |
|---|---|---|
| its own length, 110–190 s | 5 | 3.1 |
| 300 s | 7 | 6.3 |
| 600 s | 9 | 12.4 |

`brighten` going unreached is what lofi's own source asks for — this genre's
move is taking the top off — and `sweep` is refused outright, its `sweepDepth`
being zero. Nothing here needs fixing; it needed measuring.

### Phase 2 — finish channel A (the desk, the room, the machine)

*Cost: days. Value: 21 of 21 in §7–9. Highest ratio in the plan.*

Ten leaf moves whose plumbing is already built: azimuth, pedal swap, patch,
medium, modulation, kit swap, circuit swap, and the three lane controls. Each
is a `SoundSpec` leaf; each goes through `clamp`; each must be refused by
`deskOf` where it would come out identical to the genre's desk.

Settle `echoed` here too — offered to lofi sixty times and never chosen. Either
it is priced wrong or it is a no-op in that genre's desk. Find out which, and
if it is the second, refuse it and say so.

**What says it worked:** all 21 of §7–9 reachable; every one used at least once
across sixty seeds in the genre that states a weight for it; `stuck` still 0;
byte-identical output at block sizes 577 and 4096 on a record that uses them
(the test that already exists, extended).

**PHASE 2 IS DONE. All 21 of §7–9 move.** Ten leaf moves built — `orbit`,
`stomp`, `repatch`, `medium`, `waver`, `rekit`, `recircuit`, `slacken`,
`spotlight`, `soak` — plus `linger`, an eleventh nobody had noticed was
missing: move 47 was marked ● because the reverbs exist, but every treatment
aimed at them moved `ret` and none moved `sec`.

Both genres now use **every treatment they weight**, none never-fired.

**The thing that made it work was not the ten moves.** They fired 0, 0, 3, 0
and 0 times in 300 records when first added. `arrangement.treat` is a
`Weighted<Treatment>` — the same type as `arrangement.intro`, which is DRAWN
nine lines away in the same file — and it was being read as a ranking, so a
record walked the ladder from the top and stopped after rank four. Drawing
which colour a genre reaches for, from the genre's own pool with freshness
folded in, made the whole vocabulary reachable:

| | before | after |
|---|---|---|
| treatments used, lofi | 6 of 16 | **21 of 21** |
| treatments used, dungeon synth | 14 of 17 | **21 of 21** |
| distinct treatment sequences, lofi | 28 | **165** |
| distinct treatment sequences, dungeon synth | 89 | **227** |

**And it removed a pool-size artefact that would have broken the rest of this
plan.** Offering every treatment at once gave the desk seventeen candidates
against density's eleven, and a score that takes the max favours whichever kind
has more tickets. The desk's 52–64% share of within-section boundaries was
partly that rather than its price — and it would have grown with every move
added, so by §11 the arrangement would have been nothing but desk moves. It now
sits near 32% with `asPart` untouched. Whether 32% is right is the listening
question `TALLY.md` §2 already has open.

**Phase 1's item 2, the layer price, is closed as unnecessary.** A genre states
a weight per TREATMENT, which is finer than per layer, and the draw makes those
weights control frequency directly. Dungeon synth declining `rekit` and
`recircuit` — not stated at all, on this catalogue's own warning that a genre
"should probably never swap a drum circuit mid-record" — is the layer price
already working. A separate layer term would restate what the weights say.

**One gap found by auditing rather than by a symptom.** `settle` is a merge and
not a validator, so a treatment that scaled a knob past its ceiling would be a
fault nothing downstream catches. `linger` clamped the spring to the ROOM's
ceiling — the two reverbs have different ones, 6 seconds and 12. There is now a
test that puts every treatment on every genre through `settle` and checks every
range the resolver enforces.

### Phase 3 — build channel B (the hand, the clock, register)

*Cost: a week or two. Value: 17 moves, the largest single jump.*

Generalise `span.thin` into a per-span expression channel that `place()` reads.
§4 first (it is closest to `thin`), then §5's octave transposition, then §3.

§3 needs one thing decided before it is written: **half-time and metric
displacement change every onset, so the "keeps the pitches exactly as written"
framing in the catalogue's header does not survive contact with this layer.**
What these moves preserve is *identity*, not instants. Tighten the definition
in `THE-ALTERATIONS.md` before building, because it is the definition that
decides whether a move is channel B or channel D — and getting that wrong is
how §3 turns into a material rebuild by accident.

Watch the addressed draw. `chart.rng.at("perform", material, role, lane, unit,
step)` keys the hand on the step; a clock move changes the step and therefore
the jitter. That is deterministic and probably right, but it must be a stated
decision rather than something discovered later.

**What says it worked:** the roll. A half-time span is visible in one second —
that is exactly the kind of thing the picture is for. Roll before and after on
seeds something else picked.

**PHASE 3 SO FAR: the two moves the repetition law lets through, and the rule
for the rest.** §4's rows split by what the law compares — `role`, `lane`,
`step`, `pitch`, `art`, `playedStep`. A move that changes a note's WEIGHT or its
LENGTH is outside that comparison and may sit on a span; a move that changes its
articulation, its timing, its pitch or its step is inside it and must wait for a
section boundary.

Built, both gain-only:

| move | what it is |
|---|---|
| 24 · dynamic terrace | `Span.hush` — any part held back, not just the drums' hat. The peak, which may never lose a player, went from one available move to two |
| 25 · crescendo | `Placed.swell` — the section before the climax builds into it. This is the arc's **rising action**, the one stage of the dramatic arc this program never had |

| 21 · articulation swap | `Placed.manner` — the rule of three's third answer: same notes, same desk, a different hand. One rung along the length ladder, per hearing |

Not built, and each for a stated reason rather than for want of time:

- **26 · lean** would contradict "a part sits where its genre leans it", which
  is asserted to within 4 ms and sourced to Keil's participatory discrepancies.
  A section-wide feel shift may well be right, but it needs a source before a
  law goes.
- **28 · octave transposition** at performance time bypasses the material
  stage's register check, which throws by design. It belongs where the register
  is known — which makes it channel D, not B.

### Phase 3.5 — the clock that says WHEN a move must fire

*Cost: days. Value: it is the reason the pool exists, and nothing above it
states the rule.*

**`genre-research/THE-STALENESS-CLOCK.md` is the spec. Read it before starting.**

Phases 1 to 3 built the vocabulary and never said when it has to be spoken.
Measured on ten random records, the consequence is that the record keeps the
rule of three and every part breaks it: **42–43% of keys and bass runs are three
or more identical turns** (`node tools/stale.ts`), the worst being sixteen turns — thirty-two bars of
one two-note figure while the arrangement changed eight times around it. Across
those ten records, **56 boundaries moved exactly one thing and not one moved
two**, which is narrower than the two-loop source, whose own worked example
moves four at once.

Three steps, each measured alone:

0. **The measurement first. DONE.** `tools/stale.ts` — runs of identical
   turns per part in its own unit, share at 3+, desk-timeline density, what
   moved at each boundary. `tools/measure.ts --parts` closes `HANDOFF.md`
   item 2. And `dump.ts`, `FORMAT.md` and the roll now carry `hush`, `half`,
   the desk, `swell`, `manner` and `recast`, so the record's own text and
   picture can show a change the notes cannot.
1. **Drift. DONE.** `arrangement.drift` per genre, sourced; `DeskChange.overSec`;
   `render.ts` walks the continuous knobs in 1024-sample steps at absolute
   positions, byte-identical at any block; `Pole.set()` keeps the filter's
   state. Cost 1.04–1.06×.
2. **The clock. DONE.** A per-part counter, `due` as a fourth factor in the
   span score, and every part that went a span unchanged paid on top of the
   chosen move — at most one held back per boundary, only a gain where the
   desk moved and the reverse, no expression down in a swell; `due` is the
   staleness a move clears, summed. `Span.hush` is a set. Dungeon synth bass
   42% → 28% and its longest run 16 → 6; the desk moves every 14–15 bars
   instead of 23. Who opens, how long alone, when everyone is in: unchanged.
3. **Partial variation. MEASURED, NOT BUILT.** `arrangement.unpaid` says the
   cheap moves run out at two boundaries in five — and notes cannot pay a
   span-level debt without breaking the repetition law. It stays Phase 5.1 on
   its own merits. The measurement is Phase 4's case instead: a voice swap
   per span is the one payment left that touches no note.

**What says it worked:** runs of 3+ identical turns fall from 25–32%; the
sixteen-turn case is gone; every section-level number is unchanged — who opens,
thinnest, fullest, energy spread — and `stuck` stays 0.

**The trap this phase was thought to set for itself, and does not:** `treat.test.ts` measures a treatment by
rendering it held against an empty desk. A ramp only reaches full value at the
end of its span, so a sound ramped move measures quieter than a step and could
be deleted as dead by the floor that was built to catch dead knobs. Read the
test: it holds the treatment's DESTINATION statically and never reads the
timeline, so a ramp never reaches it. Withdrawn.

### Phase 4 — channel C (orchestration)

*Cost: a week. Value: 5 moves, and the first genuinely new colour.*

Per-span voice assignment: octave double, unison double, hand-off, carrier
swap, voice substitution. No new pitches — a second voice on lines that already
exist.

Doubling adds a voice, so it adds render cost. `render.ts` already renders a
note once and reuses it wherever it recurs; check that a doubled part does not
defeat that, and measure the render time before and after.

**What says it worked:** a doubled section is audibly thicker with the same
roll — which means this is the first phase the roll cannot judge alone, and the
WAV has to be played.

### Phase 5 — channel D, smallest first

*Cost: weeks, and the highest risk in the plan.*

In this order, and **stop if the material-heard-once number moves the wrong
way**:

1. **Partial variation** (#61) — first half identical, second half diverges.
   `FORM-RESEARCH.md` calls it "the most useful one for a generator", and
   `HANDOFF.md` item 7 already has it queued. It belongs in the material
   stage, not the arrangement.
2. **Voicing spread and inversion** (#29, #30) — `harmony.ts`.
3. **Pedal point and reharmonise** (#31, #33).
4. **§10's four answers** (#57–60) — new lines from pitches the record already
   has. The most compositional work in the catalogue.
5. **Elision** (#65).

**What says it worked, and it is the same number for all of them:** materials
heard exactly once must not rise above the 21% it stands at, and the peak must
not be built on once-heard material more often than it is now. This whole
catalogue exists because channel D was overused. Every item here has to prove
it did not do that again.

---

## 4. The rules that hold for every phase

These are the house rules, restated because this plan is long enough to forget
them in the middle of.

- **The piano roll is the main test** for anything that changes notes or who
  plays when. Roll before, roll after, look at the PNG. Phases 3, 4 and 5 all
  qualify. Let something else pick the seeds — a seed you chose is a seed that
  worked.
- **The roll cannot see the desk.** Phase 2 is judged by the WAV, played.
- **Measure every move on and off.** If it changes nothing, delete the field
  and keep the note saying it was tried. `THE-INTRO.md` §7 is the worked
  example. **This plan expects deletions.** Sixty-five candidate moves will not
  all survive contact with measurement, and a phase that adds every move it
  attempted has probably not measured them.
- **Every number a genre states carries its source.** No published source says
  `[chosen]`. Do not invent a citation.
- **Do not change behaviour to make a test pass.** If a test is wrong, the doc
  it came from changes first.
- **Refuse a move that would do nothing**, the way `deskOf` returns null. In a
  pool this size, a no-op is worse than useless: the two-loop rule spends a
  boundary on it and the ear hears the section repeat at exactly the moment it
  was promised a change.
- **Check what a genre INHERITS before reaching for a new term in a stage.**
  Four faults so far have been a genre silently running on a default written
  for other music, and not one needed a change to `arrange.ts`.

---

## 5. How to know it is done

1. All 65 rows in `THE-ALTERATIONS.md` are ● or struck out with the
   measurement that killed them.
2. Every one is reachable from `arrange.ts` — *available*, which is not the
   same as used.
3. Each genre states which layers it moves and how readily, with sources.
4. Across sixty seeds a genre: every move a genre weights above zero is used at
   least once, `stuck` stays 0, and no move exceeds a share of boundaries the
   genre did not ask for.
5. Section-level numbers unchanged: who opens, thinnest, fullest, energy
   spread. The alterations compete for boundaries *inside* a section; they must
   not quietly take over the arrangement.
6. Materials heard exactly once has not risen.
7. **Somebody has played the records.** `TALLY.md` §0 outranks every row above,
   and it still does.

---

## 6. What could make this plan wrong

**"All available" and "all good" are different goals, and this plan assumes
you want the first.** The catalogue's own warning is that sixty-five moves in
one pool is a light show. Phase 1's layer price is what keeps that from
happening, and if it does not work, the honest answer is that some layers stay
off for some genres — availability in the code, restraint in the genre data.
That is a real possible outcome and it is not a failure.

**Phase 5 may not be worth finishing.** Channel D is what this catalogue was
written to escape. If partial variation lands well and the four answers in §10
push once-heard material back up, stopping after 5.1 is the right call, and
the remaining rows get struck out with the number that killed them.

**Two open items are the owner's call and are not scheduled here**:
dungeon synth's `introSec: 64` and `fewest: 1` at the outro. Both change how
every record in that genre opens and closes.
