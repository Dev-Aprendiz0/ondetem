# Test Plan — PR #11: Redesign da Home

## O que mudou
- `index.html` + `style.css` reescritos com novas seções (topbar, hero com galeria, stats, tratamentos, como funciona, CTA empresas, footer) e nova tipografia (Playfair + Inter).
- SW cache bump v11 → v12.
- Nenhuma mudança em `script.js` nem no backend.

## Principal risco
A restruturação do HTML pode ter quebrado hooks usados pelo `script.js` (`.listings .row > div`, `.category-item > p`, `.card-salao[data-index]`, `#modalLoginNecessario`, `#modalAgendamento`, `#map`, `#formPagamento`, `#tipoPagamento`, `#pixCobranca`).

Se o test plan passasse mesmo com o JS quebrado, ele é fraco — as asserções abaixo foram montadas para falharem claramente num desses cenários.

## Fluxo único E2E (um único recording)

### Fase A — Visual da redesign (prova que o CSS novo subiu)
1. Abrir `http://localhost:3000/` com cache bypassado (query string).
2. **A1**: topo da página exibe título em Playfair Display contendo o texto `agendado em cliques.` em itálico roxo.  
   *Pass:* `document.querySelector('.hero-title em').textContent.trim() === 'agendado em cliques.'` E `getComputedStyle(el).fontFamily` inclui `Playfair Display`.  
   *Fail se CSS/HTML antigo:* seletor não existe.
3. **A2**: galeria do hero tem dois cards flutuantes — um com `+10.000` e outro com `4.9 / 5`.  
   *Pass:* existem `.hero-gallery-card-1` e `.hero-gallery-card-2`, cada um com `strong` cujo texto contém `10.000` e `4.9` respectivamente.
4. **A3**: stats bar abaixo do hero tem 4 `.stat` com os valores `+500`, `+10k`, `4.9/5`, `24/7`.  
   *Pass:* `document.querySelectorAll('.stats .stat').length === 4`.
5. **A4**: seção "Tratamentos em alta" existe e contém 6 `.treatment-card`.  
   *Pass:* `document.querySelectorAll('.treatment-card').length === 6`.
6. **A5**: footer escuro novo é renderizado com os títulos "Empresa", "Para você" e "Para seu negócio".  
   *Pass:* `document.querySelector('.site-footer')` tem 3 `h6`.

### Fase B — JS continua funcionando (regressão crítica)
7. **B1**: Clique no card de categoria `Cabelo` → só devem ficar visíveis os cards que contêm "Cabelo" nos serviços.  
   *Pass:* após o clique, `document.querySelectorAll('.listings .row > div:not([style*="display: none"])').length < 3` (antes eram 3) E o card "Clínica Estética Flores" (que **não** tem Cabelo) tem `style.display === 'none'`.  
   *Fail se JS quebrado:* todos os 3 cards continuam visíveis ou nenhum continua.
8. **B2**: Resetar categoria (clique novamente em `Cabelo` ou reload) e clicar em **Agendar** no primeiro card, sem estar logado.  
   *Pass:* abre modal `#modalLoginNecessario` (Bootstrap `.modal.show`) com texto `Você precisa estar logado` visível.  
   *Fail se regressão:* abre direto o modal de agendamento (sem a checagem de login).
9. **B3**: Fechar o modal, ir para `/login.html`, entrar com `joao@email.com` / `123456` → volta pra home autenticado.  
   *Pass:* `localStorage.getItem('ondetem_token')` passa a ser uma string não-vazia.
10. **B4**: Clicar em **Agendar** no primeiro card → agora abre `#modalAgendamento` (e **não** o de login).  
   *Pass:* `#modalAgendamento.classList.contains('show') === true` e `#modalLoginNecessario` não está visível.
11. **B5**: Preencher data/hora/serviço, selecionar **Pix**, clicar **Confirmar** → aparece `#pixCobranca` com QR code + botão "Já paguei (simular)".  
   *Pass:* `document.getElementById('pixCobranca').classList.contains('d-none') === false` e existe `img` com src contendo `data:image/png;base64` (QR).
12. **B6**: Clicar **Já paguei (simular)** → status do pagamento vira "aprovado" (texto verde) e aparece notificação de confirmação.  
   *Pass:* texto contendo `aprovado` visível em `#statusPagamento`.

### Fase C — Mapa (regressão)
13. **C1**: Rolar até a seção "Estabelecimentos perto de você" → `#map` renderiza tiles do OpenStreetMap e pelo menos 1 marcador.  
    *Pass:* `#map .leaflet-tile-loaded` count > 0 e `document.querySelectorAll('.leaflet-marker-icon').length >= 1`.

## Fora de escopo (não testar)
- `cadastro-empresa.html` (não teve mudanças nesta PR).
- Pagamento por cartão (mesma lógica do Pix, basta provar que o form submit funciona via Pix).
- Responsivo mobile (se der tempo, rápido; senão, apenas screenshot).

## Asserções que quebrariam um redesign falho
- Se o HTML novo não subiu: A1 falha (nenhum `.hero-title em`).
- Se o CSS novo não carregou: A1 falha na checagem de `font-family`.
- Se algum hook de JS quebrou: B1/B2/B5 falham visivelmente.
