"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2, CheckCircle2, XCircle, Wallet,
  Users, Calendar, ShieldCheck, ShieldOff,
  CreditCard, ChevronDown, ChevronUp,
  Mail, Crown, UserCircle2
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  buscarSaloesMaster, atualizarSalao,
  type Salao, type UsuarioSalao
} from "@/services/master.service";

// ─── PLANOS ───────────────────────────────────────────────────────────────
const PLANOS = ['free', 'basic', 'pro', 'vitrine'] as const
const badgePlano: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  free: 'default', basic: 'default', pro: 'success', vitrine: 'success',
}

// ─── TELA DE SENHA ────────────────────────────────────────────────────────
function TelaSenha({ onAutenticado }: { onAutenticado: () => void }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha === process.env.NEXT_PUBLIC_MASTER_PASSWORD) {
      sessionStorage.setItem('master_auth', '1')
      onAutenticado()
    } else {
      setErro(true)
      setSenha('')
    }
  }

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-[360px] animate-in fade-in zoom-in duration-300">
        <Card className="p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
              <Wallet size={26} strokeWidth={2.5} className="text-primary-action" />
            </div>
            <div>
              <h1 className="text-title font-bold text-primary-action">Área Restrita</h1>
              <p className="text-small text-text-secondary font-medium mt-1">Painel Master · Agendar 2.0</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="password" label="SENHA DE ACESSO" placeholder="••••••••"
              value={senha} onChange={e => { setSenha(e.target.value); setErro(false) }}
              autoFocus required />
            {erro && <p className="text-small font-bold text-status-error text-center">Senha incorreta.</p>}
            <Button type="submit" fullWidth className="h-11">Entrar</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

// ─── LINHA DE USUÁRIO ─────────────────────────────────────────────────────
function LinhaUsuario({ usuario }: { usuario: UsuarioSalao }) {
  const isDono = usuario.perfil === 'dono' || usuario.perfil === 'admin'

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-bg-default/50 transition-colors border-b border-border-default/50 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDono ? 'bg-primary-50' : 'bg-neutral-100'}`}>
          {isDono
            ? <Crown size={14} strokeWidth={2.5} className="text-primary-action" />
            : <UserCircle2 size={14} strokeWidth={2.5} className="text-text-secondary" />
          }
        </div>
        <div className="min-w-0">
          <p className="text-small font-bold text-text-primary truncate">{usuario.nome}</p>
          <p className="text-micro text-text-secondary flex items-center gap-1 truncate">
            <Mail size={10} /> {usuario.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant={isDono ? 'default' : 'default'} className="text-[10px] uppercase">
          {usuario.perfil}
        </Badge>
        {usuario.ativo
          ? <span className="text-[10px] font-bold text-status-success uppercase">Ativo</span>
          : <span className="text-[10px] font-bold text-status-error uppercase">Inativo</span>
        }
        <span className="text-micro text-text-muted hidden md:block">
          {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  )
}

// ─── MODAL DE EDIÇÃO DE PLANO ─────────────────────────────────────────────
function ModalEdicao({ salao, onClose }: { salao: Salao; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [plano, setPlano] = useState(salao.plano)
  const [validade, setValidade] = useState(
    salao.plano_validade ? salao.plano_validade.split('T')[0] : ''
  )

  const mutation = useMutation({
    mutationFn: () => atualizarSalao(salao.id, { plano, plano_validade: validade || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-saloes'] })
      toast.success(`Plano de "${salao.nome}" atualizado!`)
      onClose()
    },
    onError: () => toast.error('Erro ao atualizar plano.'),
  })

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-200">
        <h2 className="text-subtitle font-bold text-text-primary">
          Editar Plano — <span className="text-primary-action">{salao.nome}</span>
        </h2>
        <div className="space-y-1.5">
          <label className="text-micro font-bold text-text-secondary uppercase tracking-widest ml-1">Plano</label>
          <select value={plano} onChange={e => setPlano(e.target.value as any)}
            className="w-full bg-bg-default border border-border-default rounded-lg px-4 h-11 outline-none focus:border-primary-action transition-all text-text-primary font-bold">
            {PLANOS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </div>
        <Input type="date" label="VALIDADE DO PLANO" value={validade}
          onChange={e => setValidade(e.target.value)} />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Salvar</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── PAINEL PRINCIPAL ─────────────────────────────────────────────────────
function PainelMaster() {
  const queryClient = useQueryClient()
  const [salaoEditando, setSalaoEditando] = useState<Salao | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const { data: saloes = [], isLoading } = useQuery<Salao[]>({
    queryKey: ['master-saloes'],
    queryFn: buscarSaloesMaster,
  })

  const mutationStatus = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarSalao(id, { ativo }),
    onSuccess: (_, { ativo }) => {
      queryClient.invalidateQueries({ queryKey: ['master-saloes'] })
      toast.success(ativo ? 'Acesso liberado!' : 'Acesso bloqueado.')
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  })

  const formatarMoeda = (v: number) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const faturamento = saloes.reduce((acc, s) => {
    const tabela: Record<string, number> = { free: 0, basic: 49, pro: 99, vitrine: 149 }
    return acc + (s.ativo ? (tabela[s.plano] ?? 0) : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-bg-default p-4 md:p-8 pb-24 antialiased">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-title font-black text-primary-action flex items-center gap-2 uppercase tracking-tight">
          <Wallet size={24} strokeWidth={2.5} /> Painel Master
        </h1>
        <p className="text-text-secondary text-body font-medium mt-1">
          Gerencie os salões e assinaturas do Agendar 2.0
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-primary-action">
            <p className="text-micro font-black text-text-secondary uppercase">Total</p>
            <p className="text-subtitle font-black">{saloes.length}</p>
          </Card>
          <Card className="p-4 border-l-4 border-status-success">
            <p className="text-micro font-black text-text-secondary uppercase">Ativos</p>
            <p className="text-subtitle font-black text-status-success">{saloes.filter(s => s.ativo).length}</p>
          </Card>
          <Card className="p-4 border-l-4 border-status-error">
            <p className="text-micro font-black text-text-secondary uppercase">Bloqueados</p>
            <p className="text-subtitle font-black text-status-error">{saloes.filter(s => !s.ativo).length}</p>
          </Card>
          <Card className="p-4 border-l-4 border-primary-action">
            <p className="text-micro font-black text-text-secondary uppercase">MRR Est.</p>
            <p className="text-subtitle font-black text-primary-action">{formatarMoeda(faturamento)}</p>
          </Card>
        </div>

        {/* TABELA */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-border-default">
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Salão</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Uso</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Plano</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Validade</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary">Status</th>
                  <th className="p-4 text-micro font-black uppercase text-text-secondary text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-primary-action" size={28} />
                    </td>
                  </tr>
                ) : saloes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-text-secondary text-body font-medium">
                      Nenhum salão cadastrado ainda.
                    </td>
                  </tr>
                ) : saloes.map((salao) => {
                  const vencido = salao.plano_validade
                    ? new Date(salao.plano_validade) < new Date() : false
                  const aberto = expandido === salao.id

                  return (
                    <>
                      {/* LINHA DO SALÃO */}
                      <tr key={salao.id}
                        className={`hover:bg-neutral-50 transition-colors border-b border-border-default ${aberto ? 'bg-primary-50/30' : ''}`}>

                        <td className="p-4">
                          <p className="text-body font-black text-text-primary">{salao.nome}</p>
                          <p className="text-micro text-text-secondary">{salao.telefone || '—'}</p>
                        </td>

                        <td className="p-4">
                          <span className="flex items-center gap-1 text-micro text-text-secondary font-bold">
                            <Users size={12} /> {salao._count.usuarios} usuários
                          </span>
                          <span className="flex items-center gap-1 text-micro text-text-secondary font-bold mt-0.5">
                            <Calendar size={12} /> {salao._count.agendamentos} agend.
                          </span>
                        </td>

                        <td className="p-4">
                          <Badge variant={badgePlano[salao.plano] ?? 'default'} className="uppercase">
                            {salao.plano}
                          </Badge>
                        </td>

                        <td className="p-4">
                          {salao.plano_validade ? (
                            <span className={`text-micro font-bold ${vencido ? 'text-status-error' : 'text-text-secondary'}`}>
                              {vencido ? '⚠️ ' : ''}{new Date(salao.plano_validade).toLocaleDateString('pt-BR')}
                            </span>
                          ) : <span className="text-micro text-text-muted">—</span>}
                        </td>

                        <td className="p-4">
                          {salao.ativo
                            ? <span className="flex items-center gap-1 text-status-success text-micro font-bold uppercase"><CheckCircle2 size={14} /> Ativo</span>
                            : <span className="flex items-center gap-1 text-status-error text-micro font-bold uppercase"><XCircle size={14} /> Bloqueado</span>
                          }
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* EXPANDIR USUÁRIOS */}
                            <button
                              onClick={() => setExpandido(aberto ? null : salao.id)}
                              className="p-2 rounded-lg text-text-secondary hover:text-primary-action hover:bg-primary-50 transition-all"
                              title="Ver usuários"
                            >
                              {aberto
                                ? <ChevronUp size={16} strokeWidth={2.5} />
                                : <ChevronDown size={16} strokeWidth={2.5} />
                              }
                            </button>

                            {/* EDITAR PLANO */}
                            <button
                              onClick={() => setSalaoEditando(salao)}
                              className="p-2 rounded-lg text-text-secondary hover:text-primary-action hover:bg-primary-50 transition-all"
                              title="Editar plano"
                            >
                              <CreditCard size={16} strokeWidth={2.5} />
                            </button>

                            {/* BLOQUEAR / ATIVAR */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja ${salao.ativo ? 'bloquear' : 'ativar'} "${salao.nome}"?`)) {
                                  mutationStatus.mutate({ id: salao.id, ativo: !salao.ativo })
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-micro font-black uppercase transition-all ${
                                salao.ativo
                                  ? 'bg-status-error/10 text-status-error hover:bg-status-error hover:text-white'
                                  : 'bg-status-success/10 text-status-success hover:bg-status-success hover:text-white'
                              }`}
                            >
                              {salao.ativo ? <><ShieldOff size={13} /> Bloquear</> : <><ShieldCheck size={13} /> Ativar</>}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* LINHA EXPANDIDA — USUÁRIOS DO SALÃO */}
                      {aberto && (
                        <tr key={`${salao.id}-usuarios`}>
                          <td colSpan={6} className="p-0 bg-neutral-50/50 border-b border-border-default">
                            <div className="px-4 pt-2 pb-1">
                              <p className="text-micro font-black text-text-secondary uppercase tracking-widest mb-1">
                                Usuários do salão
                              </p>
                            </div>
                            {salao.usuarios.length === 0 ? (
                              <p className="px-4 pb-3 text-small text-text-muted italic">Nenhum usuário cadastrado.</p>
                            ) : (
                              <div className="divide-y divide-border-default/30">
                                {salao.usuarios.map(u => <LinhaUsuario key={u.id} usuario={u} />)}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {salaoEditando && (
        <ModalEdicao salao={salaoEditando} onClose={() => setSalaoEditando(null)} />
      )}
    </div>
  )
}

// ─── EXPORTAÇÃO PRINCIPAL ─────────────────────────────────────────────────
export default function MasterPage() {
  const [autenticado, setAutenticado] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('master_auth') === '1'
  })

  if (!autenticado) return <TelaSenha onAutenticado={() => setAutenticado(true)} />
  return <PainelMaster />
}