"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarProfissionais } from "@/services/profissionais.service";
import { Users, Plus, Pencil, Link as LinkIcon, ArrowLeft, Loader2, Scissors, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ModalProfissional from "@/components/ui/ModalProfissional";
import ModalConvite from "@/components/ui/ModalConvite";
import BottomNav from "@/components/ui/BottomNav";

// Importação dos componentes do Design System 2.0
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function EquipePage() {
  const { data: profissionais, isLoading } = useQuery({
    queryKey: ['profissionais'],
    queryFn: buscarProfissionais
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const [profissionalEditando, setProfissionalEditando] = useState<any>(null);

  function abrirNovo() {
    setProfissionalEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(prof: any) {
    setProfissionalEditando(prof);
    setModalAberto(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">
      {/* HEADER: Enterprise Standard - Padronizado */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors">
              <ArrowLeft size={28} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Users size={22} strokeWidth={2.5} /> Equipe
            </h1>
          </div>
          <Badge variant="default" className="px-3 py-1 font-black uppercase">
            {profissionais?.length || 0} Integrantes
          </Badge>
        </div>
      </header>

      {/* LISTA DE PROFISSIONAIS */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-40">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Sincronizando equipe...</p>
          </div>
        ) : (!profissionais || profissionais.length === 0) ? (
          <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-border-default max-w-2xl mx-auto">
            <Users size={48} strokeWidth={1.5} className="mx-auto text-primary-action mb-4 opacity-40" />
            <p className="text-text-secondary font-medium italic text-body">Nenhum profissional cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profissionais.map((prof: any) => (
              <Card 
                key={prof.id} 
                className="p-4 md:p-5 flex items-center justify-between group hover:border-primary-action/30 hover:shadow-md transition-all border-border-default h-full"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-on-primary font-bold text-lg shadow-sm border-2 border-surface shrink-0"
                    style={{ backgroundColor: prof.cor || 'var(--color-primary-500)' }}
                  >
                    {prof.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden pr-2">
                    <h3 className="font-bold text-text-primary text-subtitle leading-tight truncate mb-1.5" title={prof.nome}>
                      {prof.nome}
                    </h3>
                    
                    <div className="flex flex-col gap-2">
                      <Badge variant="success" className="text-xs font-bold uppercase bg-status-success/10 text-status-success border-0 px-2.5 py-1 w-max">
                        <Scissors size={14} className="mr-1.5" strokeWidth={2.5} /> 
                        <span className="font-black text-sm mr-1">{prof.comissao_pct || 0}%</span> SERV.
                      </Badge>
                      <Badge variant="warning" className="text-xs font-bold uppercase bg-status-warning/10 text-status-warning border-0 px-2.5 py-1 w-max">
                        <Package size={14} className="mr-1.5" strokeWidth={2.5} /> 
                        <span className="font-black text-sm mr-1">{prof.comissao_produto_pct || 0}%</span> PROD.
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost"
                  onClick={() => abrirEdicao(prof)}
                  className="w-14 h-14 p-0 rounded-md text-text-muted hover:text-primary-action hover:bg-primary-50 shrink-0 opacity-100 md:opacity-40 group-hover:opacity-100 transition-opacity"
                  title="Editar Profissional"
                >
                  <Pencil size={18} strokeWidth={2.5} />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* BOTÕES DE AÇÃO FLUTUANTES (FAB) */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-[1001]">
        {/* Botão de Convite (Fundo Branco, Ícone Cor) */}
        <button 
          onClick={() => setModalConviteAberto(true)} 
          className="w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Gerar link de convite"
        >
          <LinkIcon size={28} strokeWidth={2.5} />
        </button>

        {/* Botão de Cadastro (Fundo Cor, Ícone Branco) */}
        <button 
          onClick={abrirNovo} 
          className="w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          title="Adicionar Profissional"
        >
          <Plus size={28} strokeWidth={3} className="text-white" />
        </button>
      </div>

      {/* MODAIS */}
      <ModalProfissional 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        profissional={profissionalEditando} 
      />
      <ModalConvite 
        isOpen={modalConviteAberto} 
        onClose={() => setModalConviteAberto(false)} 
      />

      <BottomNav />
    </div>
  );
}