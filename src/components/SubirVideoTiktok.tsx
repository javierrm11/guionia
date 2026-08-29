"use client";

import { useState, type ReactNode } from "react";
import { marcarPublicadoTiktok } from "@/app/contenido/[plataforma]/videos/[anio]/[mes]/[dia]/[id]/actions";

const TAMANO_CHUNK = 10 * 1024 * 1024;
const TAMANO_MINIMO_CHUNK = 5 * 1024 * 1024;
const INTERVALO_POLLING_MS = 2000;
const MAX_INTENTOS_POLLING = 30;

type Rango = { inicio: number; fin: number };

/** Trozos de tamaño fijo (10MB); si el último quedaría por debajo del
 *  mínimo que exige TikTok (5MB), se fusiona con el anterior. */
function calcularChunks(videoSize: number): Rango[] {
  const rangos: Rango[] = [];
  let inicio = 0;
  while (inicio < videoSize) {
    const fin = Math.min(inicio + TAMANO_CHUNK, videoSize);
    rangos.push({ inicio, fin });
    inicio = fin;
  }
  if (rangos.length > 1) {
    const ultimo = rangos[rangos.length - 1];
    if (ultimo.fin - ultimo.inicio < TAMANO_MINIMO_CHUNK) {
      rangos.pop();
      rangos[rangos.length - 1].fin = ultimo.fin;
    }
  }
  return rangos;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function subirChunk(
  uploadUrl: string,
  archivo: File,
  rango: Rango,
  videoSize: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", archivo.type || "video/mp4");
    xhr.setRequestHeader(
      "Content-Range",
      `bytes ${rango.inicio}-${rango.fin - 1}/${videoSize}`
    );

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`La subida a TikTok falló (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Error de red subiendo el vídeo a TikTok"));

    xhr.send(archivo.slice(rango.inicio, rango.fin));
  });
}

/** Igual que `SubirVideoYoutube.tsx` (estado controlado, no `<form>`, para
 *  poder poner `botonManual` al lado) pero con dos diferencias reales de la
 *  API de TikTok: los bytes van por trozos secuenciales (no un solo `PUT`,
 *  TikTok exige al menos 5MB por trozo y en orden), y la publicación es
 *  asíncrona — hay que hacer polling a `/api/tiktok/subir-estado` hasta
 *  `PUBLISH_COMPLETE`. Publicado siempre como privado (`SELF_ONLY`): esta
 *  app no está auditada por TikTok, no hay forma de publicar en público. */
export function SubirVideoTiktok({
  id,
  redirectTo,
  tituloInicial,
  botonManual,
}: {
  id: string;
  redirectTo: string;
  tituloInicial: string;
  /** Botón alternativo ("lo he subido yo mismo"), pintado junto al de subir. */
  botonManual?: ReactNode;
}) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [estadoTexto, setEstadoTexto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir() {
    if (!archivo) {
      setError("Elige primero el archivo de vídeo.");
      return;
    }
    setError(null);
    setProgreso(0);
    setEstadoTexto("Iniciando…");

    try {
      const chunks = calcularChunks(archivo.size);

      const resSesion = await fetch("/api/tiktok/subir-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          videoSize: archivo.size,
          chunkSize: TAMANO_CHUNK,
          totalChunkCount: chunks.length,
        }),
      });
      const datosSesion = await resSesion.json();
      if (!resSesion.ok) throw new Error(datosSesion.error ?? "No se pudo iniciar la subida");

      setEstadoTexto("Subiendo…");
      let subido = 0;
      for (const rango of chunks) {
        await subirChunk(datosSesion.uploadUrl, archivo, rango, archivo.size);
        subido += rango.fin - rango.inicio;
        setProgreso(Math.round((subido / archivo.size) * 100));
      }

      setEstadoTexto("Procesando en TikTok…");
      let intentos = 0;
      while (intentos < MAX_INTENTOS_POLLING) {
        const resEstado = await fetch("/api/tiktok/subir-estado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishId: datosSesion.publishId }),
        });
        const datosEstado = await resEstado.json();
        if (!resEstado.ok) throw new Error(datosEstado.error ?? "No se pudo consultar el estado");

        if (datosEstado.status === "PUBLISH_COMPLETE") {
          await marcarPublicadoTiktok(id, redirectTo);
          return;
        }
        if (datosEstado.status === "FAILED") {
          throw new Error(datosEstado.failReason ?? "TikTok no pudo procesar el vídeo");
        }

        intentos++;
        await esperar(INTERVALO_POLLING_MS);
      }

      throw new Error(
        "TikTok sigue procesando el vídeo — puede tardar más de lo normal, prueba a comprobarlo en la app dentro de un rato."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el vídeo");
      setProgreso(null);
      setEstadoTexto(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md bg-bg-primary p-4">
      <label className="flex flex-col gap-1">
        <span className="text-h3 text-text-secondary">Descripción (con hashtags)</span>
        <textarea
          rows={5}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
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

      <p className="text-caption text-text-disabled">
        TikTok lo publica como privado (solo tú lo ves) mientras esta app no esté auditada.
        Cuando lo encuentres en tu perfil, pega la URL en el guion para enlazarlo.
      </p>

      {progreso !== null && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full rounded-full bg-neutral-bg">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          {estadoTexto && <span className="text-caption text-text-secondary">{estadoTexto}</span>}
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
          {progreso !== null ? `${estadoTexto ?? "Subiendo…"} ${progreso}%` : "Subir a TikTok"}
        </button>
        {botonManual}
      </div>
    </div>
  );
}
