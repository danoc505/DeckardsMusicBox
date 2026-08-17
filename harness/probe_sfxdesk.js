#!/usr/bin/env node
/* PROBE_SFXDESK — IS EVERY SOUND ON THE RECORD ACTUALLY ON THE MIXER?

     node harness/probe_sfxdesk.js [seed] [file.html]

   ── THE COMPLAINT ──────────────────────────────────────────────────────────
   [owner] "the SFX is not connected on the mixer"

   ── WHY A PROBE AND NOT A LOOK AT THE UI ───────────────────────────────────
   Because the strips ARE there. `MIX_ORDER` names `engine`, `pass`, `station`,
   `scene` and `weather`, `MIX_LABEL` gives each a face — "the engine", "going
   by", "the station", "the world", "weather" — and `drawMixer` draws one strip
   per role the record contains. Reading the source says it is connected.

   THE SOURCE SAYING SO IS EXACTLY WHAT IS NOT EVIDENCE. This file records the
   same shape three times over: the tape drew a running deck over dry audio; the
   medium was read off a channel `setSpace` never receives; `probe_mix` rendered
   through `space === undefined` for its whole life. In every one of them the
   picture and the sound disagreed and the picture was the thing being read.

   And the guard that should have caught this class is itself an example of it.
   `probe_faders_down.js` composes `synthwave` — A GENRE THAT WAS DELETED FROM
   THIS FILE — so it falls back to a table that is also gone, renders nothing,
   and reports that the fader row takes the kit down 153.8 dB "silent". It is
   green because it is measuring an empty record. A guard nobody has watched
   fail proves nothing.

   ── THE CLAIM, AND IT IS THE ONLY ONE THAT MATTERS ─────────────────────────
   For every role the record actually contains: render that role alone, then
   render it again WITH ITS OWN FADER PULLED DOWN, through `MK2.setMixer` —
   the one writer, the same door the desk's own hand uses.

     CUT       the part goes away when its own fader goes down (>= 40 dB)
     ITS OWN   and pulling one fader does not move a different part

   The second is not decoration: two parts sharing one channel is a fault this
   project has already shipped twice — the break that never obeyed the drums
   fader, and the birds that rode the tape strip so turning the crackle down
   turned the countryside down with it. A strip that cuts something is not the
   same as a strip that cuts ITS OWN something. */
const path = require("path");
const { chromium } = require("playwright");

const SEED = parseInt(process.argv[2], 10) || 1;
const HTML = path.resolve(process.argv[3] || path.join(__dirname, "..", "Boxcar Synth.html"));
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium";

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", e => errs.push(String(e.message)));
  await pg.goto("file://" + HTML, { waitUntil: "load", timeout: 60000 });
  await pg.waitForFunction(() => window.MK2, { timeout: 30000 });

  const out = await pg.evaluate(async (SEED) => {
    const M = window.MK2, g = M.genres()[0];
    const song = M.composeSong(SEED, undefined, g);
    const S = M.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);

    /* NAMES NO ROLE. Whatever the record contains is what gets tested, so a
       role added to a genre is covered the day it is added and a role removed
       stops being asked about. [Law 4 — DERIVE, NEVER LIST] */
    const roles = [...new Set(song.perf.events.map(e => e.role))].filter(r => r && r !== "tape");

    /* a window per role, at the busiest twenty seconds THAT ROLE has, so a
       part that only sounds at a station is measured at the station */
    const windowFor = role => {
      const ev = song.perf.events.filter(e => e.role === role).sort((a, z) => a.tSec - z.tSec);
      if(!ev.length) return null;
      let best = ev[0].tSec, bestN = 0;
      for(const e of ev){
        const n = ev.filter(x => x.tSec >= e.tSec && x.tSec < e.tSec + 20).length;
        if(n > bestN){ bestN = n; best = e.tSec; }
      }
      return best;
    };

    const rms = async (evs, from, secs) => {
      const win = evs.filter(e => e.tSec + (e.durSec || 0) > from && e.tSec < from + secs)
        .map(e => { const t = e.tSec - from;
          return t >= 0 ? Object.assign({}, e, { tSec: t })
                        : Object.assign({}, e, { tSec: 0, durSec: Math.max(0.05, (e.durSec || 0) + t) }); });
      if(!win.length) return 0;
      const blob = await M.renderWav(win, secs, 22050, S.space, S.kick, S.drumDrive,
                                     S.gate, song.motion, from);
      const u = new Uint8Array(await blob.arrayBuffer());
      const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
      const n = Math.floor((u.byteLength - 44) / 2);
      let t = 0;
      for(let i = 0; i < n; i++){ const v = dv.getInt16(44 + i * 2, true) / 32768; t += v * v; }
      return Math.sqrt(t / Math.max(1, n));
    };

    const SECS = 12;
    const rows = [];
    for(const role of roles){
      const from = windowFor(role);
      if(from == null) continue;
      const mine = song.perf.events.filter(e => e.role === role);
      /* a NEIGHBOUR to prove the cut is not global — the role with the most
         events in the same window that is not this one */
      const others = roles.filter(r => r !== role)
        .map(r => [r, song.perf.events.filter(e => e.role === r &&
                     e.tSec + (e.durSec || 0) > from && e.tSec < from + SECS).length])
        .filter(x => x[1] > 0).sort((a, z) => z[1] - a[1]);
      const nb = others.length ? others[0][0] : null;

      M.setMixer({});
      const base = await rms(mine, from, SECS);
      const nbBase = nb ? await rms(song.perf.events.filter(e => e.role === nb), from, SECS) : 0;

      /* ── PULLING A PART DOWN MEANS PULLING ITS STRIPS DOWN, PLURAL ────────
         A part played by more than one instrument gets a strip EACH — that is
         the desk's own design, from "why do they share the same channels the
         same color same fader" — and the channel key is `role|voice`. So the
         first version of this muted `bass` on a record whose bass runs through
         `bass|washtub`, measured no change, and called a working fader broken.
         It was the probe holding a stale idea of where the audio goes, which
         is the same mistake as reading the source instead of the sound.
         Mute the role AND every instrument that plays it. */
      const cutT = { [role]: { mute: true } };
      for(const v of new Set(mine.map(e => e.voice))) if(v) cutT[role + "|" + v] = { mute: true };
      M.setMixer(cutT);
      const cut = await rms(mine, from, SECS);
      const nbCut = nb ? await rms(song.perf.events.filter(e => e.role === nb), from, SECS) : 0;
      M.setMixer({});

      const dB = (a, b) => (a <= 1e-9 || b <= 1e-9) ? (a <= 1e-9 ? -99 : 99)
                         : 20 * Math.log10(a / b);
      rows.push({ role, from, n: mine.length,
                  drop: base <= 1e-9 ? null : dB(cut, base),
                  nb, nbDrop: (nb && nbBase > 1e-9) ? dB(nbCut, nbBase) : null,
                  silent: base <= 1e-9 });
    }
    return { rows, genre: song.chart.genre };
  }, SEED);

  await b.close();

  let faults = 0;
  console.log("\n=== EVERY SOUND ON A FADER — " + out.genre + " seed " + SEED + "\n");
  const mm = t => Math.floor(t / 60) + ":" + String(Math.round(t % 60)).padStart(2, "0");
  console.log("  role        events   window     its fader down    a neighbour");
  for(const r of out.rows){
    if(r.silent){
      faults++;
      console.log("  " + r.role.padEnd(11) + String(r.n).padStart(6) +
                  "   " + mm(r.from).padStart(6) + "     ✗ RENDERS NOTHING AT ALL");
      continue;
    }
    const cut = r.drop != null && r.drop <= -40;
    const clean = r.nbDrop == null || Math.abs(r.nbDrop) < 1.0;
    if(!cut || !clean) faults++;
    console.log("  " + r.role.padEnd(11) + String(r.n).padStart(6) +
      "   " + mm(r.from).padStart(6) + "     " + (cut ? "✓" : "✗") + " " +
      (r.drop <= -90 ? "silent" : r.drop.toFixed(1) + " dB").padEnd(12) +
      (r.nb ? (clean ? "✓ " : "✗ ") + r.nb + " " +
              (r.nbDrop == null ? "—" : (r.nbDrop >= 0 ? "+" : "") + r.nbDrop.toFixed(2) + " dB")
            : "— nothing else here"));
  }
  if(errs.length) console.log("\n  page errors: " + errs.slice(0, 3).join(" | "));
  console.log("\n  " + faults + " desk fault(s)\n");
  process.exit(faults ? 1 : 0);
})();
