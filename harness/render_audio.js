#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   THE RENDERED-AUDIO BATTERY, half one: make the audio.
   Half two is harness/test_audio.py, which asserts on the samples.

       node   harness/render_audio.js [outdir] [seeds]     # default seeds 1,2
       python3 harness/test_audio.py  [outdir]

   WHY IT EXISTS.  mk2_test.js guards the composition contract at the NOTE seam.
   Every worst bug in this project's history lived downstream of the notes, where
   a note-level test is blind: a master lowpass that ran 39% of every song, hats
   highpassed into inaudibility, a kick carrying a second kick, an export that
   carried double the live reverb.  The render is the only truth, so this battery
   renders and measures samples.

   WHY EXCERPTS AND NOT SONGS.  An OfflineAudioContext pays for every node it
   holds on every render quantum, and renderWav() creates the whole song's nodes
   up front, so cost is super-linear in length.  Measured here:

       128 s song  -> 227 s wall   (1.8x SLOWER than realtime)
       13.5 s cut  ->   1.8 s wall (7.5x FASTER than realtime)

   So the battery renders ~34 short pieces instead of two long ones and finishes
   in ~30 s: fast enough to run on every merge, which is the only way an output
   battery ever actually protects anything.

   NOTHING HERE IS A SECOND CODE PATH.  Every render is MK2.renderWav(events,...)
   -> buildGraph -> perform -> dispatch: the same call the "render .wav" button
   makes.  A soloed voice is just an event list containing one voice; no stem bus,
   no test-only API, nothing in the shipped file to keep in sync.

   WHAT GETS RENDERED
     ref_a / ref_b     the M0 reference bar, twice.  The canary, and one half of
                       the determinism pair.
     solo_<voice>      every voice reachable through dispatch(), alone.
     mix_s<seed>_NN    two bars from the middle of every section of a real song.
     dup_s<seed>_NN    one mix excerpt rendered again: determinism with the tape
                       bed, the seeded IR and the shared noise bank all in play.
     xit_s<seed>_NN    the fill bar and the bar it lands on.

   HONEST CAVEAT.  An excerpt is not sample-identical to the same bars inside a
   full render: burst() picks its noise slice from hash32("off:"+t) and excerpting
   shifts t, so the kit draws a different (still deterministic) slice of the noise
   bank.  Same synthesis, different noise draw.  That is why the determinism check
   compares two renders of the SAME excerpt.
   ═══════════════════════════════════════════════════════════════════════════ */
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const ROOT = process.env.MK2_ROOT || path.resolve(__dirname, '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));
const HTML = process.env.MK2_HTML || path.join(ROOT, 'Deckards Orchestrator MK2.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = process.argv[2] || path.join(ROOT, 'harness', 'audio_renders');
/* ONE SONG PER GENRE, plus the rig alternated across them. Rendering only lofi
   meant genre 2 and 3 had no audio coverage at all -- the seam battery proves
   their NOTES are lawful, which is a different claim from "they make sound".
   A genre whose new voice throws, or whose register lands a part inaudibly under
   the kick, fails here and nowhere else. */
const SONGS = (process.argv[3] || '1:lofi:band,2:synthwave:neon,3:vgm:sega')
  .split(',').map(spec => {
    const [seed, genre, rig] = spec.split(':');
    return { seed: Number(seed), genre, rig };
  });
/* the rig is pinned per seed so the mix excerpts exercise BOTH bands: the notes
   are identical either way (mk2_test proves it), so any difference the audio
   battery sees between them is a SOUND difference, which is the only kind this
   battery is for. */

const SR = 44100;                       // the rate the export button ships at
const TAIL = 1.7;                       // release + the 1.4 s reverb IR

/* ── THE PALETTE PROBES.  One entry per voice reachable through dispatch(), so a
   voice deleted from V, or renamed, or quietly re-pointed at another voice, fails
   here instead of in someone's a verdict on it.

   The gains are the gains STAGE 5 actually emits (kit 0.9-1.0 after DRUM_ACCENT,
   keys ~0.8, tape straight off chart.tape.crackle 0.006-0.014) and the pitches are
   the registers each voice actually plays, so the probe measures the voice as
   shipped.  `wow` stays ON for the keys probes for the same reason.

   Percussive voices get 4 hits 0.75 s apart -- far enough apart to count onsets,
   which is how "a kick carrying a second kick" gets caught.  Pitched voices get 2
   long notes 1.8 s apart, so the first note owns a clean 1.7 s window: a single
   note has no repetition rate to confuse the tremolo measurement that tells a
   wurly from a rhodes. ── */
const PROBES = [
  { name: 'kick',        voice: 'kick',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'snare',       voice: 'snare',   role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  /* the same two voices at a quarter gain. The master chain's tanh soft clipper
     compresses a LOUD voice, so a doubled drum layer arrives only +3.7 dB instead of
     +6 dB and hides inside any sane level window. Down here the chain is near-linear
     and the same fault reads +5.7 dB. These two probes are what make the level
     baseline able to see a stacked voice at all. */
  { name: 'kick_soft',   voice: 'kick',    role: 'drums',   gain: 0.25, durSec: 0.18, n: 4, spacing: 0.75 },
  /* THE KICK IS A GENRE INSTRUMENT NOW -- six parameters and a bus drive per
     genre -- so one probe of it tests one genre's drum and calls it the palette.
     One per genre, and they must NOT measure the same. */
  { name: 'kick_lofi',      voice: 'kick', role: 'drums', gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75, genre: 'lofi' },
  { name: 'kick_synthwave', voice: 'kick', role: 'drums', gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75, genre: 'synthwave' },
  { name: 'kick_vgm',       voice: 'kick', role: 'drums', gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75, genre: 'vgm' },
  { name: 'snare_soft',  voice: 'snare',   role: 'drums',   gain: 0.25, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'ghost',       voice: 'ghost',   role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  /* the full tom kit, and the GATE. synthwave is the genre that opens the gate, so
     the gated probes render under its settings -- a tom probed on lofi's kit would
     measure the dry drum and call the gate tested. */
  { name: 'tom1',        voice: 'tom1',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'tom2',        voice: 'tom2',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'tom3',        voice: 'tom3',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'tom3_gated',  voice: 'tom3',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75, genre: 'synthwave' },
  { name: 'snare_gated', voice: 'snare',   role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75, genre: 'synthwave' },
  { name: 'hat',         voice: 'hat',     role: 'drums',   gain: 0.90, durSec: 0.12, n: 4, spacing: 0.75 },
  { name: 'openhat',     voice: 'openhat', role: 'drums',   gain: 0.90, durSec: 0.12, n: 4, spacing: 0.75 },
  { name: 'bass',        voice: 'bass',    role: 'bass',    gain: 0.90, durSec: 1.20, n: 2, spacing: 1.80, pitch: 45 },
  { name: 'keys_rhodes', voice: 'keys',    role: 'keys',    gain: 0.80, durSec: 1.20, n: 2, spacing: 1.80, pitch: 60,
    extra: { timbre: 'rhodes', wow: 0.0024 } },
  { name: 'keys_wurly',  voice: 'keys',    role: 'keys',    gain: 0.80, durSec: 1.20, n: 2, spacing: 1.80, pitch: 60,
    extra: { timbre: 'wurly',  wow: 0.0024 } },
  { name: 'lead',        voice: 'lead',    role: 'lead',    gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 72 },
  { name: 'counter',     voice: 'counter', role: 'counter', gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 72 },
  { name: 'cs80',        voice: 'cs80',    role: 'lead',    gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 64 },
  /* the RIBBON, probed so it cannot rot while it waits for its genre. No genre
     ships a ribbon yet (Blade Runner is not built), so without this the glide
     path would be unreachable code that nothing exercises. Verified separately:
     a note told to slide a semitone octave into midi 64 reads 229.7 Hz partway
     through the glide and 331.6 Hz after it, against a 329.6 Hz target. */
  { name: 'cs80_ribbon', voice: 'cs80',    role: 'lead',    gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 64,
    extra: { glide: { from: -12, sec: 0.45 } } },
  { name: 'tape',        voice: 'tape',    role: 'tape',    gain: 0.010, durSec: 3.00, n: 1, spacing: 0 },
  /* THE SEGA RIG. Every voice a rig can name has to be probed, or "the rig table
     points at a voice that does not exist / points at the wrong one" is a fault
     only the user's a verdict on it would find. The chip voices sit on the same buses at the
     same LEVEL entries as the band voices they stand in for, so the level
     baseline compares them directly. */
  { name: 'chipBass',    voice: 'chipBass',    role: 'bass',    gain: 0.90, durSec: 1.20, n: 2, spacing: 1.80, pitch: 45 },
  { name: 'chipKeys',    voice: 'chipKeys',    role: 'keys',    gain: 0.80, durSec: 1.20, n: 2, spacing: 1.80, pitch: 60 },
  { name: 'chipLead',    voice: 'chipLead',    role: 'lead',    gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 72 },
  { name: 'chipCounter', voice: 'chipCounter', role: 'counter', gain: 0.85, durSec: 1.20, n: 2, spacing: 1.80, pitch: 72 },
  { name: 'dacKick',     voice: 'dacKick',     role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'dacSnare',    voice: 'dacSnare',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'dacGhost',    voice: 'dacGhost',    role: 'drums',   gain: 0.95, durSec: 0.18, n: 4, spacing: 0.75 },
  { name: 'psgHat',      voice: 'psgHat',      role: 'drums',   gain: 0.90, durSec: 0.12, n: 4, spacing: 0.75 },
  { name: 'psgOpenhat',  voice: 'psgOpenhat',  role: 'drums',   gain: 0.90, durSec: 0.12, n: 4, spacing: 0.75 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const wall0 = Date.now();
  const browser = await chromium.launch({ executablePath: CHROME,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-gpu'] });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 30000 });

  await page.evaluate(() => {
    /* the genre's own sound settings go through, or the battery is not measuring
       what ships: the drum bus drive and the kick's six parameters are per-genre
       now, and a probe rendered with defaults would test a kit no song plays. */
    /* AND ITS MOTION, at the excerpt's own position in the song. The knobs move
       now -- p-locks, section moves, LFO sweeps, gestures -- and a battery that
       rendered without them would measure a sound no song makes, which is the
       same defect the comment above is about, one layer up. An excerpt has been
       re-based to tSec 0, so it also carries the song second it was cut from and
       renderWav shifts the automation back by it. An excerpt from the last
       chorus is then rendered with the last chorus's filter, not the intro's. */
    window.__render = async (ev, secs, sr, genre, motion, offset) => {
      const S = MK2.soundOf(genre || "lofi");
      /* dispatch() throws on an unknown voice -- fail loud, never substitute. Catch
         it here so ONE missing voice is reported as one failed check instead of
         taking the whole battery down. */
      try {
        const blob = await MK2.renderWav(ev, secs, sr, S.space, S.kick, S.drumDrive, S.gate,
                                         motion || null, offset || 0);
        const ab = await blob.arrayBuffer(); let s = ''; const u = new Uint8Array(ab);
        for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return { b64: btoa(s) };
      } catch (e) { return { err: String(e && e.message || e) }; }
    };
    window.__excerpt = (song, bar0, bar1, tail) => {
      const spb = (60 / song.chart.tempo) / 4, t0 = bar0 * 16 * spb, t1 = bar1 * 16 * spb;
      const ev = [];
      for (const e of song.perf.events) {
        /* the tape bed is ONE event spanning the whole song; re-base it so the
           excerpt carries the same patina a full render does */
        if (e.voice === 'tape') { ev.push(Object.assign({}, e, { tSec: 0, durSec: (t1 - t0) + tail })); continue; }
        if (e.tSec >= t0 - 0.06 && e.tSec < t1) ev.push(Object.assign({}, e, { tSec: Math.max(0, e.tSec - t0) }));
      }
      /* the plan and the song second this excerpt starts at, so the automation
         can be evaluated where the excerpt actually LIVES */
      return { events: ev, seconds: (t1 - t0) + tail, motion: song.motion, offset: t0 };
    };
  });

  const manifest = { sr: SR, songs: SONGS, tail: TAIL, items: [], pageErrors };
  async function render(file, events, seconds, meta) {
    const t = Date.now();
    /* the plan and the offset drive the render; they do not belong in the
       manifest, where a whole motion plan per item would dwarf the measurements */
    const { motion, offset } = meta;
    delete meta.motion; delete meta.offset;
    meta.automated = !!motion;
    const r = await page.evaluate(([ev, secs, sr, gen, mo, off]) => window.__render(ev, secs, sr, gen, mo, off),
                                  [events, seconds, SR, meta.genre, motion || null, offset || 0]);
    if (r.err) {
      manifest.items.push(Object.assign({ file, seconds, error: r.err }, meta));
      console.log(`  ${file.padEnd(30)} RENDER FAILED: ${r.err}`);
      return;
    }
    const buf = Buffer.from(r.b64, 'base64');
    fs.writeFileSync(path.join(OUT, file), buf);
    manifest.items.push(Object.assign({ file, seconds,
      sha256: crypto.createHash('sha256').update(buf).digest('hex'), renderMs: Date.now() - t }, meta));
    console.log(`  ${file.padEnd(30)} ${seconds.toFixed(2)}s audio ${String(Date.now() - t).padStart(5)}ms`);
  }

  /* ── 1. the M0 reference bar, twice ───────────────────────────────────────── */
  const refSecs = (2 * 16) * ((60 / 84) / 4) + 1.5;
  const refEvents = await page.evaluate(() => MK2.referenceEvents(84));
  await render('ref_a.wav', refEvents, refSecs, { kind: 'ref', name: 'reference_bar' });
  await render('ref_b.wav', refEvents, refSecs, { kind: 'dup', name: 'reference_bar', pairOf: 'ref_a.wav' });

  /* ── 2. every voice in the palette, soloed ────────────────────────────────── */
  for (const p of PROBES) {
    const events = [];
    for (let i = 0; i < p.n; i++)
      events.push(Object.assign({ tSec: 0.05 + i * p.spacing, durSec: p.durSec,
                                  voice: p.voice, role: p.role, gain: p.gain },
                                p.pitch != null ? { pitch: p.pitch } : {}, p.extra || {}));
    await render(`solo_${p.name}.wav`, events, 0.05 + (p.n - 1) * p.spacing + p.durSec + TAIL,
      { kind: 'solo', name: p.name, voice: p.voice, role: p.role, genre: p.genre || 'lofi',
        pitch: p.pitch == null ? null : p.pitch, gain: p.gain,
        percussive: p.n === 4, hits: p.n, onsetT: events.map(e => e.tSec) });
  }

  /* ── 3. the song, section by section ──────────────────────────────────────── */
  for (const spec of SONGS) {
    const seed = spec.seed;
    const song = await page.evaluate(a => {
      const s = MK2.composeSong(a.seed, a.rig, a.genre);
      const snd = MK2.soundOf(a.genre);
      /* WHICH MACHINES the conductor put in the slots. The assertions branch on
         the rig already ("measuring a Mega Drive above 6 kHz asks whether it is
         a Mega Drive"); the same is now true of the KIT, since an 808 bass drum
         is a pure sine and an acoustic kick is not. */
      return { seed: a.seed, rig: s.chart.rig, genre: s.chart.genre, wet: snd.space.wet,
               picks: s.chart.picks, drumMachine: s.chart.picks.drums,
               gated: !!snd.gate, drumDrive: snd.drumDrive, tempo: s.chart.tempo, mode: s.chart.mode, keysChar: s.chart.keysChar,
               groove: s.perf.groove.style, nBars: s.form.nBars, nEvents: s.perf.events.length,
               voices: [...new Set(s.perf.events.map(e => e.voice))],
               sections: s.sections.map(x => ({ fn: x.fn, startBar: x.startBar, endBar: x.endBar,
                 energy: x.energy, peak: x.peak, occurrence: x.occurrence, material: x.material,
                 stripHalf: x.stripHalf, fillInto: x.fillInto, emptyLastBar: x.emptyLastBar,
                 endingLastBar: x.endingLastBar, active: x.active })) };
    }, spec);
    manifest['song_' + seed] = song;
    console.log(`seed ${seed} [${song.genre}]: ${song.mode} ${song.tempo}bpm ${song.nBars} bars, ` +
                `${song.sections.length} sections, ${song.groove} groove, rig=${song.rig}`);

    let dupDone = false, xitDone = false;
    for (let i = 0; i < song.sections.length; i++) {
      const s = song.sections[i], L = s.endBar - s.startBar;
      /* Two bars from the MIDDLE of the section.  Past a stripHalf's stripped first
         half, and clear of a last bar carrying a fill / an emptied bar / the ending
         -- that bar is different material and would misreport the section's own
         dynamic level, which is the thing the arc check reads. */
      const special = s.fillInto || s.emptyLastBar || s.endingLastBar;
      const w1 = Math.min(s.endBar - (special ? 1 : 0), s.startBar + Math.floor(L / 2) + 2);
      const w0 = Math.max(s.startBar, w1 - 2);
      const r = await page.evaluate(([sd, a, b, tl]) =>
                  window.__excerpt(MK2.composeSong(sd.seed, sd.rig, sd.genre), a, b, tl),
                                    [spec, w0, w1, TAIL]);
      const tag = `mix_s${seed}_${String(i).padStart(2, '0')}_${s.fn}`;
      await render(`${tag}.wav`, r.events, r.seconds,
        { motion: r.motion, offset: r.offset,
          kind: 'mix', seed, genre: spec.genre, idx: i, fn: s.fn, occurrence: s.occurrence, energy: s.energy,
          peak: s.peak, material: s.material, stripHalf: s.stripHalf, active: s.active,
          hasDrums: s.active.includes('drums'), bars: [w0, w1], nEvents: r.events.length });

      if (!dupDone && s.active.length >= 4) {                     // the determinism pair
        await render(`dup_s${seed}_${String(i).padStart(2, '0')}.wav`, r.events, r.seconds,
          { motion: r.motion, offset: r.offset,
            kind: 'dup', seed, genre: spec.genre, name: tag, pairOf: `${tag}.wav` });
        dupDone = true;
      }
      if (!xitDone && s.fillInto && song.sections[i + 1]) {       // the fill and its landing
        const rx = await page.evaluate(([sd, a, b, tl]) =>
                    window.__excerpt(MK2.composeSong(sd.seed, sd.rig, sd.genre), a, b, tl),
                                       [spec, s.endBar - 1, s.endBar + 1, TAIL]);
        await render(`xit_s${seed}_${String(i).padStart(2, '0')}.wav`, rx.events, rx.seconds,
          { motion: rx.motion, offset: rx.offset,
            kind: 'transition', seed, genre: spec.genre, idx: i, fromFn: s.fn, toFn: song.sections[i + 1].fn,
            toPeak: song.sections[i + 1].peak, tempo: song.tempo, bars: [s.endBar - 1, s.endBar + 1] });
        xitDone = true;
      }
    }
  }

  manifest.wallSec = (Date.now() - wall0) / 1000;
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  if (pageErrors.length) console.log('PAGE ERRORS: ' + pageErrors.join(' | '));
  console.log(`\n${manifest.items.length} renders, ${manifest.wallSec.toFixed(1)}s wall -> ${OUT}`);
  await browser.close();
})();
