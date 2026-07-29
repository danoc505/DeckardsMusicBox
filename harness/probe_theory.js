/* THE MUSIC LAWS, MEASURED ON MK2.

   `harness/probe_nct.js`, `probe_voiceleading.js`, `probe_hierarchy.js`,
   `probe_bass_consonance.js` and `probe_peak_arc.js` all target MK1: they
   require `HARD`, `SOFT`, `conduct` and `improvise`, none of which exist in
   this engine. They are not broken probes, they are probes for a different
   program -- and the laws they measured still matter here.

   This is those laws, asked of MK2 directly, by reading the composed notes:

     1. IN KEY          every pitch belongs to the song's scale
     2. NON-CHORD TONES a note that is in the key but NOT in the chord under it
                        should resolve BY STEP (<= 2 semitones) to its next note.
                        A non-chord tone that leaps away is the classic
                        unresolved dissonance, and it was dead code in MK1.
     3. REGISTER        chords sit above the bass and the lead above the chords,
                        in ABSOLUTE register -- the trap being a relative span
                        check that passes while a chord voice sits under the bass
     4. UNISON          two parts should not land the same pitch at the same
                        instant, which is a part disappearing rather than a chord

   Reported per genre, over N seeds, as a rate -- never as a pass/fail on one
   song. Some of these SHOULD be non-zero: a passing tone is a non-chord tone
   that resolves, and a genre with a drone will collide with itself by design.
   The number is the point, not the verdict.

     node harness/probe_theory.js [nSeeds]
*/
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const N = parseInt(process.argv[2], 10) || 20;

/* the scale degrees of each mode, as semitone offsets from the root */
const MODES = {
  major:      [0, 2, 4, 5, 7, 9, 11],
  minor:      [0, 2, 3, 5, 7, 8, 10],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  phrygian:   [0, 1, 3, 5, 7, 8, 10],
  lydian:     [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian:    [0, 1, 3, 5, 6, 8, 10],
  aeolian:    [0, 2, 3, 5, 7, 8, 10],
};

console.log(`\n=== the music laws, read off the notes (${N} seeds per genre) ===\n`);
console.log("  genre        out of key   NCT unresolved   chord<bass   lead<chord   unisons");
const PITCHED = new Set(["bass", "keys", "lead", "counter", "ostinato", "pad", "harmony"]);

for(const g of M.genres()){
  let notes = 0, outKey = 0, nct = 0, nctBad = 0, cb = 0, lc = 0, uni = 0, frames = 0;
  for(let s = 1; s <= N; s++){
    const song = M.composeSong(s, "draw", g);
    const scale = MODES[song.chart.mode] || MODES.minor;
    const root = song.chart.root;
    const ev = song.perf.events.filter(e => PITCHED.has(e.role) && e.pitch != null)
                               .sort((a, b) => a.tSec - b.tSec);

    /* 1. in key */
    for(const e of ev){
      notes++;
      const pc = ((e.pitch - root) % 12 + 12) % 12;
      if(!scale.includes(pc)) outKey++;
    }

    /* 2. non-chord tones. The chord under a note is whatever the BASS is
       sounding at that instant plus the keys stack -- this engine does not
       hand out a chord symbol per event, so the chord is READ from what is
       playing, which is the same thing a listener does. */
    const byRole = {};
    for(const e of ev) (byRole[e.role] || (byRole[e.role] = [])).push(e);
    const keys = byRole.keys || byRole.harmony || [];
    for(const role of ["lead", "counter"]){
      const line = byRole[role] || [];
      for(let i = 0; i < line.length - 1; i++){
        const e = line[i], nx = line[i + 1];
        /* the chord sounding at e.tSec */
        const under = new Set();
        for(const k of keys){
          if(k.tSec > e.tSec + 1e-6) break;
          if(k.tSec + k.durSec > e.tSec + 1e-6) under.add(((k.pitch % 12) + 12) % 12);
        }
        if(!under.size) continue;
        const pc = ((e.pitch % 12) + 12) % 12;
        if(under.has(pc)) continue;              // a chord tone; nothing to resolve
        nct++;
        if(Math.abs(nx.pitch - e.pitch) > 2) nctBad++;
      }
    }

    /* 3. register, sampled on a grid so it is a fact about the SOUND rather
       than about note starts */
    const spb = song.motion.spb;
    for(let t = 0; t < song.perf.seconds; t += spb * 4){
      const on = ev.filter(e => e.tSec <= t && e.tSec + e.durSec > t);
      if(!on.length) continue;
      frames++;
      const lo = r => { const p = on.filter(e => e.role === r).map(e => e.pitch); return p.length ? Math.min(...p) : null; };
      const hi = r => { const p = on.filter(e => e.role === r).map(e => e.pitch); return p.length ? Math.max(...p) : null; };
      const bassHi = hi("bass"), keysLo = lo("keys") ?? lo("harmony");
      const keysHi = hi("keys") ?? hi("harmony"), leadLo = lo("lead");
      if(bassHi != null && keysLo != null && keysLo < bassHi) cb++;
      if(keysHi != null && leadLo != null && leadLo < keysHi) lc++;
      /* 4. unisons: two DIFFERENT roles on the same pitch at the same instant */
      const seen = {};
      for(const e of on){
        const k = e.pitch;
        if(seen[k] != null && seen[k] !== e.role){ uni++; break; }
        seen[k] = e.role;
      }
    }
  }
  const pc = (x, d) => d ? (100 * x / d).toFixed(1) + "%" : "  -  ";
  console.log(`  ${g.padEnd(12)} ${pc(outKey, notes).padStart(9)}   ` +
              `${(nct ? (100 * nctBad / nct).toFixed(1) + "%" : "  -  ").padStart(12)}   ` +
              `${pc(cb, frames).padStart(9)}   ${pc(lc, frames).padStart(9)}   ${pc(uni, frames).padStart(7)}`);
}
console.log("\n  NCT unresolved = of the lead/counter notes that are NOT in the chord under them,");
console.log("  the share that then LEAP away (>2 semitones) instead of resolving by step.");
