"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmButton({
  children,
  message,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  message: string;
  pendingLabel?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
