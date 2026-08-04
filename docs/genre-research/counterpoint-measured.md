# What Bach actually does between his voices — and where our parallels really are

*Measured 2026-08-04. Companion to `counterpoint.md`, which collected what the
textbooks SAY. This sheet is what 382 chorales DO, counted, and what this
program does against them.*

**Two things came out of it, and the second one is the useful one.**

1. Bach's parallel fifths and octaves run at **0.127%**. Ours run 8 to 20 times
   that, and one genre 170 times.
2. **They are almost entirely between the CHORDS and the BASS, not between the
   two melodies** — which is not where anybody, including me, was looking.

---

## 0. WHY THIS MEASUREMENT EXISTS AND THE OLD ONE COULD NOT

`corpus/ingest_bach.py` put these same 382 chorales into MK1 — and it stored
each voice **on its own**, 2200 separate scraps with a soprano-or-bass label,
median four notes long. Four voices that move *against* each other went in and
2200 unrelated fragments came out. The only trace of the vertical relationship
that survived is a single number in the file: `stepwiseShare 0.773`.

So counterpoint has never actually been measured on this project. The source
data keeps the four voices **lined up in time**, one column per sixteenth, and
that is the whole of what makes it usable:

```
  Jsb16thSeparated.json — 382 chorales, each a list of time steps,
  each step [soprano, alto, tenor, bass] as MIDI numbers.
```

Source: `czhuang/JSB-Chorales-dataset`. Bach died in 1750; the chorales are
public domain.

---

## 1. HOW TWO VOICES MOVE AGAINST EACH OTHER

All six pairs of the four voices, at every moment the sonority changes —
164,672 moments.

| | |
|---|---|
| **oblique** — one holds, the other moves | **51.7%** |
| **contrary** — they move opposite ways | **23.7%** |
| **similar** — same way, different distance | 18.6% |
| **parallel** — same way, same distance | 6.1% |

**The commonest thing two voices do is that one of them stays put.** Over half
the time. That is worth sitting with, because it is not what "counterpoint"
sounds like when it is described — it is described as independence, and
independence turns out to be mostly *taking turns*.

### And contrary motion is not one number — it depends which two voices

| pair | contrary | oblique | similar | parallel |
|---|---|---|---|---|
| soprano / bass | **32.9%** | 43.4% | 18.7% | 4.9% |
| tenor / bass | 29.7% | 47.9% | 17.4% | 5.0% |
| alto / bass | 28.2% | 50.8% | 16.0% | 5.0% |
| soprano / tenor | 22.3% | 53.8% | 17.2% | 6.7% |
| soprano / alto | 14.0% | 56.9% | 21.0% | 8.1% |
| alto / tenor | 13.9% | 57.8% | 21.5% | 6.8% |

**The outer pair moves against itself more than twice as often as the inner
pair does.** Every pair involving the bass is at 28–33%; the two inner pairs
are at 14%. This program's counter has a single flat contrary-motion
preference, scored against the lead only, worth a fixed +100 — one number where
Bach has a gradient.

---

## 2. PARALLEL FIFTHS AND OCTAVES — the hard number

```
  101 in 79,615 moments where both voices moved  =  0.127%
```

Not a preference. Effectively never, across six pairs and 382 pieces. This is
the number to hold anything to, and it is the cleanest comparison available
because both sides count the identical event: *both parts move, the interval
before is a fifth or an octave, and the interval after is the same one.*

---

## 3. THE DISSONANCES

Soprano against bass, 33,192 moments:

- **12.7%** of moments are a clash (a second, a seventh or a tritone).
- Of those, **96.8% are approached by step** and **91.3% are left by step**.

**Note which number is bigger.** This program has a law for *leaving* a
dissonance by step and nothing at all about *arriving* at one. Bach is
fractionally stricter on the way in than on the way out.

And a single voice moves **74.5% by step, 25.5% by leap** — which matches the
76.0% the old ingest measured, so the two derivations agree where they overlap.

---

## 4. WHAT THIS PROGRAM DOES, AND WHERE THE PROBLEM ACTUALLY IS

`probe_counterpoint.js` reports one parallel-perfect figure per genre, averaged
over every pair of parts. Against Bach's 0.127%:

```
  lofi 1.0%   dkc 1.7%   bladerunner 2.5%   synthwave 6.0%   jungle 21.7%
```

**That average hides the finding.** Broken out by which two parts, 30 seeds a
genre:

```
  lofi          keys/bass      8.97%  (39 of 435)      <- the problem
                lead/counter   2.03%  (3 of 148)
                lead/bass      2.04%  (3 of 147)
                lead/keys      1.52%  (6 of 394)

  synthwave     keys/bass     19.06%  (142 of 745)
                bass/ostinato 10.41%  (184 of 1767)
  dkc           lead/bass     22.95%  (14 of 61)
                keys/bass     18.18%  (46 of 253)
  bladerunner   bass/ostinato 15.89%  (24 of 151)
                keys/bass     11.02%  (14 of 127)
  acid          keys/bass      7.97%  (90 of 1129)
```

**Every genre's worst pair involves the BASS**, and in five of them it is the
chords against the bass. That is 70× Bach on lofi and 150× on synthwave.

It is also obvious in hindsight: the bass plays the root, `buildKeys` voices
the chord above it, and when the chord changes both move together — so
whatever interval sat between the bass and the bottom of the voicing tends to
survive the change. Nothing in the voicing cost has ever looked at the bass.

*(synthwave's lead/counter reads 100% and is not a defect — that genre's second
part is a deliberate octave double, and it is the control that proves the test
is measuring what it claims.)*

---

## 5. A CONSTRAINT I BUILT AND THEN REVERTED

A parallel-perfect cost was added to the counter's note choice, scored against
the lead, gated so a deliberate octave double never reaches it. It was built,
it ran, and **it did not work**: lofi's lead/counter pair went 2.03% → 2.70%
and dkc's 10.14% → 9.72% — noise, on 3 to 7 events in 30 songs.

Two reasons, and both were found by measuring rather than by reading the code
again:

- **It was aimed at the wrong pair.** §4 was not known when it was written. The
  lead/counter pair is 148 moments per 30 songs in lofi; keys/bass is 435, and
  three times the rate.
- **The counter draws from a short list of intervals**, so on many notes there
  is no alternative that avoids the parallel, and a cost that never bans can
  only pick the least bad thing available.

**Reverted rather than shipped.** A constraint that cannot be shown to change
its own target is the knob-that-does-nothing this file spends its comments on,
and shipping it with a Bach number beside it would have implied a fix that had
not happened.

---

## 6. WHAT TO BUILD, now that it is located

1. **The chords against the bass.** Every genre's worst pair, 8–19% against
   Bach's 0.127%, and one cost term in `buildKeys` — which already has a cost
   function, already scores voice-leading between successive voicings, and has
   simply never been shown the bass. The bass is built before the keys in
   `makeMaterials`, so it is available to pass in. **This is the whole of the
   finding and it is one change.**
2. **Approach as well as departure.** Bach is stricter arriving at a dissonance
   (96.8% by step) than leaving one (91.3%), and this program constrains only
   the leaving.
3. **Grade contrary motion by pair** (§1): the outer parts want it at about a
   third, the inner parts at about a seventh. One flat +100 is one number where
   the measurement gives six.
4. **Oblique motion is the majority relationship and this program has no notion
   of it at all** — 51.7% of Bach's moments are one voice holding while another
   moves. Worth a measurement of our own before anything is built on it.

Anything touching a genre still needs that genre's own research first.

---

## Sources

- [JSB-Chorales-dataset — czhuang (Jsb16thSeparated.json, 382 chorales)](https://github.com/czhuang/JSB-Chorales-dataset)
- `docs/genre-research/counterpoint.md` — what the textbooks say, collected earlier
- `harness/probe_counterpoint.js` — the shipped probe, and the per-pair breakdown that corrects its headline
