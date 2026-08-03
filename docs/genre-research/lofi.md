# lofi hip hop (jazz-hop / boom-bap ancestry → modern "beats to study to")

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

TWO things, and MK2 currently gets one of them half-right and the other wrong.

(1) THE VEIL, not the notes. A jazz-extended keyboard loop — maj7 / m7 / m9, Rhodes or detuned upright piano — heard through an audible loss of fidelity: a continuous noise floor (vinyl crackle AND broadband tape hiss), high end gone, and slow pitch drift on the WHOLE program. Strip the veil and the identical notes are neo-soul or jazz. The genre is literally named for its fidelity: the Roland SP-303/SP-404 shipped "Lo-Fi" and "Vinyl Sim" as buttons, and the 303's 11.025 kHz sampling mode puts a hard Nyquist wall at 5.5 kHz (musictech.com SP-303 feature). A listener names this genre in the four bars BEFORE the drums enter — which is why nearly every track opens with chords + crackle and nothing else.

(2) A soft, un-quantised boom-bap kit at 70-95 bpm whose hits DO NOT LINE UP with the loop. Muffled kick, backbeat on 2 and 4 that is often a rim click rather than a full snare, hats shuffling against everything. The friction between a stable layer and a displaced layer is the point (Peterson: kicks anticipating metric locations by a 32nd note; "10 of 13 kick notes fell outside typical metric locations" in "Keep It On"), and the deviations REPEAT IDENTICALLY every bar — the repetition is what magnifies it (Charnas, via MusicRadar).

If forced to ONE: the veil. Perfect Dilla drums under a clean 24-bit Rhodes is not lofi; a stiff quantised loop under real tape hiss and a 5 kHz ceiling is.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   LOFI HIP HOP — genre table.
   Provenance key:
     [corpus:X]  measured / documented in source X
     [corpus:X?] taken from an ALGORITHMIC estimator (Spotify audio-analysis,
                 Chordify). Directionally useful, NOT hand-measured. Verify by ear.
     [theory]    music-theory fact
     [EAR]       taste, awaiting a listen
     [GUESS]     I could not find a measurement. Named as a guess on purpose.
   Every weight in every wpick table below is [EAR] or [GUESS] unless it says
   otherwise — nobody publishes weighted distributions for this music.
   ═══════════════════════════════════════════════════════════════════════════ */

lofi: {

  /* ── TEMPO ────────────────────────────────────────────────────────────────
     MK2 currently draws 74 + round(rng()*18) → 74..92 UNIFORM. Two problems:
     the founding canon is at or ABOVE that ceiling, and the distribution is flat
     when the real one is bimodal. The genre has two tempo populations:

       "jazzhop"  — Nujabes / Dilla / Madlib ancestry, boom-bap tempo
         Nujabes "Feather" 91 · "Luv(sic)" 94 · "Aruarian Dance" 100
           [corpus:songbpm?/chordify?]
         Nujabes "After Hanabi -Listen To My Beats-" 83 [corpus:songbpm?]
         Metaphorical Music album floor 89 bpm [corpus:getsongbpm?]
         J Dilla "Time: The Donut of the Heart" 93 [corpus:songbpm?]
         Donuts opens ~96, closes ~95 [corpus:musicstax?]
         NOTE: Donuts' reported album range 80-194 and "Two Can Win" 185 are
         DOUBLE-TIME MISREADS of ~92 — a warning that every number in this
         paragraph came out of a tempo estimator, not a stopwatch.

       "study"    — post-2015 Lofi Girl / Chillhop canon
         "70 to 90 BPM" (MasterClass); "65-95" (Lunacy); radio streams
         "anchor around 80-85" [corpus:bpmcalc / masterclass / orphiq]
         Jinsang "Solitude" (2016) and Tomppabeats "Harbor" (2016) are the
         canonical LPs [corpus:rateyourmusic top lo-fi-hip-hop chart]

     DO NOT trust the widely-repeated "study playlists average 112 bpm"
     (RouteNote, n>100k): Spotify's estimator doubles half-time beats. A 56 bpm
     lofi track reads as 112. That number is an artifact, not a finding. */
  tempo: [72, 98],                                    // union of both populations
  tempoBands: [                                       // draw the BAND, then uniform inside it
    [[76, 88], 6],   // "study": the modal lofi tempo [corpus:masterclass/bpmcalc 70-90]
    [[88, 98], 3],   // "jazzhop": where Nujabes/Dilla actually sit [corpus:songbpm?]
    [[70, 76], 1],   // the slow/hazy tail [EAR — Idealism/Eevee territory, unmeasured]
  ],

  /* ── MODES ────────────────────────────────────────────────────────────────
     MK2 has [minor 5, dorian 4, major 2]. Dorian is well earned; major is
     badly under-weighted. The documented lofi progression canon is majority
     MAJOR-key maj7 material (ii-V-I, I-vi-ii-V, the neo-soul vamp), and
     Nujabes "Feather" is Db MAJOR [corpus:chordify? Db-Ebm7-Ab-Bbm]. */
  modes: [
    ["minor",  5],   // aeolian: the melancholy default [EAR]
    ["dorian", 4],   // "Aruarian Dance" is G# dorian: i-ii-IV-bVII [corpus:chordify?]
    ["major",  4],   // raised from MK2's 2: the ii-V-I canon lives here [corpus:chordoo/emastered]
  ],
  /* MISSING MODE, flagged not supplied: lofi's fourth colour is MAJOR WITH
     BORROWED bVI/bVII and SECONDARY DOMINANTS. MK2 cannot express it — see
     architectureGaps #3. Adding a "mixolydian" row would NOT get you there. */

  /* ── SWING ────────────────────────────────────────────────────────────────
     Expressed as the MPC dial these records were actually made on, because
     that is the historical parameter and it converts cleanly:
         ratio = pct / (100 - pct)      [theory: Roger Linn's definition —
         "I merely delay the second 16th note within each 8th note"]
         50%→1.000  52%→1.083  54%→1.174  58%→1.381  62%→1.632  66%→1.941
     Measured ground truth for the ancestor genre: 14 canonical funk grooves
     swing between 1.07:1 ("Cold Sweat", "Funky Drummer") and 1.8:1 ("Papa Was
     Too"), NONE reaching triplet 2:1 — "somewhere between regular sixteenth
     notes and sixteenth triplets" [corpus:Ainsworth, ZGMTH "Microtiming in
     Early Funk", >1000 measured deviations].
     MK2 currently draws 1.50..1.66 — a narrow slice at the TOP of that measured
     range, and it misses the low end entirely, which is where "straight but
     loose" lives (Linn: "54% will loosen up the feel without it sounding like
     swing"). */
  swing: {
    style: "sixteenth",                 // [corpus:Linn/MPC — swing is a 16th operation, NOT an 8th one]
    pct:   [[52, 2], [54, 4], [58, 5], [62, 4], [66, 1]],  // weights [EAR]; values [corpus:Linn/melodiefabriek]
    ratio: [1.08, 0.77],                // = [lo, range] equivalent of pct 52..66 [theory: pct/(100-pct)]
    hatMul: 1.0,                        // hats carry the swing; they are the shuffle [EAR]
    kitMul: 1.0,                        // kick/snare swing WITH the hats; the friction is the
                                        //   displacement below, not a second swing grid [EAR]
    melodyMul: [[1.0, 5], [0.0, 4]],    // THE FRICTION, drawn: either the loop swings with the
                                        //   kit, or the loop is a STRAIGHT sample and only the
                                        //   drums shuffle. Both occur; the coexistence of a
                                        //   straight and a swung layer is the Dilla thesis
                                        //   [corpus:Charnas via grokipedia/4columns]
    jitterMs: [[1.5, 6], [5.0, 4]],     // 1.5 ms in "dilla" mode: the deviations REPEAT
                                        //   IDENTICALLY every bar and the repetition is what
                                        //   magnifies them [corpus:Charnas via MusicRadar].
                                        //   MK2's existing 2 ms / 5 ms split is already right —
                                        //   this is the one timing number in the file I would
                                        //   not touch.
  },

  /* ── MICROTIMING (the drunk drums) ────────────────────────────────────────
     UNITS: milliseconds, not fractions of a 16th. MK2 stores steps, which makes
     the offset tempo-invariant in beats and tempo-VARIANT in ms — backwards.
     The MPC3000 nudge is 1/96 quarter = 7.5 ms at 83 bpm [corpus:MPC3000 96 ppq];
     Dilla called these moves "baby hairs" [corpus:Charnas via 4Columns].
     MAGNITUDE: the documented anticipation is A 32ND NOTE = 90 ms at 83 bpm
     [corpus:Peterson dissertation, "anticipate metric locations by a 32nd note"];
     Charnas's headline figure is "about 65 milliseconds" [corpus:via MusicRadar].
     MK2's current -0.10..-0.25 steps = 18-45 ms at 83 bpm — HALF to a THIRD of
     the measured figure. It will read as "slightly loose", never as Dilla.
     DIRECTION: the sources genuinely disagree, so DRAW IT, do not assert it.
       Peterson (measured):  kick EARLY by a 32nd; "snare slightly early to 2 and 4"
       Ainsworth (measured): beat 4 relatively early in 8/14 funk tracks; little
                             evidence of systematic backbeat DELAY
       Questlove / drummer lore: hats DRAGGED a 32nd, snare BEHIND
       MusicRadar summary:   "a kick hits 30ms early here, a snare drags by 20ms there"
     Conclusion: the FRICTION is the constant of the genre. The sign is not. */
  micro: {
    unit: "ms",
    configs: [                                       // [lane, ms] — negative = early
      [{ kick: -70, snare: -12, hat: 0 },  4],       // Peterson's measured shape: kick anticipates
                                                     //   a 32nd (~80 ms at 90 bpm), snare a hair early
      [{ kick: 0,   snare: -55, hat: 0 },  3],       // Charnas's ~65 ms snare, kit otherwise anchored
      [{ kick: +22, snare: -30, hat: 0 },  2],       // MK2's current shape (kick late / snare early),
                                                     //   kept because it is one documented reading and
                                                     //   it is what the shipped file already sounds like [EAR]
      [{ kick: 0,   snare: +20, hat: +35 }, 2],      // the Questlove drag: hats and backbeat behind
      [{ kick: 0,   snare: 0,   hat: 0 },  3],       // "even": no displacement. Madlib/SP-303 records
                                                     //   are frequently just... not straight-quantised
                                                     //   rather than deliberately displaced [EAR]
    ],
    globalRushMs: 0,        // MK2 applies micro += -0.008/spb to EVERY drum event —
                            // a flat 8 ms rush with NO provenance. That is a bare magic
                            // number by the file's own Law 8. Either source it or zero it.
  },

  /* ── POCKET (kick placements, 16ths) ──────────────────────────────────────
     MK2's four pockets ALL contain step 0 and step 10. Consequence: a kick that
     is not on the downbeat can never happen — which is precisely the thing
     Peterson measured Dilla doing ("10 of 13 kick notes fell outside typical
     metric locations"). Widened below, and the "one" is allowed to be implied. */
  pocket: [
    [[0, 10],        5],   // the boom-bap skeleton: 1 and the "&" of 3 [EAR]
    [[0, 6, 10],     3],   // [EAR]
    [[0, 10, 11],    2],   // the doubled kick — the flam that reads as "drunk" [EAR]
    [[0, 7, 10],     2],   // MK2's existing [EAR]
    [[0, 3, 10],     2],   // [EAR]
    [[0, 8, 14],     1],   // [EAR]
    [[3, 10],        1],   // THE ONE IS IMPLIED — no kick on the downbeat.
                           //   Impossible in MK2 today. [corpus:Peterson, off-grid kick placement]
  ],

  /* ── DRUMS ────────────────────────────────────────────────────────────────
     What MK2 does now: snare hardcoded on 4 and 12 at vel 1.0, hats on every
     even step at a flat 0.62, ONE ghost per bar at p=0.55, openhat on bars 1&3.
     Wrong in four ways, listed inline. */
  drums: {
    backbeat: [                                       // steps 4 and 12 always, but WHICH voice:
      [["snare",  "snare"], 4],                       // both a full snare [EAR]
      [["rim",    "snare"], 3],                       // rim click on 2, snare on 4 — the single
                                                      //   fastest lofi tell. Lofi kits are sold as
                                                      //   "gentle snares & rimshots"
                                                      //   [corpus:loopmasters Lofi Hip Hop Drums]
      [["rim",    "rim"],   2],                       // the whole backbeat is a cross-stick [EAR]
      [["snare",  "rim"],   1],                       // [EAR]
    ],
    backbeatVel: 0.85,        // NOT 1.0. In this genre the backbeat is soft/dull, not the
                              //   loudest thing in the bar [EAR]
    hatPattern: [
      [[0,2,4,6,8,10,12,14],                       5],  // 8ths — MK2's only option today [EAR]
      [[0,2,3,4,6,7,8,10,11,12,14,15],             3],  // 8ths + the "a" — the shuffle carrier [EAR]
      [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],    2],  // straight 16ths [EAR]
      [[0,4,8,12],                                 2],  // quarters only, or no hats at all —
                                                        //   very common in the sparsest lofi [EAR]
    ],
    hatVel: [0.30, 0.55],     // range, not MK2's flat 0.62. Hats sit UNDER everything here.
                              //   [GUESS — I found no measured hat-level data for this genre]
    ghostPerBar: [[1,2],[2,4],[3,3],[4,1]],  // [count, weight]. MK2 gives 0.55 ghosts/bar;
                              //   the boom-bap kit runs 2-4. The snare row IS the ghosting —
                              //   MK2's own DRUM_ACCENT snare row (backbeats 1.0, everything
                              //   else under half) already encodes that, it just never gets
                              //   enough NOTES to show it. [GUESS on the counts — the
                              //   1150-performance median in DRUM_ACCENT is cross-genre]
    ghostSteps: [3, 5, 7, 9, 11, 13, 15],   // ghosts live on 16ths between the backbeats [theory]
    ghostVel: 0.22,           // MK2 uses 0.35; too loud once there are 2-4 of them [EAR]
    openhatSteps: [[14, 4], [7, 2], [-1, 5]],   // -1 = none. MK2's table, weight on "none" raised [EAR]
    perc: [["shaker", 3], ["none", 6], ["ride", 1]],  // the layer added at loop occurrence 2 [EAR]
    fills: {
      density: 0.15,          // MK2 fires a fill into EVERY chorus/bridge. In lofi the
                              //   transition device is a DROPOUT or a filter sweep, not a fill:
                              //   "isn't about big drops or crazy transitions"
                              //   [corpus:audioplugin.deals / edmprod arrangement guides]
      style: "snareRoll16",   // when it does fire, MK2's existing fill is fine [EAR]
    },
  },

  /* ── PROGRESSIONS (0-indexed scale degrees, MK2 convention) ───────────────
     minor:  0=i 1=ii° 2=III 3=iv 4=v 5=VI 6=VII
     dorian: 0=i 1=ii  2=III 3=IV 4=v 5=vi° 6=VII
     major:  0=I 1=ii  2=iii 3=IV 4=V  5=vi 6=vii°
     MK2's existing pools are not bad — [1,4,0,5] and [0,5,1,4] ARE the documented
     lofi ii-V-I and I-vi-ii-V. What is missing is every progression I could
     actually trace to a record. */
  progressions: {
    minor: [
      [[3, 0, 6, 2], 4],   // iv-i-bVII-bIII — Nujabes "Luv(sic)": F#m7-C#m7-Bm7-Emaj
                           //   [corpus:chordify?] MISSING FROM MK2
      [[0, 3, 6, 2], 4],   // i-iv-bVII-bIII — Am7-Dm7-G7-Cmaj7, "cycles the relative
                           //   major's ii-V-I while feeling rooted in minor"
                           //   [corpus:chordoo/unison] MISSING FROM MK2
      [[0, 5, 2, 6], 3],   // i-VI-III-VII [MK2 existing, keep]
      [[0, 6, 5, 6], 3],   // i-bVII-bVI-bVII — "the simple minor groove, boom bap lofi"
                           //   [corpus:chordoo] MISSING FROM MK2
      [[0, 3, 5, 6], 2],   // i-iv-VI-VII [MK2 existing, keep]
      [[5, 3, 0, 6], 1],   // VI-iv-i-VII [MK2 existing, keep]
      [[0, 3, 0, 3], 1],   // the two-chord vamp. NOTE: this is a FAKE — it is a
                           //   2-chord loop written as 4 one-bar chords because MK2
                           //   hardcodes one chord per bar. See architectureGaps #2.
    ],
    dorian: [
      [[0, 1, 3, 6], 5],   // i-ii-IV-bVII — Nujabes "Aruarian Dance":
                           //   G#m7-A#m7-C#7-F#maj. The minor ii and the MAJOR IV
                           //   are what make it dorian rather than aeolian.
                           //   [corpus:chordify?] MISSING FROM MK2 — and it is the
                           //   single most identifiably-Nujabes progression there is.
      [[0, 3, 0, 3], 4],   // i-IV vamp [MK2 existing, keep — the dorian shuttle]
      [[0, 3, 4, 3], 3],   // [MK2 existing, keep]
      [[0, 5, 3, 4], 2],   // [MK2 existing — but degree 5 in dorian is DIMINISHED;
                           //   MK2's own buildBass comment already flags this trap]
    ],
    major: [
      [[1, 4, 0, 3], 5],   // ii-V-I-IV — Dm7-G7-Cmaj7-Fmaj7. "The most important
                           //   progression in jazz, and lo-fi inherited it directly"
                           //   [corpus:chordoo]
      [[0, 5, 1, 4], 4],   // I-vi-ii-V [MK2 existing, keep — the turnaround]
      [[0, 1, 4, 5], 3],   // I-ii-V-vi — Nujabes "Feather": Db-Ebm7-Ab-Bbm
                           //   [corpus:chordify?] MISSING FROM MK2
      [[0, 1, 2, 1], 3],   // Imaj7-ii7-iii7-ii7 — "the neo-soul vamp"
                           //   [corpus:chordoo] MISSING FROM MK2
      [[3, 4, 2, 5], 2],   // IV-V-iii-vi [MK2 existing, keep] — also chordoo's
                           //   "bittersweet" Fmaj7-G7-Em7-Am7
      [[1, 4, 0, 5], 2],   // ii-V-I-vi [MK2 existing, keep]
    ],
  },

  /* ── HARMONY ──────────────────────────────────────────────────────────────
     THE BIGGEST HOLE IN THE SHIPPED FILE. chordTones(root,mode,d,seventh)
     returns a triad or a diatonic 7th and nothing else. Every source on this
     genre names 9ths and 11ths as core: Nujabes "leans heavily on minor 7ths,
     9ths, and 11ths" [corpus:soundcy]; lofi "relies on extended chords,
     especially major 7ths, minor 7ths, and dominant 9ths" [corpus:emastered/
     unison/chordoo]. A comp of bare diatonic sevenths is jazz-ADJACENT, not jazz.
     The table below is what the genre needs; MK2 cannot consume most of it. */
  harmony: {
    sevenths: 1.0,                 // ALWAYS. A triad in this genre is a mistake. [theory]
    extensions: [                  // per chord, drawn: which tone replaces/joins
      [["9"],        5],           // the ninth is the default lofi colour [corpus:soundcy/unison]
      [["9", "11"],  2],           // m11 on minor chords [corpus:soundcy — Nujabes 11ths]
      [["none"],     3],           // plain 7th [theory]
      [["6"],        1],           // maj6 / m6 in place of the 7th [theory: jazz practice]
    ],
    rootless: 0.5,                 // half the time the comp OMITS the root (the bass has it)
                                   //   and plays 3-7-9. This is the difference between a
                                   //   Rhodes player and a MIDI chord. [theory: jazz
                                   //   keyboard voicing practice] — NOT EXPRESSIBLE IN MK2:
                                   //   buildKeys voices all four chordTones.
    spread: 0.6,                   // 3-7-9 in the right hand, 10th or root in the left, rather
                                   //   than a closed 4-note stack inside [52,74] [theory]
    borrowedChords: [              // NONE of these survive MK2's inKey() seam check.
      [["bVI"],  2],               // borrowed bVI in major [theory]
      [["bVII"], 3],               // borrowed bVII in major — everywhere in soul-derived lofi [theory]
      [["iv"],   2],               // minor iv in major: the single saddest chord in the genre [theory]
      [["none"], 8],
    ],
    secondaryDominants: 0.25,      // V/ii, V/vi. Fundamental to the ii-V habit; MK2 cannot
                                   //   build a dominant on a non-diatonic root at all. [theory]
    tritoneSub: 0.05,              // rare but real in Nujabes-lineage material [theory] [GUESS on rate]
    cadence: "none",               // THE HABIT: lofi loops do not cadence. "Chords float
                                   //   without resolution... loops that never quite end"
                                   //   [corpus:tracksandtales on Modal Soul]. MK2's makeMaterials
                                   //   ending — a tonic landing bar, "the song closes, it does
                                   //   not just stop" — is a pop/jazz convention imported into
                                   //   a genre that fades out. See form.outro below.
    harmonicRhythm: [[1, 5], [2, 4], [0.5, 1]],   // bars per chord: 1 bar, 2 bars (the
                                   //   2-chord vamp), or 2 chords per bar (a real ii-V at
                                   //   80 bpm). ONLY the first is possible in MK2 today —
                                   //   see architectureGaps #2.
  },

  /* ── FORM ─────────────────────────────────────────────────────────────────
     MK2's grammar (intro/verse/chorus/bridge/instrumental/outro, verse→chorus
     weight 8, rule of three, a peak last chorus at energy 1.0) is a POP grammar.
     Lofi "in its most calm form doesn't have a chorus" [corpus:hiphopmakers],
     and the documented arrangement is:
       "Loop, Loop with beat, Loop without beat (and a slight change),
        Loop with beat, Fade out"  → ABAB / ABABB
       [corpus:richardpryn, with named examples: Marsquake & Sátyr "Come Closer"
        = ABABB; Jinsang "Pine Leaves" = AB-AB-ABC; Eevee "m i s t" = ABBABBA]
     Producers "focus on making each section feel cohesive... rather than
     building towards a dramatic climax" [corpus:audioplugin.deals].
     Length: 1:00-2:30, "around two minutes the most common", sections 20-30 s,
     4-6 sections total [corpus:richardpryn / sakuknight].
     The FUNCTION POOL below is a LAYER pool, not a narrative pool. */
  form: {
    sections: ["intro", "loop", "loopFull", "breakdown", "variation", "outro"],
    lengths:  { intro: 8, loop: 8, loopFull: 16, breakdown: 8, variation: 16, outro: 8 },
                                   // bar counts from the documented template
                                   //   "Intro 8-16 / Main groove 16-32 / Breakdown 8 /
                                   //    Variation 16 / Outro 8-16" [corpus:audioplugin.deals]
    targetBars: [48, 72],          // 48 bars @ 83 bpm = 1:59; 72 bars = 2:58.
                                   //   [corpus:richardpryn "1:00 to 2:30, ~2:00 most common"]
    transitions: {                 // ALL WEIGHTS [EAR] — nobody publishes lofi Markov data
      intro:     [["loop", 8], ["loopFull", 2]],
      loop:      [["loopFull", 7], ["breakdown", 2], ["variation", 1]],
      loopFull:  [["breakdown", 4], ["variation", 4], ["loop", 2], ["outro", 2]],
      breakdown: [["loopFull", 8], ["variation", 2]],
      variation: [["loopFull", 5], ["breakdown", 2], ["outro", 3]],
    },
    coldOpen: 0.05,                // lofi almost always states the chords alone first
                                   //   [EAR — MK2's 0.15 is a pop figure]
    intro: { roles: ["keys"], noiseOnly: true },   // chords + crackle, no kit
                                   //   [corpus:audioplugin.deals "Intro — Chords + noise"]
    outro: { style: "fade", fadeBars: 4 },
                                   // "Outro — fades out with ambiance"
                                   //   [corpus:audioplugin.deals]. NO CONSUMER IN MK2:
                                   //   stage 5's one gain formula has no fade term.
    energyRange: [0.72, 0.92],     // MK2 runs 0.50→1.00 with a *1.06 peak bump.
                                   //   Lofi's dynamic arc is ~2 dB across a whole track;
                                   //   the change is WHICH LAYERS PLAY, not how hard.
                                   //   [EAR, but directly implied by "rather than building
                                   //   towards a dramatic climax"]
    peakBump: 1.0,                 // no peak. There is no last chorus. [EAR]
    layerLadder: [                 // roles added by loop OCCURRENCE (form already carries it)
      [1, ["keys", "bass"]],
      [2, ["keys", "bass", "drums"]],
      [3, ["keys", "bass", "drums", "lead"]],
      [4, ["keys", "bass", "drums", "lead", "perc"]],
    ],                             // "a main loop that builds slightly over time"
                                   //   [corpus:emastered how-to-make-lofi]
  },

  /* ── PARTS ────────────────────────────────────────────────────────────────*/
  bassStyle: {
    register: [28, 50],            // E1..D3. MK2 clamps to [33,45] = A1..A2 — a SYNTH SUB
                                   //   band. An upright or a P-bass in this music has its
                                   //   roots down to E1 and its walking notes up past C3.
                                   //   [theory: instrument range]
    onsets:   [[[0], 4], [[0, 10], 4], [[0, 6, 10], 2], [[0, 10, 14], 2]],  // [EAR]
    tones:    [["root", 6], ["fifth", 3], ["third", 2], ["seventh", 1], ["rest", 4]],
                                   // MK2 can only play root and diatonic fifth. Documented
                                   //   practice: "land on root notes, or other chord tones
                                   //   (3rds, 5ths, 7ths), at the right beats (the 1 or the 3)
                                   //   then you can play almost anything in between"
                                   //   [corpus:lofiweekly "Crafting Jazzy Basslines"]
    approach:      [["chromatic", 3], ["scalar", 5], ["none", 4]],
                                   // chromatic approach notes are standard and are FORBIDDEN
                                   //   by MK2's inKey() seam check [corpus:lofiweekly]
    directionBias: -1,             // "we want stuff that is descending mostly"
                                   //   [corpus:lofiweekly]
    octaveJump: 0.2,               // "octave jumps add dynamism... play the root an octave
                                   //   higher during chord transitions" [corpus:mysticalankar]
                                   //   — not expressible: buildBass has no octave device
    artic: [[0.5, 4], [0.85, 4], [1.0, 2]],   // MK2's existing bassArtic table, weighted
                                   //   shorter — upright pizz decays fast [EAR]
    layOut: 0.25,                  // the bass sits out the first statement entirely [EAR]
  },

  keysStyle: {
    voice:  [["rhodes", 6], ["upright", 3], ["wurly", 1]],
                                   // MK2 has [rhodes 6, wurly 4]. Wurlitzer is FAR rarer than
                                   //   Rhodes here, and the detuned upright piano — the second
                                   //   most identifiable lofi keyboard — does not exist in the
                                   //   file. "almost invariably features either piano or guitar"
                                   //   [corpus:modeaudio 5 production essentials]
    strikes: [[[0], 4], [[0, 6], 4], [[0, 8], 3], [[0, 6, 11], 2]],
                                   // DECOUPLED FROM THE POCKET. MK2 seeds keys strikes from
                                   //   the kick pocket (justified by "bass+comp co-onset 77%"
                                   //   from a general ensemble corpus). In lofi the comp is a
                                   //   sampled loop and the kick is the producer's — they are
                                   //   deliberately NOT co-onset. [EAR, but it is the genre's
                                   //   founding division of labour]
    ring: 1.15,                    // chords ring THROUGH the next strike. MK2 uses
                                   //   ring = (nxt-st)*0.6, which chokes every chord before
                                   //   the next one lands. One number, very audible. [EAR]
    velJitter: 0.18,               // "no quantisation corrections... retain the feeling of
                                   //   being played live" [corpus:minimal.audio beat breakdown]
    strumMs: [8, 14],              // MK2 uses 4-9 ms. A lofi/neo-soul roll is wider.
                                   //   [GUESS — I found no measurement of comp roll width]
  },

  leadStyle: {
    notesPerBar: [[0, 3], [1, 4], [2, 4], [3, 2]],
                                   // MK2 draws 3-5 per bar (with a 1-2 "breath" bar). Far too
                                   //   busy: "keep melodies sparse and repeating";
                                   //   "won't have a lot of melodic variation"
                                   //   [corpus:mixedinkey / edmprod]. Note the weight on ZERO:
                                   //   plenty of lofi has no lead line at all.
    motifRepeat: 0.7,              // the SAME 2-bar cell restated, not a fresh phrase.
                                   //   MK2 redraws each phrase; only the hook (B) repeats,
                                   //   and there is no hook in this genre. [EAR]
    scale: [["pentatonicMinor", 5], ["mode", 4], ["chordTones", 3]],   // [EAR]
    register: [67, 84],            // above the comp, as MK2's themeB [theory: keyboard practice]
    callResponse: true,            // the lead answers the chord loop in its gaps, it does not
                                   //   run over the top of it [EAR]
  },

  counterStyle: {
    mode: "fragment",              // MK2's deriveCounter shifts the theme down 2 scale steps
                                   //   AT THE SAME RHYTHM — parallel thirds in lockstep. That
                                   //   is a doo-wop harmony vocal. Lofi's second melodic layer
                                   //   is a SAMPLE FRAGMENT or a guitar figure in the holes,
                                   //   rhythmically independent. [EAR]
    density: 0.3,                  // present in maybe a third of songs [EAR]
    interval: [[-2, 3], [-4, 2], [3, 2]],   // when it IS a harmony line [theory]
  },

  /* ── PALETTE ──────────────────────────────────────────────────────────────*/
  palette: {
    voices: ["kick", "snare", "rim", "ghost", "hat", "openhat", "shaker",
             "bass", "rhodes", "upright", "wurly", "lead", "tape"],
    kick:  { style: "muffled", f0: 95, f1: 55, decayMs: 180, lpHz: 1800 },
                                   // MK2's kick sweeps 150→47 Hz over 55 ms into a 300 ms
                                   //   tail — an 808/trap shape. A lofi kick is a SAMPLED
                                   //   acoustic kick: shorter, mid-fundamental, and lowpassed.
                                   //   [EAR / GUESS on the exact Hz — I found no measured
                                   //   spectrum for a lofi kick]
    NEW_VOICE: "rim",              // ═══ THE ONE NEW VOICE THIS GENRE NEEDS ═══
                                   //   V.rim — cross-stick / rim click. Tip of the stick on
                                   //   the head, butt on the rim, hand muting: a short WOODY
                                   //   knock at ~600-900 Hz with almost no noise tail
                                   //   [corpus:Wikipedia "Rimshot" / vdrums forum on
                                   //   cross-stick vs rimshot; lofi kits ship "gentle snares
                                   //   & rimshots", corpus:loopmasters].
                                   //   NOT reachable by turning V.snare down: MK2's snare
                                   //   IS a 1850 Hz crack plus a 4400 Hz wire tail, and a
                                   //   cross-stick has neither. Suggested build:
                                   //     triangle 780 Hz → 340 Hz over 8 ms, 60 ms decay
                                   //     + bandpass noise burst @ 2.2 kHz, 6 ms  [EAR]
                                   //   RUNNERS-UP, named so they are not forgotten:
                                   //     V.upright — pizz double bass (MK2's V.bass is a
                                   //       sine+saw sub with a 1.2 kHz pick click: a synth)
                                   //     V.pianoUpright — detuned felt piano
                                   //     a graph-level TAPE bus (hiss + flutter + high-cut),
                                   //       which is not a voice at all — see gaps #5/#6
  },

  /* ── SPACE ────────────────────────────────────────────────────────────────
     WARNING: this whole block currently has NO CONSUMER. buildGraph(c, rng)
     never sees the chart, and g.wet.gain.value = 0.16 is hardcoded. */
  space: {
    reverbWet: [0.12, 0.22],       // MK2's shipped 0.16 sits inside this; keep it as the
                                   //   centre and let the genre draw around it [EAR]
    reverbSendLanes: ["keys", "lead"],   // rhythm section stays dry — MK2 already does this
                                   //   and it is right for the genre [EAR]
    toneTilt: -6,                  // dB of high shelf above ~4 kHz. Anchor: the SP-303's
                                   //   11.025 kHz sampling mode has a hard Nyquist wall at
                                   //   5.5 kHz, and Madvillainy / Champion Sound / parts of
                                   //   Donuts went through it [corpus:musictech SP-303].
                                   //   "A touch of high-frequency rolloff" is the standard
                                   //   lofi mastering move [corpus:northernvalleyaudio].
                                   //   -6 dB is [GUESS]; the 5.5 kHz wall is [corpus].
    masterLpHz: [5500, 12000],     // draw the ceiling per song. 5.5 kHz = full SP-303;
                                   //   12 kHz = "gentle 6-12 dB/oct rolloff at 10-15 kHz"
                                   //   [corpus:masteringthemix / SP-303 spec]
    hissDb: -52,                   // broadband tape hiss, MISSING ENTIRELY from MK2 (V.tape
                                   //   is sparse impulses only — crackle without hiss).
                                   //   [GUESS — a cassette noise floor is roughly -50 to
                                   //   -56 dB unweighted, but I did not verify a spec sheet]
    crackle: [0.006, 0.014],       // MK2's existing range [EAR]. But V.tape connects into
                                   //   g.bus.keys, which feeds the reverb send — so the
                                   //   vinyl noise is REVERBERATED. Vinyl noise is in front
                                   //   of the record and bone dry. One-line graph fix.
    wow:    { hz: [0.5, 1.1], depth: [0.0010, 0.0030] },
                                   // wow is BY DEFINITION the speed error below ~4 Hz,
                                   //   perceived as pitch drift [corpus:northernvalleyaudio].
                                   //   MK2's 0.7 Hz is inside this band but is a hardcoded
                                   //   literal in two voices with no provenance and no draw.
    flutter:{ hz: [7, 16], depth: [0.0004, 0.0012] },
                                   // MISSING ENTIRELY. Flutter is the >4 Hz component and is
                                   //   "perceived as tonal degradation, since it produces
                                   //   harmonic overtones" [corpus:northernvalleyaudio].
                                   //   MK2 ships half the tape effect. [GUESS on the numbers]
    wowScope: "mix",               // ═══ AND THIS IS A BUG, NOT A SETTING ═══
                                   //   MK2 writes ev.wow ONLY for role === "keys". A tape
                                   //   machine drifts the ENTIRE program. As shipped, turning
                                   //   the wow up makes the Rhodes go OUT OF TUNE WITH THE
                                   //   BASS rather than making the record sound old. See
                                   //   architectureGaps #6.
  },
}
```

## What MK2's architecture cannot express

- #1 THERE IS NO SAMPLE, AND THIS GENRE IS DEFINED BY ONE. Lofi is definitionally a recorded loop -- carrying chords AND melody AND its own noise floor AND its own timing as ONE indivisible object -- over which the producer places drums and bass. Nujabes's samples 'dissolve into the composition until they feel like memories rather than quotations' (tracksandtales); Madlib worked from a turntable, a tape deck and an SP-303. MK2 stage 3 derives every member of the family FROM A by construction, which is the exact opposite generating operation, and it has no way to mark a set of roles as one imported unit. The aesthetic consequence -- that keys and lead came from the same performance, are locked in phase, drift together, and are NOT the producer's -- cannot be expressed by any table. This is the deepest hole. It is a stage-3 concept, not a parameter.

- #2 HARMONIC RHYTHM IS HARDCODED AT ONE CHORD PER BAR. mkChords(degrees) makes exactly 4 chords and every builder indexes chordSet[b]. There is no way to say 'Cmaj7 for two bars then Am7 for two bars' (the 2-chord vamp, extremely common here) or 'two chords in this bar' (which is what a real ii-V is at 80 bpm). My progressions table fakes the 2-chord vamp as [0,3,0,3], which is a lie about what is happening harmonically. Fixing this changes the signature of buildBass, buildKeys and buildTheme -- it is a code change, not a table.

- #3 THE CHORD VOCABULARY IS LOCKED TO DIATONIC STACKED THIRDS, AND THE SEAM CHECK ENFORCES IT. chordTones(root,mode,d,seventh) returns a triad or a diatonic 7th. There is no 9th, 11th, 13th, add9, sus, rootless voicing, borrowed chord, secondary dominant or tritone sub. Worse: composeSong throws on inKey(chart.root, chart.mode, n.pitch) for every pitched note, so even if a genre table asked for a borrowed bVI, a secondary V/vi, or a chromatic bass approach note, the pipeline REFUSES THE BUILD. For a genre whose entire harmonic identity is 'jazz extensions' -- 'minor 7ths, 9ths and 11ths' -- this is disqualifying. It is fixable as a table ONLY if chordTones grows an extensions parameter AND the seam check learns a per-song chromatic allowance. Say it loudly: the in-key seam check is currently a hard barrier to jazz harmony, and jazz harmony is not optional here.

- #4 MICROTIMING IS IN FRACTIONS OF A 16TH, NOT MILLISECONDS, AND ONLY THREE LANES CAN MOVE. The perceptual and historical unit is ms (MPC3000 nudge = 1/96 quarter = 7.5 ms at 83 bpm; Dilla called them 'baby hairs'). Storing steps makes the offset tempo-invariant in beats and tempo-variant in ms -- backwards. Separately, Attack Magazine's reconstruction of the drunk-drummer feel places hits on QUINTUPLET and SEPTUPLET subdivisions -- positions that are not fractions of a 16th at all. MK2 can reach them numerically via micro, but there is no table shape for 'this lane sits on the 4th quintuplet of the beat'. A per-lane {subdivision, index} grid is a new field in stage 5's timing formula.

- #5 THERE IS NO PER-SECTION OR PER-SONG TONE, SO THE REQUESTED `space` FIELD HAS NO CONSUMER. buildGraph(c, rng) never receives the chart, and g.wet.gain.value = 0.16 is a hardcoded literal. Even the song-level reverb amount cannot be a genre parameter today, let alone toneTilt or a master lowpass. And lofi's #1 arrangement device is a FILTER SWEEP on a breakdown -- stage 5 owns gain and timing 'exclusively and finally' and does not own tone, so there is nowhere for it to live. This is small to fix (pass the chart into buildGraph) but it is a real hole in the six-stage division of ownership: nobody owns TONE.

- #6 TAPE WOW IS PER-VOICE, NOT PER-MIX -- AND AS SHIPPED IT DETUNES THE BAND. makePerformance writes ev.wow only when role === 'keys'; V.rhodes and V.keys read it and modulate their own playbackRate/carrier. A tape machine drifts the WHOLE program together. Turning MK2's wow up therefore makes the Rhodes go out of tune with the bass rather than making the record sound old, which is the opposite of the intended effect and is arguably the single biggest 'lofi patina' defect in the file. Fixing it needs a song-scoped LFO at the graph level that every pitched voice shares the phase of -- a stage-6 graph feature, not a table. Flutter is missing outright for the same structural reason.

- #7 THE FORM GRAMMAR IS A POP GRAMMAR AND THE RULE OF THREE IS ENFORCED AS AN ENGINE INVARIANT. composeSong THROWS if a function appears three times consecutively. But lofi's most common shape is literally the same 4-bar loop eight times with layers entering and leaving; the variation lives in the ARRANGEMENT (which roles are active), not in the section-function name. Either the check must compare (fn, activeRoles) rather than fn alone, or a lofi table has to invent fake section names to satisfy it. Inventing fake section names to get past a check is exactly the 'special case in stage 2-5 logic' you asked me to flag. Related: makeForm's `vary` demand answers repetition with a REDRAWN MELODY (Avar); lofi answers it by taking the drums out or filtering the loop -- the first is expressible via role sets, the second is not (see #5).

- #8 NO FADE-OUT. Lofi tracks overwhelmingly fade ('Outro -- fades out with ambiance'). MK2's ending is a tonic landing bar with the comment 'the song closes, it does not just stop' -- a pop/jazz convention imported wholesale. A fade is a gain envelope over the last N bars, and stage 5's ONE gain formula (identity x position accent x section dynamic) has no term for it and no place to grow one without becoming two formulas. Small, but it is a genuine per-genre need with nowhere to live.

- #9 THE VINYL NOISE IS ROUTED INTO THE REVERB. V.tape connects to g.bus.keys, which feeds g.send -> convolver. So the crackle is reverberated and shares a bus with the comp. Record surface noise is in front of the record and bone dry. One-line graph fix, but it is a routing decision baked into stage 6 rather than a parameter.

- #10 A GENUINE TIMING BUG IN THE SWING MODEL, worth fixing regardless of genre. makePerformance adds the FULL swingOffset when n.step % 4 === 2 and HALF when n.step % 2 === 1. At swingRatio 1.5 the resulting step positions inside one beat are 0, 1.2, 2.4, 3.2 -- gaps of 1.2, 1.2, 0.8, 0.8. That is neither 16th swing (1.2, 0.8, 1.2, 0.8) nor 8th swing; it is a long-long-short-short compound that pushes the first half of every beat late and crams the second half. The half-offset on odd steps is exactly correct 16th swing ((r-1)/(r+1) = 0.2 at r=1.5); the full offset on steps 2/6/10/14 is an extra 8th-note displacement layered on top, and on MK2's default 8ths hat pattern what you actually hear is a full triplet 8th shuffle at MPC ~60-62% -- heavier than this genre and on the wrong subdivision. MPC swing, which is the reference these records were made against, delays only the second 16th of each 8th-note pair. Deleting the `n.step % 4 === 2` branch makes the model correct.

- #11 (not a hole, a note) MK2's rig table -- one performance, two bands -- is the right shape for this genre and should be kept. 'band' vs 'sega' generalises cleanly to 'band' vs 'sp303' (an 11.025 kHz, 5.5 kHz-Nyquist version of the same song), which would be a genuinely strong lofi rig and costs nothing structurally.


## Numbers the researcher flagged as UNCERTAIN

- ALL BPM AND CHORD FIGURES FOR SPECIFIC RECORDS are algorithmic estimates (SongBPM/Tunebat/GetSongBPM read Spotify audio-analysis; Chordify is automatic chord recognition). Nujabes Feather 91, Luv(sic) 94, Aruarian Dance 100, After Hanabi 83; J Dilla Time: The Donut of the Heart 93; Donuts opens ~96. NONE hand-tapped by me. The same databases report Donuts 'Two Can Win' at 185 and the album range as 80-194, which are obvious double-time misreads -- proof the estimator is unreliable on this exact material. Treat these as [corpus:X?] and verify by ear before shipping.

- The three traced chord progressions (Luv(sic) iv-i-bVII-bIII; Aruarian Dance i-ii-IV-bVII dorian; Feather I-ii-V-vi) come from Chordify's automatic recognition, not from a transcription or a score. The Aruarian Dance dorian reading in particular hinges on one chord (A#m7 vs A#dim) that an algorithm gets wrong often.

- Every wpick WEIGHT in the entire table is [EAR] or [GUESS]. No published source gives weighted distributions for lofi progressions, pockets, hat patterns, modes, or form transitions. MK2's existing form weights cite [corpus:harvest_structure], a general pop corpus -- I did not find and am not claiming a lofi-specific equivalent.

- pocket: all seven kick placements are [EAR]. I found no corpus of lofi kick placements. The only measured claim I can stand behind is Peterson's, that Dilla's kicks frequently land OFF expected metric locations -- which is why I added the no-kick-on-the-one pocket, not because I measured its frequency.

- drums.ghostPerBar counts 1-4: [GUESS]. I found no measurement of ghost-note density in lofi or boom-bap. MK2's current 0.55/bar is also unsourced. I believe it is too low; I cannot prove it.

- drums.hatVel [0.30,0.55] and ghostVel 0.22: [GUESS]. No measured level data for this genre.

- micro.configs millisecond values: the MAGNITUDES are anchored (a 32nd note = 80-99 ms across 76-93 bpm, per Peterson's '32nd note anticipation'; Charnas's 'about 65 ms' via MusicRadar), but the specific per-lane numbers -70/-12/+22/-30/-55/+20/+35 and their weights are my interpolation, not measurements. The DIRECTION genuinely conflicts across sources -- Peterson measures early kicks, Questlove-lineage lore describes dragged hats and late snares, Ainsworth finds beat 4 early and little evidence of backbeat delay. I am reporting that conflict rather than resolving it.

- swing.pct weights [52:2, 54:4, 58:5, 62:4, 66:1]: [EAR]. The VALUES are Roger Linn's / the MPC's real dial positions and the 1.07:1-1.8:1 bracket is Ainsworth's measurement across 14 funk tracks -- but funk is the ancestor genre, not this one, and I found no swing-ratio measurement for lofi or boom-bap specifically.

- keysStyle.ring 1.15 and strumMs [8,14]: [EAR]/[GUESS]. I found no measurement of comp sustain or roll width. I am confident the DIRECTION is right (MK2's 0.6 chokes the chords) and not confident in the numbers.

- palette.kick f0 95 / f1 55 / decay 180 ms / lp 1800 Hz: [GUESS]. I found no published spectrum for a canonical lofi kick. The claim I stand behind is qualitative -- MK2's 150->47 Hz over 55 ms with a 300 ms tail is a synth/808 shape, not a sampled acoustic one.

- space.toneTilt -6 dB, hissDb -52, flutter hz [7,16] and depth [0.0004,0.0012], masterLpHz upper bound 12000: [GUESS]. The ONLY hard anchor in this block is the SP-303's 11.025 kHz sampling mode -> 5.5 kHz Nyquist, which is a spec, and the definitional wow<4Hz / flutter>4Hz split. The dB and depth values are invented and should be dialed by ear.

- form.transitions, form.energyRange [0.72,0.92], form.layerLadder: [EAR]. The section NAMES, bar counts (8/16/8/16/8) and the ABAB/ABABB shape are documented (richardpryn, audioplugin.deals, with named tracks); the Markov weights and the energy floor are mine.

- leadStyle.notesPerBar weights and motifRepeat 0.7: [EAR]. 'Sparse and repeating' is documented; the numbers are not.

- bassStyle register [28,50]: this is the INSTRUMENT's range [theory], not a measurement of what lofi basslines occupy. I did not find a measured register distribution.

- The widely-cited 'study playlists average 112 BPM (n>100,000)' from RouteNote is in my sources but I am explicitly NOT using it. Spotify's tempo estimator doubles half-time beats; 112 is very likely an artifact of 56-85 bpm material being read at 2x. I am flagging it so nobody else picks it up as evidence.

- I could not read the two most promising academic sources -- Sean Peterson's 'Signifyin(g) Producers' on academia.edu and the SFA thesis 'Analysis of Sampling Techniques by J Dilla in Donuts' -- both returned 403. The Peterson claims I do cite come from his UO dissertation full text, which I did read. The Wesleyan 'Groove Science: The Dilla Feel' thesis 404'd.


## Sources

- https://www.ethanhein.com/wp/2022/dilla-time/

- https://scholarsbank.uoregon.edu/xmlui/bitstream/handle/1794/23759/Peterson_oregon_0171A_12184.pdf.txt?sequence=3

- https://www.musicradar.com/artists/djs-producers/every-producer-bows-down-to-dilla-whether-they-like-it-or-not-how-j-dilla-and-his-mpc-changed-beatmaking-forever

- https://www.4columns.org/frere-jones-sasha/dilla-time

- https://www.gmth.de/zeitschrift/artikel/1224.aspx

- https://www.attackmagazine.com/features/interview/roger-linn-swing-groove-magic-mpc-timing/3/

- https://melodiefabriek.com/sound-tech/mpc-swing-reason/

- https://www.attackmagazine.com/technique/beat-dissected/drunk-drummer-style-grooves/

- https://en.wikipedia.org/wiki/Lofi_hip_hop

- https://musictech.com/features/boss-sp-303-hip-hop-connection-j-dilla-madlib-mf-doom/

- https://www.tracklib.com/blog/nujabes-lofi-samples-originals

- https://www.tracksandtales.co/blogs/listening-bar-albums/modal-soul-nujabes-2005

- https://soundcy.com/article/how-to-sound-like-nujabes

- https://richardpryn.com/lofi-music-structure/

- https://www.sakuknight.com/post/lofi-music-durations

- https://lofiweekly.com/2021/12/08/crafting-jazzy-basslines-for-lofi-hip-hop/

- https://www.chordoo.com/blog/lofi-chord-progressions-for-chill-beats

- https://emastered.com/blog/lofi-chord-progressions

- https://www.masterclass.com/articles/what-is-lofi-explained

- https://bpmcalc.com/genres/lo-fi/

- https://modeaudio.com/magazine/lofi-hip-hop-5-production-essentials

- https://www.northernvalleyaudio.com/blog/lofi-tape-saturation-production-guide

- https://songbpm.com/@nujabes

- https://songbpm.com/@j-dilla/time-the-donut-of-the-heart

- https://musicstax.com/album/donuts/7xJ7jHNu3JNfdnao9xwMho

- https://rateyourmusic.com/charts/top/album/all-time/g:lo-fi-hip-hop/

- https://u92slc.com/the-best-hip-hop-guide/j-dillas-offbeat-legacy/

- https://www.loopmasters.com/genres/167-Lo-Fi-Hip-Hop/products/8098-Lofi-Hip-Hop-Drums

- https://en.wikipedia.org/wiki/Rimshot

- https://www.audioplugin.deals/blog/the-ultimate-guide-to-lofi-hip-hop-production/

- https://hiphopmakers.com/how-to-make-lo-fi-beats-lofi-music

- https://www.masteringthemix.com/blogs/learn/how-to-use-lowpass-filters-to-improve-your-mixes

- https://routenote.com/blog/this-is-the-secret-bpm-that-will-get-you-added-to-study-playlists/
