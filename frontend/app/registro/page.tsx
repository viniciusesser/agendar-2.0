"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

// Imports usando caminhos relativos conforme sua estrutura atual
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export default function RegistroPage() {
  const [sucesso, setSucesso] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  const mutation = useMutation({
    mutationFn: (dados: any) => axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/cadastro`, dados),
    onSuccess: () => setSucesso(true),
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || "Erro ao realizar o cadastro.";
      setErroLocal(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroLocal(""); // Limpa erros anteriores
    
    const formData = new FormData(e.currentTarget);
    const dados = Object.fromEntries(formData);

    // Validação de Confirmação de Senha
    if (dados.senha !== dados.confirmar_senha) {
      setErroLocal("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    // Removemos o campo confirmar_senha antes de enviar para o backend
    const { confirmar_senha, ...dadosParaEnvio } = dados;
    mutation.mutate(dadosParaEnvio);
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-bg-default flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center space-y-4 border-t-4 border-status-success p-8">
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

        <Card className="shadow-xl border border-border-default p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Nome do seu Salão" 
              name="nome_salao" 
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Senha" 
                name="senha" 
                type="password" 
                placeholder="••••••••" 
                required 
                disabled={mutation.isPending}
              />
              <Input 
                label="Confirmar Senha" 
                name="confirmar_senha" 
                type="password" 
                placeholder="••••••••" 
                required 
                disabled={mutation.isPending}
              />
            </div>

            {/* Exibição de Erros */}
            {erroLocal && (
              <div className="flex items-center gap-2 p-3 rounded bg-status-error/10 text-status-error text-[10px] font-bold uppercase animate-in fade-in zoom-in">
                <AlertCircle size={14} />
                {erroLocal}
              </div>
            )}

            <div className="space-y-4">
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
              
              <p className="text-center text-[10px] text-text-secondary uppercase font-bold tracking-tight">
                30 dias grátis • Sem cartão de crédito
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border-default text-center">
            <p className="text-text-secondary text-sm font-medium">
              Já tem uma conta? <a href="/login" className="text-primary-action font-black uppercase tracking-wider hover:underline transition-all">Faça login</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}