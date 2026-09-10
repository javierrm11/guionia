import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Gift, Users } from "lucide-react";
import { CopiarEnlaceReferido } from "@/components/CopiarEnlaceReferido";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReferidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const origin = (await headers()).get("origin");
  const enlace = `${origin}/registro?ref=${user.id}`;

  const { count } = await supabase
    .from("referidos")
    .select("id", { count: "exact", head: true });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:p-8">
      <div className="flex flex-col items-center gap-3 rounded-md bg-accent-bg p-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-bg">
          <Gift size={20} strokeWidth={1.5} className="text-accent" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">Invita a otros creadores</h1>
          <p className="text-small text-text-secondary">
            Comparte tu enlace — cuando alguien se registre con él, aparecerá
            contado aquí.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-bg-primary p-4 shadow-sm">
        <span className="text-h3 text-text-secondary">Tu enlace</span>
        <CopiarEnlaceReferido enlace={enlace} />
      </div>

      <div className="flex items-center gap-3 rounded-md bg-bg-primary p-4 shadow-sm">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent-bg">
          <Users size={18} strokeWidth={1.5} className="text-accent" />
        </span>
        <div className="flex flex-col">
          <span className="text-h2">{count ?? 0}</span>
          <span className="text-caption text-text-secondary">
            {count === 1 ? "persona invitada" : "personas invitadas"}
          </span>
        </div>
      </div>
    </div>
  );
}
