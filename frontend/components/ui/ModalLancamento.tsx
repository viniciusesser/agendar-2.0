"use client";

import { TrendingUp, TrendingDown, DollarSign, FileText, CreditCard, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarLancamentoManual } from "@/services/financeiro.service";

// Importação dos componentes atômicos do Design System 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ModalLancamentoProps {
  isOpen: boolean;
  onClose: () => void;
  dataSelecionada: string;
}

export default function ModalLancamento({ isOpen, onClose, dataSelecionada }: ModalLancamentoProps) {
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida');
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [data, setData] = useState(dataSelecionada);

  // Sincroniza a data do modal com a data que o usuário está filtrando na tela principal
  useEffect(() => {
    if (isOpen) {
      setData(dataSelecionada);
    }
  }, [isOpen, dataSelecionada]);

  const mutation = useMutation({
    mutationFn: async () => {
      return criarLancamentoManual({
        tipo,
        valor: Number(valor),
        descricao,
        forma_pagamento: formaPagamento,
        data: new Date(`${data}T12:00:00`).toISOString(), // Garantindo fuso horário neutro
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      setValor("");
      setDescricao("");
      onClose();
    },
    onError: () => alert("Ops! Erro ao salvar lançamento. Verifique os campos.")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-body font-bold appearance-none cursor-pointer shadow-inner";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Novo Lançamento Manual"
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* SELETOR DE TIPO: Visualmente forte para evitar erros de caixa */}
        <div className="flex gap-2 p-1.5 bg-bg-default rounded-xl border border-border-default shadow-inner">
          <button
            type="button"
            onClick={() => setTipo('entrada')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-micro font-black uppercase tracking-widest transition-all ${
              tipo === 'entrada' 
                ? 'bg-status-success text-white shadow-md scale-[1.02]' 
                : 'text-text-muted hover:text-text-secondary hover:bg-neutral-200'
            }`}
          >
            <TrendingUp size={18} strokeWidth={3} /> Entrada
          </button>
          
          <button
            type="button"
            onClick={() => setTipo('saida')}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-micro font-black uppercase tracking-widest transition-all ${
              tipo === 'saida' 
                ? 'bg-status-error text-white shadow-md scale-[1.02]' 
                : 'text-text-muted hover:text-text-secondary hover:bg-neutral-200'
            }`}
          >
            <TrendingDown size={18} strokeWidth={3} /> Saída
          </button>
        </div>

        {/* VALOR COM DESTAQUE */}
        <div className="relative">
          <Input 
            type="number" 
            label="VALOR DO LANÇAMENTO (R$)"
            min="0.01" 
            step="0.01" 
            required 
            value={valor} 
            onChange={(e) => setValor(e.target.value)} 
            placeholder="0,00"
            className={`text-2xl font-black text-center transition-colors ${
              tipo === 'entrada' ? 'text-status-success' : 'text-status-error'
            }`}
          />
        </div>

        {/* DESCRIÇÃO */}
        <Input 
          label="DESCRIÇÃO OU MOTIVO"
          required 
          value={descricao} 
          onChange={(e) => setDescricao(e.target.value)} 
          placeholder={tipo === 'entrada' ? "Ex: Venda de Acessórios" : "Ex: Café e Material de Limpeza"}
          className="font-bold"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* MEIO DE PAGAMENTO */}
          <div className="space-y-1.5">
            <label className="text-micro font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
              <CreditCard size={14} className="text-primary-action" /> Pagamento
            </label>
            <div className="relative">
              <select 
                value={formaPagamento} 
                onChange={(e) => setFormaPagamento(e.target.value)} 
                className={selectStyle}
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="debito">C. Débito</option>
                <option value="credito">C. Crédito</option>
              </select>
            </div>
          </div>

          {/* DATA DO LANÇAMENTO */}
          <div className="space-y-1.5">
            <Input 
              type="date" 
              label="DATA"
              required 
              value={data} 
              onChange={(e) => setData(e.target.value)} 
              className="font-bold"
            />
          </div>
        </div>

        {/* BOTÃO DE CONFIRMAÇÃO */}
        <div className="pt-4 border-t border-border-default/50">
          <Button 
            type="submit" 
            fullWidth 
            className={`h-14 text-subtitle font-black transition-all ${
              tipo === 'entrada' ? 'bg-status-success hover:bg-status-success/90' : 'bg-status-error hover:bg-status-error/90'
            }`}
            isLoading={mutation.isPending}
            disabled={!valor || !descricao}
          >
            {tipo === 'entrada' ? 'Registrar Recebimento' : 'Registrar Pagamento'}
          </Button>
          
          <button 
            type="button"
            onClick={onClose}
            className="w-full text-center mt-4 text-micro font-black text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors"
          >
            Cancelar e Voltar
          </button>
        </div>
      </form>
    </Modal>
  );
}