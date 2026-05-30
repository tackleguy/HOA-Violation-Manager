import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { HelpArticle } from "@/lib/help/articles";

export type HelpArticleViewProps = {
  article: HelpArticle;
};

export function HelpArticleView({ article }: HelpArticleViewProps) {
  return (
    <article className="min-w-0">
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Help", href: "/help" },
          { label: article.category, href: "/help" },
          { label: article.title }
        ]}
      />
      <header className="mb-8 border-b pb-6">
        <p className="text-sm font-medium text-primary">{article.category}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{article.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{article.description}</p>
      </header>
      <div className="space-y-8">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {section.body.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-10 rounded-md border bg-card p-4">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to help center
        </Link>
      </div>
    </article>
  );
}
