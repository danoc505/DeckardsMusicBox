# THE BACKLOG — everything this project has said needs doing

*Collected 2026-08-03 at the user's request: "let's build a doc that
collects everything we are saying needs to be done or should be done."
Until now these lived scattered through HANDOFF-MK2.md session entries and
the research files, which is where intentions go to be lost.*

**HOW TO READ THIS.** Every item says WHY it is open and WHAT would close
it. Nothing here is a wish: each one was found by measurement or named by
a source. Items are grouped by what they cost, not by when they appeared.

---

## 0. THE ONE THAT OUTRANKS EVERYTHING

> ### AND IT NOW INCLUDES SIX BUILDS FROM ONE DAY
>
> `2026-08-04` shipped **`04b` through `04g`** — the Wurlitzer's depth, the
> record surface and the kick duck, chord quality from 1170 jazz tunes, the
> bass leaving the root, the widened out-of-key law, and jungle's chords.
> Every one measured. **Not one heard.** Two genres moved (lofi and jungle);
> the other five are byte-identical throughout.
>
> That is this section's own warning happening again, in a single day, and the
> person who did it should say so rather than let the next reader discover it.
> **The brief for listening to them is `test/ears/LOG.md`.** The single
> question with the most riding on it is lofi's `qualities: 0.75` — how much
> jazz harmony the genre takes — because it is the biggest musical change of
> the six and it is one number.
>
> **`04h` is the seventh, and it is the one build here that does NOT need an
> ear** — the roll is a display and moves no note; 2100 seeds byte-identical.
> It does, however, make the six unheard builds *visible* for the first time,
> which is worth something to whoever finally sits down with them.
>
> **AND THEN `04i` AND `04j` MADE IT EIGHT, both on lofi and both loud.** `04i`
> gives the tune an electric piano instead of the house sawtooth — the biggest
> single change to this genre in weeks, and it moves no note. `04j` makes the
> tune stop between phrases and brings the hook inside the sourced note count;
> 300 songs moved, all lofi.
>
> **The open taste questions are listed in `test/ears/LOG.md`**, newest first,
> and every earlier build is inside the latest one — so playing the current
> artifact covers all of them at once.
>
> **⚠ AND THIS SECTION IS NOT A GATE. Corrected by the user, 2026-08-04:**
> *"What is a listening session? You can't hear. I can always open the artifact
> and press play, there's nothing needed for that to be done."* This section
> had been read as a stop sign — a researched, ready mechanism (jungle's bass)
> was written up and deliberately NOT built, waiting for a ceremony that does
> not exist. **§0 means don't stack unverified taste guesses on each other. It
> does not mean stop building what the research and the measurements already
> justify.** If the research is there and the mechanism is buildable, build it.

**THE EAR HAS NOT HEARD ALMOST ANY OF THE RECENT WORK.** The FDN room, the
whole stereo build, the matrix, the field, the stage, the flanger, the
DP/4, the snap — all measured, none listened to. This project's own
precedent (the sax: every metric green, the ear refused it) says
measurements prove a thing EXISTS and never that it sounds good. **Nothing
should be built on top of this stack until it has been played.**

---

## 1. DEFECTS AND GAPS FOUND BY MEASUREMENT

| what | why it is open | what closes it |
|---|---|---|
| **No check knows WHICH ROOM ran** | The FDN silently fell back to the convolver for a whole build and every probe still passed: a convolver is repeatable, and its IR length *is* its decay. `soundState().room` reports it for the LIVE graph only. | A render-side assertion — the room should be able to state which engine produced a buffer. |
| **Random Hall makes ringing WORSE** | Measured 25.3 → 31.3 dB peak-to-median on a time-averaged tail. Ships OFF (`space.random: 0` everywhere). | Either a better implementation (the unverified diagnosis: per-line decay gain is computed for the NOMINAL length, so a wandering tap detunes the network) or a better metric. Distrust the current metric until it disagrees with a fixed network in Lexicon's direction. |
| **⚠ THE COUNT IN THE ROW BELOW IS STALE: it is 18, not 15, and the shape changed** | Re-measured `2026-08-05e`: **313 passed, 18 failed**, and the SAME 18 checks on the commit before it (`13fecdc`, rendered in a separate worktree with the same seeds) — so none of them belong to the arrival rule. The one numeric difference in the whole list is `fill->chorus: reverb return present` reading side/mid 0.1998 against 0.1980, which is that excerpt's own notes having moved. **The shape is no longer the one described below**: 11 are `"reverb return present, at depth"`, **4 are `"presence above 2 kHz exists (band rig)"`**, 2 are `"both channels carry the mix"` and 1 is `"solo tape: reaches the reverb"`. The old row's peak-ordering failure is gone and the presence and tape ones are new. | **The drift happened somewhere in `04a`…`05d` and has NOT been attributed to a build** — saying which would be a guess, and the honest step is a bisect over those builds by whoever next touches the mix. `04i` (lofi's tune moved from a sawtooth to an electric piano) is the obvious first suspect for the `presence above 2 kHz` rows and is a suspect, not a finding. |
| **13 of them are ONE STALE CHECK** *(the diagnosis below still holds for the reverb-return rows)* | Re-measured 2026-08-03o: **316 passed, 15 failed**, and the same 15 to the last digit on the commit before it, so none of them belong to the barberpole. **13 are `"reverb return present, at depth"`** — side/mid above its ceiling (0.16–0.28 against 0.16). That ceiling is `max(0.16, wet) + gate allowance` and it was calibrated when **the reverb was the only thing in the program making side energy**. The stereo stage now pans the players, so a correct mix fails a check that predates it. The other two: `"the section marked peak is the loudest"` on seed 2 (−14.50 vs −13.99, half a dB) and `"both channels carry the mix"` (L/R +1.6 dB on two choruses — a stage that leans). | Re-derive the side/mid ceiling from what is actually panned rather than from `wet` alone. **Do not just raise the number**: the check's whole value is that it fails when the return disappears, and a ceiling chosen to make today's mix pass proves nothing. The earlier note in this row (8 failures, sub-runaway, kit-free prechorus) described a battery that has since changed shape; the numbers above replace it. |
| **The gated reverb is still a ConvolverNode** | Which is why genres with a gate sit at the ~-100 dB float floor instead of bit-exact. | Either move it into the room worklet or accept and document permanently. |
| **Section-keyed mix moves automating buses that are SILENT in that section** | Found 2026-08-03 preparing the listening session, measured with `harness/probe_section_motion.js` (drive the control end-to-end inside the very section its move is keyed to; the difference signal is what it could possibly change there). **lofi's "Tubby pair"** — `matrix.leadMix`/`leadEcho` at the outro, the "record ends by receding" move — is keyed to a section whose role list (`["keys","bass"]`) has never included the lead: **-95.8 dB** of possible change in the outro against **-5.6 dB** in a chorus. Its intro half acts on a single leaked pickup note. **jungle's bridge drum-drop** — `drumsMix` cut + `drumsEcho` rise, the engineer's dub move — is keyed to a bridge whose roles are `["bass","keys"]`: **-90.5 dB** there, **-6.4 dB** in a chorus. The arrangement removes the drums before the mixer's hand arrives, so the kit mutes instead of washing away into the echo. The comments describe the arrangement the writer imagined, not the one the roles table produces — and nothing compared the two (the polymeter shape, again). Role tables alone cannot adjudicate: plastikman's bridge plays only the ostinato and its keys bus is LIVE there at **-3 dB** (the ostinato rides the keys bus in that rig), so its `keysMix` bridge cut is real — while its bass bus reads **-88.9 dB** in the same bars, so its `bassEcho` bridge dip is not. | Per move, a decision on the record: either re-key the move to a section where its bus sounds, or put the role INTO the section so the mixer's move has something to act on (jungle's own research wants the second: the drums leaving *into the echo* needs drums written in the bridge and removed by the FADER, not by the arrangement). Both change what songs play → research the shape first, re-baseline deliberately, and let the user's ears rule (the listening session in `test/ears/LOG.md` already asks the lofi-ending and jungle-drop questions). A seam check comparing every section-keyed move against what its bus carries there would close the class; `probe_section_motion.js` is the measuring arm. |
| **`intro` bars = 4 undercount** | The target-length arithmetic treats a cold open as 0 bars and a normal intro as 4, which is not what the form actually produces. | Its own measured commit. |
| ~~**The program stutters, worst on acid and synthwave**~~ **FIXED `2026-08-05g`** | The user reported it; measured, the report was exact — synthwave ran at a p50 frame of 41 ms (24 fps) and acid 28 ms against lofi's 18. `knobEl`'s per-frame refresh wrote `val.textContent` for every one of ~169 knobs whether or not the value had changed; a text change dirties layout, and the layout was costly because the roll holds one element per note. Four other theories were measured and refuted first — see `harness/probe_stutter.js`. | CLOSED: write only what changed. **Every genre now sits at 17 ms (60 fps); acid 43 long tasks → 0, plastikman 6 → 0, synthwave 100 → 4.** STILL OPEN: synthwave keeps 4 long tasks a run, worst 155 ms, not yet attributed. |
| ~~**THE AUDIO GRAPH GROWS FOR THE WHOLE SONG AND IS NEVER FREED**~~ **FIXED `2026-08-06a`** | The user, 2026-08-05, corrected me twice and was right both times: *"it is a runaway fx ... that gets so large it bogs the program down to stuttering"*, and then *"Im not turning any knobs, it happens on its own."* MEASURED with `harness/probe_nodes.js` (new), acid, nobody touching anything: **825 connected audio nodes at 15 s, 3073 at 60 s, 6923 at 120 s, 10 975 at 180 s** — about sixty a second, in a straight line, never released. An acid record runs 6.3 minutes, so it ends with roughly **23 000 live nodes**, every one processed on every render block. lofi leaks at the same rate (3963 by 60 s) and is only spared because its record is 2¼ minutes long — which is exactly why the two genres the user named are the two longest and densest. **The LEVEL never runs away** (the same record measured flat at −10 to −12 dB rms for its whole length), so it is not a feedback loop; the graph itself gets too big for the audio thread. **Nothing in this repo could see it**: `probe_mainthread` reads a steady 17 ms throughout because this is the AUDIO thread, the level meter reads flat, and the seam checks and snapshot never build a graph at all. | `dispatch` sets `onended` on the nodes a voice RETURNS, which are its sources only (`V` is documented as returning "array of source nodes"). Everything the voice built downstream — Gain 2320, BiquadFilter 714, StereoPanner 316 in one lofi minute — stays connected to the bus with nothing to end it. The fix is a central teardown: record every node created during the `voice()` call and disconnect the whole chain once ALL of that note's sources have ended (several voices return more than one source, so a first-one-wins teardown would cut the others). **CLOSED.** `dispatch` records every node created while a voice is building and disconnects the lot once ALL of that note's sources have ended (several voices return more than one; a first-one-wins teardown would cut the others off mid-note). Two belts: it records only during the `voice()` call, and anything reachable from the graph object (`graph.__own`, set by `buildGraph`) is skipped. **MEASURED on the user's own seed — synthwave 10855: nodes still connected went 30 543 → ~1 200 over the same run, and STOP + NEW SONG now resets to 279 where it used to leave 30 387.** Verified for SOUND and not just for the count, which is the trap the reverted stop-fix fell into: probe_voices 0 threw / 0 silent, mk2_ui 34/34 including "pressing play makes a sound", renders repeatable on all seven, snapshot IDENTICAL, and **the rendered-audio battery the same 313/18 with the same 18 checks — no new failure and none accidentally fixed.** Guarded by a new mk2_ui check, driven to failure both ways: 10.9% of created nodes still connected with the fix, 68.8% without. |
| **STOP DOES NOT STOP THE EFFECTS, and with the FX open the limiter is fed +21 dB** — the user's own report, 2026-08-05: *"when it happens i hit stop and i hear an echo continue"* | `stopLive()` stops the note SOURCES and nothing else — it is four lines and none of them touch the delay line, the feedback gain or the sends. The live graph is built ONCE per audio context and reused for every song, so the residue outlives the stop, the next song and a change of genre (the meter beside `stopLive` was added for this very report and says so). MEASURED with every echo/flange/dp4/barber/matrix knob dragged to its top by hand — the state a user exploring the rack arrives at: the tail was still at **−32 dB twelve seconds after stop** and had only reached −79 dB at thirty. In the same state the level arriving at the limiter reached **rms +4.6 dB, peak +21.1 dB** — effect returns land on `post`, PAST the master soft-clipper (deliberately, and documented at `matrixDest`), so only the limiter catches them and it is being fed 21 dB of overshoot. A limiter driven that hard pumps, and pumping is what "stuttering" sounds like. **Neither number is reproduced on a song nobody has touched**: acid played flat at −12 dB rms for two minutes and fell to −91 dB two seconds after stop. | Drain the effects on stop. **AND THE OBVIOUS FIX IS WRONG — it was built, measured and reverted on 2026-08-05g:** ramping `echoSend`/`echoFb`/`send` and every `route` gain to zero on stop leaves SCHEDULED AUTOMATION on those params, and `setSpace` restores them by assigning `.value`, which an AudioParam **ignores once it has an automation timeline**. Playback went completely silent (−inf on every cycle) and stayed silent. Whoever picks this up: the tail check is not sufficient — **measure that it still makes a sound while PLAYING**, which is the check that caught this one. The right shape is probably a dedicated mute node in the master chain that nothing else automates, rather than reaching into params the bus rider owns. |
| **MIDI wall-clock flake** | `mk2_midi` fails "no tick drifts" under load; always green on rerun. Documented, never ignored. | Nothing, unless it starts failing when idle. |

## 2. METHODOLOGY — how this project measures

- **A render A/B without a same-build control measures its own noise.**
  Two separate mistakes this session were caught only by running that
  control. Past handoff entries argued from render A/Bs with no control;
  they are not thereby wrong, but they are unverified in that respect.
- **Anything that LISTS what the program contains will go stale.** Three
  times in one session: the seam scanner's read-detection, the probe's
  column names (twice). Derive it from the declaration instead.
- **TWO IDENTICAL NUMBERS ACROSS A REAL CHANGE ARE NOT A NULL RESULT, THEY
  ARE A BROKEN MEASUREMENT.** `2026-08-04l`: a before/after on jungle's bass
  read byte-identical on two builds whose ROLL had plainly changed. The cause
  was the argument order — `composeSong(seed, RIG, genre)`, and "jungle" is
  both a genre and a rig, so `composeSong(s,"jungle")` composed **lofi** on
  the jungle rig, twice. The roll already guarded this at its own front door;
  `makeChart` now throws on the ambiguous form too. **A null result that is
  too clean to be true is the measurement confessing.**
- **Run `probe_wiring` after adding anything.** A capability one genre uses
  is a capability that has not been understood yet.

## 3. THINGS BUILT BUT BARELY CONNECTED

Measured by `probe_wiring`, 2026-08-03:

- ~~**flanger, DP/4, snap — one genre each**~~ **DONE `2026-08-04q`** — and
  **the "one genre each" figure was partly a probe artifact.** `probe_wiring`
  decided a column was reached by checking its declared BASE, so synthwave's
  flanger — `leadFlange`/`echoFlange` ridden from a zero base, shut in the
  verse and opened through the chorus — was invisible to it for two builds.
  The probe counts motion-reached columns now and marks them `rid`, so the two
  ways of arriving stay distinguishable. **Flange 1 → 3, DP/4 1 → 2, cuts
  1 → 2.** Jungle took all three on its own sources: "flanger and phaser
  effects were used on Amen breaks" and a rack of Alesis/Zoom/Boss multi-FX
  [corpus:dogsonacid], and its form research is a DJ architecture whose drop is
  a rectangle, which is what `snap` is. **`probe_matrix` caught a
  knob-that-does-nothing on the way**: the DP/4's four unit RETURNS default to
  0, so feeding it is not enough — jungle opens PHASE and CRUSH, both named by
  its sources, and leaves DRIVE and ROTARY shut.
- **The barberpole is on two** (synthwave, plastikman) — better than one and
  still thin. `barberpole.md` §6 gives the test for a third: the DAFx paper
  only claims the illusion works "at slow modulation speeds and for input
  signals with a rich frequency spectrum", so it belongs on a genre with a
  sustained wash, not on a sparse one.
- **acid and jungle have no panning at all** — their draws land on machines
  with no `pan` control. Either give those machines the stereo stage or
  accept it as their character, in writing.
- **`stage` on two genres** (lofi, synthwave). Five to go, and it is the
  cheapest way to make the field mean something on every record.

## 4. GENRE WORK NAMED AND NOT DONE

- **Form plans for dkc, acid, plastikman.** Four genres have one; these
  three still walk planlessly. Plastikman has the strongest sources
  (Hawtin's "year of subtraction"; *Consumed*'s single-take arc).
- **The `snap` for jungle and synthwave** — see §3.
- **One coincidental dkc↔bladerunner twin** in probe_form; expected to
  vanish when those genres get plans.
- **Pickups realise 8.2% against the corpus's 26%** — `fits()` blocks some;
  a taste dial, [EAR].

## 5. SOUND WORK NAMED AND NOT DONE

- **The other two Hawtin units are UNRESEARCHED**: Roland SRV-330
  "Dimensional Space" and the ART Multiverb (gated reverb on claps — we
  have a gated verb, never compared). See `fx-units.md`, which says
  plainly not to build from the guesses written there.
- **Three things the barberpole's sources describe and we did not build**,
  listed with their reasons in `barberpole.md` §5: Whirl's **stereo phase
  offset between channels** (ours offsets between NOTCHES — this is the one
  worth doing, now that the program is stereo), its **through-zero direction
  change** (inert here: direction is per song, so nothing changes
  mid-sweep), and its **negative feedback** (a feedback path around the
  cascade closes a cycle, and a cycle has already been measured to cost the
  renderer its repeatability).
- **Cross-modulation for plastikman.** *Consumed* is "an album of feedback,
  everything cross-modulating everything else". The grid cannot do it —
  a cycle costs repeatability — so it belongs inside worklet arithmetic.
- **A matrix-fed room (FDN with an orthogonal feedback matrix)** — stability
  becomes structural rather than swept. Design in `matrix-mixer.md` §7.
- **Stem columns** — the professional "mix of mixes" pattern; the program
  already renders stems.
- **Rubato.** No mechanism exists for free tempo inside a section; groove
  jitter is not it. Named in `bladerunner-form.md`.
- **Harmony and chromaticism**, including two-chord stasis. Named in the
  same place.
- **The sax is PARKED.** Terms for un-parking are in the handoff's warning
  block: real multisamples or a waveguide, ear-gated on one exposed note
  BEFORE any system is built around the tone.

## 6. MUSIC THEORY — the engine, what it has and what it lacks

*Added 2026-08-03 at the user's direction: "improving the music theory engine
… counterpoint, better wider chords … a list of music theory we are missing
and need and what we have that needs improving." Every line below was verified
against the code or measured this session — line numbers are `Deckards
Orchestrator MK2.html`. Research: `docs/genre-research/lofi-harmony.md`,
`docs/genre-research/counterpoint.md`. Measurement:
`harness/probe_counterpoint.js` (new), plus `probe_theory`, `probe_comp`,
`probe_harmony_neo` re-run at this commit.*

**The one-line summary: the vertical vocabulary stops at a seventh, the
horizontal vocabulary does not exist, and six of seven genres are locked
diatonic.**

### 6.1 THE CHORD VOCABULARY STOPS AT FOUR NOTES — the root cause

`chordTones` (line 841) is the whole of chord construction:

```js
function chordTones(root, mode, d, seventh){
  const n = seventh ? 4 : 3, out = [];
  for(let i = 0; i < n; i++) out.push(degMidi(root, mode, d + 2 * i));
  return out;
}
```

| what | why it is open | what closes it |
|---|---|---|
| ~~**9ths, 11ths and 13ths are unreachable by any code path**~~ **DONE `2026-08-04a`; the code block above this row is STALE and describes a builder that no longer exists.** `chordTones` takes a size of 3 to 7 and a boolean is still accepted, so the six tables that ask the old way cost nothing. | `n` is 3 or 4 and nothing else. There is no extension parameter, no `add9`, no `sus`, no alteration. Two call sites only (13690, 15838). **This is the single highest-value item in this section** — `lofi-harmony.md` §2 finds NOT ONE plain triad across thirteen sourced lofi progressions (maj9, maj13, min11, min9, 7#5, 7b9, dim7, m7b5), and a genre whose chords sit unchanged for two bars needs each chord to be worth sitting on. | An extension/alteration dimension on the chord, declarable per genre, that `chordTones` reads. Constraints not values (Principle 1): a genre declares which extensions it may reach for, the draw decides. |
| ~~**Chord QUALITY is never named — it is implied by mode + degree**~~ **DONE `2026-08-04d`** | There was no `quality` field anywhere in the composer, so a genre could not ask for a dominant IV — which `lofi-harmony.md` §4 identifies as *the* discriminator between the two minor modes lofi lives between. | CLOSED: a chord can be told what kind it is, and that decides its first four notes; anything above a seventh still comes from the mode, so extensions stay diatonic and a modal genre keeps its colour. The kinds and their likelihood per step are MEASURED from 1170 jazz tunes (`CHORD_QUALITY`, generated by `corpus/ingest_chord_quality.py`), not asserted. A genre declares `qualities` 0..1 — its appetite for the table — and the draw runs either way, so six genres are byte-identical across 300 seeds each. lofi asks 0.75. **And it produced the discriminator by itself**: seed 1 went `C#m7 F#m7 C#m7 G#m7` → `C#m7 F#7 C#m7 G#m7`, a dominant fourth, from a corpus that has never heard of the genre. Research: `docs/genre-research/chord-quality.md`. |
| **A melody drawn from the scale can now clash with a chord note that is not in it** | New, and caused by the row above. A chord can hold a note the scale does not, but the tune is still drawn from the scale, so the two can sound a semitone apart. MEASURED, lofi: **16.2% → 18.7%** of lead and counter notes sit a semitone from a chord note in the same bar. For scale, the six genres with no chromatic chords at all sit between 13.6% and 19.9%, so lofi is still inside the band it was in — but it went up, and it went up for this reason. | The fix is not to the chord, it is to the tune: `buildTheme` should know the chord's chromatic notes are available to it, the way a player does when a borrowed chord arrives. Until then the dial is `qualities`. |
| **`sevenths` is a per-genre BOOLEAN, and 6 of 7 say false** | lofi `true` (8618); synthwave, dkc, bladerunner, acid, jungle, plastikman all `false`. **DKC's own comment (10109) says "Wise's harmony is add9 and sus, not stacked sevenths" — a genre asking in writing for something the engine cannot build, and getting plain triads instead.** | Falls out of the two rows above. |
| **`triadTones`' dominant flag is dead** | `tri.dom` is set by NOTHING (`grep "dom:"` → no producer), so `!!tri.dom` at 13707 is permanently false. The comment at 895 says this flag "is what makes a secondary dominant pull." There are no secondary dominants. | Either wire it or delete it. A flag nothing sets is this file's cardinal sin with a comment on top. |

### 6.2 WIDER CHORDS — measured, and the target is sourced twice

| what | why it is open | what closes it |
|---|---|---|
| ~~**The comp spans 14.0 semitones on lofi; the target is 24+**~~ **DECIDED `2026-08-04k`, and the premise was half wrong** — `docs/genre-research/comp-register.md` | The register decision is made and written down: downward the walls stand (bass owns the bottom, low interval limit); upward the band is the comp's HOME and a genre may declare `registers.keysUp` reach for open voicings (lofi: 12; six genres byte-identical, 195/2100 snapshot lines all lofi, re-baselined `bcd4e05a9f76a4f5`). **Building it falsified the old row's diagnosis**: the ceiling never bound the span — an A/B showed open voicings already at 19.3 mean / 23 max beneath it. The wall is interval arithmetic: no octave rearrangement of a four-voice chord passes 23. And the sourced target is already met by the ENSEMBLE: every source's two-octave spread includes the root, the bass plays it here, and bass+comp sounding together measure **26.5 mean / p50 28 / ≥24 in 73% of moments**. What shipped: lifted shapes, the left hand's octave double, a duplicate-pitch guard. Net: sounding span 14.0 → 15.4, comp-over-tune 14.6% → 17.1%. | STILL OPEN, for the ear, with numbers attached: (1) the TALL COMP — anchoring at the granted room's centre reaches 24+ spans in 24% of open voicings and costs 49.8% comp-over-tune (3.4× before); refused as the default per the sax precedent. (2) the EXTENSION RATE — five-tone chords reach 26-span under the tune; a harmony dial, not to be moved before the 04-stack is heard. |
| **`isOpen` is a BINARY, so a 13-semitone spread and a 30-semitone spread score identically** | 14584: `(cand[cand.length-1] - cand[0]) > 12`. The cost function can prefer "open" but cannot prefer "wider" — there is no gradient to climb even if the band allowed it. | A continuous spread term in the cost. Cheap, and a prerequisite for the row above doing anything. |
| **Drop-2 exists; drop-2-&-4 does not** | 14591–14594 generates one drop-2 per inversion. `lofi-harmony.md` §5 names drop-2-&-4 as the voicing that "spans nearly two octaves" — i.e. the actual mechanism for the target above. | Add it to the candidate generator. One loop. |
| **Rootless voicings are not built, and this program is the ideal case for them** | The sources' rationale is that a separate bass plays the root [corpus:pianowithjonny] — which is exactly this architecture. Rootless is also what MAKES ROOM for a 9th without a sixth voice. Pryn, voicing Cmin9 as C–B–D–G: "remove the fifth altogether because it is not essential to the harmony." | Depends on §6.1. |
| **Voices are paired by SORTED INDEX in the voice-leading cost** | 14644: `for(let i = 0; i < Math.min(cand.length, prev.length); i++)`. A 4-note chord following a 3-note one silently drops a voice from the comparison, and the extra voice contributes only through the `×2` top-line term. Latent today because chord size is constant within a song; **it goes live the moment §6.1 lands** and chords vary in size. | Fix before, not after, extensions land. |

### 6.3 COUNTERPOINT — the horizontal rules do not exist

**Verified: `grep -i "parallel fifth\|parallel octave\|perfect fifth\|voice cross\|similar motion\|oblique"` over the whole HTML returns ZERO hits — in code AND in comments.**

| what | why it is open | what closes it |
|---|---|---|
| **⚠ AND THE ROW BELOW IS NOW PARTLY FALSE — re-measured per PAIR `2026-08-05`** | `probe_counterpoint` could only report one average per genre, which "hides the finding" (§6.6). It reports per pair now, and the claim that *every genre's worst pair involves the bass* no longer holds: the worst RATIO in the file is **keys↔keys2**, the two keyboards shadowing each other — bladerunner 8.9% against a 0.9% floor, lofi 4.2% against 1.1% — on both of the only two genres that have a second keyboard, and no row anywhere had ever named it. lofi's bass pairs are at or near chance since `04e`; acid, plastikman and jungle are at or BELOW chance. | **DONE `2026-08-05f` for the keyboards** — a cost in `buildKeys` against the other keyboard's top voice, `docs/genre-research/the-second-keyboard.md`. Material bar-to-bar: bladerunner 13.0% → 9.1%, lofi 3.5% → 1.2%; 19 of 2100 songs moved. **STILL OPEN and honestly so: the PERFORMANCE figure barely moved (8.9% → 8.1%) and §7 of that sheet says what has been ruled out and what has not.** The bass pairs that remain (dkc 10.3%, bladerunner 10.1%) belong to those genres' *declared* pedal and drone and are a taste question with an owner. |
| **THE PARALLELS ARE BETWEEN THE CHORDS AND THE BASS, not between the two melodies** — measured `2026-08-04` against Bach | 382 chorales with their four voices still lined up in time run **0.127%** parallel fifths and octaves. Broken out by pair, 30 seeds a genre: **lofi keys/bass 8.97%**, synthwave keys/bass 19.06%, dkc lead/bass 22.95%, bladerunner bass/ostinato 15.89%, acid keys/bass 7.97%. **Every genre's worst pair involves the bass**, and in five of them it is the chords against it. The shipped probe's single per-genre average hides this completely. | One cost term in `buildKeys`, which already scores voice-leading between successive voicings and has never been shown the bass — and the bass is built first in `makeMaterials`, so it is there to pass in. **A counter-versus-lead version of this was built and REVERTED**: it moved lofi 2.03% → 2.70% on 3 events, because it was aimed at the pair that was not the problem. `docs/genre-research/counterpoint-measured.md` §5. |
| ~~**A dissonance is constrained on the way out and not on the way in**~~ **DONE `2026-08-05e`** | Bach approaches a clash by step **96.8%** and leaves one by step **91.3%** — fractionally stricter arriving than departing, and this program had a law for the departure and nothing for the arrival. | CLOSED. `docs/genre-research/the-arrival-of-a-dissonance.md`. Of the eight figures in the taxonomy, seven are approached by step or repetition and only the appoggiatura leaps in, on the condition that it steps out [three sources]. So: a dissonance may be leapt onto only when something follows closely enough to resolve it. A NARROWING in the tune, a COST in the counter. **Arrivals by leap 16.5% → 14.3%, by step 67.7% → 70.0%; on the population the law governs, 9.5% → 4.8%.** 636/2100 seeds, form and arrangement identical on every one. STILL OPEN, in §7 of that sheet: the phrase's FIRST note has no arrival (`hang` resets at the join), and the ear has heard none of it. |
| **Contrary motion is one flat number where the measurement gives six** | Bach's outer pair (soprano/bass) moves contrary **32.9%** of the time and his inner pair (soprano/alto) **14.0%** — every pair involving the bass sits at 28–33%, the two inner pairs at 14%. Ours is a fixed +100 scored against the lead only. | Grade it by which two parts. |
| **Oblique motion is the majority relationship and we have no notion of it** | **51.7%** of Bach's moments are one voice holding while another moves — more than contrary, similar and parallel combined. Nothing in this program thinks about it. | Measure ours first; there is no target until then. |
| **Nothing measures or constrains the interval between two parts** | The only cross-part constraint in the composer is a `reserved` set banning two parts from the same absolute pitch at the same instant — the degenerate case of a parallel unison — plus the counter's contrary-motion preference. `probe_theory` already half-recognises the issue from the other end, measuring "unisons" and calling one "a part disappearing rather than a chord" (lofi 8.8%). | `harness/probe_counterpoint.js` now measures it. The mechanism should follow the research's sorting (`counterpoint.md` §2): parallel perfects are PERCEPTION (fusion) and belong in stage 3 for every genre — **but only where `counter.style === "line"`**, because `"double"` is deliberate parallel octaves and the tables already say which is which. |
| **MEASURED at this commit (30 seeds a genre), parallel perfect vs a seeded-shuffle floor** | lofi 1.7% (chance 1.4), synthwave 6.0% (1.7 — the deliberate double), dkc 1.6% (1.1), bladerunner 2.6% (1.8), acid 1.3% (1.0), plastikman 0.7% (1.2), **jungle 24.5% (0.7)**. **CAVEAT, and it matters: the shuffle floor destroys the harmonic relationship between parts, so two lines that both correctly track the same chord changes will sit far above it without that being a defect.** The floor answers "more than random", NOT "wrong". | Do not treat the ratio as a defect count. The honest reading is that only jungle is a clear outlier, and §6.5 says what it actually is. |
| **The counter's contrary-motion rule is measured against the LEAD only, and is a flat +100** | 15514–15520. The comp's top voice — which `buildKeys` itself weights ×2 because "it is the line the ear follows" — is never consulted, so the counter can move in lockstep with the part the ear is actually tracking and pay nothing. And a flat penalty cannot separate similar-but-not-parallel from strictly parallel, which is exactly the distinction the sources draw. | Score against the comp's top voice as well, and grade the penalty by motion type. |
| **Leap-then-step is not built** | The non-chord-tone law narrows the note after a *dissonance* to one scale step, but nothing reads the previous interval for the plain melodic case: after a leap, prefer to step back, and "do not write more than one skip in the same direction" [corpus:hellomusictheory]. | A cost term in `buildTheme`'s candidate walk. |
| **Voice spacing is unconstrained** | No rule keeps adjacent voices within a tenth. | A cost, never a law — lofi's counter band `[57,74]` sits INSIDE its keys band `[52,74]`, so a hard rule is unsatisfiable by construction. |
| **Voice crossing: DO NOT ADD A BAN** | Recorded here so nobody "fixes" it. It is architectural — the code says so at 15594, *"The counter does not sit ABOVE the comp, it sits INSIDE it"* — and the sources agree that without crossing "no real polyphony is possible" [corpus:ars-nova, quoting Jeppesen]. | Nothing. This is a decision, written down. |

### 6.4 CHROMATICISM — built, drawn by almost nobody

| what | why it is open | what closes it |
|---|---|---|
| **Only ONE genre in the file declares a `harmony` block** | `bladerunner`, line 10446: `harmony: { style: "plr", chance: 0.30 }`. Everything else is 100% diatonic by construction. Measured (`probe_harmony_neo`, 60 seeds): bladerunner 10.4% chromatic chords, **every other genre exactly 0.0%**. | Genre-by-genre research before any table entry — `lofi-harmony.md` §4 already supplies lofi's case (the borrowed dominant IV, "a borrowed chord from another key" [corpus:richardpryn]) and it is the natural second genre. |
| **The measured chord table covers major and minor only; five of this program's seven modes have none** | `CHORD_QUALITY` is keyed by major and minor because the corpus is. Dorian, phrygian, lydian, mixolydian and harmonic minor get no quality drawn at all — deliberately, since sending dorian to the minor table would delete its signature chord (`chord-quality.md` §5, §7). But it means lofi's dorian songs get none of the `2026-08-04d` work. | A corpus in those modes, or a genre-declared table written from that genre's own research. Not a guess: the dorian case is exactly where a guess would do damage. |
| **`coltraneCycle` is correct, wired, and unreachable** | Defined 887, called at 13715 under `H.style === "coltrane"`. **No genre declares that style** — `grep "coltrane"` finds only the branch itself. Still true after being flagged in HANDOFF §5.5 for several sessions. | Draw it somewhere with a documented reason, or delete it. The file's own rule, quoted at 13434: do not claim a thing works until something draws it. |
| **The neo path collapses a mode to one bit** | 13718: `min: MODES[mode][2] === 3`. A mode entering the P/L/R path becomes major-or-minor and its character is gone. | Fine for triads; revisit with §6.1. |

### 6.5 SCOPE GAPS in the laws that DO exist

| what | why it is open | what closes it |
|---|---|---|
| **The non-chord-tone law covers `lead` and `counter` only** | `bass`, `keys` and `ostinato` are never checked. A comp inner voice or a bass note may leap away from a dissonance freely. Whether it *should* be constrained is a real question — a bassline is not a melody — but it is currently unasked, not decided. | Decide per role, in writing. |
| **"Resolves by step" is hardcoded as ≤2 semitones** | So harmonic minor's degree 6→7 (an augmented second, 3 semitones) is a genuine scale step that the law refuses as a resolution. Latent — no genre draws `harmMinor` today. | Ask the MODE what a step is, rather than assuming a tone. |
| **`harmMinor` is defined in `MODES` (830) and drawn by NO genre** | Dead vocabulary in the theory block itself. | Draw it or drop it. |
| **`intoBand` assumes a band ≥12 semitones wide and never checks** | 912. The comment says "band width >= 12 assumed"; nothing enforces it, and a narrower band would oscillate. | A guard, or a stated invariant with a seam check. |
| **jungle has only TWO pitched parts and they shadow each other** | Measured: its only pair is bass↔keys; **69.9% of their vertical intervals are perfect (unison/octave/fifth) and 0.0% are dissonant**, with 24.5% parallel-perfect motion. `counter: null` is deliberate and defended, but the result is a genre whose entire harmony is two lines mostly a fifth or an octave apart. | A genre-identity question, not a bug. Jungle's harmony has never been researched (only its form has — `jungle-form.md`). |
| **synthwave's octave double flips octave on 13.1% of notes** | Measured: `octaves: [-12, 12]`, 86.9% at −12 and 13.1% at +12, because it takes whichever fits the band unreserved. Each flip is a two-octave leap in the counter against a stepping lead. | An EAR question, recorded not judged. If it is wrong, the fix is to prefer the previous offset. |
| **lofi's register comment is false** | 8636 claims the bands "overlap only at the edges — a countermelody that never crosses the comp is not one." Declared: counter `[57,74]`, keys `[52,74]` — the counter is a strict SUBSET. The code at 15594 states the truth. | Correct the comment next time the file is touched. |

### 6.6 THE MEASUREMENT SIDE — what the probes cannot see

| what | why it is open | what closes it |
|---|---|---|
| **`probe_theory` hand-copies a MODES table that has drifted from the engine's** | Its table (line 40) is MISSING `harmMinor` and ADDS `locrian` and `aeolian`, neither of which the engine has. A `harmMinor` song would fall through `MODES[mode] \|\| MODES.minor` and be silently measured against natural minor. **Latent — no genre draws harmMinor, so nothing is misreported today.** But this is the "anything that LISTS what the program contains will go stale" defect for the fifth time. | Export `MK2.MODES` and derive. |
| **`probe_comp` measures texture, not harmony** | Six numbers: simultaneity, onsets/bar, voices/onset, inner movement, bar repeat, span. **No chord identity, no inversion distribution, no voice-leading distance between successive voicings, no check that the voicing is even the chord.** It is a texture probe wearing a voicing name. | Add the harmonic half — it is the natural place to verify §6.1 and §6.2 once they land. |
| **`probe_harmony_neo` reads the abstract chart, never the played pitches** | It reads `song.materials.chords`, so it says nothing about what is actually voiced and heard. Its voice-leading number is a SET distance (line 35), order-free, and therefore cannot detect voice crossing or parallel motion by construction. | Point a version of it at `materials.*.keys`. |
| **`mk2_ui.js` IS FLAKY — about one run in five reports 25/26 and the next run is clean** | Seen twice on 2026-08-04, on two unrelated commits, and on both occasions every re-run passed (3 clean runs each time). The failing check does not identify itself in the summary line, so which one it is has not been established. **It is a browser-timing flake, not a defect in the program — but it is exactly the kind of thing that gets waved through as "just flaky" until the day it is real.** | Capture the failing check's name on failure and print it. Until then, a red 25/26 from this probe must be re-run and BOTH results reported, never just the green one. |
| **`mk2_roll.js` SILENTLY COMPOSES THE WRONG GENRE if you pass a bare name** | `node harness/mk2_roll.js 1 acid` composes **lofi**. The genre is a named flag, `--genre`, and a positional argument that is not a rig name is simply ignored. This produced a false "all seven genres are identical" claim on 2026-08-04 from seven runs of the same genre; the conclusion happened to be right and the evidence was worthless. Now a rule in README and HANDOFF §0. | Make it THROW on an unrecognised bare argument rather than ignore it. A tool that quietly answers a different question than the one asked is worse than one that fails. |
| ~~**`probe_counterpoint` reports one number per genre and that average hides the finding**~~ **DONE `2026-08-05`** | Its headline was parallel-perfects averaged over every pair of parts, and **a fix was built for the wrong pair because of it.** | CLOSED: every pair with ≥100 shared steps, ranked worst first, each against ITS OWN shuffle floor (a slow pair and a busy pair do not have the same chance rate). The deliberate octave double is MARKED rather than filtered. It immediately falsified §6.3's headline claim — see the row there. Remaining limit, unchanged and stated in the probe's header: each role is reduced to its top note, so a parallel fifth buried among a comp's inner voices is still invisible. |
| **`probe_theory` hand-copies a MODES table** — *`MK2.MODES` is exported as of `2026-08-04d`, so this is now a one-line fix* | (see the row below; the blocker is gone) | Derive from `MK2.MODES`. |
| **`probe_counterpoint`'s floor control is generous, and its top-voice reduction hides inner voices** | Both stated in the file's own header. The shuffle floor breaks the chord relationship (see §6.3), and reducing each role to its top note means a parallel fifth buried inside a comp voicing is invisible. | A better floor would shuffle whole chord-aligned bars rather than individual pitches. Inner voices need the pair enumeration to run over voicing members, not roles. |

### 6.7 THE GROUNDING GAP — measured harmony exists in this repo and MK2 cannot see it

**`JAZZ_CORPUS`, `BACH_CORPUS`, `IMPROV_DIMENSIONS`, `FOLK_CORPUS` appear ZERO
times in `Deckards Orchestrator MK2.html`.** `corpus/` holds working ingesters
for all of them, and they target MK1:

- **`ingest_jazz.py`** — the **Jazz Harmony Treebank**, 1170 standards' chord
  changes (EPFL DCMLab), already converted to a relative `{degree, quality}`
  encoding with frequency weights. **Lofi's harmony is jazz harmony slowed
  down**, so this is the right instrument for exactly the question §6.1 asks,
  and it would replace most of `lofi-harmony.md`'s tutorial-grade sourcing with
  measured structure — the top of this project's own grounding ladder.
- **`ingest_bach.py`** — 382 chorales as four independent voices. That is a
  measured corpus of *counterpoint*, which is §6.3's whole subject.
- **`harvest_accompaniment.py`** — POP909, what an accompaniment actually plays.

**PARTLY DONE `2026-08-04d` — the jazz harmony is in, and re-derived rather than
reused.** `corpus/ingest_chord_quality.py` reads `treebank.json` from source and
fixes three faults in `ingest_jazz.py` that made the MK1 table untrustworthy: it
read flat keys a semitone sharp (445 of 1170 tunes), it could not see a
half-diminished chord at all, and it folded every chromatic chord onto the
nearest scale step. **The chorales and the ensemble data are still not in, and
they are the two that matter for §6.3 and for the arrangement.**

**This outranks every other item in §6.** Every chord-quality weight and every
counterpoint rate this section proposes is currently `[EAR]` or sourced from
production tutorials; the treebank and the chorales would make them measured.
What closes it: port one ingester to MK2's tables and re-derive. Start with
jazz — it is the one whose subject matter matches a shipped genre.

### 6.8 THE BASS PLAYS THE ROOT AND ALMOST NOTHING ELSE — and it has never been researched

*Measured 2026-08-04, 30 seeds a genre. Found while failing to fix §6.3's
parallel fifths from the other end: no amount of re-voicing the chords can undo
a lockstep the bass is enforcing.*

```
  genre         notes    the root   the fifth   anything else   repeats its own note
  lofi            744      74.7%       16.9%            5.6%             30.9%
  synthwave      2767      90.7%        9.3%            0.0%             42.3%
  dkc             664     100.0%        0.0%            0.0%              0.0%
  bladerunner     290     100.0%        0.0%            0.0%              0.0%
  acid           3988      61.7%        7.3%           24.7%             44.9%
  plastikman     1608      79.1%        1.0%           19.9%             62.8%
  jungle          128     100.0%        0.0%            0.0%              0.0%

  distinct notes in a bar:  lofi 1 note in 61% of bars · dkc, bladerunner and
  jungle 1 note in 100% of bars
```

| what | why it is open | what closes it |
|---|---|---|
| ~~**THE BASS HAS NEVER BEEN RESEARCHED FOR ANY GENRE**~~ **LOFI DONE `2026-08-04e`; the other five still open** | `docs/genre-research/bass.md`. The note CHOICE turned out defensible — root and fifth is a sourced lofi habit — and the MOTION was the fault: the bass's off-downbeat choices were `root`, `fifth` or `rest` and nothing else, so those were a ceiling rather than a habit. Now a genre table (`bassTones`) that can also name the third, the seventh and a passing step. Measured on lofi: bars holding one pitch **61% → 42%**, step motion **28.8% → 38.6%**, the third **2.7% → 10.3%**, repeats-its-own-note **30.9% → 14.2%**. Six genres byte-identical. **And it cut the parallel fifths the chord side could not touch: lofi keys/bass 8.97% → 5.56%.** | STILL OPEN for jungle, acid and plastikman (no research at all) and synthwave (tutorial sources only). dkc and bladerunner are done and correct — a declared pedal and a declared drone. |
| ~~**The chromatic approach note is blocked by a seam check**~~ **DONE `2026-08-04f` — the law was widened, and the widening is a constraint** | The most characteristic move in the walking rules is a half-step above or below the NEXT chord's root. That note belongs to the chord arriving, not the one sounding, and the law only ever asked about the chord underneath. | CLOSED. **Every non-chord tone in the classical taxonomy is defined by MOTION, not by what it sits over** — passing, neighbour, appoggiatura, escape tone and anticipation, four sources, and not one of them mentions the chord below. So the law asks two questions now and both are strict: the chord under it contains it, OR it resolves by a step or less into a tone of the chord that follows. Clause two is an OBLIGATION — the very next note in that part must itself be a chord tone within a step — so a stray note cannot acquire one. **The widened law alone moved nothing across 2100 seeds**, which is the right shape for a law, and then it immediately caught a real bug: `intoBand` folds a pitch back by octaves, so a semitone below a low root returned an octave and a semitone from its target. That note is now DROPPED, not moved. `docs/genre-research/the-note-that-does-not-belong.md` | The most characteristic move in the walking rules is a half-step above or below the NEXT chord's root, on the last beat. That note belongs to the chord that is arriving, not the one sounding — and the law says a note outside the key must be in *the chord under it*, so it throws. The existing walk takes a SCALE step for exactly this reason. | Widening that law to know about the chord that is arriving. A real decision about the law, not a tweak — which is why it was not done quietly. |
| ~~**THE BASS HAS NEVER BEEN RESEARCHED**~~ *(superseded row, kept for the measurement)* | `lofi-production.md` §9 says it outright — "nothing on how the bass is written beyond 'smooth and simple'". Every bass number in the program is a guess or an inference from the drums. **This is the same shape of hole the chords had before `2026-08-04d`**, and the chords turned out to be 20 dB — figuratively — off once measured. | Research per genre, named sources, before any table moves. Start with lofi: it is jazz-descended, where a bass genuinely walks, and it is the genre being listened to. |
| **It is the cause of §6.3's parallel fifths, and the chord side cannot fix it** | If the bass always plays the root, then when the chord changes the bass moves by exactly the interval the chord moved, so any gap between them survives — a parallel by construction. Proved by failing: a cost on the chords' top line against the bass was built, and raising its weight FOUR TIMES moved nothing. `counterpoint-measured.md` §5b. | Give the bass somewhere else to be: approach notes, passing notes, a walk into the next chord, the third or the fifth under a chord it does not need to spell. |
| **`harvest_bass.py` measures 17,256 real arrangements and MK2 has never seen a number from it** | Written for MK1, like the chorales and the ensemble data. §6.7 is the same story one instrument over. | Port it, the way `ingest_chord_quality.py` was ported — and check its parsing against the source first, because the last MK1 ingester that was trusted had three bugs. |
| **jungle's HARMONY is fixed; its BASS is not** — `2026-08-04g` | Its harmony had never been researched, and that turned out to be half wrong: `jungle.md` researched it in July and the table never received it. The sheet says the genre has "two harmonic worlds", the drone and "THE JAZZ-MINOR VAMP… airy pads, jazz-inflected chords", and the table said `sevenths: false`. Confirmed independently — "lush minor chords, jazz extensions (9ths/11ths/13ths)" [corpus:melodigging]. Fixed: **dissonant intervals 0.0% → 13.5%**, pitched moments 374 → 801, and seed 1 went from three identical triads to a i–iv vamp with sevenths. | STILL OPEN: the bass. Parallel fifths only fell 21.7% → 19.2% because the bass is still 100% root, one note a bar, so it and the chords still move together at every change. `jungle-harmony.md` §5: the sources give "roots, octaves, fourths/fifths" and pentatonic and nothing more, which is not enough to write a bassline from. **Do not guess it.** |
| ~~**jungle plays the root, one note a bar, 100% of the time, and nothing defends it**~~ **DONE `2026-08-04l`** | Researched (`docs/genre-research/jungle-bass.md`) and built in consecutive commits. The cause was that jungle wore `bassStyle: "drone"` — restrikes only on a chord change, under a harmony that mostly does not: 99.8% of bars held ONE pitch. Now `bassStyle: "riff"`, a cell drawn once and repeated over the declared two bars, position deciding the pool (anchor root/3rd/5th on strong sixteenths, spice 2nd/4th/7th elsewhere), rank-selected rests, slide through `acidize` as every style gets it. | CLOSED. **Matched A/B, `probe_counterpoint` 20 seeds, jungle's row only: parallel perfect keys/bass 19.2% → 0.8% against a 1.1% chance floor; contrary motion 30.2% → 40.7%. Bars holding one pitch 99.8% → 14.4%, distinct pitches a bar 1.00 → 2.35.** Every other genre identical to the digit; snapshot 300/300 jungle and nothing else. **This is §6.8's "the chord side cannot fix it" row answered from the bass side.** STILL OPEN: every count in `bassRiff` is `[EAR]` (no source gives one), and whether the riff should transpose with the chord is undecided by the sources — it follows the acid builder's precedent, recorded not proven. |

## 6a. THE LOOP REPEATS AND ALMOST NOTHING CHANGES — ~~open~~ **LARGELY FIXED `2026-08-04a`**

*The user, 2026-08-03, on lofi seed 1: "it feels like we are repeating the same
loop with no changes after three passes — that violates the rule of three."
Measured after: they are right, and the numbers are worse than the complaint.*

**HOW MUCH THE SAME IT IS.** Comparing the notes of each statement of a section
against the FIRST time you heard that section (100% = note for note identical,
on the beat grid, 20 seeds a genre):

```
  lofi         2nd chorus 97%   3rd chorus 95%   2nd verse 97%   3rd verse 92%
  synthwave    2nd chorus 99%   3rd chorus 98%   4th chorus 99%  2nd verse 99%
  dkc          2nd chorus 98%   3rd chorus 96%   4th chorus 96%
  bladerunner  2nd chorus 99%   3rd chorus 99%   2nd verse 99%
  acid         2nd chorus 100%  3rd chorus 100%  4th chorus 100%   <- identical, always
  plastikman   2nd verse 87%    3rd verse 79%    4th verse 77%     <- the only genre that varies
  jungle       2nd chorus 96%   3rd chorus 96%   3rd verse 72%
```

And *inside* one section, on lofi seed 1: each bar shares an average **60%** of
its notes with the bar one loop earlier, and through the two back-to-back
choruses (bars 12–20) it runs **85–93%**. The chord sequence is a single
four-chord loop for the entire song and never changes.

| what | why it is open | what closes it |
|---|---|---|
| ~~**The "third time" rule almost never fires**~~ **DONE** — it counted section names; a listener counts four-bar passes, and one section is two passes, so the threshold is now the SECOND section. | (was)  | The demand is raised on the third statement of a *section function* (`seen[f] >= 3`, and only for verse and chorus). A lofi song is 44–64 bars with 6–8 sections, so a verse usually appears **twice** and never reaches three. On seed 1 the verse never varies at all. | Count what the listener actually counts. They hear the **four-bar loop** go round, not section statements — an 8-bar chorus is two passes, and two choruses back to back is four identical passes. The rule should fire on the third pass of the same material, not the third section bearing the same name. |
| ~~**When it does fire on a chorus, the answer barely changes anything**~~ **DONE** — the chorus gained `Bvar`, built exactly as `Avar` is: same opening two bars, redrawn tail. It no longer answers by deleting. | (was)  | The response is `stripHalf` — take some notes out. Measured, the third chorus still plays **95%** of the first chorus's notes. Taking notes away does not make something sound new; it makes it sound like the same thing, quieter. | The verse's answer is the right shape and already exists: it swaps in `Avar`, a genuinely redrawn second half. The chorus has no equivalent. Give it one. |
| **acid repeats note-for-note, 100%, forever** | Not a rounding artifact — every statement of every section is bit-identical. | acid may want that (it is a machine-music genre) but it has never been decided in writing, and 100.0% is the number that says nobody chose it. |
| **Only 4 knob lanes step on a repeat in lofi seed 1** | The project's own history says the rule of three should be answered by *timbre* rather than by rewriting notes, and added `occurrence` knob lanes for it. Four lanes across a whole song is not enough to be heard as "this is the third time". | More `occurrence` lanes on the genres that repeat most, and a measurement of how far they actually travel. |

## 6b. LOFI — WHAT THE PRODUCTION RESEARCH FOUND

*Added 2026-08-03. Research: `docs/genre-research/lofi-production.md` (15
sources on song construction, production and FX, plus Moore's textural layers
from a peer-reviewed journal). Measured on build `2026-08-03q`, 30 seeds,
1620 bars. Every row here is a number against a source, not an impression.*

| what | why it is open | what closes it |
|---|---|---|
| ~~**Five or six parts sound together in 61% of lofi bars**~~ **DONE `2026-08-04o`** | The mode was FIVE against a sourced "not more than 3 or 4 elements" [corpus:modeaudio]. **The count was the symptom; the structure was the fault** — Moore's four layers are beat, bass, MELODIC, harmonic filler, and lofi carried two melodic (lead + counter) and two harmonic (keys + keys2), so the chorus doubled half the texture. | CLOSED: `counter: null`, the declaration acid/plastikman/jungle already carry for the same reason. The harmonic doubling STAYS — `keys2` is the sourced "different dress" of the chorus. **Measured: parts/bar 4.06 → 3.71, chorus 5.38 → 4.50.** Moving the counter to the instrumental was tried first and the battery refused it (composed every song, heard in 13 of 60). `lofi-production.md` §7b. |
| ~~**`keys2` plays in most bars and NO `form.roles` entry asks for it**~~ **DONE `2026-08-03r`** | The arrangement added a second keyboard to every section that had anything pitched, because it tested `picks[slot] !== "auto"` — true both when the USER loads a machine into a rack AND when the COMPOSER draws one from the genre's own table. The stated justification ("not a veto over a machine the user has deliberately loaded") is right and did not cover the second case. MEASURED, 100 seeds: drawn in 60% of lofi songs, and in those songs playing in **98.2% of every bar** — it never sat out. **(An earlier row here said 72.7% of all bars. That was wrong — small-sample noise over 30 seeds, and reproduced independently by a second measurement, which is why two agreeing numbers are not proof.)** | CLOSED: `picks.byHand` records whose choice each slot was; the auto-add fires only for a hand-loaded machine; genres name `keys2` in `form.roles` where they want it — lofi on the chorus alone ("the same loop in different dress"), bladerunner across the body of the cue since the VP-330 IS that score's bed. Result: lofi 98.2% → **39.6%** of bars in songs that have it, parts-per-bar 4.62 → **4.07**. Blast radius: only the `keys2` role moved, only in those two genres (lofi 144/300, bladerunner 150/300); every other role and genre byte-identical. |
| **The density is SUSTAIN, not onsets** | Measured simultaneity (notes ringing at any instant): lofi **10.30**, second of seven behind bladerunner's 10.55 and well above synthwave's 8.66. The drums contribute only **0.68** of that; **8.70 is sustained pitched material** — `keys` at 1.54 s per note and `keys2` at 2.53 s. So anything that thins by deleting notes will barely move it. | Know this before acting on the row above: the lever is note LENGTH and how many parts hold at once, not note count. The existing `arc.thin` mechanism removes notes and would therefore be the wrong tool. |
| **The sourced dropout barely happens, and sections never vary in length** | §3's sourced shape has "occasional dropout sections". The only lofi section that drops the drums is the bridge, which occurs in **7 of 30 songs**. And across 229 sections, verse/chorus/bridge/instrumental were **always exactly 8 bars** and intro/outro always 4 — zero variation. | Both are `form` table questions (`lengths`, the transition weights, `bridgeAfterChorus`). Cheap, and it is the one place the production research and the form research agree the program is short of the sources. |
| ~~**No bitcrush / sample-rate reduction anywhere**~~ **ANSWERED `2026-08-04c` — measured, and NOT built** | The tutorials say 12-bit, after the machines the genre grew out of (SP-1200, MPC60). But an ideal converter's own noise is `6.02n + 1.76` dB down [corpus:analog.com MT-001], which puts 12-bit at **74 dB below full scale** — quieter than a record, quieter than tape, and quieter than this program's own crackle. Measured rather than calculated, by quantising the real render and weighing the error signal against the noise the record already has: **12-bit sits 11.1 dB UNDER it**. It would be a control that does nothing. | CLOSED by not building it — the same verdict the deep low-pass got, reached the same way. **Two things worth keeping:** 12-bit is buried partly *because* the crackle went up 17 dB (against the old crackle it was only 6 dB under); and **8-bit measures 12.9 dB ABOVE the noise floor and would be plainly audible**. So if this sound is ever wanted, the number is 8, not 12, and it is a distortion decision rather than a fidelity one. `lofi-noise.md` §6e. |
| ~~**No sidechain / ducking anywhere**~~ **DONE `2026-08-04c`** | Zero occurrences. Both sources that raise it treat it as standard and **disagree on how hard**. The tie is broken by the one hip-hop-specific source: "heavy-handed pumping is generally undesirable in hip-hop… a fast attack of 2-5 ms and a short release of 40-80 ms on the bass, triggered by the kick, creates a **barely audible duck**" [corpus:musicproductionwiki], with 2-3 dB the usual starting point [two further sources]. | CLOSED: one gain per bus, sitting between the bus and everything downstream — a channel insert, ahead of the fader and ahead of the sends. Built for every bus unconditionally and left at 1, so a genre that declares no `space.duck` renders what it always did. Triggered in `dispatch()` so live and offline duck identically. lofi declares 2.5 dB, 4 ms on, 65 ms off, on the bass, the chords and the record surface. **Measured, 24 bars of seed 1: all 46 kicks, typical -2.37 dB, deepest -2.75, back within half a dB in 80 ms. synthwave and acid, which declare none: 0.00 dB.** `lofi-noise.md` §6d. |
| ~~**Flutter is modelled on the Mellotron only**~~ **DONE `2026-08-04c`** | The genre-level `tape` block carried `wow` but no `flutter` and no `hiss`, so both existed only inside one instrument that lofi draws in 5 songs of 30. | CLOSED: `tape.flutter` and `tape.hiss` beside `tape.wow` and `tape.crackle`, drawn per song, declared by all seven genres so the table has one shape. Standards split the two by rate and nothing else — wow 0.5-6 Hz, flutter 6-100 Hz [two sources] — so the file now has one pair of rates (`TAPE_WOW_HZ`, `TAPE_FLUTTER_HZ`) instead of a literal per machine. lofi turns them on; the other six declare `[0, 0]`, which is why nothing else moved. |
| ~~**The deep low-pass never reaches the chords and melody**~~ **ANSWERED `2026-08-04` — it is already true, and nothing needs building** | The sources' most specific instruction is a low-pass pulled down to 2-8 kHz (four sources: 2 kHz [modeaudio], "typically 4 kHz" and "3-4 kHz simulates old radios, tape players and vinyl" [audeobox], "roughly 6500 Hz" [sageaudio], "above 8 kHz" for pads and pianos [lofimusicacademy]), applied to individual instruments and explicitly NOT to the master ("filtering the entire mix removes the air and sparkle... better to address the brightness on individual tracks" [audeobox]). **A filter was built for the pitched buses, wired, verified in the signal path — and then MEASURED AT 0.13 dB OF EFFECT.** The reason: this program is already dark by construction. Measured on lofi seed 1, share of energy above 2 kHz: whole mix **-17.7 dB** (1.7%), drums **-22.4 dB**, chords **-20.2 dB**. A 2 kHz low-pass on material that holds 1% of its energy above 2 kHz can only remove about 0.04 dB, which is what it did. | CLOSED by reverting the filter. Shipping a control measured at 0.13 dB, with a genre declaring values for it, is exactly the knob-that-does-nothing this file forbids. The instruction is satisfied by the instrument and drum-voice design instead of by a filter, which is a better answer than the sources give. **If a future genre IS too bright, the per-drum lowpasses already exist (lofi: snare 8k, hat 11k, open hat 9k, toms 6k) and are the right place.** Three measurement errors were made getting here and are worth knowing: measuring a single low Rhodes note that had no top end to remove; leaving the bass in, which dominates the energy and hid the chords; and putting the code inside the drum-chain block so it only ran when a drum machine was loaded. The filter was proven to be in the path by forcing it to a 21 kHz highpass and watching the chords go silent. |
| ~~**The vinyl crackle rides the KEYS bus**~~ **DONE `2026-08-04c`, and BOTH halves of this row were wrong** | ~~"about 36 dB below the band"~~ was arithmetic on numbers that never meet in the signal path. Rendered: **79 dB below the record's loudest moment**, where a real record's noise sits 55-60 dB below its own peak [corpus:hifiauditions; corpus:headphonesty]. And ~~"is reverberated"~~ is true of the diagram and worth **0.00 dB** in the sound (0.06 dB even at a reverb level 5.6× the genre's). **The real fault was neither: closing the keyboard channel silenced the record surface** — measured, 0.000083 open, 0.000000 shut. | CLOSED two ways. The crackle has its **own matrix row**, with a fader and five blind plates — not six crossings, because five of them would have been knobs that move nothing, and the reason is generated into `MATRIX.none` beside the existing ones. The physical argument: the crackle happens at the stylus, after everything, and never met the band. And the **level went up 15.7 dB** (`crackle [0.006,0.008]` → `[0.040,0.055]`, plus a hiss set under it), landing 61-63 dB under the loudest moment — deliberately just under §1's band, because this models the fizzy part and not the rumble that dominates the real measurement. |
| ~~**`wow` reaches the `keys` role and nothing else**~~ **MOSTLY DONE `2026-08-04c`** | `ev.wow` was set only for `role === "keys"`, so bass, lead, counter and **the second keyboard** got no pitch drift. The sources put wow and flutter "on sustained sounds like **pads** or leads" [corpus:landr] — and `keys2` IS the pad, with the longest notes in the genre (2.53 s). | The second keyboard has it now, and the fast wobble with it: **1894 second-keyboard notes over 30 lofi songs, where there were none**. Not decoration — subtracting one render from the other, the part changes by **4.5 dB** with both off, and by 31.4 dB with only the fast wobble off, which is what a setting at the audibility floor should measure. **STILL OPEN: bass, lead and the repeating figure carry no drift**, and the drift belongs to the TAPE rather than to one player, so in principle they should. Left because widening it further moves six other genres and wants its own listening pass. |
| ~~**THE TUNE IS PLAYED BY THE HOUSE GENERIC**~~ **DONE `2026-08-04i`** | `leadChar`, beside `keysChar`, drawn on its own substream so adding it moved no note. lofi's tune is on a Rhodes or a Wurlitzer in **210 of 300 songs**; the other 90 draw the `sega` rig, where the lead lane resolves to `chipLead` and never reaches `V.lead` at all — a rig is a band. Six genres declare `"synth"` and are byte-identical. Both electric pianos now ask the note which channel it belongs on rather than assuming the keyboard one. **The level was measured and the arithmetic had it backwards**: the bank is scaled UP by 2.4 and the synth stack divided DOWN by 1.68, which says the Rhodes should arrive hotter — it arrives ~2 dB quieter, because an electric piano decays and a held oscillator does not. `LEAD_KBD_TRIM = 1.25`, one number for both, because −1.4 dB against −2.4 dB over two seeds each is not a difference the data separates. `docs/genre-research/the-rhodes.md` | STILL OPEN, and it is now the interesting half: **the comp reaches the Rhodes' hard velocity layer 0 times in 34 969 notes.** The bark is what forte does [corpus:chicagoelectricpiano] and lofi's comp tops out five velocity points under the threshold, out of two numbers set independently — `bark: 0.42` and a gain ceiling of 0.79. Whether a lofi comper plays that hard is an ears question. Also open: **vibraphone and muted guitar**, two of the three instruments the sources name, and this program has neither. |
| *(the row this replaced, kept for the measurement)* | 72% of lofi's lead notes come out of `V.lead`: a triangle, a square and a sawtooth an octave up, through one lowpass, with a vibrato fixed at 5.1 Hz that fades in identically on every note. No sample, no velocity layers, no per-note character. `V.counter = V.lead`, and it is also 100% of synthwave's tune. **Three sources name the lofi lead and none of them names a synth**: "Rhodes piano is the standard choice. Vibraphone works well at lower tempos. A muted guitar played fingerstyle" [corpus:songer]; electric piano is "one of the most iconic instruments in lo-fi", while synthesisers are listed for "soft pads, warm chords, gentle arpeggios" [corpus:clarkaudio]; "Rhodes keyboards and analog synths", with the synth *layered under* a real instrument [corpus:nativeinstruments]. The user's words: "Its stale and lame." `lofi-comp-and-lead.md` §0, §5. | Its own research on what a struck/plucked lead is as SYNTHESIS — every source names the instrument and none describes how to build one, which is stated as a gap in that sheet. Then a voice, and a `leadChar` draw beside `keysChar` so the genre picks its own rather than inheriting the house one. **It moves synthwave too unless the new voice is additive**, so scope it deliberately. |
| ~~**THE TUNE NEVER STOPS**~~ **DONE `2026-08-04j`** | Two table numbers. `theme.breathLast: 7` — the second bar of a phrase may no longer put an onset in its back half, so the tune goes quiet before the phrase comes round again; the pool is FILTERED from the one the genre already declares rather than being a second list, and it spends the same draws either way [Law 3]. `theme.count.hooky: [4,2] → [3,2]` — the hook was the one part of this genre's tune outside the sourced two-to-four a bar, at 4.06. **Measured: notes a bar 2.98 → 2.63, SILENT TIME 38.3% → 41.0%, rests of a beat or longer 39.2% → 47.9%, material B 4.06 → 3.25 a bar.** 300 of 2100 songs moved and every one is lofi. **AND THE FIRST METRIC WAS THE WRONG ONE** — "bars with no note at all" read 5.3% → 6.2% and nearly got the change reported as doing nothing, because a rest in the back half of a bar leaves a note at the front of it. `probe_density.js` now measures silence in TIME. | The rest LENGTH is `[EAR]` and labelled so — no source gives one. |
| *(the row this replaced, kept for the measurement)* | It rests in **1 bar in 19** of the bars it is rostered for (5.3%), against three sources whose whole subject is space: "insert rests between phrases" [corpus:mysticalankar], "leave space between phrases… silence matters more in lo-fi than in almost any other genre" [corpus:songer], "negative space" [corpus:melodigging]. The note COUNT is defensible — material A is 9.0 notes over 4 bars against a sourced two-to-four a bar — but **material B is 16.3, over the ceiling**, and the performed mean is 2.98. What the sources describe is not a rate, it is a shape: phrase, rest, phrase. **This is independent of the row above** — either fault alone produces the complaint. | A rest that is written rather than left over. **No source gives a length or a frequency for it** (`lofi-comp-and-lead.md` §7), so whatever is chosen is `[EAR]` and must be labelled so. Cheapest honest version: a genre-level phrase length, with the tail of the phrase left empty. |
| **`space.wet: 0.16` is identical to the engine's fallback** | The genre declares a reverb level it would have received by default anyway, so the declaration carries no information and nobody can tell whether 0.16 was chosen or inherited. | Either change it deliberately or mark it as agreeing with the default on purpose. |
| **Flutter and hiss are declared and OFF in the other six genres** | Both fields now exist in every genre's `tape` block, and six of them read `[0, 0]`. Two of those are wrong on the face of it: **synthwave is a videotape**, which has both, and bladerunner is a 24-track machine. Turning either on would move every song in that genre. | Not a defect — a decision for whoever is listening to those genres, with the mechanism already there and one line to change. It was left alone on purpose so a lofi task did not quietly re-voice synthwave. |
| **The crackle's fader is the only crossing on its row** | The `vinyl` row has five blind plates. The reasons are physical (the crackle happens at the stylus, after everything) and measured (feeding it the room moved it 0.00 dB). | Recorded so nobody re-opens them by accident. If a genre ever genuinely wants washed-out surface noise, the plate has to be removed deliberately and the reason in `MATRIX.none` rewritten. |
| ~~**Lofi's tempo sits above the sourced consensus**~~ **DONE `2026-08-04o`** | Declared `[74, 92]`, measured mean **82.5** against a 70–80 common ground — and the relaxation literature says why that window exists: "close to the human resting heart rate… your nervous system synchronises with the rhythm" [corpus:studyclock], "60–70 BPM promotes alpha waves" [corpus:mihata]. | CLOSED: `[70, 84]`, **mean 77.1**, inside the common ground. Moved every lofi song (300/300 snapshot lines, no other genre); re-baselined deliberately. |

## 6c. THE DRUM ENGINE AND THE TR-1000 PANEL — `2026-08-04m` … `04o`

*From the user's reports: the TR-1000 panel "is not a clone of the actual",
the synthwave snare "over rides the bass drum", the kick "has [no] oomph, it is
bearly there", "the hand clap might be the thing i hate", and "why are we
talking about an 808 when we stopped using that many moons ago?" Research:
`docs/genre-research/drum-engine.md`. Measuring arm:
`harness/probe_kickpunch.js`.*

**CLOSED**

| what | what closed it |
|---|---|
| ~~the panel drew ten identical strips~~ | channels 1–4 are double-width with two knob columns, 5–10 single, as the machine is [corpus:soundonsound] |
| ~~knobs capped `CTRL 1/2/3`~~ | they read REVERB / DELAY / FILTER — on the real machine those knobs are *assignable* and the screen names the assignment |
| ~~top-row knobs at three different heights~~ | legends above with a rule, groups top-aligned, one fixed row height; measured, all top dials on one line |
| ~~**seven controls declared, ridden, and drawn on no panel**~~ | BD tune/decay/tone, SD snappy/tone, both hat decays — 68 of 75 reached the glass. Now 75 of 75, checked by deriving the count from the declaration |
| ~~the synthwave snare peaked ABOVE its kick~~ | gate send 0.95 → 0.55, snare reverb 0.52 → 0.34, hold and fall untouched. **+0.3 dB → −2.8 dB under the kick** |
| ~~the engine only ever built 808 circuits~~ | `tr1000.circuit` — the machine is "16 analog voice circuits lifted straight from the previous TR-808 **and 909** designs". **Punch: acid +5.3 → +8.1 dB, synthwave +2.0 → +4.7 dB** |
| ~~the clap's tail was 240 ms~~ | the circuit's is ~100 ms [corpus:KVR]. Per-circuit bands (808 1000 Hz, 909 1140 Hz/Q1.95), decaying retriggers. **acid 64 → 20 ms, plastikman 96 → 20 ms** |

**STILL OPEN**

| what | why it is open | what would close it |
|---|---|---|
| **The kick is still sub-dominant** | 57–64% of its energy under 100 Hz, ~10% in the 100–250 band a laptop reproduces. The 909 circuit and the body layer add ATTACK weight; neither rebalances the spectrum, because the sub's long decay dominates the ratio and the drum bus saturator already fills that band. | Attenuating the sub or raising the tunings — both change what the genres ARE, so both are ear calls. Measured either way by `probe_kickpunch`. |
| **`punch` is `[EAR]` on every genre** | It ships at the control default 0.55 and no genre declares its own. | A pass once the ear has ruled on the kick. |
| **The narrow strips' three CTRL knobs are small** | 1.16 rem dials. Secondary controls and the screen reads their values, but fiddly on a phone. | Either accept in writing or give the panel a second row at narrow widths. |
| **The right-hand side of the real panel is undrawn** | C1–C6 macros, MORPH, LAYER A/B, transport, pattern keys. | Nothing — deliberate, and the panel declaration says why: they are sequencer controls and this program composes. |
| **Only synthwave declares a gate at all** | So the gated-snare balance work applies to one genre by construction. Not a defect; worth knowing before anyone reads §6c as engine-wide. | A decision per genre on whether a gate belongs. |

## 6d. THE TENSION LOFI'S SOURCES EXPOSE — recorded, not resolved

**The genre's own literature calls repetition a feature**: "semi-predictable,
further minimising distraction", "repetitive and lyric-free enough to stay out
of cognitive focus" [corpus:studyclock]. **§6a of this file exists because the
user found the loop too repetitive** and `Bvar`, the occurrence lanes and the
pass-counting rule of three were built to answer that.

Both are true. The sources' own reconciliation is the "sweet spot": enough
melodic interest to be pleasant, repetitive enough to stay out of focus — which
argues lofi's variation should be **timbral** (a filter opening, a layer
changing dress) rather than **melodic**, and that is exactly what the
`occurrence` motion kind was added for. **Nothing has been changed on the
strength of that reading.** It is here so nobody "fixes" the repetition without
knowing the genre's literature calls it the point. `lofi-production.md` §7b.

## 6e. THE AUTOMATION AND THE FX, UNIT BY UNIT — `2026-08-05a`

*The user: "Can we test the automization and fx of each unit making sure they
work like they should and we are automating things proper."* Two defects were
found by measurement, confirmed independently, and fixed in this build. Both
were **in the scheduler and in one unit's construction, not in any genre's
table** — which is why no genre-level probe had ever seen either.

### CLOSED

| what was wrong | measured before | measured after |
|---|---|---|
| **The barberpole went permanently silent** partway into every playback. Its window rode each notch's **Q**, and `setSpace` rode the window's sine leg and its DC-lift leg with the *same* number, so Q swung symmetrically about zero. Chrome installs **all-zero filter coefficients at Q = 0**, so a notch that merely touches zero mutes the cascade — and six notches offset by a sixth of a cycle tile the cycle with no gap. Rebuilt as six `peaking` filters whose **cut gain in dB** is windowed by a raised cosine read off the sweep, which is what the sources say and what the panel had been drawing all along. `barberpole.md` §7 | the return collapses and never recovers — see `test/ears/LOG.md` | holds for the whole render |
| **The hard steps in the motion plan mostly never reached the parameter.** `rideBus` wrote its curve one point per **beat**, four times coarser than the plan's own sixteenth, so a `throw` placed at `at: 0.8` or `0.875` lived entirely between two grid points; and the test for "is this a step" read the *fader-law factor* (1 on nearly every lane) instead of the lane's depth, giving a flat threshold of 0.35 against declared throws of 0.10–0.34. Edge lanes are now written on the plan's own grid, and "does it jump" is asked of the plan directly instead of by size. | **0 of 1227** planned steps arrived, across 5 genres and 14 lanes; snaps landed **57.7 ms early** (exactly half a sixteenth — the bisection was finding `motionAt`'s rounding boundary, not the bar line) | **1227 of 1227**, 0 ms rise, 0 ms early, on the line |
| **`rideBus` read three callers' bases in the wrong units.** It clamps to `CONTROL[key]` and normalises the motion against the control's default, and three callers hand it the knob value already multiplied: the flanger's depth in seconds (0.0040×), the DP/4's amounts per algorithm, the pole's window (5×). The multiplier is now passed separately and applied last. **One real casualty and two near-misses** — see the correction below the table. | `barber.depth` written as **exactly 1.000 for the whole song**, both legs, on synthwave | swings **−19.5 … −12.7 dB**; flanger and DP/4 unchanged to the last digit |

**CORRECTION, same build, made after the commit that claimed otherwise.** The
first write-up of the third row said the flanger "delivered 0.8 % of its
declared motion". **It did not, and neither did the DP/4.** Measured on both
builds: `flange.depth` on plastikman writes 0.001907 … 0.002660 s before the
change and 0.001907 … 0.002660 s after — identical, and identical for a
reason. The fader-law factor is `base/def`; when the base is `scale × knob`
that factor is `scale × knob / def`, so `scale·knob + (scale·knob/def)·m` and
`scale·(knob + (knob/def)·m)` are the same number. The multiply distributes
straight through the one place it looked dangerous. What was genuinely broken
is only the **clamp**, which was being applied in seconds and in decibels to a
range written in knob units — never binding on the flanger (0.002 s is nowhere
near the control's max of 1) and binding on every sample of the pole, whose
scale is greater than one. The fix is right; the scope of it was overstated by
two of three, and that overstatement was in a pushed commit message.

### STILL OPEN, from the same audit — **verified, not yet decided**

- **Apex lanes deliver 40–88 % of their declared swing.** `motionAt`'s comment
  says "depth is the swing from arc 0 to arc 1", and `form.arc` never reaches
  0 — so every genre with an apex lane moves less than it says: dkc 40 %,
  lofi 50 %, jungle 63 %, acid 67 %, synthwave 71 %, bladerunner 77 %,
  plastikman 88 %. **A decision, not a bug**: either make the comment true, or
  normalise the move so the declared swing is delivered. The second changes
  every genre that declares one and needs a deliberate re-baseline.

### RAISED BY THE AUDIT AND **NOT INDEPENDENTLY VERIFIED**

Their verifying agents never ran. Recorded so they are not lost and marked so
nobody builds on them:

- two of the four LFO shapes (`ramp`, `fall`) are used by no genre;
- `occurrence` sits at step 0 for about half of every record, and lofi reaches
  only 63 % of its declared cap;
- throws land mid-phrase 64–72 % of the time in four genres — the phrase
  counter is absolute rather than section-relative;
- `gesture` entry edges are undocumented discontinuities (144 of 192 moves;
  jungle's build reportedly opens with an instant −19.0 dB step);
- snap windows land mid-section 22 % (plastikman) / 45 % (jungle) of the time.

## 7. UI

- ~~**A PAD CAN BE PERFECTLY WIRED AND STILL DO NOTHING**~~ **CLOSED
  `2026-08-05d` — THE HAND IS THE END OF THE LINE.** The user ruled on it in
  one sentence: *"If I turn a knob it should always work for me no matter what
  the genre is. The user is the end of the line."* Fifteen genre/unit pairs
  had no input at all, so every knob on those units was inaudible — the
  flanger, the DP/4 and the barberpole, five genres each. A hand on any
  control of a return unit now OPENS that unit's inputs on a song that was not
  already feeding it: hand-only (a song nobody touched is unchanged to the
  sample, measured below), reversible (release the trim and it goes back), and
  derived (nothing names a unit or a genre). **15 → 0.** The measurement that
  found it is kept below.

  Measured `2026-08-05` with `harness/probe_pads.js`, the pad's whole
  travel as a difference against the mix, best of three windows across the
  record:

  | | lofi | synthwave | dkc | bladerunner | acid | plastikman | jungle |
  |---|---|---|---|---|---|---|---|
  | **KORG · KAOSS** (echo) | −28.7 | −26.6 | −19.7 | −16.7 | −18.9 | −15.4 | −33.9 |
  | **YAMAHA · SPX90** (flanger) | **−81.1** | −14.2 | **−99.3** | **−92.1** | **−99.7** | −2.1 | −10.1 |

  The echo pad reaches the sound on all seven. The flanger pad reaches it on
  the three genres that feed the flanger and is **silent to the float floor on
  the other four** — which is correct behaviour (the unit is not in those
  records' signal path) presented as a working control. You put a finger on it,
  the cross moves, the value changes, and nothing happens. That is the "a knob
  that does nothing is a lie" rule one level up: the knob works, its unit is
  not connected on this song.

  After the rule, re-measured with the same probe: **7 of 7 on both pads.**

  I had written this row up as "correct behaviour presented as a working
  control" and proposed greying the pad out. The user rejected that reading
  outright, and was right to: a control that is drawn and turnable and does
  nothing is the defect this file already has a rule about, and which side of
  the signal path the reason sits on does not change that.

  **Still open, and smaller: the dim dot on the SPX90 can only ever appear on
  plastikman** — the only genre whose song moves `flange.rate`/`flange.depth`.
  On the other six that pad shows one mark where the machine shows two. The
  hand rule does not touch this; it is about what the SONG moves, not what the
  hand can reach.

- ~~**Nothing on this page shows the NOTES**~~ **DONE `2026-08-04h` — THE ROLL.**
  Every display in the program showed what the machines were doing; none showed
  what the song was. It draws through `midiKeyFor`, the same function the .mid
  export and the live port use, so the count on the glass is the count in the
  exported file — which is the check `mk2_ui.js` now makes, per role, on a
  genre with an ostinato and a second keyboard, because those are the two roles
  this project has actually lost on export. **It is NOT the picture
  `mk2_roll.js` prints and that is the point**: that shows the material, this
  shows the performance, so the groove displacement and the arc thinner are
  both visible for the first time.
- **The roll shows one song and cannot compare two.** The interesting question
  about six unheard builds is what CHANGED, and the display answers "what is
  there". A ghost layer of another seed or another build would answer it.
- **The roll has no zoom and no scroll.** A 304-bar jungle song is squeezed into
  the same width as a 44-bar lofi one, so at that length a bar is three pixels
  and only the shape survives. Fine for reading an arrangement, useless for
  reading a phrase.
- **The field does not name the section's stage on the tube** — now that a
  stage is a thing, showing which one is running is small and obvious.
- **`probe_wiring`'s table belongs on screen**, not only in a terminal.
