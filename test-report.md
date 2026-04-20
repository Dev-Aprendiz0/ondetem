# Test Report — PR #5

**PR:** https://github.com/Aprendiz-Jr/ondetem/pull/5
**Sessão Devin:** https://app.devin.ai/sessions/a8fef7bfc2ad4ab8b935a86499fe43f8
**Como testei:** E2E no navegador contra `node server.js` local, cadastrando uma nova empresa com seleção de ponto no mapa e verificando o marcador roxo + popup com distância na home.

**Gravação:** https://app.devin.ai/attachments/95b220a9-de0b-4010-adbb-5bafd6b1649e/rec-790527e9-f9a8-436d-ad4c-d9d89ff96fe6-edited.mp4

## Escalações
- Nenhuma. Todas as 7 assertions passaram.
- **Observação (não é bug):** o navegador do ambiente de teste retorna uma geolocalização mock nos EUA (~33° N, -117° W), por isso a distância exibida no popup foi **9713.6 km**. Com um usuário real em Saquarema/RJ o número será pequeno (m ou poucos km). O importante é que o formato "`<distância> de você`" e o cálculo via Haversine funcionam corretamente.
- **Cosmético:** o `/api/empresas/publicas` já tinha uma entrada pré-existente ("Salão Beleza Pura") de sessões anteriores. Isso não afeta este teste — a empresa **"Studio Teste Mapa"** criada agora aparece como segundo marcador roxo, confirmando que o fluxo novo funciona.

## Resultados por assertion

- **A1 — Submit bloqueado sem mapa:** **PASSED.** Ao clicar em "Cadastrar Empresa" antes de marcar o mapa, o formulário não submete, status fica vermelho com "Marque a localização da empresa no mapa antes de cadastrar." e a página rola até o mapa.
- **A2 — Click no mapa seta lat/lng (6 decimais):** **PASSED.** Clique preencheu lat/lng com 6 casas decimais; status verde "Localização marcada: -22.928271, -42.492199".
- **A3 — Arrastar marcador atualiza lat/lng:** **PASSED.** Após arrasto, valores mudaram para `-22.928150 / -42.497038`, status verde atualizado.
- **A4 — Cadastro com sucesso + redirect:** **PASSED.** Alerta verde "Empresa cadastrada com sucesso! Sua conta está em análise. Redirecionando..." e redirect automático para `/login.html`.
- **A5 — Persistência em `/api/empresas/publicas`:** **PASSED.** `curl` retornou:
  ```json
  { "nome": "Studio Teste Mapa", "lat": -22.92815, "lng": -42.497038, "categorias": ["Cabelo"], "servicos": [{"nome":"Corte","preco":50}], ... }
  ```
- **A6 — Mapa da home mostra marcador roxo:** **PASSED.** DOM do mapa continha 1 marcador azul (user) + 3 vermelhos (seed) + 2 roxos (incluindo Studio Teste Mapa).
- **A7 — Popup com nome, categoria e distância + "de você":** **PASSED.** Popup: `"Studio Teste Mapa" / "Cabelo" / "Rua das Palmeiras, 100 - Centro - Saquarema - RJ - 28990-000" / "(22) 99999-1234" / "9713.6 km de você"`.

## Evidências visuais

### A4 — Redirect após cadastro
![A4: alerta de sucesso](https://app.devin.ai/attachments/c172715f-ca19-495e-9e35-9cbe6545c21b/screenshot_dbe31a7e65784061903ea29fc9e22964.png)
![A4: redirect para /login.html](https://app.devin.ai/attachments/c9c003f3-8605-4fb8-882b-fbef8916c8fb/screenshot_311a533e821248cf95b1838679a39cf3.png)

### A7 — Popup com nome, categoria e distância
![A7: popup do marcador roxo](https://app.devin.ai/attachments/86ce5381-ac3e-4190-8ae7-4100eceb3a7b/screenshot_d1e2b2935c99417b801c16599692b26a.png)
