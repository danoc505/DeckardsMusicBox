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

There is no flick. Nothing depends on how fast you move.

1. **Click the disc.** (Clicking anywhere else on your own line moves it there
   first.)
2. **Move away from it.** A line draws from the disc to where you are, and a
   dashed ring marks where the disc will stop. **The further from the disc you
   are, the harder it is struck.**
3. **Lift your finger off the trackpad** and it shoots.

**The disc stops where you point.** That is the whole rule — put the cursor on
the 20 and the disc comes to rest on the 20. It falls out of the physics rather
than being arranged: under dry friction a disc launched at `sqrt(2·mu·g·d)`
travels exactly `d`, so the control is the friction law read backwards. To
*hit* something, aim past it, and it arrives with whatever pace it has left.

Because nothing is timed, the trajectory preview holds perfectly still while
you line the shot up, and the same position always gives the same shot.

**With a finger**: press, drag away from the disc, lift off. Same rule.

On a trackpad a finger leaving the pad sends no event — the cursor simply
stops — so the shot goes when the cursor has been still for a moment, with a
ring closing around the disc so the wait is visible. Move again to call it off.

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
