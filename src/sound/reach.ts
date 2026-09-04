/**
 * WHAT ON THIS DESK CAN BE HEARD AT ALL.
 *
 * `render.ts` builds only the units something feeds. A return nothing is sent
 * to is never patched in; a filter the genre left out of the sum is never
 * built; a pedal board no part walks is never assembled. That is an economy
 * when you are rendering — and it is a TRAP for any stage that changes the
 * desk, because such a stage reads the genre's numbers and has no way to know
 * that the number it just moved is wired to nothing.
 *
 * `stage/treat.ts` fell into exactly that trap. It refused a treatment whose
 * numbers came out the same as the genre's and offered everything else, so
 * dungeon synth was offered `echoed` — a genre no part of which sends a drop
 * to the echo. The arrangement spent boundaries on it and the record came back
 * BIT-IDENTICAL: the ear was promised a change and heard the section repeat
 * unaltered, which is the one thing the treatments exist to prevent.
 *
 * The rule was never wrong, it was in the wrong place: only the renderer knew
 * it, and it knew it in a private method. So it is stated here, once, and the
 * renderer and the stages that move knobs both ask the same question of it.
 *
 * ASKED OF A GENRE, THESE ARE AN UPPER BOUND. The renderer asks about one
 * record, whose parts are the ones the arrangement actually heard; a stage
 * choosing a genre's vocabulary asks about every part the genre could play.
 * The bound is the right way round: a move refused here is one NO record of
 * this genre could hear, and a move offered may still fall silent in a record
 * that never plays the part it reaches.
 */

import { DRUM_LANES, PEDAL_ORDER, ROLES, SENDS, type DrumLane, type Role, type Send, type SoundRules } from "../genre/spec.ts";

/**
 * Which returns something actually feeds.
 *
 * A part's send, the extra room a distant part gets for free, or one of the
 * drum machine's own lane outputs — the same three ways `Engine.wire` counts,
 * because a fourth way here would be a lie about the record.
 */
export function fedSends(
  S: SoundRules,
  roles: readonly Role[] = ROLES,
  lanes: readonly DrumLane[] = DRUM_LANES,
): Set<Send> {
  const fed = new Set<Send>();
  for (const role of roles) {
    const ch = S.mix[role];
    const roomExtra = S.world.depth * ch.dist * 0.5;
    for (const sd of SENDS) {
      if (ch.sends[sd] + (sd === "room" ? roomExtra : 0) > 0) fed.add(sd);
      if (role === "drums" && lanes.some((lane) => S.machine.channels[lane].sends[sd] > 0)) fed.add(sd);
    }
  }
  return fed;
}

/**
 * Which returns are live: fed by a part, or fed by another live return
 * through the patch matrix.
 *
 * Seeded in `SENDS` order for the same reason `wire` seeds it that way — the
 * order returns are summed in is part of the record's bytes.
 */
export function liveSends(
  S: SoundRules,
  roles: readonly Role[] = ROLES,
  lanes: readonly DrumLane[] = DRUM_LANES,
): Set<Send> {
  const fed = fedSends(S, roles, lanes);
  const live = new Set<Send>();
  for (const sd of SENDS) if (fed.has(sd)) live.add(sd);
  let grew = true;
  while (grew) {
    grew = false;
    for (const from of live) {
      for (const to of SENDS) {
        if (S.patch[from][to] > 0 && !live.has(to)) { live.add(to); grew = true; }
      }
    }
  }
  return live;
}

/**
 * Is the sum's filter in the circuit?
 *
 * `inserts` builds the pole only at `mix > 0`, so on a genre that left it out
 * its cutoff is a number in a struct and nothing else. `darken` knows this and
 * switches the filter in as part of the move; anything that only TURNS the
 * cutoff has to ask first.
 */
export const poleHeard = (S: SoundRules): boolean => S.rack.pole.mix > 0;

/**
 * Does any part walk a board, and is there a pedal on it?
 *
 * Two ways for `mix[role].pedals` to be wired to nothing: no part is sent
 * through the board, or the board is empty because every pedal is at mix 0 —
 * `board()` builds a stage only for a pedal that is up.
 */
export function boardWalked(S: SoundRules, roles: readonly Role[] = ROLES): boolean {
  if (!roles.some((role) => S.mix[role].pedals > 0)) return false;
  return PEDAL_ORDER.some((name) => S.pedals[name].mix > 0);
}

/**
 * Does distance do anything in this world?
 *
 * A part's `dist` reaches the record only through the world's depth: `Channel`
 * scales both the drop in level and the darkening by it, so in a world of no
 * depth every part is equally near however far the desk says it is.
 */
export const depthHeard = (S: SoundRules): boolean => S.world.depth > 0;
