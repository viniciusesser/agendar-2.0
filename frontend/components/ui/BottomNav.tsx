"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, DollarSign, Menu, BarChart3 } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Calendar, label: "Agenda" },
    { href: "/clientes", icon: Users, label: "Clientes" },
    { href: "/financeiro", icon: DollarSign, label: "Financeiro" },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/menu", icon: Menu, label: "Menu" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-surface/90 backdrop-blur-md border-t border-border-default shadow-[0_-4px_12px_rgba(0,0,0,0.02)]"
          style={{ 
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)', 
            paddingTop: '8px' 
          }}>
      
      <div className="max-w-lg mx-auto flex justify-around items-center px-2 h-[64px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full gap-1 transition-all active:scale-95 ${
                isActive 
                  ? "text-primary-action" 
                  : "text-text-secondary/40 hover:text-text-secondary"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />

              <span 
                className={`text-[10px] leading-none uppercase tracking-widest transition-all duration-200 ${
                  isActive ? "font-black" : "font-bold"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary-action mt-0.5 animate-in zoom-in duration-300" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}