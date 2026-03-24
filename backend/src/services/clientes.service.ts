import { prisma } from '../lib/prisma'

export async function listarClientes(empresaId: string, busca?: string, pagina = 1, limite = 20) {
  const skip = (pagina - 1) * limite
  const where = {
    empresa_id: empresaId,
    deleted_at: null,
    ...(busca ? {
      OR: [
        { nome: { contains: busca, mode: 'insensitive' as const } },
        { telefone: { contains: busca } },
      ],
    } : {}),
  }

  const [clientes, total] = await Promise.all([
    prisma.ag_clientes.findMany({
      where,
      orderBy: { nome: 'asc' },
      skip,
      take: limite,
    }),
    prisma.ag_clientes.count({ where }),
  ])

  return { clientes, total, pagina, limite, paginas: Math.ceil(total / limite) }
}

export async function buscarClientePorId(empresaId: string, clienteId: string) {
  const cliente = await prisma.ag_clientes.findFirst({
    where: { id: clienteId, empresa_id: empresaId, deleted_at: null },
    include: {
      agendamentos: {
        where: { deleted_at: null },
        orderBy: { data_hora_inicio: 'desc' },
        take: 20,
        include: { servico: true, profissional: true },
      },
      financeiro: {
        orderBy: { data: 'desc' },
        take: 20,
      },
    },
  })

  if (!cliente) throw new Error('NAO_ENCONTRADO')
  return cliente
}

export async function criarCliente(empresaId: string, dados: {
  nome: string
  telefone?: string
  aniversario?: string
  observacoes?: string
}) {
  return prisma.ag_clientes.create({
    data: {
      empresa_id: empresaId,
      nome: dados.nome,
      telefone: dados.telefone,
      aniversario: dados.aniversario ? new Date(dados.aniversario) : null,
      observacoes: dados.observacoes,
    },
  })
}

export async function editarCliente(empresaId: string, clienteId: string, dados: {
  nome?: string
  telefone?: string
  aniversario?: string
  observacoes?: string
}) {
  const cliente = await prisma.ag_clientes.findFirst({
    where: { id: clienteId, empresa_id: empresaId, deleted_at: null },
  })

  if (!cliente) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_clientes.update({
    where: { id: clienteId },
    data: {
      ...dados,
      aniversario: dados.aniversario ? new Date(dados.aniversario) : undefined,
    },
  })
}

export async function aniversariantesDaSemana(empresaId: string) {
  const hoje = new Date()
  const clientes = await prisma.ag_clientes.findMany({
    where: { empresa_id: empresaId, deleted_at: null, aniversario: { not: null } },
    select: { id: true, nome: true, telefone: true, aniversario: true },
  })

  return clientes.filter(c => {
    if (!c.aniversario) return false
    const aniv = new Date(c.aniversario)
    for (let i = 0; i <= 7; i++) {
      const dia = new Date(hoje)
      dia.setDate(hoje.getDate() + i)
      if (aniv.getDate() === dia.getDate() && aniv.getMonth() === dia.getMonth()) return true
    }
    return false
  }).map(c => {
    const aniv = new Date(c.aniversario!)
    const hoje2 = new Date()
    const ehHoje = aniv.getDate() === hoje2.getDate() && aniv.getMonth() === hoje2.getMonth()
    return { ...c, eh_hoje: ehHoje }
  })
}

export async function quitarFiado(empresaId: string, clienteId: string, valor: number) {
  const cliente = await prisma.ag_clientes.findFirst({
    where: { id: clienteId, empresa_id: empresaId, deleted_at: null },
  })

  if (!cliente) throw new Error('NAO_ENCONTRADO')
  if (Number(cliente.debito) <= 0) throw new Error('SEM_DEBITO')
  if (valor <= 0) throw new Error('VALOR_INVALIDO')

  const novoDebito = Math.max(0, Number(cliente.debito) - valor)

  const [clienteAtualizado, lancamento] = await prisma.$transaction([
    prisma.ag_clientes.update({
      where: { id: clienteId },
      data: { debito: novoDebito },
    }),
    prisma.ag_financeiro.create({
      data: {
        empresa_id: empresaId,
        tipo: 'entrada',
        origem: 'fiado_quitado',
        valor,
        descricao: `Quitação de fiado — ${cliente.nome}`,
        forma_pagamento: 'dinheiro',
        cliente_id: clienteId,
      },
    }),
  ])

  return { cliente: clienteAtualizado, lancamento }
}