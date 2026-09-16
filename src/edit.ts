/**
 * REROLLING A RECORD: a selection on the roll, turned into the addresses it
 * covers — and setting the few things a user would rather say than draw.
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
 * section plays; a series is one role over a run of bars; a whole instrument
 * is one role in every material. The selection names roles and, optionally,
 * bars, and this file writes one edit per role per material those bars play.
 *
 * AND BELOW A MATERIAL, WHERE A DRAW EXISTS TO LAND ON. A range that covers
 * part of a section reaches the finer draws under the material for the two
 * parts that have them: the tune is written a PHRASE at a time
 * (`lead/phrase/<n>`, and its development under `lead/answer`), and the drums
 * are treated a CYCLE at a time (`drums/cycle/<n>`). The keys, bass, drone and
 * counter have no draw of their own per bar — the keys are voiced from the
 * chords, the bass stands on the kick, the counter is written against the
 * tune — so for those a partial range still means the whole material, and the
 * description says so. And a tune is a walk with memory: rerolling one phrase
 * moves the phrases after it as a consequence, which the description also
 * says.
 *
 * ONLY HERE. A part in one section is a part in every section playing that
 * material. Where the owner wants this one alone, the section is SPLIT off
 * first — a pin at `form/section/<i>/split`, the form's own variant machinery
 * — and the reroll lands on the material the split section now plays. The law
 * a variant obeys still holds: every later statement of the idea plays the
 * developed one, so a split is exact for the last statement and "from here
 * on" for the others.
 *
 * THE CHART AND THE CHORDS are addresses too — `chart/key`, `chart/scale`,
 * `chart/tempo`, `harmony/<idea>`, `form` — so they reroll like anything else,
 * and the three a user would rather state than draw are PINNED: a value the
 * draw site could have produced, chosen instead of drawn, never past the
 * genre's own range.
 *
 * STEPPING BACK IS POPPING THE LIST. A record is a pure function of genre,
 * seed and its edits, so the page keeps the list of presses, `compose` takes
 * the edits laid end to end, and the previous record is the same list one
 * press shorter. Nothing is stored but the list.
 */

import { isPin, type Edit } from "./core/rng.ts";
import { NOTE_NAMES, pc, type ScaleName } from "./core/theory.ts";
import type { Role } from "./genre/spec.ts";
import { ROLES } from "./genre/spec.ts";
import { compose, type Song } from "./song.ts";
import { materialAddress, type Placed } from "./stage/arrange.ts";

export interface Selection {
  /** Which parts to reroll. */
  readonly roles: readonly Role[];
  /** The first bar of the selection; omit both bars for the whole record. */
  readonly from?: number;
  /** One past the last bar of the selection. */
  readonly to?: number;
  /** Split the selected sections off first, so only they (and what follows them) change. */
  readonly only?: boolean;
}

/** The record-wide things that can be rerolled by name. */
export const ASPECTS = ["chords", "key", "mode", "tempo", "form"] as const;
export type Aspect = (typeof ASPECTS)[number];

/** A phrase of the tune is two bars: `lead.ts` PHRASE_BARS, read here so a bar can be turned into a phrase. */
const PHRASE_BARS = 2;

/** The sections a bar range touches, in record order. */
function sectionsIn(song: Song, from: number, to: number): Placed[] {
  return song.arrangement.placed.filter((p) => !(p.section.endBar <= from || p.section.startBar >= to));
}

/** The same record with these edits added, for a press that has to look at what a first step made. */
function again(song: Song, edits: readonly Edit[]): Song {
  return compose({
    seed: song.chart.seed,
    genre: song.chart.genre,
    ...(song.chart.askedSec === null ? {} : { seconds: song.chart.askedSec }),
    edits: [...song.chart.edits, ...edits],
  });
}

/** How many times this material has been played through by this part before this section: `timesRound` in the material stage, counted the same way. */
function roundsBefore(song: Song, at: Placed, role: Role): number {
  const bars = song.materials.bars;
  let n = 0;
  for (const q of song.arrangement.placed) {
    if (q.section.index >= at.section.index) break;
    if (q.material === at.material && q.heard.has(role)) n += Math.ceil(q.section.bars / bars);
  }
  return n;
}

/**
 * The edits that reroll this selection, to be appended to the record's own.
 *
 * Each address is salted one more than it has been salted already, so the
 * same selection rerolled twice is two different records, and neither is the
 * original — the original is the list before either was added.
 */
export function reroll(song: Song, sel: Selection, skip = 0): Edit[] {
  const whole = sel.from === undefined && sel.to === undefined;
  const from = sel.from ?? 0;
  const to = sel.to ?? song.form.bars;
  const out: Edit[] = [];
  let base = song;

  // ONLY HERE: split off every selected section whose material is also heard
  // outside the selection, then look at the record that made, because the
  // materials the selection plays are different ones now
  if (sel.only && !whole) {
    for (const p of sectionsIn(song, from, to)) {
      const elsewhere = song.arrangement.placed.some((q) => q.material === p.material && (q.section.endBar <= from || q.section.startBar >= to));
      if (elsewhere && !p.section.split) out.push(split(song, p.section.index));
    }
    if (out.length > 0) base = again(song, out);
  }

  const seen = new Set<string>();
  const salted = (at: string): void => {
    if (seen.has(at)) return;
    seen.add(at);
    const before = base.chart.edits.filter((e) => !isPin(e) && e.at === at).length;
    out.push({ at, salt: before + 1 + skip });
  };
  const treatments = Math.max(1, base.chart.genre.drums.treatments);

  for (const p of sectionsIn(base, from, to)) {
    const m = base.materials.all.get(p.material);
    if (m === undefined) continue;
    const addr = materialAddress(p.material);
    const wholeSection = whole || (from <= p.section.startBar && to >= p.section.endBar);
    const a = Math.max(from, p.section.startBar);
    const b = Math.min(to, p.section.endBar);
    for (const role of sel.roles) {
      if (wholeSection || (role !== "lead" && role !== "drums")) {
        salted(`${addr}/${role}`);
        continue;
      }
      if (role === "lead") {
        // the phrases these bars fall in, and the development's answers, which
        // are drawn per attempt under one prefix
        for (let bar = a; bar < b; bar++) salted(`${addr}/lead/phrase/${Math.floor(((bar - p.section.startBar) % m.bars) / PHRASE_BARS)}`);
        salted(`${addr}/lead/answer`);
      } else {
        // the cycles these bars fall in: the treatment of the figure this
        // round plays, which comes round again every `treatments` rounds
        const before = roundsBefore(base, p, "drums");
        for (let bar = a; bar < b; bar++) {
          const n = before + Math.floor((bar - p.section.startBar) / m.bars);
          salted(`${addr}/drums/cycle/${(n + m.variant) % treatments}`);
        }
      }
    }
  }
  return out;
}

/**
 * SEVERAL ANSWERS TO ONE SELECTION, to choose among rather than gamble on.
 *
 * Nothing needs rendering to reroll, so the answer to a selection need not
 * be one record: each candidate is the same selection salted one further
 * along, and every one is legal because the laws are filters at the point
 * of choice. Keeping the k-th is pressing its edits; the ones not kept cost
 * nothing and leave nothing behind. `from` skips the first few, so "try
 * four more" is the next four and never the same four again.
 */
export function candidates(song: Song, sel: Selection, n: number, from = 0): Edit[][] {
  return Array.from({ length: Math.max(0, n) }, (_, k) => reroll(song, sel, from + k));
}

/** Reroll something record-wide: the chords of the ideas a range plays, or the key, mode, tempo or form. */
export function rerollAspect(song: Song, what: Aspect, range?: { readonly from: number; readonly to: number }): Edit[] {
  const ats: string[] = [];
  if (what === "chords") {
    const placed = range === undefined ? song.arrangement.placed : sectionsIn(song, range.from, range.to);
    for (const p of placed) {
      const at = `harmony/${p.section.idea}`;
      if (!ats.includes(at)) ats.push(at);
    }
  } else if (what === "form") ats.push("form");
  else ats.push(`chart/${what === "mode" ? "scale" : what}`);
  return ats.map((at) => ({ at, salt: song.chart.edits.filter((e) => !isPin(e) && e.at === at).length + 1 }));
}

/** The tempo, said rather than drawn. Held inside the genre's own range, because the form is checked against it. */
export function setTempo(song: Song, bpm: number): Edit {
  const [lo, hi] = song.chart.genre.tempo;
  if (!Number.isFinite(bpm)) throw new Error(`not a tempo: ${String(bpm)}`);
  return { at: "chart/tempo", value: Math.min(hi, Math.max(lo, bpm)) };
}

/** The key, by note name. The shift moves the drawn key, so the pin is the draw that lands on this note after it. */
export function setKey(song: Song, note: string): Edit {
  const i = (NOTE_NAMES as readonly string[]).indexOf(note.trim().toUpperCase().replace("♯", "#"));
  if (i < 0) throw new Error(`no note "${note}" (notes: ${NOTE_NAMES.join(" ")})`);
  return { at: "chart/key", value: pc(i - song.chart.shift) };
}

/** The mode, by name, from the ones the genre offers. */
export function setMode(song: Song, name: string): Edit {
  const offered = song.chart.genre.scales.filter(([, w]) => w > 0).map(([s]) => s);
  if (!offered.includes(name as ScaleName)) throw new Error(`no mode "${name}" in this genre (offers: ${offered.join(", ")})`);
  return { at: "chart/scale", value: name };
}

/** This section, split off into its own material — and every later statement of its idea with it. */
export function split(song: Song, sectionIndex: number): Edit {
  if (!Number.isInteger(sectionIndex) || sectionIndex < 0 || sectionIndex >= song.form.sections.length) {
    throw new Error(`no section ${String(sectionIndex)} (the record has ${song.form.sections.length})`);
  }
  return { at: `form/section/${sectionIndex}/split`, value: true };
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
const runsText = (runs: [number, number][]): string => runs.map(([a, b]) => `${a}–${b}`).join(", ") || "none";

/**
 * "lead · A/1 · bars 36–52" — what an edit touched, for the page's list and
 * the roll. An address this file did not write is printed as it is.
 */
export function describeEdit(song: Song, edit: Edit): string {
  const c = song.chart;
  if (isPin(edit)) {
    if (edit.at === "chart/tempo") return `tempo set to ${String(edit.value)}`;
    if (edit.at === "chart/key" && typeof edit.value === "number") return `key set to ${NOTE_NAMES[pc(edit.value + c.shift)]}`;
    if (edit.at === "chart/scale") return `mode set to ${String(edit.value)}`;
    const sp = /^form\/section\/(\d+)\/split$/.exec(edit.at);
    if (sp !== null) {
      const s = song.form.sections[Number(sp[1])];
      return s === undefined ? `section ${sp[1]} split off` : `${s.fn} at bar ${s.startBar} split off · its own material from here on`;
    }
    return `${edit.at} := ${String(edit.value)}`;
  }
  const times = edit.salt > 1 ? ` · ×${edit.salt}` : "";
  const h = /^harmony\/([^/]+)$/.exec(edit.at);
  if (h !== null) return `chords · ${h[1]}${times}`;
  if (edit.at === "form") return `form rerolled${times}`;
  if (edit.at === "chart/key") return `key rerolled${times}`;
  if (edit.at === "chart/scale") return `mode rerolled${times}`;
  if (edit.at === "chart/tempo") return `tempo rerolled${times}`;
  const m = /^material\/([^/]+)\/(\d+)\/([a-z]+)(?:\/(.*))?$/.exec(edit.at);
  if (m === null || !(ROLES as readonly string[]).includes(m[3]!)) return `${edit.at}${times}`;
  const key = m[2] === "0" ? m[1]! : `${m[1]}/${m[2]}`;
  const where = runsText(barsOf(song, key));
  const fine = m[4];
  if (fine === undefined) return `${m[3]} · ${key} · bars ${where}${times}`;
  const ph = /^phrase\/(\d+)$/.exec(fine);
  if (ph !== null) return `${m[3]} · ${key} · phrase ${ph[1]} and the tune after it · bars ${where}${times}`;
  if (fine === "answer") return `${m[3]} · ${key} · the development · bars ${where}${times}`;
  const cy = /^cycle\/(\d+)$/.exec(fine);
  if (cy !== null) return `${m[3]} · ${key} · beat ${cy[1]} of ${Math.max(1, c.genre.drums.treatments)} · bars ${where}${times}`;
  return `${m[3]} · ${key} · ${fine}${times}`;
}

/** `material/A/0/lead=2` for a reroll, `chart/tempo:=92` for a pin — one edit as a string, for a command line. */
export const formatEdit = (e: Edit): string => (isPin(e) ? `${e.at}:=${String(e.value)}` : `${e.at}=${e.salt}`);

/** The reverse of `formatEdit`. A salt left off is 1. Throws on nonsense, because a reroll that lands on nothing is a knob that does nothing. */
export function parseEdit(s: string): Edit {
  const pin = s.indexOf(":=");
  if (pin >= 0) {
    const at = s.slice(0, pin);
    const raw = s.slice(pin + 2);
    if (at.length === 0 || at.startsWith("/") || at.endsWith("/") || raw.length === 0) throw new Error(`not an edit: "${s}" (want address:=value)`);
    const value = raw === "true" ? true : raw === "false" ? false : Number.isFinite(Number(raw)) ? Number(raw) : raw;
    return { at, value };
  }
  const eq = s.lastIndexOf("=");
  const at = eq < 0 ? s : s.slice(0, eq);
  const salt = eq < 0 ? 1 : Number(s.slice(eq + 1));
  if (at.length === 0 || at.startsWith("/") || at.endsWith("/") || !Number.isInteger(salt)) {
    throw new Error(`not an edit: "${s}" (want address=salt, e.g. material/A/0/lead=1)`);
  }
  return { at, salt };
}

/**
 * `lead`, `keys,bass:16-32`, `drums:16-32:only`, `chords`, `chords:16-32`,
 * `key`, `mode`, `tempo`, `form` — a reroll as a command-line word, applied to
 * this record. The CLI and the roll tool both read it, so a reroll can be
 * rolled and looked at.
 */
export function rerollWord(song: Song, word: string): Edit[] {
  const [who, range, flag] = word.split(":");
  if (flag !== undefined && flag !== "only") throw new Error(`unknown flag "${flag}" in "${word}" (only "only")`);
  let bars: { from: number; to: number } | undefined;
  if (range !== undefined && range.length > 0) {
    const [a, b] = range.split("-").map(Number);
    if (!Number.isInteger(a) || !Number.isInteger(b) || b! <= a!) throw new Error(`bad bar range "${range}" (want from-to, e.g. 16-32)`);
    bars = { from: a!, to: b! };
  }
  if ((ASPECTS as readonly string[]).includes(who ?? "")) return rerollAspect(song, who as Aspect, bars);
  const roles = (who ?? "").split(",").filter((r) => r.length > 0) as Role[];
  for (const r of roles) if (!(ROLES as readonly string[]).includes(r)) throw new Error(`no part "${r}" (parts: ${ROLES.join(", ")}; or ${ASPECTS.join(", ")})`);
  if (roles.length === 0) throw new Error(`nothing named in "${word}"`);
  return reroll(song, { roles, ...(bars ?? {}), ...(flag === "only" ? { only: true } : {}) });
}

/** `tempo=92`, `key=D`, `mode=dorian` — a setting as a command-line word. */
export function setWord(song: Song, word: string): Edit {
  const eq = word.indexOf("=");
  const what = eq < 0 ? word : word.slice(0, eq);
  const value = eq < 0 ? "" : word.slice(eq + 1);
  if (what === "tempo") return setTempo(song, Number(value));
  if (what === "key") return setKey(song, value);
  if (what === "mode") return setMode(song, value);
  throw new Error(`nothing to set called "${what}" (tempo, key, mode)`);
}
