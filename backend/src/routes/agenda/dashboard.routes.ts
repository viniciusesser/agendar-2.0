import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../../middlewares/auth.middleware'
import { dashboardDia, dashboardMes } from '../../services/dashboard.service'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.get('/dashboard/dia', async (req: FastifyRequest, reply: FastifyReply) => {
    const { data } = req.query as any
    if (!data) return reply.status(400).send({
      success: false,
      error: { code: 'VALIDACAO', message: 'Parâmetro data é obrigatório. Ex: ?data=2026-03-24' },
    })
    const resultado = await dashboardDia(req.usuario.empresaId, data)
    return reply.send({ success: true, data: resultado })
  })

  app.get('/dashboard/mes', async (req: FastifyRequest, reply: FastifyReply) => {
    const { ano, mes } = req.query as any
    if (!ano || !mes) return reply.status(400).send({
      success: false,
      error: { code: 'VALIDACAO', message: 'Parâmetros ano e mes são obrigatórios. Ex: ?ano=2026&mes=3' },
    })
    const resultado = await dashboardMes(req.usuario.empresaId, Number(ano), Number(mes))
    return reply.send({ success: true, data: resultado })
  })
}