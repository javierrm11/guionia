"use client";

import { useState, type ReactNode } from "react";
import { guardarVideoSubido } from "@/app/contenido/[plataforma]/videos/[anio]/[mes]/[dia]/[id]/actions";

type Privacidad = "public" | "unlisted" | "private";

const PRIVACIDAD_LABEL: Record<Privacidad, string> = {
  public: "Público",
  unlisted: "Oculto",
  private: "Privado",
};

/** Sube el archivo directamente al servidor de Google (subida "resumable"),
 *  sin pasar por nuestras funciones serverless — el servidor solo abre la
 *  sesión (`/api/youtube/subir-sesion`, payload minúsculo) y el navegador
 *  hace el `PUT` de los bytes del vídeo contra la URL que devuelve Google.
 *  No es un `<form>` (todo va por estado controlado) para poder pintar el
 *  botón alternativo "lo he subido yo mismo" — un `<form>` de verdad, con su
 *  propio `action` — justo al lado, sin anidar un formulario dentro de otro. */
export function SubirVideoYoutube({
  id,
  redirectTo,
  tituloInicial,
  descripcionInicial,
  etiquetasInicial,
  botonManual,
}: {
  id: string;
  redirectTo: string;
  tituloInicial: string;
  descripcionInicial: string;
  etiquetasInicial: string;
  /** Botón alternativo ("lo he subido yo mismo"), pintado junto al de subir. */
  botonManual?: ReactNode;
}) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [etiquetas, setEtiquetas] = useState(etiquetasInicial);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [privacidad, setPrivacidad] = useState<Privacidad>("unlisted");
  const [programarEn, setProgramarEn] = useState("");
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir() {
    if (!archivo) {
      setError("Elige primero el archivo de vídeo.");
      return;
    }
    setError(null);
    setProgreso(0);

    try {
      const listaEtiquetas = etiquetas
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const resSesion = await fetch("/api/youtube/subir-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion,
          etiquetas: listaEtiquetas,
          privacidad,
          publicarEn: programarEn ? new Date(programarEn).toISOString() : undefined,
        }),
      });
      const datosSesion = await resSesion.json();
      if (!resSesion.ok) throw new Error(datosSesion.error ?? "No se pudo iniciar la subida");

      const youtubeVideoId = await subirArchivo(datosSesion.uploadUrl, archivo, setProgreso);

      await guardarVideoSubido(id, youtubeVideoId, redirectTo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el vídeo");
      setProgreso(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border p-4">
      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Título para YouTube</span>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Descripción</span>
        <textarea
          rows={5}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Etiquetas</span>
        <input
          type="text"
          placeholder="separadas por comas"
          value={etiquetas}
          onChange={(e) => setEtiquetas(e.target.value)}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Archivo de vídeo</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="text-body"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Privacidad en YouTube</span>
        <select
          value={privacidad}
          disabled={!!programarEn}
          onChange={(e) => setPrivacidad(e.target.value as Privacidad)}
          className="rounded-sm border border-border bg-bg-primary px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none disabled:opacity-60"
        >
          {(Object.keys(PRIVACIDAD_LABEL) as Privacidad[]).map((p) => (
            <option key={p} value={p}>
              {PRIVACIDAD_LABEL[p]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Programar publicación (opcional)</span>
        <input
          type="datetime-local"
          value={programarEn}
          onChange={(e) => setProgramarEn(e.target.value)}
          className="rounded-sm border border-border px-3 py-2 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
        {programarEn && (
          <span className="text-caption text-text-disabled">
            Se sube como privado y YouTube lo publica solo en esa fecha/hora.
          </span>
        )}
      </label>

      {progreso !== null && (
        <div className="h-1.5 w-full rounded-full bg-neutral-bg">
          <div
            className="h-1.5 rounded-full bg-accent transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}

      {error && <p className="text-small text-danger">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={subir}
          disabled={!archivo || progreso !== null}
          className="self-start rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover disabled:opacity-60"
        >
          {progreso !== null
            ? `Subiendo… ${progreso}%`
            : programarEn
              ? "Subir y programar"
              : "Subir a YouTube"}
        </button>
        {botonManual}
      </div>
    </div>
  );
}

function subirArchivo(
  uploadUrl: string,
  archivo: File,
  onProgreso: (porcentaje: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", archivo.type || "video/*");

    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable) {
        onProgreso(Math.round((evento.loaded / evento.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (!data.id) throw new Error("YouTube no devolvió el id del vídeo");
          resolve(data.id as string);
        } catch {
          reject(new Error("Respuesta inesperada de YouTube al subir el vídeo"));
        }
      } else {
        reject(new Error(`La subida a YouTube falló (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red subiendo el vídeo a YouTube"));

    xhr.send(archivo);
  });
}
