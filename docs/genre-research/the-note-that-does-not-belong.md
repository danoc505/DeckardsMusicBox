# When is a note outside the key allowed? — widening the law, not relaxing it

*Researched 2026-08-04. The bass work stopped at a seam check and I wrote it up
as "a real decision about the law" and left it for someone else. The user:
"Widening that law is something you need to determine what and or how to do…
Music theory is the physics engine, held together by constraints." Correct.
This sheet decides it.*

---

## 1. THE LAW AS IT STANDS, AND THE ONE QUESTION IT ASKS

```js
if(!inKey(chart.root, chart.mode, n.pitch)){
  const ch = chSet[n.bar % chSet.length];
  const ok = ch && ch.tones.some(t => pc(t) === pc(n.pitch));
  if(!ok) throw new Error("out of key and not in the chord…");
}
```

Its own comment already got this half right, and the half it got right is the
important half:

> "THE LAW IS NOT 'EVERYTHING IS DIATONIC'. It used to be… The real law is that
> **NO NOTE IS ARBITRARY**. A pitch outside the key is legal exactly when the
> chord sounding under it contains it."

So the principle is settled and correct: **a note off the scale has to be
spelled by the harmony.** What is wrong is that the law asks about **one**
harmony — the one underneath — and there is an entire class of notes, the most
characteristic gestures in this idiom, that are spelled by the harmony they are
**going to**.

---

## 2. WHAT THE THEORY ACTUALLY SAYS: EVERY ONE OF THESE IS DEFINED BY MOTION

The classical taxonomy of notes that do not belong to the chord. Read the
right-hand column, because it is the whole finding:

| figure | what defines it |
|---|---|
| **passing tone** | approached by step, **left by step in the same direction** |
| **neighbour tone** | left by step, **returns by step** |
| **appoggiatura** | approached by leap, **resolved by step in the opposite direction** |
| **escape tone** | approached by step, **left by leap the other way** |
| **anticipation** | arrives before the harmony changes and is **then the same note, now a chord tone of the new chord** |

[corpus:openmusictheory Embellishing tones; corpus:pressbooks Harmony and
Musicianship; corpus:wmich Non-Chord Tones; corpus:milne Nonharmonic Tones]
**`[four sources]`**

**Not one of them is defined by which chord it sits over.** Every single one is
defined by *how it is approached and how it leaves*. A note is legal because of
what happens either side of it.

And the jazz figure the bass needs, stated as precisely as anyone states it:

> A chromatic approach note is "a note one half step below or above your target
> note, played immediately before landing on the target… **Before a chromatic
> approach note, either stepwise or leapwise motion is acceptable, but
> afterward, basically it should resolve with a half-step motion to the target
> note.**" [corpus:learn2playjazz; corpus:jazzlessonvideos;
> corpus:jazzpianoschool] **`[three sources]`**

**"Before… is acceptable, afterward it should resolve."** The figure is defined
entirely by its DEPARTURE. That is the sentence this law was missing.

---

## 3. THE WIDENED LAW

> **A note outside the key is legal when it is spelled by the harmony on either
> side of it:**
>
> **(a)** the chord sounding under it contains it — *the law as it stands*, or
> **(b)** it resolves by a step or less into a tone of the chord that follows.

That is all. Clause (b) is the taxonomy in §2 written as a rule: it admits the
chromatic approach note (resolves by a semitone), the diatonic approach note (a
whole step), and the anticipation (resolves by nothing at all, because it is
already the next chord's note arriving early).

### Why this does not weaken anything

**Because clause (b) is an obligation, not a permission.** It does not say "a
stray note is fine if it is near something". It requires that **the very next
note in that same part is a chord tone, and within a step.** A wrong note has
no such obligation and cannot acquire one — to pass, it has to be followed by
its own resolution, which is exactly the definition of every figure in §2.

The law is not loosened. It goes from asking one question to asking two, and
both are strict. A note that satisfies neither still throws, as it always did.

### And it closes a gap this repo already wrote down

`counterpoint-measured.md` §3, measured on 382 chorales: Bach approaches a
clash by step **96.8%** of the time and leaves one by step **91.3%** —
fractionally *stricter arriving than departing*. This program had a law about
departure for the tune and nothing anywhere about arrival. Clause (b) is a
departure rule for the note itself; the arrival rule is still open and is still
in the backlog.

### What it deliberately does NOT do

- **It does not look across a change of material.** A note is judged inside its
  own loop, which is where its resolution has to live — the materials never
  sound together.
- **It does not exempt the last bar.** A four-bar material is a LOOP, so the
  note after the last one is the first one, and it is judged that way. A walk
  into the top of the loop is a real resolution and has to be treated as one,
  or the law would forbid at bar 3 what it allows at bars 0 to 2.

---

## 4. WHAT IT IS FOR — the bass's approach note

`bass.md` §2, three sources: the last beat of the bar carries "an approach note:
a chromatic step above or below the NEXT chord's root". It is the single most
characteristic move in a walking bass and the one that most breaks the lockstep
with the chords that `counterpoint-measured.md` found.

This program already walks into the next chord, and takes a **scale** step to
do it — because a chromatic one threw. That is the law shaping the music, which
is the right way round; it was just the wrong law.

---

## 4b. WHAT WAS BUILT, AND THE BUG THE LAW CAUGHT — `2026-08-04f`

The law is widened and lofi's walk into the next chord is a semitone.

**The widened law on its own moved NOTHING** — 2100 seeds byte-identical. It
permits; it does not generate. That is the right shape for a law and it is
worth stating, because a law that changed the music by being written would not
have been a law.

**Then it immediately earned its keep by throwing.** Turning the chromatic
approach on broke three lofi seeds, and the cause was real:

```
  seeds 17, 18, 40 — out of key, not in the chord, and does not resolve
```

`intoBand` folds a pitch back inside a register by whole octaves. A semitone
*below* the next root falls under the walk band's floor on a chord near the
bottom of the register — and comes back **an octave and a semitone** from its
target. That is not approaching anything, and the law said so.

**The note is dropped rather than moved.** An approach note that has been
relocated is a wrong note wearing the name of a right one, and this file
repairs nothing after the fact. Only the chromatic path is guarded, so every
other genre's scale walk is untouched note for note.

**Read off the notes**, seed 1's bass row, before and after:

```
  before   1-------..5-.... 4-------..?-..7- 1-------..5-..6- 5-------..2-..7-
  after    1-------..5-.... 4-------..?-..?- 1-------..5-..6- 5-------..2-..?-
```

Position 14 is the walk. It was a scale degree; it is now a semitone, and it
prints `?` when that semitone is outside the key — which is the whole point.
The `6` in bar 3 is also a semitone approach; it just happens to be a note the
scale contains.

**Measured, lofi, against the build before it:**

```
  notes that are neither root, third nor fifth   14.3%  ->  17.1%
  moves by step                                  38.6%  ->  40.0%
  repeats its own note                           14.2%  ->  13.4%
  out-of-key notes (probe_theory)                 2.5%  ->   3.9%
```

**And it did NOT move the parallel fifths** — keys/bass 5.56% → 5.57%. Worth
saying plainly, because the temptation is to claim it did: the walk note
already existed and already broke the lockstep. Making it chromatic changes its
COLOUR, not its motion. The parallels were won by the previous change and this
one adds nothing to them.

Six genres byte-identical, 300 songs each, printed notes identical side by
side.

---

## 5. WHAT THE SOURCES DO NOT SETTLE

- **Whether an approach note should be accented.** "A chromatic passing tone is
  unaccented and connects two scale/chord tones, while an approach note is
  typically **accented** and targets a specific note"
  [corpus:learn2playjazz] — but the walking-bass sources put it on the last
  beat, which is weak. Both are described; nothing reconciles them. This
  program puts it on the last beat at a lower velocity, which follows the
  walking sources, and that is `[EAR]`.
- **How often.** No source gives a rate. Left as a genre draw.
- **Whether the same widening should reach the TUNE.** The law is one law for
  every part, so clause (b) applies to all of them — but nothing in this sheet
  argues that a melody *should* use it, only that the law no longer forbids it.
  Whether any part other than the bass takes it up is a separate question with
  its own research.

---

## Sources

- [Embellishing tones — Open Music Theory](https://openmusictheory.github.io/embellishingTones.html)
- [Nonharmonic Tones — Harmony and Musicianship with Solfège (Pressbooks)](https://pressbooks.pub/harmonyandmusicianshipwithsolfege/chapter/nonharmonic-tones/)
- [Non-Chord Tones — Western Michigan University](https://legacy.wmich.edu/musicgradexamprep/NonChordTones.pdf)
- [Nonharmonic Tones — Fundamentals, Function, and Form (Milne)](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/15-nonharmonic-tones/)
- [What Are Chromatic Approach Notes — learn2playjazz](https://www.learn2playjazz.com/improvisation-techniques/what-are-chromatic-approach-notes)
- [15 Approach Note and Enclosure Exercises — Jazz Lesson Videos](https://www.jazzlessonvideos.com/post/15-approach-note-and-enclosure-exercises-that-every-jazz-musician-should-know)
- [Double Chromatic Approach — Jazz Piano School](https://jazzpianoschool.com/wp-content/uploads/2016/05/Step-1-Double-Chromatic-Approach.pdf)
