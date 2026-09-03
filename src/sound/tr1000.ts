/**
 * THE TR-1000 — the drum machine off MK2's rack, as arithmetic.
 *
 * The reason to build it is not its sound set: "16 analog voice circuits
 * lifted straight from the previous TR-808 and 909 designs and rebuilt with
 * modern components" (musicradar's announcement; musictech; corroborated by
 * Sound On Sound's review), so the sounds are ones this program mostly had.
 * What is new is the ARCHITECTURE — "each sound engine includes a dedicated
 * filter, amp, compressor, modulation" on top of a shared delay and reverb.
 *
 * Every drum here used to share one channel into one set of sends. There was
 * no way to put a long delay on the snare and a short room on the hat, and no
 * way to move them apart — which is why a kit stayed one texture however much
 * the desk moved. The 909's virtue over the 606 was individual outputs per
 * voice; this is that: a CHANNEL STRIP PER LANE with the six knobs the machine
 * puts on one — TUNE, DECAY, MIX, and the three assignable CTRLs, which here
 * are permanently wired to a filter and the sends.
 *
 * A KIT IS A LANE-TO-VOICE MAP AND NOTHING ELSE. The real machine carries an
 * ACB engine, an FM engine, a PCM engine and a sampler behind one panel, and
 * which voices are loaded is a SETTING, not a different box — the same answer
 * Reason gives with Kong. So this program's own drums are the ACOUSTIC kit and
 * the 808/909 circuits are the ANALOG one, under one machine with one panel.
 *
 *   acoustic  the voices in `voices.ts`, played by the strip: TUNE is a
 *             playback rate, because on a recording speed IS pitch, and DECAY
 *             truncates with a short release. That is what the machine's own
 *             sampler channel does with a pad that holds a recording.
 *   analog    the circuits below, retuned by the strip: a swept sine for the
 *             kick, two triangles and a noise band for the snare, and six
 *             squares at the metal ratios for the hats.
 *
 * THE CIRCUIT IS A SWITCH, NOT A DIAL. An 808 kick is a long sub boom with no
 * punch by design; the 909's is the punchy one, because "the introduction of
 * pitch modulation means you can get a super punchy kick... and the difference
 * between that initial attack and the lower, fundamental sustain is where the
 * punch lies" (LANDR, what-is-a-909). Two circuits are two instruments, so a
 * genre declares which machine it is playing and nothing slides between them.
 *
 * WHAT IS NOT PORTED, AND WHY. MK2's machine has ten channels — BD SD LT HT
 * RS HC CH OH CC RC — and its rim, clap, toms, crash and ride circuits with
 * them. This program writes notes on four lanes, so those five circuits would
 * be declared and never struck, which this repo calls a defect and not a
 * feature. The kit table below is the place they go the day a drum builder
 * writes a note on a tom.
 */

import { Biquad, Noise, fade } from "./dsp.ts";
import { hat, kick, snare, type NoteIn } from "./voices.ts";
import type { DrumLane, MachineRules, StripRules } from "../genre/spec.ts";

/** The 808's hi-hat ratios: six squares, deliberately inharmonic. [theory] */
const R808: readonly number[] = [1, 1.4471, 1.6170, 1.9265, 2.5028, 2.6637];

/** The metal stack's fundamental, before a ratio and the channel's tune. */
const METAL_HZ = 263;

/**
 * How far under full scale a voice's envelope has fallen when its buffer ends.
 *
 * MK2 ramped every envelope to 0.0002 of ITS OWN starting level, so a quiet
 * hit died in the same time but from lower down — which makes a soft hit a
 * SHORTER drum as well as a quieter one. Here the ramp is taken from full
 * scale, so the weight scales the drum and the decay knob alone says how long
 * it rings.
 */
const FLOOR = 0.0002;
const decayTau = (sec: number): number => Math.max(1e-4, sec) / Math.log(1 / FLOOR);

const buffer = (sec: number, sr: number): Float32Array => new Float32Array(Math.max(1, Math.ceil(sec * sr)));

/**
 * A square by polyBLEP: the partials above Nyquist are not made rather than
 * folded back down. Six of these run at once through a highpass, and aliased
 * hash under a 7 kHz corner is exactly where an ear would look for the hat.
 */
class Square {
  private readonly dp: number;
  private readonly live: boolean;
  private p = 0;
  constructor(hz: number, sampleRate: number) {
    this.dp = hz / sampleRate;
    this.live = hz > 0 && hz < sampleRate * 0.5;
  }
  next(): number {
    if (!this.live) return 0;
    const dt = this.dp;
    let y = this.p < 0.5 ? 1 : -1;
    y += Square.blep(this.p, dt);
    y -= Square.blep((this.p + 0.5) % 1, dt);
    this.p += dt;
    if (this.p >= 1) this.p -= 1;
    return y;
  }
  private static blep(t: number, dt: number): number {
    if (t < dt) { const x = t / dt; return x + x - x * x - 1; }
    if (t > 1 - dt) { const x = (t - 1) / dt; return x * x + x + x + 1; }
    return 0;
  }
}

/** A triangle from a phase ramp: its partials fall as 1/n², so it is naive on purpose. */
const triangle = (p: number): number => 4 * Math.abs(p - Math.floor(p + 0.5)) - 1;

/**
 * The level each circuit sits at, MEASURED against the voice this program
 * already had on that lane so that changing kits changes the drum and not the
 * balance. Every one of these puts one hit at its acoustic counterpart's peak,
 * at 44.1 kHz and full weight:
 *
 *   acoustic  kick 0.92   snare 0.86   hat 0.64
 *
 * PEAK AND NOT ENERGY, because these are one-shots and the difference in
 * energy is the instrument: an 808 hat's whole decay is 45 ms against a
 * sampled hat that is still sounding at 115, so matching their rms would put
 * the machine's hat four times as loud at the stick. MEASURED across a record
 * with every other knob equal, the analog kit lands 5.7 dB under the acoustic
 * one (lofi, seed 1, drums alone: rms 0.0211 against 0.0404) — which is what a
 * kit of short drums is, and is what the machine's own DRIVE and the strips'
 * MIX knobs are for.
 *
 * THE BASS DRUM HAS A LEVEL PER CIRCUIT. The 909 drops seven times in 12 ms,
 * so its body and its third-harmonic layer are still in step when the note is
 * loudest and the two add; the 808's slower sweep has them apart by then. One
 * constant for both circuits put the 909 kick over full scale at 1.10.
 */
const LEVEL = { kick: { "808": 0.74, "909": 0.52 }, snare: 1.14, hat: 0.23 } as const;

/** What the channel strip's TUNE means: semitones, as a ratio. */
const tuneOf = (strip: StripRules): number => Math.pow(2, strip.tune / 12);

/**
 * THE BASS DRUM. A sine swept down onto its fundamental, the body an octave
 * and a fifth over it, and a click on the front.
 *
 * PUNCH is the layer the 808 never had and a small speaker needs: 46–52% of
 * an 808 kick's energy sits under 100 Hz and its fundamental settles at 45–60,
 * which a laptop, a phone and most headphones do not reproduce at all. The
 * sources put the weight "around 110–140 Hz" (unison.audio, layering-drums;
 * transmissionsamples), and at this machine's tuning the THIRD harmonic is
 * 135–156 — inside that band, and the harmonic this circuit really makes,
 * because a bridged-T resonator through a clipping stage leans on the odd
 * ones. MK2 tried the second harmonic first and measured it doing nothing:
 * the octave of a 45 Hz kick is still under the speaker.
 */
function k808(n: NoteIn, M: MachineRules, strip: StripRules): Float32Array {
  const sr = n.sampleRate;
  const nine = M.circuit === "909";
  const tune = M.tune * tuneOf(strip);
  const dec = M.decay * strip.decay;
  // the 909 drops further and faster and rings about half as long: that
  // difference between the attack and the fundamental IS the punch
  const swp = nine ? 7.0 : 4.2;
  const swpT = nine ? 0.012 : 0.030;
  const ring = nine ? dec * 0.55 : dec;
  const out = buffer(ring + 0.05, sr);
  const tauBody = decayTau(ring);
  const tauPunch = decayTau(ring * 0.55);
  const twoPi = 2 * Math.PI;
  const level = LEVEL.kick[M.circuit];
  let phase = 0;
  let punchPhase = 0;
  const punch = M.punch;
  for (let i = 0; i < out.length; i++) {
    const t = i / sr;
    // an exponential sweep, as the circuit's envelope on the resonator is
    const hz = t < swpT ? tune * Math.pow(swp, 1 - t / swpT) : tune;
    phase += (twoPi * hz) / sr;
    let y = Math.sin(phase) * Math.exp(-t / tauBody) * 1.15;
    if (punch > 0) {
      punchPhase += (twoPi * hz * 3) / sr;
      y += Math.sin(punchPhase) * Math.exp(-t / tauPunch) * 0.85 * punch;
    }
    out[i] = y * level * n.gain;
  }
  // TONE opens a short noise click on the front — the 808's only transient,
  // tilted up around 6 kHz where the layer that cuts through a mix lives. The
  // 909 has an ATTACK control the 808 does not, so its beater is louder and a
  // touch longer.
  const clickSec = nine ? 0.016 : 0.010;
  const clickTau = decayTau(nine ? 0.018 : 0.012);
  if (M.tone > 0) {
    const noise = new Noise(n.seed);
    const hp = new Biquad("highpass", 2400, 0.7, sr);
    const pk = new Biquad("peaking", 6000, 0.9, sr, 6);
    const click = level * n.gain * (nine ? 1.15 : 0.5) * M.tone;
    const end = Math.min(out.length, Math.ceil((clickSec + clickTau * 4) * sr));
    for (let i = 0; i < end; i++) {
      const t = i / sr;
      const src = t < clickSec ? noise.next() : 0;
      out[i] = out[i]! + pk.run(hp.run(src)) * Math.exp(-t / clickTau) * click;
    }
  }
  return fade(out, sr);
}

/**
 * THE SNARE. Two fixed oscillators for the shell with TONE tilting between
 * them, and one noise band for the snares.
 *
 * The channel's TUNE moves the shell and NOT the snares: on the machine the
 * tune control is across the drum's tone circuit, and a wire buzz does not
 * change pitch when you tune the head.
 */
function s808(n: NoteIn, M: MachineRules, strip: StripRules): Float32Array {
  const sr = n.sampleRate;
  const tune = tuneOf(strip);
  const dec = strip.decay;
  const tone = M.sdtone;
  const snappy = M.snappy;
  const shell: readonly (readonly [number, number, number])[] = [
    [238, 0.55 * (1 - tone * 0.5), 0.11],
    [476, 0.35 * (0.4 + tone * 0.6), 0.06],
  ];
  const noiseSec = (0.045 + 0.10 * snappy) * dec;
  const longest = Math.max(noiseSec, ...shell.map(([, , d]) => d * dec));
  const out = buffer(longest + 0.03, sr);
  for (const [hz, amp, d] of shell) {
    const tau = decayTau(d * dec);
    const level = amp * (1 - snappy * 0.45) * LEVEL.snare * n.gain;
    const dp = (hz * tune) / sr;
    let p = 0;
    for (let i = 0; i < out.length; i++) {
      out[i] = out[i]! + triangle(p) * Math.exp(-(i / sr) / tau) * level;
      p += dp;
      if (p >= 1) p -= 1;
    }
  }
  const noise = new Noise(n.seed);
  const band = new Biquad("bandpass", 1600 + 2200 * tone, 0.6, sr);
  const tau = decayTau(noiseSec);
  const level = (0.30 + 0.75 * snappy) * LEVEL.snare * n.gain;
  for (let i = 0; i < out.length; i++) out[i] = out[i]! + band.run(noise.next()) * Math.exp(-(i / sr) / tau) * level;
  return fade(out, sr);
}

/**
 * THE HATS — six squares at the metal ratios through a highpass. Open and
 * closed are the same circuit; only the decay differs, which is what the
 * machine's two knobs say.
 */
function h808(n: NoteIn, decaySec: number, hpHz: number, strip: StripRules): Float32Array {
  const sr = n.sampleRate;
  const tune = tuneOf(strip);
  const dec = decaySec * strip.decay;
  const out = buffer(dec + 0.02, sr);
  const hp = new Biquad("highpass", hpHz * tune, 0.7, sr);
  const tau = decayTau(dec);
  const level = LEVEL.hat * n.gain;
  const stack = R808.map((r) => new Square(METAL_HZ * r * tune, sr));
  for (let i = 0; i < out.length; i++) {
    let y = 0;
    for (const sq of stack) y += sq.next();
    out[i] = hp.run(y) * Math.exp(-(i / sr) / tau) * level;
  }
  return fade(out, sr);
}

/**
 * A RECORDING PLAYED BY THE STRIP. The machine's sampler channel reads TUNE
 * as a playback rate — speed IS pitch — and DECAY as where to stop, with a
 * 12 ms release at the cut, because an abrupt stop on a ringing shell is a
 * click and a click on every kick is worse than a long tail. A decay knob
 * cannot lengthen a recording, so past 1 it is the recording.
 */
function replay(buf: Float32Array, rate: number, decay: number, sampleRate: number): Float32Array {
  const resampled = rate === 1
    ? buf
    : (() => {
      const out = new Float32Array(Math.max(1, Math.ceil(buf.length / rate)));
      for (let i = 0; i < out.length; i++) {
        const p = i * rate;
        const j = p | 0;
        const f = p - j;
        const a = buf[j] ?? 0;
        const b = buf[j + 1] ?? 0;
        out[i] = a * (1 - f) + b * f;
      }
      return out;
    })();
  if (decay >= 1) return resampled;
  const keep = Math.max(1, Math.round(resampled.length * decay));
  if (keep >= resampled.length) return resampled;
  const out = resampled.slice(0, keep);
  const rel = Math.min(out.length, Math.max(1, Math.round(0.012 * sampleRate)));
  for (let i = 0; i < rel; i++) {
    const k = out.length - rel + i;
    out[k] = out[k]! * (1 - i / rel);
  }
  return out;
}

/** Which circuit or recording each lane calls, per kit. A kit is this table and nothing else. */
export const KITS = {
  acoustic: { kick: "kick", snare: "snare", hat: "hat", openhat: "openhat" },
  analog: { kick: "k808", snare: "s808", hat: "h808", openhat: "oh808" },
} as const satisfies Readonly<Record<string, Readonly<Record<DrumLane, string>>>>;

/** What is playing a lane, by name — for the dump, the page, and the note cache's key. */
export const voiceOf = (lane: DrumLane, M: MachineRules): string => KITS[M.kit][lane];

/**
 * One hit of one lane, as the machine is currently loaded.
 *
 * Everything the strip does that is not a filter, a level or a send happens
 * here, because TUNE and DECAY are part of what the note IS — the filter, the
 * level and the sends are nodes the voice passes THROUGH, and those live on
 * the channel where they can be moved while the record plays.
 */
export function drum(lane: DrumLane, n: NoteIn, M: MachineRules): Float32Array {
  const strip = M.channels[lane];
  if (M.kit === "analog") {
    switch (lane) {
      case "kick": return k808(n, M, strip);
      case "snare": return s808(n, M, strip);
      case "hat": return h808(n, M.chdecay, 7200, strip);
      case "openhat": return h808(n, M.ohdecay, 6200, strip);
    }
  }
  const plain = lane === "kick" ? kick(n) : lane === "snare" ? snare(n) : hat(n, lane === "openhat");
  const rate = tuneOf(strip);
  if (rate === 1 && strip.decay >= 1) return plain;
  return replay(plain, rate, strip.decay, n.sampleRate);
}

/**
 * THE CHANNEL STRIP, as the part of it that runs on a block: the filter and
 * the level. Held rather than rebuilt, so a filter retuned while the record
 * plays keeps its history and does not click.
 */
export class Strip {
  private cut: Biquad | null = null;
  private cutHz = 0;
  /** The lane's own buffer: hits land here, and the channel folds it into the kit. */
  readonly buf: Float32Array;
  constructor(block: number) {
    this.buf = new Float32Array(block);
  }
  tune(strip: StripRules, sampleRate: number): void {
    // a filter that would pass everything is not built, exactly as the world's are not
    if (strip.cut >= 19000) { this.cut = null; this.cutHz = 0; return; }
    if (this.cut === null) this.cut = new Biquad("lowpass", strip.cut, 0.707, sampleRate);
    else if (this.cutHz !== strip.cut) this.cut.set("lowpass", strip.cut, 0.707, sampleRate);
    this.cutHz = strip.cut;
  }
  run(x: number): number {
    return this.cut === null ? x : this.cut.run(x);
  }
}

/** Nothing declared, nothing built: is this machine doing anything the wire does not? */
export const inert = (M: MachineRules, lanes: Iterable<DrumLane>): boolean => {
  if (M.drive !== 1 || M.filterHz < 19000) return false;
  for (const lane of lanes) {
    const s = M.channels[lane];
    if (s.tune !== 0 || s.decay !== 1 || s.level !== 1 || s.cut < 19000) return false;
    for (const v of Object.values(s.sends)) if (v > 0) return false;
  }
  return true;
};

/** The kit's own drive and filter, on the sum of its channels. */
export class KitBus {
  private lp: Biquad | null = null;
  private hz = 0;
  tune(M: MachineRules, sampleRate: number): void {
    if (M.filterHz >= 19000) { this.lp = null; this.hz = 0; return; }
    if (this.lp === null) this.lp = new Biquad("lowpass", M.filterHz, 0.707, sampleRate);
    else if (this.hz !== M.filterHz) this.lp.set("lowpass", M.filterHz, 0.707, sampleRate);
    this.hz = M.filterHz;
  }
  /**
   * ONE DRIVE PER KIT, NOT ONE PER VOICE. The machine's ANALOG FX section
   * drives the whole box, which is what that section is for; the strips have
   * a filter and a level and no drive at all.
   */
  run(x: number, drive: number): number {
    const y = this.lp === null ? x : this.lp.run(x);
    return drive === 1 ? y : Math.tanh(y * drive) / Math.tanh(drive);
  }
}
