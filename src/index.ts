/**
 * What MKIII offers a caller: compose a record, read it, render it.
 * The CLI and the page are both written against this and nothing else.
 */

export { compose, type Request, type Song } from "./song.ts";
export { dump, summary, PROGRAM } from "./dump.ts";
export { render, rms, peak } from "./sound/render.ts";
export { wav } from "./sound/wav.ts";
export { GENRES, GENRE_NAMES, genre, type GenreName } from "./genre/index.ts";
