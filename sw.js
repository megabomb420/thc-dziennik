const CACHE = 'thc-dziennik-v5';
const ASSETS = ['./', './index.html', './style.css', './app.js', './fx.js', './manifest.webmanifest', './fonts/chakra-400.woff2', './fonts/chakra-400ext.woff2', './fonts/chakra-600.woff2', './fonts/chakra-600ext.woff2', './fonts/chakra-700.woff2', './fonts/chakra-700ext.woff2',
  './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
