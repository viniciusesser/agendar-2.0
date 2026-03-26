"use client";

import { User, Scissors, Star, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import ModalCliente from "./ModalCliente";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dataSelecionada: string;
}

export default function NovoAgendamentoModal({ isOpen, onClose, dataSelecionada }: Props) {
  const queryClient = useQueryClient();

  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState<number | string>(""); // Novo estado para o valor flexível
  const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClienteId("");
      setServicoId("");
      setProfissionalId("");
      setHorario("");
      setValor("");
    }
  }, [isOpen]);

  // Busca de Clientes
  const { data: clientes = [], isLoading: loadClientes } = useQuery({
    queryKey: ['clientes', 'modal-agendamento'],
    queryFn: async () => {
      const res = await api.get('/clientes', { params: { limite: 100 } });
      return res.data?.data?.clientes || res.data?.data || [];
    },
    enabled: isOpen,
  });

  // Busca de Serviços
  const { data: servicos = [], isLoading: loadServicos } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      const res = await api.get('/servicos');
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  // Busca de Profissionais
  const { data: profissionais = [], isLoading: loadProfissionais } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const res = await api.get('/profissionais');
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  // Lógica para preencher o valor base ao selecionar o serviço
  const handleServicoChange = (id: string) => {
    setServicoId(id);
    const servicoSelecionado = servicos.find((s: any) => s.id === id);
    if (servicoSelecionado) {
      setValor(Number(servicoSelecionado.preco));
    }
  };

  const mutationSalvar = useMutation({
    mutationFn: async () => {
      const dataHoraInicio = new Date(`${dataSelecionada}T${horario}:00`).toISOString();
      const payload = {
        cliente_id: clienteId,
        servico_id: servicoId,
        profissional_id: profissionalId,
        data_hora_inicio: dataHoraInicio,
        valor: Number(valor), // Enviando o valor (que pode ser o original ou o alterado)
      };
      const response = await api.post('/agendamentos', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || "Erro ao criar agendamento.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutationSalvar.mutate();
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-body font-medium text-text-primary shadow-inner appearance-none cursor-pointer disabled:opacity-50";

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Novo Agendamento"
      >
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
          
          {/* CLIENTE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-micro font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-primary-action" /> Cliente
              </label>
              <button 
                type="button"
                onClick={() => setIsModalClienteOpen(true)}
                className="text-micro font-black text-primary-action uppercase tracking-wider hover:opacity-70 transition-opacity"
              >
                + Nova Cliente
              </button>
            </div>
            <select 
              required 
              value={clienteId} 
              onChange={e => setClienteId(e.target.value)}
              className={selectStyle}
              disabled={loadClientes}
            >
              <option value="" disabled>
                {loadClientes ? "Sincronizando..." : "Selecione a cliente..."}
              </option>
              {clientes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* SERVIÇO E VALOR (Grid para alinhar horizontalmente no desktop se quiser, ou vertical) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                <Scissors size={14} className="text-primary-action" /> Serviço
              </label>
              <select 
                required 
                value={servicoId} 
                onChange={e => handleServicoChange(e.target.value)}
                className={selectStyle}
                disabled={loadServicos}
              >
                <option value="" disabled>
                  {loadServicos ? "Buscando..." : "Qual o serviço?"}
                </option>
                {servicos.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Input 
                label="VALOR (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={valor}
                onChange={e => setValor(e.target.value)}
                required
                className="font-bold text-status-success"
              />
            </div>
          </div>

          {/* PROFISSIONAL */}
          <div className="space-y-1.5">
            <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
              <Star size={14} className="text-primary-action" /> Profissional
            </label>
            <select 
              required 
              value={profissionalId} 
              onChange={e => setProfissionalId(e.target.value)}
              className={selectStyle}
              disabled={loadProfissionais}
            >
              <option value="" disabled>
                {loadProfissionais ? "Buscando..." : "Quem vai atender?"}
              </option>
              {profissionais.map((p: any) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* HORÁRIO */}
          <Input 
            type="time" 
            label="HORÁRIO DE INÍCIO"
            required 
            value={horario} 
            onChange={e => setHorario(e.target.value)}
            className="font-black text-lg"
          />

          <Button 
            type="submit" 
            fullWidth 
            className="mt-4 h-12 text-subtitle"
            isLoading={mutationSalvar.isPending}
            disabled={!clienteId || !servicoId || !profissionalId || !horario || !valor}
          >
            Confirmar Agendamento
          </Button>
        </form>
      </Modal>

      <ModalCliente 
        isOpen={isModalClienteOpen} 
        onClose={() => setIsModalClienteOpen(false)} 
      />
    </>
  );
}