import { compose } from "../../src/song.ts";
for (const seed of process.argv.slice(2).map(Number)) {
  const s = compose({ seed, genre: "dungeonsynth" });
  const A = s.arrangement;
  console.log(`seed ${seed}  star ${A.protagonist}  enter ${A.enter.join(",")}  shed ${A.shed.join(",")}  bars ${s.form.bars}`);
  for (const p of A.placed) console.log(`  ${String(p.section.index).padStart(2)} ${p.section.fn.padEnd(12)} ${String(p.section.bars).padStart(3)} bars  energy ${p.section.energy.toFixed(2)}${p.section.peak ? " PEAK" : "     "}  heard ${[...p.heard].join("+")}   spans ${p.spans.map((x) => [...x.heard].length).join("/")}`);
}
