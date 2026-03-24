import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticar, exigirPerfil } from '../../middlewares/auth.middleware'
import {
  listarConfiguracoes,
  salvarConfiguracao,
  salvarMultiplasConfiguracoes,
  listarSocias,
  salvarSocias,
} from '../../services/configuracoes.service'

export async function configuracoesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticar)

  // Listar todas as configurações (qualquer perfil)
  app.get('/configuracoes', async (req: FastifyRequest, reply: FastifyReply) => {
    const configs = await listarConfiguracoes(req.usuario.empresaId)
    return reply.send({ success: true, data: configs })
  })

  // Salvar uma configuração (só dono)
  app.put('/configuracoes/:chave', { preHandler: exigirPerfil('dono') }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { chave } = req.params as any
      const { valor } = req.body as any
      if (valor === undefined) return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'valor é obrigatório.' } })
      const config = await salvarConfiguracao(req.usuario.empresaId, chave, String(valor))
      return reply.send({ success: true, data: config })
    } catch (e: any) {
      if (e.message === 'CHAVE_INVALIDA') return reply.status(400).send({ success: false, error: { code: 'CHAVE_INVALIDA', message: 'Chave de configuração inválida.' } })
      throw e
    }
  })

  // Salvar múltiplas configurações de uma vez (só dono)
  app.put('/configuracoes', { preHandler: exigirPerfil('dono') }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any
      if (!body || typeof body !== 'object') return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'Body deve ser um objeto com as configurações.' } })
      const configs = await salvarMultiplasConfiguracoes(req.usuario.empresaId, body)
      return reply.send({ success: true, data: configs })
    } catch (e: any) {
      if (e.message?.startsWith('CHAVE_INVALIDA')) return reply.status(400).send({ success: false, error: { code: 'CHAVE_INVALIDA', message: e.message } })
      throw e
    }
  })

  // Listar sócias
  app.get('/socias', async (req: FastifyRequest, reply: FastifyReply) => {
    const socias = await listarSocias(req.usuario.empresaId)
    return reply.send({ success: true, data: socias })
  })

  // Salvar sócias (só dono)
  app.put('/socias', { preHandler: exigirPerfil('dono') }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { socias } = req.body as any
      if (!socias || !Array.isArray(socias) || socias.length === 0) {
        return reply.status(400).send({ success: false, error: { code: 'VALIDACAO', message: 'socias deve ser um array com pelo menos uma entrada.' } })
      }
      const resultado = await salvarSocias(req.usuario.empresaId, socias)
      return reply.send({ success: true, data: resultado })
    } catch (e: any) {
      if (e.message === 'PERCENTUAL_INVALIDO') return reply.status(400).send({ success: false, error: { code: 'PERCENTUAL_INVALIDO', message: 'A soma dos percentuais deve ser exatamente 100%.' } })
      if (e.message?.startsWith('PROFISSIONAL_NAO_ENCONTRADO')) return reply.status(404).send({ success: false, error: { code: 'NAO_ENCONTRADO', message: e.message } })
      throw e
    }
  })
}