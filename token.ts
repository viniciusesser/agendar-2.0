// ============================================================
//  AGENDAR — THEME MANAGER
//  Arquivo: src/styles/tokens.ts
//
//  REGRA DE OURO:
//  Nenhuma cor, tamanho ou estilo deve ser escrito diretamente
//  em componentes. Tudo vem daqui.
//  Para trocar o tema do app inteiro: edite apenas este arquivo.
// ============================================================

// ------------------------------------------------------------
//  TIPOS
// ------------------------------------------------------------

export type ThemeColors = typeof rosePoudre.colors
export type ThemeTypography = typeof rosePoudre.typography
export type ThemeSpacing = typeof rosePoudre.spacing
export type ThemeRadius = typeof rosePoudre.radius
export type ThemeShadows = typeof rosePoudre.shadows
export type ThemeIcons = typeof rosePoudre.icons
export type ThemeButtons = typeof rosePoudre.buttons
export type ThemeStatus = typeof rosePoudre.status
export type Theme = typeof rosePoudre


// ------------------------------------------------------------
//  TEMA: ROSE POUDRÉ (Salão Feminino)
//  Tema padrão do Agendar
// ------------------------------------------------------------

export const rosePoudre = {

  name: 'Rose Poudré',
  slug: 'rose-poudre',
  tipo: 'salao_feminino',

  // ----------------------------------------------------------
  //  CORES BASE
  // ----------------------------------------------------------
  colors: {

    // Fundos
    background: {
      app:      '#FDF6F0',   // fundo geral do app
      surface:  '#F5E6E0',   // topbar, navbar, cabeçalhos
      card:     '#FFFFFF',   // cards, modais, painéis
      input:    '#FFFFFF',   // campos de formulário
      overlay:  'rgba(44, 24, 16, 0.40)', // overlay de modais
      skeleton: '#F0DDD8',   // loading skeleton
    },

    // Bordas
    border: {
      default:  '#F0D5D0',   // bordas padrão
      strong:   '#E0B8B0',   // bordas com mais destaque
      focus:    '#C4748A',   // borda de input em foco
      error:    '#E05050',   // borda de input com erro
    },

    // Cor primária — rosa principal
    primary: {
      light:    '#F4C0D0',   // hover suave, badges
      default:  '#C4748A',   // botão principal, links ativos
      dark:     '#A05070',   // hover do botão principal
      contrast: '#FFFFFF',   // texto sobre fundo primário
    },

    // Cor secundária — rosé mais claro
    secondary: {
      light:    '#FAF0F4',
      default:  '#E8B4C0',
      dark:     '#D4A0A8',
      contrast: '#2C1810',
    },

    // Texto
    text: {
      primary:    '#2C1810',   // títulos, conteúdo principal
      secondary:  '#7A4A55',   // subtítulos, labels
      placeholder:'#C4A0A8',   // placeholder de inputs
      disabled:   '#D4B8BC',   // texto desabilitado
      inverse:    '#FFFFFF',   // texto sobre fundo escuro
      link:       '#C4748A',   // links
      linkHover:  '#A05070',   // hover de links
    },

    // Status — usados em badges, alertas e ícones
    status: {
      success: {
        background: '#EDF7ED',
        text:       '#2E7D32',
        border:     '#A5D6A7',
        icon:       '#43A047',
      },
      warning: {
        background: '#FFF8E1',
        text:       '#F57F17',
        border:     '#FFE082',
        icon:       '#FFB300',
      },
      error: {
        background: '#FDECEA',
        text:       '#C62828',
        border:     '#EF9A9A',
        icon:       '#E53935',
      },
      info: {
        background: '#F5E6F8',
        text:       '#6A1B9A',
        border:     '#CE93D8',
        icon:       '#8E24AA',
      },
    },

    // Cores dos status de agendamento
    appointment: {
      agendado: {
        background: '#EEF2FF',
        text:       '#3730A3',
        border:     '#A5B4FC',
        dot:        '#6366F1',
      },
      confirmado: {
        background: '#ECFDF5',
        text:       '#065F46',
        border:     '#6EE7B7',
        dot:        '#10B981',
      },
      em_atendimento: {
        background: '#FEF9C3',
        text:       '#854D0E',
        border:     '#FDE047',
        dot:        '#EAB308',
      },
      finalizado: {
        background: '#F0F9FF',
        text:       '#0C4A6E',
        border:     '#BAE6FD',
        dot:        '#0EA5E9',
      },
      nao_compareceu: {
        background: '#FEF2F2',
        text:       '#991B1B',
        border:     '#FECACA',
        dot:        '#EF4444',
      },
    },

  },

  // ----------------------------------------------------------
  //  TIPOGRAFIA
  // ----------------------------------------------------------
  typography: {

    fontFamily: {
      sans:  '"Inter", "Helvetica Neue", Arial, sans-serif',
      mono:  '"JetBrains Mono", "Courier New", monospace',
    },

    fontSize: {
      xs:   '11px',
      sm:   '13px',
      md:   '15px',
      lg:   '17px',
      xl:   '20px',
      '2xl':'24px',
      '3xl':'30px',
    },

    fontWeight: {
      regular: '400',
      medium:  '500',
      bold:    '600',
    },

    lineHeight: {
      tight:  '1.25',
      normal: '1.5',
      loose:  '1.75',
    },

    // Estilos prontos para uso nos componentes
    styles: {
      pageTitle:    { fontSize: '24px', fontWeight: '600', lineHeight: '1.25', color: 'text.primary' },
      sectionTitle: { fontSize: '17px', fontWeight: '600', lineHeight: '1.25', color: 'text.primary' },
      cardTitle:    { fontSize: '15px', fontWeight: '600', lineHeight: '1.5',  color: 'text.primary' },
      label:        { fontSize: '13px', fontWeight: '500', lineHeight: '1.5',  color: 'text.secondary' },
      body:         { fontSize: '15px', fontWeight: '400', lineHeight: '1.75', color: 'text.primary' },
      bodySmall:    { fontSize: '13px', fontWeight: '400', lineHeight: '1.5',  color: 'text.secondary' },
      caption:      { fontSize: '11px', fontWeight: '400', lineHeight: '1.5',  color: 'text.secondary' },
      buttonLg:     { fontSize: '15px', fontWeight: '600', lineHeight: '1',    color: 'primary.contrast' },
      buttonMd:     { fontSize: '13px', fontWeight: '600', lineHeight: '1',    color: 'primary.contrast' },
      buttonSm:     { fontSize: '11px', fontWeight: '600', lineHeight: '1',    color: 'primary.contrast' },
      inputText:    { fontSize: '15px', fontWeight: '400', lineHeight: '1.5',  color: 'text.primary' },
      inputLabel:   { fontSize: '13px', fontWeight: '500', lineHeight: '1.5',  color: 'text.secondary' },
      navLabel:     { fontSize: '10px', fontWeight: '500', lineHeight: '1',    color: 'text.secondary' },
    },

  },

  // ----------------------------------------------------------
  //  ESPAÇAMENTO
  //  Base de 4px — todos os valores são múltiplos
  // ----------------------------------------------------------
  spacing: {
    '0':  '0px',
    '1':  '4px',
    '2':  '8px',
    '3':  '12px',
    '4':  '16px',
    '5':  '20px',
    '6':  '24px',
    '8':  '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',

    // Atalhos semânticos
    pagePadding:   '16px',   // padding lateral das páginas
    cardPadding:   '16px',   // padding interno de cards
    sectionGap:    '24px',   // espaço entre seções
    itemGap:       '12px',   // espaço entre itens de lista
    inputGap:      '8px',    // espaço entre label e input
    buttonGap:     '8px',    // espaço entre ícone e texto no botão
  },

  // ----------------------------------------------------------
  //  BORDER RADIUS
  // ----------------------------------------------------------
  radius: {
    none:   '0px',
    sm:     '4px',
    md:     '8px',
    lg:     '12px',
    xl:     '16px',
    '2xl':  '20px',
    full:   '9999px',  // pílulas e avatares

    // Atalhos semânticos
    button: '8px',
    input:  '8px',
    card:   '12px',
    modal:  '16px',
    badge:  '9999px',
    avatar: '9999px',
    tag:    '9999px',
  },

  // ----------------------------------------------------------
  //  SOMBRAS
  // ----------------------------------------------------------
  shadows: {
    none:   'none',
    sm:     '0 1px 3px rgba(44, 24, 16, 0.08)',
    md:     '0 4px 12px rgba(44, 24, 16, 0.10)',
    lg:     '0 8px 24px rgba(44, 24, 16, 0.12)',
    modal:  '0 16px 48px rgba(44, 24, 16, 0.16)',
    card:   '0 2px 8px rgba(44, 24, 16, 0.06)',
    input:  '0 0 0 3px rgba(196, 116, 138, 0.20)',  // focus ring
  },

  // ----------------------------------------------------------
  //  BOTÕES
  //  Cada variante define: fundo, texto, borda, hover, active,
  //  desabilitado — e tamanhos (height, padding, fontSize)
  // ----------------------------------------------------------
  buttons: {

    // Primário — ação principal da tela
    primary: {
      background:         '#C4748A',
      backgroundHover:    '#A05070',
      backgroundActive:   '#804060',
      backgroundDisabled: '#E8B4C0',
      text:               '#FFFFFF',
      textDisabled:       '#FFFFFF',
      border:             'transparent',
      borderHover:        'transparent',
      shadow:             'none',
      shadowHover:        '0 4px 12px rgba(196, 116, 138, 0.35)',
      iconColor:          '#FFFFFF',
    },

    // Secundário — ação de suporte
    secondary: {
      background:         '#FFFFFF',
      backgroundHover:    '#FDF0F3',
      backgroundActive:   '#F5E6EA',
      backgroundDisabled: '#FAF4F5',
      text:               '#C4748A',
      textDisabled:       '#E8B4C0',
      border:             '#E0B8C0',
      borderHover:        '#C4748A',
      shadow:             'none',
      shadowHover:        'none',
      iconColor:          '#C4748A',
    },

    // Ghost — discreta, sem borda
    ghost: {
      background:         'transparent',
      backgroundHover:    '#F5E6E0',
      backgroundActive:   '#EDD8D0',
      backgroundDisabled: 'transparent',
      text:               '#7A4A55',
      textDisabled:       '#D4B8BC',
      border:             'transparent',
      borderHover:        'transparent',
      shadow:             'none',
      shadowHover:        'none',
      iconColor:          '#7A4A55',
    },

    // Danger — ação destrutiva (ex: excluir)
    danger: {
      background:         '#E53935',
      backgroundHover:    '#C62828',
      backgroundActive:   '#B71C1C',
      backgroundDisabled: '#FFCDD2',
      text:               '#FFFFFF',
      textDisabled:       '#FFFFFF',
      border:             'transparent',
      borderHover:        'transparent',
      shadow:             'none',
      shadowHover:        '0 4px 12px rgba(229, 57, 53, 0.30)',
      iconColor:          '#FFFFFF',
    },

    // Success — confirmar, finalizar
    success: {
      background:         '#43A047',
      backgroundHover:    '#2E7D32',
      backgroundActive:   '#1B5E20',
      backgroundDisabled: '#A5D6A7',
      text:               '#FFFFFF',
      textDisabled:       '#FFFFFF',
      border:             'transparent',
      borderHover:        'transparent',
      shadow:             'none',
      shadowHover:        '0 4px 12px rgba(67, 160, 71, 0.30)',
      iconColor:          '#FFFFFF',
    },

    // Tamanhos
    sizes: {
      lg: { height: '48px', paddingX: '24px', fontSize: '15px', iconSize: '20px', gap: '8px' },
      md: { height: '40px', paddingX: '16px', fontSize: '13px', iconSize: '18px', gap: '6px' },
      sm: { height: '32px', paddingX: '12px', fontSize: '11px', iconSize: '16px', gap: '4px' },
    },

  },

  // ----------------------------------------------------------
  //  ÍCONES
  //  Define a cor de cada ícone por contexto de uso
  // ----------------------------------------------------------
  icons: {

    // Cores por estado
    default:   '#7A4A55',   // ícone padrão
    active:    '#C4748A',   // ícone de item selecionado / ativo
    inactive:  '#C4A0A8',   // ícone desabilitado
    inverse:   '#FFFFFF',   // ícone sobre fundo escuro/primário
    danger:    '#E53935',   // ícone de ação destrutiva
    success:   '#43A047',   // ícone de confirmação
    warning:   '#FFB300',   // ícone de alerta
    info:      '#8E24AA',   // ícone informativo

    // Tamanhos padrão
    sizes: {
      xs: '14px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
    },

    // Cores por módulo (nav bar e cabeçalhos de seção)
    modules: {
      agenda:       '#C4748A',   // calendário
      clientes:     '#8E24AA',   // pessoas
      financeiro:   '#2E7D32',   // dinheiro
      estoque:      '#E65100',   // caixa
      marketing:    '#1565C0',   // megafone
      rh:           '#4527A0',   // pessoas+gráfico
      configuracoes:'#5D4037',   // engrenagem
      notificacoes: '#C4748A',   // sino
      dashboard:    '#C4748A',   // home
    },

  },

  // ----------------------------------------------------------
  //  INPUTS E FORMULÁRIOS
  // ----------------------------------------------------------
  inputs: {
    background:          '#FFFFFF',
    backgroundDisabled:  '#FAF4F5',
    border:              '#F0D5D0',
    borderHover:         '#E0B8B0',
    borderFocus:         '#C4748A',
    borderError:         '#E53935',
    text:                '#2C1810',
    placeholder:         '#C4A0A8',
    label:               '#7A4A55',
    helperText:          '#C4A0A8',
    errorText:           '#C62828',
    height:              '44px',
    padding:             '0 14px',
    radius:              '8px',
    fontSize:            '15px',
    focusRing:           '0 0 0 3px rgba(196, 116, 138, 0.20)',
  },

  // ----------------------------------------------------------
  //  NAVEGAÇÃO INFERIOR (Bottom Nav)
  // ----------------------------------------------------------
  nav: {
    background:      '#FFFFFF',
    border:          '#F0D5D0',
    itemDefault:     '#C4A0A8',   // ícone + label inativos
    itemActive:      '#C4748A',   // ícone + label do item selecionado
    itemBg:          '#FDF6F0',   // fundo do item ativo
    height:          '64px',
    iconSize:        '22px',
    labelSize:       '10px',
  },

  // ----------------------------------------------------------
  //  TOPBAR / CABEÇALHO
  // ----------------------------------------------------------
  topbar: {
    background:   '#F5E6E0',
    border:       '#F0D5D0',
    title:        '#2C1810',
    subtitle:     '#7A4A55',
    iconColor:    '#7A4A55',
    height:       '56px',
  },

  // ----------------------------------------------------------
  //  CARDS
  // ----------------------------------------------------------
  cards: {
    background:    '#FFFFFF',
    border:        '#F0D5D0',
    borderHover:   '#E0B8B0',
    shadow:        '0 2px 8px rgba(44, 24, 16, 0.06)',
    shadowHover:   '0 4px 12px rgba(44, 24, 16, 0.10)',
    radius:        '12px',
    padding:       '16px',
  },

  // ----------------------------------------------------------
  //  MODAIS E SHEETS
  // ----------------------------------------------------------
  modal: {
    background:  '#FFFFFF',
    overlay:     'rgba(44, 24, 16, 0.40)',
    border:      '#F0D5D0',
    shadow:      '0 16px 48px rgba(44, 24, 16, 0.16)',
    radius:      '16px',
    padding:     '24px',
    headerBg:    '#FDF6F0',
    headerBorder:'#F0D5D0',
  },

  // ----------------------------------------------------------
  //  BADGES E TAGS
  // ----------------------------------------------------------
  badge: {
    radius: '9999px',
    sizes: {
      sm: { fontSize: '10px', paddingX: '6px',  height: '18px' },
      md: { fontSize: '12px', paddingX: '8px',  height: '22px' },
      lg: { fontSize: '13px', paddingX: '10px', height: '26px' },
    },
  },

  // ----------------------------------------------------------
  //  AVATAR
  // ----------------------------------------------------------
  avatar: {
    background: '#F4C0D0',
    text:       '#A05070',
    border:     '#E8B4C0',
    sizes: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '64px',
    },
  },

  // ----------------------------------------------------------
  //  STATUS DE AGENDAMENTO
  //  (Repetido aqui como atalho para componentes de agenda)
  // ----------------------------------------------------------
  status: {
    agendado:       { bg: '#EEF2FF', text: '#3730A3', border: '#A5B4FC', dot: '#6366F1' },
    confirmado:     { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', dot: '#10B981' },
    em_atendimento: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047', dot: '#EAB308' },
    finalizado:     { bg: '#F0F9FF', text: '#0C4A6E', border: '#BAE6FD', dot: '#0EA5E9' },
    nao_compareceu: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', dot: '#EF4444' },
  },

  // ----------------------------------------------------------
  //  AGENDA — CORES E DIMENSÕES
  // ----------------------------------------------------------
  agenda: {
    slotHeight:      '60px',    // altura de cada slot de 15 min na grade
    slotBorder:      '#F5E0DC', // linha divisória entre slots
    currentTimeLine: '#C4748A', // linha vermelha do horário atual
    blockedBg:       '#F0E0DC', // fundo de bloqueio de agenda
    blockedText:     '#7A4A55',
    headerBg:        '#F5E6E0',
    columnGap:       '4px',     // espaço entre colunas de conflito
  },

  // ----------------------------------------------------------
  //  LOADING / SKELETON
  // ----------------------------------------------------------
  loading: {
    skeletonBase:     '#F0DDD8',
    skeletonHighlight:'#FDF6F0',
    spinnerColor:     '#C4748A',
  },

  // ----------------------------------------------------------
  //  DIVIDERS
  // ----------------------------------------------------------
  divider: {
    color:  '#F0D5D0',
    strong: '#E0B8B0',
  },

}


// ------------------------------------------------------------
//  EXPORTAÇÃO DO TEMA ATIVO
//  Para trocar o tema, altere apenas esta linha.
// ------------------------------------------------------------

export const theme = rosePoudre

export default theme


// ------------------------------------------------------------
//  COMO USAR NOS COMPONENTES:
//
//  import theme from '@/styles/tokens'
//
//  // Cor de fundo de um card:
//  style={{ background: theme.cards.background }}
//
//  // Cor de um ícone ativo na nav:
//  color={theme.nav.itemActive}
//
//  // Cor de um botão primário:
//  background: theme.buttons.primary.background
//
//  // Cor de status de um agendamento:
//  background: theme.status.confirmado.bg
//
//  // Cor do ícone do módulo financeiro:
//  color: theme.icons.modules.financeiro
// ------------------------------------------------------------