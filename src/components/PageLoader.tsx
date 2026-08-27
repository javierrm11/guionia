import { Loader2 } from "lucide-react";

/** Fallback genérico para `loading.tsx` de ruta — cubre el hueco entre tocar
 *  un enlace y que el servidor responda, en vez de dejar la pantalla anterior
 *  congelada (todas las páginas son `force-dynamic`, sin caché). */
export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Loader2
        size={24}
        strokeWidth={1.5}
        className="animate-spin text-text-disabled motion-reduce:animate-none"
      />
    </div>
  );
}
