import { useQuery } from '@tanstack/react-query'

interface Feriado {
  date: string       // "2026-01-01"
  name: string       // "Confraternização Universal"
  type: string       // "national"
}

async function buscarFeriadosDoAno(ano: number): Promise<Feriado[]> {
  const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
  if (!res.ok) throw new Error('Falha ao buscar feriados')
  return res.json()
}

/**
 * Retorna o feriado nacional correspondente à data informada (formato "YYYY-MM-DD").
 * Cache de 24h — a lista de feriados do ano não muda.
 */
export function useFeriadoDoDia(data: string) {
  const ano = data ? parseInt(data.split('-')[0]) : new Date().getFullYear()

  const { data: feriados } = useQuery<Feriado[]>({
    queryKey: ['feriados', ano],
    queryFn: () => buscarFeriadosDoAno(ano),
    staleTime: 1000 * 60 * 60 * 24,    // 24 horas — não muda no dia
    gcTime: 1000 * 60 * 60 * 24 * 7,   // mantém em cache por 7 dias
    retry: 1,                            // 1 retry em caso de falha de rede
    enabled: !!data,
  })

  if (!data || !feriados) return null

  return feriados.find(f => f.date === data) ?? null
}