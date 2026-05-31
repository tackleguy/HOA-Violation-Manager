"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type ParallaxShowcaseProps = {
  className?: string;
};

export function ParallaxShowcase({ className }: ParallaxShowcaseProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = parallaxRef.current;
    const triggerElement = root?.querySelector("[data-parallax-layers]");
    if (!triggerElement) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    const layers = [
      { layer: "1", yPercent: 24 },
      { layer: "2", yPercent: 16 },
      { layer: "3", yPercent: 8 },
      { layer: "4", yPercent: 0 }
    ];

    layers.forEach((layerObj, idx) => {
      tl.to(
        triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
        { yPercent: layerObj.yPercent, ease: "none" },
        idx === 0 ? undefined : "<"
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((instance) => instance.kill());
      gsap.killTweensOf(triggerElement);
    };
  }, []);

  return (
    <div ref={parallaxRef} className={cn("relative overflow-hidden rounded-2xl border bg-[hsl(240_6%_8%)]", className)}>
      <section className="relative h-[420px] overflow-hidden sm:h-[520px]">
        <div data-parallax-layers className="absolute inset-0">
          <div
            data-parallax-layer="1"
            className="absolute inset-x-[8%] top-[12%] h-[55%] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent"
          />
          <div
            data-parallax-layer="2"
            className="absolute inset-x-[14%] top-[22%] h-[48%] rounded-xl border border-white/10 bg-[hsl(240_6%_12%)] p-4 shadow-soft"
          >
            <div className="grid h-full grid-cols-3 gap-2">
              {["Open", "Overdue", "Resolved"].map((label) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/5 p-2">
                  <p className="text-2xs text-white/50">{label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-white">{label === "Open" ? "37" : label === "Overdue" ? "6" : "128"}</p>
                </div>
              ))}
            </div>
          </div>
          <div data-parallax-layer="3" className="absolute inset-x-0 top-[34%] flex justify-center px-4">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">Operations, unified</h2>
          </div>
          <div
            data-parallax-layer="4"
            className="absolute inset-x-[10%] bottom-[-4%] h-[42%] rounded-t-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(240_6%_8%)] to-transparent" />
      </section>
      <section className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/65">
        Violations, inspections, documents, and board workflows in one calm command center.
      </section>
    </div>
  );
}
