# Plastikman / Richie Hawtin minimal techno (Sheet One 1993, Musik 1994, Consumed 1998, Closer 2003, "Spastik" 1993)

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

TWO things, and they are both about what is NOT there.

(1) ONE MONOPHONIC 303 RIFF WHOSE NOTES NEVER CHANGE WHILE ITS FILTER DOES. A 16-step line, mostly one or two pitches with octave jumps, accents and slides, under a high-resonance lowpass whose cutoff is being MOVED BY HAND continuously. The pitch content is nearly static; the timbre is the melody. Hawtin, on Sheet One: "Many of the 303 lines were pitched up an octave" and "Sometimes my melodies are more rhythmical than musical" (MusicRadar track-by-track). If the person playing it hears a tune with phrases and a breath bar, it is not this genre. If they hear the same four notes for 90 seconds while the tone opens, it is.

(2) AN ALMOST EMPTY GRID, DRENCHED IN FEEDING-BACK DELAY. Kick on the quarters, a closed hat, one 303, and nothing else — with the reverb-and-delay wash carrying more of the bar than the notes do. Hawtin: "I never use EFX returns. I always use master channels on the console so there are always slight feedback loops. Then I like to have delays on the reverbs, and reverbs on the delays. I like it when things continue to wash and percolate in the background. It's always been a big trademark of my sound" (MusicRadar, Sheet One / "Vokx"). On Consumed he calls it "an architecture of sound... the aftereffects, the shadows of sound" and the record "a year of subtraction" (15questions).

The four-bar test: if ANYTHING changes inside four bars — a fill, a flourish on the fourth bar, a new hit, a hook — the person playing it will not name this genre. Patience is the signature. MK2's stage 3 "flourishBar: 3 / the loop states its figure three times and answers on the fourth" is exactly the gesture this genre exists to refuse.

Secondary but strongly identifying: the kick is NOT a 909 on Sheet One. Hawtin, on "Plasticity": "I had my [Roland] 303s, a 606 and an 808 going here. I always liked to have two different types of claps, and I was always into really small rimshots. There isn't much 909 on there. So much of my work had been on 909s before, so I was happy to get away from those 909 kicks." So: long-decay 808 kick, small dry rimshots, two clap layers — no backbeat snare.

## The tables

```js
/* ════════════════════════════════════════════════════════════════════════════
   plastikman — minimal techno, Richie Hawtin 1993-2003.

   PROVENANCE KEYS USED BELOW
     [corpus:mb+ab]  measured this session. Track durations from the MusicBrainz
                     web service; BPM from AcousticBrainz low-level (Essentia
                     beat tracker) over n=49 Plastikman recordings across
                     Sheet One / Musik / Consumed / Closer / Artifakts (BC),
                     plus "Spastik". Raw table reproduced under `_measured`.
     [corpus:hawtin] Hawtin's own words, MusicRadar "Classic album: Sheet One"
                     track-by-track (2016), MusicRadar 2016 interview,
                     15questions (Consumed In Key), RBMA 2013 lecture.
     [corpus:attack] Attack Magazine "Beat Dissected: Spastik-Style Percussive
                     Techno". NOTE: this is Attack's RECREATION, and they say so
                     — "The objective is to analyze drum programming techniques,
                     not to recreate the artist's beat exactly." Treated as a
                     careful transcription of the FIGURE, not of the record.
     [corpus:roland] Roland TR-909 Owner's Manual, full text on archive.org.
     [theory]        music theory / signal fact.
     [CHOSEN]           taste awaiting the owner’s verdict. Not measured. Say so out loud.
     [GUESS]         I could not find this. It is a placeholder. Do not trust it.
   ════════════════════════════════════════════════════════════════════════════ */

plastikman: {
  label: "minimal techno (Plastikman)",

  /* ── stage 1: identity ────────────────────────────────────────────────── */

  // [corpus:mb+ab] Measured medians by record, dancefloor tracks only:
  //   Sheet One 127.8 | Closer 128.0 | Consumed 122.0 | Artifakts 125.1
  //   "Spastik" 126.3 (AcousticBrainz) / 126 (songbpm) / 127 (Attack's remake)
  // Anchors inside this band: Plasticine 121.9, Converge 122.0, Slow Poke 124.0,
  //   Pakard 125.1, Plasticity 125.9, Spastik 126.3, Skizofrenik 126.5,
  //   Glob 127.8, Koma 127.9, Smak 127.9, Mind in Rewind 127.9, Ping Pong 128.0,
  //   Mind Encode 128.0, I Don't Know 128.0, Ask Yourself 128.2, Contain 129.6,
  //   Consume 129.7, Hypokondriak 129.7.
  // Deliberately EXCLUDED: Helikopter 137.9 and Locomotion 150.4 (the two
  //   "drive people's mental state" tracks), and the whole of Musik, whose
  //   measured median is 106.9 — see `_musikVariant` below.
  tempo: [120, 132],

  // [CHOSEN] + a MEASUREMENT THAT SAYS "DO NOT MEASURE THIS". Essentia's key
  // detector cannot decide on this catalogue: over 42 tracks it split
  // minor 22 / major 20 with a median key_strength of 0.55 — i.e. there is
  // no functional harmony present to detect. These weights are therefore a
  // TASTE CALL grounded in [theory] (acid lines are minor-pentatonic with
  // chromatic passing tones; the b2 is the acid-techno colour), NOT a corpus
  // statistic. Do not let anyone downstream read them as measured.
  // REQUIRES: phrygian added to the global MODES const ([0,1,3,5,7,8,10]).
  //   That is a genre-agnostic widening, not a special case.
  modes: [["minor", 6], ["phrygian", 3], ["dorian", 1]],

  // REQUIRES a new RIG entry (RIG is a global const; adding a row is a widening).
  rig: [["plastik", 10]],                              // [CHOSEN]

  // lofi's `keysChar` and `tape` have no meaning here but the draws must still
  // run unconditionally [Law 7], so give them one-element tables.
  keysChar: [["wash", 1]],                             // [CHOSEN]
  tape: { wow: [0.0, 0.0], crackle: [0.0, 0.0] },      // no tape patina [CHOSEN]

  /* ── stage 2: form ────────────────────────────────────────────────────── */
  /* READ THE ARCHITECTURE NOTES. This block is written as if MK2 could honour
     it. IT CANNOT: I proved a hard 88-bar ceiling and a hard rule-of-three
     rejection by running stage 2. The numbers are correct for the genre; the
     stage is not. */
  form: {
    coldOpen: 0.85,       // [corpus:hawtin] "getting the machines running, and
                          // then jamming out live" — the track is already
                          // running when the record starts. Also DJ convention.
    openVerse: 1.0,       // [theory] there is no chorus to open on.

    // [corpus:mb+ab] MEASURED. n=42 tracks >= 3 min: median 233 bars,
    // quartiles 156 / 233 / 332, min 62, max 624.
    //   Spastik 296 bars | Plasticity 347 | Plasticine 345 | Glob 266
    //   Consumed 350 | In Side 348 | Consume 367 | Ask Yourself 281
    // 224..320 = 7..10 x 32 bars, i.e. the measured interquartile range
    // snapped to the 32-bar grid this music is built on.
    target: [224, 4, 32],
    // *** UNREACHABLE. Stage 2's `for(guard=0; guard<10; guard++)` plus the
    //     global SECTION_LEN caps every song at 88 bars. Measured: with this
    //     exact target, 3000 seeds produced only 84 (2706x) or 88 (294x) bars
    //     — 2:46 max at 127 bpm against a 7:20 median record. ***

    // The genre wants ONE function repeated. That is what these weights say,
    // and it is what stage 2 refuses: 300/300 seeds built this way trip
    // `throw new Error("rule of three broken")` at the composeSong seam.
    transitions: {
      verse:        [["verse", 12], ["instrumental", 3], ["bridge", 1]],
      instrumental: [["verse", 8], ["instrumental", 6]],
      bridge:       [["verse", 10]],
      chorus:       [["verse", 10]],
    },
    bridgeAfterChorus: { verse: 2, chorus: 2 },        // [CHOSEN]

    // [CHOSEN], but principled: this music's changes are TIMBRAL, not dynamic.
    // The spread here is 0.70..0.96 against lofi's 0.50..1.00 — deliberately
    // half the range, because a section that gets LOUDER is a pop gesture.
    energy: { intro: 0.80, outro: 0.72, bridge: 0.70, instrumental: 0.88,
              chorus: 0.92, chorusPeak: 0.96, verse: 0.86 },
  },

  /* ── stage 3: materials ───────────────────────────────────────────────── */

  // [corpus:attack] "the kick hitting on every quarter note". Four on the floor
  // is definitional. The second entry adds a 16th pickup before the downbeat —
  // [CHOSEN], and it is the ONLY pocket variation I would allow.
  pocket: [[[0, 4, 8, 12], 9], [[0, 4, 8, 12, 15], 1]],

  kit: {
    // [corpus:hawtin] NO BACKBEAT SNARE. "I always liked to have two different
    // types of claps, and I was always into really small rimshots." Spastik's
    // snare is a 32nd-note ROLL, not a backbeat [corpus:attack]. An empty array
    // is the honest encoding; the clap belongs in `lift`.
    snare: [],

    hatEvery: 1,          // [corpus:attack] "a closed 909 hat plays all four
                          // 16th-notes per quarter-bar"
    hatVel: 0.55,         // [CHOSEN]

    // [theory-of-the-genre] A per-bar random extra hit is precisely the
    // bar-to-bar variation this music refuses. Zero. The draw still runs.
    ghostChance: 0.0,
    ghostSpots: [3, 7, 11, 15],   // drawn and discarded — keeps the stream's
                                  // place so tuning ghostChance moves nothing [Law 7]

    // [corpus: techno convention] open hat on the offbeat eighth. 14 (the "and"
    // of 4) weighted highest because it is the one that pulls into the next bar.
    // *** LIMITATION: openSpot yields ONE hit per bar. The genre wants an open
    //     hat on 2, 6, 10 AND 14 in EVERY bar. Not expressible. ***
    openSpot: [[14, 4], [6, 3], [2, 2], [10, 1]],
    openBars: [0, 1, 2, 3],       // every bar, not lofi's [1,3]

    kickKeep: 4,                  // all four quarters [corpus:attack]

    // *** THE SINGLE MOST IMPORTANT LINE IN THIS TABLE. ***
    // lofi's flourishBar:3 states a figure three times and answers on the
    // fourth — "the rule of three at the BAR level". This genre exists to
    // refuse that. -1 is out of range for b in 0..3, so the branch never fires.
    flourishBar: -1,                          // [corpus:hawtin, by construction]
    flourish: [[[], 1]],                      // belt and braces

    variants: {
      main:   {},
      // "lift" = ONE added hit, on beat 4. [corpus:hawtin] the clap/rimshot is
      // the added element, and it is added ALONE. Nothing else changes.
      lift:   { snare: [12], hatVel: 0.60 },
      // "depart" = SUBTRACT. [corpus:hawtin, Consumed] "a year of subtraction".
      // A minimal-techno breakdown removes; it never rewrites.
      depart: { hatEvery: 2, openBars: [], kickKeep: 4 },
    },
  },

  // [CHOSEN] the counter-line is a second 303 or a delay tail, not a harmoniser.
  // Sparse and low: it should sound like an echo of the lead, not a duet.
  counter: { density: 0.22, intervals: [-7, -4, -3] },

  // *** STATIC HARMONY. Degree 0 for all four bars = one chord for the whole
  // record. Justified by the measurement above (key_strength median 0.55,
  // minor/major 22/20 — nothing functional to detect) and by [corpus:hawtin]
  // "Sometimes my melodies are more rhythmical than musical."
  // The rare non-tonic bar is [CHOSEN]: a single drone move, never a cadence.
  progressions: {
    minor:    [[[0,0,0,0], 8], [[0,0,0,5], 2], [[0,0,5,0], 1]],   // i / i-VI [theory]
    phrygian: [[[0,0,0,0], 9], [[0,0,1,0], 1]],                   // i / bII [theory]
    dorian:   [[[0,0,0,0], 9], [[0,0,3,0], 1]],                   // i / IV [theory]
  },
  // There is no bridge and no departure. Same drone, so C cannot leave home.
  bridgeProgressions: {
    minor:    [[[0,0,0,0], 1]],
    phrygian: [[[0,0,0,0], 1]],
    dorian:   [[[0,0,0,0], 1]],
  },

  // [corpus:hawtin] "Many of the 303 lines were pitched up an octave" — so the
  // acid line sits in LEAD register, above the pad, while a separate deep sub
  // holds the bottom (Consumed is "driven largely by deep, rumbling basslines",
  // Wikipedia/AllMusic). Exact numbers [CHOSEN].
  registers: { bass: [28, 43], keys: [48, 67], counter: [45, 64],
               themeA: [45, 69], themeB: [45, 69], themeC: [45, 69] },
               // themeB == themeA == themeC deliberately: no hook register lift.

  /* ── stage 5: performance ─────────────────────────────────────────────── */
  groove: {
    styles: [["even", 10]],      // [corpus:hawtin] machine time. Never dilla.

    // [corpus:roland] TR-909 shuffle setting 1 "gives no effect". [corpus:attack]
    // list Spastik's swing as "Manual" — individual 32nds nudged by hand, not a
    // global shuffle. So: straight, with a 0..0.06 ratio range = 0..6.9 ms of
    // lean at 127 bpm [computed]. The range is [CHOSEN]; the base 1.00 is not.
    swing: [1.00, 0.06],

    snareEarly: [0, 0],          // dilla-only, must exist so the draw runs [Law 7]
    kickLate:   [0, 0],          // same
    hatMul:     1.0,             // [theory] no hat/kit friction: same clock

    // [corpus:hawtin, converted to a number by ME — the 1.5 ms is [CHOSEN]]
    // "In those early days I would let each machine go... Each one had its own
    // processor and interpretation of timing that somehow created the funk or
    // feeling of tracks like Gak." THIS IS THE GROOVE SOURCE FOR THIS GENRE.
    // MK2's jitter is per-NOTE and wanders; machine drift is a per-MACHINE
    // CONSTANT. See `laneLean` below and the architecture notes.
    jitter: { even: 0.0015, dilla: 0.0015 },

    push: 0.0,                   // [theory] a machine does not lean early

    // *** PROPOSED, NO READER YET. The correct model for this genre's
    // micro-timing: a fixed per-lane offset in seconds, drawn once per song,
    // applied identically every bar — generalising snareEarly/kickLate into a
    // map. All values [CHOSEN]; the SHAPE is [corpus:hawtin]. ***
    laneLean: { kick: 0.000, hat: +0.0035, openhat: -0.0025,
                ghost: +0.0060, snare: +0.0040 },
  },

  // [CHOSEN]. bassArtic multiplies note duration: 0.45 = the 303's default clipped
  // note, 1.6 = a slide/legato tie. The 3-way weighting stands in for the 303's
  // slide flag, which MK2 has no representation for.
  touch: { bassArtic: [[0.45, 5], [0.9, 3], [1.6, 2]], strum: [0, 0] },
                                  // strum MUST be zero: machines do not roll chords

  /* ── stage 6: space ───────────────────────────────────────────────────── */
  // [CHOSEN]. Against lofi's 0.16. Justified in kind (not in number) by
  // [corpus:hawtin]: Consumed was "delays and reverbs, and effects more than
  // anything else... an architecture of sound"; Sheet One had "delays on the
  // reverbs, and reverbs on the delays". MK2 has ONE reverb send and NO delay,
  // so this single number is carrying the entire signature. It cannot.
  space: { wet: 0.34, toneTilt: -1.5 },   // toneTilt dB/oct, NO READER [GUESS]

  /* ── requested descriptive fields. NO STAGE READS THESE YET. ───────────── */
  bassStyle:    "sub_drone",   // one or two pitches, long, under everything.
                               // [corpus:hawtin/Wikipedia: Consumed is "driven
                               // largely by deep, rumbling basslines"]
  keysStyle:    "wash",        // sustained pad, no comping, no strum, no rhythm.
                               // [corpus:hawtin] Wavestation A/D "used as an FX
                               // box, and for some pads... not for musical content"
  leadStyle:    "acid_ostinato", // 16 steps, 1-3 pitches, octave jumps, accents,
                               // slides, REPEATED IDENTICALLY. Never phrased.
                               // [corpus:hawtin] "melodies are more rhythmical
                               // than musical"
  counterStyle: "echo",        // sparse, low, sounds like a delay tail [CHOSEN]

  palette: {
    voices: ["kick808", "rim909", "hat909", "openhat909",
             "subDrone", "washPad", "acid303"],
    // RIG row this genre needs (RIG is a global const; adding a row is a widening):
    //   plastik: { kick:"kick808", snare:"rim909", ghost:"rim909",
    //              hat:"hat909", openhat:"openhat909",
    //              bass:"subDrone", keys:"washPad",
    //              lead:"acid303", counter:"acid303" }

    // *** THE ONE NEW VOICE. Without it the person playing it will not name this genre. ***
    // V.acid303 = (g, ev, t) => [nodes]
    //   osc:       sawtooth (weight 6) or square (weight 4)          [CHOSEN]
    //   filter:    resonant lowpass, Q 12..18                        [CHOSEN]
    //              (the real TB-303 filter is a 3-pole 18 dB/oct diode ladder —
    //               [UNVERIFIED this session]; MK2 would cascade two biquads,
    //               which is 24 dB/oct and audibly wrong at high Q. Say so.)
    //   cutoff:    base 260 Hz, +envMod on each note-on, exp decay 0.18..0.55 s
    //                                                                [CHOSEN]
    //   accent:    ev.gain > 0.9 raises BOTH level and envMod depth
    //              [corpus:roland-family — accent on the 303 "increases the
    //               volume and filter envelope depth"]
    //   slide:     when the previous note is still ringing, ramp frequency
    //              rather than retrigger                             [theory]
    // Everything numeric in this voice is [CHOSEN] and needs a play.
  },

  /* ── the raw measurement, so nobody has to trust my summary ───────────── */
  _measured: {
    source: "MusicBrainz WS/2 (durations) + AcousticBrainz low-level, Essentia " +
            "beat tracker. Fetched this session. n=49 recordings.",
    caveat: "Essentia octave-errors on sparse ambient material. Ekko 62.4 and " +
            "Rekall 69.9 are almost certainly half of ~125/~140. Passage (In) " +
            "152.0 over a 55-second drone is noise. Cross-checked two tracks " +
            "against songbpm independently: Plastique 106.9 vs 107, " +
            "Helikopter 137.9 vs 138 — agreement, so the low Musik figures " +
            "are real, not artefacts.",
    bpmByRecord: {                                   // median, dancefloor tracks
      sheetOne: 127.8, musik: 106.9, consumed: 122.0, closer: 128.0,
      artifakts: 125.1, spastik: 126.3,
    },
    barsFullTracks: { n: 42, median: 233, q1: 156, q3: 332, min: 62, max: 624 },
    keyDetection:   { minor: 22, major: 20, medianKeyStrength: 0.55,
                      reading: "no functional harmony to detect" },
    onsetRate:      { median: 4.09, min: 0.24, max: 8.40 },  // onsets/sec, Essentia
  },

  /* ── the alternative record. Musik (1994) is a different tempo animal and
     may deserve its own key rather than being averaged into this one. ───── */
  _musikVariant: {
    tempo: [100, 112],   // [corpus:mb+ab] measured per track: Konception 100.6,
                         // Lasttrak 101.9, Plastique 106.9, Outbak 107.3,
                         // Kriket 108.3, Ethnik 97.9, Plasmatik 94.9,
                         // Goo 119.9, Marbles 120.0, Fuk 128.7. median 106.9.
    note: "Everything else in this table stands. Only the tempo band moves.",
  },
}
```

## What MK2's architecture cannot express

- *** 88-BAR HARD CEILING. PROVEN, NOT SUSPECTED. *** I extracted makeForm from the shipped file, gave it target [224,4,32] (the measured interquartile range), and ran 3000 seeds. Result: 84 bars (2706 seeds) or 88 bars (294 seeds). Nothing else is reachable. At 127 bpm that is a 2:46 maximum. The measured Plastikman full track is 233 bars median (~7:20), IQR 156-332, and the SHORTEST full track in the catalogue (Lost, 156 bars) is still nearly twice what MK2 can build. Cause: stage 2's `for(let guard = 0; guard < 10; guard++)` bounds the section count at 10, and SECTION_LEN is a GLOBAL CONST (intro 4, verse 8, ...) that no genre table can reach. 4 + 10x8 + 4 = 88. This is a table hole, not an architecture hole — move SECTION_LEN and the guard bound into GENRE and it closes. But until it moves, the genre is unbuildable at any length that would let the person playing it recognise it.

- *** THE RULE OF THREE FORBIDS THE GENRE OUTRIGHT. PROVEN. *** I set transitions to a single self-repeating function — the literal minimal-techno gesture, 'state it and keep stating it' — and ran 300 seeds. 300 of 300 produce a form that trips `throw new Error("rule of three broken: " + form[i].fn + " x3")` at the composeSong seam check. Not a warning: a build failure. And makeForm emitted 7.4 `vary` demands per song, meaning the architecture actively DEMANDS variation, on average seven times per track, from a genre whose entire identity is refusing it. The rule of three is enforced twice — in stage 2's law (`to === fn && consec ? 0`) and again as a throw — and neither location is reachable from a table. THIS IS THE HOLE. The rule of three is a law about POP FORM that has been installed as a law about ALL form. It is correct for lofi, city pop, synthwave. It is exactly wrong here.

- *** MK2 HAS NO FORM MODEL FOR THIS MUSIC, AND ONE CANNOT BE EXPRESSED AS WEIGHTS. *** What minimal techno's form actually is, in Hawtin's own description of how he made these records: 'turning it all on, and doing most of the construction and the arrangement live by moving faders and muting or turning things on the machines' (RBMA 2013). That is a MUTE MATRIX OVER TIME. Formally: N layers (kick, closed hat, open hat, rimshot, clap A, clap B, 303-A, 303-B, sub, wash), each with an entry bar and an exit bar snapped to a 16- or 32-bar grid; AT MOST ONE layer changes state per boundary; no named sections, no return, no recapitulation, no payoff. Stage 2 draws a SEQUENCE OF FUNCTION LABELS from a Markov table. There is no way to write 'the open hat enters at bar 33 and never leaves' in any weighting of that grammar, because the grammar's atom is a labelled span, not a layer state. You cannot paper this over with names. THE HONEST FIX is a second form MODEL, selected by a table field (formModel: "sections" | "layers"), with both models genre-agnostic and both feeding stage 4 the same section-shaped output. That is a widening if and only if the layer model is written generically. If it ships as `if (genre === "plastikman")` anywhere in stages 2-5, the law is broken and you should refuse the genre instead.

- *** NO CONTINUOUS PARAMETER AUTOMATION ANYWHERE IN THE PIPELINE. *** This is the genre's principal gesture and MK2 has no place to put it. A Plastikman track changes by moving ONE KNOB slowly across 32-64 bars while every note stays identical: a filter cutoff opening, a delay feedback climbing, a resonance rising. MK2's only time-varying quantity is `sec.energy`, which is a step function per section and multiplies GAIN, nothing else. Stage 6 voices are `V.<name> = (g, ev, t) => [nodes]` — they receive one event and a start time, with no track position, no section progress, and no automation lane. Consequence: the generator can only add and remove NOTES, and this is a genre that changes almost nothing but TIMBRE. Even a perfect table produces four minutes of an unchanging loop. This needs a real addition: a per-song automation lane (name, target, from, to, startBar, endBar) written in stage 5 and read by stage 6 voices. There is no way to fake it with weights.

- *** 32ND NOTES DO NOT EXIST. THE CANONICAL SINGLE IS UNWRITABLE. *** 'Spastik' is defined by its 32nd-note snare roll — Attack Magazine's dissection is built around it, Wikipedia describes the track as 'a nine-minute whirlwind of Roland TR-808 percussion', and Hawtin names 'the snares that were on Spastik' as the thing Helikopter shares with it. MK2's grid is 16 INTEGER steps per bar and the seam check throws on `n.step < 0 || n.step > 15`. The genre's most famous figure cannot be represented at all. Fixing this is not a table change: it is a grid resolution change touching stage 3, stage 5 and the MIDI export.

- *** DRUM_ACCENT IS A HUMAN DRUMMER AND IT IS HARDCODED INTO THE GAIN FORMULA. *** `const DRUM_ACCENT` sits in stage 5 as a global, described as 'median velocities from 1,150 human performances', and it multiplies EVERY note of EVERY genre. The hat row alternates 0.92 / 0.53 / 0.87 / 0.69 across the sixteenths — that is a human wrist. A TR-909's dynamics are a per-step BINARY accent lane plus a global TOTAL ACCENT knob (Roland TR-909 Owner's Manual: 'It is possible to write accent data independently to Bass Drum, Snare Drum, Low, Mid, and Hi Toms and Closed Hi-hat, as well as Total accent to all the voices within each step'). Handing a 909 a human hat curve makes the machine breathe, which is the single fastest way to stop sounding like this genre. DRUM_ACCENT must move into GENRE. Until it does, no table can stop the drum machine from swaying.

- *** ROLES IS A HARDCODED CONST IN STAGE 4 AND IT IS BACKWARDS FOR TECHNO. *** `intro: ["keys", "bass"]` — the techno intro is DRUMS ALONE, for DJ mixing, and nothing else. `bridge: ["bass", "keys", "lead"]` with the comment 'the kit sits out the departure' — the techno breakdown does the opposite: it keeps the percussion and drops the melodic content, or drops the kick and keeps the top. A genre cannot say which roles play in which section. This is a table hole (move ROLES into GENRE), but it is a large one: with it unmoved, every generated track opens on a pad and drops the drums for its breakdown, which is a pop-ballad shape.

- *** THE MATERIALS FAMILY IS THE WRONG SHAPE AND HAS NO OFF SWITCH. *** Stage 3 unconditionally builds B = hook(A) ('a tune built from A's opening intervals inverted; denser keys; a 2-bar phrase stated twice') and C = depart(A) ('the one member allowed to leave the progression; A's theme rhythm AUGMENTED'). This genre has ONE material. It has no hook and no departure — Hawtin on Consumed: 'a year of subtraction'. I can degenerate the progressions so C's harmony equals A's, but buildTheme and buildKeys still restructure the RHYTHM, so B and C will always sound like a different section. There is no table switch for 'B = A' or 'C = A with two layers muted'. The genre needs the material family to be a LAYER SUBSET operation, not a transformation.

- *** buildTheme PHRASES LIKE A TUNE AND ITS SHAPE IS NOT IN THE TABLE. *** Fixed 2-bar phrases, a hardcoded 'breath' bar, an `onsetPool` literal inside the function. A 303 line is a 16-step ostinato with octave jumps, accents and slides, repeated identically for minutes. Hawtin: 'Sometimes my melodies are more rhythmical than musical.' Nothing in the genre table reaches the phrasing logic, so every generated Plastikman track will have a melody that breathes and answers itself — which is a tune, and this genre does not have one.

- *** inKey THROWS ON CHROMATIC NOTES, AND ACID LINES ARE CHROMATIC. *** The seam check `if(!inKey(chart.root, chart.mode, n.pitch)) throw new Error("out of key")` makes a genuine 303 line a build failure. Acid basslines routinely use chromatic passing notes; that is a large part of why they sound the way they do. Either the genre table needs to declare a chromatic pitch set, or `inKey` needs to be a per-genre predicate. As shipped, the correct notes are illegal.

- *** ONE OPEN HAT PER BAR. *** `openSpot` is a single drawn step and `openBars` gates which bars it appears in. Techno wants the open hat on steps 2, 6, 10 AND 14 in EVERY bar — the offbeat 'tss' is half the genre's forward motion. Four hits per bar in one lane are not expressible. Minor next to the others, but it is audible in four bars.

- *** NO DELAY BUS. *** The graph has exactly one reverb send, low-cut at 200 Hz. Hawtin's stated trademark, verbatim: 'I never use EFX returns. I always use master channels on the console so there are always slight feedback loops. Then I like to have delays on the reverbs, and reverbs on the delays. I like it when things continue to wash and percolate.' And on Consumed: 'an album of feedback. Everything was cross-modulating everything else.' A tempo-synced, filtered, feeding-back delay is not a number a table can hold — it is a stage-6 bus that does not exist. `space: { wet: 0.34 }` is being asked to carry a signature it physically cannot.

- *** THE LANE VOCABULARY IS TOO SMALL. *** Lanes are fixed at kick / snare / ghost / hat / openhat by RIG, GM_DRUM and DRUM_ACCENT. Hawtin on Sheet One: 'I always liked to have two different types of claps, and I was always into really small rimshots' — so this genre needs rimshot, clapA, clapB as distinct lanes, plus toms ('You've got 808 and 606, and double kicks and toms' on Helikopter). Adding lanes means touching three global consts. Table widening, but three places.

- *** `pocket` IS SHARED BY KICK, BASS AND KEYS. *** Setting pocket [0,4,8,12] to get four-on-the-floor also puts the bass and the comp on 0/4/8/12. In this genre the kick is on the quarters and the 303 is emphatically NOT — the whole point of the acid line is that it lands between the kick hits. One object cannot own both. This is the same coupling the file already documents for lofi ('pinning the pocket used to change bass PITCHES'), surfacing again in a genre where the kick and the lead have no reason to agree.

- *** MODES LACKS PHRYGIAN. *** `const MODES` has only minor, dorian, major. The b2 is the acid-techno colour. Adding [0,1,3,5,7,8,10] is a clean genre-agnostic widening, but it is a change outside the genre table and should be done deliberately rather than discovered at runtime.


## Numbers the researcher flagged as UNCERTAIN

- EVERY number in `modes`. Essentia's key detector split the catalogue minor 22 / major 20 with median key_strength 0.55 across 42 tracks — that is a coin flip, and it is EVIDENCE THAT THERE IS NO KEY TO MEASURE. The weights [minor 6, phrygian 3, dorian 1] are my taste call from theory. They are not measured. Nobody should cite them as such.

- EVERY number in `progressions` and `bridgeProgressions`. I did not transcribe a single Plastikman chord. The all-tonic drone is defensible from the key-strength failure plus Hawtin's 'melodies are more rhythmical than musical', but the 8/2/1 and 9/1 weights and the choice of degree 5 / 1 / 3 as the rare non-tonic bar are [CHOSEN].

- `swing` range 0.06 (the ratio spread above 1.00). The BASE of 1.00 is grounded — TR-909 shuffle setting 1 'gives no effect' [Roland manual], and Attack list Spastik's swing as 'Manual'. The 0.06 spread is mine.

- `jitter.even: 0.0015` (1.5 ms). Hawtin's statement that each machine 'had its own processor and interpretation of timing' is documented; the MILLISECOND VALUE is not. I found no measurement of DIN-sync or MIDI drift on a 606/808/303 chain. Pure [CHOSEN]. Worse: MK2's jitter is per-NOTE and wanders, while machine drift is a per-MACHINE constant — so even the right number would be applied wrongly.

- The whole `laneLean` map. Shape justified by Hawtin; every value invented by me.

- `space.wet: 0.34` and `space.toneTilt: -1.5`. I found no reverb measurement of any kind. 0.34 is a guess that this genre wants roughly twice lofi's wash.

- `hatVel: 0.55`, `counter.density: 0.22`, `counter.intervals`, `touch.bassArtic` weights, all `energy` values, all `registers` bounds, all `openSpot` weights, the `pocket` second entry, and every weight in `transitions`. All [CHOSEN].

- The V.acid303 numbers: base cutoff 260 Hz, Q 12-18, decay 0.18-0.55 s, saw/square 6:4. All [CHOSEN]. I did NOT verify the TB-303's filter topology (commonly given as a 3-pole 18 dB/oct diode ladder) from a primary source this session — marked [UNVERIFIED] in the table. If you cascade two biquads you get 24 dB/oct, which at Q 15 is audibly not a 303.

- The proposed dub-delay parameters are so uncertain I left them OUT of the table entirely. I could not find a documented delay time, feedback amount or filter setting for any Plastikman record. Hawtin names the boxes (Ensoniq DP/4 on Sheet One; 'legacy effects... Lexicon and Eventides' later; a BEL BD80 appears in a forum, unverified) but no settings. If you want a starting point it would be 3/16 sync, feedback ~0.55, HPF 300 / LPF 3500 — that is [GUESS] and nothing more.

- The TR-909 shuffle tick figures (level k delays every even 16th by k x 2/96 of a beat, i.e. 9.8 ms per level at 127 bpm) came from a SEARCH SUMMARY of a modwiggler/KVR thread that returned 403 when I tried to fetch it. The Roland manual (which I DID read in full) confirms 7 shuffle levels at the 16th scale with level 1 = no effect, but not the tick values. Treat the per-level milliseconds as unverified.

- Attack Magazine's Spastik dissection is a RECREATION and says so in the article: 'The objective is to analyze drum programming techniques, not to recreate the artist's beat exactly.' Its 127 BPM, its 82 Hz kick highpass, its -36 dB reversed 707 open hat and its bar-3 drop are Attack's choices for a track IN THE STYLE OF Spastik, not measurements of Hawtin's record. I used it only for the FIGURE (four-on-the-floor kick, 16th closed hat, 32nd snare roll), which is corroborated by Hawtin's own gear account.

- Musik's low measured tempos (median 106.9) surprised me and I chased them: two tracks cross-check against songbpm to within 1 BPM, so the numbers are real. But I have no independent confirmation that Musik is a slower record BY DESIGN rather than by half-time detection on dub-heavy material. That is why it is broken out as `_musikVariant` rather than folded into the main band.

- I did NOT measure the thing the brief asked for most directly: how long an element stays unchanged, in bars. I have Hawtin's process ('jamming out live... moving faders and muting or turning things on the machines'), the 40-minute source jams cut to 11 minutes, and the derived total bar counts — but no bar-level entry/exit map for any actual track. The '16 or 32 bars per change' figure in the architecture notes is from generic techno production guides, not from these records. Getting this right needs someone to sit with a DAW and Sheet One and write down the bar numbers.


## Sources

- https://www.musicradar.com/news/tech/classic-album-richie-hawtin-on-plastikmans-sheet-one-633433

- https://www.musicradar.com/news/tech/richie-hawtin-talks-old-school-techno-and-thinking-inside-the-box-612342

- https://www.attackmagazine.com/technique/beat-dissected/spastik-style-percussive-techno/

- https://www.redbullmusicacademy.com/lectures/richie-hawtin-2013-lecture/

- https://www.15questions.net/interview/richie-hawtin-plastikman-about-technology-collaboration-and-consumed-key/page-1/

- https://technomusicnews.livejournal.com/9774.html

- https://en.wikipedia.org/wiki/Spastik

- https://en.wikipedia.org/wiki/Sheet_One

- https://en.wikipedia.org/wiki/Consumed_(Plastikman_album)

- https://archive.org/stream/synthmanual-roland-tr-909-owners-manual/rolandtr-909ownersmanual_djvu.txt

- https://songbpm.com/@plastikman/spastik

- https://songbpm.com/@plastikman/glob

- https://songbpm.com/@plastikman/consumed---original-mix

- https://songbpm.com/@plastikman/plastique

- https://songbpm.com/@plastikman/helikopter

- https://musicbrainz.org/ws/2/release-group/?query=artist:plastikman

- https://musicbrainz.org/ws/2/release/?release-group=b91a151c-349e-3337-86b9-1090c0e3a288&inc=recordings

- https://acousticbrainz.org/api/v1/low-level

- https://www.otaviosantiago.com/post/techno-track-structure

- https://www.kvraudio.com/forum/viewtopic.php?t=133037
