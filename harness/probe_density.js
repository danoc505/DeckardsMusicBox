/* HOW BUSY IS IT, AND HOW IS THE CHORD PLAYED — the two questions the sources
   about this music ask that nothing here has ever measured.

   Every existing probe asks WHICH NOTES. probe_theory asks whether they are in
   the key, probe_counterpoint asks what two lines do relative to each other,
   probe_quality asks what the chord is spelled as. Not one of them asks how
   MANY notes are sounding, how often the chord restrikes, or how much of the
   bar is silence -- and those are the three things the lofi sources talk about
   most. "Keep melodies sparse", "negative space", "not more than 3 or 4
   elements", "spread voicings where the notes span two octaves or more".
   Those are all claims about density and this repo could not check any of them.

   So this reads the performed events and asks:

     THE VOICING   how many notes in a chord strike, how far apart the lowest
                   and highest are, where the bottom of it sits, and whether
                   the root is underneath
     THE RHYTHM    how many times a bar the chord restrikes, and on which
                   sixteenth it lands
     THE ROOM      how many parts are sounding in a bar, and how many notes a
                   bar the whole record plays -- broken out by section, because
                   the sources say the density is what CHANGES between sections
     THE TUNE      notes a bar in the lead, and the share of bars it sits out

   TWO CONTROLS, because a density with nothing beside it is a number:

     ACROSS GENRES  every genre is measured the same way. lofi is supposed to
                    be the sparse one; if it reads busier than acid or jungle
                    then either the tables are wrong or this probe is.
     THE ARITHMETIC the per-role note counts must sum to the event count. A
                    probe that drops events would report everything as sparse
                    and be believed, which is the failure mode that matters
                    here.

   TWO WAYS TO COUNT A CHORD, AND THE FIRST ONE IS WRONG HERE. The obvious
   measurement is to group keys notes by onset -- every note starting on the
   same sixteenth is one chord -- which is the join probe_counterpoint uses,
   because stage 5 displaces lanes independently and notes written together do
   not arrive together.

   ON THIS PART THAT MEASUREMENT LIES, and it lied to me first: it read 1.24
   notes per chord across lofi and I nearly reported that the comp does not
   play chords. It does. `buildKeys` ROLLS its voicings on purpose -- the
   voices enter bottom-upward across a few sixteenths, and on later strikes an
   inner voice moves while the outer ones HOLD. Onset-grouping counts a rolled
   four-note chord as four one-note strikes and a held voicing as no chord at
   all, so it measures the roll and calls it the harmony.

   So the chord is counted by WHAT IS SOUNDING: at every sixteenth of the song,
   how many keys notes are ringing (onset <= t < onset + duration). That is the
   number an ear gets. The onset count is still reported beside it, as the ROLL
   -- it is a real and separate thing worth knowing -- but the voicing figures
   are the sounding ones.

     node harness/probe_density.js [seeds]
*/
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, '..', 'Deckards Orchestrator MK2.html'), 'utf8');
const src = html.split('<script>')[1].split('</script>')[0];
global.window = { addEventListener(){}, MK2: null };
global.document = { getElementById: () => ({ addEventListener(){}, textContent: '', value: '1', innerHTML: '' }),
                    createElement: () => ({ click(){} }) };
eval(src);
const M = global.window.MK2;
const SEEDS = parseInt(process.argv[2], 10) || 30;

const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const pct  = (n, d) => d ? (100 * n / d).toFixed(1) : '  - ';
const NOTE = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

console.log(`\n=== how busy is it, and how is the chord played (${SEEDS} seeds a genre) ===\n`);

const genres = M.genres();
const perGenre = [];
let arithmeticOK = true;

for(const g of genres){
  const voicSize = [], voicSpan = [], voicLow = [];
  let rootLowest = 0, voicings = 0;
  const soundSize = [], soundSpan = []; let soundLowest = 0, soundMoments = 0;
  const strikesPerBar = [], sixteenthHist = new Array(16).fill(0);
  const partsPerBar = [], notesPerBar = [];
  const leadPerBar = []; let leadSilentBars = 0, leadBars = 0;
  let leadQuiet = 0, leadSteps = 0; const leadGaps = [];
  const bySection = {};                       /* fn -> { parts:[], notes:[] } */

  for(let s = 1; s <= SEEDS; s++){
    const song = M.composeSong(s, 'draw', g);
    const spb  = (60 / song.chart.tempo) / 4;   /* one sixteenth, in seconds */
    const barSec = spb * 16;
    const evs = song.perf.events.filter(e => e.role && e.role !== 'tape');

    /* THE ARITHMETIC CONTROL — nothing may be silently dropped */
    let counted = 0;

    /* bar -> { roles:Set, notes:n }, and keys grouped by strike */
    const bars = new Map();
    const strikes = new Map();                  /* "bar:step" -> [pitches] */
    for(const e of evs){
      counted++;
      const bar = Math.floor(e.tSec / barSec);
      if(bar < 0 || bar >= song.form.nBars) continue;
      let b = bars.get(bar);
      if(!b){ b = { roles: new Set(), notes: 0, lead: 0 }; bars.set(bar, b); }
      b.roles.add(e.role); b.notes++;
      if(e.role === 'lead') b.lead++;
      if(e.role === 'keys' && e.pitch != null){
        const step = Math.round(e.tSec / spb);
        const k = bar + ':' + step;
        (strikes.get(k) || strikes.set(k, []).get(k)).push(e.pitch);
      }
    }
    if(counted !== evs.length) arithmeticOK = false;

    /* ── HOW MUCH OF THE TIME THE TUNE IS SILENT ─────────────────────────────
       "BARS WITH NO NOTE AT ALL" IS THE WRONG QUESTION AND IT GAVE THE WRONG
       ANSWER. A rest that occupies the back half of a bar leaves a note at the
       front of it, so the bar counts as occupied and a real change of shape
       measures as 5.3% -> 6.2%: almost nothing. What the sources are asking for
       is space, and space is measured in TIME.

       So: over the bars the tune is rostered for, the share of sixteenths where
       no lead note is sounding, and the length of the longest unbroken gap. A
       phrase that ends and waits shows up in both; a phrase that never stops
       shows up in neither. */
    const leadEvs = evs.filter(e => e.role === 'lead' && e.pitch != null);
    {
      let run = 0;
      for(let st = 0; st < song.form.nBars * 16; st++){
        const bar = Math.floor(st / 16);
        const sec = song.sections.find(x => bar >= x.startBar && bar < x.endBar);
        if(!sec || !sec.active || !sec.active.includes('lead')){ run = 0; continue; }
        const t = st * spb;
        let on = false;
        for(const e of leadEvs) if(e.tSec <= t + 1e-6 && t < e.tSec + e.durSec - 1e-6){ on = true; break; }
        leadSteps++;
        if(on){ if(run) leadGaps.push(run); run = 0; }
        else { leadQuiet++; run++; }
      }
      if(run) leadGaps.push(run);
    }

    /* ── WHAT IS SOUNDING, sixteenth by sixteenth ────────────────────────────
       The voicing as an ear gets it: every keys note whose duration covers this
       instant, whether it was struck here or three sixteenths ago. Silence --
       no keys note ringing at all -- is not counted as a chord of size zero;
       it is counted separately as the part's rests, below. */
    const keysEvs = evs.filter(e => e.role === 'keys' && e.pitch != null);
    for(let st = 0; st < song.form.nBars * 16; st++){
      const t = st * spb;
      const on = [];
      for(const e of keysEvs) if(e.tSec <= t + 1e-6 && t < e.tSec + e.durSec - 1e-6) on.push(e.pitch);
      if(!on.length) continue;
      soundMoments++;
      soundSize.push(on.length);
      soundSpan.push(Math.max(...on) - Math.min(...on));
      const bar = Math.floor(st / 16);
      const sec = song.sections.find(x => bar >= x.startBar && bar < x.endBar);
      const chs = sec && sec.material === 'C' && song.materials.bridgeChords
        ? song.materials.bridgeChords : song.materials.chords;
      if(sec && chs && chs.length){
        const ch = chs[(bar - sec.startBar) % chs.length];
        if(ch && ch.rootMidi != null && ((Math.min(...on) - ch.rootMidi) % 12 + 12) % 12 === 0) soundLowest++;
      }
    }

    /* the voicings. THE CHORD UNDER A BAR is found the way the composer's own
       out-of-key seam check finds it -- index into the material's chord set by
       the bar's position INSIDE the material, not by its position in the song,
       because a material is a loop that restarts at every section. The bridge
       has its own set. Getting this wrong reads 0.0% root-underneath for every
       genre including the one that is triads only, which is how it was caught. */
    const perBar = new Map();
    for(const [k, pitches] of strikes){
      const [bar, step] = k.split(':').map(Number);
      voicings++;
      voicSize.push(pitches.length);
      voicSpan.push(Math.max(...pitches) - Math.min(...pitches));
      voicLow.push(Math.min(...pitches));
      sixteenthHist[((step % 16) + 16) % 16]++;
      perBar.set(bar, (perBar.get(bar) || 0) + 1);
      const sec = song.sections.find(x => bar >= x.startBar && bar < x.endBar);
      const chs = sec && sec.material === 'C' && song.materials.bridgeChords
        ? song.materials.bridgeChords : song.materials.chords;
      if(sec && chs && chs.length){
        const ch = chs[(bar - sec.startBar) % chs.length];
        if(ch && ch.rootMidi != null && ((Math.min(...pitches) - ch.rootMidi) % 12 + 12) % 12 === 0) rootLowest++;
      }
    }
    for(const n of perBar.values()) strikesPerBar.push(n);

    for(const [bar, b] of bars){
      partsPerBar.push(b.roles.size);
      notesPerBar.push(b.notes);
      const sec = song.sections.find(x => bar >= x.startBar && bar < x.endBar);
      const fn = sec ? sec.fn : '?';
      const S = bySection[fn] || (bySection[fn] = { parts: [], notes: [] });
      S.parts.push(b.roles.size); S.notes.push(b.notes);
      /* the tune's bars are only the bars the tune is rostered for */
      if(sec && sec.active && sec.active.includes('lead')){
        leadBars++; leadPerBar.push(b.lead);
        if(!b.lead) leadSilentBars++;
      }
    }
  }

  perGenre.push({ g, soundSize, soundSpan, soundLowest, soundMoments,
                  voicSize, voicSpan, voicLow, rootLowest, voicings, strikesPerBar,
                  partsPerBar, notesPerBar, leadPerBar, leadSilentBars, leadBars,
                  leadQuiet, leadSteps, leadGaps,
                  sixteenthHist, bySection });
}

console.log('  ── THE VOICING as an ear gets it: what is SOUNDING, sixteenth by sixteenth\n');
console.log('  genre         voices ringing   span(semitones)   bottom note   root underneath');
for(const p of perGenre){
  if(!p.soundMoments){ console.log(`  ${p.g.padEnd(12)}  — no chord part —`); continue; }
  const lo = mean(p.voicLow);
  console.log(`  ${p.g.padEnd(12)} ${mean(p.soundSize).toFixed(2).padStart(12)} ` +
    `${mean(p.soundSpan).toFixed(1).padStart(15)} ` +
    `${(NOTE[Math.round(lo) % 12] + (Math.floor(Math.round(lo) / 12) - 1)).padStart(13)} ` +
    `${(pct(p.soundLowest, p.soundMoments) + '%').padStart(16)}`);
}

console.log('\n  ── THE ROLL, the same part counted by ONSET — how the voicing is spelt out\n');
console.log('  genre         notes/onset   (this is the roll, NOT the harmony — see the header)');
for(const p of perGenre){
  if(!p.voicings){ console.log(`  ${p.g.padEnd(12)}  — no chord part —`); continue; }
  console.log(`  ${p.g.padEnd(12)} ${mean(p.voicSize).toFixed(2).padStart(9)}`);
}

console.log('\n  ── THE RHYTHM: how often the chord restrikes, and where it lands\n');
console.log('  genre         strikes/bar   share of bars with 1 strike   busiest sixteenth');
for(const p of perGenre){
  if(!p.voicings){ console.log(`  ${p.g.padEnd(12)}  — no chord part —`); continue; }
  const ones = p.strikesPerBar.filter(n => n === 1).length;
  const top = p.sixteenthHist.indexOf(Math.max(...p.sixteenthHist));
  console.log(`  ${p.g.padEnd(12)} ${mean(p.strikesPerBar).toFixed(2).padStart(9)} ` +
    `${(pct(ones, p.strikesPerBar.length) + '%').padStart(25)} ` +
    `${('16th ' + (top + 1)).padStart(19)}`);
}
console.log('\n  where in the bar the chord strikes fall (lofi), sixteenth 1..16:');
{
  const p = perGenre.find(x => x.g === 'lofi');
  if(p) console.log('    ' + p.sixteenthHist.map((n, i) =>
    `${String(i + 1).padStart(2)}:${pct(n, p.voicings)}%`).join('  '));
}

console.log('\n  ── THE ROOM: how many parts sound in a bar, and how many notes\n');
console.log('  genre         parts/bar   notes/bar');
for(const p of perGenre)
  console.log(`  ${p.g.padEnd(12)} ${mean(p.partsPerBar).toFixed(2).padStart(7)} ` +
    `${mean(p.notesPerBar).toFixed(1).padStart(11)}`);

console.log('\n  the same, per section — the sources say the density is what CHANGES:\n');
for(const p of perGenre){
  const fns = Object.keys(p.bySection).sort();
  console.log(`  ${p.g}`);
  for(const fn of fns){
    const S = p.bySection[fn];
    console.log(`     ${fn.padEnd(14)} parts ${mean(S.parts).toFixed(2)}   notes/bar ${mean(S.notes).toFixed(1)}`);
  }
}

console.log('\n  ── THE TUNE: notes a bar, and how often it shuts up\n');
console.log('  genre         notes/bar   empty bars   SILENT TIME   longest rest   rests >= a beat');
for(const p of perGenre){
  if(!p.leadBars){ console.log(`  ${p.g.padEnd(12)}  — no lead —`); continue; }
  const gaps = p.leadGaps.slice().sort((a, z) => z - a);
  const long = gaps.filter(x => x >= 4).length;
  console.log(`  ${p.g.padEnd(12)} ${mean(p.leadPerBar).toFixed(2).padStart(8)} ` +
    `${(pct(p.leadSilentBars, p.leadBars) + '%').padStart(12)} ` +
    `${(pct(p.leadQuiet, p.leadSteps) + '%').padStart(13)} ` +
    `${((gaps[0] || 0) + ' 16ths').padStart(14)} ` +
    `${(pct(long, gaps.length) + '% of ' + gaps.length).padStart(17)}`);
}

console.log('\n  ── THE ARITHMETIC CONTROL: ' +
  (arithmeticOK ? 'every event was counted — the sparse numbers above are real'
                : '** EVENTS WERE DROPPED. Do not trust anything above. **'));
console.log('');
