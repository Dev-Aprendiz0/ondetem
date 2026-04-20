/**
 * app.js - Gerenciamento de Notificações Push
 *
 * O navegador exibe o prompt nativo de permissão automaticamente (mesma
 * experiência do prompt de geolocalização). Não há mais botão "🔔 Notificações"
 * no header — se o usuário aceitar, o push é inscrito em seguida; se negar, o
 * app continua funcionando sem notificações.
 */

// Chave VAPID pública (Gerada para o projeto)
const VAPID_PUBLIC_KEY = 'BNo6E7y9E_v1G9QyXq8zY4Z5R8J2L6m5n4b3v2c1x0z9a8s7d6f5g4h3j2k1l0'; // Chave de exemplo

// 1. Registra o Service Worker ao carregar a página
if ('serviceWorker' in navigator) {
    // Recarrega uma única vez quando um novo Service Worker assume o controle,
    // garantindo que correções de bugs no HTML/JS cheguem ao usuário sem exigir
    // um hard-reload manual.
    let jaRecarregou = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (jaRecarregou) return;
        jaRecarregou = true;
        console.log('♻ Novo Service Worker ativo. Recarregando página…');
        window.location.reload();
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => {
                console.log('✓ SW registrado para Push:', reg.scope);
                reg.update().catch(() => {});
                solicitarPermissaoAutomaticamente(reg);
            })
            .catch(err => {
                console.warn('⚠ SW não registrado, tentando prompt sem push:', err);
                solicitarPermissaoAutomaticamente(null);
            });
    });
} else {
    window.addEventListener('load', () => solicitarPermissaoAutomaticamente(null));
}

// 2. Dispara o prompt nativo do navegador (igual ao de geolocalização) só
// quando ainda não houve uma decisão do usuário. Se já aceitou antes, apenas
// garante que a push subscription exista.
async function solicitarPermissaoAutomaticamente(registration) {
    if (!('Notification' in window)) {
        console.warn('⚠ Este navegador não suporta Notification API.');
        return;
    }

    if (Notification.permission === 'granted') {
        await tentarInscreverPush(registration);
        return;
    }

    if (Notification.permission === 'denied') {
        // Usuário já negou antes — o navegador nem deixaria pedir de novo.
        return;
    }

    try {
        const permissao = await Notification.requestPermission();
        if (permissao === 'granted') {
            await tentarInscreverPush(registration);
            mostrarNotificacaoLocal(
                'Notificações Ativadas!',
                'Agora você receberá alertas de agendamento.'
            );
        } else {
            console.warn('⚠ Permissão de notificação negada pelo usuário.');
        }
    } catch (err) {
        console.warn('⚠ Falha ao solicitar permissão de notificação:', err);
    }
}

async function tentarInscreverPush(registration) {
    if (!registration || !('pushManager' in registration)) return;
    try {
        const existente = await registration.pushManager.getSubscription();
        if (existente) return;
        await inscreverUsuario(registration);
    } catch (err) {
        console.warn('⚠ Push subscription falhou, usando apenas notificações locais:', err);
    }
}

// 3. Cria a subscription com a chave VAPID pública
async function inscreverUsuario(registration) {
    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        console.log('✓ Usuário inscrito no Push:', JSON.stringify(subscription));
        // TODO: Enviar 'subscription' para o back-end aqui
        // await enviarSubscriptionParaServidor(subscription);
    } catch (err) {
        console.error('✗ Falha ao inscrever usuário no Push:', err);
        throw err;
    }
}

// Utilitário: converte chave VAPID de Base64 para Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// Mostra uma notificação local para feedback imediato ao usuário.
function mostrarNotificacaoLocal(titulo, corpo) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
        new Notification(titulo, {
            body: corpo,
            icon: './icon-192.png',
            badge: './icon-192.png'
        });
    } catch (err) {
        console.warn('⚠ Falha ao exibir notificação local:', err);
    }
}

// Exposto no window para que script.js possa disparar a notificação de
// "Agendamento Confirmado!" após um agendamento bem-sucedido.
window.mostrarNotificacaoPush = mostrarNotificacaoLocal;
