"use client";

import { Bell, Cake, Package, X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscarDashboardDia } from "@/services/dashboard.service";
import { Button } from "@/components/ui/Button";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [foiVisto, setFoiVisto] = useState(false);
  const [ultimoTotal, setUltimoTotal] = useState(0);

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    // Verifica se os alertas de hoje já foram vistos
    const vistoHoje = localStorage.getItem(`alertas_vistos_${hoje}`)
    if (vistoHoje) setFoiVisto(true)
  }, [hoje])

  const { data: dashData } = useQuery<any>({
    queryKey: ['alertas-notificacao'],
    queryFn: () => buscarDashboardDia(hoje),
    enabled: mounted,
    staleTime: 1000 * 60 * 5,      // Dados válidos por 5 minutos
    refetchInterval: 1000 * 60 * 5, // Revalida a cada 5 minutos
  })

  const aniversariantes = dashData?.alertas?.aniversariantes ?? []
  const estoqueBaixo    = dashData?.alertas?.estoque_baixo ?? []

  // ✅ CORRIGIDO: sem "cobrancas" que nunca vinha do backend
  const total = aniversariantes.length + estoqueBaixo.length

  // Volta a piscar se chegarem novas notificações após a abertura
  useEffect(() => {
    if (total > ultimoTotal && ultimoTotal > 0) {
      setFoiVisto(false)
    }
    setUltimoTotal(total)
  }, [total, ultimoTotal])

  // Não renderiza nada no SSR para evitar hidration mismatch
  if (!mounted) {
    return (
      <div className="p-2">
        <Bell size={22} strokeWidth={2.5} className="text-primary-action opacity-30" />
      </div>
    )
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isOpen) {
      setFoiVisto(true)
      localStorage.setItem(`alertas_vistos_${hoje}`, 'true')
    }

    setIsOpen(prev => !prev)
  }

  return (
    <div className="relative inline-block">

      {/* BOTÃO DO SINO */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-primary-action hover:bg-primary-50 rounded-full transition-all active:scale-90"
        style={{ zIndex: 1100 }}
        title="Notificações"
      >
        <Bell size={22} strokeWidth={2.5} />

        {/* BADGE DE CONTAGEM */}
        {total > 0 && (
          <span
            className={`absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-status-error text-white text-[10px] font-black rounded-full border-2 border-surface shadow-sm transition-all ${
              !foiVisto ? 'animate-bounce' : 'opacity-90'
            }`}
          >
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {/* PAINEL DE NOTIFICAÇÕES */}
      {isOpen && (
        <>
          {/* OVERLAY para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-[1050]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-[300px] bg-surface border border-border-default rounded-xl shadow-xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

            {/* CABEÇALHO DO PAINEL */}
            <div className="p-4 border-b border-border-default bg-bg-default/50 flex justify-between items-center">
              <h3 className="text-micro font-black text-text-primary uppercase tracking-widest">
                Central de Avisos
                {total > 0 && (
                  <span className="ml-2 bg-status-error text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {total}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-status-error transition-colors p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            {/* LISTA DE NOTIFICAÇÕES */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border-default">

              {total === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <Bell size={32} strokeWidth={1.5} className="text-text-muted opacity-30" />
                  <p className="text-small text-text-muted font-medium italic">
                    Tudo em dia por aqui!
                  </p>
                </div>
              ) : (
                <>
                  {/* SEÇÃO: ANIVERSARIANTES */}
                  {aniversariantes.length > 0 && (
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-micro font-black text-status-success uppercase tracking-widest flex items-center gap-1.5">
                        <Cake size={12} /> Aniversariantes de Hoje
                      </p>
                    </div>
                  )}
                  {aniversariantes.map((item: any) => (
                    <div key={`niver-${item.id}`} className="px-4 py-3 hover:bg-bg-default transition-colors">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
                          <Cake size={16} className="text-status-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-small font-bold text-text-primary leading-tight truncate">
                            {item.nome}
                          </p>
                          {item.telefone && (
                            <button
                              onClick={() =>
                                window.open(
                                  `https://wa.me/55${item.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Feliz aniversário, ${item.nome}! 🎉`)}`,
                                  '_blank'
                                )
                              }
                              className="mt-1.5 flex items-center gap-1 text-micro font-black text-primary-action hover:opacity-70 transition-opacity"
                            >
                              <MessageCircle size={11} /> Enviar parabéns
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* SEÇÃO: ESTOQUE BAIXO */}
                  {estoqueBaixo.length > 0 && (
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-micro font-black text-status-warning uppercase tracking-widest flex items-center gap-1.5">
                        <Package size={12} /> Estoque em Alerta
                      </p>
                    </div>
                  )}
                  {estoqueBaixo.map((item: any) => (
                    <div key={`stock-${item.id}`} className="px-4 py-3 hover:bg-bg-default transition-colors">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-status-warning" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-small font-bold text-text-primary leading-tight truncate">
                            {item.nome}
                          </p>
                          <p className="text-micro text-status-warning font-bold mt-0.5">
                            {/* ✅ CORRIGIDO: era quantidade_atual, o backend retorna quantidade */}
                            Restam {Number(item.quantidade)} {Number(item.quantidade) === 1 ? 'unidade' : 'unidades'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* RODAPÉ */}
            <div className="p-3 bg-bg-default/30 border-t border-border-default">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setIsOpen(false)}
                className="h-9 text-micro font-bold text-text-secondary"
              >
                Fechar
              </Button>
            </div>

          </div>
        </>
      )}
    </div>
  )
}