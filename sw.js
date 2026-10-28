// sw.js - Zero-Delay Network-First Service Worker for GitHub Pages
const CACHE_NAME = 'mc2d-addition-network-first-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 새 코드 감지 시 대기하지 않고 즉시 활성화
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 항상 네트워크에서 최신 코드를 먼저 가져오고(no-store), 오프라인일 때만 캐시를 사용
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request, { cache: 'no-store' })
            .then((networkResponse) => {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});