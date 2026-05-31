"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SparklesProps = {
  className?: string;
  density?: number;
  color?: string;
  speed?: number;
  direction?: "top" | "bottom";
};

type Particle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  velocity: number;
};

export function Sparkles({
  className,
  density = 1200,
  color = "#FFFFFF",
  speed = 1,
  direction = "bottom"
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let particles: Particle[] = [];
    const count = Math.min(Math.floor(density / 120), 180);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      particles = Array.from({ length: count }, () => createParticle(canvas.width, canvas.height));
    };

    const createParticle = (width: number, height: number): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.5 + 0.2,
      velocity: Math.random() * 0.6 + 0.2
    });

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.y += (direction === "bottom" ? 1 : -1) * particle.velocity * speed;
        if (particle.y > canvas.height + 4) particle.y = -4;
        if (particle.y < -4) particle.y = canvas.height + 4;

        context.globalAlpha = particle.alpha;
        context.fillStyle = color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [color, density, direction, speed]);

  return <canvas ref={canvasRef} className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden />;
}
