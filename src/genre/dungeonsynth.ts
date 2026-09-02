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
    introParts: 1,
    fullAbove: 0.85,
    thinBelow: 0.3,
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
    rack: {
      ensemble: { rateHz: 0.4, depth: 0.5, ret: 1 },
      room: { sec: 2.6, ret: 1.2 },
      tape: { lowpassHz: 9000, wowHz: 0.3, wowCents: 6, drive: 1.2 },
      vinyl: { crackle: 0.05 },
    },
    // everything in the church: the pad through the ensemble, the flute far
    // and to one side, the drone behind and wide, the drum deep in the room
    mix: {
      drums: { sends: { room: 0.45 }, az: 0, dist: 0.6 },
      bass: { sends: { room: 0.3 }, az: -15, dist: 0.5 },
      keys: { sends: { ensemble: 0.6, room: 0.4 }, az: -50, dist: 0.5, sweepHz: 0.03, sweepDepth: 0.15 },
      lead: { sends: { room: 0.5 }, az: 60, dist: 0.55 },
      drone: { sends: { room: 0.5 }, az: 180, dist: 0.8 },
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
