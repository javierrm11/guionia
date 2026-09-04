"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Monitor, Square, X } from "lucide-react";
import type { Plataforma } from "@/lib/plataformas";

type Modo = "elegir" | "previsualizando" | "grabando";
type Fuente = "camara" | "pantalla";

const MIME_CANDIDATOS = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function elegirMimeType() {
  for (const tipo of MIME_CANDIDATOS) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(tipo)) return tipo;
  }
  return undefined;
}

function nombreArchivo(titulo: string) {
  const slug = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "grabacion"}.webm`;
}

/** Graba vídeo desde la cámara o capturando pantalla/ventana (MediaRecorder
 *  + getUserMedia/getDisplayMedia, todo en el navegador, sin servidor) y al
 *  terminar descarga el archivo (.webm) y avanza la pieza a "grabado" — vía
 *  un `<form>` oculto que reutiliza `avanzarEstado`, igual que hace
 *  `ConfirmButton`/`NuevoGuionFab` para disparar la acción de servidor. */
export function GrabarVideoButton({
  piezaId,
  plataforma,
  redirectTo,
  tituloArchivo,
  avanzarEstado,
}: {
  piezaId: string;
  plataforma: Plataforma;
  redirectTo: string;
  tituloArchivo: string;
  avanzarEstado: (formData: FormData) => void | Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<Modo>("elegir");
  const [error, setError] = useState<string | null>(null);
  const [grabando, setGrabando] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function pararStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function cerrar() {
    pararStream();
    recorderRef.current = null;
    chunksRef.current = [];
    setGrabando(false);
    setModo("elegir");
    setError(null);
    setAbierto(false);
  }

  function detenerGrabacion() {
    recorderRef.current?.stop();
  }

  async function elegirFuente(fuente: Fuente) {
    setError(null);
    try {
      const stream =
        fuente === "camara"
          ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

      streamRef.current = stream;
      // Si el usuario para la captura desde los controles nativos del
      // navegador (la barra "Dejar de compartir") en vez de nuestro botón.
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          detenerGrabacion();
        } else {
          cerrar();
        }
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      setModo("previsualizando");
    } catch {
      setError(
        fuente === "camara"
          ? "No se pudo acceder a la cámara. Revisa los permisos del navegador."
          : "No se pudo capturar la pantalla."
      );
    }
  }

  function empezarGrabacion() {
    if (!streamRef.current) return;
    const mimeType = elegirMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType ?? "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo(tituloArchivo);
      a.click();
      URL.revokeObjectURL(url);

      pararStream();
      setAbierto(false);
      formRef.current?.requestSubmit();
    };

    recorderRef.current = recorder;
    recorder.start();
    setGrabando(true);
    setModo("grabando");
  }

  useEffect(() => () => pararStream(), []);

  return (
    <>
      <form ref={formRef} action={avanzarEstado}>
        <input type="hidden" name="id" value={piezaId} />
        <input type="hidden" name="plataforma" value={plataforma} />
        <input type="hidden" name="siguiente" value="grabado" />
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </form>

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover lg:px-5 lg:py-2.5"
      >
        Grabar vídeo
      </button>

      {abierto &&
        createPortal(
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-md flex-col gap-4 rounded-md bg-bg-primary p-5">
              <div className="flex items-center justify-between">
                <span className="text-h2">Grabar vídeo</span>
                <button
                  type="button"
                  onClick={cerrar}
                  aria-label="Cerrar"
                  className="p-1 text-text-disabled"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {error && <p className="text-small text-danger">{error}</p>}

              {modo === "elegir" && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => elegirFuente("camara")}
                    className="flex items-center gap-3 rounded-md bg-bg-secondary p-3 text-left active:bg-accent-bg"
                  >
                    <Camera size={18} strokeWidth={1.5} className="text-accent" />
                    <span className="text-body">Cámara</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => elegirFuente("pantalla")}
                    className="flex items-center gap-3 rounded-md bg-bg-secondary p-3 text-left active:bg-accent-bg"
                  >
                    <Monitor size={18} strokeWidth={1.5} className="text-accent" />
                    <span className="text-body">Pantalla o ventana</span>
                  </button>
                </div>
              )}

              {(modo === "previsualizando" || modo === "grabando") && (
                <div className="flex flex-col gap-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full rounded-md bg-black"
                  />
                  <div className="flex items-center gap-3">
                    {grabando && (
                      <span className="flex items-center gap-1.5 text-small text-danger">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
                        Grabando…
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                      {!grabando ? (
                        <button
                          type="button"
                          onClick={empezarGrabacion}
                          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
                        >
                          Empezar a grabar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={detenerGrabacion}
                          className="flex items-center gap-2 rounded-sm bg-badge-danger px-4 py-2 text-body text-white active:opacity-90"
                        >
                          <Square size={14} strokeWidth={1.5} fill="currentColor" />
                          Detener
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
