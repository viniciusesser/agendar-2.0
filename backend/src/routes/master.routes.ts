import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { autenticarMaster } from '../middlewares/master.middleware'
import { prisma } from '../lib/prisma'

export async function masterRoutes(app: FastifyInstance) {
  // Todas as rotas master exigem a chave secreta
  app.addHook('preHandler', autenticarMaster)

  // ─── LISTAR TODOS OS SALÕES ────────────────────────────────────────────────
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
          select: { usuarios: true, agendamentos: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    })

    return reply.send({ success: true, data: saloes })
  })

  // ─── ATIVAR / BLOQUEAR ACESSO ─────────────────────────────────────────────
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
        error: { code: 'NAO_ENCONTRADO', message: 'Salão não encontrado.' },
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
}