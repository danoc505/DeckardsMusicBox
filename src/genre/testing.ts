/**
 * Fixtures for tests that need a genre in a metre the defaults were not
 * written for. The defaults declare rhythm in beats of a four-beat bar; a
 * three-beat genre has to say where its own feet fall, and a test that only
 * wants to exercise the metre should not have to spell that out each time.
 */

import type { GenreSpec } from "./spec.ts";

/**
 * A ceiling that any tempo a fixture invents can satisfy.
 *
 * The intro pool and `form.introSec` have to agree — a declared length that
 * cannot fit under the ceiling at the genre's fastest tempo is refused at
 * load, because that is how both real genres came to carry an intro length
 * that was never once drawn. A fixture inventing a slow tempo to test
 * something else should not have to work the arithmetic out, so it says this
 * instead: the default 8-bar intro is 20.3 s at 71 bpm and longer still at 60,
 * and 64 clears the slowest bar any of these fixtures ask for.
 */
export const anyTempoIntro = { form: { introSec: 64 } } as const;

/** Everything a genre in `beats`/`perBeat` must declare to load. */
export function metreFixture(beats: number, perBeat: number): Omit<GenreSpec, "label"> {
  const last = beats - 1;
  return {
    metre: { beats, perBeat },
    // a longer bar is a longer intro at the same tempo, so the ceiling has to
    // come with the metre: 8 bars of six beats at 120 bpm is 24 s, which the
    // default 20 refuses at load
    ...anyTempoIntro,
    bass: { pocket: [[[0, Math.floor(beats / 2)], 1]] },
    keys: { strike: [[[0], 1]] },
    lead: { rhythms: [[Array.from({ length: beats * 2 - 1 }, (_, i) => i), 1]] },
    drums: { kick: [[[0], 1]], snare: [[[last], 1]], hat: [[1, 1]] },
  };
}
