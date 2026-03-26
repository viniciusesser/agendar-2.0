import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agendar 2.0 - Enterprise",
  description: "Gestão profissional de beleza",
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
      {/* 
         A classe 'bg-bg-default' deve bater EXATAMENTE com o globals.css.
         O erro de hidratação acontecia porque o servidor tentava 
         enviar 'bg-background-default'.
      */}
      <body className={`${inter.className} antialiased bg-bg-default text-text-primary`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}