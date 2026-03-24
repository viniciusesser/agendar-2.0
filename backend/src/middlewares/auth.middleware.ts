import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: string
  empresaId: string
  perfil: string
}

declare module 'fastify' {
  interface FastifyRequest {
    usuario: TokenPayload
  }
}

export async function autenticar(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'NAO_AUTORIZADO',
        message: 'Token não fornecido.',
      },
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    req.usuario = payload
  } catch {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'NAO_AUTORIZADO',
        message: 'Token inválido ou expirado.',
      },
    })
  }
}

export function exigirPerfil(...perfis: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!perfis.includes(req.usuario.perfil)) {
      return reply.status(403).send({
        success: false,
        error: {
          code: 'SEM_PERMISSAO',
          message: 'Você não tem permissão para acessar este recurso.',
        },
      })
    }
  }
}