"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Componente interno que pede permissão de notificação após o login
function PushPermissionManager({ children }: { children: React.ReactNode }) {
  const { permissao, pedirPermissao } = usePushNotifications();

  useEffect(() => {
    // Pede permissão automaticamente após 4 segundos se ainda não foi decidido
    if (permissao === "default") {
      const timer = setTimeout(() => {
        pedirPermissao();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [permissao, pedirPermissao]);

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

  return (
    <QueryClientProvider client={queryClient}>
      <PushPermissionManager>
        {children}
      </PushPermissionManager>
    </QueryClientProvider>
  );
}