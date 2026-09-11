import Image from "next/image";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

/** Cabecera de la landing (`/`) — no fija, se desplaza con la página. Sin
 *  fondo propio: se superpone (`absolute`) sobre el morado del hero, que es
 *  lo único que hay detrás de ella (la sección del hero empieza justo
 *  debajo, en el mismo punto, gracias a que el contenedor padre en
 *  `page.tsx` es `relative`) — por eso el texto va en blanco, no en los
 *  tokens de texto habituales. */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 lg:px-8">
      <div className="flex w-full items-center gap-2 lg:mx-auto lg:max-w-5xl">
        <span className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image src="/logo/logo.jpg" alt="" fill className="object-cover" />
          </span>
          <span className="text-h2 text-white">Guionia</span>
        </span>
        <nav className="ml-auto flex items-center gap-2 lg:gap-4">
          <Link
            href="/login"
            aria-label="Iniciar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none lg:h-auto lg:w-auto lg:rounded-sm"
          >
            <LogIn size={20} strokeWidth={1.5} className="lg:hidden" />
            <span className="hidden text-body lg:inline">Iniciar sesión</span>
          </Link>
          <Link
            href="/registro"
            aria-label="Crear cuenta"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-accent active:bg-neutral-bg focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none lg:h-auto lg:w-auto lg:px-4 lg:py-2"
          >
            <UserPlus size={18} strokeWidth={1.5} className="lg:hidden" />
            <span className="hidden text-body lg:inline">Crear cuenta</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
