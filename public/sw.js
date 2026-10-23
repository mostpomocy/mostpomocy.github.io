const SHELL='mostpomocy-shell-v2';
const SAVED='mostpomocy-saved-v1';
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(SHELL);await cache.addAll(['/offline/','/icons/app-192.png','/icons/app-512.png']);const page=await cache.match('/offline/');const html=await page.text();const styles=[...html.matchAll(/href="(\/_astro\/[^" ]+\.css)"/g)].map(m=>m[1]);await cache.addAll(styles);})());self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Only explicit saved public articles and their assets are retained in SAVED by the page UI.
// Personal notes, admin pages and consent choices are never added here.
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/admin'))return;
 event.respondWith(fetch(req).catch(async()=>{
  const saved=await caches.open(SAVED);const copy=await saved.match(req,{ignoreSearch:true});if(copy)return copy;
  const shell=await caches.open(SHELL);const asset=await shell.match(req,{ignoreSearch:true});if(asset)return asset;
  if(req.mode==='navigate')return shell.match('/offline/');throw Error('Brak zasobu offline');
 }));
});
