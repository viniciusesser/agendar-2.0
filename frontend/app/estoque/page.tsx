"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listarEstoque, registrarMovimentacao, criarProduto, editarProduto, deletarProduto } from "@/services/estoque.service";
import { Package, Plus, ArrowLeft, AlertTriangle, ArrowDown, ArrowUp, Pencil, Trash2, DollarSign, Loader2, Tag, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Importação dos blocos de construção Enterprise 2.0
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import BottomNav from "@/components/ui/BottomNav";

export default function EstoquePage() {
  const queryClient = useQueryClient();
  const [produtoAtivo, setProdutoAtivo] = useState<string | null>(null);
  const [quantidadeMov, setQuantidadeMov] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);
  
  const formInicial = { 
    nome: "", 
    unidade: "un", 
    estoque_minimo: 0, 
    preco_compra: 0, 
    preco_venda: 0 
  };
  const [form, setForm] = useState(formInicial);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['estoque'],
    queryFn: listarEstoque
  });

  const mutacaoMov = useMutation({
    mutationFn: ({ id, tipo, qtd }: { id: string, tipo: 'entrada'|'saida', qtd: number }) => registrarMovimentacao(id, tipo, qtd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      setProdutoAtivo(null);
      setQuantidadeMov("");
    },
    onError: (error: any) => alert(error.response?.data?.error?.message || "Erro na movimentação.")
  });

  const mutacaoSalvar = useMutation({
    mutationFn: () => produtoEditando 
      ? editarProduto(produtoEditando.id, form) 
      : criarProduto(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      fecharModal();
    },
    onError: () => alert("Erro ao salvar produto.")
  });

  const mutacaoDeletar = useMutation({
    mutationFn: (id: string) => deletarProduto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['estoque'] })
  });

  const handleMovimentacao = (id: string, tipo: 'entrada' | 'saida') => {
    const qtd = Number(quantidadeMov);
    if (qtd <= 0) return alert("Digite uma quantidade válida.");
    mutacaoMov.mutate({ id, tipo, qtd });
  };

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (prod: any) => {
    setProdutoEditando(prod);
    setForm({ 
      nome: prod.nome, 
      unidade: prod.unidade || "un", 
      estoque_minimo: Number(prod.estoque_minimo),
      preco_compra: Number(prod.preco_compra || 0),
      preco_venda: Number(prod.preco_venda || 0)
    });
    setIsModalOpen(true);
  };

  const fecharModal = () => setIsModalOpen(false);

  const selectStyle = "w-full h-12 bg-bg-default border border-border-default rounded-lg px-4 outline-none focus:border-primary-action transition-all text-text-primary font-bold appearance-none cursor-pointer shadow-inner";

  return (
    <div className="flex flex-col min-h-screen bg-bg-default antialiased pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-[900] bg-surface border-b border-border-default px-4 md:px-8 pt-10 pb-6 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link href="/menu" className="p-2 -ml-2 text-primary-action hover:bg-neutral-50 rounded-full transition-colors active:scale-90">
              <ArrowLeft size={28} strokeWidth={2.5} />
            </Link>
            <h1 className="text-title font-bold text-primary-action tracking-tight flex items-center gap-2">
              <Package size={22} strokeWidth={2.5} /> Estoque
            </h1>
          </div>
          <Badge variant="default" className="px-3 py-1 font-black">
            {produtos?.length || 0} ITENS
          </Badge>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-action gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-body font-medium text-text-secondary">Sincronizando estoque...</p>
          </div>
        ) : (!produtos || produtos.length === 0) ? (
          <div className="text-center py-20 bg-surface/50 rounded-xl border-2 border-dashed border-border-default max-w-2xl mx-auto">
            <Package size={48} strokeWidth={1.5} className="mx-auto text-primary-action mb-4 opacity-40" />
            <p className="text-text-secondary font-medium italic text-body">Nenhum produto cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {produtos.map((produto: any) => {
              const estoqueBaixo = Number(produto.quantidade) <= Number(produto.estoque_minimo);
              const isAtivo = produtoAtivo === produto.id;

              return (
                <Card 
                  key={produto.id} 
                  className={`p-4 transition-all border-2 ${
                    estoqueBaixo 
                      ? 'border-status-warning/40 bg-status-warning/[0.02] shadow-sm' 
                      : 'border-border-default hover:border-primary-action/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 overflow-hidden pr-3">
                      <h3 className="font-black text-text-primary text-body leading-tight truncate uppercase tracking-tight" title={produto.nome}>
                        {produto.nome}
                      </h3>
                      
                      {/* BADGES LADO A LADO: Mudado para flex-row com wrap */}
                      <div className="flex flex-row flex-wrap gap-2 mt-2">
                        {Number(produto.preco_venda) > 0 && (
                          <Badge variant="success" className="text-[10px] font-bold uppercase bg-status-success/10 text-status-success border-0 px-2 py-0.5 w-max">
                            VENDA: <span className="font-black ml-1">R$ {Number(produto.preco_venda).toFixed(2)}</span>
                          </Badge>
                        )}
                        
                        {estoqueBaixo && (
                          <Badge variant="warning" className="text-[10px] font-bold uppercase bg-status-warning/10 text-status-warning border-0 px-2 py-0.5 w-max animate-pulse">
                            REPOR <span className="font-black ml-1">ESTOQUE</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end shrink-0">
                      <p className={`text-2xl font-black leading-none tracking-tighter ${estoqueBaixo ? 'text-status-warning' : 'text-primary-action'}`}>
                        {Number(produto.quantidade)}
                      </p>
                      <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1">
                        {produto.unidade}
                      </p>
                    </div>
                  </div>

                  {/* AÇÕES: Mais próximas do conteúdo */}
                  {isAtivo ? (
                    <div className="mt-2 pt-2 border-t border-border-default flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          placeholder="Qtd"
                          value={quantidadeMov}
                          onChange={(e) => setQuantidadeMov(e.target.value)}
                          className="w-16 text-center font-black h-10"
                        />
                        <Button 
                          className="flex-1 bg-status-success hover:brightness-95 h-10 text-micro"
                          isLoading={mutacaoMov.isPending}
                          onClick={() => handleMovimentacao(produto.id, 'entrada')}
                        >
                          <ArrowDown size={14} strokeWidth={2.5} /> Entrou
                        </Button>
                        <Button 
                          className="flex-1 bg-status-error hover:brightness-95 text-white h-10 text-micro"
                          isLoading={mutacaoMov.isPending}
                          onClick={() => handleMovimentacao(produto.id, 'saida')}
                        >
                          <ArrowUp size={14} strokeWidth={2.5} /> Saiu
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button variant="ghost" onClick={() => abrirModalEditar(produto)} className="text-[10px] font-black gap-1 h-auto p-1 uppercase text-text-secondary">
                          <Pencil size={12} strokeWidth={2.5} /> Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => { if(confirm(`Excluir ${produto.nome}?`)) mutacaoDeletar.mutate(produto.id); }} 
                          className="text-[10px] font-black text-status-error/60 hover:text-status-error gap-1 h-auto p-1 uppercase"
                        >
                          <Trash2 size={12} strokeWidth={2.5} /> Excluir
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      fullWidth 
                      className="mt-2 h-9 text-[10px] font-bold uppercase tracking-widest border-border-default"
                      onClick={() => setProdutoAtivo(produto.id)}
                    >
                      Movimentar Estoque
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* BOTÃO ADICIONAR (FAB) */}
      <button 
        onClick={abrirModalNovo}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-action text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[1001]"
        title="Novo Produto"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={fecharModal}
        title={produtoEditando ? 'Configurar Produto' : 'Novo Produto'}
      >
        <div className="space-y-6">
          <Input 
            label="NOME DO PRODUTO"
            value={form.nome} 
            onChange={e => setForm({...form, nome: e.target.value})} 
            placeholder="Ex: Shampoo L'Oréal 500ml" 
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-micro font-black text-text-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                <Layers size={14} className="text-primary-action" /> Unidade
              </label>
              <select 
                value={form.unidade} 
                onChange={e => setForm({...form, unidade: e.target.value})} 
                className={selectStyle}
              >
                <option value="un">Unidades (un)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="g">Gramas (g)</option>
              </select>
            </div>
            <Input 
              type="number"
              label="AVISO (QTD MÍNIMA)"
              value={form.estoque_minimo} 
              onChange={e => setForm({...form, estoque_minimo: Number(e.target.value)})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-default border-dashed">
            <Input 
              type="number"
              step="0.01"
              label="PREÇO COMPRA (R$)"
              value={form.preco_compra} 
              onChange={e => setForm({...form, preco_compra: Number(e.target.value)})} 
            />
            <Input 
              type="number"
              step="0.01"
              label="PREÇO VENDA (R$)"
              value={form.preco_venda} 
              onChange={e => setForm({...form, preco_venda: Number(e.target.value)})} 
            />
          </div>

          <Button 
            fullWidth 
            className="h-14 text-subtitle font-black"
            isLoading={mutacaoSalvar.isPending}
            onClick={() => mutacaoSalvar.mutate()}
          >
            Salvar no Estoque
          </Button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}