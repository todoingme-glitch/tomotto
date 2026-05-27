// Tomotto Service Worker — 비활성화 버전
// 이전에 등록된 SW를 즉시 해제하고 캐시를 전부 삭제합니다.
// (캐싱 전략 제거: Vercel CDN이 파일 갱신을 담당합니다)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // 모든 캐시 삭제
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  // SW 스스로 등록 해제
  await self.registration.unregister();
  self.clients.claim();
});
