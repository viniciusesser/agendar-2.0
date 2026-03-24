import { prisma } from '../lib/prisma'

export async function listarServicos(empresaId: string) {
  return prisma.ag_servicos.findMany({
    where: { empresa_id: empresaId, deleted_at: null },
    orderBy: { nome: 'asc' },
  })
}

export async function criarServico(empresaId: string, dados: {
  nome: string
  duracao_min: number
  preco: number
}) {
  return prisma.ag_servicos.create({
    data: {
      empresa_id: empresaId,
      nome: dados.nome,
      duracao_min: dados.duracao_min,
      preco: dados.preco,
    },
  })
}

export async function editarServico(empresaId: string, servicoId: string, dados: {
  nome?: string
  duracao_min?: number
  preco?: number
  ativo?: boolean
}) {
  const servico = await prisma.ag_servicos.findFirst({
    where: { id: servicoId, empresa_id: empresaId, deleted_at: null },
  })

  if (!servico) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_servicos.update({
    where: { id: servicoId },
    data: dados,
  })
}

export async function deletarServico(empresaId: string, servicoId: string) {
  const servico = await prisma.ag_servicos.findFirst({
    where: { id: servicoId, empresa_id: empresaId, deleted_at: null },
  })

  if (!servico) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_servicos.update({
    where: { id: servicoId },
    data: { deleted_at: new Date() },
  })
}