import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Main } from "@/components/Main";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Tipografía de énfasis (número grande de la cadencia, eyebrows en
 *  mayúsculas, "¿Qué idea..."): ver Tipografía en CLAUDE.md. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Guionia",
  description: "Panel para centralizar la gestión de contenido de Guionia.",
};

/** Sin esto, algunos navegadores móviles pintan la barra de estado negra por
 *  defecto en vez de heredar el fondo de la app. */
export const viewport: Viewport = {
  themeColor: "#F5F5F7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-text-primary lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:min-w-0">
          <TopBar />
          <Main>{children}</Main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
