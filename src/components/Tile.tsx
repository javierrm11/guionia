import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Tile({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-bg-primary p-4 hover:bg-accent-bg active:bg-accent-bg"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-secondary">
        <Icon size={20} strokeWidth={1.5} className="text-accent" />
      </span>
      <span className="text-h3 text-center text-text-primary">{label}</span>
    </Link>
  );
}
