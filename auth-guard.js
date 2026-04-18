// auth-guard.js — utilitário compartilhado de autenticação client-side
window.OndeTemAuth = (function () {
    const KEY_TOKEN = 'ondetem_token';
    const KEY_USER = 'ondetem_usuario';

    function salvarSessao(token, usuario) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.setItem(KEY_USER, JSON.stringify(usuario));
    }
    function obterToken() { return localStorage.getItem(KEY_TOKEN); }
    function obterUsuario() {
        try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null'); }
        catch { return null; }
    }
    function logout() {
        const token = obterToken();
        if (token) {
            fetch('/api/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
        }
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_USER);
        window.location.href = '/login';
    }
    /** Exige login. tipos = array opcional ['empresa','admin'] */
    function exigirLogin(tipos) {
        const u = obterUsuario();
        const t = obterToken();
        if (!u || !t) {
            const dest = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?redirect=${dest}`;
            return false;
        }
        if (tipos && tipos.length && !tipos.includes(u.tipo)) {
            alert('Acesso negado: esta página é restrita a ' + tipos.join('/') + '.');
            window.location.href = '/';
            return false;
        }
        return true;
    }
    /** fetch autenticado */
    async function api(path, options = {}) {
        const token = obterToken();
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers.Authorization = 'Bearer ' + token;
        const res = await fetch(path, { ...options, headers });
        if (res.status === 401) { logout(); throw new Error('Sessão expirada'); }
        return res;
    }

    return { salvarSessao, obterToken, obterUsuario, logout, exigirLogin, api };
})();
