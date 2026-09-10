/**
 * THE CORPUS — a folder of somebody else's records, measured off their MIDI.
 *
 * `tools/measure.ts` reads ONE record and asks what the tune does.
 * This reads a FOLDER of records that are not ours and asks what the GENRE
 * does: how fast, in what metre, on which tonic and mode, how low, how many
 * bars a riff is and how many times it is said before it changes, how often
 * the chord moves, what the kit is doing, how the transcriber cut the form,
 * and how many parts are sounding at once. Every number is read off the file
 * — nothing here has an opinion about music, it counts.
 *
 * It exists because the genre files cite prose. A guide that says "slow" is
 * a source; forty transcriptions saying 51 to 140 bpm with a median of 85 is
 * a measurement, and the two are not the same kind of evidence. The MIDI
 * files themselves are not in the repository — they are other people's
 * transcriptions of other people's records — so this tool is kept and the
 * folder is not; `docs/genre-research/DOOM-AND-DUNGEON-SYNTH-BY-THE-FILE.md`
 * records where each was found and what this printed.
 *
 *   node tools/corpus.ts <folder>              every .mid in it, one block each, then the corpus
 *   node tools/corpus.ts <folder> --summary    the corpus figures only
 *   node tools/corpus.ts <folder> --table      one row per file, as markdown, then the figures
 *   node tools/corpus.ts <folder> --one <name> one file, at length: every marker, the riff bars
 *
 * WHAT IS COUNTED, and the unit of each:
 *
 *   TEMPO           the first tempo, and the range if it moves.
 *   METRE           every time signature the file states.
 *   TONIC           the pitch class carrying the most duration in the LOWEST
 *                   pitched track — the bass names the key in this music.
 *   MODE            the church mode on that tonic whose scale holds the most
 *                   of the record's duration-weighted pitch classes; the
 *                   share it holds is printed beside it, and so is the share
 *                   on the flat second and the flat fifth, which is where a
 *                   doom riff's colour lives.
 *   REGISTER        per pitched track: lowest, highest, median MIDI key.
 *   POLYPHONY       notes sounding at once on one track, averaged over the
 *                   time it sounds. 1.0 is a single line; a power chord is 2.
 *   DYADS           of the intervals sounded together on one track: how many
 *                   are fifths, fourths, octaves, thirds, tritones.
 *   MOTION          of a track's successive notes: same pitch, step (1–2),
 *                   leap (3+ semitones).
 *   RIFF            each bar of a track written down on a 48-per-quarter grid;
 *                   the riff length is the smallest look-back (1–16 bars) at
 *                   which a bar repeats an earlier one, taken as the mode over
 *                   the bars that repeat at all; the RUN is how many bars in a
 *                   row keep repeating at that length before something new.
 *   HARMONIC RHYTHM the root (lowest sounding pitch class on the lowest track)
 *                   per beat; changes per bar.
 *   KIT             kick, snare and hat strikes per bar the kit plays, and
 *                   the share of bars the kit plays at all.
 *   FORM            the markers the transcriber put in, with the bar each
 *                   starts on and how long each is.
 *   DENSITY         tracks sounding per bar: mean, and the thinnest and
 *                   fullest bars; the bars before the kit enters.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { readMidi, type MidiFile, type MidiNote } from "./smf.ts";

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const noteName = (k: number): string => `${NAMES[k % 12]}${Math.floor(k / 12) - 1}`;

/** The church modes as semitone sets above the tonic. */
const MODES: Readonly<Record<string, readonly number[]>> = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

const GRID = 48; // per quarter: catches sixteenths and triplets alike

const KICK = new Set([35, 36]);
const SNARE = new Set([37, 38, 40]);
const HAT = new Set([42, 44, 46]);
const CYMBAL = new Set([49, 51, 52, 53, 55, 57, 59]);

interface Bar { readonly tick: number; readonly ticks: number; readonly num: number; readonly den: number }

/** The bars of the file, walked through its time signatures. */
function barsOf(f: MidiFile): Bar[] {
  const end = Math.max(...f.notes.map((n) => n.tick + n.ticks), 1);
  const sigs = f.sigs.length > 0 ? f.sigs : [{ tick: 0, num: 4, den: 4 }];
  const out: Bar[] = [];
  let tick = 0;
  let si = 0;
  while (tick < end) {
    while (si + 1 < sigs.length && sigs[si + 1]!.tick <= tick) si++;
    const s = sigs[si]!;
    const ticks = Math.round((s.num * 4 * f.ppq) / s.den);
    out.push({ tick, ticks, num: s.num, den: s.den });
    tick += ticks;
  }
  return out;
}

const barAt = (bars: readonly Bar[], tick: number): number => {
  let lo = 0;
  let hi = bars.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (bars[mid]!.tick <= tick) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

interface Track {
  readonly name: string;
  readonly program: number;
  readonly drums: boolean;
  readonly notes: readonly MidiNote[];
}

function tracksOf(f: MidiFile): Track[] {
  const by = new Map<string, MidiNote[]>();
  for (const n of f.notes) (by.get(n.track) ?? by.set(n.track, []).get(n.track)!).push(n);
  const out: Track[] = [];
  for (const [name, notes] of by) {
    const info = f.trackInfo.find((t) => t.name === name);
    const drums = notes.filter((n) => n.ch === 9).length > notes.length / 2;
    out.push({ name, program: info?.program ?? -1, drums, notes });
  }
  return out;
}

const median = (xs: readonly number[]): number => {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
};
const mean = (xs: readonly number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const pct = (x: number): string => (Number.isFinite(x) ? `${Math.round(100 * x)}%` : "—");
const f1 = (x: number): string => (Number.isFinite(x) ? x.toFixed(1) : "—");

/** Duration-weighted pitch-class profile of some notes. */
function profile(notes: readonly MidiNote[]): number[] {
  const pc = new Array<number>(12).fill(0);
  for (const n of notes) pc[n.key % 12] = (pc[n.key % 12] ?? 0) + n.ticks;
  return pc;
}

interface Key { tonic: number; mode: string; fit: number; flat2: number; flat5: number }

function keyOf(pitched: readonly Track[], lowest: Track | undefined): Key {
  const all = profile(pitched.flatMap((t) => t.notes));
  const total = all.reduce((a, b) => a + b, 0) || 1;
  const bassPc = profile(lowest ? lowest.notes : pitched.flatMap((t) => t.notes));
  let tonic = 0;
  for (let i = 1; i < 12; i++) if (bassPc[i]! > bassPc[tonic]!) tonic = i;
  let mode = "aeolian";
  let fit = -1;
  for (const [name, set] of Object.entries(MODES)) {
    let inSet = 0;
    for (const d of set) inSet += all[(tonic + d) % 12]!;
    // ties go to the modes this music names first: aeolian, dorian, phrygian
    if (inSet > fit + 1e-9) { fit = inSet; mode = name; }
  }
  return { tonic, mode, fit: fit / total, flat2: all[(tonic + 1) % 12]! / total, flat5: all[(tonic + 6) % 12]! / total };
}

/** One track's bars as strings on the grid, transposition kept. */
function barStrings(t: Track, bars: readonly Bar[], ppq: number): string[] {
  const rows: string[][] = bars.map(() => []);
  for (const n of t.notes) {
    const b = barAt(bars, n.tick);
    const off = Math.round(((n.tick - bars[b]!.tick) * GRID) / ppq);
    const len = Math.max(1, Math.round((n.ticks * GRID) / ppq));
    rows[b]!.push(`${off}:${n.key}:${len}`);
  }
  return rows.map((r) => r.sort().join(" "));
}

interface Riff { length: number; run: number; distinct: number; repeatShare: number; lookbacks: number[]; matches: Map<number, number> }

/**
 * THE RIFF, off one track's bars. Its LENGTH is the period k (1–16 bars) at
 * which the most bars equal the bar k earlier — not the commonest look-back,
 * which a riff shaped A B A C reports as 2 when the riff is 4 (Holy Mountain
 * was the case). Its RUN is how many bars in a row keep matching at that
 * period; a run of r bars is (r + k) / k statements of the riff.
 */
function riffOf(strings: readonly string[]): Riff {
  const played = strings.map((s, i) => [s, i] as const).filter(([s]) => s !== "");
  const byBar = new Map<number, string>(played.map(([s, i]) => [i, s]));
  const matches = new Map<number, number>();
  for (let k = 1; k <= 16; k++) {
    let n = 0;
    for (const [s, i] of played) if (byBar.get(i - k) === s) n++;
    matches.set(k, n);
  }
  let length = 0;
  let best = 0;
  for (const [k, n] of matches) if (n > best) { best = n; length = k; }
  // the nearest earlier bar each bar repeats, for the --one histogram
  const lookbacks: number[] = [];
  let repeats = 0;
  for (const [s, i] of played) {
    for (let back = 1; back <= 16; back++) {
      if (byBar.get(i - back) === s) { lookbacks.push(back); repeats++; break; }
    }
  }
  const runs: number[] = [];
  let run = 0;
  for (const [s, i] of played) {
    if (length > 0 && byBar.get(i - length) === s) run++;
    else { if (run > 0) runs.push(run + length); run = 0; }
  }
  if (run > 0) runs.push(run + length);
  return {
    length,
    run: mean(runs),
    distinct: new Set(played.map(([s]) => s)).size,
    repeatShare: played.length ? repeats / played.length : NaN,
    lookbacks,
    matches,
  };
}

function motionOf(t: Track): { same: number; step: number; leap: number } {
  // successive onsets, the highest note at each onset
  const on = new Map<number, number>();
  for (const n of t.notes) on.set(n.tick, Math.max(on.get(n.tick) ?? -1, n.key));
  const seq = [...on.entries()].sort((a, b) => a[0] - b[0]).map(([, k]) => k);
  let same = 0;
  let step = 0;
  let leap = 0;
  for (let i = 1; i < seq.length; i++) {
    const d = Math.abs(seq[i]! - seq[i - 1]!);
    if (d === 0) same++;
    else if (d <= 2) step++;
    else leap++;
  }
  const n = Math.max(1, seq.length - 1);
  return { same: same / n, step: step / n, leap: leap / n };
}

function dyadsOf(t: Track): { poly: number; fifth: number; fourth: number; octave: number; third: number; tritone: number; n: number } {
  const on = new Map<number, number[]>();
  for (const n of t.notes) (on.get(n.tick) ?? on.set(n.tick, []).get(n.tick)!).push(n.key);
  let fifth = 0;
  let fourth = 0;
  let octave = 0;
  let third = 0;
  let tritone = 0;
  let n = 0;
  for (const keys of on.values()) {
    const s = [...new Set(keys)].sort((a, b) => a - b);
    for (let i = 1; i < s.length; i++) {
      const d = (s[i]! - s[0]!) % 12;
      n++;
      if (d === 7) fifth++;
      else if (d === 5) fourth++;
      else if (d === 0) octave++;
      else if (d === 3 || d === 4) third++;
      else if (d === 6) tritone++;
    }
  }
  // polyphony: mean notes sounding, sampled at each onset
  const poly = mean([...on.values()].map((k) => k.length));
  const m = Math.max(1, n);
  return { poly, fifth: fifth / m, fourth: fourth / m, octave: octave / m, third: third / m, tritone: tritone / m, n };
}

function harmonicRhythm(t: Track, bars: readonly Bar[], ppq: number): number {
  // the root per beat: the lowest pitch class sounding at the beat's start
  let changes = 0;
  let beatsCounted = 0;
  let last = -1;
  for (const b of bars) {
    const beats = Math.round(b.ticks / ppq);
    for (let k = 0; k < beats; k++) {
      const at = b.tick + k * ppq;
      let low = 999;
      for (const n of t.notes) if (n.tick <= at && n.tick + n.ticks > at && n.key < low) low = n.key;
      if (low === 999) continue;
      const pc = low % 12;
      if (last >= 0 && pc !== last) changes++;
      last = pc;
      beatsCounted++;
    }
  }
  const barsPlayed = beatsCounted / 4;
  return barsPlayed > 0 ? changes / barsPlayed : NaN;
}

interface Report {
  readonly file: string;
  readonly title: string;
  readonly bpm: number;
  readonly bpmMin: number;
  readonly bpmMax: number;
  readonly metres: string;
  readonly bars: number;
  readonly minutes: number;
  readonly programs: readonly number[];
  readonly noteLen: number;
  readonly key: Key;
  readonly lowestKey: number;
  readonly tracks: number;
  readonly riffLength: number;
  readonly riffRun: number;
  readonly riffRepeat: number;
  readonly harmonic: number;
  readonly poly: number;
  readonly fifth: number;
  readonly step: number;
  readonly leap: number;
  readonly kickPerBar: number;
  readonly snarePerBar: number;
  readonly hatPerBar: number;
  readonly kitShare: number;
  readonly kitEntry: number;
  readonly density: number;
  readonly thinnest: number;
  readonly fullest: number;
  readonly sections: number;
  readonly sectionBars: number;
  readonly text: string;
}

function analyse(path: string, long: boolean): Report {
  const f = readMidi(new Uint8Array(readFileSync(path)));
  const bars = barsOf(f);
  const tracks = tracksOf(f).filter((t) => t.notes.length > 0);
  const pitched = tracks.filter((t) => !t.drums);
  const kit = tracks.filter((t) => t.drums);
  const L: string[] = [];

  const end = bars.length ? bars[bars.length - 1]!.tick + bars[bars.length - 1]!.ticks : 0;
  const secOf = (tick: number): number => {
    // seconds to a tick, through the tempo map
    let sec = 0;
    let at = 0;
    let bpm = f.tempos[0]?.bpm ?? f.bpm;
    for (const t of f.tempos) {
      if (t.tick >= tick) break;
      sec += ((t.tick - at) / f.ppq) * (60 / bpm);
      at = t.tick;
      bpm = t.bpm;
    }
    return sec + ((tick - at) / f.ppq) * (60 / bpm);
  };
  const minutes = secOf(end) / 60;
  const bpms = f.tempos.map((t) => t.bpm);
  const bpmMin = bpms.length ? Math.min(...bpms) : f.bpm;
  const bpmMax = bpms.length ? Math.max(...bpms) : f.bpm;
  // the tempo the record spends most of its time at, in seconds
  const secAt = new Map<number, number>();
  for (let i = 0; i < f.tempos.length; i++) {
    const t = f.tempos[i]!;
    const until = f.tempos[i + 1]?.tick ?? end;
    secAt.set(t.bpm, (secAt.get(t.bpm) ?? 0) + Math.max(0, secOf(until) - secOf(t.tick)));
  }
  let bpmMain = f.bpm;
  let mostSec = -1;
  for (const [b, s] of secAt) if (s > mostSec) { mostSec = s; bpmMain = b; }
  const metres = [...new Set(bars.map((b) => `${b.num}/${b.den}`))].join(" ");

  // the lowest pitched track, by median key: the bass names the key
  const withMedian = pitched.map((t) => ({ t, med: median(t.notes.map((n) => n.key)) }));
  withMedian.sort((a, b) => a.med - b.med);
  const lowest = withMedian[0]?.t;
  // and the riff track: the guitar that plays the most bars — the rhythm
  // guitar, in a band — else the lowest track there is
  const barsPlayed = (t: Track): number => new Set(t.notes.map((n) => barAt(bars, n.tick))).size;
  const guitar = withMedian.filter(({ t }) => t.program >= 24 && t.program <= 31).map(({ t, med }) => ({ t, med, played: barsPlayed(t) }));
  guitar.sort((a, b) => b.played - a.played || a.med - b.med);
  const riffTrack = guitar[0]?.t ?? lowest;
  const key = keyOf(pitched, lowest);
  const lowestKey = pitched.length ? Math.min(...pitched.flatMap((t) => t.notes.map((n) => n.key))) : NaN;

  L.push(`${basename(path)}`);
  L.push(`  ${f.title || "(untitled)"}`);
  L.push(`  tempo ${f1(bpmMain)}${bpmMin !== bpmMax ? ` mostly (opens ${f1(f.bpm)}, ${f1(bpmMin)}–${f1(bpmMax)})` : ""} bpm   metre ${metres}   ${bars.length} bars   ${f1(minutes)} min`);
  L.push(`  key   ${NAMES[key.tonic]} ${key.mode}  (${pct(key.fit)} of duration in the mode; ♭2 ${pct(key.flat2)}, ♭5 ${pct(key.flat5)})   lowest note ${Number.isFinite(lowestKey) ? noteName(lowestKey) : "—"}`);

  let riff: Riff = { length: 0, run: NaN, distinct: 0, repeatShare: NaN, lookbacks: [], matches: new Map() };
  let harmonic = NaN;
  let poly = NaN;
  let fifth = NaN;
  let step = NaN;
  let leap = NaN;
  for (const t of pitched) {
    const keys = t.notes.map((n) => n.key);
    const d = dyadsOf(t);
    const m = motionOf(t);
    const strings = barStrings(t, bars, f.ppq);
    const r = riffOf(strings);
    const played = strings.filter((s) => s !== "").length;
    const tag = t === riffTrack ? " ◀ riff" : t === lowest ? " ◀ lowest" : "";
    const lenBeats = median(t.notes.map((n) => n.ticks / f.ppq));
    L.push(`  ${t.name.slice(0, 34).padEnd(34)} prog ${String(t.program).padStart(3)}  ${noteName(Math.min(...keys))}–${noteName(Math.max(...keys))} med ${noteName(Math.round(median(keys)))}  ${String(t.notes.length).padStart(5)} notes  ${f1(t.notes.length / Math.max(1, played))}/bar  len ${f1(lenBeats)} beats  plays ${pct(played / bars.length)}  poly ${f1(d.poly)}  5th ${pct(d.fifth)} 8ve ${pct(d.octave)} 3rd ${pct(d.third)} ♭5 ${pct(d.tritone)}  same ${pct(m.same)} step ${pct(m.step)} leap ${pct(m.leap)}  riff ${r.length} bars, ×${f1(r.run / Math.max(1, r.length))} (${r.distinct} distinct bars, ${pct(r.repeatShare)} repeats)${tag}`);
    if (t === riffTrack) {
      riff = r;
      harmonic = harmonicRhythm(t, bars, f.ppq);
      poly = d.poly;
      fifth = d.fifth;
      step = m.step;
      leap = m.leap;
    }
  }
  if (riffTrack) L.push(`  harmonic rhythm on the riff track: ${f1(harmonic)} root changes per bar`);

  // the kit
  let kickPerBar = NaN;
  let snarePerBar = NaN;
  let hatPerBar = NaN;
  let kitShare = NaN;
  let kitEntry = NaN;
  if (kit.length > 0) {
    const all = kit.flatMap((t) => t.notes);
    const barsWith = new Set(all.map((n) => barAt(bars, n.tick)));
    const nb = Math.max(1, barsWith.size);
    kickPerBar = all.filter((n) => KICK.has(n.key)).length / nb;
    snarePerBar = all.filter((n) => SNARE.has(n.key)).length / nb;
    hatPerBar = all.filter((n) => HAT.has(n.key) || CYMBAL.has(n.key)).length / nb;
    kitShare = barsWith.size / bars.length;
    kitEntry = Math.min(...barsWith);
    L.push(`  kit   plays ${pct(kitShare)} of bars, enters bar ${kitEntry}   per bar: kick ${f1(kickPerBar)}  snare ${f1(snarePerBar)}  hat+cymbal ${f1(hatPerBar)}`);
  } else L.push(`  kit   none`);

  // density: tracks sounding per bar
  const perBar = bars.map(() => new Set<string>());
  for (const t of tracks) for (const n of t.notes) {
    const from = barAt(bars, n.tick);
    const to = barAt(bars, n.tick + n.ticks - 1);
    for (let b = from; b <= to; b++) perBar[b]!.add(t.name);
  }
  const counts = perBar.map((s) => s.size);
  const density = mean(counts);
  const thinnest = Math.min(...counts);
  const fullest = Math.max(...counts);
  L.push(`  density ${f1(density)} of ${tracks.length} tracks per bar (thinnest ${thinnest}, fullest ${fullest})`);

  // form
  const marks = f.markers.map((m, i) => {
    const b = barAt(bars, m.tick);
    const nextTick = f.markers[i + 1]?.tick ?? end;
    return { text: m.text, bar: b, len: barAt(bars, Math.max(m.tick, nextTick - 1)) - b + 1 };
  });
  if (marks.length > 0) {
    const shown = long ? marks : marks.slice(0, 12);
    L.push(`  form  ${marks.length} markers: ` + shown.map((m) => `${m.text.slice(0, 18)}@${m.bar}(${m.len})`).join(" · ") + (shown.length < marks.length ? " …" : ""));
  }
  if (long && riffTrack) {
    const strings = barStrings(riffTrack, bars, f.ppq);
    L.push(`  riff track bars (first 48, ${GRID}/quarter grid, offset:key:length):`);
    strings.slice(0, 48).forEach((s, i) => L.push(`    ${String(i).padStart(3)} ${s.slice(0, 110)}`));
    const hist = new Map<number, number>();
    for (const k of riff.lookbacks) hist.set(k, (hist.get(k) ?? 0) + 1);
    L.push(`  look-back histogram: ` + [...hist.entries()].sort((a, b) => a[0] - b[0]).map(([k, n]) => `${k}:${n}`).join(" "));
    L.push(`  bars matching at each period: ` + [...riff.matches.entries()].map(([k, n]) => `${k}:${n}`).join(" "));
  }

  return {
    file: basename(path), title: f.title, bpm: bpmMain, bpmMin, bpmMax, metres, bars: bars.length, minutes,
    programs: tracks.map((t) => (t.drums ? 128 : t.program)),
    noteLen: riffTrack ? median(riffTrack.notes.map((n) => n.ticks / f.ppq)) : NaN,
    key, lowestKey, tracks: tracks.length,
    riffLength: riff.length, riffRun: riff.run / Math.max(1, riff.length), riffRepeat: riff.repeatShare, harmonic,
    poly, fifth, step, leap, kickPerBar, snarePerBar, hatPerBar, kitShare, kitEntry, density, thinnest, fullest,
    sections: marks.length, sectionBars: median(marks.map((m) => m.len)), text: L.join("\n"),
  };
}

// ── the corpus ───────────────────────────────────────────────────────────────

function summary(rs: readonly Report[]): string {
  const L: string[] = [];
  const col = (label: string, xs: number[], fmt: (x: number) => string = f1): void => {
    const ok = xs.filter((x) => Number.isFinite(x));
    if (ok.length === 0) return;
    L.push(`  ${label.padEnd(36)} median ${fmt(median(ok)).padStart(6)}   range ${fmt(Math.min(...ok))}–${fmt(Math.max(...ok))}   (${ok.length} files)`);
  };
  L.push(`CORPUS: ${rs.length} files`);
  col("tempo, bpm", rs.map((r) => r.bpm));
  col("length, minutes", rs.map((r) => r.minutes));
  col("length, bars", rs.map((r) => r.bars), (x) => String(Math.round(x)));
  col("lowest note, MIDI key", rs.map((r) => r.lowestKey), (x) => noteName(Math.round(x)));
  col("mode fit, share of duration", rs.map((r) => r.key.fit), pct);
  col("flat second, share of duration", rs.map((r) => r.key.flat2), pct);
  col("flat fifth, share of duration", rs.map((r) => r.key.flat5), pct);
  col("riff length, bars", rs.map((r) => r.riffLength), (x) => String(Math.round(x)));
  col("riff run, statements before change", rs.map((r) => r.riffRun));
  col("bars that repeat an earlier bar", rs.map((r) => r.riffRepeat), pct);
  col("root changes per bar (riff track)", rs.map((r) => r.harmonic));
  col("median note length, beats (riff track)", rs.map((r) => r.noteLen));
  col("polyphony on the riff track", rs.map((r) => r.poly));
  col("fifths among its dyads", rs.map((r) => r.fifth), pct);
  col("steps in its line", rs.map((r) => r.step), pct);
  col("leaps in its line", rs.map((r) => r.leap), pct);
  col("kick per bar", rs.map((r) => r.kickPerBar));
  col("snare per bar", rs.map((r) => r.snarePerBar));
  col("hat and cymbal per bar", rs.map((r) => r.hatPerBar));
  col("bars the kit plays", rs.map((r) => r.kitShare), pct);
  col("bar the kit enters", rs.map((r) => r.kitEntry), (x) => String(Math.round(x)));
  col("tracks sounding per bar", rs.map((r) => r.density));
  col("tracks in the file", rs.map((r) => r.tracks), (x) => String(Math.round(x)));
  col("markers in the file", rs.map((r) => r.sections), (x) => String(Math.round(x)));
  col("bars per marked section", rs.map((r) => r.sectionBars));
  const modes = new Map<string, number>();
  for (const r of rs) modes.set(r.key.mode, (modes.get(r.key.mode) ?? 0) + 1);
  L.push(`  modes: ` + [...modes.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(" · "));
  const tonics = new Map<string, number>();
  for (const r of rs) tonics.set(NAMES[r.key.tonic]!, (tonics.get(NAMES[r.key.tonic]!) ?? 0) + 1);
  L.push(`  tonics: ` + [...tonics.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(" · "));
  const metres = new Map<string, number>();
  for (const r of rs) for (const m of r.metres.split(" ")) metres.set(m, (metres.get(m) ?? 0) + 1);
  L.push(`  metres (files using): ` + [...metres.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(" · "));
  // what the tracks are, by General MIDI family — the instrumentation
  const FAMILY = ["piano", "chromatic perc", "organ", "guitar", "bass", "strings", "ensemble/choir", "brass", "reed", "pipe/flute", "synth lead", "synth pad", "synth fx", "ethnic", "percussive", "sound fx"];
  const fam = new Map<string, number>();
  for (const r of rs) for (const p of r.programs) {
    const name = p === 128 ? "drum kit" : p < 0 ? "(no program)" : FAMILY[Math.floor(p / 8)]!;
    fam.set(name, (fam.get(name) ?? 0) + 1);
  }
  L.push(`  tracks by GM family: ` + [...fam.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} ${n}`).join(" · "));
  return L.join("\n");
}

/** One row per file, as a markdown table: what a document quotes. */
function table(rs: readonly Report[]): string {
  const L: string[] = [];
  L.push("| file | bpm | key | lowest | riff (bars) | said × | bars repeating | roots/bar | poly | 5ths | kit plays | kit in at bar | tracks/bar | min |");
  L.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of rs) {
    L.push(`| ${r.file.replace(/\.midi?$/i, "").replace(/_/g, " ")} | ${Math.round(r.bpm)}${r.bpmMin !== r.bpmMax ? ` (${Math.round(r.bpmMin)}–${Math.round(r.bpmMax)})` : ""} | ${NAMES[r.key.tonic]} ${r.key.mode} | ${Number.isFinite(r.lowestKey) ? noteName(r.lowestKey) : "—"} | ${r.riffLength} | ${f1(r.riffRun)} | ${pct(r.riffRepeat)} | ${f1(r.harmonic)} | ${f1(r.poly)} | ${pct(r.fifth)} | ${pct(r.kitShare)} | ${Number.isFinite(r.kitEntry) ? r.kitEntry : "—"} | ${f1(r.density)} of ${r.tracks} | ${f1(r.minutes)} |`);
  }
  return L.join("\n");
}

// ── the command ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--one");
if (folder === undefined) {
  console.error("usage: node tools/corpus.ts <folder> [--summary] [--one <name>]");
  process.exit(2);
}
const oneAt = args.indexOf("--one");
const one = oneAt >= 0 ? args[oneAt + 1] : undefined;
const summaryOnly = args.includes("--summary") || args.includes("--table");
const wantsTable = args.includes("--table");

const files = statSync(folder).isDirectory()
  ? readdirSync(folder).filter((n) => /\.midi?$/i.test(n)).sort().map((n) => join(folder, n))
  : [folder];
const reports: Report[] = [];
for (const p of files) {
  if (one !== undefined && !basename(p).toLowerCase().includes(one.toLowerCase())) continue;
  try {
    const r = analyse(p, one !== undefined);
    reports.push(r);
    if (!summaryOnly) console.log(r.text + "\n");
  } catch (e) {
    console.log(`${basename(p)}: could not read (${(e as Error).message})\n`);
  }
}
if (one === undefined) {
  if (wantsTable) console.log(table(reports) + "\n");
  console.log(summary(reports));
}
