import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/agendar'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// ─── REQUEST: injeta o access token em toda chamada ───────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── RESPONSE: em 401, faz logout direto ─────────────────────────────────
// Refresh token desativado temporariamente — cookie cross-origin não funciona
// em PWA instalado no celular sem domínio próprio. Reativar quando tiver
// domínio próprio configurado (ex: api.agendar.com.br).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api