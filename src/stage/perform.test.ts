import test from "node:test";
import assert from "node:assert/strict";
import { compose, type Song } from "../song.ts";
import { GENRES, resolveGenre } from "../genre/index.ts";
import { dump, distinctBars, motionOf } from "../dump.ts";
import { ROLES } from "../genre/spec.ts";

const sweep = (n: number, seconds = 200): Song[] =>
  Array.from({ length: n }, (_, i) => compose({ seed: i + 1, genre: "lofi", seconds }));

test("the same seed performs the same record, byte for byte", () => {
  const a = dump(compose({ seed: 7, genre: "lofi" }));
  const b = dump(compose({ seed: 7, genre: "lofi" }));
  assert.equal(a, b);
});

test("events are sorted by time and every one is inside the record", () => {
  for (const s of sweep(40)) {
    const ev = s.performance.events;
    for (let i = 1; i < ev.length; i++) assert.ok(ev[i]!.tSec >= ev[i - 1]!.tSec);
    for (const e of ev) {
      assert.ok(e.tSec > -0.1, `an event at ${e.tSec}s`);
      assert.ok(e.tSec < s.performance.seconds);
      assert.ok(e.durSec > 0);
      assert.ok(e.gain > 0 && e.gain <= 1.25, `gain ${e.gain}`);
      assert.ok(e.bar >= 0 && e.bar < s.form.bars);
    }
  }
});

test("every heard note of every section is played, and nothing else", () => {
  for (const s of sweep(30)) {
    let expected = 0;
    const played = new Map<string, number>();
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        const mbar = (bar - p.section.startBar) % m.bars;
        const round = Math.floor((bar - p.section.startBar) / m.bars);
        for (const role of p.heard) {
          const nth = (played.get(`${p.material} ${role}`) ?? 0) + round;
          if (role === "drums") {
            expected += m.drums[nth]!.filter((h) => h.bar === mbar && !(p.thin && (h.lane === "hat" || h.lane === "openhat"))).length;
          } else {
            const notes = role === "lead" ? m.lead[nth]! : m.groove[role];
            expected += notes.filter((n) => n.bar === mbar).length;
          }
        }
      }
      for (const role of p.heard) {
        played.set(`${p.material} ${role}`, (played.get(`${p.material} ${role}`) ?? 0) + Math.ceil(p.section.bars / m.bars));
      }
    }
    assert.equal(s.performance.events.length, expected);
  }
});

test("a material heard again does not start its tune over: the count runs across the record", () => {
  // three eight-bar choruses over a four-bar material are six times round,
  // and a plan of four letters is read straight through them — so the
  // lead's lines across those sections are the plan, not its first two
  // letters three times
  let checked = 0;
  for (const s of sweep(80)) {
    const byKey = new Map<string, string[]>();
    for (const p of s.arrangement.placed) {
      if (!p.heard.has("lead")) continue;
      const m = s.materials.all.get(p.material)!;
      const list = byKey.get(p.material) ?? [];
      for (let bar = p.section.startBar; bar < p.section.endBar; bar += m.bars) {
        list.push(s.performance.events.filter((e) => e.role === "lead" && e.bar >= bar && e.bar < bar + m.bars).map((e) => `${e.bar - bar}:${e.step}:${e.pitch}`).join());
      }
      byKey.set(p.material, list);
    }
    for (const [key, rounds] of byKey) {
      const m = s.materials.all.get(key)!;
      assert.equal(rounds.length, m.lead.length);
      if (rounds.length < 4) continue;
      checked++;
      // whatever the plan, its four letters hold at most three distinct
      // lines and the material was written with exactly those
      assert.ok(new Set(rounds).size <= 3);
      assert.ok(new Set(rounds).size >= 2, `${key} on seed ${s.chart.seed}: ${rounds.length} times round, all the same`);
    }
  }
  assert.ok(checked > 40);
});

test("a thin section has no hat and keeps its kick", () => {
  let thinBars = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      if (!p.thin) continue;
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        thinBars++;
        const here = s.performance.events.filter((e) => e.bar === bar && e.role === "drums");
        assert.ok(!here.some((e) => e.lane === "hat" || e.lane === "openhat"), `hat in a thin bar ${bar}`);
        if (p.heard.has("drums")) assert.ok(here.some((e) => e.lane === "kick" && e.step === 0), `no kick in thin bar ${bar}`);
      }
    }
  }
  assert.ok(thinBars > 20);
});

test("swing moves the off-eighths late and leaves the beats alone", () => {
  const perBeat = GENRES.lofi.metre.perBeat;
  let off = 0;
  let onBeat = 0;
  for (const s of sweep(20)) {
    for (const e of s.performance.events) {
      const drift = e.playedStep - e.step;
      if (e.step % perBeat === perBeat / 2) {
        off++;
        assert.ok(drift > 0.1, `an off-eighth at step ${e.step} landed ${drift} early or on time`);
      } else if (e.step % perBeat === 0) {
        onBeat++;
        assert.ok(Math.abs(drift) < 0.5, `a beat drifted ${drift} steps`);
      }
    }
  }
  assert.ok(off > 100 && onBeat > 100);
});

test("a straight genre does not swing", () => {
  const straight = resolveGenre("straight", { straight: { label: "S", feel: { swing: 0, jitterMs: 0 } } });
  const s = compose({ seed: 3, genre: straight, seconds: 120 });
  for (const e of s.performance.events) assert.equal(e.playedStep, e.step);
});

test("jitter is bounded by the genre's number", () => {
  for (const s of sweep(20)) {
    const limit = s.chart.genre.feel.jitterMs / 1000;
    const perBeat = s.chart.metre.perBeat;
    for (const e of s.performance.events) {
      if (e.step % perBeat === perBeat / 2) continue; // swung as well
      const drift = (e.playedStep - e.step) * s.form.clock.stepSec(e.bar);
      assert.ok(Math.abs(drift) <= limit + 1e-9, `drift ${drift}s exceeds ${limit}s`);
    }
  }
});

test("the arc makes the peak louder than the intro, like for like", () => {
  // like for like: a thin intro has no hats, and hats are the quiet drums, so
  // its MEAN drum gain is higher for having lost them. The arc is read off the
  // downbeat kick, which every bar has, and off the pitched parts whole.
  let cases = 0;
  for (const s of sweep(60)) {
    const intro = s.arrangement.placed.find((p) => p.section.fn === "intro");
    const peak = s.arrangement.placed[s.form.peakAt]!;
    if (!intro) continue;
    const inside = (p: typeof peak) => (e: { bar: number }) => e.bar >= p.section.startBar && e.bar < p.section.endBar;
    const mean = (es: readonly { gain: number }[]) => (es.length ? es.reduce((a, e) => a + e.gain, 0) / es.length : null);
    const kick = (p: typeof peak) => mean(s.performance.events.filter((e) => inside(p)(e) && e.lane === "kick" && e.step === 0));
    const part = (p: typeof peak, role: string) => mean(s.performance.events.filter((e) => inside(p)(e) && e.role === role));
    const pairs: [number | null, number | null, string][] = [[kick(intro), kick(peak), "kick"]];
    for (const role of ROLES) if (role !== "drums") pairs.push([part(intro, role), part(peak, role), role]);
    for (const [gi, gp, what] of pairs) {
      if (gi === null || gp === null) continue;
      cases++;
      assert.ok(gp > gi, `${what}: peak ${gp} is not louder than intro ${gi}`);
    }
  }
  assert.ok(cases > 20);
});

test("the tune does not repeat itself at the loop seam", () => {
  // within a section the material loops, and the loop's last note followed
  // by its first is the seam the rule is about. Across a SECTION boundary a
  // new material may open on the pitch the last one closed on — that is a
  // pivot, not a line hammering one note — so those pairs are not judged.
  for (const s of sweep(60)) {
    const boundaries = new Set(s.form.sections.map((x) => x.startBar));
    const lead = s.performance.events.filter((e) => e.role === "lead");
    for (let i = 1; i < lead.length; i++) {
      const crosses = lead[i]!.bar !== lead[i - 1]!.bar && boundaries.has(lead[i]!.bar);
      if (crosses) continue;
      assert.notEqual(lead[i]!.pitch, lead[i - 1]!.pitch, `seed ${s.chart.seed} bar ${lead[i]!.bar}: the lead repeats a pitch`);
    }
  }
});

test("a long section does not play the same drum bars over and over", () => {
  // per section, a floor that the construction guarantees: the figure and at
  // least two treatments of it. Across the sweep, the real claim — most bars
  // of a long section differ from most others — as an average, because a
  // taste asserted on every seed is a test that fails on the unlucky one.
  let ratio = 0;
  let sections = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      if (p.section.bars < m.bars * 3 || !p.heard.has("drums") || p.thin) continue;
      const bars = new Set<string>();
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        bars.add(s.performance.events.filter((e) => e.bar === bar && e.role === "drums").map((e) => `${e.step}${e.lane}`).sort().join());
      }
      assert.ok(bars.size >= 3, `seed ${s.chart.seed} ${p.section.fn}: ${p.section.bars} bars of drums are only ${bars.size} distinct`);
      ratio += bars.size / p.section.bars;
      sections++;
    }
  }
  assert.ok(sections > 20);
  assert.ok(ratio / sections > 0.4, `long sections average ${((100 * ratio) / sections).toFixed(0)}% distinct drum bars`);
});

test("a long section does not play the tune over and over", () => {
  // the tune is stated, restated, developed: a sixteen-bar section over a
  // four-bar material hears more than four distinct lead bars. Per section
  // as a floor the plan guarantees for one restatement and one development,
  // and across the sweep as an average.
  let ratio = 0;
  let sections = 0;
  for (const s of sweep(60)) {
    for (const p of s.arrangement.placed) {
      const m = s.materials.all.get(p.material)!;
      if (p.section.bars < m.bars * 4 || !p.heard.has("lead")) continue;
      const bars = new Set<string>();
      let played = 0;
      for (let bar = p.section.startBar; bar < p.section.endBar; bar++) {
        const here = s.performance.events.filter((e) => e.bar === bar && e.role === "lead");
        if (here.length === 0) continue;
        played++;
        bars.add(here.map((e) => `${e.step}:${e.pitch}`).sort().join());
      }
      ratio += bars.size / played;
      sections++;
    }
  }
  assert.ok(sections > 20);
  assert.ok(ratio / sections > 0.35, `long sections average ${((100 * ratio) / sections).toFixed(0)}% distinct lead bars`);
});

test("the dump follows the format and counts itself correctly", () => {
  const s = compose({ seed: 11, genre: "lofi", seconds: 180 });
  const text = dump(s);
  const lines = text.trimEnd().split("\n");
  assert.equal(lines[0], "#format\tdeckard-events\t1");
  assert.ok(lines.some((l) => l.startsWith("#program\tDeckard's Orchestrator MKIII")));
  const header = lines.findIndex((l) => l.startsWith("tSec\t"));
  assert.ok(header > 0);
  assert.equal(lines[header], "tSec\tbar\tstep\trole\tlane\tvoice\tpitch\tnote\tdurSec\tgain\tflags");
  const events = lines.length - header - 1;
  const declared = Number(lines.find((l) => l.startsWith("#events\t"))!.split("\t")[1]);
  assert.equal(events, declared);
  assert.equal(events, s.performance.events.length);
  for (const r of ROLES) {
    const roleLine = lines.find((l) => l.startsWith(`#role\t${r}\t`));
    assert.ok(roleLine, `no #role line for ${r}`);
    assert.equal(Number(roleLine.split("\t")[2]), s.performance.events.filter((e) => e.role === r).length);
  }
  assert.equal(lines.filter((l) => l.startsWith("#section\t")).length, s.form.sections.length);
});

test("the dump's own measures agree with the events", () => {
  const s = compose({ seed: 5, genre: "lofi", seconds: 200 });
  const ev = s.performance.events;
  const m = motionOf(ev, "lead");
  assert.equal(m.leap + m.step + m.same, m.n - 1);
  const d = distinctBars(ev, "drums");
  assert.ok(d.distinct >= 1 && d.distinct <= d.bars);
  assert.equal(d.bars, new Set(ev.filter((e) => e.role === "drums").map((e) => e.bar)).size);
});

test("no part is silent for a whole record", () => {
  for (const s of sweep(60)) {
    for (const r of ROLES) {
      assert.ok(s.performance.events.some((e) => e.role === r), `${r} never sounds on seed ${s.chart.seed}`);
    }
  }
});
