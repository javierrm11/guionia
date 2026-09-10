import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Clapperboard,
  Gift,
  Lightbulb,
  LogOut,
  MessageSquare,
  Trash2,
  Video,
} from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Tile } from "@/components/Tile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";
import { eliminarCuenta } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: conexionYoutube },
    { data: conexionTiktok },
    { count: cadenciaFijaCount },
    { count: plantillaCount },
    { count: escenasCount },
    { count: frasesCount },
  ] = await Promise.all([
    user
      ? supabase
          .from("youtube_conexiones")
          .select("canal_titulo, canal_thumbnail_url")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("tiktok_conexiones")
          .select("display_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("cadencia_contenido")
      .select("*", { count: "exact", head: true })
      .eq("periodo", "mes"),
    supabase
      .from("plantilla_semanal")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("escenas_guion")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null),
    supabase
      .from("frases_guardadas")
      .select("*", { count: "exact", head: true })
      .not("deleted_at", "is", null),
  ]);

  const nombreCuenta =
    conexionYoutube?.canal_titulo ?? conexionTiktok?.display_name ?? null;
  const avatarCuenta =
    conexionYoutube?.canal_thumbnail_url ?? conexionTiktok?.avatar_url ?? null;
  const papeleraCount = (escenasCount ?? 0) + (frasesCount ?? 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      {nombreCuenta && (
        <Link
          href="/contenido/cuenta"
          className="flex items-center gap-3 rounded-md bg-bg-primary p-3 shadow-sm hover:opacity-70"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
            {avatarCuenta ? (
              <Image
                src={avatarCuenta}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <span className="text-caption text-white">
                {nombreCuenta[0]?.toUpperCase()}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-body text-text-primary">
            {nombreCuenta}
          </span>
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-text-disabled"
          />
        </Link>
      )}

      <div className="flex flex-col gap-3">
        <h2
          className="px-1 text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Contenido
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
          <Tile
            href="/configuracion/plataformas"
            label="Plataformas"
            icon={Video}
            tono="ai"
          />
          <Tile
            href="/configuracion/cadencia"
            label="Cadencia fija"
            icon={CalendarClock}
            badge={cadenciaFijaCount ?? 0}
            tono="accent"
          />
          <Tile
            href="/configuracion/plantilla"
            label="Plantilla semanal"
            icon={CalendarDays}
            badge={plantillaCount ?? 0}
            tono="success"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="px-1 text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Guion
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
          <Tile
            href="/configuracion/estructuras"
            label="Estructuras de guion"
            icon={Clapperboard}
            tono="accent"
          />
          <Tile
            href="/configuracion/hooks"
            label="Banco de hooks"
            icon={Lightbulb}
            tono="ai"
          />
          <Tile
            href="/configuracion/ctas"
            label="Banco de CTAs"
            icon={MessageSquare}
            tono="success"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="px-1 text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Cuenta
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
          <Link
            href="/configuracion/referidos"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-accent-bg p-4 transition-transform duration-100 hover:opacity-70 active:scale-95 lg:min-h-28 lg:gap-3 lg:p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent lg:h-12 lg:w-12">
              <Gift
                size={20}
                strokeWidth={1.5}
                className="text-white lg:h-[22px] lg:w-[22px]"
              />
            </span>
            <span className="text-h3 text-center text-text-primary">
              Invitar y referidos
            </span>
          </Link>
          <Tile
            href="/configuracion/papelera"
            label="Papelera"
            icon={Trash2}
            badge={papeleraCount}
            fondo
          />

          <form action={logoutAction} className="contents">
            <ConfirmButton
              message="¿Seguro que quieres cerrar sesión?"
              confirmLabel="Cerrar sesión"
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-bg-primary p-4 shadow-sm transition-transform duration-100 hover:opacity-70 active:scale-95 lg:min-h-28 lg:gap-3 lg:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-badge-danger lg:h-12 lg:w-12">
                <LogOut
                  size={20}
                  strokeWidth={1.5}
                  className="text-white lg:h-[22px] lg:w-[22px]"
                />
              </span>
              <span className="text-h3 text-center text-text-primary">
                Cerrar sesión
              </span>
            </ConfirmButton>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="px-1 text-caption font-display text-text-secondary uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Preferencias
        </h2>
        <ThemeToggle />
      </div>

      <div className="flex flex-col gap-3">
        <h2
          className="px-1 text-caption font-display text-danger uppercase"
          style={{ letterSpacing: "0.06em" }}
        >
          Zona de peligro
        </h2>
        <form action={eliminarCuenta}>
          <ConfirmButton
            message="Esto borra tu cuenta y todo tu contenido (ideas, guiones, cadencia, conexiones de YouTube/TikTok...) para siempre. No hay papelera para esto — no se puede deshacer."
            confirmLabel="Eliminar cuenta"
            pendingLabel="Eliminando…"
            className="flex w-full items-center justify-between rounded-md bg-danger-bg p-4 text-left lg:p-5"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-body text-danger lg:text-h3">
                Eliminar cuenta
              </span>
              <span className="text-caption text-text-secondary lg:text-small">
                Borra tu cuenta y todo tu contenido para siempre.
              </span>
            </div>
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
