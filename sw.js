// Tomotto Service Worker
const CACHE_NAME = 'tomotto-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
];

// 설치: 정적 파일 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: 네트워크 우선, 실패 시 캐시 (Supabase API는 항상 네트워크)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Supabase / 외부 API는 캐시 없이 네트워크 직접 호출
  if (url.hostname.includes('supabase') || url.hostname.includes('googleapis')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 성공한 응답은 캐시 업데이트
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
