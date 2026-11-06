// The Workshop as a website: sends the reader's /api/ requests to the
// Workshop running inside this browser (web/worker.js) instead of to
// `python3 tools/serve.py`. Loaded first, before the reader's own scripts.
"use strict";
(() => {
  const here = document.currentScript.src;
  const worker = new Worker(new URL("worker.js", here));
  const waiting = new Map();
  let next = 1;
  let first = true;

  // A note on screen while the Workshop starts (about 10 seconds the first time).
  // It goes as soon as the Workshop answers, and it can always be closed by hand:
  // a message that the Workshop could not start is shown only if nothing has loaded,
  // never over a page that did (a late hiccup in the background is only logged).
  const note = document.createElement("div");
  note.className = "pw-loading";
  note.setAttribute("role", "status");
  const showNote = () => document.body && !note.isConnected && document.body.appendChild(note);
  const hideNote = () => { note.remove(); clearTimeout(slow); };
  function say(html, buttons) {
    note.innerHTML = html + `<span class="pw-loading-btns">${buttons ? `<button type="button" data-pw="reload">Reload</button>` : ""}<button type="button" data-pw="close">Close</button></span>`;
  }
  say("Opening the Workshop…<small>The first time takes up to a minute. After that it opens quickly.</small>", false);
  note.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest("[data-pw]");
    if (!b) return;
    if (b.dataset.pw === "reload") location.reload();
    else hideNote();
  });
  document.addEventListener("DOMContentLoaded", () => { if (first) showNote(); });
  // Still nothing after a minute and a half: say so, with a way to reload.
  const slow = setTimeout(() => {
    if (!first) return;
    say("Still opening the Workshop…<small>This is taking longer than usual. A slow connection can do this; reloading often helps.</small>", true);
    showNote();
  }, 90000);

  worker.onmessage = (ev) => {
    const m = ev.data;
    const w = waiting.get(m.id);
    if (!w) return;
    waiting.delete(m.id);
    if (first) { first = false; hideNote(); }
    if (m.error) {
      console.error("Workshop:", m.error);
      return w.ok(new Response(JSON.stringify({ error: m.error }), { status: 500, headers: { "Content-Type": "application/json" } }));
    }
    w.ok(new Response(m.status === 204 ? null : m.body, { status: m.status, headers: m.headers }));
  };
  worker.onerror = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.error("Workshop:", e && (e.message || e));
    if (!first) return;   // the Workshop has already answered: the page works, say nothing
    say("The Workshop could not start.<small>Check the internet connection, then reload the page.</small>", true);
    showNote();
  };

  function ask(method, path, headers, body) {
    return new Promise((ok) => {
      const id = next++;
      waiting.set(id, { ok });
      worker.postMessage({ id, method, path, headers, body });
    });
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return realFetch(input, init);
    const headers = {};
    new Headers(init.headers || {}).forEach((v, k) => { headers[k] = v; });
    const body = typeof init.body === "string" ? init.body : "";
    return ask((init.method || "GET").toUpperCase(), url.pathname + url.search, headers, body);
  };

  // Download links (Export as Markdown, a copy of your database, ...).
  document.addEventListener("click", async (ev) => {
    const a = ev.target.closest && ev.target.closest('a[href^="/api/"]');
    if (!a) return;
    ev.preventDefault();
    const r = await window.fetch(a.getAttribute("href"));
    const name = ((r.headers.get("Content-Disposition") || "").match(/filename="([^"]+)"/) || [])[1] || "download";
    const blob = new Blob([await r.arrayBuffer()], { type: r.headers.get("Content-Type") || "application/octet-stream" });
    const file = new File([blob], name, { type: blob.type });
    // On the iPad the share sheet offers Save to Files; elsewhere, a normal download.
    if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  }, true);

  // Swipe left or right across the text to turn the Stephanus page, as the arrow keys do.
  let touch = null;
  document.addEventListener("touchstart", (ev) => {
    touch = ev.touches.length === 1 && ev.target.closest && ev.target.closest("#main")
      ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY, t: Date.now() } : null;
  }, { passive: true });
  document.addEventListener("touchend", (ev) => {
    if (!touch) return;
    const dx = ev.changedTouches[0].clientX - touch.x, dy = ev.changedTouches[0].clientY - touch.y;
    const quick = Date.now() - touch.t < 600;
    touch = null;
    const sel = window.getSelection();
    if (!quick || Math.abs(dx) < 90 || Math.abs(dy) > 50 || (sel && !sel.isCollapsed)) return;
    if (typeof state === "undefined" || state.view !== "read") return;
    const btn = document.getElementById(dx < 0 ? "next" : "prev");
    if (btn) btn.click();
  }, { passive: true });

  // Keeps the Workshop's program and the library pieces already read on the
  // iPad, so it opens faster next time.
  if ("serviceWorker" in navigator) navigator.serviceWorker.register(new URL("../sw.js", here)).catch(() => {});

  // Ask the browser to keep your work even when the iPad is short of space.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();
