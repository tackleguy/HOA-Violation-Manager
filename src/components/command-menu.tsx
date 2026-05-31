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
        className="focus-ring hidden h-8 w-52 items-center gap-2 rounded-md border border-border/80 bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
        aria-label="Open command menu"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-2xs text-muted-foreground">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
        aria-label="Open command menu"
      >
        <Search className="h-4 w-4" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-background/60 p-4 pt-24" onClick={() => setOpen(false)} role="presentation">
          <div
            className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-border/80 bg-background"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
          >
            <div className="flex items-center gap-2 border-b border-border/80 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
                placeholder="Go to…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search modules"
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-1">
              {filtered.length ? (
                filtered.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="focus-ring block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
