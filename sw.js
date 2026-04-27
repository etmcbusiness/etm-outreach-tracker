// ETMCLEANING Daily Tracker - service worker
// Cache-first for the app shell so it works offline + installs as a PWA.

const CACHE_NAME = "etm-tracker-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Use { cache: "reload" } so fresh copies are pulled when the SW updates.
      Promise.all(
        APP_SHELL.map((url) =>
          cache
            .add(new Request(url, { cache: "reload" }))
            .catch(() => undefined)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // For navigations, prefer cache-first then network (offline-friendly).
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then(
        (cached) =>
          cached ||
          fetch(req).catch(() => caches.match("./index.html"))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache same-origin GETs opportunistically.
          if (
            res &&
            res.status === 200 &&
            res.type === "basic"
          ) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
