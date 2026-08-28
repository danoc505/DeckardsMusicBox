# The melodic peak — one highest note, one lowest

*Researched, built and measured 2026-08-28 for Phase 5 of
`docs/NEXT-BUILD-THE-PART-YOU-REMEMBER.md`. The only new engine code in that
plan.*

> **The owner:** *"The songs are always too safe and formulaic. They never go to
> an extreme."*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

---

## 1. THE RULE, AND IT COMES FROM THE GENRE'S OWN PRACTITIONERS

Not from theory first — from the dungeon synth composition guide:

> *"pick a low note and a high note **no more than about 12 notes apart**... the
> **high note should only be hit one time**. Same for the low note."*
> [corpus:dungeon-synth.neocities.org/music-making-guide]

The theory then says *why*:

> A well-crafted melody *"often has a single, clear climax — a high point of
> pitch, intensity, or emotional impact"*, and the contour *"builds towards this
> climax, reaches it, and then recedes"*. The arch *"begins at a lower pitch,
> rises to a peak, and then descends"*, and the apex belongs *"about 2/3 of the
> way into the melody"*. [corpus:musictheoryauthority, corpus:cjwmusichub,
> corpus:composecreate]

**A phrase that hammers its own ceiling has no climax to arrive at.** That is
the defect, stated as the sources state it.

---

## 2. THE MEASUREMENT — FOUR TUNES IN FIVE HAD NO SINGLE HIGH POINT

16 seeds a genre, materials A/B/C, the lead lane, **per material**:

```
  genre         tunes whose top note is struck ONCE   mean strikes   apex position
  lofi                     63%                            1.46           0.54
  synthwave                38%                            2.40           0.39
  dungeonsynth             22%                            2.26           0.25
  fantasysynth             22%                            3.07           0.22
  ds2                      22%                            2.26           0.25
```

**The span was never the problem.** 5.0 to 6.8 semitones against the source's
"no more than about 12" — the tunes are *narrow*, not wide. This is about how
often the ceiling is touched.

**And the apex sits at a quarter of the phrase**, against the source's two
thirds. That is a second, separate finding and **it is not what this build
fixes** — see §6.

---

## 3. ⚠ THE UNIT IS THE PHRASE, AND MEASURING THE MATERIAL WOULD HAVE LIED

`phrase()` writes exactly two bars. Since Phase 3, a hooky material **copies
bars 0–1 to 2–3 verbatim** — so its top note is struck twice *by construction*,
and a per-material measurement can never show a unique top on any genre where
the hook is working.

The first pass of this build measured per material, reported "22% → 22%, the
rule does nothing", and that reading was wrong: the rule governs the phrase and
the hook duplicates the phrase. **Re-measured per two-bar phrase**, which is the
unit that is actually written:

```
                        top struck once        bottom struck once
  genre          before   after    Δ      before   after    Δ
  lofi             78%     84%    +6        78%     84%    +6
  synthwave        67%     65%    -2        66%     65%    -1
  dungeonsynth     67%     83%   +16        65%     72%    +7
  fantasysynth     51%     53%    +2        43%     51%    +8
  ds2              67%     83%   +16        65%     72%    +7
```

**synthwave's 2-point dip is 1–2 phrases of 80 and is not read as a finding.**

---

## 4. HOW IT IS BUILT — A NARROWING, NOT A REPAIR

In `buildTheme`'s pitch chooser, immediately after the candidate is derived and
**before** the melody targets, the seat walk, the arrival law and the hang
resolution run — so every existing rule still validates the note that is
actually written, and this one never overrides them.

```
  if the candidate equals the phrase's RUNNING highest note (or its lowest),
  try four ways off it: a step further out, a step back in, then a third each
  way. Take the first that fits and is not the other extreme. If none fits,
  the original candidate stands.
```

**Only the running extreme is protected.** A candidate may still go *above* it —
that is the climax moving, and the old ceiling stops being a ceiling. The phrase
ends with exactly one of each rather than with a flat top it was forbidden to
leave.

**It cannot be unsatisfiable**, which is why it is a preference and not a filter:
*"a constraint that can be unsatisfiable must be a cost"*, and this file has made
that mistake three times.

**No draw is spent.** `rng()` is not called, so no later draw moves [Law 3].

### The first version tried one way out and it was not enough

MEASURED with a single step: the candidate sat on the running extreme **68 to
184 times per sixteen seeds** and the step off it succeeded **only about 43%** of
those, so most duplicates were written anyway. Instrumented, the nudge was
almost **never undone downstream** (0–2 times per genre) — the failures were the
whole result, not interference from other rules. Four ways out, in the same
shape `NOREPEAT` already uses one screen below ("a step each way first, then a
third"), is what closed it.

### The ordering was A/B'd rather than argued

```
                      outward-first          inward-first
                      (shipped)
  lofi                84 / 84                83 / 88
  synthwave           65 / 65                70 / 56
  dungeonsynth        83 / 72                72 / 79
  fantasysynth        53 / 51                54 / 44
```

**Outward-first ships**: it is better on the genres being worked on and better on
the *top* note, which is the one the source names first. Inward-first is better
on lofi's bottom. Both were run; neither is a landslide.

---

## 5. WHAT IT COST, AND ONE THING IT GAVE BACK

```
                  tune notes per material        span in semitones
                   before   after                 before   after
  lofi              6.83     6.58  (-3.7%)         6.4      7.3
  synthwave        11.71    11.50  (-1.8%)         6.8      6.9
  dungeonsynth      7.35     7.27  (-1.1%)         4.8      5.2
  fantasysynth     11.38    11.38  ( 0.0%)         4.9      5.6
  ds2               7.35     7.27  (-1.1%)         4.8      5.2
```

**The tunes got WIDER** — dungeon synth 4.8 → 5.2, fantasy synth 4.9 → 5.6, lofi
6.4 → 7.3 — because the outward-first ordering pushes the climax up rather than
folding it back. That was not the aim and it is the closest thing in this build
to "going to an extreme".

The note loss is the `continue` path: when no way out fits and the candidate is
also refused by another rule, the onset is skipped. Under 4% everywhere, zero on
fantasy synth.

---

## 6. WHAT THIS DOES NOT FIX, STATED PLAINLY

**The residue is tunes too thin to shape.** ds2 seed 1's material A is *three
notes spanning two semitones* — D#5, E5, E5 — and the peak rule cannot give a
single high point to a phrase that has two pitches in it. It is in the 17% that
still fails, and no contour rule reaches it. **Dungeon synth's tune is under one
note a bar and spans five semitones; that is the open item this build sits on
top of, and it is not claimed to be closed.**

**The apex is still in the wrong place.** Measured at 0.22–0.25 of the phrase
against the sources' two thirds. Placing it would mean shaping the whole contour
rather than narrowing one choice, and it is a different mechanism — a target for
where the climax falls, not a rule about how often it is touched. Named, not
built.

---

## SOURCES

- [Dungeon Synth Music Making Guide](https://dungeon-synth.neocities.org/music-making-guide) — "the high note should only be hit one time. Same for the low note"
- [Melodic Contour and Phrase Structure — Music Theory Authority](https://musictheoryauthority.com/melodic-contour-phrase-structure) — the single clear climax; build, reach, recede
- [The Secret Language of Melody — CJW Music Hub](https://www.cjwmusichub.com/blog/the-secret-language-of-melody-understanding-melodic-contours) · [A Good Melody: Contour — Compose Create](https://composecreate.com/a-good-melody-contour/) — the arch, and the apex about two thirds in
- [Melodic Contour — Fiveable](https://fiveable.me/ap-music-theory/key-terms/melodic-contour) · [Melody shape — About Music Theory](https://www.aboutmusictheory.com/melody-shape.html)
- `docs/genre-research/melodic-math.md` — this project's prior contour work, on the motif rather than the extreme
