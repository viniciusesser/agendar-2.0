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

  useEffect(() => {
    setMounted(true);
    const vistoHoje = localStorage.getItem(`alertas_vistos_${new Date().toISOString().split('T')[0]}`);
    if (vistoHoje) setFoiVisto(true);
  }, []);

  // Adicionado <any> para resolver o erro de tipagem do TypeScript, e removido o onSuccess
  const { data: dashData } = useQuery<any>({
    queryKey: ['alertas-notificacao'],
    queryFn: () => buscarDashboardDia(new Date().toISOString().split('T')[0]),
    enabled: mounted, 
    refetchInterval: 1000 * 60 * 5, // A cada 5 minutos
  });

  const alertas = dashData?.alertas || { aniversariantes: [], estoque_baixo: [], cobrancas: [] };
  const total = (alertas.aniversariantes?.length || 0) + 
                (alertas.estoque_baixo?.length || 0) + 
                (alertas.cobrancas?.length || 0);

  // Efeito alternativo para voltar a piscar caso chegue uma notificação nova (ex: total subiu de 1 para 2)
  useEffect(() => {
    if (total > ultimoTotal && ultimoTotal > 0) {
      setFoiVisto(false); // Volta a piscar se o problema aumentar
    }
    setUltimoTotal(total);
  }, [total, ultimoTotal]);

  if (!mounted) return <Bell className="text-primary-action opacity-20" size={24} />;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      setFoiVisto(true);
      localStorage.setItem(`alertas_vistos_${new Date().toISOString().split('T')[0]}`, 'true');
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleToggle}
        className="relative p-2 text-primary-action hover:bg-primary-50 rounded-full transition-all active:scale-90"
        style={{ zIndex: 1100 }}
      >
        <Bell size={24} strokeWidth={2.5} />
        
        {total > 0 && (
          <span className={`absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-status-error text-white text-[10px] font-black rounded-full border-2 border-surface shadow-sm transition-all ${!foiVisto ? 'animate-bounce' : 'opacity-90'}`}>
            {total}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1050]" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-[300px] bg-surface border border-border-default rounded-xl shadow-xl z-[1100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-border-default bg-bg-default/50 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Central de Avisos</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-status-error transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto divide-y divide-border-default hide-scrollbar">
              {total === 0 ? (
                <div className="p-8 text-center text-small text-text-muted italic">Tudo em dia por aqui!</div>
              ) : (
                <>
                  {/* ANIVERSARIANTES */}
                  {alertas.aniversariantes?.map((item: any) => (
                    <div key={`niver-${item.id}`} className="p-4 hover:bg-bg-default transition-colors">
                      <div className="flex gap-3">
                        <Cake size={18} className="text-status-success shrink-0" />
                        <div className="flex-1">
                          <p className="text-small text-text-primary leading-tight">
                            Aniversário de <span className="font-bold">{item.nome}</span>
                          </p>
                          <Button 
                            variant="ghost" 
                            className="h-auto p-0 mt-2 text-micro text-primary-action font-black gap-1 hover:bg-transparent"
                            onClick={() => window.open(`https://wa.me/55${item.telefone?.replace(/\D/g, '')}?text=Parabéns, ${item.nome}!`, '_blank')}
                          >
                            <MessageCircle size={12} /> ENVIAR PARABÉNS
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* ESTOQUE */}
                  {alertas.estoque_baixo?.map((item: any) => (
                    <div key={`stock-${item.id}`} className="p-4 hover:bg-bg-default transition-colors">
                      <div className="flex gap-3">
                        <Package size={18} className="text-status-warning shrink-0" />
                        <div className="flex-1">
                          <p className="text-small text-text-primary leading-tight">
                            Estoque baixo: <span className="font-bold">{item.nome}</span>
                          </p>
                          <p className="text-micro text-text-secondary mt-0.5 font-bold">Restam apenas {item.quantidade_atual} un.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="p-3 bg-bg-default/30 border-t border-border-default">
              <Button variant="ghost" fullWidth onClick={() => setIsOpen(false)} className="h-10 text-micro font-bold text-text-secondary">
                FECHAR PAINEL
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}