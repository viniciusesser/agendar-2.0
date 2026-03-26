import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import {
  listarAgendamentosDia,
  criarAgendamento,
  atualizarStatusSimples,
  finalizarCheckout,
  cancelarAgendamento,
  criarBloqueio,
} from '../../services/agendamentos.service'

export async function agendamentosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Listar agendamentos do dia
  app.get('/agendamentos', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data } = req.query as any
      if (!data) {
        return reply.status(400).send({ 
          success: false, 
          error: { code: 'VALIDACAO', message: 'Parâmetro data é obrigatório. Ex: ?data=2026-03-24' } 
        })
      }
      const agendamentos = await listarAgendamentosDia(req.usuario.empresaId, data)
      return reply.send({ success: true, data: agendamentos })
    } catch (e: any) {
      throw e
    }
  })

  // Criar agendamento
  app.post('/agendamentos', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body.cliente_id || !body.profissional_id || !body.servico_id || !body.data_hora_inicio) {
        return reply.status(400).send({ 
          success: false, 
          error: { code: 'VALIDACAO', message: 'cliente_id, profissional_id, servico_id e data_hora_inicio são obrigatórios.' } 
        })
      }
      const agendamento = await criarAgendamento(req.usuario.empresaId, body)
      return reply.status(201).send({ success: true, data: agendamento })
    } catch (e: any) {
      const erros: Record<string, number> = {
        HORARIO_PASSADO: 400,
        AGENDAMENTO_CONFLITO: 409,
        PROFISSIONAL_BLOQUEADO: 409,
        SERVICO_NAO_ENCONTRADO: 404,
        PROFISSIONAL_NAO_ENCONTRADO: 404,
      }
      
      if (erros[e.message]) {
        const mensagemErro = e.message === 'HORARIO_PASSADO' 
          ? 'Não é possível agendar em um horário que já passou.' 
          : e.message
          
        return reply.status(erros[e.message]).send({ 
          success: false, 
          error: { code: e.message, message: mensagemErro } 
        })
      }
      throw e
    }
  })

  // Atualizar status (SIMPLES - Para confirmar, iniciar atendimento, falta)
  app.patch('/agendamentos/:id/status', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;
      const { status } = req.body as any; 
      
      // Log de depuração para verificar o que chega no servidor
      console.log(`[LOG] Atualizando status do agendamento ${id} para: ${status}`);

      if (!status) {
        return reply.status(400).send({ 
          success: false, 
          error: { message: 'O campo status é obrigatório.' } 
        });
      }

      const resultado = await atualizarStatusSimples(req.usuario.empresaId, id, status);
      return reply.send({ success: true, data: resultado });
    } catch (e: any) {
      console.error(`[ERRO] Falha ao atualizar status:`, e.message);
      if (e.message === 'STATUS_INVALIDO') {
        return reply.status(400).send({ success: false, error: { message: 'Status inválido para o sistema.' } });
      }
      if (e.message === 'NAO_ENCONTRADO') {
        return reply.status(404).send({ success: false, error: { message: 'Agendamento não encontrado.' } });
      }
      throw e;
    }
  });

  // ==========================================
  // CHECKOUT COMPLETO (FINALIZAR COM PAGAMENTO/FIADO)
  // ==========================================
  app.post('/agendamentos/:id/checkout', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any;
      const body = req.body as any; 
      
      if (!body.forma_pagamento) {
        return reply.status(400).send({ 
          success: false, 
          error: { message: 'Forma de pagamento é obrigatória para o checkout.' } 
        });
      }

      const resultado = await finalizarCheckout(req.usuario.empresaId, id, body);
      return reply.status(200).send({ success: true, data: resultado });

    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { message: 'Agendamento não encontrado.' } });
      if (e.message === 'JA_FINALIZADO') return reply.status(400).send({ success: false, error: { message: 'Este agendamento já foi pago e finalizado.' } });
      if (e.message === 'ESTOQUE_INSUFICIENTE') return reply.status(400).send({ success: false, error: { message: 'Estoque insuficiente para um dos produtos da comanda.' } });
      
      console.error(`[ERRO CHECKOUT]`, e);
      throw e;
    }
  });

  // Cancelar agendamento
  app.delete('/agendamentos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      await cancelarAgendamento(req.usuario.empresaId, id)
      return reply.send({ success: true })
    } catch (e: any) {
      if (e.message === 'NAO_PODE_CANCELAR') {
        return reply.status(400).send({ 
          success: false, 
          error: { code: 'NAO_PODE_CANCELAR', message: 'Agendamento finalizado não pode ser cancelado.' } 
        })
      }
      throw e
    }
  })

  // Criar bloqueio
  app.post('/bloqueios', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body.profissional_id || !body.data_hora_inicio || !body.data_hora_fim) {
        return reply.status(400).send({ 
          success: false, 
          error: { code: 'VALIDACAO', message: 'profissional_id, data_hora_inicio e data_hora_fim são obrigatórios.' } 
        })
      }
      const bloqueio = await criarBloqueio(req.usuario.empresaId, body)
      return reply.status(201).send({ success: true, data: bloqueio })
    } catch (e: any) {
      if (e.message === 'PROFISSIONAL_NAO_ENCONTRADO') {
        return reply.status(404).send({ 
          success: false, 
          error: { code: 'NAO_ENCONTRADO', message: 'Profissional não encontrado.' } 
        })
      }
      throw e
    }
  })
}