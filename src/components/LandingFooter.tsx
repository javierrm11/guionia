import Image from "next/image";
import Link from "next/link";

/** Footer de las páginas públicas (landing, blog, comparativas) — mismo
 *  contenido en todas, así que vive en un solo sitio. */
export function LandingFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-border px-4 py-8 text-center lg:flex-row lg:justify-between lg:px-8">
      <span className="flex items-center gap-2 text-caption text-text-disabled">
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Image src="/logo/logo.jpg" alt="" fill className="object-cover" />
        </span>
        © {new Date().getFullYear()} Guionia
      </span>
      <nav className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/blog" className="text-caption text-text-secondary">
          Blog
        </Link>
        <Link href="/comparativas/notion" className="text-caption text-text-secondary">
          Guionia vs Notion
        </Link>
        <Link href="/legal/privacidad" className="text-caption text-text-secondary">
          Privacidad
        </Link>
        <Link href="/legal/terminos" className="text-caption text-text-secondary">
          Términos
        </Link>
        <Link href="/login" className="text-caption text-text-secondary">
          Iniciar sesión
        </Link>
      </nav>
    </footer>
  );
}
