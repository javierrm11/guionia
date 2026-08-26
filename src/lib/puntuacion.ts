import type { TipoEscena } from "@/lib/contenido";

export type FactorPuntuacion = {
  id: string;
  etiqueta: string;
  puntos: number;
  maximo: number;
  consejo: string;
};

export type ResultadoPuntuacion = {
  puntuacion: number;
  factores: FactorPuntuacion[];
};

export type EscenaInput = {
  tipoEscena: TipoEscena;
  texto: string;
  duracionSegundos?: number | null;
};

const MULETILLAS = [
  "básicamente",
  "o sea",
  "la verdad es que",
  "en plan",
  "digamos que",
  "más o menos",
  "es que",
  "bueno pues",
  "por así decirlo",
];

const DISPARADORES_CURIOSIDAD = [
  "nunca",
  "nadie",
  "secreto",
  "error",
  "por qué",
  "cómo",
  "increíble",
  "no vas a creer",
  "esto cambia",
  "la verdad sobre",
  "lo que nadie te dice",
  "cuidado con",
  "deja de",
  "el motivo por el que",
];

const VERBOS_ACCION_CTA = [
  "sigue",
  "síguenos",
  "siguenos",
  "comenta",
  "guarda",
  "comparte",
  "suscríbete",
  "suscribete",
  "dale like",
  "cuéntame",
  "cuentame",
  "escríbeme",
  "escribeme",
  "etiqueta a",
  "no te pierdas",
  "apúntate",
  "apuntate",
];

const INCENTIVOS_CTA = [
  "para que",
  "si quieres",
  "para no perderte",
  "para descubrir",
  "así no te pierdas",
];

const CONECTORES_ESTRUCTURA = [
  "primero",
  "segundo",
  "tercero",
  "además",
  "por otro lado",
  "luego",
  "después",
  "así que",
  "esto significa",
  "por ejemplo",
  "es decir",
  "sin embargo",
  "en cambio",
  "resulta que",
];

function clamp(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor));
}

function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

function dividirFrases(texto: string): string[] {
  return texto
    .split(/[.!?]+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

function primerFragmento(texto: string): string {
  const match = texto.trim().match(/^(.*?[.!?])/);
  return match ? match[1] : texto.trim();
}

function contieneAlguno(texto: string, lista: string[]): boolean {
  const t = texto.toLowerCase();
  return lista.some((palabra) => t.includes(palabra));
}

function contarOcurrencias(texto: string, lista: string[]): number {
  const t = texto.toLowerCase();
  return lista.reduce((total, palabra) => total + (t.includes(palabra) ? 1 : 0), 0);
}

// --- factores comunes a cualquier tipo de escena ---

function factorRitmo(texto: string, duracionSegundos?: number | null): FactorPuntuacion {
  const maximo = 20;
  const palabras = contarPalabras(texto);
  const ideal = duracionSegundos && duracionSegundos > 0 ? duracionSegundos * 2.5 : 25;

  const desvioRelativo = Math.abs(palabras - ideal) / ideal;
  const puntos = Math.round(clamp(maximo * (1 - desvioRelativo / 0.6), 0, maximo));

  let consejo = "";
  if (duracionSegundos && duracionSegundos > 0) {
    if (palabras > ideal * 1.15) {
      consejo = `Para ${duracionSegundos}s a ritmo natural caben ~${Math.round(ideal)} palabras; tienes ${palabras} — recorta para no acelerar al leerlo.`;
    } else if (palabras < ideal * 0.85) {
      consejo = `Para ${duracionSegundos}s a ritmo natural caben ~${Math.round(ideal)} palabras; tienes ${palabras} — amplíala para no quedarte corto.`;
    }
  } else if (palabras > 45) {
    consejo = "Escena larga para formato corto — valora dividirla en dos.";
  } else if (palabras < 12) {
    consejo = "Escena muy corta — puede que no aporte suficiente por sí sola.";
  }

  return {
    id: "ritmo",
    etiqueta: duracionSegundos ? "Ritmo ajustado a la duración" : "Longitud adecuada para vídeo corto",
    puntos,
    maximo,
    consejo,
  };
}

function factorFrasesCortas(texto: string): FactorPuntuacion {
  const maximo = 20;
  const frases = dividirFrases(texto);
  const media =
    frases.length > 0
      ? frases.reduce((total, f) => total + contarPalabras(f), 0) / frases.length
      : 0;

  const puntos = Math.round(clamp(maximo * (1 - Math.max(0, media - 10) / 15), 0, maximo));
  const consejo =
    media > 10
      ? `Media de ${Math.round(media)} palabras por frase — corta las largas en dos para que suene natural al hablar.`
      : "";

  return { id: "frases", etiqueta: "Frases cortas para hablar en cámara", puntos, maximo, consejo };
}

function factorMuletillas(texto: string): FactorPuntuacion {
  const maximo = 15;
  const ocurrencias = contarOcurrencias(texto, MULETILLAS);
  const puntos = Math.round(clamp(maximo - ocurrencias * 5, 0, maximo));
  const consejo = ocurrencias > 0 ? "Quita las muletillas de relleno — restan ritmo al hablarlo." : "";

  return { id: "muletillas", etiqueta: "Sin muletillas de relleno", puntos, maximo, consejo };
}

// --- factores específicos del hook ---

function factorGanchoInmediato(texto: string): FactorPuntuacion {
  const maximo = 25;
  const inicio = primerFragmento(texto);
  const cumple =
    inicio.includes("?") || /\d/.test(inicio) || contieneAlguno(inicio, DISPARADORES_CURIOSIDAD);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple
    ? ""
    : 'Empieza con una pregunta, un número o una palabra que genere curiosidad ("el error que...", "nadie te dice que...") — el gancho se juega en la primera frase.';

  return { id: "gancho", etiqueta: "Gancho reconocible en la primera frase", puntos, maximo, consejo };
}

function factorPrimeraFraseConcisa(texto: string): FactorPuntuacion {
  const maximo = 10;
  const palabras = contarPalabras(primerFragmento(texto));
  const puntos = Math.round(clamp(maximo * (1 - Math.max(0, palabras - 12) / 12), 0, maximo));
  const consejo = palabras > 12 ? "La primera frase es larga — acórtala para enganchar antes de perder al espectador." : "";

  return { id: "primera-frase", etiqueta: "Primera frase directa", puntos, maximo, consejo };
}

function factorElementoConcreto(texto: string): FactorPuntuacion {
  const maximo = 10;
  const cumple = /\d/.test(texto) || contieneAlguno(texto, ["mejor", "peor", "único", "garantizado", "gratis"]);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple ? "" : "Añade un dato, cifra o afirmación concreta — es más creíble que una idea vaga.";

  return { id: "concreto", etiqueta: "Dato o afirmación concreta", puntos, maximo, consejo };
}

// --- factores específicos del desarrollo ---

function factorDatoConcreto(texto: string): FactorPuntuacion {
  const maximo = 25;
  const cumple = /\d/.test(texto) || contieneAlguno(texto, ["por ejemplo", "como cuando", "es decir", "imagina que"]);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple ? "" : "Apóyate en un dato, cifra o ejemplo concreto — da más credibilidad que una afirmación general.";

  return { id: "dato", etiqueta: "Dato o ejemplo concreto", puntos, maximo, consejo };
}

function factorConectores(texto: string): FactorPuntuacion {
  const maximo = 20;
  const cumple = contieneAlguno(texto, CONECTORES_ESTRUCTURA);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple
    ? ""
    : 'Usa un conector ("además", "por ejemplo", "esto significa que") para que se note la progresión de la idea.';

  return { id: "conectores", etiqueta: "Progresión de la idea marcada", puntos, maximo, consejo };
}

// --- factores específicos del CTA ---

function factorVerboAccion(texto: string): FactorPuntuacion {
  const maximo = 25;
  const cumple = contieneAlguno(texto, VERBOS_ACCION_CTA);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple
    ? ""
    : 'Incluye un verbo de acción claro ("sigue", "comenta", "guarda este vídeo") — sin él, el CTA no pide nada en concreto.';

  return { id: "verbo-accion", etiqueta: "Verbo de acción claro", puntos, maximo, consejo };
}

function factorBrevedadCta(texto: string): FactorPuntuacion {
  const maximo = 10;
  const palabras = contarPalabras(texto);
  const puntos = Math.round(clamp(maximo * (1 - Math.max(0, palabras - 20) / 20), 0, maximo));
  const consejo = palabras > 20 ? "El CTA es largo — una sola frase directa funciona mejor al cierre." : "";

  return { id: "brevedad-cta", etiqueta: "CTA breve", puntos, maximo, consejo };
}

function factorIncentivoCta(texto: string): FactorPuntuacion {
  const maximo = 10;
  const cumple = contieneAlguno(texto, INCENTIVOS_CTA);
  const puntos = cumple ? maximo : 0;
  const consejo = cumple
    ? ""
    : 'Dale un motivo ("para que no te lo pierdas", "si quieres la parte 2") — pedir la acción sin motivo convierte menos.';

  return { id: "incentivo-cta", etiqueta: "Motivo para la acción", puntos, maximo, consejo };
}

/**
 * Puntuación heurística de "atracción hacia el espectador" de una escena,
 * sin llamar a ningún modelo — solo patrones de texto (ritmo, estructura,
 * gancho/CTA según el tipo de escena). Es una señal de forma, no de si la
 * idea en sí es interesante.
 */
export function calcularPuntuacionEscena(
  texto: string,
  tipoEscena: TipoEscena,
  duracionSegundos?: number | null
): ResultadoPuntuacion {
  const limpio = (texto ?? "").trim();
  if (!limpio) {
    return {
      puntuacion: 0,
      factores: [
        {
          id: "vacio",
          etiqueta: "Escena vacía",
          puntos: 0,
          maximo: 100,
          consejo: "Escribe el texto de la escena para ver su puntuación.",
        },
      ],
    };
  }

  const factoresComunes = [factorRitmo(limpio, duracionSegundos), factorFrasesCortas(limpio), factorMuletillas(limpio)];

  const factoresTipo =
    tipoEscena === "hook"
      ? [factorGanchoInmediato(limpio), factorPrimeraFraseConcisa(limpio), factorElementoConcreto(limpio)]
      : tipoEscena === "cta"
        ? [factorVerboAccion(limpio), factorBrevedadCta(limpio), factorIncentivoCta(limpio)]
        : [factorDatoConcreto(limpio), factorConectores(limpio)];

  const factores = [...factoresComunes, ...factoresTipo];
  const puntosTotales = factores.reduce((total, f) => total + f.puntos, 0);
  const maximoTotal = factores.reduce((total, f) => total + f.maximo, 0);

  return {
    puntuacion: Math.round((puntosTotales / maximoTotal) * 100),
    factores,
  };
}

// --- puntuación general del vídeo: título + pilar + guion completo ---

function factorTitulo(titulo: string): FactorPuntuacion {
  const maximo = 20;
  const limpio = (titulo ?? "").trim();
  if (!limpio) {
    return {
      id: "titulo",
      etiqueta: "Título con gancho",
      puntos: 0,
      maximo,
      consejo: "Ponle un título — es lo primero (y a veces lo único) que ve el espectador antes de decidir si entra.",
    };
  }

  const palabras = contarPalabras(limpio);
  const tieneGancho = /\d/.test(limpio) || limpio.includes("?") || contieneAlguno(limpio, DISPARADORES_CURIOSIDAD);
  const longitudRazonable = palabras >= 3 && palabras <= 12;

  let puntos = 0;
  if (tieneGancho) puntos += 14;
  if (longitudRazonable) puntos += 6;

  const consejos: string[] = [];
  if (!tieneGancho) {
    consejos.push('añade un número, una pregunta o una palabra que genere curiosidad ("el error que...", "por qué...")');
  }
  if (!longitudRazonable) {
    consejos.push(palabras < 3 ? "es muy escueto, dale algo más de contexto" : "es largo, acórtalo para que se lea de un vistazo");
  }

  return {
    id: "titulo",
    etiqueta: "Título con gancho",
    puntos,
    maximo,
    consejo: consejos.join("; "),
  };
}

function factorPilarDefinido(pilar: string | null): FactorPuntuacion {
  const maximo = 10;
  const cumple = Boolean(pilar && pilar.trim());

  return {
    id: "pilar",
    etiqueta: "Pilar de contenido definido",
    puntos: cumple ? maximo : 0,
    maximo,
    consejo: cumple
      ? ""
      : "Asigna un pilar — ayuda a que el vídeo encaje en una estrategia reconocible, no una pieza suelta.",
  };
}

function factorEstructuraCompleta(escenas: EscenaInput[]): FactorPuntuacion {
  const maximo = 20;
  const tiene = (tipo: TipoEscena) => escenas.some((e) => e.tipoEscena === tipo && e.texto.trim());
  const tieneHook = tiene("hook");
  const tieneDesarrollo = tiene("desarrollo");
  const tieneCta = tiene("cta");

  const puntos = (tieneHook ? 8 : 0) + (tieneDesarrollo ? 6 : 0) + (tieneCta ? 6 : 0);

  const faltantes: string[] = [];
  if (!tieneHook) faltantes.push("hook");
  if (!tieneDesarrollo) faltantes.push("desarrollo");
  if (!tieneCta) faltantes.push("CTA");

  return {
    id: "estructura",
    etiqueta: "Estructura completa (hook, desarrollo, CTA)",
    puntos,
    maximo,
    consejo:
      faltantes.length > 0
        ? `Falta ${faltantes.join(" y ")} — un vídeo corto engancha, desarrolla y cierra con una acción.`
        : "",
  };
}

function factorCalidadEscenas(escenas: EscenaInput[]): FactorPuntuacion {
  const maximo = 50;
  const conTexto = escenas.filter((e) => e.texto.trim());

  if (conTexto.length === 0) {
    return {
      id: "calidad-escenas",
      etiqueta: "Calidad media de las escenas",
      puntos: 0,
      maximo,
      consejo: "Escribe el texto de las escenas para ver su calidad media.",
    };
  }

  const media =
    conTexto.reduce(
      (total, e) => total + calcularPuntuacionEscena(e.texto, e.tipoEscena, e.duracionSegundos).puntuacion,
      0
    ) / conTexto.length;

  return {
    id: "calidad-escenas",
    etiqueta: "Calidad media de las escenas",
    puntos: Math.round((media / 100) * maximo),
    maximo,
    consejo: media < 70 ? "Revisa la puntuación de cada escena por separado para ver qué mejorar." : "",
  };
}

/**
 * Puntuación general del vídeo: combina el título, si tiene un pilar
 * asignado, si la estructura está completa (hook/desarrollo/CTA) y la
 * calidad media de las escenas ya escritas (ver calcularPuntuacionEscena).
 * Mismo enfoque heurístico, sin modelo.
 */
export function calcularPuntuacionVideo(
  titulo: string,
  pilar: string | null,
  escenasSinSanear: EscenaInput[]
): ResultadoPuntuacion {
  const escenas = escenasSinSanear.map((e) => ({ ...e, texto: e.texto ?? "" }));

  const factores = [
    factorTitulo(titulo),
    factorPilarDefinido(pilar),
    factorEstructuraCompleta(escenas),
    factorCalidadEscenas(escenas),
  ];

  const puntosTotales = factores.reduce((total, f) => total + f.puntos, 0);
  const maximoTotal = factores.reduce((total, f) => total + f.maximo, 0);

  return {
    puntuacion: Math.round((puntosTotales / maximoTotal) * 100),
    factores,
  };
}
