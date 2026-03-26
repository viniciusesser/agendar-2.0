import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import { listarServicos, criarServico, editarServico, deletarServico } from '../../services/servicos.service'

export async function servicosRoutes(app: FastifyInstance) {
  // Garante que todas as rotas de serviços precisem de login
  app.addHook('preHandler', autenticar)

  // Listar
  app.get('/servicos', async (req: FastifyRequest, reply: FastifyReply) => {
    const servicos = await listarServicos(req.usuario.empresaId)
    return reply.send({ success: true, data: servicos })
  })

  // Criar
  app.post('/servicos', async (req: FastifyRequest, reply: FastifyReply) => {
    const { nome, duracao_min, preco } = req.body as any
    
    // Validação simples mantida na rota
    if (!nome) {
      return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'nome é obrigatório.' } })
    }
    
    const servico = await criarServico(req.usuario.empresaId, { nome, duracao_min: duracao_min ?? 60, preco: preco ?? 0 })
    return reply.status(201).send({ success: true, data: servico })
  })

  // Editar (Sem try/catch! O Gerente de Erros cuida se o serviço não for encontrado)
  app.put('/servicos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    const servico = await editarServico(req.usuario.empresaId, id, req.body as any)
    return reply.send({ success: true, data: servico })
  })

  // Deletar (Sem try/catch! O Gerente de Erros cuida se o serviço não for encontrado)
  app.delete('/servicos/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    await deletarServico(req.usuario.empresaId, id)
    return reply.send({ success: true })
  })
}