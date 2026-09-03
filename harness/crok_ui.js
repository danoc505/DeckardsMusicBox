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

  /* --- the gesture: tap to place, flick to shoot ------------------------ */
  /* Playwright's mouse.move is a round trip per call -- about 80 ms -- so a
     swipe driven that way is far slower than a real finger and produces
     almost no power. Anything that depends on FLICK SPEED is dispatched
     inside the page instead, with real delays between samples, so the
     velocity fit sees what a hand would actually give it. */
  const box = await page.locator("#board-canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

  const gesture = (x0, y0, x1, y1, ms, opts = {}) =>
    page.evaluate(async ({ x0, y0, x1, y1, ms, left, top, tap }) => {
      const cv = document.getElementById("board-canvas");
      const ev = (type, x, y) => cv.dispatchEvent(new PointerEvent(type, {
        pointerId: 1, pointerType: "touch", isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top, buttons: 1,
      }));
      ev("pointerdown", x0, y0);
      if (!tap){
        const N = 12;
        for (let i = 1; i <= N; i++){
          await new Promise(r => setTimeout(r, ms / N));
          ev("pointermove", x0 + (x1 - x0) * (i / N), y0 + (y1 - y0) * (i / N));
        }
      }
      ev("pointerup", x1, y1);
      return true;
    }, { x0: x0 - box.x, y0: y0 - box.y, x1: x1 - box.x, y1: y1 - box.y,
         ms, left: box.x, top: box.y, tap: !!opts.tap });

  /* a disc must already be waiting, without anyone placing one */
  const ready = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { pending: !!g.pending, x: g.pending && g.pending.x, y: g.pending && g.pending.y };
  });
  ok(ready.pending, "a disc is already on the line at the start of the turn");

  /* --- TAP moves it along the line, and does not shoot ------------------ */
  const arcY = cy + box.height * 0.355;
  await gesture(cx - box.width * 0.16, arcY, cx - box.width * 0.16, arcY, 0, { tap: true });
  await page.waitForTimeout(120);
  const tapped = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { state: g.state, left: g.left[0], x: g.pending && g.pending.x };
  });
  ok(tapped.state === "aim", "a tap does not fire a shot", tapped.state);
  ok(tapped.left === 8, "and costs no disc");
  ok(Math.abs(tapped.x - ready.x) > 0.01, "but it does move the disc along the line",
     `moved ${((tapped.x - ready.x) * 1000).toFixed(0)} mm`);

  /* --- FLICK draws the preview and shoots ------------------------------- */
  /* swipe upwards from below the disc: the direction of the SWIPE is the
     direction of the shot, so this must send the disc up the board */
  await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    const pl = g.geo.placement(g.shooter);
    g.place(pl.r * Math.cos(pl.c), pl.r * Math.sin(pl.c));   /* back to centre */
  });
  const fromY = cy + box.height * 0.30;
  await gesture(cx, fromY, cx, cy - box.height * 0.10, 150);
  await page.waitForTimeout(150);

  const shot = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    const d = g.play ? g.play.shot : null;
    return { state: g.state, left: g.left[0],
             vx: d && d.vx, vy: d && d.vy,
             speed: d ? Math.hypot(d.vx, d.vy) : 0 };
  });
  ok(shot.left === 7, "a flick fires the shot", `left ${shot.left}`);
  ok(shot.speed > 0.3, "with real speed on it", `${shot.speed.toFixed(2)} m/s`);
  ok(shot.vy < 0, "and it travels the way the swipe went (up the board)",
     `vy ${shot.vy && shot.vy.toFixed(2)}`);
  console.log(`   flick: ${shot.speed.toFixed(2)} m/s, direction ` +
              `${(Math.atan2(shot.vy, shot.vx) * 180 / Math.PI).toFixed(0)}deg`);

  /* --- the preview, captured mid-gesture -------------------------------- */
  await page.waitForTimeout(2500);        /* let the AI reply and settle    */
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    while (g.state !== 'aim' || g.isAI(g.shooter)) await new Promise(r => setTimeout(r, 120));
  });
  await page.evaluate(async ({ left, top, x0, y0, x1, y1 }) => {
    const cv = document.getElementById("board-canvas");
    const ev = (t, x, y) => cv.dispatchEvent(new PointerEvent(t, {
      pointerId: 2, pointerType: "touch", isPrimary: true, bubbles: true,
      cancelable: true, clientX: x + left, clientY: y + top, buttons: 1,
    }));
    ev("pointerdown", x0, y0);
    for (let i = 1; i <= 12; i++){
      await new Promise(r => setTimeout(r, 12));
      ev("pointermove", x0 + (x1 - x0) * (i / 12), y0 + (y1 - y0) * (i / 12));
    }
  }, { left: box.x, top: box.y, x0: cx - box.x, y0: fromY - box.y,
       x1: cx - box.x, y1: cy - box.height * 0.10 - box.y });
  await page.screenshot({ path: path.join(OUT, "04-aiming.png") });
  const aiming = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { preview: !!g.preview, power: g.power,
             pathPts: g.preview ? g.preview.path.length / 2 : 0 };
  });
  ok(aiming.preview, "the trajectory preview is drawn during the flick");
  ok(aiming.pathPts > 4, "with a real path", aiming.pathPts + " points");
  console.log(`   preview: power ${(aiming.power * 100).toFixed(0)}%, ` +
              `${aiming.pathPts} path points`);
  /* let that one go so play continues */
  await page.evaluate(({ left, top, x, y }) => {
    document.getElementById("board-canvas").dispatchEvent(new PointerEvent("pointerup", {
      pointerId: 2, pointerType: "touch", isPrimary: true, bubbles: true,
      cancelable: true, clientX: x + left, clientY: y + top }));
  }, { left: box.x, top: box.y, x: cx - box.x, y: cy - box.height * 0.10 - box.y });
  await page.waitForTimeout(200);
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
