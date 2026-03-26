"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Importação dos serviços
import { buscarSaloesMaster, atualizarStatusSalao } from "@/services/master.service";

// Definição da estrutura do Salão para o TypeScript
interface Salao {
  id: string;
  nome: string;
  telefone: string;
  plano: 'free' | 'basic' | 'pro' | 'vitrine';
  ativo: boolean;
}

export default function MasterDashboard() {
  const queryClient = useQueryClient();

  // Tipagem adicionada aqui: <Salao[]>
  const { data: saloes, isLoading } = useQuery<Salao[]>({
    queryKey: ['master-saloes'],
    queryFn: buscarSaloesMaster
  });

  const mutation = useMutation({
    mutationFn: ({ id, ativo }: { id: string, ativo: boolean }) => atualizarStatusSalao(id, ativo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['master-saloes'] })
  });

  const formatarMoeda = (valor: number) => 
    Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-bg-default p-4 md:p-8 pb-24">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-title font-black text-primary-action flex items-center gap-2 italic uppercase tracking-tighter">
          <Wallet size={28} /> Painel de Controle Master
        </h1>
        <p className="text-text-secondary font-medium">Gerencie os salões e assinaturas do Agendar 2.0</p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-primary-action">
            <p className="text-micro font-black text-text-secondary uppercase">Total de Salões</p>
            <p className="text-subtitle font-black">{saloes?.length || 0}</p>
          </Card>
          <Card className="p-4 border-l-4 border-status-success">
            <p className="text-micro font-black text-text-secondary uppercase">Faturamento Estimado</p>
            <p className="text-subtitle font-black text-status-success">
               {formatarMoeda(saloes?.reduce((acc, s) => acc + (s.ativo ? 49 : 0), 0) || 0)}
            </p>
          </Card>
        </div>

        {/* LISTAGEM DE CLIENTES */}
        <Card className="overflow-hidden border-border-default">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-border-default">
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Salão / Empresa</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Plano</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Status</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-primary-action" />
                    </td>
                  </tr>
                ) : saloes?.map((salao) => (
                  <tr key={salao.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <p className="text-body font-black text-text-primary">{salao.nome}</p>
                      <p className="text-micro text-text-secondary">{salao.telefone}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={salao.plano === 'pro' ? 'success' : 'default'} className="uppercase">
                        {salao.plano}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {salao.ativo ? (
                        <span className="flex items-center gap-1 text-status-success text-micro font-bold uppercase">
                          <CheckCircle2 size={14} /> Ativo / Pago
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-status-error text-micro font-bold uppercase">
                          <XCircle size={14} /> Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => mutation.mutate({ id: salao.id, ativo: !salao.ativo })}
                        className={`px-3 py-1.5 rounded-md text-micro font-black uppercase transition-all ${
                          salao.ativo 
                            ? 'bg-status-error/10 text-status-error hover:bg-status-error hover:text-white' 
                            : 'bg-status-success/10 text-status-success hover:bg-status-success hover:text-white'
                        }`}
                      >
                        {salao.ativo ? 'Bloquear' : 'Ativar Acesso'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}