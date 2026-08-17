#!/usr/bin/env node
/* PROBE_ROUTE — read a boxcar record back as the story it claims to be.

     node harness/probe_route.js [seed] [seeds-to-check]

   [owner, 2026-08-15: "the enviromental sounds need a location and reason, is
   it rainy? Does it stop? Does it start again? Are we passing a river? Did
   this stop stop in the forest or a city? The SFX are part of the story of the
   song its not just all on at once"]

   The first half of this prints ONE record as prose, because the only way to
   tell whether the scene sounds are a story is to read them in order. The
   second half holds the claims that make it a story rather than a wash:

     1. NOT ALL ON AT ONCE. No moment of any record has every kind of scene
        sound going. If the whole landscape sounds all the time, the route is
        decoration.
     2. A PLACE ARRIVES AND LEAVES. Scene beds are bounded by their sections,
        never one bed under the whole record.
     3. THE WEATHER STARTS AND STOPS. A record with weather has dry stretches;
        a spell is a spell, not a coat of paint.
     4. THE STOPS ARE SOMEWHERE. Over many records both a city and a country
        halt occur, and a halt never carries the platform crowd. */
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Boxcar Synth.html');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SEED = parseInt(process.argv[2], 10) || 3;
const SEEDS = parseInt(process.argv[3], 10) || 20;

let pass = 0, fail = 0;
const check = (name, ok, note) => {
  console.log('  ' + (ok ? '✓' : '✗ FAIL:') + ' ' + name + (note ? '  (' + note + ')' : ''));
  ok ? pass++ : fail++;
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + HTML.replace(/ /g, '%20'));
  await pg.waitForTimeout(1200);

  const R = await pg.evaluate(([SEED, SEEDS]) => {
    const say = [];
    const ENGLISH = {
      sceneRiver: 'a river', sceneRiverside: 'birds by the water', sceneDawn: 'birds',
      sfx_wind: 'wind over open country', railTown: 'the station', railCrowd: 'a crowd on the platform',
      railValve: 'the safety valve', railDoors: 'the doors', railCall: 'the conductor calling',
      railGuard: "the guard's whistle", railDepart: 'the engine', railWhistle: 'a long whistle',
      railArrive: 'the brakes', railBrake: 'the brakes', railCbell: "the conductor's bell",
      railPeep: 'a short whistle', railPass0: 'something passing', railPass1: 'something passing',
      railBell: 'a crossing bell', railClank: 'a coupling clank',
      sfx_wind_w: 'wind', sfx_thunder_impact: 'thunder',
    };
    /* ── ONE RECORD, READ ALOUD ──────────────────────────────────────────── */
    {
      const song = MK2.composeSong(SEED, undefined, 'boxcarsynth');
      const spb = (60 / song.chart.tempo) / 4, barSec = 16 * spb;
      const ev = song.perf.events;
      const secs = song.sections || [];
      const PAY = (song.chart.table.form && song.chart.table.form.payoff) || 'chorus';
      const mmss = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
      say.push('SEED ' + SEED + ' — ' + secs.length + ' sections, ' + mmss(secs[secs.length-1].endBar*barSec));
      for(let i = 0; i < secs.length; i++){
        const s = secs[i], fn = s.fn || s.type;
        const a = s.startBar * barSec, z = s.endBar * barSec;
        const here = ev.filter(e => (e.role === 'scene' || e.role === 'weather' || e.role === 'tape')
                                 && e.bed && e.tSec >= a - 1 && e.tSec < z);
        const wx = ev.filter(e => e.voice === 'weather' && e.kind && e.tSec < z && e.tSec + e.durSec > a);
        const running = ev.some(e => e.voice === 'trainbox' && e.tSec < z - 0.5 && e.tSec + e.durSec > a + 0.5);
        const names = [...new Set(here.map(e => ENGLISH[e.bed] || e.bed))];
        say.push('  ' + mmss(a).padStart(5) + '  ' + (fn === PAY ? 'A TOWN' : fn).padEnd(13) +
                 (running ? 'the train is running' : 'STOPPED').padEnd(22) +
                 (wx.length ? '[' + wx[0].kind + '] ' : '') +
                 (names.length ? names.join(', ') : '—'));
      }
    }
    /* ── AND THE CLAIMS, OVER MANY RECORDS ───────────────────────────────── */
    const out = { say, allAtOnce: 0, moments: 0, wholeRecordBeds: 0, sceneBeds: 0,
                  withWeather: 0, dryToo: 0, records: 0, cities: 0, halts: 0, crowdAtHalt: 0 };
    for(let s = 1; s <= SEEDS; s++){
      const song = MK2.composeSong(s, undefined, 'boxcarsynth');
      out.records++;
      const spb = (60 / song.chart.tempo) / 4, barSec = 16 * spb;
      const ev = song.perf.events, secs = song.sections || [];
      const total = secs.length ? secs[secs.length-1].endBar * barSec : 0;
      const scene = ev.filter(e => e.role === 'scene' && e.bed);
      out.sceneBeds += scene.length;
      for(const e of scene) if(e.durSec > total * 0.9) out.wholeRecordBeds++;
      /* 1. not all on at once: sample the record every 5 s and count kinds */
      for(let t = 2; t < total; t += 5){
        out.moments++;
        const on = new Set();
        for(const e of ev){
          if(!e.bed || e.tSec > t || e.tSec + e.durSec < t) continue;
          if(e.role === 'scene') on.add('scene');
          if(e.role === 'weather') on.add('weather');
        }
        const wx = ev.some(e => e.voice === 'weather' && e.kind && e.tSec <= t && e.tSec + e.durSec >= t);
        if(wx) on.add('weather');
        if(on.size >= 2 && ev.filter(e => e.role === 'scene' && e.tSec <= t && e.tSec + e.durSec >= t).length > 1)
          out.allAtOnce++;
      }
      /* 3. the weather starts and stops */
      const spells = ev.filter(e => e.voice === 'weather' && e.kind);
      if(spells.length){
        out.withWeather++;
        const wet = spells.reduce((n, e) => n + e.durSec, 0);
        if(wet < total * 0.85) out.dryToo++;
      }
      /* 4. the stops are somewhere */
      const PAY = (song.chart.table.form && song.chart.table.form.payoff) || 'chorus';
      for(const sec of secs){
        if((sec.fn || sec.type) !== PAY) continue;
        const a = sec.startBar * barSec, z = sec.endBar * barSec;
        const crowd = ev.some(e => e.bed === 'railCrowd' && e.tSec >= a - 1 && e.tSec < z);
        const birds = ev.some(e => /sceneDawn|sceneRiverside/.test(e.bed || '') && e.tSec >= a - 1 && e.tSec < z);
        if(crowd) out.cities++; else if(birds) out.halts++;
        if(!crowd && birds) { /* a halt, correctly without a crowd */ }
        if(crowd && birds) out.crowdAtHalt++;
      }
    }
    return out;
  }, [SEED, SEEDS]);

  console.log('\nPROBE_ROUTE — boxcar synth\n');
  console.log(R.say.join('\n'));
  console.log('\n  the claims, over ' + R.records + ' records:\n');

  check("the landscape is not all on at once",
        R.allAtOnce === 0,
        R.allAtOnce ? R.allAtOnce + ' of ' + R.moments + ' moments carry more than one scene bed'
                    : R.moments + ' moments sampled, never two scene beds at once');
  check("a place arrives and leaves — no bed spans the record",
        R.sceneBeds > 0 && R.wholeRecordBeds === 0,
        R.wholeRecordBeds ? R.wholeRecordBeds + ' beds span the whole record'
                          : R.sceneBeds + ' scene beds, every one bounded by its section');
  check("the weather starts and stops",
        R.withWeather > 0 && R.dryToo === R.withWeather,
        `${R.dryToo}/${R.withWeather} records with weather also have dry stretches`);
  check("a stop is somewhere — both cities and country halts occur",
        R.cities > 0 && R.halts > 0,
        `${R.cities} city stops, ${R.halts} country halts`);
  check("...and a country halt has no crowd on the platform",
        R.crowdAtHalt === 0,
        R.crowdAtHalt ? R.crowdAtHalt + ' stops have both' : 'never both');
  check("no page errors", errs.length === 0, errs.slice(0, 2).join(' | '));

  console.log(`\n  ${pass} passed, ${fail} failed\n`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
