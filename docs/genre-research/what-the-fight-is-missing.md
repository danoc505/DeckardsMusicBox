# What the fight act is missing — Botch, The Mars Volta, and our own printout

*2026-08-22. Sources: three Botch tabs (C. Thomas Howell as the Soul Man, guitar
and bass; Transitions from Persona to Object), one Mars Volta tab (Eriatarka),
and a 15-track MIDI of Televators. Compared against doomsludge seed 1, "the
fight", bars 204–356 (153 bars, 300 s, 9 sections), build 2026-08-22d.*

Every number below is measured, not argued. The tools are in
`harness/` and the scratch parsers used here are reproducible from this file's
method section.

---

## 1. WHAT THE SOURCES ACTUALLY DO

### Botch — the riff is a COUNT, not a length

The bass tab for *C. Thomas Howell* is the whole argument in four characters:

```
Main Riff
D-2222- x32
```

**One note. Thirty-two times.** Then the verse, then `Main Riff x16`. The tabs
never say "8 bars"; they say **x32, x16, x8, x4**. The unit of form is *a cell
and a count*, and the count is large.

The guitar tab of the same song has `--12p0-x32-`, `17p0-x4-19p0-x4-15p0-x8`.
Same discipline: a one-beat gesture, repeated a stated number of times, then a
different gesture repeated a different number of times.

### The cells are ASYMMETRIC and the rhythm outlives the pitch

*Transitions from Persona to Object*, three consecutive blocks:

```
d|-8-8-8-8-8-8-8-8-7-7-7-7-7-0-0-0-|     8 + 5 + 3
d|-3-3-3-3-3-3-3-3-6-6-6-6-6-0-0-0-|     8 + 5 + 3, different pitches
d|-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-|     16, flat, open string only
```

Sixteen steps grouped **8+5+3** — not 8+8, not 4+4+4+4. Then the *same rhythm*
with different pitches. Then the riff stripped to nothing but the open string.
That is a three-stage transformation where **the rhythm is the constant and the
pitch is the variable**, ending in erasure.

The verse is `8+8+8+5+3` over 32 steps. And the tab says outright:

> "The next chord completes the riff for a count of 8 for the 1st 2 times... then
> for the 2nd 2 times it's this:"

**State it, repeat it, change it on the third pass.** The rule of three, written
by a fan with a text editor in 2005.

### The open string is a pedal, and the riff snaps back to it

`13p0`, `1p0`, `3/9p0`, `12p0`, `-12----0-12-0-13----0---13-0-`. A fretted note
**pulls off to an open string** over and over. The open D is a drone the riff
keeps collapsing onto — it is a pedal point and a rhythmic separator at once,
and it is present in every Botch example here.

### Bass and guitar play the SAME THING

The guitar's main figure is `--2-2-2--` on the low D. The bass's main riff is
`D-2222`. **Same pitch, same rhythm, two instruments.** The bass tab's ending
is the same pitches as the guitar's ending. This is not doubling as a thickener;
it is the two instruments being one instrument.

### The bass leaps octaves

`D-10---0---2--`, `D-10---12---2--`, `D-10-10-1010-0-0-00-2--2--2--2--10-10-1010-12-12-1212-14--14--14--14-`

That last line is one pitch set played at three different rates — **rhythmic
augmentation of a fixed cell**. And the range walks 0 to 14 on one string, with
constant jumps between the extremes.

### Mars Volta — the line moves ACROSS the register, not within it

Eriatarka's riff is a single line spread over all six strings, never sitting in
one register:

```
|-----9-----------------------|
|---7----7-10p7---7-----------|
|--------------7-----9---11p9-|
|-7---------------------------|
```

The tab admits it is approximate — "improv on it!" — which is itself the point:
the part is a *gesture*, not a fixed object.

### Televators — the arrangement, measured

15 tracks, 145 bars, 123 bpm, 282 s.

| track | notes | range | distinct pitches |
|---|---|---|---|
| Omar (main guitar) | 1346 | E2–B4 | 18 |
| Cedric (voice) | 324 | B2–D5 | 16 |
| Flea (bass) | 143 | E1–D3 | 13 |
| Drumkit | 145 | — | 3 lanes |
| Shaker | 366 | — | 1 |
| Omar 2 / Omar 3 / Omar Solo | 55 / 69 / 40 | — | — |
| C's Echo | 58 | A3–F#4 | 6 |
| Elec. guitar | 90 | E2–E3 | 5 |
| Effects | 89 | E2–C#5 | 7 |
| Bongos / Congas | 21 / 14 | — | 1 each |
| **Bell Tree** | **1** | C6 | 1 |

**A part that plays one note in five minutes.** And four separate hand-percussion
parts on top of a kit.

**Who plays when** (`#` = 8+ notes in the bar, `+` = 3–7, `-` = 1–2, `.` = silent):

```
Omar          ###+##+##+##+##+##+##+##+##+##+##+##+##+###+##+##++#+++##+##+##...
Cedric        ................--++--++.++.+-.+++++.-+.--++-++-+-++++..........
Flea          .........................................-------------..-..-..-.
Drumkit       .........................................+########-.............
Omar 2        .........................................----------..-----------
Effects       .........................................---------..............
Shaker        .........................................................+######
Bell Tree     ..............................................................-
```

Three structural facts fall straight out:

1. **Bar 41 is a wall.** Flea, Drumkit, Omar 2, Omar 3 and Effects *all start in
   the same bar*, and *all stop* by bar 50. A ten-bar block that arrives whole
   and leaves whole.
2. **Omar plays 137 of 145 bars in one unbroken block.** The riff instrument
   never leaves.
3. **70 of 145 bars have three or fewer parts sounding** — and 39 bars have
   **eight or nine**. The dynamic range of the arrangement is enormous.

---

## 2. THE SAME MEASUREMENTS ON THE FIGHT

doomsludge seed 1, bars 204–356.

| part | notes | range | distinct | notes per distinct pitch |
|---|---|---|---|---|
| keys | 1702 | C#3–B4 (22 st) | 14 | 122 |
| drums | 2369 | — | — | — |
| ostinato | 159 | C#4–A4 (8 st) | 6 | 27 |
| lead | 143 | B3–C#5 (14 st) | 7 | 20 |
| bass | 129 | G#1–F#2 (**10 st**) | **5** | 26 |
| keys2 | 107 | B3–A4 (10 st) | 7 | 15 |
| counter | 11 | B3–G#4 | 3 | 4 |
| **drone** | **0** | — | — | — |

```
lead      ....................................++.-....++--................++..++.-++.-++..++..++..++..+...
keys      ##########.+######.+##.+##.+##..######.###..####...............................+##########.+#.###
ostinato  ................+-++-+--++..+-+++-++-+-++-..+--+..................-+..+-......-+-+++-+-+-+..+.-+.
bass      .................---...-..--..-+-+-+--.---+-+-+-----.+-+-+---+--................................
drone     .................................................................................................
drums     ###########.##########.###############-########+####.##########+##############-+.......-#####.#-#
```

Parts sounding per bar: **0×1, 1×15, 2×68, 3×33, 4×16, 5×6, 6×13, 7×1.**

---

## 3. WHAT IS WRONG, IN ORDER OF SIZE

### (a) THE DRUMS NEVER REPEAT A BAR — and in this music the drums are the thing that repeats

Fingerprinting each bar as its (lane, step) grid — which is what a drum pattern
*is*:

| | bars with hits | distinct patterns | most common pattern covers |
|---|---|---|---|
| Televators drumkit | 59 | **15** | **24%** of its bars |
| the fight | 134 | **119** | **2%** of its bars |

The printout shows it plainly at bars 220, 221, 224:

```
bar 220   kick |x.x.xxx.x.x..xx.|   snare |x...x...x..xx...|
bar 221   kick |x.x.x.x.x.x.xxx.|   snare |x..xx...x..xx...|
bar 224   kick |x...x...x.......|   snare |x...x...x..xx...|
```

The hat is constant; **the kick changes every single bar.** There is no groove
to lock to — there is a continuously re-improvised drum part. Every other
element in this genre is nailed to the kick, and ours moves under them.

**Why it happens:** the drum engine varies per bar by design (the "drum
sectional arc" work). Nothing in the program says *a groove is a fixed object
that repeats and changes at a seam*. Variation is applied per bar where it
should be applied per section.

### (b) THE LEAD FLICKERS — 22 entrances in 153 bars

| | blocks | average block | longest |
|---|---|---|---|
| Cedric (the voice) | 12 | **8.3 bars** | 33 |
| Omar (main guitar) | 2 | **72 bars** | 137 |
| Flea (bass) | 11 | 7.7 | 63 |
| **our lead** | **22** | **1.8 bars** | **4** |
| our keys | 17 | 4.7 | 12 |
| our bass | 8 | 7.6 | 20 |

Our lead is on for two bars, off for two, on for two — twenty-two times. Nothing
in any source behaves like this. The one part that does (Televators' "Elec.
guitar", 36 blocks averaging 1.3 bars) is a **punctuation stab every third bar**,
not a melody. A voice that appears for two bars at a time is not a voice, it is
a texture — and this is the same complaint as "the lead cut out", one level down.

### (c) THE DRONE IS SILENT FOR THE ENTIRE FIGHT

`drone` is in `the fight`'s roles list. It plays **zero notes across all 153
bars** (3 events in the whole 20-minute record).

The open-string pedal is *the* defining device of every Botch example here —
`13p0`, `1p0`, `12p0 x32`, the intro riff's `0` between every fretted note. The
program has a drone lane, declares it in the fight, and does not use it. The one
thing this music always has under it is the one thing our climax has none of.

### (d) UNISON IS FORBIDDEN BY LAW

| | unisons | of notes |
|---|---|---|
| Televators | **201** | 2416 (8.3%) |
| the fight | **15** | 2251 (0.7%) |

Botch's identity is the bass and guitar playing **the same riff on the same
pitches** — `D-2222` in both tabs. Our materials law throws:

```
collision in A at 0:0:52 — drone lands on keys
```

on any two parts writing the same bar:step:pitch. The law is right for the
problem it was written for (two parts accidentally on one pitch is a wasted
voice), and **it makes the genre's central gesture unrepresentable**. There is
no way to say "the bass and the guitar are playing the same thing on purpose".

### (e) THE CLIMAX IS THINNER THAN THE REFERENCE'S VERSES

Televators reaches **eight or nine parts in 39 of its 145 bars**. Our fight
reaches 7 parts in **one bar out of 153**, and 84 of 153 bars have two parts or
fewer. The act named "the fight" is, on average, a duo.

Televators also *coordinates* its arrivals — five parts start in bar 41 together
and stop together at bar 50. Ours fade in and out independently; there is no bar
anywhere in the fight where the band arrives.

### (f) THE BASS IS IN A TEN-SEMITONE BOX

Five distinct pitches, G#1–F#2, across five minutes. Flea uses 13 pitches over
22 semitones. The Botch bass tab walks 0→14 on one string and leaps octave to
octave between consecutive notes (`10---0---2`, `10---12---2`). Ours does not
leap at all.

### (g) THERE IS NO CELL WITH A COUNT

Every source states form as *this figure, N times*. Our fight has no repeated
cell with a stated count anywhere; it has 31 distinct bar-shapes in the keys'
80 sounding bars. Pitch-level reuse is actually *comparable* to the reference
(keys 2.6× vs Omar 5.0×) — the problem is not that we repeat too little in
aggregate, it is that **nothing is nailed down long enough to become a riff you
recognise**, because the drums under it never repeat and the parts keep
entering and leaving.

---

## 4. WHAT IS MISSING, AS MECHANISMS

None of this is a knob. Each one is a thing the program cannot currently say:

1. **A groove object.** A drum pattern that is fixed for a section and changes at
   the seam, not per bar. (Fixes (a).)
2. **A riff with a repetition count.** `cell x32` as a first-class statement,
   with the asymmetric grouping (8+5+3) the sources use, rather than a bar-length
   material re-drawn each time.
3. **A pedal that the riff returns to.** The open string, as a lane the riff
   snaps back to — not a separate sustained drone part but a *note inside the
   riff*.
4. **Deliberate unison.** A declaration that two parts double each other, which
   the collision law must be taught to permit rather than throw on.
5. **A coordinated arrival.** "These five parts all enter at bar N" as a
   statement about a section, instead of each part's own independent draw.
6. **A minimum phrase length for a melodic part** — a lead that enters plays a
   phrase, not two bars.
7. **A one-shot gesture part.** The Bell Tree plays once, at the end. We have no
   way to place a single event as an arrangement decision.

## 5. WHAT IS ALREADY RIGHT

Worth stating so it does not get "fixed":

- Pitch-level repetition in keys, bass and ostinato is in the same range as the
  reference (2.6–4.4× reuse per bar shape against Omar's 5.0× and Flea's 3.5×).
- The step placements are already irregular — the printout shows keys striking
  at steps 0, 6, 8, 11, 12 — which is closer to Botch's asymmetry than a
  four-on-the-floor grid would be.
- The tempo (117 bpm against Televators' 123) and the register of the keys part
  (C#3–B4 against Omar's E2–B4) are both idiomatic.
- Section-level arrangement now guarantees no part vanishes for a whole leg
  (§0ap), which is the coarse version of complaint (b).

---

# PART 2 — "the whole of the song is missing a harmony, a hook, and a repeating
# altering motif. The thing that holds it together."

*The owner's read after the comparison above, and it is a deeper and better
criticism than the seven findings in Part 1. It is also correct, it is program-
wide rather than doomsludge's, and one half of it is a deliberate design decision
that produced the opposite of what it intended.*

## 1. THE TUNE IS EIGHT NOTES

Material `A`'s lead, doomsludge seed 1 — the melodic identity of the record's
first five minutes:

```
  A       8 notes over 4 bars:   D#4 E4 E4 D#4 C#4 C#4 B3 A#3
```

Averaged over 12 seeds and every genre, material A's lead is **4 to 9 notes**.
That is not a fault by itself — Botch's main riff is one note — but it means
everything depends on what happens to those eight notes over twenty minutes.

## 2. NOTHING THAT IS SUPPOSED TO COME BACK COMES BACK

Measuring what fraction of a variant's melodic shapes (interval + rhythmic gap,
2-gram) also occur in the parent it is named after. 12 seeds, doomsludge:

```
  Avar    keeps  39%  of A     the variation — real, if thin
  Adev    keeps   1%  of A     the DEVELOPMENT of A
  Aseq    keeps   0%  of A
  Alift   keeps   0%  of A     the RETURN of A, in a new key
  B       keeps   0%  of A     in every one of 12 seeds
```

And across the whole file:

```
  genre           A notes   Avar    Adev    Aseq   Alift    B vs A
  lofi                9      29%     4%       -       -       3%
  synthwave           9      38%     1%       -       -       2%
  dungeonsynth        4      18%    12%       -     67%       0%
  fantasysynth        8      35%    10%       -      0%       0%
  doomsludge          9      39%     1%      0%      0%       0%
```

**This is the whole complaint in one table.** A "development" that keeps 1% of
what it develops is not a development. A "lift" that keeps 0% is not a return.

**Dungeon synth's lift keeps 67%**, which proves the machinery can do it — that
genre's lift lands on a transposition of its own progression, so composing
against it lands near the same tune. Every other genre's lift draws a *different
mode and a different progression*, so `buildTheme` writes a different tune.

## 3. THE REPRISE WAS REPLACED ON PURPOSE, AND THE REASON IS IN THE FILE

`themeA  = buildTheme(chords,     "themeA", resA,  ...)`
`themeAl = buildTheme(liftChords, "themeA", resAl, ...)`

Built again, from scratch. The rationale is written beside it:

> *"the lifted copy gets its OWN takes, in the lifted key, rather than a
> transposed reprint of the road's — otherwise the sunrise arrives and the banjo
> plays the same four bars it has been playing all night, a fifth up."*

The fear is right: a literal transposition **is** dull. But the answer chosen —
compose something else — removes the only thing that makes a reprise a reprise.
The cure for "the same four bars a fifth up" is *the same four bars, altered* —
displaced, truncated, augmented, re-harmonised — not four different bars.

**The record's shape is currently A → C → B → (something new).** There is no
return, so there is nothing to hold it together, which is exactly what was
reported.

## 4. WHAT THE FIGHT IS, RELATIVE TO THE RECORD

`B` shares **0%** of its shapes with `A`, in every seed of every genre. The
fight is a different song spliced into the middle of the record. There is no
motivic reason for it to be the same piece of music as the movement before it.

And the near-miss is worth recording, because it shows how close this is:

```
  A   D#4 E4  E4  D#4 C#4 C#4 B3 A#3     up a semitone, repeat, back, descend
  B   E4  F#4 F#4 E4  D4  C#4 B3         up a TONE,     repeat, back, descend
  C   E4  F#4 F#4 E4                     the first four notes of B
```

**The contour is already shared** — step up, repeat it, step back, walk down.
`C` is literally B's first four notes. Nothing in the program knows this or did
it on purpose; the interval sets do not match because A steps by semitone where
B steps by tone, so every measure of relatedness reads zero. The material is
*accidentally* related and *structurally* unrelated.

## 5. THERE IS NO HARMONY VOICE

`counter` is the only part whose job is to move against the tune. In the fight
it plays **11 notes across 153 bars**. Over the whole record, 51 against the
lead's 395. lofi's counter plays **0 notes per record**.

A harmony is two voices moving together. We have one voice and a comp.

## 6. THERE IS NO HOOK

The most-repeated four-note shape of every part, doomsludge seed 1:

```
  lead       -2, 0, 2, 0     x16     down a tone and back
  ostinato   -5, 5, -5, 5    x33     a fourth, down and up
  bass        7,-7, 7,-7     x34     an octave, down and up
  counter    -2, 2,-2, 2     x7      down a tone and back
  keys      -19, 7, 5, 7     x170    the power-chord voicing, arpeggiated
```

**Every one of them is an oscillation or an artefact of the voicing.** Not one
is a figure. The most repeated thing in the record is the shape of a chord being
spread out, which nobody hears as a tune.

## 7. WHAT MATHCORE ACTUALLY NEEDS FROM THIS

The genre is not held together by groove or by key — it changes both constantly.
It is held together by **one small cell subjected to violent transformation while
staying recognisable**: displaced by a sixteenth, truncated, stretched, moved to
another instrument, played at half speed under a new riff. Botch's
`8+5+3 / 8+5+3 / 16-flat` is exactly that — the rhythm is the invariant and
everything else moves.

Our program has the vocabulary (`Avar`, `Adev`, `Aseq`, `Alift`, `twist`,
`takes`) and it has no **invariant**. Every transformation is free to keep
nothing, and measurably does.

## 8. WHAT TO BUILD, IN ORDER

1. **A motif that belongs to the RECORD, not to a material.** Three to six
   notes, drawn once in stage 3, carried in the chart. Every material is
   obliged to contain it somewhere — same intervals, any transposition, any
   rhythm.
2. **A floor on every transformation.** `Adev` must keep a stated fraction of
   `A` and the seam check should fail when it does not, exactly as the out-of-key
   law fails. A named transformation that keeps 1% is a bug the program cannot
   currently see.
3. **The reprise returns the material, altered.** `Alift` transposes `themeA`
   and then varies it, instead of calling `buildTheme` again. The banjo problem
   is solved by the variation, not by replacement.
4. **Make the fight a transformation of the record, not a new song.** `B` should
   be derived from `A` — the same contour at a different step size is already
   what the tables accidentally produce; do it on purpose.
5. **A harmony voice that plays.** The counter exists and is silent; either give
   it work or stop declaring it.
