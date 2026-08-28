const CACHE_NAME = 'bills-due-board-shell-v7';
const SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/assets/payment-horizon-960.webp',
  '/assets/payment-horizon-1440.webp',
  '/assets/social-card.webp',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    const response = await fetch('/');
    const html = await response.clone().text();
    await cache.put('/', response);
    const paths = [...html.matchAll(/(?:src|href)="(\/(?:assets|immutable)\/[^"]+)"/g)].map((match) => match[1]);
    await Promise.all([...new Set(paths)].map((path) => cache.add(path)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone()));
      return response;
    }).catch(() => caches.match('/', { ignoreVary: true }).then((response) => response || caches.match('/offline.html', { ignoreVary: true }))));
    return;
  }
  event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});
