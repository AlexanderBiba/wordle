const CACHE_VERSION = 'v1.3.0';
const STATIC_CACHE = `wordle-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `wordle-dynamic-${CACHE_VERSION}`;

const CRITICAL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './logo192.png',
  './logo512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Installing critical files');
        return cache.addAll(CRITICAL_FILES);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== location.origin) {
    return;
  }

  if (url.pathname.includes('firebase') || 
      url.pathname.includes('api') ||
      url.pathname.includes('auth')) {
    return;
  }

  if (url.pathname.includes('/static/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request);
        })
    );
    return;
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New Wordle challenge available!',
    icon: './logo192.png',
    badge: './logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: './logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Wordle', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending game state or stats
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        message: 'Syncing offline data...'
      });
    });
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Handle message events from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 