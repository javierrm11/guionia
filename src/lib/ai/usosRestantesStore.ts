"use client";

import { obtenerUsosIaRestantes } from "@/lib/ai/actions";

/** Cuántos usos de IA le quedan hoy al usuario, compartido entre todos los
 *  `AiEscenaButton` de la página (puede haber uno por escena) — usar IA en
 *  uno debe reflejarse al momento en el resto, sin que cada botón guarde su
 *  propio número por separado. `null` = todavía no se sabe (antes de la
 *  primera carga). Mismo patrón `useSyncExternalStore` que `ThemeToggle.tsx`
 *  y `CalendarioMensualGrid.tsx`, para no depender de un efecto que llame a
 *  `setState`. */
let valor: number | null = null;
let cargando = false;
let listeners: (() => void)[] = [];

export function suscribir(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function leer() {
  return valor;
}

export function leerServidor() {
  return null;
}

export function establecer(nuevoValor: number) {
  valor = nuevoValor;
  for (const callback of listeners) callback();
}

/** Pide el valor inicial al servidor la primera vez que hace falta —
 *  llamado por cada `AiEscenaButton` al montar, pero solo el primero llega a
 *  hacer la llamada real (los demás la encuentran ya en marcha o resuelta). */
export function asegurarCargado() {
  if (valor !== null || cargando) return;
  cargando = true;
  obtenerUsosIaRestantes()
    .then((restantes) => establecer(restantes))
    .finally(() => {
      cargando = false;
    });
}
