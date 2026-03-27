# Onde Tem?

Aplicacao web de vitrine e agendamento de servicos esteticos, com foco em experiencia mobile e suporte inicial a PWA (Progressive Web App).

## Visao Geral

O projeto apresenta:
- Pagina inicial com busca, categorias e cards de saloes/clinicas
- Layout responsivo para desktop e mobile
- Manifesto PWA para instalacao no dispositivo
- Service Worker com cache de arquivos estaticos

## Tecnologias

- HTML5
- CSS3
- JavaScript (vanilla)
- Bootstrap 5 (CDN)
- Bootstrap Icons (CDN)

## Estrutura do Projeto

- index.html: estrutura da interface
- style.css: estilos personalizados
- script.js: registro do Service Worker
- service-worker.js: cache e estrategia offline basica
- manifest.json: metadados do PWA
- teste.txt: arquivo auxiliar

## Como Executar

Como o projeto usa Service Worker, evite abrir apenas com duplo clique no arquivo HTML. Rode via servidor local.

### Opcao 1: VS Code Live Server
1. Instale a extensao Live Server no VS Code
2. Abra o projeto no VS Code
3. Clique em "Go Live"

### Opcao 2: Python
No terminal, dentro da pasta do projeto:

```bash
python -m http.server 5500
```

Depois acesse no navegador:

```
http://localhost:5500
```

## PWA

O projeto ja inclui:
- manifest.json
- Registro do Service Worker em script.js
- Cache inicial em service-worker.js

Para experiencia completa de instalacao, adicione os icones abaixo na raiz do projeto:
- icon-192.png
- icon-512.png

## Observacoes

- O Service Worker esta sendo registrado com caminho absoluto (/service-worker.js).
- Se o site for publicado em subpasta, pode ser necessario ajustar para caminho relativo.

## Proximos Passos Sugeridos

- Integrar busca real por localizacao e categoria
- Conectar os botoes "Agendar" a fluxo de reserva
- Adicionar fallback offline mais robusto (pagina offline e atualizacao de cache)
- Incluir testes basicos de interface e comportamento
