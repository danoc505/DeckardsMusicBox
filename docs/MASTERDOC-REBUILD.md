# THE REBUILD MASTERDOC

*From the master coder to the master coder. If you are reading this, you are starting
Deckard's Orchestrator over from an empty file. This document is everything the first
attempt paid to learn, written so the second attempt does not pay for it again.*

*Nothing in here is speculation. Every claim marked **[paid]** was verified by
measurement on the first build, usually after weeks of not knowing it.*

---

## 0. THE VERDICT ON THE FIRST BUILD — read this before you type anything

The first build died of a specific, nameable disease, and you must be able to say it
in one sentence before you start:

> **Every property of a note was owned by nobody, so it was rewritten by everybody.**

A note's pitch was set by a melody engine, moved by a cell-opposition pass, moved by a
placement pass, moved by a register-fit pass, moved by a "ghost" validator (which ran
**24 times per song** [paid]), moved by a spike pass, and moved by a tonic-landing
pass. Its velocity was set by the engine, scaled by an arrangement dynamic, scaled by
a groove accent, scaled by a prominence pass, overwritten wholesale by a kit
re-centring pass, then scattered by a spread pass. Its timing was set to zero, written
by a groove layer, then z-scored by a remap that mistook swing for noise and threw the
whole kit 20–55 ms off the beat [paid].

Each pass was written to fix the output of the passes before it. Each was individually
justified. Each was individually tested. **The composite was garbage**, because:

1. No pass could see what the others had established. The validator silenced 40% of
   the comp [paid]. The re-placement pass shattered the chords the builder had just
   learned to strike [paid]. Four passes silently re-added a voice a fifth had removed
   [paid].
2. Every test measured the layer it was written for. Note-level tests passed while the
   rendered audio was ruined by gain staging, filter wiring, and timing remaps that no
   note-level test can see [paid — repeatedly, for months].
3. The sound engine was built last and worst. The dominant melodic voice was two sine
   waves; the "lead" was the quietest voice in the program; the hats had literally no
   energy below 2.5 kHz; both "soft" clippers were brick walls; the export carried
   double the live reverb; the reverb stacked a new instance on every press of play
   [all paid]. **You cannot compose your way out of a synth that has no harmonics.**

The last lesson, the expensive one: **fixing all 23 of these, verified one by one, did
not make the music good.** Because a wrong architecture converts every fix into a
smaller wrongness instead of into quality. That is why you are starting over.

---

## 1. THE PRIME LAWS OF THE REBUILD

These are ordered. When two conflict, the lower number wins.

### LAW 1 — The output is the only truth.
The unit of progress is a rendered WAV that sounds better than yesterday's. Not a
passing test, not a percentage that moved toward a corpus number, not a printed note
grid. Those are instruments; the render is the reading. **No change merges without a
render, and no claim of improvement is ever made without an A/B pair of renders.**
The first build claimed "fixed" without playing dozens of times, and every one of
those claims cost a week of trust.

### LAW 2 — Sound before composition.
You will not write one line of generative code until a **hardcoded** bar — a fixed
drum pattern, a fixed bass line, a fixed chord, a fixed melody fragment, typed in by
hand — sounds like a record through your engine. Kick you can feel, hats you can hear,
a chord that sounds like an instrument, a bass that doesn't eat the mix. The first
build spent months generating sophisticated note structures and playing them through
sines. If the hardcoded bar doesn't sound good, nothing you generate ever will, and
every composition experiment you run before this gate is measuring noise.

### LAW 3 — One owner per property. No correction layers. Ever.
Every field of a note — pitch, start, duration, velocity, timing offset, timbre — is
written by exactly ONE stage and is **frozen** afterward (enforce it: `Object.freeze`
each note when its stage completes; a write after freeze throws in the console where
you can see it). If downstream needs different material, downstream sends a
CONSTRAINT upstream before generation, not a correction after it. If generated
material is invalid, the generator rejects and redraws — validity is the generator's
job. **There is no ghost in this build.** The moment you feel the urge to write a
pass that "fixes" another pass's output, stop: you have found a bug in the upstream
stage; fix it there.

### LAW 4 — Simple and solid before complex, one genre before nine.
The first build had eight genres, a sample slicer, a breakbeat resequencer, a Sega FM
chip, MIDI/SWAM/MPE exports, a song library, and a flip engine — and no genre that
sounded good. Build ONE genre (pick the one you love most) to the point where you'd
play a render to a stranger without flinching. Every later genre is a *parameter set*
for a working machine, added in a day, not a subsystem. Features that are not the
band playing well (slicer, exports, chip modes) do not exist until Milestone 5.

### LAW 5 — The corpus informs, it never replaces.
Harvested data supplies **relative** dimensions — weights, contours as scale-step
moves, rhythm placement distributions, velocity ratios, section grammars — that
generators draw *through*. Harvested material is never pasted over generated material.
The first build pasted breakbeat bars over every genre's groove because a fallback
said "no match? use anything" [paid — this alone destroyed the drums in 8 of 9
genres]. Corollaries: every corpus bank is tagged with what it is (feel, genre) and a
draw NEVER crosses tags; a draw with no match means "use your own material," never
"use someone else's."

### LAW 6 — Measure the band, not the players.
The first build tuned every part against solo corpora and got a scramble, because
nothing measured the relationships [paid]. The numbers that make a band are
relational: who plays when someone else plays, who is silent, who locks with whom.
The ensemble table in Appendix A is the target sheet. Solo statistics are secondary.

### LAW 7 — Determinism is a contract, not a preference.
Same seed → byte-identical events → byte-identical audio. `Math.random()` is banned
from the entire codebase (lint for it in CI). Every RNG draw comes from a named,
seeded substream. **Every draw executes unconditionally** even if its result is
sometimes unused — a draw inside a conditional shifts the stream and breaks the
contract (the first build's songs changed when an unrelated environment flag flipped
[paid]). Overrides (key, genre, tempo) must not consume different numbers of draws
than non-overridden runs: draw first, then override the value.

### LAW 8 — Provenance on every constant.
Every number in the code is one of: (a) a physics/theory fact, (b) a corpus
measurement with the harvester and sample size named in the comment, or (c) an
explicit taste decision marked `CHOSEN:` with the A/B render pair that decided it. A bare
magic number is a bug. The first build's comments were full of eloquent justifications
for numbers that measurement later proved false — a comment is not provenance, a named
measurement is.

### LAW 9 — Dead code is deleted the day it dies.
The first build carried a whole disconnected phrase-recombination module with five
tests, a curated song library nothing read, two byte-identical copies of the voicing
stacker, and nine unreachable functions — and stale code kept masquerading as the
live rule, repeatedly [paid]. If you replace a mechanism, you delete its corpse in
the same commit.

### LAW 10 — Live and render are one code path.
The first build had two schedulers (live and offline) that diverged in reverb, sample
logic, velocity, and ducking — so the thing being judged was never the thing being
played [paid]. In the rebuild there is exactly one function that turns events into
scheduled synth calls, parameterized only by the destination context and start time.
Any feature that exists in one path and not the other is a build failure.

---

## 2. WHAT TO SALVAGE FROM THE FIRST BUILD

Take these; they are good and paid for:

| Salvage | Where it lives | Why |
|---|---|---|
| The corpus harvesters | `corpus/harvest_*.py` | Correct, documented, reproducible. The ensemble harvester (`harvest_ensemble.py`) is the single most valuable file in the repo. |
| The measured tables | Appendix A of this doc | Weeks of measurement compressed into a page. |
| The output-test pattern | `harness/test_output.js` / `.py` | Render → assert on the waveform. This is the missing half of every music project's test suite. |
| The headless-render technique | Playwright + `renderOffline` + stems | Rendering per-role stems and per-drum-lane WAVs found more real bugs than every note-level test combined. |
| The engine-extraction build | `harness/build_engine.py` | Node-runnable engine from the shipped file. In the rebuild, invert it: develop in modules, build the single file. |
| The kit-voice design | body + attack per drum voice | The rebuilt kit voices (post-audit) are the right shape. The measured spectra per lane are in the commit history. |
| The documented laws that survived | loop laws, subtractive arrangement, chords-above-bass-absolute, register bands | These are musically right. They failed in execution, not in conception. |
| The audit | `docs/AUDIT-2026-07-27.md` | The complete failure catalogue. Re-read it whenever you're tempted to add a correction pass. |

Do **not** carry: the ghost, any correction pass, the letter-scheme drum grammar
bolted to a different grid than the loop, the texture/motif objects with fields
nothing reads, the dual schedulers, the `bestSeed` judge (rebuild it later with taste
terms decided by taste), or any code you cannot explain the owner of.

---

## 3. THE ARCHITECTURE

### 3.1 Shape

Develop as modules. Ship as one HTML file via a trivial build script (concatenate +
inline). Never hand-edit the shipped artifact. Tests run in node against the modules
directly — no extraction step, no stubs.

```
src/
  theory.js        pure functions: scales, chords, voice-leading. No state. 100% unit-tested.
  rng.js           seeded streams, named substreams, draw-count assertions.
  corpus/          the harvested JSON tables + loaders. Tagged. Read-only.
  score.js         THE DATA MODEL (3.2). The only mutable thing, and only stage-by-stage.
  compose/         stage 1-4 (3.3). Each stage: (frozen input) -> (frozen output).
  perform.js       stage 5: velocity/timing, once, with ownership.
  synth/           voices, kit, buses, one master chain. No composition knowledge.
  schedule.js      ONE scheduler: events -> synth calls (ctx, t0) — live and render.
  ui/              can only call publicly exported functions; owns no music state.
test/
  unit/            theory, rng, corpus loaders.
  notes/           per-stage invariants (each stage's contract, checked at its seam).
  output/          render-and-measure: the port of test_output.* — runs on every merge.
  a verdict on it/            A/B render pairs + a log of which won and why. Append-only.
```

### 3.2 The data model — one object, staged, frozen

```js
Song {
  chart:   { seed, genre, key:{root, mode}, tempo, meter }            // stage 1 output
  form:    [ {fn, startBar, endBar, energy} ]                          // stage 2 output
  loop:    { bars, chords:[...], parts:{ role: [Note] } }              // stage 3 output
  arrangement: [ {section, activeRoles, dynamics, treatments} ]        // stage 4 output
  performance: { role: [Event] }   // Event = {tSec, durSec, pitch|lane, gain, timbre}
}
```

- Each stage takes the previous stages **frozen** and returns its own block, which is
  then frozen. There is no way to express "go back and change stage 3" in the API.
  That impossibility is the architecture.
- `Note` is grid-domain (bar/step/dur/pitch/role-velocity). `Event` is time-domain
  (seconds, absolute gain, resolved timbre). The conversion happens exactly once, in
  `perform.js`. Nothing downstream of it knows what a bar is; nothing upstream knows
  what a second is.
- Every stage records `why` — a compact log of the draws and constraints that shaped
  its choices. When output sounds wrong you read `why`, not the debugger.

### 3.3 The stages and their ownership

**Stage 1 — CHART.** Seed → genre, key, mode, tempo, meter. Owns: identity. ~50 lines.

**Stage 2 — FORM.** Chart → sections with functions and an energy curve (grammar from
the Harmonix measurements). Owns: where things go and how hard. Constraint interface:
form can demand "the loop must be 4 or 8 bars," never touch a note.

**Stage 3 — THE LOOP.** The heart. One progression, one groove, one bass line, one
comp pattern, one theme (question/answer), composed **together against the ensemble
table** — not four soloists. Generation order inside the stage: pocket (kick pattern)
→ bass ON the pocket → comp ON the pocket (they share it by construction, not by
correction) → theme in the space that remains → counter as the theme's harmony
vocal. Each generator validates its own output (in key, in band, no collisions with
already-placed parts — it can SEE them, frozen) and **redraws on failure**, up to N
times, then relaxes its own soft constraints in a defined order. What leaves stage 3
is valid by construction. Nothing downstream re-pitches anything, ever.

**Stage 4 — ARRANGEMENT.** Which roles play in which section, at what dynamic, with
which *treatments* (an enumerated, closed set: `octave`, `halfTime`, `fillBar`,
`stripToPocket`, `mute` — each a pure function on a COPY of loop notes, unit-tested,
applied at most once per section per role). Owns: the song's story. Subtractive: the
loop is whole; sections remove. The lead gets whole sections OFF (the ensemble table
says real leads are silent 42% of bars — that comes from HERE, not from melody-level
coin flips).

**Stage 5 — PERFORMANCE.** Grid → seconds. Owns, exclusively and finally: velocity
(role balance × section dynamic × accent profile, composed in ONE formula you can
print for any note) and timing (swing + per-lane lean + jitter, in ONE formula). The
first build's fatal remaps existed because velocity and timing had already been
written three times before the "final" pass — here they are written once.

**Stage 6 — SOUND.** Events → audio. No knowledge of composition. See §4.

### 3.4 The constraint bus (what replaces the ghost)

Downstream stages publish constraints BEFORE upstream generates:

```js
constraints = {
  registers:  { bass:[28,50], comp:[50,72], lead:[64,86], counter:[57,76] }, // absolute, disjoint where law requires
  pocket:     [0, 10],                 // from the genre feel — bass and comp read the SAME object
  reserved:   [],                      // (bar,step,pitch) already taken, filled as parts generate in order
  key:        {root, mode, pcs:Set},
}
```

A generator that cannot satisfy constraints after N redraws reports WHICH constraint
failed, into the `why` log. You will fix the tension at the design level instead of
smoothing it with a correction pass. This is the whole ballgame.

---

## 4. THE SOUND ENGINE SPEC (build this FIRST — Law 2)

### 4.1 Voices
- Every pitched voice must show energy in at least three octaves of spectrum. If the
  spectrogram of a single note looks like 1–3 lines, the voice is not done. (The
  first build's palette was sines and one triangle; the whole mix had 0.0–0.4% of its
  energy above 2 kHz [paid].)
- Every voice is defined with: source spectrum (osc stack WITH per-osc gains — sum
  documented), filter + envelope, and a **peak-normalized output level** measured by
  rendering the voice solo at vel=1 and asserting its RMS within ±1 dB of the palette
  target. Levels are a TABLE with provenance, not emergent from oscillator counts.
- Drum voices: body + attack, every lane, spectra asserted per lane by the kit test
  (`probe_kit` pattern). A hat must have body below 2.5 kHz; a tom must have a stick
  above 2 kHz; a snare must crack at 1.5–3 kHz, not hiss above 6.

### 4.2 Buses and master
```
voices → role buses (lead/harmony/bass/drums) → mix bus → ONE soft-clipper (with real
headroom: pre-scale so musical peaks live in the tanh knee, never at the curve edge)
→ limiter → destination
reverb: ONE instance, created ONCE (in-flight guarded), fed by SENDS from role buses
(bass/kick send ≈ 0), low-cut 200 Hz into it, return through the SAME limiter.
```
- Gain staging is designed on paper first: worst-case simultaneous peak per bus,
  summed, must sit 6 dB below the clipper knee. Assert it in an output test that
  renders a deliberate everything-at-once bar.
- Per-genre spaces/levels live in ONE table read by the one scheduler (Law 10).

### 4.3 The Day-One verdict gate
Hand-write `harness/reference_bar.js`: 2 bars of a groove you love, hardcoded.
Render it. **Do not proceed to composition until you would nod along to it.** Keep it
forever as the canary — every synth change re-renders it, and if it stops sounding
good, the change is wrong no matter what the numbers say.

---

## 5. THE TESTING DOCTRINE

Three layers, in order of authority (highest last):

1. **Note tests** — each stage's contract at its seam: in key, in band, loop repeats
   bit-exact, sections differ, determinism (compose twice, hash). Fast, on every save.
2. **Output tests** — render one song per genre per merge; assert: audible / no clip /
   no DC / crest 6–26 dB / dynamics ≥ 3 dB between windows / band balance within
   genre envelope / >0.5% energy above 2 kHz / same-seed → same samples. Plus stems:
   per-role RMS within the balance table ±3 dB. Plus the kit probe per lane.
3. **Taste checks** — a human answers to an A/B pair for every taste decision, and the
   result is LOGGED in the backlog (date, pair, verdict, one line why). Taste
   decisions without a logged A/B do not merge. The user's a verdict on it are the judge of
   record; yours are the daily proxy.

And the meta-rule the first build broke until the end: **when a report says "fixed,"
it links the A/B renders.** No renders, no "fixed" — the word is banned otherwise.

---

## 6. MILESTONES — each has an EXIT that is a render, not a feature list

**M0 — The instrument.** Synth + kit + buses + one scheduler + output tests + the
reference bar. EXIT: reference bar render passes the owner gate. *(No generative code
exists yet. Resist.)*

**M1 — One loop, one genre.** Stage 3 only, for your chosen genre: pocket, bass,
comp, theme, counter — composed together, valid by construction. Render 8 bars
looping. EXIT: 10 seeds rendered; you'd play at least 7 to a stranger; ensemble
numbers within the Appendix A envelope; zero out-of-key notes, zero collisions, loop
bit-exact — by construction, without any correcting pass in the codebase.

**M2 — The song.** Stages 2+4+5: form, subtractive arrangement, treatments, the
performance pass. EXIT: 10 full songs; arrangement audible in the waveform (quiet
verses, arriving choruses, the lead sitting out sections); dynamics test ≥ 6 dB.

**M3 — The band breathes.** Tune stage 5 against Groove MIDI (velocity ratios, lean,
jitter — applied ONCE, Law 3) and the ensemble locks against Appendix A. EXIT: A/B
against M2 logged; the user picks M3 blind.

**M4 — Genres 2..N.** Each new genre = feel table + palette table + space table +
form weights. EXIT per genre: the M1+M2 test battery at genre-specific envelopes.
A genre that needs new *code* (jungle's resequencer) is a new subsystem and waits
for its own milestone — with the rule that a resequenced break is still a LOOP.

**M5 — The toys.** Slicer, exports, chip modes, library — each behind the same gate:
one code path, output-tested, verdict-logged. The slicer lessons are all in the audit:
windowed FFT, relative (tercile) classification, lane in the index, buffer-time vs
wall-clock in `start()`, rebuild every derived table when slices change, refit on
every new song.

At every milestone: if the render does not beat the previous milestone's render in a
blind play, **stop adding and fix**, no matter how green the tests are.

---

## 7. WORKING RULES FOR THE CODER (human or LLM — these are for you)

1. **Never claim without a render.** The first build's single most expensive habit.
2. **Read the notes AND play.** Grids catch structure bugs; only audio catches
   sound bugs; you need both, every time.
3. **One change per commit, with its measurement.** The commit message states what
   was measured before, what after, and links the render pair when taste is involved.
4. **When output is wrong, find the OWNER.** There is exactly one stage that owns the
   wrong property. Fix it there. If you cannot name the owner in one sentence, the
   architecture has drifted — stop and restore it.
5. **Distrust your own comments.** Re-measure any "measured" claim older than the
   code around it. The first build's comments confidently described five behaviors
   the code did not have.
6. **Kill your fallbacks.** `|| defaultThing` and "no match? use ANY" destroyed the
   drums, hid missing instrument mappings as inaudible sines, and masked unknown
   lanes as hi-hats. A fallback that substitutes different *material* is a silent
   lie; fail loudly instead.
7. **The user's time is the budget.** Small verified steps they can hear beat large
   verified steps they can't. Ship a render with every substantive reply.
8. **When they say something is wrong, it is wrong.** Every single complaint —
   the lowpass, the slicer, the busy bass, the destroyed citypop pattern, "too much
   going on," "the synth sounds wrong" — was verified real, usually months after
   first reported. The a verdict on it found every bug first. Believe the report; find the
   mechanism.

---

## APPENDIX A — THE MEASURED TABLES (carry these; they are paid for)

**Ensemble (Lakh Clean MIDI, 300 full-band 4/4 arrangements — the band targets):**

| quantity | real |
|---|---|
| onsets/bar, whole band | median 48 (5th 22, 95th 91) |
| parts playing per bar | ~80% of parts present |
| lead silent | 42% of bars; longest silence median 14 bars |
| counter silent | 15% of bars |
| comp / bass / drums silent | ~0% |
| share of onsets: comp/drums/bass/counter/lead | 46.5 / 30.1 / 9.9 / 7.7 / 4.2 % |
| bass+comp on same 16th | 77% |
| counter on lead's 16th | 54% (it is a harmony vocal, thirds/sixths below) |
| comp notes per strike | 3.65 (chords, struck together; strum = milliseconds) |
| note lengths | comp/lead/bass median 2 sixteenths |

**Melody (Hooktheory 26k sections + POP909 cross-check):** 4.3–4.75 notes/sounding
bar; onsets near-flat on the four beats (13.8/10.2/11.3/11.4%); ~⅓ on offbeat 8ths,
~2% on odd 16ths; leaps ~35% of moves; chorus repeats itself MORE than verse (+3.6
pts); verse↔chorus register shift ≈ +1.5 semitones (not an octave).

**Bass (Lakh, 600 GM-bass tracks):** onsets/bar 5th 2.23 / median ~4 / 95th 13.1 —
huge between-song spread, keyed to the song's focus; pitch 5th 28 / median 38 / 95th
61; beats carry 58% of onsets; next-note-same-pitch ≈ 28–35%; the movement is a
walk-up at the END of the bar into the next chord.

**Drums (Groove MIDI, 1150 performances):** lane medians (vel/127) kick 53, snare 56,
hat 65, tom 89 (a tom is a loud drum); backbeat is the loudest thing (snare 110–114
at steps 4/12 vs ~46 elsewhere — that ratio IS ghosting); hits/bar median 20 SOLO —
in a band it's ~14 (30% of 48); toms 6.7% of groove hits vs 27.5% of fill hits (one
tom in a groove bar is normal, two is a fill); microtiming lean −0.05 sixteenth,
spread ~0.21 (pooled across performances — within one groove it is far tighter;
treat 0.21 as an upper bound, and decide the final feel BY TASTE [the first build's
open question]).

**Structure (Harmonix):** the form grammar and section-length distributions in
`corpus/build_grammar.py` — keep as-is.

**Mix (from records, coarse):** 60–250 Hz ≈ 25–35% of energy, 2–6 kHz ≈ 10–15%.
The first build never got below ~60% lows; treat the balance table as an output test.

## APPENDIX B — THE FIRST BUILD'S BUG CLASSES, AS A CHECKLIST

Before any merge, ask which of these you might be committing:

- [ ] A pass that edits another stage's output (Law 3 violation — the ghost class)
- [ ] A non-idempotent operation that can run twice (the 24× duck class)
- [ ] A fallback that substitutes different material (the amen-paste / "|| hat" class)
- [ ] Two implementations of one rule (the compRhythm / closeStack class)
- [ ] A draw inside a conditional (the stream-drift class)
- [ ] Wall-clock vs buffer-time / steps vs seconds confusion (the start(dur) class)
- [ ] A magic number with no provenance (the `0.85 tone knob` class)
- [ ] Divergent live/render behavior (the double-reverb export class)
- [ ] State that survives newSong (the stacked-reverb / stale-slice class)
- [ ] A comment asserting what code does instead of a measurement (the whole first build)

---

*Final word. The first build was not stupid — the laws were right, the corpus work
was right, the instinct to measure was right. It failed because correction was used
where ownership was needed, sound was built last, and the output was tested never.
Invert those three and the same ideas produce the program the user has been asking
for all along: simple things that are solid, parts that work together because they
were written together, and a render you press play on with confidence.*
