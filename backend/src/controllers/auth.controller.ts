import { FastifyRequest, FastifyReply } from 'fastify'
import { cadastrarEmpresa, login, alterarSenha } from '../services/auth.service'

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

/**
 * CONTROLLER: Alterar Senha
 * Recebe a senha atual para validação e a nova senha para atualização.
 */
export async function alterarSenhaController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { senhaAtual, novaSenha } = req.body as { senhaAtual: string; novaSenha: string }

    // 1. Validação básica de entrada
    if (!senhaAtual || !novaSenha) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDACAO',
          message: 'Senha atual e nova senha são obrigatórias.',
        },
      })
    }

    if (novaSenha.length < 6) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDACAO',
          message: 'A nova senha deve ter pelo menos 6 caracteres.',
        },
      })
    }

    // 2. Chama o serviço (req.usuario vem do middleware de autenticação)
    await alterarSenha(req.usuario.userId, senhaAtual, novaSenha)

    return reply.status(200).send({ 
      success: true, 
      message: 'Senha alterada com sucesso!' 
    })

  } catch (err: any) {
    // 3. Tratamento de erro específico para senha incorreta
    if (err.message === 'SENHA_ATUAL_INCORRETA') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'SENHA_ATUAL_INCORRETA',
          message: 'A senha atual informada está incorreta.',
        },
      })
    }

    // 4. Erro genérico
    return reply.status(500).send({
      success: false,
      error: { code: 'ERRO_INTERNO', message: 'Erro ao processar a troca de senha.' },
    })
  }
}