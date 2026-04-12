// 1. Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('Erro SW:', err));
    });
}

// Dados dos estabelecimentos (para referência no mapa e filtros)
const estabelecimentos = [
    {
        id: 0,
        nome: "Studio Bella Donna",
        lat: -22.9345,
        lng: -42.4951,
        categorias: ["Cabelo", "Unhas", "Sobrancelhas"]
    },
    {
        id: 1,
        nome: "Clínica Estética Flores",
        lat: -22.9350,
        lng: -42.4945,
        categorias: ["Rosto", "Depilação", "Massagem"]
    },
    {
        id: 2,
        nome: "Espaço Glow",
        lat: -22.9340,
        lng: -42.4955,
        categorias: ["Unhas", "Sobrancelhas", "Rosto"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS ---
    const btnLupaMobile = document.getElementById('btn-lupa-mobile');
    const inputMobile = document.getElementById('input-busca-mobile');
    const inputDesktop = document.querySelector('.search-bar input'); 
    const cards = document.querySelectorAll('.listings .row > div');
    const categoryItems = document.querySelectorAll('.category-item');
    
    const modalElement = document.getElementById('modalAgendamento');
    const bModal = new bootstrap.Modal(modalElement);
    const form = document.getElementById('formAgendamento');
    const statusPagamento = document.getElementById('statusPagamento');

    // --- VARIÁVEL PARA RASTREAR FILTRO ATIVO ---
    let filtroAtivo = null;

    // --- LÓGICA DE BUSCA (FILTRO POR TEXTO) ---
    function filtrarCards(termo) {
        const searchTerm = termo.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector('.card-title').innerText.toLowerCase();
            const services = card.querySelector('.card-text').innerText.toLowerCase();
            const match = title.includes(searchTerm) || services.includes(searchTerm);
            card.style.display = match ? "block" : "none";
        });
    }

    // --- LÓGICA DE FILTRO POR CATEGORIA ---
    function filtrarPorCategoria(categoria) {
        cards.forEach((card, index) => {
            const estabelecimento = estabelecimentos[index];
            const match = estabelecimento && estabelecimento.categorias.includes(categoria);
            card.style.display = match ? "block" : "none";
        });
    }

    // --- EVENT LISTENERS PARA BUSCA ---
    if(inputDesktop) inputDesktop.addEventListener('input', (e) => {
        filtroAtivo = null;
        categoryItems.forEach(item => item.classList.remove('active'));
        filtrarCards(e.target.value);
    });
    
    if(inputMobile) inputMobile.addEventListener('input', (e) => {
        filtroAtivo = null;
        categoryItems.forEach(item => item.classList.remove('active'));
        filtrarCards(e.target.value);
    });

    if(btnLupaMobile) {
        btnLupaMobile.addEventListener('click', () => {
            inputMobile.classList.toggle('d-none');
            inputMobile.classList.toggle('ativo');
            inputMobile.focus();
        });
    }

    // --- EVENT LISTENERS PARA CATEGORIAS ---
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const categoria = item.querySelector('p').innerText;
            
            if(filtroAtivo === categoria) {
                // Se clicar novamente, remove o filtro
                filtroAtivo = null;
                item.classList.remove('active');
                cards.forEach(card => card.style.display = "block");
            } else {
                // Aplica novo filtro
                filtroAtivo = categoria;
                categoryItems.forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                filtrarPorCategoria(categoria);
            }
        });
    });

    // --- LÓGICA DO MODAL (ABRIR E PREENCHER) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-danger') && e.target.closest('.card-body')) {
            const btn = e.target;
            const nomeLocal = btn.closest('.card-body').querySelector('.card-title').innerText;
            document.getElementById('modalAgendamentoLabel').innerText = `Agendar em: ${nomeLocal}`;
            bModal.show();
        }
    });

    // --- LÓGICA DE PAGAMENTO (ENVIO PARA API) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';
        statusPagamento.innerHTML = "Conectando ao servidor...";

        const dadosAgendamento = {
            id: Date.now(),
            local: document.getElementById('modalAgendamentoLabel').innerText.replace('Agendar em: ', ''),
            data: document.getElementById('dataAgendamento').value,
            hora: document.getElementById('horaAgendamento').value,
            pagamento: document.getElementById('metodoPagamento').value,
            timestamp: new Date().toLocaleString('pt-BR')
        };

        try {
            // Chamada para o JSONPlaceholder (API Fake)
            const resposta = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                body: JSON.stringify(dadosAgendamento),
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            });

            if(resposta.ok) {
                const resultado = await resposta.json();
                
                // Salvar agendamento no localStorage
                let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
                agendamentos.push(dadosAgendamento);
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                
                statusPagamento.innerHTML = '<b class="text-success">Pagamento Aprovado!</b>';
                
                setTimeout(() => {
                    bModal.hide();
                    form.reset();
                    statusPagamento.innerHTML = '';
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = 'Confirmar e Pagar';
                    alert("Sucesso! Agendamento #" + resultado.id + " confirmado em " + dadosAgendamento.local + ".");
                }, 2000);
            }
        } catch (erro) {
            statusPagamento.innerHTML = '<b class="text-danger">Erro no processamento.</b>';
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Confirmar e Pagar';
        }
    });

    // --- INICIALIZAR MAPA ---
    inicializarMapa();
});

// --- FUNÇÃO PARA INICIALIZAR O MAPA ---
function inicializarMapa() {
    const map = L.map('map');

    // Adicionar a camada de azulejos (OpenStreetMap)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Localizar a pessoa
    map.locate({ setView: true, maxZoom: 16 });

    // Evento: Quando a localização é encontrada
    map.on('locationfound', function(e) {
        L.marker(e.latlng).addTo(map)
            .bindPopup("Você está aqui!")
            .openPopup();
        
        L.circle(e.latlng, e.accuracy).addTo(map);

        // Adicionar marcadores dos estabelecimentos
        estabelecimentos.forEach(est => {
            L.marker([est.lat, est.lng]).addTo(map)
                .bindPopup(`<b>${est.nome}</b><br>${est.categorias.join(', ')}`);
        });
    });

    // Evento: Caso a pessoa negue o GPS ou ocorra erro
    map.on('locationerror', function(e) {
        console.warn("Localização não disponível. Usando Saquarema como padrão.");
        
        // Fallback: Se der erro, volta para o centro de Saquarema
        map.setView([-22.9345, -42.4951], 13);

        // Adicionar marcadores dos estabelecimentos mesmo sem localização
        estabelecimentos.forEach(est => {
            L.marker([est.lat, est.lng]).addTo(map)
                .bindPopup(`<b>${est.nome}</b><br>${est.categorias.join(', ')}`);
        });
    });
}
