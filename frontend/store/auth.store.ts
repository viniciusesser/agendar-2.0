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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      empresa: null,

      setAuth: (token, usuario, empresa) => {
        // O Zustand persist cuida do storage automaticamente.
        // Removemos os localStorage.setItem manuais.
        set({ token, usuario, empresa })
      },

      logout: () => {
        // O Zustand persist limpa automaticamente a chave oficial ao setar null.
        // Removemos os localStorage.removeItem manuais.
        set({ token: null, usuario: null, empresa: null })
      },
    }),
    {
      name: 'agendar-auth-storage', // A chave única e oficial no navegador
      storage: createJSONStorage(() => localStorage), 
    }
  )
)