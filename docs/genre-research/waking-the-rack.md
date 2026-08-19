# WAKING THE RACK — the dead fx knobs, and three genres that earned a machine

*Built 2026-08-19, build `2026-08-19h`. The owner: "what about the fx knobs? Why
are they not open and automated also? Isn't the point of the matrix mixer to be
able to create novel combinations and novel fx with the rerouting?" — then, when
the measurement came back: **"Ok do the work."***

---

## 1. WHAT WAS MEASURED FIRST

Four genres, 12 records each, every control on every effect unit:

```
  UNIT       knobs   ever moved   never
  echo          7        4          3
  desk          6        3          3
  barber        4        3          1
  medium        6        2          4
  dp4          12        0         12
  comp          6        0          6
  flange        4        0          4
  resonator     4        0          4
  spring        3        0          3
  tape          4        0          4
```

**44 of 56 had never moved in any genre in any record.** Six units — DP/4,
compressor, flanger, resonator, spring, tape — had not one moving knob between
them.

And the 44 split by what it would take:

- **16 are `bus`** — `rideBus` already schedules a curve for them every song.
  **One table line away from being alive, and the line had never been written.**
- **13 are switches** read once per song (`dp4.aAlgo`, `echo.div`, `barber.dir`).
- **15 are per-song voicing** (`spring.dwell`, `tape.wow`, `comp.ratio`).

**But automating a knob on a unit no genre feeds is a knob that moves nothing** —
the defect this file names most often. Of the five return units, lofi, dungeon
synth and boxcar fed **two**: the room and the echo. So the two jobs turned out
to be one job: *route something into a machine, then ride its knobs.*

---

## 2. LOFI EARNED TWO MACHINES, ON ONE SENTENCE

> "A **Fender Rhodes with a phaser effect and spring reverb** produces a dreamy,
> atmospheric lead ideal for lofi beats."
> [corpus:mysticalankar, *Lead Instruments in Lofi Hip-Hop*]

That names this exact instrument, in this exact genre, through **both** units —
and lofi is the first genre in the file to feed either one.

```js
springFeeds: [["keys", 0.22]],
dp4Feeds:    [["keys", 0.30]],
dp4:    { aAlgo: 1, aAmt: 0.42, aLvl: 0.55 },   // algo 1 IS the phaser
spring: { dwell: 1.2, tension: 0.42, tone: 3200 },
```

Levels, not switches, because that is what the sentence describes: a Rhodes
*through* a phaser is still a Rhodes. At 1.0 the dry keyboard would be gone.

### The second reason the DP/4 was silent

`aAlgo` 1 is already the phaser by default. What was never set is **`aLvl`,
which defaults to ZERO** — every one of the unit's four blocks has an output
level of 0 out of the box, so even a fed DP/4 is a silent DP/4. Found by reading
the control table, which is the only way it could have been found.

### And the spring column flipped to `bus`, as its own comment instructed

> "No genre here is dub, and a spring send handed to one would be taste with no
> source — so these crossings are voicing+live … **The day a genre earns one by
> asking for it, its cell flips to `bus` and joins the ridden set.**"

The condition that comment set was **a citation**, not dub in particular. One
arrived. The column is `bus` now, which is what lets the matrix axes ride the
spring send the way they ride the room's.

---

## 3. BOXCAR EARNED A FLANGER, AND THE PLATE CAME OFF ON PHYSICS

The `rail` row's blind plates carried one blanket reason: *"a flanged locomotive
is not a locomotive."* That is right about a synth patch and **wrong about a
passing vehicle**.

> "The comb pattern is caused by two copies of the same exact sound arriving at
> slightly different times, close enough that they form an interference
> pattern… when the peaks and valleys move about it causes a 'whoosh' sound;
> **this is the same principle as in the flanger effect used in music
> production**." — and the same source adds "**even passing cars can produce
> this effect**" [corpus:windytan, *Passing planes and other whoosh sounds*]

The effect's own name comes from this family: *"the comb filter sweeps across
the spectrum with the familiar 'jet plane' effect"* [corpus:wikipedia,
*Flanging*].

A locomotive passing a listener at speed over a ballasted trackbed **is** that
geometry — direct sound plus a ground reflection a few milliseconds behind,
sweeping as the source moves. So `railFlange` is unplated and boxcar patches it:

```js
flangeFeeds: [["rail", 0.35]],
flange: { rate: 0.12, depth: 0.62, fb: 0.18, mix: 0.38 },
```

`rate: 0.12` Hz is one sweep every eight seconds — about the length of a train
going by. `fb` low, because a trackbed is not a resonator. `mix` well under the
unit's 0.9 default, because the whistle has to survive being flanged.

**`world` keeps all four of its plates.** A river does not pass you at speed, so
the ground-reflection sweep has nothing to sweep. The correction is about
**motion**, not about outdoor sound.

---

## 4. DUNGEON SYNTH EARNED NOTHING, AND THAT IS THE RESULT

The sources give this genre exactly what it already has:

> "I use **a single reverb, put in a bus channel with sends from all
> instruments** leading to it, for the whole track, again to simulate the sound
> of a symphony orchestra." [corpus:erichgrunewald, *How I Make Dungeon Synth*]

> "**Long reverbs and modest delay** are used to suggest halls and caverns."
> [corpus:melodigging]

Room and echo — both already fed. The one send that sentence asked for and this
genre did not have was **the war drum's**, and it got one in the same build
(`["drums", 0.35]`): *sends from ALL instruments* is the whole claim.

A flanger here would be taste with no source — the exact mistake the spring
column's comment spent three builds warning about. **It is not made.**

---

## 5. THE TWO KNOBS EVERY GENRE HAD LEFT FOR DEAD

`echo.width` and `echo.hp` are `bus`, ridden every song since the echo landed,
and moved by nothing in four genres.

**`width` defaults to ZERO** — *the delay has been mono in every record this
program has ever made.* `hp` is the high-pass inside the delay loop: the knob
that decides whether repeats keep their bottom or thin as they die, which is the
classic tape behaviour and what distance does to a whistle.

Both now ride on all three focus genres, on an `arc`/`apex` plus a slow LFO —
and the LFOs use the reset trigger built the day before.

### The count after

```
  bus knobs no genre moves:  14 → 8
  woken: echo.hp  echo.width  flange.depth  flange.mix  dp4.aAmt  dp4.aLvl
  still dead: flange.rate  flange.fb  dp4.b/c/dAmt  dp4.b/c/dLvl
```

The remaining DP/4 blocks are drive, leslie and crusher — the source named the
**phaser**, and stacking the other three on one citation would be the thing this
file refuses.

---

## 6. WHAT IT MEASURED

**Open crossings**, from the build before the level work:

```
  lofi          3 → 8     + drumsRoom bassRoom keysEcho keysSpring keysDP4
  dungeonsynth  6 → 8     + drumsRoom bassEcho
  boxcarsynth   4 → 11    + world, rail (room + echo), railFlange, drums, bass
  synthwave     5 → 5     declares none of it, unchanged to the decimal
```

**Audible?** Yes, and this is the first time this session that can be said.
Lofi seed 1 rendered on this build and on the one before it, nulled:

```
  below signal   -12.8  -13.2  -11.2  -12.5  -11.5  dB
```

Against a **−91 dB** repeatability floor, that is ~78 dB above the noise. And it
is colour, not level: RMS up 0.2–0.5 dB, peaks within 0.8 dB, nothing clipping.

**Notes:** 24 records printed against the pre-session build — not one moved.

---

## 7. THE BLEND FAULT, WHICH THIS FILE'S OWN COMMENT PREDICTED WORD FOR WORD

The hour lofi became the first genre to feed a spring, the blend suite went from
1 throw of 108 to **4**, in three pairs that have nothing to do with springs.

`BLEND_DRAW` registers `space.feeds`, `space.echoFeeds`, `space.flangeFeeds`,
`space.dp4Feeds`, `space.barberFeeds` — and **not `space.springFeeds`**, because
no genre had ever declared one, so there was no line and no way to notice there
was no line. The comment sitting directly above that list says:

> "an unregistered list changes how many draws the blend takes, so every draw
> after it lands somewhere else and **the damage surfaces wherever the next draw
> happened to matter**. A new effect column means a new line here."

Registered. **Sixth entry through that door, and the first that was not a new
column but an old one nobody had used.**

### The two throws that remained, and why they are not new

A genre gaining a motion lane shifts the blend's draw sequence — a motion spec
list is a ragged array, which the blend draws rather than merges. So the same
latent faults land at different seeds. Confirmed rather than assumed: hunting the
two failure *texts* across seeds 1–24 on the **previous** build found both,
in the same two pairs:

```
  lofi:25/dungeonsynth  s21   out of key … lead 76 bar 3
  lofi:75/dungeonsynth  s13   out of key … keys2 62 bar 3
  dungeonsynth:50/boxcar s23  collision in Bdev at 7:0:61
  dungeonsynth:75/boxcar s8   collision in Bdev at 0:0:72
```

Same two classes, different seeds. These are pre-existing faults relocating, not
faults created here — and they are still real faults that this file has not
fixed.

---

## 8. WHAT IS NOT BUILT

- **The spring's own three knobs** (`dwell`, `tension`, `tone`) are `voicing` —
  read once per song, ridden by nothing. Lofi sets them and cannot move them.
  Named here rather than pretended about.
- **The 15 forward lattice crossings** (`echoSpring`, `roomFlange`, …) are still
  opened by zero genres. `railFlange` is the first fx-adjacent plate to come off
  on evidence; the return-to-return lattice has had no research at all.
- **The 8 remaining `bus` knobs** and all 28 switch/voicing ones.
- **Nobody has heard any of it.** The nulls prove change, not quality.

---

## Sources

- [Lead Instruments in Lofi Hip-Hop — Mystic Alankar](https://mysticalankar.com/blogs/blog/lead-instruments-in-lofi-hip-hop-a-comprehensive-guide) *("A Fender Rhodes with a phaser effect and spring reverb…")*
- [Passing planes and other whoosh sounds — windytan](https://www.windytan.com/2025/04/passing-planes-and-other-whoosh-sounds.html) *(ground-reflection comb filtering is "the same principle as in the flanger effect")*
- [Flanging — Wikipedia](https://en.wikipedia.org/wiki/Flanging) *(the "jet plane" effect, and where the name comes from)*
- [How I Make Dungeon Synth — Erich Grunewald](https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/) *(a single reverb bus fed by all instruments)*
- [Dungeon Synth — Melodigging](https://www.melodigging.com/genre/dungeon-synth) *(long reverbs and modest delay)*
- [Essential Production Techniques for Lo-Fi Hip Hop — Plugin Boutique](https://www.pluginboutique.com/articles/1788-Essential-Production-Techniques-for-Lo-Fi-Hip-Hop)
- `docs/genre-research/a-crossing-is-a-knob.md` — the levels these routes are expressed in
- `docs/genre-research/the-matrix-axes.md` — the reset trigger these new lanes use
