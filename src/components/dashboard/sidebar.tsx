"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, navigationGroups } from "@/lib/constants";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navByName = new Map(navigation.map((item) => [item.name, item]));

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="space-y-5" aria-label="Main navigation">
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-2.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((name) => {
              const item = navByName.get(name);
              if (!item) return null;
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn("nav-item", active && "nav-item-active")}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} aria-hidden />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="focus-ring group flex items-center gap-2.5 rounded-md px-1 py-1">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground transition-transform group-hover:scale-[1.02]">
        HF
      </span>
      <span className="text-sm font-semibold tracking-tight">HOAFlow</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen border-r bg-card/50 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b px-4 py-4">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
      </div>
    </aside>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <BrandMark />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>
    </div>
  );
}
