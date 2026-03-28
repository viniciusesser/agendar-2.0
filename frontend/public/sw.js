// Service Worker do Agendar 2.0
// Responsável por receber e exibir notificações push

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon  || '/icon-192.png',
      badge:   data.badge || '/icon-192.png',
      data:    { url: data.url || '/' },
      vibrate: [200, 100, 200],
      // Agrupa notificações do mesmo app (evita spam de ícones)
      tag:     'agendar-diario',
      // Substitui a notificação anterior do mesmo tag
      renotify: false,
    })
  )
})

// Ao clicar na notificação, abre o app na rota certa
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se o app já está aberto, foca nele
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Se não está aberto, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})