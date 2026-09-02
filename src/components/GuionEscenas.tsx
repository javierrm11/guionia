"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2, X } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/Badge";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EscenaTextoEditor } from "@/components/EscenaTextoEditor";
import { Puntuacion } from "@/components/Puntuacion";
import { PuntuacionGrande } from "@/components/PuntuacionGrande";
import { SubmitButton } from "@/components/SubmitButton";
import { calcularPuntuacionVideo, type EscenaInput } from "@/lib/puntuacion";
import { TIPOS_ESCENA, TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";
import type { Plataforma } from "@/lib/plataformas";

type EscenaGuion = {
  id: string;
  texto: string | null;
  tipo_escena: string;
  duracion_segundos: number | null;
};

type VersionEscena = { id: string; texto: string; created_at: string };

export function GuionEscenas({
  piezaId,
  titulo,
  numero,
  estadoTone,
  estadoLabel,
  fechaPublicacion,
  escenas,
  versionesPorEscena,
  rutaActual,
  plataforma,
  pilar,
  moverEscenaGuion,
  eliminarEscenaGuion,
  guardarTextoEscena,
  restaurarVersionEscena,
  agregarEscenaGuion,
}: {
  piezaId: string;
  titulo: string;
  numero: number | null;
  estadoTone: BadgeTone;
  estadoLabel: string;
  fechaPublicacion: string;
  escenas: EscenaGuion[];
  versionesPorEscena: Record<string, VersionEscena[]>;
  rutaActual: string;
  plataforma: Plataforma;
  pilar: string | null;
  moverEscenaGuion: (formData: FormData) => void | Promise<void>;
  eliminarEscenaGuion: (formData: FormData) => void | Promise<void>;
  guardarTextoEscena: (formData: FormData) => void | Promise<void>;
  restaurarVersionEscena: (formData: FormData) => void | Promise<void>;
  agregarEscenaGuion: (formData: FormData) => void | Promise<void>;
}) {
  const [textos, setTextos] = useState<Record<string, string>>(() =>
    Object.fromEntries(escenas.map((e) => [e.id, e.texto ?? ""]))
  );
  const [editando, setEditando] = useState<Record<string, boolean>>({});
  const [agregando, setAgregando] = useState(false);

  const escenasPuntuacion: EscenaInput[] = escenas.map((e) => ({
    tipoEscena: e.tipo_escena as TipoEscena,
    texto: textos[e.id] ?? "",
    duracionSegundos: e.duracion_segundos,
  }));

  const resultadoGeneral = useMemo(
    () => calcularPuntuacionVideo(titulo, pilar, escenasPuntuacion),
    [titulo, pilar, escenasPuntuacion]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-h2 lg:text-h1">{titulo}</p>

          <div className="flex items-center gap-2">
            {numero != null && <span className="text-small text-text-secondary">#{numero}</span>}
            <Badge tone={estadoTone}>{estadoLabel}</Badge>
            <span className="text-small text-text-secondary">{fechaPublicacion}</span>
          </div>
        </div>

        <PuntuacionGrande resultado={resultadoGeneral} />
      </div>

      <Puntuacion resultado={resultadoGeneral} etiqueta="puntuación general del vídeo" ocultarResumen modal />

      <div className="flex flex-col gap-3">
        {escenas.map((escena, index) => {
          const enEdicion = editando[escena.id] ?? false;
          const texto = textos[escena.id] ?? "";

          return (
            <div
              key={escena.id}
              className={`flex flex-col gap-2 py-3.5 lg:gap-2.5 lg:py-4 ${index > 0 ? "border-t border-border" : ""}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <form action={moverEscenaGuion}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="pieza_id" value={piezaId} />
                    <input type="hidden" name="direccion" value="arriba" />
                    <input type="hidden" name="redirectTo" value={rutaActual} />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Mover escena arriba"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowUp size={14} strokeWidth={1.5} />
                    </button>
                  </form>
                  <form action={moverEscenaGuion}>
                    <input type="hidden" name="id" value={escena.id} />
                    <input type="hidden" name="pieza_id" value={piezaId} />
                    <input type="hidden" name="direccion" value="abajo" />
                    <input type="hidden" name="redirectTo" value={rutaActual} />
                    <button
                      type="submit"
                      disabled={index === escenas.length - 1}
                      aria-label="Mover escena abajo"
                      className="p-2 -m-2 text-text-secondary disabled:opacity-30"
                    >
                      <ArrowDown size={14} strokeWidth={1.5} />
                    </button>
                  </form>
                </div>

                <span className="text-h3">
                  {TIPO_ESCENA_LABEL[escena.tipo_escena as TipoEscena]}
                  {escena.duracion_segundos ? ` · ${escena.duracion_segundos}s` : ""}
                </span>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditando((prev) => ({ ...prev, [escena.id]: !enEdicion }))}
                    className="flex items-center gap-1 p-2 -m-2 text-small text-accent"
                  >
                    {enEdicion ? (
                      <>
                        <X size={14} strokeWidth={1.5} />
                        Cerrar
                      </>
                    ) : (
                      <>
                        <Pencil size={14} strokeWidth={1.5} />
                        Editar
                      </>
                    )}
                  </button>

                  {enEdicion && (
                    <form action={eliminarEscenaGuion}>
                      <input type="hidden" name="id" value={escena.id} />
                      <input type="hidden" name="redirectTo" value={rutaActual} />
                      <ConfirmButton
                        message="¿Eliminar esta escena?"
                        ariaLabel="Eliminar escena"
                        confirmLabel="Eliminar"
                        className="flex items-center justify-center rounded-sm bg-badge-danger p-2 text-white"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </div>

              {enEdicion ? (
                <>
                  <EscenaTextoEditor
                    escenaId={escena.id}
                    redirectTo={rutaActual}
                    textoInicial={escena.texto ?? ""}
                    tipoEscena={escena.tipo_escena as TipoEscena}
                    duracionSegundos={escena.duracion_segundos}
                    plataforma={plataforma}
                    tituloIdea={titulo}
                    pilar={pilar}
                    otrasEscenas={escenas
                      .filter((e) => e.id !== escena.id)
                      .map((e) => ({
                        tipoEscena: e.tipo_escena as TipoEscena,
                        texto: textos[e.id] ?? e.texto ?? "",
                      }))}
                    guardarAction={guardarTextoEscena}
                    onTextoChange={(nuevoTexto) =>
                      setTextos((prev) => ({ ...prev, [escena.id]: nuevoTexto }))
                    }
                  />

                  {(versionesPorEscena[escena.id] ?? []).length > 0 && (
                    <details className="text-small">
                      <summary className="cursor-pointer text-text-secondary">
                        {versionesPorEscena[escena.id].length} versión(es) anterior(es)
                      </summary>
                      <ul className="mt-2 flex flex-col gap-2">
                        {versionesPorEscena[escena.id].map((v) => (
                          <li key={v.id} className="flex flex-col gap-1 rounded-sm border border-border p-2">
                            <span className="text-caption text-text-disabled">
                              {new Date(v.created_at).toLocaleString("es-ES")}
                            </span>
                            <p className="whitespace-pre-wrap text-text-secondary">{v.texto}</p>
                            <form action={restaurarVersionEscena} className="self-start">
                              <input type="hidden" name="escena_id" value={escena.id} />
                              <input type="hidden" name="version_id" value={v.id} />
                              <input type="hidden" name="redirectTo" value={rutaActual} />
                              <button type="submit" className="text-caption text-accent">
                                Restaurar esta versión
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              ) : texto.trim() ? (
                <p className="whitespace-pre-wrap text-body text-text-secondary lg:text-h3">{texto}</p>
              ) : (
                <p className="text-small text-text-disabled">Sin texto todavía.</p>
              )}
            </div>
          );
        })}

        {agregando ? (
          <form
            action={agregarEscenaGuion}
            className="flex flex-col gap-3 rounded-md border border-border p-3.5"
          >
            <input type="hidden" name="pieza_id" value={piezaId} />
            <input type="hidden" name="redirectTo" value={rutaActual} />

            <label className="flex flex-col gap-1">
              <span className="text-h3 text-text-secondary">
                Tipo<span className="text-accent"> *</span>
              </span>
              <select
                name="tipo_escena"
                required
                defaultValue=""
                className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              >
                <option value="" disabled>
                  Selecciona un tipo
                </option>
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
                name="duracion_segundos"
                min={1}
                className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </label>

            <div className="flex items-center gap-3">
              <SubmitButton
                pendingLabel="Añadiendo…"
                className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
              >
                + Añadir escena
              </SubmitButton>
              <button
                type="button"
                onClick={() => setAgregando(false)}
                className="text-small text-text-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAgregando(true)}
            className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
          >
            + Añadir escena
          </button>
        )}
      </div>
    </div>
  );
}
