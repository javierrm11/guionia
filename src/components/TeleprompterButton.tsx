"use client";

import { useState } from "react";
import { PictureInPicture2 } from "lucide-react";

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
    };
  }
}

const ESTILO = `
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    padding: 24px;
    font-family: -apple-system, "Segoe UI", Inter, sans-serif;
    font-size: 22px;
    line-height: 1.6;
    white-space: pre-wrap;
    background: #fff;
    color: #111114;
  }
`;

function pintarTexto(ventana: Window, texto: string) {
  ventana.document.title = "Guion";
  const style = ventana.document.createElement("style");
  style.textContent = ESTILO;
  ventana.document.head.appendChild(style);
  const contenedor = ventana.document.createElement("div");
  contenedor.textContent = texto;
  ventana.document.body.appendChild(contenedor);
}

/** Abre el guion en una ventana aparte, pensada para dejarla visible en
 *  cualquier parte de la pantalla mientras se graba con otra app (cámara,
 *  OBS...) delante. Usa la Document Picture-in-Picture API cuando está
 *  disponible (Chrome/Edge de escritorio) — esa ventana sí se queda
 *  flotando por encima de cualquier otra app, no solo de otras pestañas
 *  del navegador — y si no está disponible cae a una ventana emergente
 *  normal (`window.open`), que el usuario puede mover a mano. */
export function TeleprompterButton({ texto }: { texto: string }) {
  const [error, setError] = useState<string | null>(null);

  async function abrir() {
    setError(null);

    if (window.documentPictureInPicture) {
      try {
        const pip = await window.documentPictureInPicture.requestWindow({
          width: 420,
          height: 640,
        });
        pintarTexto(pip, texto);
        return;
      } catch {
        // El usuario canceló el permiso o el navegador lo bloqueó — seguimos con el fallback.
      }
    }

    const popup = window.open("", "_blank", "popup,width=420,height=640");
    if (!popup) {
      setError("El navegador bloqueó la ventana emergente.");
      return;
    }
    pintarTexto(popup, texto);
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={abrir}
        className="flex items-center gap-2 rounded-sm px-4 py-2 text-body text-text-primary active:opacity-70"
      >
        <PictureInPicture2 size={14} strokeWidth={1.5} />
        Abrir guion aparte
      </button>
      {error && <span className="text-caption text-danger">{error}</span>}
    </span>
  );
}
