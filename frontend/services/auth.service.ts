import api from '@/lib/api'

export async function login(email: string, senha: string) {
  const { data } = await api.post('/auth/login', { email, senha })
  return data.data
}

export async function cadastrar(dados: {
  nome_salao: string
  nome_usuario: string
  email: string
  senha: string
  telefone?: string
}) {
  const { data } = await api.post('/auth/cadastro', dados)
  return data.data
}