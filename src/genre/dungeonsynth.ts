import type { GenreSpec } from "./spec.ts";

export const dungeonsynth: GenreSpec = {
  label: "dungeon synth",

  tempo: [60, 80],
  metre: { beats: 4, perBeat: 4 },

  // the church modes: in the altered minors the sixth and seventh degrees
  // are diminished, and a loop of diminished triads is not this music
  scales: [
    ["minor", 4],
    ["dorian", 3],
    ["phrygian", 1],
  ],

  lengthSec: [240, 420],

  // loops, repeated at length: the sections are long and few
  form: {
    /**
     * THE CEILING IS THIS GENRE'S OWN, and until now it was a pop single's.
     * The default 12 s comes from 303 top-10 singles (Léveillé Gauvin 2018).
     * At 60-80 bpm a bar here is 3.00-4.00 s, so NOTHING this genre offers
     * fits under 12 s: measured over 357 records, 100% of them broke the
     * stated ceiling and the `[[16, 2]]` below was drawn exactly never.
     * A ceiling that every record violates is not a ceiling, and a declared
     * length that can never be drawn is a knob that does nothing.
     *
     * 64 s is what this genre's own source names — 8 to 16 bars — at the
     * slowest tempo it plays. Proposed in DUNGEON-SYNTH-ARRANGEMENT.md §8 and
     * applied now that the ceiling is a constraint the genre must satisfy
     * rather than a preference the form stage quietly gave up on.
     */
    introSec: 64,
    lengths: {
      intro: [[8, 2], [16, 2]],
      verse: [[16, 4], [32, 2]],
      chorus: [[16, 3], [32, 1]],
      instrumental: [[16, 3], [32, 1]],
      bridge: [[16, 2], [8, 2]],
      outro: [[16, 2], [8, 2]],
    },
    introChance: 0.9,
  },

  // triads, close to home, little chromaticism
  harmony: {
    // no jazz in it at all, and a third of the chords are bare fifths
    sevenths: 0,
    fifths: 0.34,
    diminished: "avoid",
    progressions: {
      A: [
        [[0, 2, 0, 3], 3],
        [[0, 5, 0, 6], 2],
        [[0, 0, 5, 6], 1],
        [[0, 3], 1],
      ],
      B: [
        [[1, 4, 1, 4], 2],
        [[5, 6, 0, 0], 2],
        [[3, 3, 0, 0], 1],
      ],
      C: [
        [[2, 6, 0, 4], 1],
        [[5, 3, 0, 0], 1],
      ],
    },
  },

  // a pedal under the chords: the root, and the fifth
  bass: {
    register: [31, 45],
    pocket: [[[0], 3], [[0, 2], 1]],
    tones: [
      ["root", 6],
      ["fifth", 2],
      ["octave", 1],
    ],
  },

  keys: {
    register: [48, 74],
    strike: [[[0], 4], [[0, 2], 1]],
    open: 0.6,
    /** a pad swells rather than strikes: it holds, and it slurs from chord to chord */
    art: [["tenuto", 6], ["slur", 3], ["plain", 2]],
  },

  // a flute above, slow, stepwise, inside an octave
  lead: {
    register: [67, 86],
    rhythms: [
      [[0, 2, 4, 6], 3],
      [[0, 1, 2, 4, 5, 6], 2],
      [[0, 3, 4, 6, 7], 1],
      [[0, 2, 3, 4, 6], 1],
      [[0, 1.5, 2, 4, 6], 1],
    ],
    leap: 0.2,
    span: 10,
    cycles: [
      [["A", "A", "B", "A"], 2],
      [["A", ".", "A", "B"], 1],
      [["A", "A", ".", "A"], 1],
    ],
    /** breath and fingers: a wind line is slurred far more often than it is tongued */
    art: [["slur", 6], ["plain", 4], ["tenuto", 3], ["slide", 2], ["ghost", 1], ["bend", 1]],
    /** a flute sings; it does not pick a chord apart, and a chant is the genre's other voice */
    contour: [["sung", 7], ["chant", 2], ["riff", 1]],
  },

  // a timpani on the beat, no hat, a drum on three now and then
  drums: {
    kick: [[[0], 3], [[0, 2], 2], [[0, 2, 3.5], 1]],
    snare: [[[2], 2], [[3], 1]],
    hat: [[0, 1]],
    phrase: [
      [["A", "A", "A", "B"], 3],
      [["A", "B", "A", "B"], 1],
      [["A", "A", "B", "D"], 1],
    ],
    /** a struck drum in a stone room: mostly plain, the odd one leant on */
    art: [["plain", 9], ["accent", 2], ["ghost", 1]],
  },

  // the sustained tone the genre is built on: it holds a whole statement
  drone: {
    register: [46, 60],
    tone: [["tonic", 5], ["fifth", 3]],
    hold: [[4, 6], [2, 1]],
  },

  arrangement: {
    enter: ["drone", "keys", "bass", "drums", "lead"],
    /**
     * AND THE DRONE IS THE LAST THING THIS GENRE GIVES UP, which is the
     * reverse of the default and has to be said here or it is inherited
     * wrong. The default sheds drone first — sensible where a pad is
     * decoration — and this genre ENTERS on the drone and is founded on it.
     * Inheriting that order meant the first sound of the record was also the
     * first thing thrown away: across sixty seeds the drone was dropped at a
     * span boundary 37 times, and a drone that stops is not a quieter
     * arrangement, it is the floor going out.
     *
     * So the drums go first — this music "notably avoids" a busy kit and
     * carries the fewest of any part here — then the tune, then the bass,
     * then the pad. What a quiet section keeps is bass, pad and drone, which
     * is what this music sounds like when it is being quiet.
     */
    shed: ["drums", "lead", "bass", "keys", "drone"],
    introParts: 1,
    fullAbove: 0.85,
    thinBelow: 0.3,
    /**
     * NOT ALWAYS THE DRONE, AND WHERE IT IS NOT, IT IS A MARCH.
     *
     * The drone is first in this genre's entry order, so every kind that
     * opens from the front of that order opens on it — a bed is the drone, a
     * hook is the drone and the tune. Across sixty seeds that made the drone
     * the first sound of the record 100% of the time, and the drone ALONE 77%
     * of it, which is a habit and not a way in.
     *
     * A rhythm intro is the one kind that does not read the front of the
     * order. The note that stood here refused it: this music is "primarily
     * beatless" with "very subtle percussion" (note.com/soundwitches), so a
     * record that opens on its drums was said to be announcing the thing it
     * has least of. That is the wrong reading of its own source. Rare is not
     * forbidden, and what the drums are rare AT here is keeping time under a
     * tune. Out in front, alone, with nothing else to attend to — "solo
     * drums, solo bass, or drums and bass in duet at the start of a record
     * will attract especially great attention to rhythm because there is
     * little or no melody or harmony to attend to" (Burns 1987) — they are
     * not a beat this music lacks. They are a march, and a march is the
     * oldest thing in the castle: the record that opens on them is a war
     * song, and everything arriving over it is the field it marches onto.
     * A genre is a set of constraints, not a list of permissions, and the
     * constraint here is that this happens a quarter of the time.
     *
     * WITH `introParts` AT 1 THIS IS THE DRUMS ALONE. `opensWith` adds the
     * bass to a rhythm intro only where a genre opens on two parts or more,
     * and this one opens on one — so Burns's "solo drums" is the case this
     * genre actually gets, not the duet. Measured off its own MIDI, that is
     * a drum march of seven bars, twenty-three seconds, before a second part
     * is heard (`node tools/measure.ts dungeonsynth 7 --map`).
     *
     * A quarter, not more: the drone founding the record is still what this
     * music mostly does. [chosen — the kinds are the sources', the weights
     * are not published anywhere]
     */
    intro: [
      ["bed", 5],
      ["rhythm", 2],
      ["hook", 1],
    ],
    /**
     * HOW THIS MUSIC DEVELOPS WITHOUT LOSING ANYBODY.
     *
     * The genre's own guide gives the development section exactly one
     * instruction, and it is not about notes: "deepen the shadows of the sound
     * through changes in reverb and filters" (note.com/soundwitches). So the
     * two moves it names outright — the filter down and the room opened — are
     * the heaviest here, and they are the reason this pool exists at all: this
     * is a genre whose literature describes development as a DESK move, played
     * by a program that until now set its desk once and never touched it.
     *
     * WEAR is the genre's too, and by name: "intentional crackle, warble, and
     * hiss" (ibid.) is already in this genre's tape and vinyl settings, and a
     * section where the medium itself gets worse is that idea given somewhere
     * to go.
     *
     * FAR is "echoing through stone corridors" (ibid.) — the band a step
     * deeper into the building.
     *
     * And BRIGHTEN is kept, lightly. A record that can only ever get darker is
     * not developing, it is decaying, and the shadows only deepen against
     * something: it is the return from a dark section that makes the dark one
     * a section rather than the new floor. Light enough that this stays a
     * genre about darkness — which is why it is a third of `darken` and not
     * its equal.
     *
     * The rest sit under those. Weights [chosen] — the sources name the moves
     * and rank nothing.
     */
    treat: [
      ["darken", 6],
      ["drench", 5],
      ["wear", 4],
      ["far", 3],
      ["dry", 3],
      ["brighten", 2],
      ["ease", 2],
      ["push", 2],
      ["widen", 2],
      ["close", 1],
      ["echoed", 1],
      ["sweep", 1],
    ],
  },

  // an organ's pipes do not know how hard a key was pressed, and a pad
  // swells rather than strikes: this music leans on the metre very little
  feel: {
    swing: 50, swingGrid: 8, jitterMs: 12, accent: 0.12, velocityJitter: 0.05,
    // barely anything: this is not groove music, and a pipe organ does not
    // lay back. The flute breathes a little late and the drum is square.
    lean: { lead: 9, keys: 4 },
  },

  // strings, a pedal organ, a flute; the record in a small church, on tape
  sound: {
    voices: { keys: "pad", bass: "organ", lead: "flute", drone: "organ" },
    /**
     * THE CHURCH, THROUGH A SLUDGE RIG. The writing is dungeon synth and
     * stays so; what is put on it is the signal chain doom and sludge use.
     *
     * Sludge is "saturated, sustaining distortion (fuzz/overdrive stacks),
     * ample feedback, and loud, sustaining amps", and its bands "use fuzz to
     * create a wall of sound"; the amp wants "a lot of bass and mids, with
     * the treble dialed back", measured across the style at a median gain of
     * 7 with bass 6, mid 6 and treble 6.5 of ten; and the production "chases
     * vintage warmth: tube amps, saturated fuzz, roomy drums, and organic
     * reverb to let slow riffs breathe and brood".
     * [riffhard.com how-to-play-sludge-metal and how-to-get-a-fuzz-sound-on-
     * the-guitar; boostguitarpedals.co.uk how-to-get-a-crushing-doom-metal-
     * tone; tonemirror.so genres/sludge-metal]
     */
    pedals: {
      // THE BOARD IN CABLE ORDER. Every pedal below is one MK2's board was
      // built out of for exactly this music, and the first pass here reached
      // past all of them for the two generic units that happened to be older.
      //
      // A Dyna Comp first, lightly. Doom is "loud, sustaining amps", and the
      // Dyna Comp's own detector "amplifies weak signals" — which is sustain,
      // and is what a riff this slow needs between strikes.
      comp: { sustain: 0.55, level: 0.8, mix: 0.35 },
      // THE OCTAVE DOWN, which is the one thing the doom-tone sources name as
      // a pedal rather than a setting: "pedals pitched one or two octaves
      // down for maximum heaviness" (boostguitarpedals.co.uk). Kept at one
      // octave and gated high, because a divider "tracks single notes and not
      // chords" — so it is the bass and the drone that get it, and the pad
      // must not clock it.
      sub: { two: 0.15, gate: 0.03, tone: 700, mix: 0.3 },
      // A BIG MUFF, not the generic fuzz. It is the doom fuzz, and it is the
      // one with the two knobs a sludge Muff adds: MIDS to fill the Ram's
      // Head notch back in — the scoop is ~13 dB at 1 kHz and a scooped
      // guitar disappears under a pad — and MASS for the low end a bass fuzz
      // is built around. Cab corner low, because "the treble dialed back" is
      // the number the style is most consistent about.
      muff: { sustain: 0.62, tone: 0.3, level: 0.85, cabHz: 3200, mids: 0.55, mass: 0.45, mix: 0.5 },
      // and an overdrive IN FRONT of it, which is the stack the sources
      // describe — "fuzz/overdrive stacks" — not a second fuzz beside it.
      overdrive: { drive: 4, tone: 0.3, mix: 0.4 },
      // THE POWER SUPPLY GIVING WAY. Sag is not a knob on the signal: "under
      // heavy demand the rail momentarily drops, creating a subtle
      // compression players describe as feel or touch response" (aikenamps).
      // A slow recovery is a tired valve rectifier, which is the amp this
      // whole chain is pretending to be.
      // MAKEUP SWEPT, not guessed. A cab corner at 3200 Hz throws away a lot,
      // and at the units' resting levels the whole board came out 3 dB QUIETER
      // than bypass — a sludge rig that loses volume is not one. Swept over
      // dungeonsynth 42: makeup 0.5/0.5 gave -3.5 dBFS and a low/high tilt of
      // 1.25, 0.65/0.7 gave -3.2 and 1.36, 0.8/0.85 gave -2.9 and 1.45. Louder
      // AND heavier together, so the top of the sweep, with headroom left.
      sag: { depth: 0.45, idle: 1, recovSec: 0.28, draw: 0.35, mix: 0.5 },
    },
    rack: {
      // TREBLE DIALED BACK. The one number the style is most consistent about,
      // and the reason a wall of fuzz reads as weight rather than as noise.
      pole: { hz: 3600, resonance: 0.18, mix: 0.6 },
      ensemble: { rateHz: 0.4, depth: 0.5, ret: 1 },
      // organic reverb, longer, to let a slow riff breathe and brood
      spring: { sec: 2.4, ret: 0.5 },
      room: { sec: 4.2, ret: 1.45 },
      // the tubes working hard
      tape: { lowpassHz: 6500, wowHz: 0.3, wowCents: 6, drive: 2.4 },
      vinyl: { crackle: 0.05 },
    },
    // everything in the church: the pad through the ensemble, the flute far
    // and to one side, the drone behind and wide, the drum deep in the room.
    // The board is walked hardest by the parts a sludge rig actually carries
    // — the low end and the chords — and least by the flute, which is the one
    // voice in the room that is not coming out of an amp.
    mix: {
      drums: { sends: { room: 0.45 }, az: 0, dist: 0.6, pedals: 0.25 },
      bass: { sends: { room: 0.3 }, az: -15, dist: 0.5, pedals: 0.85 },
      keys: { sends: { ensemble: 0.6, room: 0.4 }, az: -50, dist: 0.5, sweepHz: 0.03, sweepDepth: 0.15, pedals: 0.7 },
      lead: { sends: { room: 0.5, spring: 0.3 }, az: 60, dist: 0.55, pedals: 0.15 },
      drone: { sends: { room: 0.5, spring: 0.35 }, az: 180, dist: 0.8, pedals: 0.55 },
    },
    world: { width: 0.9, depth: 0.8 },
  },

  sources: {
    tempo:
      "\"primarily beatless\"; \"around 60–80 as a guideline for working in a DAW\" (note.com/soundwitches dungeon synth guide); " +
      "a released track at 115 (erichgrunewald.com making-dungeon-synth-without-perfectionism) shows the range is wide",
    scales:
      "\"church modes (such as Dorian or Aeolian)\", \"a handful of common modes, little chromaticism\" (note.com/soundwitches); " +
      "a practitioner also names melodic minor (erichgrunewald.com), left out because its VI and VII are diminished; weights [chosen]",
    lengthSec: "[chosen] — long, loop-based tracks; no measured average found",
    metre: "[chosen] — 4/4; the sourced track is in 6/4, which the program does not yet hold",
    "form.lengths": "\"simple, loop-based compositions\" (note.com/soundwitches), \"repeated extensively\" (erichgrunewald.com); the lengths [chosen]",
    "harmony.sevenths":
      "the genre \"notably avoids complex jazz-influenced harmony, instead favoring simple, modal-based " +
      "progressions\", and its cadences \"use simple stepwise resolutions rather than dense extended chords\" " +
      "(en.wikipedia.org/wiki/Dungeon_synth; dungeonsynth.proboards.com, \"Chords for Dungeon Synth\"); " +
      "\"fairly standard chord progressions, little chromaticism\" (note.com/soundwitches). None, therefore",
    "harmony.fifths":
      "dungeon synth \"favors modal scales (Dorian, Aeolian, Phrygian, Mixolydian), open fifths, and cadences " +
      "reminiscent of early music\", and employs \"parallel fifths and open fifth/octave intervals for medieval " +
      "color\"; an open fifth \"is just the root and the fifth and leaves room for choir and melody to add color\" " +
      "(en.wikipedia.org/wiki/Dungeon_synth; dungeonsynth.proboards.com). A third of the chords [chosen]",
    "harmony.diminished": "\"fairly standard chord progressions\" in \"a handful of common modes\" (note.com/soundwitches): the mode's diminished triad is not one",
    "harmony.progressions":
      "i–III–i–IV and ii–V loops from a released track (erichgrunewald.com), as scale degrees; the rest [chosen]",
    "drums.kick": "\"a timpani beats a drum pattern\" throughout (erichgrunewald.com); \"very subtle percussion\" (note.com/soundwitches)",
    "drums.hat": "beatless: no hat (note.com/soundwitches)",
    "arrangement.treat":
      "the genre's development section is \"deepen the shadows of the sound through changes in reverb and filters\", " +
      "with \"intentional crackle, warble, and hiss\" and a record \"echoing through stone corridors\" " +
      "(note.com/soundwitches): the filter, the room, the wear and the distance are this genre's own moves and are " +
      "weighted first. Brighten is kept light because shadows only deepen against something. Weights [chosen] — " +
      "the sources name the moves and rank nothing",
    "form.introSec":
      "\"the intro is usually 8-16 bars\" for this genre (note.com/soundwitches, as read in " +
      "DUNGEON-SYNTH-ARRANGEMENT.md §8); 16 bars at this genre's slowest tempo of 60 bpm is 64 s, so 64 is the " +
      "smallest ceiling that admits what the source names. The inherited default of 12 s is Léveillé Gauvin's " +
      "figure for 303 top-10 pop singles and nothing this genre offers fits under it",
    "arrangement.intro":
      "\"primarily beatless\", \"very subtle percussion\" (note.com/soundwitches): the drum-led opening Burns " +
      "documents (\"solo drums... will attract especially great attention to rhythm\") is the one way in this " +
      "genre cannot use, so the pool is the drone alone or the flute over it. Weights [chosen]",
    "feel.accent":
      "the voices are an organ and a pad, and a pipe organ has no touch at all: its pipes sound the same however " +
      "the key is pressed (soundonsound.com Synthesizing Tonewheel Organs). 0.12 [chosen]",
    "drone.tone":
      "the genre is \"derived from black metal and dark ambient\" (Wikipedia, Dungeon synth) and a drone sits " +
      "\"upon the tonic or dominant\", held while the chords change over it (chromatone.center/theory/melody/drone)",
    "drone.hold": "\"a very long and continuous tone that may last through the whole piece\" (chromatone.center/theory/melody/drone)",
    "drone.register": "[chosen] — below the pad and around the organ's own low register",
    "keys.art":
      "tenuto is 95% of the written value and legato 100% with \"no intervening silence\" " +
      "(cmuse.org/staccato-length-calculator; en.wikipedia.org/wiki/Legato); a pad is bowed, not struck. Weights [chosen]",
    "lead.contour":
      "a flute is a singing instrument and a wind line is conjunct \u2014 \"the melodic phrase moves in a stepwise " +
      "fashion\" (en.wikipedia.org/wiki/Melodic_motion). Chant belongs to the genre by name: the plainsong a stone " +
      "room implies (en.wikipedia.org/wiki/Reciting_tone). Weights [chosen]",
    "lead.art":
      "\"wind instruments, including the human voice, and guitars are examples of instruments generally capable of " +
      "ghosting notes\" (en.wikipedia.org/wiki/Ghost_note), done by \"greatly reducing the airflow into the " +
      "instrument while fingering the ghosted note\" (jazzedmagazine.com, \"Learning to Play Ghosted Notes\"); " +
      "a slurred wind line is the unmarked case. Weights [chosen]",
    "drums.art":
      "accents sit at 100 and over of 127 against an ordinary 65\u201395 (mastering.com program-realistic-midi-drums); " +
      "weights [chosen] \u2014 this music leans on the metre very little",
    "sound.voices": "\"strings, flutes, pipe organs, and choirs\" (note.com/soundwitches; Wikipedia, Dungeon synth)",
    "sound.mix": "\"deep reverb\", \"echoing through stone corridors\" (note.com/soundwitches): every part in the room, the far ones further; placement [chosen]",
    "sound.world": "the genre is a place as much as a sound — a wide, deep world [chosen]",
    "sound.rack.ensemble": "\"lo-fi pad sounds... with deep reverb applied\", and the strings and choirs the genre emulates are ensembles by nature (note.com/soundwitches); 25% [chosen]",
    "sound.rack.room": "\"deep reverb\", \"echoing through stone corridors\" (note.com/soundwitches); a \"Small Church\" impulse (erichgrunewald.com)",
    "sound.rack.vinyl.crackle": "\"intentional crackle, warble, and hiss\" (note.com/soundwitches); 0.05 [chosen]",
    "sound.rack.tape.wowCents": "\"warble\" (note.com/soundwitches); 6 [chosen]",
  },
};
