# THE WASHTUB BASS, `2026-08-17`

*The owner: "And the bass — what about the washbucket bass? Or a two string bass
played with a slide?"*

They were right, and this file had already said so before they asked: §7b of
`playing-the-hobo-band.md` calls the washtub bass **"a sibling of the diddley
bow — same lineage, same people, same decade"** and named it as an instrument to
build. It never got built. (Task #114.)

This sheet exists because the sourcing lived only in a code comment, which is
the wrong place for it.

---

## 1. IT IS ALSO THE ANSWER TO A MEASUREMENT

Not only to a wish. Rendered through `probe_stems`, three windows on two seeds,
the bass this replaced came back at:

| | |
|---|---|
| `MISSED(A)` — how much quieter the mix gets, A-weighted, without it | **−0.12, −0.11, 0.00 dB** |
| RMS-to-A-weighted gap | **9.4–10.7 dB**, the largest of any part |
| note length | 7.5 s — a sustained pedal |

**Take it out of the mix and the audible level does not change, or goes *up*.**
Ten decibels of what it made sat below where hearing is: headroom spent,
nothing returned.

A washtub bass is the opposite of that in every respect the measurement
complained about — short, plucked, percussive, and up where a small speaker can
find it.

---

## 2. WHAT THE SOURCES GIVE

- **One string over an inverted metal washtub "as a resonator"**, tub 18–30
  inches across [corpus:wikipedia *Washtub bass*; corpus:grokipedia]
- **The pitch is tension, not fingering**: *"pitch is adjusted by pushing or
  pulling on a staff or stick to change the tension"* [corpus:wikipedia;
  corpus:handwiki]
- **Range**: *"approximately an octave to an octave and a half in the low bass
  register, with a plucky, twangy timbre suited to rhythmic accompaniment"*
  [corpus:grokipedia]
- **Its job in a jug band**: *"a propulsive root-note bass line"* and *"a
  percussive, thumping rhythm that anchors the overall tempo"*
  [corpus:grokipedia]
- **Technique**: *"plucking the string with the fingers, using a pick or slide,
  and slapping or thumping the string"* [corpus:audiolover]
- **Ancestry**: the earth-bow / ground harp of West and Central Africa
  [corpus:grokipedia]

### 2a. AND WHAT THEY DO NOT GIVE

**Not one source states a decay time, a frequency, or a spectrum.** Every number
in the voice is therefore `[CHOSEN]` from the described behaviour, and is marked
as such in the code. Saying so is the point: the shape is sourced, the constants
are not.

---

## 3. HOW IT IS BUILT

**The diddley bow's model, re-proportioned.** Same Karplus-Strong string — a
delay line with a lowpass in the feedback — because the sources describe the
same object: one wire, homemade, plucked. This file already argued that case for
its sibling.

What changes is everything the tub does to it.

| control | what it is | why |
|---|---|---|
| `THUMP` | the string striking the rim | *"slapping or thumping the string"* is named technique, not an effect |
| `TUB` | the resonator | an 18–30 inch box of air is the instrument's other half |
| `PULL` | the note arriving from under | the pole bends the pitch in — pitch **is** tension, so a note cannot start already in tune |
| `TONE` | the hand damping | a rope player stops the note; it does not ring out |

### 3a. THE TWO LAWS IT DECLARES

**`range: [28, 46]`** — MIDI E1 to A♯2, an octave and a half, straight from the
sourced range. A player reaching past that is fighting a rope.

**`play: { poly: 1 }`** — one string, one rope. The same law the diddley bow
declares and for the same reason: it is not a preference, it is what the object
can do.

---

## 4. WHERE IT PLAYS

Boxcar synth's bass pool, weight 5 against the contrabassoon's 3 and `auto`'s 2
— **drawn in 31 of 60 records**, which makes it the genre's usual bass rather
than an occasional colour.

Its three playing knobs are ridden by the genre's motion table. Its three **pan**
knobs deliberately are not, and the motion table says why: the genre's own cited
mixing law keeps the bass mono — *"keep drums, bass and lead vocals centered…
below 60–100 Hz should be mono"* [corpus:waves; adsr] — and a washtub tops out
at MIDI 46, which is 116 Hz.

---

## 5. WHAT IS NOT DONE

- **The two-string slide bass** the owner offered as an alternative is not built.
  The washtub was the better answer to the measurement (it is percussive where
  the old bass was sustained), but the slide bass was a real suggestion and it is
  recorded here rather than quietly dropped.
- The `pk`/level relationship to the rest of the band has **not** been measured
  by rendering the way the washboard's was. Task #126 remains open for exactly
  that.

---

## SOURCES

- [Washtub bass — Wikipedia](https://en.wikipedia.org/wiki/Washtub_bass)
- grokipedia, *Washtub bass* — range, timbre, its role in a jug band, ancestry
- handwiki — the tension/staff mechanism
- audiolover — technique
- `docs/genre-research/playing-the-hobo-band.md` §7b — the sibling argument, made
  before the instrument was asked for
- `docs/genre-research/stereo.md` and the `panControls` note — the mono-bass rule
