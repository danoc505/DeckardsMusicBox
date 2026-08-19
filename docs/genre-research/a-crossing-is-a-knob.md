# A CROSSING IS A KNOB, NOT A SWITCH

*Built 2026-08-19, build `2026-08-19g`. Three owner questions in a row, each one
finding the layer under the last: "why would we have shut cells?" → "why are the
fx knobs not open and automated — isn't the point of the matrix to create novel
combinations by rerouting?" → **"you say it's a 0 or 1 more than once, what do
you mean, and is this the correct way for this to be set up?"***

It was not.

---

## 1. WHAT "0 OR 1" MEANT

A genre declared its routing as a **list of names**:

```js
space: { feeds: ["keys", "lead", "bass", "drone"], echoFeeds: ["keys", "lead"] }
```

and `routeBaseFor` turned membership of that array into a send level:

```js
dest === "Spring" ? (feedsOf("Spring").indexOf(b) >= 0 ? 1 : 0) :
dest === "Flange" ? (feedsOf("Flange").indexOf(b) >= 0 ? 1 : 0) :
...
```

In the list meant **full send**. Out of it meant **silent**. There was no third
answer anywhere in a 98-cell grid.

**And the tell was in the same expression.** The room's own MIX crossing already
carried `space.wet` — 0.16, a real number — because the moment a level was
genuinely needed, one got added *as a special case for one cell* rather than the
model being fixed. One cell of ninety-eight knew what a knob was.

---

## 2. WHAT IT COST — four things, all measured this session

**1. It is why the desk was shut.** Of 48 automatable crossings a genre opened
three to six. Of course it did: if the only settings are DRENCHED and DRY then
dry is the honest answer for a boom-bap kit.

```
  before      lofi 3     synthwave 5    dungeonsynth 6    boxcarsynth 4
```

**2. It made the fx-to-fx lattice unusable.** `echo → spring` at 1.0 is one
effect feeding another at full strength — a wash, and in a feedback path a
runaway. Those crossings did not just need opening, they needed levels.

**3. It crippled the automation, and this was found by being bitten.** Motion is
an **offset added to the base**, so on a base of 1 an LFO can only go *down* and
on a base of 0 only *up*. The matrix axes built the day before had to invent an
`off` term to duck from the top rather than clip against it. Every crossing's
automation was one-sided and **which side was decided by which of two values it
happened to sit at.** A knob at 0.4 moves both ways — that is the entire reason
to have a knob.

**4. The machine already supported levels; only the tables did not.** Two lines
below the binary code sits `clamp(base + TRIM["matrix." + cell.k])` — the hand's
own trim, continuous. **A person at the panel could set 0.37 with a finger and
the program could not say it.** The panel *draws a knob* at every intersection.
The model was writing a cheque the picture had already cashed.

---

## 3. WHAT WAS BUILT

A feeds entry is now **either a name or a pair**:

```js
feeds: ["keys", "lead", ["drums", 0.10], ["bass", 0.18]]
```

A bare name still means 1.0, so **every table written before today produces
bit-identical routing** — this is a widening, not a change. Verified: 248
crossings across four genres, identical to the decimal.

**And it is one function now.** `routeBaseFor` and `routeOpen` each carried
their own copy of these rules. The file's own comment records what that cost
last time: *"a probe that kept a copy reported the ROOM as fed by two genres when
all seven feed it, because the copy read `space.feeds` and missed the two rows
this opens by default."* `routeLevel` is the single owner; `routeOpen` is one
line — *is the level above zero*.

One thing the pairs made possible that names could not: **a genre may now dial
the defaults DOWN.** The Room is open to keys and lead whatever a genre says;
before, a genre naming them could only repeat itself. `["keys", 0.4]` is a new
sentence.

### The levels declared

```
  lofi          drumsRoom 0.10   bassRoom 0.06   keysEcho 0.10
  dungeonsynth  drumsRoom 0.35   bassEcho 0.12
  boxcarsynth   drumsRoom 0.12   bassRoom 0.08   keysEcho 0.10
                worldRoom 0.55   railRoom 0.45   railEcho 0.22
  synthwave     — declares none, unchanged to the decimal
```

**Boxcar's `world` and `rail` are the half-made fix, finished.** Those rows were
created so a river and a steam whistle could reach a reverb — and then no genre
named them in `feeds`, so they still could not. A place and a locomotive are the
two things in that record that are FAR AWAY, so they take more room than the
band does.

```
  after       lofi 6     synthwave 5    dungeonsynth 8    boxcarsynth 10
```

### And the axis LFOs had to learn proportion

The row and column modulators were written the day before against a world where
every open crossing sat at exactly 1. A 0.18 duck on a 0.06 send is a **300%
modulation that spends half its cycle clamped shut** — a gate, not a breath. So
an axis depth is now a fraction of the level the genre set, which is what an
attenuator on a send bus is. A crossing at 1.0 moves exactly as far as before.

```
                crossings moved by an axis     before → after
  lofi                    50 → 98      rows: + drums, bass
  dungeonsynth           110 → 147     rows: + drums
  boxcarsynth             72 → 175     rows: + world, rail, drums, bass
  synthwave                0 → 0       declares neither, untouched

  crossings ever driven to silence by an axis: 0 of 420
```

---

## 4. THE PLATES — challenged, re-measured, KEPT

The 15 "order" plates (`roomEcho`, `springRoom`, `flangeEcho`, …) rest on one
measurement: *a cycle costs the renderer its repeatability, −35 dB vs −115
between repeat renders*. That was taken on a **ConvolverNode** room. The room is
an **FDN worklet** now, whose own comment says the opposite — *"it CAN BE FED …
inside a worklet the feedback is a line of arithmetic, not a graph edge, so it is
deterministic by construction … repeat renders of the FDN are bit-identical
(−316 dB)."* A refusal resting on a machine the program had replaced.

**So it was re-measured rather than argued.** `roomEcho` unplated, dungeon synth
feeding the echo from the room at 0.35 against an `echo.verb` of 0.5 — a real
graph cycle at loop gain 0.175 — rendered twice at seed 1, nulled against a
twice-rendered control with no cycle:

```
  control, no cycle    -89.9   -90.3   -90.8   -91.2   dB below signal
  cycle patched        -89.8   -89.8   -69.3   -38.5   dB below signal
```

Two sections came back at the floor and two did not, and **−38.5 is the original
figure to within three dB.** Confirmed the worklet does load in the render
context, so this was the FDN and not the fallback.

**The plates stay** — and the reason is now stated correctly rather than by the
wrong machine. What the FDN made deterministic is the feedback **inside** the
worklet: arithmetic on a sample. A cycle through the **graph** is a different
object — it crosses AudioNode boundaries, and Chromium's 128-sample render
quantum and its ordering of a loop are what vary. The worklet fixed the room's
own tail, not the graph's topology, and the old comment blurred the two into one.

### And the novel effects never needed those fifteen

The **forward** half of the lattice is not plated at all:

```
  echoSpring  echoFlange  echoDP4  echoBarber
  roomSpring  roomFlange  roomDP4  roomBarber
  springFlange springDP4  springBarber
  flangeDP4   flangeBarber dp4Barber          — 15 crossings, all knobs today

  opened by any genre: 0
```

The re-routing this machine exists for is **not missing, it is unused.** That is
a genre-research job, not a plate to lever off — and it is only now *safe*,
because one effect feeding another at 1.0 is a wash and at 0.15 is a colour.

---

## 5. THE POLE COLUMN WAS FALLING OFF THE PHONE

Reported with a screenshot: on a narrow screen the POLE column (G) is cut in
half by the right edge — knobs drawn, unreachable, its OUTPUTS jack clipped.

The grid has a natural width and a phone does not have it. Squeezing it was not
an option: *the POSITION of a knob is what tells you which two things it
connects*, which is the whole reason this panel is a grid. So it **scrolls** —
the grid keeps its true size and the panel gives it a window, which is what a
rack does when the module is wider than the case you are looking through.

---

## 6. WHAT IS NOT BUILT

- **The 44 dead fx knobs.** Measured the same day: of 56 controls on the effect
  units, 44 have never moved in any genre in any record — DP/4 12, comp 6,
  flanger 4, resonator 4, spring 3, tape 4, all at zero. **16 of them are
  already ridden every song by `rideBus` and need only a genre motion line.**
  Nothing here touched them.
- **The 15 forward lattice crossings**, above.
- **Nobody has heard any of it.**

---

## Sources

- the program's own `routeBaseFor`, `MATRIX.none` and the FDN room comment — quoted above and re-measured against
- `docs/genre-research/the-matrix-axes.md` — the row and column modulators these levels feed
- `docs/genre-research/lofi-noise.md` §6b — the vinyl row's five plates, which are not in question
