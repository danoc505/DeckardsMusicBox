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
 */

import { Biquad, Noise, envelope, midiHz, type Shape } from "./dsp.ts";

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
  const twoPi = 2 * Math.PI;
  // harder notes have more tine: the index follows the weight
  const body = 0.9 * n.gain;
  const tine = 1.1 * n.gain;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    const env = envelope(t, n.heldSec, RHODES);
    if (env < 1e-4 && t > n.heldSec) break;
    const iBody = body * Math.exp(-t / 0.7);
    const iTine = tine * Math.exp(-t / 0.06);
    const mod = iBody * Math.sin(twoPi * f * t) + iTine * Math.sin(twoPi * f * 14 * t);
    out[i] = Math.sin(twoPi * f * t + mod) * env * 0.5;
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
