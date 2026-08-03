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

## THE ANSWER TO "WHY WOULD WE WANT ONE" — the drop

*The user asked it directly, so it gets its own section rather than being
implied by a build.*

The most famous gesture in this whole lineage is described, knob by knob,
in the Tubby literature: he **"opens the aux send on the drum track with
his left hand and closes the volume of the drum track with the right hand
a split second later, resulting in the drum track being echoed and
disappearing"** [corpus:interruptor.ch dubboard]. Two crossings of ONE
ROW, moved in opposite directions. The instrument leaves the record and
its echo keeps ringing in the hole it left. That is the drop, and it is
why dub sounds like dub.

**This program could not make that move, for a specific and checkable
reason: a bus's DRY level did not exist as a control anywhere in the
file.** All four role buses were wired to the mix at a hardcoded gain of
1 (`for(const name in g.bus) ... connect(g.mix)`), and nothing rode them.
Verified by search before building. So the only way to make a part leave
was to stop writing its notes — an arrangement gap, which is a different
musical event from a drop.

Two further reasons, both measured rather than argued:

- **It is what the KAOSS pad was missing.** probe_kaoss measured the pad's
  loudest possible move at -8 dB (plastikman) to -28 dB (synthwave)
  relative to the mix, because the echo it drives was fed by a fixed list
  no hand could open. With one matrix route opened, the same pad swings
  -9.9 dB on lofi. The pad was never broken; it had nothing to work on.
- **It is how a rack becomes an instrument.** The EMS VCS3 IS its pin
  matrix — "one builds [the sound] up step by step" on the board. Routing
  stops being a decision taken once and becomes something performed.

## The design as built

Sources are the four role buses; destinations are the mix and the two
effect inputs. Twelve crossings, plus the feedback one:

    drums/bass/keys/lead → MIX      4 routes   NEW — the fader Tubby closes
    drums/bass/keys/lead → echo     4 routes
    drums/bass/keys/lead → room     4 routes
    echo → echo   the FDBK knob     (existing, on the kaoss panel)
    echo → room   the WASH knob     (existing, on the kaoss panel)
    room → echo   NEW               (the feedback crossing, capped + measured)
    room → room   refused           (that is just a longer reverb; the IR
                                     already owns the tail)
    bus → bus     refused           (buses are not effects; nothing to feed)

A fourth destination column would be an invention — the program has two
effects and one mix, and a matrix with a destination nothing is plugged
into is decoration. The two existing effect-to-effect knobs stay on the
echo panel; moving them would re-key every genre's params and motion for
a cosmetic win.

NEUTRAL IS THE OLD WIRE. Every dry route's base is 1.0 and a gain node at
1.0 is transparent, so a song nobody touches renders exactly what it
rendered before the grid existed — proven by the 2100-seed snapshot
staying identical and by the blend and UI suites.

## What the stability work found — the real defect

Governing the room→echo crossing required knowing when the loop runs
away, and the measurement exposed a pre-existing bug **on the build
before the matrix** (worktree A/B): at FDBK 0.85 a single kick rang UP
+18 dB over 30 s, and +36 dB with the repeat-cut at 600 Hz.

**Cause: WebAudio's `Q` on `lowpass`/`highpass` is DECIBELS of corner
resonance, not a quality factor.** The echo's loop filters shipped at Q
0.6 and 0.5 — textbook "no resonance" numbers — and were therefore
PEAKING. Measured with `getFrequencyResponse`: x1.21 each, x1.344 for the
cascade, so a 0.85 feedback dial became a loop gain of 1.14. Above unity
is a howl, and this is very probably the user's long-standing "it starts
to build and the program starts to stutter and glitch out" report.

Fixed at Q = -3 dB, where the measured cascade peak is exactly 1.0000 —
a passive knee, so loop gain can never exceed the FDBK dial. Every other
Q in the file is a colour on a ONE-WAY path and was left alone; only a
filter inside a loop has a stability duty.

The governor itself was then swept on the fixed build (`probe_matrix`,
worst case = FDBK 0.85 + WASH 1.0 + SEND 1.0 + a route wide open, one
kick, 30 s): **0.04 decays to silence, 0.08 decays monotonically, 0.12
falls then climbs back (-46 → -35 dB), 0.16 and 0.20 run away.** Ceiling
set to 0.08 — the largest swept value that never turns around.

## Marked and refused

- **The A-138m's unipolar/BIPOLAR switch**, where "the controls work as
  polarizers" and counter-clockwise "subtracts from the output sum".
  That is a CONTROL-VOLTAGE feature on a DC-coupled module. Every
  crossing here carries audio, where a negative send is phase inversion
  against the dry path — comb filtering nobody asked for. Refused.
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
- **The A-138m's DC-offset jumper** (top row generates offsets with
  nothing patched) — a modular convenience with no meaning here.
