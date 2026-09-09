// The record at the genre's own length: summary line, the form, and who plays which bar.
import { compose } from "../../src/song.ts";
const ROLES = ["drone", "keys", "lead", "bass", "drums", "counter"] as const;
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
for (const seed of process.argv.slice(2).map(Number)) {
  const s = compose({ seed, genre: "dungeonsynth" });
  const c = s.chart, total = s.form.bars, secPerBar = (60 / c.tempo) * c.metre.beats, secs = total * secPerBar;
  const ev = s.performance.events;
  console.log(`dungeon synth · seed ${seed} · ${NAMES[c.tonicPc % 12]} ${c.scaleName} · ${c.tempo.toFixed(1)} bpm · ${total} bars · ${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, "0")} · ${s.arrangement.placed.length} sections · ${ev.length} events · character ${s.arrangement.protagonist}`);
  let bar = 0; const marks: number[] = [];
  console.log("  form   " + s.arrangement.placed.map((p) => { const t = `${p.section.fn}${p.section.peak ? "*" : ""} ${p.section.bars}`; marks.push(bar); bar += p.section.bars; return t; }).join(" · "));
  const grid = new Map<string, boolean[]>(); for (const r of ROLES) grid.set(r, new Array(total).fill(false));
  for (const e of ev) { const from = Math.max(0, Math.floor(e.tSec / secPerBar)), to = Math.min(total - 1, Math.floor((e.tSec + e.durSec - 1e-6) / secPerBar)); for (let b = from; b <= to; b++) grid.get(e.role)![b] = true; }
  const ruler = Array.from({ length: total }, (_, b) => (marks.includes(b) ? "|" : b % 8 === 0 ? "'" : " ")).join("");
  console.log(`  bar     ${ruler}`);
  for (const r of ROLES) { const row = grid.get(r)!; const n = row.filter(Boolean).length, first = row.indexOf(true); console.log(`  ${r.padEnd(7)} ${row.map((x) => (x ? "#" : "·")).join("")}  in ${first < 0 ? "-" : `${((100 * first) / total).toFixed(0)}%`} plays ${((100 * n) / total).toFixed(0)}%`); }
  console.log("          " + Array.from({ length: Math.ceil(total / 8) }, (_, k) => String(k * 8).padEnd(8)).join(""));
  console.log();
}
