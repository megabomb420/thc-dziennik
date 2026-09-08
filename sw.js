const CACHE = 'thc-dziennik-v11';
const ASSETS = ['./', './index.html', './style.css', './i18n.js', './icons.js', './app.js', './fx.js', './manifest.webmanifest', './fonts/chakra-400.woff2', './fonts/chakra-400ext.woff2', './fonts/chakra-600.woff2', './fonts/chakra-600ext.woff2', './fonts/chakra-700.woff2', './fonts/chakra-700ext.woff2',
  './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // nowa wersja przejmuje kontrolę od razu
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // powiadom wszystkie otwarte karty, że jest nowa wersja
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
  })());
});

// network-first: zawsze próbuje świeżej wersji, cache tylko jako fallback offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request, { cache: 'no-store' });
      if (fresh.ok) {
        const cache = await caches.open(CACHE);
        cache.put(e.request, fresh.clone());
      }
      return fresh;
    } catch {
      const cached = await caches.match(e.request, { ignoreSearch: true });
      return cached || caches.match('./index.html');
    }
  })());
});
