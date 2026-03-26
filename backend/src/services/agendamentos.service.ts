import { prisma } from '../lib/prisma'

// --- BUSCA ---
export async function listarAgendamentosDia(empresaId: string, data: string) {
  const inicio = new Date(`${data}T00:00:00.000Z`)
  const fim = new Date(`${data}T23:59:59.999Z`)

  return prisma.ag_agendamentos.findMany({
    where: {
      empresa_id: empresaId,
      deleted_at: null,
      data_hora_inicio: { gte: inicio, lte: fim },
    },
    include: {
      cliente: true,
      profissional: true,
      servico: true,
    },
    orderBy: { data_hora_inicio: 'asc' },
  })
}

// --- CRIAÇÃO ---
export async function criarAgendamento(empresaId: string, dados: {
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_hora_inicio: string
  duracao_min?: number
  valor?: number
  observacoes?: string
}) {
  const servico = await prisma.ag_servicos.findFirst({
    where: { id: dados.servico_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!servico) throw new Error('SERVICO_NAO_ENCONTRADO')

  const profissional = await prisma.ag_profissionais.findFirst({
    where: { id: dados.profissional_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!profissional) throw new Error('PROFISSIONAL_NAO_ENCONTRADO')

  const duracao = dados.duracao_min ?? servico.duracao_min
  const valor = dados.valor ?? Number(servico.preco)
  const inicio = new Date(dados.data_hora_inicio)
  const fim = new Date(inicio.getTime() + duracao * 60 * 1000)

  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - 5) 
  if (inicio < agora) throw new Error('HORARIO_PASSADO')

  const bloqueio = await prisma.ag_bloqueios.findFirst({
    where: {
      profissional_id: dados.profissional_id,
      AND: [
        { data_hora_inicio: { lt: fim } },
        { data_hora_fim: { gt: inicio } },
      ],
    },
  })
  if (bloqueio) throw new Error('PROFISSIONAL_BLOQUEADO')

  const comissao_pct = Number(profissional.comissao_pct)
  const comissao_valor = valor * (comissao_pct / 100)

  return prisma.ag_agendamentos.create({
    data: {
      empresa_id: empresaId,
      cliente_id: dados.cliente_id,
      profissional_id: dados.profissional_id,
      servico_id: dados.servico_id,
      data_hora_inicio: inicio,
      data_hora_fim: fim,
      duracao_min: duracao,
      valor,
      comissao_pct,
      comissao_valor,
      observacoes: dados.observacoes,
    },
    include: { cliente: true, profissional: true, servico: true },
  })
}

// --- ATUALIZAÇÃO DE STATUS (SIMPLIFICADA) ---
export async function atualizarStatusSimples(empresaId: string, agendamentoId: string, status: string) {
  // Debug para você ver no terminal do VS Code o que está chegando
  console.log(`[SERVICE] Solicitando mudança para: ${status} no agendamento ${agendamentoId}`);

  const statusPermitidos = ['agendado', 'confirmado', 'atendimento', 'concluido', 'falta', 'cancelado'];
  
  if (!statusPermitidos.includes(status)) {
    console.error(`[SERVICE] Status inválido recebido: ${status}`);
    throw new Error('STATUS_INVALIDO');
  }

  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
  });

  if (!agendamento) throw new Error('NAO_ENCONTRADO');

  return prisma.ag_agendamentos.update({
    where: { id: agendamentoId },
    data: { status },
  });
}

// --- CHECKOUT E FINANCEIRO ---
export async function finalizarCheckout(empresaId: string, agendamentoId: string, dados: {
  forma_pagamento: string;
  produtos_comanda: { id: string; quantidade: number; preco_venda: number }[];
}) {
  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
    include: { servico: true, cliente: true }
  })

  if (!agendamento) throw new Error('NAO_ENCONTRADO')
  if (agendamento.status === 'finalizado') throw new Error('JA_FINALIZADO')

  const valorServico = Number(agendamento.valor);
  const valorProdutos = dados.produtos_comanda.reduce((acc, p) => acc + (p.preco_venda * p.quantidade), 0);
  const valorTotal = valorServico + valorProdutos;

  const isFiado = dados.forma_pagamento === 'fiado';
  const statusFinanceiro = isFiado ? 'pendente' : 'pago';

  return await prisma.$transaction(async (tx) => {
    
    // 1. Finaliza agendamento
    const agendamentoAtualizado = await tx.ag_agendamentos.update({
      where: { id: agendamentoId },
      data: {
        status: 'finalizado',
        finalizado_em: new Date(),
        forma_pagamento: dados.forma_pagamento
      }
    })

    // 2. Se fiado, soma no cliente
    if (isFiado) {
      await tx.ag_clientes.update({
        where: { id: agendamento.cliente_id },
        data: { debito: { increment: valorTotal } }
      })
    }

    // 3. Financeiro do Serviço
    await tx.ag_financeiro.create({
      data: {
        empresa_id: empresaId,
        cliente_id: agendamento.cliente_id,
        agendamento_id: agendamento.id,
        tipo: 'entrada',
        origem: 'servico',
        valor: valorServico,
        descricao: `Serviço: ${agendamento.servico.nome}`,
        forma_pagamento: dados.forma_pagamento,
        status: statusFinanceiro,
        responsavel: 'caixa'
      }
    })

    // 4. Financeiro e Estoque dos Produtos
    for (const item of dados.produtos_comanda) {
      const produto = await tx.ag_estoque.findUnique({ where: { id: item.id } })
      
      if (!produto || Number(produto.quantidade) < item.quantidade) {
        throw new Error(`ESTOQUE_INSUFICIENTE`);
      }

      await tx.ag_estoque.update({
        where: { id: item.id },
        data: { quantidade: { decrement: item.quantidade } }
      })

      await tx.ag_estoque_movimentacoes.create({
        data: {
          empresa_id: empresaId,
          produto_id: item.id,
          agendamento_id: agendamento.id,
          tipo: 'saida',
          quantidade: item.quantidade,
          motivo: `Venda na Comanda`
        }
      })

      await tx.ag_financeiro.create({
        data: {
          empresa_id: empresaId,
          cliente_id: agendamento.cliente_id,
          agendamento_id: agendamento.id,
          tipo: 'entrada',
          origem: 'venda_produto',
          valor: item.preco_venda * item.quantidade,
          descricao: `Produto: ${produto.nome} (${item.quantidade}x)`,
          forma_pagamento: dados.forma_pagamento,
          status: statusFinanceiro,
          responsavel: 'caixa'
        }
      })
    }

    return agendamentoAtualizado
  })
}

// --- CANCELAMENTO E BLOQUEIO ---
export async function cancelarAgendamento(empresaId: string, agendamentoId: string) {
  const agendamento = await prisma.ag_agendamentos.findFirst({
    where: { id: agendamentoId, empresa_id: empresaId, deleted_at: null },
  })

  if (!agendamento) throw new Error('NAO_ENCONTRADO')
  if (agendamento.status === 'finalizado') throw new Error('NAO_PODE_CANCELAR')

  return prisma.ag_agendamentos.update({
    where: { id: agendamentoId },
    data: { deleted_at: new Date(), status: 'cancelado' },
  })
}

export async function criarBloqueio(empresaId: string, dados: {
  profissional_id: string
  data_hora_inicio: string
  data_hora_fim: string
  motivo?: string
}) {
  const profissional = await prisma.ag_profissionais.findFirst({
    where: { id: dados.profissional_id, empresa_id: empresaId, deleted_at: null },
  })
  if (!profissional) throw new Error('PROFISSIONAL_NAO_ENCONTRADO')

  return prisma.ag_bloqueios.create({
    data: {
      empresa_id: empresaId,
      profissional_id: dados.profissional_id,
      data_hora_inicio: new Date(dados.data_hora_inicio),
      data_hora_fim: new Date(dados.data_hora_fim),
      motivo: dados.motivo,
    },
  })
}