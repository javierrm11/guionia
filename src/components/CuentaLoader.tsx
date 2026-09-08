function SkeletonBloque({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-neutral-bg ${className}`} />;
}

/**
 * Esqueleto de `/contenido/cuenta` mientras cargan las estadísticas —
 * reproduce la forma real de `CuentaSection`/`CuentaTiktokSection` (rejilla
 * de métricas, carrusel de "Mejores vídeos", panel de fuentes de tráfico)
 * en vez de un único spinner centrado, para que no haya un salto de layout
 * cuando llegan los datos reales.
 */
export function CuentaLoader() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-md bg-bg-primary p-4 lg:gap-2.5 lg:p-5"
          >
            <SkeletonBloque className="h-8 w-8 rounded-full lg:h-9 lg:w-9" />
            <SkeletonBloque className="h-3 w-16" />
            <SkeletonBloque className="h-6 w-20" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <SkeletonBloque className="h-3 w-28" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBloque
              key={i}
              className="h-40 w-32 shrink-0 rounded-md lg:h-48 lg:w-36"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SkeletonBloque className="h-3 w-40" />
        <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4 lg:gap-3.5 lg:p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <SkeletonBloque className="h-3 w-24" />
                <SkeletonBloque className="h-3 w-8" />
              </div>
              <SkeletonBloque className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
