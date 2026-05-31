import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ClipboardCheck, FileText, LockKeyhole, Map, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { FeatureComparison } from "@/components/marketing/feature-comparison";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { name: "Violation Management", icon: ShieldCheck },
  { name: "Resident Management", icon: Users },
  { name: "Property Tracking", icon: Map },
  { name: "Inspections", icon: ClipboardCheck },
  { name: "Architectural Reviews", icon: Building2 },
  { name: "Audit Logs", icon: LockKeyhole },
  { name: "Document Storage", icon: FileText }
];

const benefits = ["Save time", "Reduce paperwork", "Improve compliance", "Increase transparency", "Better board collaboration"];

export function LandingPage() {
  return (
    <main>
      <section className="min-h-[92vh] overflow-hidden border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">HF</span>
            HOAFlow
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-24">
          <div className="animate-fade-up">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Enterprise HOA operations
            </Badge>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              HOAFlow
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Replace spreadsheets, PDFs, emails, text messages, paper forms, and aging software with one secure operating system for every HOA workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Launch dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#pricing">View pricing</Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[520px] rounded-xl border bg-card p-3 shadow-soft">
            <div className="grid h-full gap-3 lg:grid-cols-[220px_1fr]">
              <div className="rounded-lg bg-[hsl(240_6%_10%)] p-4 text-white">
                <div className="mb-8 h-7 w-24 rounded bg-white/15" />
                {["Overview", "Residents", "Violations", "Inspections", "Documents"].map((item) => (
                  <div key={item} className="mb-1.5 rounded-md px-3 py-2 text-sm text-white/80">{item}</div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {["428", "37", "92%"].map((value, index) => (
                    <div key={value} className="rounded-lg border bg-background p-3">
                      <div className="data-value text-xl">{value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{["Properties", "Active violations", "Resolution rate"][index]}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-medium">Violation workflow</div>
                    <Badge variant="success">Live</Badge>
                  </div>
                  <div className="space-y-3">
                    {["Evidence uploaded", "Warning sent", "Fine pending", "Resolved"].map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">{index + 1}</div>
                        <div className="h-3 flex-1 rounded bg-muted" />
                        <span className="w-28 text-xs text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border bg-background p-5">
                    <div className="mb-4 text-sm font-medium">Community map</div>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div key={index} className={`aspect-square rounded ${index % 7 === 0 ? "bg-accent" : index % 5 === 0 ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border bg-background p-5">
                    <div className="mb-4 text-sm font-medium">Audit stream</div>
                    <div className="space-y-2">
                      {["Logged inspection", "Uploaded CC&R", "Invited inspector", "Closed violation"].map((item) => (
                        <div key={item} className="rounded bg-muted px-3 py-2 text-xs">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ name, icon: Icon }) => (
            <Card key={name}>
              <CardHeader>
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle>{name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold">Built for every community size.</h2>
            <p className="mt-4 text-muted-foreground">Small HOAs, large master communities, management companies, board members, inspectors, and community managers all work from the same source of truth.</p>
          </div>
          <div className="grid gap-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-md border bg-background p-4">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold">Pricing</h2>
            <p className="mt-3 text-muted-foreground">Flexible tiers for growing HOA operations.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/help/billing">Billing FAQ</Link>
          </Button>
        </div>
        <PricingTable />
        <div className="mt-16">
          <h3 className="mb-6 text-2xl font-semibold">Compare plans</h3>
          <FeatureComparison />
        </div>
      </section>

      <section id="contact" className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold">Talk with our team</h2>
            <p className="mt-4 text-muted-foreground">
              Planning a migration from spreadsheets or legacy HOA software? Tell us about your community and we will recommend the right rollout path.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="outline">
                <Link href="/help/getting-started">Read getting started guide</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/help">Help center</Link>
              </Button>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          {["HOAFlow reduced our board packet prep from days to hours.", "The inspection workflow finally gives us clean evidence and history.", "Residents trust the process because every decision has a record."].map((quote) => (
            <Card key={quote}>
              <CardContent className="pt-5 text-sm text-muted-foreground">“{quote}”</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold">FAQ</h2>
        {["Does HOAFlow support multiple HOAs?", "Can inspectors upload photos?", "Is pricing available today?"].map((question) => (
          <div key={question} className="border-b py-5">
            <h3 className="font-medium">{question}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Yes. The platform is designed for secure multi-tenant operations, mobile workflows, and staged commercial rollout.</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-[hsl(240_6%_10%)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>© 2026 HOAFlow. All rights reserved.</div>
          <div className="flex gap-5 text-secondary-foreground/80">
            <Link href="/help" className="hover:text-secondary-foreground">Help center</Link>
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>Contact: hello@hoaflow.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
