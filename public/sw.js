// MamaGuard service worker (Plan E8.4 foundation). Conservative: network-first
// for navigations with an offline fallback; never caches API/auth responses, so
// clinical data is always fresh. Full offline sync is future work.
const CACHE = "mamaguard-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle top-level navigations; let everything else hit the network.
  if (req.mode !== "navigate") return;
  event.respondWith(
    fetch(req).catch(() => caches.match(OFFLINE_URL).then((r) => r || new Response("Offline", { status: 503 }))),
  );
});
