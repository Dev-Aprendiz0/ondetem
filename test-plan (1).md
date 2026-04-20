# Test Plan — PR #5: Localização no Mapa + Mapa na Home

**PR:** https://github.com/Aprendiz-Jr/ondetem/pull/5
**App local:** http://localhost:3000 (já rodando via `node server.js`)
**Escopo:** fluxo principal end-to-end que prova que o cadastro com localização funciona e que a empresa aparece no mapa público com distância.

## O que mudou (resumo em termos de UI)
1. Em `/cadastro-empresa` existe uma nova seção **"Localização no Mapa *"** com um mapa Leaflet; é obrigatório marcar um ponto antes de cadastrar. Antes deste PR não havia mapa nenhum nessa página.
2. Em `/` o mapa agora mostra, além dos 3 estabelecimentos seed vermelhos, **marcadores roxos** vindos de `GET /api/empresas/publicas`, cada um com um popup que inclui a **distância em km/m** até o usuário (Haversine).
3. `POST /api/empresas` passou a exigir `lat`/`lng` válidos; sem eles retorna **400 `"Informe a localização da empresa no mapa (latitude/longitude válidas)."`** (server.js:313-316).

## Flow primário (1 teste — end-to-end)

**Cadastrar uma nova empresa escolhendo o ponto no mapa e verificar que ela aparece como marcador roxo com distância no mapa da home.**

### Passos

1. Abrir `http://localhost:3000/cadastro-empresa`.
2. Preencher dados mínimos obrigatórios:
   - Dados da Empresa: nome `Studio Teste Mapa`, CNPJ `11.222.333/0001-44`, razão social `Studio Teste LTDA`.
   - Categorias: marcar **Cabelo**.
   - Serviços: nome `Corte`, preço `50`.
   - Contato: e-mail único `studio-teste-mapa-<timestamp>@ondetem.com`, telefone `(22) 99999-1234`.
   - Endereço: CEP `28990-000` (Saquarema-RJ) — aguardar o ViaCEP preencher rua/bairro/cidade/UF; número `100`.
   - Horários: deixar default.
   - Senha de Acesso: responsável `Devin Tester`, senha `123456`, confirmar `123456`.
   - Termos: marcar checkbox.
3. **Antes de marcar o mapa**, clicar em **"Cadastrar Empresa"**.
   - **Expected (assertion A1 — guardrail)**: o formulário **não** é submetido; o status logo abaixo do mapa fica vermelho com texto contendo **"Marque a localização da empresa no mapa antes de cadastrar."**; o campo Latitude fica em estado inválido (borda vermelha); nenhum `POST /api/empresas` é enviado (verificável via logs do servidor) e a página **não** navega para `/login`.
4. Clicar em um ponto específico dentro do mapa (ex.: próximo ao centro de Saquarema).
   - **Expected (assertion A2)**: um marcador é adicionado no ponto clicado; os campos Latitude e Longitude (somente leitura) ficam preenchidos com valores numéricos com **6 casas decimais** (regex `^-?\d{1,3}\.\d{6}$`) e **não** vazios; o status abaixo do mapa fica verde com prefixo **"Localização marcada: "** seguido dos mesmos valores.
5. Arrastar o marcador para outro ponto.
   - **Expected (assertion A3)**: Latitude/Longitude atualizam para valores **diferentes** dos observados em A2; status continua verde com os novos valores.
6. Clicar em **"Cadastrar Empresa"**.
   - **Expected (assertion A4)**: alerta verde de sucesso contendo **"Empresa cadastrada com sucesso!"**; em até ~3s a página redireciona para `/login`.
7. Em uma nova aba, abrir `http://localhost:3000/api/empresas/publicas`.
   - **Expected (assertion A5)**: o JSON `empresas[]` contém um item com `nome: "Studio Teste Mapa"`, `lat` e `lng` iguais (±0.000001) aos exibidos no formulário em A3, e `categorias` contendo `"Cabelo"`. Sem este passo o teste não distingue um cadastro de verdade de um bug em que os dados não são persistidos.
8. Abrir `http://localhost:3000/` (permitir geolocalização se o navegador perguntar).
   - **Expected (assertion A6)**: o mapa renderiza e contém:
     - 1 marcador azul "Você está aqui!" (ou, se geolocalização negar, o mapa fica centralizado em Saquarema),
     - marcadores vermelhos dos 3 estabelecimentos seed,
     - um marcador **roxo** (`marker-icon-2x-violet.png`) na posição cadastrada em A3.
9. Clicar no marcador roxo da empresa recém-cadastrada.
   - **Expected (assertion A7)**: o popup contém **"Studio Teste Mapa"** e `"Cabelo"`; se geolocalização foi concedida em A6, também contém a string **" de você"** prefixada por um valor de distância (`\d+ m` ou `\d+\.\d km`). Se geolocalização foi negada, a string **" de você"** **não** aparece (o que também é correto — é o caminho documentado).

### Por que esse teste é adversarial
- **A1** falharia se a validação de `lat/lng` no client (cadastro-empresa.html:945-958) ou no server (server.js:309-316) estivesse quebrada — um PR broken permitiria cadastro sem mapa.
- **A2/A3** falhariam se o handler de click/dragend não estivesse escrevendo nos inputs (cadastro-empresa.html:783-810).
- **A4** falharia se o POST não aceitasse os novos campos (server.js:297-353).
- **A5** falharia se lat/lng não fossem realmente persistidos ou se `/api/empresas/publicas` não os expusesse (server.js:271-295).
- **A6/A7** falhariam se `carregarEmpresasCadastradas` (script.js:496-544) ou o cálculo Haversine (script.js:480-494) estivesse quebrado. Note que o mesmo teste em um PR quebrado produziria evidência visualmente diferente: ausência do marcador roxo, popup sem nome correto, ou ausência da distância.

## Fora de escopo para execução
- Botão "Usar minha localização" (requer permissão do SO, não determinístico no headless VM).
- Botão "Buscar pelo endereço preenchido" (depende do Nominatim público, com rate limit — ruim para teste adversarial).
- Fluxo admin. Página do painel da empresa.
- Regressão no bug #2 (agendar com login) — já coberto pelo PR #3.
