/**
 * Compose a record and print it.
 *
 *   node src/cli.ts <genre> <seed> [seconds]     the dump, to stdout
 *   node src/cli.ts <genre> <seed> --summary     one line
 *   node src/cli.ts <genre> <seed> --wav <file>  the record, rendered
 *   node src/cli.ts --genres                     what can be asked for
 */

import { writeFileSync } from "node:fs";
import { GENRE_NAMES, type GenreName } from "./genre/index.ts";
import { compose } from "./song.ts";
import { dump, summary } from "./dump.ts";
import { render } from "./sound/render.ts";
import { wav } from "./sound/wav.ts";

function usage(): never {
  process.stderr.write(
    "usage: node src/cli.ts <genre> <seed> [seconds] [--summary] [--wav <file>]\n" +
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
const positional = args.filter((a, i) => !a.startsWith("--") && !(wavAt >= 0 && i === wavAt + 1));
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
if (wavFile !== undefined) {
  writeFileSync(wavFile, wav(render(song), 44100));
  process.stderr.write(`${summary(song)} → ${wavFile}\n`);
} else {
  process.stdout.write(wantSummary ? summary(song) + "\n" : dump(song));
}
