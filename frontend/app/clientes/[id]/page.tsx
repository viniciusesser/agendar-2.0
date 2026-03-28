"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buscarClientePorId, quitarFiadoCliente } from "@/services/clientes.service";
import {
  ArrowLeft, Phone, FileText, DollarSign,
  Send, History, Scissors, Pencil, Calendar, ShoppingBag, Loader2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import ModalCliente from "@/components/ui/ModalCliente";
import ModalVendaDireta from "@/components/ui/ModalVendaDireta";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function PerfilClientePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalFiadoOpen, setIsModalFiadoOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalVendaOpen, setIsModalVendaOpen] = useState(false);
  const [valorPagamento, setValorPagamento] = useState("");

  const { data: cliente, isLoading, isError } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => buscarClientePorId(id),
    enabled: !!id,
  });

  const mutacaoPagar = useMutation({
    mutationFn: (valor: number) => quitarFiadoCliente(id, valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsModalFiadoOpen(false);
      setValorPagamento("");
      toast.success("Pagamento registrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Erro ao registrar pagamento.");
    },
  });

  // ─── ESTADOS DE LOADING E ERRO ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-bg-default gap-3">
        <Loader2 className="animate-spin text-primary-action" size={32} />
        <p className="text-body font-medium text-text-secondary">Carregando perfil...</p>
      </div>
    );
  }

  if (isError || !cliente) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-bg-default gap-4">
        <p className="text-body font-bold text-text-secondary">Cliente não encontrada.</p>
        <Button variant="ghost" onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  const debitoAtual = Number(cliente?.debito ?? 0);

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">

      {/* HEADER */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-3">

          {/* ESQUERDA: Voltar + Nome */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="w-10 h-10 p-0 rounded-xl flex items-center justify-center shrink-0 hover:bg-neutral-50 transition-all active:scale-95"
            >
              {/* ✅ CORRIGIDO: size={28} → size={22} */}
              <ArrowLeft size={22} strokeWidth={2.5} className="text-primary-action" />
            </Button>

            <div className="overflow-hidden">
              <h1 className="text-subtitle md:text-2xl font-black text-text-primary leading-tight truncate">
                {cliente?.nome}
              </h1>
              <p className="text-micro font-bold text-text-secondary flex items-center gap-1 mt-0.5">
                <Phone size={12} strokeWidth={2.5} /> {cliente?.telefone || 'Sem telefone'}
              </p>
            </div>
          </div>

          {/* DIREITA: Ações + Avatar */}
          <div className="flex items-center gap-3 shrink-0">

            {/* BOTÃO VENDA */}
            <Button
              variant="secondary"
              className="w-11 h-11 p-0 rounded-xl border border-primary-action/20 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => setIsModalVendaOpen(true)}
            >
              {/* ✅ CORRIGIDO: size={28} → size={22} */}
              <ShoppingBag size={22} strokeWidth={2.5} className="text-primary-action" />
            </Button>

            {/* BOTÃO EDITAR */}
            <Button
              variant="ghost"
              className="w-11 h-11 p-0 rounded-xl border border-border-default bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => setIsEditModalOpen(true)}
            >
              {/* ✅ CORRIGIDO: size={28} → size={22} */}
              <Pencil size={22} strokeWidth={2.5} className="text-text-secondary" />
            </Button>

            {/* AVATAR */}
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-action font-black text-lg shadow-inner border-2 border-white shrink-0 hidden sm:flex">
              {cliente?.nome?.charAt(0).toUpperCase()}
            </div>

          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-500 pb-32">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* COLUNA FINANCEIRA */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-6">

              {/* DÉBITO */}
              <div className="flex justify-between items-center border-b border-bg-default pb-4">
                <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={18} className="text-primary-action" /> Débito Atual
                </h2>
                <Badge variant={debitoAtual > 0 ? 'error' : 'success'}>
                  {debitoAtual > 0 ? 'Em aberto' : 'Quitado'}
                </Badge>
              </div>

              <div className="text-center py-2">
                <p className={`text-3xl font-black ${debitoAtual > 0 ? 'text-status-error' : 'text-status-success'}`}>
                  {debitoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              {debitoAtual > 0 && (
                <Button
                  fullWidth
                  className="h-11 gap-2"
                  onClick={() => setIsModalFiadoOpen(true)}
                >
                  <Send size={16} strokeWidth={2.5} /> Registrar Pagamento
                </Button>
              )}

            </Card>

            {/* OBSERVAÇÕES */}
            {cliente?.observacoes && (
              <Card className="p-6 space-y-3">
                <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <FileText size={18} className="text-primary-action" /> Observações
                </h2>
                <p className="text-body text-text-primary leading-relaxed">
                  {cliente.observacoes}
                </p>
              </Card>
            )}

            {/* ANIVERSÁRIO */}
            {cliente?.aniversario && (
              <Card className="p-6 space-y-3">
                <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={18} className="text-primary-action" /> Aniversário
                </h2>
                <p className="text-body font-bold text-text-primary">
                  {new Date(cliente.aniversario).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                  })}
                </p>
              </Card>
            )}
          </div>

          {/* COLUNA HISTÓRICO */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 border-b border-bg-default pb-4">
                <History size={18} className="text-primary-action" /> Histórico de Atendimentos
              </h2>

              {cliente?.agendamentos?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-secondary">
                  <Scissors size={40} strokeWidth={1.5} className="opacity-30" />
                  <p className="text-body font-medium">Nenhum atendimento registrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cliente?.agendamentos?.map((ag: any) => (
                    <div
                      key={ag.id}
                      className="flex items-center justify-between p-4 bg-bg-default rounded-xl border border-border-default"
                    >
                      <div className="space-y-0.5">
                        <p className="text-body font-black text-text-primary">
                          {ag.servico?.nome}
                        </p>
                        <p className="text-small text-text-secondary font-medium">
                          {new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                          {' · '}{ag.profissional?.nome}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body font-black text-status-success">
                          {Number(ag.valor || ag.servico?.preco || 0).toLocaleString('pt-BR', {
                            style: 'currency', currency: 'BRL'
                          })}
                        </p>
                        <Badge
                          variant={ag.status === 'finalizado' ? 'success' : ag.status === 'cancelado' ? 'error' : 'default'}
                          className="text-[10px] uppercase mt-1"
                        >
                          {ag.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>

      {/* MODAL: REGISTRAR PAGAMENTO */}
      <Modal
        isOpen={isModalFiadoOpen}
        onClose={() => setIsModalFiadoOpen(false)}
        title="Registrar Pagamento"
      >
        <div className="space-y-5">
          <p className="text-body text-text-secondary font-medium">
            Débito atual:{' '}
            <strong className="text-status-error">
              {debitoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </p>

          <Input
            type="number"
            label="VALOR DO PAGAMENTO (R$)"
            placeholder="0,00"
            step="0.01"
            min="0.01"
            value={valorPagamento}
            onChange={e => setValorPagamento(e.target.value)}
          />

          <Button
            fullWidth
            className="h-12"
            isLoading={mutacaoPagar.isPending}
            disabled={!valorPagamento || Number(valorPagamento) <= 0}
            onClick={() => mutacaoPagar.mutate(Number(valorPagamento))}
          >
            Confirmar Pagamento
          </Button>
        </div>
      </Modal>

      {/* MODAL: EDITAR CLIENTE */}
      <ModalCliente
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['cliente', id] });
        }}
        cliente={cliente}
      />

      {/* MODAL: VENDA DIRETA */}
      <ModalVendaDireta
        isOpen={isModalVendaOpen}
        onClose={() => setIsModalVendaOpen(false)}
        cliente={{ id, nome: cliente?.nome ?? '' }}
      />

    </div>
  );
}