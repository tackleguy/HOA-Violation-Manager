"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { navigation } from "@/lib/constants";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus();
      return;
    }
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return navigation;
    return navigation.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring hidden min-h-11 w-52 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
        aria-label="Open command menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="flex-1 text-left">Search</span>
        <kbd className="text-xs text-muted-foreground" aria-hidden>
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
        aria-label="Open command menu"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-background/80 p-4 pt-24"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-border bg-background shadow-sm"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <h2 id={titleId} className="sr-only">
              Command menu
            </h2>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Go to…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search modules"
                aria-controls="command-menu-results"
                autoComplete="off"
              />
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Esc
              </button>
            </div>
            <div id="command-menu-results" role="listbox" aria-label="Modules" className="max-h-72 overflow-y-auto p-1">
              {filtered.length ? (
                filtered.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    role="option"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="focus-ring block min-h-11 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50"
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                <p role="status" className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
