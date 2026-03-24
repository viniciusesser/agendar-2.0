import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar, exigirPerfil } from '../../middlewares/auth.middleware'
import {
  listarProfissionais,
  editarProfissional,
  definirComissaoServico,
  relatorioProfissional,
  gerarConvite,
  usarConvite,
} from '../../services/profissionais.service'

export async function profissionaisRoutes(app: FastifyInstance) {

  // Rota pública — usar convite (não precisa de token)
  app.post('/convites/usar', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, nome, email, senha } = req.body as any
      if (!token || !nome || !email || !senha) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'token, nome, email e senha são obrigatórios.' } })
      }
      const resultado = await usarConvite(token, { nome, email, senha })
      return reply.status(201).send({ success: true, data: resultado })
    } catch (e: any) {
      const erros: Record<string, [number, string]> = {
        TOKEN_INVALIDO:      [404, 'Link de convite inválido.'],
        TOKEN_USADO:         [400, 'Este link já foi utilizado.'],
        TOKEN_EXPIRADO:      [400, 'Este link expirou. Solicite um novo convite.'],
        EMAIL_JA_CADASTRADO: [409, 'Este e-mail já está cadastrado.'],
      }
      if (erros[e.message]) {
        const [status, message] = erros[e.message]
        return reply.status(status).send({ success: false, error: { code: e.message, message } })
      }
      throw e
    }
  })

  // Rotas autenticadas
  app.addHook('preHandler', autenticar)

  app.get('/profissionais', async (req: FastifyRequest, reply: FastifyReply) => {
    const lista = await listarProfissionais(req.usuario.empresaId)
    return reply.send({ success: true, data: lista })
  })

  app.put('/profissionais/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const prof = await editarProfissional(req.usuario.empresaId, id, req.body as any)
      return reply.send({ success: true, data: prof })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Profissional não encontrado.' } })
      throw e
    }
  })

  app.post('/profissionais/comissao-servico', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body.profissional_id || !body.servico_id || body.comissao_pct === undefined) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'profissional_id, servico_id e comissao_pct são obrigatórios.' } })
      }
      const comissao = await definirComissaoServico(req.usuario.empresaId, body)
      return reply.send({ success: true, data: comissao })
    } catch (e: any) {
      if (e.message === 'PROFISSIONAL_NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Profissional não encontrado.' } })
      if (e.message === 'SERVICO_NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Serviço não encontrado.' } })
      throw e
    }
  })

  app.get('/profissionais/:id/relatorio', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as any
      const { mes, ano } = req.query as any
      if (!mes || !ano) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'mes e ano são obrigatórios.' } })
      const relatorio = await relatorioProfissional(req.usuario.empresaId, id, Number(mes), Number(ano))
      return reply.send({ success: true, data: relatorio })
    } catch (e: any) {
      if (e.message === 'NAO_ENCONTRADO') return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: 'Profissional não encontrado.' } })
      throw e
    }
  })

  // Gerar convite — só dono e admin
  app.post('/convites', { preHandler: exigirPerfil('dono', 'admin') }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, perfil } = req.body as any
    const convite = await gerarConvite(req.usuario.empresaId, { email, perfil })
    const link = `${process.env.APP_URL ?? 'http://localhost:3000'}/convite/${convite.token}`
    return reply.status(201).send({ success: true, data: { ...convite, link } })
  })
}