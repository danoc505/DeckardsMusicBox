# The arrangement as a story

A song is a story. The parts are the characters. The story is what happens to
them — who is there, who leaves, who comes back, who ends up on top.

That is not a metaphor, and this document is the four sources that say so, the
measurement of how badly this program does it, and the rules that follow.

---

## 1. A part is a character, because the ear makes it one

The listener does not hear a texture. They hear separate things and follow
them: auditory streams, "which represent distinct environmental events and
serve as **psychological entities** that bear the properties of these events"
(Bregman 1990).

So a part is the unit a listener tracks. That is what makes it something a
story can happen to.

## 2. The story is a change of rank

> "all narratives… involve the transvaluation of changing hierarchical
> relationships and oppositions into culturally meaningful differences"
> — Almén 2008, 41

Almén's point is that a musical narrative is not a story music tells *about*
something. It is the listener tracking which part matters most, and that
changing. Narrative is medium-independent — it does not need a lyric.

**This gives a hard test.** If the same part is on top from bar one to the
last bar, the record does not have a weak story. It has none.

## 3. The shape is the dramatic arc

Exposition, rising action, climax, falling action, dénouement — "commonly used
in theater, film, and other narrative or dramatic media". The climax is often
"a sudden increase in textural density". The dénouement is "a restatement of
established musical materials" (Ableton, "Dramatic Arc").

This program already has the climax: the form declares a peak and the peak is
the one section with everybody. It has no dénouement — nothing knows that an
ending should give back what the record opened with.

## 4. Absence is for the return

> "lose instruments in stages and then build them up again to a big finish"
> — Johnson & Poyser, *Sound On Sound*, 2000

> the middle 8 is where "main elements of the track drop out… to give the
> listener a break before the chorus comes back in again"
> — *MusicRadar*, 2022

Both describe a part leaving **so that it can return**. A part that leaves and
never comes back is not a device. It is a part that stopped.

---

## 5. What this program does now

Twenty seeds a genre, full length, read out of each record's own MIDI:

| | lofi | dungeon synth |
|---|---|---|
| the opener's share of the record | **91%** | 80% |
| its longest single absence | **3 bars** | 10 bars |
| it is playing in the last bar | 75% | **55%** |
| the top part changes, first half to second | **20%** | **30%** |

Two opposite failures, one missing idea:

- **lofi's opener never leaves.** Nine bars in ten, never gone more than
  three. It is not a character, it is furniture. Nothing happens to it.
- **dungeon synth's opener often does not come back.** Nearly half its records
  end without the thing they opened with.
- **In seven or eight records out of ten, nothing changes rank.** By §2, most
  records here have no story at all.

## 6. Why — and it is one line of code

Who plays in a section is chosen like this:

```js
for (const r of A.shed) { if (heard.size <= playing) break; heard.delete(r); }
```

A walk down a list the genre wrote in advance. Same list, every seed, every
section. It has no memory, so nothing that happens in a record can affect it —
and a rank that cannot change as a consequence is not a narrative (§2).

Twenty lines away, the *span* decision already does this properly: a derived
score, "three terms, multiplied, no coefficients… nothing to tune". The
program has the right idea and applies it only to the smaller decision.

## 7. What goes into the program

| | rule | source |
|---|---|---|
| 1 | Who plays in a section is **derived from what the record has done**, not read off a fixed list | Almén 2008 |
| 2 | A part the record introduced has **standing**, which is what makes it expensive to drop — no special case for the opener, it simply has the most standing when a record is young | falls out of rule 1 |
| 3 | An absence has a **ceiling**: past it, a part is not absent, it is gone | Johnson & Poyser; MusicRadar |
| 4 | The ending restates what the record opened with | Ableton, dénouement |
| 5 | The genre's `shed` order stays, as a **weight** and never as an order | this program's own span score |

No rule names a part, a genre, or a number.

## 8. What it came to, measured

Rules 1, 2 and 4 are built. Same two sweeps, before and after:

| | lofi | dungeon synth |
|---|---|---|
| a part spent — gone for good before the last quarter | 15% → **5%** | 25% → **5%** |
| the opener is playing in the last bar | 75% → **75%** | 55% → **70%** |
| the opener's longest absence | 3 → **8 bars** | 10 → 8 bars |
| the top part changes, first half to second | 20% → **15%** | 30% → **45%** |
| distinct combinations of parts | 8.3 → **9.4** | 7.5 → 7.7 |
| the opener's share of the record | 91% → **83%** | 80% → 85% |

**The one that carries this is the first row.** Parts stopped being abandoned:
a record that drops a part now brings it back, in both genres, five times out
of a hundred instead of fifteen and twenty-five. That is the ceiling in rule 3
working without a number, out of the arithmetic alone.

**Rule 4 had to be built separately, and had to reach the last SPAN.** With
rules 1 and 2 alone the ending got worse, not better — 75% → 50% in lofi —
because absence became possible and nothing brought the opener home. Holding
it into the closing SECTION only got that to 55%: the span score was still
free to take it out four bars from the end. Holding it to the close itself is
what recovered 75% and lifted dungeon synth to 70%.

**And one number went the wrong way.** lofi's top part changes between halves
fell, 20% → 15%, where dungeon synth's rose 30% → 45%. lofi is beat music: its
drums sit at the bottom of its own shed order and play nearly every bar, so
the most-present part is close to fixed no matter what this rule does. Either
the metric is asking lofi the wrong question, or rule 1 needs a term that
knows about rank rather than presence. It is recorded here as not solved.

**Still `[chosen]` and still unmeasured:** rule 3 has no explicit ceiling —
the `1/(1+out)` term is a soft one, and whether a hard number does anything
the soft one does not has not been tested.

## Sources

- Albert S. Bregman, *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press, 1990. https://webpages.mcgill.ca/staff/Group2/abregm1/web/downloadstoc.htm
- Byron Almén, *A Theory of Musical Narrative*. Indiana University Press, 2008 — page 41 as quoted in Matthew BaileyShea's review, *Music Theory Online* 19.3 (2013). https://mtosmt.org/issues/mto.13.19.3/mto.13.19.3.baileyshea.html
- *Making Music: Creative Strategies for Electronic Music Producers* (Ableton), "Dramatic Arc". https://makingmusic.ableton.com/dramatic-arc
- Derek Johnson & Debbie Poyser, "Arranging Pop", *Sound On Sound*, April 2000. https://www.soundonsound.com/techniques/arranging-pop
- "Anatomy of an arrangement: your guide to song sections", *MusicRadar*, 16 March 2022. https://www.musicradar.com/how-to/song-sections-explained-intro-verse-chorus-middle8-outro-tag-bridge
