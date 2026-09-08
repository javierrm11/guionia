import Image from "next/image";
import Link from "next/link";

/** Cabecera de la landing (`/`) — no fija, se desplaza con la página. Sin
 *  fondo propio: se superpone (`absolute`) sobre el morado del hero, que es
 *  lo único que hay detrás de ella (la sección del hero empieza justo
 *  debajo, en el mismo punto, gracias a que el contenedor padre en
 *  `page.tsx` es `relative`) — por eso el texto va en blanco, no en los
 *  tokens de texto habituales. */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 lg:px-8">
      <div className="flex items-center gap-2 lg:mx-auto lg:w-full lg:max-w-5xl">
        <span className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image src="/logo/logo.jpg" alt="" fill className="object-cover" />
          </span>
          <span className="text-h2 text-white">Guionia</span>
        </span>
        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-sm text-body text-white/80 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-full bg-white px-4 py-2 text-body text-accent active:bg-neutral-bg focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
