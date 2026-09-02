/**
 * Stage 6 — THE SOUND.
 *
 * The performance's events become samples. Every event is one note of one
 * instrument, rendered on its own and added to its PART's own buffer at its
 * time. Then the parts go through the desk:
 *
 *   PEDALS   each part feeds the pedal board by its own amount, and the
 *            board is a chain of stompboxes in the order a player wires them
 *   WORLD    each part is placed in space — panned, swept, and set at an
 *            azimuth and a distance round the listener, which the far ear
 *            hears later and duller, and which a distant part hears quieter
 *            and more in the room
 *   SENDS    each part feeds the rack's wet units — echo, spring, room,
 *            ensemble, flange — by its own amount, and each comes back at
 *            its return level
 *   INSERTS  the sum goes through the pole, the tape, the medium, the dust
 *            and the master, in that order
 *
 * Stereo throughout from the world on. Pure arithmetic on typed arrays: no
 * audio graph, no clock but the sample index, so it runs the same in a
 * browser and in a test, and a record rendered twice is the same bytes.
 *
 * THE RECORD IS MADE A BLOCK AT A TIME. Everything above is a chain of
 * stateful units run sample by sample in order, which is exactly what can be
 * stopped part way and picked up again. So the desk is an ENGINE that holds
 * that state and fills whatever length of buffer it is handed: `render` is
 * the engine driven from end to end, and the page drives the same engine a
 * quarter-second at a time to play a record while it is still being made.
 * One implementation, so what you hear is what you save.
 *
 * The old shape — every part to its own full-length buffer, then the desk
 * over the whole record — could not start until it had finished, could not
 * be cancelled, and asked for 881 MB of buffers for a three-minute record.
 * A block asks for the block.
 *
 * A NOTE IS RENDERED ONCE AND USED WHEREVER IT RECURS. A record loops, so
 * the same pitch of the same length comes round again and again — but the
 * arc moves every note's weight a little, and rendering by exact weight
 * made 90% of notes unique for differences no ear could name. So weight is
 * split the way a sampled instrument splits it: VELOCITY LAYERS decide the
 * timbre, and the note is then scaled to the weight it actually has. Only
 * the brightness is in layers, and the approximation measures 43 dB below
 * the record.
 */

import { artOf, shapesTheNote } from "../core/articulation.ts";
import { hash32 } from "../core/rng.ts";
import { ROLES, SENDS, type PedalsRules, type RackRules, type Role, type SoundRules, type SoundSpec } from "../genre/spec.ts";
import { articulate } from "./articulate.ts";
import type { Event } from "../stage/perform.ts";
import type { Song } from "../song.ts";
import {
  Biquad, Echo, Ensemble, Flanger, Fuzz, Line, Medium, Noise, Overdrive, Phaser, Pole, Reverb, Spring, Tremolo, Wah,
  panGains, saturate,
} from "./dsp.ts";
import { flute, hat, kick, organ, pad, pluck, rhodes, snare, sub, type NoteIn } from "./voices.ts";

export interface Stereo {
  readonly left: Float32Array;
  readonly right: Float32Array;
}

export interface RenderOptions {
  readonly sampleRate?: number;
  /** Render one part alone, for measuring it. */
  readonly only?: Role;
  /**
   * How many velocity layers a voice's timbre is rendered in. Raise it to
   * measure what the layering costs; there is no reason to change it
   * otherwise, and a number past the note count is the same as none.
   */
  readonly layers?: number;
  /** Move any knob of the desk — rack, mixer, world, pedals — for this rendering, leaving the genre as it is. */
  readonly desk?: SoundSpec;
  /** The longest block the engine will be asked for. Only the caller's business. */
  readonly blockSize?: number;
}

type Send = (typeof SENDS)[number];

const LAYERS = 64;

/** Blocks the offline render is driven in. Big enough that the per-block work disappears. */
const BLOCK = 8192;

/**
 * −1 dBTP: the true-peak ceiling streaming masters keep under
 * (kansamples.com mastering-loudness-lufs-streaming). The saturator holds
 * the record under full scale; this holds it under the ceiling.
 */
const CEILING = 0.89;

/** The furthest the far ear hears a sound late: Woodworth's head, about 0.65 ms. */
const ITD_SEC = 0.00065;

/**
 * A voice sounding: its rendered buffer, how far into it we are, where its
 * next sample falls in the record, and where it goes.
 *
 * `abs` is what lets a note start in the middle of a block and carry on into
 * the next one without the block boundary being anywhere in the arithmetic.
 */
interface Flight {
  readonly buf: Float32Array;
  /** The next index of `buf` to sound. */
  pos: number;
  /** The absolute sample of the record that `buf[pos]` lands on. */
  abs: number;
  readonly dst: Float32Array;
  readonly level: number;
}

const sig = (o: unknown): string => JSON.stringify(o);

/**
 * A part on its way to the sum: through its pedal board, then into the world.
 *
 * The units are held rather than rebuilt, so a knob that only moves a level
 * costs nothing and a knob that retunes a filter does it WITHOUT clearing the
 * filter's state — `Biquad.set` keeps its history, so a pan moved while the
 * record plays does not click.
 */
class Channel {
  /** The block being built: notes land here, the board reads it, the world writes L and R. */
  readonly dry: Float32Array;
  private readonly boarded: Float32Array;
  readonly L: Float32Array;
  readonly R: Float32Array;

  // the pedal board
  private pedals: ((x: number) => number)[] = [];
  private pedalSig = "";

  // the world
  private shadow: Biquad | null = null;
  private dark: Biquad | null = null;
  private back: Biquad | null = null;
  private line: Line | null = null;
  private lateSec = 0;
  private dGain = 1;
  private side = 0;
  private basePan = 0;
  private gl = 0;
  private gr = 0;

  readonly role: Role;

  constructor(role: Role, block: number) {
    this.role = role;
    this.dry = new Float32Array(block);
    this.boarded = new Float32Array(block);
    this.L = new Float32Array(block);
    this.R = new Float32Array(block);
  }

  /** Build or retune from the rules. Called once offline, and on every knob move live. */
  tune(S: SoundRules, sr: number): void {
    const ch = S.mix[this.role];
    const W = S.world;

    // ── the board ──
    const ps = sig([ch.pedals > 0, S.pedals]);
    if (ps !== this.pedalSig) {
      this.pedalSig = ps;
      this.pedals = ch.pedals > 0 ? board(S.pedals, sr) : [];
    }

    // ── the world ──
    const width = W.width;
    const rad = (ch.az * Math.PI) / 180;
    this.side = Math.sin(rad); // −1 left … 1 right
    this.lateSec = ITD_SEC * Math.abs(this.side) * width;
    // a filter that would pass everything is not built: a lowpass at the top
    // of hearing is an identity that costs a biquad a sample
    const tuned = (held: Biquad | null, hz: number): Biquad | null => {
      if (hz >= 19000) return null;
      if (held === null) return new Biquad("lowpass", hz, 0.7, sr);
      held.set("lowpass", hz, 0.7, sr);
      return held;
    };
    this.shadow = tuned(this.shadow, 20000 - (20000 - 1800) * Math.abs(this.side) * width);
    if (this.lateSec > 0) this.line ??= new Line(0.002, sr);
    else this.line = null;
    // distance: quieter, darker, by the world's depth
    this.dGain = 1 / (1 + 1.5 * ch.dist * W.depth);
    this.dark = tuned(this.dark, 20000 - (20000 - 2500) * ch.dist * W.depth);
    // a sound behind is a little darker in both ears
    this.back = tuned(this.back, 20000 - (20000 - 4000) * Math.max(0, -Math.cos(rad)) * width);
    this.basePan = Math.max(-1, Math.min(1, ch.pan + this.side * 0.8 * width));
    [this.gl, this.gr] = panGains(this.basePan);
  }

  /** The block: the dry notes through the board and into the world. `t` is the absolute sample. */
  run(n: number, t: number, S: SoundRules, sr: number): void {
    const ch = S.mix[this.role];
    const src = this.dry;

    // ── the board: nothing fed, nothing built ──
    let input = src;
    if (ch.pedals > 0 && this.pedals.length > 0) {
      const out = this.boarded;
      const stages = this.pedals;
      for (let i = 0; i < n; i++) {
        let y = src[i]!;
        for (const st of stages) y = st(y);
        out[i] = src[i]! * (1 - ch.pedals) + y * ch.pedals;
      }
      input = out;
    }

    // ── the world ──
    const { L, R, shadow, dark, back, line, lateSec, dGain, side } = this;
    const twoPi = 2 * Math.PI;
    const sweeping = ch.sweepDepth > 0;
    let gl = this.gl;
    let gr = this.gr;
    for (let i = 0; i < n; i++) {
      let x = input[i]! * dGain;
      if (dark) x = dark.run(x);
      if (back) x = back.run(x);
      let late = x;
      if (line) { line.write(x); late = line.read(lateSec); }
      const shadowed = shadow ? shadow.run(late) : late;
      if (sweeping && ((t + i) & 63) === 0) {
        // the sweep is slow: the pan law is worked out every 64 samples
        const pan = Math.max(-1, Math.min(1, this.basePan + ch.sweepDepth * Math.sin((twoPi * ch.sweepHz * (t + i)) / sr)));
        [gl, gr] = panGains(pan);
      }
      if (side >= 0) { L[i] = shadowed * gl; R[i] = x * gr; } else { L[i] = x * gl; R[i] = shadowed * gr; }
    }
    this.gl = gl;
    this.gr = gr;
  }
}

/** The pedal board as a chain of stages, in the order a player wires them. */
function board(P: PedalsRules, sr: number): ((x: number) => number)[] {
  const stages: ((x: number) => number)[] = [];
  const stage = <T extends { run(x: number): number }>(unit: T, mix: number): void => {
    if (mix > 0) stages.push((x) => x * (1 - mix) + unit.run(x) * mix);
  };
  stage(new Wah(P.wah.rateHz, P.wah.depth, sr), P.wah.mix);
  stage(new Overdrive(P.overdrive.drive, P.overdrive.tone, sr), P.overdrive.mix);
  stage(new Fuzz(P.fuzz.gain, sr), P.fuzz.mix);
  stage(new Phaser(P.phaser.rateHz, P.phaser.depth, sr), P.phaser.mix);
  stage(new Tremolo(P.tremolo.rateHz, P.tremolo.depth, sr), P.tremolo.mix);
  return stages;
}

/** A wet unit as a stereo pair: two of it, the right one a little different, so the return has width. */
function returns(sd: Send, rack: RackRules, beatSec: number, sr: number): [(x: number) => number, (x: number) => number] {
  switch (sd) {
    case "echo": {
      const a = new Echo(rack.echo.beats * beatSec, rack.echo.feedback, sr);
      const b = new Echo(rack.echo.beats * beatSec * 1.5, rack.echo.feedback, sr);
      return [(x) => a.run(x), (x) => b.run(x)];
    }
    case "spring": {
      const a = new Spring(rack.spring.sec, sr), b = new Spring(rack.spring.sec * 1.07, sr);
      return [(x) => a.run(x), (x) => b.run(x)];
    }
    case "room": {
      const a = new Reverb(rack.room.sec, sr), b = new Reverb(rack.room.sec * 1.05, sr);
      return [(x) => a.run(x), (x) => b.run(x)];
    }
    case "ensemble": {
      const a = new Ensemble(rack.ensemble.rateHz, rack.ensemble.depth, sr), b = new Ensemble(rack.ensemble.rateHz * 1.1, rack.ensemble.depth, sr);
      return [(x) => a.run(x), (x) => b.run(x)];
    }
    case "flange": {
      const a = new Flanger(rack.flange.rateHz, rack.flange.depth, sr), b = new Flanger(rack.flange.rateHz * 0.9, rack.flange.depth, sr);
      return [(x) => a.run(x), (x) => b.run(x)];
    }
  }
}

/**
 * The record, a block at a time.
 *
 * Everything that persists between blocks lives here: how far into the record
 * we are, which notes are still sounding, and every filter, delay line and
 * feedback loop of the desk. Hand it a pair of buffers and it fills them with
 * the next slice of the record.
 */
export class Engine {
  readonly sampleRate: number;
  readonly blockSize: number;
  /** How many samples the whole record is. */
  readonly length: number;

  private S: SoundRules;
  private readonly seed: number;
  private readonly beatSec: number;
  private readonly voices: Readonly<Record<string, (n: NoteIn) => Float32Array>>;
  private readonly events: readonly Event[];
  private readonly layers: number;
  private readonly only: Role | undefined;

  /** Notes rendered once, used wherever they recur. */
  private readonly cache = new Map<string, Float32Array>();
  private cursor = 0;
  private flight: Flight[] = [];
  private t = 0;

  private readonly channels = new Map<Role, Channel>();
  private readonly sumL: Float32Array;
  private readonly sumR: Float32Array;

  // ── the returns, as a patched network ──
  private units: Send[] = [];
  private pairs: [(x: number) => number, (x: number) => number][] = [];
  private busL: (Float32Array | null)[] = [];
  private busR: (Float32Array | null)[] = [];
  private outL = new Float32Array(0);
  private outR = new Float32Array(0);
  private dcL: Biquad[] = [];
  private dcR: Biquad[] = [];
  private gain: number[][] = [];
  private patched = false;
  private wireSig = "";

  // ── the inserts on the sum ──
  private pole: [Pole, Pole] | null = null;
  private poleSig = "";
  private lp: [Biquad, Biquad];
  private medium: [Medium, Medium] | null = null;
  private mediumSig = "";
  private lines: [Line, Line];
  private lineSig = "";
  private swingSec = 0;
  private baseSec = 0;
  private readonly crackle: Noise;
  private readonly crackleHp: [Biquad, Biquad];

  constructor(song: Song, opts: RenderOptions = {}) {
    const sr = opts.sampleRate ?? 44100;
    this.sampleRate = sr;
    this.blockSize = opts.blockSize ?? BLOCK;
    this.length = Math.ceil(song.performance.seconds * sr);
    this.S = settle(song.chart.genre.sound, opts.desk);
    this.seed = song.chart.seed;
    this.beatSec = 60 / song.chart.tempo;
    this.layers = opts.layers ?? LAYERS;
    this.only = opts.only;
    this.events = song.performance.events;
    this.voices = { rhodes, sub, pluck, organ, pad, flute };

    const b = this.blockSize;
    this.sumL = new Float32Array(b);
    this.sumR = new Float32Array(b);
    // a part exists if the record has a note for it — the same test the old
    // shape made by whether a buffer had ever been allocated for it
    for (const role of ROLES) {
      if (this.only !== undefined && role !== this.only) continue;
      if (this.events.some((e) => e.role === role)) this.channels.set(role, new Channel(role, b));
    }

    this.lp = [new Biquad("lowpass", this.S.rack.tape.lowpassHz, 0.71, sr), new Biquad("lowpass", this.S.rack.tape.lowpassHz, 0.71, sr)];
    this.lines = [new Line(1, sr), new Line(1, sr)];
    this.crackle = new Noise(hash32(`crackle/${this.seed}`));
    this.crackleHp = [new Biquad("highpass", 500, 0.7, sr), new Biquad("highpass", 500, 0.7, sr)];
    this.tune();
  }

  /** Where the engine is, in samples and in seconds. */
  get at(): number { return this.t; }
  get atSec(): number { return this.t / this.sampleRate; }
  get done(): boolean { return this.t >= this.length; }

  /**
   * Move any knob of the desk while the record is playing.
   *
   * Levels, sends, returns and the master are read afresh every block, so
   * they take effect at the next block and cost nothing. A knob that changes
   * what a unit IS — a room's decay, an echo's time — rebuilds that unit and
   * only that unit, so its tail restarts while nothing else is touched.
   */
  setDesk(base: SoundRules, over: SoundSpec | undefined): void {
    this.S = settle(base, over);
    this.tune();
  }

  private tune(): void {
    const sr = this.sampleRate;
    for (const ch of this.channels.values()) ch.tune(this.S, sr);
    this.wire();
    this.inserts();
  }

  /** Which wet units are live, what feeds them, and what they feed. */
  private wire(): void {
    const S = this.S;
    const P = S.patch;

    // a send has a bus if some part actually feeds it
    const fed = new Set<Send>();
    for (const role of this.channels.keys()) {
      const ch = S.mix[role];
      const roomExtra = S.world.depth * ch.dist * 0.5;
      for (const sd of SENDS) {
        if (ch.sends[sd] + (sd === "room" ? roomExtra : 0) > 0) fed.add(sd);
      }
    }
    // a unit is live if something feeds it — a part's send, or another unit
    // through the patch.
    //
    // SEEDED IN `SENDS` ORDER, NOT IN THE ORDER THE PARTS HAPPEN TO FEED THEM.
    // The units are summed into the record in this order, and float addition
    // is not associative: discovering `room` before `echo` because the drums
    // are placed further away than the keys moves the record by a last bit.
    const live = new Set<Send>();
    for (const sd of SENDS) if (fed.has(sd)) live.add(sd);
    let grew = true;
    while (grew) {
      grew = false;
      for (const from of live) for (const to of SENDS) if (P[from][to] > 0 && !live.has(to)) { live.add(to); grew = true; }
    }
    // and it is heard if its return is up or it feeds a unit that is
    const units = [...live].filter((sd) => S.rack[sd].ret > 0 || SENDS.some((to) => P[sd][to] > 0));

    const s = sig([units, units.map((u) => S.rack[u]), units.map((from) => units.map((to) => P[from][to]))]);
    if (s === this.wireSig) return;
    const rebuildAll = units.join() !== this.units.join();
    const held = new Map(this.units.map((u, i) => [u, this.pairs[i]!] as const));
    const heldSig = new Map(this.units.map((u) => [u, sig(this.rackSigOf(u))] as const));
    this.wireSig = s;

    const b = this.blockSize;
    this.units = units;
    this.pairs = units.map((sd) => {
      const keep = !rebuildAll && held.get(sd);
      // only a unit whose own knobs moved is rebuilt; the rest keep their tails
      if (keep && heldSig.get(sd) === sig(this.rackSigOf(sd))) return keep;
      return returns(sd, S.rack, this.beatSec, this.sampleRate);
    });
    this.busL = units.map((sd) => (fed.has(sd) ? new Float32Array(b) : null));
    this.busR = units.map((sd) => (fed.has(sd) ? new Float32Array(b) : null));
    this.outL = new Float32Array(units.length);
    this.outR = new Float32Array(units.length);
    this.dcL = units.map(() => new Biquad("highpass", 20, 0.7, this.sampleRate));
    this.dcR = units.map(() => new Biquad("highpass", 20, 0.7, this.sampleRate));
    this.gain = units.map((from) => units.map((to) => P[from][to]));
    this.patched = this.gain.some((row) => row.some((g) => g > 0));
  }

  /**
   * What a wet unit is MADE of, apart from its return level — so that turning
   * a return up does not rebuild the unit and cut its tail off.
   */
  private rackSigOf(sd: Send): unknown {
    const r = this.S.rack[sd] as Record<string, unknown>;
    const made: Record<string, unknown> = {};
    for (const k of Object.keys(r)) if (k !== "ret") made[k] = r[k];
    return [made, this.beatSec];
  }

  /** The inserts: built once, retuned in place where a filter can be. */
  private inserts(): void {
    const sr = this.sampleRate;
    const K = this.S.rack;
    const ps = sig([K.pole.mix > 0, K.pole.hz, K.pole.resonance]);
    if (ps !== this.poleSig) {
      this.poleSig = ps;
      this.pole = K.pole.mix > 0 ? [new Pole(K.pole.hz, K.pole.resonance, sr), new Pole(K.pole.hz, K.pole.resonance, sr)] : null;
    }
    this.lp[0].set("lowpass", K.tape.lowpassHz, 0.71, sr);
    this.lp[1].set("lowpass", K.tape.lowpassHz, 0.71, sr);
    const ms = sig([K.medium.mix > 0, K.medium.kind]);
    if (ms !== this.mediumSig) {
      this.mediumSig = ms;
      this.medium = K.medium.mix > 0 ? [new Medium(K.medium.kind, hash32(`medium/${this.seed}/L`), sr), new Medium(K.medium.kind, hash32(`medium/${this.seed}/R`), sr)] : null;
    }
    const dev = Math.pow(2, K.tape.wowCents / 1200) - 1;
    this.swingSec = dev / (2 * Math.PI * K.tape.wowHz);
    this.baseSec = this.swingSec + 0.002;
    const ls = sig([this.baseSec, this.swingSec]);
    if (ls !== this.lineSig) {
      this.lineSig = ls;
      const cap = this.baseSec + this.swingSec + 0.01;
      this.lines = [new Line(cap, sr), new Line(cap, sr)];
    }
  }

  /** Admit every note that starts inside this block, and mix what is sounding. */
  private notes(n: number): void {
    const sr = this.sampleRate;
    const end = this.t + n;
    const layers = this.layers;
    const S = this.S;
    while (this.cursor < this.events.length) {
      const e = this.events[this.cursor]!;
      const at = Math.round(e.tSec * sr);
      if (at >= end) break;
      this.cursor++;
      if (this.only !== undefined && e.role !== this.only) continue;
      const dst = this.channels.get(e.role);
      if (dst === undefined) continue;
      const layer = Math.max(1, Math.round(e.gain * layers));
      const layerGain = layer / layers;
      const voice = e.role === "drums" ? e.lane : S.voices[e.role];
      const what = `${this.seed}/${voice}/${e.pitch ?? ""}/${e.durSec}`;
      // the manner is part of what the note IS, so it is part of the key: a
      // hammered note and a struck one of the same pitch and length are two
      // different buffers, and each is still rendered only once
      const art = artOf(e.art);
      const key = `${what}/${layer}/${shapesTheNote(art) ? art.name : ""}`;
      let buf = this.cache.get(key);
      if (buf === undefined) {
        const note: NoteIn = { midi: e.pitch ?? 0, heldSec: e.durSec, gain: layerGain, seed: hash32(what), sampleRate: sr };
        const plain = e.role === "drums"
          ? e.lane === "kick" ? kick : e.lane === "snare" ? snare : (n: NoteIn) => hat(n, e.lane === "openhat")
          : this.voices[S.voices[e.role]]!;
        buf = shapesTheNote(art) ? articulate(plain, note, art) : plain(note);
        this.cache.set(key, buf);
      }
      // a downbeat may be pushed before the top of the record: the part of the
      // note that fell before zero is not heard, exactly as before
      const skip = at < 0 ? -at : 0;
      this.flight.push({ buf, pos: skip, abs: at + skip, dst: dst.dry, level: e.gain / layerGain });
    }

    for (const ch of this.channels.values()) ch.dry.fill(0, 0, n);
    if (this.flight.length === 0) return;
    // in event order, which is the order the old shape added them in, so a
    // sample two notes land on is the same sum of the same two floats
    const still: Flight[] = [];
    for (const f of this.flight) {
      const buf = f.buf, dst = f.dst, level = f.level;
      let i = f.abs - this.t;
      let p = f.pos;
      for (; i < n && p < buf.length; i++, p++) dst[i] = dst[i]! + buf[p]! * level;
      f.pos = p;
      f.abs = this.t + i;
      if (p < buf.length) still.push(f);
    }
    this.flight = still;
  }

  /**
   * Fill `L` and `R` with the next `n` samples of the record.
   *
   * Returns how many were written, which is short of `n` only at the end.
   */
  block(L: Float32Array, R: Float32Array, n: number): number {
    const want = Math.max(0, Math.min(n, this.blockSize, this.length - this.t));
    if (want === 0) return 0;
    const S = this.S;
    const sumL = this.sumL, sumR = this.sumR;
    sumL.fill(0, 0, want);
    sumR.fill(0, 0, want);
    for (let u = 0; u < this.units.length; u++) {
      this.busL[u]?.fill(0, 0, want);
      this.busR[u]?.fill(0, 0, want);
    }

    this.notes(want);

    // ── every part, in the same order every time, so the sum is the same sum ──
    for (const role of ROLES) {
      const c = this.channels.get(role);
      if (c === undefined) continue;
      const ch = S.mix[role];
      c.run(want, this.t, S, this.sampleRate);
      const cl = c.L, cr = c.R, level = ch.level;
      for (let i = 0; i < want; i++) {
        sumL[i] = sumL[i]! + cl[i]! * level;
        sumR[i] = sumR[i]! + cr[i]! * level;
      }
      // a distant part is more in the room than a near one: the world's depth
      // adds to its room send
      const roomExtra = S.world.depth * ch.dist * 0.5;
      for (let u = 0; u < this.units.length; u++) {
        const sd = this.units[u]!;
        const amount = ch.sends[sd] + (sd === "room" ? roomExtra : 0);
        if (amount <= 0) continue;
        const bl = this.busL[u], br = this.busR[u];
        if (!bl || !br) continue;
        for (let i = 0; i < want; i++) {
          bl[i] = bl[i]! + cl[i]! * amount * level;
          br[i] = br[i]! + cr[i]! * amount * level;
        }
      }
    }

    // ── returns: each sample, every live unit takes its bus plus what the
    // others put out LAST sample through the patch: one sample of latency in
    // the loop is how feedback exists at all. The loop is held under full
    // scale and kept off DC, so a patch that runs hot rings rather than runs
    // away. ──
    const un = this.units.length;
    if (un > 0) {
      const outL = this.outL, outR = this.outR, gain = this.gain, patched = this.patched;
      for (let i = 0; i < want; i++) {
        for (let u = 0; u < un; u++) {
          const bl = this.busL[u], br = this.busR[u];
          let inL = bl ? bl[i]! : 0, inR = br ? br[i]! : 0;
          if (patched) {
            let fbL = 0, fbR = 0;
            for (let v = 0; v < un; v++) { const g = gain[v]![u]!; if (g > 0) { fbL += outL[v]! * g; fbR += outR[v]! * g; } }
            inL += Math.tanh(this.dcL[u]!.run(fbL)); inR += Math.tanh(this.dcR[u]!.run(fbR));
          }
          const yL = this.pairs[u]![0](inL), yR = this.pairs[u]![1](inR);
          outL[u] = yL; outR[u] = yR;
          const ret = S.rack[this.units[u]!].ret;
          sumL[i] = sumL[i]! + yL * ret; sumR[i] = sumR[i]! + yR * ret;
        }
      }
    }

    this.runInserts(sumL, sumR, L, R, want);
    this.t += want;
    return want;
  }

  /** The sum through the pole, the tape, the medium, the dust and the master. */
  private runInserts(inL: Float32Array, inR: Float32Array, outL: Float32Array, outR: Float32Array, n: number): void {
    const K = this.S.rack;
    const sr = this.sampleRate;
    const twoPi = 2 * Math.PI;
    const blend = (dry: number, wet: number, amount: number): number => dry * (1 - 0.5 * amount) + wet * amount;
    const wowing = K.tape.wowCents > 0;
    const dusty = K.vinyl.crackle > 0;
    const gain = CEILING * K.master.level;
    const drive = K.tape.drive;
    const pole = this.pole, medium = this.medium;
    const lpL = this.lp[0], lpR = this.lp[1], lineL = this.lines[0], lineR = this.lines[1];
    const hpL = this.crackleHp[0], hpR = this.crackleHp[1];
    const baseSec = this.baseSec, swingSec = this.swingSec, crackle = this.crackle;
    const t = this.t;

    for (let i = 0; i < n; i++) {
      const delaySec = wowing ? baseSec + swingSec * Math.sin((twoPi * K.tape.wowHz * (t + i)) / sr) : 0;
      // dust is one record, so both channels get the same tick
      const tick = dusty && crackle.next() > 0.9995 ? crackle.next() : 0;
      let x = inL[i]!, y: number;
      if (pole) x = blend(x, pole[0].run(x), K.pole.mix);
      x = lpL.run(x);
      if (wowing) { lineL.write(x); y = lineL.read(delaySec); } else y = x;
      if (medium) y = blend(y, medium[0].run(y), K.medium.mix);
      outL[i] = gain * saturate(y + (dusty ? hpL.run(tick) * K.vinyl.crackle : 0), drive);
      x = inR[i]!;
      if (pole) x = blend(x, pole[1].run(x), K.pole.mix);
      x = lpR.run(x);
      if (wowing) { lineR.write(x); y = lineR.read(delaySec); } else y = x;
      if (medium) y = blend(y, medium[1].run(y), K.medium.mix);
      outR[i] = gain * saturate(y + (dusty ? hpR.run(tick) * K.vinyl.crackle : 0), drive);
    }
  }
}

/** The whole record: the engine driven from end to end. */
export function render(song: Song, opts: RenderOptions = {}): Stereo {
  const engine = new Engine(song, opts);
  const left = new Float32Array(engine.length);
  const right = new Float32Array(engine.length);
  let at = 0;
  while (at < engine.length) {
    const n = Math.min(engine.blockSize, engine.length - at);
    engine.block(left.subarray(at, at + n), right.subarray(at, at + n), n);
    at += n;
  }
  return { left, right };
}

/** The genre's desk with the page's changes laid over it, knob by knob, two levels deep. */
export function settle(base: SoundRules, over: SoundSpec | undefined): SoundRules {
  if (over === undefined) return base;
  const deep = (a: unknown, b: unknown): unknown => {
    if (b === undefined) return a;
    if (typeof a === "object" && a !== null && typeof b === "object" && b !== null && !Array.isArray(a)) {
      const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
      for (const [k, v] of Object.entries(b as Record<string, unknown>)) out[k] = deep(out[k], v);
      return out;
    }
    return b;
  };
  return deep(base, over) as SoundRules;
}

const one = (b: Float32Array | Stereo): Float32Array => (b instanceof Float32Array ? b : b.left);
/** RMS of a buffer, or of a stereo record's mid (both channels together). */
export const rms = (b: Float32Array | Stereo): number => {
  if (b instanceof Float32Array) return Math.sqrt(b.reduce((a, v) => a + v * v, 0) / Math.max(1, b.length));
  let s = 0;
  for (let i = 0; i < b.left.length; i++) { s += b.left[i]! * b.left[i]! + b.right[i]! * b.right[i]!; }
  return Math.sqrt(s / Math.max(1, 2 * b.left.length));
};
export const peak = (b: Float32Array | Stereo): number => {
  if (b instanceof Float32Array) return b.reduce((a, v) => Math.max(a, Math.abs(v)), 0);
  return Math.max(peak(b.left), peak(b.right));
};
export const mono = one;
