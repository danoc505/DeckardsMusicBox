/**
 * Stage 6 — THE SOUND.
 *
 * The performance's events become samples. Every event is one note of one
 * instrument, rendered on its own and added to the record at its time; then
 * the whole record goes through the tape: a low-pass where the genre says
 * the top end stops, a slow wobble of pitch, saturation, and the dust.
 *
 * Pure arithmetic on typed arrays: no audio graph, no clock but the sample
 * index, so it runs the same in a browser and in a test, and a record
 * rendered twice is the same bytes.
 *
 * A NOTE IS RENDERED ONCE AND USED WHEREVER IT RECURS. A record loops, so
 * the same pitch of the same length comes round again and again — but the
 * arc moves every note's weight a little, and rendering by exact weight
 * made 90% of notes unique for differences no ear could name. So weight is
 * split the way a sampled instrument splits it: VELOCITY LAYERS
 * decide the timbre, and the note is then scaled to the weight it actually
 * has. Only the brightness is in layers, and the whole approximation
 * measures 43 dB below the record.
 */

import { hash32 } from "../core/rng.ts";
import type { Role } from "../genre/spec.ts";
import type { Song } from "../song.ts";
import { Biquad, Noise, Reverb, saturate } from "./dsp.ts";
import { flute, hat, kick, organ, pad, pluck, rhodes, snare, sub, type NoteIn } from "./voices.ts";

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
}

/** How much of the mix each part is, before the arc and the note's own weight. */
const TRIM: Readonly<Record<Role, number>> = { drums: 0.38, bass: 0.34, keys: 0.24, lead: 0.34, drone: 0.16 };

/**
 * How many velocity layers a voice's timbre is rendered in.
 *
 * Chosen by measuring against the same record with every note rendered at
 * its own weight: each doubling buys about 6 dB and costs about a sixth of
 * the time. Eight layers is −27 dB, which is audible; 64 is −43 dB and
 * still renders in two thirds the time of no layering at all.
 */
const LAYERS = 64;

/**
 * −1 dBTP: the true-peak ceiling streaming masters keep under
 * (kansamples.com mastering-loudness-lufs-streaming). The saturator holds
 * the record under full scale; this holds it under the ceiling.
 */
const CEILING = 0.89;

export function render(song: Song, opts: RenderOptions = {}): Float32Array {
  const sr = opts.sampleRate ?? 44100;
  const { performance, chart } = song;
  const S = chart.genre.sound;
  const mix = new Float32Array(Math.ceil(performance.seconds * sr));

  const voiceOf = { rhodes, sub, pluck, organ, pad, flute } as const;
  const rendered = new Map<string, Float32Array>();

  for (const e of performance.events) {
    if (opts.only !== undefined && e.role !== opts.only) continue;
    // the layer decides how the note is played; the note is then scaled to
    // the weight it actually has, so nothing is lost but a step of timbre
    const layers = opts.layers ?? LAYERS;
    const layer = Math.max(1, Math.round(e.gain * layers));
    const layerGain = layer / layers;
    const voice = e.role === "drums" ? e.lane : S.voices[e.role];
    // the note's IDENTITY — what it is, not how hard it is played. The seed
    // comes from this, so a hat struck softly is the same hat struck loudly
    // and not a different one; only the layer below tells them apart.
    const what = `${chart.seed}/${voice}/${e.pitch ?? ""}/${e.durSec}`;
    const key = `${what}/${layer}`;
    let buf = rendered.get(key);
    if (buf === undefined) {
      // and the seed is the note's, not the event's: which of a note's many
      // hearings asked for it first cannot be part of the answer
      const n: NoteIn = { midi: e.pitch ?? 0, heldSec: e.durSec, gain: layerGain, seed: hash32(what), sampleRate: sr };
      buf = e.role === "drums"
        ? e.lane === "kick" ? kick(n) : e.lane === "snare" ? snare(n) : hat(n, e.lane === "openhat")
        : voiceOf[S.voices[e.role]](n);
      rendered.set(key, buf);
    }
    const at = Math.round(e.tSec * sr);
    const level = TRIM[e.role] * (e.gain / layerGain);
    for (let i = 0; i < buf.length; i++) {
      const j = at + i;
      if (j < 0) continue;
      if (j >= mix.length) break;
      mix[j] = mix[j]! + buf[i]! * level;
    }
  }

  return tape(mix, sr, chart.seed, S.tape);
}

/** The record in its room and on tape: reverb, low-pass, wow, saturation, crackle. */
function tape(mix: Float32Array, sr: number, seed: number, T: Song["chart"]["genre"]["sound"]["tape"]): Float32Array {
  const out = new Float32Array(mix.length);
  const room = T.reverb > 0 ? new Reverb(T.reverbSec, sr) : null;
  const lp = new Biquad("lowpass", T.lowpassHz, 0.71, sr);
  // wow: a modulated delay. A pitch deviation of d at rate f is a delay
  // swinging by d / (2π f); a few cents at a fifth of a hertz is a few ms
  const dev = Math.pow(2, T.wowCents / 1200) - 1;
  const swingSec = dev / (2 * Math.PI * T.wowHz);
  const baseSec = swingSec + 0.002;
  const line = new Float32Array(Math.ceil((baseSec + swingSec) * sr) + 4);
  let w = 0;
  const crackleNoise = new Noise(hash32(`crackle/${seed}`));
  const crackleHp = new Biquad("highpass", 500, 0.7, sr);
  const twoPi = 2 * Math.PI;

  for (let i = 0; i < mix.length; i++) {
    const t = i / sr;
    const dry = mix[i]!;
    const x = lp.run(room === null ? dry : dry * (1 - 0.5 * T.reverb) + room.run(dry) * T.reverb);
    line[w] = x;
    const delaySec = baseSec + swingSec * Math.sin(twoPi * T.wowHz * t);
    const back = delaySec * sr;
    const pos = w - back;
    const p0 = Math.floor(pos);
    const frac = pos - p0;
    const i0 = ((p0 % line.length) + line.length) % line.length;
    const i1 = (i0 + 1) % line.length;
    const wowed = line[i0]! * (1 - frac) + line[i1]! * frac;
    w = (w + 1) % line.length;

    let dust = 0;
    if (T.crackle > 0) {
      // dust: sparse impulses at the genre's level, high-passed so they add
      // no rumble — and under the saturator with everything else, so the
      // record still cannot leave full scale
      const r = crackleNoise.next();
      const tick = r > 0.9995 ? crackleNoise.next() : 0;
      dust = crackleHp.run(tick) * T.crackle;
    }
    out[i] = CEILING * saturate(wowed + dust, T.drive);
  }
  return out;
}

export const rms = (b: Float32Array): number => Math.sqrt(b.reduce((a, v) => a + v * v, 0) / Math.max(1, b.length));
export const peak = (b: Float32Array): number => b.reduce((a, v) => Math.max(a, Math.abs(v)), 0);
