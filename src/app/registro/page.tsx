import Link from "next/link";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { registroAction } from "./actions";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaEmail?: string }>;
}) {
  const { error, revisaEmail } = await searchParams;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-h1 text-center">Crear cuenta</h1>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-bg-primary p-6">
        {revisaEmail ? (
          <p className="text-body text-text-secondary">
            Te hemos enviado un email para confirmar tu cuenta. Abre el enlace desde tu bandeja de
            entrada para poder iniciar sesión.
          </p>
        ) : (
          <>
            <form action={registroAction} className="flex flex-col gap-3">
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

              <label className="flex flex-col gap-1">
                <span className="text-h3 text-text-secondary">Contraseña</span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-h3 text-text-secondary">Confirmar contraseña</span>
                <input
                  type="password"
                  name="confirmar_password"
                  required
                  minLength={6}
                  className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                />
              </label>

              {error && <p className="text-small text-danger">{error}</p>}

              <button
                type="submit"
                className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
              >
                Crear cuenta
              </button>
            </form>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-caption text-text-disabled">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <GoogleSignInButton />
          </>
        )}
      </div>

      <p className="text-center text-small text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
