import { prisma } from '../lib/prisma'
import crypto from 'node:crypto'

export async function listarProfissionais(empresaId: string) {
  return prisma.ag_profissionais.findMany({
    where: { empresa_id: empresaId, deleted_at: null },
    include: { comissoes_servico: { include: { servico: true } } },
    orderBy: { nome: 'asc' },
  })
}

export async function criarProfissional(empresaId: string, dados: { nome: string, cor?: string, comissao_pct?: number, comissao_produto_pct?: number }) {
  return prisma.ag_profissionais.create({
    data: {
      empresa_id: empresaId,
      nome: dados.nome,
      cor: dados.cor,
      comissao_pct: dados.comissao_pct ?? 0,
      comissao_produto_pct: dados.comissao_produto_pct ?? 0,
    },
  })
}

export async function editarProfissional(empresaId: string, profissionalId: string, dados: {
  nome?: string
  cor?: string
  comissao_pct?: number
  comissao_produto_pct?: number
  ativo?: boolean
}) {
  const prof = await prisma.ag_profissionais.findFirst({
    where: { id: profissionalId, empresa_id: empresaId, deleted_at: null },
  })
  if (!prof) throw new Error('NAO_ENCONTRADO')

  return prisma.ag_profissionais.update({
    where: { id: profissionalId },
    data: dados,
  })
}

export async function definirComissaoServico(empresaId: string, dados: {
  profissional_id: string
  servico_id: string
  comissao_pct: number
}) {
  const prof = await prisma.ag_profissionais.findFirst({
    where: { id: dados.profissional_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!prof) throw new Error('PROFISSIONAL_NAO_ENCONTRADO')

  const servico = await prisma.ag_servicos.findFirst({
    where: { id: dados.servico_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!servico) throw new Error('SERVICO_NAO_ENCONTRADO')

  return prisma.ag_servico_comissao.upsert({
    where: {
      profissional_id_servico_id: {
        profissional_id: dados.profissional_id,
        servico_id: dados.servico_id,
      },
    },
    update: { comissao_pct: dados.comissao_pct },
    create: {
      empresa_id: empresaId,
      profissional_id: dados.profissional_id,
      servico_id: dados.servico_id,
      comissao_pct: dados.comissao_pct,
    },
  })
}

export async function relatorioProfissional(empresaId: string, profissionalId: string, mes: number, ano: number) {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1))
  const fim = new Date(Date.UTC(ano, mes, 0, 23, 59, 59))

  const prof = await prisma.ag_profissionais.findFirst({
    where: { id: profissionalId, empresa_id: empresaId, deleted_at: null },
  })
  if (!prof) throw new Error('NAO_ENCONTRADO')

  const agendamentos = await prisma.ag_agendamentos.findMany({
    where: {
      profissional_id: profissionalId,
      empresa_id: empresaId,
      deleted_at: null,
      status: 'finalizado',
      finalizado_em: { gte: inicio, lte: fim },
    },
    include: { servico: true, cliente: true },
    orderBy: { data_hora_inicio: 'asc' },
  })

  const faturamento = agendamentos.reduce((s, a) => s + Number(a.valor), 0)
  const comissao = agendamentos.reduce((s, a) => s + Number(a.comissao_valor), 0)

  return {
    profissional: { id: prof.id, nome: prof.nome },
    periodo: { mes, ano },
    atendimentos: agendamentos.length,
    faturamento: Number(faturamento.toFixed(2)),
    comissao: Number(comissao.toFixed(2)),
    historico: agendamentos,
  }
}

export async function gerarConvite(empresaId: string, dados: {
  email?: string
  perfil?: string
}) {
  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
  const expira_em = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return prisma.ag_convites.create({
    data: {
      empresa_id: empresaId,
      token,
      email: dados.email,
      perfil: dados.perfil ?? 'funcionario',
      expira_em,
    },
  })
}

export async function usarConvite(token: string, dados: {
  nome: string
  email: string
  senha: string
}) {
  const bcrypt = await import('bcryptjs')
  const jwt = await import('jsonwebtoken')

  const convite = await prisma.ag_convites.findUnique({ where: { token } })

  if (!convite) throw new Error('TOKEN_INVALIDO')
  if (convite.usado) throw new Error('TOKEN_USADO')
  if (new Date() > convite.expira_em) throw new Error('TOKEN_EXPIRADO')

  const emailExiste = await prisma.ag_usuarios.findUnique({ where: { email: dados.email } })
  if (emailExiste) throw new Error('EMAIL_JA_CADASTRADO')

  const senha_hash = await bcrypt.default.hash(dados.senha, 10)

  const [usuario] = await prisma.$transaction([
    prisma.ag_usuarios.create({
      data: {
        empresa_id: convite.empresa_id,
        nome: dados.nome,
        email: dados.email,
        senha_hash,
        perfil: convite.perfil,
      },
    }),
    prisma.ag_convites.update({
      where: { token },
      data: { usado: true },
    }),
  ])

  await prisma.ag_profissionais.create({
    data: {
      empresa_id: convite.empresa_id,
      usuario_id: usuario.id,
      nome: dados.nome,
    },
  })

  const tokenJwt = jwt.default.sign(
    { userId: usuario.id, empresaId: convite.empresa_id, perfil: usuario.perfil },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  )

  return { token: tokenJwt, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } }
}

// NOVA FUNÇÃO: Soft Delete do Profissional E Bloqueio de Acesso
export async function excluirProfissional(empresaId: string, profissionalId: string) {
  const prof = await prisma.ag_profissionais.findFirst({
    where: { id: profissionalId, empresa_id: empresaId, deleted_at: null },
  })
  
  if (!prof) throw new Error('NAO_ENCONTRADO')

  // O $transaction garante que se uma atualização falhar, a outra é desfeita.
  return prisma.$transaction(async (tx) => {
    // 1. Remove o profissional da Agenda e da Equipe
    const profissionalInativado = await tx.ag_profissionais.update({
      where: { id: profissionalId },
      data: { deleted_at: new Date() },
    })

    // 2. Se a pessoa tinha um login de acesso ao app, bloqueia o usuário também
    if (profissionalInativado.usuario_id) {
      // Usamos uma tentativa de update (updateMany) caso a tabela de usuários 
      // não tenha o ID explícito ou para evitar erros se o usuário já tiver sido deletado
      await tx.ag_usuarios.updateMany({
        where: { id: profissionalInativado.usuario_id },
        // Presumindo que sua tabela de usuários tenha o campo deleted_at ou ativo
        data: { deleted_at: new Date() } 
      })
    }

    return profissionalInativado;
  })
}