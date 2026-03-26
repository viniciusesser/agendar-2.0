import api from '@/lib/api'

export interface Profissional {
  id: string
  nome: string
  cor?: string
  comissao_pct: number
  comissao_produto_pct?: number // Adicionado para bater com o Modal
  ativo: boolean
}

/**
 * Helper para garantir que sempre retornaremos um Array, 
 * tratando diferentes formatos de resposta do backend.
 */
function extrairListaSegura(resposta: any): any[] {
  if (!resposta) return [];
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta.data)) return resposta.data;
  if (resposta.data && Array.isArray(resposta.data.data)) return resposta.data.data;
  if (Array.isArray(resposta.items)) return resposta.items;
  return []; 
}

// --- MÉTODOS DE BUSCA E MANUTENÇÃO ---

export async function buscarProfissionais(): Promise<Profissional[]> {
  const response = await api.get('/profissionais')
  return extrairListaSegura(response.data)
}

export async function criarProfissional(dados: { 
  nome: string; 
  comissao_pct?: number; 
  comissao_produto_pct?: number;
  cor?: string;
  ativo?: boolean 
}): Promise<Profissional> {
  const response = await api.post('/profissionais', dados)
  return response.data.data || response.data
}

export async function editarProfissional(id: string, dados: Partial<Profissional>): Promise<Profissional> {
  const response = await api.put(`/profissionais/${id}`, dados)
  return response.data.data || response.data
}

export async function excluirProfissional(id: string) {
  /* 
     CORREÇÃO: Removido o "/api" extra. 
     O Axios (api) já usa o baseURL 'http://localhost:3333/api/agendar'
  */
  const res = await api.delete(`/profissionais/${id}`);
  return res.data;
}

// --- SISTEMA DE CONVITES ---

export async function gerarConvite(dados: { email?: string; perfil?: string }): Promise<{ token: string; link: string }> {
  const response = await api.post('/convites', dados)
  return response.data.data
}

export async function usarConvite(dados: { token: string; nome: string; email: string; senha: string }): Promise<any> {
  const response = await api.post('/convites/usar', dados)
  return response.data.data
}