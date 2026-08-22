import { CalendarClock, Clapperboard, Lightbulb, LogOut, MessageSquare, Video } from "lucide-react";
import { Tile } from "@/components/Tile";
import { logoutAction } from "../login/actions";

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-3xl lg:p-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Tile href="/configuracion/plataformas" label="Plataformas" icon={Video} />
        <Tile
          href="/configuracion/control-semanal"
          label="Control semanal"
          icon={CalendarClock}
        />
        <Tile
          href="/configuracion/estructuras"
          label="Estructuras de guion"
          icon={Clapperboard}
        />
        <Tile href="/configuracion/hooks" label="Banco de hooks" icon={Lightbulb} />
        <Tile href="/configuracion/ctas" label="Banco de CTAs" icon={MessageSquare} />

        <form action={logoutAction} className="contents">
          <button
            type="submit"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-bg-primary p-4 hover:bg-accent-bg active:bg-accent-bg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
              <LogOut size={20} strokeWidth={1.5} className="text-accent" />
            </span>
            <span className="text-h3 text-center text-text-primary">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </div>
  );
}
