import { Suspense } from "react";
import { TendenciasLoader } from "@/components/TendenciasLoader";
import { TendenciasSection } from "@/components/TendenciasSection";

export const dynamic = "force-dynamic";

export default function TendenciasPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1">Tendencias</h1>
        <p className="text-small text-text-secondary">
          Vídeos en tendencia de tu misma categoría en YouTube, para inspirarte.
        </p>
      </div>

      <Suspense fallback={<TendenciasLoader />}>
        <TendenciasSection />
      </Suspense>
    </div>
  );
}
