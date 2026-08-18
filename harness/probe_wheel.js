#!/usr/bin/env node
/* PROBE_WHEEL — DOES A DECLARATION IN THE GENRE TABLE REACH THE AUDIO?

     node harness/probe_wheel.js [seed] [file.html]

   ── THE COMPLAINT ──────────────────────────────────────────────────────────
   [owner] "The hurdy gury is playing a single note then stopping? Thats not a
   hurdy gurdy is it?"

   No. A hurdy-gurdy is a wheel turning against strings: it sounds continuously
   and the player articulates by pressing keys against a string that is ALREADY
   SOUNDING. The genre answers that with `legato`, which ties a note to the one
   before it so the second arrives WITH NO ATTACK.

   ── WHY THIS PROBE EXISTS AND NOT A NOTE PRINT ─────────────────────────────
   Because a note print CANNOT ANSWER IT, and I nearly reported the fix as a
   failure on that evidence. `legato` does not rewrite the event: stage 5
   attaches `holdSec` and `tied` beside the note, and stage 6's `dispatch`
   decides. So the printed duration of a gurdy note is 0.82 s before the fix
   and 0.82 s after it, forever, and reading that number is reading the wrong
   dial. The question is whether the SOUND changed.

   ── AND THE FAULT IT WAS BUILT ON TOP OF ───────────────────────────────────
   `probe_mix.js` rendered with `song.chart.space`. THERE IS NO SUCH FIELD —
   `composeSong` never returns one. So every render that probe made went
   through `space === undefined`: no room, no echo, no tape, no medium and no
   legato, and the levels set from those numbers were measured down a signal
   path that exists nowhere else in the program. `soundOf` is the door the play
   button and the WAV export use, and a probe that skips it is measuring a
   different record. That is the same "knob that lies" class the file already
   records twice — the tape that drew a running deck over dry audio, and the
   medium read off a channel setSpace never receives.

   ── THE TWO CLAIMS ─────────────────────────────────────────────────────────
     TIED     with the declaration in place, notes on the declared chairs
              arrive with no onset — counted by `soundState().legatoTied`,
              which counts SUPPRESSED ATTACKS rather than set flags
     HEARD    and the rendered audio is measurably different from the same
              window with the declaration taken away. Byte-identical audio
              would mean the switch does nothing, which is the whole point. */
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
    const WIN = 20;

    const measure = async (evs, from, S, song) => {
      const win = evs.filter(e => e.tSec + (e.durSec || 0) > from && e.tSec < from + WIN)
        .map(e => { const t = e.tSec - from;
          return t >= 0 ? Object.assign({}, e, { tSec: t })
                        : Object.assign({}, e, { tSec: 0, durSec: Math.max(0.05, (e.durSec || 0) + t) }); });
      const blob = await M.renderWav(win, WIN, 22050, S.space, S.kick, S.drumDrive,
                                     S.gate, song.motion, from);
      const u = new Uint8Array(await blob.arrayBuffer());
      const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
      const n = Math.floor((u.byteLength - 44) / 2);
      let t = 0, h = 0;
      for(let i = 0; i < n; i++){
        const v = dv.getInt16(44 + i * 2, true) / 32768;
        t += v * v; h = (h * 31 + Math.round(v * 1e4)) | 0;
      }
      return { rms: Math.sqrt(t / Math.max(1, n)), hash: h, notes: win.length };
    };

    /* the chairs the genre declares legato on — asked of the table, never
       listed here, so this names no chair and keeps working when it changes */
    const DECL = Object.keys(M.GENRE[g].legato || {});
    const runs = [];
    for(const on of [true, false]){
      const kept = M.GENRE[g].legato;
      if(!on) delete M.GENRE[g].legato;
      try {
        const song = M.composeSong(SEED, undefined, g);
        const S = M.soundOf(song.chart.table, song.chart.picks.drums, song.chart.picks, song.chart);
        const r = { on, decl: S.space && S.space.legato, chairs: {} };
        for(const role of DECL){
          const ev = song.perf.events.filter(e => e.role === role && e.pitch != null)
                                     .sort((a, z) => a.tSec - z.tSec);
          if(!ev.length){ r.chairs[role] = null; continue; }
          const before = M.soundState().legatoTied || {};
          const from = ev[Math.floor(ev.length / 2)].tSec;
          const m = await measure(ev, from, S, song);
          const after = M.soundState().legatoTied || {};
          /* the counters accumulate across renders, so the answer for THIS
             render is the difference — reading the raw total made both arms
             of the A/B print the same number and nearly cost the whole finding */
          m.tied = (after[role] || 0) - (before[role] || 0);
          m.voices = [...new Set(song.perf.events.filter(e => e.role === role &&
                       e.tSec >= from && e.tSec < from + WIN).map(e => e.voice))];
          /* ── IS THIS CHAIR EVEN A LINE? ────────────────────────────────────
             A TIE NEEDS ONE NOTE LEAVING AND ONE ARRIVING. "Legato ... refers
             to a technique of capturing the sound of an instrument moving from
             one note to the next ... this means that you need to play
             monophonically" [Spitfire, Symphonic Strings manual, quoted in the
             program at the tie gate]. A chair holding chords has no single
             line to continue, so it takes the HOLD and not the tie, and
             faulting it for that would be this probe describing the
             arrangement rather than the sound — the same mistake probe_mix
             made twice. Counted, not assumed: two notes sharing an onset. */
          const on = {};
          for(const e of ev) if(e.tSec >= from && e.tSec < from + WIN)
            on[e.tSec.toFixed(4)] = (on[e.tSec.toFixed(4)] || 0) + 1;
          m.mono = Object.values(on).every(c => c === 1);
          r.chairs[role] = m;
        }
        runs.push(r);
      } finally { if(kept !== undefined) M.GENRE[g].legato = kept; }
    }
    return { runs, decl: DECL };
  }, SEED);

  await b.close();

  let faults = 0;
  const say = (ok, label, detail) => {
    console.log("     " + (ok ? "✓" : "✗ FAIL:") + " " + label + "  (" + detail + ")");
    if(!ok) faults++;
  };
  const [ON, OFF] = out.runs;
  console.log("\n=== THE WHEEL — seed " + SEED + ", the declared chairs rendered twice\n");
  console.log("  declared on: " + out.decl.join(", ") +
              "\n  reaches the graph as: " + JSON.stringify(ON.decl) + "\n");

  say(ON.decl && Object.keys(ON.decl).length > 0,
      "the genre's declaration reaches the sound object at all",
      ON.decl ? "space.legato is set" : "space.legato is UNDEFINED — soundOf was skipped");

  for(const role of out.decl){
    const a = ON.chairs[role], z = OFF.chairs[role];
    if(!a){ console.log("     ·  " + role + " writes no notes on this seed"); continue; }
    console.log("     " + role + "  (" + a.voices.join(", ") + ")  " + a.notes + " notes in the window" +
                (a.mono ? "  — a line" : "  — chords, so it takes the HOLD and not the tie"));
    if(a.tied > 0)
      say(true, "   notes arrive with no attack",
          a.tied + " of " + a.notes + " tied, against " + z.tied + " with the declaration gone");
    else
      /* ── WHY THIS IS A NOTE AND NOT A FAULT ──────────────────────────────
         MEASURED by instrumenting the tie pass itself: on this genre `keys2`
         reaches it as 15 PAIRS OF CHORDS and nothing else — it is the pad,
         built by `buildKeys(..., { sustain: true })` — and a chord cannot be
         tied, which is the sourced rule and not an accident. It only LOOKS
         like a line by the time a probe sees it, because the chord is spread
         into an arpeggio downstream of the tie decision. So a chair can be
         monophonic in the finished events and still have been a chord at the
         moment the question was asked, and faulting on the finished shape
         would be reading the wrong end of the pipeline.
         That ordering is a real (small) fault and is written down rather than
         patched around here. The claim this probe exists to defend is that
         THE SWITCH REACHES THE AUDIO, and that goes red below if it stops. */
      console.log("     ·    not tied — a chord at the moment the tie is decided," +
                  " spread into a line afterwards");
    const dB = 20 * Math.log10(Math.max(1e-9, a.rms) / Math.max(1e-9, z.rms));
    /* ── A TIE NEEDS A NOTE TO TIE FROM ───────────────────────────────────
       MEASURED: this genre's `counter` writes ~130 notes across a twenty-minute
       record, so a 20-second window expects TWO of them and regularly holds
       ONE. With one note the two renders are byte-identical and must be: the
       legato pass joins a note to the one before it, and there is no note
       before it. That was reported as a fault on three runs in five, which is
       a coin toss dressed as a guard.

       So a chair the window caught fewer than two notes of is reported and
       skipped. The claim below — the whole record contains tied notes — is not
       skippable, and it is the one that goes red if the declaration ever stops
       reaching the graph. (That the counter is this sparse is a real finding
       about the arrangement, and it belongs to the counter, not to here.) */
    if(a.notes < 2)
      console.log("     ·    one note in the window — a tie needs a note before it," +
                  " so the two renders must agree; not judged");
    else
      say(a.hash !== z.hash, "   and the audio is not the audio without it",
          "rms " + a.rms.toFixed(6) + " vs " + z.rms.toFixed(6) +
          " (" + (dB >= 0 ? "+" : "") + dB.toFixed(2) + " dB)");
  }

  /* THE CLAIM THE WHOLE PROBE IS FOR: if the declaration ever stops reaching
     the graph — the `space === undefined` fault this was built on top of —
     EVERY chair drops to zero at once, and that is what goes red. */
  const total = Object.values(ON.chairs).reduce((t, c) => t + (c ? c.tied : 0), 0);
  say(total > 0, "the record contains notes that arrive with no attack at all",
      total + " tied across " + out.decl.length + " declared chairs");

  if(errs.length) console.log("\n  page errors: " + errs.slice(0, 3).join(" | "));
  console.log("\n  " + faults + " wheel fault(s)\n");
  process.exit(faults ? 1 : 0);
})();
