const C = "th26-27be383fed", A = "th26-assets", F = "th26-fonts";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
const ASSETS = ["a/app-2ce077d8633ab0.bin", "a/ia733161e829137.bin", "a/i27f4f9cb306848.bin", "a/i6bcfd0503c259c.bin", "a/ib6e86807a5b12f.bin", "a/if0f9ca48ab11a9.bin", "a/i3988d3e288331f.bin", "a/ib660c262ba2183.bin"];
self.addEventListener("install", (e) => { e.waitUntil(Promise.all([caches.open(C).then((c) => c.addAll(CORE)), caches.open(A).then(async (c) => { if (!(await c.match(ASSETS[0]))) await c.add(ASSETS[0]); })]).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && k !== A && k !== F).map((k) => caches.delete(k))))
  .then(() => caches.open(A)).then((c) => c.keys().then((rs) => Promise.all(rs.filter((r) => !ASSETS.some((a) => r.url.endsWith(a))).map((r) => c.delete(r))))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (u.pathname.includes("/a/")) { e.respondWith(caches.open(A).then(async (c) => (await c.match(r, { ignoreSearch: true })) || fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }))); return; }
    if (r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith("/index.html")) {
      e.respondWith(caches.open(C).then((c) => {
        const net = fetch(r, { cache: "no-store" }).then((res) => { if (res.ok) c.put("./index.html", res.clone()); return res; });
        const late = new Promise((ok) => setTimeout(() => ok(null), 4000));
        return Promise.race([net.catch(() => null), late]).then((x) => x || c.match("./index.html").then((h) => h || net));
      })); return;
    }
    e.respondWith(caches.open(C).then(async (c) => { const hit = await c.match(r, { ignoreSearch: true }); const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(F).then(async (c) => (await c.match(r)) || fetch(r).then((res) => { c.put(r, res.clone()); return res; })));
  }
});
