import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import {
  relatorioDia,
  criarLancamento,
  vendaAvulsa,
  finalizarAgendamentoComFinanceiro,
} from '../../services/financeiro.service'

export async function financeiroRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Relatório do dia
  app.get('/financeiro/dia', async (req: FastifyRequest, reply: FastifyReply) => {
    const { data } = req.query as any
    if (!data) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'Parâmetro data é obrigatório. Ex: ?data=2026-03-24' } })
    const relatorio = await relatorioDia(req.usuario.empresaId, data)
    return reply.send({ success: true, data: relatorio })
  })

  // Lançamento manual (Sem try/catch, apenas validação inicial)
  app.post('/financeiro', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    if (!body.tipo || !body.valor) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'tipo e valor são obrigatórios.' } })
    }
    const lancamento = await criarLancamento(req.usuario.empresaId, body)
    return reply.status(201).send({ success: true, data: lancamento })
  })

  // Venda avulsa (Sem try/catch, apenas validação inicial)
  app.post('/financeiro/venda-avulsa', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any
    if (!body.descricao || !body.valor || !body.forma_pagamento) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'descricao, valor e forma_pagamento são obrigatórios.' } })
    }
    const lancamento = await vendaAvulsa(req.usuario.empresaId, body)
    return reply.status(201).send({ success: true, data: lancamento })
  })

  // Finalizar agendamento com geração financeira
  app.post('/financeiro/finalizar/:agendamentoId', async (req: FastifyRequest, reply: FastifyReply) => {
    // Aqui mantemos o try/catch apenas para tratar lógicas de negócio MUITO específicas do financeiro
    // que fogem do CRUD padrão, como "JA_FINALIZADO" ou "CONFLITO_EDICAO", garantindo uma
    // resposta elegante que ainda não está no Gerente Global.
    try {
      const { agendamentoId } = req.params as any
      const { forma_pagamento, version } = req.body as any
      if (!forma_pagamento || version === undefined) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'forma_pagamento e version são obrigatórios.' } })
      }
      const agendamento = await finalizarAgendamentoComFinanceiro(req.usuario.empresaId, agendamentoId, forma_pagamento, version)
      return reply.send({ success: true, data: agendamento })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Agendamento não encontrado.' } })
      if (e.message === 'CONFLITO_EDICAO') return reply.status(409).send({ success: false, error: { code: 'CONFLITO_EDICAO', message: 'Agendamento foi alterado por outro usuário. Recarregue.' } })
      if (e.message === 'JA_FINALIZADO') return reply.status(400).send({ success: false, error: { code: 'JA_FINALIZADO', message: 'Agendamento já foi finalizado.' } })
      throw e
    }
  })
}