import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { FeatureComparison } from "@/components/marketing/feature-comparison";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Button } from "@/components/ui/button";

const features = [
  "Violation management",
  "Resident directory",
  "Property tracking",
  "Inspections",
  "Architectural reviews",
  "Audit logs",
  "Document storage"
];

const benefits = ["Save time", "Reduce paperwork", "Improve compliance", "Increase transparency", "Better board collaboration"];

export function LandingPage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="focus-ring text-sm font-semibold tracking-tight">
            HOAFlow
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-16">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            HOA operations, without the noise.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            One system for violations, inspections, residents, and documents — built for boards and managers who need clarity, not clutter.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">
                Launch dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <ul className="grid gap-x-12 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((name) => (
            <li key={name} className="text-sm text-muted-foreground">
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Built for every community size.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Small HOAs, master communities, and management companies work from the same source of truth.
            </p>
          </div>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="text-sm text-foreground">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <PricingSection />
        <div className="mt-16 border-t border-border/80 pt-12">
          <h3 className="mb-6 text-sm font-medium">Compare plans</h3>
          <FeatureComparison />
        </div>
      </section>

      <section id="contact" className="border-y">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Talk with our team</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Planning a migration from spreadsheets or legacy HOA software? Tell us about your community.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/help/getting-started">Getting started</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/help">Help center</Link>
              </Button>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <div className="mt-8 divide-y divide-border/80">
          {["Does HOAFlow support multiple HOAs?", "Can inspectors upload photos?", "Is pricing available today?"].map((question) => (
            <div key={question} className="py-5">
              <h3 className="text-sm font-medium">{question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes. The platform supports secure multi-tenant operations, mobile workflows, and staged commercial rollout.
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© 2026 HOAFlow</div>
          <div className="flex flex-wrap gap-5">
            <Link href="/help" className="hover:text-foreground">
              Help center
            </Link>
            <span>Privacy</span>
            <span>Terms</span>
            <span>hello@hoaflow.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
