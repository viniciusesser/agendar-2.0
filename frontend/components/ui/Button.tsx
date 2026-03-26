"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg"; 
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, fullWidth, children, disabled, ...props }, ref) => {
    
    // Voltando para o arredondamento padrão 'rounded-lg' e peso 'font-bold'
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]";
    
    const variants = {
      primary: "bg-primary-action text-text-on-primary hover:bg-primary-action-hover",
      secondary: "bg-transparent border border-primary-action text-primary-action hover:bg-primary-50",
      ghost: "bg-transparent text-text-secondary hover:bg-bg-default hover:text-text-primary",
      danger: "bg-status-error text-text-on-primary hover:brightness-90",
    };

    const sizes = {
      sm: "h-9 px-3 text-micro",
      md: "h-12 px-4 text-body",
      lg: "h-14 px-6 text-subtitle",
    };

    const widthStyle = fullWidth ? "w-full" : "";
    const loadingStyle = isLoading ? "cursor-progress" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${loadingStyle} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";