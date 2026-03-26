import api from '@/lib/api'

export interface Servico {
  id: string
  nome: string
  duracao_min: number
  preco: number | string
  ativo: boolean
}

export async function buscarServicos(): Promise<Servico[]> {
  const response = await api.get('/servicos')
  return response.data.data || []
}

export async function criarServico(dados: Partial<Servico>): Promise<Servico> {
  const response = await api.post('/servicos', dados)
  return response.data.data
}

export async function editarServico(id: string, dados: Partial<Servico>): Promise<Servico> {
  const response = await api.put(`/servicos/${id}`, dados)
  return response.data.data
}

export async function deletarServico(id: string): Promise<void> {
  await api.delete(`/servicos/${id}`)
}