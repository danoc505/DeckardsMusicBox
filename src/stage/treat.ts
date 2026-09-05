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

import { DRUM_LANES, PEDAL_ORDER, PITCHED_ROLES, ROLES, SENDS, TREATMENTS, type PatchSpec, type PedalsRules, type PedalsSpec, type PitchedRole, type Role, type Send, type SoundRules, type SoundSpec, type Treatment, type VoiceName } from "../genre/spec.ts";
import { boardWalked, depthHeard, liveSends, poleHeard } from "../sound/reach.ts";
import { HOLDS } from "../sound/voices.ts";

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
export const PER_PART: readonly Treatment[] = ["drench", "dry", "push", "ease", "far", "sweep", "orbit", "revoice"];

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
 * What one treatment does to this genre's desk, or null if this genre would
 * not hear it.
 *
 * Every branch reads the base and writes absolute numbers, so this is a
 * function and not a mutation, and calling it twice on the same desk gives the
 * same desk both times.
 */
/**
 * WHICH PARTS A TREATMENT REACHES — `reaches` below asks whether a move is
 * heard on this desk at all, and this asks the same question one grain finer.
 *
 * "A whole-desk treatment is under everyone" is the obvious answer and it is
 * false for most of the catalogue: `soak` is the drum machine's reverb and the
 * bass never goes through it, the board is under the parts that walk it, and a
 * return is under the parts that feed it. Read off what the move WRITES, the
 * way `changes` reads it: a knob on a part's own channel is that part's; the
 * sum, the tape, the medium, the master and the world are everyone's; a
 * return's is whoever feeds it, and whoever feeds what feeds it through the
 * patch; the machine's is the drums; the board's is whoever walks it.
 */
export function reachesPart(name: Treatment, S: SoundRules, only?: Role): ReadonlySet<Role> {
  const spec = deskOf(name, S, only);
  const out = new Set<Role>();
  if (spec === null) return out;
  const all = (): void => { for (const r of ROLES) out.add(r); };
  if (spec.world !== undefined) all();
  if (spec.machine !== undefined) out.add("drums");
  if (spec.pedals !== undefined) for (const r of ROLES) if (S.mix[r].pedals > 0) out.add(r);
  if (spec.mix !== undefined) for (const r of Object.keys(spec.mix) as Role[]) out.add(r);
  if (spec.rack !== undefined) {
    for (const unit of Object.keys(spec.rack)) {
      if ((SENDS as readonly string[]).includes(unit)) {
        for (const r of ROLES) if (liveSends(S, [r]).has(unit as Send)) out.add(r);
      } else all();
    }
  }
  if (spec.patch !== undefined) {
    for (const from of Object.keys(spec.patch) as Send[]) for (const r of ROLES) if (liveSends(S, [r]).has(from)) out.add(r);
  }
  return out;
}

export function deskOf(name: Treatment, S: SoundRules, only?: Role): SoundSpec | null {
  const spec = specOf(name, S, only);
  return spec !== null && changes(spec, S) && reaches(name, S) ? spec : null;
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
export function specOf(name: Treatment, S: SoundRules, only?: Role): SoundSpec | null {
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
    case "linger":
      // §8, move 47: "a longer room for the peak". `drench` sends MORE to the
      // room; this makes the room BIGGER, which is a different move and the
      // only one in §7-§9 that nothing reached — the reverbs' `sec` was the
      // one leaf of the rack no treatment touched while `ret` had two.
      spec = {
        rack: {
          // the two reverbs have DIFFERENT ceilings — the room reaches 12
          // seconds and the spring 6 — and `settle` is a merge, not a
          // validator, so a clamp to the wrong one is a fault nothing
          // downstream catches. Each is clamped to its own.
          room: { sec: clamp(S.rack.room.sec * 1.9, 0.2, 12) },
          spring: { sec: clamp(S.rack.spring.sec * 1.6, 0.2, 6) },
        },
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

    // ── §1, moves 1 and 7: the line moves to another voice ──
    case "revoice": {
      // "the flute's phrase given to the organ" — the catalogue's own example,
      // and the reason the borrowed voice comes from THIS RECORD'S BAND rather
      // than from the six the program can synthesise. A genre states four
      // instruments and they are the four it means; handing the keys a voice
      // this music never uses is a different genre, not a different section.
      // So a part is lent the instrument of another part of the same record,
      // and the palette is unchanged.
      //
      // IT IS THE ONE ALTERATION THAT REACHES THE FOUNDATION. The repetition
      // law holds bass, keys and drone to the same notes, the same
      // articulation and the same instant within a section, and the shed order
      // never takes them out — so their only lever was a gain. This changes
      // WHO PLAYS THE LINE and not one note of it: `render.ts` reads
      // `S.voices[e.role]` per note, and the desk timeline already swaps that
      // map on the sample the arrangement chose.
      const lend = borrowed(S, only);
      if (lend === null) return null;
      spec = { voices: { [lend[0]]: lend[1] } };
      break;
    }

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
    // a band whose parts all play the same instrument has nothing to lend, and
    // `changes` catches the case where the borrowed voice is the one already
    // playing; both come out of `borrowed` as null or as no change
    case "revoice":
      return true;

    // ── the eleven that arrived with the rest of the catalogue ──
    // the reverbs' LENGTH, which is the same wiring question as their return:
    // a genre that sends nothing to a room has no room to make longer either
    case "linger":
      return live.has("room") || live.has("spring");
    // a part's angle reaches the record only through the world's width. `side`
    // feeds the delay, the shadow and the pan, and every one of the three is
    // multiplied by `width` — in a world of no width a part crossing the room
    // is heard in exactly the same place it started.
    case "orbit":
      return S.world.width > 0;
    // the horn is an insert built only at `mix > 0`, and this move turns it up
    // from cold the way `darken` switches the pole in: that IS the move
    case "medium":
      return true;
    // two paths, either of which is enough: the pedals' own wobble, which
    // needs a lit box and a part walking the board, or the ensemble return
    case "waver":
      return (
        ((S.pedals.tremolo.mix > 0 || S.pedals.phaser.mix > 0) && ROLES.some((r) => S.mix[r].pedals > 0)) ||
        live.has("ensemble")
      );
    // swapping which box is lit is still a board move, and an unwalked board
    // is not heard however the boxes on it are set
    case "stomp":
      return boardWalked(S);
    // a return into another return: `specOf` already refuses a record with
    // fewer than two returns fed, and the one it patches FROM is by
    // construction one this record feeds, so the tail it grows is heard
    case "repatch":
      return true;
    // the machine. Every one of these is read by the strip that plays the kit,
    // so at the genre's scale they always reach — the question that matters is
    // whether the drums are SOUNDING, which is a fact about one span and not
    // about the genre, and `NEEDS_DRUMS` above is where the arrangement asks it.
    case "rekit":
    case "recircuit":
    case "slacken":
    case "spotlight":
    case "soak":
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

/**
 * WHOSE INSTRUMENT A PART BORROWS, and from whom.
 *
 * A pure function of the genre's own `voices` map: the part is lent the voice
 * of the next pitched part, in `PITCHED_ROLES` order, that plays a different
 * instrument. Deterministic, so the same record is the same record; and null
 * where the genre gives every part the same voice, or where the move is aimed
 * at the drums, which have no `voices` entry at all — they are the machine.
 */
function borrowed(S: SoundRules, only?: Role): [PitchedRole, VoiceName] | null {
  const on = only === undefined ? PITCHED_ROLES[0]! : only;
  if (on === "drums") return null;
  const mine = S.voices[on];
  // AND ONLY A VOICE THAT CAN HOLD WHAT THIS PART HOLDS. `HOLDS` in
  // `voices.ts` says which voices settle and which are struck and gone: the
  // Rhodes sits at 0.08 of its peak and the pluck is a string decaying in a
  // delay line. A drone holds a whole statement, so lending it one of those
  // does not move the line to another voice, it deletes the line.
  const others = PITCHED_ROLES.filter((r) =>
    S.voices[r] !== mine && (!HOLDS[mine] || HOLDS[S.voices[r]] === true));
  if (others.length === 0) return null;
  // the next one round the band, so a five-part record does not always borrow
  // from the same neighbour
  const from = others[(PITCHED_ROLES.indexOf(on) + 1) % others.length]!;
  return [on, S.voices[from]];
}

/** Which treatments would do something to this desk, in a stable order. */
export const offeredBy = (S: SoundRules): readonly Treatment[] =>
  TREATMENTS.filter((t) => deskOf(t, S) !== null);
