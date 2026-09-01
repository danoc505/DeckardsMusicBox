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

  // swung hard and played loose: the genre is defined by a drum machine
  // dragging behind the grid
  feel: { swing: 0.55, jitterMs: 9 },

  sources: {
    tempo:
      "widely reported 70-90 bpm; narrowed to 72-88 so the ends of the range " +
      "are still the genre rather than trip-hop below and boom-bap above [chosen inside the range]",
    scales: "[chosen] — no measurement behind the weights yet",
    lengthSec: "[chosen] — the length of a beat-tape track, unmeasured",
    metre: "[chosen] — nothing sourced says this genre is ever not in four",
    feel: "[chosen] — the swing is the genre's identifying feel; the amount is unmeasured",
    "form.lengths": "[chosen] — eight-bar blocks so a short record still has a form",
  },
};
