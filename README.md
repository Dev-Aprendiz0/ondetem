# Onde Tem? — PWA de Agendamento de Serviços Estéticos

PWA (Progressive Web App) em Node.js/Express para conectar clientes a salões, clínicas e profissionais autônomos de estética. Inclui cadastro de usuários e empresas, login por token, agendamento autenticado, painel administrativo e **mapa interativo com geolocalização**.

---

## Índice
- [Como rodar](#como-rodar)
- [Credenciais de teste](#credenciais-de-teste)
- [Páginas](#páginas)
- [Fluxo de cadastro de empresa com localização no mapa](#fluxo-de-cadastro-de-empresa-com-localização-no-mapa)
- [Mapa de empresas próximas (para usuários)](#mapa-de-empresas-próximas-para-usuários)
- [API relevante](#api-relevante)
- [Plano de testes](#plano-de-testes-cadastros--admin)

## Como rodar
```bash
npm install
npm start
# Servidor em http://localhost:3000
```

## Credenciais de teste
| Tipo      | E-mail                 | Senha  |
|-----------|------------------------|--------|
| Admin     | `admin@ondetem.com`    | 123456 |
| Empresa   | `empresa@ondetem.com`  | 123456 |
| Usuário   | `joao@email.com`       | 123456 |

## Páginas
- **`/`** — Home com cards em destaque e **mapa interativo** mostrando a localização do usuário e das empresas cadastradas.
- **`/login`** — Login unificado (admin / empresa / usuário).
- **`/cadastro-usuario`** — Cadastro de cliente final.
- **`/cadastro-empresa`** — Cadastro de estabelecimento, **com seleção obrigatória da localização no mapa**.
- **`/agendamentos`** — Lista de agendamentos do usuário logado (exige login como `usuario`).
- **`/admin`** — Painel administrativo (exige `admin@ondetem.com`).
- **`/painel-empresa`** — Painel da empresa logada.

## Fluxo de cadastro de empresa com localização no mapa

Ao cadastrar uma empresa em `/cadastro-empresa`, além dos dados comerciais tradicionais (CNPJ, razão social, categorias, serviços, horários, endereço), o formulário exige **marcar o ponto exato do estabelecimento no mapa**. Essa localização é persistida como `lat`/`lng` e é o que permite que clientes na home vejam a empresa no mapa e filtrem por proximidade.

A seção "Localização no Mapa" oferece três maneiras de marcar o ponto:
1. **Usar minha localização** — botão que pede permissão de geolocalização do navegador e solta o marcador na posição atual (útil para quem está cadastrando estando dentro do estabelecimento).
2. **Buscar pelo endereço preenchido** — consulta o [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) com os campos de rua/número/bairro/cidade/UF/CEP que já estão no formulário e centraliza o marcador no resultado.
3. **Clicar / arrastar no mapa** — clique em qualquer ponto para mover o marcador, ou arraste o marcador já posicionado para ajuste fino.

Os campos **Latitude** e **Longitude** (somente leitura) são preenchidos automaticamente. O submit é bloqueado se o marcador não for posicionado, e o backend (`POST /api/empresas`) também valida `lat`/`lng` e retorna **400** caso venham ausentes ou fora do intervalo `[-90..90]` / `[-180..180]`.

> 💡 Quando o CEP é preenchido, o formulário já tenta geocodificar silenciosamente o endereço para sugerir um ponto inicial no mapa — o usuário só precisa ajustar se necessário.

## Mapa de empresas próximas (para usuários)

Na home (`/`), o mapa (Leaflet + OpenStreetMap) mostra três camadas:

- 🔵 **Marcador azul**: posição do usuário (pedido via `navigator.geolocation` / `L.Map.locate`).
- 🔴 **Marcadores vermelhos**: estabelecimentos "em destaque" (dados de `config.js`).
- 🟣 **Marcadores roxos**: **empresas cadastradas via `/cadastro-empresa`**, carregadas de `GET /api/empresas/publicas`.

Ao clicar em um marcador roxo, o popup mostra o nome, categorias, endereço e telefone da empresa, e — quando a geolocalização do usuário está disponível — a **distância aproximada até você** (em metros se < 1 km, senão em km), calculada com a fórmula de Haversine.

## API relevante

| Método | Rota                          | Descrição                                                                 |
|-------:|-------------------------------|---------------------------------------------------------------------------|
| POST   | `/api/login`                  | Autentica admin/empresa/usuário e devolve `token` + `usuario`.            |
| POST   | `/api/empresas`               | Cadastra nova empresa. **Exige `lat`/`lng` válidos**. Persiste endereço estruturado, categorias, serviços e horários. |
| GET    | `/api/empresas/publicas`      | Lista empresas com coordenadas válidas para exibição no mapa público (sem senhas, sem dados internos). |
| GET    | `/api/empresas`               | Lista completa para o painel admin (sem senha).                           |
| POST   | `/api/agendamentos`           | Cria agendamento (exige token de `usuario`).                              |

---

# Plano de Testes: Cadastros + Admin

## O Que Mudou
Três novas páginas adicionadas ao PWA "Onde Tem?":
1. **Cadastro de usuário** (`/cadastro-usuario`) — formulário completo com dados pessoais, contato, endereço e senha
2. **Cadastro de empresa** (`/cadastro-empresa`) — formulário comercial com CNPJ, categorias, serviços, horários **e seleção obrigatória de localização no mapa**
3. **Dashboard Admin** (`/admin`) — login + painel de gerenciamento com estatísticas e tabelas de usuários/empresas/agendamentos

Navegação atualizada: `login.html` agora possui os botões "Cadastrar como Usuário" e "Cadastrar como Empresa". `index.html` possui um link "Admin" no cabeçalho.

## Fluxo Principal: Cadastro de Ponta a Ponta + Verificação do Admin

### Teste 1: Navegação do Login para as Páginas de Cadastro
**Passos:**
1. Navegue para `http://localhost:3000/login`
2. Verifique se a página exibe dois novos botões: "Cadastrar como Usuário" e "Cadastrar como Empresa"
3. Clique em "Cadastrar como Usuário"

**Critérios de aprovação:** O navegador redireciona para `/cadastro-usuario.html` e exibe o formulário com o título "Cadastro de Usuário"

### Teste 2: Formulário de Cadastro de Usuário — Envio com Dados Válidos
**Passos:**
1. Em `/cadastro-usuario`, preencha:
   - Nome Completo: "Maria Silva"
   - CPF: "123.456.789-00"
   - Data de Nascimento: "1990-05-15"
   - E-mail: "maria@teste.com"
   - Telefone: "(21) 99999-1234"
   - Senha: "Teste@123"
   - Confirmar Senha: "Teste@123"
   - Marque o checkbox "termos de uso"
2. Clique no botão "Criar Minha Conta"

**Critérios de aprovação:**
- Um banner de alerta verde aparece no topo com um texto contendo "Cadastro realizado com sucesso!"
- O botão exibe temporariamente um *spinner* com o texto "Cadastrando..." durante o envio
- Após cerca de 2 segundos, a página redireciona para `login.html`

### Teste 3: Formulário de Cadastro de Usuário — Indicador de Força da Senha
**Passos:**
1. Em `/cadastro-usuario`, digite "abc" no campo Senha
2. Observe o indicador de força da senha
3. Em seguida, digite "Abc123!@" no campo Senha
4. Observe o indicador de força da senha novamente

**Critérios de aprovação:**
- "abc" → a barra de força exibe o estado "fraca" com a cor vermelha/laranja
- "Abc123!@" → a barra de força exibe o estado "forte" com a cor verde, e o texto de dica diz "Senha forte!"

### Teste 4: Página de Cadastro de Empresa Carrega com Todas as Seções
**Passos:**
1. Navegue para `http://localhost:3000/cadastro-empresa`
2. Role a página pelo formulário

**Critérios de aprovação:** A página exibe todas as seções:
- Seção "Dados da Empresa" com os campos `nomeEmpresa`, `cnpj`, `razaoSocial`, `nomeFantasia` e `descricaoEmpresa`
- Seção "Categorias de Serviços" com 6 checkboxes (Cabelo, Unhas, Depilação, Sobrancelhas, Massagem, Rosto)
- Seção "Serviços Oferecidos" com o botão "Adicionar Serviço"
- Seção "Contato" com os campos `email`, `telefone`, `whatsapp` e `instagram`
- Seção "Endereço do Estabelecimento" com o campo `CEP`
- Seção **"Localização no Mapa *"** com o mapa Leaflet, botões "Usar minha localização" e "Buscar pelo endereço preenchido", e os campos somente-leitura Latitude e Longitude
- Seção "Horário de Funcionamento" com os checkboxes de dias e campos de horário
- Seção "Senha de Acesso" com os campos `nomeResponsavel`, `senha` e `confirmarSenha`
- O botão de envio "Cadastrar Empresa" está visível

### Teste 4a: Cadastro de Empresa — Localização no Mapa é Obrigatória
**Passos:**
1. Em `/cadastro-empresa`, preencha todos os campos textuais obrigatórios (Dados, Categorias, Contato, Endereço, Horários, Senha) mas **não** interaja com o mapa
2. Clique em "Cadastrar Empresa"

**Critérios de aprovação:**
- O formulário **não** é enviado
- A seção "Localização no Mapa" entra em foco (scroll) e exibe o status vermelho "Marque a localização da empresa no mapa antes de cadastrar."
- O campo Latitude aparece em estado inválido (borda vermelha)

### Teste 4b: Cadastro de Empresa — Marcar via Clique no Mapa
**Passos:**
1. Em `/cadastro-empresa`, clique em qualquer ponto dentro do mapa da seção "Localização no Mapa"
2. Observe os campos Latitude e Longitude

**Critérios de aprovação:**
- Um marcador aparece exatamente no ponto clicado
- Os campos Latitude e Longitude são preenchidos automaticamente com 6 casas decimais
- O status abaixo do mapa fica verde: "Localização marcada: -22.xxxxxx, -42.xxxxxx"
- Arrastar o marcador atualiza os campos Latitude/Longitude em tempo real

### Teste 4c: Cadastro de Empresa — Buscar pelo Endereço
**Passos:**
1. Em `/cadastro-empresa`, preencha o CEP (ex.: `28990-000` para Saquarema)
2. Aguarde o autocompletar pelo ViaCEP preencher rua/bairro/cidade/UF
3. Clique em "Buscar pelo endereço preenchido"

**Critérios de aprovação:**
- O mapa centraliza na região geocodificada e solta um marcador
- Latitude/Longitude são preenchidos
- Status verde "Localização marcada: …" aparece

### Teste 4d: Cadastro Completo Aparece no Mapa da Home
**Passos:**
1. Em `/cadastro-empresa`, cadastre uma empresa válida (com todos os campos e localização no mapa)
2. Após o redirecionamento para `/login`, abra `/` em outra aba
3. Aguarde o mapa carregar

**Critérios de aprovação:**
- Um marcador **roxo** aparece na posição cadastrada
- Ao clicar no marcador, o popup mostra nome, categorias, endereço e (se a geolocalização estiver concedida) a distância aproximada até o usuário

### Teste 5: Login de Admin — Credenciais Corretas
**Passos:**
1. Navegue para `http://localhost:3000/admin`
2. Verifique se o formulário de login está visível com o título "Painel Admin"
3. Insira o email: "admin@ondetem.com"
4. Insira a senha: "123456"
5. Clique no botão "Entrar"

**Critérios de aprovação:**
- O formulário de login desaparece
- O painel do dashboard admin aparece com uma barra lateral mostrando: Dashboard, Usuários, Empresas, Agendamentos, Configurações
- O Dashboard exibe 4 cards de estatísticas: "Usuários Cadastrados", "Empresas Ativas", "Agendamentos" e "Receita Estimada"
- A barra superior exibe o título "Dashboard" e o e-mail "admin@ondetem.com"

### Teste 6: Login de Admin — Credenciais Incorretas
**Passos:**
1. Navegue para `http://localhost:3000/admin` (página recarregada/nova)
2. Insira o email: "wrong@email.com"
3. Insira a senha: "wrongpass"
4. Clique em "Entrar"

**Critérios de aprovação:**
- O formulário de login permanece visível (sem troca de painel)
- Um texto de erro em vermelho aparece dizendo "E-mail ou senha incorretos."

### Teste 7: Painel Admin — Navegação da Barra Lateral
**Passos:**
1. Após o login bem-sucedido no admin, clique em "Usuários" na barra lateral
2. Em seguida, clique em "Empresas" na barra lateral
3. Depois, clique em "Configurações" na barra lateral

**Critérios de aprovação:**
- Clicar em "Usuários" → o título da barra superior muda para "Usuários" e exibe a tabela de usuários com "Nenhum usuário cadastrado"
- Clicar em "Empresas" → o título da barra superior muda para "Empresas" e exibe a tabela de empresas com "Nenhuma empresa cadastrada"
- Clicar em "Configurações" → o título da barra superior muda para "Configurações", exibe o campo de nome da plataforma com o valor "Onde Tem?" e o e-mail de suporte "suporte@ondetem.com"

### Teste 8: Página Inicial (Index) — Link do Admin no Cabeçalho
**Passos:**
1. Navegue para `http://localhost:3000/`
2. Verifique o cabeçalho em busca de um botão/link para "Admin"

**Critérios de aprovação:** O cabeçalho exibe um link/botão "Admin" que aponta para `admin.html`

## Evidências de Código
- `server.js` linhas 35-45: Novas rotas para `/cadastro-usuario`, `/cadastro-empresa`, `/admin`
- `server.js` linhas 101-130: Endpoints da API para `POST /api/usuarios` e `POST /api/empresas`
- `server.js` linhas 52-63: `POST /api/login` com credenciais de admin fixadas no código (*hardcoded*)
- `login.html` linhas 38-41: Novos botões de cadastro
- `index.html` linha 33: Link do Admin no cabeçalho
- `cadastro-usuario.html` linhas 606-677: Manipulador de envio (*submit handler*) do formulário
- `cadastro-empresa.html` linhas 724-832: Manipulador de envio do formulário
- `admin.html` linhas 770-810: Manipulador de login do admin
- `admin.html` linhas 836-873: Manipulador de navegação da barra lateral