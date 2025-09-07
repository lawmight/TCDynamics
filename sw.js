// Service Worker for TCDynamics PWA
// Provides offline functionality and caching

const CACHE_NAME = 'tcdynamics-v1.0.0';
const STATIC_CACHE = 'tcdynamics-static-v1';
const DYNAMIC_CACHE = 'tcdynamics-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/advanced-features.js',
    '/manifest.json',
    // Add more static files as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    '/api/ContactForm',
    '/api/health',
    '/api/execute-code'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method === 'GET') {
        // Static files - cache first
        if (STATIC_FILES.some(file => request.url.endsWith(file))) {
            event.respondWith(cacheFirst(request));
        }
        // API requests - network first
        else if (API_CACHE_PATTERNS.some(pattern => request.url.includes(pattern))) {
            event.respondWith(networkFirst(request));
        }
        // Other requests - network first with cache fallback
        else {
            event.respondWith(networkFirst(request));
        }
    }
    // POST requests - network only
    else if (request.method === 'POST') {
        event.respondWith(networkOnly(request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Content not available offline', { status: 503 });
    }
}

// Network only strategy
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('Network only strategy failed:', error);
        return new Response('Network error', { status: 503 });
    }
}

// Background sync for offline progress
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync-progress') {
        event.waitUntil(syncOfflineProgress());
    }
});

// Sync offline progress when back online
async function syncOfflineProgress() {
    try {
        const offlineProgress = await getOfflineProgress();
        console.log('Syncing offline progress:', offlineProgress);
        
        for (const progress of offlineProgress) {
            try {
                const response = await fetch('/api/sync-progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(progress)
                });
                
                if (response.ok) {
                    console.log('Progress synced successfully:', progress);
                    await removeOfflineProgress(progress.id);
                }
            } catch (error) {
                console.error('Failed to sync progress:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Get offline progress from IndexedDB
async function getOfflineProgress() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TCDynamicsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['offlineProgress'], 'readonly');
            const store = transaction.objectStore('offlineProgress');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('offlineProgress')) {
                db.createObjectStore('offlineProgress', { keyPath: 'id' });
            }
        };
    });
}

// Remove synced progress from IndexedDB
async function removeOfflineProgress(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TCDynamicsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['offlineProgress'], 'readwrite');
            const store = transaction.objectStore('offlineProgress');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('TCDynamics', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(STATIC_CACHE)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');
