import api from '@/lib/api'

export interface Produto {
  id: string
  nome: string
  quantidade: number | string
  unidade: string
  rendimento_est?: number | string
  estoque_minimo: number | string
  preco_compra?: number | string
  preco_venda?: number | string
}

export async function listarEstoque(): Promise<Produto[]> {
  const response = await api.get('/estoque')
  return response.data.data || []
}

export async function criarProduto(dados: Partial<Produto>): Promise<Produto> {
  const response = await api.post('/estoque', dados)
  return response.data.data
}

export async function editarProduto(id: string, dados: Partial<Produto>): Promise<Produto> {
  const response = await api.put(`/estoque/${id}`, dados)
  return response.data.data
}

export async function deletarProduto(id: string): Promise<void> {
  await api.delete(`/estoque/${id}`)
}

export async function registrarMovimentacao(id: string, tipo: 'entrada' | 'saida', quantidade: number): Promise<any> {
  // Rota corrigida para o singular, exatamente como no seu backend!
  const response = await api.post(`/estoque/${id}/movimentacao`, { tipo, quantidade })
  return response.data.data
}

// NOVO: Função para o PDV (Venda Direta)
export async function registrarVendaDireta(dados: {
  cliente_id: string;
  produto_id: string;
  quantidade: number;
  valor_total: number;
  forma_pagamento: string;
}): Promise<any> {
  const response = await api.post('/estoque/venda-direta', dados)
  return response.data.data
}