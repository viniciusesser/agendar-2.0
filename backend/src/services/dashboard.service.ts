import { prisma } from '../lib/prisma'

export async function dashboardDia(empresaId: string, data: string) {
  const inicio = new Date(`${data}T00:00:00.000Z`)
  const fim = new Date(`${data}T23:59:59.999Z`)

  const [
    agendamentos,
    lancamentos,
    alertasEstoque,
    aniversariantes,
  ] = await Promise.all([
    // Agendamentos do dia
    prisma.ag_agendamentos.findMany({
      where: {
        empresa_id: empresaId,
        deleted_at: null,
        data_hora_inicio: { gte: inicio, lte: fim },
      },
      include: { cliente: true, profissional: true, servico: true },
      orderBy: { data_hora_inicio: 'asc' },
    }),

    // Lançamentos financeiros do dia
    prisma.ag_financeiro.findMany({
      where: {
        empresa_id: empresaId,
        data: { gte: inicio, lte: fim },
      },
      include: {
        divisoes: {
          include: { profissional: true },
        },
      },
    }),

    // Alertas de estoque
    prisma.ag_estoque.findMany({
      where: { empresa_id: empresaId, deleted_at: null },
    }),

    // Aniversariantes do dia
    prisma.ag_clientes.findMany({
      where: { empresa_id: empresaId, deleted_at: null, aniversario: { not: null } },
      select: { id: true, nome: true, telefone: true, aniversario: true },
    }),
  ])

  // Métricas financeiras
  const entradas = lancamentos.filter(l => l.tipo === 'entrada')
  const saidas = lancamentos.filter(l => l.tipo === 'saida')
  const totalEntradas = entradas.reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = saidas.reduce((s, l) => s + Number(l.valor), 0)

  const finalizados = agendamentos.filter(a => a.status === 'finalizado')
  const ticketMedio = finalizados.length > 0 ? totalEntradas / finalizados.length : 0

  // Ocupação da agenda
  const totalSlots = agendamentos.filter(a => a.status !== 'nao_compareceu' && a.status !== 'cancelado')
  const ocupacao = agendamentos.length > 0 ? (finalizados.length / totalSlots.length) * 100 : 0

  // Taxa de no-show
  const naoCompareceu = agendamentos.filter(a => a.status === 'nao_compareceu').length
  const taxaNoShow = agendamentos.length > 0 ? (naoCompareceu / agendamentos.length) * 100 : 0

  // Comissões do dia por profissional
  const comissoes: Record<string, { nome: string; valor: number }> = {}
  for (const l of lancamentos) {
    for (const d of l.divisoes) {
      if (d.tipo === 'comissao') {
        if (!comissoes[d.profissional_id]) {
          comissoes[d.profissional_id] = { nome: d.profissional.nome, valor: 0 }
        }
        comissoes[d.profissional_id].valor += Number(d.valor)
      }
    }
  }

  // Estoque abaixo do mínimo
  const estoqueAlerta = alertasEstoque.filter(
    p => Number(p.quantidade) <= Number(p.estoque_minimo)
  )

  // Aniversariantes do dia
  const hoje = new Date(data)
  const aniversariantesHoje = aniversariantes.filter(c => {
    if (!c.aniversario) return false
    const aniv = new Date(c.aniversario)
    return aniv.getDate() === hoje.getDate() && aniv.getMonth() === hoje.getMonth()
  })

  // Próximos agendamentos (pendentes)
  const proximos = agendamentos.filter(a =>
    ['agendado', 'confirmado', 'em_atendimento'].includes(a.status)
  )

  return {
    data,
    financeiro: {
      total_entradas: totalEntradas,
      total_saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas,
      ticket_medio: Number(ticketMedio.toFixed(2)),
      atendimentos_finalizados: finalizados.length,
    },
    agenda: {
      total_agendamentos: agendamentos.length,
      finalizados: finalizados.length,
      pendentes: proximos.length,
      nao_compareceu: naoCompareceu,
      taxa_no_show: Number(taxaNoShow.toFixed(1)),
      ocupacao_pct: Number(ocupacao.toFixed(1)),
      proximos,
    },
    comissoes: Object.entries(comissoes).map(([id, c]) => ({
      profissional_id: id,
      nome: c.nome,
      valor: Number(c.valor.toFixed(2)),
    })),
    alertas: {
      estoque_baixo: estoqueAlerta,
      aniversariantes: aniversariantesHoje,
    },
  }
}

export async function dashboardMes(empresaId: string, ano: number, mes: number) {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1))
  const fim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59))

  const [lancamentos, agendamentos] = await Promise.all([
    prisma.ag_financeiro.findMany({
      where: {
        empresa_id: empresaId,
        data: { gte: inicio, lte: fim },
      },
      include: {
        divisoes: { include: { profissional: true } },
      },
    }),
    prisma.ag_agendamentos.findMany({
      where: {
        empresa_id: empresaId,
        deleted_at: null,
        data_hora_inicio: { gte: inicio, lte: fim },
      },
      include: { profissional: true },
    }),
  ])

  const entradas = lancamentos.filter(l => l.tipo === 'entrada')
  const saidas = lancamentos.filter(l => l.tipo === 'saida')
  const totalEntradas = entradas.reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = saidas.reduce((s, l) => s + Number(l.valor), 0)
  const finalizados = agendamentos.filter(a => a.status === 'finalizado')

  // Faturamento por profissional
  const porProfissional: Record<string, { nome: string; faturamento: number; atendimentos: number; comissao: number }> = {}
  for (const a of finalizados) {
    const pid = a.profissional_id
    if (!porProfissional[pid]) {
      porProfissional[pid] = { nome: a.profissional.nome, faturamento: 0, atendimentos: 0, comissao: 0 }
    }
    porProfissional[pid].faturamento += Number(a.valor)
    porProfissional[pid].atendimentos += 1
    porProfissional[pid].comissao += Number(a.comissao_valor)
  }

  // Participação das sócias
  const porSocia: Record<string, { nome: string; valor: number }> = {}
  for (const l of lancamentos) {
    for (const d of l.divisoes) {
      if (d.tipo === 'participacao_socia') {
        if (!porSocia[d.profissional_id]) {
          porSocia[d.profissional_id] = { nome: d.profissional.nome, valor: 0 }
        }
        porSocia[d.profissional_id].valor += Number(d.valor)
      }
    }
  }

  return {
    periodo: { ano, mes },
    financeiro: {
      total_entradas: Number(totalEntradas.toFixed(2)),
      total_saidas: Number(totalSaidas.toFixed(2)),
      saldo: Number((totalEntradas - totalSaidas).toFixed(2)),
      ticket_medio: finalizados.length > 0 ? Number((totalEntradas / finalizados.length).toFixed(2)) : 0,
      atendimentos: finalizados.length,
    },
    por_profissional: Object.entries(porProfissional).map(([id, p]) => ({
      profissional_id: id,
      ...p,
      faturamento: Number(p.faturamento.toFixed(2)),
      comissao: Number(p.comissao.toFixed(2)),
    })),
    socias: Object.entries(porSocia).map(([id, s]) => ({
      profissional_id: id,
      nome: s.nome,
      valor: Number(s.valor.toFixed(2)),
    })),
  }
}