# Sistema de Design para Agendar 2.0 (PWA) — Versão Profissional e Enterprise

---

## 1. Objetivo

Este documento estabelece um **Design System operacional e rigoroso** para o Agendar 2.0, um aplicativo web progressivo (PWA) focado na gestão de salões de beleza. O sistema é projetado para ser **pronto para produção real**, **escalável para um produto SaaS multi-tenant** e **otimizado para geração por Inteligência Artificial (IA)**. A aderência estrita a este Design System é **obrigatória** para garantir consistência visual, funcionalidade, performance e uma experiência de usuário otimizada, facilitando o desenvolvimento em React e a integração com ferramentas de IA.

---

## 2. Design Tokens (BASE DO SISTEMA)

Os Design Tokens são a base fundamental deste sistema, encapsulando todas as decisões de design em variáveis nomeadas. Eles garantem a consistência e facilitam a manutenção e a escalabilidade do design em diferentes plataformas e temas. Para um sistema robusto de nível Enterprise, separamos os tokens em **Primitivos** (valores brutos) e **Semânticos** (uso contextual).

### 2.1 Tokens Primitivos — Cores

Estes são os valores brutos da paleta de cores, organizados em escalas para flexibilidade.

```css
:root {
  /* Primary Scale */
  --primary-50: #FFF1F3;
  --primary-100: #FFE4E8;
  --primary-200: #FBCDD5;
  --primary-300: #F7B5C1;
  --primary-400: #EFA3B0;
  --primary-500: #CF97A0;
  --primary-600: #B87F89;
  --primary-700: #9E676F;
  --primary-800: #7E4F55;
  --primary-900: #5F3A3F;

  /* Neutral Scale */
  --neutral-50: #F5F0EE;
  --neutral-100: #ECECEC;
  --neutral-500: #5A5E61;
  --neutral-900: #2A2320;

  /* Status Colors */
  --status-success: #A8C8A0;
  --status-warning: #F0C080;
  --status-error: #EF5350;

  /* Opacity */
  --opacity-white-80: rgba(255,255,255,0.8);
  --opacity-white-60: rgba(255,255,255,0.6);
  --opacity-black-40: rgba(0,0,0,0.4);
}
```

### 2.2 Tokens Semânticos — Cores

Estes tokens definem o uso contextual das cores primitivas, desacoplando a UI dos valores hexadecimais diretos. Essencial para temas (como Dark Mode) e escalabilidade SaaS. **É obrigatório usar estes tokens no código de UI.**

```css
:root {
  /* Backgrounds */
  --color-bg-default: var(--neutral-50);
  --color-surface: #FFFFFF; /* Fundo de cards, modais */
  --color-overlay: var(--opacity-black-40);

  /* Text */
  --color-text-primary: var(--neutral-900);
  --color-text-secondary: var(--neutral-500);
  --color-text-muted: #888888;
  --color-text-on-primary: #FFFFFF;

  /* Borders & Dividers */
  --color-border-default: var(--neutral-100);
  --color-border-input-focus: var(--primary-500);

  /* Primary Actions */
  --color-primary-action: var(--primary-500);
  --color-primary-action-hover: var(--primary-600);
  --color-primary-action-active: var(--primary-700);

  /* Status */
  --color-status-success: var(--status-success);
  --color-status-warning: var(--status-warning);
  --color-status-error: var(--status-error);

  /* Feedback Visual States */
  --feedback-success-bg: rgba(168, 200, 160, 0.2);
  --feedback-error-bg: rgba(239, 83, 80, 0.15);
  --feedback-warning-bg: rgba(240, 192, 128, 0.2);
}

/* Dark Mode System */
[data-theme="dark"] {
  --color-bg-default: var(--neutral-900);
  --color-surface: #332B28; /* Melhor contraste e separação visual no dark mode */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: var(--neutral-100);
  --color-text-muted: var(--neutral-500);
  --color-border-default: #3A3230;
  --color-border-input-focus: var(--primary-400);
  --color-primary-action: var(--primary-400); /* Ajuste para contraste no dark mode */
  --color-primary-action-hover: var(--primary-300);
  --color-primary-action-active: var(--primary-200);
}
```

### 2.3 Tokens de Tema (Multi-tenant SaaS) - Expandido

Estes tokens permitem que o branding do aplicativo seja sobrescrito por cada tenant (salão), essencial para um modelo SaaS multi-tenant e white-label. **Nenhuma cor de marca deve ser fixa no sistema.**

```css
:root {
  --tenant-primary: var(--primary-500);
  --tenant-primary-hover: var(--primary-600);
  --tenant-secondary: var(--neutral-500);
  --tenant-background: var(--neutral-50);
  --tenant-surface: #FFFFFF;
  --tenant-text-primary: var(--neutral-900);
  --tenant-border: var(--neutral-100);
  --tenant-logo-url: 
  --tenant-font-family: var(--font-family-base); /* Opcional */
}
```

### 2.4 Tokens Primitivos — Tipografia

Define os tamanhos de fonte, pesos e a família de fonte base.

```css
:root {
  --font-size-title: 20px;
  --font-size-subtitle: 16px;
  --font-size-body: 15px;
  --font-size-small: 13px;
  --font-size-micro: 12px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  --font-family-base: 'Inter', sans-serif;
}
```

### 2.5 Tokens Semânticos — Tipografia

Combina tokens primitivos de tipografia para uso direto em estilos de texto, evitando repetição no código de UI.

```css
:root {
  --text-title: var(--font-weight-bold) var(--font-size-title) var(--font-family-base);
  --text-subtitle: var(--font-weight-medium) var(--font-size-subtitle) var(--font-family-base);
  --text-body: var(--font-weight-regular) var(--font-size-body) var(--font-family-base);
  --text-small: var(--font-weight-regular) var(--font-size-small) var(--font-family-base);
  --text-micro: var(--font-weight-regular) var(--font-size-micro) var(--font-family-base);
}
```

### 2.6 Tokens Primitivos — Espaçamento

Escala modular de espaçamentos, definida em múltiplos de 4px.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
}
```

### 2.7 Tokens Primitivos — Border Radius

Definições de raio de borda para elementos visuais.

```css
:root {
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-pill: 999px;
}
```

### 2.8 Tokens Primitivos — Shadows

Definições de sombra para criar profundidade.

```css
:root {
  --shadow-soft: 0px 4px 20px rgba(0,0,0,0.08);
}
```

### 2.9 Tokens Primitivos — Estados Globais

Estados interativos para componentes, incluindo um token para transições e opacidade de loading global.

```css
:root {
  --state-hover-filter: brightness(0.95);
  --state-active-filter: brightness(0.9);
  --state-disabled-opacity: 0.5;
  --state-focus-ring: 0 0 0 2px var(--primary-300);
  --state-loading-cursor: progress;
  --state-loading-opacity: 0.7; /* Opacidade para telas em estado de loading global */
  --state-transition: all var(--transition-fast) var(--ease-out); /* Transição obrigatória para interatividade */
}
```

### 2.10 Tokens Primitivos — Motion

Definições de transição e funções de easing para animações fluidas.

```css
:root {
  --transition-fast: 0.15s;
  --transition-default: 0.25s;
  --ease-default: ease-in-out;
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

### 2.11 Tokens Primitivos — Breakpoints

Pontos de interrupção para responsividade, essenciais para layouts adaptativos.

```css
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### 2.12 Tokens Primitivos — Z-Index

Hierarquia de camadas para elementos sobrepostos, crucial para evitar bugs visuais em cenários complexos.

```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sidebar: 800; /* Para sidebar em desktop */
  --z-fixed-header: 900; /* Para cabeçalhos fixos */
  --z-modal: 1000;
  --z-toast: 1100;
  --z-tooltip: 1200;
}
```

### 2.13 Tokens Primitivos — Layout

Definições de layout globais, incluindo largura máxima do container e padding padrão.

```css
:root {
  --container-max-width: 1200px;
  --container-padding: var(--space-4); /* Padding lateral padrão para layouts */
}
```

### 2.14 Tokens Primitivos — Densidade

Tokens para controle de densidade da interface, permitindo modos compacto, padrão e confortável.

```css
:root {
  --density-compact: 0.8;
  --density-default: 1;
  --density-comfortable: 1.2;
}
```

---

## 3. Tipografia

A tipografia é essencial para a hierarquia visual e legibilidade. As definições de fonte e peso devem ser aplicadas consistentemente, utilizando a fonte 'Inter' como padrão. **É obrigatório usar os tokens semânticos de tipografia.**

*   **Família de Fonte:** `var(--font-family-base)` (Ex: 'Inter', sans-serif).
*   **Estilos de Texto Semânticos:**
    *   `--text-title`: `var(--font-weight-bold) var(--font-size-title) var(--font-family-base)`
    *   `--text-subtitle`: `var(--font-weight-medium) var(--font-size-subtitle) var(--font-family-base)`
    *   `--text-body`: `var(--font-weight-regular) var(--font-size-body) var(--font-family-base)`
    *   `--text-small`: `var(--font-weight-regular) var(--font-size-small) var(--font-family-base)`
    *   `--text-micro`: `var(--font-weight-regular) var(--font-size-micro) var(--font-family-base)`

---

## 4. Espaçamento

O sistema de espaçamento é baseado em uma escala modular, garantindo layouts equilibrados e responsivos. Os tokens são definidos em múltiplos de 4px.

*   `--space-1`: 4px
*   `--space-2`: 8px
*   `--space-3`: 12px
*   `--space-4`: 16px
*   `--space-5`: 24px
*   `--space-6`: 32px

**Padrões de Uso:**
*   **Inputs:** Padding de `var(--space-3)` (12px).
*   **Cards:** Padding de `var(--space-6)` (32px).
*   **Listas:** Espaçamento entre itens de `var(--space-2)` (8px) a `var(--space-3)` (12px).
*   **Elementos Internos:** Espaçamento de `var(--space-1)` (4px) a `var(--space-2)` (8px).
*   **Aplicação de Densidade:** Espaçamentos e altura de componentes devem escalar com `var(--density-compact)`, `var(--density-default)` ou `var(--density-comfortable)`. Exemplo: `height = base_height * var(--density-default)`.

---

## 5. Border Radius

O uso consistente de `border-radius` contribui para a estética Soft UI e a identidade visual do aplicativo.

*   `--radius-sm`: 8px
*   `--radius-md`: 10px;
*   `--radius-lg`: 12px;
*   `--radius-xl`: 20px;
*   `--radius-pill`: 999px; /* Para elementos em formato de pílula, como tags */

**Padrões de Uso:**
*   **Inputs:** `var(--radius-lg)` (12px).
*   **Cards:** `var(--radius-xl)` (20px).
*   **Tags:** `var(--radius-pill)` (999px).

---

## 6. Shadows

As sombras são utilizadas para criar profundidade e hierarquia visual, alinhadas com o conceito de Soft UI.

*   `--shadow-soft`: `0px 4px 20px rgba(0,0,0,0.08)`

**Uso:** Aplicada em Cards e seleções ativas para indicar elevação ou foco.

---

## 7. Estados Globais (CRÍTICO)

Todos os componentes interativos devem suportar e implementar os seguintes estados globais para garantir feedback visual consistente e acessibilidade. **TODO componente interativo deve ter transição.**

*   **Hover:** Aplica `filter: var(--state-hover-filter)` e `transition: var(--state-transition)`.
*   **Active:** Aplica `filter: var(--state-active-filter)` e `transition: var(--state-transition)`.
*   **Disabled:** Aplica `opacity: var(--state-disabled-opacity)`.
*   **Focus:** Aplica `box-shadow: var(--state-focus-ring)`.
*   **Loading:** Aplica `cursor: var(--state-loading-cursor)`.

**Comportamento de Loading por Tipo:**
*   **Page Loading:** Utilizar *skeleton loading* completo para a tela inteira.
*   **Section Loading:** Utilizar *skeleton loading* parcial para a seção específica.
*   **Action Loading:** Exibir um spinner de carregamento no botão ou elemento de ação e desabilitá-lo.
*   **Conteúdo:** Utilizar *skeleton loading* para indicar que o conteúdo está sendo carregado, mantendo a estrutura do layout.
*   **Telas:** Telas devem suportar loading global (overlay ou skeleton) com `opacity: var(--state-loading-opacity)`.

---

## 8. Componentes

Os componentes padrão são blocos de construção reutilizáveis, com especificações detalhadas para garantir consistência e eficiência no desenvolvimento.

### 8.1 Botão Principal

O botão principal é utilizado para as ações mais importantes e deve ter destaque visual.

| Propriedade CSS | Valor                                |
| :-------------- | :----------------------------------- |
| `height`        | 48px                                 |
| `background`    | `var(--color-primary-action)`        |
| `color`         | `var(--color-text-on-primary)`       |
| `border-radius` | `var(--radius-lg)`                   |
| `font-size`     | `var(--text-body)`                   |
| `padding`       | `0 var(--space-4)`                   |
| `display`       | `inline-flex`                        |
| `align-items`   | `center`                             |
| `justify-content` | `center`                           |
| `gap`           | `var(--space-2)`                     |

**Estados:**
*   **Hover:** `background: var(--color-primary-action-hover)` e `transition: var(--state-transition)`.
*   **Active:** `background: var(--color-primary-action-active)` e `transition: var(--state-transition)`.
*   **Disabled:** `opacity: var(--state-disabled-opacity)`.
*   **Focus:** `box-shadow: var(--state-focus-ring)`.
*   **Loading:** `cursor: var(--state-loading-cursor)`, exibe spinner e desabilita o botão. Aplica a classe `.button--loading`.

**Características:** Sem sombra, design `flat`.

**Variantes de Botão:**
*   **Primary:** (Padrão, conforme acima)
*   **Secondary:** `background: transparent`, `color: var(--color-primary-action)`, `border: 1px solid var(--color-primary-action)`.
*   **Ghost:** `background: transparent`, `color: var(--color-text-secondary)`.
*   **Danger:** `background: var(--color-status-error)`, `color: var(--color-text-on-primary)`.

### 8.2 Input (TextField)

Campos de entrada de texto para coleta de informações do usuário. **`caret-color` deve ser `var(--color-primary-action)` para acessibilidade.**

| Propriedade CSS | Valor                                        |
| :-------------- | :------------------------------------------- |
| `border`        | `1px solid var(--color-border-default)`      |
| `border-radius` | `var(--radius-lg)`                           |
| `padding`       | `var(--space-3)`                             |
| `font-size`     | `var(--text-body)`                           |
| `caret-color`   | `var(--color-primary-action)`                |

**Estados:**
*   **Focus:** `border-color: var(--color-border-input-focus)` e `box-shadow: var(--state-focus-ring)`.
*   **Loading:** Bloqueia o input e, opcionalmente, exibe um indicador de carregamento.

**Características:** Sem `outline` pesado.

### 8.3 Card

Contêiner para agrupar informações relacionadas, com um efeito de sombra suave.

| Propriedade CSS | Valor                                        |
| :-------------- | :------------------------------------------- |
| `padding`       | `var(--space-6)`                             |
| `border-radius` | `var(--radius-xl)`                           |
| `background`    | `var(--color-surface)`                       |
| `box-shadow`    | `var(--shadow-soft)`                         |

### 8.4 Tag de Status

Utilizada para exibir o status de um item, com cor dinâmica para fácil identificação.

| Propriedade CSS | Valor                                |
| :-------------- | :----------------------------------- |
| `padding`       | `var(--space-1) var(--space-3)`      |
| `border-radius` | `var(--radius-pill)`                 |
| `font-size`     | `var(--text-micro)`                  |
| `font-weight`   | `var(--font-weight-medium)`          |

**Características:** Cor dinâmica por status (mapear para `var(--color-status-success)`, `var(--color-status-warning)`, `var(--color-status-error)` ou variações da escala primária), sempre com contraste correto.

### 8.5 Toast / Snackbar

Componente de feedback não intrusivo para mensagens temporárias.

*   **Posição:** Topo ou bottom center da tela.
*   **Duração:** 3 segundos (padrão).
*   **Z-Index:** `var(--z-toast)`.
*   **Estilo:** Fundo sutil, texto claro, ícone opcional de status. Deve usar `aria-live` para acessibilidade.

### 8.6 Modal

Componente de diálogo que sobrepõe o conteúdo principal.

*   **Overlay:** `background: var(--color-overlay)`.
*   **Posicionamento:** Centralizado na tela.
*   **Largura Máxima:** `max-width: 480px`.
*   **Padding Interno:** `var(--space-6)`.
*   **Z-Index:** `var(--z-modal)`.
*   **Motion:** Animação de `scale` e `fade` combinadas, utilizando `var(--transition-default)` e `var(--ease-out)`.
*   **Foco:** Modais devem prender o foco (`focus trap`) para acessibilidade.
*   **Fechamento:** A tecla `ESC` deve fechar o modal.

### 8.7 Listas

Componente fundamental para exibição de coleções de itens, como agendamentos ou clientes.

*   **Altura do Item:** 56px (padrão).
*   **Hover Highlight:** Feedback visual ao passar o mouse sobre o item (ex: `background-color: var(--neutral-50)`).
*   **Divider:** Divisor de 1px com `var(--color-border-default)` entre os itens.

### 8.8 Feedback Visual States

Definições de cores de fundo para estados de feedback visual, utilizados em alerts, validação de formulários e estados de sistema.

```css
:root {
  --feedback-success-bg: rgba(168, 200, 160, 0.2);
  --feedback-error-bg: rgba(239, 83, 80, 0.15);
  --feedback-warning-bg: rgba(240, 192, 128, 0.2);
}
```

### 8.9 Empty States

Todas as listas e seções que podem estar vazias devem possuir um estado vazio (`Empty State`) bem definido para guiar o usuário.

*   **Conteúdo:** Deve conter um ícone relevante, uma mensagem clara explicando a ausência de dados e uma Call-to-Action (CTA) para iniciar uma ação (ex: "Criar primeiro agendamento").
*   **Uso:** Toda lista ou seção de dados que possa estar vazia deve implementar um Empty State claro e útil.

### 8.10 Sistema de Feedback Assíncrono

Todas as ações assíncronas (requisições a API, operações demoradas) devem fornecer feedback visual ao usuário.

*   **Loading Visual:** Exibir um indicador de carregamento (spinner, skeleton) durante a execução da ação.
*   **Sucesso:** Exibir um Toast de sucesso após a conclusão bem-sucedida da ação.
*   **Erro:** Exibir um Toast de erro ou mensagem de erro inline (se aplicável ao contexto) em caso de falha.

### 8.11 Tabelas

Para a gestão de dados, as tabelas são componentes críticos e devem suportar funcionalidades avançadas.

*   **Ordenação:** Suporte a ordenação de colunas.
*   **Filtros:** Suporte a filtros por coluna ou global.
*   **Paginação:** Suporte a paginação para grandes volumes de dados.
*   **Seleção de Linha:** Suporte a seleção de linha (simples ou múltipla).

### 8.12 Sistema de Variantes

Componentes devem suportar variantes para flexibilidade e reutilização, implementados via `class-variance-authority (CVA)` ou equivalente.

*   **Propriedades:**
    *   `variant`: (ex: `primary`, `secondary`, `ghost`, `danger`)
    *   `size`: (ex: `sm`, `md`, `lg`)
    *   `state`: (ex: `loading`, `disabled`)

---

## 9. Sistema de Grid (RESPONSIVO)

O sistema de grid garante que o layout se adapte de forma responsiva a diferentes tamanhos de tela, mantendo a consistência e a organização. A transição entre o número de colunas deve ocorrer nos breakpoints definidos.

| Dispositivo | Colunas | Breakpoint (min-width) |
| :---------- | :------ | :--------------------- |
| Mobile      | 4       | N/A                    |
| Tablet      | 8       | `var(--breakpoint-sm)` (480px) |
| Desktop     | 12      | `var(--breakpoint-lg)` (1024px) |

**Gutter:** `var(--space-4)` (16px) de espaçamento entre as colunas.

### 9.1 Layout System

Para layouts complexos e consistentes, os seguintes padrões devem ser seguidos:

*   **Header Fixo:** O cabeçalho deve permanecer fixo no topo da tela, com `z-index: var(--z-fixed-header)`.
*   **Sidebar (Desktop):** Implementação de uma barra lateral para navegação em telas maiores, com `z-index: var(--z-sidebar)`.
*   **Bottom Navigation (Mobile):** Barra de navegação inferior para dispositivos móveis.
*   **Container Padding:** Todo layout deve respeitar o padding lateral padrão de `var(--container-padding)`.

### 9.2 Responsividade (Edge Cases)

Além dos breakpoints, os componentes devem adaptar seu comportamento em cenários específicos:

*   **Mobile:** Componentes devem ocupar a largura total (`full width`).
*   **Desktop:** Componentes devem respeitar o `max-width` do container.
*   **Modais em Mobile:** Modais devem se transformar em telas `full screen` para melhor usabilidade.

---

## 10. Agenda (ESPECIFICAÇÃO TÉCNICA - ENGINE)

A tela de agenda é o coração do aplicativo e possui especificações técnicas detalhadas para sua funcionalidade e visualização, definindo seu comportamento em nível de engine. **A virtualização é obrigatória para performance.**

### Regras:
*   **Escala Vertical:** 1 minuto = 2px de altura.
*   **Bloco Mínimo:** Um agendamento deve ter um bloco mínimo de 30 minutos.
*   **Largura Mínima por Evento:** 120px para garantir a legibilidade e interatividade.
*   **Gap entre Eventos:** 4px de espaçamento horizontal entre eventos adjacentes.
*   **Snapping:** Os eventos devem se alinhar a intervalos de 5 minutos ao serem movidos ou redimensionados.
*   **Sobreposição:** Em caso de sobreposição de agendamentos, a largura das colunas deve ser dividida automaticamente.
*   **Algoritmo de Layout de Eventos:**
    *   Detectar clusters de sobreposição.
    *   Calcular colunas por grupo.
    *   Aplicar largura proporcional.
    *   Garantir um mínimo de 120px de largura por evento.
    *   Permitir overflow com scroll horizontal se necessário para eventos muito densos.
*   **Scroll:** Scroll infinito vertical para visualização contínua de agendamentos.
*   **Drag and Drop:** Funcionalidade de arrastar e soltar eventos na agenda é obrigatória.
*   **Resize Vertical:** Redimensionamento vertical de eventos é permitido para ajustar a duração.
*   **Virtualização:** Obrigatória para performance (ex: `react-virtual`).
*   **Eventos Visíveis:** Máximo recomendado de 200 eventos visíveis simultaneamente.
*   **Re-render:** Controlado por memoização para otimização.
*   **Timezone:** Suporte obrigatório a múltiplos fusos horários (multi-região).
*   **Timestamps:** Eventos devem usar timestamps UTC internamente.
*   **Renderização:** Baseada em horário local do usuário.
*   **Bloqueios de Horário:** Deve suportar bloqueios de horário (ex: almoço, folga) com indisponibilidade visual clara.
*   **Limites de Eventos:** Eventos não podem ultrapassar os limites do dia.
*   **Validação de Conflito:** Validação de conflito de agendamentos é obrigatória.

### UX da Agenda:
*   **Scroll Sincronizado:** O scroll vertical deve sincronizar o horário e as colunas de eventos.
*   **Linha de "Hora Atual":** Uma linha visual deve indicar a hora atual na agenda.
*   **Auto-scroll:** Ao abrir a agenda, deve haver um auto-scroll para o horário atual.

### Estrutura:

```txt
| Horário | Colunas dinâmicas |
```

---

## 11. Ícones

Os ícones são elementos visuais importantes para a navegação e a compreensão rápida das ações. A biblioteca e os padrões de uso são definidos para manter a consistência e o peso visual.

*   **Biblioteca Base:** Lucide ou Heroicons (SVG) - **Nunca usar icon font ou CDN de ícones.**
*   **Importação:** Importação individual (tree-shaking obrigatório).
*   **Estilo:** SVG inline, controlados por props (size, color).
*   **Tamanhos Padrão:** 16px, 20px, 24px.
*   **Cores Padrão:** `var(--color-text-secondary)` ou `var(--color-primary-action)`.
*   **Peso Visual:** Consistente em todos os ícones para evitar disparidades visuais.
*   **Alinhamento:** Centralizado em um grid de 24x24px para uniformidade.

---

## 12. Motion

As transições e animações contribuem para uma experiência de usuário fluida e responsiva, com definições mais precisas para diferentes tipos de interação.

*   **Transições:**
    *   `--transition-fast`: 0.15s
    *   `--transition-default`: 0.25s
*   **Easing Functions:**
    *   `--ease-default`: `ease-in-out`
    *   `--ease-out`: `cubic-bezier(0.4, 0, 0.2, 1)`
    *   `--ease-in`: `cubic-bezier(0.4, 0, 1, 1)`

**Uso e Comportamento:**
*   **Hover:** Transições de `var(--transition-fast)` com `var(--ease-out)` para feedback imediato e suave.
*   **Abertura de Modal:** Animação de `scale` e `fade` combinadas, utilizando `var(--transition-default)` e `var(--ease-out)` para uma entrada e saída elegantes.
*   **Drag:** Sem delay, para uma resposta instantânea ao arrastar elementos.
*   **Feedback:** Animações para feedback de ações do usuário devem ser rápidas e claras.
*   **Listas Grandes:** Evitar animações em listas com grande número de itens para garantir performance.

### 12.1 Definição de Scroll

Para uma experiência de rolagem otimizada:

*   `scroll-behavior: smooth;` para rolagem suave.
*   **Scrollbar:** Discreta, com estilo customizado para não interferir na UI.
*   **Mobile:** `momentum scroll` para rolagem natural em dispositivos móveis.

---

## 13. Acessibilidade

A acessibilidade é um pilar fundamental deste Design System, garantindo que o PWA seja utilizável por todos os usuários, independentemente de suas habilidades ou deficiências. As diretrizes do WCAG (Web Content Accessibility Guidelines) devem ser rigorosamente seguidas [1].

*   **Área de Toque:** Mínimo de 48px para todas as áreas de toque interativas.
*   **Contraste:** Nível de contraste AA para texto e elementos interativos.
*   **Foco Visível:** Foco visível obrigatório para todos os elementos interativos, utilizando `box-shadow: var(--state-focus-ring)`.
*   **HTML Semântico:** Utilizar tags HTML de forma semântica para estruturar o conteúdo [2].
*   **Atributos ARIA:** Empregar atributos ARIA para fornecer informações adicionais sobre a função e o estado dos elementos [2].
*   **Navegação por Teclado:** Suporte obrigatório a navegação completa por teclado.
*   **ARIA-Live:** Utilizar `aria-live` para toasts e outras atualizações dinâmicas de conteúdo.
*   **`prefers-reduced-motion`:** Respeitar a preferência do usuário por movimento reduzido.
*   **Labels para Inputs:** Todos os inputs devem ter um `label` associado (`for`/`id`) para acessibilidade.

---

## 14. Estrutura PWA, Performance e Segurança

A arquitetura e as tecnologias sugeridas para o desenvolvimento do PWA são cruciais para garantir sua performance, escalabilidade e manutenibilidade. As diretrizes de performance e segurança são essenciais para um PWA de nível real e Enterprise.

**Stack Sugerida:**
*   **Frontend Framework:** React + Vite para um desenvolvimento rápido e eficiente.
*   **Estilização:** Tailwind CSS para uma estilização consistente e modular.
*   **Gerenciamento de Estado:** Zustand para um gerenciamento de estado robusto e escalável.
*   **PWA Manifest:** Implementação de um `manifest.json` para as funcionalidades de PWA (instalação na tela inicial, offline, etc.).

### 14.1 Controle de Acesso (RBAC) e RBAC na Interface

O sistema deve suportar um modelo de controle de acesso baseado em funções (Role-Based Access Control - RBAC) para gerenciar permissões de usuário de forma granular.

*   **Níveis de Acesso:**
    *   `admin`: Acesso total a todas as funcionalidades e configurações.
    *   `manager`: Acesso a funcionalidades de gestão (ex: agenda, clientes, relatórios).
    *   `staff`: Acesso limitado a funcionalidades operacionais (ex: visualizar agenda, marcar/desmarcar serviços).
*   **Componentes:** Componentes da UI devem respeitar as permissões do usuário, suportando:
    *   `hidden` (não renderiza o componente).
    *   `disabled` (renderiza o componente, mas sem ação).
*   **Validação Backend:** Nunca confiar apenas no frontend; o backend deve validar todas as permissões.

### 14.2 Segurança

Diretrizes de segurança são mandatórias para proteger o aplicativo e os dados do usuário.

*   **Sanitização de Inputs:** Obrigatória para todos os dados de entrada do usuário para prevenir ataques de injeção.
*   **Proteção contra XSS:** Implementar medidas de proteção contra Cross-Site Scripting.
*   **Tokens Sensíveis:** Tokens de autenticação e outras informações sensíveis nunca devem ser expostos no frontend.

### 14.3 Diretrizes de Performance

*   **Lazy Loading:** Obrigatório para imagens, componentes e módulos que não são críticos para o carregamento inicial.
*   **Skeleton Loading:** Utilizar *skeleton loading* antes da exibição de dados para melhorar a percepção de performance.
*   **Cache Offline:** Implementar cache robusto via Service Workers para a agenda básica e outros dados essenciais, permitindo funcionalidade offline.
*   **Code Splitting:** Obrigatório por rota para otimizar o carregamento de recursos.
*   **Prefetch:** Realizar prefetch de rotas principais para acelerar a navegação.
*   **Limite de Bundle Inicial:** O bundle inicial deve ser menor que 200kb (gzip).
*   **Debounce:** Obrigatório em inputs de busca para reduzir chamadas desnecessárias à API.
*   **Throttle:** Obrigatório para eventos de `drag` na agenda para otimizar a performance.

### 14.4 Sistema de Erros Global

Para garantir a robustez da aplicação em produção, um sistema de tratamento de erros global é mandatório.

*   **Error Boundary:** Deve existir um Error Boundary global (React) para capturar erros inesperados na UI.
*   **Fallback UI:** Uma interface de usuário de fallback padrão deve ser exibida para erros inesperados, informando o usuário e oferecendo opções (ex: recarregar a página).
*   **Log de Erro:** Implementar um sistema de log de erros (ex: Sentry ou similar) para monitorar e debugar problemas em produção.

### 14.5 Sistema de Fetch / API Padrão

Todas as requisições a APIs devem seguir um padrão centralizado para garantir consistência, tratamento de erros e reusabilidade.

*   **Camada Centralizada:** Todas as requisições devem usar uma camada centralizada (API client) para abstrair a lógica de fetch.
*   **Tratamento Global de Erro:** Implementar tratamento global de erros para códigos de status HTTP (ex: 401 - não autorizado, 403 - proibido, 500 - erro de servidor).
*   **Retry Automático:** Implementar retry automático para falhas temporárias de rede ou servidor.

### 14.6 Paginação / Infinite Scroll Padrão

Para listas grandes, é mandatório implementar estratégias de carregamento de dados eficientes.

*   **Listas Grandes:** Devem usar paginação ou infinite scroll.
*   **Carregamento:** Nunca carregar todos os dados de uma vez.

### 14.7 Sistema de Notificação Persistente

Além dos toasts, o sistema deve ter um mecanismo para notificações persistentes.

*   **Notificações Persistentes:** Um sistema de notificações persistentes (ex: ícone de sino com contador) deve ser implementado.
*   **Histórico:** Deve haver um histórico de notificações para o usuário.

### 14.8 Sistema de Filtros

Para a agenda e outras listas, um sistema de filtros robusto é essencial.

*   **Persistência:** Filtros devem ser persistidos (via `localStorage` ou parâmetros de URL).
*   **Combináveis:** Filtros devem ser combináveis para buscas complexas.

### 14.9 Keyboard Shortcuts

Para usuários avançados, atalhos de teclado devem ser implementados para ações comuns.

*   **Atalhos Recomendados:**
    *   `N`: Novo agendamento.
    *   `ESC`: Fechar modais, popovers, etc.
    *   `/`: Focar no campo de busca.

### 14.10 Cache de Dados

Para otimizar o carregamento e a disponibilidade offline, uma estratégia de cache de dados é crucial.

*   **Estratégia:** `stale-while-revalidate` é a estratégia recomendada.
*   **Cache por Recurso:** Implementar cache por recurso (ex: agenda, clientes).

### 14.11 Log de Uso (Analytics)

Para monitorar o uso do produto e tomar decisões baseadas em dados, o rastreamento de eventos é mandatório.

*   **Eventos Rastreados:** Eventos importantes devem ser rastreados (ex: criação de agendamento, cancelamento, uso de features).

### 14.12 Feature Flags

Para permitir o lançamento gradual de funcionalidades e testes A/B, um sistema de feature flags é essencial.

*   **Suporte:** O sistema deve suportar a ativação/desativação de features por tenant.

### 14.13 Internacionalização (i18n)

Para futuras expansões, o sistema deve ser preparado para internacionalização.

*   **Preparação:** O sistema deve ser preparado para i18n.
*   **Textos:** Nenhum texto deve ser hardcoded na UI.

### 14.14 Fluxo de Autenticação

Um fluxo de autenticação robusto é crítico para um SaaS.

*   **Refresh Token Automático:** Implementar um mecanismo para refresh automático de tokens de autenticação.
*   **Logout Global em 401:** Em caso de resposta 401 (Não Autorizado) da API, o usuário deve ser automaticamente deslogado.
*   **Redirecionamento Automático:** Redirecionamento automático para a tela de login após o logout ou sessão expirada.

---

## 15. Tokens JSON (PARA IA)

Para facilitar a integração com ferramentas de Inteligência Artificial e a geração automatizada de código, os Design Tokens devem ser exportados em formato JSON. Este formato permite que a IA interprete e utilize as especificações de design de forma programática.

```json
{
  "color": {
    "primitive": {
      "primary": {
        "50": "#FFF1F3",
        "100": "#FFE4E8",
        "200": "#FBCDD5",
        "300": "#F7B5C1",
        "400": "#EFA3B0",
        "500": "#CF97A0",
        "600": "#B87F89",
        "700": "#9E676F",
        "800": "#7E4F55",
        "900": "#5F3A3F"
      },
      "neutral": {
        "50": "#F5F0EE",
        "100": "#ECECEC",
        "500": "#5A5E61",
        "900": "#2A2320"
      },
      "status": {
        "success": "#A8C8A0",
        "warning": "#F0C080",
        "error": "#EF5350"
      },
      "opacity": {
        "white80": "rgba(255,255,255,0.8)",
        "white60": "rgba(255,255,255,0.6)",
        "black40": "rgba(0,0,0,0.4)"
      }
    },
    "semantic": {
      "bgDefault": "var(--neutral-50)",
      "bgDarkMode": "var(--neutral-900)",
      "surface": "#FFFFFF",
      "surfaceDarkMode": "#332B28",
      "overlay": "var(--opacity-black-40)",
      "textPrimary": "var(--neutral-900)",
      "textPrimaryDarkMode": "#FFFFFF",
      "textSecondary": "var(--neutral-500)",
      "textSecondaryDarkMode": "var(--neutral-100)",
      "textMuted": "#888888",
      "textMutedDarkMode": "var(--neutral-500)",
      "textOnPrimary": "#FFFFFF",
      "borderDefault": "var(--neutral-100)",
      "borderDefaultDarkMode": "#3A3230",
      "borderInputFocus": "var(--primary-500)",
      "borderInputFocusDarkMode": "var(--primary-400)",
      "primaryAction": "var(--primary-500)",
      "primaryActionHover": "var(--primary-600)",
      "primaryActionActive": "var(--primary-700)",
      "primaryActionDarkMode": "var(--primary-400)",
      "primaryActionHoverDarkMode": "var(--primary-300)",
      "primaryActionActiveDarkMode": "var(--primary-200)",
      "statusSuccess": "var(--status-success)",
      "statusWarning": "var(--status-warning)",
      "statusError": "var(--status-error)",
      "feedbackSuccessBg": "rgba(168, 200, 160, 0.2)",
      "feedbackErrorBg": "rgba(239, 83, 80, 0.15)",
      "feedbackWarningBg": "rgba(240, 192, 128, 0.2)"
    },
    "tenant": {
      "primary": "var(--primary-500)",
      "primaryHover": "var(--primary-600)",
      "secondary": "var(--neutral-500)",
      "background": "var(--neutral-50)",
      "surface": "#FFFFFF",
      "textPrimary": "var(--neutral-900)",
      "border": "var(--neutral-100)",
      "logoUrl": "",
      "fontFamily": "'Inter', sans-serif"
    }
  },
  "typography": {
    "fontSize": {
      "title": "20px",
      "subtitle": "16px",
      "body": "15px",
      "small": "13px",
      "micro": "12px"
    },
    "fontWeight": {
      "regular": 400,
      "medium": 500,
      "bold": 600
    },
    "fontFamily": {
      "base": "'Inter', sans-serif"
    },
    "semantic": {
      "title": "var(--font-weight-bold) var(--font-size-title) var(--font-family-base)",
      "subtitle": "var(--font-weight-medium) var(--font-size-subtitle) var(--font-family-base)",
      "body": "var(--font-weight-regular) var(--font-size-body) var(--font-family-base)",
      "small": "var(--font-weight-regular) var(--font-size-small) var(--font-family-base)",
      "micro": "var(--font-weight-regular) var(--font-size-micro) var(--font-family-base)"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "24px",
    "6": "32px"
  },
  "borderRadius": {
    "sm": "8px",
    "md": "10px",
    "lg": "12px",
    "xl": "20px",
    "pill": "999px"
  },
  "shadows": {
    "soft": "0px 4px 20px rgba(0,0,0,0.08)"
  },
  "states": {
    "hoverFilter": "brightness(0.95)",
    "activeFilter": "brightness(0.9)",
    "disabledOpacity": "0.5",
    "focusRing": "0 0 0 2px var(--primary-300)",
    "loadingCursor": "progress",
    "loadingOpacity": "0.7",
    "transition": "all var(--transition-fast) var(--ease-out)"
  },
  "motion": {
    "transition": {
      "fast": "0.15s",
      "default": "0.25s"
    },
    "ease": {
      "default": "ease-in-out",
      "out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)"
    },
    "avoidAnimationsInLargeLists": true
  },
  "breakpoints": {
    "sm": "480px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  },
  "zIndex": {
    "base": 0,
    "dropdown": 100,
    "sidebar": 800,
    "fixedHeader": 900,
    "modal": 1000,
    "toast": 1100,
    "tooltip": 1200
  },
  "layout": {
    "containerMaxWidth": "1200px",
    "containerPadding": "var(--space-4)",
    "headerFixed": true,
    "sidebarDesktop": true,
    "bottomNavMobile": true
  },
  "agenda": {
    "minEventWidth": "120px",
    "eventGap": "4px",
    "snappingInterval": "5min",
    "dragAndDrop": "required",
    "verticalResize": "allowed",
    "scaleVertical": "1min = 2px",
    "minBlock": "30min",
    "virtualization": "required",
    "maxVisibleEvents": "200",
    "reRenderControl": "memoization",
    "timezone": "required_multi_region",
    "timestampsInternal": "UTC",
    "rendering": "local_time",
    "blockedTimes": "supported_visual_unavailability",
    "eventLimits": "cannot_exceed_day",
    "conflictValidation": "required",
    "layoutAlgorithm": {
      "detectOverlapClusters": "required",
      "calculateColumnsPerGroup": "required",
      "applyProportionalWidth": "required",
      "minWidth": "120px",
      "overflowScrollHorizontal": "if_necessary"
    },
    "ux": {
      "scrollSynchronized": "required",
      "currentTimeLine": "required",
      "autoScrollToCurrentTime": "on_open"
    }
  },
  "icons": {
    "library": "Lucide_or_Heroicons_SVG",
    "import": "individual_tree_shaking",
    "style": "SVG_inline_controlled_by_props",
    "sizes": ["16px", "20px", "24px"],
    "alignment": "center 24x24 grid"
  },
  "feedback": {
    "toast": {
      "position": "top_or_bottom_center",
      "duration": "3s",
      "zIndex": "var(--z-toast)",
      "ariaLive": "required"
    },
    "async": {
      "loadingVisual": "required",
      "successToast": "required",
      "errorToastOrInline": "required"
    },
    "persistentNotifications": {
      "system": "required",
      "history": "required"
    }
  },
  "modal": {
    "overlay": "var(--color-overlay)",
    "position": "centered",
    "maxWidth": "480px",
    "padding": "var(--space-6)",
    "zIndex": "var(--z-modal)",
    "motion": "scale_fade",
    "focusTrap": "required",
    "closeOnEscape": "required"
  },
  "list": {
    "itemHeight": "56px",
    "hoverHighlight": "background-color: var(--neutral-50)",
    "divider": "1px var(--color-border-default)",
    "emptyState": {
      "icon": "required",
      "message": "required",
      "cta": "required"
    },
    "paginationOrInfiniteScroll": "required",
    "neverLoadAll": "required"
  },
  "table": {
    "sorting": "supported",
    "filters": "supported",
    "pagination": "supported",
    "rowSelection": "supported"
  },
  "filters": {
    "persisted": "localStorage_or_url",
    "combinable": "required"
  },
  "scroll": {
    "behavior": "smooth",
    "scrollbar": "discreet",
    "mobile": "momentum scroll"
  },
  "performance": {
    "lazyLoading": "required",
    "skeletonLoading": "required",
    "offlineCache": "required_basic_agenda",
    "codeSplitting": "required_per_route",
    "prefetchMainRoutes": "required",
    "initialBundleLimit": "<200kb_gzip",
    "debounceSearchInputs": "required",
    "throttleAgendaDrag": "required"
  },
  "form": {
    "validation": "inline",
    "errorPlacement": "below_input",
    "successVisualFeedback": "required",
    "submitDisabledUntilValid": "required",
    "errorsDisappearOnCorrection": "required"
  },
  "accessibility": {
    "keyboardNavigation": "required",
    "prefersReducedMotion": "respected",
    "labelsForInputs": "required"
  },
  "namingConvention": {
    "components": "PascalCase",
    "cssClasses": "kebab-case",
    "tokens": "kebab-case"
  },
  "projectStructure": {
    "src": {
      "components": "",
      "features": "",
      "pages": "",
      "store": "",
      "styles": {
        "tokens.css": "",
        "globals.css": ""
      }
    }
  },
  "density": {
    "compact": "0.8",
    "default": "1",
    "comfortable": "1.2"
  },
  "componentStandard": {
    "controlled": "required",
    "reusable": "required",
    "noBusinessLogicInternal": "required"
  },
  "security": {
    "inputSanitization": "required",
    "xssProtection": "required",
    "sensitiveTokensExposure": "never_frontend"
  },
  "scalability": {
    "multiTenantIsolation": "required",
    "featureFlags": "supported_per_tenant",
    "internationalization": "prepared"
  },
  "globalErrorSystem": {
    "errorBoundary": "required",
    "fallbackUI": "required",
    "errorLogging": "required"
  },
  "fetchAPIStandard": {
    "centralizedClient": "required",
    "globalErrorHandling": "required",
    "autoRetry": "required"
  },
  "dataCache": {
    "strategy": "stale_while_revalidate",
    "cacheByResource": "required"
  },
  "usageLog": {
    "eventTracking": "required"
  },
  "keyboardShortcuts": {
    "newAppointment": "N",
    "close": "ESC",
    "focusSearch": "/"
  }
}
```

---

## 16. Regras Obrigatórias

Para manter a integridade, consistência e performance do Design System, as seguintes regras são de **cumprimento obrigatório** por todos os desenvolvedores e ferramentas de IA:

*   **Nunca acessar tokens primitivos diretamente no código de UI:** Todas as cores, espaçamentos, tipografias, etc., devem ser referenciadas através dos **Design Tokens Semânticos** definidos nas Seções 2.2, 2.3 e 2.5.
*   **Nunca usar inline style:** Estilos devem ser aplicados via classes CSS ou componentes estilizados que utilizem os Design Tokens.
*   **Sempre usar estados:** Todos os componentes interativos devem implementar os estados globais (hover, active, disabled, focus, loading) definidos na Seção 2.9, incluindo a transição obrigatória.
*   **Layout Responsivo:** O sistema de grid e os breakpoints devem ser utilizados para garantir a responsividade em todos os dispositivos, com atenção aos edge cases de mobile.
*   **Acessibilidade:** Todas as diretrizes de acessibilidade (WCAG) devem ser seguidas rigorosamente, incluindo suporte a navegação por teclado, `aria-live`, labels para inputs, focus trap em modais e fechamento por ESC.
*   **Performance PWA:** As diretrizes de performance (lazy loading, skeleton loading, cache offline, code splitting, prefetch, limite de bundle, debounce, throttle) são mandatórias para o desenvolvimento do PWA.
*   **Nomenclatura:** Seguir rigorosamente as convenções de nomenclatura definidas na Seção 32 para tokens semânticos e na Seção 15 para componentes, classes CSS e tokens.
*   **Lógica de Negócio:** Nunca misturar lógica de UI com lógica de negócio dentro dos componentes.
*   **Padrão de Componentes:** Todo componente deve ser controlado, reutilizável e sem lógica de negócio interna.
*   **Segurança:** Implementar sanitização de inputs, proteção contra XSS e garantir que tokens sensíveis nunca sejam expostos no frontend.
*   **Escalabilidade Multi-tenant:** O sistema deve suportar múltiplos salões simultaneamente com isolamento de dados e feature flags.
*   **Sistema de Erros Global:** Implementar Error Boundary, Fallback UI e log de erros para produção.
*   **Fetch/API Padrão:** Utilizar camada centralizada de API client com tratamento global de erros e retry automático.
*   **Paginação/Infinite Scroll:** Implementar para listas grandes, evitando carregar todos os dados de uma vez.
*   **Feedback Assíncrono:** Todas as ações assíncronas devem ter loading visual, toast de sucesso e toast/inline de erro.
*   **Internacionalização:** O sistema deve ser preparado para i18n, com textos não hardcoded.

---

## 17. Definição de Formulários (UX Crítica)

Para garantir uma experiência de usuário consistente e eficiente na interação com formulários, as seguintes diretrizes são mandatórias:

*   **Validação Inline:** A validação dos campos deve ocorrer em tempo real (inline), fornecendo feedback imediato ao usuário.
*   **Mensagens de Erro:** As mensagens de erro devem ser exibidas de forma clara e concisa, posicionadas diretamente abaixo do campo de entrada correspondente.
*   **Feedback Visual de Sucesso:** Após a validação bem-sucedida de um campo ou o envio de um formulário, deve haver um feedback visual claro de sucesso (ex: borda verde, ícone de check).
*   **Submit Desabilitado:** O botão de submit deve permanecer desabilitado até que o formulário esteja válido.
*   **Erros Dinâmicos:** As mensagens de erro devem desaparecer automaticamente ao corrigir o campo correspondente.

---

## 18. Implementação Técnica Obrigatória

Para garantir a consistência e a governança do código, as seguintes diretrizes de implementação técnica são mandatórias:

*   **Exportação de Tokens:** Todos os Design Tokens devem ser exportados para:
    *   **Tailwind config:** Para integração com o framework CSS.
    *   **CSS variables:** Para uso direto em CSS e temas.
    *   **JS/TS object:** Para uso em lógica de frontend e ferramentas de IA.
*   **Mapeamento Centralizado:** É obrigatório existir um arquivo `theme.ts` (ou similar) para o mapeamento centralizado dos tokens.
*   **Sincronização de Tokens (CRÍTICO):**
    *   O JSON é a fonte primária (`source of truth`).
    *   CSS variables e Tailwind devem ser gerados automaticamente a partir do JSON.
    *   Nunca manter tokens duplicados manualmente.
    *   **Pipeline obrigatório:** `tokens.json` → `build script` → `tokens.css` + `tailwind.config.js` + `theme.ts`.
*   **Sincronização:** O arquivo `tailwind.config.js` deve estar sincronizado com os tokens definidos.
*   **Single Source of Truth (SSOT):** Nunca duplicar valores; os tokens devem ser a única fonte de verdade para os valores de design.

---

## 19. Padrão de Componentes React

Para garantir a reutilização, manutenibilidade e otimização para IA, todos os componentes React devem seguir este padrão:

*   **Tipagem:** Todo componente deve ser tipado usando TypeScript.
*   **Props Padrão:** Deve aceitar props padrão como `className`, `style` e `children`.
*   **`forwardRef`:** Utilizar `forwardRef` quando aplicável para permitir o encaminhamento de refs.
*   **Controlados:** Componentes de formulário devem ser controlados (`value`/`onChange`).
*   **Estrutura Padrão:**
    ```
    /Component
      index.tsx
      styles.ts (ou tailwind.css/module.css)
      types.ts
    ```
*   **Separação de Responsabilidades:**
    *   Nunca acessar APIs diretamente dentro de componentes de UI.
    *   Nunca conter lógica de negócio interna; a lógica deve ser abstraída para hooks ou serviços.

---

## 20. Sistema de Formulários

Para garantir a robustez e a experiência do usuário em formulários, a seguinte stack e regras são obrigatórias:

*   **Stack Obrigatória:**
    *   `react-hook-form`: Para gerenciamento de estado de formulário e validação.
    *   `zod`: Para validação de schema (schema-first validation).
*   **Regras:**
    *   **Validação Schema-First:** A validação deve ser definida por schema com `zod`.
    *   **Erros Tipados:** Erros devem ser tipados para melhor tratamento.
    *   **Integração Automática:** Integração com a UI deve ser automática via `react-hook-form`.

---

## 21. Sistema de Rotas

Para a navegação e organização da aplicação, um sistema de rotas padronizado é essencial.

*   **Router:** `React Router` ou equivalente.
*   **Padrões:**
    *   **Rotas Protegidas:** Implementar `auth guard` para proteger rotas que exigem autenticação.
    *   **Lazy Loading:** Obrigatório para rotas para otimizar o carregamento inicial.
    *   **Layout por Rota:** Definir layouts específicos por rota (ex: `dashboard`, `auth`).

---

## 22. Gerenciamento de Estado

Para um gerenciamento de estado eficiente e escalável, é crucial separar o estado global do estado do servidor.

*   **Separação:**
    *   **Global State:** `Zustand` para estado global da UI (ex: tema, estado de modais).
    *   **Server State:** `React Query` (ou equivalente) para gerenciamento de dados de API (cache, revalidação, etc.).
*   **Restrição de Uso:** Nunca usar `Zustand` para dados de API.
*   **Padrão:** Criar stores por domínio (ex: `agendaStore`, `authStore`).

---

## 23. Padrão de API

Para garantir a consistência na comunicação com o backend, um padrão de API é mandatório.

*   **Endpoints de Exemplo:**
    *   `/appointments`
    *   `/clients`
    *   `/services`
*   **Convenção RESTful:**
    *   `GET /appointments`
    *   `POST /appointments`
    *   `PATCH /appointments/:id`
    *   `DELETE /appointments/:id`

---

## 24. Testes

Para garantir a qualidade e a estabilidade do produto em produção, uma estratégia de testes abrangente é obrigatória.

*   **Testes Unitários:** Para componentes críticos e funções puras.
*   **Testes de Integração:** Para fluxos de usuário importantes (ex: criar agendamento, login).
*   **Testes E2E (End-to-End):** Utilizar `Cypress` ou `Playwright` para testar a aplicação como um todo.
*   **Cobertura Mínima:** Cobertura de código mínima de 70%.

---

## 25. Versionamento do Design System

O próprio Design System deve ser versionado para gerenciar mudanças e compatibilidade.

*   **Versão:** O Design System deve ter uma versão (ex: `v1.0.0`).
*   **Mudanças:**
    *   **Breaking Changes:** Devem resultar em um incremento `major`.
    *   **Mudanças Visuais:** Devem resultar em um incremento `minor`.
    *   **Correções:** Devem resultar em um incremento `patch`.

---

## 26. Documentação Visual (Storybook)

Para facilitar o desenvolvimento, a colaboração e a manutenção, uma documentação visual interativa é obrigatória.

*   **Storybook:** `Storybook` é obrigatório para documentar componentes.
*   **Documentação por Componente:** Cada componente deve ser documentado com:
    *   Variantes
    *   Estados
    *   Exemplos de uso

---

## 27. CI/CD (Integração Contínua / Entrega Contínua)

Para um fluxo de desenvolvimento eficiente e seguro, um pipeline de CI/CD é mandatório.

*   **Build Automático:** Configurar build automático da aplicação.
*   **Lint + Type Check:** Execução obrigatória de `lint` e `type check` em cada commit/PR.
*   **Preview por PR:** Geração de previews automáticos para cada Pull Request.

---

## 28. Estrutura de Projeto Recomendada (React)

Para manter a organização e facilitar a manutenção e escalabilidade do projeto, a seguinte estrutura de diretórios é recomendada:

```
/src
  /components       # Componentes reutilizáveis (ex: Button, Input, Card)
  /features         # Módulos de funcionalidades específicas (ex: Agenda, Auth, Profile)
  /pages            # Páginas da aplicação (ex: Home, Dashboard, Settings)
  /store            # Gerenciamento de estado global (Zustand)
  /styles           # Estilos globais e tokens
    tokens.css      # Definição de todos os Design Tokens
    globals.css     # Estilos globais e resets
  /utils            # Funções utilitárias
  /hooks            # Custom Hooks do React
  /assets           # Imagens, ícones, fontes
  /services         # Camada de API client e lógica de fetch
  /config           # Configurações globais, feature flags
  /i18n             # Arquivos de internacionalização
```

---

## 29. Padrão de Hooks

Para garantir a escalabilidade e a manutenibilidade, os Custom Hooks devem seguir um padrão rigoroso.

*   **Nomenclatura:** Hooks devem seguir o padrão `use{Domain}{Action}`.
    *   Exemplos: `useAppointments()`, `useCreateAppointment()`, `useAuth()`.
*   **Separação de Responsabilidades:** Nunca misturar UI, lógica de negócio e lógica de fetch no mesmo hook.

---

## 30. Camada de Serviços

A camada de serviços é responsável pela comunicação com a API e deve ser estruturada de forma clara.

*   **Estrutura:**
    ```
    /services
      /api
        appointments.service.ts
        clients.service.ts
    ```
*   **Responsabilidades:**
    *   Apenas comunicação HTTP.
    *   Sem lógica de UI.

---

## 31. Design QA

Para evitar inconsistências e garantir a qualidade visual, um processo de Design QA é mandatório.

*   **Validação:** Toda feature deve ser validada contra:
    *   Tokens
    *   Espaçamento
    *   Estados

---

## 32. Convenção de Tokens Semânticos

Para garantir que a IA gere código consistente, é obrigatório seguir um padrão de nomenclatura para tokens semânticos.

*   **Padrão Obrigatório:** `--color-{categoria}-{função}-{estado?}`
    *   Exemplos:
        *   `--color-bg-default`
        *   `--color-bg-surface`
        *   `--color-text-primary`
        *   `--color-action-primary-hover`
        *   `--color-border-input-focus`

---

## 33. Conclusão

Este Design System representa um guia completo e rigoroso para o desenvolvimento do PWA Agendar 2.0. Ele está **pronto para produção real**, **escalável para um modelo de negócio SaaS multi-tenant** e **otimizado para integração e geração por Inteligência Artificial**. A adesão integral a estas diretrizes é fundamental para garantir a consistência, a performance e a qualidade do produto final, elevando o projeto a um nível profissional e robusto, capaz de competir no mercado de SaaS de grande porte.

## Referências

[1] [What makes a good Progressive Web App?](https://web.dev/articles/pwa-checklist)
[2] [Tips to Improve the Accessibility of Your Progressive Web App](https://medium.com/@juricavoda/tips-to-improve-the-accessibility-of-your-progressive-web-app-198d90b643b2)
