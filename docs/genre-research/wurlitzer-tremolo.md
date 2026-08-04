# The Wurlitzer's tremolo — how deep, how fast, and how deep is too deep

*Researched 2026-08-04 after the user reported "the pulsing sound is very heavy…
I can hear it if I load up the wurly, melo, or rhodes." The Wurlitzer was the
one. This sheet is what the real instrument does, what the ear tolerates, and
what was changed.*

---

## 1. THE RATE — fixed on the instrument, and our number was low

Every source agrees the rate is **fixed** on a real 200/200A and only the depth
is adjustable. The published figures cluster tightly:

| figure | source |
|---|---|
| **5.5 Hz** | Apple, *Logic Pro User Guide*, Tremolo effect controls: "The original Wurlitzer Piano has a mono tremolo with a **fixed modulation rate of 5.5 Hz**." |
| **~5.6 Hz** | openwurli (github.com/hal0zer0/openwurli), from component-level circuit analysis: "Rate fixed at ~5.6 Hz by Twin-T oscillator." |
| 5.37 Hz | Nord User Forum, cycle-count off a recording in Audacity (read via Wayback; the live site 403s) |
| 5.35 Hz | same thread, reported second-hand |
| ~~6.34 Hz~~ | Arturia *Wurli V* manual 2.0.0 — **an outlier, and dropped from their own 3.0.0 manual** |

**HONEST GAP:** there is **no factory figure in the public record**. The
official Wurlitzer 200/200A service manual on archive.org is an image scan with
no text layer and could not be read. Every number above is third-party.

We ran **5.2 Hz**, below the whole 5.35–5.6 cluster. Now **5.5 Hz**, the
best-attested figure.

**The rate is NOT what made it heavy, and that was tested rather than assumed:**
sweeping the rate across its entire 3–8 Hz travel at fixed depth moved the
measured swing by **0.13 dB**, while dropping the depth moved it about 5 dB.
**Depth is the lever by roughly 40 to 1.**

---

## 2. THE DEPTH — nobody has published one, and this is the weak part

**No source gives a tremolo depth in dB or percent for any real 200/200A.**
Said plainly because it would be easy to imply otherwise.

The only hardware measurement found is one owner's oscilloscope reading of his
own 200A [corpus:ep-forum thread 10483]: preamp output 1.8 V peak-to-peak with
the tremolo off, 4.0 V with it at maximum — which he calls "slightly more than
6 dB signal gain". **That is the peak RISE, not a peak-to-trough swing — the
trough was never measured** — and that instrument had a degraded vactrol which,
once replaced, made the effect noticeably weaker. A ceiling-ish hint, not a
target.

**Two facts about the real circuit we do NOT model**, recorded so nobody
mistakes our version for a model of the instrument:

- On a 200A the tremolo peak is a **gain increase above** the unmodulated
  level — an LDR inside the preamp feedback loop — which can drive the internal
  amp into clipping. Ours ducks *down* from unity.
- The 200 (bias-shift) and the 200A (LDR) are **different circuits**: "bias
  shifting tremolo is often considered smoother, while LDR tremolo can be
  somewhat choppier" [corpus:Tropical Fish Vintage].

---

## 3. HOW DEEP IS TOO DEEP — the part with real numbers

Since the instrument's own depth is unpublished, the useful threshold is
perceptual, and that literature does have numbers.

- **Detection floor.** Viemeister's 1979 temporal modulation transfer function
  puts the threshold at −25 dB modulation over 2–10 Hz, which works out to
  about **0.98 dB peak-to-trough**. Anything above ~1 dB is audible.
- **Annoyance onset.** Virjonen, Hongisto & Radun, *JASA*, December 2019:
  annoyance penalties "varied from **4 to 12 dB, when Dm ranged from 4 to
  14 dB**". So **≈4 dB peak-to-trough is where a measurable annoyance cost
  begins**, and 14 dB costs 12 dB of penalty.
- **And the rate makes it worse, not better.** Fastl's fluctuation strength
  peaks at **4 Hz** and falls away either side (half-maximum at 1.07 Hz and
  14.9 Hz). At 5.2 Hz we sat at **0.967 of the maximum** — essentially the most
  sensitive point on the curve. The whole 3–8 Hz range of this knob lives near
  that peak, so depth is the only real control.
- **Production practice**, for context rather than authority: 20–25% depth for
  sustained keyboard parts [corpus:Unison]; *Sound On Sound* treats 50% as the
  "less jarring" setting and 75% as "to add accents".

---

## 4. WHAT WAS WRONG HERE, AND WHAT CHANGED

**Two separate faults, and the first was much bigger than the second.**

**(a) The arithmetic — fixed at `2026-08-03s`.** The wobble was summed into the
note's gain as a fixed amount unrelated to how loud the note was, so the depth
depended on the note. Rendered: **25.8 dB** at a loud note, **24.5** at
average, and below about half loudness the gain went **negative**, flipping the
waveform on every cycle. A tremolo multiplies the note; it does not add to it.

**(b) The amount — fixed at `2026-08-04b`.** With the law corrected, lofi's
declared 0.55 gives 6.94 dB. But **the declared value is not what plays**: this
genre automates the depth upward for the chorus. Measured over 38,852 note
reads across 300 seeds, the effective depth ran **median 0.64, p90 0.72** —
7.6–7.9 dB on the part and **10–11 dB on the pad**, which is a Wurlitzer in 77%
of pad note-seconds and holds the longest notes in the genre. Reading the base
alone under-priced the worst case by about 4 dB.

Set now to land the effective median near the 4 dB onset instead of at twice
it: base **0.55 → 0.32**, chorus lift **[0.09,0.18] → [0.04,0.09]**, rate
**5.2 → 5.5**.

**Measured end to end, a sustained pad note in a chorus, seed 1:**

```
  original          ~25 dB peak-to-trough   (and inverting on quiet notes)
  after (a)          9.01 dB
  after (a) and (b)  3.87 dB
```

**Exposure, so the scale of it is on record:** Wurlitzer notes occur in **50.7%
of 300 lofi seeds** and are 24–31% of all lofi keyboard note-seconds — and in
**0 of 120 seeds** in each of the other six genres. This was a lofi problem
throughout, which matches where the user heard it.

---

## 5. WHAT WAS CHECKED AND CLEARED

Named so nobody re-investigates them:

- **The rate / beating against the tempo.** Refuted twice over. The 40:1
  depth-vs-rate result above, and the beating cannot happen anyway: a fresh
  oscillator is created per note and started at the note's onset, so the wobble
  phase-resets every note. Verified — the predicted drift sideband measures
  0.0005 against 0.0143 at the carrier.
- **The Rhodes auto-pan.** A 10–25 second sweep, which is the real Suitcase
  behaviour, not a pulse.
- **The Mellotron's wow and flutter.** Pitch, about 10 cents and 1.3 cents.
- **chipKeys.** No amplitude modulation at all.

---

## 6. WHAT IS STILL [EAR]

The depth is a judgement, and it has to be: **no source gives the real
instrument's depth**. What is sourced is the *threshold* (§3), and the value is
now set against that rather than against nothing. If it is still heavy it is
one number — `GENRE.lofi.params.wurly.trem` — and the section lift beside it.

---

## Sources

- [Tremolo effect controls — Apple, Logic Pro User Guide](https://support.apple.com/guide/logicpro/tremolo-effect-controls-lgcefb0a0d1b/mac)
- [openwurli — circuit analysis](https://github.com/hal0zer0/openwurli)
- [Wurlitzer electronic piano — Wikipedia](https://en.wikipedia.org/wiki/Wurlitzer_electronic_piano)
- Virjonen, Hongisto & Radun, "Annoyance caused by amplitude-modulated sound", *JASA* 146(6), December 2019
- Viemeister, "Temporal modulation transfer functions based upon modulation thresholds", *JASA* 66(5), 1979
- Fastl & Zwicker, *Psychoacoustics: Facts and Models* — fluctuation strength
- [Tremolo depth in production practice — Unison](https://unison.audio/)
- [Wurlitzer tremolo circuits — Tropical Fish Vintage](https://tropicalfishvintage.com/)
- ep-forum.com thread 10483 — the one hardware scope measurement found
