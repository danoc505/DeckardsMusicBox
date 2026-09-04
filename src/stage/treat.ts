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

import { DRUM_LANES, PEDAL_ORDER, ROLES, SENDS, TREATMENTS, type PatchSpec, type PedalsRules, type PedalsSpec, type Role, type Send, type SoundRules, type SoundSpec, type Treatment } from "../genre/spec.ts";

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/**
 * Every part's send to every return, scaled — the parts that already feed a
 * return feed it more, and a part that feeds nothing still feeds nothing.
 */
function sends(S: SoundRules, by: number, only?: Role): NonNullable<SoundSpec["mix"]> {
  const mix: Record<string, { sends: Record<string, number> }> = {};
  for (const role of only === undefined ? ROLES : [only]) {
    const ch = S.mix[role];
    const out: Record<string, number> = {};
    for (const sd of SENDS) out[sd] = clamp(ch.sends[sd] * by, 0, 1);
    mix[role] = { sends: out };
  }
  return mix as NonNullable<SoundSpec["mix"]>;
}

/** One number per part, scaled and clamped: level, pedals, dist and the rest. */
function perPart(S: SoundRules, key: "pedals" | "dist" | "sweepDepth", by: number, lo: number, hi: number, only?: Role): NonNullable<SoundSpec["mix"]> {
  const mix: Record<string, Record<string, number>> = {};
  for (const role of only === undefined ? ROLES : [only]) mix[role] = { [key]: clamp(S.mix[role][key] * by, lo, hi) };
  return mix as NonNullable<SoundSpec["mix"]>;
}

/**
 * THE TREATMENTS THAT ARE ABOUT ONE PART, and are written here as such.
 *
 * The catalogue says these are per-part and always did — "**Distance**: a part
 * steps closer, or further off" (§7, move 37), "**Sends** — five returns, per
 * part" (§8, 41), "**Pedal feed** — a part walks more or less of the board"
 * (§8, 43). This file applied all of them to the whole band, which is a move
 * the catalogue does not list: the band stepping back together is not the
 * flute stepping back.
 *
 * Only a treatment whose whole spec is per-part is in here. `close` moves the
 * world's width as well as every part's distance, and `darken`, `wear`,
 * `echoed`, `brighten` and `widen` are the rack and the room — a rack is not
 * something one part has, so those stay what they are.
 */
export const PER_PART: readonly Treatment[] = ["drench", "dry", "push", "ease", "far", "sweep", "orbit"];

/**
 * THE MOVES THAT ARE THE DRUM MACHINE, and are worth nothing where the drums
 * are not sounding.
 *
 * `deskOf` refuses a treatment that would not change the DESK, which is the
 * right question for the rack and the wrong one here: swapping a kit changes
 * the machine whether or not anybody is playing it, so it passes that test and
 * is still inaudible. A boundary spent on a move nobody can hear is the exact
 * failure this file's own header names — the ear hears the section repeat at
 * the moment it was promised a change — so the arrangement asks this before
 * offering one.
 */
export const NEEDS_DRUMS: readonly Treatment[] = ["rekit", "recircuit", "slacken", "spotlight", "soak"];
export const needsDrums = (t: Treatment): boolean => NEEDS_DRUMS.includes(t);
export const isPerPart = (t: Treatment): boolean => PER_PART.includes(t);

/** Every part reflected across the centre line, or just the one named. */
function azOf(S: SoundRules, only?: Role): NonNullable<SoundSpec["mix"]> {
  const mix: Record<string, { az: number }> = {};
  for (const role of only === undefined ? ROLES : [only]) mix[role] = { az: clamp(-S.mix[role].az, -180, 180) };
  return mix as NonNullable<SoundSpec["mix"]>;
}

/** The pedals this genre actually carries, in cable order. A pedal at mix 0 is
 * OFF the board rather than bypassed on it, so this is the board that exists. */
const carried = (S: SoundRules): readonly (keyof PedalsRules)[] =>
  PEDAL_ORDER.filter((n) => (S.pedals[n as keyof PedalsRules] as { mix: number }).mix > 0) as readonly (keyof PedalsRules)[];

/** The returns some part actually feeds, busiest first. A return nothing feeds
 * is not a return this record has. */
function fed(S: SoundRules): readonly Send[] {
  const total = new Map<Send, number>();
  for (const sd of SENDS) {
    let sum = 0;
    for (const role of ROLES) sum += S.mix[role].sends[sd];
    if (sum > 0) total.set(sd, sum);
  }
  return [...total].sort((a, b) => b[1] - a[1] || SENDS.indexOf(a[0]) - SENDS.indexOf(b[0])).map(([sd]) => sd);
}

/**
 * What one treatment does to this genre's desk, or null if it would do
 * nothing to it.
 *
 * Every branch reads the base and writes absolute numbers, so this is a
 * function and not a mutation, and calling it twice on the same desk gives the
 * same desk both times.
 */
export function deskOf(name: Treatment, S: SoundRules, only?: Role): SoundSpec | null {
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
        mix: sends(S, 1.4, only),
      };
      break;
    case "dry":
      spec = {
        rack: {
          room: { ret: clamp(S.rack.room.ret * 0.45, 0, 2) },
          spring: { ret: clamp(S.rack.spring.ret * 0.45, 0, 2) },
        },
        mix: sends(S, 0.5, only),
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
      spec = { mix: perPart(S, "pedals", 1.5, 0, 1, only) };
      break;
    case "ease":
      spec = { mix: perPart(S, "pedals", 0.45, 0, 1, only) };
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
      spec = { mix: perPart(S, "dist", 1.45, 0, 1, only) };
      break;
    case "sweep":
      spec = { mix: perPart(S, "sweepDepth", 3, 0, 1, only) };
      break;

    // ── the record itself ──
    // ── the room, one part at a time ──
    case "orbit":
      // "the flute CROSSES the room" (§7, move 36). Reflected rather than
      // nudged: a part at 30° to the right is heard at 30° to the left, which
      // is the same distance and the same height and unmistakably a move. A
      // part dead centre has nowhere to cross to and `changes` refuses it,
      // which is why this is offered per part rather than at the band.
      // Aimed at one part it crosses that part; aimed at the band it swaps
      // the stage over, which is the same move at the other scale. There is
      // no fallback part: a whole-desk orbit that quietly crossed the keys
      // and called itself the band would be a lie about what was heard.
      spec = { mix: azOf(S, only) };
      break;

    // ── the record heard through something older ──
    case "medium":
      // The gramophone horn or the small radio, which every genre here carries
      // at mix 0 — built, wired, and never once turned up. A section arriving
      // down a horn is the most drastic thing on this list and the source for
      // it is the machine's own presence in the rack.
      spec = { rack: { medium: { mix: clamp(Math.max(S.rack.medium.mix * 1.8, 0.45), 0, 1) } } };
      break;

    // ── the modulation deepens ──
    case "waver":
      // Tremolo, phaser and the ensemble together: the three things on this
      // desk that move a pitch or a level slowly. Each is scaled from what the
      // genre set, so a genre that runs none of them is refused rather than
      // handed a wobble it never asked for.
      spec = {
        pedals: {
          tremolo: { depth: clamp(S.pedals.tremolo.depth * 1.7, 0, 1) },
          phaser: { depth: clamp(S.pedals.phaser.depth * 1.7, 0, 1) },
        },
        rack: { ensemble: { depth: clamp(S.rack.ensemble.depth * 1.6, 0, 1) } },
      };
      break;

    // ── a different box on the board ──
    case "stomp": {
      // §8, move 44 is "a different stompbox lit for this section". Lit from
      // COLD is the one thing it cannot mean here: a pedal at mix 0 is off the
      // board and not bypassed on it, and `push` above already refuses to put
      // a part through an amp its genre kept it out of — "a treatment does not
      // overrule a genre". So the swap happens inside the board the genre
      // actually carries: the first box in cable order backs off and the last
      // comes up. A genre with fewer than two boxes has no swap to make.
      const board = carried(S);
      if (board.length < 2) return null;
      const first = board[0]!, last = board[board.length - 1]!;
      const mixOf = (n: keyof PedalsRules): number => (S.pedals[n] as { mix: number }).mix;
      spec = {
        pedals: {
          [first]: { mix: clamp(mixOf(first) * 0.35, 0, 1) },
          [last]: { mix: clamp(Math.min(1, mixOf(last) * 1.8), 0, 1) },
        } as PedalsSpec,
      };
      break;
    }

    // ── a return into another return ──
    case "repatch": {
      // §8, move 45: the pin matrix, twenty-five crossings and every one of
      // them static. The busiest return this record actually feeds goes into
      // the next busiest — the echo into the spring, the spring into the room
      // — which is a tail growing a tail. Absolute, so it cannot compound:
      // which two they are is a fact about the genre's own sends.
      const live = fed(S);
      if (live.length < 2) return null;
      spec = { patch: { [live[0]!]: { [live[1]!]: 0.35 } } as PatchSpec };
      break;
    }

    // ── the machine: a different drum, or the same drum handled differently ──
    case "rekit":
      // §9, move 52. Two kits: this program's own drums played by the strip as
      // a sampler plays a recording, and the 808/909 circuits. Not two ends of
      // a dial — two instruments, so this is the most drastic thing the kit
      // can do and it is the genre's business whether it does it at all.
      spec = { machine: { kit: S.machine.kit === "acoustic" ? "analog" : "acoustic" } };
      break;
    case "recircuit":
      // §9, move 53. Within the analogue kit, the other box. On the acoustic
      // kit the circuit is not what is sounding, so `changes` still sees a
      // difference and this would be a move nobody hears — which is why the
      // acoustic kit refuses it here rather than relying on that.
      if (S.machine.kit !== "analog") return null;
      spec = { machine: { circuit: S.machine.circuit === "808" ? "909" : "808" } };
      break;
    case "slacken":
      // §9, move 54: the strips' tune and decay, which are OFFSETS on top of
      // whatever the circuit decided. Down a little and longer — a kit tuned
      // down and left to ring, which is the same gesture as `darken` made on
      // the drums instead of on the sum.
      spec = {
        machine: {
          channels: Object.fromEntries(DRUM_LANES.map((lane) => [lane, {
            tune: clamp(S.machine.channels[lane].tune - 2, -12, 12),
            decay: clamp(S.machine.channels[lane].decay * 1.35, 0.2, 4),
          }])) as NonNullable<NonNullable<SoundSpec["machine"]>["channels"]>,
        },
      };
      break;
    case "spotlight":
      // §9, move 55: one lane up and the rest down, so the kit leans on its
      // backbeat. The snare, because that is the lane an ear counts a bar by.
      spec = {
        machine: {
          channels: Object.fromEntries(DRUM_LANES.map((lane) => [lane, {
            level: clamp(S.machine.channels[lane].level * (lane === "snare" ? 1.5 : 0.7), 0, 2),
          }])) as NonNullable<NonNullable<SoundSpec["machine"]>["channels"]>,
        },
      };
      break;
    case "soak": {
      // §9, move 56: one drum into a return the rest of the kit does not feed
      // — the snare in the room while the kick stays dry, which is a studio
      // trick old enough to be a convention. The return is the busiest one
      // this record actually uses, so a genre with no returns is refused.
      const live = fed(S);
      if (live.length === 0) return null;
      const sd = live[0]!;
      spec = {
        machine: {
          channels: { snare: { sends: { [sd]: clamp(Math.max(S.machine.channels.snare.sends[sd] * 2, 0.5), 0, 1) } } },
        } as NonNullable<SoundSpec["machine"]>,
      };
      break;
    }

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
