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
  /* HOW MANY SLOTS THERE ARE IS THE PROGRAM'S TO SAY. The comment above claims
     this count is derived from the rack; only the FIXED half ever was, and the
     picked half stayed the literal 3 -- so a fourth and a fifth rack turned
     this green check red without anything being wrong with the program. Third
     time this number has gone stale, and the last. */
  const slots = await pg.evaluate(() => MK2.rackSlots().length);
  check("each slot draws its own machine's panel, and every fixed machine is always there",
        shape.length === slots + fixed.length && shape.every(s => s.skin) &&
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
  {
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

  check("no uncaught page errors at any point", errs.length === 0, errs.slice(0, 3).join(" | "));
  await b.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
