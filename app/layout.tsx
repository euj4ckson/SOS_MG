import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SOS MG",
  description:
    "Portal público de gestão de abrigos e acesso à informação para crises de chuvas e enchentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${atkinson.className} antialiased`}>
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <SiteHeader />
        <main
          id="conteudo-principal"
          className="mx-auto min-h-screen max-w-7xl px-4 pb-10 pt-24 sm:px-6"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
