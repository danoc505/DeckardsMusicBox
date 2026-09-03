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

1. **Pick the disc up and move it.** Press on it and drag along your line, then
   let go. (One is already sitting there when your turn starts, so this is
   optional. Clicking anywhere else on your line moves it there too.)
2. **Click the disc.** It lights up with a pulsing ring — the shot is armed.
3. **Flick.** Just move the trackpad; no button, no drag, nothing held. The
   direction you move is the direction the disc goes and how fast you move is
   how hard it is struck. It fires as the flick ends, and the HUD tells you what
   power it came out at.

Holding is fine in step 1 — you are carrying a disc, not winding up a shot.
Nothing is held in step 3.

Moving the cursor while the disc is *not* armed does nothing, and a flick too
feeble to be meant is refused rather than spent, so a stray twitch cannot cost
you a disc.

**If the flick feels wrong, change Settings → Flick sensitivity.** Trackpads
differ enormously in how many pixels a given hand movement produces. Medium
suits most; Low wants a fast committed flick; High lets a gentle one carry real
power.

On a touchscreen there is no hover, so step 3 is a swipe that fires when you
lift off.

**Settings → Slingshot** is the precise alternative, and the one for a delicate
20: click the disc to arm, move away from where you want it to go, and click
again to release. Power is how far the cursor sits from the disc, so it holds
perfectly steady with a full trajectory preview while you line the angle up.

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
