# WHEN THE WHOLE SCALE MOVES

*Researched and built 2026-08-08. The user: "Work on the 5 things you mention,
make sure to do web research no guessing. Do all 5, start with the first and
work your way down."*

Item 1 of the five in `static-harmony-and-evolution.md` §4:

> **The mode never changes inside a song.** "So What" moves its whole scale
> twice in 32 bars. Nothing here can. This is the single largest structural gap
> for every genre that removes functional harmony.

---

## 1. THE SOURCES, AND THEY DISAGREE IN A USEFUL WAY

Two modal tunes, the same composer, fourteen months apart, and they make the
move with **different settings**.

> "The song's modes consist of **G Dorian for 16 bars, A Aeolian for another 16
> bars, and then back to G Dorian for the last eight bars**, then the
> progression repeats."
> — [Wikipedia, *Milestones (instrumental composition)*](https://en.wikipedia.org/wiki/Milestones_(instrumental_composition)), fetched and read directly

> "sixteen bars of D Dorian, **eight bars of E-flat Dorian**, and then back to D
> Dorian for another eight"
> — [Wikipedia, *So What*], corroborated by Ethan Hein — "The A sections use the
> D Dorian mode … **The B section is up a half step, on E-flat Dorian**" — a
> source this repo already trusts for the Amen break and the Dilla feel.

So the device has **two independent parts**: how far the tonic moves, and
whether the scale moves with it.

  | | tonic moves | mode | notes the two scales SHARE |
  |---|---|---|---|
  | **Milestones** | +2 (G→A) | Dorian → Aeolian | **6 of 7** (only B♭ vs B♮) |
  | **So What** | +1 (D→E♭) | Dorian → Dorian | **2 of 7** |

That table is the whole design. The two attested settings sit at opposite ends
of the same dial: Milestones is nearly invisible, So What is a jolt. A genre
whose entire method is that almost nothing changes wants the top row, which is
why `+2` carries most of the weight below and the semitone is the rarer move.

**Both come back.** Neither tune leaves and stays gone.

## 2. WHY THIS GENRE AND NOT THE OTHERS

Declared on **minimal techno** and **dungeon synth** — the two genres in the
file whose harmony genuinely does not move. Minimal techno's own bridge table
said so in as many words before this build:

> `bridgeProgressions: { minor: [[[0,0,0,0], 1]], … }`
> `/* there is no departure. Same drone, so C cannot leave home. */`

One chord, the tonic, four bars. The departure section could not depart. That
is the hole, and it is the measured half of the user's verdict that the genre
"fails to capture the slow evolving nature of minimal techno".

**Not the other six, and each for a reason.** lofi, acid, jungle, synthwave and
VGM have functional changes already — the device is the answer to harmony that
does *not* move. Blade Runner was the close call: its bass is a drone and it is
modal, but it already carries `harmony: { style: "plr", chance: 0.30 }`, a
chromatic mechanism that leaves the key on its own terms. Giving it two would
be two answers to one question. **That is a judgement, not a measurement, and
it is the user's to overrule.**

    keyShift: { chance: 0.55, by: [[2, 5], [1, 2]], change: 0.40 }   // minimal techno
    keyShift: { chance: 0.30, by: [[2, 4], [1, 3]], change: 0.25 }   // dungeon synth

**The mechanism and the two `by` settings are [corpus]. The weights are a
judgement and nothing has heard them.**

Where a changed mode comes from is **derived, never listed**: it is drawn from
the modes that genre has already written a bridge progression for. A genre can
only be moved into a scale it has real changes for, and nothing can go stale
because the list *is* the table.

## 3. THE FIRST BUILD DID NOT REACH, AND THE MEASUREMENT SAID SO

Built on the bridge alone — which is where both sources put it, the B section
of an AABA — it fired and was **not heard**:

```
                          records that     ...that actually    share of
                          changed key      PLAYED it           ALL bars
  minimal techno            171/300           37/300             0.8%
  dungeon synth             100/300            0/300             0.0%
```

Because a bridge is an **optional** section here: minimal techno arranges one in
21% of its forms, dungeon synth in **4 of 300**. A harmonic event nobody hears
is not a harmonic event.

**And the sources do not put it in an optional section either.** "So What" is
AABA and Milestones is AABBA — the moved section is part of the tune, played on
every chorus of a ten-minute performance. Scaled to a record rather than to 32
bars, that shape is: the main material, restated in the new key, for a stretch
in the middle, and then home.

So the main material is **built twice**, at stage 3, with the same stream names
— same draws, same decisions, so what comes out is A *restated*, not a second A
— and stage 4 chooses which of the two each section plays. Every pitch is still
final at stage 3. Measured note for note: rhythm identical, every part a clean
+2, on every role.

```
                          records that     ...that actually    share of      mode also
                          changed key      PLAYED it           ALL bars      changed
  minimal techno            171/300          171/300           15.6%           63
  dungeon synth             100/300           96/300            5.3%           17
  the other six               0/300            0/300            0.0%            0
```

15.6% of *all* bars is **27% of the bars of a record that moves** — against So
What's 8-in-32, which is 25%.

## 4. WHAT IT BROKE, WHICH IS THE INTERESTING PART

A key change is a good test of whether a program really knows what key it is in.
It turned out that **eleven places counted scale steps against the SONG's tonic**
while claiming to count them against "the key" — the bass's chromatic approach
and octave walk, the comp's inner-voice neighbours, six reaches in the tune, the
counter's intervals. Every one of them was correct for exactly as long as a song
had one key. They now ask the chords they were handed.

The seam check found each of these by throwing, which is the argument for a
check that throws. It also found the two that mattered musically:

- **the ostinato was left behind.** Material C kept A's figure while the section
  moved out from under it. It is re-stated in the new key now — the same cell,
  because the cell is the record's identity, and moving the material bodily is
  what the sources' bands actually do.
- **the check itself was asking the wrong key**, which would have condemned a
  section that was behaving perfectly *and* passed a note that was genuinely
  wrong in the section's own scale. Both directions, one cause.

Two hand-written lists of "the materials" — one in the freeze pass, one in the
seam check — were replaced by asking the song what it holds. The comment beside
one of them already recorded that it had forgotten `Bvar` once.

**And it exposed a shipping defect that has nothing to do with any of this.**
The acid line's octave-down step could reach a whole octave below the register
its genre declared. Measured against the previous build over 300 seeds a genre:

```
  acid        420 notes below MIDI 24 (32.7 Hz), on 21 of 300 seeds, lowest 21
  minimal     108 notes below MIDI 24,            on  5 of 300 seeds, lowest 19
```

The floor written into the drone's octave-down years ago was never put under the
acid line's. It is now. **This moves acid on 19 of 300 seeds** — a genre that
asked for nothing — and that is a real cost, stated rather than buried: the
notes it moves are notes nobody could hear, folding up an octave (A0 → A1), and
the 303's accent and slide pattern follows because both read pitch. I first
wrote in the code that no genre reached below the floor today; **that was wrong,
and the numbers above are the correction.**

## 5. WHAT THIS DOES NOT SETTLE

- **Nothing here has a verdict.** Every number above says the device exists,
  fires, and is legal. Whether a minimal techno record is better for changing
  key a third of the way through is not a thing measurement can answer.
- **The window is structural, not drawn.** Sections whose middle falls between
  0.40 and 0.67 of the record play the lifted copy. That is AABA read at the
  length of a record, and it is one departure and one return — where the sources
  restate theirs on every chorus. Whether it should recur is a taste question.
- **A record whose middle is a chorus does not move**, because B and the bridge
  have no lifted copy. That is deliberate — a chorus already has its own changes
  — but it is why dungeon synth sits at 5.3% rather than higher.
- **Blade Runner was left out on my judgement**, not on a measurement.
