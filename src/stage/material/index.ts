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
import { DRUM_LANES, PITCHED_ROLES, type Contour, type Element, type Idea, type Register, type Role, type Texture } from "../../genre/spec.ts";
import type { Rng } from "../../core/rng.ts";
import type { Arrangement } from "../arrange.ts";
import type { Chart } from "../chart.ts";
import { drawBass } from "./bass.ts";
import { drawDrone } from "./drone.ts";
import { drawDrums, drawFigure } from "./drums.ts";
import { drawArp } from "./arp.ts";
import { drawCounter } from "./counter.ts";
import { drawChords, harmonicPeriod } from "./harmony.ts";
import { drawKeys } from "./keys.ts";
import { contourOf, drawLead, ladder, lawsFor } from "./lead.ts";
import { assertInside, at, GROOVE, Sounding, type Chord, type Hit, type Material, type Note, type Pitched } from "./note.ts";
import { CHANGES, otherChange, varyLine, type Change } from "./vary.ts";

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
}

function timesRound(arrangement: Arrangement, bars: number): ReadonlyMap<string, Rounds> {
  const times = new Map<string, Map<Role, number>>();
  const opens = new Map<string, Map<Role, Set<number>>>();
  for (const p of arrangement.placed) {
    const per = times.get(p.material) ?? new Map<Role, number>();
    const firsts = opens.get(p.material) ?? new Map<Role, Set<number>>();
    for (const role of p.heard) {
      const before = per.get(role) ?? 0;
      (firsts.get(role) ?? firsts.set(role, new Set()).get(role)!).add(before);
      per.set(role, before + Math.ceil(p.section.bars / bars));
    }
    times.set(p.material, per);
    opens.set(p.material, firsts);
  }
  const out = new Map<string, Rounds>();
  for (const [key, per] of times) out.set(key, { times: per, opens: opens.get(key)! });
  return out;
}

export function makeMaterials(chart: Chart, arrangement: Arrangement): Materials {
  const steps = stepsPerBar(chart.metre);
  const bars = chart.genre.harmony.bars;
  const rounds = timesRound(arrangement, bars);

  const chordsOf = new Map<Idea, readonly Chord[]>();
  const all = new Map<string, Material>();

  // PLAIN STATEMENTS FIRST, so a variant has the thing it varies. A variant
  // is a descendant and not a sibling: it inherits its groove note for note
  // and changes the beat and the tune, which is what makes it the same idea
  // coming back rather than a different section over the same chords.
  const order = [...rounds.keys()].sort((a, b) => {
    const v = (k: string): number => (k.includes("/") ? Number(k.split("/")[1]) : 0);
    return v(a) - v(b) || a.localeCompare(b);
  });

  for (const key of order) {
    const { times, opens } = rounds.get(key)!;
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
          line = tile(drawBass(chart, loop, seatRng, steps, figure.kick, register));
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

    const groove = Object.freeze((() => {
      const drawnBass = plain
        ? plain.groove.bass
        : serve("bass", chart.register.bass, sounding);
      sounding.add(drawnBass, bars, steps);
      inLoop.add(drawnBass, period, steps);
      // the drone stands on the key, not the chord, so it is written before
      // anything that follows the changes — and it is NOT tiled: a drone is a
      // held tone whose whole nature is to be longer than the loop under it
      const drawnDrone = plain
        ? plain.groove.drone
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
      const drawnKeys = serve("keys", chart.register.keys, inLoop);
      sounding.add(drawnKeys, bars, steps);
      inLoop.add(drawnKeys, period, steps);
      return { bass: drawnBass, keys: drawnKeys, drone: drawnDrone };
    })());
    for (const n of groove.bass) taken.add(`${at(n)}:${n.pitch}`);
    for (const n of groove.drone) taken.add(`${at(n)}:${n.pitch}`);

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
    const lead = Object.freeze(letters.map((l) => (l === "A" ? tune ?? tacet : l === "B" ? developed ?? tune ?? tacet : tacet)));

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
          withTune.add([...groove.bass, ...groove.keys, ...groove.drone], period, steps);
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
          return line;
        })())),
    );

    // THE TREATMENTS CYCLE. A record has as many distinct treatments of a
    // figure as the genre says, and plays them round and round — the same
    // beat coming back, which is the only way a beat becomes one. Drawn per
    // time round, a sixty-four-bar record over a four-bar material had
    // sixteen different beats in it and repeated none of them.
    const treatments = Math.max(1, chart.genre.drums.treatments);
    const cut = new Map<number, readonly Hit[]>();
    const drums = Object.freeze(
      Array.from({ length: times.get("drums") ?? 0 }, (_, n) => {
        // A VARIANT TAKES THE NEXT BEAT ALONG. "Changing the drum beat works
        // every time, and you could keep everything exactly the same way and
        // change just the drum beat and it instantly feels different"
        // (secretsofsongwriting.com, "The Main Differences Between Verse 1 and
        // Verse 2") — the cheapest change there is, and the strongest.
        const which = (n + variant) % treatments;
        const already = cut.get(which);
        if (already !== undefined) return already;
        const made = Object.freeze(drawDrums(chart, rng.at("drums"), figure, bars, steps, which));
        cut.set(which, made);
        return made;
      }),
    );

    served["lead"] = { element: "lead", texture: "line" };
    const material: Material = Object.freeze({
      key, idea, variant, contour, bars, period, chords, groove, lead, counter, figure, drums,
      served: Object.freeze(served) as Material["served"],
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

  for (const part of GROOVE) {
    for (const n of m.groove[part]) checkNote(part, n, `${m.key} ${part} bar ${n.bar} step ${n.step}`, grooveSeats);
  }
  for (const [time, line] of m.lead.entries()) {
    const seats = new Map(grooveSeats);
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
  const groove = GROOVE.map((p) => `${p} ${m.groove[p].length}`).join(" · ");
  const lead = m.lead.map((l) => l.length).join("/") || "-";
  const drums = m.drums.map((h) => h.length).join("/") || "-";
  return `${m.key}: ${m.chords.map((c) => c.name).join(" ")} | ${groove} · lead ${lead} · drums ${drums}`;
}
