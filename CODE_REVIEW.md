# Code review — Deckard's Orchestrator (Improv Machine BETA 0.1)

*Reviewed by reading the engine embedded in `Improv Machine playable_BETA 0.1.html`
and, crucially, by **running** the standing suite and the note-roll against the real
engine — not by reading code alone. Every number below is measured across ≥40 seeds and
is reproducible with `harness/` (see the bottom of this file).*

## TL;DR

- The engine is **disciplined and largely honest to its own laws.** Ran the standing
  suite against the shipped engine: **75 passed / 20 failed**, and **all 20 failures are
  environmental** — absent `node_modules`, un-checked-in sampling modules, and corpora.
  **Zero music-logic regressions.** Every physics/loop/story/theme/groove check passes.
- **One real, measurable gap — now FIXED:** the documented HARD law *"non-chord tones
  resolve by step"* was **not enforced and not tested**. The unjustified case (leap-in +
  leap-out) measured **6.79% of melodic notes**; a ghost sub-pass drops it to **0.12%**,
  now guarded by a standing test. See finding #1.
- **Two minor baked-in violations — now FIXED** (a fixed entrance drum fill; a hardcoded
  opening-companion order), plus the bass/harmony register overlap. See findings #2, #4.
- Several concerns from a code-only read **measured to zero in practice** and are *not*
  real problems (register overlap; thin intros). Reporting them as bugs would have been
  the exact "statistics that agree with themselves" mistake the project warns about.

---

## How this was checked (and an honesty note)

Only the built HTML, `tests.js`, `print roll.js`, the two spec PDFs, and reference images
are in the repo. The numbered modules and corpora the tools `require()` are **not** — so
out of the box neither tool runs. Rather than review by eye (the "single most expensive
habit" per the handoff), `harness/build_engine.py` reconstructs a runnable engine **from
the HTML itself** so the suite and the roll work again. This review is therefore
*measured*, but with two honest limits: it is **static** (no audio render), and it cannot
exercise the sampling/synth modules or corpora that aren't checked in.

---

## Scorecard (measured)

`node tests.js` against the shipped engine: **75 passed, 20 failed**.

| Group | Result |
|---|---|
| Physics (chords above bass, lead above chords, in-key, no unison, octave spacing) | ✅ all pass, 0/40 violations |
| Loop laws (repeat, loop2==loop1, loop3 departs, never 3× identical) | ✅ 40/40 |
| Story / arrangement (open with 2+, rise, late payoff, drops from height, kit in ½ loop, nothing thin >4s) | ✅ pass (thin: **0/60, worst 0.0s**) |
| Theme, groove, determinism | ✅ pass |
| The 20 failures | ❌ **all environmental** — see below |

**The 20 failures, categorized (none are music bugs):**
- Missing `node_modules`: `jsdom`, `pitchfinder`, MIDI library (external referees self-skip).
- Un-checked-in modules: `11_slicer.js`, `12_sample_notes.js`, `13_flip.js`, OPN2 driver.
- Un-checked-in corpora: `corpus.json`, `bach_corpus.json`, `folk`, `dimensions`, voice lines.

The two sampling checks (`the band steps aside…`, `…high-passed so our bass has room`)
**pass** once the shipped HTML stands in as `player.html` — the features (`SAMPLE.room`,
`hpHz`/`highpass`) are present in the shipped engine.

---

## Findings

### 1. Non-chord-tone resolution — FIXED (measured) ✅

`HARD.resolvesByStep` (HTML ~line 4067) was **dead code — never called**, and the suite
had **no test** for the documented law *"non-chord tones resolve by step."*

Grounded in music theory ([NCT types](https://en.wikipedia.org/wiki/Nonchord_tone)): a
passing/neighbour tone steps in and out; an appoggiatura steps out; an escape tone steps
in — each resolves BY STEP on one side and is **legal**. The only unjustified dissonance
is one **approached by leap AND left by leap**. That is the real defect, and it measured at
**6.79% of all melodic notes** (981/14,454 across 40 seeds).

**Fix:** a ghost sub-pass (new section 3b in `ghostPass`, the codebase's own idiom — section
3 already snaps out-of-key non-resolvers) snaps a leap-in/leap-out in-key NCT to the nearest
tone that is both in the sounding chord and in key (within a third, never below the voice's
floor). Melodic voices only; harmony/bass voicings are never touched; it runs before the
unison pass so side effects are cleaned.

**Measured result:** unjustified NCTs **6.79% → 0.12%** (981 → 17 notes) — a 98% drop. The
"loose" left-by-leap metric fell 10.4% → 4.0%, and the remainder is *legal* escape
tones/appoggiaturas (correctly preserved). **No regressions:** suite still green on every
music law (chords-above-bass 0/40, lead-above-chord 0/40, in-key 98.6%, ghost invariants 0).
A **standing test** now guards it (`tests.js` §8b, threshold ≤1%): passes at 0.12% with the
fix, would fail at 6.79% without it. Reproduce: `node harness/run/probe_nct.js`.

*Note on porting:* the change lives in the engine inside the HTML (the only source here). If
the real numbered-module tree is restored, port section 3b into `08_ghost.js` and rebundle.

### 2. Prime-directive (baked-in) — two minor violations — FIXED ✅

- **Fixed 4-tom entrance fill** — the entrance fill pushed an identical descending tom fill
  (`[50,48,45,41]`, flat velocity) on every non-breaks entrance, consulting **no RNG**.
  **Fixed:** the fill now derives a seeded RNG (`makeRng(hashName(seed,"fill"+bar))`) and
  rolls the toms up or down, dropping hits by chance. Measured: **20 distinct fill
  signatures across 20 seeds** (was 1); determinism preserved.
- **Hardcoded opening-companion order** — the opening companions were chosen from a fixed
  priority list `["drums","harmony","bass",…]`. **Fixed:** a seeded `wpick` over the
  arrived roles with soft weights (drums/harmony/bass likelier, but the seed decides).
  Measured: **8 distinct opening lineups across 20 seeds** (was ~1); determinism preserved.

### 3. Solid — confirmed by measurement (no action)

- **Chords above the bass uses ABSOLUTE register** (the classic trap is avoided): 0/40.
- **Per-engine RNG sub-streams** (`makeRng(hashName(seed,name))`): genuinely isolated;
  the old ensemble-starving bug is closed.
- **Loop laws / one-progression-one-texture / bridge-only modulation / open-with-2+ /
  sections-differ**: all enforced, all pass.
- **Concerns that measured to zero** (do **not** treat as bugs): lead/harmony register
  overlap (`lead above chords` 0/40, despite being theoretically foolable); thin intros
  (0/60 despite the code allowing a ~9s solo ceiling vs the documented ~4s). The code is
  looser than the doc, but the *output* is clean. Worth a comment in the code, not a fix.

### 4. Latent traps (cheap hygiene)

- Dead `chooseContrary` with a `Math.random()` would break seed-determinism if ever wired
  in. **Deleted ✅** (removed, not buried).
- **Bass/harmony register overlap FIXED ✅** — `BASS_CEIL` was `50` while harmony floor is
  `50` (the code comment said "bass tops at 48"), so a chord could touch the bass ceiling and
  read as an inversion. Set `BASS_CEIL=48` for a clean gap; restored `chords above bass 0/40`.
- **Voice-leading (known weakness) — measured + tracked, rework queued.** Handoff flagged
  ~52% stepwise vs Bach's 77.3%; measured here at **35.5%** (`harness/probe_voiceleading.js`,
  now a standing metric in the suite §8c). A prototype that adds open/drop-2 voicings so the
  existing preference has smoother options DID move it (→~54%), confirming the diagnosis and
  that the Bach material is now available — but open voicings destabilise the stored-texture
  onset-repeat invariant (drops it below the 0.9 threshold). Reverted rather than shipped;
  the proper fix reworks the texture generator to stay voicing-structure-stable, then re-adds
  the variants. The metric makes the number visible so that rework can be measured.
- **loop->song / structure recombination DONE ✅** — `corpus/build_structure.py` harvests
  real song forms (AABA/ABAC/AB…) from the standards by section-repetition detection; the
  conductor now recombines real macro structure (repeated to song length so the story arc
  holds: moment 34/38, drops 34/38). See docs.
- Documented "nothing thin >4s" is coded as ~9s (`maxSoloBars=floor(9/secsPerBar)`). Align
  the constant or the doc. *(open — measured to 0 in practice, so cosmetic.)*

---

## 10× — what's missing, where to go (given the sampling pivot)

The stated new direction: the engine has moved from *making* notes to *editing* real,
open/copyright-free songs — chopping them **"down or across"** into new songs. That phrase
is the whole strategy: **down** = slice along time (a break into hits); **across** =
separate a source into musical *dimensions* (rhythm ⟂ contour ⟂ harmony ⟂ timbre ⟂
structure) and recombine those across sources. The engine already does "across" **on
notes** (`dimensions.json`: 1,217 phrases → 350k combos; `flipRealPhrase`/`recombine`).

**The 10× is to make real audio songs first-class "relative material" — decomposed into
the same dimensions the engine already recombines under music-theory law.** Concretely,
in rough priority:

1. **Audio → symbol for *polyphonic* songs.** Today `12_sample_notes` is mono-oriented
   (YIN + chromagram + KS key + chord recognition). Chopping real songs "across" needs
   **stem separation** (drums/bass/vocal/other) → per-stem transients, pitch, and implied
   harmony. This is the single biggest capability gap for the vision.
2. **Real-music drum corpus** (the handoff's #1 known-unfinished). The sampling direction
   *is* the fix: harvest grooves from open drum stems (or Groove MIDI, CC-BY). Stored
   relatively (lanes + micro-timing), they slot in like every other corpus.
3. **The sample as a full member of the listening layer.** Order-independence is the core
   idea — extend it so a dropped song is *just another engine*: its implied harmony drives
   the bass, its transients drive the groove, its phrase grid drives entrances. The
   "room rule" is a first step; go all the way.
4. **Recombine *structure*, not just ingredients** (handoff known-unfinished). Harvest
   whole **arrangement states** — who plays when, the density curve, section boundaries,
   the drop — so the engine can assemble song *form* from real songs: form of A, drop of
   B, texture of C. This is what "make whole new songs from chopped songs" really means.
5. **Characterize melodies & grooves by property** (handoff known-unfinished) so genre
   selects on feel (syncopation, leap rate, density, swing), not just major/minor — the
   same "vocabulary vs grammar" trick already applied to progressions. Required for
   placing a real source by *feel*.
6. **Provenance & licensing as a first-class layer.** The premise is copyright-free/open
   sources — so track each chop's source + license, refuse un-clearable material, and
   measure "distance from source" so output is demonstrably transformative. This is both
   legal safety and a genuine differentiator.
7. **Audio quality to match the ambition:** `rubberband-web` (on npm, noted untried) for
   time-stretch/pitch; a real stem model. Moves sampling from "chop and play" to
   "recompose."
8. **A measurement discipline for the new paradigm.** The gold standard is "read the roll
   across 40 seeds"; sampling has no equivalent yet. Add a **sample-roll** (chops on a
   grid with detected pitch/onset/*source*) and standing tests: recombined bass still
   states the root, recombined harmony stays in key, onsets land on transients, provenance
   is clearable. Then the sampler is held to the same honesty bar as the generator.

Framed in one line: **turn "a note generator that also samples" into "a sampler that
recomposes real music under music-theory law"** — same constraint-refereed,
order-independent, seed-explores core, with real audio songs as the material.

---

## Reproduce everything

```sh
python3 harness/build_engine.py
cd harness/run
node tests.js                 # 75 pass / 20 fail (all environmental)
node print_roll.js 11 8       # read the roll; see the baked 4-tom fill in bar 1
node probe_nct.js             # the 10.5% unresolved-NCT measurement
```

Line numbers reference the shipped `Improv Machine playable_BETA 0.1.html`. This review
is static (no audio); the user's ears remain the final judge.
