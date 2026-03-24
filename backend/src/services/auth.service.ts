import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

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

  if (emailExiste) {
    throw new Error('EMAIL_JA_CADASTRADO')
  }

  const senha_hash = await bcrypt.hash(dados.senha, 10)

  const empresa = await prisma.ag_empresas.create({
    data: {
      nome: dados.nome_salao,
      telefone: dados.telefone,
      plano: 'free',
    },
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
    data: {
      empresa_id: empresa.id,
      usuario_id: usuario.id,
      nome: dados.nome_usuario,
    },
  })

  const token = jwt.sign(
    {
      userId: usuario.id,
      empresaId: empresa.id,
      perfil: usuario.perfil,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
    empresa: {
      id: empresa.id,
      nome: empresa.nome,
      plano: empresa.plano,
    },
  }
}

export async function login(email: string, senha: string) {
  const usuario = await prisma.ag_usuarios.findUnique({
    where: { email },
    include: { empresa: true },
  })

  if (!usuario) {
    throw new Error('CREDENCIAIS_INVALIDAS')
  }

  if (!usuario.ativo || usuario.deleted_at) {
    throw new Error('USUARIO_INATIVO')
  }

  if (!usuario.empresa.ativo) {
    throw new Error('EMPRESA_INATIVA')
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

  if (!senhaCorreta) {
    throw new Error('CREDENCIAIS_INVALIDAS')
  }

  const token = jwt.sign(
    {
      userId: usuario.id,
      empresaId: usuario.empresa_id,
      perfil: usuario.perfil,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
    empresa: {
      id: usuario.empresa.id,
      nome: usuario.empresa.nome,
      plano: usuario.empresa.plano,
    },
  }
}