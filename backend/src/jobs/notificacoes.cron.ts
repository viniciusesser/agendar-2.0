import cron from 'node-cron'
import { dispararNotificacoesDiarias } from '../services/push.service'

/**
 * Agenda o disparo de notificações push diárias.
 * Roda todo dia às 6h no horário de Brasília (UTC-3 = 9h UTC).
 *
 * Formato cron: segundo minuto hora dia mês dia-semana
 */
export function iniciarCronJobs() {
  cron.schedule('0 0 9 * * *', async () => {
    console.log('⏰ Cron: disparando notificações diárias...')
    try {
      await dispararNotificacoesDiarias()
    } catch (err) {
      console.error('❌ Erro no cron de notificações:', err)
    }
  }, {
    timezone: 'America/Sao_Paulo',
  })

  console.log('✅ Cron jobs iniciados.')
}