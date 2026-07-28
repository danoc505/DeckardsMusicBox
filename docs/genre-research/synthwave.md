# Synthwave / Outrun (with a second key for the Carpenter Brut / Perturbator darksynth wing)

*Web research delivered 2026-07-28. NOT independently verified — the verification pass hit the session limit before it ran. Treat every number as the researcher's claim until checked.*

## What makes it unmistakable

Two things, and they must happen simultaneously in the same bar or the genre does not read:

(1) THE GATED-REVERB SNARE ON 2 AND 4. Not a snare with reverb — a snare whose reverb is enormous, bright, and then STOPS DEAD, as if someone cut the tape. A huge burst that occupies the whole space for ~0.3–0.5 s and then is gone, leaving silence before the next hit. Wikipedia's genre description lists exactly three sonic markers for synthwave and this is one of them ("electronic drums, gated reverb, and analogue synthesiser bass lines and leads"). The original is the AMS RMX16 NonLin2 program — early reflections that do not decay, ending abruptly (Wikipedia/Gated reverb; LiquidSonics). Get this wrong and you have generic 80s pop; get it right and a listener names the genre on the second snare.

(2) A CONTINUOUS 16TH-NOTE ARPEGGIO, CHORUSED, SPANNING 2–3 OCTAVES, OUTLINING THE CHORD, RUNNING THE WHOLE BAR. Not a comp, not a pad strike — an unbroken machine-gun of single notes. "Nightcall" is literally built on one: an 8-note arpeggio pattern that outlines Am | G | F | Dm, sawtooth, three-voice unison, plucked envelope (Reverb Machine). Every tutorial source independently lands on 1/16 (Attack Magazine's Com Truise build: arp rate 1/16; Native Instruments' walkthrough: 16th-note driving synth; futureproofmusicschool: "16th or 8th notes, tempo-synced"; SoundBridge: lead arp "3 octaves with 2 repetitions").

Everything else — the octave-jumping bass, the four-on-the-floor or 1-and-3 kick, the minor key, the saw lead an octave above everything — is supporting cast. A track with the gated snare and the 16th arp is synthwave even if you get all the rest wrong. A track with all the rest and neither of those is not.

THE MK2 PROBLEM IN ONE SENTENCE: MK2 can build (1) as a voice in stage 6 today, and CANNOT build (2) at all — stage 3's buildKeys makes block chords struck at pocket steps, and there is no arpeggiator anywhere in the file.

## The tables

```js
/* ═══════════════════════════════════════════════════════════════════════════
   SYNTHWAVE + DARKSYNTH — genre tables for GENRE{}.
   Provenance marks follow the file's existing convention. Two additions,
   because the honest thing is to distinguish measurement from taste:
     [corpus:<db>]  a number I read off a public dataset/analysis. NOTE: every
                    BPM database cited here is ALGORITHMIC (Tunebat/songbpm/
                    getsongbpm derivatives). They half/double-time synthwave
                    constantly -- the same 50-song list has "Airwolf Theme" at
                    199 and "Night Train" at 179, which are ~99.5 and ~89.5.
                    Treat any single track BPM as +/- a factor of 2, and the
                    aggregate as a shape, not a measurement.
     [tut:<source>] one production tutorial's stated value. This is a craft
                    convention with a URL, NOT a measured distribution. It is
                    stronger than [EAR] and weaker than [corpus].
     [EAR]          taste, awaiting an A/B render.
     [GUESS]        I could not find this. It is a placeholder. Do not trust it.
     [theory]       music-theory fact.
   ═══════════════════════════════════════════════════════════════════════════ */

synthwave: {
  label: "synthwave",

  /* ── stage 1: identity ────────────────────────────────────────────────── */

  /* WHY [92,132]. The genre's tempo mass is BIMODAL and one uniform draw
     cannot honour that (see architectureGaps #1). The two lobes:
       cruise   ~86-100: Gunship "Tech Noir" 86, Sunglasses Kid "Stranger Love"
                88, Timecop1983 "Tonight" 90, Anoraak "We Lost" 90, KAVINSKY
                "NIGHTCALL" 92, Starcadian "New Cydonia" 94, Dance With The Dead
                "Adrift" 95, Kalax "Levitate" 95, Andromeda Coast "City In The
                Sea" 99. Com Truise tutorials build at 90.
       outrun  ~117-140: Mitch Murder "Alright" 117 / "Accelerator Control
                Network" 120 / "Action Bike" 123 / "1993" 128, D/A/D "Sky High"
                120, Robert Parker "'85 Again" 125, College "Teenage Color" 125,
                Futurecop! "NASA" 126, FM Attack "Magic" 128, LeBrock "Runaway"
                130, FM-84 "Running In The Night" 133, Moonrunner83 135,
                September 87 138, The Midnight "Kids" 140.
     Floor 92 = Nightcall, the anchor record of the entire genre. Ceiling 132
     = above FM-84/Phaserland 133 you are in the darksynth key below.
     Editorial bands agree: Wikipedia "80 to 118 BPM, more upbeat 128 to 140";
     ModeAudio identical; Roland "around 80 bpm to 150 bpm". Measured aggregate
     over the 50-song set: mean 124, median 125, mode 125/140 -- but that mean
     is inflated by ~9 obvious double-time reads. */
  tempo: [92, 132],  // [corpus:orpheus-50 + songbpm] see note above; the SPREAD is [EAR]

  /* Mode weights are [EAR], deliberately, and here is why you should not
     believe anyone who gives you measured ones. The only public key survey of
     synthwave (Orpheus, 50 songs) reports 34 major / 16 minor -- but the author
     states the method: "I used Tunebat.com to find the keys." Algorithmic key
     detection cannot separate a key from its relative, and i-VI-III-VII in
     minor IS vi-IV-I-V in the relative major -- identical pitch content. So the
     major/minor split in that dataset is measuring the detector, not the music.
     What survives the ambiguity: A minor is the single most common label (5 of
     50, incl. Nightcall). I weight minor heavily on the ear and say so. */
  modes: [["minor", 7], ["major", 3], ["dorian", 1]],   // [EAR] -- see note; dorian is near-absent in what I read

  rig: [["neon", 10]],          // [EAR] -- REQUIRES a new RIG row, see palette + gap #9
  keysChar: [["juno", 6], ["jupiter", 4]],  // [EAR] Juno-106/Jupiter-8 are the two named again and again (ModeAudio, Roland, Reverb Machine's TAL U-NO-LX)
  tape: { wow: [0.0006, 0.0010],    // [EAR] VHS warble, ~half lofi's; synthwave is tape-nostalgic, not tape-damaged
          crackle: [0.0008, 0.0015] },  // [EAR] hiss, not vinyl crackle. Near-zero on purpose.

  /* ── stage 2: form ────────────────────────────────────────────────────── */
  form: {
    coldOpen: 0.08,   // [tut:orpheus-structure/edmprod] synthwave almost always has an intro; Nightcall opens on a FILTERED ARP for 8 bars. A cold open is rare.
    openVerse: 0.72,  // [EAR] pop structure: intro -> verse
    /* [tut:edmprod] cites The Midnight "Souvenir" as the template: 8-bar intro,
       16-bar verses, 8-bar pre-chorus, 16-bar chorus, 4-bar post-chorus,
       bridge, chorus, outro = ~90 bars. MK2's SECTION_LEN is 8-bar verses and
       choruses and is GLOBAL, not per-genre (gap #4), so I target 48-72 bars,
       which is the same wall-clock at 8-bar sections. */
    target: [48, 4, 8],   // [tut:edmprod] -> 48..72 bars
    transitions: {
      verse:        [["chorus", 8], ["verse", 2], ["bridge", 1]],       // [tut:orpheus-structure] "Intro > Verse > Chorus > Verse > Chorus > Bridge > Chorus > Outro"
      chorus:       [["verse", 5], ["instrumental", 4], ["bridge", 3], ["chorus", 2]],  // [tut:orpheus-structure] the post-chorus/interlude is a NAMED synthwave habit
      bridge:       [["chorus", 9], ["verse", 1]],                       // [tut:orpheus-structure] the bridge exists to set up the final chorus
      instrumental: [["chorus", 7], ["verse", 3]],
    },
    bridgeAfterChorus: { verse: 1, chorus: 2 },   // [EAR] carried from lofi's shape
    /* Energy: FLATTER than lofi at the bottom and HIGHER at the instrumental.
       Two genre facts drive this. (a) The intro is a filtered arp -- quiet by
       FILTER, which MK2 can only approximate with gain (gap #5). (b) In
       synthwave the instrumental is the LEAD SOLO section and it is a peak,
       not a rest: [tut:orpheus-structure] "a melodic synth lead stepping into
       the spotlight in a bridge or post-chorus section". Lofi puts the
       instrumental at 0.72; synthwave must not. */
    energy: { intro: 0.42, outro: 0.38, bridge: 0.55, instrumental: 0.88,
              chorus: 0.95, chorusPeak: 1.0, verse: 0.70 },   // all [EAR], shaped by [tut:orpheus-structure] "three peaks, final chorus highest"
  },

  /* ── stage 3: materials ───────────────────────────────────────────────── */

  /* THE POCKET = kick placements as sixteenth indices. Two patterns dominate
     and the sources disagree about which is primary, so both get real weight:
       [0,8]        kick on 1 and 3. [tut:orpheus-drums] "probably one of the
                    most simple and straightforward"; [tut:modeaudio] "emphasise
                    beats 1 and 3 with the kick and snare".
       [0,4,8,12]   four-on-the-floor. [tut:orpheus-drums] "At the heart of many
                    synthwave drum patterns lies the classic four-on-the-floor".
     WARNING: in MK2 `pocket` also drives BASS onsets and KEYS strikes. That is
     wrong for this genre (gap #3) -- synthwave's bass pulses independently of
     the kick. These weights are chosen for the KICK; the bass they imply is a
     side effect I cannot prevent from the table. */
  pocket: [[[0, 8], 5],                 // [tut:orpheus-drums, tut:modeaudio] 1 and 3
           [[0, 4, 8, 12], 5],          // [tut:orpheus-drums, tut:edmprod] four-on-the-floor
           [[0, 8, 14], 2],             // [EAR] 1, 3, and the "a" pickup into the next bar
           [[0, 6, 8], 2],              // [EAR] 1, the "and" of 2, 3 -- the Miami Vice lean
           [[0, 4, 8, 12, 14], 1]],     // [EAR] driving four with a pickup

  kit: {
    snare: [4, 12],        // [tut:orpheus-drums, tut:modeaudio, tut:edmprod, tut:native-instruments] beats 2 and 4. Unanimous across every source I read. Also Com Truise: "huge, ubiquitous snare hits on 2 and 4".
    hatEvery: 2,           // [tut:futureproof] "8th-note or 16th-note closed hi-hat pattern"; [tut:modeaudio] "fill out the crotchets or quavers in between". 8ths is the base; the chorus variant goes to 16ths.
    hatVel: 0.58,          // [tut:native-instruments] their walkthrough programs hats at MIDI velocity 74 => 74/127 = 0.583. ONE tutorial's value, not a distribution.
    ghostChance: 0.10,     // [tut:modeaudio] "virtually no velocity deviation is used" -- this is a DRUM MACHINE. Ghosts are near-absent; 0.10 keeps the draw alive without making the kit human.
    ghostSpots: [7, 14, 15],   // [EAR] the only ghosts that belong are pickups into the backbeat/downbeat
    openSpot: [[14, 5], [6, 2], [-1, 3]],   // [tut:modeaudio] "Open hats featured prominently" -- so -1 (no open hat) gets a LOWER weight than lofi's
    openBars: [1, 3],      // [EAR]
    kickKeep: 8,           // [EAR] the machine plays the whole pattern; unlike lofi there is nothing to leave out
    flourishBar: 3,        // [tut:orpheus-structure] the "8-bar rule" -- change something every 8 bars; at 4-bar materials the 4th bar is the answer. Carried from lofi's rule-of-three, which is genre-independent.
    /* [tut:modeaudio]: "Snare hits at bar-end function as fills" and "Tom
       sounds (big, boomy) used toward bar conclusions". MK2's `flourish` can
       only add HAT steps (gap #6), so this is a pale version of the real
       thing. The real fill wants the snare and tom lanes. */
    flourish: [[[14, 15], 4], [[7, 15], 2], [[10, 11, 14, 15], 2], [[], 3]],   // [EAR] hats only, because that is all the field can carry
    variants: {
      main: {},
      /* THE CHORUS LIFT. Synthwave's chorus opens up by going to 16th hats and
         opening the hat every bar -- it does NOT get more ghosty, it gets more
         MACHINE. That is the opposite direction from lofi's lift. */
      lift:   { hatEvery: 1, hatVel: 0.62, openBars: [0, 1, 2, 3], ghostChance: 0.05 },  // [tut:futureproof] "16th-note closed hi-hat with occasional open hats"; the rest [EAR]
      /* THE BRIDGE. In synthwave the bridge is the DROP-OUT: drums gone or
         kick-only, pads and arp exposed. [tut:futureproof] "Bridge: stripped
         back contrast section". */
      depart: { hatEvery: 4, ghostChance: 0, snare: [12], kickKeep: 1,
                openBars: [], flourish: [[[], 1]] },   // [tut:futureproof] shape; the exact values [EAR]
    },
  },

  /* THE SECOND VOICE. This table is WRONG for synthwave and I am shipping it
     anyway because the field is required. Synthwave's second melodic voice is
     an OCTAVE/UNISON DOUBLE of the lead (that is what "three-voice unison"
     means in Reverb Machine's Nightcall breakdown, and it is what every "lush
     detuned lead" instruction is describing). deriveCounter is built to AVOID
     doubling -- it prefers contrary motion by construction. +/-7 scale steps
     is exactly one octave [theory: degMidi uses 7 steps per octave], so this
     at least keeps the line octave-related instead of a third below. See
     gap #8: this genre needs counterStyle:"octave". */
  counter: { density: 0.90,        // [EAR] a doubled lead sounds on nearly every note
             intervals: [-7, 7] }, // [theory] +/-7 scale steps = +/-1 octave in MODES{}

  /* PROGRESSIONS as scale degrees, 0 = tonic.
     minor mode [0,2,3,5,7,8,10]: 0=i 1=ii(dim) 2=III 3=iv 4=v 5=VI 6=VII
     THE FAMILY. i-VI-III-VII and its rotations are the synthwave four-chord
     loop, and note the identity that explains the whole "is synthwave major or
     minor" confusion: i-VI-III-VII in minor is the SAME FOUR TRIADS as
     vi-IV-I-V in the relative major [theory]. Every "major" synthwave
     progression in my sources is a rotation of the same set. */
  progressions: {
    minor: [
      [[0, 5, 2, 6], 6],   // i-VI-III-VII (Am-F-C-G) [tut:futureproof] named explicitly as A synthwave progression, "bittersweet nostalgia"
      [[0, 6, 5, 3], 5],   // i-VII-VI-iv (Am-G-F-Dm) -- KAVINSKY "NIGHTCALL", verse. [corpus:reverbmachine] measured off the record.
      [[0, 6, 5, 6], 4],   // i-VII-VI-VII (Am-G-F-G) [tut:futureproof] named explicitly; also the Watchtower/Trooper shape [corpus:wikipedia-aeolian-examples]
      [[0, 5, 6, 5], 3],   // i-VI-VII-VI [tut:emastered] "The Retro Cascade", cited to The Midnight "Crystalline"
      [[0, 2, 5, 6], 3],   // i-III-VI-VII [tut:unison] "Dreamy Dystopia", cited to Timecop1983 "Lovers"
      [[5, 6, 4, 5], 2],   // VI-VII-v-VI (F-G-Em-F) -- NIGHTCALL, chorus. [corpus:reverbmachine]
      [[0, 0, 5, 5], 2],   // i-i-VI-VI, the two-chord vamp. [tut:emastered] "verses and choruses are often built around simple chord progressions with just two or three chords"
    ],
    major: [
      [[0, 4, 5, 3], 5],   // I-V-vi-IV [tut:unison] "Neon Nights"; the pop loop, and the relative-major rotation of i-VI-III-VII [theory]
      [[5, 3, 0, 4], 5],   // vi-IV-I-V [tut:unison] "Retro Futuristic", cited to The Midnight "Shadows"
      [[0, 5, 3, 4], 4],   // I-vi-IV-V [tut:orpheus-chords] "A very typical chord progression for Synthwave is the I-VI-IV-V (or a 1-6-4-5)"
      [[0, 5, 1, 4], 2],   // I-vi-ii-V [tut:unison] "Electric Dreams"
      [[0, 3, 2, 3], 2],   // I-IV-iii [tut:orpheus-chords] cited to The Midnight "Comeback Kid" (1-4-3)
      [[0, 2, 0, 2], 1],   // I-iii vamp [tut:orpheus-chords] cited to Timecop1983 "Dimensions" (1-3)
    ],
    /* DORIAN: I found NO synthwave source that names a dorian progression. The
       nearest real datum is Attack Magazine's Com Truise build, which is in
       B PHRYGIAN -- a mode MODES{} does not have (gap #10). These three are
       structurally sane and stylistically unverified. */
    dorian: [
      [[0, 3, 0, 3], 4],   // i-IV vamp [GUESS]
      [[0, 6, 0, 3], 3],   // i-VII-i-IV [GUESS]
      [[0, 3, 6, 3], 2],   // i-IV-VII-IV [GUESS]
    ],
  },
  /* the bridge: rotated to open OFF the tonic so the final chorus arrives
     [theory]. Shapes are the same family, entry point moved. */
  bridgeProgressions: {
    minor: [[[5, 6, 2, 4], 4],   // VI-VII-III-v [theory] rotation of the i-VI-III-VII set, opening on VI
            [[3, 5, 6, 4], 3],   // iv-VI-VII-v [theory] subdominant departure
            [[5, 2, 3, 6], 2]],  // VI-III-iv-VII [theory]
    major: [[[5, 3, 0, 4], 4],   // vi-IV-I-V [tut:unison] the same loop entered on the relative minor -- exactly the "bridge leaves home" move
            [[3, 4, 5, 4], 3],   // IV-V-vi-V [theory]
            [[1, 4, 0, 4], 2]],  // ii-V-I-V [theory]
    dorian: [[[6, 3, 0, 3], 3],  // VII-IV-i-IV [GUESS]
             [[2, 6, 3, 0], 2]], // III-VII-IV-i [GUESS]
  },

  /* REGISTERS.
     bass: [tut:futureproof] puts synth bass fundamentals "approximately
       60-200Hz" = MIDI ~35-55. I keep 33..45 to match the value buildBass
       ALREADY HARDCODES at line ~1450 (`intoBand(..., 33, 47)`) -- that
       hardcode is a Law-8 violation that predates this genre (gap #12), and
       declaring a band the code ignores would be worse than matching it.
     keys: the pad/arp band. Wider and higher than lofi's [52,74] --
       [tut:roland] splits the keyboard at C#4 (MIDI 61) with chords ABOVE it,
       and [tut:soundbridge] runs the arp over "3 octaves".
     lead: [tut:modeaudio] "single notes carving out a melody FAR ABOVE the
       driving rhythm". Lofi's themeA is [64,80]; synthwave's lead lives an
       octave-ish higher. 72 = C5, 88 = E6. */
  registers: { bass: [33, 45],      // [tut:futureproof] 60-200 Hz, clamped to the hardcode at buildBass
               keys: [57, 81],      // [tut:roland, tut:soundbridge] pads/arp above the split, ~2 octaves
               counter: [64, 86],   // [EAR] the octave double must sit near the lead, not under the comp
               themeA: [72, 88],    // [tut:modeaudio] "far above the driving rhythm"
               themeB: [74, 91],    // [EAR] hook lifts, same +2..3 st habit as lofi
               themeC: [69, 84] },  // [EAR] the bridge tune sits lower

  /* ── stage 5: performance ─────────────────────────────────────────────── */
  groove: {
    /* THE WHOLE POINT: THIS IS A MACHINE. [tut:modeaudio] "virtually no
       velocity deviation is used". Where lofi's identity is human drift,
       synthwave's identity is its ABSENCE. Only "even" exists here; there is
       no dilla mode and there must not be one. */
    styles: [["even", 10]],   // [tut:modeaudio] machine-tight by definition
    /* Swing base 1.0 = dead straight (swingOffset = 4r/(r+1)-2 = 0 at r=1
       [theory]). The +0.06 range is not decoration: the LinnDrum's shuffle
       function adds "a tiny delay to alternate 16ths", by Roger Linn's design
       [snippet:gearnews/linndrum-software -- search result, page not fetched].
       At r=1.06 the offset is 0.058 sixteenths = ~8 ms at 110 bpm, which is
       the right order for that whisper. Com Truise is the one artist who
       swings harder: [tut:attack-magazine] builds his arp at 55% swing
       (ratio ~1.22) -- that is HIM, not the genre. */
    swing: [1.0, 0.06],       // [snippet:gearnews] LinnDrum shuffle; the 0.06 magnitude is [EAR]
    snareEarly: [0.0, 0.0],   // [tut:modeaudio] no human lean. Values unused in "even" mode but the draws still run [Law 7]
    kickLate:   [0.0, 0.0],   // as above
    hatMul: 1.0,              // [theory] no differential swing when swing itself is ~0
    jitter: { even: 0.0008 }, // [EAR] 0.8 ms. Lofi's even is 5 ms. A drum machine is sample-accurate; a hair prevents phase-identical stacking.
    push: 0.0,                // [EAR] drum machines do not rush. Lofi's -0.008 must not be inherited.
  },
  touch: {
    /* [tut:synthwavepro] "shortened notes during verses" vs "legato style notes
       for drops"; [tut:futureproof] filter env "Attack 0ms, Decay 200-400ms,
       Sustain 30%" = a plucky, short bass. Weighted short. */
    bassArtic: [[0.45, 5], [0.70, 3], [1.00, 2]],   // [tut:synthwavepro, tut:futureproof] shape; the exact ratios [EAR]
    /* A JUNO IS NOT A HAND. All notes of a chord strike on the same sample.
       Lofi's strum is a human affordance and it is WRONG here. The draw still
       runs; it just yields zero. */
    strum: [0.0, 0.0],        // [theory] a polysynth voices a chord simultaneously
  },
  /* [tut:futureproof] "large plate or hall reverb, 1-3 seconds decay, 30-80ms
     pre-delay". Synthwave is a WET genre -- roughly double lofi's 0.16.
     NOTE: MK2's IR is a graph constant at 1.4 s and cannot be lengthened per
     genre (gap #7); 0.30 is what the send can do without the room it wants. */
  space: { wet: 0.30 },       // [tut:futureproof] hall/plate; the 0.30 figure is [EAR]

  /* ═════════════════════════════════════════════════════════════════════════
     FIELDS BELOW ARE NOT READ BY ANY STAGE TODAY. They are the honest answer
     to the brief, and each one names the gap that must close for it to mean
     anything. Do not paste these expecting them to do something.
     ═════════════════════════════════════════════════════════════════════════ */

  /* harmony -- BLOCKED BY GAP #2. makeMaterials calls
     chordTones(root, mode, d, TRUE): every chord in MK2 is a seventh, always,
     with no genre flag. That is a lofi decision hardcoded into stage 3. */
  harmony: {
    sevenths: 0.15,      // [tut:staytuned, tut:orpheus-chords] synthwave is TRIADS. "simple, loopable progressions built on basic triads rather than complex jazz harmonies." 0.15 leaves room for the maj7/min9 PAD that [tut:futureproof] recommends.
    sus: 0.20,           // [tut:orpheus-chords] "Suspended chords are some of the easiest and most effective tools in a synthwave producer's arsenal... the genre thrives on ambiguity"
    add9: 0.15,          // [tut:futureproof] "major 7th or minor 9th chords to add sophistication and colour" -- on pads only
    borrowed: 0.0,       // [GUESS] I found NO source describing borrowed/modal-interchange chords as a synthwave habit. Absence of evidence; marking zero rather than inventing a number.
    cadence: "plagal-or-none",  // [theory] aeolian pop has no leading tone and no V-i; the loop just restarts. Nightcall's verse ends on iv and turns around.
    chordsPerBar: 1,     // [tut:modeaudio] "4 chords per bar across 4 bar patterns" -- i.e. one chord per bar over a 4-bar loop
  },

  /* bassStyle -- BLOCKED BY GAPS #3 and #11. */
  bassStyle: {
    pulse: "eighths",    // [tut:babyaudio, tut:soundbridge, tut:modeaudio] "sequenced basslines repeating root notes on eighth/quarter-note intervals"; the octave arp is synced to an EIGHTH note division
    octaveJump: 0.55,    // [tut:babyaudio] "Arpeggiated Octave Bass", octave range setting "+1". The technique is a genre signature (also New Order "Blue Monday"). The 0.55 weight is [EAR].
    rootBias: 0.85,      // [tut:modeaudio] "simple, constant root notes to really give the song that classic, driving Synthwave feel". Fifths and walks are rare -- the opposite of lofi's [root 5, fifth 3, rest 2].
    restChance: 0.05,    // [EAR] the pulse does not stop
    glide: 0.10,         // [tut:futureproof] portamento is named for the LEAD; on bass it is occasional. [EAR]
  },

  /* keysStyle -- THIS IS THE BIG ONE. BLOCKED BY GAP #1. Without an
     arpeggiator MK2 cannot make synthwave, it can only make 80s-flavoured
     lofi. Every number here is dead until stage 3 learns to read it. */
  keysStyle: {
    mode: "arp",         // [corpus:reverbmachine] Nightcall is BUILT on an arp; [tut:modeaudio, tut:attack, tut:native-instruments, tut:futureproof] all independently
    rate: 1,             // sixteenths (step stride 1). [tut:attack-magazine] arp rate 1/16; [tut:native-instruments] 16th-note driving synth; [tut:futureproof] "16th or 8th notes"
    octaves: 3,          // [tut:soundbridge] "Lead Sound: 3 octaves with 2 repetitions"; [tut:modeaudio-arps] "spreading the notes over a scale of three octaves in total"
    order: [["updown", 5], ["up", 4], ["down", 1]],  // [tut:modeaudio-arps] "I chose the back and forth, or up and down, arpeggio pattern"; up is the default everywhere. Weights [EAR].
    gate: 0.50,          // [tut:attack-magazine] "Arpeggiator gate set to 50"
    padUnder: 0.7,       // [tut:roland, tut:modeaudio] a sustained pad sits under the arp. Probability [EAR].
    skipDownbeats: 0.0,  // [tut:native-instruments] their driving synth "omits notes on downbeats to emphasise percussion" -- a real trick, but I could not corroborate it as a genre habit, so zero. [GUESS] if you turn it up.
  },

  /* leadStyle */
  leadStyle: {
    register: [72, 88],  // [tut:modeaudio] "far above the driving rhythm"; C5-E6
    wave: "saw",         // [tut:modeaudio] "Square and sawtooth waveforms primary"; [corpus:reverbmachine] Nightcall's arp is sawtooth
    unison: 3,           // [corpus:reverbmachine] Nightcall lead: "three-voice unison"
    detuneCents: 8,      // [tut:attack-magazine] Osc1 fine -8 / Osc2 fine +8 on the Com Truise build. Their units, not cents -- treat as [EAR].
    portamento: 0.30,    // [tut:futureproof] "moderate portamento (pitch glide)"; [tut:output] "slightly detuned bright saw lead with moderate portamento". The 0.30 is [EAR].
    vibrato: 0.25,       // [tut:modeaudio] "chewy vibrato"; [tut:futureproof] "subtle vibrato applied post-attack". Depth [EAR].
    delay: "dotted8",    // [tut:babyaudio] "dotted-eighth note delay" on the sequenced plucks -- named as tip #1 of 9
  },

  /* counterStyle -- BLOCKED BY GAP #8 */
  counterStyle: { shape: "octave-double", density: 0.9 },  // [corpus:reverbmachine] unison/octave stacking, NOT a contrary counter-line. Density [EAR].

  /* palette -- BLOCKED BY GAP #9 (needs a new RIG row) */
  palette: {
    kick:    "linnKick",     // [tut:modeaudio] "Roland TR505 or LinnDrum"; [tut:roland] "TR drum machines (707/727/808/909)"
    snare:   "gateSnare",    // *** THE ONE NEW VOICE THIS GENRE NEEDS ***
    ghost:   "gateSnare",    // a ghost is a snare; quiet comes from velocity [carried from lofi's convention]
    hat:     "linnHat",      // [tut:modeaudio] LinnDrum closed hat
    openhat: "linnOpen",     // [tut:modeaudio] "Open hats featured prominently"
    bass:    "pulseBass",    // [tut:futureproof] saw+square, LP cutoff 400-800 Hz, res 20-35%, filter env A 0ms / D 200-400ms / S 30% / R 150ms
    keys:    "junoPad",      // [tut:output] TAL-U-NO-LX chorus circuit; [tut:modeaudio] Juno-106 / Jupiter-8
    lead:    "sawLead",      // [corpus:reverbmachine] 3-voice unison saw, plucked envelope
    counter: "sawLead",
    /* ── V.gateSnare — the voice without which this is not synthwave ──
       (g, ev, t) => [nodes]. Build INSIDE the voice, which is the one place
       MK2's architecture will let this live:
         1. noise burst through BP ~180 Hz body + ~2.5 kHz snap (the LinnDrum
            sample character) [tut:modeaudio]
         2. a LOCAL short convolver, bright, ~0.35 s [corpus:liquidsonics]
            "for recreating this sound, decay is typically set between
            0.3 - 0.6 seconds"; the original is the AMS RMX16 NonLin2 program,
            "early reflections that don't decay... ending with a gated quality"
            [corpus:wikipedia-gated-reverb]
         3. a HARD amplitude gate on that convolver's output: full open on the
            hit, HOLD, then a near-instant close. Wikipedia's live-room recipe:
            "Gate hold time set to approximately half a second, followed by
            fast release"; Sound on Sound: "instant attack... pretty much
            instant release". So: hold 0.30-0.45 s [EAR within the cited band],
            release 0.005 s [corpus:soundonsound "instant"].
         4. pre-delay 0 [tut:musictech] "Set the reverb's pre-delay to zero"
       This voice must NOT use g.send. The shared bus is low-cut at 200 Hz,
       fixed at 1.4 s, and fed only by keys+lead -- three reasons it cannot
       make this sound. Building the room inside the voice is not a hack here;
       it is what "one owner per property" means when the property is a
       drum-specific room. */
  },
  spaceExtra: {
    reverbWet: 0.30,     // duplicate of space.wet above, in the brief's naming
    toneTilt: +2.0,      // dB tilt, BRIGHT. [tut:modeaudio] leads "bright"; [tut:futureproof] kick "punchy, emphasis on forward momentum rather than bass depth". NO HOME IN THE GRAPH -- see gap #13. The +2.0 magnitude is [EAR].
    reverbDecaySec: 2.0, // [tut:futureproof] "large plate or hall, 1-3 seconds". NO HOME -- the IR is a graph constant (gap #7).
    preDelayMs: 45,      // [tut:futureproof] "30-80ms pre-delay". NO HOME.
  },
},

/* ═══════════════════════════════════════════════════════════════════════════
   DARKSYNTH — Carpenter Brut / Perturbator. Same architecture, harder numbers.
   I am giving this a SEPARATE KEY rather than widening synthwave's tempo,
   because a uniform draw over [92,150] would spend most of its mass at ~120
   playing neither style. This is a table decision, not a code decision -- the
   architecture handles it fine.
   Only the fields that DIFFER from synthwave are shown; inherit the rest.
   ═══════════════════════════════════════════════════════════════════════════ */
darksynth: {
  label: "darksynth",
  /* Carpenter Brut, from songbpm: "Anarchy Road" 107, "5 118 574 (Live)" 121,
     "347 Midnight Demons" 127, "Attack Of The Amazons" 131, "Beware The Beast"
     139, "TURBO KILLER" 150 (F minor).
     Perturbator, from songbpm: "Apocalypse Now" 99, "Age of Aquarius" 115,
     "Aurora Haze" 120, "Behemoth" 129, "Angel Dust" 135, "Assault" 135,
     "12th House" 147. (Alphabetical page 1 only -- a partial sample, and the
     same algorithmic-detection caveat applies.) */
  tempo: [120, 150],            // [corpus:songbpm] Carpenter Brut + Perturbator; band edges [EAR]
  modes: [["minor", 9], ["dorian", 1], ["major", 1]],   // [EAR] Turbo Killer is F minor [corpus:tunebat via search]; darksynth is minor by disposition
  pocket: [[[0, 4, 8, 12], 7],  // [EAR] four-on-the-floor dominates the fast end
           [[0, 4, 8, 12, 14], 3],
           [[0, 8], 1]],
  kit: { hatEvery: 1,           // [tut:futureproof] 16ths at speed
         hatVel: 0.58,          // [tut:native-instruments] as above
         ghostChance: 0.05 },   // [EAR] harder machine than synthwave
  form: { energy: { intro: 0.50, outro: 0.40, bridge: 0.50, instrumental: 0.95,
                    chorus: 1.0, chorusPeak: 1.0, verse: 0.80 } },  // [EAR] narrower dynamic range, higher floor
  space: { wet: 0.22 },         // [EAR] darker and drier than dreamwave; the distortion carries the size
  spaceExtra: { toneTilt: -1.0 },  // [EAR] darksynth is bass-forward and grimy where outrun is bright. Still homeless (gap #13).
  /* Everything else: inherit synthwave. */
},
```

## What MK2's architecture cannot express

- #1 THE BIG ONE — NO ARPEGGIATOR ANYWHERE. buildKeys (stage 3) voices a triad and strikes it at pocket steps plus a syncopation draw. It cannot produce a continuous 16th-note single-note arpeggio spanning 2-3 octaves, which is HALF of what makes synthwave identifiable. This is not a parameter I can supply — the note-generating loop does not exist. THE WRONG FIX is `if (G.keysStyle === 'arp')` inside buildKeys; that is the genre special-case Law 4 forbids. THE RIGHT FIX is to make buildKeys a dispatcher over a PATTERN table that lofi also uses: lofi declares keysStyle {mode:'comp', strikes:'pocket+sync'}, synthwave declares {mode:'arp', rate:1, octaves:3, order:'updown', gate:0.5}, and stage 3 reads the table for both. Both are table-driven; neither names a genre. Until this exists MK2 cannot make synthwave, only 80s-flavoured lofi.

- #2 SEVENTHS ARE HARDCODED ON. makeMaterials calls chordTones(root, mode, d, TRUE) with a literal `true` — every chord in every genre is a seventh, forever. Synthwave is triads (staytuned, orpheus-chords: 'simple, loopable progressions built on basic triads rather than complex jazz harmonies') with sus2/sus4 as the colour move and maj7/min9 reserved for pads. A seventh on every chord makes the harmony sound like lofi wearing a neon jacket. Needs harmony.sevenths (probability) and harmony.sus in the table, read by mkChords. This is a lofi decision that got compiled into stage 3.

- #3 ONE `pocket` DRIVES KICK, BASS AND KEYS. buildDrums slices it for kick placements, buildBass iterates it for bass onsets, buildKeys copies it for comp strikes. In synthwave these three are INDEPENDENT: the kick lands on 1 and 3, the bass pulses continuous 8ths underneath it, and the pad/arp ignores both. The comment at line ~1380 justifies the coupling with [corpus:harvest_ensemble bass+comp co-onset 77% in real bands] — that is a measurement of HUMAN BANDS and it does not transfer to sequenced music, where the whole aesthetic is parts that are rhythmically independent because a machine is playing each one. Needs separate bassGrid / keysGrid in the table, or bass and keys reading their own onset tables.

- #4 SECTION_LEN IS A GLOBAL CONST, NOT PER-GENRE. `const SECTION_LEN = { intro:4, verse:8, chorus:8, ... }` sits outside GENRE{}. Synthwave sections are 16 bars — EDMProd's template from The Midnight's 'Souvenir' is 8-bar intro / 16-bar verse / 8-bar pre-chorus / 16-bar chorus / 4-bar post-chorus. And the 8-bar rule ('change something every 8 bars') only MEANS anything inside a 16-bar section. This field belongs in the genre table by the file's own Law 4.

- #5 NO FILTER AUTOMATION / NO RISER — THE BUILD IS INEXPRESSIBLE. The synthwave build into a chorus is a low-pass sweep opening over 8-16 bars plus a reverse-cymbal riser. Nightcall's intro is a FILTERED arpeggio that opens up. Stage 5 owns gain and timing and nothing else; `energy` is a scalar multiplied into the one gain formula. There is no per-section timbre channel and no continuous-parameter automation of any kind. You can make a section quieter; you cannot make it CLOSED. This is the genre's single most-used arrangement device and the architecture has no slot for it. Adding it means stage 5 gaining a second owned property (a per-section timbre scalar passed to voices), which is a real architectural decision, not a table entry.

- #6 FILLS ARE HAT-ONLY, AND THERE IS NO TOM LANE. `kit.flourish` entries are bare step arrays that get pushed into hatSteps. ModeAudio names two synthwave fill devices explicitly — 'snare hits at bar-end function as fills' and 'big, boomy tom sounds toward bar conclusions'. Neither is expressible. (The 16th-snare-roll `fill` material in stage 3 IS a snare roll, but it is a hardcoded literal with no genre table entry and no provenance on its numbers — a Law-8 violation that predates this genre.) Flourish entries need to carry a lane; the kit needs a tom.

- #7 REVERB DECAY IS A GRAPH CONSTANT. buildGraph fixes irSec = 1.4 and the send is low-cut at 200 Hz and fed by keys+lead only. The comment above g.wet already argues that 'one live context plays many songs and genres do not share a room' — and then only makes the LEVEL a song parameter, leaving the DECAY and the FEED hardcoded. Synthwave wants a 2-3 s hall (futureproof) and it wants DRUMS in the send. The good news: V.gateSnare can build its own local convolver inside the voice, so the ONE new voice fits the architecture as-is. The pads' room does not.

- #8 deriveCounter IS BUILT TO PREVENT WHAT SYNTHWAVE WANTS. Its whole design — its own rhythm, contrary motion preferred by scoring — exists to stop the counter being a harmoniser. Synthwave's second voice IS a harmoniser: an octave/unison double of the lead (Reverb Machine: Nightcall's lead is 'three-voice unison'). The genre needs counterStyle:'octave' as a table-selected SHAPE, alongside lofi's 'contrary'. Setting intervals:[-7,7] gets octave-related pitches but the contrary-motion scorer still fights it.

- #9 THE RIG TABLE HAS NO SYNTH ROW, AND THE UI CAN OVERRIDE THE GENRE. RIG has exactly `band` (rhodes/wurly/acoustic kit) and `sega` (YM2612). Neither is synthwave. A third row `neon` is required. Worse: makeChart does `rig: (rigChoice === 'band' || rigChoice === 'sega') ? rigChoice : rigDrawn` — the UI pin bypasses G.rig entirely, so a user can hand a synthwave song a Rhodes. That is fine for a one-genre build and a bug the moment there are two. The pin needs validating against G.rig.

- #10 MODES{} HAS ONLY minor/dorian/major. No phrygian, no harmonic minor. Attack Magazine's Com Truise reference build is in B Phrygian; harmonic minor's raised 7 is a darksynth/horror staple (the Carpenter/Goblin lineage). Adding a mode is a one-line table entry in MODES and costs nothing — but the progressions tables have to gain a matching key for every mode, so it is a table-shape decision.

- #11 buildBass OFFERS root/fifth/rest AND THE WEIGHTS ARE A BARE LITERAL. Line ~1445: `wpick(rng, [['root',5],['fifth',3],['rest',2]])` — a magic table inside stage 3, with no provenance and no genre ownership, which by the file's own Law 8 is a bug already. Synthwave needs a fourth option, `octave` (root + 12), which is THE signature bass move (babyaud.io names 'Arpeggiated Octave Bass' as one of nine essentials; also New Order 'Blue Monday'). These weights must move into the genre table regardless of synthwave.

- #12 TWO HARDCODED REGISTER BANDS IGNORE G.registers. buildBass line ~1450 folds the diatonic fifth into `intoBand(..., 33, 47)` — literal, not G.registers.bass. The `ending` material folds the tonic triad into `intoBand(t, 55, 72)` and the bass into `(…, 33, 45)` — also literals. So declaring registers.keys:[57,81] silently does not apply to the song's final chord. Not synthwave-specific; found while fitting this genre.

- #13 `space` IS ONE NUMBER AND THERE IS NO TILT EQ. The brief asks for space:{reverbWet, toneTilt}. reverbWet maps to space.wet. toneTilt has NO home in the graph at all — there is no shelf or tilt filter anywhere between the buses and the shaper. Synthwave is a BRIGHT genre and darksynth is a dark one; that difference is currently unsayable. Needs a genre-owned shelving filter on g.mix (or per-bus), set once per song the way setSpace() sets the wet.

- #14 NO PRE-CHORUS FUNCTION. The function pool is intro/verse/chorus/bridge/instrumental/outro. Synthwave's build lives in the PRE-CHORUS (Orpheus: 'pre-choruses can build tension before choruses'; EDMProd's template has an 8-bar one). It can be faked with fillInto/emptyLastBar, but the 8-bar filter-sweep build is a section, not a bar. Coupled to gap #5 — a pre-chorus without filter automation is just a quieter verse.

- #15 THE TEMPO DRAW IS UNIFORM OVER A BOX. `G.tempo[0] + Math.round(rng() * (hi - lo))`. Synthwave's real distribution is bimodal (a ~86-100 cruise lobe and a ~117-140 outrun lobe) and a uniform draw over [92,132] spends most of its mass near 112, where comparatively few records sit. I worked around it by splitting synthwave and darksynth into two keys, which is legitimately a TABLE fix — but any genre with a lumpy tempo distribution will hit this. A weighted tempo table ([[range, weight], ...]) would cost one line and generalise.

- #16 `const BARS = 4` IN makeMaterials. Materials are always a 4-bar loop. Synthwave's arp and bass figures are commonly 8 bars, and the 8-bar rule (state for 8, answer on the next 8) needs an 8-bar unit to be audible. Not fatal — 4-bar loops inside 8-bar sections still work — but the genre's own phrase length cannot be declared.

- #17 NO WAY TO SKIP HATS ON THE BACKBEAT. hatSteps is generated purely from `hatEvery`. Native Instruments' walkthrough programs 16th hats and then REMOVES them on beats 2 and 4 so the snare speaks. Needs a `hatSkip: [4,12]` field. Small, but it is exactly the kind of thing that separates a real 80s hat part from a metronome.


## Numbers the researcher flagged as UNCERTAIN

- TEMPO BAND [92,132] — the EDGES are mine, not measured. The track BPMs behind them are real but every one comes from an ALGORITHMIC detector (Tunebat / songbpm / getsongbpm derivatives), which half- and double-times synthwave constantly. Proof inside my own best dataset: Orpheus's 50-song list has Mitch Murder 'Airwolf Theme' at 199 and 'Night Train' at 179 — those are ~99.5 and ~89.5. Nine of the fifty are above 140 and most are probably half that. So the reported mean 124 / median 125 is inflated. Do not quote any single track BPM here as fact.

- MODE WEIGHTS [minor 7, major 3, dorian 1] — pure [EAR]. The only public key survey (Orpheus, 50 songs) says 34 major / 16 minor, which contradicts me — but the author states the method was Tunebat lookup, and algorithmic key detection cannot separate a key from its relative. i-VI-III-VII in minor is the identical pitch set to vi-IV-I-V in the relative major. That dataset measures the detector, not the music. I have NO trustworthy major/minor split for this genre.

- hatVel 0.58 — derived from ONE tutorial (Native Instruments) that programs hats at MIDI velocity 74. That is one producer's walkthrough, not a measured distribution across records. It is the only numeric velocity I found anywhere in the genre literature.

- ghostChance 0.10, ghostSpots [7,14,15] — the DIRECTION is sourced (ModeAudio: 'virtually no velocity deviation is used'), the NUMBERS are [EAR]. Nobody publishes a ghost-note density for drum-machine music because the honest answer is roughly zero.

- swing [1.0, 0.06] — base 1.0 (dead straight) is well-sourced. The 0.06 range is [EAR]. The LinnDrum shuffle claim came from a SEARCH SNIPPET attributed to gearnews.com/linndrum-software; I did not fetch that page. Treat the shuffle rationale as one step weaker than the rest.

- jitter 0.0008 s and push 0.0 — both [EAR]. No source gives a timing-deviation figure for synthwave. I chose 0.8 ms because a drum machine is sample-accurate and lofi's 5 ms would destroy the genre.

- space.wet 0.30 — the reverb TYPE and decay band are sourced (futureproofmusicschool: 'large plate or hall, 1-3 seconds, 30-80ms pre-delay'). The 0.30 send level is [EAR]; nobody publishes a wet/dry ratio.

- toneTilt +2.0 dB (synthwave) / -1.0 dB (darksynth) — [EAR] entirely. The direction (synthwave bright, darksynth dark) is inferable from the sources; the dB figures are invented and I am saying so. They also have nowhere to go in the current graph.

- GATE HOLD 0.30-0.45 s — I could NOT find the actual settings used on 'In the Air Tonight' or any specific record. What I have: Wikipedia's live-room recipe says 'gate hold time set to approximately half a second, followed by fast release'; LiquidSonics/AMS commentary says the NonLin2 recreation is 'typically 0.3-0.6 seconds'. My 0.30-0.45 sits inside both bands but is my pick, not anyone's measurement. Sound on Sound explicitly declines to give numbers ('adjusted to taste').

- ALL bassStyle weights (octaveJump 0.55, rootBias 0.85, restChance 0.05, glide 0.10) — the TECHNIQUES are sourced (octave-arp bass: babyaud.io tip #4, 'octave range +1'; constant root notes: ModeAudio). Every probability is [EAR]. No source quantifies how often a synthwave bass jumps the octave.

- DORIAN PROGRESSIONS — flagged [GUESS] in the table and I want it flagged here too. I found NO synthwave source that names a dorian progression. The nearest real datum is Attack Magazine's Com Truise build, and that is in B PHRYGIAN, a mode MK2 does not have. If dorian gets drawn, those three progressions are structurally valid and stylistically unverified.

- harmony.borrowed = 0.0 — I set it to zero because I found no evidence, not because I found evidence of absence. Modal interchange may well be common; I could not confirm it and refuse to invent a rate.

- keysStyle.skipDownbeats = 0.0 — Native Instruments' walkthrough omits driving-synth notes on downbeats 'to emphasise percussion'. Real trick, single source, could not corroborate as a genre habit. Zeroed rather than guessed.

- form.energy values and form.transitions weights — [EAR] shaped by sourced STRUCTURE (Orpheus: 'Intro > Verse > Chorus > Verse > Chorus > Bridge > Chorus > Outro', three peaks, final chorus highest). The specific numbers are lofi's shape re-tuned by ear. Nobody has published measured Markov transitions for synthwave.

- leadStyle.detuneCents 8 — Attack Magazine's Com Truise patch uses 'Fine Tune -8 / +8' in MiniFreak V's own arbitrary units, which are NOT cents. I carried the number across a unit boundary. Treat as [EAR].

- REGISTERS — bass [33,45] is chosen to MATCH a hardcode already in buildBass, not because it is the right band; futureproofmusicschool's '60-200 Hz' implies MIDI ~35-55. keys, counter, themeA/B/C are [EAR] anchored to one qualitative source ('far above the driving rhythm').


## Sources

- https://en.wikipedia.org/wiki/Synthwave

- https://en.wikipedia.org/wiki/Gated_reverb

- https://en.wikipedia.org/wiki/OutRun_(album)

- https://www.orpheusaudioacademy.com/synthwavebpm/

- https://www.orpheusaudioacademy.com/keysynthwave/

- https://www.orpheusaudioacademy.com/synthwavedrums/

- https://www.orpheusaudioacademy.com/synthwave-song-structure/

- https://www.orpheusaudioacademy.com/synthwave-chords/

- https://reverbmachine.com/blog/how-kavinsky-created-nightcall/

- https://www.soundonsound.com/sound-advice/q-how-do-set-gated-reverb

- https://musictech.com/tutorials/tips/how-to-create-authentic-vintage-drum-gated-reverb-for-synthwave-chillwave-music-styles/

- https://modeaudio.com/magazine/synthwave-5-production-essentials

- https://modeaudio.com/magazine/the-joy-of-arps-creating-a-synthwave-score

- https://blog.native-instruments.com/synthwave/

- https://www.edmprod.com/how-to-make-synthwave/

- https://futureproofmusicschool.com/blog/dive-into-synthwave-create-your-own-sound-today

- https://www.attackmagazine.com/technique/synth-secrets/making-com-truise-style-basslines-with-minifreak-v/

- https://articles.roland.com/synthwave-essentials-for-the-jupiter-xm/

- https://unison.audio/synthwave-chord-progressions/

- https://emastered.com/blog/synthwave-chord-progressions

- https://synthwavepro.com/synthwave-tutorial-10-tips-for-a-better-synth-bass/

- https://babyaud.io/blog/how-to-make-synthwave

- https://www.soundbridge.io/production-techniques-for-creating-synthwave

- https://synthctrl.com/blogs/blog/carpenter-brut-techno-killer-breakdown

- https://songbpm.com/@mitch-murder

- https://songbpm.com/@perturbator

- https://songbpm.com/@carpenter-brut

- https://lunacy.audio/news/synth-bass/

- https://www.tagg.org/xpdfs/bjbgeol.pdf
