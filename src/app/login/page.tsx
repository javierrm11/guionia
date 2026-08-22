import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { SubmitButton } from "@/components/SubmitButton";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col lg:items-center lg:justify-center lg:p-8">
      <div className="flex w-full flex-1 flex-col lg:max-w-sm lg:flex-none lg:overflow-hidden lg:rounded-md lg:shadow-2xl">
      <div className="flex min-h-[30vh] flex-1 items-end justify-center pb-8 lg:min-h-56 lg:flex-none">
        <span className="text-h1">Guionia</span>
      </div>

      <div className="flex flex-col gap-6 rounded-t-md bg-bg-secondary p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">Iniciar sesión</h1>
          <p className="text-small text-text-secondary">
            Entra con tu email para seguir con tu contenido.
          </p>
        </div>

        <form action={loginAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Email<span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="tú@email.com"
                className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Contraseña<span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          {error && <p className="text-small text-danger">{error}</p>}

          <SubmitButton
            pendingLabel="Entrando…"
            className="rounded-sm bg-accent px-4 py-3 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            Entrar
          </SubmitButton>
        </form>

        <Link
          href="/olvide-password"
          className="self-center text-small text-accent hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-caption text-text-disabled">o continúa con</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton />

        <p className="text-center text-small text-text-secondary">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
