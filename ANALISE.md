# Análise Técnica do Projeto "Onde Tem?"

O projeto é uma aplicação web (PWA) voltada para o agendamento de serviços estéticos, utilizando tecnologias web padrão (HTML, CSS, JS) e o framework Bootstrap.

## Estrutura Atual
- **Frontend**: HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons.
- **Interatividade**: JavaScript Vanilla para busca, manipulação de modal e integração com API fake (JSONPlaceholder).
- **Funcionalidades**:
    - Busca de serviços.
    - Categorização.
    - Listagem de estabelecimentos (cards).
    - Agendamento via modal com simulação de pagamento.
    - Integração com Mapas (Leaflet).
    - Suporte a PWA (Service Worker e Manifest).

## Pontos de Melhoria Identificados

### 1. Organização do Código
- O JavaScript do mapa está embutido no HTML. Deve ser movido para o `script.js` ou um arquivo específico para melhor manutenção.
- Estilos inline e scripts no final do `index.html` podem ser otimizados.

### 2. UI/UX (Experiência do Usuário)
- **Responsividade**: Melhorar o comportamento do mapa em telas pequenas.
- **Feedback Visual**: Adicionar animações de transição entre seções e estados de carregamento mais polidos.
- **Filtros por Categoria**: Atualmente, clicar nas categorias não filtra os cards.

### 3. Funcionalidades
- **Filtro de Categorias**: Implementar a funcionalidade real de filtrar os cards ao clicar no ícone da categoria.
- **Persistência Local**: Usar `localStorage` para salvar agendamentos realizados, permitindo que o usuário os veja na aba "Agendamentos" do mobile.
- **Melhoria no Mapa**: Adicionar marcadores para os estabelecimentos listados nos cards, não apenas a localização do usuário.

### 4. Performance e PWA
- Otimizar o `service-worker.js` para cache de recursos externos (Bootstrap, Leaflet).
- Garantir que as imagens tenham tamanhos adequados.

---

## Plano de Ação para Otimização

1. **Refatoração**: Mover o script do Leaflet para o `script.js`.
2. **Interatividade**: Implementar o filtro por categorias.
3. **Novas Funcionalidades**:
    - Adicionar marcadores dos estabelecimentos no mapa.
    - Implementar a visualização de "Meus Agendamentos" usando LocalStorage.
4. **Polimento**: Adicionar transições CSS e melhorar o feedback do formulário.
