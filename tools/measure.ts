/**
 * THE MEASUREMENTS — the record read back out of its own MIDI file.
 *
 * Deliberately not written against the program's own objects. It composes a
 * record, writes the bytes a sequencer would open, PARSES THOSE BYTES BACK,
 * and reports what is in them: one part drawn as a grid of characters, and a
 * report on the tune measured off the notes it found. Nothing here can see a
 * variable inside the builders. If a claim about the melody is not true of
 * the file, it does not show up here as true — which is why the melody and
 * intro research was measured with this.
 *
 * THIS IS NOT THE PIANO ROLL, and the grid it draws is not one. It shows ONE
 * part, in a window of bars, with no sections, no arrangement and no drums.
 * The piano roll is `npm run roll` (tools/roll.mjs), it is the main test, and
 * docs/THE-PIANO-ROLL.md says how to read it. What THIS is for is counting,
 * which no picture can do.
 *
 *   node tools/measure.ts lofi 42                    the lead, eight bars, and the report
 *   node tools/measure.ts lofi 42 --part bass        another part
 *   node tools/measure.ts lofi 42 --from 16 --bars 16
 *   node tools/measure.ts lofi 42 --report           the report alone
 *   node tools/measure.ts --file out.mid             any .mid file, ours or not
 *   node tools/measure.ts lofi 42 --map              who plays which bar, and how the record opens
 *   node tools/measure.ts lofi 42 --json            the parsed notes and the numbers, unformatted
 *   node tools/measure.ts --sweep lofi 1 20          the report's numbers over twenty seeds
 *   node tools/measure.ts --sweep lofi 1 20 --map    the opening numbers over twenty seeds
 *   node tools/measure.ts --sweep lofi 1 20 --parts  what becomes of each part: share, longest absence, at the end
 *
 * What this cannot see, and what sees it instead: a part's STALENESS — how
 * many turns it plays identically before anything about it changes — is made
 * of the desk, a part held back and the kit in half time, none of which the
 * file carries. `tools/stale.ts` reads the composed record for that.
 *
 * WHAT THE REPORT MEASURES, and why each number is here rather than another:
 *
 *   RANGE and TESSITURA        a tune is small: the statistical universals of
 *                              music include "small intervals" and a limited
 *                              pitch set (Savage et al. 2015, PNAS 112).
 *   STEP / LEAP                 stepwise motion is the preferred motion in
 *                              every repertoire measured; a line that leaps
 *                              more than it steps is an arpeggio.
 *   POST-SKIP REVERSAL          "any large melodic leap will be followed by a
 *                              reversal of pitch direction approximately 70%
 *                              of the time" (Huron, Sweet Anticipation).
 *   GAP FILL                    after a leap, how much of the gap the line
 *                              walks back through — Meyer's gap-fill, the
 *                              implication a large interval makes.
 *   PHRASE CONTOUR              each phrase reduced to its first pitch, the
 *                              mean of the middle, and its last (Huron 1996,
 *                              "The Melodic Arch in Western Folksongs"): arch,
 *                              descending, ascending, concave, flat.
 *   CLIMAX                      "many melodies have a single highest note,
 *                              usually at or near the end" (Burns 1987).
 *   HOOK                        the longest figure — a run of intervals with
 *                              its rhythm — that the tune says more than once,
 *                              and how much of the tune is inside a repeat of
 *                              it. A hook is "a memorable catch phrase or
 *                              melody line which is repeated" (Burns 1987).
 *                              Counted in SCALE STEPS, on a ladder read off
 *                              the part's own pitches: a figure moved a step
 *                              up the scale is the same figure — "transposing
 *                              the motive to another pitch level in a stepwise
 *                              manner" is a sequence, and a listener hears the
 *                              shape, not the semitones. Counted in semitones
 *                              a tonal sequence reads as two unrelated
 *                              figures, which is how this tool first reported
 *                              that a program full of them had no hooks.
 *   SIGNATURE LEAP              how many intervals are wider than a perfect
 *                              fifth: "any interval larger than a perfect
 *                              fifth seems distinctive" (Burns 1987).
 *   OFF THE GRID                mean absolute distance from the written step,
 *                              in milliseconds — the micro-timing the file
 *                              carries and a quantised export would lose.
 */

import { readFileSync } from "node:fs";
import { GENRE_NAMES, type GenreName } from "../src/genre/index.ts";
import { compose } from "../src/song.ts";
import { midi } from "../src/sound/midi.ts";

// ── reading a standard MIDI file ─────────────────────────────────────────────

interface MidiNote {
  readonly track: string;
  readonly tick: number;
  readonly ticks: number;
  readonly key: number;
  readonly vel: number;
}

interface MidiFile {
  readonly ppq: number;
  readonly bpm: number;
  readonly beats: number;
  readonly title: string;
  readonly notes: readonly MidiNote[];
  readonly tracks: readonly string[];
}

function readMidi(data: Uint8Array): MidiFile {
  let p = 0;
  const str = (n: number): string => {
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(data[p + i]!);
    p += n;
    return s;
  };
  const u32 = (): number => {
    const v = (data[p]! << 24) | (data[p + 1]! << 16) | (data[p + 2]! << 8) | data[p + 3]!;
    p += 4;
    return v >>> 0;
  };
  const u16 = (): number => {
    const v = (data[p]! << 8) | data[p + 1]!;
    p += 2;
    return v;
  };
  if (str(4) !== "MThd") throw new Error("not a MIDI file");
  u32();
  u16(); // format
  const ntracks = u16();
  const ppq = u16();

  let bpm = 120;
  let beats = 4;
  let title = "";
  const notes: MidiNote[] = [];
  const tracks: string[] = [];

  for (let t = 0; t < ntracks; t++) {
    if (str(4) !== "MTrk") throw new Error("track expected");
    const len = u32();
    const end = p + len;
    let tick = 0;
    let name = `track ${t}`;
    let status = 0;
    const open = new Map<number, { tick: number; vel: number }>();
    while (p < end) {
      // delta, as a variable-length quantity
      let delta = 0;
      for (;;) {
        const b = data[p++]!;
        delta = (delta << 7) | (b & 0x7f);
        if ((b & 0x80) === 0) break;
      }
      tick += delta;
      let b = data[p]!;
      if (b >= 0x80) { status = b; p++; } else b = status; // running status
      const kind = status & 0xf0;
      if (status === 0xff) {
        const type = data[p++]!;
        let n = 0;
        for (;;) {
          const c = data[p++]!;
          n = (n << 7) | (c & 0x7f);
          if ((c & 0x80) === 0) break;
        }
        const body = data.subarray(p, p + n);
        p += n;
        if (type === 0x03) { const s = String.fromCharCode(...body); if (t === 0) title = s; else name = s; }
        if (type === 0x51) bpm = 60000000 / ((body[0]! << 16) | (body[1]! << 8) | body[2]!);
        if (type === 0x58) beats = body[0]!;
      } else if (status === 0xf0 || status === 0xf7) {
        let n = 0;
        for (;;) {
          const c = data[p++]!;
          n = (n << 7) | (c & 0x7f);
          if ((c & 0x80) === 0) break;
        }
        p += n;
      } else if (kind === 0x90 || kind === 0x80) {
        const key = data[p++]!;
        const vel = data[p++]!;
        if (kind === 0x90 && vel > 0) open.set(key, { tick, vel });
        else {
          const on = open.get(key);
          if (on !== undefined) {
            open.delete(key);
            notes.push({ track: name, tick: on.tick, ticks: Math.max(1, tick - on.tick), key, vel: on.vel });
          }
        }
      } else if (kind === 0xc0 || kind === 0xd0) p += 1;
      else p += 2;
    }
    p = end;
    if (t > 0) tracks.push(name);
  }
  notes.sort((a, b) => a.tick - b.tick || a.key - b.key);
  return { ppq, bpm, beats, title, notes, tracks };
}

// ── the character grid ──────────────────────────────────────────────────────

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const noteName = (k: number): string => `${NAMES[k % 12]}${Math.floor(k / 12) - 1}`;

/** Sixteen steps to the bar, which is what this program writes in. */
const PER_BEAT = 4;

function grid(file: MidiFile, notes: readonly MidiNote[], fromBar: number, bars: number): string {
  const perBar = file.beats * PER_BEAT;
  const stepTicks = file.ppq / PER_BEAT;
  const step = (tick: number): number => Math.round(tick / stepTicks);
  const first = fromBar * perBar;
  const last = first + bars * perBar;
  const inside = notes.filter((n) => step(n.tick) >= first && step(n.tick) < last);
  if (inside.length === 0) return "  (nothing in these bars)";
  const keys = [...new Set(inside.map((n) => n.key))].sort((a, b) => b - a);
  const lines: string[] = [];
  const ruler = Array.from({ length: bars * perBar }, (_, i) => (i % perBar === 0 ? "|" : i % PER_BEAT === 0 ? "'" : " ")).join("");
  lines.push(`      ${ruler}`);
  for (const key of keys) {
    const row = new Array<string>(bars * perBar).fill("·");
    for (let i = 0; i < row.length; i++) if ((first + i) % perBar === 0) row[i] = "|";
    for (const n of inside.filter((n) => n.key === key)) {
      const at = step(n.tick) - first;
      const held = Math.max(1, Math.round(n.ticks / stepTicks));
      for (let i = 0; i < held && at + i < row.length; i++) if (at + i >= 0) row[at + i] = i === 0 ? "#" : "=";
    }
    lines.push(`${noteName(key).padStart(4)}  ${row.join("")}`);
  }
  const barNums = Array.from({ length: bars }, (_, i) => String(fromBar + i).padEnd(perBar)).join("");
  lines.push(`      ${barNums}`);
  return lines.join("\n");
}

// ── the report ───────────────────────────────────────────────────────────────

/** One phrase of the tune: the notes inside a window of bars. */
interface Phrase {
  readonly pitches: readonly number[];
}

/** Huron's three-point reduction: first, the mean of the middle, last. */
function shapeOf(p: Phrase): string {
  const ns = p.pitches;
  if (ns.length < 3) return "short";
  const first = ns[0]!;
  const last = ns[ns.length - 1]!;
  const mid = ns.slice(1, -1).reduce((a, v) => a + v, 0) / (ns.length - 2);
  const up = (a: number, b: number): number => (b - a > 0.5 ? 1 : b - a < -0.5 ? -1 : 0);
  const a = up(first, mid);
  const b = up(mid, last);
  if (a > 0 && b < 0) return "arch";
  if (a < 0 && b > 0) return "concave";
  if (a >= 0 && b >= 0 && last > first) return "ascending";
  if (a <= 0 && b <= 0 && last < first) return "descending";
  return "flat";
}

/**
 * THE HOOK, as the file shows it: the longest figure the tune states more than
 * once, where a figure is a run of intervals with its own rhythm. Transposed
 * repeats count — a sequence is the same figure moved — because what an ear
 * holds is the shape, not the pitch.
 */
function hookOf(notes: readonly MidiNote[], stepTicks: number, ladder?: readonly number[]): { len: number; times: number; cover: number } {
  const n = notes.length;
  if (n < 4) return { len: 0, times: 0, cover: 0 };
  // the rungs this part stands on, read off the part itself
  const rungs = ladder ?? [...new Set(notes.map((x) => x.key))].sort((a, b) => a - b);
  const rung = (key: number): number => {
    const i = rungs.indexOf(key);
    return i >= 0 ? i : key;
  };
  // EACH ONSET IS QUANTISED ON ITS OWN, and the gaps are taken from the
  // quantised positions. Taking the gap from the raw ticks and rounding THAT
  // measures the micro-timing as well as the rhythm: swing and jitter move
  // each end of a gap by up to half a step, so the same figure played twice
  // comes back with different gaps and a repeat reads as two different
  // figures. It read every hook this program wrote as no hook at all.
  const at = notes.map((x) => Math.round(x.tick / stepTicks));
  // a figure of k onsets is k-1 intervals and k-1 gaps
  const sig = (i: number, k: number): string => {
    const parts: string[] = [];
    for (let j = 0; j < k - 1; j++) {
      const d = rung(notes[i + j + 1]!.key) - rung(notes[i + j]!.key);
      const gap = at[i + j + 1]! - at[i + j]!;
      parts.push(`${d}@${gap}`);
    }
    return parts.join(",");
  };
  let best = { len: 0, times: 0, cover: 0 };
  for (let k = Math.min(8, n); k >= 3; k--) {
    const seen = new Map<string, number[]>();
    for (let i = 0; i + k <= n; i++) {
      const s = sig(i, k);
      (seen.get(s) ?? seen.set(s, []).get(s)!).push(i);
    }
    for (const [, at] of seen) {
      if (at.length < 2) continue;
      // how many onsets are inside some statement of this figure, without
      // counting an onset twice where two statements overlap
      const covered = new Set<number>();
      for (const i of at) for (let j = 0; j < k; j++) covered.add(i + j);
      const cover = covered.size / n;
      if (k > best.len || (k === best.len && cover > best.cover)) best = { len: k, times: at.length, cover };
    }
    if (best.len > 0) break;
  }
  return best;
}

/**
 * WHAT THE FILE SAYS ABOUT THE TUNE, as numbers.
 *
 * Every field here is computed from the parsed note list — `{tick, ticks, key,
 * vel}` read out of the bytes — and nothing here can see the character grid,
 * is a printout of the same array and not an input to anything. `report()`
 * below formats these; `--json` hands them out unformatted so a drawing can be
 * made of the same numbers rather than of a picture of them.
 */
interface Measured {
  readonly notes: number;
  readonly lo: number;
  readonly hi: number;
  readonly median: number;
  readonly step: number;
  readonly leap: number;
  readonly held: number;
  readonly wide: number;
  readonly widest: number;
  readonly moves: number;
  readonly skips: number;
  readonly reversed: number;
  readonly filled: number;
  readonly phrases: number;
  readonly shapes: Readonly<Record<string, number>>;
  readonly top: number;
  readonly topTimes: number;
  readonly topAt: readonly number[];
  readonly peakAlone: number;
  readonly peakAt: number;
  readonly hook: { readonly len: number; readonly times: number; readonly cover: number };
  readonly restating: number;
  readonly offGrid: number;
}

function measure(file: MidiFile, notes: readonly MidiNote[]): Measured {
  const stepTicks = file.ppq / PER_BEAT;
  const perBar = file.beats * PER_BEAT;
  const secPerTick = 60 / file.bpm / file.ppq;
  const keys = notes.map((n) => n.key);
  const lo = Math.min(...keys);
  const hi = Math.max(...keys);
  const median = [...keys].sort((a, b) => a - b)[Math.floor(keys.length / 2)]!;

  // one line at a time: intervals between successive onsets
  const iv: number[] = [];
  for (let i = 1; i < notes.length; i++) iv.push(notes[i]!.key - notes[i - 1]!.key);
  const steps = iv.filter((d) => Math.abs(d) > 0 && Math.abs(d) <= 2).length;
  const leaps = iv.filter((d) => Math.abs(d) >= 3).length;
  const held = iv.filter((d) => d === 0).length;
  const wide = iv.filter((d) => Math.abs(d) > 7).length;
  const widest = iv.reduce((a, d) => Math.max(a, Math.abs(d)), 0);

  // post-skip reversal, and how much of the gap the reversal walks back
  let skips = 0;
  let reversed = 0;
  let filled = 0;
  for (let i = 0; i + 1 < iv.length; i++) {
    if (Math.abs(iv[i]!) < 3) continue;
    skips++;
    if (Math.sign(iv[i + 1]!) === -Math.sign(iv[i]!)) {
      reversed++;
      // how far back through the gap the line walks before turning again
      let back = 0;
      for (let j = i + 1; j < iv.length && Math.sign(iv[j]!) === -Math.sign(iv[i]!); j++) back += Math.abs(iv[j]!);
      filled += Math.min(1, back / Math.abs(iv[i]!));
    }
  }

  // phrases: two bars, which is what this program writes a phrase in
  const phrases: Phrase[] = [];
  const lastBar = Math.floor(notes[notes.length - 1]!.tick / (perBar * stepTicks));
  for (let b = 0; b <= lastBar; b += 2) {
    const inside = notes.filter((n) => {
      const bar = Math.floor(n.tick / (perBar * stepTicks));
      return bar >= b && bar < b + 2;
    });
    if (inside.length > 0) phrases.push({ pitches: inside.map((n) => n.key) });
  }
  const shapes = new Map<string, number>();
  for (const ph of phrases) shapes.set(shapeOf(ph), (shapes.get(shapeOf(ph)) ?? 0) + 1);

  const top = Math.max(...keys);
  const tops = notes.filter((n) => n.key === top);
  const where = tops.map((n) => (n.tick / (notes[notes.length - 1]!.tick || 1)));
  // AND THE PEAK OF EACH PHRASE, which is the number a tiled loop cannot
  // blur: the record's own top note comes round every time the tune does, so
  // counting it across a record measures the tiling. Inside one phrase it
  // measures the tune.
  let alone = 0;
  let peakAt = 0;
  for (const ph of phrases) {
    const hi = Math.max(...ph.pitches);
    if (ph.pitches.filter((p) => p === hi).length === 1) alone++;
    peakAt += ph.pitches.indexOf(hi) / Math.max(1, ph.pitches.length - 1);
  }

  const ladder = [...new Set(notes.map((x) => x.key))].sort((a, b) => a - b);
  const hook = hookOf(notes, stepTicks, ladder);
  // AND THE HOOK INSIDE ONE PHRASE, which is the one the tiling cannot fake:
  // a loop repeated is repetition by construction, but a figure said twice
  // INSIDE two bars is the tune repeating itself while it is still speaking.
  let withRepeat = 0;
  for (let b = 0; b <= lastBar; b += 2) {
    const inside = notes.filter((n) => {
      const bar = Math.floor(n.tick / (perBar * stepTicks));
      return bar >= b && bar < b + 2;
    });
    if (inside.length >= 4 && hookOf(inside, stepTicks, ladder).len >= 3) withRepeat++;
  }

  // how far off the written grid the notes actually land
  const off = notes.map((n) => Math.abs(n.tick - Math.round(n.tick / stepTicks) * stepTicks) * secPerTick * 1000);
  const meanOff = off.reduce((a, v) => a + v, 0) / off.length;

  return {
    notes: notes.length,
    lo, hi, median,
    step: steps, leap: leaps, held, wide, widest, moves: iv.length,
    skips, reversed, filled: filled / Math.max(1, reversed),
    phrases: phrases.length,
    shapes: Object.fromEntries(shapes),
    top, topTimes: tops.length, topAt: where,
    peakAlone: alone, peakAt: peakAt / Math.max(1, phrases.length),
    hook,
    restating: withRepeat,
    offGrid: meanOff,
  };
}

function report(file: MidiFile, notes: readonly MidiNote[], part: string): string {
  if (notes.length === 0) return `  ${part}: no notes`;
  const m = measure(file, notes);
  const L: string[] = [];
  const pct = (a: number, b: number): string => (b === 0 ? "  — " : `${((100 * a) / b).toFixed(0).padStart(3)}%`);
  L.push(`  notes ${String(m.notes).padStart(4)}   range ${noteName(m.lo)}–${noteName(m.hi)} (${m.hi - m.lo} semitones)   median ${noteName(m.median)}`);
  L.push(`  motion        step ${pct(m.step, m.moves)}   leap ${pct(m.leap, m.moves)}   held ${pct(m.held, m.moves)}   widest ${m.widest} semitones`);
  L.push(`  after a leap  reversal ${pct(m.reversed, m.skips)} of ${m.skips}   gap filled ${m.skips === 0 ? "  — " : `${(100 * m.filled).toFixed(0)}%`}`);
  L.push(`  phrases ${String(m.phrases).padStart(3)}   ${Object.entries(m.shapes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("   ")}`);
  L.push(`  climax        ${noteName(m.top)} sounds ${m.topTimes}× across the record, at ${m.topAt.map((w) => `${(w * 100).toFixed(0)}%`).join(" ")}`);
  L.push(`  phrase peak   sounds once in ${m.peakAlone} of ${m.phrases} phrases, on average ${(100 * m.peakAt).toFixed(0)}% through the phrase`);
  L.push(`  hook          ${m.hook.len === 0 ? "none: no figure is stated twice" : `${m.hook.len} notes, stated ${m.hook.times}×, covering ${(m.hook.cover * 100).toFixed(0)}% of the line`}`);
  L.push(`  inside a phrase ${m.restating} of ${m.phrases} phrases restate a figure of their own`);
  L.push(`  signature     ${m.wide} intervals wider than a fifth (${pct(m.wide, m.moves)} of moves)`);
  L.push(`  off the grid  ${m.offGrid.toFixed(1)} ms mean`);
  return L.join("\n");
}

// ── the map: who is playing, bar by bar ──────────────────────────────────────

/** Every part with notes in the file, in the order the grid writes tracks. */
const partsOf = (file: MidiFile): string[] => [...new Set(file.notes.map((n) => n.track.split(" ")[0]!))];

interface Opening {
  readonly bars: number;
  /** Which parts sound in each bar. */
  readonly grid: ReadonlyMap<string, boolean[]>;
  /** The bar each part first sounds in. */
  readonly entry: ReadonlyMap<string, number>;
  /** The parts that sound in the record's first bar. */
  readonly openers: readonly string[];
  /** The first bar in which every part that ever plays is playing. */
  readonly tutti: number;
  /** How many bars the record runs before a part beyond the openers arrives. */
  readonly alone: number;
}

function openingOf(file: MidiFile): Opening {
  const perBar = file.beats * PER_BEAT * (file.ppq / PER_BEAT);
  const bars = Math.max(1, Math.ceil((Math.max(...file.notes.map((n) => n.tick + n.ticks)) + 1) / perBar));
  const parts = partsOf(file);
  const grid = new Map<string, boolean[]>();
  const entry = new Map<string, number>();
  for (const part of parts) {
    const row = new Array<boolean>(bars).fill(false);
    for (const n of file.notes) {
      if (!n.track.startsWith(part)) continue;
      // a note SOUNDS through the bars it is held over, which is how a drone
      // that is struck once is present for four bars rather than one
      const from = Math.floor(n.tick / perBar);
      const to = Math.min(bars - 1, Math.floor((n.tick + n.ticks - 1) / perBar));
      for (let b = Math.max(0, from); b <= to; b++) row[b] = true;
      if (!entry.has(part) || from < entry.get(part)!) entry.set(part, Math.max(0, from));
    }
    grid.set(part, row);
  }
  const openers = parts.filter((p) => grid.get(p)![0] === true);
  let tutti = -1;
  for (let b = 0; b < bars && tutti < 0; b++) if (parts.every((p) => grid.get(p)![b])) tutti = b;
  let alone = 0;
  for (let b = 0; b < bars; b++) {
    const here = parts.filter((p) => grid.get(p)![b]);
    if (here.length === openers.length && here.every((p) => openers.includes(p))) alone = b + 1;
    else break;
  }
  return { bars, grid, entry, openers, tutti, alone };
}

/**
 * WHAT THE OPENING IS, read off the file.
 *
 * An intro "establishes the tempo and basic rhythmic structure, establishes
 * the key, establishes the mood" (secretsofsongwriting.com, "Song Intros:
 * Making them Relevant and Enticing"), and the record's own numbers for that
 * are: who is playing in bar one, how long they hold the record alone, when
 * everybody is finally in — "the moment of the rhythmic hook in these records
 * comes when the introduction finally ends and the main rhythm kicks in"
 * (Burns 1987) — and whether what opened the record is ever exposed again.
 */
function mapOf(file: MidiFile): string {
  const o = openingOf(file);
  const parts = partsOf(file);
  const L: string[] = [];
  const ruler = Array.from({ length: o.bars }, (_, b) => (b % 8 === 0 ? "|" : b % 4 === 0 ? "'" : " ")).join("");
  const numbers = Array.from({ length: Math.ceil(o.bars / 8) }, (_, k) => String(k * 8).padEnd(8)).join("");
  L.push(`  bar    ${ruler}`);
  for (const part of parts) {
    const row = o.grid.get(part)!.map((on) => (on ? "#" : "·")).join("");
    L.push(`  ${part.padEnd(6)} ${row}`);
  }
  L.push(`         ${numbers}`);
  L.push("");
  const secPerBar = (60 / file.bpm) * file.beats;
  L.push(`  opens with    ${o.openers.join(" + ")}${o.openers.length === 1 ? " alone" : ""}, for ${o.alone} bar${o.alone === 1 ? "" : "s"} (${(o.alone * secPerBar).toFixed(1)}s)`);
  L.push(`  entries       ${parts.map((p) => `${p} ${o.entry.get(p) ?? "-"}`).join(" · ")}`);
  L.push(`  everyone in   ${o.tutti < 0 ? "never" : `bar ${o.tutti} (${((100 * o.tutti) / o.bars).toFixed(0)}% in, ${(o.tutti * secPerBar).toFixed(1)}s)`}`);
  // and does what opened the record ever stand out again? EXPOSED means a bar
  // where at most two parts sound: what the ear was given first, given again
  // with room round it.
  const exposed: string[] = [];
  for (const opener of o.openers) {
    let at = -1;
    for (let b = o.alone; b < o.bars && at < 0; b++) {
      const here = parts.filter((p) => o.grid.get(p)![b]);
      if (here.includes(opener) && here.length <= 2) at = b;
    }
    exposed.push(`${opener} ${at < 0 ? "never again" : `again at bar ${at}`}`);
  }
  L.push(`  the opener    ${exposed.join(" · ")}`);
  return L.join("\n");
}

// ── the command ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name: string, dflt: number): number => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : dflt;
};
const named = (name: string, dflt: string): string => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1]! : dflt;
};
const takesValue = new Set<number>();
for (const name of ["part", "bars", "from", "seconds", "file"]) {
  const i = args.indexOf(`--${name}`);
  if (i >= 0) takesValue.add(i + 1);
}
const positional = args.filter((a, i) => !a.startsWith("--") && !takesValue.has(i));

const part = named("part", "lead");
const bars = flag("bars", 8);
/** −1 means "wherever this part starts": a window of empty bars proves nothing. */
const fromBar = flag("from", -1);
const reportOnly = args.includes("--report");
const wantsMap = args.includes("--map");
const wantsParts = args.includes("--parts");

function lines(file: MidiFile, part: string, fromBar: number, bars: number, head: string): string {
  const notes = file.notes.filter((n) => n.track.startsWith(part));
  const out: string[] = [head];
  out.push(`  tracks: ${file.tracks.join(", ")}`);
  if (notes.length === 0) {
    out.push(`  no track starts with "${part}"`);
    return out.join("\n");
  }
  if (!reportOnly) {
    const perBar = file.beats * PER_BEAT * (file.ppq / PER_BEAT);
    const opens = fromBar >= 0 ? fromBar : Math.floor(notes[0]!.tick / perBar);
    out.push("");
    out.push(grid(file, notes, opens, bars));
  }
  out.push("");
  out.push(report(file, notes, part));
  return out.join("\n");
}

if (args.includes("--sweep")) {
  // the same numbers over a run of seeds, so a claim is about the program and
  // not about one lucky record
  const [genre, fromArg, toArg] = positional;
  if (genre === undefined || !(GENRE_NAMES as readonly string[]).includes(genre)) {
    process.stderr.write(`usage: node tools/measure.ts --sweep <genre> <first seed> <last seed>\n`);
    process.exit(2);
  }
  const first = Number(fromArg ?? 1);
  const last = Number(toArg ?? 10);
  if (wantsParts) {
    // WHAT BECOMES OF A PART, over a run of seeds. Read off the file, like
    // the map: a part's share of the record's bars, the longest it is ever
    // gone once it has been heard, whether it is playing when the record
    // ends, and whether the part that is present most changes between the
    // record's two halves. The last is the one that says whether the
    // hierarchy MOVES — a record whose most-present part is the same part in
    // both halves has a texture, not a story (Almén, via
    // THE-ARRANGEMENT-AS-STORY.md §8, whose numbers this reproduces).
    const parts = new Map<string, { share: number[]; absent: number[]; atEnd: number; heard: number }>();
    let hierarchyMoved = 0;
    for (let seed = first; seed <= last; seed++) {
      const song = compose({ seed, genre: genre as GenreName });
      const file = readMidi(midi(song));
      const o = openingOf(file);
      const half = Math.floor(o.bars / 2);
      const present = (part: string, from: number, to: number): number => {
        const row = o.grid.get(part)!;
        let n = 0;
        for (let b = from; b < to; b++) if (row[b]) n++;
        return n;
      };
      const most = (from: number, to: number): string =>
        [...o.grid.keys()].reduce((best, p) => (present(p, from, to) > present(best, from, to) ? p : best));
      if (most(0, half) !== most(half, o.bars)) hierarchyMoved++;
      for (const part of partsOf(file)) {
        const row = o.grid.get(part)!;
        const slot = parts.get(part) ?? { share: [], absent: [], atEnd: 0, heard: 0 };
        slot.heard++;
        slot.share.push((100 * present(part, 0, o.bars)) / o.bars);
        // the longest absence, counted only after the part has entered: a
        // part that has not arrived yet is not missing
        let longest = 0, run = 0;
        for (let b = o.entry.get(part) ?? 0; b < o.bars; b++) {
          if (row[b]) { longest = Math.max(longest, run); run = 0; } else run++;
        }
        slot.absent.push(Math.max(longest, run));
        if (row[o.bars - 1]) slot.atEnd++;
        parts.set(part, slot);
      }
    }
    const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
    const max = (xs: number[]): number => xs.reduce((a, b) => Math.max(a, b), 0);
    const n = last - first + 1;
    process.stdout.write(`${"part".padEnd(7)}${"share%".padStart(8)}${"absent".padStart(8)}${"longest".padStart(9)}${"at end%".padStart(9)}   over ${n} seeds\n`);
    for (const [part, s] of parts) {
      process.stdout.write(`${part.padEnd(7)}${mean(s.share).toFixed(0).padStart(8)}${mean(s.absent).toFixed(1).padStart(8)}${String(max(s.absent)).padStart(9)}${((100 * s.atEnd) / s.heard).toFixed(0).padStart(9)}\n`);
    }
    process.stdout.write(`\nthe most-present part changes between halves in ${hierarchyMoved} of ${n} records (${((100 * hierarchyMoved) / n).toFixed(0)}%)\n`);
    process.exit(0);
  }
  if (wantsMap) {
    // THE OPENING, over a run of seeds. Every number is read off the file: who
    // is in bar one, how long they hold it, when everyone is finally in, and
    // whether what opened the record is ever heard with room round it again.
    const rows: (number | string)[][] = [];
    for (let seed = first; seed <= last; seed++) {
      // AT THE GENRE'S OWN LENGTH. A record cut to a fixed number of seconds
      // has a form the genre did not ask for, and the opening is a fact about
      // the record the program actually makes.
      const song = compose({ seed, genre: genre as GenreName });
      const file = readMidi(midi(song));
      const o = openingOf(file);
      const parts = partsOf(file);
      let back = 0;
      for (const opener of o.openers) {
        for (let b = o.alone; b < o.bars; b++) {
          const here = parts.filter((p) => o.grid.get(p)![b]);
          if (here.includes(opener) && here.length <= 2) { back++; break; }
        }
      }
      rows.push([
        seed,
        o.openers.length,
        o.alone,
        o.tutti < 0 ? -1 : o.tutti,
        o.tutti < 0 ? 0 : (100 * o.tutti) / o.bars,
        (100 * back) / Math.max(1, o.openers.length),
        o.openers.join("+"),
      ]);
    }
    const head = ["seed", "opens", "alone", "tutti", "at%", "back%"];
    process.stdout.write(`${head.map((h) => h.padStart(7)).join("")}   who\n`);
    for (const r of rows) {
      process.stdout.write(`${r.slice(0, 6).map((v) => (typeof v === "number" ? (Number.isInteger(v) ? String(v) : v.toFixed(0)) : v).padStart(7)).join("")}   ${r[6]}\n`);
    }
    const mean = (i: number): string => (rows.reduce((a, r) => a + (r[i] as number), 0) / Math.max(1, rows.length)).toFixed(1);
    process.stdout.write(`${"mean".padStart(7)}${[1, 2, 3, 4, 5].map((i) => mean(i).padStart(7)).join("")}\n`);
    process.exit(0);
  }
  const rows: number[][] = [];
  for (let seed = first; seed <= last; seed++) {
    const song = compose({ seed, genre: genre as GenreName, seconds: 90 });
    const file = readMidi(midi(song, { only: part as never }));
    const notes = file.notes.filter((n) => n.track.startsWith(part));
    if (notes.length === 0) continue;
    const stepTicks = file.ppq / PER_BEAT;
    const iv: number[] = [];
    for (let i = 1; i < notes.length; i++) iv.push(notes[i]!.key - notes[i - 1]!.key);
    const ladder = [...new Set(notes.map((x) => x.key))].sort((a, b) => a - b);
    const hook = hookOf(notes, stepTicks, ladder);
    const keys = notes.map((n) => n.key);
    const perBar = file.beats * PER_BEAT;
    const phrases: Phrase[] = [];
    const lastBar = Math.floor(notes[notes.length - 1]!.tick / (perBar * stepTicks));
    for (let b = 0; b <= lastBar; b += 2) {
      const inside = notes.filter((n) => {
        const bar = Math.floor(n.tick / (perBar * stepTicks));
        return bar >= b && bar < b + 2;
      });
      if (inside.length > 0) phrases.push({ pitches: inside.map((n) => n.key) });
    }
    const arches = phrases.filter((p) => shapeOf(p) === "arch" || shapeOf(p) === "descending").length;
    let withRepeat = 0;
    for (let b = 0; b <= lastBar; b += 2) {
      const inside = notes.filter((n) => {
        const bar = Math.floor(n.tick / (perBar * stepTicks));
        return bar >= b && bar < b + 2;
      });
      if (inside.length >= 4 && hookOf(inside, stepTicks, ladder).len >= 3) withRepeat++;
    }
    rows.push([
      seed,
      notes.length,
      Math.max(...keys) - Math.min(...keys),
      (100 * iv.filter((d) => Math.abs(d) >= 3).length) / Math.max(1, iv.length),
      hook.len,
      100 * hook.cover,
      (100 * phrases.filter((ph) => {
        const hi = Math.max(...ph.pitches);
        return ph.pitches.filter((p) => p === hi).length === 1;
      }).length) / Math.max(1, phrases.length),
      (100 * arches) / Math.max(1, phrases.length),
      (100 * withRepeat) / Math.max(1, phrases.length),
      (100 * iv.filter((d) => Math.abs(d) > 7).length) / Math.max(1, iv.length),
    ]);
  }
  const head = ["seed", "notes", "range", "leap%", "hook", "cover%", "peak1%", "arch%", "rest%", "wide%"];
  process.stdout.write(`${head.map((h) => h.padStart(7)).join("")}\n`);
  for (const r of rows) process.stdout.write(`${r.map((v, i) => (i < 3 || i === 4 ? String(v) : v.toFixed(0)).padStart(7)).join("")}\n`);
  const mean = (i: number): string => (rows.reduce((a, r) => a + r[i]!, 0) / Math.max(1, rows.length)).toFixed(1);
  process.stdout.write(`${"mean".padStart(7)}${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => mean(i).padStart(7)).join("")}\n`);
} else if (args.includes("--json")) {
  // THE SAME NOTES, UNFORMATTED. The character grid is a printout and a poor
  // one — and not an ASCII one either: its empty cell is U+00B7 MIDDLE DOT;
  // a drawing wants the array the printout is made from. Nothing new is
  // computed here — this is `readMidi` and `measure` handed out as they are,
  // so a picture built on it is a picture of the file and not of the picture.
  const [genre, seedArg, secondsArg] = positional;
  if (genre === undefined || seedArg === undefined || !(GENRE_NAMES as readonly string[]).includes(genre)) {
    process.stderr.write("usage: node tools/measure.ts <genre> <seed> [seconds] --json\n");
    process.exit(2);
  }
  const song = compose({ seed: Number(seedArg), genre: genre as GenreName, seconds: secondsArg === undefined ? 90 : Number(secondsArg) });
  const file = readMidi(midi(song));
  const o = openingOf(file);
  process.stdout.write(`${JSON.stringify({
    genre, seed: Number(seedArg),
    title: file.title, bpm: file.bpm, beats: file.beats, ppq: file.ppq,
    key: `${song.chart.scaleName} on ${noteName(song.chart.tonic)}`,
    bars: o.bars,
    sections: song.arrangement.placed.map((p) => ({
      fn: p.section.fn,
      idea: p.section.idea,
      bar: p.section.startBar,
      bars: p.section.bars,
      energy: p.section.energy,
      peak: p.section.peak,
      thin: p.thin,
      broken: p.broken,
      heard: [...p.heard],
    })),
    parts: partsOf(file).map((name) => {
      const ns = file.notes.filter((n) => n.track.startsWith(name));
      return {
        name,
        entry: o.entry.get(name) ?? -1,
        playing: o.grid.get(name) ?? [],
        notes: ns.map((n) => [n.tick, n.ticks, n.key, n.vel]),
        measured: ns.length > 0 ? measure(file, ns) : null,
      };
    }),
    opening: { openers: o.openers, alone: o.alone, tutti: o.tutti },
  })}\n`);
} else if (args.includes("--file")) {
  const path = named("file", "");
  const file = readMidi(new Uint8Array(readFileSync(path)));
  process.stdout.write(`${lines(file, part, fromBar, bars, `${path}  ${file.title}  ${file.bpm.toFixed(1)} bpm`)}\n`);
} else {
  const [genre, seedArg, secondsArg] = positional;
  if (genre === undefined || seedArg === undefined || !(GENRE_NAMES as readonly string[]).includes(genre)) {
    process.stderr.write(
      "usage: node tools/measure.ts <genre> <seed> [seconds] [--part lead] [--from bar] [--bars n] [--report]\n" +
        "       node tools/measure.ts --file <out.mid> [--part lead]\n" +
        "       node tools/measure.ts --sweep <genre> <first seed> <last seed>\n" +
        `genres: ${GENRE_NAMES.join(", ")}\n`,
    );
    process.exit(2);
  }
  const seconds = secondsArg === undefined ? 90 : Number(secondsArg);
  const song = compose({ seed: Number(seedArg), genre: genre as GenreName, seconds });
  const file = readMidi(midi(song));
  const head = `${file.title}  ${file.bpm.toFixed(1)} bpm  ${song.chart.scaleName} on ${noteName(song.chart.tonic)}  ${song.form.bars} bars`;
  if (wantsMap) process.stdout.write(`${head}\n\n${mapOf(file)}\n`);
  else process.stdout.write(`${lines(file, part, fromBar, bars, head)}\n`);
}
