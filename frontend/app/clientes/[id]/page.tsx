"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buscarClientePorId, quitarFiadoCliente } from "@/services/clientes.service";
import { 
  ArrowLeft, Phone, FileText, DollarSign, 
  Send, History, Scissors, Pencil, Calendar, ShoppingBag, Loader2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || "Erro ao registrar pagamento.");
    }
  });

  const formatarMoeda = (valor: number | string) => 
    Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatarData = (dataIso: string) => {
    const data = new Date(dataIso);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-bg-default text-primary-action">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-24">
      
      {/* HEADER CORRIGIDO: Simetria total entre Voltar, Venda e Editar */}
      <header className="px-4 py-6 md:py-8 bg-surface border-b border-border-default sticky top-0 z-[900] shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-4">
          
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            {/* BOTÃO VOLTAR: Agora no padrão w-14 h-14 / rounded-2xl */}
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="w-14 h-14 p-0 rounded-2xl border border-border-default bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft size={28} strokeWidth={2.5} className="text-primary-action" />
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

          <div className="flex items-center gap-3 shrink-0">
            {/* BOTÃO VENDA */}
            <Button 
              variant="secondary"
              className="w-14 h-14 p-0 rounded-2xl border border-primary-action/20 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => setIsModalVendaOpen(true)}
            >
              <ShoppingBag size={28} strokeWidth={2.5} className="text-primary-action" />
            </Button>

            {/* BOTÃO EDITAR */}
            <Button 
              variant="ghost"
              className="w-14 h-14 p-0 rounded-2xl border border-border-default bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil size={28} strokeWidth={2.5} className="text-text-secondary" />
            </Button>

            {/* AVATAR: Alinhado em altura com os botões */}
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-action font-black text-xl shadow-inner border-2 border-white shrink-0 hidden sm:flex">
              {cliente?.nome?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA FINANCEIRA */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-bg-default pb-4">
                <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={18} className="text-primary-action" /> Débito Atual
                </h2>
                <Badge variant={Number(cliente?.debito) > 0 ? "error" : "success"} className="text-small font-black">
                  {formatarMoeda(cliente?.debito)}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 font-bold"
                  disabled={Number(cliente?.debito) <= 0}
                  onClick={() => setIsModalFiadoOpen(true)}
                >
                  Baixar Valor
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1 h-12 border-primary-action/20 text-primary-action font-bold"
                  disabled={Number(cliente?.debito) <= 0}
                  onClick={() => {
                    const msg = `Olá ${cliente.nome}, seu saldo é ${formatarMoeda(cliente.debito)}.`;
                    window.open(`https://wa.me/55${cliente.telefone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`);
                  }}
                >
                  Cobrar
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest mb-6 border-b border-bg-default pb-3">
                Dados Pessoais
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-primary-action" />
                  <p className="text-small font-bold text-text-primary">
                    {cliente?.aniversario ? new Date(cliente.aniversario).toLocaleDateString('pt-BR') : 'Sem nascimento'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText size={18} className="text-primary-action mt-1" />
                  <p className="text-small italic text-text-secondary leading-relaxed">
                    {cliente?.observacoes || 'Nenhuma observação.'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* COLUNA HISTÓRICO */}
          <div className="lg:col-span-8">
            <Card className="p-6 h-full">
              <h2 className="text-micro font-black text-text-secondary uppercase tracking-widest mb-6 border-b border-bg-default pb-3">
                Histórico de Atendimentos
              </h2>
              
              <div className="space-y-4">
                {(!cliente?.agendamentos || cliente.agendamentos.length === 0) ? (
                  <div className="py-20 text-center border-2 border-dashed border-border-default rounded-2xl bg-bg-default/30">
                    <History size={40} className="mx-auto text-text-muted mb-3 opacity-20" />
                    <p className="text-small text-text-muted font-medium italic">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cliente.agendamentos.map((ag: any) => (
                      <div key={ag.id} className="p-4 bg-surface rounded-xl border border-border-default shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-black text-text-primary text-small uppercase tracking-tight">{ag.servico?.nome}</p>
                          <Badge variant={ag.status === 'cancelado' ? 'error' : 'success'}>{ag.status}</Badge>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold text-text-secondary uppercase opacity-70">
                          <span>{formatarData(ag.data_hora_inicio)}</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{background: ag.profissional?.cor}} />
                            {ag.profissional?.nome}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* MODAIS MANTIDOS */}
      <Modal isOpen={isModalFiadoOpen} onClose={() => setIsModalFiadoOpen(false)} title="Receber Pagamento">
        <div className="space-y-6">
          <Input 
            type="number" label="VALOR" value={valorPagamento} 
            onChange={e => setValorPagamento(e.target.value)} className="text-center font-black"
          />
          <Button fullWidth onClick={() => mutacaoPagar.mutate(Number(valorPagamento))}>Confirmar</Button>
        </div>
      </Modal>

      <ModalCliente isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} cliente={cliente} />
      <ModalVendaDireta isOpen={isModalVendaOpen} onClose={() => setIsModalVendaOpen(false)} cliente={cliente} />

    </div>
  );
}