# SHEETS DELETED WITH THEIR GENRES — `2026-08-17`

*The owner: "We are going to delete the genres blade runner, plastikman, hobbit
synth, acid, jungle, and ambient. Our main focus is boxcar synth."*

This file exists for one reason: **older documents in this repo point at sheets
that are no longer here.** A dead pointer with no explanation is how a reader
concludes the repo is broken, or worse, goes looking for research that was
never written. Everything below was removed deliberately, on the same day, for
the same reason.

## What went, and why

| sheet | it was the research for |
|---|---|
| `acid.md` | the acid house genre table |
| `ambient.md` | the ambient genre table |
| `bladerunner.md` | the Vangelis / Blade Runner genre table |
| `bladerunner-form.md` | that genre's form |
| `jungle.md` | the jungle genre table |
| `jungle-bass.md` | jungle's bass — the `riff` builder's sources |
| `jungle-form.md` | jungle's form |
| `jungle-harmony.md` | jungle's harmony |
| `plastikman-minimal.md` | the minimal techno deep dive |
| `minimal.md` | the first minimal techno research |
| `autechre.md` | the `ae` rack's half of minimal techno |
| `prog-techno.md` | prog-techno, a genre already withdrawn at `2026-08-14` |
| `techno-and-minimal-2026-08-09.md` | the fresh techno research |
| `techno-what-kind-of-object.md` | what kind of object a techno track is |
| `grit-and-the-fantasy-axis.md` | hobbit synth's "gritty but orchestral" brief |
| `../GENRES.md` | a genre table that had been stale for months — it still listed `house`, `citypop` and `barber`, none of which had existed since MK1 |

## The rule that decided each one

**A sheet goes when its only subject is a deleted genre. A sheet STAYS when it
sources a mechanism the program still has** — deleting those would leave live
code unsourced, which this repo's rules forbid outright.

That is why `lotr-themes-measured.md` is still here although hobbit synth is
not: the two-element walking bass cell in `buildBass` cites its transcriptions,
and that builder is live for every genre. Same for `phasing.md`,
`bus-compressor.md`, `the-part-that-answers.md` and the rest — the genre that
prompted the research is gone; the thing the research explains is not.

## Where the sources went

Where a deleted sheet was the only citation for something still in the program,
the quotes and `[corpus:...]` tags were moved **inline into the code comment**
before the sheet was removed. The `riff` bass builder is the worked example:
its dogsonacid, interruptor and soundfingers quotes now sit above the builder
itself, verbatim, rather than behind a pointer.

**Verbatim quotations kept their wording**, including the genre names inside
them. Rewriting a source to remove a word is worse than leaving the word.

## What this cost, and it is not zero

Deleting the genres left **69 panel controls that no surviving genre
automates** — the whole flange, the whole DP4, most of the matrix crossings,
the resonator, the 303's engine knobs, the drone rack's and the CS-80's. The
machines still work and a hand still moves them; what is gone is any genre that
moves them for you. `mk2_test.js` says so out loud and is red on it by design.
`BACKLOG.md` §0zz is the entry.
