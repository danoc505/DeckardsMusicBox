# jungle

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

Two things, and only two. (1) THE RATIO: 16th-note breakbeat detail running at ~165-172 bpm over a bass that moves once or twice a bar — i.e. drums at 170, bass at 85. Roni Size "Brown Paper Bag" is measured at 170 with a documented half-time of 85 (songbpm), and that 2:1 split is the whole genre in one number. Nothing else in music does it. (2) THE BREAK IS AUDIBLY EDITED, NOT LOOPED: within every two bars a slice lands where the ear did not expect it — above all the Amen's own signature move, the beat-4 snare displaced a full eighth LATE to the "+" of 4 (step 14) in bars 3 and 4, which MusicRadar calls "probably the most crucial element" of the pattern. A straight two-step at 172 reads as generic drum & bass; the displaced snare plus one stutter-repeated slice per two bars reads as jungle. If MK2 delivers only one of these two, deliver (1) — the half-time bass is cheap and it carries the ID. Everything else (ragga chops, timestretch shimmer, Reese growl, Bukem pads) is flavour that names the SUBGENRE, not the genre.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   UK JUNGLE — 1992-1997 hardcore continuum.
   Every number below carries provenance. [corpus:*] = read off a cited source.
   [theory] = arithmetic or music-theory fact. [EAR] = taste, awaiting a listen.
   [GUESS] = I could not find a measurement and I am telling you so.

   ⚠ FIELDS MARKED "NO READER" DO NOT EXIST IN MK2 TODAY. They are listed at the
   bottom in a separate block so you can paste the top block and have it RUN.
   ═══════════════════════════════════════════════════════════════════════════ */

jungle: {
  label: "uk jungle",

  /* ── stage 1: identity ──────────────────────────────────────────────────
     THE TEMPO BAND. Measured, record by record, not asserted:
       Omni Trio "Renegade Snares" (Moving Shadow, 1993)      149  [corpus:songbpm]
       Rufige Kru "Terminator" (Reinforced/Synthetic, 1992)   150  [corpus:songbpm]
         (other databases read 165 for the same title — the 1992 12" and the
          remasters differ; treat 150-165 as the honest range for this record)
       LTJ Bukem "Music" (Good Looking, 1993)                 155  [corpus:songbpm]
       Goldie "Timeless" (FFRR, 1995)                         155  [corpus:songbpm]
       Dillinja "The Angels Fell" (Metalheadz, 1995)          160  [corpus:songbpm]
       Photek "Ni-Ten-Ichi-Ryu" (Science, 1997)           167-172  [corpus:getsongbpm]
       Roni Size "Brown Paper Bag" (Talkin' Loud, 1997)        170  [corpus:songbpm]
     Wikipedia's D&B article puts the genre at ~130 in 1990-91, 155-165 by 1993,
     and 170-180 from ~1996 [corpus:wikipedia/drum_and_bass]. Melodigging puts
     ragga jungle specifically at 160-175 [corpus:melodigging].
     So the era's true floor is 149 (1992-93 proto-jungle) and its ceiling is 174.
     I set the low end at 155 because BOTH 155-bpm anchors (Timeless, Music) are
     canon and because below ~152 the half-time bass reads as sluggish, not
     as jungle. If you want the full 1992-93 floor, use [149, 174]. */
  tempo: [155, 174],                                    // [corpus: 7 measured records above]

  /* jungle is a minor-mode genre almost without exception. Both algorithmically
     keyed anchors come back minor: Goldie "Timeless" = B minor, LTJ Bukem
     "Music" = B minor [corpus:songbpm]. Dorian is the Good Looking / jazz-step
     colour (Bukem was a trained pianist steeped in Herbie Hancock and Lonnie
     Liston Smith [corpus:tracksandtales]) — the i-IV vamp with a natural 6.
     MAJOR IS OMITTED DELIBERATELY: songbpm reads "Brown Paper Bag" as B major,
     but that track has effectively no functional harmony, so the key detector is
     reading a bass drone. A major-mode jungle tune is a category error. */
  modes: [["minor", 7], ["dorian", 3]],                 // [corpus:songbpm keys + theory]

  /* the SEGA rig is a category error for this genre — a Mega Drive cannot make a
     sub or a break — but wpick needs a nonzero total and the UI can pin it anyway. */
  rig: [["band", 19], ["sega", 1]],                     // [EAR]

  /* Rhodes, heavily. Bukem's and Roni Size's jazz-inflected chords are electric
     piano; the wurly's reedier odd-ratio body is the wrong instrument for a pad
     but is kept at low weight so the draw still has two outcomes. */
  keysChar: [["rhodes", 8], ["wurly", 2]],              // [corpus:tracksandtales, EAR]

  /* jungle IS vinyl-sourced — every break came off a record — but the finished
     12" is not a lofi artefact record. Near-zero wow (samplers do not wow),
     crackle present but low. [EAR] */
  tape: { wow: [0.0000, 0.0004], crackle: [0.002, 0.003] },   // [EAR]

  /* ── stage 2: form ──────────────────────────────────────────────────────
     The 12" template, from a production guide that states it in bars:
       DJ intro 32 · breakdown 16-32 · DROP 16-32 · drop variation 16-32 ·
       breakdown 16-32 · DROP 16-32 · outro 16-32     [corpus:edmprod/dnb]
     A modern-DnB guide gives the same shape with fixed lengths: 32 intro,
     16 build, 64 first drop, 16-32 mid, 32 breakdown, 16 build, 64 second drop,
     32 outro at ~174 bpm, with "the first proper bass hit at bar 17 of the
     intro" as the DJ's landmark [corpus:kansamples/arrangement].
     Mapping onto MK2's function pool: intro=DJ intro, chorus=DROP,
     verse=drop variation / mid, bridge=breakdown, instrumental=drums-only pass.
     ⚠ MK2's SECTION_LEN is a GLOBAL const (intro 4, verse 8, chorus 8, outro 4).
     At 170 bpm that makes a "drop" 11 seconds long. See the widening block. */
  form: {
    /* a jungle 12" almost never cold-opens: the DJ intro is the product.
       Splash "Babylon" famously takes 90 seconds to drop [corpus:timeout]. */
    coldOpen:  0.06,                                    // [corpus:edmprod/dnb + timeout, EAR on the exact value]
    openVerse: 0.15,                                    // after the intro you go STRAIGHT to the drop [corpus:edmprod/dnb]
    /* 96..144 bars. At 170 bpm and 16-bar sections that is 2:15 to 3:23 — short
       for a 12" (real ones run 5-6 min [corpus:kansamples]) but MK2's form loop
       has a `guard < 10` cap of ~10 sections, so this is the ceiling the current
       stage 2 can reach. WITH TODAY'S 8-BAR SECTION_LEN use [56, 4, 8] instead
       and accept a 90-second song. */
    target: [96, 4, 16],                                // [corpus:edmprod/dnb, kansamples]
    transitions: {
      /* the breakdown ALWAYS returns to the drop — that is what a breakdown is
         for. Nothing in jungle resolves to a verse after a breakdown. */
      verse:        [["chorus", 7], ["bridge", 2], ["verse", 1]],       // [corpus:edmprod/dnb]
      chorus:       [["verse", 4], ["bridge", 4], ["chorus", 2], ["instrumental", 1]], // [corpus:edmprod/dnb]
      bridge:       [["chorus", 9], ["verse", 1]],                      // [corpus:edmprod/dnb]
      instrumental: [["chorus", 6], ["verse", 3]],                      // [corpus:edmprod/dnb]
    },
    /* ONE drop is enough to earn a breakdown — lofi needs two choruses before a
       bridge, jungle does not: the template is intro/breakdown/DROP with the
       first breakdown arriving early [corpus:edmprod/dnb] */
    bridgeAfterChorus: { verse: 1, chorus: 1 },          // [corpus:edmprod/dnb]
    /* THE JUNGLE BREAKDOWN IS NEARLY SILENT — "remove everything except the
       drums and the bass", or drop the drums entirely [corpus:edmprod/jungle,
       kansamples]. That is far below lofi's bridge at 0.68. And the second drop
       must hit harder than the first [corpus:kansamples] — MK2 gives
       chorusPeak only to the LAST chorus, which happens to be exactly right. */
    energy: { intro: 0.45, outro: 0.40, bridge: 0.30, instrumental: 0.82,
              chorus: 0.94, chorusPeak: 1.0, verse: 0.86 },             // [corpus:kansamples, EAR on exact values]
  },

  /* ── stage 3: materials ─────────────────────────────────────────────────

     THE AMEN BREAK, TRANSCRIBED TO MK2's 16-STEP GRID.
     Source recording: The Winstons, "Amen, Brother" (Metromedia, 1969, B-side of
     "Color Him Father"); the break begins at 1:26 and is four bars played by
     Gregory Coleman [corpus:wikipedia/amen_break]. Tempo ~136 bpm
     [corpus:alijamieson, musicradar gives 137, audiolabs says "about 140",
     songbpm reads the whole track at 130]. CONSISTENCY CHECK: 16 beats at
     136 bpm = 7.06 s, which matches the "seven seconds" Wikipedia states —
     so 136 is the figure that survives its own arithmetic and I use it. [theory]

     ⚠ HOW I GOT THE STEP NUMBERS. Two independent drum-lesson transcriptions
     (drumstheword, elephantdrums) give the same bar-by-bar prose in "e / + / a"
     notation; I converted that prose to 0-indexed sixteenths myself
     (beat1=0, beat2=4, beat3=8, beat4=12; e=+1, +=+2, a=+3). I did NOT measure
     the audio. Everyone who has measured it says the same thing — Ethan Hein:
     "You can't adequately represent the Amen via MIDI or music notation... hardly
     any of them are exactly where they are supposed to be" — so treat these as
     the SKELETON, not the performance. [corpus:drumstheword, elephantdrums;
     step conversion = mine, unmeasured]

       bar 0 and bar 1 (identical):
         ride  0 2 4 6 8 10 12 14        (eighths throughout)
         kick  0, 10, 11                  ("two sixteenth bass drums starting on
                                           the + of beat 3")
         snare 4, 12                      (the backbeat)
         ghost 7, 9, 15                   ('a' of 2, 'e' of 3, 'a' of 4 pickups)
       bar 2:
         ride  0 2 4 6 8 10 12 14
         kick  0, 10                      (single kick — the 'a' hit is dropped)
         snare 4, 14                      ★ THE MOVE: beat-4 snare displaced one
                                           eighth LATE to the "+" of 4
         ghost 7, 9
       bar 3:
         ride  0 2 4 6 8;  CRASH 10       ("an early crash cymbal")
         kick  2, 3                       (downbeat left empty; double kick on
                                           the "and" of one)
         snare 4, 14                      (displaced, as bar 2)
         ghost 1, 7, 9                    ('e' of beat 1 extra snare)

     THE TWO-STEP IS THE AMEN'S SKELETON. Attack Magazine's raw-D&B build puts
     kick on the 1st and 11th steps and snare on the 5th and 13th — 0-indexed,
     kick [0,10] and snare [4,12] — at 168-178 bpm [corpus:attackmagazine/raw-dnb].
     That is EXACTLY bars 1-2 of the Amen with the ghosts removed. MusicRadar
     describes the same thing as "the second kick pushed later in time to the
     eighth-note before the second snare" at ~170 [corpus:musicradar/6-grooves].
     This is the single most useful fact in this document: MK2's `pocket` is
     already the right abstraction, and jungle's pocket is [0,10].

     PITCHED, NOT STRETCHED. The Amen at 136 played back at 170 without
     timestretch runs 12*log2(170/136) = 3.86 semitones sharp; at 160 it is 2.81
     sharp [theory]. "Producers would sample a 90 bpm funk break, then pitch it up
     until it's 170 bpm or higher" [corpus:reverb.com/samplers]. That pitch-up IS
     the sound — a jungle snare is a funk snare a minor third high with the decay
     shortened to match. When MK2 synthesises the kit, tune the snare/ghost bodies
     UP ~4 semitones from their lofi values or the kit will read as trip-hop. */

  /* the pocket = kick placements. [0,10] is the canonical two-step and the Amen's
     own bars 1-2 minus the extra sixteenth; [0,10,11] restores the Amen's double
     kick; [0,2,3,10] is the Amen's bar-4 figure used as a whole-loop pocket;
     [0,7,10] is the "second kick on the last 16th before beat 3" variant that
     MusicRadar calls neurofunk — late-era only, low weight. */
  pocket: [[[0, 10], 6],                                // [corpus:attackmagazine/raw-dnb, drumstheword]
           [[0, 10, 11], 4],                            // [corpus:drumstheword — the Amen's own double kick]
           [[0, 2, 3, 10], 2],                          // [corpus:drumstheword — Amen bar 4]
           [[0, 7, 10], 1]],                            // [corpus:musicradar/6-grooves — neurofunk, 1997 edge]

  kit: {
    snare:       [4, 12],                               // [corpus:attackmagazine/raw-dnb — steps 5 & 13, 1-indexed]
    hatEvery:    2,                                     // eighth-note ride, exactly as Coleman plays it [corpus:drumstheword]
    hatVel:      0.58,                                  // "a ride cymbal clattering away" — present, not dominant [corpus:mixedinkey, EAR on value]
    /* jungle is GHOST-DENSE. Coleman plays 3 pickup snares per bar; the whole
       character of a chopped break is snares where you didn't ask for them.
       ⚠ MK2's buildDrums emits AT MOST ONE ghost per bar — see widening block. */
    ghostChance: 0.92,                                  // [corpus:drumstheword — ghosts in 4/4 bars, EAR on the probability]
    ghostSpots:  [7, 9, 15, 1, 3, 11],                  // [corpus:drumstheword/elephantdrums — 'a' of 2, 'e' of 3, 'a' of 4, 'e' of 1]
    openSpot:    [[10, 6], [14, 2], [-1, 2]],           // the bar-4 early crash sits on the "+" of 3 [corpus:drumstheword]
    openBars:    [3],                                   // [corpus:drumstheword — bar 4 only]
    kickKeep:    9,                                     // play every kick the pocket names [corpus:drumstheword]
    flourishBar: 3,                                     // the Amen's fourth bar IS its answering bar [corpus:drumstheword]
    /* the fourth-bar ride flourish. Coleman's bar 4 thins the ride and lands the
       crash; a chopped bar 4 usually stutters instead. */
    flourish:    [[[15], 4], [[13, 15], 3], [[11, 13, 15], 2], [[], 2]],  // [EAR — shape from drumstheword, weights are taste]
    variants: {
      main:   {},
      /* THE DROP opens up: more ghosts, ride harder, the Amen's double kick. */
      lift:   { ghostChance: 1.0, hatVel: 0.66, openBars: [1, 3] },        // [EAR]
      /* THE BREAKDOWN. Half-time: "instead of the snare landing on beats two and
         four, a single snare is placed on beat 3", which "halves the perceived
         speed of the groove" [corpus:musicradar/6-grooves]. Kit thins to almost
         nothing — jungle breakdowns are frequently drumless [corpus:edmprod/jungle]. */
      depart: { snare: [8], hatEvery: 4, ghostChance: 0.10, kickKeep: 1,
                openBars: [], flourish: [[[], 1]] },                       // [corpus:musicradar/6-grooves]
    },
  },

  /* THE COUNTER-LINE is nearly absent in jungle. Photek's "Ni-Ten-Ichi-Ryu" is
     "almost all drums" — Ableton's own analysis says terms like verse and chorus
     "don't really make sense" for it and that "form is defined by changes in
     textural density" [corpus:learningmusic.ableton]. Sparse, wide leaps: a
     jungle second voice is a stab or a dub echo, not a harmony part. */
  counter: { density: 0.22, intervals: [-7, -5, -3, 4] },   // [corpus:learningmusic.ableton for the sparsity; intervals [EAR]]

  /* HARMONY. Jungle has two harmonic worlds and no third:
       (a) THE DRONE — ragga jungle, darkside, Photek. One root, held, forever.
           Time Out on Photek/Studio Pressure and on Congo Natty describes
           percussion and bass pressure, not chords [corpus:timeout].
       (b) THE JAZZ-MINOR VAMP — Good Looking / Moving Shadow. "Airy pads,
           jazz-inflected chords", Bukem trained classical then jazz fusion
           [corpus:tracksandtales]. Two chords, four bars, over a pedal.
     A four-chord functional progression is NOT a jungle thing. Weight the drone
     heaviest and let the vamps be the atmospheric-jungle draw. */
  progressions: {
    minor:  [[[0,0,0,0], 6],      // the drone — the majority of the genre [corpus:timeout, learningmusic.ableton]
             [[0,0,5,0], 3],      // one lift to bVI and home — Omni Trio's territory [corpus:timeout "euphoric piano breakdown", EAR]
             [[0,3,0,3], 2],      // i-iv rock, the darkside two-chord [EAR]
             [[0,5,3,0], 2]],     // i-bVI-iv-i [corpus:tracksandtales "chords that glide rather than jab", EAR]
    dorian: [[[0,0,0,0], 5],      // drone in dorian: the natural 6 lives in the pad, not the changes [theory]
             [[0,3,0,3], 4],      // i-IV: THE Bukem vamp [corpus:tracksandtales, EAR]
             [[0,3,4,3], 2]],     // i-IV-v-IV [EAR]
  },
  /* the breakdown's harmony: opens OFF the tonic so the second drop arrives. */
  bridgeProgressions: {
    minor:  [[[3,0,3,0], 3], [[5,0,5,0], 3], [[6,5,0,0], 2]],   // [theory: the departure leaves home]
    dorian: [[[3,0,3,0], 3], [[4,3,0,0], 2]],                   // [theory]
  },

  /* THE REGISTERS. This is where jungle differs most from lofi.
     Sub bass "literally plays in the 25-80 Hz region"; its energy sits 40-60 Hz;
     and in the '90s the source was "the Akai S-Series sampler's sine waveform
     test tone played back on a low octave" [corpus:musicradar/sub-bass].
       MIDI 26 = D1  = 36.7 Hz
       MIDI 28 = E1  = 41.2 Hz   ← edmprod names "the E to G region" the
       MIDI 31 = G1  = 49.0 Hz     subwoofer sweet spot [corpus:edmprod/jungle]
       MIDI 38 = D2  = 73.4 Hz
     So [26, 38] is the sub band, exactly one octave, which is all intoBand needs.
     That is SEVEN SEMITONES BELOW lofi's [33,45] — and the difference is audible
     as the difference between a bass part and a bass PRESSURE.
     ⚠ buildBass contains a hardcoded intoBand(..., 33, 47) for its fifths. A
     jungle fifth will land above the sub band. See the widening block. */
  registers: { bass: [26, 38],                          // [corpus:musicradar/sub-bass, edmprod/jungle]
               keys: [50, 72],                          // pads sit mid, out of the sub's way [theory: 60 Hz crossover]
               counter: [50, 67],                       // [EAR]
               themeA: [62, 79], themeB: [65, 82], themeC: [60, 77] },   // [EAR]

  /* ── stage 5: performance ───────────────────────────────────────────────
     JUNGLE IS NOT SWUNG THE WAY LOFI IS. Attack Magazine's raw-D&B build
     specifies "swing 50-60%" — 50% is straight, 60% is a 60:40 ratio = 1.5
     [corpus:attackmagazine/raw-dnb, theory on the conversion]. But that is a
     modern programmed beat. In 1994 the swing was not a setting: the slices were
     triggered dead on the grid and the FEEL came from inside the sampled audio.
     So: base 1.0 (straight) with a small range, hats/ride swung the SAME as
     everything else (there is no separate hat lane inside a break — the ride is
     part of the slice), and no lane lean at all. */
  groove: {
    /* ⚠ "chopped" IS NOT A NAME STAGE 5 KNOWS. Stage 5 literally tests
       `grooveStyle === "dilla"`. Anything else falls through to the even branch:
       snareEarly=0, kickLate=0, hatSwingMul=1, jitter=GR.jitter.even. For jungle
       that fallthrough happens to be CORRECT, so this table ships working — but
       the genre cannot ask for its own lane lean. See the widening block. */
    styles:     [["chopped", 6], ["even", 4]],          // [EAR — both currently behave identically]
    swing:      [1.00, 0.14],                           // 1.00..1.14; 50-60% swing maps to 1.0-1.5 [corpus:attackmagazine/raw-dnb, theory]
    snareEarly: [0.00, 0.00],                           // no lean — a triggered slice is where you put it [corpus:woovebox, theory]
    kickLate:   [0.00, 0.00],                           // ditto
    hatMul:     1.00,                                   // the ride is INSIDE the break; it cannot swing separately [corpus:drumstheword]
    /* ⚠ THIS IS A GUESS AND I AM SAYING SO. Every source that discusses the
       Amen's timing says it is off-grid — Ethan Hein shows an Ableton screenshot
       where "hardly any of them are exactly where they are supposed to be" — but
       NOBODY PUBLISHES THE DEVIATIONS IN MILLISECONDS. I looked. AudioLabs has an
       onset-annotated version behind a paper I could not read. 4 ms is my guess at
       a human drummer's spread; measure it before you trust it. */
    jitter:     { chopped: 0.004, even: 0.004 },        // [GUESS — no published measurement found]
    push:       -0.003,                                 // the kit sits fractionally ahead [EAR]
  },
  /* THE BASS RINGS. This is the half-time feel made mechanical: at 170 bpm one
     bass note lasting 8 sixteenths = 0.71 s = one beat of an 85 bpm track. Roni
     Size "Brown Paper Bag" measures 170 with a documented half-time of 85
     [corpus:songbpm]. bassArtic must therefore be ~1.0 almost always — a staccato
     bass destroys the ratio that IS the genre. */
  touch: { bassArtic: [[1.0, 8], [0.85, 2]],            // [corpus:songbpm/brown-paper-bag half-time 85, theory]
           strum: [0.0000, 0.0006] },                   // jungle pads are stabs, hit together, not strummed [EAR]

  /* THE SPACE. Jungle's snare lives in a big room — "stereo room, hall, plate or
     chamber, decay 1.5-4 s, 10-20 ms predelay" is the era's snare treatment
     [corpus:theproaudiofiles]. Bukem's Good Looking sound is "airy pads"
     [corpus:tracksandtales]; Photek's is bone dry [corpus:djmag].
     ⚠ MK2's send is wired to keys+lead ONLY, with a 200 Hz high-pass, so this
     number will wet the PADS and never touch the snare. The one thing jungle
     most needs reverb on is the one thing this graph cannot send. */
  space: { wet: 0.30 },                                 // [corpus:theproaudiofiles for the intent; value EAR]
},

/* ═══════════════════════════════════════════════════════════════════════════
   BLOCK 2 — FIELDS WITH NO READER IN MK2 TODAY.
   These are the tables jungle needs that the current stages cannot consume.
   Do NOT paste these into GENRE expecting them to do anything. Each one names
   the exact line of MK2 that would have to widen. Listed so the hole is visible.
   ═══════════════════════════════════════════════════════════════════════════ */

/* 1. SECTION LENGTHS — currently the global `const SECTION_LEN` above GENRE. */
sectionLen: { intro: 32, verse: 16, chorus: 32, bridge: 16,
              instrumental: 16, outro: 32 },            // [corpus:edmprod/dnb, kansamples]

/* 2. PER-BAR SNARE — the Amen's defining move. buildDrums reads a single
      `K.snare` array and applies it to all four bars, so the beat-4 displacement
      in bars 3-4 CANNOT BE STATED. One-line widening:
        for(const s of (K.snarePerBar ? K.snarePerBar[b] : K.snare))
      which reduces to today's behaviour for lofi when snarePerBar is absent. */
snarePerBar: [[4, 12], [4, 12], [4, 14], [4, 14]],      // [corpus:drumstheword, elephantdrums]

/* 3. GHOST COUNT — buildDrums emits at most one ghost per bar. The Amen has
      three per bar. Widening: draw a count, then that many spots, both
      unconditionally (Law 7). */
ghostCount: [2, 4],                                     // [corpus:drumstheword — 3 pickups per bar in bars 1-2]

/* 4. THE SLICE PERMUTATION — the thing that makes it jungle rather than DnB.
      16 slices per bar is the documented convention (woovebox slices the Amen
      into "sixteen roughly evenly spaced slices"; KAN maps "the first chop from
      C1, the second from C#1..." and gives a worked reorder 1-3-2-5-4-6-2-1)
      [corpus:woovebox, kansamples/amen]. Each entry is out[i] = SLICE[perm[i]].
      ⚠ ALL WEIGHTS BELOW ARE [EAR]. I found no corpus of measured jungle
      permutations — nobody has published one. The MOVES are documented (reorder,
      x3 stutter repeat, tape-stop [corpus:woovebox]); the frequencies are mine. */
breakPerms: [
  [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 4],         // straight — the anchor bar [corpus:woovebox]
  [[0,1,2,3,4,5,6,7,0,1,2,3,12,13,14,15], 3],           // restate the first half at beat 3 [EAR]
  [[0,1,2,3,4,5,4,5,8,9,10,11,12,13,12,13], 2],         // stutter pairs [corpus:woovebox "x3 repeat", EAR on placement]
  [[0,1,2,3,12,13,14,15,8,9,10,11,4,5,6,7], 2],         // swap beats 2 and 4 [corpus:kansamples/amen reorder concept, EAR]
  [[0,1,2,3,4,5,6,7,8,9,10,11,15,15,15,15], 2],         // the roll into the bar line [EAR]
],
/* KEEP STEP 0 FIXED. Every permutation above starts with slice 0. That is not a
   rule I found stated; it is what makes the loop still land, and it is why the
   bass and the break stay locked. [EAR — state it, then A/B breaking it] */

/* 5. THE ACCENT MAP — currently the global DRUM_ACCENT, measured on 1,150 HUMAN
      performances of (presumably) straight-time music. Its snare row peaks at
      steps 4 and 12. For a RESEQUENCED break that is actively wrong: loudness
      travels with the SLICE, not with the position, so a ghost slice landing on
      step 4 gets multiplied by 0.96 and becomes a backbeat. Jungle needs either
      its own row or accent=1 with velocity carried by the slice. */
accent: { kick:  [1.00,0.20,0.55,0.60,0.85,0.30,0.50,0.45,0.90,0.35,1.00,0.95,0.85,0.35,0.55,0.40],
          snare: [0.45,0.40,0.35,0.40,1.00,0.30,0.55,0.50,0.40,0.55,0.40,0.35,1.00,0.35,0.95,0.55],
          ghost: [0.45,0.40,0.35,0.40,1.00,0.30,0.55,0.50,0.40,0.55,0.40,0.35,1.00,0.35,0.95,0.55],
          hat:   [0.95,0.45,0.85,0.45,0.95,0.45,0.85,0.45,0.95,0.45,0.85,0.45,0.95,0.45,0.85,0.45] },
          // [derived from the Amen transcription: loud where Coleman lands, quiet
          //  where he does not — corpus:drumstheword. NOT a measurement of audio.]

/* 6. THE ROLE MAP — currently the `ROLES` const inside makeArrangement (stage 4).
      Jungle's intro is drums alone; its drop is drums+bass and often nothing
      else; a lead may never appear. MK2 will always put keys+bass in an intro. */
roles: { intro:        ["drums"],                       // [corpus:edmprod/dnb "DJ intro, drums and atmosphere"]
         verse:        ["drums", "bass", "keys"],       // [corpus:learningmusic.ableton]
         chorus:       ["drums", "bass", "keys", "lead"],
         bridge:       ["keys", "bass"],                // the breakdown drops the drums [corpus:edmprod/jungle]
         instrumental: ["drums", "bass"],               // the drums-only pass [corpus:learningmusic.ableton]
         outro:        ["drums"] },                     // mirrors the intro for the DJ [corpus:kansamples]

/* 7. SEVENTHS — makeMaterials calls chordTones(root, mode, d, /*seventh*/ true)
      with a hardcoded true. The drone/ragga half of jungle wants root+fifth or a
      bare octave; the Bukem half wants sevenths and ninths. No genre control. */
harmony: { sevenths: [["m7", 5], ["triad", 3], ["root5", 2]],   // [corpus:tracksandtales for the jazz half; EAR on weights]
           extensions: ["9"],                           // [corpus:tracksandtales "chords that glide" — 9ths, EAR]
           borrowed: [],                                // jungle does not borrow; it drones [theory]
           cadence: "none — the loop does not cadence, it rewinds" },  // [corpus:melodigging "powered by rewinds"]

/* 8. STYLE DESCRIPTORS — no reader anywhere; supplied because the brief asked. */
bassStyle:    "half-speed sub. One or two notes per bar, held for 8-16 sixteenths, in [26,38]. "
            + "Root and fifth and octave, almost nothing else — 'lots of roots and fifths, the rhythm "
            + "was the most important thing' is how a junglist describes 90s basslines. Onsets on "
            + "step 0 and step 8, NOT chained to the kick.",   // [corpus:dogsonacid via search snippet, edmprod/jungle]
keysStyle:    "either absent, or a two-chord Rhodes/pad vamp sustained across whole bars. "
            + "Never a comp. Stabs land on 0 and 8 if they land at all.",   // [corpus:tracksandtales, learningmusic.ableton]
leadStyle:    "sparse and non-thematic. In real jungle this slot is a ragga vocal chop or a "
            + "timestretched fragment, not a tune. 2-4 events per 4 bars, wide leaps, long rests.",  // [corpus:12edit, nitelifeaudio]
counterStyle: "a dub echo, not a second voice. density 0.22.",   // [corpus:melodigging "dub sirens", EAR]

/* 9. THE ONE NEW VOICE: V.reese
      Provenance chain, all sourced:
        - the name and the sound come from Kevin Saunderson's 1988 KMS 12"
          "Just Want Another Chance" under the alias Reese, made on a Casio
          CZ-1000, and measured at 121 bpm [corpus:attackmagazine/reese].
        - jungle lifted it wholesale: Renegade "Terrorist" (1994) uses the
          "growling, bum-rumbling bassline from Kevin 'Reese' Saunderson's house
          number, retweaked and pitch-shifted" under Amen beats [corpus:timeout].
        - reconstruction values: 2+ sawtooth oscillators; detune 5-10 cents
          (subtle) / 15-25 (moderate) / 30-50 (extreme); 4-8 unison voices;
          lowpass 24 dB/oct, cutoff 1-3 kHz, resonance 20-40%; slow filter/phase
          modulation over 1/2 bar to 4 bars [corpus:thedystopiancollective].
        - and it must sit ON a sine sub, because the saws alone have no 40-60 Hz
          [corpus:musicradar/sub-bass].
      Shape for MK2 (returns source nodes like every other voice):
          sine  at f                     gain 1.00   ← the 40-60 Hz that does the work
          saw   at f * 2^(+18c/1200)     gain 0.42
          saw   at f * 2^(-18c/1200)     gain 0.42   ← 36 cents apart = the beating
          -> lowpass 24 dB/oct (two biquads) at 700 Hz, Q 1.2
          -> the cutoff walked by a 0.25 Hz sine, +/- 250 Hz   (the "movement")
          sum 1.84
      18 cents is the middle of the documented 15-25 "moderate" band; 0.25 Hz is
      one cycle per 2 bars at 170 bpm [theory]. 700 Hz is [EAR] — the documented
      1-3 kHz is a modern figure and a 1994 Reese is darker than that.

      ⚠ THE RUNNER-UP, AND IT IS CLOSE: V.ride. "A ride cymbal clattering away is
      a characteristic feature" of these beats [corpus:mixedinkey], and Coleman
      plays eighth-note ride under all four bars [corpus:drumstheword]. MK2's
      `hat` is a short tick; the Amen's texture is a continuous wash with a
      ~250 ms decay that gets CUT by the next slice. If the reese is skipped,
      the ride is the one to build instead — but the reese carries more identity.

  10. SPACE, WIDENED. `space:{wet}` is one number feeding one send that is wired
      to keys+lead in buildGraph. Jungle needs the drums bus in that send and a
      tone tilt on the master.  */
spaceWide: { wet: 0.30,                                 // [corpus:theproaudiofiles, EAR on value]
             sends: { drums: 0.35, keys: 1.0, lead: 0.8, bass: 0.0 },   // snare in the room, sub bone dry [corpus:theproaudiofiles + theory]
             sendHpHz: 300,                             // keep the break's tail, keep the sub out [EAR]
             toneTilt: +1.5 },                          // dB of high shelf: pitched-up breaks are BRIGHT [corpus:reverb.com/samplers, EAR on dB]

```

## What MK2's architecture cannot express

- VERDICT ON THE SLICE-RESEQUENCER: it FITS at the note level and BREAKS at the audio level, and the note-level version is the one to build. Note level: represent the break as SLICE[0..15], each slice a set of {lane, vel} at that sixteenth; draw ONE permutation per material from a weighted table on stream(seed,'break'); emit notes at step i carrying the lanes of SLICE[perm[i]]. That is one owner (stage 3), one draw, no correction pass, frozen on exit — structurally identical to how `pocket` already works, and it obeys every law. Audio level it breaks in two places: (a) a real slice carries TAILS — the room, the ride mid-decay, ghosts that happen to fall inside it — and reordering audio segments is not reordering hits, so the characteristic sound of tails colliding is inexpressible as lane+step+vel; (b) stage 5 owns timing and applies per-hit jitter, which is meaningless for a contiguous audio region whose slice boundaries must stay sample-adjacent. Two owners would want the same property. So: build the note-level resequencer, and accept that MK2 will sound like a well-programmed break, not like a chopped record.

- THE BUILDER-SELECTION PROBLEM, and it is the one place the law genuinely bends. makeMaterials calls buildDrums() by name, unconditionally. A slice-resequencer is a DIFFERENT builder, not different parameters. The least-bad move is a branch on a TABLE VALUE (`if (G.kit.mode === 'break') buildBreak(...) else buildDrums(...)`) — a branch on data, never on a genre name. That is still a branch in stage 3 that did not exist before, and I am flagging it LOUDLY rather than smuggling it in. The alternative — forcing lofi's kick/snare/hat/ghost/openhat logic and jungle's slice permutation into one generalised builder — is a rewrite of stage 3, not a widening.

- STAGE 5 CONTAINS A HARDCODED STYLE NAME. makePerformance tests `grooveStyle === 'dilla'` in four places to decide snareEarly, kickLate, hatSwingMul and whether drum lanes swing at all. A genre cannot name its own groove style and get lane lean; anything not literally 'dilla' falls through to the even branch. Jungle survives this by luck (the even branch is what jungle wants) but the hole is real: styles should be TABLE ENTRIES carrying {snareLean, kickLean, hatMul, laneSwing, jitter}, not a string stage 5 recognises.

- buildDrums CANNOT STATE A PER-BAR SNARE. `for(const s of K.snare)` applies one array to all four bars. The Amen's single most identifying gesture — the beat-4 snare displaced an eighth late to step 14 in bars 3 and 4, which MusicRadar calls the most crucial element of the pattern — is therefore unstatable. Fix is one line: `K.snarePerBar ? K.snarePerBar[b] : K.snare`, which is a no-op for lofi.

- buildDrums EMITS AT MOST ONE GHOST PER BAR. One `rng() < K.ghostChance` and one `pick(rng, ghostSpots)`. The Amen has three pickup snares per bar and ghost density is most of what makes a break sound like a break. Needs a drawn COUNT then that many spots, both draws unconditional per Law 7.

- THREE HARDCODED REGISTER LITERALS IN STAGE 3, all lofi's, none overridable: buildBass uses `intoBand(degMidi(...), 33, 47)` for its diatonic fifths; the ending uses `intoBand(..., 33, 45)` for its bass note and `intoBand(t, 55, 72)` for its tonic chord. With jungle's bass register at [26,38] a fifth will land up to an octave above the root and the ending will land seven semitones above the whole song. These are bugs the moment a second genre exists.

- THE BASS IS CHAINED TO THE KICK. buildBass iterates `for(let i = 1; i < pocket.length; i++)` — bass onsets ARE kick positions. That encodes a lofi/band assumption (the harvest cites 77% bass+comp co-onset). Jungle's entire identity is that the bass does NOT follow the kick: it moves at half speed underneath a kick doing sixteenth-note work. The genre needs its own bass rhythm table (e.g. bassSteps: [[[0,8],5],[[0],4],[[0,8,14],2]]) that buildBass reads INSTEAD of pocket. Without it, jungle's half-time feel — the one thing that makes it unmistakable — cannot be produced.

- SECTION_LEN IS A GLOBAL CONST, NOT A GENRE TABLE. intro 4, verse 8, chorus 8, outro 4. At 170 bpm a jungle 'drop' would be 11 seconds. The documented template is 32-bar intro / 16-32 bar sections / 32-bar outro. Move it into GENRE. Related: makeForm's `for(let guard = 0; guard < 10; guard++)` caps a song at ~10 sections, which with 8-bar lengths caps it at ~88 bars — a jungle 12" is 5-6 minutes, i.e. ~250 bars at 170.

- NO WAY TO VARY WITHIN A SECTION. Stage 4 maps ONE material per section and stage 5 loops it with `loopBar = (bar - startBar) % 4`. A 32-bar jungle drop would be the identical 4 bars eight times. Real jungle re-edits the break every 2 bars across the drop and does a hard switch-up at the halfway point — that is the genre's central arrangement gesture and MK2 has no axis for it. Widening: a per-section material CYCLE (e.g. `blocks: ['A','A','Avar','A']`) consumed by stage 5 as it walks 4-bar blocks. That is a change to stage 4/5 logic, not a table alone.

- ROLES IS A CONST INSIDE makeArrangement, NOT A GENRE TABLE. MK2 will always put keys+bass in an intro and keys+bass+lead in a verse. A jungle intro is drums alone; Photek's 'Ni-Ten-Ichi-Ryu' is 'almost all drums' with no verse/chorus at all (Ableton's own analysis says form there is 'defined by changes in textural density'). Move ROLES into GENRE.

- DRUM_ACCENT IS GLOBAL AND MEASURED ON THE WRONG MUSIC. Its snare row peaks at steps 4 and 12 (a straight backbeat) and its ghost row is a copy of the snare row. For a resequenced break this is the architecture fighting the genre: loudness in a real break travels with the SLICE, not with the position, so a ghost slice landing on step 4 gets multiplied by 0.96 and becomes a backbeat. Either DRUM_ACCENT moves into GENRE, or slices carry their own velocity and the accent multiplier is 1 for this genre. Note this cannot be fixed downstream — stage 5 owns the one gain formula and there is no correcting pass.

- REVERB IS WIRED TO THE WRONG BUSES. buildGraph does `g.bus.keys.connect(g.send); g.bus.lead.connect(g.send)` with a 200 Hz high-pass, and `space` is a single `{wet}`. The one thing jungle most needs in a room is the SNARE (era practice: hall/plate, 1.5-4 s decay, 10-20 ms predelay); the one thing it must keep bone dry is the sub. MK2 can express neither. `space` needs per-bus send levels, a settable send high-pass, and a master tone tilt (which does not exist as a node at all).

- SEVENTHS ARE HARDCODED ON. makeMaterials calls chordTones(root, mode, d, true) with a literal true. Jungle's drone half wants root+fifth or a bare octave; its Bukem half wants m7 and 9ths. Also chordTones only stacks diatonic thirds, so borrowed chords and extensions have no representation anywhere in the model.

- PHRYGIAN DOES NOT EXIST. MODES has minor/dorian/major only. The b2 over a static minor root is jungle's most characteristic modal colour (the darkside/ragga sound) and cannot be drawn.

- MELODY ONSETS ARE EIGHTH-NOTES ONLY. buildTheme's onsetPool is [0,2,4,6,8,10,12,14], hardcoded in stage 3, as is buildKeys' SYNC pool [[8,5],[6,3],[13,2],[11,2],[2,1]]. A ragga vocal chop lands on odd sixteenths and off-grid; a jungle stab lands on 8 and nowhere else. Neither pool is genre-controlled.

- NO PITCH GLIDE ANYWHERE IN THE NOTE MODEL. A note is {bar, step, dur, pitch}. The Reese's signature move is a slide — and the seam check `inKey()` THROWS on any out-of-key pitch, so a chromatic approach or a bend target is a build failure by construction. This is correct behaviour for the model MK2 has; it just means jungle's bass gestures are unrepresentable.

- NO SAMPLED-BREAK VOICE, AND THIS IS THE HONEST CEILING. The Sound stage can hold sample data — EPIANO proves it, dacKick/dacSnare prove baked buffers work — but there is no voice that plays a slice of a multi-second drum recording at an offset. Without one, jungle's single most identifying sonic feature (a funk break pitched up ~3.9 semitones from 136 to 170 with the sampler's grain and the wrong-length tails) has to be synthesised, and the result will read as 'fast programmed breakbeat' rather than 'jungle'. Separately: the Winstons' recording is not public domain, so shipping the actual Amen in the HTML is a legal question and not only an architectural one.


## Numbers the researcher flagged as UNCERTAIN

- JITTER 0.004 s — [GUESS]. Every source says the Amen is off-grid (Ethan Hein: 'hardly any of them are exactly where they are supposed to be') but NOT ONE publishes the deviations in milliseconds. AudioLabs has onset annotations behind a 2016 IEEE paper I could not read. This number is my invention and should be measured before it is trusted.

- ALL breakPerms WEIGHTS — [EAR]. The MOVES are documented (reorder, x3 stutter repeat, tape-stop at woovebox; a worked reorder 1-3-2-5-4-6-2-1 at KAN Samples) but no corpus of measured jungle permutations exists that I could find. Which permutation a junglist reaches for most often is unknown to me.

- The 'keep slice 0 fixed' rule — [EAR]. Not stated anywhere I read. It is my inference from the fact that the loop has to land.

- flourish weights [[[15],4],[[13,15],3],[[11,13,15],2],[[],2]] — [EAR]. The SHAPE (bar 4 answers) is from the Amen transcription; the four options and their weights are taste.

- ghostChance 0.92 — the FACT that jungle is ghost-dense is sourced (Coleman plays three pickup snares per bar); the probability 0.92 is [EAR].

- The `accent` map in block 2 — derived by hand from the transcription, NOT measured off audio the way MK2's existing DRUM_ACCENT was measured off 1,150 performances. Do not present it as a measurement.

- Reese lowpass cutoff 700 Hz — [EAR]. The documented figure is 1-3 kHz (thedystopiancollective) but that is a modern Serum-era Reese; a 1994 record is darker. I moved the number on taste and am telling you.

- Reese detune 18 cents — sits in the documented 15-25 'moderate' band, but the exact value is mine.

- toneTilt +1.5 dB and sendHpHz 300 — [EAR]. The direction is sourced (pitched-up breaks are bright; keep the sub dry); the values are not.

- space.wet 0.30 — the intent is sourced (1.5-4 s hall/plate on the snare, 10-20 ms predelay); the send level is [EAR].

- energy values (bridge 0.30 etc.) — the ORDERING is sourced (jungle breakdowns are near-silent, second drop harder than first); the exact numbers are [EAR].

- Rufige Kru 'Terminator' tempo — genuinely contested: songbpm reads 150, another database reads 165 for the same title. Different masters/remasters. I report the range, not a number.

- The Amen step numbers themselves — I converted two agreeing PROSE transcriptions (drumstheword, elephantdrums) into 0-indexed sixteenths myself. I did not measure the audio. If the two lesson sites are both wrong about the same detail, so am I.

- Amen original tempo 136 — sources give 130 (songbpm, whole track), 136 (alijamieson), 137 (MusicRadar), ~140 (AudioLabs). I chose 136 because 16 beats at 136 = 7.06 s, which matches Wikipedia's stated 'seven seconds' — an arithmetic check, not an independent measurement.

- coldOpen 0.06 and openVerse 0.15 — the template is sourced; these specific probabilities are [EAR].

- Whether 'Brown Paper Bag' is really in B major — songbpm says so, but that track has almost no functional harmony so the key detector is probably reading a bass drone. I did not use it.


## Sources

- https://en.wikipedia.org/wiki/Amen_break

- https://alijamieson.co.uk/2021/12/31/can-i-get-amen-winstons-classic-break-examined/

- https://www.audiolabs-erlangen.de/resources/MIR/2016-IEEE-TASLP-DrumSeparation/AmenBreak

- https://www.ethanhein.com/wp/2023/building-the-amen-break/

- https://www.drumstheword.com/free-drum-lesson-amen-break-best-drum-beats-ever-amen-brother-gregory-coleman/

- https://www.elephantdrums.co.uk/blog/guides-and-resources/amen-break-drum-groove/

- https://www.musicradar.com/tuition/tech/how-to-program-an-amen-style-break-637374

- https://www.musicradar.com/how-to/program-6-different-jungle-6-dnb-grooves

- https://www.attackmagazine.com/technique/beat-dissected/raw-drum-bass/

- https://www.attackmagazine.com/technique/deconstructed/reese-just-want-another-chance/

- https://en.wikipedia.org/wiki/Drum_and_bass

- https://en.wikipedia.org/wiki/Jungle_music

- https://en.wikipedia.org/wiki/Think_break

- https://www.timeout.com/music/the-20-best-jungle-tracks-ever-made

- https://djmag.com/longreads/solid-gold-how-beat-science-photeks-modus-operandi-redefined-drum-bass

- https://learningmusic.ableton.com/song-structure/ni-ten-ichi-ryu.html

- https://kansamples.com/blogs/learn/how-to-chop-amen-break

- https://kansamples.com/blogs/learn/dnb-track-arrangement

- https://www.woovebox.com/support/guides--tutorials/sampler/amen-chop-tutorial

- https://www.edmprod.com/how-to-make-jungle-music/

- https://www.edmprod.com/how-to-make-drum-and-bass/

- https://www.thedystopiancollective.com/tutorials-2/how-to-create-reese-bass-the-complete-guide-to-the-iconic-drum-amp-bass-sound

- https://nitelifeaudio.com/classic-techniques-timestretched-jungle-vocal/

- https://www.12edit.com/ragga-jungle/

- https://www.reasonstudios.com/news/post/jungle-101-the-beat

- https://reverb.com/news/the-samplers-behind-90s-jungle-and-drum-and-bass

- https://www.musicradar.com/news/ultimate-guide-to-sub-bass

- https://www.studiobrootle.com/drum-and-bass-drum-patterns/

- https://amenbreaks.co.uk/blog/the-essential-elements-to-jungle-music/

- https://magneticmag.com/2026/06/music-production-tips-for-making-jungle/

- https://www.melodigging.com/genre/ragga-jungle

- https://www.tracksandtales.co/blogs/listening-bar-albums/logical-progression-ltj-bukem-1996

- https://songbpm.com/@the-winstons/amen-brother

- https://songbpm.com/@goldie/timeless

- https://songbpm.com/ltj-bukem/music

- https://songbpm.com/@roni-size/brown-paper-bag-wgOVyrj04l

- https://songbpm.com/@dillinja/the-angels-fell

- https://songbpm.com/@omni-trio/renegade-snares

- https://songbpm.com/@goldie/terminator---goldie-presents-rufige-kru

- https://songbpm.com/@incredible-bongo-band/apache

- https://songbpm.com/lyn-collins/think-about-it---single-version

- https://getsongbpm.com/song/ni-ten-ichi-ryu-teebee-remix/gJOOk6

- https://en.wikipedia.org/wiki/Akai_S1000

- https://theproaudiofiles.com/5-ways-use-reverb-drums-mix/

- https://mixedinkey.com/captain-plugins/wiki/how-to-make-drum-and-bass-the-complete-guide/
