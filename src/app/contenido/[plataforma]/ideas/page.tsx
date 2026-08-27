import { notFound, redirect } from "next/navigation";
import { isPlataforma } from "@/lib/plataformas";

export default async function IdeasPage({
  params,
}: {
  params: Promise<{ plataforma: string }>;
}) {
  const { plataforma } = await params;
  if (!isPlataforma(plataforma)) notFound();

  redirect(`/contenido/ideas?p=${plataforma}`);
}
