// server.js — Onde Tem? (v1.1)
// Servidor Express com rotas de páginas + API + autenticação por token simples.

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ==========================================
// "Banco de dados" em memória (substituir por DB real depois)
// ==========================================
const db = {
    usuarios: [
        { id: 1, nome: 'João Silva', email: 'joao@email.com', senha: '123456', tipo: 'usuario' }
    ],
    empresas: [
        {
            id: 1,
            nome: 'Salão Beleza Pura',
            cnpj: '12.345.678/0001-99',
            razaoSocial: 'Beleza Pura LTDA',
            email: 'empresa@ondetem.com',
            senha: '123456',
            telefone: '(11) 99999-0000',
            endereco: 'Rua das Flores, 123 - Centro',
            horario: 'Seg a Sex 09h-19h | Sáb 09h-15h',
            status: 'ativo',
            tipo: 'empresa'
        }
    ],
    admin: { email: 'admin@ondetem.com', senha: '123456' },
    agendamentos: [],   // { id, usuarioEmail, empresaId, servicoId, estabelecimento, data, hora, pagamento, status }
    servicos: [         // produtos/serviços por empresa
        { id: 1, empresaId: 1, nome: 'Corte de cabelo feminino', preco: 60, duracao: 45 },
        { id: 2, empresaId: 1, nome: 'Manicure', preco: 35, duracao: 40 }
    ],
    sessoes: new Map() // token -> { email, tipo, id }
};

function gerarToken() {
    return crypto.randomBytes(24).toString('hex');
}

// ==========================================
// Middleware de autenticação
// ==========================================
function autenticar(req, res, next) {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const sessao = token ? db.sessoes.get(token) : null;
    if (!sessao) {
        return res.status(401).json({ erro: 'Não autenticado. Faça login.' });
    }
    req.usuario = sessao;
    next();
}

function exigirTipo(...tipos) {
    return (req, res, next) => {
        if (!tipos.includes(req.usuario?.tipo)) {
            return res.status(403).json({ erro: 'Acesso negado para este tipo de usuário.' });
        }
        next();
    };
}

// ==========================================
// 1. ROTAS DE PÁGINAS
// ==========================================
const paginas = ['/', '/login', '/agendamentos', '/cadastro-usuario', '/cadastro-empresa', '/admin', '/painel-empresa'];
const arquivos = {
    '/': 'index.html',
    '/login': 'login.html',
    '/agendamentos': 'agendamentos.html',
    '/cadastro-usuario': 'cadastro-usuario.html',
    '/cadastro-empresa': 'cadastro-empresa.html',
    '/admin': 'admin.html',
    '/painel-empresa': 'painel-empresa.html'
};
paginas.forEach(rota => {
    app.get(rota, (req, res) => res.sendFile(path.join(__dirname, arquivos[rota])));
});

// ==========================================
// 2. API — LOGIN / LOGOUT / SESSÃO
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, senha, tipo } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Preencha o e-mail e a senha.' });

    let usuario = null;

    if (tipo === 'admin') {
        if (email === db.admin.email && senha === db.admin.senha) {
            usuario = { id: 0, email, tipo: 'admin', nome: 'Administrador' };
        }
    } else if (tipo === 'empresa') {
        const e = db.empresas.find(x => x.email === email && x.senha === senha);
        if (e) usuario = { id: e.id, email: e.email, tipo: 'empresa', nome: e.nome };
    } else if (tipo === 'usuario') {
        const u = db.usuarios.find(x => x.email === email && x.senha === senha);
        if (u) usuario = { id: u.id, email: u.email, tipo: 'usuario', nome: u.nome };
    }

    if (!usuario) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

    const token = gerarToken();
    db.sessoes.set(token, usuario);
    res.json({ mensagem: 'Autenticação aprovada', token, usuario });
});

app.post('/api/logout', autenticar, (req, res) => {
    const token = req.headers['authorization'].slice(7);
    db.sessoes.delete(token);
    res.json({ mensagem: 'Logout efetuado' });
});

app.get('/api/me', autenticar, (req, res) => {
    res.json({ usuario: req.usuario });
});

// ==========================================
// 3. API — AGENDAMENTOS (somente logados)
// ==========================================

// Usuário lista os próprios agendamentos / Empresa lista os recebidos / Admin lista todos
app.get('/api/agendamentos', autenticar, (req, res) => {
    let lista = db.agendamentos;
    if (req.usuario.tipo === 'usuario') {
        lista = lista.filter(a => a.usuarioEmail === req.usuario.email);
    } else if (req.usuario.tipo === 'empresa') {
        lista = lista.filter(a => a.empresaId === req.usuario.id);
    }
    res.json({ status: 'sucesso', dados: lista });
});

// Apenas usuários logados podem agendar
app.post('/api/agendamentos', autenticar, exigirTipo('usuario'), (req, res) => {
    const { empresaId, servicoId, estabelecimento, data, hora, pagamento } = req.body;
    if (!data || !hora || (!estabelecimento && !empresaId)) {
        return res.status(400).json({ erro: 'Dados incompletos para o agendamento.' });
    }
    const novo = {
        id: Date.now(),
        usuarioEmail: req.usuario.email,
        usuarioNome: req.usuario.nome,
        empresaId: empresaId || null,
        servicoId: servicoId || null,
        estabelecimento: estabelecimento || (db.empresas.find(e => e.id === empresaId)?.nome ?? ''),
        data, hora, pagamento: pagamento || 'A combinar',
        status: 'pendente',
        criadoEm: new Date().toISOString()
    };
    db.agendamentos.push(novo);
    res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', dados: novo });
});

// Empresa atualiza status (aceitar/recusar/concluir)
app.patch('/api/agendamentos/:id', autenticar, exigirTipo('empresa', 'admin'), (req, res) => {
    const { status } = req.body;
    const ag = db.agendamentos.find(a => a.id === Number(req.params.id));
    if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (req.usuario.tipo === 'empresa' && ag.empresaId !== req.usuario.id) {
        return res.status(403).json({ erro: 'Este agendamento não é da sua empresa.' });
    }
    if (!['pendente', 'confirmado', 'recusado', 'concluido'].includes(status)) {
        return res.status(400).json({ erro: 'Status inválido' });
    }
    ag.status = status;
    res.json({ mensagem: 'Status atualizado', dados: ag });
});

// ==========================================
// 4. API — SERVIÇOS / PRODUTOS DA EMPRESA
// ==========================================
app.get('/api/servicos', (req, res) => {
    const empresaId = req.query.empresaId ? Number(req.query.empresaId) : null;
    const lista = empresaId ? db.servicos.filter(s => s.empresaId === empresaId) : db.servicos;
    res.json({ status: 'sucesso', dados: lista });
});

app.get('/api/empresa/servicos', autenticar, exigirTipo('empresa'), (req, res) => {
    res.json({ status: 'sucesso', dados: db.servicos.filter(s => s.empresaId === req.usuario.id) });
});

app.post('/api/empresa/servicos', autenticar, exigirTipo('empresa'), (req, res) => {
    const { nome, preco, duracao } = req.body;
    if (!nome || preco == null) return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
    const novo = { id: Date.now(), empresaId: req.usuario.id, nome, preco: Number(preco), duracao: Number(duracao) || 30 };
    db.servicos.push(novo);
    res.status(201).json({ mensagem: 'Serviço criado', dados: novo });
});

app.put('/api/empresa/servicos/:id', autenticar, exigirTipo('empresa'), (req, res) => {
    const s = db.servicos.find(x => x.id === Number(req.params.id) && x.empresaId === req.usuario.id);
    if (!s) return res.status(404).json({ erro: 'Serviço não encontrado' });
    const { nome, preco, duracao } = req.body;
    if (nome != null) s.nome = nome;
    if (preco != null) s.preco = Number(preco);
    if (duracao != null) s.duracao = Number(duracao);
    res.json({ mensagem: 'Serviço atualizado', dados: s });
});

app.delete('/api/empresa/servicos/:id', autenticar, exigirTipo('empresa'), (req, res) => {
    const idx = db.servicos.findIndex(x => x.id === Number(req.params.id) && x.empresaId === req.usuario.id);
    if (idx < 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
    db.servicos.splice(idx, 1);
    res.json({ mensagem: 'Serviço removido' });
});

// ==========================================
// 5. API — PERFIL DA EMPRESA
// ==========================================
app.get('/api/empresa/perfil', autenticar, exigirTipo('empresa'), (req, res) => {
    const e = db.empresas.find(x => x.id === req.usuario.id);
    if (!e) return res.status(404).json({ erro: 'Empresa não encontrada' });
    const { senha, ...publico } = e;
    res.json({ status: 'sucesso', dados: publico });
});

app.put('/api/empresa/perfil', autenticar, exigirTipo('empresa'), (req, res) => {
    const e = db.empresas.find(x => x.id === req.usuario.id);
    if (!e) return res.status(404).json({ erro: 'Empresa não encontrada' });
    const camposEditaveis = ['nome', 'telefone', 'endereco', 'horario', 'razaoSocial'];
    camposEditaveis.forEach(c => { if (req.body[c] != null) e[c] = req.body[c]; });
    const { senha, ...publico } = e;
    res.json({ mensagem: 'Perfil atualizado', dados: publico });
});

// ==========================================
// 6. API — DASHBOARD DA EMPRESA
// ==========================================
app.get('/api/empresa/dashboard', autenticar, exigirTipo('empresa'), (req, res) => {
    const meus = db.agendamentos.filter(a => a.empresaId === req.usuario.id);
    res.json({
        total: meus.length,
        pendentes: meus.filter(a => a.status === 'pendente').length,
        confirmados: meus.filter(a => a.status === 'confirmado').length,
        concluidos: meus.filter(a => a.status === 'concluido').length,
        recusados: meus.filter(a => a.status === 'recusado').length,
        servicos: db.servicos.filter(s => s.empresaId === req.usuario.id).length,
        recentes: meus.slice(-5).reverse()
    });
});

// ==========================================
// 7. API — USUÁRIOS / EMPRESAS (cadastros)
// ==========================================
app.get('/api/usuarios', (req, res) => res.json({ status: 'sucesso', usuarios: db.usuarios.map(({ senha, ...u }) => u) }));

app.post('/api/usuarios', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    if (db.usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    const novo = { id: Date.now(), nome, email, senha, tipo: 'usuario' };
    db.usuarios.push(novo);
    const { senha: _, ...publico } = novo;
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!', dados: publico });
});

app.get('/api/empresas', (req, res) => res.json({ status: 'sucesso', empresas: db.empresas.map(({ senha, ...e }) => e) }));

app.post('/api/empresas', (req, res) => {
    const { nome, cnpj, razaoSocial, email, senha } = req.body;
    if (!nome || !cnpj || !razaoSocial || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }
    if (db.empresas.find(e => e.email === email)) return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    const novo = {
        id: Date.now(), nome, cnpj, razaoSocial, email, senha,
        telefone: '', endereco: '', horario: '',
        status: 'pendente', tipo: 'empresa'
    };
    db.empresas.push(novo);
    const { senha: _, ...publico } = novo;
    res.status(201).json({ mensagem: 'Empresa cadastrada com sucesso! Aguardando aprovação do administrador.', dados: publico });
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
app.listen(PORT, () => {
    console.log(`[Sistema] Servidor rodando em http://localhost:${PORT}`);
    console.log(`[Sistema] Logins de teste:`);
    console.log(`  Admin    -> admin@ondetem.com / 123456`);
    console.log(`  Empresa  -> empresa@ondetem.com / 123456`);
    console.log(`  Usuário  -> joao@email.com / 123456`);
});
