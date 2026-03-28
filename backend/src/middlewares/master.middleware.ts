import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Middleware de proteção das rotas master.
 * Verifica se a requisição carrega a chave secreta master no header.
 * Adicione MASTER_SECRET_KEY no seu .env do backend.
 */
export async function autenticarMaster(req: FastifyRequest, reply: FastifyReply) {
  const chaveRecebida = req.headers['x-master-key']
  const chaveCorreta = process.env.MASTER_SECRET_KEY

  if (!chaveCorreta) {
    return reply.status(500).send({
      success: false,
      error: { code: 'CONFIG_ERROR', message: 'Chave master não configurada no servidor.' },
    })
  }

  if (!chaveRecebida || chaveRecebida !== chaveCorreta) {
    return reply.status(403).send({
      success: false,
      error: { code: 'ACESSO_NEGADO', message: 'Acesso negado.' },
    })
  }
}