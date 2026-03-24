import { prisma } from '../lib/prisma'

export async function listarAgendamentosDia(empresaId: string, data: string) {
  const inicio = new Date(`${data}T00:00:00.000Z`)
  const fim = new Date(`${data}T23:59:59.999Z`)

  return prisma.ag_agendamentos.findMany({
    where: {
      empresa_id: empresaId,
      deleted_at: null,
      data_hora_inicio: { gte: inicio, lte: fim },
    },
    include: {
      cliente: true,
      profissional: true,
      servico: true,
    },
    orderBy: { data_hora_inicio: 'asc' },
  })
}

export async function criarAgendamento(empresaId: string, dados: {
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_hora_inicio: string
  duracao_min?: number
  valor?: number
  observacoes?: string
}) {
  const servico = await prisma.ag_servicos.findFirst({
    where: { id: dados.servico_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!servico) throw new Error('SERVICO_NAO_ENCONTRADO')

  const profissional = await prisma.ag_profissionais.findFirst({
    where: { id: dados.profissional_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!profissional) throw new Error('PROFISSIONAL_NAO_ENCONTRADO')

  const duracao = dados.duracao_min ?? servico.duracao_min
  const valor = dados.valor ?? Number(servico.preco)
  const inicio = new Date(dados.data_hora_inicio)
  const fim = new Date(inicio.getTime() + duracao * 60 * 1000)

  // Verifica conflito com outro agendamento
  const conflito = await prisma.ag_agendamentos.findFirst({
    where: {
      profissional_id: dados.profissional_id,
      deleted_at: null,
      status: { notIn: ['cancelado', 'nao_compareceu'] },
      AND: [
        { data_hora_inicio: { lt: fim } },
        { data_hora_fim: { gt: inicio } },
      ],
    },
  })
  if (conflito) throw new Error('AGENDAMENTO_CONFLITO')

  // Verifica bloqueio
  const bloqueio = await prisma.ag_bloqueios.findFirst({
    where: {
      profissional_id: dados.profissional_id,
      AND: [
        { data_hora_inicio: { lt: fim } },
        { data_hora_fim: { gt: inicio } },
      ],
    },
  })
  if (bloqueio) throw new Error('PROFISSIONAL_BLOQUEADO')

  const comissao_pct = Number(profissional.comissao_pct)
  const comissao_valor = valor * (comissao_pct / 100)

  return prisma.ag_agendamentos.create({
    data: {
      empresa_id: empresaId,
      cliente_id: dados.cliente_id,
      profissional_id: dados.profissional_id,
      servico_id: dados.servico_id,
      data_hora_inicio: inicio,
      data_hora_fim: fim,
      duracao_min: duracao,
      valor,
      comissao_pct,
      comissao_valor,
      observacoes: dados.observacoes,
    },
    include: { cliente: true, profissional: true, servico: true },
  })
}

export async function atualizarStatus(empresaId: string, agendamentoId: string, dados: {
  status: string
  forma_pagamento?: string
  version: number
}) {
  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
  })

  if (!agendamento) throw new Error('NAO_ENCONTRADO')

  // Lock otimista
  if (agendamento.version !== dados.version) throw new Error('CONFLITO_EDICAO')

  const statusValidos = ['agendado', 'confirmado', 'em_atendimento', 'finalizado', 'nao_compareceu']
  if (!statusValidos.includes(dados.status)) throw new Error('STATUS_INVALIDO')

  return prisma.ag_agendamentos.update({
    where: { id: agendamentoId },
    data: {
      status: dados.status,
      forma_pagamento: dados.forma_pagamento,
      version: { increment: 1 },
      finalizado_em: dados.status === 'finalizado' ? new Date() : undefined,
    },
    include: { cliente: true, profissional: true, servico: true },
  })
}

export async function cancelarAgendamento(empresaId: string, agendamentoId: string) {
  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
  })

  if (!agendamento) throw new Error('NAO_ENCONTRADO')
  if (agendamento.status === 'finalizado') throw new Error('NAO_PODE_CANCELAR')

  return prisma.ag_agendamentos.update({
    where: { id: agendamentoId },
    data: { deleted_at: new Date() },
  })
}

export async function criarBloqueio(empresaId: string, dados: {
  profissional_id: string
  data_hora_inicio: string
  data_hora_fim: string
  motivo?: string
}) {
  const profissional = await prisma.ag_profissionais.findFirst({
    where: { id: dados.profissional_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!profissional) throw new Error('PROFISSIONAL_NAO_ENCONTRADO')

  return prisma.ag_bloqueios.create({
    data: {
      empresa_id: empresaId,
      profissional_id: dados.profissional_id,
      data_hora_inicio: new Date(dados.data_hora_inicio),
      data_hora_fim: new Date(dados.data_hora_fim),
      motivo: dados.motivo,
    },
  })
}