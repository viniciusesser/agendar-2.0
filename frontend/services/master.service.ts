import api from '@/lib/api'

const masterHeaders = { 'x-master-key': process.env.NEXT_PUBLIC_MASTER_KEY || '' }

export interface UsuarioSalao {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  criado_em: string
}

export interface Salao {
  id: string
  nome: string
  telefone: string | null
  plano: 'free' | 'basic' | 'pro' | 'vitrine'
  plano_validade: string | null
  ativo: boolean
  criado_em: string
  usuarios: UsuarioSalao[]
  _count: {
    usuarios: number   // apenas ativos
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

export async function atualizarUsuario(
  id: string,
  ativo: boolean
): Promise<void> {
  await api.patch(`/master/usuarios/${id}`, { ativo }, { headers: masterHeaders })
}