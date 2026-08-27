const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

function clientId() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!id) throw new Error("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  return id;
}

function clientSecret() {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("Falta GOOGLE_CLIENT_SECRET en .env.local");
  return secret;
}

export function construirUrlAutorizacion(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export async function intercambiarCodigo(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo intercambiar el código de Google (${res.status})`);
  }

  return res.json();
}

export async function renovarAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo renovar el token de YouTube (${res.status})`);
  }

  return res.json();
}

export type CanalYoutube = {
  id: string;
  titulo: string;
  thumbnailUrl: string | null;
};

export async function obtenerCanalPropio(accessToken: string): Promise<CanalYoutube> {
  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`No se pudo leer el canal de YouTube (${res.status})`);
  }

  const data = await res.json();
  const canal = data.items?.[0];
  if (!canal) throw new Error("La cuenta de Google no tiene ningún canal de YouTube");

  return {
    id: canal.id,
    titulo: canal.snippet.title,
    thumbnailUrl: canal.snippet.thumbnails?.default?.url ?? null,
  };
}

export type EstadisticasCanal = {
  suscriptores: number;
  vistasTotales: number;
  videos: number;
};

/** Totales acumulados del canal (no por rango de fechas) — suscriptores, vistas y vídeos de siempre. */
export async function obtenerEstadisticasCanal(accessToken: string): Promise<EstadisticasCanal> {
  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`No se pudieron leer las estadísticas del canal (${res.status})`);
  }

  const data = await res.json();
  const stats = data.items?.[0]?.statistics;
  if (!stats) throw new Error("La cuenta de Google no tiene ningún canal de YouTube");

  return {
    suscriptores: Number(stats.subscriberCount ?? 0),
    vistasTotales: Number(stats.viewCount ?? 0),
    videos: Number(stats.videoCount ?? 0),
  };
}

export type MetricasPeriodo = {
  vistas: number;
  comentarios: number;
  likes: number;
  suscriptoresGanados: number;
  suscriptoresPerdidos: number;
  minutosVistos: number;
};

/** Fecha ISO (YYYY-MM-DD) del primer día de un mes, `desplaze` meses respecto al actual (0 = este mes). */
function primerDiaDeMes(desplaze: number): string {
  const fecha = new Date();
  fecha.setDate(1);
  fecha.setMonth(fecha.getMonth() + desplaze);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Compara el mes en curso con el mes anterior: vistas, comentarios, likes,
 * suscriptores ganados/perdidos y minutos vistos. Una sola llamada a la
 * Analytics API con `dimensions=month` sobre el rango que cubre ambos meses.
 */
export async function obtenerComparativaMensual(
  accessToken: string
): Promise<{ actual: MetricasPeriodo; anterior: MetricasPeriodo | null }> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: primerDiaDeMes(-1),
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views,comments,likes,subscribersGained,subscribersLost,estimatedMinutesWatched",
    dimensions: "month",
  });

  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudo leer la comparativa mensual (${res.status})`);
  }

  const data = await res.json();
  const filas: [string, number, number, number, number, number, number][] = data.rows ?? [];

  const aMetricas = (
    fila?: [string, number, number, number, number, number, number]
  ): MetricasPeriodo => ({
    vistas: fila?.[1] ?? 0,
    comentarios: fila?.[2] ?? 0,
    likes: fila?.[3] ?? 0,
    suscriptoresGanados: fila?.[4] ?? 0,
    suscriptoresPerdidos: fila?.[5] ?? 0,
    minutosVistos: fila?.[6] ?? 0,
  });

  // Las filas vienen ordenadas por mes ascendente: la última es el mes en curso.
  const filaActual = filas[filas.length - 1];
  const filaAnterior = filas.length > 1 ? filas[filas.length - 2] : undefined;

  return {
    actual: aMetricas(filaActual),
    anterior: filaAnterior ? aMetricas(filaAnterior) : null,
  };
}

export type EstadisticasVideo = {
  vistas: number;
  likes: number;
  comentarios: number;
};

/** Extrae el ID de vídeo de una URL de YouTube (watch, youtu.be o shorts). */
export function extraerVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export type VideoCanal = {
  videoId: string;
  titulo: string;
  publicadoEn: string;
};

/** Lista los vídeos subidos al canal propio (los más recientes primero), hasta `limite`. */
export async function obtenerVideosDelCanal(
  accessToken: string,
  limite = 100
): Promise<VideoCanal[]> {
  const canalRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!canalRes.ok) {
    throw new Error(`No se pudo leer el canal de YouTube (${canalRes.status})`);
  }
  const canalData = await canalRes.json();
  const playlistSubidas = canalData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistSubidas) return [];

  const videos: VideoCanal[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId: playlistSubidas,
      maxResults: "50",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) {
      throw new Error(`No se pudo leer los vídeos del canal (${res.status})`);
    }
    const data = await res.json();

    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      videos.push({
        videoId,
        titulo: item.snippet.title,
        publicadoEn: item.snippet.publishedAt,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken && videos.length < limite);

  return videos.slice(0, limite);
}

export async function obtenerEstadisticasVideos(
  videoIds: string[],
  accessToken: string
): Promise<Record<string, EstadisticasVideo>> {
  if (videoIds.length === 0) return {};

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`No se pudieron leer las estadísticas de YouTube (${res.status})`);
  }

  const data = await res.json();
  const resultado: Record<string, EstadisticasVideo> = {};
  for (const item of data.items ?? []) {
    resultado[item.id] = {
      vistas: Number(item.statistics.viewCount ?? 0),
      likes: Number(item.statistics.likeCount ?? 0),
      comentarios: Number(item.statistics.commentCount ?? 0),
    };
  }
  return resultado;
}

export type VideoTendencia = {
  videoId: string;
  canalId: string;
  titulo: string;
  canal: string;
  miniatura: string | null;
  vistas: number;
  publicadoEn: string;
};

/** Vídeos en tendencia ahora mismo en YouTube (chart público `mostPopular`), para inspirarte en lo que funciona. */
export async function obtenerVideosTendencia(
  accessToken: string,
  regionCode = "ES",
  maxResults = 20
): Promise<VideoTendencia[]> {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode,
    maxResults: String(maxResults),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudieron leer los vídeos en tendencia (${res.status})`);
  }

  const data = await res.json();
  return (data.items ?? []).map(
    (item: {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        channelId: string;
        publishedAt: string;
        thumbnails?: Record<string, { url: string }>;
      };
      statistics?: { viewCount?: string };
    }) => ({
      videoId: item.id,
      canalId: item.snippet.channelId,
      titulo: item.snippet.title,
      canal: item.snippet.channelTitle,
      miniatura: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
      vistas: Number(item.statistics?.viewCount ?? 0),
      publicadoEn: item.snippet.publishedAt,
    })
  );
}

export type VideoDestacado = {
  videoId: string;
  titulo: string;
  miniatura: string | null;
  vistas: number;
  comentarios: number;
  retencionMedia: number;
  duracionMediaSegundos: number;
  impresiones: number | null;
  ctrImpresiones: number | null;
  motivo: string;
};

/**
 * Impresiones y CTR de miniatura de un vídeo concreto. Aparte del informe
 * principal de "Mejores vídeos" porque, con `dimensions=video`, el filtro
 * `video==` de la Analytics API solo admite un único id — no se puede pedir
 * para varios vídeos a la vez. Se pide sin `dimensions` (un total agregado
 * del vídeo) y en paralelo, uno por vídeo. Devuelve `null` si falla o no hay
 * datos (por ejemplo, si el vídeo es demasiado antiguo para tener impresiones
 * registradas) — nunca rompe el resto de "Mejores vídeos".
 */
async function obtenerImpresionesVideo(
  videoId: string,
  accessToken: string
): Promise<{ impresiones: number; ctr: number } | null> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: "2005-02-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "impressions,impressionsClickThroughRate",
    filters: `video==${videoId}`,
  });

  try {
    const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const fila: [number, number] | undefined = data.rows?.[0];
    if (!fila) return null;
    return { impresiones: fila[0], ctr: fila[1] };
  } catch {
    return null;
  }
}

/**
 * Explicación en una frase de por qué un vídeo destaca, comparando sus
 * métricas contra la media del propio canal (sin IA — solo reglas sobre los
 * números que ya tenemos). Elige la señal más marcada, y añade una segunda
 * si también está por encima de lo normal.
 */
function construirMotivo(
  video: { vistas: number; comentarios: number; retencionMedia: number },
  medias: { vistas: number; comentarios: number; retencionMedia: number }
): string {
  const ratioVistas = medias.vistas > 0 ? video.vistas / medias.vistas : 1;
  const ratioComentarios = medias.comentarios > 0 ? video.comentarios / medias.comentarios : 1;
  const ratioRetencion = medias.retencionMedia > 0 ? video.retencionMedia / medias.retencionMedia : 1;

  const senales = [
    {
      ratio: ratioRetencion,
      texto: `retiene mucho más que tu media (${Math.round(video.retencionMedia)}% vs. ${Math.round(medias.retencionMedia)}%)`,
    },
    {
      ratio: ratioComentarios,
      texto: `genera muchos más comentarios de lo habitual (x${ratioComentarios.toFixed(1)})`,
    },
    { ratio: ratioVistas, texto: `arrasa en vistas frente a tu media (x${ratioVistas.toFixed(1)})` },
  ]
    .filter((s) => s.ratio >= 1.15)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 2);

  if (senales.length === 0) {
    return "Por encima de tu media, sin un motivo que destaque claramente sobre el resto.";
  }

  const frase = senales.map((s) => s.texto).join(" y ");
  return frase.charAt(0).toUpperCase() + frase.slice(1) + ".";
}

/**
 * Los vídeos que mejor han funcionado del canal — vistas, comentarios y
 * retención media (`averageViewPercentage`) combinados en una puntuación,
 * no solo el más visto. Primero se piden por `views` (hasta `candidatos`,
 * un único informe con las tres métricas ya agregadas por vídeo) y se
 * reordenan localmente; luego se completan título y miniatura aparte, ya
 * que la Analytics API no las devuelve.
 */
export async function obtenerVideosDestacados(
  accessToken: string,
  limite = 5,
  candidatos = 25
): Promise<VideoDestacado[]> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: "2005-02-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views,comments,averageViewPercentage,averageViewDuration",
    dimensions: "video",
    sort: "-views",
    maxResults: String(candidatos),
  });

  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudieron leer los vídeos destacados (${res.status})`);
  }

  const data = await res.json();
  const filas: [string, number, number, number, number][] = data.rows ?? [];
  if (filas.length === 0) return [];

  const maxVistas = Math.max(...filas.map((f) => f[1]), 1);
  const maxComentarios = Math.max(...filas.map((f) => f[2]), 1);
  const medias = {
    vistas: filas.reduce((s, f) => s + f[1], 0) / filas.length,
    comentarios: filas.reduce((s, f) => s + f[2], 0) / filas.length,
    retencionMedia: filas.reduce((s, f) => s + f[3], 0) / filas.length,
  };

  const conPuntuacion = filas
    .map((f) => ({
      videoId: f[0],
      vistas: f[1],
      comentarios: f[2],
      retencionMedia: f[3],
      duracionMediaSegundos: f[4],
      puntuacion: (f[1] / maxVistas) * 0.4 + (f[2] / maxComentarios) * 0.3 + (f[3] / 100) * 0.3,
    }))
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, limite);

  const impresiones = await Promise.all(
    conPuntuacion.map((v) => obtenerImpresionesVideo(v.videoId, accessToken))
  );

  const idsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${conPuntuacion.map((v) => v.videoId).join(",")}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!idsRes.ok) {
    throw new Error(`No se pudieron leer los datos de los vídeos destacados (${idsRes.status})`);
  }
  const idsData = await idsRes.json();
  const snippetPorId = new Map<string, { titulo: string; miniatura: string | null }>(
    (idsData.items ?? []).map((item: { id: string; snippet: { title: string; thumbnails?: Record<string, { url: string }> } }) => [
      item.id,
      {
        titulo: item.snippet.title,
        miniatura: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
      },
    ])
  );

  return conPuntuacion.map((v, indice) => ({
    videoId: v.videoId,
    vistas: v.vistas,
    comentarios: v.comentarios,
    retencionMedia: v.retencionMedia,
    duracionMediaSegundos: v.duracionMediaSegundos,
    impresiones: impresiones[indice]?.impresiones ?? null,
    ctrImpresiones: impresiones[indice]?.ctr ?? null,
    titulo: snippetPorId.get(v.videoId)?.titulo ?? "(sin título)",
    miniatura: snippetPorId.get(v.videoId)?.miniatura ?? null,
    motivo: construirMotivo(v, medias),
  }));
}

const FUENTE_TRAFICO_LABEL: Record<string, string> = {
  YT_SEARCH: "Búsqueda de YouTube",
  SUGGESTED_VIDEO: "Vídeos sugeridos",
  RELATED_VIDEO: "Vídeos relacionados",
  BROWSE: "Explorar/Inicio",
  SHORTS: "Feed de Shorts",
  PLAYLIST: "Listas de reproducción",
  EXTERNAL: "Enlaces externos",
  EXT_URL: "Enlaces externos",
  NOTIFICATION: "Notificaciones",
  SUBSCRIBER: "Página de suscripciones",
  CHANNEL: "Página del canal",
  YT_CHANNEL: "Página del canal",
  NO_LINK_OTHER: "Directo / otros",
  NO_LINK_EMBEDDED: "Vídeos incrustados",
  END_SCREEN: "Pantallas finales",
  ANNOTATION: "Anotaciones",
  HASHTAGS: "Hashtags",
  SOUND_PAGE: "Página de audio",
};

export type FuenteTrafico = {
  fuente: string;
  etiqueta: string;
  vistas: number;
  porcentaje: number;
};

/**
 * De dónde vienen las vistas del último mes (búsqueda, sugeridos, externo...)
 * — para saber si te está moviendo el algoritmo o dependes de otra cosa.
 */
export async function obtenerFuentesTrafico(
  accessToken: string,
  limite = 6
): Promise<FuenteTrafico[]> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: primerDiaDeMes(-1),
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "views",
    dimensions: "insightTrafficSourceType",
    sort: "-views",
    maxResults: String(limite),
  });

  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudieron leer las fuentes de tráfico (${res.status})`);
  }

  const data = await res.json();
  const filas: [string, number][] = data.rows ?? [];
  const totalVistas = filas.reduce((s, f) => s + f[1], 0);
  if (totalVistas === 0) return [];

  return filas.map(([fuente, vistas]) => ({
    fuente,
    etiqueta: FUENTE_TRAFICO_LABEL[fuente] ?? fuente,
    vistas,
    porcentaje: Math.round((vistas / totalVistas) * 100),
  }));
}

export type PuntoRetencion = {
  /** Posición en el vídeo, de 0 (inicio) a 1 (final). */
  elapsedRatio: number;
  /** Proporción de audiencia viendo ese instante (puede superar 1 por repeticiones). */
  audienceWatchRatio: number;
};

/** Curva de retención de audiencia de un vídeo (YouTube Analytics API). [] si no hay datos suficientes. */
export async function obtenerRetencionVideo(
  videoId: string,
  accessToken: string
): Promise<PuntoRetencion[]> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: "2005-02-01",
    endDate: new Date().toISOString().slice(0, 10),
    metrics: "audienceWatchRatio",
    dimensions: "elapsedVideoTimeRatio",
    filters: `video==${videoId}`,
  });

  const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudo leer la retención de YouTube (${res.status})`);
  }

  const data = await res.json();
  const puntos: PuntoRetencion[] = (data.rows ?? []).map((fila: [number, number]) => ({
    elapsedRatio: fila[0],
    audienceWatchRatio: fila[1],
  }));

  return puntos.sort((a, b) => a.elapsedRatio - b.elapsedRatio);
}
