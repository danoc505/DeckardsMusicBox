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
 * A NOTE IS RENDERED ONCE AND USED WHEREVER IT RECURS. A record loops, so
 * the same pitch of the same length comes round again and again — but the
 * arc moves every note's weight a little, and rendering by exact weight
 * made 90% of notes unique for differences no ear could name. So weight is
 * split the way a sampled instrument splits it: VELOCITY LAYERS decide the
 * timbre, and the note is then scaled to the weight it actually has. Only
 * the brightness is in layers, and the approximation measures 43 dB below
 * the record.
 */

import { hash32 } from "../core/rng.ts";
import { ROLES, SENDS, type ChannelRules, type PedalsRules, type RackRules, type Role, type SoundRules, type SoundSpec, type WorldRules } from "../genre/spec.ts";
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
}

const LAYERS = 64;

/**
 * −1 dBTP: the true-peak ceiling streaming masters keep under
 * (kansamples.com mastering-loudness-lufs-streaming). The saturator holds
 * the record under full scale; this holds it under the ceiling.
 */
const CEILING = 0.89;

/** The furthest the far ear hears a sound late: Woodworth's head, about 0.65 ms. */
const ITD_SEC = 0.00065;

export function render(song: Song, opts: RenderOptions = {}): Stereo {
  const sr = opts.sampleRate ?? 44100;
  const { performance, chart } = song;
  const S = settle(chart.genre.sound, opts.desk);
  const n = Math.ceil(performance.seconds * sr);

  // ── every part to its own buffer ─────────────────────────────────────
  const parts = new Map<Role, Float32Array>();
  const voiceOf = { rhodes, sub, pluck, organ, pad, flute } as const;
  const rendered = new Map<string, Float32Array>();
  const layers = opts.layers ?? LAYERS;

  for (const e of performance.events) {
    if (opts.only !== undefined && e.role !== opts.only) continue;
    const layer = Math.max(1, Math.round(e.gain * layers));
    const layerGain = layer / layers;
    const voice = e.role === "drums" ? e.lane : S.voices[e.role];
    const what = `${chart.seed}/${voice}/${e.pitch ?? ""}/${e.durSec}`;
    const key = `${what}/${layer}`;
    let buf = rendered.get(key);
    if (buf === undefined) {
      const note: NoteIn = { midi: e.pitch ?? 0, heldSec: e.durSec, gain: layerGain, seed: hash32(what), sampleRate: sr };
      buf = e.role === "drums"
        ? e.lane === "kick" ? kick(note) : e.lane === "snare" ? snare(note) : hat(note, e.lane === "openhat")
        : voiceOf[S.voices[e.role]](note);
      rendered.set(key, buf);
    }
    let part = parts.get(e.role);
    if (part === undefined) { part = new Float32Array(n); parts.set(e.role, part); }
    const at = Math.round(e.tSec * sr);
    const level = e.gain / layerGain;
    for (let i = 0; i < buf.length; i++) {
      const j = at + i;
      if (j < 0) continue;
      if (j >= n) break;
      part[j] = part[j]! + buf[i]! * level;
    }
  }

  return desk(parts, n, sr, chart.seed, chart.tempo, S);
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

/** The desk: pedals, world, sends and inserts, from a buffer per part to a stereo record. */
function desk(parts: ReadonlyMap<Role, Float32Array>, n: number, sr: number, seed: number, tempo: number, S: SoundRules): Stereo {
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const wet = new Map<(typeof SENDS)[number], { L: Float32Array; R: Float32Array }>();
  const W = S.world;

  for (const role of ROLES) {
    const src = parts.get(role);
    if (src === undefined) continue;
    const ch = S.mix[role];
    const dry = board(src, ch, S.pedals, sr);
    const place = placed(dry, ch, W, sr, role);
    for (let i = 0; i < n; i++) {
      L[i] = L[i]! + place.L[i]! * ch.level;
      R[i] = R[i]! + place.R[i]! * ch.level;
    }
    // a distant part is more in the room than a near one: the world's depth
    // adds to its room send
    const roomExtra = W.depth * ch.dist * 0.5;
    for (const sd of SENDS) {
      const amount = ch.sends[sd] + (sd === "room" ? roomExtra : 0);
      if (amount <= 0) continue;
      const bus = wet.get(sd) ?? { L: new Float32Array(n), R: new Float32Array(n) };
      for (let i = 0; i < n; i++) {
        bus.L[i] = bus.L[i]! + place.L[i]! * amount * ch.level;
        bus.R[i] = bus.R[i]! + place.R[i]! * amount * ch.level;
      }
      wet.set(sd, bus);
    }
  }

  // ── returns: the wet units as a patched network ───────────────────────
  // A unit is live if something feeds it — a part's send, or another unit
  // through the patch — and it is heard if its return is up or it feeds a
  // unit that is. Each sample, every live unit takes its bus plus what the
  // others put out LAST sample through the patch: one sample of latency in
  // the loop is how feedback exists at all. The loop is held under full
  // scale and kept off DC, so a patch that runs hot rings rather than runs
  // away.
  const beatSec = 60 / tempo;
  const P = S.patch;
  const live = new Set<(typeof SENDS)[number]>();
  for (const sd of SENDS) if (wet.has(sd)) live.add(sd);
  let grew = true;
  while (grew) {
    grew = false;
    for (const from of live) for (const to of SENDS) if (P[from][to] > 0 && !live.has(to)) { live.add(to); grew = true; }
  }
  const units = [...live].filter((sd) => S.rack[sd].ret > 0 || SENDS.some((to) => P[sd][to] > 0));
  if (units.length > 0) {
    const pairs = units.map((sd) => returns(sd, S.rack, beatSec, sr));
    const buses = units.map((sd) => wet.get(sd) ?? null);
    const outL = new Float32Array(units.length), outR = new Float32Array(units.length);
    const dcL = units.map(() => new Biquad("highpass", 20, 0.7, sr)), dcR = units.map(() => new Biquad("highpass", 20, 0.7, sr));
    const gain = units.map((from) => units.map((to) => P[from][to]));
    const patched = gain.some((row) => row.some((g) => g > 0));
    for (let i = 0; i < n; i++) {
      for (let u = 0; u < units.length; u++) {
        let inL = buses[u] ? buses[u]!.L[i]! : 0, inR = buses[u] ? buses[u]!.R[i]! : 0;
        if (patched) {
          let fbL = 0, fbR = 0;
          for (let v = 0; v < units.length; v++) { const g = gain[v]![u]!; if (g > 0) { fbL += outL[v]! * g; fbR += outR[v]! * g; } }
          inL += Math.tanh(dcL[u]!.run(fbL)); inR += Math.tanh(dcR[u]!.run(fbR));
        }
        const yL = pairs[u]![0](inL), yR = pairs[u]![1](inR);
        outL[u] = yL; outR[u] = yR;
        const ret = S.rack[units[u]!].ret;
        L[i] = L[i]! + yL * ret; R[i] = R[i]! + yR * ret;
      }
    }
  }

  // ── inserts: the sum through the pole, the tape, the medium, the dust, the master ──
  return inserts(L, R, sr, seed, S.rack);
}

/** A part through the pedal board by its feed amount. Nothing fed, nothing built. */
function board(src: Float32Array, ch: ChannelRules, P: PedalsRules, sr: number): Float32Array {
  if (ch.pedals <= 0) return src;
  const stages: ((x: number) => number)[] = [];
  const stage = <T extends { run(x: number): number }>(unit: T, mix: number): void => {
    if (mix > 0) stages.push((x) => x * (1 - mix) + unit.run(x) * mix);
  };
  stage(new Wah(P.wah.rateHz, P.wah.depth, sr), P.wah.mix);
  stage(new Overdrive(P.overdrive.drive, P.overdrive.tone, sr), P.overdrive.mix);
  stage(new Fuzz(P.fuzz.gain, sr), P.fuzz.mix);
  stage(new Phaser(P.phaser.rateHz, P.phaser.depth, sr), P.phaser.mix);
  stage(new Tremolo(P.tremolo.rateHz, P.tremolo.depth, sr), P.tremolo.mix);
  if (stages.length === 0) return src;
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) {
    let y = src[i]!;
    for (const st of stages) y = st(y);
    out[i] = src[i]! * (1 - ch.pedals) + y * ch.pedals;
  }
  return out;
}

/**
 * A part in the world. Pan and sweep give it a place between the speakers;
 * azimuth and distance give it a place round the listener: the far ear
 * hears it up to 0.65 ms later and through the head's shadow, and a distant
 * part is quieter and darker. Width scales the whole illusion.
 */
function placed(src: Float32Array, ch: ChannelRules, W: WorldRules, sr: number, role: Role): { L: Float32Array; R: Float32Array } {
  const n = src.length;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const width = W.width;
  const rad = (ch.az * Math.PI) / 180;
  // the far ear: which side, how late, how shadowed
  const side = Math.sin(rad); // −1 left … 1 right
  const lateSec = ITD_SEC * Math.abs(side) * width;
  // a filter that would pass everything is not built: a lowpass at the top
  // of hearing is an identity that costs a biquad a sample
  const lowpass = (hz: number): Biquad | null => (hz < 19000 ? new Biquad("lowpass", hz, 0.7, sr) : null);
  const farShadow = lowpass(20000 - (20000 - 1800) * Math.abs(side) * width);
  const line = lateSec > 0 ? new Line(0.002, sr) : null;
  // distance: quieter, darker, by the world's depth
  const dGain = 1 / (1 + 1.5 * ch.dist * W.depth);
  const dark = lowpass(20000 - (20000 - 2500) * ch.dist * W.depth);
  // a sound behind is a little darker in both ears
  const back = lowpass(20000 - (20000 - 4000) * Math.max(0, -Math.cos(rad)) * width);
  const twoPi = 2 * Math.PI;
  const sweeping = ch.sweepDepth > 0;
  const basePan = Math.max(-1, Math.min(1, ch.pan + side * 0.8 * width));
  let [gl, gr] = panGains(basePan);
  void role;
  for (let i = 0; i < n; i++) {
    let x = src[i]! * dGain;
    if (dark) x = dark.run(x);
    if (back) x = back.run(x);
    let late = x;
    if (line) { line.write(x); late = line.read(lateSec); }
    const shadowed = farShadow ? farShadow.run(late) : late;
    if (sweeping && (i & 63) === 0) {
      // the sweep is slow: the pan law is worked out every 64 samples
      const pan = Math.max(-1, Math.min(1, basePan + ch.sweepDepth * Math.sin((twoPi * ch.sweepHz * i) / sr)));
      [gl, gr] = panGains(pan);
    }
    if (side >= 0) { L[i] = shadowed * gl; R[i] = x * gr; } else { L[i] = x * gl; R[i] = shadowed * gr; }
  }
  return { L, R };
}

/** A wet unit as a stereo pair: two of it, the right one a little different, so the return has width. */
function returns(sd: (typeof SENDS)[number], rack: RackRules, beatSec: number, sr: number): [(x: number) => number, (x: number) => number] {
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

/** The inserts on the master, in the rack's order, on both channels. */
function inserts(L: Float32Array, R: Float32Array, sr: number, seed: number, K: RackRules): Stereo {
  const n = L.length;
  const outL = new Float32Array(n);
  const outR = new Float32Array(n);
  const pole = K.pole.mix > 0 ? [new Pole(K.pole.hz, K.pole.resonance, sr), new Pole(K.pole.hz, K.pole.resonance, sr)] : null;
  const lp = [new Biquad("lowpass", K.tape.lowpassHz, 0.71, sr), new Biquad("lowpass", K.tape.lowpassHz, 0.71, sr)];
  const medium = K.medium.mix > 0 ? [new Medium(K.medium.kind, hash32(`medium/${seed}/L`), sr), new Medium(K.medium.kind, hash32(`medium/${seed}/R`), sr)] : null;
  const dev = Math.pow(2, K.tape.wowCents / 1200) - 1;
  const swingSec = dev / (2 * Math.PI * K.tape.wowHz);
  const baseSec = swingSec + 0.002;
  const lines = [new Line(baseSec + swingSec + 0.01, sr), new Line(baseSec + swingSec + 0.01, sr)];
  const crackle = new Noise(hash32(`crackle/${seed}`));
  const crackleHp = [new Biquad("highpass", 500, 0.7, sr), new Biquad("highpass", 500, 0.7, sr)];
  const twoPi = 2 * Math.PI;
  const blend = (dry: number, wet: number, amount: number): number => dry * (1 - 0.5 * amount) + wet * amount;
  const wowing = K.tape.wowCents > 0;
  const dusty = K.vinyl.crackle > 0;
  const gain = CEILING * K.master.level;
  const drive = K.tape.drive;
  const lpL = lp[0]!, lpR = lp[1]!, lineL = lines[0]!, lineR = lines[1]!, hpL = crackleHp[0]!, hpR = crackleHp[1]!;

  for (let i = 0; i < n; i++) {
    const delaySec = wowing ? baseSec + swingSec * Math.sin((twoPi * K.tape.wowHz * i) / sr) : 0;
    // dust is one record, so both channels get the same tick
    const tick = dusty && crackle.next() > 0.9995 ? crackle.next() : 0;
    let x = L[i]!, y: number;
    if (pole) x = blend(x, pole[0]!.run(x), K.pole.mix);
    x = lpL.run(x);
    if (wowing) { lineL.write(x); y = lineL.read(delaySec); } else y = x;
    if (medium) y = blend(y, medium[0]!.run(y), K.medium.mix);
    outL[i] = gain * saturate(y + (dusty ? hpL.run(tick) * K.vinyl.crackle : 0), drive);
    x = R[i]!;
    if (pole) x = blend(x, pole[1]!.run(x), K.pole.mix);
    x = lpR.run(x);
    if (wowing) { lineR.write(x); y = lineR.read(delaySec); } else y = x;
    if (medium) y = blend(y, medium[1]!.run(y), K.medium.mix);
    outR[i] = gain * saturate(y + (dusty ? hpR.run(tick) * K.vinyl.crackle : 0), drive);
  }
  return { left: outL, right: outR };
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
