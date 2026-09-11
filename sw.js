const CACHE='minha-lista-v2-3-2';
const CORE=['./','./index.html','./app.js','./enhancements.js','./inventory.js','./reference-market-refresh.js','./reference-product-expansion-v230.js','./backup-v230.js','./list-enhancements.js','./list-market-v230.js','./db-integrity-v230.js','./db-migrations-v230.js','./version-v230.js','./share-config.js','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(async r=>{
      const type=r.headers.get('content-type')||'';
      if(!type.includes('text/html'))return r;
      let text=await r.text();
      const scripts='<script src="./share-config.js"></script><script src="./db-migrations-v230.js"></script><script src="./backup-v230.js"></script><script src="./enhancements.js"></script><script src="./inventory.js"></script><script src="./reference-market-refresh.js"></script><script src="./reference-product-expansion-v230.js"></script><script src="./list-enhancements.js"></script><script src="./list-market-v230.js"></script><script src="./db-integrity-v230.js"></script><script src="./version-v230.js"></script>';
      if(!text.includes('src="./share-config.js"'))text=text.replace('</body>',`${scripts}</body>`);
      else if(!text.includes('src="./version-v230.js"'))text=text.replace('</body>','<script src="./version-v230.js"></script></body>');
      const out=new Response(text,{status:r.status,statusText:r.statusText,headers:r.headers});
      caches.open(CACHE).then(c=>c.put('./index.html',out.clone()));
      return out;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{
    if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return r;
  }).catch(()=>Response.error())));
});
