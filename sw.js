/* Service worker — ให้แอปเปิดได้แบบออฟไลน์หลังเปิดครั้งแรก (เมื่อเสิร์ฟผ่าน GitHub Pages / https)
   กลยุทธ์: network-first สำหรับหน้า HTML (ได้เวอร์ชันใหม่เสมอเมื่อมีเน็ต) · cache-first สำหรับไฟล์อื่น
   เปลี่ยน VERSION ทุกครั้งที่ปรับไฟล์ เพื่อล้างแคชเก่า */
const VERSION = 'milin-v12';
const ASSETS = [
  './',
  './index.html',
  './Milin-English-Club.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  if (isPage) {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('./Milin-English-Club.html')))
    );
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
