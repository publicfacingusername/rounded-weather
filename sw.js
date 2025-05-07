const CACHE = 'weather-cache-v1';
const OFFLINE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-180.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event =>
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE)))
);

self.addEventListener('fetch', event =>
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  )
);
