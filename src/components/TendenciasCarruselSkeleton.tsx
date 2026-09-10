import { TrendingUp } from "lucide-react";

/** Fallback de `<Suspense>` para `TendenciasCarrusel` — tarjetas grises del
 *  mismo tamaño que las reales para que no haya salto de layout cuando
 *  llegan los vídeos (antes era `fallback={null}`, un hueco vacío). */
export function TendenciasCarruselSkeleton({
  enSidebar = false,
}: {
  enSidebar?: boolean;
}) {
  return (
    <section className="flex animate-pulse flex-col gap-3 border-b border-border pt-8 pb-6 lg:gap-4 lg:pt-10 lg:pb-8">
      <div className="flex items-center gap-1.5">
        <TrendingUp
          size={14}
          strokeWidth={1.5}
          className="text-text-disabled lg:h-4 lg:w-4"
        />
        <span className="h-3 w-20 rounded-full bg-neutral-bg" />
      </div>

      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-40 w-32 shrink-0 rounded-md bg-neutral-bg ${enSidebar ? "" : "lg:h-48 lg:w-36"}`}
          />
        ))}
      </div>
    </section>
  );
}
