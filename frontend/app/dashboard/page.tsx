"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarDashboardDia, buscarDashboardMes } from "@/services/dashboard.service";
import { 
  BarChart, Calendar, Package, Cake, Wallet, 
  PieChart, Activity, Loader2, ArrowUpRight, ArrowDownRight, Users2, DollarSign
} from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/ui/BottomNav";

// Importação dos componentes Enterprise
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const hoje = new Date();
  const dataHojeStr = hoje.toISOString().split('T')[0];
  
  const [abaAtiva, setAbaAtiva] = useState<'dia' | 'mes'>('dia');
  const [dataFiltro, setDataFiltro] = useState(dataHojeStr);

  const { data: dashDia, isLoading: loadDia } = useQuery({
    queryKey: ['dashboard-dia', dataFiltro],
    queryFn: () => buscarDashboardDia(dataFiltro),
    enabled: abaAtiva === 'dia'
  });

  const { data: dashMes, isLoading: loadMes } = useQuery({
    queryKey: ['dashboard-mes', hoje.getFullYear(), hoje.getMonth() + 1],
    queryFn: () => buscarDashboardMes(hoje.getFullYear(), hoje.getMonth() + 1),
    enabled: abaAtiva === 'mes'
  });

  const formatarMoeda = (valor: number) => 
    Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const isLoading = abaAtiva === 'dia' ? loadDia : loadMes;

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">
      
      {/* HEADER: Enterprise Standard */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between max-w-7xl mx-auto w-full gap-5">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <BarChart size={22} strokeWidth={2.5} /> Dashboard
            </h1>
          </div>

          {/* SELETOR DE VISÃO */}
          <div className="flex bg-neutral-100 p-1 rounded-lg border border-border-default w-full md:w-[320px]">
            <button 
              onClick={() => setAbaAtiva('dia')}
              className={`flex-1 py-2 text-micro font-bold rounded-md transition-all uppercase tracking-wider ${
                abaAtiva === 'dia' ? 'bg-surface text-primary-action shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Visão Diária
            </button>
            <button 
              onClick={() => setAbaAtiva('mes')}
              className={`flex-1 py-2 text-micro font-bold rounded-md transition-all uppercase tracking-wider ${
                abaAtiva === 'mes' ? 'bg-surface text-primary-action shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Visão Mensal
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Sincronizando métricas...</p>
          </div>
        ) : abaAtiva === 'dia' && dashDia ? (
          <div className="space-y-8">
            
            {/* FILTRO DE DATA */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-micro font-black text-text-secondary uppercase tracking-widest shrink-0">
                Data do Relatório
              </label>
              <div className="relative w-full md:w-[220px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary-action opacity-60 pointer-events-none">
                  <Calendar size={18} strokeWidth={2} />
                </div>
                <Input 
                  type="date" 
                  value={dataFiltro}
                  onChange={(e) => setDataFiltro(e.target.value)}
                  className="pl-11 font-black w-full bg-surface h-11"
                />
              </div>
            </div>

            {/* GRID DE MÉTRICAS PRINCIPAIS (DIA) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 md:p-6 border-l-4 border-status-success hover:shadow-md transition-shadow">
                <p className="text-micro text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <ArrowUpRight size={14} className="text-status-success" /> Entradas
                </p>
                <p className="text-subtitle md:text-2xl font-black text-text-primary truncate" title={formatarMoeda(dashDia.financeiro.total_entradas)}>
                  {formatarMoeda(dashDia.financeiro.total_entradas)}
                </p>
              </Card>

              <Card className="p-4 md:p-6 border-l-4 border-status-error hover:shadow-md transition-shadow">
                <p className="text-micro text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <ArrowDownRight size={14} className="text-status-error" /> Saídas
                </p>
                <p className="text-subtitle md:text-2xl font-black text-text-primary truncate" title={formatarMoeda(dashDia.financeiro.total_saidas)}>
                  {formatarMoeda(dashDia.financeiro.total_saidas)}
                </p>
              </Card>

              <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                <p className="text-micro text-text-secondary font-bold mb-2 uppercase tracking-widest">Ticket Médio</p>
                <p className="text-subtitle md:text-2xl font-black text-text-primary truncate">
                  {formatarMoeda(dashDia.financeiro.ticket_medio)}
                </p>
              </Card>

              <Card className="p-4 md:p-6 hover:shadow-md transition-shadow">
                <p className="text-micro text-text-secondary font-bold mb-2 uppercase tracking-widest">Ocupação</p>
                <p className="text-subtitle md:text-2xl font-black text-primary-action">
                  {dashDia.agenda.ocupacao_pct}%
                </p>
              </Card>
            </div>

            {/* REPASSES E ALERTAS (DIA) - MANTIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <h2 className="text-micro font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-2">
                  <PieChart size={16} /> Repasse da Equipe (Hoje)
                </h2>
                <Card className="p-0 divide-y divide-border-default overflow-hidden border-border-default">
                  {dashDia.comissoes.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">
                      <PieChart size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-small italic">Nenhum repasse registrado hoje.</p>
                    </div>
                  ) : (
                    dashDia.comissoes.map((com: any) => (
                      <div key={com.profissional_id} className="p-4 md:p-5 flex justify-between items-center hover:bg-neutral-50 transition-colors">
                        <span className="text-body font-bold text-text-secondary">{com.nome}</span>
                        <Badge variant="success" className="text-body md:text-subtitle font-black">
                          {formatarMoeda(com.valor)}
                        </Badge>
                      </div>
                    ))
                  )}
                </Card>
              </div>

              {(dashDia.alertas.estoque_baixo.length > 0 || dashDia.alertas.aniversariantes.length > 0) && (
                <div className="space-y-4">
                  <h2 className="text-micro font-bold text-text-secondary uppercase tracking-wider ml-1 text-status-warning">
                    Atenção Especial
                  </h2>
                  <div className="space-y-3">
                    {dashDia.alertas.aniversariantes.map((cli: any) => (
                      <Card key={cli.id} className="flex items-center gap-4 p-4 md:p-5 border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-primary-50 p-3 rounded-full text-primary-action shrink-0"><Cake size={24} /></div>
                        <p className="text-small md:text-body text-text-secondary font-medium">
                          Aniversário de <strong className="text-text-primary text-subtitle">{cli.nome}</strong> hoje!
                        </p>
                      </Card>
                    ))}
                    {dashDia.alertas.estoque_baixo.map((prod: any) => (
                      <Card key={prod.id} className="flex items-center gap-4 p-4 md:p-5 border-status-warning/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-status-warning/10 p-3 rounded-full text-status-warning shrink-0"><Package size={24} /></div>
                        <p className="text-small md:text-body text-text-secondary font-medium">
                          <strong className="text-subtitle text-text-primary">{prod.nome}</strong> está abaixo do mínimo.
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : abaAtiva === 'mes' && dashMes ? (
          <div className="space-y-8">
            
            {/* CARD MENSAL - ÍCONE DE FUNDO REMOVIDO PARA LIMPAR O CANTO APONTADO */}
            <Card className="bg-surface p-6 md:p-8 border border-border-default shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-8">
                <div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Wallet size={14} strokeWidth={2.5} className="text-primary-action" /> Faturamento Bruto (Mês)
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-text-primary tracking-tighter">
                    {formatarMoeda(dashMes.financeiro.total_entradas)}
                  </p>
                </div>
                
                {/* Métricas Secundárias Identificadas */}
                <div className="flex justify-between items-end border-t border-border-default pt-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary-action uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Users2 size={12} /> Visitas
                    </span>
                    <span className="text-2xl font-black text-text-primary tracking-tight">
                      {dashMes.financeiro.atendimentos}
                    </span>
                  </div>
                  <div className="flex flex-col text-right items-end">
                    <span className="text-[10px] font-black text-primary-action uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <DollarSign size={12} /> Ticket Médio
                    </span>
                    <span className="text-2xl font-black text-text-primary tracking-tight">
                      {formatarMoeda(dashMes.financeiro.ticket_medio)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-micro font-bold text-text-secondary uppercase tracking-wider ml-1 flex items-center gap-2">
                <Activity size={16} /> Ranking de Desempenho (Profissionais)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashMes.por_profissional.map((prof: any) => (
                  <Card key={prof.profissional_id} className="p-5 flex flex-col gap-2 hover:border-primary-action transition-colors group shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-center border-b border-border-default pb-2">
                      <span className="text-subtitle font-black text-text-primary group-hover:text-primary-action transition-colors truncate pr-2">
                        {prof.nome}
                      </span>
                      <span className="text-subtitle font-black text-primary-action shrink-0">
                        {formatarMoeda(prof.faturamento)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-small font-bold text-text-secondary">Atendimentos</span>
                      <span className="text-small font-black text-text-primary">
                        {prof.atendimentos}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-small font-bold text-text-secondary">Repasse</span>
                      <span className="text-small font-black text-status-success">
                        {formatarMoeda(prof.comissao)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}