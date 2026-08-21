# WHAT A PART PLAYS — the plan for making the four acts sound like their genres

*Written 2026-08-21 after the owner said the thing that was true:*

> *"I wrote up doom/sludge/mathcore/prog as though the record now sounded like
> those genres. It didn't. I'd changed timing, tempo, length and deletion — not
> what any part plays."*

> **THE BRANCH IS `claude/orchestrator-mk2-handoff-e8475j`.**
> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Every number below is read off
> `node harness/mk2_score.js --genre fantasysynth --seed 1`, the printout, on
> build `2026-08-21a`. Only the owner can say what it sounds like.

---

## §0 WHAT WAS ACTUALLY BUILT, LISTED SO THE OVERCLAIM IS VISIBLE

| build | what it changed | which of the four things it is |
|---|---|---|
| `setLean` per movement | where a note sits against the grid | **timing** |
| tempo bands per leg | 67–77 / 90–105 / 117–129 / 86–70 | **tempo** |
| the tempo sawtooth fix | one ramp a leg instead of 27 | **timing** |
| `form.stop` | bars of silence at a seam | **length** |
| polymeter at the peak | the ostinato's cycle length | **timing** |
| section lengths per leg | how long each act runs | **length** |
| the carnyx deleted | one instrument gone | **deletion** |
| `bassRoles` + `bassRiff` | **what the bass plays** | ← the only one |

Seven of eight are the owner's four words. **One part out of eight got new
content, and it is the only part of the record that now differs act to act in
what it is playing rather than in when it plays it.**

---

## §1 THE MEASUREMENT — every pitched part, per act, seed 1, build `2026-08-21a`

`ev` = events. `grids` = **distinct bar patterns**: how many different rhythms
that part played across the whole act. A `1` means the part played one shape
and repeated it for the entire leg.

| act | part | ev | pitches | onset steps | %step 0 | lengths | **grids** |
|---|---|---|---|---|---|---|---|
| **doom** 0–104 | keys | 57 | 4 | 1 | **100%** | 2 | **1** |
| | ostinato | 266 | 4 | 4 (0/4/8/12) | 26% | **1** | 2 |
| | lead | 175 | 7 | 4 | 43% | 3 | 7 |
| | bass | 120 | 2 | 1 | 100% | 1 | 1 ← *declared* `drone` |
| **sludge** 104–204 | keys2 | 72 | 4 | 1 (step 2) | 0% | **1** | **1** |
| | lead | 76 | **1** (E5) | 5 | 22% | 3 | 5 |
| | bass | 146 | 4 | 7 | 23% | 4 | **10** |
| **mathcore** 204–356 | keys | 570 | 5 | 1 | **100%** | 2 | **1** |
| | keys2 | 143 | 6 | 1 (step 2) | 0% | **1** | **1** |
| | ostinato | 508 | 6 | 4 (0/4/8/12, **127 each**) | 25% | **1** | **1** |
| | lead | 212 | 9 | 13 | 15% | 4 | 14 |
| | counter | 97 | **2** (D4,E4) | 7 | 42% | 3 | 6 |
| | bass | 275 | 5 | 6 | 30% | 3 | **9** |
| **prog** 356–473 | keys | 288 | 8 | 1 | **100%** | **1** | **1** |
| | lead | 95 | 4 | 3 | 21% | **1** | 4 |
| whole record | drone | **3** | 3 | 1 | 100% | 1 | 1 |

And the harmony, counted off the same printout:

| act | part | distinct chords | over |
|---|---|---|---|
| doom | keys | **2** — `A#3-C#4-E4`, `G#3-C#4-E4` | 19 bars |
| sludge | keys2 | **2** — `E3-A3-C#4`, `F#3-A3-C#4` | 24 bars |
| mathcore | keys | **3** — `A3-D4` ×64, `G#3-C#4` ×32, `G#3-C#4-E4` ×31 | 127 bars |
| prog | keys | **4**, four and five notes each, ×16 apiece | 64 bars |

### What that table says in one line

**Three of the four acts play `keys` as one chord struck on step 0 and held the
whole bar, with exactly one bar-pattern for the entire leg.** `keys2` is one
chord on step 2, one pattern. The fight's `ostinato` is 508 notes over 127 bars
with **one** bar-pattern — four even quarters, 127 of each, byte-identical in
`B`, `Bdev` and `Bvar`. That is a metronome with pitches on it.

So the acts differ in tempo, mode, roster, length and bass. **In every act, the
chordal parts play the same shape**, and a genre is a rhythm and a harmony
before it is a tempo and a timbre.

---

## §2 WHAT EACH ACT'S CHORDAL PARTS ACTUALLY DO — sourced

### §2.1 Doom's comp is the exception, and it is already right

> Keyboards "play a particularly important role in epic doom metal. Keyboards
> (organ, choir pads, mellotron) and choral overdubs are frequently used to
> heighten the monumental feel." Harmony "leans on minor keys… **stately chord
> movements**", with "the emphasis on ominous, minor-key riffs and **sustained
> tones** over speed or virtuosity". [melodigging/epic-doom-metal]

And already in the repo: "power chords, **parallel fourths/fifths, and sustained
unisons** enhance mass"; "**cyclical, mantra-like repetition** with subtle
variation"; "repetitive rhythms **with little regard to harmonic progression**".
[melodigging/doom-metal, wikipedia/Doom metal]

> **Doom's 100%-on-step-0 whole-bar chord and its two chords are what the sources
> ask for.** The fault is not that it does this — it is that it does it *by
> accident*, and so does everybody else. `the-weight-and-the-stop.md` §3.1:
> **"A drone is a decision. A shortage is an accident. They can produce an
> identical pitch-class histogram and they do not sound alike."** Doom's comp
> gets declared, exactly as the doom bass was.

### §2.2 Sludge repeats one figure and lets it breathe

> "Sludge metal riffs often have a **hypnotic quality**, so **don't be afraid to
> repeat a riff and let it breathe**. A single riff can carry an entire song for
> five minutes." "A track may begin with a slow, crushing riff that repeats for
> several minutes. This **builds a trance-like state**." "Rather than following a
> typical verse-chorus structure, many sludge songs **evolve gradually**,
> introducing new elements at a slow pace." [riffhard/how-to-write-a-sludge-metal-song]

So sludge is *a figure*, repeated — **not one chord a bar**, and not a new
figure every bar either. That is a specific, buildable middle.

### §2.3 Mathcore displaces the accent

> "**Angular** guitar riffs are a staple… these riffs often feature unusual
> intervals, **staccato picking, and sudden changes in direction**."
> "**Accent displacement means moving the strong beat within a phrase so the
> pattern feels shifted** — it is how you make a riff sound off kilter while
> still grounded." "Try taking a motif and **repeating it with slight variations
> each time**." [riffhard/how-to-write-math-rock]
> "…complex, often changing rhythms, abrupt transitions, and dissonant guitar
> work… jagged riffs, asymmetric time signatures, **sudden stops**, and
> polyrhythms." [melodigging/mathcore]

**"Accent displacement" is the exact inverse of 0/4/8/12 ×127.** The fight's
ostinato is the single most legible failure in the table, and the source names
the cure in one sentence.

### §2.4 Prog comps with articulation, not with pads

> "Most Hammond organ comping is with voicings containing **fewer notes**,
> although the notes can **spread over an octave**." Vary it with "**long notes,
> short held notes, short stabs, pitch-less pops**… **grace notes and chromatic
> slides**." "**Rhythm is vital and leaving space is a huge part of effective and
> appropriate comping technique.**" [pianogroove/comping-hammond-organ]
> "Progressive rock uses **extended ninths with altered fifths over uncommon bass
> notes**." [guitarwiz]

Prog's *harmony* was built and the printout shows it — four chords of four and
five notes, which is the only act with extended voicings. **Its rhythm was not.**
288 events, one length, one bar-pattern, 100% on step 0: a Mellotron pad where
the source asks for stabs and space.

---

## §3 THE BUILD ORDER

### 1. LIFT THE RIFF WRITER OFF THE BASS — one mechanism, three payoffs

`bassRiff` is **the only table in this file that writes a figure** — a repeating
shape of `grid`, `anchor`, `spice`, `hold`, `strong`, over `bars` bars, that
transposes with the chord. It is built, it is measured, and it works: seed 7's
bass went **1 distinct pitch → 7**, bars holding ≤1 pitch **100% → 28.3%**,
rhythms **2 → 12**.

Everything §2 asks for is a figure. So the first build is not a new idea, it is
the existing one made lane-agnostic: a `riff(table, chord, streamName)` the
`keys` and `ostinato` builders can call, with `bassRiff` becoming its first
caller so the bass's measured behaviour is provably unchanged.

**This is the whole plan's load-bearing step.** Items 2 and 3 are table entries
once it exists.

- **Measurement:** the bass printout must be **byte-identical** before and
  after, all four genres, seeds 1 and 7. If it is not, the refactor is wrong.

### 2. THE COMP GETS A RHYTHM — three acts, and doom declares its silence

| act | what it declares | source |
|---|---|---|
| doom | **stays** whole-bar, step 0 — now written down | §2.1 |
| sludge | one figure, 2-bar cycle, repeated with slight variation | §2.2 |
| mathcore | short stabs, accent off the downbeat | §2.3 |
| prog | few notes, spread over an octave, stabs and space | §2.4 |

- **Measurement:** distinct bar-grids per act, `1 → n`. `%` on step 0 must
  **fall** in sludge/mathcore/prog and **stay 100%** in doom. Print the same
  §1 table again and put it beside this one.
- **Guardrail:** `buildKeys` **throws** when no voicing clears the collision
  seam (`:41647`). A comp that moves is more exposed than a pad. Watch for
  "no keys voicing fits" across the seed sweep.

### 3. THE OSTINATO STOPS BEING A METRONOME

508 events, 127 bars, **one** pattern, in the act whose sources say "angular",
"sudden changes in direction", "accent displacement", "sudden stops". And it is
identical in `B`, `Bdev` and `Bvar` — the developed and varied restatements of
the material play the accompaniment note-for-note.

- **Measurement:** the fight's ostinato grids `1 → n`, and `Bdev`/`Bvar` must
  stop being byte-identical to `B`. Both are printed already; neither needs a
  new probe.

### 4. THE LAST ACT IS FIVE MINUTES WITH THREE PARTS — the biggest hole

`form.roles["the long way home"] = ["keys", "lead", "drone"]`. Read off the
section table:

```
14:42  bars 356-376   86 bpm   Alift    drone                 ← 20 bars, 55 s, nothing but the drone
15:37  bars 376-392   85 bpm   Alift    keys lead drone
16:23  bars 392-408   82 bpm   Alift    lead drone
…
19:46  bars 456-472   70 bpm   Alift    drone                 ← the outro, and it is silence
```

No bass, no drums, no ostinato, no counter, for the final five minutes. The lead
is 95 events, **one length**, four pitches — a four-bar phrase repeated sixteen
times over a four-chord cycle repeated sixteen times.

Prog's own row asks for the opposite: "**dynamic arcs that justify extended
listening**", "textural contrasts", "multi-section suites with **contrasting**
tempos, keys, and textures" [melodigging/progressive-rock]. And
`the-bass-has-a-job.md` §5 already flagged the bass half of this and refused to
assume it: **putting a lane back into a leg deliberately built as ambient at
energy 0.30 is the owner's call, not mine.**

- **This item is a question before it is a build**, and it is asked in §5.

### 5. THE SLUDGE LEAD IS ONE PITCH — a defect, not a genre

E5, 76 events, 100 bars, five bar-patterns. It has rhythm and no melody. Doom's
lead has 7 pitches and the fight's has 9 in the same record, so this is local to
material `C` — the take lookup, the mode collapse, or the `sit` window.

- **Diagnose before proposing.** No fix is written into this plan because the
  cause is not known, and that is the sentence this plan exists to be able to
  write.

### 6. THE DRONE IS THREE EVENTS FOR TWENTY MINUTES

`C#1@0:5860 G#1@0:5860 C#3@0:5860`. Struck at bar 0, still sounding at bar 472.

Doom's source asks for "**drone layers**", "**feedback swells**", "space and
decay", "**strategic silences**" [melodigging/doom-metal]. The repo already has
`how-a-drone-evolves.md` and `the-evolving-drone.md`, and **nothing in the
program reads either.** Same fault class as `bassRoles`: research, then a table,
then no declaration.

### 7. THE DISTORTION UNIT — still owed

Asked for on 2026-08-20 and not built. The sourced constraint is already
recorded and it is a narrow one: doom's production row says "**low-mid heft**,
natural drum rooms, controlled high-end fizz" *before* it says anything about
gain, and `the-four-acts.md` §6 explicitly refused distortion on that ground.
Sludge is where it is actually named — "down-tuned, **heavily distorted**
guitars" [wikipedia/Sludge metal]. Dungeon synth already runs two DP/4 blocks,
one of them "bit reduction and **mild distortion**".

So the unit is a **sludge-act** device with a doom-act restraint, and it needs
its own sheet against `fx-units.md` and `planning-the-fx.md` before a knob
exists. It is last because items 1–3 change what the distortion would be
distorting.

---

## §4 THE TEST, AND IT IS THE ONE THAT WAS SKIPPED

**The §1 table is the test.** Not a render, not a probe, not a summary line:
distinct bar-grids and distinct pitches per part per act, printed before and
after, from `mk2_score.js`.

**No act gets written up as sounding like a genre until its row in that table
has moved.** The tempo, the drag, the stops and the lengths all moved and the
table did not, and that is exactly how the last write-up came to be false.

Byte-identity for `lofi`, `synthwave` and `dungeonsynth` on every step, as
always.

---

## §5 THE QUESTIONS THAT ARE THE OWNER'S, NOT MINE

1. **Does the walk home get its band back?** Five minutes of keys, lead and a
   held drone is the record's ending as declared. Prog's sources want dynamic
   contrast; the leg was designed as the motif dissolving into air. Adding bass
   and drums there is a different ending, not a better-built one. **Item 4 does
   not proceed without an answer.**
2. **Does the outro stay silent?** Bars 456–472 are the drone and one atmos
   event. Same question, sharper: sludge's own source says "end with feedback,
   noise, or a final unison hit for **blunt closure**" — which is the opposite
   of what is there.
3. **How far does mathcore's accent displacement go?** "Off kilter while still
   grounded" is a dial, and the record has to stay one record.

---

## §6 WHAT THIS PLAN DOES NOT PROPOSE

- **Not four different records.** The genre's own guardrail stands: one motif,
  transformed leg by leg, one story.
- **Not odd metres.** Refused twice already on recorded grounds, not
  re-litigated.
- **Not new instruments.** Every item above is what the parts already on the
  page are playing.
- **Not renaming the movements.** Doom, sludge, mathcore and prog are how the
  four legs are *played*.

---

## SOURCES

- Epic doom metal — https://www.melodigging.com/genre/epic-doom-metal
- Doom metal — https://www.melodigging.com/genre/doom-metal
- Doom metal — https://en.wikipedia.org/wiki/Doom_metal
- How to Write a Sludge Metal Song — https://www.riffhard.com/how-to-write-a-sludge-metal-song/
- Sludge metal — https://en.wikipedia.org/wiki/Sludge_metal
- How to Write Math Rock — https://www.riffhard.com/how-to-write-math-rock/
- Mathcore — https://www.melodigging.com/genre/mathcore
- Comping on the Hammond Organ — https://www.pianogroove.com/blues-piano-lessons/comping-hammond-organ/
- Progressive Rock Guitar Chords — https://guitarwiz.app/articles/progressive-rock-guitar-chords/
- Progressive rock — https://www.melodigging.com/genre/progressive-rock
