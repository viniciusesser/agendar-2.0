import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET         = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

// ─── HELPERS ──────────────────────────────────────────────────────────────

function gerarAccessToken(userId: string, empresaId: string, perfil: string) {
  return jwt.sign({ userId, empresaId, perfil }, JWT_SECRET, { expiresIn: '15m' })
}

function gerarRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' })
}

// ─── CADASTRO ─────────────────────────────────────────────────────────────

export async function cadastrarEmpresa(dados: {
  nome_salao: string
  nome_usuario: string
  email: string
  senha: string
  telefone?: string
}) {
  const emailExiste = await prisma.ag_usuarios.findUnique({
    where: { email: dados.email },
  })
  if (emailExiste) throw new Error('EMAIL_JA_CADASTRADO')

  const senha_hash = await bcrypt.hash(dados.senha, 10)

  const empresa = await prisma.ag_empresas.create({
    data: { nome: dados.nome_salao, telefone: dados.telefone, plano: 'free' },
  })

  const usuario = await prisma.ag_usuarios.create({
    data: {
      empresa_id: empresa.id,
      nome: dados.nome_usuario,
      email: dados.email,
      senha_hash,
      perfil: 'dono',
    },
  })

  await prisma.ag_profissionais.create({
    data: { empresa_id: empresa.id, usuario_id: usuario.id, nome: dados.nome_usuario },
  })

  return {
    token:        gerarAccessToken(usuario.id, empresa.id, usuario.perfil),
    refreshToken: gerarRefreshToken(usuario.id),
    usuario: {
      id: usuario.id, nome: usuario.nome,
      email: usuario.email, perfil: usuario.perfil,
    },
    empresa: { id: empresa.id, nome: empresa.nome, plano: empresa.plano },
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────

export async function login(email: string, senha: string) {
  const usuario = await prisma.ag_usuarios.findUnique({
    where: { email },
    include: { empresa: true },
  })

  if (!usuario)                          throw new Error('CREDENCIAIS_INVALIDAS')
  if (!usuario.ativo || usuario.deleted_at) throw new Error('USUARIO_INATIVO')
  if (!usuario.empresa.ativo)            throw new Error('EMPRESA_INATIVA')

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)
  if (!senhaCorreta) throw new Error('CREDENCIAIS_INVALIDAS')

  // Vacina de auto-reparo
  const profissionalExiste = await prisma.ag_profissionais.findFirst({
    where: { usuario_id: usuario.id, empresa_id: usuario.empresa_id, deleted_at: null },
  })
  if (!profissionalExiste) {
    await prisma.ag_profissionais.create({
      data: { empresa_id: usuario.empresa_id, usuario_id: usuario.id, nome: usuario.nome },
    })
    console.log(`[AUTO-REPARO] Perfil criado para: ${usuario.nome}`)
  }

  return {
    token:        gerarAccessToken(usuario.id, usuario.empresa_id, usuario.perfil),
    refreshToken: gerarRefreshToken(usuario.id),
    usuario: {
      id: usuario.id, nome: usuario.nome,
      email: usuario.email, perfil: usuario.perfil,
    },
    empresa: {
      id: usuario.empresa.id, nome: usuario.empresa.nome, plano: usuario.empresa.plano,
    },
  }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  let payload: any
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
  } catch {
    throw new Error('REFRESH_TOKEN_INVALIDO')
  }

  const usuario = await prisma.ag_usuarios.findUnique({
    where: { id: payload.userId },
    include: { empresa: true },
  })

  if (!usuario || !usuario.ativo || usuario.deleted_at) throw new Error('USUARIO_INATIVO')
  if (!usuario.empresa.ativo) throw new Error('EMPRESA_INATIVA')

  return {
    token: gerarAccessToken(usuario.id, usuario.empresa_id, usuario.perfil),
    // Retorna um novo refresh token (rotação — invalida o anterior implicitamente)
    refreshToken: gerarRefreshToken(usuario.id),
  }
}

// ─── ALTERAR SENHA ────────────────────────────────────────────────────────

export async function alterarSenha(userId: string, senhaAtual: string, novaSenha: string) {
  const usuario = await prisma.ag_usuarios.findUnique({ where: { id: userId } })
  if (!usuario) throw new Error('USUARIO_NAO_ENCONTRADO')

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash)
  if (!senhaCorreta) throw new Error('SENHA_ATUAL_INCORRETA')

  const nova_senha_hash = await bcrypt.hash(novaSenha, 10)
  return prisma.ag_usuarios.update({
    where: { id: userId },
    data: { senha_hash: nova_senha_hash },
  })
}