import type { GenreSpec } from "./spec.ts";

export const lofi: GenreSpec = {
  label: "lofi hip hop",

  tempo: [72, 88],
  metre: { beats: 4, perBeat: 4 },

  // minor-leaning and modal rather than functional: the genre's harmony is
  // borrowed from jazz ballads and rarely resolves hard
  scales: [
    ["minor", 5],
    ["dorian", 4],
    ["major", 2],
    ["mixolydian", 1],
  ],

  lengthSec: [110, 190],

  // the hip hop shape: a four-bar intro, sixteen-bar verses, eight-bar
  // hooks, a short bridge — which at 80 bpm is the two-and-a-half-minute
  // beat-tape track
  form: {
    lengths: {
      intro: [[4, 3], [8, 1]],
      verse: [[16, 5], [8, 2]],
      chorus: [[8, 5], [16, 1]],
      instrumental: [[8, 3], [16, 2]],
      bridge: [[8, 3], [4, 2]],
      outro: [[8, 3], [4, 2]],
    },
  },

  // the harmony is jazz harmony: sevenths on nearly every chord, the ii–V–I
  // and the turnaround, loops that circle rather than cadence
  harmony: {
    sevenths: 0.9,
    progressions: {
      A: [
        [[0, 5, 3, 4], 3],
        [[0, 5, 1, 4], 3],
        [[0, 3, 6, 2], 2],
        [[0, 5], 1],
      ],
      B: [
        [[1, 4, 0, 0], 3],
        [[3, 2, 5, 5], 2],
        [[5, 6, 0, 0], 1],
        [[3, 0], 1],
      ],
      C: [
        [[2, 5, 1, 4], 2],
        [[3, 4, 2, 5], 1],
        [[1, 4, 0, 0], 1],
      ],
    },
  },

  // the Rhodes in its middle, voiced open: root low, colour tones above with air
  keys: {
    register: [48, 79],
    open: 0.9,
  },

  // the bass is the roots, on the kick's feet
  bass: {
    pocket: "kick",
    tones: [
      ["root", 6],
      ["octave", 2],
      ["fifth", 2],
      ["third", 1],
      ["approach", 1],
    ],
  },

  // the boom bap figure: kick on one and the ands of two and three, snare
  // on two and four, hats on the eighths, ghosts on the sixteenth before a
  // backbeat
  drums: {
    kick: [
      [[0, 1.5, 2.5], 4],
      [[0, 1.5], 3],
      [[0, 1.5, 2], 2],
      [[0, 2.5, 3.5], 1],
    ],
    snare: [
      [[1, 3], 5],
      [[1, 2.75, 3], 2],
      [[0.75, 1, 3], 1],
      [[1, 3, 3.75], 1],
    ],
    hat: [
      [0.5, 6],
      [0.25, 1],
      [1, 1],
    ],
  },

  // a drum machine swinging its sixteenths, and hands that miss the grid
  feel: { swing: 60, swingGrid: 16, jitterMs: 15, accent: 0.34, velocityJitter: 0.07 },

  // a Rhodes, a sub, a muted guitar; and the record on tape, under a
  // low-pass, with the dust on it
  // a warm pad under everything, arriving last and leaving first
  drone: {
    register: [51, 65],
    tone: [["tonic", 6], ["fifth", 1]],
    hold: [[4, 5], [2, 1]],
  },

  arrangement: { enter: ["keys", "drums", "bass", "lead", "drone"] },

  sound: {
    voices: { keys: "rhodes", bass: "sub", lead: "pluck", drone: "pad" },
    rack: {
      echo: { beats: 1.5, feedback: 0.3, ret: 1 },
      room: { sec: 1.4, ret: 1 },
      tape: { lowpassHz: 10000, wowHz: 0.2, wowCents: 4, drive: 1.4 },
      vinyl: { crackle: 0.08 },
    },
    // the Rhodes gets the echo and a little room; the pluck a touch of both;
    // the drums stay dry and centred, the way a sampled break is
    mix: {
      keys: { sends: { echo: 0.14, room: 0.2 }, az: -35, dist: 0.4 },
      lead: { sends: { echo: 0.1, room: 0.15 }, az: 30, dist: 0.35, pedals: 0.35 },
      drone: { sends: { room: 0.3 }, az: 180, dist: 0.75 },
    },
    world: { width: 0.6, depth: 0.5 },
    // the pluck through a warm overdrive and a slow tremolo: a muted guitar, close-miked
    pedals: { overdrive: { drive: 2.5, tone: 0.4, mix: 0.6 }, tremolo: { rateHz: 3.8, depth: 0.35, mix: 1 } },
  },

  sources: {
    tempo:
      "70–90 bpm with the sweet spot at 75–85 (blog.native-instruments.com/lo-fi-hip-hop-beats); " +
      "70–80 (blog.flat.io/lofi-chord-progressions); 72–88 keeps both ends inside the genre [chosen inside the range]",
    scales: "minor-leaning jazz harmony is documented (blog.flat.io/lofi-chord-progressions); the weights are [chosen]",
    lengthSec:
      "lo-fi tracks run 1–3 minutes, 2:30 on average (chosic.com/song-length-by-genre); a beat of 2.5 minutes " +
      "is the beat-tape norm (beatproduction.net/beat-tape). 110–190 s is centred on 2:30 [chosen inside the range]",
    metre: "[chosen] — nothing sourced says this genre is ever not in four",
    "harmony.sevenths":
      "every progression the guides give carries sevenths: Cmaj7 Am7 Fmaj7 G7, Dm7 G7 Cmaj7 " +
      "(blog.flat.io/lofi-chord-progressions; blog.native-instruments.com/lo-fi-chord-progressions)",
    "harmony.progressions":
      "I–vi–IV–V, ii–V–I, I–vi–ii–V (blog.flat.io/lofi-chord-progressions); I–vi, iv–i, IV–iii–vi, i–VI–V " +
      "(blog.native-instruments.com/lo-fi-chord-progressions); as scale degrees so the drawn scale sets the qualities; weights [chosen]",
    "drone.tone":
      "a drone is \"a very long and continuous tone\" placed \"upon the tonic or dominant\" " +
      "(chromatone.center/theory/melody/drone); weights [chosen]",
    "drone.register":
      "[chosen] — above the sub and inside the Rhodes, where a warm pad sits without taking the bass's notes",
    "drone.hold": "\"may last through the whole piece\" (chromatone.center/theory/melody/drone); a four-bar statement [chosen]",
    "keys.register":
      "\"keep it in its mid-range and avoid the top octave\" (blog.native-instruments.com/lo-fi-hip-hop-beats); " +
      "C3–G5 on a Rhodes [chosen]",
    "keys.open":
      "\"lo-fi favors spread voicings where the notes span two octaves or more\", root low and the 3rd, 7th and " +
      "extensions above with space (orphiq.com/resources/lofi-chord-progressions); 0.9 [chosen]",
    "bass.pocket":
      "\"copy over your kick pattern and realign the notes to the chord progression\" " +
      "(blog.native-instruments.com/lo-fi-hip-hop-beats)",
    "bass.tones":
      "\"use the root notes of each chord\", with variation only outlining the chord's other tones " +
      "(blog.native-instruments.com/lo-fi-hip-hop-beats; create.routenote.com hip-hop basslines); weights [chosen]",
    "drums.kick":
      "\"kicks on the first, fourth and sixth 8th notes\" (blog.native-instruments.com/what-is-boom-bap); " +
      "beat 1, the and of 2, beat 3 sometimes, the and of 4 (create.routenote.com boom bap drums); weights [chosen]",
    "drums.snare":
      "\"snares on the second and fourth beat\" (blog.native-instruments.com/what-is-boom-bap); ghost snares at 50–60% " +
      "on the sixteenth before 2 and 4 (create.routenote.com boom bap drums); weights [chosen]",
    "drums.hat": "\"closed hi-hats on 8th notes\" (blog.native-instruments.com/what-is-boom-bap); weights [chosen]",
    "feel.swing":
      "MPC swing is a share of each pair in percent, 50 straight and 66.7 a triplet, applied to sixteenths; " +
      "hip hop sits at 54–62 and 62 is 'almost a triplet' (melodiefabriek.com/blog/mpc-swing-reason; " +
      "mpc-forums.com/viewtopic.php?f=5&t=187969). 60 is inside that band [chosen inside the range]",
    "feel.swingGrid": "MPC swing delays the even sixteenths (melodiefabriek.com/blog/mpc-swing-reason)",
    "feel.accent":
      "an ordinary passage sits 65–95 of 127 with accents at 100 and over " +
      "(mastering.com program-realistic-midi-drums): about a third of a spread [chosen inside the range]",
    "feel.velocityJitter":
      "\"vary by up to 4% up or down\" is realistic, \"10-15% is plenty\" " +
      "(mastering.com program-realistic-midi-drums; mixelite.com humanizing-midi-drums); 7% [chosen inside the range]",
    "feel.jitterMs":
      "drummers' timing standard deviation is 11–19 ms; a funk pattern at 100 bpm measured 15.7 ms " +
      "(Senn et al. 2017, doi:10.3389/fpsyg.2017.01709). Uniform ±15 ms is 8.7 ms: under the human figure, " +
      "because the swing already carries half the looseness [chosen under the measurement]",
    "sound.voices":
      "Rhodes is the standard melodic instrument, a muted fingerstyle guitar sits under the chords, a warm sub " +
      "carries the bass (blog.native-instruments.com/lo-fi-hip-hop-beats; masteringthemix.com how-to-make-lo-fi-hip-hop)",
    "sound.mix":
      "sends: a dotted-eighth delay and a small room on the keys and lead at 10–20% (audeobox.com how-to-make-lofi-beats-in-fl-studio); " +
      "placement and the pedal feed [chosen]",
    "sound.world": "[chosen] — a modest width for a genre mixed narrow and warm",
    "sound.pedals": "\"muted guitar played fingerstyle\" sits under the chords (masteringthemix.com how-to-make-lo-fi-hip-hop); a warm drive and tremolo on it [chosen]",
    "sound.rack.echo":
      "a dotted-eighth or quarter delay at 10–20% is the lo-fi guides' standard send (audeobox.com how-to-make-lofi-beats-in-fl-studio); 1.5 beats, 12% [chosen inside]",
    "sound.rack.room": "\"reverb, delay, chorus... used generously\" (blog.native-instruments.com/lo-fi-hip-hop-beats); a small room at 18% [chosen]",
    "sound.rack.tape.lowpassHz":
      "\"a gentle low-pass at around 8–12 kHz on your mix bus\" (antarestech.com the-complete-guide-to-mixing-lo-fi-music)",
    "sound.rack.vinyl.crackle":
      "\"mix vinyl crackle at −20 to −24 dB from the master, high-passed at 500 Hz\" " +
      "(audeobox.com how-to-make-lofi-beats-in-fl-studio); 0.08 is −22 dB",
    "sound.rack.tape.wowHz": "\"rate 0.1–0.3 Hz\" for tape wobble (audeobox.com how-to-make-lofi-beats-in-fl-studio)",
    "sound.rack.tape.wowCents": "[chosen] — the guides give depth as a plugin's knob, not in cents",
    "sound.rack.tape.drive": "\"saturation mix 15–25%\" (audeobox.com how-to-make-lofi-beats-in-fl-studio); 1.4 [chosen]",
    "form.lengths":
      "intro 4 bars, verse 16, chorus 8, bridge 4–8 (emastered.com/blog/rap-song-structure; " +
      "rapauthority.com/rap-song-structure); a beat-tape track is an intro, a 16-bar verse, a chorus, a break " +
      "and a chorus (beatproduction.net/beat-tape); weights [chosen]",
    "lead.register":
      "\"keep it in its mid-range, avoid the top octave\" (masteringthemix.com how-to-make-lo-fi-hip-hop); " +
      "E4–C6 [chosen]",
  },
};
