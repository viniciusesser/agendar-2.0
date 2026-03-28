"use client";

import Link from "next/link";
import { Users, Scissors, Package, Settings, LogOut, ChevronRight, Megaphone, ArrowLeft, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";

// 1. IMPORTANDO O NOSSO STORE
import { useAuthStore } from "@/store/auth.store";

// Importação dos componentes do Design System 2.0
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function MenuPage() {
  const router = useRouter();

  function handleLogout() {
    // 2. USANDO A FUNÇÃO CENTRALIZADA DE LOGOUT
    useAuthStore.getState().logout();
    router.push('/login');
  }

  const menuItems = [
    { href: "/marketing", icon: Megaphone, label: "Marketing Integrado", description: "Disparos de WhatsApp e filtros" },
    { href: "/equipe", icon: Users, label: "Gestão de Equipe", description: "Profissionais, comissões e convites" },
    { href: "/servicos", icon: Scissors, label: "Meus Serviços", description: "Catálogo de serviços e preços" },
    { href: "/estoque", icon: Package, label: "Estoque", description: "Controle de produtos e alertas" },
    { href: "/configuracoes", icon: Settings, label: "Configurações", description: "Horários, salão e ajustes" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-24">
      
      {/* HEADER: Enterprise Standard - Padronizado com Clientes */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
            <LayoutGrid size={22} strokeWidth={2.5} />
            Menu Principal
          </h1>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - Alterado para max-w-7xl e espaçamento ajustado */}
      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* MÁGICA DO GRID: 1 coluna (mobile), 2 (tablet), 3 (desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              /* ITEM DE MENU: Transformado em um Card que estica perfeitamente no Grid */
              <Link key={item.href} href={item.href} className="block group h-full">
                <Card className="flex items-center justify-between p-5 md:p-6 border-border-default hover:border-primary-action/30 hover:shadow-md transition-all active:scale-[0.98] h-full">
                  <div className="flex items-center gap-4">
                    {/* Ícone com cor primária e fundo suave semântico */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-action shadow-sm border border-primary-100 group-hover:bg-primary-action group-hover:text-white transition-colors shrink-0">
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-subtitle leading-tight group-hover:text-primary-action transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-small text-text-secondary font-medium mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-1.5 text-text-muted group-hover:text-primary-action group-hover:translate-x-1 transition-all shrink-0">
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ÁREA DE LOGOUT: Centralizada e com largura máxima contida no Desktop */}
        <div className="pt-8 md:pt-12 flex flex-col items-center border-t border-border-default/60">
          <div className="w-full max-w-sm">
            <Button
              variant="danger"
              fullWidth
              onClick={handleLogout}
              className="h-14 gap-3 bg-white !text-status-error border-2 border-status-error/20 hover:bg-status-error/5 hover:border-status-error/40 transition-all shadow-sm"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span className="font-bold text-subtitle">Sair do Sistema</span>
            </Button>
          </div>
          
          {/* INFO VERSÃO */}
          <p className="text-center mt-6 text-micro text-text-muted font-bold opacity-50 uppercase tracking-widest">
            Agendar • 2026
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}