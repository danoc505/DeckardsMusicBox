# DEVELOPMENT — the hook that comes back CHANGED, `2026-08-17`

*The lever `modal-jazz.md` §10 named as "the single highest-value next move",
built.*

---

## 1. WHAT `verseHook` ACTUALLY PRODUCED

The owner's instruction was *"Give the verse the same trick the chorus already
has: say a short idea, then say it again."* That was built, and it was the right
fix for the fault it was aimed at — the verse had **no repeating cell at all**,
0 of 12 materials.

Read what the mechanism does at eight bars, though:

```
bars 0–1    phrase() writes the idea
bars 2–3    an EXACT copy of bars 0–1
bars 4–7    an EXACT copy of bars 0–3
```

**The same two bars, four times.** A loop wearing a hook's clothes.

Measured over 60 records before this build: **38 of 60 verses were perfectly
periodic** — a cell shorter than the material repeating all the way to the end,
which is the formal definition of a loop.

---

## 2. THE MEASURE THAT FOUND THE FAULT WOULD HAVE SCORED THE FIX AS A FAILURE

This is the part worth keeping, and it is why the guard is a new file rather
than a threshold in an old one.

`boxcar-the-missing-hook.md` diagnosed the original problem with one function:
**is this material perfectly periodic?** It answered *no, 0 of 12*, and it was
right. But that single number cannot tell three different things apart:

| | periodic? | does anything return? | |
|---|---|---|---|
| a wandering tune | no | **no** | ← the original fault |
| a loop | **yes** | yes | ← the fault `verseHook` created |
| a developed hook | no | yes | ← what is wanted |

**The wandering tune and the developed hook score identically on it.** A session
watching only that number would have shipped the loop and called it done — and
one did: 38 of 60 records were perfectly periodic afterwards and nothing in the
battery reported it.

So the two halves are now asked separately, and a hook must answer both:

- **RETURN** — a cell shorter than the material comes back **exactly** at least
  once. Without it there is nothing to recognise: motifs are *"recognizable
  through their repetition"* [Webern, corpus:wikipedia/Motif].
- **VARY** — the material is **not** perfectly periodic. *"Too much repetition
  can become monotonous, which is why variation often accompanies it"*
  [corpus:vaia].

---

## 3. WHERE THE VARIATION GOES — and why not at bar 2

**The first return stays exact. The second one develops.**

```
bars 0–1    the idea
bars 2–3    exact restatement    ← this is what teaches the ear the tune
bars 4–7    DEVELOPED
```

That order is the whole design: **you cannot develop something the listener has
not learned yet.** It is also why material B's existing guard is untouched — the
battery asserts bars 0–3 restate exactly, and they still do, 40/40.

---

## 4. THE THREE DEVICES, ALL SOURCED

Each is a pitch- or step-only transform of a phrase that already exists, so none
can invent a note breaking a rule the phrase did not already satisfy.

| device | definition | source |
|---|---|---|
| **sequence** | *"repeating a motive at different pitch levels"* — every pitch moved by the same number of **scale** steps, so it cannot leave the key | [corpus:vaia] |
| **displace** | *"taking a rhythmic pattern and starting it on a different beat or subdivision than expected"* | [corpus:learn2playjazz] |
| **tail** | only the last note changes — the antecedent/consequent pair, the oldest varied repeat there is | classical practice |

On displacement, the source that makes the case best is about jazz players
passing a theme around:

> "the rhythm of each solo differing **just enough to make it sound like they're
> not all playing the same piece of music — even though they pretty much are**"
> [corpus:hackmusictheory]

That is exactly the effect wanted from a hook returning for the third time.

### 4a. ALL-OR-NOTHING, AND IT FALLS BACK TO THE EXACT COPY

A device is applied only if **every** note of the developed copy survives — in
band, inside the bar block, not on a seat another part reserved, and not
repeating the note in front of it. A partial transform is a *different phrase*,
not a varied one. If nothing fits, the copy is exact and the material is what it
was — **so this cannot make a record worse than it was**.

### 4b. EXHAUST THE PARAMETER BEFORE ABANDONING THE DEVICE

The first version drew one interval per device and gave up on the device if that
interval did not fit. **Measured: 26 of 60 records fell all the way through to
the plain copy.**

A sequence is a *device*; "up a second" is a **parameter** of it, and a third
being out of band is not a reason to stop transposing. Each device now gets
every one of its settings, in an order rotated by the draw so the choice is
still the seed's. **26 of 60 → 10 of 60.**

---

## 5. WHAT IT MEASURES, BEFORE AND AFTER

60 records, boxcar synth's verse material:

| | before | after |
|---|---|---|
| the hook returns exactly (bars 0–1 at 2–3) | 60/60 | **60/60** |
| the material is a **plain loop** | **38/60** | **0/60** |
| the developed return keeps the idea's contour | 56/60 | 54/60 |
| the return has the same number of notes | — | 56/60 |
| which device won | — | sequence 22, displaced 21, tail 3, no fit 10 |

And at the level the original audit used — whole records, 4-note figures:

| | before | after |
|---|---|---|
| lead notes | 1565 | 1595 |
| distinct 4-note figures | 705 | **754** |
| most-heard figure | 10.8× | 10.3× |

**Only 7% more distinct material.** That is the number that says this is a
*variation* and not a rewrite: all the perfect looping is gone, and the tune is
barely more various than it was. The change re-states, it does not invent.

### 5a. THE NOTES, PRINTED — seed 12, B mixolydian

```
idea   *---*-------*--.   73 71 69
idea   *---*---*---....   68 66 66
again  *---*-------*--.   73 71 69      ← exact
again  *---*---*---....   68 66 66
DEV    *---*-------*--.   75 73 71      ← a sequence, up one scale step
DEV    *---*---*---....   69 68 68
```

Same rhythm, same contour, new pitch level. That is a textbook sequence and it
is what the sources describe.

---

## 6. THE GUARD — `harness/probe_develop.js`

Asserts three things, and **only for a genre that declares `theme.develop`** —
a genre with no hook is not failing this test, it is not taking it:

1. the hook returns exactly, so there is something to recognise
2. the material is never a plain loop
3. the developed return keeps the idea's contour (≥ 75%)

**It has been watched failing.** Run against a build that keeps the declaration
and breaks the mechanism, it reports `24/40 perfectly periodic` and exits 1.

---

## SOURCES

- [Motive Development — Vaia](https://www.vaia.com/en-us/explanations/music/music-theory/motive-development/) — sequence, augmentation, diminution, inversion, retrograde, fragmentation; and the unity/monotony argument
- [Motivic Development — Vaia](https://www.vaia.com/en-us/explanations/music/music-analysis/motivic-development/) — sequence as stepwise transposition; "preserve the identity of the motive while adding variety"
- [How to Use Rhythmic Displacement — learn2playjazz](https://www.learn2playjazz.com/rhythm-skills/how-to-use-rhythmic-displacement)
- [How to Layer Melodies Using Rhythmic Displacement — hackmusictheory](https://hackmusictheory.com/blogs/theory/posts/5707447/how-to-layer-melodies-using-rhythmic-displacement-feat-music-theory-from-mogwai-les-revenants-sou)
- [Motif (music) — Wikipedia](https://en.wikipedia.org/wiki/Motif_(music)) — Webern: motifs are "recognizable through their repetition"
- [What Is Modal Jazz? — New York Jazz Workshop](https://newyorkjazzworkshop.com/what-is-modal-jazz/) — "breathe, repeat, vary, and resolve", via `modal-jazz.md` §10

The device weights (sequence 4, displace 3, tail 2) are a judgement and nothing
has heard them.
