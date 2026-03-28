import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/agendar'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Envia o cookie httpOnly do refresh token automaticamente
})

// ─── REQUEST: injeta o access token em toda chamada ───────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── RESPONSE: em 401, tenta renovar o token antes de deslogar ───────────
let isRefreshing = false
let filaEspera: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Só tenta refresh em 401 e se ainda não tentou nesta requisição
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Se já está renovando, coloca na fila para retentar depois
    if (isRefreshing) {
      return new Promise((resolve) => {
        filaEspera.push((novoToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${novoToken}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Chama a rota de refresh — o cookie httpOnly é enviado automaticamente
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )

      const novoToken = data.data.token

      // Atualiza o token no Zustand
      useAuthStore.getState().setToken(novoToken)

      // Processa a fila de requisições que estavam esperando
      filaEspera.forEach((cb) => cb(novoToken))
      filaEspera = []

      // Retenta a requisição original com o novo token
      originalRequest.headers.Authorization = `Bearer ${novoToken}`
      return api(originalRequest)
    } catch {
      // Refresh falhou — desloga o usuário
      filaEspera = []
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default api