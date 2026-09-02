import test from "node:test";
import assert from "node:assert/strict";
import { makeForm, describeForm, LAWS, FormError, type Form } from "./form.ts";
import { makeChart } from "./chart.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import type { GenreSpec, SectionFn } from "../genre/spec.ts";

const lofi = GENRES.lofi;
const formOf = (seed: number, seconds?: number): Form =>
  makeForm(makeChart(seconds === undefined ? { seed, genre: lofi } : { seed, genre: lofi, seconds }));

const sweep = (n = 120): Form[] => Array.from({ length: n }, (_, i) => formOf(i + 1));

test("the same seed gives the same form", () => {
  assert.equal(describeForm(formOf(7)), describeForm(formOf(7)));
});

test("sections tile the record with no gap and no overlap", () => {
  for (const f of sweep(60)) {
    let at = 0;
    for (const s of f.sections) {
      assert.equal(s.startBar, at, "a section does not start where the last one ended");
      assert.ok(s.bars >= 1);
      assert.equal(s.endBar, s.startBar + s.bars);
      at = s.endBar;
    }
    assert.equal(at, f.bars);
    assert.equal(f.clock.bars, f.bars);
  }
});

test("a record ends on its outro and nowhere else has one", () => {
  for (const f of sweep(80)) {
    const outros = f.sections.filter((s) => s.fn === "outro");
    assert.equal(outros.length, 1, describeForm(f));
    assert.equal(outros[0], f.sections[f.sections.length - 1]);
  }
});

test("an intro is the first section or there is none", () => {
  let cold = 0;
  let warm = 0;
  for (const f of sweep(200)) {
    const intros = f.sections.filter((s) => s.fn === "intro");
    assert.ok(intros.length <= 1);
    if (intros.length === 1) {
      assert.equal(intros[0], f.sections[0]);
      warm++;
    } else {
      cold++;
    }
  }
  // both ways of opening are reachable
  assert.ok(warm > 0 && cold > 0, `warm ${warm}, cold ${cold}`);
});

test("no function appears three times running", () => {
  for (const f of sweep(200)) {
    const fns = f.sections.map((s) => s.fn);
    for (let i = 2; i < fns.length; i++) {
      assert.ok(
        !(fns[i] === fns[i - 1] && fns[i] === fns[i - 2]),
        `${fns[i]} three times running in ${describeForm(f)}`,
      );
    }
  }
});

test("a bridge always leads back to something", () => {
  // a departure with nothing after it but the outro has not departed from
  // anywhere, it has stopped
  for (const f of sweep(200)) {
    for (const s of f.sections) {
      if (s.fn !== "bridge") continue;
      const after = f.sections.slice(s.index + 1).filter((x) => x.fn !== "outro");
      assert.ok(after.length >= 1, `bridge leads nowhere in ${describeForm(f)}`);
    }
  }
});

test("a bridge always has something to depart from", () => {
  for (const f of sweep(200)) {
    for (const s of f.sections) {
      if (s.fn !== "bridge") continue;
      assert.ok(s.index >= 2, `bridge at ${s.index} in ${describeForm(f)}`);
      const before = f.sections.slice(0, s.index);
      assert.ok(before.some((x) => x.idea === "A" || x.idea === "B"));
    }
  }
});

test("the third HEARING of an idea is marked to vary, whatever came between", () => {
  // It used to be the third statement IN A ROW, and in a record that
  // alternates — verse chorus verse chorus verse — that is almost never: an
  // idea's run resets every time the other interrupts it, so five hearings of
  // a verse were five identical verses and only 5% of sections ever varied.
  // A returning section is still a return whatever came between, and it is
  // the HEARING that wears out: "when an idea is presented once, it piques
  // our interest. When it is repeated, the concept is reinforced. However, if
  // it is repeated a third time, our brains may begin to tune it out"
  // (omnionsound.com, "The Rule Of Three In Music Composition").
  let varied = 0;
  for (const f of sweep(200)) {
    const since = new Map<string, number>();
    for (const s of f.sections) {
      const heard = (since.get(s.idea) ?? 0) + 1;
      assert.equal(s.vary, heard >= 3, `${describeForm(f)} at ${s.index}`);
      since.set(s.idea, s.vary ? 0 : heard);
      if (s.vary) varied++;
    }
  }
  assert.ok(varied > 100, `only ${varied} sections varied across 200 records`);
});

test("a turn ends the count, so the plain idea comes back", () => {
  // the failure this is against: counting hearings and never resetting means
  // everything past the third is a variant and the tune itself is heard twice
  // at the start and never again. Coming back to the thing an ear already
  // knows is half of what a return is for.
  const long = Array.from({ length: 200 }, (_, i) => formOf(i + 1, 420));
  let pairs = 0;
  for (const f of long) {
    const byIdea = new Map<string, number[]>();
    f.sections.forEach((s, i) => {
      if (!s.vary) return;
      (byIdea.get(s.idea) ?? byIdea.set(s.idea, []).get(s.idea)!).push(i);
    });
    for (const [idea, at] of byIdea) {
      for (let i = 1; i < at.length; i++) {
        pairs++;
        // between two varied hearings of the SAME idea there are at least two
        // plain ones: the count went back to nothing and had to reach three
        const between = f.sections.slice(at[i - 1]! + 1, at[i]!).filter((s) => s.idea === idea).length;
        assert.ok(between >= 2, `${idea} varied twice with ${between} plain hearings between: ${describeForm(f)}`);
      }
    }
  }
  assert.ok(pairs > 0, "no idea varied twice — the sweep is too short to test this");
});

test("statement counts every hearing of an idea, however it is labelled", () => {
  for (const f of sweep(60)) {
    const seen = new Map<string, number>();
    for (const s of f.sections) {
      const n = (seen.get(s.idea) ?? 0) + 1;
      seen.set(s.idea, n);
      assert.equal(s.statement, n);
    }
  }
});

test("section lengths are drawn, not fixed", () => {
  // the defect this is against, measured on the old program: every section of
  // every record was 16 bars, 41 of 41 across four songs
  // the genre's pools offer 4, 8 and 16, and every one of them is drawn
  const lens = new Set<number>();
  for (const f of sweep(120)) for (const s of f.sections) lens.add(s.bars);
  assert.deepEqual([...lens].sort((a, b) => a - b), [4, 8, 16]);

  const shares = new Map<number, number>();
  let total = 0;
  for (const f of sweep(120)) {
    for (const s of f.sections) {
      shares.set(s.bars, (shares.get(s.bars) ?? 0) + 1);
      total++;
    }
  }
  const commonest = Math.max(...shares.values()) / total;
  assert.ok(commonest < 0.75, `one length covers ${(commonest * 100).toFixed(0)}% of sections`);
});

test("a genre may declare one length and get exactly that", () => {
  const square = resolveGenre("square", {
    square: {
      label: "Square",
      form: { lengths: { verse: 16, chorus: 16, intro: 8, outro: 8, bridge: 8, instrumental: 16 } },
    },
  } satisfies Record<string, GenreSpec>);
  const f = makeForm(makeChart({ seed: 3, genre: square, seconds: 200 }));
  for (const s of f.sections) {
    assert.ok([8, 16].includes(s.bars), `${s.fn} came out ${s.bars}`);
  }
});

test("the record lands near the length asked for", () => {
  for (const seconds of [90, 150, 240, 400]) {
    for (const seed of [1, 5, 19]) {
      const f = formOf(seed, seconds);
      const got = f.clock.at(f.bars);
      // a form is built out of whole sections, so it lands within half of the
      // longest one either side — not on the number, and never wildly off it
      assert.ok(Math.abs(got - seconds) < seconds * 0.25 + 20,
        `asked ${seconds}s, got ${got.toFixed(0)}s: ${describeForm(f)}`);
    }
  }
});

test("a short record still gets a beginning and an end", () => {
  const f = formOf(4, 30);
  assert.ok(f.sections.length >= 2, describeForm(f));
  assert.equal(f.sections[f.sections.length - 1]!.fn, "outro");
  assert.ok(f.bars > 0);
});

test("exactly one section is the peak, and it is the biggest", () => {
  for (const f of sweep(120)) {
    const peaks = f.sections.filter((s) => s.peak);
    assert.equal(peaks.length, 1, describeForm(f));
    assert.equal(peaks[0]!.index, f.peakAt);
    const top = Math.max(...f.sections.map((s) => s.energy));
    assert.equal(peaks[0]!.energy, top);
  }
});

test("the peak is the LAST of the biggest kind of section, not the first", () => {
  // this is exactly what the late lift buys and nothing more. Without it every
  // chorus scores identically and the record's largest moment lands on
  // whichever one the tie-break reaches first — usually the earliest.
  for (const f of sweep(200)) {
    const peak = f.sections[f.peakAt]!;
    const sameKind = f.sections.filter((s) => s.fn === peak.fn);
    assert.equal(
      peak.index,
      sameKind[sameKind.length - 1]!.index,
      `peak is ${peak.fn} ${peak.index} but a later ${peak.fn} exists: ${describeForm(f)}`,
    );
  }
});

test("a record with several choruses peaks on the last one", () => {
  const many = sweep(200).filter((f) => f.sections.filter((s) => s.fn === "chorus").length >= 2);
  assert.ok(many.length > 10, `only ${many.length} records had two choruses`);
  for (const f of many) {
    const choruses = f.sections.filter((s) => s.fn === "chorus");
    assert.equal(f.peakAt, choruses[choruses.length - 1]!.index, describeForm(f));
  }
});

test("the arc is one value per bar and follows the sections", () => {
  for (const f of sweep(40)) {
    assert.equal(f.arc.length, f.bars);
    for (const v of f.arc) assert.ok(v >= 0 && v <= 1, `arc value ${v}`);
    // at a section's own centre the arc is that section's energy
    for (const s of f.sections) {
      const mid = Math.floor((s.startBar + s.endBar) / 2);
      if (mid >= f.bars) continue;
      const near = Math.abs(f.arc[mid]! - s.energy);
      assert.ok(near < 0.2, `${s.fn} centre reads ${f.arc[mid]} against ${s.energy}`);
    }
  }
});

test("the arc peaks inside the peak section", () => {
  for (const f of sweep(60)) {
    let top = 0;
    for (let b = 1; b < f.arc.length; b++) if (f.arc[b]! > f.arc[top]!) top = b;
    const peak = f.sections[f.peakAt]!;
    assert.ok(top >= peak.startBar && top < peak.endBar,
      `arc peaks at bar ${top}, peak section is ${peak.startBar}..${peak.endBar}`);
  }
});

test("a law that leaves nothing says which law, rather than falling through", () => {
  // a genre whose only move out of a verse is another verse cannot be walked:
  // no-triple stops the third, and there is nothing else offered
  const stuck = resolveGenre("stuck", {
    stuck: {
      label: "Stuck",
      lengthSec: [600, 600],
      form: {
        introChance: 0,
        next: { intro: [["verse", 1]], verse: [["verse", 1]] },
      },
    },
  } satisfies Record<string, GenreSpec>);
  let err: unknown;
  try {
    makeForm(makeChart({ seed: 1, genre: stuck }));
  } catch (e) {
    err = e;
  }
  assert.ok(err instanceof FormError, "should have refused");
  assert.match(err.message, /no-triple/);
  assert.match(err.message, /an ear stops listening/);
});

test("every law is named, explained, and refuses something", () => {
  const names = LAWS.map((l) => l.name);
  assert.equal(new Set(names).size, names.length, "two laws share a name");
  for (const law of LAWS) {
    assert.ok(law.why.length > 10, `${law.name} has no reason`);
  }
  const ctx = {
    rules: lofi.form,
    sofar: ["verse", "verse"] as SectionFn[],
    ideas: ["A", "A"] as const,
  };
  assert.equal(LAWS.find((l) => l.name === "no-triple")!.ok("verse", ctx), false);
  assert.equal(LAWS.find((l) => l.name === "no-triple")!.ok("chorus", ctx), true);
});

test("the form is frozen", () => {
  const f = formOf(1);
  assert.ok(Object.isFrozen(f));
  assert.ok(Object.isFrozen(f.sections));
  assert.ok(Object.isFrozen(f.sections[0]));
});
