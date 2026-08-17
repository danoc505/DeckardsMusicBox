# THE WASHBOARD — the texture the freight yard had none of, `2026-08-17`

*The owner: "lets get the fiddle, the jug and the washboard" — and, when the
first attempt started synthesising instead of searching: "Before you fake it try
harder to find open source free samples."*

---

## 1. IT WAS SYNTHESISED FIRST, AND THAT WAS THE ERROR

The version that stood in the file built a scrape out of eighteen jittered noise
ticks and a ridge count marked `[CHOSEN: 18 ridges to a stroke, from a
photograph of a standard board]`.

The Philharmonia percussion pack has three real washboard scrapes, and they came
down **in the same fetch as the violin**. The owner's correction applied to both
instruments; only one of them was fixed at the time. This is the other one.

---

## 2. WHAT THE THREE RECORDINGS ARE, MEASURED

Decoded from the shipped bank and measured — length, transient count, peak:

| take | length | ridge-ticks | ticks/sec | peak | what it is |
|---|---|---|---|---|---|
| `wb2` | 0.32 s | 48 | **150** | 0.125 | the fast, angry stroke |
| `wb0` | 0.48 s | 47 | **98** | 0.107 | the ordinary one |
| `wb1` | 2.20 s | 126 | **57** | 0.168 | a long slow **phrase** |

All three sit around **5 kHz** spectral centroid.

### 2a. AND THAT IS A REGISTER THIS KIT COULD NOT REACH

The freight kit's own sounds, same measurement:

```
tkKa       1574–2823 Hz
tkStick     469– 788 Hz
tkTomHi     546– 782 Hz
tkMid       159– 307 Hz
tkBig       180– 296 Hz
tkLow       163– 198 Hz
```

The board is roughly **an octave and a half above anything else in the yard**,
and — unlike every one of them — it is *continuous* rather than an event. A drum
is a moment; a scrape is a texture. That is the whole reason to want it.

---

## 3. A WASHBOARD PLAYER DOES NOT GET LOUDER, THEY GET FASTER

This is the design decision the measurements force, and it is why the board is
**not** built on the taiko's voice.

The taiko's three takes are a *soft*, a *median* and a *loud* stroke: their
relative level is the information, so that voice picks by gain and restores each
take's recorded peak. The washboard's three takes differ by **57 to 150 ridge
ticks a second** — the axis is hand speed, not weight.

So the take is chosen **by room first and weight second**:

- a stroke with real room in it (over 0.9 s) gets **the phrase** — the only one
  of the three that *is* a phrase, and it needs the time;
- everything else picks between the two short scrapes by the stroke's own
  weight.

**`pk` is deliberately not restored.** All three were recorded quiet — peaks of
0.107, 0.125 and 0.168 of full scale — and honouring that put the board **38 dB
under the kit**, measured. That is a recording engineer's gain staging from 2005
making an arrangement decision in 2026. The take is chosen above; the level is
one number, measured against the kit.

**The rate wobble is smaller than the drums'** — ±20 cents against the taiko's
±35. Resampling a scrape moves the tick rate *and* the ridge ring together, and
only the first of those is a hand.

---

## 4. WHERE IT PLAYS, AND WHY THE LANE WAS EMPTY

The board takes the **ride** lane of the freight kit. A ride is the lane that
keeps time continuously underneath, and in the band this genre is named after
that job belongs to a washboard — there is no metal in a hobo band except what
the yard supplies.

**MEASURED FIRST: the ride lane fired ZERO times in 30 records.** Mapping the
kit alone would have changed nothing — the genre also has to *ask*:

```
rideEvery: 4, rideFrom: 2, rideVel: 0.36
```

That is steps **2, 6, 10, 14** — exactly the half of the grid the deep drum left
empty when `hatEvery` went from 2 to 4 to answer *"the stick is to high pitched
to be played so much"*. The two lanes interlock rather than compete, and they
cannot mask each other: one is 163 Hz and the other is 5 kHz.

After: **1.92 board strokes a bar**, against the deep drum's 2.23.

---

## 5. THE LEVEL, MEASURED AGAINST THE KIT AND NOT CHOSEN

Rendered, boxcar seed 3, 24 s, each lane alone:

| | first try (×6.4) | shipped (×1.3) |
|---|---|---|
| the whole kit | −25.7 dB | −30.9 dB |
| deep drum (the pulse) | −31.8 dB | −31.8 dB |
| **the washboard** | **−27.1 dB** | **−40.6 dB** |
| board relative to the pulse | −4.7 dB | **−8.8 dB** |
| board relative to the whole kit | **+1.4 dB** | −9.7 dB |

The first constant made the timekeeper **louder than everything it was keeping
time for**. The shipped one puts it where a texture belongs: audible underneath,
not a part you follow.

---

## 6. THE JUG IS BUILT AND NOT WIRED

The owner: *"Forget the jug for now."* `V.jug` stays in the file — the Helmholtz
physics in its comment is correct and re-deriving it later is wasted work — but
no pool draws it and the comment above it says so plainly. A built voice nothing
reaches is dead config unless it admits to being dead config.

---

## SOURCES

- philharmonia.co.uk/resources/sound-samples — the recordings and the licence
  (free to use in your own work; not to be resold as samples)
- `docs/genre-research/playing-the-hobo-band.md` — the board as the band's
  timekeeper
- every number above is measured from the shipped bank or from a render;
  `rideEvery`, `rideFrom`, `rideVel` and the level constant are [CHOSEN] and
  then measured
