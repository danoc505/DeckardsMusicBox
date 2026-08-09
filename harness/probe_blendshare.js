#!/usr/bin/env node
/* PROBE_BLENDSHARE — when you set a fader to 50/50, how much of the song
   actually comes from each genre?

     node harness/probe_blendshare.js [songs] [pairA+pairB ...]
     node harness/probe_blendshare.js 30 lofi+jungle vgm+jungle
     node harness/probe_blendshare.js 30 --all        every pair, one line each

   WHY THIS EXISTS. The owner: "the genre faders are our chief rule breaking
   tool. But they are quite blind and limited." The number behind that
   complaint — a 50/50 fader producing records anywhere from 10/90 to 50/50 —
   was worked out by hand, once, and there was no tool to ask it again. So a
   change meant to fix it had nothing to prove itself against.

   WHAT IT COUNTS. A song's table is built element by element: the bass line,
   the drum kit, how the song is built, the swing, and so on. Some of those are
   averaged between the two genres and some are handed WHOLE to one of them,
   because half a switch is nothing. The handed-whole ones are what this counts:
   for each song, how many went to each genre.

   It asks the program itself — every song reports which genre it took each
   element from, so this file keeps no copy of the element list. Adding an
   element means it is counted here, with nobody remembering to come back.

   THE TWO NUMBERS THAT MATTER, and they are different questions:
     ACROSS SONGS   the average split. This was already honest (~47/53).
     INSIDE A SONG  the worst and best single record. This is the complaint. */
const fs = require("fs"), path = require("path");

const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
const src = html.split("<script>")[1].split("</script>")[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;

const SONGS = +(process.argv[2] || 30) || 30;
const GS = M.genres();
let pairs = process.argv.slice(3).filter(a => a !== "--all").map(s => s.split("+"));
if(process.argv.includes("--all") || !pairs.length){
  pairs = [];
  for(let i = 0; i < GS.length; i++) for(let j = i + 1; j < GS.length; j++) pairs.push([GS[i], GS[j]]);
}
for(const p of pairs) for(const g of p)
  if(!GS.includes(g)){ console.error("no such genre: " + g + "\n  have: " + GS.join(" ")); process.exit(2); }

/* EVERY ELEMENT EXCEPT THE GENRE'S OWN NAME. `label` is decided like the rest
   and then thrown away — the blend writes its own — so counting it would add a
   point to somebody's score for a decision nobody hears. Everything else is a
   real musical choice, including the four send lists the panel does not show
   yet. Asked of the program, not listed here. */
const WORDS = {}; for(const e of M.blendElements()) WORDS[e.key] = e.name;
const COUNTED = new Set(M.blendElements().map(e => e.key).filter(k => k !== "label"));
const say = k => WORDS[k] || k;

/* ── CONTESTED OR FORCED, AND THEY ARE NOT THE SAME COMPLAINT ───────────────
   Not every element is a lottery. `space.duck` — the kick pushing everything
   aside — is declared by lofi and by nobody else, so in any lofi blend lofi
   takes it every time. That is not the fader being blind; there was never a
   second candidate. Reporting the two together says "lofi won 30 of 30" about
   a draw with one runner in it, which reads as bias and is not.
   So: FORCED means one genre in this pair declares it, CONTESTED means both
   do. The lottery is the contested half. The forced half still counts towards
   what the record IS — it is just not something a draw could have changed. */
const declares = {};
for(const g of GS){
  const T = M.composeSong(1, undefined, g).chart.table;
  const get = p => { let v = T; for(const k of p.split(".")){ if(v == null || typeof v !== "object") return undefined; v = v[k]; } return v; };
  declares[g] = new Set(M.blendElements().filter(e => e.paths.some(p => get(p) !== undefined)).map(e => e.key));
}

const pct = x => (x * 100).toFixed(0);
const bar = x => "#".repeat(Math.round(x * 20)).padEnd(20, ".");

console.log(`\nTHE GENRE FADERS — what share of each song each genre actually wins`);
console.log(`${SONGS} songs a pair, fader at 50/50, over the ${COUNTED.size} elements a song is made of\n`);

const rows = [];
for(const [A, B] of pairs){
  const forced = [...COUNTED].filter(k => declares[A].has(k) !== declares[B].has(k));
  const both   = [...COUNTED].filter(k => declares[A].has(k) && declares[B].has(k));
  const shares = [], conShares = [], perElement = {};
  let threw = 0;
  for(let seed = 1; seed <= SONGS; seed++){
    let T;
    try { T = M.composeSong(seed, undefined, { [A]: 0.5, [B]: 0.5 }).chart.table; }
    catch(e){ threw++; continue; }
    const traits = (T.blendTraits || []).filter(t => COUNTED.has(t.key));
    if(!traits.length) continue;
    let a = 0, ca = 0, cn = 0;
    for(const t of traits){
      if(t.genre === A) a++;
      if(declares[A].has(t.key) && declares[B].has(t.key)){ cn++; if(t.genre === A) ca++; }
      (perElement[t.key] = perElement[t.key] || { [A]: 0, [B]: 0 })[t.genre]++;
    }
    shares.push(a / traits.length);
    if(cn) conShares.push(ca / cn);
  }
  if(!shares.length){ console.log(`${A} + ${B}: every song threw`); continue; }
  const stat = xs => {
    const avg = xs.reduce((x, y) => x + y, 0) / xs.length;
    /* HOW FAR FROM HALF THE WORST RECORD IS — the complaint in one number.
       0 means every song was an even split; 50 means a song was all one
       genre. The WORST single song, not the average of the misses: a
       listener plays one record, not thirty. */
    return { avg, lo: Math.min(...xs), hi: Math.max(...xs), worst: Math.max(...xs.map(s => Math.abs(s - 0.5))) };
  };
  const all = stat(shares), con = conShares.length ? stat(conShares) : null;
  rows.push({ A, B, all, con, n: shares.length, threw, perElement, forced, both });
  console.log(`${A} + ${B}   ${both.length} elements both declare, ${forced.length} only one of them does`);
  console.log(`  EVERY element   across songs ${pct(all.avg)}/${pct(1 - all.avg)} ${bar(all.avg)}` +
              `   one song ranged ${pct(all.lo)}/${pct(1 - all.lo)} .. ${pct(all.hi)}/${pct(1 - all.hi)}` +
              `, off half by up to ${pct(all.worst)}`);
  if(con)
    console.log(`  THE LOTTERY     across songs ${pct(con.avg)}/${pct(1 - con.avg)} ${bar(con.avg)}` +
                `   one song ranged ${pct(con.lo)}/${pct(1 - con.lo)} .. ${pct(con.hi)}/${pct(1 - con.hi)}` +
                `, off half by up to ${pct(con.worst)}`);
  if(threw) console.log(`  ${threw} of ${SONGS} threw`);
  if(forced.length)
    console.log(`  always ${A}: ${forced.filter(k => declares[A].has(k)).map(say).join(", ") || "none"}` +
                `  |  always ${B}: ${forced.filter(k => declares[B].has(k)).map(say).join(", ") || "none"}`);
  if(pairs.length <= 3){
    const uneven = Object.entries(perElement).filter(([k]) => both.includes(k))
      .map(([k, c]) => ({ k, a: c[A], b: c[B], skew: Math.abs(c[A] - c[B]) / (c[A] + c[B]) }))
      .sort((x, y) => y.skew - x.skew).slice(0, 5);
    console.log(`  the five most one-sided of the contested elements:`);
    for(const u of uneven)
      console.log(`    ${say(u.k).padEnd(34)} ${A} ${String(u.a).padStart(3)}  ${B} ${String(u.b).padStart(3)}`);
  }
  console.log("");
}

if(rows.length > 1){
  const byWorst = rows.slice().sort((a, b) => b.all.worst - a.all.worst)[0];
  const avgAll = rows.reduce((s, r) => s + r.all.worst, 0) / rows.length;
  const withCon = rows.filter(r => r.con);
  const avgCon = withCon.reduce((s, r) => s + r.con.worst, 0) / (withCon.length || 1);
  console.log(`─────────────────────────────────────────────────────────────`);
  console.log(`${rows.length} pairs.  Worst single record anywhere: ` +
              `${byWorst.A} + ${byWorst.B} at ${pct(byWorst.all.lo)}/${pct(1 - byWorst.all.lo)}.`);
  console.log(`Each pair's worst record is off half by ${pct(avgAll)} points counting every element,` +
              ` ${pct(avgCon)} counting only the lottery.`);
  console.log(`A fader that meant what it says would put both of those near 0.\n`);
}
