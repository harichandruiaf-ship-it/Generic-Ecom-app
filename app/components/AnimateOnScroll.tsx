"use client";

import { useEffect, useRef, useState } from "react";

type AnimationType = "fade-in" | "slide-up" | "slide-up-small" | "scale-in";

export function AnimateOnScroll({
  children,
  animation = "slide-up",
  className = "",
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  animation?: AnimationType;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeoutId = setTimeout(() => setInView(true), delay);
            } else {
              setInView(true);
            }
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, once]);

  const animClass =
    animation === "fade-in"
      ? "animate-fade-in"
      : animation === "slide-up"
        ? "animate-slide-up"
        : animation === "slide-up-small"
          ? "animate-slide-up-small"
          : "animate-scale-in";

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${inView ? `animate-in-view ${animClass}` : ""} ${className}`}
      style={delay > 0 && inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
