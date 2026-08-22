import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guionia",
  description: "Panel para centralizar la gestión de contenido de Guionia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-text-primary">
        <TopBar />
        {/* pb-28 deja hueco para la barra inferior flotante */}
        <main className="flex flex-1 flex-col pb-28">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
