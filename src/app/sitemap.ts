import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/legal/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terminos`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
