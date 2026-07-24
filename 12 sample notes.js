"use strict";
/* ═══════════════════════════════════════════════════════════════════════════
   SAMPLE → NOTES.  Chopping audio is only half of sampling. A producer finds
   the record's KEY, reads its notes off a piano roll, writes a bass line that
   follows its implied harmony, and REPITCHES the chops to play a new melody.
   None of that is possible while a chop is just an opaque blob of audio, so
   this module turns sampled sound into musical data our engines can read.

   Grounded in the standard algorithms:
   · YIN (de Cheveigné & Kawahara, JASA 2002) — the cumulative mean normalised
     difference function, an absolute threshold, then parabolic interpolation
     for sub-sample precision. The same method behind pitchfinder, TarsosDSP
     and Essentia's monophonic pitch estimators.
   · CHROMAGRAM — fold the spectrum into twelve pitch classes, so octave and
     timbre fall away and only harmony is left.
   · KRUMHANSL-SCHMUCKLER key finding (Cognitive Foundations of Musical Pitch,
     1990) — correlate the chromagram against the experimentally-derived major
     and minor profiles at all twelve rotations; the best match is the key.

   Nothing here is baked in: what comes out depends entirely on the record.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── YIN: the fundamental frequency of one frame, or null if unpitched ── */
function yinPitch(x, sampleRate, opts){
  opts = opts || {};
  const threshold = opts.threshold != null ? opts.threshold : 0.12;
  const fmin = opts.fmin || 55;                 // A1
  const fmax = opts.fmax || 1600;               // ~G6
  const tauMin = Math.max(2, Math.floor(sampleRate/fmax));
  const tauMax = Math.min(Math.floor(x.length/2), Math.floor(sampleRate/fmin));
  if(tauMax <= tauMin) return null;

  // 1. difference function
  const d = new Float32Array(tauMax+1);
  for(let tau=tauMin; tau<=tauMax; tau++){
    let s = 0;
    for(let j=0; j+tau < x.length; j++){ const diff = x[j]-x[j+tau]; s += diff*diff; }
    d[tau] = s;
  }
  // 2. cumulative mean normalised difference
  const dp = new Float32Array(tauMax+1);
  dp[tauMin] = 1;
  let running = 0;
  for(let tau=tauMin; tau<=tauMax; tau++){
    running += d[tau];
    dp[tau] = running > 0 ? d[tau]*(tau-tauMin+1)/running : 1;
  }
  // 3. absolute threshold — first dip below it, following it to its local min
  let tauBest = -1;
  for(let tau=tauMin+1; tau<tauMax; tau++){
    if(dp[tau] < threshold){
      while(tau+1 < tauMax && dp[tau+1] < dp[tau]) tau++;
      tauBest = tau; break;
    }
  }
  if(tauBest < 0){                               // nothing clear: take the best dip
    let best = Infinity;
    for(let tau=tauMin+1; tau<tauMax; tau++) if(dp[tau] < best){ best = dp[tau]; tauBest = tau; }
    if(tauBest < 0 || best > 0.5) return null;   // genuinely unpitched (a drum, noise)
  }
  // 4. parabolic interpolation around the dip
  let tau = tauBest;
  if(tau > tauMin && tau < tauMax-1){
    const a = dp[tau-1], b = dp[tau], c = dp[tau+1];
    const denom = 2*(2*b - a - c);
    if(denom !== 0) tau = tau + (c - a)/denom;
  }
  const freq = sampleRate/tau;
  if(freq < fmin || freq > fmax) return null;
  return { freq, clarity: 1 - Math.min(1, dp[tauBest]) };
}

const A4 = 440;
function freqToMidi(f){ return 69 + 12*Math.log2(f/A4); }
function midiToFreq(m){ return A4*Math.pow(2,(m-69)/12); }

/* ── give every chop a pitch. Percussive chops come back midi:null, which is
   correct — a snare has no note, and pretending otherwise would be a lie. ── */
function pitchSlices(slices, mono, sampleRate){
  for(const s of slices){
    const len = Math.min(s.to - s.from, Math.round(sampleRate*0.09));
    if(len < 256){ s.midi = null; s.clarity = 0; continue; }
    // skip the very attack: transients confuse pitch estimation
    const skip = Math.min(Math.round(sampleRate*0.008), Math.max(0, (s.to-s.from)-len));
    const frame = mono.subarray(s.from+skip, s.from+skip+len);
    const p = yinPitch(frame, sampleRate);
    if(p && p.clarity > 0.55){
      s.midi = Math.round(freqToMidi(p.freq));
      s.freq = p.freq;
      s.clarity = p.clarity;
      s.cents = Math.round((freqToMidi(p.freq) - s.midi)*100);
    } else { s.midi = null; s.clarity = p ? p.clarity : 0; }
  }
  return slices;
}

/* ── CHROMAGRAM: twelve pitch classes, octave-folded ── */
function chromagram(mono, sampleRate, opts){
  opts = opts || {};
  const N = opts.fftSize || 4096;
  const hop = opts.hop || 2048;
  const chroma = new Float32Array(12);
  const re = new Float32Array(N), im = new Float32Array(N), mag = new Float32Array(N/2);
  const win = new Float32Array(N);
  for(let i=0;i<N;i++) win[i] = 0.5 - 0.5*Math.cos(2*Math.PI*i/(N-1));
  const frames = Math.max(1, Math.floor((mono.length - N)/hop));
  const limit = Math.min(frames, opts.maxFrames || 400);
  const stride = Math.max(1, Math.floor(frames/limit));
  let used = 0;
  for(let f=0; f<frames; f+=stride){
    const off = f*hop;
    for(let i=0;i<N;i++){ re[i] = (mono[off+i]||0)*win[i]; im[i] = 0; }
    fftMagLocal(re, im, mag);
    for(let i=1;i<N/2;i++){
      const freq = i*sampleRate/N;
      if(freq < 55 || freq > 5000) continue;
      const pc = ((Math.round(freqToMidi(freq)) % 12) + 12) % 12;
      chroma[pc] += mag[i];
    }
    used++;
    if(used >= limit) break;
  }
  let sum = 0; for(const v of chroma) sum += v;
  if(sum > 0) for(let i=0;i<12;i++) chroma[i] /= sum;
  return chroma;
}

/* a local FFT so this module stands alone */
function fftMagLocal(re, im, mag){
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
        const ur = re[i+k], ui = im[i+k];
        const vr = re[i+k+len/2]*cr - im[i+k+len/2]*ci;
        const vi = re[i+k+len/2]*ci + im[i+k+len/2]*cr;
        re[i+k] = ur+vr; im[i+k] = ui+vi;
        re[i+k+len/2] = ur-vr; im[i+k+len/2] = ui-vi;
        const ncr = cr*wr - ci*wi; ci = cr*wi + ci*wr; cr = ncr;
      }
    }
  }
  for(let i=0;i<n/2;i++) mag[i] = Math.hypot(re[i], im[i]);
}

/* ── KRUMHANSL-SCHMUCKLER: the key that best explains this chromagram ── */
const KS_MAJOR = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
const KS_MINOR = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
function correlate(a, b){
  let ma=0, mb=0;
  for(let i=0;i<12;i++){ ma+=a[i]; mb+=b[i]; }
  ma/=12; mb/=12;
  let num=0, da=0, db=0;
  for(let i=0;i<12;i++){
    const x=a[i]-ma, y=b[i]-mb;
    num+=x*y; da+=x*x; db+=y*y;
  }
  return (da>0&&db>0) ? num/Math.sqrt(da*db) : 0;
}
function detectKey(chroma){
  let best=null;
  for(let root=0; root<12; root++){
    const rot = new Float32Array(12);
    for(let i=0;i<12;i++) rot[i] = chroma[(i+root)%12];
    const maj = correlate(rot, KS_MAJOR);
    const min = correlate(rot, KS_MINOR);
    if(!best || maj > best.score) best = { root, scale:"major", score:maj };
    if(min > best.score)          best = { root, scale:"minor", score:min };
  }
  return best;
}


/* ═══════════════════════════════════════════════════════════════════════════
   CHORD RECOGNITION — the harmony a record is actually playing.
   YIN gives one pitch at a time, which is the wrong tool for a full mix. The
   classical DSP answer (Mauch's Chordino / the NNLS-chroma family) is to fold
   the spectrum into a chromagram per time window and correlate it against
   chord TEMPLATES. No model, no download, works offline — and it produces the
   one thing our engines need from a sample: a chord progression the bass and
   harmony can follow.

   For genuine note-level polyphonic transcription the open-source answer is
   Spotify's BASIC PITCH (Apache 2.0, ICASSP 2022) — instrument-agnostic,
   multi-pitch, with an official TypeScript build that runs on TensorFlow.js
   in the browser. It is deliberately NOT bundled here: the model plus TF.js is
   roughly 20 MB, which would end this program's life as one offline file.
   ═══════════════════════════════════════════════════════════════════════════ */

const CHORD_TEMPLATES = [
  { name:"maj",  ivs:[0,4,7]      },
  { name:"min",  ivs:[0,3,7]      },
  { name:"dom7", ivs:[0,4,7,10]   },
  { name:"min7", ivs:[0,3,7,10]   },
  { name:"maj7", ivs:[0,4,7,11]   },
  { name:"dim",  ivs:[0,3,6]      },
  { name:"sus4", ivs:[0,5,7]      },
];
function templateVector(ivs){
  const v=new Float32Array(12);
  for(const i of ivs) v[i%12]=1;
  // a light bias toward the root and fifth, which dominate real spectra
  v[ivs[0]%12]*=1.25;
  if(ivs.indexOf(7)>=0) v[7]*=1.1;
  return v;
}
const TEMPLATE_VECS = CHORD_TEMPLATES.map(t=>({ ...t, vec:templateVector(t.ivs) }));

/* best chord for one chromagram */
function matchChord(chroma){
  let best=null;
  for(let root=0; root<12; root++){
    const rot=new Float32Array(12);
    for(let i=0;i<12;i++) rot[i]=chroma[(i+root)%12];
    for(const t of TEMPLATE_VECS){
      const sc=correlate(rot, t.vec);
      if(!best || sc>best.score) best={ root, quality:t.name, score:sc };
    }
  }
  return best;
}

/* the chord progression across a window of audio */
function chordSequence(mono, sampleRate, opts){
  opts=opts||{};
  const from=Math.max(0, Math.round((opts.startSec||0)*sampleRate));
  const to=Math.min(mono.length, opts.lengthSec
    ? from+Math.round(opts.lengthSec*sampleRate) : mono.length);
  const winSec=opts.windowSec || 0.5;
  const win=Math.max(4096, Math.round(winSec*sampleRate));
  const raw=[];
  for(let p=from; p+win<=to; p+=win){
    const ch=chromagram(mono.subarray(p, p+win), sampleRate, {fftSize:4096, hop:2048, maxFrames:12});
    const m=matchChord(ch);
    raw.push({ startSec:p/sampleRate, endSec:(p+win)/sampleRate,
               root:m.root, quality:m.quality, score:m.score });
  }
  // SMOOTH: single-window flickers are analysis noise, not chord changes.
  // A chord that does not survive its neighbours is replaced by them.
  for(let i=1;i<raw.length-1;i++){
    const a=raw[i-1], b=raw[i], c=raw[i+1];
    if(a.root===c.root && b.root!==a.root && b.score < Math.max(a.score,c.score)){
      b.root=a.root; b.quality=a.quality; b.smoothed=true;
    }
  }
  // MERGE consecutive identical chords into spans
  const out=[];
  for(const r of raw){
    const last=out[out.length-1];
    if(last && last.root===r.root && last.quality===r.quality){
      last.endSec=r.endSec; last.score=Math.max(last.score,r.score);
    } else out.push({...r});
  }
  return out;
}

/* the pitch classes a chord spans — what the listening layer wants */
function chordPcs(chord){
  const t=CHORD_TEMPLATES.find(x=>x.name===chord.quality) || CHORD_TEMPLATES[0];
  return t.ivs.map(i=>(chord.root+i)%12);
}

/* ── the whole analysis: notes + key for a sampled window ── */
function analyseMusically(slices, mono, sampleRate, opts){
  pitchSlices(slices, mono, sampleRate);
  const o = opts || {};
  const from = Math.max(0, Math.round((o.startSec||0)*sampleRate));
  const to = Math.min(mono.length, o.lengthSec ? from+Math.round(o.lengthSec*sampleRate) : mono.length);
  const chroma = chromagram(mono.subarray(from, to), sampleRate);
  const key = detectKey(chroma);
  const pitched = slices.filter(s=>s.midi!=null);
  const chords = chordSequence(mono, sampleRate, o);
  return {
    key, chroma, chords,
    pitchedCount: pitched.length,
    total: slices.length,
    medianMidi: pitched.length
      ? pitched.map(s=>s.midi).sort((a,b)=>a-b)[pitched.length>>1] : null,
  };
}

if(typeof module!=="undefined") module.exports = {
  yinPitch, pitchSlices, chromagram, detectKey, analyseMusically,
  chordSequence, matchChord, chordPcs, CHORD_TEMPLATES,
  freqToMidi, midiToFreq, KS_MAJOR, KS_MINOR
};
