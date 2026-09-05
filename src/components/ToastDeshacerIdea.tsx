"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const DURACION_MS = 6000;

/** Toast "Idea descartada · Deshacer" — aparece justo tras descartar una
 *  idea (mismo lenguaje visual que `CapturaFlotante`) y se cierra sola a
 *  los 6s. "Deshacer" llama a `restaurarIdea` dentro de ese margen; pasado
 *  ese tiempo la idea se queda descartada (reversible igualmente desde
 *  "Descartadas" en /contenido/ideas, solo que ya sin el atajo rápido).
 *  Limpia el `?descartada=1` de la URL nada más montar, para que refrescar
 *  la página no vuelva a mostrarlo. */
export function ToastDeshacerIdea({
  id,
  redirectTo,
  pathname,
  restaurarIdea,
}: {
  id: string;
  redirectTo: string;
  pathname: string;
  restaurarIdea: (formData: FormData) => void | Promise<void>;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURACION_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-30 lg:inset-x-auto lg:right-6 lg:w-96">
      <style>{`
        @keyframes toast-deshacer-entrada {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="relative flex items-center justify-between gap-3 rounded-md bg-bg-primary p-4 pr-9 shadow-lg"
        style={{ animation: "toast-deshacer-entrada 0.35s ease-out" }}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1 text-text-disabled"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <span className="text-body text-text-primary">Idea descartada</span>

        <form action={restaurarIdea}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="text-body font-medium text-accent active:opacity-70">
            Deshacer
          </button>
        </form>
      </div>
    </div>
  );
}
