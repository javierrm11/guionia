import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-h2">No hemos encontrado esta página</p>
      <p className="text-body text-text-secondary">
        Puede que el enlace esté roto o que lo que buscabas ya no exista.
      </p>
      <Link
        href="/contenido"
        className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
