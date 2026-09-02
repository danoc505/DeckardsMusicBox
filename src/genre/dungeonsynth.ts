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
    sevenths: 0.15,
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
  feel: { swing: 50, swingGrid: 8, jitterMs: 12, accent: 0.12, velocityJitter: 0.05 },

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
    "harmony.sevenths": "\"fairly standard chord progressions, little chromaticism\" (note.com/soundwitches); 0.15 [chosen]",
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
    "sound.voices": "\"strings, flutes, pipe organs, and choirs\" (note.com/soundwitches; Wikipedia, Dungeon synth)",
    "sound.mix": "\"deep reverb\", \"echoing through stone corridors\" (note.com/soundwitches): every part in the room, the far ones further; placement [chosen]",
    "sound.world": "the genre is a place as much as a sound — a wide, deep world [chosen]",
    "sound.rack.ensemble": "\"lo-fi pad sounds... with deep reverb applied\", and the strings and choirs the genre emulates are ensembles by nature (note.com/soundwitches); 25% [chosen]",
    "sound.rack.room": "\"deep reverb\", \"echoing through stone corridors\" (note.com/soundwitches); a \"Small Church\" impulse (erichgrunewald.com)",
    "sound.rack.vinyl.crackle": "\"intentional crackle, warble, and hiss\" (note.com/soundwitches); 0.05 [chosen]",
    "sound.rack.tape.wowCents": "\"warble\" (note.com/soundwitches); 6 [chosen]",
  },
};
