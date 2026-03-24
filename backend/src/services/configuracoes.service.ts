import { prisma } from '../lib/prisma'

const CHAVES_VALIDAS = [
  'horario_abertura',
  'horario_fechamento',
  'slot_minutos',
  'lembrete_horas_antes',
  'alerta_aniversario',
  'alerta_estoque_baixo',
  'whatsapp_template_lembrete',
  'whatsapp_template_aniversario',
  'whatsapp_template_retorno',
  'whatsapp_template_cobranca',
]

const DEFAULTS: Record<string, string> = {
  horario_abertura:              '08:00',
  horario_fechamento:            '19:00',
  slot_minutos:                  '30',
  lembrete_horas_antes:          '2',
  alerta_aniversario:            'true',
  alerta_estoque_baixo:          'true',
  whatsapp_template_lembrete:    'Olá {{nome}}, lembrando do seu horário amanhã às {{hora}} 💕',
  whatsapp_template_aniversario: 'Feliz aniversário {{nome}}! 🎂 Temos um presente especial pra você.',
  whatsapp_template_retorno:     'Sentimos sua falta, {{nome}}! Que tal agendar um horário?',
  whatsapp_template_cobranca:    'Olá {{nome}}, seu saldo em aberto é R$ {{debito}}. Podemos resolver?',
}

export async function listarConfiguracoes(empresaId: string) {
  const salvas = await prisma.ag_configuracoes.findMany({
    where: { empresa_id: empresaId },
  })

  const mapa: Record<string, string> = { ...DEFAULTS }
  for (const c of salvas) {
    mapa[c.chave] = c.valor
  }

  return mapa
}

export async function salvarConfiguracao(empresaId: string, chave: string, valor: string) {
  if (!CHAVES_VALIDAS.includes(chave)) throw new Error('CHAVE_INVALIDA')

  return prisma.ag_configuracoes.upsert({
    where: { empresa_id_chave: { empresa_id: empresaId, chave } },
    update: { valor },
    create: { empresa_id: empresaId, chave, valor },
  })
}

export async function salvarMultiplasConfiguracoes(empresaId: string, configs: Record<string, string>) {
  const invalidas = Object.keys(configs).filter(k => !CHAVES_VALIDAS.includes(k))
  if (invalidas.length > 0) throw new Error(`CHAVE_INVALIDA: ${invalidas.join(', ')}`)

  const operacoes = Object.entries(configs).map(([chave, valor]) =>
    prisma.ag_configuracoes.upsert({
      where: { empresa_id_chave: { empresa_id: empresaId, chave } },
      update: { valor },
      create: { empresa_id: empresaId, chave, valor },
    })
  )

  await prisma.$transaction(operacoes)
  return listarConfiguracoes(empresaId)
}

// Sócias
export async function listarSocias(empresaId: string) {
  return prisma.ag_socias.findMany({
    where: { empresa_id: empresaId, ativo: true },
    include: { profissional: true },
  })
}

export async function salvarSocias(empresaId: string, socias: Array<{ profissional_id: string; percentual: number }>) {
  const total = socias.reduce((s, x) => s + x.percentual, 0)
  if (Math.round(total) !== 100) throw new Error('PERCENTUAL_INVALIDO')

  // Desativa todas as sócias atuais
  await prisma.ag_socias.updateMany({
    where: { empresa_id: empresaId },
    data: { ativo: false },
  })

  // Cria ou reativa
  for (const s of socias) {
    const prof = await prisma.ag_profissionais.findFirst({
      where: { id: s.profissional_id, empresa_id: empresaId, deleted_at: null },
    })
    if (!prof) throw new Error(`PROFISSIONAL_NAO_ENCONTRADO: ${s.profissional_id}`)

    await prisma.ag_socias.upsert({
      where: { profissional_id: s.profissional_id },
      update: { percentual: s.percentual, ativo: true },
      create: {
        empresa_id: empresaId,
        profissional_id: s.profissional_id,
        percentual: s.percentual,
        ativo: true,
      },
    })
  }

  return listarSocias(empresaId)
}