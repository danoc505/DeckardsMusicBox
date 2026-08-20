# FANTASY SYNTH — the brief, the research, and what the program can already do

*2026-08-19. Owner: "copy dungeon synth as a new genre… Fantasy Synth… more
lively, builds up to a larger conclusion, tells a more exciting story, a band
of heroes explores then fights the monster. 20 mins, 5 min sections, 15 mins in
is the big fight, last 5 mins the journey home. Lean on modal jazz. More
drones. Tell a story with the instruments each having a part."*

---

## 1. THE NAME IS NOT INVENTED

**"Fantasy synth" is a named subgenre, and Erang is credited as its pioneer** —
"blends Dungeon Synth with heroic and adventurous themes, building entire
mythologies around his albums." Erang's sample packs are already the backbone
of this program's dungeon synth, so the palette is in the building.

### The neighbouring subgenres, for what this one is NOT

| subgenre | what it is |
|---|---|
| old school / classic | 1990s, black-metal adjacent: "fantasy, atmospheric, epic, dark, cold, medieval, minimal repetitive" |
| comfy synth | "peaceful, melancholic, calm, mellow, pastoral, soothing" — the tavern-and-meadow wing |
| winter synth | "cold, sombre, lonely, ethereal" — more open, more minimal, more drone, overlapping dark ambient |
| forest synth | field recordings and folk instruments; pagan and druidic |
| chip synth | "lo-fi, dark, epic, CRPG, nostalgic" — 80s/90s tabletop and computer RPG |
| **fantasy / adventure synth** | **heroic and adventurous themes, mythology-building** |

**Nobody documents fantasy synth technically.** There is no melodigging-style
table of tempo, harmony and instrumentation for it as there is for dungeon
synth. So this genre's numbers will be `[CHOSEN]` far more often than sourced,
and that is marked here rather than hidden.

---

## 2. THE BRIEF, AS ANSWERED

| decision | answer |
|---|---|
| tempo | **an arc**: ~72 setting out → ~130 at the fight → ~88 coming home |
| modes | **a mode per movement, AND a key shift for the fight** |
| story | **hero theme + monster theme, both returning transformed** |
| the fight | drums forward and fast · dissonance allowed · everything at once · **the monster's theme on its OWN instrument, duelling the hero's lead** |
| the duel | **escalating** — trade phrases, then the turns shorten and overlap |
| drones | **two or three stacked at once**, and **the whole rack on them** |
| palette | **add horns and brass** to the existing pack |
| ending | **triumphant but thinned — something was lost** |

---

## 3. WHAT THE PROGRAM CAN ALREADY DO — measured, not assumed

### 3.1 The four movements already exist as a mechanism ✅

Dungeon synth's `form.plan` is a **named movement list** with its own section
pool and bar range per movement:

```
descend → halls → deeper → return
```

Fantasy synth's four movements are the same object with different names,
proportions and pools. **No new mechanism.**

### 3.2 `form.tempoArc` is built and NO GENRE HAS EVER DECLARED IT ✅

```
by:   { <section function>: [multiplier at its first bar, at its last] }
ease: "cos" (default) or "lin"
```

**It redistributes time, it does not add any** — the map is normalised so the
mean seconds-per-bar still matches the drawn tempo. So "20 minutes" stays 20
minutes and the arc can be as steep as the table likes. A faster movement
simply covers more bars in its five minutes.

### 3.3 The horns are already built ✅

`horns`, `brass` (keys slot), `carnyx`, `bassOboe`, `corAnglais` (lead slot) —
all present instruments. "Add horns and brass" is a machine-pool entry, not a
new voice. The repo also has `brass-arranging.md` and `carnyx-usage.md`.

### 3.4 The key shift for the fight is nearly free ✅

`keyShift` moves the tonic and — at `change` probability — the mode too, and it
fires on **material C, the bridge**. If the fight movement is built on material
C, the fight gets its key and mode change from a mechanism that already exists
and is already blend-registered.

### 3.5 ⚠ A DISTINCT MODE FOR ALL FOUR MOVEMENTS IS **NOT** SUPPORTED

This is the one answer the program cannot honour as asked. Modes are drawn
**per record**, and chord sets are built **per material (A/B/C)**, not per
movement — and movements reuse materials. So what is reachable today is:

- one mode for the record, **plus** a second mode for whichever movement is
  built on material C (the fight) — **two modes, not four.**

Four would need chord sets derived per movement, which is real surgery on
`makeMaterials`. It is a genuine build, not a table line.

### 3.6 The drone stack is a small build

`drone: { unit, hold, pedal, octave, continuous }` emits **one** note. "Two or
three stacked" needs a `stack: [0, 7, 12]`-style field so the lane emits
several intervals at once. Small and contained.

### 3.7 The duel is the big build

Two leads with their own material, alternating and then overlapping, is the
largest new mechanism in the brief. The `counter` role and
`call-and-response.md` are the nearest existing machinery.

---

## 4. WHAT 20 MINUTES COSTS

Dungeon synth: `form.target: [96, 5, 16]` → 96–160 bars → **10.7–12.8 min** at
52–78 BPM. Twenty minutes at a mean of ~95 BPM is roughly **340 bars**, so the
target roughly triples. Four movements of five minutes each, with the fight
faster, means the fight covers **more bars** than the others.

## 5. BUILD ORDER

1. The genre table — a copy of dungeon synth, retuned: tempo band, target bars,
   `form.plan` renamed to the four movements, brass in the machine pools,
   `roleGain` rebalanced, `voicing`/`parallels`/`landini` carried over.
2. `form.tempoArc` declared — the first genre ever to use it.
3. The drone stack.
4. The fight: dissonance allowed, tutti, drums forward, keyShift on material C.
5. The hero and monster themes, returning transformed.
6. The duel.

1–4 are table work and one small mechanism. 5 and 6 are real builds.

---

## 6. WHAT WAS BUILT — `2026-08-19z`

### 6.1 The genre, as a difference

Declared as a delta from dungeon synth and merged key by key, not copied:
tempo 84–108 against 52–78, modes led by **dorian and mixolydian** (both have a
major sixth, which is the difference between a cave and a road), target 504
bars — **measured at 19.6 minutes** — and the lead and keys shelves gain
`carnyx`, `corAnglais`, `bassOboe`, `horns` and `brass`, every one of which was
already built and drawn by no genre.

### 6.2 The tempo arc — the first genre ever to declare one

| | BPM across the record |
|---|---|
| arc off | 97 97 97 97 97 97 97 97 97 97 |
| **arc on** | **81 92 92 92 114 124 124 87 79 70** |

Total moved 20.29 → 20.57 min: the map is normalised, so an arc **redistributes
time and never adds any**.

Two things the first build got wrong, both caught by measurement:

- `intro` and `outro` were named in movement pools, and the program's own law is
  that they sit **outside** the plan. The section list showed an intro at 9% and
  an outro at 67%. It turned out to be the better structure — **the journey home
  is the outro**, 64 bars of it at a falling tempo.
- the movement bar ranges were the usual wide ones, so a movement drawing high
  beside one drawing low moved the fight by minutes. Narrowed, and made
  **unequal on purpose**: four equal five-minute movements are not four equal
  bar counts when the fight runs half again as fast.

### 6.3 A mode per movement — and §3.5 of this sheet was wrong

This sheet said four modes were "not supported". The owner: *"this is OUR code…
the only limitation is music theory and constraints not baked in values."*

He was right, and the mechanism was present three times over. The program builds
four chord sets and `mkChords(degrees, key, mode)` has always taken a mode. What
was missing was a genre being allowed to **say** which mode each set stands in.

A movement now names a `mode` and the `set` it owns. Because the movement pools
are function-disjoint — which they had to be for the tempo arc anyway — a
section's function already identifies its movement, so the ordinary
function-to-material map does the routing. **No new material family.**

| movement | set | mode | measured pitch classes, seed 1 |
|---|---|---|---|
| setting out | A | the record's own | `[0,3,7,9]` dorian |
| into the deep | C | minor | `[0,3,5,8]` |
| the fight | B | phrygian | `[0,1,3,7,8]` |
| the journey home | Alift | mixolydian | `[0,2,4,5,7,10]` |

And **"a mode change nobody hears did not happen"** — the modal-jazz sheet's
fourth device, and seed 2 was the case it is about: the fight was *declared*
phrygian and its chord set came back reading as plain **minor**, because the
inherited progressions draw the flat second only half the time and the flat
second **is** phrygian. Fantasy synth writes its own phrygian chorus
progressions in which every line contains degree 1.

### 6.4 The stacked drone

`drone.stack` is semitones above the drone's own pitch; the lane emits one held
note per entry. Fantasy synth declares `[0, 7, 12]` — the open fifth and the
octave, the same 8/5 sonority the open-fifth cadence lands on, held under the
whole record.

Two faults, both measured within the minute of declaring it:

- the re-strike test compared against **the last note pushed**, which is the top
  of the stack, so it never matched the root and the ground re-attacked every
  unit — **252 drone events** on a record whose ground should be three held
  notes. It is asked per stack voice now.
- `drone.continuous` walked the drone events **in time order and broke on the
  first pitch mismatch**. With a stack the very next event always differs, so
  nothing merged at all. Grouped by voice and pitch first; a single-pitch drone
  has one group and computes what it always computed.

Result: **3 drone events** — three held notes — where dungeon synth still has 1.

### 6.5 A regression this work uncovered

Dungeon synth threw on **0 of 32 seeds before** the `voicing`/open-cadence build
and **2 of 32 after**. I had tested sixteen seeds, seen none, and written "0 of
16 threw" — a window too small to contain the fault.

A/B against the five changes that shipped together put all of it on the **open
cadence**, which built its chord as `[root, fifth, root+12]`: three tones
carrying two pitch classes, whose inversions collapse and leave the keys voicer
without candidates. That is the **same defect I had found and fixed in the
voicing pass on the same day, written a comment about, and left standing in the
cadence**. Two notes now, as a power chord is.

All five genres: **0 of 48 seeds throw**.

### 6.6 Still to build

The two leitmotifs with the six transformation operations, and the chase.

---

## 7. THE TWO THEMES AND THE CHASE — `2026-08-20a`

### 7.1 Transformation is a named operation, and `augmentOf` was one of them

The program already had **augmentation** — `themeC` is A's rhythm with every
duration doubled. That is one member of a closed list named since Liszt and
Berlioz, and each member *means* something:

| operation | what it says |
|---|---|
| augmentation | "a sense of grandeur or drama" |
| diminution | "a sense of urgency or excitement" |
| **fragmentation** | **"by not completing the leitmotif, you communicate something about how that character is developing or responding to events"** |

A genre now declares which operation its tune takes in each chord set. Fantasy
synth's hero:

| movement | operation | why |
|---|---|---|
| setting out | **whole** | in the record's own mode |
| into the deep | **fragmented** | he is struggling, and an unfinished tune is how you say so |
| the fight | **diminished** | the same figure at twice the rate |
| the journey home | **augmented** | grandeur, and whole for the first time since the opening |

And because each movement's chord set stands in its own mode, the tune is
transposed and modulated too — a seventh operation for nothing.

**Measured, 16 records, the lead of each material:**

| | notes/record | mean note length |
|---|---|---|
| setting out — whole | 4.4 | 4.24 steps |
| into the deep — fragmented | **2.3** | 4.19 |
| the fight — diminished | **7.7** | **2.30** |
| journey home — augmented | 3.6 | **7.17** |

Half as many notes at the same length; nearly double the notes at half the
length; double the length. The textbook signature of each.

⚠ **I put the declaration in the wrong table.** `theme.story` went into *dungeon
synth's* theme block, which fantasy synth inherits whole — so every measurement
above came back correct while dungeon synth's material C silently went from two
notes to eight. Only the note-identity check could have caught it, and did.

### 7.2 The chase

Two soloists trading has a name: **"Two different instrumental soloists can
trade 4s with each other… this is called a chase."** And the intensification is
the **length of the turn**, not the volume — fours, then twos ("forces each
player to come up with succinct musical phrases and invites each player to
respond"), then ones, then both at once.

`chase: { on: ["chorus","instrumental"], a: "lead", b: "counter", turns: [4,4,2,1,0] }`

A turn of 0 means the turn-taking has collapsed and both play. The turns run
from the **first bar of the whole duel**, not of each section, so they carry
across section boundaries — a duel does not restart every sixteen bars. Only
the two named roles are gated: the drums, bass, drone and keys carry straight
on underneath, because a duel happens *over* a band, not instead of one.

**Measured, seed 1, bar by bar through the fight** (`h` hero, `m` monster,
`B` both):

```
hhhh...hhhhh....hhh      fours — the hero holds the floor
mmm.Bhhh.mmmBhhhmmm      still fours — they trade
hh..hh..hh..hh.          twos
hBmhBhmhBhmhBhm          ones — alternating every bar
hhhhhhhhhh mm.mmm.mmm    zero — the gate lifts, both free
```

### 7.3 The monster had to be given a voice first

Declared and measured with nothing else changed: the turn lengths ran 4, 2, 1,
0 exactly as written and **the monster never sounded once**. The counter line is
`density: 0.1` in the parent — one note answering every tenth note of the tune,
which is a decoration — thinned 88% by the arc and not admitted until 28% of the
record had gone. There was nothing on the lane to sound.

A duel needs two players: density 0.8 in `answer` style, thinning down to 0.3,
entering at 6%. And the tunes themselves are denser than a cavern's — dungeon
synth writes one or two notes a bar because it is an atmosphere, and **a duel of
one-note phrases is not a duel**.

### 7.4 State

All five genres: **0 of 40 seeds throw**; lofi, synthwave, dungeon synth and
boxcar **0 of 6 records changed**.

---

## 8. The effects tell the story

> "Ok i want to focus on the automation how can we use the fx and all the knobs
> we have to help tell the story?" — owner, 2026-08-20

### 8.1 The mechanism was already there and it is the plainest one in the file

`kind: "section"` is `d += mv.by[plan.secFn[bar]] || 0` — a flat offset per
section **function**. Because this genre's movement pools had to be
function-disjoint for the tempo arc, a function already names a movement:

| function | movement |
|---|---|
| `intro` | before dawn |
| `verse` | setting out |
| `bridge` | into the deep |
| `chorus`, `instrumental` | the fight (`chorus` is the harder of the pair) |
| `outro` | the long way home |

So per-movement automation needed **no new mechanism at all** — thirty-odd
`section` lanes on controls that already existed.

### 8.2 An effect that ARRIVES is not the same as an effect that is on

`space` puts seven crossings on the grid at a base of **zero** — `drumsSpring`,
`leadFlange`, `drumsDP4`, `leadDP4`, `keysBarber`, `leadBarber`, `droneBarber` —
and the DP/4's four return levels start at zero in `params` (dungeon synth's
worn-tape drive and crusher are always slightly on; this record's are not). A
send at zero is silent, and a motion offset is added to the base *before* the
clamp. So the spring does not exist until they go underground and the crusher
does not exist until the fight.

**No bipolar lane on a zero-base cell.** An LFO centred on zero spends its
positive half audible, which would leak the fight into the first movement. The
matrix's own axis modulators already refuse these cells (`if(!(lvl > 0))
continue`); the hand-written lanes hold to the same rule.

**An arc that starts at zero is the exception, and it is the residue.** More
below.

### 8.3 The room CLOSES for the fight

Every generator opens the reverb at the climax because bigger reads as more. It
is the wrong way round: distance *is* the reverb, so a big room at the climax
puts the fight across the valley from you. `keysRoom`, `leadRoom`, `bassRoom`,
`drumsRoom` and `droneRoom` are all pulled down for `chorus` and `instrumental`
and let all the way out for `outro`. The widest the record ever sounds is the
walk home — which is also the only place in it where nothing is happening.

### 8.4 What does not go back

A `section` offset vanishes the moment its function does. An `arc` runs one way
across the whole record and is at its far end when the record stops. So the
damage — the crusher and the drive — is written as **an arc with a section spike
on top**. Measured, seed 1, the crusher's return level:

```
before dawn   setting out   into the deep   the fight   the long way home
  0.000          0.002          0.032         0.381           0.105
```

It ends at a third of where it peaked and it never returns to the nothing it
started at. "Triumphant but thinned: something was lost."

**The first version put the residue on the return levels alone and it did not
work.** Measured: every send *into* the DP/4 was at zero for the bars before the
outro, and a return level with nothing arriving at it is silence — the crusher
vanished and came back. The sends carry an arc of their own now.

### 8.5 The dead knobs that earned a line

Of the 34 fx knobs no genre had ever moved, this table moves eight: `flange.rate`,
`flange.fb`, `echo.tone`, `desk.mid`, `dp4.bLvl`, `dp4.cAmt`, `dp4.cLvl`,
`dp4.dLvl`. They are here because the story wanted them, not to tick them off —
`echo.tone` says how *far* a repeat is (bright is a hard surface a few metres
away, dark is a long way off), and `dp4.dLvl` is a phaser that is silent for
nineteen of the twenty minutes and arrives for the walk home alone.

### 8.6 The null test — is any of it a decimal?

The whole scheme rendered against the same record with fantasy synth's `motion`
block removed and nothing else changed. Same seed, same form, same notes, the
inherited dungeon-synth lanes still running underneath. The residue is how much
of what you hear is this table:

| movement | dB below the excerpt's own signal |
|---|---|
| before dawn | −20.5 |
| setting out | −16.5 |
| into the deep | −8.2 |
| the fight (chorus) | −4.4 |
| the fight (instrumental) | **−1.7** |
| the long way home | −9.5 |

Read the column, not any one number: it is the story's own shape. At the fight
the difference the desk is making is within two decibels of the entire mix.

**And the audio proxy that was tried first is not in this table, because it did
not survive a second render.** A "how much energy sits in the quiet half of the
window" measure gave a clean room curve on one render and a different answer on
the next — it is dominated by which notes fall in a two-bar excerpt, not by the
reverb. *A measurement that agrees with you is the dangerous one.* The null test
is the one that answers the question actually being asked.

---

## 9. A one-function movement is exactly two sections long

**Found while measuring the automation, and it is the more important finding.**

The record was running **13:47 against an ask of twenty minutes**, and three of
the four movements were at a third of their declared length:

| movement | declared | actual |
|---|---|---|
| setting out | 96 bars | 32 |
| into the deep | 128 bars | 32 |
| the fight | 160 bars | 160 |
| the long way home | 40 bars | 32 |

**The cause is H1, the rule of three:** "a function cannot follow itself twice."
A movement whose pool holds one function can therefore admit it exactly twice,
and then `lawful` returns false, the phase walk's fallback finds nothing legal
and hands over — silently, and *correctly*, because H1 is a law and a budget is
only a budget. Only the fight escaped, because it alternates two functions.
Dungeon synth's own plan gives every phase two or three functions and never met
this.

So a one-function movement's length is `2 × lengths[fn]`, and its `bars` budget
is a statement about it rather than a draw on it. The fix is `form.lengths`:
verse 48, bridge 60, outro 84 — since each movement owns its function, the
per-function lengths *are* the movement lengths.

### 9.1 The journey home is the outro outright

It was a `verse` phase plus a 64-bar outro, which put the walk home on the
**same section function as the walk out** — so no `section` lane could tell the
two apart, and the story's last movement was written in a hand the desk cannot
read. An outro can only be last and comes exactly once, which is what that
movement needs.

### 9.2 `form.setMode` — a chord set does not have to own a phase of the walk

`plan` is the walk's business; a set's **mode** is harmony's. They coincided
while every movement was a phase and stopped the hour a movement moved into the
outro, which sits outside the plan by a hard law. `form.setMode: { C: "minor",
B: "phrygian", lift: "mixolydian" }` is where that is written now, with the plan
keeping precedence where both speak. Registered in `BLEND_DRAW` and grouped with
`form`, for the reason `form.plan` already is.

### 9.3 And the tempo range was the other half of the length

84–108 is a 29% spread, and on a record whose sections are fixed in **bars** it
lands directly on the running time: eight seeds ran 18:25 to 23:20. A tempo
range on a three-minute song moves the clock by seconds; on this one it moves it
by a whole movement. At 92–106: **18:53 to 21:20, mean 19:54.**

Measured across eight seeds after the fix — the four movements at 21–27% of the
record each, and the fight ending at **78%** every time:

```
seed  bars  total   dawn  setting out  into deep  the fight  long way home  fight ends
   1   472  18:53    4%      25%          25%        24%         22%          78%
   3   492  21:10    4%      22%          24%        28%         21%          79%
   5   500  20:12    4%      24%          26%        25%         21%          79%
   8   496  18:54    4%      25%          24%        25%         21%          79%
```

---

## 10. And the stacked fifth is not always a fifth

`drone.stack` is written in semitones, so `7` is a perfect fifth above the
drone's root — and **one degree of every mode has a diminished fifth**, where
those same seven semitones land on a note the key does not have. Held under the
whole record, which is the worst place in the program to put an out-of-key note.

It threw `out of key, not in the chord, and does not resolve into the next one,
in A: drone 32 bar 0` on **two blends in two hundred and forty** — never on a
solo genre, because the fifth only lands on the bad degree when a blended mode
pool puts the drone there. Exactly the kind of defect that waits for the blend
suite.

**The fix is the one the music already made.** Parallel organum has this problem
in the ninth century and answers it the same way: where the fifth would be
diminished the voice does not follow, and the interval becomes a fourth. A
stacked interval that lands out of the mode is nudged to the nearest one that
does not — a semitone first, then a tone — and dropped only if nothing within a
tone works. Arithmetic, no draws.

## 11. State

- 5 genres × 32 seeds: **0 throw**
- lofi, synthwave, dungeon synth, boxcar: **0 of 32 records changed**
- blends, 240 pairs: **2 throw, down from 3 at the previous build.** Both
  remaining are the same "out of key" family on a *blended harmony table*
  (`dungeonsynth:70+boxcarsynth` seed 3, lead; `boxcarsynth:50+fantasysynth`
  seed 6, keys2). Neither is a drone. Recorded in the backlog.
- offline render vs live: **−91.4 dB** below signal
