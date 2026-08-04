# How a bass line is actually written — and what ours does instead

*Researched 2026-08-04 at the user's suggestion, after the parallel-fifths work
dead-ended: "do you need research on writing bass lines for lofi hip hop and
the other genres?" Yes, and it is the thing that was blocking. Lofi first,
because it is the genre being listened to and the one with the richest sources.*

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
  says the proportion. Any number this program picks is `[EAR]`.
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
