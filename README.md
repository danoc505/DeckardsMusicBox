# Deckard's Orchestrator MK2

> ## ⚠ RULE ZERO — WRITE IN PLAIN ENGLISH. ALWAYS.
>
> **The person this is built for is not a musician and not an engineer, and has
> said so many times. Jargon has been rejected over and over. It is still
> happening. So it is a rule now, not a preference.**
>
> This applies to everything you say to them and everything you write down:
> chat replies, commit messages, docs, comments, and the words on screen.
>
> **How to do it:**
>
> - Say what a thing DOES, not what it is CALLED. "The pad plays in every bar
>   and never stops" — not "the harmonic-filler layer is doubled".
> - If a technical word is genuinely unavoidable, explain it in the same
>   sentence, in ordinary words: "the second keyboard (the sustained, chord-
>   holding one)".
> - Short sentences. One idea each.
> - Numbers are fine and welcome — a number is not jargon. "It played in 98 out
>   of every 100 bars" beats "occupancy was high".
> - No borrowed vocabulary as shorthand. Not "blast radius", "conditional
>   rate", "rootless voicing", "drop-2", "spectral filler", "byHand" — unless
>   you say plainly what each one means right there.
> - Never make them ask what you meant. If they have to ask, that is a defect
>   in the writing, not in their understanding.
>
> **Some words that keep appearing, and what to say instead:**
>
> | stop writing | write this |
> |---|---|
> | comp / harmonic filler | the chords, the chord part |
> | keys2 / the pad | the second keyboard |
> | voicing | how the notes of a chord are spread out |
> | blast radius | which songs changed |
> | rootless voicing | a chord with its bottom note left out |
> | occupancy / share of bars | how many bars it plays in |
> | the ostinato | the repeating figure |
> | the counter | the second melody |
> | non-chord tone | a note that clashes with the chord under it |
>
> This rule outranks sounding precise. If a sentence is exact but they cannot
> read it, it has failed.

> ## ⚠ RULE ONE — PRINT THE NOTES AND READ THEM. EVERY TIME.
>
> **The printed notes are the test. There is no other one.** As of 2026-08-18
> the 190-check battery and all 87 probes are deleted — 23,059 lines of them —
> and this is what replaced the lot:
>
> ```sh
> node harness/mk2_score.js
> ```
>
> Every genre, twice — seed 1 and one drawn fresh each run — every instrument,
> every bar, start to finish. Three seconds. Add `--mid out/` and it writes real
> `.mid` files beside the printout and reads each one back to prove it.
>
> Print it **before** the change and **after**, and put the two side by side. If
> you think nothing moved, this is how you find out you were wrong. If something
> did move, this is the only place you can see what.
>
> ## ⚠ RULE ONE-A — A CHANGE THAT LEAVES THE MUSIC BYTE-IDENTICAL HAS NOT BEEN MADE.
>
> > *"Why are you concerned if everything stays the same when you're supposedly
> > CHANGING the way everything is? Something in your instructions is making you
> > make changes that DO NOTHING and then you prove they done nothing by testing
> > that they have not changed anything! This is WRONG WRONG WRONG."*
> > — the owner, 2026-08-28
>
> **A test whose passing condition is that the music did not move is a test that
> the fix was not applied.** Byte-identity has one legitimate use: proving a new
> mechanism is inert while it is still switched off, as one step before you
> switch it on **in the same build**. It is never a result and never evidence
> that work was done.
>
> **The corollary, which cost this program real music: a default that no genre
> overrides is a fix that was never made.** `theme.noRepeat` gated the fix for a
> defect the owner reported **six times**. No genre ever declared it. So the
> defect ran at 8–13% of the lead's notes for the flag's whole life — and the
> code behind the flag held a **ReferenceError that had never once executed**,
> because the test being run was "did the music stay the same", and it did.
>
> Before you put a number in a table, ask whether it is a **taste** or whether
> it is **what the thing is**. An interval budget is a taste and defaults to the
> old value. A note having a *length* is not — so it defaults to the fix, and a
> genre argues downward. If it is a fix, ship it **on**, in the same build, and
> print the notes.
>
> **Why the battery went.** Two reasons, and the second is the bad one:
>
> - It took twelve to fifteen minutes and printed **zero notes**. Everything it
>   could tell you was a percentage — "44.2% of 4136 leap away" — and a
>   percentage is not a thing you can look at and judge. It was green for months
>   on a banjo holding 3.3-second notes, a ride cymbal playing the identical bar
>   seventeen times, and two of eight chairs barely in the record. All three were
>   found by printing the record and reading it, in one afternoon.
> - **Every one of those ninety-odd tools was reading the wrong file.** They read
>   `Boxcar Synth.html`, a one-genre side project, and not the program. Since
>   2026-08-17, silently. `mk2_roll.js 1 --genre lofi` printed boxcar synth and
>   exited 0. The printout names the file it read on its first line now.
>
> **And there is a second way to look, in the program itself: THE ROLL**, at the
> top of the page. It draws the same notes through the same function the .mid
> export uses, so it shows the file you would export — the whole song at once,
> one colour a part, click a part to see it alone. Use it to read the
> ARRANGEMENT (what the groove and the arc thinner actually did) and the printout
> to read the MATERIAL (what stage 3 wrote). They are different pictures on
> purpose and the difference is worth knowing.

A generative-music instrument that composes and plays complete songs — drums,
bass, chords, melody, a second melody and a repeating figure — with a rack of
modelled machines you can put your hands on while it
plays. It ships as **one self-contained HTML file**: no server, no build step,
no internet, no dependencies. Open it and press play.

```
Deckards Orchestrator MK2.html   ← the whole program. Double-click to run.
```

## What it does

Six stages, each one freezing its output before the next reads it:

```
CHART → FORM → MATERIALS → ARRANGEMENT → PERFORMANCE → SOUND
```

**There are no correcting passes.** MK1 had a "ghost pass" that repaired
violations after the fact; removing that idea is the central reason MK2 exists.
Material is valid because its owner made it valid, or its owner redrew. Every
law is a *constraint on the next choice*, never a fix applied afterwards.

Same `(seed, genre, rig, picks, pins)` → the same song, exactly. There is no
`Math.random` anywhere in the file; randomness comes from named substreams, and
draws execute unconditionally so adding a feature cannot silently move songs
you did not touch.

A genre is **parameter tables only** — no code below stage 1 may name a genre or
branch on one. Genres can also be *blended*: the sliders resolve any mixture to
one table before a note exists.

How many genres, and which, is deliberately **not written here** — a list in
prose goes stale and this one already did, twice. Ask the program:
```js
MK2.genres()
```

## Layout

| Path | What's inside |
|---|---|
| `Deckards Orchestrator MK2.html` | **The program.** Everything: engine, rack, panels, UI. |
| `harness/` | **The printout** — `mk2_score.js`, the only test — plus the publish record and the sample-bank builders. Start at `harness/README.md`. |
| `docs/HANDOFF-MK2.md` | **Read this before touching the HTML.** The constitution, the laws, what is done and what is not. |
| `docs/genre-research/NOTES-FROM-THE-USER.md` | The running log of what was measured, what turned out wrong, and why. Read it with the handoff. |
| `docs/` | Genre research, corpus sources, licensing, arrangement and synth research. |
| `corpus/` | Python scripts that ingest open sources and build the embedded tables. |
| `samples/` | Sample assets that belong to the repo (payloads are embedded, corpora never are). |
| `Improv Machine playable_BETA 0.1.html` | **MK1. Frozen** — reference and corpus source only. Its synthwave synth and drums are worth reading before redoing either. |

## Running the tools

No build step — the printer reads the shipped HTML directly.

```sh
node harness/mk2_score.js                       # THE test. Every genre, seed 1 + a drawn one
node harness/mk2_score.js --genre lofi --seed 7 # one record
node harness/mk2_score.js --mid out/            # ...and real .mid files with it
node harness/mk2_stamp.js check                 # is the published page this build?
```

`harness/README.md` has the rest of the flags — the blend faders, the rack, the
length dial — and the four files that are left in there.

## The four principles

The design in one breath — when a decision is not covered by a written law,
decide it the way these point:

1. **Constraints, not baked-in values.** A genre or stage declares a
   constraint and the program works inside it. A literal value wired into
   stage logic is a defect even when it sounds right.
2. **Soft laws and hard laws.** A hard law is definitional and holds for every
   genre — an intro can only be at the start of a song, an outro only at the
   end. A soft law is a habit with weights, and lives in the genre tables
   where a genre can lean on it or not.
3. **Music theory is the physics engine.** Scales, chord tones, resolution,
   registers: collision rules, not style choices. Genres move inside them, and
   a violation throws — the program does not negotiate with physics.
4. **Music is novelty, constrained — driven by arithmetic and randomness.**
   Pure rule is a loop; pure dice is a shuffle. The music lives between,
   and the constraint is the generator.

## Design laws (the short version)

- **Honesty above all.** If you have not measured it, say so. If a test passed,
  say which test. Mark guesses `[GUESS]`. A green checkmark you did not earn
  costs more than a bug you reported.
- **One owner per property.** If two places can write it, it has no owner.
- **No correcting passes.** Constrain the next choice; never repair the last one.
- **Seam checks throw.** `composeSong` proves its own output every song.
- **Provenance on every constant** — `[corpus:…]`, `[theory]`, `[CHOSEN]`,
  `[GUESS]`. A provenance that does not match its constant is *worse* than none,
  because it stops anyone checking.
- **When a measurement surprises you, suspect the measurement first.**
- **Full research for every genre you touch.** You have no a verdict on it; published
  data — measured structures, artist interviews, named analyses — is the only
  signal that can improve this music. Research lands in `docs/genre-research/`
  with named sources *before* the table changes. Never from imagination.
- **The user's a verdict on it are the final judge.** Ship the file; do not render songs at
  them.
