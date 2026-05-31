import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/documents";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <article>
      <header className="border-b border-border/80 pb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{document.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{document.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">Last updated {document.lastUpdated}</p>
      </header>

      <nav aria-label="Table of contents" className="border-b border-border/80 py-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">On this page</p>
        <ol className="mt-3 space-y-2">
          {document.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="divide-y divide-border/80">
        {document.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 py-10">
            <h2 className="text-lg font-medium tracking-tight">{section.title}</h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-border/80 pt-8">
        <p className="text-sm text-muted-foreground">
          {document.slug === "privacy" ? (
            <>
              See also our{" "}
              <Link href="/terms" className="text-foreground hover:underline">
                Terms of Service
              </Link>
              .
            </>
          ) : (
            <>
              See also our{" "}
              <Link href="/privacy" className="text-foreground hover:underline">
                Privacy Policy
              </Link>
              .
            </>
          )}
        </p>
      </footer>
    </article>
  );
}
