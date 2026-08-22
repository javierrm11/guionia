import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";

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
      <body className="min-h-full flex flex-col text-text-primary lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:min-w-0">
          <TopBar />
          {/* pb-28 deja hueco para la barra inferior flotante — no hace falta en escritorio, donde la navegación vive en el Sidebar */}
          <main className="flex flex-1 flex-col pb-28 lg:pb-8">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
