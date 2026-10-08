/* Puente Jalisco 3D · service worker: abre sin señal en obra */
const CORE_CACHE="puentejalisco-core-v1";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CORE_CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CORE_CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
async function pageFetch(req){ const c=await caches.open(CORE_CACHE);
  try{ const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),4000); const res=await fetch(req,{signal:ctl.signal}); clearTimeout(t);
    if(res.ok) c.put("./index.html",res.clone()); return res; }
  catch(err){ return (await c.match("./index.html"))||(await c.match("./"))||Response.error(); } }
async function staticFetch(req){ const c=await caches.open(CORE_CACHE); const hit=await c.match(req,{ignoreSearch:true}); if(hit) return hit;
  const res=await fetch(req); if(res.ok) c.put(req,res.clone()); return res; }
self.addEventListener("fetch",e=>{ const req=e.request; if(req.method!=="GET") return; const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(req.mode==="navigate"){ e.respondWith(pageFetch(req)); return; }
  e.respondWith(staticFetch(req)); });
