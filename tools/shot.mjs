/**
 * THE RECORD IN THE REAL APP. Shoots the page's own piano roll — the canvas a
 * listener actually looks at — to a PNG, one per seed.
 *
 *   node tools/shot.mjs <genre> <seed> [seed...]     one PNG per seed
 *   node tools/shot.mjs <genre> --random 3           three seeds, drawn here
 *   node tools/shot.mjs lofi 42 --out shots --file "Some Other.html"
 *
 * WHY THIS EXISTS ALONGSIDE `roll.mjs`, WHICH DRAWS THE SAME RECORD.
 * `roll.mjs` is a picture of the pipeline: it imports `src/song.ts` and draws
 * what came out. This is a picture of THE PROGRAM: the built single file, the
 * module registry, the page's own `drawRoll`. They should agree, and the day
 * they do not, the disagreement is the bug — a build that shipped stale code,
 * a page reading a field the pipeline stopped writing. `roll.mjs` is the test
 * you run on every change; this is the one you run before you believe it.
 *
 * It needs a build (`npm run build`) and Playwright, which is why it is not
 * the everyday test. Nothing here touches audio: `compose` is pure and the
 * AudioContext is made lazily on Play, so no sound card is required.
 */
import { createRequire } from "node:module";
import { mkdirSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DEFAULT_PAGE = "Deckards Orchestrator MKIII.html";

/* ── FINDING PLAYWRIGHT ────────────────────────────────────────────────────
   The same search `dump.mjs` does, for the same reason: it may be a local
   dependency or a global install, and a tool that only works in one of those
   is a tool somebody has to fix before using. */
function loadPlaywright() {
  const bases = [
    join(ROOT, "node_modules") + "/",
    "/opt/node22/lib/node_modules/",
    "/usr/lib/node_modules/",
    "/usr/local/lib/node_modules/",
  ];
  for (const b of bases) {
    try { return createRequire(b)("playwright"); } catch (e) { /* next */ }
  }
  throw new Error("playwright not found — `npm i -D playwright` (Chromium is already at " +
                  (process.env.PLAYWRIGHT_BROWSERS_PATH || "the default path") + ")");
}

/* ── ARGUMENTS ───────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const named = (flag, fallback) => {
  const i = argv.indexOf("--" + flag);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) { i++; continue; }   // a flag and its value
  positional.push(argv[i]);
}

const genre = positional[0];
const randomCount = Number(named("random", 0));
const seeds = randomCount > 0
  ? Array.from({ length: randomCount }, () => Math.floor(Math.random() * 1e6))
  : positional.slice(1).map(Number).filter(Number.isFinite);

if (!genre || seeds.length === 0) {
  process.stderr.write(
    "usage: node tools/shot.mjs <genre> <seed> [seed...]\n" +
    "       node tools/shot.mjs <genre> --random 3\n" +
    "       [--out <dir>] [--seconds <n>] [--file <page.html>]\n");
  process.exit(2);
}

const file = resolve(named("file", join(ROOT, DEFAULT_PAGE)));
const out = resolve(named("out", join(ROOT, "shots")));
const seconds = named("seconds", "");

if (!existsSync(file)) {
  throw new Error("no such file: " + file + "\n  build it first: npm run build");
}

/* ── DRIVE THE PAGE ──────────────────────────────────────────────────────── */
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 2 });

/* a page error is a defect in the program, not in this tool — it is collected
   and reported at the end, because a page that boots badly still composes and
   a run that refuses to finish tells you less than one that says what broke */
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String((e && e.message) || e)));
page.on("console", (m) => { if (m.type() === "error") pageErrors.push("console: " + m.text()); });

await page.goto(pathToFileURL(file).href, { waitUntil: "load", timeout: 120000 });
/* waiting for the page's own first compose is waiting for the program to be
   ready, rather than for a fixed number of milliseconds */
await page.waitForFunction(
  () => { const s = document.getElementById("roll-sub"); return !!(s && s.textContent); },
  null, { timeout: 120000 });

const known = await page.evaluate(() =>
  [...document.querySelectorAll('input[name="genre"]')].map((r) => r.value));
if (!known.includes(genre)) {
  await browser.close();
  throw new Error(`no such genre: ${genre}\n  the page offers: ${known.join(", ")}`);
}

mkdirSync(out, { recursive: true });
const shot = [];

for (const seed of seeds) {
  await page.evaluate(({ g, s, sec }) => {
    const radio = document.querySelector(`input[name="genre"][value="${g}"]`);
    if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
    document.getElementById("seed").value = String(s);
    document.getElementById("seconds").value = sec;
  }, { g: genre, s: seed, sec: seconds });

  await page.click("#compose");
  /* the summary carries the seed, so waiting for it to say THIS seed is
     waiting for the compose to have landed rather than for a timer */
  await page.waitForFunction(
    (s) => (document.getElementById("roll-sub").textContent || "").includes("seed " + s),
    String(seed), { timeout: 120000 });

  const path = join(out, `roll-${genre}-${seed}.png`);
  await page.locator("#roll-crt").screenshot({ path });
  const sub = (await page.textContent("#roll-sub")) || "";
  shot.push({ seed, path, sub });
  process.stdout.write(`${path}\n  ${sub}\n`);
}

await browser.close();

if (pageErrors.length) {
  process.stderr.write("\nTHE PAGE REPORTED ERRORS — the shots above may be of a broken program:\n");
  for (const e of [...new Set(pageErrors)].slice(0, 10)) process.stderr.write("  " + e + "\n");
  process.exit(1);
}
process.stdout.write(`\n${shot.length} shot${shot.length === 1 ? "" : "s"} in ${out}\n`);
