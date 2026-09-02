/**
 * What MKIII offers a caller: compose a record, read it, render it.
 * The CLI and the page are both written against this and nothing else.
 */

export { compose, type Request, type Song } from "./song.ts";
export { dump, summary, motionOf, distinctBars, PROGRAM, type Motion } from "./dump.ts";
export { render, rms, peak, settle, type Stereo } from "./sound/render.ts";
export { RACK_ORDER, PEDAL_ORDER, SENDS, ROLES, type RackSpec, type RackRules, type SoundSpec } from "./genre/spec.ts";
export { wav } from "./sound/wav.ts";
export { GENRES, GENRE_NAMES, genre, type GenreName } from "./genre/index.ts";
export { NOTE_NAMES, noteName, pc } from "./core/theory.ts";
