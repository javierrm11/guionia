"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TIPOS_ESCENA, TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import type { Plataforma } from "@/lib/plataformas";
import { AiEscenaButton } from "@/components/AiEscenaButton";
import { SubmitButton } from "@/components/SubmitButton";
import { convertirEnGuion } from "./actions";

type Frase = {
  id: string;
  tipo_escena: TipoEscena;
  texto: string;
};

const ETIQUETA_BANCO: Partial<Record<TipoEscena, string>> = {
  hook: "hook",
  cta: "CTA",
};

type EscenaPlantilla = {
  id: string;
  orden: number;
  tipo_escena: TipoEscena;
  duracion_segundos: number;
  nota: string | null;
};

type Estructura = {
  id: string;
  nombre: string;
  duracion_segundos: number;
  estructura_escenas: EscenaPlantilla[];
};

type EscenaEditable = {
  clientId: string;
  tipoEscena: TipoEscena;
  duracion: number | "";
  nota: string | null;
};

let contadorEscenaId = 0;
function nuevoClientId() {
  contadorEscenaId += 1;
  return `nueva-${contadorEscenaId}`;
}

export function ConvertirForm({
  plataforma,
  ideaId,
  tituloIdea,
  pilar,
  estructuras,
  frases,
  fechaHoy,
}: {
  plataforma: Plataforma;
  ideaId: string;
  tituloIdea: string;
  pilar: string | null;
  estructuras: Estructura[];
  frases: Frase[];
  fechaHoy: string;
}) {
  const [estructuraId, setEstructuraId] = useState("");
  const [escenas, setEscenas] = useState<EscenaEditable[]>([]);
  const [nuevoTipo, setNuevoTipo] = useState<TipoEscena | "">("");
  const [nuevaDuracion, setNuevaDuracion] = useState("");
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const estructuraActual = estructuras.find((e) => e.id === estructuraId) ?? null;
  const duracionTotal = escenas.reduce(
    (acc, e) => acc + (typeof e.duracion === "number" ? e.duracion : 0),
    0
  );

  function elegirEstructura(id: string) {
    setEstructuraId(id);
    const estructura = estructuras.find((e) => e.id === id);
    if (!estructura) {
      setEscenas([]);
      return;
    }
    setEscenas(
      [...estructura.estructura_escenas]
        .sort((a, b) => a.orden - b.orden)
        .map((e) => ({
          clientId: e.id,
          tipoEscena: e.tipo_escena,
          duracion: e.duracion_segundos,
          nota: e.nota,
        }))
    );
  }

  function moverEscena(index: number, direccion: -1 | 1) {
    const destino = index + direccion;
    if (destino < 0 || destino >= escenas.length) return;
    const copia = [...escenas];
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    setEscenas(copia);
  }

  function eliminarEscena(clientId: string) {
    setEscenas(escenas.filter((e) => e.clientId !== clientId));
  }

  function agregarEscena() {
    if (!nuevoTipo) return;
    setEscenas([
      ...escenas,
      {
        clientId: nuevoClientId(),
        tipoEscena: nuevoTipo,
        duracion: nuevaDuracion ? Number(nuevaDuracion) : "",
        nota: null,
      },
    ]);
    setNuevoTipo("");
    setNuevaDuracion("");
  }

  return (
    <form action={convertirEnGuion} className="flex flex-col gap-4">
      <input type="hidden" name="plataforma" value={plataforma} />
      <input type="hidden" name="id" value={ideaId} />
      <input type="hidden" name="estructura_id" value={estructuraId} />

      {estructuras.length > 0 && (
        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">Estructura (opcional)</span>
          <select
            value={estructuraId}
            onChange={(e) => elegirEstructura(e.target.value)}
            className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          >
            <option value="">Sin estructura (texto libre)</option>
            {estructuras.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.duracion_segundos}s)
              </option>
            ))}
          </select>
        </label>
      )}

      {estructuraId ? (
        <div className="flex flex-col gap-4">
          {estructuraActual && (
            <span
              className={`text-small ${
                duracionTotal === estructuraActual.duracion_segundos
                  ? "text-success"
                  : duracionTotal > estructuraActual.duracion_segundos
                    ? "text-warning"
                    : "text-text-secondary"
              }`}
            >
              Duración: {duracionTotal}/{estructuraActual.duracion_segundos}s
            </span>
          )}

          {escenas.map((escena, index) => (
            <div
              key={escena.clientId}
              className="flex flex-col gap-2 rounded-md border border-border p-3"
            >
              <div className="flex items-center gap-2">
                <input type="hidden" name="escena_tipo" value={escena.tipoEscena} />
                <input type="hidden" name="escena_duracion" value={escena.duracion} />

                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moverEscena(index, -1)}
                    disabled={index === 0}
                    aria-label="Mover escena arriba"
                    className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                  >
                    <ArrowUp size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moverEscena(index, 1)}
                    disabled={index === escenas.length - 1}
                    aria-label="Mover escena abajo"
                    className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                  >
                    <ArrowDown size={14} strokeWidth={1.5} />
                  </button>
                </div>

                <span className="text-h3">
                  {TIPO_ESCENA_LABEL[escena.tipoEscena]}
                  {escena.duracion !== "" ? ` · ${escena.duracion}s` : ""}
                </span>

                <button
                  type="button"
                  onClick={() => eliminarEscena(escena.clientId)}
                  className="ml-auto text-small text-accent"
                >
                  Eliminar
                </button>
              </div>

              {escena.nota && (
                <span className="text-caption text-text-disabled">{escena.nota}</span>
              )}

              {(() => {
                const opciones = frases.filter((f) => f.tipo_escena === escena.tipoEscena);
                const etiqueta = ETIQUETA_BANCO[escena.tipoEscena];
                if (opciones.length === 0 || !etiqueta) return null;

                return (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const frase = opciones.find((f) => f.id === e.target.value);
                      const textarea = textareaRefs.current[escena.clientId];
                      if (frase && textarea) {
                        textarea.value = frase.texto;
                      }
                      e.target.value = "";
                    }}
                    className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-small focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                  >
                    <option value="">Usar un {etiqueta} guardado…</option>
                    {opciones.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.texto.length > 60 ? `${f.texto.slice(0, 60)}…` : f.texto}
                      </option>
                    ))}
                  </select>
                );
              })()}

              <AiEscenaButton
                contexto={{
                  plataforma,
                  tituloIdea,
                  pilar,
                  tipoEscena: escena.tipoEscena,
                  duracionSegundos: escena.duracion === "" ? null : escena.duracion,
                  otrasEscenas: escenas
                    .filter((e) => e.clientId !== escena.clientId)
                    .map((e) => ({
                      tipoEscena: e.tipoEscena,
                      texto: textareaRefs.current[e.clientId]?.value ?? "",
                    })),
                }}
                obtenerTextoActual={() => textareaRefs.current[escena.clientId]?.value ?? ""}
                onResultado={(texto) => {
                  const textarea = textareaRefs.current[escena.clientId];
                  if (textarea) textarea.value = texto;
                }}
              />

              <textarea
                name="escena_texto"
                rows={3}
                ref={(el) => {
                  textareaRefs.current[escena.clientId] = el;
                }}
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          ))}

          <div className="flex flex-col gap-3 rounded-md border border-border p-3">
            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Tipo</span>
              <select
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value as TipoEscena)}
                className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              >
                <option value="">Selecciona un tipo</option>
                {TIPOS_ESCENA.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_ESCENA_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">Duración (segundos, opcional)</span>
              <input
                type="number"
                min={1}
                value={nuevaDuracion}
                onChange={(e) => setNuevaDuracion(e.target.value)}
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={agregarEscena}
              disabled={!nuevoTipo}
              className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-40"
            >
              + Añadir escena
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-h3 text-text-secondary">
            Texto del guion<span className="text-accent"> *</span>
          </span>
          <textarea
            name="texto"
            required
            rows={8}
            className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
          />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">
          Fecha de publicación<span className="text-accent"> *</span>
        </span>
        <input
          type="date"
          name="fecha_publicacion"
          required
          defaultValue={fechaHoy}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
      </label>

      <SubmitButton
        pendingLabel="Convirtiendo…"
        className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
      >
        Convertir en guion
      </SubmitButton>
    </form>
  );
}
