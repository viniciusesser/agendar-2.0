"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  
  // Regra de Acessibilidade (Seção 13): Fechar com a tecla ESC e travar scroll do fundo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Impede a página de rolar lá atrás
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Devolve o scroll ao fechar
    };
  }, [isOpen, onClose]);

  // Se não estiver aberto, não renderiza nada no React
  if (!isOpen) return null;

  return (
    // Fundo escuro (Overlay)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
      
      {/* O Card Branco do Modal */}
      <div 
        className="bg-surface w-full max-w-[480px] rounded-xl shadow-soft p-6 transform transition-all scale-100 opacity-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          {title ? (
            <h2 className="text-title font-bold text-text-primary">{title}</h2>
          ) : (
            <div></div> // Espaçador caso não tenha título
          )}
          
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-text-secondary hover:text-text-primary active:scale-95"
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo dinâmico com scroll interno se ficar muito grande */}
        <div className="overflow-y-auto hide-scrollbar flex-1">
          {children}
        </div>

      </div>
    </div>
  );
};