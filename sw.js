const C = "th26-v6";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && !k.endsWith("-fonts")).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(caches.open(C).then(async (c) => {
      const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === "navigate" ? await c.match("./index.html") : undefined);
      const net = fetch(r).then((res) => { if (res.ok) c.put(r.mode === "navigate" ? "./index.html" : r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(C + "-fonts").then(async (c) => (await c.match(r)) || fetch(r).then((res) => { c.put(r, res.clone()); return res; })));
  }
});
