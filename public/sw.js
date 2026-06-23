// Minimal service worker — required for installability. Network-first passthrough;
// no offline caching layer yet (the app needs the API anyway).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
