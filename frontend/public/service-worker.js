self.addEventListener('install', (event) => {
  event.waitUntil(caches.open('freshdeals-v1').then((cache) => {
    return cache.addAll([
      '/',
      '/index.html',
      '/manifest.json',
    ]);
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== 'freshdeals-v1') {
          return caches.delete(cacheName);
        }
      })
    );
  }));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open('freshdeals-v1').then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return a fallback response for failed requests
          return new Response('Offline - Service unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FreshDeals';
  const options = {
    body: data.body || 'Check out our latest deals!',
    icon: '/icon.svg',
    badge: '/icon.svg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
