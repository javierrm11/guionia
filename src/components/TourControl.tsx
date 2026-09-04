"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "guionia-tour-control";
const ANCHO_TOOLTIP = 300;

type Paso = { id: string; titulo: string; texto: string };

/** Candidatos del tour de Control — no todos existen siempre (una cuenta
 *  nueva sin cadencia no tiene tarjeta "hero", por ejemplo), así que al
 *  montar se filtran a los que de verdad estén en pantalla. Cada `id` puede
 *  tener más de un elemento en el DOM (versión móvil vs. escritorio, p. ej.
 *  el botón "+" vive tanto en `BottomNav` como en `Sidebar`) — se usa el que
 *  esté realmente visible según el ancho de pantalla. */
const PASOS: Paso[] = [
  {
    id: "cadencia",
    titulo: "Tu cadencia semanal",
    texto: "Aquí ves de un vistazo cuánto llevas cumplido esta semana.",
  },
  {
    id: "hero",
    titulo: "La tarea de hoy",
    texto: "Guionia prioriza sola qué toca ahora — toca la tarjeta para abrirla directamente.",
  },
  {
    id: "tiles",
    titulo: "Accesos rápidos",
    texto: "Crea una idea o un vídeo nuevo sin tener que entrar antes a la plataforma.",
  },
  {
    id: "fab",
    titulo: "Crear guion",
    texto: "Este botón te lleva directo a elegir la plataforma y empezar un guion nuevo.",
  },
  {
    id: "nav-ideas",
    titulo: "El resto de la app",
    texto: "Desde aquí navegas al calendario de plataformas, tus ideas guardadas y tu cuenta.",
  },
];

function elementoVisible(id: string): HTMLElement | null {
  const candidatos = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const el of candidatos) {
    if (el.offsetParent !== null) return el;
  }
  return null;
}

/** Tour guiado de Control, más allá del wizard de `/contenido/bienvenida`
 *  (que solo pregunta por la cadencia) — señala con un recuadro los puntos
 *  clave de la pantalla (cadencia, tarea del día, accesos rápidos, crear
 *  guion, resto de la navegación) la primera vez que se entra. Se marca
 *  como visto en `localStorage` en cuanto arranca, no solo al terminarlo —
 *  así no se repite ni si se interrumpe a medias.
 *
 *  Solo se intenta si `cuentaNueva` (calculado en el servidor a partir de
 *  `user.created_at`, ver `/contenido/page.tsx`) — así una cuenta que ya
 *  lleva tiempo no lo ve por limpiar el `localStorage` o entrar desde otro
 *  dispositivo/navegador. */
export function TourControl({ cuentaNueva }: { cuentaNueva: boolean }) {
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [indice, setIndice] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!cuentaNueva) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const disponibles = PASOS.filter((p) => elementoVisible(p.id) !== null);
    if (disponibles.length === 0) return;

    // Se marca como visto aquí dentro, junto con el resto — no antes — para
    // que si el efecto se cancela (el doble montaje de Strict Mode en
    // desarrollo lo hace justo para pillar esto) no quede marcado como visto
    // un tour que en realidad nunca llegó a enseñarse.
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "visto");
      setPasos(disponibles);
      setIndice(0);
    }, 700);
    return () => clearTimeout(t);
  }, [cuentaNueva]);

  useEffect(() => {
    if (indice === null) return;
    const paso = pasos[indice];
    const el = paso ? elementoVisible(paso.id) : null;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const actualizar = () => setRect(el.getBoundingClientRect());
    const t = setTimeout(actualizar, 350);
    window.addEventListener("resize", actualizar);
    window.addEventListener("scroll", actualizar, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", actualizar);
      window.removeEventListener("scroll", actualizar, true);
    };
  }, [indice, pasos]);

  if (indice === null || !rect) return null;

  const total = pasos.length;
  const paso = pasos[indice];
  const esUltimo = indice === total - 1;

  function avanzar() {
    setIndice((actual) => {
      if (actual === null) return null;
      const siguiente = actual + 1;
      if (siguiente >= pasos.length) return null;
      setRect(null);
      return siguiente;
    });
  }

  const alturaEstimada = 150;
  const colocarArriba =
    rect.bottom + alturaEstimada + 16 > window.innerHeight && rect.top > alturaEstimada;
  const top = colocarArriba ? Math.max(16, rect.top - alturaEstimada - 12) : rect.bottom + 12;
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - ANCHO_TOOLTIP / 2, 16),
    window.innerWidth - ANCHO_TOOLTIP - 16
  );

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="absolute rounded-md ring-2 ring-accent transition-all duration-300"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(17,17,20,0.6)",
        }}
      />
      <div
        className="pointer-events-auto absolute flex flex-col gap-2 rounded-md bg-bg-primary p-4 shadow-lg transition-all duration-300"
        style={{ top, left, width: ANCHO_TOOLTIP }}
      >
        <span className="text-caption text-text-disabled">
          Paso {indice + 1} de {total}
        </span>
        <span className="text-h3">{paso.titulo}</span>
        <p className="text-small text-text-secondary">{paso.texto}</p>
        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndice(null)}
            className="text-caption text-text-secondary"
          >
            Saltar tour
          </button>
          <button
            type="button"
            onClick={avanzar}
            className="rounded-sm bg-accent px-3 py-1.5 text-caption text-white active:bg-accent-hover"
          >
            {esUltimo ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
