"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarFinanceiro } from "@/services/financeiro.service";
import { Wallet, Plus, TrendingUp, TrendingDown, CalendarDays, Receipt, Loader2, Scissors, Package } from "lucide-react";
import { useState } from "react";
import ModalLancamento from "@/components/ui/ModalLancamento";
import BottomNav from "@/components/ui/BottomNav";

// Importação dos componentes do Design System 2.0
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function FinanceiroPage() {
  // Ajuste de fuso horário para data inicial (Regra 10 do DS)
  const hoje = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [dataFiltro, setDataFiltro] = useState(hoje);
  const [modalAberto, setModalAberto] = useState(false);

  const { data: relatorio, isLoading } = useQuery({
    queryKey: ['financeiro', dataFiltro],
    queryFn: () => buscarFinanceiro(dataFiltro)
  });

  const formatarMoeda = (valor: number | string) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const entradas = relatorio?.total_entradas || 0;
  const saidas = relatorio?.total_saidas || 0;
  const saldo = relatorio?.saldo || 0;
  const lancamentos = relatorio?.lancamentos || [];

  // LÓGICA DE SEPARAÇÃO: Serviços x Produtos
  const entradasServicos = lancamentos
    .filter((l: any) => l.tipo === 'entrada' && l.origem?.toLowerCase().includes('servic'))
    .reduce((acc: number, l: any) => acc + Number(l.valor), 0);

  const entradasProdutos = lancamentos
    .filter((l: any) => l.tipo === 'entrada' && (l.origem?.toLowerCase().includes('produt') || l.origem?.toLowerCase().includes('pdv') || l.origem?.toLowerCase().includes('venda')))
    .reduce((acc: number, l: any) => acc + Number(l.valor), 0);

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-32">
      
      {/* HEADER: Enterprise Standard */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between max-w-7xl mx-auto w-full gap-5">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Wallet size={22} strokeWidth={2.5} /> Financeiro
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* FILTRO DE DATA: Texto na mesma linha e ícone alinhado */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-micro font-black text-text-secondary uppercase tracking-widest shrink-0">
                Filtrar
              </label>
              <div className="relative w-full md:w-[220px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary-action opacity-60 pointer-events-none">
                  <CalendarDays size={18} strokeWidth={2.5} />
                </div>
                <Input 
                  type="date" 
                  value={dataFiltro}
                  onChange={(e) => setDataFiltro(e.target.value)}
                  className="pl-11 font-black w-full bg-bg-default/50 h-11"
                />
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
        
        {/* GRID DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* CARD DE ENTRADAS */}
          <Card className="p-4 md:p-6 border-l-4 border-status-success shadow-sm flex flex-col h-full">
            <div>
              <div className="flex items-center gap-2 text-status-success mb-2">
                <TrendingUp size={18} strokeWidth={3} /> 
                <span className="text-micro font-black uppercase tracking-wider">Entradas</span>
              </div>
              <p className="text-subtitle md:text-2xl font-black text-text-primary truncate" title={formatarMoeda(entradas)}>
                {formatarMoeda(entradas)}
              </p>
            </div>
            
            <div className="mt-auto pt-4 space-y-1.5">
              <div className="flex justify-between items-center text-micro font-bold border-t border-border-default/50 pt-3">
                <span className="text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Scissors size={12} className="text-status-success" /> Serviços
                </span>
                <span className="text-text-primary">{formatarMoeda(entradasServicos)}</span>
              </div>
              <div className="flex justify-between items-center text-micro font-bold">
                <span className="text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={12} className="text-status-success" /> Produtos
                </span>
                <span className="text-text-primary">{formatarMoeda(entradasProdutos)}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 border-l-4 border-status-error shadow-sm flex flex-col h-full">
            <div>
              <div className="flex items-center gap-2 text-status-error mb-2">
                <TrendingDown size={18} strokeWidth={3} /> 
                <span className="text-micro font-black uppercase tracking-wider">Saídas</span>
              </div>
              <p className="text-subtitle md:text-2xl font-black text-text-primary truncate" title={formatarMoeda(saidas)}>
                {formatarMoeda(saidas)}
              </p>
            </div>
            <div className="mt-auto pt-4 space-y-1.5 opacity-0 pointer-events-none">
              <div className="flex justify-between items-center text-micro font-bold border-t border-transparent pt-3">
                <span>Espaçador</span><span>R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center text-micro font-bold">
                <span>Espaçador</span><span>R$ 0,00</span>
              </div>
            </div>
          </Card>

          {/* DESTAQUE DE SALDO DO DIA */}
          <Card className="col-span-2 lg:col-span-1 p-6 md:p-8 flex items-center justify-between border-2 border-dashed border-border-default shadow-inner h-full bg-bg-default/40">
            <div className="overflow-hidden pr-2">
              <p className="text-small font-bold text-text-secondary uppercase tracking-widest mb-1">Saldo do Dia</p>
              <p className={`text-3xl md:text-4xl font-black tracking-tighter truncate ${saldo >= 0 ? 'text-status-success' : 'text-status-error'}`} title={formatarMoeda(saldo)}>
                {formatarMoeda(saldo)}
              </p>
            </div>
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
              saldo >= 0 ? 'bg-status-success text-white' : 'bg-status-error text-white'
            }`}>
              <Wallet size={28} strokeWidth={2.5} className="md:w-8 md:h-8" />
            </div>
          </Card>
        </div>

        {/* LISTA DE MOVIMENTAÇÕES DETALHADA */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-subtitle md:text-xl font-bold text-text-secondary px-1 flex items-center gap-2 uppercase tracking-wider">
            <Receipt size={22} strokeWidth={2.5} className="text-primary-action" /> Movimentações
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3 bg-surface rounded-xl border border-border-default">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-body font-medium text-text-secondary">Sincronizando caixa...</p>
            </div>
          ) : lancamentos.length === 0 ? (
            <div className="text-center py-16 bg-surface/50 rounded-xl border-2 border-dashed border-border-default">
              <Receipt size={48} className="mx-auto text-text-muted mb-4 opacity-40" />
              <p className="text-text-secondary font-medium italic text-body">Nenhuma movimentação para esta data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {lancamentos.map((lanc: any) => (
                <Card key={lanc.id} className="p-4 md:p-5 flex items-center justify-between group border-border-default hover:border-primary-action/30 hover:shadow-md transition-all h-full">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                      lanc.tipo === 'entrada' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                    }`}>
                      {lanc.tipo === 'entrada' ? <TrendingUp size={20} strokeWidth={3} /> : <TrendingDown size={20} strokeWidth={3} />}
                    </div>
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-text-primary text-body md:text-subtitle leading-tight mb-1 truncate uppercase" title={lanc.descricao}>
                        {lanc.descricao}
                      </p>
                      <p className="text-micro text-text-secondary font-bold uppercase tracking-wide truncate">
                        {lanc.forma_pagamento} • {lanc.origem.replace('_', ' ')}
                        {lanc.cliente?.nome && <span className="text-primary-action"> • {lanc.cliente.nome.split(' ')[0]}</span>}
                      </p>
                    </div>
                  </div>
                  <p className={`font-black text-body md:text-subtitle shrink-0 pl-2 ${lanc.tipo === 'entrada' ? 'text-status-success' : 'text-status-error'}`}>
                    {lanc.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(lanc.valor)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* BOTÃO ADICIONAR (FAB) */}
      <button 
        onClick={() => setModalAberto(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[1001]"
        title="Novo Lançamento"
      >
        <Plus size={28} strokeWidth={3} className="text-white" />
      </button>

      <ModalLancamento isOpen={modalAberto} onClose={() => setModalAberto(false)} dataSelecionada={dataFiltro} />
      
      <BottomNav />
    </div>
  );
}