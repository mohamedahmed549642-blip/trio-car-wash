import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Offline Service Worker for 100% offline refresh and standalone PWA (Production only)
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Trio Car Wash offline service worker active');
      } catch (err) {
        console.warn('Service worker registration failed:', err);
      }
    });
  } else {
    // In development: unregister any legacy service workers to prevent stale cache or mobile touch stalls
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
