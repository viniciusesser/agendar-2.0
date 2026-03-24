import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import {
  listarAgendamentosDia,
  criarAgendamento,
  atualizarStatus,
  cancelarAgendamento,
  criarBloqueio,
} from '../../services/agendamentos.service'

export async function agendamentosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Listar agendamentos do dia
  app.get('/agendamentos', async (req: FastifyRequest, reply: FastifyReply) => {
    const { data } = req.query as any
    if (!data) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'Parâmetro data é obrigatório. Ex: ?data=2026-03-24' } })
    const agendamentos = await listarAgendamentosDia(req.usuario.empresaId, data)
    return reply.send({ success: true, data: agendamentos })
  })

  // Criar agendamento
  app.post('/agendamentos', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body.cliente_id || !body.profissional_id || !body.servico_id || !body.data_hora_inicio) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'cliente_id, profissional_id, servico_id e data_hora_inicio são obrigatórios.' } })
      }
      const agendamento = await criarAgendamento(req.usuario.empresaId, body)
      return reply.status(201).send({ success: true, data: agendamento })
    } catch (e: any) {
      const erros: Record<string, number> = {
        AGENDAMENTO_CONFLITO: 409,
        PROFISSIONAL_BLOQUEADO: 409,
        SERVICO_NAO_ENCONTRADO: 404,
        PROFISSIONAL_NAO_ENCONTRADO: 404,
      }
      if (erros[e.message]) return reply.status(erros[e.message]).send({ success: false, error: { code: e.message, message: e.message } })
      throw e
    }
  })

  // Atualizar status
  app.patch('/agendamentos/:id/status', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const { status, forma_pagamento, version } = req.body as any
      if (!status || version === undefined) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'status e version são obrigatórios.' } })
      const agendamento = await atualizarStatus(req.usuario.empresaId, id, { status, forma_pagamento, version })
      return reply.send({ success: true, data: agendamento })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Agendamento não encontrado.' } })
      if (e.message === 'CONFLITO_EDICAO') return reply.status(409).send({ success: false, error: { code: 'CONFLITO_EDICAO', message: 'Este agendamento foi alterado por outro usuário. Recarregue.' } })
      if (e.message === 'STATUS_INVALIDO') return reply.status(400).send({ success: false, error: { code: 'STATUS_INVALIDO', message: 'Status inválido.' } })
      throw e
    }
  })

  // Cancelar agendamento
  app.delete('/agendamentos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      await cancelarAgendamento(req.usuario.empresaId, id)
      return reply.send({ success: true })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Agendamento não encontrado.' } })
      if (e.message === 'NAO_PODE_CANCELAR') return reply.status(400).send({ success: false, error: { code: 'NAO_PODE_CANCELAR', message: 'Agendamento finalizado não pode ser cancelado.' } })
      throw e
    }
  })

  // Criar bloqueio
  app.post('/bloqueios', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body.profissional_id || !body.data_hora_inicio || !body.data_hora_fim) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'profissional_id, data_hora_inicio e data_hora_fim são obrigatórios.' } })
      }
      const bloqueio = await criarBloqueio(req.usuario.empresaId, body)
      return reply.status(201).send({ success: true, data: bloqueio })
    } catch (e: any) {
      if (e.message === 'PROFISSIONAL_NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Profissional não encontrado.' } })
      throw e
    }
  })
}