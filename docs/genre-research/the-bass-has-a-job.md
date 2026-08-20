# THE BASS HAS A JOB — what a bass line is in doom, sludge, mathcore and prog, and which half of it this program can play

*Researched 2026-08-20. Written because `bass-roles.md` §5 names the gap in as
many words: "Dungeon synth needs a riff table before it can have a second role,
and **nobody has researched what a dungeon synth bass figure is**." This is that
research, extended to the four acts the record now has.*

> **THE BRANCH IS `claude/orchestrator-mk2-handoff-e8475j`.**
> **NOTHING HERE HAS BEEN JUDGED BY EAR** — the standing caveat. The numbers say
> what the machine does; only the owner can say what it sounds like.

---

## §0 THE MEASUREMENT THAT MADE THIS NECESSARY

Read off the printout, not off a probe of my own design:

| | seed 1 | seed 7 |
|---|---|---|
| distinct bass pitches, whole record | **2** (C#2, G#2) | **1** (F1) |
| bars printing `\|*---------------\|` | **243 of 250** | — |

One strike on beat one, held sixteen steps, for twenty minutes. The only thing
that varied bar to bar was the millisecond groove offset.

**The cause is not a bug.** Fantasy synth declares nothing bass-related and
inherits dungeon synth's `bassStyle: "drone"` with `bassPedal: 0.5` and
`bassPedalDouble: 0.66`. The `drone` branch's pedal writes `{step:0, dur:16}` for
**every bar of the material** at the material's tonic, plus its fifth when the
double coin lands. Seed 1 won that coin — root and fifth, two pitches. Seed 7
lost it — one.

So the part is doing exactly what the table asks. **The table has never asked for
anything else**: `bassRoles` has been built and declared by no genre since it
shipped (`git log -S'bassRoles:'` returns zero commits).

---

## §1 THE PRECEDENT, AND IT IS EXACT

This defect has been fixed once already, in this program, with a measured result.

Commit `83cd5c1`, *"jungle's bass plays a dub riff instead of holding one note"*.
Same cause — `bassStyle: "drone"` under a harmony that mostly does not change, so
**99.8% of bars held ONE pitch**. Same cure: `bassStyle: "riff"` plus a
`bassRiff` table.

| | before | after |
|---|---|---|
| bars holding one pitch | 99.8% | **14.4%** |
| distinct pitches a bar | 1.00 | **2.35** |
| parallel perfects keys/bass | 19.2% | **0.8%** (1.1% chance floor) |

Its table, which is the shape everything below is written in:

```js
bassRiff: { bars: 2, notes: [5,7], grid: 2, hold: 4, strong: [0,8],
            anchor: [[0,6],[4,3],[2,2]], spice: [[3,3],[6,2],[1,1]] }
```

`BACKLOG.md` records the honest caveat with it, and it applies here too:
**"every count in `bassRiff` is `[CHOSEN]` (no source gives one)"**. Sources give
the *note choices* and the *density in words*; nobody publishes a weight table.

---

## §2 WHAT EACH ACT'S BASS ACTUALLY DOES

### §2.1 Doom — the power chord, and letting it sustain

The interval vocabulary is documented per-interval, which is rare enough to be
worth quoting in full [doesitdoom, *The Four Intervals of Doom*]:

| | |
|---|---|
| **♭5** | *"a moderately dissonant interval that is fundamental to the stoner doom genre"* — from the Blues Scale |
| **∆7** | *"located a half step below the root… often used as a passing tone"* — from Harmonic Minor |
| **♭2** | *"located a half step above the root is often considered the most dissonant in all of western music. The lack of resolution and uneasiness produced are perfect for stoner doom"* — from the Phrygian Mode |
| **∆3** | *"sounds unresolved and ugly in a pre-established minor context… exactly the reason we're told not to do it"* |

over *"anchoring riffs in the Natural Minor Scale"*.

And the texture: power chords are *"typically the root and the fifth of a
scale"*; *"a basic approach is to play a power chord or single note and let it
sustain"*. Melodigging adds *"cyclical, mantra-like repetition with subtle
variation"* and *"power chords, parallel fourths/fifths, and sustained unisons
enhance mass"*.

> **The doom bass is already right, and that is the finding.** Root and fifth,
> struck together, held a whole bar, repeating — that is what `drone` +
> `bassPedalDouble` writes today. What is wrong is that it was never *chosen*.
> `the-weight-and-the-stop.md` §3.1 made this exact distinction: **"A drone is a
> decision. A shortage is an accident. They can produce an identical pitch-class
> histogram and they do not sound alike."** Declaring it converts the accident
> into the decision.

### §2.2 Sludge — the riff, and the bass is on it

*"Down-tuned, heavily distorted guitars"* with *"guitars and bass playing the
same riff in unison, creat[ing] a loud and bass-heavy wall of sound"*. So the
sludge bass is **not** an independent voice: it is the riff, doubled.

On the figure itself [riffhard, *How to Write a Sludge Metal Song*]:
*"You don't need a million notes to make an impact; sometimes a slow, crushing
riff can be more powerful than a complex one"*, *"simplicity is your friend"*,
and *"don't be afraid to repeat a riff and let it breathe."*

Note choices [melodigging]: *"power chords, minor pentatonic and blues scales,
chromatic slides, and tritone/dissonant intervals"*.

### §2.3 Mathcore / post-hardcore — the bass drives

The one line that names the job outright: the bass plays **"melodic counterlines
that lock with drums, often driving riffs rather than just root support"**
[melodigging, post-hardcore]. Mathcore's own harmony note is *"tritones, minor
seconds, clusters, and chromatic voice-leading"*.

### §2.4 Prog — the bass is a voice

Chris Squire's lines *"operated contrapuntally with other instruments rather
than just mirroring the guitar or keyboard parts"*, and his Rickenbacker tone
*"compared to that of a guitar"* let *"the bass take on a more 'lead' role"*.
Wikipedia's own summary: *"aggressive, dynamic and melodic"*, with *"bright,
growling higher frequencies and clean, solid bass frequencies"*.

---

## §3 WHAT THIS PROGRAM CAN AND CANNOT PLAY — the constraint that shapes the table

**`bassRiff` pitches are `degMidi(ch.key, ch.mode, ch.degree + deg)` — DIATONIC
scale degrees of the material's mode.** The riff transposes with the chord and
cannot leave the mode.

That is a hard limit and it decides which of §2's intervals are reachable:

| device | reachable? | why |
|---|---|---|
| root + fifth power chord | **yes** | degrees 0 and 4 |
| minor pentatonic | **yes** | degrees 0, 2, 3, 4, 6 of natural minor **is** the minor pentatonic |
| the Phrygian **♭2** | **yes, but only where the mode is phrygian** | there it is degree 1 |
| the blues **♭5** | **no** | not diatonic in any mode this genre declares |
| **chromatic slides** | **no** | would throw on the out-of-key law |
| ∆7, ∆3 as doom colour | **no** | harmonic-minor and major-third borrowings are out of mode |

**And the modes are already declared per material** (`form.setMode`), which lines
up better than it had any right to:

| act | material | mode | what its riff can reach |
|---|---|---|---|
| setting out — doom | A | drawn (minor at weight 4) | root+fifth, minor pentatonic |
| into the deep — sludge | C | **minor** | the sourced "natural minor anchor" exactly |
| the fight — mathcore | B | **phrygian** | **degree 1 is the ♭2** — the minor second both doom and mathcore ask for, diatonic and legal |
| the long way home — prog | lift | mixolydian | — see §5 |

The ♭2 landing in the fight rather than in the doom leg is an accident of the
existing mode plan, not a design. It is stated rather than tidied because the
fight is also the one act whose sources ask for minor seconds by name.

---

## §4 WHAT IS BUILT FROM THIS

**One riff table, genre-wide** — `bassRiff` is `G.bassRiff`, not per material, so
the sludge leg and the fight share a figure. Both want *a repeating shape over
moving pitches*, so this is a real limitation rather than a fatal one, and it is
recorded rather than hidden.

**Roles declared per act**, using the per-material form of `bassRoles` added with
this sheet — the same shape as `form.setMode`, which already says which mode each
material stands in:

| material | act | job | why, in one line |
|---|---|---|---|
| `A` | doom | `drone` | the power chord, held — §2.1, now a decision |
| `C` | sludge | `riff` | the bass is on the riff — §2.2 |
| `B` | mathcore | `riff` | driving, not root support — §2.3 |
| `lift` | prog | `follow` | a line that moves — §2.4 |

Single-entry pools, deliberately: the owner asked for **a job per act**, and a
weighted pool would make it a coin instead of a declaration.

Every count in the riff table is `[CHOSEN]`, exactly as jungle's was. What the
sources fix is the *note pool* (minor pentatonic, root and fifth as anchors) and
the *density in words* ("you don't need a million notes", "let it sustain"). The
numbers that turn those into `notes: [4,6]` are mine.

---

## §5 THE ONE THING THIS SHEET CANNOT BUILD

**`"the long way home": ["keys", "lead", "drone"]` — the prog act has no bass
lane at all.** Squire's contrapuntal line cannot be written into a movement that
drops the part.

Putting it back is an arrangement decision, not a bass one: that leg is
deliberately the record's quiet end, energy 0.30, and the sheet that designed it
called it "the motif fading into the air". So the `lift` role above is declared
and **inert** until somebody decides the walk home should have a bass — which is
the owner's call and is flagged, not assumed.

---

## §6 WHAT THIS SHEET DID NOT REACH

- **Not a note has been heard.** Every claim about the record is from the
  printout or the source.
- **No practitioner walkthrough for a doom or sludge BASS part.** §2.2's density
  guidance is a riff-writing guide, not a bass session.
- **The blues ♭5 and the chromatic slide are unavailable**, and they are named in
  three of the four genres' sources. A `bassApproach: "chromatic"` exists on the
  `follow` branch and was blocked by the seam check until the out-of-key law was
  widened (`bass.md` §8) — whether the riff branch should get the same door is
  unresearched.
- **Whether a riff should transpose with the chord** is undecided by the sources.
  It follows the acid builder's precedent, recorded rather than proven — the same
  caveat jungle's table carries.

## SOURCES

- The Four Intervals of Doom — https://doesitdoom.com/the-four-intervals-of-doom/
- Doom metal — https://www.melodigging.com/genre/doom-metal
- Sludge metal — https://www.melodigging.com/genre/sludge-metal
- Post-hardcore — https://www.melodigging.com/genre/post-hardcore
- Mathcore — https://www.melodigging.com/genre/mathcore
- How to Write a Sludge Metal Song — https://www.riffhard.com/how-to-write-a-sludge-metal-song/
- Sludge metal — https://en.wikipedia.org/wiki/Sludge_metal
- Doom metal — https://en.wikipedia.org/wiki/Doom_metal
- Chris Squire — https://en.wikipedia.org/wiki/Chris_Squire
- Progressive rock — https://www.melodigging.com/genre/progressive-rock
