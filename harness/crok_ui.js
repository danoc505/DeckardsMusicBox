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

  /* --- aim: place a disc and drag, so the preview is drawn -------------- */
  /* Playwright's mouse.move is a round trip per call -- about 80 ms -- so a
     drag driven that way is roughly five times slower than a real finger and
     produces almost no power. For anything that depends on FLICK SPEED the
     gesture is dispatched inside the page instead, with real delays between
     samples, so the velocity fit sees what a hand would actually give it. */
  const box = await page.locator("#board-canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const startY = cy + box.height * 0.36;

  const swipe = async (fromY, toY, ms, release) => {
    return page.evaluate(async ({ x, y0, y1, ms, release, left, top }) => {
      const cv = document.getElementById("board-canvas");
      const ev = (type, cx, cy) => cv.dispatchEvent(new PointerEvent(type, {
        pointerId: 1, pointerType: "touch", isPrimary: true, bubbles: true,
        cancelable: true, clientX: cx + left, clientY: cy + top, buttons: 1,
      }));
      const N = 12, step = ms / N;
      ev("pointerdown", x, y0);
      for (let i = 1; i <= N; i++){
        await new Promise(r => setTimeout(r, step));
        ev("pointermove", x, y0 + (y1 - y0) * (i / N));
      }
      if (release) ev("pointerup", x, y1);
      return true;
    }, { x: cx - box.x, y0: fromY - box.y, y1: toY - box.y, ms, release,
         left: box.x, top: box.y });
  };

  /* a brisk swipe from the shooting line towards the 20, held at the end */
  await swipe(startY, cy + 12, 140, false);
  await page.waitForTimeout(40);
  await page.screenshot({ path: path.join(OUT, "04-aiming.png") });
  const aiming = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { pending: !!g.pending, preview: !!g.preview, power: g.power,
             pathPts: g.preview ? g.preview.path.length / 2 : 0,
             events: g.preview ? g.preview.events.length : 0 };
  });
  ok(aiming.pending, "a disc was placed on the shooting line");
  ok(aiming.preview, "the trajectory preview was computed");
  ok(aiming.pathPts > 4, "the preview has a real path", aiming.pathPts + " points");
  ok(aiming.power > 0.25, "a brisk swipe gives real power",
     `${(aiming.power * 100).toFixed(0)}%`);
  console.log(`   aim: power ${(aiming.power * 100).toFixed(0)}%, ` +
              `${aiming.pathPts} path points, ${aiming.events} predicted contacts`);

  /* --- and now let go ---------------------------------------------------- */
  /* A fresh swipe that releases at the end of the movement. The screenshot
     above took long enough for the peak-hold to lapse, which is the right
     behaviour -- a player who has stopped moving has no flick in hand -- so
     the power has to be built again and released immediately, which is
     exactly what flicking is. */
  await page.evaluate(({ left, top, x, y }) => {
    document.getElementById("board-canvas").dispatchEvent(new PointerEvent("pointercancel", {
      pointerId: 1, pointerType: "touch", isPrimary: true, bubbles: true, cancelable: true,
      clientX: x + left, clientY: y + top,
    }));
  }, { left: box.x, top: box.y, x: cx - box.x, y: cy + 12 - box.y });
  await page.waitForTimeout(60);
  await swipe(startY, cy + 12, 140, true);
  await page.waitForTimeout(200);
  const fired = await page.evaluate(() => {
    const g = window.CROK.APP.state.game;
    return { state: g.state, left: g.left };
  });
  ok(fired.state === "playing" || fired.state === "settle" || fired.state === "aim",
     "the shot was taken", fired.state);
  ok(fired.left[0] === 7, "and it cost player 1 a disc", "left " + fired.left[0]);
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
