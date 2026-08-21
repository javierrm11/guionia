import { GoogleGenAI } from "@google/genai";
import { PLATAFORMA_LABEL, type Plataforma } from "@/lib/plataformas";
import { PILAR_LABEL, TIPO_ESCENA_LABEL, type TipoEscena } from "@/lib/contenido";

const MODELO = "gemini-3.5-flash-lite";

export type EscenaContexto = {
  tipoEscena: TipoEscena;
  texto: string;
};

export type GenerarEscenaInput = {
  modo: "generar" | "mejorar";
  tituloIdea: string;
  plataforma: Plataforma;
  pilar?: string | null;
  tipoEscena: TipoEscena;
  duracionSegundos?: number | null;
  otrasEscenas: EscenaContexto[];
  textoActual?: string;
};

function construirPrompt(input: GenerarEscenaInput): string {
  const partes: string[] = [
    "Eres un guionista experto en contenido corto para redes sociales (TikTok, Instagram Reels, YouTube Shorts, LinkedIn).",
    "Escribe SIEMPRE en español de España, con frases cortas pensadas para hablar en cámara, tono directo y natural, sin emojis ni hashtags.",
    "Responde ÚNICAMENTE con el texto de la escena. Sin comillas, sin markdown, sin explicaciones, sin etiquetas de tipo de escena delante.",
    "",
    `Plataforma: ${PLATAFORMA_LABEL[input.plataforma]}`,
    `Idea del vídeo: ${input.tituloIdea}`,
  ];

  if (input.pilar) {
    partes.push(`Pilar de contenido: ${PILAR_LABEL[input.pilar] ?? input.pilar}`);
  }

  partes.push(`Esta escena es el: ${TIPO_ESCENA_LABEL[input.tipoEscena]}`);

  if (input.tipoEscena === "hook") {
    partes.push("El hook debe enganchar en la primera frase, plantear el problema o la promesa del vídeo.");
  } else if (input.tipoEscena === "cta") {
    partes.push("El CTA debe invitar a seguir, comentar o guardar, en una frase corta.");
  }

  if (input.duracionSegundos) {
    const palabrasAprox = Math.round(input.duracionSegundos * 2.5);
    partes.push(
      `Duración objetivo: ${input.duracionSegundos} segundos hablados (aprox. ${palabrasAprox} palabras).`
    );
  }

  const otras = input.otrasEscenas.filter((e) => e.texto.trim().length > 0);
  if (otras.length > 0) {
    partes.push("", "Resto del guion ya escrito, para que esta escena encaje con el resto:");
    for (const e of otras) {
      partes.push(`- ${TIPO_ESCENA_LABEL[e.tipoEscena]}: ${e.texto.trim()}`);
    }
  }

  if (input.modo === "mejorar" && input.textoActual?.trim()) {
    partes.push(
      "",
      "Texto actual de esta escena (reescríbelo para que sea más claro, más directo y enganche más, manteniendo la misma idea):",
      input.textoActual.trim()
    );
  } else {
    partes.push("", "Esta escena está vacía todavía. Escríbela desde cero.");
  }

  return partes.join("\n");
}

function limpiarRespuesta(texto: string): string {
  return texto
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .replace(/^["“]|["”]$/g, "")
    .trim();
}

let cliente: GoogleGenAI | null = null;

function obtenerCliente(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar GEMINI_API_KEY en .env.local");
  }
  if (!cliente) {
    cliente = new GoogleGenAI({ apiKey });
  }
  return cliente;
}

export async function generarTextoEscena(input: GenerarEscenaInput): Promise<string> {
  const ai = obtenerCliente();

  const respuesta = await ai.models.generateContent({
    model: MODELO,
    contents: construirPrompt(input),
  });

  const texto = respuesta.text;
  if (!texto || !texto.trim()) {
    throw new Error("Gemini no ha devuelto ningún texto");
  }

  return limpiarRespuesta(texto);
}
