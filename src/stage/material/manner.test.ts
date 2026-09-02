import test from "node:test";
import assert from "node:assert/strict";
import { ART, type ArtName } from "../../core/articulation.ts";
import { rng } from "../../core/rng.ts";
import { CAN, CAN_DRUM, FLOOR, type VoiceName } from "../../genre/spec.ts";
import { resolveGenre } from "../../genre/index.ts";
import { compose } from "../../song.ts";
import { manner } from "./manner.ts";

const R = rng(1);
const all: readonly (readonly [ArtName, number])[] = Object.keys(ART).map((a) => [a as ArtName, 1]);

test("a ghost is never on a beat and an accent is never off one", () => {
  // a ghost note is an anti-accent: it exists to make the notes around it
  // sound stronger, so a ghosted downbeat is not a ghost, it is a hole
  for (let i = 0; i < 400; i++) {
    const onBeat = manner(R.at("on", i), "art", all, { strong: true, dur: 4, from: 2 });
    assert.notEqual(onBeat, "ghost", "a ghost landed on a beat");
    const offBeat = manner(R.at("off", i), "art", all, { strong: false, dur: 4, from: 2 });
    assert.notEqual(offBeat, "accent", "an accent landed off the beat");
    assert.notEqual(offBeat, "marcato", "a marcato landed off the beat");
  }
});

test("nothing is slurred or slid from silence, and nothing slurs across a leap", () => {
  for (let i = 0; i < 400; i++) {
    const opening = manner(R.at("first", i), "art", all, { strong: false, dur: 4, from: null });
    assert.ok(opening !== "slur" && opening !== "slide", `${opening} was played from nothing`);
    // a hand reaches a few frets, not an octave
    const leapt = manner(R.at("leap", i), "art", all, { strong: false, dur: 4, from: 11 });
    assert.notEqual(leapt, "slur", "a hammer-on crossed an octave");
  }
});

test("a bend and a tremolo need a note long enough to happen in", () => {
  for (let i = 0; i < 400; i++) {
    const brief = manner(R.at("brief", i), "art", all, { strong: false, dur: 1, from: 2 });
    assert.ok(brief !== "bend" && brief !== "tremolo", `${brief} happened in one step`);
  }
});

test("a note always has an answer, even where every manner is refused", () => {
  // the first note of a line, on no beat, one step long: no ghost, no accent,
  // no slur, no slide, no bend, no tremolo. It is still played.
  const only: readonly (readonly [ArtName, number])[] = [["ghost", 1], ["slur", 1], ["bend", 1]];
  assert.equal(manner(R, "art", only, { strong: true, dur: 1, from: null }), "plain");
});

test("a genre may not ask an instrument for a manner it has no body for", () => {
  const bendingPiano = () =>
    resolveGenre("bent", {
      bent: { label: "B", lead: { art: [["bend", 1]] }, sound: { voices: { lead: "rhodes" } } },
    });
  assert.throws(bendingPiano, /lead\.art asks for "bend", which a rhodes cannot play/);
  // and the same for a kit
  assert.throws(
    () => resolveGenre("slid", { slid: { label: "S", drums: { art: [["slide", 1]] } } }),
    /drums\.art asks for "slide", which a kit cannot play/,
  );
});

test("every manner a genre may name is one some instrument can make", () => {
  // the tables and the vocabulary cannot drift apart: a manner in ART that no
  // instrument can play is unreachable, and one named in CAN that ART does
  // not define would be drawn and then silently ignored
  const reachable = new Set<ArtName>([...FLOOR, ...CAN_DRUM]);
  for (const v of Object.keys(CAN) as VoiceName[]) for (const a of CAN[v]) reachable.add(a);
  for (const a of Object.keys(ART) as ArtName[]) {
    assert.ok(reachable.has(a), `no instrument can play "${a}"`);
  }
  for (const a of reachable) assert.ok(a in ART, `"${a}" is playable but not defined`);
});

test("the manner reaches the record, and every part carries one", () => {
  for (const g of ["lofi", "dungeonsynth"] as const) {
    const s = compose({ seed: 42, genre: g, seconds: 120 });
    const byRole = new Map<string, Set<string>>();
    for (const e of s.performance.events) {
      assert.ok(e.art in ART, `${e.role} played "${e.art}"`);
      (byRole.get(e.role) ?? byRole.set(e.role, new Set()).get(e.role)!).add(e.art);
    }
    // and it is not one manner for the whole record: at least one part of
    // each genre is played more than one way
    const spread = [...byRole.values()].filter((s2) => s2.size > 1).length;
    assert.ok(spread >= 3, `${g}: only ${spread} parts play in more than one manner`);
  }
});

test("a manner that shortens a note shortens the event it becomes", () => {
  const s = compose({ seed: 42, genre: "lofi", seconds: 120 });
  const held = new Map<ArtName, number[]>();
  for (const e of s.performance.events) {
    if (e.role !== "keys") continue;
    (held.get(e.art) ?? held.set(e.art, []).get(e.art)!).push(e.durSec);
  }
  const shortest = (a: ArtName): number => Math.min(...(held.get(a) ?? [Infinity]));
  // the keys strike the same chord at the same length in every manner, so
  // the staccato ones are the short ones
  assert.ok(held.has("staccato") && held.has("tenuto"), "the keys played in one manner only");
  assert.ok(shortest("staccato") < shortest("tenuto"), "a staccato chord outlasted a held one");
});
