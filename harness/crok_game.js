/* A WHOLE MATCH, WITH NO BROWSER.

   The game loop, the turn logic, the scoring and the AI, driven headlessly
   through exactly the host interface the real app implements. If a round
   can hang, a score can drift, or an AI can produce an illegal shot, it
   shows up here in seconds rather than in play.

   It also measures the thing that makes the AI honest: its OPEN-20 RATE.
   Real rates are published -- Justin Slater 75.6%, Connor Reinman 66.0%,
   an average competitive player about 55%, recreational players 20-50% --
   so the three difficulties are calibrated against real people rather than
   against a number somebody liked.

     node harness/crok_game.js [matches]
*/
const { loadCrok, Checks } = require("./crok_load.js");
const C = loadCrok();
const { SPEC: P, GEO, PHYS, RULES, GAME, AI, Rng } = C;
const c = Checks("crok_game");
const N = parseInt(process.argv[2], 10) || 3;
/* The AI is not cheap -- a hard move simulates a few hundred candidate
   shots -- so the default run is deliberately small and everything scales
   with N. `node harness/crok_game.js 10` is the thorough version. */
const TRIES = 40 * N;        /* open-20 samples per difficulty            */
const DUELS = 4 * N;         /* hard-vs-easy head to head rounds          */

/* the least host that will do: no canvas, no clock, no waiting */
function headlessHost(log){
  return {
    now(){ return 0; },
    defer(fn){ fn(); },                 /* the AI thinks immediately       */
    setting(k){ return { input: 'velocity', preview: 'off' }[k]; },
    onTurn(){}, onAIChose(){}, onShotFired(){}, onEvent(){},
    onShotSettled(g, verdict){
      if (!log) return;
      log.shots++;                       /* every shot, both players       */
      if (!verdict.valid) log.fouls++;
      if (g.isAI(1 - g.shooter) || true){ /* whose shot this was           */
        const who = g.shooter;
        log.byPlayer[who].shots++;
        if (!verdict.valid) log.byPlayer[who].fouls++;
      }
    },
    onRoundOver(){},
  };
}

/* a human stand-in: aims down its own quadrant with a bit of scatter */
function humanShot(g, rng){
  const pl = g.geo.placement(g.shooter);
  const a = rng.range(pl.a0, pl.a1);
  const x = pl.r * Math.cos(a), y = pl.r * Math.sin(a);
  const aim = Math.atan2(-y, -x) + rng.normal() * 0.05;
  const sp = P.V_MIN_SHOT + rng.range(0.30, 0.75) * (P.V_MAX_SHOT - P.V_MIN_SHOT);
  return { owner: g.shooter, x, y, vx: Math.cos(aim) * sp, vy: Math.sin(aim) * sp,
           w: rng.normal() * 12 };
}

/* run one match to completion, returning what happened */
function playMatch(cfg, seed){
  const log = { fouls: 0, shots: 0, rounds: 0, twenties: [0, 0], stalls: 0,
                byPlayer: [{ shots: 0, fouls: 0 }, { shots: 0, fouls: 0 }] };
  const g = GAME.create(headlessHost(log));
  g.startMatch(Object.assign({ seed }, cfg));
  const rng = Rng(seed ^ 0x5eed);

  let guard = 0;
  while (!g.match.over && guard++ < 4000){
    if (g.state === 'aim'){
      if (!g.isAI(g.shooter)) g.takeShot(humanShot(g, rng));
      /* an AI turn has already fired inside beginTurn via defer */
      if (g.state === 'aim'){ log.stalls++; break; }
    } else if (g.state === 'playing' || g.state === 'settle'){
      g.advance(10);                     /* skip the animation entirely     */
    } else if (g.state === 'roundOver'){
      log.rounds++;
      g.nextRound();
    } else if (g.state === 'matchOver'){
      log.rounds++;
      break;
    } else { log.stalls++; break; }
  }
  log.guard = guard;
  log.twenties = g.match.twenties.slice();
  return { g, log };
}

/* ---------------------------------------------------------------------- */
console.log(`\n1. ${N} full matches against each difficulty, played to the end`);
{
  for (const difficulty of ['easy', 'medium', 'hard']){
    let over = 0, stalls = 0, shots = 0, fouls = 0, rounds = 0, t0 = Date.now();
    let aiShots = 0, aiFouls = 0;
    const wins = [0, 0];
    for (let i = 0; i < N; i++){
      const { g, log } = playMatch({ mode: 'ai', bestOf: 3, difficulty }, 1000 + i * 7);
      if (g.match.over) over++;
      if (g.match.winner >= 0) wins[g.match.winner]++;
      stalls += log.stalls; shots += log.shots; fouls += log.fouls; rounds += log.rounds;
      aiShots += log.byPlayer[1].shots; aiFouls += log.byPlayer[1].fouls;
      /* the board must never be left in an impossible state */
      for (const d of g.world.discs){
        if (!d.live) continue;
        for (const e of g.world.discs){
          if (e === d || !e.live) continue;
          if (Math.hypot(d.x - e.x, d.y - e.y) < 2 * P.R_DISC * 0.9){
            c.ok(false, `${difficulty}: settled board has overlapping discs`);
          }
        }
      }
    }
    const ms = Date.now() - t0;
    console.log(`   ${difficulty.padEnd(7)} ${over}/${N} finished, ${rounds} rounds, ` +
                `${shots} shots (${(100 * fouls / Math.max(1, shots)).toFixed(0)}% fouled) | ` +
                `AI fouled ${(100 * aiFouls / Math.max(1, aiShots)).toFixed(0)}% of its ${aiShots} | ` +
                `random-P1 ${wins[0]} : ${wins[1]} AI | ${(ms / N).toFixed(0)} ms/match`);
    c.eq(over, N, `${difficulty}: every match reached a decision`);
    c.eq(stalls, 0, `${difficulty}: no round ever stalled`);
    /* the scripted opponent aims almost at random, so the OVERALL foul
       rate says nothing. What matters is the AI's own. */
    c.ok(aiFouls / Math.max(1, aiShots) < 0.45,
         `${difficulty}: the AI fouls on fewer than 45% of its own shots`,
         `${(100 * aiFouls / Math.max(1, aiShots)).toFixed(0)}%`);
  }
}

/* ---------------------------------------------------------------------- */
console.log("\n2. Every shot the AI plays is a legal placement");
{
  let checked = 0, bad = 0;
  for (const difficulty of ['easy', 'medium', 'hard']){
    const geo = GEO.build(P);
    const rng = Rng(77);
    for (let i = 0; i < 12; i++){
      const w = PHYS.newWorld(geo);
      for (let k = 0; k < (i % 5); k++){
        const a = rng.range(0, Math.PI * 2), rr = rng.range(P.R_15 * 0.5, P.R_10);
        const x = rr * Math.cos(a), y = rr * Math.sin(a);
        let clash = false;
        for (const d of w.discs) if (Math.hypot(d.x - x, d.y - y) < 2 * P.R_DISC * 1.05) clash = true;
        for (const pg of geo.pegs) if (Math.hypot(pg.x - x, pg.y - y) < P.R_DISC + P.R_PEG) clash = true;
        if (!clash) PHYS.addDisc(w, k % 2, x, y);
      }
      const think = AI.think(geo, w, 1, difficulty, rng, [0, 0]);
      if (!think){ bad++; continue; }
      checked++;
      const pl = geo.placement(1);
      const r = Math.hypot(think.shot.x, think.shot.y);
      const off = Math.abs(((Math.atan2(think.shot.y, think.shot.x) - pl.c + Math.PI * 3) %
                            (Math.PI * 2)) - Math.PI);
      if (Math.abs(r - pl.r) > 1e-9 || off > pl.halfSpan + 1e-9) bad++;
      const sp = Math.hypot(think.shot.vx, think.shot.vy);
      if (sp > P.V_MAX_SHOT + 1e-9 || sp < 0) bad++;
    }
  }
  c.eq(bad, 0, `${checked} AI shots all start from a legal spot at a legal speed`);
}

/* ---------------------------------------------------------------------- */
console.log("\n3. The open 20: how often does each difficulty score one?");
{
  /* The canonical test of a crokinole player: an empty board, one disc,
     shoot for the 20. Published human rates are in the header comment. */
  const geo = GEO.build(P);
  const rates = {};
  for (const difficulty of ['easy', 'medium', 'hard']){
    let sunk = 0, tries = TRIES, legal = 0;
    const rng = Rng(31337);
    for (let i = 0; i < tries; i++){
      const w = PHYS.newWorld(geo);
      const think = AI.think(geo, w, 0, difficulty, rng, [0, 0]);
      if (!think) continue;
      const r = PHYS.runShot(w, think.shot, { frames: false });
      const v = RULES.judgeShot(geo, w, r, 0);
      if (v.valid) legal++;
      const d = r.world.discs[r.world.discs.length - 1];
      if (d.fate === 'hole' && v.valid) sunk++;
    }
    rates[difficulty] = sunk / tries;
    console.log(`   ${difficulty.padEnd(7)} open-20 rate ${(100 * sunk / tries).toFixed(1)}%` +
                `   (legal shots ${(100 * legal / tries).toFixed(0)}%)`);
  }
  /* the ladder must at least be a ladder */
  c.ok(rates.hard >= rates.medium, "hard scores open 20s at least as often as medium");
  c.ok(rates.medium >= rates.easy, "medium scores open 20s at least as often as easy");
  /* Against the published human rates: Justin Slater 75.6%, Connor Reinman
     66.0%, an average competitive player about 55%, recreational players
     20-50%. Hard should look like a strong club player, Easy like someone
     who has played a few times. */
  c.ok(rates.hard > 0.55, "hard shoots an open 20 like a strong player (>55%)",
       `${(rates.hard * 100).toFixed(1)}%`);
  c.ok(rates.hard < 0.90, "...but is not superhuman", `${(rates.hard * 100).toFixed(1)}%`);
  c.ok(rates.medium > 0.30 && rates.medium < 0.62,
       "medium sits between them", `${(rates.medium * 100).toFixed(1)}%`);
  c.ok(rates.easy < 0.45, "easy is not secretly a good player", `${(rates.easy * 100).toFixed(1)}%`);
  c.ok(rates.easy > 0.10, "...but is not hopeless either", `${(rates.easy * 100).toFixed(1)}%`);
}

/* ---------------------------------------------------------------------- */
console.log("\n4. Hard beats Easy over a run of matches");
{
  /* the only test of an AI ladder that means anything */
  let hardWins = 0, played = 0;
  for (let i = 0; i < DUELS; i++){
    const geo = GEO.build(P);
    const rng = Rng(500 + i * 13);
    const w = PHYS.newWorld(geo);
    const banked = [0, 0], twenties = [0, 0];
    /* a single round, hard as player 0, easy as player 1 */
    let left = [P.DISCS_EACH, P.DISCS_EACH], who = i % 2;
    let world = w, guard = 0;
    while ((left[0] > 0 || left[1] > 0) && guard++ < 40){
      if (left[who] === 0){ who = 1 - who; continue; }
      const diff = who === 0 ? 'hard' : 'easy';
      const think = AI.think(geo, world, who, diff, rng, banked);
      if (!think) break;
      const res = PHYS.runShot(world, think.shot, { frames: false });
      const verdict = RULES.judgeShot(geo, world, res, who);
      world = res.world;
      for (const d of world.discs) d.shooter = false;
      if (!verdict.valid) RULES.applyFoul(res);
      RULES.endTurn(geo, world, banked, twenties);
      left[who]--; who = 1 - who;
    }
    const t = RULES.tally(geo, world, banked);
    played++;
    if (t.pts[0] > t.pts[1]) hardWins++;
  }
  console.log(`   hard won ${hardWins} of ${played} head-to-head rounds against easy`);
  c.ok(hardWins >= Math.ceil(played * 0.6),
       "hard beats easy clearly over a run of rounds", `${hardWins}/${played}`);
}

process.exit(c.report() ? 1 : 0);
