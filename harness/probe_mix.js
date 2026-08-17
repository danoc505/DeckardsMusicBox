#!/usr/bin/env node
/* PROBE_MIX — WHAT SITS WHERE, RENDERED, IN THREE TWENTY-SECOND WINDOWS

     node harness/probe_mix.js [seed] [file.html]

   THE MOST VALUABLE UNBUILT GUARD IN THE REPO, per boxcar-synth.md §10 item 2,
   open as task #118 since long before the rewrite. Its absence has now bitten
   four times:

     §4d     the world sat 10-18 dB OVER the band and drowned it
     §4d-ii  the correction overshot and buried the train's own signals at
             -36.7 dB, "which is not quiet, it is absent"
     §4d-ii  and the train itself had drifted from -9 to -12.8, because the
             band grew underneath a constant nobody re-measured
     today   the levels were copied out of §4d-ii — numbers measured against a
             DIFFERENT BAND — and the owner's verdict was "the SFX is drowning
             everything out ... nothing has its place most things are to quite"

   Every one of those is the same defect: A LEVEL SET AGAINST A REFERENCE STAYS
   PUT WHILE THE REFERENCE MOVES. Nothing in this program has ever measured one
   level against another, and no amount of measuring parts one at a time finds
   it, because each part is correct on its own.

   ── WHY WINDOWS, AND NOT THE RECORD ────────────────────────────────────────
   [owner] "rendering a 20 min song going to take to long. You need a solution
   for that."

   Right, and the whole record is not the question. Relative level is, and it
   is answered by twenty seconds at a place where the answer matters. So this
   renders THREE, chosen by asking the form where they are rather than by
   guessing a timestamp:

     CRUISE      mid-leg, the full band running — where the mix mostly is
     THE STOP    the middle of a station, where the world is loudest against
                 the least band, which is exactly where drowning happens
     PULLING OUT the bar the train moves again — the busiest boundary

   Three twenty-second renders instead of one twenty-minute one: the same
   question, about a hundredth of the compute.

   ── WHAT IT REPORTS ────────────────────────────────────────────────────────
   dB relative to THE BAND in that same window, which is the only frame that
   means anything, with the sheet's own targets [§4d-ii] beside each:

     the train        -9     its running gear under the floor
     its own sounds   -11    whistle, brakes, station, doors, THE CONDUCTOR
     the landscape    -25    terrain and weather
     every chair             one line each, so a buried or silent player shows

   ⚠ UNWEIGHTED, AND THAT IS A REAL LIMIT. An A-weighted reading is what
   separates "enormous" from "loud" — a part in the bottom octave can carry the
   energy of a mix while being nearly inaudible, which is exactly how the old
   pad-bass measured fine and could not be heard. `probe_stems.js` carries a
   BUILT-AND-CHECKED IEC 61672 filter; lifting it into here is the next step
   and is written down rather than quietly skipped. What this catches as it
   stands is the GROSS fault — the class that has bitten four times. */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SEED = parseInt(process.argv[2], 10) || 1;
const HTML = path.resolve(process.argv[3] || path.join(__dirname, "..", "Boxcar Synth.html"));
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium";
const WIN = 20;

/* WHICH ROLES BELONG TO WHICH THING. The STORY is not the world [§4d-ii]: the
   whistle, the brakes, the station, the doors and the conductor are what tell
   you the train is arriving, stopping and leaving, and they belong forward of
   the countryside by a wide margin. Getting those two into one bucket is the
   mistake that build 16a made. */
const GROUP = {
  band:  ["drums", "bass", "keys", "keys2", "lead", "counter", "ostinato"],
  train: ["drone"],
  story: ["station", "engine"],
  world: ["scene", "pass", "weather"],
};
const TARGET = { train: -9, story: -11, world: -25 };

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", e => errs.push(String(e.message)));
  await pg.goto("file://" + HTML, { waitUntil: "load", timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 30000 });

  const out = await pg.evaluate(async ([SEED, WIN, GROUP]) => {
    const M = window.MK2;
    const song = M.composeSong(SEED, undefined, M.genres()[0]);
    const C = M.makeClock(song.chart, song.form);
    const at = b => C.at(b, 0);

    /* ── WHERE THE THREE WINDOWS ARE — ASKED OF THE FORM ──────────────────
       Never a guessed timestamp: a record whose legs came out shorter would
       have the probe measuring the wrong moment and reporting it confidently. */
    const F = song.form;
    const cruise = F.find(s => s.leg != null && s.atStop == null && s.legPos > 0.4 && s.legPos < 0.6)
                || F.find(s => s.atStop == null);
    const stop = F.find(s => s.atStop != null && s.soloOf == null) || F.find(s => s.atStop != null);
    const pull = F.find(s => s.atStop != null && F.indexOf(s) > F.indexOf(stop || F[0]) + 1);
    const spots = [["cruise", cruise], ["the stop", stop], ["pulling out", pull]]
      .filter(x => x[1]).map(([n, s]) => [n, at(s.startBar), s.fn]);

    const rms = a => { let t = 0; for(let i = 0; i < a.length; i++) t += a[i] * a[i];
                       return Math.sqrt(t / Math.max(1, a.length)); };
    const dB = v => v <= 1e-9 ? -Infinity : 20 * Math.log10(v);

    /* one render per group per window, over the SAME window, so what is
       compared is the same twenty seconds of the same record */
    const render = async (evs, from, secs) => {
      /* A BED THAT STARTED BEFORE THE WINDOW IS STILL SOUNDING IN IT, and
         shifting it whole gives a negative start time — which the audio
         graph refuses outright ("Time must be a finite non-negative number").
         So an event that straddles the edge is CLAMPED to the window's start
         and loses the part that already played, which is what "the part of it
         you hear in these twenty seconds" means. */
      const win = evs.filter(e => e.tSec + (e.durSec || 0) > from && e.tSec < from + secs)
        .map(e => {
          const t = e.tSec - from;
          if(t >= 0) return Object.assign({}, e, { tSec: t });
          return Object.assign({}, e, { tSec: 0, durSec: Math.max(0.05, (e.durSec || 0) + t) });
        });
      if(!win.length) return 0;
      const buf = await M.renderWav(win, secs, 22050, song.chart.space, song.chart.kick,
                                    song.chart.drumDrive, song.chart.gate, song.motion, from);
      /* `renderWav` hands back a WAV FILE, not samples — it is the same door
         the export button uses. The first version of this probe read it as an
         AudioBuffer, got nothing back from every group, and printed SILENT
         twelve times over: a probe confidently reporting that a record playing
         eight thousand events makes no sound. Read the header, then the PCM. */
      /* and it hands back a BLOB — the object the download link takes. Two
         wrong guesses about this one return value (AudioBuffer, then a typed
         array) each produced a full page of confident SILENT. Ask it what it
         is rather than assuming. */
      const u = new Uint8Array(buf instanceof Blob ? await buf.arrayBuffer()
                : buf instanceof Uint8Array ? buf.buffer : (buf.buffer || buf));
      const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
      let off = 12, bits = 16, ch = 1, dataAt = -1, dataLen = 0;
      while(off + 8 <= u.byteLength){
        const id = String.fromCharCode(u[off], u[off+1], u[off+2], u[off+3]);
        const sz = dv.getUint32(off + 4, true);
        if(id === "fmt "){ ch = dv.getUint16(off + 10, true); bits = dv.getUint16(off + 22, true); }
        if(id === "data"){ dataAt = off + 8; dataLen = sz; break; }
        off += 8 + sz + (sz & 1);
      }
      if(dataAt < 0) return 0;
      const n = Math.floor(dataLen / (bits / 8));
      const out = new Float32Array(Math.floor(n / ch));
      for(let i = 0; i < out.length; i++)
        out[i] = bits === 16 ? dv.getInt16(dataAt + i * ch * 2, true) / 32768
                             : dv.getFloat32(dataAt + i * ch * 4, true);
      return rms(out);
    };

    const rows = [];
    for(const [name, from, fn] of spots){
      const r = { name, fn, at: from, groups: {}, chairs: {} };
      for(const g of Object.keys(GROUP))
        r.groups[g] = dB(await render(song.perf.events.filter(e => GROUP[g].includes(e.role)), from, WIN));
      /* and every pitched chair on its own, so a silent player is visible */
      for(const role of GROUP.band){
        const evs = song.perf.events.filter(e => e.role === role);
        if(evs.length) r.chairs[role] = dB(await render(evs, from, WIN));
      }
      rows.push(r);
    }
    return { rows, genre: song.chart.genre, tempo: song.chart.tempo, bars: song.form.nBars };
  }, [SEED, WIN, GROUP]);

  await b.close();

  let faults = 0;
  console.log("\n=== THE MIX — " + out.genre + " seed " + SEED +
              ", three " + WIN + "-second windows\n");
  const mm = t => Math.floor(t / 60) + ":" + String(Math.round(t % 60)).padStart(2, "0");
  const f = v => (v === null || !isFinite(v)) ? "  silent" : (v >= 0 ? "+" : "") + v.toFixed(1);

  for(const r of out.rows){
    const band = r.groups.band;
    console.log("  " + r.name.toUpperCase() + "   " + mm(r.at) + "   (" + r.fn + ")");
    for(const g of ["train", "story", "world"]){
      const rel = r.groups[g] - band;
      const want = TARGET[g], off = isFinite(rel) ? rel - want : -Infinity;
      const bad = !isFinite(rel) || Math.abs(off) > 6;
      if(bad) faults++;
      console.log("     " + (bad ? "✗" : "✓") + " " + g.padEnd(10) +
        f(rel).padStart(8) + " dB against the band   (want " + want +
        (isFinite(off) ? ", off by " + (off >= 0 ? "+" : "") + off.toFixed(1) : ", ABSENT") + ")");
    }
    const ch = Object.keys(r.chairs).sort((a, z) => r.chairs[z] - r.chairs[a]);
    console.log("     chairs   " + ch.map(k => k + " " + f(r.chairs[k] - band)).join("   "));
    const gone = ch.filter(k => !isFinite(r.chairs[k]) || r.chairs[k] - band < -40);
    if(gone.length){ faults++; console.log("     ✗ inaudible: " + gone.join(" ")); }
    console.log("");
  }
  if(errs.length) console.log("  page errors: " + errs.slice(0, 3).join(" | "));
  console.log("  " + faults + " mix fault(s)\n");
  process.exit(faults ? 1 : 0);
})();
