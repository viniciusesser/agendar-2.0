import api from '@/lib/api'

// A chave secreta vive no .env.local do frontend — NUNCA exposta no código
const MASTER_KEY = process.env.NEXT_PUBLIC_MASTER_KEY || ''

// Header de autenticação injetado em todas as chamadas master
const masterHeaders = { 'x-master-key': MASTER_KEY }

export interface Salao {
  id: string
  nome: string
  telefone: string | null
  plano: 'free' | 'basic' | 'pro' | 'vitrine'
  plano_validade: string | null
  ativo: boolean
  criado_em: string
  _count: {
    usuarios: number
    agendamentos: number
  }
}

export async function buscarSaloesMaster(): Promise<Salao[]> {
  const { data } = await api.get('/master/saloes', { headers: masterHeaders })
  return data.data
}

export async function atualizarSalao(
  id: string,
  payload: { ativo?: boolean; plano?: string; plano_validade?: string | null }
): Promise<Salao> {
  const { data } = await api.patch(`/master/saloes/${id}`, payload, {
    headers: masterHeaders,
  })
  return data.data
}