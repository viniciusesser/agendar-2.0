import api from '@/lib/api'

export interface Cliente {
  id: string
  nome: string
  telefone?: string
  aniversario?: string
  debito: number | string
  observacoes?: string
}

export async function buscarClientes(busca?: string): Promise<Cliente[]> {
  const params = busca ? { busca } : {}
  const response = await api.get('/clientes', { params })
  return response.data?.data?.clientes || []
}

export async function criarCliente(dados: Partial<Cliente>): Promise<Cliente> {
  const response = await api.post('/clientes', dados)
  return response.data.data || response.data
}

export async function editarCliente(id: string, dados: Partial<Cliente>): Promise<Cliente> {
  const response = await api.put(`/clientes/${id}`, dados)
  return response.data.data || response.data
}

export async function deletarCliente(id: string): Promise<void> {
  await api.delete(`/clientes/${id}`)
}

export async function quitarFiadoCliente(id: string, valor: number): Promise<any> {
  const response = await api.post(`/clientes/${id}/quitar-fiado`, { valor })
  return response.data.data
}

// --- NOVAS FUNÇÕES PARA A TELA DE PERFIL / CONTA CORRENTE ---

export async function buscarClientePorId(id: string) {
  const response = await api.get(`/clientes/${id}`)
  return response.data.data
}

export async function buscarContaCorrente(clienteId: string) {
  const response = await api.get(`/clientes/${clienteId}/conta-corrente`)
  return response.data.data
}

export async function registrarPagamentoFiado(clienteId: string, dados: { valor: number, forma_pagamento: string, observacao?: string }) {
  const response = await api.post(`/clientes/${clienteId}/pagar-fiado`, dados)
  return response.data.data
}