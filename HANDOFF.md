# Handoff

`README.md` says what the program is. This says how it is worked on and where
it has got to. Read it before touching anything.

## What we are doing

The program makes records, and the whole difficulty is that a record can only
be judged by ear. Nothing here asserts one — the suite can be entirely green on
a program that writes confetti. So the work is always the same shape: find
something the program does badly, find a published account of how music
actually does it, build the smallest rule that follows, and measure whether it
changed anything.

## Where it stands

Two genres, `lofi` and `dungeonsynth`, both playable end to end. Five pure
stages — chart → form → arrangement → materials → performance — plus `sound/`,
each frozen on the way out. A record is a pure function of genre and seed, and
renders byte-identical at any block size.

`npm test`: **301 of 303 pass.** The two failures are long-standing and
deliberate — they encode research and have not been tuned away:

- `arrange.test.ts` "the break goes below the floor mid-record" — 14% of
  records have a break against a threshold of 15%. See item 4.
- `material/index.test.ts` "a returning idea plays its statement's own figure"
  — 82 variants against a threshold of 90.

**Anything else red is yours.** Run the whole suite, not the tests near your
change.

The registers each genre works in, since three of the last four changes were
here and they are easy to get wrong:

| | bass | keys | lead | drone |
|---|---|---|---|---|
| lofi | 36–50 | 43–76 | 64–84 *(default)* | 46–60 |
| dungeon synth | 31–45 | 45–71 | 67–82 | 43–57 |

They are a system, not four independent numbers. A part may not take a pitch
another part is already holding, so a band that reaches into another band takes
that part's seats — and the symptom shows up somewhere else entirely. Both
times this has gone wrong, the keys crowded the lead and the *lead's* tests
failed. Move a register and re-run the whole suite.

## How you test, and which test for what

**Anything that changes notes, or who plays when — the piano roll.**

    npm run roll <genre> <seed>     the record as a picture, about a second
    npm run shot <genre> <seed>     the same record through the built page

Roll the thing you are about to change, then roll it again after. It is the
only way to see whether a section is a return, whether a part ever rests,
whether the tune went anywhere. Look at the PNG before you say anything about
it. `docs/THE-PIANO-ROLL.md` is how to read one.

**Anything that changes the desk — the WAV, played.** Treatments move effects,
not notes, so a record with and without them draws the SAME roll. The roll
cannot see the desk and will tell you nothing changed when something did.

    node src/cli.ts <genre> <seed> --wav out.wav

**Counting — `tools/measure.ts`.** How a line moves, who plays which bar, the
same over twenty seeds. That is how the research below was measured and no
picture can do it. The character grid it draws is not a piano roll.

**A treatment — `tools/treatments.ts`.** The one thing neither the roll nor
`measure.ts` can see: a treatment moves the desk and not one note, so the MIDI
is the same MIDI and the picture is the same picture. This renders the record
with its desk emptied and again held under each treatment, and reports how far
the record moved, in dB. It is how a dead knob is caught, and it does not tell
you whether anything sounds good.

    node tools/treatments.ts                     every genre, seed 2
    node tools/treatments.ts lofi 2,7 --sr 44100

`npm test` and `npm run check` are preconditions, not proof: green means no
stated law was broken, not that the result is music.

## The research

Every rule in this program comes from a document, and each has the same shape:
the research, then what went into the program, then what it came to when
measured. Write the next one that way.

| `docs/` | what it settles |
|---|---|
| `THE-PIANO-ROLL.md` | how to read a roll, and what to look for in what order |
| `TALLY.md` | what is done, what is open, and what closes each open item |
| `BUILDING-THE-ALTERATIONS.md` | the six-phase plan for the full catalogue. Read before growing the treatment pool — Phase 1 is a hard blocker |
| `genre-research/MELODY-AND-THE-HOOK.md` | the tune: a figure that comes back, the contour it walks, the one wide leap |
| `genre-research/THE-INTRO.md` | how a record opens — three ways in — and the break. §7 is the worked example of a rule deleted for doing nothing |
| `genre-research/THE-ARRANGEMENT-AS-STORY.md` | who plays when, and why that is a narrative rather than a texture |
| `genre-research/THE-ALTERATIONS.md` | every way to restate something without rewriting it |
| `genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` | what the genre says about its own middle |
| `genre-research/LOFI-LINEAGE.md` | what lofi descends from — the aesthetic, boom bap, jazz rap, trip hop — and the four places the genre file is running on a tutorial rather than on its own ancestry. Nothing applied |
| `genre-research/THE-STALENESS-CLOCK.md` | when a move must fire, counted per part. **STALE — it describes two designs that were built, measured and taken back out. Read it for the research and the failed attempts, not for what the code does.** |

## What was just done

Recent work, newest first. One paragraph each; the reasoning is in the code
comments beside each number, and the measurements are in the commits.

**The registers, both genres.** Three parts were sharing one band in lofi and
the melody was losing: it was the highest thing sounding in 66% of the bars it
played in. Keys 43–79 → 43–76 and drone 51–65 → 46–60 put it on top in 81%,
with *wider* chords than before (9.50 voices against 9.34, 22.8 semitones of
spread against 21.3). Dungeon synth had no pile-up — already 99% on top — but
its lead ran to D6. Lead 67–86 → 67–82, and the keys and drone had to move down
with it or the tune had nowhere to stand. Notes at or above C6: 2.3% → 0%.

**Two treatment weights were doing nothing.** Each genre used to state 22 of
the 24 alterations; over 200 records, lofi's `brighten` and dungeon synth's
`echoed` were drawn **zero** times, because `treat.ts` refuses them on those
desks. Both removed, so each genre now states 21 and uses all 21.
`treat.test.ts` asserts a genre may not weight a move its own desk refuses —
free, since it reads two lists and renders nothing.

**The roll names a record's alterations** in a line across the very top, each
in the colour of its own row in the FX roll below, and the treatment names on
the strip are in those colours too.

**The rule of three has both halves, and there are two clocks.** The rule was
kept only as a ceiling — state a thing twice and the third must differ — which
is the habituation half. The research says liking is BUILT first (Huron/
Margulis 2013; Huron and Ollen 2004 put literal repetition at 94% of passages).
`form.leastTurns` (3) is the floor: a section's length pool is narrowed before
the draw to lengths giving its phrase three turns. `arrangement.alterEvery`
(3 bars) is the fast clock: no stretch longer than three bars goes by
unaltered. Runs of 3+ identical turns roughly halved on most parts.

Two things to preserve if you touch `arrange.ts`: **at a bar point the roster
is frozen** (only the slow clock may change who plays — one guard in `push()`),
and **it is ONE walk, not a second pass**. A loop beside the loop that already
chose is what cost this program its climax once.

**The knobs move on their own — `src/sound/motion.ts`,** ported from MKII.
Four wave shapes, rates in BARS so cycles can be made coprime, a reset trigger,
and `off` to duck a knob already at the top of its travel. Better than MKII in
one way: a move names its knob BY PATH (`rack.tape.drive`), so all 202 of the
mixer's numbers are reachable with no hand-kept table. `resolve.ts` refuses at
load a path that is not a knob, or a knob sitting at zero.

**Drift** — `arrangement.drift`, how much of its span a treatment takes to
arrive. lofi 0.5, dungeon synth 1. Note for anyone reaching for it: **a stepped
desk change does not click.** Measured, it is quieter than the record's own
loudest transient in three of four cases. Drift is a musical move, not a
de-clicker.

**The arrangement is held to the rules it states.** They used to be kept by
accident of the walk, which is why every change to the walk broke something.
`arrange.test.ts` now asserts all seven span rules over both genres and 120
records. Anything added to this stage has to keep them.

**A boundary spends up to `MAX_PICKS` (2) moves**, the second only on a part
the rule of three already owes. A part's third statement is altered 32% → 49%
(lofi) and 47% → 71% (dungeon synth). At 3 the numbers barely move and lofi's
keys get worse, so 2 is where the evidence sits. It is a module constant, not a
genre field, because neither genre has a reason to differ.

## What needs doing

**1. Nobody has listened. This matters more than everything below it.**
Every claim in this file is a measurement. The desk now moves about two and a
half times more often than it did (one move per 13 bars to one per 5), and on
dungeon synth it is never still. Whether that is a record developing or a
record being fiddled with is exactly the question a measurement cannot answer.
Play seeds 1–10, 42 and 829055 and write what you hear into `TALLY.md` §0.

Three specific questions to listen for. `wear`'s difference signal is LOUDER
than the record it differs from (+3.3 dB on dungeon synth): a section ageing,
or a different pressing? `dry` and `drench` move the LEVEL by ~2 dB, which is
the one thing a treatment was not supposed to do. And half of lofi's vocabulary
sits 17 dB below its own `darken` — if those are inaudible the fix is in lofi's
desk, not in the treatments.

**2. `world.width` produces non-finite samples when it MOVES.** A static width
is clean at every value tried; a width swinging ±50% of 0.6 gives its first NaN
at 57.7s of lofi seed 17279. So it is the transition, not the value.
`Channel.tune` recomputes `lateSec` and keeps a `Line` created once with `??=`,
and `Line.read` interpolates at a fractional position — that is where to look.
**Reachable from the page today**, because `setDesk` lets a hand move width
while the record plays. No genre ships a width move; nobody should add one
until this is understood.

**3. Two register questions are open, both measured, neither decided.**
- lofi's keys ceiling: **78** is equally clean over 200 records with wider
  chords (9.87 voices, 24.4 semitones) at the cost of the tune being on top in
  74% of bars rather than 81%. 76 shipped. 79 is out — it fails at 200 seeds
  and looked clean at 60.
- dungeon synth's lead: **64–79** is equally clean with a ceiling of G5, a
  fifth below where this started. 67–82 shipped, because the part is a flute
  and 64–79's bottom nine semitones sit in the flute's weakest register. If it
  should go lower, that needs keys 43–69 and drone 41–55 with it.
- And **lofi's lead still tops at C6** on the program-wide default of 64–84.
  The owner objected to C6. Nothing has been done about it.

**4. The break-rarity failure needs an owner's decision.** A three-turn phrase
floor costs a short-record genre its bridge: lofi's bridge pool was 4 and 8
bars, and at a four-bar loop neither states its phrase three times. A 12-bar
bridge took it 11% → 14% against a threshold of 15%. Weight is not the lever —
at weight 3 it is still 14%, because a 12-bar bridge plus its keep-back needs
16 bars and a 44-bar lofi record rarely has them. The threshold encodes
research and has not been lowered. The options are a longer lofi record, a
`leastTurns` lofi states for itself, or the break not needing a bridge.

**5. `affords` is a category error, and this is settled — do not re-derive it.**
It is built from the genre's `shed` order — what a genre can afford to LOSE —
and it prices `hush`, which does not lose a part. lofi sheds its keys last, so
its keys score 0.2 for being quietened, and those are exactly the parts that go
unaltered most. Flattening it wrecks the peak, because the peak law lives in
the same term. It needs a real separation of "what does this cost the peak"
from "what does this cost the part", not a coefficient.

**6. Five ways NOT to do the rule of three per part.** All five were built,
measured and reverted. Read this before designing a sixth.

| attempt | what happened |
|---|---|
| an obligation term weighted by how many parts a move reaches | hit the target and pushed the desk to a third of all spans while `hush` fell 13% → 1% |
| the same, made binary | did nothing at all |
| pricing `hush` as expression rather than by `affords` | +1 point, and parts held back at the peak went 5% → 27% and 11% → 52% |
| several moves per boundary, unguarded | broke four invariants the single-move design held for free |
| the same, guarded | +2 to +5 points and a worse peak — **superseded**: done properly it is +14, and it ships. See `MAX_PICKS` above |

**7. `THE-STALENESS-CLOCK.md` no longer describes the code.** It is the
research and the spec for two designs that were built and reverted. Either
rewrite it against what `arrange.ts` now does, or mark each dead section dead.
It is the most misleading file in `docs/`.

**8. Partial variation** — first half identical, second half diverges, which
`THE-ALTERATIONS.md` calls the most useful kind for a generator. Only
whole-line variation exists. It belongs in the material stage, not the
arrangement.

**9. The full alterations catalogue.** The owner has asked for all 65 built and
available; `TREATMENTS` is 24. `docs/BUILDING-THE-ALTERATIONS.md` is the plan.
**The pool cannot safely grow until the span score prices a move's KIND and a
genre's LAYER (Phase 1). That is a hard blocker, not a caveat.** The rule for
adding one: put it in `TREATMENTS`, give `reaches` the line saying which unit
it arrives through, and let `treat.test.ts` say whether it moved the record. A
new leaf that does not clear the floor gets deleted, not shipped.

`revoice` is worth knowing about here: it is the loudest move either desk has
(−0.7 to −17.0 dB) but it does NOT help the per-part rule of three — measured
on and off, it costs a little. Judge it by ear, not by that table.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `THE-INTRO.md` §7 is the worked example.
  This applies to a genre's weights too: a weight the desk refuses is config
  nothing reads.
- **Run the whole suite before you push, not the tests near your change.** The
  stages are coupled through pitch: a genre number for one part breaks another
  part's laws in a file you never opened. This has cost a pushed regression.
- **Measure on 200 seeds, not 60.** A configuration that looked clean at 60
  seeds shipped two thin statements and five wide turns at 200.
- **Take the numbers LAST.** Every fix applied after you measured invalidates
  the measurement — see `README.md` § "Prove it, or it did not happen".
- **And measure whether the RECORD changed, not whether the settings did.**
  That distinction cost two treatments. The renderer builds only what something
  feeds, so a knob can move its number and be wired to nothing; comparing a
  spec against a genre calls that a change every time. Anything that moves the
  desk asks `sound/reach.ts` first, and anything claiming to move the record
  renders it and measures — at 22050 Hz or above, because below about 16 kHz
  the filters are pinned by their own stability clamps and a filter move
  measures as a no-op when it is nothing of the kind.
- **Every number a genre states carries its source** in that genre's `sources`
  map. A number with no published source says `[chosen]`, and one chosen off a
  sweep says so. **Do not invent a citation, and do not cite a page you have
  not read** — a number wearing a source it has not got is worse than a bare
  number, because the next reader will build on it.
- **`npm test` cannot see the built page.** The stages are pure functions and
  nothing in the suite renders the bundle, so a stage reading `process.env`
  passed 294 tests and shipped a dead page. Run `npm run build && npm run shot
  <genre> <seed>` before publishing, and never let a stage read the environment.
- **The comment is the specification.** Where a doc comment and the code
  disagree, that is a defect to report, not prose to skim past.
- **Rules are written in beats** and resolved against the genre's own metre, so
  a genre in five four needs no new code.
- **Recast is the pivot.** `form.ts` marks an idea that will not return; the
  arrangement opens that span with a treatment rather than a density move. If
  you change the rule of three or the form grammar, retest that path.

## Do not

- Do not commit generated rolls, shots, dumps or WAVs — they are reproducible
  from the program and the seed, and `.gitignore` already covers them.
- Do not change behaviour to make a test pass. The tests encode research; if
  one is wrong, the doc it came from is what has to change first.
- Do not judge a treatment by the piano roll. It cannot see the desk.

## Commands

| | |
|---|---|
| the record as a picture | `npm run roll <genre> <seed>` |
| the same, through the built page | `npm run shot <genre> <seed>` |
| the record as sound | `node src/cli.ts <genre> <seed> --wav out.wav` |
| the record as text | `node src/cli.ts <genre> <seed>` |
| who plays which bar | `node tools/measure.ts <genre> <seed> --map` |
| the same over twenty seeds | `node tools/measure.ts --sweep <genre> 1 20 --map` |
| what becomes of each part | `node tools/measure.ts --sweep <genre> 1 20 --parts` |
| how long a part goes unchanged | `node tools/stale.ts --records` |
| the rule of three per part: due, and answered | `node tools/stale.ts [genre] [first] [last]` |
| what each treatment is worth | `node tools/treatments.ts [genre] [seed]` |
| every test, then types | `npm test` · `npm run check` |
| the single file | `npm run build` |
