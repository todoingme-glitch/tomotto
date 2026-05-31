// Tomotto Service Worker — 웹 로컬 알림 전용 (캐싱 없음)

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 알림 클릭 → 탭 포커스 + 타이머 섹션 이동 메시지 전달
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({ type: 'NOTIF_CLICK_FOCUS_TIMER' });
            return client.focus();
          }
        }
      })
  );
});
