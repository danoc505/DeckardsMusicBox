/**
 * The instruments. Each renders one note into a buffer from its pitch, its
 * length, its weight and a seed — and nothing else, so a note is the same
 * note wherever it falls in the record.
 *
 * The recipes are the published ones and the numbers are theirs:
 *
 *   rhodes  FM tine piano. A carrier with a 1:1 modulator for the body, and
 *           a bright modulator near 14:1 whose level decays in tens of
 *           milliseconds — that is the tine (pluginboutique.com, "FM
 *           Synthesis Cookbook"; attackmagazine.com, "FM Electric Piano").
 *   sub     a sine with a little second harmonic, a warm sub bass.
 *   pluck   a Karplus–Strong string, muted: a noise burst through a delay
 *           line with a lowpass in the loop.
 *   kick    a sine near 58 Hz under a pitch envelope decaying in about 50 ms
 *           (modeaudio.com, "Drum Synth Sound Design: Kick & Snare").
 *   snare   a sine near 200 Hz, filtered noise, and a click of a few ms
 *           (the same).
 *   hat     narrow-band noise, closed short and open long.
 *   organ   additive, the drawbar way: sines at the sub-octave, the
 *           fundamental, the octave, the twelfth and the fifteenth
 *           (soundonsound.com, "Synthesizing Tonewheel Organs").
 *   pad     two sawtooths a few cents apart under a lowpass, with a slow
 *           attack and a long release (soundonsound.com, "Synthesizing
 *           Strings"; attackmagazine.com, "Detuned Pad").
 *   flute   a sine with a little second harmonic, breath noise, and vibrato
 *           (soundonsound.com, "Practical Flute Synthesis").
 */

import { Biquad, Noise, decayPerSample, envelope, midiHz, sinTurns, type Shape } from "./dsp.ts";

export interface NoteIn {
  readonly midi: number;
  readonly heldSec: number;
  /** 0..1.25 */
  readonly gain: number;
  readonly seed: number;
  readonly sampleRate: number;
}

const buffer = (sec: number, sr: number): Float32Array => new Float32Array(Math.max(1, Math.ceil(sec * sr)));

const RHODES: Shape = { attackSec: 0.003, decaySec: 1.6, sustain: 0.08, releaseSec: 0.09 };

export function rhodes(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const out = buffer(n.heldSec + 0.5, sr);
  const held = Math.round(n.heldSec * sr);
  // harder notes have more tine: the index follows the weight. Both
  // indices decay by a multiplier a sample, as does the amplitude; the
  // phases accumulate in turns, so the sine is a table lookup
  let iBody = 0.9 * n.gain;
  let iTine = 1.1 * n.gain;
  const kBody = decayPerSample(0.7, sr);
  const kTine = decayPerSample(0.06, sr);
  const kDecay = decayPerSample(RHODES.decaySec, sr);
  const kRelease = decayPerSample(RHODES.releaseSec, sr);
  const attack = Math.max(1, Math.round(RHODES.attackSec * sr));
  let decay = 1;
  let release = 1;
  const dPhase = f / sr;
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const a = i < attack ? i / attack : 1;
    decay *= kDecay;
    if (i > held) release *= kRelease;
    const env = a * (RHODES.sustain + (1 - RHODES.sustain) * decay) * release;
    if (env < 1e-4 && i > held) break;
    const mod = iBody * sinTurns(phase) + iTine * sinTurns(phase * 14);
    out[i] = sinTurns(phase + mod / (2 * Math.PI)) * env * 0.5;
    phase += dPhase;
    iBody *= kBody;
    iTine *= kTine;
  }
  return out;
}

const SUB: Shape = { attackSec: 0.006, decaySec: 0.8, sustain: 0.6, releaseSec: 0.05 };

export function sub(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const out = buffer(n.heldSec + 0.25, sr);
  const twoPi = 2 * Math.PI;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const env = envelope(t, n.heldSec, SUB);
    if (env < 1e-4 && t > n.heldSec) break;
    const second = 0.25 * Math.exp(-t / 0.25);
    out[i] = (Math.sin(twoPi * f * t) + second * Math.sin(twoPi * 2 * f * t)) * env * 0.7;
  }
  return out;
}

export function pluck(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const period = Math.max(2, Math.round(sr / f));
  const out = buffer(n.heldSec + 0.6, sr);
  const noise = new Noise(n.seed);
  const line = new Float32Array(period);
  for (let i = 0; i < period; i++) line[i] = noise.next();
  // the mute: a lowpass in the loop takes the top off fast, and the loss
  // makes the string die on its own
  const loss = 0.992;
  let idx = 0;
  let prev = 0;
  const damp = new Biquad("lowpass", 2400, 0.7, sr);
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const cur = line[idx]!;
    const next = line[(idx + 1) % period]!;
    const avg = (cur + next) * 0.5 * loss;
    line[idx] = avg;
    idx = (idx + 1) % period;
    // let go: the loop damps harder once the note is released
    const rel = t > n.heldSec ? Math.exp(-(t - n.heldSec) / 0.05) : 1;
    const y = damp.run(avg) * rel;
    // a muted string is quiet by nature; brought up to sit with the others,
    // and held under full scale, since the burst's peak is the seed's
    out[i] = Math.tanh((y + prev) * 0.5 * 2.9 * (0.5 + 0.5 * n.gain));
    prev = y;
    if (t > n.heldSec && Math.abs(y) < 1e-4 && i > period * 4) break;
  }
  return out;
}

export function kick(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const out = buffer(0.45, sr);
  const twoPi = 2 * Math.PI;
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    // the pitch falls from a clicky start onto the body in about 50 ms
    const hz = 58 + 140 * Math.exp(-t / 0.05);
    phase += (twoPi * hz) / sr;
    const env = Math.exp(-t / 0.22) * (t < 0.001 ? t / 0.001 : 1);
    out[i] = Math.tanh(Math.sin(phase) * 2.2) * env * 0.95 * n.gain;
  }
  return out;
}

export function snare(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const out = buffer(0.35, sr);
  const twoPi = 2 * Math.PI;
  const noise = new Noise(n.seed);
  const band = new Biquad("bandpass", 1800, 0.7, sr);
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const tone = Math.sin(twoPi * 200 * t) * Math.exp(-t / 0.08);
    const rattle = band.run(noise.next()) * Math.exp(-t / 0.13);
    const click = t < 0.004 ? noise.next() * (1 - t / 0.004) : 0;
    out[i] = (0.55 * tone + 1.6 * rattle + 0.5 * click) * n.gain * 0.6;
  }
  return out;
}

export function hat(n: NoteIn, open: boolean): Float32Array {
  const sr = n.sampleRate;
  const out = buffer(open ? 0.4 : 0.09, sr);
  const noise = new Noise(n.seed);
  const hp = new Biquad("highpass", 7000, 0.8, sr);
  const tau = open ? 0.12 : 0.025;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    out[i] = hp.run(noise.next()) * Math.exp(-t / tau) * 0.6 * n.gain;
  }
  return out;
}

const ORGAN: Shape = { attackSec: 0.02, decaySec: 4, sustain: 1, releaseSec: 0.12 };
/** Drawbars: [harmonic ratio, level]. 16', 8', 4', 2⅔', 2'. */
const DRAWBARS: readonly (readonly [number, number])[] = [[0.5, 0.5], [1, 1], [2, 0.6], [3, 0.35], [4, 0.25]];

export function organ(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const out = buffer(n.heldSec + 0.4, sr);
  const phases = DRAWBARS.map(() => 0);
  const norm = 0.8 / DRAWBARS.reduce((a, [, l]) => a + l, 0);
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const env = envelope(t, n.heldSec, ORGAN);
    if (env < 1e-4 && t > n.heldSec) break;
    let y = 0;
    for (let k = 0; k < DRAWBARS.length; k++) {
      const [ratio, level] = DRAWBARS[k]!;
      y += level * sinTurns(phases[k]!);
      phases[k] = phases[k]! + (f * ratio) / sr;
    }
    out[i] = y * norm * env * (0.6 + 0.4 * n.gain);
  }
  return out;
}

const PAD: Shape = { attackSec: 0.35, decaySec: 3, sustain: 0.85, releaseSec: 0.9 };

export function pad(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const out = buffer(n.heldSec + 3, sr);
  // seven cents apart, one each side, a third saw an octave down for weight
  const detune = Math.pow(2, 7 / 1200);
  const d = [f * detune, f / detune, f / 2].map((hz) => hz / sr);
  const ph = [0, 0.37, 0.61];
  const lp = new Biquad("lowpass", Math.min(2600, f * 6), 0.8, sr);
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const env = envelope(t, n.heldSec, PAD);
    if (env < 1e-4 && t > n.heldSec) break;
    let y = 0;
    for (let k = 0; k < 3; k++) {
      // a sawtooth as a phase ramp; naive, and the lowpass takes the top off
      y += (k === 2 ? 0.5 : 1) * (2 * ph[k]! - 1);
      ph[k] = ph[k]! + d[k]!;
      if (ph[k]! >= 1) ph[k] = ph[k]! - 1;
    }
    out[i] = lp.run(y) * 0.34 * env * (0.6 + 0.4 * n.gain);
  }
  return out;
}

const FLUTE: Shape = { attackSec: 0.06, decaySec: 2, sustain: 0.9, releaseSec: 0.12 };

export function flute(n: NoteIn): Float32Array {
  const sr = n.sampleRate;
  const f = midiHz(n.midi);
  const out = buffer(n.heldSec + 0.5, sr);
  const noise = new Noise(n.seed);
  const breath = new Biquad("bandpass", f * 2, 4, sr);
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const env = envelope(t, n.heldSec, FLUTE);
    if (env < 1e-4 && t > n.heldSec) break;
    // vibrato arrives after the note has spoken
    const vib = 1 + 0.004 * Math.min(1, t / 0.4) * Math.sin(2 * Math.PI * 5.5 * t);
    phase += (f * vib) / sr;
    const tone = sinTurns(phase) + 0.18 * sinTurns(phase * 2) + 0.05 * sinTurns(phase * 3);
    const air = breath.run(noise.next()) * (0.9 + 0.6 * Math.exp(-t / 0.08));
    out[i] = (tone + 0.35 * air) * 0.55 * env * (0.6 + 0.4 * n.gain);
  }
  return out;
}
