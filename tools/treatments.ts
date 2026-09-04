/**
 * WHAT EACH TREATMENT IS WORTH, measured off the record rather than argued.
 *
 * `tools/measure.ts` counts what is in the MIDI file, and a treatment is
 * invisible there by construction: it moves the desk and not one note, so the
 * file it writes is the same file. The piano roll cannot see it either. That
 * left twelve arrangement moves whose only evidence was that the code ran —
 * and two of them were doing nothing at all, one of them bit-for-bit.
 *
 * So this renders the record twice — once with its desk timeline emptied, once
 * held under one treatment for its whole length — and reports what changed:
 *
 *   level    how much louder or quieter, in dB. A treatment is supposed to
 *            change the SOUND and not the level: that is what makes it
 *            answerable to the rule of three without the record getting
 *            quieter every time it answers.
 *   centre   how far the spectrum's centre of gravity moved, in per cent.
 *            Darker or brighter, in the one number that says so.
 *   moved    the difference signal against the record's own level, in dB.
 *            This is the one that catches a dead knob: a treatment that
 *            changes nothing comes out around −220 dB, which is not a small
 *            change but no change at all.
 *
 * WHAT IT CANNOT TELL YOU IS WHETHER ANY OF IT SOUNDS GOOD. `docs/TALLY.md` §0
 * stands: measurements prove a thing exists and never that it is music. What
 * this ranks is which treatments are worth listening to first.
 *
 *   node tools/treatments.ts                        every genre, seed 2
 *   node tools/treatments.ts dungeonsynth 2,7,42    one genre, three seeds
 *   node tools/treatments.ts lofi 2 --seconds 60 --sr 44100
 *
 * THE SAMPLE RATE IS PART OF THE MEASUREMENT, not a speed knob. `Pole` clamps
 * its cutoff at `sampleRate / 6` and `Biquad` at `sampleRate * 0.49` to stay
 * stable, so below about 16 kHz a genre's filters are pinned and `darken` and
 * `brighten` measure as no-ops when they are nothing of the kind. The default
 * is 22050 for that reason.
 */

import { compose } from "../src/song.ts";
import { GENRE_NAMES, genre as genreOf, type GenreName } from "../src/genre/index.ts";
import { TREATMENTS, type Treatment } from "../src/genre/spec.ts";
import { render, rms, type Stereo } from "../src/sound/render.ts";
import { offeredBy, specOf } from "../src/stage/treat.ts";

const args = process.argv.slice(2);
const named = (flag: string, fallback: number): number => {
  const i = args.indexOf(`--${flag}`);
  return i < 0 || args[i + 1] === undefined ? fallback : Number(args[i + 1]);
};
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));

const SR = named("sr", 22050);
const SECONDS = named("seconds", 60);
const genres = positional[0] === undefined
  ? GENRE_NAMES
  : (positional[0].split(",") as GenreName[]);
const seeds = (positional[1] ?? "2").split(",").map(Number);

for (const g of genres) {
  if (!(GENRE_NAMES as readonly string[]).includes(g)) {
    process.stderr.write(`usage: node tools/treatments.ts [genre[,genre]] [seed[,seed]] [--seconds n] [--sr n]\ngenres: ${GENRE_NAMES.join(", ")}\n`);
    process.exit(2);
  }
}

/** The spectrum's centre of gravity, in Hz, averaged over the record. */
function centre(x: Float32Array, sr: number): number {
  const N = 2048;
  const win = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
  let num = 0;
  let den = 0;
  // every eighth window: this is a summary of a whole record, not a spectrogram
  for (let off = 0; off + N < x.length; off += N * 8) {
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[off + i]! * win[i]!;
    fft(re, im);
    for (let k = 1; k < N / 2; k++) {
      const mag = Math.hypot(re[k]!, im[k]!);
      num += mag * ((k * sr) / N);
      den += mag;
    }
  }
  return den === 0 ? 0 : num / den;
}

/** In place, radix 2. Only ever handed a power of two. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const half = len / 2;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const c = Math.cos(ang * k);
        const s = Math.sin(ang * k);
        const ur = re[i + k]!;
        const ui = im[i + k]!;
        const vr = re[i + k + half]! * c - im[i + k + half]! * s;
        const vi = re[i + k + half]! * s + im[i + k + half]! * c;
        re[i + k] = ur + vr;
        im[i + k] = ui + vi;
        re[i + k + half] = ur - vr;
        im[i + k + half] = ui - vi;
      }
    }
  }
}

const db = (a: number, b: number): number => 20 * Math.log10((a || 1e-12) / (b || 1e-12));

/** The difference between two renderings, as a level against the first. */
function apart(base: Stereo, out: Stereo, level: number): number {
  let d = 0;
  for (let i = 0; i < out.left.length; i++) {
    const a = out.left[i]! - base.left[i]!;
    const b = out.right[i]! - base.right[i]!;
    d += a * a + b * b;
  }
  return db(Math.sqrt(d / (out.left.length * 2)), level);
}

for (const g of genres) {
  const offered = offeredBy(genreOf(g).sound);
  const refused = TREATMENTS.filter((t) => !offered.includes(t));
  process.stdout.write(`\n${g}  —  offers ${offered.length} of ${TREATMENTS.length}, at ${SR} Hz over ${SECONDS}s\n`);
  if (refused.length > 0) process.stdout.write(`  refused, as unreachable on this desk: ${refused.join(", ")}\n`);
  for (const seed of seeds) {
    const song = compose({ seed, genre: g, seconds: SECONDS });
    const flat = { ...song, performance: { ...song.performance, desk: [] } };
    const base = render(flat, { sampleRate: SR });
    const level = rms(base);
    const baseCentre = centre(base.left, SR);
    process.stdout.write(
      `\n  seed ${seed}: ${song.performance.seconds.toFixed(0)}s, rms ${level.toFixed(4)}, centre ${baseCentre.toFixed(0)} Hz\n` +
      `  ${"treatment".padEnd(12)}${"level".padStart(9)}${"centre".padStart(9)}${"moved".padStart(10)}\n`,
    );
    for (const t of TREATMENTS) {
      // LAID ON AS A DESK, NOT AS A TREATMENT. On the timeline it would go
      // through `deskOf`, which hands the renderer nothing for a move it
      // refused — so every refused treatment would print as no change because
      // it was refused, and the table could never say whether a refusal was
      // right. `specOf` is the move unfiltered — and null from it is not a
      // refusal either but a move with nothing to write on this desk, which
      // renders the record unchanged and prints as the 0 dB it is.
      const spec = specOf(t as Treatment, genreOf(g).sound);
      const out = render(flat, { sampleRate: SR, ...(spec === null ? {} : { desk: spec }) });
      const c = centre(out.left, SR);
      process.stdout.write(
        `  ${t.padEnd(12)}` +
        `${`${db(rms(out), level).toFixed(2)} dB`.padStart(9)}` +
        `${`${(((c - baseCentre) / (baseCentre || 1)) * 100).toFixed(1)}%`.padStart(9)}` +
        `${`${apart(base, out, level).toFixed(1)} dB`.padStart(10)}` +
        `${offered.includes(t) ? "" : "   refused"}\n`,
      );
    }
  }
}
