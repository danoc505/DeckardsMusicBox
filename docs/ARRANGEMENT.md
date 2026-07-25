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
