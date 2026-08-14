#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE DRONE RACK — does it exist, does it draw, and does it follow its knobs?

       node harness/probe_dronerack.js

   Built because of this, and because the answer to the second half was NO:

     "I want you to create the drone rack. ... I dont believe that you have
      actually built drones."

   THE SCEPTICISM WAS CORRECT, MEASURED. Before this build there was ONE drone
   voice in the file -- `V.drone`, three saws and a lowpass -- living as an
   engine inside the 303 chassis, reachable from one rig, with no face of its
   own. Ten genres x six seeds, events reaching that voice: bladerunner 450,
   everybody else 0. Dungeon synth and hobbit synth both DECLARE
   `bassStyle: "drone"` and both put `V.bass` on the lane, whose own comment
   says a drone is not plucked; their longest held bass notes are 4.80 s and
   2.54 s.

   ── WHAT THIS ASKS ─────────────────────────────────────────────────────────
   In a real browser, on the real shipped file, because a panel cannot be
   tested by eval'ing the script out of it:

     IT IS THERE      the ambient genre loads the drone rack, the rack draws a
                      `.dronefield`, and the tube has real pixels.
     IT SAYS THINGS   the three readouts are not placeholders: the beat rate in
                      hertz, the coincidence of the two clocks in bars, and
                      whether that number is longer than the record.
     IT FOLLOWS       turning a knob moves the picture. SPREAD widens the stack,
                      VOICES adds lines, and the two CLOCKS change the number of
                      bars at which they meet. A panel whose picture does not
                      follow its own knobs is a meter, and this file has shipped
                      that mistake before.
     IT HOLDS         and the drone is actually heard: a held note tens of
                      seconds long, on the drone rack's own voice, in a genre
                      that is not bladerunner.
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require("path");
const { chromium } = require((() => { try { require.resolve("playwright"); return "playwright"; }
                                      catch(e){ return "@playwright/test"; } })());
const FILE = "file://" + path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html");
const exe = process.env.PLAYWRIGHT_CHROMIUM || (process.env.PLAYWRIGHT_BROWSERS_PATH
            ? path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium") : null);

let pass = 0, fail = 0;
const check = (label, ok, detail) => {
  console.log(`  ${ok ? "✓" : "✗ FAIL:"} ${label}${detail ? "  (" + detail + ")" : ""}`);
  if(ok) pass++; else fail++;
};

(async () => {
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await b.newPage({ viewport: { width: 980, height: 1600 } });
  const errs = [];
  pg.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  pg.on("console", m => { if(m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await pg.goto(FILE);
  await pg.waitForTimeout(900);

  /* the ambient genre, through the same door a person uses */
  await pg.selectOption("#genre", "ambient");
  await pg.waitForTimeout(900);
  await pg.evaluate(() => MK2.rackSlots().forEach(s => MK2.showRack(s)));
  await pg.waitForTimeout(400);
  /* and the drone rack into its OWN slot, by name -- it used to live in the
     bass slot, which meant a genre had to give up its bottom end to have a
     drone; SLOT_OF.drone is why that is no longer true */
  await pg.selectOption("#m_drone", "dronebox");
  await pg.waitForTimeout(700);

  const box = await pg.evaluate(() => {
    const el = document.querySelector(".dronefield");
    if(!el) return null;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             tones: el.querySelectorAll(".drntone").length,
             rings: el.querySelectorAll(".drnring").length,
             foot: el.querySelector(".drnfoot").textContent,
             texts: Array.from(el.querySelectorAll("text")).map(t => t.textContent).filter(Boolean) };
  });
  check("the drone rack draws a face", !!box && box.w > 200 && box.h > 100,
        box ? `${box.w}x${box.h}, ${box.tones} tone traces, ${box.rings} clocks` : "no .dronefield on the page");
  if(!box){ await b.close(); process.exit(1); }

  const beat = box.texts.find(t => /BEATS\/SEC|LOCKED/.test(t)) || "";
  const meet = box.texts.find(t => /TOGETHER EVERY/.test(t)) || "";
  const vs   = box.texts.find(t => /RECORD|COMES ROUND/.test(t)) || "";
  check("...and it prints the beat rate in hertz, not the detune in cents",
        /BEATS\/SEC|LOCKED/.test(beat), beat || "no beat readout");
  check("...and it prints where the two clocks meet",
        /TOGETHER EVERY \d+ BARS/.test(meet), meet + (vs ? " — " + vs : ""));
  check("...and it says whether that is longer than the record",
        /LONGER THAN THIS RECORD|COMES ROUND/.test(vs), vs || "no comparison drawn");

  /* ── IT FOLLOWS ITS OWN KNOBS ──────────────────────────────────────────── */
  const read = () => pg.evaluate(() => {
    const el = document.querySelector(".dronefield");
    return { xs: Array.from(el.querySelectorAll(".drntone")).map(t => +t.getAttribute("x1")),
             foot: el.querySelector(".drnfoot").textContent,
             meet: Array.from(el.querySelectorAll("text")).map(t => t.textContent)
                        .find(t => /TOGETHER EVERY/.test(t)) || "" };
  });
  const spanOf = r => { const on = r.xs.filter(x => x > 0); return on.length ? Math.max(...on) - Math.min(...on) : 0; };
  const set = (k, v) => pg.evaluate(([k, v]) => {
    const c = CONTROL["dronebox." + k];
    TRIM["dronebox." + k] = v - (PARAMS["dronebox." + k] == null ? c.def : PARAMS["dronebox." + k]);
    busTouched("dronebox." + k);
  }, [k, v]);

  const before = await read();
  await set("spread", 34); await pg.waitForTimeout(250);
  const wide = await read();
  check("SPREAD opens the stack on the glass",
        spanOf(wide) > spanOf(before) + 20,
        `${spanOf(before).toFixed(0)}px -> ${spanOf(wide).toFixed(0)}px`);

  await set("voices", 8); await pg.waitForTimeout(250);
  const many = await read();
  check("VOICES adds tones to the stack",
        many.xs.filter(x => x > 0).length === 8,
        `${before.xs.filter(x => x > 0).length} -> ${many.xs.filter(x => x > 0).length} traces`);

  await set("clockA", 16); await set("clockB", 24); await pg.waitForTimeout(250);
  const shared = await read();
  await set("clockA", 17); await set("clockB", 23); await pg.waitForTimeout(250);
  const coprime = await read();
  const nOf = s => { const m = /TOGETHER EVERY (\d+) BARS/.exec(s); return m ? +m[1] : 0; };
  check("the clocks report where they really meet, and coprime is not the same as not",
        nOf(shared.meet) === 48 && nOf(coprime.meet) === 391,
        `16/24 -> ${nOf(shared.meet)} bars (lcm 48) · 17/23 -> ${nOf(coprime.meet)} bars (lcm 391)`);

  /* ── THE MUTABLE CONTROLS AND THE TWO LFOs ARE ON THE BOX ──────────────── */
  const knobs = await pg.evaluate(() =>
    Object.keys(CONTROL).filter(k => k.startsWith("dronebox.")).map(k => k.split(".")[1]));
  const want = ["dejavu", "spreadCV", "bias", "curve", "slope", "smooth",
                "l1dest", "l1rate", "l1amt", "l1wave", "l2dest", "l2rate", "l2amt", "l2wave"];
  const missing = want.filter(k => !knobs.includes(k));
  check("Marbles, Tides and two LFOs are on the drone rack itself",
        missing.length === 0,
        missing.length ? "missing: " + missing.join(", ")
                       : `${knobs.length} knobs, including DEJA VU / SPREAD / BIAS, CURVE / SLOPE / SMOOTH, and two assignable LFOs`);

  /* patching an LFO has to change what the FOOT says, or the socket is a lie */
  const footOf = () => pg.evaluate(() => document.querySelector(".drnfoot").textContent);
  const f0 = await footOf();
  await set("l1amt", 0.7); await set("l1dest", 1); await pg.waitForTimeout(250);
  const f1 = await footOf();
  check("...and patching an LFO says so on the glass",
        /LFO1 OFF/.test(f0) && /LFO1 PEAK FREQ/.test(f1),
        `"${(f0.match(/LFO1[^·]*/) || [""])[0].trim()}" -> "${(f1.match(/LFO1[^·]*/) || [""])[0].trim()}"`);

  /* and the SWELL curve has to follow Tides' SLOPE */
  const envOf = () => pg.evaluate(() => {
    const pts = document.querySelector(".drnenv").getAttribute("points").split(" ").map(s => s.split(",").map(Number));
    let top = pts[0], i = 0;
    pts.forEach((p, k) => { if(p[1] < top[1]){ top = p; i = k; } });
    return i / (pts.length - 1);
  });
  await set("slope", 0.1); await pg.waitForTimeout(200);
  const early = await envOf();
  await set("slope", 0.9); await pg.waitForTimeout(200);
  const late = await envOf();
  check("TIDES' SLOPE moves where the swell peaks",
        late > early + 0.4, `peak at ${(early * 100).toFixed(0)}% of the shape -> ${(late * 100).toFixed(0)}%`);

  check("no page errors while the rack was driven", errs.length === 0,
        errs.length ? errs.slice(0, 2).join(" | ") : "clean");

  await b.close();

  /* ── AND THE DRONE IS ACTUALLY HELD ────────────────────────────────────── */
  const fs = require("fs");
  const html = fs.readFileSync(path.resolve(__dirname, "..", "Deckards Orchestrator MK2.html"), "utf8");
  const src = html.split("<script>")[1].split("</script>")[0];
  global.window = { addEventListener(){}, MK2: null };
  global.document = { getElementById: () => ({ addEventListener(){}, textContent: "", value: "1", innerHTML: "" }),
                      createElement: () => ({ click(){} }) };
  eval(src);
  const M = global.window.MK2;
  let n = 0, longest = 0, secs = 0, roleBad = 0, bassSeen = 0;
  for(let seed = 1; seed <= 6; seed++){
    const song = M.composeSong(seed, null, "ambient");
    for(const e of song.perf.events){
      if(e.role === "bass") bassSeen++;
      if(e.voice === "dronebox"){ n++; longest = Math.max(longest, e.durSec); secs += e.durSec;
        if(e.role !== "drone") roleBad++; }
    }
  }
  check("the drone is on its OWN lane, and the bass is still there beside it",
        roleBad === 0 && bassSeen > 0,
        roleBad ? `${roleBad} drone-rack events landed on a role that is not "drone"`
                : `every drone-rack event is role "drone", and ${bassSeen} bass events play alongside them ` +
                  `— which is the arrangement that was impossible while the box lived in the bass slot`);

  check("the drone rack is what plays ambient's bottom, and it HOLDS",
        n > 0 && longest > 20,
        `${n} events over 6 records · longest ${longest.toFixed(1)}s · ${(secs / n).toFixed(1)}s mean ` +
        `(the old drone's best, on the one genre that had it, was 16.6s)`);

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  process.exitCode = fail ? 1 : 0;
})();
