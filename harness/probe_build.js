/* DOES THE RECORD START SMALL AND BUILD UP. `form.build.enter` claims each part
   first arrives at a fraction of the record. That claim is only worth anything
   if the number of parts playing actually rises through the song -- a role list
   that oscillates around a mean would satisfy a code reader and no player.

   Reports, per genre, the mean count of active roles in each fifth of the
   record, and the bar each role first sounds at.

     node harness/probe_build.js [nSeeds]
*/
const { chromium } = require(require('path').resolve(__dirname, '..', 'node_modules', 'playwright'));
const path = require('path');
const HTML = path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html');
const N = Number(process.argv[2] || 40);
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto('file://' + HTML, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.MK2, { timeout: 20000 });

  const out = await page.evaluate(({ n }) => {
    const res = {};
    for(const genre of MK2.genres()){
      const fifths = [0, 0, 0, 0, 0], counts = [0, 0, 0, 0, 0];
      const firstAt = {}, songs = [];
      for(let seed = 1; seed <= n; seed++){
        const s = MK2.composeSong(seed, 'draw', genre);
        const nBars = s.form.nBars;
        /* bar-by-bar: how many roles are playing, and where each one starts */
        const seen = {};
        for(const sec of s.sections){
          for(let bar = sec.startBar; bar < sec.endBar; bar++){
            const f = Math.min(4, Math.floor((bar / nBars) * 5));
            fifths[f] += sec.active.length; counts[f]++;
          }
          for(const r of sec.active)
            if(seen[r] == null) seen[r] = sec.startBar / nBars;
        }
        for(const r in seen){
          (firstAt[r] = firstAt[r] || []).push(seen[r]);
        }
        songs.push(nBars);
      }
      const mean = fifths.map((v, i) => counts[i] ? v / counts[i] : 0);
      const firsts = {};
      for(const r in firstAt)
        firsts[r] = firstAt[r].reduce((a, c) => a + c, 0) / firstAt[r].length;
      res[genre] = { mean, firsts, bars: songs.reduce((a,c)=>a+c,0)/songs.length };
    }
    return res;
  }, { n: N });

  console.log(`\n=== mean number of parts playing, by fifth of the record (${N} seeds) ===`);
  console.log('  genre         1st    2nd    3rd    4th    5th     rise   bars');
  for(const g in out){
    const m = out[g].mean, rise = m[4] - m[0];
    console.log(`  ${g.padEnd(12)} ${m.map(v => v.toFixed(2).padStart(5)).join('  ')}   ${(rise >= 0 ? '+' : '') + rise.toFixed(2)}  ${out[g].bars.toFixed(0)}`);
  }
  console.log('\n=== where each part first sounds, as a fraction of the record ===');
  for(const g in out){
    const f = out[g].firsts;
    const s = Object.keys(f).sort((a, c) => f[a] - f[c])
                .map(r => `${r} ${f[r].toFixed(2)}`).join('  ');
    console.log(`  ${g.padEnd(12)} ${s}`);
  }
  if(errs.length) console.log('PAGE ERRORS: ' + errs.join(' | '));
  await b.close();
})();
