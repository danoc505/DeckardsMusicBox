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
   **POSTSCRIPT, after building it: that old comment was right for a
   reason it did not know.** The crossing is stable and it is still gone —
   not for runaway, which the ceiling handled, but because the CYCLE makes
   Chromium render the same song differently every time. So of the four
   effect-to-effect crossings the sources call for, this program can hold
   three: echo→echo, echo→room, and each return's own level. The fourth is
   a blind plate with its numbers.

3. **Feedback needs a governor — and in this engine it needs more than
   that.** "Feedback loops can quickly spiral exponentially into chaos",
   "start the gain very low and raise slowly" [perfectcircuit, via search].
   The room→echo crossing was therefore built with a measured ceiling
   (worst-case loop maxed, impulse in, decay swept: 0.04 fine, 0.08 fine,
   0.12 turns around, 0.16 runs away → cap 0.08). **That was necessary and
   not sufficient, and the crossing was later REMOVED.** A stable loop is
   still a loop, and in WebAudio a loop spanning these nodes costs the
   renderer its repeatability — measured below, and fatal here, because
   Law 7 (same seed, same samples) is what every other measurement in this
   project stands on. See "The design as built" and `MATRIX.none`.
   *The sources are about hardware, where an unrepeatable render is not a
   concept. This is the one place their advice does not transfer, and it
   took building the thing to find out.*

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

## The design as built — SIX rows by THREE columns

*Corrected after the first cut. That version had four rows (the instrument
buses only) and was a send panel wearing the word "matrix". The sources
are explicit that the returns belong in the input list: "inputs can be
sent to multiple effects, and THE EFFECTS CAN BE SENT TO EACH OTHER, AND
EVEN BACK INTO THEMSELVES" [signalsounds]. An effect you cannot patch back
in is not a row, and without those rows the grid cannot do the thing the
grid is for.*

              → MIX (A)      → ECHO (B)     → ROOM (C)
    drums     level          send           send
    bass      level          send           send
    keys      level          send           send
    lead      level          send           send
    echo rtn  return level   FDBK (alias)   WASH (alias)
    room rtn  wet level      — blind        — blind

Eighteen positions: fourteen matrix controls, two ALIASES, two blind.

- **The MIX column** is new and is the reason the drop was impossible. Its
  instrument rows sum into the mix ahead of the master shaper; the two
  return rows land past it, which is where each of them was already wired.
- **The ALIASES** are crossings this program already had a dial for years
  before the grid: the echo's FDBK *is* echo→echo and its WASH *is*
  echo→room. The grid DISPLAYS those controls rather than re-keying seven
  genres' tables. One owner, two panels — the same arrangement the KAOSS
  pad already has with the echo's tone and feedback.
- **room → mix** was `space.wet`, a number only the song could write. As a
  crossing it becomes a knob and an automatable lane, which is what
  putting the returns in the input list buys.
- **room → room** is left blind on purpose; a room feeding itself is a
  longer tail and the impulse response already owns that.
- **room → echo** was BUILT, measured, and then removed. It is the half of
  Hawtin's "delays on the reverbs" sentence this program never had, and it
  worked — but because the echo already feeds the room, it closes a CYCLE,
  and with a cycle present Chromium renders the same song differently every
  time (repeat renders fell from -115 dB apart to -35 dB; it fires even at
  gain zero, and five different topologies all behaved the same, including
  one with no convolver in the loop at all). Law 7 — same seed, same
  samples — is what every measurement in this project stands on, so the
  crossing loses. The numbers are in `MATRIX.none` and the guard is
  `harness/probe_render_determinism.js`. **A matrix mixer in WebAudio can
  route anything to anything except back to where it came from.**

**IT IS A DECLARATION, NOT A HARDCODED GRID.** `const MATRIX = { ins,
outs, alias, none }` is walked by the controls, the audio graph, the
automation and the panel. Adding an input is one entry there plus one
line in `matrixSource()`; the panel grows a row by itself and the seam
battery immediately demands a genre ride the new knobs. The first build
hardcoded four sources in five places, which is exactly the "baked-in
values" the project's first principle is against.

## The panel is the machine, because on this machine the layout IS the information

The first panel wore the DESK skin and rendered three labelled clusters of
knobs. Every knob worked and it was still wrong: on a matrix mixer a
knob's POSITION is what tells you which two things it joins, and reading
down a column or across a row is how you know what is going where. The
A-138m is drawn as it is built — jacks and names down the left, jacks and
names along the bottom, a knob at every crossing, on brushed aluminium.
The numerals 0–10 printed around each knob on the real panel are NOT
reproduced: at this knob size they collided with the value readout, and
the readout is the more useful of the two. The tick arc is.

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

---

# ROUND TWO — 2026-08-03, a second research pass

*The user, after the grid shipped: "Do MORE web research on it and how to
use it, what it is used for. And inform me." Per the standing rule the
first pass does not count toward this one. Five new sources, and three of
them change how I understand the thing we have built.*

## New sources

8. Wikipedia, "Matrix mixer" (fetched in full this time) — the
   PROFESSIONAL definition and the pro-audio use, which the eurorack
   sources never mention
9. Sound On Sound, Erica Synths Matrix Mixer review (fetched) — a 16×16
   with SAVED STATES, and a working musician's account of what changes
10. The Alan R. Pearlman Foundation, "Patching with Switch Matrices"
    (fetched) — the ARP 2500's 10×10 switch matrix, 1970, from the
    foundation of the man who built it
11. Feedback Delay Network literature — Artificial Audio's FDN primer,
    "Scattering in Feedback Delay Networks" (arXiv 1912.08888), the DAFx
    2020 FDN Toolbox paper (via search)
12. ModWiggler / ModularGrid / AI Synthesis AI018 threads on STEREO
    matrix mixers and mid-side (via search)

## 1. The original job is not effects at all: "a mix of mixes"

Every eurorack source treats the matrix as a creative routing toy. The
professional definition is older and more sober, and this program has a
use for it. In live sound a matrix takes SUBGROUPS and builds a separate
tailored blend for each destination — "main arrays, center clusters,
under-balcony speakers, overflow rooms, broadcast feeds" — so the same
band feeds several different mixes at once [wikipedia]. In film and TV
the director gets "a working mix of the project while the mix engineer
puts it together" — a different blend of the same parts, simultaneously.
Named desks: Midas XL4 (8×8), Yamaha M7CL (19×8).

**What that means here:** our three columns are MIX / ECHO / ROOM, all of
which are destinations *inside* one mix. The professional pattern is
columns that are *separate outputs*. The program already renders stems
(`probe_stems`); a stem is exactly a destination column. Noted as a
possibility, not built — it would change what the grid means.

## 2. The ARP 2500 (1970): the grid is older than eurorack, and it failed

ARP replaced Moog's patch cords with colour-coded sliders on a 10×10
matrix. The advantages, in the Pearlman Foundation's own words: the panel
stays "uncluttered and accessible" however complex the patch; setup time
drops; patches can be read and written down at a glance instead of traced
through cable spaghetti; and **"unlimited multiples"** — any number of
inputs can sit on one bus, which cables make awkward.

That is the argument for drawing our panel as a grid, made in 1970 and
independently of dub.

**And it failed for a physical reason:** the mechanical switches leaked
between adjacent buses. Alan Pearlman conceded the system was "a bit
noisier" than patch cables, and ARP went back to cords (normalised) for
the 2600. **The elegant grid had a defect that only showed up once it was
built** — which is exactly the shape of what happened to our room→echo
crossing, for a completely different reason. Worth keeping as a caution:
this idea has a history of being right on paper.

## 3. A REVERB IS A MATRIX MIXER — and this reframes our own failure

The deepest finding of this pass. A Feedback Delay Network — the standard
way artificial reverb is built — is "a set of delay lines connected
through a FEEDBACK MATRIX": every delay's output is mixed back into every
delay's input through a grid of coefficients, and it is that matrix which
turns a handful of discrete echoes into a dense room. The literature
tunes the matrix itself for "echo density and mixing time", and extends
the coefficients into whole FIR filters ("filter feedback matrices") to
emulate scattering off non-flat surfaces [arXiv 1912.08888; DAFx 2020].

So the structure I tried to build and had to remove — signal fed back
through the grid — is not an exotic flourish. **It is what a room IS.**
That explains why every practitioner source leads with feedback, and it
explains why it was so tempting.

It also sharpens why it cannot be done here. An FDN is built INSIDE one
processing routine, sample by sample, where the loop is a line of
arithmetic. We were trying to build it out of WebAudio NODES, where a
loop is a cycle in a graph the browser schedules — and that is the thing
Chromium will not render the same way twice. **The idea is right and the
LAYER was wrong.** If this program ever wants a matrix-fed room, the
honest route is an AudioWorklet doing the FDN arithmetic itself, not
nodes wired in a ring. Recorded as the design, not built.

## 4. What players actually do with one (Erica, 16×16, saved states)

The reviewer's list, none of which needs feedback:

- one LFO into many destinations at different depths — "related but
  different" modulation from a single source
- several sequencers combined for transposition (CV summing)
- the same audio through effects in PARALLEL *or* in SERIES, chosen at
  the grid instead of by repatching
- **saved matrix states recalled for verse/chorus structure** — the
  routing itself becomes part of the arrangement

And the workflow claim, which is the reason the module gets bought: *"The
Matrix Mixer radically changed my approach to Eurorack. It pushed me into
all sorts of ideas."*

**What that means here:** the last one is a real idea we do not have. Our
crossings move CONTINUOUSLY on motion lanes; a *snapshot per section* —
the whole routing changing at a section boundary — is a blunter and more
dub-like gesture, and the program's form already knows where the
boundaries are. Noted as a candidate, not built.

## 5. Mid/side: what the bipolar switch was actually for

The A-138m's per-column unipolar/BIPOLAR switch was refused in round one
as "a CV feature". That was half right and I now know what it buys on
AUDIO: mid = L+R and side = L−R, so **L/R ↔ mid-side conversion is
literally a 2×2 matrix with a negative coefficient**, and the community
uses stereo matrix mixers for exactly that — "L/R ↔ mid/side conversion
or wild stereo phase effects when paired with a filter"
[modwiggler/modulargrid; AI Synthesis AI018].

So a bipolar crossing is a STEREO WIDTH tool, not a mistake. Our grid is
mono-summed per bus and has no stereo rows, so it still does not apply —
but the refusal in round one gave the wrong reason, and the right one is
"our rows are not a stereo pair", not "polarity is only for CV".

## What this round did NOT change

The build stands as it is. Nothing here says the twelve instrument
crossings, the two return levels or the two aliases are wrong, and
nothing here revives room→echo. Three candidates are recorded above for
the user to choose between — stem columns, per-section snapshots, and an
AudioWorklet FDN — and none of them is started.

---

# ROUND THREE — 2026-08-03, deeper: the fader question and the matrix's own mathematics

*The user: "Seems like you need even more info, do a deeper research."
Right again — round two was still a survey. This round found ONE FACT that
the shipped feature depends on and that I had never checked, and ONE BODY
OF MATHEMATICS that says my stability work was done the amateur way.*

## New sources

13. Sweetwater, "Pre Versus Post Fader" and "Pre-Fader, or Post-Fader?";
    Loopmasters, "Understanding Pre and Post Fader" / "Using Pre Fader Aux
    Sends Creatively"; Wikipedia "Aux-send" — the send-tap question
14. Julius O. Smith III, *Physical Audio Signal Processing*, "FDN
    Reverberation" (ccrma.stanford.edu/~jos/pasp) — the standard reference
15. Gerzon's "orthogonal matrix feedback reverberation unit"; Stautner &
    Puckette's four-channel FDN and its stability conditions; the
    lossless-FDN literature (via search on the above)

## 6. PRE-FADER — the fact the whole feature stands on, and I had not checked it

A send can be tapped BEFORE the channel fader or AFTER it, and on a real
desk that is a switch. The difference is the entire dub drop:

> "A pre-fader Aux send is not influenced by channel-fader moves, because
> the signal is sent to the processor through the Aux send before it gets
> to the fader. Therefore the processed signal level remains constant, no
> matter how you move its corresponding channel fader."
> [corpus:sweetwater pre-vs-post]

> "For dub reggae... running the aux sends as pre-fader will get you the
> echo louder than the source effect... allows engineers to mute the dry
> signal while keeping the echo at a constant level."
> [corpus:loopmasters / gearspace dub threads]

**With POST-fader sends, Tubby's move is impossible.** Closing the fader
would pull the echo down with it and the part would simply disappear —
that is a mute, not a drop. The entire reason the gesture exists is that
the send is upstream of the fader.

**CHECKED IN OUR CODE, and we are pre-fader — by accident.** All three
crossings of a row tap the same node (the raw bus); the MIX crossing is a
SIBLING of the ECHO and ROOM crossings, never their parent. Nobody chose
that; it fell out of building the grid as a grid. It is now written down
at `matrixSource()` and, more importantly, MEASURED: probe_matrix's new
"the drop" test closes a row's mix fader with its echo open and requires
the part to still be audible. Jungle, seed 11: **drums muted on the mix,
still heard at -27.9 dB; bass at -35.9 dB.** A refactor that ever chained
the sends off the dry gain would have broken the headline feature in
silence. Now it fails a probe instead.

*Not built, but now a known missing control: a real desk lets you CHOOSE
per send. Our grid is pre-fader everywhere with no switch. For dub that is
the right default; for a reverb that should duck with its source it is
not.*

## 7. The matrix's own mathematics — and my stability sweep was the amateur method

The reverb connection from round two goes deeper than "a reverb contains a
matrix". The FIELD IS ABOUT WHICH MATRIX. Gerzon's original proposal was
an "orthogonal matrix feedback reverberation unit"; Stautner and Puckette
gave the four-channel case and its stability conditions, using what is
"a permutation with one row sign inversion of a Hadamard matrix"
[corpus:JOS PASP, FDN Reverberation].

The load-bearing theorem, and it is a theorem, not a taste:

> All unitary (and orthogonal) matrices have unit-modulus eigenvalues and
> linearly independent eigenvectors. As a result, when used as a feedback
> matrix in an FDN, the resulting FDN will be **lossless**... orthogonal
> matrices such as Hadamard or Householder ensure (critical) stability
> **regardless of the delays**.

Read that against what I actually did when I built room→echo: I picked a
gain, rendered a 30-second tail, swept 0.04 / 0.08 / 0.12 / 0.16, watched
which ones turned around, and set the ceiling at 0.08. That works and it
is honest, but it is measuring a property that the right choice of matrix
would GUARANTEE. **This is principle 1 — "constraints, not baked-in
values" — one level deeper than the program currently applies it.** The
value 0.08 was a baked-in number discovered by experiment; an orthogonal
feedback matrix is a CONSTRAINT under which no experiment is needed and no
delay length can break it.

Different orthogonal matrices then buy different things — Hadamard and
circulant for a dense tail, Householder and sparse ones for cheapness —
so the matrix is a design surface, not a constant.

**What this means for us, plainly:** if a matrix-fed room is ever built
here, it belongs in an AudioWorklet (round two's conclusion) AND its
feedback matrix should be orthogonal by construction (this round's). Then
stability is structural and the ceiling I swept for stops existing as a
concept. Recorded as the design. Still not built — it is a substantial
piece of DSP and the program's room is a convolver today.

## What round three changes in the program

One comment and one probe, no behaviour: `matrixSource()` now states the
pre-fader property and why it is load-bearing, and probe_matrix measures
the drop so the property cannot rot. Everything else here is design notes
for work that has not been started.
