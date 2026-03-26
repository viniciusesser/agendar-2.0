"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import axios from "axios";

// Imports usando caminhos relativos para evitar erros de configuração no Deploy
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export default function RegistroPage() {
  const [sucesso, setSucesso] = useState(false);

  const mutation = useMutation({
    mutationFn: (dados: any) => axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/cadastro`, dados),
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
        <Card className="max-w-md w-full text-center space-y-4 border-t-4 border-status-success">
          <CheckCircle2 size={48} className="text-status-success mx-auto" />
          <h2 className="text-subtitle font-black uppercase italic">Cadastro Realizado!</h2>
          <p className="text-text-secondary">Seja bem-vinda! Agora você já pode acessar sua agenda e começar a organizar seu salão.</p>
          <a href="/login" className="block w-full py-4 bg-primary-action text-white font-black rounded-lg uppercase text-micro tracking-widest text-center shadow-soft">
            Ir para Login
          </a>
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
          <p className="mt-2 text-text-secondary font-bold uppercase text-micro tracking-widest italic">
            O futuro da sua agenda começa aqui
          </p>
        </div>

        <Card className="shadow-xl border border-border-default">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Nome do seu Salão" 
              name="nome_empresa" 
              placeholder="Ex: Studio VIP" 
              required 
              disabled={mutation.isPending}
            />
            
            <Input 
              label="Seu Nome" 
              name="nome_usuario" 
              placeholder="Como quer ser chamada?" 
              required 
              disabled={mutation.isPending}
            />

            <Input 
              label="E-mail" 
              name="email" 
              type="email" 
              placeholder="seu@email.com" 
              required 
              disabled={mutation.isPending}
            />

            <Input 
              label="Senha" 
              name="senha" 
              type="password" 
              placeholder="••••••••" 
              required 
              disabled={mutation.isPending}
            />

            <button 
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-4 bg-primary-action text-white font-black rounded-lg uppercase text-micro tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-soft disabled:opacity-50"
            >
              {mutation.isPending ? (
                <> <Loader2 className="animate-spin" size={18} /> Criando conta... </>
              ) : (
                'Criar Minha Conta Grátis'
              )}
            </button>
            
            <p className="text-center text-micro text-text-muted uppercase font-bold">
              30 dias grátis • Sem cartão de crédito
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}