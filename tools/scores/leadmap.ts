// The same columns midimap.mjs prints for a real score, read off the program's
// own MIDI, so the two can sit in one table. Reads only the frozen Song.
import { compose } from "../../src/song.ts";
const first = Number(process.argv[2] ?? 1), last = Number(process.argv[3] ?? 60);
const perSeed = process.argv.includes("--each");
const ROLES = ["drone", "keys", "lead", "bass", "drums", "counter"];
const acc = new Map<string, { entry: number[]; share: number[]; end: number[]; n: number }>();
for (const r of ROLES) acc.set(r, { entry: [], share: [], end: [], n: 0 });
let bars: number[] = []; const jumps: number[] = [];
for (let seed = first; seed <= last; seed++) {
  const song = compose({ seed, genre: (process.env.GENRE ?? "dungeonsynth") as never });
  { let prev = 0, big = 0; for (const p of song.arrangement.placed) for (const sp of p.spans) { const n = sp.heard.size; if (n - prev > big) big = n - prev; prev = n; } jumps.push(big); }
  const ev = song.performance.events;
  const bpm = song.chart.tempo, beats = song.chart.metre.beats;
  const secPerBar = (60 / bpm) * beats;
  const total = song.form.bars;
  bars.push(total);
  const line: string[] = [];
  for (const r of ROLES) {
    const rows = new Set<number>(); let firstBar = Infinity, lastBar = -1;
    for (const e of ev) {
      if (e.role !== r) continue;
      const from = Math.max(0, Math.floor(e.tSec / secPerBar)), to = Math.min(total - 1, Math.floor((e.tSec + e.durSec - 1e-6) / secPerBar));
      for (let b = from; b <= to; b++) rows.add(b);
      firstBar = Math.min(firstBar, from); lastBar = Math.max(lastBar, to);
    }
    if (rows.size === 0) continue;
    const a = acc.get(r)!; a.n++;
    a.entry.push((100 * firstBar) / total); a.share.push((100 * rows.size) / total); a.end.push((100 * (lastBar + 1)) / total);
    line.push(`${r} in ${((100 * firstBar) / total).toFixed(0)}% plays ${((100 * rows.size) / total).toFixed(0)}%`);
  }
  if (perSeed) console.log(`seed ${seed} ${total} bars  ${line.join(" · ")}`);
}
const mean = (a: number[]) => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(0);
const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return (s[Math.floor(s.length / 2)] ?? 0).toFixed(0); };
console.log(`seeds ${first}-${last}   bars mean ${mean(bars)}   largest number of parts arriving at one boundary: mean ${(jumps.reduce((a,b)=>a+b,0)/jumps.length).toFixed(2)}, 3+ at once in ${jumps.filter(j=>j>=3).length} records`);
console.log(`part     heard in   enters at (mean/median % in)   sounds (mean/median % of bars)   last heard at`);
for (const r of ROLES) { const a = acc.get(r)!; console.log(`  ${r.padEnd(8)} ${String(a.n).padStart(3)}         ${mean(a.entry).padStart(3)}% / ${med(a.entry).padStart(3)}%                    ${mean(a.share).padStart(3)}% / ${med(a.share).padStart(3)}%                      ${mean(a.end)}%`); }
