import test from "node:test";
import assert from "node:assert/strict";
import { ART, artOf, shapesTheNote } from "../core/articulation.ts";
import { articulate } from "./articulate.ts";
import { pluck, rhodes, sub, type NoteIn } from "./voices.ts";
import { peak, rms } from "./render.ts";

const SR = 22050;
const n = (over: Partial<NoteIn> = {}): NoteIn => ({ midi: 60, heldSec: 0.6, gain: 0.8, seed: 7, sampleRate: SR, ...over });

/** The strongest frequency in a buffer, by counting zero crossings of its second half. */
function pitchOf(buf: Float32Array, from: number, to: number): number {
  const a = Math.floor(from * buf.length);
  const b = Math.floor(to * buf.length);
  let crossings = 0;
  for (let i = a + 1; i < b; i++) if ((buf[i - 1]! < 0) !== (buf[i]! < 0)) crossings++;
  return (crossings * SR) / (2 * (b - a));
}

test("a manner changes the note, and the plain one leaves it alone", () => {
  const plain = articulate(rhodes, n(), ART.plain);
  const asIs = rhodes(n());
  assert.deepEqual(plain, asIs, "a plain note went through something");
  for (const name of ["ghost", "slur", "slide", "bend", "tremolo"] as const) {
    const out = articulate(pluck, n(), ART[name]);
    assert.ok(out.length > 0, `${name} rendered nothing`);
    for (const v of out) assert.ok(Number.isFinite(v), `${name} is not finite`);
    assert.ok(peak(out) <= 1.001, `${name} peaks at ${peak(out)}`);
  }
});

// The pitch tests measure by counting zero crossings, which needs a voice
// whose waveform crosses zero twice a cycle. A plucked string will not do:
// its attack is a burst of noise and counting it reads 800 Hz for a note at
// 261. `sub` is a sine with a little second harmonic, so it reads true.
test("a bend arrives above the note it started on", () => {
  const held = 1.2;
  const straight = articulate(sub, n({ heldSec: held }), ART.plain);
  const bent = articulate(sub, n({ heldSec: held }), ART.bend);
  const startS = pitchOf(straight, 0.05, 0.15);
  const endS = pitchOf(straight, 0.5, 0.7);
  const endB = pitchOf(bent, 0.5, 0.7);
  // a plain note holds its pitch; a bent one has gone up a whole tone, which
  // is a factor of 2^(2/12) = 1.122
  assert.ok(Math.abs(endS / startS - 1) < 0.06, `a plain note drifted: ${startS.toFixed(0)} to ${endS.toFixed(0)} Hz`);
  assert.ok(endB > endS * 1.06, `the bend did not rise: ${endS.toFixed(0)} to ${endB.toFixed(0)} Hz`);
  assert.ok(endB < endS * 1.2, `the bend overshot a whole tone: ${(endB / endS).toFixed(3)}`);
});

test("a slide arrives from below and lands on the note", () => {
  const held = 1.6;
  // a long, wide slide, so the travel is measurable well clear of the attack;
  // that the shipped one is a tone over 90 ms is asserted below
  const wide = { ...ART.slide, from: -7, reachSec: 0.6 };
  const slid = articulate(sub, n({ heldSec: held }), wide);
  const plain = articulate(sub, n({ heldSec: held }), ART.plain);
  const head = pitchOf(slid, 0.02, 0.08);
  const settled = pitchOf(slid, 0.6, 0.8);
  const target = pitchOf(plain, 0.6, 0.8);
  assert.ok(head < settled * 0.9, `the slide did not start below: ${head.toFixed(0)} then ${settled.toFixed(0)} Hz`);
  assert.ok(Math.abs(settled / target - 1) < 0.06, `the slide did not land: ${settled.toFixed(0)} against ${target.toFixed(0)} Hz`);
  assert.equal(ART.slide.from, -2, "a slide comes from a whole tone below");
});

test("a hammered note has less of an attack than a struck one", () => {
  // "a hammer-on removes the sound of the pick attack, yielding a softer,
  // more rounded tone" — so the first milliseconds are the whole difference
  const struck = articulate(pluck, n(), ART.plain);
  const slurred = articulate(pluck, n(), ART.slur);
  const head = (b: Float32Array) => peak(b.subarray(0, Math.round(0.006 * SR)));
  assert.ok(head(slurred) < head(struck) * 0.75, `the attack survived: ${head(slurred).toFixed(3)} against ${head(struck).toFixed(3)}`);
  // and the body of the note is still there
  const body = (b: Float32Array) => rms(b.subarray(Math.round(0.1 * SR), Math.round(0.4 * SR)));
  assert.ok(body(slurred) > body(struck) * 0.5, "a slur took the note with the attack");
});

test("a ghost is quieter and duller than the note beside it", () => {
  const ghost = ART.ghost;
  assert.ok(ghost.weigh < 0.5, "a ghost is not well below half");
  // the damping is what makes it a ghost rather than a quiet note: the same
  // buffer with the top taken off
  const plain = articulate(pluck, n(), ART.plain);
  const dead = articulate(pluck, n(), ghost);
  const top = (b: Float32Array): number => {
    let sum = 0;
    for (let i = 1; i < b.length; i++) sum += Math.abs(b[i]! - b[i - 1]!);
    return sum / Math.max(1e-9, rms(b) * b.length);
  };
  assert.ok(top(dead) < top(plain), "a ghost kept its top end");
});

test("a tremolo strikes more often than a plain note", () => {
  const plain = articulate(pluck, n({ heldSec: 1 }), ART.plain);
  const rolled = articulate(pluck, n({ heldSec: 1 }), ART.tremolo);
  // count the attacks: places where the envelope jumps
  const attacks = (b: Float32Array): number => {
    const win = Math.round(0.01 * SR);
    let last = 0;
    let count = 0;
    for (let i = 0; i + win < b.length; i += win) {
      const level = rms(b.subarray(i, i + win));
      if (level > last * 1.8 && level > 0.02) count++;
      last = level;
    }
    return count;
  };
  assert.ok(attacks(rolled) > attacks(plain), `${attacks(rolled)} attacks against ${attacks(plain)}`);
});

test("the same note in the same manner is the same samples", () => {
  for (const a of Object.values(ART)) {
    const one = articulate(pluck, n(), a);
    const two = articulate(pluck, n(), a);
    assert.deepEqual(one, two, `${a.name} is not deterministic`);
  }
});

test("only a manner that changes the sound costs a second rendering", () => {
  // the cache keys on this: a manner that scales weight and length alone
  // must not multiply the buffers, because the performance already applied it
  assert.equal(shapesTheNote(ART.plain), false);
  assert.equal(shapesTheNote(ART.tenuto), false);
  assert.equal(shapesTheNote(ART.staccato), false);
  assert.equal(shapesTheNote(ART.accent), false);
  assert.equal(shapesTheNote(ART.marcato), false);
  for (const name of ["ghost", "slur", "slide", "bend", "tremolo"] as const) {
    assert.equal(shapesTheNote(ART[name]), true, `${name} is rendered as a plain note`);
  }
});

test("the published durations are the ones the manners hold", () => {
  // legato 100% and "no intervening silence", tenuto 95%, an unmarked note
  // 80%, staccato "about 50% of its notated value", martellato 33%
  assert.equal(ART.slur.hold, 1);
  assert.equal(ART.tenuto.hold, 0.95);
  assert.equal(ART.plain.hold, 0.8);
  assert.equal(ART.staccato.hold, 0.5);
  assert.equal(ART.marcato.hold, 0.33);
  assert.equal(artOf("nonesuch" as never), ART.plain);
});
