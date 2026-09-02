import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/legal"],
      // El resto vive detrás de login (redirige a /login si no hay sesión) o
      // es una página transaccional de bajo contenido — sin valor de SEO,
      // y solo diluirían la relevancia de la landing en los resultados.
      disallow: [
        "/contenido",
        "/configuracion",
        "/api",
        "/auth",
        "/login",
        "/registro",
        "/olvide-password",
        "/restablecer-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
