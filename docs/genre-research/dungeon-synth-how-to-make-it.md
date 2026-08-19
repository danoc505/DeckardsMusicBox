# Dungeon synth, sixth pass: HOW TO MAKE IT, ARRANGE IT, AND PROGRAM IT

*2026-08-19. Owner's ask: "a deep dive into how to make dungeon synth music,
how to arrange dungeon synth, how to program dungeon synth, how to make
dungeon synth in a DAW."*

**How this sheet was made.** A fan-out research harness ran five search
angles, fetched fifteen sources, extracted **65 falsifiable claims**, and put
each through three adversarial verifiers before the owner stopped it on cost.
Verification finished for one source cluster and not the others, so **every
claim below carries its verification state**. Claims that were *refuted* are
kept and marked, because a refuted claim is a finding too.

The five earlier dungeon synth sheets in this folder cover *what the genre is*,
its harmony, its drums, its atmosphere beds and its drone. **This sheet does
not repeat them.** It answers the three questions the owner actually asked, and
its new ground is §3 — patch-level sound design, which no sheet here had.

---

## 1. COMPOSITION — how to write it

### 1.1 One mode per piece, and it is not major

The strongest single compositional discipline found:

> "Each piece is built around a single mode." — Vaelastrasz EP production notes

Not one key — one **mode**, held for the whole piece, including synthetic ones
(melodic minor, Dorian ♭2). This corroborates *ranseur*'s "avoids major scales
entirely" already recorded in `dungeon-synth-technique.md` §2, and it is
stronger: it is a rule about the *piece*, not about the scale collection.

**What the program does:** draws minor 5 / dorian 4 / carpathian 3 / phrygian 3
/ andean 1, one mode per record. ✅ Already correct.

### 1.2 The beginner's route is white keys plus key-snap

> "a good starting point is to stick to just white keys which is going to let
> you play in uh c major or a minor and if you wanted to draw your notes in
> there's this feature called key snap that most daws have which lets us lock
> our notes to a key so in this case i'm playing in c minor"
> — Francis Roberts, *How to make DUNGEON SYNTH* (livestream, 4h17m, 2022)

**Verification: SURVIVED** (transcript pulled directly; video identity
confirmed by oEmbed). One verifier partially refuted a *third* component
attached to this claim — "power chords used to thicken a bare melody" — which
has no support in the quote. That part is dropped.

Corroborated independently: *"playing only white keys will almost always sound
good and 'in key'"* — dungeon-synth.neocities.org music-making guide.

### 1.3 The melody rules, which are the only hard numbers anyone gives

> range "no more than about 12 notes apart"; "make the melody have a rise and
> fall. **The high note should only be hit one time. Same for the low note.**"

One octave of range, one arch, and the extremes touched **once each**. This is
already recorded in `dungeon-synth-technique.md` §3 and is **still not built** —
`dungeon-synth-arrangement.md` lists it under "Still not built from this sheet".

### 1.4 Repetition is the device; development is not

> "Keep the melody simple, as dungeon synth often relies on repetitive patterns
> to build atmosphere."

Every guide-level source says the same thing. The genre does not develop
material the way a sonata does; it **restates** it and changes what is around
it. That is an arrangement statement disguised as a melody statement, and §2.2
is where it actually lands.

### 1.5 Intervals: fourths, fifths, octaves

> fourths, fifths and octaves are "generally pretty strong sounding, and have
> been used in all sorts of music for centuries"

Consistent with melodigging's "parallel fifths and open fifth/octave intervals
for medieval color" already in `dungeon-synth.md` §3.

### 1.6 The medieval cadence, which nothing in this repo has yet

New ground. What makes a line sound *medieval* rather than merely *minor* is
mostly **how it arrives**, and the historical practice has named formulas:

- **The Landini cadence** — the upper voice descends from a **major sixth to a
  perfect fifth before ascending to the octave**; the leading tone drops to the
  **sixth degree** before resolving. Used extensively in the 14th and early
  15th centuries. Its whole effect is *avoiding the direct leading-tone
  resolution* — which is exactly the "without requiring functional tonal
  resolution" that the Tamura paper attributes to the genre.
- **The sonority ladder** — "an artful alternation of stable 8/5 combinations
  and mildly unstable 5/3 and 6/3 sonorities." Open fifths and octaves are the
  resting points; thirds and sixths are the motion between them.
- **Parallel organum** — melodies harmonised in parallel fifths and fourths.

**This is the most actionable unbuilt thing in the whole sheet.** The program
has `parallels: 0` (see §5) and no cadence formula that avoids the leading
tone. A Landini-shaped approach is a two-note rule, not a research project.

---

## 2. ARRANGEMENT — how to build a track

### 2.1 Form: short repeating sectional letters

> "ABAB, ABAC, or ABCBC" for beginners; "ABCABC, ABBACC, ABACDDC" as variants.
> "Some songs will have extended intros or outros."

**What the program does:** intro 4 / verse 16 / chorus 16 / bridge 16 /
instrumental 16 / outro 16, material A A B C A A. That is an ABAC-family form
already. ✅

### 2.2 The real motion is additive-subtractive layering, not new notes

> "Experiment with gradual changes in volume, **adding or removing layers**,
> and utilizing fade-ins and fade-outs to create a sense of progression and
> movement within the composition."

> Loop with variation: repeat a simple loop but **change orchestration and
> effects every loop**.

This is the same finding as the owner's own P2 — *"it doesn't mean we need to
change or add notes always, we have options with FX"* — arriving from outside.
Two independent routes to one conclusion is as good as this genre's evidence
gets.

### 2.3 Build the foundation, then offer it several partners

> "When you have a good foundation for either a melody or a chord progression,
> loop it and make **at least 3 or 4 different 'options'** for the other part."

Write one part; write **three or four** candidate counter-parts; choose. That
is a compositional method a generator can literally implement — draw N
candidates for the second voice against a fixed first voice and score them.

### 2.4 Atmosphere goes on LAST, and sparingly

> "underlying drones, background flourishes, little sound effects at impactful
> parts, field recordings, other background textures … There's a delicate
> balance point where things go from atmospheric & meaningful to overused &
> annoying. **Less is more.**"

### 2.5 Percussion is optional and must not lead

> "While not always necessary, you may choose to include percussion … Gentle
> percussion, like soft hand drums or subtle cymbals, can add a subtle pulse
> **without overpowering the atmospheric elements**."

Consistent with melodigging ("sparse or absent", 40–80 BPM when present) and
topfhelm ("used sparingly"). **Three sources, one direction.** See §5 — this is
where our records are furthest out.

### 2.6 Sketch away from the DAW

> *Nahadoth* recommends "pen and paper when composing" for visualising song
> structure outside the DAW, particularly for arrangement.

> The Vaelastrasz EP began from a written sketch fixing only **chord
> progression per section, a meter, a tempo, and a rough form** — melody and
> accompaniment improvised afterwards at the keyboard.

That underspecified sketch is almost exactly this program's CHART → FORM →
MATERIALS boundary. ✅ The architecture already matches practice.

### 2.7 Length: long is normal

Mortiis' founding demo runs "just under an hour", entirely instrumental.
Grunewald's *A Distant Apocalypse* is "15 minutes long". Our records run
10.7–12.8 minutes, which is **in the tradition, not excessive**.

### 2.8 ⚠ REFUTED: the "four things at a time" rule

A claim that the arrangement discipline is a deliberate four-simultaneous-parts
limit imitating four-track cassette workflow was **REFUTED by 2 of 3
verifiers**. The underlying quote is triple-hedged intent from the start of a
livestream — *"i am probably going to try to stick to um only four things
playing at a time"* — not a demonstrated practice. **Do not treat four parts as
a rule.** The 4–6 figure in `dungeon-synth-technique.md` §1 remains the better
evidenced number, and it came from elsewhere.

---

## 3. PROGRAMMING THE SOUND — the new ground

Nothing in this folder covered patch-level design. This is that section.

### 3.1 The two machines the genre's sound actually comes from

Early dungeon synth was played on **the standard workstations of the time —
the Roland D-50 and the Korg M1**. Mortiis recorded his first albums on "one
cheap Roland synth, no sequencers or processors — just a synth recorded live
straight onto tape". Burzum's synth albums were made in prison with a
synthesiser and a normal tape recorder.

Both machines matter because **neither is a subtractive analogue synth**, and
that single fact governs everything below.

| | Korg M1 (1988) | Roland D-50 (1987) |
|---|---|---|
| engine | PCM ROMpler — 4 MB, 16-bit; 100 multisounds + 44 drums | **Linear Arithmetic**: short PCM attack + subtractive sustain |
| filter | VDF lowpass, velocity-sensitive, **non-resonant** | filter per partial |
| envelopes | 3 × **AADBSSRR** | per partial |
| structure | osc modes incl. Double (two multisounds layered) | **7 partial structures** |
| effects | reverb, delay, phaser, tremolo, exciter, ensemble, overdrive, EQ, chorus, flanger, rotary — onboard | onboard chorus + reverb |

**The D-50's founding insight**, and it is a sound-design principle rather than
a spec: Roland's engineers determined that *the ear identifies an instrument
mainly by its attack, not its sustain*. So the D-50 stores 47 attack samples in
ROM and dovetails them into a synthesised sustain.

### 3.2 Six consequences for how you program a dungeon synth patch

1. **The attack sample is the identity.** Get the first 100 ms right —
   breath, bow scrape, hammer, pluck — and the sustain can be a plain
   synthesised tone. This is the D-50's whole thesis.
2. **No resonance.** The M1's filter has none. The classic tone therefore has
   **no squelch, no self-oscillation, no filter-sweep gesture**. If your patch
   sounds like an acid line with a cathedral on it, it is the wrong machine.
3. **Layering replaces oscillator richness.** With one PCM source per
   oscillator and no resonance, thickness comes from *stacking multisamples*
   (M1 "Double" mode) and from detune — not from filter drive.
4. **Envelopes are long and multi-stage.** AADBSSRR exists so a note can rise,
   break, and settle differently. Our own reference audio measures the swell
   at **0.35–11 s to full**, many above 3 s, ringing 2–12 s after
   (`dungeon-synth.md` §3a). A 5 ms attack is not this genre.
5. **Bandwidth is limited and that is the sound.** One source puts the M1's
   usable range at ~12 kHz *(single source, unverified — treat as indicative)*.
   Independent of the exact figure, melodigging's "avoid overly bright
   transients" says the same thing from the other end. A gentle high-cut is
   period-correct, not a compromise.
6. **The effects are part of the instrument, not the mix.** Both machines carry
   their reverb and chorus onboard; players heard the patch *through* them
   while programming. Design the patch wet.

### 3.3 Concrete patch recipes

**A soft bell/mallet lead** (forum practitioners, subtractive route):
square-wave oscillator → **low filter cutoff** "to get the soft sound, maybe
some resonance" → **short attack**, with decay/sustain/release by ear. The
target was described as *"too soft to be a traditional mallet, too much decay
to be a pad"*, reminiscent of "MODs from the late 90s" — and explicitly **not
findable in General MIDI banks**.

**A monumental pad on the M1** (MusicRadar, verbatim numbers):

| stage | setting |
|---|---|
| Osc Mode | Double |
| Multisound 1 | Choir |
| Multisound 2 | Clicker (SE), level **40** |
| VDA EG | attack and release "about **50**" |
| VDF 1 cutoff | **00** |
| VDF 1 EG Init | **99**, slow decay, lazy release, Time Polarity + |
| Osc 2 | pitch EG for rising/falling movement |
| FX1 | reverb, **Live Stage**, wet/dry **20**, time **2.4 s** |
| FX2 | stereo delay |

Note the shape: **cutoff at zero, envelope depth at maximum**. The filter is
closed and the envelope opens it — a slow bloom, not a sweep.

**An organ from stock plugins**: multiple instances of a plain subtractive
synth (ReaSynth) used as **additive drawbars**, rather than an organ
instrument. This is the honest way to a chapel organ without a sample library.

**A brass patch**: **velocity routed to filter cutoff**, so harder strikes
brighten. The one place velocity should do timbral work in this genre.

**A pedal bass**: Taurus-style patch with **stereo delay inside the preset**,
not as a send.

### 3.4 The three ways practitioners actually get sounds

Erang, whose sample packs the program already uses, states his own method:

> "VST synthesis from scratch, heavily manipulated presets or distorted &
> layered samples."

And his packs name the genre's palette explicitly — Tome I: *10 keys, 10
strings, 10 leads, 10 pads, 10 percussion, 5 plucked, 5 sfx, 5 noises*; Tome
II: *10 drones, 13 pads, 5 leads, 5 vintage piano, 5 plucked, 5 toms, 10 metal
percussion, 7 weird sounds*. **Drones and pads are the largest categories in
the second pack** — the genre's own reference material weights them highest.

Erang on constraint, which is the most useful thing any practitioner said:

> he limits himself to **just one instrument per album** to avoid getting lost
> in sound design and move forward with composition.

Corroborated independently: an album restricted to a single synth (Logic's ES2)
because "having only that synth at hand was an amazing limitation that inspired
my creativity."

### 3.5 The software palette, as actually named

- **Emulations of the period machines**: Korg M1, Korg Wavestation, Korg
  Polysix, Roland Sound Canvas, VirtualCZ (Casio phase distortion — the CZ-5000
  is named as a source instrument for a specific dungeon synth timbre).
- **FM**: Dexed (free DX7 recreation) — "metallic, haunting, and bell-like".
- **Free general**: Synth1, TAL-Noisemaker, OB-Xd, Vital, Surge XT, TyrellN6.
- **Sampled**: Spitfire BBC Symphony Orchestra Discover, Etherealwinds Harp,
  Crowhill Vaults (Malet Piano, Wavering Choir, Chorus Synth), DSK World
  Stringz ("that Fief-type sound"), Erang's packs.
- **Genre-specific**: a free *Dungeon Synth* Kontakt instrument on Pianobook by
  Tom Coote — wavetable-based, whose author frames the goal as "nasty,
  menacing, lofi, ambient noises" rather than competing with Serum or Vital.

**Hardware, if any**: 1980s–90s ROMplers, samplers and FM/vector machines —
Korg M1, Roland JV-80, Korg Wavestation, Casio SK-1, Ensoniq SQ-80, Yamaha
SY77, Kurzweil K2000, Roland Juno DS. **Not** modern analogue.

⚠ *Caveat recorded by a verifier: the gear list source states its
recommendations are "comprised of items we see recommended over and over again
on Reddit", not independent testing.*

---

## 4. IN A DAW — the workflow, verified

### 4.1 It is programmed, not played

> Verminaard programs "directly into my DAW", given his focus on composition
> over instrumental skill.

The guide's own workflow is: software instrument track → draw region → open
piano roll → enter notes → drag the right edge for length → repeat per track →
export. **MIDI programming, not performance.**

Grunewald is the score-first variant: compose in **MuseScore**, export MIDI,
import to **Ableton Live** for instrumentation and mixing.

### 4.2 Humanise the velocities afterwards

> "I run the MIDI file through a neural network of my creation that assigns
> velocity values to all notes, in other words 'humanizes' the music."

Step-entered notes arrive at a constant velocity; something has to break that
up. Note this is *velocity* humanisation, not timing.

### 4.3 The verified budget toolchain

**Verification: SURVIVED, three separate verifiers, transcript-checked.**

> Reaper + **Plogue sforzando** as a soundfont player + a **free SNES General
> MIDI soundfont** + **Valhalla Supermassive** as the reverb.

> "this sound font the super nintendo general midi sound font … these sounds
> are absolutely fantastic for that sort of like old school dungeon synth type
> of vibe … they remind me a lot of old like 90s keyboards and running these
> through a reverb is going to give you all kinds of great sounds"

The SNES GM soundfont is presented as **the key source of the timbre**. Note
the tension with §3.3, where a practitioner could *not* find his target sound
in GM banks — both can be true: GM gets you the era, not every patch.

### 4.4 Two mix moves, both verified

**High-pass everything except bass and kick.**

> "99 of the time i'm using an eq anything except for a base or a kick drum …
> i am using what's called a high pass filter and taking out some low
> frequency"

…paired with a **low-pass on the bass** so it occupies only the bottom and
fills out the chords.

**Re-stereoise a mono bounce.** Duplicate the mono track to a parallel reverb
channel at **100% wet**, widen it, filter the low end out entirely, blend back.

### 4.5 One reverb for the whole record

> "I use a single reverb, put in a bus channel with sends from all instruments
> leading to it, for the whole track, again to simulate the sound of a symphony
> orchestra, where there is only the reverb of the orchestra hall."

This is the strongest architectural claim in the whole sheet and it is exactly
what this program's matrix already is: one room, fed by sends. ✅

### 4.6 Tape is the finish

> "One question that gets asked all the time: how do I make my song sound like
> it's on tape?" — two routes given: tape-simulation plugins, or **actually
> record the finished music to cassette**.

Named concretely: **Reelbus on the master track**, mix balanced, reverb from a
plugin such as Ambience; some bounce to Audacity to master.

### 4.7 Work from a template, and commit

> "We recorded in Reaper, using **the same template for every track**, so that
> we could begin every piece on the EP with the same instruments, effects, and
> master chain already set up."

> "The mixing was mostly done when setting up the template and when recording.
> When a take was good, we called it done."

---

## 5. OUR RECORDS, MEASURED AGAINST ALL OF THAT

Eight dungeon synth records, measured 2026-08-19.

| | the program | the sources | verdict |
|---|---|---|---|
| tempo | 52–78 BPM | 40–80 | ✅ |
| mode | one per record; minor/dorian/carpathian/phrygian/andean | one mode per piece, never major | ✅ |
| form | intro 4 + 16-bar sections, material A A B C A A | ABAB / ABAC / ABCBC | ✅ |
| one reverb for the record | the matrix's room, fed by sends | "a single reverb … for the whole track" | ✅ |
| length | 10.7–12.8 min | Mortiis ~60 min, Grunewald 15 min | ✅ |
| **voices at once** | **avg 6.7** (min 5, max 8) | **4–6** | ❌ |
| **percussion** | **4.98 events/bar — the busiest part in the record** | "sparse or absent", "used sparingly", "must not overpower" | ❌ |
| **parallel fifths** | **`parallels: 0`** | the genre's identifying harmonic colour | ❌ |
| **timpani roll** | **`roll: 0`** | named by the genre's own sources | ❌ |
| melody arch | not implemented | ≤12 semitones, high and low note once each | ❌ |
| cadence | no medieval formula | Landini / leading-tone avoidance | ❌ |

Per-bar event counts, averaged over eight records:

```
drums     4.98      ostinato  2.87      keys      1.94
bass      1.08      keys2     0.94      lead      0.94
counter   0.07      drone     0.01      tape      0.01
```

**The drums are the loudest thing (`roleGain 1.4`) and the densest part
(4.98 events/bar) in a genre whose three independent sources all say
percussion is sparse, gentle, and must not lead.** That is the single largest
disagreement between this program and its genre.

The `parallels: 0` case is already documented honestly in the program's own
comment: root motion by thirds bought the shared notes and killed parallel
motion, **measured at 0.0% of bar-to-bar steps with the dial on or off**. The
comment names the fix — draw both step and third motion, and apply the organum
appetite only to the stepwise moves — and calls it "a real job and it is not
done."

---

## 6. THE JOBS, RANKED BY EVIDENCE × SIZE

1. **Thin the drums.** Three sources, one direction, and the biggest measured
   gap. Density and `roleGain` both.
2. **Get the parallel fifths back**, by the route the program's own comment
   already specifies: separate step motion from third motion and apply organum
   to the stepwise moves only.
3. **Cut the simultaneous voice count from 6.7 toward 4–6.** `form.roles`
   declares seven roles in four of six section types.
4. **The melody arch** — ≤12 semitones, extremes struck once. A constraint on
   the material stage, not a new instrument.
5. **A medieval cadence** — the Landini shape, or simply a rule that the
   leading tone does not resolve directly.
6. **Switch the timpani roll on.** `touch.roll: 0`, and the genre's own sources
   name it.
7. **Sound design**: closed filter + full envelope depth (the M1 pad shape),
   attack-sample-carries-identity, and **no resonance**.

---

## Sources, with verification state

**Verified by three adversarial verifiers against the primary transcript:**
- Francis Roberts, *How to make DUNGEON SYNTH (Comprehensive music production
  tutorial livestream)*, 4h17m, June 2022 — the toolchain (§4.3), the white-keys
  / key-snap method (§1.2), the mix moves (§4.4).

**Refuted, and recorded as such:**
- "Four simultaneous parts as an arrangement discipline" — 2 of 3 verifiers,
  the quote being triple-hedged intent (§2.8).
- Several inferences drawn from the Wikipedia infobox and genre sentence —
  refuted as over-reading an infobox.

**Fetched and quoted, verification not reached before the run was stopped:**
- dungeon-synth.neocities.org — music-making guide and gear page
- erichgrunewald.com, *How I Make Dungeon Synth*
- Vaelastrasz EP production notes
- MusicRadar, *How to create a monumental digital pad sound using Korg's M1*
- Wikipedia — Korg M1, Roland D-50, Linear arithmetic synthesis, Dungeon synth
- dungeonsynth.proboards.com threads; modwiggler forum
- Erang's Tome I / Tome II sample pack descriptions
- Pianobook *Dungeon Synth* (Tom Coote)
- Landini cadence and medieval composition sources

**Single-source and flagged in place:** the M1's ~12 kHz usable bandwidth.

---

## 7. WHAT WAS BUILT FROM THIS SHEET — `2026-08-19x`

Owner: *"Yes build both (i think we should add power chords into the pool of
chords and we should put a higher preference for pedal tones and shared notes
but we would need a mechanism for transforming chords to achieve that)"* — and
he was right that the transform is the load-bearing part.

### 7.1 The open fifth, as one object under three names

`QUALITY.open = [0, 7]`. A root and a fifth, no third, so the chord states no
quality at all. It is simultaneously a guitarist's power chord, a medieval open
fifth, and the stable 8/5 sonority early polyphony rests on.

**Two notes, not three.** The first version wrote `[0, 7, 12]` — the octave on
top — and 2 of 8 seeds threw *"no keys voicing fits"* within the hour: a
three-note shape with only two pitch classes has inversions that collapse onto
each other, and the voicer ran out of candidates. The octave is a **voicing**
decision and the voicer already owns it.

### 7.2 The cadence: `open` replaces `picardy`

Dungeon synth ended every record it has ever made on a **major** chord — a
Picardy third, a 16th–17th-century device — in a genre whose sources say it
"avoids major scales entirely" and name the open fifth as its colour. `open`
takes the third off instead, and only where the fifth is perfect, so it cannot
put a note outside the mode: it is a **subset** of the chord it came from.

### 7.3 The transform: `voicing: { open, pedal }`

A post-pass over a finished chord set, not a change to the progression draw —
so the measured chord-quality corpus is untouched, declared degrees still mean
what they said, and a genre that says nothing is byte-identical because both
rolls are drawn and discarded [Law 3].

- **`open`** takes the third off, where the fifth is perfect.
- **`pedal`** answers "shared notes" **from the other end**. Re-weighting the
  progression draw toward common tones would move every genre's notes. Adding
  **the key's own tonic** to any chord that lacks it gets the same result by
  construction: every chord then contains the tonic, so **every pair of chords
  shares a note**. That is also exactly what a pedal tone is.

The pedal goes in the octave **nearest the middle of the chord**, not on top —
the first version stacked it above the highest note, which pushed the span past
the keys voicer's 23-semitone filter and threw. It is refused where it would
sound a semitone against a note already there.

Dungeon synth declares `{ open: 0.4, pedal: 0.6 }`.

**Measured, 16 records, keyboard bars:**

| | before | after |
|---|---|---|
| bars sharing a pitch class with the bar before | 60.7% | **69.5%** |
| bars containing the tonic (the pedal) | 70.0% | **75.3%** |
| distinct pitch classes per bar | 3.20 | 2.95 |
| notes outside the mode | 2.59% | **1.66%** |

Out-of-mode notes went **down**, which is the check that matters: neither
transform can leave the key by construction, and the measurement agrees.

### 7.4 The filter envelope — `bloom` / `bloomT`

The samplers had `tone`: one number, held for the whole note. The M1's
monumental pad is programmed **cutoff 00, EG Init 99** — filter shut, envelope
wide open, so the **tone arrives after the level does**. The note blooms rather
than fades in, and this sampler could not do it.

`bloom` is the EG depth (how far below `tone` the filter starts), `bloomT` how
long it takes. Both default to 0 / no-op, so every other genre is untouched. Q
stays at **0.4** — the M1's VDF is non-resonant, and a resonant bloom would be
a different instrument.

Declared per machine, because they are different instruments: strings
0.55 / 2.8 s (near the pack's own measured 0.35–11 s swell), harp 0.12 / 0.30 s
(a pluck whose tone arrives late is a pluck played backwards), lead 0.34 / 1.4 s.

**Measured:** bloom on vs off = **−21.8 dB**, against controls of −75.2 and
−89.2 dB. Real, and large.

### 7.5 What moved and what did not

- lofi, synthwave, boxcar synth: **0 of 6 records changed** — nothing declared.
- dungeon synth: **6 of 6 changed**, which is the point.
- 16 of 16 dungeon-synth seeds compose.

### 7.6 Still not done from this sheet

The parallel fifths (§1.5, and the program's own `parallels: 0` comment names
the route), the Landini cadence, and the melody arch.
