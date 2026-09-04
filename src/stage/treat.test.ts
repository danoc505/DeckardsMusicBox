/**
 * A TREATMENT HAS TO MOVE THE RECORD, and until this file nothing said so.
 *
 * Twelve treatments were built, weighted by two genres, scored by the
 * arrangement and rendered — and the only thing holding any of it to its
 * purpose was one assertion in `sound/render.test.ts` that the record with its
 * whole desk timeline differs from the record with none. That passes while
 * ELEVEN of the twelve do nothing, because one of them moved.
 *
 * Two of them did nothing, and nobody could have known:
 *
 *   `echoed` on dungeon synth, whose every part sends 0 to the echo and whose
 *   patch matrix feeds it from nothing. The renderer never built the unit, so
 *   the treatment moved two numbers in a struct and the record came back
 *   bit-identical.
 *
 *   `brighten` on lofi, whose pole sits at mix 0 — out of the sum, never
 *   built — leaving only a tape lowpass raised from 10 to 13.5 kHz over
 *   voices with nothing up there. −37.7 dB, and 18% of every treated span the
 *   genre had.
 *
 * So this file asks the question the build never asked: for every genre, for
 * every treatment it offers, does the record CHANGE. It is the cheapest test
 * in the program to have written and it was the one missing.
 *
 * WHAT THE FLOOR IS AND IS NOT. `FLOOR_DB` is a no-op detector, not a
 * threshold of hearing. Below it a treatment is arithmetic that cancelled;
 * above it the change exists and how much of it a listener notices is a
 * question no measurement here can settle — `docs/TALLY.md` §0 still stands
 * and the ranking these numbers give is in `docs/genre-research/
 * THE-ALTERATIONS.md`, for whoever plays the records.
 *
 * AND IT IS MEASURED AT A SAMPLE RATE THE DESK CAN MOVE AT, which is not a
 * detail. `Pole` holds its state-variable filter stable by clamping the
 * cutoff at `sampleRate / 6` and `Biquad` clamps at `sampleRate * 0.49`, so at
 * the 8 kHz the desk tests used to run at, dungeon synth's pole is pinned at
 * 1333 Hz and its tape at 3920, and `darken` — the move this genre's own
 * literature names, and 39% of its treated time — is EXACTLY a no-op. The
 * treatments were tested at the one rate at which the headline treatment
 * cannot be heard.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { compose } from "../song.ts";
import { GENRE_NAMES, genre } from "../genre/index.ts";
import { TREATMENTS, type Treatment } from "../genre/spec.ts";
import { Engine, render, rms } from "../sound/render.ts";
import { boardWalked, depthHeard, liveSends, poleHeard } from "../sound/reach.ts";
import { deskOf, offeredBy, specOf } from "./treat.ts";

/** Above the pole's `sr/6` and the biquad's `sr*0.49` for every genre's filters. */
const SR = 22050;
const SECONDS = 15;
const SEED = 2;

type Name = (typeof GENRE_NAMES)[number];

/** One record per genre, and one rendering of it untreated: every treatment is measured against that. */
const untreated = new Map<Name, { song: ReturnType<typeof compose>; flat: ReturnType<typeof compose>; base: ReturnType<typeof render>; level: number }>();
function baseline(g: Name): NonNullable<ReturnType<typeof untreated.get>> {
  let held = untreated.get(g);
  if (held === undefined) {
    const song = compose({ seed: SEED, genre: g, seconds: SECONDS });
    const flat = { ...song, performance: { ...song.performance, desk: [] } };
    const base = render(flat, { sampleRate: SR });
    held = { song, flat, base, level: rms(base) };
    untreated.set(g, held);
  }
  return held;
}

/**
 * How far a treatment moved the record: the difference signal's level against
 * the record's own, in dB. Zero difference comes out around −220 dB, which is
 * the floor of the arithmetic and not a small change.
 *
 * THE MOVE IS LAID ON AS A DESK AND NOT AS A TREATMENT, which is the whole
 * reason a refusal can be tested at all. Put on the timeline it would go
 * through `deskOf`, which refuses it and hands the renderer nothing, so every
 * refused treatment would measure as no change BECAUSE IT WAS REFUSED — a
 * test that agrees with itself and checks nothing. `specOf` is the move
 * unfiltered, and `render`'s own desk override holds it over the whole record.
 *
 * `specOf` itself returns null for the handful of moves that have nothing to
 * WRITE on a given desk — a board with one box has no box to swap to, a record
 * feeding one return has no second return to patch into — and that is not a
 * refusal, it is the move being undefined here. No desk goes on, the record
 * comes back as it was, and 0 dB is the truthful number.
 */
function movedBy(g: Name, t: Treatment): number {
  const { flat, base, level } = baseline(g);
  const spec = specOf(t, genre(g).sound);
  const out = render(flat, { sampleRate: SR, ...(spec === null ? {} : { desk: spec }) });
  let d = 0;
  for (let i = 0; i < out.left.length; i++) {
    const a = out.left[i]! - base.left[i]!;
    const b = out.right[i]! - base.right[i]!;
    d += a * a + b * b;
  }
  const diff = Math.sqrt(d / (out.left.length * 2));
  return 20 * Math.log10((diff || 1e-12) / (level || 1e-12));
}

/** Below this a treatment did not happen. See the header: it is not a threshold of hearing. */
const FLOOR_DB = -40;

for (const g of GENRE_NAMES) {
  test(`every treatment ${g} offers moves the record`, () => {
    const offered = offeredBy(genre(g).sound);
    assert.ok(offered.length > 0, `${g} offers no treatment at all`);
    for (const t of offered) {
      const moved = movedBy(g, t);
      assert.ok(moved > FLOOR_DB, `${g} offers ${t} and the record does not move: ${moved.toFixed(1)} dB`);
    }
  });

  /**
   * The other half of the same law, and it is not the same test twice.
   *
   * A refusal costs the record a move it could have made, so it has to be
   * grounded in something about this genre's desk rather than in taste. Every
   * refusal names a unit the genre does not have — no echo fed, no pole in the
   * sum, no part on the board, no depth in the world — and this asserts that
   * ground actually holds. It fails if someone refuses a treatment for a
   * reason the desk does not support.
   *
   * AND THE REFUSAL MAY NOT BE THE LOUDEST THING THE GENRE HAD. That check is
   * the crude one and the one that would catch a wrong refusal fastest: a move
   * thrown away must be quieter than every move kept. lofi's `brighten` is
   * −36.9 dB where the quietest thing it kept is −30.0 — refused for having no
   * filter to open, and the measurement agrees it was the faintest of them.
   */
  test(`every treatment ${g} refuses names a unit this genre has not got`, () => {
    const S = genre(g).sound;
    const offered = offeredBy(S);
    const live = liveSends(S);
    const quietest = Math.min(...offered.map((t) => movedBy(g, t)));
    for (const t of TREATMENTS) {
      if (offered.includes(t)) continue;
      const moved = movedBy(g, t);
      const ground: Record<string, boolean> = {
        // the numbers never moved: `changes` refused it and not `reaches`, so
        // there is nothing for the desk to explain
        "nothing moved at all": moved < FLOOR_DB,
        "no echo is fed": t === "echoed" && !live.has("echo"),
        "no reverb is fed": (t === "drench" || t === "dry") && !live.has("room") && !live.has("spring"),
        "no pole in the sum": t === "brighten" && !poleHeard(S),
        "no part walks the board": (t === "push" || t === "ease") && !boardWalked(S),
        "the world is flat": (t === "far" || t === "close") && !depthHeard(S),
      };
      const why = Object.entries(ground).filter(([, held]) => held).map(([name]) => name);
      assert.ok(why.length > 0, `${g} refuses ${t} at ${moved.toFixed(1)} dB and nothing about its desk says why`);
      assert.ok(
        moved < quietest,
        `${g} refuses ${t} at ${moved.toFixed(1)} dB, louder than the quietest it kept (${quietest.toFixed(1)} dB)`,
      );
    }
  });

  /**
   * `sound/reach.ts` states the renderer's own rule about which returns are
   * built, so it can be asked before a note exists. If the two ever disagree,
   * the treatments go back to being offered on faith.
   */
  test(`what reach calls live is what ${g} actually patches in`, () => {
    const engine = new Engine(baseline(g).song, { sampleRate: SR });
    const live = liveSends(genre(g).sound);
    for (const sd of engine.liveReturns) {
      assert.ok(live.has(sd), `the record patches ${sd} in and reach.ts calls it dead`);
    }
  });

  /** The specific hole, stated as a law rather than as a fixture. */
  test(`${g} is never offered a return nothing feeds`, () => {
    const S = genre(g).sound;
    const live = liveSends(S);
    const offered = offeredBy(S);
    if (!live.has("echo")) assert.ok(!offered.includes("echoed"), `${g} feeds no echo and is offered echoed`);
    if (!live.has("room") && !live.has("spring")) {
      assert.ok(!offered.includes("drench"), `${g} feeds no reverb and is offered drench`);
      assert.ok(!offered.includes("dry"), `${g} feeds no reverb and is offered dry`);
    }
  });
}

test("a treatment is a pure function of the desk it is handed", () => {
  // The whole block-size guarantee rests on this: span seventeen's desk is the
  // base and its treatment and nothing that happened before it.
  for (const g of GENRE_NAMES) {
    const S = genre(g).sound;
    for (const t of TREATMENTS) {
      assert.deepEqual(deskOf(t, S), deskOf(t, S), `${g}/${t} is not the same twice`);
    }
  }
});
