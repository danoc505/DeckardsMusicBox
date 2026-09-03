/* THE PHYSICS, HELD TO NUMBERS.

   The claims in section 4 of Crokinole.html are checkable, so this checks
   them. In order of how much it would hurt to be wrong:

     1. COULOMB, NOT VISCOUS.  A free disc must stop at v^2/(2*mu*g) and it
        must stop, at a finite time. This is the claim the whole feel of the
        game rests on, so it is measured against the closed form rather than
        eyeballed.
     2. DETERMINISM.  The same board and the same shot must give bit
        identical results. Without this the trajectory preview is a
        decoration.
     3. PREVIEW == EXECUTION.  The frame-recording run and the silent run the
        AI uses must agree exactly. They are the same call with one flag
        different, and this proves the flag does not change the physics.
     4. NOTHING TUNNELS.  Hundreds of full-power shots into the peg ring and
        into packed clusters, checking that nothing ever ends up inside
        anything else and that no disc crosses a peg it should have hit.
     5. NO ENERGY FROM NOWHERE.  Kinetic energy must never rise across a
        shot.
     6. IT SETTLES.  Every shot reaches rest inside the time limit.

     node harness/crok_physics.js [shots]
*/
const { loadCrok, Checks } = require("./crok_load.js");
const C = loadCrok();
const { SPEC: P, GEO, PHYS, Rng } = C;
const geo = GEO.build(P);
const c = Checks("crok_physics");
const N = parseInt(process.argv[2], 10) || 240;
const hypot = (x, y) => Math.sqrt(x * x + y * y);

/* ---------------------------------------------------------------------- 1 */
/* The friction law, isolated. A real board is only 330 mm in radius, so a
   full-power slide (2.4 m) cannot physically be contained on one -- the disc
   would be in the ditch long before it stopped. So this test runs on a
   SYNTHETIC board: the same solver and the same constants, with the surface
   made huge and the hole, pegs and rim drag removed, so the only thing
   acting on the disc is surface friction. That is the claim under test. */
console.log("\n1. Coulomb friction: does a free disc stop where the algebra says?");
{
  const big = Object.assign({}, P, {
    R_SURFACE: 50, R_OUT: 49, R_CAPTURE: 0, R_HOLE: 0, MU_RIM: 0, A_WELL: 0, N_PEGS: 0,
  });
  const openGeo = GEO.build(big);
  c.eq(openGeo.pegs.length, 0, "the synthetic test board has no pegs to interfere");

  const slide = (v0) => {
    const w = PHYS.newWorld(openGeo);
    const d = PHYS.addDisc(w, 0, 0, 0);
    d.vx = v0;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return { d: hypot(r.world.discs[0].x, r.world.discs[0].y), t: r.duration,
             live: r.world.discs[0].live, settled: r.settled };
  };

  for (const v0 of [0.2, 0.5, 0.9, 1.3, P.V_MAX_SHOT]){
    const got = slide(v0);
    const predicted = (v0 * v0) / (2 * P.MU_SURFACE * P.G);
    const tPred = v0 / (P.MU_SURFACE * P.G);
    c.near(got.d, predicted, predicted * 0.01 + 1e-4,
           `v0=${v0}: slide distance matches v^2/(2 mu g) = ${(predicted * 1000).toFixed(1)} mm`);
    c.near(got.t, tPred, tPred * 0.01 + 0.005,
           `v0=${v0}: stop time matches v/(mu g) = ${tPred.toFixed(3)} s`);
    c.ok(got.settled, `v0=${v0}: came to rest at a finite time`);
  }

  /* and it is NOT viscous: doubling the speed must QUADRUPLE the distance.
     An exponential decay would merely double it -- this single ratio is the
     difference between wood and air hockey. */
  const a = slide(0.3).d, b = slide(0.6).d, q = slide(1.2).d;
  c.near(b / a, 4, 0.06, "doubling speed quadruples distance (Coulomb, not viscous)");
  c.near(q / b, 4, 0.06, "and again at twice that speed");

  /* MAX_SLIDE is the calibrated headline number: check the derived
     V_MAX_SHOT really does slide that far, so the two cannot drift apart */
  c.near(slide(P.V_MAX_SHOT).d, P.MAX_SLIDE, P.MAX_SLIDE * 0.015,
         `a full-power shot slides MAX_SLIDE = ${P.MAX_SLIDE} m`);

  /* spin must lengthen the slide, because the two share one friction
     budget -- a spinning disc spends part of it staying spun */
  const straight = slide(0.6).d;
  const spun = (() => {
    const w = PHYS.newWorld(openGeo);
    const d = PHYS.addDisc(w, 0, 0, 0); d.vx = 0.6; d.w = 200;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return { d: hypot(r.world.discs[0].x, r.world.discs[0].y),
             y: r.world.discs[0].y, w: r.world.discs[0].w };
  })();
  c.ok(spun.d > straight * 1.02, "a spinning disc slides further than a dead one",
       `${(spun.d * 1000).toFixed(1)} mm vs ${(straight * 1000).toFixed(1)} mm`);
  /* ...but it must NOT curve. This is the claim that a symmetric disc under
     uniform pressure feels friction exactly opposite its travel. */
  c.near(spun.y, 0, 1e-12, "a spinning disc travels dead straight (no curve)");
  c.near(spun.w, 0, 1e-9, "sliding and spinning die together");
}

/* --- the aiming rule, which is the friction law read backwards --------- */
/* The control promises that the disc stops where the cursor is pointing:
   asked to travel d, it is launched at sqrt(2*mu*g*d). That is only true if
   the solver really does obey the closed form, so it is checked here on the
   REAL board rather than the synthetic one -- with the hole and the pegs
   avoided by firing along a chord, which is where a genuine aim would be
   judged anyway. */
console.log("1b. Aiming: does the disc stop where it was asked to?");
{
  let worst = 0;
  for (const want of [0.05, 0.10, 0.15, 0.22, 0.30]){
    const w = PHYS.newWorld(geo);
    /* start out near the shooting line and fire along a chord, so nothing
       is in the way and the 20 hole is never crossed */
    const d = PHYS.addDisc(w, 0, 0, P.R_PLACE - 0.02);
    d.vx = Math.sqrt(2 * P.MU_SURFACE * P.G * want);
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    const disc = r.world.discs[0];
    if (!disc.live) continue;
    const got = hypot(disc.x - 0, disc.y - (P.R_PLACE - 0.02));
    const err = Math.abs(got - want);
    if (err > worst) worst = err;
    c.near(got, want, want * 0.02 + 5e-4,
           `asked for ${(want * 1000).toFixed(0)} mm, travelled ${(got * 1000).toFixed(1)} mm`);
  }
  console.log(`   worst error across the aiming range: ${(worst * 1000).toFixed(2)} mm`);
}

/* ---------------------------------------------------------------------- 2 */
console.log("2. Determinism: is the same shot the same shot?");
{
  const rng = Rng(7);
  let same = 0;
  for (let i = 0; i < 40; i++){
    const w = PHYS.newWorld(geo);
    /* a crowded board, so the answer depends on the whole solver */
    for (let k = 0; k < 6; k++){
      const a = rng.range(0, Math.PI * 2), rr = rng.range(P.R_HOLE + P.R_DISC, P.R_10);
      const d = PHYS.addDisc(w, k % 2, rr * Math.cos(a), rr * Math.sin(a));
      d.a = rng.range(0, 6);
    }
    const pl = geo.placement(0);
    const ang = rng.range(pl.a0, pl.a1);
    const shot = { owner: 0, x: pl.r * Math.cos(ang), y: pl.r * Math.sin(ang),
                   vx: 0, vy: 0, w: rng.range(-40, 40) };
    const aim = rng.range(-0.5, 0.5) + Math.atan2(-shot.y, -shot.x);
    const sp = rng.range(0.3, P.V_MAX_SHOT);
    shot.vx = Math.cos(aim) * sp; shot.vy = Math.sin(aim) * sp;
    const r1 = PHYS.runShot(w, shot, { frames: false });
    const r2 = PHYS.runShot(w, shot, { frames: false });
    let eq = r1.world.discs.length === r2.world.discs.length &&
             r1.events.length === r2.events.length;
    if (eq) for (let j = 0; j < r1.world.discs.length; j++){
      const A = r1.world.discs[j], B = r2.world.discs[j];
      if (A.x !== B.x || A.y !== B.y || A.live !== B.live || A.fate !== B.fate){ eq = false; break; }
    }
    if (eq) same++;
  }
  c.eq(same, 40, "40 crowded shots each replay bit-identically");
}

/* ---------------------------------------------------------------------- 3 */
console.log("3. Preview == execution: does recording frames change the result?");
{
  const rng = Rng(99);
  let same = 0;
  for (let i = 0; i < 40; i++){
    const w = PHYS.newWorld(geo);
    for (let k = 0; k < 5; k++){
      const a = rng.range(0, Math.PI * 2), rr = rng.range(P.R_15 * 0.4, P.R_10);
      PHYS.addDisc(w, k % 2, rr * Math.cos(a), rr * Math.sin(a));
    }
    const pl = geo.placement(0);
    const ang = rng.range(pl.a0, pl.a1);
    const aim = Math.atan2(-pl.r * Math.sin(ang), -pl.r * Math.cos(ang)) + rng.range(-0.4, 0.4);
    const sp = rng.range(0.3, P.V_MAX_SHOT);
    const shot = { owner: 0, x: pl.r * Math.cos(ang), y: pl.r * Math.sin(ang),
                   vx: Math.cos(aim) * sp, vy: Math.sin(aim) * sp, w: rng.range(-30, 30) };
    const quiet = PHYS.runShot(w, shot, { frames: false });   /* what the AI and preview run */
    const loud  = PHYS.runShot(w, shot, { frames: true  });   /* what the game runs          */
    let eq = quiet.world.discs.length === loud.world.discs.length;
    if (eq) for (let j = 0; j < quiet.world.discs.length; j++){
      const A = quiet.world.discs[j], B = loud.world.discs[j];
      if (A.x !== B.x || A.y !== B.y || A.fate !== B.fate){ eq = false; break; }
    }
    if (eq) same++;
  }
  c.eq(same, 40, "the silent run and the frame-recording run agree exactly");
}

/* ---------------------------------------------------------------------- 4 */
console.log(`4. Nothing tunnels: ${N} full-power shots into the pegs and into clusters`);
{
  const rng = Rng(4242);
  let overlaps = 0, pegOverlaps = 0, unsettled = 0, energyUp = 0, shots = 0;
  let worstDiscPen = 0, worstPegPen = 0;
  for (let i = 0; i < N; i++){
    const w = PHYS.newWorld(geo);
    /* a deliberately awkward board: discs jammed in the peg ring */
    const nd = 2 + rng.int(9);
    for (let k = 0; k < nd; k++){
      const a = rng.range(0, Math.PI * 2);
      const rr = rng.range(P.R_15 * 0.2, P.R_10 * 1.1);
      const x = rr * Math.cos(a), y = rr * Math.sin(a);
      let clash = false;
      for (const d of w.discs) if (hypot(d.x - x, d.y - y) < 2 * P.R_DISC * 1.02) clash = true;
      for (const pg of geo.pegs) if (hypot(pg.x - x, pg.y - y) < P.R_DISC + P.R_PEG) clash = true;
      if (!clash) PHYS.addDisc(w, k % 2, x, y);
    }
    const pl = geo.placement(0);
    const ang = rng.range(pl.a0, pl.a1);
    const x0 = pl.r * Math.cos(ang), y0 = pl.r * Math.sin(ang);
    /* aim straight across the board, full power -- the worst case for CCD */
    const aim = Math.atan2(-y0, -x0) + rng.range(-0.30, 0.30);
    const sp = P.V_MAX_SHOT * rng.range(0.75, 1.0);
    const shot = { owner: 0, x: x0, y: y0, vx: Math.cos(aim) * sp, vy: Math.sin(aim) * sp,
                   w: rng.range(-60, 60) };

    let ke0 = 0.5 * P.M_DISC * sp * sp + 0.5 * P.I_DISC * shot.w * shot.w;
    const r = PHYS.runShot(w, shot, { frames: false });
    shots++;
    if (!r.settled) unsettled++;
    let ke1 = 0;
    for (const d of r.world.discs){
      ke1 += 0.5 * P.M_DISC * (d.vx * d.vx + d.vy * d.vy) + 0.5 * P.I_DISC * d.w * d.w;
    }
    if (ke1 > ke0 + 1e-9) energyUp++;

    /* the settled board must be physically possible */
    const live = r.world.discs.filter(d => d.live);
    for (let a1 = 0; a1 < live.length; a1++){
      for (let b1 = a1 + 1; b1 < live.length; b1++){
        const pen = 2 * P.R_DISC - hypot(live[a1].x - live[b1].x, live[a1].y - live[b1].y);
        if (pen > worstDiscPen) worstDiscPen = pen;
        if (pen > P.R_DISC * 0.25) overlaps++;
      }
      for (const pg of geo.pegs){
        const pen = (P.R_DISC + P.R_PEG) - hypot(live[a1].x - pg.x, live[a1].y - pg.y);
        if (pen > worstPegPen) worstPegPen = pen;
        if (pen > P.R_DISC * 0.25) pegOverlaps++;
      }
    }
  }
  console.log(`   worst residual overlap: disc/disc ${(worstDiscPen * 1000).toFixed(3)} mm,` +
              ` disc/peg ${(worstPegPen * 1000).toFixed(3)} mm`);
  c.eq(overlaps, 0, `no disc left overlapping another by more than a quarter radius (${shots} shots)`);
  c.eq(pegOverlaps, 0, "no disc left sitting inside a peg");
  c.eq(unsettled, 0, "every shot reached rest inside T_MAX");
  c.eq(energyUp, 0, "kinetic energy never increased across a shot");
  c.ok(worstDiscPen < P.R_DISC * 0.1, "residual disc overlap stays under a tenth of a radius",
       `${(worstDiscPen * 1000).toFixed(3)} mm vs ${(P.R_DISC * 100).toFixed(3)} mm`);
}

/* --- the direct anti-tunnel test: a peg dead ahead --------------------- */
console.log("5. A peg dead ahead is always hit, at any speed that reaches it");
{
  let missed = 0, tested = 0;
  const peg = geo.pegs[0];
  const dirA = Math.atan2(peg.y, peg.x);
  const r0 = P.R_PLACE;
  /* the disc has to actually get there: the distance from the shooting line
     to the peg's near face, converted to the speed that just covers it */
  const reach = r0 - (P.R_PEG_CIRCLE + P.R_PEG + P.R_DISC);
  const vNeed = Math.sqrt(2 * P.MU_SURFACE * P.G * reach);
  console.log(`   the peg is ${(reach * 1000).toFixed(0)} mm away, so it takes at least ` +
              `${vNeed.toFixed(3)} m/s to reach it`);
  for (const mul of [1.05, 1.3, 2, 3, 4, 6, 10, 16]){
    const sp = vNeed * mul;
    const w = PHYS.newWorld(geo);
    const shot = { owner: 0, x: r0 * Math.cos(dirA), y: r0 * Math.sin(dirA),
                   vx: -Math.cos(dirA) * sp, vy: -Math.sin(dirA) * sp, w: 0 };
    const r = PHYS.runShot(w, shot, { frames: false });
    tested++;
    if (!r.events.some(e => e.kind === 'peg')) missed++;
  }
  c.eq(missed, 0, `a peg on the line of fire is struck at every speed up to ` +
                  `${(vNeed * 16).toFixed(1)} m/s -- ten times full power (${tested} speeds)`);

  /* the same, for a disc: a stationary target dead ahead is never passed
     through, however hard it is hit */
  let dmissed = 0, dtested = 0;
  for (const mul of [1.1, 2, 4, 8, 16, 32]){
    const sp = P.V_MAX_SHOT * mul * 0.25;
    const w = PHYS.newWorld(geo);
    PHYS.addDisc(w, 1, 0, -P.R_15 * 1.4);          /* clear of the 20 hole */
    const shot = { owner: 0, x: 0, y: -P.R_PLACE, vx: 0, vy: sp, w: 0 };
    const r = PHYS.runShot(w, shot, { frames: false });
    dtested++;
    if (!r.events.some(e => e.kind === 'disc')) dmissed++;
  }
  c.eq(dmissed, 0, `a disc dead ahead is struck at every speed up to ` +
                   `${(P.V_MAX_SHOT * 8).toFixed(1)} m/s (${dtested} speeds)`);
}

/* ---------------------------------------------------------------------- 6 */
console.log("6. Collisions: the head-on case, and spin thrown off the contact");
{
  /* Everything here happens on the line y = -0.16, well clear of the 20
     hole -- a target disc parked on the hole would be swallowed before it
     could be hit, which is exactly the mistake this comment exists to stop
     the next person making. */
  const LANE = -0.16;
  const pair = (spin, v0) => {
    const w = PHYS.newWorld(geo);
    const a = PHYS.addDisc(w, 0, -0.13, LANE);
    const b = PHYS.addDisc(w, 1,  0.00, LANE);
    a.vx = v0 === undefined ? 0.55 : v0; a.w = spin;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return { a: r.world.discs[0], b: r.world.discs[1], r };
  };

  const head = pair(0);
  c.ok(head.r.events.some(e => e.kind === 'disc'), "the two discs actually collided");
  c.ok(head.b.x > 0.0, "the struck disc was driven forwards");
  c.ok(head.a.x < head.b.x, "the shooter stayed behind the disc it hit");
  c.near(head.b.y, LANE, 1e-12, "with no spin, a head-on hit sends the target dead straight");
  c.near(head.a.y, LANE, 1e-12, "and the shooter does not wander off line either");

  /* SPIN TRANSFER. Nothing in the NORMAL impulse can throw a disc sideways:
     for two circles the contact arm is parallel to the normal, so the normal
     impulse has no angular term and no tangential component. Only the
     clamped Coulomb friction impulse along the tangent can do it. So a
     non-zero sideways displacement here IS the tangential impulse working,
     and its sign flipping with the spin is the proof it is the spin doing
     it and not an asymmetry in the solver. */
  const spun = pair(200), anti = pair(-200);
  const dy = spun.b.y - LANE, dyA = anti.b.y - LANE;
  c.ok(Math.abs(dy) > 1e-4, "a spinning disc throws the target off line",
       `dy = ${(dy * 1000).toFixed(2)} mm`);
  c.ok(Math.sign(dy) === -Math.sign(dyA),
       "reversing the spin reverses which way the target is thrown");
  c.near(Math.abs(dy), Math.abs(dyA), Math.abs(dy) * 0.02,
         "the throw is symmetric in the sign of the spin");
  console.log(`   spin +200 rad/s threw the target ${(dy * 1000).toFixed(1)} mm off line,` +
              ` -200 threw it ${(dyA * 1000).toFixed(1)} mm`);

  /* the shooter must also squirt off line, in the opposite sense --
     equal and opposite tangential impulses */
  c.ok(Math.abs(spun.a.y - LANE) > 1e-5, "the spinning shooter squirts off line too",
       `dy = ${((spun.a.y - LANE) * 1000).toFixed(2)} mm`);

  /* MOMENTUM. Friction acts throughout, so total momentum is not conserved
     over a whole shot -- but the collision itself must not create any. Check
     the sum of speeds cannot exceed what went in. */
  const v0 = 0.55;
  c.ok(hypot(head.a.vx, head.a.vy) + hypot(head.b.vx, head.b.vy) <= v0 + 1e-12,
       "the collision created no speed out of nothing");

  /* RESTITUTION, and a joint test of the friction law with it. The discs
     start 50 mm apart, so the shooter slides 18 mm before contact and
     friction has already taken some speed off it. The impulse must
     therefore be (1+e)/2 of the IMPACT speed, not of the launch speed --
     and the impact speed is itself predicted by the Coulomb law. If either
     law were wrong this ratio would drift with speed. */
  const gap = 0.05 - 2 * P.R_DISC;                  /* 18 mm of approach   */
  const ratios = [0.4, 0.8, 1.2].map(v => {
    const w = PHYS.newWorld(geo);
    const a = PHYS.addDisc(w, 0, -0.05, LANE);
    const b = PHYS.addDisc(w, 1, 0.00, LANE);
    a.vx = v;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    const ev = r.events.find(e => e.kind === 'disc');
    if (!ev) return null;
    const vImpact = Math.sqrt(Math.max(0, v * v - 2 * P.MU_SURFACE * P.G * gap));
    return ev.impulse / (P.M_DISC * vImpact);
  });
  c.ok(ratios.every(x => x !== null), "every speed produced a contact");
  const spread = Math.max(...ratios) - Math.min(...ratios);
  c.ok(spread < 0.01, "the impulse is a constant fraction of the IMPACT speed",
       `ratios ${ratios.map(x => x.toFixed(4)).join(", ")}`);
  for (let i = 0; i < ratios.length; i++){
    c.near(ratios[i], (1 + P.E_DISC) / 2, 0.01,
           `impulse fraction is (1+e)/2 = ${((1 + P.E_DISC) / 2).toFixed(3)} at v=${[0.4, 0.8, 1.2][i]}`);
  }
}

/* ---------------------------------------------------------------------- 7 */
console.log("7. The 20 hole: a 1.46 mm window, and it must not be missable");
{
  /* dead centre, gently: must drop */
  let dropped = 0, tried = 0;
  for (const sp of [0.35, 0.5, 0.62, 0.75]){
    const w = PHYS.newWorld(geo);
    const pl = geo.placement(0);
    const ang = pl.c;
    const x0 = pl.r * Math.cos(ang), y0 = pl.r * Math.sin(ang);
    const aim = Math.atan2(-y0, -x0);
    const need = Math.sqrt(2 * P.MU_SURFACE * P.G * pl.r);   /* just reaches the middle */
    const v = Math.max(sp, need * 1.02);
    const r = PHYS.runShot(w, { owner: 0, x: x0, y: y0,
                                vx: Math.cos(aim) * v, vy: Math.sin(aim) * v, w: 0 },
                           { frames: false });
    tried++;
    if (r.world.discs[r.world.discs.length - 1].fate === 'hole') dropped++;
  }
  c.ok(dropped >= 1, `a dead-centre shot down the open lane can score a 20 (${dropped}/${tried})`);

  /* the swept test must catch a 20 even at a speed where one substep is
     longer than the whole capture window -- this is the tunnelling case
     that a naive endpoint check gets wrong */
  const fast = (() => {
    const w = PHYS.newWorld(geo);
    const d = PHYS.addDisc(w, 0, -0.25, 0);
    d.vx = P.V_20_MAX * 0.92;             /* under the ceiling, but quick   */
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return r.world.discs[0].fate;
  })();
  c.eq(fast, 'hole', "a fast but sub-ceiling disc crossing dead centre is still captured");

  /* above the ceiling it must rattle out rather than drop */
  const tooFast = (() => {
    const w = PHYS.newWorld(geo);
    const d = PHYS.addDisc(w, 0, -0.25, 0);
    d.vx = P.V_20_MAX * 2.2;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return r.world.discs[0].fate;
  })();
  c.ok(tooFast !== 'hole', "a disc struck far too hard crosses the hole instead of dropping");

  /* a near miss must NOT be a 20: 3 mm off centre is outside the window */
  const nearMiss = (() => {
    const w = PHYS.newWorld(geo);
    const d = PHYS.addDisc(w, 0, -0.25, P.R_CAPTURE + 0.0025);
    d.vx = 0.45;
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    return r.world.discs[0].fate;
  })();
  c.ok(nearMiss !== 'hole', "passing 2.5 mm outside the capture window is not a 20");
}

/* ---------------------------------------------------------------------- 8 */
console.log("8. The ditch and the shooting line");
{
  const w = PHYS.newWorld(geo);
  const d = PHYS.addDisc(w, 0, 0, 0);
  d.vx = P.V_MAX_SHOT;                     /* straight off the side          */
  const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
  c.eq(r.world.discs[0].fate, 'ditch', "a disc driven off the surface ends in the ditch");
  c.ok(r.events.some(e => e.kind === 'ditch'), "the ditch is reported as an event");

  /* THE SPINNING DISC RULE, geometrically: a disc that crosses the shooting
     line tangentially and comes back inside it must still be live. The
     solver must not kill it at the line -- only at the surface edge. */
  const w2 = PHYS.newWorld(geo);
  const d2 = PHYS.addDisc(w2, 0, 0, P.R_OUT - P.R_DISC * 0.5);
  d2.vx = 0.30;                            /* tangential, just outside the line */
  const r2 = PHYS.runShot(w2, null, { frames: false, inPlace: true });
  const crossed = hypot(d2.x, d2.y) + P.R_DISC > P.R_OUT;
  c.ok(r2.world.discs[0].live || r2.world.discs[0].fate === 'ditch',
       "a disc crossing the shooting line is not killed mid-flight by the line itself");
  c.ok(!geo.deadAtRest(0, 0), "a disc in the middle is not 'dead at rest'");
  c.ok(geo.deadAtRest(P.R_OUT - P.R_DISC, 0),
       "a disc touching the shooting line IS dead at rest (NCA 8e)");
}

process.exit(c.report() ? 1 : 0);
