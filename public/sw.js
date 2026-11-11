// Trio Car Wash - Offline Service Worker (PWA)
const CACHE_NAME = 'trio-car-wash-v3';

// Core assets to pre-cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/car-icon.svg',
  '/favicon.svg',
  /* __VITE_ASSETS__ */
];

// Install: pre-cache all core HTML, JS bundles, and CSS stylesheets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Filter out comments / empty entries
      const validUrls = APP_SHELL.filter(
        (url) => typeof url === 'string' && url.trim().length > 0 && !url.includes('__VITE_ASSETS__')
      );

      await Promise.allSettled(
        validUrls.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW] Pre-cache skip:', url, err);
          }
        })
      );
    })
  );
});

// Activate: clean up older cache versions and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first for assets and HTML, fallback seamlessly when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s) schemes
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Let Firebase / Firestore / Google identity pass straight through
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('identitytoolkit')
  ) {
    return;
  }

  // 1. Navigation requests (Page load / Refresh when offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('/index.html', networkResponse.clone());
            cache.put('/', networkResponse.clone());
            return networkResponse;
          }
        } catch {
          // Offline / network failure -> return cached index.html
        }

        const cache = await caches.open(CACHE_NAME);
        const cached =
          (await cache.match('/index.html')) ||
          (await cache.match('/')) ||
          (await cache.match(request));
        if (cached) return cached;

        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })()
    );
    return;
  }

  // 2. Static Assets (JS chunks, CSS, images, icons, fonts)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // A. Try exact match
      let cached = await cache.match(request);

      // B. If not found by full URL, try by pathname
      if (!cached) {
        cached = await cache.match(url.pathname);
      }

      // C. If script or style requested and not matched, look for cached asset with same extension
      if (!cached && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
        const keys = await cache.keys();
        const ext = url.pathname.endsWith('.js') ? '.js' : '.css';
        const fallbackKey = keys.find((k) => new URL(k.url).pathname.endsWith(ext));
        if (fallbackKey) {
          cached = await cache.match(fallbackKey);
        }
      }

      if (cached) {
        // Return cached immediately, and update in background if online
        fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(request, networkRes.clone());
            }
          })
          .catch(() => {});
        return cached;
      }

      // D. Not in cache yet -> fetch from network and cache for next time
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        console.warn('[SW] Offline asset fetch failed:', request.url);
        return new Response('Asset unavailable offline', { status: 503 });
      }
    })()
  );
});
