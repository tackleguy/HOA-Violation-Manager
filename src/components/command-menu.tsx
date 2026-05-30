"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring hidden h-10 w-72 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground md:flex"
      >
        <Search className="h-4 w-4" />
        Search modules
        <span className="ml-auto rounded border px-1.5 py-0.5 text-[11px]">⌘K</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-background/80 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-24 max-w-xl overflow-hidden rounded-lg border bg-card shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input className="w-full bg-transparent text-sm outline-none" autoFocus placeholder="Jump to residents, inspections, documents..." />
            </div>
            <div className="p-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted")}
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
