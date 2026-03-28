"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buscarConfiguracoes, salvarConfiguracoes } from "@/services/configuracoes.service";
import { Settings, Clock, Bell, MessageCircle, ArrowLeft, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // ✅ Substituindo alert() por toast

// Importação dos componentes do Design System 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: configs, isLoading } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: buscarConfiguracoes
  });

  useEffect(() => {
    if (configs) {
      setForm(configs);
    }
  }, [configs]);

  const mutation = useMutation({
    mutationFn: () => salvarConfiguracoes(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      // ✅ toast no lugar de alert()
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      // ✅ toast no lugar de alert()
      toast.error("Erro ao salvar configurações. Verifique sua conexão.");
    }
  });

  const handleChange = (chave: string, valor: string) => {
    setForm(prev => ({ ...prev, [chave]: valor }));
  };

  // Estilo base para Select e Textarea
  const baseControlStyles = "w-full bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-text-primary font-medium";

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-bg-default">
        <Loader2 className="animate-spin text-primary-action" size={32} />
        <p className="text-body font-medium text-text-secondary mt-4 tracking-wide">Carregando ajustes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">

      {/* HEADER */}
      <header className="px-4 md:px-8 py-4 md:py-6 bg-surface border-b border-border-default sticky top-0 z-[900] shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Settings size={22} strokeWidth={2.5} /> Ajustes
            </h1>
          </div>

          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            className="h-11 px-6 md:px-8 shadow-sm hover:shadow-md transition-all"
          >
            Salvar
          </Button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 max-w-7xl mx-auto w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* SEÇÃO: HORÁRIOS */}
          <Card className="space-y-5">
            <h2 className="text-subtitle font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-bg-default pb-3">
              <Clock size={18} strokeWidth={2} className="text-primary-action" /> Horários de Funcionamento
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="ABERTURA"
                value={form.horario_abertura || ''}
                onChange={(e) => handleChange('horario_abertura', e.target.value)}
              />
              <Input
                type="time"
                label="FECHAMENTO"
                value={form.horario_fechamento || ''}
                onChange={(e) => handleChange('horario_fechamento', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1">
                Intervalo de Agendamento
              </label>
              <select
                value={form.intervalo_agendamento || '30'}
                onChange={(e) => handleChange('intervalo_agendamento', e.target.value)}
                className={`${baseControlStyles} h-12`}
              >
                <option value="15">A cada 15 minutos</option>
                <option value="30">A cada 30 minutos</option>
                <option value="60">A cada 1 hora</option>
              </select>
            </div>
          </Card>

          {/* SEÇÃO: ALERTAS */}
          <Card className="space-y-5">
            <h2 className="text-subtitle font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-bg-default pb-3">
              <Bell size={18} strokeWidth={2} className="text-primary-action" /> Alertas do Sistema
            </h2>

            <Input
              type="number"
              label="LEMBRETE ANTECIPADO (HORAS)"
              value={form.lembrete_horas_antes || ''}
              onChange={(e) => handleChange('lembrete_horas_antes', e.target.value)}
            />

            <div className="flex items-center justify-between p-4 bg-bg-default rounded-lg border border-border-default">
              <span className="text-body font-bold text-text-secondary">Aniversariantes</span>
              <select
                value={form.alerta_aniversario || 'true'}
                onChange={(e) => handleChange('alerta_aniversario', e.target.value)}
                className="bg-surface border border-border-default rounded-md px-3 h-8 text-micro font-black text-primary-action outline-none cursor-pointer"
              >
                <option value="true">ATIVO</option>
                <option value="false">INATIVO</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-default rounded-lg border border-border-default">
              <span className="text-body font-bold text-text-secondary">Estoque Baixo</span>
              <select
                value={form.alerta_estoque_baixo || 'true'}
                onChange={(e) => handleChange('alerta_estoque_baixo', e.target.value)}
                className="bg-surface border border-border-default rounded-md px-3 h-8 text-micro font-black text-primary-action outline-none cursor-pointer"
              >
                <option value="true">ATIVO</option>
                <option value="false">INATIVO</option>
              </select>
            </div>
          </Card>

          {/* SEÇÃO: WHATSAPP */}
          <Card className="space-y-5 lg:col-span-1 md:col-span-2">
            <h2 className="text-subtitle font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2 border-b border-bg-default pb-3">
              <MessageCircle size={18} strokeWidth={2} className="text-primary-action" /> Mensagens WhatsApp
            </h2>

            <div className="flex items-start gap-3 bg-primary-50 p-4 rounded-lg border border-primary-100">
              <Info size={20} className="text-primary-action mt-0.5 shrink-0" />
              <p className="text-small text-text-secondary leading-relaxed font-medium italic">
                Use as variáveis{' '}
                <strong className="text-primary-action font-mono">{"{{nome}}"}</strong>,{' '}
                <strong className="text-primary-action font-mono">{"{{hora}}"}</strong> ou{' '}
                <strong className="text-primary-action font-mono">{"{{debito}}"}</strong>{' '}
                para preenchimento automático.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1">
                  Template Lembrete
                </label>
                <textarea
                  rows={3}
                  value={form.whatsapp_template_lembrete || ''}
                  onChange={(e) => handleChange('whatsapp_template_lembrete', e.target.value)}
                  className={`${baseControlStyles} py-3 resize-none`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1">
                  Template Cobrança
                </label>
                <textarea
                  rows={3}
                  value={form.whatsapp_template_cobranca || ''}
                  onChange={(e) => handleChange('whatsapp_template_cobranca', e.target.value)}
                  className={`${baseControlStyles} py-3 resize-none`}
                />
              </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}