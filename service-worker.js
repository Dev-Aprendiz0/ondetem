// service-worker.js
// Estratégia de cache otimizada para PWA

const CACHE_NAME = 'ondetem-cache-v2';
const RUNTIME_CACHE = 'ondetem-runtime-v2';

// Arquivos essenciais para funcionar offline
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './login.html',
  './stylesheet_login.css'
];

// Recursos externos que serão cacheados
const externalResources = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Evento: Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache dos arquivos essenciais
      caches.open(CACHE_NAME).then(cache => {
        console.log('Cache essencial aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      }),
      // Pre-cache dos recursos externos
      caches.open(RUNTIME_CACHE).then(cache => {
        console.log('Cache de runtime aberto:', RUNTIME_CACHE);
        return cache.addAll(externalResources).catch(err => {
          console.warn('Alguns recursos externos não puderam ser cacheados:', err);
        });
      })
    ]).then(() => {
      // Forçar a ativação imediata
      return self.skipWaiting();
    })
  );
});

// Evento: Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remover caches antigos
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assumir controle de todos os clientes
      return self.clients.claim();
    })
  );
});

// Evento: Interceptação de requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratégia: Cache first para recursos estáticos
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          // Não cachear respostas inválidas
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          // Cachear a resposta
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        }).catch(() => {
          // Fallback offline
          return caches.match(request);
        });
      })
    );
  } else {
    // Estratégia: Network first para recursos externos
    event.respondWith(
      fetch(request).then(response => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});
