# The rule of three, and what a change on the third time should actually BE

*Researched 2026-08-04, prompted by the user: "the program should have as its
base the three bar rule… a song should be working towards something and these
alterations should be in benefit towards it. Taking notes out can ruin the
motif and adding new notes can be problematic also if the motif is already
there."*

**That is not thinking out loud, it is the central distinction in the
literature, and it has a name.** §2 is that name. The rest of this sheet is the
catalogue of moves that satisfy it and the measurement of what this program
does instead.

Companions: `lofi-production.md` (where the repetition was measured),
`BACKLOG.md` §6a (the numbers).

---

## 1. THE RULE ITSELF — why the third time and not the second

> "When you present a musical idea once, it intrigues the listener. The second
> repetition reinforces this idea, making it memorable. However, **by the third
> repetition, the brain tends to tune out** the information."
> [corpus:makebestmusic, The Rule of Three in Music Composition]

> "Whenever a musical pattern, idea or motif is going to be **repeated for a
> third time, it's best to change it in some way**, or present a new idea…
> you'll surprise the listener (who would be expecting a repetition of the same
> pattern)." [corpus:omnionsound]

So the count is: **state it, confirm it, then change it.** Two identical
passes are not a fault — they are what makes the third one land. The fault is
the third pass arriving unchanged.

**And one concrete shape for the change, which matters more than it looks:**

> "begin with a familiar musical idea, then **diverge from it halfway through
> the third play**" — so the listener still recognises what they are hearing
> before it turns. [corpus:makebestmusic]

---

## 2. THE USER'S POINT, WHICH IS SCHOENBERG'S — ornamental vs developing

The user said the alterations should be "in benefit towards" where the song is
going. That is exactly the distinction Schoenberg drew, and the words are
almost the same:

> **Ornamental variation**: "the variations usually seem to have nothing more
> than an **ornamental purpose**; they appear in order to create variety and
> often **disappear without a trace**."

> **Developing variation**: "the changes proceed more or less **directly toward
> the goal** of allowing new ideas to arise"; the motive is "**transformed
> incrementally, away from or toward the original**"; and the successions
> "**build cumulatively to structure the entire piece rather than occurring
> arbitrarily**."
> [corpus:en.wikipedia/Developing_variation; corpus:mtosmt Salley, *MTO* 21.4;
> corpus:mtosmt Boss, *MTO* 21.3; corpus:bostonchambermusic]

And the requirement the user put second — don't wreck the motif:

> the motive must be "**retained, yet transformed**" — developed "through
> rhythmic articulation, suspension, inversion and intervallic combinations".
> [corpus:mtosmt Boss]

**Retained, yet transformed.** Removing notes does not retain it. Adding notes
over a motif that is already stated does not transform it. Both are the failure
the user named, from the other two directions.

---

## 3. THE CATALOGUE — every named way to change a motif without destroying it

The classical set, consistent across sources
[corpus:fiveable Motivic Development Techniques; corpus:vaia Motive
Development; corpus:tobyrush theorypages; corpus:study.com Motivic
Transformation]:

| move | what it does | note count |
|---|---|---|
| **sequence** | the same shape, started on a different pitch | unchanged |
| **augmentation** | the same notes, each one longer | unchanged |
| **diminution** | the same notes, each one shorter | unchanged |
| **inversion** | every rise becomes a fall and vice versa | unchanged |
| **retrograde** | the shape played backwards | unchanged |
| **fragmentation** | one piece of the motif used on its own | fewer, but the piece is whole |
| **interval expansion / contraction** | the same contour, the leaps made wider or narrower | unchanged |

**Read the right-hand column.** Six of the seven change NO notes at all — they
change *when*, *where* or *which direction*. That is the answer to "taking
notes out can ruin the motif": the tradition almost never takes notes out. It
re-presents the same material.

### And the loop-music set, which is what this program actually writes

[corpus:izotope How to Keep Repetition in Music Interesting;
corpus:beatkitchen From Loop to Track; corpus:soundonsound Unlooping The Loop;
corpus:sweetwater 5 Tips for Better Loop-based Music]

- **Re-orchestrate.** "Rearrange loops so they repeat on **different
  instruments** while keeping the original melody and rhythm **intact**." The
  notes do not move at all; who plays them does.
- **Change ONE note, at the END.** "In a repeating bass line, **change the last
  note of the pattern every second or fourth time through to signal that the
  track is moving forward**." Minimal, preserves the motif entirely, and it is
  explicitly framed as a signal of *direction* — developing, not ornamental.
- **The slow cumulative sweep.** "Open a low-pass filter by a few percent each
  time the loop repeats — over 32 bars the sound brightens gradually, **a
  change too slow for listeners to notice on any single pass, but the section
  feels different at bar 32 than at bar 1**." This is developing variation
  stated in engineer's language: nobody can point at the change, and the
  destination is audible.
- **The one-bar hole.** "Remove one element for one bar every 8 bars — drop the
  hi-hat for bar 7 and bring it back on bar 8 to create a **micro-break that
  resets listener attention**." Note the shape: one bar, one element, and it
  comes back. That is not stripping the motif, it is punctuation.
- **Fills at the seam.** A fill "at the end of every 8 or 16-bar phrase to mark
  transitions without disrupting the flow."

---

## 4. WHAT THIS PROGRAM DOES INSTEAD — measured

From `BACKLOG.md` §6a, measured on build `2026-08-03s`, 20 seeds a genre. How
much of the first statement each later statement repeats, note for note:

```
  lofi         2nd chorus 97%   3rd chorus 95%   3rd verse 92%
  synthwave    3rd chorus 98%   4th chorus 99%
  dkc          3rd chorus 96%
  bladerunner  3rd chorus 99%
  acid         every statement 100% — identical, always
  plastikman   3rd verse 79% — the only genre that meaningfully varies
```

**Three faults, and each maps onto something in §1–§3:**

1. **It counts the wrong thing.** The change is demanded on the third statement
   of a *section function* (`seen[f] >= 3`, verse and chorus only). A lofi song
   has six sections, so a verse usually appears twice and the rule **never
   fires at all**. But the listener is counting passes of the four-bar loop: an
   8-bar chorus is two passes, and two choruses back to back is four. By §1's
   count the change is overdue by the second chorus and never comes.

2. **When it does fire on a chorus, it TAKES NOTES OUT** (`stripHalf`). That is
   the one move the catalogue in §3 never makes and the one the user named as
   destructive. Measured result: the third chorus still plays 95% of the first
   chorus's notes — so it neither preserves the motif cleanly nor changes it
   audibly. The worst of both.

3. **Nothing is cumulative.** Every variation here is ornamental in
   Schoenberg's exact sense: it appears, and it disappears without a trace. No
   change is a step along a path, and nothing about the third statement is
   *further along* than the second.

**What the program already has and barely uses:** `Avar` — "same first half,
redrawn second half". That is §1's "diverge halfway through the third play",
already built, already correct in shape. It is applied to the third *verse*
only, which for most lofi songs means never.

---

## 5. WHAT TO BUILD, in the order the evidence supports

1. **Count loop passes, not section names.** The demand should be raised on the
   third pass of the same material, which is what a listener counts (§1).
2. **Answer it by re-presenting, never by deleting.** `Avar`'s
   diverge-at-the-halfway-point is the model and already exists; the chorus has
   no equivalent and should get one. Re-orchestration (§3) is the cheapest
   move of all, because it moves no notes.
3. **Make at least one thread cumulative** so the third pass is further along
   than the second rather than merely different (§2). The slow filter sweep in
   §3 is the sourced form of this and needs no new note-level mechanism.
4. **Keep the one-bar hole as punctuation, not as the main answer** — one
   element, one bar, and it returns (§3).

---

## 6. WHAT THE SOURCES DO NOT SETTLE

- **How big the change should be.** [corpus:makebestmusic] declines to say
  ("only that they should create a sense of surprise"). No source gives a
  percentage. So any amount this program picks is `[EAR]`.
- **Whether the rule of three applies to a genre built on hypnotic
  repetition.** Every source above is about songs. Acid and minimal techno
  deliberately repeat — this repo's own `plastikman-minimal.md` quotes the
  method as micro-variation, and acid measuring 100% identical may be correct
  for it. **Do not apply the rule uniformly to all seven genres without
  deciding that per genre, in writing.**
- **No source found addresses generative or algorithmic music at all.** Every
  technique here is written for a human arranging by hand.

---

## Sources

- [The Rule of Three in Music Composition — Make Best Music](https://makebestmusic.com/blog/the-rule-of-three-in-music-composition-a-gamechanger-for-producers)
- [The Rule Of Three In Music Composition — OmnionSound](https://www.omnionsound.com/the-rule-of-three-in-music-composition/)
- [Developing variation — Wikipedia](https://en.wikipedia.org/wiki/Developing_variation)
- [On Duration and Developing Variation — Salley, *Music Theory Online* 21.4](https://mtosmt.org/issues/mto.15.21.4/mto.15.21.4.salley.html)
- [Motivic Processes in Schoenberg's op. 11 no. 3 — Boss, *MTO* 21.3](https://mtosmt.org/issues/mto.15.21.3/mto.15.21.3.boss.html)
- [Brahms and Developing Variation — Boston Chamber Music Society](https://bostonchambermusic.org/brahms-and-developing-variation/)
- [Motivic Development Techniques — Fiveable](https://fiveable.me/music-theory-and-composition/unit-7/motivic-development-techniques/study-guide/JWOcNBgrI0AhrBYJ)
- [Motive Development — Vaia](https://www.vaia.com/en-us/explanations/music/music-theory/motive-development/)
- [Motivic Development (PDF) — Toby Rush](https://tobyrush.com/theorypages/pdf/en-us/motivic-development.pdf)
- [Motivic Transformation — Study.com](https://study.com/academy/lesson/motivic-transformation-definition-methods-examples.html)
- [How to Keep Repetition in Music Interesting — iZotope](https://www.izotope.com/en/learn/how-to-keep-repetition-in-music-interesting.html)
- [From Loop to Track — Beat Kitchen](https://beatkitchen.io/guides/electronic-music/10-from-loop-to-track/)
- [Unlooping The Loop — Sound On Sound](https://www.soundonsound.com/techniques/unlooping-loop)
- [5 Tips for Better Loop-based Music — Sweetwater](https://www.sweetwater.com/insync/5-tips-better-loop-based-music/)
