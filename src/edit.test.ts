import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "./song.ts";
import { dump } from "./dump.ts";
import { describeEdit, formatEdit, parseEdit, parseSelection, reroll } from "./edit.ts";
import { GENRE_NAMES } from "./genre/index.ts";
import { ROLES, type Role } from "./genre/spec.ts";

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
  assert.ok(e3.every((e) => e.salt === 2), "a second reroll of the same address salts it a second time");
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
  assert.equal(formatEdit({ at: "x/y", salt: 3 }), "x/y=3");
  assert.throws(() => parseEdit("/x=1"), /not an edit/);
  assert.throws(() => parseEdit("x=one"), /not an edit/);
  assert.deepEqual(parseSelection("lead"), { roles: ["lead"] });
  assert.deepEqual(parseSelection("keys,bass:16-32"), { roles: ["keys", "bass"], from: 16, to: 32 });
  assert.throws(() => parseSelection("horns"), /no part "horns"/);
  assert.throws(() => parseSelection("lead:32-16"), /bad bar range/);
});
