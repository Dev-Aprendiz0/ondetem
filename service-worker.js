/**
 * service-worker.js - Gerenciamento de Cache e Notificações Push
 * Implementação baseada na Aula 6 - Engenharia de Software
 */

const CACHE_NAME = 'ondetem-cache-v4';
const RUNTIME_CACHE = 'ondetem-runtime-v4';

// Arquivos essenciais para funcionar offline
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './app.js',
  './config.js',
  './utils.js',
  './manifest.json',
  './agendamentos.html',
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
      caches.open(CACHE_NAME).then(cache => {
        console.log('✓ Cache essencial aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      }),
      caches.open(RUNTIME_CACHE).then(cache => {
        console.log('✓ Cache de runtime aberto:', RUNTIME_CACHE);
        return cache.addAll(externalResources).catch(err => {
          console.warn('⚠ Alguns recursos externos não puderam ser cacheados:', err);
        });
      })
    ]).then(() => self.skipWaiting())
  );
});

// Evento: Ativação do Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑 Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento: Interceptação de requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Não interceptar métodos diferentes de GET (POST/PUT/DELETE de login,
  // agendamentos, etc. precisam ir direto ao servidor)
  if (request.method !== 'GET') return;

  // Nunca cachear a API — sempre vai para a rede
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  const isHtml = request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (url.origin === self.location.origin) {
    // Network-first para HTML/JS/CSS do próprio site: garante que correções de bugs
    // cheguem ao usuário sem ficar presas em cache antigo. Fallback para cache offline.
    const estrategia = isHtml ? networkFirst : staleWhileRevalidate;
    event.respondWith(estrategia(request, CACHE_NAME));
  } else {
    // Recursos externos (CDNs) — cache-first com atualização em background
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

function networkFirst(request, cacheName) {
  return fetch(request)
    .then(response => {
      if (response && response.status === 200 && response.type !== 'error') {
        const clone = response.clone();
        caches.open(cacheName).then(cache => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

function staleWhileRevalidate(request, cacheName) {
  return caches.match(request).then(cached => {
    const fetchPromise = fetch(request).then(response => {
      if (response && response.status === 200 && response.type !== 'error') {
        const clone = response.clone();
        caches.open(cacheName).then(cache => cache.put(request, clone));
      }
      return response;
    }).catch(() => cached);
    return cached || fetchPromise;
  });
}

// ============================================
// EVENTOS DE NOTIFICAÇÃO PUSH (AULA 6)
// ============================================

// 1. Evento push — recebe e exibe a notificação
self.addEventListener('push', event => {
    console.log('🔔 Push recebido:', event);
    
    let dados = {
        title: 'Nova Notificação',
        body: 'Você tem uma mensagem do Onde Tem?!',
        icon: '/img/Logo-png 5.svg'
    };

    if (event.data) {
        try {
            dados = event.data.json();
        } catch (e) {
            dados.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(dados.title, {
            body: dados.body,
            icon: dados.icon || '/img/Logo-png 5.svg',
            badge: '/img/Logo-png 5.svg',
            vibrate: [100, 50, 100],
            data: {
                url: dados.url || '/'
            }
        })
    );
});

// 2. Evento notificationclick — trata o clique na notificação
self.addEventListener('notificationclick', event => {
    console.log('🖱 Notificação clicada:', event.notification);
    
    event.notification.close();
    
    const urlParaAbrir = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Se já houver uma aba aberta, focar nela
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlParaAbrir && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se não, abrir uma nova aba
            if (clients.openWindow) {
                return clients.openWindow(urlParaAbrir);
            }
        })
    );
});
