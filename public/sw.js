const CACHE='mostpomocy-shell-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/offline/','/icons/app-192.png','/icons/app-512.png'])));self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mostpomocy-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Never cache personal notes, admin pages, consent choices or medical/support articles.
self.addEventListener('fetch',event=>{if(event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin||new URL(event.request.url).pathname.startsWith('/admin'))return;event.respondWith(fetch(event.request).catch(()=>caches.match('/offline/')));});
