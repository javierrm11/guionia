import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";
import { CuentaLoader } from "@/components/CuentaLoader";
import { CuentaSection } from "@/components/CuentaSection";

export const dynamic = "force-dynamic";

export default function CuentaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <h1 className="text-h1">Cuenta</h1>

      <Suspense fallback={<CuentaLoader />}>
        <CuentaSection />
      </Suspense>

      <Link
        href="/configuracion"
        className="flex items-center justify-between rounded-md bg-bg-primary p-4"
      >
        <span className="flex items-center gap-2.5 text-body text-text-primary">
          <Settings size={18} strokeWidth={1.5} />
          Ajustes
        </span>
        <ChevronRight size={16} strokeWidth={2} className="text-text-disabled" />
      </Link>
    </div>
  );
}
