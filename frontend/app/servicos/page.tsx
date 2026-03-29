"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buscarServicos, criarServico, editarServico, deletarServico } from "@/services/servicos.service";
import { Scissors, Plus, ArrowLeft, Pencil, Trash2, Clock, DollarSign, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import BottomNav from "@/components/ui/BottomNav";

export default function ServicosPage() {
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<any>(null);
  const [form, setForm] = useState({ nome: "", duracao_min: 60, preco: 0 });

  const { data: servicos, isLoading } = useQuery({
    queryKey: ['servicos'],
    queryFn: buscarServicos
  });

  const mutacaoSalvar = useMutation({
    mutationFn: () => servicoEditando 
      ? editarServico(servicoEditando.id, form) 
      : criarServico(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      fecharModal();
    },
    onError: () => alert("Erro ao salvar serviço.")
  });

  const mutacaoDeletar = useMutation({
    mutationFn: (id: string) => deletarServico(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servicos'] }),
    onError: () => alert("Erro ao excluir. Pode haver agendamentos vinculados.")
  });

  const abrirModalNovo = () => {
    setServicoEditando(null);
    setForm({ nome: "", duracao_min: 60, preco: 0 });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (serv: any) => {
    setServicoEditando(serv);
    setForm({ nome: serv.nome, duracao_min: Number(serv.duracao_min), preco: Number(serv.preco) });
    setIsModalOpen(true);
  };

  const fecharModal = () => setIsModalOpen(false);

  const formatarMoeda = (valor: number | string) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-text-primary font-bold appearance-none cursor-pointer";

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-32">
      
      {/* HEADER: Enterprise Standard - Padronizado */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors active:scale-90">
              <ArrowLeft size={28} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Scissors size={22} strokeWidth={2.5} /> Serviços
            </h1>
          </div>
          <Badge variant="default" className="px-3 py-1 font-black">
            {servicos?.length || 0} CADASTRADOS
          </Badge>
        </div>
      </header>

      {/* LISTAGEM DE SERVIÇOS */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Sincronizando catálogo...</p>
          </div>
        ) : (!servicos || servicos.length === 0) ? (
          <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-border-default max-w-2xl mx-auto">
            <Scissors size={48} strokeWidth={1.5} className="mx-auto text-primary-action mb-4 opacity-40" />
            <p className="text-text-secondary font-medium italic text-body">Nenhum serviço cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {servicos.map((servico: any) => (
              <Card key={servico.id} className="p-5 flex flex-col gap-4 border-border-default hover:border-primary-action/30 hover:shadow-md transition-all h-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-text-primary text-subtitle leading-tight flex-1 pr-4 line-clamp-2" title={servico.nome}>
                    {servico.nome}
                  </h3>
                  <p className="text-subtitle font-black text-status-success whitespace-nowrap shrink-0">
                    {formatarMoeda(servico.preco)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 border-b border-border-default/60 pb-4">
                  <Badge variant="warning" className="gap-1.5 px-2.5">
                    <Clock size={14} strokeWidth={2.5} /> {servico.duracao_min} min
                  </Badge>
                  <span className="flex items-center gap-1.5 text-micro font-bold text-text-secondary opacity-70 uppercase tracking-widest">
                    <DollarSign size={14} strokeWidth={2.5} /> Preço Fixo
                  </span>
                </div>

                <div className="flex-1" />

                <div className="flex justify-between items-center pt-1">
                  <Button 
                    variant="ghost" 
                    onClick={() => abrirModalEditar(servico)} 
                    className="text-micro font-bold text-text-secondary hover:text-primary-action gap-1.5 h-auto p-2 hover:bg-primary-50"
                  >
                    <Pencil size={16} strokeWidth={2.5} /> Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => { if(confirm(`Excluir o serviço "${servico.nome}"?`)) mutacaoDeletar.mutate(servico.id); }} 
                    className="text-micro font-bold text-status-error/60 hover:text-status-error gap-1.5 h-auto p-2 hover:bg-status-error/10"
                  >
                    <Trash2 size={16} strokeWidth={2.5} /> Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* BOTÃO ADICIONAR (FAB): Padronizado rounded-2xl com Ícone Branco */}
      <button 
        onClick={abrirModalNovo}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[1001]"
        title="Novo Serviço"
      >
        <Plus size={28} strokeWidth={3} className="text-white" />
      </button>

      {/* MODAL DE FORMULÁRIO */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={fecharModal}
        title={servicoEditando ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <div className="space-y-5">
          <Input 
            label="NOME DO SERVIÇO"
            placeholder="Ex: Corte Feminino" 
            value={form.nome} 
            onChange={e => setForm({...form, nome: e.target.value})} 
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1">Duração</label>
              <select 
                value={form.duracao_min} 
                onChange={e => setForm({...form, duracao_min: Number(e.target.value)})} 
                className={selectStyle}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
                <option value="90">1h 30min</option>
                <option value="120">2 horas</option>
                <option value="150">2h 30min</option>
                <option value="180">3 horas</option>
                <option value="210">3h 30min</option>
                <option value="240">4 horas</option>
                <option value="270">4h 30min</option>
                <option value="300">5 horas</option>
              </select>
            </div>
            <Input 
              type="number" 
              label="PREÇO (R$)"
              step="0.01"
              min="0"
              value={form.preco} 
              onChange={e => setForm({...form, preco: Number(e.target.value)})} 
              className="font-black text-status-success"
            />
          </div>

          <Button 
            fullWidth 
            className="mt-4"
            isLoading={mutacaoSalvar.isPending}
            disabled={!form.nome}
            onClick={() => mutacaoSalvar.mutate()}
          >
            Salvar Serviço
          </Button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}