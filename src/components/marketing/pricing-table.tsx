import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  homes: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
};

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$149",
    period: "/month",
    description: "Essential tools for smaller communities.",
    homes: "25–100 homes",
    features: ["Violation tracking", "Resident directory", "Property records", "Email support"],
    cta: "Start trial"
  },
  {
    name: "Professional",
    price: "$349",
    period: "/month",
    description: "Full operations suite for growing HOAs.",
    homes: "100–500 homes",
    features: [
      "Everything in Starter",
      "Inspections & reports",
      "Document versioning",
      "Announcements",
      "Priority support"
    ],
    highlighted: true,
    cta: "Book demo"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Portfolio management and advanced governance.",
    homes: "500+ homes & management companies",
    features: [
      "Everything in Professional",
      "Multi-community rollups",
      "SSO & advanced permissions",
      "Dedicated success manager",
      "Custom integrations"
    ],
    cta: "Contact sales"
  }
];

export function PricingTable() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={cn(plan.highlighted && "border-primary shadow-soft ring-1 ring-primary/20")}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{plan.name}</CardTitle>
              {plan.highlighted ? <Badge variant="default">Popular</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-semibold">{plan.price}</span>
              {plan.period ? <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span> : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Designed for {plan.homes}.</p>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant={plan.highlighted ? "default" : "outline"}>
              {plan.cta}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
