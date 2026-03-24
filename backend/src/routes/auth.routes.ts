import { FastifyInstance } from 'fastify'
import { cadastroController, loginController } from '../controllers/auth.controller'
import { autenticar } from '../middlewares/auth.middleware'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/cadastro', cadastroController)
  app.post('/auth/login', loginController)

  app.get('/me', { preHandler: autenticar }, async (req, reply) => {
    return reply.send({ success: true, data: req.usuario })
  })
}