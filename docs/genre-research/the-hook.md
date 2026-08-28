# The hook — the part you remember, and why the program had none

*Researched 2026-08-28 for Phase 3 of `docs/NEXT-BUILD-THE-PART-YOU-REMEMBER.md`.*

> **The owner:** *"There never is a memorable part that defines a song and this
> is a program wide issue."*
>
> **And, the same day:** *"We dont want the same repetitve Mortis type music we
> are evolving past that style."*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

**Those two sentences are not in tension, and reconciling them is what this
sheet is for.** A hook is not monotony. Monotony is one idea held for nine
minutes; a hook is a short fixed cell inside a tune that then goes somewhere.
The sources draw that line explicitly, and the classical theory has a name for
the shape.

---

## 1. THE MEASUREMENT — AND IT IS THE STARKEST NUMBER THIS PROJECT HAS PRODUCED

Asking each genre's material for its tune, and looking for **any contiguous run
of bars that repeats immediately** — a cell said twice:

```
                    A (the verse tune)      B (the chorus tune)
  lofi                 0 / 12                    1 / 12
  synthwave            0 / 12                    0 / 12
  dungeonsynth         0 / 12                   10 / 12
  fantasysynth         0 / 12                    0 / 12
  ds2                  0 / 12                   10 / 12
```

**The verse tune contains a repeated cell in ZERO of twelve records, in every
genre in the file.** Not rare — never. Four bars of continuous invention, every
record, in the material that is most of every record.

**And the exception explains itself.** `themeB` is built with `hooky: true`
where the genre allows it, and the flag resolves as `hooky: !STORY.B` — so a
genre that declares `theme.story.B` gets a *derived* chorus (the verse tune
augmented, diminished or fragmented) instead of a hooky one. lofi, synthwave and
fantasy synth all declare `story.B`; dungeon synth does not. That single line
accounts for every number in the right-hand column.

**So the mechanism has always worked and the verse was never allowed it.** The
engine's own comment says as much: *"themeB has passed `hooky: true` since it was
written; themeA has never passed anything."*

---

## 2. WHAT THE MECHANISM ACTUALLY DOES

`opts.hooky` in `buildTheme`, read from the code rather than the comment:

> writes **one two-bar phrase**, then copies it to bars 2–3 **exactly** —
> dropping the phrase's last note first if it duplicates its own first note, so
> the seam between the two statements is clean at every restatement in the
> record.

On this program's four-bar materials that is an **`aa`**. Verified in the notes,
ds2 seed 1, material A:

```
  bar 0  |*-------........|  D#5@0:8
  bar 1  |....*---*---....|  E5@4:4  E5@8:4
  bar 2  |*-------........|  D#5@0:8        <- exact copy
  bar 3  |....*---*---....|  E5@4:4  E5@8:4 <- exact copy
```

---

## 3. THIS SHAPE HAS A NAME, AND ITS PURPOSE IS THE OWNER'S COMPLAINT

**Schoenberg's *sentence*.** An eight-measure theme in two phrases:

- a **presentation phrase**, which is *"a basic idea and a repetition of the
  basic idea"*, and
- a **continuation phrase**, which brings *"fragmentation, increase in surface
  rhythmic activity, harmonic acceleration and a cadence"*, often with
  **liquidation** — *"gradually eliminating characteristic features, until only
  uncharacteristic ones remain"*.

And Schoenberg's own stated reason for the internal repetition is the thing the
owner says is missing: **"immediate intelligibility."**
[corpus:College Music Symposium, corpus:artofcomposing, corpus:BaileyShea]

**This is the answer to "we are evolving past Mortiis".** The sentence is
repetition *in the service of* development — the idea is stated twice so that
the listener holds it, and then it is broken up and driven to a cadence. That is
the opposite of a loop held for nine minutes. The program was doing neither: no
presentation (nothing stated twice) and therefore nothing for a continuation to
develop.

**Where this program's continuation lives.** Our materials are four bars, so
`hooky` fills the whole material with the presentation. The continuation is not
absent — it happens **one level up**, across sections: `Avar` redraws the tune's
tail, `Adev` keeps its rhythm and redraws its notes, and `theme.story` names an
operation (fragment / augment / diminish) for each other chord set. The sentence
is realised across the record rather than inside the material. **Worth knowing,
because it means the hook is an anchor and not the whole design.**

---

## 4. WHY REPETITION IS WHAT MAKES A PART MEMORABLE

The mechanism the owner is asking for, stated by the sources:

> *"Catchiness is a memory effect... The single most reliable ingredient in a
> catchy phrase is repetition. A motif the ear hears once is an event. A motif
> it hears three or four times is a pattern, and patterns are what memory
> stores."* [corpus:musiciangoods]

> *"write a short 1- or 2-bar melody... repeat this idea once or twice, and
> you've got most of your verse in place."* [corpus:secretsofsongwriting]

> *"A hook is usually repeated **the same way each time**, while a motif serves
> as material that is **modified and developed**."* [corpus:aimm]

That last line is the diagnosis in one sentence: **this program had only
motifs.**

Margulis's *On Repeat* is the underlying research — repetition as *"a kind of
re-presenting, a kind of prosthetic memory, whereby past events are put once
more before the ears"* — and it identifies the earworm as *"a short musical
fragment of the kind that is easily retained in memory."*
[corpus:Margulis, OUP]

---

## 5. ⚠ THE ONE THING THE SOURCES SAY WE HAVE NOT BUILT

Named here rather than shipped, because it is the obvious next move and this
build does not make it:

> *"Pure repetition alone becomes monotonous, so the strongest hooks use
> **repetition with variation**. The cell returns, but something small changes —
> the last note lands a step higher, the rhythm clips or extends, the phrase
> answers itself a degree lower. The ear gets the comfort of the familiar shape
> and the small reward of the change."* [corpus:musiciangoods]

**Our copy is byte-exact.** Bars 2–3 are bars 0–1 with nothing changed. That is
the safest version and the right one to ship first — it is the version whose
effect can be measured, and an exact copy is what makes the seam-cleaning rule
above possible. But the sources are clear that the strongest form varies the
second statement slightly, and **that is directly what the owner's "evolving
past Mortiis" points at.**

The shape to build, when the ear has judged this one: keep bars 0–1, copy to
2–3, then alter **one** thing in the copy — most naturally its last note, since
the phrase's tail is already special-cased by the seam rule. `variation.md` §3
already holds this project's research on same-opening-redrawn-tail and is where
that work should start.

---

## 6. WHAT WAS DECLARED, AND THE ONE GENRE LEFT OUT

| genre | `theme.verseHook` | why |
|---|---|---|
| dungeonsynth | **declared** | the verse is most of the record |
| ds2 | inherited | shallow merge over the parent's `theme` |
| synthwave | **declared** | see below — the strongest case in the file |
| fantasysynth | **declared** | its motif walks the whole journey; recognition is the point |
| lofi | **deliberately not** | see below |

**Synthwave is the strongest case and the measurement is why.** Its verse *and*
its chorus both measured 0 of 12. Meanwhile three separate tables in that genre
describe a hook: the plan's legs are named `rise`, `hook`, `strip`, `rise2`,
`climax`; the pre-chorus "plays the hook's own material" so the arrival feels
prepared; the post-chorus is "the hook still ringing" with the voice gone.
**Three tables describing a hook the program never wrote.**

**lofi is left out on purpose**, and on somebody else's authority rather than
mine. The mechanism's author wrote the exception down when they built it: *"A
GENRE DECLARATION, not a new law, because it is a taste: **lofi's verse
wandering is lofi being lofi**."* A beat tape is a mood held for two and a half
minutes and its tune drifts over the loop; its hook is the drum pattern and the
chord, both of which already repeat. Recorded at the table as a decision, since
an absence reads as an oversight next time somebody counts.

---

## 7. WHAT IT DID

```
                  repeated cell in the verse tune     lead notes per bar
  dungeonsynth        0/12  ->  12/12                    0.68 -> 0.99
  ds2                 0/12  ->  12/12                    0.68 -> 0.99
  synthwave           0/12  ->  12/12                    1.48 -> 1.95
  fantasysynth        0/12  ->  10/12                    1.16 -> 1.43
  lofi                0/12  ->   0/12  (deliberate)      unchanged
```

**The tune got DENSER, not thinner** — up 45% in the dungeon synths — because
each genre's `theme.count.hooky` allows more notes a bar than its `normal`. That
was not the aim and is worth stating: a hook here is both repeated *and* better
filled in than the wandering line it replaces.

**Still thin in absolute terms.** Dungeon synth's tune is under one note a bar
even after this. That is a separate open item and it is not claimed to be fixed.

---

## SOURCES

- [A Taxonomy of Sentence Structures — College Music Symposium](https://symposium.music.org/index.php/54/item/10629-a-taxonomy-of-sentence-structures) — presentation/continuation/cadential, "immediate intelligibility", liquidation
- [Sentence vs Period — Art of Composing](https://www.artofcomposing.com/question/sentence-vs-period-differences) · [Beyond the Beethoven Model — BaileyShea, *Current Musicology*](https://journals.library.columbia.edu/index.php/currentmusicology/article/download/5033/2302/8721) · [A brief introduction to the Sentence — Huijsman](https://siemhuijsman.com/a-brief-introduction-to-the-concept-of-sentence/)
- [What Makes a Song Catchy? — Musiciangoods](https://musiciangoods.com/en-us/blogs/music-theory/what-makes-a-song-catchy) — catchiness as a memory effect; repetition-with-variation as the stronger form
- [Creating Melodies Using Melodic Cells](https://www.secretsofsongwriting.com/2016/02/18/creating-melodies-using-melodic-cells/) · [The Hook, and Other Repeating Elements](https://www.secretsofsongwriting.com/2010/04/21/the-hook-and-other-repeating-elements/)
- [What Is a Hook in a Song — Icon Collective](https://www.iconcollective.edu/what-is-a-hook-in-a-song) · [Repeated hooks — MusicRadar](https://www.musicradar.com/how-to/songwriting-repeated-hooks)
- [Margulis, *On Repeat: How Music Plays the Mind* — OUP](https://global.oup.com/academic/product/on-repeat-9780199990825)
- `docs/genre-research/variation.md` §3 — this project's own prior research on same-opening / redrawn-tail, where §5's next step belongs
