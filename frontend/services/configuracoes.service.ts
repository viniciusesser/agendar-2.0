import api from '@/lib/api'

export async function buscarConfiguracoes() {
  const response = await api.get('/configuracoes')
  return response.data.data
}

export async function salvarConfiguracoes(configs: Record<string, string>) {
  const response = await api.put('/configuracoes', configs) 
  return response.data.data
}