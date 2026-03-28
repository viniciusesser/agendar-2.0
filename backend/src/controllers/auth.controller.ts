import { FastifyRequest, FastifyReply } from 'fastify'
import { cadastrarEmpresa, login, refreshAccessToken, alterarSenha } from '../services/auth.service'

const COOKIE_OPTIONS = {
  httpOnly: true,       // Não acessível por JavaScript — imune a XSS
  secure: true,         // Só enviado em HTTPS
  sameSite: 'none' as const, // Necessário para cross-origin (Vercel → Render)
  path: '/api/agendar/auth/refresh',
  maxAge: 60 * 60 * 24 * 30, // 30 dias em segundos
}

// ─── CADASTRO ─────────────────────────────────────────────────────────────
export async function cadastroController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { nome_salao, nome_usuario, email, senha, telefone } = req.body as any

    if (!nome_salao || !nome_usuario || !email || !senha) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDACAO', message: 'Todos os campos obrigatórios devem ser preenchidos.' },
      })
    }

    const resultado = await cadastrarEmpresa({ nome_salao, nome_usuario, email, senha, telefone })

    // Salva o refresh token em cookie httpOnly
    reply.setCookie('refreshToken', resultado.refreshToken, COOKIE_OPTIONS)

    return reply.status(201).send({
      success: true,
      data: {
        token:   resultado.token,
        usuario: resultado.usuario,
        empresa: resultado.empresa,
      },
    })
  } catch (err: any) {
    if (err.message === 'EMAIL_JA_CADASTRADO') {
      return reply.status(409).send({
        success: false,
        error: { code: 'EMAIL_JA_CADASTRADO', message: 'Este e-mail já está cadastrado.' },
      })
    }
    throw err
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────
export async function loginController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, senha } = req.body as any

    if (!email || !senha) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDACAO', message: 'E-mail e senha são obrigatórios.' },
      })
    }

    const resultado = await login(email, senha)

    // Salva o refresh token em cookie httpOnly
    reply.setCookie('refreshToken', resultado.refreshToken, COOKIE_OPTIONS)

    return reply.send({
      success: true,
      data: {
        token:   resultado.token,
        usuario: resultado.usuario,
        empresa: resultado.empresa,
      },
    })
  } catch (err: any) {
    const erros: Record<string, [number, string]> = {
      CREDENCIAIS_INVALIDAS: [401, 'E-mail ou senha incorretos.'],
      USUARIO_INATIVO:       [403, 'Usuário inativo. Entre em contato com o administrador.'],
      EMPRESA_INATIVA:       [403, 'Salão bloqueado. Entre em contato com o suporte.'],
    }
    if (erros[err.message]) {
      const [status, message] = erros[err.message]
      return reply.status(status).send({ success: false, error: { code: err.message, message } })
    }
    throw err
  }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────
export async function refreshController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const refreshToken = (req.cookies as any)?.refreshToken

    if (!refreshToken) {
      return reply.status(401).send({
        success: false,
        error: { code: 'NAO_AUTORIZADO', message: 'Refresh token não encontrado.' },
      })
    }

    const resultado = await refreshAccessToken(refreshToken)

    // Rotaciona o refresh token — emite um novo cookie
    reply.setCookie('refreshToken', resultado.refreshToken, COOKIE_OPTIONS)

    return reply.send({ success: true, data: { token: resultado.token } })
  } catch (err: any) {
    // Limpa o cookie inválido
    reply.clearCookie('refreshToken', { path: '/api/agendar/auth/refresh' })

    return reply.status(401).send({
      success: false,
      error: { code: 'NAO_AUTORIZADO', message: 'Sessão expirada. Faça login novamente.' },
    })
  }
}

// ─── ALTERAR SENHA ────────────────────────────────────────────────────────
export async function alterarSenhaController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { senhaAtual, novaSenha } = req.body as { senhaAtual: string; novaSenha: string }

    if (!senhaAtual || !novaSenha) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDACAO', message: 'Senha atual e nova senha são obrigatórias.' },
      })
    }
    if (novaSenha.length < 6) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDACAO', message: 'A nova senha deve ter pelo menos 6 caracteres.' },
      })
    }

    await alterarSenha(req.usuario.userId, senhaAtual, novaSenha)
    return reply.status(200).send({ success: true, message: 'Senha alterada com sucesso!' })
  } catch (err: any) {
    if (err.message === 'SENHA_ATUAL_INCORRETA') {
      return reply.status(400).send({
        success: false,
        error: { code: 'SENHA_ATUAL_INCORRETA', message: 'A senha atual informada está incorreta.' },
      })
    }
    throw err
  }
}