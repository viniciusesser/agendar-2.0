import { FastifyRequest, FastifyReply } from 'fastify'
import { cadastrarEmpresa, login } from '../services/auth.service'

export async function cadastroController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { nome_salao, nome_usuario, email, senha, telefone } = req.body as {
      nome_salao: string
      nome_usuario: string
      email: string
      senha: string
      telefone?: string
    }

    if (!nome_salao || !nome_usuario || !email || !senha) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDACAO',
          message: 'nome_salao, nome_usuario, email e senha são obrigatórios.',
        },
      })
    }

    if (senha.length < 6) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDACAO',
          message: 'A senha deve ter pelo menos 6 caracteres.',
        },
      })
    }

    const resultado = await cadastrarEmpresa({
      nome_salao,
      nome_usuario,
      email,
      senha,
      telefone,
    })

    return reply.status(201).send({ success: true, data: resultado })
  } catch (err: any) {
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'EMAIL_JA_CADASTRADO',
          message: 'Este e-mail já está cadastrado.',
        },
      })
    }

    return reply.status(500).send({
      success: false,
      error: { code: 'ERRO_INTERNO', message: 'Erro interno do servidor.' },
    })
  }
}

export async function loginController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { email, senha } = req.body as { email: string; senha: string }

    if (!email || !senha) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDACAO',
          message: 'email e senha são obrigatórios.',
        },
      })
    }

    const resultado = await login(email, senha)

    return reply.status(200).send({ success: true, data: resultado })
  } catch (err: any) {
    if (
      err.message === 'CREDENCIAIS_INVALIDAS' ||
      err.message === 'USUARIO_INATIVO' ||
      err.message === 'EMPRESA_INATIVA'
    ) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'NAO_AUTORIZADO',
          message: 'E-mail ou senha incorretos.',
        },
      })
    }

    return reply.status(500).send({
      success: false,
      error: { code: 'ERRO_INTERNO', message: 'Erro interno do servidor.' },
    })
  }
}