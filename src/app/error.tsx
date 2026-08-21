"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-h2">Algo ha ido mal</p>
      <p className="text-body text-text-secondary">
        {error.message || "Ha ocurrido un error inesperado."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Reintentar
        </button>
        <Link
          href="/contenido"
          className="rounded-sm border border-border px-4 py-2 text-body text-text-primary active:bg-bg-secondary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
