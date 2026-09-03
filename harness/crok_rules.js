/* THE RULES, AS A TRUTH TABLE.

   Scoring and shot validity are the part of a crokinole program that is
   easiest to get quietly wrong, because a board that looks right can be
   scoring wrong all afternoon. So every rule gets asked directly, at the
   millimetre, including the three the internet mostly gets backwards:

     * a round is scored 2 / 1 / 0, not by the margin
     * TOUCHING the 15 line satisfies the open-board rule but SCORES 10
     * a foul removes discs and never restores positions

     node harness/crok_rules.js
*/
const { loadCrok, Checks } = require("./crok_load.js");
const C = loadCrok();
const { SPEC: P, GEO, PHYS, RULES } = C;
const geo = GEO.build(P);
const c = Checks("crok_rules");

/* Launch speeds are DERIVED from the friction law, never hard-coded: the
   speed that covers `dist` and still arrives doing `arrive`. When
   MU_SURFACE was retuned from 0.055 to 0.12 every literal speed in this
   file silently became too slow to reach its target, and the probe failed
   for reasons that had nothing to do with the rules. */
const speedFor = (dist, arrive) =>
  Math.sqrt((arrive || 0) * (arrive || 0) + 2 * P.MU_SURFACE * P.G * dist);

/* put a disc's centre at radius r along an angle, and ask what it scores */
const zoneAt = r => geo.zoneOf(r, 0);
const mm = v => (v * 1000).toFixed(2) + " mm";

/* ---------------------------------------------------------------------- */
console.log("\n1. Scoring by zone, at the millimetre (NCA 6a/6b/6d/6e)");
{
  /* NCA 6a: centre hole 20, the region around it 15, outside the pegs 10,
     the outer region 5. NCA 6b/6d: a disc touching a line takes the LOWER
     value, so it must be ENTIRELY clear of the line to score the higher. */
  const inner15 = P.R_15 - P.LINE_EPS - P.R_DISC;   /* last 15-scoring centre */
  const inner10 = P.R_10 - P.LINE_EPS - P.R_DISC;

  c.eq(zoneAt(0), 15, "dead centre (but not sunk) is in the 15 region");
  c.eq(zoneAt(inner15 - 1e-6), 15, `centre at ${mm(inner15)} still scores 15`);
  c.eq(zoneAt(inner15 + 1e-6), 10, "one micron further out and it is 10");
  c.eq(zoneAt(P.R_15), 10, "a disc straddling the 15 line scores 10, not 15");
  c.eq(zoneAt(inner10 - 1e-6), 10, `centre at ${mm(inner10)} still scores 10`);
  c.eq(zoneAt(inner10 + 1e-6), 5, "past the 10 line it is 5");
  c.eq(zoneAt(P.R_10), 5, "a disc straddling the 10 line scores 5, not 10");
  c.eq(zoneAt(P.R_PLACE), 5, "a disc on the shooting line is in the 5 region");

  /* the line WIDTH matters: without it the 15 ring would be 0.79 mm wider */
  const naive = P.R_15 - P.R_DISC;
  c.ok(zoneAt(naive - 1e-6) === 10,
       "the drawn line's width is honoured -- a disc that would score 15 " +
       "if lines were infinitely thin scores 10");
}

/* ---------------------------------------------------------------------- */
console.log("2. The no-hiding test is NOT the same predicate as scoring 15");
{
  /* This asymmetry is real and is the single most confusable thing in the
     rulebook. NCA 3a.ii: "touching or within the 15 line" satisfies the
     open-board rule. NCA 6d: a disc touching that line scores 10. So there
     is a band of positions that are LEGAL but score TEN. */
  const onLine = P.R_15;                          /* straddling the line   */
  c.ok(geo.touchingOrInsideFifteen(onLine, 0), "a disc on the 15 line satisfies no-hiding");
  c.eq(geo.zoneOf(onLine, 0), 10, "...and scores 10");

  const justTouching = P.R_15 + P.R_DISC + P.LINE_EPS - 1e-6;
  c.ok(geo.touchingOrInsideFifteen(justTouching, 0),
       `a disc reaching the line from outside at ${mm(justTouching)} still satisfies no-hiding`);
  c.eq(geo.zoneOf(justTouching, 0), 10, "...and still scores 10");

  const clear = P.R_15 + P.R_DISC + P.LINE_EPS + 1e-4;
  c.ok(!geo.touchingOrInsideFifteen(clear, 0),
       "a disc entirely clear of the 15 line does NOT satisfy no-hiding");

  /* count how wide that legal-but-scores-10 band is, as a sanity figure */
  const band = (P.R_15 + P.R_DISC + P.LINE_EPS) - (P.R_15 - P.LINE_EPS - P.R_DISC);
  console.log(`   the legal-but-scores-10 band is ${mm(band)} of centre positions wide`);
  c.ok(band > 0.03, "the band is a real region, not a rounding artefact");
}

/* ---------------------------------------------------------------------- */
console.log("3. Out of play: the shooting line is also the death line (NCA 8e)");
{
  c.ok(!geo.deadAtRest(0, 0), "a disc in the middle is alive");
  c.ok(!geo.deadAtRest(P.R_10, 0), "a disc in the 5 region is alive");
  const dead = P.R_OUT - P.LINE_EPS - P.R_DISC;
  c.ok(geo.deadAtRest(dead + 1e-6, 0), "a disc touching the shooting line is out of play");
  c.ok(!geo.deadAtRest(dead - 1e-4, 0), "a disc just short of it survives");
  /* and the placement radius is exactly on that threshold, which is not a
     bug -- you place your disc touching the line, and a shot too weak to
     move it off the line loses it. */
  c.ok(geo.deadAtRest(P.R_PLACE, 0),
       "a freshly placed disc is exactly on the edge of being dead (Rule 7e vs 8e)");
}

/* ---------------------------------------------------------------------- */
console.log("4. Placement: the corner straddle is legal and widens the arc");
{
  const pl = geo.placement(0);
  const deg = a => (a * 180 / Math.PI).toFixed(2);
  console.log(`   the legal arc is ${deg(2 * pl.halfSpan)} degrees wide, ` +
              `centred on ${deg(pl.c)}`);
  c.ok(pl.halfSpan > Math.PI / 4, "the arc is WIDER than the 90-degree quadrant");
  c.near(pl.halfSpan, Math.PI / 4 + Math.asin(P.R_DISC / pl.r), 1e-12,
         "by exactly the angle the disc's radius subtends (NCA 7e second clause)");
  c.near(pl.r, P.R_OUT - P.R_DISC, 1e-12, "the disc sits tangent to the shooting line");

  /* the two players' arcs are opposite and must not overlap */
  const p1 = geo.placement(1);
  c.near(Math.abs(C.GEO.build(P).quadCentre(0) - C.GEO.build(P).quadCentre(1)), Math.PI, 1e-12,
         "the two players' quadrants are diametrically opposite");
  c.ok(pl.halfSpan * 2 < Math.PI, "and their arcs do not overlap");

  /* snapping must always land inside the arc, from anywhere */
  let bad = 0;
  for (let i = 0; i < 720; i++){
    const a = (i / 720) * Math.PI * 2;
    const s = geo.snapPlacement(0, Math.cos(a), Math.sin(a));
    const off = Math.abs(((Math.atan2(s.y, s.x) - pl.c + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    if (off > pl.halfSpan + 1e-9) bad++;
  }
  c.eq(bad, 0, "snapping from any direction lands inside the legal arc");

  /* freePlacement must find room even with the whole line crowded */
  const w = PHYS.newWorld(geo);
  for (let k = 0; k < 6; k++){
    const a = pl.a0 + (pl.a1 - pl.a0) * (k / 5);
    PHYS.addDisc(w, 0, pl.r * Math.cos(a), pl.r * Math.sin(a));
  }
  const spot = geo.freePlacement(0, pl.r * Math.cos(pl.c), pl.r * Math.sin(pl.c), w.discs);
  let clash = 0;
  for (const d of w.discs){
    if (Math.hypot(d.x - spot.x, d.y - spot.y) < 2 * P.R_DISC * 0.999) clash++;
  }
  c.eq(clash, 0, "a shooter still finds a clear spot on a crowded line");
}

/* ---------------------------------------------------------------------- */
console.log("5. The opponent-contact rule (NCA 3a.i)");
{
  /* TWO THINGS CONSTRAIN WHERE A TEST TARGET CAN GO, and both are the real
     board rather than test scaffolding:

       the PEGS. Only the quadrant's centreline is a clean lane. Aim ten
       degrees off it from the middle of the shooting arc and a peg is in
       the way -- which is the whole point of the peg ring, and it means a
       target placed off-axis is a test of the pegs, not of the rule.

       the HOLE. A target directly beyond the 20 hole cannot be reached
       either, because the shooter drops in on the way through.

     So targets sit ON the centreline but SHORT of the hole: inside the 15
     ring on the shooter's own side, past the hole's mouth. */
  const LANE_X = 0;
  const shootLane = (targets, targetY, speed) => {
    const w = PHYS.newWorld(geo);
    for (const t of targets) PHYS.addDisc(w, t.o, t.x, t.y);
    const pl = geo.placement(0);
    const x0 = pl.r * Math.cos(pl.c), y0 = pl.r * Math.sin(pl.c);
    const ang = Math.atan2(targetY - y0, LANE_X - x0);
    const shot = { owner: 0, x: x0, y: y0,
                   vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, w: 0 };
    const r = PHYS.runShot(w, shot, { frames: false });
    return { r, verdict: RULES.judgeShot(geo, w, r, 0), before: w };
  };
  const oppContact = (r) => {
    const byId = new Map(r.world.discs.map(d => [d.id, d]));
    return r.events.some(e => e.kind === 'disc' &&
      byId.get(e.a) && byId.get(e.b) && byId.get(e.a).owner !== byId.get(e.b).owner);
  };

  /* first, prove the lane really is clear -- if this fails, everything
     below is measuring the wrong thing */
  const clear = shootLane([], 0.06, speedFor(0.15, 0.1));
  c.ok(!clear.r.events.some(e => e.kind === 'peg'),
       "the quadrant centreline is a clean lane through the pegs");

  /* an opponent disc in that lane: hitting it is legal */
  const hit = shootLane([{ o: 1, x: 0, y: 0.06 }], 0.06, speedFor(0.20, 0.4));
  c.ok(oppContact(hit.r), "the shot reached the opponent disc");
  c.ok(hit.verdict.valid, "hitting an opponent disc is a valid shot");
  c.eq(hit.verdict.reason, 'contact', "reported as contact");

  /* missing it is a foul, even though the board is not empty */
  const miss = shootLane([{ o: 1, x: 0.16, y: -0.16 }], 0.06, speedFor(0.20, 0.4));
  c.ok(!oppContact(miss.r), "the shot missed every opponent disc");
  c.ok(!miss.verdict.valid, "missing when an opponent disc is on the board is a foul");
  c.eq(miss.verdict.reason, 'no-contact', "and the reason given is no-contact");

  /* hitting only YOUR OWN disc is a foul... */
  const ownOnly = shootLane([{ o: 0, x: 0, y: 0.06 }, { o: 1, x: -0.20, y: 0.20 }], 0.06,
                            speedFor(0.20, 0.25));
  c.ok(ownOnly.r.events.some(e => e.kind === 'disc'), "the shot did hit something");
  c.ok(!oppContact(ownOnly.r), "but nothing of theirs");
  c.ok(!ownOnly.verdict.valid, "hitting only your own disc is a foul");

  /* ...unless it carries on into an opponent disc. NCA 3a.i's second
     clause: "or by bumping one of his/her discs already in play into an
     opposing disc". Mine sits in front of theirs in the lane, so the only
     way to reach theirs is through mine. */
  const combo = shootLane([{ o: 0, x: 0, y: 0.075 },
                           { o: 1, x: 0, y: 0.040 }], 0.075, speedFor(0.19, 0.55));
  c.ok(oppContact(combo.r), "the combination reached the opponent disc");
  c.ok(combo.verdict.valid, "a combination through your own disc is a valid shot (NCA 3a.i)");

  /* a peg-only contact is still a foul: pegs are irrelevant to validity */
  const pegOnly = (() => {
    const w = PHYS.newWorld(geo);
    PHYS.addDisc(w, 1, -0.20, 0.20);            /* theirs, out of reach     */
    const pl = geo.placement(0);
    const x0 = pl.r * Math.cos(pl.c), y0 = pl.r * Math.sin(pl.c);
    /* aim at the peg that guards the near side of the lane */
    const peg = geo.pegs.reduce((best, p) =>
      Math.hypot(p.x - x0, p.y - y0) < Math.hypot(best.x - x0, best.y - y0) ? p : best, geo.pegs[0]);
    const ang = Math.atan2(peg.y - y0, peg.x - x0);
    const sp = speedFor(Math.hypot(peg.x - x0, peg.y - y0), 0.3);
    const shot = { owner: 0, x: x0, y: y0, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, w: 0 };
    const r = PHYS.runShot(w, shot, { frames: false });
    return { r, verdict: RULES.judgeShot(geo, w, r, 0) };
  })();
  c.ok(pegOnly.r.events.some(e => e.kind === 'peg'), "the shot did hit a peg");
  c.ok(!pegOnly.verdict.valid, "hitting only a peg is still a foul -- pegs do not count");
}

/* ---------------------------------------------------------------------- */
console.log("6. The open-board / no-hiding rule (NCA 3a.ii)");
{
  const openShot = (speed, aim) => {
    const w = PHYS.newWorld(geo);
    const pl = geo.placement(0);
    const x0 = pl.r * Math.cos(pl.c), y0 = pl.r * Math.sin(pl.c);
    const ang = aim === undefined ? Math.atan2(-y0, -x0) : aim;
    const shot = { owner: 0, x: x0, y: y0,
                   vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, w: 0 };
    const r = PHYS.runShot(w, shot, { frames: false });
    return { r, verdict: RULES.judgeShot(geo, w, r, 0),
             d: r.world.discs[r.world.discs.length - 1] };
  };

  /* too soft: dies out in the 5 ring -> foul */
  const soft = openShot(speedFor(0.05, 0));
  c.ok(!geo.touchingOrInsideFifteen(soft.d.x, soft.d.y), "the soft shot stopped short of the 15 line");
  c.ok(!soft.verdict.valid, "a shot that does not reach the 15 line on an open board is a foul");
  c.eq(soft.verdict.reason, 'open-short', "and the reason given is open-short");

  /* enough to reach the 15 line -> legal */
  const need = Math.sqrt(2 * P.MU_SURFACE * P.G * (P.R_PLACE - P.R_15 - P.R_DISC));
  const ok = openShot(need * 1.10);
  c.ok(ok.verdict.valid, "a shot reaching the 15 line on an open board is valid");

  /* a 20 satisfies it, even though the disc is no longer on the surface */
  const twenty = (() => {
    const w = PHYS.newWorld(geo);
    const d = PHYS.addDisc(w, 0, -0.26, 0);
    d.vx = speedFor(0.26, 0.30);
    const r = PHYS.runShot(w, null, { frames: false, inPlace: true });
    r.shooterId = d.id; d.shooter = true;
    return { r, verdict: RULES.judgeShot(geo, PHYS.newWorld(geo), r, 0), fate: d.fate };
  })();
  c.eq(twenty.fate, 'hole', "the test shot actually sank");
  c.ok(twenty.verdict.valid, "a sunk 20 satisfies the open-board rule (NCA 3a.ii parenthetical)");
  c.eq(twenty.verdict.reason, 'twenty', "and is reported as such");
}

/* ---------------------------------------------------------------------- */
console.log("7. The price of a foul (NCA 3b): removal, and nothing put back");
{
  const w = PHYS.newWorld(geo);
  /* in the clean centreline lane, short of the hole -- see section 5 */
  const mine = PHYS.addDisc(w, 0, 0, 0.06);         /* my disc, in the way  */
  const theirs = PHYS.addDisc(w, 1, -0.20, 0.20);   /* theirs, far away     */
  const before = { mx: mine.x, my: mine.y };
  const pl = geo.placement(0);
  const x0 = pl.r * Math.cos(pl.c), y0 = pl.r * Math.sin(pl.c);
  const ang = Math.atan2(0.06 - y0, 0 - x0);
  const sp = speedFor(Math.hypot(0 - x0, 0.06 - y0) - 2 * P.R_DISC, 0.25);
  const shot = { owner: 0, x: x0, y: y0, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, w: 0 };
  const r = PHYS.runShot(w, shot, { frames: false });
  const verdict = RULES.judgeShot(geo, w, r, 0);
  c.ok(!verdict.valid, "hitting only my own disc is a foul");

  const movedTo = r.world.discs.find(d => d.id === mine.id);
  c.ok(Math.hypot(movedTo.x - before.mx, movedTo.y - before.my) > 1e-4,
       "my disc was in fact moved by the shot");

  const removed = RULES.applyFoul(r);
  const after = r.world.discs.find(d => d.id === mine.id);
  const shooter = r.world.discs.find(d => d.id === r.shooterId);
  c.ok(!shooter.live && shooter.fate === 'foul', "the shooting disc is removed");
  c.ok(!after.live && after.fate === 'foul', "and so is the disc it struck");
  c.ok(Math.hypot(after.x - before.mx, after.y - before.my) > 1e-4,
       "the struck disc is NOT put back where it was -- removal only, never restoration");
  const opp = r.world.discs.find(d => d.id === theirs.id);
  c.ok(opp.live, "the opponent's untouched disc is left alone");
  c.eq(removed.length, 2, "exactly the shooter and the one disc it struck came off");

  /* a 20 sunk on a foul is voided */
  const w2 = PHYS.newWorld(geo);
  PHYS.addDisc(w2, 1, 0.22, 0.22);                  /* their disc, unreachable */
  const d2 = PHYS.addDisc(w2, 0, -0.26, 0);
  d2.vx = speedFor(0.26, 0.30); d2.shooter = true;
  const r2 = PHYS.runShot(w2, null, { frames: false, inPlace: true });
  r2.shooterId = d2.id;
  const v2 = RULES.judgeShot(geo, w2, r2, 0);
  c.eq(d2.fate, 'hole', "the shot sank a 20");
  c.ok(!v2.valid, "but it never touched their disc, so it is a foul");
  RULES.applyFoul(r2);
  const banked = [0, 0], twenties = [0, 0];
  RULES.endTurn(geo, r2.world, banked, twenties);
  c.eq(banked[0], 0, "a 20 sunk on a foul does not score (NCA 3b)");
  c.eq(twenties[0], 0, "and is not counted on the scorecard either");
}

/* ---------------------------------------------------------------------- */
console.log("8. End of turn: 20s are banked and safe, dead discs are swept");
{
  const w = PHYS.newWorld(geo);
  const sunk = PHYS.addDisc(w, 0, 0, 0);
  sunk.live = false; sunk.fate = 'hole';
  const onLine = PHYS.addDisc(w, 1, P.R_PLACE, 0);       /* touching the line */
  const safe = PHYS.addDisc(w, 0, 0.05, 0.05);
  const banked = [0, 0], twenties = [0, 0];
  const out = RULES.endTurn(geo, w, banked, twenties);
  c.eq(banked[0], 20, "the sunk disc banks 20 points for its owner");
  c.eq(twenties[0], 1, "and one 20 on the scorecard");
  c.eq(out.sunk.length, 1, "one disc reported sunk");
  c.ok(!onLine.live && onLine.fate === 'ditch', "the disc touching the shooting line is swept out");
  c.ok(safe.live, "a disc in the middle of the board is left where it is");

  /* banking is idempotent: a second sweep must not pay twice */
  RULES.endTurn(geo, w, banked, twenties);
  c.eq(banked[0], 20, "a banked 20 is not counted twice");

  /* and the tally counts banked points plus what is on the board */
  const t = RULES.tally(geo, w, banked);
  c.eq(t.pts[0], 20 + geo.zoneOf(safe.x, safe.y), "the tally is banked 20s plus the board");
  c.eq(t.pts[1], 0, "the swept disc scores nothing for its owner");
}

/* ---------------------------------------------------------------------- */
console.log("9. The match: 2 / 1 / 0, alternating start, and it always ends");
{
  const m = RULES.newMatch({ mode: 'local', bestOf: 3 });
  c.eq(m.firstShooter, 0, "player 1 starts the match");
  RULES.finishRound(m, [45, 30], [1, 0]);
  c.eq(m.points[0], 2, "the round winner scores 2 (NCA 2a.iv), not the 15-point margin");
  c.eq(m.points[1], 0, "the loser scores 0");
  c.eq(m.twenties[0], 1, "20s are tracked separately from points");
  c.eq(m.firstShooter, 1, "the first shooter alternates (NCA 4b)");

  RULES.finishRound(m, [30, 30], [0, 0]);
  c.eq(m.points[0], 3, "a tied round scores 1 each");
  c.eq(m.points[1], 1, "...for both players");
  c.eq(m.firstShooter, 0, "and the start alternates again");

  /* 3-1 with one round left: the lead of 2 exactly equals what is available,
     so it is NOT yet decided */
  c.ok(!m.over, "a 3-1 lead with one round to play is not yet decided");
  RULES.finishRound(m, [10, 60], [0, 2]);
  c.eq(m.points[1], 3, "the last round is played out");
  /* 2 + 1 = 3 against 0 + 1 + 2 = 3. Dead level at the distance, so this is
     precisely the case that must NOT be awarded to anybody: it goes to
     sudden death rather than being settled on the raw disc tally, which
     player 2 happens to lead 120 : 85. */
  c.ok(!m.over, "level on points at the distance does not end the match");
  c.ok(m.sudden, "it goes to a sudden-death round");
  c.ok(m.tally[1] > m.tally[0], "even though player 2 leads on raw disc points");
}
{
  /* an unassailable lead must end the match early */
  const m = RULES.newMatch({ mode: 'local', bestOf: 5 });
  RULES.finishRound(m, [50, 10], [0, 0]);
  RULES.finishRound(m, [50, 10], [0, 0]);
  RULES.finishRound(m, [50, 10], [0, 0]);
  c.eq(m.points[0], 6, "three round wins is 6 points");
  c.ok(m.over, "6-0 with 4 points left is unassailable, so the match ends early");
  c.eq(m.winner, 0, "and the leader wins");
}
{
  /* dead level at the distance goes to sudden death, repeatedly if needed */
  const m = RULES.newMatch({ mode: 'local', bestOf: 1 });
  RULES.finishRound(m, [40, 40], [0, 0]);
  c.ok(!m.over, "a tied one-round match is not over");
  c.ok(m.sudden, "it goes to sudden death");
  RULES.finishRound(m, [40, 40], [0, 0]);
  c.ok(m.sudden && !m.over, "and again if that is tied too");
  RULES.finishRound(m, [41, 40], [0, 0]);
  c.ok(m.over, "until someone wins a round");
  c.eq(m.winner, 0, "and takes the match");
}
{
  /* the 3-3 case above resolved on points; check the cumulative-tally
     tiebreak is really what decided it */
  const m = RULES.newMatch({ mode: 'local', bestOf: 3 });
  RULES.finishRound(m, [10, 10], [0, 0]);
  RULES.finishRound(m, [10, 10], [0, 0]);
  RULES.finishRound(m, [10, 10], [0, 0]);
  c.eq(m.points[0], 3, "three tied rounds is 3 points each");
  c.ok(m.sudden, "dead level on points at the distance means sudden death");
  c.ok(!m.over, "the match is not awarded on the raw disc tally");
}

process.exit(c.report() ? 1 : 0);
