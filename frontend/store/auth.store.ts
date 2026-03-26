import { create } from 'zustand'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: string
}

interface Empresa {
  id: string
  nome: string
  plano: string
}

interface AuthState {
  token: string | null
  usuario: Usuario | null
  empresa: Empresa | null
  setAuth: (token: string, usuario: Usuario, empresa: Empresa) => void
  logout: () => void
  carregarDoStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  empresa: null,

  setAuth: (token, usuario, empresa) => {
    localStorage.setItem('agendar_token', token)
    localStorage.setItem('agendar_usuario', JSON.stringify({ usuario, empresa }))
    set({ token, usuario, empresa })
  },

  logout: () => {
    localStorage.removeItem('agendar_token')
    localStorage.removeItem('agendar_usuario')
    set({ token: null, usuario: null, empresa: null })
  },

  carregarDoStorage: () => {
    const token = localStorage.getItem('agendar_token')
    const dados = localStorage.getItem('agendar_usuario')
    if (token && dados) {
      const { usuario, empresa } = JSON.parse(dados)
      set({ token, usuario, empresa })
    }
  },
}))