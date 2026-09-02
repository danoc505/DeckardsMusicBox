/**
 * Compose a record and print it.
 *
 *   node src/cli.ts <genre> <seed> [seconds]     the dump, to stdout
 *   node src/cli.ts <genre> <seed> --summary     one line
 *   node src/cli.ts <genre> <seed> --wav <file>  the record, rendered
 *   node src/cli.ts <genre> <seed> --mid <file>  the record as a MIDI file
 *   node src/cli.ts --genres                     what can be asked for
 */

import { writeFileSync } from "node:fs";
import { GENRE_NAMES, type GenreName } from "./genre/index.ts";
import { compose } from "./song.ts";
import { dump, summary } from "./dump.ts";
import { render } from "./sound/render.ts";
import { wav } from "./sound/wav.ts";
import { midi } from "./sound/midi.ts";

function usage(): never {
  process.stderr.write(
    "usage: node src/cli.ts <genre> <seed> [seconds] [--summary] [--wav <file>] [--mid <file>]\n" +
      "       node src/cli.ts --genres\n" +
      `genres: ${GENRE_NAMES.join(", ")}\n`,
  );
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.includes("--genres")) {
  process.stdout.write(GENRE_NAMES.join("\n") + "\n");
  process.exit(0);
}
const wantSummary = args.includes("--summary");
const wavAt = args.indexOf("--wav");
const wavFile = wavAt >= 0 ? args[wavAt + 1] : undefined;
if (wavAt >= 0 && wavFile === undefined) usage();
const midAt = args.indexOf("--mid");
const midFile = midAt >= 0 ? args[midAt + 1] : undefined;
if (midAt >= 0 && midFile === undefined) usage();
const takesValue = (i: number): boolean => (wavAt >= 0 && i === wavAt + 1) || (midAt >= 0 && i === midAt + 1);
const positional = args.filter((a, i) => !a.startsWith("--") && !takesValue(i));
const [genreArg, seedArg, secondsArg] = positional;
if (genreArg === undefined || seedArg === undefined) usage();
if (!(GENRE_NAMES as readonly string[]).includes(genreArg)) {
  process.stderr.write(`no genre "${genreArg}"\n`);
  usage();
}
const seed = Number(seedArg);
if (!Number.isInteger(seed)) usage();
const seconds = secondsArg === undefined ? undefined : Number(secondsArg);
if (seconds !== undefined && !(seconds > 0)) usage();

const song = compose(seconds === undefined ? { seed, genre: genreArg as GenreName } : { seed, genre: genreArg as GenreName, seconds });
if (midFile !== undefined) {
  writeFileSync(midFile, midi(song));
  process.stderr.write(`${summary(song)} → ${midFile}\n`);
}
if (wavFile !== undefined) {
  const out = render(song);
  writeFileSync(wavFile, wav(out.left, out.right, 44100));
  process.stderr.write(`${summary(song)} → ${wavFile}\n`);
} else if (midFile === undefined) {
  process.stdout.write(wantSummary ? summary(song) + "\n" : dump(song));
}
