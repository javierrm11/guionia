"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { BadgeTone } from "@/components/Badge";
import { ESTADO_PIEZA_TONE } from "@/lib/contenido";

export type PiezaCelda = { id: string; titulo: string; estado: string };
export type CeldaCalendario = {
  dia: number;
  fecha: string;
  href: string;
  piezas: PiezaCelda[];
  riesgo: boolean;
  esHoy: boolean;
  /** Día de relleno del mes anterior/siguiente — se pinta atenuado y sin
   *  enlace, solo para dar contexto de en qué día de la semana cae el 1. */
  fueraDeMes?: boolean;
};

const UMBRAL_ARRASTRE = 6;
const CLAVE_AYUDA_VISTA = "guionia-calendario-arrastre-visto";

const DOT_TONE: Record<BadgeTone, string> = {
  success: "bg-badge-success",
  warning: "bg-badge-warning",
  neutral: "bg-badge-neutral",
  danger: "bg-badge-danger",
};

// Mismo patrón que `ThemeToggle.tsx` (`useSyncExternalStore` en vez de
// useState+useEffect) para leer si el usuario ya vio el aviso de arrastre
// sin caer en el aviso de lint de "setState dentro de un efecto".
let listenersAyuda: (() => void)[] = [];

function suscribirAyuda(callback: () => void) {
  listenersAyuda.push(callback);
  return () => {
    listenersAyuda = listenersAyuda.filter((l) => l !== callback);
  };
}

function leerAyudaVista() {
  try {
    return localStorage.getItem(CLAVE_AYUDA_VISTA) != null;
  } catch {
    return false;
  }
}

function leerAyudaVistaServidor() {
  return false;
}

function marcarAyudaVista() {
  try {
    localStorage.setItem(CLAVE_AYUDA_VISTA, "1");
  } catch {
    // localStorage puede no estar disponible (privado/bloqueado) — el
    // aviso simplemente se queda visible siempre en ese caso.
  }
  for (const callback of listenersAyuda) callback();
}

/** Rejilla del calendario mensual — arrastra una pieza a otro día para
 *  reprogramar su fecha de publicación. Usa Pointer Events (no el Drag&Drop
 *  nativo de HTML5, que solo funciona con ratón) para que también valga con
 *  el dedo en móvil. Un tap normal (sin arrastrar) sigue navegando al día,
 *  como siempre — el click solo se bloquea si de verdad hubo arrastre y el
 *  soltar cae dentro de la misma celda de origen (si cae en otra celda, el
 *  propio navegador ya no dispara el click). */
export function CalendarioMensualGrid({
  celdas,
  diasCabecera,
  reprogramarFecha,
  redirectTo,
}: {
  celdas: (CeldaCalendario | null)[];
  diasCabecera: string[];
  reprogramarFecha: (formData: FormData) => void | Promise<void>;
  redirectTo: string;
}) {
  const [ghost, setGhost] = useState<{
    titulo: string;
    x: number;
    y: number;
  } | null>(null);
  const [fechaDestino, setFechaDestino] = useState<string | null>(null);
  const ayudaVista = useSyncExternalStore(
    suscribirAyuda,
    leerAyudaVista,
    leerAyudaVistaServidor,
  );
  const mostrarAyuda = !ayudaVista;

  const movidoRef = useRef(false);
  const origenRef = useRef({ x: 0, y: 0 });
  const piezaIdRef = useRef<string | null>(null);
  const fechaOrigenRef = useRef<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const fechaInputRef = useRef<HTMLInputElement>(null);

  function onPointerDown(
    e: ReactPointerEvent<HTMLSpanElement>,
    pieza: PiezaCelda,
    fecha: string,
  ) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    movidoRef.current = false;
    origenRef.current = { x: e.clientX, y: e.clientY };
    piezaIdRef.current = pieza.id;
    fechaOrigenRef.current = fecha;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGhost({ titulo: pieza.titulo, x: e.clientX, y: e.clientY });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (!ghost) return;
    const dx = e.clientX - origenRef.current.x;
    const dy = e.clientY - origenRef.current.y;
    if (Math.abs(dx) > UMBRAL_ARRASTRE || Math.abs(dy) > UMBRAL_ARRASTRE)
      movidoRef.current = true;
    setGhost((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));

    const elemento = document.elementFromPoint(e.clientX, e.clientY);
    const celda = elemento?.closest<HTMLElement>("[data-fecha-celda]");
    setFechaDestino(celda?.dataset.fechaCelda ?? null);
  }

  function onPointerUp() {
    if (
      movidoRef.current &&
      fechaDestino &&
      piezaIdRef.current &&
      fechaDestino !== fechaOrigenRef.current
    ) {
      if (idInputRef.current) idInputRef.current.value = piezaIdRef.current;
      if (fechaInputRef.current) fechaInputRef.current.value = fechaDestino;
      formRef.current?.requestSubmit();
      marcarAyudaVista();
    }
    setGhost(null);
    setFechaDestino(null);
    piezaIdRef.current = null;
    fechaOrigenRef.current = null;
    // `movidoRef` se deja tal cual a propósito — si hubo arrastre, el click
    // sintético (cuando cae dentro de la misma celda) llega justo después y
    // es quien lo comprueba y lo limpia; si lo reseteáramos aquí, llegaría
    // siempre en false y no podría bloquear esa navegación.
  }

  function onClickCaptureCelda(e: React.MouseEvent) {
    if (movidoRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    movidoRef.current = false;
  }

  return (
    <>
      <form ref={formRef} action={reprogramarFecha}>
        <input ref={idInputRef} type="hidden" name="id" />
        <input ref={fechaInputRef} type="hidden" name="fecha_publicacion" />
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </form>

      <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
        {diasCabecera.map((d) => (
          <div key={d} className="text-caption text-center text-text-secondary">
            {d}
          </div>
        ))}

        {celdas.map((celda, index) => {
          if (!celda) return <div key={`vacio-${index}`} />;

          if (celda.fueraDeMes) {
            return (
              <div
                key={celda.fecha}
                className="flex min-h-16 flex-col gap-0.5 rounded-sm border border-transparent p-1 opacity-40 lg:min-h-24 lg:p-2"
              >
                <span className="text-caption text-text-disabled lg:text-small">
                  {celda.dia}
                </span>
              </div>
            );
          }

          const colorBorde = celda.riesgo
            ? "border-danger bg-danger-bg"
            : celda.esHoy
              ? "border-accent bg-accent-bg"
              : "border-border";
          const enDestino = fechaDestino === celda.fecha;
          const visibles = celda.piezas.slice(0, 2);
          const restantes = celda.piezas.length - visibles.length;

          return (
            <Link
              key={celda.fecha}
              href={celda.href}
              data-fecha-celda={celda.fecha}
              onClickCapture={onClickCaptureCelda}
              className={`flex min-h-16 flex-col gap-0.5 rounded-sm border p-1 hover:bg-neutral-bg lg:min-h-24 lg:p-2 ${colorBorde} ${
                enDestino ? "ring-2 ring-accent" : ""
              }`}
            >
              <span
                className={`text-caption lg:text-small ${celda.riesgo ? "text-danger" : "text-text-secondary"}`}
              >
                {celda.dia}
              </span>
              {visibles.map((p) => (
                <span
                  key={p.id}
                  title={p.titulo}
                  onPointerDown={(e) => onPointerDown(e, p, celda.fecha)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className="flex touch-none items-center gap-1 truncate text-caption text-accent lg:text-small"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONE[ESTADO_PIEZA_TONE[p.estado] ?? "neutral"]}`}
                  />
                  <span className="truncate">{p.titulo}</span>
                </span>
              ))}
              {restantes > 0 && (
                <span className="text-caption text-accent">
                  +{restantes} más
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {mostrarAyuda && (
        <p className="text-caption text-text-disabled">
          Mantén pulsado un vídeo y arrástralo a otro día para reprogramarlo.
        </p>
      )}

      {ghost &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 max-w-40 truncate rounded-sm bg-accent px-2 py-1 text-caption text-white shadow-lg"
            style={{ left: ghost.x + 12, top: ghost.y + 12 }}
          >
            {ghost.titulo}
          </div>,
          document.body,
        )}
    </>
  );
}
