import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Offline Service Worker for 100% offline refresh and standalone PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Trio Car Wash offline service worker active');

      // Populate CacheStorage with active page assets right now
      if ('caches' in window) {
        const cache = await caches.open('trio-car-wash-v3');
        const urlsToCache: string[] = ['/', '/index.html'];

        document.querySelectorAll('script[src]').forEach((s) => {
          const src = (s as HTMLScriptElement).src;
          if (src && src.startsWith(window.location.origin)) {
            urlsToCache.push(src);
          }
        });

        document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
          const href = (l as HTMLLinkElement).href;
          if (href && href.startsWith(window.location.origin)) {
            urlsToCache.push(href);
          }
        });

        await Promise.allSettled(
          urlsToCache.map(async (u) => {
            try {
              const res = await fetch(u, { cache: 'no-cache' });
              if (res.ok) await cache.put(u, res);
            } catch {
              // Ignore
            }
          })
        );
      }
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
