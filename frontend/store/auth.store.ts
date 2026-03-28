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
  setToken: (token: string) => void   // ← usado pelo interceptor de refresh
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:   null,
      usuario: null,
      empresa: null,

      setAuth: (token, usuario, empresa) => {
        set({ token, usuario, empresa })
      },

      // Atualiza só o access token sem mexer nos dados do usuário
      setToken: (token) => {
        set({ token })
      },

      logout: () => {
        set({ token: null, usuario: null, empresa: null })
      },
    }),
    {
      name: 'agendar-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)