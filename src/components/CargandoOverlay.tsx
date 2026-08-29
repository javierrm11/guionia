/** Overlay a pantalla completa (fondo oscurecido y difuminado, tres puntos
 *  con rebote escalonado y un mensaje) — para que iniciar sesión/crear
 *  cuenta no se sienta como que no ha pasado nada mientras se espera al
 *  servidor. Puramente visual, controlado por `visible`; `EnviandoOverlay`
 *  lo conecta a `useFormStatus` para formularios, `GoogleSignInButton` lo
 *  controla con su propio estado al no pasar por un `<form>`. */
export function CargandoOverlay({ visible, mensaje }: { visible: boolean; mensaje: string }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="text-body font-medium text-white">{mensaje}</p>
    </div>
  );
}
