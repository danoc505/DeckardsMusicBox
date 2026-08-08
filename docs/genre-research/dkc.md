# Donkey Kong Country / DK64 — David Wise (DKC1/2/3) and Grant Kirkhope (DK64).
# Key: `vgm` (was `dkc` until 2026-08-08j).

> **THE KEY WAS RENAMED.** Chrono Trigger joined this table on the user's
> instruction, which made a third composer on a third franchise under a name
> that only covered one of them. Everything measured below is unchanged and
> still true — the rename moves no note (no substream is keyed on a genre
> name, proved by a byte-identical roll). The Chrono Trigger half, the SNES
> hardware the scores share, and the honest case AGAINST calling a medium a
> genre are in `chrono-trigger.md`.

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

TWO things, and both are measurable, and both are things MK2 currently cannot make.

(1) A CONTINUOUS SIXTEENTH/EIGHTH OSTINATO, ONE OCTAVE WIDE, THAT NEVER PLAYS THE ROOT — AND DOES NOT FOLLOW THE CHORDS. I measured the ostinato voice in three flagship tracks and the root pitch class is absent from all three:
  - Aquatic Ambience (C aeolian): D-Eb-Bb-G, that exact 4-note cell repeated four times per bar in straight 16ths, forever. Degrees {1,2,4,6} — i.e. 9th, b3, b7, 5. No C. [measured: DKC_Water-KM.mid ch0, bars 0-1 byte-identical]
  - Stickerbush Symphony (A aeolian): only three pitches, G4/B4/C5, in 16ths with heavy note-repeat, inside a fifth. Degrees {1,2,6} = 9th, b3, b7. No A. [measured: SNES_DKC_Brambles.mid ch0]
  - Forest Interlude (Bb mixolydian): Ab4-C5-Eb5-C5-F5-G5-F5-G5-Eb5-F5, in 8ths, one bar long. Degrees {1,3,4,5,6}. No Bb. [measured: DKC2_-_Forest_Interlude.mid ch1]
  And in Forest Interlude that cell is IDENTICAL across bars 8,9,10,11 while the bass moves Ab -> F -> Bb -> Ab underneath. The ostinato does not re-voice to the chord. The "unusual chord motion that is not functional harmony" that the brief asks about IS THIS: the harmony is an emergent by-product of a fixed melodic cell over a moving bass pedal. Nothing is being voice-led. The Ab in the cell against a Bb bass is not an error being corrected — it is the sound.

(2) THE BASS IS A HELD, OCTAVE-DOUBLED PEDAL — one note, both octaves struck together, ringing for a whole bar or longer, sometimes for the whole track.
  - Aquatic Ambience: C2+C3 held 8 beats, then Ab1+Ab2 held 8 beats. [DKC_Water-KM ch5]
  - Forest Interlude: Ab1+Ab2 (4 beats), F1+F2 (4), Bb1+Bb2 (8). [ch0]
  - Life in the Mines: G1+G2, Bb1+Bb2, C2+C3, G1+G2, one per bar. [ch0]
  - Fear Factory: E1 held sixteen beats; E is 52-53% of the whole track's duration weight in two independent transcriptions.
  - Hideout Helm (Kirkhope): G1 on every single eighth note, unchanged, for the entire track; G is 37-45% of duration weight.
There is no walking bass. There is no root-following. Four bars of that pedal plus that ostinato and a listener names the game.

Everything else — pan flute lead, whale-song bends, long echo, tuned percussion bed — is dressing on those two.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   GENRE.dkc — Donkey Kong Country (Wise, SNES) / Donkey Kong 64 (Kirkhope, N64)

   PROVENANCE KEYS USED BELOW
     [corpus:vgmusic-N]  measured by me across N independent fan MIDI
                         transcriptions downloaded from vgmusic.com and parsed.
                         PITCH content is highly reliable (transcribers agree
                         note-for-note). TEMPO is good (cross-checked vs
                         songbpm/tunebat cover data). DRUM-KIT NUMBERS ARE THE
                         WEAKEST — the GM drum note is the transcriber's choice,
                         not Wise's. Treat every kit number as indicative.
     [corpus:shrine]     videogamemusicshrine.com written analysis
     [corpus:songbpm]    songbpm.com / tunebat BPM+key for released covers
     [corpus:loveemu]    loveemu spec of Rare's actual SNES sound engine
     [theory] music fact.  [EAR] taste, awaiting a listen.  [GUESS] no data.

   THE ONE THING TO READ FIRST: this genre's identity lives in two keys that
   DO NOT EXIST in MK2's GENRE shape yet — `ostinato` and `bassStyle:"pedal"`.
   Everything below the ═══ NEW KEYS ═══ line needs builder support in stage 3.
   Pasting only the top half gives you a lofi song in a Wise key. Say so.
   ═══════════════════════════════════════════════════════════════════════════ */

dkc: {
  label: "Donkey Kong Country",

  /* ── stage 1: identity ─────────────────────────────────────────────────── */

  /* TEMPO IS TRIMODAL AND A SINGLE [lo,hi] IS A LIE. Measured centres, each
     from >=2 independent transcriptions plus a cover BPM where one exists:
       ambient/underwater/cave  72-82   Aquatic Ambience 74/75/75/80 [corpus:vgmusic-5],
                                        songbpm cover 79 [corpus:songbpm];
                                        Life in the Mines 72/75 [corpus:vgmusic-4],
                                        cover 144=72 double [corpus:songbpm]
       level/forest/bramble     94-110  Stickerbush 95/96/99/100/100 [corpus:vgmusic-6],
                                        cover 94 [corpus:songbpm];
                                        Forest Interlude 95/96.5/97 [corpus:vgmusic-3],
                                        covers 94/97/101 [corpus:songbpm];
                                        Ice Cave Chant 100/110 [corpus:vgmusic-2];
                                        DK64 Japes 100 [corpus:vgmusic-2], cover 93;
                                        DK64 Aztec 108, Galleon 102/106, Creepy Castle 95
       driving/factory          128-146 Fear Factory 134/135/140 [corpus:vgmusic-3],
                                        covers 134/135 [corpus:songbpm];
                                        DK Island Swing 146 [corpus:vgmusic-2];
                                        DK64 Hideout Helm 129/130 [corpus:vgmusic-2]
     Weights are the share of the analysed corpus that landed in each band. */
  tempoBands: [ [[72, 82],  3],    // [corpus:vgmusic-9]
                [[94, 110], 5],    // [corpus:vgmusic-14]
                [[128, 146],3] ],  // [corpus:vgmusic-7]
  tempo: [72, 146],                // kept only so stage 1 still parses; USE tempoBands

  /* MODE. Counted over the ten tracks I analysed by pitch-class duration weight.
     aeolian 6: Aquatic Cm, Stickerbush Am, Life in the Mines Dm, Fear Factory Em,
                DK64 Japes Am, DK64 Hideout Helm Gm  [corpus:vgmusic-18]
     mixolydian 3: Forest Interlude Bb mixo (Ab present, Bb tonic, 92% collection
                fit) [corpus:vgmusic-3]; Ice Cave Chant A mixo (A 43% weight, C#
                AND G both present) [corpus:vgmusic-2]; DK Island Swing G mixo-sus
     major 1: DK64 Crystal Caves C, but with borrowed Ab — see `chromatic` below
     NOTE: MODES in MK2 has no mixolydian. Add mixolydian:[0,2,4,5,7,9,10]. [theory] */
  modes: [["minor", 6], ["mixolydian", 3], ["major", 1]],   // [corpus:vgmusic-23]

  rig:      [["band", 10], ["sega", 0]],   // [EAR] the SEGA FM rig is the wrong console;
                                           // a real "snes" rig is the right answer, see palette
  keysChar: [["pad", 6], ["bell", 4]],     // [EAR] no measurement; see palette for what these are
  tape:     { wow: [0.0, 0.0], crackle: [0.0, 0.0] },
                    // [corpus:loveemu] Rare's engine is tick-exact, TPQN 32. There is
                    // NO tape. No wow, no crackle, no drift. Zeroed deliberately, not
                    // omitted — the draw must still run. The machine-exactness is part
                    // of the sound and removing lofi's patina is a positive choice.

  /* ── stage 2: form ─────────────────────────────────────────────────────── */
  /* HONEST WARNING: verse/chorus/bridge is the WRONG grammar for this music.
     DKC tracks are LOOPS: intro -> A (16-32 bars) -> B (8-16) -> back to A.
     There is no chorus and nothing "arrives". Aquatic Ambience is famous for a
     "super long intro" before the tune enters [corpus:shrine]. I am mapping onto
     the existing function pool rather than inventing sections, because stage 2's
     pool is hardcoded — but the map is a compromise, not a measurement:
       intro  = the pad-and-ostinato bed alone, LONG
       verse  = A material
       chorus = B material (the contrasting strain), NOT a payoff
       bridge = the modulating strain (Forest Interlude's D-F-A-C section)
     I have marked every number here [EAR] because I measured no form data. */
  form: {
    coldOpen:   0.05,                     // [EAR] Wise almost always states the bed first
    openVerse:  0.85,                     // [EAR]
    target:     [48, 4, 8],               // [EAR] 48-80 bars; these loop long
    transitions: {
      verse:        [["chorus", 6], ["verse", 3], ["bridge", 1]],       // [EAR]
      chorus:       [["verse", 8], ["chorus", 1], ["bridge", 2], ["instrumental", 1]],
      bridge:       [["verse", 6], ["chorus", 2]],                      // returns to A, not to B
      instrumental: [["verse", 6], ["chorus", 3]],
    },
    bridgeAfterChorus: { verse: 1, chorus: 1 },   // [EAR]
    energy: { intro: 0.62, outro: 0.5, bridge: 0.7, instrumental: 0.7,
              chorus: 0.85, chorusPeak: 0.9, verse: 0.78 },
            // [EAR] deliberately FLAT and deliberately never 1.0. This music does
            // not build to a climax; it sustains a level. A lofi-style dynamic
            // arc is the single fastest way to make this not sound like DKC.
  },
  introBars: 16,   // [corpus:shrine] "super long intro" for Aquatic Ambience.
                   // SECTION_LEN.intro is 4 and is a module const — see gaps.

  /* ── stage 3: materials ────────────────────────────────────────────────── */

  /* KICK PLACEMENTS. Aggregate over 26 DKC1/2/3 transcriptions, each file's
     histogram normalised to itself first so no one long file dominates:
     step0 30%, step8 12%, step10 9%, step7 8%, step9 8%, step2 8%, rest <5%.
     [corpus:vgmusic-26] The four pockets below are the per-track patterns that
     three or more independent transcribers agreed on. */
  pocket: [
    [[0, 8],                5],   // [corpus:vgmusic-26] the two aggregate peaks
    [[0, 7, 9, 10],         3],   // [corpus:vgmusic-3] Stickerbush; 3 of 4 transcribers
                                  // agree exactly on 0/7/9/10 — a real, odd pocket
    [[0, 2, 7, 8, 10],      2],   // [corpus:vgmusic-1] Forest Interlude
    [[0, 4, 6, 8, 10, 12],  2],   // [corpus:vgmusic-1] Fear Factory, the driving one
    [[0, 2],                2],   // [corpus:vgmusic-2] Hideout Helm machine pulse
  ],

  kit: {
    snare:       [4, 12],          // [corpus:vgmusic-20] step4 37%, step12 32% of all
                                   // snare weight; step8 11% is the only other peak
    snareAlt:    [[[4,12], 7], [[4,8,12], 3]],   // [corpus:vgmusic-20] the step-8 hit
    hatEvery:    1,                // [corpus:vgmusic-21] the hat histogram is near
                                   // UNIFORM across all 16 steps (min 2%, max 12%) —
                                   // continuous sixteenths, not eighths. This is the
                                   // shaker/hat bed, and it never stops.
    hatVel:      0.42,             // [EAR] it sits well under the lofi 0.62; it is a bed
    ghostChance: 0.10,             // [GUESS] I found no ghost-snare evidence at all.
                                   // Ghosting is a live-drummer artefact; this is a
                                   // sequencer. Near-zero is the honest default.
    ghostSpots:  [7, 11, 15],      // [GUESS]
    openSpot:    [[4, 5], [12, 4], [-1, 3]],
                                   // [corpus:vgmusic-13] THE OPEN HAT IS ON THE
                                   // BACKBEAT: steps 4 and 12 carry 25% each of all
                                   // open-hat weight. Confirmed individually in Forest
                                   // Interlude (46 on 4 and 12, n=160, nothing else),
                                   // Aquatic Ambience, and DK Island Swing. This is
                                   // backwards from lofi (open hat on 14) and is one
                                   // of the two or three things that reads as "SNES".
    openBars:    [0, 1, 2, 3],     // [corpus:vgmusic-13] every bar, not bars 1 and 3
    kickKeep:    9,                // [EAR] play the whole pocket
    flourishBar: 3,                // [EAR] carried from lofi; no measurement
    flourish:    [[[], 6], [[14, 15], 2], [[10, 11], 2]],
                                   // [EAR] weighted heavily toward NO flourish: these
                                   // loops repeat exactly, that is the point
    variants: {
      main:   {},
      lift:   { hatVel: 0.50, openSpot: [[4, 6], [12, 4]] },   // [EAR]
      depart: { hatEvery: 2, snare: [12], kickKeep: 1, openSpot: [[-1, 1]],
                flourish: [[[], 1]] },                          // [EAR]
    },
  },

  /* PROGRESSIONS AS 0-INDEXED DIATONIC SCALE DEGREES (0=tonic, so 5 = the sixth
     degree = bVI in aeolian). Every one of these is transcribed from a MIDI and
     cross-read against the chord names my analyser printed. */
  progressions: {
    minor: [
      [[0, 5, 3, 6], 5],   // Cm - Ab - Fm - Bb = i - bVI - iv - bVII.
                           // AQUATIC AMBIENCE. [corpus:vgmusic-2, bars 0-31 of
                           // DKC_Water-KM and DKC_-_Aquatic_Ambience] and named
                           // independently as "Cmadd9 - Abadd9 - F7sus4 - Bbadd9"
                           // [corpus:shrine]. Two methods, same four chords.
      [[0, 0, 2, 2], 4],   // Am Am C C = i - bIII, two bars each. STICKERBUSH A
                           // SECTION. [corpus:vgmusic-3, all three agree]
      [[5, 6, 4, 2], 3],   // F - G/B - Em - C/G = bVI - bVII - v - bIII.
                           // STICKERBUSH B SECTION. [corpus:vgmusic-3]
                           // NOTE THE v: E MINOR, not E major. No leading tone.
                           // Wise does not use a dominant. [theory + measurement]
      [[3, 5, 6, 3], 3],   // G - Bb - C - G = iv - bVI - bVII - iv.
                           // LIFE IN THE MINES main riff. [corpus:vgmusic-2]
      [[3, 5, 6, 0], 2],   // ...and its second-time answer, landing on i.
      [[3, 4, 5, 6], 2],   // Dm - Em - F - G = a pure STEPWISE ASCENT, no function
                           // at all. STICKERBUSH third strain. [corpus:vgmusic-3]
      [[0, 2, 4, 6], 2],   // Dm - F - Am - C = root motion by ascending THIRDS.
                           // FOREST INTERLUDE B section. [corpus:vgmusic-2]
                           // This is the "not functional harmony" the brief asks
                           // about, in its purest measurable form.
      [[5, 3, 0, 0], 2],   // C - A - Em - Em. FEAR FACTORY, the only chord motion
                           // in the whole track. [corpus:vgmusic-2]
      [[0, 0, 0, 0], 3],   // THE PEDAL. Fear Factory holds E for 16+ bars; Life in
                           // the Mines holds D for 4 bars; Hideout Helm holds G for
                           // the entire track. [corpus:vgmusic-4] This entry is not
                           // a placeholder, it is a measured progression.
    ],
    mixolydian: [
      [[6, 4, 0, 0], 5],   // Ab - F(sus) - Bb - Bb = bVII - V - I - I.
                           // FOREST INTERLUDE A section, bass measured Ab1+Ab2 /
                           // F1+F2 / Bb1+Bb2. [corpus:vgmusic-3]. The bVII is the
                           // defining mixolydian chord. [theory]
      [[0, 0, 6, 6], 3],   // I - bVII vamp. ICE CAVE CHANT sits on A with G above.
                           // [corpus:vgmusic-2]
      [[0, 3, 0, 4], 2],   // I - IV - I - V(sus). DK ISLAND SWING B strain, over a
                           // sustained bass. [corpus:vgmusic-2]
    ],
    major: [
      [[0, 0, 3, 4], 4],   // C - C - F - G. DK64 CRYSTAL CAVES diatonic frame.
                           // [corpus:vgmusic-2]
      [[0, 4, 5, 6], 3],   // Am - E - F - G in A minor read as its relative:
                           // DK64 JUNGLE JAPES. THE E IS MAJOR — G# leading tone,
                           // confirmed in both transcriptions (E/G#, Esus4/G#).
                           // [corpus:vgmusic-2] KIRKHOPE USES A REAL DOMINANT AND
                           // WISE DOES NOT. This is the single clearest musical
                           // difference between the two composers in my data, and
                           // MK2 CANNOT EXPRESS IT — see architectureGaps.
    ],
  },

  bridgeProgressions: {
    minor:      [[[0, 2, 4, 6], 4],    // the thirds chain as the departure
                 [[3, 4, 5, 6], 3],    // the stepwise ascent
                 [[0, 0, 0, 0], 2]],   // ...or the bridge is simply a pedal
    mixolydian: [[[2, 4, 0, 0], 3], [[5, 3, 0, 0], 2]],   // [EAR] rotations
    major:      [[[5, 3, 0, 4], 3], [[0, 2, 4, 6], 2]],   // [EAR]
  },

  /* HARMONIC RHYTHM. Measured per track — one chord per bar is NOT the norm here:
       Aquatic Ambience     2 bars/chord, 8-bar cycle   [corpus:vgmusic-2]
       Stickerbush A        2 bars/chord                [corpus:vgmusic-3]
       Stickerbush B        1 bar/chord                 [corpus:vgmusic-3]
       Forest Interlude A   1 bar/chord, 4-bar cycle    [corpus:vgmusic-3]
       Life in the Mines    1 bar/chord                 [corpus:vgmusic-2]
       Fear Factory         4-16 bars/chord             [corpus:vgmusic-2]
     MK2 hardcodes chordSet[b] with BARS=4, i.e. exactly one chord per bar.
     This key has nowhere to be read. See architectureGaps. */
  chordBars: [[1, 4], [2, 5], [4, 2]],   // [corpus:vgmusic-12]

  /* REGISTERS — measured medians and ranges of the actual parts, not guessed.
     bass    Aquatic C2+C3 (36/48), Forest Ab1+Ab2 (33/45), Mines G1+G2 (31/43),
             Fear Factory E1 (28), Stickerbush A2/C3 (45/48)  [corpus:vgmusic-5]
     keys    pad dyads/triads: Aquatic C4-Eb4-G4 (60,63,67) and Ab3-C4-Eb4
             (56,60,63); Stickerbush C5+E5 (72,76); Forest G#3+D#4 (56,63);
             Mines G4+D5 (67,74); Fear Factory D4+G4 (62,67)  [corpus:vgmusic-5]
     lead    medians: Aquatic 72, Stickerbush 76, Mines 77, Forest 77,
             Fear Factory 79, Crystal Caves 77                [corpus:vgmusic-6]
     counter the filigree/harp line: Forest 68..84; DK64 Crystal Caves bells run
             F5..B7 (77..107)                                 [corpus:vgmusic-2] */
  registers: { bass:    [28, 45],    // [corpus:vgmusic-5]
               keys:    [56, 76],    // [corpus:vgmusic-5]
               counter: [67, 88],    // [corpus:vgmusic-2]
               themeA:  [64, 84],    // [corpus:vgmusic-6] median 72-79
               themeB:  [67, 89],    // [corpus:vgmusic-2] the octave-up restatement
               themeC:  [62, 80] },  // [EAR]

  /* THE COUNTER-LINE. In DKC it is not a harmony below the tune, it is a fast
     arpeggiated filigree ABOVE it — Forest Interlude ch4 (harp) runs G#4-C5-Eb5-C6
     then a repeating Bb5-C6-F5 cell in 16ths; DK64 Crystal Caves has celesta/bells
     at F5..B7. [corpus:vgmusic-2] So: sparse, high, and moving UP. */
  counter: { density: 0.35,                 // [EAR]
             intervals: [3, 4, 5, 7],       // [corpus:vgmusic-2] it goes UP, not down
             octaveUp: true },              // [EAR] needs deriveCounter support

  /* ── stage 5: performance ──────────────────────────────────────────────── */
  groove: {
    styles:     [["even", 10], ["dilla", 0]],
              // [corpus:loveemu] Rare's engine is a tick sequencer at TPQN 32 and
              // the transcriptions are quantised, so I CANNOT measure swing from
              // them. But the engine has no groove template and DKC's rhythm
              // section is machine-locked. Straight is the correct default and I
              // am asserting it, not measuring it. Exception the table cannot
              // hold: DK Island Swing and Bayou Boogie really are swung — see gaps.
    swing:      [1.0, 0.0],       // [corpus:loveemu + EAR] straight. Not 1.5.
    snareEarly: [0.0, 0.0],       // [theory] no human, no push
    kickLate:   [0.0, 0.0],
    hatMul:     1.0,
    jitter:     { dilla: 0.0, even: 0.0 },
              // ZERO. [corpus:loveemu] The sequencer is sample-exact. Adding human
              // jitter to this genre is the single most destructive thing you could
              // do to it — the hypnotic quality of the ostinato comes from it being
              // perfectly, inhumanly identical bar after bar.
    push:       0.0,              // [theory]
  },
  touch: { bassArtic: [[1.0, 10]],       // [corpus:vgmusic-5] the bass rings the FULL
                                         // value — it is a pedal, it never chokes
           strum:     [0.0, 0.0] },      // [corpus:loveemu] a sequencer does not strum

  /* SPACE. The SNES DSP has ONE echo unit: an 8-tap FIR filter feeding a delay
     line, and the FIR is normally set as a gentle lowpass so each repeat gets
     darker [corpus:sneslab, directly verified: "the FIR filter has 8 taps which
     are 1.7 fixed point values"]. Crucially, echo is enabled PER VOICE — Rare's
     engine has events $16/$17 to turn it on and off per channel [corpus:loveemu].
     So the real DKC space is: pads, lead and ostinato drenched; bass and
     percussion bone dry. MK2 has one global wet, so the numbers below are the
     best single compromise and they are [EAR]. */
  space: { wet: 0.34,              // [EAR] roughly double lofi's 0.16
           toneTilt: -0.35,        // [EAR] dark; the FIR lowpass on every repeat
           preDelayMs: 90,         // [EAR] echo, not room. See uncertain.
           perRole: { keys: 0.55, lead: 0.45, ostinato: 0.5, counter: 0.5,
                      bass: 0.0, drums: 0.05 } },   // [EAR] needs per-role sends


/* ═══ NEW KEYS — NONE OF THESE HAVE A READER IN MK2 TODAY ═══════════════════
   Each one below is a table entry that a stage-3 builder would have to be
   written for. I am NOT proposing an if(genre==="dkc") anywhere; I am proposing
   new OWNERS in stage 3 that lofi would configure to no-ops. Flagging loudly
   because two of them are the genre's whole identity. ══════════════════════ */

  /* ── THE OSTINATO. The defining role. A new member of the material family,
     alongside drums/bass/keys/lead/counter. Its rules, all measured: ── */
  ostinato: {
    /* IT NEVER PLAYS THE ROOT. Degrees are 0-indexed diatonic; 0 is excluded
       from every pool below because it was absent from all three ostinati I
       measured (Aquatic {1,2,4,6}; Stickerbush {1,2,6}; Forest {1,3,4,5,6}).
       [corpus:vgmusic-3] This is the highest-confidence generative rule I found. */
    degreePools: [
      [[1, 2, 6, 4],    5],   // Aquatic Ambience literal: 9th, b3, b7, 5
      [[1, 2, 6],       4],   // Stickerbush literal: three pitches only
      [[6, 1, 3, 1, 4, 5, 4, 5, 3, 4], 3],   // Forest Interlude literal, 10 notes
    ],
    /* IT IS FROZEN AND REUSED UNDER EVERY CHORD. Not re-voiced, not snapped to
       chord tones. [corpus:vgmusic-1: Forest Interlude ch1 bars 8,9,10,11 are
       byte-identical while the bass moves Ab-F-Bb-Ab] */
    followsHarmony: false,
    rhythm: [
      [{ grid: 16, cellSteps: 4, repeatsPerBar: 4 }, 5],
                      // Aquatic: one 4-note cell, four times a bar, straight 16ths
                      // [corpus:vgmusic-2, bars 0-1 identical to the tick]
      [{ grid: 16, cellSteps: 16, repeatsPerBar: 1 }, 4],
                      // Stickerbush: a 1-bar cell of 16ths with heavy note-repeat
                      // [corpus:vgmusic-3]
      [{ grid: 8,  cellSteps: 16, repeatsPerBar: 1 }, 3],
                      // Forest Interlude: a 1-bar cell of 8ths [corpus:vgmusic-3]
      [{ grid: 16, cellSteps: 16, repeatsPerBar: 1, monotone: true, octaveJumps: [0, -12, +12] }, 2],
                      // FEAR FACTORY: constant 16ths on ONE pitch class, register
                      // jumping. Measured literally: E5 E4 E4 E4 | E5 E4 E4 E4 |
                      // E3 E4 E4 E4 | E3 E4 E4 E4. [corpus:vgmusic-1, ch0]
                      // Also DK64 Hideout Helm: G1 on every 8th, entire track.
    ],
    register:    [64, 79],      // [corpus:vgmusic-3] Aquatic 67-75, Stickerbush
                                // 67-72, Forest 68-79. ONE OCTAVE WIDE. Never more.
    noteRepeatBias: 0.45,       // [corpus:vgmusic-1] Stickerbush's cell is
                                // B B C C C B B B C C G G G G — mostly repeats
    vel:         0.55,          // [EAR] it sits under the tune, it is not the tune
  },

  /* ── BASS STYLE. MK2's buildBass always plays chordSet[b].rootMidi on pocket
     steps. Every DKC bass I measured does something else. ── */
  bassStyle: {
    mode: [["heldOctave", 6],   // root + root+12 struck together, held the full
                                // chord length. Aquatic C2+C3 (8 beats), Forest
                                // Ab1+Ab2, Mines G1+G2. [corpus:vgmusic-3]
           ["pedal",      3],   // ONE pitch for the whole section regardless of
                                // the chords above. Fear Factory E1 (52% of the
                                // track's duration weight), Hideout Helm G1.
                                // [corpus:vgmusic-4]
           ["pulse",      1]],  // the same one pitch re-struck on every 8th.
                                // Hideout Helm ch0: G1 at steps 0,2,4,6,8,10,12,14
                                // in every bar measured. [corpus:vgmusic-1]
    octaveDouble: true,         // [corpus:vgmusic-3] three of three
    walk:         false,        // [corpus:vgmusic-5] I found zero walking bass
    restChance:   0.0,          // [corpus:vgmusic-5] it never rests
  },

  /* ── KEYS/PAD STYLE. Measured: the pad is a held dyad or triad struck ONCE at
     the top of the chord and left to ring, often only two notes. ── */
  keysStyle: {
    strikes:   [0],             // [corpus:vgmusic-5] one strike per chord, step 0
    holdBeats: [4, 8, 16],      // [corpus:vgmusic-5] Aquatic held 32 sixteenths =
                                // 8 beats; Fear Factory 64 sixteenths = 16 beats
    voices:    [["dyad", 5], ["triad", 4], ["stack5", 2]],
                                // [corpus:vgmusic-4] Stickerbush C5+E5 bare third;
                                // Forest G#3+D#4; Mines G4+D5 bare fifth; Aquatic
                                // full triad; DK64 Crystal Caves a 5-note stack
                                // C-E-F-A-C then C-E-G-B-C [corpus:vgmusic-1]
    add9:      0.6,             // [corpus:shrine] "Cmadd9 - Abadd9 - F7sus4 -
                                // Bbadd9" — add9 and sus4, NOT sevenths
    sevenths:  0.15,            // [corpus:shrine + vgmusic] mostly absent
    cascadeEntry: 0.25,         // [corpus:vgmusic-1] DK64 Crystal Caves builds its
                                // chord one note per beat, each note holding to a
                                // common release: C5(32) B4(28) G4(24) E4(20).
                                // A Kirkhope signature. Needs builder support.
  },

  /* ── LEAD STYLE. Measured properties of the actual tunes. ── */
  leadStyle: {
    pentatonic: 0.85,           // [corpus:vgmusic-6] MEASURED pentatonic coverage
                                // by duration weight of the melody channel:
                                // Aquatic 0.88 (C minPent), Stickerbush 0.84,
                                // Fear Factory 0.82, DK64 Crystal Caves 0.82,
                                // Forest Interlude 0.79, Life in the Mines 0.79,
                                // DK64 Japes 0.69. Mean 0.83. The tunes are
                                // pentatonic while the CHORDS are 7-note modal.
    octaveRestate: 0.5,         // [corpus:vgmusic-2] state a short cell, then
                                // restate it +12 immediately. Life in the Mines
                                // bar 8 literally: Bb4 C5 D5 | Bb5 C6 D6 in the
                                // same bar. Stickerbush bars 8-9 then bars 12-13
                                // the same phrase an octave up. THE most audible
                                // Wise device MK2's stage 3 cannot currently make.
    fromOstinato: 0.6,          // [corpus:vgmusic-1] Stickerbush's tune uses the
                                // ostinato's exact three pitches (G B C) an octave
                                // up. The melody is DERIVED FROM THE OSTINATO, not
                                // from the chords — which is exactly MK2's own
                                // "everything derived from A" law, applied to a
                                // different A.
    pickup: 0.5,                // [corpus:vgmusic-1] Stickerbush's phrase enters at
                                // step 10 of the PREVIOUS bar. Its onset histogram
                                // peaks at 0 and then at 14.
    durations16: [[2,4],[3,3],[1,2],[5,2],[10,1]],
                                // [corpus:vgmusic-2] Stickerbush 2:40% 3:26% 10:11%
                                // 6:9% 4:9%; Life in the Mines a limping 2-1-5 cell
    stepVsLeap: 0.48,           // [corpus:vgmusic-6] step(1-2st) share of intervals:
                                // Aquatic 0.48, Stickerbush 0.45, Mines 0.64,
                                // Fear Factory 0.45, Crystal Caves 0.48. Near 50/50.
    bend: { chance: 0.3, cents: 100, ms: 120 },
                                // [corpus:shrine] Aquatic's "melodica out of the
                                // harmonica sample", the "mini Shepard tone" and
                                // "barely perceptible mini bass scale" are all
                                // PITCH BENDS, not discrete notes. Rare's engine has
                                // dedicated pitch-slide events $08/$09 [corpus:loveemu].
                                // The cents/ms values are [EAR].
  },

  /* ── PERCUSSION LANE that MK2 has no name for. Present in 19 of 26 DKC files
     and 12 of 16 DK64 files, and its onset histogram is EVEN across all 16
     sixteenths — a continuous shaker/conga/triangle bed, not a kit part.
     [corpus:vgmusic-42] Life in the Mines uses GM 80/81 (mute+open triangle) and
     64 (hi bongo) heavily; Aquatic uses 82 (shaker) and 62 (mute hi conga). ── */
  tunedPerc: { present: 0.73,       // [corpus:vgmusic-42] 31 of 42 files
               every: 2,            // [EAR] the bed's grid
               vel: 0.28 },         // [EAR]

  /* ── NO DRUMS AT ALL is a legitimate DKC section. Ice Cave Chant has zero
     percussion in BOTH transcriptions; DK64 Gloomy Galleon and Fungi Forest
     Nighttime likewise. [corpus:vgmusic-5] Stage 4's ROLES map is a hardcoded
     const, so this cannot currently be said. ── */
  roles: {
    intro:        ["keys", "ostinato", "bass"],
    verse:        ["keys", "ostinato", "bass", "lead", "tunedPerc"],
    chorus:       ["keys", "ostinato", "bass", "lead", "counter", "drums", "tunedPerc"],
    bridge:       ["keys", "bass", "lead"],
    instrumental: ["keys", "ostinato", "bass", "tunedPerc"],
    outro:        ["keys", "ostinato", "bass"],
  },   // [EAR] shaped by the measurement that percussion is often absent, but the
       // specific per-section assignment is my taste, not a measurement.
  drumlessChance: 0.15,   // [corpus:vgmusic-5] 5 of 42 analysed files

  /* ── PALETTE. Which V.<name> plays what, and the ONE new voice. ── */
  palette: {
    bass:      "dkcBass",       // [EAR] a soft sine/triangle with a slow attack, an
                                // octave-doubled root, no pluck. It is a pedal.
    keys:      "dkcPad",        // [EAR] slow-attack string/choir pad, heavily wet
    ostinato:  "dkcPluck",      // [EAR] short marimba/kalimba/plucked-string with a
                                // fast decay — Stickerbush's cell is transcribed as
                                // GM 108 kalimba by one transcriber and GM 11/12
                                // vibes/marimba by two others [corpus:vgmusic-3]
    lead:      "dkcFlute",      // [corpus:vgmusic-3] transcribers reach for GM 73/74
                                // (flute/pan flute) and GM 76 (bamboo flute) for the
                                // Life in the Mines and Aquatic tunes
    counter:   "dkcBell",       // [corpus:vgmusic-1] DK64 Crystal Caves uses GM 98
                                // (crystal) at F5..B7
    tunedPerc: "dkcShaker",     // [corpus:vgmusic-42]

    /* ── THE ONE NEW VOICE THIS GENRE NEEDS ─────────────────────────────────
       V.wavesequence — a pad whose TIMBRE steps through a short cycle of
       different waveforms while a single note is held.

       This is not a flourish; it is the documented technique that produced the
       most famous cue in the genre. Wise: "just [took] eight waveforms and played
       them in sequence and that first experiment became the baseline for 'Aquatic
       Ambiance'" [corpus:wikipedia-AquaticAmbience, quoting Wise]. He was
       emulating a Korg Wavestation, which "takes tiny waveforms and re-sequences
       them back together again" — he chose it because it gave movement for almost
       no memory, and he had 64K total [corpus:vgmonline via search, corpus:ocremix
       "I was trying to surpass the limitations of the 64K memory"]. He spent five
       weeks on the piece, "mostly on the technical side" [corpus:wikipedia].

       Web Audio shape: build one PeriodicWave per step of the cycle from a seeded
       harmonic table, and crossfade an oscillator between N of them on a fixed
       period (period drawn per song, not per note, so the same seed gives the same
       timbre). Eight steps, per the quote. That single voice does more for genre
       recognition than any amount of composition tuning, and nothing else in MK2
       wants it.
       ───────────────────────────────────────────────────────────────────────── */
    newVoice: { name: "wavesequence", steps: 8, cyclePeriodSec: [0.35, 0.9],
                crossfade: 0.5 },   // steps:8 [corpus:wikipedia, Wise's own words];
                                    // the timings are [EAR]
  },
},
```

## What MK2's architecture cannot express

- THE BIG ONE — THERE IS NO MATERIAL THAT IGNORES THE HARMONY. Every builder in stage 3 takes a chordSet and reads chordSet[b]; buildTheme even snaps its last note to a chord tone via nearestTone(). DKC's defining part is a FROZEN PITCH CELL reused unchanged under a moving bass — Forest Interlude's ostinato is byte-identical across bars 8/9/10/11 while the bass goes Ab-F-Bb-Ab. The dissonance IS the harmony. To express this you need a new role in the material family whose builder takes NO chordSet. That is not a correction pass and does not violate any law — it is a new OWNER — but it is a code change, not a table entry, and without it this genre cannot be built. Say it out loud before anyone tries.

- HARMONIC RHYTHM IS HARDCODED AT ONE CHORD PER BAR. makeMaterials has `const BARS = 4` and every builder indexes chordSet[b] with b in 0..3. Measured DKC harmonic rhythms: Aquatic Ambience 2 bars/chord over an 8-bar cycle; Fear Factory 4 to 16 bars/chord; Forest Interlude 1 bar/chord. A `chordBars` key has nowhere to be read, and an 8-bar loop cannot be built at all. This is the second-biggest hole and it affects the most famous track in the genre.

- THE BASS CANNOT HOLD A PEDAL. buildBass unconditionally plays chordSet[b].rootMidi — the bass follows the chord by construction. Fear Factory's E is 52% of the track's duration weight; Hideout Helm's G never changes for the entire track. `bassStyle:"pedal"` requires a bass builder that does not read the chord root. Same class of change as the ostinato gap. Related smaller item: MK2 emits one pitch per bass event, but every DKC bass I measured strikes root AND root+12 together — that one IS just a builder flag.

- STAGE 4's ROLES AND MAT MAPS ARE HARDCODED CONSTS, NOT TABLE ENTRIES. `const MAT` and `const ROLES` sit inside makeArrangement. DKC needs (a) a new 'ostinato' role and a new 'tunedPerc' lane to appear in section role lists, and (b) sections with NO drums at all — Ice Cave Chant has zero percussion in both transcriptions, and 5 of 42 analysed files have none. Neither is sayable today. The brief's own requested table shape has a `form: { sections enabled }` key with no reader.

- NO MIXOLYDIAN IN `MODES`, AND NO WAY TO SAY 'MELODY IS PENTATONIC WHILE THE CHORDS ARE NOT'. Adding mixolydian:[0,2,4,5,7,9,10] is trivial and safe. The pentatonic problem is not: buildTheme walks by scaleStep() in the song's 7-note mode, and I measured DKC melodies at 79-88% pentatonic coverage while their harmony uses the full mode. There is no slot for a separate melodic scale, and degMidi/scaleStep are global helpers keyed on a single `mode`.

- NO CHROMATICISM AT ALL — WHICH BREAKS THE KIRKHOPE HALF OF THE BRIEF. chordTones() stacks thirds strictly inside the mode, and progressions are diatonic degree indices. That cannot express: DK64 Jungle Japes' E MAJOR dominant in A minor (a raised 7th, measured in two independent transcriptions); DK64 Crystal Caves' C major to Ab; Life in the Mines' intro, which drifts F#/G#/A#/Caug over a static C pedal; Fungi Forest's F#dim planing over a C pedal; Hideout Helm's Edim colour over G. The requested `harmony: { borrowedChords }` key has literally nowhere to live. This is a genuine architectural limit, not a table gap — and it means DK64 and DKC are arguably not the same genre key. Consider splitting `dkc` (Wise, modal, no dominants) from `dk64` (Kirkhope, functional V, chromatic mediants) rather than papering over it.

- STAGE 3 CANNOT MAKE THE MOST AUDIBLE WISE DEVICE: state a cell, restate it immediately +12. Life in the Mines does it inside one bar (Bb4 C5 D5 | Bb5 C6 D6). Stickerbush does it two bars later (B4 C5 G5 -> B5 C6 G6). MK2's derivations are hook(A)=inverted DNA, depart(A)=augmentation, vary(A)=redraw-second-half. 'Same cell, octave up' is a fourth derivation and it is missing. This one is cheap to add and buys a lot.

- MELODY IS DERIVED FROM THE OSTINATO, NOT FROM THE CHORDS. Stickerbush's tune is literally the ostinato's three pitches an octave up. MK2 already believes in derivation (deriveCounter reads themeA), so the shape is right — but there is no ostinato to derive from, so the chain has no head. This falls out of fixing gap 1.

- SPACE IS ONE GLOBAL WET SEND. `g.wet.gain.value = 0.16` with a fixed set of roles feeding it. The SNES DSP enables echo PER VOICE (Rare's engine has events $16/$17 to toggle it per channel), and the DKC sound is drenched pads over bone-dry percussion and bass. A `space.perRole` map has no reader. Medium severity — you can approximate with one value — but it costs real character.

- SECTION_LEN IS A MODULE CONST WITH intro:4. Aquatic Ambience's intro is described by an outside analysis as 'super long' and the harmonic cycle is 8 bars, so a 4-bar intro cannot even state the loop once. Section lengths need to come from the genre table.

- TEMPO IS TRIMODAL AND `tempo: [lo, hi]` FLATTENS IT. Measured clusters at 72-82, 94-110 and 128-146 with almost nothing between 82 and 94. A uniform draw over [72,146] spends most of its time in a tempo region where no DKC track exists. This one is NOT an architecture hole — a wpick over ranges fits stage 1 fine, precedent already exists in keysChar — but it does need `tempoBands` to be read instead of `tempo`. Related: the tempo band and the arrangement are correlated in the real corpus (a 75-bpm cue has no kit and a huge pad; a 135-bpm cue has a full kit and a monotone ostinato), so a 'scene' draw in stage 1 that gates both is the honest model — and that lands back on the hardcoded ROLES map in gap 4.

- SWING/JITTER DEFAULTS ARE ACTIVELY HARMFUL HERE AND THE TABLE CAN SAY SO — but note the one thing it can't: DK Island Swing and Bayou Boogie really are swung while Aquatic Ambience and Fear Factory really are not, within the same game. A single per-genre swing value cannot hold that. If you want both, swing has to be drawn per song alongside the tempo band, not fixed per genre.

- THE 'sega' RIG IS THE WRONG CONSOLE AND THERE IS NO 'snes' RIG. RIG has band and sega (YM2612 FM). DKC is a sample-playback chip with an 8-tap-FIR echo, not FM. I have weighted sega to 0 above so the draw still runs and always lands on band, which is honest but wasteful. The real answer is a third rig entry whose voices are the palette above.


## Numbers the researcher flagged as UNCERTAIN

- METHODOLOGY CAVEAT, applies to every [corpus:vgmusic-N] number: these are FAN MIDI TRANSCRIPTIONS from vgmusic.com, not the game's own sequence data. I could not extract Rare's SPC sequences (that needs SPC emulation). Reliability tiers: PITCH CONTENT is high confidence (independent transcribers agree note-for-note — e.g. three separate people transcribed Stickerbush's ostinato as the same three pitches). TEMPO is good (MIDI medians agree with songbpm/tunebat cover BPMs within a few percent on 4 of 4 tracks I could cross-check). DRUM-KIT NUMBERS ARE WEAK — the GM drum note is the transcriber's choice, so 'kick on step 7' may mean 'a low percussion hit on step 7'. Do not treat the pocket table as measured Wise.

- Hooktheory returned HTTP 403 on every attempt (both www and devhookpad hosts). I never read a Hooktheory theorytab directly. The 'Bb Mixolydian / D Dorian' reading of Forest Interlude reached me only as a search-engine summary of a Hooktheory page — but I independently confirmed Bb mixolydian from three MIDIs, so the conclusion stands on my own measurement, not on Hooktheory.

- The VGMO David Wise interview (vgmonline.net/davidwiseinterview) fetched EMPTY twice. The Korg Wavestation quotes I used came from Wikipedia's Aquatic Ambience article (which cites Wise directly) and from OverClocked ReMix's interview, both of which I did read. Anything attributed to VGMO reached me only via search summary.

- The Forbes Kirkhope interview and the VGM Academy Kirkhope interview both failed (403 and 503). I have NO direct Kirkhope quotes about his compositional method. Everything I say about Kirkhope is measured from MIDIs, not from his own words. In particular I did not verify with any source that Kirkhope deliberately used functional dominants — I measured E major with a G# in two independent Jungle Japes transcriptions and inferred it.

- SNES echo maximum delay '240 ms' — this came from a search summary of k0b3n4irb.github.io/opensnes/snes_sound_guide.html, which I did NOT fetch directly. The 8-tap FIR figure IS directly verified from sneslab.net. Treat 240 ms as unconfirmed.

- space.wet 0.34, space.toneTilt -0.35, space.preDelayMs 90, and the entire space.perRole map: [EAR]/[GUESS]. I have the hardware fact that echo is per-voice and lowpassed, and nothing else. No measurement of wet/dry balance exists in a MIDI file.

- The ENTIRE form block — coldOpen 0.05, openVerse 0.85, target [48,4,8], all transition weights, all energy values, introBars 16: [EAR]. I measured no form data. I did not count section lengths, count repeats, or measure where sections change. introBars 16 is my number attached to a qualitative source phrase ('super long intro'). The energy values being flat and never reaching 1.0 is a taste judgement I believe strongly but did not measure.

- swing 1.0 / jitter 0.0 / snareEarly 0 / kickLate 0: ASSERTED, not measured. Quantised transcriptions cannot show swing. I am reasoning from the fact that Rare's engine is a tick sequencer with no groove template. If DKC does have engine-level swing anywhere I would not have seen it.

- kit.ghostChance 0.10 and ghostSpots [7,11,15]: [GUESS]. I found no ghost-note evidence whatsoever. Zero would arguably be more honest than 0.10.

- kit.flourish weights, all `variants` values, hatVel 0.42, tunedPerc.every 2 and vel 0.28: [EAR], no measurement.

- counter.density 0.35, counter.octaveUp, leadStyle.bend cents/ms, keysStyle.cascadeEntry 0.25, ostinato.vel 0.55, palette.newVoice cyclePeriodSec and crossfade: [EAR].

- leadStyle.octaveRestate 0.5, fromOstinato 0.6, pickup 0.5: the BEHAVIOURS are measured (I can point at the exact bars), but the PROBABILITIES are invented. I saw octave-restatement in 2 tracks and pickup entry in 1; I have no basis for 0.5.

- The 'melody channel' in my analyser is picked by heuristic (monophonic, mid-high register, pitch variety). It picked the ostinato instead of the tune at least once (Aquatic Ambience, ch2). The pentatonic-coverage figures are therefore per-channel measurements of whatever channel the heuristic chose, which I spot-checked but did not verify one by one.

- Crystal Caves tempo 54-56: both transcriptions agree, but that is suspiciously slow and may mean the track is notated in half-time; the felt pulse could be ~110. I did not resolve this.

- modes weights [minor 6, mixolydian 3, major 1]: derived from tonal-centre judgements I made across 10 tracks. The tonal centre of DK Island Swing in particular I could not settle — its bass sits on Bb while the pitch content reads G-centred. I excluded it from the count as ambiguous.

- chordBars weights [[1,4],[2,5],[4,2]]: the per-track harmonic rhythms are measured; the weights across them are my apportionment.

- I did not analyse DKC3 at all beyond seeing filenames, and I did not analyse 'Bramble Blast' separately from 'Stickerbush Symphony' (they are the same cue under two names).


## Sources

- https://videogamemusicshrine.com/inside-the-score-donkey-kong-country-aquatic-ambience/

- https://en.wikipedia.org/wiki/Aquatic_Ambience

- https://en.wikipedia.org/wiki/David_Wise_(composer)

- https://ocremix.org/info/Composer_Interview:_David_Wise

- https://loveemu.hatenablog.com/entry/20130819/SNES_Rare_Music_Spec

- https://sneslab.net/wiki/FIR_Filter

- https://songbpm.com/@david-wise/stickerbrush-symphony

- https://songbpm.com/@david-wise

- https://songbpm.com/@good-knight-productions/forest-interlude-from-donkey-kong-country-2

- https://www.vgmusic.com/music/console/nintendo/snes/

- https://www.vgmusic.com/music/console/nintendo/n64/

- https://www.timeextension.com/news/2024/11/grant-kirkhope-explains-why-some-donkey-kong-64-tracks-are-missing-from-his-new-remix-album

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_Water-KM.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_-_Aquatic_Ambience.mid

- https://www.vgmusic.com/music/console/nintendo/snes/Dk1water.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkccoral.mid

- https://www.vgmusic.com/music/console/nintendo/snes/Dkcwater2.mid

- https://www.vgmusic.com/music/console/nintendo/snes/SNES_DKC_Brambles.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKQBrmbl.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC2_-_Stickerbush_Symphony.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkc2bram.mid

- https://www.vgmusic.com/music/console/nintendo/snes/bramscrm.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkc2scram.mid

- https://www.vgmusic.com/music/console/nintendo/snes/stickerbrush.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC2_-_Forest_Interlude.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC2_Enchanted_Wood-KM-v2.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkc2enwd.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_-_Life_in_the_Mines.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_Mines-KM.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkcwink.mid

- https://www.vgmusic.com/music/console/nintendo/snes/winky.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_-_Fear_Factory.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_Factory-KM.mid

- https://www.vgmusic.com/music/console/nintendo/snes/dkcoil1.mid

- https://www.vgmusic.com/music/console/nintendo/snes/DKC_Jungle-KM.mid

- https://www.vgmusic.com/music/console/nintendo/snes/Dkcjungle.mid

- https://www.vgmusic.com/music/console/nintendo/snes/Dkcice.mid

- https://www.vgmusic.com/music/console/nintendo/snes/Dk1ice.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64_japes_arr.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64_jungle_2.1.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64crystalcaves-v1_2.mid

- https://www.vgmusic.com/music/console/nintendo/n64/crystal_caves_v2.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64_hideout-helm.mid

- https://www.vgmusic.com/music/console/nintendo/n64/DK64_-_Hideout_Helm.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64fungi.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64gall.mid

- https://www.vgmusic.com/music/console/nintendo/n64/DK64_-_Creepy_Castle.mid

- https://www.vgmusic.com/music/console/nintendo/n64/dk64_frantic_factory.mid
