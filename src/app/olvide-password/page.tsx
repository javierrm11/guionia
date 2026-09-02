import type { Metadata } from "next";
import Link from "next/link";
import { olvidePasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false, follow: false },
};

export default async function OlvidePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  const { enviado } = await searchParams;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6 md:mx-auto md:w-full md:max-w-sm">
      <h1 className="text-h1 text-center">Recuperar contraseña</h1>

      <div className="flex flex-col gap-4 rounded-md border border-border p-6">
        {enviado ? (
          <p className="text-body text-text-secondary">
            Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la
            contraseña.
          </p>
        ) : (
          <form action={olvidePasswordAction} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Email</span>
              <input
                type="email"
                name="email"
                required
                autoFocus
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
            >
              Enviar enlace
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-small text-text-secondary">
        <Link href="/login" className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
