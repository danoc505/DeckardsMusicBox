# SYNTHWAVE — THE FORM, researched (Perturbator-forward)

*2026-08-02. Fresh research per the user's rule: prior sessions' research does
not count toward new work. The user named Perturbator as the pole this genre
should lean toward. Every claim carries its source; taste is marked.*

## Sources

1. Orpheus Audio Academy, "Synthwave Song Structure" —
   https://www.orpheusaudioacademy.com/synthwave-song-structure/ (the
   two-structure model; fetched via search summary, page rate-limited on
   direct fetch)
2. ABSYNTH.space, "PERTURBATOR - Lustful Sacraments" review —
   https://www.absynth.space/articles/perturbator-lustful-sacraments
3. Dreamtonics, "How to Make Synthwave Music" —
   https://www.dreamtonics.com/how-to-make-synthwave-music/ (via search)
4. EDMProd, "How to Make Synthwave" — https://www.edmprod.com/how-to-make-synthwave/ (via search)
5. Bandcamp, "Dangerous Days" — https://perturbator.bandcamp.com/album/dangerous-days
   (13 tracks, 1:08 total -> mean ~5:14/track)

## What the sources say

**There are two synthwave forms, not one.** Orpheus: a **Pop structure** —
*"3 peaks in energy (choruses), offset by sections with a drop in energy
(verses/bridges), with the overall song increasing in energy over time and
climaxing with the final chorus"* — and an **EDM structure** — *"builds and
drops rather than standard verses, with two main builds where tension
increases over time before being released in the hooks, typically broken up
by a bridge section in the middle."*

**Perturbator is the second kind, aggressively.** ABSYNTH on Lustful
Sacraments: *"The aversion to typical verse-chorus-verse structures and the
blending of various different parts carries over to the rest of the album"*;
tracks *"frequently feature sudden turns, changes and building up and
stripping down of elements."* The mid-track strip is documented as a gesture:
*"The drums drop out... the heavily modulated synths... slowly dying down.
The track explodes into life once again."* Builds are additive layering:
*"Soon rolling, crisp synthetic beats... join in. Swirling synths loom in the
background. The track soon builds towards a crescendo."*

**Sections turn over every ~16 bars.** Dreamtonics (via search): *"vary the
melody or add new elements to the track every 16 bars or so."* The breakdown
sits *"about halfway through the track"*, running *"16 to 32 bars"*.

**Tracks are long.** Dangerous Days: 13 tracks / 68 minutes = **~5:14 mean**.
This is more than double lofi's typical length and the longest form of the
pop-adjacent genres in this program.

## The plan (as landed in `GENRE.synthwave.form.plan`)

The EDM/Perturbator structure, in the program's section vocabulary — two
builds, two hooks, the strip in the middle, ending on the biggest statement:

    rise:   verse/instrumental, 16-24 bars, ends on prechorus (the ramp)
    hook:   chorus/postchorus, 8-12 bars (first release)
    strip:  bridge/instrumental/verse, 8-16 bars (the drums-drop middle)
    rise2:  verse/instrumental, 16-24 bars, ends on prechorus
    climax: chorus/postchorus, 16-24 bars, ends on chorus (the explosion)

The pre-chorus is placed as each build's EXIT rather than in its pool: H4
(a pre-chorus must reach a chorus) makes a mid-build pre-chorus illegal by
definition, and the phase mechanism's seek can reach an exit the pool does
not contain. So the ramp appears exactly once per build, at its top, and
the hook phase opens on the chorus it promised.

## Marked taste, and what was refused

- Budget steps are **[EAR]**; the sources give "every 16 bars" and
  "16-32" for the breakdown, not exact grids.
- Total length lands wherever the budgets sum; measured after landing (see
  the table comment for the measured range). Perturbator's 5:14 mean argues
  for the long edge; The Midnight's pop pole argues shorter. The genre's
  92-132 bpm band spreads the same bar count across a wide wall-clock
  range. **[EAR]**, the user's ears decide.
- **Refused:** three-peak pop form as the default (the user named
  Perturbator, and ABSYNTH documents the aversion to verse-chorus);
  mandatory vocals-oriented sections (this program's synthwave is
  instrumental); killing the pop functions entirely — prechorus/postchorus
  stay, because the ramp-into-release IS the EDM structure's hook edge, and
  they are this genre's own researched vocabulary from the earlier pass.
