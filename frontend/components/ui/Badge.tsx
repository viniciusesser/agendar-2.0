"use client";

import React, { forwardRef } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    
    // Usamos a opacidade do Tailwind (/20 e /15) misturada com as suas cores de status
    // para criar o fundo de "Feedback Visual" (Regra 8.8 do Design System)
    const variants = {
      success: "bg-status-success/20 text-status-success",
      warning: "bg-status-warning/20 text-status-warning",
      error: "bg-status-error/15 text-status-error",
      default: "bg-neutral-100 text-text-secondary"
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center px-3 py-1 rounded-pill text-micro font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';