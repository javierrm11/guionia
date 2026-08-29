import { createHash, randomBytes } from "crypto";

const SCOPES = ["user.info.basic", "user.info.stats", "video.list", "video.publish"].join(",");

function clientKey() {
  const key = process.env.TIKTOK_CLIENT_KEY;
  if (!key) throw new Error("Falta TIKTOK_CLIENT_KEY");
  return key;
}

function clientSecret() {
  const secret = process.env.TIKTOK_CLIENT_SECRET;
  if (!secret) throw new Error("Falta TIKTOK_CLIENT_SECRET en .env.local");
  return secret;
}

/** TikTok exige PKCE en el flujo de autorización — genera el par verifier/challenge. */
export function generarPkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString("hex");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function construirUrlAutorizacion(
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_key: clientKey(),
    response_type: "code",
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function intercambiarCodigo(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: clientKey(),
      client_secret: clientSecret(),
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`No se pudo intercambiar el código de TikTok: ${data.error_description ?? res.status}`);
  }
  return data;
}

/** TikTok rota el refresh_token en cada renovación — el nuevo hay que guardarlo también. */
export async function renovarAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo renovar el token de TikTok (${res.status})`);
  }

  return res.json();
}

export type CuentaTiktok = {
  openId: string;
  displayName: string;
  avatarUrl: string | null;
};

/**
 * Solo `user.info.basic` — es la que usa el flujo de conexión (`/api/tiktok/callback`).
 * Deliberadamente no pide campos de `user.info.stats`: si ese scope aún no está
 * aprobado/activo en el portal de TikTok, no debe tirar abajo la conexión entera.
 */
export async function obtenerCuentaPropia(accessToken: string): Promise<CuentaTiktok> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`No se pudo leer la cuenta de TikTok (${res.status})`);
  }

  const data = await res.json();
  const user = data.data?.user;
  if (!user) throw new Error("No se pudo leer la información de la cuenta de TikTok");

  return {
    openId: user.open_id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url ?? null,
  };
}

export type EstadisticasCuentaTiktok = {
  seguidores: number;
  siguiendo: number;
  likesTotales: number;
  videos: number;
};

/** Requiere el scope `user.info.stats` — se pide aparte de `obtenerCuentaPropia` a propósito. */
export async function obtenerEstadisticasCuentaTiktok(
  accessToken: string
): Promise<EstadisticasCuentaTiktok> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`No se pudieron leer las estadísticas de la cuenta de TikTok (${res.status})`);
  }

  const data = await res.json();
  const user = data.data?.user;
  if (!user) throw new Error("No se pudo leer la información de la cuenta de TikTok");

  return {
    seguidores: Number(user.follower_count ?? 0),
    siguiendo: Number(user.following_count ?? 0),
    likesTotales: Number(user.likes_count ?? 0),
    videos: Number(user.video_count ?? 0),
  };
}

/** Extrae el ID de vídeo de una URL de TikTok (formato www.tiktok.com/@usuario/video/ID). */
export function extraerVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("tiktok.com")) return null;
    const match = u.pathname.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export type VideoTiktok = {
  videoId: string;
  titulo: string;
  publicadoEn: string;
  shareUrl: string;
};

const CAMPOS_VIDEO_LISTA = "id,title,create_time,share_url";

/** Lista los vídeos publicados en la cuenta propia (los más recientes primero), hasta `limite`. */
export async function obtenerVideosDelUsuario(
  accessToken: string,
  limite = 100
): Promise<VideoTiktok[]> {
  const videos: VideoTiktok[] = [];
  let cursor: number | undefined;
  let hayMas = true;

  while (hayMas && videos.length < limite) {
    const res = await fetch(`https://open.tiktokapis.com/v2/video/list/?fields=${CAMPOS_VIDEO_LISTA}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    });

    if (!res.ok) {
      throw new Error(`No se pudo leer los vídeos de TikTok (${res.status})`);
    }

    const data = await res.json();
    for (const v of data.data?.videos ?? []) {
      videos.push({
        videoId: v.id,
        titulo: v.title ?? "",
        publicadoEn: new Date(v.create_time * 1000).toISOString(),
        shareUrl: v.share_url ?? "",
      });
    }

    hayMas = Boolean(data.data?.has_more);
    cursor = data.data?.cursor;
  }

  return videos.slice(0, limite);
}

export type EstadisticasVideoTiktok = {
  vistas: number;
  likes: number;
  comentarios: number;
  compartidos: number;
  miniatura: string | null;
};

export async function obtenerEstadisticasVideos(
  videoIds: string[],
  accessToken: string
): Promise<Record<string, EstadisticasVideoTiktok>> {
  if (videoIds.length === 0) return {};

  const res = await fetch(
    "https://open.tiktokapis.com/v2/video/query/?fields=id,view_count,like_count,comment_count,share_count,cover_image_url",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    }
  );

  if (!res.ok) {
    throw new Error(`No se pudieron leer las estadísticas de TikTok (${res.status})`);
  }

  const data = await res.json();
  const resultado: Record<string, EstadisticasVideoTiktok> = {};
  for (const v of data.data?.videos ?? []) {
    resultado[v.id] = {
      vistas: Number(v.view_count ?? 0),
      likes: Number(v.like_count ?? 0),
      comentarios: Number(v.comment_count ?? 0),
      compartidos: Number(v.share_count ?? 0),
      miniatura: v.cover_image_url ?? null,
    };
  }
  return resultado;
}

export type MetadatosSubidaTiktok = {
  /** `post_info.title` — el mismo campo que ya usa la app como "Descripción (con hashtags)". */
  titulo: string;
  videoSize: number;
  chunkSize: number;
  totalChunkCount: number;
};

/**
 * Abre una sesión de subida por trozos (Content Posting API, Direct Post).
 * Publicado siempre como `SELF_ONLY` — mientras esta app no pase la
 * auditoría de contenido de TikTok, no hay forma de publicar en público.
 */
export async function iniciarSubidaVideo(
  accessToken: string,
  metadata: MetadatosSubidaTiktok
): Promise<{ publishId: string; uploadUrl: string }> {
  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: metadata.titulo,
        privacy_level: "SELF_ONLY",
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: metadata.videoSize,
        chunk_size: metadata.chunkSize,
        total_chunk_count: metadata.totalChunkCount,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error?.code !== "ok") {
    throw new Error(`No se pudo iniciar la subida a TikTok (${data.error?.message ?? res.status})`);
  }

  return { publishId: data.data.publish_id, uploadUrl: data.data.upload_url };
}

export type EstadoPublicacionTiktok = {
  status:
    | "PROCESSING_UPLOAD"
    | "PROCESSING_DOWNLOAD"
    | "SEND_TO_USER_INBOX"
    | "PUBLISH_COMPLETE"
    | "FAILED";
  failReason: string | null;
};

/** La publicación en TikTok es asíncrona — hay que consultar este estado
 *  (polling) hasta que llegue a `PUBLISH_COMPLETE` o `FAILED`. */
export async function consultarEstadoPublicacion(
  accessToken: string,
  publishId: string
): Promise<EstadoPublicacionTiktok> {
  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ publish_id: publishId }),
  });

  const data = await res.json();
  if (!res.ok || data.error?.code !== "ok") {
    throw new Error(
      `No se pudo consultar el estado de la publicación (${data.error?.message ?? res.status})`
    );
  }

  return {
    status: data.data.status,
    failReason: data.data.fail_reason ?? null,
  };
}
