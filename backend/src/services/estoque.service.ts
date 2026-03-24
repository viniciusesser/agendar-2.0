import { prisma } from '../lib/prisma'

export async function listarEstoque(empresaId: string) {
  return prisma.ag_estoque.findMany({
    where: { empresa_id: empresaId, deleted_at: null },
    orderBy: { nome: 'asc' },
  })
}

export async function alertasEstoque(empresaId: string) {
  const produtos = await prisma.ag_estoque.findMany({
    where: { empresa_id: empresaId, deleted_at: null },
  })

  return produtos.filter(p => Number(p.quantidade) <= Number(p.estoque_minimo))
}

export async function criarProduto(empresaId: string, dados: {
  nome: string
  quantidade?: number
  unidade?: string
  rendimento_est?: number
  estoque_minimo?: number
}) {
  return prisma.ag_estoque.create({
    data: {
      empresa_id: empresaId,
      nome: dados.nome,
      quantidade: dados.quantidade ?? 0,
      unidade: dados.unidade ?? 'un',
      rendimento_est: dados.rendimento_est,
      estoque_minimo: dados.estoque_minimo ?? 0,
    },
  })
}

export async function editarProduto(empresaId: string, produtoId: string, dados: {
  nome?: string
  unidade?: string
  rendimento_est?: number
  estoque_minimo?: number
}) {
  const produto = await prisma.ag_estoque.findFirst({
    where: { id: produtoId, empresa_id: empresaId, deleted_at: null },
  })
  if (!produto) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_estoque.update({
    where: { id: produtoId },
    data: dados,
  })
}

export async function deletarProduto(empresaId: string, produtoId: string) {
  const produto = await prisma.ag_estoque.findFirst({
    where: { id: produtoId, empresa_id: empresaId, deleted_at: null },
  })
  if (!produto) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_estoque.update({
    where: { id: produtoId },
    data: { deleted_at: new Date() },
  })
}

export async function registrarMovimentacao(empresaId: string, produtoId: string, dados: {
  tipo: string
  quantidade: number
  motivo?: string
  agendamento_id?: string
}) {
  if (!['entrada', 'saida'].includes(dados.tipo)) throw new Error('TIPO_INVALIDO')
  if (dados.quantidade <= 0) throw new Error('QUANTIDADE_INVALIDA')

  const produto = await prisma.ag_estoque.findFirst({
    where: { id: produtoId, empresa_id: empresaId, deleted_at: null },
  })
  if (!produto) throw new Error('NAO_ENCONTRADO')

  if (dados.tipo === 'saida' && Number(produto.quantidade) < dados.quantidade) {
    throw new Error('ESTOQUE_INSUFICIENTE')
  }

  const novaQtd = dados.tipo === 'entrada'
    ? Number(produto.quantidade) + dados.quantidade
    : Number(produto.quantidade) - dados.quantidade

  const [produtoAtualizado, movimentacao] = await prisma.$transaction([
    prisma.ag_estoque.update({
      where: { id: produtoId },
      data: { quantidade: novaQtd },
    }),
    prisma.ag_estoque_movimentacoes.create({
      data: {
        empresa_id: empresaId,
        produto_id: produtoId,
        tipo: dados.tipo,
        quantidade: dados.quantidade,
        motivo: dados.motivo,
        agendamento_id: dados.agendamento_id,
      },
    }),
  ])

  return { produto: produtoAtualizado, movimentacao }
}

export async function historicoMovimentacoes(empresaId: string, produtoId: string) {
  const produto = await prisma.ag_estoque.findFirst({
    where: { id: produtoId, empresa_id: empresaId, deleted_at: null },
  })
  if (!produto) throw new Error('NAO_ENCONTRADO')

  const movimentacoes = await prisma.ag_estoque_movimentacoes.findMany({
    where: { produto_id: produtoId, empresa_id: empresaId },
    orderBy: { data: 'desc' },
    take: 50,
  })

  return { produto, movimentacoes }
}