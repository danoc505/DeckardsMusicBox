# Dungeon synth arrangement: what the sources say, and what this program does

Research first, then the measurements. Everything below is a named source or a
measurement of this program; anything neither is marked `[chosen]`.

`MELODY-AND-THE-HOOK.md` is about the line, `THE-INTRO.md` is about the first
thirty seconds. This one is about the middle: which parts are playing, when
they arrive, when they go, and how the record ends. The general rules are
already in `src/stage/arrange.ts` — Sound On Sound's "dropping out an
instrument at a time", the two-loop rule — and they are pop-arrangement
sources applied to every genre. **This document asks what dungeon synth's own
literature says instead**, and every number here is dungeon synth's.

Measurements are `node tools/measure.ts --sweep dungeonsynth 1 60 --map` and a
sixty-seed sweep of the composed form, at the genre's own length.

---

## 1. What this program does now, measured

Sixty seeds, dungeon synth against lofi so the shape of the difference is
visible:

| | dungeon synth | lofi |
|---|---|---|
| length | 5.6 min (3.9–7.6) | 2.6 min |
| sections | 6.0 (4–9) | 5.6 |
| bars in a section | 16.3 (8–32) | 9.2 |
| intro | **8 bars, every record** | 4 bars, every record |
| parts sounding in bar one | 1.2 | 2.4 |
| parts in the last section | **3.0 (3–4)** | 4.0 |
| the record **ends on the drone alone** | **0%** | — |
| the record ends with the drone in it | 100% | — |
| thinnest section | 1.2 parts | 2.3 |
| fullest section | 5.0 parts | 5.0 |
| energy floor → ceiling | 0.26 → 0.96 | 0.27 → 0.95 |
| who opens | drone 50% · drums 27% · drone+keys 13% · drone+lead 10% | drums+keys 50% |

Read the bold lines. Two of them are the subject of this document: **the intro
is never anything but eight bars**, and **the record never ends the way the
genre's own literature says this music ends**.

---

## 2. The structure is not a pop structure, and the source says so outright

> The structure of dungeon synth is **not based on the typical pop song
> progression of introduction, development, turn, and conclusion, but rather
> on carefully sustaining a single mood**.
> — note.com/soundwitches, "What is Dungeon Synth? A Comprehensive Guide"

> Dungeon Synth is all about atmosphere… **Less is more.**
> — dungeon-synth.neocities.org, "Music Making Guide"

**What this constrains.** Everything in `arrange.ts` is sourced from pop
arranging — Sound On Sound's five-elements maximum, the two-loop rule from
musictech and musicradar. Those are rules about holding attention across a
three-minute single. This genre's own source says the goal is a different one,
and the arrangement moves that serve "sustaining a single mood" are a subset of
the moves that serve a pop arrangement, not the same set. The program is not
wrong to use them — it is using them without the genre having said which ones
it wants.

---

## 3. The four-part shape, in bars

The one source that states the arrangement as a table:

> 1. **Introduction (8–16 bars)**: a single melody or drone quietly emerges.
> 2. **Presentation of the Theme (16–24 bars)**: pad sounds layer in, and the
>    central theme melody appears.
> 3. **Development (16–24 bars)**: deepen the shadows of the sound through
>    changes in reverb and filters; you may also add subtle ritualistic
>    percussion.
> 4. **Conclusion (8–16 bars)**: **gradually reduce the elements until only
>    the initial drone remains, ending quietly.**
> — note.com/soundwitches

And what the whole thing is held together by:

> maintaining significant dynamics and valuing the **contrast between quiet
> sections and thicker, layered parts**
> — ibid.

Against the genre's own `form.lengths` and the sweep:

| the source | the genre table | measured, 60 seeds |
|---|---|---|
| intro 8–16 bars | `intro: [[8,2],[16,2]]` | **8.0 bars, 8–8** — the 16 is never drawn (§6) |
| theme 16–24 bars | `verse: [[16,4],[32,2]]`, `chorus: [[16,3],[32,1]]` | 19.4 bars, but **21% of theme sections run to 32** — over the source's ceiling |
| development 16–24 bars | `instrumental: [[16,3],[32,1]]` | same |
| conclusion 8–16 bars | `outro: [[16,2],[8,2]]` | 12.5 bars, 8–16 ✓ |
| "a single melody or drone" opens it | `introParts: 1` | 1.2 parts in bar one ✓ |
| significant dynamics | — | energy 0.26 → 0.96, 1.2 parts → 5.0 parts ✓ |

Three of the six already hold, and the two the genre states in its own table —
`introParts` and the outro's length — are the two that were reasoned to
independently and land on the source. The dynamic range is wide and is the
thing the source cares most about.

---

## 4. The ending is the one clear failure

> **Gradually reduce the elements until only the initial drone remains, ending
> quietly.**
> — note.com/soundwitches

This is a specific, checkable claim, and it is the only place in any of this
research where a source describes the END of a dungeon synth record. Measured
over sixty seeds:

| | |
|---|---|
| the record's last span is the drone **alone** | **0%** |
| the record's last span contains the drone | 100% |
| parts in the last section | 3.0 (never fewer than 3) |
| the last section is thinner than the record's fullest | 100% |

The record does reduce — every one of sixty thins toward the end, and the drone
is always among what is left. It just cannot get down to one part, because
`arrangement.fewest` is **3**, inherited from the shared default; dungeon synth
does not state one. A floor of three is a pop-arrangement number (Sound On
Sound's "five elements at one time" is about how *full* a record gets, and a
three-part floor under it is `[chosen]`), and this genre's source asks for a
floor of one at exactly one place: the end.

Note the shape of the mistake. It is the same one `arrangement.shed` already
has a long comment about — the genre inheriting a default written for music
that is not it — and it is caught the same way: by a source that says what this
music does, and a measurement that says the program does not do it.

`THE-INTRO.md` §5 built the break for the same reason: "the only place this
program is allowed under `fewest`, and the reason it is allowed there is that
without it no part is ever alone after bar one." The break is the middle of the
record. The source above says the END is the other such place, and nothing has
been built for it.

---

## 5. Layering is the method, and the form is loops

Every practitioner source describes the same process, which is additive:

> **Part A** repeats "but stuff will slowly get layered in on top of it"…
> unlimited combinations like **ABCABC, ABBACC, ABACDDC**. If you're new to
> making music aim for a simple one like **ABAB, ABAC, or ABCBC**.
> — dungeon-synth.neocities.org

> This is the stage where I start experimenting with **adding more
> tracks/VSTs/instruments into the mix**… [then] underlying drones, background
> flourishes, little sound effects at impactful parts, field recordings, other
> background textures.
> — ibid.

> **Layer different sounds to create depth and texture**… experiment with
> adding or removing layers… **gradual transitions and subtle dynamics**…
> utilize fade-ins and fade-outs to create a sense of progression and movement.
> — dungeonsynth.neocities.org, "how to write dungeon synth"

> Dungeon synth **often relies on repetitive patterns to build atmosphere**;
> keep melodies simple.
> — ibid.

> Gentle percussion, like soft hand drums or subtle cymbals, **can add a subtle
> pulse without overpowering** the atmospheric elements.
> — ibid.

And transitions, which is the one thing these sources are concrete about:

> I'll make the transitions smooth… alter notes "to keep the transition from
> being too jarring"… add "quicker notes that head towards the starting notes
> of the next section"… have "lower chords fade in for a few beats before the
> next section starts".
> — dungeon-synth.neocities.org

**What this constrains.** The letter-forms are ideas repeating with the
arrangement changing over them, which is what this program's `idea` + `vary`
+ `spans` already are. Measured, sixty records produced **35 distinct idea
strings**, the commonest being `AABAA` (8), `AABAAA` (5), `AAABA` (4) — which
is the sources' ABAB/ABCBC family, arrived at from the form's own laws. That
part needs nothing.

What it does not have is the transition rule. A section boundary here is a cut:
the material changes and the parts change, and nothing is written to *lead into*
the change. The source names three ways to do it and the program does none of
them. See §8.

---

## 6. The intro ceiling is a pop number, and here it is inert

`THE-INTRO.md` rule 1 says an intro's length is drawn from the lengths that fit
under a ceiling **in seconds**, and the ceiling's source is Léveillé Gauvin's
303 top-10 singles, 1986–2015. The shared default is `introSec: 12`. Dungeon
synth does not state its own.

At this genre's tempo (60–80 bpm, 4/4) a bar is **3.05–3.97 seconds**. So:

| | seconds | fits under 12 s |
|---|---|---|
| an 8-bar intro | 24–32 | **0 of 60 records** |
| a 16-bar intro | 49–64 | **0 of 60 records** |

Nothing fits, ever. `form.ts` handles that honestly — "if nothing fits… the
shortest is taken and the record says what it is rather than pretending to fit"
— so every record takes 8 bars, and **the `[[16, 2]]` in the genre's own table
can never be drawn**. By this program's own standard that is a knob that does
nothing.

The fix is not to ignore the ceiling, it is for the genre to state its own. The
attention-economy finding is about pop singles competing for a skip; this genre
is descended from "compositions of instrumental or ambient music commonly used
as **introductions, interludes, or outros** in black metal… albums"
(en.wikipedia.org/wiki/Dungeon_synth) — a form whose whole ancestry is the
unhurried opening — and its own guide asks for 8–16 bars, which at this tempo
is 24–64 seconds. An `introSec` of **64** makes both lengths live and admits
exactly what the source names, nothing wider.

---

## 7. A practitioner's own form, and what it corroborates

The one source that describes a specific finished track in structural terms:

> [The piece] follows **sonata form, with an introduction, two themes, a brief
> development, and a recapitulation where the two themes are repeated with only
> minor changes**. The first theme is in **AA'A''** form. The second theme is
> in **ABA** form… made up of even smaller cells.

> The introduction uses **motives based on ideas occurring later on** — the
> dactyl rhythm in the timpani is drawn from the first theme.

> I don't write music from beginning to end — I just start editing or
> continuing on a section that I feel like editing or continuing on.
> — erichgrunewald.com, "How I Make Dungeon Synth" (the track is 15 minutes)

Two things fall out of this, and both are already this program's:

- **AA'A''** is `materialKey`: `A`, `A/1`, `A/2`, and `arrange.ts`'s rule that
  "an idea that has developed has developed" — a variant never reverts.
- **"motives based on ideas occurring later on"** is `THE-INTRO.md` §3,
  independently: the intro is the record's own material with something
  withheld. Ewer said it about pop songs; a dungeon synth practitioner says the
  same thing about a dungeon synth track. That rule is now sourced twice, from
  both sides.

The one thing it does not corroborate is length: 15 minutes, against this
program's 3.9–7.6.

---

## 8. What this proposes

**Rules 1 and 2 have since been applied; 3 and 4 have not.** What follows is
the reading as it stood. `§10` records what happened when it was acted on, and
what the acting on it turned up that this section did not know. The genre's numbers are unchanged; this section is
what the research says should change, so the decision is a separate one from
the reading.

| | rule | source | what it costs |
|---|---|---|---|
| 1 | Dungeon synth states **`introSec: 64`** of its own | note.com's 8–16 bars, at 3.05–3.97 s a bar; Wikipedia on the genre's descent from album interludes | the 16-bar intro becomes drawable — a live weight instead of a dead one. Half the records open long |
| 2 | The **last section may fall to one part, and that part is the drone** — a second exception to `fewest`, alongside the break | "gradually reduce the elements until only the initial drone remains, ending quietly" (note.com) | records stop ending on a three-part floor. The one place the source describes the end of a record, honoured |
| 3 | A theme section is **16–24 bars**, so the `32` weights come off `verse`/`chorus`/`instrumental` | note.com's table | 21% of theme sections currently run over the ceiling the source names. Against this: `form.lengths` is marked `[chosen]` and long loops are what "repeated extensively" means, so 32 may be right and the source's 24 may be a beginner's guide. **Left alone until something measures it** |
| 4 | A **transition** rule: lower chords fade in for a few beats before a section, or the tune walks toward the next section's first note | dungeon-synth.neocities.org | a builder this program does not have — the material stage would have to know what the next section's material is. §9 |

Rules 1 and 2 are one number and one exception, and both are cases of the genre
inheriting a default written for other music — the same failure `shed` and the
rhythm intro already have long comments about. Rule 3 is a genuine conflict
between two sources and is not this document's to settle. Rule 4 is a build.

---

## 9. What is still not done

**The transition.** Three sourced techniques for leading into a section change,
none of them buildable without the material stage seeing across a section
boundary. Every builder here is handed one section's chart and writes it; the
next section's first chord is not an input. Named so it is not mistaken for an
oversight.

**Reverb and filter as an arrangement move — BUILT, and this paragraph used to
say it could not be.** "Deepen the shadows of the sound through changes in
reverb and filters" is the source's *development* section, and it is a change
to the desk rather than to the notes. The two-loop rule's four moves are add a
part, remove a part, add expression, reduce expression; this program did the
first three and read "expression" as the drums' hat.

It now does the fourth. Twelve treatments (`src/stage/treat.ts`) change a
section's desk and leave every pitch and onset where the material stage put
them, and this genre weights them the way its own guide does: `darken` and
`drench` heaviest, `wear` and `far` behind them, `brighten` kept light because
shadows only deepen against something. Measured over sixty seeds, 33% of spans
play on a treated desk, every record uses at least one, and every
section-level number in §1 is unchanged — treatments compete for the
boundaries inside a section, not for the shape of the record.

What made it possible was not new DSP. It was that `src/sound/render.ts` did
not contain the word "section": the whole desk was one frozen object for the
length of a record, and the genre's own literature had been asking it to move
the entire time. See `docs/genre-research/THE-ALTERATIONS.md` for the
catalogue and `docs/TALLY.md` for what is still open.

**Track length.** The genre says 240–420 s and marks it `[chosen]` — "no
measured average found", still true. What was found instead is a spread with no
centre: a practitioner's own track at 15 minutes, Mortiis's *Født til å herske*
(1994) as "one long song, split into two tracks" of 27:37 and 25:23, and
Bandcamp Daily describing an artist who
"chooses to let these melodies loop a few times before fading out, keeping the
track length to three minutes". Three data points across an order of magnitude
is not an average, and 240–420 sits inside them. Left `[chosen]`, now with the
evidence written down.

---

## Sources

- note.com/soundwitches, "[Music Genre] What is Dungeon Synth? A Comprehensive Guide to Its History and Production Techniques". https://note.com/soundwitches/n/n4c2493bab15e?hl=en — the four-part structure with bar counts, and the ending
- "Dungeon Synth Music Making Guide", dungeon-synth.neocities.org. https://dungeon-synth.neocities.org/music-making-guide — letter forms, layering, the transition techniques
- "How to write dungeon synth", dungeonsynth.neocities.org. https://dungeonsynth.neocities.org/howto — layering, gradual dynamics, percussion as optional
- Erich Grunewald, "How I Make Dungeon Synth". https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/ — sonata form, AA'A'', the intro built from later motives
- Erich Grunewald, "Making Dungeon Synth without Perfectionism". https://www.erichgrunewald.com/posts/making-dungeon-synth-without-perfectionism/ — already cited in `dungeonsynth.ts` for tempo and progressions
- "Dungeon synth", en.wikipedia.org. https://en.wikipedia.org/wiki/Dungeon_synth — the genre as album introductions, interludes and outros
- "Dungeon Synth 2: Back to the Dungeon", Bandcamp Daily. https://daily.bandcamp.com/lists/dungeon-synth-2-back-to-the-dungeon — track length, loops "a few times before fading out"
- "Født til å herske", en.wikipedia.org. https://en.wikipedia.org/wiki/F%C3%B8dt_til_%C3%A5_herske — Mortiis 1994, "one long song, split into two tracks", 27:37 and 25:23
- Sound On Sound, "Arranging Pop". https://www.soundonsound.com/techniques/arranging-pop — already cited in `arrange.ts`; the general rules this document is measured against
- Hubert Léveillé Gauvin, *Musicae Scientiae* 22(3) (2018), 291–304 — the intro ceiling's source, and why it is a pop number. Cited in full in `THE-INTRO.md`


---

## 10. What happened when this was acted on

Written after the fact, on the branch that did it. Every number here is off
seeds drawn at random and reported whole.

### The ending: rule 2 was applied and is still not enough

`arrangement.fewest` was lowered at the close exactly as §4 asked
(`arrange.ts`, the `floor` at a closing section). Measured over 200 seeds it
moved the ending from four parts to **2.77**, and records ending on the drone
ALONE went 0% → **2%**. The source asks for one part.

The line that still stops it is not `fewest`. It is

```ts
const wanted = section.peak ? ROLES.length
  : Math.round(floor + (ROLES.length - floor) * section.energy);
```

— the count is driven by `section.energy`, and the outro's energy is
`spec.ts`'s shared default **`outro: 0.3`**, which carries no citation and
which neither genre states. Swept on this genre with everything else held:

| `form.energy.outro` | ends on the drone alone | ends with NO drone | parts in the last span |
|---|---|---|---|
| **0.30 (as it ships)** | 2% | 10% | 2.77 |
| 0.20 | 5% | 16% | 2.52 |
| 0.10 | 5% | 16% | 2.01 |
| 0.05 | **17%** | **20%** | 1.75 |

The lever is real and unstated. But note the third column: **thinning the
ending makes it MORE likely to end with no drone at all**, because the
protagonist rule re-sorts the shed order and takes the drone before the
character. The two faults are coupled and neither is fixed alone. This is the
fourth instance of the inherited-default fault `TALLY.md` names.

### The protagonist silently outranks this genre's stated shed order

`dungeonsynth.ts` states a shed order with a long argument — "AND THE DRONE IS
THE LAST THING THIS GENRE GIVES UP" — and `Arrangement.shed` is documented as
"the genre's, character last". Over 200 seeds the record's shed order differs
from the one the genre states in **58%** of records; the drone is not shed last
in **58%**; the drone is absent for a whole section in **41%**; and **10%** of
records end with no drone in them at all. Two laws, and the general one wins in
silence. Not fixed here — naming it is this section's job.

### One chord per bar was an accident, and it was the reason the pad never held

`keys.hold` was doing its job and had nothing to hold. `harmony.ts` walked
`for (let bar...)` and read `prog[bar % prog.length]`, so a chord lasted exactly
one bar; a pad tone may only ring on if the next bar's chord still contains it.
Measured before: **90–97%** of every keys note in this genre lasted one bar or
less, 2.1 to 3.8 seconds, against a guide asking for "a long time".

Nothing in `docs/` ever said a chord was a bar long. The one citation in that
file (Adams, MTO 26.2) is about how many MEASURES a loop runs. **The tell was in
the genre table**: four of nine progressions carried a doubled adjacent degree —
`[0,0,5,6]`, `[5,6,0,0]`, `[3,3,0,0]`, `[5,3,0,0]` — which is "hold this chord
for two bars" written the only way the program allowed.

`harmony.chordBars` now states it, drawn per position in the progression. **And
it did nothing until a second bug was found**, which is the part worth
recording: `harmonicPeriod` treated a held chord as a repeat, so four bars of Dm
had a period of 1, the caller sliced one bar and tiled it, and **holding a chord
longer made its notes shorter** — seed 218's longest keys note fell from 2.85
bars to 0.95. A period may not cut a chord that is still sounding.

With both: over eight seeds drawn at random, keys notes **1740 → 1022**, mean
length **1.02 → 1.60 bars**, one-bar-or-less **84% → 57%**. Every other part
within noise; the drone byte-identical; lofi byte-identical on 14 records.

### The kit was a pop kit, and MK2 already had the right one

`DRUM_LANES` was `kick, snare, hat, openhat`. `LOFI-LINEAGE.md` sources those
three to boom bap **for lofi**; no document sources them for this genre, whose
own file has said "a timpani on the beat" since it was written. Measured: 63%
kick, 34% snare, 2% hats, and no tuned drum in the program.

`tr1000.ts` had recorded the loss and its own condition for undoing it — "the
day a drum builder writes a note on a tom" — without recording that **MK2 had
one**. `Deckards Orchestrator MK2.html` carries a `dungeon` kit labelled "war
drums and kettles", three tom lanes, and the design in its own words:

> THE KETTLES ARE THE RUN, AND THE WAR DRUM IS THE WALK… a run is five or six
> sixteenths falling through the kettles, which is what a timpanist's
> phrase-ending actually is and what "badabdabda" is a transcription of.

with the owner's spec beside it ("The percussion is mostly toms which is what we
want… two that are rim shots or the takio stick clash so we can get a high note
in there") and a source, `[corpus:melodigging]`, "timpani rolls rather than
driving drum kits". MKIII had regressed.

Ported: eight lanes (see `DRUM_LANES`), the tom and rim circuits, and
`drums.toms` — the kettles' answer, in the
second and fourth bars of the phrase. Over the same eight seeds, **toms 0% →
36%** of drum hits, **hats 5% → 0%**.

**And the hats were a bug, not a taste.** This genre states `hat: [[0, 1]]` and
sources it ("beatless: no hat"), and `substitute()` turned its kicks and snares
into hats anyway — it asked `HEAVY` what a light drum is and never asked the
genre whether it had one. The law is now kept where the move is made.

### What this cost

- **The roll was blind to it.** `tools/roll.mjs` held a literal of the four
  lanes and drew every unknown lane on the KICK row, so this program's main
  test showed a kick part that was not being played. It derives from
  `DRUM_LANES` now.
- **The clap, the crash and the ride were written and then deleted**, with the
  note kept in `DRUM_LANES`. The clap has no source. The cymbals nearly earned
  their place — the amen's own lesson says "ride cymbal throughout" and "crash
  is played on the '+' of beat 3", and `NamedFigure` calls its field "the
  ride/hat" — but the only way to strike them was to move lofi's amen off the
  hat and the open hat. That changed **11 of 17 lofi records** and broke two of
  that genre's desk laws on the shifted spectrum (`render.test.ts`'s tape test,
  `treat.test.ts`'s refusal test). A taste change to a genre nobody asked to
  touch is not worth two laws, so it was reverted and lofi is byte-identical on
  12 records. The kit ships eight lanes, every one of them struck.
- **One law is left failing, and it is this genre's rig rather than this
  change.** `treat.test.ts` asserts every treatment a genre's desk OFFERS moves
  the record by more than −40 dB. Dungeon synth's desk offers `revive`, and this
  file already recorded why it barely does anything: `sag.idle` ships at **1**,
  a full battery, and `STARVE`'s idle knob runs 0.18–1, so revive has nowhere to
  go and only `sag.depth` is left to move. It measured **−38.9 dB** — inside the
  floor by a decibel. The notes this change rewrote moved it to **−41.9 dB** and
  it fell out.

  Nothing about the desk changed; the record did. The two honest fixes are both
  the owner's call and neither is a refactor: give `sag.idle` headroom (a taste
  change to how every dungeon synth record sounds), or have `deskOf` refuse a
  move whose knob is already at its limit — which is the refusal `reach.ts`
  already owns, and which would make the genre's own written judgement ("the
  pair stays in the vocabulary for a genre whose battery is not already full")
  true in code instead of in a comment.

  Two other failures in the suite (`index.test.ts` 217 and 226) were **confirmed
  failing on the pre-change commit** and are not this change's.


---

## 11. "Primarily beatless" is one strand, not the genre

Everything above — this whole document — reads note.com/soundwitches as if it
described dungeon synth. It describes **a** dungeon synth. The genre is a
family, and at least one of its subgenres is drum-heavy.

**Dino synth** is the worked example: prehistoric-themed, with Diplodocus's
*Slow and Heavy* (2019) taken as its first record and Synthosaurus and
Electrosaurus Rex beside them; Bandcamp carries `dino synth` as its own tag. Its
percussion is **tom-driven and near-continuous** rather than sparse. [owner —
the subgenre, its origin record and its tags are documented; no published
account of its percussion was found, and two searches were spent looking]

**What that invalidates here.** §1's framing, and every argument in this
repository that reached for "primarily beatless" or "very subtle percussion" to
argue a drum number DOWN. `dungeonsynth.ts` quoted that sentence in five places
as though it settled the question. It settles it for one strand. When the
kettles came back and doubled this genre's drum density, that was read as a
fault against the source and was very nearly turned down to a third of its
weight on the strength of it — **the sources do not support that**, and
`toms.run` stays at 0.9.

**The mechanism for the real fix already exists and has never been used.**
`GenreSpec.extend` deep-merges a genre onto a parent, refuses a cycle, and is
covered by `resolve.test.ts` — and no shipped genre extends anything. A strand
that wants its own percussion, tempo or kit is a genre file that extends this
one, not another compromise inside this one. Nothing here needs to be averaged.

The same warning applies to the rest of this document: where a rule below cites
one guide for the whole genre, it is describing the strand that guide is about.
