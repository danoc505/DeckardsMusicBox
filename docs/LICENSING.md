# Licensing & provenance — what we can legally use, and why

*Not legal advice; for a commercial launch, have a real IP lawyer review this. But the
reasoning below is what makes the approach defensible, and it is stronger than the
"sampling is legal" argument.*

## The key point: what we do is NOT sampling

Audio sampling law is actually **hostile** to samplers, not protective. *Bridgeport Music
v. Dimension Films* (6th Cir. 2005) held "get a license or do not sample" — even three
notes of a **sound recording**. *VMG Salsoul v. Ciccone* (9th Cir. 2016) allowed a tiny
de-minimis recording sample, creating a circuit split. So "people have won and proven
sampling is protected" is a **myth** — it's contested and usually needs a license.

**But none of that applies here, because we never touch a sound recording.** We use
*symbolic* music (notes on a grid), and we extract two kinds of thing:

1. **Non-copyrightable building blocks.** Chord progressions (ii-V-I, the blues, rhythm
   changes) are "common stock of musical raw material" and are **not copyrightable** —
   composers must share a common harmonic language. `JAZZ_CORPUS` stores exactly this:
   chord-degree/quality sequences, **no melodies**. Safe regardless of the source.
2. **Abstract relative dimensions, recombined.** A list of durations from one source, a
   list of intervals from another — split apart and corrected into a new key and chord.
   The output is **not substantially similar** to any single source (the legal test for
   infringement is substantial similarity to *protectable expression*), because no
   source's expression survives the recombination. This is a stronger footing than
   sampling law — it's the "no substantial similarity" / idea-not-expression doctrine.

The engine's own principle — *"none of the sources contained the result"* — is, not by
coincidence, close to the legal standard for non-infringement.

## Why "public domain in Russia/Asia" does NOT help

Under the **URAA** (upheld in *Golan v. Holder*, 2012), the US **restored** copyright on
huge numbers of foreign works. A piece that is public-domain **in its home country can
still be copyrighted in the US** — sometimes for *longer* than at home. So sourcing from a
country with shorter terms does **not** make a US-copyrighted work safe to ship here. The
protection comes from our *method* (above), not from the source's jurisdiction.

## The policy we follow

- **Prefer clean sources:** US public domain (published ≤ 1930, as of 2026), CC0 / CC-BY /
  PD datasets. Honor attribution (CC-BY) and share-alike-on-the-database (ODbL) terms.
- **Store only relative / abstract material** — degrees, intervals, durations, drum lanes —
  never absolute audio, never a recognizable whole melody.
- **Keep provenance** per source (name, license, what was taken) — see below.
- **The recombination is the protection**, not a fig leaf: keep sources many and fragments
  small so no single work's expression is reproducible from the output.

## Provenance ledger

| Source | What we took | License basis |
|---|---|---|
| JSB Chorales (382, Bach) | voice-lines, contours (relative) | PD composition (d.1750) |
| Jazz Harmony Treebank (1170 standards) | chord **progressions** only | progressions non-copyrightable |
| Weimar Jazz DB (456 recorded solos) | chord **changes** only (no melodies) | progressions non-copyrightable; ODbL DB |
| Grammar (order-2 Markov over the pooled corpus) | **nothing** — new contours, rhythms & progressions generated from statistics | no source material retained; strongest position |

## The strongest move: learn the grammar, generate the notes

Beyond recombining fragments, `corpus/build_grammar.py` learns an order-2 Markov grammar
over every ingested **contour, rhythm, and chord-progression** and GENERATES new
material in each dimension from the aggregate. The output retains **no source melody** — it is built from pooled
statistics the way a player internalises a tradition. Every generated contour is
filtered so it is never even a contiguous sub-sequence of any single source. This
is the strongest not-infringing position in the project: there is no source to be
substantially similar to.

## The open question you raised (your call)

Your argument — *"we abstract and recombine, so we can draw even from copyrighted
material as long as we don't reproduce it"* — has real merit under doctrine #2 above, and
it's the only way to "tap the whole planet" for melodic *flavor* (jazz phrasing, rhythm,
contour). Concretely: we could extract **abstract rhythms and contours** (split apart, not
paired) from transcription datasets whose *underlying works are copyrighted* (e.g. the
WJazzD solos), because a bare list of durations and a bare list of intervals, recombined
across many sources, is not substantially similar to any solo.

**The honest caveat:** "we abstracted it enough" is a *fact-specific* defense you'd rather
win by design than have to litigate. The safest posture is abstract **and** clean-source
where possible; use the abstract-from-copyrighted route deliberately, with provenance, and
with a lawyer's sign-off before a commercial release. It is defensible, not free. This is
your decision to make — the engine is built to support it either way.
