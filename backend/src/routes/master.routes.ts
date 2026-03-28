import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticarMaster } from '../middlewares/master.middleware'
import { prisma } from '../lib/prisma'

export async function masterRoutes(app: FastifyInstance) {
  app.addHook('preHandler', autenticarMaster)

  // LISTAR TODOS OS SALOES (com usuarios)
  app.get('/master/saloes', async (req: FastifyRequest, reply: FastifyReply) => {
    const saloes = await prisma.ag_empresas.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        nome: true,
        telefone: true,
        plano: true,
        plano_validade: true,
        ativo: true,
        criado_em: true,
        _count: {
          select: {
            usuarios: { where: { deleted_at: null, ativo: true } },
            agendamentos: true,
          },
        },
        usuarios: {
          where: { deleted_at: null },
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            criado_em: true,
          },
          orderBy: { criado_em: 'asc' },
        },
      },
      orderBy: { criado_em: 'desc' },
    })

    return reply.send({ success: true, data: saloes })
  })

  // ATIVAR / BLOQUEAR / EDITAR PLANO DO SALAO
  app.patch('/master/saloes/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string }
    const { ativo, plano, plano_validade } = req.body as {
      ativo?: boolean
      plano?: string
      plano_validade?: string | null
    }

    const empresa = await prisma.ag_empresas.findUnique({ where: { id } })
    if (!empresa) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NAO_ENCONTRADO', message: 'Salao nao encontrado.' },
      })
    }

    const atualizado = await prisma.ag_empresas.update({
      where: { id },
      data: {
        ...(ativo !== undefined && { ativo }),
        ...(plano !== undefined && { plano }),
        ...(plano_validade !== undefined && {
          plano_validade: plano_validade ? new Date(plano_validade) : null,
        }),
      },
    })

    return reply.send({ success: true, data: atualizado })
  })

  // ATIVAR / BLOQUEAR USUARIO INDIVIDUAL
  app.patch('/master/usuarios/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string }
    const { ativo } = req.body as { ativo: boolean }

    const usuario = await prisma.ag_usuarios.findUnique({ where: { id } })
    if (!usuario) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NAO_ENCONTRADO', message: 'Usuario nao encontrado.' },
      })
    }

    await prisma.ag_usuarios.update({
      where: { id },
      data: {
        ativo,
        deleted_at: ativo ? null : usuario.deleted_at,
      },
    })

    await prisma.ag_profissionais.updateMany({
      where: { usuario_id: id },
      data: {
        ativo,
        deleted_at: ativo ? null : new Date(),
      },
    })

    return reply.send({ success: true })
  })
}