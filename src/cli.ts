/**
 * Compose a record and print it.
 *
 *   node src/cli.ts <genre> <seed> [seconds]     the dump, to stdout
 *   node src/cli.ts <genre> <seed> --summary     one line
 *   node src/cli.ts <genre> <seed> --wav <file>  the record, rendered
 *   node src/cli.ts <genre> <seed> --mid <file>  the record as a MIDI file
 *   node src/cli.ts --genres                     what can be asked for
 *
 * REROLLS, applied in the order given and printed as `#edit` lines:
 *
 *   --reroll lead              the tune, in every material
 *   --reroll keys:16-32        the keys, in whatever bars 16–32 play
 *   --reroll bass,drums:0-8    two parts at once
 *   --edit material/A/0/lead=2 one address, salted by hand
 */

import { writeFileSync } from "node:fs";
import type { Edit } from "./core/rng.ts";
import { GENRE_NAMES, type GenreName } from "./genre/index.ts";
import { compose } from "./song.ts";
import { dump, summary } from "./dump.ts";
import { parseEdit, parseSelection, reroll } from "./edit.ts";
import { render } from "./sound/render.ts";
import { wav } from "./sound/wav.ts";
import { midi } from "./sound/midi.ts";

function usage(): never {
  process.stderr.write(
    "usage: node src/cli.ts <genre> <seed> [seconds] [--summary] [--wav <file>] [--mid <file>]\n" +
      "                       [--reroll <part>[,<part>][:<from>-<to>]]... [--edit <address>=<salt>]...\n" +
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
/** Flags that take the argument after them. */
const VALUED = ["--wav", "--mid", "--reroll", "--edit"];
const wavAt = args.indexOf("--wav");
const wavFile = wavAt >= 0 ? args[wavAt + 1] : undefined;
if (wavAt >= 0 && wavFile === undefined) usage();
const midAt = args.indexOf("--mid");
const midFile = midAt >= 0 ? args[midAt + 1] : undefined;
if (midAt >= 0 && midFile === undefined) usage();
const takesValue = (i: number): boolean => i > 0 && VALUED.includes(args[i - 1]!);
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

/**
 * THE REROLLS, IN THE ORDER THEY WERE ASKED. A `--reroll` is resolved against
 * the record as it stands with the edits before it — which materials the bars
 * fall in, how many times an address has been salted already — so the record
 * is composed once per reroll on the way, exactly as the page does it.
 */
let edits: Edit[] = [];
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  const value = args[i + 1];
  if ((flag !== "--reroll" && flag !== "--edit") || value === undefined) continue;
  try {
    if (flag === "--edit") edits.push(parseEdit(value));
    else {
      const sofar = compose({ seed, genre: genreArg as GenreName, ...(seconds === undefined ? {} : { seconds }), edits });
      edits = edits.concat(reroll(sofar, parseSelection(value)));
    }
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    usage();
  }
}

const song = compose({ seed, genre: genreArg as GenreName, ...(seconds === undefined ? {} : { seconds }), edits });
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
