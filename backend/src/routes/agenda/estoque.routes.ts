import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import {
  listarEstoque,
  alertasEstoque,
  criarProduto,
  editarProduto,
  deletarProduto,
  registrarMovimentacao,
  historicoMovimentacoes,
  registrarVendaDireta,
} from '../../services/estoque.service'

export async function estoqueRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Listar Estoque
  app.get('/estoque', async (req: FastifyRequest, reply: FastifyReply) => {
    const produtos = await listarEstoque(req.usuario.empresaId)
    return reply.send({ success: true, data: produtos })
  })

  // Alertas de Estoque
  app.get('/estoque/alertas', async (req: FastifyRequest, reply: FastifyReply) => {
    const alertas = await alertasEstoque(req.usuario.empresaId)
    return reply.send({ success: true, data: alertas })
  })

  // Histórico (Sem try/catch! Gerente cuida do NAO_ENCONTRADO)
  app.get('/estoque/:id/historico', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    const historico = await historicoMovimentacoes(req.usuario.empresaId, id)
    return reply.send({ success: true, data: historico })
  })

  // Criar Produto
  app.post('/estoque', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    if (!body.nome) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'nome é obrigatório.' } })
    const produto = await criarProduto(req.usuario.empresaId, body)
    return reply.status(201).send({ success: true, data: produto })
  })

  // Editar Produto (Sem try/catch! Gerente cuida do NAO_ENCONTRADO)
  app.put('/estoque/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    const produto = await editarProduto(req.usuario.empresaId, id, req.body as any)
    return reply.send({ success: true, data: produto })
  })

  // Deletar Produto (Sem try/catch! Gerente cuida do NAO_ENCONTRADO)
  app.delete('/estoque/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    await deletarProduto(req.usuario.empresaId, id)
    return reply.send({ success: true })
  })

  // Movimentação (Mantemos o try/catch por causa do erro ESTOQUE_INSUFICIENTE e validações vitais)
  app.post('/estoque/:id/movimentacao', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const body = req.body as any
      if (!body.tipo || !body.quantidade) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'tipo e quantidade são obrigatórios.' } })
      }
      const resultado = await registrarMovimentacao(req.usuario.empresaId, id, body)
      return reply.status(201).send({ success: true, data: resultado })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Produto não encontrado.' } })
      if (e.message === 'ESTOQUE_INSUFICIENTE') return reply.status(400).send({ success: false, error: { code: 'ESTOQUE_INSUFICIENTE', message: 'Quantidade insuficiente em estoque.' } })
      if (e.message === 'TIPO_INVALIDO') return reply.status(400).send({ success: false, error: { code: 'TIPO_INVALIDO', message: 'tipo deve ser entrada ou saida.' } })
      if (e.message === 'QUANTIDADE_INVALIDA') return reply.status(400).send({ success: false, error: { code: 'QUANTIDADE_INVALIDA', message: 'quantidade deve ser maior que zero.' } })
      throw e
    }
  })

  // ==========================================
  // NOVO: VENDA DIRETA (PDV)
  // ==========================================
  app.post('/estoque/venda-direta', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      
      // Validação simples
      if (!body.cliente_id || !body.produto_id || !body.quantidade || !body.valor_total || !body.forma_pagamento) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'Todos os campos de venda são obrigatórios.' } })
      }

      // Passa a bola para o service fazer a mágica no banco
      const resultado = await registrarVendaDireta(req.usuario.empresaId, body)
      return reply.status(201).send({ success: true, data: resultado })
      
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Produto não encontrado.' } })
      if (e.message === 'ESTOQUE_INSUFICIENTE') return reply.status(400).send({ success: false, error: { code: 'ESTOQUE_INSUFICIENTE', message: 'Quantidade insuficiente em estoque.' } })
      if (e.message === 'QUANTIDADE_INVALIDA') return reply.status(400).send({ success: false, error: { code: 'QUANTIDADE_INVALIDA', message: 'quantidade deve ser maior que zero.' } })
      throw e
    }
  })
}