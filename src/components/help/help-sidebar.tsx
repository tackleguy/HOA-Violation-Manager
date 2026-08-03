"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getHelpArticlesByCategory } from "@/lib/help/articles";

export function HelpSidebar() {
  const pathname = usePathname();
  const groups = getHelpArticlesByCategory();

  return (
    <aside className="space-y-6" aria-label="Help navigation">
      <div>
        <Link
          href="/help"
          className={cn(
            "focus-ring block min-h-11 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            pathname === "/help" && "bg-muted text-foreground"
          )}
          aria-current={pathname === "/help" ? "page" : undefined}
        >
          Help center
        </Link>
      </div>
      {groups.map(([category, articles]) => (
        <div key={category}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
          <nav aria-label={category} className="space-y-1">
            {articles.map((article) => {
              const href = `/help/${article.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={article.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring block min-h-11 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                    active && "bg-muted font-medium text-foreground"
                  )}
                >
                  {article.title}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
