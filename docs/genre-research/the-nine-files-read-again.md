# THE NINE FILES, READ AGAIN — every word of all ten, against the program

*2026-08-18, at the owner's direction: "Read the text docs 001-009 in the main
branch the whole document every one and reflect on what is missing in the
program."*

**This replaces `the-nine-files-against-the-program.md` as the current reading.**
That sheet is not withdrawn — its four items were real and three of them have
since been acted on — but it was written against four genres that have changed,
and two of its four claims did not survive contact. What follows is the whole
set read start to finish, with every claim about the program **measured** rather
than remembered.

There are ten files, not nine: `007` exists twice, as `(8bar)` and
`(structure)`.

---

## 0. WHAT THE FILES CONFIRM THE PROGRAM ALREADY DOES

Stated first, because a list of gaps that does not say what is already right is
an accusation rather than a reading.

| the file asks for | the program |
|---|---|
| Four complete fundamentals before arranging — chords, bass, drums, lead (`001`) | has all four, plus a second keyboard, a second melody and a repeating figure |
| Start small, build tension, tell a story every eight bars (`001`, `005`) | `form.build`, section energy, the arc thinner |
| The rule of three — never state an idea a third time unchanged (`006`) | **built 2026-08-18**: `Adev`/`Bdev` keep the rhythm and redraw the notes; identical returns fell 23% → 17% |
| Keep the opening, change the ending (`003`'s "answer") | `Avar`/`Bvar`, and they now alternate with the twist |
| Ghost notes, backbeat, offbeats, fills, toms (`004`) | all present, with a measured accent map per genre |
| Polymeter — cycles that do not line up (`004`) | `kit.poly`, coprime lane periods, and a breakdown that keeps them |
| An arpeggio as harmonic support, "halfway between chord and melody" (`009`) | the `ostinato` role, with `run` and `follow` |
| Key change for the bridge (`007 structure`) | the key shift, mode-aware, with a brightness rule |
| Records around five minutes (`008`) | `wantSec`, and the form is built to a target length |
| The chorus is where the harmony moves (`007 structure`, `009`) | **built 2026-08-18** for lofi; three genres of four now have their own chorus changes |

---

## 1. THE TRANSITION — an entire file about a thing the program cannot make

`002` is 647 lines and it is about nothing else. It names exactly what makes a
passage read as a transition rather than as a section:

> "a lack of melody, a lack of harmonic stability and odd phrasing"

and it is emphatic that the third is the strongest:

> "the music broke out of the structure of the phrasing that we'd seen so far
> and **I think this might be the most important factor at play here**"

> "**a transition should make you feel like you're getting scooped up and thrown
> into the air with no idea where or when you're going to land**"

Its worked examples: two bars of the new groove inserted before a melody enters;
a seven-bar section; a five-bar section with a two-bar bass walk-down tacked on;
an eight-bar section "broken up into four one and three bar chunks"; a three-bar
transition; the last bar of a repeating phrase chopped off.

**Measured against the program, all three markers are unreachable:**

```
  every section function the program can produce, four genres, 24 records each
    bridge, chorus, instrumental, intro, outro, postchorus, prechorus, verse
    — there is no transition, and no coda, middle-eight or refrain either

  section lengths
    lofi           4 bars 24%   8 bars 76%
    synthwave      4 bars 28%   8 bars 72%
    dungeonsynth   4 bars  9%  16 bars 91%
    boxcarsynth    8 bars 32%  10 2%  12 1%  16 56%  18 3%  20 5%
```

Nothing is ever 1, 2, 3, 5 or 7 bars long. Boxcar is the only genre with any odd
phrasing at all and its shortest section is eight bars.

**And the harmonic half is dead code.** `002`'s instability is carried by
dominant sus chords — *"dominant sus chords feel inherently floaty and
unresolved, and this effect is emphasized as we jump from e7sus up a minor third
to g7sus"*. `QUALITY` defines `sus4: [0, 5, 7]` and `sus2`. **Nothing in the file
ever draws them** — not a genre table, not `CHORD_QUALITY`, not `pickQuality`.
They have been defined and unreachable for the life of the program.

This is the largest single gap and it is the one whose source material is most
specific about how to close it.

---

## 2. THE LAST CHORD IS DIFFERENT THE SECOND TIME

`009` opens with it, as the first thing said about the track:

> "this is a loop i started with… **it repeats twice but the last chord is
> different the second time. the first time it's minor, the second time it's
> major.** so this chord progression loops for the entire song, four minutes
> straight… at the heart of it it's just that progression over and over"

That is the rule of three applied to **harmony**, and it is the cheapest
possible version of it: one chord, changed on the repeat, carrying a four-minute
record. It is the exact twin of the developed restatement that landed for the
tune on 2026-08-18 — `003`'s twist, one part over.

**The program cannot say it.** One progression is drawn per record; a section
that repeats its material plays the identical chords in the identical order. A
whole record contains **3.7 to 7.4 distinct chords** (measured 2026-08-18), and
every verse in it is harmonically the same verse.

`006` is the reason this matters more than it looks:

> "repeating something beyond three times is generally speaking overusing that
> idea, and actually using it more than two times is overusing it"

**And one genre is measurably in breach of that on its harmony right now:
dungeon synth plays 16-bar sections built from a 4-bar material in 91% of cases
— the same four chords, four times over, inside a single section.** That is the
most concrete number in this sheet and it belongs to a genre the owner is
working on.

---

## 3. THE EMPTY — built, and fires once a record

Two separate files make it a standing device, not a special effect.

`004`, defining an eight-bar drum phrase as `A B A C · A A D`:

> "at the end of our eight bar phrase we hit d — d is where we might introduce a
> fill **or empty** depending on the vibe of the piece… **the opposite of the
> fill is the empty**… it must include the subtraction of most if not all of the
> main rhythmic elements before the next downbeat. This creates a different form
> of anticipation, what I like to call a **decoupling** of the rhythmic elements
> between large musical sections."

> "**you can use empties anywhere you want in your track**, even if it's just as
> simple as taking the kick out for one beat at the end of a bar"

`005` makes it the best transition it knows:

> "it'll be really really satisfying if we reduce energy and go back into just
> the chords, and to make this transition even more satisfying — **which by the
> way is one of my all-time favourite transitions to make, which is going from
> high energy to nothing** — we take all the instruments and cut them out and
> leave them empty for that last bar"

**The program has `emptyLastBar` and gates it to one place:**

```js
emptyLastBar: !!(next && next.peak)
```

Once per record, only before the peak. Both files describe a device used
throughout a record, and `004` explicitly says *anywhere you want*. The
mechanism exists; the permission does not.

---

## 4. TRIPLETS DO NOT EXIST, AND ONE FILE IS BUILT ON THEM

`003` makes the triplet the Zelda theme's signature, twice:

> "the first main feature of the piece that you'll notice all over the music:
> **the clash between triplet and 16th note rhythms**… throughout the main
> section of the piece we'll see lots of clashing between triplets and 16th
> notes, **sometimes happening at the same time**"

> "the rhythmic shift from triplets to 16ths produces this great charging up
> effect"

`004` names triplet subdivisions of every note value, and the 3:2 polyrhythm —
*"three notes played in the same time as two notes"* — as distinct from the
polymeter the program already has.

**The grid is sixteen sixteenths and the file says so about itself:** *"a
genuine triplet ratchet is a grid change, and it is not this one."*

`METRE_GRID` supports `6/8`, `9/8` and `12/8`, which give a triplet *feel* — and
**no genre declares a metre**, so all four are 4/4. That is a second built-and-
unused mechanism (see §6). But even declaring one would not buy `003`'s clash,
which needs both divisions **at once**, in one bar.

---

## 5. WRITING IN SEQUENCE

Both `002` and `003` name it, and `003` says it is not optional:

> "taking a melodic idea and moving it down a scale in steps is called a
> **sequence**, and it's a very classical technique. **You won't hear a Mozart
> piece that doesn't move a melody around in sequence at least once.**"

> "a big one from the classical era is the idea of writing in sequence — taking
> a short musical idea and repeating it moving up or down through some chord
> progression… **paired with harmony that moves chromatically farther and
> farther away from the home key**" (`002`)

`003`'s worked example is precise: the figure moves down through the B flat
minor scale for two bars — *"just enough time to set up an expectation"* — and
then sucker-punches with a jump to C major.

**The tune builder has inversion** (measured: "the hook is built from A
inverted"), **the answer** (`Avar`), and now **the twist** (`Adev`). It has no
sequence: nothing takes a figure and restates it a step lower, twice, to build
an expectation and then break it.

---

## 6. THREE MECHANISMS BUILT AND DECLARED BY NOBODY

A recurring shape in this program, and all three are one table edit away from
being real:

| mechanism | what it would give | who declares it |
|---|---|---|
| `METRE_GRID` — 2/4, 3/4, 6/8, 9/8, 12/8 | `004`'s time signatures; a 6/8 genre | **nobody.** All four genres are 4/4 |
| `bassRoles` — a weighted list of bass jobs, drawn per material | a bass that changes what it is doing between sections | **nobody** (found 2026-08-18) |
| `sus4` / `sus2` in `QUALITY` | `002`'s floaty, unresolved harmony | **nobody**, ever |

---

## 7. TWO SMALLER ONES, BOTH FROM `009`, BOTH ABOUT LAYERS

> "we ended up with **five different bass synths** on this song. they're playing
> this looped progression the whole way through, but to create dynamics **we
> have different ones come in at different times and sometimes they're
> layered**"

> "pusher also did this simple but genius thing where he **took the main notes
> from my chorus melody and played them on different synths during the intro and
> in the background of the verses**"

The first is dynamics by **how many layers of one part** are sounding. The
program expresses energy by which *roles* play; a role is one instrument or
none. `001` reaches for the same idea from the other end — *"the other way is to
add expression to an existing instrument"*, done by duplicating the vocal an
octave up rather than by bringing in a new part.

The second is **the intro seeding the hook**. Only synthwave does anything like
it, and only in the prechorus: *"the pre-chorus is a RAMP INTO the hook, so it
plays the hook's own material."*

`009` also names the gap-filling rule the program has for drums and not for
pitched parts: *"a lead part doesn't usually go constantly throughout the whole
song, so in the spaces it leaves you often want to add a little something
else… a drum fill, extra vocals, a sound effect, a melody playing on a different
instrument. These are the things that elevate a song from being solid to being
magical."*

---

## 8. WHERE THE OLD SHEET WAS WRONG, RECORDED RATHER THAN QUIETLY REPLACED

`the-nine-files-against-the-program.md` listed four items. Honestly:

1. **A developed restatement** — right, and built.
2. **"The bass and the second keyboard have no rhythm"** — **half wrong.** The
   second keyboard's rhythm had no owner and that was real. The bass half was
   contradicted by the sources: dungeon synth's 1.5 notes a bar is what *"sustain
   long pedal notes and drones"* asks for, and lofi's 2.5 is inside the 2–4 its
   own sources give. No bass was changed. `the-second-keyboard-rhythm.md` §4.
3. **Lofi has no chorus chords** — right, and built.
4. **A transition is unreachable** — right, still open, and this reading makes it
   the largest gap rather than the fourth-largest. §1.

---

## 9. WHAT I WOULD DO NEXT, AND WHY

Ranked by what the files spend their words on against what one change buys:

1. **The last chord different on the repeat** (§2). Smallest change here, and it
   is the only item with a genre measurably in breach of `006` today — dungeon
   synth's 91%. It reuses the shape of the developed restatement, which is built
   and understood.
2. **The empty, ungated** (§3). The mechanism exists and fires once; two files
   describe it as an everywhere device. A permission, not a build.
3. **The transition** (§1). The biggest, and the one with the most source
   material to build from: a section kind allowed to be 1, 2, 3 or 5 bars, with
   no lead, and `sus4` finally reachable so the harmony has somewhere unresolved
   to sit.
4. **Sequence** (§5) — a fourth device for the tune, beside inversion, the
   answer and the twist.

Triplets (§4) are a grid change and I have not costed one. The layer items (§7)
are real but they are production ideas more than composition ones, and this
program's own precedent is that the ear should rule on those before they are
built.

---

## Sources

`001`, `002`, `003 (Transitions)`, `004 (Drums)`, `005 (loops)`,
`006 (rule of 3)`, `007 (8bar)`, `007 (structure)`, `008 (Loop2song)`,
`009 (loop2songC)` — all on `main`, all read in full for this sheet.

Companion sheets: `melodic-math.md` (the phrase-level reading of the same
transcripts), `the-nine-files-against-the-program.md` (the earlier reading this
supersedes), `the-second-keyboard-rhythm.md` and `chords-and-changes.md` (the
two builds that closed items from it).
