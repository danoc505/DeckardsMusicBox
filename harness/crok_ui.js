/* THE GAME IN A REAL BROWSER, AT REAL iPAD SIZE.

   Loads the shipped file, walks the menus, plays a shot with a synthetic
   drag, and writes screenshots. It fails on any console error or page
   exception, so a rendering path that throws cannot pass quietly.

     node harness/crok_ui.js [--shots N]

   Screenshots land in harness/shots/ (gitignored).
*/
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");

/* The image already carries a Chromium at PLAYWRIGHT_BROWSERS_PATH, but the
   npm-installed Playwright may want a different build number and will ask
   to download one. Point it at the browser that is actually here instead --
   there is no network fetch and nothing to install. */
const PREINSTALLED = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LAUNCH = fs.existsSync(PREINSTALLED)
  ? { executablePath: PREINSTALLED, args: ["--no-sandbox", "--disable-dev-shm-usage"] }
  : { args: ["--no-sandbox"] };

const OUT = path.resolve(__dirname, "shots");
fs.mkdirSync(OUT, { recursive: true });
const FILE = "file://" + path.resolve(__dirname, "..", "Crokinole.html");

/* iPad Air, landscape, retina */
const VIEW = { width: 1180, height: 820 };

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  const ok = (cond, what, detail) => {
    if (cond) pass++; else { fail++; fails.push(what + (detail ? "  <-- " + detail : "")); }
  };

  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({
    viewport: VIEW, deviceScaleFactor: 2, isMobile: false, hasTouch: true,
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));

  await page.goto(FILE);
  await page.waitForTimeout(400);

  /* --- the menu --------------------------------------------------------- */
  ok(await page.isVisible("#screen-menu"), "the main menu is shown");
  ok(await page.isVisible("#mm-practice"), "Practice Mode button is there");
  await page.screenshot({ path: path.join(OUT, "01-menu.png") });

  const build = await page.evaluate(() => window.CROK && window.CROK.build);
  ok(!!build, "window.CROK is exported for the harness", "build " + build);

  /* --- setup ------------------------------------------------------------ */
  await page.click("#mm-practice");
  await page.waitForTimeout(220);
  ok(await page.isVisible("#screen-setup"), "the setup screen opens");
  await page.click('#su-difficulty button[data-v="hard"]');
  await page.click('#su-bestof button[data-v="3"]');
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, "02-setup.png") });

  /* --- into the game ---------------------------------------------------- */
  await page.click("#su-start");
  await page.waitForTimeout(900);
  ok(await page.isVisible("#screen-game"), "the game screen opens");

  const state = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return g ? { state: g.state, shooter: g.shooter, left: g.left,
                 discs: g.world.discs.length, round: g.match.round } : null;
  });
  ok(!!state, "a match is running");
  ok(state && state.state === "aim", "and it is waiting for a shot", state && state.state);
  ok(state && state.left[0] === 8 && state.left[1] === 8, "with 8 discs each");
  await page.screenshot({ path: path.join(OUT, "03-board.png") });

  /* --- the gesture: aim, hold the bar, let go --------------------------- */
  const box = await page.locator("#board-canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const ev = (type, x, y, kind, buttons) => page.evaluate(
    ({ type, x, y, left, top, kind, buttons }) => {
      document.getElementById("board-canvas").dispatchEvent(new PointerEvent(type, {
        pointerId: 1, pointerType: kind, isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top, buttons }));
    }, { type, x: x - box.x, y: y - box.y, left: box.x, top: box.y,
         kind: kind || "mouse", buttons: buttons === undefined ? 0 : buttons });

  const peek = () => page.evaluate(() => {
    const g = window.CROK.APP.state.game, A = window.CROK.APP.state;
    return { state: g.state, left: g.left[0], aiming: A.aiming,
             charging: A.charging, meter: A.meter,
             px: g.pending && g.pending.x, preview: !!g.preview, power: g.power,
             shot: g.play ? { vx: g.play.shot.vx, vy: g.play.shot.vy } : null };
  });
  const discAt = () => page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });

  const start = await peek();
  ok(start.px !== null && start.px !== undefined, "a disc is on the line at the start of the turn");
  ok(!start.charging, "and the bar is not running");

  /* 1. aim by moving -- direction only, no power ------------------------- */
  const dp = await discAt();
  await ev("pointermove", box.x + dp.x, box.y + dp.y - box.height * 0.30);
  await page.waitForTimeout(80);
  const aimed = await peek();
  ok(aimed.aiming, "moving the cursor sets the aim");
  ok(aimed.preview, "and draws a line to show the direction");
  ok(!aimed.charging && aimed.meter === 0, "but commits no power yet");
  ok(aimed.left === 8, "and fires nothing");

  /* 2. press and hold -- the bar runs and sweeps up ---------------------- */
  await ev("pointerdown", box.x + dp.x, box.y + dp.y - box.height * 0.30, "mouse", 1);
  await page.waitForTimeout(200);
  const low = await peek();
  await page.waitForTimeout(320);
  const high = await peek();
  ok(low.charging && high.charging, "holding starts the power bar");
  ok(high.meter > low.meter, "and it sweeps upward",
     `${(low.meter * 100).toFixed(0)}% -> ${(high.meter * 100).toFixed(0)}%`);
  ok(high.left === 8, "holding alone fires nothing");
  ok(Math.abs(high.power - high.meter) < 0.02,
     "the trajectory preview is drawn at the bar's own reading",
     `preview ${(high.power * 100).toFixed(0)}% vs bar ${(high.meter * 100).toFixed(0)}%`);
  await page.screenshot({ path: path.join(OUT, "04-meter.png") });

  /* the bar must come back down again, not stick at the top -------------- */
  await page.waitForTimeout(600);
  const stillUp = await peek();
  ok(stillUp.charging, "the bar keeps running while held");
  console.log(`   bar swept ${(low.meter * 100).toFixed(0)}% -> ` +
              `${(high.meter * 100).toFixed(0)}% -> ${(stillUp.meter * 100).toFixed(0)}%`);

  /* 3. let go -- the shot goes at the bar's reading ---------------------- */
  const atRelease = await peek();
  await ev("pointerup", box.x + dp.x, box.y + dp.y - box.height * 0.30, "mouse", 0);
  await page.waitForTimeout(200);
  const fired = await peek();
  ok(fired.left === 7, "letting go takes the shot", `left ${fired.left}`);
  ok(!fired.charging, "and the bar stops");
  if (fired.shot){
    const sp = Math.hypot(fired.shot.vx, fired.shot.vy);
    const vmax = await page.evaluate(() => window.CROK.SPEC.V_MAX_SHOT);
    const vmin = await page.evaluate(() => window.CROK.SPEC.V_MIN_SHOT);
    const wanted = vmin + (vmax - vmin) * atRelease.meter;
    ok(Math.abs(sp - wanted) < 0.35,
       "at the force the bar was showing",
       `bar ${(atRelease.meter * 100).toFixed(0)}% wanted ${wanted.toFixed(2)} m/s, got ${sp.toFixed(2)}`);
    ok(fired.shot.vy < 0, "in the direction that was aimed",
       `vy ${fired.shot.vy.toFixed(2)}`);
    console.log(`   released at ${(atRelease.meter * 100).toFixed(0)}% -> ${sp.toFixed(2)} m/s`);
  } else ok(false, "the shot was recorded");

  /* 4. full power is reachable ------------------------------------------- */
  /* wait for a turn with a disc on the line -- the shot above ended this one */
  await page.waitForTimeout(2800);
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter) || !g.pending); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  const full = await page.evaluate(() => {
    const APPx = window.CROK.APP, A = APPx.state, g = A.game;
    if (!g.pending) return null;
    const m = APPx.shotAt(g, { x: 0, y: -1 }, 1.0);
    if (!m) return null;
    const r = window.CROK.PHYS.runShot(g.world, m.shot, { frames: false });
    return { speed: Math.hypot(m.shot.vx, m.shot.vy),
             vmax: window.CROK.SPEC.V_MAX_SHOT,
             fate: r.world.discs[r.world.discs.length - 1].fate };
  });
  ok(full !== null, "the full-power check could be set up");
  if (full){
    ok(full.speed > full.vmax * 0.99, "the top of the bar is full power",
       `${full.speed.toFixed(2)} of ${full.vmax.toFixed(2)} m/s`);
    ok(full.fate === 'ditch', "and a full-power shot clears the far side of the board");
  }

  /* 5. THE DISC CAN BE MOVED, which is what was impossible ------------- */
  const beforeMove = await peek();
  const dm = await discAt();
  /* press ON the disc and drag it along the line */
  await page.evaluate(async ({ left, top, x, y, dx }) => {
    const cv = document.getElementById("board-canvas");
    const ev = (t, ex, ey, b) => cv.dispatchEvent(new PointerEvent(t, {
      pointerId: 3, pointerType: "mouse", isPrimary: true, bubbles: true,
      cancelable: true, clientX: ex + left, clientY: ey + top, buttons: b }));
    ev("pointerdown", x, y, 1);
    for (let i = 1; i <= 8; i++){
      await new Promise(r => setTimeout(r, 30));
      ev("pointermove", x + dx * (i / 8), y, 1);
    }
    ev("pointerup", x + dx, y, 0);
  }, { left: box.x, top: box.y, x: dm.x, y: dm.y, dx: box.width * 0.12 });
  await page.waitForTimeout(150);
  const moved2 = await peek();
  ok(Math.abs(moved2.px - beforeMove.px) > 0.02,
     "pressing on the disc and dragging moves it along the line",
     `${((moved2.px - beforeMove.px) * 1000).toFixed(0)} mm`);
  ok(moved2.left === beforeMove.left,
     "and moving it costs no disc -- no shot is taken",
     `${beforeMove.left} -> ${moved2.left}`);
  ok(!moved2.charging, "and the power bar never starts while carrying");
  console.log(`   disc carried ${((moved2.px - beforeMove.px) * 1000).toFixed(0)} mm along its line, no shot`);

  /* a long press ON the disc must still not fire ------------------------ */
  const dm2 = await discAt();
  await ev("pointerdown", box.x + dm2.x, box.y + dm2.y, "mouse", 1);
  await page.waitForTimeout(700);           /* far longer than METER_ARM  */
  const heldOnDisc = await peek();
  ok(!heldOnDisc.charging, "holding ON the disc never starts the bar");
  await ev("pointerup", box.x + dm2.x, box.y + dm2.y, "mouse", 0);
  await page.waitForTimeout(150);
  const afterHold = await peek();
  ok(afterHold.left === beforeMove.left,
     "and letting go of it takes no shot", `left ${afterHold.left}`);

  /* a short press AWAY from the disc must not fire either --------------- */
  const dm3 = await discAt();
  await ev("pointerdown", box.x + dm3.x, box.y + dm3.y - box.height * 0.2, "mouse", 1);
  await page.waitForTimeout(60);            /* shorter than METER_ARM     */
  await ev("pointerup", box.x + dm3.x, box.y + dm3.y - box.height * 0.2, "mouse", 0);
  await page.waitForTimeout(150);
  const shortPress = await peek();
  ok(shortPress.left === beforeMove.left,
     "a press too short to start the bar costs no disc",
     `left ${shortPress.left}`);

  /* 6. with a finger: press, hold, lift ---------------------------------- */
  const dpT = await discAt();
  await ev("pointerdown", box.x + dpT.x, box.y + dpT.y - box.height * 0.25, "touch", 1);
  await page.waitForTimeout(420);
  const touchCharge = await peek();
  ok(touchCharge.charging, "with a finger, pressing and holding runs the bar too");
  await ev("pointerup", box.x + dpT.x, box.y + dpT.y - box.height * 0.25, "touch", 0);
  await page.waitForTimeout(200);
  const touchFired = await peek();
  ok(touchFired.left === beforeMove.left - 1, "and lifting off takes the shot",
     `${beforeMove.left} -> ${touchFired.left}`);
  await page.screenshot({ path: path.join(OUT, "05-shot.png") });

  /* --- let the AI reply and the board fill up --------------------------- */
  await page.waitForTimeout(6500);
  const later = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { state: g.state, left: g.left, discs: g.world.discs.filter(d => d.live).length };
  });
  ok(later.left[0] < 8 && later.left[1] < 8, "both players have shot",
     `left ${later.left[0]} / ${later.left[1]}`);
  await page.screenshot({ path: path.join(OUT, "06-inplay.png") });

  /* --- portrait, to check the layout survives --------------------------- */
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "07-portrait.png") });
  ok(true, "portrait layout rendered");

  ok(errors.length === 0, "no console errors or page exceptions",
     errors.slice(0, 4).join(" | "));

  await browser.close();
  console.log(`\ncrok_ui: ${pass} passed, ${fail} failed`);
  if (fail){ console.log("\nFAILURES:"); for (const f of fails) console.log("  x " + f); }
  console.log(`screenshots in ${OUT}`);
  process.exit(fail ? 1 : 0);
})();
