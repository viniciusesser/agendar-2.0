import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  editarCliente,
  aniversariantesDaSemana,
  quitarFiado,
} from '../../services/clientes.service'

export async function clientesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Listar Clientes
  app.get('/clientes', async (req: FastifyRequest, reply: FastifyReply) => {
    const { busca, pagina, limite } = req.query as any
    const resultado = await listarClientes(req.usuario.empresaId, busca, Number(pagina) || 1, Number(limite) || 20)
    return reply.send({ success: true, data: resultado })
  })

  // Aniversariantes
  app.get('/clientes/aniversariantes', async (req: FastifyRequest, reply: FastifyReply) => {
    const lista = await aniversariantesDaSemana(req.usuario.empresaId)
    return reply.send({ success: true, data: lista })
  })

  // Buscar Cliente por ID (Sem try/catch! Gerente cuida do NAO_ENCONTRADO)
  app.get('/clientes/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    const cliente = await buscarClientePorId(req.usuario.empresaId, id)
    return reply.send({ success: true, data: cliente })
  })

  // Criar Cliente
  app.post('/clientes', async (req: FastifyRequest, reply: FastifyReply) => {
    const { nome, telefone, aniversario, observacoes } = req.body as any
    if (!nome) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'nome é obrigatório.' } })
    const cliente = await criarCliente(req.usuario.empresaId, { nome, telefone, aniversario, observacoes })
    return reply.status(201).send({ success: true, data: cliente })
  })

  // Editar Cliente (Sem try/catch! Gerente cuida do NAO_ENCONTRADO)
  app.put('/clientes/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any
    const cliente = await editarCliente(req.usuario.empresaId, id, req.body as any)
    return reply.send({ success: true, data: cliente })
  })

  // Quitar Fiado (Mantido o try/catch por conta das regras específicas "SEM_DEBITO" e "VALOR_INVALIDO")
  app.post('/clientes/:id/quitar-fiado', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const { valor } = req.body as any
      if (!valor) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'valor é obrigatório.' } })
      const resultado = await quitarFiado(req.usuario.empresaId, id, Number(valor))
      return reply.send({ success: true, data: resultado })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Cliente não encontrado.' } })
      if (e.message === 'SEM_DEBITO') return reply.status(400).send({ success: false, error: { code: 'SEM_DEBITO', message: 'Cliente não possui débito.' } })
      if (e.message === 'VALOR_INVALIDO') return reply.status(400).send({ success: false, error: { code: 'VALOR_INVALIDO', message: 'Valor deve ser maior que zero.' } })
      throw e
    }
  })
}