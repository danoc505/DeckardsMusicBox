# PLASTIKMAN & MINIMAL TECHNO — the deep dive

*2026-08-03. The user: "it is time for Plastikman and Minimal Techno deep
dive research because that is the genre that needs all of this the most."
Right — the stereo work, the matrix and the field were all built with this
record in mind and none of it was researched against the record itself.
Fresh sources per the rules; the earlier passes do not count.*

## Sources

1. Sound On Sound, "Classic Tracks: Plastikman *Consumed*" (fetched in
   full) — a gear-by-gear teardown with Hawtin quoted throughout
2. Crack Magazine, "Richie Hawtin's *Consumed* paved new roads for minimal
   techno"; DJ Mag, "*Consumed* remains a masterclass in dark, minimalist
   techno"; Wikipedia, *Consumed* (via search)
3. Already in the corpus: the "year of subtraction" framing, underdog on
   cutting to create space, attackmagazine on dub-techno sends

## 1. THE SENTENCE THIS WHOLE GENRE IS BUILT ON

> **"The space between the sounds and beats defines the music that it's
> surrounding. If there's no space between everything, it just becomes
> noise."** — Hawtin

And the album's method, in his own words: *Consumed* "wasn't about
accentuating the machines... it was about leaving something more like
**aftereffects and shadows of sound, emphasizing delays, reverbs and
effects more than anything else**."

That is a genre whose SUBJECT is the effects, not the parts. Which is why
this is the right genre to have been building a matrix, a room and a
stereo field for — and it is also the standard those three now have to
meet.

## 2. THE GEAR, and it says something we cannot ignore

| role | what it was |
|---|---|
| sequencing | TR-909 (as SEQUENCER, not sound), four Doepfer MAQ16/3 → nine CV/MIDI 16-step sequences |
| sound | Serge modular (STS/Rex Probe), SH-101, TB-303, TR-808, Kawai XD-5, Korg Wavestation, Akai S3000 |
| desk | Allen & Heath GS3000 |
| **effects** | **Lexicon PCM90, Roland SRV-330 "Dimensional Space", Ensoniq DP/4, Yamaha SPX90, ART Multiverb** |

**FIVE effects units, one of them a four-way PARALLEL processor.** This
program has ONE room and ONE echo. That is the single biggest structural
gap between what we have and what this record is, and it is a matrix
question: five destinations is what a matrix is FOR.

The melody is worth its own line, because it contradicts how our stage 3
thinks: *"The melody was just a tom/conga sound from the Kawai drum
machine, which I slowly opened up and closed through a Serge filter with a
lot of effects."* **The tune was a drum played through a filter.** In this
music the distinction between a percussion voice and a melodic voice is
not a given.

## 3. THE ARRANGEMENT MOVE, and we do not have it

> "I'd let all the effects play, and then **in one set instantly turn off
> the effects, and then eight bars later turn them back on**."

Done with the desk's **MIDI mute automation**. Two things follow:

- It is a **SNAPSHOT**, recalled instantly — the Erica's pattern memory and
  our own field presets, used as the arrangement itself. This is the
  strongest possible evidence for the `stage`/scene direction.
- It is a **HARD CUT, not a glide.** Everything the conductor does in this
  program ramps: `section` steps interpolate, `lfo`, `arc` and `gesture`
  are all continuous. **There is no mechanism in this file for "all
  effects OFF for eight bars, then back".** That is a real, sourced,
  missing motion kind — call it a `snap` or `mute` — and it is this
  genre's signature gesture.

## 4. "AN ALBUM OF FEEDBACK" — and the honest tension

> **"The album is an album of feedback. Everything was cross-modulating
> everything else."**

This is the genre built on exactly the thing I removed from the matrix:
the room→echo crossing, taken out at `2026-08-03c` because a cycle in the
WebAudio graph destroys render repeatability. **The removal stands** — Law
7 is not negotiable — but this quote says the capability is not optional
for this genre, and it names the route back: feedback inside a WORKLET is
arithmetic, not a graph edge, and is deterministic (proven: the FDN room
renders bit-identical). **Cross-modulation for this genre belongs in
worklet DSP.** Recorded as the design, not built.

## 5. Other measurable facts, for whoever tunes this genre next

- **Recorded LIVE to 2-track DAT**, one take, per track, on separate days.
  The title track: *"I left all the machines running... recorded it the
  next morning... everything was recorded live and in one take."*
- **Shuffle at 3 on the 909 — "so it's just slight"** — plus *"triplet
  delays to give a different kind of syncopation."* Our groove tables
  should be checked against that pairing: a small shuffle and a triplet
  ECHO, not a heavy swing.
- **Cyclical five- and twelve-note patterns** "all kind of moving and
  opening up filters at certain times" — polymetric cycles against the
  bar, which our `bassPulse`/`acidLine` cycles gesture at.
- **Hardware tempo drift kept on purpose**: *"these slight fluctuations...
  you can feel somehow. That gives your music a bit of its own heart."*
- A resonance artefact at 10:00 was **kept** because it sounded good.

## What this changes, ranked

1. **A `snap` motion kind** — instant, hard, on a bar boundary, holding N
   bars. Sourced by Hawtin's own description; the one gesture this genre
   is known for that this program structurally cannot make.
2. **More than one effect destination.** Five units on the record; one
   room and one echo here. The matrix already has the columns mechanism —
   destinations are a declaration.
3. **Cross-modulation, in a worklet**, when there is a reason to build it.
4. Groove: verify shuffle-3 + triplet delay against our tables.

None of it is built. This document is the specification.
