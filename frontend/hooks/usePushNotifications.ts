import { useEffect, useState } from 'react'
import api from '@/lib/api'

// Converte a chave pública VAPID de base64 para Uint8Array
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

/**
 * Hook que pede permissão de notificação e registra o dispositivo no backend.
 * Deve ser chamado uma única vez, preferencialmente no layout raiz após o login.
 */
export function usePushNotifications() {
  const [permissao, setPermissao] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    // Verifica se o navegador suporta push notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermissao('unsupported')
      return
    }

    setPermissao(Notification.permission)

    // Se já tem permissão, registra direto sem pedir novamente
    if (Notification.permission === 'granted') {
      registrarSubscription()
    }
  }, [])

  async function registrarSubscription() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) return

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Envia a subscription para o backend salvar
      await api.post('/push/subscribe', subscription.toJSON())
    } catch (err) {
      console.error('Erro ao registrar push subscription:', err)
    }
  }

  async function pedirPermissao() {
    if (!('Notification' in window)) return

    const resultado = await Notification.requestPermission()
    setPermissao(resultado)

    if (resultado === 'granted') {
      await registrarSubscription()
    }

    return resultado
  }

  return { permissao, pedirPermissao }
}