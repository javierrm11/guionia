import type { MetadataRoute } from "next";
import { ARTICULOS } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...ARTICULOS.map((articulo) => ({
      url: `${BASE_URL}/blog/${articulo.slug}`,
      lastModified: articulo.fechaPublicacion,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${BASE_URL}/comparativas/notion`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
