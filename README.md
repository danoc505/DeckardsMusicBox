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

**To move the disc:** press on it and drag. It slides along your line; let go
to drop it. It glows white when the pointer is over it, so you can see it is
something you can pick up.

**To shoot**, aim first and then time the bar, the way a golf game does it:

1. **Move to where you want the disc to go.** A line points that way. No power
   is committed yet.
2. **Press and hold, anywhere away from the disc.** A bar sweeps up and down
   beside it, and the trajectory line grows and shrinks with the bar — so you
   can see where each level of power puts the disc before choosing one.
3. **Let go.** It shoots at whatever the bar reads.

Where you press decides what the press means, and nothing depends on how long
you hold it: on the disc is moving, away from it is shooting. A press too short
to start the bar costs nothing.

Everything before this took the force from how the hand *moved* — how fast it
swiped, or how far from the disc it sat. All of it had the same defect: the
number was a side effect of moving, so it could not be watched while it was
being chosen, and it could not be repeated. A bar can be.

**With a finger**: press the board away from the disc and hold, drag to adjust
the aim, lift off to shoot. Press on the disc instead to slide it.

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
