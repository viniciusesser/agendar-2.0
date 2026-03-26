import api from '@/lib/api'

export interface Lancamento {
  id: string
  tipo: 'entrada' | 'saida'
  origem: string
  valor: string | number
  descricao: string
  forma_pagamento: string
  data: string
  criado_em: string
  cliente?: { nome: string }
}

export interface RelatorioFinanceiro {
  data: string
  total_entradas: number
  total_saidas: number
  saldo: number
  ticket_medio: number
  atendimentos: number
  lancamentos: Lancamento[]
}

export async function buscarFinanceiro(dataIso: string): Promise<RelatorioFinanceiro> {
  // Bate na rota correta do seu backend enviando a data obrigatória
  const response = await api.get('/financeiro/dia', { params: { data: dataIso } })
  return response.data.data
}

export async function criarLancamentoManual(dados: {
  tipo: 'entrada' | 'saida'
  valor: number
  descricao: string
  forma_pagamento: string
  data: string
}): Promise<Lancamento> {
  // Bate na rota de lançamento manual
  const response = await api.post('/financeiro', dados) 
  return response.data.data
}