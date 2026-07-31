# The CS-80 parameter space, verified — 2026-07-31

*Every number in the user's `CS-80` working document, tested against sources that were
actually FETCHED. Six research angles, then nine adversarial reviewers each told to
REFUTE one claim rather than confirm it, then a synthesis. Where a page could not be
read it is named in §4 and the claim is left unverified. Nothing here is carried from a
search-engine summary — those were chased to the pages they were attributed to, and the
ones that turned out not to be there are listed in §4 so they cannot re-enter.*

**Headline: 4 of 9 claims are contradicted, 4 are unsupported-but-plausible, 1 has no
evidence either way. Not one of the nine is confirmed.** That is not a criticism of the
document — it says so itself, in its own first paragraph. It is the reason to check.

---

## 1. Verdict table

| # | The claim | Verdict | What the evidence supports | Mark |
|---|---|---|---|---|
| 1 | PWM 40–60% | **contradicted** | On a CS-80 a percentage means **duty cycle**, and PW spans **50–90%**. 40–49% does not exist, in hardware or in Arturia. And duty cycle *d* and *100−d* are the same timbre, so a band symmetric about 50% contains every sound twice. | `[GUESS]` |
| 2 | Filter cutoff 35–60% | **no evidence** | No source gives the CS-80's filters any Hz range or percentage scale. The sliders are marked LOW→HIGH only — and they **run in opposite senses** (HPF: LOW = open; LPF: LOW = closed), so one number cannot address both. | `[EAR]` |
| 3 | Resonance 5–20% | unsupported, plausible | No calibrated resonance scale exists anywhere. Direction is defensible: the filters **cannot self-oscillate at any setting**. | `[EAR]` |
| 4 | Attack 0–150 ms | **contradicted (floor)** | Yamaha specifies **1 ms minimum**, 1 s max, for both envelopes. 0 ms is unreachable — a voice that allows it makes a click the instrument cannot. | `1 ms–1 s` `[corpus]`; window `[EAR]` |
| 5 | Release 2–8 s | unsupported, plausible | Inside the documented **10 ms – 10 s**. But the CS-80's tail is four release sliders **plus** a separate global SUSTAIN (~10 s die-away) **plus** reverb; one scalar attributes all of it to one stage. | `[EAR]` |
| 6 | Detune 2–8 cents | unsupported, plausible | Sources conflict on the throw: Yamaha "approximately ±1 semi-tone", cs80.com "about half a semitone". No Blade Runner detune is published anywhere. | `[EAR]` |
| 7 | Aftertouch → brilliance +20–60% | unsupported, plausible | The **sign is documented** — AFTER-BRILLIANCE is unipolar, it can only add. The magnitude is not: the lever is calibrated 0–10 and nothing converts that to Hz or percent. There are **two** of these, one per channel. | `[EAR]` |
| 8 | Ribbon ±1 octave | **contradicted** | Strongly **asymmetric and relative**. Up: ~+1 octave, and only at full travel. Down: "much greater", unbounded toward 0 Hz. Arturia says they modelled the asymmetry deliberately because it is unique to this instrument. A ±1-octave clamp destroys the famous swoop. | `[GUESS]` |
| 9 | Vibrato only after onset | **contradicted as an instrument fact** | A pressure-gated vibrato path is real, so vibrato reached *that* way must follow key-bottom. But the panel Sub-Oscillator VCO lever gives vibrato from the first cycle. **There is no vibrato delay control on the CS-80.** Also: pressure raises vibrato **speed**, not only depth. | rule `[EAR]`, mechanism `[theory]` |

And the document's own premises:

| | Claim | Verdict |
|---|---|---|
| A | No archive of verified original patch sheets exists | **confirmed**, as a negative result — every Blade Runner source fetched states zero numeric synthesis parameters |
| B | BRASS III was the starting preset | preset exists `[corpus]`; the attribution to this score is stated by nothing `[GUESS]` |
| C | Footage 16' + 8' | legal, but the CS-80 has **six** footages and Yamaha's own brass demo pairs 16' with 5⅓' `[EAR]` |
| D | Static patch is ~40%, performance ~60% | mechanisms all real; the ratio is a listening judgement `[EAR]` |
| E | Schilling's *Blade Runner Blues* patch | **exists** — but it is distributed as a preset file and publishes **no values** |
| F | Arturia "Vangelis Tribute" bank | **unverified** — nothing was fetched about it. Do not cite. |

---

## 2. The unit question, answered

**The percentages are not usable as they stand.**

The CS-80's own vocabulary uses "%" for exactly one thing: pulse width. Cutoff,
resonance and brilliance are described **qualitatively every single time**, in Yamaha's
manual and in Arturia's. That is not a transcription gap — those controls have no
percentage axis to be a percentage of. Everyone who has published CS-80 filter settings
published them in **Hz**, or as a normalised fader value. Never as % of travel.

So three of the four percentages are percentages of nothing in particular, and the
fourth is a percentage of a scale that starts at 50.

**The rule this gives us:** a percentage may cross from a source into this program only
when the source states it in the same physical unit. For the CS-80 that means pulse
width and nothing else. Everything else must be re-derived in Hz, cents, seconds, or an
explicitly named 0..1 program control.

---

## 3. What this means for `V.cs80` as it stands

Each verified by reading the code, not inferred:

- **`res` is a Q multiplier, not a resonance amount.** `resm = 0.50 + 1.00 * res`, then
  `lp.Q = L.lpQ * resm` with `lpQ` 3.2 / 2.4 baked per layer. Entering "5–20%" would
  give Q ≈ 1.8–2.2 — roughly *half* the shipped default. Almost certainly the opposite
  of what "5–20% resonance" was meant to mean.
- **`atBrill` is scaled by each layer's attack level in Hz** — `atBrill * L.al * 1.35`.
  With `al` 4200 and 2600 on the two layers, one "40%" is +2268 Hz on one and +1404 Hz
  on the other. A percentage here is a percentage of an implementation detail.
- **A 2–8 s release is currently un-hearable.** `end = t + ev.durSec + 1.2` stops every
  node there, so anything past ~1.2 s of tail is truncated and the top and bottom of the
  proposed range sound identical.
- **There is no `cs80.detune` control.** Layer II is hardcoded at ratio `1.0042` =
  **7.26 cents** — already near the top of the proposed 2–8 band, which is mild
  independent corroboration that an earlier ear landed in the same place. The only key
  named `detune` in this genre is `drone.detune: 0.62`, a 0..1 control on a *different
  voice*; writing "2–8" there would wreck the drone.
- **IL/AL is already modelled** (`il`/`al` per layer), which is the thing that makes a
  CS-80 brass patch bite. Good news, and worth not breaking.

---

## 4. What could not be verified

**Pages that could not be fetched:**

- `noisegate.com.au/free-arturia-cs-80-v-blade-runner-blues-patch/` — empty body, twice,
  two researchers. **The single most likely place a real Blade Runner number is still
  hiding.**
- `therogoffs.com/cs80/CS80 Adjustment Procedures and updates.PDF` — 6.1 MB, but a pure
  image scan: 36 pages yielded 602 characters. Any figure attributed to the *service*
  manual is unverified until someone OCRs it.
- `synthfool.com/…/Yamaha CS-80 Owners Manual.pdf` — over the 10 MB fetch limit.
  Substituted with the Internet Archive OCR text of the same manual, pulled with curl
  and grepped locally rather than summarised.
- `vintagesynth.com/yamaha/cs80` — 404. The working `.php` URL was read and contains no
  envelope, LFO, ribbon or IL/AL detail; it is not a source for any number here.
- `cs80.com/tour.html` on the bare domain — DNS failure. Only `www.cs80.com` resolves;
  any stored project link to the bare domain is broken.

**Fetched but containing no numbers** — never cite these as numeric provenance: both
Reverb Machine Blade Runner articles ("attack" occurs zero times in the *Tears in Rain*
piece), nemostudios.co.uk/bladerunner, alijamieson.co.uk, Synthtopia's Schilling piece,
and Sound On Sound's CS-80 review.

**Search-summary artefacts, chased to their pages and found absent.** Recorded so they
cannot come back:

- "filter cutoff set to 230 Hz", attributed to Reverb Machine — **not on the page**
- "boost all the filters cutoff frequencies and resonances", attributed to Blade Runner
  — it is Reverb Machine's recipe for **Empire of the Sun's "Walking on a Dream"**
- "resonance has no effect when a filter is wide open", attributed to Yamaha — **that
  sentence is not in the manual**
- "a couple of cents" detune, attributed to Schilling — that is **MusicTech**, about a
  different soft synth
- "raise the attack time to halfway" — appears in a search summary and in no page

**Still open:** the duration of the initial pitch-bend scoop (every source says only
"brief"); the ribbon's transfer curve; whether Yamaha's ±1 semitone or cs80.com's
~½ semitone detune throw is right (both recorded, neither chosen); and the taper of
every slider — only endpoints are published, so a millisecond or cent value can never be
converted back to a panel position.

---

## 5. What the sources ADD that the document does not have

Documented, with real provenance, and several matter more than anything in the original
list:

- **The filter envelope is not ADSR.** It is **IL / AL / A / D / R with no sustain**.
  IL sets where the note starts — raising it starts the note **darker**, which is
  counter-intuitive. AL is an **overshoot above** the panel cutoff; D drags it back down
  to the panel setting; R returns to IL, not to zero. Three sources agree. Attack time
  on this envelope has **no effect at all** if IL and AL are both at zero.
- **Envelope ranges, both envelopes:** attack 1 ms – 1 s; decay 10 ms – 10 s; release
  10 ms – 10 s. Attack tops out an order of magnitude shorter than the others.
- **A separate global SUSTAIN slider**, up to ~10 s of die-away after key release — a
  distinct contributor to the long tail that must not be double-counted with reverb.
- **The vibrato LFO is global**, 0.7–60 Hz, applied equally to both channels and all
  notes. Not per-voice free-running, even though aftertouch depth is per-key.
- **Chorus/tremolo is a second, separate LFO** — chorus ~0.5–5 Hz, tremolo ~5–20 Hz,
  feeding a VCA pair plus an analog delay line to simulate a rotating speaker in stereo.
  A plausible source of the width, distinct from vibrato.
- **Filters are 12 dB/oct two-pole state-variable**, HPF + LPF per channel, and
  **cannot self-oscillate at any setting** — damped topology plus limiting resistors.
- **BRILLIANCE offsets all four filter cutoffs at once; RESONANCE adds only, and is
  inverted** (pulled *down* = more). That one lever moving four filters is the
  mechanism behind "manual filter opening".
- **Aftertouch is polyphonic but capped:** 61 key sensors multiplexed onto **8 voices**.
  Model it per-voice with an 8-voice ceiling, not per-key across 61.
- **Ribbon:** relative/differential from first touch (a single stationary touch produces
  nothing), affects **only currently-held keys**, up-max ~12 semitones at full travel,
  down unbounded toward 0 Hz.
- **Portamento/glissando:** ≤10 s across the keyboard, ~2 s per octave.
- **Pitch:** 32 Hz – 8 kHz normally; 0 Hz – 11 kHz with the pitch controls and ribbon.

---

## 6. ADDENDUM — the Syntorial recipe, fetched and applied

*Added after the user supplied it. Fetched from
`syntorial.com/preset-recipe/vangelis-blade-runner-brass/` and checked against their
transcription line by line: identical. The page adds that the patch "combines pulse
width modulation with dynamic filter modulation" and that the sound is at 1:01 in the
End Titles.*

**This is the first document in the project to state Blade Runner synthesis parameters
as numbers rather than adjectives.** The earlier pass listed it as second-hand and
warned it was a different synth. That warning still holds for its percentages — and it
turns out not to matter, because the parts that decide the sound are in absolute units.

**What travels (ms, cents, octaves, structure):**

| | value | effect on the build |
|---|---|---|
| Osc 2 pitch | **+1 octave, −6 cents** | We had it 7.26 cents sharp *in the same octave*. Wrong architecture — **fixed**. |
| Both oscillators | **Pulse, PW 50%** | Channel I was a sawtooth — **fixed**. Confirms the 50% floor a third time. |
| LFO | **→ pulse width, triangle, 80%** | We had **no PWM at all** — **built**. |
| Voice mode | Mono | The lead line is monophonic. Not yet acted on. |
| Amp env | A 250 / D 1900 / S 40% / R 750 ms | Not yet applied. |
| Filter env | A 650 ms, D 10 s, S 0%, R 10 s | Not applied — see below. |

**What does not travel:** cutoff 75%, resonance 15%, LFO amount 80%, osc volumes 60/40.
Percentages of Syntorial's synth. Only the 3:2 balance ratio was kept, `[EAR]`.

**It refutes two more of the original document's claims:**

- **Attack 0–150 ms** — dead at both ends. Amp attack is **250 ms**, filter attack
  **650 ms**. The ceiling is as wrong as the floor.
- **Release 2–8 s** — the *amp* release is **750 ms**. It is the *filter* release that
  is 10 s. The document collapsed two stages into one, exactly as the manual research
  predicted it had.

**And it confirms two:** detune **6 cents** (inside 2–8 — but riding on an octave, not a
unison), resonance **15%** (inside 5–20%, weakly, being a different synth).

**It settles one thing nothing had supported.** "Footage 16' and 8'" was marked
unattributed. An independent recipe putting oscillator 2 exactly one octave above
oscillator 1 *is* a 16' against an 8'. Two sources, arrived at separately.

**Two sources converge on the PWM depth.** The recipe says 80%; Old Crow's panel tour
says sine PWM "does not sound 'overmodulated' until past 80% of depth". Different
people, decades apart, same number. That is the strongest single corroboration in this
whole file.

### A correction to §3, and it changes what is worth building

§3 said a 2–8 s release is un-hearable because `V.cs80` stops every node at
`durSec + 1.2`. The truncation is real, but the conclusion was wrong: **the CS-80's own
tail is short.** Amp release 750 ms with sustain 40% means the amplifier closes long
before the 10 s filter release matters — on the real instrument too. The recipe's own
prose says so plainly: the CS-80 is *"otherwise dry-sounding"*, and the huge tail is the
**Lexicon 224**, in use from 1980 onward.

So the long tail belongs to the **room**, which this program already has, and lengthening
the voice would have been building the wrong thing. What is worth revisiting instead is
`space.wet`: this genre sets **0.55**, the recipe says **10% wet**, and the earlier
research doc had already flagged 0.55 as "pure [EAR] … could easily be far too hot".
Three-and-a-half times too hot, if the recipe is any guide. **Not changed** — it is a
percentage of an unknown reverb and an ears question, so it is recorded, not acted on.

### Applied, and measured

`probe_controls.js cs80`, every knob driven end to end:

| control | Δ peak | Δ level | Δ brightness |
|---|---|---|---|
| `pw` | 24.6% | 6.75 dB | 64.3% |
| `pwm` | 13.1% | 0.87 dB | **227.3%** |
| `pwmHz` | 17.6% | 0.17 dB | 36.4% |

**0 dead controls on the machine.** PWM moves brightness more than anything else on it
while barely moving level — which is what a phasing timbre measures like, as opposed to
a tremolo. `probe_voices`: 0 threw, 0 silent, cs80 peak 0.378. Snapshot IDENTICAL.

### Still open here

- amp envelope 250 / 1900 / 40% / 750 ms — portable, not yet applied
- mono voice mode for the lead line
- `space.wet` 0.55 vs the recipe's 10%
- `noisegate.com.au`, hosting Schilling's patch, still returns an empty body

---

## 7. Method

Sixteen agents: six researching distinct angles (signal path, envelopes and vibrato,
touch response, ribbon, the Blade Runner reconstructions, the Arturia manual), nine
adversarial reviewers each assigned one claim and told to refute it, one synthesis.
1.2 M tokens, 431 tool calls. Every reviewer was asked the unit question explicitly,
because this project has generated false bugs before by comparing unlike things.
