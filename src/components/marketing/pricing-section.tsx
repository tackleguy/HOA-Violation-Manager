"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/timeline-animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "Essential tools for smaller communities getting off spreadsheets.",
    price: 149,
    yearlyPrice: 1490,
    homes: "25–100 homes",
    includes: ["Violation tracking", "Resident directory", "Property records", "Email support"]
  },
  {
    name: "Professional",
    description: "Full operations suite for growing HOAs and management teams.",
    price: 349,
    yearlyPrice: 3490,
    homes: "100–500 homes",
    popular: true,
    includes: [
      "Everything in Starter",
      "Inspections & reports",
      "Document versioning",
      "Announcements",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    description: "Portfolio governance, SSO, and dedicated rollout support.",
    price: 699,
    yearlyPrice: 6990,
    homes: "500+ homes",
    includes: [
      "Everything in Professional",
      "Multi-community rollups",
      "SSO & advanced permissions",
      "Dedicated success manager",
      "Custom integrations"
    ]
  }
];

function PricingSwitch({ onSwitch }: { onSwitch: (yearly: boolean) => void }) {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="flex justify-center">
      <div className="relative flex w-fit rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
        {[
          { id: "monthly", label: "Monthly", value: false },
          { id: "yearly", label: "Yearly", value: true }
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setYearly(option.value);
              onSwitch(option.value);
            }}
            className={cn(
              "relative z-10 h-9 rounded-full px-5 text-sm font-medium transition-colors",
              yearly === option.value ? "text-white" : "text-white/60"
            )}
          >
            {yearly === option.value ? (
              <motion.span
                layoutId="pricing-switch"
                className="absolute inset-0 rounded-full border border-white/20 bg-white/10 shadow-subtle"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.12, duration: 0.45 }
    }),
    hidden: {
      filter: "blur(8px)",
      y: 16,
      opacity: 0
    }
  };

  return (
    <div ref={pricingRef} className="relative overflow-hidden rounded-2xl bg-[hsl(240_6%_6%)] px-4 py-16 sm:px-6 lg:px-10">
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:72px_80px]" />
        <SparklesComp density={1400} direction="bottom" speed={0.8} color="#FFFFFF" className="opacity-40" />
      </TimelineContent>

      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 55%)"
        }}
      />

      <article className="relative z-10 mx-auto mb-8 max-w-3xl space-y-4 pt-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.08}
            staggerFrom="first"
            reverse
            containerClassName="justify-center"
            transition={{ type: "spring", stiffness: 250, damping: 40 }}
          >
            Plans built for your community
          </VerticalCutReveal>
        </h2>

        <TimelineContent as="p" animationNum={0} timelineRef={pricingRef} customVariants={revealVariants} className="text-sm text-white/70 sm:text-base">
          Trusted by board members, managers, and inspectors. Choose the tier that matches your portfolio size.
        </TimelineContent>

        <TimelineContent as="div" animationNum={1} timelineRef={pricingRef} customVariants={revealVariants}>
          <PricingSwitch onSwitch={setIsYearly} />
        </TimelineContent>
      </article>

      <div className="relative z-10 mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {plans.map((plan, index) => (
          <TimelineContent key={plan.name} animationNum={2 + index} timelineRef={pricingRef} customVariants={revealVariants}>
            <Card
              className={cn(
                "h-full border-white/10 bg-white/[0.03] text-white backdrop-blur-sm",
                plan.popular && "border-white/25 bg-white/[0.06] shadow-soft ring-1 ring-white/10"
              )}
            >
              <CardHeader className="text-left">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                  {plan.popular ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-2xs font-medium">Popular</span>
                  ) : null}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">
                    $
                    <NumberFlow value={isYearly ? plan.yearlyPrice : plan.price} className="text-3xl font-semibold" />
                  </span>
                  <span className="text-sm text-white/60">/{isYearly ? "year" : "month"}</span>
                </div>
                <p className="mt-2 text-sm text-white/65">{plan.description}</p>
                <p className="mt-1 text-xs text-white/45">Designed for {plan.homes}.</p>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  asChild
                  className={cn("mb-5 w-full", plan.popular ? "bg-white text-black hover:bg-white/90" : "border-white/20 bg-transparent text-white hover:bg-white/10")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/login">{plan.popular ? "Book demo" : "Start trial"}</Link>
                </Button>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/50">Includes</p>
                  <ul className="space-y-2">
                    {plan.includes.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/80" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
