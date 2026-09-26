/* ElementSync X service worker — app-shell offline, APIs always network. */
const VER = 'dhunn-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VER).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  // Online search / lyrics / translate / AI models: always network (no stale cache).
  if (/itunes\.apple\.com|lyrics\.ovh|mymemory|jsdelivr|mzstatic|audio-ssl|apple\.com/.test(url)) return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((r) => {
          const cp = r.clone();
          caches.open(VER).then((c) => c.put(e.request, cp));
          return r;
        }).catch(() => caches.match('./index.html'))
    )
  );
});
