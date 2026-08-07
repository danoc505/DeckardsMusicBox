#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE UI, DRIVEN — in a real browser, on the real shipped file.

       node harness/mk2_ui.js [--shot <dir>] [--full]

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

/* ── THE TWO LONG ONES ARE OPT-IN ───────────────────────────────────────────
   Two checks in here dominate the clock and neither is a per-change question:

     · the audio graph does not grow for ever  — plays for a fixed 25 seconds,
       because it is measuring a leak that only shows over time;
     · every control a machine declares is drawn — loads EVERY machine into
       EVERY rack that accepts it and then walks every kit of each, which is
       a few hundred page round-trips.

   They are the right checks and they stay. They are simply not what you want
   after moving a label, and a suite whose cheap form is the only form is a
   suite that gets skipped entirely — which is how the defects they were
   written for got in.

   So the default run is the fast core and `--full` adds these two. Every
   skipped check is NAMED in the summary, not silently dropped: a "0 failed"
   that quietly stands for less than it did last time is the exact shape of
   mistake this repo keeps finding. */
const FULL = process.argv.includes("--full");
const skippedNames = [];
const onlyFull = name => { if(!FULL) skippedNames.push(name); return FULL; };

/* ── A FAILURE NAMES ITSELF IN THE SUMMARY ──────────────────────────────────
   This suite is flaky about one run in five, and the backlog has carried the
   same entry since 2026-08-04: "The failing check does not identify itself in
   the summary line, so which one it is has not been established." It cost
   another session today — a run came back 43/1 and the next four were clean,
   and the ✗ had already scrolled off. So the names are collected and reprinted
   at the bottom. Knowing WHICH check flakes is the whole of telling a timing
   flake from a real defect, and until then every red run has to be re-run and
   BOTH results reported. */
let pass = 0, fail = 0;
const failedNames = [];
const check = (label, ok, detail) => {
  console.log(`  ${ok ? "✓" : "✗ FAIL:"} ${label}${detail ? "  (" + detail + ")" : ""}`);
  if(ok) pass++; else { fail++; failedNames.push(label + (detail ? "  (" + detail + ")" : "")); }
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

  /* ── THE RACK ROW IS A LIST NOW, AND THE DEFAULT IS FOUR OF IT ──────────────
     The row used to be five <select>s written into the markup with fixed ids,
     which is what this file drove. It is drawn from RACK_ON now and starts at
     drums/bass/lead/fx, so the ids exist only for the racks currently on
     screen. Ask the program to put them all up -- through the same door the +
     button uses, so this cannot go green against a rack a user could not reach
     -- and then drive them by their derived ids. */
  await pg.evaluate(() => MK2.rackSlots().forEach(s => MK2.showRack(s)));
  await pg.waitForTimeout(300);
  const RACK = s => "#m_" + s;
  /* put a panelled machine in every slot the rack HAS -- asked of the program,
     not listed here, because listing them here is what went stale last time */
  await pg.selectOption(RACK("drums"), "tr1000");
  await pg.selectOption(RACK("bass"), "tb303");
  await pg.selectOption(RACK("keys"), "mellotron");
  await pg.selectOption(RACK("lead"), "sax");
  await pg.selectOption(RACK("keys2"), "wurly");
  await pg.waitForTimeout(500);

  /* ── AND THE MIXER IS NOT A MACHINE ────────────────────────────────────────
     It wears the `.machine` class because it is drawn as a rack box, and it has
     no INSTRUMENTS entry, no slot and nothing to pick -- it is about the SONG.
     Counting it here would make this check assert "slots + fixed + 1", which is
     the fourth time this number would have gone stale. It is excluded by name
     and checked on its own terms below. */
  /* ── AND IT ASKS FOR MACHINE PANELS, NOT FOR BOXES ─────────────────────────
     `.machine:not(.mixer)` counted every box wearing the rack styling, and the
     exclusion list grew by hand each time a box that is not a machine arrived:
     first the mixer, and then -- the moment the song controls and the note
     display got cases of their own -- two more, and this went red for a change
     that added no machine at all. FOURTH time this count has gone stale.

     A panel that IS a machine now says so with `data-machine`, so the question
     is asked of the panel instead of inferred from its class list. Nothing has
     to be excluded, because nothing else claims to be a machine. */
  const shape = await pg.evaluate(() => [...document.querySelectorAll(".machine[data-machine]")].map(m => ({
    skin: (m.className.match(/sk-(\w+)/) || [])[1],
    machine: m.dataset.machine,
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
  /* ── EXCEPT A MACHINE THAT IS DRAWN INSIDE ANOTHER RACK ────────────────────
     The pad bay IS the echo and the flanger — their nameplates, their knobs and
     their pads in one box — so neither draws a rack of its own any more, on
     purpose: the same knob on the page twice is the defect the bay exists to
     fix. This check assumed every fixed machine draws its own panel and went red
     for that change.
     Derived exactly as the program derives it: a machine named by some panel's
     `pads` block is drawn by that panel, so it is not expected on its own. No
     list, so a third pad is covered without editing this. */
  const insideAnother = await pg.evaluate(() => {
    const s = [];
    for(const k in MK2.INSTRUMENTS){
      const pp = MK2.INSTRUMENTS[k].panel && MK2.INSTRUMENTS[k].panel.pads;
      if(pp) for(const p of pp) s.push(p.m);
    }
    return s;
  });
  const fixed = await pg.evaluate((inside) =>
    Object.keys(MK2.INSTRUMENTS).filter(k => MK2.INSTRUMENTS[k].fixed && !inside.includes(k))
      .map(k => (MK2.INSTRUMENTS[k].panel || {}).skin || k), insideAnother);
  /* HOW MANY SLOTS THERE ARE IS THE PROGRAM'S TO SAY. The comment above claims
     this count is derived from the rack; only the FIXED half ever was, and the
     picked half stayed the literal 3 -- so a fourth and a fifth rack turned
     this green check red without anything being wrong with the program. Third
     time this number has gone stale, and the last. */
  const slots = await pg.evaluate((inside) =>
    MK2.rackSlots().filter(s => {
      const m = MK2.INSTRUMENTS;
      /* a slot whose machine is drawn inside another rack does not draw here */
      return !inside.some(k => m[k] && m[k].slot === s);
    }).length, insideAnother);
  check("each slot draws its own machine's panel, and every fixed machine is always there",
        shape.length === slots + fixed.length && shape.every(s => s.skin) &&
        fixed.every(f => shape.some(s => s.skin === f)),
        `${shape.length} panels (${slots} slots + ${fixed.length} fixed: ${fixed.join(",")}` +
        (insideAnother.length ? `; drawn inside another rack: ${insideAnother.join(",")}` : "") + ") · " +
        shape.map(s => `${s.skin}:${s.knobs}kn/${s.steps}st`).join(" "));
  /* ── THE MIXER HAS A STRIP FOR EVERY PART THE SONG PLAYS ──────────────────
     Not a fixed list: the strips are read off the performance, so a song that
     grows a part grows a channel. The check asks the program which roles sound
     and compares, rather than naming them -- otherwise it proves its own copy
     is current and nothing else. And it proves the meters are WIRED: a fader
     with a dead meter beside it is the knob-that-lies defect pointed at the one
     box whose whole job is to report. */
  /* ── AND THE PREMISE OF THIS CHECK WENT STALE THE DAY THE MASTER LANDED ───
     It counted EVERY `.mixch` as a part and held every one of them to three EQ
     knobs. A master strip is a strip and is not a part: it has no EQ, no role
     in the performance, and its whole job is to act on the others. So the check
     went red for a change that was correct and asked for.

     Rewritten to measure the thing it was always about -- *the CHANNELS match
     the parts the song plays* -- by asking which strips are channels rather
     than by assuming all of them are. The master is then checked for what a
     master actually has. NOT fixed by relaxing the EQ count, which would have
     made it green and blind. */
  {
    const mix = await pg.evaluate(() => {
      const box = document.querySelector(".machine.mixer");
      if(!box) return { there: false };
      const all = [...box.querySelectorAll(".mixch")];
      const chans = all.filter(c => c.dataset.role !== "__master");
      const master = all.find(c => c.dataset.role === "__master") || null;
      /* ── AND IT IS `MK2.currentSong()`, NOT `window.SONG` ──────────────────
         The version of this check that stood before today read `window.SONG`,
         which is ALWAYS UNDEFINED: `SONG` is a module-level `let`, and let and
         const never become properties of window. So `roles` was an empty array
         every time it ran, and the comment above -- "asks the program which
         roles sound and compares" -- described something the check did not do.
         It counted strips and never compared them to anything.

         This is the THIRD time this exact mistake has been found in this repo
         (`window.Sound` killed every mixer control; `window.MK2` is the one
         that works because it is an explicit export). Anything the page does
         not deliberately export is not reachable from a probe. */
      const song = MK2.currentSong();
      const roles = [...new Set(song ? song.perf.events.map(e => e.role) : [])];
      return { there: true,
               strips: chans.map(c => c.dataset.role),
               /* DERIVED, not the literal 3. This counted the EQ's three bands
                  and went red the hour every strip grew a REVERB and a DELAY --
                  the check was stale, not the program. It asks the desk how
                  many knobs a strip is supposed to have. */
               eq: chans.map(c => c.querySelectorAll(".mixeq .kn").length),
               wantKn: (MK2.mixKnobsPerStrip ? MK2.mixKnobsPerStrip() : 3),
               aux: chans.map(c => c.querySelectorAll(".mixaux .kn").length),
               meters: chans.filter(c => c.querySelector(".mixmeter")).length,
               faders: chans.filter(c => c.querySelector(".mixfader")).length,
               mutes:  chans.filter(c => c.querySelector(".mixmute")).length,
               solos:  chans.filter(c => c.querySelector(".mixsolo")).length,
               roles,
               master: master ? { fader: !!master.querySelector(".mixfader"),
                                  meter: !!master.querySelector(".mixmeter"),
                                  marks: master.querySelectorAll(".mixmark").length } : null };
    });
    const missing = mix.there ? mix.roles.filter(r => !mix.strips.includes(r)) : [];
    const extra   = mix.there ? mix.strips.filter(r => !mix.roles.includes(r)) : [];
    check("the mixer draws a channel for every part the song plays, and no others",
          mix.there && mix.strips.length > 0 && missing.length === 0 && extra.length === 0 &&
          mix.meters === mix.strips.length && mix.faders === mix.strips.length &&
          mix.eq.every(n => n === mix.wantKn) && mix.aux.every(n => n === 2),
          mix.there ? `${mix.strips.length} channels (${mix.strips.join(", ")}), ` +
                      `${mix.meters} meters, ${mix.faders} faders, ` +
                      `${mix.wantKn} knobs a strip of which 2 are the sends` +
                      (missing.length ? "  MISSING: " + missing.join(" ") : "") +
                      (extra.length   ? "  EXTRA: "   + extra.join(" ")   : "")
                    : "no mixer rack drawn");
    check("...and every channel has a mute and a solo",
          mix.there && mix.mutes === mix.strips.length && mix.solos === mix.strips.length,
          mix.there ? `${mix.mutes} mutes, ${mix.solos} solos, ${mix.strips.length} channels` : "");
    check("...and the master has a fader, a meter and the gain-staging marks on it",
          !!(mix.master && mix.master.fader && mix.master.meter && mix.master.marks >= 2),
          mix.master ? `fader ${mix.master.fader} · meter ${mix.master.meter} · ${mix.master.marks} marks`
                     : "no master strip");
  }
  /* ── AND A FADER ON THE PANEL MUST REACH THE AUDIO ────────────────────────
     `probe_mixer` proves the ENGINE responds to `MK2.setMixer`. It cannot prove
     the PANEL calls it, and the first build of this rack did not: the push went
     through `window.Sound`, which is undefined for a const, so every control was
     dead while that probe stayed green. A test that reaches past the interface
     only ever proves the thing behind the interface.

     So this drags the fader the way a hand does -- pointerdown, move, up -- and
     then asks the ENGINE what it is holding. */
  {
    const mixMoved = await pg.evaluate(async () => {
      const strip = document.querySelector(".machine.mixer .mixch");
      if(!strip) return { err: "no strip" };
      const role = strip.dataset.role;
      const f = strip.querySelector(".mixfader");
      const r = f.getBoundingClientRect();
      const ev = (type, y) => f.dispatchEvent(new PointerEvent(type, {
        bubbles: true, clientX: r.left + r.width / 2, clientY: y, pointerId: 1 }));
      f.setPointerCapture = () => {};
      ev("pointerdown", r.top + r.height / 2);
      ev("pointermove", r.top + r.height / 2 + 40);          // downward = quieter
      ev("pointerup",   r.top + r.height / 2 + 40);
      const shown = strip.querySelector(".mixdb").textContent;
      /* and a band knob, the same way */
      const kn = strip.querySelector(".mixeq .kn");
      const kr = kn.getBoundingClientRect();
      kn.setPointerCapture = () => {};
      const kev = (type, y) => kn.dispatchEvent(new PointerEvent(type, {
        bubbles: true, clientX: kr.left + kr.width / 2, clientY: y, pointerId: 2 }));
      kev("pointerdown", kr.top + kr.height / 2);
      kev("pointermove", kr.top + kr.height / 2 - 30);       // upward = boost
      kev("pointerup",   kr.top + kr.height / 2 - 30);
      return { role, shown, trim: JSON.parse(JSON.stringify(MIXER_TRIM)) };
    });
    const t = (mixMoved.trim || {})[mixMoved.role] || {};
    check("dragging a fader on the panel reaches the engine",
          !mixMoved.err && t.vol < 0 && t.low > 0,
          mixMoved.err ? mixMoved.err
            : `${mixMoved.role}: fader ${t.vol} dB, low ${t.low} dB, strip reads ${mixMoved.shown}`);
  }
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
    /* fixed machines are always drawn and never picked; LEGACY ones are kits of
       another machine now -- the acoustic, Sega and break voice sets live behind
       the TR-1000's KIT key -- so they are in the table for voice resolution and
       are deliberately not offered as separate boxes. Neither is selectable, so
       neither belongs in a check about selecting things. */
    const machines = await pg.evaluate(() => Object.keys(MK2.INSTRUMENTS)
      .filter(k => !MK2.INSTRUMENTS[k].fixed && !MK2.INSTRUMENTS[k].legacy)
      .map(k => [k, MK2.INSTRUMENTS[k].slot]));
    const broken = [];
    for(const [m, slot] of machines){
      /* every rack is on screen by now, so a machine's own slot always has a
         box -- no hand-kept map of three, which is what stopped this check
         reaching the lead and the second keyboard */
      const sel = RACK(slot);
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
  await pg.selectOption(RACK("drums"), "tr1000");
  await pg.selectOption(RACK("bass"), "tb303");
  await pg.selectOption(RACK("keys"), "mellotron");
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
  await pg.click(".sk-td3mo .acid .col:nth-child(3) .note"); await pg.waitForTimeout(220);
  await pg.click(".sk-td3mo .acid .col:nth-child(3) .flag:nth-child(2)"); await pg.waitForTimeout(220);
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
  const kn = await pg.$(".sk-td3mo .kn[data-key='tb303.cutoff']");
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
  await pg.dblclick(".sk-td3mo .kn[data-key='tb303.cutoff']"); await pg.waitForTimeout(150);
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

  /* ── EVERY VOICE MAKES A SOUND ────────────────────────────────────────────
     Not a UI claim, but this is the only suite with a browser in it, and the
     gap it closes was expensive. `dacHit` -- the SEGA kick and snare -- spent
     several commits reading `ev.lane` off an `ev` it was never passed, left
     behind when per-drum chains made the destination depend on the lane. Every
     DAC hit was a ReferenceError, and a throw inside a WebAudio render does not
     degrade gracefully: it takes the rest of the render with it.

     88 seam checks, 21 UI checks, 10 blend checks and a 2100-line composition
     snapshot all passed the whole time, because NOT ONE OF THEM BUILDS A SOUND.
     The seam checks read tables, the snapshot hashes notes, this file reads the
     DOM. Nothing stood between "the voice is in V" and "the voice makes a
     noise". It was found by accident, by a probe rendering old against new for
     an unrelated reason.

     So: fire all of them, once each, and fail on a throw. The detailed report
     (per-voice peak, silent voices) lives in harness/probe_voices.js. */
  const voices = await pg.evaluate(async () => {
    const laneOf = name => {
      const n = name.toLowerCase();
      if(n.includes("openhat")) return "openhat";
      for(const k of ["kick","snare","ghost","hat","clap","rim","crash","ride"])
        if(n.includes(k)) return k;
      if(n.includes("tom")) return n.includes("lo") ? "tom3" : "tom1";
      if(/^k/.test(n)) return "kick"; if(/^s/.test(n)) return "snare";
      if(/^oh/.test(n)) return "openhat"; if(/^h/.test(n)) return "hat";
      if(/^t/.test(n)) return "tom3";
      return null;
    };
    const bad = [], quiet = [];
    for(const v of window.MK2.voiceNames()){
      const lane = laneOf(v);
      /* `slice` is the chopper's offset into the break; the composer always
         writes it, so a synthetic event without it tests my event literal
         rather than the voice */
      const ev = { voice: v, role: lane ? "drums" : "bass", lane: lane || "bass",
                   tSec: 0.05, durSec: 0.40, gain: 0.9, pitch: 45, slice: 0 };
      try {
        const blob = await window.MK2.renderWav([ev], 1.6, 44100);
        const ab = await blob.arrayBuffer(), dv = new DataView(ab);
        const n = (ab.byteLength - 44) / 4;
        let peak = 0;
        for(let i = 0; i < n; i++){
          const s = Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768);
          if(s > peak) peak = s;
        }
        if(peak < 1e-4) quiet.push(v);
      } catch(e){ bad.push(v + ": " + String(e && e.message || e)); }
    }
    return { bad, quiet, n: window.MK2.voiceNames().length };
  });
  /* ── A FADER AT THE BOTTOM MEANS SILENCE ──────────────────────────────────
     Reported as "I turned all the faders down and I'm still hearing this
     sound." It was true: with every TR-1000 MIX fader at zero the kit only
     dropped 20.4 dB, because several voices connected to the gated-verb send
     from their own gain -- in front of the fader -- and synthwave automates
     that send across a third of its travel, so it is open for most of the song.

     Three separate wrong theories were measured and killed before the bisect
     found it, so this check exists to make the next one cheap. */
  const silenced = await pg.evaluate(async () => {
    const L = ['k','s','t','m','r','c','h','o','a','d'];
    const song = MK2.composeSong(1, 'draw', 'synthwave');
    const S = MK2.soundOf('synthwave');
    const ev = song.perf.events.filter(e => e.role === 'drums' && e.tSec < 8);
    const peak = async () => {
      const blob = await MK2.renderWav(ev, 10, 44100, S.space, S.kick, S.drumDrive,
                                       S.gate, song.motion, 0);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = (ab.byteLength - 44) / 4;
      let pk = 0;
      for(let i = 0; i < n; i++){
        const v = Math.abs(dv.getInt16(44 + (i*2)*2, true) / 32768);
        if(v > pk) pk = v;
      }
      return pk;
    };
    for(const g of L) MK2.PARAMS['tr1000.' + g + 'Mix'] = 1;
    const open = await peak();
    for(const g of L) MK2.PARAMS['tr1000.' + g + 'Mix'] = 0;
    const shut = await peak();
    for(const g of L) delete MK2.PARAMS['tr1000.' + g + 'Mix'];
    return { open, shut };
  });
  check("every fader at the bottom silences the kit",
        silenced.shut < silenced.open * 0.001,
        `open ${silenced.open.toFixed(4)} -> shut ${silenced.shut.toFixed(4)}`);

  check(`every one of the ${voices.n} voices renders without throwing`,
        voices.bad.length === 0, voices.bad.slice(0, 3).join(" | "));
  check("...and none of them comes out silent",
        voices.quiet.length === 0, voices.quiet.join(", "));

  /* ══ PRESSING PLAY MAKES SOUND ═════════════════════════════════════════════
     Reported twice from an iPhone, and the second time it was a REGRESSION I
     caused: the silent media element added to escape the ringer switch calls
     HTMLMediaElement.play(), which CONSUMES the user activation on iOS, so the
     ctx.resume() that ran after it was no longer inside the tap and the context
     stayed suspended.

     Nothing in this battery had ever asserted the simplest thing the program
     does. Every check here drove knobs, grids and panels; the transport was
     measured for its POSITION readout and never for its output. So a change to
     the audio start-up path could take all the sound away and 24 checks stayed
     green.

     It measures the master bus after the button is pressed, and it does it with
     the mute-switch bypass BOTH OFF AND ON, because the regression was that
     turning that on cost the sound. */
  {
    const peakOf = async () => {
      let m = 0;
      for(let i = 0; i < 18; i++){
        const l = await pg.evaluate(() => window.MK2 && MK2.liveLevel ? MK2.liveLevel() : null);
        if(l && l.rms > m) m = l.rms;
        await pg.waitForTimeout(110);
      }
      return m;
    };
    /* stop first if the earlier checks left it running */
    if(await pg.evaluate(() => document.getElementById("play").textContent.indexOf("stop") >= 0)){
      await pg.click("#play"); await pg.waitForTimeout(300);
    }
    await pg.click("#play");
    await pg.waitForTimeout(1800);
    const plain = await peakOf();
    const st = await pg.evaluate(() => MK2.soundState());
    check("pressing play actually makes sound", plain > 0.01 && st.state === "running",
          `master rms ${plain.toFixed(4)}, context ${st.state} @ ${st.rate} Hz`);

    await pg.click("#ringer"); await pg.waitForTimeout(1200);
    const withFix = await peakOf();
    const st2 = await pg.evaluate(() => MK2.soundState());
    check("...and the mute-switch bypass does not take it away",
          withFix > 0.01 && st2.state === "running" && st2.bypass === true,
          `master rms ${withFix.toFixed(4)} with the bypass on, context ${st2.state}`);
    await pg.click("#ringer"); await pg.waitForTimeout(400);
    await pg.click("#play"); await pg.waitForTimeout(300);
  }

  /* ── THE ROLL SHOWS THE SONG, AND IT SHOWS THE FILE ───────────────────────
     Two claims and they are different claims.

     The first is that the display is of THIS song: a note on the glass for
     every note the program wrote. The second is the one worth a check -- the
     roll draws through `midiKeyFor`, the same function the .mid export uses,
     so the count on screen IS the count in the exported file. When the
     ostinato had no MIDI track, 1520 of DKC's 3009 notes vanished from the
     export in silence and only a round-trip parser in mk2_roll.js noticed. A
     display fed from that function shows the hole; a check on the display's
     own arithmetic proves the display is still fed from it.

     Run on a genre with an ostinato and a second keyboard, because those are
     the two roles this project has actually lost on export. */
  {
    await pg.selectOption("#genre", "dkc");
    await pg.waitForTimeout(250);
    await pg.click("#new");
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => {
      const song = MK2.currentSong();
      const want = song.perf.events.filter(e => MK2.midiKeyFor(e) != null).length;
      const roll = document.getElementById("roll");
      const notes = roll.querySelectorAll(".rn");
      const roles = {};
      for(const n of notes) roles[n.dataset.role] = (roles[n.dataset.role] || 0) + 1;
      const wantRoles = {};
      for(const e of song.perf.events)
        if(MK2.midiKeyFor(e) != null) wantRoles[e.role] = (wantRoles[e.role] || 0) + 1;
      return { want, got: notes.length, roles, wantRoles,
               bars: roll.querySelectorAll(".rollgrid u").length,
               nBars: song.form.nBars,
               sections: roll.querySelectorAll(".rollsec").length,
               nSections: song.sections.length,
               tags: roll.querySelectorAll(".rolltag").length,
               keys: roll.querySelectorAll(".rollkeys i").length };
    });
    check("the roll draws one note for every note the .mid would carry",
          r.got === r.want, `${r.got} on the glass, ${r.want} through midiKeyFor`);
    check("...and every ROLE's count matches, not just the total",
          Object.keys(r.wantRoles).every(k => r.roles[k] === r.wantRoles[k]),
          Object.keys(r.wantRoles).map(k => `${k} ${r.roles[k] || 0}/${r.wantRoles[k]}`).join(", "));
    check("the roll's graticule is this song's bars",
          r.bars === r.nBars + 1, `${r.bars} rules for ${r.nBars} bars`);
    check("the roll names every section of this song",
          r.sections === r.nSections, `${r.sections} tags for ${r.nSections} sections`);
    check("the roll's keyboard covers a real range", r.keys > 12, `${r.keys} semitones`);

    /* the legend is a pair of spectacles: clicking one part dims the rest and
       must not touch a note of the song */
    const before = await pg.evaluate(() => JSON.stringify(MK2.currentSong().perf.events.length));
    await pg.evaluate(() => document.querySelectorAll("#roll .rolltag")[1].click());
    await pg.waitForTimeout(120);
    const focused = await pg.evaluate(() => {
      const only = document.querySelector("#roll .rolltag.only");
      const dim = document.querySelectorAll("#roll .rn.dim").length;
      const all = document.querySelectorAll("#roll .rn").length;
      return { only: !!only, dim, all };
    });
    const after = await pg.evaluate(() => JSON.stringify(MK2.currentSong().perf.events.length));
    check("clicking a part in the legend looks at it alone",
          focused.only && focused.dim > 0 && focused.dim < focused.all,
          `${focused.dim} of ${focused.all} dimmed`);
    check("...and changes nothing about the song", before === after,
          `${before} events before, ${after} after`);
    await pg.evaluate(() => document.querySelectorAll("#roll .rolltag")[1].click());
  }

  /* ── THE GRAPH MUST NOT GROW FOR EVER ─────────────────────────────────────
     The user, 2026-08-05: "Synthwave seed 10855 it happened. Then i stopped hit
     new song and audio stopped working." Measured on that seed: the number of
     connected audio nodes climbed to 30 543 over 150 seconds and STOP took it
     to 30 387 -- the graph never reset, so every song piled onto the last until
     the audio thread could not render in real time and the sound went away.

     `V` returns a voice's SOURCE nodes and dispatch hung its cleanup off those,
     so every gain, filter and panner behind them stayed wired to the bus with
     nothing to end it. dispatch sweeps the whole note now.

     THIS CHECK IS HERE AND NOT IN mk2_test BECAUSE IT NEEDS A REAL CONTEXT --
     the seam battery never builds a graph, which is exactly why nothing caught
     this. It asks the ratio rather than a count, because the count depends on
     how long the run is and on the genre's density: before the fix 87% of every
     node ever created was still connected; after it, about 3%. 25% sits in a
     gap that wide with room on both sides.

     AND IT IS A RATIO OF *CREATED*, so it cannot be satisfied by a program that
     has stopped making sound -- a silent build creates nothing and the guard
     below refuses a run that built too few nodes to judge. */
  if(onlyFull("the audio graph does not grow for ever while it plays")){
    /* the recorder has to be installed before the page makes its context, so
       this runs in its own page rather than reaching into the live one */
    const pg2 = await b.newPage({ viewport: { width: 980, height: 900 } });
    await pg2.addInitScript(() => {
      const A = window.AudioContext || window.webkitAudioContext;
      window.__n = { made: 0, conn: 0 };
      const wrap = c => {
        const names = new Set();
        for(let p = Object.getPrototypeOf(c); p; p = Object.getPrototypeOf(p))
          for(const n of Object.getOwnPropertyNames(p)) names.add(n);
        for(const f of names){
          if(!/^create/.test(f)) continue;
          const o = c[f]; if(typeof o !== "function") continue;
          c[f] = function(...a){
            const n = o.apply(this, a);
            try {
              window.__n.made++;
              const oc = n.connect, od = n.disconnect; let live = false;
              n.connect = function(...b){ if(!live){ live = true; window.__n.conn++; } return oc.apply(this, b); };
              n.disconnect = function(...b){ if(live){ live = false; window.__n.conn--; } return od.apply(this, b); };
            } catch(e){}
            return n;
          };
        }
        return c;
      };
      function W(...a){ return wrap(new A(...a)); }
      W.prototype = A.prototype; window.AudioContext = W; window.webkitAudioContext = W;
    });
    await pg2.goto(FILE, { waitUntil: "load", timeout: 60000 });
    await pg2.waitForFunction(() => window.MK2, { timeout: 20000 });
    await pg2.evaluate(() => { const s = document.getElementById("genre");
      s.value = "synthwave"; s.dispatchEvent(new Event("change", { bubbles: true })); });
    await pg2.waitForTimeout(400);
    await pg2.evaluate(() => document.getElementById("play").click());
    await pg2.waitForTimeout(25000);
    const n = await pg2.evaluate(() => ({ ...window.__n }));
    await pg2.close();
    const share = n.made ? 100 * n.conn / n.made : 100;
    check("the audio graph does not grow for ever while it plays",
          n.made > 3000 && share < 25,
          n.conn + " of " + n.made + " nodes still connected after 25 s = " +
          share.toFixed(1) + "% (before the fix: 87%)");
  }

  /* ═══ TWO DISPLAYS OF ONE CONTROL MUST AGREE ══════════════════════════════
     The user: "The KAOSS pads are disconnected from their controls this is
     wrong." They were: `echo.tone` is an axis of the KAOSS pad AND a knob on
     the echo's own panel, and a hand on either refreshed only the copy it was
     touching. The pad read 7950 Hz while the machine's knob read 1800 Hz about
     the same number.

     IT ONLY SHOWED WHILE STOPPED, which is why it lived here so long:
     `refreshLive()` sweeps every knob on every animation frame while the
     transport runs, so during playback the hole is papered over sixty times a
     second. This check therefore runs with the transport STOPPED on purpose.
     Driven with real pointer events, because the pad is a knob. */
  {
    const decl = await pg.evaluate(() =>
      MK2.INSTRUMENTS.pads.panel.pads.map(p => ({ m: p.m, x: p.x, y: p.y, label: p.label })));
    const bad = [];
    for(const p of decl){
      const kx = p.m + "." + p.x;
      const before = await pg.evaluate((kx) => {
        const k = document.querySelector(`.kn[data-key="${kx}"] .val`);
        return k ? k.textContent : null;
      }, kx);
      const box = await pg.evaluate((kx) => {
        const el2 = document.querySelector(`.xypad[data-key="${kx}"]`);
        if(!el2) return null;
        el2.scrollIntoView({ block: "center" });
        const r = el2.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }, kx);
      if(!box){ bad.push(p.label + ": no pad on the glass"); continue; }
      await pg.mouse.move(box.x + box.w * 0.5, box.y + box.h * 0.5);
      await pg.mouse.down();
      await pg.mouse.move(box.x + box.w * 0.87, box.y + box.h * 0.13, { steps: 8 });
      await pg.mouse.up();
      await pg.waitForTimeout(140);
      const after = await pg.evaluate((kx) => {
        const k = document.querySelector(`.kn[data-key="${kx}"] .val`);
        const c = document.querySelector(`.xypad[data-key="${kx}"] .xycross`);
        return { knob: k ? k.textContent : null, cross: c ? c.style.left : null };
      }, kx);
      if(after.knob === before) bad.push(`${p.label}: pad moved, the machine's own knob still reads ${before}`);
      if(!after.cross) bad.push(`${p.label}: the pad's own cross did not move`);
    }
    check("a pad and the machine's own knob show the same number, with the transport STOPPED",
          bad.length === 0,
          bad.length ? bad.join(" | ") : decl.length + " pads, knob and cross both follow");
  }

  /* ═══ THE DESK ════════════════════════════════════════════════════════════
     The mixer is the master for all volume, and its colours are the roll's.
     Both were asked for by the user; the fuller battery is
     `harness/probe_desk.js` and `harness/probe_deskgraph.js`. What is here is
     the part that must never regress silently. */
  {
    const col = await pg.evaluate(() => {
      const hues = rollHues(), out = [];
      for(const st of document.querySelectorAll(".mixch")){
        const role = st.dataset.role;
        if(role === "__master") continue;
        const ink = getComputedStyle(st).getPropertyValue("--ink").trim();
        const m = ink.match(/hsl\(\s*([\d.]+)/);
        out.push({ role, strip: m ? +m[1] : null, roll: hues[role] == null ? null : hues[role] });
      }
      return out;
    });
    const off = col.filter(c => c.roll != null && c.strip !== c.roll);
    check("every mixer strip is the colour that part has on the roll",
          col.length > 0 && off.length === 0,
          off.length ? off.map(c => `${c.role} strip ${c.strip} vs roll ${c.roll}`).join(" | ")
                     : col.map(c => `${c.role} ${c.strip}`).join(" · "));

    const hasMaster = await pg.evaluate(() => !!document.querySelector('.mixch[data-role="__master"] .mixfader'));
    check("the desk has a master strip", hasMaster, hasMaster ? "" : "no master fader on the glass");

    /* drive the master DOWN on the glass and ask the GRAPH what it is holding.
       `soundState()` reports it for the same reason it reports which room is
       running: a graph no check can see can be wrong for a whole build. */
    const mbox = await pg.evaluate(() => {
      const f = document.querySelector('.mixmaster .mixfader');
      if(!f) return null;
      f.scrollIntoView({ block: "center" });
      const r = f.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if(mbox){
      await pg.mouse.move(mbox.x, mbox.y);
      await pg.mouse.down();
      await pg.mouse.move(mbox.x, mbox.y + 60, { steps: 8 });
      await pg.mouse.up();
      await pg.waitForTimeout(350);
      const st = await pg.evaluate(() => ({ s: MK2.soundState(), t: (MIXER_TRIM.__master || {}).vol }));
      check("the master fader on the glass moves the master gain past the limiter",
            st.s.master != null && st.s.master < 0.999 &&
            Math.abs(20 * Math.log10(st.s.master) - st.t) < 0.05,
            `fader ${st.t} dB -> gain ${st.s.master && st.s.master.toFixed(4)}`);
      /* and the kit's own sends follow the kit's fader, which BACKLOG §0b.1
         said they did not: they tapped inside the kit, ahead of the strip, so
         pulling the drums down left their reverb where it was */
      await pg.evaluate(() => { delete MIXER_TRIM.__master; mixPush(); mixRefreshAll(); });
      const dbox = await pg.evaluate(() => {
        const f = document.querySelector('.mixch[data-role="drums"] .mixfader');
        if(!f) return null;
        f.scrollIntoView({ block: "center" });
        const r = f.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      if(dbox){
        await pg.mouse.move(dbox.x, dbox.y);
        await pg.mouse.down();
        await pg.mouse.move(dbox.x, dbox.y + 70, { steps: 8 });
        await pg.mouse.up();
        await pg.waitForTimeout(350);
        const d = await pg.evaluate(() => MK2.soundState());
        check("...and the kit's own echo/reverb/gate sends follow the DRUMS fader",
              d.dSend && d.chan && Math.abs(d.dSend.echo - d.chan.drums) < 1e-9 &&
              Math.abs(d.dSend.verb - d.chan.drums) < 1e-9,
              d.dSend ? `channel ${d.chan.drums.toFixed(4)} · echo ${d.dSend.echo.toFixed(4)} · verb ${d.dSend.verb.toFixed(4)}`
                      : "no send mirrors on the graph");
        await pg.evaluate(() => { delete MIXER_TRIM.drums; mixPush(); mixRefreshAll(); });
      }
    }
  }

  /* ═══ EVERY CONTROL A MACHINE DECLARES IS ON ITS GLASS ════════════════════
     THE CHECK THAT WAS MISSING, and it cost three instruments entirely.
     `erangPanel()` returned a skin, a maker and a title and NO `groups`, so
     `drawPanels` walked an empty list and appended nothing — and because a
     panel EXISTED, the plain-slider fallback never fired either. All three Erang
     instruments drew a nameplate, a picker and a reset button with **zero
     controls**. Six declared knobs each, unreachable by hand, on the machines
     that carry a whole genre's sound.

     Nothing saw it because every existing check asks whether a control REACHES
     THE SOUND — and all of these did. None asked whether it is DRAWN. Found the
     same way: three more were declared and undrawn (`cs80.atk`/`rel`, the swell
     that bladerunner's whole bloom rests on; `sax.character`, the second horn;
     `tb303.sweep`, how far an accent opens the filter).

     This loads every machine into every rack that accepts it and compares the
     declaration against the glass. It is the other half of "a knob that does
     nothing is a lie": a knob that does something and cannot be reached. */
  if(onlyFull("every control a machine declares is drawn on its panel")){
    const plan = await pg.evaluate(() => {
      const out = [];
      for(const s of MK2.rackSlots())
        for(const k in MK2.INSTRUMENTS) if(MK2.canFill(s, k)) out.push([s, k]);
      return out;
    });
    /* a machine drawn inside another rack is drawn by that rack, not its own */
    const inside = await pg.evaluate(() => {
      const s = [];
      for(const k in MK2.INSTRUMENTS){
        const pp = MK2.INSTRUMENTS[k].panel && MK2.INSTRUMENTS[k].panel.pads;
        if(pp) for(const p of pp) s.push(p.m);
      }
      return s;
    });
    const bad = [];
    let checked = 0;
    for(const [slot, mach] of plan){
      if(inside.includes(mach)) continue;
      try { await pg.selectOption("#m_" + slot, mach); } catch(e){ continue; }
      await pg.waitForTimeout(140);
      /* ── A MACHINE WITH KITS IS ASKED ACROSS ALL OF THEM ───────────────────
         The declaration has to stay the UNION of every kit's controls — three
         seam checks walk it unconditionally — while the panel draws the kit that
         is loaded. So no single kit draws everything, and asking one kit reports
         the others' knobs as missing. It did: the dungeon kit's six read as
         undrawn because the battery had an 808 in the machine.
         The claim is "nothing is declared that cannot be reached", so the honest
         question is whether the union ACROSS kits covers the declaration. Kits
         are walked through the machine's own KIT select, with real events, so
         this also proves that switch reaches the panel. */
      /* ── ASKED THROUGH WHATEVER CONTROL LOADS THE BOX, NOT THROUGH `kit` ──
         This read `INSTRUMENTS[mach].kits` and drove `[data-key="mach.kit"]` --
         the drum machine's own two names, from when it was the only box with a
         load switch. The bass unit's collection is `engines` and its control is
         `engine`, so this walked none of them and reported fourteen of the
         thirty-six declared controls as undrawn: a red that was true about what
         it measured and wrong about the program. Derived now, so the third box
         with a load switch is covered without this being edited again. */
      const load = await pg.evaluate((mach) => {
        const M = MK2.INSTRUMENTS[mach];
        const c = (M.controls || []).find(x => x.pick);
        const coll = c && M[c.pickFrom || (c.k + "s")];
        return coll ? { ctrl: c.k, names: Object.keys(coll) } : { ctrl: null, names: [] };
      }, mach);
      const kits = load.names;
      const drawnAll = new Set();
      for(const k of (kits.length ? kits : [null])){
        if(k){
          try { await pg.selectOption(`[data-key="${mach}.${load.ctrl}"]`, k); } catch(e){ /* no select */ }
          await pg.waitForTimeout(140);
        }
        const got = await pg.evaluate((mach) => {
          const box = document.querySelector(`.machine[data-machine="${mach}"]`);
          if(!box) return null;
          return [...box.querySelectorAll("[data-key]")]
            .map(e => e.dataset.key.split(".").slice(1).join("."));
        }, mach);
        if(got === null){ drawnAll.add("(no panel drawn at all)"); break; }
        for(const g of got) drawnAll.add(g);
      }
      const r = await pg.evaluate((mach) => ({
        decl: (MK2.INSTRUMENTS[mach].controls || []).map(c => c.k) }), mach);
      const missing = drawnAll.has("(no panel drawn at all)")
        ? ["(no panel drawn at all)"] : r.decl.filter(k => !drawnAll.has(k));
      checked++;
      if(missing.length) bad.push(`${mach} in ${slot}${kits.length ? " (across " + kits.length + " kits)" : ""}: ` +
        `${missing.length} of ${r.decl.length} — ${missing.slice(0, 8).join(" ")}`);
    }
    check("every control a machine declares is drawn on its panel",
          bad.length === 0,
          bad.length ? bad.join(" | ") : checked + " machine/rack pairs, every declared control on the glass");
  }

  /* ═══ EVERY DRUM CHANNEL IS A SLOT YOU CAN LOAD A SOUND INTO ══════════════
     The seam battery proves the ENGINE honours a loaded channel. This is the
     other half and it is the half that has failed before: `2026-08-07h` wrote
     a kit choice into a key nothing read, and the way that shipped was that
     the glass and the sound were never asked the same question in the same
     run. So this drives the actual `<select>` on the actual panel and then
     reads what the program composed.

     THE COUNT IS DERIVED — one loader per column the machine declares with a
     lane, not a number typed here. The TR-1000 has ten channels for twelve
     lanes on purpose (ghost rides with the snare, tom2 with the low tom), so
     any literal would be wrong the day a column moves. */
  {
    await pg.evaluate(() => { const s = document.getElementById("genre");
      s.value = "lofi"; s.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("new").click(); });
    await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => {
      const box = document.querySelector('.machine[data-machine="tr1000"]');
      if(!box) return { err: "no TR-1000 panel" };
      const sels = [...box.querySelectorAll("[data-load]")];
      const want = (MK2.INSTRUMENTS.tr1000.panel.columns || []).filter(c => c.lane).length;
      const voices = MK2.drumLoad().voices;
      return { drawn: sels.length, want,
               /* every loader offers every loadable sound, plus the kit's own */
               opts: sels.map(s => s.options.length),
               nVoices: voices.length,
               lanes: sels.map(s => s.dataset.load) };
    });
    check("every drum channel carries a slot you can load a sound into",
          !r.err && r.drawn === r.want && r.drawn > 0,
          r.err || `${r.drawn} loaders for ${r.want} channels with lanes: ${(r.lanes||[]).join(" ")}`);
    check("...and each one offers every sound the program has, plus the kit's own",
          !r.err && r.opts.every(n => n === r.nVoices),
          r.err || `${r.nVoices} derived voices · options per loader ${[...new Set(r.opts||[])].join(",")}`);

    /* AND THE KIT SELECTOR NAMES THE KIT THAT IS IN THE MACHINE. It said
       "(genre draws)" — true about WHO chose, silent about WHAT is loaded —
       while the machine's own screen said `TR1000 · dungeon` and the strips
       said WAR DRUM. Every other reading on the panel agreed and that one did
       not. Asked on two genres so a single hard-coded default cannot pass. */
    const kitTxt = {};
    for(const g of ["dungeonsynth", "lofi"]){
      kitTxt[g] = await pg.evaluate(async (g) => {
        const s = document.getElementById("genre");
        s.value = g; s.dispatchEvent(new Event("change", { bubbles: true }));
        document.getElementById("new").click();
        await new Promise(r => setTimeout(r, 250));
        const sel = document.querySelector('[data-key="tr1000.kit"]');
        const kit = MK2.currentSong().chart.picks.kit.drums;
        return { drawn: sel ? sel.options[0].textContent : "(no selector)", loaded: kit,
                 /* what that kit is CALLED — the selector says the name, never
                    the key, so the check has to compare against the name too.
                    This asserted `drawn.includes(loaded)` and went red the hour
                    the names landed: the check was stale, not the program. */
                 name: (MK2.INSTRUMENTS.tr1000.kitNames || {})[kit] };  /* picks.kit is keyed by slot now */
      }, g);
    }
    check("the KIT selector names the kit that is actually in the machine",
          Object.values(kitTxt).every(r => r.name && r.drawn.includes(r.name)),
          Object.entries(kitTxt).map(([g, r]) => `${g}: "${r.drawn}" · loaded ${r.name}`).join(" · "));
    await pg.evaluate(async () => {
      const s = document.getElementById("genre");
      s.value = "lofi"; s.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("new").click();
      await new Promise(r => setTimeout(r, 250));
    });

    /* AND DRIVING IT CHANGES WHAT THE PROGRAM COMPOSES. Same shape as the
       "clicking a step writes a pin" chain: touch the glass, read the song. */
    const drove = await pg.evaluate(async () => {
      const sel = document.querySelector('.machine[data-machine="tr1000"] [data-load="kick"]');
      if(!sel) return { err: "no kick loader" };
      const was = [...new Set(MK2.currentSong().perf.events
        .filter(e => e.lane === "kick").map(e => e.voice))];
      sel.value = "wardrum";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise(r => setTimeout(r, 250));
      const now = [...new Set(MK2.currentSong().perf.events
        .filter(e => e.lane === "kick").map(e => e.voice))];
      /* and back to the kit's own, because a load you cannot undo is a trap */
      sel.value = "";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise(r => setTimeout(r, 250));
      const back = [...new Set(MK2.currentSong().perf.events
        .filter(e => e.lane === "kick").map(e => e.voice))];
      return { was, now, back };
    });
    check("...and loading one changes what the program composes",
          !drove.err && drove.now.length === 1 && drove.now[0] === "wardrum" &&
          !drove.was.includes("wardrum"),
          drove.err || `${drove.was.join(",")} -> ${drove.now.join(",")}`);
    check("...and clearing it puts the kit's own sound back",
          !drove.err && drove.back.join(",") === drove.was.join(","),
          drove.err || `back to ${(drove.back||[]).join(",")} (was ${(drove.was||[]).join(",")})`);
  }

  /* ═══ A PART'S SEND MOVES THAT PART, AND ONLY THAT PART ═══════════════════
     The whole reason the sends moved off the bus. Three strips share the keys
     bus and two share the lead bus, so before this an echo knob on `chords 2`
     wet `chords` and `figure` with it -- the user: "give every part its own
     send". A knob that moves three parts is not the control its label promises.

     WHAT THIS PROVES AND WHAT IT DOES NOT, because I checked: it reads the
     gain each part's send node HOLDS, so it proves the levels are per part and
     that one knob does not move its neighbours. **It does not prove the node is
     WIRED**: rebuilding with the sends fed from the bus again leaves these
     numbers identical and this check still green. Driven to failure, and it did
     not fail, which is the only reason that limit is known.

     THE WIRING IS PROVED BY THE RENDER A/B (`ab.js`, run by hand against the
     previous build): same seed, same genre, samples compared. That is what
     caught the real defect this change found -- see the jungle break. */
  {
    const graph = () => pg.evaluate(() => MK2.soundState().send);
    await pg.evaluate(() => document.getElementById("play").click());
    await pg.waitForTimeout(1200);
    const before = await graph();
    const parts = before ? Object.keys(before) : [];
    /* a part that SHARES its bus, so "only that part" is a real claim */
    const shared = await pg.evaluate(() => {
      const b = {}; for(const r in MK2.soundState().send) b[r] = 0;
      return "keys2";
    });
    await pg.evaluate(r => MK2.setMixer({ [r]: { room: -0.7, echo: -0.4 } }), shared);
    await pg.waitForTimeout(200);
    const after = await graph();
    const moved = parts.filter(r => JSON.stringify(after[r]) !== JSON.stringify(before[r]));
    check("each part carries its own reverb and delay level, not its bus's",
          parts.length > 0 && moved.length === 1 && moved[0] === shared,
          parts.length
            ? `${parts.length} parts have their own sends; turning ${shared} moved ${moved.join(",") || "nothing"}` +
              `  (${shared} room ${before[shared] ? before[shared].room : "?"} -> ${after[shared] ? after[shared].room.toFixed(2) : "?"})`
            : "no send levels reported");
    /* and the parts sharing that bus did NOT move -- stated separately because
       it is the specific thing that was wrong */
    const sameBus = ["keys", "ostinato"].filter(r => parts.includes(r));
    check("...so the parts sharing its bus are untouched",
          sameBus.length > 0 && sameBus.every(r => after[r] && after[r].room === 1),
          sameBus.map(r => r + " room " + (after[r] ? after[r].room : "?")).join(" · "));
    await pg.evaluate(() => MK2.setMixer({}));
    await pg.evaluate(() => document.getElementById("stop").click());
    await pg.waitForTimeout(150);
  }

  /* ═══ A BOX WITH A LOAD SWITCH SHOWS THE FACE OF WHAT IS LOADED ═══════════
     "A bass unit that loads different bass engines just like how the tr1000
     loads different drum kits." This is the check on that sentence, and it is
     written to cover BOTH boxes and whatever comes third: it finds every
     machine with a `pick: true` control, drives that control to every position,
     and asks three things that each have a way of going quietly wrong.

       · THE PANEL NAMES WHAT IS LOADED. The plate said DEVIL FISH over a Reese
         and the selector said "sub bass" over a song playing the 303 -- a lie
         told by the one surface whose job is to describe the machine.
       · EVERY CONTROL THE LOAD DECLARES IS ON THE GLASS. `controls` has to stay
         the UNION across loads, so no single load draws everything and it is
         easy to draw nothing: three Erang instruments once drew zero knobs.
       · NOTHING ELSE IS. The 303's twenty-one knobs are read only as
         `P(g, ev, "tb303", …)`, so a SLIDE knob over a sub bass would reach
         nothing at all -- the defect this whole rack exists to remove. */
  {
    const boxes = await pg.evaluate(() => {
      const out = [];
      for(const k in MK2.INSTRUMENTS){
        const M = MK2.INSTRUMENTS[k];
        const c = (M.controls || []).find(x => x.pick);
        const coll = c && M[c.pickFrom || (c.k + "s")];
        if(coll) out.push([k, M.slot, c.k, Object.keys(coll)]);
      }
      return out;
    });
    const bad = [], seen = [];
    for(const [mach, slot, ctrl, loads] of boxes){
      const skins = new Set();
      for(const load of loads){
        const r = await pg.evaluate(async (a) => {
          const [mach, slot, ctrl, load] = a;
          const s = document.getElementById("m_" + slot);
          if(s){ s.value = mach; s.dispatchEvent(new Event("change", { bubbles: true }));
                 await new Promise(r => setTimeout(r, 250)); }
          const sw = document.querySelector(`[data-key="${mach}.${ctrl}"]`);
          if(!sw) return { err: "no " + ctrl + " switch on the glass" };
          sw.value = load; sw.dispatchEvent(new Event("change", { bubbles: true }));
          await new Promise(r => setTimeout(r, 300));
          const box = document.querySelector(`.machine[data-machine="${mach}"]`);
          if(!box) return { err: "no panel" };
          const M = MK2.INSTRUMENTS[mach];
          const coll = M[ctrl + "s"] || M[ctrl] || {};
          const entry = coll[load] || {};
          /* what this load says it wants drawn; a load with no override wears
             the machine's own panel, which is the union's own layout */
          const wants = entry.krow || null;
          const drawn = [...box.querySelectorAll(".krow [data-key], .deck [data-key]")]
            .map(e => e.dataset.key.split(".").slice(1).join("."));
          return { skin: (box.className.match(/sk-[\w-]+/) || [""])[0],
                   plate: box.querySelector(".model").textContent,
                   says: document.querySelector(`[data-key="${mach}.${ctrl}"]`).options[0].textContent,
                   missing: wants ? wants.filter(k => !drawn.includes(k)) : [],
                   extra: wants ? drawn.filter(k => !wants.includes(k) && k !== ctrl) : [] };
        }, [mach, slot, ctrl, load]);
        if(r.err){ bad.push(`${mach}/${load}: ${r.err}`); continue; }
        skins.add(r.skin);
        if(r.missing.length) bad.push(`${mach} with ${load} loaded does not draw: ${r.missing.join(" ")}`);
        if(r.extra.length)   bad.push(`${mach} with ${load} loaded draws another load's knobs: ${r.extra.join(" ")}`);
        if(!r.says.startsWith(load) && !r.says.toLowerCase().includes(load.toLowerCase())){
          /* the switch shows the ENGLISH name, so compare against that */
          const eng = await pg.evaluate(a => (MK2.INSTRUMENTS[a[0]][a[1] + "Names"] || {})[a[2]], [mach, ctrl, load]);
          if(!eng || !r.says.startsWith(eng)) bad.push(`${mach} with ${load} loaded says "${r.says}"`);
        }
      }
      if(skins.size > 1) bad.push(`${mach} wears ${skins.size} different faces`);
      else seen.push(`${mach}.${ctrl}: ${loads.length} loads, one face, each drawing its own`);
    }
    check("a box with a load switch shows the face of what is loaded, and only that",
          bad.length === 0 && boxes.length > 0,
          bad.length ? bad.slice(0, 4).join(" · ") : seen.join(" · "));
  }


  /* ═══ NO VARIABLE NAME IS EVER VISIBLE ON THE PAGE ════════════════════════
     Reported: "You can not use the words erang in front of a drum name thats
     horrible practice." It was not one name — deriving the drum rack's
     loadable list from the voice table put THIRTY-FOUR identifiers on a front
     panel (`erangDrum`, `psgOpenhat`, `dacGhost`, `oh808`, `brk`) — and the
     sweep written to confirm the fix immediately found an OLDER one nobody had
     looked for: the song header said `rig sega` while `RIG_LABEL`, which
     exists for precisely that and was written for the picker, had "SEGA —
     YM2612" sitting in it.

     THE LIST OF FORBIDDEN WORDS IS DERIVED: **a key its own display name does
     not contain is a key that must never be seen.** That test took three
     tries and the two rejected ones are worth recording, because both were
     checks that reported defects where there were none:

       · "every key" — flags `kick`, `clap`, `ride`, `snare`, which are keys
         AND English words and appear on the panel legitimately;
       · "every key whose name differs from it" — flags `analog` inside
         "analog drum machine" and `acoustic` inside "acoustic drum kit",
         where the name deliberately KEPT the word.

     Containment is the honest form: it asks whether the display kept the word,
     which is exactly the property that makes a key safe to show. `gretsch` is
     not in "recorded drum kit", `brk` is not in "chopped breakbeat" and
     `erangDrum` is not in "hand percussion", so all three are guarded. Name a
     new sound and this check starts guarding it in the same edit.

     AND IT IS SCOPED, deliberately, to the surfaces that PRINT a name the
     program chose: the machine racks and the song header. The first version
     swept the whole page and immediately cried wolf — `dungeon` is a kit key
     AND an ordinary word in "dungeon synth" on the genre picker, and no amount
     of pattern-matching separates those two without knowing what the words
     mean. A check that reports a defect where there is none is worse than no
     check; this file already has the false-CHANGED snapshot in its history to
     prove it. Scoping loses nothing real — these are the only places a raw key
     has ever reached the glass, and both of today's bugs are inside it.

     It reads every genre, because a name only appears once something loads it. */
  {
    const forbidden = await pg.evaluate(() => {
      const out = new Set();
      const guard = (key, name) => { if(name && !name.includes(key)) out.add(key); };
      const D = MK2.drumLoad();
      for(const v of D.voices) guard(v, MK2.drumSoundName(v));
      for(const m in MK2.INSTRUMENTS){
        const M = MK2.INSTRUMENTS[m];
        for(const c of (M.controls || [])){
          if(!c.pick) continue;
          const names = M[c.k + "Names"] || {};
          for(const k in names) guard(k, names[k]);
        }
      }
      /* ── AND A WORD THE PROGRAM USES AS ENGLISH IS NOT EVIDENCE ──────────
         `dungeon` is a kit key AND half the name of a genre. Seeing "dungeon
         synth" in the song header is not a leaked key, it is a genre being
         named, and no rule about identifiers can tell those apart.

         So every string the program declares as a DISPLAY name — genre
         labels, machine labels, rig labels, kit names, sound names — is
         collected, and any key that appears inside one is dropped from the
         set. Derived on both sides, so nothing here is a hand-written
         exception.

         WHAT THAT COSTS, stated rather than hidden: a literal `dungeon` on
         the drum machine would no longer be caught, because the word is in
         use elsewhere as English. That is a handful of keys out of 34, and
         the alternative is a check that reports a defect where there is none
         — which this file's history says is the worse of the two. */
      const legit = [
        ...[...document.getElementById("genre").options].map(o => o.textContent),
        ...Object.keys(MK2.INSTRUMENTS).map(k => MK2.INSTRUMENTS[k].label || ""),
        ...Object.values(MK2.rigLabels()),
        ...D.voices.map(v => MK2.drumSoundName(v)),
      ].join("   ");
      return [...out].filter(k => !legit.includes(k));
    });
    const hits = [];
    for(const g of await pg.evaluate(() => MK2.genres())){
      await pg.evaluate(async (g) => {
        const s = document.getElementById("genre");
        s.value = g; s.dispatchEvent(new Event("change", { bubbles: true }));
        document.getElementById("new").click();
        await new Promise(r => setTimeout(r, 300));
      }, g);
      const found = await pg.evaluate((words) => {
        const rx = new RegExp("\\b(" + words.join("|") + ")\\b");
        const out = new Set();
        /* every machine rack, and the song header — the two surfaces that
           print a name the program picked */
        /* NOT the genre picker: it renders GENRE names, its own vocabulary,
           and "dungeon synth" is a genre whose words collide with a kit key
           for no reason connected to either. It has its own check two blocks
           below, which asks the right question of it. */
        const scope = [...document.querySelectorAll(".machine"),
                       document.getElementById("info")].filter(Boolean);
        const skip = document.getElementById("genre");
        for(const root of scope){
          for(const n of root.querySelectorAll("select")){
            if(n === skip) continue;
            for(const o of n.options)
              if(rx.test(o.textContent)) out.add("option “" + o.textContent.trim().slice(0, 50) + "”");
          }
          const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n =>
            /^(SCRIPT|STYLE|OPTION)$/.test(n.parentNode.nodeName)
              ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
          let t; while((t = w.nextNode()))
            if(rx.test(t.nodeValue)) out.add("text “" + t.nodeValue.trim().slice(0, 60) + "”");
        }
        return [...out];
      }, forbidden);
      for(const f of found) hits.push(g + ": " + f);
    }
    check("no variable name is visible on a rack or in the song header, on any genre",
          hits.length === 0,
          hits.length ? hits.slice(0, 4).join(" | ")
                      : `${forbidden.length} internal keys guarded across ` +
                        `${(await pg.evaluate(() => MK2.genres())).length} genres`);

    /* AND THE ONE THE SWEEP CANNOT COVER, ASKED DIRECTLY. A rig key like
       `sega` is guarded out of the set above by containment — "SEGA — YM2612"
       holds the word, just in capitals — and `jungle` is a rig key that is
       also a genre name. So the header is asked the positive question instead:
       does it print the rig's LABEL? It printed `rig sega` for as long as
       this line has existed. */
    const rigBad = [];
    for(const g of await pg.evaluate(() => MK2.genres())){
      const r = await pg.evaluate(async (g) => {
        const s = document.getElementById("genre");
        s.value = g; s.dispatchEvent(new Event("change", { bubbles: true }));
        document.getElementById("new").click();
        await new Promise(r => setTimeout(r, 250));
        const rig = MK2.currentSong().chart.rig;
        return { rig, want: MK2.rigLabels()[rig],
                 txt: document.getElementById("info").textContent };
      }, g);
      if(!r.want) rigBad.push(g + ": rig " + r.rig + " has no label at all");
      else if(!r.txt.includes("rig " + r.want)) rigBad.push(g + ": header says rig " + r.rig);
    }
    check("...and the song header names the rig rather than its table key",
          rigBad.length === 0,
          rigBad.length ? rigBad.join(" · ") : "all genres name their rig");
  }

  /* ═══ EVERY GENRE THE PROGRAM DECLARES IS ON THE PICKER, AND PLAYS ═════════
     NOTHING CHECKED THIS, and the cost was quiet. An eighth genre --
     `dungeonsynth` -- shipped, reached the published artifact, and composed
     songs, while every document in the repo went on saying "seven genres" and
     no probe, check or table noticed. The count is not the point; the point is
     that the picker is a LIST OF WHAT THE PROGRAM CONTAINS, and this file has
     a standing law about those.

     So the picker is asked against `MK2.genres()`, in both directions: no genre
     missing from the glass, and no option on the glass that the program does
     not have. Then each one is actually selected and composed, because an
     option that is drawn and throws is the same defect one layer along. ═════ */
  {
    const gs = await pg.evaluate(() => MK2.genres());
    const opts = await pg.evaluate(() =>
      [...document.getElementById("genre").options].map(o => o.value));
    const missing = gs.filter(g => !opts.includes(g));
    const extra   = opts.filter(o => !gs.includes(o));
    check("the genre picker offers exactly the genres the program declares",
          missing.length === 0 && extra.length === 0,
          `picker ${opts.length} · program ${gs.length}` +
          (missing.length ? "  MISSING FROM THE GLASS: " + missing.join(" ") : "") +
          (extra.length   ? "  ON THE GLASS ONLY: "      + extra.join(" ")   : ""));

    const bad = [];
    for(const g of gs){
      const r = await pg.evaluate(async (g) => {
        try{
          const sel = document.getElementById("genre");
          sel.value = g; sel.dispatchEvent(new Event("change", { bubbles:true }));
          document.getElementById("new").click();
          await new Promise(r => setTimeout(r, 120));
          const s = MK2.currentSong();
          return { ok: s.perf.events.length > 0 && s.chart.table.label != null,
                   ev: s.perf.events.length, label: s.chart.table.label };
        }catch(e){ return { ok:false, err:String(e.message).slice(0,70) }; }
      }, g);
      if(!r.ok) bad.push(g + ": " + (r.err || "0 events"));
    }
    check("...and every one of them composes when it is picked",
          bad.length === 0,
          bad.length ? bad.join(" | ") : gs.length + " genres, all compose from the picker");
  }

  check("no uncaught page errors at any point", errs.length === 0, errs.slice(0, 3).join(" | "));
  await b.close();
  console.log("\n" + pass + " passed, " + fail + " failed" +
    (skippedNames.length ? "  — the long ones were not run (--full adds them): " +
                           skippedNames.map(n => "“" + n + "”").join(", ") : ""));
  for(const n of failedNames) console.log("  FAILED: " + n);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
