import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    arr[i] = rawData.charCodeAt(i)
  }
  return arr.buffer
}

export function usePushNotifications() {
  const [permissao, setPermissao] = useState<NotificationPermission | 'unsupported'>('default')
  const [mounted, setMounted] = useState(false)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermissao('unsupported')
      return
    }
    setMounted(true)
    setPermissao(Notification.permission)

    // Se já tem permissão E tem token, registra direto
    if (Notification.permission === 'granted' && token) {
      registrarSubscription()
    }
  }, [token])

  async function registrarSubscription() {
    // Só registra se o usuário estiver autenticado
    if (!token) return

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) return

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await api.post('/push/subscribe', subscription.toJSON())
    } catch (err) {
      console.error('Erro ao registrar push subscription:', err)
    }
  }

  async function pedirPermissao() {
    if (!('Notification' in window)) return
    if (!token) return // Não pede permissão sem usuário logado

    const resultado = await Notification.requestPermission()
    setPermissao(resultado)

    if (resultado === 'granted') {
      await registrarSubscription()
    }

    return resultado
  }

  return { permissao, pedirPermissao, mounted }
}