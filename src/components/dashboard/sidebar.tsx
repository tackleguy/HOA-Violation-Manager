"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  orgName?: string;
  roleLabel?: string;
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="space-y-0.5" aria-label="Main navigation">
      {navigation.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("nav-item", active && "nav-item-active")}
          >
            <item.icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="focus-ring text-sm font-medium tracking-tight text-foreground">
      HOAFlow
    </Link>
  );
}

export function Sidebar({ orgName, roleLabel }: SidebarProps) {
  return (
    <aside className="hidden min-h-screen border-r border-border/80 bg-background lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-3 py-5">
        <div className="mb-8 px-2">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          <NavLinks />
        </div>
        {orgName ? (
          <div className="mt-8 border-t border-border/80 px-2 pt-4">
            <p className="truncate text-sm font-medium text-foreground">{orgName}</p>
            {roleLabel ? <p className="truncate text-xs text-muted-foreground">{roleLabel}</p> : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export function SidebarNav({ onNavigate, orgName, roleLabel }: SidebarProps & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col px-3 py-5">
      <div className="mb-8 px-2">
        <BrandMark />
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        <NavLinks onNavigate={onNavigate} />
      </div>
      {orgName ? (
        <div className="mt-8 border-t border-border/80 px-2 pt-4">
          <p className="truncate text-sm font-medium text-foreground">{orgName}</p>
          {roleLabel ? <p className="truncate text-xs text-muted-foreground">{roleLabel}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
