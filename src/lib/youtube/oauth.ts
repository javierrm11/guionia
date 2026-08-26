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

/**
 * Busca vídeos por tema (palabras clave), ordenados por vistas — para
 * encontrar contenido similar al tuyo en vez de la tendencia general.
 * `search.list` no devuelve estadísticas, así que se completan con una
 * segunda llamada a `obtenerEstadisticasVideos`.
 */
export async function buscarVideosPorTema(
  accessToken: string,
  query: string,
  regionCode = "ES",
  maxResults = 20
): Promise<VideoTendencia[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    order: "viewCount",
    regionCode,
    maxResults: String(maxResults),
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`No se pudo buscar vídeos por tema (${res.status})`);
  }

  const data = await res.json();
  const items = (data.items ?? [])
    .filter((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          channelId: string;
          publishedAt: string;
          thumbnails?: Record<string, { url: string }>;
        };
      }) => ({
        videoId: item.id.videoId,
        canalId: item.snippet.channelId,
        titulo: item.snippet.title,
        canal: item.snippet.channelTitle,
        miniatura: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? null,
        publicadoEn: item.snippet.publishedAt,
      })
    );

  if (items.length === 0) return [];

  const stats = await obtenerEstadisticasVideos(
    items.map((i: { videoId: string }) => i.videoId),
    accessToken
  );

  return items.map((i: Omit<VideoTendencia, "vistas">) => ({
    ...i,
    vistas: stats[i.videoId]?.vistas ?? 0,
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
