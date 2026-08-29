"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
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
            <span className="px-1 text-caption text-text-secondary">Email</span>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-disabled"
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
                style={{ "--input-bg": "var(--neutral-bg)" } as React.CSSProperties}
                className="w-full rounded-full border-0 py-3 pr-4 pl-10 text-body focus:ring-2 focus:ring-accent-bg focus:outline-none"
              />
            </div>
          </label>

          <button
            type="button"
            onClick={continuar}
            className="rounded-full bg-accent px-4 py-3 text-body text-white active:bg-accent-hover"
          >
            Continuar
          </button>
        </>
      ) : (
        <>
          <input type="hidden" name="email" value={email} />

          <div className="flex items-center justify-between gap-2 px-1">
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

          <PasswordInput name="password" autoFocus minLength={6} />
          <PasswordInput name="confirmar_password" label="Confirmar contraseña" minLength={6} />

          <SubmitButton
            pendingLabel="Creando cuenta…"
            className="rounded-full bg-accent px-4 py-3 text-body text-white active:bg-accent-hover disabled:opacity-60"
          >
            Crear cuenta
          </SubmitButton>
        </>
      )}
    </form>
  );
}
