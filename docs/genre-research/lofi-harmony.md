# Lofi hip hop — the CHORDS

*Researched 2026-08-03 at the user's direction ("Researching lofi hip hop and
chords"), fresh, for the music-theory work. This is the harmony half of the
genre; `lofi-form.md` is the shape half and `lofi.md` is the older general
sheet. Nothing here is carried over from either — every claim below was
searched for this document and carries its source.*

---

## 0. HOW GOOD IS THIS GROUNDING? Read this before you build from it.

**Honestly: this is the repo's WEAKEST source tier, and it should be said out
loud.** HANDOFF §0 ranks grounding as: measured structure (a corpus) → primary
sources (the artist saying what they did) → named secondary analyses. What
follows is almost entirely the third kind, and the third kind's bottom end at
that — production tutorials aimed at beginners. They agree with each other,
which is worth something, but tutorials also copy each other, so agreement
between two blogs is much weaker evidence than agreement between two
measurements.

Two things follow, and both matter more than any single number below.

1. **Where two independent sources agree on a number, I have marked it
   `[two sources]`.** That is the repo's own standard — "one source is a claim;
   two agreeing is a target."
2. **There is measured harmony sitting in this repo that would beat all of it,
   and MK2 cannot see it.** `corpus/ingest_jazz.py` ingests the **Jazz Harmony
   Treebank** (1170 standards' chord changes, EPFL DCMLab) into a relative
   `{degree, quality}` encoding; `corpus/ingest_bach.py` ingests 382 Bach
   chorales as four independent voices; `corpus/harvest_accompaniment.py`
   measures what an accompaniment actually plays from POP909. **All three
   target MK1. Grep says `JAZZ_CORPUS`, `BACH_CORPUS` and `IMPROV_DIMENSIONS`
   appear ZERO times in `Deckards Orchestrator MK2.html`.** Lofi's harmony is
   jazz harmony slowed down (§1), so a corpus of jazz changes is the right
   instrument for exactly this question and it is not plugged in. That is in
   `docs/BACKLOG.md` as its own item, and it outranks anything a tutorial can
   tell us.

So: build from §2–§5, mark it `[EAR]` where the amount is mine, and treat the
whole sheet as provisional against the treebank.

---

## 1. What the genre's harmony IS

The consistent claim across every source: **lofi takes jazz harmony and removes
the motion.**

> "Lo-fi hip-hop borrows its harmony from jazz and soul, then strips away the
> speed — a jazz standard races through its changes while lo-fi takes the same
> lush chords and lets each one sit for bars at a time."
> [corpus:blog.flat.io lofi-chord-progressions]

> "Unlike jazz, lo-fi often stops moving — picking one lush chord, such as a
> major ninth, and letting it breathe for several bars, or sliding between just
> two chords a step apart." [corpus:blog.flat.io]

The lineage is named the same way everywhere: **J Dilla, DJ Shadow and Nujabes
"set the template"** [corpus:blog.flat.io], and Nujabes specifically "mixed
**modal jazz** samples with turntablism, breakbeats and boom-bap drums"
[corpus:jazz.fm/nujabes-jazz-samples-lofi-hip-hop].

**The consequence for a generative program is the important part.** A genre
whose harmony is "jazz chords that do not move" fails in a way that is the
opposite of most: the risk is not that the changes are too simple, it is that
each chord is too PLAIN. If a chord sits for four bars, it has to be worth
sitting on. A triad held for four bars is a drone; a minor 11th held for four
bars is a mood. **That is the whole argument for extensions here**, and it is
why this genre is the right place to start the harmony work.

---

## 2. THE CHORDS ARE EXTENDED, NOT TRIADS — the strongest finding

Every source says this, none of them hedges, and it is the first thing to fix.

> "The sound rests on **extended chords like major sevenths, minor sevenths and
> ninths in place of plain triads**." [corpus:blog.flat.io]

> "Take a plain progression like C, Am, F, G and add a seventh to each — Cmaj7,
> Am7, Fmaj7, G7. Major sevenths sound dreamy and warm, minor sevenths mellow
> and a little melancholy, dominant sevenths add a bluesy edge."
> [corpus:blog.flat.io]

> "Extensions can go up to **thirteenths**. Once you feel confident with
> sevenths, experiment with adding in ninths and elevenths."
> [corpus:blog.native-instruments lo-fi-chord-progressions]

**Richard Pryn's thirteen progressions are the most useful single artefact
found**, because he writes the quality of every chord rather than a roman
numeral and a shrug [corpus:richardpryn.com/13-lofi-chord-progressions]. The
qualities that actually appear across his thirteen:

| quality | appears as |
|---|---|
| maj9 | Cmaj9 (six of thirteen open on one) |
| maj13 | Fmaj13 |
| maj7 | Cmaj7, Abmaj7, Ebmaj7, Bbmaj7 |
| min11 | Cmin11, Fmin11, Amin11 |
| min9 | Cmin9, Gmin9 |
| min7 | Amin7, Dmin7, Bmin7, Dbmin7 |
| dom7 altered | G7#5, G7b5, G7b9aug5, F7 |
| half-diminished | Dmin7b5 |
| diminished 7th | Bdim7 |
| dom 11 | G11 |

**Not one plain triad in thirteen progressions.** Read that against a program
whose chords are stacked thirds from a scale degree: the gap is not a tuning
issue, it is a vocabulary that does not contain the genre's words.

The minor side is confirmed independently: "the **minor 9th and minor 7th**
chords give the progression a dark, moody feel, creating a sense of alluring
sadness that is characteristic of many lofi tracks", and lofi "relies on
extended chords, especially **major 7ths, minor 7ths and dominant 9ths**"
[corpus:unison.audio lofi-chord-progressions]. **`[two sources]` — maj7, min7
and the 9th are the core three.**

---

## 3. HOW MANY CHORDS, AND HOW LONG

- **Three to five chords in a repeating loop.** "Most lo-fi tracks use three to
  five chords in a repeating loop." [corpus:chords.beatkey.app
  modal-chord-progressions]
- **Two is also idiomatic**, and Pryn gives four two-chord loops outright
  (Cmaj9–Fmaj13; Cmin9–Dbmin7; Cmin11–Bdim7; Cmin9–Bbmaj7).
- **A chord is held a bar or two.** "Hold each chord for a bar or two and you
  already have a loop." [corpus:blog.flat.io]

`[two sources]` on the short loop; the bar-or-two figure has only flat.io
behind it and should be read as an order of magnitude, not a measurement.

---

## 4. MODE — and the one clean discriminator

This is the only place the sources give a rule sharp enough to implement
without taste, and it is worth having:

> "The **IV major chord is the Dorian signature** (D major over an A minor
> centre = A Dorian), while Aeolian uses a **iv minor** (Dm in Am). The
> **bVI–bVII pull is the Aeolian signature**."
> [corpus:premierguitar Beyond Blues: Dorian vs. Aeolian]

> "When you see a **major IV chord in a minor key**, you know that the Dorian
> mode will work." [corpus:chords.beatkey.app]

And the chord that carries the mode: "the **m7 chord gives off the sound of the
Dorian mode**, and the minor scale in Dorian mode fits the description
perfectly for lofi" [corpus:chords.beatkey.app].

**Both minor modes are in the repertoire**, which Pryn's list bears out
directly: his #7 `Cmin11 – F7 – Abmaj7 – Ebmaj7` is i–IV–VI–III with a MAJOR
(indeed dominant) IV, which is Dorian colouring, and he names it as borrowed:

> "The culprit for this is the dominant IV chord, the F7. This is a **borrowed
> chord from another key**." [corpus:richardpryn.com]

while his #12 `Cmin9 – Bbmaj7` is i–bVII, the Aeolian pull.

**So the genre is not "minor". It is minor with a specific ambiguity between
two minor modes**, and the chord that decides which one you are in is the
fourth. A program that only stacks thirds inside one fixed mode cannot express
that ambiguity at all — it is a chord-QUALITY question, not a scale question.

---

## 5. VOICING — the direct answer to "wider chords"

The single most useful source found, and the only one that treats voicing as
its subject [corpus:orphiq.com/resources/lofi-chord-progressions]:

> **"Close voicings (all notes within one octave) sound dense and pop-like.
> Lo-fi favors spread voicings where the notes span TWO OCTAVES OR MORE."**

> "Play the root in the left hand and the **3rd, 7th and any extensions** in the
> right hand **with space between them**. The gaps between notes create the
> open, airy quality lo-fi is known for."

> "Inversions change the bass note of a chord without changing its name…
> [they] sound **more polished and intentional than the same chords in root
> position**."

> "Nudge the entire chord **10–30 milliseconds late**. That drag creates the
> laid-back feel."

**This corroborates a target this repo already wrote down from a completely
different source.** `NOTES-FROM-THE-USER.md` records the user's photograph of a
good comp — one bar framed **B3 / B4 / D5 / C6 / F6**, which spans **30
semitones** — and the repo's own honest note that the comp then reached "about
thirteen". Two independent sources, a photograph the user chose and a voicing
guide, both say **two octaves or more**. `[two sources]` — this is a target,
not taste.

The last-note rule is worth keeping too: Pryn, voicing a Cmin9 as **C–B–D–G**,
says "**remove the fifth altogether because it is not essential to the
harmony**" [corpus:richardpryn.com]. That is the standard jazz-piano economy and
it is what MAKES room for extensions without the chord growing a sixth voice.

### The wider jazz-voicing vocabulary these sit inside

Named and defined, for when the comp is rebuilt
[corpus:pianowithjonny rootless-voicings; corpus:pianogroove drop-2-voicings;
corpus:piano.org/theory/drop-2-voicings; corpus:voicinglab.com/learn/voicing-styles]:

- **Rootless** — omit the root, "often substituting it with the 9th"; the tones
  used are **3rd, 5th, 7th, 9th**. Popularised by Bill Evans, Red Garland,
  Wynton Kelly. Haerle's **A voicings build up from the 3rd, B voicings from
  the 7th**. *Directly applicable here: this program already has a separate
  bass part playing the root, which is exactly the condition rootless voicings
  were invented for.*
- **Drop 2** — "the second note from the top of the block chord is dropped to
  the bottom", same chord, "a more open, spread texture". "In practical piano
  comping, Drop 2 covers 80% of the territory."
- **Drop 2 & 4** — drop the second AND fourth voices from the top by an octave;
  "**spans nearly two octaves**". This is the mechanism that reaches §5's own
  two-octave target.
- **Quartal** — built from **fourths**, "modern, open textures", "often use
  extended chords like minor 11 or 6/9". *Note the overlap with §2: min11 is
  three of Pryn's thirteen.*

### The floor: the LOW INTERVAL LIMIT

Spreading a voicing downward has a hard limit and it is physics, not taste —
which puts it in this program's "physics engine" tier rather than the genre
tables.

> "The low interval limit … defines the lowest pitches at which intervals can be
> clearly perceived **without sounding muddy or indistinct**."
> [corpus:sweetwater insync/low-interval-limit]

> "These limits are guidelines for every interval structure and the lowest
> possible position they can be played together **without sounding muddy**."
> [corpus:robin-hoffmann.com/dfsb/low-interval-limits]

Two concrete figures, both from the Sweetwater sheet:

- **A minor 3rd starts to sound muddy below C3/Eb3** — an octave below middle C.
- **"A good rule of thumb is that the top note of any interval (besides 5ths and
  octaves) shouldn't be lower than around E below middle C"** — i.e. **E3
  (MIDI 52)**.

**HONEST GAP:** the full per-interval table exists on both of those pages **as
an image only**, and I could not read it — the PDF at funnelljazz.eu is a
compressed Finale export and robin-hoffmann.com puts the chart in a figure.
So the two numbers above are what is sourced; a complete twelve-interval table
is NOT, and anyone implementing one should either find it in text or derive the
rest and mark them `[GUESS]`. Do not write out a full table from memory and
call it research — that is the exact error class §0 of the handoff names.

---

## 6. WHAT THE SOURCES DO NOT GIVE

Named so nobody re-searches for them and so nothing gets invented in the gap:

- **No source gives a distribution.** Nothing says "42% of lofi chords are
  minor 7ths". Every quality list above is a menu, not a weighting. The
  weights we choose are `[EAR]` until the treebank (§0) is wired.
- **Native Instruments' guide gives almost nothing** despite being the most
  professional-looking source: no modes, no borrowed chords, no tritone
  substitution, no voicing, no register, no loop length. Recorded here because
  a reader who finds it later should know it was already read and was thin.
- **Tritone substitution: not mentioned by ANY source found.** It is standard
  jazz vocabulary and its absence from every lofi source is itself a small
  finding — do not add it on the grounds that "lofi is jazz".
- **No register/octave guidance beyond §5's "two octaves or more"** — nothing
  says where a lofi comp sits absolutely.
- **Rhythm of the comp is out of scope here** and is already measured elsewhere
  (`harvest_accompaniment.py`'s POP909 work, and the roll/inner-voice numbers in
  `NOTES-FROM-THE-USER.md`).

---

## 7. WHAT THIS SHEET SAYS TO BUILD, in priority order

Stated as constraints, per Principle 1, not as values:

1. **Chord quality must be a declarable dimension, not a by-product of stacking
   thirds in the mode.** Everything in §2 depends on it. Without it, none of the
   rest can be reached.
2. **A voicing should be allowed to span two octaves or more** (§5, two
   sources), with the low interval limit as the floor (§5) rather than a fixed
   register band as the ceiling.
3. **Rootless voicings are the natural fit** for a program with a separate bass
   part (§5), and they are what makes room for the 9th and 11th.
4. **The fourth degree's quality decides the mode** (§4) — a genre should be
   able to lean Dorian or Aeolian by weighting that chord, not by changing scale.
5. **Two- and three-chord loops with long holds** are correct for this genre
   (§3) and the program should not be penalised for writing them.

---

## Sources

- [Lo-fi chord progressions: 5 jazzy patterns — Flat](https://blog.flat.io/lofi-chord-progressions/)
- [Lofi Chord Progressions: 13 Easy Ways To Create Authentic Lofi Music — Richard Pryn](https://richardpryn.com/13-lofi-chord-progressions/)
- [Lo-Fi Chord Progressions: 6 Examples and How to Voice Them — Orphiq](https://orphiq.com/resources/lofi-chord-progressions)
- [How to use authentic lo-fi chord progressions — Native Instruments](https://blog.native-instruments.com/lo-fi-chord-progressions/)
- [LoFi Chord Progressions: The 6 Best — Unison](https://unison.audio/lofi-chord-progressions/)
- [Modal Chord Progressions — BeatKey](https://chords.beatkey.app/modal-chord-progressions)
- [Beyond Blues: Dorian vs. Aeolian — Premier Guitar](https://www.premierguitar.com/lessons/beyond-blues-dorian-vs-aeolian)
- [The jazz roots of Nujabes, a pioneer of 'lofi hip hop' — JAZZ.FM](https://jazz.fm/nujabes-jazz-samples-lofi-hip-hop/)
- [Rootless Voicings for Piano: The Complete Guide — Piano With Jonny](https://pianowithjonny.com/piano-lessons/rootless-voicings-for-piano-the-complete-guide/)
- [Drop 2 Voicings Tutorial — PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/drop-2-voicings-tutorial/)
- [Drop 2 Voicings: The Big Band Sound on Piano — piano.org](https://piano.org/theory/drop-2-voicings/)
- [Jazz Piano Voicing Styles — Complete Guide to All 16 Types — VoicingLab](https://voicinglab.com/learn/voicing-styles)
- [Low Interval Limit — Sweetwater](https://www.sweetwater.com/insync/low-interval-limit/)
- [Low Interval Limits — Robin Hoffmann](https://www.robin-hoffmann.com/dfsb/low-interval-limits/)
- [Jazz Harmony Treebank — DCMLab, EPFL](https://github.com/DCMLab/JazzHarmonyTreebank) (the corpus §0 says should replace most of this sheet)
