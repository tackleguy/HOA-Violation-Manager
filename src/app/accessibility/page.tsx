import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Accessibility Statement | HOAFlow",
  description: "How HOAFlow works to meet digital accessibility requirements under the ADA and WCAG 2.1 Level AA."
};

export default function AccessibilityPage() {
  return (
    <LegalLayout>
      <article>
        <header className="border-b border-border/80 pb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Accessibility statement</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            HOAFlow is committed to making our website and application usable by people with disabilities, consistent with
            the Americans with Disabilities Act (ADA) and widely accepted digital standards.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Last updated August 3, 2026</p>
        </header>

        <div className="divide-y divide-border/80">
          <section className="py-10">
            <h2 className="text-lg font-medium tracking-tight">Our approach</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              The{" "}
              <a
                href="https://www.ada.gov/law-and-regs/design-standards/"
                className="text-foreground underline underline-offset-2 hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ADA Standards for Accessible Design
              </a>{" "}
              primarily address physical buildings and facilities. For websites and software, HOAFlow targets{" "}
              <strong className="font-medium text-foreground">WCAG 2.1 Level AA</strong>, which is the benchmark commonly
              used for digital accessibility under ADA Title II and Title III.
            </p>
          </section>

          <section className="py-10">
            <h2 className="text-lg font-medium tracking-tight">Measures we take</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
              <li>Semantic HTML, page landmarks, and clear heading structure</li>
              <li>Keyboard access for primary navigation, forms, dialogs, and tables</li>
              <li>Visible focus indicators and skip-to-content links</li>
              <li>Sufficient color contrast for text and interactive controls</li>
              <li>Form labels, error messaging announced to assistive technologies</li>
              <li>Status information conveyed with text, not color alone</li>
              <li>Respect for reduced-motion preferences where animations are used</li>
            </ul>
          </section>

          <section className="py-10">
            <h2 className="text-lg font-medium tracking-tight">Compatibility</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              HOAFlow is designed to work with current major browsers and common assistive technologies, including screen
              readers such as VoiceOver, NVDA, and JAWS, when used with an up-to-date browser.
            </p>
          </section>

          <section className="py-10">
            <h2 className="text-lg font-medium tracking-tight">Known limitations</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Some chart visualizations and dense data tables may be harder to navigate with assistive technology. Where
              charts are shown, we also provide equivalent text or tabular summaries when available. We continue to improve
              these experiences.
            </p>
          </section>

          <section className="py-10">
            <h2 className="text-lg font-medium tracking-tight">Feedback</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              If you encounter an accessibility barrier, contact us at{" "}
              <a href="mailto:accessibility@hoaflow.com" className="text-foreground underline underline-offset-2 hover:no-underline">
                accessibility@hoaflow.com
              </a>{" "}
              or{" "}
              <a href="mailto:hello@hoaflow.com" className="text-foreground underline underline-offset-2 hover:no-underline">
                hello@hoaflow.com
              </a>
              . Please include the page URL and a description of the issue. We aim to respond within two business days.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Related:{" "}
              <Link href="/help" className="text-foreground underline underline-offset-2 hover:no-underline">
                Help center
              </Link>
              ,{" "}
              <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:no-underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/terms" className="text-foreground underline underline-offset-2 hover:no-underline">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </LegalLayout>
  );
}
