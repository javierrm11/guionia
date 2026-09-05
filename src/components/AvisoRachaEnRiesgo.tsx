"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, X } from "lucide-react";
import { PLATAFORMA_ICON, PLATAFORMA_LABEL, todayISO, type Plataforma } from "@/lib/plataformas";

const STORAGE_KEY = "guionia-aviso-racha";
/** A partir de cuántos días o menos hasta el domingo se considera "en riesgo". */
const UMBRAL_DIAS_RIESGO = 2;

export type PendientePlataforma = { plataforma: Plataforma; faltan: number };

/** Modal proactivo: avisa cuando queda poco de la semana y la cadencia
 *  todavía no está cumplida, con una racha activa que se perdería. Se
 *  muestra solo una vez al día (localStorage), no en cada visita a Control —
 *  si el riesgo sigue al día siguiente, vuelve a avisar. */
export function AvisoRachaEnRiesgo({
  racha,
  diasRestantes,
  pendientes,
}: {
  racha: number;
  diasRestantes: number;
  pendientes: PendientePlataforma[];
}) {
  const [visible, setVisible] = useState(false);

  const faltanTotal = pendientes.reduce((suma, p) => suma + p.faltan, 0);
  const enRiesgo = racha >= 1 && faltanTotal > 0 && diasRestantes <= UMBRAL_DIAS_RIESGO;

  useEffect(() => {
    if (!enRiesgo) return;
    if (localStorage.getItem(STORAGE_KEY) === todayISO()) return;
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, [enRiesgo]);

  function cerrar() {
    localStorage.setItem(STORAGE_KEY, todayISO());
    setVisible(false);
  }

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        localStorage.setItem(STORAGE_KEY, todayISO());
        setVisible(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center lg:p-4"
      onClick={cerrar}
    >
      <div
        className="flex w-full flex-col gap-4 rounded-t-md bg-bg-secondary p-5 lg:max-w-sm lg:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundImage: "linear-gradient(135deg, #FFD23F, #FF6B35 55%, #E8393B)" }}
          >
            <Flame size={20} strokeWidth={0} fill="#FFFFFF" />
          </span>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="-m-2 p-2 text-text-secondary"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-h2">
            Tu racha de {racha} {racha === 1 ? "semana" : "semanas"} está en riesgo
          </span>
          <span className="text-small text-text-secondary">
            Te {faltanTotal === 1 ? "falta 1 pieza" : `faltan ${faltanTotal} piezas`} por publicar
            y{" "}
            {diasRestantes === 0
              ? "hoy es el último día de la semana"
              : diasRestantes === 1
                ? "solo queda 1 día"
                : `solo quedan ${diasRestantes} días`}
            .
          </span>
        </div>

        <div className="flex flex-col">
          {pendientes.map((p, index) => {
            const Icon = PLATAFORMA_ICON[p.plataforma];
            return (
              <div
                key={p.plataforma}
                className={`flex items-center gap-2.5 py-2.5 ${index > 0 ? "border-t border-border" : ""}`}
              >
                <Icon size={16} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
                <span className="flex-1 text-body">{PLATAFORMA_LABEL[p.plataforma]}</span>
                <span className="text-caption text-text-secondary">Faltan {p.faltan}</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="flex-1 rounded-sm px-4 py-2.5 text-body text-text-primary active:bg-neutral-bg"
          >
            Ahora no
          </button>
          <Link
            href="/contenido/plataformas?vista=calendario"
            onClick={cerrar}
            className="flex-1 rounded-sm bg-accent px-4 py-2.5 text-center text-body text-white active:bg-accent-hover"
          >
            Ver calendario
          </Link>
        </div>
      </div>
    </div>
  );
}
