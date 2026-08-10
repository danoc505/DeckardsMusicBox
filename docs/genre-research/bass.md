# How a bass line is actually written — and what ours does instead

*Researched 2026-08-04 at the user's suggestion, after the parallel-fifths work
dead-ended: "do you need research on writing bass lines for lofi hip hop and
the other genres?" Yes, and it is the thing that was blocking. Lofi first,
because it is the genre being judged and the one with the richest sources.*

**The short version.** Our bass picks roughly the right NOTES and barely MOVES.
It plays the root or the fifth, which the sources say is authentic — and then
it sits on one pitch for most of the bar, and when it does move it leaps.
Bass lines in tonal music step.

---

## 0. HOW GOOD IS THIS GROUNDING? Weaker than the chord sheet, and here is why

`chord-quality.md` could stand on 1170 measured tunes. **There is no equivalent
for the bass in this repo, and I could not get one.**

- `corpus/harvest_bass.py` exists and measures 17,256 real arrangements — but
  it **prints** its numbers and never stored them. `IMPROV_HARVEST` appears in
  MK1 only as three READS; nothing ever defines it. So the harvest was run,
  read by a human, and the numbers went into comments by hand. **None of it is
  recoverable from this repo.**
- Fetching the Lakh set to re-run it is 17,000 MIDI files and was not attempted
  here.

So this sheet rests on: **production tutorials** (the weak tier — they copy
each other), **walking-bass construction rules** (well-established and
consistent across independent sources), and **one measured corpus, Bach**,
which is a real measurement of a real bass line and is *not* a lofi bass. Every
claim below is labelled with which of those it came from.

---

## 1. WHAT LOFI'S BASS IS SUPPOSED TO BE — production sources

> "Start with the **root notes** of your chord progression to establish the
> foundation… Many vintage lofi tracks keep the bassline simple, often
> **sticking to the root and fifth** of each chord."
> [corpus:transmissionsamples; corpus:mysticalankar]

> "Playing **passing tones — the notes between chord tones** — helps create
> smoother transitions between chords." [corpus:lofiweekly]

> "**Syncopation** is key in genres like jazz and hip-hop and it works well in
> lofi to create groove. Add **offbeat accents or octave jumps** to liven up
> your basslines." [corpus:mysticalankar]

> Arpeggios: "play chord tones one by one… Cmin7 = C, Eb, G, Bb."
> [corpus:mysticalankar]

**Read those together and they do not say "play the root".** They say start
from the root, keep it simple, and then move between the chord tones with
passing notes. The word that recurs is *between*.

---

## 2. THE WALKING RULES — the most precise thing found, and three sources agree

This is the part with real structure. It is written for jazz, which is what
lofi's harmony descends from.

| where in the bar | what goes there |
|---|---|
| **beat 1** | **the root**, always — "marks the chord changes in the strongest way possible" |
| **beat 3** | **a chord tone** — the third, fifth or seventh — "to make a bass line that really sounds like the chords" |
| **the last beat** | **an approach note**: a chromatic step above or below the NEXT chord's root |
| **beats 2 and 4** | passing tones and scale notes — "less strong than chord tones, but great for variety" |

[corpus:learnjazzstandards; corpus:jazzguitar.be; corpus:yamaha hub;
corpus:thejazzpianosite] **`[three sources]`**

And the order of preference when choosing: **root, fifth, third, seventh**
[corpus:lofiweekly].

**Why this matters here specifically.** Look at what that structure does to the
relationship with the chords: the bass states the root on the downbeat — so the
harmony is as clear as ever — and then *leaves it* for three beats. It cannot
move in lockstep with a chord it is only touching once a bar. **The parallel
fifths in `counterpoint-measured.md` are made by a bass that never leaves the
root; this is the shape that breaks them, and it costs nothing harmonically.**

---

## 3. THE ONE MEASURED BASS LINE AVAILABLE — Bach, 382 chorales

Not a lofi bass. It is a real bass line in tonal music, measured, and it
answers the one question the tutorials do not put a number on: *how far does a
bass move at a time?*

```
  33,192 moments
     stays put                 25.9%
     when it moves:  by step   64.6%      by leap   35.4%

  the moves themselves:
     2 semitones  38%     1 semitone  26%     5 semitones  12%
     7 semitones   9%    12 semitones  5%     3 semitones   4%
```

**Two thirds of a bass's moves are one or two semitones.** The fifth (7) is 9%
and the octave 5%. A bass line is mostly a step-wise line that touches the
roots, not a sequence of jumps between them.

---

## 4. WHAT OURS DOES — measured, 30 seeds a genre

```
  genre         notes    the root   the fifth   anything else   repeats its own note
  lofi            744      74.7%       16.9%            5.6%             30.9%
  synthwave      2767      90.7%        9.3%            0.0%             42.3%
  dkc             664     100.0%        0.0%            0.0%              0.0%
  bladerunner     290     100.0%        0.0%            0.0%              0.0%
  acid           3988      61.7%        7.3%           24.7%             44.9%
  plastikman     1608      79.1%        1.0%           19.9%             62.8%
  jungle          128     100.0%        0.0%            0.0%              0.0%

  when it moves:   by step   by leap
  lofi              28.8%     71.2%
  synthwave          3.6%     96.4%
  dkc                1.4%     98.6%
  bladerunner        8.0%     92.0%
  acid              15.3%     84.7%
  plastikman        49.3%     50.7%
  jungle            39.5%     60.5%

  distinct notes in a bar
  lofi          one 61%   two 33%   three 7%
  dkc           one 100%
  bladerunner   one 100%
  jungle        one 100%
```

### 4a. The note CHOICE is defensible. The MOTION is not.

**lofi is 74.7% root and 16.9% fifth — which is exactly "sticking to the root
and fifth" (§1), and that is a real, sourced lofi habit.** This sheet does not
say our bass plays wrong notes.

What it says is:

- **61% of lofi bars contain ONE pitch.** The bass states the root and stops.
  §2's structure has four events in a bar and three of them are not the root.
- **71.2% of its moves are leaps**, against Bach's 35.4%. Ours is inverted:
  where a real bass line steps two times in three, ours jumps two times in
  three. That follows directly from the note choice — root to fifth *is* a
  leap, and if those are the only two notes available then every move is one.
- **Only 2.7% of lofi bass notes are the third**, and passing tones and
  approach notes together are 5.6%. §2 gives the third, the seventh and the
  chromatic approach real jobs, and here they barely exist.

### 4b. Three genres never leave the root at all

dkc and bladerunner are **declared and defended**: a held octave-doubled pedal
[corpus:vgmusic transcriptions] and a Prophet-10 drone [corpus:nemostudios].
Those are correct and should not be touched.

**jungle is not defended.** 100% root, one note a bar, and no research sheet
for its harmony at all — only its form has one. It sits in `BACKLOG.md` §6.8
and it needs its own sheet before anybody changes it.

---

## 5. WHAT THE SOURCES DO NOT SETTLE

- **How much of a lofi bass should walk.** The sources describe both "keep it
  simple, root and fifth" and "jazzy basslines with passing tones" as the
  genre. They are not in conflict — both exist on real records — but nothing
  says the proportion. Any number this program picks is `[CHOSEN]`.
- **No measured lofi bass corpus** (§0). The walking rules are jazz's, and the
  step/leap number is Bach's.
- **Nothing on the bass for five of our seven genres.** This sheet is lofi's,
  with dkc and bladerunner confirmed as already-sourced exceptions. synthwave's
  pulse has tutorial sources in the table already; acid, plastikman and jungle
  have none.
- **Nothing on when a bass should REST.** Every source describes what to play,
  none describes silence, and 30.9% of our lofi bass "moments" are a repeat of
  the same pitch rather than a rest or a move.

---

## 6. WHAT TO BUILD, in the order the evidence supports

1. **Let the bass move inside the bar** — the root on the downbeat and
   something else after it. That is §2's structure and it is the whole of the
   fix; it needs no new note vocabulary, only permission to use the chord tones
   already sitting in `ch.tones`.
2. **The approach note into the next chord** — a step above or below the next
   root, on the last beat. The most characteristic single move in §2 and the
   one that most breaks lockstep with the chords.
3. **Prefer a step over a leap when both are available**, toward Bach's 2-in-3
   rather than our 1-in-3.
4. **Then re-measure the parallel fifths** (`counterpoint-measured.md` §4).
   This sheet's claim is that they fall out of a bass that never leaves the
   root; if they do not move once it does, that claim was wrong and should be
   written down as wrong.

Nothing here touches a genre other than lofi. dkc and bladerunner are declared
exceptions with sources. jungle, acid and plastikman need their own research
first.

---

## 7. WHAT WAS BUILT, AND WHAT IT MEASURES — `2026-08-04e`

Item 1 and item 3 are done. Item 2, the chromatic approach note, is **not** —
see §8.

**The mechanism.** The bass's choices off the downbeat were `root`, `fifth` or
`rest` and nothing else — that list *was* the whole vocabulary, which is why
root and fifth were not a habit but a ceiling. It is now a genre table,
`bassTones`, and it can also name the **third**, the **seventh**, and a
**passing step**: one scale step from wherever the bass just was, toward the
next chord's root. The direction is derived rather than drawn, so a genre that
declares nothing takes no extra draw and keeps its bass note for note.

**The tones come from the CHORD, not the scale**, so a chord that was given a
quality at `2026-08-04d` is spelled correctly by the bass too — and whatever is
in the chord is legal under it by construction, which is the same reasoning the
old code used when it took the diatonic fifth instead of a blind +7 semitones.

**Measured, 30 seeds a genre, before and after:**

```
                    the root   the third   the fifth   else    repeats itself
  lofi   before       74.7%       2.7%       16.9%     5.6%        30.9%
  lofi   after        57.0%      10.3%       18.3%    14.3%        14.2%

                    moves by step      bars holding ONE pitch
  lofi   before          28.8%                61%
  lofi   after           38.6%                42%
  Bach (§3)              64.6%                 —
```

Every other genre identical on every column.

**AND THE CLAIM IN §6.4 HELD, which is the point of having made it.** This
sheet predicted that the parallel fifths in `counterpoint-measured.md` are made
by a bass that never leaves the root. Giving it somewhere else to be:

```
  lofi keys/bass parallels    8.97%  ->  5.56%     (39 of 435  ->  32 of 576)
  lofi lead/bass parallels    2.04%  ->  1.30%
```

**A 38% cut, from the bass side, after the chord side produced nothing** — a
cost on the chords' top line against the bass, with its weight raised four
times over, moved lofi 8.97% → 8.28% and bladerunner not at all
(`counterpoint-measured.md` §5b). The lockstep was the bass's to break.

**Read off the notes**, seed 1, the bass row of material A:

```
  before   1-------..1-.... 4-------..1-..7- 1-------..1-..6- 5-------..5-..7-
  after    1-------..5-.... 4-------..?-..7- 1-------..5-..6- 5-------..2-..7-
```

It restated the root in three of four bars and now moves in all four. The `?`
in bar 2 is a note outside the key — A♯ under an F♯7, which is that chord's
third. **That is the chord-quality work and this work composing**: the bass is
spelling a borrowed dominant that did not exist in this program a day ago.

**No law moved against us.** Notes outside the key 2.1% → 2.5% (the bass
spelling those chords, which is the intent), dissonances that leap away instead
of resolving 10.5% → 10.6%, a chord sounding below the bass 0.0% → 0.0%.

---

## 8. WHAT IS STILL NOT BUILT, AND ONE OF THEM IS BLOCKED

- **The chromatic approach note is BLOCKED BY A SEAM CHECK**, and it is worth
  knowing why before anybody tries. §2's most characteristic move is a
  half-step above or below the NEXT chord's root, played on the last beat of
  the current bar. That note belongs to the next chord and not to the one
  sounding — and the seam check requires a note outside the key to be in *the
  chord under it*, so it throws. The existing walk into the next chord takes a
  SCALE step for exactly this reason. Making the chromatic version legal means
  widening that law to know about the chord that is arriving, which is a real
  decision about the law and not a tweak.
- **Step motion is 38.6% against Bach's 64.6%.** Better, not solved. lofi's
  bass has only two or three events in a bar (the pocket is shared with the
  drums and the chords), so there is a ceiling here that is not in this
  function.
- **Five genres still have no bass research at all** — jungle, acid and
  plastikman entirely; synthwave has tutorial sources only. dkc and bladerunner
  are done and correct.

---

## Sources

- [How to Make Lofi Bass — Transmission Samples](https://www.transmissionsamples.com/how-to-make-lofi-bass)
- [Crafting Jazzy Basslines For Lofi Hip Hop — LoFi Weekly](https://lofiweekly.com/2021/12/08/crafting-jazzy-basslines-for-lofi-hip-hop/)
- [Crafting Lofi Basslines: A Beginner's Guide — Mystic Alankar](https://mysticalankar.com/blogs/blog/crafting-lofi-basslines-a-beginner-s-guide)
- [Lofi Bass Production: Creating Warm and Smooth Low End — Mystic Alankar](https://mysticalankar.com/blogs/blog/lofi-bass-production-creating-warm-and-smooth-low-end)
- [Play a Walking Bass Line Like a Pro in 4 Easy Steps — Learn Jazz Standards](https://www.learnjazzstandards.com/blog/learning-jazz/bass/write-walking-bass-line/)
- [Walking Bass Lines for Jazz Guitar — Jazz Guitar Online](https://www.jazzguitar.be/blog/walking-bass-lines/)
- [How to Construct Walking Basslines — Yamaha Hub](https://hub.yamaha.com/guitars/bass/how-to-construct-walking-basslines)
- [Walking Bass-lines — The Jazz Piano Site](https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-voicings/walking-bass-lines/)
- [JSB-Chorales-dataset — czhuang](https://github.com/czhuang/JSB-Chorales-dataset) (§3, measured here)
