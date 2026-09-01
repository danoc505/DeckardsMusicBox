import test from "node:test";
import assert from "node:assert/strict";
import {
  SCALES, pc, noteName, degreeSemis, inScale, nearestDegree,
  scaleStep, intoBand, chordTones, commonTones, chordName,
} from "./theory.ts";

/** middle C — `tonic` is an absolute pitch, not a pitch class */
const C = 60;
const { major, minor, dorian, phrygian } = SCALES;

test("pitch class is correct below zero", () => {
  assert.equal(pc(0), 0);
  assert.equal(pc(13), 1);
  assert.equal(pc(-1), 11);
  assert.equal(pc(-13), 11);
});

test("note names put middle C at 60", () => {
  assert.equal(noteName(60), "C4");
  assert.equal(noteName(61), "C#4");
  assert.equal(noteName(59), "B3");
  assert.equal(noteName(21), "A0");
});

test("degrees wrap into octaves in both directions", () => {
  assert.equal(degreeSemis(major, 0), 0);
  assert.equal(degreeSemis(major, 6), 11);
  assert.equal(degreeSemis(major, 7), 12);
  assert.equal(degreeSemis(major, 8), 14);
  assert.equal(degreeSemis(major, -1), -1); // the leading tone below the tonic
  assert.equal(degreeSemis(major, -7), -12);
});

test("every scale starts on its tonic and stays inside an octave", () => {
  for (const [name, scale] of Object.entries(SCALES)) {
    assert.equal(scale[0], 0, `${name} does not start at 0`);
    assert.equal(scale.length, 7, `${name} is not seven notes`);
    for (let i = 1; i < scale.length; i++) {
      assert.ok(scale[i]! > scale[i - 1]!, `${name} is not ascending`);
      assert.ok(scale[i]! < 12, `${name} passes the octave`);
    }
  }
});

test("the modes are rotations of each other", () => {
  // dorian is major starting from its second degree
  const fromSecond = [0, 1, 2, 3, 4, 5, 6].map((i) => pc(degreeSemis(major, i + 1) - 2));
  assert.deepEqual(fromSecond, [...dorian]);
});

test("inScale knows its own notes in any octave", () => {
  assert.ok(inScale(C, major, 60)); // C
  assert.ok(inScale(C, major, 88)); // E, two octaves up
  assert.ok(inScale(C, major, 40)); // E, well below the tonic
  assert.ok(!inScale(C, major, 61)); // C#
  assert.ok(inScale(C, minor, 63)); // Eb is in C minor
  assert.ok(!inScale(C, minor, 64)); // E natural is not
});

test("nearestDegree names an outside note by its closest degree", () => {
  assert.equal(nearestDegree(C, major, 60), 0); // C -> I
  assert.equal(nearestDegree(C, major, 64), 2); // E -> III
  assert.equal(nearestDegree(C, major, 61), 0); // C# is nearest C
  assert.equal(nearestDegree(C, phrygian, 61), 1); // in phrygian, C# IS the bII
});

test("scaleStep stays in the scale and moves by degrees, not semitones", () => {
  // C major: one step up from E is F (a semitone), from F is G (a tone)
  assert.equal(scaleStep(C, major, 64, 1), 65);
  assert.equal(scaleStep(C, major, 65, 1), 67);
  assert.equal(scaleStep(C, major, 60, -1), 59);
  assert.equal(scaleStep(C, major, 60, 7), 72);
  assert.equal(scaleStep(C, major, 60, -7), 48);
});

test("scaleStep resolves the octave from the pitch, not from the division", () => {
  // B3 (59) sits a semitone under the tonic, so `(59 - 60) / 12` floors to the
  // octave BELOW while the note belongs to the one above. Stepping up from the
  // leading tone must arrive on the tonic it leads to.
  assert.equal(scaleStep(C, major, 59, 0), 59); // it is already degree 6
  assert.equal(scaleStep(C, major, 59, 1), 60); // and resolves up to C4
  assert.equal(scaleStep(C, major, 59, -1), 57); // or down to A3
});

test("scaleStep pulls a chromatic note onto the scale", () => {
  assert.ok(inScale(C, major, scaleStep(C, major, 61, 0)));
  assert.ok(inScale(C, major, scaleStep(C, major, 66, 1)));
});

test("intoBand moves octaves and never the pitch class", () => {
  assert.equal(intoBand(60, 48, 59), 48);
  assert.equal(intoBand(36, 48, 72), 48);
  assert.equal(intoBand(90, 48, 72), 66);
  assert.equal(intoBand(55, 48, 72), 55); // already inside, untouched
  for (const p of [21, 40, 60, 77, 108]) {
    assert.equal(pc(intoBand(p, 50, 70)), pc(p));
  }
});

test("intoBand returns the nearest octave when the band is too narrow", () => {
  // a five-semitone band cannot hold every pitch class
  const got = intoBand(61, 62, 66);
  assert.equal(pc(got), pc(61));
  assert.ok(got === 61 || got === 73, `got ${got}`);
});

test("chordTones stacks thirds inside the scale", () => {
  assert.deepEqual(chordTones(C, major, 0, 3), [60, 64, 67]); // C E G
  assert.deepEqual(chordTones(C, major, 1, 3), [62, 65, 69]); // D F A, minor
  assert.deepEqual(chordTones(C, major, 4, 4), [67, 71, 74, 77]); // G B D F
  assert.deepEqual(chordTones(C, minor, 0, 3), [60, 63, 67]); // C Eb G
});

test("a named quality overrides the scale and may leave it", () => {
  // the V of a minor key as a dominant seventh needs a note the mode lacks
  const v = chordTones(C, minor, 4, 4, "dom7");
  assert.deepEqual(v, [67, 71, 74, 77]);
  assert.ok(!inScale(C, minor, 71), "B natural is outside C minor, which is the point");
  assert.deepEqual(chordTones(C, minor, 0, 2, "open"), [60, 67]);
});

test("a named quality sets a floor on the size", () => {
  const seventh = chordTones(C, major, 0, 3, "major7");
  assert.equal(seventh.length, 4, "asking for three notes cannot truncate a seventh");
});

test("commonTones counts shared pitch classes once", () => {
  const c = chordTones(C, major, 0); // C E G
  const a = chordTones(C, major, 5); // A C E
  const d = chordTones(C, major, 1); // D F A
  assert.equal(commonTones(c, a), 2); // roots a third apart hold two
  assert.equal(commonTones(c, d), 0); // roots a second apart hold none
  assert.equal(commonTones(c, [60, 72, 84]), 1); // one class, three octaves
});

test("chordName reads the third, the fifth and the seventh", () => {
  assert.equal(chordName(chordTones(C, major, 0)), "C");
  assert.equal(chordName(chordTones(C, minor, 0)), "Cm");
  assert.equal(chordName(chordTones(C, minor, 0, 4)), "Cm7");
  assert.equal(chordName(chordTones(C, minor, 0, 2, "open")), "C5");
  assert.equal(chordName([]), "—");
  // the chords a readout used to get wrong: a scale's own diminished triad,
  // and a seventh that is major rather than dominant
  assert.equal(chordName(chordTones(C, major, 6)), "Bdim");
  assert.equal(chordName(chordTones(C, major, 6, 4)), "Bm7b5");
  assert.equal(chordName(chordTones(C, major, 0, 4)), "Cmaj7");
  assert.equal(chordName(chordTones(C, major, 4, 4)), "G7");
  assert.equal(chordName(chordTones(C, SCALES.mixolydian, 2)), "Edim");
  assert.equal(chordName(chordTones(C, SCALES.mixolydian, 3, 4)), "Fmaj7");
  assert.equal(chordName(chordTones(C, SCALES.mixolydian, 0, 4)), "C7");
  assert.equal(chordName(chordTones(C, major, 0, 3, "aug")), "Caug");
  assert.equal(chordName(chordTones(C, major, 0, 4, "dim7")), "Cdim7");
  assert.equal(chordName(chordTones(C, major, 0, 3, "sus4")), "Csus4");
});

test("chords built on dorian keep the mode's own colour", () => {
  // dorian's IV is major where minor's is minor — that is the mode's signature
  assert.equal(chordName(chordTones(C, dorian, 3)), "F");
  assert.equal(chordName(chordTones(C, minor, 3)), "Fm");
});
