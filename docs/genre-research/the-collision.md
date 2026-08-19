# THE COLLISION — one bug, five places, and the message that could not name it

*Built 2026-08-19, build `2026-08-19i`. The largest fault in the program by a
distance: 16 of 432 blends thrown on one check, and the number had gone up
rather than down.*

---

## 1. THE CHECK, AND WHY NOBODY COULD ACT ON IT

The seam check refuses a material in which two parts play **the same pitch at the
same instant**. That is a real defect — a doubled unison reads as one note and
wastes a voice — and it is fatal, correctly.

Its message was:

```
  collision in Bdev at 3:0:62
```

A material, a moment, and **no suspects**. Every report of this fault for the
life of the file has read like that. The check kept a `Set` of
`"bar:step:pitch"`, so it knew *where* two parts met and never *who*.

A `Map` costs the same and remembers the first part's name:

```
  collision in Bdev at 3:0:62 — lead lands on keys (bar 3, step 0, pitch 62)
```

That one change turned sixteen mysteries into a diagnosis in a single sweep. It
moves no note and spends no draw; it is the error message doing its job.

---

## 2. WHAT THE SIXTEEN ACTUALLY WERE

432 blends, every failure text collected and grouped by the pair of parts:

```
  8   keys + bass      always Avar or Bdev, always BAR 3, step 8 or 10
  4   lead + keys2     always Avarlift, always BAR 0
  2   lead + lead      a part colliding with ITSELF
  2   lead + keys      Bdev, step 0
```

**The positions alone identified three of the four.** Bar 3 step 8–10 is the last
beat of the last bar — exactly where the bass walks its chromatic approach and
exactly the bar the cadence machine rewrites. Bar 0 of `Avarlift` is the two-bar
head `leadAvarl` borrows from `themeAl`.

And they are **one bug wearing four faces**:

> **A part is only legal if it is legal in every material it appears in** — and
> five reserves were pointed at the first statement's parts while their material
> plays the *returning* ones.

This file has stated that rule three times already, each with its own comment,
each after being bitten. `keys2A`, `keys2Avar` and `keys2B` all carry the fix.
The three places that did not are below.

---

## 3. THE FIVE FIXES

### (a) The returning bass was never reserved — 8 of 16

```js
const placed = reserve(ostAx.concat(ostAvarx, bassAx));            // before
const placed = reserve(ostAx.concat(ostAvarx, bassAx, bassAvar));  // after
```

The note directly above that line says the comp is built once and played in `A`
and in `Avar`, so it must find a seat free in **both** — and then reserved
`ostAvarx`, the returning **ostinato**, and stopped. The returning **bass** is a
different set of notes the moment a genre declares a cadence, and it was never
added. Same fix on the chorus side (`placedB` + `bassBvar`).

**The declaration had to be hoisted, and that is the point rather than a
tidy-up.** `bassBvar` was declared *after* `placedB`. The last time a reserve on
this side named it early, `const`'s temporal dead zone threw, `tryPad` caught it,
and material B's second keyboard went from empty in 0 of 20 dungeon synth records
to empty in **20 of 20** — with the compose sweep reading 800/800 GREEN, because
the part had vanished rather than collided. The declaration moves above its
readers; the readers do not move down to it.

### (b) The lift path never got the fix its own original carries — 4 of 16

```js
const resA  = reserve(ostAx.concat (bassAx,  keysAx,  keys2A, keys2Avar));  // has it
const resAl = reserve(ostAlx.concat(bassAlx, keysAlx, keys2Al));            // does not
```

`resA` carries a nine-line note explaining exactly this: `themeA`'s first two
bars are reused as `leadAvar`'s head, so the head is played against **Avar's**
pad as well as A's. `leadAvarl` is built the same way and played against
`keys2Avarl`, while `themeAl` was built avoiding `keys2Al` alone. **The fix was
made on one path and never carried to its copy.**

### (c) The twist's fallback checked nothing at all — 4 of 16

```js
if(put == null) put = n.pitch;
```

Its comment said the note's own pitch "is legal because the material it came from
is". Harmonically, yes. But the pool walk directly above rejects a candidate that
is **reserved**, that **repeats the previous note**, or — now — that **this twist
has already used**, and the fallback skipped all three. *Every check in that loop
was optional, because the path taken when the loop found nothing obeyed none of
them.*

And it is the same lesson again: the note was safe against **its own** material's
accompaniment, and this material plays the **returning** one.

So the fallback is a search too — its own pitch, then its octaves, and only a
seat nothing else holds. If every one is taken the note is **dropped**, and that
costs nothing audible: "taken" means some other part is already sounding that
exact pitch at that exact instant. Two identical notes at one instant are one
note. `noRepeats` settles the same question the same way, in one word: *"IT
DROPS."*

### (d) …and the twist did not know its own seats — the `lead + lead` pair

Two notes of the tune sounding at the same instant were free to be sent to the
same pitch. A local `mine` set, checked exactly like the accompaniment's, closes
it.

---

## 4. WHAT IT MEASURED

```
  COLLISIONS, 432 blends            16  →  0
    keys + bass                      8  →  0
    lead + keys2                     4  →  0
    lead + lead                      2  →  0
    lead + keys                      2  →  0

  ALL blend failures, 432            23  →  7
                                            (and 16 before this session began)

  plain genres, 160 records, four genres:   0 throws before, 0 after
```

**Not one collision survives.** The remaining seven are the two other families,
untouched by this work and now the whole of what is left: four `out of key` and
three `no keys voicing fits`.

**And it costs nothing where nothing was wrong.** Lofi and dungeon synth are the
two genres that declare a cadence — the only ones where `bassAvar` is genuinely
different from `bassA` — and across 20 records each, **not one note moved**. The
tightened reserve only bites where a collision was about to happen. Synthwave and
boxcar declare no cadence, so for them the added set is the same set [Law 3].

---

## 5. WHAT IS NOT FIXED

- **The other two failure families.** `out of key … in Bdev/Bvar` (4 of 432) and
  `no keys voicing fits [52,67]` (2–3 of 432) are untouched. The first is the
  twist moving a pitch onto a chord that will not spell it; the second is the
  register allocator running out of room under blended bands. Both have the same
  smell as this one — a decision made against one set of facts and used against
  another — and neither has been read yet.
- **Nobody has heard the difference**, because there is no audible difference on
  a plain record: this is a fault that only fires under blending.

---

## Sources

This one has none, and that is correct: it is not a question about music. Every
claim here is a measurement of this program, taken with the collision message
that now names both parties.

- `docs/genre-research/waking-the-rack.md` §7 — the sweep that isolated this family
- the notes above `keysA`, `keys2Avar`, `keys2B` and `resA` in the program — the same rule, stated three times before this build and applied in three places out of eight
