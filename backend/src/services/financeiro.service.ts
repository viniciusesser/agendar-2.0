import { prisma } from '../lib/prisma'

export async function relatorioDia(empresaId: string, data: string) {
  const inicio = new Date(`${data}T00:00:00.000Z`)
  const fim = new Date(`${data}T23:59:59.999Z`)

  const lancamentos = await prisma.ag_financeiro.findMany({
    where: {
      empresa_id: empresaId,
      data: { gte: inicio, lte: fim },
    },
    include: { cliente: true, divisoes: { include: { profissional: true } } },
    orderBy: { data: 'asc' },
  })

  const entradas = lancamentos.filter(l => l.tipo === 'entrada')
  const saidas = lancamentos.filter(l => l.tipo === 'saida')

  const totalEntradas = entradas.reduce((s, l) => s + Number(l.valor), 0)
  const totalSaidas = saidas.reduce((s, l) => s + Number(l.valor), 0)

  const agendamentosFinalizados = await prisma.ag_agendamentos.count({
    where: {
      empresa_id: empresaId,
      deleted_at: null,
      status: 'finalizado',
      finalizado_em: { gte: inicio, lte: fim },
    },
  })

  const ticketMedio = agendamentosFinalizados > 0
    ? totalEntradas / agendamentosFinalizados
    : 0

  return {
    data,
    total_entradas: totalEntradas,
    total_saidas: totalSaidas,
    saldo: totalEntradas - totalSaidas,
    ticket_medio: ticketMedio,
    atendimentos: agendamentosFinalizados,
    lancamentos,
  }
}

export async function criarLancamento(empresaId: string, dados: {
  tipo: string
  origem: string
  valor: number
  descricao?: string
  forma_pagamento?: string
  cliente_id?: string
  data?: string // <-- Adicionado para o frontend
}) {
  if (!['entrada', 'saida'].includes(dados.tipo)) throw new Error('TIPO_INVALIDO')
  if (dados.valor <= 0) throw new Error('VALOR_INVALIDO')

  return prisma.ag_financeiro.create({
    data: {
      empresa_id: empresaId,
      tipo: dados.tipo,
      origem: dados.origem ?? 'manual',
      valor: dados.valor,
      descricao: dados.descricao,
      forma_pagamento: dados.forma_pagamento,
      cliente_id: dados.cliente_id,
      data: dados.data ? new Date(dados.data) : undefined, // <-- Salva com a data escolhida
    },
  })
}

export async function vendaAvulsa(empresaId: string, dados: {
  descricao: string
  valor: number
  forma_pagamento: string
  cliente_id?: string
}) {
  if (dados.valor <= 0) throw new Error('VALOR_INVALIDO')

  const lancamento = await prisma.ag_financeiro.create({
    data: {
      empresa_id: empresaId,
      tipo: 'entrada',
      origem: 'venda_avulsa',
      valor: dados.valor,
      descricao: dados.descricao,
      forma_pagamento: dados.forma_pagamento,
      cliente_id: dados.cliente_id,
    },
  })

  // Se fiado, incrementa débito do cliente
  if (dados.forma_pagamento === 'fiado' && dados.cliente_id) {
    await prisma.ag_clientes.update({
      where: { id: dados.cliente_id },
      data: { debito: { increment: dados.valor } },
    })
  }

  return lancamento
}

export async function finalizarAgendamentoComFinanceiro(
  empresaId: string,
  agendamentoId: string,
  forma_pagamento: string,
  version: number
) {
  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
    include: { profissional: true, cliente: true, servico: true },
  })

  if (!agendamento) throw new Error('NAO_ENCONTRADO')
  if (agendamento.version !== version) throw new Error('CONFLITO_EDICAO')
  if (agendamento.status === 'finalizado') throw new Error('JA_FINALIZADO')

  const valor = Number(agendamento.valor)
  const comissao_pct = Number(agendamento.comissao_pct)
  const comissao_valor = valor * (comissao_pct / 100)
  const liquido = valor - comissao_valor

  // Busca sócias
  const socias = await prisma.ag_socias.findMany({
    where: { empresa_id: empresaId, ativo: true },
  })

  await prisma.$transaction(async (tx) => {
    // Atualiza status do agendamento
    await tx.ag_agendamentos.update({
      where: { id: agendamentoId },
      data: {
        status: 'finalizado',
        forma_pagamento,
        finalizado_em: new Date(),
        version: { increment: 1 },
      },
    })

    // Se fiado, incrementa débito
    if (forma_pagamento === 'fiado') {
      await tx.ag_clientes.update({
        where: { id: agendamento.cliente_id },
        data: { debito: { increment: valor } },
      })
    }

    // Cria lançamento financeiro
    const lancamento = await tx.ag_financeiro.create({
      data: {
        empresa_id: empresaId,
        tipo: 'entrada',
        origem: 'agendamento',
        valor,
        descricao: `${agendamento.servico.nome} — ${agendamento.cliente.nome}`,
        forma_pagamento,
        cliente_id: agendamento.cliente_id,
        agendamento_id: agendamentoId,
      },
    })

    // Divisão: comissão do profissional
    if (comissao_valor > 0) {
      await tx.ag_financeiro_divisao.create({
        data: {
          empresa_id: empresaId,
          financeiro_id: lancamento.id,
          profissional_id: agendamento.profissional_id,
          tipo: 'comissao',
          percentual: comissao_pct,
          valor: comissao_valor,
        },
      })
    }

    // Divisão: participação das sócias no líquido
    for (const socia of socias) {
      const valor_socia = liquido * (Number(socia.percentual) / 100)
      await tx.ag_financeiro_divisao.create({
        data: {
          empresa_id: empresaId,
          financeiro_id: lancamento.id,
          profissional_id: socia.profissional_id,
          tipo: 'participacao_socia',
          percentual: socia.percentual,
          valor: valor_socia,
        },
      })
    }
  })

  return prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId },
    include: { cliente: true, profissional: true, servico: true },
  })
}