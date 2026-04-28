const CACHE_NAME = 'mangrove-v0.2';

// 언더바 반영된 경로 확인해봐, 언니!
const ASSETS = [
  './',
  './index.html',
  './island_escape/game.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('파일 캐싱 중...!');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
