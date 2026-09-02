# Deckard's Orchestrator MKIII

A seeded record maker. The same genre and seed is the same record, every
time, anywhere: as notes, as a text dump, as a WAV, in the page.

    npm test                                    every test
    npm run check                               types
    node src/cli.ts lofi 42 --summary           one line
    node src/cli.ts lofi 42                     the record as text (tools/FORMAT.md)
    node src/cli.ts lofi 42 --wav out.wav       the record as sound
    npm run build                               "Deckards Orchestrator MKIII.html", one file, open it

Node 22 runs the TypeScript directly. There is no bundler: the build
transpiles `src/` into a forty-line module registry inside `tools/page.html`.

The pipeline is five pure stages and a renderer, each frozen on the way out:
chart, form, arrangement, materials, performance, sound (`src/stage/`,
`src/sound/`). A genre is data (`src/genre/`), resolved once against one
table of defaults and refused at load if anything is wrong; every number a
genre states carries its source in the genre's `sources` map, and a number
without one says `[chosen]`.

Two genres, lofi hip hop and dungeon synth. Five parts — drums, bass, keys,
lead, drone — and six synthesised voices. Every rule is written in beats and
resolved against the genre's own metre, so a genre in five four needs no new
code, only its own numbers.

The sound is a desk (`src/sound/`): each part through a pedal board by its
own feed, placed in a stereo world by azimuth and distance, sent to five
returns — echo, spring, room, ensemble, flange — that can be patched into
each other and themselves, then the inserts on the sum: pole, tape, medium,
vinyl, master. Every knob is the genre's, and the page lays its own
positions over them for a rendering without changing the genre.

The page (`tools/page.html`, built into the single file) is a bridge: a
piano roll, a radar scope for the world, a matrix mixer, a pin matrix for
the patch, the pedal board and the rack, each rack unit with a screen of
its own impulse response.

`Deckards Orchestrator MK2.html` is the previous program, kept whole and
runnable. `tools/dump.mjs` reads its notes out in the same text format.
