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

  test(`${name}: sixty records hold together — nothing silent, nothing empty, nothing threadbare`, () => {
    // the broad net. Each of these is a way a record can be wrong that no
    // single rule owns, so they are checked on the finished thing: a part
    // the arrangement says is heard but that plays nothing, a bar of the
    // record with no sound in it at all, a part so sparse it is not there,
    // a form of one section, a length nowhere near what the genre asks.
    const g = GENRES[name];
    for (let seed = 1; seed <= 60; seed++) {
      const s = compose({ seed, genre: name });
      const ev = s.performance.events;
      const where = `${name} seed ${seed}`;

      for (const p of s.arrangement.placed) {
        for (const r of p.heard) {
          const here = ev.some((e) => e.role === r && e.bar >= p.section.startBar && e.bar < p.section.endBar);
          assert.ok(here, `${where}: the ${r} is heard in the ${p.section.fn} and plays nothing`);
        }
      }

      // sounding, not struck: a drone holds a whole statement, so three bars
      // in four have no onset of it and are not silent for that
      const onset = new Set(ev.map((e) => e.bar));
      for (let b = 0; b < s.form.bars; b++) {
        if (onset.has(b)) continue;
        const start = s.form.clock.at(b);
        const ringing = ev.some((e) => e.tSec <= start && e.tSec + e.durSec > start);
        assert.ok(ringing, `${where}: bar ${b} is silent`);
      }

      for (const r of ROLES) {
        const bars = new Set(ev.filter((e) => e.role === r).map((e) => e.bar));
        const notes = ev.filter((e) => e.role === r).length;
        assert.ok(bars.size > 0, `${where}: the ${r} never sounds`);
        assert.ok(notes / bars.size >= 0.9, `${where}: the ${r} averages ${(notes / bars.size).toFixed(2)} notes a bar`);
      }

      assert.ok(s.form.sections.length >= 3, `${where}: ${s.form.sections.length} sections`);
      const [lo, hi] = g.lengthSec;
      assert.ok(
        s.performance.seconds > lo * 0.75 && s.performance.seconds < hi * 1.25,
        `${where}: ${s.performance.seconds.toFixed(0)}s against a genre asking ${lo}–${hi}`,
      );
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
