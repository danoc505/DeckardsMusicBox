# THE SAX ENGINE — playing the sax like a sax, researched

*2026-08-02. The user, after three rounds of fixes: "our sax is bad... it's
deeper than this. We don't have the full articulation of a saxophone...
don't we need an engine that plays the sax like a sax and not playing the
sax like a keyboard?" That question is the design. This document precedes
the build.*

## Sources

1. Audio Modeling, SWAM Saxophones — https://audiomodeling.com/products/swam-saxophones
   (commercial; researched for its ARCHITECTURE, nothing copied)
2. moForte / GeoShred — https://www.moforte.com/ (physical modeling from
   Julius O. Smith III's Stanford/CCRMA waveguide research; GeoSWAM winds)
3. University of Iowa MIS, alto saxophone —
   https://theremin.music.uiowa.edu/MISaltosaxophone.html — chromatic, pp/mf/ff,
   vibrato and non-vibrato, mono 16-bit 44.1k AIFF; "freely available...
   may be downloaded and used for any projects, without restrictions"
4. Karoryfer Weresax — https://github.com/sfzinstruments/karoryfer.weresax —
   alto sax, 256 24-bit WAVs, **CC0-1.0**: "royalty-free for all commercial
   and non-commercial use... open-source"
5. Karoryfer Bear Sax — baritone, sustain + staccato, multiple dynamic
   layers, scripted legato (same family; license to verify at download)
6. US patent 6316710 (expressive phrasing synthesis) — already cited in
   sax-playing.md for the falloff release

## What the expressive engines actually are — and the lesson

**SWAM is not a sampler and not a pure physical model.** Its own
description: physical + behavioral modeling combined with
"Multi-Vector/Phase-Synchronous **Sample-Morphing**" — and the control
architecture is the point: "independent real-time control of **dynamics
and fingering**, continuously", with growl, flutter tongue, breath noise
and overblow as live parameters. GeoShred is the other pole: true
waveguide physical models (Smith/CCRMA) under a continuous-control
surface.

The shared lesson, which answers the user's question: **in both engines
the note is not the unit — the BREATH is.** Dynamics is a continuous
stream, pitch (fingering) is a continuous stream, and the timbre morphs
along the dynamics stream phase-coherently. A keyboard sampler triggers an
envelope per note; a sax engine runs one excitation per phrase and the
notes are fingerings on top of it. Our current V.sax — despite the
researched articulation model — is still per-note dispatch: every note its
own envelope, its own oscillators, its own filter run. That is playing the
sax like a keyboard, precisely.

## The design

**1. The phrase is the rendering unit.** Stage 5 already knows phrases
(art: "breath" opens one). It will attach the whole phrase to its opening
event (`ev.phrase`: the following notes with relative times); members are
marked and not dispatched separately. V.sax renders ONE phrase: one
continuous excitation, one dynamics curve across it, one pitch trajectory
through the fingerings — legato steps are glides with NO re-attack,
tongued notes are a 25 ms dip in the SAME stream, the taper/fall closes
the breath. Everything the articulation research built survives; it stops
being per-note envelope logic and becomes curve-shaping on one voice.

**2. Timbre = analyzed spectra of MULTIPLE real saxes, morphed
phase-coherently.** Not megabytes of samples: a corpus script analyzes the
sources offline (Iowa pp/mf/ff per register; Weresax; Bear Sax for a
second horn) into harmonic-amplitude tables, which become WebAudio
PeriodicWaves — kilobytes each. Two oscillators at one frequency in
WebAudio hold phase, so crossfading two PeriodicWaves IS phase-synchronous
morphing — the SWAM trick, built from first principles. The dynamics curve
morphs pp->mf->ff continuously, so a crescendo changes the SPECTRUM the
way a real breath does, because the endpoint spectra are real breaths.
Multiple sources give the "richer sound" the user asked for: a `character`
control chooses or blends horns. Per the corpus rule, downloaded audio
stays local and is never committed; only derived tables land in the HTML.

**3. The breath is a layer of the same curve.** Noise residual (from
analysis) shaped by the dynamics stream; attack chiffs as tiny grains only
if analysis shows the additive attack is weak. Subtone falls out for free:
pp at the bottom of the horn IS the subtone spectrum, recorded.

**4. Behavioral ornaments as continuous parameters** (SWAM's own list, on
our substreams): growl (built — AM+FM+noise), flutter tongue (to build:
25-35 Hz interruption burst), overblow (to build: harmonic-set jump),
breath noise (built, becomes curve-driven), vibrato/scoop/fall (built,
become modulations of the one pitch stream).

**5. Then the horn goes to all seven genres** — the user's ask — as a
drawable lead with per-genre weights, once and only once the engine
convinces their a verdict on it on one.

## Build order, each step measured before the next

1. `corpus/analyze_sax.py` — download Iowa NoVib + clone Weresax (CC0);
   slice, verify pitch, extract harmonic envelopes + noise residual per
   note per dynamic; emit compact JS tables. Nothing committed but the
   script and the derived tables.
2. Phrase attachment in stage 5 (`ev.phrase`), snapshot moves for
   sax-drawing genres only — isolation measured.
3. V.sax rewritten as the phrase engine over the wavetable banks.
   probe_sax extended: ONE attack per phrase, glide counts, spectral
   distance to the source tables.
4. Ornament parameters wired to panel + genre motion.
5. Genre rollout with per-genre draw weights [CHOSEN].

## What was wrong with the previous approach, for the record

Three rounds of articulation fixes (phrasing, endings, subtone) improved a
tone that could not carry them: two sawtooths through formants is a
recipe, and the coupling of breath to spectrum — the thing that makes a
sax a sax — cannot be added to a static oscillator by envelope logic. The
Iowa-only sampler plan (§9.5 of the handoff) was better but still a
keyboard: per-note triggers of frozen recordings. The user rejected both,
correctly, and the second rejection named the architecture: the engine
must play the sax like a sax. This document is that engine's design.

---

## ADDENDUM 2026-08-02 — what sax players PLAY, measured from 272 solos

The user, after hearing the engine: *"notes out of key and weak playing...
study the sheet music of sax songs."* Measured from the Weimar Jazz
Database's own transcriptions and phrase segmentation
(`corpus/analyze_sax_lines.py`, 272 saxophone solos, chords from the
database's beat-level annotations):

- **Duration-weighted, of notes held ≥2 beats: 56.3% chord tones, 29.5%
  named tensions (9/11/13), 14.3% foreign.** A player leans into STABLE
  notes. The engine was swelling every long note — lofi seed 6 had 18 long
  in-key-but-foreign notes being played like arrivals, which is what "out
  of key" sounds like when nothing is literally out of key.
- **Phrases: median 14 notes over 2.66 s (q25 8, q75 24); breath gaps
  0.43–0.97 s.** Our lofi phrases average under 5 notes — the material is
  ~3× too short-breathed, which is the largest remaining reason it does
  not play like a horn.
- Intervals: 57.4% stepwise, 15.5% leaps ≥ a fourth — our lines are close
  (47% slurred-stepwise), this part holds.

**Built from it (2026-08-02l):** every phrase member carries `ct`
(2 chord tone / 1 tension / 0 foreign, stamped in stage 5 from the
sounding chord); the messa di voce and the phrase-peak choice now go only
to stable notes; foreign long notes ride flat and let the line resolve
them. Breath loudness range widened (0.72–1.02) and the swell deepened
(×1.30) for "weak playing" [CHOSEN, the user's verdict].

**NOT built, the measured material gap:** phrases of 8–24 notes over
~1.5–4.3 s with 0.4–1.0 s breaths, and long notes CHOSEN to be stable at
composition time (not merely leaned-into selectively). That is the
stage-3 sax-aware theme work, and these are its target numbers.
