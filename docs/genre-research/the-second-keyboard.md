# The second keyboard shadows the first — measured, sourced, and fixed

*Researched 2026-08-05, after `probe_counterpoint` was taught to report per
PAIR rather than per genre. That change is the whole reason this sheet exists:
the defect it names has been in every bladerunner and lofi song for as long as
those genres have had a second keyboard, and the probe's per-genre average
could not see it.*

---

## 1. THE MEASUREMENT THAT FOUND IT, AND THE CLAIM IT FALSIFIES

`counterpoint-measured.md` §4 says, in bold: **"Every genre's worst pair
involves the BASS."** That was true when it was written. The bass work of
`2026-08-04e` (lofi) and `2026-08-04l` (jungle) has since moved it, and nobody
re-ran the measurement broken out by pair, because the probe could not do it.

Measured now, 45 seeds a genre, every pair with ≥100 shared steps, each against
its own seeded-shuffle floor:

```
  bladerunner  bass<->keys      10.1%  of  1802 steps   (chance 1.7%)   5.9x
               keys<->keys2      8.9%  of  1258 steps   (chance 0.9%)   9.9x
  dkc          bass<->keys      10.3%  of  2238 steps   (chance 2.4%)   4.3x
  lofi         keys<->keys2      4.2%  of   498 steps   (chance 1.1%)   3.8x
               bass<->keys       1.5%  of  4482 steps   (chance 0.8%)
  synthwave    bass<->ostinato   5.8%  of 28134 steps   (chance 2.1%)   2.8x
  acid, plastikman, jungle       at or BELOW chance
```

**`keys<->keys2` is the worst RATIO in the file, and it is high on both of the
only two genres that have a second keyboard.** 9.9× chance on bladerunner and
3.8× on lofi is not a genre's character; it is one mechanism, showing up
wherever the mechanism runs.

### Why the bass pairs are NOT the target, though two of them are larger

dkc and bladerunner are the two genres whose basses `BACKLOG.md` §6.8 marks as
**"done and correct — a declared pedal and a declared drone"**. A pedal holds
one note under changing chords and a drone restrikes only when the chord moves;
both produce parallel motion against the comp *by design*. Changing that would
change what those genres are, and it is a taste question with an owner.

The second keyboard has no such defence. Nobody declared that it should move in
lockstep with the first — it simply does, and until this measurement nobody
knew.

---

## 2. WHY IT MATTERS, AND IT IS PERCEPTION RATHER THAN ETIQUETTE

`counterpoint.md` §2.1 already established the principle for this repo and it
is worth restating in the sources' own terms, because two new ones put it more
sharply than the ones already on file:

> Parallel fifths or octaves between two voices "would **reduce the texture of
> the piece from N to N−1 voices perceptually**". [corpus:schoolofcomposition]

> Voices moving in parallel fifths or octaves "**sound like the same voice but
> with a different timbre**, so if two voices suddenly start moving together in
> fifths or octaves the effect is that you lose a voice and change the sound of
> one of the voices". [corpus:wilktone]

> The perfect fifth and octave "are the most stable of intervals, and to link
> two voices through parallel motion at such intervals **interferes with their
> independence** much more than would parallel motion at 3rds or 6ths".
> [corpus:choraleguide]

**`[three sources]`** — and the point is exact for this defect. A second
keyboard exists to add a layer. A second keyboard moving in parallel perfect
intervals with the first is not adding a layer; it is thickening the first
one's timbre. The program is paying for a whole extra part and, for 9% of the
steps on bladerunner, getting a chorus effect.

This repo already half-knows it from the other end: `probe_theory` measures
"unisons" and this project's own note calls a unison **"a part disappearing
rather than a chord"**. A unison is the degenerate parallel perfect.

---

## 3. WHAT ARRANGERS ACTUALLY DO WITH A SECOND ACCOMPANIMENT PART

The prescriptive half, and the sources are consistent:

> **"If you've got two players accompanying a melody, have the strings play the
> guide tones"** — usually the third and seventh of the chord, which "give the
> chord its color and flavor". And: **"good voice leading makes a huge
> difference and is more important than making sure every guide tone is
> covered."** [corpus:berklee, Mimi Rabson, *Writing String Pads*]

> On layering keyboard parts: do not copy a voicing across — "duplicate the
> MIDI and **change something small — voicing, octave, or timing**". Keeping
> two layers within an octave of each other is "somewhat neutral" and lets the
> chord colour through "without distraction". [corpus:dharmastudio;
> corpus:worshipartistry]

So the second part is meant to be **complementary, not congruent**: a different
selection of the same chord's tones, led smoothly, in its own register.

### What this repo already does right, and should not be credited for by accident

`allocKeysBand` gives the second keyboard **its own register** — above the comp
where there is room, otherwise in the gap between the comp's floor and the
bass's ceiling. So the register half of the sources' advice is already
satisfied, and it is *not* enough: two parts an octave apart moving in parallel
are exactly the case the fusion sources describe.

---

## 4. THE MECHANISM, READ OFF THE CODE

`keys2` is built by the **same function** as `keys` — `buildKeys(chords,
"keys2", { sustain: true, at: 2, band, avoid: reserve(ostA.concat(bassA,
keysA)) })`. Two consequences, and the second is the defect:

1. It voices the **same chord sequence**, so when the chord changes both parts
   move, and whatever interval sat between them tends to survive the change.
   This is the identical mechanism `BACKLOG.md` §6.8 describes for bass↔keys,
   one part over.
2. It is handed `avoid` — a set of **absolute pitches already struck**, which
   stops the two landing on the same note — and **nothing else**. The cost
   function inside `buildKeys` scores voice leading against *its own previous
   voicing* and has never been shown the other keyboard at all. The two parts
   are voiced independently and then simply coexist.

`avoid` is a collision check, not a counterpoint one. It refuses the unison —
the degenerate case — and permits every other parallel perfect.

---

## 5. THE DECISION

> **When the second keyboard is voicing a bar the first keyboard also moves in,
> a candidate that moves its top voice by the same distance and direction as
> the first keyboard's top voice, across a perfect interval, pays a cost.**

### A cost, not a filter

The repo's standing law: *"a constraint that can be unsatisfiable must be a
cost"* (`START-HERE.md`), and `buildKeys` has already learned it twice in its
own comments — openness was a hard filter and threw "no keys voicing fits" on
synthwave bar 0. The candidate list here is a handful of inversions already
narrowed by the band, the muddiness rule, the ceiling and the collision set. A
filter could empty it, and an empty list is a thrown song.

### The TOP voice, and why that is the honest choice

`buildKeys` already weights the top voice ×2 in its own voice-leading term, on
the stated grounds that *"it is the line the ear follows"*. The same argument
picks the voice this cost should watch, and it has a second virtue: it is the
voice `probe_counterpoint` reduces each part to, so the fix is measured by the
instrument that found the defect rather than by a friendlier one. The probe's
own header records the limitation this shares — a parallel fifth buried among
the inner voices is invisible to both. Named, not hidden.

### What it deliberately does NOT do

- **It does not touch `keys` itself**, only the part that is handed another
  keyboard to avoid. The first keyboard is the record's harmony and is not the
  thing shadowing anything.
- **It does not touch the bass pairs.** dkc's pedal and bladerunner's drone are
  declared and defended; that row belongs to whoever revisits those genres.
- **It does not chase inner voices.** Same limit as the probe, stated above.
- **It does not forbid parallel motion**, only parallel motion across a perfect
  interval — thirds and sixths in parallel are how two parts are *supposed* to
  be linked [corpus:choraleguide], and the cost says nothing about them.

---

## 6. WHAT WAS BUILT AND WHAT IT MEASURED — build `2026-08-05f`

`buildKeys` takes a new `opts.against` — the keyboard this one plays alongside
— and reduces it to a top voice per bar. In the cost, where `prev` already
exists, a candidate whose top voice moves the same distance and direction as
the other keyboard's, across a perfect interval, pays **12**. Heavier than a
semitone of top-voice movement (2), lighter than wanting the wrong openness
(22): a shadowing candidate loses to any reasonable alternative and still wins
when it is the only sane shape left. All four `keys2` call sites pass it.

### On the material, at the granularity the cost governs — A/B, 45 seeds

```
                         before   after
  bladerunner            13.0%     9.1%     (31 of 238 -> 22 of 242)
  lofi                    3.5%     1.2%     (12 of 340 ->  4 of 340)
```

### Read off the notes, and this is the mechanism working

Both genres pick a **different inversion of the same chord** so the pad's top
voice stops tracking the comp's. lofi seed 4, bar 4: the pad's top goes from
scale degree 2 to degree 1 and the voicing re-stacks C3/D#3/G3/G#3/A#3 where it
was D#3/G#3/A#3/C4/G3. bladerunner seed 4, bar 3: degree 7 to degree 2,
D#3/G#3/C4 where it was C3/D#3/G#3. No note was moved after the fact and no
chord changed — a different member of the same chord was chosen at the choice.

### Blast radius

**19 of 2100 songs** — lofi 14, bladerunner 5, and **zero** in the five genres
with no second keyboard. Form and arrangement hashes untouched. Baseline
re-recorded `c98cf33cd7844c7f`. Seed 1 is not among them, which is worth saying
plainly: the RULE ONE rolls for all seven read IDENTICAL, and the notes above
had to be read on seed 4 instead.

### The seam check, and the threshold was driven both ways first

`mk2_test`: the same bar-to-bar measure over 12 seeds × 7 genres, guarded at
5%. Verified failing: **2.9% of 174 steps with the cost, 6.4% of 172 without.**
Two thresholds were tested and discarded earlier in this same session for
looking decisive at 45 seeds and failing to separate the builds at 8, so this
one was measured at 8 *and* 12 before it was written (3.4/8.0 and 2.9/6.4).

---

## 7. THE HONEST GAP — the performance barely moved, and I cannot fully explain it

**`probe_counterpoint`'s per-pair figure, which is what found this defect,
went 8.9% → 8.1% on bladerunner and did not move at all on lofi.** The material
improved by 30% and 66%; the performance did not follow. That is not the
result this section would like to report and it is the one it has.

What has been ruled out:

- **It is not the granularity.** The defect measured on the material bar-to-bar
  (bladerunner 13.0%) and at joint onsets (9.3%) is the same defect at the same
  order of magnitude, so the cost is aimed at the right motion.
- **It is not mainly section joins.** The probe walks consecutive joint onsets
  across the whole song, so a step can span a change of material that no
  voicing chooser can see across. Measured by splitting the probe's steps on
  the time gap: joins run 13.6% against 7.5% for steps within 1.5 bars on
  bladerunner — worse, but only 132 of 1258 steps, nowhere near enough.

What is left unexplained, and it is the substantive part: **lofi's material
reads 1.3% at joint onsets while its performance reads 4.0% within 1.5 bars.**
The performance is producing parallel perfects between these two parts that the
composed material does not contain. Candidates not yet tested: the arc thinner
removing an onset and making two non-adjacent notes adjacent; the loop wrap
from a material's last bar to its first on the next repeat; groove displacement
quantising two parts onto the same step that were written on different ones.

**Until that is settled, the claim this build supports is exactly: the composed
second keyboard is measurably more independent, and whether that survives into
the performance is unproven.** It is a small, cheap, sourced change with a
19-song blast radius, which is why it ships rather than waiting — but it does
not close the row it came from.

### And the ear has heard none of it

The pad picks a different inversion in 19 songs. No number here says that
sounds better.

---

## Sources

- [Writing String Pads — Mimi Rabson, *Berklee Today*](https://www.berklee.edu/berklee-today/fall-2018/writing-string-pads)
- [What's Wrong with Parallel Fifths? — School of Composition](https://www.schoolofcomposition.com/whats-wrong-with-parallel-fifths/)
- [Why Are Parallel Fifths Bad Voice Leading? — Wilktone](https://wilktone.com/?p=4227)
- [Voice-leading in Bach chorales: Parallel fifths and octaves — Chorale Guide](http://www.choraleguide.com/vl-parallels.php)
- [Tips to Create More Expressive Chord Progressions by Layering Pads — Dharma Studio](https://www.dharmaworldwide.com/tips-to-create-more-expressive-chord-progressions-by-layering-pads/)
- [How to Layer Your Keyboard Tones & Sounds — Worship Artistry](https://worshipartistry.com/greenroom/keyboard/how-to-layer-your-tones)
- `docs/genre-research/counterpoint.md` §1, §2.1 — the four motions and the prohibition, already on file
- `docs/genre-research/counterpoint-measured.md` §4 — the claim this sheet falsifies
