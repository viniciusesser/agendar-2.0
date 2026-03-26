"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { buscarClientes } from "@/services/clientes.service";
import { Search, UserPlus, ChevronRight, Loader2, Users } from "lucide-react";
import Link from "next/link";
import ModalCliente from "@/components/ui/ModalCliente";
import BottomNav from "@/components/ui/BottomNav"; 
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ClientesPage() {
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clientes, isLoading, isError } = useQuery({
    queryKey: ['clientes', busca],
    queryFn: () => buscarClientes(busca),
  });

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased">
      {/* HEADER: Enterprise Standard */}
      <header className="px-4 md:px-8 pt-10 pb-6 bg-surface border-b border-border-default sticky top-0 z-[900] space-y-5 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
            <Users size={22} strokeWidth={2.5} />
            Clientes
          </h1>
          <Badge variant="default" className="px-3 py-1 font-black">
            {clientes?.length || 0} CADASTRADOS
          </Badge>
        </div>

        {/* BUSCA: Centralizada e responsiva */}
        <div className="max-w-7xl mx-auto w-full relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-primary-action opacity-60 group-hover:opacity-100 transition-opacity">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-11 bg-bg-default/50 border-border-default hover:border-primary-action transition-colors w-full font-medium"
          />
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Buscando na base...</p>
          </div>
        ) : isError ? (
          <Card className="text-center py-10 max-w-md mx-auto">
            <p className="font-bold text-text-secondary">Erro ao carregar clientes.</p>
            <Button 
              variant="ghost" 
              className="mt-3 text-primary-action"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </Card>
        ) : clientes?.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-primary-action/30 max-w-2xl mx-auto">
            <Users size={48} strokeWidth={1.5} className="mx-auto text-primary-action mb-4 opacity-40" />
            <p className="text-text-secondary font-medium italic text-body">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientes?.map((cliente: any) => (
              <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                <Card className="flex items-center justify-between p-4 hover:shadow-md hover:border-primary-action/30 active:scale-[0.98] transition-all group cursor-pointer border-border-default h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-action font-black text-lg shadow-sm shrink-0 border-2 border-white">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-text-primary text-body leading-tight truncate">
                        {cliente.nome}
                      </h3>
                      <p className="text-micro font-bold text-text-secondary mt-1 truncate uppercase tracking-wider">
                        {cliente.telefone || 'Sem telefone'}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 text-primary-action opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={20} strokeWidth={3} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* BOTÃO ADICIONAR (FAB): Padronizado com a Agenda (rounded-2xl) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[1001]"
        title="Novo Cliente"
      >
        <UserPlus size={28} strokeWidth={3} />
      </button>

      <ModalCliente isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* MENU INFERIOR */}
      <BottomNav />
    </div>
  );
}