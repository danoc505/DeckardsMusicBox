import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "./song.ts";
import { dump } from "./dump.ts";
import { isPin } from "./core/rng.ts";
import { candidates, describeEdit, deskOf, deskWords, formatEdit, parseEdit, reroll, rerollAspect, rerollWord, setChords, setFigure, setForm, setIntro, setJob, setKey, setMode, setPlays, setProtagonist, setRegister, setSwing, setTempo, setTreatment, setVoice, setWord, split } from "./edit.ts";
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

test("a part's voice is drawn from the genre's pool, can be said, and can be rerolled", () => {
  // lofi's counter is a Wurlitzer three records in four and a horn in the fourth
  let horns = 0;
  for (let seed = 1; seed <= 80; seed++) if (compose({ seed, genre: "lofi" }).chart.sound.voices.counter === "horns") horns++;
  assert.ok(horns >= 10 && horns <= 30, `the horn was drawn for the counter in ${horns} of 80 records`);
  const song = compose({ seed: 1, genre: "lofi" });
  for (const r of ["keys", "bass", "lead", "drone"] as const) assert.equal(song.chart.sound.voices[r], song.chart.genre.sound.voices[r][0]![0], `${r} is not the one voice its pool names`);
  // said
  const on = compose({ seed: 1, genre: "lofi", edits: [setVoice(song, "counter", "horns")] });
  assert.equal(on.chart.sound.voices.counter, "horns");
  assert.equal(dump(on).match(/^#voice\tcounter\t(.*)$/m)![1], "horns");
  assert.match(describeEdit(on, on.chart.edits[0]!), /^counter played on the horns$/);
  assert.deepEqual(setWord(song, "voice.counter=wurly"), [setVoice(song, "counter", "wurly")]);
  assert.throws(() => setVoice(song, "counter", "flute"), /no voice "flute" for the counter/);
  assert.throws(() => setVoice(song, "drums", "flute"), /no pitched part "drums"/);
  // and the notes are the notes: a voice is how a part is played, not what
  for (const r of ROLES) assert.ok(same(notesOf(song, r), notesOf(on, r)), `the ${r}'s notes moved when only the counter's voice was set`);
  // rerolled
  assert.deepEqual(rerollAspect(song, "voices"), [{ at: "chart/voice", salt: 1 }]);
  assert.match(describeEdit(song, { at: "chart/voice", salt: 1 }), /^voices rerolled$/);
});

test("several candidates for one selection are several different records, and keeping one is pressing it", () => {
  const song = compose({ seed: 8, genre: "lofi" });
  const p = song.arrangement.placed.find((q) => q.heard.has("lead"))!;
  const sel = { roles: ["lead" as const], from: p.section.startBar, to: p.section.endBar };
  const four = candidates(song, sel, 4);
  assert.equal(four.length, 4);
  const dumps = four.map((made) => dump(compose({ seed: 8, genre: "lofi", edits: made })));
  assert.equal(new Set(dumps).size, 4, "two candidates were the same record");
  for (const d of dumps) assert.notEqual(d, dump(song));
  // the first candidate is the plain reroll, and the next four are new ones
  assert.deepEqual(four[0], reroll(song, sel));
  const more = candidates(song, sel, 4, 4);
  for (const made of more) assert.ok(!dumps.includes(dump(compose({ seed: 8, genre: "lofi", edits: made }))), "trying again showed a candidate already shown");
  // keeping the third is the record the third was
  const kept = compose({ seed: 8, genre: "lofi", edits: four[2]! });
  assert.equal(dump(kept), dumps[2]);
  // and a reroll after keeping it is a different record again, not the first candidate back
  const next = compose({ seed: 8, genre: "lofi", edits: [...four[2]!, ...reroll(kept, sel)] });
  assert.ok(!dumps.includes(dump(next)));
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
  assert.deepEqual(setWord(song, "tempo=80"), [setTempo(song, 80)]);
  assert.deepEqual(setWord(song, "key=D"), [setKey(song, "D")]);
  assert.throws(() => setWord(song, "colour=1"), /nothing to set/);
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

test("a part can be said in or out of a section, the material follows, and the last part standing stays", () => {
  let asked = 0;
  for (const genre of GENRE_NAMES) {
    for (let seed = 1; seed <= 12; seed++) {
      const plain = compose({ seed, genre, seconds: 60 });
      const p = plain.arrangement.placed[1];
      if (p === undefined) continue;
      const bars = { from: p.section.startBar, to: p.section.startBar + 1 };
      const inSec = (song: ReturnType<typeof compose>, r: Role): number =>
        song.performance.events.filter((e) => e.role === r && e.bar >= p.section.startBar && e.bar < p.section.endBar).length;
      // OUT: a part heard there is heard no more there, and the others are still there
      const gone = p.heard.size > 1 ? [...p.heard][0] : undefined;
      if (gone !== undefined) {
        const out = setPlays(plain, gone, false, bars);
        assert.equal(out.length, 1, "one section, one pin");
        assert.equal(out[0]!.at, `arrange/section/${p.section.index}/${gone}/out`);
        const made = compose({ seed, genre, seconds: 60, edits: out });
        const q = made.arrangement.placed.find((x) => x.section.index === p.section.index)!;
        assert.ok(!q.heard.has(gone), `${genre} ${seed}: the ${gone} said out is still heard`);
        assert.equal(inSec(made, gone), 0, `${genre} ${seed}: the ${gone} said out still plays`);
        for (const r of p.heard) if (r !== gone) assert.ok(q.heard.has(r), `${genre} ${seed}: saying ${gone} out lost the ${r}`);
        assert.match(describeEdit(made, out[0]!), new RegExp(`^${gone} out · ${p.section.fn} at bar ${p.section.startBar}$`));
        asked++;
      }
      // IN: a part not heard there is written and plays there
      const missing = ROLES.find((r) => !p.heard.has(r));
      if (missing !== undefined) {
        const inn = setPlays(plain, missing, true, bars);
        const made = compose({ seed, genre, seconds: 60, edits: inn });
        const q = made.arrangement.placed.find((x) => x.section.index === p.section.index)!;
        assert.ok(q.heard.has(missing), `${genre} ${seed}: the ${missing} said in is not heard`);
        assert.ok(inSec(made, missing) > 0, `${genre} ${seed}: the ${missing} said in is heard and silent`);
        asked++;
      }
    }
  }
  assert.ok(asked >= 20, `only ${asked} rosters were said`);
  // the last part standing stays, and saying so is refused as a knob that does nothing
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  const p = song.arrangement.placed[0]!;
  const bars = { from: p.section.startBar, to: p.section.startBar + 1 };
  const everyone = [...p.heard].map((r) => setPlays(song, r, false, bars)).flat();
  const emptied = compose({ seed: 3, genre: "lofi", seconds: 60, edits: everyone });
  const q = emptied.arrangement.placed[0]!;
  assert.equal(q.heard.size, 1, "a section was emptied");
  assert.throws(() => setPlays(emptied, [...q.heard][0]!, false, bars), /last part standing/);
  assert.throws(() => setPlays(song, "harp", true), /no part/);
  // and the words
  assert.deepEqual(setWord(song, `play.${[...p.heard][0]}=out:0-1`), setPlays(song, [...p.heard][0]!, false, bars));
});

test("a seat's job can be said, only from its own pools and only where the room has a place for it", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  // the lofi keys may serve the pad or the rhythm; said the rhythm, arpeggiated, everywhere it is the protagonist or per material
  const edits = setJob(song, "keys", "rhythm", "arp");
  const made = compose({ seed: 3, genre: "lofi", seconds: 60, edits });
  for (const p of made.arrangement.placed) {
    assert.equal(p.elements.keys, "rhythm", `bar ${p.section.startBar}`);
    assert.equal(p.textures.keys, "arp", `bar ${p.section.startBar}`);
  }
  assert.match(describeEdit(made, edits[0]!), /^keys serves the rhythm/);
  // the drums and the tune have no job to say, a job outside the seat's pool is refused, and so is a texture the element forbids
  assert.throws(() => setJob(song, "lead", "rhythm", null), /tune/);
  assert.throws(() => setJob(song, "drums", "rhythm", null), /no pitched part/);
  assert.throws(() => setJob(song, "drone", "rhythm", null), /never serves/);
  assert.throws(() => setJob(song, "keys", null, "sustain"), /never plays/);
  assert.throws(() => setJob(song, "keys", "pad", "arp"), /cannot be/);
  assert.throws(() => setJob(song, "keys", null, null), /nothing to set/);
  // the word form, with a range
  const w = setWord(song, "job.keys=rhythm/arp:0-8");
  assert.ok(w.length >= 2 && w.every((e) => isPin(e)));
});

test("the drums' figure, the protagonist and the way in can be said from the genre's own pools", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  const fig = setFigure(song, "amen");
  const made = compose({ seed: 3, genre: "lofi", seconds: 60, edits: fig });
  for (const m of made.materials.all.values()) assert.ok(m.figure.cycle !== undefined && m.figure.cycle.length > 1, "the amen was not drawn");
  assert.match(describeEdit(made, fig[0]!), /^drums play the amen figure/);
  assert.throws(() => setFigure(song, "bossa"), /no figure/);
  assert.throws(() => setFigure(compose({ seed: 3, genre: "dungeonsynth" }), "amen"), /no figure "amen"/);
  // the protagonist: from the pool, honoured, and refused when it is already so
  const ds = compose({ seed: 17479, genre: "dungeonsynth", seconds: 60 });
  const star = setProtagonist(ds, "keys");
  const led = compose({ seed: 17479, genre: "dungeonsynth", seconds: 60, edits: [star] });
  assert.equal(led.arrangement.protagonist, "keys");
  assert.throws(() => setProtagonist(led, "keys"), /already/);
  assert.throws(() => setProtagonist(song, "drone"), /no protagonist/);
  // the way in: only a kind that can carry the protagonist
  assert.throws(() => setIntro(song, "hook"), /cannot introduce/);
  assert.throws(() => setIntro(song, "cold"), /no intro/);
  const withTune = compose({ seed: 3, genre: "lofi", seconds: 60, edits: [setProtagonist(song, "lead")] });
  if (withTune.arrangement.intro !== "hook") {
    const hook = setIntro(withTune, "hook");
    assert.equal(compose({ seed: 3, genre: "lofi", seconds: 60, edits: [...withTune.chart.edits, hook] }).arrangement.intro, "hook");
  }
  assert.deepEqual(setWord(ds, "protagonist=keys"), [star]);
});

test("the jobs, the desk moves and the whole arrangement reroll by name, and a desk word is a hand on the desk", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  assert.deepEqual(rerollAspect(song, "jobs"), [{ at: "element", salt: 1 }]);
  assert.deepEqual(rerollAspect(song, "arrangement"), [{ at: "arrange", salt: 1 }]);
  assert.deepEqual(rerollAspect(song, "desk"), [{ at: "arrange/treat", salt: 1 }]);
  const ranged = rerollAspect(song, "desk", { from: 16, to: 17 });
  assert.equal(ranged.length, 1);
  assert.match(ranged[0]!.at, /^arrange\/treat\/\d+$/);
  const jobs = rerollAspect(song, "jobs", { from: 0, to: 1 });
  assert.match(jobs[0]!.at, /^element\/[^/]+$/);
  // rerolling the desk moves changes no note
  const moved = compose({ seed: 3, genre: "lofi", seconds: 60, edits: rerollAspect(song, "desk") });
  assert.equal(moved.performance.events.length, song.performance.events.length);
  assert.ok(moved.performance.events.every((e, i) => e.pitch === song.performance.events[i]!.pitch && e.tSec === song.performance.events[i]!.tSec));
  // a desk word round-trips, later words win, and nonsense is refused
  const desk = deskOf(["desk.mix.keys.level=0.5", "desk.machine.kit=analog", "desk.mix.keys.level=0.8"]);
  assert.deepEqual(desk, { mix: { keys: { level: 0.8 } }, machine: { kit: "analog" } });
  assert.deepEqual(deskWords(desk), ["desk.machine.kit=analog", "desk.mix.keys.level=0.8"]);
  assert.throws(() => deskOf(["mix.keys.level"]), /not a desk word/);
});

test("the swing and a seat's register can be said inside the genre's allowances, and nothing draws them", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  assert.equal(song.chart.swing, song.chart.genre.feel.swing, "a record nobody touched swings at the genre's swing");
  const sw = setSwing(song, 66);
  const swung = compose({ seed: 3, genre: "lofi", seconds: 60, edits: [sw] });
  assert.equal(swung.chart.swing, 66);
  // the notes are where they were; only where they are PLAYED moved
  const written = (s: typeof song): string => s.performance.events.map((e) => `${e.role}/${e.bar}/${e.step}/${e.pitch}`).sort().join("|");
  assert.equal(written(swung), written(song));
  assert.notEqual(swung.performance.events.map((e) => e.playedStep).join(), song.performance.events.map((e) => e.playedStep).join());
  assert.deepEqual(setSwing(song, 99), { at: "chart/swing", value: song.chart.genre.feel.swingRange[1] }, "held inside the allowance");
  assert.throws(() => setSwing(song, song.chart.swing), /already/);
  // the keys may move an octave either way in lofi; the drone may not move
  const down = setRegister(song, "keys", -1);
  const low = compose({ seed: 3, genre: "lofi", seconds: 60, edits: [down] });
  assert.equal(low.chart.register.keys[0], song.chart.register.keys[0] - 12);
  assert.equal(low.chart.register.keys[1], song.chart.register.keys[1] - 12);
  const keysTop = (s: typeof song): number => Math.max(...s.performance.events.filter((e) => e.role === "keys").map((e) => e.pitch ?? 0));
  assert.ok(keysTop(low) < keysTop(song), "the keys did not go down");
  assert.throws(() => setRegister(song, "drone", 1), /may move 0\.\.0/);
  assert.throws(() => setRegister(song, "keys", 0), /already/);
  assert.throws(() => setRegister(song, "keys", 2), /may move/);
  assert.match(describeEdit(low, down), /^keys 1 octave down$/);
  assert.deepEqual(setWord(song, "register.keys=-1"), [down]);
  assert.deepEqual(setWord(song, "swing=66"), [sw]);
  // and untouched, the dump says the genre's numbers
  assert.match(dump(song), /^#swing\t60(\.0+)?$/m);
});

test("the chords an idea stands on can be said from the genre's pool, and refused where the scale forbids them", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  const pool = song.chart.genre.harmony.progressions.A.filter(([, w]) => w > 0).map(([p]) => p.join("-"));
  const now = [...song.materials.all.values()][0]!.chords.map((c) => c.degree);
  const other = pool.find((p) => p.split("-").length === 4 && p !== now.join("-"))!;
  const edit = setChords(song, "A", other);
  const made = compose({ seed: 3, genre: "lofi", seconds: 60, edits: [edit] });
  const got = [...made.materials.all.values()].find((m) => m.chords.length > 0)!.chords.map((c) => c.degree);
  assert.equal(got.join("-"), other, "the said progression was not drawn");
  assert.match(describeEdit(made, edit), /^A stands on /);
  assert.throws(() => setChords(song, "A", "9-9"), /never stands on/);
  assert.throws(() => setChords(song, "Q", "0-5"), /no idea/);
  // dungeon synth avoids the diminished degree, so a progression landing on it in this scale is refused as a knob that does nothing
  const ds = compose({ seed: 17479, genre: "dungeonsynth", seconds: 60 });
  let refused = 0, landed = 0;
  for (const [p] of ds.chart.genre.harmony.progressions.A) {
    try { setChords(ds, "A", p.join("-")); landed++; } catch (e) { if (/diminished|already/.test((e as Error).message)) refused++; else throw e; }
  }
  assert.ok(landed > 0, "no progression could be said at all");
  assert.equal(refused + landed, ds.chart.genre.harmony.progressions.A.length);
});

test("a section's kind or length can be said where the walk has room, the way in can be none, and the outro is not a step", () => {
  const song = compose({ seed: 3, genre: "lofi" });
  const s = song.form.sections;
  assert.ok(s.length >= 3, `a record of ${s.length} sections is too short to say a form on`);
  const mid = s.find((x) => x.index > 0 && x.fn !== "outro")!;
  const lens = song.chart.genre.form.lengths[mid.fn].filter(([, w]) => w > 0).map(([n]) => n).filter((n) => n !== mid.bars);
  if (lens.length > 0) {
    let said = false;
    for (const len of lens) {
      try {
        const edits = setForm(song, mid.index, null, len);
        const made = compose({ seed: 3, genre: "lofi", edits });
        assert.equal(made.form.sections[mid.index]!.bars, len);
        assert.match(describeEdit(made, edits[0]!), new RegExp(`^section ${mid.index} is ${len} bars$`));
        said = true;
        break;
      } catch (e) { if (!/no room/.test((e as Error).message)) throw e; }
    }
    assert.ok(said, "no other length could be said for any section");
  }
  assert.throws(() => setForm(song, s.length - 1, null, 8), /outro/);
  assert.throws(() => setForm(song, 0, "chorus", null), /way in/);
  assert.throws(() => setForm(song, mid.index, "coda", null), /no section kind/);
  assert.throws(() => setForm(song, mid.index, null, 7), /never 7 bars/);
  assert.throws(() => setForm(song, mid.index, null, null), /nothing to set/);
  // no intro, or one
  const cold = s[0]!.fn !== "intro";
  const flip = setIntro(song, cold ? "some" : "none");
  const flipped = compose({ seed: 3, genre: "lofi", edits: [flip] });
  assert.equal(flipped.form.sections[0]!.fn === "intro", cold);
  assert.throws(() => setIntro(song, cold ? "none" : "some"), /already/);
  assert.deepEqual(setWord(song, cold ? "intro=some" : "intro=none"), [flip]);
});

test("a desk move can be said for a section and holds for its whole length, and the feel of a part rerolls without moving a note", () => {
  const song = compose({ seed: 3, genre: "lofi", seconds: 60 });
  const p = song.arrangement.placed[0]!;
  const bars = { from: p.section.startBar, to: p.section.startBar + 1 };
  const edits = setTreatment(song, "darken", bars);
  assert.equal(edits.length, 2);
  const made = compose({ seed: 3, genre: "lofi", seconds: 60, edits });
  const q = made.arrangement.placed[0]!;
  assert.ok(q.spans.length > 0 && q.spans.every((sp) => sp.treatment === "darken"), `the verse's spans are ${q.spans.map((sp) => sp.treatment).join(",")}`);
  assert.ok(made.performance.desk.some((d) => d.treatment === "darken"), "the desk timeline never darkens");
  assert.equal(describeEdit(made, edits[0]!), "", "the chance carries no words of its own");
  assert.match(describeEdit(made, edits[1]!), /^darken held over the verse at bar 0$/);
  assert.throws(() => setTreatment(song, "sparkle", bars), /no treatment/);
  assert.deepEqual(setWord(song, "treat=darken:0-1"), edits);
  // a record nobody touched is untouched by the draw existing at all
  const again = compose({ seed: 3, genre: "lofi", seconds: 60 });
  assert.equal(again.performance.desk.length, song.performance.desk.length);
  // the feel: the written notes stay, the played positions and weights move
  const feel = rerollWord(song, "feel:lead");
  assert.ok(feel.every((e) => !isPin(e) && /^perform\/[^/]+(\/\d+)?\/lead$/.test(e.at)), feel.map((e) => e.at).join());
  const felt = compose({ seed: 3, genre: "lofi", seconds: 60, edits: feel });
  const written = (s: typeof song, r: Role): string => s.performance.events.filter((e) => e.role === r).map((e) => `${e.bar}/${e.step}/${e.pitch}`).sort().join("|");
  assert.equal(written(felt, "lead"), written(song, "lead"), "the feel moved a written note");
  assert.equal(written(felt, "keys"), written(song, "keys"));
  const hand = (s: typeof song, r: Role): string => s.performance.events.filter((e) => e.role === r).map((e) => `${e.playedStep.toFixed(4)}/${e.gain.toFixed(4)}`).join("|");
  assert.notEqual(hand(felt, "lead"), hand(song, "lead"), "the tune's hand did not move");
  assert.equal(hand(felt, "keys"), hand(song, "keys"), "the keys' hand moved");
  assert.match(describeEdit(felt, feel[0]!), /the feel/);
});
