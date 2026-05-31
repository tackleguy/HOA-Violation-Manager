"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type TimelineContentProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "p" | "section";
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: Variants;
};

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: "easeOut", delay: i * 0.08 }
  })
};

export function TimelineContent({
  children,
  className,
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants
}: TimelineContentProps) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const observeRef = timelineRef ?? fallbackRef;
  const inView = useInView(observeRef, { once: true, amount: 0.15 });
  const variants = customVariants ?? defaultVariants;
  const MotionComponent = as === "p" ? motion.p : as === "section" ? motion.section : motion.div;

  return (
    <MotionComponent
      ref={observeRef as React.RefObject<HTMLDivElement>}
      className={cn(className)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={animationNum}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}

type VerticalCutRevealProps = {
  children: string;
  splitBy?: "words" | "chars";
  staggerDuration?: number;
  staggerFrom?: "first" | "last";
  reverse?: boolean;
  containerClassName?: string;
  transition?: {
    type?: string;
    stiffness?: number;
    damping?: number;
    delay?: number;
  };
};

export function VerticalCutReveal({
  children,
  splitBy = "words",
  staggerDuration = 0.08,
  staggerFrom = "first",
  reverse = false,
  containerClassName,
  transition
}: VerticalCutRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const parts = splitBy === "chars" ? children.split("") : children.split(" ");

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap gap-x-[0.25em]", containerClassName)} aria-label={children}>
      {parts.map((part, index) => {
        const orderIndex = staggerFrom === "last" ? parts.length - 1 - index : index;
        return (
          <motion.span
            key={`${part}-${index}`}
            className="inline-block overflow-hidden"
            initial={{ y: reverse ? "-110%" : "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: reverse ? "-110%" : "110%", opacity: 0 }}
            transition={{
              type: (transition?.type as "spring") ?? "spring",
              stiffness: transition?.stiffness ?? 260,
              damping: transition?.damping ?? 28,
              delay: (transition?.delay ?? 0) + orderIndex * staggerDuration
            }}
          >
            <span className="inline-block">
              {part}
              {splitBy === "words" && index < parts.length - 1 ? "\u00A0" : ""}
            </span>
          </motion.span>
        );
      })}
    </span>
  );
}
