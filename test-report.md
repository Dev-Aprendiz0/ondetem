# Test Report — PR #11 (Home Redesign)

**Resumo:** E2E completo da home redesenhada validou visual novo (Playfair, hero, stats, tratamentos, footer) e preservação do JS (filtro de categoria, agendamento, Pix, mapa). Todas as 9 asserções passaram, incluindo o fix crítico do `btn-primary-onde` identificado pelo Devin Review.

## Resultado por asserção

- **A1** — Hero em Playfair com "agendado em cliques." + 2 cards flutuantes (+10.000, 4.9/5): **PASSED**
- **A2** — 4 `.stat` na stats bar: **PASSED**
- **A3** — 6 `.treatment-card`: **PASSED**
- **A4** — Footer com 3 `h6` (Empresa, Para você, Para seu negócio): **PASSED**
- **B1** — Filtro "Cabelo" esconde Clínica Flores e Espaço Glow: **PASSED**
- **C1** — Clique em **Agendar** abre `#modalAgendamento` (valida fix do `btn-primary-onde` + ícone): **PASSED**
- **C2** — Pix gera `#pixCobranca` com QR + copia-e-cola + botão "Já paguei": **PASSED**
- **C3** — "Já paguei" confirma pagamento e exibe toast "Agendamento confirmado em Studio Bella Donna" + notificação desktop: **PASSED**
- **D1** — Mapa Leaflet carrega tiles OSM + marcador azul do usuário + marcador roxo da empresa: **PASSED**
- **B2 (login gate)** — **UNTESTED**: usuário já estava logado de sessões anteriores; logout redireciona para `/login` e interrompe o fluxo na home. Fluxo coberto nos E2Es anteriores (PRs #3/#9).

## Fix crítico validado (regressão Devin Review)

A redesign trocou `btn-danger` → `btn-primary-onde` e adicionou `<i class="bi bi-calendar2-heart">` dentro do botão. O handler antigo em `script.js` fazia `e.target.classList.contains('btn-danger')`, o que falhava tanto pela classe nova quanto pelo clique chegar no `<i>` filho. Fix em ef0f30a: `const btn = e.target.closest('.card-salao .card-body .btn')` — resiliente a classes e children. Cache SW bump v12→v13.

## Evidências

### 1. Modal de agendamento abrindo (valida fix)
Clique em "Agendar" no card Studio Bella Donna abre o modal correto:

![Modal de agendamento aberto](https://app.devin.ai/attachments/940e7452-2f4a-4e72-bece-058f802292bb/screenshot_9995b74b68004f3e983c46a4d3234117.png)

### 2. Pix QR code gerado
Após submit com forma de pagamento Pix:

![QR Code Pix gerado](https://app.devin.ai/attachments/08132296-ea91-4018-8f6d-4af5582143b5/screenshot_09973038832248638178bf083b5d40ab.png)

### 3. Confirmação de pagamento
Clique em "Já paguei" dispara toast e notificação desktop:

![Agendamento confirmado](https://app.devin.ai/attachments/33f5b2fc-10b3-4144-9e44-367c86bca390/screenshot_54f0067021504a839caf6edf9679d4a9.png)

### 4. Mapa com marcadores
Tiles OSM + marcador azul do usuário + marcador roxo da empresa cadastrada:

![Mapa com marcadores](https://app.devin.ai/attachments/10b6e5c6-650a-43e6-af36-ad3d8ecf9e56/screenshot_bddf1317931641ce9f4660555b45f873.png)

## Observações
- Geolocalização mock do Chrome da VM retorna EUA — por isso as distâncias ficam em centenas/milhares de km. Não é bug, é ambiente de teste.
- Repositório não tem CI configurado.
