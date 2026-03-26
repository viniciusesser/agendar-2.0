"use client";

import { DollarSign, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quitarFiadoCliente } from "@/services/clientes.service";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ModalQuitarFiadoProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: any | null;
}

export default function ModalQuitarFiado({ isOpen, onClose, cliente }: ModalQuitarFiadoProps) {
  const queryClient = useQueryClient();
  const [valor, setValor] = useState("");

  // Sempre que o modal abrir, sugere o valor total da dívida conforme Seção 17
  useEffect(() => {
    if (cliente?.debito) {
      setValor(cliente.debito.toString());
    }
  }, [cliente, isOpen]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!cliente?.id) throw new Error("Cliente inválida");
      return quitarFiadoCliente(cliente.id, Number(valor));
    },
    onSuccess: () => {
      // Sincronização de estado conforme Seção 22
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro'] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error?.message || "Erro ao quitar fiado.");
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
      title="Receber Pagamento"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-in fade-in duration-300">
        
        {/* INFO DÍVIDA: Visual com alto contraste e tipografia Enterprise */}
        <div className="p-5 bg-bg-default border border-border-default rounded-xl space-y-2 shadow-inner">
          <p className="text-body text-text-secondary font-medium leading-relaxed">
            A cliente <span className="text-text-primary font-bold">{cliente?.nome}</span> possui um saldo devedor de:
          </p>
          <p className="text-3xl font-black text-status-error tracking-tight">
            R$ {Number(cliente?.debito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* CAMPO VALOR: Input atômico com destaque para o financeiro */}
        <Input 
          type="number" 
          label="VALOR SENDO PAGO (R$)"
          min="0.01" 
          max={cliente?.debito} 
          step="0.01" 
          required 
          value={valor} 
          onChange={(e) => setValor(e.target.value)}
          className="text-2xl font-black text-text-primary h-14"
          placeholder="0,00"
        />

        {/* BOTÃO CONFIRMAR: Variante de sucesso integrada */}
        <Button 
          type="submit" 
          fullWidth 
          className="h-14 bg-status-success hover:brightness-95 shadow-md gap-2"
          isLoading={mutation.isPending}
          disabled={!valor || Number(valor) <= 0}
        >
          <Check size={20} strokeWidth={3} />
          Confirmar Recebimento
        </Button>
      </form>
    </Modal>
  );
}