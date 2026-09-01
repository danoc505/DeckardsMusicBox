/**
 * The few pieces of signal arithmetic the voices and the tape are made of.
 * Pure, sample by sample, with the state in plain objects — so a render is
 * a function of its inputs and the same record is the same samples twice.
 */

export type Kind = "lowpass" | "highpass" | "bandpass";

/** A second-order filter, coefficients from the RBJ cookbook. */
export class Biquad {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;

  constructor(kind: Kind, hz: number, q: number, sampleRate: number) {
    this.set(kind, hz, q, sampleRate);
  }

  set(kind: Kind, hz: number, q: number, sampleRate: number): void {
    const w = (2 * Math.PI * Math.min(hz, sampleRate * 0.49)) / sampleRate;
    const cos = Math.cos(w);
    const sin = Math.sin(w);
    const alpha = sin / (2 * q);
    let b0: number;
    let b1: number;
    let b2: number;
    switch (kind) {
      case "lowpass":
        b0 = (1 - cos) / 2;
        b1 = 1 - cos;
        b2 = (1 - cos) / 2;
        break;
      case "highpass":
        b0 = (1 + cos) / 2;
        b1 = -(1 + cos);
        b2 = (1 + cos) / 2;
        break;
      case "bandpass":
        b0 = alpha;
        b1 = 0;
        b2 = -alpha;
        break;
    }
    const a0 = 1 + alpha;
    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = (-2 * cos) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  run(x: number): number {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

/** White noise from a seed: xorshift32, so a hat is the same hat every time. */
export class Noise {
  private s: number;
  constructor(seed: number) {
    this.s = (seed >>> 0) || 0x9e3779b9;
  }
  next(): number {
    let x = this.s;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.s = x >>> 0;
    return (this.s / 0xffffffff) * 2 - 1;
  }
}

/** A note's shape: a short attack, an exponential decay toward a floor, a release once it is let go. */
export interface Shape {
  readonly attackSec: number;
  /** Time constant of the decay. */
  readonly decaySec: number;
  /** Where the decay settles, 0..1 of the peak; 0 for a percussive note. */
  readonly sustain: number;
  readonly releaseSec: number;
}

/** The envelope at time `t` of a note held for `heldSec`. */
export function envelope(t: number, heldSec: number, sh: Shape): number {
  if (t < 0) return 0;
  const a = t < sh.attackSec ? t / sh.attackSec : 1;
  const body = sh.sustain + (1 - sh.sustain) * Math.exp(-Math.max(0, t - sh.attackSec) / sh.decaySec);
  const rel = t > heldSec ? Math.exp(-(t - heldSec) / sh.releaseSec) : 1;
  return a * body * rel;
}

/** Soft saturation: tanh, which nothing leaves louder than full scale. */
export const saturate = (x: number, drive: number): number => Math.tanh(x * drive);

export const midiHz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

/** A sine by table, phase in turns (0..1), linear between entries: the FM voices call it three times a sample. */
const SINE_N = 4096;
const SINE = new Float32Array(SINE_N + 1);
for (let i = 0; i <= SINE_N; i++) SINE[i] = Math.sin((2 * Math.PI * i) / SINE_N);
export function sinTurns(turns: number): number {
  const x = (turns - Math.floor(turns)) * SINE_N;
  const i = x | 0;
  const f = x - i;
  return SINE[i]! * (1 - f) + SINE[i + 1]! * f;
}

/** The per-sample multiplier that decays by e every `tauSec`. */
export const decayPerSample = (tauSec: number, sampleRate: number): number => Math.exp(-1 / (tauSec * sampleRate));
