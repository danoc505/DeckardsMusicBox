import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { resolveGenre, GenreError } from "../genre/index.ts";
import { dungeonsynth } from "../genre/dungeonsynth.ts";
import { metreFixture } from "../genre/testing.ts";
import { ROLES } from "../genre/spec.ts";
import { render, rms } from "../sound/render.ts";

/**
 * The whole program in a metre that is not four four.
 *
 * Every rule here is written in beats and resolved against the metre the
 * genre actually has, and this is the test that says so end to end rather
 * than a stage at a time against a fixture.
 */
const METRES: readonly (readonly [number, number])[] = [[3, 4], [5, 4], [6, 4], [7, 4], [4, 3]];

for (const [beats, perBeat] of METRES) {
  const name = `${beats}/${perBeat}`;
  const genre = resolveGenre("odd", { odd: { label: name, ...metreFixture(beats, perBeat) } });

  test(`${name}: records compose, fill their bars, and every part sounds`, () => {
    const steps = beats * perBeat;
    for (let seed = 1; seed <= 12; seed++) {
      const s = compose({ seed, genre, seconds: 150 });
      assert.equal(s.form.clock.steps, steps);
      for (const r of ROLES) assert.ok(s.performance.events.some((e) => e.role === r), `${name} seed ${seed}: no ${r}`);
      for (const e of s.performance.events) {
        assert.ok(e.step >= 0 && e.step < steps, `${name}: step ${e.step} outside a bar of ${steps}`);
        assert.ok(Number.isFinite(e.tSec) && e.durSec > 0);
      }
      // the tune reaches the second bar of its phrases: a cell written for
      // another metre would leave that bar empty
      const leadBars = new Set(s.performance.events.filter((e) => e.role === "lead").map((e) => e.bar % 2));
      assert.deepEqual([...leadBars].sort(), [0, 1], `${name} seed ${seed}: the tune is only in ${[...leadBars]}`);
    }
  });

  test(`${name}: the tune is as dense as the metre is long`, () => {
    // onsets per beat, which is the measure that survives a change of metre —
    // a count per bar would rise with the bar and say nothing
    const s = compose({ seed: 4, genre, seconds: 240 });
    const notes = s.performance.events.filter((e) => e.role === "lead").length;
    const beatsPlayed = s.form.bars * beats;
    const perBeatRate = notes / beatsPlayed;
    assert.ok(perBeatRate > 0.25, `${name}: ${perBeatRate.toFixed(2)} lead notes a beat`);
  });

  test(`${name}: it renders`, () => {
    const s = compose({ seed: 2, genre, seconds: 45 });
    const level = 20 * Math.log10(rms(render(s, { sampleRate: 22050 })));
    assert.ok(level > -30 && level < -6, `${name}: ${level.toFixed(1)} dBFS`);
  });
}

test("a genre keeping four-four's rhythm cells in a longer bar is refused, by name", () => {
  // the defect: a cell written in beats for a four-beat bar covers seven of
  // the twelve beats of a phrase in six four, so the tune came out a third
  // as long and nothing said. The load says it now.
  let err: GenreError | null = null;
  try {
    resolveGenre("six", { six: { ...dungeonsynth, metre: { beats: 6, perBeat: 4 } } });
  } catch (e) {
    err = e as GenreError;
  }
  assert.ok(err instanceof GenreError, "a six-four genre with four-four cells loaded");
  const said = err.problems.filter((p) => p.startsWith("lead.rhythms cell"));
  assert.ok(said.length >= 3, err.problems.join("\n"));
  assert.match(said[0]!, /leaves 6 beats silent in a 12-beat phrase/);
  assert.match(said[0]!, /Write the cells for a 6-beat bar/);
});

test("a cell that covers its phrase is accepted in the same metre", () => {
  const g = resolveGenre("six", {
    six: { ...dungeonsynth, metre: { beats: 6, perBeat: 4 }, lead: { rhythms: [[[0, 2, 4, 6, 8, 10], 1]] } },
  });
  assert.equal(g.metre.beats, 6);
  const s = compose({ seed: 1, genre: g, seconds: 150 });
  assert.ok(s.performance.events.some((e) => e.role === "lead"));
});
