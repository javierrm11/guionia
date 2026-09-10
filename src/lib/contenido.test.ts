import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addDaysISO } from "@/lib/plataformas";
import {
  RANGOS_ESTADISTICAS,
  isRangoEstadisticas,
  calcularLimitesRango,
  pad2,
  getRachaSemanas,
  getEtiquetasPopulares,
  getTareasHoy,
  getPlantillaDelDia,
  getUltimasIdeas,
  getIdeasOlvidadas,
  getProgresoCadenciaSemanal,
  activarPlataformaConectada,
  desactivarPlataforma,
} from "@/lib/contenido";
import { makeSupabaseMock } from "@/lib/__tests__/supabaseMock";

describe("isRangoEstadisticas", () => {
  it("acepta cada rango válido", () => {
    for (const rango of RANGOS_ESTADISTICAS) {
      expect(isRangoEstadisticas(rango)).toBe(true);
    }
  });

  it("rechaza valores inválidos o ausentes", () => {
    expect(isRangoEstadisticas("invalido")).toBe(false);
    expect(isRangoEstadisticas("")).toBe(false);
    expect(isRangoEstadisticas(undefined)).toBe(false);
  });
});

describe("pad2", () => {
  it("rellena con un cero a la izquierda por debajo de 10", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(3)).toBe("03");
  });

  it("no toca números de dos cifras", () => {
    expect(pad2(12)).toBe("12");
  });
});

describe("calcularLimitesRango", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 8)); // 2026-09-08, martes
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("hoy: compara con exactamente el día anterior", () => {
    const limites = calcularLimitesRango("hoy");
    expect(limites.actualDesde).toBe("2026-09-08");
    expect(limites.actualHasta).toBe("2026-09-08");
    expect(limites.anteriorDesde).toBe("2026-09-07");
    expect(limites.anteriorHasta).toBe("2026-09-07");
  });

  it("siempre: no tiene periodo anterior", () => {
    const limites = calcularLimitesRango("siempre");
    expect(limites.actualDesde).toBe("2005-02-01");
    expect(limites.actualHasta).toBe("2026-09-08");
    expect(limites.anteriorDesde).toBeNull();
    expect(limites.anteriorHasta).toBeNull();
  });

  it.each(["semana", "mes", "anio"] as const)(
    "%s: la ventana anterior es contigua a la actual y de igual tamaño",
    (rango) => {
      const limites = calcularLimitesRango(rango);
      expect(limites.anteriorDesde).not.toBeNull();
      expect(limites.anteriorHasta).not.toBeNull();

      // El día anterior a "actualDesde" debe ser justo "anteriorHasta" — sin
      // solape ni hueco entre las dos ventanas.
      expect(addDaysISO(limites.actualDesde, -1)).toBe(limites.anteriorHasta);

      // Ambas ventanas cubren el mismo número de días.
      const diasEntre = (desde: string, hasta: string) => {
        const [dy, dm, dd] = desde.split("-").map(Number);
        const [hy, hm, hd] = hasta.split("-").map(Number);
        const d1 = Date.UTC(dy, dm - 1, dd);
        const d2 = Date.UTC(hy, hm - 1, hd);
        return Math.round((d2 - d1) / 86_400_000);
      };
      expect(diasEntre(limites.actualDesde, limites.actualHasta)).toBe(
        diasEntre(
          limites.anteriorDesde as string,
          limites.anteriorHasta as string,
        ),
      );

      // La ventana actual siempre termina hoy.
      expect(limites.actualHasta).toBe("2026-09-08");
    },
  );
});

describe("getProgresoCadenciaSemanal", () => {
  it("cuenta lo publicado en la semana por cada fila de cadencia", () => {
    const { client } = makeSupabaseMock({
      piezas_contenido: (calls) => {
        const plataforma = calls.find((c) => c.method === "eq")?.args[1];
        return { count: plataforma === "youtube" ? 2 : 0 };
      },
    });

    return getProgresoCadenciaSemanal(client, "2026-09-01", "2026-09-07", [
      { id: "1", plataforma: "youtube", cantidad: 3, nota: null },
      { id: "2", plataforma: "tiktok", cantidad: 1, nota: "recordatorio" },
    ]).then((progreso) => {
      expect(progreso).toEqual([
        { id: "1", plataforma: "youtube", cantidad: 3, hechas: 2, nota: null },
        {
          id: "2",
          plataforma: "tiktok",
          cantidad: 1,
          hechas: 0,
          nota: "recordatorio",
        },
      ]);
    });
  });
});

describe("getRachaSemanas", () => {
  it("devuelve 0 sin consultar la base de datos si no hay objetivo", async () => {
    const racha = await getRachaSemanas(
      {} as never,
      [{ id: "1", plataforma: "youtube", cantidad: 0, nota: null }],
      "2026-09-07",
    );
    expect(racha).toBe(0);
  });

  it("cuenta las semanas consecutivas hacia atrás hasta la primera que falla", async () => {
    // Objetivo: 2 piezas/semana en youtube. Semanas -1, -2 y -3 (respecto a
    // semanaActualInicio) cumplen; la -4 solo tiene una pieza.
    const fechas = [
      // Semana -1: 2026-08-31 a 2026-09-06
      "2026-09-01",
      "2026-09-02",
      // Semana -2: 2026-08-24 a 2026-08-30
      "2026-08-25",
      "2026-08-26",
      // Semana -3: 2026-08-17 a 2026-08-23
      "2026-08-18",
      "2026-08-19",
      // Semana -4: 2026-08-10 a 2026-08-16 — solo una, no llega a 2.
      "2026-08-11",
    ];

    const { client } = makeSupabaseMock({
      piezas_contenido: () => ({
        data: fechas.map((f) => ({ fecha_publicacion: f })),
      }),
    });

    const racha = await getRachaSemanas(
      client,
      [{ id: "1", plataforma: "youtube", cantidad: 2, nota: null }],
      "2026-09-07",
    );

    expect(racha).toBe(3);
  });
});

describe("getEtiquetasPopulares", () => {
  it("cuenta ocurrencias a través de listas separadas por comas y ordena de más a menos", async () => {
    const { client } = makeSupabaseMock({
      piezas_contenido: () => ({
        data: [
          { etiquetas: "seo, tiktok" },
          { etiquetas: "seo" },
          { etiquetas: "seo, youtube, tiktok" },
          { etiquetas: null },
          { etiquetas: "" },
        ],
      }),
    });

    const etiquetas = await getEtiquetasPopulares(client);
    expect(etiquetas).toEqual(["seo", "tiktok", "youtube"]);
  });

  it("respeta el límite pedido", async () => {
    const { client } = makeSupabaseMock({
      piezas_contenido: () => ({
        data: [{ etiquetas: "a, b, c, d" }],
      }),
    });

    const etiquetas = await getEtiquetasPopulares(client, 2);
    expect(etiquetas).toHaveLength(2);
  });
});

describe("getPlantillaDelDia / getUltimasIdeas / getIdeasOlvidadas", () => {
  it("getPlantillaDelDia devuelve las filas del día pedido", async () => {
    const { client, log } = makeSupabaseMock({
      plantilla_semanal: () => ({
        data: [{ id: "1", plataforma: "youtube", nota: "Publicar" }],
      }),
    });

    const entradas = await getPlantillaDelDia(client, 1);
    expect(entradas).toEqual([
      { id: "1", plataforma: "youtube", nota: "Publicar" },
    ]);
    expect(log[0].calls).toContainEqual({
      method: "eq",
      args: ["dia_semana", 1],
    });
  });

  it("getUltimasIdeas devuelve [] sin consultar si no hay plataformas activas", async () => {
    const ideas = await getUltimasIdeas({} as never, []);
    expect(ideas).toEqual([]);
  });

  it("getUltimasIdeas pasa por la respuesta de la consulta", async () => {
    const fila = {
      id: "1",
      titulo: "Idea",
      plataforma: "youtube" as const,
      created_at: "2026-01-01T00:00:00Z",
    };
    const { client } = makeSupabaseMock({
      piezas_contenido: () => ({ data: [fila] }),
    });

    const ideas = await getUltimasIdeas(client, ["youtube"]);
    expect(ideas).toEqual([fila]);
  });

  it("getIdeasOlvidadas devuelve [] sin consultar si no hay plataformas activas", async () => {
    const ideas = await getIdeasOlvidadas({} as never, []);
    expect(ideas).toEqual([]);
  });
});

describe("getTareasHoy", () => {
  it("devuelve [] sin consultar si no hay plataformas activas", async () => {
    const tareas = await getTareasHoy({} as never, [], "2026-09-08", 2);
    expect(tareas).toEqual([]);
  });

  it("oculta las entradas de plataformas ya cubiertas hoy y conserva las sin plataforma", async () => {
    const { client } = makeSupabaseMock({
      piezas_contenido: () => ({ data: [{ plataforma: "youtube" }] }),
      plantilla_semanal: () => ({
        data: [
          { id: "1", plataforma: "youtube", nota: "Publicar en youtube" },
          { id: "2", plataforma: "tiktok", nota: "Publicar en tiktok" },
          { id: "3", plataforma: null, nota: "Revisar plantilla" },
        ],
      }),
    });

    const tareas = await getTareasHoy(
      client,
      ["youtube", "tiktok"],
      "2026-09-08",
      2,
    );

    expect(tareas.map((t) => t.id)).toEqual(["2", "3"]);
    expect(tareas[0].href).toBe(
      "/contenido/tiktok/videos/nueva?fecha=2026-09-08",
    );
    expect(tareas[1].href).toBe("/configuracion/plantilla");
  });
});

describe("activarPlataformaConectada", () => {
  it("inserta y marca eraPrimera cuando no había ninguna plataforma activa", async () => {
    const { client, log } = makeSupabaseMock({
      plataformas_activas: () => ({ data: [] }),
    });

    const resultado = await activarPlataformaConectada(client, "youtube");

    expect(resultado).toEqual({ eraPrimera: true });
    const huboInsert = log.some((entrada) =>
      entrada.calls.some((c) => c.method === "insert"),
    );
    expect(huboInsert).toBe(true);
  });

  it("no inserta de nuevo si la plataforma ya estaba activa", async () => {
    const { client, log } = makeSupabaseMock({
      plataformas_activas: () => ({ data: [{ plataforma: "youtube" }] }),
    });

    const resultado = await activarPlataformaConectada(client, "youtube");

    expect(resultado).toEqual({ eraPrimera: false });
    const huboInsert = log.some((entrada) =>
      entrada.calls.some((c) => c.method === "insert"),
    );
    expect(huboInsert).toBe(false);
  });

  it("inserta una plataforma nueva aunque ya hubiera otra activa", async () => {
    const { client, log } = makeSupabaseMock({
      plataformas_activas: () => ({ data: [{ plataforma: "tiktok" }] }),
    });

    const resultado = await activarPlataformaConectada(client, "youtube");

    expect(resultado).toEqual({ eraPrimera: false });
    const huboInsert = log.some((entrada) =>
      entrada.calls.some((c) => c.method === "insert"),
    );
    expect(huboInsert).toBe(true);
  });
});

describe("desactivarPlataforma", () => {
  it("borra la fila de la plataforma indicada", async () => {
    const { client, log } = makeSupabaseMock({
      plataformas_activas: () => ({ data: null }),
    });

    await desactivarPlataforma(client, "tiktok");

    const entrada = log.find((e) => e.table === "plataformas_activas");
    expect(entrada?.calls).toContainEqual({ method: "delete", args: [] });
    expect(entrada?.calls).toContainEqual({
      method: "eq",
      args: ["plataforma", "tiktok"],
    });
  });
});
