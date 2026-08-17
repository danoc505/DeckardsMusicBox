#!/usr/bin/env node
/* THE MIDI PORT, PROVEN WITHOUT A MIDI PORT.
     node harness/mk2_midi.js

   There is no hardware in this container and there never will be, so the thing
   under test cannot be "does the Organelle make a noise". What CAN be tested is
   the only thing this program is responsible for: THE BYTES IT SENDS AND WHEN.
   A stub `navigator.requestMIDIAccess` is installed before the page loads, its
   one output records every message and timestamp, and the real transport is
   driven through the real DOM handlers.

   That boundary is worth being honest about. This proves the message stream is
   correct. It does not prove a synth likes it, and the user's a verdict on it remain the
   judge of that -- but "every note-on has its note-off" is not a taste question
   and should never have been left to one.

   The checks that matter most are the two failure modes that make a MIDI
   integration unusable rather than imperfect:
     - A HUNG NOTE. Every on must have a matching off, and the stop button must
       silence every channel it ever touched.
     - DRIFT FROM THE AUDIO. The port must play exactly the events the pump
       decided to play -- not the event list, THE PUMP'S DECISION -- or the two
       outputs disagree under load. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const check = (n, ok, d) => { console.log((ok ? "  ✓ " : "  ✗ FAIL: ") + n + (d ? "  (" + d + ")" : "")); ok ? pass++ : fail++; };

/* the stub port. Records data + timestamp, and reports itself as a normal
   output so the picker's own code path is the one exercised. */
const STUB = `
(() => {
  const log = [];
  window.__midiLog = log;
  const out = {
    id: "stub-1", name: "Stub Synth", manufacturer: "harness",
    type: "output", state: "connected", connection: "open",
    send(data, ts){ log.push({ d: Array.from(data), t: (ts === undefined ? null : ts), at: performance.now() }); },
    clear(){}, open(){ return Promise.resolve(this); }, close(){ return Promise.resolve(this); }
  };
  const access = {
    inputs: new Map(),
    outputs: new Map([["stub-1", out]]),
    onstatechange: null, sysexEnabled: false
  };
  Object.defineProperty(navigator, "requestMIDIAccess", {
    configurable: true,
    value: () => Promise.resolve(access)
  });
})();
`;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message)));
  pg.on('console', m => { if (m.type() === 'error') errs.push("CONSOLE: " + m.text()); });
  await pg.addInitScript(STUB);
  await pg.goto('file://' + path.resolve(__dirname, '..', 'Boxcar Synth.html'),
                { waitUntil: 'load', timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 20000 });

  /* ── nothing is sent until a port is chosen ── */
  await pg.evaluate(() => { document.getElementById('play').click(); });
  await pg.waitForTimeout(700);
  let n = await pg.evaluate(() => window.__midiLog.length);
  check("no port chosen sends nothing", n === 0, n + " messages");
  await pg.evaluate(() => { document.getElementById('play').click(); });
  await pg.waitForTimeout(200);

  /* ── choosing the port goes through the real handlers ── */
  const picked = await pg.evaluate(async () => {
    const sel = document.getElementById('midiout');
    sel.dispatchEvent(new Event('focus'));
    await new Promise(r => setTimeout(r, 300));
    const opts = [...sel.options].map(o => o.value);
    sel.value = "stub-1";
    sel.dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 200));
    return { opts, note: document.getElementById('midinote').textContent };
  });
  check("the picker finds the port and says so",
        picked.opts.includes("stub-1") && /Stub Synth/.test(picked.note),
        picked.note.trim());

  /* ── play, and read what went out of the port ── */
  await pg.evaluate(() => { window.__midiLog.length = 0; document.getElementById('play').click(); });
  await pg.waitForTimeout(3000);
  const played = await pg.evaluate(() => {
    const t0 = window.PLAY_T0_FOR_TEST;
    return { log: window.__midiLog.slice(),
             events: SONG.perf.events.filter(e => e.role !== "tape").length,
             genre: SONG.chart.genre };
  });
  await pg.evaluate(() => { document.getElementById('play').click(); });
  await pg.waitForTimeout(300);
  const after = await pg.evaluate(() => window.__midiLog.slice());

  const notes = played.log.filter(m => (m.d[0] & 0xf0) === 0x90 || (m.d[0] & 0xf0) === 0x80);
  const ons  = notes.filter(m => (m.d[0] & 0xf0) === 0x90);
  const offs = notes.filter(m => (m.d[0] & 0xf0) === 0x80);
  check("the port actually plays", ons.length > 0, ons.length + " note-ons in 3 s of " + played.genre);

  /* ── EVERY ON HAS ITS OFF. The hung-note check. ── */
  const key = m => (m.d[0] & 0x0f) + ":" + m.d[1];
  const onCount = {}, offCount = {};
  for (const m of ons)  onCount[key(m)]  = (onCount[key(m)]  || 0) + 1;
  for (const m of offs) offCount[key(m)] = (offCount[key(m)] || 0) + 1;
  const unmatched = Object.keys(onCount).filter(k => (offCount[k] || 0) !== onCount[k]);
  check("every note-on has a matching note-off", unmatched.length === 0,
        unmatched.length ? unmatched.slice(0, 4).join(", ") : ons.length + " on / " + offs.length + " off, paired");

  /* ── and the off is always LATER than its on ── */
  const bad = [];
  for (const on of ons) {
    const off = offs.find(o => key(o) === key(on) && o.t > on.t);
    if (!off) bad.push(key(on));
  }
  check("...and every off is stamped after its on", bad.length === 0,
        bad.length ? bad.slice(0, 4).join(", ") : "all " + ons.length + " ordered");

  /* ── the stamps are real future times, not nulls ── */
  const stamped = notes.filter(m => typeof m.t === "number").length;
  check("every note is scheduled with a timestamp", stamped === notes.length,
        stamped + "/" + notes.length + " stamped");

  /* ── channels are the .mid's channels, so a receiver set up for the exported
       file is set up for this ── */
  const chans = [...new Set(ons.map(m => m.d[0] & 0x0f))].sort((a, z) => a - z);
  const legal = await pg.evaluate(() => Object.values(MK2.midiTracks()).map(t => t.ch));
  check("every channel is one the .mid export uses",
        chans.every(c => legal.includes(c)), "channels " + chans.join(",") + " of " + legal.join(","));

  /* ── drums land on GM keys on channel 10 ── */
  const drumKeys = [...new Set(ons.filter(m => (m.d[0] & 0x0f) === 9).map(m => m.d[1]))].sort((a, z) => a - z);
  const gm = await pg.evaluate(() => Object.values(MK2.gmDrum()));
  check("the drums are GM keys on channel 10",
        drumKeys.length > 0 && drumKeys.every(k => gm.includes(k) || [39, 51].includes(k)),
        "keys " + drumKeys.join(","));

  /* ── velocities in range ── */
  const vels = ons.map(m => m.d[2]);
  check("velocity is always 1..127", vels.every(v => v >= 1 && v <= 127),
        "min " + Math.min(...vels) + " max " + Math.max(...vels));

  /* ── THE PORT PLAYS THE PUMP'S DECISION, not its own reading of the list.
       Every note-on must correspond to a real event of this song. ── */
  const truth = await pg.evaluate(() => {
    const out = {};
    for (const e of SONG.perf.events) {
      const T = MK2.midiTracks()[e.role]; if (!T) continue;
      const k = MK2.midiKeyFor(e); if (k == null) continue;
      out[T.ch + ":" + k] = (out[T.ch + ":" + k] || 0) + 1;
    }
    return out;
  });
  const strangers = Object.keys(onCount).filter(k => !truth[k]);
  check("every note sent is a note this song contains", strangers.length === 0,
        strangers.length ? strangers.slice(0, 4).join(", ") : Object.keys(onCount).length + " distinct ch:key, all real");

  /* ── STOP SILENCES THE HARDWARE ── */
  const cc = after.filter(m => (m.d[0] & 0xf0) === 0xb0);
  const soundOff = new Set(cc.filter(m => m.d[1] === 120).map(m => m.d[0] & 0x0f));
  const notesOff = new Set(cc.filter(m => m.d[1] === 123).map(m => m.d[0] & 0x0f));
  check("stop sends all-sound-off and all-notes-off on every channel it used",
        chans.every(c => soundOff.has(c) && notesOff.has(c)),
        "silenced " + [...soundOff].sort().join(",") + " of used " + chans.join(","));

  /* ── THE PORT RUNS AHEAD OF THE AUDIO, by the pump's horizon and no further.
       This is as close to "is it in time" as a container without hardware can
       honestly get: every message must be scheduled into the FUTURE (a stamp in
       the past is a message the browser fires immediately, which is a flam), and
       inside the 1.2 s lookahead the pump works to. A wide spread here would
       mean the context->performance anchor is drifting. ── */
  {
    /* THE HORIZON BOUNDS NOTE-ONS, NOT EVERY MESSAGE. The first version of this
       check measured ons and offs together and failed at 2664 ms -- and it was
       the check that was wrong: an off is stamped at on + duration, so a pad
       held four seconds legitimately has its off four seconds out. Bounding
       that by the pump's horizon is measuring the note's LENGTH against the
       scheduler's lookahead, which are not the same quantity. Ons are what the
       pump emits, so ons are what the pump's horizon governs. */
    const lead = ons.map(m => m.t - m.at).filter(x => Number.isFinite(x));
    const lo = Math.min(...lead), hi = Math.max(...lead);
    check("every note-on is scheduled into the future, inside the pump's horizon",
          lo > -5 && hi < 1400,
          `on lead ${lo.toFixed(0)}..${hi.toFixed(0)} ms (pump horizon 1200)`);
    /* and an off is never in the past either -- that is the hung-note edge */
    const offLead = offs.map(m => m.t - m.at);
    check("...and no note-off is stamped in the past", Math.min(...offLead) > -5,
          `off lead ${Math.min(...offLead).toFixed(0)}..${Math.max(...offLead).toFixed(0)} ms`);
  }

  /* ══ THE CLOCK ══════════════════════════════════════════════════════════ */
  const clock = await pg.evaluate(async () => {
    document.getElementById('midiclock').click();          // arm it
    window.__midiLog.length = 0;
    document.getElementById('play').click();
    await new Promise(r => setTimeout(r, 2500));
    const log = window.__midiLog.slice();
    const tempo = SONG.chart.tempo;
    document.getElementById('play').click();
    await new Promise(r => setTimeout(r, 250));
    return { log, tempo, after: window.__midiLog.slice() };
  });
  const ticks = clock.log.filter(m => m.d.length === 1 && m.d[0] === 0xf8);
  check("the clock ticks", ticks.length > 40, ticks.length + " ticks in 2.5 s");
  check("...and it starts with Start (0xFA)",
        clock.log.some(m => m.d[0] === 0xfa), "0xFA present");

  /* 24 ppqn: the spacing IS the tempo. Held to the song's own tempo, not to a
     number typed in here -- the same rule as every other threshold in this repo. */
  {
    const want = 60 / clock.tempo / 24 * 1000;              // ms per tick
    const st = ticks.map(m => m.t).sort((a, z) => a - z);
    const gaps = []; for(let i = 1; i < st.length; i++) gaps.push(st[i] - st[i - 1]);
    const mean = gaps.reduce((a, b2) => a + b2, 0) / Math.max(1, gaps.length);
    const worst = Math.max(...gaps.map(g => Math.abs(g - want)));
    check("the clock runs at this song's tempo",
          Math.abs(mean - want) < 0.5,
          `${mean.toFixed(3)} ms/tick, want ${want.toFixed(3)} (${clock.tempo} bpm)`);
    /* computed from t0 + n*period, so no tick may wander even a little */
    check("...and no tick drifts", worst < 0.5, `worst tick ${worst.toFixed(4)} ms off`);
  }
  check("stopping sends Stop (0xFC)",
        clock.after.some(m => m.d[0] === 0xfc), "0xFC present");

  /* ── STARTING MID-SONG CONTINUES, it does not throw the gear back to bar 1 ── */
  const mid = await pg.evaluate(async () => {
    window.__midiLog.length = 0;
    /* start at a real song position, the way a step edit resumes */
    startPlayback(30);
    await new Promise(r => setTimeout(r, 600));
    const log = window.__midiLog.slice();
    document.getElementById('play').click();
    await new Promise(r => setTimeout(r, 200));
    return { log, tempo: SONG.chart.tempo };
  });
  const spp = mid.log.find(m => m.d[0] === 0xf2);
  const wantSixteenth = Math.floor(30 / (60 / mid.tempo / 4));
  check("a mid-song start sends Song Position, not Start",
        !!spp && mid.log.some(m => m.d[0] === 0xfb) && !mid.log.some(m => m.d[0] === 0xfa),
        spp ? `SPP ${spp.d[1] | (spp.d[2] << 7)} sixteenths (want ${wantSixteenth}) + Continue` : "no SPP");

  check("no uncaught page errors", errs.length === 0, errs.slice(0, 2).join(" | "));

  console.log("\n" + pass + " passed, " + fail + " failed");
  await b.close();
  process.exit(fail ? 1 : 0);
})();
