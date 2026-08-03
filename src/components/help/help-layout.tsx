import Link from "next/link";
import { BookOpen, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export type HelpLayoutProps = {
  children: React.ReactNode;
};

export function HelpLayout({ children }: HelpLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background" role="banner">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-md font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground" aria-hidden>
              HF
            </span>
            HOAFlow Help
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        {children}
      </div>
      <footer className="border-t border-border/80" role="contentinfo">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4" aria-hidden />
            HOAFlow documentation
          </span>
          <nav aria-label="Help footer" className="flex flex-wrap items-center gap-4">
            <Link href="/accessibility" className="focus-ring rounded-sm hover:text-foreground">
              Accessibility
            </Link>
            <a href="mailto:hello@hoaflow.com" className="focus-ring inline-flex items-center gap-2 rounded-sm hover:text-foreground">
              <Mail className="h-4 w-4" aria-hidden />
              hello@hoaflow.com
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
