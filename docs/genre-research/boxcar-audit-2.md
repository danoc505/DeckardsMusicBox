# BOXCAR SYNTH — second audit, `2026-08-17`, and this one RENDERED

*Asked for: "now look at the boxcar synth with a critical eye. Evaluate it and
critique it."*

Measured at build `2026-08-17a`, five genres. Battery 157/2.

**WHY THIS IS NOT A REPEAT OF `boxcar-audit.md`.** That audit's own closing
lesson was that it measured EVENTS and never SOUND, and the owner then found
four faults by ear that it had missed. So this pass does three things the first
one did not: it **renders** (three windows, two seeds, through `probe_stems`),
it **re-tests the first audit's findings** instead of assuming they still hold,
and it **checks the measuring instrument** — which turned out to be broken in a
way that matters.

Two of the first audit's headline findings do not survive contact. One of them
was wrong. That is written up here rather than quietly dropped.

---

## THE FIVE THINGS THAT MATTER MOST, NOW

1. **The bass cannot be heard.** Remove it from the mix and the audible level
   changes by 0.00 dB, or goes *up* by 0.12. It is spending headroom and
   delivering nothing.
2. **Three parts are the record.** Lead, drums and banjo. Everything else —
   the chords, the bass, the engine, the station, the passing world — measures
   at or below the audible floor.
3. **The journey is still a timetable.** Unchanged since the first audit: verse
   16 bars in 67 of 67 instances, chorus 8 in 36 of 36. No variance at all.
4. **The record never breathes.** Longest silence in a record: 0.00 seconds.
   Not one moment of air in eleven minutes of open country.
5. **The instrument that measures sound has a hole in it**, and it is exactly
   the shape of this genre. See §6 — this invalidates part of §2 and every
   stem measurement ever taken of boxcar synth.

---

## 1. THE BASS IS NOT AUDIBLE — the finding this pass exists for

`probe_stems`, three windows, two seeds, each part rendered alone and then
removed from the mix:

| window | part | RMS dB | A-weighted dB | **MISSED** | **MISSED(A)** |
|---|---|---|---|---|---|
| seed 3, 40 s | bass | −28.3 | **−39.0** | 0.12 dB | **−0.12 dB** |
| seed 3, 200 s | bass | −28.7 | **−39.1** | 0.24 dB | **−0.11 dB** |
| seed 7, 120 s | bass | −32.2 | **−41.6** | 0.21 dB | **0.00 dB** |

`MISSED(A)` is how much quieter the mix gets, to the ear, when this part is
taken out of it. **For the bass it is zero or negative in all three windows.**
Negative means the mix measures *louder* without it — the bass is pushing the
master limiter down and giving back nothing above the hearing threshold.

The cause is in the second column. **The gap between RMS and A-weighted is
9.4 to 10.7 dB, the largest of any part in the record.** Ten decibels of the
bass's energy sits below where hearing is. It is not that the bass is quiet; it
is that most of what it produces is not a sound.

This is *not* simply "the notes are too low". Measured over 8 records:

| genre | bass p10 | median | share below C2 (65 Hz) |
|---|---|---|---|
| lofi | 34 (58 Hz) | 39 (78 Hz) | 18% |
| synthwave | 34 (58 Hz) | 40 (82 Hz) | 19% |
| vgm | 30 (46 Hz) | 39 (78 Hz) | 34% |
| dungeonsynth | 30 (46 Hz) | 36 (65 Hz) | 49% |
| **boxcarsynth** | 33 (55 Hz) | 38 (73 Hz) | **29%** |

Boxcar's bass register is unremarkable — *higher* than dungeon synth's, which
does not have this problem. **So the fault is in the VOICE or its level, not in
the notes**, and that is a different repair from the one the register table
would suggest. `V.bass` is the plucked-string voice, and §5 of the first audit
already noted this genre has no low percussion; what this measurement adds is
that it has no audible low END either.

Worth stating plainly: `probe_stems` has never flagged this because its
per-part columns are all "how loud is this alone", and alone the bass reads
−28 dB, which looks fine. **The MISSED column is the one that answers the
question, and nothing in the battery asserts on it.** That is task #102 —
"a probe that measures levels AGAINST each other" — and this is that gap
biting a second time.

---

## 2. THREE PARTS ARE THE RECORD

Same three renders, `MISSED(A)` for every part that sounded:

| part | seed 3 @40 s | seed 3 @200 s | seed 7 @120 s |
|---|---|---|---|
| **lead** (harmonica) | **4.18 dB** | **4.16 dB** | 0.89 dB |
| **drums** | 0.73 dB | 1.63 dB | **2.82 dB** |
| **ostinato** (banjo) | 0.80 dB | *not playing* | 1.48 dB |
| keys (chords) | 0.09 dB | 0.16 dB | 0.07 dB |
| bass | −0.12 dB | −0.11 dB | 0.00 dB |
| station / engine / pass | 0.00 dB | 0.00 dB | 0.00 dB |

**The chords contribute a tenth of a decibel.** `keys` writes 4,944 notes over
ten records at a composed gain of 0.55 — the third-busiest part in the genre —
and removing it from the mix is inaudible. The wurly HOLDS (task #112), and a
held pad at this level is wallpaper.

**And this corrects the first audit.** It reported the banjo as drowning the
tune: "ten times the notes at half the gain… the textbook way to make a melody
inaudible". Rendered, that is not what happens. The banjo contributes
0.80–1.48 dB; the harmonica contributes up to 4.18 dB from **seven notes**.
The tune is comfortably the loudest thing in the record. The banjo is a quiet
wash — the problem with it is not masking, it is that a wash which never stops
is not an arrangement.

---

## 3. THE JOURNEY IS STILL A TIMETABLE — unchanged, and still the largest structural fault

12 records, every section:

| fn | instances | distinct lengths |
|---|---|---|
| verse | 67 | **16, and nothing else** |
| chorus | 36 | **8, and nothing else** |
| instrumental | 29 | **16** |
| bridge | 6 | **16** |
| intro | 8 | **8** |
| outro | 12 | **8** |

Identical to the first audit's table. Nothing has moved. A genre whose
constitution is *"a boxcar record has a geography"* still has a geography in
which every leg between towns takes exactly the same time and every town takes
exactly the same time to stop in.

---

## 4. THE ARC — the first audit's claim, re-tested and REFRAMED

The first audit said boxcar was "the only genre of eleven whose note density
falls from opening to peak". Measured now, by TIME rather than by section,
notes per second across the deciles of a record:

| genre | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 |
|---|---|---|---|---|---|---|---|---|---|---|
| lofi | 6.6 | 8.6 | 9.3 | 9.9 | 9.7 | 8.4 | 8.2 | 7.8 | 9.2 | 6.6 |
| synthwave | 18.7 | 23.7 | 22.3 | 24.1 | 19.7 | 21.8 | 20.6 | 24.7 | 24.6 | 20.8 |
| vgm | 8.5 | 10.1 | 9.7 | 8.5 | 10.0 | 8.5 | 9.2 | 9.1 | 9.0 | 7.2 |
| dungeonsynth | 2.6 | 4.1 | 5.2 | 4.7 | 4.9 | 4.9 | 4.1 | 4.3 | 4.5 | 0.9 |
| **boxcarsynth** | 6.3 | 8.0 | **8.7** | 7.2 | **4.7** | 5.3 | 7.1 | 7.6 | 7.4 | 2.1 |

**It is not a monotone thinning. It is a SAG.** The record fills up over its
first fifth, loses nearly half its density across the middle (8.7 → 4.7), and
climbs back. No other genre has a dip like it. The listener's experience of
that is the record going quiet and uncertain exactly where it should be
settling into its stride.

**And the declared peak is not the real one.** Over 10 records, the busiest
moment lands on the section the form marks `peak` in **2 of 10**, and the mean
distance between them is **29% of the whole record**. The table says where the
climax is; the notes put it somewhere else, a third of a record away.

---

## 5. THE RECORD NEVER BREATHES

Longest stretch with nothing sounding at all:

| seed | length | longest silence |
|---|---|---|
| 1 | 8.2 min | **0.00 s** |
| 2 | 10.6 min | **0.00 s** |
| 3 | 11.7 min | **0.00 s** |
| 4 | 8.1 min | **0.00 s** |
| 5 | 8.6 min | **0.00 s** |

And in the renders, `gap` — the share of a window more than 30 dB below its own
peak — is **0%** for the full mix in every window measured.

Something is always sounding, everywhere, in every record. Partly this is the
drone and the tape hiss by design. But a journey through open country with no
moment of air in eleven minutes is a wall, and the genre's own sheet argues for
variation living "in the passing landscape" — landscape has distance between
things.

---

## 6. THE MEASURING INSTRUMENT IS BROKEN, IN THIS GENRE'S EXACT SHAPE

`probe_stems.js:126`:

```js
const ev = song.perf.events.filter(e => e.tSec >= FROM && e.tSec < FROM + SECS && e.role !== 'tape')
```

**Events are windowed by ONSET.** A note that began before the window and is
still sounding through all of it is dropped. And `tape` is excluded outright.

Mean note length by role, boxcar synth, 10 records:

| role | mean note | in a 20 s window? |
|---|---|---|
| tape | 601.1 s | excluded by name |
| **drone** (the train) | **121.2 s** | **never rendered** |
| weather | 93.1 s | never rendered |
| scene | 31.3 s | never rendered |
| pass | 13.1 s | usually dropped |
| station | 13.0 s | usually dropped |
| engine | 11.2 s | usually dropped |
| bass | 7.5 s | often dropped |

**The train hum has never appeared in any stem render of this genre.** Every
`ALL` reference mix in §1 and §2 above — and every stem measurement taken
during the first audit and the build sessions before it — is a boxcar record
with no train, no tape and no weather in it.

What that does and does not invalidate:

- **The bass finding survives, and gets stronger.** Adding a 44 Hz drone back
  into the mix would mask the bass further, not less.
- **The lead/drums/banjo ranking survives** — all three are short-note parts,
  fully captured.
- **The drone's own audibility has never been measured, at all.** The owner's
  standing complaint that they cannot hear the conductor (`railCall`, 6 s of
  real audio, gain 0.518, composed 36 times per 10 records, *louder than the
  bass on paper*) sits in exactly this blind spot. It is still unresolved and
  this pass could not resolve it.

This is the same class as BACKLOG §0za and task #118 — the repo cannot see what
it sounds like — but it is worse than "we have no render probe", because there
IS one and it has been quietly reporting on an incomplete mix.

---

## 7. SMALLER THINGS, MEASURED

**The anvil and the brake cannot be heard.** Rendered, per drum voice:

| voice | seed 3 @40 s | seed 7 @120 s |
|---|---|---|
| tkStick | −23.9 dB | −24.8 dB |
| bxBrake | −47.7 dB | −48.4 dB |
| bxAnvil | −65.1 dB | −64.8 dB |

The anvil is **40 dB under the stick** — composed, dispatched, and inaudible.
The first audit flagged `tkLow` as dead config on a count of 6 sounds in ten
records; these two are dead on level while sounding hundreds of times, which no
count-based probe can see.

**The tune is BETTER than the first audit said, and leaps more than it should.**
That audit printed one four-bar window and reported "five notes, three of them
the same… the whole melodic range is three semitones". Over 8 whole records:

| genre | lead notes | distinct pitches | range | stepwise motion |
|---|---|---|---|---|
| lofi | 121 | 8.8 | 14 st | 87% |
| synthwave | 282 | 8.9 | 14 st | 88% |
| vgm | 132 | 8.8 | 14 st | 83% |
| dungeonsynth | 160 | 6.1 | 9 st | 79% |
| **boxcarsynth** | 172 | **10.5** | **15 st** | **68%** |

**The widest melodic vocabulary of any genre in the file.** The first audit's
window was not representative and its conclusion should not be carried forward.

The real melodic fault is the last column: **68% stepwise, the lowest of the
five.** Nearly a third of this tune's intervals are leaps. It is a harmonica —
a breath instrument playing a folk tune — and it is the leapiest melody in the
program. That is backwards for the source material and is a new finding.

**Zero p-locks, still, and now zero gestures too:**

| genre | lanes | lfo | plock | arc | section | gesture |
|---|---|---|---|---|---|---|
| lofi | 163 | 144 | 3 | 2 | 33 | 0 |
| synthwave | 110 | 83 | 3 | 4 | 42 | 6 |
| vgm | 81 | 72 | 1 | 1 | 12 | 0 |
| dungeonsynth | 117 | 51 | 0 | 8 | 34 | 4 |
| **boxcarsynth** | **67** | 39 | **0** | **38** | 34 | **0** |

38 arcs is far and away the most in the file — the record-long shape is well
served. What is missing is everything *short*: no p-lock (detail smaller than a
bar), no gesture (a move tied to a fill or an arrival). For a 16th-note banjo
roll of three pitches, a p-lock on pick brightness is the single cheapest thing
that would make it stop sounding like sixteen identical events.

**The counter still answers one call in ten** — 174 notes against the lead's
1,751, and a mean note of 0.8 s. It is the thinnest real part in the genre.

---

## WHAT I WOULD FIX, IN ORDER

1. **Make the bass audible or take it out.** It currently costs headroom and
   returns nothing. This is a voice/level question, not a register one — the
   notes are in the same band as lofi's.
2. **Assert on `MISSED(A)` in the battery.** A composed part that changes the
   audible mix by less than ~0.2 dB is dead, and nothing catches it. This is
   task #102 with a threshold attached.
3. **Fix `probe_stems` to include sustained notes**, and stop excluding `tape`.
   Until then, no stem measurement of this genre is trustworthy, and the train
   has never been measured at all.
4. **Vary the section lengths.** Unchanged since the first audit and still the
   largest structural fault.
5. **Fill the mid-record sag**, and reconcile the declared peak with the real
   one — they disagree by 29% of a record.
6. **Give the tune a step budget.** 68% stepwise is the lowest in the file and
   wrong for the instrument.
7. **P-locks on the roll.** The cheapest available texture, and the genre has
   none.
