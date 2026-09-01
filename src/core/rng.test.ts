import test from "node:test";
import assert from "node:assert/strict";
import { rng, hash32, type Weighted } from "./rng.ts";

test("a draw depends only on seed and address", () => {
  const a = rng(7, "lofi").at("bass", 3).unit("rest");
  const b = rng(7, "lofi").at("bass", 3).unit("rest");
  assert.equal(a, b);

  assert.notEqual(a, rng(8, "lofi").at("bass", 3).unit("rest"));
  assert.notEqual(a, rng(7, "dub").at("bass", 3).unit("rest"));
  assert.notEqual(a, rng(7, "lofi").at("bass", 4).unit("rest"));
  assert.notEqual(a, rng(7, "lofi").at("bass", 3).unit("slide"));
});

test("call order cannot move a draw", () => {
  // the property the whole module exists for: taking a draw inside a branch,
  // or adding one, leaves every other draw exactly where it was
  const r = rng(42, "song");
  const alone = r.at("keys").unit("voicing");

  r.at("drums").unit("ghost");
  r.at("drums").unit("fill");
  r.at("bass").series("steps", 64);
  const after = r.at("keys").unit("voicing");

  assert.equal(alone, after);
});

test("at() composes the same address as a longer at()", () => {
  const a = rng(1, "g").at("a").at("b").unit("c");
  const b = rng(1, "g").at("a", "b").unit("c");
  const c = rng(1, "g").unit("a", "b", "c");
  assert.equal(a, b);
  assert.equal(b, c);
});

test("unit is in range and reasonably flat", () => {
  const r = rng(3, "flat");
  const bins = new Array(10).fill(0);
  const n = 200_000;
  for (let i = 0; i < n; i++) {
    const u = r.unit("x", i);
    assert.ok(u >= 0 && u < 1, `out of range: ${u}`);
    bins[Math.floor(u * 10)]!++;
  }
  for (const [i, count] of bins.entries()) {
    const share = count / n;
    assert.ok(Math.abs(share - 0.1) < 0.006, `bin ${i} at ${share.toFixed(4)}`);
  }
});

test("adjacent addresses do not correlate", () => {
  // FNV without a finalizer fails this: consecutive indices land in the same
  // decile far more often than one time in ten
  const r = rng(5, "adjacent");
  let same = 0;
  const n = 100_000;
  for (let i = 0; i < n; i++) {
    if (Math.floor(r.unit("bar", i) * 10) === Math.floor(r.unit("bar", i + 1) * 10)) same++;
  }
  assert.ok(Math.abs(same / n - 0.1) < 0.01, `adjacent same-decile rate ${same / n}`);
});

test("int covers both ends and nothing outside", () => {
  const r = rng(11, "int");
  const seen = new Set<number>();
  for (let i = 0; i < 5000; i++) {
    const v = r.int(`k${i}`, 2, 5);
    assert.ok(Number.isInteger(v) && v >= 2 && v <= 5, `got ${v}`);
    seen.add(v);
  }
  assert.deepEqual([...seen].sort(), [2, 3, 4, 5]);
  assert.equal(r.int("one", 4, 4), 4);
  assert.equal(r.int("flipped", 5, 5), 5);
});

test("chance honours its bounds", () => {
  const r = rng(13, "chance");
  for (let i = 0; i < 500; i++) {
    assert.equal(r.chance(`n${i}`, 0), false);
    assert.equal(r.chance(`n${i}`, 1), true);
  }
  let hits = 0;
  for (let i = 0; i < 20_000; i++) if (r.chance(`p${i}`, 0.25)) hits++;
  assert.ok(Math.abs(hits / 20_000 - 0.25) < 0.015);
});

test("weighted follows the weights and ignores non-positive ones", () => {
  const table: Weighted<string> = [
    ["a", 3],
    ["b", 1],
    ["c", 0],
  ];
  const r = rng(17, "w");
  const count: Record<string, number> = { a: 0, b: 0, c: 0 };
  for (let i = 0; i < 40_000; i++) count[r.weighted(`k${i}`, table)]!++;
  assert.equal(count["c"], 0);
  assert.ok(Math.abs(count["a"]! / 40_000 - 0.75) < 0.01);
  assert.ok(Math.abs(count["b"]! / 40_000 - 0.25) < 0.01);
});

test("empty and weightless draws throw rather than return nothing", () => {
  const r = rng(19, "empty");
  assert.throws(() => r.pick("none", []), /pick from nothing/);
  assert.throws(() => r.weighted("none", [["a", 0]]), /no positive weight/);
});

test("shuffle permutes, does not mutate, and is stable per address", () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8];
  const r = rng(23, "sh");
  const a = r.shuffle("order", src);
  const b = r.shuffle("order", src);
  assert.deepEqual(a, b);
  assert.deepEqual(src, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.slice().sort((x, y) => x - y), src);
  assert.notDeepEqual(r.shuffle("other", src), a);
});

test("series gives independent values addressed by index", () => {
  const r = rng(29, "s");
  const s = r.series("steps", 16);
  assert.equal(s.length, 16);
  assert.equal(s[5], r.unit("steps", 5));
  assert.equal(new Set(s).size, 16);
});

test("sample takes distinct entries and stops when the table runs out", () => {
  const table: Weighted<string> = [
    ["a", 5],
    ["b", 4],
    ["c", 3],
    ["d", 0],
  ];
  const r = rng(31, "sam");
  for (let i = 0; i < 200; i++) {
    const got = r.sample(`k${i}`, table, 2);
    assert.equal(got.length, 2);
    assert.equal(new Set(got).size, 2);
    assert.ok(!got.includes("d"));
  }
  assert.equal(r.sample("all", table, 99).length, 3);
});

test("hash32 is a 32-bit unsigned value", () => {
  for (const s of ["", "a", "1/lofi/bass/3/rest", "\u{1F600}"]) {
    const h = hash32(s);
    assert.ok(Number.isInteger(h) && h >= 0 && h <= 0xffffffff, `${s} -> ${h}`);
  }
  assert.notEqual(hash32("bar/11"), hash32("bar/12"));
});
