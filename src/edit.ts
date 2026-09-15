/**
 * REROLLING A RECORD: a selection on the roll, turned into the addresses it
 * covers.
 *
 * The program does not write notes one at a time. It writes a MATERIAL — the
 * tune, the groove, the figure — once per idea, and the arrangement plays it
 * in every section that states that idea. So the thing a user can point at and
 * ask for again is a part of a material, and the address of that is already
 * fixed by the material stage: `material/<idea>/<variant>/<role>`. Salting it
 * (`Rng.edited`) redraws every decision under it and nothing outside it.
 *
 * WHAT FOLLOWS, FOLLOWS ON ITS OWN. Nothing here propagates a change. The
 * counter is written against the tune, the bass stands on the kick, the tune
 * keeps off the seats the keys hold — each is built from the one before, and
 * a rebuild with one draw changed rebuilds what was built from that draw and
 * leaves the rest byte for byte. That is the pipeline's shape, not a rule of
 * this file's.
 *
 * THREE SIZES, ONE MECHANISM. A single part is one role in the material one
 * section plays; a series is one role over a run of bars, which is every
 * material those bars play; a whole instrument is one role in every material.
 * The selection names roles and, optionally, bars; this file finds the
 * materials the bars fall in and writes one edit per role per material. A
 * selection of bars that all play the same material is one edit, and the
 * change is heard in every section that plays it — the roll shows which.
 *
 * STEPPING BACK IS POPPING THE LIST. A record is a pure function of genre,
 * seed and its edits, so the page keeps the list, `compose` takes it, and the
 * previous record is the same list one shorter. Nothing is stored but the
 * list.
 */

import type { Edit } from "./core/rng.ts";
import type { Role } from "./genre/spec.ts";
import { ROLES } from "./genre/spec.ts";
import type { Song } from "./song.ts";
import { materialAddress } from "./stage/arrange.ts";

export interface Selection {
  /** Which parts to reroll. */
  readonly roles: readonly Role[];
  /** The first bar of the selection; omit both bars for the whole record. */
  readonly from?: number;
  /** One past the last bar of the selection. */
  readonly to?: number;
}

/**
 * The edits that reroll this selection, to be appended to the record's own.
 *
 * Each address is salted one more than it has been salted already, so the
 * same selection rerolled twice is two different records, and neither is the
 * original — the original is the list before either was added.
 */
export function reroll(song: Song, sel: Selection): Edit[] {
  const whole = sel.from === undefined && sel.to === undefined;
  const from = sel.from ?? 0;
  const to = sel.to ?? song.form.bars;
  const keys: string[] = [];
  for (const p of song.arrangement.placed) {
    const s = p.section;
    if (!whole && (s.endBar <= from || s.startBar >= to)) continue;
    if (!keys.includes(p.material)) keys.push(p.material);
  }
  const out: Edit[] = [];
  for (const key of keys) {
    for (const role of sel.roles) {
      const at = `${materialAddress(key)}/${role}`;
      const before = song.chart.edits.filter((e) => e.at === at).length + out.filter((e) => e.at === at).length;
      out.push({ at, salt: before + 1 });
    }
  }
  return out;
}

/** The bars a material is heard in, as `[start, end)` runs in record order, adjacent sections joined. */
function barsOf(song: Song, key: string): [number, number][] {
  const runs: [number, number][] = [];
  for (const p of song.arrangement.placed) {
    if (p.material !== key) continue;
    const last = runs[runs.length - 1];
    if (last !== undefined && last[1] === p.section.startBar) last[1] = p.section.endBar;
    else runs.push([p.section.startBar, p.section.endBar]);
  }
  return runs;
}

/**
 * "lead · A/1 · bars 36–52" — what an edit touched, for the page's list and
 * the dump. An address this file did not write is printed as it is.
 */
export function describeEdit(song: Song, edit: Edit): string {
  const m = /^material\/([^/]+)\/(\d+)\/([a-z]+)$/.exec(edit.at);
  if (m === null || !(ROLES as readonly string[]).includes(m[3]!)) return `${edit.at} ×${edit.salt}`;
  const key = m[2] === "0" ? m[1]! : `${m[1]}/${m[2]}`;
  const runs = barsOf(song, key).map(([a, b]) => `${a}–${b}`).join(", ");
  return `${m[3]} · ${key} · bars ${runs || "none"}${edit.salt > 1 ? ` · ×${edit.salt}` : ""}`;
}

/** `material/A/0/lead=2` — one edit as a string, for a command line. */
export const formatEdit = (e: Edit): string => `${e.at}=${e.salt}`;

/** The reverse of `formatEdit`. A salt left off is 1. Throws on nonsense, because a reroll that lands on nothing is a knob that does nothing. */
export function parseEdit(s: string): Edit {
  const eq = s.lastIndexOf("=");
  const at = eq < 0 ? s : s.slice(0, eq);
  const salt = eq < 0 ? 1 : Number(s.slice(eq + 1));
  if (at.length === 0 || at.startsWith("/") || at.endsWith("/") || !Number.isInteger(salt)) {
    throw new Error(`not an edit: "${s}" (want address=salt, e.g. material/A/0/lead=1)`);
  }
  return { at, salt };
}

/**
 * `--reroll lead`, `--reroll keys:16-32`, `--reroll bass,drums` — a selection
 * as a command-line word, for the CLI and the roll tool.
 */
export function parseSelection(s: string): Selection {
  const [who, range] = s.split(":");
  const roles = (who ?? "").split(",").filter((r) => r.length > 0) as Role[];
  for (const r of roles) if (!(ROLES as readonly string[]).includes(r)) throw new Error(`no part "${r}" (parts: ${ROLES.join(", ")})`);
  if (roles.length === 0) throw new Error(`no part named in "${s}"`);
  if (range === undefined) return { roles };
  const [a, b] = range.split("-").map(Number);
  if (!Number.isInteger(a) || !Number.isInteger(b) || b! <= a!) throw new Error(`bad bar range "${range}" (want from-to, e.g. 16-32)`);
  return { roles, from: a!, to: b! };
}
