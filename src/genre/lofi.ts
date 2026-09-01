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

  // eight-bar blocks: a two-minute beat-tape track has room for a form only
  // if its sections are short, and the loop is the unit this music thinks in
  form: {
    lengths: {
      verse: [[8, 5], [16, 2], [12, 1]],
      chorus: [[8, 5], [16, 2]],
      instrumental: [[8, 4], [16, 1]],
      bridge: [[8, 3], [4, 2]],
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
  feel: { swing: 60, swingGrid: 16, jitterMs: 15 },

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
    "feel.jitterMs":
      "drummers' timing standard deviation is 11–19 ms; a funk pattern at 100 bpm measured 15.7 ms " +
      "(Senn et al. 2017, doi:10.3389/fpsyg.2017.01709). Uniform ±15 ms is 8.7 ms: under the human figure, " +
      "because the swing already carries half the looseness [chosen under the measurement]",
    "form.lengths": "[chosen] — eight-bar blocks so a short record still has a form",
  },
};
