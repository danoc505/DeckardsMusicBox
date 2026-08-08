# THE HAND ON THE ROLL — editing a song without leaving the algorithm

*Designed and built 2026-08-08, from the user's brief: "a function that allows a
user to select a part of the piano roll and reroll or edit it and the rest of
the song dynamically adjusts."*

---

## 1. WHAT IT IS FOR

The program was a slot machine. One handle (a seed), one whole song, two
verdicts: keep it or pull again. If eleven parts were good and the bassline was
trash, the eleven were lost with it.

Every build in this file ends with the same sentence — *nothing here has been
heard* — because the owner is the only ear and the only thing they could say
was "this song is bad". This turns that into "**this part, here, is bad**", and
lets them fix it without losing the rest.

## 2. THE TWO RULES THE OWNER SET, AND EVERYTHING FOLLOWS FROM THEM

Asked what should happen to the other parts when one is rerolled, and what
should happen to the other places the same material plays, the answer both
times was: **the least necessary change.**

So: reroll the bass in section 5 and *only section 5's bass changes*. Not the
other sections, not the other parts. That is measured, not asserted — §5.

## 3. AN EDIT IS AN INPUT, NOT A PATCH

`chart.edits` is an ordered list of `{ sec, role, op }`, on exactly the same
footing as `chart.pins` — which the file already describes as *"an input on
exactly the same footing as picks, never an override applied later."*

Nothing mutates a note. Each entry changes what the song is composed **from**,
and the song is composed again. Three things fall out of that for free:

- **The song is still a pure function of its inputs** — (seed, genre, tables,
  pins, edits) — so it is still reproducible and every seam check still runs on
  the edited version, unrelaxed.
- **Undo is `pop()`.** Drop the last entry, compose again. It cannot drift,
  cannot leave half an edit behind, and cannot disagree with what you are
  hearing — which is what undo built on mutation eventually always does.
- **Edits stack in order**, so thinner-then-octave-up is a different song from
  octave-up-then-thinner, as it should be.

**An edited song is composed twice.** The hand points at a *section*; which
material a section plays is stage 4's decision, made after stage 3 has built the
materials. Rather than let stage 3 guess at stage 4's answer — a second owner
for the one rule this file has broken and re-fixed twice — the song is composed
straight through once to find out, then composed again with the answer in hand.
Both passes are pure; the plan between them is derived. It costs one extra
compose, only for a song that has been edited.

## 4. THE MOVES — and my "safe by construction" claim was wrong

Seven, plus undo: **reroll · thinner · thicker · 8ve up · 8ve down · reverse ·
delete**.

Only `reroll` draws — the part is built again from its own substream with the
edit's number on the end, so the same button twice gives two answers. The rest
transform what is there: drop every second note, strike each note again halfway
to the next at the *same pitch*, move an octave, reverse the pitch order.

**I wrote in the code that these were safe by construction**, on the grounds
that none can invent a pitch class the material did not already have. **The seam
check refuted it on the first run** — `thinner` and `reverse` both threw *"out
of key, not in the chord, and does not resolve into the next one."*

The reasoning was wrong because legality here is not a property of a note, it is
a property of **a note and its neighbour**: an out-of-key passing tone is legal
*because of what follows it*. Remove or reorder its neighbour and it is
stranded. **Removing notes can make the remaining ones illegal without touching
them.**

So the moves are safe by **checking**, not by construction. The law was lifted
out of the seam check into `noteFits`, which now has two callers asking the same
question — the check before it throws, the edit before it keeps a note. An
orphaned note is dropped along with the note it depended on (twice, because
dropping one can orphan the next). **The seam checks run on the hand's work
completely unrelaxed**, which is the point: relaxing them so the button always
wins would make every measurement in this repo a measurement of a song nobody
is listening to.

When a change genuinely will not compose, the entry comes straight back off and
the bench says which and why — the same answer this file already gives for a
blend that will not compose.

## 5. "LEAST NECESSARY CHANGE", MEASURED

Delete the bass in section 0 of a lofi song:

```
  materials before   A, Avar, B, Bvar, C
  materials after    A, Avar, B, Bvar, C, A@0, Avar@0     <- two added, none changed
  performance        22 bass events lost, 0 gained, NOTHING ELSE MOVED
```

It did not start there. Two things leaked, both found by measuring rather than
by reading:

- **`drumPhrase` was a hand-written literal** and had no entry for `A@0`, so the
  kit silently lost its phrase letters in the one section the user had edited.
  Now derived from the material's parent.
- **`ALT_OF` was a plain lookup** and `ALT_OF["A@0"]` was undefined, so the
  section lost the four-bar A/Avar alternation that *is* its eight-bar phrase.
  Now derived — and the edit is applied to the alternate as well, or the hand's
  change appears in half the bars of the section it was aimed at.

Both were the same defect the file keeps catching: **a hand-kept list standing
next to the thing it lists.** Measured collateral before the fixes: three drum
events moving in a song where only the bass had been touched.

## 6. WHAT IT LOOKS LIKE

Click a note in the roll: every note that part plays **in that section** lights,
and the bench below offers the seven moves and undo. Click it again to let go.
The selection is (part, section) because that is the smallest thing the composer
can be asked to redo — a single note is not a unit this program has.

Driven in a real browser: 1,225 notes drawn, clicking one bass note selects the
23 that part plays there, every button moves the song, and **undo six times
returns to exactly 1,225** — the count it started at. No page errors.

## 7. WHAT THIS DOES NOT DO

- **Nothing is saved.** Edits live for the session and die with a reload, and
  the exports do not carry them. The owner set this aside deliberately —
  *"Slice 3 not needed at this time, this is a future concern."*
- **Notes past the last section boundary cannot be selected** — the ending
  flourish belongs to no section, so there is nothing to key an edit to. 3 notes
  of 1,225 in the song measured.
- **Nothing has been heard.** Every claim above is about whether the machinery
  does what it says, not about whether the results are any good.
- **It is not yet a learning loop.** The edits are not recorded anywhere I can
  read, so they cannot yet turn into genre-table changes. That was the other
  half of why this is worth building, and it is still open.
