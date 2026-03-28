"use client"

import { PartyPopper, UserX, Info } from "lucide-react"
import { useFeriadoDoDia } from "@/hooks/useFeriados"

interface Props {
  data: string        // "YYYY-MM-DD"
  bloqueios: any[]
}

/**
 * Exibe banners informativos abaixo do header da agenda.
 * Ordem: Feriado (roxo) → Ausências (vermelho)
 * Aniversariantes e estoque ficam no sino de notificações.
 */
export function AgendaBanners({ data, bloqueios }: Props) {
  const feriado = useFeriadoDoDia(data)

  const ausentes = Array.from(
    new Set(bloqueios.map((b: any) => b.profissional?.nome).filter(Boolean))
  )

  if (!feriado && ausentes.length === 0) return null

  return (
    <div className="flex flex-col">

      {/* BANNER: FERIADO NACIONAL */}
      {feriado && (
        <div className="bg-violet-50 border-b border-violet-200 px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <PartyPopper
            size={14}
            strokeWidth={2.5}
            className="text-violet-500 shrink-0"
          />
          <p className="text-micro font-bold text-violet-700 uppercase tracking-widest text-center leading-tight">
            Feriado Nacional · {feriado.name}
          </p>
          <span title="Fonte: BrasilAPI">
            <Info size={13} className="text-violet-400 shrink-0" />
          </span>
        </div>
      )}

      {/* BANNER: AUSÊNCIAS DA EQUIPE */}
      {ausentes.length > 0 && (
        <div className="bg-status-error/10 border-b border-status-error/20 px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <UserX
            size={14}
            strokeWidth={2.5}
            className="text-status-error shrink-0"
          />
          <p className="text-micro font-bold text-status-error uppercase tracking-widest text-center leading-tight">
            {ausentes.length === 1
              ? `${ausentes[0]} está ausente hoje`
              : `Ausentes hoje: ${ausentes.join(', ')}`
            }
          </p>
        </div>
      )}

    </div>
  )
}