"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarClientes } from "@/services/clientes.service";
import { buscarConfiguracoes } from "@/services/configuracoes.service";
import { Megaphone, MessageCircle, ArrowLeft, Cake, AlertCircle, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { useState } from "react";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function MarketingPage() {
  const [filtro, setFiltro] = useState<'devedores' | 'aniversariantes' | 'todos'>('devedores');

  // Busca os clientes via React Query
  const { data: clientes, isLoading: loadClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => buscarClientes()
  });

  // Busca os templates de WhatsApp das configurações
  const { data: configs, isLoading: loadConfigs } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: buscarConfiguracoes
  });

  const isLoading = loadClientes || loadConfigs;

  // Lógica de Filtro Dinâmico
  const clientesFiltrados = clientes?.filter(c => {
    if (filtro === 'devedores') return Number(c.debito) > 0;
    
    if (filtro === 'aniversariantes') {
      if (!c.aniversario) return false;
      const aniv = new Date(c.aniversario);
      const hoje = new Date();
      return aniv.getMonth() === hoje.getMonth();
    }
    
    return true; 
  }) || [];

  const formatarMoeda = (valor: number | string) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const enviarWhatsApp = (cliente: any) => {
    if (!cliente.telefone) return alert("Esta cliente não tem telefone cadastrado.");

    let template = "";
    
    if (filtro === 'devedores') {
      template = configs?.whatsapp_template_cobranca || "Olá {{nome}}, seu saldo em aberto é R$ {{debito}}. Podemos resolver?";
    } else if (filtro === 'aniversariantes') {
      template = configs?.whatsapp_template_aniversario || "Feliz aniversário {{nome}}! 🎂 Temos um presente especial pra você.";
    } else {
      template = configs?.whatsapp_template_retorno || "Sentimos sua falta, {{nome}}! Que tal agendar um horário?";
    }

    let mensagem = template.replace(/{{nome}}/g, cliente.nome.split(' ')[0]); 
    
    if (cliente.debito) {
      mensagem = mensagem.replace(/{{debito}}/g, formatarMoeda(cliente.debito));
    }
    
    const numeroLimpo = cliente.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-24">
      
      {/* HEADER: Enterprise Standard - Padronizado */}
      <header className="px-4 md:px-8 pt-10 pb-6 bg-surface border-b border-border-default shadow-sm sticky top-0 z-[900] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors">
              <ArrowLeft size={28} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Megaphone size={22} strokeWidth={2.5} /> Marketing
            </h1>
          </div>

          {/* ABAS DE FILTRO: Adaptadas para Desktop e Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar w-full md:w-auto md:pb-0">
            <Button 
              variant={filtro === 'devedores' ? 'danger' : 'ghost'}
              onClick={() => setFiltro('devedores')}
              className={`h-11 px-4 rounded-lg text-micro md:text-small font-bold whitespace-nowrap border ${
                filtro === 'devedores' ? 'border-status-error' : 'border-border-default bg-neutral-100 text-text-secondary hover:bg-neutral-200'
              }`}
            >
              <AlertCircle size={18} strokeWidth={2.5} /> Cobrar Fiados
            </Button>

            <Button 
              variant="ghost"
              onClick={() => setFiltro('aniversariantes')}
              className={`h-11 px-4 rounded-lg text-micro md:text-small font-bold whitespace-nowrap border transition-all ${
                filtro === 'aniversariantes' 
                  ? 'bg-status-success text-white border-status-success shadow-sm' 
                  : 'border-border-default bg-neutral-100 text-text-secondary hover:bg-neutral-200'
              }`}
            >
              <Cake size={18} strokeWidth={2.5} /> Aniversários
            </Button>

            <Button 
              variant={filtro === 'todos' ? 'primary' : 'ghost'}
              onClick={() => setFiltro('todos')}
              className={`h-11 px-4 rounded-lg text-micro md:text-small font-bold whitespace-nowrap border transition-all ${
                filtro === 'todos' ? 'border-primary-action shadow-sm' : 'border-border-default bg-neutral-100 text-text-secondary hover:bg-neutral-200'
              }`}
            >
              <Users size={18} strokeWidth={2.5} /> Todos Clientes
            </Button>
          </div>
        </div>
      </header>

      {/* LISTA DE CLIENTES - Alterado para Grid Fluido (max-w-7xl) */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Analisando base de clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-border-default max-w-2xl mx-auto">
            <Megaphone size={48} strokeWidth={1.5} className="mx-auto text-primary-action mb-4 opacity-40" />
            <p className="text-text-secondary font-medium italic text-body">Nenhum registro encontrado para este filtro.</p>
          </div>
        ) : (
          /* MÁGICA DO GRID: 1 coluna no celular, 2 no tablet, 3 ou 4 no Desktop grande */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id} className="p-5 flex flex-col gap-5 border-border-default hover:border-primary-action/30 hover:shadow-md transition-all h-full">
                
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden pr-2">
                    <h3 className="font-bold text-text-primary text-subtitle leading-tight truncate" title={cliente.nome}>
                      {cliente.nome}
                    </h3>
                    <p className="text-small text-text-secondary font-medium mt-1 uppercase tracking-wide truncate">
                      {cliente.telefone || 'Sem telefone'}
                    </p>
                  </div>
                  
                  {filtro === 'devedores' && (
                    <Badge variant="error" className="text-body md:text-subtitle font-black shrink-0">
                      {formatarMoeda(cliente.debito)}
                    </Badge>
                  )}
                  {filtro === 'aniversariantes' && (
                    <Badge variant="success" className="bg-status-success/10 text-status-success border-0 px-2 py-1 shrink-0">
                      <Cake size={14} className="mr-1" strokeWidth={3} /> Hoje
                    </Badge>
                  )}
                </div>
                
                {/* Espaçador flexível para alinhar o botão sempre embaixo */}
                <div className="flex-1" />

                <Button 
                  onClick={() => enviarWhatsApp(cliente)}
                  disabled={!cliente.telefone}
                  className={`w-full text-white border-none shadow-md h-12 transition-all hover:-translate-y-0.5 ${
                    !cliente.telefone 
                      ? 'bg-neutral-300 text-neutral-500 shadow-none' 
                      : 'bg-[#25D366] hover:bg-[#20ba5a] hover:shadow-lg'
                  }`}
                >
                  <MessageCircle size={20} strokeWidth={2.5} className="mr-2" /> 
                  <span className="font-bold">
                    {filtro === 'devedores' ? 'Cobrar pelo Whats' : filtro === 'aniversariantes' ? 'Dar Parabéns' : 'Chamar no Whats'}
                  </span>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}