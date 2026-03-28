"use client";

import { User, Percent, Palette, Trash2, Check, Scissors, Package, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarProfissional, editarProfissional, excluirProfissional } from "@/services/profissionais.service";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from 'sonner'

interface ModalProfissionalProps {
  isOpen: boolean;
  onClose: () => void;
  profissional?: any | null;
}

const CORES_DISPONIVEIS = [
  "#CF97A0", "#C9A3AC", "#A8C8A0", "#F0C080", 
  "#8b5cf6", "#0ea5e9", "#14b8a6", "#5A5E61"
];

export default function ModalProfissional({ isOpen, onClose, profissional }: ModalProfissionalProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [comissao, setComissao] = useState<string>("0");
  const [comissaoProduto, setComissaoProduto] = useState<string>("0");
  const [cor, setCor] = useState<string>(CORES_DISPONIVEIS[0]);
  const [ativo, setAtivo] = useState(true); // NOVO: Controle de status

  useEffect(() => {
    if (profissional && isOpen) {
      setNome(profissional.nome);
      setComissao(profissional.comissao_pct?.toString() || "0");
      setComissaoProduto(profissional.comissao_produto_pct?.toString() || "0");
      setCor(profissional.cor || CORES_DISPONIVEIS[0]);
      setAtivo(profissional.ativo !== false); // Define como ativo se não estiver explicitamente falso
    } else if (isOpen) {
      setNome(""); setComissao("0"); setComissaoProduto("0"); setAtivo(true);
      setCor(CORES_DISPONIVEIS[0]);
    }
  }, [profissional, isOpen]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { 
        nome, 
        comissao_pct: Number(comissao), 
        comissao_produto_pct: Number(comissaoProduto),
        cor,
        ativo // Enviando o status para o backend
      };
      
      if (profissional?.id) return editarProfissional(profissional.id, payload);
      return criarProfissional(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] }); 
      onClose();
    },
    onError: () => alert("Erro ao salvar dados da profissional.")
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (profissional?.id) return excluirProfissional(profissional.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
      onClose();
    },
    onError: (err: any) => {
      const code = err.response?.data?.error?.code
      if (code === 'LIMITE_PLANO_ATINGIDO') {
        toast.error('Limite de profissionais atingido. Fale conosco para fazer upgrade do plano.')
      } else {
        toast.error('Erro ao salvar dados da profissional.')
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={profissional ? "Configurações da Profissional" : "Nova Profissional"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* TOGGLE STATUS (Só aparece na edição) */}
        {profissional && (
          <div className="flex items-center justify-between p-3 bg-bg-default rounded-xl border border-border-default">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ativo ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                <Power size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-small font-black text-text-primary uppercase tracking-tight">Status na Agenda</p>
                <p className="text-micro font-bold text-text-secondary uppercase">{ativo ? 'Disponível para agendar' : 'Perfil Desativado'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAtivo(!ativo)}
              className={`w-12 h-6 rounded-full transition-all relative ${ativo ? 'bg-status-success' : 'bg-neutral-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${ativo ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        )}

        <Input 
          label="NOME COMPLETO"
          placeholder="Ex: Camila Silva"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="font-black"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            type="number" label="SERVIÇOS (%)" 
            value={comissao} onChange={(e) => setComissao(e.target.value)}
            className="font-black text-center"
          />
          <Input 
            type="number" label="PRODUTOS (%)" 
            value={comissaoProduto} onChange={(e) => setComissaoProduto(e.target.value)}
            className="font-black text-center"
          />
        </div>

        <div className="space-y-4">
          <label className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <Palette size={16} className="text-primary-action" /> Cor na Agenda
          </label>
          <div className="flex flex-wrap gap-3 justify-center">
            {CORES_DISPONIVEIS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setCor(hex)}
                style={{ backgroundColor: hex }}
                className={`w-10 h-10 rounded-full transition-all flex items-center justify-center border-4 ${
                  cor === hex ? "border-primary-action scale-110 shadow-md" : "border-white shadow-sm"
                }`}
              >
                {cor === hex && <Check size={18} className="text-white" strokeWidth={4} />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-border-default">
          <Button type="submit" fullWidth className="h-14 font-black" isLoading={mutation.isPending}>
            {profissional ? "Atualizar Profissional" : "Confirmar Cadastro"}
          </Button>

          {profissional && (
            <Button 
              type="button" variant="ghost" fullWidth 
              onClick={() => {
                if(window.confirm("Tentar exclusão definitiva? Isso só funcionará se ela não tiver nenhum histórico.")) {
                  deleteMutation.mutate();
                }
              }}
              className="text-status-error/60 hover:text-status-error hover:bg-status-error/5 text-micro font-bold"
              isLoading={deleteMutation.isPending}
            >
              <Trash2 size={16} className="mr-2" /> Forçar Exclusão do Banco
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}