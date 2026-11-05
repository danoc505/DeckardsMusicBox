// Keeps what the Workshop website has already downloaded on this device.
// The library pieces and Python never change at a given address, so they are
// kept for good; the reader's own pages are refreshed whenever online.
"use strict";
const KEEP = "pw-keep-1";
const PAGES = "pw-pages-1";
let current = null;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (ev) => ev.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const piece = url.pathname.match(/\/db\/([0-9a-f]+)\//);
  if (piece && piece[1] !== current) {
    // A rebuilt library: forget the pieces of the old one.
    current = piece[1];
    ev.waitUntil(caches.open(KEEP).then(async (c) => {
      for (const k of await c.keys()) {
        const m = new URL(k.url).pathname.match(/\/db\/([0-9a-f]+)\//);
        if (m && m[1] !== current) await c.delete(k);
      }
    }));
  }
  if (piece || url.hostname === "cdn.jsdelivr.net") {
    ev.respondWith(caches.open(KEEP).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok) c.put(req, r.clone());
      return r;
    }));
  } else if (url.origin === self.location.origin) {
    ev.respondWith(caches.open(PAGES).then(async (c) => {
      try {
        const r = await fetch(req);
        if (r.ok) c.put(req, r.clone());
        return r;
      } catch (e) {
        const hit = await c.match(req);
        if (hit) return hit;
        throw e;
      }
    }));
  }
});
