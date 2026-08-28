# The counter and the figure — and I answered about the wrong lane, twice

*Researched, built and measured 2026-08-28. The second half of the owner's
instruction "Fix the rhythm first then the counter"; the first half is
`docs/genre-research/the-melodic-rhythm.md`.*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

---

## 1. ⚠ WHAT THE OWNER WAS LOOKING AT WAS NOT THE COUNTER, AND HE SAID SO

> *"What is a counter and why does it always look the same?"*
>
> and, after my answer: *"I think you're bullshitting about what the counter
> looks like in one of our songs in relation to its definition."*

He was right, and here is the exact shape of the error.

**The rig line prints `ostinato=counter`.** The ostinato's *instrument* is named
"counter", so the row on every printout that reads

```
    ostinato counter    |*---*---*---*---|
```

for ten minutes without changing **is the ostinato.** `deriveCounter`'s part
prints as `counter counter`. I read the first and answered about the second.

**And the number I quoted was against a field this file states is never read.**
I reported *"dungeonsynth delivers 82% on-lead-onset against a declared
`answer: 0.85`"*. `CT.answer` is read in exactly one place —
`else if(style !== "double" && ansDraw < (CT.answer || 0))` — sitting in the
`else` of `if(ANSWER)`. A genre whose style pool is `[["answer",7],["double",3]]`
can never reach it, and **the table's own comment says so in as many words**:

> *"`answer` stays declared and is now unread by this style, which is
> deliberate: it is what this line reverts to if the style is changed back."*

So the comparison was output against a dead number. Measuring the mechanism
instead of inferring it from the output is what found all three real defects
below, and it is the third time in this project that guessing from an aggregate
produced a confident wrong answer.

---

## 2. THE FIGURE HAD NO RHYTHM — ONE BAR-PATTERN IN 768 BARS

32 seeds, every bar the ostinato plays in, before:

```
  dungeonsynth / ds2     1 distinct bar-pattern over 768 bars   [0,4,8,12]     100%
  synthwave              1 distinct bar-pattern over 768 bars   all sixteen    100%
  fantasysynth           7 patterns, but [0,4,8,12] in 76%
```

`unit: 4` puts a note on every fourth sixteenth and the `cells` hold **pitches**,
so this part had no rhythm to repeat. **Four even notes is a pulse, not a
figure.**

### What a figure is, from the two canonical ones

> **MARS** — the ostinato is *"five even pulses followed by a **short rest**"*,
> and it *"never stops. It runs underneath almost the entire movement like an
> engine."* [corpus:professorcarol, corpus:calstate/Holst analysis] **The rest is
> the figure.**

> **CARMINA BURANA** — *"while the time signature is clearly 3, the accompanying
> figure in the orchestra is really in 2… the effect of a **hemiola** over every
> two bars."* [corpus:ryanbrandau, corpus:indianapolissymphony] **The figure does
> not line up with the bar.**

And the definition licenses both: an ostinato is *"any short, perpetually
repeating **rhythmic**, chordal, or melodic pattern"* [corpus:britannica].

### Both mechanisms were already in this builder and neither reached this genre

`null` in a cell is a rest — built for the banjo, on the owner's own words:

> *"The problem with the banjo is that the notes are played next to one another,
> no long notes and barely any gaps. **THE GAP IMPLIES THE RHYTHM AT TIMES.** But
> it's a chain of notes."*

and `run: true` lets the cell index cross the bar line. A cell whose length does
not divide the slots in a bar therefore puts its rest **somewhere new every
bar** and comes back round on its own cycle. That is Mars's rest and Carmina's
displacement out of two fields that already existed.

### ⚠ And the grid had to move with the rests, which the first version missed

At `unit: 4` the most a rest can do is silence one of four quarters, so it
**thinned the part** rather than shaping it. A/B'd on the printout and the
numbers, dungeon synth:

```
                            bar-patterns   notes/material   on a lead onset
  unit 4, no rests (before)       1             16.0             57%
  unit 4, rests                   5             13.3             40%
  unit 2, rests   <- shipped      7             20.8             30%
```

At an eighth-note grid the rest sits **inside** the figure instead of removing a
beat, so the part gets denser and more varied at once and stops shadowing the
tune. Printed, dungeon synth seed 1:

```
  bar 0 |*-..*-*-..*-*-..|      bar 2 |..*-*-..*-*-..*-|
  bar 1 |*-*-..*-*-..*-*-|      bar 3 |*-..*-*-..*-*-..|
```

An engine with a limp in it, moving.

---

## 3. THE COUNTER — 39% OF ITS NOTES FELL THROUGH TO NOTHING

Instrumented at the placement rather than inferred from the output, 32 seeds:

```
  of the notes an ANSWER-style counter writes
    61%  moved into the tune's silence          <- answerAt placed them
    39%  refused: the bar's largest silence is under two steps
```

**And a refused note fell through to nothing at all.** Not a step behind the
tune. Exactly on it:

```js
  if(ANSWER){
    const a = answerAt(n);
    if(a != null){ at = a; ... }     // and no else
  } else if(style !== "double" && ansDraw < (CT.answer || 0)){ ...step off... }
```

That second branch already describes the refused case in its own words —
*"PREFER the silence, but do not REQUIRE it… a dense tune leaves no silence to
answer into"* — so it is the branch that should handle it, and `if(ANSWER)`
swallowed it. **Chained instead of exclusive**, and `answer`, the tuned number
the table kept for exactly this and which no style could reach, is live again.

Both draws still run for every note whatever the outcome [Law 3/7]; only which
branch reads them changes. A `line`-style genre is unaffected — `a` is null
there by construction.

### What it did

```
  counter notes moved OFF the lead's onset, by style
                      before    after
  dungeonsynth  answer   45%      92%        double  0%   0%   (correct: a doubling
  fantasysynth  answer   48%      90%        double  0%   0%    IS the same rhythm)
```

**The `double` style's 0% is not a defect and synthwave's aggregate 100% is not
either.** A doubling is the theme carried an octave away by a second instrument;
sharing the rhythm is the whole point. The aggregate on dungeon synth is 68%
rather than 8% because a `double` material writes 8.5× more notes than an
`answer` one — `styles.double.density` is 0.85 against a base of 0.10 — so a
30/70 split of *materials* is a 70/30 split of *notes*. Stated because the
aggregate looks like a failure and is not one.

### Printed, fantasy synth seed 1, the counter lane

```
  bar 204  counter  |..*-**..*-*-*-**|
  bar 205  counter  |...*-*-.*-*-.*-.|
  bar 206  counter  |....*-..*-*-*-**|
```

Entering at steps 2, 3, 4, 5, 13, 15 — off the grid, different every bar.

---

## 4. THE GUARDS

```
  single-genre records compose   149/150   unchanged (lofi seed 17, BACKLOG §0ac)
  blends compose                 179/180   unchanged
```

---

## 5. WHAT THIS DOES NOT FIX

**The counter is still 6.9 notes a material on dungeon synth** — `density: 0.10`,
which the table's own comment calls *"barely a part at all"* and defends as an
ornament. In one whole record, seed 7, the counter lane has **seven events**.
The notes it does play now land in the tune's silence; whether there should be
more of them is a taste this file has already argued once and I have not
re-argued it. Named, not changed.

**lofi has no counter at all** — `counter: null`. Its second voice is the second
keyboard. Not a defect, recorded so the next measurement does not read the
absence as a fault.

**The bass is still a drone** in dungeon synth. Named before, still open.

---

## SOURCES

- [Ostinato — Britannica](https://www.britannica.com/art/ostinato) · [What Is An Ostinato? — Hello Music Theory](https://hellomusictheory.com/learn/ostinato/) · [Ostinato — Study.com](https://study.com/learn/lesson/ostinato-music-history-examples.html) — a repeating *rhythmic*, chordal or melodic pattern
- [Holst, Mars — Professor Carol](https://professorcarol.com/2020/08/28/holst-planets-mars/) · [An Analysis of Holst's The Planets — CalState](https://scholarworks.calstate.edu/downloads/41687m324) — five even pulses and a short rest; the ostinato never stops
- [Into the Score: Orff's Carmina Burana — Ryan Brandau](https://www.ryanbrandau.com/into-the-score-orffs-carmina-burana) · [Orff: Carmina Burana — Indianapolis Symphony](https://www.indianapolissymphony.org/backstage/program-notes/orff-carmina-burana/) — a figure in 2 under a bar of 3; hemiola
- Britannica, *Antiphonal singing* and *Responsory*; Catholic Encyclopedia, *Plain Chant* — already cited by `deriveCounter` for the call-and-response form
- `docs/genre-research/call-and-response.md` — the `answer` style's own sheet
- `docs/genre-research/the-melodic-rhythm.md` — the lead's rhythm, which had to be fixed first for any of this to have silence to speak into
