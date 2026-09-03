# Crokinole

A physics-accurate crokinole game in **one self-contained HTML file**.
No build step, no server, no dependencies, no network.

```
Crokinole.html      ← the whole game. Double-click to run.
```

Practice Mode: local 2-player or against an AI at three difficulties, best of
1/3/5/7 rounds, on a board built to the National Crokinole Association's
tournament standard and scored by their rules.

## What is actually being simulated

**The trajectory preview is not an estimate.** The shot is simulated to rest the
instant you release, and the animation plays back frames the solver already
produced. The preview and the outcome are the same call to the same solver, so
they cannot disagree.

**Friction is dry Coulomb, not exponential damping.** Speed falls linearly and a
disc actually *stops*. That is why hitting twice as hard goes four times as far,
which is the touch the real game has — and why this does not feel like air
hockey.

**Sliding and spinning are coupled exactly**, from the closed form in complete
elliptic integrals. A spinning disc runs further and throws what it hits
sideways, but it does not curve: for a flat symmetric disc the friction force is
exactly opposite its travel.

**The board is the published NCA tournament standard** — 26″ surface, scoring
circles at 4/8/12 inch *radii*, a 1⅜″ hole 6 mm deep, eight pegs on the 15
circle offset 22.5° from the quadrant lines so every player faces a clean lane.

## Playing

A finger and a trackpad are different instruments, so the game treats them
differently rather than pretending one gesture suits both.

**With a finger** there is nothing to arm and no mode to be in:

- **Swipe anywhere** to shoot. The direction you swipe is the direction the
  disc goes; how fast you swipe is how hard it is struck. It fires when you
  lift off. Swiping straight off the disc itself works — that is what flicking
  one feels like.
- **Drag the disc slowly** to slide it along your line, or **tap** anywhere on
  the line to put it there. Slow means carrying, fast means shooting; if a drag
  turns into a flick the disc goes back to where you started it, so a shot is
  never taken from somewhere you did not choose.

**With a trackpad or mouse**, holding the button through a drag is the one
motion the hardware is worst at, so the flick is bare cursor movement:

- **Click the disc** — it lights up. Armed.
- **Flick, with nothing held down.** It fires as the flick ends.
- **Drag the disc** to carry it, or **click the line** to place it there.
- Moving the cursor while nothing is armed never does anything.

Either way, a flick too feeble to be meant is refused rather than spent, so a
stray twitch cannot cost you a disc, and the HUD reports what power each shot
came out at.

**If the flick feels wrong, use Settings → Flick sensitivity.** Hands and
trackpads differ by more than any single calibration can cover.

**Settings → Slingshot** is the precise alternative for a delicate 20: arm the
disc, move away from where you want it to go, and click to release. Power is
the distance from the disc, so it holds steady with a full trajectory preview
while you line the angle up.

## Tests

```sh
npm install                     # only needed for the browser probe
node harness/crok_physics.js    # 55 checks: the solver against closed forms
node harness/crok_rules.js      # 91 checks: scoring and rules truth table
node harness/crok_game.js       # 18 checks: whole matches, the AI ladder
node harness/crok_ui.js         # 17 checks: real browser, writes screenshots
```

181 checks. Each probe reads the shipped `Crokinole.html` directly, so what is
tested is what ships.

## Documents

- **`docs/RESEARCH.md`** — every number in the game and where it came from,
  including the five things nearly every source gets wrong.
- **`docs/HANDOFF.md`** — how the file is put together, and what is not finished.
