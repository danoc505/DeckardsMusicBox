# Crokinole — the handoff

*Read `RESEARCH.md` with this. That file is where every number came from; this
one is how the program is put together and what is not finished.*

## What it is

`Crokinole.html` — one self-contained file. No build step, no server, no
dependencies, no network, no `Math.random`. Open it in a browser and play.

Practice Mode: local 2-player or against an AI at three difficulties, best of
1/3/5/7 rounds, on a board built to the National Crokinole Association's
tournament standard and scored by their rules.

## The four laws it is written under

1. **Physics first.** The simulation is the game. Rules, rendering, AI and UI
   read the simulation and never fake it. There is no path that moves a disc
   without the solver.
2. **One simulation, two uses.** The trajectory preview and the shot you take are
   *the same call to the same solver on the same state*. A shot is simulated to
   rest the instant it is released; the animation plays back frames the solver
   already produced. The preview cannot disagree with the outcome because there
   is nothing for it to disagree with.
3. **Provenance on every constant.** `[official]` / `[corroborated]` / `[single]`
   / `[measured]` / `[derived]` / `[CALIBRATED]`. A tag that does not match its
   constant is worse than no tag.
4. **Determinism.** Same board, same shot, same result, to the last bit.
   Randomness comes from a seeded generator, so any match replays exactly and any
   bug reproduces.

## Layout inside the file

| Section | What it owns |
|---|---|
| 1 `Rng` | mulberry32, the only source of randomness |
| 1b `SPEC` | **every number in the game**, each with its provenance |
| 2 | vector and angle helpers |
| 3 `GEO` | the board: pegs, quadrants, placement arc, zone scoring, the death line. *No board dimension may appear anywhere downstream of here.* |
| 4 `PHYS` | the solver: coupled friction, impulses, substepping, the ditch and the 20 |
| 5 `RULES` | NCA rules as logic: validity, fouls, banking, the match |
| 6 `INPUT` | pointer plumbing and the velocity fit |
| 7 `RENDER` | procedural wood, the baked board layer, discs, the preview |
| 8 `AI` | candidate shots, board evaluation, difficulty as execution error |
| 9 `SFX` | synthesised impacts, scaled by the real collision impulse |
| 10 `GAME` | the state machine |
| 11 `APP` | screens, HUD, the loop, the host object |

`window.CROK` is the seam. The harness evaluates the shipped file and asks it
questions through that object, so what is tested is what ships.

## The battery — run this before any claim

```sh
node harness/crok_physics.js      # 55 checks: the solver against closed forms
node harness/crok_rules.js        # 91 checks: scoring and rules truth table
node harness/crok_game.js         # 18 checks: whole matches, AI ladder
node harness/crok_ui.js           # 17 checks: real browser, screenshots
```

State at the time of writing: **55 / 91 / 18 / 17, all passing.**
*That line dates the moment it was measured and nothing keeps it true — a count
that disagrees with this file is this file being old.*

`crok_game.js` and `crok_ui.js` are slow (the AI simulates a few hundred
candidate shots per move). `node harness/crok_game.js 10` is the thorough run.

## Decisions worth knowing

**Substepping, not analytic event advancement.** Pool simulators advance exactly
from impact to impact, which works because a ball's motion between impacts has a
closed form. Here the sliding/spinning coupling makes that unpleasant and the peg
cluster makes near-simultaneous contacts common. Instead each substep is short
enough that the *closing* speed of the fastest possible pair moves them less than
`SAFE_ADVANCE` of a disc radius, which is a proven anti-tunnelling bound and is
testable — the harness fires at a peg at ten times full power.

**Pre-simulate, then play back.** Physics never runs on the render clock. A
dropped frame or a 120 Hz iPad changes how smoothly you watch a shot and cannot
change where the discs stop.

**Practice Mode is best-of-X *rounds*, not games.** The NCA hierarchy is round →
game (4 rounds) → match (tournament-defined). A best-of-7 *games* match would be
28 rounds and 448 shots. The NCA 2/1/0 round scoring is kept exactly, and 20s are
tracked separately the way a real scorecard tracks them.

**The flick is a plain gain on movement speed.** It always was; an attempt to
map it through a range with a dead zone at the bottom made gentle swipes come
out at nothing, and was undone. `TOUCH_GAIN` is the original 0.75 brought down
to 0.70 which, with the heavier board, puts every shot at about 70% of the
distance the original travelled for the same swipe while saturating at the same
swipe speed — it responds as it always did and simply goes less far.

**Carrying is a long press, not a slow drag.** Telling carry from flick by
SPEED was wrong: gentle swipes are most swipes, and they were being swallowed.
A press held for `CARRY_HOLD` lifts the disc, with a visible halo; move sooner
and it is a flick. The gesture used every turn is never eaten by the one used
occasionally.

**A finger and a cursor are separate calibrations, and separate gestures.**
A finger crossing the board in a fifth of a second moves about 3 board-widths
per second; a trackpad flick of the same effort throws the cursor at 5 to 12,
because the pointer is accelerated. One mapping cannot serve both — tuning the
range for the trackpad put a finger swipe at 15% power or under the threshold
entirely. Worse, touch was made to go through the trackpad's arming step, so an
un-armed swipe was discarded without a trace: "half the time it doesn't even
register my finger swipe". Glass now has no arming at all (a swipe is the only
thing a swipe could mean), and `FLICK_V*_TOUCH` is calibrated separately from
`FLICK_V*_MOUSE`.

**On glass, carry and flick are told apart by speed.** A finger on the disc may
be sliding it or striking it. Below `CARRY_MAX` it carries; above, it flicks,
and the disc is returned to where the gesture began so the shot is never taken
from an unintended spot.

**The flick response is a mapped range, not a multiplier.** It was a plain
gain calibrated for a finger on glass. A trackpad moves the cursor several
times faster, so every flick a hand could actually make saturated: above about
3200 px/s the shot came out at full power however gently it was meant. That is
what "the discs have no weight" was — there was only one shot in the game and
it was the hardest one. Now movement speed maps across the whole power range
between `FLICK_V0` and `FLICK_V1`, with a sensitivity multiplier in Settings
because trackpads differ by more than any single calibration can cover.

**Friction went from 0.12 to 0.15** — the top of the researched 0.10-0.15
recommendation — because at 0.12 discs ran on after every contact and read as
weightless. `MAX_SLIDE` came down with it, from 2.4 m to 1.6 m.

**The button is clicked, never held.** Click the line to place, click the disc
to arm, then flick the trackpad with nothing pressed — the bare pointer
movement *is* the shot, and it fires on the peak of the gesture as the movement
falls away. Two earlier versions both made the player hold the button down
through the whole gesture, which is the one motion a trackpad is worst at.
A touchscreen has no hover, so there the armed disc is shot with a swipe that
fires on lift-off; that is the only branch on pointerType.

**Tap and flick are separate gestures.** An earlier version made you press on
your own line, drag inward without releasing, and let go at the far end — one
long held gesture doing placement, aiming and firing at once. It is unusable on
a trackpad, where holding a drag across the whole board is the motion the
hardware is worst at, and it is not what flicking a disc feels like either. Now
a disc is always waiting on the line, a tap moves it, and a flick anywhere on
the board shoots in the direction you swiped.

**Difficulty is execution, not worse choices.** The AI finds a good shot and then
misses it. Medium and Hard also re-score their leading candidates through their
own shake and keep the average — which is what a player choosing a shot they can
actually make is doing.

## Not finished

- **No haptics.** iOS Safari does not implement `navigator.vibrate`. Nothing to
  do here until it does.
- **No 3-D view.** Phase 2 in the brief; the renderer is top-down only.
- **Discs cannot stack.** Two dimensions. The NCA's stacking and leaning edge
  cases cannot arise, which is a real difference from a physical board.
- **The Damage Stays Rule never fires.** The surface stands ½″ above the ditch, so
  a disc that has dropped in cannot climb back onto the board.
- **Not tested on real iPad hardware.** Everything here was verified in headless
  Chromium at iPad viewport sizes. Touch latency, ProMotion pacing and real
  finger velocity are the things most likely to need adjustment, and
  `SPEC.FLICK_GAIN` is the knob for the last of them.
- **The 20-hole tipping dynamics are calibrated, not measured.** The geometry is
  exact; how a real disc tips into a 6 mm recess is a 3-D problem this stands in
  for.

## If you change the physics

`SPEC.MU_SURFACE` is the master knob — it sets the whole speed of the game, and
`V_MAX_SHOT` is derived from it and `MAX_SLIDE` so the two cannot drift apart.
Changing it will move the 20-hole window and the AI's power grid (which is
geometric, spaced from the reach-the-15-line speed to full power, precisely so it
follows µ automatically). Re-run the whole battery, and expect
`crok_game.js`'s open-20 rates to move — they are the calibration against real
players.
