import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Tile({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border p-4 hover:opacity-70"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
        <Icon size={20} strokeWidth={1.5} className="text-white" />
      </span>
      <span className="text-h3 text-center text-text-primary">{label}</span>
    </Link>
  );
}
