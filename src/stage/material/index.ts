/**
 * Stage 4 — THE MATERIALS.
 *
 * Every note a record can contain, built once per IDEA and frozen. A section
 * points at a material; it never edits one.
 *
 * ONLY WHAT IS HEARD IS BUILT. The arrangement says which material each
 * section plays and which parts are heard in it, and this stage builds
 * exactly that: a plain A, a first variant of A, a plain B, and for each of
 * them as many lead lines and drum phrases as those parts will play. Nothing
 * is composed on the chance it might be played, so a material — or a cycle
 * of one — that is built and never heard cannot exist. That was the
 * commonest way the old program lied to itself, and it is closed off
 * structurally rather than checked for.
 *
 * A VARIANT KEEPS THE CHORDS AND REDRAWS THE PARTS. An idea coming back
 * changed still stands on its own changes; what differs is what is played
 * over them. Changing the harmony too would make it a different section, not
 * the same one returning.
 *
 * THE TUNE AND THE DRUMS ARE WRITTEN PER TIME ROUND. Each time the lead plays
 * a material through — across the whole record, not within one section — it
 * restates, develops or rests by the material's plan, and each time the
 * drums do they treat their figure differently. A chorus heard three times
 * at eight bars is six times round, and the sixth is not the first. The
 * groove under them loops, because a groove is the thing that is allowed to.
 *
 * THE CHECKS THROW. A note outside its register, a pitch outside the scale,
 * two parts on one pitch at one instant — each is a bug in a builder, and a
 * bug that produces a record is a bug found weeks later by ear. They name
 * the material, the part, the bar, the step and the pitch.
 */

import { stepsPerBar } from "../../core/clock.ts";
import { inScale, noteName } from "../../core/theory.ts";
import { DRUM_LANES, PITCHED_ROLES, ROLES, type Contour, type DrumLane, type Element, type Idea, type Register, type Role, type Texture } from "../../genre/spec.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arrangement } from "../arrange.ts";
import type { Chart } from "../chart.ts";
import { drawBass, withTurnaround } from "./bass.ts";
import { alterDrone, drawDrone, DRONE_CHANGES, isDrone, type DroneChange } from "./drone.ts";
import { drawDrums, drawFigure } from "./drums.ts";
import { drawArp } from "./arp.ts";
import { drawCounter } from "./counter.ts";
import { drawChords, harmonicPeriod } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { contourOf, drawLead, ladder, lawsFor } from "./lead.ts";
import { assertInside, at, GROOVE, Sounding, type GrooveRole, type Chord, type Hit, type Material, type Note, type Pitched } from "./note.ts";
import { CHANGES, otherChange, varyLine, type Change } from "./vary.ts";
import { lanesOf, withBlock, withBlockOnLine, NO_LANES, type Fired, type Socket, type Where } from "./block.ts";

export type { Chord, Figure, GrooveRole, Hit, Material, Note, Pitched } from "./note.ts";
export { GROOVE } from "./note.ts";

export interface Materials {
  readonly bars: number;
  /** Every material built, by key. */
  readonly all: ReadonlyMap<string, Material>;
}

export class MaterialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialError";
  }
}

/**
 * A development that comes out note for note the statement is not one. The
 * answers are drawn again from a fresh address until they differ; where the
 * laws leave the answer only one way to go, a handful of tries is the honest
 * limit and the last is kept.
 */
function develop(chart: Chart, chords: readonly Chord[], rng: Rng, steps: number, sounding: Sounding, tune: readonly Note[], period: number, contour: Contour): Note[] {
  // WHAT IS PLAYED, not how. A line that lands on the same pitches at the
  // same instants and merely hammers one of them where the statement picked
  // it is the statement played again, and accepting it as a development is
  // how a section comes back "changed" and sounds identical.
  const notes = (l: readonly Note[]): string =>
    l.filter((n) => n.bar < period).map((n) => `${n.bar}:${n.step}:${n.dur}:${n.pitch}`).join();
  const same = (a: readonly Note[], b: readonly Note[]): boolean => notes(a) === notes(b);
  let line: Note[] = [];
  for (let attempt = 1; attempt <= 6; attempt++) {
    line = drawLead(chart, chords, rng, steps, sounding, attempt, contour);
    if (!same(line, tune)) break;
  }
  return line;
}

interface Rounds {
  /** How many times each part plays this material through, over the whole record. */
  readonly times: ReadonlyMap<Role, number>;
  /**
   * The rounds at which a SECTION begins, per part. A plan may rest a round
   * — a breath in the middle of a long stretch — but a section whose first
   * round is that rest has a part it says is heard and never hears it, which
   * is the silence-by-omission this program is built to make impossible.
   */
  readonly opens: ReadonlyMap<Role, ReadonlySet<number>>;
  /**
   * WHERE EACH ROUND IS, one entry per round, per part — the section's energy
   * and whether this round is the last of its section.
   *
   * Here rather than computed again beside the drums, because this function is
   * already walking the placements and doing exactly this arithmetic to count
   * the rounds. An event needs to know it is at a seam, and a seam is a fact
   * about the placement rather than about the beat.
   */
  readonly where: ReadonlyMap<Role, readonly Where[]>;
}

function timesRound(arrangement: Arrangement, bars: number): ReadonlyMap<string, Rounds> {
  const times = new Map<string, Map<Role, number>>();
  const opens = new Map<string, Map<Role, Set<number>>>();
  const where = new Map<string, Map<Role, Where[]>>();
  for (const p of arrangement.placed) {
    const per = times.get(p.material) ?? new Map<Role, number>();
    const firsts = opens.get(p.material) ?? new Map<Role, Set<number>>();
    const spots = where.get(p.material) ?? new Map<Role, Where[]>();
    for (const role of p.heard) {
      const before = per.get(role) ?? 0;
      (firsts.get(role) ?? firsts.set(role, new Set()).get(role)!).add(before);
      const rounds = Math.ceil(p.section.bars / bars);
      const list = spots.get(role) ?? spots.set(role, []).get(role)!;
      for (let i = 0; i < rounds; i++) list.push({ energy: p.section.energy, last: i === rounds - 1 });
      per.set(role, before + rounds);
    }
    times.set(p.material, per);
    opens.set(p.material, firsts);
    where.set(p.material, spots);
  }
  const out = new Map<string, Rounds>();
  for (const [key, per] of times) out.set(key, { times: per, opens: opens.get(key)!, where: where.get(key)! });
  return out;
}

export function makeMaterials(chart: Chart, arrangement: Arrangement): Materials {
  const steps = stepsPerBar(chart.metre);
  const bars = chart.genre.harmony.bars;
  const rounds = timesRound(arrangement, bars);

  const chordsOf = new Map<Idea, readonly Chord[]>();
  const all = new Map<string, Material>();

  /**
   * WHERE A BLOCK IS BEING ASKED TO GO — the one place a socket is built, so
   * the kit and the five pitched seats cannot come to disagree about what the
   * pool is allowed to read. A seat hands in what it alone knows: the kit its
   * lanes, a line its ladder, and the other is empty.
   */
  const socketFor = (
    part: Role,
    spot: Where,
    round: number,
    lanes: ReadonlySet<DrumLane>,
    rungs: readonly number[],
  ): Socket => ({
    part, energy: spot.energy, seam: spot.last, heard: round, lanes, rungs,
    steps, beat: chart.metre.perBeat, bars,
  });

  // PLAIN STATEMENTS FIRST, so a variant has the thing it varies. A variant
  // is a descendant and not a sibling: it inherits its groove note for note
  // and changes the beat and the tune, which is what makes it the same idea
  // coming back rather than a different section over the same chords.
  const order = [...rounds.keys()].sort((a, b) => {
    const v = (k: string): number => (k.includes("/") ? Number(k.split("/")[1]) : 0);
    return v(a) - v(b) || a.localeCompare(b);
  });

  for (const key of order) {
    const { times, opens, where } = rounds.get(key)!;
    const [ideaStr, vStr] = key.split("/");
    const idea = ideaStr as Idea;
    const variant = vStr === undefined ? 0 : Number(vStr);

    let chords = chordsOf.get(idea);
    if (chords === undefined) {
      chords = Object.freeze(drawChords(chart, idea));
      chordsOf.set(idea, chords);
    }

    const rng = chart.rng.at("material", idea, variant);
    // A VARIANT INHERITS THE BEAT'S SKELETON as well as the groove: the same
    // pockets and the same hat division, treated differently. Drawing its own
    // figure while inheriting the bass would put the bass on a kick that is
    // no longer there, which is the one thing the two are written together to
    // avoid.
    /**
     * WHAT THIS ONE COMES FROM: the material before it in the idea's own
     * chain, not always the plain statement. A/2 develops A/1, which developed
     * A — so an idea that comes back a fifth time is four removes from where
     * it started rather than one, and each return is answering what the record
     * last did with it rather than what it did in bar one.
     *
     * It also settles a bookkeeping problem that reads as a musical one: an
     * idea whose plain statement is only ever heard without the tune has no
     * tune for its first variant to vary, and every later variant was going
     * back to that same empty statement and writing a fresh line. Down the
     * chain there is always a tune to develop as soon as one has been played.
     */
    const plainOf = variant > 0 ? (all.get(`${idea}/${variant - 1}`) ?? all.get(idea)) : undefined;
    // the drum figure first: the bass may take its feet from the kick
    const figure = plainOf ? plainOf.figure : drawFigure(chart, rng.at("drums"));
    // each part is told what the parts before it are SOUNDING — not merely
    // where they were struck — so it never lands on one and never rubs
    // against one. A rule at the point of choice, not a repair after.
    // THE LOOP IS AS LONG AS THE CHANGES ARE, and everything played over it
    // is written once and repeated. A four-bar material whose progression is
    // Dm7 Am Dm7 Am is a TWO-BAR loop stated twice: writing four bars of bass
    // and four of tune over it makes the record say one thing with its
    // harmony and another with everything else, and what an ear then has to
    // hold is four bars of material that never repeat instead of two that do.
    // "The pitched elements of a hip-hop beat tend to repeat in loops of one,
    // two, or four measures; exceptions to this are extremely rare", and a
    // two-bar phrase is "a default phrase expectation" (Adams, "Parameters of
    // Phrase in Hip-Hop", MTO 26.2).
    const period = harmonicPeriod(chords);
    const loop = chords.slice(0, period);
    /** One period's worth of notes, laid down for every turn of the loop. */
    const tile = (notes: readonly Note[]): Note[] => {
      const out: Note[] = [];
      for (let k = 0; k * period < bars; k++) for (const n of notes) out.push({ ...n, bar: n.bar + k * period });
      return out;
    };

    const sounding = new Sounding();
    // THE SAME PICTURE, FOLDED INTO THE LOOP. A part written for one turn is
    // played on every turn, so what it must keep clear of is what sounds at
    // that position on ANY turn — which is exactly what `Sounding` does when
    // it is told the loop is the period.
    const inLoop = new Sounding();

    // A VARIANT INHERITS ITS GROOVE, and inherits it BEFORE anything is drawn
    // against it. What makes a section recognisable as itself coming back is
    // the bass and the chords under it; redrawing them gives a new section
    // wearing the old one's harmony, which is what a "variant" used to be and
    // why a return never sounded like one.
    //
    // The picture the tune is written against has to be the groove that is
    // actually PLAYED. Drawing a groove, discarding it for the inherited one
    // and then writing a tune against the discarded one puts the lead on a
    // pitch the keys are holding — which is a bug the checks catch, and only
    // because they are there.
    const plain = plainOf;
    const taken = new Set<string>();

    /**
     * WHAT EACH SEAT IS DOING IN THIS MATERIAL — the arrangement drew it, and
     * this is where the drawing becomes notes.
     *
     * For the whole of this program's life the builder was the seat: this
     * block called `drawBass` for the bass and `drawKeys` for the keys, and
     * "the bass" meant a register and a voice and a way of writing notes with
     * no seam between them. The seam is here now. A seat's ELEMENT picks the
     * builder, its TEXTURE says how the notes lie, and its own register is
     * handed in — so the keys can play the rhythm, the counter can hold a pad,
     * and the notes come out in the right band because the band was never the
     * builder's to know. `PARTS-ELEMENTS-AND-STREAMS.md` is the research.
     *
     * WHAT A SEAT CANNOT DO YET, said plainly: serve the lead. The tune's
     * builder carries the melodic laws and is written per time round against
     * the plan; the arrangement gives lead to the seat named for it and to no
     * other. And fills is written against the tune, so only a seat built after
     * the tune — the counter — may serve it; the genres do not offer it to the
     * groove seats and `resolve.ts` should say so.
     */
    const assigned = arrangement.placed.find((p) => p.material === key);
    const own = (r: Role): Element => (r === "keys" || r === "drone" ? "pad" : r === "counter" ? "fills" : r === "lead" ? "lead" : "foundation");
    const elementOf = (r: Role): Element => assigned?.elements[r] ?? own(r);
    const textureOf = (r: Role): Texture => assigned?.textures[r] ?? "line";
    /**
     * What each seat ended up playing. EVERY pitched seat has an entry from
     * the start — what it was assigned — and a seat that writes overwrites its
     * own. A variant inherits its bass and drone from the plain material
     * note for note, so it inherits what those seats served as well; a
     * material the counter never plays keeps the assignment, since nothing
     * was written and nothing gave way.
     */
    const served: Record<string, { element: Element; texture: Texture }> = {};
    /**
     * WHAT INTERRUPTED EACH ROUND, filled in as each part is written and read
     * back off the material afterwards. One entry per round per part, `null`
     * where nothing fired — see `Material.blocks`.
     */
    const fired: Partial<Record<Role, (Fired | null)[]>> = {};
    for (const r of ROLES) fired[r] = [];
    /**
     * ONE ROUND OF ONE PITCHED SEAT, INTERRUPTED — or exactly as it was
     * written, which is what happens most of the time.
     *
     * LAST, and that is the whole point of doing it out here rather than
     * inside each builder. A block OVERWRITES the bar the figure, the phrase
     * and the third-statement alteration have already finished with; a gesture
     * drawn alongside them would be one more rule, and the thing this pool
     * exists to be is the one thing in the stage that is not a rule.
     *
     * PER ROUND, addressed by the round, for the same reason the kit's is: a
     * block fired inside a builder whose line is cached would come back
     * identically every time that line came round, which is another pattern.
     *
     * AND THE SEAT'S OWN LAWS DECIDE, not the pool. `lawful` is whatever the
     * caller was already judging this seat by — its register, and what the
     * parts written before it hold — so a gesture that would put the bass on
     * the drone's E2 simply did not fire.
     */
    const blocked = (
      part: Pitched,
      line: readonly Note[],
      round: number,
      register: Register,
      lawful: (l: readonly Note[]) => boolean,
    ): readonly Note[] => {
      const spot = (where.get(part) ?? [])[round];
      if (spot === undefined) { fired[part]!.push(null); return line; }
      const got = withBlockOnLine(
        line,
        socketFor(part, spot, round, NO_LANES, ladder(chart, register)),
        chart.genre.blocks,
        rng.at(part, "block", round),
        lawful,
      );
      fired[part]!.push(got.block);
      return got.block === null ? line : Object.freeze(got.notes);
    };
    // ONLY WHAT IS INHERITED NOTE FOR NOTE INHERITS ITS JOB. A variant keeps
    // the plain material's bass and drone and redraws everything else, so the
    // keys, the counter and the lead start from this material's own draw.
    for (const r of PITCHED_ROLES) {
      served[r] = (r === "bass" || r === "drone") && plainOf ? plainOf.served[r] : { element: elementOf(r), texture: textureOf(r) };
    }
    /**
     * A JOB THAT CANNOT BE WRITTEN HERE GIVES WAY TO THE SEAT'S OWN.
     *
     * The arrangement draws a seat's job before a note exists, and whether the
     * job has anywhere to stand is only knowable once the other seats have
     * written theirs: dungeon synth seed 32 gave the counter the rhythm, its
     * band sits inside the keys', and that genre's pad holds every chord tone
     * for the whole bar — so every rung of the arp's ladder was occupied at
     * every instant and the seat wrote nothing in four rounds. A part that is
     * heard and silent is the one fault the arrangement's header was written
     * against, so a job that yields nothing is not this seat's job in this
     * material, and the seat plays its own instead. `served` says which
     * happened, and the dump and the roll read it rather than the draw.
     */
    /**
     * WHOSE BANDS A CHORD PART STAYS OUT OF — see `COST.mask` in `keys.ts`.
     * The foundation's, always: the bass is the register a chord voiced low
     * sits on, and the arrangement diagnosis found lofi's keys doing exactly
     * that. And the main character's, where it is a pitched part other than
     * this seat: the yield around a protagonist runs one way.
     */
    const avoidFor = (r: Role): Register[] => {
      const bands: Register[] = [];
      if (r !== "bass") bands.push(chart.register.bass);
      const star = arrangement.protagonist;
      if (star !== r && star !== "drums" && star !== "bass") bands.push(chart.register[star]);
      return bands;
    };
    const serve = (r: "bass" | "keys" | "drone", register: Register, heard: Sounding): readonly Note[] => {
      const seatRng = rng.at(r);
      const write = (el: Element, tx: Texture): Note[] => {
        let line: Note[];
        if (el === "rhythm") {
          // the rhythm is spilled: this program's one way of "playing counter
          // to the Foundation" is the arpeggio, and `LEGAL_TEXTURES` says so —
          // a pad never reaches here with an arp texture, because a pad that is
          // spilled is not a pad
          line = tile(drawArp(chart, loop, register, seatRng, steps, period, heard));
        } else if (el === "foundation") {
          // the loop, tiled, and the second turn adding one — see `withTurnaround`
          line = withTurnaround(chart, tile(drawBass(chart, loop, seatRng, steps, figure.kick, register)), loop, period, bars, steps, seatRng, register);
        } else if (r === "drone") {
          // the pedal is the drone's own: a tonic or a fifth, held. A second pad
          // on another seat voices the chord below instead of fighting it for
          // those two pitches — a pad is "a long sustaining note OR CHORD"
          line = drawDrone(chart, seatRng, steps, bars, heard, register);
        } else {
          line = tile(drawKeys(chart, loop, seatRng, steps, heard, register, avoidFor(r)));
        }
        // SPARSE keeps every other note: the same line with half of it left out
        if (tx === "sparse") line = line.filter((_, i) => i % 2 === 0);
        return line;
      };
      let el = elementOf(r), tx = textureOf(r);
      let line = write(el, tx);
      if (line.length === 0 && (el !== own(r) || tx !== "line")) {
        el = own(r); tx = r === "drone" ? "sustain" : "line";
        line = write(el, tx);
      }
      served[r] = { element: el, texture: tx };
      return Object.freeze(line);
    };

    /**
     * HOW MANY TIMES EACH GROUND PART PLAYS THIS MATERIAL THROUGH. The same
     * count `lead` and `counter` are built against; the ground had no such
     * count because it had no per-round existence.
     */
    const roundsOf = (r: GrooveRole): number => Math.max(1, times.get(r) ?? 1);
    /**
     * TWO THE SAME, THEN ALTERED. The rule of three, on each part's own clock.
     *
     * "If I say something to you once then it's an idea that you've heard one
     * time. If I say it a second time it's reinforcing that idea. But if I say
     * it a third time ... this is where our brain will actually begin to tune
     * it out" (transcript `006`, quoted in THE-STALENESS-CLOCK.md §1). The
     * published rule is the same: whenever a pattern, idea or motif is about
     * to be heard a third time, change it.
     *
     * The record has kept this rule for its IDEAS since `form.ts` was written,
     * and every PART broke it, because a part had one line and no way to hold
     * a third statement that differed. Measured before this, over sixty
     * records: the bass, keys and drone each had about half of every change
     * they were owed go unpaid, and the worst case was the same four bars five
     * times over twenty bars.
     *
     * AND THE COUNT RESETS, exactly as `form.ts` resets its own: state, state,
     * alter, and back to the thing the ear knows. Without the reset every
     * round after the third is altered and the figure itself is heard twice
     * and never again, which is not a return.
     *
     * IT IS AN ALTERATION AND NOT A REWRITE. `varyLine` holds the documented
     * motivic operations and the seat's own laws judge the result — its band,
     * and nothing another ground part is holding in that round. A change that
     * cannot be made lawful leaves the line exactly as it was, which is the
     * old behaviour and still a correct record.
     */
    const STATE_BEFORE_ALTERING = 2;
    const perRound = (r: GrooveRole, line: readonly Note[], register: Register, held: Sounding): readonly (readonly Note[])[] => {
      const n = roundsOf(r);
      const out: (readonly Note[])[] = [];
      const rungs = ladder(chart, register);
      const [lo, hi] = register;
      /**
       * THE SEAT'S OWN LAWS: its band, and nothing another ground part is
       * already holding. The second half is not optional — an altered drone
       * that moves onto the bass's E2 is the collision the checker exists to
       * catch, and it caught it. The parts are pictured in the order they are
       * written, so each one is judged against everyone written before it.
       */
      const fits = (l: readonly Note[]): boolean =>
        l.every((note) => {
          if (note.pitch < lo || note.pitch > hi) return false;
          for (let i = 0; i < note.dur; i++) {
            const abs = note.bar * steps + note.step + i;
            if (held.holds(Math.floor(abs / steps) % bars, abs % steps, note.pitch)) return false;
          }
          return true;
        });
      /**
       * AND THE SEAT'S LAWS INCLUDE WHAT THE SEAT IS. `fits` above is the
       * band and the collisions, which is everything a bass or a keyboard
       * has to answer for. A drone answers for more: it holds the tonic or
       * the dominant, from a downbeat, for at least a bar. Three blocks in
       * the pool write lines that are correct on every other seat and are
       * not a drone, so the law comes from where the drone is built.
       */
      const lawful = (l: readonly Note[]): boolean =>
        fits(l) && (r !== "drone" || isDrone(l, chart.tonic, steps));
      let stated = 0;
      for (let k = 0; k < n; k++) {
        stated++;
        if (stated <= STATE_BEFORE_ALTERING || line.length === 0) { out.push(blocked(r, line, k, register, lawful)); continue; }
        stated = 0;
        /**
         * THE DRONE IS NOT TILED, and this is where forgetting that showed.
         *
         * Everything else pitched is written for one turn and repeated, so an
         * alteration is made to the turn and tiled like the line it replaces.
         * A drone is a held tone whose whole nature is to be LONGER than the
         * loop under it — tiling its altered turn made three drones where
         * there was one, and two lofi records duly put one of the copies on
         * the keys' F3. So the drone is altered whole, over the material's own
         * length, and laid down as it is.
         */
        const loops = r !== "drone";
        const span = loops ? period : bars;
        const turn = loops ? line.filter((note) => note.bar < period) : line;
        /**
         * A HELD TONE MAY BE SUBTRACTED FROM AND NOTHING ELSE.
         *
         * `vary.ts` divides its operations in two and says which: THIN and
         * AUGMENT "add no pitch that was not already there"; the other four
         * MOVE pitches. For the drone that difference is a law rather than a
         * preference — a drone "sits upon the tonic or dominant", held while
         * the chords change over it (chromatone.center/theory/melody/drone,
         * this genre's own cited source for `drone.tone`), and `index.test.ts`
         * holds it to that. Measured: an inverted lofi drone sat on A#3, nine
         * semitones above the tonic, which is neither.
         *
         * So the drone's third statement is the drone dropping a tone or
         * holding one longer — the floor thinning or settling — and its pitches
         * stay where its own law puts them.
         */
        const seatRng = rng.at(r).at("third", k);
        let got: readonly Note[] | null = null;

        /**
         * THE DRONE HAS ITS OWN VOCABULARY — see `alterDrone` in `drone.ts`.
         *
         * `vary.ts`'s operations are melodic and a drone has no melody to
         * invert or walk backwards. Handing it `thin` and `augment` instead
         * made a rule that fired 0 times in 872 rounds. Its own three come
         * from its own source: a drone is "a sustained sound OR the repetition
         * of a note", and it sounds through "most or all" of a piece.
         */
        if (!loops) {
          const start = seatRng.pick("dronechange", DRONE_CHANGES as readonly DroneChange[]);
          for (let i = 0; i < DRONE_CHANGES.length && got === null; i++) {
            const which = DRONE_CHANGES[(DRONE_CHANGES.indexOf(start) + i) % DRONE_CHANGES.length]!;
            const tried = alterDrone(turn, which, steps);
            if (tried.changed && fits(tried.line)) got = [...tried.line];
          }
          out.push(blocked(r, got === null ? line : Object.freeze(got), k, register, lawful));
          continue;
        }

        const vocabulary: readonly Change[] = CHANGES;
        const start = seatRng.pick("change", vocabulary);
        for (let i = 0; i < vocabulary.length && got === null; i++) {
          const which = vocabulary[(vocabulary.indexOf(start) + i) % vocabulary.length]!;
          const tried = varyLine(turn, loop, seatRng.at("vary", which), steps, span, which, rungs, chart.tonic, chart.scale, fits);
          /**
           * JUDGED ON THE LINE THAT WILL BE PLAYED, tiled and all.
           *
           * `varyLine` alters ONE TURN, and everything but the drone is then
           * tiled across the material. Checking the turn alone checks bars 0
           * and 1 of a two-bar loop and lets the copies at bars 2 and 3 land
           * wherever they like — which is exactly how a lofi keys line moved
           * up two semitones onto a drone holding that pitch at bar 2, four
           * records in a hundred and twenty. The turn was lawful; the record
           * was not.
           */
          const laid = tried.changed ? (loops ? tile(tried.line) : [...tried.line]) : null;
          if (laid !== null && fits(laid)) got = laid;
        }
        out.push(blocked(r, got === null ? line : Object.freeze(got), k, register, lawful));
      }
      return Object.freeze(out);
    };

    const groove = Object.freeze((() => {
      /**
       * EVERY ROUND OF THE GROUND GOES INTO THE PICTURE, not just the first.
       *
       * The tune and the counter are written against what the ground holds, so
       * that nothing lands on a pitch somebody else is already sounding. With
       * one ground line that was one picture. With a ground that alters itself
       * on its third statement it is several, and writing the tune against
       * only the first is how a counter came to land on the drone's A2 at
       * round five — which the checker caught, because that is what it is for.
       *
       * The union, deliberately: the tune avoids every pitch the ground takes
       * in ANY round. It costs the tune a few seats it could legally have had
       * in the rounds where the ground did not take them, and it buys a rule
       * that cannot produce a collision at all rather than one that has to be
       * checked for afterwards.
       */
      const picture = (lines: readonly (readonly Note[])[]): void => {
        for (const l of lines) { sounding.add(l, bars, steps); inLoop.add(l, period, steps); }
      };
      const drawnBass = plain
        ? plain.groove.bass[0] ?? []
        : serve("bass", chart.register.bass, sounding);
      sounding.add(drawnBass, bars, steps);
      inLoop.add(drawnBass, period, steps);
      // the drone stands on the key, not the chord, so it is written before
      // anything that follows the changes — and it is NOT tiled: a drone is a
      // held tone whose whole nature is to be longer than the loop under it
      const drawnDrone = plain
        ? plain.groove.drone[0] ?? []
        : serve("drone", chart.register.drone, sounding);
      sounding.add(drawnDrone, bars, steps);
      inLoop.add(drawnDrone, period, steps);
      // AND THE HANDS PLAY IT AGAIN DIFFERENTLY. A variant inherits the ground
      // — the same chords, the same bass, the same drone, which is what makes
      // it the same section coming back — and REDRAWS THE KEYS over it, from
      // its own address, so it gets its own strike pattern and its own
      // voicings.
      //
      // Inheriting these too was the reason the rule of three fired and
      // nothing happened. A seventy-two-bar record on one idea put the
      // identical two bars of bass, keys and drone down thirty-six times: the
      // form marked the third hearing to vary, the arrangement built the
      // variant, and the only thing that differed was the tune and the beat
      // over a picture that had not moved since bar eight. That is a record
      // repeating the same thing for over half its length, and the law that
      // was supposed to stop it was being obeyed the whole time.
      /**
       * AND A VARIANT DEVELOPS ITS KEYS RATHER THAN ROLLING THEM AGAIN.
       *
       * Redrawing was already better than inheriting — see the paragraph
       * above, which is why it is done — but a redraw and a development are
       * not the same promise. A redraw is a DIFFERENT line over the same
       * chords: it comes off this material's own address and owes the
       * statement nothing, so the third hearing arrives as new music where
       * the law asked for the same music changed. "Repetition, sequence,
       * modulation, augmentation, diminution, retrograde, inversion, and
       * fragmentation" (tobyrush.com, "Motivic Development") are ways of
       * keeping an idea while altering it, and until now this program applied
       * them to the tune ALONE — `varyLine` had exactly one caller, the lead
       * — in a genre where the tune is absent for the first third of the
       * record and the keys are what the record IS.
       *
       * So the statement's own turn is put through the same operations, in
       * the same try-each-from-the-drawn-one order the tune uses, and the
       * first that both changes the line and survives the laws is the
       * variant's keys. A development that cannot be made lawful falls back
       * to the redraw, which is what the code did before this and is still a
       * variant — never to inheriting, which is what it never was.
       *
       * THE LAWS ARE THE SEAT'S, not the tune's: inside the keys' own band,
       * and landing on nothing the bass or drone is already holding or rubbing
       * against. `avoidFor` is deliberately NOT among them — it is a COST in
       * `keys.ts` rather than a refusal, and a development judged by a
       * preference would be refused for being merely worse.
       *
       * A developed line keeps the statement's JOB, because it is the
       * statement's line: an arpeggio thinned is still an arpeggio.
       */
      const developedKeys = ((): readonly Note[] | null => {
        if (plain === undefined) return null;
        const from = (plain.groove.keys[0] ?? []).filter((n) => n.bar < period);
        if (from.length === 0) return null;
        const rungs = ladder(chart, chart.register.keys);
        const [lo, hi] = chart.register.keys;
        const fits = (line: readonly Note[]): boolean =>
          line.every((n) => {
            if (n.pitch < lo || n.pitch > hi) return false;
            for (let i = 0; i < n.dur; i++) {
              const abs = n.bar * steps + n.step + i;
              const bar = Math.floor(abs / steps) % period;
              const st = abs % steps;
              if (inLoop.holds(bar, st, n.pitch) || inLoop.rubs(bar, st, n.pitch)) return false;
            }
            return true;
          });
        const keysRng = rng.at("keys").at("develop");
        const start = keysRng.pick("change", CHANGES as readonly Change[]);
        for (let k = 0; k < CHANGES.length; k++) {
          const which = CHANGES[(CHANGES.indexOf(start) + k) % CHANGES.length]!;
          const got = varyLine(from, loop, keysRng.at("vary", which), steps, period, which, rungs, chart.tonic, chart.scale, fits);
          if (got.changed && fits(got.line)) {
            served["keys"] = plain.served["keys"];
            return tile(got.line);
          }
        }
        return null;
      })();
      const drawnKeys = developedKeys ?? serve("keys", chart.register.keys, inLoop);
      sounding.add(drawnKeys, bars, steps);
      inLoop.add(drawnKeys, period, steps);

      /**
       * AND THE THIRD-STATEMENT ALTERATION RUNS LAST, once all three plain
       * lines exist.
       *
       * Done as each part was drawn, it could only avoid the parts drawn
       * BEFORE it: the drone was altered while the keys did not yet exist, and
       * a lofi drone duly moved onto a keys F#3 at round eight. The checker
       * caught it, which is what it is for, and the order was the fault rather
       * than the rule.
       *
       * So each part is judged against the other two — their altered rounds
       * where those are already decided, their plain line where they are not —
       * and each result joins the picture before the next part is asked. A
       * part that cannot be altered lawfully keeps its line, which is the
       * record this program made before any of this and still a correct one.
       */
      const others = (skip: GrooveRole, done: Partial<Record<GrooveRole, readonly (readonly Note[])[]>>): Sounding => {
        const pic = new Sounding();
        const plainOf: Record<GrooveRole, readonly Note[]> = { bass: drawnBass, keys: drawnKeys, drone: drawnDrone };
        for (const o of GROOVE) {
          if (o === skip) continue;
          for (const l of done[o] ?? [plainOf[o]]) pic.add(l, bars, steps);
        }
        return pic;
      };
      const done: Partial<Record<GrooveRole, readonly (readonly Note[])[]>> = {};
      done.bass = perRound("bass", drawnBass, chart.register.bass, others("bass", done));
      done.drone = perRound("drone", drawnDrone, chart.register.drone, others("drone", done));
      done.keys = perRound("keys", drawnKeys, chart.register.keys, others("keys", done));
      const bassRounds = done.bass;
      const droneRounds = done.drone;
      const keysRounds = done.keys;
      for (const l of [...bassRounds, ...droneRounds, ...keysRounds]) { sounding.add(l, bars, steps); inLoop.add(l, period, steps); }
      return { bass: bassRounds, keys: keysRounds, drone: droneRounds };
    })());
    for (const n of groove.bass.flat()) taken.add(`${at(n)}:${n.pitch}`);
    for (const n of groove.drone.flat()) taken.add(`${at(n)}:${n.pitch}`);

    /**
     * WHAT THE GROUND IS HOLDING ON A GIVEN TIME ROUND — the same picture
     * `check` builds to refuse a material, built here so a block can be
     * refused BEFORE the material is one.
     *
     * Round by round, because the ground alters itself on its third statement
     * and two lines that are never in the air together cannot collide. Past
     * the ground's last round it holds its last, which is how `check` reads it
     * and how `perform.ts` plays it.
     */
    const groundRounds = Math.max(...GROOVE.map((p) => groove[p].length), 1);
    const pictured = new Map<number, Sounding>();
    const groundAt = (round: number): Sounding => {
      const k = Math.min(round, groundRounds - 1);
      const got = pictured.get(k);
      if (got !== undefined) return got;
      const pic = new Sounding();
      for (const p of GROOVE) pic.add(groove[p][Math.min(k, groove[p].length - 1)] ?? [], bars, steps);
      pictured.set(k, pic);
      return pic;
    };
    /**
     * AND WHAT EVERY SEAT MUST KEEP WHATEVER HAPPENS TO IT: `check`'s own
     * laws, asked before the fact instead of after it.
     *
     * A block rewrites a bar somebody else's builder wrote, so it is the one
     * thing in this stage that can hand `check` a line no builder would have
     * produced. Rather than teach the pool the laws — which would be a second
     * copy of them, and the bill comes later — the caller judges the result by
     * the same three things `check` throws for: the seat's band, the record's
     * scale, and a pitch nobody else is sounding at that instant.
     *
     * STRICTER THAN `check` IN ONE WAY, on purpose: `check` compares where
     * notes START and this compares every step either note SOUNDS for, which
     * is the difference between a tune that lands on a held chord tone and one
     * that lands beside it. `Sounding` exists because three quarters of this
     * program's clashes were a note arriving under something already ringing.
     */
    const keeps = (register: Register, held: Sounding) => (l: readonly Note[]): boolean => {
      const [lo, hi] = register;
      return l.every((n) => {
        if (n.pitch < lo || n.pitch > hi) return false;
        if (!Number.isInteger(n.bar) || n.bar < 0 || n.bar >= bars) return false;
        if (!Number.isInteger(n.step) || n.step < 0 || n.step >= steps) return false;
        if (!Number.isInteger(n.dur) || n.dur < 1) return false;
        if (n.vel <= 0 || n.vel > 1) return false;
        if (!inScale(chart.tonic, chart.scale, n.pitch)) return false;
        for (let i = 0; i < n.dur; i++) {
          const abs = n.bar * steps + n.step + i;
          if (held.holds(Math.floor(abs / steps) % bars, abs % steps, n.pitch)) return false;
        }
        return true;
      });
    };

    // the tune's plan, applied to every time the lead plays this material
    // through; the development is written only where a time will play it
    const leadRng = rng.at("lead");
    const plan = leadRng.weighted("cycles", chart.genre.lead.cycles);
    const opensLead = opens.get("lead") ?? new Set<number>();
    const letters = Array.from({ length: times.get("lead") ?? 0 }, (_, n) => {
      const letter = plan[n % plan.length]!;
      // a section opens with the tune; a rest is a breath taken inside one
      return letter === "." && opensLead.has(n) ? "A" : letter;
    });
    // the tune is written for ONE turn of the loop and played on every turn:
    // a hook is a hook because it comes back, and a lead that writes a fresh
    // melody over the loop's second turn is not a lead, it is two of them
    // AND ITS TUNE IS THE STATEMENT'S, CHANGED — thinned or held longer, one
    // of the documented motivic operations, rather than written again. See
    // vary.ts for why those two and not inversion or sequence.
    // ONE TURN OF THE LOOP is what is varied, and then it is tiled like any
    // other tune: a change applied to the tiled line would land in one turn
    // and not the next, and the loop would stop being one.
    const statedTurn = (plain?.lead.find((l) => l.length > 0) ?? []).filter((n) => n.bar < period);
    // The statement takes one change and the development takes the OTHER, so
    // the two differ from each other as well as from what they came from —
    // and a change that turned out to be a no-op falls back to writing a line,
    // because a variant identical to its statement is not one.
    // ONE CONTOUR, decided here and handed to everything that writes a line,
    // so the material's label and its notes cannot disagree. A variant plays
    // the statement's tune, so it moves the way the statement moves.
    const contour = plain ? plain.contour : contourOf(chart, leadRng);
    const first = leadRng.at("vary").pick("change", CHANGES as readonly Change[]);
    /**
     * The changes tried in turn from the one drawn, and the first that takes.
     * Three of the five MOVE PITCHES and are refused whenever the laws say so
     * — an inversion that leaves the register, a sequence that leaves the
     * scale, a retrograde that strands a dissonance — which is most of the
     * time. Trying only the drawn one sent half the variants back to writing a
     * fresh line, which is the thing a variant is not.
     */
    const worksFrom = (
      start: Change,
      of: readonly Note[],
      /** A further test the changed line must pass — the seams, where a caller has two lines to join. */
      also?: (line: readonly Note[]) => boolean,
    ): { line: readonly Note[]; which: Change } | null => {
      if (of.length === 0) return null;
      for (let k = 0; k < CHANGES.length; k++) {
        const which = CHANGES[(CHANGES.indexOf(start) + k) % CHANGES.length]!;
        const got = varyLine(of, loop, leadRng.at("vary", which), steps, period, which, ladder(chart), chart.tonic, chart.scale, laws);
        if (got.changed && (also === undefined || also(got.line))) return { line: got.line, which };
      }
      return null;
    };
    // the laws the statement was written under, so a moved pitch is judged by
    // exactly what refused it when the line was first written
    const laws = lawsFor(chart, loop, inLoop, contour);
    /**
     * THE SECOND TURN OF THE LOOP: the figure again, or the figure CHANGED.
     *
     * Tiling exactly is what makes a beat a beat, and it is what everything
     * pitched here does. But a tune is not only a beat: Caplin's presentation
     * phrase is "a repeated two measure basic idea" where "the idea is then
     * repeated, usually with some variation in contour, rhythm, voicing, or
     * harmonization", and that small difference on the repeat is the smallest
     * unit of what a song is made of. Both are repetition; only one is exact.
     *
     * The change is one of the same five motivic operations a returning
     * section uses, and the SENTENCE IT ASSEMBLES is judged by the laws — not
     * the change on its own.
     *
     * Judging the change alone was not enough, and said so wrongly here for
     * some time. A figure is lawful as a figure and still unlawful where it
     * is put: a RETROGRADE BEGINS ON THE NOTE ITS STATEMENT ENDED ON, so a
     * retrograde second turn repeats a pitch across the join every single
     * time, and no sung line may. The generator never placed such a note and
     * varyLine never returned one — the fault was only ever at the seam the
     * two were assembled across, which nothing looked at.
     *
     * So the assembled line is what the laws see, and a sentence that cannot
     * be built lawfully is not built: the loop tiles instead. A constraint on
     * which sentence may be made, not a repair of one already made.
     */
    const shape = leadRng.weighted("shape", chart.genre.lead.shape);
    const asSentence = (turn: readonly Note[]): Note[] => {
      if (shape !== "sentence" || period >= bars) return tile(turn);
      /**
       * AND THE TWO TURNS HAVE TWO SEAMS, NOT ONE.
       *
       * `lawsFor` judges a line on its own and holds its last note away from
       * its own first, which is the seam a tiled loop has. A sentence has a
       * second line in it — a a' a a' — so there are two junctions to keep
       * clean: the statement's last note into the variation's first, and the
       * variation's last into the statement's first. Neither is a fact about
       * either line alone, so neither can be a law of one; they are checked
       * here, where both lines exist. Found by the roll: seed 56 held 83 into
       * bar 2 and read as a tune stuttering on the bar line.
       */
      const ends = (l: readonly Note[]): { first: number; last: number } | null => {
        const ns = l.slice().sort((a, b) => a.bar - b.bar || a.step - b.step);
        return ns.length === 0 ? null : { first: ns[0]!.pitch, last: ns[ns.length - 1]!.pitch };
      };
      const a = ends(turn);
      const joins = (line: readonly Note[]): boolean => {
        if (contour === "chant") return true;
        const b = ends(line);
        return a !== null && b !== null && b.first !== a.last && a.first !== b.last;
      };
      const answer = worksFrom(leadRng.at("sentence").pick("change", CHANGES as readonly Change[]), turn, joins);
      if (answer === null) return tile(turn);
      const out: Note[] = [];
      for (let k = 0; k * period < bars; k++) {
        // the basic idea on the odd turns and its varied repetition on the
        // even ones: a a' a a', which is the presentation stated twice rather
        // than a idea that drifts further from itself every time round
        for (const n of (k % 2 === 0 ? turn : answer.line)) out.push({ ...n, bar: n.bar + k * period });
      }
      return laws(out) ? out : tile(turn);
    };

    const asTune = worksFrom(first, statedTurn);
    const tune = asTune !== null
      ? Object.freeze(asSentence(asTune.line))
      : letters.length > 0 ? Object.freeze(asSentence(drawLead(chart, loop, leadRng, steps, inLoop, 0, contour))) : null;
    // AND THE DEVELOPMENT IS CHECKED AGAINST WHAT WAS ACTUALLY KEPT, not
    // against the intermediate it came from. `tune` above is the change if it
    // changed anything and a freshly written line if it did not, so comparing
    // the two transformations to each other answers the wrong question — and
    // answered it wrongly, shipping variants whose four times round were one
    // line four times.
    const asDev = asTune === null ? null : worksFrom(otherChange(asTune.which), statedTurn);
    const devLine = asDev !== null ? asSentence(asDev.line) : null;
    const developed = letters.includes("B") && tune !== null
      ? Object.freeze(devLine !== null && JSON.stringify(devLine) !== JSON.stringify(tune)
        ? devLine
        : tile(develop(chart, loop, leadRng, steps, inLoop, tune, period, contour)))
      : null;
    const tacet: readonly Note[] = Object.freeze([]);
    // AND A BLOCK MAY INTERRUPT ANY ROUND OF IT, judged by exactly the laws
    // the tune was written under — `lawsFor`, which is what refused every
    // pitch `varyLine` tried to move above. A round the letters make tacet has
    // nothing to interrupt and `withBlockOnLine` returns it untouched.
    const lead = Object.freeze(letters.map((l, n) =>
      blocked(
        "lead",
        l === "A" ? tune ?? tacet : l === "B" ? developed ?? tune ?? tacet : tacet,
        n,
        chart.register.lead,
        // BOTH, and neither on its own is enough. `lawsFor` is what makes a
        // line a TUNE — it walks rather than leaps, it resolves what it hangs,
        // it ends on a chord tone — and it reads its picture modulo the LOOP,
        // so it says nothing at all about the tiled copies past bar `period`.
        // A block landed there and put the lead on the keys' C#4 in the first
        // sweep this ran. `keeps` covers the line as it will be played.
        (line) => laws(line) && keeps(chart.register.lead, groundAt(n))(line),
      )));

    // AND THE COUNTER-LINE IS WRITTEN AGAINST THE TUNE, one line per time the
    // counter plays this material through. It reads the lead's line for the
    // SAME round — the tune's rests are what it is made of — so a round where
    // the lead is tacet leaves it nothing to answer and it says nothing,
    // which is the correct behaviour rather than a gap to fill.
    const counterRng = rng.at("counter");
    const counter = Object.freeze(
      Array.from({ length: times.get("counter") ?? 0 }, (_, n) =>
        Object.freeze((() => {
          // the counter's job, per material: fills answers the tune it was
          // built to answer; rhythm and pad are the same seat doing something
          // else in its own band, and an arpeggiated texture spills either
          const el = elementOf("counter"), tx = textureOf("counter"), r = counterRng.at("round", n);
          // THE COUNTER SEES THE TUNE, WHATEVER JOB IT IS DOING. `drawCounter`
          // is handed the lead's line and writes around it; the arp and the
          // pad builders take a sounding-set instead, and the groove's set
          // does not contain the lead, which is written per round after it.
          // Measured: a counter serving the rhythm landed on the lead's pitch
          // in 8 of 60 lofi seeds, and the material check refused every one.
          // So the picture this seat is written against is the groove AND
          // this round's tune — the same law, given the whole picture.
          const withTune = new Sounding();
          withTune.add([...groove.bass.flat(), ...groove.keys.flat(), ...groove.drone.flat()], period, steps);
          withTune.add(lead[n] ?? [], period, steps);
          // A SECOND PAD VOICES THE CHORD, IT DOES NOT FIGHT THE PEDAL. A pad
          // is "a long sustaining note OR CHORD"; the drone's builder holds
          // only a tonic or a fifth and refuses when neither is free, and the
          // record's own drone already holds them in a band this one overlaps
          // — 6 of 60 dungeon synth seeds refused to build. The keys' builder
          // is the chord, and it is what a second pad is.
          const write = (e: Element, t: Texture): Note[] => {
            let line: Note[] = e === "rhythm" || (e === "fills" && t === "arp")
              ? tile(drawArp(chart, loop, chart.register.counter, r, steps, period, withTune))
              : e === "pad"
                ? tile(drawKeys(chart, loop, r, steps, withTune, chart.register.counter, avoidFor("counter")))
                : drawCounter(chart, loop, lead[n] ?? [], r, steps, period, inLoop);
            if (t === "sparse") line = line.filter((_, i) => i % 2 === 0);
            return line;
          };
          let line = write(el, tx);
          // the same law as `serve`: a job with nowhere to stand gives way to
          // the seat's own, and the record says so
          let servedEl = el, servedTx = tx;
          if (line.length === 0 && (el !== "fills" || tx !== "line")) {
            servedEl = "fills"; servedTx = "line";
            line = write(servedEl, servedTx);
          }
          // the counter is written per round; the job it served is the same
          // whichever round gave way, and the last word here is the honest one
          served["counter"] = { element: servedEl, texture: servedTx };
          // AND THE SAME POOL REACHES IT, against the same picture it was
          // written against: the ground, this round's tune, and its own band.
          const [lo, hi] = chart.register.counter;
          return blocked("counter", line, n, chart.register.counter, (l) =>
            l.every((note) => {
              if (note.pitch < lo || note.pitch > hi) return false;
              for (let i = 0; i < note.dur; i++) {
                const abs = note.bar * steps + note.step + i;
                const b = Math.floor(abs / steps) % period, st = abs % steps;
                if (withTune.holds(b, st, note.pitch) || withTune.rubs(b, st, note.pitch)) return false;
              }
              return true;
            }));
        })())),
    );

    // THE TREATMENTS CYCLE. A record has as many distinct treatments of a
    // figure as the genre says, and plays them round and round — the same
    // beat coming back, which is the only way a beat becomes one. Drawn per
    // time round, a sixty-four-bar record over a four-bar material had
    // sixteen different beats in it and repeated none of them.
    const treatments = Math.max(1, chart.genre.drums.treatments);
    const cut = new Map<number, readonly Hit[]>();
    const spots = where.get("drums") ?? [];
    const drums = Object.freeze(
      Array.from({ length: times.get("drums") ?? 0 }, (_, n) => {
        // A VARIANT TAKES THE NEXT BEAT ALONG. "Changing the drum beat works
        // every time, and you could keep everything exactly the same way and
        // change just the drum beat and it instantly feels different"
        // (secretsofsongwriting.com, "The Main Differences Between Verse 1 and
        // Verse 2") — the cheapest change there is, and the strongest.
        const which = (n + variant) % treatments;
        const already = cut.get(which);
        const beat = already ?? Object.freeze(drawDrums(chart, rng.at("drums"), figure, bars, steps, which));
        if (already === undefined) cut.set(which, beat);
        /**
         * AND THEN SOMETHING MAY INTERRUPT IT — see `block.ts`.
         *
         * PER TIME ROUND, and that is the whole point of doing it here rather
         * than inside `drawDrums`. The beat above is cached by TREATMENT, so an
         * event fired in there would come back identically every time that
         * treatment came round — which is another pattern, and a pattern is
         * exactly what an interruption is not. Addressed by `n`, the same beat
         * is interrupted on its fourth hearing and not on its second.
         *
         * It also has to be last. An event OVERWRITES the bar the figure, the
         * phrase letter and the manner pass have already finished with; a
         * gesture drawn into the bar alongside them would be one more rule.
         */
        const spot = spots[n];
        if (spot === undefined) { fired["drums"]!.push(null); return beat; }
        const got = withBlock(
          beat,
          socketFor("drums", spot, n, lanesOf(beat), []),
          chart.genre.blocks,
          rng.at("drums", "block", n),
        );
        fired["drums"]!.push(got.block);
        return got.block === null ? beat : Object.freeze(got.hits);
      }),
    );

    served["lead"] = { element: "lead", texture: "line" };
    const material: Material = Object.freeze({
      key, idea, variant, contour, bars, period, chords, groove, lead, counter, figure, drums,
      served: Object.freeze(served) as Material["served"],
      blocks: Object.freeze(
        Object.fromEntries(ROLES.map((r) => [r, Object.freeze(fired[r] ?? [])])),
      ) as Material["blocks"],
    });
    check(chart, material, steps);
    all.set(key, material);
  }


  return Object.freeze({ bars, all });
}

/** The invariants every material holds, or the material does not exist. */
function check(chart: Chart, m: Material, steps: number): void {
  const registers: Record<Pitched, readonly [number, number]> = {
    bass: chart.register.bass,
    keys: chart.register.keys,
    lead: chart.register.lead,
    counter: chart.register.counter,
    drone: chart.register.drone,
  };
  const grooveSeats = new Map<string, Pitched>();

  const checkNote = (part: Pitched, n: Note, where: string, seats: Map<string, Pitched>): void => {
    const [lo, hi] = registers[part];
    assertInside({ bars: m.bars, steps }, n, where);
    if (n.pitch < lo || n.pitch > hi) {
      throw new MaterialError(`${where}: ${noteName(n.pitch)} is outside ${part}'s register ${lo}..${hi}`);
    }
    if (!inScale(chart.tonic, chart.scale, n.pitch)) {
      throw new MaterialError(`${where}: ${noteName(n.pitch)} is not in ${chart.scaleName}`);
    }
    if (n.vel <= 0 || n.vel > 1) throw new MaterialError(`${where}: velocity ${n.vel}`);
    const seat = `${at(n)}:${n.pitch}`;
    const other = seats.get(seat);
    if (other !== undefined && other !== part) {
      throw new MaterialError(
        `${where}: ${part} lands on ${other}'s ${noteName(n.pitch)} — two parts on one pitch at one instant`,
      );
    }
    seats.set(seat, part);
  };

  /**
   * THE GROUND IS CHECKED ROUND BY ROUND, and that is the point of the round.
   *
   * Flattened, this compared the bass on its third statement against the keys
   * on their first — two lines that are never in the air together — and would
   * have called a legal record a collision. Two parts can only land on one
   * pitch if they are sounding at the same moment, and "the same moment" now
   * means the same time round.
   */
  const groundSeats: Map<string, Pitched>[] = [];
  const groundRounds = Math.max(...GROOVE.map((p) => m.groove[p].length), 1);
  for (let round = 0; round < groundRounds; round++) {
    const seats = new Map<string, Pitched>();
    for (const part of GROOVE) {
      const line = m.groove[part][Math.min(round, m.groove[part].length - 1)] ?? [];
      for (const n of line) checkNote(part, n, `${m.key} ${part} round ${round} bar ${n.bar} step ${n.step}`, seats);
    }
    groundSeats.push(seats);
  }
  for (const [time, line] of m.lead.entries()) {
    const seats = new Map(groundSeats[Math.min(time, groundSeats.length - 1)] ?? grooveSeats);
    for (const n of line) checkNote("lead", n, `${m.key} lead time ${time} bar ${n.bar} step ${n.step}`, seats);
    // the counter is checked AGAINST THE TUNE OF ITS OWN ROUND, in the same
    // seat map: the two written lines can only collide with each other, and
    // only within a round, so this is where that would show
    for (const n of m.counter[time] ?? []) {
      checkNote("counter", n, `${m.key} counter time ${time} bar ${n.bar} step ${n.step}`, seats);
    }
  }

  for (const [time, hits] of m.drums.entries()) {
    const struck = new Set<string>();
    for (const h of hits) {
      const where = `${m.key} drums time ${time} bar ${h.bar} step ${h.step}`;
      assertInside({ bars: m.bars, steps }, { ...h, dur: 1, pitch: 0 }, where);
      if (!(DRUM_LANES as readonly string[]).includes(h.lane)) throw new MaterialError(`${where}: no lane "${h.lane}"`);
      if (h.vel <= 0 || h.vel > 1) throw new MaterialError(`${where}: velocity ${h.vel}`);
      const seat = `${at(h)}:${h.lane}`;
      if (struck.has(seat)) throw new MaterialError(`${where}: ${h.lane} struck twice at one instant`);
      struck.add(seat);
    }
  }
}

/** "A: Cm7 Ab Fm G | bass 8 · keys 16 · lead 14/14/11/14 · drums 40/38/41/36" — for tests and dumps. */
export function describeMaterial(m: Material): string {
  const groove = GROOVE.map((p) => `${p} ${(m.groove[p][0] ?? []).length}`).join(" · ");
  const lead = m.lead.map((l) => l.length).join("/") || "-";
  const drums = m.drums.map((h) => h.length).join("/") || "-";
  return `${m.key}: ${m.chords.map((c) => c.name).join(" ")} | ${groove} · lead ${lead} · drums ${drums}`;
}
