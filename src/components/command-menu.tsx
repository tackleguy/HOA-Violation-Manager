"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { navigation } from "@/lib/constants";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return navigation;
    return navigation.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring hidden h-8 w-56 items-center gap-2 rounded-md border border-border/80 bg-background px-3 text-sm text-muted-foreground shadow-subtle transition-colors hover:bg-muted/50 md:flex"
        aria-label="Open command menu"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">⌘K</kbd>
      </button>
      <ButtonIconMobile onClick={() => setOpen(true)} />
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-4 pt-[min(20vh,8rem)] backdrop-blur-sm animate-in"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-soft animate-in"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
                placeholder="Jump to a module…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search modules"
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground sm:inline">Esc</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length ? (
                filtered.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/70"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {item.name}
                  </Link>
                ))
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No modules match your search.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ButtonIconMobile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground shadow-subtle transition-colors hover:bg-muted/50 md:hidden"
      aria-label="Open command menu"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}
