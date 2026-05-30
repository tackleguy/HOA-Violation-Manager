import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { HelpLayout } from "@/components/help/help-layout";
import { HelpSidebar } from "@/components/help/help-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HELP_ARTICLES, getHelpArticlesByCategory } from "@/lib/help/articles";

export default function HelpPage() {
  const groups = getHelpArticlesByCategory();

  return (
    <HelpLayout>
      <HelpSidebar />
      <div className="min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-normal">Help center</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Guides for onboarding, violations, inspections, billing, and day-to-day HOA operations in HOAFlow.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search help articles…" className="pl-9" readOnly aria-label="Search help articles" />
          </div>
        </div>
        <div className="space-y-10">
          {groups.map(([category, articles]) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {articles.map((article) => (
                  <Card key={article.slug}>
                    <CardHeader>
                      <CardTitle className="text-base">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                      <Link
                        href={`/help/${article.slug}`}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Read guide <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          {HELP_ARTICLES.length} articles available · Updated May 2026
        </p>
      </div>
    </HelpLayout>
  );
}
