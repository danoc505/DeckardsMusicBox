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
import type { Element, PitchedRole, Role, SoundSpec, Texture, VoiceName } from "./genre/spec.ts";
import { ELEMENTS, INTRO_KINDS, LEGAL_TEXTURES, PITCHED_ROLES, ROLES, TEXTURES } from "./genre/spec.ts";
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

/**
 * The record-wide things that can be rerolled by name. The last three are the
 * arrangement's own draws: `jobs` is what each seat does in each material
 * (`element/<key>`), `desk` is which colour each treated span takes
 * (`arrange/treat`), and `arrangement` is everything the arrangement draws —
 * the protagonist, the way in, the manners and the desk together.
 */
export const ASPECTS = ["chords", "key", "mode", "tempo", "form", "voices", "jobs", "desk", "arrangement"] as const;
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
  else if (what === "voices") ats.push("chart/voice");
  else if (what === "jobs") {
    // the seats' jobs are drawn per material, and the protagonist's once
    if (range === undefined) ats.push("element");
    else for (const p of sectionsIn(song, range.from, range.to)) {
      const at = `element/${p.material}`;
      if (!ats.includes(at)) ats.push(at);
    }
  } else if (what === "desk") {
    if (range === undefined) ats.push("arrange/treat");
    else for (const p of sectionsIn(song, range.from, range.to)) ats.push(`arrange/treat/${p.section.index}`);
  } else if (what === "arrangement") ats.push("arrange");
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

/** A part's instrument, by name, from the ones the genre offers that part. */
export function setVoice(song: Song, role: string, name: string): Edit {
  if (!(PITCHED_ROLES as readonly string[]).includes(role)) throw new Error(`no pitched part "${role}" (parts: ${PITCHED_ROLES.join(", ")})`);
  const offered = song.chart.genre.sound.voices[role as PitchedRole].filter(([, w]) => w > 0).map(([v]) => v);
  if (!offered.includes(name as VoiceName)) throw new Error(`no voice "${name}" for the ${role} in this genre (offers: ${offered.join(", ")})`);
  return { at: `chart/voice/${role}`, value: name };
}

/** This section, split off into its own material — and every later statement of its idea with it. */
export function split(song: Song, sectionIndex: number): Edit {
  if (!Number.isInteger(sectionIndex) || sectionIndex < 0 || sectionIndex >= song.form.sections.length) {
    throw new Error(`no section ${String(sectionIndex)} (the record has ${song.form.sections.length})`);
  }
  return { at: `form/section/${sectionIndex}/split`, value: true };
}

/** The sections a range covers, or every section for no range. */
const sectionsOf = (song: Song, range?: { readonly from: number; readonly to: number }): Placed[] =>
  range === undefined ? [...song.arrangement.placed] : sectionsIn(song, range.from, range.to);

/**
 * A PART SAID IN OR OUT of the sections a range covers. The arrangement
 * decides who plays from what the record has done and draws nothing for it,
 * so this pins the two chances `arrange.ts` holds at zero for exactly this:
 * `in` adds the part to the section's roster after the roster is final, `out`
 * takes it off unless it is the last one standing. The material the section
 * plays is built for whoever is heard, so a part said in is written, not just
 * unmuted — and everything written from it follows, as always.
 */
export function setPlays(song: Song, role: string, on: boolean, range?: { readonly from: number; readonly to: number }): Edit[] {
  if (!(ROLES as readonly string[]).includes(role)) throw new Error(`no part "${role}" (parts: ${ROLES.join(", ")})`);
  const placed = sectionsOf(song, range);
  if (placed.length === 0) throw new Error("no section in that range");
  const out: Edit[] = placed.map((p) => ({ at: `arrange/section/${p.section.index}/${role}/${on ? "in" : "out"}`, value: true }));
  // and it has to have happened somewhere, or it is a knob that does nothing:
  // a part said out of a section it is the last one standing in stays
  const made = again(song, out);
  const took = placed.some((p) => {
    const q = made.arrangement.placed.find((x) => x.section.index === p.section.index);
    return q !== undefined && p.heard.has(role as Role) !== on && q.heard.has(role as Role) === on;
  });
  if (!took) throw new Error(on ? `the ${role} is already in there` : `the ${role} is the last part standing there, and a section of nothing is not an arrangement`);
  return out;
}

/**
 * A PART'S JOB, SAID: the element it serves and the texture it lays it out in,
 * for the materials a range plays. The draw is the arrangement's own, at
 * `element/<key>/<part>:element` and `:texture` — or `element/character` for
 * the protagonist, whose job is drawn once for the whole record — and a pin
 * is honoured only where the draw site could have drawn it: an element the
 * room has no place for, or a texture the element forbids (`LEGAL_TEXTURES`),
 * stands as drawn. This checks the record it made and refuses a pin that
 * changed nothing, because a knob that does nothing is this program's
 * cardinal sin.
 */
export function setJob(
  song: Song, role: string, element: string | null, texture: string | null,
  range?: { readonly from: number; readonly to: number },
): Edit[] {
  if (!(PITCHED_ROLES as readonly string[]).includes(role)) throw new Error(`no pitched part "${role}" (parts: ${PITCHED_ROLES.join(", ")})`);
  if (role === "lead") throw new Error("the lead's job is the tune, and it is not a draw");
  if (element !== null && !(ELEMENTS as readonly string[]).includes(element)) throw new Error(`no element "${element}" (elements: ${ELEMENTS.join(", ")})`);
  if (texture !== null && !(TEXTURES as readonly string[]).includes(texture)) throw new Error(`no texture "${texture}" (textures: ${TEXTURES.join(", ")})`);
  if (element === null && texture === null) throw new Error("nothing to set: name an element, a texture, or both");
  // the seat's own pools: a pin chooses among what the genre offers the seat
  const seat = song.chart.genre[role as PitchedRole];
  const elements = seat.element.filter(([e, w]) => w > 0 && e !== "lead").map(([e]) => e);
  const textures = seat.texture.filter(([, w]) => w > 0).map(([t]) => t);
  if (element !== null && !(elements as readonly string[]).includes(element)) {
    throw new Error(`the ${song.chart.genre.name} ${role} never serves the ${element} (it serves: ${elements.join(", ")})`);
  }
  if (texture !== null && !(textures as readonly string[]).includes(texture)) {
    throw new Error(`the ${song.chart.genre.name} ${role} never plays ${texture} (it plays: ${textures.join(", ")})`);
  }
  if (element !== null && texture !== null && !LEGAL_TEXTURES[element as Element].includes(texture as Texture)) {
    throw new Error(`a ${element} cannot be ${texture} (it can be: ${LEGAL_TEXTURES[element as Element].join(", ")})`);
  }
  const star = song.arrangement.protagonist === role;
  const keys = star ? ["character"] : [...new Set(sectionsOf(song, range).map((p) => p.material))];
  const out: Edit[] = [];
  for (const key of keys) {
    if (element !== null) out.push({ at: `element/${key}/${role}:element`, value: element });
    if (texture !== null) out.push({ at: `element/${key}/${role}:texture`, value: texture });
  }
  // and the pin has to have landed, or it is a knob that does nothing
  const made = again(song, out);
  const heard = sectionsOf(made, range);
  const took = heard.some((p) =>
    (element === null || p.elements[role as Role] === element) && (texture === null || p.textures[role as Role] === texture));
  if (!took) {
    const now = heard[0];
    const was = now === undefined ? "" : ` (it is the ${now.elements[role as Role]}, ${now.textures[role as Role]})`;
    throw new Error(`the ${role} cannot be ${[element, texture].filter((x) => x !== null).join(" ")} there: the room has no place for it${was}`);
  }
  return out;
}

/** The drums' figure by name, for the materials a range plays, from the ones the genre offers. A variant plays its plain statement's figure, so the plain is what is pinned. */
export function setFigure(song: Song, name: string, range?: { readonly from: number; readonly to: number }): Edit[] {
  const offered = song.chart.genre.drums.figure.filter(([, w]) => w > 0).map(([f]) => f);
  if (!offered.includes(name)) throw new Error(`no figure "${name}" in this genre (offers: ${offered.join(", ")})`);
  const ideas = [...new Set(sectionsOf(song, range).map((p) => p.section.idea))];
  if (ideas.length === 0) throw new Error("no section in that range");
  return ideas.map((idea) => ({ at: `material/${idea}/0/drums/figure`, value: name }));
}

/** The record's main character, said: the part the arrangement is written around. From the genre's own pool. */
export function setProtagonist(song: Song, role: string): Edit {
  const offered = song.chart.genre.arrangement.protagonist.filter(([, w]) => w > 0).map(([r]) => r);
  if (!(offered as readonly string[]).includes(role)) throw new Error(`no protagonist "${role}" in this genre (offers: ${offered.join(", ")})`);
  if (song.arrangement.protagonist === role) throw new Error(`the ${role} is the protagonist already`);
  return { at: "arrange/protagonist", value: role };
}

/** The way in, said: which kind of intro the record opens with. From the genre's own pool, and only a kind that can carry the protagonist is honoured. */
export function setIntro(song: Song, kind: string): Edit {
  const offered = song.chart.genre.arrangement.intro.filter(([, w]) => w > 0).map(([k]) => k);
  if (!(INTRO_KINDS as readonly string[]).includes(kind) || !(offered as readonly string[]).includes(kind)) {
    throw new Error(`no intro "${kind}" in this genre (offers: ${offered.join(", ")})`);
  }
  if (song.arrangement.intro === kind) throw new Error(`the record opens on a ${kind} intro already`);
  const edit: Edit = { at: "arrange/intro", value: kind };
  // only a kind that can carry the protagonist is drawn, so the pin is
  // honoured only there: a hook intro introduces a tune, not a drum kit
  if (again(song, [edit]).arrangement.intro !== kind) {
    throw new Error(`a ${kind} intro cannot introduce the ${song.arrangement.protagonist}, which is this record's protagonist (say the protagonist first)`);
  }
  return edit;
}

/**
 * THE DESK IN THE RECIPE. A hand on the page's console is a render-time
 * override laid over the record's own desk (`RenderOptions.desk`), not an
 * edit: it changes no note and no draw. It still belongs in the recipe, or a
 * mix worth keeping is lost the moment the page is reloaded. A desk word is
 * `desk.<path>=<value>` — `desk.mix.keys.level=0.8`, `desk.machine.kit=analog`
 * — and a list of them is one `SoundSpec`.
 */
export function parseDeskWord(word: string): { readonly path: readonly string[]; readonly value: number | string | boolean } {
  const m = /^desk\.([a-zA-Z0-9_.]+)=(.+)$/.exec(word);
  if (m === null) throw new Error(`not a desk word: "${word}" (want desk.<path>=<value>, e.g. desk.mix.keys.level=0.8)`);
  const raw = m[2]!;
  const value = raw === "true" ? true : raw === "false" ? false : raw.trim() !== "" && Number.isFinite(Number(raw)) ? Number(raw) : raw;
  return { path: m[1]!.split("."), value };
}

/** Desk words laid into one override, later words winning. */
export function deskOf(words: readonly string[]): SoundSpec {
  const out: Record<string, unknown> = {};
  for (const w of words) {
    const { path, value } = parseDeskWord(w);
    let o = out;
    for (let i = 0; i + 1 < path.length; i++) {
      const k = path[i]!;
      if (typeof o[k] !== "object" || o[k] === null) o[k] = {};
      o = o[k] as Record<string, unknown>;
    }
    o[path[path.length - 1]!] = value;
  }
  return out as SoundSpec;
}

/** The reverse: an override as desk words, one per leaf, in a stable order. */
export function deskWords(desk: SoundSpec | undefined): string[] {
  const out: string[] = [];
  const walk = (o: unknown, path: string[]): void => {
    if (o === null || o === undefined) return;
    if (typeof o === "object") {
      for (const k of Object.keys(o as Record<string, unknown>).sort()) walk((o as Record<string, unknown>)[k], [...path, k]);
    } else if (typeof o === "number" || typeof o === "string" || typeof o === "boolean") out.push(`desk.${path.join(".")}=${String(o)}`);
  };
  walk(desk, []);
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
    const vp = /^chart\/voice\/([a-z]+)$/.exec(edit.at);
    if (vp !== null) return `${vp[1]} played on the ${String(edit.value)}`;
    if (edit.at === "arrange/protagonist") return `the ${String(edit.value)} is the protagonist`;
    if (edit.at === "arrange/intro") return `a ${String(edit.value)} intro`;
    const pl = /^arrange\/section\/(\d+)\/([a-z]+)\/(in|out)$/.exec(edit.at);
    if (pl !== null) {
      const s = song.form.sections[Number(pl[1])];
      const where = s === undefined ? `section ${pl[1]}` : `${s.fn} at bar ${s.startBar}`;
      return `${pl[2]} ${pl[3]} · ${where}`;
    }
    const jb = /^element\/([^/]+)\/([a-z]+):(element|texture)$/.exec(edit.at);
    if (jb !== null) {
      const where = jb[1] === "character" ? "everywhere, as the protagonist" : `${jb[1]} · bars ${runsText(barsOf(song, jb[1]!))}`;
      return `${jb[2]} ${jb[3] === "element" ? "serves the" : "plays"} ${String(edit.value)} · ${where}`;
    }
    const fg = /^material\/([^/]+)\/0\/drums\/figure$/.exec(edit.at);
    if (fg !== null) return `drums play the ${String(edit.value)} figure · ${fg[1]} · bars ${runsText(barsOf(song, fg[1]!))}`;
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
  if (edit.at === "chart/voice") return `voices rerolled${times}`;
  if (edit.at === "element") return `every seat's job rerolled${times}`;
  const ej = /^element\/([^/]+)$/.exec(edit.at);
  if (ej !== null) return `jobs · ${ej[1]} · bars ${runsText(barsOf(song, ej[1]!))}${times}`;
  if (edit.at === "arrange") return `arrangement rerolled${times}`;
  if (edit.at === "arrange/treat") return `desk moves rerolled${times}`;
  const et = /^arrange\/treat\/(\d+)$/.exec(edit.at);
  if (et !== null) {
    const s = song.form.sections[Number(et[1])];
    return `desk moves · ${s === undefined ? `section ${et[1]}` : `${s.fn} at bar ${s.startBar}`}${times}`;
  }
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

/** `16-32` at the end of a value, as a range, or nothing. */
function rangeOf(value: string): { readonly rest: string; readonly range?: { from: number; to: number } } {
  const m = /^(.*?):(\d+)-(\d+)$/.exec(value);
  if (m === null) return { rest: value };
  const from = Number(m[2]), to = Number(m[3]);
  if (to <= from) throw new Error(`bad bar range "${m[2]}-${m[3]}" (want from-to, e.g. 16-32)`);
  return { rest: m[1]!, range: { from, to } };
}

const SET_WORDS = "tempo, key, mode, voice.<part>, play.<part>=in|out[:from-to], job.<part>=<element>[/<texture>][:from-to], figure=<name>[:from-to], protagonist, intro";

/**
 * `tempo=92`, `key=D`, `mode=dorian`, `voice.counter=horns`, `play.drone=in:16-32`,
 * `job.keys=rhythm/arp:16-32`, `figure=amen`, `protagonist=keys`, `intro=hook` —
 * a setting as a command-line word, applied to this record.
 */
export function setWord(song: Song, word: string): Edit[] {
  const eq = word.indexOf("=");
  const what = eq < 0 ? word : word.slice(0, eq);
  const value = eq < 0 ? "" : word.slice(eq + 1);
  if (what === "tempo") return [setTempo(song, Number(value))];
  if (what === "key") return [setKey(song, value)];
  if (what === "mode") return [setMode(song, value)];
  if (what === "protagonist") return [setProtagonist(song, value)];
  if (what === "intro") return [setIntro(song, value)];
  const v = /^voice\.([a-z]+)$/.exec(what);
  if (v !== null) return [setVoice(song, v[1]!, value)];
  const p = /^play\.([a-z]+)$/.exec(what);
  if (p !== null) {
    const { rest, range } = rangeOf(value);
    if (rest !== "in" && rest !== "out") throw new Error(`play.${p[1]} wants in or out, not "${rest}"`);
    return setPlays(song, p[1]!, rest === "in", range);
  }
  const j = /^job\.([a-z]+)$/.exec(what);
  if (j !== null) {
    const { rest, range } = rangeOf(value);
    const [el, tx] = rest.split("/");
    return setJob(song, j[1]!, el === undefined || el === "" || el === "-" ? null : el, tx === undefined || tx === "" || tx === "-" ? null : tx, range);
  }
  if (what === "figure") {
    const { rest, range } = rangeOf(value);
    return setFigure(song, rest, range);
  }
  throw new Error(`nothing to set called "${what}" (${SET_WORDS})`);
}
