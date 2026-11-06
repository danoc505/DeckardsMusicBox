// The Workshop's server, run inside the browser (for the iPad website).
//
// Python (Pyodide) runs the very same tools/serve.py the laptop uses, so the
// website answers exactly as `python3 tools/serve.py` would. The library
// database is not downloaded whole: it is split into small compressed pieces
// and each piece is fetched the first time SQLite reads from it.
// Your own work (data/user.sqlite) lives in this browser's storage.
"use strict";

const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
importScripts(PYODIDE + "pyodide.js");
importScripts("https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js");

const BASE = new URL("../", self.location.href).href;   // the site root
let py = null;
let handle = null;
let FS = null;
let fetched = 0;

function getJSON(url) {
  const x = new XMLHttpRequest();
  x.open("GET", url, false);
  x.send();
  if (x.status !== 200) throw new Error(`${url}: ${x.status}`);
  return JSON.parse(x.responseText);
}

// A read-only file whose bytes are fetched piece by piece, on demand.
function lazyFile(dir, name, info) {
  const cache = new Map();          // piece number -> Uint8Array, most recent last
  const MAX = 96;                   // pieces kept in memory (about 50 MB)
  function piece(i) {
    let p = cache.get(i);
    if (p) { cache.delete(i); cache.set(i, p); return p; }
    const x = new XMLHttpRequest();
    x.open("GET", BASE + info.base + String(i).padStart(5, "0") + ".gz", false);
    x.responseType = "arraybuffer";
    x.send();
    if (x.status !== 200) throw new Error(`piece ${i}: ${x.status}`);
    p = fflate.gunzipSync(new Uint8Array(x.response));
    fetched += 1;
    cache.set(i, p);
    if (cache.size > MAX) cache.delete(cache.keys().next().value);
    return p;
  }
  const node = FS.createFile(dir, name, {}, true, false);
  Object.defineProperty(node, "usedBytes", { get: () => info.size });
  const ops = Object.assign({}, node.stream_ops);
  ops.read = (stream, buffer, offset, length, position) => {
    if (position >= info.size) return 0;
    const end = Math.min(info.size, position + length);
    let done = 0;
    for (let pos = position; pos < end;) {
      const i = Math.floor(pos / info.chunk);
      const p = piece(i);
      const from = pos - i * info.chunk;
      const n = Math.min(p.length - from, end - pos);
      buffer.set(p.subarray(from, from + n), offset + done);
      done += n; pos += n;
    }
    return done;
  };
  node.stream_ops = ops;
}

function syncfs(populate) {
  return new Promise((ok, fail) => FS.syncfs(populate, (e) => (e ? fail(e) : ok())));
}

async function start() {
  py = await loadPyodide({ indexURL: PYODIDE });
  await py.loadPackage("sqlite3");
  FS = py.FS;
  const files = getJSON(BASE + "web/files.json");
  for (const [path, text] of Object.entries(files)) {
    const full = "/workshop/" + path;
    FS.mkdirTree(full.slice(0, full.lastIndexOf("/")));
    FS.writeFile(full, text);
  }
  const info = getJSON(BASE + "web/db.json");
  FS.mkdirTree("/workshop/data");
  lazyFile("/workshop/data", "workshop.sqlite", info);
  // Your work: kept in this browser (IndexedDB), saved after every change.
  FS.mkdirTree("/mine");
  FS.mount(FS.filesystems.IDBFS, {}, "/mine");
  await syncfs(true);
  py.runPython(new TextDecoder().decode(FS.readFile("/workshop/web/bridge.py")));
  py.globals.get("setup")();
  handle = py.globals.get("handle");
}

const ready = start();
ready.catch((e) => console.error("Workshop could not start:", e));

self.onmessage = async (ev) => {
  const { id, method, path, headers, body } = ev.data;
  try {
    await ready;
    const r = handle(method, path, JSON.stringify(headers || {}), body || "");
    const out = r.toJs();
    r.destroy();
    const [status, head, bytes] = [out[0], JSON.parse(out[1]), out[2]];
    if (method !== "GET") await syncfs(false);
    self.postMessage({ id, status, headers: head, body: bytes, fetched }, [bytes.buffer]);
  } catch (e) {
    self.postMessage({ id, error: String(e && e.message || e) });
  }
};
