"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   THE SLICER — drop in a (copyright-free) recording, find its transients, cut
   it into slices, and let the drum engine play them instead of the synth kit.
   This is what a breakbeat slicer is, and it makes the jungle genre's
   "amen slicer" identity literal rather than aspirational.

   Grounded in the onset-detection literature:
   · SPECTRAL FLUX (Dixon, "Onset Detection Revisited", DAFx 2006): take the
     STFT, and sum only the POSITIVE frame-to-frame magnitude differences —
     onsets are energy APPEARING, so decreases are half-wave rectified away.
   · ADAPTIVE THRESHOLD: a peak counts only when it rises a set number of
     standard deviations above the LOCAL running mean, which keeps detection
     working through quiet and loud passages alike.
   · ENERGY FLUX (Klapuri): RMS first-differences, no FFT — roughly 10x faster
     and better on strongly percussive material, which breakbeats are. We blend
     both, weighted toward energy for drums.
   · MINIMUM PEAK DISTANCE: transients closer than a musical minimum are the
     same hit; the constraint prevents double-triggering.

   Nothing about the source material is baked in: the slice count, the slice
   boundaries and their classification all emerge from the audio itself.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── a small in-place radix-2 FFT (real input, magnitude out) ── */
function fftMag(re, im, mag){
  const n = re.length;
  for(let i=1, j=0; i<n; i++){
    let bit = n >> 1;
    for(; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if(i < j){ let t=re[i]; re[i]=re[j]; re[j]=t; t=im[i]; im[i]=im[j]; im[j]=t; }
  }
  for(let len=2; len<=n; len<<=1){
    const ang = -2*Math.PI/len, wr = Math.cos(ang), wi = Math.sin(ang);
    for(let i=0; i<n; i+=len){
      let cr = 1, ci = 0;
      for(let k=0; k<len/2; k++){
        const ur = re[i+k],        ui = im[i+k];
        const vr = re[i+k+len/2]*cr - im[i+k+len/2]*ci;
        const vi = re[i+k+len/2]*ci + im[i+k+len/2]*cr;
        re[i+k] = ur+vr;      im[i+k] = ui+vi;
        re[i+k+len/2] = ur-vr; im[i+k+len/2] = ui-vi;
        const ncr = cr*wr - ci*wi; ci = cr*wi + ci*wr; cr = ncr;
      }
    }
  }
  for(let i=0; i<n/2; i++) mag[i] = Math.hypot(re[i], im[i]);
}

/* ── detect onsets in a mono Float32Array ── */
function decimate(x, sampleRate, target){
  const factor = Math.max(1, Math.floor(sampleRate/target));
  if(factor === 1) return { y:x, rate:sampleRate, factor:1 };
  const n = Math.floor(x.length/factor);
  const y = new Float32Array(n);
  for(let i=0;i<n;i++){                        // box average = crude anti-alias
    let s=0; for(let k=0;k<factor;k++) s += x[i*factor+k] || 0;
    y[i] = s/factor;
  }
  return { y, rate:sampleRate/factor, factor };
}

function detectOnsets(xFull, sampleRateFull, opts){
  opts = opts || {};
  // ADAPTIVE ANALYSIS RATE. Decimation is what makes a multi-minute record
  // practical, but it is a low-pass: taken too far it erases cymbal and hi-hat
  // transients entirely (they live at 5-12 kHz). So short material is analysed
  // at full rate, and only long files are decimated — and never below 22 kHz,
  // which still passes the top of a hi-hat.
  const durSec = xFull.length / sampleRateFull;
  const target = opts.analysisRate || (durSec > 25 ? 22050 : sampleRateFull);
  const dec = decimate(xFull, sampleRateFull, target);
  const x = dec.y, sampleRate = dec.rate;
  const N = opts.fftSize || 1024;
  const hop = opts.hop || Math.max(64, Math.round(sampleRate/344));   // ~2.9 ms
  const sensitivity = opts.sensitivity != null ? opts.sensitivity : 0.5;
  const minGapSec = opts.minGap != null ? opts.minGap : 0.045;
  const frames = Math.max(1, Math.floor((x.length - N) / hop));

  const re = new Float32Array(N), im = new Float32Array(N);
  const mag = new Float32Array(N/2), prev = new Float32Array(N/2);
  const win = new Float32Array(N);
  for(let i=0;i<N;i++) win[i] = 0.5 - 0.5*Math.cos(2*Math.PI*i/(N-1));   // Hann

  const flux = new Float32Array(frames);
  const energy = new Float32Array(frames);
  for(let f=0; f<frames; f++){
    const off = f*hop;
    let rms = 0;
    for(let i=0;i<N;i++){
      const s = x[off+i] || 0;
      re[i] = s*win[i]; im[i] = 0; rms += s*s;
    }
    energy[f] = Math.sqrt(rms/N);
    fftMag(re, im, mag);
    let sum = 0;
    for(let i=0;i<N/2;i++){
      const d = mag[i] - prev[i];
      if(d > 0) sum += d;                       // half-wave rectified: onsets only
      prev[i] = mag[i];
    }
    flux[f] = sum;
  }
  // energy flux (first differences), blended in — percussive material benefits
  const eflux = new Float32Array(frames);
  for(let f=1; f<frames; f++) eflux[f] = Math.max(0, energy[f]-energy[f-1]);
  // normalise both, then blend
  const nrm = a => { let m=0; for(const v of a) if(v>m) m=v; 
                     if(m>0) for(let i=0;i<a.length;i++) a[i]/=m; };
  nrm(flux); nrm(eflux);
  const od = new Float32Array(frames);
  for(let f=0; f<frames; f++) od[f] = 0.55*flux[f] + 0.45*eflux[f];

  // ADAPTIVE THRESHOLD: local mean + k * local standard deviation
  const W = Math.max(4, Math.round(0.25*sampleRate/hop));   // ~250 ms window
  const k = 0.6 + (1-sensitivity)*2.2;
  const peaks = [];
  const minGapFrames = Math.max(1, Math.round(minGapSec*sampleRate/hop));
  let lastPeak = -1e9;
  for(let f=1; f<frames-1; f++){
    const a = Math.max(0,f-W), b = Math.min(frames,f+W);
    let mean=0; for(let i=a;i<b;i++) mean+=od[i]; mean/=(b-a);
    let vr=0; for(let i=a;i<b;i++){ const d=od[i]-mean; vr+=d*d; } vr=Math.sqrt(vr/(b-a));
    const thresh = mean + k*vr;
    if(od[f] > thresh && od[f] >= od[f-1] && od[f] >= od[f+1] && f-lastPeak >= minGapFrames){
      peaks.push(f); lastPeak = f;
    }
  }
  // REFINE to sample accuracy. An STFT frame reports a rise as soon as its
  // window starts to overlap the transient, so a raw frame index can sit up to
  // one window (~23 ms) early. Search the raw signal around the frame for the
  // steepest short-term energy rise, then back off a hair to keep the attack.
  const refine = (f) => {
    const start = Math.max(0, f*hop - N);
    const end   = Math.min(x.length-1, f*hop + N);
    const w = Math.max(8, Math.round(0.001*sampleRate));    // 1 ms envelope step
    let best = f*hop, bestRise = -Infinity;
    for(let i=start+w; i+w<end; i+=Math.max(1, w>>2)){
      let a=0,b=0;
      for(let k=0;k<w;k++){ a += Math.abs(x[i-w+k]||0); b += Math.abs(x[i+k]||0); }
      const rise = b-a;
      if(rise > bestRise){ bestRise = rise; best = i; }
    }
    return Math.max(0, best - Math.round(0.002*sampleRate));  // 2 ms of pre-attack
  };
  const onsets = [];
  for(const f of peaks){
    const p = refine(f);
    if(!onsets.length || p - onsets[onsets.length-1] >= minGapFrames*hop*0.5) onsets.push(p);
  }
  // map positions back to the ORIGINAL sample rate
  for(let i=0;i<onsets.length;i++) onsets[i] = Math.round(onsets[i]*dec.factor);
  if(!onsets.length || onsets[0] > sampleRateFull*0.05) onsets.unshift(0);
  return onsets;
}

/* ── estimate the record's tempo by autocorrelating its onset positions.
   Jazz swings and rushes, so this is a best estimate, not gospel — but it is
   what a beat-grid chop needs to line up. ── */
function estimateTempo(onsets, sampleRate, lo, hi){
  lo = lo || 60; hi = hi || 200;
  if(onsets.length < 4) return null;
  // build a coarse onset-strength train and autocorrelate it
  const res = 100;                                   // 10 ms bins
  const dur = onsets[onsets.length-1]/sampleRate;
  const n = Math.max(8, Math.ceil(dur*res));
  const env = new Float32Array(n);
  for(const o of onsets){ const i=Math.floor(o/sampleRate*res); if(i<n) env[i]+=1; }
  let best=null, bestScore=-1;
  for(let bpm=lo; bpm<=hi; bpm+=0.25){
    const lag = (60/bpm)*res;
    let score=0, cnt=0;
    for(let i=0;i<n;i++){
      const j=i+lag, j0=Math.floor(j), fr=j-j0;
      if(j0+1>=n) break;
      score += env[i]*(env[j0]*(1-fr)+env[j0+1]*fr); cnt++;
    }
    if(cnt){ score/=Math.sqrt(cnt);
      if(score>bestScore){ bestScore=score; best=bpm; } }
  }
  // fold into a musical range
  if(best){ while(best<70) best*=2; while(best>180) best/=2; }
  return best ? Math.round(best*10)/10 : null;
}

/* ── GRID CHOP: cut into equal musical divisions instead of at transients.
   This is how a jazz record is actually chopped — you take a few bars and
   slice them into beats or sixteenths, then replay them in a new order. ── */
function gridSlices(mono, sampleRate, bpm, opts){
  opts = opts || {};
  const div = opts.div || 4;                        // slices per beat
  const from = Math.max(0, Math.round((opts.startSec||0)*sampleRate));
  const to   = Math.min(mono.length, opts.lengthSec ? from+Math.round(opts.lengthSec*sampleRate) : mono.length);
  const step = (60/bpm)/div*sampleRate;
  const out=[];
  for(let p=from; p+step<=to; p+=step){
    const a=Math.round(p), b=Math.round(p+step);
    out.push(analyseSlice(mono, a, b, sampleRate));
  }
  return out;
}


/* ═══════════════════════════════════════════════════════════════════════════
   SMART CHOPPING — a musical grid, but cut where the music actually cuts.
   A blind grid divides time evenly and lands wherever it lands: measured on a
   phrase that drifts a few milliseconds off the beat (as every real player
   does) its chops begin mid-note, with no attack at the start. That is why a
   blind chop only survives being played fast — a short hit hides the missing
   transient, a long melodic chop exposes it.

   So: take the grid for its rhythm, then SNAP each boundary to the nearest
   real onset within a tolerance, and finally slide to the nearest ZERO
   CROSSING so the cut itself is silent instead of a click.
   ═══════════════════════════════════════════════════════════════════════════ */

/* move a cut to the nearest zero crossing so it does not click */
function alignZeroCrossing(mono, pos, searchSamples){
  const w = searchSamples || 128;
  const lo = Math.max(1, pos-w), hi = Math.min(mono.length-1, pos+w);
  let best = pos, bestScore = Infinity;
  for(let i=lo; i<hi; i++){
    const a = mono[i-1], b = mono[i];
    if((a<=0 && b>=0) || (a>=0 && b<=0)){        // a crossing
      const d = Math.abs(i-pos) + Math.abs(b)*1000;   // near, and truly quiet
      if(d < bestScore){ bestScore = d; best = i; }
    }
  }
  return best;
}

/* score one chop: does it BEGIN on an attack, and is the cut itself quiet? */
function scoreChop(mono, from, to, sampleRate){
  const n = to-from;
  if(n < 32) return { attack:0, cut:1, score:0 };
  let cut=0; for(let i=0;i<32;i++) cut += Math.abs(mono[from+i]||0); cut/=32;
  const w = Math.min(Math.round(sampleRate*0.015), n);
  let a=0; for(let i=0;i<w;i++) a += Math.abs(mono[from+i]||0); a/=(w||1);
  let m=0; for(let i=0;i<n;i++) m += Math.abs(mono[from+i]||0); m/=n;
  const attack = m>0 ? a/m : 0;
  return { attack, cut, score: attack - cut*4 };
}

/* THE SMART CHOP.
   The first attempt snapped a 16th-note grid to nearby onsets and barely
   helped: on melodic material most grid lines fall BETWEEN notes, so there is
   nothing to snap to and two thirds of the cuts still landed mid-note. Drums
   survive a blind grid precisely because they have a transient nearly
   everywhere; a piano phrase does not.

   So the notes lead and the clock follows. Real onsets are the cuts. Each is
   quantised toward the grid only if that barely moves it (rhythm without
   damage), long gaps are subdivided so a chop never runs on forever, and every
   boundary lands on a zero crossing so the cut itself is silent. */
function smartSlices(mono, sampleRate, bpm, opts){
  opts = opts || {};
  const from = Math.max(0, Math.round((opts.startSec||0)*sampleRate));
  const to = Math.min(mono.length, opts.lengthSec
    ? from+Math.round(opts.lengthSec*sampleRate) : mono.length);
  const beat = (60/bpm)*sampleRate;

  const onsets = detectOnsets(mono.subarray(from,to), sampleRate, opts).map(o=>o+from);
  // how densely does this material actually play? that sets the division —
  // chopping a quarter-note phrase into sixteenths is what caused blind cuts.
  let div = opts.div || 0;
  if(!div){
    const gaps=[];
    for(let i=1;i<onsets.length;i++) gaps.push(onsets[i]-onsets[i-1]);
    gaps.sort((a,b)=>a-b);
    const med = gaps.length ? gaps[gaps.length>>1] : beat;
    div = Math.max(1, Math.min(4, Math.round(beat/Math.max(med,1))));
  }
  const step = beat/div;
  const quantTol = step*0.18;              // tighten only if it barely moves

  let cuts = [];
  for(const o of onsets){
    // quantise toward the grid, but never drag a note off its own attack
    const g = from + Math.round((o-from)/step)*step;
    let pos = (Math.abs(g-o) <= quantTol) ? Math.round(g) : o;
    pos = alignZeroCrossing(mono, pos, 64);
    if(!cuts.length || pos-cuts[cuts.length-1] > sampleRate*0.02) cuts.push(pos);
  }
  // fill gaps longer than two divisions so a chop is never unusably long
  const filled=[];
  for(let i=0;i<cuts.length;i++){
    filled.push(cuts[i]);
    const next = (i+1<cuts.length)? cuts[i+1] : to;
    let gap = next-cuts[i];
    if(gap > step*2){
      const nSub = Math.floor(gap/step);
      for(let k=1;k<nSub;k++){
        const p = alignZeroCrossing(mono, Math.round(cuts[i]+k*step), 160);
        if(p-filled[filled.length-1] > sampleRate*0.02 && next-p > sampleRate*0.02) filled.push(p);
      }
    }
  }
  cuts = filled;
  if(!cuts.length || cuts[0] > from + sampleRate*0.02) cuts.unshift(from);

  const out=[];
  for(let i=0;i<cuts.length;i++){
    const a = cuts[i], b = (i+1<cuts.length)? cuts[i+1] : to;
    if(b-a < sampleRate*0.012) continue;
    const sl = analyseSlice(mono, a, b, sampleRate);
    const q = scoreChop(mono, a, b, sampleRate);
    sl.attack=q.attack; sl.cut=q.cut; sl.quality=q.score;
    sl.onNote = onsets.some(o=>Math.abs(o-a) <= sampleRate*0.02);
    out.push(sl);
  }
  out._div = div;
  out._onNote = out.filter(s=>s.onNote).length;
  return out;
}


/* ═══════════════════════════════════════════════════════════════════════════
   THE PAD BANK, AND THE FLIP.
   What I had wrong: I was cutting a record into as many pieces as it had
   transients — 27, 51, whatever fell out — and replaying them in source order.
   That is not sampling, it is reconstruction with extra steps.

   The machines that defined this say otherwise. The SP-1200 held 10.7 seconds
   across EIGHT pads; the MPC gives you sixteen, and its Region mode divides a
   sample into 4, 8 or 16 equal slices. A bank is small on purpose. And the
   musical act — the FLIP — is playing those pads back in a NEW order and a new
   rhythm: "cutting strips of the Mona Lisa apart and gluing it back together."
   Dilla's habit of chopping so each slice STARTS on a kick or snare is the
   other half: in a full mix the drum transient is the honest cut point.
   ═══════════════════════════════════════════════════════════════════════════ */

/* divide a window into a PAD BANK of n slices, each nudged to the nearest real
   transient and landing on a zero crossing */
function padBank(mono, sampleRate, opts){
  opts = opts || {};
  const n = opts.pads || 16;
  const from = Math.max(0, Math.round((opts.startSec||0)*sampleRate));
  const to = Math.min(mono.length, opts.lengthSec
    ? from+Math.round(opts.lengthSec*sampleRate) : mono.length);
  const span = to-from;
  if(span < sampleRate*0.1) return [];
  const step = span/n;
  const onsets = detectOnsets(mono.subarray(from,to), sampleRate, opts).map(o=>o+from);
  const tol = step*0.35;                       // a pad may hunt for its transient

  const cuts=[];
  for(let i=0;i<n;i++){
    let pos = Math.round(from + i*step);
    let best=-1, bestD=Infinity;
    for(const o of onsets){ const d=Math.abs(o-pos);
      if(d<bestD && d<=tol){ bestD=d; best=o; } }
    if(best>=0) pos=best;
    pos = alignZeroCrossing(mono, pos, 96);
    if(!cuts.length || pos-cuts[cuts.length-1] > step*0.25) cuts.push(pos);
  }
  const out=[];
  for(let i=0;i<cuts.length;i++){
    const a=cuts[i], b=(i+1<cuts.length)?cuts[i+1]:to;
    if(b-a < sampleRate*0.012) continue;
    const sl=analyseSlice(mono,a,b,sampleRate);
    const q=scoreChop(mono,a,b,sampleRate);
    sl.pad=out.length; sl.attack=q.attack; sl.cut=q.cut; sl.quality=q.score;
    sl.onNote = onsets.some(o=>Math.abs(o-a)<=sampleRate*0.02);
    out.push(sl);
  }
  out._onNote = out.filter(s=>s.onNote).length;
  out._pads = out.length;
  return out;
}

/* THE FLIP — a composed pad pattern, not the source order.
   Keeps the downbeat recognisable (pad 0 on beat 1 is what tells the ear which
   record this is), then rearranges the rest: repeats, stutters, a held pad,
   and pads pulled from elsewhere in the bank. Seeded, so a flip is repeatable. */
/* THE THREE FLIPS, from three documented approaches:
   · DILLA  — hand-played and unquantised, "like a drunk toddler drumming".
     Sparse, held pads, timing dragged off the grid, tiny pitch drift.
   · DAFT   — slice at each bar or beat and REORDER: High Life is a one-beat /
     one-beat / two-beat pattern. Repetition in pairs, then a plain loop.
   · APHEX  — drill'n'bass: computer-arranged breakbeat programming and
     timestretched samples, fragmented at a density no hand could play.
   Style changes WHAT the pattern is, not just its randomness. */
function makeFlip(nPads, steps, rng, style){
  const r = rng || (()=>Math.random());
  if(style==="dilla"){
    // few events, held pads, and a lazy drift: the note is late on purpose
    const pat=[];
    let cur=0;
    for(let i=0;i<steps;i++){
      if(i===0) cur=0;
      else if(i%4===0) cur=(cur+1+Math.floor(r()*2))%nPads;
      else if(r()<0.75) { pat.push(-1); continue; }        // -1 = leave it alone
      else cur=(cur+(r()<0.5?1:-1)+nPads)%nPads;
      pat.push(cur);
    }
    pat._drag = true;
    return pat;
  }
  if(style==="daft"){
    // beat-length blocks reordered, each block repeated: 1,1,2 phrasing
    const pat=[]; const blocks=[];
    for(let b2=0;b2<4;b2++) blocks.push(Math.floor(r()*nPads));
    for(let i=0;i<steps;i++){
      const block=blocks[Math.floor(i/(steps/4))%blocks.length];
      const within=Math.floor(i%(steps/4));
      pat.push((block+ (within<2?0:1)) % nPads);            // one, one, then two
    }
    return pat;
  }
  if(style==="aphex"){
    // dense fragmentation: rapid retrigger bursts and jumps, machine-fast
    const pat=[]; let cur=0;
    for(let i=0;i<steps;i++){
      const roll=r();
      if(roll<0.30) cur=Math.floor(r()*nPads);              // jump
      else if(roll<0.62) cur=(cur+1)%nPads;                 // ratchet upward
      else if(roll<0.80) { /* hold: a retrigger burst */ }
      else cur=(cur+nPads-1)%nPads;
      pat.push(cur);
    }
    pat._burst = true;
    return pat;
  }
  const pattern=[];
  for(let i=0;i<steps;i++){
    let pad;
    if(i===0) pad=0;                                    // land on the downbeat
    else if(i % (steps/2) === 0) pad = Math.floor(nPads/2) % nPads;
    else {
      const prev = pattern[i-1];
      const roll = r();
      if(roll<0.30) pad = prev + 1;                     // carry on from where we are
      else if(roll<0.50) pad = prev;                    // repeat: the stutter
      else if(roll<0.66) pad = prev - 1;                // step back
      else if(roll<0.80) pad = prev + 2 + Math.floor(r()*3);
      else pad = Math.floor(r()*nPads);                 // jump somewhere new
    }
    pattern.push(((pad%nPads)+nPads)%nPads);
  }
  return pattern;
}

/* ── TIME STRETCH (WSOLA) — change tempo WITHOUT changing pitch.
   Varispeed (playbackRate) moves pitch and time together: that is the classic
   sampler sound and is often what you want. But fitting a 96 bpm record under
   a 90 bpm track by varispeed detunes it by a semitone. Both tools are needed.
   WSOLA: overlap-add, but each grain's position is nudged to where it best
   correlates with what has already been written, which keeps waveforms in
   phase and avoids the comb-filtering of naive OLA. ── */
function timeStretch(mono, ratio, sampleRate, opts){
  opts = opts || {};
  if(Math.abs(ratio-1) < 0.001) return mono.slice();
  // Prefer SoundTouchJS (LGPL) when it is present: measured against the WSOLA
  // below on a harmonic tone it holds pitch tighter (0.0-0.3 cents vs 0.3-1.0)
  // and leaves 5-6 dB less noise at moderate stretches. The WSOLA remains as a
  // fallback so the analysis never depends on the library being there.
  const ST = (typeof SoundTouch!=="undefined") ? SoundTouch
           : (typeof globalThis!=="undefined" && globalThis.SoundTouch);
  const SF = (typeof SimpleFilter!=="undefined") ? SimpleFilter
           : (typeof globalThis!=="undefined" && globalThis.SimpleFilter);
  if(ST && SF && !opts.forceWsola){
    try{
      // pad with silence so the filter can drain its tail, then trim to length
      const pad = Math.round(sampleRate*0.25);
      const src = new Float32Array(mono.length + pad);
      src.set(mono, 0);
      const st = new ST();
      st.tempo = 1/ratio;                       // tempo>1 = faster = shorter
      const source = { extract:(target, numFrames, position)=>{
        const avail = Math.max(0, Math.min(numFrames, src.length-position));
        for(let i=0;i<numFrames;i++){
          const v = (position+i < src.length) ? src[position+i] : 0;
          target[i*2] = v; target[i*2+1] = v;
        }
        return avail; } };
      const filt = new SF(source, st);
      const want = Math.round(mono.length*ratio);
      const out = new Float32Array(want);
      const buf = new Float32Array(4096*2);
      let w = 0, guard = 0, got;
      while(w < want && guard++ < 100000 && (got = filt.extract(buf, 4096)) > 0){
        for(let i=0;i<got && w<want;i++) out[w++] = buf[i*2];
      }
      if(w > want*0.9) return out;              // good enough; otherwise fall through
    }catch(e){ /* fall back to the WSOLA below */ }
  }
  const N = opts.frame || Math.round(sampleRate*0.06);   // ~60 ms grain
  const Ha = Math.round(N/2);                            // analysis hop
  const Hs = Math.round(Ha*ratio);                       // synthesis hop
  const seek = opts.seek || Math.round(sampleRate*0.01); // ±10 ms hunt
  const outLen = Math.ceil(mono.length*ratio)+N;
  const out = new Float32Array(outLen);
  const norm = new Float32Array(outLen);
  const win = new Float32Array(N);
  for(let i=0;i<N;i++) win[i] = 0.5-0.5*Math.cos(2*Math.PI*i/(N-1));

  let inPos=0, outPos=0;
  while(inPos+N+seek < mono.length && outPos+N < outLen){
    // find the input offset whose overlap best matches what is already written
    let bestOff=0, bestCorr=-Infinity;
    if(outPos>0){
      const ov=Math.min(N-Hs, Ha);
      for(let off=-seek; off<=seek; off+=8){
        const p=inPos+off; if(p<0||p+ov>=mono.length) continue;
        let c=0;
        for(let i=0;i<ov;i+=4) c += mono[p+i]*out[outPos+i];
        if(c>bestCorr){ bestCorr=c; bestOff=off; }
      }
    }
    const src=Math.max(0,inPos+bestOff);
    for(let i=0;i<N && src+i<mono.length && outPos+i<outLen;i++){
      out[outPos+i]  += mono[src+i]*win[i];
      norm[outPos+i] += win[i];
    }
    inPos += Ha; outPos += Hs;
  }
  for(let i=0;i<outLen;i++) if(norm[i]>0.001) out[i]/=norm[i];
  return out;
}


/* ═══════════════════════════════════════════════════════════════════════════
   BEAT AND DOWNBEAT TRACKING.
   Autocorrelation alone gives a tempo but not a PHASE — it knows how fast the
   record is, not where the beats fall, and certainly not which beat is one.
   That is why chops could land on the wrong beat of the bar.

   This is Ellis's dynamic-programming beat tracker (Daniel P.W. Ellis, "Beat
   Tracking by Dynamic Programming", J. New Music Research 2007), the algorithm
   behind librosa.beat and the family BTrack belongs to: build an onset-strength
   envelope, estimate the period, then choose the beat sequence that maximises
   onset strength while staying regular, via a single backward pass.

   Downbeat is then a PHASE choice: bar one is where the low end lands and
   where the harmony changes, so each candidate phase is scored on both.
   ═══════════════════════════════════════════════════════════════════════════ */

/* onset-strength envelope at a fixed frame rate, plus a low-band copy (kicks) */
function onsetEnvelope(mono, sampleRate, opts){
  opts = opts || {};
  const dec = decimate(mono, sampleRate, 11025);
  const x = dec.y, sr = dec.rate;
  const N = 512, hop = 128;                        // ~11.6 ms frames at 11 kHz
  const frames = Math.max(1, Math.floor((x.length-N)/hop));
  const re=new Float32Array(N), im=new Float32Array(N), mag=new Float32Array(N/2);
  const prev=new Float32Array(N/2);
  const win=new Float32Array(N);
  for(let i=0;i<N;i++) win[i]=0.5-0.5*Math.cos(2*Math.PI*i/(N-1));
  const env=new Float32Array(frames), low=new Float32Array(frames);
  const loBin = Math.max(1, Math.floor(150/(sr/N)));
  for(let f=0; f<frames; f++){
    const off=f*hop;
    for(let i=0;i<N;i++){ re[i]=(x[off+i]||0)*win[i]; im[i]=0; }
    fftMag(re, im, mag);
    let s=0, l=0;
    for(let i=1;i<N/2;i++){
      const d=mag[i]-prev[i];
      if(d>0){ s+=d; if(i<=loBin) l+=d; }
      prev[i]=mag[i];
    }
    env[f]=s; low[f]=l;
  }
  const nrm=a=>{ let m=0; for(const v of a) if(v>m) m=v; if(m>0) for(let i=0;i<a.length;i++) a[i]/=m; };
  nrm(env); nrm(low);
  return { env, low, rate: sr/hop, factor: dec.factor, hop, sr };
}

/* Ellis DP beat tracker: returns beat times in seconds */
function trackBeats(mono, sampleRate, opts){
  opts = opts || {};
  const O = onsetEnvelope(mono, sampleRate, opts);
  const env = O.env, fps = O.rate, n = env.length;
  if(n < 16) return { beats:[], bpm:null, downbeatPhase:0 };

  // tempo by autocorrelation of the envelope, weighted toward ~120 bpm
  const minP = Math.round(fps*60/200), maxP = Math.min(n-1, Math.round(fps*60/60));
  let bestP = minP, bestScore = -Infinity;
  for(let p=minP; p<=maxP; p++){
    let c=0;
    for(let i=0;i+p<n;i++) c += env[i]*env[i+p];
    const bpm = 60*fps/p;
    const w = Math.exp(-0.5*Math.pow(Math.log2(bpm/120)/0.9, 2));   // perceptual prior
    const sc = c*w/Math.sqrt(n-p);
    if(sc > bestScore){ bestScore = sc; bestP = p; }
  }
  // OCTAVE DISAMBIGUATION — "is there a beat between the beats?"
  // Autocorrelation locks onto whatever repeats most strongly, and on a
  // kick/snare pattern that is every TWO beats, so a fast record reads as half
  // speed. Comparing coverage does not settle it either: a denser grid always
  // covers more. The principled test is local — look at the MIDPOINTS between
  // the candidate beats. If they carry comparable onset energy, they are beats
  // too, and the true period is half. Applied at most twice.
  let period = bestP;
  for(let iter=0; iter<2; iter++){
    const half = period/2;
    if(half < 3 || 60*fps/half > 210) break;
    let on=0, onN=0, mid=0, midN=0;
    for(let t=0; t+half<n; t+=period){
      const a=Math.round(t), m=Math.round(t+half);
      for(let k=-1;k<=1;k++){
        on  += env[Math.max(0,Math.min(n-1,a+k))]||0;
        mid += env[Math.max(0,Math.min(n-1,m+k))]||0;
      }
      onN++; midN++;
    }
    const meanOn = onN? on/onN : 0, meanMid = midN? mid/midN : 0;
    if(meanOn>0 && meanMid/meanOn > 0.42) period = half;   // the midpoints are beats
    else break;
  }

  // dynamic programming: C(t) = env(t) + max_tau ( C(tau) + alpha*penalty )
  const alpha = opts.tightness != null ? opts.tightness : 100;
  const C = new Float32Array(n), back = new Int32Array(n).fill(-1);
  const lo = Math.max(1, Math.round(period*0.5)), hi = Math.round(period*2);
  for(let t=0; t<n; t++){
    let best = -Infinity, bi = -1;
    for(let d=lo; d<=hi; d++){
      const tau = t-d;
      if(tau < 0) break;
      const pen = -alpha*Math.pow(Math.log(d/period), 2);
      const v = C[tau] + pen;
      if(v > best){ best = v; bi = tau; }
    }
    if(bi < 0){ C[t] = env[t]; back[t] = -1; }
    else { C[t] = env[t] + best; back[t] = bi; }
  }
  // start the backtrace from a strong late peak
  let endT = n-1, endBest = -Infinity;
  for(let t=Math.floor(n*0.5); t<n; t++) if(C[t] > endBest){ endBest = C[t]; endT = t; }
  const idx=[];
  for(let t=endT; t>=0; t=back[t]){ idx.push(t); if(back[t]<0) break; }
  idx.reverse();
  const beats = idx.map(f=>f/fps);        // frames -> seconds
  return { beats, bpm: 60*fps/period, env:O, period, fps };
}

/* WHICH BEAT IS ONE. Bar one carries the low end and the harmony change, so
   score each of the four phases on both and take the winner. */
function findDownbeat(mono, sampleRate, beats, O, beatsPerBar){
  beatsPerBar = beatsPerBar || 4;
  if(!beats || beats.length < beatsPerBar*2) return 0;
  const low = O.low, fps = O.rate;
  const scores = new Array(beatsPerBar).fill(0);
  for(let phase=0; phase<beatsPerBar; phase++){
    let s=0, cnt=0;
    for(let i=phase; i<beats.length; i+=beatsPerBar){
      const f = Math.round(beats[i]*fps);
      // low-frequency energy in a short window after the beat: the kick
      let e=0; for(let k=0;k<4;k++) e += low[Math.min(low.length-1, f+k)]||0;
      s += e; cnt++;
    }
    scores[phase] = cnt ? s/cnt : 0;
  }
  let best=0; for(let i=1;i<beatsPerBar;i++) if(scores[i]>scores[best]) best=i;
  return best;
}

/* the whole picture: tempo, beat grid, and where bar one falls */
function analyseBeats(mono, sampleRate, opts){
  const t = trackBeats(mono, sampleRate, opts);
  if(!t.beats || !t.beats.length) return { bpm:null, beats:[], downbeats:[], phase:0 };
  const phase = findDownbeat(mono, sampleRate, t.beats, t.env, 4);
  const downbeats = [];
  for(let i=phase; i<t.beats.length; i+=4) downbeats.push(t.beats[i]);
  return { bpm: t.bpm, beats: t.beats, downbeats, phase,
           firstDownbeatSec: downbeats.length ? downbeats[0] : 0 };
}

/* ── classify a slice so drum lanes can be matched to it ──
   Low/mid/high by spectral centroid, plus length and peak level. */
function analyseSlice(x, from, to, sampleRate){
  // analyse the ATTACK — a percussive slice's timbre lives in its first few
  // milliseconds, and a long window on a short hit is mostly silence.
  const N = 512;                                   // ~11.6 ms at 44.1k
  const n = Math.min(to-from, N);
  const re = new Float32Array(N), im = new Float32Array(N), mag = new Float32Array(N/2);
  for(let i=0;i<N;i++){ const s = x[from+i]; re[i] = (i<n && s!=null) ? s : 0; im[i]=0; }
  fftMag(re, im, mag);
  // BAND ENERGY DENSITY, not raw sums: the high band spans ~100x more FFT bins
  // than the low band, so comparing raw totals would call everything "high".
  let num=0, den=0, lo=0, mid=0, hi=0, nlo=0, nmid=0, nhi=0;
  for(let i=1;i<N/2;i++){
    const f = i*sampleRate/N, m = mag[i];
    num += f*m; den += m;
    if(f < 150)       { lo  += m; nlo++;  }       // kick territory
    else if(f < 3000) { mid += m; nmid++; }       // snare/tom body
    else              { hi  += m; nhi++;  }
  }
  lo  = nlo  ? lo/nlo   : 0;
  mid = nmid ? mid/nmid : 0;
  hi  = nhi  ? hi/nhi   : 0;
  const centroid = den>0 ? num/den : 0;
  let peak=0, rms=0, cnt=0;
  for(let i=from;i<to;i++){ const s=Math.abs(x[i]||0); if(s>peak)peak=s; rms+=s*s; cnt++; }
  rms = cnt? Math.sqrt(rms/cnt) : 0;
  const total = lo+mid+hi || 1;
  let kind = "mid";
  if(lo >= mid && lo >= hi) kind = "low";
  else if(hi >= mid && hi > lo) kind = "high";
  return { from, to, centroid, peak, rms, kind,
           dur:(to-from)/sampleRate, lo:lo/total, mid:mid/total, hi:hi/total };
}

/* ── slice a whole buffer: onsets -> classified slices ── */
function sliceAudio(mono, sampleRate, opts){
  opts = opts || {};
  // WINDOW: records are minutes long but you only want a few bars of one.
  let src = mono, offset = 0;
  if(opts.startSec || opts.lengthSec){
    const a = Math.max(0, Math.round((opts.startSec||0)*sampleRate));
    const b = Math.min(mono.length, opts.lengthSec ? a+Math.round(opts.lengthSec*sampleRate) : mono.length);
    src = mono.subarray(a, b); offset = a;
  }
  const onsets = detectOnsets(src, sampleRate, opts);
  const slices = [];
  for(let i=0;i<onsets.length;i++){
    const from = onsets[i];
    const to = (i+1 < onsets.length) ? onsets[i+1] : src.length;
    if(to-from < sampleRate*0.01) continue;               // discard specks
    const sl = analyseSlice(src, from, to, sampleRate);
    sl.from += offset; sl.to += offset;
    slices.push(sl);
  }
  slices._tempo = estimateTempo(onsets, sampleRate);
  return slices;
}

/* ── map our drum lanes onto the material that actually suits them ──
   kick wants low slices, snare/clap mid, hats high; toms the longer lows.
   Returns a lane -> [slice indices] table built from the audio, not a preset. */
function mapLanesToSlices(slices){
  const byKind = { low:[], mid:[], high:[] };
  slices.forEach((s,i)=>byKind[s.kind].push(i));
  const pick = (kinds) => {
    for(const k of kinds) if(byKind[k].length) return byKind[k];
    return slices.map((_,i)=>i);
  };
  return {
    kick:        pick(["low","mid","high"]),
    snare:       pick(["mid","high","low"]),
    snare2:      pick(["mid","high","low"]),
    clap:        pick(["mid","high","low"]),
    sideStick:   pick(["high","mid","low"]),
    closedHat:   pick(["high","mid","low"]),
    pedalHat:    pick(["high","mid","low"]),
    openHat:     pick(["high","mid","low"]),
    ride:        pick(["high","mid","low"]),
    crash:       pick(["high","mid","low"]),
    lowFloorTom: pick(["low","mid","high"]),
    highFloorTom:pick(["low","mid","high"]),
    lowTom:      pick(["low","mid","high"]),
    lowMidTom:   pick(["mid","low","high"]),
    hiMidTom:    pick(["mid","low","high"]),
    highTom:     pick(["mid","high","low"]),
    shaker:      pick(["high","mid","low"]),
    tambourine:  pick(["high","mid","low"]),
    cowbell:     pick(["mid","high","low"]),
  };
}

if(typeof module!=="undefined") module.exports = {
  detectOnsets, sliceAudio, analyseSlice, mapLanesToSlices, fftMag,
  gridSlices, estimateTempo, decimate, smartSlices, alignZeroCrossing, scoreChop,
  padBank, makeFlip, timeStretch, trackBeats, findDownbeat, analyseBeats, onsetEnvelope
};
