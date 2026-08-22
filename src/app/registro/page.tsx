import Link from "next/link";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { RegistroForm } from "./RegistroForm";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaEmail?: string; email?: string }>;
}) {
  const { error, revisaEmail, email } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex min-h-[30vh] flex-1 items-end justify-center pb-8">
        <span className="text-h1">Guionia</span>
      </div>

      <div className="flex flex-col gap-6 rounded-t-md bg-bg-secondary p-6">
        {revisaEmail ? (
          <p className="text-body text-text-secondary">
            Te hemos enviado un email para confirmar tu cuenta. Abre el enlace desde tu bandeja de
            entrada para poder iniciar sesión.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-h1">Crear cuenta</h1>
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
          <Link href="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
