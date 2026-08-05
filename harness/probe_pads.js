/* THE PAD BAY, TESTED AS A UNIT.

   A Kaoss pad is not a machine with knobs -- it OWNS no controls at all. It is
   a surface that writes onto two controls belonging to somebody else, which
   makes it the one unit in the rack that `probe_rack` cannot speak for: it has
   nothing to draw, nothing to sweep, and no automation lane of its own.

   Six questions, and they are the ones you would ask with a finger on it:

     A. is every declared pad DRAWN, and wired to the two controls it names?
     B. does a real drag land where you put your finger? Four corners and the
        middle, checked against the two controls' own ranges -- which is also
        the only test that can catch an INVERTED Y, because a pad whose axes are
        both wrong still looks like it works.
     C. does one pad move ONLY its own two controls? Two pads sharing one
        surface is exactly the shape of thing where a stale key writes the
        neighbour's parameter.
     D. does the gesture reach the SOUND, on the genres that feed that unit?
     E. does HOLD do what the word says -- latched, the value stays when you
        let go; unlatched, it springs back?
     F. does the pad show the PROGRAM's hand as well as yours? The dim dot is
        where the song has those two controls right now, and it is the whole
        reason the pad shows two marks.

   A, B, C, E and F are DOM work and cost seconds. Only D renders, and it
   renders four short excerpts rather than a song.

   ONE SETUP TRAP, AND IT FAILED SILENTLY IN THE MOST CONVINCING WAY: the rack
   is a long page, and the pad bay sits about 5000 px down it. A 720 px
   viewport means `getBoundingClientRect()` hands back coordinates four
   thousand pixels below the window, `page.mouse` duly clicks empty page, and
   every control reads exactly its default -- which looks precisely like a pad
   wired to nothing. The first run of this file reported both pads dead, all
   ten corners wrong and five crosstalk events, on a unit that works. Scroll
   the pad into view and re-read the rect after scrolling.

   AND THE BASELINE IS WHAT IS THERE, NOT WHAT WAS DECLARED. The same run
   reported one pad moving the other's controls, because it compared them
   against the controls' declared defaults and the page had a genre's PARAMS
   loaded. Snapshot the values before the gesture and compare with those.

   Everything is derived from `INSTRUMENTS.pads.panel.pads` -- a third pad
   needs no edit here.

     node harness/probe_pads.js
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = process.env.MK2_HTML || path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* put the bay on screen the way a user does */
  const decl = await page.evaluate(() => {
    const M = MK2.INSTRUMENTS.pads;
    MK2.showRack(M.slot);
    if(window.drawRack) drawRack();
    return M.panel.pads.map(p => {
      const PM = MK2.INSTRUMENTS[p.m];
      const cx = PM.controls.find(c => c.k === p.x), cy = PM.controls.find(c => c.k === p.y);
      return { m: p.m, label: p.label, x: p.x, y: p.y,
               cx: cx ? { min: cx.min, max: cx.max, def: cx.def, cap: cx.cap } : null,
               cy: cy ? { min: cy.min, max: cy.max, def: cy.def, cap: cy.cap } : null };
    });
  });
  await page.waitForTimeout(300);

  console.log("\n=== the pad bay ===\n");
  console.log("A. DECLARED vs DRAWN");
  const drawn = await page.evaluate(() =>
    [...document.querySelectorAll('.padcell')].map(c => ({
      name: (c.querySelector('.padname') || {}).textContent || '',
      key:  (c.querySelector('.xypad') || {}).dataset ? c.querySelector('.xypad').dataset.key : null,
      lab:  (c.querySelector('.xylab') || {}).textContent || '',
      hold: !!c.querySelector('.pill'),
    })));
  let bad = 0;
  for(let i = 0; i < decl.length; i++){
    const d = decl[i], g = drawn[i];
    const wantKey = d.m + "." + d.x;
    const ok = g && g.key === wantKey && d.cx && d.cy && g.hold &&
               g.lab.includes(d.cx.cap) && g.lab.includes(d.cy.cap);
    if(!ok) bad++;
    console.log("     " + (d.label || d.m).padEnd(16) + d.m + "." + d.x + " / " + d.m + "." + d.y +
      "   " + (g ? "drawn" : "<<< NOT DRAWN") +
      (g && g.key !== wantKey ? "  <<< wired to " + g.key : "") +
      (g && !g.hold ? "  <<< no HOLD key" : "") +
      (g && d.cx && d.cy && !(g.lab.includes(d.cx.cap) && g.lab.includes(d.cy.cap))
        ? "  <<< axes labelled \"" + g.lab + "\"" : ""));
  }
  console.log("     " + drawn.length + " of " + decl.length + " pads drawn" +
              (bad ? "   <<< " + bad + " WRONG" : ", each wired to the two controls it names"));

  /* ── B and C: drag to five places, read the controls ─────────────────────── */
  const SPOTS = [["bottom left", 0.02, 0.98], ["top right", 0.98, 0.02],
                 ["top left", 0.02, 0.02], ["bottom right", 0.98, 0.98],
                 ["middle", 0.50, 0.50]];
  console.log("\nB. DOES A DRAG LAND WHERE THE FINGER WENT");
  console.log("     (wanted / got, for the two controls the pad names)\n");
  let miss = 0, bleed = 0;
  for(let i = 0; i < decl.length; i++){
    const d = decl[i];
    if(!d.cx || !d.cy) continue;
    const box = await page.evaluate(i => {
      const p = document.querySelectorAll('.padcell')[i].querySelector('.xypad');
      p.scrollIntoView({ block: 'center' });          // or the mouse lands 4000 px away
      const r = p.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, i);
    /* what the OTHER pads' controls read BEFORE this pad is touched */
    const before = await page.evaluate(others =>
      others.map(o => [MK2.panelValue(o.m, o.x), MK2.panelValue(o.m, o.y)]),
      decl.filter((_, j) => j !== i).map(o => ({ m: o.m, x: o.x, y: o.y })));
    console.log("     " + (d.label || d.m));
    for(const [name, fx, fy] of SPOTS){
      /* a real pointer gesture, not a synthetic value write */
      await page.mouse.move(box.x + box.w * fx, box.y + box.h * fy);
      await page.mouse.down();
      await page.mouse.move(box.x + box.w * fx, box.y + box.h * fy);
      await page.mouse.up();
      const got = await page.evaluate(([m, x, y, others]) => ({
        vx: MK2.panelValue(m, x), vy: MK2.panelValue(m, y),
        /* and what the OTHER pads' controls read, for the crosstalk half */
        o: others.map(o => [MK2.panelValue(o.m, o.x), MK2.panelValue(o.m, o.y)]),
      }), [d.m, d.x, d.y, decl.filter((_, j) => j !== i).map(o => ({ m: o.m, x: o.x, y: o.y }))]);
      /* screen Y is DOWN and a pad's Y is UP: fy 0.02 is the TOP, so max */
      const wx = d.cx.min + fx * (d.cx.max - d.cx.min);
      const wy = d.cy.min + (1 - fy) * (d.cy.max - d.cy.min);
      const tolX = (d.cx.max - d.cx.min) * 0.06, tolY = (d.cy.max - d.cy.min) * 0.06;
      const okX = Math.abs(got.vx - wx) <= tolX, okY = Math.abs(got.vy - wy) <= tolY;
      if(!okX || !okY) miss++;
      console.log("       " + name.padEnd(13) +
        d.cx.cap.padEnd(7) + "want " + wx.toPrecision(3).padStart(9) + "  got " + got.vx.toPrecision(3).padStart(9) +
        (okX ? "" : "   <<< OFF") + "     " +
        d.cy.cap.padEnd(7) + "want " + wy.toPrecision(3).padStart(9) + "  got " + got.vy.toPrecision(3).padStart(9) +
        (okY ? "" : "   <<< OFF"));
      /* the other pads must read what they read before this one was touched */
      const others = decl.filter((_, j) => j !== i);
      for(let k = 0; k < others.length; k++){
        const o = others[k];
        if(!o.cx || !o.cy) continue;
        if(Math.abs(got.o[k][0] - before[k][0]) > 1e-9 || Math.abs(got.o[k][1] - before[k][1]) > 1e-9){
          bleed++;
          console.log("         <<< AND IT MOVED " + (o.label || o.m) + ": " +
            o.x + "=" + got.o[k][0] + " " + o.y + "=" + got.o[k][1]);
        }
      }
    }
    /* put it back before testing the next pad */
    await page.evaluate(([m, x, y]) => { delete MK2.TRIM[m + "." + x]; delete MK2.TRIM[m + "." + y];
                                         if(window.refreshKnobs) refreshKnobs(); }, [d.m, d.x, d.y]);
  }
  console.log("\n     " + (miss ? miss + " corner(s) landed somewhere else" : "every corner and the middle land where the finger went") +
              "; " + (bleed ? bleed + " time(s) a pad moved another pad's controls" : "no pad touched another pad's controls"));

  /* ── E: HOLD ─────────────────────────────────────────────────────────────── */
  console.log("\nE. DOES HOLD DO WHAT THE WORD SAYS");
  for(let i = 0; i < decl.length; i++){
    const d = decl[i];
    const box = await page.evaluate(i => {
      const p = document.querySelectorAll('.padcell')[i].querySelector('.xypad');
      p.scrollIntoView({ block: 'center' });
      const r = p.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    }, i);
    const grab = async () => {
      await page.mouse.move(box.x + box.w * 0.8, box.y + box.h * 0.2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.w * 0.8, box.y + box.h * 0.2);
      await page.mouse.up();
    };
    await grab();
    const held = await page.evaluate(([m, x]) => MK2.TRIM[m + "." + x] !== undefined, [d.m, d.x]);
    /* switch HOLD off: the machine's own latch key, so the pad springs back */
    await page.evaluate(i => document.querySelectorAll('.padcell')[i].querySelector('.pill').click(), i);
    const released = await page.evaluate(([m, x]) => MK2.TRIM[m + "." + x] === undefined, [d.m, d.x]);
    await grab();
    const springs = await page.evaluate(([m, x]) => MK2.TRIM[m + "." + x] === undefined, [d.m, d.x]);
    await page.evaluate(i => document.querySelectorAll('.padcell')[i].querySelector('.pill').click(), i);
    console.log("     " + (d.label || d.m).padEnd(16) +
      "latched: value stays after you let go  " + (held ? "yes" : "<<< NO") +
      " · unlatching drops it  " + (released ? "yes" : "<<< NO") +
      " · unlatched: springs back  " + (springs ? "yes" : "<<< NO"));
  }

  /* ── D: DOES THE GESTURE REACH THE SOUND, and on which genres ─────────────
     The question this whole unit exists to answer: "I've been unable to notice
     it work." Render the same excerpt twice -- pad untouched, then pad in its
     far corner -- and take the difference signal. That difference IS the pad.

     Every genre, because which ones a pad can be heard on is a FACT ABOUT THE
     GENRE (what it sends to that unit), not something to assume: the echo pad
     rides a return every genre feeds, the flanger's is fed by three. Asking all
     seven is the only way the answer stays true when a genre's feeds change. */
  console.log("\nD. DOES THE GESTURE REACH THE SOUND");
  console.log("     (the pad's whole travel, as a difference against the mix)\n");
  const heard = await page.evaluate(async pads => {
    const SECS = 4;
    const out = [];
    for(const p of pads){
      const PM = MK2.INSTRUMENTS[p.m];
      const cx = PM.controls.find(c => c.k === p.x), cy = PM.controls.find(c => c.k === p.y);
      const row = { label: p.label || p.m, per: [] };
      for(const g of MK2.genres()){
        MK2.loadParams(g);
        const song = MK2.composeSong(11, undefined, g);
        const S = MK2.soundOf(g);
        /* ── THREE WINDOWS, NOT ONE, AND TAKE THE LOUDEST ────────────────────
           A unit whose SEND is section-keyed is shut for most of the record by
           design -- synthwave's flanger is opened through the chorus from a
           base of zero -- so one excerpt from the middle of the song measures
           whichever section it happened to land in and calls the pad dead. The
           question is "can this pad be heard on this genre", not "is it
           audible at 50% of the way through", so sample across the record and
           report the best case. */
        const spb = (60 / song.chart.tempo) / 4, bars = song.chart.bars || 64;
        let best = -Infinity;
        for(const at of [0.25, 0.5, 0.75]){
          const a = Math.floor(bars * at) * 16 * spb;
          const ev = song.perf.events
            .filter(e => e.voice === 'tape' || (e.tSec >= a && e.tSec < a + SECS))
            .map(e => e.voice === 'tape' ? Object.assign({}, e, { tSec: 0, durSec: SECS + 2 })
                                         : Object.assign({}, e, { tSec: e.tSec - a }));
          const render = async () => {
            const blob = await MK2.renderWav(ev, SECS, 44100, S.space, S.kick, S.drumDrive,
                                             S.gate, song.motion, a);
            const ab = await blob.arrayBuffer(), dv = new DataView(ab);
            const n = (ab.byteLength - 44) / 2, f = new Float64Array(n);
            for(let i = 0; i < n; i++) f[i] = dv.getInt16(44 + i * 2, true) / 32768;
            return f;
          };
          const dry = await render();
          /* the far corner of the pad, written the way the pad writes it */
          MK2.TRIM[p.m + "." + p.x] = cx.max - MK2.PARAMS[p.m + "." + p.x];
          MK2.TRIM[p.m + "." + p.y] = cy.max - MK2.PARAMS[p.m + "." + p.y];
          const wet = await render();
          delete MK2.TRIM[p.m + "." + p.x]; delete MK2.TRIM[p.m + "." + p.y];
          let q = 0, r = 0;
          for(let i = 0; i < Math.min(dry.length, wet.length); i++){
            const d = wet[i] - dry[i]; q += d * d; r += dry[i] * dry[i];
          }
          const db = 10 * Math.log10((q + 1e-30) / (r + 1e-30));
          if(db > best) best = db;
        }
        row.per.push({ g, db: best });
      }
      out.push(row);
    }
    return out;
  }, decl);
  for(const r of heard){
    const loud = r.per.filter(x => x.db > -40);
    console.log("     " + r.label);
    console.log("       " + r.per.map(x => x.g + " " + x.db.toFixed(1)).join("   "));
    console.log("       audible on " + loud.length + " of " + r.per.length + " genres" +
      (loud.length === 0 ? "   <<< THIS PAD CANNOT BE HEARD ON ANY GENRE"
       : loud.length === 1 ? "   (one genre only: " + loud[0].g + ")" : ""));
  }

  /* ── F: does the pad show the PROGRAM's hand too ──────────────────────────── */
  console.log("\nF. DOES THE PAD SHOW THE SONG'S OWN HAND (the dim dot)");
  const dots = await page.evaluate(() => {
    const out = [];
    for(const p of MK2.INSTRUMENTS.pads.panel.pads){
      const rid = [];
      for(const g of MK2.genres()){
        const lanes = MK2.composeSong(11, undefined, g).motion.lanes;
        if(lanes[p.m + "." + p.x] || lanes[p.m + "." + p.y]) rid.push(g);
      }
      out.push({ m: p.m, label: p.label, rid });
    }
    return out;
  });
  for(const d of dots)
    console.log("     " + (d.label || d.m).padEnd(16) + "the song moves these two on: " +
      (d.rid.length ? d.rid.join(", ") : "<<< NO GENRE — the dot can never appear"));

  if(errs.length) console.log("\nPAGE ERRORS: " + errs.slice(0, 3).join(" | "));
  await b.close();
})();
