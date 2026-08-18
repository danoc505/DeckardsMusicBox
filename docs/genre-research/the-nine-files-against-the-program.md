# THE NINE FILES, AGAINST THE PROGRAM — what MK2 does and does not do

> *"I asked you to read the 9 files and to evaluate the program for the music
> theory in those files."*

Read: `001`, `002`, `003 (Transitions)`, `004 (Drums)`, `005 (loops)`,
`006 (rule of 3)`, `007 (8bar)`, `007 (structure)`, `008 (Loop2song)`,
`009 (loop2songC)` — all on `main`.

Measured against: **`Deckards Orchestrator MK2.html`**, four genres, seeds 1–8.
Every number below came from composing records and counting, not from reading
the tables.

The companion sheet `melodic-math.md` covers the phrase-level theory from the
diagrams and the same transcripts. **This one is about the four things the
program cannot currently do at all**, ranked by what fixing them would buy.

---

## THE FOUR, IN ORDER

### 1. A DEVELOPED RESTATEMENT — the empty middle of the whole table

**What the files ask for.** `003` describes the Zelda theme as a chain of
developed restatements: *"Each phrase takes the last piece of the melody and
adds something to it or twists it in a new way, giving the melody a
step-by-step progression from each bar to the next."* The specific device it
prints is the **answer**: the opening bar leaps down root-to-fifth, and *"the
end of the bar here is a perfect answer to the beginning... instead of jumping
down from the root to the fifth, we jump up from the root to the fifth above
it, and then the space in between is filled in with a run up the major scale."*
Same idea, changed on return.

`006` is the constraint that forces it: *"repeating something beyond three
times is generally speaking overusing that idea, and actually using it more
than two times is overusing it."*

**What MK2 does.** It builds **five tunes per record** — `A`, `Avar`, `B`,
`Bvar`, `C` — and rotates them. `Avar` and `Bvar` are not developments of `A`
and `B` on return; they are separate materials, drawn once at stage 3 and then
selected from. (The `A@0`, `Bvar@4` entries in the material list are private
copies minted for hand EDITS, not development.)

Measured, distinct lead statements against sections played, six records:

| genre | distinct / total | identical returns | longest identical run |
|---|---|---|---|
| lofi | 25 / 43 | 9% | 2 |
| synthwave | 25 / 96 | 23% | **4** |
| dungeonsynth | 26 / 63 | 22% | **4** |
| boxcarsynth | 37 / 78 | 8% | 3 |

**Synthwave and dungeon synth play the identical lead statement four times in a
row.** That is `006` broken, measured, in the two genres with the most sections.
And the 23% is the deeper number: nearly a quarter of all section entries are a
note-for-note repeat of the one before.

**The missing move, stated as one rule:** when a material comes back, either
**keep its rhythm and change its notes**, or **keep its opening and change its
ending**. Both are in the files — the first is `003`'s twist, the second is
`003`'s answer — and the engine has neither. It has `vary`, which picks a
DIFFERENT pre-built material, and that is a rotation, not a development.

This is the one to build first. It fills the empty middle of the variation
table and it serves `003` and `006` at once.

---

### 2. THE BASS AND THE SECOND KEYBOARD HAVE NO RHYTHM

Onsets a bar, four records a genre:

| genre | bass | keys2 | lead | ostinato |
|---|---|---|---|---|
| lofi | 2.2 | **1.0** | 2.8 | — |
| synthwave | 6.8 | — | 3.0 | 15.8 |
| dungeonsynth | **1.4** | **1.4** | **1.3** | 4.0 |
| boxcarsynth | 4.6 | **1.0** | 1.6 | 6.1 |

**`keys2` is one note a bar** in the two genres that have it and are not
synthwave. One note a bar is not a part, it is a pad with a pitch. And
dungeon synth's whole band sits at 1.3–1.4: bass, second keyboard and *lead*
all playing a note or so a bar.

Synthwave is the control that says this is fixable rather than inherent — same
engine, 6.8 in the bass and 15.8 in the ostinato.

Two parts, one change each, and it lifts every genre that has them.

---

### 3. LOFI HAS NO CHORUS CHORDS, AND THE MACHINERY IS ALREADY BUILT

| genre | `chorusProgressions` |
|---|---|
| lofi | **NONE** |
| synthwave | **NONE** |
| dungeonsynth | declared |
| boxcarsynth | declared |

Two of four genres reach for it and two do not, so this is a table gap and not
an engine gap — nothing needs writing, lofi's table needs a chorus progression
added. `007 (structure)` and `008` both turn on the chorus being the moment the
harmony moves; a chorus on the verse's chords is a louder verse.

The cheapest of the four by a wide margin.

---

### 4. A TRANSITION IS UNREACHABLE — nothing is shorter than four bars

`002` is entirely about this, and it names the three things that make a
transition feel like one rather than like a section: **a lack of melody, a lack
of harmonic stability, and odd phrasing.** Its worked example is *"four bars in
a different tempo and time signature... and so between the four bar
introduction and the beginning of the main melody, TWO BARS of the new groove
are inserted before the melody comes in"* — and the point that *"the lack of
melody was literally the only difference between the setup and the section that
followed."*

What MK2 composes:

| genre | section lengths seen | shortest |
|---|---|---|
| lofi | 4, 8 | 4 |
| synthwave | 4, 8 | 4 |
| dungeonsynth | 4, 16 | 4 |
| boxcarsynth | 8, 10, 12, 16, 18, 20 | 8 |

Section kinds across all four: `intro verse prechorus chorus postchorus bridge
instrumental outro`. **There is no transition kind, and no section is ever 1, 2,
3 or 5 bars long.** Every length is a multiple of four. `002`'s odd phrasing —
its 4+1+3 and 5+2 — has nowhere to live.

A `transition` kind, allowed to be 1, 2, 3 or 5 bars, with no lead and no
resolution, is the only way `002` becomes reachable at all.

---

## TWO THINGS I DID NOT MEASURE AND WILL NOT CLAIM

1. **`003`'s triplet-against-16th clash.** The file makes it the piece's
   signature — *"three bars of triplet rhythms that give way into these
   galloping 16th notes... sometimes happening at the same time"* — and this
   program's grid is sixteenths with no triplet at all. Whether that is worth
   changing is a grid question, not a table question, and I have not costed it.
2. **Whether dungeon synth and boxcar should swing.** Both sit at ±10 ms,
   essentially dead straight. That may well be correct for both. I have no
   measurement that says otherwise and no source that settles it.

---

## WHAT THIS SHEET IS NOT

It is not a reading of the phrase-level theory — that is `melodic-math.md`,
written from the same transcripts plus the annotated piano rolls, and it covers
the structural formula, the rhythmic balance, the movement table and the
silence-as-a-named-motif rule.

The two overlap at exactly one point, and it is item 1 above: `melodic-math.md`
§8 asks for a theme built as a LIST OF MOTIFS so that a part of it can be named
and turned off. A developed restatement needs the same thing for a different
reason — you cannot keep an opening and change an ending unless something knows
where the opening stops.

---

## Sources

- `001`, `002`, `003 (Transitions)`, `004 (Drums)`, `005 (loops)`,
  `006 (rule of 3)`, `007 (8bar)`, `007 (structure)`, `008 (Loop2song)`,
  `009 (loop2songC)` — all on `main`
- `docs/genre-research/melodic-math.md` — the phrase-level companion
