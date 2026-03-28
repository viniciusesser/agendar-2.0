import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner"; // IMPORTAMOS O PROJETOR DE NOTIFICAÇÕES

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agendar 2.0 - Gestão para Salões",
  description: "Organize sua agenda e finanças com inteligência.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }, // Fallback para navegadores antigos
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#CF97A0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* A classe 'bg-bg-default' deve bater EXATAMENTE com o globals.css.
         O erro de hidratação acontecia porque o servidor tentava 
         enviar 'bg-background-default'.
      */}
      <body className={`${inter.className} antialiased bg-bg-default text-text-primary`}>
        <Providers>
          {children}
        </Providers>
        
        {/* ADICIONAMOS O TOASTER AQUI NO FINAL DO BODY */}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}