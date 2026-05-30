"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getHelpArticlesByCategory } from "@/lib/help/articles";

export function HelpSidebar() {
  const pathname = usePathname();
  const groups = getHelpArticlesByCategory();

  return (
    <aside className="space-y-6">
      <div>
        <Link
          href="/help"
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            pathname === "/help" && "bg-muted text-foreground"
          )}
        >
          Help center
        </Link>
      </div>
      {groups.map(([category, articles]) => (
        <div key={category}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
          <nav className="space-y-1">
            {articles.map((article) => {
              const href = `/help/${article.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={article.slug}
                  href={href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                    active && "bg-primary/10 font-medium text-primary"
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
