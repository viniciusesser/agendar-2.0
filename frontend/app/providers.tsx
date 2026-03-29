"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuthStore } from "@/store/auth.store";

// Limpa chaves legadas do localStorage que causavam conflito com o Zustand
function limparStorageLegado() {
  if (typeof window === 'undefined') return
  const chavesLegadas = ['agendar_token', 'agendar_usuario']
  chavesLegadas.forEach(chave => {
    if (localStorage.getItem(chave)) {
      localStorage.removeItem(chave)
    }
  })
}

function PushPermissionManager({ children }: { children: React.ReactNode }) {
  const { permissao, pedirPermissao } = usePushNotifications();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    // Só pede permissão se o usuário estiver logado
    if (permissao === "default" && token) {
      const timer = setTimeout(() => {
        pedirPermissao();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [permissao, pedirPermissao, token]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Limpa chaves legadas na primeira renderização
  useEffect(() => {
    limparStorageLegado()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <PushPermissionManager>
        {children}
      </PushPermissionManager>
    </QueryClientProvider>
  );
}