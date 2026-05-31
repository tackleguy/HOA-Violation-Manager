"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "Essential tools for smaller communities.",
    price: 149,
    yearlyPrice: 1490,
    homes: "25–100 homes",
    includes: ["Violation tracking", "Resident directory", "Property records", "Email support"]
  },
  {
    name: "Professional",
    description: "Full operations suite for growing HOAs.",
    price: 349,
    yearlyPrice: 3490,
    homes: "100–500 homes",
    popular: true,
    includes: ["Everything in Starter", "Inspections & reports", "Document versioning", "Priority support"]
  },
  {
    name: "Enterprise",
    description: "Portfolio governance and dedicated support.",
    price: 699,
    yearlyPrice: 6990,
    homes: "500+ homes",
    includes: ["Everything in Professional", "Multi-community rollups", "SSO & permissions", "Custom integrations"]
  }
];

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="section-stack border-t border-border/80 pt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Simple tiers based on community size.</p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn("rounded-md px-3 py-1.5 transition-colors", !yearly ? "bg-muted font-medium text-foreground" : "text-muted-foreground")}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn("rounded-md px-3 py-1.5 transition-colors", yearly ? "bg-muted font-medium text-foreground" : "text-muted-foreground")}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={cn("space-y-6", plan.popular && "md:-mt-1")}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                {plan.popular ? <span className="text-xs text-muted-foreground">Popular</span> : null}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <p className="data-value text-3xl">
                $<NumberFlow value={yearly ? plan.yearlyPrice : plan.price} />
                <span className="ml-1 text-sm font-normal text-muted-foreground">/{yearly ? "yr" : "mo"}</span>
              </p>
              <p className="text-xs text-muted-foreground">{plan.homes}</p>
            </div>
            <Button asChild size="sm" variant={plan.popular ? "default" : "outline"}>
              <Link href="/login">{plan.popular ? "Book demo" : "Start trial"}</Link>
            </Button>
            <ul className="space-y-2 border-t border-border/80 pt-4">
              {plan.includes.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
