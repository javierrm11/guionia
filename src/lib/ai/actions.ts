"use server";

import { generarTextoEscena, type GenerarEscenaInput } from "./gemini";

export async function generarEscenaConIA(
  input: GenerarEscenaInput
): Promise<{ texto: string } | { error: string }> {
  try {
    const texto = await generarTextoEscena(input);
    return { texto };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo generar el texto" };
  }
}
