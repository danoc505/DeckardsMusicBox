/**
 * THE TREATMENTS — every change to a section that leaves the notes alone.
 *
 * The rule of three says the third hearing must differ. It does not say the
 * third hearing must be different music: "the change may be delivered at a
 * different level than the repetition that demanded it. A third chorus does
 * not need new chorus NOTES — it can be answered by an arrangement change"
 * (`docs/FORM-RESEARCH.md`, Part 2, on the `main` branch).
 *
 * Until this file, this program could answer the rule exactly one way —
 * `material/vary.ts`, whose five operations all remove notes or move pitches.
 * So satisfying the rule always SPENT material, and the measurement said what
 * that cost: a third of every variant built was heard once and never again.
 * A record cannot state an idea often enough to be remembered if every third
 * statement has to be a different idea.
 *
 * These are the other way. Each one is a documented arrangement move, each
 * leaves every pitch and every onset exactly where the material stage put
 * them, and each is built out of machinery this program already had and never
 * moved: the desk is one frozen object for the length of a record, and
 * `src/sound/render.ts` did not contain the word "section".
 *
 * The genre's own literature asks for precisely this. Dungeon synth's
 * development section is where you "deepen the shadows of the sound through
 * changes in reverb and filters" (note.com/soundwitches) — a desk move, and
 * the one move this program could not make.
 *
 * THREE RULES HOLD FOR EVERY TREATMENT HERE.
 *
 *   IT IS A PURE FUNCTION OF THE GENRE'S OWN DESK, and absolute rather than
 *   relative. Span seventeen's desk depends on the base and its treatment and
 *   on nothing that happened before it, so treatments cannot compound, drift,
 *   or depend on the order they were applied in. Run the record from the
 *   middle and it sounds the same as running it from the top.
 *
 *   IT IS BOUNDED BY THE KNOB'S OWN RANGE. `settle` is a merge and not a
 *   validator — nothing downstream re-checks a value laid over the genre — so
 *   a treatment that could put a cutoff at 8 Hz or a return at 4 would be a
 *   fault no test upstream can catch. Every leaf below goes through `clamp`.
 *
 *   IT IS NOT OFFERED WHERE IT WOULD DO NOTHING. `deskOf` returns null when a
 *   treatment comes out identical to the desk it started from — a genre with
 *   no reverb cannot be drenched, and a board nothing walks cannot be pushed.
 *   A knob that does nothing is this program's cardinal sin, and a MOVE that
 *   does nothing is the same sin with a longer name: the arrangement would
 *   spend its two-loop change on it and the ear would hear the section repeat
 *   unaltered.
 *
 * AND THAT LAST RULE WAS ASKING THE WRONG QUESTION, WHICH IS WHY THIS FILE
 * NOW HAS TWO TESTS AND NOT ONE. `changes` compares the treatment's numbers
 * against the genre's numbers, so it can only ever say whether the DESK moved.
 * Whether the RECORD moved is a different question, and the renderer answers
 * it: it builds only the units something feeds, and a knob wired to nothing is
 * a number in a struct. Dungeon synth sends no part to the echo, so `echoed`
 * moved two numbers, passed `changes`, was offered, was weighted by the genre,
 * was chosen by the arrangement — and rendered BIT-IDENTICAL, measured at
 * −225 dB against the untreated record. Every span it won was a span the ear
 * was promised a change and heard the section repeat unaltered.
 *
 * So a move must now clear both: its numbers must move, AND the path it moves
 * them on must be one this genre can hear. `sound/reach.ts` holds the second
 * question, because only the renderer knew the answer and it knew it in a
 * private method.
 */

import { ROLES, SENDS, TREATMENTS, type SoundRules, type SoundSpec, type Treatment } from "../genre/spec.ts";
import { boardWalked, depthHeard, liveSends, poleHeard } from "../sound/reach.ts";

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/**
 * Every part's send to every return, scaled — the parts that already feed a
 * return feed it more, and a part that feeds nothing still feeds nothing.
 */
function sends(S: SoundRules, by: number): NonNullable<SoundSpec["mix"]> {
  const mix: Record<string, { sends: Record<string, number> }> = {};
  for (const role of ROLES) {
    const ch = S.mix[role];
    const out: Record<string, number> = {};
    for (const sd of SENDS) out[sd] = clamp(ch.sends[sd] * by, 0, 1);
    mix[role] = { sends: out };
  }
  return mix as NonNullable<SoundSpec["mix"]>;
}

/** One number per part, scaled and clamped: level, pedals, dist and the rest. */
function perPart(S: SoundRules, key: "pedals" | "dist" | "sweepDepth", by: number, lo: number, hi: number): NonNullable<SoundSpec["mix"]> {
  const mix: Record<string, Record<string, number>> = {};
  for (const role of ROLES) mix[role] = { [key]: clamp(S.mix[role][key] * by, lo, hi) };
  return mix as NonNullable<SoundSpec["mix"]>;
}

/**
 * What one treatment does to this genre's desk, or null if this genre would
 * not hear it.
 *
 * Every branch reads the base and writes absolute numbers, so this is a
 * function and not a mutation, and calling it twice on the same desk gives the
 * same desk both times.
 */
export function deskOf(name: Treatment, S: SoundRules): SoundSpec | null {
  const spec = specOf(name, S);
  return changes(spec, S) && reaches(name, S) ? spec : null;
}

/**
 * The same, UNFILTERED: what the move would put on the desk whether or not
 * anything here can hear it.
 *
 * Nothing in the program renders this — the arrangement and the renderer both
 * go through `deskOf`. It exists so that a refusal can be MEASURED rather than
 * asserted: rendered through `deskOf`, a refused treatment comes back
 * bit-identical because it was refused, which proves nothing at all. Rendered
 * as a desk laid over the record (`render(song, { desk: specOf(t, S) })`) it
 * says what the genre would actually have got, and that is what says whether
 * the refusal was right. `tools/treatments.ts` and `treat.test.ts` use it and
 * nothing else should.
 */
export function specOf(name: Treatment, S: SoundRules): SoundSpec {
  let spec: SoundSpec;
  switch (name) {
    // ── the filter, which is the move this genre's own sources name ──
    case "darken":
      // "deepen the shadows of the sound through changes in reverb and
      // filters" (note.com/soundwitches). The pole comes down and, where the
      // genre left it off the sum entirely, it is switched in far enough to
      // be heard — a filter at mix 0 is not a darker section, it is no section.
      spec = {
        rack: {
          pole: { hz: clamp(S.rack.pole.hz * 0.45, 40, 20000), mix: clamp(Math.max(S.rack.pole.mix, 0.5), 0, 1) },
          tape: { lowpassHz: clamp(S.rack.tape.lowpassHz * 0.7, 1000, 20000) },
        },
      };
      break;
    case "brighten":
      spec = {
        rack: {
          pole: { hz: clamp(S.rack.pole.hz * 1.8, 40, 20000) },
          tape: { lowpassHz: clamp(S.rack.tape.lowpassHz * 1.35, 1000, 20000) },
        },
      };
      break;

    // ── the room ──
    case "drench":
      // the returns up and every part's send with them: a section further
      // inside the building, not a louder reverb on the same distance
      spec = {
        rack: {
          room: { ret: clamp(S.rack.room.ret * 1.5, 0, 2) },
          spring: { ret: clamp(S.rack.spring.ret * 1.5, 0, 2) },
        },
        mix: sends(S, 1.4),
      };
      break;
    case "dry":
      spec = {
        rack: {
          room: { ret: clamp(S.rack.room.ret * 0.45, 0, 2) },
          spring: { ret: clamp(S.rack.spring.ret * 0.45, 0, 2) },
        },
        mix: sends(S, 0.5),
      };
      break;
    case "echoed":
      // MORE echo than the genre runs, not merely SOME. Written as a floor it
      // did nothing to any genre whose echo already cleared the floor — dungeon
      // synth sits at ret 1 and feedback 0.35 and came out unchanged, so the
      // move was refused as a no-op and the name was a lie about what it did.
      // Scaled, with the floor kept only for a genre that patches no echo at all.
      spec = {
        rack: {
          echo: {
            ret: clamp(Math.max(S.rack.echo.ret * 1.6, 0.5), 0, 2),
            feedback: clamp(Math.max(S.rack.echo.feedback * 1.5, 0.35), 0, 0.9),
          },
        },
      };
      break;

    // ── the board ──
    case "push":
      // the same parts through more of the rig they already walk. A part at
      // pedals 0 stays at 0: the genre said that part is not coming out of an
      // amp, and a treatment does not overrule a genre.
      spec = { mix: perPart(S, "pedals", 1.5, 0, 1) };
      break;
    case "ease":
      spec = { mix: perPart(S, "pedals", 0.45, 0, 1) };
      break;

    // ── the world ──
    case "widen":
      spec = { world: { width: clamp(S.world.width * 1.35, 0, 1), depth: clamp(S.world.depth * 1.2, 0, 1) } };
      break;
    case "close":
      // the band steps forward: nearer, and narrower with it
      spec = {
        world: { width: clamp(S.world.width * 0.6, 0, 1) },
        mix: perPart(S, "dist", 0.55, 0, 1),
      };
      break;
    case "far":
      spec = { mix: perPart(S, "dist", 1.45, 0, 1) };
      break;
    case "sweep":
      spec = { mix: perPart(S, "sweepDepth", 3, 0, 1) };
      break;

    // ── the record itself ──
    case "wear":
      // the tape working harder and the dust rising: the medium ageing across
      // a section, which is a change to how the record was MADE rather than to
      // anything played on it
      spec = {
        rack: {
          tape: {
            drive: clamp(S.rack.tape.drive * 1.5, 1, 10),
            wowCents: clamp(Math.max(S.rack.tape.wowCents * 1.8, 4), 0, 100),
          },
          vinyl: { crackle: clamp(Math.max(S.rack.vinyl.crackle * 2, 0.05), 0, 1) },
        },
      };
      break;
  }
  return spec;
}

/**
 * Can this genre HEAR the path this move works on?
 *
 * One line per treatment, and each says which unit of the renderer the move
 * arrives through. A move whose path this genre never patches in is refused
 * however far its numbers travel.
 */
function reaches(name: Treatment, S: SoundRules): boolean {
  const live = liveSends(S);
  switch (name) {
    // the tape's lowpass is on the sum and always in circuit, so the filter
    // can always be closed — and `darken` switches the pole in itself where
    // the genre left it out, which is the move and not a side effect of it
    case "darken":
      return true;
    // BUT IT CANNOT BE OPENED THE SAME WAY. A genre at `pole.mix` 0 has said
    // its sum has no filter on it, and switching one in to turn it up is not
    // that genre getting brighter, it is a different desk. What is left of the
    // move on such a genre is the tape's lowpass going up, and that is not a
    // brighter section either: measured on lofi, whose voices have nothing
    // above the 10 kHz it already passes, 10000 → 13500 Hz moved the record by
    // −37.7 dB and its centre of gravity by 1.6% — 25 dB below the `darken`
    // beside it, and it held 18% of every treated span the genre had. Whether
    // that much is audible nobody has said; that it is the faintest thing lofi
    // could do with a boundary is measured.
    case "brighten":
      return poleHeard(S);
    // the returns: a genre that sends nothing to a room has no room to open
    case "drench":
    case "dry":
      return live.has("room") || live.has("spring");
    // and the echo is the one that was wrong. Dungeon synth patches none:
    // every part's send is 0 and no return feeds it through the matrix.
    case "echoed":
      return live.has("echo");
    // the board: a part has to be walking one, and there has to be a pedal lit
    // on it — `board()` builds a stage only for a pedal that is up
    case "push":
    case "ease":
      return boardWalked(S);
    // distance reaches the record only through the world's depth: in a world
    // with none, every part is equally near however far the desk puts it
    case "far":
      return depthHeard(S);
    // `close` is two moves and needs either: the band narrows, or it steps in
    case "close":
      return S.world.width > 0 || depthHeard(S);
    // width is read by the shadow, the pan and the back of the room, and the
    // sweep and the tape are read every sample: nothing to switch in, so
    // `changes` alone decides these
    case "widen":
    case "sweep":
    case "wear":
      return true;
  }
}

/**
 * Does this spec actually move anything on this desk?
 *
 * Walks the override against the base and looks for one leaf that differs.
 * `sweepDepth * 3` on a genre that left it at zero is still zero, `pedals *
 * 1.5` on a part that walks no board is still nothing, and a clamped value
 * already at its stop has not moved — all three come out of here as false and
 * the move is never offered.
 */
function changes(spec: unknown, base: unknown): boolean {
  if (spec === undefined) return false;
  if (typeof spec !== "object" || spec === null) return spec !== base;
  if (typeof base !== "object" || base === null) return true;
  for (const [k, v] of Object.entries(spec as Record<string, unknown>)) {
    if (changes(v, (base as Record<string, unknown>)[k])) return true;
  }
  return false;
}

/** Which treatments would do something to this desk, in a stable order. */
export const offeredBy = (S: SoundRules): readonly Treatment[] =>
  TREATMENTS.filter((t) => deskOf(t, S) !== null);
