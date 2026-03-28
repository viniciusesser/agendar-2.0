"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner"; // 1. IMPORTANDO O TOAST
import api from "@/lib/api"; // 2. IMPORTANDO A NOSSA API CENTRALIZADA
import { useAuthStore } from "@/store/auth.store"; // 3. IMPORTANDO O NOSSO CÉREBRO

// Importação dos componentes do Design System 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function AceitarConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const mutation = useMutation({
    // Trocamos o axios direto pela nossa 'api' configurada
    mutationFn: (dados: any) => api.post(`/convites/usar`, dados),
    onSuccess: (response) => {
      // A resposta do backend vem dentro de "data". 
      const respostaBackend = response.data.data; 
      
      // Padronização de armazenamento via Zustand (Adeus localStorage!)
      useAuthStore.getState().setAuth(
        respostaBackend.token, 
        respostaBackend.usuario, 
        respostaBackend.empresa
      );
      
      toast.success("Conta criada com sucesso! Bem-vinda.");
      router.push('/');
    },
    onError: (error: any) => {
      const codigoErro = error.response?.data?.error?.code;
      const mensagemErro = error.response?.data?.error?.message;

      // Substituindo o alert feio pelo toast elegante
      if (codigoErro === 'EMAIL_JA_CADASTRADO') {
        toast.error(
          "Esse e-mail já possui um cadastro. Se você já tem uma conta, vá para a tela de Login."
        );
      } else {
        toast.error(mensagemErro || "Link de convite inválido ou expirado.");
      }
    }
  });

  function handleAceitar(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({ token, nome, email, senha });
  }

  return (
    /* Fundo responsivo: cinza no mobile (para integrar com o topo) e levemente destacado no desktop */
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default md:bg-neutral-50 p-4 sm:p-8 antialiased">
      
      {/* O limite de 400px é a regra de UX para manter a leitura e cliques fáceis no PC */}
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Card ganha bordas invisíveis e sombra gigante no Desktop */}
        <Card className="p-8 sm:p-10 md:shadow-2xl border-border-default md:border-transparent transition-all">
          
          {/* Cabeçalho de Boas-vindas */}
          <div className="text-center mb-8 md:mb-10">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-action text-on-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md transform -rotate-3 transition-transform hover:rotate-0">
              <Sparkles className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-primary-action tracking-tight leading-tight">
              Você foi convidada!
            </h1>
            
            <p className="text-text-secondary mt-3 text-body font-medium leading-relaxed">
              Crie seu acesso pessoal para começar a organizar sua agenda no salão.
            </p>
          </div>

          <form onSubmit={handleAceitar} className="space-y-5">
            <Input 
              label="SEU NOME COMPLETO"
              placeholder="Como quer ser chamada"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={mutation.isPending}
            />

            <Input 
              type="email"
              label="E-MAIL DE ACESSO"
              placeholder="exemplo@salao.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
            />

            <Input 
              type="password"
              label="CRIE UMA SENHA"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={mutation.isPending}
            />

            <Button 
              type="submit" 
              fullWidth 
              className="mt-6 md:h-12" /* Botão mais alto no PC para destacar a ação primária */
              isLoading={mutation.isPending}
            >
              {mutation.isPending ? "Preparando tudo..." : "Entrar no Salão"}
            </Button>
          </form>

          {/* Rodapé Legal/Informativo */}
          <p className="text-center mt-8 text-micro text-text-muted font-medium leading-relaxed px-2 opacity-80">
            Ao entrar, você concorda com as políticas de uso da agenda do salão.
          </p>
        </Card>
      </div>
    </div>
  );
}