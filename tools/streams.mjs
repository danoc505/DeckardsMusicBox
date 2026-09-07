/**
 * HOW MANY INDEPENDENT STREAMS A RECORD CARRIES, against how many parts.
 *
 * `docs/genre-research/PARTS-ELEMENTS-AND-STREAMS.md` is the research: the
 * ceiling every arranging source states is a count of what a listener hears as
 * SEPARATE, not of parts. Several parts collapse into one when they move
 * together — "counting the drums as one" (soundonsound), a Foundation that
 * "can also include a rhythm guitar and/or keys if they're playing the same
 * rhythmic figure" (Owsinski) — and Huron's numerosity figures put the
 * difficulty past three concurrent voices.
 *
 * THIS TOOL CARRIES NO RULE OF ITS OWN, and that is deliberate. The cue and
 * the threshold are arguments, because the first measurement made with it
 * showed the answer swings from 1.31 streams to 3.76 on the choice of
 * denominator alone. A tool that baked one of those in would be reporting its
 * own parameter as a property of the music. Run it across the range and look
 * at the spread before believing any single figure.
 *
 *   node tools/streams.mjs <genre> [share]        shared / the smaller part's own
 *   JACCARD=1 node tools/streams.mjs <genre> [share]   shared / the union
 */
/* How many INDEPENDENT streams a record carries, against how many parts.
   Fusion cue: shared onsets — Owsinski's "playing the same rhythmic figure",
   which is the one cue a source names explicitly and the one the material
   makes computable. */
const { compose } = await import("/home/user/DeckardsMusicBox/src/song.ts");
const SHARE = Number(process.argv[3] ?? 0.6);
for (const g of [process.argv[2]]) {
  const parts = [], streams = [];
  for (let s = 1; s <= 40; s++) {
    const song = compose({ seed: s, genre: g });
    // onsets per part per bar, off the performance
    for (const p of song.arrangement.placed) {
      const heard = [...p.heard];
      if (heard.length < 2) { parts.push(heard.length); streams.push(heard.length); continue; }
      const on = new Map();
      for (const e of song.performance.events) {
        if (e.bar < p.section.startBar || e.bar >= p.section.endBar) continue;
        if (!on.has(e.role)) on.set(e.role, new Set());
        on.get(e.role).add(`${e.bar}:${e.step}`);
      }
      // union-find over parts that share most of their onsets
      const idx = new Map(heard.map((r, i) => [r, i]));
      const up = heard.map((_, i) => i);
      const find = (i) => { while (up[i] !== i) { up[i] = up[up[i]]; i = up[i]; } return i; };
      for (let a = 0; a < heard.length; a++) for (let b = a + 1; b < heard.length; b++) {
        const A = on.get(heard[a]) ?? new Set(), B = on.get(heard[b]) ?? new Set();
        if (A.size === 0 || B.size === 0) continue;
        let both = 0; for (const k of A) if (B.has(k)) both++;
        const denom = process.env.JACCARD ? (A.size + B.size - both) : Math.min(A.size, B.size);
        if (both / denom >= SHARE) { up[find(a)] = find(b); }
      }
      const roots = new Set(heard.map((_, i) => find(i)));
      parts.push(heard.length); streams.push(roots.size);
    }
  }
  const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2);
  const hist = (a) => { const h = new Map(); for (const v of a) h.set(v, (h.get(v) ?? 0) + 1); return [...h].sort((x, y) => x[0] - y[0]).map(([k, v]) => `${k}:${(100*v/a.length).toFixed(0)}%`).join(" "); };
  console.log(`${g}  ${parts.length} sections`);
  console.log(`  parts   mean ${avg(parts)}   ${hist(parts)}`);
  console.log(`  streams mean ${avg(streams)}   ${hist(streams)}   (fusion at ${SHARE} shared onsets)`);
  console.log(`  over Huron's three: ${(100*streams.filter(v=>v>3).length/streams.length).toFixed(0)}% of sections`);
}
