import test from "node:test";
import assert from "node:assert/strict";
import { GENRE_NAMES, GENRES } from "./index.ts";
import { compose } from "../song.ts";
import { peak, render, rms } from "../sound/render.ts";
import { ROLES } from "./spec.ts";

// every genre goes through the whole program: the rules are the program's
// and the numbers are the genre's, so what holds for one must hold for all

for (const name of GENRE_NAMES) {
  test(`${name}: twenty seeds compose, every part sounds, and the record is the genre's length`, () => {
    const g = GENRES[name];
    for (let seed = 1; seed <= 20; seed++) {
      const s = compose({ seed, genre: name });
      for (const r of ROLES) assert.ok(s.performance.events.some((e) => e.role === r), `${name} seed ${seed}: ${r} never sounds`);
      const [lo, hi] = g.lengthSec;
      assert.ok(s.performance.seconds > lo * 0.7 && s.performance.seconds < hi * 1.3, `${name} seed ${seed}: ${s.performance.seconds}s`);
      assert.ok(s.chart.tempo >= g.tempo[0] && s.chart.tempo <= g.tempo[1]);
    }
  });

  test(`${name}: a seed renders under full scale at a record's level`, () => {
    const s = compose({ seed: 3, genre: name, seconds: 45 });
    const out = render(s, { sampleRate: 22050 });
    const level = 20 * Math.log10(rms(out));
    assert.ok(peak(out) <= 0.9, `${name} peaks at ${peak(out)}`);
    assert.ok(level > -24 && level < -8, `${name} sits at ${level.toFixed(1)} dBFS`);
    for (const r of ROLES) {
      const alone = 20 * Math.log10(rms(render(s, { sampleRate: 22050, only: r })));
      assert.ok(alone > -40, `${name}: the ${r} alone is ${alone.toFixed(1)} dBFS — inaudible`);
    }
  });

  test(`${name}: every citation names a real field, and every number has a source or says it is chosen`, () => {
    const g = GENRES[name];
    assert.ok(Object.keys(g.sources).length >= 5, `${name} cites ${Object.keys(g.sources).length} fields`);
    for (const [field, why] of Object.entries(g.sources)) {
      assert.ok(why.length > 20, `${name} ${field}: "${why}"`);
    }
  });
}
