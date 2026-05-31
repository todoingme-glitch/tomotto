// Tomotto Service Worker — 웹 로컬 알림 전용 (캐싱 없음)

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  // 이전 캐시 정리 후 즉시 제어권 획득
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 알림 클릭 → 탭 포커스 또는 새 탭 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        return self.clients.openWindow('/');
      })
  );
});
