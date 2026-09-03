// Minimal offline support for MOISS.
//
// Strategy: NETWORK-FIRST. Always try the network; fall back to cache only when
// offline. A fresh build is never shadowed by stale cached chunks, and the whole
// app (all routes) still loads with no connection once visited.

const CACHE = "moiss-v3";
const CORE = [
  "/",
  "/command",
  "/courier",
  "/ncp",
  "/ncp/display",
  "/about",
  "/branding/logo-eindhoven.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // The local-sync relay must always hit the network directly.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request).then((c) => c || caches.match("/")))
  );
});
