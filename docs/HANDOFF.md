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

**Aim by position, never by speed.** Five earlier versions took the shot's
power from how FAST the hand moved and every one was wrong in the same way:
speed is not something a hand repeats, it means different things on a trackpad
and on glass, and it can only be read at the instant the gesture ends — so the
trajectory line appeared and vanished exactly when it was wanted. Distance has
none of those problems. `APP.aimShot` launches the disc at
`sqrt(2*MU_SURFACE*G*d)` for a cursor `d` away, so it comes to rest under the
cursor: the control is the friction law solved backwards, and there is no
calibration constant in it at all. `harness/crok_physics.js` §1b asserts the
disc really does stop where it was asked to, within 2%.

The one device difference left: glass fires when the touch ends, a trackpad
when the cursor has been still for `AIM_SETTLE`, because a finger leaving a
trackpad sends no event.

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
