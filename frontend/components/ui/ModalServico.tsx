"use client";

import { Scissors, Clock, DollarSign, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarServico, editarServico, deletarServico } from "@/services/servicos.service";

// Importação dos componentes atômicos Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ModalServicoProps {
  isOpen: boolean;
  onClose: () => void;
  servico?: any | null;
}

export default function ModalServico({ isOpen, onClose, servico }: ModalServicoProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState<string>("60");
  const [preco, setPreco] = useState<string>("0");

  useEffect(() => {
    if (servico && isOpen) {
      setNome(servico.nome);
      setDuracao(servico.duracao_min?.toString() || "60");
      setPreco(servico.preco?.toString() || "0");
    } else if (isOpen) {
      setNome("");
      setDuracao("60");
      setPreco("0");
    }
  }, [servico, isOpen]);

  const mutationSalvar = useMutation({
    mutationFn: async () => {
      const payload = { 
        nome, 
        duracao_min: Number(duracao), 
        preco: Number(preco) 
      };
      
      if (servico?.id) return editarServico(servico.id, payload);
      return criarServico(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      onClose();
    },
    onError: () => alert("Erro ao salvar o serviço. Verifique os campos.")
  });

  const mutationExcluir = useMutation({
    mutationFn: async () => {
      if (!servico?.id) return;
      if (confirm(`Deseja realmente remover o serviço "${servico.nome}"? Esta ação não pode ser desfeita.`)) {
        await deletarServico(servico.id);
      } else {
        throw new Error("Cancelado");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      onClose();
    },
    onError: (error: any) => {
      if (error.message !== "Cancelado") {
        alert("Não foi possível excluir. Este serviço pode estar vinculado a agendamentos existentes.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutationSalvar.mutate();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={servico ? "Configurar Serviço" : "Novo Serviço"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* NOME DO SERVIÇO */}
        <div className="space-y-1.5">
          <label className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 ml-1">
            <Scissors size={14} className="text-primary-action" /> Descrição do Serviço
          </label>
          <Input 
            placeholder="Ex: Escova Progressiva"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* DURAÇÃO ESTIMADA */}
          <div className="space-y-1.5">
            <label className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 ml-1">
              <Clock size={14} className="text-primary-action" /> Duração (min)
            </label>
            <Input 
              type="number"
              min="5"
              step="5"
              required
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className="font-bold text-center"
            />
          </div>

          {/* PREÇO BASE */}
          <div className="space-y-1.5">
            <label className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 ml-1">
              <DollarSign size={14} className="text-primary-action" /> Preço Base
            </label>
            <Input 
              type="number"
              min="0"
              step="0.01"
              required
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="font-black text-text-primary text-center"
            />
          </div>
        </div>

        <p className="text-micro text-text-secondary italic opacity-70 px-1 leading-relaxed">
          * Este preço é uma base e pode ser alterado manualmente durante o checkout de cada atendimento.
        </p>

        {/* AÇÕES FINAIS */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border-default">
          <Button 
            type="submit" 
            fullWidth 
            className="h-14 text-subtitle font-black"
            isLoading={mutationSalvar.isPending}
            disabled={mutationExcluir.isPending}
          >
            {servico ? "Atualizar Serviço" : "Criar Serviço"}
          </Button>

          {servico && (
            <Button 
              type="button"
              variant="ghost" 
              fullWidth
              onClick={() => mutationExcluir.mutate()}
              className="text-status-error hover:bg-status-error/5 h-12 gap-2 font-bold"
              disabled={mutationSalvar.isPending}
            >
              <Trash2 size={18} strokeWidth={2.5} />
              Remover Serviço
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}