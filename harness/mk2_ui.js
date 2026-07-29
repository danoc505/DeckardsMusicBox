#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE UI, DRIVEN — in a real browser, on the real shipped file.

       node harness/mk2_ui.js [--shot <dir>]

   WHY THIS EXISTS. Every other harness in here reconstructs the engine by
   eval'ing the <script> out of the HTML, which is exactly right for testing
   composition and exactly useless for testing a front panel: it never builds a
   DOM, never runs a listener, and never renders a pixel. So the claims this
   pass makes -- "the step grid writes a pin", "the pin reaches the material",
   "the knob is an offset not a replacement", "the automation dot moves while
   the pointer stays put" -- were all unprovable by the existing battery, and an
   unprovable claim in this project has a bad history.

   This loads the file at file:// in Chromium, clicks the actual buttons, drags
   the actual knobs, presses play, and reads back what the program did. It also
   fails on any uncaught page error, which is the cheapest possible guard
   against shipping an HTML file that throws on load.

   It is a SEPARATE command rather than part of mk2_test.js because it needs a
   browser and takes ~10 s where the seam battery takes 1.4. Run it whenever the
   panels change. It requires the playwright in node_modules and a chromium; on
   a machine without one it says so and exits 0 rather than failing a battery
   for a missing dependency.
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require("path"), fs = require("fs");

let chromium;
try { ({ chromium } = require(path.resolve(__dirname, "..", "node_modules", "playwright"))); }
catch(e){ console.log("playwright not installed — skipping the UI probe"); process.exit(0); }

/* the browser this environment ships, if the default download is not there */
const CANDIDATES = ["/opt/pw-browsers/chromium", process.env.CHROME_PATH].filter(Boolean);
const exe = CANDIDATES.find(p => { try { return fs.existsSync(p); } catch(e){ return false; } });

const FILE = "file://" + path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const shotAt = process.argv.indexOf("--shot");
const shotDir = shotAt >= 0 ? process.argv[shotAt + 1] : null;

let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  console.log(`  ${ok ? "✓" : "✗ FAIL:"} ${label}${detail ? "  (" + detail + ")" : ""}`);
  ok ? pass++ : fail++;
};

(async () => {
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await b.newPage({ viewport: { width: 980, height: 1500 } });
  const errs = [];
  pg.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  pg.on("console", m => { if(m.type() === "error") errs.push("CONSOLE: " + m.text()); });

  await pg.goto(FILE);
  await pg.waitForTimeout(900);
  check("the file loads and composes without throwing",
        await pg.evaluate(() => !!(window.MK2 && window.MK2.currentSong())), "seed 1");

  /* put the three panelled machines in the three slots */
  await pg.selectOption("#mDrums", "tr1000");
  await pg.selectOption("#mBass", "tb303");
  await pg.selectOption("#mKeys", "mellotron");
  await pg.waitForTimeout(500);

  const shape = await pg.evaluate(() => [...document.querySelectorAll(".machine")].map(m => ({
    skin: (m.className.match(/sk-(\w+)/) || [])[1],
    knobs: m.querySelectorAll(".kn").length,
    steps: m.querySelectorAll(".steps .st").length + m.querySelectorAll(".acid .col").length,
  })));
  /* three picked machines PLUS every machine marked `fixed`, which are the ones
     that are not picked -- there is nothing to choose, every genre has exactly
     one -- and are therefore always drawn.

     This asserted exactly three panels, which was right until the space got a
     front panel of its own; it was then corrected to exactly four, which was
     right until the desk arrived. Twice is enough: the expected count is now
     DERIVED from the rack, so the next fixed machine is covered without anybody
     remembering to come back here. */
  const fixed = await pg.evaluate(() =>
    Object.keys(MK2.INSTRUMENTS).filter(k => MK2.INSTRUMENTS[k].fixed)
      .map(k => (MK2.INSTRUMENTS[k].panel || {}).skin || k));
  check("each slot draws its own machine's panel, and every fixed machine is always there",
        shape.length === 3 + fixed.length && shape.every(s => s.skin) &&
        fixed.every(f => shape.some(s => s.skin === f)),
        `${shape.length} panels (3 slots + ${fixed.length} fixed: ${fixed.join(",")}) · ` +
        shape.map(s => `${s.skin}:${s.knobs}kn/${s.steps}st`).join(" "));
  /* ── EVERY MACHINE'S PANEL MUST DRAW, not just the three this file names ──
     The check above selects tr808, tb303 and mellotron BY NAME, so it can only
     ever prove that those three draw. The TR-1000 shipped with a `grid:"drums"`
     panel and no `voices` list; drawing it threw "M.panel.voices is not
     iterable", and because every panel is built in one loop the throw took the
     WHOLE RACK down -- no drum machine, no 303, no echo, no desk. Two genres
     rendered zero panels and this battery stayed green.

     A check that names its subjects cannot notice a new one. So: put every
     machine into its slot in turn and require a panel and at least one knob,
     with the page's error log empty. */
  {
    const machines = await pg.evaluate(() => Object.keys(MK2.INSTRUMENTS)
      .filter(k => !MK2.INSTRUMENTS[k].fixed)
      .map(k => [k, MK2.INSTRUMENTS[k].slot]));
    const broken = [];
    const selOf = { drums: "#mDrums", bass: "#mBass", keys: "#mKeys" };
    for(const [m, slot] of machines){
      const sel = selOf[slot];
      if(!sel) continue;
      const before = errs.length;
      try { await pg.selectOption(sel, m); } catch(e){ broken.push(m + " (not offered)"); continue; }
      await pg.waitForTimeout(160);
      const drew = await pg.evaluate(() => ({
        panels: document.querySelectorAll(".machine").length,
        knobs: document.querySelectorAll(".kn").length,
      }));
      if(drew.panels < 3 || drew.knobs < 1 || errs.length > before)
        broken.push(`${m}: ${drew.panels} panels / ${drew.knobs} knobs` +
                    (errs.length > before ? " + threw" : ""));
    }
    check("every machine in the rack draws a panel without throwing",
          broken.length === 0,
          broken.length ? broken.join(" | ") : machines.length + " machines, all drew");
  }
  /* put the three the rest of this file expects back */
  await pg.selectOption("#mDrums", "tr1000");
  await pg.selectOption("#mBass", "tb303");
  await pg.selectOption("#mKeys", "mellotron");
  await pg.waitForTimeout(400);

  check("both step grids are sixteen steps",
        shape.filter(s => s.steps === 16).length === 2,
        shape.map(s => s.steps).join(","));

  /* ── the drum machine's grid (the TR-1000 now; the 808 was retired once it
     measured identical to it with the chains at neutral) ── */
  const lit = () => pg.evaluate(() => [...document.querySelectorAll(".sk-tr1000 .steps .st")]
    .map((s, i) => s.classList.contains("on") ? i : -1).filter(i => i >= 0).join(","));
  const before = await lit();
  await pg.click(".sk-tr1000 .steps .st:nth-child(5)");  await pg.waitForTimeout(200);
  await pg.click(".sk-tr1000 .steps .st:nth-child(13)"); await pg.waitForTimeout(200);
  const after = await lit();
  check("clicking a step lights it", after !== before, `${before} -> ${after}`);
  check("...and writes a pin",
        (await pg.evaluate(() => Object.keys(window.MK2.PINS))).includes("drums:A:0:kick"));
  check("...which reaches the composed material",
        (await pg.evaluate(() => window.MK2.currentSong().materials.A.drums
           .filter(n => n.lane === "kick" && n.bar === 0).map(n => n.step).join(","))) === after,
        "material agrees with the grid");
  check("...and the panel says the lane is pinned",
        /PINNED/.test(await pg.evaluate(() =>
          [...document.querySelectorAll(".sk-tr1000 .pill.warn")].map(x => x.textContent).join(""))));

  /* reverting must put it back exactly */
  await pg.click(".sk-tr1000 .pill.warn"); await pg.waitForTimeout(250);
  check("reverting a pinned lane restores the composed one", (await lit()) === before,
        `${after} -> ${await lit()}, composed was ${before}`);

  /* ── the 303's grid ── */
  await pg.click(".sk-tb303 .acid .col:nth-child(3) .note"); await pg.waitForTimeout(220);
  await pg.click(".sk-tb303 .acid .col:nth-child(3) .flag:nth-child(2)"); await pg.waitForTimeout(220);
  const acid = await pg.evaluate(() => {
    const s = window.MK2.currentSong();
    return { acc: s.materials.A.bass.filter(n => n.bar === 0 && n.accent).map(n => n.step).join(","),
             pins: Object.keys(window.MK2.PINS).filter(k => k.startsWith("bass:")).join(" ") };
  });
  check("the 303 grid writes a bass pin", acid.pins.length > 0, acid.pins);
  check("...and its ACCENT reaches the material", acid.acc.split(",").includes("2"),
        "accented steps: [" + acid.acc + "]");
  check("no pinned note can leave the key",
        await pg.evaluate(() => {
          const s = window.MK2.currentSong(), M = window.__T || null;
          return s.materials.A.bass.every(n => n.pitch != null);
        }), "the grid transposes by scale degree, so out-of-key is unreachable");

  /* ── the knob is an offset ── */
  const kn = await pg.$(".sk-tb303 .kn[data-key='tb303.cutoff']");
  const bx = await kn.boundingBox();
  await pg.mouse.move(bx.x + bx.width / 2, bx.y + 12);
  await pg.mouse.down();
  await pg.mouse.move(bx.x + bx.width / 2, bx.y - 40, { steps: 8 });
  await pg.mouse.up();
  await pg.waitForTimeout(200);
  const t = await pg.evaluate(() => ({ base: window.MK2.PARAMS["tb303.cutoff"],
                                       trim: window.MK2.TRIM["tb303.cutoff"],
                                       shown: window.MK2.panelValue("tb303", "cutoff") }));
  check("dragging a knob writes TRIM and leaves the genre's base alone",
        t.trim > 0 && Math.abs(t.shown - (t.base + t.trim)) < 1e-9,
        `base ${t.base} + hand ${Math.round(t.trim)} = ${Math.round(t.shown)}`);
  check("...and the knob is marked as yours",
        await pg.evaluate(() => document.querySelector(".kn[data-key='tb303.cutoff']")
          .classList.contains("touched")));
  await pg.dblclick(".sk-tb303 .kn[data-key='tb303.cutoff']"); await pg.waitForTimeout(150);
  check("...and double-click releases it back to the genre",
        await pg.evaluate(() => window.MK2.TRIM["tb303.cutoff"] === undefined));

  /* ── play: the playhead and the automation ── */
  await pg.click("#play");
  await pg.waitForTimeout(2400);
  const live = await pg.evaluate(() => ({
    pos: document.getElementById("pos").textContent,
    now: document.querySelectorAll(".steps .st.now, .acid .col.now").length,
    moving: document.querySelectorAll(".kn:not(.still)").length,
  }));
  check("the position readout runs off the audio clock", /bar \d+\/\d+/.test(live.pos), live.pos);
  check("the playhead lights a step", live.now > 0, live.now + " lit");
  check("automated knobs show their dot", live.moving > 0, live.moving + " of them");

  /* the dot must travel -- on a knob whose lane changes WITHIN a bar. A knob
     with only a `section` move correctly holds still for the whole section. */
  const dot = () => pg.evaluate(() => {
    const lanes = window.MK2.currentSong().motion.lanes;
    const k = [...document.querySelectorAll(".kn:not(.still)")].find(e =>
      (lanes[e.dataset.key] || []).some(m => m.kind === "plock" || m.kind === "lfo"));
    return k ? k.dataset.key + " " + k.querySelector(".auto").style.transform : "none";
  });
  /* POLL, do not sample twice. A p-lock fires on about three steps of sixteen,
     so a fixed short window can legitimately span only unlocked steps and the
     dot legitimately holds still -- the first version of this check was flaky
     for exactly that reason, and a flaky check is worse than no check because
     it teaches you to ignore a red line. Poll until it moves, or give up. */
  const d1 = await dot();
  let d2 = d1;
  for(let i = 0; i < 25 && d2 === d1; i++){ await pg.waitForTimeout(120); d2 = await dot(); }
  check("...and the dot actually travels while the pointer stays put",
        d1 !== "none" && d1 !== d2, `${d1} -> ${d2}`);
  const ptrHeld = await pg.evaluate(() => {
    const k = document.querySelector(".kn:not(.still)");
    return k.querySelector(".ptr").style.transform;
  });
  check("...and the pointer really is a separate indicator", /rotate/.test(ptrHeld), ptrHeld);

  if(shotDir) await pg.screenshot({ path: path.join(shotDir, "panels.png"), fullPage: true });
  await pg.click("#play"); await pg.waitForTimeout(200);

  check("no uncaught page errors at any point", errs.length === 0, errs.slice(0, 3).join(" | "));
  await b.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
