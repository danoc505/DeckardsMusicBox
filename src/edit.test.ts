import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "./song.ts";
import { dump } from "./dump.ts";
import { isPin } from "./core/rng.ts";
import { describeEdit, formatEdit, parseEdit, reroll, rerollAspect, rerollWord, setKey, setMode, setTempo, setWord, split } from "./edit.ts";
import { GENRE_NAMES } from "./genre/index.ts";
import { ROLES, type Role } from "./genre/spec.ts";
import { NOTE_NAMES, pc } from "./core/theory.ts";

/** One part's notes in a bar range, as a set of strings a change would show in. */
function notesOf(song: ReturnType<typeof compose>, role: Role, from = 0, to = Infinity): Set<string> {
  const out = new Set<string>();
  for (const e of song.performance.events) {
    if (e.role !== role || e.bar < from || e.bar >= to) continue;
    out.add(`${e.bar}:${e.step}:${e.pitch}:${e.lane ?? ""}`);
  }
  return out;
}
const same = (a: Set<string>, b: Set<string>): boolean => a.size === b.size && [...a].every((k) => b.has(k));

test("rerolling one part of one section gives that part new notes and leaves the others' where they were", () => {
  let judged = 0;
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 12; seed++) {
      const plain = compose({ seed, genre });
      // the first section that hears the keys AND the tune, so both can be read
      const p = plain.arrangement.placed.find((q) => q.heard.has("lead") && q.heard.has("keys"));
      if (p === undefined) continue;
      judged++;
      const edits = reroll(plain, { roles: ["lead"], from: p.section.startBar, to: p.section.endBar });
      assert.equal(edits.length, 1, `one section plays one material, so one edit: ${edits.map(formatEdit)}`);
      const rolled = compose({ seed, genre, edits });
      // THE SELECTION CHANGED
      const a = notesOf(plain, "lead", p.section.startBar, p.section.endBar);
      const b = notesOf(rolled, "lead", p.section.startBar, p.section.endBar);
      assert.ok(!same(a, b), `${genre} ${seed}: the tune in ${p.section.fn} did not move under ${formatEdit(edits[0]!)}`);
      // WHAT WAS NOT SELECTED DID NOT. The keys, the drums, the bass and the
      // drone are drawn beside the tune, not from it, so they are byte for
      // byte. The counter is written AGAINST the tune and may follow it.
      for (const role of ["keys", "drums", "bass", "drone"] as const) {
        assert.ok(same(notesOf(plain, role), notesOf(rolled, role)), `${genre} ${seed}: the ${role} moved when only the tune was rerolled`);
      }
      // AND THE FORM, THE CHORDS AND THE ARRANGEMENT ARE THE SAME RECORD
      assert.equal(rolled.form.bars, plain.form.bars);
      assert.deepEqual([...rolled.materials.all.keys()], [...plain.materials.all.keys()]);
      for (const [key, m] of plain.materials.all) assert.deepEqual(rolled.materials.all.get(key)!.chords.map((c) => c.name), m.chords.map((c) => c.name));
      assert.deepEqual(rolled.arrangement.placed.map((q) => [...q.heard].sort()), plain.arrangement.placed.map((q) => [...q.heard].sort()));
      // AND THE DUMP SAYS WHAT WAS DONE
      assert.ok(dump(rolled).includes(`#edit\t${edits[0]!.at}\t1`), "the dump does not name the edit");
    }
  }
  assert.ok(judged >= 12, `only ${judged} records had a section with both keys and tune`);
});

test("a whole instrument is every material, and a bar range is only the materials it plays", () => {
  const song = compose({ seed: 3, genre: "lofi" });
  const all = reroll(song, { roles: ["keys"] });
  assert.equal(all.length, song.materials.all.size, "one edit per material for a whole instrument");
  for (const e of all) assert.match(e.at, /^material\/[A-C]\/\d+\/keys$/);
  const first = song.arrangement.placed[0]!;
  const some = reroll(song, { roles: ["keys", "bass"], from: first.section.startBar, to: first.section.endBar });
  assert.equal(some.length, 2, "one material, two parts: two edits");
  // and every edit describes itself in the record's own words
  for (const e of [...all, ...some]) assert.match(describeEdit(song, e), /^(keys|bass) · [A-C](\/\d)? · bars \d+–\d+/);
});

test("stepping back is the list one shorter, and the record comes back exactly", () => {
  const seed = 11;
  const plain = compose({ seed, genre: "dungeonsynth" });
  const e1 = reroll(plain, { roles: ["lead"] });
  const one = compose({ seed, genre: "dungeonsynth", edits: e1 });
  const e2 = reroll(one, { roles: ["drums"], from: 0, to: 16 });
  const two = compose({ seed, genre: "dungeonsynth", edits: [...e1, ...e2] });
  assert.notEqual(dump(one), dump(plain));
  assert.notEqual(dump(two), dump(one));
  // back one: the same list without its last entry is the earlier record, byte for byte
  assert.equal(dump(compose({ seed, genre: "dungeonsynth", edits: e1 })), dump(one));
  // back to the start: an empty list is the seed's own record
  assert.equal(dump(compose({ seed, genre: "dungeonsynth", edits: [] })), dump(plain));
  // and rerolling the same thing again is a different record again, not the first reroll back
  const e3 = reroll(two, { roles: ["lead"] });
  assert.ok(e3.every((e) => !isPin(e) && e.salt === 2), "a second reroll of the same address salts it a second time");
  const three = compose({ seed, genre: "dungeonsynth", edits: [...e1, ...e2, ...e3] });
  assert.notEqual(dump(three), dump(two));
  assert.ok(!same(notesOf(three, "lead"), notesOf(plain, "lead")), "the second reroll of the tune gave the original back");
});

test("every part can be rerolled in every material, and the record still builds", () => {
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 6; seed++) {
      const song = compose({ seed, genre });
      const edits = reroll(song, { roles: ROLES });
      const rolled = compose({ seed, genre, edits });
      assert.equal(rolled.form.bars, song.form.bars);
      assert.ok(rolled.performance.events.length > 0);
      for (const r of ROLES) assert.ok(rolled.performance.events.some((e) => e.role === r), `${genre} ${seed}: no ${r} after rerolling everyone`);
    }
  }
});

test("edits and selections read back from the words the command line uses", () => {
  assert.deepEqual(parseEdit("material/A/0/lead=2"), { at: "material/A/0/lead", salt: 2 });
  assert.deepEqual(parseEdit("material/B/1/drums"), { at: "material/B/1/drums", salt: 1 });
  assert.deepEqual(parseEdit("chart/tempo:=92"), { at: "chart/tempo", value: 92 });
  assert.deepEqual(parseEdit("form/section/2/split:=true"), { at: "form/section/2/split", value: true });
  assert.deepEqual(parseEdit("chart/scale:=dorian"), { at: "chart/scale", value: "dorian" });
  assert.equal(formatEdit({ at: "x/y", salt: 3 }), "x/y=3");
  assert.equal(formatEdit({ at: "chart/key", value: 4 }), "chart/key:=4");
  for (const s of ["material/A/0/lead=2", "chart/tempo:=92", "form/section/2/split:=true", "chart/scale:=dorian"]) assert.equal(formatEdit(parseEdit(s)), s);
  assert.throws(() => parseEdit("/x=1"), /not an edit/);
  assert.throws(() => parseEdit("x=one"), /not an edit/);
  const song = compose({ seed: 2, genre: "lofi" });
  assert.deepEqual(rerollWord(song, "keys,bass:16-32"), reroll(song, { roles: ["keys", "bass"], from: 16, to: 32 }));
  assert.deepEqual(rerollWord(song, "chords"), rerollAspect(song, "chords"));
  assert.deepEqual(rerollWord(song, "tempo"), [{ at: "chart/tempo", salt: 1 }]);
  assert.throws(() => rerollWord(song, "horns"), /no part "horns"/);
  assert.throws(() => rerollWord(song, "lead:32-16"), /bad bar range/);
  assert.throws(() => rerollWord(song, "lead:0-8:twice"), /unknown flag/);
  assert.deepEqual(setWord(song, "tempo=80"), setTempo(song, 80));
  assert.deepEqual(setWord(song, "key=D"), setKey(song, "D"));
  assert.throws(() => setWord(song, "swing=1"), /nothing to set/);
});

test("the tempo, the key and the mode can be said instead of drawn, and only inside the genre's own pool", () => {
  for (const genre of GENRE_NAMES) {
    const song = compose({ seed: 5, genre });
    const [lo, hi] = song.chart.genre.tempo;
    const bpm = Math.round((lo + hi) / 2) + 1;
    const set = compose({ seed: 5, genre, edits: [setTempo(song, bpm), setKey(song, "F#"), setMode(song, song.chart.genre.scales[0]![0])] });
    assert.equal(set.chart.tempo, bpm);
    assert.equal(NOTE_NAMES[pc(set.chart.tonicPc)], "F#");
    assert.equal(set.chart.scaleName, song.chart.genre.scales[0]![0]);
    // the tempo is held inside the range the form is checked against
    assert.equal(compose({ seed: 5, genre, edits: [setTempo(song, 999)] }).chart.tempo, hi);
    assert.equal(compose({ seed: 5, genre, edits: [setTempo(song, 1)] }).chart.tempo, lo);
    // a mode the genre does not offer is refused by name
    assert.throws(() => setMode(song, "whole-tone"), /no mode "whole-tone"/);
    assert.throws(() => setKey(song, "H"), /no note "H"/);
    // and the arrangement is the same record: the same sections, the same roster
    assert.deepEqual(set.form.sections.map((s) => [s.fn, s.bars]), song.form.sections.map((s) => [s.fn, s.bars]));
    // and every description is in words
    for (const e of set.chart.edits) assert.match(describeEdit(set, e), /^(tempo|key|mode) set to /);
  }
});

test("rerolling the chords of one idea moves that idea's chords and no other's", () => {
  let moved = 0;
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 10; seed++) {
      const song = compose({ seed, genre });
      const ideas = [...new Set(song.form.sections.map((s) => s.idea))];
      if (ideas.length < 2) continue;
      const p = song.arrangement.placed.find((q) => q.section.idea === ideas[1])!;
      const edits = rerollAspect(song, "chords", { from: p.section.startBar, to: p.section.endBar });
      assert.deepEqual(edits, [{ at: `harmony/${ideas[1]}`, salt: 1 }]);
      const rolled = compose({ seed, genre, edits });
      // THE CHORDS REACH THE FORM: the loop's period comes from them, the
      // phrase floor is counted in turns of the loop, and a section that no
      // longer gives its phrase three turns is not drawn — so the record may
      // come back with different sections, and an idea may no longer be in
      // it. That is the pipeline being honest, and this asks only what must
      // hold: the other idea's chords, wherever it is still heard, are the
      // same chords.
      const names = (s: typeof song, idea: string): string | null => {
        const m = [...s.materials.all.values()].find((x) => x.idea === idea);
        return m === undefined ? null : m.chords.map((c) => c.name).join(" ");
      };
      const other = names(rolled, ideas[0]!);
      if (other !== null) assert.equal(other, names(song, ideas[0]!), `${genre} ${seed}: the chords of ${ideas[0]} moved`);
      const mine = names(rolled, ideas[1]!);
      if (mine !== null && mine !== names(song, ideas[1]!)) moved++;
      assert.match(describeEdit(rolled, edits[0]!), /^chords · /);
    }
  }
  assert.ok(moved >= 6, `the chords moved in only ${moved} records — a pool with one entry is not a reroll's fault, but this many is`);
  // and the key, mode, tempo and form reroll from their own addresses
  const song = compose({ seed: 9, genre: "dungeonsynth" });
  assert.deepEqual(rerollAspect(song, "key"), [{ at: "chart/key", salt: 1 }]);
  assert.deepEqual(rerollAspect(song, "mode"), [{ at: "chart/scale", salt: 1 }]);
  assert.deepEqual(rerollAspect(song, "form"), [{ at: "form", salt: 1 }]);
  const reformed = compose({ seed: 9, genre: "dungeonsynth", edits: rerollAspect(song, "form") });
  assert.equal(reformed.chart.tempo, song.chart.tempo, "rerolling the form moved the tempo");
});

test("a section can be split off: it and what follows get their own material, and only-here rerolls land on it", () => {
  let judged = 0;
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 12; seed++) {
      const song = compose({ seed, genre });
      // a section that shares its material with an EARLIER one, and hears the tune
      const p = song.arrangement.placed.find((q, i) => q.heard.has("lead") && song.arrangement.placed.slice(0, i).some((r) => r.material === q.material && r.heard.has("lead")));
      if (p === undefined) continue;
      judged++;
      const earlier = song.arrangement.placed.find((r) => r.material === p.material)!;
      const cut = compose({ seed, genre, edits: [split(song, p.section.index)] });
      const cp = cut.arrangement.placed[p.section.index]!;
      assert.ok(cp.section.split && cp.section.vary, `${genre} ${seed}: the split section is not a variant`);
      assert.notEqual(cp.material, cut.arrangement.placed[earlier.section.index]!.material, `${genre} ${seed}: the split section still plays the earlier one's material`);
      assert.equal(cut.arrangement.placed[earlier.section.index]!.material, earlier.material, `${genre} ${seed}: the earlier section's material changed`);
      assert.equal(cut.form.bars, song.form.bars);
      assert.match(describeEdit(cut, cut.chart.edits[0]!), /split off/);
      // ONLY HERE: reroll the tune in that section alone
      const edits = reroll(song, { roles: ["lead"], from: p.section.startBar, to: p.section.endBar, only: true });
      assert.ok(edits.some((e) => "value" in e), "no split was made");
      const rolled = compose({ seed, genre, edits });
      const before = notesOf(song, "lead", earlier.section.startBar, earlier.section.endBar);
      const after = notesOf(rolled, "lead", earlier.section.startBar, earlier.section.endBar);
      assert.ok(same(before, after), `${genre} ${seed}: the earlier section's tune moved under an only-here reroll`);
      assert.ok(!same(notesOf(song, "lead", p.section.startBar, p.section.endBar), notesOf(rolled, "lead", p.section.startBar, p.section.endBar)), `${genre} ${seed}: the split section's tune did not move`);
      // the earlier section is untouched in every part; the split one is a
      // new material, and its keys are that material's own
      for (const role of ["keys", "drums", "bass"] as const) {
        assert.ok(same(notesOf(song, role, earlier.section.startBar, earlier.section.endBar), notesOf(rolled, role, earlier.section.startBar, earlier.section.endBar)), `${genre} ${seed}: the earlier section's ${role} moved`);
      }
    }
  }
  assert.ok(judged >= 8, `only ${judged} records had a shared material to split`);
  const song = compose({ seed: 1, genre: "lofi" });
  assert.throws(() => split(song, 99), /no section 99/);
});

test("below a material: a partial range reaches the tune's phrases and the drums' cycles, and the rest of the material stays", () => {
  let leadJudged = 0, drumJudged = 0;
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 12; seed++) {
      const song = compose({ seed, genre });
      const bars = song.materials.bars;
      // a section at least two materials long that hears the tune and the drums
      const p = song.arrangement.placed.find((q) => q.section.bars >= 2 * bars && q.heard.has("lead") && q.heard.has("drums") && q.heard.has("keys"));
      if (p === undefined) continue;
      const from = p.section.startBar, to = p.section.startBar + Math.max(1, Math.floor(bars / 2));
      const lead = reroll(song, { roles: ["lead"], from, to });
      assert.ok(lead.every((e) => /\/lead\/(phrase\/\d+|answer)$/.test(e.at)), `phrase-level addresses expected: ${lead.map(formatEdit)}`);
      const rolledLead = compose({ seed, genre, edits: lead });
      if (!same(notesOf(song, "lead", from, to), notesOf(rolledLead, "lead", from, to))) leadJudged++;
      assert.ok(same(notesOf(song, "keys"), notesOf(rolledLead, "keys")), `${genre} ${seed}: the keys moved under a phrase reroll`);
      assert.ok(same(notesOf(song, "drums"), notesOf(rolledLead, "drums")), `${genre} ${seed}: the drums moved under a phrase reroll`);
      for (const e of lead) assert.match(describeEdit(song, e), /^lead · .* · (phrase \d+ and the tune after it|the development) · bars/);
      const drums = reroll(song, { roles: ["drums"], from, to });
      assert.ok(drums.every((e) => /\/drums\/cycle\/\d+$/.test(e.at)), `cycle-level addresses expected: ${drums.map(formatEdit)}`);
      const rolledDrums = compose({ seed, genre, edits: drums });
      if (!same(notesOf(song, "drums", from, to), notesOf(rolledDrums, "drums", from, to))) drumJudged++;
      assert.ok(same(notesOf(song, "lead"), notesOf(rolledDrums, "lead")), `${genre} ${seed}: the tune moved under a cycle reroll`);
      assert.ok(same(notesOf(song, "keys"), notesOf(rolledDrums, "keys")), `${genre} ${seed}: the keys moved under a cycle reroll`);
      for (const e of drums) assert.match(describeEdit(song, e), /^drums · .* · beat \d+ of \d+ · bars/);
      // and a part with no draw of its own per bar is the whole material, said so
      const keys = reroll(song, { roles: ["keys"], from, to });
      assert.deepEqual(keys.map((e) => e.at), [`material/${p.material.includes("/") ? p.material : `${p.material}/0`}/keys`]);
    }
  }
  assert.ok(leadJudged >= 6, `a phrase reroll moved the tune in the range in only ${leadJudged} records`);
  assert.ok(drumJudged >= 6, `a cycle reroll moved the drums in the range in only ${drumJudged} records`);
});
