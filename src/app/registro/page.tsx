import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { RegistroForm } from "./RegistroForm";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaEmail?: string; email?: string }>;
}) {
  const { error, revisaEmail, email } = await searchParams;

  return (
    <AuthShell foto="/fotos/foto4.jpg">
      {revisaEmail ? (
        <p className="text-body text-text-secondary">
          Te hemos enviado un email para confirmar tu cuenta. Abre el enlace desde tu bandeja de
          entrada para poder iniciar sesión.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="font-display text-h1">Crea tu cuenta</h1>
            <p className="text-small text-text-secondary">
              Empieza a planificar tu contenido en un minuto.
            </p>
          </div>

          <RegistroForm initialEmail={email ?? ""} />

          {error && <p className="text-small text-danger">{error}</p>}

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-caption text-text-disabled">o continúa con</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton />

          <p className="text-center text-caption text-text-disabled">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/legal/terminos" className="text-accent hover:underline">
              Términos de Servicio
            </Link>{" "}
            y nuestra{" "}
            <Link href="/legal/privacidad" className="text-accent hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </>
      )}

      <p className="text-center text-small text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
