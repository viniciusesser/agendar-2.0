"use client";

import { User, Phone, Calendar as CalendarIcon, FileText, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarCliente, editarCliente, deletarCliente } from "@/services/clientes.service";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ModalClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: any | null;
}

export default function ModalCliente({ isOpen, onClose, cliente }: ModalClienteProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aniversario, setAniversario] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (cliente && isOpen) {
      setNome(cliente.nome || "");
      setTelefone(cliente.telefone || "");
      setAniversario(cliente.aniversario ? cliente.aniversario.split('T')[0] : "");
      setObservacoes(cliente.observacoes || "");
    } else if (isOpen) {
      setNome(""); setTelefone(""); setAniversario(""); setObservacoes("");
    }
  }, [cliente, isOpen]);

  const mutationSalvar = useMutation({
    mutationFn: async () => {
      const payload = { 
        nome, 
        telefone: telefone || undefined, 
        aniversario: aniversario ? new Date(`${aniversario}T12:00:00`).toISOString() : undefined,
        observacoes: observacoes || undefined 
      };
      
      if (cliente?.id) return editarCliente(cliente.id, payload);
      return criarCliente(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      if (cliente?.id) queryClient.invalidateQueries({ queryKey: ['cliente', cliente.id] });
      onClose();
    },
    onError: () => alert("Ops! Erro ao salvar a cliente. Verifique a conexão.")
  });

  const mutationExcluir = useMutation({
    mutationFn: async () => {
      if (!cliente?.id) return;
      if (confirm(`Deseja realmente remover ${cliente.nome}? Esta ação é irreversível.`)) {
        await deletarCliente(cliente.id);
      } else {
        throw new Error("Cancelado");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      onClose();
    },
    onError: (error: any) => {
      if (error.message !== "Cancelado") alert("Erro ao excluir. Clientes com histórico de agendamentos não podem ser removidas.");
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
      title={cliente ? "Ficha da Cliente" : "Nova Cliente"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* CAMPO NOME */}
        <div className="space-y-1.5">
          <Input 
            label="NOME COMPLETO"
            placeholder="Ex: Fernanda Costa"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="font-black text-text-primary"
          />
        </div>

        {/* CONTATOS E DATAS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Input 
              label="WHATSAPP"
              type="tel"
              placeholder="(11) 9..."
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Input 
              label="NASCIMENTO"
              type="date"
              value={aniversario}
              onChange={(e) => setAniversario(e.target.value)}
              className="font-bold uppercase"
            />
          </div>
        </div>

        {/* NOTAS */}
        <div className="space-y-1.5">
          <label className="text-micro font-black text-text-secondary uppercase tracking-widest flex items-center gap-2 ml-1">
            <FileText size={14} className="text-primary-action" /> Notas Especiais
          </label>
          <textarea 
            value={observacoes} 
            onChange={(e) => setObservacoes(e.target.value)} 
            placeholder="Preferências, alergias ou observações..."
            className="w-full p-4 rounded-xl border border-border-default bg-bg-default/30 outline-none focus:border-primary-action text-body font-medium text-text-primary shadow-inner transition-all resize-none h-28" 
          />
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border-default/50">
          <Button 
            type="submit" 
            fullWidth 
            className="h-14 text-subtitle font-black"
            isLoading={mutationSalvar.isPending}
          >
            {cliente ? "Salvar Alterações" : "Cadastrar Cliente"}
          </Button>

          {cliente && (
            <Button 
              type="button"
              variant="ghost" 
              fullWidth
              onClick={() => mutationExcluir.mutate()}
              className="text-status-error hover:bg-status-error/5 font-bold h-12 gap-2"
              disabled={mutationSalvar.isPending}
            >
              <Trash2 size={18} strokeWidth={2.5} />
              Excluir Cliente
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}