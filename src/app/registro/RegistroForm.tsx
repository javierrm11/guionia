"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { registroAction } from "./actions";

export function RegistroForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [step, setStep] = useState<"email" | "password">(initialEmail ? "password" : "email");
  const [email, setEmail] = useState(initialEmail);

  function continuar() {
    if (email.trim()) setStep("password");
  }

  return (
    <form action={registroAction} className="flex flex-col gap-3">
      {step === "email" ? (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Email<span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                type="email"
                name="email"
                required
                autoFocus
                placeholder="tú@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    continuar();
                  }
                }}
                className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          <button
            type="button"
            onClick={continuar}
            className="rounded-sm bg-accent px-4 py-3 text-body text-white active:bg-accent-hover"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <input type="hidden" name="email" value={email} />

          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-body text-text-secondary">
              <Mail size={16} strokeWidth={1.5} className="text-text-disabled" />
              {email}
            </span>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="p-2 -m-2 text-small text-accent"
            >
              Cambiar
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Contraseña<span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                type="password"
                name="password"
                required
                autoFocus
                minLength={6}
                className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-h3 text-text-secondary">
              Confirmar contraseña<span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-disabled"
              />
              <input
                type="password"
                name="confirmar_password"
                required
                minLength={6}
                className="w-full rounded-sm border border-border bg-bg-primary py-2 pr-3 pl-9 text-body focus:border-accent focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          <SubmitButton
            pendingLabel="Creando cuenta…"
            className="rounded-sm bg-accent px-4 py-3 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            Crear cuenta
          </SubmitButton>
        </>
      )}
    </form>
  );
}
