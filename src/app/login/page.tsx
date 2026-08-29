import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PasswordInput } from "@/components/PasswordInput";
import { SubmitButton } from "@/components/SubmitButton";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell foto="/fotos/foto1.jpg">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-h1">¡Bienvenido de nuevo!</h1>
        <p className="text-small text-text-secondary">
          Entra con tu email para seguir con tu contenido.
        </p>
      </div>

      <form action={loginAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="px-1 text-caption text-text-secondary">Email</span>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-disabled"
            />
            <input
              type="email"
              name="email"
              required
              autoFocus
              placeholder="tú@email.com"
              style={{ "--input-bg": "var(--neutral-bg)" } as React.CSSProperties}
              className="w-full rounded-full border-0 py-3 pr-4 pl-10 text-body focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </div>
        </label>

        <PasswordInput name="password" />

        <Link href="/olvide-password" className="self-end text-caption text-accent">
          ¿Olvidaste tu contraseña?
        </Link>

        {error && <p className="text-small text-danger">{error}</p>}

        <SubmitButton
          pendingLabel="Entrando…"
          className="rounded-full bg-accent px-4 py-3 text-body text-white active:bg-accent-hover disabled:opacity-60"
        >
          Entrar
        </SubmitButton>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-caption text-text-disabled">o continúa con</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-small text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
