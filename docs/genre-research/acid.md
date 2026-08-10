# acid house

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

Two things, and if either is missing nobody names the genre:

(1) A MONOPHONIC 16TH-NOTE BASS LINE WHOSE FILTER IS MOVING WHILE THE NOTES DO NOT. The TB-303's pattern is short — the peer-reviewed content analysis of the Acid Pattern community found "very few patterns were more than 1 bar" (Davis, TENOR 2019) — and Wikipedia's acid house entry states the sound is made "by raising the filter resonance and lowering the cutoff frequency of the synthesizer, along with programming the 303's accent, slide, and octave parameters," creating variation "in otherwise simple bass patterns." A high-resonance 24 dB/oct lowpass is retriggered by a decay envelope on EVERY note (env decay 200 ms–2 s, Decay pot), so each note has its own little downward filter sweep; ACCENTED notes are louder AND brighter AND have their decay forced to a fixed 200 ms, and the accent sweep capacitor does not fully discharge between hits, so two or three accents in a row ramp progressively brighter (Robin Whittle, firstpr.com.au). That per-note "wapp" plus the slow hand-move of cutoff/resonance across 32 bars IS the genre.

(2) SLIDE. Portamento between adjacent steps, ~60 ms constant-time, written on the FIRST of the two notes, and it does not work across a rest (Roland TB-303 owner's manual). Combined with the per-step octave-up/down button it produces the octave smear that MusicRadar calls "the overt 'bends' that are a distinctive feature of acid basslines."

Everything else — four-on-the-floor kick, clap on 2 and 4, offbeat open hat — is house, not acid. Take the slide and the moving cutoff away and a 16th-note minor bassline over a 122 BPM four-four is just house. Put them back and you get it in one bar, let alone four.

THREE CORRECTIONS TO THE BRIEF, because you asked me not to nod along:
- The filter is NOT 18 dB/oct. Roland marketed it that way and MusicRadar still repeats it, but Tim Stinchcombe measured it four independent ways (section count, SPICE at -24.1 dB/oct, transfer function s^4, plotted response at -23.9 dB/oct): it is a 4-pole, 24 dB/octave diode ladder. Build it as TWO cascaded biquad lowpass sections, not one and a half.
- Phuture's "Acid Tracks" was not a 909/808 record. It was a TB-303 driving a Roland TR-707 and TR-727 (Roland's own DJ Pierre article; MusicRadar). The 909 arrives later — Hardfloor's "Acperience 1" is three 303s and a TR-909, Josh Wink's "Higher State" is two stock 303s and a 909. Adonis's "No Way Back" is 808. So the kit table should be a 707/808/909 draw, not "909/808".
- Plastikman "Spastik" is not an acid track and it is not 135 BPM. Hawtin: "a 909 and 808 drum machine. Probably some 707 in there." It is a drum-machine-only piece with no 303, and songbpm/Beatport put it at 126. If you want Hawtin's acid, it is "Sheet One" (1993); "Consumed" (1998) is ~119-120 and is ambient techno, not acid.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   ACID HOUSE — genre table for GENRE{}.
   Provenance key: [corpus:<src>] measured / documented at a named source.
                   [theory] music-theory or machine fact.
                   [CHOSEN] taste, awaiting an A/B render.
                   [GUESS] I could not find a number. It is a placeholder and
                           it is LABELLED so nobody mistakes it for a measurement.

   THE TEMPO EVIDENCE, named records, so you can argue with the band:
     118  A Guy Called Gerald "Voodoo Ray" (1988, Rham!)  — 303 + TR-808 + Akai S950
     120  Phuture "Acid Tracks" (1987, Trax) — 303 + TR-707 + TR-727. Cut from a
          ~128-130 demo; Marshall Jefferson slowed it to 120 so Chicago DJs could
          open with it: "if a DJ wanted to play it faster, they could speed up the
          record."  [corpus:wikipedia/Acid_Tracks]
     122  Attack Magazine's "Armando-Style Acid House" beat dissection, stated tempo
     125  Adonis "No Way Back" (1986, Trax) — TR-808, basslines written first
     125  Hardfloor "Acperience 1" (1992, Harthouse) — THREE TB-303s + TR-909
     126  Josh Wink "Higher State of Consciousness" (1995, Strictly Rhythm) —
          TWO stock unmodified TB-303s + TR-909
     129  Attack Magazine's acid-bassline tutorial working tempo
   Hull = 118..129. mixgraph.io publishes 118-128 with a 123 reference point but
   states outright it is "editorial convention," not measured — so it is a
   corroboration, not a source.
   ═══════════════════════════════════════════════════════════════════════════ */

/* PREREQUISITE — one addition to the global MODES table. Not a genre special
   case: it is a mode, and it belongs where the other modes live. [theory] */
// MODES.phrygian = [0,1,3,5,7,8,10];

acid: {
  label: "acid house",

  /* ── stage 1: identity ─────────────────────────────────────────────────── */
  tempo: [118, 128],        // hull of the records listed above, trimmed of the 129
                            // tutorial outlier. Uniform draw -> median 123.
                            // [corpus: named records, sources in the header]
                            // NOT this genre: acid TECHNO (Hardfloor's own later
                            // work, the London Stay Up Forever school) runs 135-150.
                            // That is a SEPARATE genre key. Do not widen this band
                            // to cover it or you get a table that means nothing.

  /* No measured mode distribution for acid house exists that I could find, and I
     will not invent one. What IS documented is that mode barely matters here:
     Wikipedia describes the genre as minimalist, emphasising "texture over
     melody." These weights are my verdict, stated as such. Minor dominates because
     every description of the genre reaches for "dark/menacing"; phrygian earns
     its 3 because a 303 line is written by walking semitones off a root and the
     b2 is the neighbour you hit first. */
  modes: [["minor", 6],      // [CHOSEN]
          ["phrygian", 3],   // [CHOSEN] — requires MODES.phrygian above
          ["dorian", 1],     // [CHOSEN]
          ["major", 0]],     // [theory] acid in major is not a thing; the draw
                             // still RUNS, it just never wins. [Law 7]

  rig: [["band", 10],        // [theory] the YM2612 rig has no 303 and no analog
        ["sega", 0]],        // ladder filter. Weight 0, draw still runs.

  /* stage 1 reads these unconditionally, so acid must supply them or crash.
     They are lofi's fields and acid barely uses them. Flagged in the gaps. */
  keysChar: [["rhodes", 1]],                       // [theory] dead draw; acid has
                                                   // no e-piano. One entry so the
                                                   // draw is total-ordered.
  tape: { wow:     [0.0002, 0.0003],   // [CHOSEN] a 303's VCO drifts slightly; near-zero
          crackle: [0.0015, 0.0015] }, // [CHOSEN] acid house is a VINYL genre (Trax
                                       // pressings were famously filthy) but the
                                       // record is not the tape hiss of lofi.

  /* ── stage 2: form ─────────────────────────────────────────────────────── */
  /* DOCUMENTED LENGTHS of the canon, which is what sets `target`:
       Acid Tracks   12:16   [corpus:wikipedia]
       Consumed      11:40   [corpus:wikipedia] (Hawtin, not acid, but the length habit)
       Acperience 1  ~9:00   "a nine-minute composition featuring a gradual
                             buildup" [corpus:fazemag Track-Check interview]
       Spastik       ~9:00   [corpus:insomniac]
       HSOC (orig)   ~6:00   [corpus:articles.roland.com]
     target [160,6,32] -> 160/192/224/256/288/320 bars.
     At the median 123 BPM that is 5:12 .. 10:24. It reaches Acperience and
     Spastik. It does NOT reach Acid Tracks' 12:16 — see the gaps. */
  form: {
    coldOpen:  0.05,          // [corpus:fazemag/attackmagazine — acid records are
                              // DJ tools; they open on drums so they can be mixed
                              // in. A cold open is close to disqualifying.]
    openVerse: 0.95,          // [CHOSEN] after the drum intro the 303 enters; it does
                              // not open on the peak.
    target:    [160, 6, 32],  // [corpus: the durations above]

    /* THE TRANSITION TABLE IS WHERE ACID FIGHTS THE ARCHITECTURE. verse->verse
       carries the top weight ON PURPOSE: an acid record states the same 32-bar
       state four, five, six times running and the CHANGE IS IN THE KNOBS.
       Stage 2 zeroes a function's own weight after two consecutive statements
       (the rule of three). For this genre that law is wrong and it will keep
       forcing a section change acid does not want. See the gaps. [CHOSEN] */
    transitions: {
      verse:        [["verse", 5], ["chorus", 4], ["bridge", 2], ["instrumental", 2]],
      chorus:       [["verse", 4], ["chorus", 3], ["bridge", 4], ["instrumental", 2]],
      bridge:       [["chorus", 7], ["verse", 3]],   // the breakdown resolves UP
      instrumental: [["verse", 5], ["chorus", 5]],
    },
    bridgeAfterChorus: { verse: 1, chorus: 1 },   // [CHOSEN] the acid breakdown can
                                                  // come early; it is not a bridge
                                                  // in the song sense.
    /* the acid energy curve: the breakdown is the QUIETEST thing in the record,
       quieter than the intro, because the kick leaves. All [CHOSEN]. */
    energy: { intro: 0.45, outro: 0.40, bridge: 0.42, instrumental: 0.72,
              chorus: 0.94, chorusPeak: 1.00, verse: 0.80 },
  },

  /* ── stage 3: materials ────────────────────────────────────────────────── */
  /* FOUR ON THE FLOOR. Wikipedia acid house: "programmed four-on-the-floor 4/4
     beat." Attack Magazine's Armando dissection: "a four-to-the-floor ... on all
     four quarter-note beats (16th steps 1,5,9,13)" — 0-indexed 0,4,8,12.
     [corpus:wikipedia + corpus:attackmagazine] */
  pocket: [[[0, 4, 8, 12],     9],    // [corpus:attackmagazine] the law
           [[0, 4, 8, 12, 14], 1]],   // [CHOSEN] the pickup kick before the bar
  kit: {
    snare: [4, 12],        // THE CLAP, on 2 and 4. Attack: "the claps sit on the
                           // 2nd and 4th beat of every bar ... program it to play
                           // on steps 5 and 13" (1-indexed) = 4 and 12.
                           // [corpus:attackmagazine]
    hatEvery: 2,           // [CHOSEN] 8ths as the base. Attack's Armando recreation
                           // says "a straightforward 16th-note pattern" for closed
                           // hats; the 707-era Chicago records more often ride
                           // 8ths. I made 16ths the `lift` variant instead of the
                           // base. This is a coin-flip I could not settle from
                           // sources — it is [CHOSEN], not measured.
    hatVel: 0.58,          // [CHOSEN]
    ghostChance: 0.45,     // [corpus:attackmagazine for the CONCEPT — the rim shot
                           // "fills in spaces between the main kick and open hi-hat
                           // hits, catching them only occasionally"; 0.45 is [CHOSEN]]
    ghostSpots: [3, 7, 11, 15, 6, 14],   // [CHOSEN] odd 16ths + the late offbeats,
                                         // i.e. exactly "between the kick and the
                                         // open hat"
    openSpot: [[2, 4], [6, 3], [10, 2], [14, 3]],
                           // THE OFFBEAT OPEN HAT — the second most identifying
                           // element after the 303. Attack: open hi-hat "playing
                           // on the off beats." Gearspace/909-house: "kick, off
                           // beat open high hat, clap/snare on 2 and 4."
                           // [corpus:attackmagazine + corpus:gearspace]
                           // MK2 can only place ONE open hat per bar, so this is
                           // a weighted draw over WHICH offbeat. The genre wants
                           // ALL FOUR (2,6,10,14) every bar. See the gaps.
    openBars: [0, 1, 2, 3],   // [corpus] every bar, not a sometimes-thing
    kickKeep: 4,              // [corpus] all four kicks, always
    flourishBar: 2,           // Attack: "the first tambourine hit coming in on the
    flourish: [[[15], 5],     // last 16th-note of the third bar" = bar index 2,
               [[14, 15], 3], // step 15. [corpus:attackmagazine]
               [[], 2]],      // the empty option is [CHOSEN]
    variants: {
      main:   {},
      lift:   { hatEvery: 1, ghostChance: 0.70, hatVel: 0.64 },
              // [corpus:attackmagazine — the peak rides 16ths]
      depart: { kickKeep: 0, snare: [], hatEvery: 2, ghostChance: 0.20,
                openBars: [1, 3], flourish: [[[], 1]] },
              // THE BREAKDOWN: the kick LEAVES and the hats and the 303 stay.
              // kickKeep 0 -> pocket.slice(0,0) -> no kick. [CHOSEN for the exact
              // residue; the mechanism — drop the kick, keep the acid — is
              // universal in the genre.]
    },
  },

  /* the second 303. Hardfloor ran THREE on "Acperience 1"; Josh Wink ran TWO on
     "Higher State." A second acid line is not a countermelody, it is the SAME
     instrument an octave or a fifth away, sounding on some of the notes.
     [corpus:fazemag + corpus:articles.roland.com] */
  counter: { density:   0.35,             // [CHOSEN]
             intervals: [-7, 7, 4, -4] }, // SCALE STEPS (stage 3 feeds these to
                                          // scaleStep, not semitones): +-7 steps
                                          // = +-1 octave, +-4 = +-a fifth.
                                          // [theory]

  /* HARMONY: THERE ISN'T ANY, AND THAT IS THE FINDING.
     Acid house is a one-chord genre. Wikipedia: minimalist, "texture over
     melody," variation produced by filter/accent/slide "in otherwise simple bass
     patterns." Hawtin on his own method: he wrote "rhythms which are kind of like
     melodies" [corpus:soundonsound]. Davis (TENOR 2019, peer-reviewed content
     analysis of the Acid Pattern community): "very few patterns were more than 1
     bar." So the progression is a drone on the tonic, and the 20% that move go to
     bVII or the b2. Writing anything richer here would be fabricating a genre
     trait to fill a field. */
  progressions: {
    minor:    [[[0,0,0,0], 8],   // [corpus:wikipedia + corpus:tenor2019]
               [[0,0,0,6], 2],   // [CHOSEN] the bVII lean
               [[0,0,5,0], 1]],  // [CHOSEN]
    phrygian: [[[0,0,0,0], 8],   // [corpus, as above]
               [[0,0,1,0], 2]],  // [CHOSEN] the bII — the phrygian tell
    dorian:   [[[0,0,0,0], 8],
               [[0,0,3,0], 2]],  // [CHOSEN]
    major:    [[[0,0,0,0], 1]],  // dead branch; modes weight is 0
  },
  /* the breakdown's "departure." In this genre the departure is TIMBRAL, not
     harmonic — you close the filter, you do not modulate. These entries exist
     only because stage 3 demands the field; they are deliberately near-identity. */
  bridgeProgressions: {
    minor:    [[[0,0,0,0], 6], [[5,5,0,0], 2]],   // [CHOSEN]
    phrygian: [[[0,0,0,0], 6], [[1,1,0,0], 2]],   // [CHOSEN]
    dorian:   [[[0,0,0,0], 6], [[3,3,0,0], 2]],   // [CHOSEN]
    major:    [[[0,0,0,0], 1]],
  },

  /* REGISTERS. The TB-303 has "one octave on the panel" plus transpose switches;
     the owner's manual claims "you can play four octaves by using the transpose
     switches," while a hardware forum measures the practical span as C(down) to
     C(up) = 3 octaves / 37 semitones. I could not reconcile those two claims, so
     the bands below are [CHOSEN] anchored to where acid lines actually sit: low,
     but played with the cutoff open so they read as a lead. bass [33,57] = A1..A3,
     two octaves — the 303's own working range. [corpus:archive.org TB-303 manual
     for the mechanism; [CHOSEN] for the MIDI numbers] */
  registers: { bass:   [33, 57],    // the acid line itself
               keys:   [52, 74],    // [CHOSEN] stab/organ if the genre uses one at all
               counter:[45, 69],    // [CHOSEN] the second 303, an octave under
               themeA: [57, 81], themeB: [57, 81], themeC: [57, 81] },  // [CHOSEN]

  /* ── stage 5: performance ──────────────────────────────────────────────── */
  groove: {
    styles: [["even", 10], ["dilla", 0]],
        // [theory] the 303's sequencer is a rigid 16-step grid — the manual:
        // "4 steps x 4 beats = 16 steps." A drum machine does not play behind
        // the beat. Dilla weight 0; the draw still runs. [Law 7]
    swing: [1.0, 0.12],
        // base 1.0 = dead straight [theory]; the 0.12 range reaches a light
        // TR-909-style shuffle [CHOSEN]. I found NO measurement of shuffle amount
        // on any acid record.
    snareEarly: [0, 0],   // [theory] machine
    kickLate:   [0, 0],   // [theory] machine
    hatMul:     1.0,      // [theory] no lane-vs-lane friction on a drum machine
    jitter: { even: 0.0012, dilla: 0.0012 },
        // [GUESS]. Attack tells you to unquantise the hats, but that is advice
        // for a DAW recreation, not a measurement of an 808/909/707 clock. 1.2 ms
        // is a placeholder. If you want this right, measure a 909.
    push: 0,              // [theory] a sequencer has no push
  },
  touch: { bassArtic: [[0.85, 8],   // THE 303 GATE. Olney: a regular gate is
                       [1.0,  2]],  // "approximately 3 clock pulses plus the
                                    // positive portion of a fourth pulse — shorter
                                    // than a full step to create staccato feel"
                                    // ~= 7/8 of a step. 1.0 = the TIED note.
                                    // [corpus:olney.ai ct-modular-book ch.13]
                                    // NOTE: stage 5 floors durSec at spb*0.9, so
                                    // 0.85 currently cannot take effect. See gaps.
           strum: [0, 0] },         // [theory] the 303 is monophonic

  space: { wet: 0.10 },   // [CHOSEN] acid is a DRY genre: the 303 goes through
                          // DISTORTION and a dotted-8th DELAY, not a hall.
                          // MusicRadar: "classic pairing: distortion (particularly
                          // analog-style overdrive or guitar pedals like Tube
                          // Screamer), plus delay and reverb." Attack's acid
                          // bassline chain: EQ -> tube saturation -> dotted eighth
                          // delay -> two reverbs with the low end rolled off.
                          // [corpus:musicradar + corpus:attackmagazine]

  /* ═════════════════════════════════════════════════════════════════════════
     EVERYTHING BELOW IS A NEW FIELD. No stage reads it today. Each one names
     the stage that must learn to read it. These are NOT optional extras — the
     first three are the genre.
     ═════════════════════════════════════════════════════════════════════════ */

  /* NEW — stage 2 must read this instead of the global SECTION_LEN const.
     Acid phrases in 16s and 32s, not 4s and 8s. The sources for this are weak
     (production-blog convention, "DJ-friendly 16-32 bar phrases"); the STRONG
     evidence is arithmetic: with SECTION_LEN's 4/8 you cannot build a 9-minute
     record inside stage 2's guard of 10 sections. [CHOSEN + arithmetic] */
  sectionLen: { intro: 16, verse: 32, chorus: 32, bridge: 16,
                instrumental: 32, outro: 16 },

  /* NEW — stage 3 must grow an acid-line builder that reads this. Today
     buildBass() places one note per POCKET hit with hardcoded
     [["root",5],["fifth",3],["rest",2]] weights. That is a lofi walking bass and
     it can never make a 303 line. */
  acidLine: {
    grid: 1,              // 16th notes. [corpus:archive.org TB-303 manual —
                          // "4 steps x 4 beats = 16 steps" in 4/4]
    patternBars: 1,       // [corpus:tenor2019 — Davis, content analysis of the
                          // Acid Pattern community: "very few patterns were more
                          // than 1 bar"] THE MATERIAL IS ONE BAR AND REPEATS.
    density: [9, 13],     // notes per 16 steps. [GUESS] — I found no count. The
                          // qualitative anchor is that acid lines are near-
                          // continuous 16ths with a couple of rests/ties.
    distinctPitches: [3, 4],
                          // "Stick within your chosen scale and try to choose 3 or
                          // 4 notes within that scale to create a pattern."
                          // [corpus:techno-music.com / musictech programming guides]
                          // This is the single most useful compositional number
                          // I found: an acid line uses THREE OR FOUR pitches.
    degreePool: [[0, 12],  // ROOT REPETITION dominates [corpus:wikipedia "simple
                 [3, 5],   // bass patterns"; every programming guide]
                 [4, 3],   // the rest of the weights are [CHOSEN]
                 [6, 3],
                 [2, 2],
                 [1, 2],   // the b2 — only reachable in phrygian
                 [5, 1]],
    rootShare: 0.45,      // [GUESS] fraction of onsets that are the tonic
    octaveUp:   0.12,     // [GUESS] per-step octave-up button rate
    octaveDown: 0.06,     // [GUESS] per-step octave-down button rate
                          // (mechanism documented: [corpus:archive.org manual,
                          //  corpus:musicradar])
    accentDensity: [0.20, 0.35],
                          // [GUESS] magnitude. Mechanism fully documented.
    slideDensity:  [0.10, 0.20],
                          // ANCHORED, not guessed: MusicRadar — "Don't overdo it
                          // with ties, slides and octave jumps — a simple,
                          // repetitive pattern livened up with one or two
                          // flourishes often works better." One or two out of
                          // ~10-13 notes = 0.10-0.20. [corpus:musicradar]
    slideOctaveShare: 0.35,
                          // of the slides, how many are octave slides. Attack:
                          // "a tied downward slide of an octave with an accent on
                          // the first note gives you that typical acid house
                          // sound"; MusicRadar: slides "work particularly well
                          // combined with octave jumps."
                          // [corpus:attackmagazine + corpus:musicradar for the
                          //  device; 0.35 is [GUESS]]
    tieDensity: 0.15,     // [GUESS] — the manual's SOUND CONTINUES flag
    restRun: [1, 2],      // [GUESS] consecutive rest length

    /* TWO HARD CONSTRUCTION RULES FROM THE PRIMARY SOURCE. These are not
       parameters, they are laws stage 3 must obey:
         1. "To slide from one note to another, write the slide on the FIRST of
            the two notes."
         2. "Slides don't work across rests."  -> a slide flag is only legal on a
            note whose IMMEDIATELY NEXT step is also a note.
       [corpus:archive.org Roland TB-303 Owner's Manual] */
  },

  /* NEW — stage 5 must write `voice` through this instead of through the global
     RIG map. Today RIG is a global lane->voice table with no genre dimension, so
     a genre literally cannot choose its own instruments. */
  palette: {
    lanes: { kick: "kick909", snare: "clap909", ghost: "rim909",
             hat: "hat909", openhat: "openhat909",
             bass: "acid303", keys: "acid303", lead: "acid303",
             counter: "acid303" },
    /* THE ONE NEW VOICE THIS GENRE NEEDS: acid303. Everything else can be faked
       with what exists; this cannot.
       (Runner-up, if you ever want a second: clap909. Acid house's backbeat is a
        CLAP, not a snare — 3-4 noise bursts ~8-12 ms apart into a ~1 kHz
        bandpass with a short noise tail. V.snare has a tuned body component and
        will read as a rock snare on 2 and 4.) */
    newVoice: "acid303",
  },

  /* NEW — the acid303 voice's parameters, read by stage 6.
     V.acid303 = (g, ev, t) => [source nodes]
       osc(saw|square) -> lp1 -> lp2 -> waveshaper(drive) -> vca -> bus
     Filter env: cutoffBase -> cutoffBase + envMod*(cutoffPeak-cutoffBase) at t,
                 exponential decay over envDecay (or accentDecay if accented). */
  acid303: {
    wave: [["saw", 6],       // [corpus:archive.org manual — WAVEFORM switch, two
           ["square", 4]],   // waveforms; MusicRadar: "saw ... harsher, square has
                             // a hollow quality." Weights [CHOSEN].
    poles: 4,                // FOUR POLES, 24 dB/OCTAVE. Measured four ways by
                             // Tim Stinchcombe: section count 4x6, SPICE gradient
                             // -24.1 dB/oct, transfer-function denominator s^4,
                             // plotted response -23.9 dB/oct. Roland's own
                             // "18 dB / 3-pole" marketing is wrong and the whole
                             // internet repeats it. Implement as TWO cascaded
                             // BiquadFilter lowpass nodes.
                             // [corpus:timstinchcombe.co.uk?pge=diode]
    resonanceQ: [8, 16],     // MusicRadar: "for a classic acid sound have this
                             // control around two-thirds clockwise at least," and
                             // the 303 gets "squelchy resonance WITHOUT pushing
                             // into self-oscillation." Mapping two-thirds of a
                             // diode ladder to a biquad Q is [CHOSEN]; the
                             // no-self-oscillation ceiling is [corpus:musicradar].
    cutoffBase: [300, 900],  // [CHOSEN] anchored to two documented figures:
    cutoffPeak: [1200, 2500],// (a) with cutoff at 0 and env mod at 0 the stock 303
                             //     spans 210 Hz - 1.7 kHz [corpus:modwiggler,
                             //     single source, treat with care];
                             // (b) the Devil Fish mod "doubled [cutoff range] to
                             //     5 kHz max," implying a stock ceiling of ~2.5 kHz
                             //     [corpus:firstpr.com.au/rwi/dfish].
                             // The manual also gives a calibration point: playing
                             // C1 (65.4 Hz), saw, cutoff 50%, resonance 100%, the
                             // resonant peak should sit at ~500 Hz +-100.
    envDecay: [0.20, 2.00],  // MEASURED: on NON-accented notes the Main Envelope
                             // Generator decay runs 200 ms to 2 s, set by the
                             // Decay pot. The manual confirms the pot moves BOTH:
                             // "Both the volume and the tone will take a longer
                             // time to fade." [corpus:devilfish docs via gearspace
                             // + corpus:archive.org manual]
    accentDecay: 0.20,       // MEASURED: on ACCENTED notes the decay is FIXED at
                             // 200 ms regardless of the pot. This is why accents
                             // sound clipped and spiky, not just loud.
                             // [corpus:devilfish docs via gearspace]
    attack: 0.003,           // MEASURED: "TB-303 attack was ~3 msec"
                             // [corpus:firstpr.com.au/rwi/dfish]
    accentLevel: 1.45,       // [GUESS] magnitude. MECHANISM documented: "the MEG
                             // voltage goes through a switch ... and then through
                             // the Accent pot" to raise the VCA control current.
                             // [corpus:firstpr.com.au/rwi/dfish/303-unique.html]
    accentCutoffMul: 2.2,    // [GUESS] magnitude. MECHANISM documented: the Accent
                             // Sweep Circuit raises filter frequency, and it is
                             // driven off the SECOND SECTION OF THE RESONANCE POT
                             // — so more resonance means more accent brightness.
                             // Modelling that coupling is worth doing.
                             // [corpus:firstpr.com.au/rwi/dfish/303-unique.html]
    accentStack: 1.35,       // [GUESS] magnitude. MECHANISM documented and it is
                             // the single most characterful thing in the machine:
                             // the sweep circuit's 1 uF cap "has not discharged
                             // fully from the one before," so "the second and
                             // subsequent response curves" go HIGHER. Consecutive
                             // accents RAMP. MusicRadar independently: "interesting
                             // 'ramping' effects when multiple Accents are chained."
                             // Model it as a per-note multiplier that compounds
                             // across an unbroken run of accents and resets on the
                             // first unaccented note.
                             // [corpus:firstpr + corpus:musicradar]
    slideSec: 0.060,         // 60 ms, constant-time portamento. Single-source
                             // ([corpus:gearspace "emulating TB-303 slide"] citing
                             // the Devil Fish documentation) — I could not get a
                             // second independent confirmation, so treat 60 as
                             // good-not-gospel. The BEHAVIOUR is primary-sourced:
                             // slide is written on the first of two notes and does
                             // not cross a rest, and the envelope does NOT
                             // retrigger on the slid-to note [corpus:archive.org
                             // manual + corpus:olney.ai — "extended gates span
                             // multiple steps when slides are active"].
    gateFrac: 0.85,          // [corpus:olney.ai] ~3.5 of 4 clock pulses per step.
    drive: [1.6, 3.2],       // [CHOSEN] magnitude. Distortion is canon:
                             // MusicRadar on HSOC — "a classic example of a 303
                             // coupled with distortion"; MusicRadar on the genre —
                             // it squealed "especially when run through
                             // distortion." [corpus:musicradar]
  },

  /* NEW — THE THING THE ARCHITECTURE CANNOT DO. Read the gaps before you build
     this. A per-SECTION-INDEX scalar (not per-function like `energy`) that walks
     the 303's cutoff and resonance from nearly-closed at the intro to wide open
     at the peak. Wikipedia's definition of the genre is literally this move:
     sound is created "by raising the filter resonance and lowering the cutoff
     frequency of the synthesizer." Without it you have the notes of acid house
     and none of acid house. [corpus:wikipedia/Acid_house; the numbers are [CHOSEN]] */
  morph: { param: "cutoff", lo: 0.12, hi: 1.00,
           resLo: 0.35, resHi: 1.00, shape: "rampToPeak" },
},
```

## What MK2's architecture cannot express

- THE BIG ONE — NO STAGE OWNS A CONTINUOUS TIMBRAL PARAMETER, AND ACID HOUSE IS A CONTINUOUS TIMBRAL PARAMETER. Wikipedia defines the genre as sound created 'by raising the filter resonance and lowering the cutoff frequency of the synthesizer.' The notes do not change; the KNOBS change, over 32-bar spans. MK2 has exactly one continuous scalar reaching stage 6: ev.gain, and stage 5 folds section energy into it as LOUDNESS. There is no per-section morph value, no automation lane, no event field for cutoff. A voice could cheat by deriving cutoff from ev.gain — but that welds brightness to loudness, which is wrong (the acid breakdown is quiet AND closed, the peak is loud AND open, but the long build is quiet AND opening). This is not a missing table entry. It is a missing CHANNEL. My recommendation: stage 4 already computes a per-section object; give it a `morph` scalar derived from the section INDEX (0..1 across the arrangement) alongside `energy`, and have stage 5 copy it onto every event as ev.morph. That is generic — every genre gets a track-position scalar — so it is a widening, not a special case.

- STAGE 5 DROPS EVERY FIELD IT DOES NOT KNOW ABOUT. makePerformance builds `ev` with a fixed literal: {tSec, durSec, voice, role, lane, gain}, plus timbre/wow for keys and pitch if present. A note carrying `accent:true`, `slide:true`, `glideTo:64` or `tie:true` from stage 3 SILENTLY VANISHES. The 303's per-step accent and slide are the two things that make the genre and neither can currently cross the stage 3 -> stage 6 boundary. Accent can partially sneak through as n.vel (stage 3 owns velocity, gain carries it) but slide cannot: portamento needs the NEXT note's pitch, which is a second field. Fix: stage 5 must pass through a declared set of note flags, or copy any key not in its own reserved set.

- STAGE 3'S NOTE GRAMMARS ARE HARDCODED LOFI, NOT TABLE-DRIVEN. buildBass() contains a literal wpick(rng, [['root',5],['fifth',3],['rest',2]]) and places one note per POCKET hit with dur 2 — that is a walking bass and it can never produce a 16th-note 303 line. buildKeys() contains a literal SYNC table. buildTheme() has a literal onsetPool of EIGHTH notes only ([0,2,4,6,8,10,12,14]) — a 303 line lives on 16ths and literally cannot be expressed. So the brief's bassStyle/keysStyle/leadStyle/counterStyle do not exist as table concepts at all: for this genre the GRAMMAR has to move into the table (onset pool, density, degree pool, accent/slide/tie rules), not just its parameters. This is the largest amount of actual work.

- `pocket` IS ONE OBJECT READ BY DRUMS, BASS AND KEYS — AND ACID'S BASS DOES NOT FOLLOW THE KICK. The comment says this is deliberate ([corpus:harvest_ensemble bass+comp co-onset 77% in real bands]). True of a band; false of a machine genre where the kick is on 0/4/8/12 and the 303 runs continuous 16ths against it. The genre needs its own bass grid independent of the kick pocket.

- DRUM_ACCENT IS A GLOBAL CONST OF MEDIAN HUMAN DRUMMER VELOCITIES AND IT IS WRONG FOR A DRUM MACHINE. It is measured from 1,150 human performances and hardcoded in stage 5, outside the genre table. Applied to a 909 it will make the machine groove like a session drummer — the kick row alone varies 0.21 to 1.00 across the bar. Acid house drums are machine-flat with PROGRAMMED accents. This must become a per-genre field (an accentMap in the kit table); everything else about it is right.

- openSpot IS A SINGLE STEP AND THE GENRE NEEDS FOUR. Attack Magazine and the 909-house convention both specify the open hi-hat on ALL the offbeats (steps 2,6,10,14) every bar. That is the second-most-identifying element of the record after the 303. MK2's kit draws ONE open-hat step per bar from a weighted list. Table fix: openSpot must accept an ARRAY of steps, e.g. openSpots: [[[2,6,10,14],7],[[6,14],2],[[14],1]] — a pure widening, no stage-2-to-5 branching.

- SECTION_LEN IS A GLOBAL CONST AND THE FORM CANNOT REACH ACID'S LENGTH. SECTION_LEN = {intro:4, verse:8, ...} plus stage 2's `for(let guard = 0; guard < 10; guard++)` caps a song at roughly 84 bars — under 3 minutes at 123 BPM. The documented canon is 6:00 (HSOC), 9:00 (Acperience 1, Spastik), 11:40 (Consumed), 12:16 (Acid Tracks). Move SECTION_LEN into the genre table (16/32) and the same 10-section guard reaches 320 bars = 10:24. Acid Tracks' 12:16 is still out of reach; either the guard becomes a table value too, or accept that the longest records are outside the model and say so.

- THE RULE OF THREE IS ACTIVELY WRONG FOR THIS GENRE, AND IT IS ENFORCED IN STAGE 2 AS A LAW, NOT A TABLE VALUE. Stage 2 zeroes a function's own weight after two consecutive statements, and composeSong THROWS on a third. Acid records state the same 32-bar groove four, five, six times running; the variation is in the filter, not the section. Worse, the `vary` demand raised at the third OCCURRENCE is answered downstream by changing NOTES (Avar) or stripping the arrangement — the two answers acid never uses. This is the clearest case where a law that is right for song-form music is wrong for loop-form music. Either the rule-of-three becomes a table-supplied law (maxConsecutive), or MK2 accepts it only builds song-shaped genres and acid house is out of scope. I would not paper over this.

- MATERIAL C = depart(A) IS DEFINED AS A HARMONIC DEPARTURE AND ACID'S DEPARTURE IS TIMBRAL. Stage 3 makes C by drawing a different progression (bridgeProgressions). Acid house is a one-chord genre; its 'bridge' is the breakdown, where the KICK LEAVES and the filter closes and the harmony does not move at all. My bridgeProgressions entries above are near-identity placeholders written only to satisfy the field. Related: stage 4's ROLES map excludes 'drums' from the bridge entirely, so the kit variant I wrote for the breakdown (kickKeep:0, keep the hats) never gets played. ROLES and MAT are hardcoded in stage 4 with no genre dimension.

- RIG IS GLOBAL, SO A GENRE CANNOT CHOOSE ITS OWN INSTRUMENTS. Stage 5 writes ev.voice through RIG[chart.rig][lane]. Adding V.acid303 means adding it to the global RIG.band map, where it would then also play lofi's bass. The `palette` field the brief asks for does not exist and cannot exist until the lane->voice lookup gains a genre dimension (genre palette first, rig as an override).

- THE REVERB SEND FEEDS KEYS AND LEAD ONLY; THE ACID LINE IS THE BASS. buildGraph connects g.bus.keys and g.bus.lead to the send, deliberately keeping the rhythm section dry. If the 303 is the bass role it gets no space at all — and the one effect acid actually needs on it is a dotted-8th DELAY, which does not exist in the graph. `space` is also read for `wet` only; the brief's `toneTilt` has no consumer. A tilt EQ on the master is a legitimate generic stage-6 addition, not a genre branch.

- THE 303'S STACCATO GATE IS UNREACHABLE. Stage 5 does durSec = Math.max(spb * 0.9, n.dur * spb * artic). The 303's normal gate is ~0.85 of a step (3 clock pulses plus part of a fourth), so any bassArtic below 0.9 is floored away. Minor, but it is exactly the difference between a 303 and a sustained synth bass.

- MODES HAS NO PHRYGIAN. Adding MODES.phrygian = [0,1,3,5,7,8,10] is a [theory] addition to a theory table, not a genre special case, so I consider this legitimate rather than a hole — but it is a prerequisite and the progressions/bridgeProgressions tables must gain a phrygian key or wpick will select a mode with no progression and stage 3 will crash on undefined.

- STAGE 1 REQUIRES LOFI-SHAPED FIELDS FROM EVERY GENRE. makeChart reads keysChar and tape.wow/tape.crackle unconditionally. Acid house has neither an e-piano nor tape wow. I supplied dead values so it loads, and the draws still run as Law 7 requires — but a genre being forced to declare another genre's character fields is a smell. The right shape is probably a per-genre `character` block whose keys stage 1 iterates, rather than named lofi properties.


## Numbers the researcher flagged as UNCERTAIN

- MODE WEIGHTS (minor 6 / phrygian 3 / dorian 1) — [CHOSEN], no measurement exists that I could find. There is no published mode distribution for acid house. Do not treat these as corpus.

- acidLine.density [9,13] notes per bar — [GUESS]. I found no note-count statistic anywhere. The only near-measurement in the literature is Davis (TENOR 2019) reporting that most Acid Pattern sheets are 1 bar, which constrains LENGTH but not DENSITY.

- acidLine.accentDensity [0.20,0.35] — [GUESS]. slideDensity [0.10,0.20] is better founded (MusicRadar's 'one or two flourishes' over a 16-step pattern), but accent rate is pure placeholder.

- acidLine.rootShare 0.45, octaveUp 0.12, octaveDown 0.06, tieDensity 0.15, restRun, slideOctaveShare 0.35 — all [GUESS]. Mechanisms are documented in the Roland manual; the RATES are not documented anywhere I could reach.

- acid303.accentLevel 1.45, accentCutoffMul 2.2, accentStack 1.35 — [GUESS] magnitudes. The circuit MECHANISM for all three is precisely documented by Robin Whittle (accent pot into VCA control current; Accent Sweep Circuit into filter frequency; 1 uF cap that does not fully discharge between consecutive accents), but no source gives dB or Hz figures. If accuracy matters, these want measuring against a real 303 or Open303.

- acid303.cutoffBase/cutoffPeak Hz endpoints — [CHOSEN]. Anchored to two figures I could not cross-check: '210 Hz to 1.7 kHz with cutoff at 0 and env mod at 0' (single forum source), and a ~2.5 kHz stock ceiling INFERRED from the Devil Fish claim that the mod 'doubled [the range] to 5 kHz max'. The manual's own calibration point (resonant peak ~500 Hz at cutoff 50%, resonance 100%, playing C1) is primary and is the number I would trust most.

- acid303.resonanceQ [8,16] — [CHOSEN]. MusicRadar's 'two-thirds clockwise at least' is a knob position, not a Q. The one hard constraint from the source is that a stock 303 does NOT self-oscillate, so the Q ceiling must sit below that.

- acid303.slideSec 0.060 — single-source ([corpus:gearspace] citing Devil Fish docs). I could not get independent confirmation; the primary manual documents slide's BEHAVIOUR but gives no time. The 60 ms figure is widely repeated, which is not the same as independently verified.

- groove.jitter 0.0012 s — [GUESS]. Attack Magazine's 'do not quantise the hats' is advice for a DAW recreation, not a measurement of an 808/909/707 clock. If you want real machine timing you have to measure a machine.

- groove.swing [1.0, 0.12] — base is [theory] (the 303 sequencer is a rigid 16-step grid per the manual), but the 0.12 shuffle range is [CHOSEN]. No source gives a shuffle amount for any acid record.

- kit.hatEvery 2 (8ths) as the base rather than 1 (16ths) — a coin flip I could not settle. Attack's Armando dissection specifies 16ths; the 707-era Chicago records often ride 8ths. Marked [CHOSEN], not measured.

- sectionLen 16/32 — [CHOSEN]. My only sources for 16-32 bar phrasing were production blogs of low reliability (some clearly SEO/AI-generated). The strong argument for it is arithmetic, not evidence: 4/8-bar sections cannot reach a 9-minute record inside stage 2's 10-section guard.

- form.energy values — all [CHOSEN].

- space.wet 0.10 — [CHOSEN]. What IS sourced is the effects TOPOLOGY (distortion + dotted-8th delay, low end rolled off the reverb send), not a wet amount.

- ALL BPM figures for Voodoo Ray (118), No Way Back (125), Acperience 1 (125), HSOC (126), Spastik (126), Consumed (119-120) come from songbpm/Tunebat, which derive from Spotify audio-features — ALGORITHMIC DETECTION, not human measurement, and songbpm and Tunebat disagree with each other on Spastik (126 vs 130). The ONLY tempo in the whole table with a documentary source is Acid Tracks at 120, because Wikipedia records that Marshall Jefferson deliberately slowed the ~128-130 demo to that number. mixgraph.io states outright that it has fewer than 10 tagged tracks and its 118-128 range is 'editorial convention,' not measured.

- I could not read two academic sources that would likely have real corpus statistics: the Organised Sound paper 'Acid Patterns' (Cambridge Core, paywalled; ResearchGate 403) and 'Along the Lines of the Roland TB-303: Three Perversions of Acid Techno' (Academia.edu 403). I only have the TENOR 2019 conference precursor. If someone can get those two PDFs, the acidLine density/accent/slide guesses above are the numbers most likely to be replaced with measurements.


## Sources

- https://en.wikipedia.org/wiki/Acid_house

- https://en.wikipedia.org/wiki/Acid_Tracks

- https://archive.org/stream/synthmanual-roland-tb-303-owners-manual/rolandtb-303ownersmanual_djvu.txt

- https://www.timstinchcombe.co.uk/index.php?pge=diode

- https://www.firstpr.com.au/rwi/dfish/303-unique.html

- https://www.firstpr.com.au/rwi/dfish/

- https://olney.ai/ct-modular-book/tb-303.html

- https://www.musicradar.com/news/producers-guide-to-the-roland-tb-303-and-clones

- https://www.musicradar.com/news/everything-you-need-to-know-about-acid-house

- https://www.musicradar.com/music-tech/10-of-the-best-roland-tb-303-tracks-of-all-time-aphex-twin-fatboy-slim-voodoo-ray-and-more

- https://www.attackmagazine.com/technique/beat-dissected/armando-acid-house/

- https://www.attackmagazine.com/technique/tutorials/how-to-make-an-acid-house-bassline/

- https://www.tenor-conference.org/proceedings/2019/04Davis.pdf

- https://www.fazemag.de/track-check-hardfloor-acperience-harthouse-america-1992/

- https://www.soundonsound.com/techniques/classic-tracks-plastikman-consumed

- https://articles.roland.com/higher-state-of-consciousness-josh-wink/

- https://songbpm.com/@hardfloor/acperience-1-1cc7c812-d225-4143-876e-54a35d25db61

- https://songbpm.com/@plastikman/spastik

- https://www.mixgraph.io/bpm-for/acid-house

- https://www.mixgraph.io/bpm-for/acid-techno

- https://www.cambridge.org/core/journals/organised-sound/article/acid-patterns-how-people-are-sharing-a-visual-notation-system-for-the-roland-tb303-to-create-and-recreate-acid-house-music/1FE37195243684AD6B6912FAE99E99E0

- https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1216976-emulating-tb-303-slide.html

- https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/496580-tr-909-house-technique.html

- https://modwiggler.com/forum/viewtopic.php?p=4306155

- https://techno-music.com/how-to-create-acid-lines-with-the-roland-tb-303-and-clones/

- https://articles.roland.com/this-is-acid-exploring-dj-pierres-phuture-collection/

- https://www.insomniac.com/music/from-the-crate-plastikman-spastik/

- https://en.wikipedia.org/wiki/Voodoo_Ray

- https://en.wikipedia.org/wiki/Hardfloor

- https://en.wikipedia.org/wiki/Consumed_(Plastikman_album)
