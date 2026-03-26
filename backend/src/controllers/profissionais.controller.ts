import { FastifyRequest, FastifyReply } from 'fastify'
import { 
  listarProfissionais, 
  criarProfissional, 
  editarProfissional, 
  excluirProfissional,
  definirComissaoServico,
  relatorioProfissional,
  gerarConvite,
  usarConvite
} from '../services/profissionais.service'

// Interface para garantir que o TypeScript saiba que o usuário está logado
interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string
    empresaId: string
    perfil: string
  }
}

export async function listarController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId

    const dados = await listarProfissionais(empresaId)
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: { message: 'Erro interno do servidor.' } })
  }
}

export async function criarController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const body = req.body as { nome: string; cor?: string; comissao_pct?: number; comissao_produto_pct?: number }

    if (!body.nome) {
      return reply.status(400).send({ success: false, error: { message: 'O nome é obrigatório.' } })
    }

    const dados = await criarProfissional(empresaId, body)
    return reply.status(201).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: { message: 'Erro ao criar profissional.' } })
  }
}

export async function editarController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const params = req.params as { id: string }
    const body = req.body as { nome?: string; cor?: string; comissao_pct?: number; comissao_produto_pct?: number; ativo?: boolean }

    if (!params.id) {
      return reply.status(400).send({ success: false, error: { message: 'ID do profissional é obrigatório.' } })
    }

    const dados = await editarProfissional(empresaId, params.id, body)
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    if (err.message === 'NAO_ENCONTRADO') {
      return reply.status(404).send({ success: false, error: { message: 'Profissional não encontrado.' } })
    }
    return reply.status(500).send({ success: false, error: { message: 'Erro ao editar profissional.' } })
  }
}

export async function excluirController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const params = req.params as { id: string }

    if (!params.id) {
      return reply.status(400).send({ success: false, error: { message: 'ID do profissional é obrigatório.' } })
    }

    // Aqui acionamos o Soft Delete que fizemos no Service!
    const dados = await excluirProfissional(empresaId, params.id)
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    if (err.message === 'NAO_ENCONTRADO') {
      return reply.status(404).send({ success: false, error: { message: 'Profissional não encontrado.' } })
    }
    return reply.status(500).send({ success: false, error: { message: 'Erro ao excluir profissional.' } })
  }
}

export async function definirComissaoServicoController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const params = req.params as { id: string }
    const body = req.body as { servico_id: string; comissao_pct: number }

    if (!params.id || !body.servico_id || body.comissao_pct === undefined) {
      return reply.status(400).send({ success: false, error: { message: 'Dados incompletos para definir comissão.' } })
    }

    const dados = await definirComissaoServico(empresaId, {
      profissional_id: params.id,
      servico_id: body.servico_id,
      comissao_pct: body.comissao_pct
    })
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(400).send({ success: false, error: { message: err.message } })
  }
}

export async function relatorioController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const params = req.params as { id: string }
    const query = req.query as { mes: string; ano: string }

    if (!params.id || !query.mes || !query.ano) {
      return reply.status(400).send({ success: false, error: { message: 'ID, mês e ano são obrigatórios.' } })
    }

    const dados = await relatorioProfissional(empresaId, params.id, Number(query.mes), Number(query.ano))
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: { message: 'Erro ao gerar relatório.' } })
  }
}

export async function gerarConviteController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authReq = req as AuthenticatedRequest
    const empresaId = authReq.user.empresaId
    const body = req.body as { email?: string; perfil?: string }

    const dados = await gerarConvite(empresaId, body)
    return reply.status(201).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(500).send({ success: false, error: { message: 'Erro ao gerar convite.' } })
  }
}

// Essa rota é pública, não precisa de empresaId (a pessoa ainda não está logada)
export async function usarConviteController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = req.body as { token: string; nome: string; email: string; senha: string }

    if (!body.token || !body.nome || !body.email || !body.senha) {
      return reply.status(400).send({ success: false, error: { message: 'Todos os campos são obrigatórios.' } })
    }

    const dados = await usarConvite(body.token, body)
    return reply.status(200).send({ success: true, data: dados })
  } catch (err: any) {
    return reply.status(400).send({ success: false, error: { message: err.message } })
  }
}