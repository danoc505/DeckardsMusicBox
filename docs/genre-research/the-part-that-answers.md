# The part that answers — 2026-07-31

*Brief, verbatim: "constraints allow for novelty to emerge and music is novelty
arithmetically derived."*

---

## What was missing

Every lane in `buildDrums` **declares**: a step list, a division, a sequencer length.
Nothing had ever **read** what the pattern turned out to be and answered it. Sean Booth,
on Autechre's setup:

> "A sequencer is spitting out stuff and we're using our a verdict on it and the faders to make the
> music… one fader determines how often a snare does a little roll or skip, and **another
> thing answers and says 'if that snare plays that roll three times, then I'll do this.'**"
> — [Sound On Sound](https://www.soundonsound.com/people/autechre)

`kit.answer` is that. A rule watches a set of lanes, counts what it hears, and writes on
every Nth. **Zero random draws** — not "the draws run unconditionally", *none* — so Law 7
is unviolatable and a genre that declares nothing is byte-identical by inspection.

## The instrument came first

`harness/probe_novelty.js` scores a 64-step lane by **LZ76 complexity** against two
controls built at the lane's *own* density: its first bar looped (**0.00**) and a seeded
shuffle (**1.00**).

The shuffle is the point. "Deterministic rules watching the pattern" and "random notes"
are trivially confusable by taste, so the claim is only worth making if it can be separated
from a dice roll. **The null hypothesis was written down before the mechanism existed**,
so it could not be chosen to flatter it.

Baseline, before anything was built:

```
  lofi         0.050   bar-repeat 0.931        plastikman  -0.080   bar-repeat 0.611
  synthwave    0.003              0.975        jungle       0.914              0.000
  dkc          0.000              1.000
```

Two findings fell out immediately, both worth having:

**Polymetre is phase, not information.** Plastikman's bar-repeat had fallen to 0.61 when
`kit.poly` shipped — the bars genuinely stopped repeating — but its novelty was *negative*.
A period-5 pulse compresses **better** than a bar-locked loop (LZ 4 vs 6). Moving a simple
pulse out of phase with the bar adds no information to it.

**The break chopper is nearly a shuffle.** Jungle reads 0.914. Not necessarily wrong — it
is sampling a real break — but it is the other failure mode, already in the file.

## Candidates were scored before the shape was chosen

```
  every 2nd hit of ONE period-7 lane .........  0.000   nothing
  Euclidean E(5,16), looped or running .......  0.000   nothing
  a period-7 or period-5 pulse alone ......... -0.200   LESS than a loop
  every 3rd of (rim OR clap), not on kick ....  0.500   <- shipped
  rim XOR clap, not on kick ..................  0.800
  CA rules 30 / 90 / 110 from a dense seed ... >1.000   past noise
```

**The person playing it on one lane produces nothing.** "Every 3rd hit of a period-7 pulse" is a
period-21 pulse — LZ cannot tell it from the pulse it came from. Novelty only appears when
the person playing it watches **two sequencers interacting**, which is why `watch` is a set and why
`kit.poly` had to exist first.

**And the guard is a generator.** `notOn: ["kick"]` exists to keep the person playing it off the
downbeat — and on its own that constraint takes the same figure from 0.000 to 0.500. The
rule that protects the one is the rule that makes the part interesting. That is the brief,
arithmetically.

The lesson repeated for generation two. Watching two *irregular* lanes scored 0.921 — a
shuffle. Watching one irregular lane against the **metronomic hat** scored 0.687. Chosen
from a 24-configuration sweep:

```
  ghost + rim   alone  2   0.921   two irregular lanes compound into noise
  ghost + clap  alone  2   0.889
  ghost + hat   alone  4   0.687   <- an irregular lane against a regular one
  ghost + hat   any    4   0.248
```

A third generation scored **1.000**. So there are two, and Booth's "three or four
generations down the line" is *reported rather than obeyed* — that is a studio pipeline
with two people watching at every step, not four rounds of one rule.

## The half that was missing: the same figure every song

A 12-agent research pass (Elektron conditional trigs, Euclidean/CA/L-systems, perception
limits, and the codebase itself) read the shipped mechanism and found the flaw measurement
had not yet asked about:

**The person playing it is a deterministic function of what it watches — and everything it watched was
seed-fixed.** Over 60 seeds, material A had **4** distinct player outputs; material C had
**1**. Perfectly reproducible *and* perfectly identical. It derived novelty against a loop
but not against the next record.

A sequencer's **phase** is the free parameter. Two machines at 7 and 5 sound different
depending on where each was when you pressed start, and *"getting the machines running and
then jamming out live"* describes a room where that is never the same twice. Drawn per song
from a **named substream** — never from the shared builder `rng`, because this file records
what that costs (the ostinato ratchet took one draw and moved 882 of 2100 snapshot seeds).

```
  material A   4 -> 43 distinct player figures over 60 seeds
  material B   3 -> 34
  material C   1 -> 11
```

## Three things measured and removed

**A syncopation ceiling.** The person playing it's lane scores 13.1 on Longuet-Higgins & Lee against
a groove optimum near 4, and beat-tapping error tracks that index at r = .82 — damning
enough to build a `maxSync` ceiling. Then measured properly: LHL assumes a **complete
rhythmic surface**, and a lone note at step 3 of an empty bar scores **15, the maximum**,
because every strong beat after it is a rest. On a sparse ornament lane the index is
near-maximal by construction. It showed as a cliff, not a gradient — ceilings of 8 through
13 gave byte-identical material. And decisively: **the kit as heard has union syncopation
0.000 over 320 bars, with the people playing it and without.** The kick holds every strong beat;
there is no one to lose. The index is kept — in the seam battery, asserting exactly that.

**Euclidean rhythms.** 0.000 novelty, looped or running. Maximally even means maximally
compressible.

**Cellular automata.** Rules 30/90/110 from a dense seed all score past 1.000. The research
agreed independently: class-3 CA is "a random number generator wearing a costume."

## Two bugs it surfaced

**Every "collision in Avar" this project has ever reported was one line.** `keysA` is built
once and used in both A and Avar, but was only ever shown `ostA` — so the comp could voice
a chord onto a pitch the *varied* ostinato was about to take. The tell was sitting in the
failure message the whole time: the material was always `Avar`, never A, B or C. Fixed at
its owner; blends went to **504/504**, and the 99% tolerance that had been absorbing it is
now 100%.

**Four lanes were falling out of the .mid.** `rim`, `clap`, `crash` and `ride` had no
`GM_DRUM` entry, so every note on them was silently dropped from the export — and the
polymetre lives on the rim and the clap, so a Plastikman `.mid` was a kick and a hat with
the identifying part deleted. The check that says "the .mid carries every note of every
genre" stayed green because **its lane list was hand-copied from the same table that was
missing them**. A check and its subject copied from one source agree by construction and
prove nothing. Both fixed; the list is derived now.

## Where it stands

```
  plastikman   novelty -0.080 -> 0.125   player lane 0.674
               bar-repeat 0.611 -> 0.391
               IOI entropy 0.00 -> 0.50
               density 0.226 -> 0.212  (down)
```

Six seam checks carry it: it fires and is played; what it writes is neither a loop nor a
shuffle; no player exceeds `|watch| / every`; a genre declaring none gets none; it does
not write the same figure into every song; and the kit as heard still has the one.

## Not claimed

The person playing it reads lanes and counts onsets. It does not yet count **figures** — Booth's
sentence counts *a roll*, not a hit — and it answers only by placing a note, where the same
sentence offers "a little roll **or skip**". Both are additive fields on the existing rule
shape rather than a new mechanism, and the research pass has a worked design for each. The
strongest single finding not yet acted on: **moving an onset produces roughly three times
the groove effect of adding one**, which would also make density conservation exact rather
than merely bounded.
