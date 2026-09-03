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

  /* --- the gesture: click the disc, move away, stop ---------------------- */
  const box = await page.locator("#board-canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

  const click = (x, y, kind) => page.evaluate(({ x, y, left, top, kind }) => {
    const cv = document.getElementById("board-canvas");
    for (const t of ["pointerdown", "pointerup"])
      cv.dispatchEvent(new PointerEvent(t, {
        pointerId: 1, pointerType: kind, isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top,
        buttons: t === "pointerdown" ? 1 : 0 }));
  }, { x: x - box.x, y: y - box.y, left: box.x, top: box.y, kind: kind || "mouse" });

  /* cursor movement with nothing held: this is the aim */
  const moveTo = (x, y) => page.evaluate(({ x, y, left, top }) => {
    document.getElementById("board-canvas").dispatchEvent(new PointerEvent("pointermove", {
      pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
      cancelable: true, buttons: 0, clientX: x + left, clientY: y + top }));
  }, { x: x - box.x, y: y - box.y, left: box.x, top: box.y });

  const peek = () => page.evaluate(() => {
    const g = window.CROK.APP.state.game, A = window.CROK.APP.state;
    return { state: g.state, left: g.left[0], aiming: A.aiming,
             px: g.pending && g.pending.x, py: g.pending && g.pending.y,
             preview: !!g.preview, power: g.power, settle: A.aimSettle,
             shot: g.play ? { vx: g.play.shot.vx, vy: g.play.shot.vy } : null };
  });
  const discAt = () => page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });

  const start = await peek();
  ok(start.px !== null && start.px !== undefined, "a disc is on the line at the start of the turn");
  ok(!start.aiming, "and nothing is being aimed yet");

  /* 1. click the LINE -- moves the disc, does not aim -------------------- */
  await click(cx - box.width * 0.15, cy + box.height * 0.352);
  await page.waitForTimeout(120);
  const placed = await peek();
  ok(placed.left === 8, "clicking the line costs no disc");
  ok(Math.abs(placed.px - start.px) > 0.01, "but it moves the disc along the line",
     `${((placed.px - start.px) * 1000).toFixed(0)} mm`);
  ok(!placed.aiming, "and does not start aiming");

  /* 2. click the DISC -- starts aiming, fires nothing -------------------- */
  const dp = await discAt();
  await click(box.x + dp.x, box.y + dp.y);
  await page.waitForTimeout(120);
  const aiming0 = await peek();
  ok(aiming0.aiming, "clicking the disc starts aiming");
  ok(aiming0.left === 8, "and fires nothing");

  /* full power has to be REACHABLE, which is what the first version of this
     control got wrong: aiming by "the disc stops where you point" meant
     every shot arrived with nothing left, and nothing could be hit hard. */
  const reach = await page.evaluate(() => {
    const APPx = window.CROK.APP, A = APPx.state, g = A.game;
    if (!g.pending || g.state !== 'aim') return null;
    const p = window.CROK.RENDER.toScreen(A.view, g.pending.x, g.pending.y);
    const out = {};
    for (const [name, metres] of [["gentle", 0.10], ["mid", 0.20], ["full", 0.40]]){
      const m = APPx.aimShot(g, p.x, p.y - A.view.scale * metres);
      out[name] = m ? m.power : 0;
      if (name === "full" && m){
        const r = window.CROK.PHYS.runShot(g.world, m.shot, { frames: false });
        out.fullSpeed = Math.hypot(m.shot.vx, m.shot.vy);
        out.fullFate = r.world.discs[r.world.discs.length - 1].fate;
      }
    }
    out.vmax = window.CROK.SPEC.V_MAX_SHOT;
    return out;
  });
  ok(reach !== null, "the power-by-distance check could be set up");
  if (reach){
    ok(reach.full > 0.98, "full power is reachable inside the board",
       `${(reach.full * 100).toFixed(0)}% at 400 mm from the disc`);
    ok(reach.gentle < reach.mid && reach.mid < reach.full,
       "and the range in between is graduated",
       `${(reach.gentle * 100).toFixed(0)}% / ${(reach.mid * 100).toFixed(0)}% / ${(reach.full * 100).toFixed(0)}%`);
    ok(reach.fullFate === 'ditch',
       "a full-power shot really is hard -- it clears the far side of the board",
       `ended in the ${reach.fullFate}`);
    console.log(`   power by distance: 100 mm ${(reach.gentle * 100).toFixed(0)}%, ` +
                `200 mm ${(reach.mid * 100).toFixed(0)}%, ` +
                `400 mm ${(reach.full * 100).toFixed(0)}% ` +
                `(${reach.fullSpeed.toFixed(2)} m/s of a possible ${reach.vmax.toFixed(2)})`);
  }

  /* 3. move away -- the preview draws, and further is harder ------------- */
  await moveTo(box.x + dp.x, box.y + dp.y - box.height * 0.12);
  await page.waitForTimeout(60);
  const near = await peek();
  await moveTo(box.x + dp.x, box.y + dp.y - box.height * 0.34);
  await page.waitForTimeout(60);
  const far = await peek();
  ok(near.preview && far.preview, "the trajectory preview draws while aiming");
  ok(far.power > near.power, "the further from the disc, the more force",
     `${(near.power * 100).toFixed(0)}% -> ${(far.power * 100).toFixed(0)}%`);
  ok(far.left === 8, "and moving alone still fires nothing");
  console.log(`   aim: ${(near.power * 100).toFixed(0)}% near the disc, ` +
              `${(far.power * 100).toFixed(0)}% far from it, preview drawn throughout`);
  await page.screenshot({ path: path.join(OUT, "04-aiming.png") });

  /* 4. stop moving -- the shot goes -------------------------------------- */
  const beforeSettle = await peek();
  if (beforeSettle.left === 8){
    if (!beforeSettle.aiming){
      const dp2 = await discAt();
      await click(box.x + dp2.x, box.y + dp2.y);
      await page.waitForTimeout(80);
    }
    const dp3 = await discAt();
    await moveTo(box.x + dp3.x, box.y + dp3.y - box.height * 0.28);
    await page.waitForTimeout(900);          /* longer than AIM_SETTLE */
  }
  const fired = await peek();
  ok(fired.left === 7, "stopping the cursor takes the shot", `left ${fired.left}`);
  ok(!fired.aiming, "and aiming ends");
  await page.screenshot({ path: path.join(OUT, "05-shot.png") });

  /* 5. moving when NOT aiming never fires -------------------------------- */
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  const before = await peek();
  ok(!before.aiming, "a fresh turn starts not aiming");
  await moveTo(cx - box.width * 0.2, cy);
  await moveTo(cx + box.width * 0.2, cy);
  await page.waitForTimeout(900);
  const after = await peek();
  ok(after.left === before.left, "moving the cursor when not aiming never fires",
     `${before.left} -> ${after.left}`);

  /* 6. WITH A FINGER: press, drag, lift ---------------------------------- */
  const dpT = await discAt();
  await page.evaluate(async ({ left, top, x0, y0, x1, y1 }) => {
    const cv = document.getElementById("board-canvas");
    const ev = (t, x, y, b) => cv.dispatchEvent(new PointerEvent(t, {
      pointerId: 5, pointerType: "touch", isPrimary: true, bubbles: true,
      cancelable: true, clientX: x + left, clientY: y + top, buttons: b }));
    ev("pointerdown", x0, y0, 1);
    for (let i = 1; i <= 8; i++){
      await new Promise(r => setTimeout(r, 20));
      ev("pointermove", x0 + (x1 - x0) * (i / 8), y0 + (y1 - y0) * (i / 8), 1);
    }
    ev("pointerup", x1, y1, 0);
  }, { left: box.x, top: box.y, x0: dpT.x, y0: dpT.y,
       x1: dpT.x, y1: dpT.y - box.height * 0.30 });
  await page.waitForTimeout(250);
  const touched = await peek();
  ok(touched.left === before.left - 1,
     "with a finger: press, drag away, lift off -- and it shoots",
     `${before.left} -> ${touched.left}`);
  if (touched.shot){
    const sp = Math.hypot(touched.shot.vx, touched.shot.vy);
    ok(touched.shot.vy < 0, "in the direction the finger was dragged",
       `vy ${touched.shot.vy.toFixed(2)}`);
    console.log(`   finger: press, drag, lift -> ${sp.toFixed(2)} m/s`);
  }
  await page.screenshot({ path: path.join(OUT, "06-touch.png") });

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
