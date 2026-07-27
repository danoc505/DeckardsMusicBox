# MK2 ROADMAP

*Where the rebuild stands, what comes next, and what each step needs before the next
one starts. Every phase exits through a render, not a feature list. The masterdoc
(MASTERDOC-REBUILD.md) is the constitution; this is the schedule.*

## Where we are

| done | what |
|---|---|
| ✔ | M0 — sound engine built first: 4 voices + kit, role buses, soft-clip with real headroom, one limiter, one seeded reverb, low-cut send. Reference bar rendered and iterated twice (presence 0.7% → 3.3%, no clipping). |
| ✔ | M1 first cut — one 4-bar lofi loop composed in pocket order (pocket → drums → bass → keys → theme → counter), valid by construction, no correction passes, seam checks throw. |
| ✔ | M2 first cut — form grammar, subtractive arrangement, lead sits out a section, the empty bar before the peak, performance stage owning gain and timing once. |
| ✔ | Live playback fixed (rolling window; the graph holds dozens of nodes, not thousands). |
| ✔ | Determinism proven per render (compose twice, compare events). |

## GATE 0 — the ear verdict (needs: the user, ~10 minutes)

Everything below branches on this. Listen to 3–5 seeds in the artifact and answer
three questions, roughly:

1. **The sound**: does the palette feel like an instrument or a toy? Too dark / too
   bright / thin where? (Every `[EAR]` mark in the file is waiting on this.)
2. **The groove**: does the rhythm section feel like one thing? Swing too little/much?
3. **The biggest annoyance**: name the one thing you'd fix first. That becomes R1's
   top item, whatever this document says.

No verdict, no next phase — building on an ungated palette is how MK1 died.

## R1 — THE LOOP EARNS REPEATING (the biggest known musical gap)

Today the same 4 bars tile the whole song; verse and chorus differ only by who plays.
That is honest but monotonous. R1 gives the song a reason to be 40 bars long:

- **Chorus material**: a second theme (the hook) composed against the same loop —
  chorus sections play it instead of the verse theme. The hook repeats itself more
  than the verse tune does [corpus: chorus self-similarity +3.6 pts].
- **Pass-to-pass life**: the second pass of a loop inside a section varies ONE thing,
  owned by the stage that owns the property — e.g. the drums' ghost placement or one
  keys syncopation — drawn per pass, still deterministic.
- **The fill grammar**: a drum fill in the last bar before a section change (snare-led,
  toms only at phrase ends), owned by the arrangement's treatment set.
- **Intro that builds**: intro = the loop filtering/entering (keys alone → +bass →
  +hats), not the full bed at bar 0. Outro lands on the tonic and stops.

EXIT: 10 seeds; A/B against today's build; the user picks R1 blind on at least 7.

## R2 — THE PERFORMANCE DEEPENS

- Per-lane accent maps from the Groove tables (backbeat loudest, ghosts genuinely
  ghost) — inside the one velocity formula, not a new pass.
- Humanized keys strums (few-ms roll), bass note-length articulation (staccato vs
  held drawn per song), lead phrase dynamics (peak of phrase slightly louder).
- Tape character for lofi [EAR]: gentle wow (slow pitch drift on keys), vinyl noise
  bed at −40 dB, high shelf tilt. All in the sound stage, all behind an A/B.

EXIT: A/B pair logged; user verdict.

## R3 — THE TEST BATTERY BECOMES PERMANENT

- `harness/mk2_test.py`: the output assertions (audible, no clip, crest, dynamics
  arc, band envelope, determinism) against 5 seeds — the MK1 `test_output` pattern,
  pointed at MK2, run on every merge.
- Note-seam tests in node (the stages are plain functions — extract the script once
  with a 10-line build step, no browser needed for stages 1–5).
- `test/ears/LOG.md` starts: every [EAR] decision gets its date, its A/B pair, and
  the verdict. Nothing merges on taste without a line here.

EXIT: suite green in CI fashion (one command), ear log has its first entries.

## R4 — GENRE 2: CITYPOP (the first proof the machine generalizes)

A genre = parameter tables only (Law 4): tempo range, mode weights, progression
pools, pocket set, palette (new voices allowed — they're additions to the sound
stage, gated on solo renders), space, swing bounds, form weights. **If citypop needs
a new correction mechanism anywhere, stop: the architecture has a hole, fix the
stage that owns it.**

EXIT: 10 citypop seeds pass the same battery at citypop envelopes; user ear gate.

## R5 — THE REST OF THE CATALOGue, ONE AT A TIME

Order by distance from what works: barber → wise → dungeon → ambient → house →
synthwave → jungle last (it needs the one genuinely new subsystem — a break
resequencer that is still a LOOP; it gets designed against the masterdoc checklist
before a line is written).

EXIT per genre: battery + ear gate. No two genres land in one phase.

## R6 — THE TOYS (only after the band convinces)

Sampler/chopper (all ten slicer lessons from the audit apply), WAV/MIDI export
parity (one code path — exports read the same performance events), the seed
library, visualization. Each behind the same gates.

## Standing rules while any of this happens

- One change per commit with its measurement; renders attached to every claim.
- The reference bar re-renders on every sound-stage change — if the canary sounds
  worse, the change is wrong regardless of the numbers.
- MK1 (`Improv Machine playable_BETA 0.1.html`) is frozen: reference and corpus
  source only. No more fixes land there.
- The corpora and harvesters serve both builds; new measurements go through
  `corpus/` scripts, never hand-entered.
