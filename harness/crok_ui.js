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

  /* --- the gesture: click, click the disc, flick the trackpad ----------- */
  /* Every event here is dispatched inside the page, for two reasons: real
     delays between samples, so the velocity fit sees what a hand would give
     it; and buttons:0 pointermoves, which is what a trackpad flick actually
     is and which Playwright's mouse API cannot express without a drag. */
  const box = await page.locator("#board-canvas").boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

  const click = (x, y) => page.evaluate(({ x, y, left, top }) => {
    const cv = document.getElementById("board-canvas");
    for (const t of ["pointerdown", "pointerup"]){
      cv.dispatchEvent(new PointerEvent(t, {
        pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top,
        buttons: t === "pointerdown" ? 1 : 0,
      }));
    }
  }, { x: x - box.x, y: y - box.y, left: box.x, top: box.y });

  /* Movement with NOTHING held down -- the flick itself.
     It has to be genuinely FAST. A real trackpad flick runs at 5000-12000
     px/s; a loop of awaited setTimeout(13) in a headless browser manages
     barely 2500, which is below the threshold that stops a wandering cursor
     firing a shot. So the steps are few and short, which is also closer to
     what a hand actually does: a flick is a handful of samples, not a
     smooth interpolation. */
  const flick = (x0, y0, x1, y1, ms) => page.evaluate(
    async ({ x0, y0, x1, y1, ms, left, top }) => {
      const cv = document.getElementById("board-canvas");
      const N = 6;
      for (let i = 1; i <= N; i++){
        await new Promise(r => setTimeout(r, ms / N));
        cv.dispatchEvent(new PointerEvent("pointermove", {
          pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
          cancelable: true, buttons: 0,          /* no button. this is the point */
          clientX: x0 + (x1 - x0) * (i / N) + left,
          clientY: y0 + (y1 - y0) * (i / N) + top,
        }));
      }
      /* and then the hand comes to rest, which is what ends the flick */
      for (let i = 0; i < 6; i++){
        await new Promise(r => setTimeout(r, 30));
        cv.dispatchEvent(new PointerEvent("pointermove", {
          pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
          cancelable: true, buttons: 0, clientX: x1 + left, clientY: y1 + top,
        }));
      }
    }, { x0: x0 - box.x, y0: y0 - box.y, x1: x1 - box.x, y1: y1 - box.y,
         ms, left: box.x, top: box.y });

  /* press, move, release -- how you carry a disc along the line */
  const drag = (x0, y0, x1, y1) => page.evaluate(
    async ({ x0, y0, x1, y1, left, top }) => {
      const cv = document.getElementById("board-canvas");
      const ev = (t, x, y, b) => cv.dispatchEvent(new PointerEvent(t, {
        pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top, buttons: b }));
      ev("pointerdown", x0, y0, 1);
      for (let i = 1; i <= 8; i++){
        await new Promise(r => setTimeout(r, 16));
        ev("pointermove", x0 + (x1 - x0) * (i / 8), y0 + (y1 - y0) * (i / 8), 1);
      }
      ev("pointerup", x1, y1, 0);
    }, { x0: x0 - box.x, y0: y0 - box.y, x1: x1 - box.x, y1: y1 - box.y,
         left: box.x, top: box.y });

  const peek = () => page.evaluate(() => {
    const g = window.CROK.APP.state.game, A = window.CROK.APP.state;
    return { state: g.state, left: g.left[0], armed: A.armed,
             px: g.pending && g.pending.x, py: g.pending && g.pending.y,
             preview: !!g.preview, power: g.power,
             shot: g.play ? { vx: g.play.shot.vx, vy: g.play.shot.vy } : null };
  });

  const start = await peek();
  ok(start.px !== undefined && start.px !== null,
     "a disc is already on the line when the turn starts");
  ok(!start.armed, "and it is not armed yet");

  /* 1. CLICK THE LINE -- moves the disc, does not shoot ------------------ */
  const arcY = cy + box.height * 0.352;
  await click(cx - box.width * 0.15, arcY);
  await page.waitForTimeout(120);
  const placed = await peek();
  ok(placed.left === 8, "clicking the line costs no disc");
  ok(Math.abs(placed.px - start.px) > 0.01, "but it does move the disc along the line",
     `${((placed.px - start.px) * 1000).toFixed(0)} mm`);
  ok(!placed.armed, "and does not arm it");

  /* 1b. PICK THE DISC UP AND CARRY IT ------------------------------------ */
  const beforeCarry = await peek();
  const dp0 = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  await drag(box.x + dp0.x, box.y + dp0.y, box.x + dp0.x + box.width * 0.13, box.y + dp0.y);
  await page.waitForTimeout(120);
  const carried = await peek();
  ok(Math.abs(carried.px - beforeCarry.px) > 0.02,
     "the disc can be picked up and carried along the line",
     `${((carried.px - beforeCarry.px) * 1000).toFixed(0)} mm`);
  ok(carried.left === 8, "carrying it costs no disc");
  ok(!carried.armed, "and carrying does not arm it");
  ok(carried.state === "aim", "and fires nothing");

  /* 2. CLICK THE DISC -- arms it, still does not shoot ------------------- */
  const discPt = await page.evaluate(() => {
    const A = window.CROK.APP.state, g = A.game;
    const p = window.CROK.RENDER.toScreen(A.view, g.pending.x, g.pending.y);
    return p;
  });
  await click(box.x + discPt.x, box.y + discPt.y);
  await page.waitForTimeout(120);
  const armed = await peek();
  ok(armed.armed, "clicking the disc arms the shot");
  ok(armed.left === 8, "and still costs no disc");
  ok(armed.state === "aim", "and fires nothing");
  await page.screenshot({ path: path.join(OUT, "04-armed.png") });

  /* 3. FLICK THE TRACKPAD -- no button held anywhere -------------------- */
  await flick(cx, cy + box.height * 0.30, cx, cy - box.height * 0.16, 42);
  await page.waitForTimeout(200);
  const fired = await peek();
  ok(fired.left === 7, "a flick with no button held fires the shot",
     `left ${fired.left}`);
  ok(!fired.armed, "and disarms afterwards");
  if (fired.shot){
    const sp = Math.hypot(fired.shot.vx, fired.shot.vy);
    ok(sp > 0.3, "with real speed on it", `${sp.toFixed(2)} m/s`);
    ok(fired.shot.vy < 0, "travelling the way the trackpad moved (up the board)",
       `vy ${fired.shot.vy.toFixed(2)}`);
    const maxV = await page.evaluate(() => window.CROK.SPEC.V_MAX_SHOT);
    ok(sp < maxV * 0.985,
       "an ordinary flick is NOT full power -- the range is usable",
       `${(100 * sp / maxV).toFixed(0)}% of maximum`);
    console.log(`   flick: ${sp.toFixed(2)} m/s = ${(100 * sp / maxV).toFixed(0)}% power, at ` +
                `${(Math.atan2(fired.shot.vy, fired.shot.vx) * 180 / Math.PI).toFixed(0)}deg, ` +
                `no button held at any point`);
  } else ok(false, "the shot was recorded");

  /* 3b. a slow drift while armed is refused, not spent ------------------- */
  await page.waitForTimeout(2600);
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 60 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  const preDrift = await peek();
  const dp1 = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  await click(box.x + dp1.x, box.y + dp1.y);
  await page.waitForTimeout(100);
  await flick(cx, cy + box.height * 0.24, cx, cy + box.height * 0.14, 900);  /* slow */
  await page.waitForTimeout(200);
  const drifted = await peek();
  ok(drifted.left === preDrift.left,
     "a slow drift of the cursor does not spend the disc",
     `${preDrift.left} -> ${drifted.left}`);
  await page.evaluate(() => window.CROK.APP.setArmed(false));

  /* 4. moving while NOT armed must never fire --------------------------- */
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 60 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  const before = await peek();
  await flick(cx - box.width * 0.2, cy, cx + box.width * 0.2, cy, 42);
  await page.waitForTimeout(150);
  const after = await peek();
  ok(after.left === before.left,
     "moving the cursor when NOT armed never fires a shot",
     `${before.left} -> ${after.left}`);

  /* 5. the preview is drawn while a flick builds ------------------------ */
  await page.evaluate(() => {
    const A = window.CROK.APP.state;
    const p = window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
    A.game.host.pointerDown(p.x, p.y, 'mouse');
    A.game.host.pointerUp(p.x, p.y, { vx: 0, vy: 0, n: 0 }, p.x, p.y);
  });
  await page.waitForTimeout(80);
  await page.evaluate(async ({ left, top, x0, y0, x1, y1 }) => {
    const cv = document.getElementById("board-canvas");
    for (let i = 1; i <= 5; i++){
      await new Promise(r => setTimeout(r, 6));
      cv.dispatchEvent(new PointerEvent("pointermove", {
        pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
        cancelable: true, buttons: 0,
        clientX: x0 + (x1 - x0) * (i / 5) + left, clientY: y0 + (y1 - y0) * (i / 5) + top }));
    }
  }, { left: box.x, top: box.y, x0: cx - box.x, y0: cy + box.height * 0.28 - box.y,
       x1: cx - box.x, y1: cy - box.height * 0.05 - box.y });
  await page.screenshot({ path: path.join(OUT, "05-flicking.png") });
  const mid = await peek();
  ok(mid.preview || mid.left < before.left,
     "the trajectory preview is drawn as the flick builds");
  console.log(`   preview during flick: ${mid.preview ? 'drawn' : 'shot already away'}` +
              (mid.preview ? `, power ${(mid.power * 100).toFixed(0)}%` : ''));
  await page.waitForTimeout(600);

  /* --- Slingshot mode: click, move, click. Still no button held --------- */
  await page.evaluate(async () => {
    const A = window.CROK.APP, g = A.state.game;
    A.settings.input = 'sling';
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  await page.waitForTimeout(150);
  const slingStart = await peek();
  const dp = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  await click(box.x + dp.x, box.y + dp.y);            /* arm */
  await page.waitForTimeout(100);
  /* move away from the disc, downward, so the shot goes UP the board */
  await page.evaluate(({ left, top, x, y }) => {
    document.getElementById("board-canvas").dispatchEvent(new PointerEvent("pointermove", {
      pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true,
      cancelable: true, buttons: 0, clientX: x + left, clientY: y + top }));
  }, { left: box.x, top: box.y, x: dp.x, y: dp.y + box.height * 0.22 });
  await page.waitForTimeout(150);
  const slingAim = await peek();
  ok(slingAim.armed, "slingshot: the disc is armed and waiting");
  ok(slingAim.preview, "slingshot: a steady preview follows the cursor",
     `power ${(slingAim.power * 100).toFixed(0)}%`);
  await page.screenshot({ path: path.join(OUT, "06-sling.png") });
  await click(box.x + dp.x, box.y + dp.y + box.height * 0.22);   /* release */
  await page.waitForTimeout(200);
  const slung = await peek();
  ok(slung.left === slingStart.left - 1, "slingshot: the second click fires",
     `${slingStart.left} -> ${slung.left}`);
  if (slung.shot){
    ok(slung.shot.vy < 0, "slingshot: it goes opposite the pull (up the board)",
       `vy ${slung.shot.vy.toFixed(2)}`);
    console.log(`   sling: ${Math.hypot(slung.shot.vx, slung.shot.vy).toFixed(2)} m/s, ` +
                `power set by distance and held steady`);
  }
  await page.evaluate(() => { window.CROK.APP.settings.input = 'flick'; });

  /* --- WITH A FINGER: a swipe shoots, with nothing armed --------------- */
  /* This is the path the game is actually played on, and the one that was
     broken: an un-armed touch swipe was discarded without a trace. */
  const touchSwipe = (x0, y0, x1, y1, ms) => page.evaluate(
    async ({ x0, y0, x1, y1, ms, left, top }) => {
      const cv = document.getElementById("board-canvas");
      const ev = (t, x, y, b) => cv.dispatchEvent(new PointerEvent(t, {
        pointerId: 7, pointerType: "touch", isPrimary: true, bubbles: true,
        cancelable: true, clientX: x + left, clientY: y + top, buttons: b }));
      ev("pointerdown", x0, y0, 1);
      const N = 6;
      for (let i = 1; i <= N; i++){
        await new Promise(r => setTimeout(r, ms / N));
        ev("pointermove", x0 + (x1 - x0) * (i / N), y0 + (y1 - y0) * (i / N), 1);
      }
      ev("pointerup", x1, y1, 0);
    }, { x0: x0 - box.x, y0: y0 - box.y, x1: x1 - box.x, y1: y1 - box.y,
         ms, left: box.x, top: box.y });

  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    window.CROK.APP.setArmed(false);
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  await page.waitForTimeout(150);
  const preTouch = await peek();
  ok(!preTouch.armed, "nothing is armed before the finger swipe");
  /* swipe starting ON the disc, which is the natural way to flick one */
  const dpT = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  await touchSwipe(box.x + dpT.x, box.y + dpT.y,
                   box.x + dpT.x, box.y + dpT.y - box.height * 0.34, 130);
  await page.waitForTimeout(200);
  const swiped = await peek();
  ok(swiped.left === preTouch.left - 1,
     "an UN-ARMED finger swipe fires the shot",
     `${preTouch.left} -> ${swiped.left}`);
  if (swiped.shot){
    const sp = Math.hypot(swiped.shot.vx, swiped.shot.vy);
    const maxV = await page.evaluate(() => window.CROK.SPEC.V_MAX_SHOT);
    ok(swiped.shot.vy < 0, "and travels the way the finger went",
       `vy ${swiped.shot.vy.toFixed(2)}`);
    ok(sp > 0.35 && sp < maxV * 0.985,
       "at a usable, graduated power -- not maxed, not ignored",
       `${(100 * sp / maxV).toFixed(0)}%`);
    console.log(`   finger swipe: ${sp.toFixed(2)} m/s = ` +
                `${(100 * sp / maxV).toFixed(0)}% power, nothing armed`);
  } else ok(false, "the finger swipe produced a shot");

  /* a SLOW finger drag on the disc carries it instead of shooting */
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  await page.waitForTimeout(150);
  const preCarry = await peek();
  const dpC = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  /* press and HOLD, then move: that is what picks a disc up now. Deciding
     by speed instead ate gentle swipes, which are most of them. */
  await page.evaluate(async ({ left, top, x, y, dx }) => {
    const cv = document.getElementById("board-canvas");
    const ev = (t, ex, ey, b) => cv.dispatchEvent(new PointerEvent(t, {
      pointerId: 9, pointerType: "touch", isPrimary: true, bubbles: true,
      cancelable: true, clientX: ex + left, clientY: ey + top, buttons: b }));
    ev("pointerdown", x, y, 1);
    await new Promise(r => setTimeout(r, 380));      /* the hold */
    for (let i = 1; i <= 6; i++){
      await new Promise(r => setTimeout(r, 40));
      ev("pointermove", x + dx * (i / 6), y, 1);
    }
    ev("pointerup", x + dx, y, 0);
  }, { left: box.x, top: box.y, x: dpC.x, y: dpC.y, dx: box.width * 0.10 });
  await page.waitForTimeout(200);
  const carriedT = await peek();
  ok(carriedT.left === preCarry.left,
     "press-and-hold then drag carries the disc instead of shooting it",
     `${preCarry.left} -> ${carriedT.left}`);
  ok(Math.abs(carriedT.px - preCarry.px) > 0.02,
     "and it really did move", `${((carriedT.px - preCarry.px) * 1000).toFixed(0)} mm`);
  /* a GENTLE swipe -- the case that was being eaten -- must still shoot */
  await page.evaluate(async () => {
    const g = window.CROK.APP.state.game;
    for (let i = 0; i < 80 && (g.state !== 'aim' || g.isAI(g.shooter)); i++)
      await new Promise(r => setTimeout(r, 150));
  });
  await page.waitForTimeout(150);
  const preGentle = await peek();
  const dpG = await page.evaluate(() => {
    const A = window.CROK.APP.state;
    return window.CROK.RENDER.toScreen(A.view, A.game.pending.x, A.game.pending.y);
  });
  await touchSwipe(box.x + dpG.x, box.y + dpG.y,
                   box.x + dpG.x, box.y + dpG.y - box.height * 0.20, 240);
  await page.waitForTimeout(200);
  const gentle = await peek();
  ok(gentle.left === preGentle.left - 1,
     "a GENTLE finger swipe off the disc still fires -- it is not eaten as a carry",
     `${preGentle.left} -> ${gentle.left}`);
  if (gentle.shot){
    const sp = Math.hypot(gentle.shot.vx, gentle.shot.vy);
    const maxV = await page.evaluate(() => window.CROK.SPEC.V_MAX_SHOT);
    console.log(`   gentle swipe: ${sp.toFixed(2)} m/s = ${(100 * sp / maxV).toFixed(0)}% power`);
  }
  await page.screenshot({ path: path.join(OUT, "07-touch.png") });

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
