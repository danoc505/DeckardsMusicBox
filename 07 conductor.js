"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE CONDUCTOR  —  Layer 0, the hidden chart the band agrees on before playing.
   ---------------------------------------------------------------------------
   Generates (randomized within genre bounds, all user-overridable):
     · key + mode          · tempo + meter
     · FORM — the section list (strophic/binary/verse-chorus/AABA + bridge/coda)
     · genre (soft constraints: feel, register lean, entrance density)
     · the FOCAL voice — whichever engine is *likely* to lead / get a solo later
   Grounded in the project Sections files: strophic (AAA), binary (verse/chorus
   ABAB), verse/prechorus/chorus (ABCABC), 32-bar AABA; the BRIDGE appears in the
   last third and is the sanctioned KEY-CHANGE moment; the coda tags the end.
   Sections are 8 bars (the phrase base unit); one progression is shared across
   sections, the bridge being the exception (matches the harmony principle).
   ═══════════════════════════════════════════════════════════════════════════ */
const B = globalThis.__B || (typeof require!=="undefined" ? require("./02_engine_base.js") : null);
const TH = (typeof require!=="undefined" ? require("./09_theme.js") : null);
const { T, pc, makeRng, pick, wpick, clamp } = B;

/* genre soft-constraint packs — bounds the conductor randomizes WITHIN. Nothing
   here is a baked pattern; these are ranges/weights the dice roll inside. */
const GENRES = {
  lofi:    { scales:["minor","dorian","major"],        tempo:[70,90],   feel:"boombap", forms:["binary","versechorus","strophic"], swingBias:0.5 },
  house:   { scales:["minor","major"],                 tempo:[118,128], feel:"four",    forms:["binary","strophic"],               swingBias:0.1 },
  citypop: { scales:["major","dorian"],                tempo:[95,115],  feel:"boombap", forms:["versechorus","binary"],            swingBias:0.15 },
  wise:    { scales:["minor","aeolian","dorian"],       tempo:[80,100],  feel:"boombap", forms:["binary","aaba"],                   swingBias:0.1 },
  dungeon: { scales:["minor","phrygian","aeolian"],     tempo:[60,84],   feel:"sparse",  forms:["strophic","binary"],               swingBias:0 },
  ambient: { scales:["major","dorian","lydian"],        tempo:[50,72],   feel:"sparse",  forms:["strophic"],                        swingBias:0 },
  barber:  { scales:["major","minor"],                 tempo:[70,92],   feel:"boombap", forms:["binary","strophic"],               swingBias:0.4 },
  jungle:  { scales:["minor","aeolian"],                tempo:[160,176], feel:"breaks",  forms:["binary","strophic"],               swingBias:0.15 },
};

/* FORM templates — section lists. Each section: {name, role, bars, contrast} */
const FORMS = {
  // strophic: one section repeats (AAA)
  strophic: (rng) => Array.from({length:3+Math.floor((rng?rng():0.5)*4)},()=>({name:"A", role:"body", bars:8})),
  // binary: verse/chorus alternating (ABAB)
  binary: (rng) => { const pairs=2+((rng?rng():0)<0.35?1:0); const out=[];
    for(let i=0;i<pairs;i++){ out.push({name:"verse", role:"body", bars:8},
      {name:"chorus", role:"hook", bars:8}); } return out; },
  // verse / pre-chorus / chorus (ABC ABC)
  versechorus: () => [
    {name:"verse", role:"body", bars:8}, {name:"pre", role:"lift", bars:4}, {name:"chorus", role:"hook", bars:8},
    {name:"verse", role:"body", bars:8}, {name:"pre", role:"lift", bars:4}, {name:"chorus", role:"hook", bars:8},
    {name:"bridge", role:"bridge", bars:8, contrast:true}, {name:"chorus", role:"hook", bars:8},
  ],
  // 32-bar AABA (each section 8 bars; B is the bridge, contrasting)
  aaba: () => [
    {name:"A", role:"body", bars:8}, {name:"A", role:"body", bars:8},
    {name:"B", role:"bridge", bars:8, contrast:true}, {name:"A", role:"body", bars:8},
  ],
};

/* the CONDUCTOR — produces the chart. `overrides` lets the user pin anything. */
/* the corpus, if one has been harvested */
let CORPUS = (typeof globalThis!=="undefined" && globalThis.IMPROV_CORPUS) || null;
if(!CORPUS && typeof require!=="undefined"){
  try{ CORPUS = require("./corpus.json"); }catch(e){ CORPUS = null; }
}
/* REAL MUSIC: Bach's chorales, as scale degrees and scale-steps. Public domain,
   and relative like everything else, so a progression written in E-flat in 1725
   drops into one of our songs in F# with nothing to correct. */
let BACH = (typeof globalThis!=="undefined" && globalThis.BACH_CORPUS) || null;
if(!BACH && typeof require!=="undefined"){
  try{ BACH = require("./bach_corpus.json"); }catch(e){ BACH = null; }
}
/* JAZZ: 2,817 Real Book tunes, progressions only. Weighted by how often each
   actually occurs, so common turnarounds come up more than curiosities —
   the same way a player reaches for a ii-V-I before an oddity. */
let JAZZ = (typeof globalThis!=="undefined" && globalThis.JAZZ_CORPUS) || null;
if(!JAZZ && typeof require!=="undefined"){
  try{ JAZZ = require("./jazz_corpus.json"); }catch(e){ JAZZ = null; }
}
/* WHAT EACH GENRE WANTS FROM THE VOCABULARY.
   We are not making jazz. Lofi hip hop, city pop and barber beats are
   jazz-INFLUENCED with their own rules, so the corpus is a vocabulary and the
   genre is the grammar that selects from it. Each profile says what a
   progression must look like to belong here — how rich the chords are, how
   strongly it pulls, whether it resolves or hangs open to loop.
     sev  seventh-chord share      fif  fifth (functional) root motion
     stp  stepwise/modal motion    loop prefers to hang open rather than cadence
   Values are TARGETS with a tolerance, not filters: a genre leans, it does not
   forbid, which is how these styles actually behave. */
const GENRE_HARMONY = {
  lofi:    { sev:0.85, fif:0.45, stp:0.25, loop:1.0, mv:3 },  // jazz chords, loops, unresolved
  citypop: { sev:0.80, fif:0.70, stp:0.15, loop:0.5, mv:4 },  // rich AND moving
  barber:  { sev:0.90, fif:0.40, stp:0.30, loop:1.0, mv:2 },  // hazy, static, lush
  wise:    { sev:0.60, fif:0.55, stp:0.25, loop:0.8, mv:3 },
  house:   { sev:0.35, fif:0.40, stp:0.35, loop:1.0, mv:2 },  // vamp, not changes
  jungle:  { sev:0.30, fif:0.35, stp:0.40, loop:1.0, mv:2 },  // harmony stays out of the way
  dungeon: { sev:0.15, fif:0.30, stp:0.60, loop:1.0, mv:3 },  // modal, stepwise
  ambient: { sev:0.40, fif:0.20, stp:0.55, loop:1.0, mv:2 },  // drifting, no cadence
};
function harmonyFit(ch, want){
  if(!ch || !want) return 1;
  const d = (a,b,w)=> w*Math.abs((a==null?0:a)-b);
  // distance in character space; smaller is a better fit for this genre
  const dist = d(ch.sev,want.sev,1.4) + d(ch.fif,want.fif,1.0)
             + d(ch.stp,want.stp,0.8) + d(ch.loop,want.loop,0.9)
             + Math.abs((ch.mv||3)-want.mv)*0.25;
  return 1/(1+dist*1.6);
}

function drawJazzProgression(rng, mode, genreName){
  if(!JAZZ || !JAZZ.progressions || !JAZZ.progressions.length) return null;
  if(noCorpus()) return null;
  const want = (mode==="major"||mode==="lydian"||mode==="mixolydian") ? "major" : "minor";
  const pool = JAZZ.progressions.filter(p=>p.m===want);
  const use = pool.length ? pool : JAZZ.progressions;
  // weight by how often it occurs AND how well it fits this genre's grammar
  const profile = GENRE_HARMONY[genreName] || null;
  const weights = use.map(p => Math.sqrt(p.n) * harmonyFit(p.ch, profile));
  let total=0; for(const w of weights) total += w;
  if(total <= 0) return use[0].c.map(x=>({d:x.d, q:x.q}));
  let r = rng()*total;
  for(let i=0;i<use.length;i++){ r -= weights[i];
    if(r<=0) return use[i].c.map(x=>({d:x.d, q:x.q})); }
  return use[use.length-1].c.map(x=>({d:x.d, q:x.q}));
}

function drawBachProgression(rng, mode){
  if(!BACH || !BACH.progressions || !BACH.progressions.length) return null;
  if(noCorpus() || rng() > 0.45) return null;
  const want = (mode==="major") ? "major" : "minor";
  const pool = BACH.progressions.filter(p=>p.m===want);
  const use = pool.length ? pool : BACH.progressions;
  return use[Math.floor(rng()*use.length)].d.slice();
}
/* FOLK MELODY: 1,032 traditional tunes, public domain — and unlike jazz
   standards the melodies themselves are free, not just the changes. Closer to
   our genres than a chorale soprano line. */
let FOLK = (typeof globalThis!=="undefined" && globalThis.FOLK_CORPUS) || null;
if(!FOLK && typeof require!=="undefined"){
  try{ FOLK = require("./folk_corpus.json"); }catch(e){ FOLK = null; }
}
function drawFolkShape(rng, mode, opening){
  if(!FOLK || noCorpus()) return null;
  const pool0 = opening ? (FOLK.openings||[]) : (FOLK.melodicShapes||[]);
  if(!pool0.length) return null;
  const want = (mode==="major"||mode==="lydian"||mode==="mixolydian") ? "major" : "minor";
  const pool = pool0.filter(s=>s.m===want);
  const use = pool.length ? pool : pool0;
  const s = use[Math.floor(rng()*use.length)];
  return { rhythm:s.r.slice(), moves:s.v.slice(), dir: s.v.find(v=>v!==0)>0?1:-1 };
}

function drawBachShape(rng, mode){
  if(!BACH || !BACH.sopranoShapes || !BACH.sopranoShapes.length) return null;
  if(noCorpus() || rng() > 0.3) return null;
  const want = (mode==="major") ? "major" : "minor";
  const pool = BACH.sopranoShapes.filter(s=>s.m===want);
  const use = pool.length ? pool : BACH.sopranoShapes;
  const s = use[Math.floor(rng()*use.length)];
  return { rhythm:s.r.slice(), moves:s.v.slice(), dir: s.v[0]>0?1:-1 };
}
const noCorpus = () => (typeof globalThis!=="undefined" && globalThis.IMPROV_HARVEST);
function drawTheme(rng, mode){
  if(noCorpus()) return ((typeof TH!=="undefined" && TH) ? TH.makeTheme : makeTheme)(rng);
  // a real melodic phrase: folk first (closer to our idioms), then Bach
  const fs2 = (rng() < 0.45) ? drawFolkShape(rng, mode, true) : null;
  if(fs2){
    const base = ((typeof TH!=="undefined" && TH) ? TH.makeTheme : makeTheme)(rng);
    base.question = fs2;
    base.answer.dir = -fs2.dir;
    base.answer.moves = base.answer.moves.map(m=>Math.sign(-fs2.dir)*Math.abs(m));
    const ans = drawFolkShape(rng, mode, false);
    if(ans){ base.answer.rhythm = ans.rhythm.slice();
      base.answer.moves = ans.moves.map(m=>Math.sign(-fs2.dir)*Math.abs(m)); }
    base.fromFolk = true;
    return base;
  }
  const bs = drawBachShape(rng, mode);
  if(bs){
    const base = ((typeof TH!=="undefined" && TH) ? TH.makeTheme : makeTheme)(rng);
    base.question = bs;                       // a real melodic shape, by Bach
    base.answer.dir = -bs.dir;                // answered contrary, as always
    base.answer.moves = base.answer.moves.map(m=>Math.sign(-bs.dir)*Math.abs(m));
    base.fromBach = true;
    return base;
  }
  const make = ((typeof TH!=="undefined" && TH) ? TH.makeTheme : makeTheme);
  if(CORPUS && CORPUS.themes && CORPUS.themes.length && rng() < 0.6){
    const t = CORPUS.themes[Math.floor(rng()*CORPUS.themes.length)];
    return { question:{ rhythm:t.q.rhythm.slice(), moves:t.q.moves.slice(), dir:t.q.dir },
             answer:  { rhythm:t.a.rhythm.slice(), moves:t.a.moves.slice(), dir:t.a.dir },
             turn: t.turn, fromCorpus:true };
  }
  return make(rng);
}
function drawTexture(rng){
  if(noCorpus()) return null;
  if(CORPUS && CORPUS.textures && CORPUS.textures.length && rng() < 0.5){
    const x = CORPUS.textures[Math.floor(rng()*CORPUS.textures.length)].t;
    return { offsets:x.offsets.slice(), motifRhythm:x.motifRhythm.slice(),
             altRhythm:(x.altRhythm||x.motifRhythm).slice(),
             motifDir:x.motifDir, varyBar:x.varyBar, seventh:x.seventh, fromCorpus:true };
  }
  return null;
}

function conduct(seed, overrides){
  overrides = overrides || {};
  const rng = makeRng(seed>>>0 || 1);

  // GENRE (soft-constraint pack)
  const genreName = overrides.genre || pick(rng, Object.keys(GENRES));
  const G = GENRES[genreName];

  // KEY + MODE (within the genre's scale set)
  const root  = overrides.root!=null ? overrides.root : Math.floor(rng()*12);
  const scale = overrides.scale || pick(rng, G.scales);

  // TEMPO + METER
  const [tlo,thi] = G.tempo;
  const tempo = overrides.tempo || Math.round(tlo + rng()*(thi-tlo));
  const meter = overrides.meter || 4;                  // 4/4 default (could extend)

  // FORM — pick a form template from the genre, build the section list
  const formName = overrides.form || pick(rng, G.forms);
  let sections = (FORMS[formName]||FORMS.binary)(rng);
  // maybe add a coda (tag the end) — soft, more likely on longer forms
  if(!overrides.form && rng()<0.25 && sections.length>=4)
    sections = sections.concat([{name:"coda", role:"coda", bars:8}]);
  // maybe an intro (sparse lead-in) — soft
  if(rng()<0.5) sections = [{name:"intro", role:"intro", bars:4}].concat(sections);

  // FEEL (drum grammar) + phrase unit
  const feel = overrides.feel || G.feel;
  const phraseUnit = 8;

  // total bars
  const nBars = sections.reduce((s,x)=>s+x.bars,0);

  // FOCAL voice — whichever engine is *likely* to lead / solo later (soft).
  // "what starts is likely to become the focal" — we bias, don't force.
  // the FOCAL is genre-affine (house lives on its beat; ambient on its chords) —
  // soft weights, any focal remains possible
  const FOCALW={
    house:[["drums",4],["bass",4],["harmony",2],["melody",2]],
    jungle:[["drums",4],["bass",3],["melody",2],["harmony",2]],
    wise:[["drums",3],["bass",3],["melody",3],["harmony",2]],
    citypop:[["melody",3],["harmony",3],["bass",3],["drums",2]],
    lofi:[["harmony",4],["melody",4],["drums",2],["bass",2]],
    barber:[["harmony",4],["melody",4],["bass",2],["drums",1]],
    dungeon:[["melody",3],["harmony",3],["bass",2],["drums",2]],
    ambient:[["harmony",4],["melody",3],["bass",2],["drums",1]],
  };
  const focal = overrides.focal || wpick(rng, FOCALW[genreName]||[["melody",4],["harmony",3],["bass",2],["drums",2]]);

  return {
    seed, genre:genreName, key:{root, scale}, tempo, meter, feel, phraseUnit,
    // THE THEME — the song's protagonist. Either invented now, or drawn from
    // the CORPUS: material the engines themselves made and that scored well.
    // Nothing is authored by hand, so nothing is baked in — this is the
    // program recycling its own best ideas instead of starting from nothing
    // every time. Themes are rhythm plus scale-STEPS, so a theme lifted from
    // one song lands in another's key automatically.
    _theme: drawTheme(rng, scale),
    _chordTexture: drawTexture(rng) || undefined,
    // real changes: jazz first for these genres, Bach for the austere ones
    // HARMONIC RHYTHM, measured from 2,817 tunes: chords hold 2 beats 48% of
    // the time and 4 beats 29%. Our engines assumed one chord per bar, which
    // is simply wrong for this idiom — half of jazz changes twice a bar.
    _chordBeats: (function(){
      if(noCorpus() || !JAZZ || !JAZZ.harmonicRhythm) return 4;
      const hr = JAZZ.harmonicRhythm.filter(x=>x.beats===2||x.beats===4||x.beats===8);
      if(!hr.length) return 4;
      let tot=0; for(const x of hr) tot+=x.n;
      let r=rng()*tot;
      for(const x of hr){ r-=x.n; if(r<=0) return x.beats; }
      return 4;
    })(),
    _realProg: (function(){
      const jazzy = ["lofi","citypop","barber","wise","house"].indexOf(genreName)>=0;
      const p = (jazzy || rng()<0.5) ? drawJazzProgression(rng, scale, genreName) : null;
      if(p && rng()<0.7) return p;
      const bp = drawBachProgression(rng, scale);
      return bp ? bp.map(d=>({d, q:null})) : (p||undefined);
    })(),
    // the tune may be RECOMBINED across sources, or a chop of one phrase, or
    // invented outright. Genre says what density and leapiness it wants.
    _recombineLead: (!noCorpus() && rng() < 0.4),
    _flipLead: (!noCorpus() && rng() < 0.25),
    _recombineBass: (!noCorpus() && rng() < 0.3),
    _leadDensity: ({lofi:0.28, barber:0.22, ambient:0.18, dungeon:0.25,
                    citypop:0.42, house:0.38, wise:0.34, jungle:0.45}[genreName] || 0.32),
    _leadLeap: ({lofi:0.15, barber:0.12, ambient:0.10, dungeon:0.30,
                 citypop:0.25, house:0.18, wise:0.20, jungle:0.22}[genreName] || 0.2),
    loopBars: 8,                    // THE LOOP — the repeating unit everything is built from
    form:formName, sections, nBars, focal,
    // per-section absolute bar offsets (so engines can place by section)
    _sectionSpans: buildSpans(sections),
    // the base progression is generated ONCE and shared (bridge excepted) — the
    // harmony engine reads this flag; here we just carry the intent.
    sharedProgression:true,
  };
}

function buildSpans(sections){
  const spans=[]; let bar=0;
  for(const s of sections){ spans.push({...s, startBar:bar, endBar:bar+s.bars}); bar+=s.bars; }
  return spans;
}

/* readable description of the chart the band agreed on */
function describeChart(chart){
  const L=[];
  L.push(`CONDUCTOR · ${chart.genre}`);
  L.push(`  key: ${T.NOTE[chart.key.root]} ${chart.key.scale}   tempo: ${chart.tempo}   meter: ${chart.meter}/4   feel: ${chart.feel}`);
  L.push(`  form: ${chart.form}  (${chart.nBars} bars)   focal: ${chart.focal}`);
  L.push(`  sections: ${chart.sections.map(s=>s.name+(s.contrast?"*":"")+"["+s.bars+"]").join(" ")}`);
  return L.join("\n");
}

if(typeof module!=="undefined") module.exports = { conduct, describeChart, GENRES, FORMS, drawTheme, drawTexture };
