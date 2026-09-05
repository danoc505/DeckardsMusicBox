/**
 * HOW LONG A PART GOES WITHOUT ANYTHING HAPPENING TO IT.
 *
 * The rule of three says an idea stated a third time unchanged is one the ear
 * has started to tune out, and the arrangement keeps that rule for the RECORD:
 * every two turns of the loop, one thing moves. What nothing counted was the
 * part that was not the thing that moved. It goes on stating its figure, and
 * the next boundary moves somebody else, and the one after that somebody else
 * again — so the record is never still and one part is stale for thirty-two
 * bars. `docs/genre-research/THE-STALENESS-CLOCK.md` is the research; this is
 * the number it was measured with, kept in the repository so the claim can be
 * re-run rather than believed.
 *
 * `tools/measure.ts` cannot count this and is not asked to: it reads the MIDI
 * file, and a part's staleness is made of things the file does not carry — a
 * treatment on the desk, a part held back, the kit in half time. So this reads
 * the composed record directly, the way `tools/treatments.ts` does.
 *
 * A TURN IS IDENTICAL TO THE LAST when everything an ear could hold is the
 * same: every note's bar, step, pitch and manner; the treatment the desk is
 * on and whether it is aimed at this part; and whether the part is hushed,
 * the kit thinned or halved. Gain is deliberately left out — the arc and the
 * hand's jitter move it every bar, so a signature that included it would call
 * every turn unique and measure nothing. The unit is the part's own unit of
 * repetition, which `perform.ts` already draws: the bar for the drums, the turn
 * of the loop for everything pitched.
 *
 *   node tools/stale.ts                          both genres, seeds 1–60
 *   node tools/stale.ts lofi 1 200               one genre, a range
 *   node tools/stale.ts dungeonsynth --seeds 14348,46691,15876,11479,21174
 *   node tools/stale.ts lofi 1 60 --records      one line per record as well
 *
 * What it prints, per genre and per part:
 *
 *   runs     how many maximal runs of identical consecutive turns there were
 *   median   the typical run, in turns
 *   p90      the run nine parts in ten are shorter than
 *   max      the longest, and the record and bars it happened in
 *   3+       the share of runs of three turns or more — the rule of three,
 *            broken, as a percentage
 *
 * And for the record as a whole: how many desk entries it has and how many
 * bars each one covers, and at how many span boundaries exactly one thing
 * moved, more than one, or nothing at all.
 */

import { compose } from "../src/song.ts";
import { GENRE_NAMES, type GenreName } from "../src/genre/index.ts";
import { ROLES, type Role } from "../src/genre/spec.ts";
import { periodOf } from "../src/stage/material/harmony.ts";
import type { Span } from "../src/stage/arrange.ts";
import { reachesPart } from "../src/stage/treat.ts";

const args = process.argv.slice(2);
const named = (flag: string): string | undefined => {
  const i = args.indexOf(`--${flag}`);
  return i < 0 ? undefined : args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));

const genres: readonly GenreName[] = positional[0] === undefined ? GENRE_NAMES : (positional[0].split(",") as GenreName[]);
const seedList = named("seeds");
const seeds: number[] = seedList !== undefined
  ? seedList.split(",").map(Number)
  : Array.from({ length: Number(positional[2] ?? 60) - Number(positional[1] ?? 1) + 1 }, (_, i) => Number(positional[1] ?? 1) + i);
const perRecord = args.includes("--records");

for (const g of genres) {
  if (!(GENRE_NAMES as readonly string[]).includes(g)) {
    process.stderr.write(`no genre "${g}" — one of ${GENRE_NAMES.join(", ")}\n`);
    process.exit(2);
  }
}

/** A run of identical turns: how long, and where. */
interface Run {
  readonly turns: number;
  readonly seed: number;
  readonly section: number;
  readonly fn: string;
  readonly fromBar: number;
  readonly toBar: number;
  readonly period: number;
}

/** Which span a bar of a section falls in — the same arithmetic `perform.ts` uses. */
function spanAt(spans: readonly Span[], barInSection: number, period: number): Span {
  return spans[Math.min(spans.length - 1, Math.floor(barInSection / (2 * period)))]!;
}

const q = (xs: readonly number[], f: number): number => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(f * (s.length - 1)))]!;
};
const pct = (n: number, of: number): string => (of === 0 ? "  -" : `${((100 * n) / of).toFixed(0).padStart(3)}%`);

for (const g of genres) {
  const runs = new Map<Role, Run[]>();
  for (const r of ROLES) runs.set(r, []);
  let deskEntries = 0, bars = 0, recordsWithNoDesk = 0;
  let one = 0, many = 0, none = 0;
  const lines: string[] = [];

  for (const seed of seeds) {
    const song = compose({ genre: g, seed });
    const { chart, arrangement, performance } = song;
    bars += song.form.bars;
    deskEntries += performance.desk.length;
    if (performance.desk.length === 0) recordsWithNoDesk++;

    let rOne = 0, rMany = 0, rNone = 0;
    const worstHere = new Map<Role, number>();
    for (const p of arrangement.placed) {
      const period = Math.max(1, periodOf(chart, p.section.idea));

      // WHAT MOVED AT EACH BOUNDARY — counted, not assumed. The two-loop rule
      // says the arrangement changes every two turns; it does not say by
      // exactly one thing, and its own worked example moves four.
      for (let k = 1; k < p.spans.length; k++) {
        const a = p.spans[k - 1]!, b = p.spans[k]!;
        let moved = 0;
        if (a.heard.size !== b.heard.size || [...a.heard].some((r) => !b.heard.has(r))) moved++;
        if (a.thin !== b.thin) moved++;
        if (a.hush !== b.hush) moved++;
        if (a.halved !== b.halved) moved++;
        if (a.treatment !== b.treatment || a.at !== b.at) moved++;
        if (moved === 0) rNone++; else if (moved === 1) rOne++; else rMany++;
      }

      // EACH PART'S RUNS, in its own unit. The drums' unit is the bar; every
      // pitched part's is the turn of the loop, because that is what it was
      // written for and repeats by.
      for (const role of ROLES) {
        const unit = role === "drums" ? 1 : period;
        const turns = Math.ceil(p.section.bars / unit);
        const sigs: (string | null)[] = [];
        for (let t = 0; t < turns; t++) {
          const b0 = t * unit;
          const sp = spanAt(p.spans, b0, period);
          if (!sp.heard.has(role)) { sigs.push(null); continue; }
          const from = p.section.startBar + b0, to = from + unit;
          const notes = performance.events
            .filter((e) => e.role === role && e.bar >= from && e.bar < to)
            .map((e) => `${e.bar - from}:${e.step}:${e.pitch}:${e.art}`)
            .join(",");
          // the desk counts for this part only where the treatment reaches it:
          // the machine's reverb is not a change to the bass
          const under = sp.treatment !== null && reachesPart(sp.treatment, chart.genre.sound, sp.at ?? undefined).has(role);
          const desk = under ? `${sp.treatment}${sp.at === role ? "*" : ""}` : ".";
          const held = `${sp.hush === role ? "h" : ""}${role === "drums" && sp.thin ? "t" : ""}${role === "drums" && sp.halved ? "H" : ""}`;
          sigs.push(`${notes}|${desk}|${held}`);
        }
        let n = 1;
        for (let i = 1; i <= sigs.length; i++) {
          if (i < sigs.length && sigs[i] !== null && sigs[i] === sigs[i - 1]) { n++; continue; }
          if (sigs[i - 1] !== null) {
            runs.get(role)!.push({
              turns: n, seed, section: p.section.index, fn: p.section.fn,
              fromBar: p.section.startBar + (i - n) * unit, toBar: p.section.startBar + i * unit, period: unit,
            });
            if (n > (worstHere.get(role) ?? 0)) worstHere.set(role, n);
          }
          n = 1;
        }
      }
    }
    one += rOne; many += rMany; none += rNone;
    if (perRecord) {
      const worst = ROLES.map((r) => `${r} ${worstHere.get(r) ?? 0}`).join("  ");
      lines.push(`  seed ${String(seed).padStart(6)}  ${String(song.form.bars).padStart(3)} bars  desk ${String(performance.desk.length).padStart(2)}  boundaries ${rOne}/${rMany}/${rNone}  longest ${worst}`);
    }
  }

  process.stdout.write(`\n${g} · ${seeds.length} records · ${bars} bars\n`);
  process.stdout.write(`  ${"part".padEnd(6)} ${"runs".padStart(5)} ${"median".padStart(6)} ${"p90".padStart(4)} ${"max".padStart(4)}   ${"3+".padStart(4)}   where the longest was\n`);
  for (const role of ROLES) {
    const rs = runs.get(role)!;
    const lens = rs.map((r) => r.turns);
    const worst = rs.reduce<Run | null>((w, r) => (w === null || r.turns > w.turns ? r : w), null);
    const where = worst === null ? "-"
      : `seed ${worst.seed} · section ${worst.section} (${worst.fn}) · bars ${worst.fromBar}–${worst.toBar} · unit ${worst.period} bar${worst.period === 1 ? "" : "s"}`;
    process.stdout.write(`  ${role.padEnd(6)} ${String(rs.length).padStart(5)} ${String(q(lens, 0.5)).padStart(6)} ${String(q(lens, 0.9)).padStart(4)} ${String(worst?.turns ?? 0).padStart(4)}   ${pct(lens.filter((n) => n >= 3).length, lens.length)}   ${where}\n`);
  }
  const boundaries = one + many + none;
  process.stdout.write(`  desk       ${deskEntries} entries over ${bars} bars — one every ${(bars / Math.max(1, deskEntries)).toFixed(1)} bars; ${recordsWithNoDesk} of ${seeds.length} records never move it\n`);
  process.stdout.write(`  boundaries ${boundaries}: exactly one thing moved at ${one} (${pct(one, boundaries).trim()}), more than one at ${many} (${pct(many, boundaries).trim()}), nothing at ${none}\n`);
  for (const l of lines) process.stdout.write(l + "\n");
}
