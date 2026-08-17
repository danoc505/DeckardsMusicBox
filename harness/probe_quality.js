/* ── WHAT KIND OF CHORDS DO WE ACTUALLY WRITE? ────────────────────────────
   The chord-quality work took its numbers from 1170 real jazz tunes. This is
   the other half of that claim: what the program writes when it reads them,
   held against the same corpus, plus the two things a new chromatic chord can
   break.

       node harness/probe_quality.js [seeds]

   Reads the shipped HTML, so there is no build step and nothing to keep in
   sync. Every genre is listed, so a genre that declares nothing is visible as
   a control rather than absent.
   Research: docs/genre-research/chord-quality.md
   ────────────────────────────────────────────────────────────────────────── */
const { chromium } = require("../node_modules/playwright");
const N = parseInt(process.argv[2] || "60", 10);

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox", "--disable-gpu"] });
  const p = await b.newPage();
  await p.goto("file://" + require("path").resolve(__dirname, "../Boxcar Synth.html"),
               { waitUntil: "load", timeout: 60000 });
  await p.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await p.evaluate(N => {
    const res = {}, corpus = MK2.CHORD_QUALITY;
    for(const g of MK2.genres()){
      const r = { songs: 0, chords: 0, named: 0, four: 0, offkey: 0, clash: 0, notes: 0,
                  q: {}, byMode: {}, declared: null };
      for(let s = 1; s <= N; s++){
        const song = MK2.composeSong(s, "draw", g);
        r.declared = song.chart.table.qualities || 0;
        r.songs++;
        const M = song.materials;
        const sets = [M.chords, M.bridgeChords].filter(Boolean);
        for(const set of sets) for(const ch of set){
          r.chords++;
          r.byMode[song.chart.mode] = (r.byMode[song.chart.mode] || 0) + 1;
          if(ch.quality){ r.named++; r.q[ch.quality] = (r.q[ch.quality] || 0) + 1; }
          if(ch.tones.length >= 4) r.four++;
          /* a chord tone outside the key is the whole point of the mechanism;
             count it rather than assume it happened */
          for(const t of ch.tones)
            if(!MK2.MODES[song.chart.mode].includes(((t - song.chart.root) % 12 + 12) % 12)){ r.offkey++; break; }
        }
        /* THE RISK THIS INTRODUCES: a chord can now hold a note the scale does
           not, so a melody drawn from the scale can sound a semitone against
           it. Counted at the instant both are sounding, in the same bar. */
        for(const key of ["A", "Avar", "B", "C"]){
          const mat = M[key]; if(!mat) continue;
          const set = key === "C" ? (M.bridgeChords || M.chords) : M.chords;
          for(const role of ["lead", "counter"]){
            for(const n of (mat[role] || [])){
              if(n.pitch == null) continue;
              r.notes++;
              const ch = set[n.bar % set.length];
              const inCh = ch.tones.some(t => ((t - n.pitch) % 12 + 12) % 12 === 0);
              if(inCh) continue;
              if(ch.tones.some(t => { const d = Math.abs(((t - n.pitch) % 12 + 12) % 12); return d === 1 || d === 11; }))
                r.clash++;
            }
          }
        }
      }
      res[g] = r;
    }
    return { res, corpus };
  }, N);

  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + "%" : "-";
  console.log(`\n  ${N} seeds a genre. "named" = took its kind from the measurement.\n`);
  console.log("  genre         asks for   chords   named    four notes   outside the key   lead clash");
  for(const g of Object.keys(out.res)){
    const r = out.res[g];
    console.log(`  ${g.padEnd(13)}${String(r.declared).padStart(6)}   ${String(r.chords).padStart(6)}   ` +
                `${pct(r.named, r.chords).padStart(6)}   ${pct(r.four, r.chords).padStart(10)}   ` +
                `${pct(r.offkey, r.chords).padStart(15)}   ${pct(r.clash, r.notes).padStart(10)}`);
  }
  /* the genres that use it, held against the corpus they took it from */
  for(const g of Object.keys(out.res)){
    const r = out.res[g];
    if(!r.named) continue;
    console.log(`\n  ${g} — what kinds it wrote, against the 1170 tunes it learned from:`);
    const mine = Object.entries(r.q).sort((a, c) => c[1] - a[1]);
    const theirs = {};
    let tot = 0;
    for(const mode of ["major", "minor"])
      for(const rel in out.corpus[mode]){
        const row = out.corpus[mode][rel];
        for(const [q, w] of row.q){ theirs[q] = (theirs[q] || 0) + row.n * w / 100; tot += row.n * w / 100; }
      }
    console.log("     kind      we write    the corpus");
    for(const [q, n] of mine)
      console.log(`     ${q.padEnd(9)}${pct(n, r.named).padStart(8)}${pct(theirs[q] || 0, tot).padStart(14)}`);
  }
  console.log("\n  a lead clash is a melody note a semitone from a chord note in the same bar.");
  console.log("  It is not automatically wrong — but it can only have gone UP, so watch it.\n");
  await b.close();
})();
