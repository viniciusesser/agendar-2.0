"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Loader2, 
  Calendar, 
  AlertTriangle, 
  Scissors, 
  DollarSign, 
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscarAgendamentosDoDia } from "@/services/agendamentos.service";
import { buscarConfiguracoes } from "@/services/configuracoes.service";
import { buscarDashboardDia } from "@/services/dashboard.service";
import NovoAgendamentoModal from "@/components/ui/NovoAgendamentoModal";
import ModalDetalhesAgendamento from "@/components/ui/ModalDetalhesAgendamento";
import BottomNav from "@/components/ui/BottomNav";
import NotificationBell from "@/components/ui/NotificationBell";

// --- COMPONENTE: INDICADOR DE HORA ATUAL ---
function CurrentTimeIndicator({ startHour, slotMinutes, slotHeight }: any) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  
  if (h < startHour || h >= 22) return null;

  const inicioGradeMinutos = startHour * 60;
  const minutosDesdeMeiaNoite = h * 60 + m;
  const diffMinutos = minutosDesdeMeiaNoite - inicioGradeMinutos;
  const pixelsPorMinuto = slotHeight / slotMinutes;
  const top = diffMinutos * pixelsPorMinuto;

  return (
    <div 
      className="absolute left-0 right-0 z-[50] pointer-events-none flex items-center"
      style={{ top: `${top}px` }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-status-error -ml-1.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
      <div className="flex-1 h-[2px] bg-status-error/60" />
    </div>
  );
}

// --- FUNÇÕES DE LÓGICA DE GRADE ---
function generateTimeSlots(startHour: number, endHour: number, slotMinutes: number) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
}

function getPositionStyles(dataHoraInicioIso: string, duracaoMinutos: number, startHour: number, slotMinutes: number, slotHeight = 56) {
  const data = new Date(dataHoraInicioIso);
  const h = data.getHours();
  const m = data.getMinutes();
  const minutosDesdeMeiaNoite = h * 60 + m;
  const inicioGradeMinutos = startHour * 60; 
  const diffMinutos = minutosDesdeMeiaNoite - inicioGradeMinutos;
  const pixelsPorMinuto = slotHeight / slotMinutes;
  const top = diffMinutos * pixelsPorMinuto;
  const height = duracaoMinutos * pixelsPorMinuto;
  return { top: `${top}px`, height: `${height}px` };
}

function organizarAgendamentosSemSobreposicao(agendamentos: any[]) {
  if (!agendamentos || agendamentos.length === 0) return [];
  const ativos = agendamentos.filter(ag => ag.status !== 'cancelado');
  const ordenados = [...ativos].sort((a, b) => new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime());

  const colunas: any[][] = [];
  ordenados.forEach(ag => {
    const inicio = new Date(ag.data_hora_inicio).getTime();
    const duracao = ag.duracao_min || ag.servico?.duracao_min || 60;
    const fim = inicio + duracao * 60000;
    ag._inicio = inicio;
    ag._fim = fim;

    let colocou = false;
    for (let i = 0; i < colunas.length; i++) {
      const ultimaDaColuna = colunas[i][colunas[i].length - 1];
      if (inicio >= ultimaDaColuna._fim) {
        colunas[i].push(ag);
        ag._colIndex = i;
        colocou = true;
        break;
      }
    }
    if (!colocou) {
      ag._colIndex = colunas.length;
      colunas.push([ag]);
    }
  });

  let clusters: any[][] = [];
  let clusterAtual: any[] = [];
  let maxFimCluster = 0;
  ordenados.forEach(ag => {
    if (clusterAtual.length === 0) {
      clusterAtual.push(ag);
      maxFimCluster = ag._fim;
    } else if (ag._inicio < maxFimCluster) {
      clusterAtual.push(ag);
      if (ag._fim > maxFimCluster) maxFimCluster = ag._fim;
    } else {
      clusters.push(clusterAtual);
      clusterAtual = [ag];
      maxFimCluster = ag._fim;
    }
  });
  if (clusterAtual.length > 0) clusters.push(clusterAtual);

  clusters.forEach(cluster => {
    const colunasUnicas = Array.from(new Set(cluster.map(ag => ag._colIndex))).sort();
    cluster.forEach(ag => {
      const colIndexLocal = colunasUnicas.indexOf(ag._colIndex);
      ag._widthPct = 100 / colunasUnicas.length;
      ag._leftPct = colIndexLocal * ag._widthPct;
    });
  });
  return ordenados;
}

export default function AgendaPage() {
  const slotHeightPixels = 56; 
  const [dataSelecionada, setDataSelecionada] = useState("");

  useEffect(() => {
    setDataSelecionada(new Date().toISOString().split('T')[0]);
  }, []);

  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<any>(null);

  const { data: agendamentos, isLoading: loadAgenda } = useQuery({
    queryKey: ['agendamentos', dataSelecionada],
    queryFn: () => buscarAgendamentosDoDia(dataSelecionada),
    enabled: !!dataSelecionada
  });

  const { data: configs } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: buscarConfiguracoes
  });

  const { data: dashDia } = useQuery({
    queryKey: ['dashboard-dia', dataSelecionada],
    queryFn: () => buscarDashboardDia(dataSelecionada),
    enabled: !!dataSelecionada
  });

  const mudarDia = (dias: number) => {
    const d = new Date(dataSelecionada + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const fmtDataHeader = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + 'T12:00:00');
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${dias[d.getDay()]}, ${d.getDate()} ${meses[d.getMonth()]}`;
  };

  const cfg = configs as any;
  const startHour = cfg?.horario_abertura ? parseInt(cfg.horario_abertura.split(':')[0]) : 7;
  const endHour = cfg?.horario_fechamento ? parseInt(cfg.horario_fechamento.split(':')[0]) : 21;
  const slotMinutes = cfg?.slot_minutos ? parseInt(cfg.slot_minutos) : 30;

  const timeSlots = generateTimeSlots(startHour, endHour, slotMinutes);
  const agendamentosOrganizados = organizarAgendamentosSemSobreposicao(agendamentos || []);

  if (!dataSelecionada) return null;

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-24">
      
      {/* HEADER */}
      <header className="bg-surface border-b border-border-default px-4 pt-10 pb-4 sticky top-0 z-[1000] shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1">
            <button onClick={() => mudarDia(-1)} className="p-2 text-primary-action active:scale-90 transition-transform">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            <div className="relative group cursor-pointer flex items-center">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />
              <h1 className="text-subtitle font-bold text-primary-action tracking-tight uppercase px-2 flex items-center gap-1">
                {fmtDataHeader(dataSelecionada)}
                <ChevronDown size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </h1>
            </div>

            <button onClick={() => mudarDia(1)} className="p-2 text-primary-action active:scale-90 transition-transform">
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <button 
              onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
              className="p-2 text-primary-action opacity-60 hover:opacity-100 transition-opacity"
              title="Hoje"
            >
              <Calendar size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ALERTAS */}
      {(dashDia?.alertas?.aniversariantes?.length > 0 || dashDia?.alertas?.estoque_baixo?.length > 0) && (
        <div className="bg-status-warning/10 border-b border-status-warning/20 px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <AlertTriangle size={14} className="text-status-warning" strokeWidth={3} />
          <p className="text-micro font-bold text-status-warning uppercase tracking-widest text-center leading-tight">
            Avisos importantes na central de notificações!
          </p>
        </div>
      )}

      {/* GRID DA AGENDA */}
      <main className="flex-1 p-3 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        {loadAgenda ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-small font-medium text-text-secondary">Sincronizando agenda...</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl shadow-soft border border-border-default overflow-hidden relative">
            <div className="relative">
              {timeSlots.map((time) => {
                const isHour = time.endsWith(":00");
                return (
                  <div key={time} className="flex border-b border-bg-default" style={{ height: `${slotHeightPixels}px` }}>
                    <div className="w-[64px] flex-shrink-0 border-r border-bg-default bg-surface flex justify-center pt-1.5">
                      <span className={`text-micro font-bold ${isHour ? 'text-text-secondary' : 'text-text-muted opacity-40'}`}>
                        {time}
                      </span>
                    </div>
                    <div className="flex-1" />
                  </div>
                );
              })}

              <div className="absolute top-0 left-[64px] right-0 bottom-0 pointer-events-none">
                <div className="relative w-full h-full">
                  
                  {dataSelecionada === new Date().toISOString().split('T')[0] && (
                    <CurrentTimeIndicator startHour={startHour} slotMinutes={slotMinutes} slotHeight={slotHeightPixels} />
                  )}

                  {agendamentosOrganizados.map((ag: any) => {
                    const duracao = ag.duracao_min || ag.servico?.duracao_min || 60;
                    const pos = getPositionStyles(ag.data_hora_inicio, duracao, startHour, slotMinutes, slotHeightPixels);
                    
                    const statusColors: Record<string, string> = {
                      'confirmado': 'bg-status-success/40',
                      'atendimento': 'bg-status-warning/40',
                      'concluido': 'bg-primary-action/40',
                      'finalizado': 'bg-black/20',
                      'falta': 'bg-status-error/40'
                    };

                    return (
                      <div
                        key={ag.id}
                        onClick={() => setAgendamentoSelecionado(ag)}
                        className="absolute rounded-xl p-4 shadow-sm border-none pointer-events-auto cursor-pointer active:scale-[0.98] transition-all flex flex-col gap-1 overflow-hidden group"
                        style={{
                          top: `calc(${pos.top} + 2px)`,
                          height: `calc(${pos.height} - 4px)`,
                          left: `calc(${ag._leftPct}% + 4px)`,
                          width: `calc(${ag._widthPct}% - 8px)`,
                          backgroundColor: ag.profissional?.cor || "var(--color-primary-500)",
                          zIndex: 10
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-body font-black text-white leading-tight truncate uppercase drop-shadow-sm">
                            {ag.cliente?.nome?.split(' ')[0]}
                          </p>
                          <div className={`shrink-0 w-2 h-2 rounded-full border border-white/50 ${statusColors[ag.status] || 'bg-white/20'}`} />
                        </div>

                        {duracao >= 30 && (
                          <div className="flex flex-col gap-1 opacity-90">
                            <div className="flex items-center gap-1.5 text-white">
                              <Scissors size={10} strokeWidth={3} />
                              <p className="text-micro font-bold truncate leading-none uppercase">{ag.servico?.nome}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-white">
                              <DollarSign size={10} strokeWidth={3} />
                              <p className="text-micro font-black leading-none">R$ {Number(ag.servico?.preco || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTÃO ADICIONAR - CORRIGIDO (Fundo brand e Ícone Branco) */}
      <button 
        onClick={() => setIsModalNovoOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-action text-white rounded-2xl shadow-soft flex items-center justify-center hover:scale-105 active:scale-90 transition-all z-40"
        title="Novo Agendamento"
      >
        <Plus size={28} strokeWidth={3} className="text-white" />
      </button>

      <NovoAgendamentoModal 
        isOpen={isModalNovoOpen} 
        onClose={() => setIsModalNovoOpen(false)} 
        dataSelecionada={dataSelecionada} 
      />

      <ModalDetalhesAgendamento 
        isOpen={!!agendamentoSelecionado} 
        onClose={() => setAgendamentoSelecionado(null)} 
        agendamento={agendamentoSelecionado} 
      />

      <BottomNav />
    </div>
  );
}