#!/usr/bin/env node
/* ══ THE PIANO ROLL ═══════════════════════════════════════════════════════════

   The whole song, every instrument, drawn the way the program's own roll draws
   it: pitch up the page, time across it, one colour a part, the kit in its own
   band underneath. It writes ONE HTML FILE you open and read.

   The first version of this printed the roll as characters in the terminal.
   Four bars fitted across eighty columns, so a 476-bar record was a hundred and
   eighteen separate blocks and you could not see a phrase, let alone a song.
   A roll whose whole purpose is showing you the shape of a record has to put
   the record on one page.

     node harness/mk2_roll.js                  every genre, seed 1 + a drawn one
     node harness/mk2_roll.js --genre lofi     one genre
     node harness/mk2_roll.js --seed 7         one seed
     node harness/mk2_roll.js --out roll.html  where to write it

   It reads `Deckards Orchestrator MK2.html` and names the file it read on the
   page, so which program was drawn is never a silent default.
   ══════════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");

const HTML = path.join(__dirname, "..", "Deckards Orchestrator MK2.html");
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function load(){
  const src = fs.readFileSync(HTML, "utf8").split("<script>")[1].split("</script>")[0];
  global.window = { addEventListener(){}, MK2: null };
  global.document = { getElementById: () => ({ addEventListener(){}, textContent: "",
                                               value: "1", innerHTML: "" }),
                      createElement: () => ({ click(){} }) };
  eval(src);
  return global.window.MK2;
}

/* one record, reduced to what the roll needs: notes in BARS, because the clock
   owns bar<->time and a record whose tempo moves would be drawn against the
   wrong grid if this divided seconds by "a bar" */
function record(M, genre, seed){
  const song  = M.composeSong(seed, undefined, genre, undefined, undefined,
                              undefined, 0, undefined, undefined);
  const clock = M.makeClock(song.chart, song.form);
  const barOf = t => clock.barAt(t);

  const notes = [], drums = [];
  for(const ev of song.perf.events){
    if(ev.role === "tape") continue;
    const b = barOf(ev.tSec);
    const w = barOf(ev.tSec + (ev.durSec || 0)) - b;
    if(ev.role === "drums"){
      drums.push({ b, lane: ev.lane || ev.voice || "kit", g: +(ev.gain || 0).toFixed(3) });
    } else if(ev.pitch != null){
      notes.push({ b: +b.toFixed(4), w: +Math.max(w, 0.01).toFixed(4),
                   k: ev.pitch, r: ev.role, g: +(ev.gain || 0).toFixed(3) });
    }
  }
  const sections = song.form.map(s => ({ fn: s.fn, a: s.startBar, z: s.endBar }));
  const nBars = song.form.reduce((m, s) => Math.max(m, s.endBar), 0);
  return { genre, seed, mode: song.chart.mode, tempo: Math.round(song.chart.tempo),
           nBars, sections, notes, drums,
           secs: +clock.at(nBars).toFixed(2) };
}

function page(records, readFrom){
  const data = JSON.stringify(records);
  return `<title>Deckard's Orchestrator — the piano roll</title>
<style>
  :root{
    --bg:#0d1013; --panel:#151a1f; --ink:#dfe7ec; --dim:#7d8b95;
    --line:#232c33; --line2:#2e3a43; --black-key:#11161a;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
       font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  header{padding:10px 14px;border-bottom:1px solid var(--line);background:var(--panel);
         position:sticky;top:0;z-index:5}
  h1{margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:.02em}
  h1 span{color:var(--dim);font-weight:400}
  .bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  label{color:var(--dim)}
  select,button{background:#1d242a;color:var(--ink);border:1px solid var(--line2);
                border-radius:4px;padding:3px 7px;font:inherit}
  button{cursor:pointer}
  button:hover{background:#263037}
  input[type=range]{width:190px;vertical-align:middle}
  #legend{display:flex;gap:6px;flex-wrap:wrap}
  .lg{display:flex;align-items:center;gap:5px;padding:2px 8px;border-radius:11px;
      border:1px solid var(--line2);cursor:pointer;user-select:none}
  .lg .sw{width:9px;height:9px;border-radius:2px}
  .lg.off{opacity:.3}
  #wrap{overflow:auto;height:calc(100vh - 108px)}
  canvas{display:block}
  #tip{position:fixed;pointer-events:none;background:#0b0e11;border:1px solid var(--line2);
       border-radius:4px;padding:4px 7px;font-size:11px;display:none;z-index:9;
       box-shadow:0 3px 14px #0009}
  .meta{color:var(--dim)}
</style>
<header>
  <h1>THE PIANO ROLL <span>— the whole record, every instrument · read from ${readFrom}</span></h1>
  <div class="bar">
    <label>record <select id="pick"></select></label>
    <label>zoom <input type="range" id="zoom" min="0" max="100" value="0"></label>
    <button id="fit">fit</button>
    <span class="meta" id="meta"></span>
  </div>
  <div class="bar" style="margin-top:8px"><div id="legend"></div></div>
</header>
<div id="wrap"><canvas id="c"></canvas></div>
<div id="tip"></div>
<script>
const RECORDS = ${data};
const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const BLACK = {1:1,3:1,6:1,8:1,10:1};
const nn = k => NOTE[((k%12)+12)%12] + (Math.floor(k/12)-1);

const GUT = 46;          // the pitch gutter
const SEMI = 7;          // pixels a semitone
const DRUM = 10;         // pixels a kit lane — a label has to fit in one
const GAP  = 12;         // the rule between the band and the kit
const HEAD = 34;         // bar numbers and section names

let REC = RECORDS[0], PXBAR = 40, OFF = {};

/* one colour a part, spread the way the program spreads them */
function hues(rec){
  const roles = [...new Set(rec.notes.map(n => n.r))];
  const order = ["lead","counter","keys2","keys","ostinato","bass","drone"];
  roles.sort((a,z) => (order.indexOf(a)+99)%99 - (order.indexOf(z)+99)%99);
  const out = {}, span = Math.max(1, roles.length - 1);
  roles.forEach((r,i) => out[r] = 15 + Math.round(265 * i / span));
  /* THE KIT IS NOT GIVEN A HUE OUT OF THE SAME SPREAD. Seven parts across
     15..280 leaves no gap wide enough, and the first draw of this put the kit
     on the same cyan as the keys in lofi and the ostinato in fantasy synth —
     two legend chips the same colour is a roll that lies about who is playing.
     The kit is drawn desaturated instead: the parts carry the colour, the kit
     carries the texture, and neither can be mistaken for the other. */
  return out;
}
let HUE = hues(REC);

function lanes(rec){ return [...new Set(rec.drums.map(d => d.lane))].sort(); }
function range(rec){
  let lo = 999, hi = -999;
  for(const n of rec.notes){ if(n.k < lo) lo = n.k; if(n.k > hi) hi = n.k; }
  if(lo > hi){ lo = 48; hi = 72; }
  return [lo - 1, hi + 1];
}

const c = document.getElementById("c"), ctx = c.getContext("2d");
const wrap = document.getElementById("wrap");

function draw(){
  const [lo, hi] = range(REC);
  const LN = lanes(REC);
  const band = (hi - lo + 1) * SEMI;
  const H = HEAD + band + GAP + LN.length * DRUM + 10;
  const W = GUT + REC.nBars * PXBAR + 20;
  const dpr = window.devicePixelRatio || 1;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + "px"; c.style.height = H + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);

  const yOf = k => HEAD + (hi - k) * SEMI;
  const xOf = b => GUT + b * PXBAR;

  ctx.fillStyle = "#0d1013"; ctx.fillRect(0,0,W,H);

  /* black-key rows, so the octaves are readable without counting */
  for(let k = lo; k <= hi; k++){
    if(!BLACK[((k%12)+12)%12]) continue;
    ctx.fillStyle = "#11161a";
    ctx.fillRect(GUT, yOf(k), W - GUT, SEMI);
  }
  /* the C lines */
  ctx.strokeStyle = "#2e3a43"; ctx.lineWidth = 1;
  ctx.fillStyle = "#7d8b95"; ctx.font = "10px ui-monospace,monospace";
  for(let k = lo; k <= hi; k++){
    if(((k%12)+12)%12 !== 0) continue;
    const y = Math.round(yOf(k) + SEMI) - 0.5;
    ctx.beginPath(); ctx.moveTo(GUT, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.fillText(nn(k), 6, y - 1);
  }

  /* the sections, named, alternating so the form is visible at a glance */
  let i = 0;
  for(const s of REC.sections){
    const x0 = xOf(s.a), x1 = xOf(s.z);
    ctx.fillStyle = (i++ % 2) ? "#151a1f" : "#1a2128";
    ctx.fillRect(x0, 0, x1 - x0, HEAD - 12);
    ctx.strokeStyle = "#2e3a43";
    ctx.beginPath(); ctx.moveTo(Math.round(x0)-0.5, 0);
    ctx.lineTo(Math.round(x0)-0.5, H); ctx.stroke();
    ctx.fillStyle = "#9fb0bb"; ctx.font = "10px ui-monospace,monospace";
    const lbl = s.fn + " " + (s.z - s.a);
    if(x1 - x0 > ctx.measureText(lbl).width + 8) ctx.fillText(lbl, x0 + 4, 12);
  }

  /* bar lines and numbers */
  const every = PXBAR < 12 ? 16 : PXBAR < 26 ? 8 : PXBAR < 60 ? 4 : 1;
  ctx.font = "9px ui-monospace,monospace";
  for(let b = 0; b <= REC.nBars; b++){
    const x = Math.round(xOf(b)) - 0.5;
    ctx.strokeStyle = (b % every === 0) ? "#232c33" : "rgba(35,44,51,.45)";
    ctx.beginPath(); ctx.moveTo(x, HEAD - 12); ctx.lineTo(x, H); ctx.stroke();
    if(b % every === 0){
      ctx.fillStyle = "#5d6b75";
      ctx.fillText(String(b), x + 2, HEAD - 3);
    }
  }

  /* THE NOTES */
  for(const n of REC.notes){
    if(OFF[n.r]) continue;
    const x = xOf(n.b), w = Math.max(1.5, n.w * PXBAR - 0.5);
    const L = 34 + 30 * Math.min(1, n.g);
    ctx.fillStyle = "hsl(" + (HUE[n.r]||120) + " 85% " + L.toFixed(0) + "%)";
    ctx.fillRect(x, yOf(n.k), w, SEMI - 1);
  }

  /* AND THE KIT, in its own band under the rule */
  const dy0 = HEAD + band + GAP;
  ctx.strokeStyle = "#2e3a43";
  ctx.beginPath(); ctx.moveTo(0, dy0 - GAP/2 - 0.5); ctx.lineTo(W, dy0 - GAP/2 - 0.5); ctx.stroke();
  ctx.font = "8px ui-monospace,monospace";
  LN.forEach((ln, li) => {
    ctx.fillStyle = (li % 2) ? "#4b5761" : "#6b7883";
    ctx.fillRect(GUT, dy0 + li*DRUM, W - GUT, DRUM - 1);
    ctx.fillStyle = "#0d1013"; ctx.fillRect(GUT, dy0 + li*DRUM, W - GUT, DRUM - 1);
    ctx.fillStyle = "#6b7883";
    ctx.fillText(ln.slice(0,7), 4, dy0 + li*DRUM + DRUM - 2);
  });
  if(!OFF.drums) for(const d of REC.drums){
    const li = LN.indexOf(d.lane);
    const L = 30 + 34 * Math.min(1, d.g);
    ctx.fillStyle = "hsl(208 14% " + (L + 8).toFixed(0) + "%)";
    ctx.fillRect(xOf(d.b), dy0 + li*DRUM, Math.max(2, PXBAR/16 - 0.5), DRUM - 1);
  }

  document.getElementById("meta").textContent =
    REC.genre + " · seed " + REC.seed + " · " + REC.mode + " · " + REC.nBars +
    " bars · " + Math.floor(REC.secs/60) + ":" + String(Math.floor(REC.secs%60)).padStart(2,"0") +
    " · " + REC.tempo + " bpm · " + REC.sections.length + " sections · " +
    REC.notes.length + " notes";
}

function legend(){
  const el = document.getElementById("legend"); el.innerHTML = "";
  const roles = [...new Set(REC.notes.map(n=>n.r))];
  if(REC.drums.length) roles.push("drums");
  for(const r of roles){
    const d = document.createElement("div");
    d.className = "lg" + (OFF[r] ? " off" : "");
    const sw = r === "drums" ? "hsl(208 14% 62%)" : "hsl("+(HUE[r]||120)+" 85% 55%)";
    d.innerHTML = '<span class="sw" style="background:'+sw+'"></span>'+r;
    d.onclick = () => { OFF[r] = !OFF[r]; legend(); draw(); };
    el.appendChild(d);
  }
}

function fit(){
  PXBAR = Math.max(2, (wrap.clientWidth - GUT - 24) / REC.nBars);
  document.getElementById("zoom").value = 0;
  draw();
}

const pick = document.getElementById("pick");
RECORDS.forEach((r,i) => {
  const o = document.createElement("option");
  o.value = i; o.textContent = r.genre + " · seed " + r.seed + " · " + r.nBars + " bars";
  pick.appendChild(o);
});
pick.onchange = () => { REC = RECORDS[+pick.value]; HUE = hues(REC); OFF = {}; legend(); fit(); };
document.getElementById("fit").onclick = fit;
document.getElementById("zoom").oninput = e => {
  const base = Math.max(2, (wrap.clientWidth - GUT - 24) / REC.nBars);
  PXBAR = base * Math.pow(120 / Math.max(base,2), +e.target.value / 100);
  draw();
};

/* hover: say what the note is, since a colour cannot */
const tip = document.getElementById("tip");
c.addEventListener("mousemove", e => {
  const rect = c.getBoundingClientRect();
  const [lo,hi] = range(REC);
  const bx = (e.clientX - rect.left - GUT) / PXBAR;
  const k  = hi - Math.floor((e.clientY - rect.top - HEAD) / SEMI);
  let found = null;
  for(const n of REC.notes){
    if(OFF[n.r] || n.k !== k) continue;
    if(bx >= n.b && bx <= n.b + n.w){ found = n; break; }
  }
  if(found){
    tip.style.display = "block";
    tip.style.left = (e.clientX + 12) + "px";
    tip.style.top  = (e.clientY + 12) + "px";
    tip.textContent = found.r + " · " + nn(found.k) + " · bar " + Math.floor(found.b) +
                      " · " + found.w.toFixed(2) + " bars";
  } else tip.style.display = "none";
});
c.addEventListener("mouseleave", () => tip.style.display = "none");

legend(); fit();
window.addEventListener("resize", () => { if(+document.getElementById("zoom").value === 0) fit(); });
</script>`;
}

if(require.main === module){
  const argv = process.argv.slice(2);
  const argOf = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] != null ? argv[i+1] : d; };
  const M = load();
  const ONE  = argOf("--genre", null);
  const SEED = argOf("--seed", null);
  const OUT  = argOf("--out", "roll.html");

  const genres = ONE ? [ONE] : M.genres();
  for(const g of genres) if(!M.genres().includes(g)){
    console.error(`\n  mk2_roll: "${g}" is not a genre in this program.\n` +
                  `            it has: ${M.genres().join(", ")}\n`);
    process.exit(2);
  }
  const drawn = SEED != null ? [parseInt(SEED, 10)]
                             : [1, 1 + Math.floor(Math.random() * 9999)];

  const out = [];
  for(const g of genres) for(const s of drawn){
    try { out.push(record(M, g, s)); }
    catch(e){ console.error(`  ${g} seed ${s}: ${e.message}`); }
  }
  if(!out.length){ console.error("  nothing composed."); process.exit(1); }
  fs.writeFileSync(OUT, page(out, path.basename(HTML)));
  console.log(`\n  the piano roll: ${OUT}`);
  console.log(`  ${out.length} record(s), ${out.reduce((t,r)=>t+r.notes.length+r.drums.length,0)} notes`);
  for(const r of out)
    console.log(`    ${r.genre.padEnd(14)} seed ${String(r.seed).padEnd(6)} ${String(r.nBars).padStart(4)} bars   ${r.notes.length} pitched  ${r.drums.length} kit`);
  console.log("");
}
module.exports = { record, page, load };
