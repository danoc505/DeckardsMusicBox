/* ONE RACK, TESTED AS A RACK.

   The batteries ask questions ACROSS the program -- does some genre use each
   control, does every voice make a noise, does the snapshot move. Nothing has
   ever stood in front of a single machine and asked the four questions you
   would ask if you picked one up:

     A. is every knob on it DRAWN? (a control declared, loaded and automated
        and never put on the glass is the mirror of a knob that does nothing)
     B. does every knob on it REACH THE SOUND?
     C. does a channel's knob touch ITS OWN VOICE AND NOTHING ELSE? -- the one
        that has never been asked. Ten channels, six knobs each, all built by
        one loop from one letter; if a letter is crossed anywhere in that
        chain, the bass drum's filter is quietly on the snare.
     D. do its SWITCHES actually switch? A kit that loads the same voices as
        another kit, or a circuit switch that changes nothing, is a lie the
        panel tells.

     node harness/probe_rack.js [machine]        (default tr1000)

   A and D are cheap. C is the expensive one and it is done in ONE render per
   state: every voice of the machine fires once, half a second apart, so the
   difference between two renders says WHICH VOICE moved by WHEN it moved.

   AND C IS RUN IN BOTH ORDERS, WHICH IS THE WHOLE TRICK. A drum's decay runs
   into the next drum's window, so pulling the snare's fader down also removes
   the snare TAIL that was ringing under the low tom -- and the first run of
   this probe duly reported five channels "leaking" when what it had measured
   was decay and reverb. A tail only ever runs FORWARD in time. So fire the
   voices in the declared order, then again in reverse: every pair of channels
   is then tested in both directions, and a change in a voice that fires BEFORE
   the one whose knob moved cannot be a tail. That is crosstalk and nothing
   else.
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = process.env.MK2_HTML || path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const MACHINE = process.argv[2] || 'tr1000';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* ── A. DECLARED vs DRAWN ─────────────────────────────────────────────────
     Asked of the real page, not of the panel declaration: put the machine in
     its slot the way a user does, then read every control key the DOM actually
     carries. Reading `panel.top`/`panel.columns` instead would only prove the
     declaration agrees with itself. */
  const drawn = await page.evaluate(async m => {
    const M = MK2.INSTRUMENTS[m];
    MK2.showRack(M.slot);
    MK2.PICK[M.slot] = m;
    if(window.drawRack) drawRack();
    await new Promise(r => setTimeout(r, 300));
    const keys = new Set();
    for(const el of document.querySelectorAll('[data-key]')){
      const k = el.dataset.key;
      if(k && k.indexOf(m + '.') === 0) keys.add(k.slice(m.length + 1));
    }
    /* the KIT key is drawn as a SELECT, not a knob -- find it by what it does */
    for(const el of document.querySelectorAll('select'))
      if(/kit/i.test(el.className + ' ' + (el.dataset.key || '') + ' ' +
                     (el.parentElement ? el.parentElement.className : ''))) keys.add('kit');
    return { keys: [...keys], declared: M.controls.map(c => ({ k: c.k, kind: c.kind, pick: !!c.pick })) };
  }, MACHINE);

  const drawnSet = new Set(drawn.keys);
  const missing = drawn.declared.filter(c => !drawnSet.has(c.k));
  const extra = drawn.keys.filter(k => !drawn.declared.some(c => c.k === k));
  console.log("\n=== " + MACHINE + " ===\n");
  console.log("A. DECLARED vs DRAWN   " + drawn.declared.length + " declared, " +
              drawnSet.size + " on the glass");
  if(missing.length) for(const c of missing)
    console.log("     <<< DECLARED AND NEVER DRAWN: " + c.k + "  (" + c.kind + ")");
  if(extra.length) for(const k of extra)
    console.log("     <<< DRAWN AND NOT DECLARED: " + k);
  if(!missing.length && !extra.length) console.log("     every declared control is on the glass, and nothing else is");

  /* ── C. DOES A CHANNEL'S KNOB STAY ON ITS OWN CHANNEL ─────────────────────
     Every voice fires once, spaced out, in one render. Move one channel's
     control and the difference tells you which SLOT changed, and a slot is a
     voice. Derived from the panel's own column list, so a machine that grows a
     channel needs no edit here. */
  const cross = await page.evaluate(async ([m, GAP]) => {
    const M = MK2.INSTRUMENTS[m], P = M.panel;
    /* ── THE MACHINE HAS TO BE THE MACHINE THE PLAN NAMES ────────────────────
       `setSpace` reads which drum machine to wire from the SONG'S PLAN --
       `motion.drums` -- and falls back to "kit" when there is no plan. So a
       render with `motion: null` reads `kit.kMix` however hard you turn
       `tr1000.kMix`, and the first run of this probe duly reported all ten of
       this machine's faders dead. Same trap that made probe_kickpunch report
       three genres byte-identical. Pick the machine by hand, compose, and hand
       the render the plan that names it. */
    MK2.PICK.drums = m;
    const song = MK2.composeSong(11, undefined, "acid");
    MK2.loadParams("acid");
    const cols = (P.columns || []).filter(c => c.lane);
    /* one note per channel, GAP apart, in the channel's own lane. `order` is
       the list of channel indices in the order they fire. */
    const kitMap = M.kits ? M.kits.analog : M.lanes;
    const secs = 0.2 + cols.length * GAP;
    const S = MK2.soundOf("acid");
    const render = async (trims, order) => {
      const ev = order.map((ci, slot) => ({
        voice: kitMap[cols[ci].lane] || M.lanes[cols[ci].lane], role: 'drums', lane: cols[ci].lane,
        tSec: 0.10 + slot * GAP, durSec: 0.40, gain: 0.95, pitch: 45,
        slice: ci, brkRate: 1,
      }));
      for(const k in trims) MK2.TRIM[k] = trims[k];
      const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate,
                                       song.motion, 0);
      for(const k in trims) delete MK2.TRIM[k];
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
      for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
      return a;
    };
    /* the energy of the difference inside each SLOT (a slot is one voice's
       half second, in whatever order this pass fired them) */
    const slots = (A, B, order) => order.map((ci, i) => {
      const s = Math.round((0.10 + i * GAP) * 44100) * 2;
      const e = Math.min(A.length, Math.round((0.10 + i * GAP + GAP) * 44100) * 2);
      let q = 0, r = 0;
      for(let j = s; j < e; j++){ const d = B[j] - A[j]; q += d * d; r += A[j] * A[j]; }
      return 10 * Math.log10((q + 1e-30) / (r + 1e-30));
    });

    /* which control to move per channel: its own MIX, because a level is the
       one thing every channel certainly has and the one whose leak is
       unambiguous */
    const pass = async order => {
      const base = await render({}, order);
      const out = [];
      for(let i = 0; i < cols.length; i++){
        const col = cols[i], key = col.fader;
        if(!key){ out.push(null); continue; }
        const c = M.controls.find(x => x.k === key);
        if(!c){ out.push({ err: "declared nowhere" }); continue; }
        const at = MK2.panelValue(m, key);
        const moved = await render({ [m + "." + key]: c.min - at }, order);   // fader to the floor
        /* d[j] is how much CHANNEL j's window moved, indexed by channel, not
           by slot -- so the two orderings are directly comparable */
        const s = slots(base, moved, order), d = [];
        for(let j = 0; j < cols.length; j++) d[order[j]] = s[j];
        out.push({ d });
      }
      return out;
    };
    const fwd = cols.map((c, i) => i);
    const rev = fwd.slice().reverse();
    const A = await pass(fwd), B = await pass(rev);
    return { cols: cols.map(c => c.label), A, B, plays: song.motion.drums };
  }, [MACHINE, 0.5]);

  console.log("\nC. DOES A CHANNEL'S FADER STAY ON ITS OWN CHANNEL" +
              "   (the plan names " + cross.plays + ")");
  if(cross.plays !== MACHINE)
    console.log("     <<< THE PLAN DOES NOT NAME THIS MACHINE — every row below is about " +
                cross.plays + ", not " + MACHINE);
  console.log("     (how much each voice's own window changed, dB relative to itself;\n" +
              "      -0.0 means gone, a big negative number means untouched)\n");
  console.log("     " + "fader moved".padEnd(14) +
              cross.cols.map(c => c.split(" ")[0].slice(0, 5).padStart(7)).join(""));
  let leaks = 0, dead = 0, tails = 0;
  const nC = cross.cols.length;
  for(let own = 0; own < nC; own++){
    const a = cross.A[own], bb = cross.B[own];
    if(!a){ continue; }
    if(a.err){ console.log("     " + cross.cols[own].padEnd(14) + "  <<< " + a.err); continue; }
    const cells = a.d.map(v => (v <= -60 ? "  --  " : v.toFixed(1)).padStart(7)).join("");
    /* in the FORWARD pass, channel j fires before `own` when j < own; in the
       REVERSE pass, when j > own. A move in a voice that has already finished
       cannot be that voice's tail. */
    const bad = [];
    for(let j = 0; j < nC; j++){
      if(j === own) continue;
      if(j < own && a.d[j] > -60) bad.push(cross.cols[j]);
      else if(j > own && bb && bb.d[j] > -60) bad.push(cross.cols[j]);
    }
    const fwdTails = a.d.filter((v, j) => j > own && v > -60).length;
    tails += fwdTails;
    if(bad.length) leaks++;
    if(a.d[own] <= -60) dead++;
    console.log("     " + cross.cols[own].padEnd(14) + cells +
                (bad.length ? "   <<< CROSSTALK INTO " + bad.join(", ") : "") +
                (a.d[own] <= -60 ? "   <<< ITS OWN FADER DOES NOTHING" : ""));
  }
  console.log("\n     " + (leaks ? leaks + " channel(s) reach a voice that has already finished — CROSSTALK"
                                 : "no channel reaches a voice that has already finished") +
              "; " + (dead ? dead + " fader(s) dead" : "every fader silences its own voice"));
  console.log("     " + tails + " forward-only changes, which are decay and reverb tails, not wiring" +
              "\n     (both firing orders rendered; a tail cannot run backwards)");

  /* ── D. DO THE SWITCHES SWITCH ────────────────────────────────────────────
     A `switch` is the one kind the conductor never rides, so nothing in the
     program ever moves it and nothing has ever checked that moving it does
     anything. Every position of every switch, against every other position:
     two positions that render the same audio are a switch with one setting. */
  const sw = await page.evaluate(async m => {
    const M = MK2.INSTRUMENTS[m];
    MK2.PICK.drums = m;
    const song = MK2.composeSong(11, undefined, "acid");
    MK2.loadParams("acid");
    const S = MK2.soundOf("acid");
    const cols = (M.panel.columns || []).filter(c => c.lane);
    const GAP = 0.5, secs = 0.2 + cols.length * GAP;
    /* ── WHICH KIT, ASKED THE WAY THE PANEL ASKS ─────────────────────────────
       The first version of this kept its own list of kit names and chose the
       voice map itself, which made the KIT rows a test of the probe's list
       rather than of the program's switch -- and the list was already short by
       one. The panel's KIT control is a SELECT that writes `PICK.drumKit` and
       recomposes, so that is what this does, over the names the machine
       actually declares. */
    let KITNAME = null;
    const render = async () => {
      const map = (KITNAME && M.kits && M.kits[KITNAME]) || M.lanes;
      const ev = cols.map((c, i) => ({ voice: map[c.lane] || M.lanes[c.lane], role: 'drums',
        lane: c.lane, tSec: 0.10 + i * GAP, durSec: 0.40, gain: 0.95, pitch: 45,
        /* the chopper reads a slice off the event; a kit made of one recording
           needs to be told which bit of it to play */
        slice: i, brkRate: 1 }));
      const blob = await MK2.renderWav(ev, secs, 44100, S.space, S.kick, S.drumDrive, S.gate,
                                       song.motion, 0);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 2, a = new Float64Array(n);
      for(let i = 0; i < n; i++) a[i] = dv.getInt16(44 + i * 2, true) / 32768;
      return a;
    };
    const diff = (A, B) => { let q = 0, r = 0;
      for(let i = 0; i < Math.min(A.length, B.length); i++){ const d = B[i] - A[i]; q += d * d; r += A[i] * A[i]; }
      return 10 * Math.log10((q + 1e-30) / (r + 1e-30)); };

    const out = [];
    for(const c of M.controls){
      if(c.kind !== "switch") continue;
      const takes = [];
      let note = null;
      if(c.pick && M.kits){
        /* a PICK switch chooses a thing by name, so its positions are the
           things -- and how many of them there are is a fact about the machine,
           not a number typed into the control */
        const names = Object.keys(M.kits);
        const declared = Math.round((c.max - c.min) / (c.step || 1)) + 1;
        if(declared !== names.length)
          note = "declares " + declared + " positions for " + names.length + " kits (" + names.join(", ") + ")";
        for(const n of names){ KITNAME = n; takes.push({ v: n, buf: await render() }); }
        KITNAME = null;
      } else {
        const at = MK2.panelValue(m, c.k);
        for(let v = c.min; v <= c.max + 1e-9; v += (c.step || 1)){
          MK2.TRIM[m + "." + c.k] = v - at;
          takes.push({ v: Math.round(v * 1000) / 1000, buf: await render() });
        }
        delete MK2.TRIM[m + "." + c.k];
      }
      const pairs = [];
      for(let i = 0; i < takes.length; i++) for(let j = i + 1; j < takes.length; j++)
        pairs.push({ a: takes[i].v, b: takes[j].v, db: diff(takes[i].buf, takes[j].buf) });
      out.push({ k: c.k, cap: c.cap, n: takes.length, pairs, note });
    }
    return out;
  }, MACHINE);

  console.log("\nD. DO THE SWITCHES SWITCH");
  console.log("     (every position against every other; a big negative number means\n" +
              "      the two positions render the same audio)\n");
  let sameCount = 0;
  for(const s of sw){
    console.log("     " + (s.cap || s.k) + "  (" + s.k + ", " + s.n + " positions)" +
                (s.note ? "   <<< " + s.note : ""));
    for(const p of s.pairs){
      const same = p.db < -60;
      if(same) sameCount++;
      console.log("        " + String(p.a).padStart(4) + " vs " + String(p.b).padStart(4) +
                  "   " + p.db.toFixed(1).padStart(7) + " dB" +
                  (same ? "   <<< THESE TWO POSITIONS ARE THE SAME SOUND" : ""));
    }
  }
  console.log("\n     " + (sameCount ? sameCount + " pair(s) of switch positions are identical"
                                     : "every switch position sounds different from every other"));

  if(errs.length) console.log("\nPAGE ERRORS: " + errs.slice(0, 3).join(" | "));
  await b.close();
})();
