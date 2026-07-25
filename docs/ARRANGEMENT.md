# Arrangement — the leader and the tracks that orbit it

> **Status:** the engine now designates a **LEADER** track (the melodic foreground,
> `chart._leader`, currently the `lead`) and defines every other track by its
> relationship to it. This is grounded in orchestration / film-scoring practice, not
> invented. What's implemented and what's still ahead is tracked at the bottom.

The user's ask, in their words: *"identify a leader of the track… one of the tracks
is the leader and all other tracks move around it — introduce, compliment, counter,
duel."* The web research below (film/orchestral arranging) turned that into concrete,
codifiable rules.

## The model: melody-dominated homophony

Professional practice converges on a **layered stack**, not a flat set of equal
tracks:

- **Foreground** — the melody / lead. *One* leader at a time.
- **Middleground** — counter-melody, harmonic comping, active figuration.
- **Background** — sustained pads/harmony, bass foundation, rhythmic bed.

Clarity comes from **functional hierarchy, not volume equality**: "when everything is
equally prominent, the listener does not know where to focus." A dense mix reads
clearly only when the roles are ranked.

## Codified principles → engine rules

| # | Principle | Rule in the engine | Source |
|---|-----------|--------------------|--------|
| 1 | One voice leads; all others are explicitly subordinate ("melody-dominated homophony") | `chart._leader = "lead"`; **prominence hierarchy** pass in `ghostPass` ranks every pitched voice at a defined level beneath the lead | Rimsky-Korsakov; hellomusictheory; filipeleitao |
| 2 | Give the lead its own register; keep busy accompaniment out of the melody's octave | lead is the highest melodic band; the arp (which sat *above* the lead) is dropped to background level so it sparkles rather than rivals | Rimsky-Korsakov; Open Music Theory |
| 5 | Rhythmic complementarity: busy under held, held under busy | harmony **comps** — its inner motif ducks −7 dB under a held lead note (`ghostPass §2c`) | Panman; Composing the Score |
| 6 | Counter/answer voices fill the leader's **rests** (call-and-response) | `buildCounter` places its reply inside the lead's largest within-bar silence, not from step 0 over a held note | Panman; Wikipedia (Counter-melody) |
| 7 | Attenuate competing higher voices so the lead is prioritized | prominence ratios: counter/lead2 ≈ 0.80×, arp ≈ 0.62×, pad ≈ 0.55× the lead's level | Rimsky-Korsakov; Panman |
| 11 | Film scoring: the score **supports, never competes** with the focal element | the lead is the protected focal element; supports duck and sit beneath it | Soundverse (underscoring) |
| 10a | Leadership can move — the lead is a role, not a fixed track | `pickLeader` hands leadership to the most-present melodic voice when the lead lays out (measured: some songs' lead covered <15% of bars); the hierarchy then ranks around the *actual* leader | Filimowicz (Sound & Design) |
| duel | Two voices trade as **equals** (not leader-over-support) in a featured moment | `arrangeSections` marks one peak/moment section where a partner (counter/lead2) plays most; a final pass brings the partner **up to the leader's level** in that span so they answer each other on even footing | Panman (antiphony); Filimowicz |

Ratios are applied proportionally (each voice's median velocity is scaled to its
target, preserving internal dynamics) and only ever pull a voice **down** — nothing
is boosted except a gentle +8% lift on the leader itself. Bass and drums are the
**foundation** (a different function) and keep their own levels.

## Measured effect (40 seeds, `harness/run/probe_hierarchy.js`)

| voice | avg velocity before → after |
|-------|-----------------------------|
| lead (leader) | 0.506 → **0.598** |
| counter | 0.468 → 0.425 |
| arp | 0.401 → **0.293** (was *above* the lead in register) |
| harmony | 0.335 → 0.316 |
| pad | 0.269 |
| bass (foundation) | 0.762 |

The lead is now clearly the loudest melodic voice with real separation beneath it,
instead of a crowded stack where the arp out-registered the tune and the counter
nearly matched its level.

## Song length (the "1-minute sketch" fix)

Sections are now sized to a per-genre **duration target** (house/DnB ~5 min,
synthwave/citypop ~4, dungeon/neoclassical ~3.5, ambient long, lofi loop-native ~2)
by scaling each 8-bar phrase up on the 8-bar grid — so the state/repeat/depart/vary
development cycle actually runs several times per section. Median duration 2:38 →
**3:50**, nothing under 2:39. The "no exact loop 3×" law is now measured on the
**full texture** the listener hears (all parts together: 0/40 3-peats), not the bass
in isolation — a groove bass repeating under a developing arrangement is how
long-form works, not a violation.

## Relational generation — the band derives from the leader

The core fix for "every track does its own thing": generate the leader, then DERIVE
every other voice from it. One relationship is assigned per present support voice ONCE
per song from a seeded stream, with hard variety budgets — at most one MIRROR, one
HARMONIZE, one COUNTER; always ≥1 simple bed (pad pinned); always ≥1 answer/counter;
genre-biased weights. So each song is a distinct, legible division of labour (one
foreground, one voice moving with it, one bed, the rest answering) and never collapses
to unison mush. Realizations run BEFORE the ghost (so they're validated) and are placed
into each band by a uniform whole-octave shift (a per-note fold was inverting bass-led
lines). Relationships: MIRROR (arp tracks the leader's pitch), HARMONIZE (parallel-6th
duet on the leader's onsets), ANSWER (counter fills the leader's gaps), COUNTER
(contrary motion), SHADOW (the leader's strong beats, simplified), DRIVE (rhythmic
double), PEDAL/DRONE/BED (the simple bed); lowline stays coupled to the bass, not the
tune. Design + adversarial review: the `relational-generation-design` workflow
(arranger / engine-safety / anti-monotony proposers + a synthesis critic).

Measured (40 seeds): MIRROR per-bar pitch correlation with the leader **0.68** (was
~0, now all-positive), ANSWER gap-fill **0.86**, HARMONIZE interval-consistency
**0.96**; relationship mix well spread. All laws hold (NCT 0.42%, unisons 0,
recurrence intact), determinism 40/40.

## Peak-first method + sections that play DISTINCT material

The user's method, in their words: *"two starting points, the leader and the peak. The
leader sets what all other things follow and the peak where the whole thing is leading
to and going away from… start composition at the climax, then work backward, then work
forward making alterations and corrections… like a real producer."* And the core
complaint that drove it: *"it sounded like there was one single bass line for the whole
song — that's not how songs are made."*

So the engine composes the **peak** (the moment where the motif is fully realized and
every voice plays at full density) and treats every other section as a transform of it.
The **backward** pass strips density from the peak toward the intro/outro (the density
*peel*, foundation held). The section-distinct passes are the **alterations** that make
each section its own thing — not one loop tiled:

- **Bass — a genuine SECOND TAKE.** The first attempt at this was cosmetic and was
  correctly rejected by ear: it re-pitched off-beats but KEPT the rhythm, so it was the
  same LINE (measured after the fact: 2 distinct bar-rhythms across 120 bars). A producer
  does not edit one take into a song, they *write a different part*. So the bass engine
  runs a **second time** on its own seeded sub-stream — same chart, key and progression
  roots (it is the same song), genuinely different rhythm and shape. Take A (composed at
  the peak) keeps the chorus and bridge; take B plays verse/intro/outro/breakdown. Runs
  before the groove so the new line gets the same performance layer; the ghost validates
  it. The pre-chorus still holds a DOMINANT PEDAL on the 5th.
  Measured: verse and chorus share **no** rhythm pattern in **33/34** songs.
- **Melody** — the chorus is the peak sung at FULL HEIGHT; the whole melodic group
  (lead + its leader-derived partners) drops a rigid DIATONIC block for the verse
  (~a 4th–5th down), lifts a step for the pre-chorus. Moving the group *together*
  preserves every relateToLeader interval (a mirror stays a mirror, a 6th stays a 6th).
  Clamps fold downward to an in-key floor only, so the chorus is always the peak.
  Measured: verse lead LOWER than chorus **33/33**, avg drop **4.8 semis**.
- **Harmony** — the verse holds (slower harmonic rhythm — the chords sustain), the
  chorus comps (the inner-motif re-articulations, flagged `_rehit`, are dropped in the
  held sections). Pitches/progression untouched, so consonance and the derived voices
  are unaffected. Measured: verse harmony sparser than chorus **28/34** (7.71 → 5.79
  notes/bar).

## THE HOOK — the reason you can name the song

A hook is not "a good melody": it is the **same phrase returning intact** every time the
chorus comes round. The engine had no hook at all — every chorus developed the theme
differently (measured: 6 choruses → **4 different melodies**), so there was nothing to
recognise. Now the canonical chorus is the **PEAK** (the motif fully realized — the
destination the whole song is built around) and its melodic material is stamped into
every other chorus, tiled if that chorus is longer. So the hook *is* the peak: heard
early, heard again, and finally heard at full power. It runs after the density peel
(which thins by loop position and would otherwise reshape each chorus), then the ghost
gets the last word. Measured: every chorus plays the same phrase in **31/36** songs.

## Real intros — anything can start a song

The opening was hardcoded to exactly **three** roles in every song (min 3, max 3) with
melodic voices banned outright — a fixed-size band from bar one, which is its own kind
of "full blast". Now the opening **size** and its **members** are both seeded choices
over every voice that has entered: any instrument can open, including the tune itself (a
hook riff is a classic intro), with a floor voice guaranteed so a bare melodic pair is
never the whole opening. The **kit** also thins at the frame — it had been exempt from
the density peel everywhere, so the opening (usually the rhythm section) played its full
loop from bar one. Bass and harmony keep their patterns (their bar-to-bar repetition is
the stored-texture law). Measured: opening size 2 or 3 (**23/17**, was always 3); intro
density **23.1** notes/bar vs chorus **32.7**.

## The seed-0 bug (found while measuring the above)

`improvise()` assigns the base seed onto the chart it is **given** (`coreChart`); the
conductor's chart never had `_seed`. Every seeded decision later in `composeSong` —
entrance fills, the relationship assignment, the density peel — read `chart._seed||0`
and therefore ran on seed **0**: *identical in every song, whatever the seed*. It
silently collapsed the exact variety those passes exist to create. One line carries the
seed back. Measured: distinct bar-0 bass rhythms across 40 songs **4 → 34** (the
pre-existing ceiling was 20 — the bug had been suppressing variety all along).

All laws hold across the rebuild: bass consonance **0.16%**, NCT **~0%**, below-floor
**0**, hierarchy intact (lead loudest), the peak IS the global energy max **38/38**,
intro↔peak foreshadow **0.72**; determinism **40/40** per seed. Grounded in production
research (peak-first writing; verse-a-4th-below-chorus; verse-holds/chorus-comps) — see
`harness/probe_peak_arc.js` and the sources below.

**Still ahead (the forward pass):** producer-style transition/correction passes —
fills and risers *into* the big sections and an impact on the chorus downbeat (the
moment already gets a riser+wash; a true crash awaits a crash voice — the synth maps
`crash`→a thin open-hat today), plus energy-curve smoothing at the seams.

## Any track can lead (bass or melody)

`chart._leader` now follows the conductor's **focal**: a `bass` focal makes a
**bass-led** song (dub/funk/DnB — the bass is the hook, foregrounded, everything
ranked beneath it), a `melody` focal leads with the tune. Measured: 14/40 bass-led,
26/40 melody-led; in 11/11 bass-led songs the bass is the loudest pitched voice.
**Not yet:** chord/riff-led — the harmony here is a sustained comp texture, not a
rhythmic chord riff, so it can't lead by level without drowning under the bass; a
chord-riff engine behaviour is required (research B3, future).

## Done since first pass

- **Duel** — one featured section per song (11/40; 10 audible) where the leader and a
  partner voice trade at matched level (`arrangeSections` marks it, a final pass
  equalizes the span). See the "duel" row above.
- **Dynamic leader (partial #10)** — when the lead lays out, `pickLeader` hands
  leadership to the most-present melodic voice so the song always has a leader to
  build around (1/40 today — the fragmented songs). This is the *within-song fallback*
  form of leadership handoff.

## Not yet done (ranked, honest)

- **#10 (full) Hand the lead between tracks across SECTIONS as a design choice**, not
  just as a fallback — passing the melody verse→solo (lead → counter → back),
  re-orchestrating on each hand-off, with a smooth one-phrase overlap. The engine now
  has the leader as a reassignable token (`chart._leader`); making it *change per
  section* deliberately is the remaining lever.
- **#8 `contribution` per track** (weight / warmth / motion / attack / air) so an
  optional voice is added only when it adds something the mix lacks.
- **#9 Intensity by layer count over time** — partly present (arrangement adds/drops
  voices per section); not yet driven by an explicit target layer-count per energy.
- **#12 Leitmotif** — the theme object exists (`09_theme.js`); re-orchestrating the
  leader's theme on recurrence (new instrument/register) is not wired to the leader.

## Sources

- Rimsky-Korsakov, *Principles of Orchestration* — https://www.gutenberg.org/files/33900/33900-h/33900-h.htm
- Filipe Leitão, "You're Not Supposed to Hear Every Instrument" — https://www.filipeleitao.com/post/you-re-not-supposed-to-hear-every-instrument
- Evenant, "A Practical Approach To Orchestration" (MeHaRyTe) — https://evenant.com/a-practical-approach-to-orchestration/
- Panman Music, "How to Write Countermelody" — https://www.panmanmusic.com/writing-countermelodies/
- Composing the Score, "Creating Counter-Melodies" — https://composingthescore.wordpress.com/2016/01/08/creating-counter-melodies/
- Soundverse, "What Is Underscoring in Film" — https://www.soundverse.ai/blog/article/what-is-underscoring-in-film-0816
- Splice, "What is Arrangement in Music?" — https://splice.com/blog/what-is-arrangement-in-music/
- music4beginner, "Ravel's Boléro" — https://music4beginner.com/ravels-bolero-building-tension-and-orchestration-explained/
- Filimowicz (Sound & Design), "Orchestration & Arrangement" — https://soundand.design/orchestration-f93ab89e83a5
- HelloMusicTheory, "Homophonic Texture" — https://hellomusictheory.com/learn/homophonic-texture/
- Wikipedia, "Counter-melody" — https://en.wikipedia.org/wiki/Counter-melody
- Open Music Theory, "Core Principles of Orchestration" — https://viva.pressbooks.pub/openmusictheory/chapter/core-principles-of-orchestration/
