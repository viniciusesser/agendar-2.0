"use client";

import { Link as LinkIcon, Copy, Check, MessageCircle, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { gerarConvite } from "@/services/profissionais.service";

// Importação dos componentes atômicos do Design System 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface ModalConviteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalConvite({ isOpen, onClose }: ModalConviteProps) {
  const [email, setEmail] = useState("");
  const [linkGerado, setLinkGerado] = useState("");
  const [copiado, setCopiado] = useState(false);

  const mutation = useMutation({
    mutationFn: gerarConvite,
    onSuccess: (data) => {
      setLinkGerado(data.link);
    },
    onError: (error: any) => {
      console.error("Erro ao gerar convite:", error);
      alert("Ops! Não conseguimos gerar o convite agora.");
    }
  });

  function handleGerar(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({ email, perfil: 'funcionario' });
  }

  function handleCopiar() {
    if (!linkGerado) return;
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleWhatsApp() {
    const texto = encodeURIComponent(
      `Olá! Seja bem-vinda à nossa equipe. ✨\n\nClique no link abaixo para criar sua senha e acessar a agenda:\n\n${linkGerado}\n\nEstamos ansiosos por ter você conosco!`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  }

  function fecharELimpar() {
    setLinkGerado("");
    setEmail("");
    onClose();
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={fecharELimpar} 
      title="Convidar Profissional"
    >
      <div className="animate-in fade-in zoom-in-95 duration-300">
        {!linkGerado ? (
          <form onSubmit={handleGerar} className="flex flex-col gap-6">
            <div className="flex gap-4 items-start bg-primary-50 p-4 rounded-xl border border-primary-100">
              <Sparkles className="text-primary-action shrink-0" size={20} />
              <p className="text-small text-primary-900 leading-tight font-medium">
                Gere um link de acesso único. A profissional cadastrará sua própria senha e perfil ao clicar.
              </p>
            </div>
            
            <Input 
              type="email" 
              label="E-MAIL DE CONTATO (OPCIONAL)"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@salao.com"
              className="font-bold"
            />

            <Button 
              type="submit" 
              fullWidth 
              className="h-14 text-subtitle font-black"
              isLoading={mutation.isPending}
            >
              Criar Link Mágico
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-6 text-center">
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="bg-status-success/10 p-3 rounded-full mb-2">
                <Check size={32} className="text-status-success" strokeWidth={3} />
              </div>
              <h3 className="text-subtitle font-black text-text-primary uppercase tracking-tight">Pronto para Enviar!</h3>
              <p className="text-small text-text-secondary font-medium">O link expira automaticamente em 7 dias.</p>
            </div>
            
            {/* BOX DO LINK: Estilo Token Enterprise */}
            <div className="relative group">
              <div className="p-5 bg-bg-default border-2 border-dashed border-border-default rounded-xl text-micro font-mono text-primary-action break-all shadow-inner select-all">
                {linkGerado}
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface px-3 py-1 border border-border-default rounded-full shadow-sm">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Link de Acesso</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary"
                fullWidth
                onClick={handleCopiar} 
                className="h-12 gap-2 border-border-default font-bold"
              >
                {copiado ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2.5} />}
                {copiado ? "Copiado!" : "Copiar Link"}
              </Button>
              
              <Button 
                fullWidth
                onClick={handleWhatsApp} 
                className="h-12 gap-2 bg-[#25D366] border-none text-white hover:bg-[#20ba5a] shadow-md font-bold"
              >
                <MessageCircle size={18} strokeWidth={2.5} /> WhatsApp
              </Button>
            </div>
            
            <button 
              onClick={fecharELimpar} 
              className="text-micro font-black text-text-muted hover:text-primary-action uppercase tracking-widest transition-colors py-2"
            >
              Concluir e Fechar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}