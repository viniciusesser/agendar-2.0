import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar } from '../middlewares/auth.middleware'
import { prisma } from '../lib/prisma'

export async function pushRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  app.post('/push/subscribe', async (req: FastifyRequest, reply: FastifyReply) => {
    const { endpoint, keys } = req.body as any

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDACAO', message: 'Subscription invalida.' },
      })
    }

    await prisma.ag_push_subscriptions.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        usuario_id: req.usuario.userId,
        empresa_id: req.usuario.empresaId,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        usuario_id: req.usuario.userId,
        empresa_id: req.usuario.empresaId,
      },
    })

    return reply.status(201).send({ success: true })
  })

  app.delete('/push/subscribe', async (req: FastifyRequest, reply: FastifyReply) => {
    const { endpoint } = req.body as any

    await prisma.ag_push_subscriptions.deleteMany({
      where: { endpoint, usuario_id: req.usuario.userId },
    })

    return reply.send({ success: true })
  })
}