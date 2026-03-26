import api from '@/lib/api'

// Tipagens de Listagem
export interface Cliente { id: string; nome: string }
export interface Servico { id: string; nome: string; duracao_min: number }
export interface Profissional { id: string; nome: string }

export interface AgendamentoResponse {
  id: string
  cliente_nome: string
  servico_nome: string
  data_hora_inicio: string
  duracao_min: number
  status: string
  cor?: string
}

export interface CriarAgendamentoDTO {
  cliente_id: string
  servico_id: string
  profissional_id: string
  data_hora_inicio: string 
}

// --- FUNÇÃO SALVA-VIDAS (Caça-Arrays) ---
function extrairListaSegura(resposta: any): any[] {
  if (!resposta) return [];
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta.data)) return resposta.data;
  if (resposta.data && Array.isArray(resposta.data.data)) return resposta.data.data;
  if (Array.isArray(resposta.items)) return resposta.items;
  return []; 
}

// --- FUNÇÕES DE BUSCA ---
export async function buscarAgendamentosDoDia(dataIso: string): Promise<AgendamentoResponse[]> {
  const response = await api.get('/agendamentos', { params: { data: dataIso } })
  return extrairListaSegura(response.data)
}

export async function buscarClientes(): Promise<Cliente[]> {
  const response = await api.get('/clientes')
  return extrairListaSegura(response.data)
}

export async function buscarServicos(): Promise<Servico[]> {
  const response = await api.get('/servicos')
  return extrairListaSegura(response.data)
}

export async function buscarProfissionais(): Promise<Profissional[]> {
  const response = await api.get('/profissionais')
  return extrairListaSegura(response.data)
}

// --- FUNÇÕES DE SALVAR ---
// Nova função ensinando o frontend a salvar a cliente
export async function criarCliente(dados: { nome: string; telefone?: string }): Promise<Cliente> {
  const response = await api.post('/clientes', dados)
  return response.data.data || response.data
}

export async function criarAgendamento(dados: CriarAgendamentoDTO): Promise<void> {
  await api.post('/agendamentos', dados)
}

// Adicione isso no final do seu agendamentos.service.ts do frontend
export async function finalizarCheckoutAgendamento(id: string, dadosCheckout: {
  forma_pagamento: string;
  produtos_comanda: any[];
}): Promise<any> {
  // Dispara os dados ricos de checkout para o backend
  const response = await api.post(`/agendamentos/${id}/checkout`, dadosCheckout);
  return response.data.data;
}

// Garanta que você também tem a função simples para os outros botões (Confirmar/Falta)
export async function atualizarStatusAgendamento(id: string, status: string): Promise<any> {
  // Enviamos um objeto { status: "..." } no corpo da requisição PATCH
  const response = await api.patch(`/agendamentos/${id}/status`, { status });
  return response.data.data;
}