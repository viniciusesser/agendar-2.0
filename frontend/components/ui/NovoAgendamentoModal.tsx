"use client";

import { User, Scissors, Star, Clock, DollarSign, AlertTriangle, Lock, FileText } from "lucide-react";
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

  // Estado para controlar a Aba selecionada
  const [modo, setModo] = useState<'agendamento' | 'bloqueio'>('agendamento');

  // Estados compartilhados e específicos
  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState<number | string>("");
  const [horarioFim, setHorarioFim] = useState(""); // Apenas para bloqueio
  const [motivo, setMotivo] = useState(""); // Apenas para bloqueio

  const [isModalClienteOpen, setIsModalClienteOpen] = useState(false);
  const [erroBloqueio, setErroBloqueio] = useState("");

  useEffect(() => {
    if (isOpen) {
      setModo('agendamento');
      setClienteId("");
      setServicoId("");
      setProfissionalId("");
      setHorario("");
      setValor("");
      setHorarioFim("");
      setMotivo("");
      setErroBloqueio("");
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

  const handleServicoChange = (id: string) => {
    setServicoId(id);
    const servicoSelecionado = servicos.find((s: any) => s.id === id);
    if (servicoSelecionado) {
      setValor(Number(servicoSelecionado.preco));
    }
  };

  // --- TRAVA SILENCIOSA (Apenas para modo Agendamento) ---
  useEffect(() => {
    if (modo !== 'agendamento' || !profissionalId || !horario || !servicoId) {
      setErroBloqueio("");
      return;
    }

    const agendaCache = queryClient.getQueryData(['agendamentos', dataSelecionada]) as any;
    const bloqueios = Array.isArray(agendaCache) ? [] : (agendaCache?.bloqueios || []);

    if (bloqueios.length === 0) {
      setErroBloqueio("");
      return;
    }

    const servico = servicos.find((s: any) => s.id === servicoId);
    const duracao = servico?.duracao_min || 60;
    const novoInicio = new Date(`${dataSelecionada}T${horario}:00`).getTime();
    const novoFim = novoInicio + duracao * 60000;

    const estaBloqueado = bloqueios.some((b: any) => {
      if (b.profissional_id !== profissionalId) return false;
      const bInicio = new Date(b.data_hora_inicio).getTime();
      const bFim = new Date(b.data_hora_fim).getTime();
      return (novoInicio < bFim && novoFim > bInicio);
    });

    if (estaBloqueado) {
      setErroBloqueio("Profissional ausente ou com horário bloqueado neste período.");
    } else {
      setErroBloqueio("");
    }
  }, [profissionalId, horario, servicoId, dataSelecionada, servicos, queryClient, modo]);

  // MUTATION: Salvar Agendamento
  const mutationAgendamento = useMutation({
    mutationFn: async () => {
      const dataHoraInicio = new Date(`${dataSelecionada}T${horario}:00`).toISOString();
      const payload = {
        cliente_id: clienteId,
        servico_id: servicoId,
        profissional_id: profissionalId,
        data_hora_inicio: dataHoraInicio,
        valor: Number(valor),
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

  // MUTATION: Salvar Bloqueio
  const mutationBloqueio = useMutation({
    mutationFn: async () => {
      const dataHoraInicio = new Date(`${dataSelecionada}T${horario}:00`).toISOString();
      const dataHoraFim = new Date(`${dataSelecionada}T${horarioFim}:00`).toISOString();
      const payload = {
        profissional_id: profissionalId,
        data_hora_inicio: dataHoraInicio,
        data_hora_fim: dataHoraFim,
        motivo: motivo,
      };
      const response = await api.post('/bloqueios', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error?.message || "Erro ao criar bloqueio.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modo === 'agendamento') {
      if (erroBloqueio) return;
      mutationAgendamento.mutate();
    } else {
      // Validação extra para garantir que o fim é maior que o início
      if (horarioFim <= horario) {
        alert("O horário de fim deve ser maior que o horário de início.");
        return;
      }
      mutationBloqueio.mutate();
    }
  };

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-body font-medium text-text-primary shadow-inner appearance-none cursor-pointer disabled:opacity-50";

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={modo === 'agendamento' ? "Novo Registro" : "Gerenciar Agenda"}
      >
        
        {/* CHAVE SELETORA (TABS) */}
        <div className="flex bg-bg-default p-1.5 rounded-xl mb-6 border border-border-default shadow-inner">
          <button
            type="button"
            className={`flex-1 py-2.5 text-micro font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${modo === 'agendamento' ? 'bg-surface shadow-sm text-primary-action' : 'text-text-muted hover:text-text-primary'}`}
            onClick={() => setModo('agendamento')}
          >
            <Clock size={16} /> Agendamento
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-micro font-black uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${modo === 'bloqueio' ? 'bg-surface shadow-sm text-status-error' : 'text-text-muted hover:text-text-primary'}`}
            onClick={() => setModo('bloqueio')}
          >
            <Lock size={16} /> Bloqueio
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
          
          {/* MODO AGENDAMENTO */}
          {modo === 'agendamento' && (
            <>
              {/* CLIENTE */}
              <div className="space-y-1.5 animate-in slide-in-from-left-4 duration-300">
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
                <select required value={clienteId} onChange={e => setClienteId(e.target.value)} className={selectStyle} disabled={loadClientes}>
                  <option value="" disabled>{loadClientes ? "Sincronizando..." : "Selecione a cliente..."}</option>
                  {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              {/* SERVIÇO E VALOR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-left-4 duration-300 delay-75">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Scissors size={14} className="text-primary-action" /> Serviço
                  </label>
                  <select required value={servicoId} onChange={e => handleServicoChange(e.target.value)} className={selectStyle} disabled={loadServicos}>
                    <option value="" disabled>{loadServicos ? "Buscando..." : "Qual o serviço?"}</option>
                    {servicos.map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Input label="VALOR (R$)" type="number" step="0.01" placeholder="0.00" value={valor} onChange={e => setValor(e.target.value)} required className="font-bold text-status-success" />
                </div>
              </div>
            </>
          )}

          {/* MODO BLOQUEIO: MOTIVO */}
          {modo === 'bloqueio' && (
            <div className="space-y-1.5 animate-in slide-in-from-right-4 duration-300">
              <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText size={14} className="text-status-error" /> Motivo da Ausência
              </label>
              <Input 
                type="text" 
                placeholder="Ex: Folga, Almoço, Médico..."
                value={motivo} 
                onChange={e => setMotivo(e.target.value)}
                className="font-bold"
              />
            </div>
          )}

          {/* PROFISSIONAL (Compartilhado) */}
          <div className="space-y-1.5 animate-in fade-in duration-500">
            <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
              <Star size={14} className={modo === 'agendamento' ? "text-primary-action" : "text-status-error"} /> Profissional
            </label>
            <select required value={profissionalId} onChange={e => setProfissionalId(e.target.value)} className={selectStyle} disabled={loadProfissionais}>
              <option value="" disabled>{loadProfissionais ? "Buscando..." : "Quem?"}</option>
              {profissionais.map((p: any) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          {/* HORÁRIOS (Compartilhado / Estendido no Bloqueio) */}
          <div className={`grid ${modo === 'bloqueio' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 animate-in fade-in duration-500`}>
            <Input 
              type="time" 
              label="HORÁRIO DE INÍCIO"
              required 
              value={horario} 
              onChange={e => setHorario(e.target.value)}
              className="font-black text-lg"
            />
            
            {modo === 'bloqueio' && (
              <Input 
                type="time" 
                label="HORÁRIO DE FIM"
                required 
                value={horarioFim} 
                onChange={e => setHorarioFim(e.target.value)}
                className="font-black text-lg text-status-error"
              />
            )}
          </div>

          {/* AVISO DA TRAVA SILENCIOSA (Apenas Agendamento) */}
          {modo === 'agendamento' && erroBloqueio && (
            <div className="flex items-center gap-2 bg-status-error/10 border border-status-error/20 p-3 rounded-lg animate-in zoom-in-95 duration-200">
              <AlertTriangle size={16} className="text-status-error shrink-0" strokeWidth={2.5} />
              <p className="text-[11px] font-bold text-status-error uppercase tracking-tight">
                {erroBloqueio}
              </p>
            </div>
          )}

          {/* BOTÃO SUBMIT DINÂMICO */}
          <Button 
            type="submit" 
            fullWidth 
            className={`mt-4 h-12 text-subtitle ${modo === 'bloqueio' ? 'bg-status-error hover:bg-status-error/90 shadow-status-error/30' : ''}`}
            isLoading={modo === 'agendamento' ? mutationAgendamento.isPending : mutationBloqueio.isPending}
            disabled={
              (modo === 'agendamento' && (!clienteId || !servicoId || !profissionalId || !horario || !valor || !!erroBloqueio)) ||
              (modo === 'bloqueio' && (!profissionalId || !horario || !horarioFim))
            }
          >
            {modo === 'agendamento' ? 'Confirmar Agendamento' : 'Bloquear Horário'}
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