import { FastifyInstance } from 'fastify'
import {
  cadastroController,
  loginController,
  refreshController,
  alterarSenhaController,
} from '../controllers/auth.controller'
import { autenticar } from '../middlewares/auth.middleware'

export async function authRoutes(app: FastifyInstance) {
  // ─── Rotas Públicas ───────────────────────────────────────────────────
  app.post('/auth/cadastro', cadastroController)
  app.post('/auth/login',    loginController)
  app.post('/auth/refresh',  refreshController) // ← usa cookie httpOnly

  // ─── Rotas Protegidas ─────────────────────────────────────────────────
  app.register(async (rotasProtegidas) => {
    rotasProtegidas.addHook('preHandler', autenticar)

    rotasProtegidas.get('/me', async (req, reply) => {
      return reply.send({ success: true, data: req.usuario })
    })

    rotasProtegidas.put('/alterar-senha', alterarSenhaController)
  })
}