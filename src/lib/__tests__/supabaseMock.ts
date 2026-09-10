import type { SupabaseClient } from "@supabase/supabase-js";

export type ChainCall = { method: string; args: unknown[] };
export type TableLog = { table: string; calls: ChainCall[] };

const CHAIN_METHODS = [
  "select",
  "eq",
  "in",
  "not",
  "gte",
  "lte",
  "lt",
  "order",
  "limit",
  "insert",
  "update",
  "delete",
] as const;

/**
 * Fake `SupabaseClient` para probar funciones de `lib/` sin una base de
 * datos real — cada tabla tiene un `handler(calls)` que recibe la cadena de
 * llamadas (`.eq()`, `.in()`, ...) hechas sobre ese `.from()` y devuelve
 * `{ data }`/`{ count }`. `log` acumula todas las invocaciones de `.from()`
 * (una entrada por cada llamada, no por tabla) para poder comprobar en el
 * test qué se llegó a consultar/insertar/borrar.
 */
export function makeSupabaseMock(
  handlers: Record<string, (calls: ChainCall[]) => unknown>,
) {
  const log: TableLog[] = [];

  const client = {
    from(table: string) {
      const calls: ChainCall[] = [];
      log.push({ table, calls });

      const builder: Record<string, unknown> = {};
      for (const metodo of CHAIN_METHODS) {
        builder[metodo] = (...args: unknown[]) => {
          calls.push({ method: metodo, args });
          return builder;
        };
      }
      builder.maybeSingle = () =>
        Promise.resolve(handlers[table]?.(calls) ?? { data: null });
      builder.then = (
        resolve: (value: unknown) => unknown,
        reject: (reason: unknown) => unknown,
      ) =>
        Promise.resolve(handlers[table]?.(calls) ?? { data: null }).then(
          resolve,
          reject,
        );
      return builder;
    },
  };

  return { client: client as unknown as SupabaseClient, log };
}
