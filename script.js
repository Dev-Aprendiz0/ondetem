// script.js

// Lógica de registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso. Escopo:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registrar o Service Worker:', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnLupaMobile = document.getElementById('btn-lupa-mobile');
    const inputMobile = document.getElementById('input-busca-mobile');
    const inputDesktop = document.querySelector('.search-bar input'); // O que você já tinha
    const cards = document.querySelectorAll('.listings .row > div');

    // 1. Função para filtrar (centralizada para não repetir código)
    function filtrarCards(termo) {
        const searchTerm = termo.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector('.card-title').innerText.toLowerCase();
            const services = card.querySelector('.card-text').innerText.toLowerCase();
            
            if (title.includes(searchTerm) || services.includes(searchTerm)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    // 2. Evento para o input de Desktop
    inputDesktop.addEventListener('input', (e) => filtrarCards(e.target.value));

    // 3. Lógica da Lupa Mobile
    btnLupaMobile.addEventListener('click', () => {
        inputMobile.classList.toggle('d-none');
        inputMobile.classList.toggle('ativo');
        inputMobile.focus();
    });

    // 4. Evento para o input de Mobile
    inputMobile.addEventListener('input', (e) => filtrarCards(e.target.value));
});

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = new bootstrap.Modal(document.getElementById('modalAgendamento'));
    const form = document.getElementById('formAgendamento');
    const statusPagamento = document.getElementById('statusPagamento');

    // 1. Captura todos os botões de agendar nos cards
    const botoesAgendar = document.querySelectorAll('.btn-danger.w-100');

    botoesAgendar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            // Evita que o link recarregue a página
            e.preventDefault();
            
            // Opcional: Pegar o nome do local para exibir no modal
            const nomeLocal = botao.closest('.card-body').querySelector('.card-title').innerText;
            document.getElementById('modalAgendamentoLabel').innerText = `Agendar em: ${nomeLocal}`;
            
            modalElement.show();
        });
    });

    // 2. Simulação de API de Pagamento
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';

        // --- ESPAÇO PARA API FAKE ---
        const dadosAgendamento = {
            data: document.getElementById('dataAgendamento').value,
            hora: document.getElementById('horaAgendamento').value,
            pagamento: document.getElementById('metodoPagamento').value
        };

        try {
            // Simulando uma chamada de rede (ex: Stripe, Mercado Pago ou seu Back-end)
            const resposta = await simularChamadaAPI(dadosAgendamento);
            
            if(resposta.sucesso) {
                statusPagamento.innerHTML = '<b class="text-success">Pagamento Aprovado! Agendamento realizado.</b>';
                setTimeout(() => {
                    modalElement.hide();
                    form.reset();
                    statusPagamento.innerHTML = '';
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = 'Confirmar e Pagar';
                    alert("Sucesso! Você receberá a confirmação por e-mail.");
                }, 2000);
            }
        } catch (erro) {
            statusPagamento.innerHTML = '<b class="text-danger">Erro no processamento. Tente novamente.</b>';
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Confirmar e Pagar';
        }
    });

    // Função que finge ser um servidor/API
    function simularChamadaAPI(dados) {
        return new Promise((resolve) => {
            console.log("Enviando para API:", dados);
            setTimeout(() => {
                resolve({ sucesso: true, transacaoId: "ABC-123" });
            }, 2500); // delay de 2.5 segundos
        });
    }
});