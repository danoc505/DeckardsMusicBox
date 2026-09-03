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
 */

import { ROLES, SENDS, TREATMENTS, type SoundRules, type SoundSpec, type Treatment } from "../genre/spec.ts";

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
 * What one treatment does to this genre's desk, or null if it would do
 * nothing to it.
 *
 * Every branch reads the base and writes absolute numbers, so this is a
 * function and not a mutation, and calling it twice on the same desk gives the
 * same desk both times.
 */
export function deskOf(name: Treatment, S: SoundRules): SoundSpec | null {
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
  return changes(spec, S) ? spec : null;
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
