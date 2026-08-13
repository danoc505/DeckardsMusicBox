# GRIT, AND THE FANTASY AXIS — what "gritty and rough but more orchestral" is, in numbers

*Researched 2026-08-13. The owner, on hobbit synth: "a sub genre of Dungeon
Synth but not as doom and gloom, something **gritty and rough** but with a
**more orchestral** feel", and earlier "(Fantasy Synth, Lord of the Rings, the
moody music that plays when the party is adventuring above ground from dungeon
to town)" and "Hobbit Synth shouldnt be as dark and moody as the Dungeon
Synth… Maybe there are better descriptors than dark."*

*Two research halves, because the brief has two: **A** — what grit IS,
acoustically and in production. **B** — what actually separates the bright,
travelling end of this family from the dark, dwelling end. Both halves exist
because of one measurement, which is §1.*

---

## §0 HOW THIS SHEET WAS MADE, AND HOW MUCH TO TRUST IT

**Four kinds of statement appear here and they are not interchangeable.** The
tags are the same ones `score-craft.md` §0 uses, plus one this sheet needed:

- **[SPEC]** — an engineering figure with a standard or a measurement behind
  it. Tape wow/flutter percentages, THD ladders, print-through dB, masking
  slopes. Strongest thing in the sheet.
- **[MEASURED]** — a number somebody counted, including numbers *this build*
  counted out of its own source file. Every one of those says where.
- **[PRACTITIONER]** — an artist or engineer describing what they did, in
  their own words. Weaker than a spec and stronger than a blog.
- **[PROSE]** — an analyst or a production blog asserting something with no
  measurement attached. Weakest, and used only where nothing better exists.
- **[DERIVED]** — my arithmetic on two sourced facts, where no source makes
  the connection. Always labelled, never laundered into a citation.

**What was read.** Sixteen fresh web sources, listed at the end; the program's
own `Deckards Orchestrator MK2.html` at the byte level for §1 and §7; and five
sheets already in this repo (`dungeon-synth-fx-and-balance.md`,
`dungeon-synth-technique.md`, `dungeon-synth-arrangement.md`,
`dungeon-synth-score-and-drums.md`, `lofi-noise.md`, `score-craft.md`
§17–§21/§32/§46, `lotr-themes-measured.md`, and the un-mined
`raw/overworld-and-materials.md`).

**What refused to load.** The Sunday Dungeon Hole Dweller interview (403),
the Flagpole Hole Dweller interview (403), Invisible Oranges' comfy-synth
digest (403), thesession.org's modal-distribution thread (403), the RWU
open-textbook harmonic-direction chapter (403), the Royal Society Interface
HTML (403 — the PubMed Central mirror served the same paper and is what is
cited). Where a claim survives only as a search-index summary it is marked
**[index only]** and is not quoted as though it were fetched.

**One honest limit up front.** Half A is well sourced *as engineering* and
badly sourced *as this genre's practice*. Nobody in dungeon or fantasy synth
publishes a saturation setting. So every number in §8 that is a genre value
rather than an equipment figure is `[CHOSEN]`, anchored to a spec, and says so.
The house rule holds: a defensible reason can still ship an indefensible
number, and the way to find out is to render it.

---

# PART A — WHAT "GRITTY AND ROUGH" IS

## §1 THE MEASURED PROBLEM — there is no field to write it into

**[MEASURED]**, `Deckards Orchestrator MK2.html`, this build. `GENRE.hobbitsynth`
is a deep merge over `GENRE.dungeonsynth` (line 22846). Grepping its whole body
— lines 22830 to 23553 — for every character-and-dirt key gives **one hit, and
it is a pan map**:

```
tape:      not declared
pressure:  not declared
ribbon:    not declared
atmos:     not declared
params:    not declared
drumDrive: not declared
kick:      not declared
groove:    not declared
kit:       not declared
```

So hobbit synth plays dungeon synth's dirt byte for byte:

| field | inherited value | what it is |
|---|---|---|
| `tape.wow` | `[0.0016, 0.0022]` | ±0.16–0.38 % peak pitch deviation at 0.7 Hz |
| `tape.flutter` | `[0.0008, 0.0012]` | ±0.08–0.20 % peak at 7.4 Hz |
| `tape.hiss` | `[0.004, 0.003]` | linear gain 0.004–0.007 on noise band-passed 2–9 kHz |
| `tape.crackle` | `[0.0015, 0.0010]` | linear gain on the vinyl buffer, band-passed 3.4 kHz |
| `pressure` | `{ depth: 0, amount: [0,0], at: [0,0], rise: [0,0] }` | **all zeros** |
| `ribbon` | `{ chance: 0, … }` | **off** |
| `drumDrive` | `1.35` | the drum bus soft-clip depth |
| `groove.jitter` | `{ dilla: 0.03, even: 0.03 }` | ±30 ms uniform, per note |
| `atmos` | `{ level: [0.025,0.025], accent: 0.5, … }` | the crypt's wind beds |

`phasing` is declared by neither genre — dungeon synth's own comment refuses it
on a measured argument (median beat period 805 bars against a 162-bar record),
and hobbit synth inherits the absence rather than a value.

**And "gritty and rough" is not expressed anywhere in the table.** There is no
`sat`, no `drive`, no `grit` on the pitched chain in this program at genre
level at all. The only saturation a genre can currently ask for is
`drumDrive`, which reaches the **drums** and nothing else, and `kick.drive`,
which reaches **one drum**. Hobbit synth's entire dirt vocabulary is: tape
wobble it inherited, hiss it inherited, and crackle it inherited from a genre
whose medium is a crypt, not a road.

**The one thing that is genuinely hobbit synth's own is the room** — `space`
was rewritten with reasons (`irSec` 8.5 → 4.4, `tailDark` 0.62 → 0.44, `wet`
0.5 → 0.36, `sendHp` 70 → 120). And the note beside it already saw this hole
and deliberately left it: *"That is a texture decision about saturation and
voice count, not about the room, and it is a design question for the owner
rather than a number to slip in here."* This sheet is the research that note
was waiting for.

---

## §2 TAPE — four mechanisms, and only two of them are in this program

The four things a tape machine does to a signal are separable and are
separately specified. This program models two.

### 2a. Wow and flutter — the band question is settled

**[SPEC]** The split is a standards question, not a taste one:

| | band | cause |
|---|---|---|
| **wow** | **0.5 – 6 Hz** | uneven capstan rotation, worn bearings, reel tension |
| **flutter** | **6 – 100 Hz** | tape scraping across heads and guides |

[corpus:lofi-noise.md §3, from corpus:reflectiveobserver + corpus:wikipedia
"Wow and flutter measurement" + corpus:babyaudio]. The IEC states the
fluctuation as **a percentage of the centre frequency**.

**[MEASURED]** This program: `TAPE_WOW_HZ = 0.7`, `TAPE_FLUTTER_HZ = 7.4`
(line 7125). **Both are inside their sourced bands** — wow near the slow edge,
flutter just over the boundary. Nothing to fix here; recorded so nobody
re-derives it.

**[SPEC]** How much is audible, in percent:

| figure | what it is |
|---|---|
| **0.03 %** weighted | a professional machine — "practically inaudible" |
| **0.04 %** weighted | Studer A820 two-track at 15 ips, from the published spec [corpus:soundonsound "Analogue Warmth"] |
| **0.08 %** weighted | what "the best cassette decks struggle to manage", and it is "**still audible under some conditions**" |

[corpus:lindos; corpus:recordplayerlab; corpus:soundonsound]

**So ~0.08 % weighted RMS is the floor of audibility for this effect.**
`lofi-noise.md` §3 already recorded the conversion trap and it applies again
here: those are *weighted RMS* figures, a program that swings pitch by ±X % is
stating a *peak*, and **a peak figure is roughly 1.5–2× the equivalent spec
number.**

**[DERIVED]** Running dungeon synth's inherited values through that conversion:

| | peak, as declared | ≈ weighted RMS | reads as |
|---|---|---|---|
| `wow` 0.0016–0.0038 | ±0.16 – 0.38 % | 0.08 – 0.25 % | a struggling cassette deck, audibly |
| `flutter` 0.0008–0.0020 | ±0.08 – 0.20 % | 0.04 – 0.13 % | at the floor to just over it |

**This is the finding that reframes the whole brief.** The genre is *already*
wobbling at cassette-deck levels. What it is missing is not tape instability —
it is **saturation**, which is the half of "gritty and rough" that no field in
this file expresses for a pitched part. §4 is that half.

**And there is a rule about who gets the wobble**, already sourced and already
obeyed: *"A background Rhodes can handle substantial flutter because the notes
blend together anyway, but **the main melody needs to stay steady enough to be
recognizable.**"* [corpus:northernvalleyaudio; recorded in `the-rhodes.md`
§4b]. **[MEASURED]** `ev.wow` and `ev.flutter` are set for
`role === "keys" || role === "keys2"` and for nothing else — so raising wow in
this genre touches the comp and the pad and cannot reach the tune. That makes
wow the *safe* dial and saturation the *risky* one, which is the opposite of
the intuition.

### 2b. Hiss — three sources, one band

**[SPEC]**

| figure | what it is | source |
|---|---|---|
| **60–65 dB** | the dynamic range high-fidelity audio requires; the best 1980s cassettes reached it | [corpus:handwiki cassette formulations] |
| **10 dB** | the *most* Dolby B can ever remove | [corpus:soundonsound tape noise reduction] |
| **−50 to −55 dBFS** | "Real cassette hiss sits around −50 to −55dB relative to full scale" | [corpus:northernvalleyaudio] |

The third figure is new this pass and it **independently confirms the
derivation `lofi-noise.md` §2 made from the first two** — that sheet reasoned a
cheap ferric cassette without Dolby to "somewhere around 50–55 dB down", with
no source that said so. A production source now says exactly that number. Two
routes, one answer; the derivation stands.

### 2c. Print-through — the mechanism this program does not have

**[SPEC]** *"When an analog SIGNAL stored on MAGNETIC TAPE is partially
transferred to the section of tape adjacent to it on a reel, the result is
called print-through and is heard as **a pre-echo**."* Thin tape is "highly
susceptible"; tails-out storage reduces it. [corpus:sfu Handbook of Acoustic
Ecology]

**[index only]** Search summaries put the acceptable band at **−50 to −55 dB**
below signal, with low-frequency print becoming noticeable nearer **−45 to
−50 dB** because bass is less masked by programme material. Neither the SFU
handbook nor the Performer glossary carries a dB figure, so this range is
**not fetched from a primary source** and is recorded, not encoded.

**What it would sound like here:** a pre-echo is a quiet copy of a loud event
arriving *before* it, one tape-layer's revolution early. This program has an
echo unit and a reverb pre-delay; it has nothing that puts a copy of a note
**earlier** than the note. That is a real, cheap, distinctive mechanism and
nothing in the file does it.

### 2d. Azimuth error and dropout — high-frequency loss, two ways

**[SPEC]** *"When the playback head tracks the tape at an angle different from
the recording angle there will be a loss in output… Should either azimuth
deviate from zero, then deterioration in this high-frequency range may
result."* Dropout is *"a brief loss or sudden decrease of signal level… most
often caused by a defect in the oxide"*, and *"high frequencies are more
susceptible to dropouts, as spacing loss increases exponentially with
increasing distance as a ratio of the wavelength of the signal."*
[corpus:performermag analog tape glossary; corpus:thehistoryofrecording,
McKnight, "Azimuth in a Magnetic Tape Recorder"]

**Both are the same audible event: the top end going away and coming back.**
Azimuth error does it *constantly and stereo-differentially* (the two channels
lose different amounts, so the image narrows); dropout does it *briefly and
randomly*.

**[MEASURED]** Neither exists in this program. What does exist, and is the
nearest relative, is `params.dungeonsynth.tr1000.*Cut` — fixed per-drum
low-passes at 8000–9000 Hz — and `space.tailDark`. Both are static. **A
wandering top end is not modelled anywhere in this file**, and it is the single
most characteristic tape artefact after wow.

---

## §3 THE NOISE FLOOR IS ONE BAND, AND EVERY MEDIUM AGREES ON IT

Pulling the four independent figures together — vinyl, cassette, print-through
and the studio's own room:

| medium | level below peak | source |
|---|---|---|
| vinyl disc S/N | **55–60 dB** (≈50 dB in practice) | [corpus:hifiauditions] |
| quality pressing usable range | **55–70 dB** | [corpus:headphonesty] |
| an actual unmodulated groove, measured | **−48 dB**, dominated below 100 Hz | [corpus:diamondcut] |
| cassette hiss, in production terms | **−50 to −55 dBFS** | [corpus:northernvalleyaudio] |
| print-through, acceptable | **−50 to −55 dB** | [index only] |
| a concert hall or scoring stage | **NC-15 to NC-20** — "background noise becomes imperceptible during musical passages" | [corpus:commercial-acoustics; corpus:sonavyx] |

**[DERIVED] Every medium a "gritty" record could be carrying its noise on puts
that noise between 45 and 60 dB under the loudest thing in the record.** That
is the band. It is remarkably tight for five unrelated sources, and it is the
single most usable number in Half A: **grit lives at −45 to −60 dB relative to
peak, and anything louder than −45 dB is not grit, it is a fault.**

**And the room is the exception that proves it.** A scoring stage is
*specified* to have no audible noise floor at all. So a genre that wants both
"gritty" and "more orchestral" is asking for two incompatible media at once,
and the resolution is the one this repo already found for dungeon synth: the
noise is **the medium the orchestra was recorded onto**, not the room the
orchestra is in. `dungeon-synth-fx-and-balance.md` §7 landed its atmosphere bed
at −38.9 dB and its accent at −15.8 dBFS peak by exactly this reasoning.

**One practitioner rule about level, and it is unanimous across every source
that mentions it:** *"use volume automation to push up the level of noise
layers during sparser breakdown sections"* [corpus:musicradar], and *"if you
want audible tape hiss, use it as an effect layer rather than a global
setting… bringing it up in sparse sections and ducking it when the full
arrangement plays"* [corpus:northernvalleyaudio, **[index only]** on the second
clause]. **[MEASURED]** This program already has the lane — `vinylMix` — and
dungeon synth already rides it for the bridge. Hobbit synth declares no motion
on it at all.

---

## §4 DISTORTION — which harmonics, from what, at what level

This is the half of "gritty and rough" the genre table cannot currently
express, and it is the half with the hardest numbers.

### 4a. The device physics, with the harmonic content each implies

**[SPEC]** From a transfer-function analysis of the three device families
[corpus:till.com, "Nonlinearities in Vacuum Tubes, Bipolar Transistors and
FETs"]:

| device | transfer law | harmonics produced |
|---|---|---|
| **vacuum tube** | `i_P = K(μv_GK + v_PK)^(3/2)` — a 3/2 power law | *"the second harmonic distortion is almost equal to the total harmonic distortion for each case"* |
| **bipolar transistor** | exponential (Ebers–Moll) | *"almost entirely 2nd harmonic"* — *"the third harmonic is down over 20 dB below the 2nd harmonic, which is already 20 dB below the fundamental"* |
| **FET** | parabolic / square law | *"we will only see second harmonic distortion, and the level of that distortion will be directly proportional to the input signal level"* |

**The headline from that page is the one that contradicts the folklore:** all
three *"have very similar nonlinearities"*, and both transistor types *"seem to
have less harmonic content above the second harmonic than vacuum tubes."*
**A single device is 2nd-harmonic-dominant whatever it is made of.**

**[SPEC]** What actually splits even from odd is the **circuit**, not the
device [corpus:soundonsound, "Analogue Warmth"]:

> *"Triodes tend to be used in single-ended circuits and produce quite a lot of
> both even and odd harmonic distortions"*, while *"beam tetrodes and pentodes
> are normally used in… class A or AB 'push-pull' power-output circuits, **which
> cancel out the even harmonics, leaving only the odd-harmonic distortions**."*

**Symmetry is the whole mechanism.** A symmetric transfer curve produces odd
harmonics only; an asymmetric one produces evens. This matters for §8 because
**this file already contains an asymmetric saturator and only four voices can
reach it** — see §7c.

### 4b. Soft clip against hard clip, with a THD ladder

**[SPEC]** The best-measured comparison found [corpus:sound-au.com, Elliott,
"Soft Clipping"]:

- **Soft clipping** produces predominantly *"third harmonic, with a smaller
  amount of fifth, and lesser amounts of each additional higher odd-order
  harmonic"* — and because the waveform is symmetrical, *even-order harmonics
  are at vanishingly small amplitudes.*
- **Hard clipping** produces *"high levels of eleventh, fifteenth and
  nineteenth harmonics"* by comparison.
- On identical 2 V peak inputs: **soft clipped 14.6 % THD, hard clipped
  17.6 % THD.** Nearly the same *number* — and audibly nothing alike, because
  the number says nothing about *where* the energy went.
- Bandwidth: hard-clip harmonics extend *"to well over 100 kHz at levels
  exceeding −80 dB"*, where soft-clip harmonics *"are below that level by
  23 kHz."*

**And a ladder, which is the most directly usable table in this sheet** — the
same soft-clip stage measured at rising input:

| input (RMS) | THD |
|---|---|
| 500 mV | **0.28 %** |
| 600 mV | 0.81 % |
| 700 mV | 2.2 % |
| 800 mV | 4.5 % |
| 1 V | **8.9 %** |

**A 6 dB rise in level takes a soft-clip stage from 0.28 % to 8.9 % — a factor
of thirty.** That is why saturation must be swept and rendered rather than
reasoned about: it is the steepest curve in the whole audio chain.

### 4c. Tape and transformer — the two that are third-harmonic

**[SPEC]** *"most tape-recorder alignment procedures use the level of
third-harmonic distortion as a reference measurement"* [corpus:soundonsound],
and **Maximum Operating Level is conventionally defined at 3 % THD**
[corpus:ethanwiner, who measured a real machine's electronics at *"nearly 1 %
distortion through the electronics only"* and, after bypassing its output
transformers, *"from 1.1 % to 0.13 %"*].

**[SPEC]** Transformers: *"hysteresis for low-level signals and saturation for
high-level signals"*, and *"the effect is always greatest for **low
frequencies**, and results mainly in **third-harmonic** distortion."* The
spread between a good transformer and a bad one is enormous — *"one percent, as
opposed to 60 percent at −75 dBu"* [corpus:soundonsound].

**[SPEC]** Tape also *compresses*: *"Loud high-frequency transients simply
don't survive magnetic tape recording"*, so *"the top end inherently becomes
less brash as the transient detail is reduced in level and impact"*
[corpus:soundonsound]. **[PROSE]** Production sources add a *"head bump"*
resonance *"typically around 80–120 Hz"* and warn that *"frequencies below
60 Hz don't benefit from saturation"* [corpus:northernvalleyaudio].

**So the three characters, in one line each:**

| | harmonics | audible character |
|---|---|---|
| **single-ended tube / asymmetric shaper** | 2nd-dominant, evens present | warm, thickening, octave-related, stays in key |
| **push-pull tube / symmetric soft clip** | 3rd then 5th then higher odds | firmer, harder-edged, adds a fifth-flavoured buzz |
| **hard clip** | dense high odds, 11th/15th/19th | aggressive, fizzy, edge-of-broken |
| **tape** | 3rd, plus HF transient loss and level compression | rounded, dulled at the top, glued |
| **transformer** | 3rd, **strongest at LOW frequencies** | weight and thickness in the bottom |

### 4d. How much is audible — the ceiling and the floor

**[PROSE/index only]** The conventional threshold is **≈1 % THD (−40 dB below
the fundamental)** — the figure Amar Bose gave at the 1973 FTC hearings. But
that comes from sine tones through headphones; with **real programme
material**, masking *"may conceal audible distortion until it increases to
levels well above the 1 % level."* Per-harmonic: *"the seventh harmonic is
clearly audible at 1 %, but it will be almost inaudible at 0.1 %"*, and
*"fourth and fifth harmonics at 1 % definitely won't pass unnoticed."*

**[DERIVED] The usable window for deliberate grit is therefore roughly 1 % to
10 % THD.** Below 1 % you are paying CPU for something masked; above ~10 % you
are in the territory the ESP ladder calls fully soft-clipped, which is a
guitar-amp sound and not "orchestral". **1–10 % is the band §8 aims at**, and
it maps onto the ESP ladder as roughly the 650 mV to 1 V rungs of a soft-clip
stage.

---

## §5 GRIT VERSUS MUD — and the distinction has a mechanism, not just a taste

This is the part of the brief nobody writes down properly, and the answer is a
psychoacoustic asymmetry that IS published.

**[PROSE]** What everybody agrees mud is: *"the over-saturation of the low
mid-frequency range… roughly the 200 to 500 Hz range"*, worst around
**250–350 Hz**, because *"nearly every instrument has harmonic content"* there
and *"when multiple elements stack up there… the result is a mix that lacks
definition." *[corpus: several mixing pages, none of which is worth citing
individually and all of which say the same thing]

**[SPEC]** What makes that band uniquely destructive is that **masking is
asymmetric, and the asymmetry runs upward** [corpus:timbreandorchestration.org
(ACTOR), "Masking"; corpus:PMC "The Role of Suppression in the Upward Spread of
Masking"]:

> *"the slope of the high-frequency side is progressively more shallow because
> the excitation pattern extends toward the high frequencies more (this is
> often called '**upward spread of masking**')"*
>
> *"**lower-frequency maskers have more of a masking effect than do
> higher-frequency maskers**"*
>
> *"a masking noise at a lower frequency masks the signal more at higher levels
> than does a masker at a higher frequency than the signal"*

**[DERIVED] — and this is the sheet's own synthesis, stated as such:**

> **Grit and mud are the same energy in two different places relative to the
> parts, and the ear treats those places asymmetrically.**
>
> Distortion generates harmonics **above** the fundamental — 2nd, 3rd, 5th, at
> octaves and fifths of the note. By the upward-spread rule, energy above a
> partial masks that partial *weakly*. So harmonics added by saturation make a
> part **more** findable, not less, which is exactly why saturation is the
> standard tool for making a quiet part cut through without raising its fader.
>
> Mud is energy **below** the parts — the 200–500 Hz pile-up. By the same rule,
> energy below a partial masks it *strongly*, and more strongly as level rises.
> So the identical decibel of added energy costs clarity when it lands at
> 300 Hz and buys clarity when it lands at 3 kHz.
>
> **The operational test is therefore spectral, not aesthetic: if the added
> energy's centroid is above the part's, it is grit. If it is below, it is
> mud.**

**And this program has already run that experiment and published the result.**
`dungeon-synth-fx-and-balance.md` §3/§7: the record was measured at **74.5 % of
its energy in the 60–200 Hz band with a 193 Hz centroid**, a −3 dB desk shelf at
200 Hz was fitted, and the centroid moved **193 → 332 Hz** while the drums'
headroom toll fell 11.5 → 8.4 dB *and their crest actually improved* 13.1 →
14.7 dB. That is a measured instance of the rule above: removing the energy
below the parts made the parts louder without touching their faders.

**Two consequences for a genre that wants grit and not mud:**

1. **High-pass the grit.** Sourced from the medium as well as the theory:
   crackle in this program is *already* band-passed at 3.4 kHz and hiss
   high-passed at 2 kHz [**[MEASURED]**, `V.tape`], on the argument recorded in
   `lofi-noise.md` that *"low-cut the signal to remove frequencies up to 2 kHz,
   leaving only the fizzy pops and crackles"* [corpus:musicradar]. The same
   logic applies to saturation: **do not saturate the bottom.**
   *"Frequencies below 60 Hz don't benefit from saturation"*
   [corpus:northernvalleyaudio], and a transformer's third-harmonic distortion
   *"is always greatest for low frequencies"* [corpus:soundonsound] — which is
   precisely the mechanism that turns weight into mud.
2. **Grit is cheap where the record is empty and expensive where it is full.**
   Same reason the noise-layer rule in §3 says ride it up in sparse sections:
   the masker count is what decides whether added energy reads as texture or as
   fog.

---

## §6 PERFORMANCE GRIT — and the program is TIGHTER than a professional string quartet

The other half of "rough" is not the medium, it is the playing. This one has
hard numbers and they say something surprising about this file.

### 6a. Timing spread — measured on real players

**[SPEC]** Two professional string quartets, 15 repetitions each, score-aligned
onsets [corpus:Wing, Endo, Bradbury & Vorberg, *J. R. Soc. Interface*, via the
PMC mirror]:

| quantity | quartet A | quartet B |
|---|---|---|
| mean inter-tone interval | 191.5 ms (s.d. 25.0) | 191.8 ms (s.d. 16.7) |
| s.d. of ITIs, raw | **32.5 ms** | **24.5 ms** |
| s.d. of ITIs, tempo/metre removed | 26.6 ms | 17.8 ms |
| mean asynchrony of vln2/vla/vc vs vln1 | **−11.7 ms** | **−3.2 ms** |
| s.d. of that asynchrony | **28.3 ms** | **24.4 ms** |

**So a professional quartet's players sit about 24–28 ms apart (s.d.), with a
systematic lead of 3–12 ms for the first violin.**

**[MEASURED]**, this program, `Deckards Orchestrator MK2.html` stage 5
(line ~30936): `micro += ((j() * 2 - 1) * jitterSec) / spb` with
`jitterSec = groove.jitter[style]`, in **seconds**. Dungeon synth — and
therefore hobbit synth — declares `jitter: { dilla: 0.03, even: 0.03 }`.

**[DERIVED]** ±30 ms **uniform** has a standard deviation of
`60/√12 = 17.3 ms`.

> **The genre's "hand-played feel" jitter is 17.3 ms s.d. — tighter than either
> measured professional string quartet (24.4 and 28.3 ms).** The program is not
> sloppy. It is *neater than the London-recorded reference*, and the comment
> beside the number ("a hand-played feel rather than a grid") is describing an
> intention the arithmetic does not deliver.

**And it is the wrong SHAPE as well as the wrong size**, which this repo has
already written down once about a different genre: *"real rubato is correlated
across a phrase"*, where per-note jitter *wanders*. The quartet data says the
same thing from the other side — the **−11.7 ms mean offset** is a *systematic
lean*, not noise, and this program already has the mechanism for exactly that
(`LEAN[lane]`, the fixed per-machine offset built on Hawtin's *"Each one had
its own processor and interpretation of timing that somehow created the
funk"*). Hobbit synth declares no lean at all.

### 6b. Intonation spread

**[index only]** Professional quartets synchronise intonation to *"averaging
under 5 cents"* deviation. Not fetched from the primary paper; recorded, not
encoded.

**[MEASURED]** The nearest thing this program has is `V.horns`, whose `section`
control spreads a three-oscillator rank across `[-7·s, 0, +8·s]` cents. At the
inherited default `section: 0.6` that is **−4.2 / 0 / +4.8 cents — a 9-cent
spread**, which brackets the quartet figure. The horns are the only pitched
voice in this genre with an intonation-spread control at all; the samplers
(`erangHarp`, `erangStrings`, `bardPluck`, `bardFlute`) have none.

**And the Erang pack ships its own detuning**: **[MEASURED, corpus:erang-sample-pack,
2026-08-06]** the pitched samples sit **15–47 cents sharp** of the note they are
named for. That is five to ten times the quartet's deviation, permanently, and
it is a real part of why the pack sounds like what it sounds like.

### 6c. Dynamic spread — and the whistle cannot have any

**[SPEC / PRACTITIONER]** This genre's lead ladder starts on `bardFlute`, a
whistle-family sample, and the whistle repertoire is explicit that **dynamics
are not the expressive channel**:

> *"changes in breath pressure produce not only changes in volume but also
> gross distortions in pitch"*, so *"dynamic variation is a means of musical
> expression that is largely inappropriate and unsatisfactory on the
> recorder."* [recorded in `score-craft.md` §46]

> Ornament is *"created mainly through the use of special fingered
> articulations (cuts and strikes) and inflections (slides), not through the
> addition of extra, ornamental notes"*; *"We hear well-played cuts and strikes
> as having no duration."* — Grey Larsen [`score-craft.md` §46]

**[DERIVED] So on the instruments at the top of this genre's ladder, "a rough
performance" cannot mean velocity variation — it has to mean timing and
articulation variation.** That is the same conclusion §6a reached from the
measurement, arriving through the instrument instead of through the clock.

### 6d. Bow noise and reed buzz — attested, unquantified

**[PROSE]** Bow force is *"by far the most dominant parameter determining the
spectral centroid"*; moving toward the bridge *"reduced overall amplitudes
while increasing noise, and by ponticello positions the f0 was nearly obscured
with a high amplitude broadband sonority extending from approximately harmonic
16 to 40."* [corpus:researchgate, "The Violinist's Sound Palette", **[index
only]** — the PDF itself was not fetched]

**That last clause is the only quantitative statement about performance noise
anywhere in this sheet's sources, and it is useful even so:** the bow's noise
is **broadband energy from the 16th to the 40th harmonic**, i.e. far above the
fundamental. By §5's rule, that is grit by construction — it is why heavy bow
pressure reads as *intensity* and not as *mud*.

**[MEASURED]** This program's reed voices carry an `air` term
(`bassoon: 0.045`, `corAnglais: 0.040`, `bassOboe: 0.040`, `bariSax: 0.075`)
and the samplers carry nothing equivalent. No source found gives a breath-noise
level relative to the harmonics for any instrument. That is a genuine gap and
it is in **WHAT NOBODY GIVES**.

---

## §7 WHAT PRACTITIONERS IN AND AROUND THIS FAMILY ACTUALLY SAY

### 7a. Dungeon synth's own lo-fi tradition — and the blanket claim is false

**[PRACTITIONER]** Already gathered in `score-craft.md` §32 and re-stated here
because it is the load-bearing quote for this genre:

> **Tim Rowland**, who runs both BellKeeper (dungeon) and **Hole Dweller (the
> hobbit flagship)**:
> *"Hole Dweller was my attempt to do something more weathered and humble; down
> to earth. **I wanted something gritty, yet soft.** I needed to connect the
> sound itself with how simple a hobbit's world can be. I worked within very
> limited constraints: **one synth, four crafted sounds total with added
> percussion.**"* [corpus:thesundaydungeon — 403 on this pass; quoted from
> `score-craft.md` §32, gathered 2026-08-11]

**"Gritty, yet soft" is the owner's brief in the flagship artist's own words**,
and the mechanism he names is **scarcity**, not degradation: one synth, four
sounds. The grit is a chosen texture on a clean path.

**[PRACTITIONER]** And the scene refuses to be characterised as lo-fi as a
whole. Erang: *"I need amateurish, handcrafted and sincere sounds. Fuck the
music industry."* — while Grimrik masters records for the scene and **Fief, the
pastoral flagship, carries a commercial mastering credit** (*"Mastered by Dan
Randall. Production by Out of Season."* [corpus:fief bandcamp, VII]). The
defensible position `score-craft.md` §32 landed on stands: **compose and voice
like the naive wing, master like the craft wing.**

**[PRACTITIONER]** Erang on his own sound sources: *"I massively use
soundfonts! They are perfect for so many things, having **a cool balance
between lo-fi / good quality**."* And, crucially for §6: *"The fact that they
have **very few articulations and velocity**… is in fact often a benefit when
they are well made."* [corpus:dungeonsynth.blogspot, 2022]

> **That is a direct argument AGAINST velocity humanisation in this family**,
> from its most prolific artist, and it sharpens §6c: flat, single-articulation
> playback is genre-correct. The roughness belongs in the *medium* and in the
> *clock*, not in the velocities.

### 7b. Black metal's "necro" production — the adjacent tradition

**[PROSE]** *Transilvanian Hunger* was recorded on a portable four-track in a
home setup the band named Necrohell, one player performing everything, with
*"deliberately lo-fi production"* that became foundational to the genre's
"necro" aesthetic. [corpus:wikipedia; corpus:grokipedia — no primary interview
was reachable]

**The transferable finding is not a setting, it is a constraint structure:**
one performer, one machine, no overdub budget, no correction. Which is the same
structure Rowland describes (one synth, four sounds) and the same structure
Mortiis describes (*"on and on for layers and layers for 20–25 minutes"*,
writing each part in a different coloured pen because he had no way to
overdub). **[DERIVED]** In this program the analogue of "no overdub budget" is
already a live parameter: hobbit synth's `machines` pools and `ladder` decide
how many distinct timbres a record can contain. Rowland's constraint would be
`four`.

### 7c. Comfy synth's documented production is WARBLE

**[PROSE]** The one production description the comfy-synth literature actually
gives: *"lo-fi, beatless electronics that swaddle listeners in a snug sonic
blanket"*, *"plinking pianos and hazy synthesiser arrangements"*, and —
the useful phrase — ***"warbling, compressed production"***, at a *"typically
waddling pace"*. [corpus:dazeddigital, "The inside story of comfy synth"]

**[DERIVED] "Warbling" is wow.** The brightest, softest, least
doom-and-gloom corner of this whole family is documented as having *audible
pitch instability*, which retires the assumption that the bright end should be
cleaner. §2a said raising wow is the safe dial because it cannot reach the
tune; this says it is also the **sourced** dial.

### 7d. THE MECHANISM FOR ASYMMETRIC SATURATION IS ALREADY IN THIS FILE

**[MEASURED]** `reedCurve(g, c, drive, asym)`, line ~11407:

```js
const y = Math.tanh(drive * (x + asym)) - base;
```

with the comment *"`asym` is the offset that makes it one-sided; without it
this is a clarinet"*, and per-instrument drive ranges `[1.4, 5.0]` (bassoon)
through `[2.2, 7.2]` (bari sax). **This is exactly the single-ended,
even-harmonic-generating shaper §4a describes, it is normalised to peak so that
"turning the drive up brightens rather than merely louder", and only four voices
in the entire program can reach it** — the four reeds.

Meanwhile the general per-voice chain uses `g.chainCurve = tanh(2.2x)/2.2` —
**symmetric**, therefore third-harmonic-dominant by §4b — and the drum bus uses
`tanh(3.6x)` after a 0.5 pre-gain, also symmetric.

> **So the file already contains both saturator characters, and the warm one is
> reachable by four instruments none of which plays this genre's tune.** That
> is the single highest-leverage finding in Half A: the mechanism does not need
> to be built, it needs to be *reachable from the genre table*.

---

## §8 THE PARAMETER TABLE — grit, in this program's own units

Every row says what it is anchored to. `[SPEC]` rows are equipment figures;
`[CHOSEN]` rows are values I am proposing and are not sourced, only *bounded*
by a spec. **Nothing here has been rendered.** The house rule from
`the-rhodes.md` §6 applies with full force — the arithmetic predicted the
opposite of the measurement there, and saturation is a steeper curve than
anything in that case.

### 8a. What the numbers should be, and why

| field | inherited | proposed | anchor |
|---|---|---|---|
| `tape.wow` | `[0.0016, 0.0022]`<br>±0.16–0.38 % pk | **`[0.0022, 0.0030]`**<br>±0.22–0.52 % pk | ≈0.11–0.35 % weighted RMS **[DERIVED]** — above the 0.08 % audibility floor **[SPEC]**, in the "warbling production" territory comfy synth is documented as having **[PROSE]**. Reaches `keys`/`keys2` only, so the tune stays legible **[SPEC: northernvalleyaudio]** |
| `tape.flutter` | `[0.0008, 0.0012]`<br>±0.08–0.20 % pk | **`[0.0014, 0.0018]`**<br>±0.14–0.32 % pk | flutter is the *scrape*, i.e. the "rough" half; raised to sit clearly over the 0.08 % floor rather than straddling it **[CHOSEN within SPEC]** |
| `tape.hiss` | `[0.004, 0.003]` | **hold, then measure** | the raw gain is not the mix level. Target is **−50 to −55 dBFS at the mix** **[SPEC]**. Must be rendered and read, exactly as the atmosphere bed was (first guess −45 dB, doubled to −38.9) |
| `tape.crackle` | `[0.0015, 0.0010]` | **`[0.0004, 0.0004]`** or 0 | **the medium is a tape, not a record.** `lofi-noise.md`'s own argument: "a record and a tape stacked would double-count". Hobbit synth has no vinyl story; dungeon synth's crackle was inherited, not chosen |
| **`sat` / `drive` — DOES NOT EXIST** | — | **new field, per role** | §7d: the file has both curve characters and neither is reachable from a genre table for a pitched part |
| `sat.kind` | — | **`"asym"` on `keys`, `lead`, `counter`** | 2nd-harmonic-dominant = *"warm… enhances body without making it too aggressive"*, and even harmonics are octave-related so they *"always stay in key"* **[SPEC/PROSE]**. Symmetric soft clip gives 3rd+5th+odd, which is the harder edge — wrong for "orchestral" |
| `sat.amount` | — | **target 2–6 % THD on the pitched bus** | the audible window is ~1 % (masked threshold, and higher with real programme) to ~10 % (the ESP ladder's fully-clipped end) **[SPEC]**. 2–6 % is the middle of it. **Sweep it — the ESP ladder moves 0.28 % → 8.9 % over 6 dB of input** |
| `sat.hp` | — | **high-pass the drive path at ~150–200 Hz** | *"frequencies below 60 Hz don't benefit from saturation"* **[PROSE]**; transformer 3rd-harmonic distortion *"is always greatest for low frequencies"* **[SPEC]**; and this genre's parent already needed a −3 dB shelf at 200 Hz to stop the low band eating the record **[MEASURED, repo]** |
| `drumDrive` | `1.35` | **hold** | the grit Rowland describes is on the *voices*. Dungeon synth's 1.35 was set against its own march; hobbit synth already re-balanced `roleGain.drums` to 1.90 and moving both at once confounds two experiments |
| `groove.jitter` | `{ even: 0.03 }`<br>17.3 ms s.d. | **`{ even: 0.045 }`**<br>26.0 ms s.d. | lands on the measured professional-quartet band, 24.4–28.3 ms s.d. **[SPEC]**. Currently the program is *tighter* than the reference |
| `groove.lean` (per lane) | none | **±5–12 ms fixed per machine** | the quartet's systematic first-violin lead is **−3.2 to −11.7 ms** **[SPEC]**, and it is a *lean*, not noise. The mechanism (`LEAN[lane]`) already exists and this genre declares none |
| `horns.section` | `0.6` → 9-cent spread | **hold** | already brackets the ~5-cent professional figure **[index only]**; the samplers' 15–47-cent pack detune is the genre's real intonation spread and is not a knob |

### 8b. The two mechanisms worth BUILDING, ranked

1. **A genre-level saturation declaration that reaches the pitched chain**,
   with a `kind` (symmetric / asymmetric) and an amount. §7d: both curves
   exist, neither is reachable, and this is the field the owner's phrase
   actually names. Everything else in this table is a tweak; this is the
   missing noun.
2. **A wandering top end.** §2d: azimuth error and dropout are the two most
   characteristic tape artefacts after wow, they are the same audible event
   (the treble going away and coming back), and *nothing in this file does it*.
   The cheapest form is a slow LFO on an existing low-pass, per channel, at
   different rates — which also narrows the stereo image as it moves, which is
   what azimuth error physically does.

Print-through (§2c) is third and is a genuinely novel effect for this program —
a *pre*-echo, a copy arriving before the note — but it is the least sourced on
level and the most expensive to schedule.

---

# PART B — THE FANTASY AXIS

## §9 THE TAXONOMY, AS THE SCENE ITSELF STATES IT

**"Adventure synth" is not a term.** Recorded here because the brief asked
about it: a targeted search in the prior research pass found *"no definition,
no Bandcamp tag, no RYM genre, no scene reference"*
[`raw/overworld-and-materials.md`], and this pass found nothing either.
**"Tavern synth" is likewise unattested** — the same prior pass twice got an
identical fluent sentence back from search summarisers that traced to no
primary source. **Do not use either name.** The attested term for this
territory is **fantasy synth**.

### 9a. Fantasy synth — the one subgenre with a published definition

**[PROSE, and the best-sourced item in Half B]** Louis Pattison, Bandcamp
Daily, 25 August 2025, gives fantasy synth three criteria:

> 1. *"It is electronic music, created by solo artists, using simple digital
>    tools."*
> 2. It largely eschews the *"dark dungeon"* style *"in favor of something
>    lighter and more fanciful."*
> 3. *"It engages in some way with the imagery and lore of high fantasy."*

And the distinction, verbatim:

> ***"Whereas classic dungeon synth is dark, dank and morose, fantasy synth
> explores a wider palette of sounds and emotions. It can be epic, wistful,
> playful, or bucolic."***

Fantasy synth exists *"as a way to emphasize and expand on the mythical,
whimsical, or Arcadian elements of dungeon synth that were always present, but
often obscured by the gloom."*

**[PRACTITIONER]** And a working artist states the axis exactly — Mercian Sam
of Flickers From The Fen:

> ***"The tools of dungeon synth and fantasy synth are identical—from
> battle-worn Polysixes to enchanted VSTs. But the places they take you are
> different."***

> **That sentence is the design brief for a genre table that is a deep merge
> over another genre table.** Same instruments, same engine, different
> destination — which is architecturally what `GENRE.hobbitsynth` already is.

### 9b. Comfy synth — mood-defined, not parameter-defined

**[PROSE]** The scene's own subgenre reference gives comfy synth a descriptor
string and nothing measurable: *"instrumental, peaceful, melancholic,
atmospheric, longing, calm, lo-bit, mellow, meditative, ethereal, soft,
sentimental, melodic, **pastoral**, repetitive, soothing, **winter**,
**bittersweet**, lo-fi, holiday"* — emerged late 2010s, surged 2020.
[corpus:dungeon-synth.neocities.org/subgenres]

**Note `winter`, `melancholic` and `bittersweet` are in that list.** Comfy is
*not* the same as *bright*, and a genre brief that says "not as doom and gloom"
is not asking for cheerful.

**[PROSE]** Dazed adds the production and pace (§7c) plus the subject matter:
*"wholesome activities like picking beans, sipping on glasses of milk, and
going fishing"* against dungeon synth's *"icy tundras, fortresses, and ancient
curses."*

**[PROSE]** And the most honest source in the whole taxonomy concedes the
weakness of the distinction: *"Musically, **none of them is radically different
from classic dungeon synth**"*, while noting *"the light, major tone, and
gentle flow"* as the perceived difference. [corpus:stranger-aeons, "Comfy
synth: but is it dungeon synth?"] Artists it names: Mushroom Village, Hole
Dweller, Grandma's Cottage, The Friendly Moon, Olde Fox Den, Sidereal Fortress,
3 Little Kittens.

**[PRACTITIONER]** Rowland himself rejects the comfy label as total:
*"there are songs in the discography that are definitely not comfy."*
[corpus:everythingisnoise]

### 9c. The rest of the family, for positioning

| | descriptors, from the scene's own list |
|---|---|
| **Old School / Classic** | *"fantasy, atmospheric, epic, dark, cold, medieval, minimal repetitive, instrumental, mysterious, nocturnal, melodic, suspenseful, ethereal"* — *"closely aligned with black metal"* |
| **Winter synth** | *"winter, atmospheric, nocturnal, melancholic, cold, sombre, mysterious, soothing, ethereal, calm, lonely, lush, dark, instrumental, medieval, ominous"* |
| **Chip synth** | *"lo-fi, dark, epic, CRPG, suspenseful, instrumental, fantasy, nostalgic, minimal"* |
| **Forest synth** | *"generally lacks Neo-Medieval Folk melodies and **percussion is sparse compared to Medieval and Martial Synth**"* — relies on *"ambient synth pads and natural recordings"*, *"warmer, mellower… but tends to be **less droning**"* [**[index only]** — RYM 403'd] |

**The forest-synth line is the only sourced statement anywhere bearing on the
walking-pulse question**, and it works by contrast: percussion is *normal* at
the medieval and martial end of this family. A walking drum in hobbit synth is
scene-legitimate, and it is legitimate on the strength of one negative
sentence, which is worth saying out loud.

---

## §10 THE ARTISTS AT THE BRIGHT END, AND WHAT THEY ACTUALLY SOUND LIKE

**[PROSE, Bandcamp Daily]** Named acts and their described sound:

| artist | described as |
|---|---|
| **Hole Dweller** (Athens, GA — Tim Rowland) | *"warm and bucolic"*; Tolkien's Middle-earth from a hobbit's point of view. The flagship. |
| **Fief** (Salt Lake City) | *"Shimmering melodies seemingly picked out on a lyre or harpsichord"*; *"noble and courtly, other times playful and whimsical"*. Elsewhere: *"If the other artists presented here are the sounds of menace, emptiness, and despair, **Fief is the sound of emerging from the dungeon into a sunlit clearing**"*, with *"light, idyllic melodies, featuring the sounds of pipes and lutes."* |
| **Flickers From The Fen** (Bristol) | *"drums and French horn, with sprightly leader"* on violin; *"often wistful and nostalgic"* |
| **Arthuros** (Greece) | *"dramatic, celestial"*, *"like dungeon synth by way of Vangelis"* |
| **Quest Master** (Australia) | *"glossy FM synths and pulsating drum machines"* — dungeon synth crossed with '80s synthwave |
| **DIM** (Nova Scotia) | *"baroque fantasy synth"*, *"sacral medievalist electronics"* |
| **Skhemty** (France) | *"different medieval-age instruments"*, *"beautiful oriental scales"* |
| **Fogweaver** (Portland) | *"melancholic"* |

**[PRACTITIONER]** Rowland's own self-description and influences:
*"fantasy synth"* or *"fantasy/dungeon synth with folk elements"*; he combines
*"electronic music production alongside stringed instruments"*, adding
**mandolins** on *Crossroads*; his non-genre influences are *"Rush and
Genesis. I'm a massive fan of 70's prog"* plus *"PS1 – PS2 era soundtracks."*
[corpus:everythingisnoise]

**[PRACTITIONER]** And his writing method is *literally* location-driven:
*"When I initially wrote Flies the Coop, I had my character from LOTRO go to
the location the song was about and I wrote with my DAW open in one window,
while LOTRO was going in another."* Track titles confirm it — *Millstream
Quietude*, *Along the Great East Road Cows Graze on Emerald Fields*, *An Empty
Tankard of Ale at the Floating Log Inn*.

> **[DERIVED] The encodable content of "the places they take you are
> different" is an instrument-attack rule, and it is the clearest single
> difference in Half B.** Every instrument named at the bright end —
> pipes, lutes, lyre, harpsichord, mandolin, violin, French horn — is
> **plucked or blown: bright attack, short decay.** Every instrument named at
> the dark end — choir pads, chapel organ, bowed strings — is **sustained: no
> attack transient.** Same synth engine, different patch table. Hobbit synth's
> `ladder` already half-encodes this (`erangHarp`, `bardPluck`, `bardFlute`)
> and its `keysStyle: null` / `touch.roll: 1` rewrite was the same insight
> arriving through the writing rather than the patch.

---

## §11 TOLKIEN-ADJACENT AND PASTORAL SCORING

**[NOTATION, from this repo]** `lotr-themes-measured.md` read four Shore themes
off ABC transcriptions. The load-bearing facts for a *travelling* genre:

- **Concerning Hobbits**: 4/4, **118 BPM**, G major; the melody is diatonic
  and the *colour* is not (`^c`, `^f`, `^g`, `^a`, `=a` against K:G).
- **It contains its own accompaniment, written out**: `DA, FA, FA DA | CA, EA,
  EA EA | …` — a two-element alternating figure, low note and a note above it,
  **shape fixed, pitches tracking the harmony.**
- **The Ring Goes South**: 4/4, **118 BPM**; melodic rhythm is *"slow notes
  with quick approaches"*, and from bar 17 the walking engine is
  `A2 A,2 | G2 G,2 | …` — **an octave oscillation on the beat, under the
  tune, changing with the harmony.** Same object as Concerning Hobbits, one
  interval wider.
- **Rohan**: **6/8, A major, a jig** — and its intervals are the *opposite* of
  the Shire's: `A E c` is down a fourth then up a sixth. **Rohan leaps where
  the Shire steps.**
- **The Shire theme itself**: D major, 4/4, ♩=90–105, degrees 1 2 3 3 5 5 3 3
  2 1, **major pentatonic (no 4th, no 7th)**, over a relative-minor bass
  (Bm–D–G–Em) — four sources, three official.

**[PROSE]** Doug Adams names the Shire's motifs — the **Hobbit Skip Beat**, the
**Two-Step Figure**, the **Outline**, the **End Cap** — and the orchestration is
*"Celtic instruments, including whistles, drums and a Celtic harp"* over a
large orchestra: tin whistle, Irish fiddle, pizzicato strings, guitars,
dulcimer, low whistle. [corpus:lotr.fandom; corpus:classicalexburns —
neither gives tempo, metre or key, which is why §11 leans on the ABC]

**[PRACTITIONER]** And the substitution ladder, which hobbit synth's `ladder`
already encodes: Shore takes the theme from tin whistle to clarinet to flute as
the hobbits leave home, and Adams records him refusing the whistle at
Rivendell because *"it's too tender a scene… There are none of the hobbit folk
sounds in Rivendell. It's more classical."* **An instrument is a register of
feeling here, not a colour.**

**[DOCTRINE/PROSE]** The broader pastoral tradition, from Monelle
[`score-craft.md` §21] — and the constraints are narrower than the folklore:

- The pastoral topic has exactly three named components: **instruments**
  (musette, hurdy-gurdy/vielle, zampogna and piffero), the **siciliana
  rhythm**, and **simplicity** — and *"the single most pervasive signifier is
  the drone bass."* Concretely: 6/8, 9/8 or 12/8 at moderate tempo, melody in
  parallel thirds over a drone.
- Compound duple/triple metre signifies **the HORSE**, not "journey"
  generally.
- **⚠ And the generalisation is folklore.** The prior pass searched
  specifically and found *"Any scholarly source calling 6/8 the 'journey' or
  'travelling' metre"* under **notFound**: *"The generalisation from 'horse' +
  'pastoral' to 'journey' appears to be modern folklore/synthesis by
  film-scoring blogs, not a claim anyone with evidence makes."*

---

## §12 TRAVELLING VERSUS DWELLING — extending §18 and §20

`score-craft.md` §18 established the tempo bands, the 4/4 dominance, the loop
lengths and the ♭VI/♭VII harmony; §20 established the walking-cadence band.
This section adds four things they do not have.

### 12a. The surface rate is the walking pulse, NOT the BPM

**[SPEC]** Human habitual cadence clusters at **110–121 steps/min**; the
beat-to-step synchronisation window is **106–130 BPM**; below ~114 tempo drives
walking speed linearly and above ~118 it saturates.

**[NOTATION]** Schubert marks the archetypal walking song *"Mässig, in gehender
Bewegung"* — *in walking motion* — for *Gute Nacht*: **2/4, D minor, editorial
♩=56–60, constant quaver tread in the piano.**

**[DERIVED, and stated as derived in the raw research too]** ♩=56–60 in 2/4
with quaver motion gives **112–120 quavers/min — inside the measured human
band**, on a piece whose notated tempo is *half* the cadence.

> **The rule that follows, and it is the extension §20 was missing:**
> **the note value carrying the walking pulse should tick at 105–125 per
> minute REGARDLESS of the notated beat.** 2/4 at ♩=58 with quavers, and 4/4 at
> ♩=116 with crotchets, are *the same walk*. The parameter is **surface rate**,
> not BPM.

**[MEASURED]** This matters here because hobbit synth's `tempo: [102, 124]`
already sits in the band — so the genre is correct at the metronome and the
open question is whether anything is *ticking* at that rate. Its `ostinato`
runs `unit: 2` with six-element cells, which at 102–124 BPM puts the ostinato
surface at **204–248 events/min — roughly double the cadence.** That is a
running figure, not a walking one, and whether that is right is a design
question this sheet raises rather than settles.

**And a corroborating detail from the corpus's own naming**: Dragon Quest
overworld/field titles are *"overwhelmingly march-and-walking words"*, two of
eleven literally named *March* or *Footsteps*.

### 12b. Dwelling has its own sourced signifier, and it is the drone

**[DOCTRINE]** Monelle again: *"the single most pervasive signifier"* of the
pastoral is **the drone bass**. And the dungeon end's own foundation is *"long
pedal notes and drones"* [corpus:melodigging].

> **[DERIVED] So the two ends of this axis have two *different attested
> bass idioms*, and the axis is expressible as one number:**
> **dwelling = the held drone** (Monelle's pastoral signifier, melodigging's
> dungeon foundation — they agree), **travelling = the constant tread**
> (Schubert's quavers, Shore's written-out two-step and octave oscillation).

**[MEASURED]** Hobbit synth already encodes exactly this and got there through
the notes rather than through the sources: `bassPedal: 0.20` (down from dungeon
synth's 0.5), `bassWalk: 0.72`, `bassStep: 4`. Its own comment records the
measurement that forced it — *"TWO bass notes in an eight-bar material, both at
bar 1."* **The sources now agree with the fix, from a direction the fix did not
come from.** Worth recording, because it is the rarer of the two ways to be
right.

### 12c. Harmonic rhythm and root motion — the third travelling lever

**[PROSE]** Harmonic rhythm is *"the rate at which the chords change… in
relation to the rate of notes."* Faster changes *"produce a good sense of moving
forward"*; **static harmonic rhythm** — *"the harmony doesn't change at all for
an extended passage, most commonly under a pedal point or a repeating
ostinato"* — provides no forward motion at all, so *"any tension in the passage
has to come from melody, decoration, texture, or dynamics instead."*

**[PROSE, and the primary source 403'd]** Root-motion strength: forward
momentum comes from roots moving **up a fourth or down a third**; stasis from
roots moving **up a third or down a fourth**. [corpus:rwu pressbooks
"Harmonic Direction I", **[index only]** — the chapter itself refused the
fetcher]

**[MEASURED]** Hobbit synth writes **one chord per two bars** across an 8-bar
material — the measured overworld harmonic rhythm — where dungeon synth's
harmony *"barely moves"*. The table's own comment records what happened when it
tried stepwise roots: leading with i–♭VII–♭VI–♭VII (three whole-tone root steps
in a row) drove the file-wide parallel-perfects rate to **5.8 % against a 5 %
ceiling**, and the rows were re-weighted toward leaps.

> **[DERIVED] That collision is not a bug, it is this axis in miniature.** The
> Aeolian descent ♭VII–♭VI is the *dungeon* harmony — stepwise, static-feeling,
> and it fuses two keyboards into one voice. The leaping roots (i–♭VI–♭III–♭VII,
> I–IV–♭VII–I) are the *travelling* harmony, and they are also the ones that
> keep two keyboards legible. **The voice-leading check and the genre axis want
> the same thing**, which is why the fix worked.

### 12d. What the sources DO NOT support about travelling

Recorded because the prior pass looked specifically and came back empty, and
because each of these is a tempting rule that would be invented rather than
found:

- **"Modulation depicts travel"** — unsupported. The idea appears only as
  conceptual-metaphor scholarship about how theorists *talk* about keys
  (Saslaw 1996, Zbikowski), *"not a compositional device with evidence."*
  Hobbit synth's `keyShift: { chance: 0.38 }` is therefore a **[CHOSEN]**
  device with a nice comment ("a key change is a change of country") and no
  source behind it. Stated, not removed.
- **"6/8 is the journey metre"** — folklore (§11).
- **"The walking bass is the overworld texture"** — *"no analysis quantifies
  the bass rhythm of any overworld theme."* What exists instead is Shore's
  written-out figures (§11), which are evidence about *four cues*, not about a
  genre.
- **And an inversion that IS sourced:** one open-world composer's stated method
  is to *deliberately hollow out the score so footsteps and environment stay
  audible* — very low note density, long rests, the **sound effects supply the
  pulse**. That is a valid travelling preset in which the music has no pulse
  layer at all, and it is the exact opposite of everything above.

---

## §13 MODE AT THE BRIGHT END — the primary source, read

The brief asks why a raised sixth reads as "unsmiling but not tragic".
`score-craft.md` §19 already carried the headline numbers second-hand and drew
a conclusion that is **half right**. The paper itself was fetched this pass and
parsed, and it sharpens the answer considerably.

**[SPEC]** Temperley & Tan, *Emotional Connotations of Diatonic Modes*, *Music
Perception* 30(3), 2013. 17 participants, six folk melodies × six modes on a
fixed tonic C, forced-choice "which is happier". Proportion of trials in which
each mode was judged happier:

| Ionian | Mixolydian | Lydian | Dorian | Aeolian | Phrygian |
|---|---|---|---|---|---|
| **.83** | **.64** | .58 | **.40** | **.34** | .21 |

`F(5,75) = 50.73, p < .001`.

**The paper's own summary sentence, verbatim:**

> ***"with the exception of Lydian, modes become happier as scale-degrees are
> raised—that is, as sharps are added and flats are removed."***

**And the significance structure, verbatim:**

> *"Out of the fifteen pairs of modes, the pairwise differences are significant
> for all but three: Lydian/Mixolydian, Lydian/Dorian, and **Dorian/Aeolian**."*
>
> *"(Even in the one case that the difference is not significant,
> Dorian/Aeolian, **it is still in the direction predicted by the rule**.)"*

Reading Table 1's row for Mixolydian: **Mixolydian > Dorian at p < .01**, and
**Mixolydian > Aeolian at p < .05.**

> **So the answer to "which mode is unsmiling but not tragic" is
> MIXOLYDIAN, and it is the only one the data can support.**
>
> - **Dorian is not distinguishable from Aeolian.** `score-craft.md` §19 got
>   this right and it stands: *"Dorian = wistful, Aeolian = tragic" is not
>   evidenced.*
> - **But §19's phrasing "Dorian is not the lever" overstates it in one
>   direction and understates the general rule in the other.** The direction is
>   correct even where the difference is not significant, and the *general*
>   principle — happiness rises as flats are removed — is the paper's own
>   conclusion. Dorian is a *weak* lever, not a *wrong* one.
> - **Mixolydian is a significant lever against both minor modes**, at p<.01
>   and p<.05 respectively.

**[theory, not sourced]** The mechanism behind "raised sixth" is a chord, not a
colour: in Dorian the natural sixth makes the **IV chord major** where Aeolian's
flat sixth makes it minor. Hobbit synth's table already reaches for exactly this
— its second dorian row is commented *"i-IV-i-flatVII: dorian's bright IV"*.
This is standard modal theory and no source was fetched for it; marked so nobody
later mistakes it for a citation.

**[MEASURED]** Where the genre's mode row currently sits:

```
modes: [["dorian", 5], ["minor", 4], ["major", 4], ["mixolydian", 3],
        ["carpathian", 2], ["phrygian", 2]]
```

Mixolydian — the one mode the data says is *significantly* brighter than minor
without being major — has weight 3 of 20, **behind two modes it cannot be
distinguished from and behind major.** That is a table entry the evidence
argues with. It is **not** an argument for pinning the genre to one scale — the
owner already stopped that once, correctly, and `lotr-themes-measured.md` §5
records it: *"dont be that stupid to think we want ONE scale."* It is an
argument about a weight.

---

## §14 THE INVERSION, AND IT IS THE SHEET'S HEADLINE

Both halves of the brief converge on one sentence, and it inverts the obvious
assumption.

**The obvious assumption:** the dark end is the dirty one and the bright,
pastoral, "not as doom and gloom" end is the clean one.

**What the sources say:**

- **Hole Dweller** — the actual hobbit flagship, and the *same author's* other
  project is the dungeon one — is **deliberately the dirtier of the two**:
  *"more weathered and humble; down to earth… **gritty, yet soft**"*, one synth,
  four sounds.
- **Comfy synth**, the softest corner of the family, is documented as
  ***"warbling, compressed production"***.
- **Fief**, the pastoral flagship, is **professionally mastered**.
- **Erang** rejects polish on principle; **Grimrik** masters for the scene.
- And the *dungeon* end is not uniformly lo-fi either: *"dungeon synth = lo-fi"
  is false as a blanket claim* [`score-craft.md` §32].

> **Grit does not vary along the bright/dark axis at all.** It varies along a
> different axis — naive-versus-craft — and the two are orthogonal. Which means
> the owner's brief is not self-contradictory in the slightest: **"not as doom
> and gloom" and "gritty and rough" are statements about two different
> parameters, and this genre's table currently expresses the first and has no
> field for the second.**

And the resolution for a genre that must also be *"more orchestral"*: the noise
is **the medium the orchestra was recorded onto**, not the room it stands in
(§3) — a scoring stage is specified at NC-15, and the tape it went to is
specified at −50 dBFS.

---

## WHAT NOBODY GIVES

Every one of these was searched for specifically. They are recorded so that the
next pass does not spend the budget again, and so that nobody fills them in
from memory.

1. **A saturation setting for any dungeon or fantasy synth record, ever.** Not
   one artist, not one interview, not one forum thread. Erang explicitly
   refuses: *"I prefer not to get into technical comment about Dungeon Synth."*
   Every value in §8a that is a genre value is `[CHOSEN]` for this reason.
2. **A mix level in dB for grit of any kind, in this genre or any adjacent
   one.** The equipment figures (§3) are solid; the *mix* figures do not exist.
   Same gap `lofi-noise.md` §1 hit for crackle and
   `dungeon-synth-fx-and-balance.md` §1 hit for atmosphere beds. Three sheets,
   one hole.
3. **A print-through level from a primary source.** The SFU handbook defines
   the mechanism and gives no number; the Performer glossary the same. The
   −50/−55 dB band is **[index only]**.
4. **Breath-noise or bow-noise level relative to the harmonics, for any
   instrument.** The Violinist's Sound Palette gives a *range* (harmonics 16
   to 40) and no *level*. Nothing gives a flute or whistle figure at all. This
   program's reed `air` values (0.040–0.075) are unanchored.
5. **Neofolk / medieval-folk recording practice.** Searched directly. The
   genre literature names instruments (acoustic guitar, violin, flute, horn,
   frame drum) and pioneers (Death in June, Current 93, Sol Invictus) and says
   **nothing whatever** about miking, reverb, or production technique. The
   "raw acoustic, close-miked, no reverb" premise is unsupported.
6. **Chord progressions for any artist in this family.** Zero roman-numeral or
   chord-symbol analyses exist for Erang, Fief, Hole Dweller, Secret Stairways
   or Thangorodrim. The prior pass concluded the same. Everything harmonic in
   hobbit synth's table comes from the *game-music* corpus, not from this
   scene.
7. **Loop lengths in bars.** *"minimal repetitive"* and *"repetitive"* are
   attested descriptors of the whole family and **no source states how long a
   loop is**, in bars or in seconds.
8. **Mode evidence with pitch backing.** The "comfy is major, dungeon is minor"
   claim exists only as scene-writer opinion. One algorithmic per-track datum
   was obtained in the entire prior pass and it reads MAJOR on a track the same
   source calls *"somber"* — which is evidence about the detector, not the
   music.
9. **Whether hobbit synth's ostinato surface rate should be the walking pulse
   or double it** (§12a). The sources give the cadence band and the surface-rate
   rule; nothing says which layer carries it in a genre with both an ostinato
   and a bass.
10. **A roll offset in milliseconds, still.** `score-craft.md` §56 recorded
    this absence and it has not moved. `touch.roll: 1` remains `[CHOSEN]`.

---

## Sources

**New this pass, fetched:**

- [Nonlinearities in Vacuum Tubes, Bipolar Transistors, and FETs — till.com](https://till.com/articles/devicedistortion/) *(the 3/2 power law, the exponential, the square law; "third harmonic down over 20 dB below the 2nd, which is already 20 dB below the fundamental")*
- [Soft Clipping — Rod Elliott, ESP (sound-au.com)](https://sound-au.com/articles/soft-clip.htm) *(the THD ladder 0.28 %→8.9 %; soft 14.6 % vs hard 17.6 %; 3rd/5th/odd vs 11th/15th/19th; the 23 kHz / 100 kHz bandwidth contrast)*
- [Analogue Warmth — Sound On Sound](https://www.soundonsound.com/techniques/analogue-warmth) *(triode single-ended = evens and odds; push-pull cancels evens; transformer 3rd harmonic strongest at low frequencies, 1 % vs 60 % at −75 dBu; Studer A820 0.04 % at 15 ips; tape alignment uses 3rd harmonic)*
- [Pre-Distortion Techniques — Ethan Winer](https://ethanwiner.com/distort.html) *(MOL at 3 % THD; 1.1 % → 0.13 % bypassing transformers)*
- [Lo-Fi Tape Saturation: A Producer's Guide — Northern Valley Audio](https://www.northernvalleyaudio.com/blog/lofi-tape-saturation-production-guide) *("Real cassette hiss sits around −50 to −55dB relative to full scale"; head bump 80–120 Hz; "below 60Hz don't benefit from saturation"; the per-element settings table)*
- [Performer's Comprehensive Analog Tape Glossary](https://performermag.com/home-recording/analog-tape-glossary/) *(print-through, dropout, azimuth, bias, saturation — definitions, no numbers)*
- [Print-Through — Handbook for Acoustic Ecology, SFU](https://www.sfu.ca/sonic-studio-webdav/handbook/Print-Through.html) *("heard as a pre-echo"; thin tape susceptible; tails-out storage)*
- [Azimuth in a Magnetic Tape Recorder — Jay McKnight (PDF)](https://www.thehistoryofrecording.com/Papers/Jay_McKnight/Azimuth_in-a_Magnetic_Tape_Recorder.pdf) *(azimuth deviation → HF loss)*
- [Masking — Timbre and Orchestration Resource (ACTOR)](https://timbreandorchestration.org/writings/timbre-lingo/masking) *("upward spread of masking"; "lower-frequency maskers have more of a masking effect than do higher-frequency maskers")*
- [The Role of Suppression in the Upward Spread of Masking — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2504625/) *(the mechanism; compressive basilar-membrane response)*
- [Optimal feedback correction in string quartet synchronization — Wing et al., PMC mirror](https://pmc.ncbi.nlm.nih.gov/articles/PMC3928944/) *(asynchrony s.d. 24.4 / 28.3 ms; mean −3.2 / −11.7 ms; ITI s.d. 24.5 / 32.5 ms)*
- [Emotional Connotations of Diatonic Modes — Temperley & Tan, Music Perception 30(3) 2013 (PDF, parsed)](https://davidtemperley.com/wp-content/uploads/2015/11/temperley-tan.pdf) *(the .83/.64/.58/.40/.34/.21 table; "modes become happier as scale-degrees are raised"; the three non-significant pairs; Mixolydian > Dorian ** and > Aeolian *)*
- [Exploring the Mystical Realms of Fantasy Synth — Louis Pattison, Bandcamp Daily, 25 Aug 2025](https://daily.bandcamp.com/lists/fantasy-synth-album-guide) *(the three criteria; "dark, dank and morose" vs "wider palette"; Mercian Sam's "the places they take you are different"; the artist descriptions in §10)*
- [Dungeon Synth Subgenres — dungeon-synth.neocities.org](https://dungeon-synth.neocities.org/subgenres) *(the comfy / winter / old-school / chip descriptor strings)*
- [The inside story of comfy synth — Dazed](https://www.dazeddigital.com/music/article/58365/1/the-inside-story-of-comfy-synth-the-internets-snuggliest-microgenre) *("warbling, compressed production"; "plinking pianos"; "waddling pace")*
- [Comfy synth: but is it dungeon synth? — Stranger Aeons](https://www.stranger-aeons.com/comfy-synth-but-is-it-dungeon-synth/) *("none of them is radically different from classic dungeon synth"; "the light, major tone, and gentle flow")*
- [WFA: Hole Dweller — Everything Is Noise](https://everythingisnoise.net/weekly-featured-artist/wfa-hole-dweller/) *(self-identification as fantasy synth with folk elements; mandolins; Rush/Genesis/PS1–PS2; the LOTRO writing method; "definitely not comfy")*
- [Noise Criteria charts — Commercial Acoustics](https://commercial-acoustics.com/sound-advice/noise-criteria-nc-rating-chart/) and [Noise Criteria Curves Compared — Sonavyx](https://sonavyx.com/en/insights/noise-criteria-curves-compared) *(NC-15 to NC-20 for concert halls and recording studios)*

**Refused the fetcher this pass** *(recorded, not quoted as fetched)*: The
Sunday Dungeon Hole Dweller interview (403), Flagpole Hole Dweller interview
(403), Invisible Oranges dungeon-synth digest #9 (403), thesession.org modal
thread (403), RWU Pressbooks "Harmonic Direction I" (403), Royal Society
Interface HTML (403 — PMC mirror used), the Stanford CCRMA magnetic-recording
lecture PDF (binary, unparseable through the fetcher).

**Already in this repo, re-read and relied on:**

- `docs/genre-research/dungeon-synth-fx-and-balance.md` — the house form for this sheet; the −3 dB shelf measurement; the atmosphere-bed level derivation
- `docs/genre-research/the-rhodes.md` — the house form; the melody-must-stay-steady wow rule
- `docs/genre-research/lofi-noise.md` §1–§3 — vinyl and cassette noise floors; the wow/flutter bands; the RMS-vs-peak conversion
- `docs/genre-research/score-craft.md` §17–§21, §32, §46, §56 — the length discriminator; the overworld measurements; the walking tempo; the pastoral topic; the artists' own words; the whistle's articulation-not-dynamics rule; the missing roll offset
- `docs/genre-research/lotr-themes-measured.md` §1–§5 — the Shire, Concerning Hobbits, Rohan and The Ring Goes South as pitches, metres and tempos
- `docs/genre-research/dungeon-synth-technique.md`, `dungeon-synth-arrangement.md`, `dungeon-synth-score-and-drums.md` — the parent genre's own findings
- `docs/genre-research/raw/overworld-and-materials.md` — the un-mined block: the SongBPM length/tempo measurements, the Erang and Rowland interview extracts, the subgenre descriptor sets, and the `notFound` list that §12d is built on
- `Deckards Orchestrator MK2.html` — every `[MEASURED]` row that says "this build", read at the byte level: `GENRE.hobbitsynth` 22830–23553, `GENRE.dungeonsynth` from 20105, `TAPE_WOW_HZ`/`TAPE_FLUTTER_HZ` 7125, `g.chainCurve` and `g.satCurve` ~7526–7545, `reedCurve` ~11407, `V.horns` 11258, `V.tape` ~12405, the tape event ~24415, stage-5 jitter ~30936
