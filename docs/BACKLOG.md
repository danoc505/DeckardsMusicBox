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
| **8 rendered-audio checks fail** | Long-standing, pre-dating all recent work, identical to the last digit across builds: sub-runaway over the 25% tr1000 ceiling in five sections, one kit-free prechorus with kit energy, seed-2 kit in/out contrast, seed-3 loudness-vs-energy r 0.627. | A mix pass. They are recorded with their numbers so the next person starts from measurement, not guesswork. |
| **The gated reverb is still a ConvolverNode** | Which is why genres with a gate sit at the ~-100 dB float floor instead of bit-exact. | Either move it into the room worklet or accept and document permanently. |
| **`intro` bars = 4 undercount** | The target-length arithmetic treats a cold open as 0 bars and a normal intro as 4, which is not what the form actually produces. | Its own measured commit. |
| **MIDI wall-clock flake** | `mk2_midi` fails "no tick drifts" under load; always green on rerun. Documented, never ignored. | Nothing, unless it starts failing when idle. |

## 2. METHODOLOGY — how this project measures

- **A render A/B without a same-build control measures its own noise.**
  Two separate mistakes this session were caught only by running that
  control. Past handoff entries argued from render A/Bs with no control;
  they are not thereby wrong, but they are unverified in that respect.
- **Anything that LISTS what the program contains will go stale.** Three
  times in one session: the seam scanner's read-detection, the probe's
  column names (twice). Derive it from the declaration instead.
- **Run `probe_wiring` after adding anything.** A capability one genre uses
  is a capability that has not been understood yet.

## 3. THINGS BUILT BUT BARELY CONNECTED

Measured by `probe_wiring`, 2026-08-03:

- **flanger, DP/4, snap — one genre each** (plastikman). Sourced candidates
  named already: jungle's drops and synthwave's prechorus both want a hard
  cut; the FX columns want a genre-by-genre pass.
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

## 6. UI

- **The field does not name the section's stage on the tube** — now that a
  stage is a thing, showing which one is running is small and obvious.
- **`probe_wiring`'s table belongs on screen**, not only in a terminal.
