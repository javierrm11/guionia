import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function Tile({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-border p-4 transition-transform duration-100 hover:opacity-70 active:scale-95 lg:min-h-28 lg:gap-3 lg:p-5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent lg:h-12 lg:w-12">
        <Icon size={20} strokeWidth={1.5} className="text-white lg:h-[22px] lg:w-[22px]" />
      </span>
      <span className="text-h3 text-center text-text-primary">{label}</span>
    </Link>
  );
}
