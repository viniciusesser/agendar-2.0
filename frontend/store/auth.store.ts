import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      empresa: null,

      setAuth: (token, usuario, empresa) => {
        // Mantemos isso para o seu arquivo api.ts continuar achando o token
        if (typeof window !== 'undefined') {
          localStorage.setItem('agendar_token', token)
          localStorage.setItem('agendar_usuario', JSON.stringify({ usuario, empresa }))
        }
        set({ token, usuario, empresa })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('agendar_token')
          localStorage.removeItem('agendar_usuario')
        }
        set({ token: null, usuario: null, empresa: null })
      },

      // Mantida por compatibilidade caso alguma tela sua chame ela, 
      // mas o 'persist' abaixo já faz o trabalho pesado automaticamente.
      carregarDoStorage: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('agendar_token')
          const dados = localStorage.getItem('agendar_usuario')
          if (token && dados) {
            const { usuario, empresa } = JSON.parse(dados)
            set({ token, usuario, empresa })
          }
        }
      },
    }),
    {
      name: 'agendar-auth-storage', // Nome do cofre mestre gerenciado pelo Zustand
      storage: createJSONStorage(() => localStorage), 
    }
  )
)