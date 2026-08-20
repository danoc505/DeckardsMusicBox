# A movement is a first-class thing — and the desk had two owners

> "the drums have the same error from the matrix mixer issue NOT saying that is
> the reason, the low sounding drums blow out the frequency they are not the low
> sounding drums they used to be its shit. Next each 5 min is its own song, its
> own leg. Youve made 5 min sections and its horribly boring. It is a 20 min
> song broken into 5 min pieces the whole thing connected by its motif
> instruments and story being told with it" — owner, 2026-08-20

Both correct. Both mine.

---

## 1. The low drums — and it was not the drums, the matrix, or the drum bus

**The solo kick rendered bit-identical in the build before this work and the
build he heard.** That is the half of the measurement that says what it is
*not*: nothing changed about the drum voices, the kit, the drum bus, or the
matrix. Same file, same samples, same numbers.

What changed was the **desk**, and here is the count (fantasy synth, seed 1,
against `8ee9d66`, the build before any of the FX work):

| | before | the build he heard |
|---|---|---|
| mix RMS | −17.5 dB | −13.0 dB |
| **under 120 Hz** | **−22.4 dB** | **−15.5 dB** |
| crest (peak − RMS) | 14.5 dB | 11.3 dB |
| `desk.low` | −3.0 flat | −1.75 … **+3.43** |

Seven decibels of low shelf and three decibels of dynamics gone. A mix-wide low
boost is exactly what "the low drums blow out the frequency" sounds like,
because the low shelf is the one band where **every** part overlaps — a decibel
there is a decibel on everything at once.

### The cause: two owners on one knob, and nothing measured the sum

`desk.low` had a hand-written `section` lane (the story: *"the low end warms all
the way home"*) **and** an `fxPlan` line reading `weight`. I wrote the words

> "both are declared, both compile to lanes on the same controls, and they SUM —
> which is what an engineer riding a desk over a written arrangement is doing"

and never measured the sum. Each lane was defensible alone; together they ran
+6.4 dB above where the parent genre sits.

**And it was not only the desk.** The same probe found `matrix.keysRoom` pinned
at the bottom of its dial for **21%** of the record and `leadRoom` for 14% —
the story lane and the planner both cutting the room, summing past the floor.
Travel written that is not there, which is the 10a-law defect from the other
direction.

### The rule this earns

**A tone shelf across the whole mix is a mixing decision, so it belongs to the
thing that measures the mix.** The story keeps the *effects* — room, echo,
drive, flanger, barberpole — which are colours a narrative can have an opinion
about. The desk is not a colour; it is the level of the bands.

So the three `desk` section lanes are gone, the planner owns all three bands
alone, and the travel is written with a stated ceiling:

```
low    -3 base, -1.2 .. +1.2   ->  never above -1.8 dB
high   -1 base, -3.0 .. +1.8   ->  never above +0.8 dB
mid     0 base, -1.5 .. +0.8
```

The war drum's crusher send came down to a third of what it was (0.53 → 0.18):
a bit crusher works on a snare because a snare is already noise; on a 52 Hz drum
head it is intermodulation, which is what "blows out" means in numbers.

### Measured after (seed 2 — `dronebox` in every build, so it is a fair A/B)

| | `<120 Hz` RMS | crest |
|---|---|---|
| before any FX work | −18.5 dB | 12.1 dB |
| the build he heard | −18.0 dB | 11.7 dB |
| **now** | **−19.0 dB** | **13.5 dB** |

Back where it belongs, with more dynamics than the build he liked.

### And the probe that should have existed

`stack.js` reports, per control: **how many lanes write it** and what the sum
actually reaches across the record, with a clamped-percentage column. Nothing
measured the total before. Every finding above came out of one run of it.

---

## 2. "Each 5 min is its own song" — and the diagnosis is not repetition

**Measured first.** 88% of the bars in one of these records are note-shapes not
heard before in their own section. Nothing is looping. (The first version of
that probe hashed onset times to 10 ms and reported *every* bar as unique —
that is the groove, not the music. Hashing pitch-and-step is the question an ear
asks.)

The fault is **arrangement states**. Every arrangement device in this program —
who enters, at what energy, which drum level, where the fill is, where the empty
is — works *per section*. So:

| | longest single unchanging state |
|---|---|
| the build he called boring | **3:22** (the outro), 2:24 (a verse) |
| now | **0:55** |

Nearly six minutes of that record sat in two states. A sixty-bar section is one
arrangement state for three minutes.

### Why the sections were sixty bars — a chain of forced moves

1. `tempoArc` and `form.material` both keyed on a section's **function**.
2. So each movement needed its **own** function, or one leg's tempo and chords
   would leak into another.
3. There are only four freely-usable functions (`prechorus` must reach a chorus;
   `postchorus` may only follow one), so with four movements that is one each.
4. **H1, the rule of three**, says a function cannot follow itself twice — so a
   one-function movement admits exactly **two** sections and hands over.
5. The only way to make two sections last five minutes is to make them enormous.

Every step follows from step 1.

### The fix: a section carries the movement that admitted it

The phase walk always knew which entry of `form.plan` admitted each section and
threw it away. It records it now as `sec.mv`, and three lookups ask the movement
first and fall back to the function:

- `tempoArc.by[s.mv] ?? by[s.fn]`
- `form.material[s.mv] ?? material[s.fn]`
- `motionAt`'s `section` kind, via `plan.secMv`

A genre with no plan records nothing and every lookup falls straight through —
bit-identical, which is what the 24-record check holds it to.

**So functions are free to repeat across legs.** Fantasy synth's plan is now
four legs of two functions each, sixteen bars a section:

```
setting out        verse + instrumental
into the deep      bridge + verse
the fight          chorus + instrumental
the long way home  verse + instrumental
```

`verse` appears in three legs and means something different in each, because
the **movement** decides the chord set, the mode and the tempo. That is the
point of `mv` existing.

The walk home is a **leg** again rather than the outro — it had been the outro
outright precisely because material was keyed on the function, and the cost was
that it was one section, three minutes, one state. The outro is a sixteen-bar
tag now.

### Measured across eight seeds

```
seed  bars  total   dawn  setting out  into the deep  the fight  long way home   tag   fight ends
   1   472  18:53   0:50   3:57 5sec     3:47 6sec    4:42 9sec    4:42 6sec    0:55    70%
   3   504  21:41   0:53   4:36 6sec     5:40 8sec    4:30 8sec    5:02 5sec    0:59    72%
   7   468  20:08   0:54   4:27 5sec     5:04 7sec    4:40 8sec    4:03 5sec    0:59    75%
```

Four legs of 4–6 minutes, **4 to 9 sections each**, the fight ending at 70–75%
of a ~20-minute record. What is connected across them is unchanged and is the
point: one motif, transformed per leg (whole → fragmented → diminished →
augmented), the same instruments, the same story.

### And it fixed a second defect on its way past

The FX `section` lanes had been keyed on `chorus` and `instrumental` separately,
and had to be: a lane naming only one of the two **blinked** off and back four
or five times across a fight that alternates them. The key is `"the fight"` now
— one movement however many functions it is built from — so there is nothing
left to blink. Keying automation on a section *name* meant every lane had to
know which names a leg happened to be assembled from.

---

## 3. What I broke doing it, and how

Rekeying 56 lane keys with a line-based transform went wrong twice:

1. **It dropped the `instrumental:` lines — and those lines carried the closing
   brackets.** Nine `by: { … }` objects were left unclosed.
2. **It duplicated closers** where `outro:` was the last key, and it **missed
   keys written inline** after `by: {` on the same line.

Then I tried to repair it with a loop that *guessed* where closers belonged,
which made it worse. The thing that actually worked was writing a **real
scanner** — one that skips `/* */` comments and `"…"` strings, so brackets in
prose and in `[corpus:…]` citations cannot be counted — and letting it name the
exact line and the exact open bracket. A lazy `count("{") - count("}")` had
reported a 35-bracket deficit that did not exist, because this file's comments
are full of brackets.

`docs/` keeps the scanner. A structural edit to a table this size needs a
parser, not a regex.

---

## 4. State

- 4 genres × 32 seeds: **0 throw**
- lofi, synthwave, dungeon synth: **0 of 24 records changed**, byte for byte
- blends, 144 pairs: **0 throw**
- offline render vs live: numerical floor (−114 dB absolute)

---

## 5. Each leg is its own microgenre

> "the last section is Modal ambient dungeon synth (why not have the motif fade
> off into the atmosphere?), the first section Modal fantasy synth, the second
> Modal dinosynth inspired the toms take front role and lead, the rest is
> harsher and getting more amped up, the third Modal orchestral dungeon synth
> where everything opens up and its moving and large" — owner, 2026-08-20

This only became **sayable** once the tables stopped asking "what is this
section called". Five of them did, and all five ask the movement first now:

| table | what a leg can now own |
|---|---|
| `form.tempoArc` | its speed |
| `form.material` | its chord set |
| `form.energy` | its weight — **and its drum rung**, which is ⅓ energy |
| `form.roles` | **its band** |
| `form.setMachines` | **its instruments** |

Plus two new, both keyed the same way: `kit.arc.floorAt` (a floor on the drum
ladder) and `kit.arc.setAt` (the drum override itself).

### The four legs, measured

```
                    band                              lead        drums
setting out         full, no counter                  drawn       rung 1, toms 7-15%
into the deep       drums bass keys2 lead drone       bassOboe    rung 2, toms 27-34%
the fight           all eight roles                   carnyx      rung 3, kick 36-45%
the long way home   keys lead drone only              —           NONE
```

- **Modal fantasy synth** — the genre's own draw, left alone. Sometimes a brass
  band, sometimes the Erang pack; that is what makes it the default.
- **Modal dinosynth** — the pretty half of the band is out (no counter, no
  ostinato, no keys), mellotron on the second keyboard, a bass oboe on the tune.
  The repo's own research is one practitioner and says so — *"one timpani hit on
  beat 1 of each bar"*, *"dinosaurs steadily marching on"*, and its own note that
  **"DINO SYNTH PERCUSSION REMAINS SINGLE-SOURCED"**. Taken at that strength and
  no further.
- **Modal orchestral dungeon synth** — every seat filled, horns on the chords,
  brass under them, the war horn carrying the theme.
- **Modal ambient dungeon synth** — **no drums, no bass, no ostinato**. The
  drone, the chords and the tune, over the loudest atmosphere bed in the record.
  The motif fading into the air is the arrangement losing its parts while the
  bed comes up.

### The fight's room: a decision overturned

Two builds ago the room **closed** for the fight, on the film-scoring argument
that distance *is* the reverb and dry is close and close is violent. That is
right about a fist fight in a corridor. *"Everything opens up and its moving and
large"* is an orchestra in a cavern, where the size **is** the climax — so the
rooms and delays open for it now, and the record's two widest places are the
fight and the walk home. The old reasoning is kept at the lane rather than
deleted: it is correct about a climax this record does not have.

### Two things I got wrong here, both caught by measuring

1. **A ladder cannot express "the toms take the front".** The first attempt was
   `kit.arc.floorAt`, moving the descent up the drum ladder. Measured: its toms
   went from 13% of hits to **7**, because *which* override sits on which rung
   is a per-song draw and rung 2 on that seed had no tom move in it. "More" is
   not "this". `kit.arc.setAt` — the override itself, merged over the rung — is
   the lever that works.

2. **I blamed the sub tom for a low end that was not the problem.** The descent
   came out the hottest section in the record (RMS −10.1 vs the reference
   build's −14.9, crest 8.8 vs 12.1). Having just been told the low drums blow
   out, I pulled `tom3` off the loop. **It moved nothing** — under 120 Hz went
   −15.0 → −14.6, crest stayed 8.8. The numbers say the section is 4.8 dB louder
   *overall* and its low end is proportionally **less** dominant than the
   reference's (−4.5 dB below its own RMS against −3.6). It is the loudest leg
   of the record reading as the loudest leg, which is what was asked for.

   The lane restriction stayed anyway, for the reason that *did* survive: with
   `tom1`/`tom2` looping, the kick falls from 35–50% of the leg's hits to 17–23%
   and the toms rise from 7–15% to 27–34%. That is the brief in numbers.

## 6. State

- 4 genres × 32 seeds: **0 throw**
- lofi, synthwave, dungeon synth: **0 of 24 records changed**, byte for byte
- blends, 144 pairs: **0 throw**
- offline render vs live: **−83.7 dB** below signal on a −30 dB excerpt
  (−114 dB absolute, the numerical floor)
- no clipping anywhere in a 63-render sweep
