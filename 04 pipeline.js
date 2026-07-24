"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE IMPROVISATION PIPELINE
   A random member starts; the rest enter in random order, each READING the
   listening layer (everything already sounding) and responding. The order is
   the "kicker" — any engine can go first. This is the band assembling.

   Each engine is order-independent: it GENERATES from the chart when it leads,
   or READS the perception and FOLLOWS when something already played.
   ═══════════════════════════════════════════════════════════════════════════ */
const B = require("./02_engine_base.js");
const { pick, wpick } = B;
const L = require("./01_listening.js");
const { bassEngine, harmonyEngine } = require("./03_engines_pair.js");
const { drumEngine } = require("./05_drum_engine.js");
const { melodyEngine } = require("./06_melody_engine.js");
const { ghostPass } = require("./08_ghost.js");
const { developTheme } = require("./09_theme.js");
const { makeGroove, applyGroove, describeGroove } = require("./10_groove.js");
const { flipRealPhrase, recombine } = require("./13_flip.js");

// the registry of engines available to the band. melodyEngine returns an ARRAY
// of parts (the variable ensemble); the others return one part each.
const ENGINES = {
  harmony: harmonyEngine,
  bass:    bassEngine,
  drums:   drumEngine,
  melody:  melodyEngine,
};

/* run one improvisation session: shuffle the engine order, run each in turn,
   re-listening after every entry so the next engine hears the updated band.
   Returns { chart, order, parts, steps:[perception-snapshots] } */
function improvise(chart, rng, engineNames){
  engineNames = engineNames || Object.keys(ENGINES);
  // remember the base seed so each engine can derive its own stream
  if(chart._seed==null) chart._seed = Math.floor((rng()*1e9));
  // SHUFFLE the order (seeded) — this is the random pipeline order
  const AFFINITY={
    house:  {drums:5,bass:4,harmony:2,melody:2},
    jungle: {drums:5,bass:3,harmony:2,melody:2},
    wise:   {drums:3,bass:3,harmony:2,melody:2},
    citypop:{harmony:3,bass:3,drums:3,melody:3},
    lofi:   {harmony:4,melody:3,drums:2,bass:2},
    barber: {harmony:4,melody:3,bass:2,drums:1},
    dungeon:{harmony:3,melody:3,bass:2,drums:2},
    ambient:{harmony:4,melody:3,bass:2,drums:1},
  };
  const aff=AFFINITY[chart.genre]||{};
  const order=[]; const pool=engineNames.slice();
  while(pool.length){
    const weighted=pool.map(n=>[n, aff[n]||2]);
    const chosen=wpick(rng, weighted);
    order.push(chosen); pool.splice(pool.indexOf(chosen),1);
  }
  // "what starts is LIKELY to become the focal" — soft bias, not a rule
  if(chart.focal && order.includes(chart.focal) && rng()<0.7){
    const fi=order.indexOf(chart.focal);
    if(fi>0){ order.splice(fi,1); order.unshift(chart.focal); } }

  const parts=[];
  const steps=[];                                     // for the loading-screen / audit
  let entryIndex=0;
  for(const name of order){
    // the engine READS the current perception (what's already sounding)
    const perception = L.listen({ parts:parts.slice(), nBars:chart.nBars, key:chart.key,
                                  phraseUnit:chart.phraseUnit });
    // each engine gets its OWN independent RNG sub-stream (derived from the seed +
    // its name) so one engine's random draws never starve another's. This fixes
    // rosters collapsing because bass/harmony consumed the shared stream first.
    const subRng = B.makeRng(hashName(chart._seed||0, name));
    const result = ENGINES[name](chart, perception, subRng);
    // an engine may return ONE part or an ARRAY of parts (melody = ensemble)
    const produced = Array.isArray(result) ? result : [result];
    let added=0;
    for(const part of produced){ if(part && part.notes.length){ parts.push(part); added++; } }
    // THE GHOST: after each entry it reads the actual notes of the whole band
    // and corrects cross-engine violations. Corrections are real and logged.
    const corrections = ghostPass(parts, chart);
    const after = L.listen({ parts:parts.slice(), nBars:chart.nBars, key:chart.key,
                             phraseUnit:chart.phraseUnit });
    steps.push({ engine:name, wasLeading: perception.partCount===0, produced:added,
                 corrections, perception:after });
  }
  return { chart, order, parts,
           perception: L.listen({parts, nBars:chart.nBars, key:chart.key, phraseUnit:chart.phraseUnit}),
           steps };
}

/* a readable transcript of the session — SHOWS the band assembling, each
   engine's entry and what it heard. This is the loading-screen content. */
function describeSession(session){
  const out=[];
  out.push(`═══ SESSION · ${B.T.NOTE[session.chart.key.root]} ${session.chart.key.scale} · ${session.chart.nBars} bars ═══`);
  out.push(`ORDER: ${session.order.join(" → ")}`);
  session.steps.forEach((s,i)=>{
    out.push(`\n[${i+1}] ${s.engine.toUpperCase()} ${s.wasLeading?"leads (cold start)":"reads the band & responds"}`);
    // show the harmony line after this entry
    const h=s.perception.harmony.map(b=>b?`${b.rootName}${b.quality==="min"?"m":b.quality==="maj"?"":b.quality}`:"·").join(" ");
    out.push(`    now sounding: [${session.parts.slice(0,i+1).map(p=>p.role).join(", ")}]  harmony: ${h}`);
  });
  return out.join("\n");
}

module.exports = { improvise, describeSession, ENGINES, composeSong };

// derive a stable per-engine seed from the base seed + engine name
function hashName(seed, name){
  let h = (seed>>>0) ^ 0x9e3779b9;
  for(let i=0;i<name.length;i++){ h = Math.imul(h ^ name.charCodeAt(i), 0x01000193); }
  return h>>>0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   composeSong — the FULL pipeline using the Conductor (Layer 0).
   The conductor sets key/tempo/form/genre/focal; the band improvises the core
   material ONCE (shared across sections); then each SECTION is arranged — which
   voices play (intro sparse → chorus full), and the BRIDGE modulates.
   ═══════════════════════════════════════════════════════════════════════════ */
function composeSong(conductorChart, rng){
  const chart = conductorChart;
  const coreChart = { key:chart.key, nBars:chart.nBars, phraseUnit:chart.phraseUnit,
                      loopBars:chart.loopBars||8,
                      feel:chart.feel, genre:chart.genre, _seed:chart.seed, focal:chart.focal,
                      _sampleCycle:chart._sampleCycle,
                      _chordTexture:chart._chordTexture,
                      _realProg:chart._realProg,
                      _chordBeats:chart._chordBeats };   // a record's changes, if following one
  const session = improvise(coreChart, rng);
  chart.realizedFocal = session.order[0];        // whoever actually started
  chart._progLen = coreChart._progLen;           // surface the cycle length
  const plan = arrangeSections(chart, session, rng);
  // TRANSITION CRAFT (2-Loop text): every entrance has an entry side — the bar
  // before it gets a fill, so arrivals are announced, not accidental.
  const drums = session.parts.find(pt=>pt.role==="drums");
  if(drums){
    const drumEntry = plan.entries["drums"] ?? 0;
    const entryBars = [...new Set(Object.values(plan.entries))].filter(e=>e>drumEntry);
    for(const E of entryBars){
      const fb = E-1;
      if(fb < drumEntry) continue;
      if(chart.feel==="breaks"){
        [12,13,14,15].forEach((st,i)=>drums.notes.push({bar:fb, step:st, midi:38, lane:"snare", vel:0.35+i*0.08}));
      } else {
        ["highTom","hiMidTom","lowTom","lowFloorTom"].forEach((tk,i)=>
          drums.notes.push({bar:fb, step:12+i, midi:[50,48,45,41][i], lane:tk, vel:0.5}));
      }
    }
  }
  // THE STORY TRANSFORMS THE THEME — then the ghost gets the last word, so
  // transformed pitches still obey the cross-engine physics.
  // THE SYMBOLIC FLIP: sometimes the lead is not generated at all — it is a
  // real phrase from public-domain music, chopped into pads, rearranged, and
  // corrected into this song's key and chords. Sampling, done on notes.
  let flipInfo = null;
  // CROSS-SOURCE RECOMBINATION: rhythm from one piece, melodic contour from
  // another, over the harmony already in play. None of the sources contained
  // the result — this is the recombination, not a chop of one phrase.
  if(chart._recombineLead){
    const lead = session.parts.find(pt=>pt.role==="lead");
    const DIMS = (typeof globalThis!=="undefined" && globalThis.IMPROV_DIMENSIONS) ||
                 (function(){ try{ return require("./dimensions.json"); }catch(e){ return null; } })();
    if(lead && DIMS){
      const heard = session.perception && session.perception.harmony;
      const want = { density: chart._leadDensity, leap: chart._leadLeap };
      // build ONE LOOP of recombined material, then repeat it across the song.
      // Music is repeated patterns: a phrase that runs on continuously breaks
      // the loop law every other engine obeys.
      const loopBars = chart.loopBars || 8;
      const r = recombine(DIMS, {
        rng, mode: chart.key.scale, scale: chart.key.scale, root: chart.key.root,
        LO: 67, HI: 84, nBars: loopBars, startBar: 0, want,
        chordAt: bar => { const h = heard && heard[bar % (heard.length||1)];
                          return h && h.pcs ? h.pcs : null; }
      });
      if(r && r.notes.length > 4){
        const out = [];
        const loops = Math.ceil(chart.nBars / loopBars);
        for(let L=0; L<loops; L++){
          for(const n of r.notes){
            const bar = n.bar + L*loopBars;
            if(bar >= chart.nBars) continue;
            out.push({ ...n, bar });
          }
        }
        lead.notes = out;
        flipInfo = { kind:"recombined", rhythmFrom:r.rhythmFrom, contourFrom:r.contourFrom };
      }
    }
  }
  if(!flipInfo && chart._flipLead){
    const lead = session.parts.find(pt=>pt.role==="lead");
    const FOLKC = (typeof globalThis!=="undefined" && globalThis.FOLK_CORPUS) ||
                  (function(){ try{ return require("./folk_corpus.json"); }catch(e){ return null; } })();
    if(lead && FOLKC && FOLKC.melodicShapes){
      const heard = session.perception && session.perception.harmony;
      const res = flipRealPhrase(FOLKC.melodicShapes, {
        rng, mode: chart.key.scale, scale: chart.key.scale, root: chart.key.root,
        LO: 67, HI: 84, nBars: chart.nBars, startBar: 0,
        chordAt: bar => {
          const h = heard && heard[bar % (heard.length||1)];
          return h && h.pcs ? h.pcs : null;
        }
      });
      if(res && res.notes.length > 8){
        lead.notes = res.notes;
        flipInfo = { kind:"chop", pads: res.pads, steps: res.order.length };
      }
    }
  }
  // THE BASS, RECOMBINED. A chorale bass line is a real walking line: taking
  // its contour and pairing it with a rhythm from elsewhere gives a bass part
  // neither source had, corrected into our key and onto our chords.
  if(chart._recombineBass){
    const bs2 = session.parts.find(pt=>pt.role==="bass");
    const DIMS2 = (typeof globalThis!=="undefined" && globalThis.IMPROV_DIMENSIONS) ||
                  (function(){ try{ return require("./dimensions.json"); }catch(e){ return null; } })();
    const heard2 = session.perception && session.perception.harmony;
    const knowChanges = heard2 && heard2.some(h=>h && h.root!=null);
    // only recombine when the changes are actually known: a bass that cannot
    // state the roots is worse than the one the engine already wrote
    // and only when there is ONE chord per bar: with changes twice a bar the
    // bass must state both roots, which a single recombined line does not do.
    const oneChordPerBar = (chart._chordBeats || 4) >= 4;
    if(bs2 && DIMS2 && knowChanges && oneChordPerBar){
      const loopB = chart.loopBars || 8;
      const rb = recombine(DIMS2, {
        rng, mode: chart.key.scale, scale: chart.key.scale, root: chart.key.root,
        LO: 36, HI: 50, nBars: loopB, startBar: 0,
        want: { density: 0.30, role: "bass" },
        chordAt: bar => { const h = heard2 && heard2[bar % (heard2.length||1)];
                          return h && h.pcs ? h.pcs : null; }
      });
      if(rb && rb.notes.length > 4){
        // A recombined part still obeys the laws. Two of them bit here:
        //  · THE ROOT: the bass states the chord, so every bar's downbeat is
        //    pulled onto the root of the progression, not just any chord tone.
        //  · THE RULE OF 3: state, repeat, DEPART, return. Repeating a loop
        //    unchanged forever is exactly what the whole program forbids.
        const out2 = [];
        const loops2 = Math.ceil(chart.nBars / loopB);
        for(let L=0; L<loops2; L++){
          const mode2 = ["state","repeat","depart","vary"][L % 4];
          for(const n of rb.notes){
            const bar = n.bar + L*loopB;
            if(bar >= chart.nBars) continue;
            let midi = n.midi, step = n.step;
            if(n.step === 0){
              const h = heard2 && heard2[bar % (heard2.length||1)];
              const rootPc = h && h.root != null ? h.root
                           : (chart._realProg ? null : null);
              if(rootPc != null){
                let m = Math.round((midi - rootPc)/12)*12 + rootPc;
                while(m < 36) m += 12; while(m > 50) m -= 12;
                midi = m;
              }
            }
            if(mode2 === "depart" && n.bar >= loopB/2) midi = Math.min(50, midi + 12);
            if(mode2 === "vary" && n.step > 0 && (n.step % 8) === 6) continue;
            // CUMULATIVE EVOLUTION: the cycle repeats every four loops, so
            // without this loop 0 and loop 4 are identical and the Rule of 3
            // is broken on a longer timescale. Each time around differs.
            const cyc = Math.floor(L/4);
            if(cyc > 0 && n.step > 0){
              if(cyc % 2 === 1){ const m2 = Math.min(50, midi+12); if(m2!==midi) midi = m2; }
              else if(step + 1 < 16) step = step + 1;
            }
            out2.push({ bar, step, midi, dur:n.dur, vel:0.85 });
          }
        }
        bs2.notes = out2;
        flipInfo = flipInfo || {};
        flipInfo.bass = { rhythmFrom: rb.rhythmFrom, contourFrom: rb.contourFrom };
      }
    }
  }
  const themeLog = developTheme(session.parts, plan.sections, chart, rng);
  const finalCorrections = ghostPass(session.parts, chart);
  // THE GROOVE goes on last — it is a PERFORMANCE layer (timing and dynamics),
  // so it never disturbs the pitch physics the ghost just settled.
  const groove = makeGroove(chart, rng);
  const grooveInfo = applyGroove(session.parts, chart, groove, rng);
  session.chart = coreChart;   // expose the core chart so material can be harvested
  return { chart, session, arrangement:plan.sections, entries:plan.entries,
           style:plan.style, themeLog, finalCorrections,
           groove, grooveInfo, grooveText:describeGroove(groove), flipInfo,
           parts:session.parts, order:session.order };
}

/* per-section arrangement. THE ENTRANCES ARE NOT BAKED IN: they derive from the
   session's improvisation order — whoever started plays first; the rest enter
   at soft phrase boundaries (8-bar default, 4 softer), sometimes clustered,
   sometimes everyone at once (a drop start). The gathering style is a soft
   seeded choice. Then the documented loop rules apply:
   · 2-LOOP RULE: consecutive sections must differ (add/remove/expression)
   · RULE OF 3: no lineup persists 3 sections unchanged
   · 8-BAR ESCAPE: mid-song low-end strip for tension → release
   · the FOCAL (usually the starter) sometimes gets featured late (a solo). */
function arrangeSections(chart, session, rng){
  const unit = chart.phraseUnit || 8;
  const parts = session.parts;
  // group parts by the engine entry that produced them (from the real steps)
  const groups=[]; let gidx=0;
  session.steps.forEach(st=>{ const n=st.produced||0;
    if(n>0){ groups.push({engine:st.engine, parts:parts.slice(gidx,gidx+n)}); gidx+=n; } });
  // GATHERING STYLE — soft: trickle in / cluster / everyone at once.
  // Spacing is measured in LOOPS: the default gap is ONE loop (the precise
  // amount), a HALF loop is the "sooner" option, and EVERYONE is in within two
  // loops — a band assembles fast; it does not dribble in over half the song.
  const loop = chart.loopBars || 8;
  const style = wpick(rng, [["trickle",4],["cluster",3],["allin",2]]);
  const half=loop/2;
  const maxEntry = Math.min(2*loop, Math.max(half, Math.floor((chart.nBars*0.35)/half)*half));
  // THE BUSY-INTRO RULE: a starter may hold the intro alone only if its loop is
  // actually full. A sparse line alone is noise — if the starter is thin, the
  // next group comes in at the half-loop instead of waiting a whole loop.
  const starterOnsets = groups.length ? groups[0].parts.reduce((s,pt)=>s+pt.notes.length,0)
        / Math.max(1,chart.nBars) : 0;
  const starterBusy = starterOnsets >= 2.5;               // ≥ ~2.5 onsets/bar carries a solo
  const entries={};
  let bar=0;
  groups.forEach((g,gi)=>{
    g.parts.forEach(pt=>entries[pt.name]=Math.min(bar, maxEntry));
    if(style!=="allin" && gi<groups.length-1){
      const secsPerBar = 4*(60/(chart.tempo||90));
      const maxSoloBars = Math.max(2, Math.floor(9/secsPerBar));   // ~9s ceiling
      // gaps shrink as the band assembles; nobody waits four groups deep
      let step = starterBusy ? loop/4 : loop/8;
      if(gi>0) step = loop/8;
      step = Math.min(step, maxSoloBars);
      step = Math.max(1, Math.round(step));
      if(style==="cluster" && rng()<0.45) step=0;        // next group joins together
      bar = Math.min(bar+step, maxEntry);
    }
  });
  if(style==="allin") Object.keys(entries).forEach(k=>entries[k]=0);
  // the kit is not something a listener waits eight bars for
  for(const pt of parts) if(pt.role==="drums" && entries[pt.name]>loop/2)
    entries[pt.name]=Math.round(loop/2);

  const roles=[...new Set(parts.map(pt=>pt.role))];
  const roleEntry={}; parts.forEach(pt=>{ const e=entries[pt.name]??0;
    roleEntry[pt.role]=Math.min(roleEntry[pt.role]??1e9, e); });

  const spansS=chart._sectionSpans;
  const out=[];
  let dropped=false, momentDone=false, atMaxFor=0, prevActive=null, prevEvent="";
  for(let i=0;i<spansS.length;i++){
    const sec=spansS[i];
    const entered=roles.filter(r=>(roleEntry[r]??0) < sec.endBar);
    const pos=i/Math.max(1,spansS.length-1);
    let active, event, lift=false;
    if(i===0){
      // the opening is a CHOICE, not an accident of who has arrived: keep the
      // starter and at most one companion, so there is somewhere to build to.
      // TWO OR THREE ELEMENTS, never one alone. A single sparse part is the
      // thing that makes an intro sound like nothing is happening.
      const starter = entered[0];
      const keep = [starter];
      const order2 = ["drums","harmony","bass","lead","pad","arp","counter"];
      for(const want of order2){
        if(keep.length >= 3) break;
        if(want!==starter && entered.includes(want)) keep.push(want);
      }
      if(keep.length < 2){
        const soon = roles.filter(r=>r!==starter)
                          .sort((a,c)=>(roleEntry[a]??99)-(roleEntry[c]??99));
        if(soon.length) keep.push(soon[0]);
      }
      // AND THEY ACTUALLY SOUND: if a part is in the opening it starts at bar
      // one. Listing it as active while its entrance still gates it is how the
      // first bars ended up as one instrument alone.
      for(const r of keep){
        roleEntry[r] = 0;
        for(const pt of parts) if(pt.role===r) entries[pt.name]=0;
      }
      active = keep; event="open";
    } else if(!dropped){
      const grew = entered.length > prevActive.length;
      if(grew){ active=entered.slice(); event="build"; }          // arrivals ARE the build
      else if(prevActive.length < entered.length){ active=entered.slice(); event="build"; }
      else if(atMaxFor<1 || pos<=0.35 || spansS.length-i<2 || momentDone){
        active=entered.slice(); event="peak"; atMaxFor++;
        if(atMaxFor>=2) lift=!(out[i-1]&&out[i-1].lift);          // held peak: expression change
      } else if(rng()<0.8){
        // THE DROP: back to just the chords — because everyone was in
        active=entered.filter(r=>r==="harmony"||r==="pad");
        if(!active.length) active=[entered[0]];
        dropped=true; event="drop";
      } else { active=entered.slice(); event="peak"; atMaxFor++; }
    } else if(!momentDone){
      if(prevEvent==="drop" && spansS.length-i>1){
        // REBUILD: the rhythm section returns first (the release of the low end)
        active=entered.filter(r=>r==="harmony"||r==="pad"||r==="bass"||r==="drums");
        event="rebuild";
      } else {
        active=entered.slice(); lift=true; event="moment"; momentDone=true;  // THE PAYOFF
      }
    } else {
      if(sec.role==="coda" || (i===spansS.length-1 && rng()<0.4)){
        active=entered.filter(r=>!["arp","lead2","counter"].includes(r)); event="out";
      } else { active=entered.slice(); event="peak";
        lift=!(out[i-1]&&out[i-1].lift); }
    }
    if(sec.role==="bridge") active=active.filter(r=>r!=="arp");
    out.push({ ...sec, activeRoles:active, lift, event,
      tension:event==="drop", tensionHalf:(event==="drop" && chart.nBars<40),
      energy: active.length + (lift?0.5:0),
      keyShift: sec.contrast ? pick(rng,[5,-2,3]) : 0 });
    prevActive=active; prevEvent=event;
  }

  // 2-LOOP RULE + RULE OF 3 enforcement (add / remove / expression)
  const sig=a=>a.activeRoles.slice().sort().join("+")+(a.lift?"^":"");
  for(let i=1;i<out.length;i++){
    if(sig(out[i])===sig(out[i-1])){
      const cur=new Set(out[i].activeRoles);
      const entered=roles.filter(r=>(roleEntry[r]??0)<=out[i].startBar);
      const resting=entered.filter(r=>!cur.has(r));
      const colors=out[i].activeRoles.filter(r=>["pad","arp","counter","lead2"].includes(r));
      if(resting.length && (rng()<0.6 || !colors.length)){
        out[i].activeRoles = out[i].activeRoles.concat([pick(rng,resting)]);
      } else if(colors.length){
        const drop=pick(rng,colors);
        out[i].activeRoles = out[i].activeRoles.filter(r=>r!==drop);
      } else { out[i].lift = !out[i-1].lift; }
      if(sig(out[i])===sig(out[i-1])) out[i].lift = !out[i-1].lift;
    }
  }
  return { sections:out, entries, style };
}
