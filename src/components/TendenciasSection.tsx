import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { obtenerAccessTokenValido } from "@/lib/youtube/conexion";
import { buscarVideosPorTema, obtenerCanalPropio, obtenerVideosTendencia } from "@/lib/youtube/oauth";

const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "que", "en", "con", "por",
  "para", "es", "se", "tu", "su", "mi", "tus", "mis", "como", "más", "menos", "esto", "eso", "al",
  "del", "lo", "le", "les", "sin", "sobre", "entre", "hay", "ya", "muy", "pero", "si", "no", "yo",
  "nos", "este", "esta", "estos", "estas", "son", "fue", "ser", "hacer", "hace", "tan", "así",
  "cada", "otro", "otra", "todo", "toda", "todos", "todas", "qué", "cómo", "cuál", "cuáles",
  "dónde", "cuándo", "porqué", "porque",
]);

/** Palabras más repetidas en tus últimos títulos, para buscar contenido de tu mismo tema. */
function extraerPalabrasClave(titulos: string[], maximo = 5): string {
  const conteo = new Map<string, number>();
  for (const titulo of titulos) {
    const palabras = titulo
      .toLowerCase()
      .replace(/[¿?¡!.,:;"'()]/g, "")
      .split(/\s+/)
      .filter((p) => p.length > 2 && !STOPWORDS.has(p));
    for (const p of palabras) conteo.set(p, (conteo.get(p) ?? 0) + 1);
  }

  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maximo)
    .map(([p]) => p)
    .join(" ");
}

export async function TendenciasSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const accessToken = await obtenerAccessTokenValido(supabase, user.id);

  if (!accessToken) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">
          Conecta YouTube para ver vídeos parecidos a los tuyos.
        </p>
        <a
          href="/api/youtube/conectar"
          className="rounded-sm bg-accent px-4 py-2 text-body text-white active:bg-accent-hover"
        >
          Conectar YouTube
        </a>
      </div>
    );
  }

  const { data: piezas } = await supabase
    .from("piezas_contenido")
    .select("titulo")
    .eq("estado", "publicado")
    .order("fecha_publicacion", { ascending: false })
    .limit(15);

  const query = extraerPalabrasClave((piezas ?? []).map((p) => p.titulo as string));

  let videos: Awaited<ReturnType<typeof obtenerVideosTendencia>> = [];
  let error = false;
  try {
    videos = query ? await buscarVideosPorTema(accessToken, query) : await obtenerVideosTendencia(accessToken);
  } catch {
    error = true;
  }

  if (!error) {
    try {
      const canalPropio = await obtenerCanalPropio(accessToken);
      videos = videos.filter((v) => v.canalId !== canalPropio.id);
    } catch {
      // Sin canal propio identificable: seguimos mostrando los resultados tal cual.
    }
  }

  if (error) {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-danger">
          No se pudieron cargar los vídeos ahora mismo. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-md bg-bg-primary p-4">
        <p className="text-small text-text-secondary">No hay vídeos disponibles ahora mismo.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {query && (
        <p className="text-caption text-text-disabled">Basado en tus últimos títulos: {query}</p>
      )}

      {videos.map((v) => (
        <a
          key={v.videoId}
          href={`https://www.youtube.com/watch?v=${v.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 rounded-md bg-bg-primary p-3 hover:bg-accent-bg active:bg-accent-bg"
        >
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-sm bg-neutral-bg">
            {v.miniatura && (
              <Image src={v.miniatura} alt="" fill sizes="128px" className="object-cover" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="line-clamp-2 text-body text-text-primary">{v.titulo}</p>
            <p className="text-small text-text-secondary">{v.canal}</p>
            <p className="text-caption text-text-disabled">
              {v.vistas.toLocaleString("es-ES")} vistas
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
