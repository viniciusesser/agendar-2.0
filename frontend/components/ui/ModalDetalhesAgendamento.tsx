"use client";

import { 
  X, Clock, User, Scissors, CheckCircle2, PlayCircle, XCircle,
  PackagePlus, Trash2, DollarSign, CheckSquare, CreditCard, UserMinus,
  Loader2, Receipt, Plus
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

import { atualizarStatusAgendamento, finalizarCheckoutAgendamento } from "@/services/agendamentos.service"; 
import { listarEstoque } from "@/services/estoque.service";

interface ModalDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
}

export default function ModalDetalhesAgendamento({ isOpen, onClose, agendamento }: ModalDetalhesProps) {
  const queryClient = useQueryClient();
  const [statusAtual, setStatusAtual] = useState('');
  const [produtosComanda, setProdutosComanda] = useState<any[]>([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  
  // Estado para permitir alteração do preço do serviço no ato do checkout
  const [precoServicoFinal, setPrecoServicoFinal] = useState(0);

  useEffect(() => {
    if (agendamento && isOpen) {
      setStatusAtual(agendamento.status);
      setProdutosComanda([]); 
      setFormaPagamento("pix");
      // Inicializa o preço final com o preço padrão do serviço
      setPrecoServicoFinal(Number(agendamento.servico?.preco || 0));
    }
  }, [agendamento, isOpen]);

  const { data: estoque, isLoading: carregandoEstoque } = useQuery({
    queryKey: ['estoque'],
    queryFn: listarEstoque,
    enabled: isOpen,
  });

  const produtosDisponiveis = useMemo(() => {
    return estoque?.filter((p: any) => Number(p.quantidade) > 0) || [];
  }, [estoque]);

  const mutationStatus = useMutation({
    mutationFn: (novoStatus: string) => atualizarStatusAgendamento(agendamento.id, novoStatus),
    onSuccess: (_, novoStatus) => {
      setStatusAtual(novoStatus);
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
    },
    onError: () => alert("Erro ao atualizar status.")
  });

  const mutationCheckout = useMutation({
    mutationFn: () => finalizarCheckoutAgendamento(agendamento.id, {
      forma_pagamento: formaPagamento,
      valor_servico: Number(precoServicoFinal),
      produtos_comanda: produtosComanda.map(p => ({
        id: p.id,
        quantidade: 1, 
        preco_venda: Number(p.preco_venda)
      }))
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      if (agendamento.cliente_id) queryClient.invalidateQueries({ queryKey: ['cliente', agendamento.cliente_id] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || "Erro ao processar o checkout.");
    }
  });

  if (!agendamento) return null;

  // Cálculo do total usando o preço que pode ter sido editado
  const valorProdutos = produtosComanda.reduce((acc, prod) => acc + Number(prod.preco_venda || 0), 0);
  const valorTotal = Number(precoServicoFinal) + valorProdutos;

  const statusConfig: Record<string, { cor: string; label: string; bg: string }> = {
    'agendado': { cor: 'text-neutral-500', bg: 'bg-neutral-100', label: 'Agendado' },
    'confirmado': { cor: 'text-status-success', bg: 'bg-status-success/10', label: 'Confirmado' },
    'atendimento': { cor: 'text-status-warning', bg: 'bg-status-warning/10', label: 'Em Atendimento' },
    'concluido': { cor: 'text-primary-action', bg: 'bg-primary-50', label: 'Aguardando Pagamento' },
    'finalizado': { cor: 'text-text-primary', bg: 'bg-neutral-200', label: 'Finalizado' },
    'falta': { cor: 'text-status-error', bg: 'bg-status-error/10', label: 'Falta' },
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-text-primary font-bold appearance-none cursor-pointer";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Atendimento">
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-subtitle font-black text-text-primary uppercase tracking-tight truncate pr-4">
              {agendamento.cliente?.nome}
            </h2>
            <Badge className={`${statusConfig[statusAtual]?.bg} ${statusConfig[statusAtual]?.cor} border-0 font-black px-3 py-1`}>
              {statusConfig[statusAtual]?.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-micro font-bold text-text-secondary mt-1">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(agendamento.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex items-center gap-1.5"><User size={14} /> {agendamento.profissional?.nome}</span>
          </div>
        </div>

        {/* WORKFLOW DE STATUS */}
        <div className="flex flex-wrap gap-2 p-1 bg-bg-default rounded-xl border border-border-default">
          {statusAtual === 'agendado' && (
            <Button variant="ghost" className="flex-1 text-status-success hover:bg-status-success/10 h-10 gap-2" onClick={() => mutationStatus.mutate('confirmado')}>
              <CheckCircle2 size={16} strokeWidth={2.5} /> Confirmar
            </Button>
          )}
          {(statusAtual === 'agendado' || statusAtual === 'confirmado') && (
            <Button variant="ghost" className="flex-1 text-status-warning hover:bg-status-warning/10 h-10 gap-2" onClick={() => mutationStatus.mutate('atendimento')}>
              <PlayCircle size={16} strokeWidth={2.5} /> Iniciar
            </Button>
          )}
          {statusAtual === 'atendimento' && (
            <Button variant="ghost" className="flex-1 text-primary-action hover:bg-primary-50 h-10 gap-2 font-black" onClick={() => mutationStatus.mutate('concluido')}>
              <CheckCircle2 size={16} strokeWidth={2.5} /> Concluir Serviço
            </Button>
          )}
          {(['agendado', 'confirmado'].includes(statusAtual)) && (
            <Button variant="ghost" className="text-status-error hover:bg-status-error/10 h-10 px-3" onClick={() => mutationStatus.mutate('falta')}>
              <XCircle size={18} strokeWidth={2.5} />
            </Button>
          )}
        </div>

        {/* INFORMAÇÕES DO SERVIÇO COM PREÇO EDITÁVEL */}
        <div className="bg-bg-default/50 border border-border-default rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-action shadow-sm border border-border-default">
              <Scissors size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-small font-black text-text-primary">{agendamento.servico?.nome}</p>
              <p className="text-micro font-bold text-text-secondary uppercase">VALOR DO PROCEDIMENTO</p>
            </div>
          </div>
          
          {statusAtual === 'concluido' ? (
            <div className="relative w-28">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-micro font-black text-text-secondary">R$</span>
              <input 
                type="number"
                value={precoServicoFinal}
                onChange={(e) => setPrecoServicoFinal(Number(e.target.value))}
                className="w-full h-10 pl-8 pr-2 bg-surface border-2 border-primary-action/20 rounded-lg text-right font-black text-text-primary focus:border-primary-action outline-none transition-all shadow-sm"
              />
            </div>
          ) : (
            <p className="text-subtitle font-black text-text-primary">R$ {precoServicoFinal.toFixed(2)}</p>
          )}
        </div>

        {/* SEÇÃO DE CHECKOUT / COMANDA */}
        {statusAtual === 'concluido' && (
          <div className="space-y-6 pt-2 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-3">
              <h3 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <PackagePlus size={16} className="text-primary-action" /> Adicionar à Comanda
              </h3>
              <div className="flex gap-2">
                <select 
                  value={produtoSelecionadoId} 
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                  className={selectStyle}
                  disabled={carregandoEstoque}
                >
                  <option value="" disabled>Selecione um produto...</option>
                  {produtosDisponiveis.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nome} - R$ {Number(p.preco_venda).toFixed(2)}</option>
                  ))}
                </select>
                <Button className="h-12 w-12 p-0 shrink-0" onClick={() => {
                  const prod = produtosDisponiveis.find((p: any) => p.id === produtoSelecionadoId);
                  if (prod) { setProdutosComanda([...produtosComanda, prod]); setProdutoSelecionadoId(""); }
                }} disabled={!produtoSelecionadoId}>
                  <Plus size={20} strokeWidth={3} />
                </Button>
              </div>

              {produtosComanda.length > 0 && (
                <div className="space-y-2">
                  {produtosComanda.map((prod, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-surface border border-border-default rounded-xl shadow-sm">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-small font-bold truncate pr-2">{prod.nome}</p>
                        <p className="text-micro font-black text-status-success">R$ {Number(prod.preco_venda).toFixed(2)}</p>
                      </div>
                      <button onClick={() => setProdutosComanda(produtosComanda.filter((_, i) => i !== index))} className="p-2 text-text-muted hover:text-status-error">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-border-default border-dashed">
              <h3 className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={16} className="text-primary-action" /> Forma de Pagamento
              </h3>
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className={selectStyle}>
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="debito">Cartão de Débito</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="fiado">Pendurar (Fiado)</option>
              </select>
            </div>
          </div>
        )}

        {/* RESUMO TOTAL */}
        <div className="pt-6 border-t-2 border-border-default space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Receipt size={18} />
              <span className="text-body font-bold">Total Final</span>
            </div>
            <span className="text-2xl font-black text-text-primary tracking-tighter">
              R$ {valorTotal.toFixed(2)}
            </span>
          </div>

          {statusAtual === 'concluido' ? (
            <Button 
              fullWidth 
              className={`h-14 text-subtitle font-black gap-3 shadow-lg ${formaPagamento === 'fiado' ? 'bg-status-warning hover:bg-status-warning/90' : ''}`}
              isLoading={mutationCheckout.isPending}
              onClick={() => mutationCheckout.mutate()}
            >
              {formaPagamento === 'fiado' ? <UserMinus size={22} strokeWidth={2.5} /> : <CheckSquare size={22} strokeWidth={2.5} />}
              {formaPagamento === 'fiado' ? 'Pendurar Fiado' : 'Finalizar Atendimento'}
            </Button>
          ) : statusAtual === 'finalizado' ? (
            <div className="h-14 bg-status-success/10 border-2 border-status-success/20 rounded-xl flex items-center justify-center gap-3 text-status-success font-black">
              <CheckCircle2 size={24} strokeWidth={3} /> ATENDIMENTO FINALIZADO
            </div>
          ) : (
            <p className="text-center text-micro font-black text-text-muted uppercase tracking-widest animate-pulse italic">
              Conclua o atendimento para processar o valor
            </p>
          )}
        </div>

      </div>
    </Modal>
  );
}