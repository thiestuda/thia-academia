const CACHE_NAME = 'malha-piranha-cache-v2';

// Assume o controle imediatamente, sem esperar todas as abas fecharem
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ao ativar, apaga QUALQUER cache antigo (de versões anteriores deste sw.js)
// e assume o controle de todas as páginas já abertas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: sempre tenta buscar a versão mais nova da rede.
// Só usa o cache como reserva se estiver offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
