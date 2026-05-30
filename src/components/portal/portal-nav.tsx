"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LayoutDashboard, MessageSquare, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Overview", href: "/portal", icon: LayoutDashboard },
  { name: "Violations", href: "/portal/violations", icon: ShieldAlert },
  { name: "Documents", href: "/portal/documents", icon: FileText },
  { name: "Requests", href: "/portal/requests", icon: MessageSquare }
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        Staff dashboard
      </Link>
    </nav>
  );
}
