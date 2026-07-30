# Blade Runner / Vangelis (1982 score) — genre key `bladerunner`

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

ONE thing: **the note arrives from below.** The CS-80's "Initial Pitch Bend" starts every note roughly a semitone flat and swoops it up to pitch in a few tens of milliseconds, velocity-scaled — then a wide vibrato ARRIVES late, half a second in, on a note that is still sounding four seconds later. Old Crow's CS-80 panel tour describes it as "brief portamento of a note from about 1 semitone below the key's actual pitch to the expected pitch"; Sound On Sound's Arturia CS80V review calls it "a quick, velocity-sensitive, upward pitch swoop to the start of each note"; the Arturia manual's parameter list names it `atinit`, "velocity action setting on the glissando for the start of the note." Three independent sources, same mechanism. If your notes start dead in tune, no amount of correct harmony will make a listener say "Blade Runner."

SECOND thing (needed to close the identification): **the tail is longer than the note that caused it.** Everything went through a Lexicon 224, an early digital reverb famous for very long decays, and Vangelis was an early adopter of the long settings. Combined with a texture The Conversation describes as "longer drawn out notes, rather than thick instrumental combinations" — two or three events per bar, not twenty — you get one or two sounds at a time floating in a room several seconds deep.

Everything else (i–VI vamp, no dominant, harmonic rhythm of 2+ bars) is *supporting evidence*. A listener will name the genre off the scoop and the room alone, in one held note, before a chord even changes.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   bladerunner — Blade Runner (1982). Written against MK2's actual table shape as
   shipped (GENRE.lofi at /tmp/mk2_readable.html:1173-1261). Where a field has
   no reader in the current code I have said so on the line; those are the
   architecture gaps, listed separately.

   PREREQUISITES before this table will load at all:
     (a) MODES (line 93) must gain phrygian + lydian. MODES is a shared [theory]
         table, not genre logic, so widening it is legal:
           phrygian: [0,1,3,5,7,8,10],   // [theory]
           lydian:   [0,2,4,6,7,9,11],   // [theory]
     (b) RIG (line 351) must gain a "nemo" row (given at the bottom).
   ═══════════════════════════════════════════════════════════════════════════ */

bladerunner: {
  label: "Vangelis / Blade Runner",

  /* ── stage 1: identity ──────────────────────────────────────────────────
     TEMPO, and the honest story. Vangelis played to picture with NO CLICK
     TRACK; sync was done by hand on tape and video machines, and he called the
     looseness part of the method [corpus:nemostudios.co.uk/bladerunner]. The
     famous cues are rubato — Ali Jamieson calls Main Titles "played very rubato
     style" [corpus:alijamieson]. So there is no published tempo to cite and I
     did not find one in any sheet-music edition I could reach.

     What I DID measure: four machine BPM readings I fetched directly.
        Blade Runner Blues .... 65   [corpus:songbpm] (page also offers 130 dbl)
        Memories of Green ..... 70   [corpus:songbpm] (page also offers 140 dbl)
        Main Titles ........... 80.025 [corpus:chordu]
        End Titles ............ 113  [corpus:songbpm]
     Third-party summaries also report 107 and 123 for Blade Runner Blues,
     which I could not fetch to confirm. THAT SPREAD IS THE FINDING: detectors
     disagree by a factor of two on one track because there is no stable pulse
     to detect. The three unpulsed cues cluster 65-80; End Titles at 113 is the
     one genuinely pulsed cue and I am deliberately excluding it — a generator
     set to 113 will produce something that is not this score.

     [56,76] brackets 65/70 and sits under 80. At 60 bpm one bar = 4.0 s and the
     4-bar loop = 16 s, which is the right order for a cue that changes chord
     twice in sixteen seconds. */
  tempo: [56, 76],                 // [corpus:songbpm 65/70/113 + corpus:chordu 80.025]

  /* MODES. Named-record evidence, not vibes:
       major — Main Titles is E major, modulating to B major at bars 7-8
               [corpus:alijamieson]; Love Theme is Db major [corpus:alijamieson];
               Memories of Green is D major [corpus:chordu + musicnotes];
               Chariots of Fire is Db major [corpus:hooktheory, adjacent work]
       minor — Blade Runner Blues is F# minor, two chords F#m and D
               [corpus:alijamieson]; End Titles reads C minor [corpus:chordu]
       phrygian — one secondary source describes the main motif reworked "from
               the original key of E major to D Phrygian ... coupled with a drone
               underpinning giving this mode a pseudo-eastern flavour." I could
               NOT reach the primary (the MDPI paper 503'd), so this weight is
               deliberately small. [corpus:secondary, UNCONFIRMED]
       lydian — taste. I found no source. Weight 1 so it is rare. [EAR] */
  modes: [["major", 5], ["minor", 5], ["dorian", 2],
          ["phrygian", 2],            // [corpus:secondary, UNCONFIRMED — see above]
          ["lydian", 1]],             // [EAR]

  rig: [["nemo", 10]],                                        // one rig; see RIG below
  keysChar: [["vp330", 6], ["cp80", 4]],   // string synth vs CP-80 electric grand,
                                           // both named in the Love Theme/BR Blues
                                           // instrument lists [corpus:alijamieson]
                                           // NOTE: V.keys only branches on "wurly";
                                           // with rig nemo the keys lane goes to a
                                           // new voice, so this reaches V.vp330.

  /* the tape. Not vinyl — a Lyrec TR-532 24-track hand-synced to VHS with a
     chinagraph pencil, no click [corpus:nemostudios br03]. Slow drift, faint
     room, no crackle. */
  tape: { wow:     [0.0010, 0.0014],   // [EAR] slower/deeper than lofi's 0.0012/0.0018
          crackle: [0.0030, 0.0020] }, // [EAR] this is room hiss, not surface noise

  /* ── stage 2: form ─────────────────────────────────────────────────────── */
  form: {
    coldOpen:  0.08,        // [EAR] a Vangelis cue almost always fades up out of
                            // atmosphere first; a cold open is the exception
    openVerse: 0.85,        // [EAR] the drone, then the theme
    target:    [32, 5, 8],  // 32/40/48/56/64 bars = 2:08-4:16 at 60 bpm.
                            // Main Titles 3:42, Tears in Rain 3:00
                            // [corpus:wikipedia BR soundtrack track listing]
    /* Vangelis cues state and restate; they rarely "go somewhere". So the
       transition table is weighted heavily toward return, and the bridge is
       weak. [EAR] — I found no corpus of Vangelis cue forms and I am not going
       to pretend otherwise. */
    transitions: {
      verse:        [["chorus", 5], ["verse", 3], ["instrumental", 2], ["bridge", 1]],  // [EAR]
      chorus:       [["verse", 6], ["instrumental", 3], ["chorus", 2], ["bridge", 1]],  // [EAR]
      bridge:       [["chorus", 6], ["verse", 4]],                                      // [EAR]
      instrumental: [["verse", 5], ["chorus", 5]],                                      // [EAR]
    },
    bridgeAfterChorus: { verse: 2, chorus: 2 },   // [EAR] departures are rare here
    /* the gain formula is (0.72 + 0.28*energy), so this whole column only spans
       0.82-0.99. That is correct: the score's dynamics live in the FILTER and
       the reverb, not in note velocity. [EAR] */
    energy: { intro: 0.35, outro: 0.30, bridge: 0.55, instrumental: 0.50,
              chorus: 0.82, chorusPeak: 0.95, verse: 0.62 },
  },

  /* ── stage 3: materials ────────────────────────────────────────────────── */

  /* POCKET. Read by drums (kick placement), bass (note onsets) and keys
     (strike positions). One event per bar is the whole point.
     [corpus:theconversation — "longer drawn out notes, rather than thick
     instrumental combinations"] */
  pocket: [[[0], 6],        // one downbeat, nothing else — the default
           [[0, 8], 3],     // a half-bar answer
           [[0, 6], 1]],    // [EAR] an off-centre second event, rare

  /* KIT. There is no drum kit in this score. What IS documented in the
     instrument list is gamelan and tubular bells [corpus:wikipedia BR
     soundtrack]. So the kit lanes become struck metal on the downbeat and
     nothing else.
     LOUD WARNING: this is a WORKAROUND, not a design. See gap #2 — stage 4's
     ROLES table is a hardcoded literal, so a genre cannot say "no drums". The
     numbers below make the drums nearly inaudible rather than absent. */
  kit: {
    snare:       [],          // [corpus:no backbeat exists anywhere in this score]
    hatEvery:    16,          // one shimmer per bar (loop runs s=0 only)
    hatVel:      0.14,        // [EAR] barely there
    ghostChance: 0.0,         // [corpus:no ghosting; there is no groove to ghost]
    ghostSpots:  [8],         // draw still runs unconditionally [Law 7]
    openSpot:    [[-1, 10]],  // -1 = no open hat, always
    openBars:    [],
    kickKeep:    1,           // the low bell, downbeat only
    flourishBar: 3,
    flourish:    [[[], 10]],  // never
    variants: {
      main:   {},
      lift:   { hatVel: 0.20 },                  // [EAR] the restatement rings a little
      depart: { kickKeep: 0, hatVel: 0.08 },     // [EAR] the departure loses the bell
    },
  },

  /* COUNTER. Tears in Rain is "call-and-response between Rhodes and CS-80"
     [corpus:alijamieson]. Response, not doubling: sparse, low, contrary. */
  counter: { density: 0.28,             // [EAR] answers on roughly 1 note in 4
             intervals: [-2, -4, -5, -7] },   // [theory] scale steps, always below

  /* PROGRESSIONS — scale degrees, 0-indexed, ONE PER BAR over BARS=4.
     Repeating a degree is how harmonic rhythm is slowed; 2 bars/chord is the
     slowest this architecture can express (gap #4).

     WHAT IS ACTUALLY DOCUMENTED, by record:
       Blade Runner Blues — "just two chords, F#m and D" = i - VI in F# minor,
         with the lead on the F# minor blues scale [corpus:alijamieson]
       Love Theme — Db major, "repetition of the IV and I chords for the first
         eight bars", then "ii, III7, vi, vii°, bVII, V7, I" [corpus:alijamieson]
       Main Titles — E major, modulating to B major at bars 7-8 [corpus:alijamieson]
       Rachel's Song — ends on a Picardy third [corpus:alijamieson]
       Tears in Rain — modulates "up through various keys"; at "like tears in
         rain" it pivots C major -> E major, a chromatic mediant
         [corpus:pianostringtheory]

     WHAT I DID NOT FIND: any source documenting sus2/sus4/add9 voicings in this
     score. The brief presupposes them; I am not confirming what I could not
     read. The documented vertical writing is plain triads plus a few sevenths
     (III7, vii°, V7 in the Love Theme turnaround). What people hear as "open"
     is, on the evidence, the two-oscillator detune and the reverb, not the
     voicing. Flagged in `uncertain`.

     CHORD-DETECTION SITES ARE NOT USABLE HERE and I am saying so rather than
     laundering them: three chordu uploads of the same Main Titles gave
     {E,Db,Bb,Abm,Gb}, {E,F#,B,D#,Em} and {E,Em,C,A}, and two of them reported
     an identical fallback "150 bpm". Only the human analyses above are cited. */
  progressions: {
    minor: [
      [[0,0,5,5], 6],   // i i VI VI — Blade Runner Blues F#m/D, 2 bars per chord
                        //   [corpus:alijamieson]
      [[0,0,3,3], 3],   // i i iv iv — plagal, no dominant [theory]
      [[0,5,0,5], 2],   // i VI i VI — the same pair, changing every bar [theory]
      [[0,0,6,6], 2],   // i i bVII bVII — modal, avoids V entirely [theory]
    ],
    major: [
      [[3,0,3,0], 6],   // IV I IV I — Love Theme's opening eight bars
                        //   [corpus:alijamieson]
      [[0,0,3,3], 4],   // I I IV IV — the same plagal pair, slower [theory]
      [[0,0,4,4], 2],   // I I V V — Main Titles' bar 7-8 move to the dominant
                        //   key [corpus:alijamieson]
      [[0,3,1,4], 2],   // I IV ii V — the Love Theme turnaround compressed to
                        //   four bars [corpus:alijamieson, reduced]
    ],
    dorian: [
      [[0,0,3,3], 5],   // i i IV IV — the major IV is what dorian IS [theory]
      [[0,3,0,3], 3],   // [theory]
      [[0,0,6,6], 2],   // [theory]
    ],
    phrygian: [
      [[0,0,1,1], 5],   // i bII — the Phrygian half-step over a drone; this is
                        //   the "pseudo-eastern flavour" the secondary source
                        //   describes [corpus:secondary, UNCONFIRMED]
      [[0,1,0,1], 3],   // [theory]
      [[0,0,6,6], 2],   // [theory]
    ],
    lydian: [
      [[0,0,1,1], 4],   // I II — the lydian major-II, the "awe" chord [theory]
      [[0,1,0,1], 3],   // [theory]
      [[0,0,4,4], 2],   // [theory]
    ],
  },
  /* the departure: rotated to open OFF the tonic [theory] */
  bridgeProgressions: {
    minor:    [[[3,3,5,5], 3], [[5,5,3,3], 2], [[6,6,3,3], 2]],   // [theory]
    major:    [[[3,3,4,4], 3], [[1,1,4,4], 2], [[5,5,3,3], 2]],   // [theory]
    dorian:   [[[3,3,0,0], 3], [[6,6,3,3], 2]],                   // [theory]
    phrygian: [[[1,1,6,6], 3], [[6,6,1,1], 2]],                   // [theory]
    lydian:   [[[1,1,4,4], 3], [[4,4,1,1], 2]],                   // [theory]
  },

  /* REGISTERS. The bass is a Prophet-10 low drone [corpus:nemostudios br03 —
     "Sequential Circuits Prophet 10 (low drones)"]; the VP-330 string bed sits
     wide in the low-middle; the CS-80 brass melody sings HIGH above everything.
     Theme bands are >= 20 semitones wide on purpose: buildTheme seeds inside
     [LO+4, HI-4] and intoBand assumes a band of at least 12. */
  registers: { bass:   [33, 45],   // see gap #9 — buildBass hardcodes 33..47 for
                                   // its fifth-notes, so going lower splits the
                                   // register audibly. This is a compromise.
               keys:   [48, 72],   // [EAR] the VP-330 bed, two octaves wide
               counter:[55, 74],   // [EAR] the Rhodes answer, under the brass
               themeA: [69, 89],   // [EAR] the CS-80 brass lives up here
               themeB: [72, 92],   // [EAR] the restatement goes higher still
               themeC: [64, 84] }, // [EAR] the departure drops

  /* ── stage 5: performance ──────────────────────────────────────────────── */
  groove: {
    styles:     [["even", 10]],    // [corpus:nemostudios — no click track, no
                                   // machine groove; "dilla" is meaningless here]
    swing:      [1.0, 0.0],        // ratio 1.0 -> swingOffset = 4*.5-2 = 0 exactly.
                                   // Straight. [corpus:nemostudios — free time]
    snareEarly: [0, 0],            // inert in "even" mode; the draw still runs [Law 7]
    kickLate:   [0, 0],            // idem
    hatMul:     1,                 // nothing to swing
    jitter:     { even: 0.038 },   // +/-38 ms. THIS IS THE WEAKEST NUMBER IN THE
                                   // TABLE. It is a stand-in for rubato, and it
                                   // is the wrong shape (see gap #3): real rubato
                                   // is correlated across a phrase, this is
                                   // independent per note. 38 ms is what I judged
                                   // "hand-played, not sloppy" — untested. [EAR]
    push:       0.014,             // struck metal sits BEHIND the beat [EAR]
  },

  touch: {
    /* bassArtic is a duration MULTIPLIER applied in stage 5. buildBass writes
       dur: Math.min(8, ...) — a hard half-bar cap (gap #8). Multiplying by 3-5
       is the only route to a drone that outlives its bar. At 60 bpm, dur 8 x 4.0
       = 32 sixteenths = 2 bars = 8 seconds. [theory: this is what "drone" means] */
    bassArtic: [[3.0, 3], [4.0, 5], [5.0, 2]],   // [EAR] — a repurposing, see gap #8
    /* the strum: keys notes of one strike roll by this much each. Four notes at
       40 ms = 120 ms of spread. Vangelis did not stamp chords; he played them,
       once, in one take, and kept the first take even with mistakes in it
       [corpus:nemostudios br03]. 35-80 ms is a hand. */
    strum: [0.035, 0.045],                       // [EAR]
  },

  /* ── THE RIBBON. A PERFORMANCE-STAGE BEHAVIOUR, not a voice parameter. ────
     This block has NO READER TODAY. See gap #12: stage 5 currently owns time
     and gain and explicitly not pitch. Everything here is timing/expression —
     it must be seeded, it must differ note to note, and it must not live as a
     constant inside V.cs80 (that is exactly why the existing V.cs80's fixed
     0.6 s vibrato ramp sounds mechanical). Stage 5 should write two or three
     new frozen fields and V.cs80 should read them:
        ev.bendFrom  semitones relative to ev.pitch at note start (negative)
        ev.bendSec   time to reach pitch
        ev.fallSemis / ev.fallSec  the phrase-end departure, if any

     THE SOURCES, because this is the part that matters most:

     (A) THE SCOOP — happens on EVERY note.
       Old Crow's CS-80 front-panel tour, on Touch Response / Initial Pitch Bend:
         "brief portamento of a note from about 1 semitone below the key's
          actual pitch to the expected pitch" [corpus:cs80.com/tour]
       SOS on the Arturia emulation: "a quick, velocity-sensitive, upward pitch
          swoop to the start of each note" [corpus:soundonsound arturia-cs80v]
       Arturia CS-80V manual parameter list: atinit = "Velocity action setting
          on the glissando for the start of the note" [corpus:arturia manual]
       => magnitude ~1 semitone, direction ALWAYS UP, scaled by velocity.
          Duration: no source gives a number. "Brief" is all anyone says. [EAR]

     (B) THE RIBBON — between notes, and NOT on every note.
       SOS on the hardware: the ribbon has "no centre position"; it gives "an
          incredibly smooth pitch-bend, over a range of one octave upwards", and
          in the other direction descends "from the keyboard's highest pitch
          right down to a sub-audio frequency" [corpus:soundonsound yamaha-cs80]
       Old Crow: "Ranges approximately +1 octave downward to zero pitch,
          responding only to currently held keys" [corpus:cs80.com/tour]
       Arturia manual: "when bending the frequency down, the range goes all the
          way down to 0 Hz. This is a feature that's unique to the CS-80"
          [corpus:arturia manual]
       mfoxhd, measuring a real unit: "wherever I lay my finger on the ribbon it
          will start pitching up or down relatively from that spot"
          [corpus:mfoxhd.blogspot cs-80 calibration pt10]
       Reverb Machine on where it is used musically: "You can hear these
          descending slides towards the end" of Tears in Rain
          [corpus:reverbmachine tears-in-rain]

     THE GLIDE LAW, stated: it is ASYMMETRIC and RELATIVE.
       - relative: the glide starts from whatever is currently sounding, not
         from a fixed centre. There is no centre.
       - up: BOUNDED at +12 semitones.
       - down: UNBOUNDED. The target is 0 Hz, not a pitch. A downward ribbon
         move is a fall out of the bottom of the instrument, and that is why it
         reads as a gesture rather than as a bend.
       - it only moves notes still being HELD. In generator terms: only events
         whose durSec still overlaps.
       - legato window: the Arturia manual's CS-ASSIGN voice mode reinitialises
         portamento when the gap "exceeds a certain value (in the area of 170
         ms)", and elsewhere "the portamento transitions from note played at
         least 200 ms before". Under that gap the notes glide together; over it
         each is re-attacked with its own scoop. */
  ribbon: {
    scoopSemis: [-1.00, 0.00],  // start this far below, scaled by ev.gain:
                                //   from = scoopSemis[0] * (0.35 + 0.65*ev.gain)
                                // [corpus:cs80.com/tour "about 1 semitone below";
                                //  velocity scaling from corpus:arturia atinit]
    scoopSec:   [0.045, 0.030], // base + range = 45-75 ms to reach pitch.
                                // NO SOURCE GIVES A TIME. [EAR/GUESS]
    scoopTau:   0.33,           // fraction of scoopSec used as the exponential
                                // time constant — a VCO CV slew is exponential,
                                // not linear [theory]
    legatoMs:   180,            // under this gap, consecutive lead notes glide
                                // instead of re-attacking
                                // [corpus:arturia manual, "in the area of 170 ms"
                                //  and "at least 200 ms before"]
    glideSec:   [0.090, 0.140], // time to traverse a legato interval [EAR]
    riseCeil:   12,             // upward bend capped at one octave
                                // [corpus:soundonsound "one octave upwards";
                                //  corpus:cs80.com "approximately +1 octave"]
    fallChance: 0.22,           // P(the last note of a phrase falls off the ribbon)
                                // [EAR] — Reverb Machine documents THAT it happens
                                // at phrase ends, not how often
    fallSemis:  [-14, -6],      // and it does not stop there: the true target is
                                // 0 Hz, so the voice should ramp toward silence,
                                // not toward a pitch
                                // [corpus:arturia "all the way down to 0 Hz"]
    fallSec:    [0.55, 0.45],   // [EAR]
  },

  /* ── the played-part styles (names for stage 3/5 to branch on; no reader
     today, they document intent) ──────────────────────────────────────────── */
  bassStyle:    "drone",   // one root per bar, held ACROSS the bar line, no walk,
                           // no fifths on the beat [corpus:nemostudios — Prophet 10
                           // "low drones"]
  keysStyle:    "pad",     // one strike per bar, held the whole bar, hand-rolled
                           // 35-80 ms [corpus:alijamieson — VP-330 string bed]
  leadStyle:    "ribbon",  // 1-2 notes per bar, long, each scooped in from below,
                           // vibrato arriving late, occasional fall at phrase end
  counterStyle: "answer",  // rare, low, contrary, only where the lead rests
                           // [corpus:alijamieson — Tears in Rain, "call-and-response
                           // between Rhodes and CS-80"]

  /* ── palette ───────────────────────────────────────────────────────────── */
  palette: {
    lead:    "cs80",          // EXISTS at line 690 and is already the right shape:
                              // two complete parallel layers, each osc->HP->LP, and
                              // late-onset vibrato. It needs the ribbon fields and
                              // a longer amp envelope, NOT a rewrite.
    counter: "rhodes",        // exists; and it is literally correct — the Tears in
                              // Rain melody is a Fender Rhodes with chorus
                              // [corpus:reverbmachine]
    keys:    "vp330",         // <<< THE ONE NEW VOICE THIS GENRE NEEDS >>>
    bass:    "prophetDrone",  // a low, slow, filtered saw pair, no pick transient.
                              // V.bass's 25 ms 1.2 kHz pick is wrong here.
                              // [corpus:nemostudios br03 gear list]
    kick:    "bellLow",       // tubular bell, downbeat [corpus:wikipedia instruments]
    snare:   "gamelan",       // struck metal [corpus:wikipedia instruments]
    ghost:   "gamelan",
    hat:     "gamelan",
    openhat: "gamelan",
  },

  /* THE ONE NEW VOICE: V.vp330 — Roland VP-330 Vocoder Plus string/choir
     ensemble. It is on Blade Runner Blues under the CS-80 lead, and it plays
     the chords of Tears in Rain [corpus:alijamieson, corpus:reverbmachine].
     Without it there is no bed and the CS-80 has nothing to sit on.
     Shape (this is architecture, not emulation):
       sawtooth -> a 3-tap BBD chorus (the ensemble), taps modulated by two LFOs
       at ~0.6 Hz (depth ~2.8 ms) and ~6.1 Hz (depth ~0.35 ms) at 120 deg phase
       -> a gentle vocal band (bandpass ~500 Hz + ~1.5 kHz, Q ~1.2) for the
       choir formant -> slow attack (~0.9 s) / very long release (~2.5 s).
     Every number in that sketch is [EAR] — I did not find a VP-330 service
     spec. The 3-tap-with-two-LFOs topology is the standard string-ensemble
     BBD architecture [theory], not a measurement of this unit. */

  /* ── space ─────────────────────────────────────────────────────────────── */
  space: {
    wet:  0.55,     // vs lofi's 0.16. [EAR] — must be A/B'd; the IR is seeded
                    // noise and this may be far too hot.
    /* THE NEXT THREE FIELDS HAVE NO READER. setSpace() (line 1059) only assigns
       space.wet; the IR is baked in buildGraph at irSec = 1.4 with a fixed
       pow(1-t, 2.2) decay and a fixed 0.32 one-pole darkening, and the send is
       fed only by bus.keys + bus.lead through a 200 Hz high-pass. See gap #7. */
    irSec:   5.0,   // [EAR, order-of-magnitude from corpus:valhalladsp — the
                    // Lexicon 224 was known for "spacey, extra long decays (up to
                    // 70 seconds)" and Vangelis was an early user of the long
                    // settings, "most famously in the Blade Runner soundtrack".
                    // The 224's own decay range is quoted 2.0-75 s. 5.0 is my
                    // pick inside that range, NOT a measurement of any cue.
                    // NOTE: I read this via a search summary of that page, not a
                    // direct fetch. Weakest citation in the table.]
    tailPow: 1.6,   // [EAR] slower than lofi's 2.2 — a hall, not a room
    tilt:   -3.5,   // dB of high-shelf tilt; the 224 is dark [EAR]
    sendHp:  80,    // Hz. Must drop from 200 so the bass drone is IN the wash;
                    // in this score nothing is dry. [EAR]
    feeds: ["keys", "lead", "bass", "drums"],   // everything goes to the room
  },
},

/* ── and the RIG row it needs (add to RIG at line 351) ─────────────────────
   Stage 5 writes ev.voice through this table in exactly one place, so this is
   the only thing that changes which instrument plays what. */
nemo: { kick:"bellLow",  snare:"gamelan",  ghost:"gamelan",  hat:"gamelan",
        openhat:"gamelan",
        bass:"prophetDrone", keys:"vp330", lead:"cs80", counter:"rhodes" },
```

## What MK2's architecture cannot express

- #1 THE BIGGEST ONE — NOTE DENSITY IS HARDCODED IN STAGE 3, SO THIS GENRE IS UNREACHABLE FROM THE TABLE. buildTheme (line 1533): `const count = opts.hooky ? 4 + floor(rng()*2) : isBreath ? 1 + floor(rng()*2) : 3 + floor(rng()*2)`. That is 3-6 melody notes per bar, always, for every genre. Vangelis is 0.5-2 notes per bar — The Conversation's description of the texture is 'longer drawn out notes, rather than thick instrumental combinations'. `onsetPool` (line 1522, eight fixed positions) is likewise a literal. There is NO table knob for either. Load this table today and you get a busy lofi tune playing over a Vangelis pad, which sounds like neither. FIX: move both into the genre — G.theme = { count: {hooky:[4,2], breath:[1,2], normal:[3,2]}, onsetPool: [[0,5],[8,3],...] }. This is a pure widening, no branching, no correcting pass.

- #2 A GENRE CANNOT SAY 'NO DRUMS'. makeArrangement (line 1762) holds ROLES and MAT as hardcoded object literals inside the function. Vangelis has no drum kit anywhere. The table above papers over it with a near-silent bell kit, and I want that called out as papering rather than accepted as design. FIX: G.form.roles and G.form.materialMap, read by stage 4. Stage 4 keeps doing the same selection work for everyone; only the tables differ.

- #3 NO TEMPO MAP — RUBATO IS INEXPRESSIBLE, AND THIS IS THE DEEPEST MISMATCH. Stage 5 computes one `spb = (60/tempo)/4` and every event is `(bar*16 + step + micro) * spb`. The only elastic tool is per-note independent uniform jitter, which is sloppiness — real rubato is CORRELATED across a phrase (the whole line slows, then catches up). For a composer who worked with no click track, by hand, in one take, against picture — 'Synchronisation was carried out by hand'; he 'refused to use a click-track'; the ambient cues were 'played in free time, synced to the picture rather than a metronome' — a rigid grid is the wrong primitive. FIX that stays inside the architecture: a stage-5-owned per-bar tempo multiplier, G.groove.rubato = { depth, periodBars }, drawn once per song and applied as one more term in the ONE timing formula. Still deterministic, still one formula, still no correcting pass.

- #4 HARMONIC RHYTHM BOTTOMS OUT AT 2 BARS PER CHORD. BARS = 4 (line 1375) and mkChords maps one degree to one bar. Repeating degrees gets you [0,0,5,5] = 2 bars/chord, and that is the floor. Blade Runner Blues holds F#m and D for far longer than two bars each over nearly nine minutes. FIX: let a progression entry carry a duration, or add G.harmony.chordBars as a multiplier on the mapping.

- #5 PLANING IS IMPOSSIBLE, AND buildKeys ACTIVELY PREVENTS IT. Two separate blocks. (a) chordTones(root, mode, d, seventh) stacks diatonic thirds only — a non-diatonic parallel triad cannot be SPELLED. (b) buildKeys chooses the inversion minimising `sum |cand[i] - prev[i]|`, i.e. it deliberately minimises voice-leading motion. Planing is the exact opposite: hold the shape, move it in parallel. If the Main Titles really does chain major triads down by minor thirds (I could not confirm this — see uncertain), the voicer would refuse to produce it even if the degrees were spellable. FIX: G.harmony.voicing = 'planed' | 'voiceLed' as a table switch, plus allowing a progression entry to be a semitone offset rather than a scale degree.

- #6 NO SUS / ADD9 / OPEN-FIFTH / QUARTAL VOICINGS AT ALL. chordTones produces triads and sevenths, full stop. Separate from whether Vangelis used them (I could not confirm he did), the machinery is simply absent for every genre.

- #7 SPACE IS ONE NUMBER AND THE ROOM IS BAKED IN. setSpace (line 1059) assigns space.wet and nothing else. buildGraph hardcodes irSec = 1.4, a pow(1-t, 2.2) decay envelope and a 0.32 one-pole darkening; the send is fed ONLY by bus.keys and bus.lead through a fixed 200 Hz high-pass. For a score run entirely through a Lexicon 224 at multi-second decay, 1.4 s is not the right ORDER OF MAGNITUDE, and leaving the bass drone and the percussion bone dry is wrong in a score where nothing is dry. FIX: space = { wet, irSec, tailPow, tilt, sendHp, feeds:[...] }, with setSpace rebuilding the IR when irSec changes. Note this interacts with Law 7 determinism: the IR is seeded from hash32('ir'+ch), so it stays deterministic as long as irSec is a song parameter and not a live control.

- #8 THE BASS CANNOT DRONE EXCEPT BY ABUSING bassArtic. buildBass writes `dur: Math.min(8, pocket[1] || 8)` — a hard cap at half a bar, ignoring both the pocket and the genre. The only escape is touch.bassArtic, a stage-5 duration multiplier, which I have set to 3-5 to get a two-bar drone. It works, but by coincidence rather than design, and a future reader will not know why those numbers are there unless the comment survives.

- #9 A PLAIN BUG, NOT JUST A VANGELIS PROBLEM: the walking bass ignores registers.bass. buildBass computes its fifth-notes as `intoBand(degMidi(root, mode, ch.degree + 4), 33, 47)` — 33 and 47 are literals. Every genre's fifth-notes land in the same octave no matter what registers.bass declares. It forced me to set registers.bass to [33,45] to avoid an audible register split, when a Prophet-10 low drone wants to sit an octave lower.

- #10 SEVENTHS ARE MANDATORY. mkChords calls chordTones(root, mode, d, true) with the flag hardcoded. No genre can ask for plain triads, which is what a string-synth pad in this score mostly plays.

- #11 MODES HAS ONLY minor/dorian/major. phrygian and lydian must be added before this table will load. This one is benign — MODES is a shared [theory] table, not genre logic, so widening it is exactly the legal move. Listing it only so nobody is surprised by a crash.

- #12 PITCH GLIDE HAS NO OWNER, AND SOMEBODY NEEDS TO SAY YES TO GIVING IT ONE. Stage 5's own header says it owns GAIN and TIMING. The ribbon and the initial pitch bend are neither — they are pitch over time. But they ARE performance: the same written note glides differently every time, it must be seeded, and it must vary note to note. Putting them in stage 5 (writing ev.bendFrom / ev.bendSec / ev.fallSemis / ev.fallSec) is a genuine EXTENSION of stage 5's ownership from two properties to three. Putting them in V.cs80 instead would make every note glide identically, which is precisely the failure mode the existing V.cs80 already has with its fixed 0.6 s vibrato ramp. I think stage 5 is right, but it is a deliberate widening of a stated ownership boundary and should be agreed out loud rather than slipped in.

- #13 (minor) EVERY EVENT IS QUANTISED TO THE GRID. tSec = (bar*16 + step + micro) * spb. There is no free-floating event. Vangelis's cues contain gestures that belong to the picture, not to a bar line. Probably acceptable for a generator, but it is a real difference between the model and the music.

- #14 (minor) THE BED VOICE BYPASSES THE RIG. Stage 5 pushes the tape event with `voice: "tape"` hardcoded, not through RIG[chart.rig]. So every genre gets V.tape's vinyl-flavoured bandpassed noise. Vangelis wants city hiss and the Lexicon wash, not surface noise. Route the bed through RIG like every other lane.

- #15 (minor) SECTION_LEN is a module-level const, not per-genre. It happens to work here (an 8-bar section at 60 bpm is 32 s, which is right), so this is a note rather than a complaint — but a genre cannot choose its section lengths.


## Numbers the researcher flagged as UNCERTAIN

- TEMPO — every BPM figure in this table is MACHINE DETECTION, not a published marking. I fetched four directly: Blade Runner Blues 65 (songbpm), Memories of Green 70 (songbpm), Main Titles 80.025 (chordu), End Titles 113 (songbpm). Search summaries also reported 107 and 123 for Blade Runner Blues and 164 for Main Titles, which I could NOT fetch to confirm (tunebat/musicstax/songdata all returned 403). I found no sheet-music tempo marking for any cue. tempo:[56,76] is my bracket, not a measurement.

- scoopSec [0.045,0.030] — NO source gives a duration for the CS-80's initial pitch bend. Three sources agree it exists, is ~1 semitone, is upward, and is velocity-scaled; all three say only 'brief' or 'quick'. The 45-75 ms figure is mine. [EAR]

- glideSec, fallSec, fallSemis, fallChance, scoopTau, riseCeil-as-used — the ribbon's RANGE and DIRECTIONAL ASYMMETRY are documented (up bounded at one octave, down unbounded to 0 Hz, relative to touch point, held notes only). Its SPEED and how OFTEN Vangelis reached for it are not. Reverb Machine documents that descending slides occur at the end of Tears in Rain; nothing quantifies frequency. All timing numbers are [EAR].

- space.irSec 5.0 — the Lexicon 224's decay range (2-75 s) and Vangelis's use of the long settings come from a Valhalla DSP page I read only as a SEARCH SUMMARY, not a direct fetch. And no source states the decay used on any specific cue. 5.0 s is my pick inside a documented range. This is the weakest citation in the table.

- space.wet 0.55, tailPow 1.6, tilt -3.5, sendHp 80 — pure [EAR]. wet 0.55 against lofi's 0.16 is a >3x jump into a seeded-noise IR and could easily be far too hot. Must be A/B'd before anyone believes it.

- SUS2 / SUS4 / ADD9 VOICINGS — the brief presupposes these. I could not find a single source documenting them in this score. Everything I could read describes plain triads plus a few sevenths (Love Theme's ii-III7-vi-vii°-bVII-V7-I). My reading is that the 'open' quality comes from the two-oscillator detune and the reverb, not from the voicing — but that is my inference, not a citation. I have deliberately NOT put sus/add9 numbers in the table.

- PLANING / PARALLEL CHROMATIC TRIADS — also presupposed by the brief. The only chromatic-mediant motion I could source from a human analysis is Tears in Rain pivoting C major -> E major (pianostringtheory). The E-Db-Bb-Abm-Gb chain that would prove planing in the Main Titles comes only from chordu, and chordu gave three mutually contradictory readings of the same piece (two of them reporting an identical fallback '150 bpm'). I did not build planing into the progressions because I cannot defend it.

- D PHRYGIAN — the claim that the main motif is reworked from E major into D Phrygian over a drone appears in search summaries attributed to a source I could not reach; the MDPI academic paper (mdpi.com/2076-0752/13/5/154) returned 503 on fetch. phrygian is weighted 2 out of 15 for that reason. UNCONFIRMED.

- LYDIAN — no source at all. Included at weight 1 purely as taste. [EAR]

- ALL form.transitions WEIGHTS — no corpus of Vangelis cue forms exists that I could find. Every number in that block is [EAR]. The lofi weights came from harvest_structure; these did not come from anything.

- groove.jitter.even 0.038 — a stand-in for rubato and the wrong SHAPE for it (see architecture gap #3). 38 ms is a judgement call, untested.

- kit numbers — gamelan and tubular bells are documented in the Wikipedia instrument list for the score, but nothing documents WHERE they land or how loud. The downbeat placement and hatVel 0.14 are [EAR], and the whole kit block is a workaround for gap #2 rather than a description of the music.

- V.vp330's internals (3 BBD taps, 0.6 Hz / 6.1 Hz LFOs, 2.8 ms / 0.35 ms depths, 500 Hz + 1.5 kHz formant bands, 0.9 s attack / 2.5 s release) — I found no VP-330 service spec. That is the standard string-ensemble BBD topology [theory] with numbers I chose. Every one is [EAR].

- registers.* — all [EAR]. I have no register measurements for any cue.

- touch.bassArtic 3.0-5.0 — these are not 'how long the player lets the note ring' in any documented sense; they are the only lever that defeats buildBass's hardcoded half-bar cap. The VALUES are chosen to make the drone last ~2 bars, which is reasoning about the code, not about the record.

- A production fact I verified but did NOT put in the table, because I am not sure it should be modelled: the score was composed against PAL VHS at 25 fps and then SLOWED by 24/25 on the master to sync to 24 fps film (nemostudios, quoted verbatim: 'slowed down by a factor of 24/25'). One search summary asserted the opposite direction (sped up by 25/24) and also claimed '~a semitone, about 41 cents', which is self-contradictory — a 25/24 ratio is exactly 70.67 cents. Trusting the directly-fetched primary: the film music is 4% slow and ~70 cents FLAT relative to what Vangelis played. Whether the 1994 album was mastered from those film masters, I do not know, and I did not build a detune into the table on the strength of it.


## Sources

- https://alijamieson.co.uk/2021/12/14/replicating-blade-runner-soundtrack/

- https://www.nemostudios.co.uk/bladerunner/

- http://www.nemostudios.co.uk/nemo/sections/br/br03.htm

- https://www.soundonsound.com/reviews/yamaha-cs80

- https://www.cs80.com/tour.html

- https://downloads.arturia.com/products/cs-80v/manual/CS80V_Manual_2_6_0_EN.pdf

- https://mfoxhd.blogspot.com/2016/01/cs-80-calibration-part-10-portamento.html

- https://reverbmachine.com/blog/bladerunner-blade-runner-synth-sounds/

- https://reverbmachine.com/blog/bladerunner-tears-in-rain-blade-runner/

- https://www.vintagesynth.com/yamaha/cs-80

- https://musictech.com/guides/essential-guide/landmark-productions-bladerunner-blade-runner-soundtrack/

- https://www.musicradar.com/news/blade-runner-best-synth-sound

- https://www.syntorial.com/preset-recipe/bladerunner-blade-runner-brass/

- https://pianostringtheory.com/a-musical-analysis-of-the-tears-in-rain-monologue-from-blade-runner/

- https://theconversation.com/blade-runner-soundtrack-at-30-how-bladerunner-used-electronic-music-to-explore-what-it-means-to-be-human-221604

- https://en.wikipedia.org/wiki/Blade_Runner_(soundtrack)

- https://songbpm.com/@bladerunner/blade-runner-blues-bd2fd7d8-8dfb-456c-8f92-3bde7217e29d

- https://songbpm.com/bladerunner/blade-runner-end-titles

- https://songbpm.com/@bladerunner/memories-of-green-from-blade-runner

- https://chordu.com/chords-tabs-bladerunner-blade-runner-main-titles--id_ME2AiIGoOYc

- https://chordu.com/chords-tabs-bladerunner-blade-runner-opening-titles-id_E7Iao2gSZXw

- https://chordu.com/chords-tabs--blade-runner-soundtrack-end-titles-by-bladerunner-id_qgz6jFxMpyk

- https://www.yalp.io/chords/bladerunner-blade-runner-main-titles-a9bb

- https://valhalladsp.wordpress.com/tag/lexicon-224/

- https://www.soundonsound.com/reviews/arturia-cs80v
