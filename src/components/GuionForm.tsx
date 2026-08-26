"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { PILAR_LABEL, TIPOS_ESCENA, TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import type { Plataforma } from "@/lib/plataformas";
import { AiEscenaButton } from "@/components/AiEscenaButton";
import { Puntuacion } from "@/components/Puntuacion";
import { PuntuacionEscena } from "@/components/PuntuacionEscena";
import { PuntuacionGrande } from "@/components/PuntuacionGrande";
import { SubmitButton } from "@/components/SubmitButton";
import { calcularPuntuacionVideo } from "@/lib/puntuacion";

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

/**
 * Formulario de guion, compartido por dos flujos:
 * - Convertir una idea existente en guion (`ideaId` presente, título y pilar
 *   fijos — vienen de la idea, no se editan aquí).
 * - Crear un vídeo directamente, sin pasar por una idea (`ideaId` ausente:
 *   título y pilar se piden en el propio formulario).
 * Quién llama decide la acción de servidor (`convertirEnGuion` o
 * `crearVideoDirecto`) vía la prop `action`.
 */
export function GuionForm({
  plataforma,
  ideaId,
  tituloInicial = "",
  pilarInicial = null,
  estructuras,
  frases,
  fechaHoy,
  action,
}: {
  plataforma: Plataforma;
  ideaId?: string;
  tituloInicial?: string;
  pilarInicial?: string | null;
  estructuras: Estructura[];
  frases: Frase[];
  fechaHoy: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [titulo, setTitulo] = useState(tituloInicial);
  const [pilar, setPilar] = useState(pilarInicial ?? "");
  const [fecha, setFecha] = useState(fechaHoy);
  const [estructuraId, setEstructuraId] = useState("");
  const [escenas, setEscenas] = useState<EscenaEditable[]>([]);
  const [nuevoTipo, setNuevoTipo] = useState<TipoEscena | "">("");
  const [nuevaDuracion, setNuevaDuracion] = useState("");
  const [textosPuntuacion, setTextosPuntuacion] = useState<Record<string, string>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const estructuraActual = estructuras.find((e) => e.id === estructuraId) ?? null;
  const duracionTotal = escenas.reduce(
    (acc, e) => acc + (typeof e.duracion === "number" ? e.duracion : 0),
    0
  );

  const escenasPuntuacion = escenas.map((e) => ({
    tipoEscena: e.tipoEscena,
    texto: textosPuntuacion[e.clientId] ?? "",
    duracionSegundos: e.duracion === "" ? null : e.duracion,
  }));

  const resultadoGeneral = useMemo(
    () => calcularPuntuacionVideo(titulo, pilar || null, escenasPuntuacion),
    [titulo, pilar, escenasPuntuacion]
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

  const pilarLabel = pilar ? PILAR_LABEL[pilar] : null;
  const subtitulo = [pilarLabel, estructuraActual?.nombre].filter(Boolean).join(" · ");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="plataforma" value={plataforma} />
      {ideaId && <input type="hidden" name="id" value={ideaId} />}
      <input type="hidden" name="estructura_id" value={estructuraId} />
      {!ideaId && <input type="hidden" name="titulo" value={titulo} />}
      {!ideaId && <input type="hidden" name="pilar" value={pilar} />}
      <input type="hidden" name="fecha_publicacion" value={fecha} />

      {paso === 1 ? (
        <>
          {!ideaId && (
            <>
              <h1 className="text-h1">Nuevo vídeo</h1>

              <label className="flex flex-col gap-1">
                <span className="text-h3 text-text-secondary">
                  Título<span className="text-accent"> *</span>
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-h3 text-text-secondary">Pilar</span>
                <select
                  value={pilar}
                  onChange={(e) => setPilar(e.target.value)}
                  className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
                >
                  <option value="">Sin definir</option>
                  {Object.entries(PILAR_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

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

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Fecha de publicación<span className="text-accent"> *</span>
            </span>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => setPaso(2)}
            disabled={!ideaId && !titulo.trim()}
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-40"
          >
            Escribir guion
          </button>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-h1">{titulo}</p>
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  aria-label="Editar título, pilar y estructura"
                  className="p-2 -m-2 text-accent"
                >
                  <Pencil size={16} strokeWidth={1.5} />
                </button>
              </div>
              {subtitulo && <p className="text-small text-text-secondary">{subtitulo}</p>}
            </div>

            <PuntuacionGrande resultado={resultadoGeneral} />
          </div>

          <Puntuacion resultado={resultadoGeneral} etiqueta="puntuación general del vídeo" ocultarResumen modal />

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
              className="flex flex-col gap-2 rounded-md border border-border"
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
                  aria-label="Eliminar escena"
                  className="ml-auto flex items-center justify-center rounded-sm bg-badge-danger p-2 text-white"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
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
                        setTextosPuntuacion((prev) => ({ ...prev, [escena.clientId]: frase.texto }));
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
                  tituloIdea: titulo,
                  pilar: pilar || null,
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
                  setTextosPuntuacion((prev) => ({ ...prev, [escena.clientId]: texto }));
                }}
              />

              <textarea
                name="escena_texto"
                rows={3}
                ref={(el) => {
                  textareaRefs.current[escena.clientId] = el;
                }}
                onChange={(e) =>
                  setTextosPuntuacion((prev) => ({ ...prev, [escena.clientId]: e.target.value }))
                }
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />

              <PuntuacionEscena
                texto={textosPuntuacion[escena.clientId] ?? ""}
                tipoEscena={escena.tipoEscena}
                duracionSegundos={escena.duracion === "" ? null : escena.duracion}
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

          <SubmitButton
            pendingLabel={ideaId ? "Convirtiendo…" : "Creando…"}
            className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            {ideaId ? "Convertir en guion" : "Crear vídeo"}
          </SubmitButton>
        </>
      )}
    </form>
  );
}
