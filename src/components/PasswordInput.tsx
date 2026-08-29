"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordInput({
  name,
  label = "Contraseña",
  autoFocus,
  minLength,
}: {
  name: string;
  label?: string;
  autoFocus?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-caption text-text-secondary">{label}</span>
      <div className="relative">
        <Lock
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-disabled"
        />
        <input
          type={visible ? "text" : "password"}
          name={name}
          required
          autoFocus={autoFocus}
          minLength={minLength}
          style={{ "--input-bg": "var(--neutral-bg)" } as React.CSSProperties}
          className="w-full rounded-full border-0 py-3 pr-11 pl-10 text-body focus:ring-2 focus:ring-accent-bg focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-text-disabled"
        >
          {visible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </label>
  );
}
