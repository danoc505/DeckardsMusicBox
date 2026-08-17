#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE KICK'S WEIGHT, AND WHAT SITS ON TOP OF IT

       node harness/probe_kickpunch.js [genre ...]

   WHY THIS EXISTS. The user's report, 2026-08-04: "the snare used in Synthwave
   is horrible, it overrides the bass drum, and the bass drum has [no] oomph, it
   is barely there. It is even more obvious in the Acid House where the bass
   drum might be the most important instrument on the track."

   Two claims, and they are DIFFERENT claims, so this measures them separately:

     1. THE BALANCE -- is the snare louder than the kick, and by how much?
        Rendered one at a time, on their own real chains, at the genre's own
        panel settings. A ratio, not an impression.

     2. THE WEIGHT -- does the kick actually put energy where a kick's energy
        goes? Three numbers, each of which a "barely there" kick fails
        differently:
          SUB      share of energy under 100 Hz -- is there a bottom at all
          PUNCH    peak of the first 25 ms against the body that follows it,
                   which is where the sources put it: "the difference between
                   that initial attack and the lower, fundamental sustain is
                   where the punch lies" [corpus:LANDR, what-is-a-909]
          LENGTH   time to -30 dB -- a kick with no sustain reads as a click

   AND IT COMPARES THE VOICES TO EACH OTHER, not each to its own number. That
   is this repo's own oldest lesson (HANDOFF §0): three per-genre kick probes
   once passed while all three rendered the same audio, because each was
   compared to a baseline instead of to its siblings.
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GENRES = process.argv.slice(2).length ? process.argv.slice(2) : null;

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(async (want) => {
    const genres = want || MK2.genres();
    const SR = 48000;
    const rows = [];

    /* render ONE lane's hit, through the genre's real space/kick/drive/gate --
       the setup lesson from probe_controls: a voice measured off its own chain
       is a voice measured in a room it never plays in. The VOICE comes from the
       genre's own composed song rather than from a name written here, so this
       measures whatever kit that genre actually loads. */
    const hit = async (genre, lane, gain) => {
      const song = MK2.composeSong(1, undefined, genre);
      const src = song.perf.events.find(e => e.lane === lane && e.voice);
      if(!src) return null;
      /* ── LOAD THE GENRE'S PANEL FIRST, or every genre renders the same drum ──
         `PARAMS` is one global table and the voices read it. The app fills it
         from the genre through applyRack() the moment a song is composed; a
         probe that skips that step renders FACTORY DEFAULTS, so lofi (tune 45),
         synthwave (52) and acid (47) all come out as one sound. That is
         precisely the "three probes measuring one kick" defect HANDOFF §0
         records, and the first version of this file walked into it: three
         genres reported a byte-identical peak of 0.4969 while their tables
         plainly differ. Doing what the app does is what makes the numbers below
         numbers about the program. */
      const P = (song.chart.table && song.chart.table.params) || {};
      for(const m of Object.keys(MK2.INSTRUMENTS)) MK2.loadParams(m, P[m]);
      /* ── AND HAND IT THE MOTION PLAN, OR IT READS THE WRONG MACHINE ─────────
         `g.drumMachine` is taken from the PLAN -- `motion.drums` -- and falls
         back to "kit" when there is none. So a render with `motion: null` looks
         up every TR-1000 knob on the acoustic kit's panel instead: `punch`
         does not exist there, so the voice silently used its default and the
         control measured as doing nothing at 0, at 0.55 and at 1.0. It is wired
         correctly and LIVE playback is right; this probe was blind, for the
         fourth time and for the same reason each time -- it was not handing the
         program what the program hands itself. */
      const S = MK2.soundOf(genre, (song.motion && song.motion.drums) || undefined);
      const ev = Object.assign({}, src, { tSec: 0.02, gain });
      const blob = await MK2.renderWav([ev], 1.6, SR, S.space, S.kick, S.drumDrive, S.gate,
                                       song.motion || null, 0);
      const ab = await blob.arrayBuffer(), dv = new DataView(ab);
      const n = Math.floor((ab.byteLength - 44) / 4);          // 16-bit stereo
      const m = new Float32Array(n);
      for(let i = 0; i < n; i++){
        const l = dv.getInt16(44 + (i * 2) * 2, true) / 32768;
        const r = dv.getInt16(44 + (i * 2 + 1) * 2, true) / 32768;
        m[i] = (l + r) / 2;
      }
      return m;
    };

    const peak = a => { let p = 0; for(let i = 0; i < a.length; i++) p = Math.max(p, Math.abs(a[i])); return p; };
    const rms  = a => { let s = 0; for(let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s / a.length); };
    const slice = (a, t0, t1) => a.subarray(Math.floor(t0 * SR), Math.floor(t1 * SR));
    /* energy under a corner, by a plain one-pole run twice -- enough to answer
       "is there a bottom", and it is the same instrument on every row */
    const lowShare = a => {
      let lp = 0, lo = 0, tot = 0;
      const k = Math.exp(-2 * Math.PI * 100 / SR);
      for(let i = 0; i < a.length; i++){ lp = lp * k + a[i] * (1 - k); lo += lp * lp; tot += a[i] * a[i]; }
      return tot > 0 ? lo / tot : 0;
    };
    /* ── THE BAND A SMALL SPEAKER CAN ACTUALLY REPRODUCE ─────────────────────
       "SUB under 100 Hz" cannot answer "does this kick have oomph", and the
       first version of this probe proved it: adding a body layer an octave up
       moved the sub share by 0.5 of a point, because at tune 47 the octave is
       94 Hz -- still UNDER the corner. A metric that cannot see the thing you
       are changing will report every version of it as the same.
       So: the share between 100 and 250 Hz, which is where the sources put the
       weight ("content around 110-140 Hz" [corpus:unison]) and which is roughly
       the bottom of what a laptop or a phone puts in a room. */
    const bandShare = (a, lo, hi) => {
      const rc = f => Math.exp(-2 * Math.PI * f / SR);
      const kl = rc(hi), kh = rc(lo);
      let l = 0, h = 0, e = 0, tot = 0;
      for(let i = 0; i < a.length; i++){
        l = l * kl + a[i] * (1 - kl);        // lowpassed at hi
        h = h * kh + a[i] * (1 - kh);        // lowpassed at lo
        const bp = l - h;                    // the band between them
        e += bp * bp; tot += a[i] * a[i];
      }
      return tot > 0 ? e / tot : 0;
    };
    const decayTo = (a, db) => {                    // seconds from peak to -db
      const p = peak(a); if(p <= 0) return 0;
      const th = p * Math.pow(10, -db / 20);
      let i0 = 0; for(let i = 0; i < a.length; i++) if(Math.abs(a[i]) >= p * 0.999){ i0 = i; break; }
      for(let i = i0; i < a.length; i++) if(Math.abs(a[i]) < th){
        /* it has to STAY below, or one zero crossing ends the note */
        let ok = true;
        for(let j = i; j < Math.min(a.length, i + SR * 0.02); j++) if(Math.abs(a[j]) >= th){ ok = false; break; }
        if(ok) return (i - i0) / SR;
      }
      return a.length / SR;
    };

    for(const genre of genres){
      const k = await hit(genre, 'kick', 0.95);
      const s = await hit(genre, 'snare', 0.85);
      /* THE CLAP IS MEASURED ON EVERY GENRE THAT HAS ONE. The user named the
         snare in one genre and the kick in another as EXAMPLES of an engine
         they think is bad overall -- so the probe asks every genre, and the
         clap joins because they later named it as the worst of the three. */
      const cl = await hit(genre, 'clap', 0.85);
      if(cl){
        const on = a => { const p2 = Math.max(...Array.from(a, Math.abs)), th = p2 * 0.02;
                          for(let i = 0; i < a.length; i++) if(Math.abs(a[i]) > th) return i / SR; return 0; };
        const c0 = on(cl);
        rows.push({ clapOf: genre, peak: peak(cl), rms: rms(slice(cl, c0, c0 + 0.60)),
                    len: decayTo(cl, 30), mid: bandShare(slice(cl, c0, c0 + 0.60), 700, 1600) });
      }
      if(!k || !s){ rows.push({ genre, none: true }); continue; }
      const kp = peak(k), sp = peak(s);
      /* ── FIND THE ONSET, NEVER ASSUME IT ────────────────────────────────────
         renderWav carries a lead-in, so a note written at tSec 0.02 arrives at
         about 0.082. The first version of this file measured its "attack" over
         0.020-0.045 -- entirely inside that silence -- and reported the punch of
         every genre as -Infinity dB. Anchor the window to the thing you are
         measuring [HANDOFF §6], and the only honest anchor is where the sound
         actually starts. */
      const onset = a => { const p = peak(a), th = p * 0.02;
                           for(let i = 0; i < a.length; i++) if(Math.abs(a[i]) > th) return i / SR;
                           return 0; };
      const k0 = onset(k), s0 = onset(s);
      /* PUNCH: the attack against the body that follows it -- "the difference
         between that initial attack and the lower, fundamental sustain is where
         the punch lies" [corpus:LANDR what-is-a-909]. */
      const atk = peak(slice(k, k0, k0 + 0.025)), body = peak(slice(k, k0 + 0.04, k0 + 0.18));
      rows.push({ genre,
        kickPeak: kp, snarePeak: sp,
        ratio: sp > 0 && kp > 0 ? 20 * Math.log10(sp / kp) : 0,
        kickRms: rms(slice(k, k0, k0 + 0.60)), snareRms: rms(slice(s, s0, s0 + 0.60)),
        sub: lowShare(slice(k, k0, k0 + 0.60)),
        body: bandShare(slice(k, k0, k0 + 0.60), 100, 250),
        punch: (body > 0 && atk > 0) ? 20 * Math.log10(atk / body) : 0,
        len: decayTo(k, 30),
        snareLen: decayTo(s, 30),
      });
    }
    return rows;
  }, GENRES);

  const dB = v => (v >= 0 ? '+' : '') + v.toFixed(1);
  const claps = out.filter(r => r.clapOf);
  if(claps.length){
    console.log('\n=== THE HAND CLAP, on every genre that has one ===\n');
    console.log('  genre         peak     rms      to -30dB    700-1600Hz share');
    for(const r of claps)
      console.log(`  ${r.clapOf.padEnd(12)} ${r.peak.toFixed(3).padStart(6)} ${r.rms.toFixed(4).padStart(8)} ` +
                  `${(r.len * 1000).toFixed(0).padStart(9)} ms ${(100 * r.mid).toFixed(1).padStart(15)}%`);
  }
  console.log('\n=== THE KICK\'S WEIGHT, AND THE SNARE ON TOP OF IT ===\n');
  console.log('  genre         kick pk   snare pk   SNARE-KICK   kick rms   snare rms');
  for(const r of out){
    if(r.clapOf) continue;
    if(r.none){ console.log(`  ${r.genre.padEnd(12)}  — no kick or snare lane —`); continue; }
    console.log(`  ${r.genre.padEnd(12)} ${r.kickPeak.toFixed(3).padStart(7)} ${r.snarePeak.toFixed(3).padStart(10)} ` +
                `${(dB(r.ratio) + ' dB').padStart(12)} ${r.kickRms.toFixed(4).padStart(10)} ${r.snareRms.toFixed(4).padStart(11)}`); }
  console.log('\n  a POSITIVE snare-kick figure means the snare is louder than the kick.\n');
  console.log('  genre         SUB<100Hz   BODY 100-250Hz   PUNCH(atk vs body)   kick to -30dB   snare to -30dB');
  for(const r of out){
    if(r.none || r.clapOf) continue;
    console.log(`  ${r.genre.padEnd(12)} ${(100 * r.sub).toFixed(1).padStart(8)}% ${(100 * r.body).toFixed(1).padStart(13)}% ${(dB(r.punch) + ' dB').padStart(20)} ` +
                `${(r.len * 1000).toFixed(0).padStart(14)} ms ${(r.snareLen * 1000).toFixed(0).padStart(13)} ms`); }
  console.log('');
  if(errs.length) console.log('  page errors:', errs.slice(0, 3).join(' | '));
  await b.close();
})();
