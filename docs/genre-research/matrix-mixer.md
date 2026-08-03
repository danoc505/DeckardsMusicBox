# THE MATRIX MIXER — how a routing grid creates music, researched

*2026-08-03. The user: "I meant to hook the matrix mixer up to everything it
should be hooked up to. I feel like we need to study euroracks and how they
can create music." This is that study, done before the build per the rules.
The first cut of the matrix (4 buses × echo/room, sends only) was designed
from the dub sources alone; the eurorack literature says what a matrix
mixer actually IS, and it is more than sends.*

## Sources

1. Signal Sounds, "The complete guide to matrix mixers" —
   https://www.signalsounds.com/blog/complete-guide-to-matrix-mixers
   (fetched; the fullest single treatment: history, uses, designer quotes)
2. AI Synthesis, AI008 Matrix Mixer —
   https://aisynthesis.com/product/ai008-eurorack-matrix-mixer/ (fetched;
   concrete patch uses from a module's own manual-page)
3. Wikipedia, "Matrix mixer" — https://en.wikipedia.org/wiki/Matrix_mixer
   (fetched; the definition: a LEVEL at every crossing, not a switch)
4. EMS VCS3 / Synthi pin matrix — vintagesynth.com/electronic-music-studios-ems/vcs3,
   soundonsound.com/reviews/ems-vcs3-retrozone, sdiy.info/wiki/Pin_matrix
   (via search: the 1969 instrument whose PATCHBOARD IS THE INSTRUMENT —
   "by inserting a patch-pin ... it is possible to connect any output with
   any input")
5. King Tubby, the desk played as an instrument —
   intelligentsoundengineering.wordpress.com "King Tubby – Playing the
   mixing desk" (fetched), medium.com/@davidmronan (via search): "route the
   individual parts of his versions through copious amounts of reverb and
   delay, and filter and mute elements with much more control and fluidity;
   this is how dub was born"; "the classic dub records of the 70s were mixed
   in one go, with no overdubs or automation"
6. Perfect Circuit, "Matrix Mixers & How to Use Them" (via search; page 403s):
   feedback loops "can quickly spiral exponentially into chaos", "start the
   gain very low and raise slowly"
7. Already in the corpus and load-bearing here: "filters and delay feedback
   are modulated live, with sends ridden on the mixer to create evolving dub
   mixes" [corpus:attackmagazine Basic-Channel-style], and Hawtin's
   "delays on the reverbs" sentence quoted at the echo's construction site.

## What the sources establish

1. **A matrix mixer is a LEVEL at every crossing.** "Each electronic mixer
   controls the level (gain) of one input going to one output" [wikipedia].
   Not a patchbay of on/off wires — a continuous gain per (source,
   destination) pair. The program's genre routing lists (`feeds`,
   `echoFeeds`) were binary connects; the matrix's job is to make every
   crossing a number a hand and the conductor can ride.

2. **The grid's musical power is FEEDBACK.** Every practitioner source leads
   with it: "run fx back into themselves ... create drones (or just good old
   fashioned feedback)", "mixing effects outputs into their inputs" [AI008];
   "route the output of an effect back into the matrix and connect it to its
   own input" [signalsounds]; designer Aimo Scampa: "the beauty of matrix
   mixers is that they allow you to reroute signals quickly, create
   different parallel signal chains" [signalsounds]. The program already has
   one such crossing (echo→echo, the FDBK knob) and one half-built
   (echo→room, the WASH knob). The missing crossing is ROOM→ECHO — which
   the echo's own build comment names and refuses: "the other half, reverb
   back into the delay, is NOT built: it is a feedback path between two
   effects that would need its own stability work." The eurorack sources
   supply the missing justification AND the missing warning.

3. **Feedback needs a governor.** "Feedback loops can quickly spiral
   exponentially into chaos", "start the gain very low and raise slowly,
   and keep your main output volume low" [perfectcircuit, via search]. So
   the room→echo crossing ships with a HARD CAP dial-max chosen by
   measurement (worst-case loop maxed, impulse in, decay measured), not by
   hope. That is the "stability work" the old comment demanded.

4. **CV over the crossings is standard practice** — the 4ms VCA Matrix is
   a whole module of it, and signalsounds lists "CV control over
   intersections". In this program the conductor's motion lanes ARE the CV:
   genres riding matrix routes (added with the first cut) is the same
   architecture the hardware has.

5. **The lineage runs through both of this program's houses.** The EMS pin
   matrix (1969) made the ROUTING the instrument — the VCS3 is patched by
   populating a grid, and "one builds [the sound] up step by step" on it.
   King Tubby made the DESK the instrument — sends, mutes and a tuned
   filter, performed in one take. The matrix panel is both at once: a grid
   of crossings (EMS) whose levels are performed and ridden (Tubby).

## The design this settles ("hooked up to everything it should be")

Sources are the four role buses plus the two effect RETURNS; destinations
are the two effect inputs. The full grid, minus degenerate crossings:

    drums/bass/keys/lead → echo     4 routes   (built, first cut)
    drums/bass/keys/lead → room     4 routes   (built, first cut)
    echo → echo   the FDBK knob     (existing, kaoss panel — same grid, old crossing)
    echo → room   the WASH knob     (existing, kaoss panel)
    room → echo   NEW               (the feedback crossing, capped + measured)
    room → room   refused           (that is just a longer reverb; the IR
                                     already owns the tail)
    bus → bus     refused           (buses are not effects; nothing to feed)

The two existing knobs stay where they are — moving them would re-key every
genre's params and motion for a cosmetic win; the doc records that the grid
has two of its crossings on the neighbouring panel.

## Marked and refused

- **No-input mixing** (the mixer alone as a drone instrument) — real
  practice, wrong program: it requires the mixer to be unstable BY DESIGN,
  and every law here runs the other way. Noted, not built.
- **Audio into CV / CV into audio** ("sending audio into CV inputs" —
  feedback-patching thread) — the program's control plane is the motion
  system, deliberately not a signal graph. Crossing them is a different
  architecture. Refused.
- **Per-voice matrix rows** (each drum voice as a source) — the TR-1000
  chains already own per-voice sends; duplicating them in the matrix would
  be two owners for one wire. The matrix is bus-level, the chains are
  voice-level, and that split stands.
