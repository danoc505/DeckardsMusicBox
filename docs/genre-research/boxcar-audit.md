# BOXCAR SYNTH — a critical audit, 2026-08-16

> **READ THIS FIRST, added `2026-08-17`.** Every comparison table below ranks
> boxcar synth against the **eleven** genres that existed on the day it was
> measured. **Six of those are gone** — blade runner, plastikman, hobbit synth,
> acid, jungle and ambient. The rows are left exactly as measured, because a
> dated measurement is a record and editing it would be falsifying evidence.
> Read "worst of eleven" as what it was: worst of the field at the time. The
> *findings about boxcar synth itself* are unaffected and still open —
> `BACKLOG.md` §0zb has them ranked.

*Asked for: "an audit of the genre. Look at volume and frequency's, drum loops,
automatization, plocks, lfos, use of fx, texture building. Print out midi notes
and critically judge them. Look at the train route, critically analyze it. And
anything else i am missing."*

Measured at build `2026-08-16i`. **Every guard in the battery is green** — route
6/6, journey 11/11, battery 187/2 with both reds known. That is the point of
this document: **the tests pass and the record still has serious problems**, and
the findings below are the ones no existing probe asks about.

Not judged by ear. Every number says what the machine does.

---

## THE FIVE THINGS THAT MATTER MOST

1. **The journey is a metronome.** Every travelling leg is exactly 64 s and
   every town exactly 32 s, in every record.
2. **The apex is the thinnest moment in the record.** Boxcar is the only genre
   of eleven whose note density *falls* from opening to peak.
3. **Only one instrument is actually playing.** The banjo has 64 notes per bar
   against the tune's 5 per four bars, in an overlapping register.
4. **Zero parameter locks.** The engine has them; this genre declares none.
5. **The bass is not a bass.** Six notes in four bars, each three bars long, and
   it re-strikes pitches that are still ringing.

---

## 1. THE TRAIN ROUTE — the worst finding in the audit

`probe_route`, seed 3, 11:44 — the printed timeline:

```
 0:00  intro         STOPPED        32 s
 0:32  verse         running        64 s
 1:36  verse         running        64 s
 2:40  instrumental  running        64 s
 3:44  verse         running        64 s
 4:48  A TOWN        STOPPED        32 s
 5:20  verse         running        64 s
 6:24  A TOWN        STOPPED        32 s
 6:56  bridge        running        64 s
 8:00  instrumental  running        64 s
 9:04  A TOWN        STOPPED        32 s
 9:36  verse         running        64 s
10:40  A TOWN        STOPPED        32 s
11:12  outro         running        32 s
```

**Every leg is 64 seconds. Every town is 32.** Measured across 20 records, the
section lengths have *no variance at all*:

| section | instances | distinct lengths |
|---|---|---|
| verse | 111 | **16 bars, and nothing else** |
| chorus | 60 | **8, and nothing else** |
| instrumental | 54 | **16** |
| bridge | 8 | **16** |
| intro / outro | 36 | **8** |

The terrain planner draws segments with real variety — `farm secs:[35,30]`,
`open secs:[45,45]` — and **none of it reaches the ear**, because what the
listener hears is the SECTION grid, and that grid is fixed. A geography has
distances; this one has a timetable where every town takes the same time to stop
in and every gap between towns is identical.

This is fatal for a genre whose constitution (§2) is *"boxcar synth passes
through places… a boxcar record has a geography"*. It is also invisible to every
guard: `probe_route` asks whether a stop is somewhere and whether the landscape
passes only while moving — both true — and never asks whether two legs are ever
different lengths.

**Second route problem: the stop rate.** Four towns in 11:44 is a stop every
~2 minutes. The chorus IS the town, so the form is verse–town–verse–town at a
fixed rate; the journey's structure and the pop-song structure are the same
thing, which means the journey cannot express "a long run with no towns" or "two
stops close together".

**Third: the weather is a switch, not a system.** In seed 3 it rains from 3:44
to 10:40 — seven of eleven minutes — and thunder appears in six of the ten
segments. `probe_route` proves "the weather starts and stops" across 17 records
and never asks how *much* of a record it occupies.

---

## 2. THE ARC — the peak is the sparsest moment

`probe_arc`, 40 seeds a genre:

| genre | apex at | ev/bar open → apex |
|---|---|---|
| plastikman | 0.87 | 13.8 → **43.3** |
| hobbitsynth | 0.84 | 17.1 → **43.7** |
| synthwave | 0.93 | 42.2 → 47.9 |
| lofi | 0.85 | 20.5 → 26.1 |
| dungeonsynth | 0.85 | 11.6 → 16.7 |
| ambient | 0.81 | 0.5 → 11.4 |
| **boxcarsynth** | **0.93** | **22.8 → 14.5** ⚠ |

**Boxcar is the only genre of eleven where the music gets THINNER toward its
apex.** Every other genre builds; this one empties out.

The cause is structural and slightly ironic: `energy.chorusPeak = 0.72` makes
the TOWN the loudest declared moment, and the town is where the banjo roll stops
(the `ostinato` role is out of `form.roles.chorus`, deliberately — a standing
train has no roll). So the moment the arc calls the peak is the moment the
busiest instrument in the record falls silent. **The declaration and the notes
disagree, and the notes win.**

Also: apex at 0.93 is the latest of any genre, and the end value 0.16 is the
lowest. The record climbs to 93% and then falls off a cliff.

---

## 3. THE NOTES, PRINTED AND JUDGED

Seed 3, bars 17–20 (a verse). This is the whole band in one window.

### The bass — a pedal wearing a bass's name

```
b17 | C1(12.00)  C2(12.00)
b18 | C2(12.00)
b19 | F2(12.00)
b20 | F2(12.00)  C2(12.00)
```

**Six notes in four bars, every one twelve beats long — three bars each.** Two
pitch classes. `bassPedal: 0.4` and `bassWalk: 0.65` are both declared and this
is pure pedal.

Worse: **C2 is struck at b17 for twelve beats and struck AGAIN at b18** while
the first is still sounding. The same pitch re-attacking itself is the exact
defect `probe_repeat` exists to catch; it is not catching this because the
overlap is a held note rather than a repeated onset.

### The tune — five notes, three of them the same

```
b17 | 1.98:D5(1.00)
b18 | 1:D5(0.73)   5.00:D5(1.00)
b19 | 2.02:D#5(0.75)
b20 | 3.99:C5(1.00)
```

**Five notes across four bars: D5, D5, D5, D#5, C5.** Three repetitions of one
pitch, and the whole melodic range is three semitones. Every note is about a
beat long. This is task #113 (the harmonica has no phrases) seen from the other
side — it is not just phraseless, it barely has *pitches*.

### The counter — silent

```
b17-20 | 0 notes
```

The answering line does not play at all in this window. Across 10 records it
manages 174 notes against the lead's 1,751 — one answer for every ten calls.

### The chords — one strike a bar, held

```
b17 | C4(2.70) D#4(2.51) G4(2.26)   + C4 at 4.98
b18 | D#4 G4 … A3
b19 | C4 F4
b20 | A3 C4 F4
```

A three-note voicing struck once and held ~2.5 beats. The strike is *spread*
(1.01, 1.09, 1.18) — a small roll, and the one genuinely nice detail in this
window. But it confirms task #112: the wurly HOLDS, so it has no rhythm and
nothing to re-realise.

### The banjo — the only part actually playing

```
b17 | C5 G5 C6 C5 G5 C5 C6 G5   (×2)
b18 | G5 D#5 C6 G5 D#5 C6 D#5 G5 (×2)
b19 | C5 A4 C5 C6 …
b20 | A4 C5 A4 C5 C6 …
```

**64 notes in four bars, sixteen a bar, every one a sixteenth.** The fifth-string
drone (C6) is there, fixed, and on top — that fix is holding. But each bar has
only **three distinct pitches**: two fretted notes and the drone.

### The verdict on the notes

| part | notes / 4 bars | what it is doing |
|---|---|---|
| banjo | **64** | playing |
| drums | 40 | playing, with a real fill in b20 |
| keys | 12 | holding |
| bass | 6 | pedalling |
| lead | 5 | barely present |
| counter | **0** | absent |

**One instrument is playing and everything else is sustaining or missing.** The
banjo out-notes the tune 13:1 in an overlapping register. The record is a banjo
roll with occasional company — which is exactly what a listener would report as
"it never goes anywhere", because the only thing with rhythm never changes.

---

## 4. REGISTER AND LEVEL

10 records, every pitched note:

| role | notes | p10 | median | p90 | Hz (median) | mean gain |
|---|---|---|---|---|---|---|
| drone | 41 | 24 | 29 | 34 | 44 Hz | 0.70 |
| bass | 1,794 | 33 | 39 | 44 | 78 Hz | 0.46 |
| keys2 | 912 | 52 | 57 | 62 | 220 Hz | 0.50 |
| keys | 4,944 | 56 | 61 | 65 | 277 Hz | 0.55 |
| lead | 1,751 | 67 | 72 | 78 | 523 Hz | **0.77** |
| counter | 174 | 67 | 72 | 76 | 523 Hz | 0.50 |
| ostinato | **18,731** | 71 | 79 | 89 | 784 Hz | **0.30** |

**The register plan is good** — five clearly separated bands from 44 Hz to
784 Hz. Two collisions:

- **lead / counter share 100% of their band** [67..76]. Call and answer in the
  identical register. The 2026-08-16h stereo work separates them (harmonica
  +0.16, diddley +0.52) so it is now a stereo distinction only.
- **ostinato / lead share 64%** [71..78] — and the banjo has **ten times the
  notes at half the gain**. A constant quiet wash sitting on the tune is the
  textbook way to make a melody inaudible without any single thing being "too
  loud".

**Nothing measures masking.** `probe_stems` reports per-voice levels one at a
time; task #102 already records that "nothing watches one level against
another", and this is that gap biting.

---

## 5. DRUMS — the healthiest part of the record

10 records: **1,099 sounding bars, 650 distinct, each heard ×1.7.** Not a loop.
Velocity spans 0.13 → 0.99, a **17.5 dB** range — real dynamics, and the
metrical-hierarchy work is doing its job. Bar 20 of the printed window is a
genuine fill.

Two faults:

- **Three sounds carry the whole kit**: `tkStick` 7,164, `bxAnvil` 1,436,
  `bxBrake` 1,388 — and **`tkLow` sounds 6 times in ten records**, which is dead
  config by any standard the rest of this file applies.
- **There is no low percussion at all.** No kick. The bass sits at 78 Hz and
  nothing hits below it. For a genre about a heavy machine, the rhythm has no
  weight — the train's *pitch* is there (`drone`, 44 Hz) but never a transient.

---

## 6. AUTOMATION, LFOs, P-LOCKS

| genre | lanes | lfo | **plock** | arc | section |
|---|---|---|---|---|---|
| lofi | 163 | 144 | 3 | 2 | 33 |
| hobbitsynth | 116 | 55 | **6** | 8 | 33 |
| synthwave | 110 | 83 | 3 | 4 | 42 |
| jungle | 46 | 32 | 3 | 4 | 19 |
| acid | 29 | 15 | 3 | 3 | 16 |
| plastikman | 77 | 73 | 2 | 13 | 28 |
| vgm | 81 | 72 | 1 | 1 | 12 |
| **boxcarsynth** | **57** | **36** | **0** ⚠ | **30** | **30** |
| dungeonsynth | 117 | 51 | 0 | 8 | 34 |
| ambient | 41 | 27 | 0 | 10 | 10 |
| bladerunner | 32 | 23 | 0 | 6 | 13 |

**ZERO PARAMETER LOCKS.** The engine supports them — *"plock: per STEP. A value
bound to a sixteenth, the same every bar"* — and this genre uses none. Task #60
records the same finding for hobbit synth, where it was fixed; boxcar never got
the same pass. A p-lock is the one modulation shape that gives detail *smaller
than a bar*, which is precisely what a 16th-note banjo roll of three pitches is
crying out for: lock the pick brightness or the bottle to specific steps and the
roll stops being sixteen identical events.

Otherwise the automation is healthy and unusually arc-heavy (30 arcs, second
only to plastikman's 13 by proportion): 57 lanes, 36 LFOs, `PARKED 4` with no
dead knobs after this session's work.

---

## 7. FX

`probe_wiring` — what boxcar uses of the seven effect columns and five extras:

| Echo | Room | Spring | Flange | DP4 | Barber | pan | kitPan | width | spread | preDly | cuts |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ✓ | ✓ | – | – | – | – | ✓ | – | – | ✓ | ✓ | – |

**Two of seven effects.** That is defensible — the `world` and `rail` rows are
deliberately plated out of Spring/Flange/DP4/Barber with a written reason (a
flanged river is a synth patch) — but the *band* rows are open on all six and
use two. The Barberpole and DP4 are unused by this genre entirely.

`Spring` is used by **no genre at all** (0 of 11) and has been on the open-items
list since §10.12. A spring tank is period-correct for nothing here, which is
probably the honest answer, but it remains a column nobody feeds.

---

## 8. TEXTURE AND REPETITION — the part that got better

After this session's work (`materialTakes`, 8-bar materials, the fifth string):

| | 20-minute record, before | after |
|---|---|---|
| distinct banjo bars | 43 | **128** |
| each heard | ×6.2 | **×2.2** |
| distinct tune bars | 50 | **60** |
| distinct bass bars | 19 | **24** |

Per record: ostinato ×1.6, lead ×2.3, bass ×3.8, keys ×3.7 — all below dungeon
synth's. `probe_length` now guards the slope.

**Still capped: `keys`.** 45 distinct bars at 1,200 s against 314 played (×6.9),
and takes cannot help it because it HOLDS (task #112). It is the flattest part
of the record.

---

## 9. HARMONY

`probe_theory`, boxcar vs the field:

- **6.4% out of key** — mid-field (dungeon synth 8.5%, hobbit 5.8%, ambient 1.9%).
- **23.7% of non-chord tones leap away instead of resolving** — second-highest of
  eleven, behind only ambient's 38.1%. Nearly a quarter of this genre's
  dissonances are left hanging.
- 3.0 distinct chords in the verse, 8.1 across the record (was 2.1 / 5.7).

---

## 10. WHAT I WOULD FIX, IN ORDER

1. **Section lengths must vary** (§1). Nothing else in this document changes the
   experience as much. The route already computes variety and the form throws it
   away.
2. **The apex must not be the sparsest bar** (§2) — either the town stops being
   the declared peak, or something replaces the roll when it stops.
3. **The bass must play** (§3) — six notes in four bars with self-overlap is not
   a bass part, and `bassWalk: 0.65` is declared and inaudible.
4. **The tune needs pitches before it needs phrases** (§3, task #113) — three
   semitones and three repeats in four bars.
5. **The counter must answer more than one call in ten** (§3), and not from the
   lead's own register (§4).
6. **Parameter locks** (§6) — the one modulation shape this genre has none of,
   and the one that would give the roll detail below the bar.
7. **A low transient in the kit** (§5) — the train has pitch and no weight.
8. **`tkLow`** sounds six times in ten records (§5): use it or cut it.

---

## WHAT THIS AUDIT DID NOT DO

- **No ear.** Every number is what the machine does; none is evidence it sounds
  good.
- **No render.** Levels here are event gains, not measured dBFS at the master.
  The masking claim in §4 is inferred from register overlap and note counts, not
  from a spectrum. Task #102 (a probe that measures levels *against each other*)
  is still the right instrument for that and still does not exist.
- **No blend.** All measurements are boxcar alone.
