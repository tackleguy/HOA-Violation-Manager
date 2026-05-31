import Link from "next/link";
import { Button } from "@/components/ui/button";

type LegalLayoutProps = {
  children: React.ReactNode;
};

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="focus-ring text-sm font-semibold tracking-tight">
            HOAFlow
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>
      <footer className="border-t border-border/80">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 HOAFlow</div>
          <div className="flex flex-wrap gap-5">
            <Link href="/help" className="hover:text-foreground">
              Help center
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a href="mailto:hello@hoaflow.com" className="hover:text-foreground">
              hello@hoaflow.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
