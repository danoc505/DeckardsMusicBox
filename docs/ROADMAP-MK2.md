# MK2 ROADMAP — rev 2

*Rewritten after the form research (FORM-RESEARCH.md). The first revision treated
"more sections" as a later nicety; that was wrong. A song IS its form — the section
pool, the grammar that sequences it, and the rule of three that forces motion are the
skeleton everything else hangs on, so they move to the front. Every phase still exits
through a render. The masterdoc is the constitution; this is the schedule.*

## Where we are

- ✔ M0 — sound engine built and gated first (reference bar canary ships in the file)
- ✔ M1 — one 4-bar lofi loop composed together in pocket order, valid by construction
- ✔ Live playback rolling-window fix; determinism proven per render
- ✔ Form research done: ~30-section taxonomy by function; measured transition
  probabilities; the rule of three formalized as a cross-stage constraint
- ◻ GATE 0 — the user's ear verdict on the palette (open; collected alongside R1,
  since R1 changes composition, not sound)

## R1 — THE FORM IS THE SONG  *(in progress)*

The current build has one material and three hardcoded section sequences. R1 replaces
that with the researched model:

**R1a — the grammar.** Stage 2 draws the section sequence from a function pool
(intro/vamp, verse, chorus, bridge, instrumental, outro — the lofi-weighted subset of
the taxonomy; other genres will enable more of the pool later) via measured Markov
transitions [corpus: prechorus→chorus 88%, verse→chorus 64%, bridge→chorus 57%].
The grammar carries two counters per function — consecutive statements and total
occurrences — and enforces the rule of three at the section level: a third
consecutive identical section cannot be drawn, and a third *occurrence* of a function
emits a `vary` demand that a downstream stage must satisfy.

**R1b — the material family.** Stage 3 stops producing one loop and produces a
FAMILY, where every member is DERIVED from A so the sections are informed by each
other by construction, never by a correction pass:

- **A** — the verse set (what exists today)
- **B = hook(A)** — the chorus: same progression, same pocket, same bass; a new tune
  built FROM A's opening intervals (inverted), denser keys, a 2-bar phrase stated
  twice exactly [corpus: the chorus repeats itself more than the verse], counter on
- **C = depart(A)** — the bridge: the one member allowed to leave the progression;
  A's theme rhythm AUGMENTED (durations doubled), sustained keys, roots-only bass
- **A′ = vary(A)** — same first half, redrawn second half [research: "start the same,
  go somewhere different halfway" — the canonical rule-of-three answer]
- **fill** — the drum bar that leads into an arrival, composed here, selected there
- **ending** — the tonic landing bar

**R1c — the arrangement consumes demands.** Stage 4 maps functions to materials,
selects (never edits): verse→A, chorus→B, bridge→C, instrumental→A minus the tune,
vamp intro→A's bed. A `vary` demand on a 3rd verse is satisfied with A′ (material
level); on a 3rd chorus with a stripped first half (arrangement level) — the change
may live at a different level than the repetition that demanded it.

EXIT: 10 seeds; sections audibly distinct (B is a hook, C is a departure); rule of
three verifiable in the printed story line; user A/B against the pre-R1 build.

## R2 — THE PERFORMANCE DEEPENS
Per-lane accent maps inside the one velocity formula; keys strums; articulation
draws; lofi tape character (wow, vinyl bed, tilt) [EAR]. Exit: logged A/B.

## R3 — THE TEST BATTERY BECOMES PERMANENT
Output assertions vs 5 seeds on every merge; node seam-tests for stages 1–5;
`test/ears/LOG.md` — no taste decision merges without a dated A/B entry.

## R4 — GENRE 2: CITYPOP
A genre = parameter tables only: tempo, modes, progression pools, pocket set,
palette additions (gated on solo renders), space, swing bounds, and its OWN slice of
the section pool (citypop enables prechorus/postchorus that lofi leaves off). If a
genre needs a correction mechanism anywhere, the architecture has a hole — stop.

## R5 — THE CATALOGUE, ONE GENRE AT A TIME
barber → wise → dungeon → ambient → house (enables build-up/drop/breakdown from the
pool) → synthwave → jungle last (the break resequencer that is still a loop).

## R6 — THE TOYS
Sampler (all ten slicer lessons apply), export parity, library, visuals.

## Standing rules
One change per commit with its measurement · the reference bar re-renders on every
sound change · MK1 is frozen (reference + corpus source only) · new numbers come
through `corpus/` harvesters, never hand-entered.
