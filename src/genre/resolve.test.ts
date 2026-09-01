import test from "node:test";
import assert from "node:assert/strict";
import { resolveGenre, resolveAll, GenreError } from "./resolve.ts";
import { DEFAULTS, type GenreSpec } from "./spec.ts";

const specs = (o: Record<string, GenreSpec>) => o;

test("a genre that declares nothing gets every default", () => {
  const g = resolveGenre("bare", specs({ bare: { label: "Bare" } }));
  assert.equal(g.name, "bare");
  assert.equal(g.label, "Bare");
  assert.deepEqual(g.tempo, DEFAULTS.tempo);
  assert.deepEqual(g.metre, DEFAULTS.metre);
  assert.deepEqual(g.scales, DEFAULTS.scales);
  assert.deepEqual(g.lengthSec, DEFAULTS.lengthSec);
});

test("the resolved genre is total — nothing downstream sees undefined", () => {
  const g = resolveGenre("bare", specs({ bare: { label: "Bare" } }));
  for (const [k, v] of Object.entries(g)) {
    assert.notEqual(v, undefined, `${k} is undefined`);
  }
});

test("it is frozen, so nothing can be edited after it loads", () => {
  const g = resolveGenre("bare", specs({ bare: { label: "Bare" } }));
  assert.ok(Object.isFrozen(g));
  assert.ok(Object.isFrozen(g.metre));
  assert.ok(Object.isFrozen(g.tempo));
  assert.throws(() => {
    (g as { tempo: unknown }).tempo = [1, 2];
  });
});

test("extend overrides only what it names", () => {
  const all = specs({
    base: { label: "Base", tempo: [60, 70], lengthSec: [100, 120] },
    kid: { label: "Kid", extend: "base", tempo: [90, 100] },
  });
  const g = resolveGenre("kid", all);
  assert.equal(g.label, "Kid");
  assert.deepEqual(g.tempo, [90, 100]);
  assert.deepEqual(g.lengthSec, [100, 120], "what it did not name is inherited");
});

test("objects merge deep, so overriding one field of metre keeps the other", () => {
  const all = specs({
    base: { label: "Base", metre: { beats: 3, perBeat: 3 } },
    kid: { label: "Kid", extend: "base", metre: { beats: 3, perBeat: 4 } as never },
  });
  const g = resolveGenre("kid", all);
  assert.deepEqual(g.metre, { beats: 3, perBeat: 4 });
});

test("arrays replace and never merge", () => {
  // a range and a weighted pool are single values that happen to look like
  // lists; concatenating or blending them answers a question nobody asked
  const all = specs({
    base: { label: "B", scales: [["minor", 5], ["dorian", 3]], tempo: [60, 80] },
    kid: { label: "K", extend: "base", scales: [["major", 1]], tempo: [120, 130] },
  });
  const g = resolveGenre("kid", all);
  assert.deepEqual(g.scales, [["major", 1]]);
  assert.deepEqual(g.tempo, [120, 130]);
});

test("a chain of three resolves oldest first", () => {
  const all = specs({
    a: { label: "A", tempo: [60, 61], lengthSec: [10, 20] },
    b: { label: "B", extend: "a", tempo: [70, 71] },
    c: { label: "C", extend: "b", metre: { beats: 3, perBeat: 4 } },
  });
  const g = resolveGenre("c", all);
  assert.equal(g.label, "C");
  assert.deepEqual(g.tempo, [70, 71]);
  assert.deepEqual(g.lengthSec, [10, 20]);
  assert.deepEqual(g.metre, { beats: 3, perBeat: 4 });
});

test("a cycle is refused rather than hanging", () => {
  const all = specs({
    a: { label: "A", extend: "b" },
    b: { label: "B", extend: "a" },
  });
  assert.throws(() => resolveGenre("a", all), /extends itself/);
});

test("extending something that is not a genre is refused", () => {
  assert.throws(
    () => resolveGenre("a", specs({ a: { label: "A", extend: "ghost" } })),
    /not a genre/,
  );
});

test("every problem is reported at once, not one per run", () => {
  const bad: GenreSpec = {
    label: "",
    tempo: [200, 100],
    lengthSec: [0, -5],
    metre: { beats: 0, perBeat: 2.5 },
    scales: [["nonsuch" as never, 1]],
  };
  let err: unknown;
  try {
    resolveGenre("bad", specs({ bad }));
  } catch (e) {
    err = e;
  }
  assert.ok(err instanceof GenreError, "should have refused to load");
  const joined = err.problems.join("\n");
  assert.match(joined, /label is empty/);
  assert.match(joined, /tempo runs backwards/);
  assert.match(joined, /lengthSec starts at 0/);
  assert.match(joined, /metre.beats/);
  assert.match(joined, /metre.perBeat/);
  assert.match(joined, /not a scale/);
  assert.ok(err.problems.length >= 6, `only got ${err.problems.length}`);
});

test("a scale pool that cannot be drawn from is refused", () => {
  assert.throws(
    () => resolveGenre("a", specs({ a: { label: "A", scales: [] } })),
    /scales is empty/,
  );
  assert.throws(
    () => resolveGenre("a", specs({ a: { label: "A", scales: [["minor", 0]] } })),
    /weight above zero/,
  );
});

test("a citation naming a field that does not exist is refused", () => {
  // the failure this check is for: a number is deleted and the reasoning that
  // justified it stays behind, describing a table that is no longer there
  assert.throws(
    () => resolveGenre("a", specs({ a: { label: "A", sources: { swing: "somewhere" } } })),
    /not a field of this genre/,
  );
});

test("a derived genre may add a citation and correct an inherited one", () => {
  const all = specs({
    base: { label: "B", tempo: [60, 70], sources: { tempo: "old" } },
    kid: { label: "K", extend: "base", tempo: [90, 95], sources: { tempo: "new", scales: "s" } },
  });
  const g = resolveGenre("kid", all);
  assert.equal(g.sources["tempo"], "new");
  assert.equal(g.sources["scales"], "s");
});

test("resolveAll fails on the whole set if any one genre is broken", () => {
  assert.throws(
    () => resolveAll(specs({ ok: { label: "OK" }, bad: { label: "Bad", tempo: [9, 1] } })),
    /genre "bad" does not load/,
  );
});
