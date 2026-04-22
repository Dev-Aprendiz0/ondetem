# Onde Tem?

> PWA de agendamento de serviços estéticos — conecta clientes a salões, clínicas e profissionais autônomos de beleza, com mapa de proximidade, pagamento online (Pix/cartão simulados) e chat com IA.

<p align="center">
  <em>Node.js · Express · Vanilla JS · Bootstrap 5 · Leaflet · Service Worker · Google Gemini</em>
</p>

---

## Sumário

- [Visão geral](#visão-geral)
- [Como rodar](#como-rodar)
- [Credenciais de teste](#credenciais-de-teste)
- [Páginas](#páginas)
- [Principais funcionalidades](#principais-funcionalidades)
- [Arquitetura](#arquitetura)
- [API](#api)
- [Simulação de pagamento](#simulação-de-pagamento)
- [Chat com IA (Gemini)](#chat-com-ia-gemini)
- [Testes](#testes)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap](#roadmap)
- [Documentação adicional](#documentação-adicional)

---

## Visão geral

**Onde Tem?** é um PWA (Progressive Web App) em **Node.js + Express** que oferece uma experiência estilo *marketplace* de beleza:

- Cliente descobre salões próximos em cards (home com layout inspirado no Airbnb) e num mapa Leaflet.
- Cliente agenda um serviço e paga com **Pix** ou **cartão** (simulados) — ou opta por pagar no local.
- Empresa/salão se cadastra marcando sua localização no mapa, gerencia seus serviços e vê seu dashboard.
- Admin tem painel completo para administrar usuários, empresas, agendamentos e pagamentos.
- Chat IA flutuante (Google Gemini) responde dúvidas sobre a plataforma.

Funciona offline (Service Worker), pode ser instalado como app e usa apenas HTML/CSS/JS no front — **nenhum framework front-end**.

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Subir o servidor (http://localhost:3000)
npm start

# 3. (Opcional) Rodar os testes
npm test

# 4. Healthcheck
curl http://localhost:3000/healthz
```

Requer **Node 18+**. Não há banco de dados: os dados vivem em memória e reiniciam a cada restart.

## Credenciais de teste

| Tipo      | E-mail                | Senha   |
|-----------|-----------------------|---------|
| Admin     | `admin@ondetem.com`   | `123456`|
| Empresa   | `empresa@ondetem.com` | `123456`|
| Usuário   | `joao@email.com`      | `123456`|

## Páginas

| Rota                  | Descrição                                                                 |
|-----------------------|---------------------------------------------------------------------------|
| `/`                   | Home estilo Airbnb: busca, categorias, grid de salões e mapa interativo.  |
| `/login`              | Login unificado (admin / empresa / usuário).                              |
| `/cadastro-usuario`   | Cadastro de cliente final.                                                |
| `/cadastro-empresa`   | Cadastro de empresa **com seleção obrigatória da localização no mapa**.    |
| `/agendamentos`       | Lista de agendamentos do usuário logado.                                  |
| `/admin`              | Painel administrativo (exige conta admin).                                |
| `/painel-empresa`     | Painel da empresa (serviços, dashboard, perfil).                          |

## Principais funcionalidades

### 🔍 Home estilo Airbnb
- Header *sticky* com pill de busca unificada e atalhos "Anuncie seu salão" / perfil.
- Barra horizontal de **categorias**: Cabelo, Unhas, Depilação, Sobrancelhas, Massagem, Rosto.
- Grid de **cards de salão** com foto, avaliação, distância, tags, preço "a partir de" e CTA *Agendar*.
- Badges visuais: `Verificado`, `Top avaliado`, `Favorito`, `Novidade`, `Excelência 5.0`.
- Mapa colapsável ("Ocultar mapa" / "Mostrar mapa") logo abaixo do grid.
- 100% responsivo: no mobile aparece um bottom-nav com Início / Buscar / Agendamentos / Perfil.

### 🗺️ Mapa de salões próximos
Usa **Leaflet + OpenStreetMap**, com três camadas:
- 🔵 **Marcador azul** — posição do usuário (via `navigator.geolocation`).
- 🔴 **Marcadores vermelhos** — salões em destaque (definidos em `config.js`).
- 🟣 **Marcadores roxos** — empresas reais cadastradas em `/cadastro-empresa` (via `GET /api/empresas/publicas`).

Clique em um marcador roxo e o popup mostra nome, categorias, endereço, telefone e **distância até você** (Haversine, em m ou km).

### 📍 Cadastro de empresa com localização obrigatória
Na página `/cadastro-empresa`, além dos dados comerciais, o formulário exige marcar o ponto exato no mapa. Três formas de fazer isso:
1. **Usar minha localização** — pega a coordenada via geolocalização do navegador.
2. **Buscar pelo endereço** — consulta o [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) com os campos preenchidos.
3. **Clicar / arrastar no mapa** — clique ou arraste o marcador para ajuste fino.

`lat` e `lng` são salvos e validados pelo backend (`POST /api/empresas` retorna **400** se estiverem ausentes ou fora do intervalo válido).

### 💳 Pagamento: Pix e cartão (simulados)
No modal de agendamento, o usuário escolhe:
- **Cartão de crédito** — formulário com máscara de número, validade e CVV, com até 12x. Passa pelo algoritmo de **Luhn** no servidor.
- **Pix** — gera QR Code + "copia e cola" simulados. Botão *"Já paguei"* dispara a confirmação.
- **Pagar no estabelecimento** — pula o fluxo de pagamento e só cria o agendamento.

Veja [Simulação de pagamento](#simulação-de-pagamento) para detalhes e exemplos com `curl`.

### 💬 Chat IA flutuante (Google Gemini)
Widget no canto inferior direito que conversa com o modelo **`gemini-2.5-flash-lite`**. A chave fica só no servidor (nunca é enviada ao cliente). Veja [Chat com IA (Gemini)](#chat-com-ia-gemini).

### 📲 PWA
- `manifest.json` + `service-worker.js` implementam cache, *offline fallback* e estrutura para instalação.
- Estratégia do SW: **cache-first** para assets estáticos e **network-first com `stale-while-revalidate`** para HTML.

### 🔐 Autenticação
- Tokens hex de 24 bytes guardados em `Map` no servidor.
- Três tipos de conta com regras distintas: `admin`, `empresa`, `usuario`.
- Front guarda `token` + `usuario` em `localStorage` (namespace `ondetem_*`).
- Agendamentos exigem login de tipo `usuario`.
- Botão **Sair** disponível no header e no bottom-nav mobile.

## Arquitetura

```
ondetem/
├── server.js               # Express (API + serve static)
├── config.js               # Mock de ESTABELECIMENTOS em destaque + categorias
├── script.js               # JS da home (busca, filtro, mapa, modal de agendamento)
├── app.js                  # Registro do SW + bootstrap geral
├── utils.js                # Helpers (formatação, validação, etc.)
├── chat.js / chat-widget.* # Widget de chat IA
├── auth-guard.js           # Redireciona não-logados em páginas protegidas
├── service-worker.js       # Cache + offline
├── index.html              # Home
├── login.html, cadastro-*.html, admin.html, painel-empresa.html, agendamentos.html
├── style.css               # Design system + componentes
├── manifest.json           # PWA
├── docs/
│   └── fluxograma.md       # Diagrama de arquitetura, jornadas e fluxos
└── tests/                  # node --test nativo
```

- **Sem framework front**: HTML + Bootstrap 5 + CSS próprio + JS vanilla.
- **Sem banco**: estado em memória (`db = { usuarios, empresas, agendamentos, pagamentos, sessoes }` em `server.js`). Popula seeds na inicialização para facilitar testes.
- **Sem ORM / migrations**: tudo é array na memória.
- **Sem gateway de pagamento real**: regras determinísticas para validar fluxo E2E.

## API

Todas as respostas seguem o padrão `{ status: "sucesso" | "erro", ... }`. Rotas protegidas exigem `Authorization: Bearer <token>`.

### Auth & identidade
| Método | Rota          | Descrição                                                       |
|-------:|---------------|-----------------------------------------------------------------|
| POST   | `/api/login`  | Autentica admin/empresa/usuário. Retorna `token` + `usuario`.    |
| POST   | `/api/logout` | Encerra a sessão do token.                                       |
| GET    | `/api/me`     | Dados da sessão atual.                                           |

### Usuários & empresas
| Método | Rota                     | Descrição                                                               |
|-------:|--------------------------|-------------------------------------------------------------------------|
| POST   | `/api/usuarios`          | Cadastro de cliente final.                                              |
| GET    | `/api/usuarios`          | Lista de usuários (sem senha).                                          |
| POST   | `/api/empresas`          | Cadastro de empresa. **Exige `lat`/`lng` válidos.**                      |
| GET    | `/api/empresas`          | Lista completa (painel admin).                                          |
| GET    | `/api/empresas/publicas` | Lista com campos seguros + coordenadas (alimenta o mapa da home).       |

### Agendamentos
| Método | Rota                  | Descrição                                                       |
|-------:|-----------------------|-----------------------------------------------------------------|
| POST   | `/api/agendamentos`   | Cria agendamento (tipo=`usuario`). Aceita `pagamentoId` opcional.|
| GET    | `/api/agendamentos`   | Lista agendamentos do usuário/empresa logado; admin vê todos.    |

### Serviços & painel da empresa
| Método | Rota                              | Descrição                                         |
|-------:|-----------------------------------|---------------------------------------------------|
| GET    | `/api/servicos`                   | Serviços públicos.                                |
| GET    | `/api/empresa/servicos`           | Serviços da empresa logada.                       |
| POST   | `/api/empresa/servicos`           | Cria serviço.                                     |
| PUT    | `/api/empresa/servicos/:id`       | Edita serviço.                                    |
| DELETE | `/api/empresa/servicos/:id`       | Remove serviço.                                   |
| GET    | `/api/empresa/perfil`             | Perfil da empresa.                                |
| PUT    | `/api/empresa/perfil`             | Atualiza perfil.                                  |
| GET    | `/api/empresa/dashboard`          | Métricas do painel da empresa.                    |

### Pagamentos (simulados)
| Método | Rota                                  | Descrição                                   |
|-------:|---------------------------------------|---------------------------------------------|
| POST   | `/api/pagamentos/cartao`              | Simula cobrança no cartão (Luhn + CVV).     |
| POST   | `/api/pagamentos/pix`                 | Gera cobrança Pix com QR Code simulado.     |
| POST   | `/api/pagamentos/pix/:id/confirmar`   | Simula baixa do PSP (aguardando→aprovado). |
| GET    | `/api/pagamentos`                     | Lista pagamentos do usuário logado.         |
| GET    | `/api/pagamentos/:id`                 | Consulta status de pagamento.               |

### Chat IA & utilidades
| Método | Rota          | Descrição                                                          |
|-------:|---------------|--------------------------------------------------------------------|
| POST   | `/api/chat`   | Proxy para o Gemini. Retorna **503** se `GEMINI_API_KEY` ausente.  |
| GET    | `/healthz`    | Healthcheck: `uptime`, `timestamp` e contadores.                   |

## Simulação de pagamento

> ⚠️ **É uma simulação.** Nunca envie dados reais de cartão. Número completo e CVV **não** são persistidos nem devolvidos — apenas bandeira, 4 últimos dígitos e nome do titular.

### Cartão de crédito (`POST /api/pagamentos/cartao`)
- Número de **13 a 19 dígitos**, validado pelo algoritmo de **Luhn**.
- Bandeira detectada por prefixo: Visa, Mastercard, Amex, Discover, Hipercard, Elo.
- Validade em `MM/AA` ou `MM/AAAA`, precisa estar no futuro.
- CVV de **3 ou 4 dígitos**.
- Números de teste:
  - ✅ **Aprovado** — `4111 1111 1111 1111`, `5555 5555 5555 4444`, ou qualquer Luhn-válido que **não** termine em `0000`.
  - ❌ **Recusado** — qualquer Luhn-válido que termine em `0000` (ex.: `4242 4242 4242 0000`). Retorna **402 Payment Required**.

### Pix (`POST /api/pagamentos/pix` + `/confirmar`)
- A geração retorna `status: "aguardando"`, `txid` aleatório, código "copia e cola" e `expiraEm` (30 min).
- Como não há PSP real, o próprio pagador "confirma" via `POST /api/pagamentos/pix/:id/confirmar` → status vira `aprovado` e devolve `endToEndId`.
- Após a expiração, confirmar devolve **410 Gone** com status `expirado`.

### Exemplo completo com `curl`

```bash
# 1) Login como usuário
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"joao@email.com","senha":"123456","tipo":"usuario"}' \
  | jq -r .token)

# 2) Cartão aprovado
curl -s -X POST http://localhost:3000/api/pagamentos/cartao \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"valor":95.5,"numero":"4111 1111 1111 1111","nome":"JOAO SILVA","validade":"12/29","cvv":"123","parcelas":2}'

# 3) Gerar e confirmar Pix
PIX=$(curl -s -X POST http://localhost:3000/api/pagamentos/pix \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"valor":120.75}')
PIX_ID=$(echo "$PIX" | jq -r .dados.id)
curl -s -X POST "http://localhost:3000/api/pagamentos/pix/$PIX_ID/confirmar" \
  -H "Authorization: Bearer $TOKEN"
```

## Chat com IA (Gemini)

O widget flutuante no canto inferior direito é proxy para **Google Gemini** (`gemini-2.5-flash-lite`). Para ativá-lo:

```bash
export GEMINI_API_KEY="sua-chave-do-google-ai-studio"
# Chave gratuita em https://aistudio.google.com/apikey
npm start
```

Comportamento:
- **Com chave**: `POST /api/chat` encaminha a mensagem ao Gemini e devolve a resposta.
- **Sem chave**: responde **503** com aviso amigável, e o widget mostra o erro na UI.
- A chave **nunca** é exposta ao cliente — vive apenas no processo Node.
- Modelo alternativo: `GEMINI_MODEL=gemini-2.5-flash npm start`.

## Testes

Testes unitários e de fumaça usam o runner nativo do Node (sem dependências externas):

```bash
npm test
```

Os arquivos ficam em `tests/*.test.js`. Além disso, o repo inclui **planos e relatórios de teste E2E manuais** em markdown:

- [`test-plan.md`](./test-plan.md) — Plano geral de cadastros e admin (T1–T8).
- [`test-plan-airbnb.md`](./test-plan-airbnb.md) — Plano E2E da home estilo Airbnb.
- [`test-plan-logins.md`](./test-plan-logins.md) — Plano de verificação dos três tipos de login.
- [`test-plan-chat-ia.md`](./test-plan-chat-ia.md) — Plano do widget de chat IA.
- [`test-report-*.md`](./) — Relatórios correspondentes com os resultados.

## Limitações conhecidas

Este é um projeto **acadêmico**, otimizado para clareza e não para produção:

| Área            | Limitação atual                                                                | Como evoluir                                                |
|-----------------|-------------------------------------------------------------------------------|-------------------------------------------------------------|
| Persistência    | Dados em memória — tudo zera ao reiniciar.                                    | Migrar para SQLite (`better-sqlite3`) ou PostgreSQL.        |
| Senhas          | Armazenadas em plaintext nas seeds e cadastros.                               | Hash com `bcrypt` + `bcrypt.compare` no login.              |
| Sessão          | Token hex em `Map`, sem expiração nem rotação.                                | JWT assinado + refresh, ou `express-session` com store.     |
| Segurança HTTP  | Sem `helmet`, sem CORS restrito, sem rate-limit.                              | Adicionar `helmet`, `express-rate-limit`, CORS allowlist.   |
| Pagamento       | Gateway simulado.                                                             | Integrar PSP real (Mercado Pago, Stripe, PagSeguro…).       |
| Push            | Chave VAPID de exemplo no `app.js`.                                           | Gerar par com `web-push` e guardar em variável de ambiente. |

## Roadmap

1. **Persistência real** — swap do `db` em memória por SQLite com migrations.
2. **Bcrypt + JWT** — fechar o principal buraco de segurança do backend.
3. **`helmet` + rate-limit** — mitigar brute-force e headers faltando.
4. **Filtro por distância** — ordenar cards da home por distância Haversine até a geolocalização do usuário.
5. **Filtro por categoria no mapa** — esconder marcadores conforme a categoria ativa.
6. **Avaliações reais** — permitir nota/comentário após `status === 'concluido'`.
7. **Push notifications** reais — VAPID + `web-push` server-side.
8. **Testes E2E automatizados** — Playwright cobrindo login → agendamento → pagamento.

## Documentação adicional

- [Fluxograma do projeto](./docs/fluxograma.md) — arquitetura, jornadas, pagamento, auth e SW.
- [CONTRIBUTING](./CONTRIBUTING.md) — padrões de branch, commit e PR.
- [LICENSE](./LICENSE) — MIT.

---

<p align="center">
  Feito com ❤️ em Node.js puro. Sem frameworks front-end, sem banco de dados, sem complicação — só o essencial.
</p>
