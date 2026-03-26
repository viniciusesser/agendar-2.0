import api from '@/lib/api'

export async function buscarDashboardDia(dataIso: string) {
  const response = await api.get('/dashboard/dia', { params: { data: dataIso } })
  return response.data.data
}

export async function buscarDashboardMes(ano: number, mes: number) {
  const response = await api.get('/dashboard/mes', { params: { ano, mes } })
  return response.data.data
}