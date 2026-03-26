"use client";

import React, { forwardRef, useId } from 'react';
import { Loader2 } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    isLoading = false, 
    className = '', 
    id, 
    disabled, 
    ...props 
  }, ref) => {
    
    // Gera um ID único para garantir a regra de acessibilidade (label for="id")
    const generatedId = useId();
    const inputId = id || generatedId;

    // Define a cor da borda baseado no estado de erro
    const borderClass = error 
      ? 'border-status-error focus:border-status-error' 
      : 'border-border-default focus:border-border-input-focus';

    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Label Acessível */}
        {label && (
          <label htmlFor={inputId} className="text-small font-medium text-text-primary">
            {label}
          </label>
        )}
        
        {/* Wrapper do Input para posicionar o ícone de loading */}
        <div className="relative flex items-center w-full">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled || isLoading}
            className={`
              w-full 
              p-3 
              rounded-lg 
              border 
              bg-surface 
              text-body 
              text-text-primary 
              placeholder:text-text-muted 
              caret-primary-action
              transition-all 
              focus:outline-none 
              disabled:opacity-50 
              disabled:cursor-not-allowed
              ${borderClass}
              ${isLoading ? 'pr-10' : ''} 
              ${className}
            `}
            {...props}
          />
          
          {/* Indicador de Loading */}
          {isLoading && (
            <div className="absolute right-3 text-text-secondary">
              <Loader2 className="animate-spin" size={18} />
            </div>
          )}
        </div>

        {/* Mensagem de Erro Inline (Regra 17 do Design System) */}
        {error && (
          <span className="text-micro text-status-error mt-0.5" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';