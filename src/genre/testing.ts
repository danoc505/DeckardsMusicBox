/**
 * Fixtures for tests that need a genre in a metre the defaults were not
 * written for. The defaults declare rhythm in beats of a four-beat bar; a
 * three-beat genre has to say where its own feet fall, and a test that only
 * wants to exercise the metre should not have to spell that out each time.
 */

import type { GenreSpec } from "./spec.ts";

/** Everything a genre in `beats`/`perBeat` must declare to load. */
export function metreFixture(beats: number, perBeat: number): Omit<GenreSpec, "label"> {
  const last = beats - 1;
  return {
    metre: { beats, perBeat },
    bass: { pocket: [[[0, Math.floor(beats / 2)], 1]] },
    keys: { strike: [[[0], 1]] },
    lead: { rhythms: [[Array.from({ length: beats * 2 - 1 }, (_, i) => i), 1]] },
    drums: { kick: [[[0], 1]], snare: [[[last], 1]], hat: [[1, 1]] },
  };
}
