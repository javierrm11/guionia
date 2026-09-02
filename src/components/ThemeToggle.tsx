"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "guionia-tema";

let listeners: (() => void)[] = [];

function suscribir(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function leerOscuro() {
  return document.documentElement.classList.contains("dark");
}

function leerOscuroServidor() {
  return false;
}

function establecerOscuro(nuevo: boolean) {
  document.documentElement.classList.toggle("dark", nuevo);
  localStorage.setItem(STORAGE_KEY, nuevo ? "oscuro" : "claro");
  for (const callback of listeners) callback();
}

/** Fila de ajuste (mismo patrón que la fila "Ajustes" de Cuenta) que alterna
 *  la clase `dark` en `<html>` — el script inline de `layout.tsx` la aplica
 *  ya antes del primer pintado a partir de lo guardado en localStorage.
 *  Usa `useSyncExternalStore` (en vez de useState+useEffect) para leer ese
 *  estado del DOM sin el patrón "setState dentro de un efecto"; el propio
 *  store notifica a los listeners al alternar, para que el botón se repinte. */
export function ThemeToggle() {
  const oscuro = useSyncExternalStore(suscribir, leerOscuro, leerOscuroServidor);

  return (
    <button
      type="button"
      onClick={() => establecerOscuro(!oscuro)}
      aria-pressed={oscuro}
      className="flex items-center justify-between rounded-md border border-border p-4 lg:p-5"
    >
      <span className="flex items-center gap-2.5 text-body text-text-primary lg:text-h3">
        <span key={oscuro ? "luna" : "sol"} className="animate-icono-tema inline-flex">
          {oscuro ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </span>
        Modo oscuro
      </span>
      <span
        className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          oscuro ? "bg-accent" : "bg-neutral-bg"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            oscuro ? "translate-x-6" : "translate-x-1"
          }`}
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
        />
      </span>
    </button>
  );
}
