import Link from "next/link";
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
    <div className="flex flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-h1 text-center">Guionia</h1>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-bg-primary p-6">
        <form action={loginAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Email<span className="text-accent"> *</span>
            </span>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Contraseña<span className="text-accent"> *</span>
            </span>
            <input
              type="password"
              name="password"
              required
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          {error && <p className="text-small text-danger">{error}</p>}

          <SubmitButton
            pendingLabel="Entrando…"
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            Entrar
          </SubmitButton>
        </form>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-caption text-text-disabled">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleSignInButton />

        <Link
          href="/olvide-password"
          className="self-center text-small text-accent hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <p className="text-center text-small text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
