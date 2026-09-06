# Handoff

`README.md` says what the program is. This says how it is worked on and where
it has got to.

## What we are doing

The program makes records, and the whole difficulty is that a record can only
be judged by ear. Nothing here asserts one — the suite can be entirely green on
a program that writes confetti. So the work is always the same shape: find
something the program does badly, find a published account of how music
actually does it, build the smallest rule that follows, and measure whether it
changed anything.

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
| `genre-research/MELODY-AND-THE-HOOK.md` | the tune: a figure that comes back, the contour it walks, the one wide leap |
| `genre-research/THE-INTRO.md` | how a record opens — three ways in — and the break. §7 is the worked example of a rule deleted for doing nothing |
| `genre-research/THE-ARRANGEMENT-AS-STORY.md` | who plays when, and why that is a narrative rather than a texture |
| `genre-research/THE-ALTERATIONS.md` | every way to restate something without rewriting it |
| `genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` | what the genre says about its own middle |
| `genre-research/THE-STALENESS-CLOCK.md` | when a move must fire, counted per part. **STALE — it describes two designs that were built, measured and taken back out. Read it for the research and the failed attempts, not for what the code does.** |

## What was just done, and why

**THE RULE OF THREE NOW HAS BOTH OF ITS HALVES, AND THERE ARE TWO CLOCKS.**
This program kept the rule as a CEILING — state a thing twice and the third
must differ — which is the habituation half of the law and only one limb of
the curve. The research says liking has to be BUILT first: repetition produces
processing fluency, fluency reads as pleasure, and the two together make the
inverted U (Huron/Margulis, "A Psychological Approach to Musical Form: The
Habituation–Fluency Theory of Repetition", *Current Musicology* 2013; Huron and
Ollen 2004 put literal repetition at 94% of passages across five continents and
five centuries).

**`form.leastTurns` (3) is the floor.** A section's length pool is narrowed,
before the draw, to the lengths that give its phrase at least three turns of
its own loop — the same shape as `introSec`, and a genre that cannot satisfy it
is refused at load. Measured over 40 seeds: body sections below three turns
went **78 → 0** (lofi) and **28 → 0** (dungeon synth). The intro is exempt
because it is under the opposite pressure and says so; the outro because a
floor is about a section that carries on.

**`arrangement.alterEvery` (3 bars) is the fast clock.** The two-loop rule sets
the slow one — four bars in lofi, eight in dungeon synth — and between those
boundaries every part of the record used to be held perfectly still. Now no
stretch longer than three bars goes by unaltered.

Measured over seeds 1–40, `git worktree add` at `6037a42` against HEAD, the same tool and the
same seeds on both sides:

| runs of 3+ identical turns | lofi keys | lofi bass | lofi drone | ds keys | ds bass | ds drone |
|---|---|---|---|---|---|---|
| before | 34% | 31% | 1% | 19% | 15% | 11% |
| after | **17%** | **20%** | 5% | **12%** | **12%** | **6%** |

Desk moves went from one every 13.3 bars to one every **5.5** (lofi) and 12.9
→ **4.9** (dungeon synth); records that never move the desk at all went 4/40 →
0/40 and 1/40 → 0/40. Boundaries 235 → 537 and 351 → 938.

**AND `lofi drone` GOT WORSE, 1% → 5%.** It is the one part in either genre
that this made staler, and it is in the table rather than left out. `answered`
also falls everywhere — lofi keys 45% → 39%, ds drone 61% → 52% — though the
absolute count of unanswered parts drops, because far fewer parts reach "due"
at all (lofi keys due 231 → 156). Whether a lower share of a much smaller
number is a win is a real question and not a settled one.

**AT A BAR POINT THE ROSTER IS FROZEN.** Only the slow clock may change who is
playing — that is what the two-loop rule is about — so a bar point may spend
only the half of the rule's four ways that leaves the roster alone: expression
and the desk. It has to be that half: `perform.test.ts` holds a figure played
again to being played the same way, and gain and the desk are the two things
outside that comparison. This is one guard in `push()`, where legality lives.

**It is ONE walk, not a second pass.** The fast clock is more POINTS for the
existing loop — same pool, same score, same ledger, same freshness counters. A
loop beside the loop that already chose is what cost this program its climax
once.

**And the bill, exactly as `README.md` warns.** Removing the limit broke seven
tests. Two were real defects, fixed in `push()` where legality lives: a part
could be marked held back while not sounding (the same defect `1febbc5` fixed
for the kit, reached by a different road), and the peak accumulated
subtractions across its extra points — 24% of lofi's peak spans held back two
things or more, which is the exact regression this file already records from
the previous attempt at more moves per boundary. **The fast clock therefore
does not run at the peak or in the run-up**, for the reason already written
beside `picksHere`. Four were stale copies of the old span arithmetic —
`Span.startBar` exists now and spans are no longer evenly spaced, so
`perform.ts`, `stale.ts`, the roll and three tests that mirror the lookup by
hand all had to follow.

**ONE IS STILL FAILING AND IS NOT FIXED:** `arrange.test.ts` "the break goes
below the floor mid-record" — 14% of records have a break against a threshold
of 15%. The cause is the phrase floor, not the bar clock: lofi's bridge pool
was 4 and 8 bars, and at a four-bar loop neither states its phrase three times,
so the bridge stopped being affordable and the break sits where a bridge would.
A 12-bar bridge was added (`[chosen]`, lowest weight) and took it 11% → 14%.
**Weight is not the lever** — at weight 3 it is still 14% — because a 12-bar
bridge plus its 4-bar keep-back needs 16 bars of room and a 44-bar lofi record
rarely has it. This is a real trade: a three-turn floor costs a short-record
genre its bridge. The threshold encodes research, so it has NOT been lowered.
It needs an owner's decision, and the options are a longer lofi record, a
`leastTurns` lofi states for itself, or the break not needing a bridge.

**AND DRIFT IS BACK IN, ON ITS OWN.** Item 6c, restored as its own change and
measured on its own. `arrangement.drift` 0..1 — how much of its span a
treatment takes to arrive. lofi 0.5, dungeon synth 1, both with the sources
they had. `DeskChange` carries `overSec`; `render.ts` walks the continuous
knobs — levels, sends, returns, the pole, the tape's top, the medium's mix,
the world — from wherever the desk stands to where the treatment puts them, in
1024-sample steps at ABSOLUTE positions. A knob that changes what a unit IS
still steps at the walk's start, because a room cannot be half a second longer
on its way to being a second longer. `Pole` gained `set()`: a cutoff that moves
keeps the filter's state, where a new `Pole` started from silence.

Measured, walk against step on the same record (same notes, same roster, same
desk order — only `overSec` differs): **−45.0, −40.5, −37.7 dB on lofi** and
**−30.4, −39.5, −21.7 dB on dungeon synth**, seeds 17279 / 204149 / 327517.
Dungeon synth moves more than lofi, which is what drift 1 against drift 0.5
predicts. Byte-identical at block sizes 577 and 4096. Render cost 0.95x and
1.07x.

**THE KNOBS MOVE ON THEIR OWN NOW — `src/sound/motion.ts`, COPIED FROM MKII.**
The owner asked how MKII did this. It has a whole MOTION stage with four
timescales — a value per STEP, per SECTION, per BAR and per EVENT — and its
own note draws the distinction this program had lost:

> "CLOCK A and CLOCK B are free-running cycles and they only ever reached ONE
> destination — the detune — which makes them a **drift, not an LFO**. These
> two are LFOs in the sense the question means: a rate, a depth, a shape, and
> A SOCKET YOU CHOOSE."

By that measure MKIII's `drift` is a drift. This is the other thing.

**What is copied:** the four shapes returning −1..1 so depth reads the same on
all four; rates IN BARS so two cycles can be made coprime; the RESET TRIGGER,
which is the half most programs leave out (MKII cites Doepfer's A-145 and
Batumi — "reset returns the LFO to the beginning of its cycle so that it is in
sync with the rest of your patch"); and `off`, which moves the centre so a
knob already at the top of its travel ducks rather than spending half a cycle
clamped.

**What is better here.** MKII's LFO chooses from a numbered list of six
destinations, each needing a hand-kept entry in a `SPAN` array saying how far
that knob may travel. Six is a ceiling and the table is a thing to keep in
step. A move here names its knob BY PATH — `rack.tape.drive`,
`mix.keys.level` — so all 202 of the mixer's numbers are reachable and nothing
is declared to make a new one reachable. There is no SPAN table because depth
is a SHARE OF THE KNOB'S OWN VALUE, so one line means the same thing on two
different mixers. Frequencies swing in octaves, the way `render.ts` already
walks them.

Measured, motion on against off, seeds 17279/204149/327517: **lofi −28.1,
−26.3, −26.4 dB; dungeon synth −27.2, −32.1, −28.4 dB.** Byte-identical at
block sizes 577 and 4096. `motion.test.ts` holds it to the −40 dB floor
`treat.test.ts` uses, to being a pure function of the bar, to the cycle coming
round, to a section reset actually resetting, and to a genre that states no
motion rendering bit-for-bit what it always did.

**AND THE FLOOR CAUGHT TWO DEAD DESTINATIONS BEFORE THEY SHIPPED**, which is
the whole reason it is there. lofi's first two moves were the obvious readings
of its own source ("a filter that opens slightly") and both were nothing: the
pole is at `mix` 0 on this genre, and the tape's LOWPASS measures −42 dB
because this genre's voices have nothing above the 10 kHz it already passes —
the same fact `treat.test.ts` records when it refuses `brighten` here. A full
octave and a quarter of swing still only reached −34. The drive reaches −26.8,
and it is the knob the genre is named for.

`resolve.ts` now refuses at load a move whose path is not a knob, or whose
knob sits at zero — depth is a share of the knob's value, so a share of
nothing can never be anything.

**AND MOTION EXPOSED A DEFECT IN THE RENDERER, WHICH IS NOT FIXED.**
`world.width` produces **non-finite samples** when it MOVES. A static width is
clean at every value tried (0.6, 0.8, 0.9, 1.0); a width swinging ±50% of 0.6
gives its first NaN at 57.7s of lofi seed 17279, and ±30% and ±10% are clean.
So it is the transition, not the value. `Channel.tune` recomputes `lateSec`
and keeps a `Line` created once with `??=`, and `Line.read` interpolates at a
fractional position — that is where to look. **This is reachable from the page
today**, because `setDesk` lets a hand move width while the record plays, so
it is not only a motion bug. No genre ships a width move; nobody should add
one until this is understood.

**THE NOTE THE TAG WAS SUPPOSED TO HOLD THIS IS GONE.** Item 6c says the work
is preserved at tag `wip/staleness-clock-bolted-on`. That tag does not exist —
not locally, not on the remote. The code was recovered from commit `d99d896`
("The desk walks, and the rule of three is counted per part"), which is where
it was added, and `ecc4ab9` is where it was removed. Fix the note or drop it.

**AND A STEPPED DESK CHANGE DOES NOT CLICK, WHICH IS A FACT ABOUT THE PROGRAM
AND NOT A REASON FOR DRIFT.** Measured: the biggest sample-to-sample jump
within 20 ms of a desk change, against the biggest anywhere else in the record.
With a STEP the desk change is **quieter than the record's own loudest
transient** in three of four cases (0.47x, 0.65x, 0.96x) and above it in one
(dungeon synth 327517, 1.19x). The walk does not systematically improve that —
lofi 17279 goes 0.47x to 0.64x — and only dungeon synth 327517 moves the way a
click would, 1.19x to 0.55x. So drift is a musical move, a filter that opens
gradually, and it earns its place on the dB and its sources. Anyone reaching
for it to stop a click should measure first: on this evidence there is no
click to stop.

**NOBODY HAS HEARD ANY OF IT.** The desk now moves about two and a half times
more often than it did (1 per 13 bars to 1 per 5), and on dungeon synth it is
now never still — drift 1 means a treatment arrives exactly as the next
boundary asks for the next one. Whether that is a record developing or a
record being fiddled with is exactly the question `TALLY.md` §0 says a measurement cannot
answer, and it is now more urgent than it was.

**THE STAGE IS NOW HELD TO THE RULES IT STATES, AND THREE OF THEM WERE NOT
BEING KEPT.** This is the one to read first, because it is why the two before
it kept breaking. `arrange.ts` states its rules in prose and in the comment
beside each `push`, and nothing checked that the spans it makes obey them.
They were kept BY ACCIDENT OF THE WALK — one move per boundary, each built by
a `push` that had already applied its own guard — and a rule kept by the shape
of the walk is a rule the next change to the walk breaks, silently. Every
attempt to change how a boundary moves broke something else, one test failure
at a time, until this landed.

Three were live faults. `thin` is the KIT's expression, and the stage set it on
**338 sections of 600 records that had no drums in them** — moving no note, and
printing "thin" in the record's own text and picture for a kit that was not
there. A break is not thinned, and the section refused it while the pool did
not, so a span move thinned a break in **8 records**. And the header claimed
every span is a subset of span 0, "checked over 334 sections, 0 differ" — false,
and false when written: a part walks in at the first boundary 746 times and
`part-back` restores from the base 690 times more. What is true is that every
span is a subset of `Placed.heard`, which is their union.

`arrange.test.ts` now asserts all seven span rules over both genres and 120
records. **Anything added to this stage has to keep them.**

**A boundary cannot answer the same way twice.** `fresh` wears out a move's
KIND as well as its name, within a section — the two-loop rule's own four ways
and the desk beside them. `BUILDING-THE-ALTERATIONS.md` Phase 1 had already
recorded this gap and left it: "`keyOf` returns `move:role`, so a record can
play the same KIND of move seven times running by rotating which part it
happens to." It turns out to be most of the fix for the rule of three per part.
A part's third statement is altered **32% → 49%** (lofi) and **47% → 71%**
(dungeon synth); the longest a sounding part goes unaltered falls 28 → 16 bars;
the peak IMPROVES — a part held back there 14% → 5% and 22% → 11%. Cost: parts
taken out roughly halve and desk moves rise 13% → 19% and 18% → 28%. Fewer
players leaving, more colouring, and nobody has heard it.

**The line can move to another voice.** `revoice`, §1 moves 1 and 7. `voices`
is the FIRST field of `SoundSpec` and `render.ts` reads it per note, so the
machinery was always there and no treatment wrote it. A part borrows the
instrument of another part OF THIS RECORD — the palette stays the genre's — and
only a voice that HOLDS what its line holds, because the Rhodes settles at 0.08
of its peak and lending it to a drone deletes a four-bar note. −0.7 to −17.0 dB
against a −40 dB floor: the strongest class of move this desk has.

---

### And five ways NOT to do the rule of three per part

Read this before trying again. Every one of these was built, measured and
reverted in one session, and they all failed the same way.

| attempt | what happened |
|---|---|
| an obligation term weighted by how many parts a move reaches | hit the target (60%/82%) and pushed the desk to a third of all spans while `hush` fell 13% → 1% and part-outs fell two thirds. `perform.test.ts` caught it twice |
| the same, made binary | did nothing at all — back to baseline |
| several moves per boundary | broke four invariants the single-move design was holding for free: the peak, the run-up into it, a treatment never moving who plays, the kit staying halved after the drums left |
| the same, with those four guarded | +2 to +5 points, and the peak got worse — **superseded: see §6b, this was tried again properly and works.** The four are guarded in `push()` where legality lives, the peak and the run-up spend one change by section rather than by energy, and the gain is +14 not +5 |
| pricing `hush` as expression rather than by `affords` | +1 point, and parts held back at the peak went 5% → 27% and 11% → 52% |

**~~The reason is arithmetic, not tuning.~~ THIS WAS WRONG.** It said: a span is
two statements, so about 2.4 parts per boundary are going into a third; one
move alters 1.2 of them; ~50%/72% is the ceiling. The premise "one move per
boundary" was never a rule — it was a `let best` — and §6b below has the
measurement. Left here because it is the exact shape of the mistake this
program keeps making: a limit of the code read back as a fact about music.

**And `affords` is a real category error, still unfixed.** It is built from the
genre's `shed` order — what a genre can afford to LOSE — and it prices `hush`,
which does not lose a part. lofi sheds its keys last, so its keys score 0.2 and
its bass 0.4 for being quietened, and those are exactly the two parts that go
unaltered most. Flattening it is not the fix: it makes hushing cheap at the peak
too, where density moves are refused and expression is the only lever. It needs
a price that is high mid-section and low at a climax, which is a design question.

---

**The foundation under the treatments, because two of them were doing
nothing.** Twelve treatments were built, weighted by two genres, scored by the
arrangement and rendered, and the only thing holding any of it to its purpose
was one assertion that the record with its whole desk timeline differs from the
record with none — which passes while eleven of the twelve are dead. Asked one
at a time, two were. `render.ts` builds only what something feeds, and it knew
that in a private method; `treat.ts` compared the treatment's numbers against
the genre's numbers and called that "does it do anything". So dungeon synth was
offered `echoed`, a genre no part of which sends a drop to the echo: the move
turned two numbers and the record came back **bit-identical, −225 dB**. lofi
was offered `brighten` with its pole at `mix` 0, out of the sum: −37.7 dB, and
it held 6.3% of every lofi record — in six of the first eight seeds it was the
record's second treated span. `sound/reach.ts` now states the renderer's
liveness rule once, `deskOf` asks it, and `stage/treat.test.ts` renders every
treatment of every genre and measures it. Not a note moved: over 40 seeds a
genre, every event and every roster is identical.

And the desk tests were running at 8 kHz, where `Pole`'s `sampleRate / 6`
stability clamp pins dungeon synth's filter — so `darken`, this genre's own
headline move and 39% of its treated time, was **exactly a no-op in the test
that was supposed to prove the desk is heard**. Both moved to 22050 Hz.

Then two older lines of work, also on this branch.

**Treatments — the desk moves instead of the notes.** When an idea came round a
third time the old code varied its notes, which made a third of every record
unique and unmemorable: heard once, never again. The rule-of-three demand now
travels to the arrangement instead. An idea that will not return is marked
`recast`, and the arrangement moves the desk — darken, drench, wear, far and
eight others — leaving every pitch alone. Variants heard once fell 33% → 0%.
Desk changes land on their exact sample, so a record is byte-identical whether
rendered in 577-sample or 4096-sample blocks.

**The arrangement got a memory.** It chose who played in a section by walking a
list the genre wrote before the record existed — same names, same order, every
section of every seed. A list has no memory, so nothing that happened in a
record could affect it, and a rank that cannot change as a consequence is not a
story (Almén). Measured, that gave two opposite failures of the one missing
idea: lofi's opening part played 91% of the record and was never gone more than
three bars, so nothing ever happened to it, while dungeon synth abandoned its
opener outright in a quarter of records. It now picks the part the record can
most spare, out of what has actually happened; the genre's `shed` order
survives as a weight rather than an order. Parts stopped being abandoned — gone
for good fell from 15% and 25% to 5% in both genres.

## What needs doing

**1. Nobody has listened yet.** Every claim about the treatments is a
measurement, not a hearing. Does a cutoff moving 3600 → 1620 Hz in one sample
*click*? Is a third of spans on a treated desk right, or too much? Do the
changes land as musical events or as faults? Play seeds 1–10, 42 and 829055,
and write what you hear into `TALLY.md` §0. Nothing else on this list matters
as much.

There is now a ranked list to listen against — `node tools/treatments.ts`, and
the table in `THE-ALTERATIONS.md` — and it asks three questions in particular.
`wear`'s difference signal is LOUDER than the record it differs from (+3.3 dB
on dungeon synth, 18% of its treated time): is that a section ageing or a
different pressing? `dry` and `drench` move the LEVEL by ~2 dB, which is the
one thing a treatment was not supposed to do. And half of lofi's vocabulary
sits 17 dB below its own `darken` — if those are inaudible the fix is in
lofi's desk, which gives one part a pedal board and no pole at all, not in the
treatments.

**2. ~~`THE-ARRANGEMENT-AS-STORY.md` §8 cites numbers this repository cannot
reproduce.~~ DONE.** `node tools/measure.ts --sweep <genre> 1 20 --parts`
reports, per part, its share, its longest absence, whether it plays at the end,
and whether the most-present part changes between halves — read off the file
like the rest of that tool. And `tools/stale.ts` reads the composed record for
the thing the file cannot carry: how many turns a part plays identically before
anything about it changes. Both landed with `THE-STALENESS-CLOCK.md` Step 0.

**3. ~~lofi's hierarchy does not move.~~ DONE — and the diagnosis in this
entry was wrong.** It read "its drums sit at the bottom of its OWN shed order".
They did not: lofi stated no shed order at all, and inherited the pop default
`drone, keys, lead, bass, drums` — so the genre that ENTERS on its keys shed
its foundation second and its beat never. `affords()` is the only voice a genre
has in who leaves, and it gave lofi's drums 0.2, the minimum, in both the
section walk and the span score; at span level `hold-back` (the drums thinned)
is priced at 1 against `part-out` (the drums gone) at 0.2, so the stage could
only ever take the hat. Measured over forty seeds: the drums were heard in 100%
of bars, in 40 records out of 40, and were never once absent for a single bar.

lofi now states `shed: ["drone", "lead", "drums", "bass", "keys"]` with its
sources. Drums 100% → 78% of bars, longest absence 0 → 10 bars, never-absent
40/40 → 4/40; the most-present part changes between the halves of a record in
21 seeds of 40 where it changed in none. The same fault dungeon synth found in
the same default, with the parts swapped — so no new term was needed, only the
genre saying the sentence `spec.ts` already says is its to say.

The lesson worth keeping: this entry sent a reader into `arrange.ts` looking to
build "a term that knows about RANK rather than presence", when the genre-voice
term was already there and had simply never been given a value. A doc that
mis-states where a number comes from costs more than a missing doc.

**4. ~~Two genre proposals, both one line, both sourced.~~ BOTH APPLIED, and
neither ended up being the one line it looked like.** `introSec: 64` is now a
constraint rather than a number: `resolve.ts` refuses at load an intro length
that cannot fit under the genre's own ceiling at its own fastest tempo, and the
silent fallback in `form.ts` that used to take the shortest length whenever
nothing fitted is gone. `fewest: 1` at the outro is not a second value for
`fewest` at all — a floor is about a section that carries on, and the last one
does not, so the ending is floored by what the record OPENED with instead.
Numbers in `TALLY.md` §2.

**5. ~~The absence ceiling has no number and may not need one.~~ TESTED — and
there was never a ceiling.** Over 500 seeds a genre the absence distribution is
identical with the `1/(1+out)` term, without it, and with `share` dropped
instead: lofi median 8 / p90 20 / p99 32 / max 36 bars, dungeon synth 16 / 40 /
56 / 88. The term is not a soft ceiling; it is not a ceiling. It does move
abandonment — and `share` and it pull opposite ways, `share` carrying lofi and
the ceiling term carrying dungeon synth, with the product worse than the better
single term in both. Not deleted, because it does something; the claim it
carried is corrected in `arrange.ts` and in `THE-ARRANGEMENT-AS-STORY.md` §8.
What is still open is which combination is right, and that is a listening
question.

**THE ALTERATIONS ARE NOW A PLAN, NOT A LIST.** The owner has asked for all 65
built and all 65 available. `docs/BUILDING-THE-ALTERATIONS.md` is the plan —
six phases, what each delivers, what number says it worked, and what could make
it wrong. Items 6 and 7 below are Phase 2 and Phase 5.1 of it. **Read that doc
before starting either**: the pool cannot safely grow until the span score
prices a move's KIND and a genre's LAYER (Phase 1), and that is a hard blocker,
not a caveat.

**6. ~~Ten alterations are still static~~ BUILT — azimuth, pedal swap, patch,
medium, modulation, kit and circuit swap, lane controls.** `TREATMENTS` is 23,
and every one of the eleven added carries the line in `reaches` that says which
unit it arrives through. Measured by `treat.test.ts`, which renders each of
them on each genre: nothing was deleted, because everything offered clears the
floor. lofi is offered 20 of the 23 and dungeon synth 21. `recircuit` is
refused by both — neither genre runs the analogue kit, so there is no other
circuit for it to be — `brighten` by lofi, which has no pole in its sum, and
`echoed` by dungeon synth, which feeds no echo.

The rule that got them there still stands for the rest of the catalogue: add it
to `TREATMENTS`, give `reaches` the line that says which unit it arrives
through, and let `treat.test.ts` say whether it moved the record. A new leaf
that does not clear the floor is a leaf that gets deleted, not one that gets
shipped and measured later.

**6a. ~~lofi rotates rather than chooses.~~ DONE.** lofi now states its own
treatment weights from its own sources, and the even default it was running on
was never even: pool order alone decided a hard 54-to-1 ranking, taken from the
order of a `const` in `spec.ts` that no author chose. `TALLY.md` §2.

**6b. THE RULE OF THREE, PER PART — HALF DONE, AND THE REST IS ARITHMETIC.**
The record has always kept the rule: one thing moves every two turns of the
loop. What nothing counted was the part that was not the thing that moved. It
goes on stating its figure, the next boundary moves somebody else, and the one
after that somebody else again.

`node tools/stale.ts` now counts this directly, per part, and prints two
columns for it. **due** is how many span boundaries a part arrived at having
just stated the same turn twice — the rule says its next turn must differ.
**answered** is the share the pool actually altered. On seeds 1–60:

| | bass | keys | lead | drone |
|---|---|---|---|---|
| lofi | 42% | 41% | 79% | 0% (5 due) |
| dungeon synth | 62% | 63% | 99% | 56% |

**THE OLD CEILING WAS NOT ARITHMETIC. IT WAS A `let best`.** This section
used to say the rest was arithmetic — a boundary spends one move, more than
one part is usually due, so the numbers are near their limit. That was wrong,
and this repository already said so before it was written:
`THE-STALENESS-CLOCK.md` §"Two things the sources say that the program does
not do" — *"The two-loop source never says ONE thing changes. In its own
worked example the producer adds the drums at the first boundary, and at the
second adds hi-hats AND a bigger clap AND a bass AND a counter-melody — four
moves in a single two-loop window. The restriction is this program's."*

"One move per boundary" was a single-winner loop, nothing more. A boundary now
spends up to `MAX_PICKS` (2), and spends the second **only** on a part the rule
of three already owes. Measured on and off — set `MAX_PICKS = 1` in
`arrange.ts` and re-run `node tools/stale.ts`, which is how this project
measures everything else — against the value it ships with:

| seeds 1–60, answered | ds bass | ds keys | ds drone | ds lead | lofi bass | lofi lead |
|---|---|---|---|---|---|---|
| one move | 62% | 63% | 56% | 99% | 42% | 79% |
| two moves | **76%** | **70%** | **60%** | 99% | **47%** | **82%** |

Runs of three or more identical turns fell with it: dungeon synth bass 28% →
16%, keys 27% → 20%, drone 15% → 14%, lofi bass 36% → 33%. Boundaries that
spend a second change: 15% on dungeon synth, 11% on lofi — the rest still
spend one, because the rest have nobody waiting. **lofi's keys did not move
(41%), and lofi's drone is still 0% of 5** — lofi's gain is small because the
second change needs a pool to draw from and lofi's desk is idle in 8 of 60
records. That is item 8, and it is now the biggest single lever left.

**Three real defects came with it, and all three are fixed in `push()` where
legality lives** — the ceiling was not free, and the next person widening this
should expect the same kind of bill:

- Two moves could **undo each other**, leaving a boundary that moved nothing —
  20 lofi and 26 dungeon synth boundaries did. A boundary may now never end
  where it began.
- Two moves could leave the kit **halved with the drums silent**. Same defect
  `1febbc5` fixed for `hold-back`, reached by a different road, fixed in the
  same place.
- A second move in the **run-up to the climax** made it end quieter than it
  began (dungeon synth seed 4, 0.462 against 0.473) — the dramatic arc's
  rising action running backwards. Energy direction is the wrong axis to fix
  that on: the moves that reach a waiting part are mostly the ones that take
  something away, so refusing those refuses the whole gain (83% back to 62%).
  The section is the right axis, so the run-up spends one change.

`arrange.test.ts`'s "a treatment changes the sound and never who is playing"
was re-aimed rather than deleted. Its old reason — *"two moves at a boundary
the two-loop rule allows one of"* — was the same false belief. It now bounds
what is actually true: at a desk boundary, at most **one further kind** of
thing moved. Counting parts would have been wrong, because `all-back` restores
the whole section in one legal move.

**What is still open:** `MAX_PICKS` is a plain module constant, not a genre
field, because neither genre has a reason to differ and a knob no author
varies is the cardinal sin. If a genre ever states it, it goes to `spec.ts`
with a default, a `resolve.ts` check and a source. At 3 the numbers barely
move (ds bass 76% → 84%) and lofi's keys get worse, so 2 is where the evidence
sits.

**AND A WARNING THAT COST THIS SESSION A DEAD PAGE.** These two knobs were
first written as `process.env` reads so they could be measured without editing
a file. All 294 tests passed. The SHIPPED PAGE WAS DEAD — `process` does not
exist in a browser, the bundle threw at module load, and `npm run shot` timed
out waiting for a compose that could never happen. The stages are pure
functions of chart and seed, nothing in the suite is placed to notice one that
is not, and **`npm test` cannot see the built page at all**. Run `npm run
build && npm run shot <genre> <seed>` before publishing anything, and never
let a stage read the environment.

**AND `revoice` DOES NOT HELP THESE NUMBERS — IT COSTS THEM A LITTLE.** It was
built (commit `1e9002e`) as the first move that reaches a part the others could
not, and measured on and off it turns out not to answer a part's due turn as
often as whatever it displaced. Set `["revoice", 0]` in both genre files and
re-run `node tools/stale.ts`:

| seeds 1–60 | bass | keys | lead | drone |
|---|---|---|---|---|
| lofi, on | 42% | 41% | 79% | 0% |
| lofi, off | 42% | 41% | 80% | 0% |
| dungeon synth, on | 62% | 63% | 99% | 56% |
| dungeon synth, off | **65%** | **66%** | 99% | **59%** |

This is NOT a reason to delete it. `revoice` is the loudest thing either desk
can do (−0.7 to −17.0 dB) and it plainly changes the record, so it fails the
cardinal-sin test in neither direction — it is a move to be judged by ear, in
§1 above, not by this table. What it is not is a fix for the per-part rule of
three, and the next coder should not inherit that belief. Its `[chosen]`
weight of 2 is still an owner's decision nobody has made: at 2 it fires about
once in 2200 lofi spans, which is rare enough that lofi's row above is a wash
rather than a result.

Two more rows in the frozen catalogue — `mix.level` and `mix.pan`, rows 36 and
44 — are the obvious next ones to connect, and this table is how to tell
whether they earned it.

Two things are settled and should not be re-litigated from scratch:

- **`affords` is a category error.** It prices REMOVAL, and `hush` is priced
  through it, so the one move that reaches a part directly is the one the
  score is most reluctant to play. Flattening it wrecks the peak — the peak
  law lives in the same term — so it needs a real separation of "what does
  this cost the peak" from "what does this cost the part", not a coefficient.
- **Five ways of counting the rule per part have been tried and taken back
  out.** They are in the table under "What was just done", with why each one
  failed. Read it before designing a sixth.

**6c. ~~DRIFT IS OUT~~ DONE — it is back in, on its own, and the tag this
entry names does not exist.** See "What was just done". The original text
follows because the warning in it still stands for the next restoration.

**6c (as written).** DRIFT IS OUT, AND SHOULD GO BACK IN ON ITS OWN. A treatment that walks
to where it is going instead of switching to it. It was built, it worked, and
it came out with the bolted-on selection loop it was tangled in rather than on
its own merits. The `overSec` field, `Pole.set()` and the ramp are preserved at
tag `wip/staleness-clock-bolted-on`. Put it back as its own change, against
the commit before it, and measure it on and off — it is a knob, and this
program's cardinal sin applies.

**6d. `THE-STALENESS-CLOCK.md` NO LONGER DESCRIBES THE CODE.** It is the
research and the spec for two designs that were built and reverted. Either
rewrite it against what `arrange.ts` now does, or mark each dead section as
dead. It is currently the most misleading file in `docs/`.

**7. Partial variation**, which `THE-ALTERATIONS.md` calls the most useful kind
for a generator: first half identical, second half diverges. Only whole-line
variation exists. That belongs in the material stage, not the arrangement.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `THE-INTRO.md` §7 is the worked example.
- **Take the numbers LAST.** Every fix applied after you measured invalidates
  the measurement — see `README.md` § "Prove it, or it did not happen" for how.
- **And measure whether the RECORD changed, not whether the settings did.**
  That distinction cost two treatments. The renderer builds only what something
  feeds, so a knob can move its number and be wired to nothing; comparing a
  spec against a genre will call that a change every time. Anything that moves
  the desk asks `sound/reach.ts` first, and anything that claims to move the
  record renders it and measures — at 22050 Hz or above, because below about
  16 kHz the filters are pinned by their own stability clamps and a filter move
  measures as a no-op when it is nothing of the kind.
- **Every number a genre states carries its source** in that genre's `sources`
  map. A number with no published source says `[chosen]`. Do not invent a
  citation, and do not cite a page you have not read.
- **The comment is the specification.** Where a doc comment and the code
  disagree, that is a defect to report, not prose to skim past.
- **Rules are written in beats** and resolved against the genre's own metre, so
  a genre in five four needs no new code.
- **Recast is the pivot.** `form.ts` marks an idea that will not return; the
  arrangement opens that span with a treatment rather than a density move. If
  you change the rule of three or the form grammar, retest that path.
- The pipeline is five pure stages, each frozen on the way out. Selection
  happens in the arrangement, before a note exists; the material stage builds
  only what the arrangement will have heard.

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
