import { restablecerPasswordAction } from "./actions";

export default async function RestablecerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 p-6 md:mx-auto md:w-full md:max-w-sm">
      <h1 className="text-h1 text-center">Nueva contraseña</h1>

      <div className="flex flex-col gap-4 rounded-md border border-border p-6">
        <form action={restablecerPasswordAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">Nueva contraseña</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoFocus
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
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
