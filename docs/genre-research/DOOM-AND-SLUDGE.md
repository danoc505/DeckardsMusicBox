# Doom and sludge, brought back into dungeon synth

The owner's brief: dungeon synth came out of black metal, this genre's file
already says it is "the church, through a sludge rig", and the rig was not
doing what a sludge rig does. Research first, then what was measured, then
what was changed and what it cost. Every number is a named source or a
measurement of this program; anything neither is marked `[chosen]`.

Measurements are on dungeonsynth seed 42 at 45 s unless a seed is named, and
the eight proof seeds are `8660 178 2741 5665 9423 9647 2514 218`, drawn from
`crypto.randomBytes` before any of this was written.

---

## 1. What the sources say

**Where the sound comes from.** The line that reframes the rig:

> "The key to a great Doom sound is a high powered amp **set pretty clean**.
> The guitar pedals do **almost all of the heavy lifting** in this genre, but a
> good foundation is vital." … "your pedals, amp and cabinet will have more of
> an influence than your guitar on your Doom tone."
> — boostguitarpedals.co.uk, "How To Get A Crushing Doom Metal Tone"

Also there: octave pedals "pitched one or even **2 octaves down** for the
heaviest, filthiest sound"; **C standard** is "perhaps the most common tuning
for Doom today" and **B standard** "about as low as you'll commonly find".
Gain "around **60-70%**" — "enough gain to sustain notes and create that thick
wall of sound, but not so much that the tone becomes muddy" (singularsound,
studentofguitar). For sludge: "keep it **scooped** and you can even push the
bass to its limits" (singularsound).

**How it is written.**

> "Riffs unfold slowly, **chords are held for a long time**, and **pauses are
> just as important as the notes played**. Power chords, parallel fourths /
> fifths, and sustained unisons enhance mass." … "The **bass plays a central
> role** and reinforces the heaviness of the sound, while the drums are usually
> used sparingly." … tempo **50–90 bpm**; "minor keys and dissonant chords,
> including the use of the **tritone** interval to generate an atmosphere of
> dread."
> — easure.net, "Doom Metal Explained"

> "The natural minor scale (also known as the Aeolian mode) is a staple in the
> genre." Phrygian for "a distinctive, exotic sound that can add a mysterious or
> unsettling quality." "The tritone, also known as 'the devil's interval,' has a
> long history in music as a tool for creating tension." Power chords with added
> minor seconds or major sevenths. "It's about letting each note breathe and
> resonate." "A well-placed pause can be just as powerful as a crushing chord."
> "The genre thrives on simplicity and repetition."
> — riffhard.com, "How to Write Doom Metal Riffs"

Sludge is "a fusion of the doom metal and hardcore punk genres": "heavily
distorted instruments, sharply contrasting tempos", riffs "repetitive and
riff-driven, building tension through extended, cyclical patterns that
prioritize groove and momentum over melodic resolution" (en.wikipedia,
Sludge metal; tungstenofficial.com).

Two of these land on things this branch had already built from the other
direction. "Chords are held for a long time" is `harmony.chordBars`; "the drums
are usually used sparingly" is the sentence this genre used to over-read, and
doom itself says it — with the bass carrying the weight instead.

---

## 2. What the rig was measured to do

The genre file described "a wall of sound". On seed 42:

| | moves the record | level | low/high tilt | crest |
|---|---|---|---|---|
| the whole rig, on against off | **−8.6 dB** | +0.7 dB | 46.4 | 5.9 |
| without the sag | −9.8 | | | |
| without the Muff | −12.4 | | | |
| without the overdrive | −12.3 | | | |
| without the sub | −19.3 | | | |
| without the comp | −28.3 | | | |

The power supply sagging did nearly as much as everything else together; the
Muff — the doom fuzz, the centrepiece — did less.

**The gain knob was dead across its top half.** The Muff's `sustain` against
the record as it shipped (0.62):

```
sustain 0.05   pre-gain    4x    moves  -22.7 dB
sustain 0.20   pre-gain   10x    moves  -26.7 dB
sustain 0.40   pre-gain   30x    moves  -33.7 dB
sustain 0.62   pre-gain  107x    (shipped)
sustain 0.80   pre-gain  303x    moves  -39.8 dB
sustain 1.00   pre-gain  960x    moves  -36.8 dB
```

`pre = 3 × 320^sustain`. At 107× the clipper is already square, so turning the
fuzz UP to maximum moved the record −36.8 dB — below `starve` (−29.5) and a
decibel above this program's own −40 dB "did not happen" floor. `grind`, the
treatment the genre calls "the wall leaning in", scales this knob by 1.6 and
so could not make anything heavier. **The only direction with headroom was
down.**

**And the blends compounded.** Each pedal sat at 30–50% wet and each board was
fed at 0.25–0.85, so roughly a quarter of the signal met the Muff:

| | moves | low/high | crest |
|---|---|---|---|
| every pedal fully wet | −8.4 | 39.7 | 6.6 |
| every fed board at full | −11.6 | 62.9 | 5.6 |
| **both together** | **−3.9** | 21.4 | 6.5 |

Both together was the largest desk move available anywhere in this program,
and unused. And crest never moved: a rig described as a wall had no squash in
it at all.

---

## 3. The musical gaps, measured before

| the sources | this genre, before |
|---|---|
| the tritone, doom's defining interval | **0 of 1440 chords** — `diminished: "avoid"` filtered every progression that reached the diminished degree |
| natural minor **and Phrygian** | Phrygian weighted 1 of 8; drawn in **17%** of records |
| the bass is central | bass absent from the `protagonist` pool — "a character has to be distinguishable from the thing beside it" |
| chords held a long time | built earlier on this branch (§10 of `DUNGEON-SYNTH-ARRANGEMENT.md`) |
| pauses as powerful as chords | 1–4% silence — **not changed here, see §6** |
| scooped mids (sludge) | `mids: 0.55`, deliberately filling the Ram's Head notch back in |

---

## 4. What was changed

All in `dungeonsynth.ts`, one fix in `bass.ts`.

**The rig is in line** (`SLUDGE_RIG`). Every pedal mix to or near 1: comp 0.35
→ 1 with sustain 0.55 → 0.8; sub 0.3 → 0.6 with the second octave 0.15 → 0.35;
Muff 0.5 → 1; overdrive 0.4 → 0.85; sag 0.5 → 0.8. **The Muff's gain brought
DOWN into its live range**, 0.62 → 0.45 (107× → 40×), so `grind` at ×1.6 lands
at 0.72 (190×) and is heard. Mids 0.55 → 0.35, toward the scoop and not to it.
Feeds up: drums 0.25 → 0.6, bass 0.85 → 1, keys 0.7 → 0.9, drone 0.55 → 0.85;
the flute still walks no board, because it has none.

**The tritone let in** — `diminished: "allow"`. A third of this genre's chords
are bare fifths, and a bare fifth on the diminished degree is a power chord
with a flat five, which is doom's chord.

**That exposed a bug in the bass, fixed where it was.** `bass.ts` read a
chord's fifth as `tones[2] ?? root + 7`, right for a triad and wrong for a
two-tone chord whose fifth is diminished: on (root, root+6) it wrote root+7, a
note outside the scale, and the materials check refused the record — 2 of 60
seeds. A bare fifth's fifth is `tones[1]`. Zero refusals over 200 seeds after.

**Phrygian 1 → 3, dorian 3 → 2. The bass into the protagonist pool at 2.**

**The supply sag cut to 0.3 and its battery to 0.8 — found after the rig went
in line, and it is the real wall.** See §5a. `revive` is now stated in the
treatment table beside `starve`, because the reason it was left out ("a genre
whose battery is not already full") stopped being true.

---

## 5. What it did, on seeds nobody chose

**The rig**, seed 42, before → after:

| | before | after |
|---|---|---|
| whole rig on/off | −8.6 dB | **−2.5 dB** |
| the Muff's gain, ×1.6 (grind's move) | −36.9 dB | **−26.3 dB** |
| `grind`, the treatment | −15.5 dB | −18.1 dB |
| low/high tilt | 46.4 | 36.7 |
| crest | 5.9 | 6.1 |
| record RMS | −17.4 dBFS | −18.2 dBFS |

The rig now moves the record six decibels more than it did — the largest desk
contribution in the program — and the fuzz's gain knob is alive again. Two
costs in that table, both honest: the record is **0.8 dB quieter**, and the
Muff's level knob is not the lever for it (0.85 → 1.1 recovers 0.2 dB); and it
is **brighter**, 46 → 37, because that is what a fuzz does — it makes upper
harmonics — and this genre's guide asks it to avoid bright top-end. It is still
37:1 dark. Listen before deciding.

### 5a. The sag was the anti-wall

The rig-in-line numbers above paid three costs — quieter, spikier, brighter —
and all three had one source. The supply sag is an **expander**: the transient
passes before the rail notices, the body of the note collapses under it, and
the clipping goes asymmetric as it does. On the bass alone, the sag as the only
pedal in line: crest **6.45 → 17.4**, level **−27.7 → −43.7 dBFS**. The
rig-in-line change had raised its mix 0.5 → 0.8 — the wrong way. Sweeping
only that knob on the whole record, seed 42:

```
sag mix 0.8   RMS -18.2 dBFS   crest 6.1   low/high 37
sag mix 0.5   RMS -16.4        crest 5.3   low/high 60     (before this branch)
sag mix 0.3   RMS -15.2        crest 4.8   low/high 73
sag mix 0.0   RMS -13.5        crest 4.0   low/high 88
```

Every step of sag taken out is louder, more squashed and **darker** at once. It
does what a compressor would have, and the source is already on that side:
"more power equals more volume and headroom… consider 50 watts as the bare
minimum" (boostguitarpedals) — a doom amp does not sag. Set to **0.3**: a hint
of tired rectifier, not a collapse.

Then `revive` fell under the treat floor (−43.5): with less sag, raising a rail
already at 1 has even less to do — the fault this genre's file had named all
along. Swept `sag.idle` against `sag.mix`:

```
idle 1.0  mix 0.3   revive -43.5   starve -34.1
idle 0.9  mix 0.3   revive -40.0   starve -35.6
idle 0.8  mix 0.3   revive -37.4   starve -37.6   RMS -15.2   crest 4.8
idle 0.8  mix 0.4   revive -34.2   starve -34.4   RMS -15.8   crest 5.0
```

**`idle 0.8, mix 0.3`**: both halves of the pair over the floor with the same
margin, nothing lost in level or squash. Seed 42 on the final rig: RMS
**−15.2 dBFS** (2.2 dB louder than before the branch), crest **4.8**, low/high
**73** (darker than before the branch), rig on/off **−1.6 dB**, grind −11.1,
darken −8.5, motion **−31.7 dBFS** on the test's own metric.

Four proof seeds, the desk only (the notes are §5's table), before the branch
→ final:

```
seed    RMS dBFS          crest        low/high
8660   -16.0 -> -13.3    4.7 -> 3.8    42 ->  88
5665   -13.5 -> -14.5    4.2 -> 4.7    81 -> 197
9423   -12.9 -> -10.8    3.6 -> 3.0    52 -> 103
218    -12.2 -> -10.5    3.5 -> 2.9    88 -> 150
```

Three of four louder and squashier, all four darker. 5665 — the bass-led one —
is the odd one out, a decibel quieter. **And a flag:** 218 and 9423 now sit
near −10.5 dBFS at crest 3, which puts their peaks at the master's −1 dBTP
ceiling. The record is loud now. **It does not clip:** a census over all eight
proof seeds at genre length finds peaks between −1.0 and −1.4 dBFS and zero
samples at full scale — the tape saturator ahead of the 0.89 ceiling is
already a soft limiter. Whether loud is the wall or too much of it is the
first thing to listen for.

**The harmony**, 200 seeds: tritone chords **0% → 9.8%**, in **46%** of
records. Scales minor 48 · phrygian **25** · dorian 28 (was 49 · 17 · 34).
Protagonist drone 36 · keys 31 · lead 16 · **bass 12** · drums 7.

**Every proof seed:**

```
seed     mode      about   events   keys n  mean-bars    drums n  toms
8660  B  minor     drone     800      218    1.21          193     0%
      A  minor     drone     810      132    2.16          288    28%
178   B  phrygian  lead      859      258    0.86          209     0%
      A  dorian    bass      729      116    1.76          301    29%
2741  B  dorian    keys      878      350    0.96          178     0%
      A  phrygian  lead      777      146    1.39          309    43%
5665  B  minor     lead      405       86    1.40           91     0%
      A  minor     bass      496       56    1.96          144    32%
9423  B  dorian    drone     417      154    1.22           80     0%
      A  dorian    drone     395       82    2.12          130    32%
9647  B  minor     drone     681      276    1.00          128     0%
      A  minor     drone     567       96    1.86          222    24%
2514  B  minor     drums     738      170    1.28          228     0%
      A  minor     drums     912      130    1.68          442    42%
218   B  dorian    lead      645      228    0.69           93     0%
      A  phrygian  bass      642      120    0.93          206    49%
```

Three seeds (178, 2741, 218) re-drew their mode or protagonist because the
weight tables changed: those are re-drawn records, not the same record through
a hotter rig. Seed 5665 is now bass-led — it opens on the bass alone for eight
bars, and the bass is a single pedal note at C2 walking every beat for 72 bars.
That is doom's "sustained unison", and it is also very static.

lofi is byte-identical on 12 records — the bass fix is shared code and changes
nothing where the fifth is perfect.

---

## 6. The bill, and how it was paid

Removing an accidental limit is not free, and this was four at once. Measured
on what the change was NOT aiming at:

**The genre's stated motion fell out of `motion.test.ts`.** Dungeon synth
states two moves — the pad's filter ramping "by a few percent each time the
loop repeats", and the drone's room breathing. With the Muff fully in, the
keys' board ends in a cab corner at 3200 Hz, and a filter ramping 1.9–3.9 kHz
over a signal already cut at 3.2 kHz has almost nothing left to move:

| seed 17279 | both moves | keys pole | drone room |
|---|---|---|---|
| before this branch | −20.4 dB | −30.5 | −20.9 |
| rig in line | −22.5 | −30.8 | −23.2 |
| pole `off` −0.4 → **−0.9** | **−20.8** | **−24.5** | −23.2 |

(relative to the record; the test's own figure is absolute dBFS, so the 0.8 dB
the record lost counted against it too — it read −41.2 against a −40 floor).
The sweep now runs about 1.2–2.4 kHz, under the cab, where the pad still has
body to take away. Same gesture, lower. With the pole alone it read −39.5 dBFS — half a
decibel over the floor. With the sag then cut (§5a) the record is louder and
it reads **−31.7**: comfortable. The test's floor is absolute dBFS, so it
moves with the record's level; named so nobody chases the pole a second time.

**`revive` fell out twice and is fixed once.** Out on the chord change
(−41.9), back on the rig in line, out again when the sag was cut (−43.5) —
every time for the reason the genre's file had written down: a full battery.
`sag.idle` 0.8 gives the rail somewhere to come back to; revive measures −37.4
and is stated in the treatment table beside `starve`.

**`index.test.ts` used dungeon synth as its "genre that avoids the diminished
degree" and the genre stopped avoiding it.** The mechanism is what the test is
for; it now resolves dungeon synth's own tables with the one word put back and
tests on that. The two failures that predate this branch (217, 226) stand.

**The bass found its own bug**, §4 above — 2 of 60 records refused the moment
the diminished degree was allowed through as a power chord. Zero of 200 after.

---

## 7. What was found and not done

**The compressor does not compress, and it turned out not to matter.** The
Dyna Comp on the bass alone: crest **6.45 without it, 9.25 with it** — a 3 ms
attack and a 1.5 s release make it a sustainer, as its own comment says. A
sludge wall was thought to need the other thing, a slow-attack fast-release
limiter this program does not have; the practitioners describe it at the mix
("smashing the crappolla out of it with a nice compressor" on the drum room,
the bass "really squash[ed]" through a stereo compressor — gearspace.com,
"Doom, Sludge, Recording, Production, Mixing", reached only through a search
summary; the page itself returned 403). Then §5a found the squash was already
in the rig, hidden under an expander. A rack compressor on the sum or a part's
line is still a sourced build, and the `fx` mechanism is where it would go; it
is no longer the missing piece.

**The unblended board cost the bass 3.7 dB on its own line** — and the sag
was where it went. With the sag at 0.3 the record is 2.2 dB louder than before
the branch, not 0.8 quieter. Closed by §5a.

**Pauses — the owner's hold, and the measurements that bear on it.** "Notes
are on or off. That is not how instruments work; there is a tail." Measured:
every voice has a release and renders it — organ 0.55 s, flute 0.55 s, pad
4.0 s, pluck 0.03 s, sub 0.21 s after note-off — **but the buffer is cut at
exactly −40 dB** (`TAIL_DB = 40`, then a 4 ms fade), which is where the organ
and flute tails end, not where their envelopes do. In a rendered record that
cut is inaudible: a gate detector over 40 s of seed 42 found **zero** drops of
more than 20 dB inside 10 ms, through the chain and dry, because notes
overlap and the room carries the rest. In a real silence it would not be: −40
dB is a level an ear follows in a quiet passage. So before a pause is written,
`TAIL_DB` wants raising (60 is a tail that ends below hearing; buffers grow
1.5×), and the organ's 0.12 s release wants asking whether a pipe in a stone
room stops that fast. Neither done here. The pause rule is the owner's to
release.

---

## Sources

- boostguitarpedals.co.uk, "How To Get A Crushing Doom Metal Tone" — the amp set clean and the pedals doing the lifting; octave down; C and B standard
- singularsound.com, "Top Doom Metal Fuzz Pedals Compared" — gain 60–70%; sludge scooped, bass to its limits
- studentofguitar.com, "The Best Doom Metal Amp Settings" — gain around halfway, mud above it
- riffhard.com, "How to Write Doom Metal Riffs" — Aeolian and Phrygian; the tritone; pauses; simplicity and repetition
- easure.net, "Doom Metal Explained" — tempo 50–90; the tritone and dissonance; chords held long; the bass central; drums sparing
- en.wikipedia.org, "Sludge metal"; tungstenofficial.com, "Sludge Metal: Origins" — doom and hardcore; cyclical riffs; groove over resolution
- `src/sound/pedals.ts` — the Muff's `3 × 320^sustain` and the Dyna Comp's 3 ms / 1.5 s, both the program's own
