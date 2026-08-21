import { notFound, redirect } from "next/navigation";
import { isPlataforma } from "@/lib/plataformas";
import { pad2 } from "@/lib/contenido";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  const hoy = new Date();
  redirect(`/contenido/${plataforma}/videos/${hoy.getFullYear()}/${pad2(hoy.getMonth() + 1)}`);
}
