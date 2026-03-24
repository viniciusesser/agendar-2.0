import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import { listarClientes, buscarClientePorId, criarCliente, editarCliente } from '../../services/clientes.service'

export async function clientesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/clientes', async (req: FastifyRequest, reply: FastifyReply) => {
    const { busca } = req.query as any
    const clientes = await listarClientes(req.usuario.empresaId, busca)
    return reply.send({ success: true, data: clientes })
  })

  app.get('/clientes/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const cliente = await buscarClientePorId(req.usuario.empresaId, id)
      return reply.send({ success: true, data: cliente })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Cliente não encontrado.' } })
      throw e
    }
  })

  app.post('/clientes', async (req: FastifyRequest, reply: FastifyReply) => {
    const { nome, telefone, aniversario, observacoes } = req.body as any
    if (!nome) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'nome é obrigatório.' } })
    const cliente = await criarCliente(req.usuario.empresaId, { nome, telefone, aniversario, observacoes })
    return reply.status(201).send({ success: true, data: cliente })
  })

  app.put('/clientes/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const cliente = await editarCliente(req.usuario.empresaId, id, req.body as any)
      return reply.send({ success: true, data: cliente })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Cliente não encontrado.' } })
      throw e
    }
  })
}