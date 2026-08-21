import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";

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
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
