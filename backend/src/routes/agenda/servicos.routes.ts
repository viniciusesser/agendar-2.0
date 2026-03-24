import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import { listarServicos, criarServico, editarServico, deletarServico } from '../../services/servicos.service'

export async function servicosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/servicos', async (req: FastifyRequest, reply: FastifyReply) => {
    const servicos = await listarServicos(req.usuario.empresaId)
    return reply.send({ success: true, data: servicos })
  })

  app.post('/servicos', async (req: FastifyRequest, reply: FastifyReply) => {
    const { nome, duracao_min, preco } = req.body as any
    if (!nome) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'nome é obrigatório.' } })
    const servico = await criarServico(req.usuario.empresaId, { nome, duracao_min: duracao_min ?? 60, preco: preco ?? 0 })
    return reply.status(201).send({ success: true, data: servico })
  })

  app.put('/servicos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const servico = await editarServico(req.usuario.empresaId, id, req.body as any)
      return reply.send({ success: true, data: servico })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Serviço não encontrado.' } })
      throw e
    }
  })

  app.delete('/servicos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      await deletarServico(req.usuario.empresaId, id)
      return reply.send({ success: true })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Serviço não encontrado.' } })
      throw e
    }
  })
}