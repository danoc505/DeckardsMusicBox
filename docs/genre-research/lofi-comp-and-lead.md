# How the chords are played, how busy it is, and what plays the tune

*Researched 2026-08-04. The user: "What is playing the lead notes on lofi, not
the chords? Its stale and lame. Can you search transcriptions of lofi hip hop
songs in the internet and study them? How are the chords played, how busy is the
tracks and when?" Three questions. This sheet answers all three from named
sources and then measures what this program does against each one.*

---

## 0. THE ANSWER TO THE DIRECT QUESTION, FIRST

**`V.lead` plays it.** Measured over 60 seeds a genre, counting lead-role notes
by which voice sounded them:

```
  lofi         lead 72%   chipLead 28%
  synthwave    lead 100%
  dkc          chipLead 68%   lead 32%
  bladerunner  cs80 100%
  acid         acid303 100%
```

`V.lead` is three oscillators — a triangle, a square, and a sawtooth an octave
up — summed into one lowpass filter, with a vibrato fixed at 5.1 Hz that fades
in identically on every note, and a plain envelope. It has no sample, no
different tone for a hard note than a soft one, and no note-to-note variation
beyond loudness. `V.counter = V.lead`, so lofi's second melody is the same
voice again. So is 100% of synthwave's tune.

**It is the house generic, and nothing about it is this genre.** That is a
complete and sufficient explanation for the complaint, before any of the
research below.

---

## 1. WHAT THE TRANSCRIPTIONS SAY THE CHORDS ARE

Two of the genre's founding tracks, as transcribed:

| track | chords | key / tempo |
|---|---|---|
| Nujabes, *Aruarian Dance* | **G#m7 – A#m7 – C#7 – F#maj** | 100 BPM [corpus:hooktheory; corpus:chordify] |
| Nujabes, *Feather* | **Db – Ebm7 – Ab – Bbm** | Bb minor, 90 BPM [corpus:chordify; corpus:chordu] |

Three of the four chords in each are **sevenths**. Neither progression is
longer than four chords, and both loop.

The production sources say the same thing and say it as a rule rather than an
example:

> "Lo-fi chord progressions rely on **extended chords, especially major 7ths,
> minor 7ths, and dominant 9ths**… the genre borrows heavily from jazz harmony
> but strips away the complexity, keeping the colour of jazz voicings without
> the improvisation or fast changes." [corpus:orphiq]

> "Jazz-leaning chords (**maj7, min7, 9ths, 11ths**)", "warm, nostalgic
> voicings." [corpus:melodigging Lo-Fi Hip Hop]

> "Adding the 7th note (for example, Cmaj7: C-E-G-B) makes it sound like
> lo-fi." [corpus:orphiq]

**`[three sources plus two transcriptions]`** This half is settled and this
program already does it — `extensions` and `CHORD_QUALITY` shipped at
`2026-08-04d`. Recorded here because the sheet has to establish the baseline
before it argues about the voicing.

---

## 2. HOW THE CHORDS ARE VOICED — the number is two octaves

> "Play the root in the left hand and the **3rd, 7th, and any extensions** in
> the right hand **with space between them**." And: "close voicings… sound
> dense and pop-like" while lo-fi favours "**spread voicings where the notes
> span two octaves or more**." [corpus:orphiq]

> "**Voicing matters as much as the chord itself.** Inversions and extensions
> create smoother transitions between chords and keep the lowest note moving in
> a way that sounds intentional." [corpus:songer]

> Rootless voicings exist because "by omitting the root from their left-hand
> chord shapes, they freed up their fingers to include additional colour tones
> in the middle register" — the root being held by someone else.
> [corpus:pianowithjonny; corpus:pianogroove]

**`[four sources]`**, and the two-octave figure is the only quantity any of
them gives. It is the same number `lofi-voicing.md` found and the same target
the drop-2-and-4 work aimed at.

---

## 3. HOW THE CHORDS ARE STRUCK — behind the grid, and broken

This is where the sources are most specific, and it is the part of the question
this repo had never asked.

**The chord is not one event.**

> "Play chord progressions slowly and loop them, using **broken chords or
> rhythmic stabs** to make it feel more musical." [corpus:melodics]

**And it does not land on the grid.**

> "Quantized chords sound sterile… **nudge the entire chord 10–30
> milliseconds late.** That drag creates the laid-back feel." Producers "either
> play chords by hand with slightly loose timing or manually shift MIDI notes a
> few ticks behind the grid, with **the imperfection being the aesthetic**."
> [corpus:orphiq]

> "Lo-fi is all about feel, so let's not quantize everything perfectly. **The
> 'janky' moments that sound out of time add to the feeling.**"
> [corpus:nativeinstruments]

**And — the finding worth having — the layers do not agree with each other.**
Analysed off waveforms in a DAW rather than asserted:

```
  triplet swing     66.6%   (2:1)
  quintuplet swing  60%     (3:2)
  septuplet swing   57%     (4:3)
```

> In "Nag Champa" the hi-hat follows a **quintuplet** feel while "the kick is
> playing subdivisions based on a **triplet swing** feel"; elsewhere the hat is
> septuplet while "the kick is playing subdivisions of all three swing feels."
> [corpus:pocketchops]

**`[four sources, one of them quantitative]`** The 10–30 ms figure and the
three swing ratios are the only hard numbers anywhere in this research.

**A STATED LIMIT.** The pocketchops analysis is of J Dilla, who is upstream of
this genre rather than in it, and its own author writes: "I highly doubt that
these guys were thinking about their grooves in this way." It is a measurement
of what the records do, not a specification anyone followed. It is quoted as
the former.

---

## 4. HOW BUSY IT IS, AND WHEN

Every source that talks about arrangement says the same word, and the word is
**less**.

> "Keep melodies **sparse and repeating**"; "simple top-line motifs"; tracks
> hold minimal density through "brief intros/outros, **occasional dropout
> sections**, and minimal variation"; arrangements feature "**negative space**"
> and avoid layering complexity. [corpus:melodigging Lo-Fi Hip Hop]

> "**Silence matters more in lo-fi than in almost any other genre.** Let notes
> breathe. Leave space between phrases." And the whole process: "Start with one
> beat. Add one chord loop. Put **one** melody over it. Then apply texture."
> [corpus:songer]

> "**Avoid filling every beat with notes** — let moments of silence add
> emotional weight." "**Insert rests between phrases** to give the listener a
> moment of reflection." "Use **short, 4 to 8-note motifs**." "Keep the melody
> within a **narrow range** to maintain a focused and intimate sound."
> [corpus:mysticalankar Crafting Lofi Melodies]

> A four-layer arrangement: drums, chords, melody, counter-melody — and no
> dedicated bass at all. [corpus:nativeinstruments]

**And the shape of the melody is given twice, in bars and in notes:**

> "A **two-bar phrase that repeats**, maybe shifts up a note in bar 5, and
> drops back down. That's it." [corpus:songer]

> "Use short, **4 to 8-note motifs**." [corpus:mysticalankar]

Two sources, two units, and they are consistent with each other: a two-bar
phrase of four to eight notes is **two to four notes a bar, repeating**. That
is the only figure in this whole sheet that constrains how many notes a lofi
tune plays, and it is worth having.

**Where the density changes:** intro (8–16 bars, chords plus noise) → main
groove → **a breakdown of ~8 bars where elements drop out** → variation →
outro. [corpus:audioplugindeals] The loop is 4–8 bars and the structure is
"Loop, loop with beat, **loop without beat**, loop with beat, fade out" — an
ABABB [corpus:richardpryn]. **The variation in this genre is subtraction.**

**`[five sources]`**

---

## 5. WHAT PLAYS THE TUNE

> "**Rhodes piano is the standard choice.** Vibraphone works well at lower
> tempos. A **muted guitar played fingerstyle** sits naturally in the mix
> without competing with the chords. **Pick one melodic instrument and keep it
> in its mid-range. Avoid the top octave.**" [corpus:songer]

> Electric pianos are "one of the most iconic instruments in lo-fi music", with
> a "dreamy and mellow timbre"; **Fender Rhodes and Wurlitzer** especially.
> Guitar melodies are "delicate fingerpicking… drenched in reverb and delay".
> **Synthesisers are named for a different job entirely** — "soft pads, warm
> chords, and gentle arpeggios", providing "texture and depth".
> [corpus:clarkaudio]

> "Rhodes keyboards and analog synths" for melodic lead; "layering a soft synth
> with a real instrument, like a piano or guitar"; a finger-picked guitar with
> tape delay. [corpus:nativeinstruments blog]

**`[three sources]`** and they agree on two things. First, the lead is an
**electric piano, a vibraphone or a guitar** — a struck or plucked thing with a
body, not a held oscillator. Second, where a synth appears in these lists at
all, it is named for **pads and texture**, and one source explicitly puts it
underneath a real instrument rather than in front.

**Not one source describes a lofi lead as a sawtooth.**

---

## 6. WHAT THIS PROGRAM ACTUALLY DOES — `harness/probe_density.js`, 30 seeds a genre

A new probe, because nothing here had ever measured density. Every existing one
asks *which notes*; none asked *how many*.

**A CORRECTION MADE DURING THE MEASUREMENT, recorded because it nearly became a
false finding.** Grouping the comp's notes by onset reads **1.24 notes per
chord** on lofi, and I was one step from reporting that our chord part does not
play chords. It does. `buildKeys` **rolls** its voicings deliberately — voices
enter bottom-upward across several sixteenths, and on later strikes an inner
voice moves while the outer ones hold. Onset-grouping measures the roll and
calls it the harmony. The probe now counts what is **sounding** at each
sixteenth, which is what an ear gets, and reports the onset figure separately
as the roll.

### The voicing

```
  genre         voices ringing   span(semitones)   bottom   root underneath
  lofi                 5.10            14.0         C#4         16.1%
  synthwave            4.70            11.7          B3         20.7%
  bladerunner          3.85            12.2          A3         33.9%
  acid                 3.04             7.7          C4         50.1%
```

Five voices sounding, spanning **14.0 semitones**. The source's number is
**24 or more**. We are an octave and a fifth where two octaves is asked for —
closer than the 12.2–13.0 this program measured before drop-2-and-4, and still
short. **This is a real gap and it is the only one in this sheet with a number
on both sides.**

The 16.1% root-underneath is *correct*, not a failure: rootless voicings are
the point, and the bass holds the root.

### The roll and the rhythm

```
  notes per onset      1.24        the roll — one voice at a time
  onsets per bar       7.67
  where they land      16th 1: 13.8%   16th 11: 11.0%   16th 3: 10.9%
                       16th 6: 0.2%    16th 13: 0.3%
```

Struck across the bar rather than on the bar line, weighted to the downbeat and
the offbeats. That matches "broken chords" and it is a design this program
already reasoned its way to.

**What we do NOT do: the drag.** No part of this program pushes the comp behind
the grid by a fixed 10–30 ms. Stage 5 has a groove and a lean, but nothing
implements the one hard number in §3.

### The room

```
  genre         parts/bar   notes/bar
  lofi            4.07        26.3
  synthwave       4.67        49.6
  jungle          1.70        12.0

  lofi, per section:
     outro          parts 1.82   notes/bar  9.5
     bridge         parts 2.66   notes/bar  6.9
     intro          parts 2.28   notes/bar 11.7
     instrumental   parts 3.05   notes/bar 25.0
     verse          parts 3.67   notes/bar 25.1
     chorus         parts 5.37   notes/bar 34.6
```

**4.07 parts a bar against "not more than 3 or 4 elements"** — at the ceiling,
and the chorus is over it at 5.37. But the per-section spread is the shape the
sources describe: the density is what changes, the quiet sections are genuinely
quiet, and the bridge is the thinnest thing in the record. **This half is
right.** Reporting it plainly rather than manufacturing a problem: the room is
about as busy as the sources allow, not busier.

### The tune

```
  genre         lead notes/bar   bars rostered but silent
  lofi                 2.98                   5.3%
  bladerunner          1.48                  13.4%
  acid                 2.94                   0.6%

  lofi lead register:  5th pct G4   median C#5   95th pct G#5   top C6
  mean note length:    0.65 s
```

**Three notes in every bar, and it rests in one bar out of nineteen.** Against
"leave space between phrases", "silence matters more in lo-fi than in almost
any other genre", and "a melody with too many notes sounds anxious".

**And the material itself, before the arrangement repeats it** — mean notes in
one four-bar lead line, 30 seeds:

```
  lofi     A: 9.0 notes   B: 16.3 notes   C: 6.8 notes    (materials are 4 bars)
```

Against §4's two-to-four notes a bar: **A is inside it** (2.25 a bar) and
**B — the chorus line — is at 4.1 a bar, over the ceiling.** So the tune is not
uniformly too busy; its chorus line is, and the performed 2.98 is the two mixed
together.

**THE REAL FINDING IS THE SILENCE, NOT THE COUNT.** It rests in **1 bar in 19**
of the bars it is rostered for, against three separate sources whose whole
subject is space — "insert rests between phrases", "leave space between
phrases", "silence matters more in lo-fi than in almost any other genre". A
melody at a defensible note count that never stops is still relentless, because
what the sources are describing is not a rate, it is a **shape**: phrase, rest,
phrase.

**That makes two faults, and they are independent.** The lead is a generic
synth (§0) and the lead does not breathe (here). Either one on its own would
produce the complaint. This program has both.

Register is a near miss rather than a fault: median C#5 with a 95th percentile
of G#5 is mid-range by any reading, and only the very top of the distribution
touches C6. The spread from G4 to G#5 is 13 semitones, which is "a narrow
range" [corpus:mysticalankar] by any reasonable reading of the phrase.

---

## 6b. WHAT WAS BUILT FROM ALL OF THIS — `2026-08-04i` and `04j`

**§0 and §5, the instrument.** `leadChar`, beside `keysChar`: lofi's tune is on
a Rhodes or a Wurlitzer, drawn separately from its comp, in 210 of 300 songs —
the other 90 draw the `sega` rig, where the lane never reaches the house lead at
all. Six genres declare `"synth"` and are byte-identical.
`docs/genre-research/the-rhodes.md` researches the instrument and measures the
level, which the arithmetic had backwards.

**§4 and §6, the space.** Two table numbers, both against the two sources that
agree on two-to-four notes a bar:

- `theme.breathLast: 7` — the second bar of a phrase may no longer put a note in
  its back half, so the tune goes quiet before the phrase comes round again.
- `theme.count.hooky: [4,2] → [3,2]` — the hook was the one part of this genre's
  tune outside the sourced range, at 4.1 notes a bar.

```
                             before    after
  notes a bar (performed)      2.98      2.63
  SILENT TIME                 38.3%     41.0%
  rests of a beat or longer   39.2%     47.9%   of 1612 rests
  material A                   2.23      2.23   notes a bar  (unchanged)
  material B, the hook         4.06      3.25   inside 2-4 for the first time
  material C, the bridge       1.70      1.77
```

**AND THE FIRST MEASUREMENT OF THIS WAS THE WRONG ONE, which is worth keeping.**
The obvious metric — bars with no lead note at all — read **5.3% → 6.2%** and I
nearly reported the change as doing almost nothing. It measures the wrong thing:
a rest that takes the back half of a bar leaves a note at the front, so the bar
still counts as occupied. What the sources ask for is space, and space is
measured in TIME. `probe_density.js` now reports silent time and the longest
rest beside the bar count.

**Read off the notes**, lofi seed 1, material A's tune:

```
  before   2---1-2--.......  ..1---..........  3---4---5---5--.  ......5---......
  after    2---1-2--.......  1---............  3---4---5---5--.  ..5---..........
```

Bars 2 and 4 are the breath bars. Their note moves to the front and the phrase
ends in silence — ten and twelve sixteenths of it, against six and ten.

**Blast radius: 300 of 2100 songs, and every one of them is lofi.**

---

## 7. WHAT THE SOURCES DO NOT SETTLE

- **How long the rests are, and how often.** This is the gap that matters,
  because the rests are the finding. "Insert rests between phrases" and "leave
  space between phrases" say a phrase ends in silence and say nothing about
  whether that silence is a beat, a bar, or two bars. Every source is unanimous
  that it exists and none of them measures it. Whatever this program picks is
  `[EAR]` and has to be labelled so.
- **Whether the 4-to-8-note figure is per phrase or per bar.** Read alongside
  [corpus:songer]'s two-bar phrase it comes out at two to four notes a bar, and
  that reading is used above — but it is a reading of two sources side by side,
  not a statement either of them makes.
- **Whether the 10–30 ms drag applies to the whole part or to each voice.**
  [corpus:orphiq] says "nudge the entire chord", which reads as the whole part
  — but this program's comp is rolled, so "the entire chord" is already spread
  across sixteenths and it is not obvious what the sentence means here. Nothing
  found resolves it.
- **Whether the swing ratios in §3 belong to lofi at all** or only to the Dilla
  records upstream of it. Stated as a limit in §3 rather than smoothed over.
- **What a Rhodes lead should sound like as synthesis.** Every source names the
  instrument; none describes how to build one. That is a separate research
  question and it is not answered here.

---

## Sources

- [Aruarian Dance by Nujabes — Hooktheory](https://www.hooktheory.com/theorytab/view/nujabes/aruarian-dance)
- [Nujabes — Aruarian Dance chords — Chordify](https://chordify.net/chords/nujabes-songs/aruarian-dance-2-chords)
- [Nujabes — Feather chords — Chordify](https://chordify.net/chords/nujabes-feat-cise-star-akin-songs/feather-chords)
- [Feather chords — ChordU](https://chordu.com/chords-tabs-nujabes-feather-id_jfFTT3iz740)
- [Lo-Fi Chord Progressions: 6 Examples and How to Voice Them — Orphiq](https://orphiq.com/resources/lofi-chord-progressions)
- [Lo-Fi Hip Hop — Melodigging](https://www.melodigging.com/genre/lo-fi-hip-hop)
- [The Lo-Fi Sound Explained — Songer](https://songer.co/blog/posts/the-lo-fi-sound-explained-how-to-build-chill-beats-from-the-ground-up)
- [The Melodic Palette of Lo-Fi Music — Clark Audio](https://clarkaudio.com/the-melodic-palette-of-lo-fi-music/)
- [Making lo-fi hip hop beats: the essential guide — Native Instruments](https://blog.native-instruments.com/lo-fi-hip-hop-beats/)
- [J Dilla: A New Theory of Rhythm — Pocket Chops](https://pocketchops.blogspot.com/2020/11/j-dilla-new-theory-of-rhythm.html)
- [How to Create Lofi Chord Progressions — Melodics](https://melodics.com/blog/how-to-create-lofi-chord-progressions)
- [Crafting Lofi Melodies: A Step-by-Step Guide — Mystic Alankar](https://mysticalankar.com/blogs/blog/crafting-lofi-melodies-a-step-by-step-guide)
- [The Ultimate Guide to LoFi Hip-Hop Production — Audio Plugin Deals](https://audioplugin.deals/blog/the-ultimate-guide-to-lofi-hip-hop-production/)
- [How to Structure Lofi Music — Richard Pryn](https://richardpryn.com/lofi-music-structure/)
- [Rootless Voicings for Piano: The Complete Guide — Piano With Jonny](https://pianowithjonny.com/piano-lessons/rootless-voicings-for-piano-the-complete-guide/)
- [Rootless Chord Voicings for Jazz Piano — PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/rootless-chord-voicings/)
