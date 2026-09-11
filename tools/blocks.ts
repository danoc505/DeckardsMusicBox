/**
 * HOW OFTEN A RECORD INTERRUPTS ITSELF, and with what, and on which part.
 *
 * `material/event.ts` is a pool of gestures that break the order of things,
 * and the rate it reaches for one is a `[chosen]` constant. A constant nobody
 * counts is how the drone's alteration came to fire 0 times in 872 rounds and
 * ship anyway — this repository calls that its cardinal sin, and the reason it
 * happened is that nothing could ask a record the question.
 *
 * This asks it. Every material, every round, every part: what fired.
 *
 *   node tools/blocks.ts                    both genres, seeds 1-60
 *   node tools/blocks.ts dungeonsynth 1 200
 *   node tools/blocks.ts lofi 1 60 --records
 *
 * What it prints, per genre:
 *
 *   rounds    how many part-rounds there were to interrupt at all
 *   fired     how many carried a block, and the share
 *   by part   the share of each part's own rounds that carried one — the
 *             number that says whether a block reaches every instrument or
 *             only the kit
 *   by block  how many times each name fired, and how many records never
 *             fired it at all. A name with a zero is a dead knob.
 *   records   how many of the seeds fired nothing whatsoever. A record with no
 *             interruptions is correct; a genre where that is most of them is
 *             a pool that is not in the program.
 */

import { compose } from "../src/song.ts";
import { GENRE_NAMES, type GenreName } from "../src/genre/index.ts";
import { ROLES, type Role } from "../src/genre/spec.ts";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const rest = args.filter((a) => !a.startsWith("--"));
const genres = (rest[0] !== undefined ? [rest[0]] : [...GENRE_NAMES]) as GenreName[];
const from = Number(rest[1] ?? 1);
const to = Number(rest[2] ?? 60);

const pct = (a: number, b: number): string => (b === 0 ? "  — " : `${((100 * a) / b).toFixed(0).padStart(3)}%`);

for (const genre of genres) {
  const rounds = new Map<Role, number>();
  const fired = new Map<Role, number>();
  const names = new Map<string, number>();
  const seen = new Map<string, Set<number>>();
  let quiet = 0;
  let seeds = 0;

  for (let seed = from; seed <= to; seed++) {
    let here = 0;
    seeds++;
    let song;
    try {
      song = compose({ seed, genre });
    } catch (e) {
      console.log(`  seed ${seed}: ${(e as Error).message}`);
      continue;
    }
    for (const m of song.materials.all.values()) {
      for (const role of ROLES) {
        const list = m.blocks[role];
        rounds.set(role, (rounds.get(role) ?? 0) + list.length);
        for (const b of list) {
          if (b === null) continue;
          here++;
          fired.set(role, (fired.get(role) ?? 0) + 1);
          names.set(b, (names.get(b) ?? 0) + 1);
          (seen.get(b) ?? seen.set(b, new Set()).get(b)!).add(seed);
        }
      }
    }
    if (here === 0) quiet++;
    if (flags.has("--records")) console.log(`  seed ${String(seed).padStart(4)}  ${here} block${here === 1 ? "" : "s"}`);
  }

  const allRounds = [...rounds.values()].reduce((a, b) => a + b, 0);
  const allFired = [...fired.values()].reduce((a, b) => a + b, 0);
  console.log(`\n${genre}  seeds ${from}-${to}`);
  console.log(`  rounds ${allRounds}   fired ${allFired}  ${pct(allFired, allRounds)}`);
  console.log(`  by part`);
  for (const role of ROLES) {
    const r = rounds.get(role) ?? 0;
    console.log(`    ${role.padEnd(8)} ${String(fired.get(role) ?? 0).padStart(5)} / ${String(r).padStart(5)}  ${pct(fired.get(role) ?? 0, r)}`);
  }
  console.log(`  by block`);
  for (const [name, n] of [...names].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${name.padEnd(11)} ${String(n).padStart(5)}   in ${String(seen.get(name)?.size ?? 0).padStart(3)} of ${seeds} records`);
  }
  console.log(`  ${quiet} of ${seeds} records fired nothing at all`);
}
