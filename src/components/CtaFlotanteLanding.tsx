"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** CTA fijo abajo, solo tras pasar el hero (90% de la altura de pantalla) —
 *  para no perder la conversión si alguien decide a mitad de página y ya no
 *  quiere volver a subir a buscar el botón del hero. No confundir con
 *  `CapturaFlotante.tsx`, que es la notificación de captura rápida de ideas
 *  dentro de la app ya logueada — esta es solo de la landing pública. */
export function CtaFlotanteLanding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function actualizar() {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    }
    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    return () => window.removeEventListener("scroll", actualizar);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-all duration-300 lg:bottom-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Link
        href="/registro"
        className="group flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-body font-medium text-white shadow-xl transition-colors hover:bg-accent-hover"
      >
        Crear cuenta gratis
        <ArrowRight
          size={16}
          strokeWidth={2}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}
