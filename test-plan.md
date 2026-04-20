# Plano de Testes E2E — Onde tem? (branch PR #9)

Contexto: gravar um único vídeo demonstrando que o sistema completo funciona
após todas as PRs de bugfix e features dessa sessão (#3, #5, #6, #7, #8 já
mergeadas; #9 ainda aberta). Cada teste abaixo foi pensado para falhar de
forma visível se a mudança correspondente estiver quebrada.

Base de código consultada:
- `index.html:29-53` — header (sem botão 🔔 de notificação, prova da #8)
- `index.html:164-189` — modal "Login necessário"
- `index.html:191-287` — modal de agendamento (valor, método, blocos cartão/Pix)
- `script.js:237-273` — `exigirUsuarioLogado` + `abrirModalLoginNecessario`
- `script.js:295-318` — `sincronizarBlocoPagamento` (fix #7)
- `script.js:394-458` — `processarAgendamento` (cartão vs Pix)
- `script.js:589-597` — reset com `resetarBlocoPix()` antes de sincronizar (fix #7)
- `server.js:257-289` — autorização dos endpoints `/api/pagamentos[/:id]` (fix #7)
- `cadastro-empresa.html:502-535,945-1018` — mapa obrigatório + submit (feature #5)
- `app.js:42-75,112-141` — prompt nativo de notificação + `showNotification` via SW (#8 + #9)

---

## Fluxo primário: jornada completa (gravado em um só vídeo)

Pré-condições: servidor Express rodando em `http://localhost:3000`, Chrome
maximizado, cache do Service Worker já servindo `v10`, usuário de teste
`joao@email.com / 123456` disponível no seed.

### T1 — Prompt nativo de notificação aparece sozinho (#8)
1. Abrir `http://localhost:3000/` com permissão de notificação no estado
   `default` (se já estiver `granted`/`denied`, resetar em
   `chrome://settings/content/notifications` antes do teste).
2. **Assertion**: o Chrome exibe o prompt nativo "…quer mostrar notificações"
   com botões **Permitir / Bloquear**, sem o usuário ter clicado em nada.
3. **Assertion adversarial**: o header NÃO contém o botão "🔔 Notificações".
   Se a mudança da #8 estivesse quebrada, o botão apareceria e o prompt não
   dispararia automaticamente.
4. Clicar **Permitir** e continuar.

### T2 — Agendar sem login abre modal "Login necessário" (#3)
1. Ainda deslogado, clicar no botão **Agendar** do card "Studio Bella Vita".
2. **Assertion**: abre o modal com título `Login necessário` e botões
   **Agora não**, **Cadastrar-se** e **Fazer login** (este último com `href`
   contendo `login.html?redirect=%2F`).
3. **Assertion adversarial**: o modal de agendamento (`#modalAgendamento`)
   **não** fica visível. Se o fix da #3 estivesse quebrado, o formulário de
   agendamento abriria sem pedir login.
4. Clicar **Fazer login** → deve ir para `/login.html?redirect=%2F`.

### T3 — Login válido redireciona para home sem "Erro de conexão" (#3)
1. Em `/login.html`, manter "Tipo" em Usuário, preencher
   `joao@email.com` / `123456`, clicar **Entrar**.
2. **Assertion**: sem a mensagem "Erro de conexão. Verifique se o servidor
   está rodando.". Retornar para `/` com o usuário autenticado.

### T4 — Pagamento Pix cria cobrança e confirma via botão (#6)
1. Na home logada, clicar **Agendar** no mesmo card.
2. **Assertion**: abre `#modalAgendamento` (o modal de login NÃO reaparece).
3. Preencher Dia = amanhã, Hora = 10:00, Valor = `60.00`, Método = **Pix**
   (default). Clicar **Confirmar e Pagar**.
4. **Assertion**: `#blocoPix #pixCobranca` fica visível exibindo QR Code +
   campo "copia e cola" e botão **Já paguei (simular confirmação)**.
   `#statusPagamento` mostra "Aguardando pagamento Pix...".
5. Clicar **Já paguei (simular confirmação)**.
6. **Assertion**: agendamento criado — modal fecha e notificação desktop
   "Agendamento Confirmado!" aparece com o logo "b" (o ícone correto pós #9).
   Se #9 estivesse quebrada, nenhuma notificação apareceria ou apareceria
   sem ícone.

### T5 — Regressão: reset do modal não deixa Pix antigo preso (#7)
1. Imediatamente após T4, clicar em **Agendar** de novo em qualquer card.
2. **Assertion**: o modal reabre com `#pixInicial` visível e `#pixCobranca`
   escondido (QR Code anterior removido). Se o bug da #7 estivesse presente,
   o QR Code e o botão "Já paguei" do pagamento anterior estariam visíveis.
3. Trocar método para **Cartão de Crédito** no select.
4. **Assertion**: `#blocoCartao` aparece, `#blocoPix` some.

### T6 — Pagamento com cartão aprovado (#6)
1. Ainda no modal, com método = Cartão, preencher:
   - Número: `4111 1111 1111 1111`
   - Nome no cartão: `JOAO SILVA`
   - Validade: `12/29`
   - CVV: `123`
   - Parcelas: 1x
2. Clicar **Confirmar e Pagar**.
3. **Assertion**: modal fecha, `#statusPagamento` informa aprovação, e nova
   notificação desktop "Agendamento Confirmado!" aparece.
4. **Assertion adversarial (cartão recusado — opcional se sobrar tempo)**:
   Refazer com número `4111 1111 1111 0000` → backend deve devolver HTTP 402
   e `#statusPagamento` mostrar mensagem vermelha de recusa; nenhum
   agendamento extra criado.

### T7 — Cadastro de empresa com mapa obrigatório (#5)
1. Navegar para `/cadastro-empresa.html`.
2. Preencher todos os campos exceto o mapa (não clicar nele).
3. Clicar **Cadastrar**.
4. **Assertion**: submit bloqueado — aparece o texto
   "Marque a localização da empresa no mapa antes de cadastrar." no status
   do mapa; inputs `latEmpresa` e `lngEmpresa` continuam vazios.
5. Clicar em um ponto qualquer do mapa.
6. **Assertion**: marcador aparece; `latEmpresa` e `lngEmpresa` passam a
   ter 6 casas decimais (`^-?\d{1,3}\.\d{6}$`).
7. Clicar **Cadastrar** de novo.
8. **Assertion**: redireciona para `/login.html` com sucesso.

### T8 — Marcador roxo da nova empresa aparece na home (#5)
1. Voltar para `/` (usuário logado).
2. Aguardar carregamento do mapa da home.
3. **Assertion**: o mapa exibe **um marcador roxo adicional** além dos
   marcadores seed. O popup da empresa recém-criada mostra o nome dela e
   texto "de você" na linha de distância.

---

## Regressões que NÃO precisam aparecer no vídeo
- Autorização GET `/api/pagamentos` empresa → já validada via curl no PR #7
  e difícil de demonstrar no vídeo de forma convincente.
- Prompt "não reabre após denied" (#8) → depende de estado prévio do Chrome.

## Out of scope
- Geolocalização real do navegador (o Chrome da VM retorna um ponto mock
  nos EUA → distância fica gigante; não invalida o teste).
- Envio de push real pelo VAPID (apenas notificação local é disparada).
