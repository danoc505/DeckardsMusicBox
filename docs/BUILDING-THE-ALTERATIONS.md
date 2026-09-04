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

And the number that matters is neither of those. **Twelve** moves can change
*during* a record — the treatments in `stage/treat.ts`. Everything else is
either a frozen knob or unwritten.

Measured now, sixty seeds a genre:

```
lofi          10 of 12 used · 37% of spans treated · 54/60 records · sweep refused as a no-op
dungeonsynth  12 of 12 used · 32% of spans treated · 60/60 records
```

`echoed` is offered to lofi and wins zero times in sixty records. A move that
is offered and never chosen is a first cousin of a knob that does nothing, and
Phase 2 is where that gets settled.

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
to drop hat notes. It touches no material, rebuilds nothing, and costs one
line. Every move in §3, §4 and §5 is that same shape.

Channel D is the one to be afraid of. The whole reason this catalogue exists is
that `vary.ts` was the *only* answer to the rule of three, and spending
material on it left 31% of materials heard exactly once. **A plan that answers
half the catalogue with channel D has reinvented the disease.**

### Which layer goes down which channel

| layer | moves | channel | note |
|---|---|---|---|
| §1 orchestration | 7 | **C** (2,3,4,5,7) · D (1) | doubling is a second voice on the same written notes — no new pitches |
| §2 density | 6 | already in the pool · **B** (12,13) | `empty-before` and `fill-into` are seam moves in disguise |
| §3 the clock | 7 | **B** | every note kept, in order — only its instant moves |
| §4 the hand | 7 | **B** | `articulation.ts` and `feel`, per span instead of per material |
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
