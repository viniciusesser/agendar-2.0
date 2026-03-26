"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarEstoque, registrarVendaDireta } from "@/services/estoque.service";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShoppingBag, DollarSign, PackageCheck, CreditCard, Tag, Layers, Loader2 } from "lucide-react";

interface ModalVendaDiretaProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: {
    id: string;
    nome: string;
  } | null;
}

export default function ModalVendaDireta({ isOpen, onClose, cliente }: ModalVendaDiretaProps) {
  const queryClient = useQueryClient();
  const [produtoIdSelecionado, setProdutoIdSelecionado] = useState<string>("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [formaPagamento, setFormaPagamento] = useState<string>("pix");

  // Busca o estoque atualizado sempre que o modal abre
  const { data: produtos, isLoading } = useQuery({
    queryKey: ['estoque'],
    queryFn: listarEstoque,
    enabled: isOpen, 
  });

  const produtosDisponiveis = useMemo(() => {
    return produtos?.filter((p: any) => Number(p.quantidade) > 0) || [];
  }, [produtos]);

  const produtoSelecionado = useMemo(() => {
    return produtosDisponiveis.find((p: any) => p.id === produtoIdSelecionado);
  }, [produtoIdSelecionado, produtosDisponiveis]);

  const valorTotal = useMemo(() => {
    if (!produtoSelecionado) return 0;
    return Number(produtoSelecionado.preco_venda || 0) * quantidade;
  }, [produtoSelecionado, quantidade]);

  const mutacaoVenda = useMutation({
    mutationFn: async () => {
      if (!cliente) throw new Error("Cliente não selecionado");
      await registrarVendaDireta({
        cliente_id: cliente.id,
        produto_id: produtoIdSelecionado,
        quantidade,
        valor_total: valorTotal,
        forma_pagamento: formaPagamento
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', cliente?.id] });
      limparEFechar();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || "Erro ao processar venda.");
    }
  });

  const limparEFechar = () => {
    setProdutoIdSelecionado("");
    setQuantidade(1);
    setFormaPagamento("pix");
    onClose();
  };

  const handleFinalizarVenda = () => {
    if (!produtoIdSelecionado) return alert("Selecione um produto.");
    if (quantidade <= 0) return alert("A quantidade deve ser maior que zero.");
    if (produtoSelecionado && quantidade > Number(produtoSelecionado.quantidade)) {
      return alert("Estoque insuficiente.");
    }
    mutacaoVenda.mutate();
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-text-primary font-bold appearance-none cursor-pointer shadow-inner";

  if (!cliente) return null;

  return (
    <Modal isOpen={isOpen} onClose={limparEFechar} title="Venda de Produto (PDV)">
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* IDENTIFICAÇÃO DA CLIENTE */}
        <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary-action flex items-center justify-center text-white shrink-0 shadow-md">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-primary-action font-black uppercase tracking-widest leading-tight">Venda para</p>
            <p className="text-subtitle font-black text-primary-900 truncate">{cliente.nome}</p>
          </div>
        </div>

        {/* SELEÇÃO DE PRODUTO */}
        <div className="space-y-2">
          <label className="text-micro font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
            <Tag size={14} className="text-primary-action" /> Selecione o Produto
          </label>
          <div className="relative">
            <select 
              value={produtoIdSelecionado} 
              onChange={e => setProdutoIdSelecionado(e.target.value)} 
              className={selectStyle}
              disabled={isLoading}
            >
              <option value="" disabled>
                {isLoading ? "Carregando estoque..." : "Escolha um item..."}
              </option>
              {produtosDisponiveis.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({Number(p.quantidade)} em estoque)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GRADE DE QUANTIDADE E PAGAMENTO */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input 
              type="number"
              label="QUANTIDADE"
              value={quantidade} 
              onChange={e => setQuantidade(Number(e.target.value))} 
              min={1}
              className="font-black text-center text-lg h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-micro font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
              <CreditCard size={14} className="text-primary-action" /> Pagamento
            </label>
            <select 
              value={formaPagamento} 
              onChange={e => setFormaPagamento(e.target.value)} 
              className={selectStyle}
            >
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">C. Débito</option>
              <option value="credito">C. Crédito</option>
            </select>
          </div>
        </div>

        {/* BOX DE RESUMO FINANCEIRO */}
        <div className="pt-2">
          <div className="flex items-center justify-between bg-bg-default p-5 rounded-2xl border-2 border-dashed border-border-default shadow-inner">
            <div className="flex flex-col">
              <span className="text-micro font-black text-text-secondary uppercase tracking-widest">Total a Receber</span>
              {produtoSelecionado && (
                <span className="text-[10px] text-text-muted font-bold">
                  {quantidade}x {Number(produtoSelecionado.preco_venda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-status-success tracking-tighter">
                R$ {valorTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            fullWidth 
            className="h-14 text-subtitle font-black gap-2 shadow-lg"
            isLoading={mutacaoVenda.isPending}
            onClick={handleFinalizarVenda}
            disabled={!produtoIdSelecionado || quantidade <= 0}
          >
            <PackageCheck size={24} strokeWidth={2.5} />
            Finalizar Venda
          </Button>
          
          <button 
            type="button"
            onClick={limparEFechar}
            className="w-full text-center py-2 text-micro font-black text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}