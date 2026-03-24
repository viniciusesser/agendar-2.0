import { prisma } from '../lib/prisma'

export async function listarClientes(empresaId: string, busca?: string) {
  return prisma.ag_clientes.findMany({
    where: {
      empresa_id: empresaId,
      deleted_at: null,
      ...(busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { telefone: { contains: busca } },
        ],
      } : {}),
    },
    orderBy: { nome: 'asc' },
  })
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