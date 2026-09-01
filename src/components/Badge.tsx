import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "neutral" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-badge-success text-white",
  warning: "bg-badge-warning text-badge-warning-text",
  neutral: "bg-badge-neutral text-white",
  danger: "bg-badge-danger text-white",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`text-caption animate-escala-entrada inline-flex items-center rounded-full px-2 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
