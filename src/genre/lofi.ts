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

  sources: {
    tempo:
      "widely reported 70-90 bpm; narrowed to 72-88 so the ends of the range " +
      "are still the genre rather than trip-hop below and boom-bap above [chosen inside the range]",
    scales: "[chosen] — no measurement behind the weights yet",
    lengthSec: "[chosen] — the length of a beat-tape track, unmeasured",
    metre: "[chosen] — nothing sourced says this genre is ever not in four",
  },
};
