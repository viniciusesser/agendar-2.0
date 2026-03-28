import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api/agendar',
})

api.interceptors.request.use((config) => {
  // Lê do estado Zustand (que já veio do persist), não do localStorage manualmente
  const token = useAuthStore.getState().token
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Usa a função oficial de logout do Zustand, que limpa tudo corretamente
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api