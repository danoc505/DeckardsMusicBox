/* SHARED LOADER for the crokinole probes.

   Every probe reads ../Crokinole.html directly -- the shipped file, not a
   copy of it -- pulls out the single <script> body, and evaluates it with
   enough of a browser stubbed out that the engine comes up. Nothing here
   knows anything about the game; it only knows how to open it.

   The point of loading the artifact itself is that a probe can never pass
   against code that is not the code being shipped. */
const fs = require("fs"), path = require("path");

function loadCrok(){
  const file = path.resolve(__dirname, "..", "Crokinole.html");
  const html = fs.readFileSync(file, "utf8");
  const open = html.indexOf("<script>");
  const close = html.lastIndexOf("</script>");
  if (open < 0 || close < 0) throw new Error("no <script> block in Crokinole.html");
  const src = html.slice(open + "<script>".length, close);

  /* the least browser that will do. Canvas is stubbed to a recording no-op:
     the physics and rules probes never draw, and the ones that do only need
     the calls not to throw. */
  const noop = () => {};
  const ctx2d = new Proxy({}, {
    get(t, k){
      if (k === "canvas") return { width: 1, height: 1 };
      if (k === "createImageData") return (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === "createRadialGradient" || k === "createLinearGradient")
        return () => ({ addColorStop: noop });
      if (k === "getImageData") return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
      if (k === "measureText") return () => ({ width: 10 });
      return noop;
    },
    set(){ return true; },
  });
  const mkCanvas = () => ({
    width: 300, height: 150, style: {},
    getContext: () => ctx2d,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 900, height: 700 }),
    addEventListener: noop, removeEventListener: noop,
    setPointerCapture: noop, releasePointerCapture: noop,
  });
  const mkEl = () => ({
    style: {}, dataset: {}, classList: { add: noop, remove: noop, toggle: noop,
                                         contains: () => false },
    textContent: "", innerHTML: "", value: "",
    addEventListener: noop, removeEventListener: noop,
    setAttribute: noop, getAttribute: () => null,
    querySelectorAll: () => [], closest: () => null,
    appendChild: noop, getContext: () => ctx2d,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 900, height: 700 }),
  });

  global.window = {
    addEventListener: noop, devicePixelRatio: 2,
    AudioContext: null, webkitAudioContext: null,
  };
  global.document = {
    readyState: "complete",
    /* returning null for board-canvas is what stops APP.init() running: the
       probes want the engine, not the app */
    getElementById: (id) => (id === "board-canvas" ? null : mkEl()),
    createElement: (t) => (t === "canvas" ? mkCanvas() : mkEl()),
    addEventListener: noop,
  };
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = noop;
  global.cancelAnimationFrame = noop;

  eval(src);
  const CROK = global.window.CROK;
  if (!CROK) throw new Error("Crokinole.html evaluated but window.CROK is not set");
  return CROK;
}

/* --- the tiny assertion harness every probe shares --------------------- */
function Checks(title){
  let pass = 0, fail = 0;
  const fails = [];
  const c = {
    ok(cond, what, detail){
      if (cond){ pass++; }
      else { fail++; fails.push(what + (detail ? "  <-- " + detail : "")); }
      return !!cond;
    },
    near(a, b, tol, what){
      const d = Math.abs(a - b);
      return c.ok(d <= tol, what, `got ${a}, expected ${b} +-${tol} (off by ${d})`);
    },
    eq(a, b, what){ return c.ok(a === b, what, `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); },
    report(){
      console.log(`\n${title}: ${pass} passed, ${fail} failed`);
      if (fail){
        console.log("\nFAILURES:");
        for (const f of fails) console.log("  x " + f);
      }
      return fail;
    },
    get pass(){ return pass; },
    get fail(){ return fail; },
  };
  return c;
}

module.exports = { loadCrok, Checks };
