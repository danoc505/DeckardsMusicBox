# Counterpoint — the rules of two lines at once, and which of them apply HERE

*Researched 2026-08-03 at the user's direction ("Counterpoint, better wider
chords"). Fresh; nothing carried over. The companion sheet is
`lofi-harmony.md` (the vertical question); this is the horizontal one.*

---

## 0. THE FRAMING PROBLEM, stated first because it decides everything

Species counterpoint is a **pedagogy for 16th-century vocal polyphony**. This
program writes lofi hip hop, acid house, jungle and minimal techno. Importing
the rules wholesale would be the exact error this project has already made and
documented — imagining a mechanism between two true facts (HANDOFF §5.4a).

So the question this sheet answers is not "what are the rules of counterpoint"
but **"which of them are about PHYSICS or PERCEPTION, and therefore belong in
this program's physics engine, versus which are about STYLE, and therefore
belong in a genre table or nowhere at all."**

The program's own Principle 3 draws that line: *"Music theory is the PHYSICS
ENGINE. Scales, chord tones, resolution by step, the low-interval limit,
register bands: these are the collision rules of the world, not style choices."*

My reading, defended per rule in §2:

| tier | rules |
|---|---|
| **PERCEPTION — belongs in stage 3 for every genre** | parallel perfect consonances between two parts meant to be independent; voice spacing; the low interval limit (in `lofi-harmony.md` §5) |
| **STYLE — belongs in a genre table, weighted** | contrary-motion preference, leap-then-step, the climax rule, approach to perfect consonances |
| **DOES NOT APPLY** | begin/end on a perfect consonance; dissonance treatment by species; the whole cantus-firmus frame |

---

## 1. What the sources say

### The four motions, defined

[corpus:ars-nova.com/cpmanual/independence.htm]

> "Two voices have **similar motion** if they both either ascend or descend."
> "Similar motion is **parallel** if both voices move by the same interval."
> "They have **contrary motion** if one ascends as the other descends."
> "Their motion is **oblique** if one remains at the same pitch while the other
> changes pitch."

### Parallel perfect consonances — the central prohibition

> Parallel fifths and octaves "have traditionally been considered to
> **diminish the sense of independence of voices**." [corpus:ars-nova]

> "**Do not move both parts in parallel 4ths, 5ths, or octaves.**" Additionally,
> avoid "hidden" parallel perfect intervals by similar motion **unless one part
> moves by step**. [corpus:hellomusictheory species-counterpoint]

> "Parallel motion is only allowed in parts that are separated by **imperfect
> consonances (thirds and sixths)**, and voices must not move in similar motion
> in parts that lead to either perfect fifths, octaves or unisons."
> [corpus:viva.pressbooks.pub Open Music Theory, first-species — via search
> summary; the page itself 403s to an automated fetch, so this is quoted at one
> remove and marked accordingly]

**`[two sources]`** on the core prohibition — ars-nova and hellomusictheory
state it independently, and both give the same reason.

### Consonance classification

[corpus:hellomusictheory]

- **Perfect consonances**: unison, fifth, octave.
- **Imperfect consonances**: third, sixth.
- **Dissonant**: 2nds, 7ths, augmented or diminished intervals.

*(That page also lists perfect 4ths among consonances, which is the usual
two-voice-vs-multi-voice muddle; the 4th is consonant between upper voices and
dissonant against the bass. Noted rather than resolved — it does not affect
anything built here.)*

### Contrary motion

> "Contrary motion is **best for variety and preserving the independence of the
> lines**, so it should be preferred where possible." "Contrary motion (one part
> moves up while the other moves down) provides the **greatest independence and
> clarity** between the parts." [corpus:hellomusictheory; corpus:ars-nova]

> "**Do not move both parts in the same direction by skip.**"
> [corpus:hellomusictheory]

### Melodic shape of a single line

[corpus:hellomusictheory]

> "Generally, **do not write more than one skip at a time in the same
> direction**. If it is done, **the second skip must be smaller than the first**."
> "If you have a skip in one direction, it should be **followed by motion in the
> opposite direction**."
> "There must be a **climax (high point)** in the counterpoint melody line. This
> should occur **somewhere in the middle**."

Plus, from the search summary of the same body of rules: "prefer stepwise
motion and leap only occasionally"; "melodic leaps of a tritone or seventh are
forbidden"; "the range of a voice should not be more than an interval of a
tenth."

### Spacing, crossing and overlap

> "One melody line should **not be more than a 10th (an octave + a 3rd) above
> the other**." [corpus:hellomusictheory]

> "Voices are said to **overlap** when the lower one moves to a pitch at or
> above the previous pitch of the higher voice." "**Crossing** is more than an
> overlap; the lower voice becomes the higher, and vice-versa."
> [corpus:ars-nova]

And the important qualification, which stops this becoming a ban:

> Crossing "is sometimes forbidden **just as an exercise**", but Jeppesen is
> quoted saying that without it "**no real polyphony is possible**."
> [corpus:ars-nova]

---

## 2. WHICH RULES APPLY HERE, defended one at a time

### 2.1 Parallel perfect fifths and octaves — APPLIES, and nothing checks it

**Verified in the code 2026-08-03: `grep -i "parallel fifth\|parallel
octave\|perfect fifth\|voice cross\|similar motion\|oblique"` over
`Deckards Orchestrator MK2.html` returns ZERO hits — not in code, not even in a
comment.** The only cross-part constraint in the whole composer is a `reserved`
set banning two parts from striking the *same absolute pitch at the same
instant*, and the counter's single contrary-motion preference (a flat `+100`
cost term at line 15519, relative to the lead only).

**Why it is perception and not style.** The reason two parts in parallel
octaves stop sounding like two parts is not a 16th-century convention, it is
fusion: the ear groups them into one timbre. That is the same phenomenon the
program has ALREADY hit and named from the other end — `probe_theory` measures
"unisons", and this repo's own note calls a unison "**a part disappearing
rather than a chord**". A unison is just the degenerate case of a parallel
perfect. The concern is already half-recognised; what is missing is the other
99% of it.

**And the genre distinction is already in the tables**, which is the neat part.
`GENRE.counter.style` is `"line"` or `"double"`:

- `"double"` — synthwave's counter **is** an octave double, deliberately. That
  is parallel octaves as a FEATURE, and the file already says so: "a double
  that arrives late is a mistake."
- `"line"` — declared an *independent second voice*. Here parallel perfects are
  a defect by the genre's own declaration.

So the rule does not need a new genre flag. **It applies exactly where
`style === "line"`, and the table already says where that is.**

### 2.2 Voice spacing — APPLIES, as a cost

The tenth limit is about the same fusion/separation question at the other
extreme: parts too far apart stop being heard as related. But it is a
**soft** matter — and START-HERE's own law is explicit: *"A constraint that can
be unsatisfiable must be a cost — that exact mistake has been made and fixed at
least three times."* With lofi's counter band `[57,74]` sitting inside its keys
band `[52,74]`, a hard spacing law would be unsatisfiable on many bars.

### 2.3 Contrary motion — APPLIES, and is the one rule already built

Line 15514–15520 scores it. It is a preference, correctly, not a law. Two
honest limits of the existing implementation, both worth recording:

1. It is measured **against the lead only**. The comp's top voice — which
   `buildKeys` itself weights `×2` because "it is the line the ear follows" —
   is not consulted, so the counter can move in lockstep with the part the ear
   is actually tracking and pay nothing.
2. It is a **flat +100**, so it cannot distinguish similar-but-not-parallel
   from strictly parallel, which is precisely the distinction §1 says matters.

### 2.4 Leap-then-step — APPLIES to melodic lines, and is PARTLY built

`buildTheme`'s non-chord-tone law already narrows the note after a dissonance
to one scale step. What is absent is the plain melodic version: after a *leap*
(consonant or not), prefer to step back. Nothing in the file reads the previous
interval for this purpose.

### 2.5 Voice crossing — DOES NOT APPLY as a ban

Jeppesen's line settles it, and the architecture agrees: lofi's counter band is
a strict subset of the comp band, and the code says so at 15594 — *"The counter
does not sit ABOVE the comp, it sits INSIDE it."* Crossing here is structural,
not accidental. **Do not add a crossing ban.** (The genre table's comment at
8636 claims the bands "overlap only at the edges", which is false —
`[57,74]` ⊂ `[52,74]` — and that comment should be corrected when the file is
next touched.)

### 2.6 Begin/end on a perfect consonance, species dissonance treatment,
the climax rule — DO NOT APPLY

These are exercise conventions for a cantus firmus. This program has no cantus
firmus, its phrases are drawn against a form, and its "ending" is a section
function. The climax rule is *already* expressed better and at the right scale
by the energy arc (one apex about two-thirds through, measured per genre) —
adding a per-phrase climax rule would be a second owner for the same idea and
would break Law 1.

---

## 3. WHAT TO MEASURE BEFORE BUILDING ANYTHING

The project's rule is that a claim gets a probe before it gets a mechanism, and
that the null is written down first. For counterpoint the honest instrument is:

**Between every pair of simultaneously-sounding parts, at every onset where
both move, classify the motion (parallel / similar / oblique / contrary) and
the harmonic interval before and after. A parallel perfect is: both parts move
in the same direction by the same number of semitones, and the interval is a
unison, fifth or octave both before and after.**

Two controls, so the number means something:

- **The floor**: `style: "double"` genres should read close to 100% parallel
  octaves on the lead↔counter pair, by construction. If they do not, the probe
  is wrong.
- **The ceiling**: a seeded shuffle of the same pitches at the same rhythm gives
  the rate you would get by chance. A rate at or below chance is not evidence of
  a rule working — it is evidence of nothing.

`harness/probe_counterpoint.js` is that instrument.

---

## 4. WHAT THE SOURCES DO NOT SETTLE

- **No source gives an acceptable RATE.** Species counterpoint says "never",
  which is a pedagogical absolute, not a description of real music — real
  writing in every style contains parallel perfects. So the target here cannot
  be zero and must not be set from these sources. It should be set against the
  measured rate of a `double` genre (the ceiling) and chance (the floor).
- **Nothing found addresses popular/electronic idiom at all.** Every source is
  common-practice pedagogy. The transfer argument in §2 is MINE, marked `[EAR]`
  where it is a judgement rather than a quotation.
- **Rhythmic independence is not covered by any source found**, and it is
  arguably the bigger issue here: this repo already measured that **100% of
  counter notes landed on the same step as a lead note** in all seven genres,
  and the partial fix took lofi to 65%. A second voice that only moves when the
  first moves is a harmony part whatever its intervals do.

---

## Sources

- [Independence of voices — Species Counterpoint manual, Ars Nova](https://www.ars-nova.com/cpmanual/independence.htm)
- [A Quick Guide To Species Counterpoint — Hello Music Theory](https://hellomusictheory.com/learn/species-counterpoint/)
- [First-Species Counterpoint — Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/first-species-counterpoint/) *(403 to automated fetch; quoted at one remove via search summary and marked as such in §1)*
- [Consecutive fifths — Wikipedia](https://en.wikipedia.org/wiki/Consecutive_fifths)
- [Summary of Rules for Species Counterpoint (PDF) — martiandances.com](http://www.martiandances.com/uploads/1/6/0/1/16019142/counterpoint_rules.pdf) *(503 at time of research; listed so the next person knows it exists and was not read)*
