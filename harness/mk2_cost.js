#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   MK2_COST — WHAT THE RECORD COSTS TO PLAY, AND WHETHER IT CAN BE PLAYED.

       node harness/mk2_cost.js                       every genre, the cost of a cut
       node harness/mk2_cost.js doomsludge 1 655 10   one genre, one seed, one window
       node harness/mk2_cost.js doomsludge 1 655 20 --live    ...played, not rendered

   WHY THIS EXISTS. §0ah measured the fight act at 0.61x realtime in an OFFLINE
   render and then said the honest thing about its own number:

     "an offline render is not live playback ... a 0.61x here is not proof the
      page stutters — that has to be measured live, and has not been."

   It has now. `--live` drives the real play button, starts the record at a
   named second, and watches the audio clock against the wall clock. A context
   that keeps up reads 1.000; one that cannot reads short, and the shortfall IS
   the dropout. MEASURED at 2026-08-22a: lofi, synthwave, dungeon synth,
   fantasy synth and three of doomsludge's four acts all read 1.000. The FIGHT
   ACT reads 0.88. The stutter is one act of one genre and it is real.

   ── AND WHY IT COUNTS CPU-SECONDS AND NOT WALL-SECONDS ──────────────────────

   The first version of this timed renders with a wall clock on a shared
   container and produced an ablation in which REMOVING THE DRUMS MADE THE
   RECORD SLOWER. That is not a thing that can happen; it is another process
   getting a core. Wall-clock swung +-25% run to run and every attribution
   built on it was noise wearing a number's clothes.

   CPU time is what the work COSTS. Another process competing changes how long
   a render takes and not how much of a core it burns, so the figure below is
   stable to about 3% and two builds can actually be compared. The unit is
   CPU-SECONDS PER AUDIO-SECOND: 1.0 means one core, exactly, to render in real
   time — so anything at or above 1.0 has no headroom at all, because Web Audio
   renders a graph on ONE thread and cannot spread it.

   MEASURED at 2026-08-22a, doomsludge seed 1, ten-second windows:

     doom       t=270   1.19        the four acts, and the floor under them
     sludge     t=428   1.15
     THE FIGHT  t=655   1.89
     walk home  t=942   1.17
     lofi       t=30    1.19

   READ THE WALK HOME AGAIN: ten events in ten seconds, and it costs the same
   as lofi's hundred and thirty-two. **About 1.15 of this is a FLOOR that is
   paid before a single note sounds** — the strips, the buses, the returns, the
   matrix and the two worklets, some nine hundred nodes standing still. Every
   genre pays it. It is 60% of what the fight act costs and 97% of what the
   walk home costs, and no single unit in it is more than a tenth: measured by
   substituting a plain gain for each node type in turn, the 38 meter taps are
   6% of the floor, the two convolvers 9%, the four compressors 6% and the
   waveshapers 7%. It is not one expensive thing. It is nine hundred cheap ones.

   THE OTHER 40% OF THE FIGHT ACT IS ONE PART. Dropping each role in turn:

     no keys        1.23     <- the whole variable cost, in one part
     no drums       2.16     (baseline 2.18)
     no bass        2.34
     no ostinato    2.03

   `keys` plays four-note chords on `horns` five to seven times a bar there, and
   `V.horns` builds SIX sawtooth oscillators per note — so one strike of that
   chord is twenty-four oscillators, and they overlap. That is the fight act.

   NOTHING HERE IS A PASS OR A FAIL, exactly as `mk2_score.js` prints notes and
   grades nothing. It prints what the record costs and you read it.
   ═══════════════════════════════════════════════════════════════════════════ */

const path = require("path"), fs = require("fs");
const { chromium } = require(path.resolve(__dirname, "..", "node_modules", "playwright"));

const A = process.argv.slice(2);
const flag = f => A.includes(f);
const ar = (f, d) => { const i = A.indexOf(f); return i >= 0 && A[i + 1] != null ? A[i + 1] : d; };
const pos = A.filter((x, i) => !x.startsWith("--") && !(i > 0 && A[i - 1].startsWith("--")));

const GENRE = pos[0] || null;
const SEED  = +(pos[1] || 1);
const FROM  = +(pos[2] || 0);
const LEN   = +(pos[3] || 10);
const LIVE  = flag("--live");
const REPS  = +ar("--reps", "2");
const HTML  = ar("--file", null) ? path.resolve(ar("--file"))
            : path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
/* --params saw.power=0,sag.power=0 — the panel's own switches, so a unit can be
   weighed through the hand the player has rather than through an edit */
const PS = ar("--params", null) ? Object.fromEntries(ar("--params").split(",")
             .map(x => { const [k, v] = x.split("="); return [k, +v]; })) : {};
/* --drop keys,drums — a role out of the arrangement, to weigh the part itself */
const DROP = ar("--drop", null) ? ar("--drop").split(",") : [];
/* --stub Analyser,Convolver — a whole NODE TYPE replaced by a plain gain, so
   what a class of node costs can be weighed without editing the program */
const STUB = ar("--stub", null) ? ar("--stub").split(",") : [];
const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* every chrome process this launch owns. The render runs on a thread of a
   RENDERER process and not of the browser, so a single pid is the wrong unit. */
function cpuSeconds(){
  let ticks = 0;
  for(const d of fs.readdirSync("/proc")){
    if(!/^\d+$/.test(d)) continue;
    let cmd = "";
    try { cmd = fs.readFileSync(`/proc/${d}/cmdline`, "utf8"); } catch(e){ continue; }
    if(!cmd.includes("chrome-linux/chrome") && !cmd.includes("headless_shell")) continue;
    try {
      const st = fs.readFileSync(`/proc/${d}/stat`, "utf8");
      const f = st.slice(st.lastIndexOf(")") + 2).split(" ");
      ticks += (+f[11] || 0) + (+f[12] || 0);          /* utime + stime */
    } catch(e){}
  }
  return ticks / 100;                                  /* USER_HZ */
}

const INIT = (stub) => {
  window.__born = {};
  const tally = n => { window.__born[n] = (window.__born[n] || 0) + 1; };
  if(stub.length){
    /* a stand-in grows whatever the caller touches: plain properties land on the
       gain, AudioParams get a dummy that accepts every scheduling call made */
    const par = () => ({ value: 0, setValueAtTime(){ return this; }, setTargetAtTime(){ return this; },
                         linearRampToValueAtTime(){ return this; }, exponentialRampToValueAtTime(){ return this; },
                         cancelScheduledValues(){ return this; }, cancelAndHoldAtTime(){ return this; } });
    const extra = {
      Analyser: n => { n.fftSize = 2048; n.frequencyBinCount = 1024; n.smoothingTimeConstant = 0;
                       n.getByteFrequencyData = n.getFloatFrequencyData =
                       n.getByteTimeDomainData = n.getFloatTimeDomainData = () => {}; },
      Convolver: n => { n.buffer = null; n.normalize = true; },
      DynamicsCompressor: n => { for(const k of ["threshold","knee","ratio","attack","release"]) n[k] = par();
                                 n.reduction = 0; },
      WaveShaper: n => { n.curve = null; n.oversample = "none"; },
    };
    for(const t of stub)
      BaseAudioContext.prototype["create" + t] = function(){
        const n = this.createGain(); if(extra[t]) extra[t](n); return n; };
  }
  for(const f of Object.getOwnPropertyNames(BaseAudioContext.prototype)){
    if(!/^create/.test(f)) continue;
    const o = BaseAudioContext.prototype[f];
    if(typeof o !== "function") continue;
    BaseAudioContext.prototype[f] = function(...a){ tally(f.replace(/^create/, "")); return o.apply(this, a); };
  }
  const AW = window.AudioWorkletNode;
  window.AudioWorkletNode = function(c, n, o){ tally("worklet:" + n); return new AW(c, n, o); };
  window.AudioWorkletNode.prototype = AW.prototype;
  window.__ctxs = [];
  for(const K of ["AudioContext", "webkitAudioContext"]){
    const O = window[K]; if(!O) continue;
    window[K] = function(...a){ const c = new O(...a); window.__ctxs.push(c); return c; };
    window[K].prototype = O.prototype;
  }
  window.__census = () => JSON.parse(JSON.stringify(window.__born));
  window.__delta = (a, b) => { const o = {}; for(const k in b) if(b[k] - (a[k] || 0) > 0) o[k] = b[k] - (a[k] || 0); return o; };
};

async function open(){
  const b = await chromium.launch({ executablePath: CHROME, args: [
    "--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--disable-gpu"] });
  const page = await b.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(String(e.message)));
  await page.addInitScript(INIT, STUB);
  await page.goto("file://" + HTML, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 30000 });
  return { b, page, errs };
}

/* the song, the hand and the cut, set up identically for both modes */
const SETUP = async (page, g) => page.evaluate(({ g, s, ps, drop }) => {
  const sel = document.getElementById("genre");
  if(g){ sel.value = g; sel.dispatchEvent(new Event("change")); }
  newSong(s);
  for(const k in ps) MK2.PARAMS[k] = ps[k];
  if(drop.length) SONG.perf.events = SONG.perf.events.filter(e => !drop.includes(e.role));
  return { genre: SONG.chart.genre, seed: SONG.chart.seed, bars: SONG.form.nBars,
           seconds: Math.round(SONG.perf.seconds) };
}, { g, s: SEED, ps: PS, drop: DROP });

async function offline(page, g){
  const info = await SETUP(page, g);
  await page.evaluate(({ from, len }) => {
    window.__cut = SONG.perf.events.filter(e => e.tSec >= from && e.tSec < from + len)
                     .map(e => Object.assign({}, e, { tSec: e.tSec - from }));
  }, { from: FROM, len: LEN });
  const render = () => page.evaluate(async ({ from, len }) => {
    const a = window.__census();
    const S = (typeof soundNow === "function") ? soundNow() : MK2.soundOf(SONG.chart.genre);
    /* `motionOffset` is where in the record this window is, so every act's own
       settings land rather than the last one winning at t=0 */
    await MK2.renderWav(window.__cut, len, 44100, S.space, S.kick, S.drumDrive, S.gate, S.motion, from);
    window.__graph = window.__delta(a, window.__census());
  }, { from: FROM, len: LEN });
  await render();                                       /* warm: modules, buffers, JIT */
  const runs = [];
  for(let r = 0; r < REPS; r++){
    const c0 = cpuSeconds();
    await render();
    runs.push(+(cpuSeconds() - c0).toFixed(2));
  }
  runs.sort((x, y) => x - y);
  const med = runs[Math.floor(runs.length / 2)];
  const events = await page.evaluate(() => window.__cut.length);
  return { ...info, events, cpuPerAudioSec: +(med / LEN).toFixed(3), cpuSeconds: runs,
           graph: await page.evaluate(() => window.__graph) };
}

async function live(page, g){
  const info = await SETUP(page, g);
  const r = await page.evaluate(async ({ from, secs }) => {
    const a = window.__census();
    await startPlayback(from);
    const graph = window.__delta(a, window.__census());
    const c = window.__ctxs[window.__ctxs.length - 1];
    if(!c) return { err: "no AudioContext was created" };
    /* the audio clock advances as quanta are RENDERED. A thread that keeps up
       tracks the wall clock; one that cannot falls behind, and the shortfall is
       the silence the player hears. Sampled in windows, because a shared
       container's contention is a spread and should be shown as one. */
    const pts = [];
    const t0 = c.currentTime, w0 = performance.now();
    const iv = setInterval(() => pts.push([c.currentTime - t0, (performance.now() - w0) / 1000]), 250);
    await new Promise(res => setTimeout(res, secs * 1000));
    clearInterval(iv);
    try { stopPlayback(); } catch(e){}
    return { pts, graph };
  }, { from: FROM, secs: LEN });
  if(r.err) return { ...info, err: r.err };
  const pts = r.pts.filter(p => p[1] >= 1.0);           /* drop the warm-up second */
  const rat = [];
  for(let i = 4; i < pts.length; i++){
    const da = pts[i][0] - pts[i - 4][0], dw = pts[i][1] - pts[i - 4][1];
    if(dw > 0) rat.push(da / dw);
  }
  rat.sort((x, y) => x - y);
  const q = f => rat.length ? rat[Math.min(rat.length - 1, Math.floor(f * rat.length))] : 0;
  return { ...info, realtime: { median: +q(0.5).toFixed(3), best: +(rat[rat.length - 1] || 0).toFixed(3),
                                worst: +(rat[0] || 0).toFixed(3), windows: rat.length },
           graph: r.graph };
}

(async () => {
  const { b, page, errs } = await open();
  const list = GENRE ? [GENRE] : await page.evaluate(() => MK2.genres());
  const out = [];
  for(const g of list){
    const r = LIVE ? await live(page, g) : await offline(page, g);
    out.push(r);
    const head = `${(r.genre || g).padEnd(13)} seed ${String(r.seed).padEnd(5)} t=${String(FROM).padEnd(5)}`;
    if(LIVE) console.log(`  ${head}  realtime ${r.realtime ? r.realtime.median : "-"}` +
                         `   (best ${r.realtime && r.realtime.best}, worst ${r.realtime && r.realtime.worst})`);
    else     console.log(`  ${head}  ${r.cpuPerAudioSec} cpu-s per audio-s` +
                         `   (${r.events} events, runs ${JSON.stringify(r.cpuSeconds)})`);
  }
  if(errs.length) console.log("\n  page errors: " + errs.slice(0, 3).join(" | "));
  if(flag("--json")) console.log("\n" + JSON.stringify(out, null, 2));
  console.log("\n  Nothing above is a pass or a fail. 1.0 cpu-s per audio-s is one whole");
  console.log("  core, and Web Audio has exactly one thread to spend.");
  await b.close();
})();
