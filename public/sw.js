// Service Worker for Poppin PWA
const CACHE_NAME = 'poppin-v1';
const urlsToCache = [
  '/',
  '/map',
  '/events',
  '/post',
  '/account',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending actions when back online
  const pendingActions = await getPendingActions();
  for (const action of pendingActions) {
    try {
      await performAction(action);
      await removePendingAction(action.id);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New event available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Poppin', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper functions for background sync
async function getPendingActions() {
  // Get pending actions from IndexedDB
  return [];
}

async function performAction(action) {
  // Perform the pending action
  console.log('Performing action:', action);
}

async function removePendingAction(id) {
  // Remove completed action from IndexedDB
  console.log('Removing action:', id);
}
