// ETM Outreach - service worker
// Strategy:
//   - HTML / navigations  -> network-first (always get latest UI when online)
//   - Other assets        -> stale-while-revalidate (fast + auto-updating)
// Bump CACHE_NAME on every shipping change so old caches are purged.

const CACHE_NAME = "etm-tracker-v7";
const ICON_ASSET = "./icon.png?v=7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  ICON_ASSET,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
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

  // 1) Navigations: network-first. Falls back to cached index.html offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 2) Same-origin GETs
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    const path = url.pathname;
    const isIcon =
      path.endsWith("/icon.png") ||
      path.endsWith("/icon.svg");
    const isManifest = path.endsWith("/manifest.webmanifest");

    // Favicon / launcher art / manifest: network-first so updates are not stuck
    // behind a stale stale-while-revalidate icon forever.
    if (isIcon || isManifest) {
      event.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match(req))
      );
      return;
    }

    // Everything else: stale-while-revalidate.
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 3) Cross-origin (e.g. Google Fonts): cache-first opportunistically.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});

// Allow the page to ask the SW to skip waiting (used right after install
// of a new version, so the user doesn't have to close and reopen the app).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
