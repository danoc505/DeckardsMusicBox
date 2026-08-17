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
    /* ── THE SOUND THE OWNER HEARS, NOT THE ONE THE CHART CARRIES ────────────
       THE FIRST VERSION OF THIS PROBE PASSED `song.chart.space`, AND THERE IS
       NO SUCH FIELD. `composeSong` returns a chart of seed, genre, root, mode,
       tempo, table, picks, tape, atmos, clock — and no `space`. So every render
       this probe made went through `space === undefined`: no room, no echo, no
       tape, no medium, and NO LEGATO. The levels I then set from those numbers
       were measured down a signal path that exists nowhere else in the program.

       `soundOf` is the one door that assembles a song's sound — the same call
       the play button and the WAV export make (and the same one probe_stems
       already makes). A probe that does not go through it is measuring a
       different record and reporting it with confidence, which is the exact
       shape of every fault this file's header lists.

       It takes the TABLE rather than the name, because a blended song has no
       name to look up and its sound is in the table like everything else. */
    const S = M.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);
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

    /* ══ AND HOW LOUD IT ACTUALLY IS, NOT HOW MUCH ENERGY IT CARRIES ═════════
       The header of this file called the unweighted reading "a real limit" and
       said lifting probe_stems' filter in was the next step. It is the step,
       and it is not cosmetic: THE TWO CHAIRS THIS PROBE SAYS ARE BURIED ARE
       THE BASS AND THE COUNTER, and a part in the bottom octave can carry the
       energy of a mix while being nearly inaudible — which is exactly how the
       old pad-bass measured fine and could not be heard. Setting a bass level
       off an unweighted number is the same class of error as setting it
       against a reference that has moved.

       IEC 61672, built from the standard's own pole/zero definition rather
       than pasted as coefficients, and CHECKED against the published curve
       before it is used on anything. Lifted from probe_stems.js, which
       records why it is built rather than quoted: a first attempt pasted
       sixth-order coefficients from memory, the filter diverged, and every
       reading came back -inf.

         H(s) = K s^4 / ((s+w1)^2 (s+w2) (s+w3) (s+w4)^2)
         f1 20.598997   f2 107.65265   f3 737.86223   f4 12194.217 Hz

       BUILT AT THIS PROBE'S OWN SAMPLE RATE, which is 22050 and not 44100 —
       three twenty-second windows times eleven renders is the compute budget
       the owner set ("rendering a 20 min song going to take to long"). The
       cost of that is real and is stated rather than hidden: plain bilinear
       drifts near Nyquist, and at 22050 Nyquist is 11 kHz, so the top octave
       is not trustworthy. The check below therefore BINDS below 4 kHz and
       merely reports above it. The question being asked is whether a 44 Hz
       string can be heard, and that is decided two decades lower down. */
    const AW = (SR => {
      const C2 = 2 * SR, sections = [], w = f => 2 * Math.PI * f;
      for(const f of [20.598997, 20.598997, 107.65265, 737.86223]){
        const o = w(f), d = C2 + o;
        sections.push({ b0: C2 / d, b1: -C2 / d, a1: (o - C2) / d });
      }
      for(const f of [12194.217, 12194.217]){
        const o = w(f), d = C2 + o;
        sections.push({ b0: o / d, b1: o / d, a1: (o - C2) / d });
      }
      const run = (s, k) => {
        const x1 = new Float64Array(sections.length), y1 = new Float64Array(sections.length);
        const out = new Float64Array(s.length);
        for(let i = 0; i < s.length; i++){
          let v = s[i];
          for(let j = 0; j < sections.length; j++){
            const S = sections[j];
            const y = S.b0 * v + S.b1 * x1[j] - S.a1 * y1[j];
            x1[j] = v; y1[j] = y; v = y;
          }
          out[i] = v * k;
        }
        return out;
      };
      /* the gain at a frequency, MEASURED by running a sine through it — so
         the 1 kHz normalisation is measured rather than asserted */
      const gainAt = (hz, k) => {
        const N = SR, sig = new Float64Array(N);
        for(let i = 0; i < N; i++) sig[i] = Math.sin(2 * Math.PI * hz * i / SR);
        const y = run(sig, k);
        let s = 0; for(let i = N >> 1; i < N; i++) s += y[i] * y[i];
        return Math.sqrt(s / (N - (N >> 1))) * Math.SQRT2;
      };
      const K = 1 / gainAt(1000, 1);
      /* IEC 61672 table 3. Binding below 4 kHz, reported above — see above. */
      const check = [[31.5, -39.4, 0.5, true], [125, -16.1, 0.4, true],
                     [1000, 0.0, 0.1, true], [4000, 1.0, 0.5, true],
                     [8000, -1.1, 1.0, false]]
        .map(([hz, want, tol, binds]) => {
          const got = 20 * Math.log10(gainAt(hz, K));
          return { hz, want, got, tol, binds, ok: Math.abs(got - want) <= tol };
        });
      return { weight: s => run(s, K), check };
    })(22050);

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
      if(!win.length) return ZERO;
      const buf = await M.renderWav(win, secs, 22050, S.space, S.kick,
                                    S.drumDrive, S.gate, song.motion, from);
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
      if(dataAt < 0) return ZERO;
      const n = Math.floor(dataLen / (bits / 8));
      const out = new Float32Array(Math.floor(n / ch));
      for(let i = 0; i < out.length; i++)
        out[i] = bits === 16 ? dv.getInt16(dataAt + i * ch * 2, true) / 32768
                             : dv.getFloat32(dataAt + i * ch * 4, true);
      return { rms: rms(out), arms: rms(AW.weight(out)) };
    };
    const ZERO = { rms: 0, arms: 0 };

    /* ── THE REFERENCE IS THE RECORD'S BAND, NOT THE WINDOW'S ───────────────
       The first version compared each group against the band IN THAT WINDOW,
       and at a station the band is one player — so the station's own sounds
       read +7.4 dB "too loud" when they had not moved at all. That is the
       probe describing the arrangement, not the mix, and it would have sent me
       trimming a level that was already right.

       A mix is judged against ONE reference: the band at full cruise, which is
       what §4d-ii's targets were measured against. A stop is quiet BECAUSE it
       is a stop, and the whole point of the ceremony is that the world is
       audible over a band that has stepped back. */
    const refBoth = await render(song.perf.events.filter(e => GROUP.band.includes(e.role)),
                                 spots[0][1], WIN);
    const REF = dB(refBoth.rms), REFA = dB(refBoth.arms);

    const rows = [];
    for(const [name, from, fn] of spots){
      const r = { name, fn, at: from, ref: REF, refA: REFA, groups: {}, groupsA: {}, chairs: {}, chairsA: {} };
      r.has = {};
      for(const g of Object.keys(GROUP)){
        const evs = song.perf.events.filter(e => GROUP[g].includes(e.role));
        /* WHETHER ANYTHING OF THIS KIND IS EVEN HERE. A station has no station
           sounds at cruise and that is the design, not a fault — the first
           version faulted it and made a correct record look broken in three
           places. Absence is only wrong when something WAS written here. */
        r.has[g] = evs.some(e => e.tSec + (e.durSec || 0) > from && e.tSec < from + WIN);
        const m = await render(evs, from, WIN);
        r.groups[g] = dB(m.rms); r.groupsA[g] = dB(m.arms);
      }
      /* and every pitched chair on its own, so a silent player is visible.
         `wrote` is the same distinction the groups get: A CHAIR THAT IS NOT
         PLAYING HERE IS NOT A BURIED CHAIR. At a solo the band is one player
         by design — the ceremony is the whole point of the stop — and the
         first version faulted six chairs for obeying the arrangement. Fault a
         chair only when it WROTE something into this window and you still
         cannot hear it, which is the only reading that means "buried". */
      for(const role of GROUP.band){
        const evs = song.perf.events.filter(e => e.role === role);
        if(!evs.length) continue;
        const m = await render(evs, from, WIN);
        r.chairs[role] = dB(m.rms); r.chairsA[role] = dB(m.arms);
        r.wrote = r.wrote || {};
        r.wrote[role] = evs.some(e => e.tSec + (e.durSec || 0) > from && e.tSec < from + WIN);
      }
      rows.push(r);
    }
    return { rows, aw: AW.check, genre: song.chart.genre,
             tempo: song.chart.tempo, bars: song.form.nBars };
  }, [SEED, WIN, GROUP]);

  await b.close();

  let faults = 0;
  console.log("\n=== THE MIX — " + out.genre + " seed " + SEED +
              ", three " + WIN + "-second windows\n");
  const mm = t => Math.floor(t / 60) + ":" + String(Math.round(t % 60)).padStart(2, "0");
  const f = v => (v === null || !isFinite(v)) ? "  silent" : (v >= 0 ? "+" : "") + v.toFixed(1);

  /* ── THE INSTRUMENT CHECKS ITSELF BEFORE IT MEASURES ANYTHING ─────────────
     If the A curve is not the A curve, every number under it is meaningless
     and this says so rather than printing them. */
  const awBad = out.aw.filter(c => c.binds && !c.ok);
  console.log("  A-weighting (IEC 61672 table 3, built at 22050): " +
    out.aw.map(c => c.hz + "Hz " + c.got.toFixed(1) + "/" + c.want.toFixed(1) +
                    (c.ok ? "" : c.binds ? " ✗" : " ~")).join("   "));
  if(awBad.length){ faults++; console.log("     ✗ THE FILTER IS NOT THE CURVE — A-weighted readings below are void"); }
  console.log("");

  for(const r of out.rows){
    const band = r.ref, bandA = r.refA;   // the band AT CRUISE, one reference for the record
    console.log("  " + r.name.toUpperCase() + "   " + mm(r.at) + "   (" + r.fn + ")" +
      "   band here " + f(r.groups.band - band) + " dB   (A " + f(r.groupsA.band - bandA) + ")");
    for(const g of ["train", "story", "world"]){
      /* ── JUDGED ON THE A-WEIGHTED READING, AND THAT IS THE CHANGE ─────────
         "how loud it IS, not how much energy it carries". The unweighted
         number is printed beside it because the two disagreeing IS the
         finding: a part with a big unweighted reading and a small A-weighted
         one is eating headroom without being heard, which is precisely how
         the old pad-bass measured fine and could not be heard. */
      const rel = r.groupsA[g] - bandA, relU = r.groups[g] - band;
      const want = TARGET[g], off = isFinite(rel) ? rel - want : -Infinity;
      const bad = r.has[g] ? (!isFinite(rel) || Math.abs(off) > 6) : false;
      if(bad) faults++;
      if(!r.has[g]){ console.log("     ·  " + g.padEnd(10) + "   nothing of this kind here"); continue; }
      console.log("     " + (bad ? "✗" : "✓") + " " + g.padEnd(10) +
        f(rel).padStart(8) + " dB(A) against the band   (want " + want +
        (isFinite(off) ? ", off by " + (off >= 0 ? "+" : "") + off.toFixed(1) : ", ABSENT") + ")" +
        "   [unweighted " + f(relU) + "]");
    }
    const ch = Object.keys(r.chairs).sort((a, z) => r.chairsA[z] - r.chairsA[a]);
    const wrote = r.wrote || {};
    console.log("     chairs   " + ch.map(k => k + " " +
      (wrote[k] ? f(r.chairsA[k] - bandA) : "—")).join("   "));
    const gone = ch.filter(k => wrote[k] && (!isFinite(r.chairsA[k]) || r.chairsA[k] - bandA < -40));
    if(gone.length){ faults++; console.log("     ✗ wrote notes here and cannot be heard: " + gone.join(" ")); }
    const quiet = ch.filter(k => wrote[k] && isFinite(r.chairsA[k]) &&
                                 r.chairsA[k] - bandA < -24 && r.chairsA[k] - bandA >= -40);
    if(quiet.length) console.log("     ·  buried (under -24 dB(A)): " + quiet.join(" "));
    /* AND WHERE THE TWO READINGS DISAGREE BY A LOT, say so by name — that gap
       is the whole reason the filter is here */
    const liar = ch.filter(k => wrote[k] && isFinite(r.chairsA[k]) && isFinite(r.chairs[k]) &&
                                (r.chairs[k] - band) - (r.chairsA[k] - bandA) > 8);
    if(liar.length) console.log("     ·  carries more energy than it is heard as: " +
      liar.map(k => k + " " + f(r.chairs[k] - band) + " vs " + f(r.chairsA[k] - bandA) + " dB(A)").join("   "));
    console.log("");
  }
  if(errs.length) console.log("  page errors: " + errs.slice(0, 3).join(" | "));
  console.log("  " + faults + " mix fault(s)\n");
  process.exit(faults ? 1 : 0);
})();
