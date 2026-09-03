/**
 * THE PEDALS OFF MK2's BOARD, rebuilt as arithmetic.
 *
 * MK2 built these out of WebAudio nodes — waveshapers, biquads and two
 * AudioWorklets — because that is what its graph was made of. This program
 * has no graph: a unit is an object with state and a `run` that takes one
 * sample and gives one back, so a record is the same bytes in a browser, in
 * a test and on the way to a file. Every circuit below is MK2's, with its
 * sourcing carried over; what changed is the arithmetic around it, never the
 * numbers inside it.
 *
 *   comp    an MXR Dyna Comp. OTA compression: "a FAST ATTACK and relatively
 *           slow decay and release", the release RC "approximately 1.5
 *           seconds", and a detector that gives "a current feedback
 *           proportional to the guitar level, AMPLIFYING WEAK SIGNALS"
 *           (electrosmash, mxr-dyna-comp). Two knobs, which is what the pedal
 *           has: SUSTAIN (how hard) and LEVEL (the makeup).
 *   sub     an octave DIVIDER, not a multiplier: "pedals pitched one or two
 *           octaves down for maximum heaviness" (boostguitarpedals). A
 *           flip-flop clocked off the zero crossings, so it is a square
 *           whatever went in — "whatever shows up on the Clock pin, the output
 *           will be a square wave if the input is loud enough, OR NOTHING IF
 *           IT ISN'T" (electronicmusic.fandom, octave divider). It tracks
 *           single notes and not chords, which is why it belongs on a bass.
 *   octave  a Univox Super-Fuzz's upper octave: a full-wave rectifier. Fold
 *           the negative half up and the fundamental cancels while the second
 *           harmonic doubles, so the note appears an octave higher.
 *   meat    a Fuzz Face — the D*A*M M-13 Meathead and its clones, "five of the
 *           nine" doom fuzzes on the list MK2 was given (guitarpedalx). TWO
 *           transistors with the second's emitter tied back to the first's
 *           base, so it clips asymmetrically and coarsely; starve the bias and
 *           "the feedback loop is broken... we have GATING. That ripping
 *           velcro tone is saturation setting in" (geofex; pedalpcb).
 *   muff    a Big Muff Pi. Two soft clipping stages with a Miller pole inside
 *           each, then the Ram's Head tone stack: a 482 Hz low leg and a
 *           1206 Hz high leg summed, which scoops about 13 dB at 1 kHz
 *           (coda-effects; electrosmash). MIDS walks the high leg's corner
 *           down and fills the notch in; MASS is a clean low-passed copy
 *           beside the dirt, which is how a bass fuzz has always been built.
 *   saw     a Boss HM-2 with every knob up: "chainsaw city" (catalinbread).
 *           Three gyrators at 86.79, 958.47 and 1278.6 Hz — the high knob is
 *           two of them — and three diode sets in a row: an asymmetric soft
 *           pair, a hard pair, and a series germanium pair whose crossover
 *           notch is why an HM-2 stops dead between chugs.
 *   sag     the power supply, which is not a knob on the signal. A starve is
 *           static — "a 5k pot in series with +9V" (pedalpcb) — and sag is
 *           dynamic: "under heavy demand, the power supply voltage momentarily
 *           drops, creating a subtle compression effect that players describe
 *           as feel or touch response" (aikenamps). The rail falls in 11 ms,
 *           which is AmpBooks' measured 2.88 V/ms on a 5E3 supply, and comes
 *           back at the recovery knob's rate — 20 ms is solid state, 400 ms a
 *           tired valve rectifier.
 *
 * MK2's ninth pedal, an MXR Phase 90, is not here: this program's `phaser`
 * already is one — four allpass stages summed with the dry, which is the
 * whole of "the last Output Mixer Stage will combine the wet and dry signal
 * in order to create the SIGNAL CANCELLATION" (electrosmash, mxr-phase90).
 * Two phasers on one board is a knob that does what the knob beside it does.
 *
 * EVERY UNIT IS DRY AT REST. A pedal at mix 0 is not bypassed here, it is
 * ABSENT — `board` never builds it — which is what taking a pedal off a board
 * actually is, and is why a genre that uses one pedal pays for one.
 */

import { Biquad } from "./dsp.ts";

/** A one-pole envelope follower with its own attack and release, in seconds. */
class Follower {
  private readonly up: number;
  private readonly dn: number;
  private v = 0;
  constructor(attackSec: number, releaseSec: number, sampleRate: number) {
    this.up = Math.exp(-1 / (Math.max(1e-5, attackSec) * sampleRate));
    this.dn = Math.exp(-1 / (Math.max(1e-5, releaseSec) * sampleRate));
  }
  run(x: number): number {
    const a = x < 0 ? -x : x;
    const k = a > this.v ? this.up : this.dn;
    this.v = k * this.v + (1 - k) * a;
    return this.v;
  }
  get at(): number { return this.v; }
}

/**
 * THE COMPRESSOR — a Dyna Comp.
 *
 * A feed-forward detector and a gain, which is the same topology as the OTA
 * and its envelope detector; what it is NOT is the OTA's own distortion, and
 * that is written down rather than implied. SUSTAIN drives the threshold
 * down, so more of the signal falls under it and the makeup lifts more of the
 * quiet material with it — "amplifying weak signals" is what the pedal is for
 * and is why it sustains.
 */
export class Comp {
  private readonly env: Follower;
  private readonly thr: number;
  private readonly makeup: number;
  /** 8:1 over a 6 dB knee — a Dyna Comp squashes rather than levels. */
  private static readonly RATIO = 8;
  private static readonly KNEE = 6;
  constructor(sustain: number, level: number, sampleRate: number) {
    // 3 ms attack and the 1.5 s release RC, verbatim from the teardown
    this.env = new Follower(0.003, 1.5, sampleRate);
    const s = Math.min(1, Math.max(0, sustain));
    this.thr = -6 - 30 * s;
    // the makeup gives back what the compression took at the threshold, by
    // the LEVEL knob's amount: at 0 the pedal only takes away
    this.makeup = Math.pow(10, (Math.min(1, Math.max(0, level)) * -this.thr * (1 - 1 / Comp.RATIO)) / 20);
  }
  run(x: number): number {
    const env = this.env.run(x);
    const db = 20 * Math.log10(Math.max(env, 1e-7));
    const over = db - this.thr;
    let cut = 0;
    if (over > Comp.KNEE / 2) cut = over * (1 - 1 / Comp.RATIO);
    else if (over > -Comp.KNEE / 2) {
      // the knee, quadratic: the ratio arrives over 6 dB rather than at a corner
      const t = over + Comp.KNEE / 2;
      cut = ((1 - 1 / Comp.RATIO) * t * t) / (2 * Comp.KNEE);
    }
    return x * Math.pow(10, -cut / 20) * this.makeup;
  }
}

/**
 * THE OCTAVE DIVIDER — one flip-flop for an octave down, two for two.
 *
 * The chip's constant amplitude is what the source says and it is wrong on a
 * mixer: a square of fixed height beside a part that is not is an octave
 * INSTEAD of the note rather than under it. So the divider still makes a
 * square and still gates hard — both of those are the pedal — and its level
 * rides the input, which is what the analogue pedals put a VCA in the output
 * for.
 */
export class Sub {
  private readonly track: Biquad;
  private readonly floor: Biquad;
  private readonly tone: Biquad;
  private readonly env: Follower;
  private readonly gate: number;
  private readonly g1: number;
  private readonly g2: number;
  private readonly sm: number;
  private q1 = 1;
  private q2 = 1;
  private prev = 0;
  private open = 0;
  constructor(two: number, gate: number, toneHz: number, sampleRate: number) {
    // clock off the FUNDAMENTAL, not off a harmonic: a divider that hears the
    // second harmonic mistracks, which is the whole failing of the pedal
    this.track = new Biquad("lowpass", 260, 0.707, sampleRate);
    // an octave below a bass register is 16–43 Hz, which no speaker moves and
    // which only eats headroom
    this.floor = new Biquad("highpass", 38, 0.707, sampleRate);
    this.tone = new Biquad("lowpass", Math.min(4000, Math.max(120, toneHz)), 0.707, sampleRate);
    this.env = new Follower(0.001, 0.020, sampleRate);
    this.gate = Math.min(0.3, Math.max(0.0002, gate));
    const t = Math.min(1, Math.max(0, two));
    this.g1 = 0.55 * (1 - 0.5 * t);
    this.g2 = 0.55 * t;
    this.sm = Math.exp(-1 / (0.002 * sampleRate));
  }
  run(x: number): number {
    const clock = this.track.run(x);
    const env = this.env.run(clock);
    this.open = this.sm * this.open + (1 - this.sm) * (env > this.gate ? 1 : 0);
    // a sign change upward is one clock; the flip-flop toggles, so it changes
    // state once per two input cycles. Nothing here looks at how big x is.
    const sg = clock > 0 ? 1 : clock < 0 ? -1 : this.prev;
    if (sg > 0 && this.prev <= 0) {
      this.q1 = -this.q1;
      if (this.q1 > 0) this.q2 = -this.q2;
    }
    this.prev = sg;
    const y = (this.q1 * this.g1 + this.q2 * this.g2) * (env * 2.4) * this.open;
    return this.tone.run(this.floor.run(y));
  }
}

/**
 * THE OCTAVE UP — a full-wave rectifier, and one of the few pedal blocks that
 * genuinely is a single nonlinearity. Rectifying leaves a DC offset, which is
 * what the coupling capacitor after it removes; 40 Hz does that and leaves the
 * octave of a bass alone, where MK2's first 120 Hz cap deleted the thing the
 * pedal exists for.
 */
export class Octave {
  private readonly dc: Biquad;
  constructor(sampleRate: number) {
    this.dc = new Biquad("highpass", 40, 0.707, sampleRate);
  }
  run(x: number): number {
    return this.dc.run(Math.abs(x) * 2 - 1);
  }
}

/**
 * A skewed transfer curve with a dead zone in it, as a table.
 *
 * Both halves are one transfer function of a badly biased pair, so they are
 * one table: the offset is the asymmetry and the dead zone is the starve. It
 * is NORMALISED rather than clamped — the skewed curve runs further on one
 * side than the other, and clamping flattens the negative half against the
 * rail and turns a lean into a rectification.
 */
function curve(shape: (x: number) => number, dead: number, points = 2049): (x: number) => number {
  const table = new Float32Array(points);
  let top = 0;
  for (let i = 0; i < points; i++) {
    const x = (i / (points - 1)) * 2 - 1;
    let y = shape(x);
    const a = y < 0 ? -y : y;
    y = a <= dead ? 0 : (y < 0 ? -(a - dead) : a - dead) / (1 - dead);
    table[i] = y;
    if (a > top) top = y < 0 ? -y : y;
  }
  const k = top > 1 ? 1 / top : 1;
  for (let i = 0; i < points; i++) table[i] = Math.max(-1, Math.min(1, table[i]! * k));
  return (x: number): number => {
    const p = (Math.min(1, Math.max(-1, x)) + 1) * 0.5 * (points - 1);
    const i = p | 0;
    const f = p - i;
    const b = table[i + 1] ?? table[i]!;
    return table[i]! * (1 - f) + b * f;
  };
}

/**
 * THE FUZZ FACE. It keeps its bass — the stock 2.2 µF input cap is a corner
 * near 30 Hz, and the Analogman mod that drops it to 1 µF for "a brighter fuzz
 * with reduced low-end response" is the MODIFICATION, not the pedal. It clips
 * asymmetrically, because two unmatched transistors clip the two halves by
 * different amounts, and that asymmetry has a non-zero mean — which is what
 * the output coupling cap is for: without it the DC rides the note's envelope
 * and the pedal thumps at the attack rate instead of making a harmonic.
 */
export class Meat {
  private readonly cap: Biquad;
  private readonly dc: Biquad;
  private readonly dark: Biquad;
  private readonly pre: number;
  private readonly out: number;
  private readonly shape: (x: number) => number;
  constructor(dirt: number, bias: number, dark: number, level: number, sampleRate: number) {
    this.cap = new Biquad("highpass", 32, 0.707, sampleRate);
    this.dc = new Biquad("highpass", 48, 0.707, sampleRate);
    const d = Math.min(1, Math.max(0, dark));
    // 4480 Hz open, 320 Hz at the Fuzz O)))'s "dark variety with low pass filter"
    this.dark = new Biquad("lowpass", 320 * Math.pow(14, 1 - d), 0.707, sampleRate);
    // the same exponential law every drive knob here earned: a linear taper
    // spends its range in a quarter turn
    this.pre = 3 * Math.pow(260, Math.min(1, Math.max(0, dirt)));
    this.out = level * 1.6;
    const b = Math.min(1, Math.max(0, bias));
    const off = 0.10 + 0.35 * b;
    const base = Math.tanh(2.4 * off);
    this.shape = curve((x) => Math.tanh(2.4 * (x + off)) - base, 0.55 * b, 4097);
  }
  run(x: number): number {
    return this.dark.run(this.dc.run(this.shape(this.cap.run(x) * this.pre))) * this.out;
  }
}

/**
 * THE BIG MUFF. Two soft clippers each with its Miller pole — without them
 * the second stage clips the first one's raw square edges at full bandwidth
 * and every harmonic it makes lands on top, which is fizz rather than fuzz —
 * then the Ram's Head stack, then the speaker, which is a BANDPASS and not a
 * low-pass: a cabinet rolls off below its box tuning, and a clipper's output
 * running to DC is rumble that takes the limiter down with it.
 *
 * MASS is beside the dirt, not in it. Splitting the band is the technique the
 * sludge pedals are built on — the Supercollider's MASS, the Fuzz O)))'s LOW,
 * the Sludgehammer's BODY — so the wet path's floor sits at 90 Hz and the
 * clean low-passed copy carries the fundamental underneath it.
 *
 * AND MASS IS NOT MONOTONE AT THE FUNDAMENTAL, which is measured rather than
 * intended. The speaker's floor is one pole, so a 45 Hz note is still 12 dB
 * down rather than gone in the dirt, and the clean path's two 160 Hz poles
 * put its copy about a quarter cycle behind: on a 45 Hz sine the fundamental
 * reads 0.113 at MASS 0, 0.039 half way up, and 0.186 at the top. The knob
 * still does what it is for at the top of its travel, and the cancellation in
 * the middle is what these two paths are, not a fault in one of them.
 */
export class Muff {
  private readonly pre: number;
  private readonly m1: Biquad;
  private readonly m2: Biquad;
  private readonly lo: Biquad;
  private readonly hi: Biquad;
  private readonly air: Biquad;
  private readonly cab: Biquad;
  private readonly bLo: Biquad;
  private readonly bLo2: Biquad;
  private readonly tone: number;
  private readonly mass: number;
  private readonly out: number;
  constructor(sustain: number, tone: number, level: number, cabHz: number, mids: number, mass: number, sampleRate: number) {
    this.pre = 3 * Math.pow(320, Math.min(1, Math.max(0, sustain)));
    // the Miller caps: one pole inside each clipping stage
    this.m1 = new Biquad("lowpass", 5200, 0.707, sampleRate);
    this.m2 = new Biquad("lowpass", 5200, 0.707, sampleRate);
    // the tone stack: 33k with 0.01 µF and 33k with 0.004 µF, the Ram's Head values
    this.lo = new Biquad("lowpass", 482, 0.707, sampleRate);
    // MIDS is the AMZ mod: the treble leg walks from 1206 Hz down toward 240,
    // which takes the notch out of the midrange and fills it in
    this.hi = new Biquad("highpass", 1206 * Math.pow(0.2, Math.min(1, Math.max(0, mids))), 0.707, sampleRate);
    this.air = new Biquad("highpass", 90, 0.707, sampleRate);
    this.cab = new Biquad("lowpass", Math.min(16000, Math.max(1500, cabHz)), 0.707, sampleRate);
    this.bLo = new Biquad("lowpass", 160, 0.707, sampleRate);
    this.bLo2 = new Biquad("lowpass", 160, 0.707, sampleRate);
    this.tone = Math.min(1, Math.max(0, tone));
    this.mass = Math.min(1, Math.max(0, mass));
    this.out = level * 0.8;
  }
  run(x: number): number {
    const a = this.m1.run(Math.tanh(1.6 * (x * this.pre)));
    const b = this.m2.run(Math.tanh(1.6 * a));
    const stack = this.lo.run(b) * (1 - this.tone) + this.hi.run(b) * this.tone;
    const wet = this.cab.run(this.air.run(stack)) * this.out;
    // 24 dB/oct, a real crossover: the clean path owns the bottom and the
    // fuzz owns everything above it, so the note keeps its weight
    return wet + this.bLo2.run(this.bLo.run(x)) * this.mass;
  }
}

/**
 * THE CHAINSAW. The high knob is ONE control and TWO filters because the pedal
 * is: two overlapping bells make a wider, flatter shelf across the upper mids
 * than one bell of the same gain, and that plateau is the chainsaw. Their Q is
 * low because the article says console, not notch — at Q 1.1 the pair stacks
 * into a spike, which is a honk.
 */
export class Saw {
  private readonly pre: number;
  private readonly dc: Biquad;
  private readonly gL: Biquad;
  private readonly gH1: Biquad;
  private readonly gH2: Biquad;
  private readonly tame: Biquad;
  private readonly shape: (x: number) => number;
  private readonly out: number;
  constructor(dist: number, low: number, high: number, gate: number, tameHz: number, level: number, sampleRate: number) {
    this.pre = 3 * Math.pow(280, Math.min(1, Math.max(0, dist)));
    // the series germanium pair makes DC the same way any asymmetry does
    this.dc = new Biquad("highpass", 45, 0.707, sampleRate);
    const lo = 10 * Math.min(1, Math.max(0, low));
    const hi = 10 * Math.min(1, Math.max(0, high));
    this.gL = new Biquad("peaking", 86.79, 0.9, sampleRate, lo);
    this.gH1 = new Biquad("peaking", 958.47, 0.75, sampleRate, hi);
    this.gH2 = new Biquad("peaking", 1278.6, 0.75, sampleRate, hi);
    this.tame = new Biquad("lowpass", Math.min(12000, Math.max(1200, tameHz)), 0.707, sampleRate);
    // soft asymmetric bend, hard ceiling, germanium dead zone — in that order,
    // which is the order the three diode sets sit in
    const off = 0.08;
    const base = Math.tanh(1.9 * off);
    const ceil = 0.72;
    this.shape = curve((x) => {
      const y = Math.tanh(1.9 * (x + off)) - base;
      return y > ceil ? ceil : y < -ceil ? -ceil : y;
    }, Math.min(0.3, Math.max(0, gate)), 4097);
    this.out = level * 1.5;
  }
  run(x: number): number {
    const y = this.dc.run(this.shape(x * this.pre));
    return this.tame.run(this.gH2.run(this.gH1.run(this.gL.run(y)))) * this.out;
  }
}

/**
 * THE SAG — the rail, not the signal.
 *
 * One honest compromise, written down rather than hidden: a real starve is a
 * RAIL and moves the bias of every stage on it. Here the pedals are separate
 * blocks, so the sag is a STAGE, placed last in the dirt, where it squishes
 * whatever the clippers in front of it have made. That is the behaviour —
 * touch response, the note collapsing and blooming back — without the claim
 * that it is the same circuit.
 *
 * A SUPPLY DOES NOT ADD GAIN, IT TAKES AWAY HEADROOM. The small-signal gain
 * is divided back out, so a stiff supply is a wire and a collapsing one clips
 * earlier and quieter and blooms back.
 */
export class Sag {
  private readonly env: Follower;
  private readonly dc: Biquad;
  private readonly amt: number;
  private readonly idle: number;
  private readonly drive: number;
  private readonly fall: number;
  private readonly rise: number;
  private v: number;
  constructor(depth: number, idle: number, recovSec: number, draw: number, sampleRate: number) {
    // the follower: 1 ms to see the transient, 40 ms to forget it
    this.env = new Follower(0.001, 0.040, sampleRate);
    this.dc = new Biquad("highpass", 42, 0.707, sampleRate);
    this.amt = Math.min(1, Math.max(0, depth));
    this.idle = Math.min(1, Math.max(0.18, idle));
    this.drive = 3 * Math.pow(120, Math.min(1, Math.max(0, draw)));
    // 11 ms down, which is AmpBooks' measured 2.88 V/ms; the recovery knob up
    this.fall = 1 - Math.exp(-1 / (0.011 * sampleRate));
    this.rise = 1 - Math.exp(-1 / (Math.max(0.005, recovSec) * sampleRate));
    this.v = this.idle;
  }
  run(x: number): number {
    const env = this.env.run(x);
    const draw = env * 4 > 1 ? 1 : env * 4;
    const target = this.idle - this.amt * 0.82 * draw;
    this.v += (target - this.v) * (target < this.v ? this.fall : this.rise);
    const head = this.v > 0.05 ? this.v : 0.05;
    const u = (x * this.drive) / head;
    // a starved rail also skews the bias, so the clipping goes asymmetric as
    // it collapses — the "rougher" the sources describe. The DC that makes is
    // taken back out by the coupling cap, as on the Fuzz Face.
    return this.dc.run((Math.tanh(u) * head) / this.drive + (1 - this.v) * 0.015);
  }
}
