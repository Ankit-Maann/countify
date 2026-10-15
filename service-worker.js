const CACHE = "countdown-ai30-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/countdown-icon.svg", "/icon-192.png", "/icon-512.png"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("message", (event) => { if (event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const network = fetch(event.request).then((response) => { if (response.ok) caches.open(CACHE).then((c) => c.put(event.request, response.clone())); return response; }).catch(() => null);
    if (cached) { network.catch(() => {}); return cached; }
    const fresh = await network;
    return fresh || caches.match("/index.html");
  })());
});
