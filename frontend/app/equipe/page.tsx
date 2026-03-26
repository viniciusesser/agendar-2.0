"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { buscarProfissionais } from "@/services/profissionais.service";
import { Users, Plus, Pencil, Link as LinkIcon, ArrowLeft, Loader2, Scissors, Package, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import ModalProfissional from "@/components/ui/ModalProfissional";
import ModalConvite from "@/components/ui/ModalConvite";
import BottomNav from "@/components/ui/BottomNav";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export default function EquipePage() {
  const { data: profissionais, isLoading } = useQuery({
    queryKey: ['profissionais'],
    queryFn: buscarProfissionais
  });

  const [modalAberto, setModalAberto] = useState(false);
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const [profissionalEditando, setProfissionalEditando] = useState<any>(null);

  // Estados para Troca de Senha
  const [passForm, setPassForm] = useState({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
  const [passMsg, setPassMsg] = useState({ tipo: "", texto: "" });

  const passwordMutation = useMutation({
    mutationFn: (dados: any) => {
      const token = localStorage.getItem('agendar_token');
      return axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/alterar-senha`, dados, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      setPassMsg({ tipo: "sucesso", texto: "Senha alterada com sucesso!" });
      setPassForm({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" });
    },
    onError: (error: any) => {
      setPassMsg({ tipo: "erro", texto: error.response?.data?.error?.message || "Erro ao alterar senha." });
    }
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ tipo: "", texto: "" });
    if (passForm.novaSenha !== passForm.confirmarNovaSenha) {
      setPassMsg({ tipo: "erro", texto: "As novas senhas não coincidem." });
      return;
    }
    passwordMutation.mutate({ senhaAtual: passForm.senhaAtual, novaSenha: passForm.novaSenha });
  };

  function abrirNovo() {
    setProfissionalEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(prof: any) {
    setProfissionalEditando(prof);
    setModalAberto(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors">
              <ArrowLeft size={28} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Users size={22} strokeWidth={2.5} /> Equipe
            </h1>
          </div>
          <Badge variant="default" className="px-3 py-1 font-black uppercase">
            {profissionais?.length || 0} Integrantes
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-40">
        
        {/* LISTA DE INTEGRANTES */}
        <div className="mb-12">
          <h2 className="text-micro font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Time do Salão</h2>
          {isLoading ? (
            <div className="flex flex-col items-center py-10 text-primary-action gap-3">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profissionais?.map((prof: any) => (
                <Card key={prof.id} className="p-4 flex items-center justify-between group border-border-default">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: prof.cor || '#FF2B5E' }}
                    >
                      {prof.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary truncate">{prof.nome}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="success" className="text-[10px] px-2 py-0">SERV: {prof.comissao_pct}%</Badge>
                        <Badge variant="warning" className="text-[10px] px-2 py-0">PROD: {prof.comissao_produto_pct}%</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => abrirEdicao(prof)} className="w-10 h-10 p-0">
                    <Pencil size={18} strokeWidth={2.5} />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO: MINHA SEGURANÇA (NOVA) */}
        <div className="max-w-md">
          <h2 className="text-micro font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Minha Segurança</h2>
          <Card className="p-6 border-t-4 border-t-primary-action">
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input 
                  label="Senha Atual" 
                  type="password" 
                  value={passForm.senhaAtual} 
                  onChange={e => setPassForm({...passForm, senhaAtual: e.target.value})}
                  required 
                />
                <hr className="border-border-default opacity-50" />
                <Input 
                  label="Nova Senha" 
                  type="password" 
                  value={passForm.novaSenha} 
                  onChange={e => setPassForm({...passForm, novaSenha: e.target.value})}
                  required 
                />
                <Input 
                  label="Confirmar Nova Senha" 
                  type="password" 
                  value={passForm.confirmarNovaSenha} 
                  onChange={e => setPassForm({...passForm, confirmarNovaSenha: e.target.value})}
                  required 
                />

                {passMsg.texto && (
                  <div className={`p-3 rounded-lg text-[10px] font-bold uppercase ${
                    passMsg.tipo === "sucesso" ? "bg-status-success/10 text-status-success" : "bg-status-error/10 text-status-error"
                  }`}>
                    {passMsg.texto}
                  </div>
                )}

                <Button type="submit" fullWidth isLoading={passwordMutation.isPending}>
                  <Lock size={16} className="mr-2" /> Atualizar Minha Senha
                </Button>
             </form>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-[1001]">
        <button onClick={() => setModalConviteAberto(true)} className="w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center transition-all"><LinkIcon size={28} /></button>
        <button onClick={abrirNovo} className="w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center transition-all"><Plus size={28} /></button>
      </div>

      <ModalProfissional isOpen={modalAberto} onClose={() => setModalAberto(false)} profissional={profissionalEditando} />
      <ModalConvite isOpen={modalConviteAberto} onClose={() => setModalConviteAberto(false)} />
      <BottomNav />
    </div>
  );
}