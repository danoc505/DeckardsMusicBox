/**
 * Compose a record and print it.
 *
 *   node src/cli.ts <genre> <seed> [seconds]     the dump, to stdout
 *   node src/cli.ts <genre> <seed> --summary     one line
 *   node src/cli.ts --genres                     what can be asked for
 */

import { GENRE_NAMES, type GenreName } from "./genre/index.ts";
import { compose } from "./song.ts";
import { dump, summary } from "./dump.ts";

function usage(): never {
  process.stderr.write(
    "usage: node src/cli.ts <genre> <seed> [seconds] [--summary]\n" +
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
const positional = args.filter((a) => !a.startsWith("--"));
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
process.stdout.write(wantSummary ? summary(song) + "\n" : dump(song));
