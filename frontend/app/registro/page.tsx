"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function RegistroPage() {
  const [sucesso, setSucesso] = useState(false);

  const mutation = useMutation({
    mutationFn: (dados: any) => axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/registro`, dados),
    onSuccess: () => setSucesso(true)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate(Object.fromEntries(formData));
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-t-4 border-status-success">
          <CheckCircle2 size={48} className="text-status-success mx-auto" />
          <h2 className="text-subtitle font-black uppercase italic">Cadastro Realizado!</h2>
          <p className="text-text-secondary">Enviamos um link de acesso para o seu e-mail. Verifique sua caixa de entrada e comece a usar o <strong>Agendar 2.0</strong>.</p>
          <a href="/login" className="block w-full py-3 bg-primary-action text-white font-black rounded-lg uppercase text-micro tracking-widest">Ir para Login</a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-primary-action italic tracking-tighter uppercase flex items-center justify-center gap-2">
            <Sparkles /> Agendar 2.0
          </h1>
          <p className="mt-2 text-text-secondary font-bold uppercase text-micro tracking-widest">Comece seu teste grátis de 30 dias</p>
        </div>

        <Card className="p-6 md:p-8 shadow-xl border-border-default">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-micro font-black text-text-secondary uppercase">Nome do seu Salão</label>
              <Input name="nome_empresa" placeholder="Ex: Studio Rose" required className="h-12 font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-micro font-black text-text-secondary uppercase">Seu Nome</label>
              <Input name="nome_usuario" placeholder="Como quer ser chamada?" required className="h-12 font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-micro font-black text-text-secondary uppercase">E-mail</label>
              <Input name="email" type="email" placeholder="contato@exemplo.com" required className="h-12 font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-micro font-black text-text-secondary uppercase">Senha</label>
              <Input name="senha" type="password" placeholder="••••••••" required className="h-12 font-bold" />
            </div>

            <button 
              disabled={mutation.isPending}
              type="submit"
              className="w-full py-4 bg-primary-action text-white font-black rounded-lg uppercase text-micro tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Criar Minha Conta Grátis'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}