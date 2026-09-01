import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: "linear-gradient(135deg, #6C5CE0, #2F6FED)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <div style={{ fontSize: 36, fontWeight: 700 }}>Guionia</div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 48, maxWidth: 900 }}>
          Deja de perder ideas de vídeo entre notas sueltas
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 28, opacity: 0.9 }}>
          Ideas, guiones y calendario para YouTube y TikTok, en un solo sitio.
        </div>
      </div>
    ),
    { ...size }
  );
}
