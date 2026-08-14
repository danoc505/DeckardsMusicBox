#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE BRASS — is it recorded, is it dealt, and does the citadel's label
   finally tell the truth?

       node harness/probe_brass.js

   Built for task #19 and the owner's instruction: "Brass. Make sure to do
   research about how to arrange brass. Make sure to look online for free
   brass open source that we can use." The rig label has said "citadel —
   brass in the second chair" since the rig was written, while the chair
   held a Minimoog-patch saw rank. This asks, in a real browser on the real
   shipped file:

     THE TABLES ARE REAL    BRASS_WT carries all seven measured members, each
                            with three dynamic layers, and every member's ff
                            is BRIGHTER than its pp — the cuivré fact, which
                            is the one thing a volume knob cannot fake.
     THE CHAIR IS TAKEN     a citadel dungeon synth record's counter lane is
                            voiced by the brass, through the same stage-5
                            door every voice is hired through.
     IT IS HEARD            the counter events render to actual signal.
     THE DEAL IS REAL       AUTO differs from a forced solo chair on the same
                            notes — the section is dealt by register, not one
                            table with a label.
     THE MUTE IS RECORDED   the mute dial changes the rendered audio, because
                            it swaps to the RECORDED muted spectra.
     THE RANK IS REAL       the players knob changes the rendered audio.
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
  const pg = await b.newPage({ viewport: { width: 980, height: 1400 } });
  const errs = [];
  pg.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  pg.on("console", m => { if(m.type() === "error") errs.push("CONSOLE: " + m.text()); });
  await pg.goto(FILE);
  await pg.waitForTimeout(900);

  /* ── THE TABLES ──────────────────────────────────────────────────────────── */
  const wt = await pg.evaluate(() => {
    const cent = h => { let n = 0, d = 0; h.forEach((a, i) => { n += a * (i + 1); d += a; }); return n / (d || 1); };
    const out = {};
    for(const m in BRASS_WT){
      const dyns = Object.keys(BRASS_WT[m]);
      const mc = dyn => { const T = BRASS_WT[m][dyn] || {};
        const cs = Object.values(T).map(e => cent(e.h));
        return cs.length ? cs.reduce((a, x) => a + x, 0) / cs.length : 0; };
      out[m] = { dyns, notes: Object.keys(BRASS_WT[m].mf || {}).length,
                 pp: mc("pp"), ff: mc("ff") };
    }
    return out;
  });
  const members = ["horn", "trumpet", "trombone", "tuba", "hornMute", "trumpetStraight", "trumpetHarmon"];
  check("BRASS_WT carries all seven measured members, three dynamics each",
        members.every(m => wt[m] && wt[m].dyns.length === 3 && wt[m].notes >= 6),
        members.map(m => `${m}:${wt[m] ? wt[m].notes : 0}`).join(" "));
  check("every member's ff is brighter than its pp — the recorded cuivré",
        members.every(m => wt[m] && wt[m].ff > wt[m].pp),
        members.map(m => `${m} ${wt[m].pp.toFixed(1)}->${wt[m].ff.toFixed(1)}`).join(" · "));

  /* ── THE CHAIR ──────────────────────────────────────────────────────────────
     A bastion record, through the same composeSong door stage 5 uses. The
     counter chair must be VOICED brass; measured while writing this: DS's
     counter lines sit MIDI 62-69, wholly inside the horn's chair, so the
     register-crossing deal is proved on the KEYS lane below (register 48-67,
     which crosses the trombone/horn boundary at 56) with the brass picked by
     hand -- the same door probe_sax uses for the sax. */
  await pg.selectOption("#genre", "dungeonsynth");
  await pg.waitForTimeout(900);
  const chair = await pg.evaluate(() => {
    const out = { records: 0, notes: 0, voices: new Set(), span: [999, -1] };
    for(let s = 1; s <= 12; s++){
      const song = MK2.composeSong(s, "bastion", "dungeonsynth");
      const cn = song.perf.events.filter(e => e.role === "counter" && e.pitch != null);
      if(!cn.length) continue;
      out.records++; out.notes += cn.length;
      cn.forEach(e => { out.voices.add(e.voice);
        out.span[0] = Math.min(out.span[0], e.pitch); out.span[1] = Math.max(out.span[1], e.pitch); });
    }
    return { records: out.records, notes: out.notes,
             voices: [...out.voices], span: out.span };
  });
  check("the bastion's second chair is voiced by the brass",
        chair.records >= 4 && chair.notes > 40 && chair.voices.includes("brass"),
        `${chair.notes} counter notes over ${chair.records}/12 records, MIDI ${chair.span[0]}..${chair.span[1]}, voices: ${chair.voices.join(",")}`);

  const pickInfo = await pg.evaluate(() => {
    for(let s = 1; s <= 24; s++){
      const song = MK2.composeSong(s, "bastion", "dungeonsynth", { keys: "brass" });
      const kn = song.perf.events.filter(e => e.role === "keys" && e.pitch != null && e.voice === "brass");
      const lo = kn.filter(e => e.pitch <= 56).length, hi = kn.filter(e => e.pitch > 56).length;
      if(lo >= 3 && hi >= 3){
        window.__brassSeed = s;
        return { seed: s, n: kn.length, lo, hi,
                 span: [Math.min(...kn.map(e => e.pitch)), Math.max(...kn.map(e => e.pitch))] };
      }
    }
    return null;
  });
  check("a brass keys line crosses the trombone/horn boundary for the deal check",
        !!pickInfo, pickInfo ? `seed ${pickInfo.seed}: ${pickInfo.n} notes, MIDI ${pickInfo.span[0]}..${pickInfo.span[1]}, ${pickInfo.lo} at/below 56, ${pickInfo.hi} above` : "none in 24 seeds");
  if(!pickInfo){ console.log(`\n  ${pass} passed, ${fail + 1} failed`); await b.close(); process.exit(1); }

  /* ── THE RENDERS: heard, dealt, muted, ranked ─────────────────────────────
     Same nine seconds of the same counter notes through the real offline
     path, A/B'd under TRIM exactly the way a hand would move the dial. */
  const R = await pg.evaluate(async () => {
    const S = soundNow();
    const song = MK2.composeSong(window.__brassSeed, "bastion", "dungeonsynth", { keys: "brass" });
    /* the record's keys may not enter for a while; render the first eight
       seconds OF THE PART, shifted to zero, not of the record */
    const kn = song.perf.events.filter(e => e.role === "keys" && e.voice === "brass" && e.pitch != null)
                    .sort((a, b) => a.tSec - b.tSec);
    const t0 = kn.length ? kn[0].tSec : 0;
    const evs = kn.filter(e => e.tSec < t0 + 8)
                  .map(e => Object.assign({}, e, { tSec: e.tSec - t0 }));
    const render = async () => {
      const blob = await Sound.renderWav(evs, 9, 22050, S.space, S.kick, S.drumDrive, S.gate, S.motion);
      return new Int16Array(await blob.arrayBuffer(), 44);
    };
    const energy = x => { let e = 0; for(let i = 0; i < x.length; i++) e += x[i] * x[i]; return e; };
    const diffDb = (A, B) => {
      let ea = 0, ed = 0; const n = Math.min(A.length, B.length);
      for(let i = 0; i < n; i++){ ea += A[i] * A[i]; ed += (A[i] - B[i]) * (A[i] - B[i]); }
      return 10 * Math.log10(ed / Math.max(1, ea));
    };
    const set = (k, v) => { TRIM["brass." + k] = v - (PARAMS["brass." + k] == null ? CONTROL["brass." + k].def : PARAMS["brass." + k]); };
    const clr = k => { delete TRIM["brass." + k]; };

    const base = await render();
    const sig = 10 * Math.log10(energy(base) / base.length / (32768 * 32768));

    set("member", 4); const soloTpt = await render(); clr("member");
    set("member", 1); const soloTuba = await render(); clr("member");
    set("mute", 1);   const muted = await render();    clr("mute");
    set("players", 0);   const dry = await render();
    set("players", 0.95); const wet = await render();  clr("players");

    return { sig,
             deal:  diffDb(base, soloTpt),
             deal2: diffDb(base, soloTuba),
             mute:  diffDb(base, muted),
             rank:  diffDb(dry, wet),
             n: evs.length };
  });
  check("the brass renders to actual signal",
        isFinite(R.sig) && R.sig > -60, `${R.n} keys events -> ${R.sig.toFixed(1)} dBFS`);
  check("AUTO deals by register — it differs from a forced solo trumpet chair",
        isFinite(R.deal) && R.deal > -35, `${R.deal.toFixed(1)} dB (byte-identical would be -Infinity)`);
  check("...and from a forced solo tuba chair",
        isFinite(R.deal2) && R.deal2 > -35, `${R.deal2.toFixed(1)} dB`);
  check("the MUTE dial reaches the rendered audio — the recorded muted spectra",
        isFinite(R.mute) && R.mute > -35, `${R.mute.toFixed(1)} dB`);
  check("the RANK (players) dial reaches the rendered audio",
        isFinite(R.rank) && R.rank > -45, `${R.rank.toFixed(1)} dB`);

  /* ── THE FACE: the machine is pickable by hand in the keys slot ──────────── */
  const face = await pg.evaluate(() => {
    const sel = document.querySelector("#m_keys");
    if(!sel) return null;
    const has = Array.from(sel.options).some(o => o.value === "brass");
    return { has };
  });
  check("the brass section is on the keys slot's menu for the hand",
        !!face && face.has, face ? "" : "no #m_keys select");

  check("no page errors while any of this ran", errs.length === 0, errs.slice(0, 3).join(" | "));

  console.log(`\n  ${pass} passed, ${fail} failed`);
  await b.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("PROBE CRASH:", e); process.exit(1); });
