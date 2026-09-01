"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/** Cabecera de la landing (`/`) — fija arriba, y solo gana fondo blanco +
 *  sombra al hacer scroll (empieza transparente sobre el hero). */
export function LandingHeader() {
  const [conScroll, setConScroll] = useState(false);

  useEffect(() => {
    function onScroll() {
      setConScroll(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between px-4 py-4 transition-[box-shadow,background-color] duration-200 lg:px-8 ${
        conScroll ? "bg-bg-page shadow-[var(--card-shadow)]" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2 lg:mx-auto lg:w-full lg:max-w-5xl">
        <span className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image src="/logo/logo.jpg" alt="" fill className="object-cover" />
          </span>
          <span className="text-h2">Guionia</span>
        </span>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-body text-text-secondary">
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            Crear cuenta gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
