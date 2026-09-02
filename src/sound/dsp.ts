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

/**
 * How far below its own peak a voice must fall before its buffer may end.
 * A buffer that stops while the sound is still there is a step, and a step
 * is a click — the kick ended 19 dB under its peak and clicked on every
 * beat of every record. 40 dB down, a four-millisecond fade closes what is
 * left without ducking anything an ear can follow.
 */
const TAIL_DB = 40;
const FADE_SEC = 0.004;

/** How long a decay of time constant `tau` takes to fall TAIL_DB. */
export const tailSec = (tau: number): number => (tau * TAIL_DB) / (20 / Math.LN10);

/** Close a buffer with a raised-cosine fade, so it ends at zero however it was cut. */
export function fade(buf: Float32Array, sampleRate: number): Float32Array {
  const n = Math.min(buf.length, Math.max(1, Math.round(FADE_SEC * sampleRate)));
  const from = buf.length - n;
  for (let i = 0; i < n; i++) buf[from + i] = buf[from + i]! * 0.5 * (1 + Math.cos((Math.PI * i) / n));
  return buf;
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

/**
 * A room, the Schroeder way: four combs in parallel, two allpasses in
 * series, and a lowpass in each comb so the tail darkens as it dies. The
 * comb lengths are the classic ones and their feedback is set from the
 * decay time, so `sec` is how long the room rings by 60 dB.
 */
export class Reverb {
  private readonly combs: { buf: Float32Array; i: number; g: number; lp: number }[];
  private readonly aps: { buf: Float32Array; i: number }[];
  constructor(sec: number, sampleRate: number) {
    const combMs = [29.7, 37.1, 41.1, 43.7];
    this.combs = combMs.map((ms) => {
      const len = Math.max(1, Math.round((ms / 1000) * sampleRate));
      return { buf: new Float32Array(len), i: 0, g: Math.pow(10, (-3 * ms) / 1000 / sec), lp: 0 };
    });
    this.aps = [5.0, 1.7].map((ms) => ({ buf: new Float32Array(Math.max(1, Math.round((ms / 1000) * sampleRate))), i: 0 }));
  }
  run(x: number): number {
    let y = 0;
    for (const c of this.combs) {
      const d = c.buf[c.i]!;
      c.lp = 0.7 * d + 0.3 * c.lp;
      c.buf[c.i] = x + c.lp * c.g;
      c.i = (c.i + 1) % c.buf.length;
      y += d;
    }
    y *= 0.25;
    for (const a of this.aps) {
      const d = a.buf[a.i]!;
      const w = y + d * 0.7;
      a.buf[a.i] = w;
      a.i = (a.i + 1) % a.buf.length;
      y = d - w * 0.7;
    }
    return y;
  }
}

/** A fractional delay line: write, then read `sec` back with linear interpolation. */
export class Line {
  private readonly buf: Float32Array;
  private readonly sampleRate: number;
  private w = 0;
  constructor(maxSec: number, sampleRate: number) {
    this.sampleRate = sampleRate;
    this.buf = new Float32Array(Math.max(4, Math.ceil(maxSec * sampleRate) + 2));
  }
  write(x: number): void {
    this.buf[this.w] = x;
    this.w = (this.w + 1) % this.buf.length;
  }
  read(sec: number): number {
    const n = this.buf.length;
    const back = Math.min(n - 2, Math.max(1, sec * this.sampleRate));
    let pos = this.w - 1 - back;
    if (pos < 0) pos += n;
    const p0 = pos | 0;
    const f = pos - p0;
    const i1 = p0 + 1 === n ? 0 : p0 + 1;
    return this.buf[p0]! * (1 - f) + this.buf[i1]! * f;
  }
}

/** An echo: a delay fed back on itself, darkened each pass so the repeats die away. */
export class Echo {
  private readonly line: Line;
  private readonly damp: Biquad;
  private readonly sec: number;
  private readonly feedback: number;
  constructor(sec: number, feedback: number, sampleRate: number) {
    this.sec = sec;
    this.feedback = feedback;
    this.line = new Line(Math.max(sec, 0.01) + 0.05, sampleRate);
    this.damp = new Biquad("lowpass", 3200, 0.7, sampleRate);
  }
  run(x: number): number {
    const back = this.damp.run(this.line.read(this.sec));
    this.line.write(x + back * this.feedback);
    return back;
  }
}

/** A flanger: a few milliseconds of delay swept by a slow sine, mixed back onto itself. */
export class Flanger {
  private readonly line: Line;
  private readonly rateHz: number;
  private readonly depth: number;
  private readonly dt: number;
  private t = 0;
  constructor(rateHz: number, depth: number, sampleRate: number) {
    this.rateHz = rateHz;
    this.depth = depth;
    this.line = new Line(0.02, sampleRate);
    this.dt = 1 / sampleRate;
  }
  run(x: number): number {
    this.t += this.dt;
    const sec = 0.001 + 0.006 * this.depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * this.rateHz * this.t));
    const wet = this.line.read(sec);
    this.line.write(x + wet * 0.5);
    return wet;
  }
}

/** An ensemble: three detuned copies, each on its own slow sweep — the chorus in a multi-effect. */
export class Ensemble {
  private readonly lines: Line[];
  private readonly rateHz: number;
  private readonly depth: number;
  private readonly dt: number;
  private t = 0;
  constructor(rateHz: number, depth: number, sampleRate: number) {
    this.rateHz = rateHz;
    this.depth = depth;
    this.lines = [0, 1, 2].map(() => new Line(0.04, sampleRate));
    this.dt = 1 / sampleRate;
  }
  run(x: number): number {
    this.t += this.dt;
    let y = 0;
    for (let k = 0; k < 3; k++) {
      const phase = this.t * this.rateHz * (1 + 0.13 * k) + k / 3;
      const sec = 0.012 + 0.008 * this.depth * Math.sin(2 * Math.PI * phase);
      y += this.lines[k]!.read(sec);
      this.lines[k]!.write(x);
    }
    return y / 3;
  }
}

/**
 * A state-variable filter, the pole: a resonant lowpass whose cutoff and
 * resonance are the two knobs a synth filter has (Chamberlin form).
 */
export class Pole {
  private low = 0;
  private band = 0;
  private readonly f: number;
  private readonly q: number;
  constructor(hz: number, resonance: number, sampleRate: number) {
    this.f = 2 * Math.sin((Math.PI * Math.min(hz, sampleRate / 6)) / sampleRate);
    this.q = 1 - 0.95 * Math.min(1, Math.max(0, resonance));
  }
  run(x: number): number {
    const high = x - this.low - this.q * this.band;
    this.band += this.f * high;
    this.low += this.f * this.band;
    return this.low;
  }
}

/**
 * A spring: a bright, short room with a bounce in it — one allpass chain
 * fed through a short comb and a highpass so the low end never rings.
 */
export class Spring {
  private readonly room: Reverb;
  private readonly hp: Biquad;
  private readonly bounce: Line;
  constructor(sec: number, sampleRate: number) {
    this.room = new Reverb(Math.max(0.3, sec * 0.6), sampleRate);
    this.hp = new Biquad("highpass", 400, 0.7, sampleRate);
    this.bounce = new Line(0.03, sampleRate);
  }
  run(x: number): number {
    const b = this.bounce.read(0.027);
    this.bounce.write(this.hp.run(x) + b * 0.45);
    return this.room.run(b);
  }
}

/** The medium the record is heard through: a gramophone horn or a small radio. */
export class Medium {
  private readonly band: Biquad;
  private readonly hiss: Noise;
  constructor(kind: "gramophone" | "radio", seed: number, sampleRate: number) {
    this.band = kind === "gramophone" ? new Biquad("bandpass", 1400, 0.5, sampleRate) : new Biquad("bandpass", 2600, 0.8, sampleRate);
    this.hiss = new Noise(seed);
  }
  run(x: number): number {
    return this.band.run(x) * 2.2 + this.hiss.next() * 0.004;
  }
}

/** A second-order allpass, the stage a phaser is built from. */
class Allpass2 {
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  private a1 = 0; private a2 = 0;
  private readonly sampleRate: number;
  constructor(sampleRate: number) { this.sampleRate = sampleRate; }
  set(hz: number, q: number): void {
    const w = (2 * Math.PI * Math.min(hz, this.sampleRate * 0.45)) / this.sampleRate;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    this.a1 = (-2 * Math.cos(w)) / a0;
    this.a2 = (1 - alpha) / a0;
  }
  run(x: number): number {
    const y = this.a2 * x + this.a1 * this.x1 + this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

/** The pedal board's stages. Each takes a sample and gives one back; mix is applied by the caller. */
export class Wah {
  private readonly band: Biquad;
  private readonly rateHz: number;
  private readonly depth: number;
  private readonly sr: number;
  private t = 0;
  private n = 0;
  constructor(rateHz: number, depth: number, sampleRate: number) {
    this.rateHz = rateHz; this.depth = depth; this.sr = sampleRate;
    this.band = new Biquad("bandpass", 800, 3, sampleRate);
  }
  run(x: number): number {
    // the sweep is set every 32 samples: a filter retuned per sample is a waste, and an ear cannot tell
    if ((this.n++ & 31) === 0) {
      this.t = this.n / this.sr;
      const hz = 350 * Math.pow(2, 2.6 * this.depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * this.rateHz * this.t)));
      this.band.set("bandpass", hz, 3, this.sr);
    }
    return this.band.run(x) * 3;
  }
}
export class Overdrive {
  private readonly tone: Biquad;
  private readonly drive: number;
  constructor(drive: number, tone: number, sampleRate: number) {
    this.drive = drive;
    this.tone = new Biquad("lowpass", 1200 + 6000 * tone, 0.7, sampleRate);
  }
  run(x: number): number { return this.tone.run(Math.tanh(x * this.drive)) / Math.tanh(Math.min(3, this.drive)); }
}
export class Fuzz {
  private readonly gain: number;
  private readonly lp: Biquad;
  constructor(gain: number, sampleRate: number) { this.gain = gain; this.lp = new Biquad("lowpass", 4500, 0.7, sampleRate); }
  run(x: number): number {
    const y = x * this.gain;
    // hard clipped, with a gate under the fizz
    const c = y > 0.6 ? 0.6 : y < -0.6 ? -0.6 : y;
    return this.lp.run(Math.abs(c) < 0.004 ? 0 : c) / 0.6;
  }
}
export class Phaser {
  private readonly stages: Allpass2[];
  private readonly rateHz: number;
  private readonly depth: number;
  private readonly sr: number;
  private n = 0;
  private fb = 0;
  constructor(rateHz: number, depth: number, sampleRate: number) {
    this.rateHz = rateHz; this.depth = depth; this.sr = sampleRate;
    this.stages = [0, 1, 2, 3].map(() => new Allpass2(sampleRate));
  }
  run(x: number): number {
    if ((this.n++ & 31) === 0) {
      const t = this.n / this.sr;
      const hz = 300 * Math.pow(2, 3 * this.depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * this.rateHz * t)));
      this.stages.forEach((st, k) => st.set(hz * (1 + 0.5 * k), 0.7));
    }
    let y = x + this.fb * 0.4;
    for (const st of this.stages) y = st.run(y);
    this.fb = y;
    return y;
  }
}
export class Tremolo {
  private readonly rateHz: number;
  private readonly depth: number;
  private readonly dt: number;
  private t = 0;
  constructor(rateHz: number, depth: number, sampleRate: number) { this.rateHz = rateHz; this.depth = depth; this.dt = 1 / sampleRate; }
  run(x: number): number {
    this.t += this.dt;
    return x * (1 - this.depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * this.rateHz * this.t)));
  }
}

/** Constant-power pan: −1 hard left, 1 hard right. */
export function panGains(pan: number): readonly [number, number] {
  const a = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}
